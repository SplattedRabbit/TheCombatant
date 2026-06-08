/**
 * D&D 3.5e Ranger Class Rules
 */
export const RangerRules = {
  cleanup(pc) {
    pc.companionType = 'none';
    pc.companionName = '';
    pc.companionHP = 0;
    pc.companionMaxHP = 0;
  },

  recalculateDailyAbilities(pc, level) {
    // None
  },

  getFavoredEnemyBonus(level) {
    return 2 + 2 * Math.floor((level - 1) / 5);
  }
};
