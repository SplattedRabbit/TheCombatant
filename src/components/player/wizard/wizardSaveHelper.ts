/**
 * @module    wizardSaveHelper
 * @summary   Applies completed Wizard character draft configuration to CombatState.
 */

import { CombatState } from '@core/state.js';
import { getFeatSlotsAtLevel } from './helpers.ts';

export function applyWizardCharacterToState(
  name: string,
  selectedRace: string,
  alignmentEthical: string,
  alignmentMoral: string,
  baseStats: { str: number; dex: number; con: number; int: number; wis: number; cha: number },
  levelConfigs: any[],
  completedDraft: any
) {
  CombatState.updatePCBatch((freshPC: any) => {
    freshPC.name = name.trim();
    freshPC.race = selectedRace;
    freshPC.isHuman = (selectedRace === 'human');
    freshPC.alignment = alignmentEthical === 'Neutral' && alignmentMoral === 'Neutral' 
      ? 'Neutral' 
      : `${alignmentEthical} ${alignmentMoral}`;

    const lowSpeedRaces = ['dwarf', 'gnome', 'halfling', 'deep_halfling'];
    freshPC.baseBw = lowSpeedRaces.includes(selectedRace) ? 20 : 30;

    freshPC.str.base = baseStats.str;
    freshPC.dex.base = baseStats.dex;
    freshPC.con.base = baseStats.con;
    freshPC.int.base = baseStats.int;
    freshPC.wis.base = baseStats.wis;
    freshPC.cha.base = baseStats.cha;

    freshPC.levelIncreases = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
    levelConfigs.forEach(cfg => {
      if (cfg.abilityIncrease && freshPC.levelIncreases[cfg.abilityIncrease] !== undefined) {
        freshPC.levelIncreases[cfg.abilityIncrease]++;
      }
    });

    freshPC.classes = completedDraft.classesList.map((c: any) => ({
      classType: c.classType,
      level: c.level
    }));

    const conMod = completedDraft.statMods.con;
    let calculatedMaxHP = 0;
    levelConfigs.forEach(cfg => {
      const roll = parseInt(cfg.hpRoll) || 0;
      calculatedMaxHP += Math.max(1, roll + conMod);
    });
    freshPC.maxHP = calculatedMaxHP;
    freshPC.maxHp = calculatedMaxHP;
    freshPC.hp = calculatedMaxHP;
    freshPC.wounds = 0;
    freshPC.nonLethal = 0;

    freshPC.skills = { ...(completedDraft.allSkills || completedDraft.skillsAcc || completedDraft.draftPC?.skills || {}) };
    freshPC.skillTricks = Array.isArray(completedDraft.allSkillTricks)
      ? [...completedDraft.allSkillTricks]
      : Array.isArray(completedDraft.skillTricksList)
      ? [...completedDraft.skillTricksList]
      : Array.isArray(completedDraft.draftPC?.skillTricks)
      ? [...completedDraft.draftPC.skillTricks]
      : [];

    const allFeats: any[] = [];
    levelConfigs.forEach((cfg, lvlIdx) => {
      const slots = getFeatSlotsAtLevel(lvlIdx, cfg.classType, selectedRace, levelConfigs);
      slots.forEach((slot, sIdx) => {
        const fid = cfg.feats?.[sIdx] || slot.defaultFeat;
        if (fid && !allFeats.some(f => f.id === fid)) {
          allFeats.push({ id: fid });
        }
      });
      (cfg.feats || []).forEach((fid: string) => {
        if (fid && !allFeats.some(f => f.id === fid)) {
          allFeats.push({ id: fid });
        }
      });
    });
    freshPC.feats = allFeats;

    const allACFs: string[] = [];
    levelConfigs.forEach(cfg => {
      (cfg.acfs || []).forEach((acfKey: string) => {
        if (!allACFs.includes(acfKey)) {
          allACFs.push(acfKey);
        }
      });
    });
    freshPC.acfs = allACFs;

    freshPC.rebuildStatModifiers();
  });
}
