/**
 * @module    PCBuffsTab
 * @summary   Renders the Buffs & Auras manager UI tab, including active list, search, custom builder, and quick toggles.
 * @exports   renderPCBuffsTab(pc), bindPCBuffsEvents(pc, defenses), activateBuffByKey(pc, key, isClass)
 */
import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { showCustomConfirm, showCustomAlert, showCustomPrompt } from '../dialogs.js';
import { CombatSpells } from '../../../spells.js';
import { CLASS_BUFFS } from '../../../data/class-buffs-data.js';
import {
  translateTarget,
  translateType,
  resolveSpellEffectValue,
  calculateDurationRounds,
  checkBuffConflict
} from '../../../rules/BuffRules.js';
import { showBuffDetailsDialog } from './PCBuffsDialog.js';
import { findSpell } from './PCSpellbookTab.js';

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
    return Array.isArray(pc.learnedSpells) && pc.learnedSpells.includes(key);
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

export function activateBuffByKey(pc, key, isClass) {
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

      uiRegistry.renderPlayerScreen();
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
        "z. B. 5", 
        (clText) => {
          const cl = parseInt(clText) || 1;
          performActivation(cl, shouldDeduct);
        }, 
        defaultCL.toString()
      );
    } else {
      performActivation(1, shouldDeduct);
    }
  };

  // Check spell slot availability if caster
  const spellData = !isClass ? findSpell(pc, key) : null;
  const hasCasterClass = Array.isArray(pc.classes) && pc.classes.some(c => 
    ['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'bard'].includes(c.classType)
  );
  const needsSlot = !isClass && spellData && hasCasterClass;

  if (needsSlot) {
    const hasPrep = Array.isArray(pc.preparedSpells) && pc.preparedSpells.some(s => s.spellKey === key && !s.isUsed);
    const hasSponClass = Array.isArray(pc.classes) && pc.classes.some(c => ['sorcerer', 'bard'].includes(c.classType));
    const isLearned = Array.isArray(pc.learnedSpells) && pc.learnedSpells.includes(key);
    const lvl = spellData.level;
    const hasSponSlot = hasSponClass && isLearned && pc.spellSlots?.[lvl] && (pc.spellSlots[lvl].used || 0) < (pc.spellSlots[lvl].max || 0);

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
      continueActivation(true);
    }
  } else {
    continueActivation(false);
  }
}

