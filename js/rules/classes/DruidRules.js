/**
 * D&D 3.5e Druid Class Rules
 */
export const DruidRules = {
  cleanup(pc) {
    pc.companionType = 'none';
    pc.companionName = '';
    pc.companionHP = 0;
    pc.companionMaxHP = 0;
    if (Array.isArray(pc.dailyAbilities)) {
      pc.dailyAbilities = pc.dailyAbilities.filter(a => a.name !== "Tiergestalt" && a.name !== "Wild Shape");
    }
  },

  recalculateDailyAbilities(pc, level) {
    let wildShapeMax = 0;
    if (level >= 18) wildShapeMax = 6;
    else if (level >= 14) wildShapeMax = 5;
    else if (level >= 10) wildShapeMax = 4;
    else if (level >= 7) wildShapeMax = 3;
    else if (level >= 6) wildShapeMax = 2;
    else if (level >= 5) wildShapeMax = 1;

    let wildAbility = pc.dailyAbilities.find(a => a.name === "Tiergestalt" || a.name === "Wild Shape");
    if (wildShapeMax > 0) {
      if (!wildAbility) {
        pc.dailyAbilities.push({ name: "Tiergestalt", max: wildShapeMax, used: 0 });
      } else {
        wildAbility.max = wildShapeMax;
        wildAbility.name = "Tiergestalt";
      }
    } else if (wildAbility) {
      pc.dailyAbilities = pc.dailyAbilities.filter(a => a.name !== "Tiergestalt" && a.name !== "Wild Shape");
    }
  }
};
