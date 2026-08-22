/**
 * @module    encounter-samples
 * @summary   Static registries of D&D 3.5e character templates for testing and sample seeding.
 * @exports   aranisSample, morgwenSample, thordakSample, lysaraSample, wizardLvl10Sample, rangerLvl10Sample, paladinLvl10Sample, arcaneTricksterLvl11Sample
 */

export const aranisSample = {
  name: 'Aranis Silberklinge',
  init: 6,
  hp: 34,
  maxHP: 34,
  ac: 19,
  acTouch: 12,
  acFlat: 17,
  bw: 30,
  za: 4,
  ref: 3,
  wil: 2,
  type: 'p',
  str: 16,
  dex: 14,
  con: 12,
  wis: 12,
  cha: 14,
  baseZa: 3,
  baseRef: 1,
  baseWil: 1,
  iniMisc: 4,
  bab: 3,
  classType: 'paladin',
  level: 3,
  classes: [{ classType: 'paladin', level: 3 }],
  autoAC: true,
  weapons: [
    { name: 'Meisterwerk-Langschwert +1', type: 'longsword', attackBonus: '', damageDice: '1w8', crit: '19-20 / x2', grip: '1h', enhancement: 1, isEquipped: true, hand: 'main' },
    { name: 'Langbogen', type: 'longbow', attackBonus: '', damageDice: '1w8', crit: 'x3', grip: 'rng', enhancement: 0, isEquipped: false }
  ],
  armors: [
    { name: 'Brustpanzer', type: 'breastplate', enhancement: 0, isEquipped: true },
    { name: 'Schwerer Stahlschild', type: 'shield_heavy_steel', enhancement: 0, isEquipped: true, isShield: true }
  ],
  items: [
    {
      name: 'Schutzring +1',
      slot: 'ring1',
      isEquipped: true,
      effects: [{ type: 'ac', target: 'deflection', value: 1, bonusType: 'deflection' }]
    },
    {
      name: 'Potion of Cure Moderate Wounds',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 2,
      healingFormula: '2d8+3',
      description: 'Heals 2d8+3 hit points upon drinking.'
    },
    {
      name: "Potion of Bull's Strength",
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'bulls_strength', effectDescription: '+4 Enhancement bonus to Strength for 3 minutes' }
    },
    {
      name: 'Potion of Shield of Faith +2',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'shield_of_faith', effectDescription: '+2 Deflection bonus to AC for 1 minute' }
    },
    {
      name: 'Holy Water',
      slot: 'slotless',
      type: 'consumable',
      isEquipped: false,
      quantity: 2,
      damageFormula: '2d4',
      activation: { action: 'standard', effectDescription: '2d4 Holy damage to undead/evil outsiders' }
    },
    {
      name: 'Potion of Protection from Evil',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'protection_from_evil', effectDescription: '+2 Resistance saves & +2 Deflection AC vs Evil' }
    },
    {
      name: "Alchemist's Fire",
      slot: 'slotless',
      type: 'consumable',
      isEquipped: false,
      quantity: 2,
      damageFormula: '1d6',
      activation: { action: 'standard', effectDescription: '1d6 Fire damage on direct hit' }
    }
  ],
  feats: [
    { id: 'power_attack', option: '' },
    { id: 'weapon_focus', option: 'Longsword' }
  ],
  spellSlots: {
    1: { max: 1, used: 0 }
  },
  dailyAbilities: [
    { name: 'Hände auflegen', max: 6, used: 0 },
    { name: 'Böses niederstrecken', max: 1, used: 0 }
  ]
};

export const morgwenSample = {
  name: 'Morgwen Hüterin',
  init: 0,
  hp: 24,
  maxHP: 24,
  ac: 17,
  acTouch: 10,
  acFlat: 17,
  bw: 30,
  za: 5,
  ref: 0,
  wil: 6,
  type: 'p',
  str: 12,
  dex: 10,
  con: 14,
  wis: 16,
  cha: 14,
  baseZa: 3,
  baseRef: 0,
  baseWil: 3,
  iniMisc: 0,
  bab: 2,
  classType: 'cleric',
  level: 3,
  classes: [{ classType: 'cleric', level: 3 }],
  autoAC: true,
  weapons: [
    { name: 'Streitkolben +1', type: 'heavy_mace', attackBonus: '', damageDice: '1w8', crit: 'x2', grip: '1h', enhancement: 1, isEquipped: true, hand: 'main' }
  ],
  armors: [
    { name: 'Schuppenpanzer', type: 'scale_mail', enhancement: 0, isEquipped: true },
    { name: 'Schwerer Holzschild', type: 'shield_heavy_wooden', enhancement: 0, isEquipped: true, isShield: true }
  ],
  items: [
    {
      name: 'Amulett der Weisheit +2',
      slot: 'neck',
      isEquipped: true,
      effects: [{ type: 'attribute', target: 'wis', value: 2, bonusType: 'enhancement' }]
    },
    {
      name: 'Potion of Cure Serious Wounds',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      healingFormula: '3d8+5',
      description: 'Heals 3d8+5 hit points.'
    },
    {
      name: 'Potion of Barkskin +2',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'barkskin', effectDescription: '+2 Enhancement to Natural Armor AC for 20 minutes' }
    },
    {
      name: 'Scroll of Searing Light',
      slot: 'slotless',
      type: 'scroll',
      isEquipped: false,
      quantity: 1,
      damageFormula: '3d8',
      activation: { action: 'standard', effectDescription: '3d8 Divine Ray damage (6d6 vs undead)' }
    },
    {
      name: 'Potion of Sanctuary',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', effectDescription: 'Sanctuary DC 13 for 3 rounds' }
    },
    {
      name: 'Holy Water',
      slot: 'slotless',
      type: 'consumable',
      isEquipped: false,
      quantity: 3,
      damageFormula: '2d4',
      activation: { action: 'standard', effectDescription: '2d4 Holy damage to undead/evil outsiders' }
    },
    {
      name: 'Potion of Lesser Restoration',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', effectDescription: 'Dispels magical ability penalties / restores 1d4 ability damage' }
    }
  ],
  feats: [
    { id: 'extra_turning', option: '' },
    { id: 'combat_casting', option: '' }
  ],
  spellSlots: {
    1: { max: 3, used: 1 },
    2: { max: 2, used: 0 }
  },
  dailyAbilities: [
    { name: 'Turn Undead', max: 7, used: 0 }
  ]
};

