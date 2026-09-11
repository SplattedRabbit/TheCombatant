/**
 * @module    levelUpSpellRules
 * @summary   Rules and quota calculator for spell selection during level advancement in D&D 3.5e.
 */

import { getMaxSpellLevel, getEffectiveCasterLevel, isWizardProhibitedSchool, getSpellClassLevels } from '@core/rules/RulesSpells.js';
import { CLASSES, SORCERER_KNOWN_TABLE, BARD_KNOWN_TABLE } from '@core/rules/RulesData.js';
import { getSpellSchoolCode } from '@core/spells.js';

export interface LevelUpSpellQuota {
  requiresSpellSelection: boolean;
  mode: 'wizard' | 'spontaneous' | 'info_only' | 'none';
  casterClass: string;
  effectiveCasterLevel: number;
  maxSpellLevel: number;
  totalSpellsToChoose: number;
  spontaneousQuotaByLevel?: Record<number, number>;
  newlyUnlockedSpellLevel?: number;
  infoMessage?: string;
}

/**
 * Calculates the spell quota and selection requirements for a leveling character.
 */
export function calculateLevelUpSpellQuota(
  activePC: any,
  currentDraft: any,
  newLevelConfig: any
): LevelUpSpellQuota {
  if (!newLevelConfig || !newLevelConfig.classType) {
    return {
      requiresSpellSelection: false,
      mode: 'none',
      casterClass: '',
      effectiveCasterLevel: 0,
      maxSpellLevel: -1,
      totalSpellsToChoose: 0,
    };
  }

  const rawClassType = newLevelConfig.classType;
  const clsDef = CLASSES.find((c: any) => c.key === rawClassType);

  let targetCasterClass = rawClassType;

  // 1. Resolve prestige class links to base caster class
  if (clsDef?.isPrestige && clsDef.spellcastingBonus) {
    const links = newLevelConfig.prestigeSpellLinks || activePC?.prestigeSpellLinks || {};
    if (rawClassType === 'mystic_theurge') {
      targetCasterClass = links.mystic_theurge?.arcane || links.mystic_theurge?.divine || '';
    } else if (rawClassType === 'arcane_trickster') {
      targetCasterClass = links.arcane_trickster || '';
    } else if (rawClassType === 'spellwarp_sniper') {
      targetCasterClass = links.spellwarp_sniper || '';
    } else if (typeof links[rawClassType] === 'string') {
      targetCasterClass = links[rawClassType];
    } else {
      targetCasterClass = '';
    }

    if (!targetCasterClass) {
      const draftClasses = currentDraft?.draftPC?.classes || activePC?.classes || [];
      const casters = draftClasses.filter((c: any) =>
        ['wizard', 'sorcerer', 'cleric', 'druid', 'bard', 'duskblade', 'beguiler'].includes(c.classType)
      );
      if (casters.length > 0) {
        targetCasterClass = casters[0].classType;
      }
    }
  }

  if (!targetCasterClass) {
    return {
      requiresSpellSelection: false,
      mode: 'none',
      casterClass: '',
      effectiveCasterLevel: 0,
      maxSpellLevel: -1,
      totalSpellsToChoose: 0,
    };
  }

  // Calculate effective caster level before and after level advancement
  const draftPC = currentDraft?.draftPC || activePC;
  const newEffectiveCL = getEffectiveCasterLevel(draftPC, targetCasterClass);
  const oldEffectiveCL = Math.max(0, newEffectiveCL - 1);
  const maxSpellLvl = getMaxSpellLevel(targetCasterClass, newEffectiveCL);

  // 2. Wizard / Spellbook Casters (RAW: 2 free spells of any level the wizard can cast)
  if (targetCasterClass === 'wizard') {
    if (maxSpellLvl < 0) {
      return {
        requiresSpellSelection: false,
        mode: 'none',
        casterClass: 'wizard',
        effectiveCasterLevel: newEffectiveCL,
        maxSpellLevel: -1,
        totalSpellsToChoose: 0,
      };
    }
    return {
      requiresSpellSelection: true,
      mode: 'wizard',
      casterClass: 'wizard',
      effectiveCasterLevel: newEffectiveCL,
      maxSpellLevel: maxSpellLvl,
      totalSpellsToChoose: 2,
    };
  }

  // 3. Spontaneous Casters: Sorcerer
  if (targetCasterClass === 'sorcerer') {
    const newRow = SORCERER_KNOWN_TABLE[newEffectiveCL] || [];
    const oldRow = SORCERER_KNOWN_TABLE[oldEffectiveCL] || [];
    const quotaByLvl: Record<number, number> = {};
    let totalToChoose = 0;

    for (let lvl = 0; lvl <= 9; lvl++) {
      const newMax = newRow[lvl] || 0;
      const oldMax = oldRow[lvl] || 0;
      const diff = newMax - oldMax;
      if (diff > 0) {
        quotaByLvl[lvl] = diff;
        totalToChoose += diff;
      }
    }

    return {
      requiresSpellSelection: totalToChoose > 0,
      mode: 'spontaneous',
      casterClass: 'sorcerer',
      effectiveCasterLevel: newEffectiveCL,
      maxSpellLevel: maxSpellLvl,
      totalSpellsToChoose: totalToChoose,
      spontaneousQuotaByLevel: quotaByLvl,
    };
  }

  // 4. Spontaneous Casters: Bard
  if (targetCasterClass === 'bard') {
    const newRow = BARD_KNOWN_TABLE[newEffectiveCL] || [];
    const oldRow = BARD_KNOWN_TABLE[oldEffectiveCL] || [];
    const quotaByLvl: Record<number, number> = {};
    let totalToChoose = 0;

    for (let lvl = 0; lvl <= 6; lvl++) {
      const newMax = newRow[lvl] || 0;
      const oldMax = oldRow[lvl] || 0;
      const diff = newMax - oldMax;
      if (diff > 0) {
        quotaByLvl[lvl] = diff;
        totalToChoose += diff;
      }
    }

    return {
      requiresSpellSelection: totalToChoose > 0,
      mode: 'spontaneous',
      casterClass: 'bard',
      effectiveCasterLevel: newEffectiveCL,
      maxSpellLevel: maxSpellLvl,
      totalSpellsToChoose: totalToChoose,
      spontaneousQuotaByLevel: quotaByLvl,
    };
  }

  // 5. Divine & Prepared Full-List Casters (Cleric, Druid, Paladin, Ranger)
  if (['cleric', 'druid', 'paladin', 'ranger'].includes(targetCasterClass)) {
    const oldMax = getMaxSpellLevel(targetCasterClass, oldEffectiveCL);
    const newMax = maxSpellLvl;
    const isNewTierUnlocked = newMax > oldMax && newMax > 0;

    return {
      requiresSpellSelection: false,
      mode: 'info_only',
      casterClass: targetCasterClass,
      effectiveCasterLevel: newEffectiveCL,
      maxSpellLevel: newMax,
      totalSpellsToChoose: 0,
      newlyUnlockedSpellLevel: isNewTierUnlocked ? newMax : undefined,
      infoMessage: isNewTierUnlocked
        ? `You have unlocked access to Level ${newMax} ${targetCasterClass === 'paladin' || targetCasterClass === 'ranger' ? targetCasterClass : 'divine'} spells! They are automatically available for preparation.`
        : undefined,
    };
  }

  return {
    requiresSpellSelection: false,
    mode: 'none',
    casterClass: targetCasterClass,
    effectiveCasterLevel: newEffectiveCL,
    maxSpellLevel: maxSpellLvl,
    totalSpellsToChoose: 0,
  };
}

