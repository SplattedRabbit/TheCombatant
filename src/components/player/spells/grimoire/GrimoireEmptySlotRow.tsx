/**
 * @module    GrimoireEmptySlotRow
 * @summary   Dashed inline row representing an empty/unfilled spell slot.
 */

import React from 'react';
import { getSchoolLabel } from '@core/spells.js';

interface GrimoireEmptySlotRowProps {
  lvl: number;
  isSpecialistSlot: boolean;
  wizardSpecialization: string;
  onClick: () => void;
}

export const GrimoireEmptySlotRow: React.FC<GrimoireEmptySlotRowProps> = ({
  lvl,
  isSpecialistSlot,
  wizardSpecialization,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2px 6px',
        background: 'rgba(0, 0, 0, 0.01)',
        border: '0.5px dashed rgba(200, 169, 110, 0.4)',
        borderRadius: '2px',
        fontSize: '7.5px',
        cursor: 'pointer',
        transition: 'all 0.1s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(200, 169, 110, 0.1)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.01)')}
      title="Click to prepare a spell into this slot"
    >
      <span
        style={{
          color: 'var(--inkl)',
          fontStyle: 'italic',
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
        }}
      >
        <span>⚪</span>
        <span>
          Empty Level {lvl} Slot {isSpecialistSlot ? `(⭐ Specialist: ${getSchoolLabel(wizardSpecialization)})` : ''}
        </span>
      </span>

      <span style={{ color: 'var(--red)', fontWeight: 'bold', fontSize: '7.5px' }}>
        + Prepare Spell
      </span>
    </div>
  );
};
