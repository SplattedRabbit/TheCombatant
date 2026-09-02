/**
 * @module    AssassinRules
 * @summary   D&D 3.5e Assassin prestige class rules: Sneak Attack progression, Death Attack DC, Poison Save bonus.
 * @exports   AssassinRules
 */

import { getPrestigeClassFeatures } from '../prestigeClassEngine.js';

export const AssassinRules = {
  getFeatures(pc) {
    return getPrestigeClassFeatures(pc, 'assassin');
  },

  getDeathAttackDC(level, intMod) {
    return 10 + level + intMod;
  },

  getSneakAttackDice(level) {
    return Math.ceil(level / 2);
  },

  getPoisonSaveBonus(level) {
    return Math.floor((level + 1) / 2);
  },

  getUncannyDodgeLevel(level) {
    if (level >= 5) return 'improved';
    if (level >= 2) return 'uncanny';
    return null;
  }
};
