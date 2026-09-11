/**
 * @module    magicItemSets
 * @summary   D&D 3.5e Magic Item Compendium standard item set definitions and piece bonuses.
 * @exports   MAGIC_ITEM_SETS
 */

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
