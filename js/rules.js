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
  calculateSpentSkillPoints
} from './rules/RulesSkills.js';

import {
  getMaxSpellLevel,
  calculateMaxSpellSlots,
  checkSpellKnownLimit
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
  getMaxSpellLevel,
  calculateMaxSpellSlots,
  checkSpellKnownLimit,
  calculateMaxFeats,
  validateFeatsAssignment,
  validatePrestigeClassPrereqs,
  isOnlySpecialTextUnmet,
  getPrestigeClassFeatures,
  getSneakAttackDiceFromPrestigeClasses,
  PRESTIGE_CLASSES_REGISTRY
};

export {
  getAllCompendiumSpells,
  isSpellEligibleForPC,
  getEligibleSpellLevelsForPC
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

