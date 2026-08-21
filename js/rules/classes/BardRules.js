/**
 * D&D 3.5e Bard Class Rules
 */
export const BardRules = {
  cleanup(pc) {
    pc.bardicMusicExtra = 0;
    if (Array.isArray(pc.dailyAbilities)) {
      pc.dailyAbilities = pc.dailyAbilities.filter(a => a.name !== "Bardisches Lied" && a.name !== "Bardic Music");
    }
  },

  recalculateDailyAbilities(pc, level) {
    const extraMusic = pc.bardicMusicExtra || 0;
    const totalMax = level + extraMusic;
    let musicAbility = pc.dailyAbilities.find(a => a.name === "Bardisches Lied" || a.name === "Bardic Music");
    if (!musicAbility) {
      pc.dailyAbilities.push({ name: "Bardic Music", max: totalMax, used: 0 });
    } else {
      musicAbility.max = totalMax;
      musicAbility.name = "Bardic Music";
    }
  }
};
