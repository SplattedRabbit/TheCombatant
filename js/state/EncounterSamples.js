/**
 * @module    EncounterSamples
 * @summary   Seeding and loading D&D 3.5e sample party and encounter setups.
 * @exports   loadSampleData
 * @reads     s.mode, s.session
 * @stateOps  Updates meta, combatants, concentrations, turn, round, and triggers sync
 * @depends   state-core, StorageManager, model-core, EncounterManager, encounter-samples
 */

import { getState, getActivePC, StateEvents } from './state-core.js';
import { saveToStorage } from './StorageManager.js';
import { createCombatant, createConcentration } from '../models/model-core.js';
import { sortCombatants, triggerSync } from './EncounterManager.js';
import {
  aranisSample,
  morgwenSample,
  thordakSample,
  lysaraSample,
  wizardLvl10Sample,
  rangerLvl10Sample,
  paladinLvl10Sample
} from '../data/encounter-samples.js';

export function loadSampleData(choice) {
  const s = getState();
  
  if (s.mode === 'player' || (s.session && s.session.role === 'client')) {
    const currentPC = getActivePC();
    if (currentPC) {
      const currentId = currentPC.id;
      
      Object.keys(currentPC).forEach(key => {
        if (key !== 'id') {
          delete currentPC[key];
        }
      });
      
      let template = aranisSample; // fallback
      if (choice === 'wizard_lvl10') template = wizardLvl10Sample;
      else if (choice === 'ranger_lvl10') template = rangerLvl10Sample;
      else if (choice === 'paladin_lvl10') template = paladinLvl10Sample;
      else if (choice === 'paladin_lvl3') template = aranisSample;
      
      const newPC = createCombatant(template);
      Object.assign(currentPC, newPC);
      currentPC.id = currentId;
      
      if (typeof currentPC.rebuildStatModifiers === 'function') {
        currentPC.rebuildStatModifiers();
      }
      
      saveToStorage();
      StateEvents.emit('pc_changed', currentPC, { forceFullSync: true });
      StateEvents.emit('state_changed', s);
    }
    return;
  }

  // DM / host mode
  s.combatants = [];
  s.turn = 0;
  s.round = 1;

  if (choice === 'party_lvl10') {
    s.concentrations = [
      createConcentration({ who: 'Lysara die Erhabene', spell: 'stoneskin', dur: 5 })
    ];

    const samples = [
      wizardLvl10Sample,
      rangerLvl10Sample,
      paladinLvl10Sample,
      { name: 'Junger Roter Drache', init: 4, hp: 120, ac: 22, acTouch: 10, acFlat: 22, bw: 150, za: 10, ref: 8, wil: 9, type: 'e' },
      { name: 'Steingigant 1', init: 2, hp: 119, ac: 25, acTouch: 11, acFlat: 25, bw: 40, za: 11, ref: 6, wil: 7, type: 'e' },
      { name: 'Steingigant 2', init: 2, hp: 119, ac: 25, acTouch: 11, acFlat: 25, bw: 40, za: 11, ref: 6, wil: 7, type: 'e' }
    ];

    samples.forEach(samp => {
      s.combatants.push(createCombatant(samp));
    });
  } else {
    // Default / standard lvl 3/4 goblin encounter
    s.concentrations = [
      createConcentration({ who: 'Lysara', spell: 'Magiepfeil (Fokus)', dur: 0 }),
      createConcentration({ who: 'Goblin-Schamane', spell: 'Dornenwuchs', dur: 3 })
    ];

    const samples = [
      aranisSample,
      morgwenSample,
      thordakSample,
      lysaraSample,
      { name: 'Goblin-Hauptmann', init: 14, hp: 16, ac: 15, bw: 30, za: 1, ref: 2, wil: 1, type: 'e' },
      { name: 'Goblin Bogenschütz.1', init: 10, hp: 8, ac: 13, bw: 30, za: 0, ref: 2, wil: 0, type: 'e' },
      { name: 'Goblin Bogenschütz.2', init: 10, hp: 3, maxHP: 8, ac: 13, bw: 30, za: 0, ref: 2, wil: 0, type: 'e' },
      { name: 'Warg', init: 6, hp: 20, ac: 14, bw: 50, za: 3, ref: 2, wil: 1, type: 'e' },
      { name: 'Goblin-Schamane', init: 9, hp: 12, ac: 12, bw: 30, za: 2, ref: 1, wil: 4, type: 'n' }
    ];

    samples.forEach(samp => {
      s.combatants.push(createCombatant(samp));
    });
  }

  sortCombatants();
  triggerSync();

  const activePC = s.combatants.find(c => c.type === 'p');
  if (activePC) {
    StateEvents.emit('pc_changed', activePC);
  }
}
