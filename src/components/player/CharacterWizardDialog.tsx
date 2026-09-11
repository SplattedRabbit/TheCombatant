/**
 * @module    CharacterWizardDialog
 * @summary   Step-by-step wizard for rules-compliant (RAW) character creation for D&D 3.5e.
 *            Offers a full layout with 74-point buy distribution, level-up loop,
 *            skill points distribution, and feat selection with prerequisites check.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { CombatState } from '@core/state.js';
import { CombatFeats } from '@core/data/feats-data.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';

import { 
  getDraftPCState, 
  getCompletedDraftPCState,
  getFeatSlotsAtLevel, 
  getSkillPointsForLevel 
} from './wizard/helpers';
import { CharacterWizardStepContent } from './wizard/CharacterWizardStepContent';
import { CharacterWizardNav } from './wizard/CharacterWizardNav.tsx';
import { applyWizardCharacterToState } from './wizard/wizardSaveHelper.ts';
import { PRESTIGE_PREREQS } from './wizard/constants';
import { isSpellSelectorClass, getSpellSelectionQuota } from './wizard/spells/spellSelectionRules';
import { getClassHitDie, validateStep3Config } from './wizard/wizardValidation';

interface CharacterWizardDialogProps {
  onClose: () => void;
}

export const CharacterWizardDialog: React.FC<CharacterWizardDialogProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [levelSubView, setLevelSubView] = useState<'config' | 'spells'>('config');
  
  // Step 1 State
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState<string>('human');
  const [alignmentEthical, setAlignmentEthical] = useState<string>('Neutral');
  const [alignmentMoral, setAlignmentMoral] = useState<string>('Neutral');
  const [targetPrestigeClass, setTargetPrestigeClass] = useState<string>('');

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
      configs.push({
        level: i + 1,
        classType: '',
        hpRoll: 0,
        abilityIncrease: null,
        skills: {},
        skillTricks: [],
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
      return next;
    });
  };

  const fullAlignment = useMemo(() => {
    if (alignmentEthical === 'Neutral' && alignmentMoral === 'Neutral') return 'Neutral';
    return `${alignmentEthical} ${alignmentMoral}`;
  }, [alignmentEthical, alignmentMoral]);

  const prevDraft = useMemo(() => {
    if (!isTargetLevelSet || currentLevelIndex === 0) return null;
    return getDraftPCState(currentLevelIndex - 1, baseStats, selectedRace, levelConfigs, fullAlignment);
  }, [isTargetLevelSet, selectedRace, baseStats, levelConfigs, currentLevelIndex, fullAlignment]);

  const currentDraft = useMemo(() => {
    if (!isTargetLevelSet) return null;
    return getDraftPCState(currentLevelIndex, baseStats, selectedRace, levelConfigs, fullAlignment);
  }, [isTargetLevelSet, selectedRace, baseStats, levelConfigs, currentLevelIndex, fullAlignment]);

  const completedDraft = useMemo(() => {
    if (!isTargetLevelSet) return null;
    return getCompletedDraftPCState(levelConfigs.length - 1, baseStats, selectedRace, levelConfigs, fullAlignment);
  }, [isTargetLevelSet, selectedRace, baseStats, levelConfigs, fullAlignment]);

  const currentConfig = isTargetLevelSet ? levelConfigs[currentLevelIndex] : null;

  const currentLevelMaxSkillPoints = useMemo(() => {
    if (!currentConfig || !currentConfig.classType) return 0;
    return getSkillPointsForLevel(currentLevelIndex, currentConfig.classType, selectedRace, baseStats, prevDraft);
  }, [currentConfig, currentLevelIndex, selectedRace, baseStats, prevDraft]);

  const currentLevelRemainingSkillPoints = useMemo(() => {
    if (!currentConfig) return 0;
    const spentOnSkills = Object.values(currentConfig.skills || {}).reduce((sum: number, val: any) => sum + (parseInt(val) || 0), 0);
    const spentOnTricks = (currentConfig.skillTricks || []).length * 2;
    return currentLevelMaxSkillPoints - (spentOnSkills + spentOnTricks);
  }, [currentConfig, currentLevelMaxSkillPoints]);

  const currentFeatSlots = useMemo(() => {
    if (!currentConfig) return [];
    return getFeatSlotsAtLevel(currentLevelIndex, currentConfig.classType, selectedRace, levelConfigs);
  }, [currentConfig, currentLevelIndex, selectedRace, levelConfigs]);

  const activeFeatSlot = featSelectSlotIndex !== null ? currentFeatSlots[featSelectSlotIndex] : null;

  useEffect(() => {
    if (!currentFeatSlots || currentFeatSlots.length === 0) {
      setFeatSelectSlotIndex(null);
      return;
    }
    const firstSelectable = currentFeatSlots.findIndex(slot => !slot.defaultFeat || (slot.allowedFeats && slot.allowedFeats.length > 1));
    if (firstSelectable !== -1) {
      const activeSlot = featSelectSlotIndex !== null ? currentFeatSlots[featSelectSlotIndex] : null;
      const isCurrentFixed = activeSlot?.defaultFeat && (!activeSlot?.allowedFeats || activeSlot?.allowedFeats.length <= 1);
      if (featSelectSlotIndex === null || featSelectSlotIndex >= currentFeatSlots.length || isCurrentFixed) {
        setFeatSelectSlotIndex(firstSelectable);
      }
    } else {
      setFeatSelectSlotIndex(null);
    }
  }, [currentLevelIndex, currentFeatSlots]);

  const filteredFeats = useMemo(() => {
    if (!activeFeatSlot || !currentDraft) return [];
    const q = featSearch.toLowerCase().trim();
    const alreadyChosenIds = new Set<string>();
    levelConfigs.forEach(cfg => {
      (cfg.feats || []).forEach((fid: string) => alreadyChosenIds.add(fid));
    });

    const reqFeats = targetPrestigeClass ? (PRESTIGE_PREREQS[targetPrestigeClass]?.feats || []) : [];

    return Object.values(CombatFeats.REGISTRY).filter((feat: any) => {
      if (featFilter === 'prc_target') {
        if (!reqFeats.includes(feat.id)) return false;
      } else if (featFilter !== 'all' && feat.category !== featFilter) {
        return false;
      }
      if (activeFeatSlot.allowedCategories && !activeFeatSlot.allowedCategories.includes(feat.category)) return false;
      if (q) {
        const nameDe = (feat.nameDe || '').toLowerCase();
        const nameEn = (feat.nameEn || '').toLowerCase();
        const benefit = (feat.benefitDe || feat.benefitRaw || '').toLowerCase();
        if (!nameDe.includes(q) && !nameEn.includes(q) && !benefit.includes(q)) return false;
      }
      return true;
    });
  }, [activeFeatSlot, currentDraft, featSearch, featFilter, levelConfigs, targetPrestigeClass]);

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        showCustomAlert("Input Error", "Please enter a character name.", "OK", "⚠️");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (totalStatsSpent !== 74) {
        showCustomAlert("Point-Buy Distribution", `Please distribute exactly 74 base points (Current: ${totalStatsSpent}).`, "OK", "⚠️");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!isTargetLevelSet) {
        showCustomAlert("Level Selection", "Please set the target level and configure the levels.", "OK", "⚠️");
        return;
      }

      const isCaster = isSpellSelectorClass(currentConfig?.classType);
      const classCountAtThisLevel = isCaster
        ? levelConfigs.slice(0, currentLevelIndex + 1).filter((c) => c.classType === currentConfig.classType).length || 1
        : 1;
      const intMod = currentDraft?.statMods?.int ?? 0;
      const quotaInfo = isCaster ? getSpellSelectionQuota(currentConfig.classType, classCountAtThisLevel, intMod) : null;
      const currentSpells = currentConfig?.spells || [];

      if (levelSubView === 'config') {
        const validation = validateStep3Config({
          currentConfig,
          currentLevelIndex,
          currentLevelRemainingSkillPoints,
          currentFeatSlots,
        });
        if (!validation.valid && validation.alert) {
          showCustomAlert(
            validation.alert.title,
            validation.alert.message,
            validation.alert.buttonText,
            validation.alert.icon
          );
          return;
        }

        // If caster class, transition to inline spell selection view!
        if (quotaInfo && quotaInfo.quota > 0) {
          setLevelSubView('spells');
          return;
        }

        if (currentLevelIndex < targetLevel - 1) {
          setCurrentLevelIndex(currentLevelIndex + 1);
        } else {
          setStep(4);
        }
      } else {
        // levelSubView === 'spells'
        if (quotaInfo && quotaInfo.quota > 0 && currentSpells.length < quotaInfo.quota) {
          showCustomAlert(
            "Spell Quota Incomplete",
            `Please select all ${quotaInfo.quota} spells for Level ${classCountAtThisLevel} (${currentSpells.length} chosen so far).`,
            "OK",
            "✨"
          );
          return;
        }

        if (currentLevelIndex < targetLevel - 1) {
          setCurrentLevelIndex(currentLevelIndex + 1);
          setLevelSubView('config');
        } else {
          setStep(4);
          setLevelSubView('config');
        }
      }
    }
  };

  const handleBack = () => {
    if (step === 3 && isTargetLevelSet) {
      if (levelSubView === 'spells') {
        setLevelSubView('config');
      } else if (currentLevelIndex > 0) {
        const prevLevelCfg = levelConfigs[currentLevelIndex - 1];
        const isPrevCaster = prevLevelCfg && isSpellSelectorClass(prevLevelCfg.classType);
        setCurrentLevelIndex(currentLevelIndex - 1);
        if (isPrevCaster) {
          setLevelSubView('spells');
        } else {
          setLevelSubView('config');
        }
      } else {
        setIsTargetLevelSet(false);
        setStep(2);
      }
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSaveCharacter = () => {
    if (!completedDraft) return;
    applyWizardCharacterToState(
      name,
      selectedRace,
      alignmentEthical,
      alignmentMoral,
      baseStats,
      levelConfigs,
      completedDraft
    );
    CombatState.setRole('player');
    showCustomAlert(
      "Character Created! 🎉",
      `<div style="text-align: left; padding: 4px;"><p style="margin-bottom: 6px; font-size: 12px; color: var(--ink);"><strong>${name.trim()}</strong> has been successfully created and loaded into your character sheet.</p></div>`,
      "Open Character Sheet",
      "✨"
    );
    onClose();
  };

  const stepsList = [
    { num: 1, label: 'Identity & Race' },
    { num: 2, label: 'Abilities (74 Pts)' },
    { num: 3, label: 'Level Progression' },
    { num: 4, label: 'Review & Complete' }
  ];

  const isCurrentLevelCaster = isSpellSelectorClass(currentConfig?.classType);
  const currentLevelClassCount = isCurrentLevelCaster
    ? levelConfigs.slice(0, currentLevelIndex + 1).filter((c) => c.classType === currentConfig?.classType).length || 1
    : 1;
  const currentIntMod = currentDraft?.statMods?.int ?? 0;
  const currentQuotaInfo = isCurrentLevelCaster
    ? getSpellSelectionQuota(currentConfig?.classType, currentLevelClassCount, currentIntMod)
    : null;
  const currentSelectedSpellsCount = (currentConfig?.spells || []).length;
  const needsSpellsAtCurrentLevel =
    currentQuotaInfo && currentQuotaInfo.quota > 0 && currentSelectedSpellsCount < currentQuotaInfo.quota;

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
        fontFamily: 'var(--font-title)',
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />
      
      <div>
        <div style={{ fontSize: '20px', color: 'var(--red)', fontWeight: 'bold', textAlign: 'center', letterSpacing: '1px' }}>
          🧙‍♂️ Character Creation Assistant (Wizard)
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '8px 0 16px' }} />
      </div>

      <div style={{ flex: 1 }}>
        <CharacterWizardStepContent
          step={step}
          name={name}
          setName={setName}
          selectedRace={selectedRace}
          setSelectedRace={setSelectedRace}
          alignmentEthical={alignmentEthical}
          setAlignmentEthical={setAlignmentEthical}
          alignmentMoral={alignmentMoral}
          setAlignmentMoral={setAlignmentMoral}
          targetPrestigeClass={targetPrestigeClass}
          setTargetPrestigeClass={setTargetPrestigeClass}
          setHighlightClass={setHighlightClass}
          highlightClass={highlightClass}
          baseStats={baseStats}
          setBaseStats={setBaseStats}
          totalStatsSpent={totalStatsSpent}
          isTargetLevelSet={isTargetLevelSet}
          targetLevel={targetLevel}
          setTargetLevel={setTargetLevel}
          handleStartLevelConfigs={handleStartLevelConfigs}
          levelSubView={levelSubView}
          currentConfig={currentConfig}
          currentLevelIndex={currentLevelIndex}
          setCurrentLevelIndex={setCurrentLevelIndex}
          currentDraft={currentDraft}
          prevDraft={prevDraft}
          completedDraft={completedDraft}
          updateLevelConfig={updateLevelConfig}
          levelConfigs={levelConfigs}
          getClassHitDie={getClassHitDie}
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
      </div>

      <CharacterWizardNav
        step={step}
        stepsList={stepsList}
        name={name}
        selectedRace={selectedRace}
        targetLevel={targetLevel}
        currentLevelIndex={currentLevelIndex}
        isTargetLevelSet={isTargetLevelSet}
        levelSubView={levelSubView}
        isCurrentLevelCaster={isCurrentLevelCaster}
        needsSpellsAtCurrentLevel={!!needsSpellsAtCurrentLevel}
        totalStatsSpent={totalStatsSpent}
        onClose={onClose}
        onBack={handleBack}
        onNext={handleNext}
        onSave={handleSaveCharacter}
      />
    </div>
  );
};

