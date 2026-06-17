/**
 * @module    CharacterWizardDialog
 * @summary   Step-by-step wizard for rules-compliant (RAW) character creation for D&D 3.5e.
 *            Offers a full layout with 74-point buy distribution, level-up loop,
 *            skill points distribution, and feat selection with prerequisites check.
 */

import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { CombatRules } from '@core/rules.js';
// @ts-ignore
import { checkFeatPrerequisites, CombatFeats } from '@core/data/feats-data.js';
// @ts-ignore
import { SKILLS_REGISTRY } from '@core/data/skills-data.js';
import { showAttributeExplanation } from './attributeHelper';
// @ts-ignore
import { showCustomAlert } from '@core/ui/components/dialogs.js';

interface CharacterWizardDialogProps {
  onClose: () => void;
}

interface RaceDetail {
  key: string;
  name: string;
  modifiers: string;
  size: 'Medium' | 'Small';
  traits: string[];
}

const translatePrereq = (desc: string): string => {
  if (!desc) return '';
  let res = desc;
  res = res.replace(/Grundangriffsbonus/g, 'Base Attack Bonus');
  res = res.replace(/aktuell/g, 'current');
  res = res.replace(/Talent:/g, 'Feat:');
  res = res.replace(/Stufe/g, 'Level');
  res = res.replace(/Stärke/g, 'Strength');
  res = res.replace(/Geschicklichkeit/g, 'Dexterity');
  res = res.replace(/Konstitution/g, 'Constitution');
  res = res.replace(/Intelligenz/g, 'Intelligence');
  res = res.replace(/Weisheit/g, 'Wisdom');
  res = res.replace(/Charisma/g, 'Charisma');
  res = res.replace(/Charakterstufe/g, 'Character Level');
  res = res.replace(/Zaubererstufe/g, 'Caster Level');
  res = res.replace(/Klasse:/g, 'Class:');
  res = res.replace(/Fähigkeit, Untote zu vertreiben/g, 'Ability to turn undead');
  res = res.replace(/Kleriker/g, 'Cleric');
  res = res.replace(/Paladin/g, 'Paladin');
  res = res.replace(/Bardenmusik/g, 'Bardic music');
  res = res.replace(/Barde/g, 'Bard');
  res = res.replace(/Tiergestalt/g, 'Wild Shape');
  res = res.replace(/Druide/g, 'Druid');
  res = res.replace(/Reiten 1 Rang/g, 'Ride 1 rank');
  
  res = res.replace(/\bfighter\b/g, 'Fighter');
  res = res.replace(/\brogue\b/g, 'Rogue');
  res = res.replace(/\bcleric\b/g, 'Cleric');
  res = res.replace(/\bwizard\b/g, 'Wizard');
  res = res.replace(/\bbarbarian\b/g, 'Barbarian');
  res = res.replace(/\bbard\b/g, 'Bard');
  res = res.replace(/\bdruid\b/g, 'Druid');
  res = res.replace(/\bmonk\b/g, 'Monk');
  res = res.replace(/\bpaladin\b/g, 'Paladin');
  res = res.replace(/\branger\b/g, 'Ranger');
  res = res.replace(/\bsorcerer\b/g, 'Sorcerer');

  return res;
};

const RACES: RaceDetail[] = [
  {
    key: 'human',
    name: 'Human',
    modifiers: 'No modifiers',
    size: 'Medium',
    traits: [
      'Bonus feat at level 1.',
      '4 extra skill points at level 1, plus 1 extra point at each additional level.',
      'No ability penalties.'
    ]
  },
  {
    key: 'elf',
    name: 'Elf',
    modifiers: '+2 Dexterity (DEX), -2 Constitution (CON)',
    size: 'Medium',
    traits: [
      '+2 racial bonus on Listen, Search, and Spot checks.',
      'Immunity to magic sleep effects.',
      '+2 racial bonus on saving throws against enchantment spells or effects.',
      'Weapon Proficiency: Longsword, rapier, longbow, and shortbow.'
    ]
  },
  {
    key: 'dwarf',
    name: 'Dwarf',
    modifiers: '+2 Constitution (CON), -2 Charisma (CHA)',
    size: 'Medium',
    traits: [
      'Darkvision 60 ft. (can see in the dark).',
      '+2 racial bonus on saving throws against poisons, spells, and spell-like effects.',
      '+2 racial bonus on Craft checks related to stone and metal.',
      'Stability (+4 bonus on ability checks made to resist being bull rushed or tripped).'
    ]
  },
  {
    key: 'gnome',
    name: 'Gnome',
    modifiers: '+2 Constitution (CON), -2 Strength (STR)',
    size: 'Small',
    traits: [
      'Size: Small (+1 bonus to Armor Class, +1 bonus on attack rolls, +4 bonus on Hide checks).',
      '+2 racial bonus on Listen and Craft (alchemy) checks.',
      '+1 racial bonus on saving throws against illusions.',
      '+1 racial attack bonus against kobolds and goblins.'
    ]
  },
  {
    key: 'halfling',
    name: 'Halfling',
    modifiers: '+2 Dexterity (DEX), -2 Strength (STR)',
    size: 'Small',
    traits: [
      'Size: Small (+1 bonus to Armor Class, +1 bonus on attack rolls, +4 bonus on Hide checks).',
      '+2 racial bonus on Climb, Jump, Listen, and Move Silently checks.',
      '+1 racial bonus on all saving throws.',
      '+2 racial bonus on saving throws against fear.'
    ]
  },
  {
    key: 'half_elf',
    name: 'Half-Elf',
    modifiers: 'No modifiers',
    size: 'Medium',
    traits: [
      'Immunity to magic sleep effects.',
      '+2 racial bonus on saving throws against enchantment spells or effects.',
      '+1 racial bonus on Listen, Search, and Spot checks.',
      '+2 racial bonus on Diplomacy and Gather Information checks.'
    ]
  },
  {
    key: 'half_orc',
    name: 'Half-Orc',
    modifiers: '+2 Strength (STR), -2 Intelligence (INT), -2 Charisma (CHA)',
    size: 'Medium',
    traits: [
      'Darkvision 60 ft. (can see in the dark).',
      'Particularly strong, but has lower mental stats.'
    ]
  },
  {
    key: 'tiefling',
    name: 'Tiefling',
    modifiers: '+2 Dexterity (DEX), +2 Intelligence (INT), -2 Charisma (CHA)',
    size: 'Medium',
    traits: [
      'Type: Outsider (Native) (immune to person-targeting spells like Charm Person).',
      'Darkvision 60 ft. (can see in the dark).',
      'Resistances: Resistance to cold 5, electricity 5, and fire 5.',
      '+2 racial bonus on Bluff and Hide checks.',
      'Darkness: Can use Darkness as a spell-like ability 1/day.',
      'Level Adjustment: +1 (increases ECL by 1).'
    ]
  }
];

const CLASS_KEY_ATTRIBUTES: Record<string, string[]> = {
  fighter: ['str', 'con', 'dex'],
  rogue: ['dex', 'int'],
  cleric: ['wis', 'cha', 'con'],
  wizard: ['int', 'con', 'dex'],
  barbarian: ['str', 'con', 'dex'],
  bard: ['cha', 'dex', 'int'],
  druid: ['wis', 'con'],
  monk: ['wis', 'dex', 'str', 'con'],
  paladin: ['cha', 'str', 'wis', 'con'],
  ranger: ['dex', 'str', 'wis'],
  sorcerer: ['cha', 'dex', 'con']
};

