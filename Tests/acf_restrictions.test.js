import test from 'node:test';
import assert from 'node:assert/strict';
import { Combatant } from '../js/models/Combatant.js';
import { CombatState } from '../js/state.js';
import { ACF_REGISTRY, getACF } from '../js/data/acf-data.js';

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
