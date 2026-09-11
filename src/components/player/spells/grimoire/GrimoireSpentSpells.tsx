/**
 * @module    GrimoireSpentSpells
 * @summary   Compact line-through badges for expended spells with undo restoration.
 */

import React from 'react';
import { findSpell } from '../PCSpellbookTab';
import { restorePreparedSpell } from './grimoireActions';

interface GrimoireSpentSpellsProps {
  pc: any;
  spentSpells: any[];
  lvl: number;
}

export const GrimoireSpentSpells: React.FC<GrimoireSpentSpellsProps> = ({
  pc,
  spentSpells,
  lvl,
}) => {
  if (spentSpells.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', padding: '1px 2px' }}>
      {spentSpells.map((item: any) => {
        const sp = findSpell(pc, item.spellKey);
        const sName = sp?.name || sp?.nameEn || item.spellKey;
        return (
          <span
            key={item.id}
            style={{
              fontSize: '7px',
              color: 'var(--inkl)',
              background: 'rgba(0, 0, 0, 0.04)',
              border: '0.5px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '2px',
              padding: '1px 3px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <span style={{ textDecoration: 'line-through' }}>{sName}</span>
            <button
              type="button"
              onClick={() => restorePreparedSpell(item.id, lvl)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--inkm)',
                fontSize: '7px',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
              title="Undo cast (Restore spell slot)"
            >
              ↺
            </button>
          </span>
        );
      })}
    </div>
  );
};
