/**
 * @module    spellSelectionRules
 * @summary   D&D 3.5e RAW rules and quota calculator for wizard/sorcerer/bard spell selection,
 *            including prestige class spellcasting advancement.
 */

import {
  SORCERER_KNOWN_TABLE,
  BARD_KNOWN_TABLE,
  CLASSES
} from '../../../../../js/rules/RulesData.js';
import { getMaxSpellLevel, getSpellClassLevels, isWizardProhibitedSchool } from '../../../../../js/rules/RulesSpells.js';
import { getAllCompendiumSpells, getEffectiveCasterLevel } from '../../../../../js/rules.js';

export interface SpellQuotaInfo {
  isCaster: boolean;
  quota: number;
  label: string;
  maxSpellLevel: number;
  autoCantrips: boolean;
  allowedSpellLevels: number[];
}

export interface ResolvedSpellLevelInfo extends SpellQuotaInfo {
  targetCasterClass: string;
  isPrestige: boolean;
  effectiveCasterLevel: number;
}

export function isSpellSelectorClass(classType: string): boolean {
  if (['wizard', 'sorcerer', 'bard', 'duskblade', 'spellthief', 'assassin'].includes(classType)) return true;
  const clsDef = CLASSES?.find(c => c.key === classType);
  if (clsDef && clsDef.spellcastingBonus) return true;
  return false;
}

/**
 * Resolves spellcasting advancement, effective caster level, quota, and allowed spell levels
 * for any configured level in the Character Creation Wizard, seamlessly supporting both
 * base caster classes (Wizard, Sorcerer, Bard, etc.) and Prestige Classes (Spellwarp Sniper, etc.).
 */