export const thordakSample = {
  name: 'Thordak Eisenfaust',
  init: 1,
  hp: 52,
  maxHP: 52,
  ac: 19,
  acTouch: 11,
  acFlat: 18,
  bw: 30,
  za: 8,
  ref: 2,
  wil: 2,
  type: 'p',
  str: 18,
  dex: 12,
  con: 16,
  wis: 12,
  cha: 8,
  baseZa: 5,
  baseRef: 1,
  baseWil: 1,
  iniMisc: 0,
  bab: 4,
  classType: 'multiclass',
  level: 4,
  classes: [
    { classType: 'fighter', level: 3 },
    { classType: 'barbarian', level: 1 }
  ],
  autoAC: true,
  weapons: [
    { name: 'Zweihändige Streitaxt +1', type: 'greataxe', attackBonus: '', damageDice: '1w12', crit: 'x3', grip: '2h', enhancement: 1, isEquipped: true, hand: 'main' },
    { name: 'Wurfaxt', type: 'throwing_axe', attackBonus: '', damageDice: '1w6', crit: 'x2', grip: 'rng', enhancement: 0, isEquipped: false }
  ],
  armors: [
    { name: 'Bänderpanzer +1', type: 'banded_mail', enhancement: 1, isEquipped: true }
  ],
  items: [
    {
      name: 'Gürtel der Riesenstärke +2',
      slot: 'waist',
      isEquipped: true,
      effects: [{ type: 'attribute', target: 'str', value: 2, bonusType: 'enhancement' }]
    },
    {
      name: 'Potion of Cure Serious Wounds',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 2,
      healingFormula: '3d8+5',
      description: 'Heals 3d8+5 hit points.'
    },
    {
      name: "Potion of Bull's Strength",
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'bulls_strength', effectDescription: '+4 Enhancement bonus to Strength for 3 minutes' }
    },
    {
      name: 'Potion of Enlarge Person',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'enlarge_person', effectDescription: 'Large Size (+2 Str, -2 Dex, -1 AC/Attack, 10ft Reach) for 3 minutes' }
    },
    {
      name: "Alchemist's Fire",
      slot: 'slotless',
      type: 'consumable',
      isEquipped: false,
      quantity: 3,
      damageFormula: '1d6',
      activation: { action: 'standard', effectDescription: '1d6 Fire damage on direct hit' }
    },
    {
      name: 'Potion of Heroism',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'heroism', effectDescription: '+2 Morale bonus on attack rolls, saves, and skill checks for 50 minutes' }
    },
    {
      name: 'Tanglefoot Bag',
      slot: 'slotless',
      type: 'consumable',
      isEquipped: false,
      quantity: 2,
      activation: { action: 'standard', effectDescription: 'Entangles target, DC 15 Reflex save or glued to floor' }
    }
  ],
  feats: [
    { id: 'power_attack', option: '' },
    { id: 'cleave', option: '' },
    { id: 'weapon_focus', option: 'Greataxe' },
    { id: 'weapon_specialization', option: 'Greataxe' }
  ],
  dailyAbilities: [
    { name: 'Kampfrausch (Rage)', max: 1, used: 0 }
  ]
};

