import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { CombatSpells } from '../../../spells.js';
import { CLASS_BUFFS } from '../../../data/class-buffs-data.js';
import {
  translateTarget,
  translateType,
  checkBuffConflict,
  resolveSpellEffectValue,
  calculateDurationRounds
} from '../../../rules/BuffRules.js';
// activateBuffByKey is now in BuffRules.js
import { activateBuffByKey } from '../../../rules/BuffRules.js';

const getBridge = () => {
  if (typeof window !== 'undefined' && window.__REACT_DIALOG_BRIDGE__) {
    return window.__REACT_DIALOG_BRIDGE__;
  }
  return null;
};

export function showBuffDetailsDialog(pc, key, isClass, isAlreadyActiveIndex = null) {
  const bridge = getBridge();
  if (bridge && bridge.showBuffDetailsDialog) {
    return bridge.showBuffDetailsDialog(pc, key, isClass, isAlreadyActiveIndex);
  }

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
      <div style="margin-top:8px;">
        <strong style="color:#8b1a1a; font-size:11.5px; font-family:'IM Fell English SC', serif; letter-spacing:0.4px;">Aktive Modifikatoren:</strong>
        <div style="display:flex; flex-direction:column; gap:3px; margin-top:4px;">
          ${effectsList.map(eff => {
            const sign = eff.value >= 0 ? '+' : '';
            return `<div style="font-size:10.5px; background:rgba(139, 26, 26, 0.03); border:0.5px solid rgba(139,26,26,0.25); border-radius:2px; padding:4px 8px; display:flex; justify-content:space-between; align-items:center;">
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
      border: 2px solid #8b1a1a; 
      padding: 16px 20px; 
      border-radius: 4px; 
      box-shadow: inset 0 0 35px rgba(139, 26, 26, 0.15); 
      font-family: 'Crimson Text', serif; 
      color: #1a0f00; 
      line-height: 1.45; 
      text-align: left; 
      box-sizing: border-box;
    ">
      <div style="font-style:italic; font-size:10px; color:#8b1a1a; font-weight:bold; border-bottom:1px solid rgba(139,26,26,0.3); padding-bottom:4px; margin-bottom:8px;">
        ${school || 'Effekt'}
      </div>
      <div style="display:grid; grid-template-columns: 1fr; gap:4px; font-size:10px; border-bottom:0.5px dashed rgba(139, 26, 26, 0.4); padding-bottom:8px; margin-bottom:10px; font-weight:600;">
        <div><strong>Zeitdauer:</strong> ${durationStr}</div>
        ${(isAlreadyActiveIndex !== null && pc.activeBuffs?.[isAlreadyActiveIndex]?.casterLevel) ? `<div><strong>Wirker-Stufe (Caster Level):</strong> ${pc.activeBuffs[isAlreadyActiveIndex].casterLevel}</div>` : ''}
      </div>
      ${description ? `<div style="font-size:11px; line-height:1.5; color:#2a1b0a; margin-bottom:10px; font-style:italic; white-space:pre-wrap;">${description}</div>` : ''}
      ${effectsHtml}
    </div>
  `;

  const overlayId = 'buffDetails';
  const existing = document.getElementById(overlayId);
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.className = 'no-print';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.65);
    backdrop-filter: blur(3px);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  const toggleBtnText = inQuickSelection ? 'Aus Schnellauswahl entfernen' : 'Hinzufügen';
  const showActions = !!key;

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 20px;
      width: 580px;
      max-width: 92vw;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.1);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>

      <div style="font-size: 15px; color: var(--red); font-weight: bold; margin-bottom: 4px; letter-spacing: 0.8px;">
        ✨ Buff-Regeln: ${displayName}
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 5px 0 10px;">

      <div class="info-dialog-body" style="text-align: left; margin-bottom: 12px;">
        ${bodyHtml}
      </div>

      <div style="display:flex; justify-content:center; gap:12px; margin-top:10px;">
        ${showActions ? `
          <button class="btn btn-p action-activate-buff" style="
            font-family: 'IM Fell English SC', serif;
            font-size: 9.5px;
            padding: 4px 22px;
            cursor: pointer;
            background: rgba(139, 26, 26, 0.1);
            border: 1px solid var(--pb);
            border-radius: 2px;
            color: var(--red);
            font-weight: bold;
          ">Aktivieren</button>
          <button class="btn btn-p action-toggle-favorite" style="
            font-family: 'IM Fell English SC', serif;
            font-size: 9.5px;
            padding: 4px 22px;
            cursor: pointer;
            background: rgba(139, 26, 26, 0.1);
            border: 1px solid var(--pb);
            border-radius: 2px;
            color: var(--red);
            font-weight: bold;
          ">${toggleBtnText}</button>
        ` : ''}
        <button class="btn action-close-buff" style="
          font-family: 'IM Fell English SC', serif;
          font-size: 9.5px;
          padding: 4px 22px;
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
    document.removeEventListener('keydown', keyHandler);
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
    }
  };
  document.addEventListener('keydown', keyHandler);
}

