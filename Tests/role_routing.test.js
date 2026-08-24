import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CombatState } from '../js/state.js';
import { getState, setRole } from '../js/state/state-core.js';
import { createInitialState } from '../js/models/model-core.js';
import { applyLoadedState } from '../js/state/StorageManager.js';

describe('Role Routing & DM Screen Access Test Suite', () => {
  beforeEach(() => {
    const s = getState();
    s.mode = 'choice';
    s.session = { active: false, role: 'choice', roomCode: '' };
  });

  test('Selecting DM role sets mode to dm and session.role to host', () => {
    setRole('dm');
    const s = getState();
    assert.equal(s.mode, 'dm');
    assert.equal(s.session.role, 'host');
  });

  test('Selecting player role sets mode to player and session.role to player', () => {
    setRole('player');
    const s = getState();
    assert.equal(s.mode, 'player');
    assert.equal(s.session.role, 'player');
  });

  test('applyLoadedState preserves DM role and harmonizes mode with host session', () => {
    setRole('dm');
    const campaignState = createInitialState();
    campaignState.meta = { begegnung: 'Dungeon Raid' };
    campaignState.combatants = [];
    campaignState.session = { role: 'host' };

    const ok = applyLoadedState(campaignState, true);
    assert.equal(ok, true);
    const s = getState();
    assert.equal(s.mode, 'dm');
    assert.equal(s.session.role, 'host');
  });

  test('applyLoadedState sets mode to dm if session.role is host even when loaded on fresh state', () => {
    const s = getState();
    s.mode = 'choice';
    s.session = { role: 'choice' };

    const campaignState = createInitialState();
    campaignState.meta = { begegnung: 'Castle Invasion' };
    campaignState.combatants = [];
    campaignState.session = { role: 'host' };

    const ok = applyLoadedState(campaignState, true);
    assert.equal(ok, true);
    const after = getState();
    assert.equal(after.session.role, 'host');
    assert.equal(after.mode, 'dm');
  });
});
