/**
 * @module    NewDayTemplateDialog
 * @summary   Parchment styled dialog for daily spell template preparation and resource reset.
 */

import React, { useState } from 'react';
import { DialogOverlay } from './DialogOverlay';

export interface NewDayTemplateDialogProps {
  templates: Record<string, any>;
  onConfirm: (choice: string) => void;
  onCancel: () => void;
}

export const NewDayTemplateDialog: React.FC<NewDayTemplateDialogProps> = ({
  templates,
  onConfirm,
  onCancel,
}) => {
  const [selected, setSelected] = useState('none');
  const templateKeys = Object.keys(templates || {});

  return (
    <DialogOverlay onClose={onCancel} width={450} id="newDayTemplateOverlay">
      <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px' }}>
        🌅 New Day & Spell Preparation
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
      
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--ink)', lineHeight: 1.4, marginBottom: '12px', textAlign: 'left' }}>
        Select which spell template should be prepared for the new day. Daily resources (Rage, Hit Dice, etc.) will be reset in any case.
      </div>

      <div style={{ background: 'rgba(0,0,0,0.02)', border: '0.5px solid var(--pb)', padding: '10px', borderRadius: '3px', marginBottom: '12px', textAlign: 'left' }}>
        <label style={{ display: 'block', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '4px' }}>Spell Setup for Today:</label>
        <select 
          value={selected} 
          onChange={(e) => setSelected(e.target.value)}
          className="cinput" 
          style={{ width: '100%', fontSize: '10px', height: '22px', padding: '2px 4px' }}
        >
          <option value="none">Do not prepare spells automatically (empty spellbook)</option>
          <option value="keep">Keep currently prepared spells (Default)</option>
          {templateKeys.map(key => (
            <option key={key} value={key}>Template: {key}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button 
          onClick={() => onConfirm(selected)}
          className="btn btn-p" 
          style={{ fontFamily: 'var(--font-title)', fontSize: '9px', padding: '5px 20px', cursor: 'pointer' }}
        >
          Start Day 🌅
        </button>
        <button 
          onClick={onCancel}
          className="btn" 
          style={{ fontFamily: 'var(--font-title)', fontSize: '9px', padding: '5px 20px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--pb)', color: 'var(--ink)' }}
        >
          Cancel
        </button>
      </div>
    </DialogOverlay>
  );
};
