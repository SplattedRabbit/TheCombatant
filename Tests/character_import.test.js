import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CharacterService } from '../src/services/character/CharacterService.ts';
import { LocalStorageAdapter } from '../src/services/storage/LocalStorageAdapter.ts';
import { storageService } from '../src/services/storage/StorageService.ts';
import { CombatState } from '../js/state.js';
import { getActivePC } from '../js/state/state-core.js';
import { createCombatant, createInitialState } from '../js/models/model-core.js';

describe('Safe Character Import Test Suite', () => {
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

  test('1. parseImportData correctly extracts PC and state shell from full state dump', () => {
    const fullDump = {
      combatants: [
        { id: 'pc-origin', type: 'p', name: 'Aranis', race: 'Elf', level: 10, hp: 55, maxHP: 55 }
      ],
      meta: { begegnung: 'Dungeon' }
    };

    const parsed = service.parseImportData(fullDump);
    assert.equal(parsed.originalName, 'Aranis');
    assert.equal(parsed.pc.name, 'Aranis');
    assert.equal(parsed.pc.race, 'Elf');
    assert.equal(parsed.stateData.meta.begegnung, 'Dungeon');
  });

  test('2. parseImportData correctly wraps standalone PC combatant object', () => {
    const rawPC = {
      type: 'p',
      name: 'Gimli',
      race: 'Dwarf',
      level: 5,
      hp: 42
    };

    const parsed = service.parseImportData(rawPC);
    assert.equal(parsed.originalName, 'Gimli');
    assert.equal(parsed.pc.name, 'Gimli');
    assert.equal(parsed.stateData.mode, 'player');
    assert.ok(Array.isArray(parsed.stateData.combatants));
    assert.equal(parsed.stateData.combatants[0].name, 'Gimli');
  });

  test('3. findExistingCharacterByName detects exact and case-insensitive duplicates in roster', async () => {
    await service.createCharacter({ name: 'Thoradin', level: 3 });

    const matchExact = await service.findExistingCharacterByName('Thoradin');
    assert.ok(matchExact);
    assert.equal(matchExact.name, 'Thoradin');

    const matchLower = await service.findExistingCharacterByName('  thoradin  ');
    assert.ok(matchLower);
    assert.equal(matchLower.name, 'Thoradin');

    const noMatch = await service.findExistingCharacterByName('Legolas');
    assert.equal(noMatch, null);
  });

  test('4. importCharacterFromJson DOES NOT overwrite active character', async () => {
    // 1. Erstelle aktiven Charakter "Aranis"
    const stateA = createInitialState();
    const pcA = createCombatant({ id: 'pc-aranis', name: 'Aranis', hp: 50, maxHp: 50, type: 'p' });
    stateA.combatants = [pcA];
    const charA = await service.createCharacter({ name: 'Aranis', level: 10, initialData: stateA });
    await service.switchActiveCharacter(charA.id);

    let currentActive = getActivePC();
    assert.equal(currentActive.name, 'Aranis');
    assert.equal(currentActive.hp, 50);

    // 2. Importiere neuen Charakter "Gimli" aus JSON-String
    const gimliState = {
      combatants: [
        { id: 'pc-gimli-external', type: 'p', name: 'Gimli', hp: 65, maxHP: 65, race: 'Dwarf', level: 8 }
      ]
    };

    const importedSummary = await service.importCharacterFromJson(JSON.stringify(gimliState));
    assert.equal(importedSummary.name, 'Gimli');

    // 3. Verifiziere: Der aktive Charakter ist IMMER NOCH Aranis, völlig unberührt!
    currentActive = getActivePC();
    assert.equal(currentActive.name, 'Aranis', 'Aktiver Charakter darf nicht überschrieben worden sein');
    assert.equal(currentActive.hp, 50);

    // 4. Verifiziere: Gimli ist sauber zusätzlich im Roster abgelegt
    const roster = await service.listCharacters();
    assert.equal(roster.length, 2);
    const names = roster.map(c => c.name);
    assert.ok(names.includes('Aranis'));
    assert.ok(names.includes('Gimli'));
  });

  test('5. importCharacterFromJson generates fresh unique ID and prevents primary key collision', async () => {
    const exportFile = {
      combatants: [
        { id: 'pc-fixed-id-123', type: 'p', name: 'Ranger', hp: 30, maxHP: 30 }
      ]
    };

    // Importiere dieselbe Datei zweimal
    const firstImport = await service.importCharacterFromJson(exportFile);
    const secondImport = await service.importCharacterFromJson(exportFile, 'Ranger (Copy)');

    assert.notEqual(firstImport.id, secondImport.id, 'Roster-IDs müssen unterschiedlich sein');

    // Lade beide aus dem Storage und prüfe interne PC IDs
    const char1Data = await service.getCharacter(firstImport.id);
    const char2Data = await service.getCharacter(secondImport.id);

    const pc1 = char1Data.combatants.find(c => c.type === 'p');
    const pc2 = char2Data.combatants.find(c => c.type === 'p');

    assert.notEqual(pc1.id, 'pc-fixed-id-123', 'Ursprüngliche ID muss durch neue ID ersetzt werden');
    assert.notEqual(pc2.id, 'pc-fixed-id-123');
    assert.notEqual(pc1.id, pc2.id, 'Interne PC IDs dürfen nicht kollidieren');
    assert.equal(pc1.name, 'Ranger');
    assert.equal(pc2.name, 'Ranger (Copy)');
  });

  test('6. User can switch to imported character cleanly without data loss', async () => {
    // 1. Initialer Charakter
    const charA = await service.createCharacter({ name: 'Active Hero', level: 1 });
    await service.switchActiveCharacter(charA.id);

    // 2. Importiere neuen Charakter
    const importPayload = {
      combatants: [{ type: 'p', name: 'Imported Mage', level: 7, hp: 28, maxHP: 28 }]
    };
    const imported = await service.importCharacterFromJson(importPayload);

    // 3. Wechsle jetzt explizit zum importierten Charakter
    const switched = await service.switchActiveCharacter(imported.id);
    assert.equal(switched, true);

    const activePC = getActivePC();
    assert.equal(activePC.name, 'Imported Mage');
    assert.equal(activePC.level, 7);
  });
});
