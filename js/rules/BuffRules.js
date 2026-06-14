/**
 * @module    BuffRules
 * @summary   Domain rules logic for D&D 3.5e buffs stacking, scaling value resolution, and round duration tracking.
 * @exports   resolveSpellEffectValue, calculateDurationRounds, checkBuffConflict, translateTarget, translateType
 */
import { CLASS_BUFFS } from '../data/class-buffs-data.js';
import { CombatSpells, findSpell } from '../spells.js';
import { CombatState } from '../state.js';


export function translateTarget(target) {
  const mapping = {
    str: 'Stärke (STR)',
    dex: 'Geschick (DEX)',
    con: 'Konstitution (CON)',
    int: 'Intelligenz (INT)',
    wis: 'Weisheit (WIS)',
    cha: 'Charisma (CHA)',
    za: 'Zähigkeit (Fort)',
    ref: 'Reflex (Ref)',
    wil: 'Willen (Will)',
    baseZa: 'Zähigkeit (Fort)',
    baseRef: 'Reflex (Ref)',
    baseWil: 'Willen (Will)',
    ac: 'Rüstungsklasse (AC)',
    acArmor: 'Rüstungs-RK (Armor)',
    acShield: 'Schild-RK (Shield)',
    acNatural: 'Natürliche Rüstung',
    acDeflection: 'Ablenkung (Deflection)',
    acDodge: 'Ausweich-RK (Dodge)',
    atk: 'Angriffswurf (ATK)',
    dmg: 'Schadenswurf (DMG)'
  };
  return mapping[target] || target;
}

export function translateType(type) {
  const mapping = {
    morale: 'Moral',
    luck: 'Glück',
    dodge: 'Ausweichen',
    enhancement: 'Verbesserung',
    insight: 'Einsicht',
    sacred: 'Heilig',
    profane: 'Unheilig',
    armor: 'Rüstung',
    shield: 'Schild',
    natural: 'Natürlich',
    untyped: 'Ohne Typ'
  };
  return mapping[type] || type;
}

export function resolveSpellEffectValue(formula, casterLevel, defaultValue) {
  if (!formula) return defaultValue;
  const cl = parseInt(casterLevel) || 1;
  switch (formula) {
    case 'shield_of_faith':
      return Math.min(5, 2 + Math.floor(cl / 6));
    case 'barkskin':
      return Math.min(5, 1 + Math.floor(cl / 3));
    case 'divine_favor':
      return Math.max(1, Math.min(3, Math.floor(cl / 3)));
    case 'righteous_might_na':
      return Math.min(5, 2 + Math.floor((cl - 9) / 3));
    case 'magic_vestment':
    case 'magic_weapon_greater':
      return Math.min(5, Math.floor(cl / 4));
    default:
      return defaultValue;
  }
}

export function calculateDurationRounds(durationStr, casterLevel) {
  if (!durationStr) return null;
  const s = durationStr.toLowerCase().trim();
  const cl = parseInt(casterLevel) || 1;

  if (s.includes('round/level') || s.includes('runde/stufe')) {
    return cl;
  }
  if (s.includes('10 min./level') || s.includes('10 min./stufe')) {
    return cl * 100;
  }
  if (s.includes('min./level') || s.includes('min./stufe') || s.includes('minute/level') || s.includes('minute/stufe')) {
    return cl * 10;
  }
  if (s.includes('hour/level') || s.includes('std./stufe') || s.includes('stunde/stufe')) {
    return null;
  }
  if (s === '1 minute' || s === '1 min.') {
    return 10;
  }
  if (s === '5 runden' || s === '5 rounds' || s.includes('5 runden') || s.includes('5 rounds')) {
    return 5;
  }
  
  const roundMatch = s.match(/^(\d+)\s+(round|runde)/);
  if (roundMatch) {
    return parseInt(roundMatch[1]);
  }
  
  return null;
}

