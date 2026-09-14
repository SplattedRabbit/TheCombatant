import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { applyIncomingDelta } from '../js/network/SyncProtocol.js';
import { CombatState } from '../js/state.js';
import { createCombatant } from '../js/models/model-core.js';
import { showLootRevealDialog } from '../js/ui/dialogs/BaseDialogs.js';

describe('Loot Reveal & Item Gift Network Protocol Test Suite', () => {
  let mockActivePC;

  beforeEach(() => {
    mockActivePC = createCombatant({
      id: 'pc-hero-1',
      name: 'Regdar',
      type: 'p',
      hp: 35,
      maxHp: 35,
    });
    CombatState.getState().combatants = [mockActivePC];
    CombatState.getState().mode = 'player';
  });

  test('1. showLootRevealDialog executes fallback without throwing', () => {
    let acknowledged = false;
    const res = showLootRevealDialog(
      { name: 'Sun Blade', enhancement: 2, damage: '1d10+2' },
      'weapons',
      () => { acknowledged = true; }
    );

    assert.ok(res);
    assert.equal(typeof res.dismiss, 'function');
    res.dismiss();
  });

  test('2. SyncProtocol processes item_gift packet for active client PC', async () => {
    let dialogTriggeredWith = null;

    // Install mock bridge
    if (typeof globalThis !== 'undefined') {
      globalThis.__REACT_DIALOG_BRIDGE__ = {
        showLootRevealDialog: (item, category) => {
          dialogTriggeredWith = { item, category };
          return { dismiss: () => {} };
        }
      };
    }

    const testItem = {
      name: 'Flaming Burst Longsword',
      enhancement: 2,
      damage: '1d8',
      extraDamage: '+1d6 Fire'
    };

    const giftPacket = {
      type: 'item_gift',
      targetPCId: 'pc-hero-1',
      category: 'weapons',
      item: testItem,
    };

    // Process packet in client role
    applyIncomingDelta(giftPacket, 'client');

    // Allow dynamic import to complete
    await new Promise(r => setTimeout(r, 60));

    assert.ok(dialogTriggeredWith, 'Dialog should have been triggered for matching active PC');
    assert.equal(dialogTriggeredWith.item.name, 'Flaming Burst Longsword');
    assert.equal(dialogTriggeredWith.category, 'weapons');

    // Clean up
    if (globalThis.__REACT_DIALOG_BRIDGE__) {
      delete globalThis.__REACT_DIALOG_BRIDGE__;
    }
  });

  test('3. SyncProtocol ignores item_gift packet targeted to a different PC', async () => {
    let dialogTriggered = false;

    if (typeof globalThis !== 'undefined') {
      globalThis.__REACT_DIALOG_BRIDGE__ = {
        showLootRevealDialog: () => {
          dialogTriggered = true;
        }
      };
    }

    const giftPacket = {
      type: 'item_gift',
      targetPCId: 'pc-other-recipient',
      category: 'items',
      item: { name: 'Cloak of Resistance +3' },
    };

    applyIncomingDelta(giftPacket, 'client');
    await new Promise(r => setTimeout(r, 60));

    assert.equal(dialogTriggered, false, 'Dialog must not open for a different PC recipient');

    if (globalThis.__REACT_DIALOG_BRIDGE__) {
      delete globalThis.__REACT_DIALOG_BRIDGE__;
    }
  });
});
