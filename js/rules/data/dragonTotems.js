/**
 * @module    dragonTotems
 * @summary   Static D&D 3.5e Dragon Shaman totem dragon choices (PHB2 p. 13-14).
 * @feature   rules
 * @exports   DRAGON_TOTEMS, getValidTotemDragons
 */

export const DRAGON_TOTEMS = {
  black: {
    id: 'black',
    name: 'Black Dragon',
    nameDe: 'Schwarzer Drache',
    alignments: ['NE', 'CE', 'CN'],
    energy: 'acid',
    shape: 'line',
    breathName: 'Line of Acid',
    breathDesc: 'Line of acid (30 ft / 60 ft / 120 ft)',
    skills: ['hide', 'move_silently', 'swim'],
    adaptation: 'Water Breathing (Ex)',
    adaptationType: 'Ex',
    adaptationDesc: 'You can breathe underwater indefinitely and can freely use spells and other abilities underwater (always active).'
  },
  blue: {
    id: 'blue',
    name: 'Blue Dragon',
    nameDe: 'Blauer Drache',
    alignments: ['NE', 'LE', 'LN'],
    energy: 'electricity',
    shape: 'line',
    breathName: 'Line of Electricity',
    breathDesc: 'Line of electricity (30 ft / 60 ft / 120 ft)',
    skills: ['bluff', 'hide', 'spellcraft'],
    adaptation: 'Ventriloquism (Sp)',
    adaptationType: 'Sp',
    adaptationDesc: 'As the spell (at will).'
  },
  brass: {
    id: 'brass',
    name: 'Brass Dragon',
    nameDe: 'Messingdrache',
    alignments: ['NG', 'CG', 'CN'],
    energy: 'fire',
    shape: 'line',
    breathName: 'Line of Fire',
    breathDesc: 'Line of fire (30 ft / 60 ft / 120 ft)',
    skills: ['bluff', 'gather_information', 'survival'],
    adaptation: 'Endure Elements (Sp)',
    adaptationType: 'Sp',
    adaptationDesc: 'As the spell, except self only (at will).'
  },
  bronze: {
    id: 'bronze',
    name: 'Bronze Dragon',
    nameDe: 'Bronzedrache',
    alignments: ['NG', 'LG', 'LN'],
    energy: 'electricity',
    shape: 'line',
    breathName: 'Line of Electricity',
    breathDesc: 'Line of electricity (30 ft / 60 ft / 120 ft)',
    skills: ['disguise', 'survival', 'swim'],
    adaptation: 'Water Breathing (Ex)',
    adaptationType: 'Ex',
    adaptationDesc: 'You can breathe underwater indefinitely and can freely use spells and other abilities underwater (always active).'
  },
  copper: {
    id: 'copper',
    name: 'Copper Dragon',
    nameDe: 'Kupferdrache',
    alignments: ['NG', 'CG', 'CN'],
    energy: 'acid',
    shape: 'line',
    breathName: 'Line of Acid',
    breathDesc: 'Line of acid (30 ft / 60 ft / 120 ft)',
    skills: ['bluff', 'hide', 'jump'],
    adaptation: 'Spider Climb (Sp)',
    adaptationType: 'Sp',
    adaptationDesc: 'As the spell, except self only (at will).'
  },
  gold: {
    id: 'gold',
    name: 'Gold Dragon',
    nameDe: 'Golddrache',
    alignments: ['NG', 'LG', 'LN'],
    energy: 'fire',
    shape: 'cone',
    breathName: 'Cone of Fire',
    breathDesc: 'Cone of fire (15 ft / 30 ft / 60 ft)',
    skills: ['disguise', 'heal', 'swim'],
    adaptation: 'Water Breathing (Ex)',
    adaptationType: 'Ex',
    adaptationDesc: 'You can breathe underwater indefinitely and can freely use spells and other abilities underwater (always active).'
  },
  green: {
    id: 'green',
    name: 'Green Dragon',
    nameDe: 'Grüner Drache',
    alignments: ['NE', 'LE', 'LN'],
    energy: 'acid',
    shape: 'cone',
    breathName: 'Cone of Acid',
    breathDesc: 'Cone of acid (15 ft / 30 ft / 60 ft)',
    skills: ['bluff', 'hide', 'move_silently'],
    adaptation: 'Water Breathing (Ex)',
    adaptationType: 'Ex',
    adaptationDesc: 'You can breathe underwater indefinitely and can freely use spells and other abilities underwater (always active).'
  },
  red: {
    id: 'red',
    name: 'Red Dragon',
    nameDe: 'Roter Drache',
    alignments: ['NE', 'CE', 'CN'],
    energy: 'fire',
    shape: 'cone',
    breathName: 'Cone of Fire',
    breathDesc: 'Cone of fire (15 ft / 30 ft / 60 ft)',
    skills: ['appraise', 'bluff', 'jump'],
    adaptation: 'Treasure Seeker (Ex)',
    adaptationType: 'Ex',
    adaptationDesc: 'Gain a +5 competence bonus on Appraise and Search checks (always active).'
  },
  silver: {
    id: 'silver',
    name: 'Silver Dragon',
    nameDe: 'Silberdrache',
    alignments: ['NG', 'LG', 'LN'],
    energy: 'cold',
    shape: 'cone',
    breathName: 'Cone of Cold',
    breathDesc: 'Cone of cold (15 ft / 30 ft / 60 ft)',
    skills: ['bluff', 'disguise', 'jump'],
    adaptation: 'Feather Fall (Sp)',
    adaptationType: 'Sp',
    adaptationDesc: 'As the spell, except self only (at will).'
  },
  white: {
    id: 'white',
    name: 'White Dragon',
    nameDe: 'Weißer Drache',
    alignments: ['NE', 'CE', 'CN'],
    energy: 'cold',
    shape: 'cone',
    breathName: 'Cone of Cold',
    breathDesc: 'Cone of cold (15 ft / 30 ft / 60 ft)',
    skills: ['hide', 'move_silently', 'swim'],
    adaptation: 'Icewalker (Ex)',
    adaptationType: 'Ex',
    adaptationDesc: 'You can walk across icy surfaces without reducing your speed or making Balance checks (always active).'
  }
};

