/**
 * @module    InitiativeWidget
 * @summary   Initiative calculation breakdown, misc modifier input, rolled value, and formula roll button in PCDefensesTab.
 */

import React from 'react';
import { showRollBreakdown } from '@core/ui/components/dialogs.js';
import { formatMod, calculateInitiativeTotal } from '../attributeHelper';

interface InitiativeWidgetProps {
  pc: any;
  dexMod: number;
  totIni: number;
  hasImprovedInit: boolean;
  localValues: Record<string, string>;
  onInputChange: (key: string, val: string) => void;
  onCommitNumber: (key: string, val: string, fallback?: number) => void;
  onCommitRawInit: (val: string) => void;
}

export const InitiativeWidget: React.FC<InitiativeWidgetProps> = ({
  pc,
  dexMod,
  totIni,
  hasImprovedInit,
  localValues,
  onInputChange,
  onCommitNumber,
  onCommitRawInit,
}) => {
  const handleIniRoll = (e: React.MouseEvent) => {
    const items = [
      { label: 'DEX Mod', value: dexMod },
      { label: 'Misc Mod', value: parseInt(pc.iniMisc) || 0 }
    ];
    if (hasImprovedInit) {
      items.push({ label: 'Feat: Improved Initiative', value: 4 });
    }
    showRollBreakdown('Initiative Breakdown', '1d20', items, e.nativeEvent);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr 0.7fr', gap: '3px', alignItems: 'center', background: 'rgba(200, 169, 110, 0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px 4px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', lineHeight: 1 }}>Initiative Mod</span>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--red)', textAlign: 'center', paddingTop: '1px' }}>{formatMod(totIni)}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>DEX Mod</label>
        <input
          type="text"
          value={formatMod(dexMod)}
          readOnly
          tabIndex={-1}
          className="cinput"
          style={{ width: '28px', fontSize: '9px', height: '15px', textAlign: 'center', padding: 0, background: 'rgba(0,0,0,0.05)', fontWeight: 'bold' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>Misc Mod</label>
        <input
          type="number"
          value={localValues['iniMisc'] !== undefined ? localValues['iniMisc'] : (pc.iniMisc ?? 0)}
          onChange={(e) => onInputChange('iniMisc', e.target.value)}
          onBlur={(e) => onCommitNumber('iniMisc', e.target.value, 0)}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          className="cinput pc-iniMisc-input"
          style={{ width: '28px', fontSize: '9px', height: '15px', textAlign: 'center', padding: 0 }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>Rolled</label>
        <input
          type="number"
          value={localValues['rawInit'] !== undefined ? localValues['rawInit'] : (pc.rawInit ? pc.rawInit : '')}
          onChange={(e) => onInputChange('rawInit', e.target.value)}
          onBlur={(e) => onCommitRawInit(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          className="cinput pc-init-input"
          style={{ width: '28px', fontSize: '9px', height: '15px', textAlign: 'center', padding: 0, fontWeight: 'bold', color: 'var(--red)' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>Total</label>
        <span className="pc-init-total" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', lineHeight: '15px', minWidth: '28px', textAlign: 'center', background: 'rgba(139,26,26,0.08)', border: '0.5px solid rgba(139,26,26,0.3)', borderRadius: '2px', padding: '0 2px' }}>
          {calculateInitiativeTotal(localValues['rawInit'] !== undefined ? localValues['rawInit'] : pc.rawInit, totIni).display}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>Formula</label>
        <button
          onClick={handleIniRoll}
          className="xbtn roll-ini-btn"
          style={{ padding: 0, width: '18px', height: '15px', fontSize: '9px', lineHeight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="View initiative modifier breakdown"
        >
          🎲
        </button>
      </div>
    </div>
  );
};
