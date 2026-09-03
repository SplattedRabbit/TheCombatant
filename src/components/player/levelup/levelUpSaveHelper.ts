import { CombatState } from '@core/state.js';
import { CombatRules } from '@core/rules.js';
import { getFeatSlotsAtLevel } from '../wizard/helpers.ts';

export function applyLevelUpToActivePC(
  levelConfigs: any[],
  newLevelIndex: number,
  completedDraft: any
) {
  const newLevelConfig = levelConfigs[newLevelIndex];
  if (!newLevelConfig || !newLevelConfig.classType) return;

  CombatState.updatePCBatch((pc: any) => {
    // 1. Update Classes list
    const currentClasses = Array.isArray(pc.classes) ? [...pc.classes] : [];
    const targetClass = currentClasses.find(c => c.classType === newLevelConfig.classType);
    if (targetClass) {
      targetClass.level = (targetClass.level || 1) + 1;
    } else {
      currentClasses.push({ classType: newLevelConfig.classType, level: 1 });
    }
    pc.classes = currentClasses;

    // 2. Add HP roll (+ CON mod)
    const conMod = completedDraft ? completedDraft.statMods.con : (pc.con?.mod || 0);
    const roll = parseInt(newLevelConfig.hpRoll) || 1;
    const gainedHP = Math.max(1, roll + conMod);
    const curMax = pc.maxHP || pc.maxHp || 10;
    const curHp = pc.hp !== undefined ? pc.hp : curMax;
    pc.maxHP = curMax + gainedHP;
    pc.maxHp = curMax + gainedHP;
    pc.hp = curHp + gainedHP;

    // 3. Ability increase (if any)
    if (newLevelConfig.abilityIncrease) {
      if (!pc.levelIncreases) {
        pc.levelIncreases = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
      }
      const attr = newLevelConfig.abilityIncrease;
      if (pc.levelIncreases[attr] !== undefined) {
        pc.levelIncreases[attr] = (pc.levelIncreases[attr] || 0) + 1;
      }
    }

    // 4. Skills additions
    if (!pc.skills) pc.skills = {};
    const newSkills = newLevelConfig.skills || {};
    const clsType = newLevelConfig.classType;

    Object.entries(newSkills).forEach(([sKey, clicks]) => {
      const clickCount = parseInt(clicks as string) || 0;
      if (clickCount <= 0) return;

      if (!pc.skills[sKey]) {
        pc.skills[sKey] = { ranks: 0, misc: 0 };
      }

      const isClassSkill = (CombatRules.CLASS_SKILLS[clsType] && CombatRules.CLASS_SKILLS[clsType].includes(sKey)) ||
        (sKey.startsWith('knowledge_') && (clsType === 'wizard' || clsType === 'bard'));

      const rankInc = isClassSkill ? 1.0 * clickCount : 0.5 * clickCount;
      const curRanks = typeof pc.skills[sKey] === 'object' ? (pc.skills[sKey].ranks || 0) : (Number(pc.skills[sKey]) || 0);
      pc.skills[sKey] = {
        ranks: curRanks + rankInc,
        misc: pc.skills[sKey].misc || 0
      };
    });

    // 5. Skill Tricks additions
    if (Array.isArray(newLevelConfig.skillTricks) && newLevelConfig.skillTricks.length > 0) {
      const curTricks = Array.isArray(pc.skillTricks) ? [...pc.skillTricks] : [];
      newLevelConfig.skillTricks.forEach((trickKey: string) => {
        if (!curTricks.some(t => (typeof t === 'object' ? t.id === trickKey : t === trickKey))) {
          curTricks.push({ id: trickKey });
        }
      });
      pc.skillTricks = curTricks;
    }

    // 6. Feats additions
    const featSlots = getFeatSlotsAtLevel(newLevelIndex, newLevelConfig.classType, pc.race, levelConfigs);
    const curFeats = Array.isArray(pc.feats) ? [...pc.feats] : [];
    featSlots.forEach((slot, sIdx) => {
      const fid = newLevelConfig.feats?.[sIdx] || slot.defaultFeat;
      if (fid && !curFeats.some(f => (typeof f === 'object' ? f.id === fid : f === fid))) {
        curFeats.push({ id: fid });
      }
    });
    if (Array.isArray(newLevelConfig.feats)) {
      newLevelConfig.feats.forEach((fid: string) => {
        if (fid && !curFeats.some(f => (typeof f === 'object' ? f.id === fid : f === fid))) {
          curFeats.push({ id: fid });
        }
      });
    }
    pc.feats = curFeats;

    // 7. ACFs additions
    if (Array.isArray(newLevelConfig.acfs) && newLevelConfig.acfs.length > 0) {
      const curACFs = Array.isArray(pc.acfs) ? [...pc.acfs] : [];
      newLevelConfig.acfs.forEach((acfKey: string) => {
        if (acfKey && !curACFs.includes(acfKey)) {
          curACFs.push(acfKey);
        }
      });
      pc.acfs = curACFs;

      if (curACFs.some(a => ['ranger_distracting_attack', 'ranger_spiritual_guide', 'druid_shapeshift'].includes(a))) {
        pc.companionType = 'none';
      }
      if (curACFs.some(a => ['wizard_immediate_magic', 'sorcerer_metamagic_specialist', 'hexblade_dark_companion'].includes(a))) {
        pc.familiarType = 'none';
      }
      if (curACFs.includes('barbarian_berserker_strength') && pc.isRaging) {
        if (typeof pc.exitRage === 'function') pc.exitRage();
      }
      if (curACFs.includes('druid_shapeshift') && pc.activeShape && pc.activeShape !== 'none') {
        if (typeof pc.exitShape === 'function') pc.exitShape();
      }
    }

    // 8. Rebuild all calculations
    pc.rebuildStatModifiers();
  });
}
