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

  const monkClass = activeClasses.find((c: any) => c.classType === 'monk');
  const monkLvl = monkClass ? monkClass.level : 0;

  const bardClass = activeClasses.find((c: any) => c.classType === 'bard');
  const bardLvl = bardClass ? bardClass.level : 0;

  // 1. Smite Evil resolution
  const smiteAbility = Array.isArray(pc.dailyAbilities) 
    ? pc.dailyAbilities.find((a: any) => a.name === "Böses niederstrecken" || a.name === "Smite Evil" || a.name?.includes("Smite Evil"))
    : null;
  const smiteMax = smiteAbility ? smiteAbility.max : (paladinLvl > 0 ? Math.max(1, 1 + Math.floor((paladinLvl - 1) / 4)) : 0);
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
    ? pc.dailyAbilities.find((a: any) => a.name === "Kampfrausch (Rage)" || a.name === "Rage" || a.name?.includes("Rage"))
    : null;
  const rageMax = rageAbility ? rageAbility.max : (barbarianLvl > 0 ? 1 + Math.floor(barbarianLvl / 4) : 0);
  const rageUsed = rageAbility ? rageAbility.used : 0;
  const rageRemaining = Math.max(0, rageMax - rageUsed);

  // 5. Monk Flurry & Stunning Fist
  const wisValue = pc.wis ? (typeof pc.wis.getValue === 'function' ? pc.wis.getValue() : pc.wis) : 10;
  const wisMod = getAblMod(wisValue);
  const stunDC = 10 + Math.floor(monkLvl / 2) + Math.max(0, wisMod);
  const flurryExtraAttacks = monkLvl >= 11 ? 2 : 1;
  const flurryPenalty = monkLvl >= 9 ? 0 : (monkLvl >= 5 ? -1 : -2);

  // 6. Bard Inspire Courage
  let inspireCourageBonus = 1;
  if (bardLvl >= 20) inspireCourageBonus = 4;
  else if (bardLvl >= 14) inspireCourageBonus = 3;
  else if (bardLvl >= 8) inspireCourageBonus = 2;

  // 7. Prestige Classes
  const assassinClass = activeClasses.find((c: any) => c.classType === 'assassin');
  const assassinLvl = assassinClass ? assassinClass.level : 0;
  const intValue = pc.int ? (typeof pc.int.getValue === 'function' ? pc.int.getValue() : pc.int) : 10;
  const intMod = getAblMod(intValue);
  const deathAttackDC = 10 + assassinLvl + Math.max(0, intMod);

  const battleTricksterClass = activeClasses.find((c: any) => c.classType === 'battle_trickster');
  const battleTricksterLvl = battleTricksterClass ? battleTricksterClass.level : 0;
  const hasTrickyFighting = battleTricksterLvl >= 3;

  const dragonDiscipleClass = activeClasses.find((c: any) => c.classType === 'dragon_disciple');
  const dragonDiscipleLvl = dragonDiscipleClass ? dragonDiscipleClass.level : 0;
  const breathWeaponDice = dragonDiscipleLvl >= 10 ? '6d8' : (dragonDiscipleLvl >= 7 ? '4d8' : (dragonDiscipleLvl >= 3 ? '2d8' : ''));

  const activeACFs: string[] = Array.isArray(pc.acfs) ? pc.acfs : [];
  const hasChargingSmite = activeACFs.includes('paladin_charging_smite');
  const hasDisruptiveAttack = activeACFs.includes('rogue_disruptive_attack');
  const hasBerserkerStrength = activeACFs.includes('barbarian_berserker_strength');
  const hasDistractingAttack = activeACFs.includes('ranger_distracting_attack');
  const hasDecisiveStrike = activeACFs.includes('monk_decisive_strike');

  const hasAnyAbilities = (paladinLvl > 0 || !!smiteAbility) || 
    sneakAttackDice > 0 || 
    (rangerLvl > 0 || favoredEnemyBonus > 0) || 
    (barbarianLvl > 0 || !!rageAbility) || 
    (monkLvl > 0) || 
    (bardLvl > 0) ||
    (assassinLvl > 0) ||
    hasTrickyFighting ||
    (dragonDiscipleLvl >= 3);

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
            {hasChargingSmite && (
              <div style={{ fontSize: '7px', color: '#b7950b', fontStyle: 'italic', borderTop: '0.5px dashed rgba(200,169,110,0.3)', paddingTop: '2px' }}>
                ⚡ ACF: Charging Smite (+{smiteDmgBonus * 2} Dmg on charge, miss refunds charge attempt).
              </div>
            )}
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
              flexDirection: 'column',
              gap: '3px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            {hasDisruptiveAttack && (
              <div style={{ fontSize: '7px', color: '#b7950b', fontStyle: 'italic', borderTop: '0.5px dashed rgba(200,169,110,0.3)', paddingTop: '2px' }}>
                ⚡ ACF: Disruptive Attack (Optionally sacrifice sneak attack damage to inflict -5 AC penalty on target for 1 round).
              </div>
            )}
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
              flexDirection: 'column',
              gap: '3px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            {hasDistractingAttack && (
              <div style={{ fontSize: '7px', color: '#b7950b', fontStyle: 'italic', borderTop: '0.5px dashed rgba(200,169,110,0.3)', paddingTop: '2px' }}>
                ⚡ ACF: Distracting Attack (Hit targets are considered flanked by you and allies).
              </div>
            )}
          </div>
        )}

        {/* Barbarian Rage / Berserker Strength ACF */}
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
                      fontFamily: "'IM Fell English SC', serif",
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

              {/* Charge Bubbles */}
              {!hasBerserkerStrength && rageMax > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '7px', color: 'var(--inkm)', marginRight: '2px', fontFamily: "'Crimson Text', serif" }}>
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

            <div style={{ fontSize: '7px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif" }}>
              {hasBerserkerStrength ? (
                <span>⚡ Replaces Rage: When HP &lt; {5 * barbarianLvl}, automatically gain +4 STR, +2 all saves, DR 2/—, and -2 AC. No daily limit.</span>
              ) : (
                <span>🔥 +4 STR, +4 CON, +2 Will saves, -2 AC, +{2 * pc.level} HP.</span>
              )}
            </div>
          </div>
        )}

        {/* Monk Flurry of Blows / Decisive Strike */}
        {monkLvl > 0 && (
          <div
            style={{
              background: pc.isFlurrying ? 'rgba(139, 26, 26, 0.1)' : 'rgba(200, 169, 110, 0.05)',
              border: `1px solid ${pc.isFlurrying ? 'var(--red)' : 'var(--pb)'}`,
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
                  color: pc.isFlurrying ? 'var(--red)' : 'var(--ink)',
                  margin: 0,
                  fontWeight: 'bold',
                  fontSize: '8.5px',
                  fontFamily: "'IM Fell English SC', serif"
                }}
              >
                <input
                  type="checkbox"
                  checked={!!pc.isFlurrying}
                  onChange={(e) => CombatState.updatePCField('isFlurrying', e.target.checked)}
                  style={{ margin: 0, width: '12px', height: '12px', cursor: 'pointer' }}
                />
                🥋 {hasDecisiveStrike ? 'Decisive Strike (Double Damage)' : `Flurry of Blows (+${flurryExtraAttacks} Extra Attack${flurryExtraAttacks > 1 ? 's' : ''})`}
              </label>

              <span
                style={{
                  background: pc.isFlurrying ? 'var(--red)' : 'rgba(0,0,0,0.06)',
                  color: pc.isFlurrying ? '#fff' : 'var(--inkm)',
                  fontSize: '7.5px',
                  fontWeight: 'bold',
                  padding: '1px 5px',
                  borderRadius: '2px',
                  fontFamily: 'monospace'
                }}
              >
                {hasDecisiveStrike ? '2x DMG' : `Penalty: ${flurryPenalty}`}
              </span>
            </div>

            <div style={{ fontSize: '7px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", display: 'flex', justifyContent: 'space-between' }}>
              <span>🥋 Applies only when unarmored on Full Attack actions with unarmed strike / monk weapons.</span>
              <span>Stun DC: <strong>{stunDC}</strong></span>
            </div>
          </div>
        )}

        {/* Bard Inspire Courage */}
        {bardLvl > 0 && (
          <div
            style={{
              background: pc.isBardInspireActive ? 'rgba(200, 169, 110, 0.15)' : 'rgba(200, 169, 110, 0.05)',
              border: `1px solid ${pc.isBardInspireActive ? 'var(--red)' : 'var(--pb)'}`,
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
                  color: pc.isBardInspireActive ? 'var(--red)' : 'var(--ink)',
                  margin: 0,
                  fontWeight: 'bold',
                  fontSize: '8.5px',
                  fontFamily: "'IM Fell English SC', serif"
                }}
              >
                <input
                  type="checkbox"
                  checked={!!pc.isBardInspireActive}
                  onChange={(e) => CombatState.updatePCField('isBardInspireActive', e.target.checked)}
                  style={{ margin: 0, width: '12px', height: '12px', cursor: 'pointer' }}
                />
                🎵 Inspire Courage (+{inspireCourageBonus} Morale Atk &amp; Dmg)
              </label>

              <span
                style={{
                  background: pc.isBardInspireActive ? 'linear-gradient(135deg, #c8a96e, #9a7a2e)' : 'rgba(0,0,0,0.06)',
                  color: pc.isBardInspireActive ? '#fff' : 'var(--inkm)',
                  fontSize: '7.5px',
                  fontWeight: 'bold',
                  padding: '1px 5px',
                  borderRadius: '2px',
                  fontFamily: 'monospace'
                }}
              >
                +{inspireCourageBonus} MORALE
              </span>
            </div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif" }}>
              🎵 Grants morale bonus on attack &amp; weapon damage rolls to you and all allies within 30 ft.
            </div>
          </div>
        )}

        {/* Assassin Death Attack & Poison Use */}
        {assassinLvl > 0 && (
          <div
            style={{
              background: 'rgba(74, 35, 90, 0.08)',
              border: '1px solid #6c3483',
              borderRadius: '3px',
              padding: '5px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8.5px', fontWeight: 'bold', color: '#6c3483' }}>
                ☠️ Assassin: Death Attack &amp; Poison Use
              </span>
              <span
                style={{
                  background: '#6c3483',
                  color: '#fff',
                  fontSize: '7.5px',
                  fontWeight: 'bold',
                  padding: '1px 5px',
                  borderRadius: '2px',
                  fontFamily: 'monospace'
                }}
              >
                DC {deathAttackDC}
              </span>
            </div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif" }}>
              ☠️ Study target for 3 rounds. Next sneak attack forces Fort save (DC {deathAttackDC}) vs Kill or Paralyze (1d6+{assassinLvl} rds). Never accidental self-poison.
            </div>
          </div>
        )}

        {/* Battle Trickster Tricky Fighting */}
        {hasTrickyFighting && (
          <div
            style={{
              background: pc.isTrickyFightingActive ? 'rgba(39, 174, 96, 0.08)' : 'rgba(200, 169, 110, 0.05)',
              border: `1px solid ${pc.isTrickyFightingActive ? '#27ae60' : 'var(--pb)'}`,
              borderRadius: '3px',
              padding: '5px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  color: pc.isTrickyFightingActive ? '#1e824c' : 'var(--ink)',
                  margin: 0,
                  fontWeight: 'bold',
                  fontSize: '8.5px',
                  fontFamily: "'IM Fell English SC', serif"
                }}
              >
                <input
                  type="checkbox"
                  checked={!!pc.isTrickyFightingActive}
                  onChange={(e) => CombatState.updatePCField('isTrickyFightingActive', e.target.checked)}
                  style={{ margin: 0, width: '12px', height: '12px', cursor: 'pointer' }}
                />
                ⚔️ Tricky Fighting (+1d6 Damage)
              </label>
              <span
                style={{
                  background: pc.isTrickyFightingActive ? '#27ae60' : 'rgba(0,0,0,0.06)',
                  color: pc.isTrickyFightingActive ? '#fff' : 'var(--inkm)',
                  fontSize: '7.5px',
                  fontWeight: 'bold',
                  padding: '1px 5px',
                  borderRadius: '2px',
                  fontFamily: 'monospace'
                }}
              >
                +1d6 DMG
              </span>
            </div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif" }}>
              ⚔️ Complete Scoundrel: Adds +1d6 damage when flanking or opponent is denied Dexterity bonus to AC.
            </div>
          </div>
        )}

        {/* Dragon Disciple Breath Weapon */}
        {dragonDiscipleLvl >= 3 && (
          <div
            style={{
              background: 'rgba(186, 74, 0, 0.08)',
              border: '1px solid #ba4a00',
              borderRadius: '3px',
              padding: '5px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8.5px', fontWeight: 'bold', color: '#ba4a00' }}>
                🐉 Dragon Disciple: Breath Weapon (1/day)
              </span>
              <span
                style={{
                  background: '#ba4a00',
                  color: '#fff',
                  fontSize: '7.5px',
                  fontWeight: 'bold',
                  padding: '1px 5px',
                  borderRadius: '2px',
                  fontFamily: 'monospace'
                }}
              >
                {breathWeaponDice}
              </span>
            </div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif" }}>
              🐉 Line/Cone energy breath: Reflex half DC 10 + Class Level [{dragonDiscipleLvl}] + Con Mod.
            </div>
          </div>
        )}

      </div>
    </BaseCard>
  );
};
