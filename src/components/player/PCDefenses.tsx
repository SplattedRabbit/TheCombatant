/**
 * @module    PCDefenses
 * @summary   Wrapper-Komponente für das Verteidigungs-Tab mit einer Sub-Tabbar für "Rettung & Verteidigung" und "Buffs & Auren".
 * @exports   PCDefenses
 * @reads     pc.activeBuffs
 * @depends   React, PCDefensesTab, PCBuffsTab
 */

import React, { useState } from 'react';
import { PCDefensesTab } from './PCDefensesTab';
import { PCBuffsTab } from './PCBuffsTab';

interface PCDefensesProps {
  pc: any;
}

export const PCDefenses: React.FC<PCDefensesProps> = ({ pc }) => {
  const [subTab, setSubTab] = useState<'defenses' | 'buffs'>('defenses');
  const buffCount = Array.isArray(pc.activeBuffs) ? pc.activeBuffs.length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Sub-Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1.5px solid var(--pb)',
        marginBottom: '4px',
        fontFamily: "'IM Fell English SC', serif",
        fontSize: '11px',
        gap: '8px'
      }}>
        <button
          onClick={() => setSubTab('defenses')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: subTab === 'defenses' ? '2px solid var(--red)' : '2px solid transparent',
            color: subTab === 'defenses' ? 'var(--red)' : 'var(--inkm)',
            padding: '4px 8px 2px 8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.15s ease',
            outline: 'none'
          }}
        >
          🛡️ Rettung &amp; AC
        </button>
        <button
          onClick={() => setSubTab('buffs')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: subTab === 'buffs' ? '2px solid var(--red)' : '2px solid transparent',
            color: subTab === 'buffs' ? 'var(--red)' : 'var(--inkm)',
            padding: '4px 8px 2px 8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.15s ease',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ✨ Buffs &amp; Auren
          {buffCount > 0 && (
            <span style={{
              background: 'var(--red)',
              color: 'white',
              fontSize: '8px',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '12px',
              height: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              {buffCount}
            </span>
          )}
        </button>
      </div>

      {/* Sub-Tab Content */}
      <div style={{ padding: '2px 0' }}>
        {subTab === 'defenses' ? (
          <PCDefensesTab pc={pc} />
        ) : (
          <PCBuffsTab pc={pc} />
        )}
      </div>
    </div>
  );
};
