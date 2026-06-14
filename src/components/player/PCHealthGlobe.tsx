/**
 * @module    PCHealthGlobe
 * @summary   Rendert den Diablo-Style Lebenspunkt-Globus (Health Globe) mit CSS-Flüssigkeitswellen und Conditions-Badges.
 * @exports   PCHealthGlobe
 * @reads     pc.hp, pc.maxHP, pc.conditions, pc.id
 * @stateOps  updatePCNumber, applyDamage, applyTempHP
 * @depends   React, @core/state.js, src/components/shared/BaseCard
 * @notHere   Header HP-Widget -> PCHeader.tsx | Globale State-Bridge -> useCombatState.ts
 */

import React, { useState } from 'react';
import type { Combatant } from '../../types/combat';
// @ts-ignore
import { CombatState } from '@core/state.js';
import { BaseCard } from '../shared/BaseCard';

interface PCHealthGlobeProps {
  pc: Combatant;
}

export const PCHealthGlobe: React.FC<PCHealthGlobeProps> = ({ pc }) => {
  const [dmgValue, setDmgValue] = useState<string>('');
  const [isHalf, setIsHalf] = useState<boolean>(false);
  const [isDouble, setIsDouble] = useState<boolean>(false);

  // Temp HP aus Conditions ermitteln
  const tempHPObj = pc.conditions.find((c: any) => c === 'Temp-HP' || (c && c.n === 'Temp-HP'));
  const tempHP = tempHPObj ? (parseInt((tempHPObj as any).tmpVal) || 0) : 0;

  const baseMaxHP = Math.max(1, pc.maxHP - tempHP);
  const baseHP = Math.max(0, pc.hp - tempHP);

  const basePct = Math.max(0, Math.min(100, Math.floor((baseHP / baseMaxHP) * 100)));
  const tempPct = Math.max(0, Math.min(100, Math.floor((tempHP / baseMaxHP) * 100)));

  // Filter Conditions für die Anzeige (zeige alles außer Temp-HP)
  const activeConditions = pc.conditions.filter((c: any) => {
    if (typeof c === 'string') return c !== 'Temp-HP';
    return c && c.n !== 'Temp-HP';
  });

  const getConditionName = (c: any) => {
    if (typeof c === 'string') return c;
    return c.n || 'Unbekannt';
  };

  const getConditionTooltip = (c: any) => {
    if (typeof c === 'string') return c;
    let desc = c.n || 'Zustand';
    if (c.tmpVal) desc += `: Wert ${c.tmpVal}`;
    if (c.duration) desc += ` (${c.duration} Runden verbleibend)`;
    return desc;
  };

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
    <BaseCard title="❤️ Vitalität & Status">
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', gap: '24px', width: '100%', flexWrap: 'wrap', padding: '4px 8px' }}>
        
        {/* Globe visual container */}
        <div className="globe-wrapper" style={{ margin: '0' }}>
          <div className="globe-ring"></div>
          <div className="liquid-chamber">
            {/* Glass reflection specular highlight layers */}
            <div className="globe-glass"></div>
            <div className="globe-highlight"></div>
            
            {/* Base Red Liquid Level */}
            <div className="liquid-base" style={{ height: `${basePct}%` }}>
              {/* Parallax SVG waves translating in opposite directions */}
              <svg className="wave-svg wave-front" viewBox="0 0 200 20" preserveAspectRatio="none">
                <path d="M 0,10 C 25,3 75,17 100,10 C 125,3 175,17 200,10 L 200,20 L 0,20 Z" fill="#ff2222" />
              </svg>
              <svg className="wave-svg wave-back" viewBox="0 0 200 20" preserveAspectRatio="none">
                <path d="M 0,10 C 25,3 75,17 100,10 C 125,3 175,17 200,10 L 200,20 L 0,20 Z" fill="#8b0000" opacity="0.65" />
              </svg>
            </div>
            
            {/* Temp Blue Liquid Level */}
            {tempHP > 0 && (
              <div className="liquid-temp" style={{ height: `${tempPct}%`, bottom: `${basePct}%`, display: 'block' }}>
                {/* Parallax SVG waves translating in opposite directions (blue/cyan) */}
                <svg className="wave-svg wave-front" viewBox="0 0 200 20" preserveAspectRatio="none">
                  <path d="M 0,10 C 25,3 75,17 100,10 C 125,3 175,17 200,10 L 200,20 L 0,20 Z" fill="#00e0ff" />
                </svg>
                <svg className="wave-svg wave-back" viewBox="0 0 200 20" preserveAspectRatio="none">
                  <path d="M 0,10 C 25,3 75,17 100,10 C 125,3 175,17 200,10 L 200,20 L 0,20 Z" fill="#1b3d82" opacity="0.65" />
                </svg>
              </div>
            )}

            {/* Glass Inner Shadow */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.65)', pointerEvents: 'none', zIndex: 7 }}></div>
            
            {/* Numerical HP Values overlay inside the orb */}
            <div className="globe-text">
              <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '2px' }}>TREFFERP.</span>
              <input
                type="number"
                value={pc.hp}
                onChange={(e) => CombatState.updatePCNumber('hp', e.target.value)}
                className="globe-hp-cur"
                title="Aktuelle TP direkt editieren"
              />
              <div className="globe-hp-divider"></div>
              <input
                type="number"
                value={pc.maxHP}
                onChange={(e) => CombatState.updatePCNumber('maxHP', e.target.value)}
                className="globe-hp-max"
                title="Maximal-TP direkt editieren"
              />
              
              {/* Temp HP Badge overlay inside the Globe */}
              {tempHP > 0 && (
                <div className="globe-temp-hp-badge" style={{ display: 'block' }}>
                  +{tempHP} Temp
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column: Controls & Conditions */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1.2', minWidth: '200px', gap: '10px' }}>
          {/* Control pedestal deck */}
          <div className="globe-control-deck" style={{ borderTop: 'none', paddingTop: '0', marginTop: '0', width: '100%' }}>
            <div className="globe-control-row">
              <input
                className="globe-dmg-input"
                type="number"
                placeholder="Wert"
                value={dmgValue}
                onChange={(e) => setDmgValue(e.target.value)}
                style={{
                  width: '42px',
                  height: '22px',
                  textAlign: 'center',
                  borderRadius: '2px',
                  border: '0.5px solid var(--pb)',
                  fontFamily: "'Crimson Text', serif",
                  fontSize: '12px',
                  outline: 'none',
                  background: 'rgba(255,255,255,0.6)'
                }}
              />
              <button 
                className="globe-btn globe-btn-dmg" 
                onClick={handleApplyDamage} 
                title="Schaden abziehen"
                style={{ height: '22px', padding: '0 8px', fontSize: '8.5px', lineHeight: '20px' }}
              >
                - Schad.
              </button>
              <button 
                className="globe-btn globe-btn-heal" 
                onClick={handleApplyHeal} 
                title="Heilung anwenden"
                style={{ height: '22px', padding: '0 8px', fontSize: '8.5px', lineHeight: '20px' }}
              >
                + Heil.
              </button>
              <button 
                className="globe-btn globe-btn-temp" 
                onClick={handleApplyTempHP} 
                title="Temporäre TP hinzufügen"
                style={{ height: '22px', padding: '0 8px', fontSize: '8.5px', lineHeight: '20px' }}
              >
                + Temp
              </button>
            </div>
            
            <div className="globe-chk-row" style={{ display: 'flex', gap: '10px', fontSize: '8px', color: 'var(--inkl)', justifyContent: 'center', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isHalf}
                  onChange={(e) => setIsHalf(e.target.checked)}
                  className="globe-dmg-half"
                  style={{ width: '12px', height: '12px', cursor: 'pointer', margin: 0 }}
                />
                <span>Halbiert (Reflex)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isDouble}
                  onChange={(e) => setIsDouble(e.target.checked)}
                  className="globe-dmg-double"
                  style={{ width: '12px', height: '12px', cursor: 'pointer', margin: 0 }}
                />
                <span>Doppelt (Krit)</span>
              </label>
            </div>
          </div>

          {/* Conditions Badges */}
          <div style={{ width: '100%', borderTop: '0.5px solid rgba(200, 169, 110, 0.15)', paddingTop: '8px' }}>
            <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8.5px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>
              ✨ Aktive Zustände (Conditions)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {activeConditions.length > 0 ? (
                activeConditions.map((cond, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(139, 26, 26, 0.08)',
                      border: '0.5px solid var(--red)',
                      borderRadius: '2px',
                      padding: '2px 6px',
                      fontSize: '8px',
                      color: 'var(--red)',
                      fontFamily: "'Crimson Text', serif",
                      fontWeight: 'bold',
                      cursor: 'help',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                    title={getConditionTooltip(cond)}
                  >
                    ⚠️ {getConditionName(cond)}
                  </div>
                ))
              ) : (
                <span style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>Keine aktiven Zustände.</span>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </BaseCard>
  );
};
