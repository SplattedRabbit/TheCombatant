/**
 * @module    PCHeaderStatsWidget
 * @summary   Status emblem, double-layered health bar, and quick damage/healing controller widget in PCHeader.
 */

import React, { useState } from 'react';
import type { Combatant } from '../../../types/combat';
import { CombatState } from '@core/state.js';

interface PCHeaderStatsWidgetProps {
  pc: Combatant;
  finalIni: string | number;
}

export const PCHeaderStatsWidget: React.FC<PCHeaderStatsWidgetProps> = ({ pc, finalIni }) => {
  const [dmgValue, setDmgValue] = useState<string>('');
  const [isHalf, setIsHalf] = useState<boolean>(false);
  const [isDouble, setIsDouble] = useState<boolean>(false);

  // Get Temp HP
  const tempHPObj = pc.conditions.find((c: any) => c === 'Temp-HP' || (c && c.n === 'Temp-HP'));
  const tempHP = tempHPObj ? (parseInt((tempHPObj as any).tmpVal) || 0) : 0;

  const baseMaxHP = Math.max(1, pc.maxHP - tempHP);
  const baseHP = Math.max(0, pc.hp - tempHP);
  const basePct = Math.max(0, Math.min(100, Math.floor((baseHP / baseMaxHP) * 100)));
  const tempPct = Math.max(0, Math.min(100, Math.floor((tempHP / baseMaxHP) * 100)));
  const totalPct = Math.max(0, Math.min(100, Math.floor((pc.hp / pc.maxHP) * 100)));

  // Health-bar color class
  const getFillCls = (pct: number, hp: number) => {
    if (hp <= 0) return 'fill-dead';
    if (pct <= 25) return 'fill-crit';
    if (pct <= 50) return 'fill-warn';
    return 'fill-ok';
  };
  const fc = getFillCls(totalPct, pc.hp);

  // Damage / Healing / TempHP Handler
  const getCalculatedValue = () => {
    let val = parseInt(dmgValue) || 0;
    if (val > 0) {
      if (isHalf) val = Math.floor(val / 2);
      if (isDouble) val = val * 2;
    }
    return val;
  };

  const handleApplyDamage = () => {
    const val = getCalculatedValue();
    if (val > 0) {
      CombatState.applyDamage(pc.id, val, false);
      setDmgValue('');
    }
  };

  const handleApplyHeal = () => {
    const val = getCalculatedValue();
    if (val > 0) {
      CombatState.applyDamage(pc.id, val, true);
      setDmgValue('');
    }
  };

  const handleApplyTempHP = () => {
    const val = getCalculatedValue();
    if (val > 0) {
      CombatState.applyTempHP(pc.id, val);
      setDmgValue('');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(200, 169, 110, 0.08)',
        border: '0.5px solid var(--pb)',
        borderRadius: '4px',
        padding: '4px 10px 4px 6px',
        boxShadow: 'inset 0 0 10px rgba(200, 169, 110, 0.05)',
      }}
    >
      {/* Circular Gold Shield HP Emblem */}
      <div style={{ position: 'relative' }}>
        <div
          className="hp-emblem"
          style={{
            position: 'relative',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #f4e8c1 0%, #c8a96e 70%, #9a7a2e 100%)',
            border: '2px double var(--red)',
            boxShadow: '0 3px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'var(--font-title)',
            color: 'var(--red)',
            textShadow: '0 0.5px 0.5px rgba(255,255,255,0.5)',
          }}
        >
          <span style={{ fontSize: '8px', fontWeight: 'bold', lineHeight: 1, color: 'var(--inkl)', marginTop: '2px', letterSpacing: '0.5px' }}>HP</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16px', margin: '1px 0' }}>
            <input
              type="number"
              value={pc.hp}
              onChange={(e) => CombatState.updatePCNumber('hp', e.target.value)}
              style={{
                width: '28px',
                textAlign: 'center',
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-title)',
                fontSize: '14px',
                outline: 'none',
                fontWeight: 'bold',
                color: 'var(--red)',
                padding: 0,
              }}
              title="Edit current HP directly"
            />
          </div>
          <span style={{ height: '0.5px', background: 'var(--red)', width: '34px', opacity: 0.5 }}></span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '12px', marginTop: '1px' }}>
            <input
              type="number"
              value={pc.maxHP}
              onChange={(e) => CombatState.updatePCNumber('maxHP', e.target.value)}
              style={{
                width: '28px',
                textAlign: 'center',
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '9.5px',
                outline: 'none',
                color: 'var(--inkl)',
                padding: 0,
              }}
              title="Edit max HP directly"
            />
          </div>
        </div>

        {/* Temp HP Badge Overlay */}
        {tempHP > 0 && (
          <div
            className="temp-hp-badge"
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
              border: '0.8px solid #00c0ff',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00c0ff',
              fontFamily: 'var(--font-title)',
              fontSize: '8.5px',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,192,255,0.45), inset 0 1px 2px rgba(255,255,255,0.2)',
              zIndex: 15,
            }}
            title="Active temporary HP"
          >
            +{tempHP}
          </div>
        )}
      </div>

      {/* Double-Layered Health Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5px', width: '120px' }}>
        <div style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: 'var(--font-title)', display: 'flex', justifyContent: 'space-between', lineHeight: 1, letterSpacing: '0.2px' }}>
          <span>Health</span>
          <span>{totalPct}%</span>
        </div>

        <div
          className="hp-bar-wrap"
          style={{
            height: '10px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative',
            border: '0.5px solid var(--pb)',
            width: '100%',
            marginBottom: '2px',
          }}
        >
          {/* Base HP Fill */}
          <div
            className={`hp-bar-fill ${fc}`}
            style={{
              width: `${basePct}%`,
              height: '100%',
              transition: 'width 0.25s',
            }}
          ></div>
          {/* Temp HP Fill */}
          {tempHP > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: `${basePct}%`,
                width: `${tempPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #1f3d7a, #00b8f0)',
                boxShadow: '0 0 5px #00b8f0',
                transition: 'left 0.25s, width 0.25s',
                opacity: 0.85,
              }}
            ></div>
          )}
        </div>
        <div style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)', textAlign: 'left', lineHeight: 1, letterSpacing: '0.2px' }}>
          Initiative: {finalIni}
        </div>
      </div>

      {/* Dividing line */}
      <span style={{ width: '0.5px', height: '44px', background: 'rgba(200, 169, 110, 0.3)' }}></span>

      {/* Combat Damage/Healing Controller Widget */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '145px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <input
            type="number"
            placeholder="Val"
            value={dmgValue}
            onChange={(e) => setDmgValue(e.target.value)}
            style={{
              width: '38px',
              height: '22px',
              textAlign: 'center',
              borderRadius: '2px',
              border: '0.5px solid var(--pb)',
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              outline: 'none',
              background: 'rgba(255,255,255,0.6)',
            }}
          />

          <button
            className="xbtn xbtn-dmg pc-dmg-btn"
            style={{ height: '22px', padding: '0 6px', fontSize: '8px', fontWeight: 'bold', lineHeight: '20px', fontFamily: 'var(--font-title)', margin: 0 }}
            onClick={handleApplyDamage}
            title="Subtract damage"
          >
            - Damage
          </button>
          <button
            className="xbtn xbtn-heal pc-heal-btn"
            style={{ height: '22px', padding: '0 6px', fontSize: '8px', fontWeight: 'bold', lineHeight: '20px', fontFamily: 'var(--font-title)', margin: 0 }}
            onClick={handleApplyHeal}
            title="Apply healing"
          >
            + Heal
          </button>
          <button
            className="xbtn xbtn-temp-hp pc-temp-hp-btn"
            style={{
              height: '22px',
              padding: '0 5px',
              fontSize: '8px',
              fontWeight: 'bold',
              lineHeight: '20px',
              fontFamily: 'var(--font-title)',
              background: 'rgba(42,74,138,0.06)',
              borderColor: '#2a4a8a',
              color: '#1a2a6a',
              margin: 0,
            }}
            onClick={handleApplyTempHP}
            title="Add temporary HP"
          >
            + Temp
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 600, paddingLeft: '2px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={isHalf}
              onChange={(e) => setIsHalf(e.target.checked)}
              style={{ width: '10px', height: '10px', cursor: 'pointer', margin: 0 }}
            />
            <span>Half (Reflex)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={isDouble}
              onChange={(e) => setIsDouble(e.target.checked)}
              style={{ width: '10px', height: '10px', cursor: 'pointer', margin: 0 }}
            />
            <span>Double (Crit)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
