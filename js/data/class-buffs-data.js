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
    effects: [
      { target: 'str', value: 6, type: 'morale', source: 'Großer Kampfrausch' },
      { target: 'con', value: 6, type: 'morale', source: 'Großer Kampfrausch' },
      { target: 'wil', value: 3, type: 'morale', source: 'Großer Kampfrausch' },
      { target: 'ac', value: -2, type: 'untyped', source: 'Großer Kampfrausch' }
    ]
  },
  {
    key: 'inspire_courage_1',
    name: 'Mut einflößen +1 (Inspire Courage)',
    school: 'Klassenfähigkeit (Barde)',
    duration: '5 Runden nach Ende des Gesangs',
    description: 'Gewährt einen +1 Moralbonus auf Rettungswürfe gegen Furcht und einen +1 Moralbonus auf Angriffs- und Schadenswürfe.',
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
    effects: [
      { target: 'baseWil', value: 4, type: 'morale', source: 'Aura der Entschlossenheit (Gegen Zwang)' }
    ]
  }
];
