/**
 * @module    WeaponStashCard
 * @summary   Rendert eine Waffe im Rucksack/Stash mit Optionen-Drawer (Details) und Ausrüstungs-Entscheidungen.
 * @exports   createStashWeaponCard, showDoubleWeaponDialog
 * @reads     pc.feats, pc.weapons, pc.classes, pc.rangerCombatStyle
 * @stateOps  updatePCWeapon, togglePCWeaponEquip, deletePCWeapon
 * @depends   state.js (CombatState), ui-shared.js (uiRegistry), Weapon.js, AttackEngine.js, dialogs.js, PCOffenseHelper.js
 * @notHere   Rüstung -> ArmorStashCard.js | Slots -> EquipmentSlotsRenderer.js
 */

// @feature:twf
// @feature:doubleweapon

import { CombatState } from '../../../../state.js';
import { uiRegistry } from '../../../ui-shared.js';
import { formatMod } from '../PCUtils.js';
import { showCustomConfirm } from '../../dialogs.js';
import { WeaponRegistry, matchesFeatOption, getCritThreatDisplay } from '../../../../models/Weapon.js';
import { AttackEngine } from '../../../../rules/AttackEngine.js';
import { _getRarityStyle, getWeaponRuntimeId, openDrawerIds } from './PCOffenseHelper.js';

