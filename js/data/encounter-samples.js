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
  ac: 18,
  acTouch: 12,
  acFlat: 16,
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
  weapons: [
    { name: 'Meisterwerk-Langschwert +1', attackBonus: '', damageDice: '1w8', crit: '19-20 / x2', grip: '1h', enhancement: 1 },
    { name: 'Langbogen', attackBonus: '', damageDice: '1w8', crit: 'x3', grip: 'rng', enhancement: 0 }
  ],
  spellSlots: {
    1: { max: 1, used: 0 }
  },
  dailyAbilities: [
    { name: 'Hände auflegen', max: 10, used: 2 },
    { name: 'Böses niederstrecken', max: 2, used: 0 }
  ]
};

export const morgwenSample = {
  name: 'Morgwen Hüterin',
  init: 0,
  hp: 22,
  maxHP: 28,
  ac: 15,
  acTouch: 10,
  acFlat: 15,
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
  weapons: [
    { name: 'Streitkolben', attackBonus: '', damageDice: '1w8', crit: 'x2', grip: '1h', enhancement: 0 }
  ],
  spellSlots: {
    1: { max: 3, used: 1 },
    2: { max: 2, used: 0 }
  },
  dailyAbilities: [
    { name: 'Turn Undead', max: 5, used: 1 }
  ]
};

export const thordakSample = {
  name: 'Thordak Eisenfaust',
  init: 1,
  hp: 52,
  maxHP: 52,
  ac: 20,
  acTouch: 11,
  acFlat: 19,
  bw: 20,
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
  weapons: [
    { name: 'Zweihändige Streitaxt +1', attackBonus: '', damageDice: '1w12', crit: 'x3', grip: '2h', enhancement: 1 }
  ],
  dailyAbilities: [
    { name: 'Kampfrausch (Rage)', max: 2, used: 1 }
  ]
};

export const lysaraSample = {
  name: 'Lysara d. Mystikerin',
  init: 6,
  hp: 18,
  maxHP: 18,
  ac: 13,
  acTouch: 12,
  acFlat: 11,
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
  weapons: [
    { name: 'Dolch', attackBonus: '', damageDice: '1w4', crit: '19-20 / x2', grip: '1h', enhancement: 0 },
    { name: 'Leichte Armbrust', attackBonus: '', damageDice: '1w8', crit: '19-20 / x2', grip: 'rng', enhancement: 0 }
  ],
  spellSlots: {
    1: { max: 4, used: 2 },
    2: { max: 3, used: 1 },
    3: { max: 2, used: 0 }
  }
};

