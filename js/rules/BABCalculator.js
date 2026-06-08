import { CombatRules } from '../rules.js';

export const BABCalculator = {
  calculateBab(classes) {
    if (!Array.isArray(classes)) return 0;
    let totalBab = 0;
    classes.forEach(c => {
      const activeClass = CombatRules.CLASSES.find(x => x.key === c.classType);
      if (activeClass && activeClass.key !== 'custom') {
        totalBab += CombatRules.calculateBab(activeClass.bab, c.level);
      }
    });
    return totalBab;
  }
};
