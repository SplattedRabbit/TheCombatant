/**
 * @module    class-buffs-data
 * @summary   Static registry of D&D 3.5e non-spell class buffs and custom auras.
 */

export const CLASS_BUFFS = [
  {
    key: 'rage',
    name: 'Rage',
    school: 'Class Feature (Barbarian)',
    duration: '5 rounds',
    description: 'A barbarian can fly into a rage. Grants a +4 morale bonus to Strength and Constitution, a +2 morale bonus to Will saves, and a -2 penalty to Armor Class (AC).',
    classRequirements: [{ classType: 'barbarian', level: 1 }],
    effects: [
      { target: 'str', value: 4, type: 'morale', source: 'Rage' },
      { target: 'con', value: 4, type: 'morale', source: 'Rage' },
      { target: 'wil', value: 2, type: 'morale', source: 'Rage' },
      { target: 'ac', value: -2, type: 'untyped', source: 'Rage' }
    ]
  },
  {
    key: 'greater_rage',
    name: 'Greater Rage',
    school: 'Class Feature (Barbarian)',
    duration: '5 rounds',
    description: 'Grants a +6 morale bonus to Strength and Constitution, a +3 morale bonus to Will saves, and a -2 penalty to Armor Class (AC).',
    classRequirements: [{ classType: 'barbarian', level: 11 }],
    effects: [
      { target: 'str', value: 6, type: 'morale', source: 'Greater Rage' },
      { target: 'con', value: 6, type: 'morale', source: 'Greater Rage' },
      { target: 'wil', value: 3, type: 'morale', source: 'Greater Rage' },
      { target: 'ac', value: -2, type: 'untyped', source: 'Greater Rage' }
    ]
  },
  {
    key: 'mighty_rage',
    name: 'Mighty Rage',
    school: 'Class Feature (Barbarian)',
    duration: '5 rounds',
    description: 'Grants a +8 morale bonus to Strength and Constitution, a +4 morale bonus to Will saves, and a -2 penalty to Armor Class (AC).',
    classRequirements: [{ classType: 'barbarian', level: 20 }],
    effects: [
      { target: 'str', value: 8, type: 'morale', source: 'Mighty Rage' },
      { target: 'con', value: 8, type: 'morale', source: 'Mighty Rage' },
      { target: 'wil', value: 4, type: 'morale', source: 'Mighty Rage' },
      { target: 'ac', value: -2, type: 'untyped', source: 'Mighty Rage' }
    ]
  },
  {
    key: 'inspire_courage_1',
    name: 'Inspire Courage +1',
    school: 'Class Feature (Bard)',
    duration: '5 rounds after performance ends',
    description: 'Grants a +1 morale bonus on saving throws against fear and a +1 morale bonus on attack and weapon damage rolls.',
    classRequirements: [{ classType: 'bard', level: 1 }],
    effects: [
      { target: 'atk', value: 1, type: 'morale', source: 'Inspire Courage' },
      { target: 'dmg', value: 1, type: 'morale', source: 'Inspire Courage' }
    ]
  },
  {
    key: 'inspire_courage_2',
    name: 'Inspire Courage +2',
    school: 'Class Feature (Bard)',
    duration: '5 rounds after performance ends',
    description: 'Grants a +2 morale bonus on saving throws against fear and a +2 morale bonus on attack and weapon damage rolls.',
    classRequirements: [{ classType: 'bard', level: 8 }],
    effects: [
      { target: 'atk', value: 2, type: 'morale', source: 'Inspire Courage' },
      { target: 'dmg', value: 2, type: 'morale', source: 'Inspire Courage' }
    ]
  },
  {
    key: 'inspire_courage_3',
    name: 'Inspire Courage +3',
    school: 'Class Feature (Bard)',
    duration: '5 rounds after performance ends',
    description: 'Grants a +3 morale bonus on saving throws against fear and a +3 morale bonus on attack and weapon damage rolls.',
    classRequirements: [{ classType: 'bard', level: 14 }],
    effects: [
      { target: 'atk', value: 3, type: 'morale', source: 'Inspire Courage' },
      { target: 'dmg', value: 3, type: 'morale', source: 'Inspire Courage' }
    ]
  },
  {
    key: 'inspire_courage_4',
    name: 'Inspire Courage +4',
    school: 'Class Feature (Bard)',
    duration: '5 rounds after performance ends',
    description: 'Grants a +4 morale bonus on saving throws against fear and a +4 morale bonus on attack and weapon damage rolls.',
    classRequirements: [{ classType: 'bard', level: 20 }],
    effects: [
      { target: 'atk', value: 4, type: 'morale', source: 'Inspire Courage' },
      { target: 'dmg', value: 4, type: 'morale', source: 'Inspire Courage' }
    ]
  },
  {
    key: 'aura_of_courage',
    name: 'Aura of Courage',
    school: 'Aura (Paladin)',
    duration: 'Permanent',
    description: 'A paladin is immune to fear. Each ally within 10 feet gains a +4 morale bonus on saving throws against fear.',
    classRequirements: [{ classType: 'paladin', level: 3 }],
    effects: [
      { target: 'baseWil', value: 4, type: 'morale', source: 'Aura of Courage (vs Fear)' }
    ]
  },
  {
    key: 'aura_of_resolve',
    name: 'Aura of Resolve',
    school: 'Aura (Paladin)',
    duration: 'Permanent',
    description: 'A paladin is immune to compulsion effects. Each ally within 10 feet gains a +4 morale bonus on saving throws against compulsion.',
    classRequirements: [{ classType: 'paladin', level: 8 }],
    effects: [
      { target: 'baseWil', value: 4, type: 'morale', source: 'Aura of Resolve (vs Compulsion)' }
    ]
  },
  {
    key: 'inspire_competence',
    name: 'Inspire Competence',
    school: 'Class Feature (Bard)',
    duration: 'Up to 2 minutes (concentration)',
    description: 'Grants an ally a +2 competence bonus on skill checks.',
    classRequirements: [{ classType: 'bard', level: 3 }],
    effects: []
  },
  {
    key: 'inspire_greatness',
    name: 'Inspire Greatness',
    school: 'Class Feature (Bard)',
    duration: 'Duration of song + 5 rounds',
    description: 'Grants +2 Hit Dice (temporary hit points, AC and saving throw adjustments), a +2 competence bonus on attacks, and a +1 competence bonus on Fortitude saves.',
    classRequirements: [{ classType: 'bard', level: 9 }],
    effects: [
      { target: 'atk', value: 2, type: 'competence', source: 'Inspire Greatness' },
      { target: 'baseZa', value: 1, type: 'competence', source: 'Inspire Greatness' }
    ]
  },
  {
    key: 'inspire_heroics',
    name: 'Inspire Heroics',
    school: 'Class Feature (Bard)',
    duration: 'Duration of song + 5 rounds',
    description: 'Grants a +4 morale bonus on all saves and a +4 dodge bonus to Armor Class (AC).',
    classRequirements: [{ classType: 'bard', level: 15 }],
    effects: [
      { target: 'baseZa', value: 4, type: 'morale', source: 'Inspire Heroics' },
      { target: 'baseRef', value: 4, type: 'morale', source: 'Inspire Heroics' },
      { target: 'baseWil', value: 4, type: 'morale', source: 'Inspire Heroics' },
      { target: 'acDodge', value: 4, type: 'dodge', source: 'Inspire Heroics' }
    ]
  }
];
