import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { getState, getActivePC, updateSession, setRole } from '../js/state/state-core.js';
import { createCombatant, Stat, createInitialState } from '../js/models/model-core.js';
import { updatePCField, updatePCNumber, togglePCDefensiveFighting, togglePCTotalDefense } from '../js/state/pc/PCGeneral.js';
import assertAlt13 from 'node:assert/strict';
import { applyLoadedState } from '../js/state/StorageManager.js';

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

test('CombatState - loadSampleData choice validation', async () => {
  const { CombatState } = await import('../js/state.js');
  const state = CombatState.getState();
  state.session = { role: 'client' };
  
  // Set an active PC to overwrite
  state.combatants = [{ id: 'active_pc_id', name: 'Held', type: 'p' }];
  
  // 1. Wizard level 10
  CombatState.loadSampleData('wizard_lvl10');
  const wizard = CombatState.getActivePC();
  assert.strictEqual(wizard.name, 'Lysara the Exalted');
  assert.strictEqual(wizard.level, 10);
  assert.strictEqual(wizard.classType, 'wizard');
  assert.strictEqual(wizard.familiarType, 'cat');
  assert.strictEqual(wizard.familiarName, 'Cookie');
  assert.strictEqual(wizard.preparedSpells.length, 6);

  // 2. Ranger level 10
  CombatState.loadSampleData('ranger_lvl10');
  const ranger = CombatState.getActivePC();
  assert.strictEqual(ranger.name, 'Gildor Windrunner');
  assert.strictEqual(ranger.level, 10);
  assert.strictEqual(ranger.classType, 'ranger');
  assert.strictEqual(ranger.companionType, 'wolf');
  assert.strictEqual(ranger.companionName, 'Borko');

  // 3. Paladin level 10
  CombatState.loadSampleData('paladin_lvl10');
  const paladin = CombatState.getActivePC();
  assert.strictEqual(paladin.name, 'Sir Valerius');
  assert.strictEqual(paladin.level, 10);
  assert.strictEqual(paladin.classType, 'paladin');
  assert.strictEqual(paladin.dailyAbilities.length, 3);

  // Test Host/Solo mode loading all three characters + enemies
  state.session = null; // solo mode
  CombatState.loadSampleData('party_lvl10');
  assert.strictEqual(state.combatants.length, 6);
  assert.ok(state.combatants.some(c => c.name === 'Lysara the Exalted'), 'Should contain wizard');
  assert.ok(state.combatants.some(c => c.name === 'Gildor Windrunner'), 'Should contain ranger');
  assert.ok(state.combatants.some(c => c.name === 'Sir Valerius'), 'Should contain paladin');
  assert.ok(state.combatants.some(c => c.name === 'Young Red Dragon'), 'Should contain red dragon');
});

test('CombatState - Companion and Familiar Stats Synchronization', async () => {
  const { CombatState } = await import('../js/state.js');
  const state = CombatState.getState();
  state.combatants = [];

  // Add Ranger Gildor
  const gildor = CombatState.addCombatant({
    id: 'gildor_test',
    name: 'Gildor Windläufer',
    type: 'p',
    hp: 75,
    maxHP: 75,
    init: 8,
    companionType: 'wolf',
    companionName: 'Borko',
    companionHP: 26,
    companionMaxHP: 26
  });

  // Recall Borko
  CombatState.addCombatant({
    id: 'gildor_test-companion',
    name: 'Borko',
    type: 'n',
    hp: 26,
    maxHP: 26,
    init: 8
  });

  // Verify Borko is added
  assert.ok(state.combatants.some(c => c.id === 'gildor_test-companion'));

  // 1. DM updates Borko's HP (direct edit)
  CombatState.updateCombatantNumber('gildor_test-companion', 'hp', 18);
  
  // Verify synchronization back to Gildor's PC object
  assert.strictEqual(gildor.companionHP, 18, 'Gildor companionHP should sync to 18');

  // 2. Client updates companion HP (simulated via mergeIncomingPC)
  const updatedGildorData = JSON.parse(JSON.stringify(gildor));
  updatedGildorData.companionHP = 22;
  updatedGildorData.companionName = 'Borko der Starke';

  CombatState.mergeIncomingPC(updatedGildorData);

  // Verify companion combatant in encounter got updated
  const updatedBorko = state.combatants.find(c => c.id === 'gildor_test-companion');
  assert.strictEqual(updatedBorko.hp, 22, 'Borko HP combatant should sync to 22');
  assert.strictEqual(updatedBorko.name, 'Borko der Starke', 'Borko Name combatant should sync to Borko der Starke');
});

describe("PCGeneral field mutations", () => {
test('PCGeneral Module - field mutations and stats updates', () => {
  const s = getState();
  s.combatants = [];
  updateSession(true, 'client', 'ROOM123');

  const pc = getActivePC();
  pc.name = 'Held';
  pc.race = 'Gnome';

  // Test updatePCField
  updatePCField('race', 'Dwarf');
  assert.strictEqual(pc.race, 'Dwarf', 'updatePCField changes fields correctly');

  // Test updatePCNumber on flat fields
  pc.maxHP = 10;
  updatePCNumber('maxHP', 15);
  assert.strictEqual(pc.maxHP, 15, 'updatePCNumber mutates numbers correctly');

  // Test updatePCNumber on Stat objects
  pc.str = new Stat(10);
  // (10 score -> modifier +0)
  updatePCNumber('str', 14);
  assert.strictEqual(pc.str.base, 14);

  // Test togglePCDefensiveFighting and togglePCTotalDefense mutually exclusive
  togglePCDefensiveFighting(true);
  assert.strictEqual(pc.isDefensiveFighting, true);
  assert.strictEqual(pc.isTotalDefense, false);

  togglePCTotalDefense(true);
  assert.strictEqual(pc.isDefensiveFighting, false);
  assert.strictEqual(pc.isTotalDefense, true);
});
});

describe('Role Routing & DM Screen Access Test Suite', () => {
  beforeEach(() => {
    const s = getState();
    s.mode = 'choice';
    s.session = { active: false, role: 'choice', roomCode: '' };
  });

  test('Selecting DM role sets mode to dm and session.role to host', () => {
    setRole('dm');
    const s = getState();
    assertAlt13.equal(s.mode, 'dm');
    assertAlt13.equal(s.session.role, 'host');
  });

  test('Selecting player role sets mode to player and session.role to player', () => {
    setRole('player');
    const s = getState();
    assertAlt13.equal(s.mode, 'player');
    assertAlt13.equal(s.session.role, 'player');
  });

  test('applyLoadedState preserves DM role and harmonizes mode with host session', () => {
    setRole('dm');
    const campaignState = createInitialState();
    campaignState.meta = { begegnung: 'Dungeon Raid' };
    campaignState.combatants = [];
    campaignState.session = { role: 'host' };

    const ok = applyLoadedState(campaignState, true);
    assertAlt13.equal(ok, true);
    const s = getState();
    assertAlt13.equal(s.mode, 'dm');
    assertAlt13.equal(s.session.role, 'host');
  });

  test('applyLoadedState sets mode to dm if session.role is host even when loaded on fresh state', () => {
    const s = getState();
    s.mode = 'choice';
    s.session = { role: 'choice' };

    const campaignState = createInitialState();
    campaignState.meta = { begegnung: 'Castle Invasion' };
    campaignState.combatants = [];
    campaignState.session = { role: 'host' };

    const ok = applyLoadedState(campaignState, true);
    assertAlt13.equal(ok, true);
    const after = getState();
    assertAlt13.equal(after.session.role, 'host');
    assertAlt13.equal(after.mode, 'dm');
  });
});
