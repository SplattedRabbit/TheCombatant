/**
 * @module    spellSelectionRules
 * @summary   D&D 3.5e RAW rules and quota calculator for wizard/sorcerer/bard spell selection.
 */

import {
  SORCERER_KNOWN_TABLE,
  BARD_KNOWN_TABLE,
} from '@core/rules/RulesData.js';
import { getMaxSpellLevel, getSpellClassLevels, isWizardProhibitedSchool } from '@core/rules/RulesSpells.js';
import { getAllCompendiumSpells } from '@core/rules.js';

export interface SpellQuotaInfo {
  isCaster: boolean;
  quota: number;
  label: string;
  maxSpellLevel: number;
  autoCantrips: boolean;
  allowedSpellLevels: number[];
}

import { CLASSES } from '@core/rules/RulesData.js';

export function isSpellSelectorClass(classType: string): boolean {
  if (['wizard', 'sorcerer', 'bard', 'duskblade', 'spellthief', 'assassin'].includes(classType)) return true;
  const clsDef = CLASSES?.find(c => c.key === classType);
  if (clsDef && clsDef.spellcastingBonus) return true;
  return false;
}

/**
 * Calculates how many new spells a character must/can select on a specific class level.
 */
export function getSpellSelectionQuota(
  classType: string,
  classLevel: number,
  intMod: number = 0
): SpellQuotaInfo {
  if (!isSpellSelectorClass(classType) || classLevel < 1) {
    return { isCaster: false, quota: 0, label: '', maxSpellLevel: -1, autoCantrips: false, allowedSpellLevels: [] };
  }

  const maxLvl = getMaxSpellLevel(classType, classLevel);

  // 1. WIZARD
  if (classType === 'wizard') {
    if (classLevel === 1) {
      const quota = 3 + Math.max(0, intMod);
      return {
        isCaster: true,
        quota,
        label: `Select 3 + INT (+${Math.max(0, intMod)}) = ${quota} starting 1st-level spells (All 0-level cantrips automatically added to spellbook).`,
        maxSpellLevel: 1,
        autoCantrips: true,
        allowedSpellLevels: [1]
      };
    }
    return {
      isCaster: true,
      quota: 2,
      label: `Select 2 new spells of any level up to Level ${maxLvl} for your spellbook.`,
      maxSpellLevel: maxLvl,
      autoCantrips: false,
      allowedSpellLevels: Array.from({ length: maxLvl + 1 }, (_, i) => i)
    };
  }

  // 2. SORCERER
  if (classType === 'sorcerer') {
    const currentKnown = (SORCERER_KNOWN_TABLE as any)[classLevel] || [];
    const prevKnown = (SORCERER_KNOWN_TABLE as any)[classLevel - 1] || Array(10).fill(0);
    const diffs = currentKnown.map((k: number, idx: number) => Math.max(0, k - (prevKnown[idx] || 0)));
    const totalNew = diffs.reduce((a: number, b: number) => a + b, 0);

    return {
      isCaster: true,
      quota: Math.max(totalNew, classLevel === 1 ? 6 : 1),
      label: classLevel === 1
        ? `Select 4 cantrips (0-level) and 2 1st-level spells for your Spells Known.`
        : `Select ${totalNew} new spell(s) for your Spells Known (up to Level ${maxLvl}).`,
      maxSpellLevel: maxLvl,
      autoCantrips: false,
      allowedSpellLevels: Array.from({ length: maxLvl + 1 }, (_, i) => i)
    };
  }

  // 3. BARD
  if (classType === 'bard') {
    const currentKnown = (BARD_KNOWN_TABLE as any)[classLevel] || [];
    const prevKnown = (BARD_KNOWN_TABLE as any)[classLevel - 1] || Array(7).fill(0);
    const diffs = currentKnown.map((k: number, idx: number) => Math.max(0, k - (prevKnown[idx] || 0)));
    const totalNew = diffs.reduce((a: number, b: number) => a + b, 0);

    return {
      isCaster: true,
      quota: Math.max(totalNew, classLevel === 1 ? 4 : 1),
      label: classLevel === 1
        ? `Select 4 starting 0-level cantrips for your Spells Known.`
        : `Select ${totalNew} new spell(s) for your Spells Known (up to Level ${maxLvl}).`,
      maxSpellLevel: maxLvl,
      autoCantrips: false,
      allowedSpellLevels: Array.from({ length: maxLvl + 1 }, (_, i) => i)
    };
  }

  // 4. DUSKBLADE
  if (classType === 'duskblade') {
    const quota = classLevel === 1 ? 4 : (classLevel <= 4 ? 1 : 1);
    return {
      isCaster: true,
      quota,
      label: classLevel === 1 ? `Select 2 cantrips and 2 1st-level spells.` : `Select 1 new Duskblade spell (up to Level ${maxLvl}).`,
      maxSpellLevel: maxLvl,
      autoCantrips: false,
      allowedSpellLevels: Array.from({ length: maxLvl + 1 }, (_, i) => i)
    };
  }

  // Default fallback for other casters
  const fallbackMax = maxLvl || 9;
  return {
    isCaster: true,
    quota: 2,
    label: `Select new spells (up to Level ${fallbackMax}).`,
    maxSpellLevel: fallbackMax,
    autoCantrips: false,
    allowedSpellLevels: Array.from({ length: fallbackMax + 1 }, (_, i) => i)
  };
}

/**
 * Returns the list of spells from the compendium eligible for this class and level.
 */
export function getEligibleSpellsForClassAndLevel(
  pc: any,
  classType: string,
  allowedSpellLevels: number[]
): any[] {
  const allSpells = getAllCompendiumSpells(pc) || [];

  return allSpells.filter((sp: any) => {
    // 1. Prohibited School check (Wizard)
    if (classType === 'wizard' && isWizardProhibitedSchool(sp, pc)) {
      return false;
    }

    // 2. Class & Level check
    const classLevels = getSpellClassLevels(sp);
    const match = classLevels.find((cl: any) => cl.class === classType);
    if (!match) return false;

    return allowedSpellLevels.includes(match.level);
  });
}
