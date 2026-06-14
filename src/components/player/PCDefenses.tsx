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
    <div className="panel" id="pcDefenses">
      {/* Sub-Tab Navigation Bar */}
      <div className="panel-tab-bar">
        <button
          onClick={() => setSubTab('defenses')}
          className={`sub-tab-btn ${subTab === 'defenses' ? 'active' : ''}`}
        >
          🛡️ Rettung &amp; Verteidigung
        </button>
        <button
          onClick={() => setSubTab('buffs')}
          className={`sub-tab-btn ${subTab === 'buffs' ? 'active' : ''}`}
        >
          ✨ Buffs &amp; Auren ({buffCount})
        </button>
      </div>

      {/* Sub-Tab Content */}
      <div className="pbody" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {subTab === 'defenses' ? (
          <PCDefensesTab pc={pc} />
        ) : (
          <PCBuffsTab pc={pc} />
        )}
      </div>
    </div>
  );
};
