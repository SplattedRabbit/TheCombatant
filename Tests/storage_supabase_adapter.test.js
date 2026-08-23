import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseStorageAdapter, CLOUD_CACHE_PREFIX } from '../src/services/storage/SupabaseStorageAdapter.ts';

// Helper to create a mock Supabase client
function createMockSupabaseClient(options = {}) {
  const store = {
    characters: new Map(),
    campaigns: new Map(),
  };

  const calls = {
    charactersUpsert: 0,
    charactersUpdate: 0,
    campaignsUpdate: 0,
    select: 0,
  };

  return {
    store,
    calls,
    from(table) {
      return {
        select(fields) {
          calls.select++;
          let queryUserId = null;
          let queryId = null;

          const queryObj = {
            eq(col, val) {
              if (col === 'user_id' || col === 'dm_user_id') queryUserId = val;
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
              if (options.shouldFail) {
                return { data: null, error: new Error('Network error') };
              }
              if (table === 'characters') {
                const item = store.characters.get(queryId);
                if (!item) return { data: null, error: { message: 'Not found' } };
                return { data: item, error: null };
              }
              if (table === 'campaigns') {
                const item = store.campaigns.get(queryId);
                if (!item) return { data: null, error: { message: 'Not found' } };
                return { data: item, error: null };
              }
              return { data: null, error: null };
            },
            async maybeSingle() {
              if (options.shouldFail) {
                return { data: null, error: new Error('Network error') };
              }
              if (table === 'characters') {
                for (const char of store.characters.values()) {
                  if (char.user_id === queryUserId) {
                    return { data: char, error: null };
                  }
                }
              }
              return { data: null, error: null };
            }
          };
          return queryObj;
        },
        upsert(payload, opts) {
          calls.charactersUpsert++;
          if (options.shouldFail) {
            return {
              select() {
                return {
                  async single() {
                    return { data: null, error: new Error('Upsert failed') };
                  }
                };
              }
            };
          }
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
          if (table === 'characters') calls.charactersUpdate++;
          if (table === 'campaigns') calls.campaignsUpdate++;

          let queryId = null;
          const updateObj = {
            eq(col, val) {
              if (col === 'id') queryId = val;
              return updateObj;
            },
            then(resolve) {
              if (options.shouldFail) {
                return resolve({ error: new Error('Update failed') });
              }
              if (table === 'characters') {
                const existing = store.characters.get(queryId) || {};
                store.characters.set(queryId, { ...existing, ...payload, id: queryId });
              }
              if (table === 'campaigns') {
                const existing = store.campaigns.get(queryId) || {};
                store.campaigns.set(queryId, { ...existing, ...payload, id: queryId });
              }
              return resolve({ error: null });
            }
          };
          return updateObj;
        }
      };
    }
  };
}

