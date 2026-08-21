// Tests/prestigeClassEngine.test.js - Test suite for the generic Prestige Class Feature Engine
// (formula, steppedBonus, diceStack, flag, spellSlotLink dispatch against PHB registry entries)

import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { getPrestigeClassFeatures, getAblMod } from '../js/rules/prestigeClassEngine.js';

test('PrestigeClassEngine - Assassin: formula, diceStack and steppedBonus', () => {
  const pc = new Combatant({
    int: 16, // +3 mod
    classes: [
      { classType: 'rogue', level: 3 },
      { classType: 'assassin', level: 4 }
    ]
  });

  const features = getPrestigeClassFeatures(pc, 'assassin');

  // deathAttack: 10 + level + intMod = 10 + 4 + 3
  assert.strictEqual(features.deathAttack, 17);
  // sneakAttackStack: floor((level+1)/2) = floor(5/2)
  assert.strictEqual(features.sneakAttackStack, 2);
  // poisonSaveBonus: steps [[2,1],[4,2],...] at level 4 -> 2
  assert.strictEqual(features.poisonSaveBonus, 2);
  // flag type always resolves true
  assert.strictEqual(features.poisonUse, true);
});

test('PrestigeClassEngine - Assassin: steppedBonus below first threshold stays at base', () => {
  const pc = new Combatant({
    int: 10,
    classes: [{ classType: 'assassin', level: 1 }]
  });

  const features = getPrestigeClassFeatures(pc, 'assassin');
  assert.strictEqual(features.poisonSaveBonus, 0);
  assert.strictEqual(features.sneakAttackStack, 1); // floor((1+1)/2)
});

test('PrestigeClassEngine - Arcane Trickster: diceStack and steppedBonus ladders', () => {
  const pc = new Combatant({
    classes: [
      { classType: 'rogue', level: 3 },
      { classType: 'wizard', level: 5 },
      { classType: 'arcane_trickster', level: 3 }
    ],
    prestigeSpellLinks: {
      arcane_trickster: 'wizard'
    }
  });

  const features = getPrestigeClassFeatures(pc, 'arcane_trickster');

  assert.strictEqual(features.spellLink, 'wizard');
  // sneakAttackStack: floor(level/2) = floor(3/2)
  assert.strictEqual(features.sneakAttackStack, 1);
  // rangedLegerdemain: base 1, step [5,2] not reached at level 3 -> 1
  assert.strictEqual(features.rangedLegerdemain, 1);
  // impromptuSneakAttack: base 0, step [3,1] reached at level 3 -> 1
  assert.strictEqual(features.impromptuSneakAttack, 1);
});

test('PrestigeClassEngine - Arcane Trickster: higher-level steps override lower ones', () => {
  const pc = new Combatant({
    classes: [{ classType: 'arcane_trickster', level: 9 }]
  });

  const features = getPrestigeClassFeatures(pc, 'arcane_trickster');
  assert.strictEqual(features.rangedLegerdemain, 3); // steps [5,2],[9,3] -> 3
  assert.strictEqual(features.impromptuSneakAttack, 2); // steps [3,1],[7,2] -> 2
});

test('PrestigeClassEngine - Arcane Trickster: missing spell link resolves to null, not undefined', () => {
  const pc = new Combatant({
    classes: [{ classType: 'arcane_trickster', level: 2 }]
  });

  const features = getPrestigeClassFeatures(pc, 'arcane_trickster');
  assert.strictEqual(features.spellLink, null);
});

test('PrestigeClassEngine - Dragon Disciple: stepped ability boosts and formula-derived flags', () => {
  const pc = new Combatant({
    classes: [{ classType: 'dragon_disciple', level: 7 }]
  });

  const features = getPrestigeClassFeatures(pc, 'dragon_disciple');

  assert.strictEqual(features.naturalArmor, 3); // steps [4,2],[7,3],[10,4] -> 3
  assert.strictEqual(features.strengthBoost, 4); // steps [2,2],[4,4],[10,8] -> 4
  assert.strictEqual(features.constitutionBoost, 2); // step [6,2] reached at level 7
  assert.strictEqual(features.breathWeapon, '4d8');
  assert.strictEqual(features.wings, false); // level 9 required
  assert.strictEqual(features.dragonApotheosis, false); // level 10 required
});

test('PrestigeClassEngine - Dragon Disciple: level 10 caps out every stepped feature', () => {
  const pc = new Combatant({
    classes: [{ classType: 'dragon_disciple', level: 10 }]
  });

  const features = getPrestigeClassFeatures(pc, 'dragon_disciple');

  assert.strictEqual(features.naturalArmor, 4);
  assert.strictEqual(features.strengthBoost, 8);
  assert.strictEqual(features.constitutionBoost, 2);
  assert.strictEqual(features.intelligenceBoost, 2);
  assert.strictEqual(features.charismaBoost, 2);
  assert.strictEqual(features.breathWeapon, '6d8');
  assert.strictEqual(features.wings, true);
  assert.strictEqual(features.dragonApotheosis, true);
});

test('PrestigeClassEngine - Mystic Theurge: dual spellSlotLink', () => {
  const pc = new Combatant({
    classes: [
      { classType: 'wizard', level: 3 },
      { classType: 'cleric', level: 3 },
      { classType: 'mystic_theurge', level: 2 }
    ],
    prestigeSpellLinks: {
      mystic_theurge: { arcane: 'wizard', divine: 'cleric' }
    }
  });

  const features = getPrestigeClassFeatures(pc, 'mystic_theurge');
  assert.deepStrictEqual(features.spellLinks, { arcane: 'wizard', divine: 'cleric' });
});

test('PrestigeClassEngine - unknown class key returns an empty feature set', () => {
  const pc = new Combatant({ classes: [{ classType: 'wizard', level: 5 }] });
  assert.deepStrictEqual(getPrestigeClassFeatures(pc, 'not_a_real_class'), {});
});

test('PrestigeClassEngine - PC without the prestige class resolves features at level 0', () => {
  const pc = new Combatant({ classes: [{ classType: 'wizard', level: 5 }] });
  const features = getPrestigeClassFeatures(pc, 'assassin');
  assert.strictEqual(features.poisonSaveBonus, 0);
  assert.strictEqual(features.sneakAttackStack, 0); // floor((0+1)/2)
  assert.strictEqual(features.deathAttack, 10 + 0 + getAblMod(pc.int));
});

test('PrestigeClassEngine - getAblMod handles raw numbers and Stat instances identically', () => {
  const pc = new Combatant({ int: 14 });
  assert.strictEqual(getAblMod(pc.int), 2);
  assert.strictEqual(getAblMod(8), -1);
  assert.strictEqual(getAblMod(undefined), 0);
});
