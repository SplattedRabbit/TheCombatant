/**
 * @module    LevelUpDialog
 * @summary   Guided 4-Step Linear Wizard for single level advancement (n -> n+1).
 */

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CombatFeats } from '@core/data/feats-data.js';
import { CLASSES_LIST } from '../wizard/constants';
import { validatePrestigeClassPrereqs } from '@core/rules.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';
import { 
  getDraftPCState, 
  getCompletedDraftPCState, 
  getFeatSlotsAtLevel, 
  getSkillPointsForLevel 
} from '../wizard/helpers';
import { createLevelUpDraft } from '../../../services/levelup/levelUpAdapter';
import { applyLevelUpToActivePC } from './levelUpSaveHelper';
import { Step1ClassAndStats } from './steps/Step1ClassAndStats';
import { Step2Skills } from './steps/Step2Skills';
import { Step3Feats } from './steps/Step3Feats';
import { StepSpells } from './steps/StepSpells';
import { Step4Review } from './steps/Step4Review';
import { LevelUpHeader } from './LevelUpHeader';
import { LevelUpFooter } from './LevelUpFooter';
import { getAllCompendiumSpells } from '@core/rules/RulesSpells.js';
import { calculateLevelUpSpellQuota, validateLevelUpSpellSelection } from '../../../services/levelup/levelUpSpellRules';

interface LevelUpDialogProps {
  activePC: any;
  isOpen: boolean;
  onClose: () => void;
}

interface LevelUpDialogContentProps {
  activePC: any;
  onClose: () => void;
}

