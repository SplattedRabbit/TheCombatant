/**
 * @module    LevelUpHeader
 * @summary   Modal header with title, level progress chip, close button, and step breadcrumbs.
 */

import React from 'react';

export interface StepLabel {
  num: number;
  id: string;
  label: string;
  icon: string;
}

export interface LevelUpHeaderProps {
  activePCName: string;
  totalCurrentLevel: number;
  targetLevel: number;
  step: number;
  stepLabels: StepLabel[];
  onStepClick: (stepNum: number) => void;
  onClose: () => void;
}

export const LevelUpHeader: React.FC<LevelUpHeaderProps> = ({
  activePCName,
  totalCurrentLevel,
  targetLevel,
  step,
  stepLabels,
  onStepClick,
  onClose,
}) => {
  return (
    <div
      style={{
        padding: '10px 18px',
        borderBottom: '1.5px solid var(--pb, #c8a96e)',
        background: 'linear-gradient(180deg, rgba(200, 169, 110, 0.28), rgba(200, 169, 110, 0.1))',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🧙‍♂️</span>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '16px', color: 'var(--red, #8b1a1a)' }}>
            Level-Up Assistant: <span style={{ color: 'var(--ink)' }}>{activePCName || 'Adventurer'}</span>
          </h2>
          <span
            style={{
              padding: '1px 6px',
              background: 'rgba(139,26,26,0.08)',
              borderRadius: '3px',
              border: '0.5px solid rgba(139,26,26,0.2)',
              fontSize: '10.5px',
              fontWeight: 'bold',
              color: 'var(--red)',
            }}
          >
            Level {totalCurrentLevel} ➔ Level {targetLevel}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn"
          style={{
            padding: '2px 8px',
            fontSize: '13px',
            cursor: 'pointer',
            color: 'var(--ink)',
            border: '1px solid var(--pb)',
            borderRadius: '4px',
            background: 'rgba(200, 169, 110, 0.2)',
          }}
        >
          ✕
        </button>
      </div>

      {/* Linear Step Breadcrumbs */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {stepLabels.map((s) => {
          const isActive = step === s.num;
          const isPast = step > s.num;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (isPast) onStepClick(s.num);
              }}
              style={{
                flex: 1,
                padding: '4px 6px',
                borderRadius: '4px',
                border: isActive ? '1px solid var(--red)' : isPast ? '1px solid var(--pb)' : '1px solid transparent',
                background: isActive
                  ? 'var(--red)'
                  : isPast
                  ? 'rgba(200, 169, 110, 0.25)'
                  : 'rgba(200, 169, 110, 0.08)',
                color: isActive ? '#ffffff' : isPast ? 'var(--ink)' : 'var(--inkl)',
                fontFamily: 'var(--font-title)',
                fontSize: '11px',
                fontWeight: isActive ? 'bold' : 'normal',
                cursor: isPast ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{s.icon}</span>
              <span>
                {s.num}. {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
