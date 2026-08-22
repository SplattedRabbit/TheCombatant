/**
 * @module    PCManager
 * @summary   Facade for Player Character state mutations. Re-exports operations from modular sub-files.
 * @exports   recalculateDailyAbilities, recalculatePCStats, syncPCToHost, updatePCBatch, clearActivePC, updatePCField, updatePCNumber, togglePCDefensiveFighting, togglePCTotalDefense, addPCClass, removePCClass, updatePCClassLevel, updatePCClassType, clearPCClasses, updatePCWeapon, addPCWeapon, deletePCWeapon, togglePCWeaponEquip, addPCArmor, removePCArmor, togglePCArmorEquip, updatePCArmorField, setPCAutoAC, addPCItem, deletePCItem, updatePCItem, togglePCItemEquip, addPCItemEffect, deletePCItemEffect, updatePCItemEffect, updatePCSpellSlotsMax, updatePCSpellSlotsUsed, addPCDailyAbility, removePCDailyAbility, updatePCDailyAbilityUsed, resetDailyResources, addPCFeat, removePCFeat, savePCSpellTemplate, deletePCSpellTemplate, applyPCSpellTemplate, clearPreparedSpells
 */

export {
  recalculateDailyAbilities,
  recalculatePCStats,
  syncPCToHost,
  updatePCBatch,
  clearActivePC,
  updatePCField,
  updatePCNumber,
  togglePCDefensiveFighting,
  togglePCTotalDefense
} from './pc/PCGeneral.js';

export {
  addPCClass,
  removePCClass,
  updatePCClassLevel,
  updatePCClassType,
  clearPCClasses
} from './pc/PCClasses.js';

export {
  updatePCWeapon,
  addPCWeapon,
  deletePCWeapon,
  togglePCWeaponEquip,
  addPCArmor,
  removePCArmor,
  togglePCArmorEquip,
  updatePCArmorField,
  setPCAutoAC,
  addPCItem,
  deletePCItem,
  updatePCItem,
  togglePCItemEquip,
  addPCItemEffect,
  deletePCItemEffect,
  updatePCItemEffect,
  equipPCItem,
  unequipPCItem,
  swapPCItem,
  usePCItemCharge,
  usePCItemAction,
  addPCItemFromCompendium
} from './pc/PCEquipment.js';

export {
  updatePCSpellSlotsMax,
  updatePCSpellSlotsUsed,
  addPCDailyAbility,
  removePCDailyAbility,
  updatePCDailyAbilityUsed,
  resetDailyResources,
  addPCFeat,
  removePCFeat,
  addPCSkillTrick,
  removePCSkillTrick,
  savePCSpellTemplate,
  deletePCSpellTemplate,
  applyPCSpellTemplate,
  clearPreparedSpells,
  consumeSmiteEvilCharge,
  togglePCRage
} from './pc/PCFeatsSpells.js';
