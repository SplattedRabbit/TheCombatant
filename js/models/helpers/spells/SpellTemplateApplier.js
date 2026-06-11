/**
 * @module    SpellTemplateApplier
 * @summary   Wendet eine vorbereitete Zauberschablone auf den Charakter an.
 * @exports   applySpellTemplate(pc, name)
 * @reads     pc.spellTemplates, pc.classes, pc.wizardSpecialization, pc.spellSlots
 * @stateOps  keine
 * @depends   SpellFinder, SpellSlotCalculator, getSpellSchoolCode
 * @notHere   Suche -> SpellFinder.js | Vorbereitung -> SpellPreparation.js
 */

import { findSpell } from './SpellFinder.js';
import { SpellSlotCalculator } from '../../../rules/SpellSlotCalculator.js';
import { getSpellSchoolCode } from '../../../spells.js';

const generateUid = () => {
  return Date.now() + '-' + Math.random().toString(36).slice(2, 7);
};

export function applySpellTemplate(pc, name) {
  const template = pc.spellTemplates && pc.spellTemplates[name];
  if (!template) return { success: false, error: 'Vorlage nicht gefunden.' };

  pc.preparedSpells = [];
  const unplaced = [];
  const isWizard = pc.classes && pc.classes.some(c => c.classType === 'wizard');
  const specSchool = pc.wizardSpecialization || 'none';
  const hasSpec = isWizard && specSchool !== 'none';

  const templateSpellsByLevel = {};
  for (let lvl = 0; lvl <= 9; lvl++) {
    templateSpellsByLevel[lvl] = [];
  }

  template.forEach(item => {
    const spell = findSpell(pc, item.spellKey);
    if (!spell) {
      unplaced.push(item.spellKey);
      return;
    }
    const adjustedLevel = SpellSlotCalculator.getAdjustedSpellLevel(spell, item.metamagic);
    if (adjustedLevel >= 0 && adjustedLevel <= 9) {
      templateSpellsByLevel[adjustedLevel].push({
        spellKey: item.spellKey,
        metamagic: item.metamagic || [],
        school: spell.school,
        nameDe: spell.nameDe || spell.nameEn || item.spellKey
      });
    } else {
      unplaced.push(spell.nameDe || spell.nameEn || item.spellKey);
    }
  });

  for (let lvl = 0; lvl <= 9; lvl++) {
    const spellsToAlloc = templateSpellsByLevel[lvl];
    if (spellsToAlloc.length === 0) continue;

    const maxSlots = pc.spellSlots[lvl]?.max || 0;
    const hasSpecSlotAtLvl = hasSpec && lvl >= 1;
    const specialistSlotCount = hasSpecSlotAtLvl ? 1 : 0;
    const regularSlotCount = Math.max(0, maxSlots - specialistSlotCount);

    const matchesSpecialization = (spell) => {
      const code = getSpellSchoolCode(spell.school, spell.spellKey || '', spell.nameDe || '');
      return code === specSchool;
    };

    let specIndex = -1;
    if (specialistSlotCount > 0) {
      specIndex = spellsToAlloc.findIndex(s => matchesSpecialization(s));
    }

    if (specIndex !== -1) {
      const s = spellsToAlloc[specIndex];
      spellsToAlloc.splice(specIndex, 1);
      pc.preparedSpells.push({
        id: generateUid(),
        spellKey: s.spellKey,
        metamagic: [...s.metamagic],
        isUsed: false,
        isSpecialist: true
      });
    }

    const numToPrep = Math.min(regularSlotCount, spellsToAlloc.length);
    for (let i = 0; i < numToPrep; i++) {
      const s = spellsToAlloc[i];
      pc.preparedSpells.push({
        id: generateUid(),
        spellKey: s.spellKey,
        metamagic: [...s.metamagic],
        isUsed: false,
        isSpecialist: false
      });
    }

    const remaining = spellsToAlloc.slice(numToPrep);
    remaining.forEach(s => {
      unplaced.push(s.nameDe);
    });
  }

  return { success: true, unplaced };
}
