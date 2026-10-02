import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseStorageAdapter } from '../src/services/storage/SupabaseStorageAdapter.ts';
import { LocalStorageAdapter } from '../src/services/storage/LocalStorageAdapter.ts';
import { StorageService, storageService } from '../src/services/storage/StorageService.ts';
import { CharacterService } from '../src/services/character/CharacterService.ts';
import { CombatState } from '../js/state.js';
import { getState, setLocalPCId, getActivePC } from '../js/state/state-core.js';
import { applyWizardCharacterToState } from '../src/components/player/wizard/wizardSaveHelper.ts';
import { sortCombatants, nextTurn, nextRound, mergeIncomingPC } from '../js/state/EncounterManager.js';
import { applyIncomingDelta } from '../js/network/SyncProtocol.js';

function createMockSupabaseClient() {
  const store = {
    characters: new Map(),
    campaigns: new Map(),
  };

  return {
    store,
    from(table) {
      return {
        select(fields) {
          let queryUserId = null;
          let queryId = null;

          const queryObj = {
            eq(col, val) {
              if (col === 'user_id') queryUserId = val;
              if (col === 'id') queryId = val;
              return queryObj;
            },
            order() {
              return queryObj;
            },
            limit() {
              return queryObj;
            },
            async single() {
              if (table === 'characters') {
                const item = store.characters.get(queryId);
                if (!item) return { data: null, error: { message: 'Not found' } };
                return { data: item, error: null };
              }
              return { data: null, error: null };
            },
            then(resolve) {
              if (table === 'characters') {
                const results = [];
                for (const item of store.characters.values()) {
                  if (!queryUserId || item.user_id === queryUserId) {
                    results.push(item);
                  }
                }
                return resolve({ data: results, error: null });
              }
              return resolve({ data: [], error: null });
            }
          };
          return queryObj;
        },
        upsert(payload, opts) {
          const id = payload.id || 'char-uuid-1';
          const savedRow = { ...payload, id };
          store.characters.set(id, savedRow);

          return {
            select() {
              return {
                async single() {
                  return { data: savedRow, error: null };
                }
              };
            }
          };
        },
        update(payload) {
          let queryId = null;
          let queryUserId = null;
          const updateObj = {
            eq(col, val) {
              if (col === 'id') queryId = val;
              if (col === 'user_id') queryUserId = val;
              return updateObj;
            },
            then(resolve) {
              const existing = store.characters.get(queryId) || {};
              const updated = { ...existing, ...payload, id: queryId };
              store.characters.set(queryId, updated);
              return resolve({ error: null });
            }
          };
          return updateObj;
        }
      };
    }
  };
}