export function createStashWeaponCard(w, idx, pc) {
  const rStyle = _getRarityStyle(w.enhancement);
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
    margin-top: ${w.isEquipped ? '6px' : '0'};
  `;

  let typeOptionsHtml = '';
  const sortedWeapons = Object.values(WeaponRegistry).sort((a, b) => a.nameDe.localeCompare(b.nameDe, 'de'));
  sortedWeapons.forEach(def => {
    typeOptionsHtml += `<option value="${def.key}" ${w.type === def.key ? 'selected' : ''}>${def.nameDe}</option>`;
  });

  const activeBadge = w.isEquipped ? `
    <span style="position: absolute; top: -6px; left: 8px; font-size: 6px; color: #ffffff; background: #2a6a2a; border-radius: 2px; padding: 1px 4px; font-family: 'IM Fell English SC', serif; font-weight: bold; letter-spacing: 0.3px; pointer-events: none; z-index: 10; box-shadow: 0 1px 2px rgba(0,0,0,0.15);">Ausgerüstet</span>
  ` : '';

  const seq = AttackEngine.calculateAttackSequence(pc, w, false);
  const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
  const hasImprovedCritical = pc.feats && pc.feats.some(f => 
    (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
    matchesFeatOption(w, f.option)
  );
  const isDoubleThreat = w.isKeen || hasImprovedCritical;
  const doubledCritDisplay = getCritThreatDisplay(w.crit, isDoubleThreat);

  card.innerHTML = `
    ${activeBadge}
    <!-- Row 1: Name and Delete -->
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 4px;">
      <input type="text" value="${w.name}" class="cinput w-name" placeholder="z.B. Dolch" style="font-size: 9px; height: 18px; padding: 0 4px; flex: 1; font-weight: bold; border-color: rgba(200, 169, 110, 0.25);">
      <button class="xbtn delete-btn" style="padding: 0; border: none; background: transparent; font-size: 10px; cursor: pointer; height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; color: var(--red); transition: color 0.15s;" title="Löschen">✕</button>
    </div>
    <!-- Row 2: Type, Enhancement, Hand, Equip, Options -->
    <div style="display: flex; align-items: center; gap: 4px;">
      <select class="cinput w-type" style="font-size: 7.5px; padding: 0 2px; height: 16px; flex: 1.2; min-width: 0;">
        ${typeOptionsHtml}
      </select>
      <div style="display: flex; align-items: center; gap: 1px; flex: 0.6; min-width: 0;">
        <span style="font-size: 7.5px; color: var(--inkm);">+</span>
        <input type="number" value="${w.enhancement}" class="cinput w-enhancement cinput-c" placeholder="0" style="font-size: 8px; height: 16px; width: 20px; padding: 0; text-align: center;">
      </div>
      ${w.grip === '2h' ? `
        <select class="cinput w-hand-select" disabled style="font-size: 7.5px; padding: 0 1px; height: 16px; flex: 1.1; min-width: 0; opacity: 0.65; cursor: not-allowed; background: rgba(200, 169, 110, 0.05); text-align: center;">
          <option>Zweihändig</option>
        </select>
      ` : w.grip === 'rng' ? `
        <select class="cinput w-hand-select" disabled style="font-size: 7.5px; padding: 0 1px; height: 16px; flex: 1.1; min-width: 0; opacity: 0.65; cursor: not-allowed; background: rgba(200, 169, 110, 0.05); text-align: center;">
          <option>Fernkampf</option>
        </select>
      ` : `
        <select class="cinput w-hand-select" style="font-size: 7.5px; padding: 0 1px; height: 16px; flex: 1.1; min-width: 0;">
          <option value="main" ${w.hand !== 'off' ? 'selected' : ''}>Haupthand</option>
          <option value="off" ${w.hand === 'off' ? 'selected' : ''}>Nebenhand</option>
        </select>
      `}
      <button class="xbtn equip-btn" style="padding: 0 6px; font-size: 7.5px; font-weight: bold; height: 16px; line-height: 14px; border-color: ${w.isEquipped ? '#b38600' : 'var(--pb)'}; color: ${w.isEquipped ? '#b38600' : 'var(--ink)'}; background: ${w.isEquipped ? 'rgba(200, 169, 110, 0.08)' : 'transparent'}; border-radius: 2px;" title="${w.isEquipped ? 'Ablegen' : 'Anlegen'}">
        ${w.isEquipped ? 'Ablegen' : 'Anlegen'}
      </button>
      <button class="xbtn gear-btn" style="padding: 0; border: none; background: transparent; font-size: 11px; cursor: pointer; height: 16px; width: 18px; display: flex; align-items: center; justify-content: center; color: var(--inkm);" title="Optionen">⚙️</button>
    </div>
    <div style="display: none;">
      <span class="roll-atk-btn">ANGRIFF (${formatMod(stdAtkObj.atkTotal)}) 🎲</span>
      <span class="roll-dmg-btn">DMG (${formatMod(stdAtkObj.dmgTotal)})</span>
      <span>${doubledCritDisplay}</span>
    </div>
  `;

  // Options Drawer
  const wId = w.id || getWeaponRuntimeId(w);
  const isDrawerOpen = openDrawerIds.has(wId);
  const drawer = document.createElement('div');
  drawer.className = 'weapon-details-drawer';
  drawer.style.cssText = `display: ${isDrawerOpen ? 'flex' : 'none'}; background: rgba(200,169,110,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); border-top: none; padding: 4px 6px; font-size: 8px; margin-top: -2px; margin-bottom: 2px; border-radius: 0 0 3px 3px; flex-direction: column; gap: 4px;`;
  drawer.style.display = isDrawerOpen ? 'flex' : 'none';
  
  const typeDef = WeaponRegistry[w.type] || WeaponRegistry.longsword;

  drawer.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; width:100%;">
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">Zusatz-Atk:</span>
        <input type="text" class="cinput w-detail-atk" value="${w.attackBonus || ''}" placeholder="+0" style="width: 32px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
      </div>
      <label style="display:flex; align-items:center; gap:3px; cursor:pointer; color:var(--inkm); margin: 0;">
        <input type="checkbox" class="w-detail-keen" ${w.isKeen ? 'checked' : ''} style="margin:0; width:10px; height:10px;"> Scharf (Keen)
      </label>
      <div style="display:flex; align-items:center; gap:3px; flex: 1; min-width: 150px;">
        <span style="color:var(--inkl); flex-shrink:0;">Zusatz-Schaden:</span>
        <select class="cinput w-detail-extradmg-dice" style="font-size:7.5px; height:14px; padding:0 1px; width:45px; flex-shrink:0;">
          <option value="" ${w.extraDamageDice === '' ? 'selected' : ''}>Kein</option>
          <option value="1w2" ${w.extraDamageDice === '1w2' ? 'selected' : ''}>1w2</option>
          <option value="1w3" ${w.extraDamageDice === '1w3' ? 'selected' : ''}>1w3</option>
          <option value="1w4" ${w.extraDamageDice === '1w4' ? 'selected' : ''}>1w4</option>
          <option value="1w6" ${w.extraDamageDice === '1w6' ? 'selected' : ''}>1w6</option>
          <option value="1w8" ${w.extraDamageDice === '1w8' ? 'selected' : ''}>1w8</option>
          <option value="1w10" ${w.extraDamageDice === '1w10' ? 'selected' : ''}>1w10</option>
          <option value="1w12" ${w.extraDamageDice === '1w12' ? 'selected' : ''}>1w12</option>
          <option value="2w4" ${w.extraDamageDice === '2w4' ? 'selected' : ''}>2w4</option>
          <option value="2w6" ${w.extraDamageDice === '2w6' ? 'selected' : ''}>2w6</option>
          <option value="2w8" ${w.extraDamageDice === '2w8' ? 'selected' : ''}>2w8</option>
          <option value="2w10" ${w.extraDamageDice === '2w10' ? 'selected' : ''}>2w10</option>
          <option value="3w6" ${w.extraDamageDice === '3w6' ? 'selected' : ''}>3w6</option>
          <option value="3w8" ${w.extraDamageDice === '3w8' ? 'selected' : ''}>3w8</option>
          <option value="4w6" ${w.extraDamageDice === '4w6' ? 'selected' : ''}>4w6</option>
        </select>
        <select class="cinput w-detail-extradmg-type" style="font-size:7.5px; height:14px; padding:0 1px; flex:1; min-width:0;">
          <option value="" ${w.extraDamageType === '' ? 'selected' : ''}>—</option>
          <option value="Feuer" ${w.extraDamageType === 'Feuer' ? 'selected' : ''}>Feuer</option>
          <option value="Kälte" ${w.extraDamageType === 'Kälte' ? 'selected' : ''}>Kälte</option>
          <option value="Elektrizität" ${w.extraDamageType === 'Elektrizität' ? 'selected' : ''}>Elektrizität</option>
          <option value="Säure" ${w.extraDamageType === 'Säure' ? 'selected' : ''}>Säure</option>
          <option value="Schall" ${w.extraDamageType === 'Schall' ? 'selected' : ''}>Schall</option>
          <option value="Wucht" ${w.extraDamageType === 'Wucht' ? 'selected' : ''}>Wucht</option>
          <option value="Stich" ${w.extraDamageType === 'Stich' ? 'selected' : ''}>Stich</option>
          <option value="Schnitt" ${w.extraDamageType === 'Schnitt' ? 'selected' : ''}>Schnitt</option>
          <option value="Kraft" ${w.extraDamageType === 'Kraft' ? 'selected' : ''}>Kraft</option>
          <option value="Gottgeweiht" ${w.extraDamageType === 'Gottgeweiht' ? 'selected' : ''}>Gottgeweiht</option>
        </select>
      </div>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; width:100%;">
      ${typeDef.isComposite ? `
        <div style="display:flex; align-items:center; gap:2px;">
          <span style="color:var(--red); font-weight:bold;">Stärkelimit:</span>
          <input type="number" class="cinput w-detail-strengthrating" value="${w.strengthRating || 0}" min="0" style="width: 32px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
        </div>
      ` : ''}
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">Grip-Abw.:</span>
        <select class="cinput w-detail-gripoverride" style="font-size:7.5px; height:14px; padding:0 1px;">
          <option value="" ${w.gripOverride === '' ? 'selected' : ''}>Standard</option>
          <option value="1h" ${w.gripOverride === '1h' ? 'selected' : ''}>1-Hand</option>
          <option value="2h" ${w.gripOverride === '2h' ? 'selected' : ''}>2-Hand</option>
          <option value="sec" ${w.gripOverride === 'sec' ? 'selected' : ''}>Schildh</option>
          <option value="rng" ${w.gripOverride === 'rng' ? 'selected' : ''}>Fernk</option>
          <option value="unarmed" ${w.gripOverride === 'unarmed' ? 'selected' : ''}>Waffenlos</option>
        </select>
      </div>
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">Schadens-Abw.:</span>
        <select class="cinput w-detail-diceoverride" style="font-size:7.5px; height:14px; padding:0 1px;">
          <option value="" ${w.damageDiceOverride === '' ? 'selected' : ''}>Standard</option>
          <option value="1w2" ${w.damageDiceOverride === '1w2' ? 'selected' : ''}>1w2</option>
          <option value="1w3" ${w.damageDiceOverride === '1w3' ? 'selected' : ''}>1w3</option>
          <option value="1w4" ${w.damageDiceOverride === '1w4' ? 'selected' : ''}>1w4</option>
          <option value="1w6" ${w.damageDiceOverride === '1w6' ? 'selected' : ''}>1w6</option>
          <option value="1w8" ${w.damageDiceOverride === '1w8' ? 'selected' : ''}>1w8</option>
          <option value="1w10" ${w.damageDiceOverride === '1w10' ? 'selected' : ''}>1w10</option>
          <option value="1w12" ${w.damageDiceOverride === '1w12' ? 'selected' : ''}>1w12</option>
          <option value="2w4" ${w.damageDiceOverride === '2w4' ? 'selected' : ''}>2w4</option>
          <option value="2w6" ${w.damageDiceOverride === '2w6' ? 'selected' : ''}>2w6</option>
          <option value="2w8" ${w.damageDiceOverride === '2w8' ? 'selected' : ''}>2w8</option>
          <option value="2w10" ${w.damageDiceOverride === '2w10' ? 'selected' : ''}>2w10</option>
          <option value="3w6" ${w.damageDiceOverride === '3w6' ? 'selected' : ''}>3w6</option>
          <option value="3w8" ${w.damageDiceOverride === '3w8' ? 'selected' : ''}>3w8</option>
          <option value="4w6" ${w.damageDiceOverride === '4w6' ? 'selected' : ''}>4w6</option>
        </select>
      </div>
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">Krit-Abw.:</span>
        <input type="text" list="crit-options" class="cinput w-detail-critoverride" value="${w.critOverride || ''}" placeholder="Standard" style="width: 70px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
      </div>
    </div>
  `;

  // Bind Events
  const wNameInput = card.querySelector('.w-name');
  wNameInput.oninput = (e) => {
    const val = e.target.value;
    CombatState.updatePCWeapon(idx, 'name', val);
    const activeSlotTitle = document.querySelector(`.equipped-title-w-${idx}`);
    if (activeSlotTitle) {
      activeSlotTitle.textContent = val;
      activeSlotTitle.title = val;
    }
  };
  wNameInput.onchange = (e) => {
    CombatState.updatePCWeapon(idx, 'name', e.target.value);
    uiRegistry.renderPlayerScreen();
  };
  card.querySelector('.w-type').onchange = (e) => { CombatState.updatePCWeapon(idx, 'type', e.target.value); uiRegistry.renderPlayerScreen(); };
  card.querySelector('.w-enhancement').onchange = (e) => { CombatState.updatePCWeapon(idx, 'enhancement', parseInt(e.target.value) || 0); uiRegistry.renderPlayerScreen(); };
  
  const handSelect = card.querySelector('.w-hand-select');
  if (handSelect) {
    handSelect.onchange = (e) => {
      const val = e.target.value;
      if (w.isEquipped) {
        CombatState.togglePCWeaponEquip(idx);
      }
      CombatState.updatePCWeapon(idx, 'hand', val);
      uiRegistry.renderPlayerScreen();
    };
  }

  card.querySelector('.equip-btn').onclick = () => {
    if (w.isEquipped) {
      CombatState.togglePCWeaponEquip(idx);
      uiRegistry.renderPlayerScreen();
      return;
    }
    
    // Warn if trying to equip off-hand weapon without TWF feats
    if (w.hand === 'off') {
      const hasTWF = pc.feats && (
        pc.feats.some(f => f.id === 'two_weapon_fighting') ||
        (() => {
          const armor = pc.getEquippedArmor ? pc.getEquippedArmor() : null;
          const speedCategory = armor ? armor.speedCategory : '';
          const isWearingMediumOrHeavy = speedCategory === 'medium' || speedCategory === 'heavy';
          if (!isWearingMediumOrHeavy) {
            const rangerClass = Array.isArray(pc.classes) && pc.classes.find(c => c.classType === 'ranger');
            const rangerLvl = rangerClass ? rangerClass.level : 0;
            return rangerLvl >= 2 && pc.rangerCombatStyle === 'twoweapon';
          }
          return false;
        })()
      );
      if (!hasTWF) {
        showCustomConfirm(
          "Kein Zwei-Waffen-Kampf",
          "Dein Charakter besitzt nicht das Talent 'Zwei-Waffen-Kampf'. Das Führen einer Waffe in der Nebenhand führt zu schweren Abzügen auf Angriffe (-6/-10 oder -4/-8). Trotzdem fortfahren?",
          () => {
            if (typeDef.isDouble) {
              showDoubleWeaponDialog(idx);
            } else {
              CombatState.togglePCWeaponEquip(idx);
              uiRegistry.renderPlayerScreen();
            }
          }
        );
        return;
      }
    }

    if (typeDef.isDouble) {
      showDoubleWeaponDialog(idx);
      return;
    }
    CombatState.togglePCWeaponEquip(idx);
    uiRegistry.renderPlayerScreen();
  };
  
  card.querySelector('.gear-btn').onclick = () => {
    const isVisible = drawer.style.display === 'flex';
    if (isVisible) {
      drawer.style.display = 'none';
      openDrawerIds.delete(wId);
    } else {
      drawer.style.display = 'flex';
      openDrawerIds.add(wId);
    }
  };
  card.querySelector('.delete-btn').onclick = () => { CombatState.deletePCWeapon(idx); uiRegistry.renderPlayerScreen(); };

  drawer.querySelector('.w-detail-atk').onchange = (e) => { CombatState.updatePCWeapon(idx, 'attackBonus', e.target.value); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.w-detail-keen').onchange = (e) => { CombatState.updatePCWeapon(idx, 'isKeen', e.target.checked); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.w-detail-extradmg-dice').onchange = (e) => { CombatState.updatePCWeapon(idx, 'extraDamageDice', e.target.value); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.w-detail-extradmg-type').onchange = (e) => { CombatState.updatePCWeapon(idx, 'extraDamageType', e.target.value); uiRegistry.renderPlayerScreen(); };

  const strRatingInput = drawer.querySelector('.w-detail-strengthrating');
  if (strRatingInput) {
    strRatingInput.onchange = (e) => { CombatState.updatePCWeapon(idx, 'strengthRating', parseInt(e.target.value) || 0); uiRegistry.renderPlayerScreen(); };
  }

  drawer.querySelector('.w-detail-gripoverride').onchange = (e) => { CombatState.updatePCWeapon(idx, 'gripOverride', e.target.value); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.w-detail-diceoverride').onchange = (e) => { CombatState.updatePCWeapon(idx, 'damageDiceOverride', e.target.value); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.w-detail-critoverride').onchange = (e) => { CombatState.updatePCWeapon(idx, 'critOverride', e.target.value); uiRegistry.renderPlayerScreen(); };

  container.appendChild(card);
  container.appendChild(drawer);
  return container;
}

export function showDoubleWeaponDialog(idx) {
  const overlay = document.createElement('div');
  overlay.id = 'doubleWeaponOverlay';
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

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 20px;
      width: 280px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <div style="font-size: 13px; color: var(--red); font-weight: bold; margin-bottom: 4px;">
        Kampfstab ausrüsten
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 5px 0 10px;">
      
      <div style="font-family: 'Crimson Text', serif; font-size: 11px; color: var(--ink); line-height: 1.4; margin-bottom: 12px; font-weight: 500; text-align: left;">
        Wie soll dieser Kampfstab geführt werden?
        <ul style="margin: 6px 0; padding-left: 14px;">
          <li><strong>Zweihändig:</strong> Als Einzelwaffe geführt (1.5x Stärkebonus auf Schaden).</li>
          <li><strong>Doppelwaffe:</strong> Mit beiden Enden geführt (Hauptseite 1.0x Stärke, Nebenseite 0.5x Stärke als leichte Waffe).</li>
        </ul>
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <button class="btn btn-p opt-twohanded" style="font-family: 'IM Fell English SC', serif; font-size: 8.5px; padding: 4px; cursor: pointer;">Zweihändig (Einzelwaffe)</button>
        <button class="btn btn-p opt-double" style="font-family: 'IM Fell English SC', serif; font-size: 8.5px; padding: 4px; cursor: pointer;">Doppelwaffe (Beide Enden)</button>
        <button class="btn opt-cancel" style="font-family: 'IM Fell English SC', serif; font-size: 8.5px; padding: 4px; cursor: pointer; border: 1px solid var(--pb); background: transparent; color: var(--inkl);">Abbrechen</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect();
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.querySelector('.opt-twohanded').onclick = () => {
    dismiss();
    CombatState.updatePCWeapon(idx, 'isDoubleWielded', false);
    CombatState.togglePCWeaponEquip(idx);
    uiRegistry.renderPlayerScreen();
  };

  overlay.querySelector('.opt-double').onclick = () => {
    dismiss();
    CombatState.updatePCWeapon(idx, 'isDoubleWielded', true);
    CombatState.togglePCWeaponEquip(idx);
    uiRegistry.renderPlayerScreen();
  };

  overlay.querySelector('.opt-cancel').onclick = dismiss;
  overlay.onclick = (e) => { if (e.target === overlay) dismiss(); };
}
