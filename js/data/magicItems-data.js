/**
 * @module    magicItems-data
 * @summary   Static registry of D&D 3.5e DMG & Magic Item Compendium standard item presets, slots, and categories.
 * @exports   ITEM_SLOTS, MAGIC_ITEMS_REGISTRY
 */

export const ITEM_SLOTS = {
  head: { key: 'head', nameEn: 'Head', nameDe: 'Kopf', icon: '👑', allowedTypes: ['headband', 'helmet', 'hat', 'circlet'] },
  face: { key: 'face', nameEn: 'Face', nameDe: 'Gesicht', icon: '👓', allowedTypes: ['goggles', 'mask', 'lenses'] },
  neck: { key: 'neck', nameEn: 'Neck', nameDe: 'Hals', icon: '📿', allowedTypes: ['amulet', 'periapt', 'necklace', 'medallion', 'collar'] },
  shoulders: { key: 'shoulders', nameEn: 'Shoulders', nameDe: 'Schultern', icon: '🧥', allowedTypes: ['cloak', 'cape', 'mantle'] },
  torso: { key: 'torso', nameEn: 'Torso', nameDe: 'Torso', icon: '🥋', allowedTypes: ['vest', 'shirt', 'vestment'] },
  body: { key: 'body', nameEn: 'Body', nameDe: 'Körper', icon: '👘', allowedTypes: ['robe', 'suit', 'vestments'] },
  wrists: { key: 'wrists', nameEn: 'Wrists', nameDe: 'Handgelenke', icon: '🦾', allowedTypes: ['bracers', 'bracelets'] },
  hands: { key: 'hands', nameEn: 'Hands', nameDe: 'Hände', icon: '🧤', allowedTypes: ['gloves', 'gauntlets'] },
  waist: { key: 'waist', nameEn: 'Waist', nameDe: 'Taille', icon: '🎗️', allowedTypes: ['belt', 'girdle', 'sash'] },
  feet: { key: 'feet', nameEn: 'Feet', nameDe: 'Füße', icon: '🥾', allowedTypes: ['boots', 'shoes', 'slippers'] },
  ring1: { key: 'ring1', nameEn: 'Ring 1', nameDe: 'Ring 1', icon: '💍', allowedTypes: ['ring'] },
  ring2: { key: 'ring2', nameEn: 'Ring 2', nameDe: 'Ring 2', icon: '💍', allowedTypes: ['ring'] },
  slotless: { key: 'slotless', nameEn: 'Slotless / Wondrous', nameDe: 'Tragbar / Wundersam', icon: '🎒', allowedTypes: ['wondrous', 'consumable', 'wand', 'scroll', 'potion'] }
};