describe('Multiplayer Roster Isolation & Safe Saving Test Suite', () => {
  beforeEach(() => {
    if (!globalThis.localStorage) {
      const mem = new Map();
      globalThis.localStorage = {
        getItem: (k) => mem.get(k) || null,
        setItem: (k, v) => mem.set(k, String(v)),
        removeItem: (k) => mem.delete(k),
        clear: () => mem.clear(),
        get length() { return mem.size; },
        key: (i) => Array.from(mem.keys())[i] || null
      };
    } else if (typeof globalThis.localStorage.clear === 'function') {
      globalThis.localStorage.clear();
    }
    setLocalPCId(null);
    const s = getState();
    s.mode = 'player';
    s.combatants = [];
  });

  test('StorageService forwards all IStorageAdapter entity and pointer methods', async () => {
    const mockClient = createMockSupabaseClient();
    const adapter = new SupabaseStorageAdapter('user-forward-test', { client: mockClient });
    const service = new StorageService(adapter);

    service.setActiveCharacterId('char-123');
    assert.strictEqual(service.getActiveCharacterId(), 'char-123');

    await service.saveCharacter('char-123', {
      name: 'Thorin',
      level: 5,
      combatants: [{ id: 'pc-thorin', name: 'Thorin', type: 'p', level: 5 }]
    });

    const loaded = await service.loadCharacter('char-123');
    assert.ok(loaded);
    assert.strictEqual(loaded.name, 'Thorin');

    const list = await service.listCharacters();
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].name, 'Thorin');
  });

  test('Multiplayer Session: Host state_diff with other player first in initiative does NOT overwrite local character in Supabase', async () => {
    const mockClient = createMockSupabaseClient();

    // 1. Setup Player 2 (Merisiel, Rogue level 7)
    const player2Adapter = new SupabaseStorageAdapter('user-player-2', {
      client: mockClient,
      activeCharacterId: 'char-merisiel-id'
    });

    // Save Merisiel initially to cloud
    await player2Adapter.saveCharacter('char-merisiel-id', {
      name: 'Merisiel',
      level: 7,
      classes: [{ classType: 'rogue', level: 7 }],
      combatants: [{ id: 'pc-merisiel', name: 'Merisiel', type: 'p', level: 7 }]
    });

    // Bind Player 2 localPCId
    globalThis.localStorage.setItem('dd_local_pc_id', 'pc-merisiel');

    // 2. Simulate joined session table where Player 1 (Aranis) has higher initiative (index 0)
    const multiplayerEncounterState = {
      round: 2,
      turn: 0,
      mode: 'player',
      session: { active: true, role: 'player', roomCode: 'ROOM-123' },
      combatants: [
        { id: 'pc-aranis', name: 'Aranis', type: 'p', level: 10, hp: 85, maxHP: 85, classes: [{ classType: 'fighter', level: 10 }] },
        { id: 'pc-merisiel', name: 'Merisiel', type: 'p', level: 7, hp: 42, maxHP: 42, classes: [{ classType: 'rogue', level: 7 }] },
        { id: 'mob-orc-1', name: 'Orc Berserker', type: 'e', hp: 30, maxHP: 30 }
      ]
    };

    // 3. Player 2 saves state during the battle (e.g. debounced cloud save)
    player2Adapter.saveState(multiplayerEncounterState);
    await player2Adapter.flushPendingSaves();

    // 4. Verify in the database that Merisiel was NOT overwritten with Aranis!
    const row = mockClient.store.characters.get('char-merisiel-id');
    assert.ok(row, 'Character row must exist');
    assert.strictEqual(row.name, 'Merisiel', 'Character name must remain Merisiel and NOT Aranis');
    assert.strictEqual(row.level, 7, 'Character level must remain 7');

    // 5. Verify isolated PC state: combatants must only contain Merisiel, not Aranis or Orcs
    assert.ok(Array.isArray(row.character_data.combatants));
    assert.strictEqual(row.character_data.combatants.length, 1, 'Character data must isolate single PC');
    assert.strictEqual(row.character_data.combatants[0].name, 'Merisiel');
    assert.strictEqual(row.character_data.combatants[0].id, 'pc-merisiel');
  });

  test('Multiplayer Session: Host state_diff with reversed initiative order does NOT overwrite local character in LocalStorageAdapter', () => {
    const localAdapter = new LocalStorageAdapter();
    localAdapter.setActiveCharacterId('char-merisiel-local');

    // Bind Player 2 localPCId
    globalThis.localStorage.setItem('dd_local_pc_id', 'pc-merisiel');

    // Multi-combatant encounter with Player 1 (Aranis) first
    const encounterState = {
      round: 1,
      turn: 0,
      mode: 'player',
      session: { active: true, role: 'player', roomCode: 'ROOM-ABC' },
      combatants: [
        { id: 'pc-aranis', name: 'Aranis', type: 'p', level: 10 },
        { id: 'pc-merisiel', name: 'Merisiel', type: 'p', level: 7 },
        { id: 'mob-dragon', name: 'Red Dragon', type: 'e', level: 15 }
      ]
    };

    localAdapter.saveState(encounterState);

    // Verify stored character
    const stored = localAdapter.loadCharacter('char-merisiel-local');
    assert.ok(stored);
    assert.strictEqual(stored.combatants.length, 1);
    assert.strictEqual(stored.combatants[0].name, 'Merisiel');
    assert.strictEqual(stored.combatants[0].id, 'pc-merisiel');

    // Verify listCharacters
    const list = localAdapter.listCharacters();
    const merisielSummary = list.find(c => c.id === 'char-merisiel-local');
    assert.ok(merisielSummary);
    assert.strictEqual(merisielSummary.name, 'Merisiel');
  });

  test('Page Reload & Re-selection: getActivePC preserves local player identity even when combatants array contains multiple PCs', () => {
    const s = getState();
    s.mode = 'player';
    s.combatants = [
      { id: 'pc-valeros', name: 'Valeros', type: 'p' },
      { id: 'pc-seoni', name: 'Seoni', type: 'p' },
      { id: 'mob-goblin', name: 'Goblin', type: 'e' }
    ];

    // Seoni is the local player
    setLocalPCId('pc-seoni');

    const activePC = getActivePC();
    assert.ok(activePC);
    assert.strictEqual(activePC.id, 'pc-seoni', 'getActivePC must return Seoni, not Valeros');
    assert.strictEqual(activePC.name, 'Seoni');
  });

  test('Wizard creation immediately saves new character to roster and sets activeCharacterId + localPCId', async () => {
    const mockClient = createMockSupabaseClient();
    const adapter = new SupabaseStorageAdapter('user-wizard-test', { client: mockClient });
    storageService.setAdapter(adapter);
    CombatState.setStorageAdapter(storageService);

    applyWizardCharacterToState(
      'Deep Halfling Trickster',
      'deep_halfling',
      'Chaotic',
      'Good',
      { str: 10, dex: 18, con: 14, int: 14, wis: 10, cha: 8 },
      [
        { classType: 'rogue', abilityIncrease: undefined },
        { classType: 'rogue', abilityIncrease: undefined },
        { classType: 'rogue', abilityIncrease: undefined },
        { classType: 'rogue', abilityIncrease: 'dex' },
        { classType: 'rogue', abilityIncrease: undefined },
        { classType: 'rogue', abilityIncrease: undefined },
        { classType: 'rogue', abilityIncrease: undefined },
        { classType: 'battle_trickster', abilityIncrease: 'dex' }
      ],
      {
        classesList: [
          { classType: 'rogue', level: 7 },
          { classType: 'battle_trickster', level: 1 }
        ]
      }
    );

    // 1. Verify localPCId was set
    const activePC = getActivePC();
    assert.ok(activePC);
    assert.strictEqual(activePC.name, 'Deep Halfling Trickster');
    assert.strictEqual(activePC.race, 'deep_halfling');

    // 2. Verify activeCharacterId was set on adapter
    const activeCharId = storageService.getActiveCharacterId();
    assert.ok(activeCharId);

    // 3. Verify character exists in roster list
    const roster = await storageService.listCharacters();
    assert.strictEqual(roster.length, 1);
    assert.strictEqual(roster[0].name, 'Deep Halfling Trickster');
  });

  test('Test 6: Turn advancement and initiative sorting never alter local active PC identity', () => {
    const s = getState();
    s.session = { active: true, role: 'client', roomCode: 'ROOM-TURNS' };
    setLocalPCId('pc-merisiel');

    // 2 Players + 2 Monsters with varying initiatives
    s.combatants = [
      { id: 'pc-valeros', name: 'Valeros', type: 'p', init: 25 },
      { id: 'mob-orc1', name: 'Orc Boss', type: 'e', init: 19 },
      { id: 'pc-merisiel', name: 'Merisiel', type: 'p', init: 15 },
      { id: 'mob-orc2', name: 'Orc Grunt', type: 'e', init: 8 },
    ];
    s.turn = 0;
    s.round = 1;

    // Active combatant at turn 0 is Valeros
    assert.strictEqual(s.combatants[s.turn].name, 'Valeros');
    // But getActivePC() for the local client MUST be Merisiel
    assert.strictEqual(getActivePC().name, 'Merisiel');

    // Advance turn to Monster 1 (Orc Boss)
    nextTurn();
    assert.strictEqual(s.turn, 1);
    assert.strictEqual(s.combatants[s.turn].name, 'Orc Boss');
    assert.strictEqual(getActivePC().name, 'Merisiel');

    // Advance turn to Merisiel
    nextTurn();
    assert.strictEqual(s.turn, 2);
    assert.strictEqual(s.combatants[s.turn].name, 'Merisiel');
    assert.strictEqual(getActivePC().name, 'Merisiel');

    // Advance turn to Monster 2 (Orc Grunt)
    nextTurn();
    assert.strictEqual(s.turn, 3);
    assert.strictEqual(s.combatants[s.turn].name, 'Orc Grunt');
    assert.strictEqual(getActivePC().name, 'Merisiel');

    // Round wrap-around
    nextTurn();
    assert.strictEqual(s.turn, 0);
    assert.strictEqual(s.round, 2);
    assert.strictEqual(getActivePC().name, 'Merisiel');

    // Re-sort combatants dynamically (e.g. Merisiel rolls higher initiative in new round)
    s.combatants.find(c => c.id === 'pc-merisiel').init = 30;
    sortCombatants();
    assert.strictEqual(s.combatants[0].name, 'Merisiel');
    assert.strictEqual(getActivePC().name, 'Merisiel');
  });

  test('Test 7: Multiple players with same generic or default name join without overwriting each other', () => {
    const s = getState();
    s.combatants = [];

    // Player 1 joins with generic name 'Hero'
    mergeIncomingPC({ id: 'pc-user-1', name: 'Hero', classes: [{ classType: 'fighter', level: 1 }] });
    assert.strictEqual(s.combatants.length, 1);
    assert.strictEqual(s.combatants[0].id, 'pc-user-1');

    // Player 2 joins with generic name 'Hero' as well, but different ID
    mergeIncomingPC({ id: 'pc-user-2', name: 'Hero', classes: [{ classType: 'wizard', level: 1 }] });
    assert.strictEqual(s.combatants.length, 2);
    assert.strictEqual(s.combatants[0].id, 'pc-user-1');
    assert.strictEqual(s.combatants[1].id, 'pc-user-2');

    // Update for Player 1 does not mutate Player 2
    mergeIncomingPC({ id: 'pc-user-1', name: 'Hero', level: 2 });
    assert.strictEqual(s.combatants.length, 2);
    assert.strictEqual(s.combatants[0].id, 'pc-user-1');
    assert.strictEqual(s.combatants[0].level, 2);
    assert.strictEqual(s.combatants[1].id, 'pc-user-2');
    assert.strictEqual(s.combatants[1].level, 1);
  });

  test('Test 8: Exact Incident Reproduction: Player imports PC, saves to cloud, joins table with another PC, takes lethal damage, gets healed, reloads (F5) - original PC remains intact and no duplicate is created', async () => {
    // 1. Setup Player 2's client environment with isolated Supabase adapter
    const mockSupabase = createMockSupabaseClient();
    const adapterPlayer2 = new SupabaseStorageAdapter('user-player-2', { debounceMs: 10 });
    adapterPlayer2.client = mockSupabase;

    const s = getState();
    s.mode = 'player';
    s.session = { active: false, role: 'player', roomCode: '' };

    // Player 2 imports a character ("Shadowblade")
    const importedPC = {
      id: 'pc-shadowblade-123',
      name: 'Shadowblade',
      type: 'p',
      hp: 20,
      maxHP: 20,
      classes: [{ classType: 'rogue', level: 4 }]
    };
    s.combatants = [importedPC];
    setLocalPCId(importedPC.id);

    // Player 2 saves to cloud
    await adapterPlayer2.saveCharacter('uuid-shadowblade-row', {
      name: 'Shadowblade',
      combatants: [importedPC],
      mode: 'player'
    });
    adapterPlayer2.setActiveCharacterId('uuid-shadowblade-row');

    // Verify Player 2 roster has exactly 1 character ("Shadowblade")
    let rosterP2 = await adapterPlayer2.listCharacters();
    assert.strictEqual(rosterP2.length, 1);
    assert.strictEqual(rosterP2[0].name, 'Shadowblade');

    // 2. Player 2 joins the table (DM has Valeros at index 0)
    // Client activates session as client
    CombatState.updateSession(true, 'client', 'camp-room-999');
    setLocalPCId(importedPC.id);

    // Host sends diff containing full table: Valeros (index 0) and Shadowblade (index 1)
    const hostEncounterDiff = {
      combatants: [
        { id: 'pc-valeros-001', name: 'Valeros', type: 'p', hp: 45, maxHP: 45, classes: [{ classType: 'fighter', level: 5 }] },
        { id: 'pc-shadowblade-123', name: 'Shadowblade', type: 'p', hp: 20, maxHP: 20, classes: [{ classType: 'rogue', level: 4 }] }
      ]
    };
    applyIncomingDelta({ type: 'state_diff', diff: hostEncounterDiff }, 'client');

    // Verify local PC on client is still Shadowblade, NOT Valeros
    assert.strictEqual(getActivePC().name, 'Shadowblade');
    assert.strictEqual(getActivePC().id, 'pc-shadowblade-123');

    // 3. DM deals 100 damage: Shadowblade dies (hp drops to -80)
    const damageDiff = {
      'combatants.1.hp': -80
    };
    applyIncomingDelta({ type: 'state_diff', diff: damageDiff }, 'client');
    assert.strictEqual(getActivePC().name, 'Shadowblade');
    assert.strictEqual(getActivePC().hp, -80);

    // 4. DM heals 100: Shadowblade revives (hp restores to 20)
    const healDiff = {
      'combatants.1.hp': 20
    };
    applyIncomingDelta({ type: 'state_diff', diff: healDiff }, 'client');
    assert.strictEqual(getActivePC().name, 'Shadowblade');
    assert.strictEqual(getActivePC().hp, 20);

    // 5. Client triggers cloud save
    adapterPlayer2.saveState(getState());
    await adapterPlayer2.flushPendingSaves();

    // 6. Simulate F5 (Page Reload):
    // Clear in-memory state and reset local variables
    s.combatants = [];
    s.session = { active: false, role: 'choice', roomCode: '' };

    // Reload state for Player 2
    const loadedState = await adapterPlayer2.loadState();
    assert.ok(loadedState, 'Loaded state must exist');
    assert.strictEqual(loadedState.combatants.length, 1, 'Loaded state must contain only 1 isolated PC');
    assert.strictEqual(loadedState.combatants[0].name, 'Shadowblade', 'Loaded state must be Shadowblade');

    // Check Player 2's cloud roster
    rosterP2 = await adapterPlayer2.listCharacters();
    assert.strictEqual(rosterP2.length, 1, 'Roster must contain EXACTLY 1 character');
    assert.strictEqual(rosterP2[0].name, 'Shadowblade', 'Roster character must NOT be overwritten by Valeros');
    assert.strictEqual(rosterP2[0].id, 'uuid-shadowblade-row', 'Roster row ID must remain original');
  });
});

