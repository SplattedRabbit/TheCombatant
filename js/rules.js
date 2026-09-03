/**
 * @module    rules
 * @summary   Facade for D&D 3.5e rules engine. Re-exports constants and functions from modular sub-files.
 * @exports   CombatRules, getAllCompendiumSpells, isSpellEligibleForPC, getEligibleSpellLevelsForPC, checkPrerequisites, validatePrestigeClassPrereqs, getPrestigeClassFeatures
 */


import {
  CONDITIONS,
  CLASSES,
  CLASS_SKILLS,
  CLASS_PROFILES,
  CLASS_BASE_SKILLS,
  WIZ_CLER_DRU_TABLE,
  SORCERER_TABLE,
  BARD_TABLE,
  PALADIN_RANGER_TABLE,
  SORCERER_KNOWN_TABLE,
  BARD_KNOWN_TABLE,
  ASSASSIN_TABLE
} from './rules/RulesData.js';


import {
  calculateBab,
  calculateSave
} from './rules/RulesMath.js';

import {
  isClassSkill,
  getPCMaxRanks,
  calculateTotalSkillPoints,
  calculateSpentSkillPoints,
  getMaxSkillTricksLimit,
  checkSkillTrickPrerequisites
} from './rules/RulesSkills.js';

import {
  getMaxSpellLevel,
  calculateMaxSpellSlots,
  checkSpellKnownLimit,
  isSpellEligibleForPC,
  getEligibleSpellLevelsForPC,
  validateSpellLearnEligibility,
  getSpellClassLevels,
  isWizardProhibitedSchool
} from './rules/RulesSpells.js';

import {
  calculateMaxFeats,
  validateFeatsAssignment
} from './rules/RulesFeats.js';

import {
  validatePrestigeClassPrereqs,
  isOnlySpecialTextUnmet
} from './rules/classValidation.js';

import {
  getPrestigeClassFeatures,
  getSneakAttackDiceFromPrestigeClasses
} from './rules/prestigeClassEngine.js';

import {
  PRESTIGE_CLASSES_REGISTRY
} from './data/prestigeClasses-data.js';

import {
  calculateEquippedItemEffects,
  getItemStackingBreakdown,
  getAvailableEquipmentBuffs,
  calculateItemSetBonuses
} from './rules/RulesItems.js';

export const CombatRules = {
  CONDITIONS,
  CLASSES,
  CLASS_SKILLS,
  CLASS_PROFILES,
  CLASS_BASE_SKILLS,
  WIZ_CLER_DRU_TABLE,
  SORCERER_TABLE,
  BARD_TABLE,
  PALADIN_RANGER_TABLE,
  SORCERER_KNOWN_TABLE,
  BARD_KNOWN_TABLE,
  ASSASSIN_TABLE,
  calculateBab,
  calculateSave,
  isClassSkill,
  getPCMaxRanks,
  calculateTotalSkillPoints,
  calculateSpentSkillPoints,
  getMaxSkillTricksLimit,
  checkSkillTrickPrerequisites,
  getMaxSpellLevel,
  calculateMaxSpellSlots,
  checkSpellKnownLimit,
  isSpellEligibleForPC,
  getEligibleSpellLevelsForPC,
  validateSpellLearnEligibility,
  getSpellClassLevels,
  isWizardProhibitedSchool,
  calculateMaxFeats,
  validateFeatsAssignment,
  validatePrestigeClassPrereqs,
  isOnlySpecialTextUnmet,
  getPrestigeClassFeatures,
  getSneakAttackDiceFromPrestigeClasses,
  calculateEquippedItemEffects,
  getItemStackingBreakdown,
  getAvailableEquipmentBuffs,
  calculateItemSetBonuses,
  PRESTIGE_CLASSES_REGISTRY
};

export {
  calculateEquippedItemEffects,
  getItemStackingBreakdown,
  getAvailableEquipmentBuffs,
  calculateItemSetBonuses
} from './rules/RulesItems.js';

export {
  getAllCompendiumSpells,
  isSpellEligibleForPC,
  getEligibleSpellLevelsForPC,
  validateSpellLearnEligibility,
  getSpellClassLevels,
  isWizardProhibitedSchool
} from './rules/RulesSpells.js';

export {
  checkPrerequisites
} from './rules/RulesFeats.js';

export {
  validatePrestigeClassPrereqs,
  isOnlySpecialTextUnmet
} from './rules/classValidation.js';

export {
  getPrestigeClassFeatures,
  getAblMod as getPrestigeClassAblMod,
  getSneakAttackDiceFromPrestigeClasses
} from './rules/prestigeClassEngine.js';

export {
  PRESTIGE_CLASSES_REGISTRY
} from './data/prestigeClasses-data.js';

export { AssassinRules } from './rules/classes/AssassinRules.js';
export { ArcaneTricksterRules } from './rules/classes/ArcaneTricksterRules.js';
export { ShadowbaneInquisitorRules } from './rules/classes/ShadowbaneInquisitorRules.js';
export { BattleTricksterRules } from './rules/classes/BattleTricksterRules.js';
export { SpellwarpSniperRules } from './rules/classes/SpellwarpSniperRules.js';
export { EldritchKnightRules } from './rules/classes/EldritchKnightRules.js';


