/**
 * @module    FeatSlotsSidebar
 * @summary   Renders the feat slot selector tiles in the left column when the Feats tab is active.
 */

import React from 'react';
import { CombatFeats } from '@core/data/feats-data.js';

export interface FeatSlotsSidebarProps {
  currentFeatSlots: any[];
  currentConfig: any;
  featSelectSlotIndex: number | null;
  setFeatSelectSlotIndex: (idx: number | null) => void;
}

export const FeatSlotsSidebar: React.FC<FeatSlotsSidebarProps> = ({
  currentFeatSlots,
  currentConfig,
  featSelectSlotIndex,
  setFeatSelectSlotIndex,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>
        Talentslots:
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {currentFeatSlots.map((slot, slotIdx) => {
          const selectedFeatId = currentConfig.feats?.[slotIdx];
          const selectedFeat = CombatFeats.REGISTRY[selectedFeatId];
          const isPreFilled = !!slot.defaultFeat;
          const isActive = featSelectSlotIndex === slotIdx;

          return (
            <div
              key={slotIdx}
              onClick={() => {
                if (!isPreFilled) {
                  setFeatSelectSlotIndex(slotIdx);
                }
              }}
              style={{
                padding: '6px 8px',
                background: isActive ? 'rgba(139, 26, 26, 0.05)' : 'rgba(244, 232, 193, 0.25)',
                border: isActive ? '1.5px solid var(--red)' : selectedFeat ? '1.5px solid #2e7d32' : '1.5px solid var(--pb)',
                borderRadius: '3px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: isPreFilled ? 'default' : 'pointer',
                transition: 'background 0.2s, border-color 0.2s',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '8.5px', textTransform: 'uppercase', color: 'var(--inkl)', display: 'block' }}>
                  {slot.label} {isPreFilled && '(Fixed)'}
                </span>
                <strong style={{ fontSize: '11.5px', color: selectedFeat ? 'var(--ink)' : 'var(--red)' }}>
                  {selectedFeat ? selectedFeat.nameEn || selectedFeat.nameDe : '— Select —'}
                </strong>
              </div>
              {!isPreFilled && (
                <span style={{ fontSize: '9.5px', color: 'var(--red)', fontWeight: isActive ? 'bold' : 'normal' }}>
                  {isActive ? '👉 Active' : 'Select'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
