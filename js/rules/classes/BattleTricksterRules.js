/**
 * @module    BattleTricksterRules
 * @summary   D&D 3.5e Battle Trickster prestige class rules: Bonus Trick progression, Tricky Fighting bonus.
 * @exports   BattleTricksterRules
 */

import { getPrestigeClassFeatures } from '../prestigeClassEngine.js';

export const BattleTricksterRules = {
  getFeatures(pc) {
    return getPrestigeClassFeatures(pc, 'battle_trickster');
  },

  getBonusTricksCount(level) {
    return Math.min(3, Math.max(0, level));
  },

  getTrickyFightingBonus(level) {
    return level >= 2 ? 1 : 0;
  }
};
