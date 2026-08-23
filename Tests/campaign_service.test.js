import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CampaignService, generateInviteCode } from '../src/services/campaign/CampaignService.ts';
import { LocalStorageAdapter } from '../src/services/storage/LocalStorageAdapter.ts';
import { storageService } from '../src/services/storage/StorageService.ts';

describe('CampaignService Test Suite', () => {
  let service;

  beforeEach(() => {
    if (globalThis.localStorage && typeof globalThis.localStorage.clear === 'function') {
      globalThis.localStorage.clear();
    }
    storageService.setAdapter(new LocalStorageAdapter());
    service = CampaignService.getInstance();
  });

  test('5.6.1.1 generateInviteCode: Erzeugt saubere Codes im Format NAME-XX', () => {
    const code1 = generateInviteCode('Ravenloft');
    assert.match(code1, /^RAVEN-\d{2}$/);

    const code2 = generateInviteCode('Eberron');
    assert.match(code2, /^EBERR-\d{2}$/);

    const code3 = generateInviteCode('');
    assert.match(code3, /^QUEST-\d{2}$/);
  });

  test('5.6.1.2 CRUD-Lifecycle: Anlegen, Auflisten, Laden und Löschen von Kampagnen', async () => {
    // 1. Create campaign
    const created = await service.createCampaign({
      name: 'Fluch des Strahd',
      description: 'Dunkles Barovia Abenteuer',
      inviteCode: 'STRAHD-99',
    });

    assert.ok(created.id, 'Kampagne muss eine ID haben');
    assert.equal(created.name, 'Fluch des Strahd');
    assert.equal(created.inviteCode, 'STRAHD-99');

    // 2. List campaigns
    const list = await service.listCampaigns();
    assert.ok(list.length >= 1);
    const found = list.find((c) => c.name === 'Fluch des Strahd');
    assert.ok(found, 'Kampagne muss in der Liste auffindbar sein');

    // 3. Load full campaign encounter state
    const fullState = await service.getCampaign(created.id);
    assert.ok(fullState, 'Vollständiger Encounter-State muss geladen werden');

    // 4. Delete campaign
    await service.deleteCampaign(created.id);
    const afterDelete = await service.listCampaigns();
    assert.ok(!afterDelete.some((c) => c.id === created.id), 'Kampagne darf nach Löschen nicht mehr existieren');
  });

  test('5.6.1.3 Duplizierung: Klont Encounter-Zustand und vergibt neuen Code mit (Kopie) Suffix', async () => {
    const campA = await service.createCampaign({
      name: 'Eberron Runde',
      description: 'Sharn Wolkenkratzer',
    });

    const dup = await service.duplicateCampaign(campA.id);
    assert.notEqual(dup.id, campA.id, 'Duplikat muss neue ID erhalten');
    assert.notEqual(dup.inviteCode, campA.inviteCode, 'Duplikat muss neuen Einladungscode erhalten');
    assert.equal(dup.name, 'Eberron Runde (Copy)');

    const list = await service.listCampaigns();
    assert.equal(list.filter((c) => c.name.includes('Eberron Runde')).length, 2);
  });
});
