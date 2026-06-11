/**
 * @module    SpellPreparation
 * @summary   Verwaltet das Vorbereiten, Löschen und Wirken von Zaubern für Charaktere.
 * @exports   prepareSpell(pc, spellKey, metamagicList, isSpecialist), unprepareSpell(pc, id), castPreparedSpell(pc, id), castSpontaneousSpell(pc, spellKey, slotLevel)
 * @reads     pc.preparedSpells, pc.spellSlots
 * @stateOps  keine
 * @depends   SpellFinder, SpellSlotCalculator
 * @notHere   Suche -> SpellFinder.js | Schablonen -> SpellTemplateApplier.js
 */

import { findSpell } from './SpellFinder.js';
import { SpellSlotCalculator } from '../../../rules/SpellSlotCalculator.js';

const generateUid = () => {
  return Date.now() + '-' + Math.random().toString(36).slice(2, 7);
};

export function prepareSpell(pc, spellKey, metamagicList = [], isSpecialist = false) {
  if (!Array.isArray(pc.preparedSpells)) {
    pc.preparedSpells = [];
  }
  const id = generateUid();
  pc.preparedSpells.push({
    id,
    spellKey,
    metamagic: [...metamagicList],
    isUsed: false,
    isSpecialist: !!isSpecialist
  });
  return id;
}

export function unprepareSpell(pc, id) {
  if (Array.isArray(pc.preparedSpells)) {
    pc.preparedSpells = pc.preparedSpells.filter(s => s.id !== id);
  }
}

export function castPreparedSpell(pc, id) {
  if (!Array.isArray(pc.preparedSpells)) return null;
  const prep = pc.preparedSpells.find(s => s.id === id);
  if (prep && !prep.isUsed) {
    prep.isUsed = true;
    const spell = findSpell(pc, prep.spellKey);
    if (spell) {
      const adjustedLevel = SpellSlotCalculator.getAdjustedSpellLevel(spell, prep.metamagic);
      if (pc.spellSlots && pc.spellSlots[adjustedLevel]) {
        pc.spellSlots[adjustedLevel].used = Math.min(pc.spellSlots[adjustedLevel].max, (pc.spellSlots[adjustedLevel].used || 0) + 1);
      }
    }
  }
  return prep;
}

export function castSpontaneousSpell(pc, spellKey, slotLevel) {
  const lvl = parseInt(slotLevel);
  if (pc.spellSlots && pc.spellSlots[lvl]) {
    pc.spellSlots[lvl].used = Math.min(pc.spellSlots[lvl].max, (pc.spellSlots[lvl].used || 0) + 1);
  }
}
