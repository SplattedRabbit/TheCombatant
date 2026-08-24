/**
 * @module    SkillsLegend
 * @summary   Legend banner displaying Class Skill, Cross-Class, and Trained Only color badges.
 */

import React from 'react';

export const SkillsLegend: React.FC = () => {
  return (
    <div
      className="skills-legend"
      style={{
        marginBottom: '4px',
        padding: '4px 6px',
        background: 'rgba(200, 169, 110, 0.05)',
        border: '0.5px solid var(--pb)',
        borderRadius: '2px',
        fontSize: '7.5px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontWeight: 'bold', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", fontSize: '8px' }}>
        Legend:
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2.5px' }}>
        <span style={{ fontSize: '6px', fontWeight: 'bold', color: '#1a5c1a', background: 'rgba(26,92,26,0.08)', padding: '0.5px 2px', borderRadius: '1px' }}>
          C
        </span>
        <span>Class Skill</span>
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2.5px' }}>
        <span style={{ fontSize: '6px', color: '#7c5c1d', background: 'rgba(200,169,110,0.08)', padding: '0.5px 2px', borderRadius: '1px' }}>
          CC
        </span>
        <span>Cross-Class</span>
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2.5px' }}>
        <span style={{ fontSize: '6px', color: 'var(--red)', background: 'rgba(139,26,26,0.08)', padding: '0.5px 2px', borderRadius: '1px', fontWeight: 'bold' }}>
          Trained
        </span>
        <span>Trained Only</span>
      </span>
    </div>
  );
};
