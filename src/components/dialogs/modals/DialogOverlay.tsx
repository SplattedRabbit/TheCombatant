/**
 * @module    DialogOverlay
 * @summary   Parchment styled common overlay wrapper for all modal dialogs.
 */

import React from 'react';
import { createPortal } from 'react-dom';

export interface DialogOverlayProps {
  children: React.ReactNode;
  onClose?: () => void;
  width?: number | string;
  maxWidth?: string | number;
  maxHeight?: string | number;
  padding?: string | number;
  textAlign?: 'center' | 'left' | 'right';
  id?: string;
  style?: React.CSSProperties;
}

export const DialogOverlay: React.FC<DialogOverlayProps> = ({
  children,
  onClose,
  width = 440,
  maxWidth = '92vw',
  maxHeight = '88vh',
  padding = '16px 20px',
  textAlign = 'center',
  id,
  style,
}) => {
  const content = (
    <div
      id={id}
      className="no-print"
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 200000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out forwards',
        boxSizing: 'border-box',
        padding: '12px',
      }}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p, #f5edd6)',
          backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.5) 0%, rgba(200, 169, 110, 0.12) 100%)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '5px',
          padding,
          width: typeof width === 'number' ? `${width}px` : width,
          maxWidth,
          maxHeight,
          boxShadow: '0 12px 36px rgba(0,0,0,0.45), inset 0 0 20px rgba(200,169,110,0.1)',
          fontFamily: 'var(--font-title)',
          textAlign,
          position: 'relative',
          boxSizing: 'border-box',
          overflowY: 'auto',
          ...style,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '3px',
            border: '0.5px dashed rgba(200, 169, 110, 0.35)',
            pointerEvents: 'none',
            borderRadius: '3px',
          }}
        />
        {children}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
