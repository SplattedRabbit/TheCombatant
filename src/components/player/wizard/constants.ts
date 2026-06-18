export interface RaceDetail {
  key: string;
  name: string;
  modifiers: string;
  size: 'Medium' | 'Small';
  traits: string[];
}

export const translatePrereq = (desc: string): string => {
  if (!desc) return '';
  let res = desc;
  res = res.replace(/Grundangriffsbonus/g, 'Base Attack Bonus');
  res = res.replace(/aktuell/g, 'current');
  res = res.replace(/Talent:/g, 'Feat:');
  res = res.replace(/Stufe/g, 'Level');
  res = res.replace(/Stärke/g, 'Strength');
  res = res.replace(/Geschicklichkeit/g, 'Dexterity');
  res = res.replace(/Konstitution/g, 'Constitution');
  res = res.replace(/Intelligenz/g, 'Intelligence');
  res = res.replace(/Weisheit/g, 'Wisdom');
  res = res.replace(/Charisma/g, 'Charisma');
  res = res.replace(/Charakterstufe/g, 'Character Level');
  res = res.replace(/Zaubererstufe/g, 'Caster Level');
  res = res.replace(/Klasse:/g, 'Class:');
  res = res.replace(/Fähigkeit, Untote zu vertreiben/g, 'Ability to turn undead');
  res = res.replace(/Kleriker/g, 'Cleric');
  res = res.replace(/Paladin/g, 'Paladin');
  res = res.replace(/Bardenmusik/g, 'Bardic music');
  res = res.replace(/Barde/g, 'Bard');
  res = res.replace(/Tiergestalt/g, 'Wild Shape');
  res = res.replace(/Druide/g, 'Druid');
  res = res.replace(/Reiten 1 Rang/g, 'Ride 1 rank');
  
  res = res.replace(/\bfighter\b/g, 'Fighter');
  res = res.replace(/\brogue\b/g, 'Rogue');
  res = res.replace(/\bcleric\b/g, 'Cleric');
  res = res.replace(/\bwizard\b/g, 'Wizard');
  res = res.replace(/\bbarbarian\b/g, 'Barbarian');
  res = res.replace(/\bbard\b/g, 'Bard');
  res = res.replace(/\bdruid\b/g, 'Druid');
  res = res.replace(/\bmonk\b/g, 'Monk');
  res = res.replace(/\bpaladin\b/g, 'Paladin');
  res = res.replace(/\branger\b/g, 'Ranger');
  res = res.replace(/\bsorcerer\b/g, 'Sorcerer');

  return res;
};

export const RACES: RaceDetail[] = [
  {
    key: 'human',
    name: 'Human',
    modifiers: 'No modifiers',
    size: 'Medium',
    traits: [
      'Bonus feat at level 1.',
      '4 extra skill points at level 1, plus 1 extra point at each additional level.',
      'No ability penalties.'
    ]
  },
  {
    key: 'elf',
    name: 'Elf',
    modifiers: '+2 Dexterity (DEX), -2 Constitution (CON)',
    size: 'Medium',
    traits: [
      '+2 racial bonus on Listen, Search, and Spot checks.',
      'Immunity to magic sleep effects.',
      '+2 racial bonus on saving throws against enchantment spells or effects.',
      'Weapon Proficiency: Longsword, rapier, longbow, and shortbow.'
    ]
  },
  {
    key: 'dwarf',
    name: 'Dwarf',
    modifiers: '+2 Constitution (CON), -2 Charisma (CHA)',
    size: 'Medium',
    traits: [
      'Darkvision 60 ft. (can see in the dark).',
      '+2 racial bonus on saving throws against poisons, spells, and spell-like effects.',
      '+2 racial bonus on Craft checks related to stone and metal.',
      'Stability (+4 bonus on ability checks made to resist being bull rushed or tripped).'
    ]
  },
  {
    key: 'gnome',
    name: 'Gnome',
    modifiers: '+2 Constitution (CON), -2 Strength (STR)',
    size: 'Small',
    traits: [
      'Size: Small (+1 bonus to Armor Class, +1 bonus on attack rolls, +4 bonus on Hide checks).',
      '+2 racial bonus on Listen and Craft (alchemy) checks.',
      '+1 racial bonus on saving throws against illusions.',
      '+1 racial attack bonus against kobolds and goblins.'
    ]
  },
  {
    key: 'halfling',
    name: 'Halfling',
    modifiers: '+2 Dexterity (DEX), -2 Strength (STR)',
    size: 'Small',
    traits: [
      'Size: Small (+1 bonus to Armor Class, +1 bonus on attack rolls, +4 bonus on Hide checks).',
      '+2 racial bonus on Climb, Jump, Listen, and Move Silently checks.',
      '+1 racial bonus on all saving throws.',
      '+2 racial bonus on saving throws against fear.'
    ]
  },
  {
    key: 'half_elf',
    name: 'Half-Elf',
    modifiers: 'No modifiers',
    size: 'Medium',
    traits: [
      'Immunity to magic sleep effects.',
      '+2 racial bonus on saving throws against enchantment spells or effects.',
      '+1 racial bonus on Listen, Search, and Spot checks.',
      '+2 racial bonus on Diplomacy and Gather Information checks.'
    ]
  },
  {
    key: 'half_orc',
    name: 'Half-Orc',
    modifiers: '+2 Strength (STR), -2 Intelligence (INT), -2 Charisma (CHA)',
    size: 'Medium',
    traits: [
      'Darkvision 60 ft. (can see in the dark).',
      'Particularly strong, but has lower mental stats.'
    ]
  },
  {
    key: 'tiefling',
    name: 'Tiefling',
    modifiers: '+2 Dexterity (DEX), +2 Intelligence (INT), -2 Charisma (CHA)',
    size: 'Medium',
    traits: [
      'Type: Outsider (Native) (immune to person-targeting spells like Charm Person).',
      'Darkvision 60 ft. (can see in the dark).',
      'Resistances: Resistance to cold 5, electricity 5, and fire 5.',
      '+2 racial bonus on Bluff and Hide checks.',
      'Darkness: Can use Darkness as a spell-like ability 1/day.',
      'Level Adjustment: +1 (increases ECL by 1).'
    ]
  }
];

