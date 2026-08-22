/**
 * @module    ClassCombatAbilitiesCard
 * @summary   Dynamic combat abilities hub for Smite Evil (with daily charge bubbles & auto-deduction), Sneak Attack pool, Favored Enemy, Barbarian Rage, and Monk Flurry.
 * @exports   ClassCombatAbilitiesCard
 * @reads     pc.classes, pc.dailyAbilities, pc.isSmiteActive, pc.isSneakAttacking, pc.isFavoredEnemyActive, pc.isRaging, pc.cha
 * @stateOps  CombatState.updatePCField, CombatState.togglePCRage
 * @depends   React, @core/state.js, src/components/shared/BaseCard
 */

import React from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import { BaseCard } from '../../shared/BaseCard';
// @ts-ignore
import { showCustomAlert } from '@core/ui/components/dialogs.js';

interface ClassCombatAbilitiesCardProps {
  pc: any;
}

export const ClassCombatAbilitiesCard: React.FC<ClassCombatAbilitiesCardProps> = ({ pc }) => {
  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const paladinClass = activeClasses.find((c: any) => c.classType === 'paladin');
  const paladinLvl = paladinClass ? paladinClass.level : 0;
  
  const barbarianClass = activeClasses.find((c: any) => c.classType === 'barbarian');
  const barbarianLvl = barbarianClass ? barbarianClass.level : 0;

  const rangerClass = activeClasses.find((c: any) => c.classType === 'ranger');
  const rangerLvl = rangerClass ? rangerClass.level : 0;

  // 1. Smite Evil resolution
  const smiteAbility = Array.isArray(pc.dailyAbilities) 
    ? pc.dailyAbilities.find((a: any) => a.name === "Böses niederstrecken" || a.name === "Smite Evil")
    : null;
  const smiteMax = smiteAbility ? smiteAbility.max : 0;
  const smiteUsed = smiteAbility ? smiteAbility.used : 0;
  const smiteRemaining = Math.max(0, smiteMax - smiteUsed);

  const getAblMod = (score: number) => Math.floor((score - 10) / 2);
  const chaValue = pc.cha ? (typeof pc.cha.getValue === 'function' ? pc.cha.getValue() : pc.cha) : 10;
  const chaMod = getAblMod(chaValue);
  const smiteAtkBonus = Math.max(0, chaMod);
  const smiteDmgBonus = paladinLvl;

  // 2. Sneak Attack pool
  const sneakAttackDice = typeof pc.getSneakAttackDiceCount === 'function' ? pc.getSneakAttackDiceCount() : 0;

  // 3. Favored Enemy
  const favoredEnemyBonus = typeof pc.getFavoredEnemyBonus === 'function' ? pc.getFavoredEnemyBonus() : 0;

  // 4. Barbarian Rage resolution
  const rageAbility = Array.isArray(pc.dailyAbilities)
    ? pc.dailyAbilities.find((a: any) => a.name === "Kampfrausch (Rage)")
    : null;
  const rageMax = rageAbility ? rageAbility.max : 0;
  const rageUsed = rageAbility ? rageAbility.used : 0;
  const rageRemaining = Math.max(0, rageMax - rageUsed);

  const hasAnyAbilities = (paladinLvl > 0 || !!smiteAbility) || sneakAttackDice > 0 || (rangerLvl > 0 || favoredEnemyBonus > 0) || (barbarianLvl > 0 || !!rageAbility);

  const handleSmiteToggle = (checked: boolean) => {
    if (checked && smiteRemaining <= 0) {
      showCustomAlert(
        "No Smite Evil Uses Left",
        "You have expended all daily uses of Smite Evil for today.",
        "Understood",
        "⚠️"
      );
      return;
    }
    CombatState.updatePCField('isSmiteActive', checked);
  };

  const handleSmiteBubbleClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const activePC = CombatState.getActivePC();
    const ability = activePC.dailyAbilities?.find((a: any) => a.name === "Böses niederstrecken" || a.name === "Smite Evil");
    if (ability) {
      if (idx <= ability.used) {
        ability.used = idx - 1;
      } else {
        ability.used = idx;
      }
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
    }
  };

  const handleRageToggle = () => {
    const result = CombatState.togglePCRage();
    if (result && !result.success && result.message) {
      showCustomAlert("Rage Limit", result.message, "Understood", "⚠️");
    }
  };

  const handleRageBubbleClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const activePC = CombatState.getActivePC();
    const ability = activePC.dailyAbilities?.find((a: any) => a.name === "Kampfrausch (Rage)");
    if (ability) {
      if (idx <= ability.used) {
        ability.used = idx - 1;
      } else {
        ability.used = idx;
      }
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
    }
  };

  if (!hasAnyAbilities) {
    return (
      <BaseCard title="🌟 Class Combat Abilities">
        <div style={{ padding: '8px', textAlign: 'center', color: 'var(--inkl)', fontStyle: 'italic', fontSize: '8px', fontFamily: "'Crimson Text', serif" }}>
          No specific class combat toggles available for current classes.
        </div>
      </BaseCard>
    );
  }

  return (
    <BaseCard title="🌟 Class Combat Abilities">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

        {/* Smite Evil */}
        {(paladinLvl > 0 || !!smiteAbility) && (
          <div
            style={{
              background: pc.isSmiteActive ? 'rgba(139, 26, 26, 0.1)' : 'rgba(200, 169, 110, 0.05)',
              border: `1px solid ${pc.isSmiteActive ? 'var(--red)' : 'var(--pb)'}`,
              borderRadius: '3px',
              padding: '5px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  color: 'var(--red)',
                  margin: 0,
                  fontWeight: 'bold',
                  fontSize: '8.5px',
                  fontFamily: "'IM Fell English SC', serif"
                }}
              >
                <input
                  type="checkbox"
                  checked={!!pc.isSmiteActive}
                  onChange={(e) => handleSmiteToggle(e.target.checked)}
                  style={{ margin: 0, width: '12px', height: '12px', cursor: 'pointer' }}
                />
                🌟 Smite Evil (+{smiteAtkBonus} Atk / +{smiteDmgBonus} Dmg)
              </label>

              {/* Charge Bubbles */}
              {smiteMax > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '7px', color: 'var(--inkm)', marginRight: '2px', fontFamily: "'Crimson Text', serif" }}>
                    Uses ({smiteRemaining}/{smiteMax}):
                  </span>
                  {Array.from({ length: smiteMax }).map((_, i) => {
                    const isFilled = i < smiteUsed;
                    return (
                      <span
                        key={i}
                        onClick={(e) => handleSmiteBubbleClick(i + 1, e)}
                        style={{
                          display: 'inline-block',
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          border: '1px solid var(--red)',
                          background: isFilled ? 'var(--red)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'transform 0.1s ease',
                          boxShadow: isFilled ? '0 0 4px rgba(139,26,26,0.5)' : 'none'
                        }}
                        title={isFilled ? `Use #${i + 1} expended (Click to toggle)` : `Use #${i + 1} ready (Click to toggle)`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ fontSize: '7px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", display: 'flex', justifyContent: 'space-between' }}>
              <span>⚔️ Automatically consumes 1 charge on melee attack roll.</span>
              <span style={{ fontStyle: 'italic' }}>Only affects Evil targets (RAW).</span>
            </div>
          </div>
        )}

        {/* Sneak Attack */}
        {sneakAttackDice > 0 && (
          <div
            style={{
              background: pc.isSneakAttacking ? 'rgba(39, 174, 96, 0.08)' : 'rgba(200, 169, 110, 0.05)',
              border: `1px solid ${pc.isSneakAttacking ? '#27ae60' : 'var(--pb)'}`,
              borderRadius: '3px',
              padding: '5px 8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                color: pc.isSneakAttacking ? '#1e824c' : 'var(--ink)',
                margin: 0,
                fontWeight: 'bold',
                fontSize: '8.5px',
                fontFamily: "'IM Fell English SC', serif"
              }}
            >
              <input
                type="checkbox"
                checked={!!pc.isSneakAttacking}
                onChange={(e) => CombatState.updatePCField('isSneakAttacking', e.target.checked)}
                style={{ margin: 0, width: '12px', height: '12px', cursor: 'pointer' }}
              />
              🗡️ Sneak Attack (+{sneakAttackDice}d6 Damage)
            </label>

            <span
              style={{
                background: pc.isSneakAttacking ? '#27ae60' : 'rgba(0,0,0,0.06)',
                color: pc.isSneakAttacking ? '#fff' : 'var(--inkm)',
                fontSize: '7.5px',
                fontWeight: 'bold',
                padding: '1px 5px',
                borderRadius: '2px',
                fontFamily: 'monospace'
              }}
            >
              +{sneakAttackDice}w6
            </span>
          </div>
        )}

        {/* Favored Enemy */}
        {(rangerLvl > 0 || favoredEnemyBonus > 0) && (
          <div
            style={{
              background: pc.isFavoredEnemyActive ? 'rgba(42, 106, 138, 0.08)' : 'rgba(200, 169, 110, 0.05)',
              border: `1px solid ${pc.isFavoredEnemyActive ? '#2a6a8a' : 'var(--pb)'}`,
              borderRadius: '3px',
              padding: '5px 8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                color: pc.isFavoredEnemyActive ? '#2a6a8a' : 'var(--ink)',
                margin: 0,
                fontWeight: 'bold',
                fontSize: '8.5px',
                fontFamily: "'IM Fell English SC', serif"
              }}
            >
              <input
                type="checkbox"
                checked={!!pc.isFavoredEnemyActive}
                onChange={(e) => CombatState.updatePCField('isFavoredEnemyActive', e.target.checked)}
                style={{ margin: 0, width: '12px', height: '12px', cursor: 'pointer' }}
              />
              🏹 Favored Enemy (+{favoredEnemyBonus} Damage)
            </label>

            <span
              style={{
                background: pc.isFavoredEnemyActive ? '#2a6a8a' : 'rgba(0,0,0,0.06)',
                color: pc.isFavoredEnemyActive ? '#fff' : 'var(--inkm)',
                fontSize: '7.5px',
                fontWeight: 'bold',
                padding: '1px 5px',
                borderRadius: '2px',
                fontFamily: 'monospace'
              }}
            >
              +{favoredEnemyBonus} DMG
            </span>
          </div>
        )}

        {/* Barbarian Rage */}
        {(barbarianLvl > 0 || !!rageAbility) && (
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
                <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8.5px', fontWeight: 'bold', color: 'var(--red)' }}>
                  🔥 Barbarian Rage
                </span>
                <button
                  className="btn"
                  onClick={handleRageToggle}
                  disabled={!pc.isRaging && rageRemaining <= 0}
                  style={{
                    background: pc.isRaging ? 'var(--red)' : 'rgba(139, 26, 26, 0.1)',
                    color: pc.isRaging ? '#fff' : 'var(--red)',
                    borderColor: 'var(--red)',
                    fontFamily: "'IM Fell English SC', serif",
                    fontSize: '7.5px',
                    padding: '1px 6px',
                    height: '16px',
                    lineHeight: 1,
                    cursor: (!pc.isRaging && rageRemaining <= 0) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {pc.isRaging ? '🔴 End Rage' : '🔥 Activate Rage!'}
                </button>
              </div>

              {/* Rage Bubbles */}
              {rageMax > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '7px', color: 'var(--inkm)', marginRight: '2px', fontFamily: "'Crimson Text', serif" }}>
                    Rages ({rageRemaining}/{rageMax}):
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
                        title={isFilled ? `Rage #${i + 1} expended` : `Rage #${i + 1} ready`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {pc.isRaging && (
              <div style={{ fontSize: '7px', color: 'var(--red)', fontWeight: 'bold', fontFamily: "'Crimson Text', serif" }}>
                🔥 Active: +4 STR (+2 Atk/Dmg), +4 CON (+2 HP/lvl, +2 Fort), +2 Will, -2 AC.
              </div>
            )}
          </div>
        )}

      </div>
    </BaseCard>
  );
};
