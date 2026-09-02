/**
 * @module    Step3LevelConfig
 * @summary   Step 3 of character creation/leveling wizard: Level Timeline, Class & HP, Prestige Spell Links, and Tabs for Skills, Tricks, Feats & ACFs.
 *            Modularized with dedicated sub-components in ./levelConfig/
 */

import React from 'react';
import { CombatRules } from '@core/rules.js';
import { SkillsTabContent } from './SkillsTabContent';
import { SkillTricksTabContent } from './SkillTricksTabContent';
import { FeatsTabContent } from './FeatsTabContent';
import { ACFsTabContent } from './ACFsTabContent';
import { LevelHeaderAndStats } from './levelConfig/LevelHeaderAndStats';
import { FeatSlotsSidebar } from './levelConfig/FeatSlotsSidebar';

export interface Step3LevelConfigProps {
  levelConfigs: any[];
  currentLevelIndex: number;
  setCurrentLevelIndex: (idx: number) => void;
  currentConfig: any;
  currentDraft: any;
  prevDraft: any;
  completedDraft: any;
  getClassHitDie: (cls: string) => number;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
  activeTab: 'skills' | 'tricks' | 'feats' | 'acfs';
  setActiveTab: (tab: 'skills' | 'tricks' | 'feats' | 'acfs') => void;
  currentLevelRemainingSkillPoints: number;
  currentLevelMaxSkillPoints: number;
  skillSearch: string;
  setSkillSearch: (val: string) => void;
  featSelectSlotIndex: number | null;
  setFeatSelectSlotIndex: (idx: number | null) => void;
  featSearch: string;
  setFeatSearch: (val: string) => void;
  featFilter: string;
  setFeatFilter: (val: string) => void;
  currentFeatSlots: any[];
  activeFeatSlot: any;
  filteredFeats: any[];
}