const CLASSES_LIST = [
  { key: 'fighter', name: 'Fighter', hd: 10, skillBase: 2, desc: 'Melee combat specialist, gains many bonus feats.' },
  { key: 'rogue', name: 'Rogue', hd: 6, skillBase: 8, desc: 'Trap disarmer, sneak attack, extremely high number of skills.' },
  { key: 'cleric', name: 'Cleric', hd: 8, skillBase: 2, desc: 'Divine spellcaster, armor wearer, turn undead.' },
  { key: 'wizard', name: 'Wizard', hd: 4, skillBase: 2, desc: 'Arcane spellcaster with a spellbook, powerful spells.' },
  { key: 'barbarian', name: 'Barbarian', hd: 12, skillBase: 2, desc: 'Tough warrior in a rage, high hit die.' },
  { key: 'bard', name: 'Bard', hd: 6, skillBase: 4, desc: 'Supporter with songs, spells, and versatile abilities.' },
  { key: 'druid', name: 'Druid', hd: 8, skillBase: 4, desc: 'Nature spellcaster, wild shape transformation, animal companion.' },
  { key: 'monk', name: 'Monk', hd: 8, skillBase: 4, desc: 'Unarmed martial artist, high AC, and fast movement.' },
  { key: 'paladin', name: 'Paladin', hd: 10, skillBase: 2, desc: 'Holy warrior, lay on hands, immunities.' },
  { key: 'ranger', name: 'Ranger', hd: 8, skillBase: 6, desc: 'Tracker, favored enemy, two-weapon fighting or archery.' },
  { key: 'sorcerer', name: 'Sorcerer', hd: 4, skillBase: 2, desc: 'Spontaneous arcane spellcaster with innate magic.' }
];

