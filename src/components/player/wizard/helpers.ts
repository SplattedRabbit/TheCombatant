import { CombatRules } from '@core/rules.js';
import { getSneakAttackDiceFromPrestigeClasses } from '@core/rules/prestigeClassEngine.js';
import { CLASSES_LIST } from './constants';

export const getRacialModifier = (race: string, stat: string): number => {
  if (race === 'elf') {
    if (stat === 'dex') return 2;
    if (stat === 'con') return -2;
  }
  if (race === 'dwarf') {
    if (stat === 'con') return 2;
    if (stat === 'cha') return -2;
  }
  if (race === 'gnome') {
    if (stat === 'con') return 2;
    if (stat === 'str') return -2;
  }
  if (race === 'halfling' || race === 'deep_halfling') {
    if (stat === 'dex') return 2;
    if (stat === 'str') return -2;
  }
  if (race === 'half_orc') {
    if (stat === 'str') return 2;
    if (stat === 'int') return -2;
    if (stat === 'cha') return -2;
  }
  if (race === 'tiefling') {
    if (stat === 'dex') return 2;
    if (stat === 'int') return 2;
    if (stat === 'cha') return -2;
  }
  if (race === 'anima_construct') {
    if (stat === 'con') return 2;
    if (stat === 'cha') return -2;
  }
  return 0;
};

export const getMod = (score: number): number => {
  return score >= 10
    ? Math.floor((score - 10) / 2)
    : (score === 9 || score === 8 ? -1 : (score === 7 || score === 6 ? -2 : (score === 5 || score === 4 ? -4 : -5)));
};

export const getRacialModifierString = (race: string, stat: string): string => {
  const mod = getRacialModifier(race, stat);
  if (mod > 0) return `+${mod}`;
  if (mod < 0) return `${mod}`;
  return '';
};

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
        // Each click in class skill = 1.0 rank, cross-class = 0.5 ranks
        const wasClass = CombatRules.CLASS_SKILLS[cfg.classType]?.includes(sKey) || 
                         (sKey.startsWith('knowledge_') && (cfg.classType === 'wizard' || cfg.classType === 'bard'));
        const increment = wasClass ? 1.0 : 0.5;
        skillsAcc[sKey].ranks += (clicks as number) * increment;
        skillsAcc[sKey].spent = (skillsAcc[sKey].spent || 0) + (clicks as number);
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
    getSneakAttackDiceCount: () => {
      const rogueClass = classesList.find(c => c.classType === 'rogue');
      const rogueCount = rogueClass ? Math.floor((rogueClass.level + 1) / 2) : 0;
      return rogueCount + getSneakAttackDiceFromPrestigeClasses({ classes: classesList });
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
    draftPC
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
        const wasClass = CombatRules.CLASS_SKILLS[cfg.classType]?.includes(sKey) || 
                         (sKey.startsWith('knowledge_') && (cfg.classType === 'wizard' || cfg.classType === 'bard'));
        const increment = wasClass ? 1.0 : 0.5;
        skillsAcc[sKey].ranks += (clicks as number) * increment;
        skillsAcc[sKey].spent = (skillsAcc[sKey].spent || 0) + (clicks as number);
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
    getSneakAttackDiceCount: () => {
      const rogueClass = classesList.find(c => c.classType === 'rogue');
      const rogueCount = rogueClass ? Math.floor((rogueClass.level + 1) / 2) : 0;
      return rogueCount + getSneakAttackDiceFromPrestigeClasses({ classes: classesList });
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
    draftPC
  };
};

