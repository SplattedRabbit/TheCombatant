import React, { useState } from 'react';
import { validatePrestigeClassPrereqs } from '@core/rules.js';
import { CLASSES_LIST, PRESTIGE_PREREQS } from '../constants';
import { SKILLS_REGISTRY } from '@core/data/skills-data.js';
import { CombatFeats } from '@core/data/feats-data.js';

interface PrestigePrereqTrackerCardProps {
  targetPrestigeClass: string;
  currentDraft: any;
  currentLevelIndex: number;
}

export const PrestigePrereqTrackerCard: React.FC<PrestigePrereqTrackerCardProps> = ({
  targetPrestigeClass,
  currentDraft,
  currentLevelIndex
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!targetPrestigeClass) return null;

  const classDef = CLASSES_LIST.find(c => c.key === targetPrestigeClass);
  if (!classDef) return null;

  const draftPC = currentDraft?.draftPC;
  if (!draftPC) return null;

  const validation = validatePrestigeClassPrereqs(draftPC, targetPrestigeClass);
  const prereqInfo = PRESTIGE_PREREQS[targetPrestigeClass];

  return (
    <div
      data-testid="prestige-prereq-tracker"
      style={{
        background: validation.success ? 'rgba(76, 175, 80, 0.08)' : 'rgba(200, 169, 110, 0.12)',
        border: validation.success ? '1.5px solid #4caf50' : '1px solid var(--pb)',
        borderRadius: '5px',
        padding: '10px 12px',
        fontSize: '11.5px',
        textAlign: 'left',
        boxSizing: 'border-box',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px' }}>🎯</span>
          <strong style={{ color: 'var(--red)', fontFamily: 'var(--font-title)', fontSize: '12.5px' }}>
            Ziel: {classDef.name}
          </strong>
          <span 
            style={{ 
              fontSize: '9.5px', 
              padding: '1px 5px', 
              borderRadius: '3px', 
              background: 'var(--pb)', 
              color: 'white',
              textTransform: 'uppercase',
              fontWeight: 'bold'
            }}
          >
            {classDef.source || 'PHB'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {validation.success ? (
            <span style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '11px' }}>
              ✓ Bereit (Stufe {currentLevelIndex + 1})
            </span>
          ) : (
            <span style={{ color: '#b78103', fontSize: '11px' }}>
              In Arbeit
            </span>
          )}
          <span style={{ fontSize: '10px', color: 'var(--inkl)' }}>
            {isCollapsed ? '▼' : '▲'}
          </span>
        </div>
      </div>

      {!isCollapsed && (
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Status banner */}
          {validation.success ? (
            <div 
              style={{ 
                padding: '4px 8px', 
                background: 'rgba(76, 175, 80, 0.15)', 
                color: '#2e7d32', 
                borderRadius: '3px',
                fontWeight: 'bold',
                fontSize: '11px'
              }}
            >
              🎉 Alle Voraussetzungen auf dieser Stufe erfüllt! Du kannst nun {classDef.name} wählen.
            </div>
          ) : (
            <div style={{ fontSize: '10.5px', color: 'var(--inkm)' }}>
              Voraussetzungen für den Einstieg in {classDef.name}:
            </div>
          )}

          {/* Details list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {validation.metDetails.map((detail: any, idx: number) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '3px 6px',
                  borderRadius: '3px',
                  background: detail.met ? 'rgba(76, 175, 80, 0.08)' : 'rgba(211, 47, 47, 0.06)',
                  borderLeft: `3px solid ${detail.met ? '#4caf50' : '#e53935'}`
                }}
              >
                <span style={{ color: 'var(--ink)' }}>{detail.label}</span>
                <span style={{ fontWeight: 'bold', color: detail.met ? '#2e7d32' : '#c62828', fontSize: '11px' }}>
                  {detail.met ? '✓ Erfüllt' : `${detail.current || 'Fehlt'}`}
                </span>
              </div>
            ))}
          </div>

          {/* Special requirement text if present */}
          {prereqInfo?.specialText && (
            <div style={{ fontSize: '10.5px', color: 'var(--inkl)', fontStyle: 'italic', marginTop: '2px' }}>
              ℹ️ Besonderes: {prereqInfo.specialText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
