import test from 'node:test';
import assert from 'node:assert/strict';
import { getState, setRole, getActivePC } from '../js/state/state-core.js';
import { createCombatant } from '../js/models/model-core.js';
import * as EncounterManager from '../js/state/EncounterManager.js';
import { applyIncomingDelta } from '../js/network/SyncProtocol.js';

test('DM Message targeting when player joins with separate ID', async () => {
  // 1. Setup DM encounter state with sample player 'Gildor' (ID: 'c-1')
  const s = getState();
  s.combatants = [
    createCombatant({ id: 'c-1', name: 'Gildor', type: 'p' })
  ];

  // 2. Real remote player connects with character 'Gildor' (ID: 'char-unique-99')
  const incomingRemotePlayer = {
    id: 'char-unique-99',
    name: 'Gildor',
    type: 'p',
    hp: 45,
    maxHP: 45
  };

  // DM merges incoming remote player
  EncounterManager.mergeIncomingPC(incomingRemotePlayer);

  // Check what ID DM's combatant has:
  const dmCombatant = s.combatants.find(c => c.name === 'Gildor');
  console.log('DM combatant ID:', dmCombatant.id);

  // 3. DM sends message to that combatant (targetPCId = dmCombatant.id)
  const dmPacket = {
    type: 'dm_message',
    text: 'Secret DM discovery',
    targetPCId: dmCombatant.id
  };

  // 4. Now simulate player receiving the message on their own client:
  // On player client, their activePC has ID 'char-unique-99'
  s.combatants = [
    createCombatant({ id: 'char-unique-99', name: 'Gildor', type: 'p' })
  ];
  setRole('player');
  const playerActivePC = getActivePC();
  console.log('Player activePC ID:', playerActivePC.id);

  let messageDisplayed = false;
  globalThis.__REACT_DIALOG_BRIDGE__ = {
    showParchmentMessage: (text, sender) => {
      messageDisplayed = true;
      console.log('MESSAGE SHOWN TO PLAYER:', text);
    }
  };

  applyIncomingDelta(dmPacket, 'client');
  await new Promise(r => setTimeout(r, 50));

  console.log('Message was displayed?', messageDisplayed);
  assert.equal(messageDisplayed, true, 'Message should have been displayed to the player!');
});

test('DM Message targeting when message is sent to all players', async () => {
  const s = getState();
  s.combatants = [
    createCombatant({ id: 'char-unique-99', name: 'Gildor', type: 'p' })
  ];
  setRole('player');

  let messageDisplayed = false;
  globalThis.__REACT_DIALOG_BRIDGE__ = {
    showParchmentMessage: (text, sender) => {
      messageDisplayed = true;
    }
  };

  const dmPacket = {
    type: 'dm_message',
    text: 'Broadcast message to everyone',
    targetPCId: 'all'
  };

  applyIncomingDelta(dmPacket, 'client');
  await new Promise(r => setTimeout(r, 50));

  assert.equal(messageDisplayed, true, 'Broadcast message should be displayed to player');
});

