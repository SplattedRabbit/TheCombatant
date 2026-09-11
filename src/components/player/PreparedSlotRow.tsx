/**
 * @module    PreparedSlotRow
 * @summary   Renders a single prepared spell slot row (filled or empty) for regular, specialist, or domain slots.
 * @feature   player/spells
 * @exports   PreparedSlotRow
 */

import React from 'react';

const showSpellDetailsDialog = (...args: any[]) =>
  (window as any).__REACT_DIALOG_BRIDGE__?.showSpellDetailsDialog?.(...args);

interface PreparedSlotRowProps {
  prep?: any;
  slotType: 'regular' | 'specialist' | 'domain' | 'extra';
  pc: any;
  specSchoolName?: string;
  onCast: (id: string) => void;
  onUnprepare: (id: string) => void;
  onPrepareClick: () => void;
}

export const PreparedSlotRow: React.FC<PreparedSlotRowProps> = ({
  prep,
  slotType,
  pc,
  specSchoolName,
  onCast,
  onUnprepare,
  onPrepareClick
}) => {
  if (prep) {
    let bg = prep.isUsed ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.45)';
    let border = '0.5px solid rgba(200, 169, 110, 0.25)';
    let prefix = '📜 ';
    let badge = null;
    let castBtnStyle: React.CSSProperties = {
      fontSize: '8px',
      padding: '1px 3px',
      cursor: 'pointer',
      borderRadius: '2px',
      background: 'rgba(139,26,26,0.1)',
      borderColor: 'var(--red)',
      color: 'var(--red)',
      fontWeight: 'bold'
    };

    if (slotType === 'specialist') {
      bg = prep.isUsed ? 'rgba(0,0,0,0.04)' : 'rgba(200, 169, 110, 0.05)';
      border = '0.5px solid #c8a96e';
      prefix = '⭐ 📜 ';
      castBtnStyle = {
        fontSize: '8px',
        padding: '1px 3px',
        cursor: 'pointer',
        borderRadius: '2px',
        background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
        borderColor: 'var(--red)',
        color: 'white',
        fontWeight: 'bold'
      };
    } else if (slotType === 'domain') {
      bg = prep.isUsed ? 'rgba(0,0,0,0.04)' : 'rgba(139, 26, 26, 0.05)';
      border = '0.5px solid #8b1a1a';
      prefix = '☀️ 📜 ';
      badge = <span style={{ fontSize: '7.5px', color: '#8b1a1a', fontWeight: 'bold' }}>[D] </span>;
      castBtnStyle = {
        fontSize: '8px',
        padding: '1px 3px',
        cursor: 'pointer',
        borderRadius: '2px',
        background: 'linear-gradient(135deg, #8b1a1a, #5a0f0f)',
        borderColor: 'var(--red)',
        color: 'white',
        fontWeight: 'bold'
      };
    } else if (slotType === 'extra') {
      border = '0.5px solid var(--red)';
      prefix = '⚠️ 📜 ';
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: bg, border, borderRadius: '2px', padding: '2px 4px', fontSize: '9px', opacity: prep.isUsed ? 0.65 : 1 }}>
        <span
          onClick={() => showSpellDetailsDialog(prep.spell, prep.spellKey, pc)}
          style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--red)', fontFamily: 'var(--font-body)', fontSize: '9.5px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '4px' }}
        >
          {prefix}{prep.spell.name || prep.spell.nameEn || prep.spell.nameDe} {badge}{prep.metamagic?.length > 0 && <span style={{ fontSize: '8px', color: 'var(--red)', fontWeight: 'bold' }}>[M]</span>}
        </span>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
          {prep.isUsed ? (
            <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', padding: '1px 3px' }}>Expended</span>
          ) : (
            <button
              onClick={() => onCast(prep.id)}
              className="btn"
              style={castBtnStyle}
            >
              Cast
            </button>
          )}
          <button
            onClick={() => onUnprepare(prep.id)}
            className="btn"
            style={{ fontSize: '8px', padding: '1px 3px', borderColor: 'transparent', color: 'var(--inkl)', cursor: 'pointer' }}
            title="Clear slot"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Empty slot rendering
  if (slotType === 'specialist') {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(200, 169, 110, 0.03)', border: '0.5px dashed #c8a96e', borderRadius: '2px', padding: '2px 4px', fontSize: '9px', color: '#9a7a2e', fontStyle: 'italic' }}>
        <span>⭐ Specialist Slot ({specSchoolName})</span>
        <button
          onClick={onPrepareClick}
          className="btn"
          style={{ fontSize: '7px', padding: '0.5px 4px', border: '0.5px solid #c8a96e', background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)', color: 'white', cursor: 'pointer' }}
        >
          ➕ Prepare
        </button>
      </div>
    );
  }

  if (slotType === 'domain') {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(139, 26, 26, 0.03)', border: '0.5px dashed #8b1a1a', borderRadius: '2px', padding: '2px 4px', fontSize: '9px', color: '#8b1a1a', fontStyle: 'italic' }}>
        <span>☀️ Domain Slot (1 Slot)</span>
        <button
          onClick={onPrepareClick}
          className="btn"
          style={{ fontSize: '7px', padding: '0.5px 4px', border: '0.5px solid #8b1a1a', background: 'linear-gradient(135deg, #8b1a1a, #5a0f0f)', color: 'white', cursor: 'pointer' }}
        >
          ➕ Prepare
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)', border: '0.5px dashed var(--pb)', borderRadius: '2px', padding: '2px 4px', fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic' }}>
      <span>Empty Slot</span>
      <button
        onClick={onPrepareClick}
        className="btn"
        style={{ fontSize: '7px', padding: '0.5px 4px', borderColor: 'var(--pb)', background: 'transparent', color: 'var(--ink)', cursor: 'pointer' }}
      >
        ➕ Prepare
      </button>
    </div>
  );
};
