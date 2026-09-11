/**
 * @module    consolidatedCompendium
 * @summary   Consolidated view of magic items for streamlined compendium display.
 * @exports   CONSOLIDATED_COMPENDIUM
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
