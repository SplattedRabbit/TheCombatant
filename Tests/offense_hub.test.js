import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatState } from '../js/state.js';
import { Combatant } from '../js/models/Combatant.js';
import { AttackEngine } from '../js/rules/AttackEngine.js';
import { Weapon } from '../js/models/model-core.js';
import { Item } from '../js/models/Item.js';

test('Offense Hub - Smite Evil Auto-Charge Deduction', () => {
  const pc = new Combatant({
    id: 'test_paladin_offense',
    name: 'Sir Gareth',
    type: 'p',
    cha: 16,
    classes: [{ classType: 'paladin', level: 5 }],
    dailyAbilities: [{ name: 'Smite Evil', max: 2, used: 0 }]
  });

  CombatState.getState().combatants = [pc];

  // 1st Smite usage
  const res1 = CombatState.consumeSmiteEvilCharge();
  assert.equal(res1.success, true);
  assert.equal(res1.remaining, 1);
  assert.equal(pc.dailyAbilities.find(a => a.name === 'Smite Evil').used, 1);

  // 2nd Smite usage
  const res2 = CombatState.consumeSmiteEvilCharge();
  assert.equal(res2.success, true);
  assert.equal(res2.remaining, 0);
  assert.equal(pc.dailyAbilities.find(a => a.name === 'Smite Evil').used, 2);

  // 3rd Smite usage (should fail / 0 remaining)
  const res3 = CombatState.consumeSmiteEvilCharge();
  assert.equal(res3.success, false);
  assert.equal(res3.remaining, 0);
});

test('Offense Hub - Barbarian Rage Toggle and Daily Charges', () => {
  const pc = new Combatant({
    id: 'test_barb_offense',
    name: 'Kragthor',
    type: 'p',
    str: 16,
    con: 14,
    classes: [{ classType: 'barbarian', level: 4 }],
    dailyAbilities: [{ name: 'Kampfrausch (Rage)', max: 2, used: 0 }]
  });

  CombatState.getState().combatants = [pc];

  // Enter Rage
  const enterRes = CombatState.togglePCRage(true);
  assert.equal(enterRes.success, true);
  assert.equal(pc.isRaging, true);
  assert.equal(pc.dailyAbilities.find(a => a.name === 'Kampfrausch (Rage)').used, 1);

  // Exit Rage
  const exitRes = CombatState.togglePCRage(false);
  assert.equal(exitRes.success, true);
  assert.equal(pc.isRaging, false);
});

test('Offense Hub - Power Attack 1-Handed vs 2-Handed Scaling', () => {
  const pc = new Combatant({
    id: 'test_fighter_pa',
    name: 'Valerius',
    type: 'p',
    str: 16, // +3
    bab: 6,
    feats: [{ id: 'power_attack' }],
    powerAttackPenalty: 3
  });

  const oneHandedSword = new Weapon({
    name: 'Longsword',
    type: 'longsword',
    grip: '1h',
    damage: '1d8'
  });

  const twoHandedGreatsword = new Weapon({
    name: 'Greatsword',
    type: 'greatsword',
    grip: '2h',
    damage: '2d6'
  });

  // 1-Handed: Atk penalty -3, Dmg bonus +3 (PA) + 3 (Str) = +6
  const seq1H = AttackEngine.calculateAttackSequence(pc, oneHandedSword, false);
  const paEntry1H = seq1H[0].dmgBreakdown.find(b => b.label.includes('Power Attack'));
  assert.ok(paEntry1H, 'Should have Power Attack in damage breakdown');
  assert.equal(paEntry1H.value, 3, '1-Handed PA should add 1x penalty (+3)');

  // 2-Handed: Atk penalty -3, Dmg bonus +6 (PA 2x) + 4 (Str 1.5x) = +10
  const seq2H = AttackEngine.calculateAttackSequence(pc, twoHandedGreatsword, false);
  const paEntry2H = seq2H[0].dmgBreakdown.find(b => b.label.includes('Power Attack'));
  assert.ok(paEntry2H, 'Should have Power Attack in damage breakdown');
  assert.equal(paEntry2H.value, 6, '2-Handed PA should add 2x penalty (+6)');
});

test('Offense Hub - Tactical Belt Potion Consumption', () => {
  const potion = new Item({
    name: 'Trank der leichten Wunden heilen',
    type: 'potion',
    slot: 'potion',
    healingFormula: '1d8+1',
    charges: { current: 1, max: 1 }
  });

  const pc = new Combatant({
    id: 'test_belt_user',
    name: 'Lyra',
    type: 'p',
    hp: 10,
    maxHp: 25,
    items: [potion]
  });

  CombatState.getState().combatants = [pc];

  assert.equal(pc.items.length, 1);
  const useRes = CombatState.usePCItemCharge(0);
  assert.equal(useRes.success, true);
  assert.ok(useRes.healAmount >= 2 && useRes.healAmount <= 9);
  assert.ok(pc.hp > 10);
  // Consumed single-use potion is removed
  assert.equal(pc.items.length, 0);
});
