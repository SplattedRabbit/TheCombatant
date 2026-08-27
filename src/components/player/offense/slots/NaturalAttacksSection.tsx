/**
 * @module    NaturalAttacksSection
 * @summary   Renders Wild Shape natural attacks when pc.activeShape is active.
 */

import React from 'react';
import { AttackEngine } from '@core/rules/AttackEngine.js';
import { SHAPE_ATTACKS } from '@core/models/helpers/classes/DruidHelper.js';

export interface NaturalAttacksSectionProps {
  pc: any;
  formatMod: (val: number) => string;
  handleRollAttack: (w: any, isOffhand: boolean, e: React.MouseEvent, customOptions?: any) => void;
  handleRollDamage: (w: any, isOffhand: boolean, e: React.MouseEvent, customOptions?: any) => void;
}

export const NaturalAttacksSection: React.FC<NaturalAttacksSectionProps> = ({
  pc,
  formatMod,
  handleRollAttack,
  handleRollDamage,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div
        style={{
          background: 'rgba(200, 169, 110, 0.04)',
          border: '0.5px solid var(--pb)',
          borderRadius: '4px',
          padding: '8px 10px',
          textAlign: 'center',
          fontStyle: 'italic',
          color: 'var(--inkl)',
          fontFamily: 'var(--font-title)',
          fontSize: '9px',
          marginBottom: '8px',
        }}
      >
        In Wild Shape, manufactured weapons are inactive. Use your natural weapons.
      </div>
      <div
        style={{
          fontFamily: 'var(--font-title)',
          fontSize: '8px',
          color: 'var(--inkl)',
          paddingBottom: '2px',
          borderBottom: '0.5px solid var(--pb)',
          marginBottom: '4px',
          fontWeight: 'bold',
        }}
      >
        🐾 Natural Attacks (Wild Shape)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {(SHAPE_ATTACKS[pc.activeShape] || []).map((atk: any, idx: number) => {
          const w = {
            name: atk.name,
            damageDice: atk.damageDice,
            damage: atk.damageDice,
            enhancement: 0,
            attackBonus: 0,
            isNatural: true,
            isSecondary: atk.isSecondary,
            grip: 'unarmed',
            crit: '20 / x2',
            type: 'unarmed',
          };
          const seq = AttackEngine.calculateAttackSequence(pc, w, false, {
            smite: pc.isSmiteActive,
            favoredEnemy: pc.isFavoredEnemyActive,
            sneakAttack: pc.isSneakAttacking,
          });
          const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0 };
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '3px 6px',
                background: 'rgba(200, 169, 110, 0.08)',
                border: '0.5px solid var(--pb)',
                borderRadius: '2px',
                fontSize: '8.5px',
              }}
            >
              <span style={{ fontWeight: 'bold', color: 'var(--red)' }}>{w.name}</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button
                  className="xbtn xbtn-dmg roll-atk-btn"
                  disabled={pc.isTotalDefense}
                  onClick={(e) => handleRollAttack(w, false, e)}
                  style={{ padding: '1px 3px', fontSize: '7px', fontWeight: 'bold' }}
                >
                  ATK ({formatMod(stdAtkObj.atkTotal)}) 🎲
                </button>
                <button
                  className="xbtn xbtn-heal roll-dmg-btn"
                  disabled={pc.isTotalDefense}
                  onClick={(e) => handleRollDamage(w, false, e)}
                  style={{ padding: '1px 3px', fontSize: '7px', fontWeight: 'bold' }}
                >
                  DMG ({formatMod(stdAtkObj.dmgTotal)})
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
