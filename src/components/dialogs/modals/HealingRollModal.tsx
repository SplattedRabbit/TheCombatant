/**
 * @module    HealingRollModal
 * @summary   Parchment styled healing roll input modal with dice formula breakdown.
 */

import React, { useState } from 'react';
import { DialogOverlay } from './DialogOverlay';

export interface HealingRollModalProps {
  itemName: string;
  dice: string;
  bonus: number;
  formula: string;
  onConfirm: (val: string) => void;
  onCancel: () => void;
}

export const HealingRollModal: React.FC<HealingRollModalProps> = ({
  itemName,
  dice,
  bonus,
  formula,
  onConfirm,
  onCancel,
}) => {
  const [val, setVal] = useState('');

  return (
    <DialogOverlay onClose={onCancel} width={340} id="healingRollOverlay">
      <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '2px' }}>
        🍷 {itemName}
      </div>
      <div className="dialog-subtitle" style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', marginBottom: '6px' }}>
        Healing Roll & Recovery
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 10px' }} />

      <div style={{
        textAlign: 'left',
        background: 'rgba(200, 169, 110, 0.04)',
        border: '1px solid var(--pb)',
        borderRadius: '3px',
        padding: '10px',
        fontFamily: 'var(--font-body)',
        marginBottom: '10px'
      }}>
        <div style={{
          fontFamily: 'var(--font-title)',
          fontSize: '11px',
          fontWeight: 'bold',
          color: 'var(--red)',
          marginBottom: '5px',
          borderBottom: '0.5px solid rgba(200,169,110,0.3)',
          paddingBottom: '3px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Healing Modifiers</span>
          <span style={{ fontSize: '10px', color: '#27ae60' }}>+HP Recovery</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9.5px', color: 'var(--inkm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '9.5px', color: 'var(--inkm)' }}>Dice to Roll:</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 'bold', color: 'var(--ink)' }}>{dice}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '9.5px', color: 'var(--inkm)' }}>Flat Bonus:</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 'bold', color: '#27ae60' }}>+{bonus}</span>
          </div>
          <hr style={{ border: 'none', borderTop: '0.5px dashed rgba(200,169,110,0.3)', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
            <span>ROLL FORMULA:</span>
            <span style={{ fontSize: '12px', color: '#27ae60', letterSpacing: '0.5px' }}>{formula}</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'left', marginBottom: '4px' }}>
        <label style={{ fontFamily: 'var(--font-title)', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--ink)', display: 'block', marginBottom: '3px' }}>
          Enter your healing roll here:
        </label>
        <input 
          type="text" 
          className="cinput pc-prompt-input" 
          value={val}
          placeholder="e.g. 6 or 5+1"
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onConfirm(val); if (e.key === 'Escape') onCancel(); }}
          autoFocus
          style={{
            width: '100%',
            boxSizing: 'border-box',
            fontSize: '12px',
            padding: '5px 8px',
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid var(--pb)',
            borderRadius: '3px',
            color: 'var(--ink)',
            marginBottom: '12px',
            fontFamily: 'var(--font-body)',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button 
          onClick={() => onConfirm(val)}
          className="btn" 
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '9.5px',
            padding: '4px 18px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
            border: '1px solid #7d5e1f',
            color: '#1a1005',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}
        >
          🍷 Drink & Heal
        </button>
        <button 
          onClick={onCancel}
          className="btn" 
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '9.5px',
            padding: '4px 18px',
            cursor: 'pointer',
            background: 'transparent',
            border: '1px solid var(--pb)',
            color: 'var(--ink)'
          }}
        >
          Cancel
        </button>
      </div>
    </DialogOverlay>
  );
};
