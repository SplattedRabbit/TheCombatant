/**
 * @module    FamiliarEmptyState
 * @summary   Empty state / summoning hero card for FamiliarSheet when no familiar is active.
 */

import React from 'react';

const FAMILIAR_OPTIONS = [
  { key: 'bat', icon: '🦇', label: 'Bat (+3 Listen)' },
  { key: 'cat', icon: '🐈', label: 'Cat (+3 Move Silently)' },
  { key: 'hawk', icon: '🦅', label: 'Hawk (+3 Spot in light)' },
  { key: 'lizard', icon: '🦎', label: 'Lizard (+3 Climb)' },
  { key: 'owl', icon: '🦉', label: 'Owl (+3 Spot in shadows)' },
  { key: 'rat', icon: '🐀', label: 'Rat (+2 Fort Save)' },
  { key: 'raven', icon: '🐦', label: 'Raven (+3 Appraise / Speaks)' },
  { key: 'snake', icon: '🐍', label: 'Snake (+3 Bluff)' },
  { key: 'toad', icon: '🐸', label: 'Toad (+3 Max HP)' },
  { key: 'weasel', icon: '🦦', label: 'Weasel (+2 Ref Save)' },
];

export interface FamiliarEmptyStateProps {
  effectiveFamiliarLvl: number;
  onSelectSpecies: (species: string) => void;
}

export const FamiliarEmptyState: React.FC<FamiliarEmptyStateProps> = ({
  effectiveFamiliarLvl,
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
          🦇 Arcane Familiar Sheet (Effective Level: {effectiveFamiliarLvl})
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
        <div style={{ fontSize: '28px' }}>🦇</div>
        <div>
          <strong style={{ fontFamily: 'var(--font-title)', fontSize: '12px', color: 'var(--ink)' }}>
            No Active Familiar Summoned
          </strong>
          <p style={{ fontSize: '9.5px', color: 'var(--inkl)', margin: '4px 0 0 0', maxWidth: '420px' }}>
            Choose an arcane familiar to summon. The familiar grants a permanent special bonus to its master, shares your saving throws and spell effects, and scales in intelligence and natural armor.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '520px', marginTop: '4px' }}>
          {FAMILIAR_OPTIONS.map((fam) => (
            <button
              key={fam.key}
              type="button"
              onClick={() => onSelectSpecies(fam.key)}
              className="btn btn-p"
              style={{ fontSize: '9.5px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{fam.icon}</span>
              <span>{fam.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
