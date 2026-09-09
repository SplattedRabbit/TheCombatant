/**
 * @module    SpellLibraryItemRow
 * @summary   Compact row (~22px) representing a learned spell in the library.
 */

import React from 'react';
import { showSpellDetailsDialog } from '@core/ui/components/dialogs.js';

interface SpellLibraryItemRowProps {
  pc: any;
  s: any;
  idx: number;
  hasPrepared: boolean;
  hasSpontaneous: boolean;
  onPrepare: (id: string) => void;
  onCastSpontaneous: (id: string) => void;
  onRemove: (id: string) => void;
}

export const SpellLibraryItemRow: React.FC<SpellLibraryItemRowProps> = ({
  pc,
  s,
  idx,
  hasPrepared,
  hasSpontaneous,
  onPrepare,
  onCastSpontaneous,
  onRemove,
}) => {
  const sName = s.name || s.nameEn || s.id;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr minmax(70px, 90px) 54px 18px',
        alignItems: 'center',
        gap: '3px',
        padding: '2px 4px',
        background: idx % 2 === 0 ? 'rgba(200, 169, 110, 0.12)' : 'rgba(200, 169, 110, 0.04)',
        border: '0.5px solid rgba(200, 169, 110, 0.25)',
        borderRadius: '2px',
        fontSize: '8px',
      }}
    >
      {/* Col 1: Level */}
      <span
        style={{
          fontSize: '7px',
          background: 'rgba(0, 0, 0, 0.05)',
          border: '0.5px solid rgba(0, 0, 0, 0.1)',
          padding: '1px 2px',
          borderRadius: '2px',
          textAlign: 'center',
          fontWeight: 'bold',
          color: 'var(--inkm)',
        }}
      >
        L{s.level}
      </span>

      {/* Col 2: Name & School (Clickable for RAW rules) */}
      <div
        onClick={() => showSpellDetailsDialog(s, s.id, pc)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          cursor: 'pointer',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title="Click for full spell rules"
      >
        <strong
          style={{
            fontFamily: 'var(--font-title)',
            color: 'var(--red)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '8.5px',
          }}
        >
          {sName}
        </strong>
        <span style={{ fontSize: '7px', color: 'var(--inkl)', fontStyle: 'italic', flexShrink: 0 }}>
          ({s.school || 'Magic'})
        </span>
      </div>

      {/* Col 3: Range */}
      <div
        style={{
          fontSize: '7px',
          color: 'var(--inkm)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={s.range || 'Touch'}
      >
        {s.range || 'Touch'}
      </div>

      {/* Col 4: Prepare / Cast button */}
      <div>
        {hasPrepared ? (
          <button
            type="button"
            onClick={() => onPrepare(s.id)}
            className="btn"
            style={{
              fontSize: '7.5px',
              padding: '1px 5px',
              height: '17px',
              lineHeight: 1,
              fontWeight: 'bold',
              fontFamily: 'var(--font-title)',
              borderRadius: '2px',
              border: '0.5px solid var(--pb)',
              background: 'rgba(200, 169, 110, 0.25)',
              color: 'var(--ink)',
              cursor: 'pointer',
              width: '100%',
              whiteSpace: 'nowrap',
            }}
            title="Prepare into a spell slot"
          >
            + Prepare
          </button>
        ) : hasSpontaneous ? (
          <button
            type="button"
            onClick={() => onCastSpontaneous(s.id)}
            className="btn"
            style={{
              fontSize: '7.5px',
              padding: '1px 5px',
              height: '17px',
              lineHeight: 1,
              fontWeight: 'bold',
              fontFamily: 'var(--font-title)',
              borderRadius: '2px',
              background: 'linear-gradient(180deg, #992222 0%, #7a1515 100%)',
              borderColor: '#601010',
              color: '#ffffff',
              cursor: 'pointer',
              width: '100%',
              whiteSpace: 'nowrap',
            }}
          >
            ⚡ Cast
          </button>
        ) : null}
      </div>

      {/* Col 5: Delete from Spellbook */}
      <div style={{ textAlign: 'right' }}>
        <button
          type="button"
          onClick={() => onRemove(s.id)}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--inkl)',
            cursor: 'pointer',
            fontSize: '8px',
            padding: '0',
          }}
          title="Remove from spellbook"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
