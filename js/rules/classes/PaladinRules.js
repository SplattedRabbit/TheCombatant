/**
 * @module    PaladinRules
 * @summary   D&D 3.5e Paladin-Klassenregeln: Böses niederstrecken, Hände auflegen, Untote vertreiben.
 * @exports   PaladinRules
 * @reads     pc.dailyAbilities, pc.cha, pc.classes
 * @stateOps  Keine — mutiert pc direkt (aufgerufen durch PCManager)
 * @depends   Keine externen Imports
 * @notHere   UI-Rendering → PaladinFeatures.js | Slot-Berechnung → rules.js CLASS_PROFILES
 */
export const PaladinRules = {
  cleanup(pc) {
    if (pc.divineGraceActive) {
      pc.divineGraceActive = false;
    }
    pc.isSmiteActive = false;
    const activeClasses = Array.isArray(pc.classes) ? pc.classes.map(c => c.classType) : [];
    const hasCleric = activeClasses.includes('cleric');
    if (Array.isArray(pc.dailyAbilities)) {
      pc.dailyAbilities = pc.dailyAbilities.filter(a => {
        if (a.name === "Böses niederstrecken" || a.name === "Smite Evil" || a.name === "Hände auflegen" || a.name === "Lay on Hands") return false;
        if ((a.name === "Untote vertreiben" || a.name === "Turn Undead") && !hasCleric) return false;
        return true;
      });
    }
  },

  recalculateDailyAbilities(pc, level) {
    const totalSmite = 1 + Math.floor((level - 1) / 5);
    let smiteAbility = pc.dailyAbilities.find(a => a.name === "Böses niederstrecken" || a.name === "Smite Evil");
    if (!smiteAbility) {
      pc.dailyAbilities.push({ name: "Smite Evil", max: totalSmite, used: 0 });
    } else {
      smiteAbility.max = totalSmite;
      smiteAbility.name = "Smite Evil";
    }

    const chaScore = pc.cha ? pc.cha.getValue() : 10;
    const chaMod = Math.floor((chaScore - 10) / 2);
    const totalHands = (level >= 2 && chaScore >= 12) ? (level * chaMod) : 0;
    let lohAbility = pc.dailyAbilities.find(a => a.name === "Hände auflegen" || a.name === "Lay on Hands");
    if (!lohAbility) {
      pc.dailyAbilities.push({ name: "Lay on Hands", max: totalHands, used: 0 });
    } else {
      lohAbility.max = totalHands;
      lohAbility.name = "Lay on Hands";
    }

    // Turn Undead starting at level 4
    const canTurn = level >= 4;
    let turnAbility = pc.dailyAbilities.find(a => a.name === "Untote vertreiben" || a.name === "Turn Undead");
    if (canTurn) {
      const turnMax = Math.max(1, 3 + chaMod);
      if (!turnAbility) {
        pc.dailyAbilities.push({ name: "Turn Undead", max: turnMax, used: 0 });
      } else {
        turnAbility.max = Math.max(turnAbility.max, turnMax);
        turnAbility.name = "Turn Undead";
      }
    } else if (turnAbility) {
      const activeClasses = Array.isArray(pc.classes) ? pc.classes.map(c => c.classType) : [];
      if (!activeClasses.includes('cleric')) {
        pc.dailyAbilities = pc.dailyAbilities.filter(a => a.name !== "Untote vertreiben" && a.name !== "Turn Undead");
      }
    }
  }
};
