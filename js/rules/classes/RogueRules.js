/**
 * D&D 3.5e Rogue Class Rules
 */
export const RogueRules = {
  cleanup(pc) {
    pc.isSneakAttacking = false;
  },

  recalculateDailyAbilities(pc, level) {
    // None
  },

  getSneakAttackDiceCount(level) {
    return Math.floor((level + 1) / 2);
  }
};
