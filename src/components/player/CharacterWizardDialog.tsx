/**
 * @module    CharacterWizardDialog
 * @summary   Step-by-step wizard for rules-compliant (RAW) character creation for D&D 3.5e.
 *            Offers a full layout with 74-point buy distribution, level-up loop,
 *            skill points distribution, and feat selection with prerequisites check.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CombatState } from '@core/state.js';
import { CombatRules } from '@core/rules.js';
import { CombatFeats } from '@core/data/feats-data.js';
import { showAttributeExplanation } from './attributeHelper';
import { showCustomAlert } from '@core/ui/components/dialogs.js';

import { 
  RACES, 
  CLASSES_LIST 
} from './wizard/constants';
import { 
  getRacialModifier, 
  getMod, 
  getDraftPCState, 
  getCompletedDraftPCState,
  getFeatSlotsAtLevel, 
  getSkillPointsForLevel 
} from './wizard/helpers';
import { Step1RaceName } from './wizard/Step1RaceName';
import { Step2Attributes } from './wizard/Step2Attributes';
import { Step3LevelConfig } from './wizard/Step3LevelConfig';

interface CharacterWizardDialogProps {
  onClose: () => void;
}

export const CharacterWizardDialog: React.FC<CharacterWizardDialogProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState<string>('human');
  const [alignmentEthical, setAlignmentEthical] = useState<string>('Neutral');
  const [alignmentMoral, setAlignmentMoral] = useState<string>('Neutral');

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

  // Right column active tab ('skills', 'tricks', 'feats', or 'acfs')
  const [activeTab, setActiveTab] = useState<'skills' | 'tricks' | 'feats' | 'acfs'>('skills');

  // Sum of distributed base points (must equal 74)
  const totalStatsSpent = baseStats.str + baseStats.dex + baseStats.con + baseStats.int + baseStats.wis + baseStats.cha;

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
        skillTricks: [], // array of trick keys learned at this level (each costs 2 SP)
        feats: [],
        acfs: []
      });
    }
    setLevelConfigs(configs);
    setIsTargetLevelSet(true);
    setCurrentLevelIndex(0);
  };

  const updateLevelConfig = (idx: number, key: string, val: any) => {
    setLevelConfigs(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: val };
      
      // Automatically set default HP roll at level 1 when class changes
      if (idx === 0 && key === 'classType') {
        const hd = getClassHitDie(val);
        next[0].hpRoll = hd;
      }
      return next;
    });
  };

  const getClassHitDie = (cls: string): number => {
    const matched = CLASSES_LIST.find(c => c.key === cls);
    return matched ? matched.hd : 6;
  };

  // Compile active level data
  const currentConfig = levelConfigs[currentLevelIndex] || {};
  const alignmentStr = alignmentEthical === 'Neutral' && alignmentMoral === 'Neutral'
    ? 'Neutral'
    : `${alignmentEthical} ${alignmentMoral}`;

  const currentDraft = isTargetLevelSet ? getDraftPCState(currentLevelIndex, baseStats, selectedRace, levelConfigs, alignmentStr) : null;
  const prevDraft = isTargetLevelSet ? getCompletedDraftPCState(currentLevelIndex - 1, baseStats, selectedRace, levelConfigs, alignmentStr) : null;
  const completedDraft = isTargetLevelSet ? getCompletedDraftPCState(currentLevelIndex, baseStats, selectedRace, levelConfigs, alignmentStr) : null;

  const currentLevelMaxSkillPoints = getSkillPointsForLevel(currentLevelIndex, currentConfig.classType, selectedRace, baseStats, currentDraft);
  const currentLevelSkillsSpent = Object.values(currentConfig.skills || {}).reduce((a: any, b: any) => a + b, 0) as number;
  const currentLevelTricksSpent = ((currentConfig.skillTricks || []).length * 2);
  const currentLevelSpentSkillPoints = currentLevelSkillsSpent + currentLevelTricksSpent;
  const currentLevelRemainingSkillPoints = currentLevelMaxSkillPoints - currentLevelSpentSkillPoints;

  // Feat slots for current level
  const currentFeatSlots = isTargetLevelSet ? getFeatSlotsAtLevel(currentLevelIndex, currentConfig.classType, selectedRace, levelConfigs) : [];

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

      // Validate prestige class spell links
      if (currentConfig.classType === 'mystic_theurge') {
        const links = currentConfig.prestigeSpellLinks?.mystic_theurge;
        if (!links || !links.arcane || !links.divine) {
          showCustomAlert("Spell Link Missing", "Please select both an arcane and divine spellcasting class to advance.", "OK", "🔮");
          return;
        }
      }
      if (currentConfig.classType === 'arcane_trickster') {
        const links = currentConfig.prestigeSpellLinks?.arcane_trickster;
        if (!links) {
          showCustomAlert("Spell Link Missing", "Please select an arcane spellcasting class to advance.", "OK", "🔮");
          return;
        }
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
      pc.alignment = alignmentEthical === 'Neutral' && alignmentMoral === 'Neutral'
        ? 'Neutral'
        : `${alignmentEthical} ${alignmentMoral}`;
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

      // Clear and compile prestigeSpellLinks
      pc.prestigeSpellLinks = {};
      levelConfigs.forEach(cfg => {
        if (cfg.prestigeSpellLinks) {
          Object.assign(pc.prestigeSpellLinks, cfg.prestigeSpellLinks);
        }
      });


      // Build classesList to find final CON mod including racial modifier
      const finalConMod = getMod(baseStats.con + getRacialModifier(selectedRace, 'con'));
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

      // Compile and save skill tricks
      pc.skillTricks = [];
      const addedTrickIds = new Set<string>();
      levelConfigs.forEach(cfg => {
        if (Array.isArray(cfg.skillTricks)) {
          cfg.skillTricks.forEach((tid: string) => {
            if (tid && !addedTrickIds.has(tid)) {
              addedTrickIds.add(tid);
              pc.skillTricks.push({ id: tid, isBonus: false });
            }
          });
        }
      });

      // Compile and save Alternative Class Features (ACFs)
      pc.acfs = [];
      const addedAcfIds = new Set<string>();
      levelConfigs.forEach(cfg => {
        if (Array.isArray(cfg.acfs)) {
          cfg.acfs.forEach((aid: string) => {
            if (aid && !addedAcfIds.has(aid)) {
              addedAcfIds.add(aid);
              pc.acfs.push(aid);
            }
          });
        }
      });

      // Add daily abilities if applicable
      pc.dailyAbilities = pc.dailyAbilities || [];
      if (selectedRace === 'anima_construct') {
        const hasRepair = pc.dailyAbilities.some((ab: any) => ab.name === 'Manuelle Reparatur' || ab.name === 'Manual Repair');
        if (!hasRepair) {
          pc.dailyAbilities.push({
            name: 'Manual Repair',
            max: 4,
            used: 0
          });
        }
      }
    });

    // Redirect to player sheet
    CombatState.setRole('player');
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

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Step1RaceName
            name={name}
            setName={setName}
            selectedRace={selectedRace}
            setSelectedRace={setSelectedRace}
            alignmentEthical={alignmentEthical}
            setAlignmentEthical={setAlignmentEthical}
            alignmentMoral={alignmentMoral}
            setAlignmentMoral={setAlignmentMoral}
          />
        );

      case 2:
        return (
          <Step2Attributes
            baseStats={baseStats}
            setBaseStats={setBaseStats}
            selectedRace={selectedRace}
            highlightClass={highlightClass}
            setHighlightClass={setHighlightClass}
            totalStatsSpent={totalStatsSpent}
          />
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
          <Step3LevelConfig
            levelConfigs={levelConfigs}
            currentLevelIndex={currentLevelIndex}
            setCurrentLevelIndex={setCurrentLevelIndex}
            currentConfig={currentConfig}
            currentDraft={currentDraft}
            prevDraft={prevDraft}
            completedDraft={completedDraft}
            getClassHitDie={getClassHitDie}
            updateLevelConfig={updateLevelConfig}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentLevelRemainingSkillPoints={currentLevelRemainingSkillPoints}
            currentLevelMaxSkillPoints={currentLevelMaxSkillPoints}
            skillSearch={skillSearch}
            setSkillSearch={setSkillSearch}
            featSelectSlotIndex={featSelectSlotIndex}
            setFeatSelectSlotIndex={setFeatSelectSlotIndex}
            featSearch={featSearch}
            setFeatSearch={setFeatSearch}
            featFilter={featFilter}
            setFeatFilter={setFeatFilter}
            currentFeatSlots={currentFeatSlots}
            activeFeatSlot={activeFeatSlot}
            filteredFeats={filteredFeats}
          />
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
                    <strong>Alignment:</strong>{' '}
                    {alignmentEthical === 'Neutral' && alignmentMoral === 'Neutral'
                      ? 'Neutral'
                      : `${alignmentEthical} ${alignmentMoral}`}
                  </div>
                  <div>
                    <strong>Class Combination:</strong>{' '}
                    {isTargetLevelSet && currentDraft && currentDraft.classesList
                      .map(c => {
                        const matched = CLASSES_LIST.find(x => x.key === c.classType);
                        const cleanName = matched ? matched.name : c.classType
                          .split('_')
                          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ');
                        return `${cleanName} ${c.level}`;
                      })
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
