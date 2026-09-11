/**
 * @module    CharacterWizardNav
 * @summary   Bottom navigation bar and timeline for CharacterWizardDialog.
 */

import React from 'react';
import { WizardTimeline } from './WizardTimeline.tsx';

export interface CharacterWizardNavProps {
  step: number;
  stepsList: { num: number; label: string }[];
  name: string;
  selectedRace: string;
  targetLevel: number;
  currentLevelIndex: number;
  isTargetLevelSet: boolean;
  levelSubView: 'config' | 'spells';
  isCurrentLevelCaster: boolean;
  needsSpellsAtCurrentLevel: boolean;
  totalStatsSpent: number;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
}

export const CharacterWizardNav: React.FC<CharacterWizardNavProps> = ({
  step,
  stepsList,
  name,
  selectedRace,
  targetLevel,
  currentLevelIndex,
  isTargetLevelSet,
  levelSubView,
  isCurrentLevelCaster,
  needsSpellsAtCurrentLevel,
  totalStatsSpent,
  onClose,
  onBack,
  onNext,
  onSave,
}) => {
  const isSpellSelectionOpen = step === 3 && isTargetLevelSet && levelSubView === 'spells';

  return (
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
            onClick={onBack}
            disabled={step === 1}
            className="btn"
            style={{ padding: '4px 16px', fontSize: '12px', opacity: step === 1 ? 0.5 : 1 }}
          >
            {isSpellSelectionOpen
              ? `← Level ${currentLevelIndex + 1} Config`
              : step === 3 && isTargetLevelSet && currentLevelIndex > 0
              ? `← Level ${currentLevelIndex}`
              : 'Back'}
          </button>
          
          {step < 4 ? (
            <button 
              onClick={onNext}
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
                  (step === 3 && !isTargetLevelSet) ||
                  (isSpellSelectionOpen && needsSpellsAtCurrentLevel)
                ) ? 0.5 : 1
              }}
            >
              {step === 3 && isTargetLevelSet && levelSubView === 'config' && isCurrentLevelCaster
                ? `Select Spells for Level ${currentLevelIndex + 1} →`
                : step === 3 && isTargetLevelSet && currentLevelIndex < targetLevel - 1
                ? `Level ${currentLevelIndex + 2} →`
                : step === 3 && isTargetLevelSet
                ? 'Review (Step 4) →'
                : 'Next'}
            </button>
          ) : (
            <button 
              onClick={onSave}
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
  );
};
