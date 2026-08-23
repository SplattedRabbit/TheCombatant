import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseStorageAdapter, CLOUD_CACHE_PREFIX } from '../src/services/storage/SupabaseStorageAdapter.ts';

// Configurable mock client to simulate intermittent network drops
function createFlakyMockSupabaseClient() {
  const store = {
    characters: new Map(),
    campaigns: new Map(),
  };

  let networkOnline = true;
  let throwFatalError = false;
  let callCount = {
    upsert: 0,
    update: 0,
    select: 0,
  };

  const client = {
    store,
    get callCount() { return callCount; },
    setOnline(state) { networkOnline = state; },
    setFatalError(state) { throwFatalError = state; },
    from(table) {
      return {
        select(fields) {
          callCount.select++;
          let queryUserId = null;
          let queryId = null;

          const queryObj = {
            eq(col, val) {
              if (col === 'user_id' || col === 'dm_user_id') queryUserId = val;
              if (col === 'id') queryId = val;
              return queryObj;
            },
            order() { return queryObj; },
            limit() { return queryObj; },
            async single() {
              if (!networkOnline) return { data: null, error: new Error('Failed to fetch (offline)') };
              if (throwFatalError) throw new Error('Fatal socket exception');
              if (table === 'characters') {
                const item = store.characters.get(queryId);
                return item ? { data: item, error: null } : { data: null, error: { message: 'Not found' } };
              }
              if (table === 'campaigns') {
                const item = store.campaigns.get(queryId);
                return item ? { data: item, error: null } : { data: null, error: { message: 'Not found' } };
              }
              return { data: null, error: null };
            },
            async maybeSingle() {
              if (!networkOnline) return { data: null, error: new Error('Failed to fetch (offline)') };
              if (table === 'characters') {
                const item = store.characters.get(queryId);
                return { data: item || null, error: null };
              }
              if (table === 'campaigns') {
                const item = store.campaigns.get(queryId);
                return { data: item || null, error: null };
              }
              return { data: null, error: null };
            }
          };
          return queryObj;
        },
        upsert(payload, options) {
          callCount.upsert++;
          return {
            select() {
              return {
                async single() {
                  if (!networkOnline) return { data: null, error: new Error('Network timeout (offline)') };
                  if (throwFatalError) throw new Error('Fatal connection drop');
                  const records = Array.isArray(payload) ? payload : [payload];
                  const saved = [];
                  for (const r of records) {
                    const id = r.id || 'gen-' + Date.now();
                    const entry = { ...r, id, updated_at: new Date().toISOString() };
                    if (table === 'characters') store.characters.set(id, entry);
                    if (table === 'campaigns') store.campaigns.set(id, entry);
                    saved.push(entry);
                  }
                  return { data: saved[0], error: null };
                }
              };
            }
          };
        },
        update(payload) {
          callCount.update++;
          return {
            eq(col, val) {
              return {
                async single() {
                  if (!networkOnline) return { data: null, error: new Error('Network timeout (offline)') };
                  if (throwFatalError) throw new Error('Fatal socket closed');
                  if (table === 'characters') {
                    const existing = store.characters.get(val);
                    if (existing) {
                      const updated = { ...existing, ...payload, updated_at: new Date().toISOString() };
                      store.characters.set(val, updated);
                      return { data: updated, error: null };
                    }
                  }
                  if (table === 'campaigns') {
                    const existing = store.campaigns.get(val);
                    if (existing) {
                      const updated = { ...existing, ...payload, updated_at: new Date().toISOString() };
                      store.campaigns.set(val, updated);
                      return { data: updated, error: null };
                    }
                  }
                  return { data: null, error: { message: 'Row not found' } };
                }
              };
            }
          };
        }
      };
    }
  };

  return client;
}

