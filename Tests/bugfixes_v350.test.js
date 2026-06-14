import { test } from 'node:test';
import assert from 'node:assert';
import { CombatState } from '../js/state.js';
import { CombatRules } from '../js/rules.js';
import { CompanionRules } from '../js/rules/CompanionRules.js';
import { Combatant } from '../js/models/Combatant.js';

test('Bug 1 - Bard Perform dynamic modifier calculation', () => {
  const pc = new Combatant({
    id: 'bard_test',
    name: 'Barde Alistair',
    type: 'player',
    race: 'human',
    classes: [{ classType: 'bard', level: 5 }],
    cha: { base: 16, modifiers: [] }, // CHA mod: +3
    skills: {
      perform: { ranks: 5, misc: 2 } // 5 ranks, 2 misc
    },
    feats: [
      { id: 'skill_focus', option: 'perform' } // +3 Skill Focus
    ]
  });

  // Calculate Perform modifier: 5 (ranks) + 3 (CHA mod) + 2 (misc) + 3 (Skill Focus) = 13
  const totalMod = pc.getSkillModifier('perform');
  assert.strictEqual(totalMod, 13, `Perform modifier should be 13, but was ${totalMod}`);
});

test('Bug 1 - Animal Companion scaling (Wolf at Level 1 and 6)', () => {
  // Level 1 Wolf (no scaling)
  const wolfLvl1 = CompanionRules.getCompanionBaseStats('wolf', 1);
  assert.ok(wolfLvl1, 'Wolf stats should be defined');
  assert.strictEqual(wolfLvl1.ac, 14, 'Wolf AC at level 1 should be 14');
  assert.strictEqual(wolfLvl1.str, 13, 'Wolf Str at level 1 should be 13');
  assert.strictEqual(wolfLvl1.maxHP, 13, 'Wolf Max HP at level 1 should be 13');
  assert.strictEqual(wolfLvl1.attacks[0].bonus, 3, 'Wolf bite bonus at level 1 should be +3');
  assert.strictEqual(wolfLvl1.attacks[0].damage, '1w6+1', 'Wolf bite damage at level 1 should be 1w6+1');

  // Level 6 Wolf (+4 HD, +4 Natural Armor, +2 Str/Dex)
  // New AC: 14 + 4 = 18
  // New Str: 13 + 2 = 15 (mod +2)
  // New Dex: 15 + 2 = 17
  // New Con: 15 (mod +2)
  // New Max HP: 13 + 4 * (4.5 + 2) = 13 + 26 = 39
  // New BAB: Math.floor(6 * 0.75) = 4 (Old BAB: Math.floor(2 * 0.75) = 1) -> BAB diff = +3
  // Str mod diff: +2 - +1 = +1
  // Total attack bonus diff: +3 (BAB diff) + 1 (Str diff) = +4
  // New bite attack bonus: 3 + 4 = 7
  // New bite damage: 1w6 + Math.floor(2 * 1.5) = 1w6+3
  const wolfLvl6 = CompanionRules.getCompanionBaseStats('wolf', 6);
  assert.ok(wolfLvl6, 'Wolf stats should be defined at level 6');
  assert.strictEqual(wolfLvl6.ac, 18, `Wolf AC at level 6 should be 18, but was ${wolfLvl6.ac}`);
  assert.strictEqual(wolfLvl6.str, 15, `Wolf Str at level 6 should be 15, but was ${wolfLvl6.str}`);
  assert.strictEqual(wolfLvl6.maxHP, 39, `Wolf Max HP at level 6 should be 39, but was ${wolfLvl6.maxHP}`);
  assert.strictEqual(wolfLvl6.attacks[0].bonus, 7, `Wolf bite bonus at level 6 should be +7, but was +${wolfLvl6.attacks[0].bonus}`);
  assert.strictEqual(wolfLvl6.attacks[0].damage, '1w6+3', `Wolf bite damage at level 6 should be 1w6+3, but was ${wolfLvl6.attacks[0].damage}`);
});

