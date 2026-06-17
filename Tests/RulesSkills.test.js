import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isClassSkill, getPCMaxRanks, calculateTotalSkillPoints } from '../js/rules/RulesSkills.js';

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
});
