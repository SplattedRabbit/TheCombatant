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

  getAdjustedSpellLevel(spell, metamagicList, pc) {
    if (!spell) return 0;
    let baseLevel = spell.level;
    if (baseLevel === undefined && Array.isArray(spell.classLevels)) {
      if (pc && Array.isArray(pc.classes)) {
        const pcClassTypes = pc.classes.map(c => c.classType);
        const match = spell.classLevels.find(cl => pcClassTypes.includes(cl.class));
        if (match) baseLevel = match.level;
      }
      if (baseLevel === undefined && spell.classLevels.length > 0) {
        baseLevel = spell.classLevels[0].level;
      }
    }
    if (baseLevel === undefined) baseLevel = 0;
    return baseLevel + this.getMetamagicAdjustment(metamagicList);
  },

  countPreparedSpellsAtLevel(pc, level) {
    if (!Array.isArray(pc.preparedSpells)) return 0;
    return pc.preparedSpells.filter(p => {
      const sp = pc.findSpell ? pc.findSpell(p.spellKey) : null;
      if (!sp) return false;
      const adjLevel = this.getAdjustedSpellLevel(sp, p.metamagic, pc);
      return adjLevel === level;
    }).length;
  },

  countPreparedDomainSpellsAtLevel(pc, level) {
    if (!Array.isArray(pc.preparedSpells)) return 0;
    return pc.preparedSpells.filter(p => {
      if (!p.isDomain) return false;
      const sp = pc.findSpell ? pc.findSpell(p.spellKey) : null;
      if (!sp) return false;
      const adjLevel = this.getAdjustedSpellLevel(sp, p.metamagic, pc);
      return adjLevel === level;
    }).length;
  }
};

