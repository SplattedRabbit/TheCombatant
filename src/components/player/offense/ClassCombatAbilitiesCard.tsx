/**
 * @module    ClassCombatAbilitiesCard
 * @summary   Stances & Special Class Powers hub for continuous combat states (Barbarian Rage, Monk Flurry & Stunning Fist, Bardic Music, Assassin Death Attack, Breath Weapon).
 * @exports   ClassCombatAbilitiesCard
 * @reads     pc.classes, pc.dailyAbilities, pc.isRaging, pc.isFlurrying, pc.isBardInspireActive, pc.wis, pc.int
 * @stateOps  CombatState.updatePCField, CombatState.togglePCRage
 * @depends   React, @core/state.js, src/components/shared/BaseCard
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { BaseCard } from '../../shared/BaseCard';
import { showCustomAlert } from '@core/ui/components/dialogs.js';
import { getAblMod } from '../attributeHelper';

interface ClassCombatAbilitiesCardProps {
  pc: any;
}

export const ClassCombatAbilitiesCard: React.FC<ClassCombatAbilitiesCardProps> = ({
  pc
}) => {
  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  
  const barbarianClass = activeClasses.find((c: any) => c.classType === 'barbarian');
  const barbarianLvl = barbarianClass ? barbarianClass.level : 0;

  const monkClass = activeClasses.find((c: any) => c.classType === 'monk');
  const monkLvl = monkClass ? monkClass.level : 0;

  const bardClass = activeClasses.find((c: any) => c.classType === 'bard');
  const bardLvl = bardClass ? bardClass.level : 0;

  // 1. Barbarian Rage resolution
  const rageAbility = Array.isArray(pc.dailyAbilities)
    ? pc.dailyAbilities.find((a: any) => a.name === "Kampfrausch (Rage)" || a.name === "Rage" || a.name?.includes("Rage"))
    : null;
  const rageMax = rageAbility ? rageAbility.max : (barbarianLvl > 0 ? 1 + Math.floor(barbarianLvl / 4) : 0);
  const rageUsed = rageAbility ? rageAbility.used : 0;
  const rageRemaining = Math.max(0, rageMax - rageUsed);

  // 2. Monk Flurry & Stunning Fist
  const wisValue = pc.wis ? (typeof pc.wis.getValue === 'function' ? pc.wis.getValue() : pc.wis) : 10;
  const wisMod = getAblMod(wisValue);
  const stunDC = 10 + Math.floor(monkLvl / 2) + Math.max(0, wisMod);

  // 3. Bard Inspire Courage
  let inspireCourageBonus = 1;
  if (bardLvl >= 20) inspireCourageBonus = 4;
  else if (bardLvl >= 14) inspireCourageBonus = 3;
  else if (bardLvl >= 8) inspireCourageBonus = 2;

  // 4. Prestige Classes
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
  const hasBerserkerStrength = activeACFs.includes('barbarian_berserker_strength');
  const hasDecisiveStrike = activeACFs.includes('monk_decisive_strike');

  const hasAnyStances = (barbarianLvl > 0 || !!rageAbility) || 
    (monkLvl > 0) || 
    (bardLvl > 0) || 
    (assassinLvl > 0) || 
    hasTrickyFighting || 
    (dragonDiscipleLvl >= 3);

  // If no sustained stances/powers, return null so we don't clutter the view
  if (!hasAnyStances) {
    return null;
  }

  const handleRageToggle = () => {
    const result = CombatState.togglePCRage();
    if (result && !result.success && result.message) {
      showCustomAlert("Rage Limit", result.message, "Understood", "⚠️");
    }
  };

  const handleRageBubbleClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    CombatState.updatePCBatch((activePC: any) => {
      const ability = activePC.dailyAbilities?.find((a: any) => a.name === "Kampfrausch (Rage)");
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
    <BaseCard title="🥋 Stances &amp; Class Powers">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

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
                🥋 {hasDecisiveStrike ? 'Decisive Strike' : `Flurry of Blows`}
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
                Stun DC {stunDC}
              </span>
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
                  background: pc.isBardInspireActive ? 'var(--red)' : 'rgba(0,0,0,0.06)',
                  color: pc.isBardInspireActive ? '#fff' : 'var(--inkm)',
                  fontSize: '7.5px',
                  fontWeight: 'bold',
                  padding: '1px 5px',
                  borderRadius: '2px',
                  fontFamily: 'monospace'
                }}
              >
                +{inspireCourageBonus} Morale
              </span>
            </div>

            <div style={{ fontSize: '7px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif" }}>
              🎵 Grants morale bonus on saving throws against charm and fear, and attack and weapon damage rolls.
            </div>
          </div>
        )}

        {/* Assassin Death Attack */}
        {assassinLvl > 0 && (
          <div
            style={{
              background: 'rgba(90, 107, 124, 0.05)',
              border: '1px solid #5a6b7c',
              borderRadius: '3px',
              padding: '5px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8.5px', fontWeight: 'bold', color: '#4a5b6c' }}>
                ☠️ Assassin: Death Attack &amp; Poison Use
              </span>
              <span
                style={{
                  background: '#5a6b7c',
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
              ☠️ Study target for 3 rounds. Next sneak attack forces Fort save (DC {deathAttackDC}) vs Kill or Paralyze (1d6+{assassinLvl} rds).
            </div>
          </div>
        )}

        {/* Battle Trickster Tricky Fighting */}
        {hasTrickyFighting && (
          <div
            style={{
              background: 'rgba(200, 169, 110, 0.05)',
              border: '1px solid var(--pb)',
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
                  color: pc.isTrickyFightingActive ? 'var(--red)' : 'var(--ink)',
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
                  background: pc.isTrickyFightingActive ? 'var(--red)' : 'rgba(0,0,0,0.06)',
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
              background: 'rgba(139, 26, 26, 0.05)',
              border: '1px solid var(--red)',
              borderRadius: '3px',
              padding: '5px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8.5px', fontWeight: 'bold', color: 'var(--red)' }}>
                🐉 Dragon Disciple: Breath Weapon (1/day)
              </span>
              <span
                style={{
                  background: 'var(--red)',
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