/**
 * Filters the compendium spells for a given quota and character.
 */
export function getEligibleSpellsForLevelUp(
  pc: any,
  quota: LevelUpSpellQuota,
  allSpells: any[]
): any[] {
  if (!quota.casterClass || quota.maxSpellLevel < 0) return [];

  const learnedSet = new Set<string>(
    Array.isArray(pc?.learnedSpells) ? pc.learnedSpells : []
  );

  return allSpells.filter(spell => {
    if (!spell) return false;

    // Filter out already learned spells
    const spellKey = spell.id || spell.key || spell.nameEn || spell.name;
    if (
      (spellKey && learnedSet.has(spellKey)) ||
      (spell.id && learnedSet.has(spell.id)) ||
      (spell.key && learnedSet.has(spell.key))
    ) {
      return false;
    }

    // Check prohibited school for wizard
    if (quota.casterClass === 'wizard') {
      if (isWizardProhibitedSchool(spell, pc)) {
        return false;
      }
      if (Array.isArray(pc?.prohibitedSchools) && pc.prohibitedSchools.length > 0) {
        const scCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);
        if (scCode && pc.prohibitedSchools.includes(scCode)) {
          return false;
        }
      }
    }

    const classLevels = getSpellClassLevels(spell);
    const match = classLevels.find((cl: any) => cl.class === quota.casterClass);
    if (!match) return false;

    // Check maximum spell level
    if (match.level > quota.maxSpellLevel) return false;

    // For spontaneous quota, check if this spell level is in quota (optional filter)
    return true;
  });
}

/**
 * Validates whether the currently selected spell keys fulfill the quota.
 */
export function validateLevelUpSpellSelection(
  selectedKeys: string[],
  quota: LevelUpSpellQuota,
  allSpellsMap: Record<string, any>
): { valid: boolean; reason?: string } {
  if (!quota.requiresSpellSelection) {
    return { valid: true };
  }

  if (quota.mode === 'wizard') {
    if (selectedKeys.length < quota.totalSpellsToChoose) {
      return {
        valid: false,
        reason: `Please select ${quota.totalSpellsToChoose - selectedKeys.length} more spell(s) for your Spellbook (${selectedKeys.length}/${quota.totalSpellsToChoose} chosen).`,
      };
    }
    if (selectedKeys.length > quota.totalSpellsToChoose) {
      return {
        valid: false,
        reason: `You have selected too many spells (${selectedKeys.length}/${quota.totalSpellsToChoose}).`,
      };
    }
    return { valid: true };
  }

  if (quota.mode === 'spontaneous') {
    const quotaMap = quota.spontaneousQuotaByLevel || {};
    const chosenCounts: Record<number, number> = {};

    selectedKeys.forEach(key => {
      const sp = allSpellsMap[key];
      if (sp) {
        const clMatch = getSpellClassLevels(sp).find((cl: any) => cl.class === quota.casterClass);
        const lvl = clMatch ? clMatch.level : sp.level;
        chosenCounts[lvl] = (chosenCounts[lvl] || 0) + 1;
      }
    });

    for (const [lvlStr, reqCount] of Object.entries(quotaMap)) {
      const lvl = Number(lvlStr);
      const chosen = chosenCounts[lvl] || 0;
      if (chosen < reqCount) {
        return {
          valid: false,
          reason: `Please select ${reqCount - chosen} more Level ${lvl} spell(s) (${chosen}/${reqCount} chosen).`,
        };
      }
      if (chosen > reqCount) {
        return {
          valid: false,
          reason: `You selected too many Level ${lvl} spells (${chosen}/${reqCount} chosen).`,
        };
      }
    }

    return { valid: true };
  }

  return { valid: true };
}
