import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CampaignService } from '../src/services/campaign/CampaignService.ts';
import { LocalStorageAdapter } from '../src/services/storage/LocalStorageAdapter.ts';
import { storageService } from '../src/services/storage/StorageService.ts';
import { CombatState } from '../js/state.js';
import { getState } from '../js/state/state-core.js';
import { createCombatant, createInitialState } from '../js/models/model-core.js';

describe('Campaign Encounter Isolation Test Suite', () => {
  let service;

  beforeEach(() => {
    if (globalThis.localStorage && typeof globalThis.localStorage.clear === 'function') {
      globalThis.localStorage.clear();
    }
    const adapter = new LocalStorageAdapter();
    storageService.setAdapter(adapter);
    CombatState.setStorageAdapter(storageService);
    service = CampaignService.getInstance();
  });

  test('5.6.2.1 Multi-Campaign Zero-Loss State Isolation', async () => {
    // 1. Erstelle Kampagne A (Ravenloft, Runde 3, 2 Vampire, HP 55)
    const stateA = createInitialState();
    stateA.session = { role: 'host' };
    stateA.meta = { begegnung: 'Ravenloft', ort: 'Schloss Ravenloft' };
    stateA.round = 3;
    stateA.activeIdx = 1;
    const vamp1 = createCombatant({ id: 'mob-vamp-1', name: 'Vampirfürst', hp: 55, maxHp: 55, type: 'm' });
    const vamp2 = createCombatant({ id: 'mob-vamp-2', name: 'Vampirbrut', hp: 30, maxHp: 30, type: 'm' });
    stateA.combatants = [vamp1, vamp2];

    const campA = await service.createCampaign({ name: 'Ravenloft', initialState: stateA });

    // 2. Erstelle Kampagne B (Eberron, Runde 1, 3 Goblins, HP 6)
    const stateB = createInitialState();
    stateB.session = { role: 'host' };
    stateB.meta = { begegnung: 'Eberron Ambush', ort: 'Sharn Unterstadt' };
    stateB.round = 1;
    stateB.activeIdx = 0;
    const gob1 = createCombatant({ id: 'mob-gob-1', name: 'Goblin 1', hp: 6, maxHp: 6, type: 'm' });
    const gob2 = createCombatant({ id: 'mob-gob-2', name: 'Goblin 2', hp: 6, maxHp: 6, type: 'm' });
    const gob3 = createCombatant({ id: 'mob-gob-3', name: 'Goblin 3', hp: 6, maxHp: 6, type: 'm' });
    stateB.combatants = [gob1, gob2, gob3];

    const campB = await service.createCampaign({ name: 'Eberron', initialState: stateB });

    // 3. Wechsle zu Kampagne A und modifiziere Werte (Vampirfürst erleidet Schaden -> HP 38, Runde 4)
    await service.switchActiveCampaign(campA.id);
    let s = getState();
    assert.equal(s.meta.begegnung, 'Ravenloft');
    assert.equal(s.round, 3);
    assert.equal(s.combatants.length, 2);

    s.combatants[0].hp = 38;
    s.round = 4;
    CombatState.saveToStorage();

    // 4. Wechsle zu Kampagne B und modifiziere Werte (Ein Goblin stirbt -> 2 Goblins übrig, Runde 2)
    await service.switchActiveCampaign(campB.id);
    s = getState();
    assert.equal(s.meta.begegnung, 'Eberron Ambush');
    assert.equal(s.round, 1);
    assert.equal(s.combatants.length, 3);

    s.combatants = s.combatants.slice(0, 2); // Ein Goblin getötet
    s.round = 2;
    CombatState.saveToStorage();

    // 5. Wechsle zurück zu Kampagne A -> Verifikation: Runde 4, Vampirfürst HP = 38, 2 Monster!
    await service.switchActiveCampaign(campA.id);
    s = getState();
    assert.equal(s.meta.begegnung, 'Ravenloft');
    assert.equal(s.round, 4, 'Ravenloft muss in Runde 4 geblieben sein');
    assert.equal(s.combatants.length, 2, 'Ravenloft muss 2 Vampire behalten haben');
    assert.equal(s.combatants[0].hp, 38, 'Vampirfürst muss exakt 38 HP haben');

    // 6. Wechsle zurück zu Kampagne B -> Verifikation: Runde 2, 2 Goblins!
    await service.switchActiveCampaign(campB.id);
    s = getState();
    assert.equal(s.meta.begegnung, 'Eberron Ambush');
    assert.equal(s.round, 2, 'Eberron muss in Runde 2 geblieben sein');
    assert.equal(s.combatants.length, 2, 'Eberron muss 2 Goblins behalten haben');
  });

  test('5.6.2.2 Lösch-Fallback: Löschen der aktiven Kampagne schaltet auf verbleibende um', async () => {
    const camp1 = await service.createCampaign({ name: 'Runde Eins' });
    const camp2 = await service.createCampaign({ name: 'Runde Zwei' });

    await service.switchActiveCampaign(camp1.id);
    assert.equal(getState().meta.begegnung, 'Runde Eins');

    // Lösche Runde Eins (die aktuell geladene)
    await service.deleteCampaign(camp1.id);

    // Es muss automatisch auf Runde Zwei umgeschaltet worden sein
    assert.equal(getState().meta.begegnung, 'Runde Zwei');
  });
});
