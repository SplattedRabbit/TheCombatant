/**
 * @module    registryWorn
 * @summary   Worn magic items registry (Head, Face, Neck, Shoulders, Torso, Body, Wrists, Hands, Waist, Feet, Rings).
 * @exports   REGISTRY_WORN
 */

export const REGISTRY_WORN = {
  // === HEAD ===
  headband_of_intellect_2: {
    key: 'headband_of_intellect_2',
    name: 'Headband of Intellect +2',
    slot: 'head',
    aura: 'Faint Transmutation',
    effects: [{ type: 'attribute', target: 'int', value: 2, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Intelligence of +2.'
  },
  headband_of_intellect_4: {
    key: 'headband_of_intellect_4',
    name: 'Headband of Intellect +4',
    slot: 'head',
    aura: 'Moderate Transmutation',
    effects: [{ type: 'attribute', target: 'int', value: 4, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Intelligence of +4.'
  },
  headband_of_intellect_6: {
    key: 'headband_of_intellect_6',
    name: 'Headband of Intellect +6',
    slot: 'head',
    aura: 'Strong Transmutation',
    effects: [{ type: 'attribute', target: 'int', value: 6, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Intelligence of +6.'
  },
  helm_of_telepathy: {
    key: 'helm_of_telepathy',
    name: 'Helm of Telepathy',
    slot: 'head',
    aura: 'Faint Divination',
    effects: [],
    activation: { actionType: 'standard', costType: 'unlimited', cost: 0, effectDescription: 'Detect thoughts at will; send telepathic message.' },
    description: 'Enables wearer to use detect thoughts at will and communicate telepathically.'
  },

  // === FACE ===
  goggles_of_night: {
    key: 'goggles_of_night',
    name: 'Goggles of Night',
    slot: 'face',
    aura: 'Faint Transmutation',
    effects: [{ type: 'special', target: 'darkvision', value: 60, bonusType: 'untyped' }],
    description: 'Grants darkvision out to 60 feet.'
  },
  eyes_of_the_eagle: {
    key: 'eyes_of_the_eagle',
    name: 'Eyes of the Eagle',
    slot: 'face',
    aura: 'Faint Divination',
    effects: [{ type: 'skill', target: 'spot', value: 5, bonusType: 'competence' }],
    description: 'Grants a +5 competence bonus on Spot checks.'
  },
  goggles_of_the_golden_sun: {
    key: 'goggles_of_the_golden_sun',
    name: 'Goggles of the Golden Sun',
    slot: 'face',
    setId: 'raiment_of_the_four',
    aura: 'Faint Evocation',
    effects: [{ type: 'skill', target: 'spot', value: 2, bonusType: 'competence' }],
    description: 'Part of Raiment of the Four. Grants +2 on Spot checks and immunity to blindness from bright light.'
  },

  // === NECK ===
  amulet_of_health_2: {
    key: 'amulet_of_health_2',
    name: 'Amulet of Health +2',
    slot: 'neck',
    aura: 'Faint Transmutation',
    effects: [{ type: 'attribute', target: 'con', value: 2, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Constitution of +2.'
  },
  amulet_of_health_4: {
    key: 'amulet_of_health_4',
    name: 'Amulet of Health +4',
    slot: 'neck',
    aura: 'Moderate Transmutation',
    effects: [{ type: 'attribute', target: 'con', value: 4, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Constitution of +4.'
  },
  amulet_of_health_6: {
    key: 'amulet_of_health_6',
    name: 'Amulet of Health +6',
    slot: 'neck',
    aura: 'Strong Transmutation',
    effects: [{ type: 'attribute', target: 'con', value: 6, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Constitution of +6.'
  },
  amulet_of_natural_armor_1: {
    key: 'amulet_of_natural_armor_1',
    name: 'Amulet of Natural Armor +1',
    slot: 'neck',
    aura: 'Faint Transmutation',
    effects: [{ type: 'ac', target: 'natural', value: 1, bonusType: 'natural_enhancement' }],
    description: 'Enhances existing natural armor by +1.'
  },
  amulet_of_natural_armor_2: {
    key: 'amulet_of_natural_armor_2',
    name: 'Amulet of Natural Armor +2',
    slot: 'neck',
    aura: 'Faint Transmutation',
    effects: [{ type: 'ac', target: 'natural', value: 2, bonusType: 'natural_enhancement' }],
    description: 'Enhances existing natural armor by +2.'
  },
  amulet_of_natural_armor_3: {
    key: 'amulet_of_natural_armor_3',
    name: 'Amulet of Natural Armor +3',
    slot: 'neck',
    aura: 'Moderate Transmutation',
    effects: [{ type: 'ac', target: 'natural', value: 3, bonusType: 'natural_enhancement' }],
    description: 'Enhances existing natural armor by +3.'
  },
  amulet_of_natural_armor_4: {
    key: 'amulet_of_natural_armor_4',
    name: 'Amulet of Natural Armor +4',
    slot: 'neck',
    aura: 'Moderate Transmutation',
    effects: [{ type: 'ac', target: 'natural', value: 4, bonusType: 'natural_enhancement' }],
    description: 'Enhances existing natural armor by +4.'
  },
  amulet_of_natural_armor_5: {
    key: 'amulet_of_natural_armor_5',
    name: 'Amulet of Natural Armor +5',
    slot: 'neck',
    aura: 'Strong Transmutation',
    effects: [{ type: 'ac', target: 'natural', value: 5, bonusType: 'natural_enhancement' }],
    description: 'Enhances existing natural armor by +5.'
  },
  periapt_of_wisdom_2: {
    key: 'periapt_of_wisdom_2',
    name: 'Periapt of Wisdom +2',
    slot: 'neck',
    aura: 'Faint Transmutation',
    effects: [{ type: 'attribute', target: 'wis', value: 2, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Wisdom of +2.'
  },
  periapt_of_wisdom_4: {
    key: 'periapt_of_wisdom_4',
    name: 'Periapt of Wisdom +4',
    slot: 'neck',
    aura: 'Moderate Transmutation',
    effects: [{ type: 'attribute', target: 'wis', value: 4, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Wisdom of +4.'
  },
  periapt_of_wisdom_6: {
    key: 'periapt_of_wisdom_6',
    name: 'Periapt of Wisdom +6',
    slot: 'neck',
    aura: 'Strong Transmutation',
    effects: [{ type: 'attribute', target: 'wis', value: 6, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Wisdom of +6.'
  },
  periapt_of_the_sullying_horn: {
    key: 'periapt_of_the_sullying_horn',
    name: 'Periapt of the Sullying Horn',
    slot: 'neck',
    setId: 'raiment_of_the_four',
    aura: 'Faint Abjuration',
    effects: [{ type: 'save', target: 'fort', value: 1, bonusType: 'resistance' }],
    description: 'Part of Raiment of the Four. Grants +1 resistance on Fortitude saves.'
  },
  amulet_of_teamwork: {
    key: 'amulet_of_teamwork',
    name: 'Amulet of Teamwork',
    slot: 'neck',
    setId: 'wraiths_woe',
    aura: 'Faint Divination',
    effects: [{ type: 'damage', target: 'melee_atk', value: 1, bonusType: 'competence' }],
    description: "Part of Wraith's Woe. Grants +1 competence bonus on melee damage when flanking."
  },

  // === SHOULDERS ===
  cloak_of_resistance_1: {
    key: 'cloak_of_resistance_1',
    name: 'Cloak of Resistance +1',
    slot: 'shoulders',
    aura: 'Faint Abjuration',
    effects: [{ type: 'save', target: 'all', value: 1, bonusType: 'resistance' }],
    description: 'Offers a +1 resistance bonus on all saving throws.'
  },
  cloak_of_resistance_2: {
    key: 'cloak_of_resistance_2',
    name: 'Cloak of Resistance +2',
    slot: 'shoulders',
    aura: 'Faint Abjuration',
    effects: [{ type: 'save', target: 'all', value: 2, bonusType: 'resistance' }],
    description: 'Offers a +2 resistance bonus on all saving throws.'
  },
  cloak_of_resistance_3: {
    key: 'cloak_of_resistance_3',
    name: 'Cloak of Resistance +3',
    slot: 'shoulders',
    aura: 'Moderate Abjuration',
    effects: [{ type: 'save', target: 'all', value: 3, bonusType: 'resistance' }],
    description: 'Offers a +3 resistance bonus on all saving throws.'
  },
  cloak_of_resistance_4: {
    key: 'cloak_of_resistance_4',
    name: 'Cloak of Resistance +4',
    slot: 'shoulders',
    aura: 'Moderate Abjuration',
    effects: [{ type: 'save', target: 'all', value: 4, bonusType: 'resistance' }],
    description: 'Offers a +4 resistance bonus on all saving throws.'
  },
  cloak_of_resistance_5: {
    key: 'cloak_of_resistance_5',
    name: 'Cloak of Resistance +5',
    slot: 'shoulders',
    aura: 'Strong Abjuration',
    effects: [{ type: 'save', target: 'all', value: 5, bonusType: 'resistance' }],
    description: 'Offers a +5 resistance bonus on all saving throws.'
  },
  cloak_of_charisma_2: {
    key: 'cloak_of_charisma_2',
    name: 'Cloak of Charisma +2',
    slot: 'shoulders',
    aura: 'Faint Transmutation',
    effects: [{ type: 'attribute', target: 'cha', value: 2, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Charisma of +2.'
  },
  cloak_of_charisma_4: {
    key: 'cloak_of_charisma_4',
    name: 'Cloak of Charisma +4',
    slot: 'shoulders',
    aura: 'Moderate Transmutation',
    effects: [{ type: 'attribute', target: 'cha', value: 4, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Charisma of +4.'
  },
  cloak_of_charisma_6: {
    key: 'cloak_of_charisma_6',
    name: 'Cloak of Charisma +6',
    slot: 'shoulders',
    aura: 'Strong Transmutation',
    effects: [{ type: 'attribute', target: 'cha', value: 6, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Charisma of +6.'
  },
  cloak_of_displacement_minor: {
    key: 'cloak_of_displacement_minor',
    name: 'Cloak of Displacement (Minor)',
    slot: 'shoulders',
    aura: 'Faint Illusion',
    effects: [{ type: 'special', target: 'concealment', value: 20, bonusType: 'untyped' }],
    description: 'Distorts light around wearer, granting a 20% miss chance.'
  },
  cloak_of_the_bat: {
    key: 'cloak_of_the_bat',
    name: 'Cloak of the Bat',
    slot: 'shoulders',
    setId: 'wraiths_woe',
    aura: 'Moderate Transmutation',
    effects: [{ type: 'skill', target: 'hide', value: 5, bonusType: 'competence' }],
    description: "Part of Wraith's Woe. Grants +5 competence bonus on Hide checks and flight in darkness."
  },
  cloak_of_the_cat: {
    key: 'cloak_of_the_cat',
    name: 'Cloak of the Cat',
    slot: 'shoulders',
    setId: 'garb_of_the_hunting_cat',
    aura: 'Faint Transmutation',
    effects: [{ type: 'skill', target: 'balance', value: 4, bonusType: 'competence' }],
    description: 'Part of Garb of the Hunting Cat. Grants +4 on Balance and feline reflexes.'
  },

  // === TORSO & BODY ===
  vest_of_resistance_2: {
    key: 'vest_of_resistance_2',
    name: 'Vest of Resistance +2',
    slot: 'torso',
    aura: 'Faint Abjuration',
    effects: [{ type: 'save', target: 'all', value: 2, bonusType: 'resistance' }],
    description: 'Provides a +2 resistance bonus on all saving throws.'
  },
  robe_of_the_archmagi: {
    key: 'robe_of_the_archmagi',
    name: 'Robe of the Archmagi',
    slot: 'body',
    aura: 'Strong Varied',
    effects: [
      { type: 'ac', target: 'armor', value: 5, bonusType: 'armor' },
      { type: 'save', target: 'all', value: 4, bonusType: 'resistance' },
      { type: 'special', target: 'spell_resistance', value: 18, bonusType: 'untyped' },
      { type: 'special', target: 'spell_penetration', value: 2, bonusType: 'enhancement' }
    ],
    description: 'Grants +5 armor bonus to AC, spell resistance 18, +4 resistance on saves, +2 to overcome SR.'
  },

  // === WRISTS ===
  bracers_of_armor_1: {
    key: 'bracers_of_armor_1',
    name: 'Bracers of Armor +1',
    slot: 'wrists',
    aura: 'Moderate Conjuration',
    effects: [{ type: 'ac', target: 'armor', value: 1, bonusType: 'armor' }],
    description: 'Surrounds wearer with invisible force field giving +1 armor bonus to AC.'
  },
  bracers_of_armor_2: {
    key: 'bracers_of_armor_2',
    name: 'Bracers of Armor +2',
    slot: 'wrists',
    aura: 'Moderate Conjuration',
    effects: [{ type: 'ac', target: 'armor', value: 2, bonusType: 'armor' }],
    description: 'Surrounds wearer with invisible force field giving +2 armor bonus to AC.'
  },
  bracers_of_armor_3: {
    key: 'bracers_of_armor_3',
    name: 'Bracers of Armor +3',
    slot: 'wrists',
    aura: 'Moderate Conjuration',
    effects: [{ type: 'ac', target: 'armor', value: 3, bonusType: 'armor' }],
    description: 'Surrounds wearer with invisible force field giving +3 armor bonus to AC.'
  },
  bracers_of_armor_4: {
    key: 'bracers_of_armor_4',
    name: 'Bracers of Armor +4',
    slot: 'wrists',
    aura: 'Moderate Conjuration',
    effects: [{ type: 'ac', target: 'armor', value: 4, bonusType: 'armor' }],
    description: 'Surrounds wearer with invisible force field giving +4 armor bonus to AC.'
  },
  bracers_of_armor_5: {
    key: 'bracers_of_armor_5',
    name: 'Bracers of Armor +5',
    slot: 'wrists',
    aura: 'Moderate Conjuration',
    effects: [{ type: 'ac', target: 'armor', value: 5, bonusType: 'armor' }],
    description: 'Surrounds wearer with invisible force field giving +5 armor bonus to AC.'
  },
  bracers_of_armor_6: {
    key: 'bracers_of_armor_6',
    name: 'Bracers of Armor +6',
    slot: 'wrists',
    aura: 'Moderate Conjuration',
    effects: [{ type: 'ac', target: 'armor', value: 6, bonusType: 'armor' }],
    description: 'Surrounds wearer with invisible force field giving +6 armor bonus to AC.'
  },
  bracers_of_archery_lesser: {
    key: 'bracers_of_archery_lesser',
    name: 'Bracers of Archery (Lesser)',
    slot: 'wrists',
    aura: 'Faint Transmutation',
    effects: [{ type: 'damage', target: 'ranged_atk', value: 1, bonusType: 'competence' }],
    description: 'Grants proficiency with any bow and +1 competence bonus on attack rolls with bows.'
  },

  // === HANDS ===
  gloves_of_dexterity_2: {
    key: 'gloves_of_dexterity_2',
    name: 'Gloves of Dexterity +2',
    slot: 'hands',
    aura: 'Faint Transmutation',
    effects: [{ type: 'attribute', target: 'dex', value: 2, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Dexterity of +2.'
  },
  gloves_of_dexterity_4: {
    key: 'gloves_of_dexterity_4',
    name: 'Gloves of Dexterity +4',
    slot: 'hands',
    aura: 'Moderate Transmutation',
    effects: [{ type: 'attribute', target: 'dex', value: 4, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Dexterity of +4.'
  },
  gloves_of_dexterity_6: {
    key: 'gloves_of_dexterity_6',
    name: 'Gloves of Dexterity +6',
    slot: 'hands',
    aura: 'Strong Transmutation',
    effects: [{ type: 'attribute', target: 'dex', value: 6, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Dexterity of +6.'
  },
  gauntlets_of_ogre_power: {
    key: 'gauntlets_of_ogre_power',
    name: 'Gauntlets of Ogre Power',
    slot: 'hands',
    aura: 'Faint Transmutation',
    effects: [{ type: 'attribute', target: 'str', value: 2, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Strength of +2.'
  },
  gloves_of_the_starry_sky: {
    key: 'gloves_of_the_starry_sky',
    name: 'Gloves of the Starry Sky',
    slot: 'hands',
    setId: 'raiment_of_the_four',
    aura: 'Faint Evocation',
    effects: [{ type: 'skill', target: 'concentration', value: 2, bonusType: 'competence' }],
    description: 'Part of Raiment of the Four. Grants +2 on Concentration checks and light emissions.'
  },
  gauntlets_of_the_panther: {
    key: 'gauntlets_of_the_panther',
    name: 'Gauntlets of the Panther',
    slot: 'hands',
    setId: 'garb_of_the_hunting_cat',
    aura: 'Faint Transmutation',
    effects: [{ type: 'skill', target: 'climb', value: 4, bonusType: 'competence' }],
    description: 'Part of Garb of the Hunting Cat. Grants +4 competence bonus on Climb checks.'
  },

  // === WAIST ===
  belt_of_giant_strength_2: {
    key: 'belt_of_giant_strength_2',
    name: 'Belt of Giant Strength +2',
    slot: 'waist',
    aura: 'Faint Transmutation',
    effects: [{ type: 'attribute', target: 'str', value: 2, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Strength of +2.'
  },
  belt_of_giant_strength_4: {
    key: 'belt_of_giant_strength_4',
    name: 'Belt of Giant Strength +4',
    slot: 'waist',
    aura: 'Moderate Transmutation',
    effects: [{ type: 'attribute', target: 'str', value: 4, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Strength of +4.'
  },
  belt_of_giant_strength_6: {
    key: 'belt_of_giant_strength_6',
    name: 'Belt of Giant Strength +6',
    slot: 'waist',
    aura: 'Strong Transmutation',
    effects: [{ type: 'attribute', target: 'str', value: 6, bonusType: 'enhancement' }],
    description: 'Grants an enhancement bonus to Strength of +6.'
  },
  monks_belt: {
    key: 'monks_belt',
    name: "Monk's Belt",
    slot: 'waist',
    aura: 'Moderate Transmutation',
    effects: [{ type: 'ac', target: 'armor', value: 1, bonusType: 'untyped' }],
    description: 'Grants AC bonus and unarmed damage of a 5th-level monk.'
  },
  belt_of_battle: {
    key: 'belt_of_battle',
    name: 'Belt of Battle',
    slot: 'waist',
    aura: 'Moderate Transmutation',
    effects: [{ type: 'skill', target: 'ini', value: 2, bonusType: 'competence' }],
    charges: { current: 3, max: 3 },
    activation: {
      actionType: 'swift',
      costType: 'charges',
      cost: 1,
      effectDescription: '1 charge = Move action, 2 charges = Standard action, 3 charges = Full-round action.'
    },
    description: '+2 initiative. 3 charges/day: spend charges as swift action for extra action.'
  },

  // === FEET ===
  boots_of_speed: {
    key: 'boots_of_speed',
    name: 'Boots of Speed',
    slot: 'feet',
    aura: 'Moderate Transmutation',
    effects: [],
    dailyUses: { current: 10, max: 10 },
    activation: {
      actionType: 'free',
      costType: 'daily',
      cost: 1,
      effectDescription: 'Activates Haste effect for 1 round (up to 10 rounds/day).',
      appliedBuffKey: 'haste'
    },
    description: 'Free action: click heels for Haste up to 10 rounds/day.'
  },
  boots_of_striding_and_springing: {
    key: 'boots_of_striding_and_springing',
    name: 'Boots of Striding and Springing',
    slot: 'feet',
    aura: 'Faint Transmutation',
    effects: [
      { type: 'speed', target: 'speed', value: 10, bonusType: 'enhancement' },
      { type: 'skill', target: 'jump', value: 5, bonusType: 'competence' }
    ],
    description: '+10 ft. base land speed and +5 competence bonus on Jump checks.'
  },
  boots_of_elvenkind: {
    key: 'boots_of_elvenkind',
    name: 'Boots of Elvenkind',
    slot: 'feet',
    aura: 'Faint Illusion',
    effects: [{ type: 'skill', target: 'move_silently', value: 5, bonusType: 'competence' }],
    description: '+5 competence bonus on Move Silently checks.'
  },
  boots_of_the_big_sky: {
    key: 'boots_of_the_big_sky',
    name: 'Boots of the Big Sky',
    slot: 'feet',
    setId: 'raiment_of_the_four',
    aura: 'Faint Transmutation',
    effects: [{ type: 'skill', target: 'jump', value: 2, bonusType: 'competence' }],
    description: 'Part of Raiment of the Four. Grants +2 on Jump checks.'
  },
  boots_of_the_panther: {
    key: 'boots_of_the_panther',
    name: 'Boots of the Panther',
    slot: 'feet',
    setId: 'garb_of_the_hunting_cat',
    aura: 'Faint Transmutation',
    effects: [{ type: 'skill', target: 'move_silently', value: 3, bonusType: 'competence' }],
    description: 'Part of Garb of the Hunting Cat. Grants +3 competence bonus on Move Silently checks.'
  },

  // === RINGS ===
  ring_of_protection_1: {
    key: 'ring_of_protection_1',
    name: 'Ring of Protection +1',
    slot: 'ring1',
    aura: 'Faint Abjuration',
    effects: [{ type: 'ac', target: 'deflection', value: 1, bonusType: 'deflection' }],
    description: 'Continual +1 deflection bonus to AC.'
  },
  ring_of_protection_2: {
    key: 'ring_of_protection_2',
    name: 'Ring of Protection +2',
    slot: 'ring1',
    aura: 'Faint Abjuration',
    effects: [{ type: 'ac', target: 'deflection', value: 2, bonusType: 'deflection' }],
    description: 'Continual +2 deflection bonus to AC.'
  },
  ring_of_protection_3: {
    key: 'ring_of_protection_3',
    name: 'Ring of Protection +3',
    slot: 'ring1',
    aura: 'Moderate Abjuration',
    effects: [{ type: 'ac', target: 'deflection', value: 3, bonusType: 'deflection' }],
    description: 'Continual +3 deflection bonus to AC.'
  },
  ring_of_protection_4: {
    key: 'ring_of_protection_4',
    name: 'Ring of Protection +4',
    slot: 'ring1',
    aura: 'Moderate Abjuration',
    effects: [{ type: 'ac', target: 'deflection', value: 4, bonusType: 'deflection' }],
    description: 'Continual +4 deflection bonus to AC.'
  },
  ring_of_protection_5: {
    key: 'ring_of_protection_5',
    name: 'Ring of Protection +5',
    slot: 'ring1',
    aura: 'Strong Abjuration',
    effects: [{ type: 'ac', target: 'deflection', value: 5, bonusType: 'deflection' }],
    description: 'Continual +5 deflection bonus to AC.'
  },
  ring_of_sustenance: {
    key: 'ring_of_sustenance',
    name: 'Ring of Sustenance',
    slot: 'ring1',
    aura: 'Faint Conjuration',
    effects: [],
    description: 'Provides continual nourishment; requires only 2 hours of sleep per day.'
  },
  ring_of_invisibility: {
    key: 'ring_of_invisibility',
    name: 'Ring of Invisibility',
    slot: 'ring1',
    aura: 'Faint Illusion',
    effects: [],
    activation: {
      actionType: 'standard',
      costType: 'unlimited',
      cost: 0,
      effectDescription: 'Activates Invisibility on the wearer at will.',
      appliedBuffKey: 'invisibility'
    },
    description: 'Standard action: activates Invisibility as the spell at will.'
  },
  ring_of_dread: {
    key: 'ring_of_dread',
    name: 'Ring of Dread',
    slot: 'ring1',
    setId: 'wraiths_woe',
    aura: 'Faint Necromancy',
    effects: [{ type: 'save', target: 'wil', value: 1, bonusType: 'resistance' }],
    description: "Part of Wraith's Woe. Grants +1 resistance bonus on Will saves."
  },
};
