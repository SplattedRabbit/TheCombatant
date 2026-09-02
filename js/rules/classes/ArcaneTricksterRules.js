/**
 * @module    ArcaneTricksterRules
 * @summary   D&D 3.5e Arcane Trickster prestige class rules: Ranged Legerdemain uses, Sneak Attack progression, Impromptu Sneak Attack.
 * @exports   ArcaneTricksterRules
 */

import { getPrestigeClassFeatures } from '../prestigeClassEngine.js';

export const ArcaneTricksterRules = {
  getFeatures(pc) {
    return getPrestigeClassFeatures(pc, 'arcane_trickster');
  },

  getRangedLegerdemainUses(level) {
    if (level >= 9) return 3;
    if (level >= 5) return 2;
    if (level >= 1) return 1;
    return 0;
  },

  getSneakAttackDice(level) {
    return Math.ceil(level / 2);
  },

  getImpromptuSneakAttackUses(level) {
    if (level >= 7) return 2;
    if (level >= 3) return 1;
    return 0;
  }
};
