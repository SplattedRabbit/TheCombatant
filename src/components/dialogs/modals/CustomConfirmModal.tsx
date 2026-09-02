/**
 * @module    CustomConfirmModal
 * @summary   Parchment styled confirm dialog with XSS sanitization.
 */

import React from 'react';
import { DialogOverlay } from './DialogOverlay';
import { sanitizeHtml } from '../../../utils/sanitize';

export interface CustomConfirmModalProps {
  title: string;
  messageHtml: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CustomConfirmModal: React.FC<CustomConfirmModalProps> = ({
  title,
  messageHtml,
  onConfirm,
  onCancel,
}) => {
  return (
    <DialogOverlay onClose={onCancel} width={460} id="customConfirmOverlay">
      <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '0.3px' }}>
        {title}
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
      <div 
        className="info-dialog-body" 
        style={{ textAlign: 'left', marginBottom: '12px', fontSize: '10px', color: 'var(--ink)', fontFamily: 'var(--font-body)', lineHeight: 1.35 }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(messageHtml) }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button 
          onClick={onConfirm}
          className="btn btn-p confirm-dialog-yes" 
          style={{ fontFamily: 'var(--font-title)', fontSize: '9px', padding: '4px 18px', cursor: 'pointer', borderRadius: '2px' }}
        >
          Yes
        </button>
        <button 
          onClick={onCancel}
          className="btn confirm-dialog-no" 
          style={{ fontFamily: 'var(--font-title)', fontSize: '9px', padding: '4px 18px', cursor: 'pointer', borderRadius: '2px', background: 'transparent', border: '1px solid var(--pb)', color: 'var(--ink)' }}
        >
          No
        </button>
      </div>
    </DialogOverlay>
  );
};
