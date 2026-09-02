/**
 * @module    CustomAlertModal
 * @summary   Parchment styled alert & info modal dialog with XSS sanitization.
 */

import React from 'react';
import { DialogOverlay } from './DialogOverlay';
import { sanitizeHtml } from '../../../utils/sanitize';

export interface CustomAlertModalProps {
  title: string;
  message: string;
  buttonText?: string;
  icon?: string;
  onClose: () => void;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  title,
  message,
  buttonText = "Understood",
  icon = "⚠️",
  onClose,
}) => {
  return (
    <DialogOverlay onClose={onClose} id="customAlertOverlay" width={420}>
      <div style={{ fontSize: '13.5px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <span style={{ fontSize: '15px' }}>{icon}</span> {title}
      </div>
      <div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, transparent, var(--pb), transparent)', margin: '6px 0 10px' }} />
      <div 
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: 'var(--ink)',
          lineHeight: 1.45,
          marginBottom: '12px',
          fontWeight: 500,
          textAlign: 'left',
          overflowY: 'auto',
          maxHeight: '55vh',
          padding: '2px 4px',
          boxSizing: 'border-box'
        }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(message) }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <button 
          onClick={onClose}
          className="btn btn-p pc-alert-close-btn" 
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '9.5px',
            padding: '4px 20px',
            cursor: 'pointer',
            background: 'var(--p)',
            border: '1.5px solid var(--pb)',
            borderRadius: '3px',
            color: 'var(--red)',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            outline: 'none'
          }}
        >
          {buttonText}
        </button>
      </div>
    </DialogOverlay>
  );
};
