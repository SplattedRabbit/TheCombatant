/**
 * @module    PCOffense
 * @summary   Fassade - Verwaltet den Tab ÔÇ×Ausr├╝stungÔÇ£: Ausr├╝stungsslots (links) und Rucksack (rechts).
 * @exports   renderPCOffense(pc), isLightWeapon, getCritThreatDisplay
 * @reads     pc.activeShape, pc.feats, pc.bab, pc.powerAttackPenalty, pc.combatExpertisePenalty
 * @stateOps  keine
 * @depends   EquipmentSlotsRenderer, CombatSettingsRenderer, NaturalAttacksRenderer, InventoryStashRenderer
 * @notHere   UI-Hilfen -> offense/* | Magische Gegenst├ñnde -> PCMagicItemsTab.js | Angriffskalkulation -> AttackEngine.js
 */

import { isLightWeapon, getCritThreatDisplay } from '../../../models/Weapon.js';
import { renderEquipmentSlotsHtml, bindEquipmentSlotsEvents } from './offense/EquipmentSlotsRenderer.js';
import { renderCombatSettingsHtml, bindCombatSettingsEvents } from './offense/CombatSettingsRenderer.js';
import { renderNaturalAttacksList } from './offense/NaturalAttacksRenderer.js';
import { renderRightColumnHtml } from './offense/InventoryStashRenderer.js';

export { isLightWeapon, getCritThreatDisplay };

export function renderPCOffense(pc) {
  const offense = document.getElementById('pcOffense');
  if (!offense) return;

  const babVal = pc.bab.getValue();

  const hasPowerAttack = pc.feats && pc.feats.some(f => f.id === 'power_attack');
  const paPenalty = hasPowerAttack ? Math.min(babVal, parseInt(pc.powerAttackPenalty) || 0) : 0;

  const hasCombatExpertise = pc.feats && pc.feats.some(f => f.id === 'combat_expertise');
  const cePenalty = hasCombatExpertise ? Math.min(Math.min(5, babVal), parseInt(pc.combatExpertisePenalty) || 0) : 0;

  // Render Left Column (pcOffense): Visual Slots + Global Settings
  offense.innerHTML = renderEquipmentSlotsHtml(pc, babVal, paPenalty, cePenalty, hasPowerAttack, hasCombatExpertise) +
                      renderCombatSettingsHtml(pc, babVal, paPenalty, cePenalty, hasPowerAttack, hasCombatExpertise);
                      
  bindEquipmentSlotsEvents(offense, pc, babVal);
  bindCombatSettingsEvents(offense, pc, babVal, hasPowerAttack, hasCombatExpertise);

  // If in Wild Shape, render natural attacks inside pcOffense as well
  if (pc.activeShape !== "none") {
    const natList = offense.querySelector('#pcNaturalAttacksList');
    if (natList) {
      renderNaturalAttacksList(natList, pc);
    }
  }

  // Render Right Column (pcArmorPanel): Stash / Inventory (Rucksack)
  const armorPanel = document.getElementById('pcArmorPanel');
  if (armorPanel) {
    renderRightColumnHtml(armorPanel, pc);
  }
}