export const wizardLvl10Sample = {
  name: 'Lysara die Erhabene',
  init: 6,
  hp: 45,
  maxHP: 45,
  ac: 17,
  acTouch: 12,
  acFlat: 15,
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
    { name: 'Magischer Viertelstab +1', attackBonus: '', damageDice: '1w6', crit: 'x2', grip: '2h', enhancement: 1 },
    { name: 'Leichte Armbrust', attackBonus: '', damageDice: '1w8', crit: '19-20 / x2', grip: 'rng', enhancement: 0 }
  ],
  armors: [],
  items: [
    {
      name: 'Robe des Erzmagiers',
      slot: 'torso',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'armor', value: 5 },
        { type: 'save', target: 'all', value: 4 }
      ]
    },
    {
      name: 'Schutzring +2',
      slot: 'ring1',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'deflection', value: 2 }
      ]
    },
    {
      name: 'Amulett der natürlichen Rüstung +2',
      slot: 'neck',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'natural', value: 2 }
      ]
    },
    {
      name: 'Stirnband des Intellekts +4',
      slot: 'head',
      isEquipped: true,
      effects: [
        { type: 'attribute', target: 'int', value: 4 }
      ]
    },
    {
      name: 'Heiltrank',
      slot: 'slotless',
      isEquipped: false,
      effects: []
    },
    {
      name: 'Schriftrolle des Feuers',
      slot: 'slotless',
      isEquipped: false,
      effects: []
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
  ac: 19,
  acTouch: 14,
  acFlat: 15,
  bw: 30,
  za: 9,
  ref: 11,
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
    { name: 'Langbogen +2', attackBonus: '', damageDice: '1w8', crit: 'x3', grip: 'rng', enhancement: 2 },
    { name: 'Kurzschwert +1', attackBonus: '', damageDice: '1w6', crit: '19-20 / x2', grip: '1h', enhancement: 1 }
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
        { type: 'attribute', target: 'dex', value: 2 }
      ]
    },
    {
      name: 'Schutzring +1',
      slot: 'ring1',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'deflection', value: 1 }
      ]
    },
    {
      name: 'Umhang der Resistenz +2',
      slot: 'shoulders',
      isEquipped: true,
      effects: [
        { type: 'save', target: 'all', value: 2 }
      ]
    },
    {
      name: 'Trank: Mittelschwere Wunden heilen',
      slot: 'slotless',
      isEquipped: false,
      effects: []
    },
    {
      name: 'Elixier der Schnelligkeit',
      slot: 'slotless',
      isEquipped: false,
      effects: []
    }
  ],
  feats: [
    { id: 'point_blank_shot', option: '' },
    { id: 'precise_shot', option: '' },
    { id: 'rapid_shot', option: '' },
    { id: 'manyshot', option: '' },
    { id: 'weapon_focus', option: 'Langbogen' }
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
  ac: 20,
  acTouch: 10,
  acFlat: 20,
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
    { name: 'Heiliges Langschwert +1', attackBonus: '', damageDice: '1w8', crit: '19-20 / x2', grip: '1h', enhancement: 1 },
    { name: 'Schwere Armbrust', attackBonus: '', damageDice: '1w10', crit: '19-20 / x2', grip: 'rng', enhancement: 0 }
  ],
  armors: [
    { name: 'Ritterharnisch +1', type: 'full_plate', enhancement: 1, isEquipped: true },
    { name: 'Schwerer Stahlschild +1', type: 'shield_heavy_steel', enhancement: 1, isEquipped: true }
  ],
  items: [
    {
      name: 'Gürtel der Riesenstärke +2',
      slot: 'waist',
      isEquipped: true,
      effects: [
        { type: 'attribute', target: 'str', value: 2 }
      ]
    },
    {
      name: 'Amulett der Gesundheit +2',
      slot: 'neck',
      isEquipped: true,
      effects: [
        { type: 'attribute', target: 'con', value: 2 }
      ]
    },
    {
      name: 'Schutzring +1',
      slot: 'ring1',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'deflection', value: 1 }
      ]
    },
    {
      name: 'Umhang der Resistenz +1',
      slot: 'shoulders',
      isEquipped: true,
      effects: [
        { type: 'save', target: 'all', value: 1 }
      ]
    },
    {
      name: 'Zepter der Heilung',
      slot: 'slotless',
      isEquipped: false,
      effects: []
    },
    {
      name: 'Trank: Schwere Wunden heilen',
      slot: 'slotless',
      isEquipped: false,
      effects: []
    }
  ],
  feats: [
    { id: 'power_attack', option: '' },
    { id: 'cleave', option: '' },
    { id: 'weapon_focus', option: 'Langschwert' },
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
  ac: 20,
  acTouch: 14,
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
    { name: 'Meisterwerk-Rapier', attackBonus: '', damageDice: '1w6', crit: '18-20 / x2', grip: '1h', enhancement: 0 },
    { name: 'Handarmbrust +1', attackBonus: '', damageDice: '1w4', crit: '19-20 / x2', grip: 'rng', enhancement: 1 }
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
        { type: 'ac', target: 'deflection', value: 1 }
      ]
    },
    {
      name: 'Amulett der natürlichen Rüstung +1',
      slot: 'neck',
      isEquipped: true,
      effects: [
        { type: 'ac', target: 'natural', value: 1 }
      ]
    },
    {
      name: 'Meisterwerk-Dietriche',
      slot: 'slotless',
      isEquipped: false,
      effects: []
    },
    {
      name: 'Trank: Unsichtbarkeit',
      slot: 'slotless',
      isEquipped: false,
      effects: []
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
