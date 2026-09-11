/**
 * @module    helpers
 * @summary   Core draft-PC state compilation utilities for the Character Creation Wizard.
 *            Assembles the temporary PC object used during wizard navigation and prerequisite checks.
 *            Feat-slot logic: see helpers.feats.ts. Skill-point logic: see helpers.skills.ts.
 */

import { CombatRules } from '@core/rules.js';
import { getSneakAttackDiceFromPrestigeClasses } from '@core/rules/prestigeClassEngine.js';
import { getFeatSlotsAtLevel } from './helpers.feats';

// Re-export domain-specific helpers to preserve all existing import paths
export { getFeatSlotsAtLevel } from './helpers.feats';
export { getSkillPointsForLevel } from './helpers.skills';

import { getRacialModifier, getMod, getRacialModifierString } from './helpers.racial';
export { getRacialModifier, getMod, getRacialModifierString };

// Helper to compile the draft character state up to the current level index
export const getDraftPCState = (
  lvlIdx: number,
  baseStats: { str: number; dex: number; con: number; int: number; wis: number; cha: number },
  selectedRace: string,
  levelConfigs: any[],
  alignment?: string
) => {
  const stats = { ...baseStats };
  const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
  statKeys.forEach(k => {
    stats[k] += getRacialModifier(selectedRace, k);
  });

  // Add level-up ability increases up to lvlIdx
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg && cfg.abilityIncrease) {
      const k = cfg.abilityIncrease as keyof typeof stats;
      stats[k] += 1;
    }
  }

  const statMods = {
    str: getMod(stats.str),
    dex: getMod(stats.dex),
    con: getMod(stats.con),
    int: getMod(stats.int),
    wis: getMod(stats.wis),
    cha: getMod(stats.cha),
  };

  // Calculate class levels up to lvlIdx
  const classesMap: Record<string, number> = {};
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg && cfg.classType) {
      classesMap[cfg.classType] = (classesMap[cfg.classType] || 0) + 1;
    }
  }
  const classesList = Object.entries(classesMap).map(([classType, level]) => ({
    classType,
    level
  }));

  // Calculate BAB up to lvlIdx
  let babVal = 0;
  classesList.forEach(c => {
    const clsDef = CombatRules.CLASSES.find((x: any) => x.key === c.classType);
    if (clsDef && clsDef.key !== 'custom') {
      babVal += CombatRules.calculateBab(clsDef.bab, c.level);
    }
  });

  // Feats list up to lvlIdx (exclusive of current level's choices for prerequisite checks)
  const featsList: string[] = [];
  for (let i = 0; i < lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg) {
      const slots = getFeatSlotsAtLevel(i, cfg.classType, selectedRace, levelConfigs);
      slots.forEach((slot, sIdx) => {
        const fid = cfg.feats?.[sIdx] || slot.defaultFeat;
        if (fid && !featsList.includes(fid)) featsList.push(fid);
      });
      if (Array.isArray(cfg.feats)) {
        cfg.feats.forEach((fid: string) => {
          if (fid && !featsList.includes(fid)) featsList.push(fid);
        });
      }
    }
  }

  // Skill ranks up to lvlIdx-1 (accumulated)
  const skillsAcc: Record<string, { ranks: number; misc: number; spent?: number }> = {};
  for (let i = 0; i < lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg && cfg.skills) {
      Object.entries(cfg.skills).forEach(([sKey, clicks]) => {
        if (!skillsAcc[sKey]) {
          skillsAcc[sKey] = { ranks: 0, misc: 0, spent: 0 };
        }
        if (cfg.isHistoricalRanks) {
          skillsAcc[sKey].ranks += (clicks as number);
          skillsAcc[sKey].spent = (skillsAcc[sKey].spent || 0) + (clicks as number);
        } else {
          // Each click in class skill = 1.0 rank, cross-class = 0.5 ranks
          const wasClass = CombatRules.CLASS_SKILLS[cfg.classType]?.includes(sKey) || 
                           (sKey.startsWith('knowledge_') && (cfg.classType === 'wizard' || cfg.classType === 'bard'));
          const increment = wasClass ? 1.0 : 0.5;
          skillsAcc[sKey].ranks += (clicks as number) * increment;
          skillsAcc[sKey].spent = (skillsAcc[sKey].spent || 0) + (clicks as number);
        }
      });
    }
  }

  const prestigeSpellLinks: Record<string, any> = {};
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg && cfg.prestigeSpellLinks) {
      Object.entries(cfg.prestigeSpellLinks).forEach(([prcKey, links]) => {
        prestigeSpellLinks[prcKey] = links;
      });
    }
  }

  const prestigeSpecialTextConfirmed: Record<string, boolean> = {};
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg && cfg.prestigeSpecialTextConfirmed) {
      Object.entries(cfg.prestigeSpecialTextConfirmed).forEach(([prcKey, confirmed]) => {
        prestigeSpecialTextConfirmed[prcKey] = confirmed as boolean;
      });
    }
  }

  // Skill tricks up to lvlIdx
  const skillTricksList: any[] = [];
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg && Array.isArray(cfg.skillTricks)) {
      cfg.skillTricks.forEach((tKey: string) => {
        skillTricksList.push({ id: tKey });
      });
    }
  }

  // Wizard School Specialization & Prohibited Schools up to lvlIdx
  let wizardSpecialization = 'none';
  let wizardProhibited1 = '';
  let wizardProhibited2 = '';
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg) {
      if (cfg.wizardSpecialization !== undefined) wizardSpecialization = cfg.wizardSpecialization;
      if (cfg.wizardProhibited1 !== undefined) wizardProhibited1 = cfg.wizardProhibited1;
      if (cfg.wizardProhibited2 !== undefined) wizardProhibited2 = cfg.wizardProhibited2;
    }
  }

  const draftPC = {
    race: selectedRace,
    isHuman: selectedRace === 'human',
    alignment: alignment || 'Neutral',
    level: lvlIdx + 1,
    classes: classesList,
    str: { base: stats.str, value: stats.str, getValue: () => stats.str },
    dex: { base: stats.dex, value: stats.dex, getValue: () => stats.dex },
    con: { base: stats.con, value: stats.con, getValue: () => stats.con },
    int: { base: stats.int, value: stats.int, getValue: () => stats.int },
    wis: { base: stats.wis, value: stats.wis, getValue: () => stats.wis },
    cha: { base: stats.cha, value: stats.cha, getValue: () => stats.cha },
    getAttributeMod: (attrName: string) => statMods[attrName as keyof typeof statMods] || 0,
    bab: { base: babVal, value: babVal, getValue: () => babVal },
    feats: featsList.map(fid => ({ id: fid })),
    hasFeat: (featId: string) => featsList.includes(featId),
    skills: skillsAcc,
    getSkillRanks: (skillKey: string) => skillsAcc[skillKey]?.ranks || 0,
    getSkillMisc: () => 0,
    getArmorCheckPenalty: () => 0,
    skillTricks: skillTricksList,
    hasSkillTrick: (trickKey: string) => skillTricksList.some(t => (typeof t === 'object' ? t.id === trickKey : t === trickKey)),
    prestigeSpellLinks,
    prestigeSpecialTextConfirmed,
    wizardSpecialization,
    wizardProhibited1,
    wizardProhibited2,
    getSneakAttackDiceCount: () => {
      const rogueClass = classesList.find(c => c.classType === 'rogue');
      const rogueCount = rogueClass ? Math.floor((rogueClass.level + 1) / 2) : 0;
      const spellthiefClass = classesList.find(c => c.classType === 'spellthief');
      const spellthiefCount = spellthiefClass && spellthiefClass.level >= 1 ? Math.floor((spellthiefClass.level + 3) / 4) : 0;
      const ninjaClass = classesList.find(c => c.classType === 'ninja');
      const ninjaCount = ninjaClass && ninjaClass.level >= 1 ? Math.floor((ninjaClass.level + 1) / 2) : 0;
      return rogueCount + spellthiefCount + ninjaCount + getSneakAttackDiceFromPrestigeClasses({ classes: classesList });
    }
  };


  return {
    stats,
    statMods,
    classesList,
    classes: classesList,
    babVal,
    featsList,
    skillsAcc,
    draftPC,
    wizardSpecialization,
    wizardProhibited1,
    wizardProhibited2
  };
};

