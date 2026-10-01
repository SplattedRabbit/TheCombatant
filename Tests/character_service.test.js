import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CharacterService } from '../src/services/character/CharacterService.ts';
import { LocalStorageAdapter } from '../src/services/storage/LocalStorageAdapter.ts';
import { storageService } from '../src/services/storage/StorageService.ts';

describe('CharacterService Test Suite', () => {
  let service;

  beforeEach(() => {
    if (globalThis.localStorage && typeof globalThis.localStorage.clear === 'function') {
      globalThis.localStorage.clear();
    }
    storageService.setAdapter(new LocalStorageAdapter());
    service = CharacterService.getInstance();
  });

  test('4.6.1.1 CRUD-Lifecycle: Anlegen, Auflisten, Laden und Löschen', async () => {
    // 1. Create character
    const created = await service.createCharacter({
      name: 'Ragnar',
      race: 'dwarf',
      classSummary: 'Barbar 4',
      level: 4,
    });

    assert.ok(created.id, 'Charakter muss eine ID haben');
    assert.equal(created.name, 'Ragnar');

    // 2. List characters
    const list = await service.listCharacters();
    assert.ok(list.length >= 1);
    const found = list.find((c) => c.name === 'Ragnar');
    assert.ok(found, 'Ragnar muss in der Liste auffindbar sein');

    // 3. Load full character
    const fullData = await service.getCharacter(created.id);
    assert.ok(fullData, 'Vollständige Daten müssen geladen werden');

    // 4. Delete character
    await service.deleteCharacter(created.id);
    const afterDelete = await service.listCharacters();
    assert.ok(!afterDelete.some((c) => c.id === created.id), 'Ragnar darf nach Löschen nicht mehr existieren');
  });

  test('4.6.1.2 Duplizierung: Erzeugt neue ID und behält Werte mit (Kopie) Suffix', async () => {
    const charA = await service.createCharacter({
      name: 'Merisiel',
      race: 'elf',
      classSummary: 'Schurke 5',
      level: 5,
    });

    const dup = await service.duplicateCharacter(charA.id);
    assert.notEqual(dup.id, charA.id, 'Duplikat muss neue ID erhalten');
    assert.equal(dup.name, 'Merisiel (Copy)');

    const list = await service.listCharacters();
    assert.equal(list.filter((c) => c.name.includes('Merisiel')).length, 2);
  });

  test('4.6.1.3 1-Klick-Import aus LocalStorage', async () => {
    const localState = {
      combatants: [{ id: 'old-pc', name: 'Altheld', type: 'p', race: 'human', level: 3, classSummary: 'Kämpfer 3' }]
    };

    globalThis.localStorage.setItem('dd_combatsheet_state', JSON.stringify(localState));

    const imported = await service.importFromLocalStorage();
    assert.ok(imported, 'Import muss erfolgreich sein');
    assert.equal(imported.name, 'Altheld');
    assert.equal(imported.level, 3);
  });

  test('4.6.1.4 Löschung des einzigen aktiven Helden: Bereinigt State-Key und erzeugt sicheren Fallback-Helden ohne Zombie-Status', async () => {
    // 1. Create a character
    const char1 = await service.createCharacter({
      name: 'Held Zur Loeschung',
      race: 'Dwarf',
      classSummary: 'Krieger 1',
      level: 1
    });
    await service.switchActiveCharacter(char1.id);

    // Verify stored in storage
    assert.ok(globalThis.localStorage.getItem(`dd_character_${char1.id}`));

    // 2. Delete the only active character
    await service.deleteCharacter(char1.id);

    // 3. Verify character is completely removed from storage
    assert.strictEqual(globalThis.localStorage.getItem(`dd_character_${char1.id}`), null, 'Character record must be deleted');

    // 4. Verify listCharacters does NOT contain the deleted character as zombie
    const remaining = await service.listCharacters();
    assert.strictEqual(remaining.some((c) => c.id === char1.id), false, 'Deleted character ID must not exist in list');

    // 5. A fresh Hero must have been created
    assert.ok(remaining.length >= 1, 'A fallback Hero must exist');
    assert.strictEqual(remaining[0].name, 'Hero', 'Fallback character is named Hero');
  });

  test('4.6.1.5 Bug 29: switchActiveCharacter updates localPCId and active character state', async () => {
    const { getActivePC } = await import('../js/state/state-core.js');
    const charA = await service.createCharacter({ name: 'Char A', race: 'Elf', level: 2 });
    const charB = await service.createCharacter({ name: 'Char B', race: 'Dwarf', level: 3 });

    await service.switchActiveCharacter(charB.id);

    const activePC = getActivePC();
    assert.ok(activePC);
    assert.strictEqual(activePC.name, 'Char B', 'Active PC name should be Char B');
  });
});
