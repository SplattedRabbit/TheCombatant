/**
 * @module    CompanionMiniStatusWidget
 * @summary   Compact right-side status widget for Animal Companion, Familiar, or Mount.
 */

import React from 'react';
import { CompanionRules } from '@core/rules/CompanionRules.js';
import { FamiliarRules } from '@core/rules/FamiliarRules.js';
import { showRollBreakdown } from '@core/ui/components/dialogs.js';

interface CompanionMiniStatusWidgetProps {
  pc: any;
  type: 'companion' | 'familiar';
  onOpenFullSheet: () => void;
}

export const CompanionMiniStatusWidget: React.FC<CompanionMiniStatusWidgetProps> = ({
  pc,
  type,
  onOpenFullSheet,
}) => {
  const isFamiliar = type === 'familiar';

  let name = '';
  let species = '';
  let curHP = 0;
  let maxHP = 0;
  let ac = 10;
  let attacks: any[] = [];

  if (isFamiliar) {
    species = pc.familiarType || 'Raven';
    const baseStats = FamiliarRules.getFamiliarBaseStats(species, pc);
    name = pc.familiarName || baseStats?.name || species;
    maxHP = Math.floor((pc.maxHP || 10) / 2);
    curHP = pc.familiarHP !== undefined ? pc.familiarHP : maxHP;
    ac = baseStats?.ac || 14;
    attacks = baseStats?.attacks || [];
  } else {
    species = pc.companionType || 'none';
    const effDruidLvl = CompanionRules.calculateEffectiveDruidLevel(pc);
    const baseStats = CompanionRules.getCompanionBaseStats(species, effDruidLvl);
    name = pc.companionName || baseStats?.name || (species !== 'none' ? species : 'Animal Companion');
    maxHP = pc.companionMaxHP || baseStats?.maxHP || 15;
    curHP = pc.companionHP !== undefined ? pc.companionHP : maxHP;
    ac = baseStats?.ac || 14;
    attacks = baseStats?.attacks || [];
  }

  const hpPercent = maxHP > 0 ? Math.max(0, Math.min(100, (curHP / maxHP) * 100)) : 100;
  const hpColor = hpPercent > 50 ? '#2e7d32' : hpPercent > 25 ? '#b8860b' : '#8b1a1a';

  const handleRollAttack = (atk: any, e: React.MouseEvent) => {
    const atkBonus = atk.attackBonus || atk.bonus || 0;
    const breakdown = [
      { label: `${name} Base Attack`, value: atkBonus },
    ];
    showRollBreakdown(
      `${name}: ${atk.name || 'Natural Attack'}`,
      '1d20',
      breakdown,
      e.nativeEvent
    );
  };

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(244, 232, 193, 0.55) 0%, rgba(232, 213, 160, 0.65) 100%)',
        border: '1px solid var(--pb)',
        boxShadow: 'inset 0 0 12px rgba(200, 169, 110, 0.15), 0 1px 4px rgba(0, 0, 0, 0.08)',
        borderRadius: '4px',
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>{isFamiliar ? '🦇' : '🐾'}</span>
          <div>
            <strong style={{ fontFamily: 'var(--font-title)', fontSize: '11px', color: 'var(--red)', display: 'block', lineHeight: 1.1 }}>
              {name}
            </strong>
            <span style={{ fontSize: '8px', color: 'var(--inkl)', textTransform: 'capitalize' }}>
              {species} • {isFamiliar ? 'Familiar' : 'Companion'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenFullSheet}
          className="btn"
          style={{
            fontSize: '8px',
            padding: '2px 6px',
            fontFamily: 'var(--font-title)',
            fontWeight: 'bold',
            color: 'var(--red)',
            borderColor: 'var(--pb)',
            background: 'rgba(200, 169, 110, 0.18)',
          }}
          title="Open full companion sheet"
        >
          Full Sheet ↗
        </button>
      </div>

      {/* Vital Stats: HP & AC */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '8px', alignItems: 'center' }}>
        {/* HP Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', marginBottom: '2px' }}>
            <span style={{ color: 'var(--inkm)', fontWeight: 'bold' }}>HP:</span>
            <span style={{ color: hpColor, fontWeight: 'bold' }}>
              {curHP} / {maxHP}
            </span>
          </div>
          <div
            style={{
              height: '5px',
              background: 'rgba(0, 0, 0, 0.08)',
              borderRadius: '2px',
              overflow: 'hidden',
              border: '0.5px solid rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${hpPercent}%`,
                background: hpColor,
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        </div>

        {/* AC Badge */}
        <div
          style={{
            background: 'rgba(200, 169, 110, 0.1)',
            border: '0.5px solid var(--pb)',
            borderRadius: '3px',
            padding: '2px 4px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '6.5px', color: 'var(--inkl)', display: 'block', textTransform: 'uppercase' }}>AC</span>
          <strong style={{ fontSize: '11px', color: 'var(--ink)', fontFamily: 'var(--font-title)' }}>{ac}</strong>
        </div>
      </div>

      {/* Quick Attack Rolls */}
      {attacks.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', marginTop: '2px' }}>
          <span style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold' }}>Attacks:</span>
          {attacks.slice(0, 2).map((atk: any, idx: number) => {
            const atkBonus = atk.attackBonus || atk.bonus || 0;
            const dmgStr = atk.damage || atk.dmg || '1d6';
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleRollAttack(atk, e)}
                className="btn"
                style={{
                  fontSize: '8px',
                  padding: '1px 5px',
                  lineHeight: 1.2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
                title={`Roll attack: ${atk.name || 'Attack'}`}
              >
                <span>🎲</span>
                <span>{atk.name || 'Attack'}</span>
                <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>
                  {atkBonus >= 0 ? `+${atkBonus}` : atkBonus}
                </span>
                <span style={{ fontSize: '7px', color: 'var(--inkm)' }}>({dmgStr})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