// Helper to compile the draft character state fully up to and including lvlIdx (with feats & skills)
export const getCompletedDraftPCState = (
  lvlIdx: number,
  baseStats: { str: number; dex: number; con: number; int: number; wis: number; cha: number },
  selectedRace: string,
  levelConfigs: any[],
  alignment?: string
) => {
  const stats = { ...baseStats };
  const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
  statKeys.forEach(k => {
    stats[k] += getRacialModifier(selectedRace, k);
  });

  // Add level-up ability increases up to lvlIdx
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg && cfg.abilityIncrease) {
      const k = cfg.abilityIncrease as keyof typeof stats;
      stats[k] += 1;
    }
  }

  const statMods = {
    str: getMod(stats.str),
    dex: getMod(stats.dex),
    con: getMod(stats.con),
    int: getMod(stats.int),
    wis: getMod(stats.wis),
    cha: getMod(stats.cha),
  };

  // Calculate class levels up to lvlIdx
  const classesMap: Record<string, number> = {};
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg && cfg.classType) {
      classesMap[cfg.classType] = (classesMap[cfg.classType] || 0) + 1;
    }
  }
  const classesList = Object.entries(classesMap).map(([classType, level]) => ({
    classType,
    level
  }));

  // Calculate BAB up to lvlIdx
  let babVal = 0;
  classesList.forEach(c => {
    const clsDef = CombatRules.CLASSES.find((x: any) => x.key === c.classType);
    if (clsDef && clsDef.key !== 'custom') {
      babVal += CombatRules.calculateBab(clsDef.bab, c.level);
    }
  });

  // Feats list up to lvlIdx (inclusive)
  const featsList: string[] = [];
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg) {
      const slots = getFeatSlotsAtLevel(i, cfg.classType, selectedRace, levelConfigs);
      slots.forEach((slot, sIdx) => {
        const fid = cfg.feats?.[sIdx] || slot.defaultFeat;
        if (fid && !featsList.includes(fid)) featsList.push(fid);
      });
      if (Array.isArray(cfg.feats)) {
        cfg.feats.forEach((fid: string) => {
          if (fid && !featsList.includes(fid)) featsList.push(fid);
        });
      }
    }
  }

  // Skill ranks up to lvlIdx (inclusive)
  const skillsAcc: Record<string, { ranks: number; misc: number; spent?: number }> = {};
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg && cfg.skills) {
      Object.entries(cfg.skills).forEach(([sKey, clicks]) => {
        if (!skillsAcc[sKey]) {
          skillsAcc[sKey] = { ranks: 0, misc: 0, spent: 0 };
        }
        if (cfg.isHistoricalRanks) {
          skillsAcc[sKey].ranks += (clicks as number);
          skillsAcc[sKey].spent = (skillsAcc[sKey].spent || 0) + (clicks as number);
        } else {
          // Each click in class skill = 1.0 rank, cross-class = 0.5 ranks
          const wasClass = CombatRules.CLASS_SKILLS[cfg.classType]?.includes(sKey) || 
                           (sKey.startsWith('knowledge_') && (cfg.classType === 'wizard' || cfg.classType === 'bard'));
          const increment = wasClass ? 1.0 : 0.5;
          skillsAcc[sKey].ranks += (clicks as number) * increment;
          skillsAcc[sKey].spent = (skillsAcc[sKey].spent || 0) + (clicks as number);
        }
      });
    }
  }

  const prestigeSpellLinks: Record<string, any> = {};
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg && cfg.prestigeSpellLinks) {
      Object.entries(cfg.prestigeSpellLinks).forEach(([prcKey, links]) => {
        prestigeSpellLinks[prcKey] = links;
      });
    }
  }

  const prestigeSpecialTextConfirmed: Record<string, boolean> = {};
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg && cfg.prestigeSpecialTextConfirmed) {
      Object.entries(cfg.prestigeSpecialTextConfirmed).forEach(([prcKey, confirmed]) => {
        prestigeSpecialTextConfirmed[prcKey] = confirmed as boolean;
      });
    }
  }

  // Skill tricks up to lvlIdx (inclusive)
  const skillTricksList: any[] = [];
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg && Array.isArray(cfg.skillTricks)) {
      cfg.skillTricks.forEach((tKey: string) => {
        skillTricksList.push({ id: tKey });
      });
    }
  }

  // Wizard School Specialization & Prohibited Schools up to lvlIdx
  let wizardSpecialization = 'none';
  let wizardProhibited1 = '';
  let wizardProhibited2 = '';
  for (let i = 0; i <= lvlIdx; i++) {
    const cfg = levelConfigs[i];
    if (cfg) {
      if (cfg.wizardSpecialization !== undefined) wizardSpecialization = cfg.wizardSpecialization;
      if (cfg.wizardProhibited1 !== undefined) wizardProhibited1 = cfg.wizardProhibited1;
      if (cfg.wizardProhibited2 !== undefined) wizardProhibited2 = cfg.wizardProhibited2;
    }
  }

  const draftPC = {
    race: selectedRace,
    isHuman: selectedRace === 'human',
    alignment: alignment || 'Neutral',
    level: lvlIdx + 1,
    classes: classesList,
    str: { base: stats.str, value: stats.str, getValue: () => stats.str },
    dex: { base: stats.dex, value: stats.dex, getValue: () => stats.dex },
    con: { base: stats.con, value: stats.con, getValue: () => stats.con },
    int: { base: stats.int, value: stats.int, getValue: () => stats.int },
    wis: { base: stats.wis, value: stats.wis, getValue: () => stats.wis },
    cha: { base: stats.cha, value: stats.cha, getValue: () => stats.cha },
    getAttributeMod: (attrName: string) => statMods[attrName as keyof typeof statMods] || 0,
    bab: { base: babVal, value: babVal, getValue: () => babVal },
    feats: featsList.map(fid => ({ id: fid })),
    hasFeat: (featId: string) => featsList.includes(featId),
    skills: skillsAcc,
    getSkillRanks: (skillKey: string) => skillsAcc[skillKey]?.ranks || 0,
    getSkillMisc: () => 0,
    getArmorCheckPenalty: () => 0,
    skillTricks: skillTricksList,
    hasSkillTrick: (trickKey: string) => skillTricksList.some(t => (typeof t === 'object' ? t.id === trickKey : t === trickKey)),
    prestigeSpellLinks,
    prestigeSpecialTextConfirmed,
    wizardSpecialization,
    wizardProhibited1,
    wizardProhibited2,
    getSneakAttackDiceCount: () => {
      const rogueClass = classesList.find(c => c.classType === 'rogue');
      const rogueCount = rogueClass ? Math.floor((rogueClass.level + 1) / 2) : 0;
      const spellthiefClass = classesList.find(c => c.classType === 'spellthief');
      const spellthiefCount = spellthiefClass && spellthiefClass.level >= 1 ? Math.floor((spellthiefClass.level + 3) / 4) : 0;
      const ninjaClass = classesList.find(c => c.classType === 'ninja');
      const ninjaCount = ninjaClass && ninjaClass.level >= 1 ? Math.floor((ninjaClass.level + 1) / 2) : 0;
      return rogueCount + spellthiefCount + ninjaCount + getSneakAttackDiceFromPrestigeClasses({ classes: classesList });
    }
  };

  return {
    stats,
    statMods,
    classesList,
    classes: classesList,
    babVal,
    featsList,
    skillsAcc,
    allSkills: skillsAcc,
    skillTricksList,
    allSkillTricks: skillTricksList,
    draftPC,
    wizardSpecialization,
    wizardProhibited1,
    wizardProhibited2
  };
};

