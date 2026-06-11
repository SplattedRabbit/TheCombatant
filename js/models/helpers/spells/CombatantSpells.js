/**
 * @module    CombatantSpells
 * @summary   Orchestriert die Zauber- und Vorbereitungsfunktionen des Charakters.
 * @exports   findSpell(pc, key), prepareSpell(pc, spellKey, metamagicList, isSpecialist), unprepareSpell(pc, id), applySpellTemplate(pc, name), castPreparedSpell(pc, id), castSpontaneousSpell(pc, spellKey, slotLevel)
 * @reads     pc.preparedSpells, pc.spellSlots
 * @stateOps  keine
 * @depends   SpellFinder, SpellPreparation, SpellTemplateApplier
 * @notHere   Konkrete Implementierungen -> Sub-Helper (SpellFinder, SpellPreparation, SpellTemplateApplier)
 */

import { findSpell } from './SpellFinder.js';
import { prepareSpell, unprepareSpell, castPreparedSpell, castSpontaneousSpell } from './SpellPreparation.js';
import { applySpellTemplate } from './SpellTemplateApplier.js';

export {
  findSpell,
  prepareSpell,
  unprepareSpell,
  applySpellTemplate,
  castPreparedSpell,
  castSpontaneousSpell
};
