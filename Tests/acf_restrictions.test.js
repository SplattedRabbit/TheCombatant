import test from 'node:test';
import assert from 'node:assert/strict';
import { Combatant } from '../js/models/Combatant.js';
import { CombatState } from '../js/state.js';
import { ACF_REGISTRY, getACF, getConflictingACFs } from '../js/data/acf-data.js';

test('ACF Restrictions - Ranger Distracting Attack disables Animal Companion', () => {
  const pc = new Combatant({
    id: 'ranger_test',
    name: 'Strider',
    type: 'p',
    classes: [{ classType: 'ranger', level: 6 }],
    companionType: 'wolf',
    acfs: []
  });

  CombatState.clearActivePC();
  CombatState.getState().combatants = [pc];
  CombatState.updateSession(false, 'player', pc.id);

  assert.equal(pc.companionType, 'wolf');

  // Toggle Distracting Attack ON
  CombatState.togglePCACF('ranger_distracting_attack');
  assert.ok(pc.acfs.includes('ranger_distracting_attack'), 'Distracting Attack is active');
  assert.equal(pc.companionType, 'none', 'Companion is cleared when Distracting Attack is enabled');

  // Toggle Distracting Attack OFF
  CombatState.togglePCACF('ranger_distracting_attack');
  assert.ok(!pc.acfs.includes('ranger_distracting_attack'), 'Distracting Attack is disabled');
});

test('ACF Restrictions - Ranger Spiritual Guide disables Animal Companion', () => {
  const pc = new Combatant({
    id: 'ranger_guide',
    name: 'Guide',
    type: 'p',
    classes: [{ classType: 'ranger', level: 5 }],
    companionType: 'eagle',
    acfs: []
  });

  CombatState.clearActivePC();
  CombatState.getState().combatants = [pc];
  CombatState.updateSession(false, 'player', pc.id);

  CombatState.togglePCACF('ranger_spiritual_guide');
  assert.ok(pc.acfs.includes('ranger_spiritual_guide'));
  assert.equal(pc.companionType, 'none');
});

test('ACF Restrictions - Ranger Conflict Resolution & Multiple Legal ACFs', () => {
  const pc = new Combatant({
    id: 'ranger_multi',
    name: 'Gondor Scout',
    type: 'p',
    classes: [{ classType: 'ranger', level: 9 }],
    acfs: []
  });

  CombatState.clearActivePC();
  CombatState.getState().combatants = [pc];
  CombatState.updateSession(false, 'player', pc.id);

  // 1. Enable Distracting Attack (replaces Animal Companion)
  CombatState.togglePCACF('ranger_distracting_attack');
  assert.deepEqual(pc.acfs, ['ranger_distracting_attack']);

  // 2. Enable Spell Reflection (replaces Evasion) -> Legal multi-ACF!
  CombatState.togglePCACF('ranger_spell_reflection');
  assert.ok(pc.acfs.includes('ranger_distracting_attack'));
  assert.ok(pc.acfs.includes('ranger_spell_reflection'));
  assert.equal(pc.acfs.length, 2, 'Ranger has both Distracting Attack and Spell Reflection active simultaneously');

  // 3. Enable Spiritual Guide (also replaces Animal Companion) -> Must auto-swap out Distracting Attack!
  CombatState.togglePCACF('ranger_spiritual_guide');
  assert.ok(pc.acfs.includes('ranger_spiritual_guide'), 'Spiritual Guide is now active');
  assert.ok(!pc.acfs.includes('ranger_distracting_attack'), 'Distracting Attack was swapped out');
  assert.ok(pc.acfs.includes('ranger_spell_reflection'), 'Spell Reflection remains untouched');
  assert.equal(pc.acfs.length, 2);
});