export const CLASS_KEY_ATTRIBUTES: Record<string, string[]> = {
  fighter: ['str', 'con', 'dex'],
  rogue: ['dex', 'int'],
  cleric: ['wis', 'cha', 'con'],
  wizard: ['int', 'con', 'dex'],
  barbarian: ['str', 'con', 'dex'],
  bard: ['cha', 'dex', 'int'],
  druid: ['wis', 'con'],
  monk: ['wis', 'dex', 'str', 'con'],
  paladin: ['cha', 'str', 'wis', 'con'],
  ranger: ['dex', 'str', 'wis'],
  sorcerer: ['cha', 'dex', 'con']
};

export const CLASSES_LIST = [
  { key: 'fighter', name: 'Fighter', hd: 10, skillBase: 2, desc: 'Melee combat specialist, gains many bonus feats.' },
  { key: 'rogue', name: 'Rogue', hd: 6, skillBase: 8, desc: 'Trap disarmer, sneak attack, extremely high number of skills.' },
  { key: 'cleric', name: 'Cleric', hd: 8, skillBase: 2, desc: 'Divine spellcaster, armor wearer, turn undead.' },
  { key: 'wizard', name: 'Wizard', hd: 4, skillBase: 2, desc: 'Arcane spellcaster with a spellbook, powerful spells.' },
  { key: 'barbarian', name: 'Barbarian', hd: 12, skillBase: 2, desc: 'Tough warrior in a rage, high hit die.' },
  { key: 'bard', name: 'Bard', hd: 6, skillBase: 4, desc: 'Supporter with songs, spells, and versatile abilities.' },
  { key: 'druid', name: 'Druid', hd: 8, skillBase: 4, desc: 'Nature spellcaster, wild shape transformation, animal companion.' },
  { key: 'monk', name: 'Monk', hd: 8, skillBase: 4, desc: 'Unarmed martial artist, high AC, and fast movement.' },
  { key: 'paladin', name: 'Paladin', hd: 10, skillBase: 2, desc: 'Holy warrior, lay on hands, immunities.' },
  { key: 'ranger', name: 'Ranger', hd: 8, skillBase: 6, desc: 'Tracker, favored enemy, two-weapon fighting or archery.' },
  { key: 'sorcerer', name: 'Sorcerer', hd: 4, skillBase: 2, desc: 'Spontaneous arcane spellcaster with innate magic.' },
  { key: 'mystic_theurge', name: 'Mystic Theurge', hd: 4, skillBase: 2, desc: 'Master of both arcane and divine magic.', isPrestige: true },
  { key: 'arcane_trickster', name: 'Arcane Trickster', hd: 4, skillBase: 4, desc: 'Combines magic with rogue abilities.', isPrestige: true },
  { key: 'dragon_disciple', name: 'Dragon Disciple', hd: 12, skillBase: 2, desc: 'Awakens draconic blood for physical power.', isPrestige: true },
  { key: 'assassin', name: 'Assassin', hd: 6, skillBase: 4, desc: 'Master of stealth, anatomy, and lethal strikes.', isPrestige: true }
];


