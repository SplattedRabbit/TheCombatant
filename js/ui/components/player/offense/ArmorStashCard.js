/**
 * @module    ArmorStashCard
 * @summary   Rendert ein Rüstungsteil/Schild im Rucksack/Stash mit Optionen-Drawer (Details).
 * @exports   createStashArmorCard
 * @reads     pc.armors, pc.autoAC
 * @stateOps  updatePCArmorField, togglePCArmorEquip, removePCArmor, setPCAutoAC
 * @depends   state.js (CombatState), ui-shared.js (uiRegistry), armor-data.js (ARMOR_REGISTRY), dialogs.js, PCOffenseHelper.js
 * @notHere   Waffen -> WeaponStashCard.js | Slots -> EquipmentSlotsRenderer.js
 */

import { CombatState } from '../../../../state.js';
import { uiRegistry } from '../../../ui-shared.js';
import { ARMOR_REGISTRY } from '../../../../data/armor-data.js';
import { showCustomConfirm } from '../../dialogs.js';
import { _getRarityStyle, openDrawerIds } from './PCOffenseHelper.js';

export function createStashArmorCard(a, idx, pc) {
  const rStyle = _getRarityStyle(a.enhancement);
  const container = document.createElement('div');
  container.className = 'stash-item-card-container';
  container.style = 'display:flex; flex-direction:column; gap:2px;';

  const card = document.createElement('div');
  card.className = `stash-item-card ${rStyle.glowClass}`;
  card.style.cssText = `
    display: flex;
    flex-direction: column;
    border: ${rStyle.border};
    border-radius: 4px;
    padding: 5px 6px;
    background: ${rStyle.background};
    box-shadow: ${rStyle.boxShadow};
    transition: all 0.15s ease-out;
    position: relative;
    margin-top: ${a.isEquipped ? '6px' : '0'};
  `;

  let typeOptionsHtml = '';
  const sortedArmors = Object.values(ARMOR_REGISTRY).sort((x, y) => x.nameDe.localeCompare(y.nameDe, 'de'));
  sortedArmors.forEach(def => {
    typeOptionsHtml += `<option value="${def.key}" ${a.type === def.key ? 'selected' : ''}>${def.nameDe}</option>`;
  });

  const activeBadge = a.isEquipped ? `
    <span style="position: absolute; top: -6px; left: 8px; font-size: 6px; color: #ffffff; background: #2a6a2a; border-radius: 2px; padding: 1px 4px; font-family: 'IM Fell English SC', serif; font-weight: bold; letter-spacing: 0.3px; pointer-events: none; z-index: 10; box-shadow: 0 1px 2px rgba(0,0,0,0.15);">Ausgerüstet</span>
  ` : '';

  card.innerHTML = `
    ${activeBadge}
    <!-- Row 1: Name and Delete -->
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 4px;">
      <input type="text" value="${a.name}" class="cinput a-name" placeholder="z.B. Kettenhemd" style="font-size: 9px; height: 18px; padding: 0 4px; flex: 1; font-weight: bold; border-color: rgba(200, 169, 110, 0.25);">
      <button class="xbtn delete-btn" style="padding: 0; border: none; background: transparent; font-size: 10px; cursor: pointer; height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; color: var(--red); transition: color 0.15s;" title="Löschen">✕</button>
    </div>
    <!-- Row 2: Type, Enhancement, Equip, Options -->
    <div style="display: flex; align-items: center; gap: 4px;">
      <select class="cinput a-type" style="font-size: 7.5px; padding: 0 2px; height: 16px; flex: 1.2; min-width: 0;">
        ${typeOptionsHtml}
      </select>
      <div style="display: flex; align-items: center; gap: 1px; flex: 0.8; min-width: 0;">
        <span style="font-size: 7.5px; color: var(--inkm);">+</span>
        <input type="number" value="${a.enhancement}" class="cinput a-enhancement cinput-c" placeholder="0" style="font-size: 8px; height: 16px; width: 22px; padding: 0; text-align: center;">
      </div>
      <button class="xbtn equip-btn" style="padding: 0 6px; font-size: 7.5px; font-weight: bold; height: 16px; line-height: 14px; border-color: ${a.isEquipped ? '#b38600' : 'var(--pb)'}; color: ${a.isEquipped ? '#b38600' : 'var(--ink)'}; background: ${a.isEquipped ? 'rgba(200, 169, 110, 0.08)' : 'transparent'}; border-radius: 2px;" title="${a.isEquipped ? 'Ausrüstung ablegen' : 'Ausrüstung anlegen'}">
        ${a.isEquipped ? 'Ablegen' : 'Anlegen'}
      </button>
      <button class="xbtn gear-btn" style="padding: 0; border: none; background: transparent; font-size: 11px; cursor: pointer; height: 16px; width: 18px; display: flex; align-items: center; justify-content: center; color: var(--inkm);" title="Optionen">⚙️</button>
    </div>
  `;

  // Options Drawer
  const isDrawerOpen = openDrawerIds.has(a.id);
  const drawer = document.createElement('div');
  drawer.className = 'armor-details-drawer';
  drawer.style.cssText = `display: ${isDrawerOpen ? 'flex' : 'none'}; background: rgba(200,169,110,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); border-top: none; padding: 4px 6px; font-size: 8px; margin-top: -2px; margin-bottom: 2px; border-radius: 0 0 3px 3px; flex-direction: column; gap: 4px;`;
  drawer.style.display = isDrawerOpen ? 'flex' : 'none';

  drawer.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; width:100%;">
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">RK-Abw.:</span>
        <input type="text" class="cinput a-detail-bonusoverride" value="${a.armorBonusOverride || ''}" placeholder="Standard" style="width: 45px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
      </div>
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">MaxDex-Abw.:</span>
        <input type="text" class="cinput a-detail-maxdexoverride" value="${a.maxDexOverride || ''}" placeholder="Standard" style="width: 45px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
      </div>
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">Malus-Abw.:</span>
        <input type="text" class="cinput a-detail-penaltyoverride" value="${a.checkPenaltyOverride || ''}" placeholder="Standard" style="width: 45px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
      </div>
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">Zauberpatzer-Abw.:</span>
        <input type="text" class="cinput a-detail-asfoverride" value="${a.spellFailureOverride || ''}" placeholder="Standard" style="width: 45px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
        <span style="color:var(--inkm);">%</span>
      </div>
    </div>
  `;

  // Bind Events
  const aNameInput = card.querySelector('.a-name');
  aNameInput.oninput = (e) => {
    const val = e.target.value;
    CombatState.updatePCArmorField(idx, 'name', val);
    const activeSlotTitle = document.querySelector(`.equipped-title-a-${idx}`);
    if (activeSlotTitle) {
      activeSlotTitle.textContent = val;
      activeSlotTitle.title = val;
    }
  };
  aNameInput.onchange = (e) => {
    CombatState.updatePCArmorField(idx, 'name', e.target.value);
    uiRegistry.renderPlayerScreen();
  };
  card.querySelector('.a-type').onchange = (e) => { CombatState.updatePCArmorField(idx, 'type', e.target.value); uiRegistry.renderPlayerScreen(); };
  card.querySelector('.a-enhancement').onchange = (e) => { CombatState.updatePCArmorField(idx, 'enhancement', parseInt(e.target.value) || 0); uiRegistry.renderPlayerScreen(); };
  
  card.querySelector('.equip-btn').onclick = () => {
    const wasEquipped = a.isEquipped;
    const equipping = !wasEquipped;
    CombatState.togglePCArmorEquip(idx);
    
    if (equipping && !wasEquipped && !pc.autoAC) {
      showCustomConfirm(
        "Auto-RK aktivieren?",
        "Möchtest du die automatische Rüstungsklasse-Berechnung (Auto-RK) für diesen Charakter aktivieren?",
        () => {
          CombatState.setPCAutoAC(true);
          uiRegistry.renderPlayerScreen();
        }
      );
    }
    uiRegistry.renderPlayerScreen();
  };

  card.querySelector('.gear-btn').onclick = () => {
    const isVisible = drawer.style.display === 'flex';
    if (isVisible) {
      drawer.style.display = 'none';
      openDrawerIds.delete(a.id);
    } else {
      drawer.style.display = 'flex';
      openDrawerIds.add(a.id);
    }
  };
  card.querySelector('.delete-btn').onclick = () => { CombatState.removePCArmor(idx); uiRegistry.renderPlayerScreen(); };

  drawer.querySelector('.a-detail-bonusoverride').onchange = (e) => { CombatState.updatePCArmorField(idx, 'armorBonusOverride', e.target.value); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.a-detail-maxdexoverride').onchange = (e) => { CombatState.updatePCArmorField(idx, 'maxDexOverride', e.target.value); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.a-detail-penaltyoverride').onchange = (e) => { CombatState.updatePCArmorField(idx, 'checkPenaltyOverride', e.target.value); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.a-detail-asfoverride').onchange = (e) => { CombatState.updatePCArmorField(idx, 'spellFailureOverride', e.target.value); uiRegistry.renderPlayerScreen(); };

  container.appendChild(card);
  container.appendChild(drawer);
  return container;
}
