/**
 * @module    PCDefenses
 * @summary   Rendert RK-Panel (AC/Touch/Flat), Rettungswürfe, Initiative und Bewegungsrate sowie den integrierten Buffs- & Auren-Manager.
 * @exports   renderPCDefenses(pc)
 * @reads     pc.ac, pc.acTouch, pc.acFlat, pc.za, pc.ref, pc.wil, pc.init, pc.speed, pc.str/dex/con/wis, pc.activeBuffs
 * @stateOps  togglePCDefensiveFighting, togglePCTotalDefense, updatePCField, updatePCBatch
 * @depends   CombatState, uiRegistry, PCUtils, dialogs, CombatSpells
 */
import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { getAblMod, formatMod } from './PCUtils.js';
import { showRollBreakdown, showInfoDialog, showCustomConfirm, showCustomAlert, showCustomPrompt } from '../dialogs.js';
import { CombatSpells } from '../../../spells.js';

// Local UI state for toggling between the defenses panel and buffs manager
let activeSubTab = 'defenses'; // 'defenses' or 'buffs'

function translateTarget(target) {
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

function translateType(type) {
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

const CLASS_BUFFS = [
  {
    key: 'rage',
    name: 'Kampfrausch (Rage)',
    school: 'Klassenfähigkeit (Barbar)',
    duration: '5 Runden',
    effects: [
      { target: 'str', value: 4, type: 'morale', source: 'Kampfrausch' },
      { target: 'con', value: 4, type: 'morale', source: 'Kampfrausch' },
      { target: 'wil', value: 2, type: 'morale', source: 'Kampfrausch' },
      { target: 'ac', value: -2, type: 'untyped', source: 'Kampfrausch' }
    ]
  },
  {
    key: 'greater_rage',
    name: 'Großer Kampfrausch (Greater Rage)',
    school: 'Klassenfähigkeit (Barbar)',
    duration: '5 Runden',
    effects: [
      { target: 'str', value: 6, type: 'morale', source: 'Großer Kampfrausch' },
      { target: 'con', value: 6, type: 'morale', source: 'Großer Kampfrausch' },
      { target: 'wil', value: 3, type: 'morale', source: 'Großer Kampfrausch' },
      { target: 'ac', value: -2, type: 'untyped', source: 'Großer Kampfrausch' }
    ]
  },
  {
    key: 'inspire_courage_1',
    name: 'Mut einflößen +1 (Inspire Courage)',
    school: 'Klassenfähigkeit (Barde)',
    duration: '5 Runden nach Ende des Gesangs',
    effects: [
      { target: 'atk', value: 1, type: 'morale', source: 'Mut einflößen' },
      { target: 'dmg', value: 1, type: 'morale', source: 'Mut einflößen' }
    ]
  },
  {
    key: 'inspire_courage_2',
    name: 'Mut einflößen +2',
    school: 'Klassenfähigkeit (Barde)',
    duration: '5 Runden nach Ende des Gesangs',
    effects: [
      { target: 'atk', value: 2, type: 'morale', source: 'Mut einflößen' },
      { target: 'dmg', value: 2, type: 'morale', source: 'Mut einflößen' }
    ]
  },
  {
    key: 'inspire_courage_3',
    name: 'Mut einflößen +3',
    school: 'Klassenfähigkeit (Barde)',
    duration: '5 Runden nach Ende des Gesangs',
    effects: [
      { target: 'atk', value: 3, type: 'morale', source: 'Mut einflößen' },
      { target: 'dmg', value: 3, type: 'morale', source: 'Mut einflößen' }
    ]
  },
  {
    key: 'inspire_courage_4',
    name: 'Mut einflößen +4',
    school: 'Klassenfähigkeit (Barde)',
    duration: '5 Runden nach Ende des Gesangs',
    effects: [
      { target: 'atk', value: 4, type: 'morale', source: 'Mut einflößen' },
      { target: 'dmg', value: 4, type: 'morale', source: 'Mut einflößen' }
    ]
  },
  {
    key: 'aura_of_courage',
    name: 'Aura der Tapferkeit (Aura of Courage)',
    school: 'Aura (Paladin)',
    duration: 'Permanent',
    effects: [
      { target: 'baseWil', value: 4, type: 'morale', source: 'Aura der Tapferkeit (Gegen Furcht)' }
    ]
  },
  {
    key: 'aura_of_resolve',
    name: 'Aura der Entschlossenheit (Aura of Resolve)',
    school: 'Aura (Paladin)',
    duration: 'Permanent',
    effects: [
      { target: 'baseWil', value: 4, type: 'morale', source: 'Aura der Entschlossenheit (Gegen Zwang)' }
    ]
  }
];

function resolveSpellEffectValue(formula, casterLevel, defaultValue) {
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

function calculateDurationRounds(durationStr, casterLevel) {
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

function checkBuffConflict(pc, spellKey, customEffects = null) {
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

function activateBuffByKey(pc, key, isClass) {
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

  const performActivation = (casterLevel) => {
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
        performActivation(cl);
      }, 
      defaultCL.toString()
    );
  } else {
    performActivation(1);
  }
}

function showBuffDetailsDialog(pc, key, isClass, isAlreadyActiveIndex = null) {
  let displayName = '';
  let effectsList = [];
  let durationStr = '—';
  let description = '';
  let school = '';
  let spell = null;
  let classBuff = null;

  if (isClass) {
    classBuff = CLASS_BUFFS.find(b => b.key === key);
    if (classBuff) {
      displayName = classBuff.name;
      effectsList = classBuff.effects || [];
      durationStr = classBuff.duration || '—';
      description = classBuff.description || 'Klassenspezifischer Buff- oder Auren-Effekt.';
      school = classBuff.school || 'Klassenfähigkeit';
    }
  } else if (key) {
    classBuff = CLASS_BUFFS.find(b => b.key === key);
    if (classBuff) {
      displayName = classBuff.name;
      effectsList = classBuff.effects || [];
      durationStr = classBuff.duration || '—';
      description = classBuff.description || 'Klassenspezifischer Buff- oder Auren-Effekt.';
      school = classBuff.school || 'Klassenfähigkeit';
      isClass = true;
    } else {
      spell = CombatSpells.REGISTRY?.[key];
      if (spell) {
        displayName = spell.nameDe || spell.nameEn || key;
        effectsList = spell.effects || [];
        durationStr = spell.duration || '—';
        description = spell.description || '';
        school = spell.school || 'Zauber';
      }
    }
  }

  // If this is an active buff instance (with custom values)
  if (isAlreadyActiveIndex !== null && pc.activeBuffs?.[isAlreadyActiveIndex]) {
    const activeInstance = pc.activeBuffs[isAlreadyActiveIndex];
    displayName = activeInstance.name;
    if (Array.isArray(activeInstance.effects)) {
      effectsList = activeInstance.effects;
    }
    if (activeInstance.durationFormula) {
      durationStr = activeInstance.durationFormula;
    }
  }

  if (!displayName) {
    // Custom Buff or unknown
    if (isAlreadyActiveIndex !== null && pc.activeBuffs?.[isAlreadyActiveIndex]) {
      const activeInstance = pc.activeBuffs[isAlreadyActiveIndex];
      displayName = activeInstance.name || 'Eigener Buff';
      effectsList = activeInstance.effects || [];
    } else {
      return;
    }
  }

  const inQuickSelection = Array.isArray(pc.quickBuffs) && pc.quickBuffs.some(b => b.key === key);

  let effectsHtml = '';
  if (effectsList.length > 0) {
    effectsHtml = `
      <div style="margin-top:6px;">
        <strong style="color:var(--red); font-size:10.5px; font-family:'IM Fell English SC', serif; letter-spacing:0.3px;">Aktive Modifikatoren:</strong>
        <div style="display:flex; flex-direction:column; gap:2.5px; margin-top:4px;">
          ${effectsList.map(eff => {
            const sign = eff.value >= 0 ? '+' : '';
            return `<div style="font-size:9.5px; background:rgba(200, 169, 110, 0.05); border:0.5px solid rgba(200,169,110,0.25); border-radius:2px; padding:3px 6px; display:flex; justify-content:space-between; align-items:center;">
              <span>• <strong>${translateTarget(eff.target)}:</strong></span>
              <strong>${sign}${eff.value} (${translateType(eff.type)})</strong>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  const bodyHtml = `
    <div class="ancient-parchment" style="
      background: #f4e8c1; 
      border: 1px solid var(--pb); 
      padding: 12px 16px; 
      border-radius: 3px; 
      box-shadow: inset 0 0 25px rgba(200, 169, 110, 0.12); 
      font-family: 'Crimson Text', serif; 
      color: #1a0f00; 
      line-height: 1.45; 
      text-align: left; 
      box-sizing: border-box;
    ">
      <div style="font-style:italic; font-size:9.5px; color:var(--inkl); border-bottom:1px solid var(--pb); padding-bottom:4px; margin-bottom:8px;">
        ${school || 'Effekt'}
      </div>
      <div style="display:grid; grid-template-columns: 1fr; gap:4px; font-size:9.5px; border-bottom:0.5px dashed var(--pb); padding-bottom:8px; margin-bottom:10px; font-weight:600;">
        <div><strong>Zeitdauer:</strong> ${durationStr}</div>
        ${(isAlreadyActiveIndex !== null && pc.activeBuffs?.[isAlreadyActiveIndex]?.casterLevel) ? `<div><strong>Wirker-Stufe (Caster Level):</strong> ${pc.activeBuffs[isAlreadyActiveIndex].casterLevel}</div>` : ''}
      </div>
      ${description ? `<div style="font-size:10.5px; line-height:1.5; color:#2a1b0a; margin-bottom:10px; font-style:italic; white-space:pre-wrap;">${description}</div>` : ''}
      ${effectsHtml}
    </div>
  `;

  const overlayId = 'buff-details-dialog-overlay';
  const existing = document.getElementById(overlayId);
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.className = 'no-print';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.55);
    backdrop-filter: blur(2px);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  const toggleBtnText = inQuickSelection ? 'Aus Schnellauswahl entfernen' : 'Hinzufügen';
  const toggleBtnClass = inQuickSelection ? 'btn-p' : 'btn-p';
  const showActions = !!key;

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 20px;
      width: 480px;
      max-width: 92vw;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>

      <div style="font-size: 12px; color: var(--red); font-weight: bold; margin-bottom: 4px; letter-spacing: 0.3px;">
        ✨ Buff-Regeln: ${displayName}
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 5px 0 10px;">

      <div class="info-dialog-body" style="text-align: left; margin-bottom: 12px;">
        ${bodyHtml}
      </div>

      <div style="display:flex; justify-content:center; gap:8px; margin-top:10px;">
        ${showActions ? `
          <button class="btn btn-p action-activate-buff" style="font-family:'IM Fell English SC',serif; font-size:9px; padding:4px 18px; cursor:pointer;">Aktivieren</button>
          <button class="btn btn-p action-toggle-favorite" style="font-family:'IM Fell English SC',serif; font-size:9px; padding:4px 18px; cursor:pointer;">${toggleBtnText}</button>
        ` : ''}
        <button class="btn action-close-buff" style="
          font-family: 'IM Fell English SC', serif;
          font-size: 9px;
          padding: 4px 18px;
          cursor: pointer;
          border: 1px solid var(--pb);
          background: rgba(0,0,0,0.03);
          color: var(--ink);
        ">Schließen</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect(); // force reflow
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => { overlay.remove(); }, 200);
  };

  overlay.querySelector('.action-close-buff').onclick = dismiss;
  overlay.onclick = (e) => { if (e.target === overlay) dismiss(); };

  if (showActions) {
    overlay.querySelector('.action-activate-buff').onclick = () => {
      dismiss();
      activateBuffByKey(pc, key, isClass);
    };

    overlay.querySelector('.action-toggle-favorite').onclick = () => {
      dismiss();
      CombatState.updatePCBatch(freshPc => {
        if (!Array.isArray(freshPc.quickBuffs)) freshPc.quickBuffs = [];
        const index = freshPc.quickBuffs.findIndex(b => b.key === key);
        if (index >= 0) {
          freshPc.quickBuffs.splice(index, 1);
        } else {
          freshPc.quickBuffs.push({ key, name: displayName, isClass });
        }
      });
      uiRegistry.renderPlayerScreen();
    };
  }

  const keyHandler = (e) => {
    if (e.key === 'Escape') {
      dismiss();
      document.removeEventListener('keydown', keyHandler);
    }
  };
  document.addEventListener('keydown', keyHandler);
}

export function renderPCDefenses(pc) {
  const defenses = document.getElementById('pcDefenses');
  if (!defenses) return;

  const dexMod = getAblMod(pc.dex);
  const conMod = getAblMod(pc.con);
  const wisMod = getAblMod(pc.wis);
  
  const hasImprovedInit = Array.isArray(pc.feats) && pc.feats.some(f => f.id === 'improved_initiative');
  const totFort = pc.za.getValue();
  const totRef = pc.ref.getValue();
  const totWil = pc.wil.getValue();
  const totIni = dexMod + (parseInt(pc.iniMisc) || 0) + (hasImprovedInit ? 4 : 0);

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;

  // Sub-Tab Navigation Bar
  const tabBarHtml = `
    <div class="panel-tab-bar">
      <button class="sub-tab-btn ${activeSubTab === 'defenses' ? 'active' : ''}" data-subtab="defenses">🛡️ Rettung &amp; Verteidigung</button>
      <button class="sub-tab-btn ${activeSubTab === 'buffs' ? 'active' : ''}" data-subtab="buffs">✨ Buffs &amp; Auren (${Array.isArray(pc.activeBuffs) ? pc.activeBuffs.length : 0})</button>
    </div>
  `;

  // Render Panel content depending on active sub-tab
  let bodyHtml = '';
  if (activeSubTab === 'defenses') {
    bodyHtml = `
      <div style="display:flex; flex-direction:column; gap:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(200, 169, 110, 0.05); border:0.5px solid var(--pb); border-radius:2px; padding:3px 6px; margin-bottom:2px;">
          <label style="display:flex; align-items:center; gap:4px; cursor:pointer; color:var(--inkm); margin:0; font-weight:bold; font-size:8px; font-family:'IM Fell English SC', serif;">
            <input type="checkbox" class="pc-autoac-checkbox" ${pc.autoAC ? 'checked' : ''} style="margin: 0; width: 11px; height: 11px;">
            🛡️ Rüstungsklasse automatisch berechnen (Auto-RK)
          </label>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px;">
          <div>
            <label style="font-size:9px; font-weight:600; color:var(--inkl);">AC (RK)</label>
            <input type="number" value="${pc.ac}" class="cinput pc-ac-input" ${pc.autoAC ? 'readonly style="background:rgba(0,0,0,0.05); color:var(--red); font-weight:bold; cursor:pointer;"' : ''}>
          </div>
          <div>
            <label style="font-size:9px; font-weight:600; color:var(--inkl);">Touch</label>
            <input type="number" value="${pc.acTouch}" class="cinput pc-acTouch-input" ${pc.autoAC ? 'readonly style="background:rgba(0,0,0,0.05); color:var(--red); font-weight:bold; cursor:pointer;"' : ''}>
          </div>
          <div>
            <label style="font-size:9px; font-weight:600; color:var(--inkl);">Flat-Footed</label>
            <input type="number" value="${pc.acFlat}" class="cinput pc-acFlat-input" ${pc.autoAC ? 'readonly style="background:rgba(0,0,0,0.05); color:var(--red); font-weight:bold; cursor:pointer;"' : ''}>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px; margin-top:-2px; margin-bottom:2px;">
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);" title="Natürlicher Rüstungsbonus (z.B. Amulett)">Natürliche Rüst.</label>
            <input type="number" value="${pc.acNatural || 0}" class="cinput pc-acNatural-input" style="height:15px; font-size:8px; text-align:center;">
          </div>
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);" title="Ablenkungsbonus auf RK (z.B. Schutzring)">Ablenkung</label>
            <input type="number" value="${pc.acDeflection || 0}" class="cinput pc-acDeflection-input" style="height:15px; font-size:8px; text-align:center;">
          </div>
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);" title="Sonstige Modifikatoren auf RK">Sonstiges (RK)</label>
            <input type="number" value="${pc.acMisc || 0}" class="cinput pc-acMisc-input" style="height:15px; font-size:8px; text-align:center;">
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
          <div><label style="font-size:9px; font-weight:600; color:var(--inkl);">Zauberresistenz (SR)</label><input type="number" value="${pc.sr}" class="cinput pc-sr-input"></div>
          <div><label style="font-size:9px; font-weight:600; color:var(--inkl);">Geschwindigkeit (Speed)</label><input type="number" value="${pc.bw}" class="cinput pc-bw-input" title="Bewegungsrate (ft)" ${pc.getEquippedArmor() ? 'readonly style="background:rgba(0,0,0,0.05); color:var(--red); font-weight:bold;"' : ''}></div>
        </div>
        
        <hr style="border:none; border-top:.5px solid var(--pb); margin:2px 0;">
        
        <!-- Initiative Block -->
        <div style="display:grid; grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr 0.7fr; gap:3px; align-items:center; background:rgba(200, 169, 110, 0.1); border:0.5px solid var(--pb); border-radius:2px; padding:3px 4px;">
          <div style="display:flex; flex-direction:column; align-items:center;">
            <span style="font-size:7.5px; font-weight:600; color:var(--inkl); line-height:1;">Initiative-Mod</span>
            <span style="font-size:11px; font-weight:bold; color:var(--red); text-align:center; padding-top:1px;">${formatMod(totIni)}</span>
          </div>
          <div style="display:flex; flex-direction:column; align-items:center;">
            <label style="font-size:7px; font-weight:600; color:var(--inkl); margin-bottom:1px; line-height:1;">DEX-Mod</label>
            <input type="text" value="${formatMod(dexMod)}" readonly class="cinput" style="width:28px; font-size:8px; height:13px; text-align:center; padding:0; background:rgba(0,0,0,0.05); font-weight:bold;">
          </div>
          <div style="display:flex; flex-direction:column; align-items:center;">
            <label style="font-size:7px; font-weight:600; color:var(--inkl); margin-bottom:1px; line-height:1;">Misc-Mod</label>
            <input type="number" value="${pc.iniMisc || 0}" class="cinput pc-iniMisc-input" style="width:28px; font-size:8.5px; height:13px; text-align:center; padding:0;">
          </div>
          <div style="display:flex; flex-direction:column; align-items:center;">
            <label style="font-size:7px; font-weight:600; color:var(--inkl); margin-bottom:1px; line-height:1;">Gewürfelt</label>
            <input type="number" value="${pc.init || 0}" class="cinput pc-init-input" style="width:28px; font-size:8.5px; height:13px; text-align:center; padding:0; font-weight:bold; color:var(--red);">
          </div>
          <div style="display:flex; flex-direction:column; align-items:center;">
            <label style="font-size:7px; font-weight:600; color:var(--inkl); margin-bottom:1px; line-height:1;">Summe</label>
            <span class="pc-init-total" style="font-size:11px; font-weight:bold; color:var(--red); line-height:13px; min-width:28px; text-align:center; background:rgba(139,26,26,0.08); border:0.5px solid rgba(139,26,26,0.3); border-radius:2px; padding:0 2px;">${(pc.init || 0) > 0 ? (pc.init || 0) + totIni : '--'}</span>
          </div>
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <label style="font-size:7px; font-weight:600; color:var(--inkl); margin-bottom:1px; line-height:1;">Formel</label>
            <button class="xbtn roll-ini-btn" style="padding:0; width:16px; height:13px; font-size:8px; line-height:13px; display:flex; align-items:center; justify-content:center;" title="Initiativewurf (Formel)">🎲</button>
          </div>
        </div>
        
        <hr style="border:none; border-top:.5px solid var(--pb); margin:2px 0;">
        
        <div style="display:grid; grid-template-columns: 80px 30px 8px 30px 8px 30px 8px 1fr; gap:2px; font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--inkl); text-align:center; padding-bottom:2px;">
          <span style="text-align:left;">Rettungswurf</span>
          <span>Basis</span>
          <span></span>
          <span>Attribut</span>
          <span></span>
          <span>Sonst.</span>
          <span></span>
          <span>Gesamt</span>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:4px; padding-bottom: 2px;">
          <!-- Zähigkeit (Fort) Equation Row -->
          <div style="display:grid; grid-template-columns: 80px 30px 8px 30px 8px 30px 8px 1fr; gap:2px; align-items:center;">
            <span style="font-size:8.5px; font-weight:600; text-align:left;" title="Zähigkeit (Fortitude)">⚔️ Zäh (Fort)</span>
            <input type="number" value="${pc.baseZa.base}" class="cinput pc-baseZa-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; ${hasClasses ? 'background:rgba(0,0,0,0.05); color:var(--inkl); border-color:var(--pb); cursor:not-allowed;' : ''}" ${hasClasses ? 'readonly tabindex="-1"' : ''}>
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">+</span>
            <input type="text" value="${formatMod(conMod)}" readonly tabindex="-1" class="cinput cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; font-weight:bold; background:rgba(0,0,0,0.05); color:var(--red); border-color:var(--pb);" title="KON-Modifikator">
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">+</span>
            <input type="number" value="${pc.zaMisc || 0}" class="cinput pc-zaMisc-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px;" title="Sonstiger Modifikator">
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">=</span>
            <button class="btn roll-save-btn" data-save="za" style="text-align:center; display:flex; justify-content:center; align-items:center; gap:2px; font-weight:bold; height:16px; padding:0 3px; font-size:8.5px; border-radius:2px; line-height:1;">
              <strong>${formatMod(totFort)} 🎲</strong>
            </button>
          </div>
          
          <!-- Reflex (Ref) Equation Row -->
          <div style="display:grid; grid-template-columns: 80px 30px 8px 30px 8px 30px 8px 1fr; gap:2px; align-items:center;">
            <span style="font-size:8.5px; font-weight:600; text-align:left;" title="Reflex (Reflex)">🎯 Ref (Ges)</span>
            <input type="number" value="${pc.baseRef.base}" class="cinput pc-baseRef-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; ${hasClasses ? 'background:rgba(0,0,0,0.05); color:var(--inkl); border-color:var(--pb); cursor:not-allowed;' : ''}" ${hasClasses ? 'readonly tabindex="-1"' : ''}>
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">+</span>
            <input type="text" value="${formatMod(dexMod)}" readonly tabindex="-1" class="cinput cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; font-weight:bold; background:rgba(0,0,0,0.05); color:var(--red); border-color:var(--pb);" title="GES-Modifikator">
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">+</span>
            <input type="number" value="${pc.refMisc || 0}" class="cinput pc-refMisc-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px;" title="Sonstiger Modifikator">
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">=</span>
            <button class="btn roll-save-btn" data-save="ref" style="text-align:center; display:flex; justify-content:center; align-items:center; gap:2px; font-weight:bold; height:16px; padding:0 3px; font-size:8.5px; border-radius:2px; line-height:1;">
              <strong>${formatMod(totRef)} 🎲</strong>
            </button>
          </div>
          
          <!-- Willen (Will) Equation Row -->
          <div style="display:grid; grid-template-columns: 80px 30px 8px 30px 8px 30px 8px 1fr; gap:2px; align-items:center;">
            <span style="font-size:8.5px; font-weight:600; text-align:left;" title="Willenskraft (Will)">🔮 Will (Wei)</span>
            <input type="number" value="${pc.baseWil.base}" class="cinput pc-baseWil-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; ${hasClasses ? 'background:rgba(0,0,0,0.05); color:var(--inkl); border-color:var(--pb); cursor:not-allowed;' : ''}" ${hasClasses ? 'readonly tabindex="-1"' : ''}>
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">+</span>
            <input type="text" value="${formatMod(wisMod)}" readonly tabindex="-1" class="cinput cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; font-weight:bold; background:rgba(0,0,0,0.05); color:var(--red); border-color:var(--pb);" title="WEI-Modifikator">
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">+</span>
            <input type="number" value="${pc.wilMisc || 0}" class="cinput pc-wilMisc-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px;" title="Sonstiger Modifikator">
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">=</span>
            <button class="btn roll-save-btn" data-save="wil" style="text-align:center; display:flex; justify-content:center; align-items:center; gap:2px; font-weight:bold; height:16px; padding:0 3px; font-size:8.5px; border-radius:2px; line-height:1;">
              <strong>${formatMod(totWil)} 🎲</strong>
            </button>
          </div>
        </div>
        
        <hr style="border:none; border-top:.5px solid var(--pb); margin:2px 0;">
        
        <!-- Integrated Physical Resistances & Reach -->
        <div style="font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--red); padding-bottom:1px; border-bottom:0.5px solid rgba(200,169,110,0.2); letter-spacing:0.5px; font-weight:bold;">
          🛡️ Physische Resistenzen &amp; Reichweite
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-top:1px;">
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);">Schadensreduktion (DR)</label>
            <input type="text" value="${pc.dr || ''}" class="cinput pc-dr-input" placeholder="z. B. 5/Silber" style="height:14px; font-size:8px;">
          </div>
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);">Reichweite (Reach)</label>
            <input type="text" value="${pc.reach || ''}" class="cinput pc-reach-input" placeholder="z. B. 5 ft" style="height:14px; font-size:8px;">
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-top:2px;">
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);">Immunitäten</label>
            <input type="text" value="${pc.immunities || ''}" class="cinput pc-immunities-input" placeholder="Gift, Schlaf..." style="height:14px; font-size:8px;">
          </div>
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);">Energie-Resistenzen</label>
            <input type="text" value="${pc.resistances || ''}" class="cinput pc-resistances-input" placeholder="Feuer 5..." style="height:14px; font-size:8px;">
          </div>
        </div>
      </div>
    `;
  } else {
    // Rendere Buff-Management Sektion
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
            wil: 'Will'
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

        return `
          <div class="active-buff-pill" style="
            display:inline-flex;
            align-items:center;
            background:rgba(200, 169, 110, 0.05);
            border:0.5px solid var(--pb);
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
              ✨ ${displayName}
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
        const isSuppressed = !isActive && checkBuffConflict(pc, qb.key).status === 'suppressed';
        const btnStyle = isActive
          ? `background: #8b1a1a; color: #f4e8c1; border-color: #8b1a1a; font-weight: bold;`
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

    bodyHtml = `
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

  // Inject content to defenses container
  defenses.innerHTML = `
    ${tabBarHtml}
    <div class="pbody" style="display:flex; flex-direction:column; gap:6px;">
      ${bodyHtml}
    </div>
  `;

  // --- BIND EVENTS ---

  // Sub-Tab Toggle Buttons
  defenses.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.onclick = () => {
      activeSubTab = btn.dataset.subtab;
      renderPCDefenses(pc);
    };
  });

  if (activeSubTab === 'defenses') {
    // Bind Auto-AC
    defenses.querySelector('.pc-autoac-checkbox').onchange = (e) => {
      CombatState.setPCAutoAC(e.target.checked);
      uiRegistry.renderPlayerScreen();
    };

    if (pc.autoAC) {
      const showACSourcesPopup = (title, statObj) => {
        const grouped = {};
        const appliedModifiers = [];
        
        statObj.modifiers.forEach(m => {
          const val = parseInt(m.value) || 0;
          if (val === 0) return;
          if (m.type === 'dodge' || m.type === 'untyped') {
            appliedModifiers.push({ label: m.source || 'Modifikator', value: val });
          } else {
            if (!grouped[m.type] || val > grouped[m.type].value) {
              grouped[m.type] = { label: m.source || 'Modifikator', value: val };
            }
          }
        });
        
        Object.keys(grouped).forEach(type => {
          appliedModifiers.push(grouped[type]);
        });

        const rowsHtml = [
          `<div style="display:flex; justify-content:space-between; padding:3px 0; border-bottom:0.5px solid rgba(200,169,110,0.15);">
            <span style="font-family:'Crimson Text',serif; font-size:11px; color:var(--inkm);">Basiswert:</span>
            <span style="font-family:'Crimson Text',serif; font-size:11px; font-weight:bold; color:var(--ink);">10</span>
          </div>`
        ];

        appliedModifiers.forEach(item => {
          const sign = item.value >= 0 ? '+' : '';
          rowsHtml.push(`
            <div style="display:flex; justify-content:space-between; padding:3px 0; border-bottom:0.5px solid rgba(200,169,110,0.15);">
              <span style="font-family:'Crimson Text',serif; font-size:11px; color:var(--inkm);">${item.label}:</span>
              <span style="font-family:'Crimson Text',serif; font-size:11px; font-weight:bold; color:var(--ink);">${sign}${item.value}</span>
            </div>
          `);
        });

        const totalVal = statObj.getValue();
        const bodyHtml = `
          <div style="display:flex; flex-direction:column; gap:2px;">
            ${rowsHtml.join('')}
            <div style="display:flex; justify-content:space-between; margin-top:8px; padding-top:6px; font-family:'IM Fell English SC',serif; font-size:12px; font-weight:bold; color:var(--red);">
              <span>Gesamtwert:</span>
              <span style="font-size:14px;">${totalVal}</span>
            </div>
          </div>
        `;

        showInfoDialog({
          id: 'rollBreakdown',
          title: title,
          bodyHtml,
          buttonText: 'Schließen',
          width: 255
        });
      };

      defenses.querySelector('.pc-ac-input').onclick = () => showACSourcesPopup('🛡️ Rüstungsklasse (AC)', pc.ac);
      defenses.querySelector('.pc-acTouch-input').onclick = () => showACSourcesPopup('🛡️ Berührungs-RK (Touch AC)', pc.acTouch);
      defenses.querySelector('.pc-acFlat-input').onclick = () => showACSourcesPopup('🛡️ Auf dem falschen Fuß (Flat-Footed AC)', pc.acFlat);
    } else {
      defenses.querySelector('.pc-ac-input').onchange = (e) => CombatState.updatePCNumber('ac', e.target.value);
      defenses.querySelector('.pc-acTouch-input').onchange = (e) => CombatState.updatePCNumber('acTouch', e.target.value);
      defenses.querySelector('.pc-acFlat-input').onchange = (e) => CombatState.updatePCNumber('acFlat', e.target.value);
    }

    defenses.querySelector('.pc-acNatural-input').onchange = (e) => {
      CombatState.updatePCField('acNatural', parseInt(e.target.value) || 0);
      uiRegistry.renderPlayerScreen();
    };
    defenses.querySelector('.pc-acDeflection-input').onchange = (e) => {
      CombatState.updatePCField('acDeflection', parseInt(e.target.value) || 0);
      uiRegistry.renderPlayerScreen();
    };
    defenses.querySelector('.pc-acMisc-input').onchange = (e) => {
      CombatState.updatePCField('acMisc', parseInt(e.target.value) || 0);
      uiRegistry.renderPlayerScreen();
    };

    defenses.querySelector('.pc-sr-input').onchange = (e) => CombatState.updatePCNumber('sr', e.target.value);
    defenses.querySelector('.pc-bw-input').onchange = (e) => {
      CombatState.updatePCNumber('bw', e.target.value);
      uiRegistry.renderPlayerScreen();
    };
    
    defenses.querySelector('.pc-dr-input').onchange = (e) => CombatState.updatePCField('dr', e.target.value);
    defenses.querySelector('.pc-reach-input').onchange = (e) => CombatState.updatePCField('reach', e.target.value);
    defenses.querySelector('.pc-immunities-input').onchange = (e) => CombatState.updatePCField('immunities', e.target.value);
    defenses.querySelector('.pc-resistances-input').onchange = (e) => CombatState.updatePCField('resistances', e.target.value);

    defenses.querySelector('.pc-baseZa-inp').onchange = (e) => { 
      CombatState.clearPCClasses(); 
      CombatState.updatePCNumber('baseZa', e.target.value); 
      uiRegistry.renderPlayerScreen(); 
    };
    defenses.querySelector('.pc-baseRef-inp').onchange = (e) => { 
      CombatState.clearPCClasses(); 
      CombatState.updatePCNumber('baseRef', e.target.value); 
      uiRegistry.renderPlayerScreen(); 
    };
    defenses.querySelector('.pc-baseWil-inp').onchange = (e) => { 
      CombatState.clearPCClasses(); 
      CombatState.updatePCNumber('baseWil', e.target.value); 
      uiRegistry.renderPlayerScreen(); 
    };

    defenses.querySelector('.pc-zaMisc-inp').onchange = (e) => {
      CombatState.updatePCNumber('zaMisc', e.target.value);
      uiRegistry.renderPlayerScreen();
    };
    defenses.querySelector('.pc-refMisc-inp').onchange = (e) => {
      CombatState.updatePCNumber('refMisc', e.target.value);
      uiRegistry.renderPlayerScreen();
    };
    defenses.querySelector('.pc-wilMisc-inp').onchange = (e) => {
      CombatState.updatePCNumber('wilMisc', e.target.value);
      uiRegistry.renderPlayerScreen();
    };
    
    defenses.querySelector('.pc-iniMisc-input').onchange = (e) => { 
      CombatState.updatePCNumber('iniMisc', e.target.value); 
      uiRegistry.renderPlayerScreen(); 
    };
    defenses.querySelector('.pc-init-input').oninput = (e) => {
      const roll = parseInt(e.target.value) || 0;
      const totalEl = defenses.querySelector('.pc-init-total');
      if (totalEl) totalEl.textContent = roll > 0 ? roll + totIni : '--';
    };
    defenses.querySelector('.pc-init-input').onchange = (e) => { 
      CombatState.updatePCNumber('init', e.target.value); 
      uiRegistry.renderPlayerScreen(); 
    };

    // Roll Saves Breakdown Buttons
    defenses.querySelectorAll('.roll-save-btn').forEach(btn => {
      btn.onclick = (e) => {
        const type = btn.dataset.save;
        const baseStat = type === 'za' ? pc.baseZa : type === 'ref' ? pc.baseRef : pc.baseWil;
        const saveStat = type === 'za' ? pc.za : type === 'ref' ? pc.ref : pc.wil;
        const label = type === 'za' ? 'Zähigkeit' : type === 'ref' ? 'Reflex' : 'Willen';
        
        const items = [
          { label: 'Klassen-Basis', value: baseStat.getValue() }
        ];
        
        if (Array.isArray(saveStat.modifiers)) {
          saveStat.modifiers.forEach(m => {
            items.push({ label: m.source || 'Modifikator', value: m.value });
          });
        }
        
        showRollBreakdown(`Rettungswurf: ${label}`, '1W20', items, e);
      };
    });

    // Roll Initiative Breakdown
    const iniBtn = defenses.querySelector('.roll-ini-btn');
    if (iniBtn) {
      iniBtn.onclick = (e) => {
        const items = [
          { label: 'GES-Mod (DEX)', value: dexMod },
          { label: 'Misc-Mod (Sonst)', value: parseInt(pc.iniMisc) || 0 }
        ];
        if (hasImprovedInit) {
          items.push({ label: 'Talent: Verbesserte Initiative', value: 4 });
        }
        showRollBreakdown('Initiative-Wurf', '1W20', items, e);
      };
    }
  } else {
    // --- BUFFS EVENT BINDINGS ---
    
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
          b.name.toLowerCase().includes(q) || b.key.toLowerCase().includes(q)
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
            if (spell && Array.isArray(spell.effects)) {
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

    // Bind Add Custom Buff
    const addBtn = defenses.querySelector('#add-custom-buff-btn');
    if (addBtn) {
      addBtn.onclick = () => {
        const nameInput = defenses.querySelector('#custom-buff-name');
        const targetSelect = defenses.querySelector('#custom-buff-target');
        const typeSelect = defenses.querySelector('#custom-buff-type');
        const valueInput = defenses.querySelector('#custom-buff-value');

        const name = nameInput.value.trim();
        if (!name) {
          alert('Bitte gib einen Namen für den Buff ein.');
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
}
