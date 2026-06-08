/**
 * D&D 3.5e Sorcerer Class Rules
 */
export const SorcererRules = {
  cleanup(pc) {
    if (pc.familiarType === 'toad') {
      pc.maxHP = Math.max(1, pc.maxHP - 3);
      pc.hp = Math.max(0, pc.hp - 3);
    }
    pc.familiarType = 'none';
    pc.familiarName = '';
    pc.familiarHP = 0;
  },

  recalculateDailyAbilities(pc, level) {
    // None
  }
};
