/**
 * @module    RangerRules
 * @summary   D&D 3.5e Waldläufer-Klassenregeln: Erzfeind-Bonus-Berechnung, Companion-Cleanup.
 * @exports   RangerRules
 * @reads     pc.classes
 * @stateOps  Keine — mutiert pc direkt (aufgerufen durch PCManager)
 * @depends   Keine externen Imports
 * @notHere   UI-Rendering → RangerFeatures.js | TWF-Regeln → AttackEngine.js
 */
export const RangerRules = {
  cleanup(pc) {
    pc.companionType = 'none';
    pc.companionName = '';
    pc.companionHP = 0;
    pc.companionMaxHP = 0;
    pc.isFavoredEnemyActive = false;
  },

  recalculateDailyAbilities(pc, level) {
    // None
  },

  getFavoredEnemyBonus(level) {
    return 2 + 2 * Math.floor((level - 1) / 5);
  }
};
