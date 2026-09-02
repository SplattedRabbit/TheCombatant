/**
 * @module    ActiveBuffsPills
 * @summary   Pill list display for active buffs, round countdown inputs, details modal opener, and remove triggers.
 */

import React from 'react';
import { CLASS_BUFFS } from '@core/data/class-buffs-data.js';
import { CombatSpells } from '@core/spells.js';
import { isBuffSuppressed } from '@core/rules/BuffRules.js';

interface ActiveBuffsPillsProps {
  pc: any;
  activeBuffs: any[];
  onRemoveBuff: (idx: number) => void;
  onRoundsChange: (idx: number, rounds: number) => void;
  onBuffDetailClick: (idx: number) => void;
}

export const ActiveBuffsPills: React.FC<ActiveBuffsPillsProps> = ({
  pc,
  activeBuffs,
  onRemoveBuff,
  onRoundsChange,
  onBuffDetailClick,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', letterSpacing: '0.5px', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
        Active Buffs &amp; Auras
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '120px', overflowY: 'auto', paddingRight: '2px', boxSizing: 'border-box' }}>
        {activeBuffs.length === 0 ? (
          <div style={{ width: '100%', fontStyle: 'italic', color: 'var(--inkl)', fontSize: '9px', textAlign: 'center', padding: '10px 0', background: 'rgba(0,0,0,0.02)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
            No active buffs or auras.
          </div>
        ) : (
          activeBuffs.map((buff: any, idx: number) => {
            let displayName = buff.name;
            let effectsList: any[] = [];

            if (buff.spellKey) {
              const classBuff = CLASS_BUFFS.find((b: any) => b.key === buff.spellKey);
              if (classBuff) {
                displayName = classBuff.name;
                effectsList = classBuff.effects || [];
              } else {
                const spell = CombatSpells.REGISTRY?.[buff.spellKey];
                if (spell) {
                  displayName = spell.nameEn || spell.nameDe || displayName || buff.spellKey;
                  effectsList = buff.effects || spell.effects || [];
                }
              }
            } else if (Array.isArray(buff.effects)) {
              effectsList = buff.effects;
            }

            const shortEffectsSummary = effectsList.map((eff: any) => {
              const sign = eff.value >= 0 ? '+' : '';
              const targetShort: Record<string, string> = {
                atk: 'ATK',
                dmg: 'DMG',
                ac: 'AC',
                acArmor: 'AC',
                acShield: 'AC',
                acNatural: 'AC',
                acDeflection: 'AC',
                acDodge: 'AC',
                str: 'STR',
                dex: 'DEX',
                con: 'CON',
                int: 'INT',
                wis: 'WIS',
                cha: 'CHA',
                za: 'Fort',
                ref: 'Ref',
                wil: 'Will',
                baseZa: 'Fort',
                baseRef: 'Ref',
                baseWil: 'Will'
              };
              const t = targetShort[eff.target] || eff.target;
              return `${sign}${eff.value} ${t}`;
            }).join(', ');

            const isSuppressed = isBuffSuppressed(pc, buff);
            const warningBadge = isSuppressed ? ' ⚠️' : '';

            return (
              <div
                key={buff.id || idx}
                className="active-buff-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '12px',
                  padding: '2px 6px',
                  gap: '4px',
                  boxSizing: 'border-box',
                  marginBottom: '2px',
                  background: isSuppressed ? 'rgba(200, 169, 110, 0.02)' : 'rgba(200, 169, 110, 0.05)',
                  border: isSuppressed ? '0.5px dashed rgba(139, 26, 26, 0.45)' : '0.5px solid var(--pb)',
                  opacity: isSuppressed ? 0.65 : 1,
                  filter: isSuppressed ? 'grayscale(30%)' : undefined
                }}
              >
                <span
                  onClick={() => onBuffDetailClick(idx)}
                  className="info-buff-trigger"
                  style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 'bold',
                    color: 'var(--red)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                  title="Show D&D 3.5e RAW rule explanation"
                >
                  ✨ {displayName}{warningBadge}
                  {shortEffectsSummary ? (
                    <span style={{ fontSize: '8px', color: 'var(--inkl)', opacity: 0.85, fontWeight: 'normal' }}>
                      {' '}({shortEffectsSummary})
                    </span>
                  ) : null}
                  <span style={{ fontSize: '8px', opacity: 0.75, marginLeft: '1px', color: 'var(--red)' }}>📖</span>
                </span>
                {buff.durationRemainingRounds !== undefined && buff.durationRemainingRounds !== null && (
                  <>
                    <input
                      type="number"
                      className="buff-rounds-input"
                      value={buff.durationRemainingRounds}
                      onChange={(e) => onRoundsChange(idx, parseInt(e.target.value) || 0)}
                      min="0"
                      style={{
                        width: '24px',
                        height: '13px',
                        fontSize: '8px',
                        textAlign: 'center',
                        border: '0.5px solid var(--pb)',
                        borderRadius: '2px',
                        background: 'rgba(0,0,0,0.03)',
                        color: 'var(--red)',
                        fontWeight: 'bold',
                        padding: 0,
                        margin: '0 2px 0 4px'
                      }}
                      title="Remaining rounds (0 to remove)"
                    />
                    <span style={{ fontSize: '8px', color: 'var(--inkl)', marginRight: '2px' }}>Rds</span>
                  </>
                )}
                <button
                  onClick={() => onRemoveBuff(idx)}
                  className="delete-buff-btn"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--inkl)',
                    fontSize: '9px',
                    cursor: 'pointer',
                    padding: '0 2px',
                    lineHeight: 1,
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                  title="Remove buff"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
