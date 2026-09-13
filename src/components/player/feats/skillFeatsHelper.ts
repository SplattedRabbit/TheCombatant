/**
 * @module    skillFeatsHelper
 * @summary   Utilities for Skill Feats categorization and Dragon Totem prerequisites binding.
 */

import { DRAGON_TOTEMS } from '../../../../js/rules/data/dragonTotems.js';
import type { DragonTotemDef } from '../../../../js/rules/data/dragonTotems.js';
import { SKILLS_REGISTRY } from '../../../../js/data/skills-data.js';

export const SKILL_BOOSTER_FEATS: Record<string, string[]> = {
  acrobatic: ['jump', 'tumble'],
  agile: ['balance', 'escape_artist'],
  alertness: ['listen', 'spot'],
  animal_affinity: ['handle_animal', 'ride'],
  athletic: ['climb', 'swim'],
  deceitful: ['disguise', 'forgery'],
  deft_hands: ['sleight_of_hand', 'use_rope'],
  diligent: ['appraise', 'decipher_script'],
  investigator: ['gather_information', 'search'],
  magical_aptitude: ['spellcraft', 'use_magic_device'],
  negotiator: ['diplomacy', 'sense_motive'],
  nimble_fingers: ['open_lock', 'disable_device'],
  persuasive: ['bluff', 'intimidate'],
  self_sufficient: ['heal', 'survival'],
  stealthy: ['hide', 'move_silently']
};

export const DRAGON_SHAMAN_BASE_SKILLS: string[] = [
  'climb',
  'craft',
  'handle_animal',
  'intimidate',
  'knowledge_arcana',
  'knowledge_nature',
  'search',
  'survival'
];

export interface FeatLike {
  id: string;
  category?: string;
  hasOption?: boolean;
  optionType?: string;
  prereqs?: Array<{ type: string; name?: string; skill?: string }>;
  [key: string]: unknown;
}

/**
 * Determines if a feat is a true Skill Feat (Skill Focus, the 15 core +2/+2 skill feats, or skill options).
 */
export function isSkillFeat(feat: FeatLike): boolean {
  if (!feat || !feat.id) return false;
  if (feat.id === 'skill_focus') return true;
  if (Boolean(SKILL_BOOSTER_FEATS[feat.id])) return true;
  if (feat.category === 'skill') return true;
  if (feat.hasOption && feat.optionType === 'skill') return true;
  return false;
}

/**
 * Resolves the 3 class skills granted by the character's Dragon Totem.
 */
export function getTotemSkills(totemKey?: string): string[] {
  if (!totemKey) return [];
  const totem: DragonTotemDef | undefined = DRAGON_TOTEMS[totemKey];
  return totem?.skills || [];
}

/**
 * Resolves all Dragon Shaman class skills (base 8 + 3 totem skills).
 */
export function getDragonShamanClassSkills(totemKey?: string): string[] {
  const totemSkills = getTotemSkills(totemKey);
  const combined = new Set<string>([...DRAGON_SHAMAN_BASE_SKILLS, ...totemSkills]);
  return Array.from(combined);
}

/**
 * Checks whether a feat specifically boosts any of the skills of the chosen Dragon Totem.
 */
export function isTotemFeat(feat: FeatLike, totemKey?: string): boolean {
  if (!totemKey || !feat || !feat.id) return false;
  const totemSkills = getTotemSkills(totemKey);
  if (totemSkills.length === 0) return false;

  // Skill Focus can always be taken for a totem skill
  if (feat.id === 'skill_focus') return true;

  // Check if any of the boosted skills match the totem skills
  const boosted = SKILL_BOOSTER_FEATS[feat.id];
  if (boosted && boosted.some((s) => totemSkills.includes(s))) {
    return true;
  }

  return false;
}

/**
 * Normalizes an option string (e.g. "Jump", "Akrobatik (Tumble)", "Move Silently") to a canonical skill key.
 */
export function normalizeSkillKey(opt?: string): string {
  if (!opt) return '';
  const s = opt.toLowerCase().trim();
  const parenMatch = s.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    return parenMatch[1].toLowerCase().trim().replace(/\s+/g, '_');
  }
  return s.replace(/\s+/g, '_');
}

/**
 * Formats a skill key into a clean, human-readable display name.
 */
export function formatSkillName(skillKey: string): string {
  const def = SKILLS_REGISTRY[skillKey];
  if (def && typeof def === 'object') {
    const rawDef = def as { nameEn?: string; nameDe?: string; name?: string };
    if (rawDef.nameEn) return rawDef.nameEn;
    if (rawDef.name) return rawDef.name;
    if (rawDef.nameDe) return rawDef.nameDe;
  }
  return skillKey
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