test('Bug 6 - Feat allocation and priority validation', () => {
  const pc = new Combatant({
    id: 'fighter_wizard_human',
    name: 'Gerd',
    type: 'player',
    race: 'human',
    isHuman: true,
    classes: [
      { classType: 'fighter', level: 4 }, // 1 + 2 = 3 fighter bonus slots
      { classType: 'wizard', level: 0 }
    ],
    level: 4 // totalLevel: 4 -> 1 + Math.floor(3/3) = 2 general slots (+1 human = 3 general slots)
  });

  // Total slots: 3 General + 3 Fighter = 6 slots.
  
  // Case A: Valid selection
  // 3 Combat feats (dodge, mobility, power_attack) -> Fighter slots
  // 3 General/Other feats (skill_focus, toughness, alertness) -> General slots
  const validFeats = [
    { id: 'dodge' },
    { id: 'mobility' },
    { id: 'power_attack' },
    { id: 'skill_focus' },
    { id: 'toughness' },
    { id: 'alertness' }
  ];
  const validationA = CombatRules.validateFeatsAssignment(pc, validFeats);
  assert.ok(validationA.success, `Validation should succeed, but failed with: ${validationA.error}`);

  // Case B: Invalid selection (too many general feats)
  // 1 Combat feat (dodge) -> 1 Fighter slot (2 empty Fighter slots)
  // 5 General feats (skill_focus, toughness, alertness, iron_will, run)
  // General limit is 3, but we chose 5. These cannot fit into the empty Fighter slots.
  const invalidFeats = [
    { id: 'dodge' },
    { id: 'skill_focus' },
    { id: 'toughness' },
    { id: 'alertness' },
    { id: 'iron_will' },
    { id: 'run' }
  ];
  const validationB = CombatRules.validateFeatsAssignment(pc, invalidFeats);
  assert.strictEqual(validationB.success, false, 'Validation should fail for too many general feats');
  assert.ok(validationB.error.includes('Talentwahl ungültig') || validationB.error.includes('Limit für allgemeine Talente'), `Error message should explain slot mismatch: "${validationB.error}"`);
});

test('v3.5.0 - loadSampleData choice validation', () => {
  // Test client mode selection
  const state = CombatState.getState();
  state.session = { role: 'client' };
  
  // Set an active PC to overwrite
  state.combatants = [{ id: 'active_pc_id', name: 'Held', type: 'p' }];
  
  // 1. Wizard level 10
  CombatState.loadSampleData('wizard_lvl10');
  const wizard = CombatState.getActivePC();
  assert.strictEqual(wizard.name, 'Lysara die Erhabene');
  assert.strictEqual(wizard.level, 10);
  assert.strictEqual(wizard.classType, 'wizard');
  assert.strictEqual(wizard.familiarType, 'cat');
  assert.strictEqual(wizard.familiarName, 'Keks');
  assert.strictEqual(wizard.preparedSpells.length, 6);

  // 2. Ranger level 10
  CombatState.loadSampleData('ranger_lvl10');
  const ranger = CombatState.getActivePC();
  assert.strictEqual(ranger.name, 'Gildor Windläufer');
  assert.strictEqual(ranger.level, 10);
  assert.strictEqual(ranger.classType, 'ranger');
  assert.strictEqual(ranger.companionType, 'wolf');
  assert.strictEqual(ranger.companionName, 'Borko');

  // 3. Paladin level 10
  CombatState.loadSampleData('paladin_lvl10');
  const paladin = CombatState.getActivePC();
  assert.strictEqual(paladin.name, 'Sir Valerius');
  assert.strictEqual(paladin.level, 10);
  assert.strictEqual(paladin.classType, 'paladin');
  assert.strictEqual(paladin.dailyAbilities.length, 3);

  // Test Host/Solo mode loading all three characters + enemies
  state.session = null; // solo mode
  CombatState.loadSampleData('party_lvl10');
  assert.strictEqual(state.combatants.length, 6);
  assert.ok(state.combatants.some(c => c.name === 'Lysara die Erhabene'), 'Should contain wizard');
  assert.ok(state.combatants.some(c => c.name === 'Gildor Windläufer'), 'Should contain ranger');
  assert.ok(state.combatants.some(c => c.name === 'Sir Valerius'), 'Should contain paladin');
  assert.ok(state.combatants.some(c => c.name === 'Junger Roter Drache'), 'Should contain red dragon');
});