describe('Storage Resilience & Offline Recovery Tests (Phase 7)', () => {
  let mockClient;
  let adapter;
  const USER_ID = 'test-user-resilience-123';

  beforeEach(() => {
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.clear();
    }
    mockClient = createFlakyMockSupabaseClient();
    adapter = new SupabaseStorageAdapter(USER_ID, {
      client: mockClient,
      debounceMs: 50,
    });
  });

  test('Local cache immediately reflects state changes even before network flush', async () => {
    const pcState = {
      isDM: false,
      combatants: [{ name: 'Gimli', type: 'p', level: 5, hp: { current: 45, max: 50 } }],
    };

    adapter.saveState(pcState);

    // Synchronous local cache must have the data immediately
    const cacheKey = `${CLOUD_CACHE_PREFIX}${USER_ID}`;
    const raw = globalThis.localStorage.getItem(cacheKey);
    assert.ok(raw, 'Local cache must be written synchronously on saveState()');
    const parsed = JSON.parse(raw);
    assert.equal(parsed.combatants[0].name, 'Gimli');
  });

  test('Offline load falls back seamlessly to local cache when network is unreachable', async () => {
    // 1. Save data while online to prime the local cache
    const initialData = { isDM: false, combatants: [{ name: 'Legolas', type: 'p', level: 6 }] };
    adapter.saveState(initialData);
    await adapter.flushPendingSaves();

    // 2. Cut the network connection completely
    mockClient.setOnline(false);

    // 3. Attempt to load
    const loaded = await adapter.loadState();
    assert.ok(loaded, 'Should successfully load cached state when offline');
    assert.equal(loaded.combatants[0].name, 'Legolas');
  });

  test('Network drops during debounced save emit error status without throwing fatal exceptions', async () => {
    const events = [];
    adapter.onSyncStatusChange((evt) => events.push(evt));

    mockClient.setOnline(false);

    adapter.saveState({
      isDM: false,
      combatants: [{ name: 'Boromir', type: 'p', level: 7, hp: { current: 10, max: 60 } }],
    });

    // Flushing during an outage should not crash the app
    await assert.doesNotReject(async () => {
      await adapter.flushPendingSaves();
    });

    const errorEvent = events.find(e => e.status === 'error');
    assert.ok(errorEvent, 'Should emit an error sync status event');
    assert.ok(errorEvent.error, 'Error event must contain error details');
  });

  test('Auto-recovery: Once network is restored, subsequent flush persists latest state to cloud', async () => {
    mockClient.setOnline(false);

    // Make edits while offline
    adapter.saveState({
      isDM: false,
      combatants: [{ name: 'Aragorn', type: 'p', level: 8, hp: { current: 55, max: 70 } }],
    });
    await adapter.flushPendingSaves(); // fails silently into error status

    // Network restored
    mockClient.setOnline(true);

    // Trigger save / flush again
    adapter.saveState({
      isDM: false,
      combatants: [{ name: 'Aragorn', type: 'p', level: 8, hp: { current: 70, max: 70 } }],
    });
    await adapter.flushPendingSaves();

    // Verify character in cloud store
    assert.equal(mockClient.store.characters.size, 1);
    const saved = Array.from(mockClient.store.characters.values())[0];
    assert.equal(saved.name, 'Aragorn');
    assert.equal(saved.character_data.combatants[0].hp.current, 70);
  });

  test('Fatal network exceptions do not crash caller and maintain local data integrity', async () => {
    mockClient.setFatalError(true);

    adapter.saveState({
      isDM: true,
      encounter: { round: 3, combatants: [{ name: 'Orc Warlord', hp: 30 }] },
    });

    await assert.doesNotReject(async () => {
      await adapter.flushPendingSaves();
    });

    // Local cache must still be intact
    const cacheKey = `${CLOUD_CACHE_PREFIX}${USER_ID}`;
    const raw = globalThis.localStorage.getItem(cacheKey);
    const parsed = JSON.parse(raw);
    assert.equal(parsed.encounter.round, 3);
  });
});