export const MAGIC_ITEMS_REGISTRY = {
  // === HEAD ===
  headband_of_intellect_2: {
    key: 'headband_of_intellect_2',
    name: 'Headband of Intellect +2',
    nameDe: 'Stirnreif des Intellekts +2',
    slot: 'head',
    priceGp: 4000,
    aura: 'Faint Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'int', value: 2, bonusType: 'enhancement' }],
    description: 'This headband grants the wearer an enhancement bonus to Intelligence of +2.'
  },
  headband_of_intellect_4: {
    key: 'headband_of_intellect_4',
    name: 'Headband of Intellect +4',
    nameDe: 'Stirnreif des Intellekts +4',
    slot: 'head',
    priceGp: 16000,
    aura: 'Moderate Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'int', value: 4, bonusType: 'enhancement' }],
    description: 'This headband grants the wearer an enhancement bonus to Intelligence of +4.'
  },
  headband_of_intellect_6: {
    key: 'headband_of_intellect_6',
    name: 'Headband of Intellect +6',
    nameDe: 'Stirnreif des Intellekts +6',
    slot: 'head',
    priceGp: 36000,
    aura: 'Strong Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'int', value: 6, bonusType: 'enhancement' }],
    description: 'This headband grants the wearer an enhancement bonus to Intelligence of +6.'
  },
  helm_of_telepathy: {
    key: 'helm_of_telepathy',
    name: 'Helm of Telepathy',
    nameDe: 'Helm der Telepathie',
    slot: 'head',
    priceGp: 27000,
    aura: 'Faint Divination (CL 3rd)',
    effects: [],
    activation: { actionType: 'standard', costType: 'unlimited', cost: 0, effectDescription: 'Detect thoughts at will; send telepathic message.' },
    description: 'The wearer can use detect thoughts as the spell at will. In addition, she can send a telepathic message.'
  },

  // === FACE ===
  goggles_of_night: {
    key: 'goggles_of_night',
    name: 'Goggles of Night',
    nameDe: 'Brille der Nacht',
    slot: 'face',
    priceGp: 12000,
    aura: 'Faint Transmutation (CL 3rd)',
    effects: [{ type: 'special', target: 'darkvision', value: 60, bonusType: 'untyped' }],
    description: 'These spectacles grant the wearer darkvision out to a range of 60 feet.'
  },
  eyes_of_the_eagle: {
    key: 'eyes_of_the_eagle',
    name: 'Eyes of the Eagle',
    nameDe: 'Augen des Adlers',
    slot: 'face',
    priceGp: 2500,
    aura: 'Faint Divination (CL 3rd)',
    effects: [{ type: 'skill', target: 'spot', value: 5, bonusType: 'competence' }],
    description: 'These lenses grant a +5 competence bonus on Spot checks.'
  },

  // === NECK ===
  amulet_of_health_2: {
    key: 'amulet_of_health_2',
    name: 'Amulet of Health +2',
    nameDe: 'Amulett der Gesundheit +2',
    slot: 'neck',
    priceGp: 4000,
    aura: 'Faint Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'con', value: 2, bonusType: 'enhancement' }],
    description: 'This amulet grants the wearer an enhancement bonus to Constitution of +2.'
  },
  amulet_of_health_4: {
    key: 'amulet_of_health_4',
    name: 'Amulet of Health +4',
    nameDe: 'Amulett der Gesundheit +4',
    slot: 'neck',
    priceGp: 16000,
    aura: 'Moderate Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'con', value: 4, bonusType: 'enhancement' }],
    description: 'This amulet grants the wearer an enhancement bonus to Constitution of +4.'
  },
  amulet_of_health_6: {
    key: 'amulet_of_health_6',
    name: 'Amulet of Health +6',
    nameDe: 'Amulett der Gesundheit +6',
    slot: 'neck',
    priceGp: 36000,
    aura: 'Strong Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'con', value: 6, bonusType: 'enhancement' }],
    description: 'This amulet grants the wearer an enhancement bonus to Constitution of +6.'
  },
  amulet_of_natural_armor_1: {
    key: 'amulet_of_natural_armor_1',
    name: 'Amulet of Natural Armor +1',
    nameDe: 'Amulett der natürlichen Rüstung +1',
    slot: 'neck',
    priceGp: 2000,
    aura: 'Faint Transmutation (CL 5th)',
    effects: [{ type: 'ac', target: 'natural', value: 1, bonusType: 'natural_enhancement' }],
    description: 'This amulet enhances the wearer’s existing natural armor by +1.'
  },
  amulet_of_natural_armor_2: {
    key: 'amulet_of_natural_armor_2',
    name: 'Amulet of Natural Armor +2',
    nameDe: 'Amulett der natürlichen Rüstung +2',
    slot: 'neck',
    priceGp: 8000,
    aura: 'Faint Transmutation (CL 5th)',
    effects: [{ type: 'ac', target: 'natural', value: 2, bonusType: 'natural_enhancement' }],
    description: 'This amulet enhances the wearer’s existing natural armor by +2.'
  },
  amulet_of_natural_armor_3: {
    key: 'amulet_of_natural_armor_3',
    name: 'Amulet of Natural Armor +3',
    nameDe: 'Amulett der natürlichen Rüstung +3',
    slot: 'neck',
    priceGp: 18000,
    aura: 'Moderate Transmutation (CL 5th)',
    effects: [{ type: 'ac', target: 'natural', value: 3, bonusType: 'natural_enhancement' }],
    description: 'This amulet enhances the wearer’s existing natural armor by +3.'
  },
  periapt_of_wisdom_2: {
    key: 'periapt_of_wisdom_2',
    name: 'Periapt of Wisdom +2',
    nameDe: 'Amulett der Weisheit +2',
    slot: 'neck',
    priceGp: 4000,
    aura: 'Faint Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'wis', value: 2, bonusType: 'enhancement' }],
    description: 'This periapt grants an enhancement bonus to Wisdom of +2.'
  },
  periapt_of_wisdom_4: {
    key: 'periapt_of_wisdom_4',
    name: 'Periapt of Wisdom +4',
    nameDe: 'Amulett der Weisheit +4',
    slot: 'neck',
    priceGp: 16000,
    aura: 'Moderate Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'wis', value: 4, bonusType: 'enhancement' }],
    description: 'This periapt grants an enhancement bonus to Wisdom of +4.'
  },

  // === SHOULDERS ===
  cloak_of_resistance_1: {
    key: 'cloak_of_resistance_1',
    name: 'Cloak of Resistance +1',
    nameDe: 'Umhang des Widerstands +1',
    slot: 'shoulders',
    priceGp: 1000,
    aura: 'Faint Abjuration (CL 5th)',
    effects: [{ type: 'save', target: 'all', value: 1, bonusType: 'resistance' }],
    description: 'This cloak offers magic protection in the form of a +1 resistance bonus on all saving throws.'
  },
  cloak_of_resistance_2: {
    key: 'cloak_of_resistance_2',
    name: 'Cloak of Resistance +2',
    nameDe: 'Umhang des Widerstands +2',
    slot: 'shoulders',
    priceGp: 4000,
    aura: 'Faint Abjuration (CL 5th)',
    effects: [{ type: 'save', target: 'all', value: 2, bonusType: 'resistance' }],
    description: 'This cloak offers magic protection in the form of a +2 resistance bonus on all saving throws.'
  },
  cloak_of_resistance_3: {
    key: 'cloak_of_resistance_3',
    name: 'Cloak of Resistance +3',
    nameDe: 'Umhang des Widerstands +3',
    slot: 'shoulders',
    priceGp: 9000,
    aura: 'Moderate Abjuration (CL 5th)',
    effects: [{ type: 'save', target: 'all', value: 3, bonusType: 'resistance' }],
    description: 'This cloak offers magic protection in the form of a +3 resistance bonus on all saving throws.'
  },
  cloak_of_resistance_4: {
    key: 'cloak_of_resistance_4',
    name: 'Cloak of Resistance +4',
    nameDe: 'Umhang des Widerstands +4',
    slot: 'shoulders',
    priceGp: 16000,
    aura: 'Moderate Abjuration (CL 5th)',
    effects: [{ type: 'save', target: 'all', value: 4, bonusType: 'resistance' }],
    description: 'This cloak offers magic protection in the form of a +4 resistance bonus on all saving throws.'
  },
  cloak_of_resistance_5: {
    key: 'cloak_of_resistance_5',
    name: 'Cloak of Resistance +5',
    nameDe: 'Umhang des Widerstands +5',
    slot: 'shoulders',
    priceGp: 25000,
    aura: 'Strong Abjuration (CL 5th)',
    effects: [{ type: 'save', target: 'all', value: 5, bonusType: 'resistance' }],
    description: 'This cloak offers magic protection in the form of a +5 resistance bonus on all saving throws.'
  },
  cloak_of_charisma_2: {
    key: 'cloak_of_charisma_2',
    name: 'Cloak of Charisma +2',
    nameDe: 'Umhang des Charismas +2',
    slot: 'shoulders',
    priceGp: 4000,
    aura: 'Faint Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'cha', value: 2, bonusType: 'enhancement' }],
    description: 'This cloak grants the wearer an enhancement bonus to Charisma of +2.'
  },
  cloak_of_charisma_4: {
    key: 'cloak_of_charisma_4',
    name: 'Cloak of Charisma +4',
    nameDe: 'Umhang des Charismas +4',
    slot: 'shoulders',
    priceGp: 16000,
    aura: 'Moderate Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'cha', value: 4, bonusType: 'enhancement' }],
    description: 'This cloak grants the wearer an enhancement bonus to Charisma of +4.'
  },
  cloak_of_displacement_minor: {
    key: 'cloak_of_displacement_minor',
    name: 'Cloak of Displacement (Minor)',
    nameDe: 'Umhang der Verzerrung (schwach)',
    slot: 'shoulders',
    priceGp: 24000,
    aura: 'Faint Illusion (CL 5th)',
    effects: [{ type: 'special', target: 'concealment', value: 20, bonusType: 'untyped' }],
    description: 'This cloak continuously distorts light around the wearer, granting a 20% miss chance due to concealment.'
  },

  // === TORSO & BODY ===
  vest_of_resistance_2: {
    key: 'vest_of_resistance_2',
    name: 'Vest of Resistance +2',
    nameDe: 'Weste des Widerstands +2',
    slot: 'torso',
    priceGp: 4000,
    aura: 'Faint Abjuration (CL 5th)',
    effects: [{ type: 'save', target: 'all', value: 2, bonusType: 'resistance' }],
    description: 'A finely woven vest providing a +2 resistance bonus on all saving throws.'
  },
  robe_of_the_archmagi: {
    key: 'robe_of_the_archmagi',
    name: 'Robe of the Archmagi',
    nameDe: 'Gewand des Erzmagiers',
    slot: 'body',
    priceGp: 75000,
    aura: 'Strong Varied (CL 14th)',
    effects: [
      { type: 'ac', target: 'armor', value: 5, bonusType: 'armor' },
      { type: 'save', target: 'all', value: 4, bonusType: 'resistance' },
      { type: 'special', target: 'spell_resistance', value: 18, bonusType: 'untyped' },
      { type: 'special', target: 'spell_penetration', value: 2, bonusType: 'enhancement' }
    ],
    description: 'Grants +5 armor bonus to AC, spell resistance 18, +4 resistance bonus on saves, and +2 enhancement bonus to overcome spell resistance.'
  },

  // === WRISTS ===
  bracers_of_armor_1: {
    key: 'bracers_of_armor_1',
    name: 'Bracers of Armor +1',
    nameDe: 'Armschienen der Rüstung +1',
    slot: 'wrists',
    priceGp: 1000,
    aura: 'Moderate Conjuration (CL 7th)',
    effects: [{ type: 'ac', target: 'armor', value: 1, bonusType: 'armor' }],
    description: 'These bracers surround the wearer with an invisible force field giving +1 armor bonus to AC.'
  },
  bracers_of_armor_2: {
    key: 'bracers_of_armor_2',
    name: 'Bracers of Armor +2',
    nameDe: 'Armschienen der Rüstung +2',
    slot: 'wrists',
    priceGp: 4000,
    aura: 'Moderate Conjuration (CL 7th)',
    effects: [{ type: 'ac', target: 'armor', value: 2, bonusType: 'armor' }],
    description: 'Surrounds the wearer with an invisible force field giving +2 armor bonus to AC.'
  },
  bracers_of_armor_4: {
    key: 'bracers_of_armor_4',
    name: 'Bracers of Armor +4',
    nameDe: 'Armschienen der Rüstung +4',
    slot: 'wrists',
    priceGp: 16000,
    aura: 'Moderate Conjuration (CL 7th)',
    effects: [{ type: 'ac', target: 'armor', value: 4, bonusType: 'armor' }],
    description: 'Surrounds the wearer with an invisible force field giving +4 armor bonus to AC.'
  },
  bracers_of_archery_lesser: {
    key: 'bracers_of_archery_lesser',
    name: 'Bracers of Archery (Lesser)',
    nameDe: 'Armschienen des Bogenschützen (schwach)',
    slot: 'wrists',
    priceGp: 5000,
    aura: 'Faint Transmutation (CL 4th)',
    effects: [{ type: 'damage', target: 'ranged_atk', value: 1, bonusType: 'competence' }],
    description: 'Grants proficiency with any bow and a +1 competence bonus on attack rolls with bows.'
  },

  // === HANDS ===
  gloves_of_dexterity_2: {
    key: 'gloves_of_dexterity_2',
    name: 'Gloves of Dexterity +2',
    nameDe: 'Handschuhe der Geschicklichkeit +2',
    slot: 'hands',
    priceGp: 4000,
    aura: 'Faint Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'dex', value: 2, bonusType: 'enhancement' }],
    description: 'These tight leather gloves grant an enhancement bonus to Dexterity of +2.'
  },
  gloves_of_dexterity_4: {
    key: 'gloves_of_dexterity_4',
    name: 'Gloves of Dexterity +4',
    nameDe: 'Handschuhe der Geschicklichkeit +4',
    slot: 'hands',
    priceGp: 16000,
    aura: 'Moderate Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'dex', value: 4, bonusType: 'enhancement' }],
    description: 'These tight leather gloves grant an enhancement bonus to Dexterity of +4.'
  },
  gauntlets_of_ogre_power: {
    key: 'gauntlets_of_ogre_power',
    name: 'Gauntlets of Ogre Power',
    nameDe: 'Ogerkrafthandschuhe',
    slot: 'hands',
    priceGp: 4000,
    aura: 'Faint Transmutation (CL 6th)',
    effects: [{ type: 'attribute', target: 'str', value: 2, bonusType: 'enhancement' }],
    description: 'These gauntlets grant the wearer an enhancement bonus to Strength of +2.'
  },

  // === WAIST ===
  belt_of_giant_strength_2: {
    key: 'belt_of_giant_strength_2',
    name: 'Belt of Giant Strength +2',
    nameDe: 'Gürtel der Riesenstärke +2',
    slot: 'waist',
    priceGp: 4000,
    aura: 'Faint Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'str', value: 2, bonusType: 'enhancement' }],
    description: 'Grants the wearer an enhancement bonus to Strength of +2.'
  },
  belt_of_giant_strength_4: {
    key: 'belt_of_giant_strength_4',
    name: 'Belt of Giant Strength +4',
    nameDe: 'Gürtel der Riesenstärke +4',
    slot: 'waist',
    priceGp: 16000,
    aura: 'Moderate Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'str', value: 4, bonusType: 'enhancement' }],
    description: 'Grants the wearer an enhancement bonus to Strength of +4.'
  },
  belt_of_giant_strength_6: {
    key: 'belt_of_giant_strength_6',
    name: 'Belt of Giant Strength +6',
    nameDe: 'Gürtel der Riesenstärke +6',
    slot: 'waist',
    priceGp: 36000,
    aura: 'Strong Transmutation (CL 8th)',
    effects: [{ type: 'attribute', target: 'str', value: 6, bonusType: 'enhancement' }],
    description: 'Grants the wearer an enhancement bonus to Strength of +6.'
  },
  monks_belt: {
    key: 'monks_belt',
    name: "Monk's Belt",
    nameDe: 'Mönchsgürtel',
    slot: 'waist',
    priceGp: 13000,
    aura: 'Moderate Transmutation (CL 10th)',
    effects: [{ type: 'ac', target: 'armor', value: 1, bonusType: 'untyped' }],
    description: 'Grants the wearer AC bonus and unarmed damage as a 5th-level monk (or +5 levels if already a monk).'
  },
  belt_of_battle: {
    key: 'belt_of_battle',
    name: 'Belt of Battle',
    nameDe: 'Kampfgürtel (Belt of Battle)',
    slot: 'waist',
    priceGp: 12000,
    aura: 'Moderate Transmutation (CL 8th)',
    effects: [{ type: 'skill', target: 'ini', value: 2, bonusType: 'competence' }],
    charges: { current: 3, max: 3 },
    activation: {
      actionType: 'swift',
      costType: 'charges',
      cost: 1,
      effectDescription: '1 charge = Move action, 2 charges = Standard action, 3 charges = Full-round action.'
    },
    description: 'Grants +2 competence bonus on initiative. Has 3 charges/day: spend charges as a swift action to gain extra move, standard, or full-round action.'
  },

  // === FEET ===
  boots_of_speed: {
    key: 'boots_of_speed',
    name: 'Boots of Speed',
    nameDe: 'Stiefel der Schnelligkeit',
    slot: 'feet',
    priceGp: 12000,
    aura: 'Moderate Transmutation (CL 10th)',
    effects: [],
    dailyUses: { current: 10, max: 10 },
    activation: {
      actionType: 'free',
      costType: 'daily',
      cost: 1,
      effectDescription: 'Activates Haste effect for 1 round (up to 10 rounds per day).',
      appliedBuffKey: 'haste'
    },
    description: 'As a free action, the wearer can click her boot heels together to gain haste for up to 10 rounds each day.'
  },
  boots_of_striding_and_springing: {
    key: 'boots_of_striding_and_springing',
    name: 'Boots of Striding and Springing',
    nameDe: 'Stiefel des Schreckens und Springens',
    slot: 'feet',
    priceGp: 5500,
    aura: 'Faint Transmutation (CL 3rd)',
    effects: [
      { type: 'speed', target: 'speed', value: 10, bonusType: 'enhancement' },
      { type: 'skill', target: 'jump', value: 5, bonusType: 'competence' }
    ],
    description: 'Increases base land speed by +10 feet and grants a +5 competence bonus on Jump checks.'
  },
  boots_of_elvenkind: {
    key: 'boots_of_elvenkind',
    name: 'Boots of Elvenkind',
    nameDe: 'Elfenstiefel',
    slot: 'feet',
    priceGp: 2500,
    aura: 'Faint Illusion (CL 5th)',
    effects: [{ type: 'skill', target: 'move_silently', value: 5, bonusType: 'competence' }],
    description: 'These soft boots grant a +5 competence bonus on Move Silently checks.'
  },

  // === RINGS ===
  ring_of_protection_1: {
    key: 'ring_of_protection_1',
    name: 'Ring of Protection +1',
    nameDe: 'Schutzring +1',
    slot: 'ring1',
    priceGp: 2000,
    aura: 'Faint Abjuration (CL 5th)',
    effects: [{ type: 'ac', target: 'deflection', value: 1, bonusType: 'deflection' }],
    description: 'This ring offers continual magical protection in the form of a +1 deflection bonus to AC.'
  },
  ring_of_protection_2: {
    key: 'ring_of_protection_2',
    name: 'Ring of Protection +2',
    nameDe: 'Schutzring +2',
    slot: 'ring1',
    priceGp: 8000,
    aura: 'Faint Abjuration (CL 5th)',
    effects: [{ type: 'ac', target: 'deflection', value: 2, bonusType: 'deflection' }],
    description: 'Offers continual magical protection in the form of a +2 deflection bonus to AC.'
  },
  ring_of_protection_3: {
    key: 'ring_of_protection_3',
    name: 'Ring of Protection +3',
    nameDe: 'Schutzring +3',
    slot: 'ring1',
    priceGp: 18000,
    aura: 'Moderate Abjuration (CL 5th)',
    effects: [{ type: 'ac', target: 'deflection', value: 3, bonusType: 'deflection' }],
    description: 'Offers continual magical protection in the form of a +3 deflection bonus to AC.'
  },
  ring_of_sustenance: {
    key: 'ring_of_sustenance',
    name: 'Ring of Sustenance',
    nameDe: 'Ring der Ernährung',
    slot: 'ring1',
    priceGp: 2500,
    aura: 'Faint Conjuration (CL 5th)',
    effects: [],
    description: 'Provides the wearer with life-sustaining nourishment and only requires 2 hours of sleep per day.'
  },
  ring_of_invisibility: {
    key: 'ring_of_invisibility',
    name: 'Ring of Invisibility',
    nameDe: 'Unsichtbarkeitsring',
    slot: 'ring1',
    priceGp: 20000,
    aura: 'Faint Illusion (CL 3rd)',
    effects: [],
    activation: {
      actionType: 'standard',
      costType: 'unlimited',
      cost: 0,
      effectDescription: 'Activates Invisibility on the wearer at will.',
      appliedBuffKey: 'invisibility'
    },
    description: 'By activating the ring as a standard action, the wearer can benefit from invisibility, as the spell.'
  },

  // === SLOTLESS / WONDROUS ===
  pearl_of_power_1: {
    key: 'pearl_of_power_1',
    name: 'Pearl of Power (1st Level)',
    nameDe: 'Perle der Macht (Grad 1)',
    slot: 'slotless',
    priceGp: 1000,
    aura: 'Strong Transmutation (CL 17th)',
    effects: [],
    dailyUses: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'daily',
      cost: 1,
      effectDescription: 'Recalls one prepared 1st-level spell that was already cast today.'
    },
    description: 'Enables a prepared spellcaster to recall one 1st-level spell that had been prepared and cast.'
  },
  bag_of_holding_type1: {
    key: 'bag_of_holding_type1',
    name: 'Bag of Holding (Type I)',
    nameDe: 'Nimmervoller Beutel (Typ I)',
    slot: 'slotless',
    priceGp: 2500,
    weightLbs: 15,
    aura: 'Moderate Conjuration (CL 9th)',
    effects: [],
    description: 'A magical bag holding up to 250 lbs or 30 cubic feet while weighing only 15 lbs.'
  },
  potion_cure_light_wounds: {
    key: 'potion_cure_light_wounds',
    name: 'Potion of Cure Light Wounds',
    nameDe: 'Heiltrank (Leichte Wunden)',
    slot: 'slotless',
    priceGp: 50,
    aura: 'Faint Conjuration (CL 1st)',
    effects: [],
    charges: { current: 1, max: 1 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Heals 1d8+1 hit points.'
    },
    description: 'Restores 1d8+1 HP when consumed.'
  },
  wand_of_magic_missile_cl1: {
    key: 'wand_of_magic_missile_cl1',
    name: 'Wand of Magic Missile (CL 1)',
    nameDe: 'Zauberstab: Magisches Geschoss (CL 1)',
    slot: 'slotless',
    priceGp: 750,
    aura: 'Faint Evocation (CL 1st)',
    effects: [],
    charges: { current: 50, max: 50 },
    activation: {
      actionType: 'standard',
      costType: 'charges',
      cost: 1,
      effectDescription: 'Fires 1 magic missile dealing 1d4+1 force damage.'
    },
    description: 'A wooden wand with 50 charges. Casts Magic Missile (1 missile, 1d4+1).'
  }
};