export function renderPCBuffsTab(pc) {
  let activeBuffsHtml = '';
  if (!Array.isArray(pc.activeBuffs) || pc.activeBuffs.length === 0) {
    activeBuffsHtml = `
      <div style="font-style: italic; color: var(--inkl); font-size: 8.5px; text-align: center; padding: 10px 0; background:rgba(0,0,0,0.02); border:0.5px dashed var(--pb); border-radius:2px;">
        Keine aktiven Buffs oder Auren.
      </div>
    `;
  } else {
    activeBuffsHtml = pc.activeBuffs.map((buff, idx) => {
      let displayName = buff.name;
      let effectsList = [];

      if (buff.spellKey) {
        const classBuff = CLASS_BUFFS.find(b => b.key === buff.spellKey);
        if (classBuff) {
          displayName = classBuff.name;
          effectsList = classBuff.effects || [];
        } else {
          const spell = CombatSpells.REGISTRY?.[buff.spellKey];
          if (spell) {
            displayName = spell.nameDe || spell.nameEn || displayName || buff.spellKey;
            effectsList = buff.effects || spell.effects || [];
          }
        }
      } else if (Array.isArray(buff.effects)) {
        effectsList = buff.effects;
      }

      const shortEffectsSummary = effectsList.map(eff => {
        const sign = eff.value >= 0 ? '+' : '';
        const targetShort = {
          atk: 'ATK',
          dmg: 'DMG',
          ac: 'RK',
          acArmor: 'RK',
          acShield: 'RK',
          acNatural: 'RK',
          acDeflection: 'RK',
          acDodge: 'RK',
          str: 'STR',
          dex: 'DEX',
          con: 'CON',
          int: 'INT',
          wis: 'WIS',
          cha: 'CHA',
          za: 'Fort',
          ref: 'Ref',
          wil: 'Will',
          baseZa: 'Fort',
          baseRef: 'Ref',
          baseWil: 'Will'
        }[eff.target] || eff.target;
        return `${sign}${eff.value} ${targetShort}`;
      }).join(', ');

      const roundsHtml = (buff.durationRemainingRounds !== undefined && buff.durationRemainingRounds !== null)
        ? `<input type="number" class="buff-rounds-input" data-index="${idx}" value="${buff.durationRemainingRounds}" min="0" style="
            width:22px;
            height:11px;
            font-size:7px;
            text-align:center;
            border:0.5px solid var(--pb);
            border-radius:2px;
            background:rgba(0,0,0,0.03);
            color:var(--red);
            font-weight:bold;
            padding:0;
            margin:0 2px 0 4px;
          " title="Verbleibende Runden (0 zum Entfernen)">
          <span style="font-size:7px; color:var(--inkl); margin-right:2px;">Rd.</span>`
        : '';

      const isSuppressed = isBuffSuppressed(pc, buff);
      const pillStyle = isSuppressed
        ? 'background:rgba(200, 169, 110, 0.02); border:0.5px dashed rgba(139, 26, 26, 0.45); opacity:0.65; filter:grayscale(30%);'
        : 'background:rgba(200, 169, 110, 0.05); border:0.5px solid var(--pb);';
      const warningBadge = isSuppressed ? ' <span style="color:var(--red); font-weight:bold; font-size:7.5px;" title="Unterdrückt durch einen stärkeren aktiven Buff">⚠️</span>' : '';

      return `
        <div class="active-buff-pill" style="
          display:inline-flex;
          align-items:center;
          ${pillStyle}
          border-radius:12px;
          padding:2px 6px;
          gap:4px;
          box-sizing:border-box;
          margin-bottom:2px;
        ">
          <span class="info-buff-trigger" data-index="${idx}" style="
            font-size:8px;
            font-family:'Crimson Text', serif;
            font-weight:bold;
            color:var(--red);
            cursor:pointer;
            display:inline-flex;
            align-items:center;
            gap:2px;
          " title="D&D 3.5e RAW Regelerklärung anzeigen">
            ✨ ${displayName}${warningBadge}
            <span style="font-size:7px; color:var(--inkl); opacity:0.85; font-weight:normal;">(${shortEffectsSummary})</span>
            <span style="font-size:7.5px; opacity:0.75; margin-left:1px; color:var(--red);">📖</span>
          </span>
          ${roundsHtml}
          <button class="delete-buff-btn" data-index="${idx}" style="
            background:transparent;
            border:none;
            color:var(--inkl);
            font-size:8px;
            cursor:pointer;
            padding:0 2px;
            line-height:1;
            display:inline-flex;
            align-items:center;
            transition:color 0.15s ease;
          " title="Buff entfernen" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--inkl)'">✕</button>
        </div>
      `;
    }).join('');
  }

  const quickBuffs = Array.isArray(pc.quickBuffs) ? pc.quickBuffs : [];
  let quickToggleHtml = '';

  if (quickBuffs.length === 0) {
    quickToggleHtml = `
      <div style="grid-column: span 2; font-style: italic; color: var(--inkl); font-size: 8px; text-align: center; padding: 12px 0; background:rgba(0,0,0,0.01); border:0.5px dashed var(--pb); border-radius:2px;">
        Keine Schnellzugriffe definiert. Nutze die Suche, um Buffs hinzuzufügen.
      </div>
    `;
  } else {
    quickToggleHtml = quickBuffs.map(qb => {
      const isActive = Array.isArray(pc.activeBuffs) && pc.activeBuffs.some(b => b.spellKey === qb.key);
      const activeInstance = isActive ? pc.activeBuffs.find(b => b.spellKey === qb.key) : null;
      const isSuppressed = isActive 
        ? isBuffSuppressed(pc, activeInstance) 
        : (checkBuffConflict(pc, qb.key).status === 'suppressed');
      
      const btnStyle = isActive
        ? (isSuppressed
          ? `background: rgba(139, 26, 26, 0.15); color: rgba(139, 26, 26, 0.6); border-color: rgba(139, 26, 26, 0.45); opacity: 0.7; filter: grayscale(40%); font-weight: bold;`
          : `background: #8b1a1a; color: #f4e8c1; border-color: #8b1a1a; font-weight: bold;`)
        : (isSuppressed 
          ? `background: rgba(200, 169, 110, 0.03); color: rgba(20, 15, 5, 0.4); border-color: rgba(200, 169, 110, 0.3); opacity: 0.5; filter: grayscale(60%);`
          : `background: rgba(200, 169, 110, 0.08); color: var(--ink); border-color: var(--pb);`);
      
      const checkmark = isActive ? '✓ ' : '';
      const warningBadge = isSuppressed ? ' ⚠️' : '';
      return `
        <div style="position:relative; display:block; width:100%;">
          <button class="quick-buff-btn" data-key="${qb.key}" data-isclass="${qb.isClass}" data-name="${qb.name}" style="
            width: 100%;
            font-family: 'IM Fell English SC', serif;
            font-size: 8px;
            padding: 3px 14px 3px 3px;
            cursor: pointer;
            border: 1px solid;
            border-radius: 2px;
            transition: all 0.15s ease;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            box-sizing: border-box;
            ${btnStyle}
          " title="${qb.name}${isSuppressed ? ' (Unterdrückt durch einen stärkeren aktiven Buff)' : ''}">${checkmark}${qb.name}${warningBadge}</button>
          <span class="remove-quick-buff-btn" data-key="${qb.key}" style="
            position: absolute;
            right: 4px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: inherit;
            opacity: 0.55;
            font-size: 9px;
            font-weight: bold;
            z-index: 10;
            padding: 2px;
            line-height: 1;
            transition: opacity 0.15s;
          " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.55'" title="Aus Schnellauswahl entfernen">✕</span>
        </div>
      `;
    }).join('');
  }

  return `
    <div style="display:flex; flex-direction:column; gap:8px;">
      <!-- List of active buffs -->
      <div style="display:flex; flex-direction:column; gap:3px;">
        <div style="font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--red); font-weight:bold; letter-spacing:0.5px; padding-bottom:1px; border-bottom:0.5px solid rgba(200,169,110,0.2);">
          Aktive Buffs &amp; Auren
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:4px; max-height:120px; overflow-y:auto; padding-right:2px; box-sizing:border-box;">
          ${activeBuffsHtml}
        </div>
      </div>

      <!-- Quick Toggles -->
      <div style="display:flex; flex-direction:column; gap:3px;">
        <div style="font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--red); font-weight:bold; letter-spacing:0.5px; padding-bottom:1px; border-bottom:0.5px solid rgba(200,169,110,0.2);">
          Schnellauswahl
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:3px;">
          ${quickToggleHtml}
        </div>
      </div>

      <!-- Autocomplete Buff Search -->
      <div style="display:flex; flex-direction:column; gap:2px; position:relative;">
        <div style="font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--red); font-weight:bold; letter-spacing:0.5px; padding-bottom:1px; border-bottom:0.5px solid rgba(200,169,110,0.2);">
          🔍 Buff / Aura aus Regelwerk suchen
        </div>
        <input type="text" id="buff-search-input" placeholder="Name eingeben (z. B. Heldenmut, Kampfrausch)..." class="cinput" style="height:15px; font-size:8px; padding:0 3px; box-sizing:border-box;" autocomplete="off">
        
        <div id="buff-search-results" style="
          display:none;
          position:absolute;
          top:30px;
          left:0;
          right:0;
          background:var(--p);
          border:1px solid var(--pb);
          border-radius:2px;
          box-shadow:0 4px 10px rgba(0,0,0,0.25);
          max-height:150px;
          overflow-y:auto;
          z-index:2000;
          padding:2px;
        "></div>
      </div>

      <!-- Custom Buff Builder -->
      <div style="display:flex; flex-direction:column; gap:4px; border-top:0.5px dashed rgba(200,169,110,0.3); padding-top:6px;">
        <div style="font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--red); font-weight:bold; letter-spacing:0.5px;">
          Eigenen Buff / Aura erstellen
        </div>
        
        <div style="display:grid; grid-template-columns: 1.2fr 1.2fr 0.6fr; gap:3px; align-items:end;">
          <div style="display:flex; flex-direction:column; gap:1px; text-align:left;">
            <label style="font-size:7.5px; font-weight:bold; color:var(--inkl); font-family:'Crimson Text',serif; line-height:1;">Name</label>
            <input type="text" id="custom-buff-name" placeholder="z. B. Lied" class="cinput" style="height:15px; font-size:8px; padding:0 3px; box-sizing:border-box;">
          </div>
          <div style="display:flex; flex-direction:column; gap:1px; text-align:left;">
            <label style="font-size:7.5px; font-weight:bold; color:var(--inkl); font-family:'Crimson Text',serif; line-height:1;">Zielwert</label>
            <select id="custom-buff-target" class="cinput" style="height:15px; font-size:8px; padding:0; box-sizing:border-box;">
              <option value="atk">Angriffswurf (ATK)</option>
              <option value="dmg">Schadenswurf (DMG)</option>
              <option value="ac">Rüstungsklasse (AC)</option>
              <option value="acDodge">Ausweich-RK (Dodge)</option>
              <option value="acDeflection">Ablenkung (Deflection)</option>
              <option value="acShield">Schild-RK (Shield)</option>
              <option value="acArmor">Rüstungs-RK (Armor)</option>
              <option value="acNatural">Natürliche Rüstung</option>
              <option value="str">Stärke (STR)</option>
              <option value="dex">Geschick (DEX)</option>
              <option value="con">Konstitution (CON)</option>
              <option value="int">Intelligenz (INT)</option>
              <option value="wis">Weisheit (WIS)</option>
              <option value="cha">Charisma (CHA)</option>
              <option value="za">Zähigkeit (Fort)</option>
              <option value="ref">Reflex (Ref)</option>
              <option value="wil">Willen (Will)</option>
            </select>
          </div>
          <div style="display:flex; flex-direction:column; gap:1px; text-align:left;">
            <label style="font-size:7.5px; font-weight:bold; color:var(--inkl); font-family:'Crimson Text',serif; line-height:1;">Wert</label>
            <input type="number" id="custom-buff-value" value="1" class="cinput" style="height:15px; font-size:8px; text-align:center; padding:0; box-sizing:border-box;">
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:3px; align-items:end; margin-top:2px;">
          <div style="display:flex; flex-direction:column; gap:1px; text-align:left;">
            <label style="font-size:7.5px; font-weight:bold; color:var(--inkl); font-family:'Crimson Text',serif; line-height:1;">Bonustyp</label>
            <select id="custom-buff-type" class="cinput" style="height:15px; font-size:8px; padding:0; box-sizing:border-box;">
              <option value="untyped">Ohne Typ (Untyped)</option>
              <option value="morale">Moral (Morale)</option>
              <option value="luck">Glück (Luck)</option>
              <option value="dodge">Ausweichen (Dodge)</option>
              <option value="enhancement">Verbesserung (Enhancement)</option>
              <option value="deflection">Ablenkung (Deflection)</option>
              <option value="armor">Rüstung (Armor)</option>
              <option value="shield">Schild (Shield)</option>
              <option value="natural">Natürlich (Natural)</option>
              <option value="insight">Einsicht (Insight)</option>
              <option value="sacred">Heilig (Sacred)</option>
              <option value="profane">Unheilig (Profane)</option>
            </select>
          </div>
          <button id="add-custom-buff-btn" class="btn btn-p" style="
            font-family: 'IM Fell English SC', serif;
            font-size: 8px;
            padding: 2px 4px;
            height: 15px;
            cursor: pointer;
            box-sizing: border-box;
            border-radius: 2px;
            font-weight: bold;
            line-height: 11px;
          ">Hinzufügen</button>
        </div>
      </div>
    </div>
  `;
}