export const lysaraSample = {
  name: 'Lysara d. Mystikerin',
  init: 6,
  hp: 18,
  maxHP: 18,
  ac: 15,
  acTouch: 12,
  acFlat: 13,
  bw: 30,
  za: 2,
  ref: 3,
  wil: 5,
  type: 'p',
  str: 8,
  dex: 14,
  con: 12,
  int: 18,
  wis: 12,
  cha: 10,
  baseZa: 1,
  baseRef: 1,
  baseWil: 4,
  iniMisc: 4,
  bab: 1,
  classType: 'wizard',
  level: 3,
  classes: [{ classType: 'wizard', level: 3 }],
  autoAC: true,
  weapons: [
    { name: 'Magischer Dolch +1', type: 'dagger', attackBonus: '', damageDice: '1w4', crit: '19-20 / x2', grip: '1h', enhancement: 1, isEquipped: true, hand: 'main' },
    { name: 'Leichte Armbrust', type: 'light_crossbow', attackBonus: '', damageDice: '1w8', crit: '19-20 / x2', grip: 'rng', enhancement: 0, isEquipped: false }
  ],
  armors: [],
  items: [
    {
      name: 'Stirnreif des Intellekts +2',
      slot: 'head',
      isEquipped: true,
      effects: [{ type: 'attribute', target: 'int', value: 2, bonusType: 'enhancement' }]
    },
    {
      name: 'Schutzring +1',
      slot: 'ring1',
      isEquipped: true,
      effects: [{ type: 'ac', target: 'deflection', value: 1, bonusType: 'deflection' }]
    },
    {
      name: 'Potion of Cure Light Wounds',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 2,
      healingFormula: '1d8+1',
      description: 'Heals 1d8+1 hit points upon drinking.'
    },
    {
      name: 'Scroll of Fireball',
      slot: 'slotless',
      type: 'scroll',
      isEquipped: false,
      quantity: 1,
      damageFormula: '5d6',
      activation: { action: 'standard', effectDescription: '5d6 Fire Damage in 20ft radius, DC 14 Reflex half' }
    },
    {
      name: 'Scroll of Scorching Ray',
      slot: 'slotless',
      type: 'scroll',
      isEquipped: false,
      quantity: 2,
      damageFormula: '4d6',
      activation: { action: 'standard', effectDescription: '4d6 Fire ranged touch attack ray' }
    },
    {
      name: 'Potion of Invisibility',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'invisibility', effectDescription: 'Invisibility for 3 minutes' }
    },
    {
      name: 'Scroll of Invisibility',
      slot: 'slotless',
      type: 'scroll',
      isEquipped: false,
      quantity: 1,
      charges: { current: 1, max: 1 },
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'invisibility', effectDescription: 'Casts Invisibility on reader for 3 minutes' }
    },
    {
      name: 'Wand of Magic Missile (CL 3)',
      slot: 'slotless',
      type: 'wand',
      isEquipped: false,
      charges: { current: 24, max: 50 },
      damageFormula: '2d4+2',
      activation: { action: 'standard', effectDescription: 'Fires 2 magical missiles dealing 2d4+2 force damage' }
    },
    {
      name: 'Potion of Mage Armor',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'mage_armor', effectDescription: '+4 Armor AC for 1 hour' }
    }
  ],
  feats: [
    { id: 'improved_initiative', option: '' },
    { id: 'scribe_scroll', option: '' },
    { id: 'point_blank_shot', option: '' }
  ],
  spellSlots: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 }
  },
  learnedSpells: [
    'mage_armor', 'shield', 'magic_missile', 'scorching_ray', 'invisibility'
  ],
  preparedSpells: [
    { id: 'prep-wiz-1', spellKey: 'mage_armor', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-wiz-2', spellKey: 'magic_missile', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-wiz-3', spellKey: 'scorching_ray', metamagic: [], isUsed: false, isSpecialist: false }
  ]
};

