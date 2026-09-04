/**
 * @module    LevelUpDialog
 * @summary   Guided 4-Step Linear Wizard for single level advancement (n -> n+1).
 */

import React, { useState, useMemo } from 'react';
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
import { Step4Review } from './steps/Step4Review';

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
    return getDraftPCState(newLevelIndex - 1, baseStats, selectedRace, levelConfigs);
  }, [newLevelIndex, baseStats, selectedRace, levelConfigs]);

  const currentDraft = useMemo(() => {
    return getDraftPCState(newLevelIndex, baseStats, selectedRace, levelConfigs);
  }, [newLevelIndex, baseStats, selectedRace, levelConfigs]);

  const completedDraft = useMemo(() => {
    return getCompletedDraftPCState(newLevelIndex, baseStats, selectedRace, levelConfigs);
  }, [newLevelIndex, baseStats, selectedRace, levelConfigs]);

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
      if (q) {
        const nameDe = (feat.nameDe || '').toLowerCase();
        const nameEn = (feat.nameEn || '').toLowerCase();
        const benefit = (feat.benefitDe || feat.benefitRaw || '').toLowerCase();
        if (!nameDe.includes(q) && !nameEn.includes(q) && !benefit.includes(q)) return false;
      }
      return true;
    });
  }, [activeFeatSlot, currentDraft, featSearch, featFilter, levelConfigs]);

  const handleNextStep = () => {
    if (step === 1) {
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
    }

    setStep(prev => Math.min(4, prev + 1));
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleCompleteLevelUp = () => {
    applyLevelUpToActivePC(levelConfigs, newLevelIndex, completedDraft);
    onClose();
  };

  if (!currentConfig) return null;

  const stepLabels = [
    { num: 1, label: 'Class & Stats', icon: '⚔️' },
    { num: 2, label: 'Skills & Tricks', icon: '📜' },
    { num: 3, label: 'Feats & ACFs', icon: '🎓' },
    { num: 4, label: 'Review & Apply', icon: '✦' },
  ];

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
        <div
          style={{
            padding: '10px 18px',
            borderBottom: '1.5px solid var(--pb, #c8a96e)',
            background: 'linear-gradient(180deg, rgba(200, 169, 110, 0.28), rgba(200, 169, 110, 0.1))',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🧙‍♂️</span>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '16px', color: 'var(--red, #8b1a1a)' }}>
                Level-Up Assistant: <span style={{ color: 'var(--ink)' }}>{activePC.name || 'Adventurer'}</span>
              </h2>
              <span style={{ padding: '1px 6px', background: 'rgba(139,26,26,0.08)', borderRadius: '3px', border: '0.5px solid rgba(139,26,26,0.2)', fontSize: '10.5px', fontWeight: 'bold', color: 'var(--red)' }}>
                Level {initialDraft.totalCurrentLevel} ➔ Level {targetLevel}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{
                padding: '2px 8px',
                fontSize: '13px',
                cursor: 'pointer',
                color: 'var(--ink)',
                border: '1px solid var(--pb)',
                borderRadius: '4px',
                background: 'rgba(200, 169, 110, 0.2)',
              }}
            >
              ✕
            </button>
          </div>

          {/* Linear Step Breadcrumbs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {stepLabels.map((s) => {
              const isActive = step === s.num;
              const isPast = step > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (isPast) setStep(s.num);
                  }}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    borderRadius: '4px',
                    border: isActive ? '1px solid var(--red)' : (isPast ? '1px solid var(--pb)' : '1px solid transparent'),
                    background: isActive ? 'var(--red)' : (isPast ? 'rgba(200, 169, 110, 0.25)' : 'rgba(200, 169, 110, 0.08)'),
                    color: isActive ? '#ffffff' : (isPast ? 'var(--ink)' : 'var(--inkl)'),
                    fontFamily: 'var(--font-title)',
                    fontSize: '11px',
                    fontWeight: isActive ? 'bold' : 'normal',
                    cursor: isPast ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{s.icon}</span>
                  <span>{s.num}. {s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

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
          {step === 1 && (
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

          {step === 2 && (
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

          {step === 3 && (
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

          {step === 4 && (
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
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1.5px solid var(--pb, #c8a96e)',
            background: 'linear-gradient(180deg, rgba(200, 169, 110, 0.08), rgba(200, 169, 110, 0.22))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {step === 1 ? (
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{ padding: '4px 14px', fontSize: '11.5px', fontFamily: 'var(--font-title)', color: 'var(--inkm)' }}
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePrevStep}
              className="btn"
              style={{ padding: '4px 14px', fontSize: '11.5px', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>‹</span>
              <span>Back</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="btn btn-p"
                style={{
                  padding: '5px 20px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-title)',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Next Step</span>
                <span>›</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteLevelUp}
                className="btn btn-p animate-glow"
                style={{
                  padding: '5px 22px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-title)',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #8b1a1a, #661010)',
                  border: '1px solid #500b0b',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(139, 26, 26, 0.3)',
                }}
              >
                ✦ Complete Level Up
              </button>
            )}
          </div>
        </div>
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
