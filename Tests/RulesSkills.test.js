import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isClassSkill,
  getPCMaxRanks,
  calculateTotalSkillPoints,
  calculateSpentSkillPoints,
  getMaxSkillTricksLimit,
  checkSkillTrickPrerequisites
} from '../js/rules/RulesSkills.js';

describe('RulesSkills Module', () => {
  it('isClassSkill: maps core class skills correctly', () => {
    const pcFighter = { classes: [{ classType: 'fighter', level: 1 }] };
    assert.equal(isClassSkill('climb', pcFighter), true);
    assert.equal(isClassSkill('swim', pcFighter), true);
    assert.equal(isClassSkill('spellcraft', pcFighter), false);
  });

  it('isClassSkill: wizard knowledge wildcards', () => {
    const pcWizard = { classes: [{ classType: 'wizard', level: 1 }] };
    assert.equal(isClassSkill('knowledge_arcana', pcWizard), true);
    assert.equal(isClassSkill('knowledge_planes', pcWizard), true);
    assert.equal(isClassSkill('knowledge_local', pcWizard), true);
  });

  it('getPCMaxRanks: class skill max ranks equals level + 3', () => {
    const pc = { classes: [{ classType: 'fighter', level: 4 }] };
    assert.equal(getPCMaxRanks('climb', pc), 7);
  });

  it('getPCMaxRanks: cross-class skill max ranks equals (level + 3) / 2', () => {
    const pc = { classes: [{ classType: 'fighter', level: 4 }] };
    assert.equal(getPCMaxRanks('spellcraft', pc), 3.5);
  });

  it('calculateTotalSkillPoints: rogue skill points progression', () => {
    const pcRogue = {
      race: 'human',
      isHuman: true,
      int: { getValue: () => 14 },
      classes: [{ classType: 'rogue', level: 1 }]
    };
    // (8 [Base] + 2 [IntMod]) * 4 + 4 [Human] = 44 points at level 1
    assert.equal(calculateTotalSkillPoints(pcRogue), 44);
  });

  it('calculateSpentSkillPoints: spent SP calculation with skills and tricks', () => {
    const pc = {
      classes: [{ classType: 'rogue', level: 1 }],
      skills: {
        disable_device: { ranks: 4 }, // class skill, cost = 4
        spellcraft: { ranks: 2 }      // cross-class, cost = 4
      },
      skillTricks: [
        { id: 'healing_hands', isBonus: false }, // regular cost = 2
        { id: 'spot_the_weak_point', isBonus: true } // bonus cost = 0
      ]
    };
    // 4 (disable_device) + 4 (spellcraft CC) + 2 (healing_hands) = 10 SP spent
    assert.equal(calculateSpentSkillPoints(pc), 10);
  });

  it('getMaxSkillTricksLimit: calculates limits correctly with Battle Trickster bonus', () => {
    const pcStandard = {
      classes: [
        { classType: 'rogue', level: 5 },
        { classType: 'wizard', level: 2 }
      ]
    };
    // level 7: limit = Math.ceil(7/2) = 4
    assert.equal(getMaxSkillTricksLimit(pcStandard), 4);

    const pcBattleTrickster1 = {
      classes: [
        { classType: 'fighter', level: 5 },
        { classType: 'battle_trickster', level: 1 }
      ]
    };
    // level 6: limit = Math.ceil(6/2) + 1 (lvl 1 bonus) = 3 + 1 = 4
    assert.equal(getMaxSkillTricksLimit(pcBattleTrickster1), 4);

    const pcBattleTrickster3 = {
      classes: [
        { classType: 'fighter', level: 5 },
        { classType: 'battle_trickster', level: 3 }
      ]
    };
    // level 8: limit = Math.ceil(8/2) + 2 (lvl 3 bonus) = 4 + 2 = 6
    assert.equal(getMaxSkillTricksLimit(pcBattleTrickster3), 6);
  });

  it('checkSkillTrickPrerequisites: checks skills and feats correctly', () => {
    const pc = {
      feats: [{ id: 'quick_draw' }],
      skills: {
        sleight_of_hand: { ranks: 5 },
        heal: { ranks: 3 }
      },
      getSkillRanks(key) {
        return this.skills[key] ? this.skills[key].ranks : 0;
      },
      hasFeat(featId) {
        return this.feats.some(f => f.id === featId);
      }
    };

    // hidden_blade requires Sleight of Hand 5 and Quick Draw
    const res1 = checkSkillTrickPrerequisites('hidden_blade', pc);
    assert.equal(res1.met, true);

    // healing_hands requires Heal 5 (pc only has Heal 3)
    const res2 = checkSkillTrickPrerequisites('healing_hands', pc);
    assert.equal(res2.met, false);
  });
});

