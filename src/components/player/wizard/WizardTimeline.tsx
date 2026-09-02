/**
 * @module    WizardTimeline
 * @summary   Navigation breadcrumb timeline at the bottom of CharacterWizardDialog.
 */

import React from 'react';
import { RACES } from './constants';

interface WizardTimelineProps {
  step: number;
  stepsList: Array<{ num: number; label: string }>;
  name: string;
  selectedRace: string;
  targetLevel: number;
}

export const WizardTimeline: React.FC<WizardTimelineProps> = ({
  step,
  stepsList,
  name,
  selectedRace,
  targetLevel,
}) => {
  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '0.5px solid rgba(200, 169, 110, 0.3)',
        paddingTop: '12px',
        fontSize: '11px',
        color: 'var(--inkl)'
      }}
    >
      {stepsList.map((s, idx) => {
        const isActive = step === s.num;
        const isPast = step > s.num;
        return (
          <React.Fragment key={s.num}>
            {idx > 0 && <span style={{ color: 'var(--pb)', fontSize: '12px' }}>➔</span>}
            <span 
              style={{ 
                fontWeight: isActive ? 'bold' : 'normal',
                color: isActive ? 'var(--red)' : (isPast ? 'var(--ink)' : 'var(--inkl)'),
                textDecoration: isActive ? 'underline font-weight' : 'none'
              }}
            >
              {s.num}. {s.label}
              {s.num === 3 && step === 3 && selectedRace && (
                <span style={{ fontSize: '9px', display: 'block', fontStyle: 'italic', color: 'var(--inkm)' }}>
                  {name || 'Character'} ({RACES.find(r => r.key === selectedRace)?.name}) — Lvl 1 to {targetLevel}
                </span>
              )}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};
