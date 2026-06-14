/**
 * @module    EquipmentSlotsRenderer
 * @summary   Rendert und bindet Events f├╝r die aktiven Ausr├╝stungsslots (Haupthand, Nebenhand, R├╝stung).
 * @exports   renderEquipmentSlotsHtml, bindEquipmentSlotsEvents
 * @reads     pc.weapons, pc.armors, pc.activeShape, pc.feats, pc.isTotalDefense, pc.classes, pc.isSneakAttacking
 * @stateOps  togglePCWeaponEquip, togglePCArmorEquip
 * @depends   state.js (CombatState), ui-shared.js (uiRegistry), Weapon.js, AttackEngine.js, dialogs.js, PCOffenseHelper.js
 * @notHere   Rucksack -> InventoryStashRenderer.js | Kampfbalken -> CombatSettingsRenderer.js
 */

import { CombatState } from '../../../../state.js';
import { uiRegistry } from '../../../ui-shared.js';
import { formatMod } from '../PCUtils.js';
import { showAttackChoiceDialog, showDamageChoiceDialog, showRollBreakdown } from '../../dialogs.js';
import { matchesFeatOption, getCritThreatDisplay } from '../../../../models/Weapon.js';
import { AttackEngine } from '../../../../rules/AttackEngine.js';
import { _getRarityStyle } from './PCOffenseHelper.js';

