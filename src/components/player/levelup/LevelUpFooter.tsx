/**
 * @module    LevelUpFooter
 * @summary   Modal footer with Cancel/Back buttons and Next Step/Complete Level Up button.
 */

import React from 'react';

export interface LevelUpFooterProps {
  step: number;
  totalSteps: number;
  onClose: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onComplete: () => void;
}

export const LevelUpFooter: React.FC<LevelUpFooterProps> = ({
  step,
  totalSteps,
  onClose,
  onPrevStep,
  onNextStep,
  onComplete,
}) => {
  return (
    <div
      style={{
        padding: '10px 18px',
        borderTop: '1.5px solid var(--pb, #c8a96e)',
        background: 'linear-gradient(180deg, rgba(200, 169, 110, 0.08), rgba(200, 169, 110, 0.22))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2,
      }}
    >
      {step === 1 ? (
        <button
          type="button"
          onClick={onClose}
          className="btn"
          style={{ padding: '4px 14px', fontSize: '11.5px', fontFamily: 'var(--font-title)', color: 'var(--inkm)' }}
        >
          Cancel
        </button>
      ) : (
        <button
          type="button"
          onClick={onPrevStep}
          className="btn"
          style={{
            padding: '4px 14px',
            fontSize: '11.5px',
            fontFamily: 'var(--font-title)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>‹</span>
          <span>Back</span>
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {step < totalSteps ? (
          <button
            onClick={onNextStep}
            className="btn btn-p"
            style={{
              padding: '5px 20px',
              fontSize: '12px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Next Step</span>
            <span>›</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            className="btn btn-p animate-glow"
            style={{
              padding: '5px 22px',
              fontSize: '12px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #8b1a1a, #661010)',
              border: '1px solid #500b0b',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(139, 26, 26, 0.3)',
            }}
          >
            ✦ Complete Level Up
          </button>
        )}
      </div>
    </div>
  );
};
