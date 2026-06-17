/**
 * @module    ConcentrationManager
 * @summary   Concentration trackers and state mutators.
 * @exports   addConcentration, removeConcentration, updateConcentrationField
 * @reads     s.concentrations
 * @stateOps  Mutates concentrations, calls triggerSync
 * @depends   state-core, model-core, EncounterManager
 */

import { getState } from './state-core.js';
import { createConcentration } from '../models/model-core.js';
import { triggerSync } from './EncounterManager.js';

export function addConcentration(who, spell, dur) {
  if (!who || !spell) return;
  const conc = createConcentration({ who, spell, dur });
  const s = getState();
  s.concentrations.push(conc);
  triggerSync();
  return conc;
}

export function removeConcentration(id) {
  const s = getState();
  s.concentrations = s.concentrations.filter(c => c.id !== id);
  triggerSync();
}

export function updateConcentrationField(id, field, val) {
  const s = getState();
  const c = s.concentrations.find(x => x.id === id);
  if (c) {
    c[field] = field === 'dur' ? (parseInt(val) || 0) : val;
    triggerSync();
  }
}
