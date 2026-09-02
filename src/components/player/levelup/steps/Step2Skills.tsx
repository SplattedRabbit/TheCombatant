/**
 * @module    Step2Skills
 * @summary   Step 2 of the Level-Up Wizard: Full-width Skill Points Allocation & Skill Tricks.
 */

import React, { useState } from 'react';
import { SkillsTabContent } from '../../wizard/SkillsTabContent';
import { SkillTricksTabContent } from '../../wizard/SkillTricksTabContent';
import { CombatRules } from '@core/rules.js';

export interface Step2SkillsProps {
  levelConfigs: any[];
  currentConfig: any;
  currentLevelIndex: number;
  currentDraft: any;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
  currentLevelRemainingSkillPoints: number;
  currentLevelMaxSkillPoints: number;
  skillSearch: string;
  setSkillSearch: (val: string) => void;
}

export const Step2Skills: React.FC<Step2SkillsProps> = ({
  levelConfigs,
  currentConfig,
  currentLevelIndex,
  currentDraft,
  updateLevelConfig,
  currentLevelRemainingSkillPoints,
  currentLevelMaxSkillPoints,
  skillSearch,
  setSkillSearch,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'skills' | 'tricks'>('skills');

  const totalLearnedTricksCount = levelConfigs
    .slice(0, currentLevelIndex + 1)
    .reduce((sum, cfg) => sum + (cfg.skillTricks?.length || 0), 0);
  const maxTricksLimit = currentDraft?.draftPC
    ? CombatRules.getMaxSkillTricksLimit(currentDraft.draftPC)
    : Math.floor((currentLevelIndex + 1) / 2);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: 'rgba(255, 255, 255, 0.65)',
        border: '1px solid rgba(200, 169, 110, 0.5)',
        borderRadius: '6px',
        padding: '12px 14px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        minHeight: '360px',
      }}
    >
      {/* Sub-Tabs & Points Summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1.5px solid var(--pb)',
          paddingBottom: '4px',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('skills')}
            style={{
              padding: '4px 12px',
              borderRadius: '3px 3px 0 0',
              border: 'none',
              borderBottom: activeSubTab === 'skills' ? '2px solid var(--red)' : '2px solid transparent',
              background: activeSubTab === 'skills' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
              color: activeSubTab === 'skills' ? 'var(--red)' : 'var(--inkm)',
              fontWeight: activeSubTab === 'skills' ? 'bold' : 'normal',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'var(--font-title)',
            }}
          >
            📝 Skills ({currentLevelRemainingSkillPoints} SP left)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('tricks')}
            style={{
              padding: '4px 12px',
              borderRadius: '3px 3px 0 0',
              border: 'none',
              borderBottom: activeSubTab === 'tricks' ? '2px solid var(--red)' : '2px solid transparent',
              background: activeSubTab === 'tricks' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
              color: activeSubTab === 'tricks' ? 'var(--red)' : 'var(--inkm)',
              fontWeight: activeSubTab === 'tricks' ? 'bold' : 'normal',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'var(--font-title)',
            }}
          >
            🎭 Skill Tricks ({totalLearnedTricksCount} / {maxTricksLimit})
          </button>
        </div>

        <div
          style={{
            background: currentLevelRemainingSkillPoints < 0 ? 'rgba(211, 47, 47, 0.15)' : 'rgba(200, 169, 110, 0.15)',
            border: currentLevelRemainingSkillPoints < 0 ? '1px solid #d32f2f' : '1px solid var(--pb)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            color: currentLevelRemainingSkillPoints < 0 ? '#d32f2f' : 'var(--red)',
          }}
        >
          {currentLevelRemainingSkillPoints} / {currentLevelMaxSkillPoints} Points Available
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px' }}>
        {activeSubTab === 'skills' ? (
          <SkillsTabContent
            levelConfigs={levelConfigs}
            currentConfig={currentConfig}
            currentLevelIndex={currentLevelIndex}
            updateLevelConfig={updateLevelConfig}
            currentDraft={currentDraft}
            currentLevelRemainingSkillPoints={currentLevelRemainingSkillPoints}
            currentLevelMaxSkillPoints={currentLevelMaxSkillPoints}
            skillSearch={skillSearch}
            setSkillSearch={setSkillSearch}
          />
        ) : (
          <SkillTricksTabContent
            currentConfig={currentConfig}
            levelConfigs={levelConfigs}
            currentLevelIndex={currentLevelIndex}
            updateLevelConfig={updateLevelConfig}
            currentDraft={currentDraft}
            currentLevelRemainingSkillPoints={currentLevelRemainingSkillPoints}
          />
        )}
      </div>
    </div>
  );
};
