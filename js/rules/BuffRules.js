/**
 * @module    BuffRules
 * @summary   Domain rules logic for D&D 3.5e buffs stacking, scaling value resolution, and round duration tracking.
 * @exports   resolveSpellEffectValue, calculateDurationRounds, checkBuffConflict, translateTarget, translateType
 */
import { CLASS_BUFFS } from '../data/class-buffs-data.js';
import { CombatSpells } from '../spells.js';

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
