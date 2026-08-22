/**
 * @module    magicItems-data
 * @summary   Static registry of D&D 3.5e DMG & Magic Item Compendium standard item presets, item sets, and slot definitions.
 * @exports   ITEM_SLOTS, MAGIC_ITEMS_REGISTRY, CONSOLIDATED_COMPENDIUM, MAGIC_ITEM_SETS
 */

export const ITEM_SLOTS = {
  head: { key: 'head', nameEn: 'Head', nameDe: 'Head', icon: '👑', allowedTypes: ['headband', 'helmet', 'hat', 'circlet'] },
  face: { key: 'face', nameEn: 'Face', nameDe: 'Face', icon: '👓', allowedTypes: ['goggles', 'mask', 'lenses'] },
  neck: { key: 'neck', nameEn: 'Neck', nameDe: 'Neck', icon: '📿', allowedTypes: ['amulet', 'periapt', 'necklace', 'medallion', 'collar'] },
  shoulders: { key: 'shoulders', nameEn: 'Shoulders', nameDe: 'Shoulders', icon: '🧥', allowedTypes: ['cloak', 'cape', 'mantle'] },
  torso: { key: 'torso', nameEn: 'Torso', nameDe: 'Torso', icon: '🥋', allowedTypes: ['vest', 'shirt', 'vestment'] },
  body: { key: 'body', nameEn: 'Body', nameDe: 'Body', icon: '👘', allowedTypes: ['robe', 'suit', 'vestments'] },
  wrists: { key: 'wrists', nameEn: 'Wrists', nameDe: 'Wrists', icon: '🦾', allowedTypes: ['bracers', 'bracelets'] },
  hands: { key: 'hands', nameEn: 'Hands', nameDe: 'Hands', icon: '🧤', allowedTypes: ['gloves', 'gauntlets'] },
  waist: { key: 'waist', nameEn: 'Waist', nameDe: 'Waist', icon: '🎗️', allowedTypes: ['belt', 'girdle', 'sash'] },
  feet: { key: 'feet', nameEn: 'Feet', nameDe: 'Feet', icon: '🥾', allowedTypes: ['boots', 'shoes', 'slippers'] },
  ring1: { key: 'ring1', nameEn: 'Ring 1', nameDe: 'Ring 1', icon: '💍', allowedTypes: ['ring'] },
  ring2: { key: 'ring2', nameEn: 'Ring 2', nameDe: 'Ring 2', icon: '💍', allowedTypes: ['ring'] },
  slotless: { key: 'slotless', nameEn: 'Slotless / Wondrous', nameDe: 'Slotless / Wondrous', icon: '🎒', allowedTypes: ['wondrous', 'consumable', 'wand', 'scroll', 'potion'] }
};

export const MAGIC_ITEM_SETS = {
  raiment_of_the_four: {
    id: 'raiment_of_the_four',
    name: 'Raiment of the Four',
    source: 'Magic Item Compendium',
    description: 'A sacred vestment set harnessing the four elemental principles.',
    items: ['gloves_of_the_starry_sky', 'boots_of_the_big_sky', 'goggles_of_the_golden_sun', 'periapt_of_the_sullying_horn'],
    bonuses: [
      {
        requiredPieces: 2,
        description: '+2 Resistance bonus on all saving throws.',
        effects: [{ type: 'save', target: 'all', value: 2, bonusType: 'resistance' }]
      },
      {
        requiredPieces: 3,
        description: '+10 ft. Enhancement bonus to base speed.',
        effects: [{ type: 'speed', target: 'speed', value: 10, bonusType: 'enhancement' }]
      },
      {
        requiredPieces: 4,
        description: '+2 Deflection bonus to AC.',
        effects: [{ type: 'ac', target: 'deflection', value: 2, bonusType: 'deflection' }]
      }
    ]
  },
  wraiths_woe: {
    id: 'wraiths_woe',
    name: "Wraith's Woe",
    source: 'Magic Item Compendium',
    description: 'Forged to battle the incorporeal terrors of the night.',
    items: ['amulet_of_teamwork', 'ring_of_dread', 'cloak_of_the_bat'],
    bonuses: [
      {
        requiredPieces: 2,
        description: '+2 Dodge AC bonus.',
        effects: [{ type: 'ac', target: 'dodge', value: 2, bonusType: 'dodge' }]
      },
      {
        requiredPieces: 3,
        description: '+4 Insight bonus to Initiative.',
        effects: [{ type: 'skill', target: 'ini', value: 4, bonusType: 'insight' }]
      }
    ]
  },
  garb_of_the_hunting_cat: {
    id: 'garb_of_the_hunting_cat',
    name: 'Garb of the Hunting Cat',
    source: 'Magic Item Compendium',
    description: 'Attuned to feline agility and predatory stealth.',
    items: ['boots_of_the_panther', 'cloak_of_the_cat', 'gauntlets_of_the_panther'],
    bonuses: [
      {
        requiredPieces: 2,
        description: '+5 Competence bonus on Move Silently and Hide.',
        effects: [
          { type: 'skill', target: 'move_silently', value: 5, bonusType: 'competence' },
          { type: 'skill', target: 'hide', value: 5, bonusType: 'competence' }
        ]
      },
      {
        requiredPieces: 3,
        description: '+2 Competence bonus on attack rolls.',
        effects: [{ type: 'damage', target: 'ranged_atk', value: 2, bonusType: 'competence' }]
      }
    ]
  }
};

