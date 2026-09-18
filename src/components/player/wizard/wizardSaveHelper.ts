/**
 * @module    wizardSaveHelper
 * @summary   Applies completed Wizard character draft configuration to CombatState.
 */

import { CombatState } from '../../../../js/state.js';
import { getStorageAdapter } from '../../../../js/state/StorageManager.js';
import { getFeatSlotsAtLevel } from './helpers.feats.ts';
import { getAllCompendiumSpells } from '../../../../js/rules.js';
import { generateUUID } from '../../../utils/uuid.ts';

export interface WizardStatMods {
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
}

export interface WizardClassEntry {
  classType: string;
  level: number;
}

export interface WizardFeatObject {
  id: string;
  option?: string;
}

export type WizardFeatValue = string | WizardFeatObject | null | undefined;

export interface WizardLevelConfig {
  classType: string;
  hpRoll?: string | number;
  abilityIncrease?: string;
  spells?: string[];
  feats?: WizardFeatValue[];
  featOptions?: string[];
  acfs?: string[];
  prestigeSpellLinks?: Record<string, string>;
  prestigeSpecialTextConfirmed?: Record<string, boolean>;
}

export interface SkillValue {
  ranks?: number;
  misc?: number;
  spent?: number;
}

export type SkillEntryValue = number | SkillValue;

export interface WizardDraftPC {
  classesList?: WizardClassEntry[];
  classes?: WizardClassEntry[];
  wizardSpecialization?: string;
  wizardProhibited1?: string;
  wizardProhibited2?: string;
  dragonTotem?: string;
  prestigeSpellLinks?: Record<string, string>;
  prestigeSpecialTextConfirmed?: Record<string, boolean>;
  statMods?: WizardStatMods;
  allSkills?: Record<string, SkillEntryValue>;
  skillsAcc?: Record<string, SkillEntryValue>;
  allSkillTricks?: string[];
  skillTricksList?: string[];
  draftPC?: {
    prestigeSpellLinks?: Record<string, string>;
    prestigeSpecialTextConfirmed?: Record<string, boolean>;
    skills?: Record<string, SkillEntryValue>;
    skillTricks?: string[];
  };
  [key: string]: unknown;
}

export interface TargetPlayerCharacter {
  name: string;
  race: string;
  isHuman: boolean;
  levelAdjustment: number;
  alignment: string;
  baseBw: number;
  str: { base: number; [key: string]: unknown };
  dex: { base: number; [key: string]: unknown };
  con: { base: number; [key: string]: unknown };
  int: { base: number; [key: string]: unknown };
  wis: { base: number; [key: string]: unknown };
  cha: { base: number; [key: string]: unknown };
  levelIncreases: Record<string, number>;
  classes: WizardClassEntry[];
  clericDomains?: string[];
  deity?: string;
  wizardSpecialization?: string;
  wizardProhibited1?: string;
  wizardProhibited2?: string;
  dragonTotem?: string;
  favoredEnemy?: string;
  favoredEnemies?: Array<{ type: string; bonus: number }>;
  rangerCombatStyle?: string;
  prestigeSpellLinks?: Record<string, string>;
  prestigeSpecialTextConfirmed?: Record<string, boolean>;
  maxHP: number;
  maxHp: number;
  hp: number;
  wounds: number;
  nonLethal: number;
  skills: Record<string, unknown>;
  skillTricks: unknown[];
  feats: Array<{ id: string; option?: string }>;
  acfs: string[];
  weapons: unknown[];
  armors: unknown[];
  items: unknown[];
  autoAC: boolean;
  acNatural: number;
  acDeflection: number;
  acMisc: number;
  dr: string;
  immunities: string;
  resistances: string;
  activeBuffs: unknown[];
  quickBuffs: unknown[];
  preparedSpells: unknown[];
  customSpells: unknown[];
  spellTemplates: Record<string, unknown>;
  dailyAbilities: unknown[];
  learnedSpells: string[];
  spellSlots: Record<number, { max: number; used: number }>;
  conditions: unknown[];
  isRaging: boolean;
  isSneakAttacking: boolean;
  isSmiteActive: boolean;
  isFavoredEnemyActive: boolean;
  isDefensiveFighting: boolean;
  isTotalDefense: boolean;
  isFlurrying: boolean;
  isTrickyFightingActive: boolean;
  powerAttackPenalty: number;
  combatExpertisePenalty: number;
  companionName: string;
  companionType: string;
  companionHP: number;
  companionMaxHP: number;
  familiarName: string;
  familiarType: string;
  familiarHP: number;
  activeShape: string;
  originalStats: unknown;
  rebuildStatModifiers: () => void;
}

