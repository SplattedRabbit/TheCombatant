// Tests/sync.test.js - Test suite for SyncProtocol and state diffing/hydration

import { test } from 'node:test';
import assert from 'node:assert';
import { getObjectDiff, applyObjectDiff, applyIncomingDelta } from '../js/network/SyncProtocol.js';
import { Stat, createCombatant } from '../js/models/model-core.js';
import { getState, getActivePC, updateSession } from '../js/state/state-core.js';

test('SyncProtocol - getObjectDiff (Pfadbasierte Diffs)', () => {
  const oldObj = {
    name: 'Lysara',
    str: new Stat(10),
    hp: 18, // should be ignored
    weapons: [{ name: 'Dolch' }]
  };
  
  const newObj = {
    name: 'Lysara die Mystikerin',
    str: new Stat(12),
    hp: 12, // should be ignored
    weapons: [{ name: 'Dolch' }, { name: 'Langbogen' }]
  };

  const diff = getObjectDiff(oldObj, newObj);

  // Der Name sollte sich geändert haben
  assert.strictEqual(diff.name, 'Lysara die Mystikerin');
  
  // Die Stärke (Stat) sollte sich als base-Objekt geändert haben
  assert.deepEqual(diff.str, { base: 12 });
  
  // HP-Felder sollten im Diff ignoriert werden (da Option B relative HP-Sync nutzt)
  assert.strictEqual(diff.hp, undefined);
  
  // Das Array weapons sollte als ganzes diffed werden
  assert.ok(Array.isArray(diff.weapons));
  assert.strictEqual(diff.weapons.length, 2);
});

test('SyncProtocol - applyObjectDiff (Flache Zuweisung & Stat-Prototyp-Wiederherstellung)', () => {
  const target = {
    name: 'Lysara',
    str: new Stat(10),
    weapons: []
  };

  const diff = {
    'name': 'Lysara die Große',
    'str': { base: 14 },
    'weapons': [{ name: 'Zauberstab' }]
  };

  applyObjectDiff(target, diff);

  // Einfache Felder
  assert.strictEqual(target.name, 'Lysara die Große');
  
  // Stat-Objekte sollten ihre Instanz (Klasse) und base-Werte aktualisieren
  assert.ok(target.str instanceof Stat);
  assert.strictEqual(target.str.base, 14);
  assert.strictEqual(target.str.getValue(), 14);
  
  // Array-Zuweisung
  assert.strictEqual(target.weapons[0].name, 'Zauberstab');
});

test('SyncProtocol - Array-Hydrierung (Bugfix v2.1 Verifikation)', () => {
  const stateMock = {
    combatants: []
  };

  const diff = {
    'combatants': [
      { id: '123', name: 'Aranis', type: 'p', str: { base: 16 } }
    ]
  };

  applyObjectDiff(stateMock, diff);

  // Die combatants im Array sollten wieder als echte Combatant- und Stat-Instanzen auferstehen
  assert.strictEqual(stateMock.combatants.length, 1);
  const pc = stateMock.combatants[0];
  
  // Überprüfung der hydrierten Klassen-Instanzen
  assert.strictEqual(pc.name, 'Aranis');
  assert.ok(pc.str instanceof Stat, 'pc.str sollte eine Stat-Instanz sein');
  assert.strictEqual(pc.str.base, 16);
});

test('SyncProtocol - Löschschutz auf Spielerseite (Safeguard v2.2 Verifikation)', () => {
  const s = getState();
  
  // Setup Session: Rolle als Client (Spieler)
  updateSession(true, 'client', 'ROOM123');
  s.mode = 'player';
  s.combatants = [];

  // Hole den aktiven PC (erzeugt Default PC "Held")
  const activePC = getActivePC();
  const pcId = activePC.id;

  // Der PC ist nun in s.combatants
  assert.ok(s.combatants.some(c => c.id === pcId));

  // Simuliere einen state_diff vom Host, der den PC löscht (indem er die Liste leert)
  const diffPacket = {
    type: 'state_diff',
    diff: {
      'combatants': [] // Host löscht alle Kämpfer
    }
  };

  applyIncomingDelta(diffPacket, 'client');

  // Trotz der Löschung durch den Host darf der eigene PC lokal NICHT gelöscht worden sein!
  assert.ok(s.combatants.some(c => c.id === pcId), 'Der eigene PC wurde durch den Löschschutz erfolgreich wiederhergestellt!');
});

