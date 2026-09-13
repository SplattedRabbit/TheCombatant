/**
 * @module    wizardSaveHelper
 * @summary   Applies completed Wizard character draft configuration to CombatState.
 */

import { CombatState } from '@core/state.js';
import { getFeatSlotsAtLevel } from './helpers.ts';
import { getAllCompendiumSpells } from '@core/rules.js';

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
    freshPC.levelAdjustment = (selectedRace === 'tiefling' || selectedRace === 'lizardfolk') ? 1 : 0;
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

    if (freshPC.classes.some((c: any) => c.classType === 'cleric') && (!freshPC.clericDomains || freshPC.clericDomains.length === 0)) {
      if (!freshPC.deity) freshPC.deity = 'none';
      freshPC.clericDomains = ['good', 'healing'];
    }

    if (freshPC.classes.some((c: any) => c.classType === 'wizard')) {
      freshPC.wizardSpecialization = completedDraft.wizardSpecialization || 'none';
      freshPC.wizardProhibited1 = completedDraft.wizardProhibited1 || '';
      freshPC.wizardProhibited2 = completedDraft.wizardProhibited2 || '';
    } else {
      freshPC.wizardSpecialization = 'none';
      freshPC.wizardProhibited1 = '';
      freshPC.wizardProhibited2 = '';
    }

    if (freshPC.classes.some((c: any) => c.classType === 'dragon_shaman')) {
      freshPC.dragonTotem = completedDraft.dragonTotem || 'red';
    } else {
      delete freshPC.dragonTotem;
    }

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
    const addFeatInstance = (featVal: any, optFallback?: string) => {
      if (!featVal) return;
      const fid = typeof featVal === 'object' ? featVal.id : featVal;
      if (!fid) return;
      const opt = typeof featVal === 'object' ? featVal.option : (optFallback || '');
      const alreadyHas = allFeats.some(f => f.id === fid && (f.option || '') === (opt || ''));
      if (!alreadyHas) {
        allFeats.push(opt ? { id: fid, option: opt } : { id: fid });
      }
    };

    levelConfigs.forEach((cfg, lvlIdx) => {
      const slots = getFeatSlotsAtLevel(lvlIdx, cfg.classType, selectedRace, levelConfigs);
      slots.forEach((slot, sIdx) => {
        const featVal = cfg.feats?.[sIdx] || slot.defaultFeat;
        const optFallback = cfg.featOptions?.[sIdx];
        addFeatInstance(featVal, optFallback);
      });
      (cfg.feats || []).forEach((featVal: any, fIdx: number) => {
        const optFallback = cfg.featOptions?.[fIdx];
        addFeatInstance(featVal, optFallback);
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

    // Reset gear, equipment, items, and inventory to empty/clean state
    if (selectedRace === 'lizardfolk') {
      freshPC.weapons = [
        { id: 'natural-claw', name: 'Claw', damage: '1d4', isNatural: true, isSecondary: false, strMult: 1.0, damageType: 'Slashing', grip: 'primary' },
        { id: 'natural-bite', name: 'Bite', damage: '1d4', isNatural: true, isSecondary: true, strMult: 0.5, damageType: 'Piercing/Slashing', grip: 'sec' }
      ];
    } else {
      freshPC.weapons = [];
    }
    freshPC.armors = [];
    freshPC.items = [];
    freshPC.autoAC = true;
    freshPC.acNatural = 0;
    freshPC.acDeflection = 0;
    freshPC.acMisc = 0;
    freshPC.dr = '';
    freshPC.immunities = '';
    freshPC.resistances = '';

    // Spells, spell slots, active buffs, and daily abilities
    freshPC.activeBuffs = [];
    freshPC.quickBuffs = [];
    freshPC.preparedSpells = [];
    freshPC.customSpells = [];
    freshPC.spellTemplates = {};
    freshPC.dailyAbilities = [];

    const allSelectedSpells: string[] = [];
    levelConfigs.forEach(cfg => {
      if (Array.isArray(cfg.spells)) {
        cfg.spells.forEach((spId: string) => {
          if (!allSelectedSpells.includes(spId)) {
            allSelectedSpells.push(spId);
          }
        });
      }
    });

    if (freshPC.classes.some((c: any) => c.classType === 'wizard')) {
      const allCompSpells = getAllCompendiumSpells(freshPC) as any[];
      allCompSpells.forEach(s => {
        const isWizCantrip = Array.isArray(s.classLevels) 
          ? s.classLevels.some((cl: any) => cl.class === 'wizard' && cl.level === 0)
          : (s.level === 0 && Array.isArray(s.classes) && s.classes.includes('wizard'));
        if (isWizCantrip) {
          if (freshPC.wizardProhibited1 && s.school && s.school.toLowerCase() === freshPC.wizardProhibited1.toLowerCase()) return;
          if (freshPC.wizardProhibited2 && s.school && s.school.toLowerCase() === freshPC.wizardProhibited2.toLowerCase()) return;
          if (!allSelectedSpells.includes(s.id)) {
            allSelectedSpells.push(s.id);
          }
        }
      });
    }
    freshPC.learnedSpells = allSelectedSpells;

    const cleanSpellSlots: Record<number, { max: number; used: number }> = {};
    for (let lvl = 0; lvl <= 9; lvl++) {
      cleanSpellSlots[lvl] = { max: 0, used: 0 };
    }
    freshPC.spellSlots = cleanSpellSlots;

    // Reset combat state flags, conditions, and companions
    freshPC.conditions = [];
    freshPC.isRaging = false;
    freshPC.isSneakAttacking = false;
    freshPC.isSmiteActive = false;
    freshPC.isFavoredEnemyActive = false;
    freshPC.isDefensiveFighting = false;
    freshPC.isTotalDefense = false;
    freshPC.isFlurrying = false;
    freshPC.isTrickyFightingActive = false;
    freshPC.powerAttackPenalty = 0;
    freshPC.combatExpertisePenalty = 0;
    freshPC.companionName = '';
    freshPC.companionType = 'none';
    freshPC.companionHP = 0;
    freshPC.companionMaxHP = 0;
    freshPC.familiarName = '';
    freshPC.familiarType = 'none';
    freshPC.familiarHP = 0;
    freshPC.activeShape = 'none';
    freshPC.originalStats = null;

    freshPC.rebuildStatModifiers();
  });
}