export function showCastSuccessDialog(pc, spell, key, metamagic = [], onAppliedCallback = null) {
  const bridge = getBridge();
  if (bridge && bridge.showCastSuccessDialog) {
    return bridge.showCastSuccessDialog(pc, spell, key, metamagic, onAppliedCallback);
  }

  let defaultCL = 1;

  if (Array.isArray(pc.classes)) {
    pc.classes.forEach(c => {
      if (['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'bard'].includes(c.classType)) {
        if (c.level > defaultCL) defaultCL = c.level;
      }
    });
  }

  const METAMAGIC_COSTS = { extend_spell: 1, empower_spell: 2, maximize_spell: 3, quicken_spell: 4 };
  const metamagicNames = { extend_spell: 'Verlängert', empower_spell: 'Verstärkt', maximize_spell: 'Maximiert', quicken_spell: 'Beschleunigt' };
  const appliedMeta = metamagic.map(mId => metamagicNames[mId] || mId);
  const metaSuffix = appliedMeta.length > 0 ? ` (${appliedMeta.join(', ')})` : '';
  const metamagicAdjustment = metamagic.reduce((sum, fId) => sum + (METAMAGIC_COSTS[fId] || 0), 0);
  const finalLevel = spell.level + metamagicAdjustment;
  const spellName = spell.nameDe || spell.nameEn || key;

  const allPcs = CombatState.getState().combatants || [];
  const allies = allPcs.filter(c => c.type === 'p' && c.id !== pc.id);
  const alliesHtml = allies.map(ally => `
    <label style="display: flex; align-items: center; gap: 6px; font-size: 9px; cursor: pointer; color: var(--ink);">
      <input type="checkbox" class="cast-target-chk" value="${ally.id}" style="margin:0;">
      <span>${ally.name}</span>
    </label>
  `).join('');

  const overlay = document.createElement('div');
  overlay.id = 'castSuccessDialogOverlay';
  overlay.className = 'no-print';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.65);
    backdrop-filter: blur(3px);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 20px;
      width: 520px;
      max-width: 95vw;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'Crimson Text', serif;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-align: left;
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>

      <div style="font-family:'IM Fell English SC', serif; font-size: 13px; color: var(--red); font-weight: bold; margin-bottom: 6px; text-align: center;">
        Zauber erfolgreich gewirkt! ✨
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 4px 0 8px;">

      <div style="font-size: 11px; font-weight: bold; color: var(--red); text-align: center; font-family:'IM Fell English SC', serif;">
        ${spellName}${metaSuffix}
      </div>
      <div style="font-size: 8.5px; color: var(--inkl); text-align: center; margin-bottom: 8px; font-style: italic;">
        ${spell.school} • Grad ${finalLevel}
      </div>
      <div style="font-size: 8px; font-style: italic; background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); padding: 4px; border-radius: 2px; line-height: 1.25; margin-bottom: 10px; max-height: 80px; overflow-y: auto; color: var(--ink);">
        ${spell.description}
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; font-size: 9px; color: var(--ink);">
        <strong>Wirkerstufe (Caster Level):</strong>
        <input type="number" class="cast-cl-input" value="${defaultCL}" min="1" max="40" style="
          width: 40px;
          height: 16px;
          font-size: 9px;
          text-align: center;
          border: 0.5px solid var(--pb);
          border-radius: 2px;
          background: rgba(0,0,0,0.03);
          color: var(--ink);
          font-weight: bold;
        ">
      </div>

      <div style="margin-bottom: 12px; color: var(--ink);">
        <strong style="font-size: 9px; color: var(--red); font-family:'IM Fell English SC', serif; display: block; margin-bottom: 4px;">Ziele für den Buff / die Aura:</strong>
        <div style="display: flex; flex-direction: column; gap: 4px; max-height: 120px; overflow-y: auto; padding: 4px; border: 0.5px solid rgba(200, 169, 110, 0.2); background: rgba(0,0,0,0.01); border-radius: 2px;">
          <label style="display: flex; align-items: center; gap: 6px; font-size: 9px; cursor: pointer; color: var(--ink);">
            <input type="checkbox" class="cast-target-chk" value="${pc.id}" checked style="margin:0;">
            <span><strong>${pc.name}</strong> (Selbst)</span>
          </label>
          ${alliesHtml}
        </div>
        <div style="display: flex; gap: 8px; margin-top: 4px; justify-content: flex-end;">
          <button type="button" class="btn btn-group-toggle" style="font-size: 7.5px; padding: 2px 6px; border: 0.5px solid var(--pb); background: transparent; color: var(--ink); cursor: pointer;">Ganze Gruppe</button>
          <button type="button" class="btn btn-none-toggle" style="font-size: 7.5px; padding: 2px 6px; border: 0.5px solid var(--pb); background: transparent; color: var(--ink); cursor: pointer;">Zurücksetzen</button>
        </div>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center;">
        <button class="btn btn-p apply-buff-btn" style="font-family:'IM Fell English SC', serif; font-size: 9px; padding: 4px 14px; cursor: pointer;">Als Buff anwenden</button>
        <button class="btn close-dialog-btn" style="font-family:'IM Fell English SC', serif; font-size: 9px; padding: 4px 14px; cursor: pointer; border-color: var(--pb); background: transparent; color: var(--ink);">Nur zaubern (Kein Buff)</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect(); // force reflow
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const groupBtn = overlay.querySelector('.btn-group-toggle');
  groupBtn.onclick = () => {
    overlay.querySelectorAll('.cast-target-chk').forEach(chk => {
      chk.checked = true;
    });
  };

  const noneBtn = overlay.querySelector('.btn-none-toggle');
  noneBtn.onclick = () => {
    overlay.querySelectorAll('.cast-target-chk').forEach(chk => {
      chk.checked = false;
    });
  };

  const dismiss = () => {
    document.removeEventListener('keydown', keyHandler);
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => { overlay.remove(); }, 200);
    if (typeof onAppliedCallback === 'function') onAppliedCallback();
  };

  overlay.querySelector('.close-dialog-btn').onclick = dismiss;
  overlay.onclick = (e) => { if (e.target === overlay) dismiss(); };

  overlay.querySelector('.apply-buff-btn').onclick = () => {
    const clInput = overlay.querySelector('.cast-cl-input');
    const cl = parseInt(clInput.value) || 1;
    
    // Compile checked targets
    const selectedIds = Array.from(overlay.querySelectorAll('.cast-target-chk:checked')).map(chk => chk.value);
    
    // Resolve effects & duration
    let rounds = calculateDurationRounds(spell.duration, cl);
    if (rounds !== null && metamagic.includes('extend_spell')) {
      rounds = rounds * 2;
    }

    const effects = spell.effects || [];
    const resolvedEffects = effects.map(eff => {
      let val = parseInt(eff.value) || 0;
      if (eff.valueFormula) {
        val = resolveSpellEffectValue(eff.valueFormula, cl, val);
      }
      return {
        target: eff.target,
        value: val,
        type: eff.type,
        source: eff.source || spellName
      };
    });

    const activate = () => {
      CombatState.updatePCBatch(freshPc => {
        if (!Array.isArray(freshPc.activeBuffs)) freshPc.activeBuffs = [];
        freshPc.activeBuffs = freshPc.activeBuffs.filter(b => b.spellKey !== key);
        
        freshPc.activeBuffs.push({
          id: 'spell_' + key + '_' + Date.now(),
          spellKey: key,
          name: spellName + metaSuffix,
          durationFormula: spell.duration,
          casterLevel: cl,
          durationMaxRounds: rounds,
          durationRemainingRounds: rounds,
          effects: resolvedEffects,
          sharedWith: selectedIds
        });
      });

      uiRegistry.renderPlayerScreen();
      dismiss();
    };

    // Conflict check on caster (if Self is selected)
    const isSelfTarget = selectedIds.includes(pc.id);
    const conflict = isSelfTarget ? checkBuffConflict(pc, key, resolvedEffects) : { status: 'ok' };

    if (conflict.status === 'suppressed') {
      showCustomConfirm(
        "Stacking-Konflikt", 
        `Ein stärkerer oder gleichwertiger Buff (<strong>${conflict.conflictingBuffName}</strong>) ist bereits aktiv.<br><br>Dein neuer Buff <strong>${conflict.buffName}</strong> (+${conflict.newValue} auf ${conflict.targetLabel}) hat denselben Bonus-Typ und würde daher <strong>keine Wirkung</strong> zeigen.<br><br>Möchtest du den Buff dennoch aktivieren?`,
        () => {
          activate();
        }
      );
    } else if (conflict.status === 'overrides') {
      activate();
      showCustomAlert(
        "Buff überlagert", 
        `Durch das Aktivieren von <strong>${conflict.buffName}</strong> (+${conflict.newValue}) wird der schwächere aktive Buff <strong>${conflict.conflictingBuffName}</strong> (+${conflict.activeValue}) auf <strong>${conflict.targetLabel}</strong> überlagert.`,
        "Verstanden", 
        "✨"
      );
    } else {
      activate();
    }
  };

  const keyHandler = (e) => {
    if (e.key === 'Escape') {
      dismiss();
    }
  };
  document.addEventListener('keydown', keyHandler);
}
