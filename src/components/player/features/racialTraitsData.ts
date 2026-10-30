/**
 * Static racial trait registry (D&D 3.5e RAW) used by RacialTraitsCard.
 * Placeholders: `{holdBreathRounds}` is resolved at render time.
 */

export interface RacialTrait {
  title: string;
  text: string;
}

const SMALL_SIZE: RacialTrait = { title: 'Small Size', text: '+1 size bonus to AC, +1 size bonus on attack rolls, +4 bonus on Hide checks (already included).' };
const DARKVISION: RacialTrait = { title: 'Darkvision', text: 'Can see in the dark up to 60 feet.' };
const HALFLING_LUCK: RacialTrait = { title: 'Halfling Luck', text: '+1 racial bonus on all saving throws (already included).' };
const FEARLESS: RacialTrait = { title: 'Fearless', text: '+2 morale bonus on saving throws against fear.' };
const LEVEL_ADJUSTMENT: RacialTrait = { title: 'Level Adjustment', text: '+1 (increases ECL by 1).' };

export const RACIAL_TRAITS_DATA: Record<string, RacialTrait[]> = {
  human: [
    { title: 'Extra Feat', text: '1 extra feat at level 1.' },
    { title: 'Extra Skill Points', text: '+4 skill points at level 1, +1 at each additional level.' }
  ],
  dwarf: [
    { title: 'Ability Score Adjustments', text: '+2 Constitution, -2 Charisma (already included).' },
    DARKVISION,
    { title: 'Stability', text: '+4 bonus on ability checks made to resist being bull rushed or tripped.' },
    { title: 'Racial Bonuses against Poison/Spells', text: '+2 saving throw bonus against poison, spells, and spell-like effects.' },
    { title: 'Stonecunning', text: '+2 bonus on Search checks to notice unusual stonework.' },
    { title: 'Speed', text: 'Movement speed is not reduced by wearing heavy armor or carrying a heavy load.' }
  ],
  elf: [
    { title: 'Ability Score Adjustments', text: '+2 Dexterity, -2 Constitution (already included).' },
    { title: 'Immunities', text: 'Immune to magic sleep effects.' },
    { title: 'Saving Throw Bonuses against Enchantment', text: '+2 saving throw bonus against enchantment spells or effects.' },
    { title: 'Keen Senses', text: '+2 racial bonus on Search, Spot, and Listen checks (already included).' },
    { title: 'Weapon Familiarity', text: 'Automatically proficient with longsword, rapier, longbow, and shortbow.' }
  ],
  gnome: [
    { title: 'Ability Score Adjustments', text: '+2 Constitution, -2 Strength (already included).' },
    SMALL_SIZE,
    { title: 'Saving Throw Bonuses against Illusion', text: '+2 saving throw bonus against illusion spells or effects.' },
    { title: 'Defensive Training against Giants', text: '+4 dodge bonus to AC against monsters of the giant type.' },
    { title: 'Keen Senses', text: '+2 racial bonus on Listen and Craft (alchemy) checks.' }
  ],
  halfling: [
    { title: 'Ability Score Adjustments', text: '+2 Dexterity, -2 Strength (already included).' },
    SMALL_SIZE,
    HALFLING_LUCK,
    FEARLESS,
    { title: 'Keen Senses', text: '+2 racial bonus on Climb, Jump, Listen, and Move Silently checks (already included).' }
  ],
  deep_halfling: [
    { title: 'Ability Score Adjustments', text: '+2 Dexterity, -2 Strength (already included).' },
    SMALL_SIZE,
    DARKVISION,
    { title: 'Stonecunning', text: '+2 racial bonus on Search checks to notice unusual stonework and find stone traps like a rogue.' },
    { title: 'Craft & Appraise Mastery', text: '+2 racial bonus on Appraise and Craft checks related to stone or metal.' },
    HALFLING_LUCK,
    FEARLESS,
    { title: 'Keen Senses', text: '+2 racial bonus on Listen checks (already included; no bonuses on Climb, Jump, Move Silently).' },
    { title: 'Languages', text: 'Speaks Dwarven fluently.' }
  ],
  half_elf: [
    { title: 'Immunities', text: 'Immune to magic sleep effects, +2 saving throw bonus against enchantment spells or effects.' },
    { title: 'Keen Senses', text: '+1 racial bonus on Listen, Spot, and Search checks (already included).' },
    { title: 'Diplomatic Senses', text: '+2 racial bonus on Diplomacy and Gather Information checks (already included).' },
    { title: 'Elven Blood', text: 'For all effects, a half-elf is considered an elf.' }
  ],
  half_orc: [
    { title: 'Ability Score Adjustments', text: '+2 Strength, -2 Intelligence, -2 Charisma (already included).' },
    DARKVISION,
    { title: 'Orc Blood', text: 'For all effects, a half-orc is considered an orc.' }
  ],
  tiefling: [
    { title: 'Ability Score Adjustments', text: '+2 Dexterity, +2 Intelligence, -2 Charisma (already included).' },
    { title: 'Type', text: 'Outsider (Native) (immune to person-targeting spells like Charm Person).' },
    DARKVISION,
    { title: 'Resistances', text: 'Resistance to cold 5, electricity 5, and fire 5.' },
    { title: 'Keen Senses', text: '+2 racial bonus on Bluff and Hide checks (already included).' },
    { title: 'Darkness', text: 'Can use Darkness as a spell-like ability 1/day.' },
    LEVEL_ADJUSTMENT
  ],
  lizardfolk: [
    { title: 'Ability Score Adjustments', text: '+2 Strength, +2 Constitution, -2 Intelligence (already included).' },
    { title: 'Natural Armor', text: '+5 racial natural armor bonus to AC (already included).' },
    { title: 'Natural Weapons', text: '2 Claws (1d4 primary) and 1 Bite (1d4 secondary).' },
    { title: 'Hold Breath (Ex)', text: 'Can hold breath for up to 4 × Constitution score ({holdBreathRounds} rounds) before risking drowning.' },
    { title: 'Keen Acrobatics & Swimming', text: '+4 racial bonus on Balance, Jump, and Swim checks (already included).' },
    LEVEL_ADJUSTMENT,
    { title: 'Favored Class', text: 'Druid.' }
  ],
  anima_construct: [
    { title: 'Ability Score Adjustments', text: '+2 Constitution, -2 Charisma (already included).' },
    { title: 'Type', text: 'Construct (Living Construct subtype). Has Con score, susceptible to mind-affecting and critical hits.' },
    { title: 'Immunities', text: 'Immune to poisons, diseases, and magic sleep effects.' },
    { title: 'No Metabolism', text: 'Does not eat, drink, or breathe (immune to drowning).' },
    { title: 'Halved Magical Healing', text: 'Any incoming magical healing is halved (rounded down).' },
    { title: 'Natural Armor', text: '+1 racial natural armor bonus (already included).' }
  ]
};
