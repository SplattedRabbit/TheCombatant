/**
 * @module    ParchmentMessageModal
 * @summary   Parchment styled secret DM message popup.
 */

import React from 'react';
import { DialogOverlay } from './DialogOverlay';

export interface ParchmentMessageModalProps {
  text: string;
  sender?: string;
  onClose: () => void;
}

export const ParchmentMessageModal: React.FC<ParchmentMessageModalProps> = ({
  text,
  sender = 'Dungeon Master',
  onClose,
}) => {
  return (
    <DialogOverlay onClose={onClose} width={480} id="parchmentMessageOverlay">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <h2 style={{ 
          fontFamily: "'IM Fell English SC', serif", 
          color: 'var(--red)', 
          fontSize: '18px', 
          marginBottom: '8px', 
          letterSpacing: '1px',
          borderBottom: '1px solid var(--pb)',
          paddingBottom: '4px',
          width: '100%',
          textAlign: 'center'
        }}>
          ✉️ Message from: {sender}
        </h2>
        
        <div 
          className="parchment-box-inner" 
          style={{ 
            fontFamily: "'Crimson Text', serif", 
            fontSize: '14px', 
            color: 'var(--ink)', 
            lineHeight: 1.5, 
            margin: '15px 0 25px 0',
            textAlign: 'left',
            maxHeight: '300px',
            overflowY: 'auto',
            width: '100%',
            padding: '5px 10px',
            whiteSpace: 'pre-wrap',
            fontStyle: 'italic',
            borderLeft: '3px solid var(--red)',
            paddingLeft: '15px',
            background: 'rgba(200, 169, 110, 0.05)'
          }}
        >
          {text}
        </div>

        <button 
          onClick={onClose}
          className="parchment-close-btn"
          style={{ 
            fontFamily: "'IM Fell English SC', serif", 
            fontSize: '10px', 
            padding: '6px 24px', 
            cursor: 'pointer', 
            background: '#e5cf9c', 
            border: '1px solid #784818', 
            borderRadius: '3px', 
            color: '#482a0e', 
            fontWeight: 'bold', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
            outline: 'none'
          }}
        >
          Close
        </button>
      </div>
    </DialogOverlay>
  );
};
