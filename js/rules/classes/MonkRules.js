/**
 * D&D 3.5e Monk Class Rules
 */
export const MonkRules = {
  cleanup(pc) {
    pc.isFlurrying = false;
    const monkKiAbilities = [
      "Joch des Geistes (Abundant Step)",
      "Zitternde Hand (Quivering Palm)",
      "Unbefleckter Körper (Empty Body)"
    ];
    if (Array.isArray(pc.dailyAbilities)) {
      pc.dailyAbilities = pc.dailyAbilities.filter(a => !monkKiAbilities.includes(a.name));
    }
  },

  recalculateDailyAbilities(pc, level) {
    if (level >= 12) {
      let step = pc.dailyAbilities.find(a => a.name === "Joch des Geistes (Abundant Step)");
      if (!step) {
        pc.dailyAbilities.push({ name: "Joch des Geistes (Abundant Step)", max: 1, used: 0 });
      }
    }
    if (level >= 15) {
      let palm = pc.dailyAbilities.find(a => a.name === "Zitternde Hand (Quivering Palm)");
      if (!palm) {
        pc.dailyAbilities.push({ name: "Zitternde Hand (Quivering Palm)", max: 1, used: 0 });
      }
    }
    if (level >= 19) {
      let body = pc.dailyAbilities.find(a => a.name === "Unbefleckter Körper (Empty Body)");
      if (!body) {
        pc.dailyAbilities.push({ name: "Unbefleckter Körper (Empty Body)", max: 1, used: 0 });
      }
    }
  },

  /**
   * D&D 3.5e Medium size Monk Unarmed Strike damage dice scaling
   */
  getUnarmedDamageDice(level) {
    const lvl = parseInt(level) || 1;
    if (lvl >= 20) return '2w10';
    if (lvl >= 16) return '2w8';
    if (lvl >= 12) return '2w6';
    if (lvl >= 8) return '1w10';
    if (lvl >= 4) return '1w8';
    return '1w6';
  }
};
