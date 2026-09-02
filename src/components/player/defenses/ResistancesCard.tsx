/**
 * @module    ResistancesCard
 * @summary   Damage Reduction (DR), Reach, Immunities, and Energy Resistances in PCDefensesTab.
 */

import React from 'react';
import { CombatState } from '@core/state.js';

interface ResistancesCardProps {
  pc: any;
}

export const ResistancesCard: React.FC<ResistancesCardProps> = ({ pc }) => {
  return (
    <>
      <div style={{ fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--red)', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', letterSpacing: '0.5px', fontWeight: 'bold' }}>
        🛡️ Physical Resistances &amp; Reach
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '1px' }}>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }}>Damage Reduction (DR)</label>
          <input
            type="text"
            value={pc.dr || ''}
            onChange={(e) => CombatState.updatePCField('dr', e.target.value)}
            className="cinput pc-dr-input"
            placeholder="e.g. 5/silver"
            style={{ height: '16px', fontSize: '9px' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }}>Reach</label>
          <input
            type="text"
            value={pc.reach || ''}
            onChange={(e) => CombatState.updatePCField('reach', e.target.value)}
            className="cinput pc-reach-input"
            placeholder="e.g. 5 ft"
            style={{ height: '16px', fontSize: '9px' }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '2px' }}>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }}>Immunities</label>
          <input
            type="text"
            value={pc.immunities || ''}
            onChange={(e) => CombatState.updatePCField('immunities', e.target.value)}
            className="cinput pc-immunities-input"
            placeholder="poison, sleep..."
            style={{ height: '16px', fontSize: '9px' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }}>Energy Resistances</label>
          <input
            type="text"
            value={pc.resistances || ''}
            onChange={(e) => CombatState.updatePCField('resistances', e.target.value)}
            className="cinput pc-resistances-input"
            placeholder="fire 5..."
            style={{ height: '16px', fontSize: '9px' }}
          />
        </div>
      </div>
    </>
  );
};
