/**
 * @module    PCBuffsDialog
 * @summary   Interactive parchment dialog overlay for displaying spell/class buffs and configuring quick selection favorites.
 * @exports   showBuffDetailsDialog(pc, key, isClass, isAlreadyActiveIndex)
 */
import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { CombatSpells } from '../../../spells.js';
import { CLASS_BUFFS } from '../../../data/class-buffs-data.js';
import {
  translateTarget,
  translateType,
  checkBuffConflict
} from '../../../rules/BuffRules.js';
import { activateBuffByKey } from './PCBuffsTab.js';

export function showBuffDetailsDialog(pc, key, isClass, isAlreadyActiveIndex = null) {
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
