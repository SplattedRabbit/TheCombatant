/**
 * @module    BardicMusicSection
 * @summary   Bard Inspire Courage stance toggle with morale bonus display.
 * @exports   BardicMusicSection
 */

import React from 'react';
import { CombatState } from '@core/state.js';

interface BardicMusicSectionProps {
  pc: any;
  bardLvl: number;
}

export const BardicMusicSection: React.FC<BardicMusicSectionProps> = ({ pc, bardLvl }) => {
  if (bardLvl <= 0) {
    return null;
  }

  let inspireCourageBonus = 1;
  if (bardLvl >= 20) inspireCourageBonus = 4;
  else if (bardLvl >= 14) inspireCourageBonus = 3;
  else if (bardLvl >= 8) inspireCourageBonus = 2;

  return (
    <div
      style={{
        background: pc.isBardInspireActive ? 'rgba(200, 169, 110, 0.15)' : 'rgba(200, 169, 110, 0.05)',
        border: `1px solid ${pc.isBardInspireActive ? 'var(--red)' : 'var(--pb)'}`,
        borderRadius: '3px',
        padding: '5px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            color: pc.isBardInspireActive ? 'var(--red)' : 'var(--ink)',
            margin: 0,
            fontWeight: 'bold',
            fontSize: '8.5px',
            fontFamily: 'var(--font-title)'
          }}
        >
          <input
            type="checkbox"
            checked={!!pc.isBardInspireActive}
            onChange={(e) => CombatState.updatePCField('isBardInspireActive', e.target.checked)}
            style={{ margin: 0, width: '12px', height: '12px', cursor: 'pointer' }}
          />
          🎵 Inspire Courage (+{inspireCourageBonus} Morale Atk &amp; Dmg)
        </label>

        <span
          style={{
            background: pc.isBardInspireActive ? 'var(--red)' : 'rgba(0,0,0,0.06)',
            color: pc.isBardInspireActive ? '#fff' : 'var(--inkm)',
            fontSize: '7.5px',
            fontWeight: 'bold',
            padding: '1px 5px',
            borderRadius: '2px',
            fontFamily: 'monospace'
          }}
        >
          +{inspireCourageBonus} Morale
        </span>
      </div>

      <div style={{ fontSize: '7px', color: 'var(--inkm)', fontFamily: 'var(--font-body)' }}>
        🎵 Grants morale bonus on saving throws against charm and fear, and attack and weapon damage rolls.
      </div>
    </div>
  );
};
