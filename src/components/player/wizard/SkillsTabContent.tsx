import React from 'react';
import { CombatRules } from '@core/rules.js';
import { SKILLS_REGISTRY } from '@core/data/skills-data.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';
import { PRESTIGE_PREREQS } from './constants';

interface SkillsTabContentProps {
  levelConfigs: any[];
  currentLevelIndex: number;
  currentConfig: any;
  currentDraft: any;
  skillSearch: string;
  setSkillSearch: (val: string) => void;
  currentLevelRemainingSkillPoints: number;
  currentLevelMaxSkillPoints: number;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
  targetPrestigeClass?: string;
}

export const SkillsTabContent: React.FC<SkillsTabContentProps> = ({
  levelConfigs,
  currentLevelIndex,
  currentConfig,
  currentDraft,
  skillSearch,
  setSkillSearch,
  currentLevelRemainingSkillPoints,
  updateLevelConfig,
  targetPrestigeClass
}) => {
  const reqSkills = targetPrestigeClass ? (PRESTIGE_PREREQS[targetPrestigeClass]?.skills || {}) : {};

  return (
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
            style={{ padding: '4px 8px', fontSize: '11px', height: '24px', width: '100%', boxSizing: 'border-box' }}
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
              .sort(([keyA]: any, [keyB]: any) => {
                if (!skillSearch && targetPrestigeClass) {
                  const reqA = reqSkills[keyA] !== undefined;
                  const reqB = reqSkills[keyB] !== undefined;
                  if (reqA && !reqB) return -1;
                  if (!reqA && reqB) return 1;
                }
                return 0;
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
                const reqRank = reqSkills[key];

                const isTargetSkill = reqRank !== undefined;
                let rowBg = 'transparent';
                if (currentClicks > 0) {
                  rowBg = 'rgba(76, 175, 80, 0.15)';
                } else if (isTargetSkill && totalRanks < reqRank) {
                  rowBg = 'rgba(255, 235, 59, 0.12)';
                }

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
                      background: rowBg
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

                      {isTargetSkill && (
                        <span 
                          data-testid={`skill-target-badge-${key}`}
                          style={{
                            fontSize: '9.5px',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            background: totalRanks >= reqRank ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 193, 7, 0.3)',
                            color: totalRanks >= reqRank ? '#2e7d32' : '#8d6e15',
                            marginLeft: '6px',
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}
                        >
                          🎯 Ziel: {reqRank} {totalRanks >= reqRank ? '✓' : `(noch ${(reqRank - totalRanks).toFixed(1).replace('.0', '')})`}
                        </span>
                      )}
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
  );
};
