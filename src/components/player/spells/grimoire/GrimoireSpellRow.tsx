/**
 * @module    GrimoireSpellRow
 * @summary   Ultra-compact tabular spell row (~22px height) for ready/castable spells.
 */

import React from 'react';
import { findSpell } from '../PCSpellbookTab';
import { showSpellDetailsDialog } from '@core/ui/components/dialogs.js';
import { castPreparedSpell, castSpontaneousSpell, unprepareSpell } from './grimoireActions';

interface GrimoireSpellRowProps {
  pc: any;
  item: any;
  idx: number;
  lvl: number;
  casterMod: number;
  remainingSlots: number;
  hasPrepared: boolean;
  hasSpontaneous: boolean;
}

export const GrimoireSpellRow: React.FC<GrimoireSpellRowProps> = ({
  pc,
  item,
  idx,
  lvl,
  casterMod,
  remainingSlots,
  hasPrepared,
  hasSpontaneous,
}) => {
  const sp = findSpell(pc, item.spellKey || item.id);
  if (!sp) return null;

  const sName = sp.name || sp.nameEn || item.spellKey;
  const dc = 10 + (sp.level ?? lvl) + casterMod;
  const isSpec = item.isSpecialistSlot;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '22px 1fr minmax(70px, 95px) minmax(34px, 46px) 56px',
        alignItems: 'center',
        gap: '3px',
        padding: '2px 4px',
        background: isSpec
          ? 'rgba(139, 26, 26, 0.04)'
          : idx % 2 === 0
          ? 'rgba(200, 169, 110, 0.12)'
          : 'rgba(200, 169, 110, 0.04)',
        border: isSpec ? '0.5px solid rgba(139, 26, 26, 0.3)' : '0.5px solid rgba(200, 169, 110, 0.2)',
        borderLeft: isSpec ? '2.5px solid var(--red)' : undefined,
        borderRadius: '2px',
        fontSize: '8px',
      }}
    >
      {/* Col 1: Level pill */}
      <span
        style={{
          fontSize: '6.5px',
          background: 'rgba(0, 0, 0, 0.05)',
          border: '0.5px solid rgba(0, 0, 0, 0.1)',
          padding: '1px 2px',
          borderRadius: '2px',
          textAlign: 'center',
          fontWeight: 'bold',
          color: 'var(--inkm)',
        }}
      >
        L{lvl}
      </span>

      {/* Col 2: Name & School (clickable for RAW rules) */}
      <div
        onClick={() => showSpellDetailsDialog(sp, item.spellKey || sp.id, pc)}
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
        <span style={{ color: 'var(--red)', fontSize: '8.5px' }}>📜</span>
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
          ({sp.school || 'Magic'})
        </span>
      </div>

      {/* Col 3: Range & Save DC */}
      <div
        style={{
          fontSize: '7px',
          color: 'var(--inkm)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={`${sp.range || 'Touch'} • ${sp.savingThrow && sp.savingThrow !== 'None' ? `DC ${dc}` : 'No Save'}`}
      >
        {sp.range || 'Touch'} • {sp.savingThrow && sp.savingThrow !== 'None' ? `DC ${dc}` : 'No Save'}
      </div>

      {/* Col 4: Specialist / Meta indicator */}
      <div
        style={{
          fontSize: '7px',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {isSpec ? (
          <span style={{ color: 'var(--red)', fontWeight: 'bold' }} title="Specialist School Slot">
            ⭐ Spec
          </span>
        ) : item.metamagic && item.metamagic.length > 0 ? (
          <span style={{ color: '#2e7d32' }} title={`${item.metamagic.length} Metamagic Feats applied`}>
            +{item.metamagic.length}M
          </span>
        ) : (
          <span style={{ color: 'var(--inkl)' }}>Slot</span>
        )}
      </div>

      {/* Col 5: Actions: Cast & Unprepare */}
      <div style={{ display: 'flex', gap: '3px', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => {
            if (hasPrepared) {
              castPreparedSpell(pc, item.id);
            } else if (hasSpontaneous) {
              castSpontaneousSpell(pc, item.spellKey || sp.id);
            }
          }}
          disabled={remainingSlots === 0 && !hasPrepared}
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
          }}
        >
          ⚡ Cast
        </button>

        {hasPrepared && (
          <button
            type="button"
            onClick={() => unprepareSpell(item.id)}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--inkl)',
              cursor: 'pointer',
              fontSize: '8px',
              padding: '0 2px',
            }}
            title="Unprepare spell (free slot)"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
