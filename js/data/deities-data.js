/**
 * @module    deities-data
 * @summary   D&D 3.5e Core Deities (Greyhawk Pantheon) with alignments, domains, and favored weapons.
 * @exports   DEITIES_REGISTRY, isAlignmentWithinOneStep, getDeitiesForAlignment
 */

export const ALIGNMENT_COORDINATES = {
  LG: { x: 0, y: 0 },
  NG: { x: 1, y: 0 },
  CG: { x: 2, y: 0 },
  LN: { x: 0, y: 1 },
  N:  { x: 1, y: 1 },
  TN: { x: 1, y: 1 },
  CN: { x: 2, y: 1 },
  LE: { x: 0, y: 2 },
  NE: { x: 1, y: 2 },
  CE: { x: 2, y: 2 }
};

export function normalizeAlignmentCode(align) {
  if (!align || typeof align !== 'string') return 'N';
  const clean = align.trim().toUpperCase();
  if (clean === 'TN' || clean === 'TRUE NEUTRAL' || clean === 'NEUTRAL') return 'N';
  if (clean === 'LAWFUL GOOD') return 'LG';
  if (clean === 'NEUTRAL GOOD') return 'NG';
  if (clean === 'CHAOTIC GOOD') return 'CG';
  if (clean === 'LAWFUL NEUTRAL') return 'LN';
  if (clean === 'CHAOTIC NEUTRAL') return 'CN';
  if (clean === 'LAWFUL EVIL') return 'LE';
  if (clean === 'NEUTRAL EVIL') return 'NE';
  if (clean === 'CHAOTIC EVIL') return 'CE';
  return clean;
}

/**
 * Validates the D&D 3.5e RAW "One-Step Rule":
 * A cleric's alignment must be within one step of their deity's alignment along either the law/chaos or good/evil axis.
 */
export function isAlignmentWithinOneStep(clericAlign, deityAlign) {
  const cNorm = normalizeAlignmentCode(clericAlign);
  const dNorm = normalizeAlignmentCode(deityAlign);

  if (dNorm === 'ANY') return true;

  const cCoord = ALIGNMENT_COORDINATES[cNorm] || ALIGNMENT_COORDINATES.N;
  const dCoord = ALIGNMENT_COORDINATES[dNorm] || ALIGNMENT_COORDINATES.N;

  const stepDistance = Math.abs(cCoord.x - dCoord.x) + Math.abs(cCoord.y - dCoord.y);
  return stepDistance <= 1;
}

