/**
 * @module    SpellFinder
 * @summary   Findet Zauber in der globalen PHB-Registry und den benutzerdefinierten Zaubern des Charakters.
 * @exports   findSpell(pc, key)
 * @reads     pc.customSpells
 * @stateOps  keine
 * @depends   CombatSpells
 * @notHere   Vorbereitung -> SpellPreparation.js | Schablonen -> SpellTemplateApplier.js
 */

import { CombatSpells } from '../../../spells.js';

export function findSpell(pc, key) {
  if (CombatSpells.REGISTRY[key]) {
    return CombatSpells.REGISTRY[key];
  }
  if (Array.isArray(pc.customSpells)) {
    const found = pc.customSpells.find(s => s.id === key || s.nameDe === key);
    if (found) return found;
  }
  return null;
}
