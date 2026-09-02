/**
 * @module    DialogOverlay
 * @summary   Parchment styled common overlay wrapper for all modal dialogs.
 */

import React from 'react';

export interface DialogOverlayProps {
  children: React.ReactNode;
  onClose?: () => void;
  width?: number;
  id?: string;
}

export const DialogOverlay: React.FC<DialogOverlayProps> = ({
  children,
  onClose,
  width = 440,
  id,
}) => {
  return (
    <div
      id={id}
      className="no-print"
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.55)',
        backdropFilter: 'blur(2px)',
        zIndex: 200000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out forwards',
      }}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '16px 24px',
          width: `${width}px`,
          maxWidth: 'calc(92vw / var(--app-scale, 1))',
          transform: 'scale(var(--app-scale, 1))',
          transformOrigin: 'center center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08)',
          fontFamily: 'var(--font-title)',
          textAlign: 'center',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '3px',
            border: '0.5px dashed rgba(200, 169, 110, 0.3)',
            pointerEvents: 'none',
            borderRadius: '2px',
          }}
        />
        {children}
      </div>
    </div>
  );
};
