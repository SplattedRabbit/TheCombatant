/**
 * @module    DMToolbox
 * @summary   Verwaltet die DM-Hilfswerkzeuge auf dem Spielleiter-Bildschirm, wie z.B. Konzentrationszauber-Tracker und die Regel-Schnellreferenz.
 * @exports   renderConc, buildCondRefGrid, openRef, closeRefDirect
 * @reads     state.concentrations, CombatRules.CONDITIONS
 * @stateOps  CombatState.updateConcentrationField, CombatState.removeConcentration
 * @depends   CombatState, CombatRules
 * @notHere   Rundensteuerung → DMHeader.js | Kämpfertabellen → DMCombatantsTable.js
 */

import { CombatState } from '../../../state.js';
import { CombatRules } from '../../../rules.js';

/**
 * Renders concentration spells list
 */
export function renderConc() {
  const state = CombatState.getState();
  const cont = document.getElementById('concRows');
  if (!cont) return;

  if (!state.concentrations.length) {
    cont.innerHTML = '<div class="empty-msg" style="padding:3px 0;">Keine aktiven Konzentrationszauber</div>';
    return;
  }

  cont.innerHTML = '';
  
  state.concentrations.forEach(c => {
    const row = document.createElement('div');
    row.className = 'conc-row';
    row.innerHTML = `
      <span style="width:58px;color:var(--inkm);font-style:italic;font-size:9px;flex-shrink:0;">${c.who}</span>
      <input class="conc-in spell-input" type="text" value="${c.spell}" style="flex:1;">
      <input class="conc-in spell-dur" type="number" value="${c.dur || ''}" placeholder="∞" style="width:26px;text-align:center;" title="Runden">
      <button class="xbtn xbtn-del delete-spell-btn" style="padding:1px 4px;">✕</button>
    `;

    row.querySelector('.spell-input').onchange = (e) => {
      CombatState.updateConcentrationField(c.id, 'spell', e.target.value);
    };

    row.querySelector('.spell-dur').onchange = (e) => {
      CombatState.updateConcentrationField(c.id, 'dur', e.target.value);
    };

    row.querySelector('.delete-spell-btn').onclick = () => {
      CombatState.removeConcentration(c.id);
      renderConc();
    };

    cont.appendChild(row);
  });
}

/**
 * Builds the static condition chips in the rules reference panel
 */
export function buildCondRefGrid() {
  const grid = document.getElementById('condRefGrid');
  if (!grid) return;

  grid.innerHTML = '';

  CombatRules.CONDITIONS.forEach(c => {
    const chip = document.createElement('div');
    chip.className = 'cond-ref-chip';
    chip.textContent = c.n;
    chip.onclick = () => openRef(c.n);
    grid.appendChild(chip);
  });
}

/**
 * Rule Reference Modals Triggers
 */
export function openRef(condName) {
  const c = CombatRules.CONDITIONS.find(x => x.n === condName);
  if (!c) return;

  const overlay = document.getElementById('refOverlay');
  const title = document.getElementById('refTitle');
  const body = document.getElementById('refBody');

  if (overlay && title && body) {
    title.textContent = condName;
    body.innerHTML = c.r;
    overlay.classList.add('open');
  }
}

/**
 * Closes the reference modal
 */
export function closeRefDirect() {
  const overlay = document.getElementById('refOverlay');
  if (overlay) overlay.classList.remove('open');
}

export function updateDMMessageTargetDropdown(state) {
  const select = document.getElementById('dmMessageTarget');
  if (!select) return;

  const currentVal = select.value;
  const players = state.combatants.filter(c => c.type === 'p');

  select.innerHTML = '<option value="all">Alle Spieler</option>';
  players.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    select.appendChild(opt);
  });

  // Restore previous selection if still available
  if (players.some(p => p.id === currentVal)) {
    select.value = currentVal;
  } else {
    select.value = 'all';
  }
}

