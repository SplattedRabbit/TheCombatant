/**
 * @module    MonkStanceSection
 * @summary   Monk Flurry of Blows and Decisive Strike stance toggle with Stun DC display.
 * @exports   MonkStanceSection
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { getAblMod } from '../../attributeHelper';

interface MonkStanceSectionProps {
  pc: any;
  monkLvl: number;
}

export const MonkStanceSection: React.FC<MonkStanceSectionProps> = ({ pc, monkLvl }) => {
  if (monkLvl <= 0) {
    return null;
  }

  const activeACFs: string[] = Array.isArray(pc.acfs) ? pc.acfs : [];
  const hasDecisiveStrike = activeACFs.includes('monk_decisive_strike');

  const wisValue = pc.wis ? (typeof pc.wis.getValue === 'function' ? pc.wis.getValue() : pc.wis) : 10;
  const wisMod = getAblMod(wisValue);
  const stunDC = 10 + Math.floor(monkLvl / 2) + Math.max(0, wisMod);

  return (
    <div
      style={{
        background: pc.isFlurrying ? 'rgba(139, 26, 26, 0.1)' : 'rgba(200, 169, 110, 0.05)',
        border: `1px solid ${pc.isFlurrying ? 'var(--red)' : 'var(--pb)'}`,
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
            color: pc.isFlurrying ? 'var(--red)' : 'var(--ink)',
            margin: 0,
            fontWeight: 'bold',
            fontSize: '8.5px',
            fontFamily: 'var(--font-title)'
          }}
        >
          <input
            type="checkbox"
            checked={!!pc.isFlurrying}
            onChange={(e) => CombatState.updatePCField('isFlurrying', e.target.checked)}
            style={{ margin: 0, width: '12px', height: '12px', cursor: 'pointer' }}
          />
          🥋 {hasDecisiveStrike ? 'Decisive Strike' : 'Flurry of Blows'}
        </label>

        <span
          style={{
            background: pc.isFlurrying ? 'var(--red)' : 'rgba(0,0,0,0.06)',
            color: pc.isFlurrying ? '#fff' : 'var(--inkm)',
            fontSize: '7.5px',
            fontWeight: 'bold',
            padding: '1px 5px',
            borderRadius: '2px',
            fontFamily: 'monospace'
          }}
        >
          Stun DC {stunDC}
        </span>
      </div>
    </div>
  );
};
