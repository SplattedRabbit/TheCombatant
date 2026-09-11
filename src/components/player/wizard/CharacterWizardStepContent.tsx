/**
 * @module    CharacterWizardStepContent
 * @summary   Dispatches and renders the active step view for the Character Creation Wizard.
 * @feature   player/wizard
 * @exports   CharacterWizardStepContent
 */

import React from 'react';
import { Step1RaceName } from './Step1RaceName';
import { Step2Attributes } from './Step2Attributes';
import { Step3TargetLevelPrompt } from './Step3TargetLevelPrompt';
import { Step3SpellSelectionView } from './spells/Step3SpellSelectionView';
import { Step3LevelConfig } from './Step3LevelConfig';
import { Step4Review } from './Step4Review';

interface CharacterWizardStepContentProps {
  step: number;
  name: string;
  setName: (v: string) => void;
  selectedRace: string;
  setSelectedRace: (v: string) => void;
  alignmentEthical: string;
  setAlignmentEthical: (v: string) => void;
  alignmentMoral: string;
  setAlignmentMoral: (v: string) => void;
  targetPrestigeClass: string;
  setTargetPrestigeClass: (cls: string) => void;
  setHighlightClass: (cls: string) => void;
  highlightClass: string;
  baseStats: any;
  setBaseStats: React.Dispatch<React.SetStateAction<any>>;
  totalStatsSpent: number;
  isTargetLevelSet: boolean;
  targetLevel: number;
  setTargetLevel: any;
  handleStartLevelConfigs: () => void;
  levelSubView: string;
  currentConfig: any;
  currentLevelIndex: number;
  setCurrentLevelIndex: (idx: number) => void;
  currentDraft: any;
  prevDraft: any;
  completedDraft: any;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
  levelConfigs: any[];
  getClassHitDie: (clsType: string) => number;
  activeTab: any;
  setActiveTab: any;
  currentLevelRemainingSkillPoints: number;
  currentLevelMaxSkillPoints: number;
  skillSearch: string;
  setSkillSearch: (v: string) => void;
  featSelectSlotIndex: number | null;
  setFeatSelectSlotIndex: (idx: number | null) => void;
  featSearch: string;
  setFeatSearch: (v: string) => void;
  featFilter: string;
  setFeatFilter: (f: string) => void;
  currentFeatSlots: any[];
  activeFeatSlot: any;
  filteredFeats: any[];
}

export const CharacterWizardStepContent: React.FC<CharacterWizardStepContentProps> = (props) => {
  const {
    step,
    name,
    setName,
    selectedRace,
    setSelectedRace,
    alignmentEthical,
    setAlignmentEthical,
    alignmentMoral,
    setAlignmentMoral,
    targetPrestigeClass,
    setTargetPrestigeClass,
    setHighlightClass,
    highlightClass,
    baseStats,
    setBaseStats,
    totalStatsSpent,
    isTargetLevelSet,
    targetLevel,
    setTargetLevel,
    handleStartLevelConfigs,
    levelSubView,
    currentConfig,
    currentLevelIndex,
    setCurrentLevelIndex,
    currentDraft,
    prevDraft,
    completedDraft,
    updateLevelConfig,
    levelConfigs,
    getClassHitDie,
    activeTab,
    setActiveTab,
    currentLevelRemainingSkillPoints,
    currentLevelMaxSkillPoints,
    skillSearch,
    setSkillSearch,
    featSelectSlotIndex,
    setFeatSelectSlotIndex,
    featSearch,
    setFeatSearch,
    featFilter,
    setFeatFilter,
    currentFeatSlots,
    activeFeatSlot,
    filteredFeats
  } = props;

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
          targetPrestigeClass={targetPrestigeClass}
          setTargetPrestigeClass={(cls) => {
            setTargetPrestigeClass(cls);
            if (cls) setHighlightClass(cls);
          }}
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
          targetPrestigeClass={targetPrestigeClass}
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

      if (levelSubView === 'spells') {
        return (
          <Step3SpellSelectionView
            currentConfig={currentConfig}
            currentLevelIndex={currentLevelIndex}
            currentDraft={currentDraft}
            updateLevelConfig={updateLevelConfig}
            allLevelConfigs={levelConfigs}
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
          targetPrestigeClass={targetPrestigeClass}
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