export function checkBuffConflict(pc, spellKey, customEffects = null) {
  let newEffects = [];
  let buffName = '';

  if (spellKey) {
    const classBuff = CLASS_BUFFS.find(b => b.key === spellKey);
    if (classBuff) {
      newEffects = classBuff.effects || [];
      buffName = classBuff.name;
    } else {
      const spell = CombatSpells.REGISTRY?.[spellKey];
      if (!spell) return { status: 'ok' };
      newEffects = spell.effects || [];
      buffName = spell.nameDe || spell.nameEn || spellKey;
    }
  } else if (customEffects) {
    newEffects = customEffects;
    buffName = customEffects[0]?.source || 'Eigener Buff';
  }

  if (newEffects.length === 0) return { status: 'ok' };

  let status = 'ok';
  let conflictingBuffName = '';
  let activeValue = 0;
  let newValue = 0;
  let targetLabel = '';

  for (const newEff of newEffects) {
    if (newEff.type === 'dodge' || newEff.type === 'untyped') continue;
    
    let val = parseInt(newEff.value) || 0;
    let cl = 1;
    if (Array.isArray(pc.classes)) {
      pc.classes.forEach(c => {
        if (['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'bard'].includes(c.classType)) {
          if (c.level > cl) cl = c.level;
        }
      });
    }
    if (newEff.valueFormula) {
      val = resolveSpellEffectValue(newEff.valueFormula, cl, val);
    }

    if (!Array.isArray(pc.activeBuffs)) continue;

    for (const activeBuff of pc.activeBuffs) {
      let activeEffects = [];
      let activeName = activeBuff.name;
      if (activeBuff.spellKey) {
        const classBuff = CLASS_BUFFS.find(b => b.key === activeBuff.spellKey);
        if (classBuff) {
          activeEffects = classBuff.effects || [];
          activeName = classBuff.name;
        } else {
          const actSpell = CombatSpells.REGISTRY?.[activeBuff.spellKey];
          if (actSpell) {
            activeEffects = activeBuff.effects || actSpell.effects || [];
            activeName = actSpell.nameDe || actSpell.nameEn || activeBuff.spellKey;
          }
        }
      } else {
        activeEffects = activeBuff.effects || [];
      }

      for (const activeEff of activeEffects) {
        if (newEff.target === activeEff.target && newEff.type === activeEff.type) {
          const actVal = parseInt(activeEff.value) || 0;
          if (actVal >= val) {
            if (status !== 'overrides') {
              status = 'suppressed';
              conflictingBuffName = activeName;
              activeValue = actVal;
              newValue = val;
              targetLabel = translateTarget(newEff.target);
            }
          } else {
            status = 'overrides';
            conflictingBuffName = activeName;
            activeValue = actVal;
            newValue = val;
            targetLabel = translateTarget(newEff.target);
          }
        }
      }
    }
  }

  return { status, conflictingBuffName, activeValue, newValue, targetLabel, buffName };
}

export function isBuffEligible(pc, key, isClass) {
  if (isClass) {
    const classBuff = CLASS_BUFFS.find(b => b.key === key);
    if (!classBuff) return false;
    if (!classBuff.classRequirements || classBuff.classRequirements.length === 0) return true;
    if (!Array.isArray(pc.classes)) return false;
    return classBuff.classRequirements.every(req => {
      const pcCls = pc.classes.find(c => c.classType === req.classType);
      return pcCls && pcCls.level >= req.level;
    });
  } else {
    return true;
  }
}

export function isBuffSuppressed(pc, buff) {
  if (!buff || !Array.isArray(pc.activeBuffs) || !Array.isArray(buff.effects) || buff.effects.length === 0) {
    return false;
  }

  let nonStackingEffectsCount = 0;
  let suppressedEffectsCount = 0;

  for (const eff of buff.effects) {
    if (eff.type === 'dodge' || eff.type === 'untyped') {
      continue;
    }

    nonStackingEffectsCount++;
    const val = parseInt(eff.value) || 0;

    const isEffectSuppressed = pc.activeBuffs.some(other => {
      if (other.id === buff.id) return false;
      
      const otherEffects = other.effects || [];
      return otherEffects.some(otherEff => {
        if (otherEff.target === eff.target && otherEff.type === eff.type) {
          const otherVal = parseInt(otherEff.value) || 0;
          if (otherVal > val) return true;
          if (otherVal === val) {
            return other.id < buff.id;
          }
        }
        return false;
      });
    });

    if (isEffectSuppressed) {
      suppressedEffectsCount++;
    }
  }

  return nonStackingEffectsCount > 0 && suppressedEffectsCount === nonStackingEffectsCount;
}

export function activateBuffByKey(pc, key, isClass, dialogs = {}) {
  const {
    showCustomConfirm = (title, msg, onConfirm) => onConfirm(),
    showCustomAlert = () => {},
    showCustomPrompt = (title, msg, def, onConfirm) => onConfirm(def),
    renderPlayerScreen = () => {}
  } = dialogs;

  let hasScaling = false;
  let durationFormula = '';
  let effects = [];
  let buffName = '';
  
  if (isClass) {
    const classBuff = CLASS_BUFFS.find(b => b.key === key);
    if (classBuff) {
      effects = classBuff.effects || [];
      buffName = classBuff.name;
      durationFormula = classBuff.duration || '';
    }
  } else {
    const spell = CombatSpells.REGISTRY?.[key];
    if (spell) {
      effects = spell.effects || [];
      buffName = spell.nameDe || spell.nameEn || key;
      durationFormula = spell.duration || '';
      hasScaling = effects.some(eff => !!eff.valueFormula);
    }
  }
  
  const isRoundBased = durationFormula && (
    durationFormula.toLowerCase().includes('level') || 
    durationFormula.toLowerCase().includes('stufe')
  );

  const performActivation = (casterLevel, shouldDeduct) => {
    const resolvedEffects = effects.map(eff => {
      let val = parseInt(eff.value) || 0;
      if (eff.valueFormula) {
        val = resolveSpellEffectValue(eff.valueFormula, casterLevel, val);
      }
      return {
        target: eff.target,
        value: val,
        type: eff.type,
        source: eff.source || buffName
      };
    });

    const rounds = calculateDurationRounds(durationFormula, casterLevel);

    const activate = () => {
      CombatState.updatePCBatch(freshPc => {
        if (shouldDeduct && !isClass) {
          const spellData = findSpell(freshPc, key);
          if (spellData) {
            const prep = freshPc.preparedSpells?.find(s => s.spellKey === key && !s.isUsed);
            if (prep) {
              freshPc.castPreparedSpell(prep.id);
            } else {
              freshPc.castSpontaneousSpell(key, spellData.level);
            }
          }
        }

        if (!Array.isArray(freshPc.activeBuffs)) freshPc.activeBuffs = [];
        freshPc.activeBuffs = freshPc.activeBuffs.filter(b => b.spellKey !== key);
        
        freshPc.activeBuffs.push({
          id: 'spell_' + key + '_' + Date.now(),
          spellKey: key,
          name: buffName,
          durationFormula: durationFormula,
          casterLevel: casterLevel,
          durationMaxRounds: rounds,
          durationRemainingRounds: rounds,
          effects: resolvedEffects
        });
      });

      if (shouldDeduct && !isClass) {
        const wasPrep = pc.preparedSpells?.some(s => s.spellKey === key && !s.isUsed);
        const spellData = findSpell(pc, key);
        const lvl = spellData ? spellData.level : 0;
        const msg = wasPrep
          ? `Vorbereiteter Zauberplatz für <strong>${buffName}</strong> wurde abgezogen.`
          : `Spontaner Zauberplatz des Grades <strong>${lvl}</strong> für <strong>${buffName}</strong> wurde abgezogen.`;
        showCustomAlert("Zauberplatz verbraucht ✨", msg);
      }

      renderPlayerScreen();
    };

    const conflict = checkBuffConflict(pc, key, resolvedEffects);
    if (conflict.status === 'suppressed') {
      showCustomConfirm(
        "Stacking-Konflikt", 
        `Ein stärkerer oder gleichwertiger Buff (<strong>${conflict.conflictingBuffName}</strong>) ist bereits aktiv.<br><br>Dein neuer Buff <strong>${conflict.buffName}</strong> (+${conflict.newValue} auf ${conflict.targetLabel}) hat denselben Bonus-Typ und würde daher <strong>keine Wirkung</strong> zeigen (Numerischer Unterschied: ${conflict.newValue - conflict.activeValue}).<br><br>Möchtest du den Buff dennoch aktivieren?`,
        () => {
          activate();
        }
      );
    } else if (conflict.status === 'overrides') {
      activate();
      showCustomAlert(
        "Buff überlagert", 
        `Durch das Aktivieren von <strong>${conflict.buffName}</strong> (+${conflict.newValue}) wird der schwächere aktive Buff <strong>${conflict.conflictingBuffName}</strong> (+${conflict.activeValue}) auf <strong>${conflict.targetLabel}</strong> überlagert.<br><br>Deine Werte erhöhen sich netto um <strong>+${conflict.newValue - conflict.activeValue}</strong>.`,
        "Verstanden", 
        "✨"
      );
    } else {
      activate();
    }
  };

  const continueActivation = (shouldDeduct) => {
    if (hasScaling || isRoundBased) {
      let defaultCL = 1;
      if (Array.isArray(pc.classes)) {
        pc.classes.forEach(c => {
          if (['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'bard'].includes(c.classType)) {
            if (c.level > defaultCL) defaultCL = c.level;
          }
        });
      }
      showCustomPrompt(
        "Zauberstufe", 
        `Bitte gib die Zauberstufe (Caster Level) für <strong>${buffName}</strong> ein:`, 
        String(defaultCL), 
        (clText) => {
          const cl = parseInt(clText) || 1;
          performActivation(cl, shouldDeduct);
        }
      );
    } else {
      performActivation(1, shouldDeduct);
    }
  };

  // Determine if spell slots should be deducted
  if (!isClass) {
    const spellData = findSpell(pc, key);
    const hasCasterClass = Array.isArray(pc.classes) && pc.classes.some(c => 
      ['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'bard'].includes(c.classType)
    );
    const needsSlot = spellData && hasCasterClass;

    if (needsSlot) {
      const hasPrep = Array.isArray(pc.preparedSpells) && pc.preparedSpells.some(s => s.spellKey === key && !s.isUsed);
      const isSpellKnown = Array.isArray(pc.learnedSpells) && pc.learnedSpells.includes(key);
      const spellLevel = spellData.level;
      const isSpontaneousCaster = pc.classes?.some(c => ['sorcerer', 'bard'].includes(c.classType));
      const hasSponSlot = isSpontaneousCaster && isSpellKnown && pc.spellSlots?.[spellLevel] && (pc.spellSlots[spellLevel].max - pc.spellSlots[spellLevel].used) > 0;

      const slotAvailable = hasPrep || hasSponSlot;

      if (!slotAvailable) {
        showCustomConfirm(
          "Keine freien Zauberplätze",
          `Du hast keinen freien Zauberplatz für <strong>${buffName}</strong> übrig (weder vorbereitet noch freie spontane Slots).<br><br>Möchtest du den Buff trotzdem aktivieren?`,
          () => {
            continueActivation(false);
          }
        );
      } else {
        showCustomConfirm(
          "Zauber wirken?", 
          `Möchtest du einen Zauberslot verwenden, um <strong>${buffName}</strong> zu wirken?`, 
          () => {
            continueActivation(true);
          },
          () => {
            continueActivation(false);
          }
        );
      }
    } else {
      continueActivation(false);
    }
  } else {
    continueActivation(false);
  }
}

