import { CombatRules } from '../rules.js';

export const SpellSlotCalculator = {
  calculateSpellSlots(pc) {
    return CombatRules.calculateMaxSpellSlots(pc);
  },

  getMetamagicCost(featId) {
    const costs = {
      extend_spell: 1,
      empower_spell: 2,
      maximize_spell: 3,
      quicken_spell: 4,
      extend: 1,
      empower: 2,
      maximize: 3,
      quicken: 4
    };
    return costs[featId] || 0;
  },

  getMetamagicAdjustment(metamagicList) {
    if (!Array.isArray(metamagicList)) return 0;
    return metamagicList.reduce((sum, featId) => sum + this.getMetamagicCost(featId), 0);
  },

  getAdjustedSpellLevel(spell, metamagicList) {
    if (!spell) return 0;
    return spell.level + this.getMetamagicAdjustment(metamagicList);
  },

  countPreparedSpellsAtLevel(pc, level) {
    if (!Array.isArray(pc.preparedSpells)) return 0;
    return pc.preparedSpells.filter(p => {
      const sp = pc.findSpell(p.spellKey);
      if (!sp) return false;
      const adjLevel = this.getAdjustedSpellLevel(sp, p.metamagic);
      return adjLevel === level;
    }).length;
  }
};
