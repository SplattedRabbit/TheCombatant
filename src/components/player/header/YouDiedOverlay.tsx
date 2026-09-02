/**
 * @module    YouDiedOverlay
 * @summary   Dark Souls style death overlay easter egg when PC reaches <= -10 HP.
 */

import React from 'react';
import { createPortal } from 'react-dom';

interface YouDiedOverlayProps {
  show: boolean;
  step: number; // 0: hidden, 1: fade-out/in, 2: visible
  onDismiss: () => void;
}

export const YouDiedOverlay: React.FC<YouDiedOverlayProps> = ({ show, step, onDismiss }) => {
  if (!show || typeof document === 'undefined') return null;

  return createPortal(
    <div
      id="you-died-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.85)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: step === 2 ? 1 : 0,
        transition: 'opacity 1.5s ease-in-out',
        pointerEvents: 'all',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          transform: step === 2 ? 'scale(1.05)' : 'scale(0.9)',
          transition: 'transform 3s ease-out',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '52px',
            color: '#8b1a1a',
            textShadow: '0 0 15px rgba(139, 26, 26, 0.6), 0 0 35px rgba(0,0,0,0.9)',
            letterSpacing: '10px',
            margin: '0 0 25px 0',
            fontWeight: 500,
            textTransform: 'uppercase',
            animation: 'fadeLetter 3s forwards',
          }}
        >
          YOU DIED
        </h1>
        <button
          id="you-died-btn"
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: '1px solid rgba(200, 169, 110, 0.4)',
            color: '#c8a96e',
            fontFamily: 'var(--font-title)',
            fontSize: '12px',
            letterSpacing: '2px',
            padding: '8px 24px',
            cursor: 'pointer',
            outline: 'none',
            borderRadius: '2px',
            transition: 'all 0.3s',
            animation: 'fadeInButton 2s 1.5s forwards',
          }}
        >
          I know...
        </button>
      </div>

      <style>
        {`
          @keyframes fadeLetter {
            from { letter-spacing: 3px; opacity: 0; }
            to { letter-spacing: 10px; opacity: 1; }
          }
          @keyframes fadeInButton {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          #you-died-btn:hover {
            background: rgba(200, 169, 110, 0.1);
            border-color: #c8a96e;
            box-shadow: 0 0 8px rgba(200, 169, 110, 0.3);
          }
        `}
      </style>
    </div>,
    document.body
  );
};
