/**
 * @module    registrySlotless
 * @summary   Slotless, wondrous, and consumable magic items registry.
 * @exports   REGISTRY_SLOTLESS
 */

export const REGISTRY_SLOTLESS = {
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
