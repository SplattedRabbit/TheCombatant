/**
 * @module    FeatScrollActions
 * @summary   Modal action footer buttons (Learn, Unlearn, Close, Automatic class feature badge).
 */

import React from 'react';

interface FeatScrollActionsProps {
  isActuallyLearned: boolean;
  isStackable: boolean;
  isLearnBlocked: boolean;
  isAutomatic: boolean;
  autoFeatObj: any;
  onLearn: () => void;
  onUnlearn: () => void;
  onClose: () => void;
}

export const FeatScrollActions: React.FC<FeatScrollActionsProps> = ({
  isActuallyLearned,
  isStackable,
  isLearnBlocked,
  isAutomatic,
  autoFeatObj,
  onLearn,
  onUnlearn,
  onClose,
}) => {
  return (
    <div style={{ marginTop: '4px' }}>
      {!isActuallyLearned || isStackable ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
          <div style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 'bold', fontFamily: 'var(--font-title)', letterSpacing: '0.3px' }}>
            {isLearnBlocked ? '🔒 Prerequisites not met!' : 'Do you want to learn this feat?'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', width: '100%' }}>
            <button
              onClick={onLearn}
              disabled={isLearnBlocked}
              className="btn btn-p btn-learn-feat"
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '9px',
                padding: '4px 22px',
                cursor: isLearnBlocked ? 'not-allowed' : 'pointer',
                background: isLearnBlocked ? 'rgba(0,0,0,0.05)' : 'rgba(42, 106, 42, 0.1)',
                border: `1px solid ${isLearnBlocked ? 'rgba(0,0,0,0.2)' : '#2a6a2a'}`,
                borderRadius: '2px',
                color: isLearnBlocked ? '#888' : '#2a6a2a',
                fontWeight: 'bold',
                transition: 'background-color 0.15s, color 0.15s',
                outline: 'none'
              }}
            >
              Learn
            </button>
            <button
              onClick={onClose}
              className="btn btn-close-feat"
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '9px',
                padding: '4px 22px',
                cursor: 'pointer',
                background: 'transparent',
                border: '1px solid var(--pb)',
                borderRadius: '2px',
                color: 'var(--inkl)',
                transition: 'background-color 0.15s, color 0.15s',
                outline: 'none'
              }}
            >
              Close
            </button>
          </div>
        </div>
      ) : isAutomatic ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
          <div
            style={{
              background: 'rgba(200, 169, 110, 0.12)',
              border: '1px solid var(--pb)',
              borderLeft: '4px solid #7c5a2b',
              borderRadius: '3px',
              padding: '8px 12px',
              width: '100%',
              boxSizing: 'border-box',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(124, 90, 43, 0.25)', paddingBottom: '3px' }}>
              <span style={{ fontSize: '10.5px', color: '#7c5a2b', fontWeight: 'bold', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>🛡️</span> Automatic Class Feature
              </span>
              {autoFeatObj && (
                <span style={{ fontSize: '7.5px', color: '#7c5a2b', background: 'rgba(124, 90, 43, 0.12)', padding: '1px 5px', borderRadius: '2px', fontWeight: 'bold' }}>
                  {autoFeatObj.source || 'Class Feature'}
                </span>
              )}
            </div>
            <p style={{ fontSize: '9.5px', color: 'var(--ink)', margin: 0, fontFamily: 'var(--font-body)', lineHeight: 1.35 }}>
              This feat is granted automatically as an integral part of your character's class or racial progression. Because it is a permanent inherent trait, it cannot be unlearned.
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn btn-close-feat"
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '9.5px',
              padding: '4px 28px',
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid var(--pb)',
              borderRadius: '2px',
              color: 'var(--inkl)',
              transition: 'background-color 0.15s, color 0.15s',
              outline: 'none'
            }}
          >
            Close
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
          <div style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 'bold', fontFamily: 'var(--font-title)', letterSpacing: '0.3px' }}>
            Do you want to unlearn this feat?
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', width: '100%' }}>
            <button
              onClick={onUnlearn}
              className="btn btn-p btn-unlearn-feat"
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '9px',
                padding: '4px 22px',
                cursor: 'pointer',
                background: 'rgba(139, 26, 26, 0.1)',
                border: '1px solid var(--pb)',
                borderRadius: '2px',
                color: 'var(--red)',
                fontWeight: 'bold',
                transition: 'background-color 0.15s, color 0.15s',
                outline: 'none'
              }}
            >
              Unlearn
            </button>
            <button
              onClick={onClose}
              className="btn btn-close-feat"
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '9px',
                padding: '4px 22px',
                cursor: 'pointer',
                background: 'transparent',
                border: '1px solid var(--pb)',
                borderRadius: '2px',
                color: 'var(--inkl)',
                transition: 'background-color 0.15s, color 0.15s',
                outline: 'none'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
