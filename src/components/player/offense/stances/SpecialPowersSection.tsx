/**
 * @module    SpecialPowersSection
 * @summary   Prestige class combat powers: Assassin Death Attack, Battle Trickster Tricky Fighting, and Dragon Disciple Breath Weapon.
 * @exports   SpecialPowersSection
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { getAblMod } from '../../attributeHelper';

interface SpecialPowersSectionProps {
  pc: any;
  assassinLvl: number;
  battleTricksterLvl: number;
  dragonDiscipleLvl: number;
}

export const SpecialPowersSection: React.FC<SpecialPowersSectionProps> = ({
  pc,
  assassinLvl,
  battleTricksterLvl,
  dragonDiscipleLvl
}) => {
  const hasTrickyFighting = battleTricksterLvl >= 3;
  const hasBreathWeapon = dragonDiscipleLvl >= 3;

  if (assassinLvl <= 0 && !hasTrickyFighting && !hasBreathWeapon) {
    return null;
  }

  const intValue = pc.int ? (typeof pc.int.getValue === 'function' ? pc.int.getValue() : pc.int) : 10;
  const intMod = getAblMod(intValue);
  const deathAttackDC = 10 + assassinLvl + Math.max(0, intMod);

  const breathWeaponDice = dragonDiscipleLvl >= 10 ? '6d8' : (dragonDiscipleLvl >= 7 ? '4d8' : (dragonDiscipleLvl >= 3 ? '2d8' : ''));

  return (
    <>
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
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '8.5px', fontWeight: 'bold', color: '#4a5b6c' }}>
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
          <div style={{ fontSize: '7px', color: 'var(--inkm)', fontFamily: 'var(--font-body)' }}>
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
                fontFamily: 'var(--font-title)'
              }}
            >
              <input
                type="checkbox"
                checked={!!pc.isTrickyFightingActive}
                onChange={(e) => CombatState.updatePCField('isTrickyFightingActive', e.target.checked)}
                style={{ margin: 0, width: '12px', height: '12px', cursor: 'pointer' }}
              />
              ⚔️ Tricky Fighting (+1 Attack)
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
          <div style={{ fontSize: '7px', color: 'var(--inkm)', fontFamily: 'var(--font-body)' }}>
            ⚔️ Complete Scoundrel: Adds +1d6 damage when flanking or opponent is denied Dexterity bonus to AC.
          </div>
        </div>
      )}

      {/* Dragon Disciple Breath Weapon */}
      {hasBreathWeapon && (
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
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '8.5px', fontWeight: 'bold', color: 'var(--red)' }}>
              Dragon Disciple: Breath Weapon (1/day)
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
          <div style={{ fontSize: '7px', color: 'var(--inkm)', fontFamily: 'var(--font-body)' }}>
            Line/Cone energy breath: Reflex half DC 10 + Class Level [{dragonDiscipleLvl}] + Con Mod.
          </div>
        </div>
      )}
    </>
  );
};
