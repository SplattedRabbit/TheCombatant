/**
 * D&D 3.5e Wizard Class Rules
 */
export const WizardRules = {
  cleanup(pc) {
    if (pc.familiarType === 'toad') {
      pc.maxHP = Math.max(1, pc.maxHP - 3);
      pc.hp = Math.max(0, pc.hp - 3);
    }
    pc.familiarType = 'none';
    pc.familiarName = '';
    pc.familiarHP = 0;
    pc.wizardSpecialization = 'none';
    pc.wizardProhibited1 = '';
    pc.wizardProhibited2 = '';
  },

  recalculateDailyAbilities(pc, level) {
    // None
  }
};