export const wizardLvl10Sample = {
  name: 'Lysara die Erhabene',
  init: 6,
  hp: 45,
  maxHP: 45,
  ac: 19,
  acTouch: 14,
  acFlat: 17,
  bw: 30,
  za: 5,
  ref: 5,
  wil: 8,
  type: 'p',
  str: 8,
  dex: 14,
  con: 14,
  int: 20,
  wis: 12,
  cha: 10,
  baseZa: 3,
  baseRef: 3,
  baseWil: 7,
  iniMisc: 4,
  bab: 5,
  classType: 'wizard',
  level: 10,
  classes: [{ classType: 'wizard', level: 10 }],
  autoAC: true,
  weapons: [
    { name: 'Magischer Viertelstab +1', type: 'quarterstaff', attackBonus: '', damageDice: '1w6', crit: 'x2', grip: '2h', enhancement: 1, isEquipped: true, hand: 'main' },
    { name: 'Leichte Armbrust +1', type: 'light_crossbow', attackBonus: '', damageDice: '1w8', crit: '19-20 / x2', grip: 'rng', enhancement: 1, isEquipped: false }
  ],
  armors: [],
  items: [
    {
      name: 'Robe of the Archmagi',
      slot: 'torso',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'armor', value: 5, bonusType: 'armor' },
        { type: 'save', target: 'all', value: 4, bonusType: 'resistance' }
      ]
    },
    {
      name: 'Ring of Protection +2',
      slot: 'ring1',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'deflection', value: 2, bonusType: 'deflection' }
      ]
    },
    {
      name: 'Amulet of Natural Armor +2',
      slot: 'neck',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'natural', value: 2, bonusType: 'natural_enhancement' }
      ]
    },
    {
      name: 'Headband of Intellect +4',
      slot: 'head',
      isEquipped: true,
      effects: [
        { type: 'attribute', target: 'int', value: 4, bonusType: 'enhancement' }
      ]
    },
    {
      name: 'Potion of Cure Critical Wounds',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 2,
      healingFormula: '4d8+7',
      description: 'Heals 4d8+7 hit points.'
    },
    {
      name: 'Potion of Haste',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'haste', effectDescription: '+1 Attack roll, +1 Dodge AC, +30ft speed for 5 rounds' }
    },
    {
      name: 'Scroll of Chain Lightning',
      slot: 'slotless',
      type: 'scroll',
      isEquipped: false,
      quantity: 1,
      damageFormula: '11d6',
      activation: { action: 'standard', effectDescription: '11d6 Electricity damage to primary target, DC 19 Reflex half' }
    },
    {
      name: 'Scroll of Disintegrate',
      slot: 'slotless',
      type: 'scroll',
      isEquipped: false,
      quantity: 1,
      damageFormula: '22d6',
      activation: { action: 'standard', effectDescription: '22d6 Untyped damage on ranged touch, DC 19 Fortitude reduces to 5d6' }
    },
    {
      name: 'Wand of Lightning Bolt (CL 6)',
      slot: 'slotless',
      type: 'wand',
      isEquipped: false,
      charges: { current: 18, max: 50 },
      damageFormula: '6d6',
      activation: { action: 'standard', effectDescription: '6d6 Electricity damage in 60ft line, DC 14 Reflex half' }
    },
    {
      name: 'Potion of Fly',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'fly', effectDescription: 'Fly speed 60 ft. (good maneuverability) for 5 minutes' }
    }
  ],
  feats: [
    { id: 'improved_initiative', option: '' },
    { id: 'scribe_scroll', option: '' },
    { id: 'combat_casting', option: '' },
    { id: 'extend_spell', option: '' },
    { id: 'empower_spell', option: '' },
    { id: 'spell_penetration', option: '' }
  ],
  skills: {
    concentration: { ranks: 13, misc: 0 },
    spellcraft: { ranks: 13, misc: 0 },
    knowledge_arcana: { ranks: 13, misc: 0 },
    knowledge_planes: { ranks: 10, misc: 0 },
    decipher_script: { ranks: 8, misc: 0 },
    spot: { ranks: 5, misc: 0 }
  },
  spellSlots: {
    0: { max: 4, used: 0 },
    1: { max: 5, used: 0 },
    2: { max: 5, used: 0 },
    3: { max: 4, used: 0 },
    4: { max: 4, used: 0 },
    5: { max: 3, used: 0 }
  },
  learnedSpells: [
    'mage_armor', 'shield', 'magic_missile', 'haste', 'fireball', 'stoneskin'
  ],
  preparedSpells: [
    { id: 'prep-wiz-1', spellKey: 'mage_armor', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-wiz-2', spellKey: 'shield', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-wiz-3', spellKey: 'magic_missile', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-wiz-4', spellKey: 'haste', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-wiz-5', spellKey: 'fireball', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-wiz-6', spellKey: 'stoneskin', metamagic: [], isUsed: false, isSpecialist: false }
  ],
  familiarName: 'Keks',
  familiarType: 'cat',
  familiarHP: 22
};