export const CharacterWizardDialog: React.FC<CharacterWizardDialogProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState<string>('human');

  // Highlight class key attributes in Point-Buy
  const [highlightClass, setHighlightClass] = useState<string>('');

  // Step 2 State (Ability Scores Point-Buy 74 Points)
  const [baseStats, setBaseStats] = useState({
    str: 12,
    dex: 12,
    con: 12,
    int: 12,
    wis: 13,
    cha: 13
  });

  // Step 3 State (Level Progression Loop)
  const [targetLevel, setTargetLevel] = useState<number>(1);
  const [isTargetLevelSet, setIsTargetLevelSet] = useState(false);
  const [levelConfigs, setLevelConfigs] = useState<any[]>([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  // Feat Selection Sub-Modal State
  const [featSelectSlotIndex, setFeatSelectSlotIndex] = useState<number | null>(null);
  const [featSearch, setFeatSearch] = useState('');
  const [featFilter, setFeatFilter] = useState('all');

  // Skill Search State
  const [skillSearch, setSkillSearch] = useState('');

  // Right column active tab ('skills' or 'feats')
  const [activeTab, setActiveTab] = useState<'skills' | 'feats'>('skills');

  const activeRaceInfo = RACES.find(r => r.key === selectedRace);

  const getRacialModifier = (race: string, stat: string): number => {
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
    if (race === 'halfling') {
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
    return 0;
  };

  const getMod = (score: number) => {
    return score >= 10
      ? Math.floor((score - 10) / 2)
      : (score === 9 || score === 8 ? -1 : (score === 7 || score === 6 ? -2 : (score === 5 || score === 4 ? -4 : -5)));
  };

  const getRacialModifierString = (stat: string): string => {
    const mod = getRacialModifier(selectedRace, stat);
    if (mod > 0) return `+${mod}`;
    if (mod < 0) return `${mod}`;
    return '';
  };

  // Sum of distributed base points (must equal 74)
  const totalStatsSpent = baseStats.str + baseStats.dex + baseStats.con + baseStats.int + baseStats.wis + baseStats.cha;

  // Helper to compile the draft character state up to the current level index
  const getDraftPCState = (lvlIdx: number) => {
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
      if (cfg && Array.isArray(cfg.feats)) {
        featsList.push(...cfg.feats);
      }
    }

    // Skill ranks up to lvlIdx-1 (accumulated)
    const skillsAcc: Record<string, { ranks: number, misc: number }> = {};
    for (let i = 0; i < lvlIdx; i++) {
      const cfg = levelConfigs[i];
      if (cfg && cfg.skills) {
        Object.entries(cfg.skills).forEach(([sKey, clicks]) => {
          if (!skillsAcc[sKey]) {
            skillsAcc[sKey] = { ranks: 0, misc: 0 };
          }
          // Each click in class skill = 1.0 rank, cross-class = 0.5 ranks
          const wasClass = CombatRules.CLASS_SKILLS[cfg.classType]?.includes(sKey) || 
                           (sKey.startsWith('knowledge_') && (cfg.classType === 'wizard' || cfg.classType === 'bard'));
          const increment = wasClass ? 1.0 : 0.5;
          skillsAcc[sKey].ranks += (clicks as number) * increment;
        });
      }
    }

    const draftPC = {
      race: selectedRace,
      isHuman: selectedRace === 'human',
      level: lvlIdx + 1,
      classes: classesList,
      str: { getValue: () => stats.str },
      dex: { getValue: () => stats.dex },
      con: { getValue: () => stats.con },
      int: { getValue: () => stats.int },
      wis: { getValue: () => stats.wis },
      cha: { getValue: () => stats.cha },
      getAttributeMod: (attrName: string) => statMods[attrName as keyof typeof statMods] || 0,
      bab: { getValue: () => babVal },
      feats: featsList.map(fid => ({ id: fid })),
      skills: skillsAcc,
      getSkillRanks: (skillKey: string) => skillsAcc[skillKey]?.ranks || 0,
      getSkillMisc: () => 0,
      getArmorCheckPenalty: () => 0
    };

    return {
      stats,
      statMods,
      classesList,
      babVal,
      featsList,
      skillsAcc,
      draftPC
    };
  };

  // Helper to determine feat slots at a level
  const getFeatSlotsAtLevel = (lvlIdx: number, currentClassType: string) => {
    const slots: { label: string; allowedCategories: string[]; defaultFeat?: string }[] = [];
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
          label: `Wizard Bonus Feat (Scribe Scroll)`,
          allowedCategories: ['item_creation'],
          defaultFeat: 'scribe_scroll'
        });
      } else if (classLevel % 5 === 0) {
        slots.push({
          label: `Wizard Bonus Feat (Class Level ${classLevel})`,
          allowedCategories: ['metamagic', 'item_creation']
        });
      }
    }

    return slots;
  };

  const handleStartLevelConfigs = () => {
    const configs = [];
    for (let i = 0; i < targetLevel; i++) {
      const clsType = i === 0 ? 'fighter' : '';
      configs.push({
        level: i + 1,
        classType: clsType,
        hpRoll: i === 0 ? 10 : 0,
        abilityIncrease: null,
        skills: {}, // skillKey -> clicks count (every click costs 1 skillpoint)
        feats: []
      });
    }
    setLevelConfigs(configs);
    setIsTargetLevelSet(true);
    setCurrentLevelIndex(0);
  };

  const updateLevelConfig = (idx: number, key: string, val: any) => {
    const next = [...levelConfigs];
    next[idx] = { ...next[idx], [key]: val };
    
    // Automatically set default HP roll at level 1 when class changes
    if (idx === 0 && key === 'classType') {
      const hd = getClassHitDie(val);
      next[0].hpRoll = hd;
    }

    setLevelConfigs(next);
  };

  const getClassHitDie = (cls: string): number => {
    const matched = CLASSES_LIST.find(c => c.key === cls);
    return matched ? matched.hd : 6;
  };

  // Compile active level data
  const currentConfig = levelConfigs[currentLevelIndex] || {};
  const currentDraft = isTargetLevelSet ? getDraftPCState(currentLevelIndex) : null;

  // Calculate skill points for current level
  const getSkillPointsForLevel = (lvlIdx: number, clsKey: string) => {
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

  const currentLevelMaxSkillPoints = getSkillPointsForLevel(currentLevelIndex, currentConfig.classType);
  const currentLevelSpentSkillPoints = Object.values(currentConfig.skills || {}).reduce((a: any, b: any) => a + b, 0) as number;
  const currentLevelRemainingSkillPoints = currentLevelMaxSkillPoints - currentLevelSpentSkillPoints;

  // Feat slots for current level
  const currentFeatSlots = isTargetLevelSet ? getFeatSlotsAtLevel(currentLevelIndex, currentConfig.classType) : [];

  // Reset tab to skills on level change
  useEffect(() => {
    setActiveTab('skills');
  }, [currentLevelIndex]);

  // Auto-select first selectable feat slot when level or class changes
  useEffect(() => {
    if (currentFeatSlots.length > 0) {
      const firstSelectable = currentFeatSlots.findIndex(s => !s.defaultFeat);
      if (firstSelectable !== -1) {
        setFeatSelectSlotIndex(firstSelectable);
      } else {
        setFeatSelectSlotIndex(null);
      }
    } else {
      setFeatSelectSlotIndex(null);
    }
  }, [currentLevelIndex, currentConfig.classType]);

  // Reset search and filter when active feat slot changes
  useEffect(() => {
    setFeatSearch('');
    setFeatFilter('all');
  }, [featSelectSlotIndex]);

  // Automatically sync/fill default feats
  useEffect(() => {
    if (isTargetLevelSet && currentFeatSlots.length > 0 && Array.isArray(currentConfig.feats)) {
      let changed = false;
      const nextFeats = [...currentConfig.feats];
      currentFeatSlots.forEach((slot, slotIdx) => {
        if (slot.defaultFeat && nextFeats[slotIdx] !== slot.defaultFeat) {
          nextFeats[slotIdx] = slot.defaultFeat;
          changed = true;
        }
      });
      if (changed) {
        updateLevelConfig(currentLevelIndex, 'feats', nextFeats);
      }
    }
  }, [currentLevelIndex, currentConfig.classType, isTargetLevelSet]);

  const handleNext = () => {
    if (step === 1 && name.trim() && selectedRace) {
      setStep(2);
    } else if (step === 2 && totalStatsSpent === 74) {
      const invalidStats = Object.entries(baseStats).filter(([_, val]) => val < 3 || val > 18);
      if (invalidStats.length > 0) {
        showCustomAlert(
          "Ungültige Attribute",
          "Alle Basis-Attributswerte müssen vor der Anwendung von Volks-Modifikatoren zwischen 3 und 18 liegen.",
          "OK",
          "🎲"
        );
        return;
      }
      setStep(3);
    } else if (step === 3) {
      // Validate active level first
      const hp = parseInt(currentConfig.hpRoll) || 0;
      const hd = getClassHitDie(currentConfig.classType);
      if (!currentConfig.classType) {
        showCustomAlert("Class Missing", "Please select a class for this level.", "OK", "🧙‍♂️");
        return;
      }
      if (hp < 1 || hp > hd) {
        showCustomAlert("Invalid Hit Points", `Please enter a valid hit points value between 1 and ${hd}.`, "OK", "🎲");
        return;
      }
      const isAbilityIncreaseReq = (currentLevelIndex + 1) % 4 === 0;
      if (isAbilityIncreaseReq && !currentConfig.abilityIncrease) {
        showCustomAlert("Ability Increase Missing", "Please select an ability increase for this level.", "OK", "✨");
        return;
      }
      if (currentLevelRemainingSkillPoints !== 0) {
        showCustomAlert("Skill Points Unassigned", `You must distribute all ${currentLevelMaxSkillPoints} skill points (remaining: ${currentLevelRemainingSkillPoints}).`, "OK", "📝");
        return;
      }
      // Check if all feat slots are filled
      const emptyFeats = currentFeatSlots.some((_, idx) => !currentConfig.feats?.[idx]);
      if (emptyFeats) {
        showCustomAlert("Feats Unassigned", "Please select all feats for this level.", "OK", "🔒");
        return;
      }

      if (currentLevelIndex < targetLevel - 1) {
        setCurrentLevelIndex(currentLevelIndex + 1);
      } else {
        setStep(4);
      }
    }
  };

  const handleBack = () => {
    if (step === 3) {
      if (currentLevelIndex > 0) {
        setCurrentLevelIndex(currentLevelIndex - 1);
      } else {
        setIsTargetLevelSet(false);
        setStep(2);
      }
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSaveCharacter = () => {
    CombatState.updatePCBatch((pc: any) => {
      pc.name = name.trim() || 'Hero';
      pc.race = selectedRace;
      pc.isHuman = selectedRace === 'human';
      pc.levelAdjustment = selectedRace === 'tiefling' ? 1 : 0;
      pc.resistances = selectedRace === 'tiefling' ? 'Cold 5, Electricity 5, Fire 5' : '';
      
      // Set base stats from point-buy
      pc.str.base = baseStats.str;
      pc.dex.base = baseStats.dex;
      pc.con.base = baseStats.con;
      pc.int.base = baseStats.int;
      pc.wis.base = baseStats.wis;
      pc.cha.base = baseStats.cha;

      // Apply level-up ability increases
      levelConfigs.forEach(cfg => {
        if (cfg.abilityIncrease) {
          pc[cfg.abilityIncrease].base += 1;
        }
      });

      // Clear existing classes and add from wizard loop
      pc.classes = [];
      levelConfigs.forEach(cfg => {
        const existing = pc.classes.find((c: any) => c.classType === cfg.classType);
        if (existing) {
          existing.level += 1;
        } else {
          pc.classes.push({ classType: cfg.classType, level: 1 });
        }
      });

      // Apply racial modifiers directly to the base stats inside combatant class to align with tests
      const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
      statKeys.forEach(k => {
        const mod = getRacialModifier(selectedRace, k);
        pc[k].base += mod;
      });

      // Build classesList to find final CON mod
      const finalConMod = getMod(pc.con.base);
      const totalHP = levelConfigs.reduce((sum, cfg) => sum + Math.max(1, cfg.hpRoll + finalConMod), 0);
      pc.maxHP = totalHP;
      pc.hp = totalHP;

      // Compile and save skills
      pc.skills = {};
      levelConfigs.forEach(cfg => {
        if (cfg.skills) {
          Object.entries(cfg.skills).forEach(([sKey, clicks]) => {
            if (!pc.skills[sKey]) {
              pc.skills[sKey] = { ranks: 0, misc: 0 };
            }
            const isClass = CombatRules.CLASS_SKILLS[cfg.classType]?.includes(sKey) || 
                            (sKey.startsWith('knowledge_') && (cfg.classType === 'wizard' || cfg.classType === 'bard'));
            const increment = isClass ? 1.0 : 0.5;
            pc.skills[sKey].ranks += (clicks as number) * increment;
          });
        }
      });

      // Compile and save feats
      pc.feats = [];
      const addedFeatIds = new Set<string>();
      levelConfigs.forEach(cfg => {
        if (Array.isArray(cfg.feats)) {
          cfg.feats.forEach((fid: string) => {
            if (fid && !addedFeatIds.has(fid)) {
              addedFeatIds.add(fid);
              const featDef = CombatFeats.REGISTRY[fid];
              pc.feats.push({
                id: fid,
                nameDe: featDef?.nameDe || fid,
                nameEn: featDef?.nameEn || fid,
                benefitDe: featDef?.benefitDe || '',
                appEffect: featDef?.appEffect || ''
              });
            }
          });
        }
      });
    });

    // Redirect to player sheet
    CombatState.setRole('player');
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left', marginTop: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--red)', letterSpacing: '0.5px' }}>
                Character Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="cinput"
                placeholder="Enter adventurer name..."
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  fontFamily: "'Crimson Text', serif",
                  fontSize: '14px',
                  padding: '6px 12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginTop: '10px' }}>
              {/* Race Grid */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--red)', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>
                  Select Race
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {RACES.map(race => (
                    <div
                      key={race.key}
                      onClick={() => setSelectedRace(race.key)}
                      style={{
                        padding: '12px 10px',
                        background: selectedRace === race.key ? 'rgba(139, 26, 26, 0.08)' : 'rgba(244, 232, 193, 0.4)',
                        border: selectedRace === race.key ? '2px solid var(--red)' : '1px solid var(--pb)',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: selectedRace === race.key ? 'var(--red)' : 'var(--ink)',
                        transition: 'all 0.2s',
                        boxShadow: selectedRace === race.key ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
                      }}
                    >
                      {race.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Race Details panel */}
              <div 
                style={{
                  background: 'rgba(244, 232, 193, 0.25)',
                  border: '1.5px dashed var(--pb)',
                  borderRadius: '4px',
                  padding: '16px 20px',
                  height: '310px',
                  boxSizing: 'border-box',
                  overflowY: 'auto'
                }}
              >
                {activeRaceInfo ? (
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'var(--red)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                      {activeRaceInfo.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--inkl)', marginBottom: '12px', fontStyle: 'italic' }}>
                      Size: {activeRaceInfo.size === 'Small' ? 'Small' : 'Medium'}
                    </div>
                    <div style={{ fontSize: '13px', marginBottom: '14px' }}>
                      <strong>Abilities:</strong>{' '}
                      <span style={{ color: activeRaceInfo.modifiers.includes('+') ? 'green' : 'inherit', fontWeight: 'bold' }}>
                        {activeRaceInfo.modifiers}
                      </span>
                    </div>
                    <div style={{ borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', paddingTop: '10px' }}>
                      <strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--ink)' }}>Racial Traits:</strong>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', fontFamily: "'Crimson Text', serif", lineHeight: 1.45, color: 'var(--ink)' }}>
                        {activeRaceInfo.traits.map((t, idx) => (
                          <li key={idx} style={{ marginBottom: '6px' }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '13px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5 }}>
                    Hover over or select a race to view its details.
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <p style={{ fontFamily: "'Crimson Text', serif", fontSize: '14px', margin: '0 0 20px 0', lineHeight: 1.5, color: 'var(--inkm)' }}>
              Distribute a total of **74 points** among your 6 ability scores. Racial bonuses are calculated separately and displayed live on the right as final values.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
              {/* Point buy selectors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(k => {
                  const labelMap = { str: 'Strength (STR)', dex: 'Dexterity (DEX)', con: 'Constitution (CON)', int: 'Intelligence (INT)', wis: 'Wisdom (WIS)', cha: 'Charisma (CHA)' };
                  const base = baseStats[k];
                  const racMod = getRacialModifier(selectedRace, k);
                  const finalVal = base + racMod;
                  const finalMod = getMod(finalVal);
                  const finalModStr = finalMod >= 0 ? `+${finalMod}` : `${finalMod}`;
                  const isKeyAttr = highlightClass ? CLASS_KEY_ATTRIBUTES[highlightClass]?.includes(k) : false;
                  
                  return (
                    <div 
                      key={k} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: isKeyAttr ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 232, 193, 0.3)',
                        border: isKeyAttr ? '1.5px solid rgba(76, 175, 80, 0.5)' : '1px solid var(--pb)',
                        borderRadius: '4px'
                      }}
                    >
                      <strong 
                        style={{ 
                          fontSize: '13px', 
                          width: '150px', 
                          cursor: 'pointer', 
                          borderBottom: '1px dashed var(--red)'
                        }}
                        onClick={() => showAttributeExplanation(k)}
                        title="Click for a brief explanation"
                      >
                        {labelMap[k]}
                        {isKeyAttr && <span style={{ color: 'green', fontSize: '9px', marginLeft: '4px', display: 'inline-block' }}>★ Key</span>}
                      </strong>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '2px 8px', fontSize: '12px' }}
                          disabled={base <= 3}
                          onClick={() => setBaseStats({ ...baseStats, [k]: base - 1 })}
                        >
                          -
                        </button>
                        
                        <input
                          type="number"
                          value={base}
                          onChange={(e) => {
                            let val = parseInt(e.target.value);
                            if (isNaN(val)) {
                              setBaseStats({ ...baseStats, [k]: 0 });
                              return;
                            }
                            if (val > 18) val = 18;
                            const theoreticalSum = totalStatsSpent - base + val;
                            if (theoreticalSum <= 74) {
                              setBaseStats({ ...baseStats, [k]: val });
                            } else {
                              const remaining = 74 - (totalStatsSpent - base);
                              setBaseStats({ ...baseStats, [k]: Math.min(18, remaining) });
                            }
                          }}
                          onBlur={(e) => {
                            let val = parseInt(e.target.value);
                            if (isNaN(val) || val < 3) val = 3;
                            if (val > 18) val = 18;
                            const theoreticalSum = totalStatsSpent - base + val;
                            if (theoreticalSum <= 74) {
                              setBaseStats({ ...baseStats, [k]: val });
                            } else {
                              const remaining = 74 - (totalStatsSpent - base);
                              setBaseStats({ ...baseStats, [k]: Math.min(18, Math.max(3, remaining)) });
                            }
                          }}
                          min={3}
                          max={18}
                          style={{
                            width: '40px',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            border: '1px solid var(--pb)',
                            background: 'white',
                            borderRadius: '3px',
                            padding: '3px 0'
                          }}
                        />

                        <button 
                          className="btn" 
                          style={{ padding: '2px 8px', fontSize: '12px' }}
                          disabled={base >= 18 || totalStatsSpent >= 74}
                          onClick={() => setBaseStats({ ...baseStats, [k]: base + 1 })}
                        >
                          +
                        </button>
                      </div>
                      
                      <div style={{ fontSize: '11px', color: 'var(--inkl)', fontStyle: 'italic', width: '60px', textAlign: 'center' }}>
                        {getRacialModifierString(k) ? `${getRacialModifierString(k)} Race` : '—'}
                      </div>

                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--red)', width: '90px', textAlign: 'right' }}>
                        = {finalVal} ({finalModStr})
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary box */}
              <div 
                style={{ 
                  background: 'rgba(200, 169, 110, 0.08)', 
                  border: '1px solid var(--pb)', 
                  borderRadius: '4px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '260px'
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--inkl)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                  Point Distribution
                </div>
                
                <div style={{ fontSize: '64px', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif", color: totalStatsSpent === 74 ? 'green' : 'var(--red)' }}>
                  {totalStatsSpent} <span style={{ fontSize: '20px', color: 'var(--ink)' }}>/ 74</span>
                </div>
                
                <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--inkm)', textAlign: 'center', marginTop: '10px', lineHeight: 1.5 }}>
                  {totalStatsSpent === 74 ? (
                    <span style={{ color: 'green', fontWeight: 'bold' }}>✓ Perfect! All 74 points are distributed. Click Next.</span>
                  ) : totalStatsSpent < 74 ? (
                    `Distribute ${74 - totalStatsSpent} more points.`
                  ) : (
                    `You have distributed ${totalStatsSpent - 74} too many points!`
                  )}
                </div>

                <div style={{ width: '100%', marginTop: '16px', borderTop: '0.5px dashed rgba(200, 169, 110, 0.4)', paddingTop: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--inkm)', display: 'block', marginBottom: '4px', textAlign: 'center' }}>
                    Bezugsattribute hervorheben (RAW 3.5e):
                  </label>
                  <select
                    value={highlightClass}
                    onChange={(e) => setHighlightClass(e.target.value)}
                    className="cinput"
                    style={{ width: '100%', padding: '4px', fontSize: '11px', cursor: 'pointer', fontFamily: "'IM Fell English SC', serif" }}
                  >
                    <option value="">-- Keine Klasse --</option>
                    {CLASSES_LIST.map(c => (
                      <option key={c.key} value={c.key}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        if (!isTargetLevelSet) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px 20px', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--red)', fontSize: '18px', margin: 0 }}>Set Target Level</h3>
              <p style={{ fontFamily: "'Crimson Text', serif", fontSize: '14px', color: 'var(--inkm)', maxWidth: '450px', lineHeight: 1.5 }}>
                Choose the level to which your character should be generated. We will then go through each level individually to choose class, HP, skills, and feats.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                <button 
                  className="btn" 
                  disabled={targetLevel <= 1}
                  onClick={() => setTargetLevel(targetLevel - 1)}
                  style={{ padding: '6px 16px', fontSize: '16px', fontWeight: 'bold' }}
                >
                  -
                </button>
                <span style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif", width: '50px' }}>
                  {targetLevel}
                </span>
                <button 
                  className="btn" 
                  disabled={targetLevel >= 20}
                  onClick={() => setTargetLevel(targetLevel + 1)}
                  style={{ padding: '6px 16px', fontSize: '16px', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>

              <button 
                onClick={handleStartLevelConfigs}
                className="btn btn-p"
                style={{ marginTop: '20px', padding: '8px 24px', fontSize: '13px' }}
              >
                ✦ Start Level Configuration
              </button>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', marginTop: '10px' }}>
            {/* Level Timeline Bar */}
            <div 
              style={{
                display: 'flex',
                gap: '4px',
                overflowX: 'auto',
                paddingBottom: '8px',
                borderBottom: '0.5px solid rgba(200,169,110,0.3)',
                marginBottom: '10px'
              }}
            >
              {levelConfigs.map((cfg, idx) => {
                const isCurrent = idx === currentLevelIndex;
                const isPast = idx < currentLevelIndex;
                const clsName = CLASSES_LIST.find(c => c.key === cfg.classType)?.name || '?';
                
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (idx < currentLevelIndex) {
                        setCurrentLevelIndex(idx);
                      }
                    }}
                    style={{
                      padding: '4px 10px',
                      background: isCurrent ? 'rgba(139, 26, 26, 0.08)' : (isPast ? 'rgba(200, 169, 110, 0.15)' : 'transparent'),
                      border: isCurrent ? '1.5px solid var(--red)' : '1px solid transparent',
                      borderRadius: '3px',
                      fontSize: '11px',
                      cursor: isPast ? 'pointer' : 'default',
                      opacity: isCurrent || isPast ? 1 : 0.5,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Level {cfg.level} ({cfg.classType ? clsName : 'No Class'})
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '24px' }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ color: 'var(--red)', margin: '0 0 4px 0', fontSize: '14px', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3px' }}>
                  Level {currentLevelIndex + 1}: Class & HP
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--ink)' }}>Select Class</label>
                  <select
                    value={currentConfig.classType}
                    onChange={(e) => updateLevelConfig(currentLevelIndex, 'classType', e.target.value)}
                    className="cinput"
                    style={{ width: '100%', padding: '6px', fontSize: '12px', boxSizing: 'border-box' }}
                  >
                    <option value="" disabled>-- Please select --</option>
                    {CLASSES_LIST.map(c => (
                      <option key={c.key} value={c.key}>{c.name} (d{c.hd}, {c.skillBase} Skills)</option>
                    ))}
                  </select>
                </div>

                {currentConfig.classType && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--ink)' }}>
                      Hit Points (Hit Die: d{getClassHitDie(currentConfig.classType)})
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="number"
                        min="1"
                        max={getClassHitDie(currentConfig.classType)}
                        value={currentConfig.hpRoll || ''}
                        onChange={(e) => {
                          const maxHD = getClassHitDie(currentConfig.classType);
                          const val = Math.max(1, Math.min(maxHD, parseInt(e.target.value) || 1));
                          updateLevelConfig(currentLevelIndex, 'hpRoll', val);
                        }}
                        className="cinput"
                        style={{ width: '80px', padding: '5px', fontSize: '13px', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--inkl)', fontStyle: 'italic' }}>
                        {currentLevelIndex === 0 
                          ? 'Maximum value pre-selected' 
                          : `Allowed: 1 to ${getClassHitDie(currentConfig.classType)}`}
                      </span>
                    </div>
                  </div>
                )}

                {(currentLevelIndex + 1) % 4 === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
                      ✦ Ability Score Increase (+1)
                    </label>
                    <select
                      value={currentConfig.abilityIncrease || ''}
                      onChange={(e) => updateLevelConfig(currentLevelIndex, 'abilityIncrease', e.target.value)}
                      className="cinput"
                      style={{ width: '100%', padding: '6px', fontSize: '12px', boxSizing: 'border-box' }}
                    >
                      <option value="" disabled>-- Select Ability --</option>
                      {([
                        { key: 'str', label: 'Strength (STR)' },
                        { key: 'dex', label: 'Dexterity (DEX)' },
                        { key: 'con', label: 'Constitution (CON)' },
                        { key: 'int', label: 'Intelligence (INT)' },
                        { key: 'wis', label: 'Wisdom (WIS)' },
                        { key: 'cha', label: 'Charisma (CHA)' }
                      ] as const).map(opt => {
                        const currentClass = currentConfig.classType;
                        const isKey = currentClass ? CLASS_KEY_ATTRIBUTES[currentClass]?.includes(opt.key) : false;
                        return (
                          <option 
                            key={opt.key} 
                            value={opt.key}
                            style={{ 
                              color: isKey ? 'green' : 'inherit',
                              fontWeight: isKey ? 'bold' : 'normal'
                            }}
                          >
                            {opt.label} {isKey ? '★ (Key)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Current Attributes Card */}
                {isTargetLevelSet && currentDraft && (
                  <div style={{ padding: '10px', border: '1px solid var(--pb)', background: 'rgba(244,232,193,0.3)', borderRadius: '4px', marginTop: '6px' }}>
                    <strong style={{ display: 'block', fontSize: '11px', color: 'var(--red)', marginBottom: '6px', borderBottom: '0.5px dashed rgba(200, 169, 110, 0.4)', paddingBottom: '2px' }}>
                      Current Ability Scores (Lvl {currentLevelIndex + 1})
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
                      {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(k => {
                        const labelMap = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
                        const val = currentDraft.stats[k];
                        const mod = currentDraft.statMods[k];
                        const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                        return (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '1px' }}>
                            <span>{labelMap[k]}:</span>
                            <strong style={{ color: 'var(--red)' }}>{val} ({modStr})</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Feat Slots (rendered here if activeTab === 'feats') */}
                {activeTab === 'feats' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>
                      Talentslots:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {currentFeatSlots.map((slot, slotIdx) => {
                        const selectedFeatId = currentConfig.feats?.[slotIdx];
                        const selectedFeat = CombatFeats.REGISTRY[selectedFeatId];
                        const isPreFilled = !!slot.defaultFeat;
                        const isActive = featSelectSlotIndex === slotIdx;

                        return (
                          <div 
                            key={slotIdx}
                            onClick={() => {
                              if (!isPreFilled) {
                                setFeatSelectSlotIndex(slotIdx);
                              }
                            }}
                            style={{
                              padding: '6px 8px',
                              background: isActive ? 'rgba(139, 26, 26, 0.05)' : 'rgba(244, 232, 193, 0.25)',
                              border: isActive 
                                ? '1.5px solid var(--red)' 
                                : selectedFeat 
                                  ? '1.5px solid #2e7d32' 
                                  : '1.5px solid var(--pb)',
                              borderRadius: '3px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: isPreFilled ? 'default' : 'pointer',
                              transition: 'background 0.2s, border-color 0.2s'
                            }}
                          >
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ fontSize: '8.5px', textTransform: 'uppercase', color: 'var(--inkl)', display: 'block' }}>
                                {slot.label} {isPreFilled && '(Fixed)'}
                              </span>
                              <strong style={{ fontSize: '11.5px', color: selectedFeat ? 'var(--ink)' : 'var(--red)' }}>
                                {selectedFeat ? (selectedFeat.nameEn || selectedFeat.nameDe) : '— Select —'}
                              </strong>
                            </div>
                            {!isPreFilled && (
                              <span style={{ fontSize: '9.5px', color: 'var(--red)', fontWeight: isActive ? 'bold' : 'normal' }}>
                                {isActive ? '👉 Active' : 'Select'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Tabs Header */}
                <div style={{ display: 'flex', gap: '5px', borderBottom: '1.5px solid var(--pb)', paddingBottom: '2px', marginBottom: '4px' }}>
                  <button
                    onClick={() => setActiveTab('skills')}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      background: activeTab === 'skills' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'skills' ? '2px solid var(--red)' : '2px solid transparent',
                      color: activeTab === 'skills' ? 'var(--red)' : 'var(--inkm)',
                      fontWeight: activeTab === 'skills' ? 'bold' : 'normal',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontFamily: "'IM Fell English SC', serif"
                    }}
                  >
                    📝 Skills ({currentLevelRemainingSkillPoints} / {currentLevelMaxSkillPoints})
                  </button>
                  <button
                    onClick={() => {
                      if (currentFeatSlots.length > 0) {
                        setActiveTab('feats');
                      }
                    }}
                    disabled={currentFeatSlots.length === 0}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      background: activeTab === 'feats' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'feats' ? '2px solid var(--red)' : '2px solid transparent',
                      color: currentFeatSlots.length === 0 ? 'var(--inkl)' : (activeTab === 'feats' ? 'var(--red)' : 'var(--inkm)'),
                      fontWeight: activeTab === 'feats' ? 'bold' : 'normal',
                      fontSize: '12px',
                      cursor: currentFeatSlots.length === 0 ? 'not-allowed' : 'pointer',
                      fontFamily: "'IM Fell English SC', serif",
                      opacity: currentFeatSlots.length === 0 ? 0.5 : 1
                    }}
                    title={currentFeatSlots.length === 0 ? "No feat slots available at this level" : ""}
                  >
                    🛡️ Feats ({currentFeatSlots.filter((_, idx) => !currentConfig.feats?.[idx]).length} open)
                  </button>
                </div>

                {activeTab === 'skills' && (
                  <>
                    {!currentConfig.classType ? (
                      <div style={{ padding: '40px', fontSize: '12px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center' }}>
                        Select a class on the left to distribute skill points.
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Search skill..."
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          className="cinput"
                          style={{ padding: '4px 8px', fontSize: '11px', width: '100%', boxSizing: 'border-box' }}
                        />

                        <div 
                          style={{
                            maxHeight: '420px',
                            overflowY: 'auto',
                            border: '1px solid var(--pb)',
                            borderRadius: '3px',
                            padding: '4px',
                            background: 'white'
                          }}
                        >
                          {Object.entries(SKILLS_REGISTRY)
                            .filter(([_, def]: any) => {
                              const s = skillSearch.toLowerCase();
                              return (def.nameEn || def.nameDe || '').toLowerCase().includes(s) || 
                                     (def.nameDe || '').toLowerCase().includes(s);
                            })
                            .map(([key, def]: any) => {
                              const isClassSkill = CombatRules.CLASS_SKILLS[currentConfig.classType]?.includes(key) || 
                                                   (key.startsWith('knowledge_') && (currentConfig.classType === 'wizard' || currentConfig.classType === 'bard'));
                              
                              let isEverClassSkill = false;
                              for (let i = 0; i <= currentLevelIndex; i++) {
                                const cType = levelConfigs[i]?.classType;
                                if (cType) {
                                  const check = CombatRules.CLASS_SKILLS[cType]?.includes(key) || 
                                                (key.startsWith('knowledge_') && (cType === 'wizard' || cType === 'bard'));
                                  if (check) isEverClassSkill = true;
                                }
                              }

                              const prevRanks = currentDraft ? (currentDraft.skillsAcc[key]?.ranks || 0) : 0;
                              const currentClicks = currentConfig.skills[key] || 0;
                              const addedRanks = currentClicks * (isClassSkill ? 1.0 : 0.5);
                              const totalRanks = prevRanks + addedRanks;
                              
                              const maxRanks = isEverClassSkill ? (currentLevelIndex + 4) : ((currentLevelIndex + 4) / 2);

                              return (
                                <div
                                  key={key}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 8px',
                                    borderBottom: '0.5px solid rgba(200, 169, 110, 0.2)',
                                    fontSize: '12px',
                                    background: currentClicks > 0 ? 'rgba(76, 175, 80, 0.15)' : 'transparent'
                                  }}
                                >
                                  <div style={{ textAlign: 'left', flex: 1 }}>
                                    <strong>{def.nameEn || def.nameDe}</strong>{' '}
                                    <span style={{ fontSize: '10px', color: 'var(--inkl)' }}>({def.abl.toUpperCase()})</span>
                                    <span 
                                      style={{
                                        fontSize: '9px',
                                        padding: '1px 4px',
                                        borderRadius: '2px',
                                        background: isClassSkill ? 'rgba(0, 128, 0, 0.1)' : 'rgba(128, 128, 128, 0.1)',
                                        color: isClassSkill ? 'green' : 'grey',
                                        marginLeft: '6px',
                                        display: 'inline-block'
                                      }}
                                    >
                                      {isClassSkill ? 'Class' : 'Cross-Class'}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <button
                                      className="btn"
                                      disabled={currentClicks <= 0}
                                      onClick={() => {
                                        const nextSkills = { ...currentConfig.skills };
                                        const decrement = isClassSkill ? 1 : 2;
                                        if (nextSkills[key] > decrement) {
                                          nextSkills[key] -= decrement;
                                        } else {
                                          delete nextSkills[key];
                                        }
                                        updateLevelConfig(currentLevelIndex, 'skills', nextSkills);
                                      }}
                                      style={{ padding: '0px 6px', fontSize: '10px' }}
                                    >
                                      -
                                    </button>
                                    
                                    <span style={{ width: '60px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                      {totalRanks} <span style={{ fontSize: '10px', fontWeight: 'normal', color: 'var(--inkl)' }}>/ {Math.floor(maxRanks)}</span>
                                    </span>

                                    <button
                                      className="btn"
                                      disabled={
                                        currentLevelRemainingSkillPoints <= 0 ||
                                        totalRanks + 1.0 > Math.floor(maxRanks)
                                      }
                                      onClick={() => {
                                        const cost = isClassSkill ? 1 : 2;
                                        if (currentLevelRemainingSkillPoints < cost) {
                                          showCustomAlert(
                                            "Aktion nicht möglich",
                                            `Es ist nicht möglich, eine klassenfremde Fertigkeit zu steigern. Sie benötigen mindestens ${cost} freie Skillpunkte, da klassenfremde Fertigkeiten ${cost} Skillpunkte pro Rang kosten.`,
                                            "OK",
                                            "📝"
                                          );
                                          return;
                                        }
                                        const nextSkills = { ...currentConfig.skills };
                                        nextSkills[key] = (nextSkills[key] || 0) + cost;
                                        updateLevelConfig(currentLevelIndex, 'skills', nextSkills);
                                      }}
                                      style={{ padding: '0px 6px', fontSize: '10px' }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </>
                    )}
                  </>
                )}

                {activeTab === 'feats' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '420px' }}>
                    {featSelectSlotIndex !== null && currentFeatSlots[featSelectSlotIndex] ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--inkm)' }}>
                            Available Feats ({currentFeatSlots[featSelectSlotIndex].label}):
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Search feat..."
                            value={featSearch}
                            onChange={(e) => setFeatSearch(e.target.value)}
                            className="cinput"
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              fontSize: '11px',
                              height: '24px',
                              boxSizing: 'border-box'
                            }}
                          />
                          
                          {/* Category Filter Dropdown */}
                          <select
                            value={featFilter}
                            onChange={(e) => setFeatFilter(e.target.value)}
                            className="cinput"
                            style={{
                              width: '120px',
                              padding: '0 4px',
                              fontSize: '11px',
                              height: '24px',
                              boxSizing: 'border-box'
                            }}
                          >
                            <option value="all">Alle</option>
                            {activeFeatSlot && activeFeatSlot.allowedCategories.includes('combat') && (
                              <option value="combat">Kampf (Combat)</option>
                            )}
                            {activeFeatSlot && activeFeatSlot.allowedCategories.includes('metamagic') && (
                              <option value="metamagic">Metamagie</option>
                            )}
                            {activeFeatSlot && activeFeatSlot.allowedCategories.includes('item_creation') && (
                              <option value="item_creation">Erschaffung</option>
                            )}
                            {activeFeatSlot && activeFeatSlot.allowedCategories.includes('general') && (
                              <option value="general">Allgemein</option>
                            )}
                          </select>
                        </div>

                        <div
                          style={{
                            flex: 1,
                            maxHeight: '420px',
                            overflowY: 'auto',
                            border: '1px solid var(--pb)',
                            borderRadius: '3px',
                            background: 'white',
                            padding: '4px'
                          }}
                        >
                          {filteredFeats.length === 0 ? (
                            <div style={{ padding: '20px', fontSize: '11px', fontStyle: 'italic', color: 'var(--inkl)', textAlign: 'center' }}>
                              No matching feats found.
                            </div>
                          ) : (
                            filteredFeats.map((item: any) => {
                              const feat = item.feat;
                              const depth = item.depth;
                              const prereqs = currentDraft ? checkFeatPrerequisites(feat.id, currentDraft.draftPC) : { met: true, unmetDescs: [] };
                              const isAlreadySelected = currentConfig.feats.includes(feat.id);
                              const isAlreadyLearned = currentDraft ? currentDraft.featsList.includes(feat.id) : false;
                              const isBlocked = !prereqs.met || isAlreadyLearned;
                              
                              let statusIcon = '⚪';
                              let statusTitle = 'Selectable';
                              if (isAlreadyLearned) {
                                statusIcon = '🟢';
                                statusTitle = 'Already learned';
                              } else if (isAlreadySelected) {
                                statusIcon = '✨';
                                statusTitle = 'Selected at this level';
                              } else if (isBlocked) {
                                statusIcon = '🔒';
                                statusTitle = 'Prerequisites not met';
                              }

                              const parentFeat = feat.parent ? CombatFeats.REGISTRY[feat.parent] : null;
                              const depthPadding = featSearch ? 0 : depth * 12;

                              return (
                                <div
                                  key={feat.id}
                                  onClick={() => {
                                    if (!isBlocked && !isAlreadySelected) {
                                      const nextFeats = [...(currentConfig.feats || [])];
                                      nextFeats[featSelectSlotIndex] = feat.id;
                                      updateLevelConfig(currentLevelIndex, 'feats', nextFeats);
                                      setFeatSearch('');
                                    }
                                  }}
                                  style={{
                                    padding: '6px 8px',
                                    borderBottom: '0.5px solid rgba(200, 169, 110, 0.2)',
                                    cursor: isBlocked ? 'not-allowed' : 'pointer',
                                    background: isAlreadySelected ? 'rgba(200, 169, 110, 0.15)' : 'transparent',
                                    textAlign: 'left',
                                    opacity: isBlocked ? 0.6 : 1,
                                    paddingLeft: `${8 + depthPadding}px`,
                                    transition: 'background 0.2s, opacity 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isAlreadySelected && !isBlocked) {
                                      e.currentTarget.style.background = 'rgba(244, 232, 193, 0.25)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isAlreadySelected && !isBlocked) {
                                      e.currentTarget.style.background = 'transparent';
                                    }
                                  }}
                                  title={statusTitle}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                    <span style={{ fontSize: '10px' }} title={statusTitle}>{statusIcon}</span>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                                      <strong style={{ fontSize: '11px', color: isBlocked ? 'var(--inkm)' : 'var(--red)' }}>{feat.nameEn || feat.nameDe}</strong>
                                      <span style={{ fontSize: '8.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>{feat.nameDe}</span>
                                    </div>
                                  </div>
                                  
                                  {parentFeat && !featSearch && (
                                    <div style={{ fontSize: '8.5px', color: 'var(--inkm)', fontStyle: 'italic', marginBottom: '3px', paddingLeft: '16px' }}>
                                      ↳ Requires: <strong>{parentFeat.nameEn || parentFeat.nameDe}</strong>
                                    </div>
                                  )}

                                  <div style={{ fontSize: '10px', color: 'var(--ink)', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, marginBottom: '3px', paddingLeft: '16px' }}>
                                    {feat.benefitRaw || feat.benefitDe}
                                  </div>

                                  {feat.prereqs && feat.prereqs.length > 0 && (
                                    <div style={{ fontSize: '9px', borderTop: '0.5px dashed rgba(200,169,110,0.3)', paddingTop: '2px', marginTop: '2px', paddingLeft: '16px' }}>
                                      <span style={{ color: prereqs.met ? 'green' : 'var(--red)', fontWeight: 'bold' }}>
                                        Prerequisites:
                                      </span>{' '}
                                      {prereqs.unmetDescs.length > 0 ? (
                                        <span style={{ color: 'var(--red)', fontStyle: 'italic' }}>
                                          Not met: {prereqs.unmetDescs.map(translatePrereq).join(', ')}
                                        </span>
                                      ) : (
                                        <span style={{ color: 'green', fontStyle: 'italic' }}>Met</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: '40px', fontSize: '12px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center' }}>
                        Select a talentslot on the left to see available feats.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        const conMod = currentDraft ? currentDraft.statMods.con : 0;
        const totalHPRolls = levelConfigs.reduce((sum, cfg) => sum + (parseInt(cfg.hpRoll) || 0), 0);
        const finalMaxHP = levelConfigs.reduce((sum, cfg) => sum + Math.max(1, (parseInt(cfg.hpRoll) || 0) + conMod), 0);
        
        return (
          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <p style={{ fontFamily: "'Crimson Text', serif", fontSize: '14px', marginBottom: '20px', color: 'var(--inkm)' }}>
              Review the details of your new character here. Clicking **Create &amp; Save** will transfer the data to your active sheet.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Core Information Card */}
              <div style={{ padding: '16px', border: '1px solid var(--pb)', background: 'rgba(244,232,193,0.3)', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--red)', fontSize: '14px', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3px' }}>
                  Identity &amp; Health
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <div><strong>Name:</strong> {name}</div>
                  <div><strong>Race:</strong> {RACES.find(r => r.key === selectedRace)?.name}</div>
                  <div>
                    <strong>Class Combination:</strong>{' '}
                    {isTargetLevelSet && currentDraft && currentDraft.classesList
                      .map(c => `${CLASSES_LIST.find(x => x.key === c.classType)?.name || c.classType} ${c.level}`)
                      .join(' / ')}
                  </div>
                  <div><strong>Target Level:</strong> {targetLevel}</div>
                  <div>
                    <strong>Hit Points (HP):</strong> {finalMaxHP} (Base {totalHPRolls} + {conMod * targetLevel} Con modifier)
                  </div>
                  <div>
                    <strong>Base Attack Bonus (BAB):</strong> +{isTargetLevelSet && currentDraft && currentDraft.babVal}
                  </div>
                </div>
              </div>

              {/* Attributes Card */}
              <div style={{ padding: '16px', border: '1px solid var(--pb)', background: 'rgba(244,232,193,0.3)', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--red)', fontSize: '14px', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3px' }}>
                  Final Ability Scores
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                  {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(k => {
                    const labelMap = { str: 'Strength (STR)', dex: 'Dexterity (DEX)', con: 'Constitution (CON)', int: 'Intelligence (INT)', wis: 'Wisdom (WIS)', cha: 'Charisma (CHA)' };
                    const finalVal = isTargetLevelSet && currentDraft ? currentDraft.stats[k] : 10;
                    const finalM = isTargetLevelSet && currentDraft ? currentDraft.statMods[k] : 0;
                    
                    return (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.4)', paddingBottom: '3px' }}>
                        <span 
                          style={{ 
                            cursor: 'pointer', 
                            borderBottom: '1px dashed var(--red)'
                          }}
                          onClick={() => showAttributeExplanation(k)}
                          title="Click for a brief explanation"
                        >
                          {labelMap[k].split(' ')[0]}:
                        </span>
                        <strong style={{ color: 'var(--red)' }}>
                          {finalVal} ({finalM >= 0 ? `+${finalM}` : finalM})
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Feats summary */}
            <div style={{ padding: '16px', border: '1px solid var(--pb)', background: 'rgba(244,232,193,0.3)', borderRadius: '4px', marginTop: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--red)', fontSize: '14px', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3px' }}>
                Selected Feats
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {levelConfigs.flatMap((cfg, idx) => 
                  Array.isArray(cfg.feats) ? cfg.feats.map((fid: any, fIdx: number) => {
                    const feat = CombatFeats.REGISTRY[fid];
                    if (!feat) return null;
                    return (
                      <div 
                        key={`${idx}-${fIdx}`} 
                        style={{ padding: '3px 8px', background: 'rgba(139,26,26,0.06)', border: '1px solid var(--pb)', borderRadius: '3px', fontSize: '11px' }}
                        title={feat.benefitRaw || feat.benefitDe}
                      >
                        {feat.nameEn || feat.nameDe}
                      </div>
                    );
                  }) : []
                ).filter(Boolean)}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepsList = [
    { num: 1, label: 'Identity & Race' },
    { num: 2, label: 'Abilities (74 Pts)' },
    { num: 3, label: 'Level-Up Loop' },
    { num: 4, label: 'Summary' }
  ];

  // Build the complete tree hierarchy of all feats
  const fullFeatTree = useMemo(() => {
    const list: Array<{ feat: any; depth: number }> = [];
    const added = new Set<string>();

    const addFeatWithChildren = (featId: string, depth: number) => {
      if (added.has(featId)) return;
      const feat = CombatFeats.REGISTRY[featId];
      if (!feat) return;

      list.push({ feat, depth });
      added.add(featId);

      // Find children
      Object.keys(CombatFeats.REGISTRY).forEach((childId) => {
        const child = CombatFeats.REGISTRY[childId];
        if (child.parent === featId) {
          addFeatWithChildren(childId, depth + 1);
        }
      });
    };

    // Add roots first
    Object.keys(CombatFeats.REGISTRY).forEach((featId) => {
      const feat = CombatFeats.REGISTRY[featId];
      if (!feat.parent) {
        addFeatWithChildren(featId, 0);
      }
    });

    // Fallback: add any orphaned feats just in case
    Object.keys(CombatFeats.REGISTRY).forEach((featId) => {
      if (!added.has(featId)) {
        addFeatWithChildren(featId, 0);
      }
    });

    return list;
  }, []);

  // Logic to filter feats list for selector tab based on tree hierarchy
  const activeFeatSlot = featSelectSlotIndex !== null && currentFeatSlots[featSelectSlotIndex];
  const filteredFeats = activeFeatSlot 
    ? fullFeatTree.filter((item: any) => {
        const feat = item.feat;
        const sMatches = feat.nameDe.toLowerCase().includes(featSearch.toLowerCase()) || 
                         feat.nameEn.toLowerCase().includes(featSearch.toLowerCase());
        if (!sMatches) return false;
        if (!activeFeatSlot.allowedCategories.includes(feat.category)) return false;
        if (featFilter !== 'all' && feat.category !== featFilter) return false;
        return true;
      })
    : [];

  return (
    <div 
      className="sheet no-print" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '520px',
        padding: '20px 28px',
        boxSizing: 'border-box',
        fontFamily: "'IM Fell English SC', serif",
        position: 'relative'
      }}
    >
      {/* Border Accent */}
      <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }}></div>
      
      {/* Header */}
      <div>
        <div style={{ fontSize: '20px', color: 'var(--red)', fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>
          🧙‍♂️ Character Creation Assistant (Wizard)
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '8px 0 16px' }} />
      </div>

      {/* Content Area */}
      <div style={{ flex: 1 }}>
        {renderStepContent()}
      </div>

      {/* Footer Navigation & Timeline */}
      <div style={{ marginTop: '20px' }}>
        {/* Navigation Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <button 
            onClick={onClose}
            className="btn"
            style={{ padding: '4px 16px', fontSize: '12px' }}
          >
            Cancel
          </button>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleBack}
              disabled={step === 1}
              className="btn"
              style={{ padding: '4px 16px', fontSize: '12px', opacity: step === 1 ? 0.5 : 1 }}
            >
              Back
            </button>
            
            {step < 4 ? (
              <button 
                onClick={handleNext}
                disabled={
                  step === 1 ? (!name.trim() || !selectedRace) : 
                  step === 2 ? (totalStatsSpent !== 74) : 
                  step === 3 ? (!isTargetLevelSet) : false
                }
                className="btn btn-p"
                style={{
                  padding: '4px 20px',
                  fontSize: '12px',
                  opacity: (
                    (step === 1 && (!name.trim() || !selectedRace)) ||
                    (step === 2 && totalStatsSpent !== 74) ||
                    (step === 3 && !isTargetLevelSet)
                  ) ? 0.5 : 1
                }}
              >
                Next
              </button>
            ) : (
              <button 
                onClick={handleSaveCharacter}
                className="btn btn-p animate-glow"
                style={{
                  padding: '4px 24px',
                  fontSize: '12px'
                }}
              >
                ✦ Create &amp; Save
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '0.5px solid rgba(200, 169, 110, 0.3)',
            paddingTop: '12px',
            fontSize: '11px',
            color: 'var(--inkl)'
          }}
        >
          {stepsList.map((s, idx) => {
            const isActive = step === s.num;
            const isPast = step > s.num;
            return (
              <React.Fragment key={s.num}>
                {idx > 0 && <span style={{ color: 'var(--pb)', fontSize: '12px' }}>➔</span>}
                <span 
                  style={{ 
                    fontWeight: isActive ? 'bold' : 'normal',
                    color: isActive ? 'var(--red)' : (isPast ? 'var(--ink)' : 'var(--inkl)'),
                    textDecoration: isActive ? 'underline font-weight' : 'none'
                  }}
                >
                  {s.num}. {s.label}
                  {s.num === 3 && step === 3 && selectedRace && (
                    <span style={{ fontSize: '9px', display: 'block', fontStyle: 'italic', color: 'var(--inkm)' }}>
                      {name || 'Character'} ({RACES.find(r => r.key === selectedRace)?.name}) — Lvl 1 to {targetLevel}
                    </span>
                  )}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

    </div>
  );
};
