/**
 * @module    InventoryStashRenderer
 * @summary   Rendert und verwaltet den Rucksack (Waffenkammer, Rüstungskammer) im rechten Panel.
 * @exports   renderRightColumnHtml
 * @reads     pc.weapons, pc.armors, pc.activeShape
 * @stateOps  addPCWeapon, addPCArmor
 * @depends   state.js (CombatState), ui-shared.js (uiRegistry), WeaponStashCard.js, ArmorStashCard.js
 * @notHere   Einzelne Gegenstandskarten -> WeaponStashCard.js, ArmorStashCard.js | Slots -> EquipmentSlotsRenderer.js
 */

import { CombatState } from '../../../../state.js';
import { uiRegistry } from '../../../ui-shared.js';
import { createStashWeaponCard } from './WeaponStashCard.js';
import { createStashArmorCard } from './ArmorStashCard.js';

export function renderRightColumnHtml(panel, pc) {
  if (pc.activeShape !== "none") {
    panel.innerHTML = `
      <div class="phdr"><h2>🎒 Rucksack &amp; Inventar</h2></div>
      <div class="pbody" style="padding: 20px; text-align: center; font-style: italic; color: var(--inkl);">
        In wilder Gestalt (Wild Shape) ist deine Ausrüstung inaktiv.
      </div>
    `;
    return;
  }

  panel.innerHTML = `
    <div class="phdr"><h2>🎒 Rucksack &amp; Inventar</h2></div>
    <div class="pbody" style="display:flex; flex-direction:column; gap:6px;">
      <!-- Weapons Stash -->
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:0.5px solid var(--pb); margin-bottom:4px; padding-bottom:2px;">
          <span style="font-family:'IM Fell English SC', serif; font-size:9px; font-weight:bold; color:var(--red);">⚔️ Waffenkammer</span>
          <button class="btn btn-add-weapon" style="font-family:'IM Fell English SC', serif; font-size:7.5px; padding:1px 5px; height:14px; line-height:1;">➕ Waffe</button>
        </div>
        <div id="pcWeaponsList" style="display:flex; flex-direction:column; gap:4px; max-height:220px; overflow-y:auto;"></div>
      </div>
      
      <!-- Armor Stash -->
      <div style="margin-top:2px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:0.5px solid var(--pb); margin-bottom:4px; padding-bottom:2px;">
          <span style="font-family:'IM Fell English SC', serif; font-size:9px; font-weight:bold; color:var(--red);">🛡️ Rüstungskammer</span>
          <button class="btn btn-add-armor" style="font-family:'IM Fell English SC', serif; font-size:7.5px; padding:1px 5px; height:14px; line-height:1;">➕ Ausrüstung</button>
        </div>
        <div id="pcArmorList" style="display:flex; flex-direction:column; gap:4px; max-height:180px; overflow-y:auto;"></div>
      </div>
    </div>
  `;

  // Bind Add buttons
  panel.querySelector('.btn-add-weapon').onclick = () => {
    CombatState.addPCWeapon();
    uiRegistry.renderPlayerScreen();
  };
  panel.querySelector('.btn-add-armor').onclick = () => {
    CombatState.addPCArmor('padded');
    uiRegistry.renderPlayerScreen();
  };

  // Populate lists
  const offense = document.getElementById('pcOffense');
  let weaponsList = offense ? offense.querySelector('#pcWeaponsList') : null;
  if (!weaponsList) {
    weaponsList = panel.querySelector('#pcWeaponsList');
  }
  if (weaponsList) {
    if (!Array.isArray(pc.weapons)) pc.weapons = [];
    weaponsList.innerHTML = '';
    pc.weapons.forEach((w, idx) => {
      const card = createStashWeaponCard(w, idx, pc);
      weaponsList.appendChild(card);
    });
  }

  let armorList = offense ? offense.querySelector('#pcArmorList') : null;
  if (!armorList) {
    armorList = panel.querySelector('#pcArmorList');
  }
  if (armorList) {
    if (!Array.isArray(pc.armors)) pc.armors = [];
    armorList.innerHTML = '';
    pc.armors.forEach((a, idx) => {
      const card = createStashArmorCard(a, idx, pc);
      armorList.appendChild(card);
    });
  }
}