export const rangerLvl10Sample = {
  name: 'Gildor Windläufer',
  init: 8,
  hp: 75,
  maxHP: 75,
  ac: 21,
  acTouch: 15,
  acFlat: 16,
  bw: 30,
  za: 9,
  ref: 12,
  wil: 5,
  type: 'p',
  str: 16,
  dex: 18,
  con: 14,
  wis: 14,
  int: 10,
  cha: 8,
  baseZa: 7,
  baseRef: 7,
  baseWil: 3,
  iniMisc: 4,
  bab: 10,
  classType: 'ranger',
  level: 10,
  classes: [{ classType: 'ranger', level: 10 }],
  rangerCombatStyle: 'archery',
  favoredEnemy: 'Orks',
  autoAC: true,
  weapons: [
    { name: 'Langbogen +2', type: 'composite_longbow', attackBonus: '', damageDice: '1w8', crit: 'x3', grip: 'rng', enhancement: 2, isEquipped: true, hand: 'main' },
    { name: 'Kurzschwert +1', type: 'shortsword', attackBonus: '', damageDice: '1w6', crit: '19-20 / x2', grip: '1h', enhancement: 1, isEquipped: false }
  ],
  armors: [
    { name: 'Mithral-Kettenhemd +2', type: 'chain_shirt', enhancement: 2, isEquipped: true, maxDexOverride: 6 }
  ],
  items: [
    {
      name: 'Geschicklichkeitshandschuhe +2',
      slot: 'hands',
      isEquipped: true,
      effects: [
        { type: 'attribute', target: 'dex', value: 2, bonusType: 'enhancement' }
      ]
    },
    {
      name: 'Schutzring +1',
      slot: 'ring1',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'deflection', value: 1, bonusType: 'deflection' }
      ]
    },
    {
      name: 'Umhang der Resistenz +2',
      slot: 'shoulders',
      isEquipped: true,
      effects: [
        { type: 'save', target: 'all', value: 2, bonusType: 'resistance' }
      ]
    },
    {
      name: 'Potion of Cure Serious Wounds',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 3,
      healingFormula: '3d8+5',
      description: 'Heals 3d8+5 hit points.'
    },
    {
      name: 'Potion of Haste',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'haste', effectDescription: '+1 Attack roll (extra attack on full attack), +1 Dodge AC, +30ft speed' }
    },
    {
      name: 'Potion of Greater Invisibility',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'greater_invisibility', effectDescription: 'Invisibility that remains active even when attacking for 1 minute' }
    },
    {
      name: "Alchemist's Fire (Superior)",
      slot: 'slotless',
      type: 'consumable',
      isEquipped: false,
      quantity: 3,
      damageFormula: '2d6',
      activation: { action: 'standard', effectDescription: '2d6 Fire damage direct hit + 1d6 next round' }
    },
    {
      name: 'Potion of Barkskin +3',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'barkskin', effectDescription: '+3 Natural Armor bonus to AC for 30 minutes' }
    },
    {
      name: "Potion of Cat's Grace",
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'cats_grace', effectDescription: '+4 Enhancement bonus to Dexterity for 3 minutes' }
    }
  ],
  feats: [
    { id: 'point_blank_shot', option: '' },
    { id: 'precise_shot', option: '' },
    { id: 'rapid_shot', option: '' },
    { id: 'manyshot', option: '' },
    { id: 'weapon_focus', option: 'Longbow' }
  ],
  skills: {
    hide: { ranks: 13, misc: 0 },
    move_silently: { ranks: 13, misc: 0 },
    spot: { ranks: 13, misc: 0 },
    listen: { ranks: 13, misc: 0 },
    survival: { ranks: 13, misc: 0 },
    search: { ranks: 8, misc: 0 },
    climb: { ranks: 5, misc: 0 }
  },
  spellSlots: {
    1: { max: 2, used: 0 },
    2: { max: 2, used: 0 },
    3: { max: 1, used: 0 }
  },
  learnedSpells: [
    'cure_light_wounds', 'barkskin'
  ],
  preparedSpells: [
    { id: 'prep-ran-1', spellKey: 'cure_light_wounds', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-ran-2', spellKey: 'barkskin', metamagic: [], isUsed: false, isSpecialist: false }
  ],
  companionName: 'Borko',
  companionType: 'wolf',
  companionMaxHP: 26,
  companionHP: 26
};