export const MAGIC_ITEMS_REGISTRY = {
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

  // === SLOTLESS / WONDROUS / CONSUMABLES ===
  potion_cure_light_wounds: {
    key: 'potion_cure_light_wounds',
    name: 'Potion of Cure Light Wounds',
    slot: 'slotless',
    aura: 'Faint Conjuration',
    effects: [],
    healingFormula: '1d8+1',
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Restores 1d8+1 hit points when drunk.'
    },
    description: 'Restores 1d8+1 HP when consumed.'
  },
  potion_cure_moderate_wounds: {
    key: 'potion_cure_moderate_wounds',
    name: 'Potion of Cure Moderate Wounds',
    slot: 'slotless',
    aura: 'Faint Conjuration',
    effects: [],
    healingFormula: '2d8+3',
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Restores 2d8+3 hit points when drunk.'
    },
    description: 'Restores 2d8+3 HP when consumed.'
  },
  potion_cure_serious_wounds: {
    key: 'potion_cure_serious_wounds',
    name: 'Potion of Cure Serious Wounds',
    slot: 'slotless',
    aura: 'Moderate Conjuration',
    effects: [],
    healingFormula: '3d8+5',
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Restores 3d8+5 hit points when drunk.'
    },
    description: 'Restores 3d8+5 HP when consumed.'
  },
  potion_cure_critical_wounds: {
    key: 'potion_cure_critical_wounds',
    name: 'Potion of Cure Critical Wounds',
    slot: 'slotless',
    aura: 'Moderate Conjuration',
    effects: [],
    healingFormula: '4d8+7',
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Restores 4d8+7 hit points when drunk.'
    },
    description: 'Restores 4d8+7 HP when consumed.'
  },
  potion_bulls_strength: {
    key: 'potion_bulls_strength',
    name: "Potion of Bull's Strength",
    slot: 'slotless',
    aura: 'Faint Transmutation',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'bulls_strength',
      effectDescription: 'Grants +4 enhancement bonus to Strength for 3 minutes.'
    },
    description: 'Grants +4 STR for 3 minutes when drunk.'
  },
  potion_cats_grace: {
    key: 'potion_cats_grace',
    name: "Potion of Cat's Grace",
    slot: 'slotless',
    aura: 'Faint Transmutation',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'cats_grace',
      effectDescription: 'Grants +4 enhancement bonus to Dexterity for 3 minutes.'
    },
    description: 'Grants +4 DEX for 3 minutes when drunk.'
  },
  potion_bears_endurance: {
    key: 'potion_bears_endurance',
    name: "Potion of Bear's Endurance",
    slot: 'slotless',
    aura: 'Faint Transmutation',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'bears_endurance',
      effectDescription: 'Grants +4 enhancement bonus to Constitution for 3 minutes.'
    },
    description: 'Grants +4 CON for 3 minutes when drunk.'
  },
  potion_foxs_cunning: {
    key: 'potion_foxs_cunning',
    name: "Potion of Fox's Cunning",
    slot: 'slotless',
    aura: 'Faint Transmutation',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'foxs_cunning',
      effectDescription: 'Grants +4 enhancement bonus to Intelligence for 3 minutes.'
    },
    description: 'Grants +4 INT for 3 minutes when drunk.'
  },
  potion_invisibility: {
    key: 'potion_invisibility',
    name: 'Potion of Invisibility',
    slot: 'slotless',
    aura: 'Faint Illusion',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'invisibility',
      effectDescription: 'Grants Invisibility for 3 minutes.'
    },
    description: 'Grants Invisibility for 3 minutes when drunk.'
  },
  potion_mage_armor: {
    key: 'potion_mage_armor',
    name: 'Potion of Mage Armor',
    slot: 'slotless',
    aura: 'Faint Conjuration',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'mage_armor',
      effectDescription: 'Grants +4 armor bonus to AC for 1 hour.'
    },
    description: 'Grants +4 Armor AC for 1 hour when drunk.'
  },
  potion_haste: {
    key: 'potion_haste',
    name: 'Potion of Haste',
    slot: 'slotless',
    aura: 'Faint Transmutation',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'haste',
      effectDescription: 'Grants extra attack, +1 on attack rolls, +1 dodge AC/Reflex, and +30 ft speed for 5 rounds.'
    },
    description: 'Grants Haste for 5 rounds when drunk.'
  },
  potion_fly: {
    key: 'potion_fly',
    name: 'Potion of Fly',
    slot: 'slotless',
    aura: 'Faint Transmutation',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'fly',
      effectDescription: 'Grants fly speed 60 ft (good maneuverability) for 5 minutes.'
    },
    description: 'Grants Fly speed 60 ft for 5 minutes when drunk.'
  },
  potion_shield_of_faith: {
    key: 'potion_shield_of_faith',
    name: 'Potion of Shield of Faith',
    slot: 'slotless',
    aura: 'Faint Abjuration',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'shield_of_faith',
      effectDescription: 'Grants +2 deflection bonus to AC for 1 minute.'
    },
    description: 'Grants +2 Deflection AC for 1 minute when drunk.'
  },
  potion_bless: {
    key: 'potion_bless',
    name: 'Potion of Bless',
    slot: 'slotless',
    aura: 'Faint Enchantment',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'bless',
      effectDescription: 'Grants +1 morale bonus on attack rolls and saves against fear for 1 minute.'
    },
    description: 'Grants +1 Attack and Fear Saves for 1 minute.'
  },
  wand_of_magic_missile_cl1: {
    key: 'wand_of_magic_missile_cl1',
    name: 'Wand of Magic Missile (CL 1)',
    slot: 'slotless',
    aura: 'Faint Evocation',
    effects: [],
    charges: { current: 50, max: 50 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Fires 1 magic missile dealing 1d4+1 force damage.'
    },
    description: '50 charges. Casts Magic Missile (1 missile, 1d4+1 force damage).'
  },
  wand_of_cure_light_wounds: {
    key: 'wand_of_cure_light_wounds',
    name: 'Wand of Cure Light Wounds',
    slot: 'slotless',
    aura: 'Faint Conjuration',
    effects: [],
    healingFormula: '1d8+1',
    charges: { current: 50, max: 50 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Heals 1d8+1 hit points on target.'
    },
    description: '50 charges. Heals 1d8+1 HP per charge.'
  },
  wand_of_fireball_cl5: {
    key: 'wand_of_fireball_cl5',
    name: 'Wand of Fireball (CL 5)',
    slot: 'slotless',
    aura: 'Moderate Evocation',
    effects: [],
    charges: { current: 50, max: 50 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Casts Fireball dealing 5d6 fire damage (DC 14 Reflex half).'
    },
    description: '50 charges. Casts 5d6 Fireball.'
  },
  scroll_of_fireball: {
    key: 'scroll_of_fireball',
    name: 'Scroll of Fireball',
    slot: 'slotless',
    aura: 'Moderate Evocation',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Casts Fireball dealing 5d6 fire damage (DC 14 Reflex half).'
    },
    description: 'Single-use scroll. Casts Fireball (5d6 fire damage).'
  },
  scroll_of_invisibility: {
    key: 'scroll_of_invisibility',
    name: 'Scroll of Invisibility',
    slot: 'slotless',
    aura: 'Faint Illusion',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'invisibility',
      effectDescription: 'Casts Invisibility on reader (or touched creature) for 3 minutes.'
    },
    description: 'Single-use scroll. Casts Invisibility for 3 minutes.'
  },
  scroll_of_shield: {
    key: 'scroll_of_shield',
    name: 'Scroll of Shield',
    slot: 'slotless',
    aura: 'Faint Abjuration',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'shield',
      effectDescription: 'Grants +4 shield bonus to AC and blocks Magic Missile for 1 minute.'
    },
    description: 'Single-use scroll. Casts Shield (+4 Shield AC).'
  },
  scroll_of_mage_armor: {
    key: 'scroll_of_mage_armor',
    name: 'Scroll of Mage Armor',
    slot: 'slotless',
    aura: 'Faint Conjuration',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'mage_armor',
      effectDescription: 'Grants +4 armor bonus to AC for 1 hour.'
    },
    description: 'Single-use scroll. Casts Mage Armor (+4 Armor AC).'
  },
  scroll_of_haste: {
    key: 'scroll_of_haste',
    name: 'Scroll of Haste',
    slot: 'slotless',
    aura: 'Faint Transmutation',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'haste',
      effectDescription: 'Grants extra attack, +1 on attack rolls, +1 dodge AC/Reflex, and +30 ft speed for 5 rounds.'
    },
    description: 'Single-use scroll. Casts Haste (+1 attack/AC/Ref, +30ft speed, extra attack).'
  },
  scroll_of_bulls_strength: {
    key: 'scroll_of_bulls_strength',
    name: "Scroll of Bull's Strength",
    slot: 'slotless',
    aura: 'Faint Transmutation',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'bulls_strength',
      effectDescription: 'Grants +4 enhancement bonus to Strength for 3 minutes.'
    },
    description: "Single-use scroll. Casts Bull's Strength (+4 STR)."
  },
  scroll_of_cats_grace: {
    key: 'scroll_of_cats_grace',
    name: "Scroll of Cat's Grace",
    slot: 'slotless',
    aura: 'Faint Transmutation',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'cats_grace',
      effectDescription: 'Grants +4 enhancement bonus to Dexterity for 3 minutes.'
    },
    description: "Single-use scroll. Casts Cat's Grace (+4 DEX)."
  },
  scroll_of_bless: {
    key: 'scroll_of_bless',
    name: 'Scroll of Bless',
    slot: 'slotless',
    aura: 'Faint Enchantment',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'bless',
      effectDescription: 'Grants +1 morale bonus on attack rolls and saves against fear for 1 minute.'
    },
    description: 'Single-use scroll. Casts Bless (+1 Attack & Fear Saves).'
  },
  scroll_of_mirror_image: {
    key: 'scroll_of_mirror_image',
    name: 'Scroll of Mirror Image',
    slot: 'slotless',
    aura: 'Faint Illusion',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'mirror_image',
      effectDescription: 'Creates 1d4+1 illusory duplicates for 3 minutes.'
    },
    description: 'Single-use scroll. Casts Mirror Image (1d4+1 duplicates).'
  },
  scroll_of_fly: {
    key: 'scroll_of_fly',
    name: 'Scroll of Fly',
    slot: 'slotless',
    aura: 'Faint Transmutation',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      appliedBuffKey: 'fly',
      effectDescription: 'Grants fly speed 60 ft (good maneuverability) for 5 minutes.'
    },
    description: 'Single-use scroll. Casts Fly (speed 60 ft).'
  },
  scroll_of_cure_light_wounds: {
    key: 'scroll_of_cure_light_wounds',
    name: 'Scroll of Cure Light Wounds',
    slot: 'slotless',
    aura: 'Faint Conjuration',
    effects: [],
    healingFormula: '1d8+1',
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Heals 1d8+1 hit points.'
    },
    description: 'Single-use scroll. Restores 1d8+1 HP.'
  },
  scroll_of_cure_moderate_wounds: {
    key: 'scroll_of_cure_moderate_wounds',
    name: 'Scroll of Cure Moderate Wounds',
    slot: 'slotless',
    aura: 'Faint Conjuration',
    effects: [],
    healingFormula: '2d8+3',
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Heals 2d8+3 hit points.'
    },
    description: 'Single-use scroll. Restores 2d8+3 HP.'
  },
  pearl_of_power_1: {
    key: 'pearl_of_power_1',
    name: 'Pearl of Power (1st Level)',
    slot: 'slotless',
    aura: 'Strong Transmutation',
    effects: [],
    dailyUses: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'daily',
      cost: 1,
      effectDescription: 'Recalls 1 prepared 1st-level spell cast today, making it immediately available to cast again.'
    },
    description: 'Wondrous Item (1/Day): Recalls 1 prepared 1st-level spell you already cast today, making it prepared again.'
  },
  bag_of_holding_type1: {
    key: 'bag_of_holding_type1',
    name: 'Bag of Holding (Type I)',
    slot: 'slotless',
    aura: 'Moderate Conjuration',
    effects: [],
    description: 'Holds up to 250 lbs or 30 cu. ft. while weighing only 15 lbs.'
  },
  ioun_stone_dusty_rose: {
    key: 'ioun_stone_dusty_rose',
    name: 'Ioun Stone (Dusty Rose Prism)',
    slot: 'slotless',
    aura: 'Moderate Abjuration',
    effects: [{ type: 'ac', target: 'insight', value: 1, bonusType: 'insight' }],
    description: 'When floating in orbit around your head, grants a +1 insight bonus to Armor Class.'
  },
  stone_of_good_luck: {
    key: 'stone_of_good_luck',
    name: 'Stone of Good Luck (Luckstone)',
    slot: 'slotless',
    aura: 'Moderate Evocation',
    effects: [
      { type: 'save', target: 'all', value: 1, bonusType: 'luck' },
      { type: 'skill', target: 'all', value: 1, bonusType: 'luck' }
    ],
    description: 'Grants a +1 luck bonus on saving throws, ability checks, and skill checks.'
  },
  alchemists_fire: {
    key: 'alchemists_fire',
    name: "Alchemist's Fire",
    slot: 'slotless',
    type: 'consumable',
    damageFormula: '1d6 fire',
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Ranged touch attack dealing 1d6 fire damage, +1d6 fire on the next round.'
    },
    description: 'Flask of alchemical fire. Deals 1d6 direct + 1d6 next round.'
  },
  holy_water: {
    key: 'holy_water',
    name: 'Holy Water',
    slot: 'slotless',
    type: 'consumable',
    damageFormula: '2d4 holy',
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Deals 2d4 holy damage to undead creatures and evil outsiders.'
    },
    description: 'Flask of blessed water dealing 2d4 damage to undead/evil outsiders.'
  },
  smokestick: {
    key: 'smokestick',
    name: 'Smokestick',
    slot: 'slotless',
    type: 'consumable',
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Instantly creates a 10-ft. cube of thick smoke providing concealment.'
    },
    description: 'Alchemical wooden stick. Produces a 10-ft smoke cloud.'
  },
  tanglefoot_bag: {
    key: 'tanglefoot_bag',
    name: 'Tanglefoot Bag',
    slot: 'slotless',
    type: 'consumable',
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Ranged touch attack entangles target creature (DC 15 Reflex).'
    },
    description: 'Bag of tough resin that entangles targets on impact.'
  }
};

