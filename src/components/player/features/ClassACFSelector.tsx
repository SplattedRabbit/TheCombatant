/**
 * @module    ClassACFSelector
 * @summary   Interactive ACF selector component rendered inside class feature cards on the character sheet.
 * @exports   ClassACFSelector
 * @reads     pc.acfs
 * @stateOps  CombatState.togglePCACF
 * @depends   React, @core/data/acf-data.js, @core/state.js
 */

import React from 'react';
import { getACFsByClass } from '@core/data/acf-data.js';
import { CombatState } from '@core/state.js';

interface ClassACFSelectorProps {
  pc: any;
  classKey: string;
  level: number;
}

export const ClassACFSelector: React.FC<ClassACFSelectorProps> = ({ pc, classKey, level }) => {
  const availableACFs = getACFsByClass(classKey, level);
  if (!availableACFs || availableACFs.length === 0) return null;

  const activeACFs: string[] = Array.isArray(pc.acfs) ? pc.acfs : [];

  return (
    <div
      style={{
        marginTop: '6px',
        padding: '6px 8px',
        background: 'rgba(200, 169, 110, 0.06)',
        border: '0.5px solid rgba(200, 169, 110, 0.3)',
        borderRadius: '3px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>
          🎭 Alternative Class Features (ACFs)
        </span>
        <span style={{ fontSize: '7px', color: 'var(--inkl)' }}>
          {activeACFs.filter(id => availableACFs.some((a: any) => a.id === id)).length} active
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {availableACFs.map((acf: any) => {
          const isActive = activeACFs.includes(acf.id);
          return (
            <div
              key={acf.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 6px',
                background: isActive ? 'rgba(139, 26, 26, 0.08)' : 'rgba(255, 255, 255, 0.5)',
                border: isActive ? '0.5px solid var(--red)' : '0.5px solid var(--pb)',
                borderRadius: '2px',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 'bold', color: isActive ? 'var(--red)' : 'var(--ink)' }}>
                    {acf.name || acf.nameEn || acf.nameDe}
                  </span>
                  <span style={{ fontSize: '6.5px', padding: '0 2px', background: 'rgba(200, 169, 110, 0.2)', borderRadius: '1px', color: 'var(--inkm)', fontFamily: 'var(--font-title)' }}>
                    {acf.source?.toUpperCase() || ''} • Lvl {acf.minLevel}
                  </span>
                </div>
                <div style={{ fontSize: '7px', color: '#b7950b', fontStyle: 'italic', lineHeight: 1.1 }}>
                  ⚡ Replaces: <span style={{ color: 'var(--ink)' }}>{acf.replaces}</span>
                </div>
                <div style={{ fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.2, marginTop: '1px' }}>
                  {acf.description || acf.desc}
                </div>
              </div>

              <button
                type="button"
                onClick={() => CombatState.togglePCACF(acf.id)}
                className={`xbtn ${isActive ? 'xbtn-dmg' : ''}`}
                style={{
                  fontSize: '7.5px',
                  padding: '2px 8px',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-title)',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  whiteSpace: 'nowrap',
                  height: '18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  letterSpacing: '0.3px',
                  border: isActive ? '0.5px solid var(--red)' : '0.5px solid var(--pb)',
                  background: isActive ? 'var(--red)' : 'rgba(200, 169, 110, 0.08)',
                  color: isActive ? '#fff' : 'var(--ink)'
                }}
              >
                {isActive ? '✓ Active' : '+ Enable'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