export const paladinLvl10Sample = {
  name: 'Sir Valerius',
  init: 4,
  hp: 85,
  maxHP: 85,
  ac: 24,
  acTouch: 11,
  acFlat: 24,
  bw: 20,
  za: 12,
  ref: 6,
  wil: 7,
  type: 'p',
  str: 18,
  dex: 10,
  con: 14,
  wis: 12,
  cha: 16,
  baseZa: 7,
  baseRef: 3,
  baseWil: 3,
  iniMisc: 4,
  bab: 10,
  classType: 'paladin',
  level: 10,
  classes: [{ classType: 'paladin', level: 10 }],
  divineGraceActive: true,
  autoAC: true,
  weapons: [
    { name: 'Heiliges Langschwert +1', type: 'longsword', attackBonus: '', damageDice: '1w8', crit: '19-20 / x2', grip: '1h', enhancement: 1, isEquipped: true, hand: 'main' },
    { name: 'Schwere Armbrust', type: 'heavy_crossbow', attackBonus: '', damageDice: '1w10', crit: '19-20 / x2', grip: 'rng', enhancement: 0, isEquipped: false }
  ],
  armors: [
    { name: 'Ritterharnisch +1', type: 'full_plate', enhancement: 1, isEquipped: true },
    { name: 'Schwerer Stahlschild +1', type: 'shield_heavy_steel', enhancement: 1, isEquipped: true, isShield: true }
  ],
  items: [
    {
      name: 'Gürtel der Riesenstärke +2',
      slot: 'waist',
      isEquipped: true,
      effects: [
        { type: 'attribute', target: 'str', value: 2, bonusType: 'enhancement' }
      ]
    },
    {
      name: 'Amulett der Gesundheit +2',
      slot: 'neck',
      isEquipped: true,
      effects: [
        { type: 'attribute', target: 'con', value: 2, bonusType: 'enhancement' }
      ]
    },
    {
      name: 'Schutzring +1',
      slot: 'ring1',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'deflection', value: 1, bonusType: 'deflection' }
      ]
    },
    {
      name: 'Umhang der Resistenz +1',
      slot: 'shoulders',
      isEquipped: true,
      effects: [
        { type: 'save', target: 'all', value: 1, bonusType: 'resistance' }
      ]
    },
    {
      name: 'Potion of Cure Critical Wounds',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 2,
      healingFormula: '4d8+7',
      description: 'Heals 4d8+7 hit points.'
    },
    {
      name: 'Potion of Divine Favor +3',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'divine_favor', effectDescription: '+3 Luck bonus on attack and weapon damage rolls for 1 minute' }
    },
    {
      name: 'Holy Water (Blessed)',
      slot: 'slotless',
      type: 'consumable',
      isEquipped: false,
      quantity: 3,
      damageFormula: '4d4',
      activation: { action: 'standard', effectDescription: '4d4 Holy damage to undead/evil outsiders' }
    },
    {
      name: "Potion of Bull's Strength",
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'bulls_strength', effectDescription: '+4 Enhancement bonus to Strength for 3 minutes' }
    },
    {
      name: 'Potion of Heroism',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'heroism', effectDescription: '+2 Morale bonus on attack rolls, saves, and skill checks for 50 minutes' }
    },
    {
      name: 'Scroll of Holy Smite',
      slot: 'slotless',
      type: 'scroll',
      isEquipped: false,
      quantity: 1,
      damageFormula: '5d8',
      activation: { action: 'standard', effectDescription: '5d8 Holy damage to evil creatures, DC 16 Will save halves and negates blindness' }
    }
  ],
  feats: [
    { id: 'power_attack', option: '' },
    { id: 'cleave', option: '' },
    { id: 'weapon_focus', option: 'Longsword' },
    { id: 'mounted_combat', option: '' }
  ],
  skills: {
    diplomacy: { ranks: 13, misc: 0 },
    heal: { ranks: 10, misc: 0 },
    ride: { ranks: 8, misc: 0 },
    sense_motive: { ranks: 8, misc: 0 },
    concentration: { ranks: 5, misc: 0 }
  },
  spellSlots: {
    1: { max: 2, used: 0 },
    2: { max: 2, used: 0 },
    3: { max: 1, used: 0 }
  },
  learnedSpells: [
    'bless', 'cure_light_wounds'
  ],
  preparedSpells: [
    { id: 'prep-pal-1', spellKey: 'bless', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-pal-2', spellKey: 'cure_light_wounds', metamagic: [], isUsed: false, isSpecialist: false }
  ],
  dailyAbilities: [
    { name: 'Lay on Hands', max: 30, used: 0 },
    { name: 'Smite Evil', max: 3, used: 0 },
    { name: 'Turn Undead', max: 6, used: 0 }
  ]
};

