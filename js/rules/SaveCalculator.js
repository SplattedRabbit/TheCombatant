/**
 * @module    SaveCalculator
 * @summary   Berechnet Basis-Rettungswurf-Boni (Fort/Ref/Wil) aus Klassen-Stufen nach D&D 3.5e RAW.
 * @exports   SaveCalculator.calculateSaves(classes)
 * @reads     classes[].classType, classes[].level
 * @stateOps  Keine — pure Berechnungsfunktion
 * @depends   CombatRules (rules.js)
 * @notHere   Talent-Boni auf Saves → Combatant.js#rebuildStatModifiers | Save-UI → PCDefenses.js
 */
import { CombatRules } from '../rules.js';

export const SaveCalculator = {
  calculateSaves(classes) {
    let fort = 0;
    let ref = 0;
    let wil = 0;
    if (Array.isArray(classes)) {
      classes.forEach(c => {
        const activeClass = CombatRules.CLASSES.find(x => x.key === c.classType);
        if (activeClass && activeClass.key !== 'custom') {
          fort += CombatRules.calculateSave(activeClass.saves.fort, c.level);
          ref += CombatRules.calculateSave(activeClass.saves.ref, c.level);
          wil += CombatRules.calculateSave(activeClass.saves.wil, c.level);
        }
      });
    }
    return { fort, ref, wil };
  }
};
