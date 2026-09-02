import React from 'react';
import { checkFeatPrerequisites, CombatFeats } from '@core/data/feats-data.js';
import { translatePrereq } from './constants';

interface FeatsTabContentProps {
  currentConfig: any;
  currentDraft: any;
  featSelectSlotIndex: number | null;
  featSearch: string;
  setFeatSearch: (val: string) => void;
  featFilter: string;
  setFeatFilter: (val: string) => void;
  activeFeatSlot: any;
  filteredFeats: any[];
  updateLevelConfig: (idx: number, key: string, val: any) => void;
  currentLevelIndex: number;
}

export const FeatsTabContent: React.FC<FeatsTabContentProps> = ({
  currentConfig,
  currentDraft,
  featSelectSlotIndex,
  featSearch,
  setFeatSearch,
  featFilter,
  setFeatFilter,
  activeFeatSlot,
  filteredFeats,
  updateLevelConfig,
  currentLevelIndex
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '420px' }}>
      {featSelectSlotIndex !== null && activeFeatSlot ? (
        <>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={`Search feat (${activeFeatSlot.label})...`}
              value={featSearch}
              onChange={(e) => setFeatSearch(e.target.value)}
              className="cinput"
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: '11px',
                height: '24px',
                boxSizing: 'border-box'
              }}
            />
            
            {/* Category Filter Dropdown */}
            <select
              value={featFilter}
              onChange={(e) => setFeatFilter(e.target.value)}
              className="cinput"
              style={{
                width: '120px',
                padding: '0 4px',
                fontSize: '11px',
                height: '24px',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">All</option>
              {activeFeatSlot && activeFeatSlot.allowedCategories.includes('combat') && (
                <option value="combat">Combat</option>
              )}
              {activeFeatSlot && activeFeatSlot.allowedCategories.includes('metamagic') && (
                <option value="metamagic">Metamagic</option>
              )}
              {activeFeatSlot && activeFeatSlot.allowedCategories.includes('item_creation') && (
                <option value="item_creation">Item Creation</option>
              )}
              {activeFeatSlot && activeFeatSlot.allowedCategories.includes('general') && (
                <option value="general">General</option>
              )}
            </select>
          </div>

          <div
            style={{
              flex: 1,
              maxHeight: '420px',
              overflowY: 'auto',
              border: '1px solid var(--pb)',
              borderRadius: '3px',
              background: 'white',
              padding: '4px'
            }}
          >
            {filteredFeats.length === 0 ? (
              <div style={{ padding: '20px', fontSize: '11px', fontStyle: 'italic', color: 'var(--inkl)', textAlign: 'center' }}>
                No matching feats found.
              </div>
            ) : (
              filteredFeats.map((item: any) => {
                const feat = item?.feat || item;
                if (!feat || !feat.id) return null;
                const depth = item?.depth || 0;
                const prereqs = currentDraft ? checkFeatPrerequisites(feat.id, currentDraft.draftPC) : { met: true, unmetDescs: [] };
                const isAlreadySelected = (currentConfig?.feats || []).includes(feat.id);
                const isAlreadyLearned = currentDraft ? currentDraft.featsList.includes(feat.id) : false;
                const isBlocked = !prereqs.met || isAlreadyLearned;
                
                let statusIcon = '⚪';
                let statusTitle = 'Selectable';
                if (isAlreadyLearned) {
                  statusIcon = '🟢';
                  statusTitle = 'Already learned';
                } else if (isAlreadySelected) {
                  statusIcon = '✨';
                  statusTitle = 'Selected at this level';
                } else if (isBlocked) {
                  statusIcon = '🔒';
                  statusTitle = 'Prerequisites not met';
                }

                const parentFeat = feat.parent ? CombatFeats.REGISTRY[feat.parent] : null;
                const depthPadding = featSearch ? 0 : depth * 12;

                return (
                  <div
                    key={feat.id}
                    onClick={() => {
                      if (!isBlocked && !isAlreadySelected) {
                        const nextFeats = [...(currentConfig.feats || [])];
                        nextFeats[featSelectSlotIndex] = feat.id;
                        updateLevelConfig(currentLevelIndex, 'feats', nextFeats);
                        setFeatSearch('');
                      }
                    }}
                    style={{
                      padding: '6px 8px',
                      borderBottom: '0.5px solid rgba(200, 169, 110, 0.2)',
                      cursor: isBlocked ? 'not-allowed' : 'pointer',
                      background: isAlreadySelected ? 'rgba(200, 169, 110, 0.15)' : 'transparent',
                      textAlign: 'left',
                      opacity: isBlocked ? 0.6 : 1,
                      paddingLeft: `${8 + depthPadding}px`,
                      transition: 'background 0.2s, opacity 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isAlreadySelected && !isBlocked) {
                        e.currentTarget.style.background = 'rgba(244, 232, 193, 0.25)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isAlreadySelected && !isBlocked) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                    title={statusTitle}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '10px' }} title={statusTitle}>{statusIcon}</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                        <strong style={{ fontSize: '11px', color: isBlocked ? 'var(--inkm)' : 'var(--red)' }}>{feat.nameEn || feat.nameDe}</strong>
                        <span style={{ fontSize: '8.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>{feat.nameDe}</span>
                      </div>
                    </div>
                    
                    {parentFeat && !featSearch && (
                      <div style={{ fontSize: '8.5px', color: 'var(--inkm)', fontStyle: 'italic', marginBottom: '3px', paddingLeft: '16px' }}>
                        ↳ Requires: <strong>{parentFeat.nameEn || parentFeat.nameDe}</strong>
                      </div>
                    )}

                    <div style={{ fontSize: '10px', color: 'var(--ink)', fontFamily: 'var(--font-body)', lineHeight: 1.3, marginBottom: '3px', paddingLeft: '16px' }}>
                      {feat.benefitRaw || feat.benefitDe}
                    </div>

                    {feat.prereqs && feat.prereqs.length > 0 && (
                      <div style={{ fontSize: '9px', borderTop: '0.5px dashed rgba(200,169,110,0.3)', paddingTop: '2px', marginTop: '2px', paddingLeft: '16px' }}>
                        <span style={{ color: prereqs.met ? 'green' : 'var(--red)', fontWeight: 'bold' }}>
                          Prerequisites:
                        </span>{' '}
                        {prereqs.unmetDescs.length > 0 ? (
                          <span style={{ color: 'var(--red)', fontStyle: 'italic' }}>
                            Not met: {prereqs.unmetDescs.map(translatePrereq).join(', ')}
                          </span>
                        ) : (
                          <span style={{ color: 'green', fontStyle: 'italic' }}>Met</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '40px', fontSize: '12px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center' }}>
          Select a talentslot on the left to see available feats.
        </div>
      )}
    </div>
  );
};