/**
 * Checks if a totem dragon is acceptable for the character's alignment.
 * If no alignment or neutral, any dragon is allowed or within one step.
 */
export function isTotemAllowedForAlignment(totemKey, alignment) {
  const totem = DRAGON_TOTEMS[totemKey];
  if (!totem) return false;
  if (!alignment) return true;
  let norm = alignment.toUpperCase().trim();
  if (norm === 'NEUTRAL' || norm === 'TRUE NEUTRAL' || norm === 'NEUTRAL NEUTRAL') {
    return false;
  }
  const fullMap = {
    'LAWFUL GOOD': 'LG',
    'NEUTRAL GOOD': 'NG',
    'CHAOTIC GOOD': 'CG',
    'LAWFUL NEUTRAL': 'LN',
    'CHAOTIC NEUTRAL': 'CN',
    'LAWFUL EVIL': 'LE',
    'NEUTRAL EVIL': 'NE',
    'CHAOTIC EVIL': 'CE'
  };
  if (fullMap[norm]) {
    norm = fullMap[norm];
  } else if (norm.length > 2) {
    const parts = norm.split(/\s+/);
    if (parts.length >= 2) {
      norm = parts[0][0] + parts[1][0];
    }
  }

  if (norm === 'NN' || norm === 'N') return false;

  return totem.alignments.includes(norm) || totem.alignments.some(a => {
    // Check if within one step
    // Law/Chaos step and Good/Evil step
    const lc1 = norm[0];
    const ge1 = norm[1] || norm[0];
    const lc2 = a[0];
    const ge2 = a[1] || a[0];
    const stepLC = lc1 === lc2 ? 0 : ((lc1 === 'N' || lc2 === 'N') ? 1 : 2);
    const stepGE = ge1 === ge2 ? 0 : ((ge1 === 'N' || ge2 === 'N') ? 1 : 2);
    return stepLC + stepGE <= 1;
  });
}