/**
 * Consolidated view of magic items for streamlined compendium display.
 * Multi-tier items (e.g. +1..+5) are grouped under a single entry with selectable tiers.
 */
export const CONSOLIDATED_COMPENDIUM = [
  // Head
  {
    id: 'headband_of_intellect',
    baseName: 'Headband of Intellect',
    slot: 'head',
    description: 'Grants an enhancement bonus to Intelligence.',
    variants: [
      { label: '+2', key: 'headband_of_intellect_2' },
      { label: '+4', key: 'headband_of_intellect_4' },
      { label: '+6', key: 'headband_of_intellect_6' }
    ]
  },
  {
    id: 'helm_of_telepathy',
    baseName: 'Helm of Telepathy',
    slot: 'head',
    description: 'Enables wearer to use detect thoughts at will and communicate telepathically.',
    variants: [{ label: 'Standard', key: 'helm_of_telepathy' }]
  },

  // Face
  {
    id: 'goggles_of_night',
    baseName: 'Goggles of Night',
    slot: 'face',
    description: 'Grants darkvision out to 60 feet.',
    variants: [{ label: 'Standard', key: 'goggles_of_night' }]
  },
  {
    id: 'eyes_of_the_eagle',
    baseName: 'Eyes of the Eagle',
    slot: 'face',
    description: 'Grants a +5 competence bonus on Spot checks.',
    variants: [{ label: 'Standard', key: 'eyes_of_the_eagle' }]
  },
  {
    id: 'goggles_of_the_golden_sun',
    baseName: 'Goggles of the Golden Sun',
    slot: 'face',
    description: 'Part of Raiment of the Four. Grants +2 on Spot checks.',
    variants: [{ label: 'Set Piece', key: 'goggles_of_the_golden_sun' }]
  },

  // Neck
  {
    id: 'amulet_of_health',
    baseName: 'Amulet of Health',
    slot: 'neck',
    description: 'Grants an enhancement bonus to Constitution.',
    variants: [
      { label: '+2', key: 'amulet_of_health_2' },
      { label: '+4', key: 'amulet_of_health_4' },
      { label: '+6', key: 'amulet_of_health_6' }
    ]
  },
  {
    id: 'amulet_of_natural_armor',
    baseName: 'Amulet of Natural Armor',
    slot: 'neck',
    description: 'Enhances existing natural armor.',
    variants: [
      { label: '+1', key: 'amulet_of_natural_armor_1' },
      { label: '+2', key: 'amulet_of_natural_armor_2' },
      { label: '+3', key: 'amulet_of_natural_armor_3' },
      { label: '+4', key: 'amulet_of_natural_armor_4' },
      { label: '+5', key: 'amulet_of_natural_armor_5' }
    ]
  },
  {
    id: 'periapt_of_wisdom',
    baseName: 'Periapt of Wisdom',
    slot: 'neck',
    description: 'Grants an enhancement bonus to Wisdom.',
    variants: [
      { label: '+2', key: 'periapt_of_wisdom_2' },
      { label: '+4', key: 'periapt_of_wisdom_4' },
      { label: '+6', key: 'periapt_of_wisdom_6' }
    ]
  },
  {
    id: 'periapt_of_the_sullying_horn',
    baseName: 'Periapt of the Sullying Horn',
    slot: 'neck',
    description: 'Part of Raiment of the Four. Grants +1 on Fortitude saves.',
    variants: [{ label: 'Set Piece', key: 'periapt_of_the_sullying_horn' }]
  },
  {
    id: 'amulet_of_teamwork',
    baseName: 'Amulet of Teamwork',
    slot: 'neck',
    description: "Part of Wraith's Woe. Grants +1 damage when flanking.",
    variants: [{ label: 'Set Piece', key: 'amulet_of_teamwork' }]
  },

  // Shoulders
  {
    id: 'cloak_of_resistance',
    baseName: 'Cloak of Resistance',
    slot: 'shoulders',
    description: 'Offers resistance bonus on all saving throws.',
    variants: [
      { label: '+1', key: 'cloak_of_resistance_1' },
      { label: '+2', key: 'cloak_of_resistance_2' },
      { label: '+3', key: 'cloak_of_resistance_3' },
      { label: '+4', key: 'cloak_of_resistance_4' },
      { label: '+5', key: 'cloak_of_resistance_5' }
    ]
  },
  {
    id: 'cloak_of_charisma',
    baseName: 'Cloak of Charisma',
    slot: 'shoulders',
    description: 'Grants an enhancement bonus to Charisma.',
    variants: [
      { label: '+2', key: 'cloak_of_charisma_2' },
      { label: '+4', key: 'cloak_of_charisma_4' },
      { label: '+6', key: 'cloak_of_charisma_6' }
    ]
  },
  {
    id: 'cloak_of_displacement_minor',
    baseName: 'Cloak of Displacement (Minor)',
    slot: 'shoulders',
    description: 'Distorts light around wearer, granting a 20% miss chance.',
    variants: [{ label: 'Standard', key: 'cloak_of_displacement_minor' }]
  },
  {
    id: 'cloak_of_the_bat',
    baseName: 'Cloak of the Bat',
    slot: 'shoulders',
    description: "Part of Wraith's Woe. Grants +5 on Hide checks and flight.",
    variants: [{ label: 'Set Piece', key: 'cloak_of_the_bat' }]
  },
  {
    id: 'cloak_of_the_cat',
    baseName: 'Cloak of the Cat',
    slot: 'shoulders',
    description: 'Part of Garb of the Hunting Cat. Grants +4 on Balance.',
    variants: [{ label: 'Set Piece', key: 'cloak_of_the_cat' }]
  },

  // Torso & Body
  {
    id: 'vest_of_resistance',
    baseName: 'Vest of Resistance',
    slot: 'torso',
    description: 'Provides a resistance bonus on all saving throws.',
    variants: [{ label: '+2', key: 'vest_of_resistance_2' }]
  },
  {
    id: 'robe_of_the_archmagi',
    baseName: 'Robe of the Archmagi',
    slot: 'body',
    description: 'Grants +5 armor bonus to AC, spell resistance 18, +4 resistance on saves, +2 to overcome SR.',
    variants: [{ label: 'Standard', key: 'robe_of_the_archmagi' }]
  },

  // Wrists
  {
    id: 'bracers_of_armor',
    baseName: 'Bracers of Armor',
    slot: 'wrists',
    description: 'Surrounds wearer with invisible force field giving armor bonus to AC.',
    variants: [
      { label: '+1', key: 'bracers_of_armor_1' },
      { label: '+2', key: 'bracers_of_armor_2' },
      { label: '+3', key: 'bracers_of_armor_3' },
      { label: '+4', key: 'bracers_of_armor_4' },
      { label: '+5', key: 'bracers_of_armor_5' },
      { label: '+6', key: 'bracers_of_armor_6' }
    ]
  },
  {
    id: 'bracers_of_archery_lesser',
    baseName: 'Bracers of Archery (Lesser)',
    slot: 'wrists',
    description: 'Grants bow proficiency and +1 competence bonus on ranged attack rolls.',
    variants: [{ label: 'Standard', key: 'bracers_of_archery_lesser' }]
  },

  // Hands
  {
    id: 'gloves_of_dexterity',
    baseName: 'Gloves of Dexterity',
    slot: 'hands',
    description: 'Grants an enhancement bonus to Dexterity.',
    variants: [
      { label: '+2', key: 'gloves_of_dexterity_2' },
      { label: '+4', key: 'gloves_of_dexterity_4' },
      { label: '+6', key: 'gloves_of_dexterity_6' }
    ]
  },
  {
    id: 'gauntlets_of_ogre_power',
    baseName: 'Gauntlets of Ogre Power',
    slot: 'hands',
    description: 'Grants an enhancement bonus to Strength of +2.',
    variants: [{ label: '+2 STR', key: 'gauntlets_of_ogre_power' }]
  },
  {
    id: 'gloves_of_the_starry_sky',
    baseName: 'Gloves of the Starry Sky',
    slot: 'hands',
    description: 'Part of Raiment of the Four. Grants +2 Concentration.',
    variants: [{ label: 'Set Piece', key: 'gloves_of_the_starry_sky' }]
  },
  {
    id: 'gauntlets_of_the_panther',
    baseName: 'Gauntlets of the Panther',
    slot: 'hands',
    description: 'Part of Garb of the Hunting Cat. Grants +4 on Climb.',
    variants: [{ label: 'Set Piece', key: 'gauntlets_of_the_panther' }]
  },

  // Waist
  {
    id: 'belt_of_giant_strength',
    baseName: 'Belt of Giant Strength',
    slot: 'waist',
    description: 'Grants an enhancement bonus to Strength.',
    variants: [
      { label: '+2', key: 'belt_of_giant_strength_2' },
      { label: '+4', key: 'belt_of_giant_strength_4' },
      { label: '+6', key: 'belt_of_giant_strength_6' }
    ]
  },
  {
    id: 'monks_belt',
    baseName: "Monk's Belt",
    slot: 'waist',
    description: 'Grants AC bonus and unarmed damage of a 5th-level monk.',
    variants: [{ label: 'Standard', key: 'monks_belt' }]
  },
  {
    id: 'belt_of_battle',
    baseName: 'Belt of Battle',
    slot: 'waist',
    description: '+2 initiative. 3 charges/day: spend charges as swift action for extra action.',
    variants: [{ label: 'Standard', key: 'belt_of_battle' }]
  },

  // Feet
  {
    id: 'boots_of_speed',
    baseName: 'Boots of Speed',
    slot: 'feet',
    description: 'Free action: click heels for Haste up to 10 rounds/day.',
    variants: [{ label: 'Standard', key: 'boots_of_speed' }]
  },
  {
    id: 'boots_of_striding_and_springing',
    baseName: 'Boots of Striding and Springing',
    slot: 'feet',
    description: '+10 ft. base speed and +5 competence bonus on Jump checks.',
    variants: [{ label: 'Standard', key: 'boots_of_striding_and_springing' }]
  },
  {
    id: 'boots_of_elvenkind',
    baseName: 'Boots of Elvenkind',
    slot: 'feet',
    description: '+5 competence bonus on Move Silently checks.',
    variants: [{ label: 'Standard', key: 'boots_of_elvenkind' }]
  },
  {
    id: 'boots_of_the_big_sky',
    baseName: 'Boots of the Big Sky',
    slot: 'feet',
    description: 'Part of Raiment of the Four. Grants +2 on Jump.',
    variants: [{ label: 'Set Piece', key: 'boots_of_the_big_sky' }]
  },
  {
    id: 'boots_of_the_panther',
    baseName: 'Boots of the Panther',
    slot: 'feet',
    description: 'Part of Garb of the Hunting Cat. Grants +3 Move Silently.',
    variants: [{ label: 'Set Piece', key: 'boots_of_the_panther' }]
  },

  // Rings
  {
    id: 'ring_of_protection',
    baseName: 'Ring of Protection',
    slot: 'ring1',
    description: 'Continual deflection bonus to AC.',
    variants: [
      { label: '+1', key: 'ring_of_protection_1' },
      { label: '+2', key: 'ring_of_protection_2' },
      { label: '+3', key: 'ring_of_protection_3' },
      { label: '+4', key: 'ring_of_protection_4' },
      { label: '+5', key: 'ring_of_protection_5' }
    ]
  },
  {
    id: 'ring_of_sustenance',
    baseName: 'Ring of Sustenance',
    slot: 'ring1',
    description: 'Provides nourishment; requires only 2 hours of sleep per day.',
    variants: [{ label: 'Standard', key: 'ring_of_sustenance' }]
  },
  {
    id: 'ring_of_invisibility',
    baseName: 'Ring of Invisibility',
    slot: 'ring1',
    description: 'Standard action: activates Invisibility as the spell at will.',
    variants: [{ label: 'Standard', key: 'ring_of_invisibility' }]
  },
  {
    id: 'ring_of_dread',
    baseName: 'Ring of Dread',
    slot: 'ring1',
    description: "Part of Wraith's Woe. Grants +1 on Will saves.",
    variants: [{ label: 'Set Piece', key: 'ring_of_dread' }]
  },

  // === POTIONS & CONSUMABLES ===
  {
    id: 'potion_cure_wounds',
    baseName: 'Potion of Cure Wounds',
    slot: 'slotless',
    description: 'Restores hit points when drunk.',
    variants: [
      { label: 'Light (1d8+1)', key: 'potion_cure_light_wounds' },
      { label: 'Moderate (2d8+3)', key: 'potion_cure_moderate_wounds' },
      { label: 'Serious (3d8+5)', key: 'potion_cure_serious_wounds' },
      { label: 'Critical (4d8+7)', key: 'potion_cure_critical_wounds' }
    ]
  },
  {
    id: 'potion_bulls_strength',
    baseName: "Potion of Bull's Strength",
    slot: 'slotless',
    description: 'Grants +4 enhancement bonus to Strength for 3 minutes.',
    variants: [{ label: '+4 STR', key: 'potion_bulls_strength' }]
  },
  {
    id: 'potion_cats_grace',
    baseName: "Potion of Cat's Grace",
    slot: 'slotless',
    description: 'Grants +4 enhancement bonus to Dexterity for 3 minutes.',
    variants: [{ label: '+4 DEX', key: 'potion_cats_grace' }]
  },
  {
    id: 'potion_bears_endurance',
    baseName: "Potion of Bear's Endurance",
    slot: 'slotless',
    description: 'Grants +4 enhancement bonus to Constitution for 3 minutes.',
    variants: [{ label: '+4 CON', key: 'potion_bears_endurance' }]
  },
  {
    id: 'potion_foxs_cunning',
    baseName: "Potion of Fox's Cunning",
    slot: 'slotless',
    description: 'Grants +4 enhancement bonus to Intelligence for 3 minutes.',
    variants: [{ label: '+4 INT', key: 'potion_foxs_cunning' }]
  },
  {
    id: 'potion_invisibility',
    baseName: 'Potion of Invisibility',
    slot: 'slotless',
    description: 'Grants Invisibility for 3 minutes when consumed.',
    variants: [{ label: 'Invisibility', key: 'potion_invisibility' }]
  },
  {
    id: 'potion_mage_armor',
    baseName: 'Potion of Mage Armor',
    slot: 'slotless',
    description: 'Grants +4 armor bonus to AC for 1 hour.',
    variants: [{ label: '+4 AC', key: 'potion_mage_armor' }]
  },
  {
    id: 'potion_haste',
    baseName: 'Potion of Haste',
    slot: 'slotless',
    description: 'Grants extra attack, +1 on attack rolls, +1 dodge AC/Reflex, and +30 ft speed for 5 rounds.',
    variants: [{ label: 'Haste', key: 'potion_haste' }]
  },
  {
    id: 'potion_fly',
    baseName: 'Potion of Fly',
    slot: 'slotless',
    description: 'Grants fly speed 60 ft (good maneuverability) for 5 minutes.',
    variants: [{ label: 'Fly (60 ft)', key: 'potion_fly' }]
  },
  {
    id: 'potion_shield_of_faith',
    baseName: 'Potion of Shield of Faith',
    slot: 'slotless',
    description: 'Grants +2 deflection bonus to AC for 1 minute.',
    variants: [{ label: '+2 AC', key: 'potion_shield_of_faith' }]
  },
  {
    id: 'potion_bless',
    baseName: 'Potion of Bless',
    slot: 'slotless',
    description: 'Grants +1 morale bonus on attack rolls and fear saves for 1 minute.',
    variants: [{ label: '+1 Bless', key: 'potion_bless' }]
  },

  // === SCROLLS ===
  {
    id: 'scroll_cure_wounds',
    baseName: 'Scroll of Cure Wounds',
    slot: 'slotless',
    description: 'Single-use spell scrolls for restoring hit points.',
    variants: [
      { label: 'Light (1d8+1)', key: 'scroll_of_cure_light_wounds' },
      { label: 'Moderate (2d8+3)', key: 'scroll_of_cure_moderate_wounds' }
    ]
  },
  {
    id: 'scroll_of_invisibility',
    baseName: 'Scroll of Invisibility',
    slot: 'slotless',
    description: 'Single-use scroll. Casts Invisibility for 3 minutes.',
    variants: [{ label: 'Invisibility', key: 'scroll_of_invisibility' }]
  },
  {
    id: 'scroll_of_shield',
    baseName: 'Scroll of Shield',
    slot: 'slotless',
    description: 'Single-use scroll. Casts Shield (+4 Shield AC, negates Magic Missile).',
    variants: [{ label: '+4 AC', key: 'scroll_of_shield' }]
  },
  {
    id: 'scroll_of_mage_armor',
    baseName: 'Scroll of Mage Armor',
    slot: 'slotless',
    description: 'Single-use scroll. Casts Mage Armor (+4 Armor AC for 1 hour).',
    variants: [{ label: '+4 AC', key: 'scroll_of_mage_armor' }]
  },
  {
    id: 'scroll_of_haste',
    baseName: 'Scroll of Haste',
    slot: 'slotless',
    description: 'Single-use scroll. Casts Haste (+1 attack/AC/Ref, +30ft speed, extra attack).',
    variants: [{ label: 'Haste', key: 'scroll_of_haste' }]
  },
  {
    id: 'scroll_of_bulls_strength',
    baseName: "Scroll of Bull's Strength",
    slot: 'slotless',
    description: "Single-use scroll. Casts Bull's Strength (+4 STR for 3 minutes).",
    variants: [{ label: '+4 STR', key: 'scroll_of_bulls_strength' }]
  },
  {
    id: 'scroll_of_cats_grace',
    baseName: "Scroll of Cat's Grace",
    slot: 'slotless',
    description: "Single-use scroll. Casts Cat's Grace (+4 DEX for 3 minutes).",
    variants: [{ label: '+4 DEX', key: 'scroll_of_cats_grace' }]
  },
  {
    id: 'scroll_of_bless',
    baseName: 'Scroll of Bless',
    slot: 'slotless',
    description: 'Single-use scroll. Casts Bless (+1 Attack & Fear Saves for allies).',
    variants: [{ label: 'Bless', key: 'scroll_of_bless' }]
  },
  {
    id: 'scroll_of_mirror_image',
    baseName: 'Scroll of Mirror Image',
    slot: 'slotless',
    description: 'Single-use scroll. Casts Mirror Image (creates 1d4+1 illusory duplicates).',
    variants: [{ label: 'Mirror Image', key: 'scroll_of_mirror_image' }]
  },
  {
    id: 'scroll_of_fly',
    baseName: 'Scroll of Fly',
    slot: 'slotless',
    description: 'Single-use scroll. Casts Fly (speed 60 ft for 5 minutes).',
    variants: [{ label: 'Fly', key: 'scroll_of_fly' }]
  },
  {
    id: 'scroll_of_fireball',
    baseName: 'Scroll of Fireball',
    slot: 'slotless',
    description: 'Single-use scroll. Casts Fireball (5d6 fire damage, DC 14 Reflex half).',
    variants: [{ label: '5d6 Fire', key: 'scroll_of_fireball' }]
  },

  // === WANDS ===
  {
    id: 'wand_of_magic_missile',
    baseName: 'Wand of Magic Missile (CL 1)',
    slot: 'slotless',
    description: '50 charges. Fires 1 magic missile dealing 1d4+1 force damage.',
    variants: [{ label: 'CL 1', key: 'wand_of_magic_missile_cl1' }]
  },
  {
    id: 'wand_of_cure_light_wounds',
    baseName: 'Wand of Cure Light Wounds',
    slot: 'slotless',
    description: '50 charges. Heals 1d8+1 hit points per charge.',
    variants: [{ label: '50 Charges', key: 'wand_of_cure_light_wounds' }]
  },
  {
    id: 'wand_of_fireball',
    baseName: 'Wand of Fireball (CL 5)',
    slot: 'slotless',
    description: '50 charges. Casts 5d6 Fireball (DC 14 Reflex half).',
    variants: [{ label: 'CL 5', key: 'wand_of_fireball_cl5' }]
  },

  // === ALCHEMICAL & ADVENTURING ===
  {
    id: 'alchemists_fire',
    baseName: "Alchemist's Fire",
    slot: 'slotless',
    description: 'Deals 1d6 fire damage on direct hit + 1d6 the following round.',
    variants: [{ label: 'Flask', key: 'alchemists_fire' }]
  },
  {
    id: 'holy_water',
    baseName: 'Holy Water',
    slot: 'slotless',
    description: 'Deals 2d4 holy damage to undead creatures and evil outsiders.',
    variants: [{ label: 'Flask', key: 'holy_water' }]
  },
  {
    id: 'smokestick',
    baseName: 'Smokestick',
    slot: 'slotless',
    description: 'Creates a 10-ft cube of thick smoke providing concealment.',
    variants: [{ label: 'Stick', key: 'smokestick' }]
  },
  {
    id: 'tanglefoot_bag',
    baseName: 'Tanglefoot Bag',
    slot: 'slotless',
    description: 'Entangles target creature on a successful ranged touch attack (DC 15 Reflex).',
    variants: [{ label: 'Bag', key: 'tanglefoot_bag' }]
  },

  // === WONDROUS SLOTLESS ===
  {
    id: 'pearl_of_power',
    baseName: 'Pearl of Power (1st Level)',
    slot: 'slotless',
    description: 'Recalls one prepared and cast 1st-level spell.',
    variants: [{ label: '1st Level', key: 'pearl_of_power_1' }]
  },
  {
    id: 'bag_of_holding',
    baseName: 'Bag of Holding (Type I)',
    slot: 'slotless',
    description: 'Holds up to 250 lbs or 30 cu. ft. while weighing only 15 lbs.',
    variants: [{ label: 'Type I', key: 'bag_of_holding_type1' }]
  },
  {
    id: 'ioun_stone_dusty_rose',
    baseName: 'Ioun Stone (Dusty Rose Prism)',
    slot: 'slotless',
    description: 'Grants a +1 insight bonus to Armor Class when active.',
    variants: [{ label: '+1 AC', key: 'ioun_stone_dusty_rose' }]
  },
  {
    id: 'stone_of_good_luck',
    baseName: 'Stone of Good Luck (Luckstone)',
    slot: 'slotless',
    description: 'Grants a +1 luck bonus on saving throws and skill checks.',
    variants: [{ label: '+1 Luck', key: 'stone_of_good_luck' }]
  }
];
