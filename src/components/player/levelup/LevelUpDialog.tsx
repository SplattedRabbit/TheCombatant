/**
 * @module    LevelUpDialog
 * @summary   Modal dialog for guided single level-up of an existing character, reusing the Wizard level configuration sub-components.
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
} from '../wizard/helpers';
import { SkillsTabContent } from '../wizard/SkillsTabContent';
import { SkillTricksTabContent } from '../wizard/SkillTricksTabContent';
import { FeatsTabContent } from '../wizard/FeatsTabContent';
import { ACFsTabContent } from '../wizard/ACFsTabContent';
import { LevelHeaderAndStats } from '../wizard/levelConfig/LevelHeaderAndStats';
import { FeatSlotsSidebar } from '../wizard/levelConfig/FeatSlotsSidebar';
import { createLevelUpDraft } from '../../../services/levelup/levelUpAdapter';
import { applyLevelUpToActivePC } from './levelUpSaveHelper';

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

  const [levelConfigs, setLevelConfigs] = useState<any[]>(() => initialDraft.levelConfigs);
  const [activeTab, setActiveTab] = useState<'skills' | 'tricks' | 'feats' | 'acfs'>('skills');
  const [skillSearch, setSkillSearch] = useState('');
  const [featSelectSlotIndex, setFeatSelectSlotIndex] = useState<number | null>(null);
  const [featSearch, setFeatSearch] = useState('');
  const [featFilter, setFeatFilter] = useState('all');

  const newLevelIndex = initialDraft.newLevelIndex;
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
    const cls = CombatRules.CLASSES.find((c: any) => c.key === clsKey);
    return cls?.hitDie || 8;
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

  const handleCompleteLevelUp = () => {
    if (!currentConfig || !currentConfig.classType) {
      showCustomAlert('Incomplete Configuration', 'Please select a class for your new level.', 'OK', '⚠️');
      return;
    }

    // Check if ability score increase was required but missing
    const isAbilityMilestone = (initialDraft.newLevel % 4 === 0);
    if (isAbilityMilestone && !currentConfig.abilityIncrease) {
      showCustomAlert('Milestone Missing', `Level ${initialDraft.newLevel} grants +1 to an Ability Score. Please select an attribute to increase.`, 'OK', '⚠️');
      return;
    }

    applyLevelUpToActivePC(levelConfigs, newLevelIndex, completedDraft);
    onClose();
  };

  if (!currentConfig) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 10, 5, 0.75)',
        backdropFilter: 'blur(3px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="sheet no-print"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          background: 'var(--parchment, #fdf6e2)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '8px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '16px 20px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(200, 169, 110, 0.4)', paddingBottom: '10px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '18px', color: 'var(--red)', fontWeight: 'bold', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🧙‍♂️</span>
              <span>Level Up: {activePC.name || 'Adventurer'} (Level {initialDraft.totalCurrentLevel} ➔ Level {initialDraft.newLevel})</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--inkm)', fontFamily: 'var(--font-body)' }}>
              Configure your new level advancement, allocate skill points, choose feats and apply milestone bonuses.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ padding: '3px 9px', fontSize: '13px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Content Body: 2-Column Level Configuration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {/* Left Column: Class & Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <LevelHeaderAndStats
              levelConfigs={levelConfigs}
              currentConfig={currentConfig}
              currentLevelIndex={newLevelIndex}
              setCurrentLevelIndex={() => {}}
              updateLevelConfig={updateLevelConfig}
              getClassHitDie={getClassHitDie}
              currentDraft={currentDraft}
              prevDraft={prevDraft}
              completedDraft={completedDraft}
            />

            {currentFeatSlots.length > 0 && (
              <FeatSlotsSidebar
                currentFeatSlots={currentFeatSlots}
                currentConfig={currentConfig}
                featSelectSlotIndex={featSelectSlotIndex}
                setFeatSelectSlotIndex={setFeatSelectSlotIndex}
              />
            )}
          </div>

          {/* Right Column: Tabbed Content (Skills, Tricks, Feats, ACFs) */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--pb)', paddingBottom: '4px', marginBottom: '8px' }}>
              <button
                type="button"
                className={`btn ${activeTab === 'skills' ? 'btn-p' : ''}`}
                onClick={() => setActiveTab('skills')}
                style={{ padding: '3px 10px', fontSize: '11px', fontWeight: 'bold' }}
              >
                Skills ({currentLevelRemainingSkillPoints} SP left)
              </button>
              <button
                type="button"
                className={`btn ${activeTab === 'tricks' ? 'btn-p' : ''}`}
                onClick={() => setActiveTab('tricks')}
                style={{ padding: '3px 10px', fontSize: '11px' }}
              >
                Skill Tricks
              </button>
              {currentFeatSlots.length > 0 && (
                <button
                  type="button"
                  className={`btn ${activeTab === 'feats' ? 'btn-p' : ''}`}
                  onClick={() => setActiveTab('feats')}
                  style={{ padding: '3px 10px', fontSize: '11px' }}
                >
                  Feats ({currentFeatSlots.length} slot{currentFeatSlots.length > 1 ? 's' : ''})
                </button>
              )}
              <button
                type="button"
                className={`btn ${activeTab === 'acfs' ? 'btn-p' : ''}`}
                onClick={() => setActiveTab('acfs')}
                style={{ padding: '3px 10px', fontSize: '11px' }}
              >
                ACFs
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', minHeight: '260px' }}>
              {activeTab === 'skills' && (
                <SkillsTabContent
                  levelConfigs={levelConfigs}
                  currentConfig={currentConfig}
                  currentLevelIndex={newLevelIndex}
                  updateLevelConfig={updateLevelConfig}
                  currentDraft={currentDraft}
                  currentLevelRemainingSkillPoints={currentLevelRemainingSkillPoints}
                  currentLevelMaxSkillPoints={currentLevelMaxSkillPoints}
                  skillSearch={skillSearch}
                  setSkillSearch={setSkillSearch}
                />
              )}

              {activeTab === 'tricks' && (
                <SkillTricksTabContent
                  currentConfig={currentConfig}
                  levelConfigs={levelConfigs}
                  currentLevelIndex={newLevelIndex}
                  updateLevelConfig={updateLevelConfig}
                  currentDraft={currentDraft}
                  currentLevelRemainingSkillPoints={currentLevelRemainingSkillPoints}
                />
              )}

              {activeTab === 'feats' && (
                <FeatsTabContent
                  activeFeatSlot={activeFeatSlot}
                  filteredFeats={filteredFeats}
                  currentConfig={currentConfig}
                  currentDraft={currentDraft}
                  currentLevelIndex={newLevelIndex}
                  updateLevelConfig={updateLevelConfig}
                  featSelectSlotIndex={featSelectSlotIndex}
                  featSearch={featSearch}
                  setFeatSearch={setFeatSearch}
                  featFilter={featFilter}
                  setFeatFilter={setFeatFilter}
                />
              )}

              {activeTab === 'acfs' && (
                <ACFsTabContent
                  currentConfig={currentConfig}
                  levelConfigs={levelConfigs}
                  currentLevelIndex={newLevelIndex}
                  currentDraft={currentDraft}
                  updateLevelConfig={updateLevelConfig}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(200, 169, 110, 0.4)', paddingTop: '10px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ padding: '4px 16px', fontSize: '12px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCompleteLevelUp}
            className="btn btn-p animate-glow"
            style={{ padding: '5px 24px', fontSize: '12px', fontWeight: 'bold' }}
          >
            ✦ Complete Level Up
          </button>
        </div>
      </div>
    </div>
  );
};

export const LevelUpDialog: React.FC<LevelUpDialogProps> = ({ activePC, isOpen, onClose }) => {
  if (!isOpen || !activePC) return null;
  return <LevelUpDialogContent activePC={activePC} onClose={onClose} />;
};
