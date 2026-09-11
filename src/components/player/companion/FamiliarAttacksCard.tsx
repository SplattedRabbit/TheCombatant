/**
 * @module    FamiliarAttacksCard
 * @summary   Attacks list and roll breakdown trigger for FamiliarSheet.
 */

import React from 'react';
import { showRollBreakdown } from '@core/ui/components/dialogs.js';
import { formatMod } from '../attributeHelper';

export interface FamiliarAttacksCardProps {
  attacks: any[];
  masterBab: number;
  familiarName: string;
}

export const FamiliarAttacksCard: React.FC<FamiliarAttacksCardProps> = ({
  attacks,
  masterBab,
  familiarName,
}) => {
  const handleAttackRoll = (
    e: React.MouseEvent<HTMLButtonElement>,
    attName: string,
    bonus: number,
    _damage: string,
    _note: string,
  ) => {
    e.stopPropagation();
    const famName = familiarName || 'Familiar';

    showRollBreakdown(
      `${famName} - ${attName}`,
      `1d20`,
      [{ label: 'Attack Bonus (Dexterity/Size/Master BAB)', value: bonus }],
      e.nativeEvent,
    );
  };

  return (
    <div
      style={{
        background: 'rgba(200, 169, 110, 0.06)',
        border: '1px solid var(--pb)',
        borderRadius: '4px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '0.5px solid var(--pb)',
          paddingBottom: '3px',
        }}
      >
        <span style={{ fontFamily: 'var(--font-title)', fontSize: '10.5px', color: 'var(--red)', fontWeight: 'bold' }}>
          ⚔️ Familiar Attacks (Uses Master BAB: +{masterBab})
        </span>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic' }}>Click to roll attack</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {attacks.length > 0 ? (
          attacks.map((att: any, idx: number) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(200, 169, 110, 0.08)',
                border: '0.5px solid var(--pb)',
                borderRadius: '3px',
                padding: '6px 8px',
              }}
            >
              <div>
                <strong style={{ fontSize: '10px', color: 'var(--ink)' }}>{att.name}:</strong>{' '}
                <span style={{ color: 'var(--red)', fontWeight: 'bold', fontSize: '10px' }}>{formatMod(att.bonus)}</span>{' '}
                <span style={{ fontSize: '9.5px', color: 'var(--inkm)' }}>({att.damage})</span>
                {att.note && (
                  <div style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', marginTop: '1px' }}>
                    • {att.note}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => handleAttackRoll(e, att.name, att.bonus, att.damage, att.note || '')}
                className="btn roll-familiar-attack-btn"
                style={{ fontSize: '9px', padding: '3px 8px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '3px' }}
              >
                Roll 🎲
              </button>
            </div>
          ))
        ) : (
          <div style={{ fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
            No natural attacks listed for this familiar.
          </div>
        )}
      </div>
    </div>
  );
};