export function renderEquipmentSlotsHtml(pc, babVal, paPenalty, cePenalty, hasPowerAttack, hasCombatExpertise) {
  const equippedWeapons = Array.isArray(pc.weapons) ? pc.weapons.filter(w => w.isEquipped) : [];
  const mainHandWeapon = equippedWeapons.find(w => w.hand === 'main') || equippedWeapons.find(w => w.hand !== 'off') || null;
  let offHandWeapon = equippedWeapons.find(w => w.hand === 'off' || w.grip === 'sec') || null;
  let isDoubleWielded = false;
  if (mainHandWeapon && mainHandWeapon.isDoubleWielded) {
    offHandWeapon = mainHandWeapon;
    isDoubleWielded = true;
  }
  
  const equippedArmor = Array.isArray(pc.armors) ? pc.armors.find(a => a.isEquipped && !a.isShield) : null;
  const equippedShield = Array.isArray(pc.armors) ? pc.armors.find(a => a.isEquipped && a.isShield) : null;

  const mainStyle = _getRarityStyle(mainHandWeapon ? mainHandWeapon.enhancement : 0);
  const armorStyle = _getRarityStyle(equippedArmor ? equippedArmor.enhancement : 0);
  const offStyle = _getRarityStyle(equippedShield ? equippedShield.enhancement : (offHandWeapon ? offHandWeapon.enhancement : 0));

  // Haupthand Slot
  let mainHandHtml = `
    <div style="font-size:14px; color:var(--inkl); margin-bottom:1px; opacity:0.6;">ÔÜö´©Å</div>
    <div style="font-size:7.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif;">Haupthand</div>
    <div style="font-size:7px; color:var(--inkm); font-style:italic;">(Unbewaffnet)</div>
  `;
  if (mainHandWeapon) {
    const seq = AttackEngine.calculateAttackSequence(pc, mainHandWeapon, false, {
      smite: pc.isSmiteActive,
      favoredEnemy: pc.isFavoredEnemyActive,
      sneakAttack: pc.isSneakAttacking
    });
    const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
    const hasImprovedCritical = pc.feats && pc.feats.some(f => 
      (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
      matchesFeatOption(mainHandWeapon, f.option)
    );
    const isDoubleThreat = mainHandWeapon.isKeen || hasImprovedCritical;
    const doubledCritDisplay = getCritThreatDisplay(mainHandWeapon.crit, isDoubleThreat);
    const dmgDice = pc.getWeaponDamageDice(mainHandWeapon) || '1w6';
    const extraDamage = mainHandWeapon.extraDamage ? ` + ${mainHandWeapon.extraDamage}` : '';
    const handSelectHtml = mainHandWeapon.grip !== '2H' ? `
      <select class="cinput weapon-hand-select" data-idx="${pc.weapons.indexOf(mainHandWeapon)}" style="font-size: 7px; padding: 0 1px; height: 12px; line-height: 1; border-radius: 1px; border: 0.5px solid var(--pb); outline: none; background: white; color: var(--ink); margin-top: 1px;">
        <option value="main" selected>Haupthand</option>
        <option value="off">Nebenhand</option>
      </select>
    ` : '';

    mainHandHtml = `
      <button class="unequip-slot-btn mainhand-unequip" data-idx="${pc.weapons.indexOf(mainHandWeapon)}" style="position:absolute; top:2px; right:4px; border:none; background:transparent; font-size:7.5px; cursor:pointer; color:var(--red); padding:0;" title="Ablegen">Ô£ò</button>
      <div style="font-size:6.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif; margin-bottom:1px; opacity:0.8;">Haupthand</div>
      <div class="equipped-title-w-${pc.weapons.indexOf(mainHandWeapon)}" style="font-family:'Crimson Text',serif; font-size:9.5px; font-weight:bold; color:var(--red); text-shadow:0 0 1px rgba(139,26,26,0.1); overflow:hidden; white-space:nowrap; text-overflow:ellipsis; width:100%;" title="${mainHandWeapon.name}">${mainHandWeapon.name}</div>
      <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin: 1px 0 3px;">
        <div style="font-size:7px; color:var(--inkm); overflow:hidden; white-space:nowrap; text-overflow:ellipsis;" title="${dmgDice}${extraDamage} ÔÇó ${doubledCritDisplay}">${dmgDice}${extraDamage} ÔÇó ${doubledCritDisplay}</div>
        ${handSelectHtml}
      </div>
      <div style="display:flex; gap:2px; width:100%; justify-content:center; align-items:center;">
        <button class="xbtn xbtn-dmg roll-atk-btn" ${pc.isTotalDefense ? 'disabled' : ''} style="padding:1px 2px; font-size:6.5px; font-weight:bold; flex:1; white-space:nowrap; height:15px; line-height:1; ${pc.isTotalDefense ? 'opacity:0.4; cursor:not-allowed;' : ''}" title="Angriff ausf├╝hren">
          ATK (${formatMod(stdAtkObj.atkTotal)}) ­ƒÄ▓
        </button>
        <button class="xbtn xbtn-heal roll-dmg-btn" ${pc.isTotalDefense ? 'disabled' : ''} style="padding:1px 2px; font-size:6.5px; font-weight:bold; flex:1; border-color:#2a6a2a; color:#1a4a1a; white-space:nowrap; height:15px; line-height:1; ${pc.isTotalDefense ? 'opacity:0.4; cursor:not-allowed;' : ''}">DMG (${formatMod(stdAtkObj.dmgTotal)})</button>
      </div>
    `;
  }

  // R├╝stung Slot
  let armorHtml = `
    <div style="font-size:14px; color:var(--inkl); margin-bottom:1px; opacity:0.6;">­ƒæò</div>
    <div style="font-size:7.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif;">R├╝stung</div>
    <div style="font-size:7px; color:var(--inkm); font-style:italic;">(Keine)</div>
  `;
  if (equippedArmor) {
    const maxDexDisplay = equippedArmor.maxDex !== null ? equippedArmor.maxDex : 'ÔÇö';
    armorHtml = `
      <button class="unequip-slot-btn armor-unequip" data-idx="${pc.armors.indexOf(equippedArmor)}" style="position:absolute; top:2px; right:4px; border:none; background:transparent; font-size:7.5px; cursor:pointer; color:var(--red); padding:0;" title="Ablegen">Ô£ò</button>
      <div style="font-size:6.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif; margin-bottom:1px; opacity:0.8;">R├╝stung</div>
      <div class="equipped-title-a-${pc.armors.indexOf(equippedArmor)}" style="font-family:'Crimson Text',serif; font-size:9.5px; font-weight:bold; color:var(--red); text-shadow:0 0 1px rgba(139,26,26,0.1); overflow:hidden; white-space:nowrap; text-overflow:ellipsis; width:100%;" title="${equippedArmor.name || equippedArmor.typeDef?.nameDe || 'R├╝stung'}">${equippedArmor.name || equippedArmor.typeDef?.nameDe || 'R├╝stung'}</div>
      <div style="font-size:7.5px; color:var(--inkm); margin-top:2px; line-height:1.2;">+${equippedArmor.armorBonus} RK</div>
      <div style="font-size:6.5px; color:var(--inkm); line-height:1;">Dex-Lim: ${maxDexDisplay} | Malus: -${equippedArmor.checkPenalty}</div>
    `;
  }

  // Nebenhand Slot
  let offHandHtml = `
    <div style="font-size:14px; color:var(--inkl); margin-bottom:1px; opacity:0.6;">­ƒøí´©Å</div>
    <div style="font-size:7.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif;">Nebenhand</div>
    <div style="font-size:7px; color:var(--inkm); font-style:italic;">(Leer)</div>
  `;
  if (equippedShield) {
    offHandHtml = `
      <button class="unequip-slot-btn shield-unequip" data-idx="${pc.armors.indexOf(equippedShield)}" style="position:absolute; top:2px; right:4px; border:none; background:transparent; font-size:7.5px; cursor:pointer; color:var(--red); padding:0;" title="Ablegen">Ô£ò</button>
      <div style="font-size:6.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif; margin-bottom:1px; opacity:0.8;">Nebenhand</div>
      <div class="equipped-title-a-${pc.armors.indexOf(equippedShield)}" style="font-family:'Crimson Text',serif; font-size:9.5px; font-weight:bold; color:var(--red); text-shadow:0 0 1px rgba(139,26,26,0.1); overflow:hidden; white-space:nowrap; text-overflow:ellipsis; width:100%;" title="${equippedShield.name || equippedShield.typeDef?.nameDe || 'Schild'}">${equippedShield.name || equippedShield.typeDef?.nameDe || 'Schild'}</div>
      <div style="font-size:7.5px; color:var(--inkm); margin-top:2px; line-height:1.2;">+${equippedShield.armorBonus} RK (Schild)</div>
      <div style="font-size:6.5px; color:var(--inkm); line-height:1;">Malus: -${equippedShield.checkPenalty}</div>
    `;
  } else if (offHandWeapon) {
    const seq = AttackEngine.calculateAttackSequence(pc, offHandWeapon, false, {
      isOffhandAttack: true,
      smite: pc.isSmiteActive,
      favoredEnemy: pc.isFavoredEnemyActive,
      sneakAttack: pc.isSneakAttacking
    });
    const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
    const hasImprovedCritical = pc.feats && pc.feats.some(f => 
      (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
      matchesFeatOption(offHandWeapon, f.option)
    );
    const isDoubleThreat = offHandWeapon.isKeen || hasImprovedCritical;
    const doubledCritDisplay = getCritThreatDisplay(offHandWeapon.crit, isDoubleThreat);
    const dmgDice = pc.getWeaponDamageDice(offHandWeapon) || '1w6';
    const extraDamage = offHandWeapon.extraDamage ? ` + ${offHandWeapon.extraDamage}` : '';
    const handSelectHtml = (offHandWeapon.grip !== '2H' && !isDoubleWielded) ? `
      <select class="cinput weapon-hand-select" data-idx="${pc.weapons.indexOf(offHandWeapon)}" style="font-size: 7px; padding: 0 1px; height: 12px; line-height: 1; border-radius: 1px; border: 0.5px solid var(--pb); outline: none; background: white; color: var(--ink); margin-top: 1px;">
        <option value="main">Haupthand</option>
        <option value="off" selected>Nebenhand</option>
      </select>
    ` : '';
    
    const offhandLabel = isDoubleWielded ? 'Nebenhand (Nebenseite)' : 'Nebenhand';

    offHandHtml = `
      <button class="unequip-slot-btn offhand-unequip" data-idx="${pc.weapons.indexOf(offHandWeapon)}" style="position:absolute; top:2px; right:4px; border:none; background:transparent; font-size:7.5px; cursor:pointer; color:var(--red); padding:0;" title="Ablegen">Ô£ò</button>
      <div style="font-size:6.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif; margin-bottom:1px; opacity:0.8;">${offhandLabel}</div>
      <div class="equipped-title-w-${pc.weapons.indexOf(offHandWeapon)}" style="font-family:'Crimson Text',serif; font-size:9.5px; font-weight:bold; color:var(--red); text-shadow:0 0 1px rgba(139,26,26,0.1); overflow:hidden; white-space:nowrap; text-overflow:ellipsis; width:100%;" title="${offHandWeapon.name}">${isDoubleWielded ? offHandWeapon.name + ' (Nebenseite)' : offHandWeapon.name}</div>
      <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin: 1px 0 3px;">
        <div style="font-size:7px; color:var(--inkm); overflow:hidden; white-space:nowrap; text-overflow:ellipsis;" title="${dmgDice}${extraDamage} ÔÇó ${doubledCritDisplay}">${dmgDice}${extraDamage} ÔÇó ${doubledCritDisplay}</div>
        ${handSelectHtml}
      </div>
      <div style="display:flex; gap:2px; width:100%; justify-content:center; align-items:center;">
        <button class="xbtn xbtn-dmg roll-atk-btn" ${pc.isTotalDefense ? 'disabled' : ''} style="padding:1px 2px; font-size:6.5px; font-weight:bold; flex:1; white-space:nowrap; height:15px; line-height:1; ${pc.isTotalDefense ? 'opacity:0.4; cursor:not-allowed;' : ''}" title="Angriff ausf├╝hren">
          ATK (${formatMod(stdAtkObj.atkTotal)}) ­ƒÄ▓
        </button>
        <button class="xbtn xbtn-heal roll-dmg-btn" ${pc.isTotalDefense ? 'disabled' : ''} style="padding:1px 2px; font-size:6.5px; font-weight:bold; flex:1; border-color:#2a6a2a; color:#1a4a1a; white-space:nowrap; height:15px; line-height:1; ${pc.isTotalDefense ? 'opacity:0.4; cursor:not-allowed;' : ''}">DMG (${formatMod(stdAtkObj.dmgTotal)})</button>
      </div>
    `;
  }

  let activeSlotsAreaHtml = `
    <div style="display:flex; justify-content:center; gap:8px; margin-bottom:10px; padding:6px; background:rgba(200, 169, 110, 0.04); border:0.5px solid var(--pb); border-radius:4px;">
      <!-- Main Hand Slot -->
      <div class="arpg-slot main-hand-slot ${mainStyle.glowClass}" style="position:relative; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:82px; border:${mainStyle.border}; border-radius:4px; padding:5px 6px; text-align:center; background:${mainStyle.background}; box-shadow:${mainStyle.boxShadow}; transition:all 0.15s ease-out;">
        ${mainHandHtml}
      </div>
      <!-- Armor Slot -->
      <div class="arpg-slot armor-slot ${armorStyle.glowClass}" style="position:relative; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:82px; border:${armorStyle.border}; border-radius:4px; padding:5px 6px; text-align:center; background:${armorStyle.background}; box-shadow:${armorStyle.boxShadow}; transition:all 0.15s ease-out;">
        ${armorHtml}
      </div>
      <!-- Off Hand Slot -->
      <div class="arpg-slot off-hand-slot ${offStyle.glowClass}" style="position:relative; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:82px; border:${offStyle.border}; border-radius:4px; padding:5px 6px; text-align:center; background:${offStyle.background}; box-shadow:${offStyle.boxShadow}; transition:all 0.15s ease-out;">
        ${offHandHtml}
      </div>
    </div>
  `;

  if (pc.activeShape !== "none") {
    activeSlotsAreaHtml = `
      <div style="background:rgba(200, 169, 110, 0.04); border:0.5px solid var(--pb); border-radius:4px; padding:8px 10px; text-align:center; font-style:italic; color:var(--inkl); font-family:'IM Fell English SC', serif; font-size:9px; margin-bottom:8px;">
        In wilder Gestalt (Wild Shape) ist deine normale Ausr├╝stung inaktiv. Verwende deine nat├╝rlichen Waffen.
      </div>
      <div style="font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--inkl); padding-bottom:2px; border-bottom:0.5px solid var(--pb); margin-bottom:4px; font-weight:bold;">
        ­ƒÉ¥ Nat├╝rliche Angriffe
      </div>
      <div id="pcNaturalAttacksList" style="display:flex; flex-direction:column; gap:4px; margin-bottom:10px;"></div>
    `;
  }

  return `
    <div class="phdr"><h2>ÔÜö´©Å Aktive Ausr├╝stung &amp; Kampf</h2></div>
    <div class="pbody" style="display:flex; flex-direction:column; gap:4px;">
      <!-- Visual Equipment Slots -->
      ${activeSlotsAreaHtml}
  `;
}

export function bindEquipmentSlotsEvents(offense, pc, babVal) {
  const equippedWeapons = Array.isArray(pc.weapons) ? pc.weapons.filter(w => w.isEquipped) : [];
  const mainHandWeapon = equippedWeapons.find(w => w.hand === 'main') || equippedWeapons.find(w => w.hand !== 'off') || null;
  let offHandWeapon = equippedWeapons.find(w => w.hand === 'off' || w.grip === 'sec') || null;
  let isDoubleWielded = false;
  if (mainHandWeapon && mainHandWeapon.isDoubleWielded) {
    offHandWeapon = mainHandWeapon;
    isDoubleWielded = true;
  }
  
  const equippedArmor = Array.isArray(pc.armors) ? pc.armors.find(a => a.isEquipped && !a.isShield) : null;
  const equippedShield = Array.isArray(pc.armors) ? pc.armors.find(a => a.isEquipped && a.isShield) : null;

  const mainUnequip = offense.querySelector('.mainhand-unequip');
  if (mainUnequip) {
    mainUnequip.onclick = () => {
      const idx = pc.weapons.indexOf(mainHandWeapon);
      CombatState.togglePCWeaponEquip(idx);
      uiRegistry.renderPlayerScreen();
    };
  }

  const offUnequip = offense.querySelector('.offhand-unequip');
  if (offUnequip) {
    offUnequip.onclick = () => {
      const idx = pc.weapons.indexOf(offHandWeapon);
      CombatState.togglePCWeaponEquip(idx);
      uiRegistry.renderPlayerScreen();
    };
  }

  const armorUnequip = offense.querySelector('.armor-unequip');
  if (armorUnequip) {
    armorUnequip.onclick = () => {
      const idx = pc.armors.indexOf(equippedArmor);
      CombatState.togglePCArmorEquip(idx);
      uiRegistry.renderPlayerScreen();
    };
  }

  const shieldUnequip = offense.querySelector('.shield-unequip');
  if (shieldUnequip) {
    shieldUnequip.onclick = () => {
      const idx = pc.armors.indexOf(equippedShield);
      CombatState.togglePCArmorEquip(idx);
      uiRegistry.renderPlayerScreen();
    };
  }

  // Bind Roll Buttons in Haupthand Slot
  const mainSlot = offense.querySelector('.main-hand-slot');
  if (mainSlot && mainHandWeapon) {
    const atkBtn = mainSlot.querySelector('.roll-atk-btn');
    if (atkBtn) {
      atkBtn.onclick = (e) => {
        if (pc.isTotalDefense) return;
        showAttackChoiceDialog(pc, mainHandWeapon, e);
      };
    }
    const dmgBtn = mainSlot.querySelector('.roll-dmg-btn');
    if (dmgBtn) {
      dmgBtn.onclick = (e) => {
        if (pc.isTotalDefense) return;
        const hasPaladin = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === 'paladin');
        const favoredEnemyBonus = pc.getFavoredEnemyBonus();
        const sneakAttackDice = pc.getSneakAttackDiceCount();
        const hasDmgToggles = (hasPaladin && mainHandWeapon.grip !== 'rng') || favoredEnemyBonus > 0 || sneakAttackDice > 0;
        
        if (hasDmgToggles) {
          showDamageChoiceDialog(pc, mainHandWeapon, e);
        } else {
          const seq = AttackEngine.calculateAttackSequence(pc, mainHandWeapon, false, {
            smite: pc.isSmiteActive,
            favoredEnemy: pc.isFavoredEnemyActive,
            sneakAttack: pc.isSneakAttacking
          });
          const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [], damageDice: '1w6' };
          showRollBreakdown(`${mainHandWeapon.name || 'Waffe'} (Schaden)`, stdAtkObj.damageDice, stdAtkObj.dmgBreakdown, e);
        }
      };
    }
  }

  // Bind Roll Buttons in Nebenhand Slot
  const offSlot = offense.querySelector('.off-hand-slot');
  if (offSlot && offHandWeapon) {
    const atkBtn = offSlot.querySelector('.roll-atk-btn');
    if (atkBtn) {
      atkBtn.onclick = (e) => {
        if (pc.isTotalDefense) return;
        showAttackChoiceDialog(pc, offHandWeapon, e, { isOffhandAttack: true });
      };
    }
    const dmgBtn = offSlot.querySelector('.roll-dmg-btn');
    if (dmgBtn) {
      dmgBtn.onclick = (e) => {
        if (pc.isTotalDefense) return;
        const hasPaladin = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === 'paladin');
        const favoredEnemyBonus = pc.getFavoredEnemyBonus();
        const sneakAttackDice = pc.getSneakAttackDiceCount();
        const hasDmgToggles = (hasPaladin && offHandWeapon.grip !== 'rng') || favoredEnemyBonus > 0 || sneakAttackDice > 0;

        if (hasDmgToggles) {
          showDamageChoiceDialog(pc, offHandWeapon, e, { isOffhandAttack: true });
        } else {
          const seq = AttackEngine.calculateAttackSequence(pc, offHandWeapon, false, {
            isOffhandAttack: true,
            smite: pc.isSmiteActive,
            favoredEnemy: pc.isFavoredEnemyActive,
            sneakAttack: pc.isSneakAttacking
          });
          const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [], damageDice: '1w6' };

          const offhandName = isDoubleWielded ? `${offHandWeapon.name || 'Waffe'} (Nebenseite)` : (offHandWeapon.name || 'Zweitwaffe');
          showRollBreakdown(`${offhandName} (Schaden)`, stdAtkObj.damageDice, stdAtkObj.dmgBreakdown, e);
        }
      };
    }
  }

  // Bind Hand Selection change events
  offense.querySelectorAll('.weapon-hand-select').forEach(select => {
    select.onchange = (e) => {
      const idx = parseInt(select.dataset.idx);
      const newHand = e.target.value;
      const targetWeapon = pc.weapons[idx];
      if (!targetWeapon) return;
      
      const oldHand = targetWeapon.hand || 'main';
      if (oldHand === newHand) return;
      
      // Find if another weapon is equipped in the new slot
      const otherWeapon = pc.weapons.find((w, i) => w.isEquipped && i !== idx && (w.hand === newHand || (newHand === 'main' && w.hand !== 'off')));
      const otherIdx = otherWeapon ? pc.weapons.indexOf(otherWeapon) : null;
      
      CombatState.updatePCBatch(freshPC => {
        freshPC.weapons[idx].hand = newHand;
        if (otherIdx !== null) {
          freshPC.weapons[otherIdx].hand = oldHand;
        }
      });
      uiRegistry.renderPlayerScreen();
    };
  });
}
