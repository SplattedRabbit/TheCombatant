import { CombatRules } from '@core/rules.js';
import { 
  getDraftPCState 
} from '../../components/player/wizard/helpers.ts';

export interface LevelUpDraftState {
  totalCurrentLevel: number;
  newLevel: number;
  newLevelIndex: number;
  baseStats: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  selectedRace: string;
  levelConfigs: any[];
  prevDraft: any;
}

export function createLevelUpDraft(activePC: any): LevelUpDraftState {
  const selectedRace = activePC.race || 'human';
  
  // Extract pure base stats (without racial modifiers and without levelIncreases)
  const baseStats = {
    str: activePC.str?.base ?? 10,
    dex: activePC.dex?.base ?? 10,
    con: activePC.con?.base ?? 10,
    int: activePC.int?.base ?? 10,
    wis: activePC.wis?.base ?? 10,
    cha: activePC.cha?.base ?? 10,
  };

  // Flatten classes into array of classType strings per level
  const classProgression: string[] = [];
  (activePC.classes || []).forEach((c: any) => {
    const count = c.level || 0;
    for (let i = 0; i < count; i++) {
      classProgression.push(c.classType);
    }
  });

  const totalCurrentLevel = Math.max(1, classProgression.length);
  const newLevel = totalCurrentLevel + 1;
  const newLevelIndex = totalCurrentLevel; // 0-indexed index for new level

  // Existing skills snapshot
  const currentSkills: Record<string, number> = {};
  if (activePC.skills && typeof activePC.skills === 'object') {
    Object.entries(activePC.skills).forEach(([sKey, sVal]: [string, any]) => {
      const ranks = typeof sVal === 'object' ? (sVal.ranks || 0) : (Number(sVal) || 0);
      if (ranks > 0) {
        currentSkills[sKey] = ranks;
      }
    });
  }

  // Existing skill tricks snapshot
  const currentTricks = (activePC.skillTricks || []).map((t: any) => typeof t === 'object' ? t.id : t).filter(Boolean);

  // Existing feats snapshot
  const currentFeatIds = (activePC.feats || []).map((f: any) => typeof f === 'object' ? f.id : f).filter(Boolean);

  // Existing ACFs snapshot
  const currentACFs = Array.isArray(activePC.acfs) ? [...activePC.acfs] : [];

  // Build past levelConfigs (0 to totalCurrentLevel - 1)
  const levelConfigs: any[] = [];
  for (let i = 0; i < totalCurrentLevel; i++) {
    const clsType = classProgression[i] || 'fighter';
    const clsDef = CombatRules.CLASSES.find((c: any) => c.key === clsType);
    const hitDie = clsDef?.hitDie || 8;
    const defaultHp = i === 0 ? hitDie : Math.max(1, Math.floor(hitDie / 2) + 1);

    levelConfigs.push({
      level: i + 1,
      classType: clsType,
      hpRoll: defaultHp,
      abilityIncrease: null,
      skills: i === 0 ? { ...currentSkills } : {}, // assign all historical skill ranks to base
      skillTricks: i === 0 ? [...currentTricks] : [],
      feats: i === 0 ? [...currentFeatIds] : [],
      acfs: i === 0 ? [...currentACFs] : [],
    });
  }

  // Populate level increases from activePC.levelIncreases
  if (activePC.levelIncreases && typeof activePC.levelIncreases === 'object') {
    const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
    let milestoneIndex = 0;
    statKeys.forEach(k => {
      const count = activePC.levelIncreases[k] || 0;
      for (let c = 0; c < count; c++) {
        // Find milestone levels (4, 8, 12, 16, 20)
        const targetLvl = (milestoneIndex + 1) * 4;
        if (targetLvl <= totalCurrentLevel && levelConfigs[targetLvl - 1]) {
          levelConfigs[targetLvl - 1].abilityIncrease = k;
          milestoneIndex++;
        }
      }
    });
  }

  // Default class for the new level = last class
  const defaultNewClass = classProgression[classProgression.length - 1] || 'fighter';
  const newClsDef = CombatRules.CLASSES.find((c: any) => c.key === defaultNewClass);
  const newHitDie = newClsDef?.hitDie || 8;

  // New level configuration (index newLevelIndex)
  levelConfigs.push({
    level: newLevel,
    classType: defaultNewClass,
    hpRoll: Math.max(1, Math.floor(newHitDie / 2) + 1),
    abilityIncrease: null,
    skills: {},
    skillTricks: [],
    feats: [],
    acfs: [],
  });

  const prevDraft = getDraftPCState(newLevelIndex - 1, baseStats, selectedRace, levelConfigs, activePC?.alignment);

  return {
    totalCurrentLevel,
    newLevel,
    newLevelIndex,
    baseStats,
    selectedRace,
    levelConfigs,
    prevDraft,
  };
}
