import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { StorageService } from '../src/services/storage/StorageService.ts';
import { LocalStorageAdapter } from '../src/services/storage/LocalStorageAdapter.ts';
import { SupabaseStorageAdapter } from '../src/services/storage/SupabaseStorageAdapter.ts';

describe('StorageService Test Suite', () => {
  let service;

  beforeEach(() => {
    if (globalThis.localStorage && typeof globalThis.localStorage.clear === 'function') {
      globalThis.localStorage.clear();
    }
    service = new StorageService();
  });

  test('3.8.3.1 Standard-Initialisierung: Ohne Login ist LocalStorageAdapter aktiv', () => {
    const adapter = service.getAdapter();
    assert.ok(adapter instanceof LocalStorageAdapter);
    assert.equal(adapter.name, 'local');
    assert.equal(service.getCurrentUserId(), null);
  });

  test('3.8.3.2 Login-Umschaltung: initializeForUser schaltet auf SupabaseStorageAdapter', async () => {
    await service.initializeForUser({ id: 'user-456' });

    const adapter = service.getAdapter();
    assert.ok(adapter instanceof SupabaseStorageAdapter);
    assert.equal(adapter.name, 'supabase');
    assert.equal(service.getCurrentUserId(), 'user-456');
  });

  test('3.8.3.3 Logout-Umschaltung: initializeForUser(null) schaltet zurück auf LocalStorageAdapter', async () => {
    await service.initializeForUser({ id: 'user-456' });
    assert.equal(service.getAdapter().name, 'supabase');

    await service.initializeForUser(null);
    assert.equal(service.getAdapter().name, 'local');
    assert.equal(service.getCurrentUserId(), null);
  });

  test('3.8.3.4 Globales Event-Forwarding über Adapter-Wechsel hinweg', async () => {
    const statusEvents = [];
    service.onSyncStatusChange((event) => {
      statusEvents.push(event);
    });

    // 1. Save on LocalStorageAdapter
    service.saveState({ count: 1 });
    assert.equal(statusEvents.length, 1);
    assert.equal(statusEvents[0].adapterName, 'local');
    assert.equal(statusEvents[0].status, 'saved');

    // 2. Switch to Supabase
    await service.initializeForUser({ id: 'user-789' });

    // 3. Save on SupabaseStorageAdapter
    service.saveState({ count: 2 });
    assert.ok(statusEvents.length >= 2);
    const lastEvent = statusEvents[statusEvents.length - 1];
    assert.equal(lastEvent.adapterName, 'supabase');
    assert.equal(lastEvent.status, 'saving');
  });
});