export const DEITIES_REGISTRY = {
  pelor: {
    id: 'pelor',
    name: 'Pelor',
    title: 'The Shining One',
    alignment: 'NG',
    domains: ['good', 'healing', 'strength', 'sun'],
    favoredWeapon: 'heavy_mace',
    description: 'God of Sun, Light, Strength, and Healing. Worshiped by paladins, rangers, and healers.'
  },
  kord: {
    id: 'kord',
    name: 'Kord',
    title: 'The Brawler',
    alignment: 'CG',
    domains: ['chaos', 'good', 'luck', 'strength'],
    favoredWeapon: 'greatsword',
    description: 'God of Athletics, Sports, Brawling, and Strength. Exalts personal prowess and honorable combat.'
  },
  moradin: {
    id: 'moradin',
    name: 'Moradin',
    title: 'The Soul Forger',
    alignment: 'LG',
    domains: ['earth', 'good', 'law', 'protection'],
    favoredWeapon: 'warhammer',
    description: 'Patron deity of Dwarves, creation, metallurgy, smithing, and engineering.'
  },
  heironeous: {
    id: 'heironeous',
    name: 'Heironeous',
    title: 'The Invincible',
    alignment: 'LG',
    domains: ['good', 'law', 'war'],
    favoredWeapon: 'longsword',
    description: 'God of Chivalry, Justice, Honor, Valor, and Righteous War.'
  },
  st_cuthbert: {
    id: 'st_cuthbert',
    name: 'St. Cuthbert',
    title: 'Of the Cudgel',
    alignment: 'LN',
    domains: ['destruction', 'law', 'protection', 'strength'],
    favoredWeapon: 'heavy_mace',
    description: 'God of Common Sense, Wisdom, Zeal, Honesty, and Retribution.'
  },
  wee_jas: {
    id: 'wee_jas',
    name: 'Wee Jas',
    title: 'The Ruby Sorceress',
    alignment: 'LN',
    domains: ['death', 'law', 'magic'],
    favoredWeapon: 'dagger',
    description: 'Goddess of Magic, Death, Vanity, and Law. Oversees the passage from life into eternity.'
  },
  boccob: {
    id: 'boccob',
    name: 'Boccob',
    title: 'The Uncaring',
    alignment: 'N',
    domains: ['knowledge', 'magic', 'trickery'],
    favoredWeapon: 'quarterstaff',
    description: 'God of Magic, Arcane Knowledge, Balance, and Foresight.'
  },
  fharlanghn: {
    id: 'fharlanghn',
    name: 'Fharlanghn',
    title: 'Dweller on the Horizon',
    alignment: 'N',
    domains: ['luck', 'protection', 'travel'],
    favoredWeapon: 'quarterstaff',
    description: 'God of Horizons, Distance, Travel, Roads, and Pilgrimages.'
  },
  obad_hai: {
    id: 'obad_hai',
    name: 'Obad-Hai',
    title: 'The Shalm',
    alignment: 'N',
    domains: ['air', 'animal', 'earth', 'fire', 'plant', 'water'],
    favoredWeapon: 'quarterstaff',
    description: 'God of Nature, Woodlands, Freedom, Hunting, and the Wild Beasts.'
  },
  olidammara: {
    id: 'olidammara',
    name: 'Olidammara',
    title: 'The Laughing Rogue',
    alignment: 'CN',
    domains: ['chaos', 'luck', 'trickery'],
    favoredWeapon: 'rapier',
    description: 'God of Rogues, Thieves, Music, Revelry, Wine, and Humor.'
  },
  ehlonna: {
    id: 'ehlonna',
    name: 'Ehlonna',
    title: 'Of the Forests',
    alignment: 'NG',
    domains: ['animal', 'good', 'plant', 'sun'],
    favoredWeapon: 'longbow',
    description: 'Goddess of the Forests, Woodlands, Flora, Fauna, and Fertility.'
  },
  hextor: {
    id: 'hextor',
    name: 'Hextor',
    title: 'Champion of Evil',
    alignment: 'LE',
    domains: ['destruction', 'evil', 'law', 'war'],
    favoredWeapon: 'heavy_flail',
    description: 'God of Tyranny, Cruelty, War, Discord, and Total Domination.'
  },
  nerull: {
    id: 'nerull',
    name: 'Nerull',
    title: 'The Reaper',
    alignment: 'NE',
    domains: ['death', 'evil', 'trickery'],
    favoredWeapon: 'scythe',
    description: 'God of Death, Darkness, Murder, and the Underworld.'
  },
  vecna: {
    id: 'vecna',
    name: 'Vecna',
    title: 'The Maimed Lord',
    alignment: 'NE',
    domains: ['evil', 'knowledge', 'magic'],
    favoredWeapon: 'dagger',
    description: 'God of Secrets, Forbidden Lore, Arcane Conspiracy, and Necromancy.'
  },
  erythnul: {
    id: 'erythnul',
    name: 'Erythnul',
    title: 'The Many',
    alignment: 'CE',
    domains: ['chaos', 'evil', 'trickery', 'war'],
    favoredWeapon: 'morningstar',
    description: 'God of Hate, Envy, Malice, Panic, and Wholesale Slaughter.'
  },
  gruumsh: {
    id: 'gruumsh',
    name: 'Gruumsh',
    title: 'One-Eye',
    alignment: 'CE',
    domains: ['chaos', 'evil', 'strength', 'war'],
    favoredWeapon: 'spear',
    description: 'Chief God of Orcs, conquest, survival, and overwhelming physical strength.'
  },
  corellon_larethian: {
    id: 'corellon_larethian',
    name: 'Corellon Larethian',
    title: 'Creator of the Elves',
    alignment: 'CG',
    domains: ['chaos', 'good', 'protection', 'war'],
    favoredWeapon: 'longsword',
    description: 'Chief God of Elves, magic, music, arts, crafts, and archery.'
  },
  garl_glittergold: {
    id: 'garl_glittergold',
    name: 'Garl Glittergold',
    title: 'The Joker',
    alignment: 'NG',
    domains: ['good', 'protection', 'trickery'],
    favoredWeapon: 'battleaxe',
    description: 'Chief God of Gnomes, humor, wit, illusion, and gemcutting.'
  },
  yondalla: {
    id: 'yondalla',
    name: 'Yondalla',
    title: 'The Blessed One',
    alignment: 'LG',
    domains: ['good', 'law', 'protection'],
    favoredWeapon: 'short_sword',
    description: 'Chief Goddess of Halflings, family, hearth, protection, and fertility.'
  },
  none: {
    id: 'none',
    name: 'No Deity / Abstract Cause',
    title: 'Philosophy, Ideal, or Pantheon',
    alignment: 'ANY',
    domains: [
      'air', 'animal', 'chaos', 'death', 'destruction', 'earth', 'evil', 'fire',
      'good', 'healing', 'knowledge', 'law', 'luck', 'magic', 'plant', 'protection',
      'strength', 'sun', 'travel', 'trickery', 'war', 'water'
    ],
    favoredWeapon: 'heavy_mace',
    description: 'A cleric devoted to an ideal, philosophy, or the cosmic forces of alignment rather than a specific deity.'
  }
};

export function getDeitiesForAlignment(alignment) {
  const cNorm = normalizeAlignmentCode(alignment);
  return Object.values(DEITIES_REGISTRY).filter(d => isAlignmentWithinOneStep(cNorm, d.alignment));
}

export function getDeity(deityId) {
  if (!deityId) return null;
  const key = String(deityId).toLowerCase().trim();
  return DEITIES_REGISTRY[key] || Object.values(DEITIES_REGISTRY).find(d => d.name.toLowerCase() === key) || null;
}