export const Step3LevelConfig: React.FC<Step3LevelConfigProps> = ({
  levelConfigs,
  currentLevelIndex,
  setCurrentLevelIndex,
  currentConfig,
  currentDraft,
  prevDraft,
  completedDraft,
  getClassHitDie,
  updateLevelConfig,
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
  filteredFeats,
}) => {
  // Sync prestige spell progression links if single arcane/divine class is available
  React.useEffect(() => {
    if (!currentConfig || !currentDraft) return;

    if (currentConfig.classType === 'mystic_theurge') {
      const arcaneOptions = currentDraft.classes.filter((cl: any) => ['wizard', 'sorcerer', 'bard'].includes(cl.classType));
      const divineOptions = currentDraft.classes.filter((cl: any) => ['cleric', 'druid', 'paladin', 'ranger'].includes(cl.classType));

      const links = { ...currentConfig.prestigeSpellLinks?.mystic_theurge };
      let changed = false;

      if (arcaneOptions.length === 1 && links.arcane !== arcaneOptions[0].classType) {
        links.arcane = arcaneOptions[0].classType;
        changed = true;
      }
      if (divineOptions.length === 1 && links.divine !== divineOptions[0].classType) {
        links.divine = divineOptions[0].classType;
        changed = true;
      }

      if (changed) {
        updateLevelConfig(currentLevelIndex, 'prestigeSpellLinks', {
          ...currentConfig.prestigeSpellLinks,
          mystic_theurge: links,
        });
      }
    } else if (currentConfig.classType === 'arcane_trickster') {
      const arcaneOptions = currentDraft.classes.filter((cl: any) => ['wizard', 'sorcerer', 'bard'].includes(cl.classType));

      const currentLink = currentConfig.prestigeSpellLinks?.arcane_trickster;
      if (arcaneOptions.length === 1 && currentLink !== arcaneOptions[0].classType) {
        updateLevelConfig(currentLevelIndex, 'prestigeSpellLinks', {
          ...currentConfig.prestigeSpellLinks,
          arcane_trickster: arcaneOptions[0].classType,
        });
      }
    }
  }, [currentConfig.classType, currentDraft, currentLevelIndex]);

  const totalLearnedTricksCount = levelConfigs
    .slice(0, currentLevelIndex + 1)
    .reduce((sum, cfg) => sum + (cfg.skillTricks?.length || 0), 0);
  const maxTricksLimit = currentDraft?.draftPC
    ? CombatRules.getMaxSkillTricksLimit(currentDraft.draftPC)
    : Math.floor((currentLevelIndex + 1) / 2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', marginTop: '10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '24px' }}>
        {/* Left Column: Timeline, Class, HP, Ability Increase, Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <LevelHeaderAndStats
            levelConfigs={levelConfigs}
            currentLevelIndex={currentLevelIndex}
            setCurrentLevelIndex={setCurrentLevelIndex}
            currentConfig={currentConfig}
            currentDraft={currentDraft}
            prevDraft={prevDraft}
            completedDraft={completedDraft}
            getClassHitDie={getClassHitDie}
            updateLevelConfig={updateLevelConfig}
          />

          {/* Feat Slots sidebar tiles (when Feats tab is active) */}
          {activeTab === 'feats' && (
            <FeatSlotsSidebar
              currentFeatSlots={currentFeatSlots}
              currentConfig={currentConfig}
              featSelectSlotIndex={featSelectSlotIndex}
              setFeatSelectSlotIndex={setFeatSelectSlotIndex}
            />
          )}
        </div>

        {/* Right Column: Tab Navigation & Tab Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Tabs Header */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              height: '30px',
              borderBottom: '1.5px solid var(--pb)',
              paddingBottom: '2px',
              marginBottom: '4px',
              boxSizing: 'border-box',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('skills')}
              style={{
                flex: 1.2,
                padding: '4px 6px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: activeTab === 'skills' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'skills' ? '2px solid var(--red)' : '2px solid transparent',
                color: activeTab === 'skills' ? 'var(--red)' : 'var(--inkm)',
                fontWeight: activeTab === 'skills' ? 'bold' : 'normal',
                fontSize: '11.5px',
                cursor: 'pointer',
                fontFamily: 'var(--font-title)',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
              }}
            >
              📝 Skills ({currentLevelRemainingSkillPoints} / {currentLevelMaxSkillPoints})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tricks')}
              style={{
                flex: 1,
                padding: '4px 6px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: activeTab === 'tricks' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'tricks' ? '2px solid var(--red)' : '2px solid transparent',
                color: activeTab === 'tricks' ? 'var(--red)' : 'var(--inkm)',
                fontWeight: activeTab === 'tricks' ? 'bold' : 'normal',
                fontSize: '11.5px',
                cursor: 'pointer',
                fontFamily: 'var(--font-title)',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
              }}
            >
              🎭 Tricks ({totalLearnedTricksCount} / {maxTricksLimit})
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentFeatSlots.length > 0) {
                  setActiveTab('feats');
                }
              }}
              disabled={currentFeatSlots.length === 0}
              style={{
                flex: 1,
                padding: '4px 6px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: activeTab === 'feats' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'feats' ? '2px solid var(--red)' : '2px solid transparent',
                color: currentFeatSlots.length === 0 ? 'var(--inkl)' : activeTab === 'feats' ? 'var(--red)' : 'var(--inkm)',
                fontWeight: activeTab === 'feats' ? 'bold' : 'normal',
                fontSize: '11.5px',
                cursor: currentFeatSlots.length === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-title)',
                opacity: currentFeatSlots.length === 0 ? 0.5 : 1,
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
              }}
              title={currentFeatSlots.length === 0 ? 'No feat slots available at this level' : ''}
            >
              🛡️ Feats ({currentFeatSlots.filter((_, idx) => !currentConfig.feats?.[idx]).length} open)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('acfs')}
              style={{
                flex: 1,
                padding: '4px 6px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: activeTab === 'acfs' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'acfs' ? '2px solid var(--red)' : '2px solid transparent',
                color: activeTab === 'acfs' ? 'var(--red)' : 'var(--inkm)',
                fontWeight: activeTab === 'acfs' ? 'bold' : 'normal',
                fontSize: '11.5px',
                cursor: 'pointer',
                fontFamily: 'var(--font-title)',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
              }}
            >
              ⚡ ACFs ({currentConfig.acfs?.length || 0})
            </button>
          </div>

          {/* Active Tab Panel */}
          {activeTab === 'skills' && (
            <SkillsTabContent
              levelConfigs={levelConfigs}
              currentLevelIndex={currentLevelIndex}
              currentConfig={currentConfig}
              currentDraft={currentDraft}
              skillSearch={skillSearch}
              setSkillSearch={setSkillSearch}
              currentLevelRemainingSkillPoints={currentLevelRemainingSkillPoints}
              currentLevelMaxSkillPoints={currentLevelMaxSkillPoints}
              updateLevelConfig={updateLevelConfig}
            />
          )}

          {activeTab === 'tricks' && (
            <SkillTricksTabContent
              currentConfig={currentConfig}
              levelConfigs={levelConfigs}
              currentLevelIndex={currentLevelIndex}
              currentDraft={currentDraft}
              currentLevelRemainingSkillPoints={currentLevelRemainingSkillPoints}
              updateLevelConfig={updateLevelConfig}
            />
          )}

          {activeTab === 'feats' && (
            <FeatsTabContent
              currentConfig={currentConfig}
              currentDraft={currentDraft}
              featSelectSlotIndex={featSelectSlotIndex}
              featSearch={featSearch}
              setFeatSearch={setFeatSearch}
              featFilter={featFilter}
              setFeatFilter={setFeatFilter}
              activeFeatSlot={activeFeatSlot}
              filteredFeats={filteredFeats}
              updateLevelConfig={updateLevelConfig}
              currentLevelIndex={currentLevelIndex}
            />
          )}

          {activeTab === 'acfs' && (
            <ACFsTabContent
              currentConfig={currentConfig}
              levelConfigs={levelConfigs}
              currentLevelIndex={currentLevelIndex}
              currentDraft={currentDraft}
              updateLevelConfig={updateLevelConfig}
            />
          )}
        </div>
      </div>
    </div>
  );
};
