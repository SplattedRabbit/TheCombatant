// Tests/favored_enemy_combat.test.js - Unit tests for Ranger Favored Enemy combat damage
import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { Weapon } from '../js/models/Weapon.js';
import { AttackEngine } from '../js/rules/AttackEngine.js';

test('Favored Enemy - Damage Calculation and Stance Integration', () => {
  // 1. Level 6 Ranger with two favored enemies: Undead (+4) and Dragons (+2)
  const pc = new Combatant({
    name: 'Grom the Ranger',
    type: 'p',
    classes: [{ classType: 'ranger', level: 6 }],
    favoredEnemies: [
      { type: 'undead', bonus: 4 },
      { type: 'dragons', bonus: 2 }
    ],
    activeFavoredEnemyTarget: 'undead',
    isFavoredEnemyActive: true,
    str: 16 // STR mod +3
  });

  const mw = new Weapon({ name: 'Longsword', hand: 'main', isEquipped: true, enhancement: 1 });
  pc.weapons = [mw];
  pc.bab.base = 6;

  // With Favored Enemy active (Undead +4):
  // Damage = STR (+3) + Enhancement (+1) + Favored Enemy (+4) = +8
  const seq = AttackEngine.calculateAttackSequence(pc, mw, false, {
    favoredEnemy: pc.isFavoredEnemyActive,
    targetCreatureType: pc.activeFavoredEnemyTarget
  });
  assert.ok(seq.length > 0, 'Attack sequence should be generated');
  assert.strictEqual(seq[0].dmgTotal, 8, 'Damage should include STR 3 + Enh 1 + Favored Enemy 4 = 8');
  const feEntry = seq[0].dmgBreakdown.find(b => b.label.includes('Favored Enemy'));
  assert.ok(feEntry, 'Dmg breakdown must contain Favored Enemy');
  assert.strictEqual(feEntry.value, 4, 'Favored enemy breakdown value should be +4');

  // 2. Switch target to Dragons (+2)
  pc.activeFavoredEnemyTarget = 'dragons';
  const seqDragons = AttackEngine.calculateAttackSequence(pc, mw, false, {
    favoredEnemy: pc.isFavoredEnemyActive,
    targetCreatureType: pc.activeFavoredEnemyTarget
  });
  assert.strictEqual(seqDragons[0].dmgTotal, 6, 'Damage against dragons should be STR 3 + Enh 1 + Favored Enemy 2 = 6');

  // 3. Toggle Favored Enemy off (target is not a favored enemy)
  pc.isFavoredEnemyActive = false;
  const seqInactive = AttackEngine.calculateAttackSequence(pc, mw, false, {
    favoredEnemy: pc.isFavoredEnemyActive,
    targetCreatureType: pc.activeFavoredEnemyTarget
  });
  assert.strictEqual(seqInactive[0].dmgTotal, 4, 'Damage without favored enemy should be STR 3 + Enh 1 = 4');

  // 4. Off-hand weapon should also receive favored enemy damage
  const ow = new Weapon({ name: 'Shortsword', hand: 'off', isEquipped: true, enhancement: 0 });
  pc.isFavoredEnemyActive = true;
  pc.activeFavoredEnemyTarget = 'undead';
  const seqOffhand = AttackEngine.calculateAttackSequence(pc, ow, false, {
    isOffhandAttack: true,
    favoredEnemy: pc.isFavoredEnemyActive,
    targetCreatureType: pc.activeFavoredEnemyTarget
  });
  // Offhand STR mod is floor(3 * 0.5) = 1. Favored enemy bonus = 4. Total = 5.
  assert.strictEqual(seqOffhand[0].dmgTotal, 5, 'Offhand should receive full favored enemy damage');
});