export const arcaneTricksterLvl11Sample = {
  name: 'Corvin Nachtschatten',
  init: 7,
  hp: 47,
  maxHP: 47,
  ac: 21,
  acTouch: 15,
  acFlat: 17,
  bw: 30,
  za: 4,
  ref: 10,
  wil: 8,
  type: 'p',
  str: 8,
  dex: 16,
  con: 12,
  int: 18,
  wis: 10,
  cha: 8,
  baseZa: 3,
  baseRef: 7,
  baseWil: 8,
  iniMisc: 4,
  bab: 5,
  classType: 'multiclass',
  level: 11,
  classes: [
    { classType: 'rogue', level: 3 },
    { classType: 'wizard', level: 5 },
    { classType: 'arcane_trickster', level: 3 }
  ],
  prestigeSpellLinks: {
    arcane_trickster: 'wizard'
  },
  alignment: 'Chaotic Neutral',
  autoAC: true,
  weapons: [
    { name: 'Meisterwerk-Rapier', type: 'rapier', attackBonus: '', damageDice: '1w6', crit: '18-20 / x2', grip: '1h', enhancement: 0, isEquipped: true, hand: 'main' },
    { name: 'Handarmbrust +1', type: 'hand_crossbow', attackBonus: '', damageDice: '1w4', crit: '19-20 / x2', grip: 'rng', enhancement: 1, isEquipped: false }
  ],
  armors: [
    { name: 'Mithral-Kettenhemd +1', type: 'chain_shirt', enhancement: 1, isEquipped: true, maxDexOverride: 6 }
  ],
  items: [
    {
      name: 'Schutzring +1',
      slot: 'ring1',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'deflection', value: 1, bonusType: 'deflection' }
      ]
    },
    {
      name: 'Amulett der natürlichen Rüstung +1',
      slot: 'neck',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'natural', value: 1, bonusType: 'natural_enhancement' }
      ]
    },
    {
      name: 'Potion of Cure Serious Wounds',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 2,
      healingFormula: '3d8+5',
      description: 'Heals 3d8+5 hit points.'
    },
    {
      name: 'Potion of Greater Invisibility',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'greater_invisibility', effectDescription: 'Invisibility that remains active when attacking for 1 minute' }
    },
    {
      name: 'Scroll of Scorching Ray (CL 7)',
      slot: 'slotless',
      type: 'scroll',
      isEquipped: false,
      quantity: 2,
      damageFormula: '8d6',
      activation: { action: 'standard', effectDescription: 'Fires 2 rays dealing 4d6 Fire damage each (8d6 total)' }
    },
    {
      name: 'Wand of Acid Arrow (CL 5)',
      slot: 'slotless',
      type: 'wand',
      isEquipped: false,
      charges: { current: 22, max: 50 },
      damageFormula: '2d4',
      activation: { action: 'standard', effectDescription: '2d4 Acid damage on hit + 2d4 next round (no save)' }
    },
    {
      name: "Potion of Cat's Grace",
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'cats_grace', effectDescription: '+4 Enhancement bonus to Dexterity for 3 minutes' }
    },
    {
      name: 'Smokestick',
      slot: 'slotless',
      type: 'consumable',
      isEquipped: false,
      quantity: 2,
      activation: { action: 'standard', effectDescription: 'Creates a 10ft cube of thick smoke providing concealment' }
    }
  ],
  feats: [
    { id: 'weapon_finesse', option: '' },
    { id: 'improved_initiative', option: '' },
    { id: 'combat_expertise', option: '' },
    { id: 'scribe_scroll', option: '' },
    { id: 'still_spell', option: '' },
    { id: 'skill_focus', option: 'Disable Device' }
  ],
  skills: {
    disable_device: { ranks: 14, misc: 0 },
    escape_artist: { ranks: 11, misc: 0 },
    decipher_script: { ranks: 8, misc: 0 },
    knowledge_arcana: { ranks: 11, misc: 0 },
    sleight_of_hand: { ranks: 11, misc: 0 },
    hide: { ranks: 11, misc: 0 },
    move_silently: { ranks: 11, misc: 0 },
    spellcraft: { ranks: 11, misc: 0 },
    concentration: { ranks: 11, misc: 0 },
    search: { ranks: 8, misc: 0 },
    open_lock: { ranks: 8, misc: 0 },
    spot: { ranks: 6, misc: 0 },
    bluff: { ranks: 6, misc: 0 },
    tumble: { ranks: 6, misc: 0 }
  },
  spellSlots: {
    0: { max: 4, used: 0 },
    1: { max: 5, used: 0 },
    2: { max: 4, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 2, used: 0 }
  },
  learnedSpells: [
    'mage_hand', 'detect_magic', 'read_magic',
    'mage_armor', 'shield', 'magic_missile',
    'invisibility', 'mirror_image', 'scorching_ray',
    'fireball', 'dispel_magic', 'stoneskin'
  ],
  preparedSpells: [
    { id: 'prep-atk-1', spellKey: 'mage_hand', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-atk-2', spellKey: 'mage_armor', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-atk-3', spellKey: 'invisibility', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-atk-4', spellKey: 'mirror_image', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-atk-5', spellKey: 'scorching_ray', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-atk-6', spellKey: 'dispel_magic', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-atk-7', spellKey: 'stoneskin', metamagic: [], isUsed: false, isSpecialist: false }
  ],
  isSneakAttacking: true
};

