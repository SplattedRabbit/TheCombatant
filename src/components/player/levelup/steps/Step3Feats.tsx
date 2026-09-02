/**
 * @module    Step3Feats
 * @summary   Step 3 of the Level-Up Wizard: Feats selection (milestone & class bonus) and Alternative Class Features (ACFs).
 */

import React, { useState } from 'react';
import { FeatsTabContent } from '../../wizard/FeatsTabContent';
import { ACFsTabContent } from '../../wizard/ACFsTabContent';
import { FeatSlotsSidebar } from '../../wizard/levelConfig/FeatSlotsSidebar';

export interface Step3FeatsProps {
  levelConfigs: any[];
  currentConfig: any;
  currentLevelIndex: number;
  targetLevel: number;
  currentDraft: any;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
  currentFeatSlots: any[];
  activeFeatSlot: any;
  filteredFeats: any[];
  featSelectSlotIndex: number | null;
  setFeatSelectSlotIndex: (idx: number | null) => void;
  featSearch: string;
  setFeatSearch: (val: string) => void;
  featFilter: string;
  setFeatFilter: (val: string) => void;
}

export const Step3Feats: React.FC<Step3FeatsProps> = ({
  levelConfigs,
  currentConfig,
  currentLevelIndex,
  targetLevel,
  currentDraft,
  updateLevelConfig,
  currentFeatSlots,
  activeFeatSlot,
  filteredFeats,
  featSelectSlotIndex,
  setFeatSelectSlotIndex,
  featSearch,
  setFeatSearch,
  featFilter,
  setFeatFilter,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'feats' | 'acfs'>('feats');

  const hasFeats = currentFeatSlots.length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: 'rgba(200, 169, 110, 0.12)',
        border: '1px solid rgba(200, 169, 110, 0.5)',
        borderRadius: '6px',
        padding: '12px 14px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        minHeight: '360px',
      }}
    >
      {/* Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1.5px solid var(--pb)',
          paddingBottom: '4px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('feats')}
            style={{
              padding: '4px 12px',
              borderRadius: '3px 3px 0 0',
              border: 'none',
              borderBottom: activeSubTab === 'feats' ? '2px solid var(--red)' : '2px solid transparent',
              background: activeSubTab === 'feats' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
              color: activeSubTab === 'feats' ? 'var(--red)' : 'var(--inkm)',
              fontWeight: activeSubTab === 'feats' ? 'bold' : 'normal',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'var(--font-title)',
            }}
          >
            🎓 Feats ({currentFeatSlots.length} slot{currentFeatSlots.length !== 1 ? 's' : ''})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('acfs')}
            style={{
              padding: '4px 12px',
              borderRadius: '3px 3px 0 0',
              border: 'none',
              borderBottom: activeSubTab === 'acfs' ? '2px solid var(--red)' : '2px solid transparent',
              background: activeSubTab === 'acfs' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
              color: activeSubTab === 'acfs' ? 'var(--red)' : 'var(--inkm)',
              fontWeight: activeSubTab === 'acfs' ? 'bold' : 'normal',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'var(--font-title)',
            }}
          >
            ⚡ Alternative Class Features (ACFs)
          </button>
        </div>

        {hasFeats && (
          <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 'bold' }}>
            Choose feat for active slot
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px' }}>
        {activeSubTab === 'feats' ? (
          hasFeats ? (
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '14px', alignItems: 'start' }}>
              <FeatSlotsSidebar
                currentFeatSlots={currentFeatSlots}
                currentConfig={currentConfig}
                featSelectSlotIndex={featSelectSlotIndex}
                setFeatSelectSlotIndex={setFeatSelectSlotIndex}
              />
              <FeatsTabContent
                activeFeatSlot={activeFeatSlot}
                filteredFeats={filteredFeats}
                currentConfig={currentConfig}
                currentDraft={currentDraft}
                currentLevelIndex={currentLevelIndex}
                updateLevelConfig={updateLevelConfig}
                featSelectSlotIndex={featSelectSlotIndex}
                featSearch={featSearch}
                setFeatSearch={setFeatSearch}
                featFilter={featFilter}
                setFeatFilter={setFeatFilter}
              />
            </div>
          ) : (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--inkm)', fontFamily: 'var(--font-body)' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📜</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)', marginBottom: '4px' }}>
                No Feat Milestone on Level {targetLevel}
              </div>
              <div style={{ fontSize: '12px', maxWidth: '420px', margin: '0 auto', lineHeight: 1.4 }}>
                General feats are gained at Level 1, 3, 6, 9, 12, 15, 18. Your current level progression does not grant a new feat slot. You can check optional ACFs above or proceed to the next step.
              </div>
            </div>
          )
        ) : (
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
  );
};
