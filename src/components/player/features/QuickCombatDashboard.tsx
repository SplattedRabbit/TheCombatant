/**
 * @module    QuickCombatDashboard
 * @summary   Interactive top dashboard in the Features tab for 1-click combat actions and daily resource tracking.
 */

import React from 'react';
import { CombatState } from '@core/state.js';

interface QuickCombatDashboardProps {
  pc: any;
  onUpdate?: () => void;
}

export const QuickCombatDashboard: React.FC<QuickCombatDashboardProps> = ({ pc, onUpdate }) => {
  const dailyAbilities = Array.isArray(pc.dailyAbilities) ? pc.dailyAbilities : [];

  // Helper to find daily ability by keyword
  const findAbility = (keyword: string) => {
    const idx = dailyAbilities.findIndex((a: any) => 
      a && a.name && a.name.toLowerCase().includes(keyword.toLowerCase())
    );
    return idx >= 0 ? { ability: dailyAbilities[idx], index: idx } : null;
  };

  const smiteData = findAbility('Smite Evil') || findAbility('Smite Corrupt');
  const lohData = findAbility('Lay on Hands');
  const turnData = findAbility('Turn Undead');
  const rageData = findAbility('Rage');
  const bardicData = findAbility('Bardic Music');
  const wildShapeData = findAbility('Wild Shape');

  const handleSmiteBubbleClick = (targetBubble: number) => {
    if (!smiteData) return;
    const { ability, index } = smiteData;
    const currentUsed = ability.used || 0;
    // If clicking on an already used bubble, restore up to this one; if clicking available, consume
    const nextUsed = targetBubble <= currentUsed ? targetBubble - 1 : targetBubble;
    const diff = nextUsed - currentUsed;
    CombatState.updatePCDailyAbilityUsed(index, diff);
    onUpdate?.();
  };

  const handleTurnBubbleClick = (targetBubble: number) => {
    if (!turnData) return;
    const { ability, index } = turnData;
    const currentUsed = ability.used || 0;
    const nextUsed = targetBubble <= currentUsed ? targetBubble - 1 : targetBubble;
    const diff = nextUsed - currentUsed;
    CombatState.updatePCDailyAbilityUsed(index, diff);
    onUpdate?.();
  };

  const handleAdjustLoh = (diff: number) => {
    if (!lohData) return;
    CombatState.updatePCDailyAbilityUsed(lohData.index, -diff);
    onUpdate?.();
  };

  const hasAnyDailyAction = smiteData || lohData || turnData || rageData || bardicData || wildShapeData;

  if (!hasAnyDailyAction) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(200, 169, 110, 0.12) 0%, rgba(200, 169, 110, 0.04) 100%)',
        border: '0.5px solid var(--pb)',
        borderRadius: '4px',
        padding: '6px 10px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        boxSizing: 'border-box',
      }}
    >
      {/* Title & Quick Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11px' }}>⏳</span>
        <strong style={{ fontFamily: 'var(--font-title)', fontSize: '10.5px', color: 'var(--red)', letterSpacing: '0.3px' }}>
          Daily Combat Resources
        </strong>
      </div>

      {/* Quick Interactive Items */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>

        {/* Smite Evil Pips */}
        {smiteData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>Smite:</span>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              {Array.from({ length: smiteData.ability.max || 1 }).map((_, i) => {
                const bubbleIdx = i + 1;
                const isUsed = bubbleIdx <= (smiteData.ability.used || 0);
                return (
                  <span
                    key={bubbleIdx}
                    onClick={() => handleSmiteBubbleClick(bubbleIdx)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '11px',
                      filter: isUsed ? 'grayscale(1) opacity(0.35)' : 'none',
                      transition: 'transform 0.1s',
                      userSelect: 'none',
                    }}
                    title={isUsed ? 'Used (Click to restore)' : 'Available (Click to use)'}
                  >
                    ⚡
                  </span>
                );
              })}
            </div>
            <span style={{ fontSize: '8.5px', color: 'var(--inkl)' }}>
              ({(smiteData.ability.max || 1) - (smiteData.ability.used || 0)}/{(smiteData.ability.max || 1)})
            </span>
          </div>
        )}

        {/* Lay on Hands Pool */}
        {lohData && lohData.ability.max > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>Lay on Hands:</span>
            <button
              type="button"
              onClick={() => handleAdjustLoh(-1)}
              className="btn"
              style={{ padding: '0 4px', height: '16px', fontSize: '9px', fontWeight: 'bold', lineHeight: 1 }}
              title="Spend 1 HP"
            >
              -
            </button>
            <span style={{ fontWeight: 'bold', color: (lohData.ability.max - (lohData.ability.used || 0)) > 0 ? '#1b5e20' : 'var(--red)', minWidth: '45px', textAlign: 'center' }}>
              {lohData.ability.max - (lohData.ability.used || 0)} / {lohData.ability.max} HP
            </span>
            <button
              type="button"
              onClick={() => handleAdjustLoh(1)}
              className="btn"
              style={{ padding: '0 4px', height: '16px', fontSize: '9px', fontWeight: 'bold', lineHeight: 1 }}
              title="Restore 1 HP"
            >
              +
            </button>
          </div>
        )}

        {/* Turn Undead Pips */}
        {turnData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>Turn Undead:</span>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              {Array.from({ length: turnData.ability.max || 1 }).map((_, i) => {
                const bubbleIdx = i + 1;
                const isUsed = bubbleIdx <= (turnData.ability.used || 0);
                return (
                  <span
                    key={bubbleIdx}
                    onClick={() => handleTurnBubbleClick(bubbleIdx)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '10px',
                      filter: isUsed ? 'grayscale(1) opacity(0.35)' : 'none',
                      userSelect: 'none',
                    }}
                    title={isUsed ? 'Used (Click to restore)' : 'Available (Click to use)'}
                  >
                    ☀️
                  </span>
                );
              })}
            </div>
            <span style={{ fontSize: '8.5px', color: 'var(--inkl)' }}>
              ({(turnData.ability.max || 1) - (turnData.ability.used || 0)}/{(turnData.ability.max || 1)})
            </span>
          </div>
        )}

        {/* Barbarian Rage */}
        {rageData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--red)' }}>Rage:</span>
            <span style={{ fontWeight: 'bold' }}>
              {(rageData.ability.max || 1) - (rageData.ability.used || 0)} / {rageData.ability.max}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
