/**
 * @module    RageStanceSection
 * @summary   Barbarian Rage and Berserker Strength stance section with daily usage tracking.
 * @exports   RageStanceSection
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';

interface RageStanceSectionProps {
  pc: any;
  barbarianLvl: number;
}

export const RageStanceSection: React.FC<RageStanceSectionProps> = ({ pc, barbarianLvl }) => {
  const activeACFs: string[] = Array.isArray(pc.acfs) ? pc.acfs : [];
  const hasBerserkerStrength = activeACFs.includes('barbarian_berserker_strength');

  const rageAbility = Array.isArray(pc.dailyAbilities)
    ? pc.dailyAbilities.find((a: any) => a.name === "Kampfrausch (Rage)" || a.name === "Rage" || a.name?.includes("Rage"))
    : null;

  if (barbarianLvl <= 0 && !rageAbility) {
    return null;
  }

  const rageMax = rageAbility ? rageAbility.max : (barbarianLvl > 0 ? 1 + Math.floor(barbarianLvl / 4) : 0);
  const rageUsed = rageAbility ? rageAbility.used : 0;
  const rageRemaining = Math.max(0, rageMax - rageUsed);

  const handleRageToggle = () => {
    const result = CombatState.togglePCRage();
    if (result && !result.success && result.message) {
      showCustomAlert("Rage Limit", result.message, "Understood", "⚠️");
    }
  };

  const handleRageBubbleClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    CombatState.updatePCBatch((activePC: any) => {
      const ability = activePC.dailyAbilities?.find(
        (a: any) => a.name === "Kampfrausch (Rage)" || a.name === "Rage" || a.name?.includes("Rage")
      );
      if (ability) {
        if (idx <= (ability.used || 0)) {
          ability.used = idx - 1;
        } else {
          ability.used = idx;
        }
      }
    });
  };

  return (
    <div
      style={{
        background: pc.isRaging ? 'rgba(139, 26, 26, 0.12)' : 'rgba(200, 169, 110, 0.05)',
        border: `1px solid ${pc.isRaging ? 'var(--red)' : 'var(--pb)'}`,
        borderRadius: '3px',
        padding: '5px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '8.5px', fontWeight: 'bold', color: 'var(--red)' }}>
            {hasBerserkerStrength ? '⚡ Berserker Strength' : '🔥 Barbarian Rage'}
          </span>
          {!hasBerserkerStrength && (
            <button
              className="btn"
              onClick={handleRageToggle}
              disabled={!pc.isRaging && rageRemaining <= 0}
              style={{
                background: pc.isRaging ? 'var(--red)' : 'rgba(139, 26, 26, 0.1)',
                color: pc.isRaging ? '#fff' : 'var(--red)',
                borderColor: 'var(--red)',
                fontFamily: 'var(--font-title)',
                fontSize: '7.5px',
                padding: '1px 6px',
                height: '16px',
                cursor: (!pc.isRaging && rageRemaining <= 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {pc.isRaging ? '🔴 END' : '🔥 RAGE'}
            </button>
          )}
        </div>

        {!hasBerserkerStrength && rageMax > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '7px', color: 'var(--inkm)', marginRight: '2px', fontFamily: 'var(--font-body)' }}>
              Uses ({rageRemaining}/{rageMax}):
            </span>
            {Array.from({ length: rageMax }).map((_, i) => {
              const isFilled = i < rageUsed;
              return (
                <span
                  key={i}
                  onClick={(e) => handleRageBubbleClick(i + 1, e)}
                  style={{
                    display: 'inline-block',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    border: '1px solid var(--red)',
                    background: isFilled ? 'var(--red)' : 'transparent',
                    cursor: 'pointer',
                    boxShadow: isFilled ? '0 0 4px rgba(139,26,26,0.5)' : 'none'
                  }}
                  title={isFilled ? `Use #${i + 1} expended` : `Use #${i + 1} ready`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
