/**
 * @module    ShadowbaneInquisitorRules
 * @summary   D&D 3.5e Shadowbane Inquisitor prestige class rules: Absolute Conviction, Sneak Attack, Smite Corrupt.
 * @exports   ShadowbaneInquisitorRules
 */

import { getPrestigeClassFeatures } from '../prestigeClassEngine.js';

export const ShadowbaneInquisitorRules = {
  getFeatures(pc) {
    return getPrestigeClassFeatures(pc, 'shadowbane_inquisitor');
  },

  getSneakAttackDice(level) {
    if (level >= 10) return 3;
    if (level >= 7) return 2;
    if (level >= 4) return 1;
    return 0;
  },

  getSmiteCorruptUses(level) {
    if (level >= 6) return 2;
    if (level >= 2) return 1;
    return 0;
  }
};
