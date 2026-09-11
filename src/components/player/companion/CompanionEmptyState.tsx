/**
 * @module    CompanionEmptyState
 * @summary   Empty state / summoning hero card for CompanionSheet when no companion is active.
 */

import React from 'react';

export interface CompanionEmptyStateProps {
  effectiveDruidLvl: number;
  onSelectSpecies: (species: string) => void;
}

export const CompanionEmptyState: React.FC<CompanionEmptyStateProps> = ({
  effectiveDruidLvl,
  onSelectSpecies,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--pb)',
          paddingBottom: '4px',
        }}
      >
        <span style={{ fontFamily: 'var(--font-title)', fontSize: '11px', color: 'var(--red)', fontWeight: 'bold' }}>
          🐾 Animal Companion &amp; Mount (Effective Level: {effectiveDruidLvl})
        </span>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic' }}>D&amp;D 3.5e RAW Rules</span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px 20px',
          background: 'rgba(200, 169, 110, 0.05)',
          border: '1px dashed var(--pb)',
          borderRadius: '4px',
          gap: '12px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '28px' }}>🐾</div>
        <div>
          <strong style={{ fontFamily: 'var(--font-title)', fontSize: '12px', color: 'var(--ink)' }}>
            No Active Animal Companion
          </strong>
          <p style={{ fontSize: '9.5px', color: 'var(--inkl)', margin: '4px 0 0 0', maxWidth: '420px' }}>
            Choose a loyal beast companion to summon. The companion automatically scales its Hit Dice, Natural Armor, Strength/Dexterity, and Bonus Tricks with your effective druid/ranger level.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '4px' }}>
          <button
            type="button"
            onClick={() => onSelectSpecies('wolf')}
            className="btn btn-p"
            style={{ fontSize: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🐺</span>
            <span>Wolf (Trip &amp; Track)</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectSpecies('leopard')}
            className="btn btn-p"
            style={{ fontSize: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🐆</span>
            <span>Leopard (Pounce &amp; Rake)</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectSpecies('bear')}
            className="btn btn-p"
            style={{ fontSize: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🐻</span>
            <span>Brown Bear (Huge Power)</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectSpecies('custom')}
            className="btn"
            style={{ fontSize: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🛡️</span>
            <span>Custom / Other</span>
          </button>
        </div>
      </div>
    </div>
  );
};
