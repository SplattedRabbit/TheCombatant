/**
 * @module    DamageChoiceDialog
 * @summary   Dialog zur Schadensberechnung mit auswählbaren Checkboxen für Smite, Erzfeind und Sneak Attack.
 * @exports   showDamageChoiceDialog
 * @reads     pc.classes, pc.isSmiteActive, pc.isFavoredEnemyActive, pc.isSneakAttacking, pc.feats
 * @stateOps  CombatState.updatePCField
 * @depends   AttackEngine, CombatState, BaseDialogs (showInfoDialog/showRollBreakdown)
 */
import { AttackEngine } from '../../rules/AttackEngine.js';
import { CombatState } from '../../state.js';
const formatMod = (val) => (val >= 0 ? '+' + val : val);

export function showDamageChoiceDialog(pc, weapon, event, options = {}) {
  const existing = document.getElementById('damageChoiceOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'damageChoiceOverlay';
  overlay.style = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.55);
    backdrop-filter: blur(2px);
    z-index: 2400;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  const hasPaladin = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === 'paladin');
  const paladinClass = hasPaladin ? pc.classes.find(c => c.classType === 'paladin') : null;
  const favoredEnemyBonus = pc.getFavoredEnemyBonus();
  const sneakAttackDice = pc.getSneakAttackDiceCount();

  const isRanged = weapon.grip === 'rng';
  const isMelee = !isRanged;

  let smiteActive = !!pc.isSmiteActive;
  let favoredEnemyActive = !!pc.isFavoredEnemyActive;
  let sneakActive = !!pc.isSneakAttacking;

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 24px;
      width: 310px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <div style="font-size: 13px; color: var(--red); font-weight: bold; margin-bottom: 2px;">
        ⚔️ ${weapon.name || 'Waffe'} (Schaden)
      </div>
      <div class="dialog-subtitle" style="font-size: 8px; color: var(--inkl); font-style: italic; margin-bottom: 6px;">
        Schadensoptionen wählen
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 4px 0 10px;">

      <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:10px; padding: 4px 8px; background: rgba(200,169,110,0.05); border: 0.5px solid rgba(200,169,110,0.2); border-radius:3px; text-align:left; font-size:8px; font-family:'Crimson Text', serif;">
        ${hasPaladin && isMelee ? `
          <label style="display:flex; align-items:center; gap:4px; cursor:pointer; margin:0; font-weight:bold; color:var(--red);">
            <input type="checkbox" class="dialog-smite-toggle" ${smiteActive ? 'checked' : ''} style="margin:0; width:11px; height:11px;">
             Böses niederstrecken (+${paladinClass.level} Schaden)
          </label>
        ` : ''}
        ${favoredEnemyBonus > 0 ? `
          <label style="display:flex; align-items:center; gap:4px; cursor:pointer; margin:0; font-weight:bold; color:#1a4a1a;">
            <input type="checkbox" class="dialog-fe-toggle" ${favoredEnemyActive ? 'checked' : ''} style="margin:0; width:11px; height:11px;">
            Gegen Erzfeind (+${favoredEnemyBonus} Schaden)
          </label>
        ` : ''}
        ${sneakAttackDice > 0 ? `
          <label style="display:flex; align-items:center; gap:4px; cursor:pointer; margin:0; font-weight:bold; color:#a0522d;">
            <input type="checkbox" class="dialog-sneak-toggle" ${sneakActive ? 'checked' : ''} style="margin:0; width:11px; height:11px;">
            Hinterhältiger Angriff (+${sneakAttackDice}W6 Schaden)
          </label>
        ` : ''}
      </div>
      
      <div class="dialog-content-area" style="display:flex; flex-direction:column; gap:8px;">
        <!-- Filled dynamically -->
      </div>
      
      <button class="btn-close-choice" style="
        font-family: 'IM Fell English SC', serif;
        font-size: 8px;
        padding: 2px 10px;
        margin-top: 10px;
        cursor: pointer;
        background: transparent;
        border: 0.5px solid var(--red);
        border-radius: 1px;
        color: var(--red);
        font-weight: bold;
        outline: none;
        transition: color 0.15s, border-color 0.15s;
      ">Fertig!</button>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect(); // trigger layout reflow
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 200);
  };

  const closeBtn = overlay.querySelector('.btn-close-choice');
  closeBtn.onclick = dismiss;

  function updateView() {
    const seq = AttackEngine.calculateAttackSequence(pc, weapon, false, {
      isOffhandAttack: !!options.isOffhandAttack,
      smite: smiteActive,
      favoredEnemy: favoredEnemyActive,
      sneakAttack: sneakActive,
      ...options
    });
    const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [], damageDice: '1w6' };

    let modsSum = 0;
    const rowsHtml = (stdAtkObj.dmgBreakdown || []).map(item => {
      const val = parseInt(item.value) || 0;
      modsSum += val;
      const sign = val >= 0 ? '+' : '';
      return `<div style="display:flex; justify-content:space-between; padding:1px 0;">
        <span style="font-family:'Crimson Text',serif; font-size:9.5px; color:var(--inkm);">${item.label}:</span>
        <span style="font-family:'Crimson Text',serif; font-size:9.5px; font-weight:bold; color:var(--ink);">${sign}${val}</span>
      </div>`;
    }).join('');

    const modsFormatted = modsSum >= 0 ? `+${modsSum}` : `${modsSum}`;
    const formulaFormatted = modsSum === 0 ? stdAtkObj.damageDice : `${stdAtkObj.damageDice} ${modsFormatted}`;

    const area = overlay.querySelector('.dialog-content-area');
    area.innerHTML = `
      <div style="text-align: left; background: rgba(200, 169, 110, 0.04); border: 1px solid var(--pb); border-radius: 3px; padding: 10px; font-family: 'Crimson Text', serif;">
        <div style="font-family: 'IM Fell English SC', serif; font-size: 11px; font-weight: bold; color: var(--red); margin-bottom: 5px; border-bottom: 0.5px solid rgba(200,169,110,0.3); padding-bottom: 3px;">
          Schadensmodifikatoren
        </div>
        <div style="display:flex; flex-direction:column; gap:3px; font-size:9.5px; color:var(--inkm);">
          ${rowsHtml}
          <hr style="border:none; border-top:0.5px dashed rgba(200,169,110,0.3); margin:4px 0;">
          <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:bold; color:var(--red); font-family: 'IM Fell English SC', serif;">
            <span>Gesamt-Modifikator:</span> <span>${modsFormatted}</span>
          </div>
        </div>
        <hr style="border:none; border-top:0.5px solid rgba(200,169,110,0.3); margin:6px 0 4px;">
        <div style="display:flex; justify-content:space-between; align-items:center; font-family: 'IM Fell English SC', serif; font-size:10.5px; font-weight:bold; color:var(--red);">
          <span>WURF-FORMEL:</span> <span>${formulaFormatted}</span>
        </div>
      </div>
    `;
  }

  // Setup Event Listeners for checkboxes
  const smiteToggle = overlay.querySelector('.dialog-smite-toggle');
  if (smiteToggle) {
    smiteToggle.onchange = (e) => {
      smiteActive = e.target.checked;
      CombatState.updatePCField('isSmiteActive', smiteActive);
      updateView();
    };
  }

  const feToggle = overlay.querySelector('.dialog-fe-toggle');
  if (feToggle) {
    feToggle.onchange = (e) => {
      favoredEnemyActive = e.target.checked;
      CombatState.updatePCField('isFavoredEnemyActive', favoredEnemyActive);
      updateView();
    };
  }

  const sneakToggle = overlay.querySelector('.dialog-sneak-toggle');
  if (sneakToggle) {
    sneakToggle.onchange = (e) => {
      sneakActive = e.target.checked;
      CombatState.updatePCField('isSneakAttacking', sneakActive);
      updateView();
    };
  }

  // Initial render
  updateView();
}