test('SyncProtocol - Sample Data / Template change generates full update_pc with full HP', async () => {
  const { clearCachedPCState, getPCStateDiff } = await import('../js/network/SyncProtocol.js');
  const { CombatState } = await import('../js/state.js');
  
  clearCachedPCState();
  const s = getState();
  s.combatants = [];
  const pc = getActivePC();
  pc.name = 'Held';
  pc.hp = 10;
  pc.maxHP = 10;

  // Initial diff seeds cache
  let packet = getPCStateDiff();
  assert.strictEqual(packet.type, 'update_pc');

  // Load Paladin lvl 10 template
  CombatState.loadSampleData('paladin_lvl10');
  
  // Diff must detect name/maxHP change and send full update_pc with full HP
  const updatedPC = getActivePC();
  assert.strictEqual(updatedPC.hp, updatedPC.maxHP);

  const syncPacket = getPCStateDiff();
  assert.ok(syncPacket);
  if (syncPacket.type === 'update_pc') {
    assert.strictEqual(syncPacket.pc.hp, updatedPC.maxHP);
    assert.strictEqual(syncPacket.pc.maxHP, updatedPC.maxHP);
  } else if (syncPacket.type === 'pc_diff') {
    assert.strictEqual(syncPacket.diff.hp, updatedPC.maxHP);
    assert.strictEqual(syncPacket.diff.maxHP, updatedPC.maxHP);
  }
});

test('SyncProtocol - Initiative roll transmits total value (d20 + modifiers) to DM', async () => {
  const { CombatState } = await import('../js/state.js');
  const EncounterManager = await import('../js/state/EncounterManager.js');

  const s = getState();
  s.combatants = [];
  const pc = getActivePC();
  pc.dex = new Stat(16); // Dex mod +3
  pc.iniMisc = 4; // Misc mod +4 -> Total mod +7
  
  // Player rolls 14 on d20
  const rawRoll = 14;
  const dexMod = 3;
  const totIni = dexMod + 4; // 7
  const totalVal = rawRoll + totIni; // 21

  pc.rawInit = rawRoll;
  pc.init = totalVal;

  assert.strictEqual(pc.rawInit, 14);
  assert.strictEqual(pc.init, 21);

  // Host merges incoming PC
  const ok = EncounterManager.mergeIncomingPC(pc);
  assert.strictEqual(ok, true);

  const dmCombatant = s.combatants.find(c => c.id === pc.id);
  assert.ok(dmCombatant);
  assert.strictEqual(dmCombatant.init, 21, 'DM must receive total initiative value (21), not raw 14');
});

test('SyncProtocol - DM Parchment Message Receiving Logic', async () => {
  const { CombatState } = await import('../js/state.js');
  const state = CombatState.getState();
  state.combatants = [];

  // Setup client active PC
  CombatState.addCombatant({
    id: 'gildor_test',
    name: 'Gildor Windläufer',
    type: 'p',
    hp: 75,
    maxHP: 75,
    init: 8
  });
  
  state.localPCId = 'gildor_test';

  // Test Case 1: Message to 'all'
  const packetAll = {
    type: 'dm_message',
    text: 'Hier ist eine Nachricht an alle!',
    targetPCId: 'all'
  };

  applyIncomingDelta(packetAll, 'client');
  
  await new Promise(resolve => setTimeout(resolve, 10));
  let overlay = document.body.children.find(c => c.id === 'parchmentMessageOverlay');
  assert.ok(overlay, 'Overlay should be created for "all" message');
  assert.ok(overlay.innerHTML && overlay.innerHTML.includes('Hier ist eine Nachricht an alle!'), 'Overlay content check');
  overlay.remove();

  // Test Case 2: Message target matches current player
  const packetGildor = {
    type: 'dm_message',
    text: 'Eine geheime Nachricht für Gildor!',
    targetPCId: 'gildor_test'
  };

  applyIncomingDelta(packetGildor, 'client');
  await new Promise(resolve => setTimeout(resolve, 10));
  let overlay2 = document.body.children.find(c => c.id === 'parchmentMessageOverlay');
  assert.ok(overlay2, 'Overlay should be created for matched player ID');
  assert.ok(overlay2.innerHTML && overlay2.innerHTML.includes('Eine geheime Nachricht für Gildor!'), 'Overlay content check for Gildor');
  overlay2.remove();

  // Test Case 3: Message target does NOT match current player
  const packetValerius = {
    type: 'dm_message',
    text: 'Geheimnis für Sir Valerius',
    targetPCId: 'valerius_test'
  };

  applyIncomingDelta(packetValerius, 'client');
  await new Promise(resolve => setTimeout(resolve, 10));
  let overlay3 = document.body.children.find(c => c.id === 'parchmentMessageOverlay');
  assert.ok(!overlay3, 'Overlay should NOT be created for mismatched player ID');
});

test('SyncProtocol - Bug 25: getEncounterStateDiff explicitly includes combatant HP changes', async () => {
  const { initializeCaches, getEncounterStateDiff } = await import('../js/network/SyncProtocol.js');
  const { getState } = await import('../js/state/state-core.js');
  const s = getState();
  s.combatants = [
    createCombatant({ id: 'goblin-1', name: 'Goblin', type: 'e', hp: 12, maxHP: 12 })
  ];

  initializeCaches();

  // DM deals 5 damage to Goblin (HP 12 -> 7)
  s.combatants[0].hp = 7;
  const diffPacket = getEncounterStateDiff();

  assert.ok(diffPacket, 'Must generate diff packet');
  assert.strictEqual(diffPacket.type, 'state_diff');
  assert.strictEqual(diffPacket.diff['combatants.0.hp'], 7, 'Must explicitly include combatants.0.hp in state_diff');
});