test('v3.5.0 - Companion and Familiar Stats Synchronization', () => {
  const state = CombatState.getState();
  state.combatants = [];

  // Add Ranger Gildor
  const gildor = CombatState.addCombatant({
    id: 'gildor_test',
    name: 'Gildor Windläufer',
    type: 'p',
    hp: 75,
    maxHP: 75,
    init: 8,
    companionType: 'wolf',
    companionName: 'Borko',
    companionHP: 26,
    companionMaxHP: 26
  });

  // Recall Borko
  CombatState.addCombatant({
    id: 'gildor_test-companion',
    name: 'Borko',
    type: 'n',
    hp: 26,
    maxHP: 26,
    init: 8
  });

  // Verify Borko is added
  assert.ok(state.combatants.some(c => c.id === 'gildor_test-companion'));

  // 1. DM updates Borko's HP (direct edit)
  CombatState.updateCombatantNumber('gildor_test-companion', 'hp', 18);
  
  // Verify synchronization back to Gildor's PC object
  assert.strictEqual(gildor.companionHP, 18, 'Gildor companionHP should sync to 18');

  // 2. Client updates companion HP (simulated via mergeIncomingPC)
  const updatedGildorData = JSON.parse(JSON.stringify(gildor));
  updatedGildorData.companionHP = 22;
  updatedGildorData.companionName = 'Borko der Starke';

  CombatState.mergeIncomingPC(updatedGildorData);

  // Verify companion combatant in encounter got updated
  const updatedBorko = state.combatants.find(c => c.id === 'gildor_test-companion');
  assert.strictEqual(updatedBorko.hp, 22, 'Borko HP combatant should sync to 22');
  assert.strictEqual(updatedBorko.name, 'Borko der Starke', 'Borko Name combatant should sync to Borko der Starke');
});

test('v3.5.0 - DM Parchment Message Receiving Logic', () => {
  const state = CombatState.getState();
  state.combatants = [];

  // Setup client active PC
  CombatState.addCombatant({
    id: 'gildor_test',
    name: 'Gildor Windläufer',
    type: 'p',
    hp: 75,
    maxHP: 75,
    init: 8
  });
  
  state.localPCId = 'gildor_test';

  // Import applyIncomingDelta
  return import('../js/network/SyncProtocol.js').then(({ applyIncomingDelta }) => {
    // Test Case 1: Message to 'all'
    const packetAll = {
      type: 'dm_message',
      text: 'Hier ist eine Nachricht an alle!',
      targetPCId: 'all'
    };

    applyIncomingDelta(packetAll, 'client');
    
    return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
      let overlay = document.body.children.find(c => c.id === 'parchmentMessageOverlay');
      assert.ok(overlay, 'Overlay should be created for "all" message');
      assert.ok(overlay.innerHTML && overlay.innerHTML.includes('Hier ist eine Nachricht an alle!'), 'Overlay content check');
      overlay.remove();

      // Test Case 2: Message target matches current player
      const packetGildor = {
        type: 'dm_message',
        text: 'Eine geheime Nachricht für Gildor!',
        targetPCId: 'gildor_test'
      };

      applyIncomingDelta(packetGildor, 'client');
      return new Promise(resolve => setTimeout(resolve, 10));
    }).then(() => {
      let overlay2 = document.body.children.find(c => c.id === 'parchmentMessageOverlay');
      assert.ok(overlay2, 'Overlay should be created for matched player ID');
      assert.ok(overlay2.innerHTML && overlay2.innerHTML.includes('Eine geheime Nachricht für Gildor!'), 'Overlay content check for Gildor');
      overlay2.remove();

      // Test Case 3: Message target does NOT match current player
      const packetValerius = {
        type: 'dm_message',
        text: 'Geheimnis für Sir Valerius',
        targetPCId: 'valerius_test'
      };

      applyIncomingDelta(packetValerius, 'client');
      return new Promise(resolve => setTimeout(resolve, 10));
    }).then(() => {
      let overlay3 = document.body.children.find(c => c.id === 'parchmentMessageOverlay');
      assert.ok(!overlay3, 'Overlay should NOT be created for mismatched player ID');
    });
  });
});




