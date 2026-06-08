// Tests/state.test.js - Test suite for client active PC tracking and sheet-locking

import { test } from 'node:test';
import assert from 'node:assert';
import { getState, getActivePC, updateSession } from '../js/state/state-core.js';
import { createCombatant } from '../js/models/model-core.js';

test('state-core - localPCId Tracking und Sheet-Locking', () => {
  const s = getState();
  
  // Setze Session zurück und initialisiere
  s.combatants = [];
  updateSession(true, 'client', 'ROOM999');
  
  // 1. Client lädt das erste Mal seinen Charakter (z.B. aus dem Speicher)
  const myPC = getActivePC();
  myPC.name = 'MeinHeld';
  const myPCId = myPC.id;

  assert.strictEqual(myPC.name, 'MeinHeld');

  // 2. Simuliere das Eintreffen anderer Spielercharaktere (z.B. durch SL-Sync)
  // Wir fügen einen anderen PC "FremderHeld" am Anfang der Liste ein
  const foreignPC = createCombatant({ name: 'FremderHeld', type: 'p', init: 20 });
  s.combatants.unshift(foreignPC); // Am Anfang einfügen
  
  // s.combatants enthält jetzt:
  // [0] FremderHeld
  // [1] MeinHeld (unser Charakter)

  // 3. Wenn getActivePC gerufen wird, muss es immer noch UNSEREN Charakter liefern,
  // obwohl "FremderHeld" jetzt als erstes im Array steht und vom Typ 'p' ist!
  const currentPC = getActivePC();
  
  assert.strictEqual(currentPC.id, myPCId, 'getActivePC liefert immer noch den eigenen PC!');
  assert.strictEqual(currentPC.name, 'MeinHeld', 'Der Name des gelieferten PCs ist korrekt!');
});

test('state-core - getActivePC returns null when session.role is host (DM mode)', () => {
  const s = getState();
  s.combatants = [];
  
  // Simulate DM hosting: display mode is 'dm', session role is 'host'
  s.mode = 'dm';
  updateSession(true, 'host', 'TEST');
  
  const pc = getActivePC();
  assert.strictEqual(pc, null, 'getActivePC should return null when session.role is host');
  assert.strictEqual(s.combatants.length, 0, 'No default PC should be created for DM host');
  
  // Cleanup
  updateSession(false, 'choice', '');
  s.mode = 'choice';
});

test('state-core - local PC is removed from combatants when hosting starts', () => {
  const s = getState();
  s.combatants = [];
  
  // 1. In player/choice mode, getActivePC creates a default PC
  s.mode = 'choice';
  updateSession(false, 'choice', '');
  const pc = getActivePC();
  assert.ok(pc, 'Should create a default PC');
  assert.strictEqual(s.combatants.length, 1, 'Should have 1 PC in combatants');
  
  // 2. Transition to host (DM mode)
  s.mode = 'dm';
  updateSession(true, 'host', 'ROOM123');
  
  // 3. The local PC should be removed from combatants
  assert.strictEqual(s.combatants.length, 0, 'Local PC should be removed from combatants list when hosting');
  assert.strictEqual(getActivePC(), null, 'getActivePC should return null for host');
  
  // Cleanup
  updateSession(false, 'choice', '');
  s.mode = 'choice';
});
