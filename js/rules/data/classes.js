/**
 * @module    classes
 * @summary   Static D&D 3.5e character class definitions (Core, PHB2, Complete Adventurer, Prestige).
 * @feature   rules
 * @exports   CLASSES
 */

export const CLASSES = [
  // ── Core (PHB) ──────────────────────────────────────────────────────────
  { key: 'fighter',      nameDe: 'Fighter',      nameEn: 'Fighter',      hitDie: 10, hd: 10, bab: 'good', saves: { fort: 'good', ref: 'poor', wil: 'poor' }, source: 'phb' },
  { key: 'cleric',       nameDe: 'Cleric',        nameEn: 'Cleric',       hitDie: 8,  hd: 8,  bab: 'avg',  saves: { fort: 'good', ref: 'poor', wil: 'good' }, source: 'phb' },
  { key: 'rogue',        nameDe: 'Rogue',         nameEn: 'Rogue',        hitDie: 6,  hd: 6,  bab: 'avg',  saves: { fort: 'poor', ref: 'good', wil: 'poor' }, source: 'phb' },
  { key: 'wizard',       nameDe: 'Wizard',        nameEn: 'Wizard',       hitDie: 4,  hd: 4,  bab: 'poor', saves: { fort: 'poor', ref: 'poor', wil: 'good' }, source: 'phb' },
  { key: 'barbarian',    nameDe: 'Barbarian',     nameEn: 'Barbarian',    hitDie: 12, hd: 12, bab: 'good', saves: { fort: 'good', ref: 'poor', wil: 'poor' }, source: 'phb' },
  { key: 'bard',         nameDe: 'Bard',          nameEn: 'Bard',         hitDie: 6,  hd: 6,  bab: 'avg',  saves: { fort: 'poor', ref: 'good', wil: 'good' }, source: 'phb' },
  { key: 'druid',        nameDe: 'Druid',         nameEn: 'Druid',        hitDie: 8,  hd: 8,  bab: 'avg',  saves: { fort: 'good', ref: 'poor', wil: 'good' }, source: 'phb' },
  { key: 'monk',         nameDe: 'Monk',          nameEn: 'Monk',         hitDie: 8,  hd: 8,  bab: 'avg',  saves: { fort: 'good', ref: 'good', wil: 'good' }, source: 'phb' },
  { key: 'paladin',      nameDe: 'Paladin',       nameEn: 'Paladin',      hitDie: 10, hd: 10, bab: 'good', saves: { fort: 'good', ref: 'poor', wil: 'poor' }, source: 'phb' },
  { key: 'ranger',       nameDe: 'Ranger',        nameEn: 'Ranger',       hitDie: 8,  hd: 8,  bab: 'good', saves: { fort: 'good', ref: 'good', wil: 'poor' }, source: 'phb' },
  { key: 'sorcerer',     nameDe: 'Sorcerer',      nameEn: 'Sorcerer',     hitDie: 4,  hd: 4,  bab: 'poor', saves: { fort: 'poor', ref: 'poor', wil: 'good' }, source: 'phb' },
  // ── Player's Handbook II ─────────────────────────────────────────────────
  { key: 'duskblade',     nameDe: 'Duskblade',    nameEn: 'Duskblade',    hitDie: 8,  hd: 8,  bab: 'good', saves: { fort: 'good', ref: 'poor', wil: 'good' }, source: 'phb2', isCaster: true,  castingType: 'arcane', castingStat: 'int' },
  { key: 'beguiler',      nameDe: 'Beguiler',     nameEn: 'Beguiler',     hitDie: 6,  hd: 6,  bab: 'avg',  saves: { fort: 'poor', ref: 'good', wil: 'good' }, source: 'phb2', isCaster: true,  castingType: 'arcane', castingStat: 'int' },
  { key: 'knight',        nameDe: 'Knight',       nameEn: 'Knight',       hitDie: 12, hd: 12, bab: 'good', saves: { fort: 'good', ref: 'poor', wil: 'poor' }, source: 'phb2', isCaster: false },
  { key: 'dragon_shaman', nameDe: 'Dragon Shaman',nameEn: 'Dragon Shaman',hitDie: 10, hd: 10, bab: 'avg',  saves: { fort: 'good', ref: 'poor', wil: 'good' }, source: 'phb2', isCaster: false },
  // ── Complete Adventurer ──────────────────────────────────────────────────
  { key: 'ninja',         nameDe: 'Ninja',        nameEn: 'Ninja',        hitDie: 6,  hd: 6,  bab: 'avg',  saves: { fort: 'poor', ref: 'good', wil: 'poor' }, source: 'ca',   isCaster: false },
  { key: 'scout',         nameDe: 'Scout',        nameEn: 'Scout',        hitDie: 8,  hd: 8,  bab: 'avg',  saves: { fort: 'poor', ref: 'good', wil: 'poor' }, source: 'ca',   isCaster: false },
  { key: 'spellthief',    nameDe: 'Spellthief',   nameEn: 'Spellthief',   hitDie: 6,  hd: 6,  bab: 'avg',  saves: { fort: 'poor', ref: 'good', wil: 'poor' }, source: 'ca',   isCaster: false },
  {
    key: 'mystic_theurge',
    name: 'Mystic Theurge',
    nameDe: 'Mystic Theurge',
    nameEn: 'Mystic Theurge',
    isPrestige: true,
    hitDie: 4,
    hd: 4,
    bab: 'poor',
    saves: { fort: 'poor', ref: 'poor', wil: 'good' },
    spellcastingBonus: true,
    prerequisites: {
      skills: { knowledge_arcana: 6, knowledge_religion: 6 },
      spells: { arcane: 2, divine: 2 }
    }
  },
  {
    key: 'arcane_trickster',
    name: 'Arcane Trickster',
    nameDe: 'Arcane Trickster',
    nameEn: 'Arcane Trickster',
    isPrestige: true,
    hitDie: 4,
    hd: 4,
    bab: 'poor',
    saves: { fort: 'poor', ref: 'good', wil: 'good' },
    spellcastingBonus: true,
    prerequisites: {
      alignment: 'nonlawful',
      skills: { decipher_script: 7, disable_device: 7, escape_artist: 7, knowledge_arcana: 4 },
      spells: { arcane: 3, mage_hand: true },
      special: { sneak_attack: 2 }
    }
  },
  {
    key: 'dragon_disciple',
    name: 'Dragon Disciple',
    nameDe: 'Dragon Disciple',
    nameEn: 'Dragon Disciple',
    isPrestige: true,
    hitDie: 12,
    hd: 12,
    bab: 'avg',
    saves: { fort: 'good', ref: 'poor', wil: 'good' },
    spellcastingBonus: false,
    prerequisites: {
      race: 'nondragon',
      skills: { knowledge_arcana: 8 },
      languages: ['draconic'],
      spells: { spontaneousArcane: true }
    }
  },
  {
    key: 'assassin',
    name: 'Assassin',
    nameDe: 'Assassin',
    nameEn: 'Assassin',
    isPrestige: true,
    hitDie: 6,
    hd: 6,
    bab: 'avg',
    saves: { fort: 'poor', ref: 'good', wil: 'poor' },
    spellcastingBonus: false,
    prerequisites: {
      alignment: 'evil',
      skills: { disguise: 4, hide: 8, move_silently: 8 },
      specialText: 'Must kill someone for no other reason than to join.'
    }
  },

  // Complete Scoundrel — small pilot of two PrCs requested by the user
  {
    key: 'spellwarp_sniper',
    nameDe: 'Spellwarp Sniper',
    nameEn: 'Spellwarp Sniper',
    isPrestige: true,
    maxLevel: 5,
    hitDie: 6,
    hd: 6,
    bab: 'poor',
    saves: { fort: 'poor', ref: 'poor', wil: 'good' },
    spellcastingBonus: true,
    prerequisites: {
      skills: { concentration: 8, spellcraft: 8 },
      feats: ['point_blank_shot'],
      spells: { arcane: 3 },
      // The book says "Sneak attack or sudden strike +1d6"; we represent the mechanical requirement as sneak attack +1d6.
      special: { sneak_attack: 1 }
    }
  },

  {
    key: 'battle_trickster',
    nameDe: 'Battle Trickster',
    nameEn: 'Battle Trickster',
    isPrestige: true,
    maxLevel: 3,
    hitDie: 10,
    hd: 10,
    bab: 'avg',
    saves: { fort: 'good', ref: 'good', wil: 'poor' },
    spellcastingBonus: false,
    prerequisites: {
      bab: 5,
      // Requirements are not easily machine-checkable: "Any three skills 6 ranks each" and "Skill Tricks: Any two".
      // We surface these as a free-text specialText requirement so the UI can present a confirmation dialog.
      specialText: 'Skills: Any three skills with 6 ranks each. Skill Tricks: Any two.'
    }
  },

  // Complete Adventurer Prestige Classes
  {
    key: 'shadowbane_inquisitor',
    name: 'Shadowbane Inquisitor',
    nameDe: 'Shadowbane Inquisitor',
    nameEn: 'Shadowbane Inquisitor',
    isPrestige: true,
    source: 'ca',
    hitDie: 10,
    hd: 10,
    skillBase: 4,
    bab: 'good',
    saves: { fort: 'good', ref: 'poor', wil: 'poor' },
    spellcastingBonus: false,
    prerequisites: {
      alignment: 'lawful_good',
      bab: 5,
      skills: {
        gather_information: 4,
        knowledge_religion: 2,
        sense_motive: 8
      },
      feats: ['power_attack'],
      attributes: {
        str: 13
      },
      special: {
        detect_evil: true,
        turn_undead: true,
        sneak_attack: 1
      }
    }
  },

  // ── Prestige Classes ─────────────────────────────────────────────────────
  // (prestige classes retain their existing definitions below)

  { key: 'custom', nameDe: 'Custom', nameEn: 'Custom', hitDie: 8, hd: 8, bab: 'custom', saves: { fort: 'custom', ref: 'custom', wil: 'custom' }, source: 'phb' }
];
