/**
 * @module    EldritchKnightRules
 * @summary   D&D 3.5e Eldritch Knight prestige class rules: Bonus Combat Feat at level 1, Arcane Spellcasting progression.
 * @exports   EldritchKnightRules
 */

import { getPrestigeClassFeatures } from '../prestigeClassEngine.js';

export const EldritchKnightRules = {
  getFeatures(pc) {
    return getPrestigeClassFeatures(pc, 'eldritch_knight');
  },

  hasBonusFeat(level) {
    return level >= 1;
  }
};