export function resolveSpellLevelInfo(
  currentConfig: { classType?: string; prestigeSpellLinks?: Record<string, unknown> } | null | undefined,
  allLevelConfigs: Array<{ classType?: string; prestigeSpellLinks?: Record<string, unknown> }>,
  currentLevelIndex: number,
  intMod: number = 0,
  draftPC?: { prestigeSpellLinks?: Record<string, unknown>; classes?: Array<{ classType: string; level: number }> }
): ResolvedSpellLevelInfo {
  const empty: ResolvedSpellLevelInfo = {
    isCaster: false,
    targetCasterClass: '',
    isPrestige: false,
    effectiveCasterLevel: 0,
    maxSpellLevel: -1,
    quota: 0,
    label: '',
    autoCantrips: false,
    allowedSpellLevels: [],
  };

  if (!currentConfig || !currentConfig.classType) return empty;
  const rawClassType = currentConfig.classType;

  // 1. Base caster classes
  if (['wizard', 'sorcerer', 'bard', 'duskblade', 'spellthief', 'assassin'].includes(rawClassType)) {
    const classCountAtThisLevel = allLevelConfigs
      .slice(0, currentLevelIndex + 1)
      .filter((c) => c.classType === rawClassType).length || 1;
    const baseQuota = getSpellSelectionQuota(rawClassType, classCountAtThisLevel, intMod);
    return {
      ...baseQuota,
      targetCasterClass: rawClassType,
      isPrestige: false,
      effectiveCasterLevel: classCountAtThisLevel,
    };
  }

  // 2. Prestige class spellcasting advancement
  const clsDef = CLASSES?.find((c) => c.key === rawClassType);
  if (clsDef && clsDef.isPrestige && clsDef.spellcastingBonus) {
    const prcCount = allLevelConfigs
      .slice(0, currentLevelIndex + 1)
      .filter((c) => c.classType === rawClassType).length || 1;

    // Check if this specific level of the PrC advances spellcasting
    let advances = true;
    if (Array.isArray(clsDef.spellcastingBonus)) {
      const currentAdv = clsDef.spellcastingBonus[prcCount - 1] ?? clsDef.spellcastingBonus[clsDef.spellcastingBonus.length - 1];
      const prevAdv = prcCount > 1 ? (clsDef.spellcastingBonus[prcCount - 2] ?? clsDef.spellcastingBonus[clsDef.spellcastingBonus.length - 1]) : 0;
      advances = currentAdv > prevAdv;
    }
    if (!advances) return empty;

    // Determine target caster class from links
    let targetCaster = '';
    const links = (currentConfig.prestigeSpellLinks || draftPC?.prestigeSpellLinks || {}) as Record<string, unknown>;
    if (rawClassType === 'mystic_theurge') {
      const mtLinks = links.mystic_theurge as { arcane?: string; divine?: string } | undefined;
      targetCaster = mtLinks?.arcane || mtLinks?.divine || '';
    } else if (rawClassType === 'arcane_trickster') {
      targetCaster = typeof links.arcane_trickster === 'string' ? links.arcane_trickster : '';
    } else if (rawClassType === 'spellwarp_sniper') {
      targetCaster = typeof links.spellwarp_sniper === 'string' ? links.spellwarp_sniper : '';
    } else if (typeof links[rawClassType] === 'string') {
      targetCaster = links[rawClassType] as string;
    }

    // Fallback: check previous levelConfigs
    if (!targetCaster) {
      for (let i = 0; i <= currentLevelIndex; i++) {
        const pastCfg = allLevelConfigs[i];
        if (pastCfg?.prestigeSpellLinks && typeof pastCfg.prestigeSpellLinks === 'object') {
          const lk = pastCfg.prestigeSpellLinks[rawClassType];
          if (typeof lk === 'string') {
            targetCaster = lk;
            break;
          } else if (lk && typeof lk === 'object' && 'arcane' in lk) {
            targetCaster = (lk as { arcane: string }).arcane;
            break;
          }
        }
      }
    }

    // Fallback 2: search earlier base caster classes
    if (!targetCaster) {
      const priorClasses = allLevelConfigs.slice(0, currentLevelIndex + 1).map((c) => c.classType || '');
      const casters = priorClasses.filter((c) => ['wizard', 'sorcerer', 'cleric', 'druid', 'bard', 'duskblade', 'beguiler'].includes(c));
      if (casters.length > 0) {
        targetCaster = casters[0];
      }
    }

    if (!targetCaster) return empty;

    // Calculate effective caster level
    let effectiveCL = 0;
    if (draftPC) {
      effectiveCL = getEffectiveCasterLevel(draftPC, targetCaster);
    }
    if (!effectiveCL) {
      const baseLevels = allLevelConfigs.slice(0, currentLevelIndex + 1).filter((c) => c.classType === targetCaster).length;
      let prcAdvBonus = prcCount;
      if (Array.isArray(clsDef.spellcastingBonus)) {
        prcAdvBonus = clsDef.spellcastingBonus[prcCount - 1] ?? clsDef.spellcastingBonus[clsDef.spellcastingBonus.length - 1];
      }
      effectiveCL = baseLevels + prcAdvBonus;
    }

    const maxSpellLvl = getMaxSpellLevel(targetCaster, effectiveCL);
    if (maxSpellLvl < 0) return empty;

    const prcName = clsDef.nameEn || clsDef.nameDe || rawClassType;
    const targetName = targetCaster.charAt(0).toUpperCase() + targetCaster.slice(1);

    if (targetCaster === 'wizard') {
      return {
        isCaster: true,
        targetCasterClass: 'wizard',
        isPrestige: true,
        effectiveCasterLevel: effectiveCL,
        maxSpellLevel: maxSpellLvl,
        quota: 2,
        label: `${prcName} Lv. ${prcCount} advances ${targetName} (+1 Caster Level -> CL ${effectiveCL}): Select 2 new spells up to Level ${maxSpellLvl}.`,
        autoCantrips: false,
        allowedSpellLevels: Array.from({ length: maxSpellLvl + 1 }, (_, i) => i),
      };
    }

    if (targetCaster === 'sorcerer') {
      const currentKnown = SORCERER_KNOWN_TABLE?.[effectiveCL] || [];
      const prevKnown = SORCERER_KNOWN_TABLE?.[effectiveCL - 1] || Array(10).fill(0);
      const diffs = currentKnown.map((k: number, idx: number) => Math.max(0, k - (prevKnown[idx] || 0)));
      const totalNew = diffs.reduce((a: number, b: number) => a + b, 0);

      return {
        isCaster: true,
        targetCasterClass: 'sorcerer',
        isPrestige: true,
        effectiveCasterLevel: effectiveCL,
        maxSpellLevel: maxSpellLvl,
        quota: Math.max(1, totalNew),
        label: `${prcName} Lv. ${prcCount} advances ${targetName} (+1 Caster Level -> CL ${effectiveCL}): Select ${Math.max(1, totalNew)} new spell(s) up to Level ${maxSpellLvl}.`,
        autoCantrips: false,
        allowedSpellLevels: Array.from({ length: maxSpellLvl + 1 }, (_, i) => i),
      };
    }

    if (targetCaster === 'bard') {
      const currentKnown = BARD_KNOWN_TABLE?.[effectiveCL] || [];
      const prevKnown = BARD_KNOWN_TABLE?.[effectiveCL - 1] || Array(7).fill(0);
      const diffs = currentKnown.map((k: number, idx: number) => Math.max(0, k - (prevKnown[idx] || 0)));
      const totalNew = diffs.reduce((a: number, b: number) => a + b, 0);

      return {
        isCaster: true,
        targetCasterClass: 'bard',
        isPrestige: true,
        effectiveCasterLevel: effectiveCL,
        maxSpellLevel: maxSpellLvl,
        quota: Math.max(1, totalNew),
        label: `${prcName} Lv. ${prcCount} advances ${targetName} (+1 Caster Level -> CL ${effectiveCL}): Select ${Math.max(1, totalNew)} new spell(s) up to Level ${maxSpellLvl}.`,
        autoCantrips: false,
        allowedSpellLevels: Array.from({ length: maxSpellLvl + 1 }, (_, i) => i),
      };
    }

    // Full divine casters (cleric, druid) know all spells automatically
    if (['cleric', 'druid'].includes(targetCaster)) {
      return empty;
    }

    return {
      isCaster: true,
      targetCasterClass: targetCaster,
      isPrestige: true,
      effectiveCasterLevel: effectiveCL,
      maxSpellLevel: maxSpellLvl,
      quota: 2,
      label: `${prcName} Lv. ${prcCount} advances ${targetName} (+1 Caster Level -> CL ${effectiveCL}): Select 2 new spells up to Level ${maxSpellLvl}.`,
      autoCantrips: false,
      allowedSpellLevels: Array.from({ length: maxSpellLvl + 1 }, (_, i) => i),
    };
  }

  return empty;
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
    const currentKnown = SORCERER_KNOWN_TABLE?.[classLevel] || [];
    const prevKnown = SORCERER_KNOWN_TABLE?.[classLevel - 1] || Array(10).fill(0);
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
    const currentKnown = BARD_KNOWN_TABLE?.[classLevel] || [];
    const prevKnown = BARD_KNOWN_TABLE?.[classLevel - 1] || Array(7).fill(0);
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
  pc: { classes?: Array<{ classType: string }>; prestigeSpellLinks?: Record<string, unknown> } | null | undefined,
  classType: string,
  allowedSpellLevels: number[]
): Array<{ id: string; name?: string; level?: number; school?: string }> {
  const allSpells = (getAllCompendiumSpells(pc) || []) as Array<{ id: string; name?: string; level?: number; school?: string; classLevels?: Array<{ class: string; level: number }> }>;

  let effectiveClass = classType;
  const clsDef = CLASSES?.find((c) => c.key === classType);
  if (clsDef?.isPrestige && clsDef.spellcastingBonus) {
    const links = (pc?.prestigeSpellLinks || {}) as Record<string, unknown>;
    if (typeof links[classType] === 'string') {
      effectiveClass = links[classType] as string;
    } else if (links[classType] && typeof links[classType] === 'object' && 'arcane' in (links[classType] as object)) {
      effectiveClass = (links[classType] as { arcane: string }).arcane;
    } else if (Array.isArray(pc?.classes)) {
      const baseCaster = pc.classes.find((c) =>
        ['wizard', 'sorcerer', 'cleric', 'druid', 'bard', 'duskblade', 'beguiler'].includes(c.classType)
      );
      if (baseCaster) effectiveClass = baseCaster.classType;
    }
  }

  return allSpells.filter((sp) => {
    // 1. Prohibited School check (Wizard)
    if (effectiveClass === 'wizard' && isWizardProhibitedSchool(sp, pc)) {
      return false;
    }

    // 2. Class & Level check
    const classLevels = getSpellClassLevels(sp);
    const match = classLevels.find((cl: { class: string; level: number }) => cl.class === effectiveClass);
    if (!match) return false;

    return allowedSpellLevels.includes(match.level);
  });
}

