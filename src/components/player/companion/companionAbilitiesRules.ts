/**
 * @module    companionAbilitiesRules
 * @summary   Comprehensive D&D 3.5e RAW rules and descriptions for all Animal Companion and Familiar abilities.
 */

import { CompanionAbilityData } from '../../dialogs/companion/CompanionAbilityDetailsDialog';

export const COMPANION_ABILITIES_REGISTRY: Record<string, CompanionAbilityData> = {
  // ==========================================
  // ANIMAL COMPANION ABILITIES (PHB p. 35-36)
  // ==========================================
  link: {
    name: 'Link (Ex)',
    type: 'Extraordinary Ability',
    minLevel: 'Druid 1st / Ranger 4th',
    summary: 'Handle companion as a free action; +4 circumstance bonus on Wild Empathy and Handle Animal checks.',
    rawRules: `A druid can handle her animal companion as a free action, or push it as a move action, even if she doesn't have any ranks in the Handle Animal skill.

The druid gains a +4 circumstance bonus on all wild empathy checks and Handle Animal checks made regarding an animal companion.`,
    source: "Player's Handbook p. 36",
  },
  share_spells: {
    name: 'Share Spells (Ex)',
    type: 'Extraordinary Ability',
    minLevel: 'Druid 1st / Ranger 4th',
    summary: 'Cast personal spells on companion (touch range) or have personal spells affect companion while within 5 ft.',
    rawRules: `At the druid's option, she may have any spell (but not any spell-like ability) she casts upon herself also affect her animal companion.

• Proximity: The animal companion must be within 5 feet of her at the time of casting to receive the benefit. If the spell or effect has a duration other than instantaneous, it stops affecting the companion if it moves farther than 5 feet away and will not affect the animal again, even if it returns before the duration expires.
• Target "You": Additionally, the druid may cast a spell with a target of "You" on her animal companion (as a touch range spell) instead of on herself.
• Type Exception: A druid and her animal companion can share spells even if the spells normally do not affect creatures of the companion's type (animal).`,
    source: "Player's Handbook p. 36",
  },
  evasion: {
    name: 'Evasion (Ex)',
    type: 'Extraordinary Ability',
    minLevel: 'Effective Druid Level 3rd',
    summary: 'Take zero damage on successful Reflex saves against half-damage attacks.',
    rawRules: `If an animal companion is subjected to an attack that normally allows a Reflex saving throw for half damage, it takes no damage if it makes a successful saving throw.`,
    source: "Player's Handbook p. 36",
  },
  devotion: {
    name: 'Devotion (Ex)',
    type: 'Extraordinary Ability',
    minLevel: 'Effective Druid Level 6th',
    summary: '+4 morale bonus on Will saves against enchantment spells and effects.',
    rawRules: `An animal companion gains a +4 morale bonus on Will saves against enchantment spells and effects.`,
    source: "Player's Handbook p. 36",
  },
  multiattack: {
    name: 'Multiattack',
    type: 'Bonus Feat',
    minLevel: 'Effective Druid Level 9th',
    summary: 'Reduces penalties on secondary natural attacks from -5 to -2.',
    rawRules: `An animal companion gains Multiattack as a bonus feat if it has three or more natural attacks and does not already have that feat.

The companion's secondary attacks with natural weapons take only a -2 penalty instead of the standard -5 penalty.`,
    source: "Player's Handbook p. 36 & Monster Manual",
  },
  trip: {
    name: 'Trip (Ex)',
    type: 'Extraordinary Attack Ability',
    summary: 'Free trip attempt upon hitting with bite attack without provoking AoO or counter-trip.',
    rawRules: `A creature with this ability that hits with a bite attack can attempt to trip the opponent (Strength modifier check opposed by defender's Str/Dex check) as a free action without making a touch attack or provoking an attack of opportunity.

If the attempt fails, the opponent cannot react to trip the creature.`,
    source: "Monster Manual (Wolf)",
  },
  pounce: {
    name: 'Pounce (Ex)',
    type: 'Extraordinary Combat Ability',
    summary: 'Make a full attack (including rake attacks) on a charge action.',
    rawRules: `If a creature with this ability charges a foe, it can make a full attack, including two rake attacks if it possesses the rake quality.`,
    source: "Monster Manual (Leopard)",
  },
  improved_grab: {
    name: 'Improved Grab (Ex)',
    type: 'Extraordinary Combat Ability',
    summary: 'Start a grapple as a free action upon hitting with natural attacks without provoking AoO.',
    rawRules: `To use this ability, a creature must hit with its natural attack. It can then attempt to start a grapple as a free action without provoking an attack of opportunity.`,
    source: 'Monster Manual',
  },
  scent: {
    name: 'Scent (Ex)',
    type: 'Extraordinary Sensory Ability',
    summary: 'Detect hidden or invisible enemies within 30 ft (60 ft upwind) and track by smell.',
    rawRules: `A creature with scent can detect approaching enemies, sniff out concealed foes, and track by sense of smell.

• Range: 30 feet normal, 60 feet upwind, 15 feet downwind. Strong scents (smoke, rotting garbage) double ranges; overpowering scents (skunk musk) triple ranges.
• Pinpointing: When a creature gets within 5 feet of the source, it pinpoints the source's direction and location.`,
    source: "Monster Manual & Dungeon Master's Guide",
  },
  low_light_vision: {
    name: 'Low-Light Vision (Ex)',
    type: 'Extraordinary Sensory Ability',
    summary: 'See twice as far as humans in starlight, moonlight, torchlight, and dim illumination.',
    rawRules: `A creature with low-light vision can see twice as far as a human in starlight, moonlight, torchlight, and similar conditions of poor illumination. It retains the ability to distinguish color and detail under these conditions.`,
    source: "Player's Handbook & Monster Manual",
  },

  // ==========================================
  // FAMILIAR ABILITIES (PHB p. 52-53)
  // ==========================================
  alertness: {
    name: 'Alertness (Ex)',
    type: 'Granted Feat to Master',
    minLevel: 'Wizard/Sorcerer 1st',
    summary: 'Master gains the Alertness feat (+2 Listen, +2 Spot) while familiar is within arm’s reach.',
    rawRules: `While a familiar is within arm's reach (adjacent or in the master's space), the master gains the Alertness feat (+2 bonus on Listen and Spot checks).`,
    source: "Player's Handbook p. 52",
  },
  improved_evasion: {
    name: 'Improved Evasion (Ex)',
    type: 'Extraordinary Ability',
    minLevel: 'Wizard/Sorcerer 1st',
    summary: 'Zero damage on successful Reflex save, half damage on failed Reflex save.',
    rawRules: `When subjected to an attack that normally allows a Reflex saving throw for half damage, a familiar takes no damage if it makes a successful saving throw and only half damage if the saving throw fails.`,
    source: "Player's Handbook p. 53",
  },
  empathic_link: {
    name: 'Empathic Link (Su)',
    type: 'Supernatural Ability',
    minLevel: 'Wizard/Sorcerer 1st',
    summary: 'Communicate empathic emotions and feelings with master up to 1 mile away.',
    rawRules: `The master has an empathic link with his familiar out to a distance of up to 1 mile. The master cannot see through the familiar's eyes, but they can communicate emphatically.

Because of the limited nature of this communication, only general emotional content (such as fear, hunger, happiness, curiosity) can be communicated. The master has the same connection to an item or place that his familiar does.`,
    source: "Player's Handbook p. 53",
  },
  deliver_touch_spells: {
    name: 'Deliver Touch Spells (Su)',
    type: 'Supernatural Ability',
    minLevel: 'Wizard/Sorcerer 3rd',
    summary: 'Familiar can deliver touch spells cast by the master.',
    rawRules: `If the master is 3rd level or higher, a familiar can deliver touch spells for him.

If the master and the familiar are in contact at the time the master casts a touch spell, he can designate his familiar as the "toucher." The familiar can then deliver the touch spell just as the master could (making a melee touch attack). As usual, if the master casts another spell before the touch is delivered, the touch spell dissipates.`,
    source: "Player's Handbook p. 53",
  },
  speak_with_master: {
    name: 'Speak with Master (Ex)',
    type: 'Extraordinary Ability',
    minLevel: 'Wizard/Sorcerer 5th',
    summary: 'Familiar and master can converse verbally in a secret language.',
    rawRules: `If the master is 5th level or higher, a familiar and the master can communicate verbally as if they were using a common language. Other creatures do not understand the communication without magical help.`,
    source: "Player's Handbook p. 53",
  },
  speak_with_animals: {
    name: 'Speak with Animals of its Kind (Ex)',
    type: 'Extraordinary Ability',
    minLevel: 'Wizard/Sorcerer 7th',
    summary: 'Familiar can communicate with normal animals of approximately the same kind.',
    rawRules: `If the master is 7th level or higher, a familiar can communicate with animals of approximately the same kind as itself (including dire variants): bats with bats, cats with felines, hawks and owls with birds, lizards and snakes with reptiles, monkeys with simians, rats with rodents, toads with amphibians, and weasels with mustelids.

Such communication is limited by the intelligence of the conversing creatures.`,
    source: "Player's Handbook p. 53",
  },
  spell_resistance: {
    name: 'Spell Resistance (Ex)',
    type: 'Extraordinary Ability',
    minLevel: 'Wizard/Sorcerer 11th',
    summary: "Familiar gains Spell Resistance equal to Master's Caster Level + 5.",
    rawRules: `If the master is 11th level or higher, a familiar gains spell resistance equal to the master's level + 5.

To affect the familiar with a spell, another spellcaster must get a result on a caster level check (1d20 + caster level) that equals or exceeds the familiar's spell resistance.`,
    source: "Player's Handbook p. 53",
  },
  scry_on_familiar: {
    name: 'Scry on Familiar (Sp)',
    type: 'Spell-Like Ability',
    minLevel: 'Wizard/Sorcerer 13th',
    summary: 'Master can scry on familiar once per day as if casting the scrying spell.',
    rawRules: `If the master is 13th level or higher, the master may scry on his familiar (as if casting the scrying spell) once per day.`,
    source: "Player's Handbook p. 53",
  },
};

export function getCompanionAbilityDetails(key: string): CompanionAbilityData {
  const normKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  if (COMPANION_ABILITIES_REGISTRY[normKey]) {
    return COMPANION_ABILITIES_REGISTRY[normKey];
  }
  for (const [k, v] of Object.entries(COMPANION_ABILITIES_REGISTRY)) {
    if (normKey.includes(k) || k.includes(normKey)) {
      return v;
    }
  }
  return {
    name: key,
    type: 'Special Ability',
    summary: `${key} is an extraordinary or supernatural ability granted by D&D 3.5e companion rules.`,
    rawRules: `${key} functions according to official D&D 3.5e rules.`,
    source: 'D&D 3.5e Core Rules',
  };
}