test('SyncProtocol - Bug 26: DM state_diff does NOT overwrite client PC local spell slots or inventory', async () => {
  const s = getState();
  updateSession(true, 'client', 'ROOM123');
  s.mode = 'player';
  s.combatants = [];

  const pc = getActivePC();
  pc.id = 'player-mage';
  pc.name = 'Mage';
  pc.preparedSpells = [{ id: 'fireball', name: 'Fireball', level: 3 }];
  pc.items = [{ id: 'wand-1', name: 'Wand of Magic Missile' }];

  // Host sends state_diff where combatants array has a stripped/outdated copy of the player
  const hostDiff = {
    type: 'state_diff',
    diff: {
      'round': 2,
      'turn': 1,
      'combatants': [
        { id: 'player-mage', name: 'Mage', type: 'p', preparedSpells: [], items: [] },
        { id: 'orc-1', name: 'Orc', type: 'e', hp: 15 }
      ]
    }
  };

  applyIncomingDelta(hostDiff, 'client');

  const clientPC = s.combatants.find(c => c.id === 'player-mage');
  assert.ok(clientPC, 'Client PC must exist');
  assert.strictEqual(clientPC.preparedSpells.length, 1, 'Local prepared spells must be preserved');
  assert.strictEqual(clientPC.preparedSpells[0].name, 'Fireball');
  assert.strictEqual(clientPC.items.length, 1, 'Local items must be preserved');
  assert.strictEqual(s.round, 2, 'Host round advancement must be applied');
  assert.ok(s.combatants.some(c => c.id === 'orc-1'), 'Orc from host must be included');
});

test('SyncProtocol - Bug 27: pc_diff with initiative triggers automatic combatants sorting on host', async () => {
  const s = getState();
  updateSession(true, 'host', 'ROOM123');
  s.mode = 'dm';
  s.combatants = [
    createCombatant({ id: 'pc-slow', name: 'Slow Hero', type: 'p', init: 5 }),
    createCombatant({ id: 'orc', name: 'Orc', type: 'e', init: 15 })
  ];

  // Client sends pc_diff with higher initiative (25)
  const initDiff = {
    type: 'pc_diff',
    id: 'pc-slow',
    diff: { init: 25, rawInit: 20 }
  };

  applyIncomingDelta(initDiff, 'host');

  // Combatants should now be sorted descending by initiative: pc-slow (25), then orc (15)
  assert.strictEqual(s.combatants[0].id, 'pc-slow', 'PC with 25 init must be sorted to position 0 on host');
  assert.strictEqual(s.combatants[1].id, 'orc', 'Orc with 15 init must be sorted to position 1 on host');
});

test('SyncProtocol - Bug 28: Stat hydration supports english saves (baseFort, baseWill, fort, will)', () => {
  const target = {
    baseFort: new Stat(0),
    fort: new Stat(0),
    baseWill: new Stat(0),
    will: new Stat(0)
  };

  const diff = {
    'baseFort': { base: 4 },
    'fort': { base: 6 },
    'baseWill': { base: 3 },
    'will': { base: 5 }
  };

  applyObjectDiff(target, diff);

  assert.ok(target.baseFort instanceof Stat, 'baseFort must be Stat instance');
  assert.strictEqual(target.baseFort.base, 4);
  assert.ok(target.fort instanceof Stat, 'fort must be Stat instance');
  assert.strictEqual(target.fort.base, 6);
  assert.ok(target.baseWill instanceof Stat, 'baseWill must be Stat instance');
  assert.strictEqual(target.baseWill.base, 3);
  assert.ok(target.will instanceof Stat, 'will must be Stat instance');
  assert.strictEqual(target.will.base, 5);
});

test('SyncProtocol - Bug 31: getActivePC preserves identity via stored localPCId across reloads', async () => {
  const { setLocalPCId, getActivePC } = await import('../js/state/state-core.js');
  const s = getState();
  s.combatants = [
    createCombatant({ id: 'char-1', name: 'Fighter', type: 'p' }),
    createCombatant({ id: 'char-2', name: 'Rogue', type: 'p' }),
    createCombatant({ id: 'char-3', name: 'Cleric', type: 'p' })
  ];

  // Simulate user switching to char-2 (Rogue)
  setLocalPCId('char-2');

  const pc = getActivePC();
  assert.strictEqual(pc.id, 'char-2', 'Must return char-2 based on stored localPCId, not fallback to char-1');
});


