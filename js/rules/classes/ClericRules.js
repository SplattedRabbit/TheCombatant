/**
 * D&D 3.5e Cleric Class Rules
 */
export const ClericRules = {
  cleanup(pc) {
    const activeClasses = Array.isArray(pc.classes) ? pc.classes.map(c => c.classType) : [];
    const paladinClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'paladin') : null;
    const hasPaladinTurn = paladinClass && paladinClass.level >= 4;
    if (Array.isArray(pc.dailyAbilities)) {
      pc.dailyAbilities = pc.dailyAbilities.filter(a => {
        if ((a.name === "Untote vertreiben" || a.name === "Turn Undead") && !hasPaladinTurn) return false;
        return true;
      });
    }
  },

  recalculateDailyAbilities(pc, level) {
    const chaScore = pc.cha ? pc.cha.getValue() : 10;
    const chaMod = Math.floor((chaScore - 10) / 2);
    const turnMax = Math.max(1, 3 + chaMod);
    let turnAbility = pc.dailyAbilities.find(a => a.name === "Untote vertreiben" || a.name === "Turn Undead");
    if (!turnAbility) {
      pc.dailyAbilities.push({ name: "Turn Undead", max: turnMax, used: 0 });
    } else {
      turnAbility.max = turnMax;
      turnAbility.name = "Turn Undead";
    }
  }
};
