/**
 * @module    OffHandSlot
 * @summary   Renders the Off-Hand ARPG slot (Shield or secondary weapon).
 */

import React from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { AttackEngine } from '@core/rules/AttackEngine.js';
// @ts-ignore
import { matchesFeatOption, getCritThreatDisplay } from '@core/models/Weapon.js';
import { isWeaponTwoHanded } from './slotsHelper';

export interface OffHandSlotProps {
  pc: any;
  offHandWeapon: any;
  equippedShield: any;
  isDoubleWielded: boolean;
  getRarityStyle: (enhancement: number) => { border: string; background: string; boxShadow: string; glowClass: string };
  formatMod: (val: number) => string;
  handleHandSelectChange: (idx: number, val: string) => void;
  handleRollAttack: (w: any, isOffhand: boolean, e: React.MouseEvent, customOptions?: any) => void;
  handleRollDamage: (w: any, isOffhand: boolean, e: React.MouseEvent, customOptions?: any) => void;
}

export const OffHandSlot: React.FC<OffHandSlotProps> = ({
  pc,
  offHandWeapon,
  equippedShield,
  isDoubleWielded,
  getRarityStyle,
  formatMod,
  handleHandSelectChange,
  handleRollAttack,
  handleRollDamage,
}) => {
  const w = offHandWeapon;
  const sh = equippedShield;
  const rStyle = getRarityStyle(sh ? sh.enhancement : w ? w.enhancement : 0);

  if (!sh && !w) {
    return (
      <div
        className="arpg-slot off-hand-slot"
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '88px',
          border: '0.5px solid var(--pb)',
          borderRadius: '4px',
          padding: '5px 6px',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ fontSize: '14px', color: 'var(--inkl)', marginBottom: '1px', opacity: 0.6 }}>🛡️</div>
        <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif" }}>
          Off-Hand
        </div>
        <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic' }}>(Empty)</div>
      </div>
    );
  }

  if (sh) {
    return (
      <div
        className={`arpg-slot off-hand-slot ${rStyle.glowClass}`}
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '88px',
          border: rStyle.border,
          borderRadius: '4px',
          padding: '5px 6px',
          textAlign: 'center',
          background: rStyle.background,
          boxShadow: rStyle.boxShadow,
        }}
      >
        <button
          className="unequip-slot-btn"
          onClick={() => CombatState.togglePCArmorEquip(pc.armors.indexOf(sh))}
          style={{
            position: 'absolute',
            top: '2px',
            right: '4px',
            border: 'none',
            background: 'transparent',
            fontSize: '7.5px',
            cursor: 'pointer',
            color: 'var(--red)',
            padding: 0,
          }}
          title="Unequip"
        >
          ✕
        </button>
        <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
          🛡️ Off-Hand
        </div>
        <div
          style={{
            fontFamily: "'Crimson Text', serif",
            fontSize: '9.5px',
            fontWeight: 'bold',
            color: 'var(--red)',
            textShadow: '0 0 1px rgba(139,26,26,0.1)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            width: '100%',
          }}
          title={sh.name}
        >
          {sh.name}
        </div>
        <div style={{ fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.1 }}>+{sh.armorBonus + sh.enhancement} AC (Shield)</div>
        <div style={{ fontSize: '6.5px', color: 'var(--inkm)', lineHeight: 1, fontStyle: 'italic' }}>ACP: -{sh.checkPenalty ?? 0}</div>
        <div style={{ width: '100%', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>
          🛡️ Guarding
        </div>
      </div>
    );
  }

  // Weapon in Offhand
  const seq = AttackEngine.calculateAttackSequence(pc, w, false, {
    isOffhandAttack: true,
    smite: pc.isSmiteActive,
    favoredEnemy: pc.isFavoredEnemyActive,
    sneakAttack: pc.isSneakAttacking,
  });
  const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
  const hasImprovedCritical =
    pc.feats &&
    pc.feats.some(
      (f: any) =>
        (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
        matchesFeatOption(w, f.option),
    );
  const isDoubleThreat = w.isKeen || hasImprovedCritical;
  const doubledCritDisplay = getCritThreatDisplay(w.crit, isDoubleThreat);
  const dmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : w.damage || '1w6';
  const extraDamage = w.extraDamage ? ` + ${w.extraDamage}` : '';
  const offhandLabel = isDoubleWielded ? '⚔️ Off-Hand (2nd)' : '⚔️ Off-Hand';

  return (
    <div
      className={`arpg-slot off-hand-slot ${rStyle.glowClass}`}
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '88px',
        border: rStyle.border,
        borderRadius: '4px',
        padding: '5px 6px',
        textAlign: 'center',
        background: rStyle.background,
        boxShadow: rStyle.boxShadow,
      }}
    >
      <button
        className="unequip-slot-btn"
        onClick={() => CombatState.togglePCWeaponEquip(pc.weapons.indexOf(w))}
        style={{
          position: 'absolute',
          top: '2px',
          right: '4px',
          border: 'none',
          background: 'transparent',
          fontSize: '7.5px',
          cursor: 'pointer',
          color: 'var(--red)',
          padding: 0,
        }}
        title="Unequip"
      >
        ✕
      </button>
      <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
        {offhandLabel}
      </div>
      <div
        style={{
          fontFamily: "'Crimson Text', serif",
          fontSize: '9.5px',
          fontWeight: 'bold',
          color: 'var(--red)',
          textShadow: '0 0 1px rgba(139,26,26,0.1)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          width: '100%',
        }}
        title={isDoubleWielded ? w.name + ' (Offhand)' : w.name}
      >
        {isDoubleWielded ? w.name + ' (Offhand)' : w.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '1px 0', fontSize: '7px', color: 'var(--inkm)' }}>
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={`${dmgDice}${extraDamage} • ${doubledCritDisplay}`}>
          {dmgDice}${extraDamage} • {doubledCritDisplay}
        </div>
        {!isDoubleWielded && !isWeaponTwoHanded(w) && (
          <select
            className="cinput weapon-hand-select"
            value="off"
            onChange={(e) => handleHandSelectChange(pc.weapons.indexOf(w), e.target.value)}
            style={{
              fontSize: '6.5px',
              padding: '0 1px',
              height: '12px',
              lineHeight: 1,
              borderRadius: '1px',
              border: '0.5px solid var(--pb)',
              outline: 'none',
              background: 'white',
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            <option value="main">Main</option>
            <option value="off">Off</option>
          </select>
        )}
      </div>
      <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
        <button
          className="xbtn xbtn-atk"
          disabled={pc.isTotalDefense}
          onClick={(e) => handleRollAttack(w, true, e)}
          style={{
            flex: 1,
            padding: '2px 0',
            fontSize: '7.5px',
            fontWeight: 'bold',
            height: '18px',
            lineHeight: 1,
            opacity: pc.isTotalDefense ? 0.4 : 1,
            cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer',
          }}
          title={`Roll Attack (${formatMod(stdAtkObj.atkTotal)})`}
        >
          ATK {formatMod(stdAtkObj.atkTotal)}
        </button>
        <button
          className="xbtn xbtn-dmg"
          disabled={pc.isTotalDefense}
          onClick={(e) => handleRollDamage(w, true, e)}
          style={{
            flex: 1,
            padding: '2px 0',
            fontSize: '7.5px',
            fontWeight: 'bold',
            height: '18px',
            lineHeight: 1,
            opacity: pc.isTotalDefense ? 0.4 : 1,
            cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer',
          }}
          title={`Roll Damage (${dmgDice}${extraDamage} ${formatMod(stdAtkObj.dmgTotal)})`}
        >
          DMG {formatMod(stdAtkObj.dmgTotal)}
        </button>
      </div>
    </div>
  );
};
