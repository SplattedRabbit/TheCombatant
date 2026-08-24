/**
 * @module    CustomPromptModal
 * @summary   Parchment styled user text/number input prompt dialog.
 */

import React, { useState } from 'react';
import { DialogOverlay } from './DialogOverlay';

export interface CustomPromptModalProps {
  title: string;
  message: string;
  defaultValue: string;
  buttonText?: string;
  onConfirm: (val: string) => void;
  onCancel: () => void;
}

export const CustomPromptModal: React.FC<CustomPromptModalProps> = ({
  title,
  message,
  defaultValue,
  buttonText = "Submit",
  onConfirm,
  onCancel,
}) => {
  const [val, setVal] = useState(defaultValue);

  return (
    <DialogOverlay onClose={onCancel} width={360} id="customPromptOverlay">
      <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px' }}>
        {title}
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
      <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '11px', color: 'var(--inkm)', marginBottom: '8px', textAlign: 'left' }}>
        {message}
      </div>
      <input 
        type="text" 
        className="cinput pc-prompt-input" 
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onConfirm(val); if (e.key === 'Escape') onCancel(); }}
        autoFocus
        style={{
          width: '100%',
          boxSizing: 'border-box',
          fontSize: '11px',
          padding: '4px 6px',
          background: 'rgba(255,255,255,0.4)',
          border: '1px solid var(--pb)',
          borderRadius: '2px',
          color: 'var(--ink)',
          marginBottom: '12px',
          fontFamily: 'monospace'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button 
          onClick={() => onConfirm(val)}
          className="btn prompt-dialog-submit" 
          style={{
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '9px',
            padding: '4px 18px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
            border: '1px solid #7d5e1f',
            color: '#1a1005',
            fontWeight: 'bold'
          }}
        >
          {buttonText}
        </button>
        <button 
          onClick={onCancel}
          className="btn" 
          style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '4px 18px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--pb)', color: 'var(--ink)' }}
        >
          Cancel
        </button>
      </div>
    </DialogOverlay>
  );
};
