/**
 * D&D 3.5e Paladin Class Rules
 */
export const PaladinRules = {
  cleanup(pc) {
    if (pc.divineGraceActive) {
      pc.divineGraceActive = false;
    }
    const activeClasses = Array.isArray(pc.classes) ? pc.classes.map(c => c.classType) : [];
    const hasCleric = activeClasses.includes('cleric');
    if (Array.isArray(pc.dailyAbilities)) {
      pc.dailyAbilities = pc.dailyAbilities.filter(a => {
        if (a.name === "Böses niederstrecken" || a.name === "Hände auflegen") return false;
        if (a.name === "Untote vertreiben" && !hasCleric) return false;
        return true;
      });
    }
  },

  recalculateDailyAbilities(pc, level) {
    const totalSmite = 1 + Math.floor((level - 1) / 5);
    let smiteAbility = pc.dailyAbilities.find(a => a.name === "Böses niederstrecken");
    if (!smiteAbility) {
      pc.dailyAbilities.push({ name: "Böses niederstrecken", max: totalSmite, used: 0 });
    } else {
      smiteAbility.max = totalSmite;
    }

    const chaScore = pc.cha ? pc.cha.getValue() : 10;
    const chaMod = Math.floor((chaScore - 10) / 2);
    const totalHands = (level >= 2 && chaScore >= 12) ? (level * chaMod) : 0;
    let lohAbility = pc.dailyAbilities.find(a => a.name === "Hände auflegen");
    if (!lohAbility) {
      pc.dailyAbilities.push({ name: "Hände auflegen", max: totalHands, used: 0 });
    } else {
      lohAbility.max = totalHands;
    }

    // Turn Undead starting at level 4
    const canTurn = level >= 4;
    let turnAbility = pc.dailyAbilities.find(a => a.name === "Untote vertreiben");
    if (canTurn) {
      const turnMax = Math.max(1, 3 + chaMod);
      if (!turnAbility) {
        pc.dailyAbilities.push({ name: "Untote vertreiben", max: turnMax, used: 0 });
      } else {
        turnAbility.max = Math.max(turnAbility.max, turnMax);
      }
    } else if (turnAbility) {
      const activeClasses = Array.isArray(pc.classes) ? pc.classes.map(c => c.classType) : [];
      if (!activeClasses.includes('cleric')) {
        pc.dailyAbilities = pc.dailyAbilities.filter(a => a.name !== "Untote vertreiben");
      }
    }
  }
};
