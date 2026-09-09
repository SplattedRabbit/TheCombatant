/**
 * @module    NinjaRules
 * @summary   D&D 3.5e Complete Adventurer Ninja Class Rules.
 *            Manages daily Ki Power calculations, Sudden Strike, and class cleanups.
 * @exports   NinjaRules
 */

export const NinjaRules = {
  cleanup(pc) {
    if (Array.isArray(pc.dailyAbilities)) {
      pc.dailyAbilities = pc.dailyAbilities.filter(a => a.name !== 'Ki Power');
    }
  },

  recalculateDailyAbilities(pc, level) {
    const wisScore = pc.wis && typeof pc.wis.getValue === 'function' ? pc.wis.getValue() : (pc.wis || 10);
    const wisMod = Math.max(0, Math.floor((wisScore - 10) / 2));
    const maxKi = Math.max(1, Math.floor(level / 2)) + wisMod;

    let kiAbility = pc.dailyAbilities.find(a => a.name === 'Ki Power');
    if (!kiAbility) {
      pc.dailyAbilities.push({ name: 'Ki Power', max: maxKi, used: 0 });
    } else {
      kiAbility.max = maxKi;
      kiAbility.used = Math.min(kiAbility.used, maxKi);
    }
  },

  getSuddenStrikeDice(level) {
    const lvl = parseInt(level) || 1;
    return Math.floor((lvl + 1) / 2);
  },

  getAcBonus(level, wisMod = 0) {
    const lvl = parseInt(level) || 1;
    const classBonus = Math.floor(lvl / 5);
    return Math.max(0, wisMod) + classBonus;
  }
};
