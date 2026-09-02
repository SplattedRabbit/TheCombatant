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

  // Tricks limit calculation
  const totalLearnedTricksCount = levelConfigs
    .slice(0, newLevelIndex + 1)
    .reduce((sum, cfg) => sum + (cfg.skillTricks?.length || 0), 0);
  const maxTricksLimit = currentDraft?.draftPC
    ? CombatRules.getMaxSkillTricksLimit(currentDraft.draftPC)
    : Math.floor((newLevelIndex + 1) / 2);

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
        background: 'rgba(15, 10, 5, 0.72)',
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
          maxWidth: '840px',
          maxHeight: '88vh',
          background: 'var(--parchment, #fdf6e2)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '8px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative inner border */}
        <div style={{ position: 'absolute', inset: '3px', border: '1px dashed rgba(200, 169, 110, 0.35)', pointerEvents: 'none', borderRadius: '5px', zIndex: 1 }} />

        {/* Modal Header */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1.5px solid var(--pb, #c8a96e)',
            background: 'linear-gradient(180deg, rgba(200, 169, 110, 0.28), rgba(200, 169, 110, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🧙‍♂️</span>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-title)',
                  fontSize: '18px',
                  color: 'var(--red, #8b1a1a)',
                  lineHeight: 1.2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Level-Up Assistant:</span>
                <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{activePC.name || 'Adventurer'}</span>
              </h2>
              <div style={{ fontSize: '11px', color: 'var(--inkm, #665c49)', fontFamily: 'var(--font-body)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ padding: '1px 6px', background: 'rgba(139,26,26,0.08)', borderRadius: '3px', border: '0.5px solid rgba(139,26,26,0.2)', fontWeight: 'bold', color: 'var(--red)' }}>
                  Level {initialDraft.totalCurrentLevel} ➔ Level {initialDraft.newLevel}
                </span>
                <span>• Configure class, hit points, skill distribution and talent choices.</span>
              </div>
            </div>
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
              background: 'rgba(255,255,255,0.6)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body: 2-Column Level Configuration */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 1.25fr',
            gap: '14px',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
            padding: '14px 18px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Left Column: Class & Stats in Parchment Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.55)',
              border: '1px solid rgba(200, 169, 110, 0.45)',
              borderRadius: '6px',
              padding: '10px 12px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
            }}
          >
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

            {currentFeatSlots.length > 0 && activeTab === 'feats' && (
              <FeatSlotsSidebar
                currentFeatSlots={currentFeatSlots}
                currentConfig={currentConfig}
                featSelectSlotIndex={featSelectSlotIndex}
                setFeatSelectSlotIndex={setFeatSelectSlotIndex}
              />
            )}
          </div>

          {/* Right Column: Tab Navigation & Tab Content in Parchment Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255, 255, 255, 0.55)',
              border: '1px solid rgba(200, 169, 110, 0.45)',
              borderRadius: '6px',
              padding: '10px 12px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
              minHeight: 0,
            }}
          >
            {/* Tabs Header */}
            <div
              style={{
                display: 'flex',
                gap: '4px',
                height: '28px',
                borderBottom: '1.5px solid var(--pb)',
                paddingBottom: '2px',
                marginBottom: '8px',
                boxSizing: 'border-box',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                style={{
                  flex: 1.2,
                  padding: '3px 6px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: activeTab === 'skills' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'skills' ? '2px solid var(--red)' : '2px solid transparent',
                  color: activeTab === 'skills' ? 'var(--red)' : 'var(--inkm)',
                  fontWeight: activeTab === 'skills' ? 'bold' : 'normal',
                  fontSize: '11px',
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
                  padding: '3px 6px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: activeTab === 'tricks' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'tricks' ? '2px solid var(--red)' : '2px solid transparent',
                  color: activeTab === 'tricks' ? 'var(--red)' : 'var(--inkm)',
                  fontWeight: activeTab === 'tricks' ? 'bold' : 'normal',
                  fontSize: '11px',
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
                  padding: '3px 6px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: activeTab === 'feats' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'feats' ? '2px solid var(--red)' : '2px solid transparent',
                  color: currentFeatSlots.length === 0 ? '#aaa' : (activeTab === 'feats' ? 'var(--red)' : 'var(--inkm)'),
                  fontWeight: activeTab === 'feats' ? 'bold' : 'normal',
                  fontSize: '11px',
                  cursor: currentFeatSlots.length === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-title)',
                  boxSizing: 'border-box',
                  whiteSpace: 'nowrap',
                }}
              >
                🎓 Feats ({currentFeatSlots.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('acfs')}
                style={{
                  flex: 0.8,
                  padding: '3px 6px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: activeTab === 'acfs' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'acfs' ? '2px solid var(--red)' : '2px solid transparent',
                  color: activeTab === 'acfs' ? 'var(--red)' : 'var(--inkm)',
                  fontWeight: activeTab === 'acfs' ? 'bold' : 'normal',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-title)',
                  boxSizing: 'border-box',
                  whiteSpace: 'nowrap',
                }}
              >
                ⚡ ACFs
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

        {/* Modal Footer */}
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
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{
              padding: '4px 14px',
              fontSize: '11.5px',
              fontFamily: 'var(--font-title)',
              color: 'var(--inkm)',
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid var(--pb)',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
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
              borderRadius: '3px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(139, 26, 26, 0.3)',
            }}
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
