import test from 'node:test';
import assert from 'node:assert';
import { calculateInitiativeTotal } from '../src/components/player/attributeHelper.ts';
import { recalculatePCStats } from '../js/state/pc/PCGeneral.js';
import { calculateSkillModifier, getSkillModifierBreakdown } from '../js/models/helpers/skills/CombatantSkills.js';
import { Combatant } from '../js/models/Combatant.js';
import { Stat } from '../js/models/Stat.js';

test('Bug #41: calculateInitiativeTotal correctly computes and displays 0 and negative totals', () => {
  // Dexterity 8 gives -1 modifier. On a natural 1, total is 0.
  const zeroInit = calculateInitiativeTotal(1, -1);
  assert.strictEqual(zeroInit.total, 0, 'Total should be 0');
  assert.strictEqual(zeroInit.display, '0', 'Display should be "0", not "--"');

  // Dexterity 6 gives -2 modifier. On a natural 1, total is -1.
  const negativeInit = calculateInitiativeTotal(1, -2);
  assert.strictEqual(negativeInit.total, -1, 'Total should be -1');
  assert.strictEqual(negativeInit.display, '-1', 'Display should be "-1", not "--"');

  // Unrolled initiative (null / undefined / 0) still returns '--'
  assert.strictEqual(calculateInitiativeTotal(null, 4).display, '--');
  assert.strictEqual(calculateInitiativeTotal(undefined, 4).display, '--');
  assert.strictEqual(calculateInitiativeTotal(0, 4).display, '--');
});

test('Bug #16: recalculateDerivedStats prevents NaN in spellSlots when used is undefined', () => {
  const pc = new Combatant({
    name: 'Wizard Test',
    classes: [{ classType: 'wizard', level: 3 }]
  });

  // Simulate slot object missing 'used' (e.g. from partial JSON or legacy import)
  pc.spellSlots = {
    1: { max: 3 } // 'used' is undefined
  };

  recalculatePCStats(pc);

  assert.strictEqual(typeof pc.spellSlots[1].used, 'number', 'used must be a number');
  assert.strictEqual(isNaN(pc.spellSlots[1].used), false, 'used must NOT be NaN');
  assert.strictEqual(pc.spellSlots[1].used, 0, 'used should default safely to 0');
});

test('Bug #35: recalculateDerivedStats preserves and restores baseFort/baseWill alias pointer coupling', () => {
  const pc = new Combatant({
    name: 'Paladin Test',
    classes: [{ classType: 'paladin', level: 5 }]
  });

  // Break reference alias as if deserialized from JSON without prototypes
  delete pc.baseFort;
  delete pc.baseWill;
  pc.baseZa = { base: 4 };
  pc.baseWil = { base: 1 };

  recalculatePCStats(pc);

  // Both baseZa and baseFort should refer to the exact same Stat instance
  assert.ok(pc.baseZa instanceof Stat, 'baseZa should be Stat instance');
  assert.ok(pc.baseFort instanceof Stat, 'baseFort should be Stat instance');
  assert.strictEqual(pc.baseZa, pc.baseFort, 'baseZa and baseFort must share identical object identity');

  assert.ok(pc.baseWil instanceof Stat, 'baseWil should be Stat instance');
  assert.ok(pc.baseWill instanceof Stat, 'baseWill should be Stat instance');
  assert.strictEqual(pc.baseWil, pc.baseWill, 'baseWil and baseWill must share identical object identity');
});

test('Bug #42: Dwarf Stonecunning grants +2 racial bonus to search and appraise in addition to craft', () => {
  const pc = new Combatant({
    name: 'Dwarf Hero',
    race: 'dwarf',
    classes: [{ classType: 'fighter', level: 1 }]
  });

  const craftBreakdown = getSkillModifierBreakdown(pc, 'craft');
  assert.ok(craftBreakdown.some(b => b.label === 'Racial bonus (Dwarf)' && b.value === 2), 'Dwarf must receive +2 Craft');

  const searchBreakdown = getSkillModifierBreakdown(pc, 'search');
  assert.ok(searchBreakdown.some(b => b.label === 'Racial bonus (Dwarf)' && b.value === 2), 'Dwarf must receive +2 Search (Stonecunning, RAW PHB p. 15)');

  const appraiseBreakdown = getSkillModifierBreakdown(pc, 'appraise');
  assert.ok(appraiseBreakdown.some(b => b.label === 'Racial bonus (Dwarf)' && b.value === 2), 'Dwarf must receive +2 Appraise (Stonecunning, RAW PHB p. 15)');

  // Verify that the total modifier also includes the +2 bonus
  assert.ok(calculateSkillModifier(pc, 'search') >= 2);
  assert.ok(calculateSkillModifier(pc, 'appraise') >= 2);
});