describe('SupabaseStorageAdapter Test Suite', () => {
  beforeEach(() => {
    if (globalThis.localStorage && typeof globalThis.localStorage.clear === 'function') {
      globalThis.localStorage.clear();
    }
  });

  test('3.8.2.1 Local-First Pufferung: Schreibt sofort synchron in lokalen Cache', () => {
    const mockClient = createMockSupabaseClient();
    const adapter = new SupabaseStorageAdapter('user-1', {
      client: mockClient,
      debounceMs: 50
    });

    const mockState = {
      turn: 1,
      combatants: [{ name: 'Valeros', type: 'p' }]
    };

    adapter.saveState(mockState);

    // Lokaler Cache muss SOFORT synchron befüllt sein
    const cacheKey = `${CLOUD_CACHE_PREFIX}user-1`;
    const cachedRaw = globalThis.localStorage.getItem(cacheKey);
    assert.ok(cachedRaw, 'Lokaler Cache muss sofort geschrieben worden sein');
    assert.deepEqual(JSON.parse(cachedRaw), mockState);
  });

  test('3.8.2.2 Debounce-Timing: Mehrfache Saves werden gebündelt', async () => {
    const mockClient = createMockSupabaseClient();
    const adapter = new SupabaseStorageAdapter('user-1', {
      client: mockClient,
      debounceMs: 60
    });

    // 5 schnelle Saves hintereinander
    for (let i = 1; i <= 5; i++) {
      adapter.saveState({
        turn: i,
        combatants: [{ name: `Held ${i}`, type: 'p' }]
      });
    }

    // Unmittelbar nach dem Aufruf darf noch KEIN Supabase Request gefeuert worden sein
    assert.equal(mockClient.calls.charactersUpsert, 0, 'Noch kein Netzwerk-Request vor Debounce-Ablauf');

    // Warte auf Debounce-Ablauf
    await new Promise(r => setTimeout(r, 100));

    // Genau 1 Call soll ausgeführt worden sein mit dem letzten Stand
    assert.equal(mockClient.calls.charactersUpsert, 1, 'Exakt 1 gebündelter Netzwerk-Request');
    const saved = Array.from(mockClient.store.characters.values())[0];
    assert.ok(saved, 'Saved character must exist in store');
    assert.equal(saved.character_data.turn, 5);
    assert.equal(saved.name, 'Held 5');
  });

  test('3.8.2.3 flushPendingSaves(): Führt anstehenden Save sofort ohne Timer-Wartezeit aus', async () => {
    const mockClient = createMockSupabaseClient();
    const adapter = new SupabaseStorageAdapter('user-1', {
      client: mockClient,
      debounceMs: 5000 // Langer Debounce
    });

    adapter.saveState({
      turn: 99,
      combatants: [{ name: 'SofortHeld', type: 'p' }]
    });

    assert.equal(mockClient.calls.charactersUpsert, 0);

    // flush erzwingen
    await adapter.flushPendingSaves();

    assert.equal(mockClient.calls.charactersUpsert, 1, 'Muss nach flushPendingSaves() sofort gespeichert sein');
  });

  test('3.8.2.4 Status-Lifecycle: Meldet Übergänge saving und saved', async () => {
    const mockClient = createMockSupabaseClient();
    const adapter = new SupabaseStorageAdapter('user-1', {
      client: mockClient,
      debounceMs: 30
    });

    const statusHistory = [];
    adapter.onSyncStatusChange((e) => {
      statusHistory.push(e.status);
    });

    adapter.saveState({ combatants: [{ name: 'StatusHeld', type: 'p' }] });

    assert.ok(statusHistory.includes('saving'), 'Muss saving melden');

    await new Promise(r => setTimeout(r, 60));

    assert.ok(statusHistory.includes('saved'), 'Muss nach erfolgreichem Sync saved melden');
  });

  test('3.8.2.5 Netzwerkfehler-Resilienz: Meldet error, lokaler Cache bleibt erhalten', async () => {
    const failingClient = createMockSupabaseClient({ shouldFail: true });
    const adapter = new SupabaseStorageAdapter('user-1', {
      client: failingClient,
      debounceMs: 20
    });

    let reportedError = null;
    adapter.onSyncStatusChange((e) => {
      if (e.status === 'error') reportedError = e.error;
    });

    const state = { combatants: [{ name: 'ResilientHeld', type: 'p' }] };
    adapter.saveState(state);

    await new Promise(r => setTimeout(r, 50));

    assert.ok(reportedError, 'Muss Fehler im Event melden');

    // Lokaler Cache muss dennoch geladen werden können
    const fallbackLoaded = await adapter.loadState();
    assert.deepEqual(fallbackLoaded, state, 'Lokaler Cache muss intakt bleiben');
  });

  test('3.8.2.6 DM-Kampagnen-Routing vs. Spieler-Routing', async () => {
    const mockClient = createMockSupabaseClient();
    const adapter = new SupabaseStorageAdapter('user-dm', {
      client: mockClient,
      activeCampaignId: 'camp-123',
      debounceMs: 20
    });

    // Save as DM
    const dmState = {
      mode: 'dm',
      session: { role: 'host' },
      combatants: [{ name: 'Drache', type: 'm' }]
    };

    adapter.saveState(dmState);
    await adapter.flushPendingSaves();

    assert.equal(mockClient.calls.campaignsUpdate, 1, 'DM-State muss campaigns-Update ansteuern');
    const camp = mockClient.store.campaigns.get('camp-123');
    assert.deepEqual(camp.active_encounter_state, dmState);
  });
});