const LevelUpDialogContent: React.FC<LevelUpDialogContentProps> = ({ activePC, onClose }) => {
  const initialDraft = useMemo(() => createLevelUpDraft(activePC), [activePC]);

  const [step, setStep] = useState<number>(1);
  const [levelConfigs, setLevelConfigs] = useState<any[]>(() => initialDraft.levelConfigs);
  const [skillSearch, setSkillSearch] = useState('');
  const [featSelectSlotIndex, setFeatSelectSlotIndex] = useState<number | null>(null);
  const [featSearch, setFeatSearch] = useState('');
  const [featFilter, setFeatFilter] = useState('all');

  const newLevelIndex = initialDraft.newLevelIndex;
  const targetLevel = initialDraft.newLevel;
  const currentConfig = levelConfigs[newLevelIndex];
  const selectedRace = initialDraft.selectedRace;
  const baseStats = initialDraft.baseStats;

  const updateLevelConfig = (idx: number, key: string, val: any) => {
    setLevelConfigs(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: val };
      return next;
    });
  };

  const prevDraft = useMemo(() => {
    return getDraftPCState(newLevelIndex - 1, baseStats, selectedRace, levelConfigs, activePC?.alignment);
  }, [newLevelIndex, baseStats, selectedRace, levelConfigs, activePC?.alignment]);

  const currentDraft = useMemo(() => {
    return getDraftPCState(newLevelIndex, baseStats, selectedRace, levelConfigs, activePC?.alignment);
  }, [newLevelIndex, baseStats, selectedRace, levelConfigs, activePC?.alignment]);

  const completedDraft = useMemo(() => {
    return getCompletedDraftPCState(newLevelIndex, baseStats, selectedRace, levelConfigs, activePC?.alignment);
  }, [newLevelIndex, baseStats, selectedRace, levelConfigs, activePC?.alignment]);

  const getClassHitDie = (clsKey: string): number => {
    const cls = CLASSES_LIST.find((c: any) => c.key === clsKey);
    return cls?.hd || 8;
  };

  // Skill points calculation
  const currentLevelMaxSkillPoints = currentConfig?.classType
    ? getSkillPointsForLevel(newLevelIndex, currentConfig.classType, selectedRace, baseStats, prevDraft)
    : 0;

  const spentOnSkills = Object.values(currentConfig?.skills || {}).reduce((sum: number, val: any) => sum + (parseInt(val) || 0), 0);
  const spentOnTricks = (currentConfig?.skillTricks || []).length * 2;
  const currentLevelRemainingSkillPoints = currentLevelMaxSkillPoints - (spentOnSkills + spentOnTricks);

  // Feats calculation
  const currentFeatSlots = currentConfig?.classType
    ? getFeatSlotsAtLevel(newLevelIndex, currentConfig.classType, selectedRace, levelConfigs)
    : [];

  useEffect(() => {
    if (!currentConfig || !currentFeatSlots || currentFeatSlots.length === 0) {
      setFeatSelectSlotIndex(null);
      return;
    }
    let featsChanged = false;
    const currentFeats = { ...(currentConfig.feats || {}) };
    currentFeatSlots.forEach((slot, sIdx) => {
      if (slot.defaultFeat && !currentFeats[sIdx]) {
        currentFeats[sIdx] = slot.defaultFeat;
        featsChanged = true;
      }
    });
    if (featsChanged) {
      updateLevelConfig(newLevelIndex, 'feats', currentFeats);
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
  }, [currentConfig?.classType, currentFeatSlots.length, newLevelIndex]);

  const activeFeatSlot = featSelectSlotIndex !== null ? currentFeatSlots[featSelectSlotIndex] : null;

  const filteredFeats = useMemo(() => {
    if (!activeFeatSlot || !currentDraft) return [];
    const q = featSearch.toLowerCase().trim();
    const alreadyChosenIds = new Set<string>();
    levelConfigs.forEach(cfg => {
      (cfg.feats || []).forEach((fid: string) => alreadyChosenIds.add(fid));
    });

    return Object.values(CombatFeats.REGISTRY).filter((feat: any) => {
      if (featFilter !== 'all' && feat.category !== featFilter) return false;
      if (activeFeatSlot.allowedCategories && !activeFeatSlot.allowedCategories.includes(feat.category)) return false;
      if (activeFeatSlot.allowedFeats && !activeFeatSlot.allowedFeats.includes(feat.id)) return false;
      if (q) {
        const name = (feat.name || feat.nameEn || feat.nameDe || '').toLowerCase();
        const benefit = (feat.benefit || feat.benefitRaw || feat.benefitDe || '').toLowerCase();
        if (!name.includes(q) && !benefit.includes(q)) return false;
      }
      return true;
    });
  }, [activeFeatSlot, currentDraft, featSearch, featFilter, levelConfigs]);

  const spellQuota = useMemo(() => {
    return calculateLevelUpSpellQuota(activePC, currentDraft, currentConfig);
  }, [activePC, currentDraft, currentConfig]);

  const stepLabels = useMemo(() => {
    const list = [
      { id: 'class', label: 'Class & Stats', icon: '⚔️' },
      { id: 'skills', label: 'Skills & Tricks', icon: '📜' },
      { id: 'feats', label: 'Feats & ACFs', icon: '🎓' },
    ];
    if (spellQuota.requiresSpellSelection || spellQuota.mode === 'info_only') {
      list.push({ id: 'spells', label: 'Spells', icon: '🔮' });
    }
    list.push({ id: 'review', label: 'Review & Apply', icon: '✦' });
    return list.map((item, idx) => ({ ...item, num: idx + 1 }));
  }, [spellQuota.requiresSpellSelection, spellQuota.mode]);

  const currentStepDef = stepLabels[step - 1] || stepLabels[0];
  const currentStepId = currentStepDef?.id || 'class';

  const handleNextStep = () => {
    if (currentStepId === 'class') {
      if (!currentConfig || !currentConfig.classType) {
        showCustomAlert('Class Required', 'Please select a class for your new level before proceeding.', 'OK', '⚠️');
        return;
      }
      const clsDef = CLASSES_LIST.find((c: any) => c.key === currentConfig.classType);
      if (clsDef?.isPrestige && currentDraft?.draftPC) {
        const validation = validatePrestigeClassPrereqs(currentDraft.draftPC, currentConfig.classType);
        if (!validation.success && !currentConfig.prestigeSpecialTextConfirmed?.[currentConfig.classType]) {
          showCustomAlert(
            'Prerequisites Unmet',
            `You do not meet the prerequisites for ${clsDef.name || clsDef.key}. Please select a valid class before continuing.`,
            'OK',
            '🔒'
          );
          return;
        }
      }
      const isAbilityMilestone = (targetLevel % 4 === 0);
      if (isAbilityMilestone && !currentConfig.abilityIncrease) {
        showCustomAlert('Milestone Choice Required', `Level ${targetLevel} grants +1 to an Ability Score. Please select an attribute before proceeding.`, 'OK', '✨');
        return;
      }
      if (!currentConfig.hpRoll || parseInt(currentConfig.hpRoll) <= 0) {
        const defaultRoll = Math.ceil(getClassHitDie(currentConfig.classType) / 2) + 1;
        updateLevelConfig(newLevelIndex, 'hpRoll', defaultRoll);
      }
    } else if (currentStepId === 'spells') {
      if (spellQuota.requiresSpellSelection) {
        const allSpells = getAllCompendiumSpells(activePC);
        const allSpellsMap = Object.fromEntries(allSpells.map((s: any) => [s.id || s.key, s]));
        const val = validateLevelUpSpellSelection(currentConfig.spells || [], spellQuota, allSpellsMap);
        if (!val.valid) {
          showCustomAlert('Spell Selection Incomplete', val.reason || 'Please complete your spell selection before continuing.', 'OK', '⚠️');
          return;
        }
      }
    }

    setStep(prev => Math.min(stepLabels.length, prev + 1));
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleCompleteLevelUp = () => {
    applyLevelUpToActivePC(levelConfigs, newLevelIndex, completedDraft);
    onClose();
  };

  if (!currentConfig) return null;

  return (
    <div
      id="levelUpDialogOverlay"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 10, 5, 0.72)',
        backdropFilter: 'blur(3px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="sheet no-print"
        style={{
          width: '920px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          background: 'var(--parchment, #fdf6e2)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '8px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          padding: 0,
          margin: '0 auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative inner border */}
        <div style={{ position: 'absolute', inset: '3px', border: '1px dashed rgba(200, 169, 110, 0.35)', pointerEvents: 'none', borderRadius: '5px', zIndex: 1 }} />

        {/* Modal Header with Breadcrumbs */}
        <LevelUpHeader
          activePCName={activePC.name}
          totalCurrentLevel={initialDraft.totalCurrentLevel}
          targetLevel={targetLevel}
          step={step}
          stepLabels={stepLabels}
          onStepClick={setStep}
          onClose={onClose}
        />

        {/* Content Body: Step Container */}
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
            minHeight: '380px',
            padding: '14px 18px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {currentStepId === 'class' && (
            <Step1ClassAndStats
              activePC={activePC}
              initialDraft={initialDraft}
              currentConfig={currentConfig}
              currentLevelIndex={newLevelIndex}
              targetLevel={targetLevel}
              updateLevelConfig={updateLevelConfig}
              getClassHitDie={getClassHitDie}
              currentDraft={currentDraft}
              prevDraft={prevDraft}
              completedDraft={completedDraft}
              levelConfigs={levelConfigs}
            />
          )}

          {currentStepId === 'skills' && (
            <Step2Skills
              levelConfigs={levelConfigs}
              currentConfig={currentConfig}
              currentLevelIndex={newLevelIndex}
              currentDraft={currentDraft}
              updateLevelConfig={updateLevelConfig}
              currentLevelRemainingSkillPoints={currentLevelRemainingSkillPoints}
              currentLevelMaxSkillPoints={currentLevelMaxSkillPoints}
              skillSearch={skillSearch}
              setSkillSearch={setSkillSearch}
            />
          )}

          {currentStepId === 'feats' && (
            <Step3Feats
              levelConfigs={levelConfigs}
              currentConfig={currentConfig}
              currentLevelIndex={newLevelIndex}
              targetLevel={targetLevel}
              currentDraft={currentDraft}
              updateLevelConfig={updateLevelConfig}
              currentFeatSlots={currentFeatSlots}
              activeFeatSlot={activeFeatSlot}
              filteredFeats={filteredFeats}
              featSelectSlotIndex={featSelectSlotIndex}
              setFeatSelectSlotIndex={setFeatSelectSlotIndex}
              featSearch={featSearch}
              setFeatSearch={setFeatSearch}
              featFilter={featFilter}
              setFeatFilter={setFeatFilter}
            />
          )}

          {currentStepId === 'spells' && (
            <StepSpells
              activePC={activePC}
              currentConfig={currentConfig}
              currentLevelIndex={newLevelIndex}
              targetLevel={targetLevel}
              updateLevelConfig={updateLevelConfig}
              quota={spellQuota}
            />
          )}

          {currentStepId === 'review' && (
            <Step4Review
              currentConfig={currentConfig}
              targetLevel={targetLevel}
              prevDraft={prevDraft}
              currentDraft={currentDraft}
              completedDraft={completedDraft}
              currentLevelRemainingSkillPoints={currentLevelRemainingSkillPoints}
            />
          )}
        </div>

        {/* Modal Footer: Back & Next / Complete */}
        <LevelUpFooter
          step={step}
          totalSteps={stepLabels.length}
          onClose={onClose}
          onPrevStep={handlePrevStep}
          onNextStep={handleNextStep}
          onComplete={handleCompleteLevelUp}
        />
      </div>
    </div>
  );
};

export const LevelUpDialog: React.FC<LevelUpDialogProps> = ({ activePC, isOpen, onClose }) => {
  if (!isOpen || !activePC) return null;
  if (typeof document === 'undefined') {
    return <LevelUpDialogContent activePC={activePC} onClose={onClose} />;
  }
  return createPortal(
    <LevelUpDialogContent activePC={activePC} onClose={onClose} />,
    document.body
  );
};
