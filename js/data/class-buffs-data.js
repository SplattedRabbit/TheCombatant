/**
 * @module    class-buffs-data
 * @summary   Static registry of D&D 3.5e non-spell class buffs and custom auras.
 */

export const CLASS_BUFFS = [
  {
    key: 'rage',
    name: 'Kampfrausch (Rage)',
    school: 'Klassenfähigkeit (Barbar)',
    duration: '5 Runden',
    description: 'Ein Barbar kann in Kampfrausch verfallen. Gewährt +4 Moralbonus auf Stärke und Konstitution, +2 Moralbonus auf Willensrettungswürfe und einen Malus von -2 auf die Rüstungsklasse (RK).',
    classRequirements: [{ classType: 'barbarian', level: 1 }],
    effects: [
      { target: 'str', value: 4, type: 'morale', source: 'Kampfrausch' },
      { target: 'con', value: 4, type: 'morale', source: 'Kampfrausch' },
      { target: 'wil', value: 2, type: 'morale', source: 'Kampfrausch' },
      { target: 'ac', value: -2, type: 'untyped', source: 'Kampfrausch' }
    ]
  },
  {
    key: 'greater_rage',
    name: 'Großer Kampfrausch (Greater Rage)',
    school: 'Klassenfähigkeit (Barbar)',
    duration: '5 Runden',
    description: 'Gewährt +6 Moralbonus auf Stärke und Konstitution, +3 Moralbonus auf Willensrettungswürfe und einen Malus von -2 auf die Rüstungsklasse (RK).',
    classRequirements: [{ classType: 'barbarian', level: 11 }],
    effects: [
      { target: 'str', value: 6, type: 'morale', source: 'Großer Kampfrausch' },
      { target: 'con', value: 6, type: 'morale', source: 'Großer Kampfrausch' },
      { target: 'wil', value: 3, type: 'morale', source: 'Großer Kampfrausch' },
      { target: 'ac', value: -2, type: 'untyped', source: 'Großer Kampfrausch' }
    ]
  },
  {
    key: 'mighty_rage',
    name: 'Mächtiger Kampfrausch (Mighty Rage)',
    school: 'Klassenfähigkeit (Barbar)',
    duration: '5 Runden',
    description: 'Gewährt +8 Moralbonus auf Stärke und Konstitution, +4 Moralbonus auf Willensrettungswürfe und einen Malus von -2 auf die Rüstungsklasse (RK).',
    classRequirements: [{ classType: 'barbarian', level: 20 }],
    effects: [
      { target: 'str', value: 8, type: 'morale', source: 'Mächtiger Kampfrausch' },
      { target: 'con', value: 8, type: 'morale', source: 'Mächtiger Kampfrausch' },
      { target: 'wil', value: 4, type: 'morale', source: 'Mächtiger Kampfrausch' },
      { target: 'ac', value: -2, type: 'untyped', source: 'Mächtiger Kampfrausch' }
    ]
  },
  {
    key: 'inspire_courage_1',
    name: 'Mut einflößen +1 (Inspire Courage)',
    school: 'Klassenfähigkeit (Barde)',
    duration: '5 Runden nach Ende des Gesangs',
    description: 'Gewährt einen +1 Moralbonus auf Rettungswürfe gegen Furcht und einen +1 Moralbonus auf Angriffs- und Schadenswürfe.',
    classRequirements: [{ classType: 'bard', level: 1 }],
    effects: [
      { target: 'atk', value: 1, type: 'morale', source: 'Mut einflößen' },
      { target: 'dmg', value: 1, type: 'morale', source: 'Mut einflößen' }
    ]
  },
  {
    key: 'inspire_courage_2',
    name: 'Mut einflößen +2',
    school: 'Klassenfähigkeit (Barde)',
    duration: '5 Runden nach Ende des Gesangs',
    description: 'Gewährt einen +2 Moralbonus auf Rettungswürfe gegen Furcht und einen +2 Moralbonus auf Angriffs- und Schadenswürfe.',
    classRequirements: [{ classType: 'bard', level: 8 }],
    effects: [
      { target: 'atk', value: 2, type: 'morale', source: 'Mut einflößen' },
      { target: 'dmg', value: 2, type: 'morale', source: 'Mut einflößen' }
    ]
  },
  {
    key: 'inspire_courage_3',
    name: 'Mut einflößen +3',
    school: 'Klassenfähigkeit (Barde)',
    duration: '5 Runden nach Ende des Gesangs',
    description: 'Gewährt einen +3 Moralbonus auf Rettungswürfe gegen Furcht und einen +3 Moralbonus auf Angriffs- und Schadenswürfe.',
    classRequirements: [{ classType: 'bard', level: 14 }],
    effects: [
      { target: 'atk', value: 3, type: 'morale', source: 'Mut einflößen' },
      { target: 'dmg', value: 3, type: 'morale', source: 'Mut einflößen' }
    ]
  },
  {
    key: 'inspire_courage_4',
    name: 'Mut einflößen +4',
    school: 'Klassenfähigkeit (Barde)',
    duration: '5 Runden nach Ende des Gesangs',
    description: 'Gewährt einen +4 Moralbonus auf Rettungswürfe gegen Furcht und einen +4 Moralbonus auf Angriffs- und Schadenswürfe.',
    classRequirements: [{ classType: 'bard', level: 20 }],
    effects: [
      { target: 'atk', value: 4, type: 'morale', source: 'Mut einflößen' },
      { target: 'dmg', value: 4, type: 'morale', source: 'Mut einflößen' }
    ]
  },
  {
    key: 'aura_of_courage',
    name: 'Aura der Tapferkeit (Aura of Courage)',
    school: 'Aura (Paladin)',
    duration: 'Permanent',
    description: 'Ein Paladin ist immun gegen Furcht. Jeder Verbündete innerhalb von 10 Fuß erhält einen Moralbonus von +4 auf Rettungswürfe gegen Furcht.',
    classRequirements: [{ classType: 'paladin', level: 3 }],
    effects: [
      { target: 'baseWil', value: 4, type: 'morale', source: 'Aura der Tapferkeit (Gegen Furcht)' }
    ]
  },
  {
    key: 'aura_of_resolve',
    name: 'Aura der Entschlossenheit (Aura of Resolve)',
    school: 'Aura (Paladin)',
    duration: 'Permanent',
    description: 'Ein Paladin ist immun gegen Zwangseffekte. Jeder Verbündete innerhalb von 10 Fuß erhält einen Moralbonus von +4 auf Rettungswürfe gegen Zwangseffekte.',
    classRequirements: [{ classType: 'paladin', level: 8 }],
    effects: [
      { target: 'baseWil', value: 4, type: 'morale', source: 'Aura der Entschlossenheit (Gegen Zwang)' }
    ]
  },
  {
    key: 'inspire_competence',
    name: 'Kompetenz einflößen (Inspire Competence)',
    school: 'Klassenfähigkeit (Barde)',
    duration: 'Bis zu 2 Minuten (Konzentration)',
    description: 'Gewährt einem Verbündeten einen +2 Kompetenzbonus auf Fertigkeitsproben.',
    classRequirements: [{ classType: 'bard', level: 3 }],
    effects: []
  },
  {
    key: 'inspire_greatness',
    name: 'Heldenmut einflößen (Inspire Greatness)',
    school: 'Klassenfähigkeit (Barde)',
    duration: 'Dauer des Gesangs + 5 Runden',
    description: 'Gewährt +2 Trefferwürfel (Trefferpunkte, RK- und Rettungswurfanpassung), einen +2 Kompetenzbonus auf Angriffs- und einen +1 Kompetenzbonus auf Zähigkeitsrettungswürfe.',
    classRequirements: [{ classType: 'bard', level: 9 }],
    effects: [
      { target: 'atk', value: 2, type: 'competence', source: 'Heldenmut einflößen' },
      { target: 'baseZa', value: 1, type: 'competence', source: 'Heldenmut einflößen' }
    ]
  },
  {
    key: 'inspire_heroics',
    name: 'Heldentum einflößen (Inspire Heroics)',
    school: 'Klassenfähigkeit (Barde)',
    duration: 'Dauer des Gesangs + 5 Runden',
    description: 'Gewährt +4 Moralbonus auf alle Rettungswürfe und einen +4 Ausweichbonus auf die Rüstungsklasse (RK).',
    classRequirements: [{ classType: 'bard', level: 15 }],
    effects: [
      { target: 'baseZa', value: 4, type: 'morale', source: 'Heldentum einflößen' },
      { target: 'baseRef', value: 4, type: 'morale', source: 'Heldentum einflößen' },
      { target: 'baseWil', value: 4, type: 'morale', source: 'Heldentum einflößen' },
      { target: 'acDodge', value: 4, type: 'dodge', source: 'Heldentum einflößen' }
    ]
  }
];
