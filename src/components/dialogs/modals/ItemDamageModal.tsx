/**
 * @module    ItemDamageModal
 * @summary   Parchment styled damage & spell effect information modal.
 */

import React from 'react';
import { DialogOverlay } from './DialogOverlay';

export interface ItemDamageModalProps {
  itemName: string;
  dice: string;
  bonus: number;
  formula: string;
  damageType?: string;
  effectDesc?: string;
  saveText?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ItemDamageModal: React.FC<ItemDamageModalProps> = ({
  itemName,
  dice,
  bonus,
  formula,
  damageType,
  effectDesc,
  saveText,
  onConfirm,
  onCancel,
}) => {
  return (
    <DialogOverlay onClose={onCancel} width={340} id="itemDamageOverlay">
      <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '2px' }}>
        💥 {itemName}
      </div>
      <div className="dialog-subtitle" style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', marginBottom: '6px' }}>
        Damage & Spell Effect
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 10px' }} />

      <div style={{
        textAlign: 'left',
        background: 'rgba(200, 169, 110, 0.04)',
        border: '1px solid var(--pb)',
        borderRadius: '3px',
        padding: '10px',
        fontFamily: "'Crimson Text', serif",
        marginBottom: '10px'
      }}>
        <div style={{
          fontFamily: "'IM Fell English SC', serif",
          fontSize: '11px',
          fontWeight: 'bold',
          color: 'var(--red)',
          marginBottom: '5px',
          borderBottom: '0.5px solid rgba(200,169,110,0.3)',
          paddingBottom: '3px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Damage Calculation</span>
          <span style={{ fontSize: '10px', color: '#c0392b' }}>{damageType ? damageType.toUpperCase() : 'DAMAGE'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9.5px', color: 'var(--inkm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
            <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', color: 'var(--inkm)' }}>Base Dice:</span>
            <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', fontWeight: 'bold', color: 'var(--ink)' }}>{dice}</span>
          </div>
          {bonus > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
              <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', color: 'var(--inkm)' }}>Flat Bonus:</span>
              <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', fontWeight: 'bold', color: '#c0392b' }}>+{bonus}</span>
            </div>
          )}
          {saveText && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
              <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', color: 'var(--inkm)' }}>Saving Throw:</span>
              <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--ink)' }}>{saveText}</span>
            </div>
          )}
          <hr style={{ border: 'none', borderTop: '0.5px dashed rgba(200,169,110,0.3)', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
            <span>DAMAGE FORMULA:</span>
            <span style={{ fontSize: '12px', color: '#c0392b', letterSpacing: '0.5px' }}>{formula}</span>
          </div>
        </div>
      </div>

      {effectDesc && (
        <div style={{
          fontSize: '9.5px',
          fontFamily: "'Crimson Text', serif",
          color: 'var(--inkm)',
          fontStyle: 'italic',
          textAlign: 'center',
          marginBottom: '12px',
          padding: '0 4px'
        }}>
          "{effectDesc}"
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button 
          onClick={onConfirm}
          className="btn" 
          style={{
            fontFamily: "'IM Fell English SC', serif",
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
          💥 Cast / Use
        </button>
        <button 
          onClick={onCancel}
          className="btn" 
          style={{
            fontFamily: "'IM Fell English SC', serif",
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
