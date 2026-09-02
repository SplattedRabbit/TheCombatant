/**
 * @module    CharacterWizardDialog
 * @summary   Step-by-step wizard for rules-compliant (RAW) character creation for D&D 3.5e.
 *            Offers a full layout with 74-point buy distribution, level-up loop,
 *            skill points distribution, and feat selection with prerequisites check.
 */

import React, { useState, useMemo } from 'react';
import { CombatRules } from '@core/rules.js';
import { CombatFeats } from '@core/data/feats-data.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';

import { 
  getDraftPCState, 
  getCompletedDraftPCState,
  getFeatSlotsAtLevel, 
  getSkillPointsForLevel 
} from './wizard/helpers';
import { Step1RaceName } from './wizard/Step1RaceName';
import { Step2Attributes } from './wizard/Step2Attributes';
import { Step3LevelConfig } from './wizard/Step3LevelConfig';
import { Step3TargetLevelPrompt } from './wizard/Step3TargetLevelPrompt.tsx';
import { Step4Review } from './wizard/Step4Review.tsx';
import { WizardTimeline } from './wizard/WizardTimeline.tsx';
import { applyWizardCharacterToState } from './wizard/wizardSaveHelper.ts';

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

  const prevDraft = useMemo(() => {
    if (!isTargetLevelSet || currentLevelIndex === 0) return null;
    return getDraftPCState(currentLevelIndex - 1, baseStats, selectedRace, levelConfigs);
  }, [isTargetLevelSet, selectedRace, baseStats, levelConfigs, currentLevelIndex]);

  const currentDraft = useMemo(() => {
    if (!isTargetLevelSet) return null;
    return getDraftPCState(currentLevelIndex, baseStats, selectedRace, levelConfigs);
  }, [isTargetLevelSet, selectedRace, baseStats, levelConfigs, currentLevelIndex]);

  const completedDraft = useMemo(() => {
    if (!isTargetLevelSet) return null;
    return getCompletedDraftPCState(levelConfigs.length - 1, baseStats, selectedRace, levelConfigs);
  }, [isTargetLevelSet, selectedRace, baseStats, levelConfigs]);

  const currentConfig = isTargetLevelSet ? levelConfigs[currentLevelIndex] : null;

  const getClassHitDie = (clsKey: string): number => {
    const cls = CombatRules.CLASSES.find((c: any) => c.key === clsKey);
    return cls?.hitDie || 8;
  };

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

  const filteredFeats = useMemo(() => {
    if (!activeFeatSlot || !currentDraft) return [];
    const q = featSearch.toLowerCase().trim();
    const alreadyChosenIds = new Set<string>();
    levelConfigs.forEach(cfg => {
      (cfg.feats || []).forEach((fid: string) => alreadyChosenIds.add(fid));
    });

    return Object.values(CombatFeats.REGISTRY).filter((feat: any) => {
      if (alreadyChosenIds.has(feat.id)) return false;
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
      const incompleteLevel = levelConfigs.find(cfg => !cfg.classType);
      if (incompleteLevel) {
        showCustomAlert("Incomplete Configuration", `Please choose a class for Level ${incompleteLevel.level}.`, "OK", "⚠️");
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
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
    onClose();
  };

  const stepsList = [
    { num: 1, label: 'Identity & Race' },
    { num: 2, label: 'Abilities (74 Pts)' },
    { num: 3, label: 'Level Progression' },
    { num: 4, label: 'Review & Complete' }
  ];

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
            selectedRace={selectedRace}
            baseStats={baseStats}
            setBaseStats={setBaseStats}
            totalStatsSpent={totalStatsSpent}
            highlightClass={highlightClass}
            setHighlightClass={setHighlightClass}
          />
        );

      case 3:
        if (!isTargetLevelSet) {
          return (
            <Step3TargetLevelPrompt
              targetLevel={targetLevel}
              setTargetLevel={setTargetLevel}
              onStart={handleStartLevelConfigs}
            />
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
        return (
          <Step4Review
            name={name}
            selectedRace={selectedRace}
            alignmentEthical={alignmentEthical}
            alignmentMoral={alignmentMoral}
            targetLevel={targetLevel}
            isTargetLevelSet={isTargetLevelSet}
            currentDraft={currentDraft}
            levelConfigs={levelConfigs}
          />
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
        fontFamily: 'var(--font-title)',
        position: 'relative'
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
        {renderStepContent()}
      </div>

      <div style={{ marginTop: '20px' }}>
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

        <WizardTimeline
          step={step}
          stepsList={stepsList}
          name={name}
          selectedRace={selectedRace}
          targetLevel={targetLevel}
        />
      </div>
    </div>
  );
};
