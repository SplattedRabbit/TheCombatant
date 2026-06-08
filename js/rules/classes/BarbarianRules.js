/**
 * D&D 3.5e Barbarian Class Rules
 */
export const BarbarianRules = {
  cleanup(pc) {
    if (pc.isRaging) {
      pc.exitRage();
    }
    if (Array.isArray(pc.dailyAbilities)) {
      pc.dailyAbilities = pc.dailyAbilities.filter(a => a.name !== "Kampfrausch (Rage)");
    }
  },

  recalculateDailyAbilities(pc, level) {
    const totalRage = 1 + Math.floor(level / 4);
    let rageAbility = pc.dailyAbilities.find(a => a.name === "Kampfrausch (Rage)");
    if (!rageAbility) {
      pc.dailyAbilities.push({ name: "Kampfrausch (Rage)", max: totalRage, used: 0 });
    } else {
      rageAbility.max = totalRage;
    }
  },

  /**
   * D&D 3.5e RAW Barbarian Rage scaling:
   * - Level 1: Normal Rage (+4 Str, +4 Con, +2 Will, -2 AC, +2 HP per level)
   * - Level 11: Greater Rage (+6 Str, +6 Con, +3 Will, -2 AC, +3 HP per level)
   * - Level 20: Mighty Rage (+8 Str, +8 Con, +4 Will, -2 AC, +4 HP per level)
   */
  getRageBonuses(level) {
    const lvl = parseInt(level) || 1;
    if (lvl >= 20) {
      return {
        strBonus: 8,
        conBonus: 8,
        wilBonus: 4,
        acPenalty: -2,
        hpPerLevel: 4
      };
    } else if (lvl >= 11) {
      return {
        strBonus: 6,
        conBonus: 6,
        wilBonus: 3,
        acPenalty: -2,
        hpPerLevel: 3
      };
    } else {
      return {
        strBonus: 4,
        conBonus: 4,
        wilBonus: 2,
        acPenalty: -2,
        hpPerLevel: 2
      };
    }
  }
};
