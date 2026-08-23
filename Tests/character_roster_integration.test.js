import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CharacterService } from '../src/services/character/CharacterService.ts';
import { LocalStorageAdapter } from '../src/services/storage/LocalStorageAdapter.ts';
import { storageService } from '../src/services/storage/StorageService.ts';
import { CombatState } from '../js/state.js';
import { getActivePC, getState } from '../js/state/state-core.js';
import { createCombatant, createInitialState } from '../js/models/model-core.js';

describe('Character Roster Integration Test Suite', () => {
  let service;

  beforeEach(() => {
    if (globalThis.localStorage && typeof globalThis.localStorage.clear === 'function') {
      globalThis.localStorage.clear();
    }
    const adapter = new LocalStorageAdapter();
    storageService.setAdapter(adapter);
    CombatState.setStorageAdapter(storageService);
    service = CharacterService.getInstance();
  });

  test('4.6.2.1 Multi-Character Switch & Zero-Loss Isolation', async () => {
    // 1. Erstelle Held A (Valeros, Krieger, HP 40)
    const stateA = createInitialState();
    const pcA = createCombatant({ id: 'pc-valeros', name: 'Valeros', hp: 40, maxHp: 40, type: 'p' });
    stateA.combatants = [pcA];
    const charA = await service.createCharacter({ name: 'Valeros', level: 4, initialData: stateA });

    // 2. Erstelle Held B (Seoni, Zauberin, HP 20)
    const stateB = createInitialState();
    const pcB = createCombatant({ id: 'pc-seoni', name: 'Seoni', hp: 20, maxHp: 20, type: 'p' });
    stateB.combatants = [pcB];
    const charB = await service.createCharacter({ name: 'Seoni', level: 4, initialData: stateB });

    // 3. Wechsle zu Held A und modifiziere Werte (HP runter auf 28)
    await service.switchActiveCharacter(charA.id);
    let activePC = getActivePC();
    assert.equal(activePC.name, 'Valeros');
    activePC.hp = 28;
    CombatState.saveToStorage();

    // 4. Wechsle zu Held B und modifiziere Werte (HP runter auf 14)
    await service.switchActiveCharacter(charB.id);
    activePC = getActivePC();
    assert.equal(activePC.name, 'Seoni');
    assert.equal(activePC.hp, 20); // ursprünglicher Wert von Seoni
    activePC.hp = 14;
    CombatState.saveToStorage();

    // 5. Wechsle zurück zu Held A -> Verifikation: HP sind immer noch 28!
    await service.switchActiveCharacter(charA.id);
    activePC = getActivePC();
    assert.equal(activePC.name, 'Valeros');
    assert.equal(activePC.hp, 28, 'Valeros muss die modifizierten 28 HP exakt behalten haben');

    // 6. Wechsle zurück zu Held B -> Verifikation: HP sind immer noch 14!
    await service.switchActiveCharacter(charB.id);
    activePC = getActivePC();
    assert.equal(activePC.name, 'Seoni');
    assert.equal(activePC.hp, 14, 'Seoni muss die modifizierten 14 HP exakt behalten haben');
  });

  test('4.6.2.2 Lösch-Fallback: Löschen des aktiven Helden schaltet auf verbleibenden um', async () => {
    const char1 = await service.createCharacter({ name: 'Held Eins' });
    const char2 = await service.createCharacter({ name: 'Held Zwei' });

    await service.switchActiveCharacter(char1.id);
    assert.equal(getActivePC().name, 'Held Eins');

    // Lösche Held Eins (den aktuell aktiven)
    await service.deleteCharacter(char1.id);

    // Es muss automatisch Held Zwei aktiv sein
    const active = getActivePC();
    assert.equal(active.name, 'Held Zwei');
  });
});
