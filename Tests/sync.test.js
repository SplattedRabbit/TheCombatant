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
