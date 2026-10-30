/**
 * Tests for Feat Prerequisites Checking (RulesFeats.js)
 * Tests all prerequisite types: bab, feat, classLevel, class, stat, level, casterLevel, skill, sneak_attack, and custom handlers.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkPrerequisites } from '../js/rules/RulesFeats.js';

describe('Feat Prerequisites - checkPrerequisites', () => {

  it('returns met: true when feat has no prerequisites or empty prerequisites', () => {
    const res1 = checkPrerequisites({}, {});
    assert.strictEqual(res1.met, true);
    assert.deepStrictEqual(res1.details, []);

    const res2 = checkPrerequisites({ prereqs: [] }, {});
    assert.strictEqual(res2.met, true);
    assert.deepStrictEqual(res2.details, []);
  });

  it('checks BAB prerequisites correctly', () => {
    const feat = { prereqs: [{ type: 'bab', value: 6 }] };
    
    // Insufficient BAB
    const pcLow = { bab: 4 };
    const resLow = checkPrerequisites(feat, pcLow);
    assert.strictEqual(resLow.met, false);
    assert.strictEqual(resLow.details[0].met, false);

    // Exact BAB with Stat object getValue()
    const pcExact = { bab: { getValue: () => 6 } };
    const resExact = checkPrerequisites(feat, pcExact);
    assert.strictEqual(resExact.met, true);
    assert.strictEqual(resExact.details[0].met, true);

    // Exceeding BAB with plain object base
    const pcHigh = { bab: { base: 8 } };
    const resHigh = checkPrerequisites(feat, pcHigh);
    assert.strictEqual(resHigh.met, true);
  });

  it('checks parent Feat prerequisites correctly', () => {
    const feat = { prereqs: [{ type: 'feat', id: 'power_attack' }] };

    // Missing feat
    const pcWithout = { feats: ['cleave'] };
    const resWithout = checkPrerequisites(feat, pcWithout);
    assert.strictEqual(resWithout.met, false);

    // Has feat as string in pc.feats
    const pcWithStr = { feats: ['power_attack', 'cleave'] };
    assert.strictEqual(checkPrerequisites(feat, pcWithStr).met, true);

    // Has feat as object in pc.feats
    const pcWithObj = { feats: [{ id: 'power_attack' }] };
    assert.strictEqual(checkPrerequisites(feat, pcWithObj).met, true);

    // Has feat via getAutomaticFeats()
    const pcAuto = {
      feats: [],
      getAutomaticFeats: () => [{ id: 'power_attack' }]
    };
    assert.strictEqual(checkPrerequisites(feat, pcAuto).met, true);
  });

  it('checks class and classLevel prerequisites', () => {
    const featClassLvl = { prereqs: [{ type: 'classLevel', class: 'fighter', value: 4 }] };
    const featClass = { prereqs: [{ type: 'class', class: 'wizard' }] };

    const pcFighter3 = { classes: [{ classType: 'fighter', level: 3 }] };
    assert.strictEqual(checkPrerequisites(featClassLvl, pcFighter3).met, false);

    const pcFighter4 = { classes: [{ classType: 'fighter', level: 4 }] };
    assert.strictEqual(checkPrerequisites(featClassLvl, pcFighter4).met, true);

    assert.strictEqual(checkPrerequisites(featClass, pcFighter4).met, false);
    const pcWiz = { classes: [{ classType: 'wizard', level: 1 }] };
    assert.strictEqual(checkPrerequisites(featClass, pcWiz).met, true);
  });

  it('checks attribute / stat prerequisites with numbers and Stat objects', () => {
    const feat = { prereqs: [{ type: 'stat', name: 'str', value: 13 }] };

    // Numeric value
    assert.strictEqual(checkPrerequisites(feat, { str: 12 }).met, false);
    assert.strictEqual(checkPrerequisites(feat, { str: 13 }).met, true);

    // Stat object with getValue()
    assert.strictEqual(checkPrerequisites(feat, { str: { getValue: () => 14 } }).met, true);

    // Stat object with base
    assert.strictEqual(checkPrerequisites(feat, { str: { base: 10 } }).met, false);
  });

  it('checks character level prerequisites', () => {
    const feat = { prereqs: [{ type: 'level', value: 6 }] };

    assert.strictEqual(checkPrerequisites(feat, { level: 5 }).met, false);
    assert.strictEqual(checkPrerequisites(feat, { totalLevel: 6 }).met, true);
  });

  it('checks casterLevel prerequisites for full and partial casters', () => {
    const feat = { prereqs: [{ type: 'casterLevel', value: 5 }] };

    // Full caster (Wizard level 5)
    assert.strictEqual(checkPrerequisites(feat, { classes: [{ classType: 'wizard', level: 5 }] }).met, true);
    assert.strictEqual(checkPrerequisites(feat, { classes: [{ classType: 'wizard', level: 4 }] }).met, false);

    // Partial caster (Paladin CL = floor(level / 2) starting at level 4)
    // Paladin 8 -> CL 4 (not met)
    assert.strictEqual(checkPrerequisites(feat, { classes: [{ classType: 'paladin', level: 8 }] }).met, false);
    // Paladin 10 -> CL 5 (met)
    assert.strictEqual(checkPrerequisites(feat, { classes: [{ classType: 'paladin', level: 10 }] }).met, true);
  });

  it('checks skill prerequisites via getSkillRanks and pc.skills object', () => {
    const feat = { prereqs: [{ type: 'skill', name: 'tumble', value: 5 }] };

    // getSkillRanks
    const pcMethod = { getSkillRanks: (name) => name === 'tumble' ? 5 : 0 };
    assert.strictEqual(checkPrerequisites(feat, pcMethod).met, true);

    // pc.skills object with ranks
    const pcObj = { skills: { tumble: { ranks: 4 } } };
    assert.strictEqual(checkPrerequisites(feat, pcObj).met, false);

    // pc.skills object with numeric value
    const pcNum = { skills: { tumble: 6 } };
    assert.strictEqual(checkPrerequisites(feat, pcNum).met, true);
  });

  it('checks sneak_attack prerequisites', () => {
    const feat = { prereqs: [{ type: 'sneak_attack', value: 2 }] };

    // via getSneakAttackDiceCount
    const pcMethod = { getSneakAttackDiceCount: () => 2 };
    assert.strictEqual(checkPrerequisites(feat, pcMethod).met, true);

    // via rogue class level: floor((lvl + 1) / 2). Rogue 2 -> 1d6 (fails), Rogue 3 -> 2d6 (passes)
    const pcRogue2 = { classes: [{ classType: 'rogue', level: 2 }] };
    assert.strictEqual(checkPrerequisites(feat, pcRogue2).met, false);

    const pcRogue3 = { classes: [{ classType: 'rogue', level: 3 }] };
    assert.strictEqual(checkPrerequisites(feat, pcRogue3).met, true);
  });

  describe('custom prerequisites', () => {
    it('handles trapfinding, favored enemy, and smite evil', () => {
      const featTrap = { prereqs: [{ type: 'custom', desc: 'Trapfinding class feature' }] };
      const featFE = { prereqs: [{ type: 'custom', desc: 'Favored Enemy class feature' }] };
      const featSmite = { prereqs: [{ type: 'custom', desc: 'Smite Evil class feature' }] };

      assert.strictEqual(checkPrerequisites(featTrap, { classes: [{ classType: 'scout', level: 1 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featTrap, { classes: [{ classType: 'fighter', level: 5 }] }).met, false);

      assert.strictEqual(checkPrerequisites(featFE, { classes: [{ classType: 'ranger', level: 1 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featFE, { classes: [{ classType: 'barbarian', level: 5 }] }).met, false);

      assert.strictEqual(checkPrerequisites(featSmite, { classes: [{ classType: 'paladin', level: 1 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featSmite, { classes: [{ classType: 'shadowbane_inquisitor', level: 2 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featSmite, { classes: [{ classType: 'shadowbane_inquisitor', level: 1 }] }).met, false);
    });

    it('handles evasion, rage, ki strike, and turn undead', () => {
      const featEvasion = { prereqs: [{ type: 'custom', desc: 'Evasion class feature' }] };
      const featRage = { prereqs: [{ type: 'custom', desc: 'Rage class feature' }] };
      const featKi = { prereqs: [{ type: 'custom', desc: 'Ki Strike class feature' }] };
      const featTurn = { prereqs: [{ type: 'custom', desc: 'Ability to turn undead' }] };

      assert.strictEqual(checkPrerequisites(featEvasion, { classes: [{ classType: 'rogue', level: 2 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featEvasion, { classes: [{ classType: 'monk', level: 1 }] }).met, false);

      assert.strictEqual(checkPrerequisites(featRage, { classes: [{ classType: 'barbarian', level: 1 }] }).met, true);

      assert.strictEqual(checkPrerequisites(featKi, { classes: [{ classType: 'monk', level: 4 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featKi, { classes: [{ classType: 'monk', level: 3 }] }).met, false);

      assert.strictEqual(checkPrerequisites(featTurn, { classes: [{ classType: 'cleric', level: 1 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featTurn, { classes: [{ classType: 'paladin', level: 4 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featTurn, { classes: [{ classType: 'paladin', level: 3 }] }).met, false);
    });

    it('handles spellcasting and familiar custom prerequisites', () => {
      const featSpont = { prereqs: [{ type: 'custom', desc: 'Spontaneous 2nd level arcane spells' }] };
      const featArc3 = { prereqs: [{ type: 'custom', desc: 'Ability to cast 3rd-level arcane spells' }] };
      const featFam = { prereqs: [{ type: 'custom', desc: 'Ability to acquire a familiar' }] };

      // Spontaneous 2nd level arcane (Sorcerer 4+ or Bard 4+)
      assert.strictEqual(checkPrerequisites(featSpont, { classes: [{ classType: 'sorcerer', level: 4 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featSpont, { classes: [{ classType: 'bard', level: 4 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featSpont, { classes: [{ classType: 'bard', level: 3 }] }).met, false);

      // Cast 3rd level arcane (Wizard 5+ or Sorcerer 6+)
      assert.strictEqual(checkPrerequisites(featArc3, { classes: [{ classType: 'wizard', level: 5 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featArc3, { classes: [{ classType: 'sorcerer', level: 6 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featArc3, { classes: [{ classType: 'sorcerer', level: 5 }] }).met, false);

      // Familiar (Wizard 1+ or Sorcerer 1+)
      assert.strictEqual(checkPrerequisites(featFam, { classes: [{ classType: 'wizard', level: 1 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featFam, { classes: [{ classType: 'sorcerer', level: 1 }] }).met, true);
      assert.strictEqual(checkPrerequisites(featFam, { classes: [{ classType: 'cleric', level: 1 }] }).met, false);
    });

    it('handles fallback unknown custom requirements with met: true', () => {
      const featUnknown = { prereqs: [{ type: 'custom', desc: 'Special DM Permission' }] };
      const res = checkPrerequisites(featUnknown, {});
      assert.strictEqual(res.met, true);
      assert.strictEqual(res.details[0].desc, 'Special: Special DM Permission');
    });
  });
});
