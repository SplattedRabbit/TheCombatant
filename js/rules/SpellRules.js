/**
 * @module    SpellRules
 * @summary   Pure D&D 3.5e Zauber-Regellogik: Bannschulen-Bereinigung, Zauberlimit-Checks.
 * @exports   cleanProhibitedSpells
 * @reads     pc.learnedSpells, pc.classes, pc.wizardProhibited1, pc.wizardProhibited2, pc.customSpells
 * @stateOps  keine — pure Funktionen, mutieren pc direkt (Caller ist für State-Save zuständig)
 * @depends   spells.js
 * @notHere   Slot-Berechnung → SpellSlotCalculator.js | Spell-Suche → spells.js | UI → src/components/
 */
import { getSpellSchoolCode, getSchoolCodeFromInput, findSpell } from '../spells.js';

/**
 * Entfernt alle Zauber aus pc.learnedSpells die einer Bannschule des Magiers angehören.
 * @param {object} pc - Der aktive Charakter
 * @returns {string[]} Namen der entfernten Zauber (leer wenn nichts entfernt wurde)
 */
export function cleanProhibitedSpells(pc) {
  if (!pc.classes || !pc.classes.some(c => c.classType === 'wizard')) return [];
  if (!Array.isArray(pc.learnedSpells) || pc.learnedSpells.length === 0) return [];

  const prob1 = getSchoolCodeFromInput(pc.wizardProhibited1);
  const prob2 = getSchoolCodeFromInput(pc.wizardProhibited2);

  if (!prob1 && !prob2) return [];

  const spellsToKeep = [];
  const removedNames = [];

  pc.learnedSpells.forEach(key => {
    const spell = findSpell(pc, key);
    if (spell) {
      const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);
      if (schoolCode && schoolCode !== 'univ') {
        if (schoolCode === prob1 || schoolCode === prob2) {
          removedNames.push(spell.nameDe || spell.nameEn || key);
          return;
        }
      }
    }
    spellsToKeep.push(key);
  });

  if (removedNames.length > 0) {
    pc.learnedSpells = spellsToKeep;
  }

  return removedNames;
}
