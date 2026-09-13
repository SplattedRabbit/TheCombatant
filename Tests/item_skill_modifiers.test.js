// Tests/item_skill_modifiers.test.js
// Unit tests for equipment / magic item skill bonuses, D&D 3.5e stacking, and Combatant integration.

import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { Stat } from '../js/models/Stat.js';
import { getItemModForSkill } from '../js/rules/RulesSkills.js';
import { calculateSkillModifier } from '../js/models/helpers/skills/CombatantSkills.js';

test('Item Skill Modifiers - Equipped item provides skill bonus (e.g. +5 Spot)', () => {
  const pc = new Combatant({
    id: 'pc_spot_item',
    name: 'Eagle Eye Ranger',
    type: 'player',
    race: 'human',
    classes: [{ classType: 'ranger', level: 5 }],
    wis: new Stat(14), // +2 WIS
    skills: {
      spot: { ranks: 4, misc: 0 }
    },
    items: [
      {
        id: 'eyes_of_eagle',
        name: 'Eyes of the Eagle',
        isEquipped: true,
        effects: [
          { type: 'skill', target: 'spot', value: 5, bonusType: 'competence' }
        ]
      }
    ]
  });

  const itemMod = getItemModForSkill(pc, 'spot');
  assert.strictEqual(itemMod, 5, 'Equipped Eyes of the Eagle should grant +5 to Spot');

  // Base: 4 ranks + 2 WIS + 5 Item = 11
  const totalMod = calculateSkillModifier(pc, 'spot');
  assert.strictEqual(totalMod, 11, 'Total Spot modifier must include +5 item bonus');
  assert.strictEqual(pc.getSkillModifier('spot'), 11, 'pc.getSkillModifier must match total');
});

test('Item Skill Modifiers - Unequipped item does not grant bonuses', () => {
  const pc = new Combatant({
    id: 'pc_unequipped',
    name: 'Unequipped Ranger',
    type: 'player',
    race: 'human',
    classes: [{ classType: 'ranger', level: 1 }],
    wis: new Stat(10),
    skills: {
      spot: { ranks: 2, misc: 0 }
    },
    items: [
      {
        id: 'eyes_of_eagle_bag',
        name: 'Eyes of the Eagle (in backpack)',
        isEquipped: false,
        effects: [
          { type: 'skill', target: 'spot', value: 5, bonusType: 'competence' }
        ]
      }
    ]
  });

  const itemMod = getItemModForSkill(pc, 'spot');
  assert.strictEqual(itemMod, 0, 'Unequipped item must grant 0 item bonus');
  assert.strictEqual(pc.getSkillModifier('spot'), 2, 'Total Spot should only have ranks');
});

test('Item Skill Modifiers - Stacking rules: Typed bonuses (competence) do not stack', () => {
  const pc = new Combatant({
    id: 'pc_stacking',
    name: 'Stacking Tester',
    type: 'player',
    race: 'human',
    classes: [{ classType: 'rogue', level: 3 }],
    dex: new Stat(16), // +3 DEX
    skills: {
      hide: { ranks: 4, misc: 0 }
    },
    items: [
      {
        id: 'cloak_elvenkind',
        name: 'Cloak of Elvenkind',
        isEquipped: true,
        effects: [
          { type: 'skill', target: 'hide', value: 5, bonusType: 'competence' }
        ]
      },
      {
        id: 'lesser_shadow_cape',
        name: 'Shadow Cape (Lesser)',
        isEquipped: true,
        effects: [
          { type: 'skill', target: 'hide', value: 2, bonusType: 'competence' }
        ]
      }
    ]
  });

  const itemMod = getItemModForSkill(pc, 'hide');
  assert.strictEqual(itemMod, 5, 'Two competence bonuses (+5 and +2) must not stack; highest (+5) applies');
  assert.strictEqual(pc.getSkillModifier('hide'), 4 + 3 + 5, 'Total Hide should be 4 ranks + 3 DEX + 5 Item = 12');
});

test('Item Skill Modifiers - Different bonus types (competence + luck "all") stack', () => {
  const pc = new Combatant({
    id: 'pc_multi_type',
    name: 'Lucky Scout',
    type: 'player',
    race: 'human',
    classes: [{ classType: 'scout', level: 4 }],
    wis: new Stat(10),
    skills: {
      spot: { ranks: 5, misc: 0 },
      listen: { ranks: 3, misc: 0 }
    },
    items: [
      {
        id: 'eyes_of_eagle',
        name: 'Eyes of the Eagle',
        isEquipped: true,
        effects: [
          { type: 'skill', target: 'spot', value: 5, bonusType: 'competence' }
        ]
      },
      {
        id: 'luckstone',
        name: 'Stone of Good Luck',
        isEquipped: true,
        effects: [
          { type: 'skill', target: 'all', value: 1, bonusType: 'luck' }
        ]
      }
    ]
  });

  // Spot: +5 competence + 1 luck = +6
  const spotMod = getItemModForSkill(pc, 'spot');
  assert.strictEqual(spotMod, 6, 'Competence (+5) and Luck (+1) bonuses on Spot must stack to +6');

  // Listen: +0 competence + 1 luck = +1
  const listenMod = getItemModForSkill(pc, 'listen');
  assert.strictEqual(listenMod, 1, 'Luckstone (+1 to all skills) must apply +1 to Listen');
});

test('Item Skill Modifiers - Fallback for legacy pc.equipment.worn format', () => {
  const legacyPC = {
    classes: [{ classType: 'fighter', level: 2 }],
    skills: { climb: { ranks: 3, misc: 0 } },
    equipment: {
      worn: [
        {
          name: 'Climber Gloves',
          modifiers: [{ type: 'skill', target: 'climb', value: 4 }]
        }
      ]
    }
  };

  const itemMod = getItemModForSkill(legacyPC, 'climb');
  assert.strictEqual(itemMod, 4, 'Legacy pc.equipment.worn modifiers must be supported as fallback');
});