test('ACF Restrictions - Paladin & Swashbuckler Mutual Exclusion', () => {
  const paladin = new Combatant({
    id: 'pal_test',
    name: 'Sir Gareth',
    type: 'p',
    classes: [{ classType: 'paladin', level: 6 }],
    acfs: []
  });

  CombatState.clearActivePC();
  CombatState.getState().combatants = [paladin];
  CombatState.updateSession(false, 'player', paladin.id);

  // Enable Charging Smite (replaces Special Mount)
  CombatState.togglePCACF('paladin_charging_smite');
  // Enable Curse Breaker (replaces Remove Disease)
  CombatState.togglePCACF('paladin_curse_breaker');
  assert.ok(paladin.acfs.includes('paladin_charging_smite'));
  assert.ok(paladin.acfs.includes('paladin_curse_breaker'));

  // Enable Divine Spirit (also replaces Special Mount) -> Swaps Charging Smite
  CombatState.togglePCACF('paladin_divine_spirit');
  assert.ok(paladin.acfs.includes('paladin_divine_spirit'));
  assert.ok(!paladin.acfs.includes('paladin_charging_smite'));
  assert.ok(paladin.acfs.includes('paladin_curse_breaker'));

  // Swashbuckler
  const swash = new Combatant({
    id: 'swash_test',
    name: 'Inigo',
    type: 'p',
    classes: [{ classType: 'swashbuckler', level: 5 }],
    acfs: []
  });

  CombatState.clearActivePC();
  CombatState.getState().combatants = [swash];
  CombatState.updateSession(false, 'player', swash.id);

  CombatState.togglePCACF('swashbuckler_shield_of_blades');
  CombatState.togglePCACF('swashbuckler_arcane_stunt');
  assert.ok(swash.acfs.includes('swashbuckler_shield_of_blades'));
  assert.ok(swash.acfs.includes('swashbuckler_arcane_stunt'));

  // Enable Spell Reflection (also replaces Dodge Bonus) -> Swaps Shield of Blades
  CombatState.togglePCACF('swashbuckler_spell_reflection');
  assert.ok(swash.acfs.includes('swashbuckler_spell_reflection'));
  assert.ok(!swash.acfs.includes('swashbuckler_shield_of_blades'));
  assert.ok(swash.acfs.includes('swashbuckler_arcane_stunt'));
});

test('ACF Restrictions - Druid Shapeshift disables Animal Companion and exits active Wild Shape', () => {
  const pc = new Combatant({
    id: 'druid_shapeshifter',
    name: 'Malfurion',
    type: 'p',
    classes: [{ classType: 'druid', level: 8 }],
    companionType: 'bear',
    acfs: []
  });

  CombatState.clearActivePC();
  CombatState.getState().combatants = [pc];
  CombatState.updateSession(false, 'player', pc.id);

  // Enter a wild shape
  pc.enterShape('wolf');
  assert.equal(pc.activeShape, 'wolf');

  // Enable Shapeshift ACF
  CombatState.togglePCACF('druid_shapeshift');
  assert.ok(pc.acfs.includes('druid_shapeshift'));
  assert.equal(pc.companionType, 'none', 'Animal Companion is cleared by Shapeshift');
  assert.equal(pc.activeShape, 'none', 'Active Wild Shape is cleanly exited by Shapeshift');
});

test('ACF Restrictions - Wizard and Sorcerer ACFs disable Familiar', () => {
  const wizard = new Combatant({
    id: 'wiz_test',
    name: 'Raistlin',
    type: 'p',
    classes: [{ classType: 'wizard', level: 5 }],
    familiarType: 'owl',
    acfs: []
  });

  CombatState.clearActivePC();
  CombatState.getState().combatants = [wizard];
  CombatState.updateSession(false, 'player', wizard.id);

  CombatState.togglePCACF('wizard_immediate_magic');
  assert.ok(wizard.acfs.includes('wizard_immediate_magic'));
  assert.equal(wizard.familiarType, 'none', 'Familiar is cleared when Immediate Magic is active');

  const sorcerer = new Combatant({
    id: 'sorc_test',
    name: 'Jareth',
    type: 'p',
    classes: [{ classType: 'sorcerer', level: 6 }],
    familiarType: 'bat',
    acfs: []
  });

  CombatState.clearActivePC();
  CombatState.getState().combatants = [sorcerer];
  CombatState.updateSession(false, 'player', sorcerer.id);

  CombatState.togglePCACF('sorcerer_metamagic_specialist');
  assert.ok(sorcerer.acfs.includes('sorcerer_metamagic_specialist'));
  assert.equal(sorcerer.familiarType, 'none', 'Familiar is cleared when Metamagic Specialist is active');
});

test('ACF Restrictions - Barbarian Berserker Strength exits active Rage', () => {
  const barb = new Combatant({
    id: 'barb_test',
    name: 'Logen',
    type: 'p',
    classes: [{ classType: 'barbarian', level: 4 }],
    acfs: []
  });

  CombatState.clearActivePC();
  CombatState.getState().combatants = [barb];
  CombatState.updateSession(false, 'player', barb.id);

  barb.enterRage();
  assert.equal(barb.isRaging, true);

  CombatState.togglePCACF('barbarian_berserker_strength');
  assert.ok(barb.acfs.includes('barbarian_berserker_strength'));
  assert.equal(barb.isRaging, false, 'Active Rage is cleanly exited when Berserker Strength is enabled');
});