export const spellwarpSniperLvl10Sample = {
  name: 'Valerius Strahlenweber',
  init: 8,
  hp: 58,
  maxHP: 58,
  ac: 21,
  acTouch: 15,
  acFlat: 17,
  bw: 30,
  za: 5,
  ref: 10,
  wil: 8,
  type: 'p',
  str: 10,
  dex: 18,
  con: 14,
  int: 19,
  wis: 12,
  cha: 8,
  baseZa: 3,
  baseRef: 6,
  baseWil: 7,
  iniMisc: 4,
  bab: 5,
  classType: 'multiclass',
  level: 10,
  classes: [
    { classType: 'rogue', level: 1 },
    { classType: 'wizard', level: 5 },
    { classType: 'spellwarp_sniper', level: 4 }
  ],
  prestigeSpellLinks: {
    spellwarp_sniper: 'wizard'
  },
  alignment: 'Neutral Good',
  autoAC: true,
  weapons: [
    { name: 'Strahlenangriff (Ray Spell Attack)', type: 'other_ranged', attackBonus: '', damageDice: '4w6', crit: '20 / x2', grip: 'rng', enhancement: 0, isEquipped: true, hand: 'main' },
    { name: 'Meisterwerk-Dolch +1', type: 'dagger', attackBonus: '', damageDice: '1w4', crit: '19-20 / x2', grip: '1h', enhancement: 1, isEquipped: false },
    { name: 'Leichte Armbrust +1', type: 'light_crossbow', attackBonus: '', damageDice: '1w8', crit: '19-20 / x2', grip: 'rng', enhancement: 1, isEquipped: false }
  ],
  armors: [
    { name: 'Mithral-Kettenhemd +1 (Dämmerung)', type: 'chain_shirt', enhancement: 1, isEquipped: true, maxDexOverride: 6 }
  ],
  items: [
    {
      name: 'Schutzring +1',
      slot: 'ring1',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'deflection', value: 1, bonusType: 'deflection' }
      ]
    },
    {
      name: 'Handschuhe der Geschicklichkeit +2',
      slot: 'hands',
      isEquipped: true,
      effects: [
        { type: 'attribute', target: 'dex', value: 2, bonusType: 'enhancement' }
      ]
    },
    {
      name: 'Stirnreif des Intellekts +2',
      slot: 'head',
      isEquipped: true,
      effects: [
        { type: 'attribute', target: 'int', value: 2, bonusType: 'enhancement' }
      ]
    },
    {
      name: 'Potion of Cure Serious Wounds',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 2,
      healingFormula: '3d8+5',
      description: 'Heals 3d8+5 hit points.'
    },
    {
      name: 'Potion of Haste',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', effectDescription: '+1 Attack roll, +1 Dodge AC, +30ft speed, extra ray attack on full attack' }
    },
    {
      name: 'Scroll of Ice Storm',
      slot: 'slotless',
      type: 'scroll',
      isEquipped: false,
      quantity: 1,
      damageFormula: '5d6',
      activation: { action: 'standard', effectDescription: '3d6 bludgeoning + 2d6 cold damage (no save)' }
    },
    {
      name: 'Wand of Ray of Enfeeblement (CL 5)',
      slot: 'slotless',
      type: 'wand',
      isEquipped: false,
      charges: { current: 30, max: 50 },
      damageFormula: '1d6+5',
      activation: { action: 'standard', effectDescription: 'Deals 1d6+5 Strength penalty on ranged touch attack' }
    },
    {
      name: 'Potion of Invisibility',
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'invisibility', effectDescription: 'Invisibility for 3 minutes' }
    },
    {
      name: 'Scroll of Invisibility',
      slot: 'slotless',
      type: 'scroll',
      isEquipped: false,
      quantity: 1,
      charges: { current: 1, max: 1 },
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'invisibility', effectDescription: 'Casts Invisibility on reader for 3 minutes' }
    },
    {
      name: "Potion of Fox's Cunning",
      slot: 'slotless',
      type: 'potion',
      isEquipped: false,
      quantity: 1,
      activation: { action: 'standard', actionType: 'standard', costType: 'charges', cost: 1, appliedBuffKey: 'foxs_cunning', effectDescription: '+4 Enhancement bonus to Intelligence for 3 minutes' }
    }
  ],
  feats: [
    { id: 'point_blank_shot', option: '' },
    { id: 'precise_shot', option: '' },
    { id: 'improved_initiative', option: '' },
    { id: 'scribe_scroll', option: '' },
    { id: 'empower_spell', option: '' }
  ],
  skillTricks: [
    { id: 'spot_the_weak_point', isBonus: false },
    { id: 'collector_of_stories', isBonus: false }
  ],
  skills: {
    concentration: { ranks: 13, misc: 0 },
    spellcraft: { ranks: 13, misc: 0 },
    spot: { ranks: 12, misc: 0 },
    hide: { ranks: 13, misc: 0 },
    move_silently: { ranks: 13, misc: 0 },
    knowledge_arcana: { ranks: 10, misc: 0 },
    knowledge_dungeons: { ranks: 5, misc: 0 },
    disable_device: { ranks: 6, misc: 0 },
    open_lock: { ranks: 4, misc: 0 },
    tumble: { ranks: 6, misc: 0 },
    listen: { ranks: 5, misc: 0 }
  },
  spellSlots: {
    0: { max: 4, used: 0 },
    1: { max: 5, used: 0 },
    2: { max: 5, used: 0 },
    3: { max: 4, used: 0 },
    4: { max: 3, used: 0 },
    5: { max: 2, used: 0 }
  },
  learnedSpells: [
    'ray_of_frost', 'detect_magic', 'read_magic', 'mage_hand',
    'mage_armor', 'shield', 'magic_missile', 'ray_of_enfeeblement',
    'scorching_ray', 'invisibility', 'mirror_image', 'web',
    'fireball', 'lightning_bolt', 'ray_of_exhaustion', 'dispel_magic',
    'ice_storm', 'enervation', 'dimension_door',
    'cone_of_cold', 'teleport'
  ],
  preparedSpells: [
    { id: 'prep-sws-1', spellKey: 'ray_of_enfeeblement', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-sws-2', spellKey: 'shield', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-sws-3', spellKey: 'scorching_ray', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-sws-4', spellKey: 'invisibility', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-sws-5', spellKey: 'ray_of_exhaustion', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-sws-6', spellKey: 'fireball', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-sws-7', spellKey: 'enervation', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-sws-8', spellKey: 'ice_storm', metamagic: [], isUsed: false, isSpecialist: false },
    { id: 'prep-sws-9', spellKey: 'cone_of_cold', metamagic: [], isUsed: false, isSpecialist: false }
  ],
  dailyAbilities: [
    { name: 'Spellwarp (1st-4th level area spells into rays)', max: 99, used: 0 },
    { name: 'Sudden Raystrike (+2d6)', max: 99, used: 0 }
  ],
  isSneakAttacking: true
};

