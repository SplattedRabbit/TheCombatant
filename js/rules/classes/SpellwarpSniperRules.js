/**
 * @module    SpellwarpSniperRules
 * @summary   D&D 3.5e Spellwarp Sniper prestige class rules: Spellwarp max spell level, Sudden Raystrike dice, Ray Mastery.
 * @exports   SpellwarpSniperRules
 */

import { getPrestigeClassFeatures } from '../prestigeClassEngine.js';

export const SpellwarpSniperRules = {
  getFeatures(pc) {
    return getPrestigeClassFeatures(pc, 'spellwarp_sniper');
  },

  getMaxSpellwarpLevel(level) {
    return Math.min(5, Math.max(0, level));
  },

  getSuddenRaystrikeDice(level) {
    if (level >= 4) return 2;
    if (level >= 2) return 1;
    return 0;
  }
};
