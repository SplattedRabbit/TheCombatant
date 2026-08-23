import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CombatState } from '../js/state.js';
import { getState, getActivePC } from '../js/state/state-core.js';
import { setStorageAdapter, getStorageAdapter, applyLoadedState } from '../js/state/StorageManager.js';
import { Combatant } from '../js/models/Combatant.js';

describe('StorageManager Bridge Test Suite', () => {
  beforeEach(() => {
    if (globalThis.localStorage && typeof globalThis.localStorage.clear === 'function') {
      globalThis.localStorage.clear();
    }
  });

  test('3.8.4.1 Adapter-Injection: setStorageAdapter leitet saveToStorage und loadFromStorage transparent weiter', () => {
    let savedState = null;
    let clearCalled = false;

    const mockAdapter = {
      name: 'mock-custom',
      saveState(state) {
        savedState = JSON.parse(JSON.stringify(state));
      },
      loadState() {
        return savedState;
      },
      clearState() {
        clearCalled = true;
        savedState = null;
      }
    };

    setStorageAdapter(mockAdapter);
    assert.equal(getStorageAdapter().name, 'mock-custom');

    // 1. Save
    const s = getState();
    s.turn = 5;
    s.round = 2;
    CombatState.saveToStorage();

    assert.ok(savedState, 'Mock-Adapter muss State empfangen haben');
    assert.equal(savedState.turn, 5);

    // 2. Load
    const success = CombatState.loadFromStorage();
    assert.equal(success, true);
    assert.equal(getState().turn, 5);
    assert.equal(getState().round, 2);

    // 3. Clear
    CombatState.clearState();
    assert.equal(clearCalled, true, 'clearState() muss Adapter aufgerufen haben');
  });

  test('3.8.4.2 Modell-Hydrierung: Nach dem Laden besitzen Combatants und Concentrations volle Prototypen', () => {
    const rawState = {
      combatants: [
        { id: 'pc-1', name: 'Altheld', type: 'p', hp: 30, maxHp: 35, baseStr: 14 }
      ],
      concentrations: [
        { id: 'conc-1', spellKey: 'bless', spellName: 'Segen' }
      ]
    };

    const applied = applyLoadedState(rawState);
    assert.equal(applied, true);

    const s = getState();
    const pc = s.combatants[0];

    assert.ok(pc instanceof Combatant, 'Combatant muss echte Klassen-Instanz sein');
    assert.equal(typeof pc.rebuildStatModifiers, 'function', 'Combatant muss Prototyp-Methoden wie rebuildStatModifiers besitzen');
    assert.equal(typeof pc.prepareSpell, 'function', 'Combatant muss Spell-Methoden besitzen');
    assert.equal(pc.name, 'Altheld');
    assert.equal(s.concentrations.length, 1);
  });
});
