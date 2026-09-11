/**
 * @module    RulesData
 * @summary   Static D&D 3.5e rule registries: conditions, classes, skills, profiles, and spell progression tables (Modular Facade).
 * @feature   rules
 * @exports   CONDITIONS, CLASSES, CLASS_SKILLS, CLASS_PROFILES, CLASS_BASE_SKILLS, WIZ_CLER_DRU_TABLE, SORCERER_TABLE, BARD_TABLE, PALADIN_RANGER_TABLE, SORCERER_KNOWN_TABLE, BARD_KNOWN_TABLE, ASSASSIN_TABLE, DUSKBLADE_TABLE, BEGUILER_TABLE
 */

export { CONDITIONS } from './data/conditions.js';
export { CLASSES } from './data/classes.js';
export { CLASS_SKILLS, CLASS_BASE_SKILLS } from './data/classSkills.js';
export { CLASS_PROFILES } from './data/classProfiles.js';
export {
  WIZ_CLER_DRU_TABLE,
  SORCERER_TABLE,
  BARD_TABLE,
  PALADIN_RANGER_TABLE,
  SORCERER_KNOWN_TABLE,
  BARD_KNOWN_TABLE,
  ASSASSIN_TABLE,
  DUSKBLADE_TABLE,
  BEGUILER_TABLE
} from './data/spellTables.js';