// Helper to determine feat slots at a level
export const getFeatSlotsAtLevel = (lvlIdx: number, currentClassType: string, selectedRace: string, levelConfigs: any[]) => {
  const slots: { label: string; allowedCategories: string[]; defaultFeat?: string; allowedFeats?: string[] }[] = [];
  const totalLevel = lvlIdx + 1;
  const isHuman = selectedRace === 'human';

  // 1. General Character Feat
  if (totalLevel === 1 || totalLevel === 3 || totalLevel === 6 || totalLevel === 9 || totalLevel === 12 || totalLevel === 15 || totalLevel === 18) {
    slots.push({
      label: `Character Feat (Level ${totalLevel})`,
      allowedCategories: ['combat', 'general', 'metamagic', 'item_creation']
    });
  }

  // 2. Human Bonus Feat
  if (totalLevel === 1 && isHuman) {
    slots.push({
      label: 'Human Bonus Feat',
      allowedCategories: ['combat', 'general', 'metamagic', 'item_creation']
    });
  }

  // 3. Class level calculation
  let classLevel = 0;
  for (let i = 0; i < lvlIdx; i++) {
    if (levelConfigs[i]?.classType === currentClassType) {
      classLevel++;
    }
  }
  classLevel += 1; // including current level

  if (currentClassType === 'fighter') {
    if (classLevel === 1 || classLevel % 2 === 0) {
      slots.push({
        label: `Fighter Bonus Feat (Class Level ${classLevel})`,
        allowedCategories: ['combat']
      });
    }
  } else if (currentClassType === 'wizard') {
    if (classLevel === 1) {
      slots.push({
        label: `Wizard (Scribe Scroll)`,
        allowedCategories: ['item_creation'],
        defaultFeat: 'scribe_scroll'
      });
    } else if (classLevel % 5 === 0) {
      slots.push({
        label: `Wizard Bonus Feat (Class Level ${classLevel})`,
        allowedCategories: ['metamagic', 'item_creation']
      });
    }
  } else if (currentClassType === 'shadowbane_inquisitor') {
    if (classLevel === 3) {
      slots.push({
        label: 'Shadowbane Inquisitor (Improved Sunder)',
        allowedCategories: ['combat'],
        defaultFeat: 'improved_sunder'
      });
    }
  } else if (currentClassType === 'ranger') {
    if (classLevel === 1) {
      slots.push({
        label: 'Ranger (Track)',
        allowedCategories: ['general'],
        defaultFeat: 'track'
      });
    } else if (classLevel === 2) {
      slots.push({
        label: 'Ranger Combat Style',
        allowedCategories: ['combat'],
        defaultFeat: 'rapid_shot',
        allowedFeats: ['rapid_shot', 'two_weapon_fighting']
      });
    } else if (classLevel === 3) {
      slots.push({
        label: 'Ranger (Endurance)',
        allowedCategories: ['general'],
        defaultFeat: 'endurance'
      });
    } else if (classLevel === 6) {
      slots.push({
        label: 'Ranger Improved Combat Style',
        allowedCategories: ['combat'],
        defaultFeat: 'manyshot',
        allowedFeats: ['manyshot', 'improved_two_weapon_fighting']
      });
    } else if (classLevel === 11) {
      slots.push({
        label: 'Ranger Greater Combat Style',
        allowedCategories: ['combat'],
        defaultFeat: 'improved_precise_shot',
        allowedFeats: ['improved_precise_shot', 'greater_two_weapon_fighting']
      });
    }
  } else if (currentClassType === 'monk') {
    if (classLevel === 1) {
      slots.push({
        label: 'Monk (Improved Unarmed Strike)',
        allowedCategories: ['combat'],
        defaultFeat: 'improved_unarmed_strike'
      });
      slots.push({
        label: 'Monk Bonus Feat (Level 1)',
        allowedCategories: ['combat'],
        defaultFeat: 'stunning_fist',
        allowedFeats: ['stunning_fist', 'improved_grapple']
      });
    } else if (classLevel === 2) {
      slots.push({
        label: 'Monk Bonus Feat (Level 2)',
        allowedCategories: ['combat'],
        defaultFeat: 'combat_reflexes',
        allowedFeats: ['combat_reflexes', 'deflect_arrows']
      });
    } else if (classLevel === 6) {
      slots.push({
        label: 'Monk Bonus Feat (Level 6)',
        allowedCategories: ['combat'],
        defaultFeat: 'improved_trip',
        allowedFeats: ['improved_trip', 'improved_disarm']
      });
    }
  } else if (currentClassType === 'duskblade') {
    if (classLevel === 2) {
      slots.push({
        label: 'Duskblade (Combat Casting)',
        allowedCategories: ['general'],
        defaultFeat: 'combat_casting'
      });
    }
  } else if (currentClassType === 'knight') {
    if (classLevel === 2) {
      slots.push({
        label: 'Knight (Mounted Combat)',
        allowedCategories: ['combat'],
        defaultFeat: 'mounted_combat'
      });
    }
  } else if (currentClassType === 'dragon_shaman') {
    if (classLevel === 2) {
      slots.push({
        label: 'Dragon Shaman (Skill Focus)',
        allowedCategories: ['general'],
        defaultFeat: 'skill_focus'
      });
    }
  }

  return slots;
};

// Calculate skill points for current level
export const getSkillPointsForLevel = (
  lvlIdx: number,
  clsKey: string,
  selectedRace: string,
  baseStats: { str: number; dex: number; con: number; int: number; wis: number; cha: number },
  currentDraft: any
) => {
  if (!clsKey) return 0;
  const clsDef = CLASSES_LIST.find(c => c.key === clsKey);
  const basePoints = clsDef ? clsDef.skillBase : 2;
  const intMod = currentDraft ? currentDraft.statMods.int : getMod(baseStats.int + getRacialModifier(selectedRace, 'int'));
  const isHuman = selectedRace === 'human';

  if (lvlIdx === 0) {
    // Level 1: (Base + IntMod) * 4 + Human bonus (+4)
    return Math.max(1, basePoints + intMod) * 4 + (isHuman ? 4 : 0);
  } else {
    // Level 2+: (Base + IntMod) + Human bonus (+1)
    return Math.max(1, basePoints + intMod) + (isHuman ? 1 : 0);
  }
};