export function applyWizardCharacterToState(
  name: string,
  selectedRace: string,
  alignmentEthical: string,
  alignmentMoral: string,
  baseStats: { str: number; dex: number; con: number; int: number; wis: number; cha: number },
  levelConfigs: WizardLevelConfig[],
  completedDraft: WizardDraftPC
) {
  const newCharId = generateUUID();
  const _adapter = getStorageAdapter();
  if (typeof (_adapter as any)?.setActiveCharacterId === 'function') {
    (_adapter as any).setActiveCharacterId(newCharId);
  }

  CombatState.updatePCBatch((freshPC: TargetPlayerCharacter) => {
    // Assign a fresh UUID so local state treats this as a new combatant,
    // not a mutation of the previously active PC.
    (freshPC as any).id = newCharId;
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
    levelConfigs.forEach((cfg: WizardLevelConfig) => {
      if (cfg.abilityIncrease && freshPC.levelIncreases[cfg.abilityIncrease] !== undefined) {
        freshPC.levelIncreases[cfg.abilityIncrease]++;
      }
    });

    freshPC.classes = (completedDraft.classesList || []).map((c: WizardClassEntry) => ({
      classType: c.classType,
      level: c.level
    }));

    if (freshPC.classes.some((c: WizardClassEntry) => c.classType === 'cleric') && (!freshPC.clericDomains || freshPC.clericDomains.length === 0)) {
      if (!freshPC.deity) freshPC.deity = 'none';
      freshPC.clericDomains = ['good', 'healing'];
    }

    if (freshPC.classes.some((c: WizardClassEntry) => c.classType === 'wizard')) {
      freshPC.wizardSpecialization = completedDraft.wizardSpecialization || 'none';
      freshPC.wizardProhibited1 = completedDraft.wizardProhibited1 || '';
      freshPC.wizardProhibited2 = completedDraft.wizardProhibited2 || '';
    } else {
      freshPC.wizardSpecialization = 'none';
      freshPC.wizardProhibited1 = '';
      freshPC.wizardProhibited2 = '';
    }

    if (freshPC.classes.some((c: WizardClassEntry) => c.classType === 'dragon_shaman')) {
      freshPC.dragonTotem = completedDraft.dragonTotem || 'red';
    } else {
      delete freshPC.dragonTotem;
    }


    // Persist prestige class spell links and prerequisite confirmations
    freshPC.prestigeSpellLinks = { ...(completedDraft.prestigeSpellLinks || completedDraft.draftPC?.prestigeSpellLinks || {}) };
    freshPC.prestigeSpecialTextConfirmed = { ...(completedDraft.prestigeSpecialTextConfirmed || completedDraft.draftPC?.prestigeSpecialTextConfirmed || {}) };

    const conMod = completedDraft.statMods?.con ?? 0;
    let calculatedMaxHP = 0;
    levelConfigs.forEach((cfg: WizardLevelConfig) => {
      const roll = typeof cfg.hpRoll === 'number' ? cfg.hpRoll : (parseInt(String(cfg.hpRoll || 0), 10) || 0);
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

    const allFeats: Array<{ id: string; option?: string }> = [];
    const addFeatInstance = (featVal: WizardFeatValue, optFallback?: string) => {
      if (!featVal) return;
      const fid = typeof featVal === 'object' ? featVal.id : featVal;
      if (!fid) return;
      const opt = typeof featVal === 'object' ? featVal.option : (optFallback || '');
      const alreadyHas = allFeats.some(f => f.id === fid && (f.option || '') === (opt || ''));
      if (!alreadyHas) {
        allFeats.push(opt ? { id: fid, option: opt } : { id: fid });
      }
    };

    levelConfigs.forEach((cfg: WizardLevelConfig, lvlIdx: number) => {
      const slots = getFeatSlotsAtLevel(lvlIdx, cfg.classType, selectedRace, levelConfigs);
      slots.forEach((slot, sIdx) => {
        const featVal = cfg.feats?.[sIdx] || slot.defaultFeat;
        const optFallback = cfg.featOptions?.[sIdx];
        addFeatInstance(featVal, optFallback);
      });
      (cfg.feats || []).forEach((featVal: WizardFeatValue, fIdx: number) => {
        const optFallback = cfg.featOptions?.[fIdx];
        addFeatInstance(featVal, optFallback);
      });
    });
    freshPC.feats = allFeats;

    const hasRanger = freshPC.classes.some((c: WizardClassEntry) => c.classType === 'ranger');
    if (hasRanger) {
      let style = 'none';
      if (allFeats.some(f => f.id === 'rapid_shot' || f.id === 'manyshot')) {
        style = 'archery';
      } else if (allFeats.some(f => f.id === 'two_weapon_fighting' || f.id === 'improved_two_weapon_fighting')) {
        style = 'twoweapon';
      }
      freshPC.rangerCombatStyle = style;
      if (Array.isArray(completedDraft.favoredEnemies) && completedDraft.favoredEnemies.length > 0) {
        freshPC.favoredEnemies = completedDraft.favoredEnemies as Array<{ type: string; bonus: number }>;
        freshPC.favoredEnemy = (completedDraft.favoredEnemies as any[]).map((e: any) => `${e.type} (+${e.bonus})`).join(', ');
      }
    } else {
      freshPC.rangerCombatStyle = 'none';
    }

    const allACFs: string[] = [];
    levelConfigs.forEach((cfg: WizardLevelConfig) => {
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
    levelConfigs.forEach((cfg: WizardLevelConfig) => {
      if (Array.isArray(cfg.spells)) {
        cfg.spells.forEach((spId: string) => {
          if (!allSelectedSpells.includes(spId)) {
            allSelectedSpells.push(spId);
          }
        });
      }
    });

    if (freshPC.classes.some((c: WizardClassEntry) => c.classType === 'wizard')) {
      const allCompSpells = (getAllCompendiumSpells(freshPC) || []) as Array<{
        id: string;
        name?: string;
        level?: number;
        school?: string;
        classLevels?: Array<{ class: string; level: number }>;
        classes?: string[];
      }>;
      allCompSpells.forEach(s => {
        const isWizCantrip = Array.isArray(s.classLevels) 
          ? s.classLevels.some((cl: { class: string; level: number }) => cl.class === 'wizard' && cl.level === 0)
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

  if (_adapter && typeof (_adapter as any).saveCharacter === 'function') {
    try {
      const fullState = CombatState.getState();
      (_adapter as any).saveCharacter(newCharId, fullState);
    } catch (err) {
      console.warn('[wizardSaveHelper] Failed to sync new character to roster:', err);
    }
  }
}