export function bindPCBuffsEvents(pc, defenses) {
  // Bind Quick Toggle Buttons
  defenses.querySelectorAll('.quick-buff-btn').forEach(btn => {
    btn.onclick = (e) => {
      if (e.target.classList.contains('remove-quick-buff-btn')) return;
      const key = btn.dataset.key;
      const isClass = btn.dataset.isclass === 'true';
      const isCurrentlyActive = Array.isArray(pc.activeBuffs) && pc.activeBuffs.some(b => b.spellKey === key);
      if (isCurrentlyActive) {
        CombatState.updatePCBatch(freshPc => {
          if (Array.isArray(freshPc.activeBuffs)) {
            freshPc.activeBuffs = freshPc.activeBuffs.filter(b => b.spellKey !== key);
          }
        });
        uiRegistry.renderPlayerScreen();
      } else {
        activateBuffByKey(pc, key, isClass);
      }
    };
  });

  // Bind Quick Toggle Remove Buttons
  defenses.querySelectorAll('.remove-quick-buff-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const key = btn.dataset.key;
      CombatState.updatePCBatch(freshPc => {
        if (Array.isArray(freshPc.quickBuffs)) {
          freshPc.quickBuffs = freshPc.quickBuffs.filter(b => b.key !== key);
        }
      });
      uiRegistry.renderPlayerScreen();
    };
  });

  // Bind Active Buff Info Modals
  defenses.querySelectorAll('.info-buff-trigger').forEach(trigger => {
    trigger.onclick = () => {
      const idx = parseInt(trigger.dataset.index);
      const buff = pc.activeBuffs?.[idx];
      if (!buff) return;
      showBuffDetailsDialog(pc, buff.spellKey, false, idx);
    };
  });

  // Bind Delete Active Buff Buttons
  defenses.querySelectorAll('.delete-buff-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.index);
      CombatState.updatePCBatch(freshPc => {
        if (Array.isArray(freshPc.activeBuffs) && freshPc.activeBuffs[idx]) {
          freshPc.activeBuffs.splice(idx, 1);
        }
      });
      uiRegistry.renderPlayerScreen();
    };
  });

  // Bind Active Buff Rounds Inputs
  defenses.querySelectorAll('.buff-rounds-input').forEach(inp => {
    inp.onchange = (e) => {
      const idx = parseInt(inp.dataset.index);
      const val = parseInt(e.target.value);
      CombatState.updatePCBatch(freshPc => {
        if (Array.isArray(freshPc.activeBuffs) && freshPc.activeBuffs[idx]) {
          if (val <= 0) {
            freshPc.activeBuffs.splice(idx, 1);
          } else {
            freshPc.activeBuffs[idx].durationRemainingRounds = val;
          }
        }
      });
      uiRegistry.renderPlayerScreen();
    };
  });

  // Bind Autocomplete Buff Search
  const searchInput = defenses.querySelector('#buff-search-input');
  const resultsDiv = defenses.querySelector('#buff-search-results');
  if (searchInput && resultsDiv) {
    searchInput.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        resultsDiv.style.display = 'none';
        return;
      }

      const matchedClassBuffs = CLASS_BUFFS.filter(b => 
        (b.name.toLowerCase().includes(q) || b.key.toLowerCase().includes(q)) &&
        isBuffEligible(pc, b.key, true)
      ).map(b => ({
        key: b.key,
        name: b.name,
        school: b.school,
        duration: b.duration,
        isClass: true
      }));

      const matchedSpellBuffs = [];
      if (CombatSpells.REGISTRY) {
        for (const key of Object.keys(CombatSpells.REGISTRY)) {
          const spell = CombatSpells.REGISTRY[key];
          if (spell && Array.isArray(spell.effects) && isBuffEligible(pc, key, false)) {
            const nameDe = (spell.nameDe || '').toLowerCase();
            const nameEn = (spell.nameEn || '').toLowerCase();
            if (nameDe.includes(q) || nameEn.includes(q) || key.toLowerCase().includes(q)) {
              matchedSpellBuffs.push({
                key: key,
                name: spell.nameDe || spell.nameEn || key,
                school: spell.school || 'Zauber',
                duration: spell.duration || '—',
                isClass: false
              });
            }
          }
        }
      }

      const allMatches = [...matchedClassBuffs, ...matchedSpellBuffs];
      
      if (allMatches.length === 0) {
        resultsDiv.innerHTML = `<div style="font-size:8px; color:var(--inkl); font-style:italic; padding:4px; text-align:center;">Keine Treffer im Regelwerk.</div>`;
      } else {
        resultsDiv.innerHTML = allMatches.map(m => {
          const conflict = checkBuffConflict(pc, m.key);
          const isSuppressed = conflict.status === 'suppressed';
          const style = isSuppressed 
            ? 'color: rgba(20, 15, 5, 0.45); opacity: 0.65; filter: grayscale(50%);' 
            : 'color: var(--ink);';
          const warningBadge = isSuppressed ? '<span style="font-size:7px; color:var(--red); font-weight:bold; margin-left:3px;" title="Stacking-Konflikt: Ein stärkerer oder gleichwertiger Buff ist aktiv">⚠️</span>' : '';
          return `
            <div class="buff-search-item" data-key="${m.key}" data-isclass="${m.isClass}" style="
              padding:3px 6px;
              cursor:pointer;
              border-bottom:0.5px solid rgba(200, 169, 110, 0.15);
              font-family:'Crimson Text', serif;
              font-size:9px;
              display:flex;
              justify-content:space-between;
              align-items:center;
              ${style}
            " onmouseover="this.style.background='rgba(200, 169, 110, 0.08)'" onmouseout="this.style.background='transparent'">
              <span>
                ✨ <strong>${m.name}</strong>${warningBadge}
                <div style="font-size:7.5px; color:var(--inkl);">${m.school} • ${m.duration}</div>
              </span>
              <span style="font-size:8px; font-weight:bold; color:var(--red);">[Auswählen]</span>
            </div>
          `;
        }).join('');
      }
      resultsDiv.style.display = 'block';
    };

    resultsDiv.onclick = (e) => {
      const item = e.target.closest('.buff-search-item');
      if (!item) return;
      const key = item.dataset.key;
      const isClass = item.dataset.isclass === 'true';
      resultsDiv.style.display = 'none';
      searchInput.value = '';
      showBuffDetailsDialog(pc, key, isClass);
    };

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#buff-search-input') && !e.target.closest('#buff-search-results')) {
        resultsDiv.style.display = 'none';
      }
    });
  }

  // Bind Add Custom Buff Builder
  const addBtn = defenses.querySelector('#add-custom-buff-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      const nameInput = defenses.querySelector('#custom-buff-name');
      const targetSelect = defenses.querySelector('#custom-buff-target');
      const typeSelect = defenses.querySelector('#custom-buff-type');
      const valueInput = defenses.querySelector('#custom-buff-value');

      const name = nameInput.value.trim();
      if (!name) {
        showCustomAlert(
          "Eingabe ungültig", 
          "Bitte gib einen Namen für den eigenen Buff ein.", 
          "Verstanden", 
          "⚠️"
        );
        return;
      }

      const target = targetSelect.value;
      const type = typeSelect.value;
      const value = parseInt(valueInput.value) || 0;

      const performCustomAdd = () => {
        CombatState.updatePCBatch(freshPc => {
          if (!Array.isArray(freshPc.activeBuffs)) freshPc.activeBuffs = [];
          freshPc.activeBuffs.push({
            id: 'custom_' + Date.now(),
            name: name,
            effects: [
              { target, value, type, source: name }
            ]
          });
        });
        nameInput.value = '';
        uiRegistry.renderPlayerScreen();
      };

      const conflict = checkBuffConflict(pc, null, [{ target, value, type, source: name }]);
      if (conflict.status === 'suppressed') {
        showCustomConfirm(
          "Stacking-Konflikt", 
          `Ein stärkerer oder gleichwertiger Buff (<strong>${conflict.conflictingBuffName}</strong>) ist bereits aktiv.<br><br>Dein neuer Buff <strong>${name}</strong> (+${value} auf ${conflict.targetLabel}) hat denselben Bonus-Typ und würde daher <strong>keine Wirkung</strong> zeigen.<br><br>Möchtest du den Buff dennoch aktivieren?`,
          () => {
            performCustomAdd();
          }
        );
      } else if (conflict.status === 'overrides') {
        performCustomAdd();
        showCustomAlert(
          "Buff überlagert", 
          `Durch das Aktivieren von <strong>${name}</strong> (+${value}) wird der schwächere aktive Buff <strong>${conflict.conflictingBuffName}</strong> (+${conflict.activeValue}) auf <strong>${conflict.targetLabel}</strong> überlagert.<br><br>Deine Werte erhöhen sich netto um <strong>+${value - conflict.activeValue}</strong>.`,
          "Verstanden", 
          "✨"
        );
      } else {
        performCustomAdd();
      }
    };
  }
}
