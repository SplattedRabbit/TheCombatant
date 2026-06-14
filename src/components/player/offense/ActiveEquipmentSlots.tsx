/**
 * @module    ActiveEquipmentSlots
 * @summary   Rendert die aktiven Ausrüstungs-Slots (Haupthand, Nebenhand, Rüstung) oder Wild Shape Angriffe.
 * @exports   ActiveEquipmentSlots
 * @reads     pc.activeShape, pc.weapons, pc.armor, pc.isTotalDefense, pc.isSmiteActive, pc.isFavoredEnemyActive, pc.isSneakAttacking
 * @stateOps  togglePCWeaponEquip, togglePCArmorEquip
 * @depends   React, @core/rules/AttackEngine.js, @core/models/Weapon.js, @core/state.js
 * @notHere   Waffenliste/Inventar -> WeaponStashCard.tsx | Rüstungsliste -> ArmorStashCard.tsx
 */

import React from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { AttackEngine } from '@core/rules/AttackEngine.js';
// @ts-ignore
import { WeaponRegistry, matchesFeatOption, getCritThreatDisplay } from '@core/models/Weapon.js';
// @ts-ignore
import { SHAPE_ATTACKS } from '@core/models/helpers/classes/DruidHelper.js';

interface ActiveEquipmentSlotsProps {
  pc: any;
  mainHandWeapon: any;
  offHandWeapon: any;
  equippedShield: any;
  equippedArmor: any;
  isDoubleWielded: boolean;
  getRarityStyle: (enhancement: number) => { border: string; background: string; boxShadow: string; glowClass: string };
  formatMod: (val: number) => string;
  handleHandSelectChange: (idx: number, val: string) => void;
  handleRollAttack: (w: any, isOffhand: boolean, e: React.MouseEvent) => void;
  handleRollDamage: (w: any, isOffhand: boolean, e: React.MouseEvent) => void;
}

export const ActiveEquipmentSlots: React.FC<ActiveEquipmentSlotsProps> = ({
  pc,
  mainHandWeapon,
  offHandWeapon,
  equippedShield,
  equippedArmor,
  isDoubleWielded,
  getRarityStyle,
  formatMod,
  handleHandSelectChange,
  handleRollAttack,
  handleRollDamage
}) => {

  const renderActiveSlot = (type: 'main' | 'off' | 'armor') => {
    if (type === 'main') {
      const w = mainHandWeapon;
      const rStyle = getRarityStyle(w ? w.enhancement : 0);
      if (!w) {
        return (
          <div className="arpg-slot main-hand-slot" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: '0.5px solid var(--pb)', borderRadius: '4px', padding: '5px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--inkl)', marginBottom: '1px', opacity: 0.6 }}>⚔️</div>
            <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif" }}>Haupthand</div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic' }}>(Unbewaffnet)</div>
          </div>
        );
      }
      
      const seq = AttackEngine.calculateAttackSequence(pc, w, false, {
        smite: pc.isSmiteActive,
        favoredEnemy: pc.isFavoredEnemyActive,
        sneakAttack: pc.isSneakAttacking
      });
      const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
      const hasImprovedCritical = pc.feats && pc.feats.some((f: any) => 
        (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
        matchesFeatOption(w, f.option)
      );
      const isDoubleThreat = w.isNatural ? false : (w.isKeen || hasImprovedCritical);
      const doubledCritDisplay = w.isNatural ? 'x2' : getCritThreatDisplay(w.crit, isDoubleThreat);
      const dmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : (w.damage || '1w6');
      const extraDamage = w.extraDamage ? ` + ${w.extraDamage}` : '';

      return (
        <div className={`arpg-slot main-hand-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
          <button className="unequip-slot-btn" onClick={() => CombatState.togglePCWeaponEquip(pc.weapons.indexOf(w))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Ablegen">✕</button>
          <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", marginBottom: '1px', opacity: 0.8 }}>Haupthand</div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={w.name}>{w.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '1px 0 3px' }}>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={`${dmgDice}${extraDamage} • ${doubledCritDisplay}`}>{dmgDice}{extraDamage} • {doubledCritDisplay}</div>
            {w.type !== 'unarmed' && w.grip !== '2h' && w.grip !== '2H' && (
              <select
                className="cinput weapon-hand-select"
                value="main"
                onChange={(e) => handleHandSelectChange(pc.weapons.indexOf(w), e.target.value)}
                style={{ fontSize: '7px', padding: '0 1px', height: '12px', lineHeight: 1, borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none', background: 'white', color: 'var(--ink)', marginTop: '1px', cursor: 'pointer' }}
              >
                <option value="main">Haupthand</option>
                <option value="off">Nebenhand</option>
              </select>
            )}
          </div>
          <div style={{ display: 'flex', gap: '2px', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <button className="xbtn xbtn-dmg roll-atk-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollAttack(w, false, e)} style={{ padding: '1px 2px', fontSize: '6.5px', fontWeight: 'bold', flex: 1, whiteSpace: 'nowrap', height: '15px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }} title="Angriff ausführen">
              ATK ({formatMod(stdAtkObj.atkTotal)}) 🎲
            </button>
            <button className="xbtn xbtn-heal roll-dmg-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollDamage(w, false, e)} style={{ padding: '1px 2px', fontSize: '6.5px', fontWeight: 'bold', flex: 1, borderColor: '#2a6a2a', color: '#1a4a1a', whiteSpace: 'nowrap', height: '15px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }}>
              DMG ({formatMod(stdAtkObj.dmgTotal)})
            </button>
          </div>
        </div>
      );
    }
    
    if (type === 'off') {
      const w = offHandWeapon;
      const sh = equippedShield;
      const rStyle = getRarityStyle(sh ? sh.enhancement : (w ? w.enhancement : 0));

      if (!sh && !w) {
        return (
          <div className="arpg-slot off-hand-slot" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: '0.5px solid var(--pb)', borderRadius: '4px', padding: '5px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--inkl)', marginBottom: '1px', opacity: 0.6 }}>🛡️</div>
            <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif" }}>Nebenhand</div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic' }}>(Leer)</div>
          </div>
        );
      }

      if (sh) {
        return (
          <div className={`arpg-slot off-hand-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
            <button className="unequip-slot-btn" onClick={() => CombatState.togglePCArmorEquip(pc.armors.indexOf(sh))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Ablegen">✕</button>
            <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", marginBottom: '1px', opacity: 0.8 }}>Nebenhand</div>
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={sh.name}>{sh.name}</div>
            <div style={{ fontSize: '7.5px', color: 'var(--inkm)', marginTop: '2px', lineHeight: 1.2 }}>+{sh.acBonus} RK (Schild)</div>
            <div style={{ fontSize: '6.5px', color: 'var(--inkm)', lineHeight: 1 }}>Malus: -{sh.checkPenalty ?? 0}</div>
          </div>
        );
      }

      // Waffe in Nebenhand
      const seq = AttackEngine.calculateAttackSequence(pc, w, false, {
        isOffhandAttack: true,
        smite: pc.isSmiteActive,
        favoredEnemy: pc.isFavoredEnemyActive,
        sneakAttack: pc.isSneakAttacking
      });
      const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
      const hasImprovedCritical = pc.feats && pc.feats.some((f: any) => 
        (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
        matchesFeatOption(w, f.option)
      );
      const isDoubleThreat = w.isKeen || hasImprovedCritical;
      const doubledCritDisplay = getCritThreatDisplay(w.crit, isDoubleThreat);
      const dmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : (w.damage || '1w6');
      const extraDamage = w.extraDamage ? ` + ${w.extraDamage}` : '';
      const offhandLabel = isDoubleWielded ? 'Nebenhand (Nebenseite)' : 'Nebenhand';

      return (
        <div className={`arpg-slot off-hand-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
          <button className="unequip-slot-btn" onClick={() => CombatState.togglePCWeaponEquip(pc.weapons.indexOf(w))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Ablegen">✕</button>
          <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", marginBottom: '1px', opacity: 0.8 }}>{offhandLabel}</div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={isDoubleWielded ? w.name + ' (Nebenseite)' : w.name}>
            {isDoubleWielded ? w.name + ' (Nebenseite)' : w.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '1px 0 3px' }}>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={`${dmgDice}${extraDamage} • ${doubledCritDisplay}`}>{dmgDice}{extraDamage} • {doubledCritDisplay}</div>
            {!isDoubleWielded && w.grip !== '2h' && w.grip !== '2H' && (
              <select
                className="cinput weapon-hand-select"
                value="off"
                onChange={(e) => handleHandSelectChange(pc.weapons.indexOf(w), e.target.value)}
                style={{ fontSize: '7px', padding: '0 1px', height: '12px', lineHeight: 1, borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none', background: 'white', color: 'var(--ink)', marginTop: '1px', cursor: 'pointer' }}
              >
                <option value="main">Haupthand</option>
                <option value="off">Nebenhand</option>
              </select>
            )}
          </div>
          <div style={{ display: 'flex', gap: '2px', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <button className="xbtn xbtn-dmg roll-atk-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollAttack(w, true, e)} style={{ padding: '1px 2px', fontSize: '6.5px', fontWeight: 'bold', flex: 1, whiteSpace: 'nowrap', height: '15px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }} title="Angriff ausführen">
              ATK ({formatMod(stdAtkObj.atkTotal)}) 🎲
            </button>
            <button className="xbtn xbtn-heal roll-dmg-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollDamage(w, true, e)} style={{ padding: '1px 2px', fontSize: '6.5px', fontWeight: 'bold', flex: 1, borderColor: '#2a6a2a', color: '#1a4a1a', whiteSpace: 'nowrap', height: '15px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }}>
              DMG ({formatMod(stdAtkObj.dmgTotal)})
            </button>
          </div>
        </div>
      );
    }

    // armor
    const a = equippedArmor;
    const rStyle = getRarityStyle(a ? a.enhancement : 0);
    if (!a) {
      return (
        <div className="arpg-slot armor-slot" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: '0.5px solid var(--pb)', borderRadius: '4px', padding: '5px 6px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--inkl)', marginBottom: '1px', opacity: 0.6 }}>👕</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif" }}>Rüstung</div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic' }}>(Keine)</div>
        </div>
      );
    }

    const maxDexDisplay = a.maxDex !== null && a.maxDex !== undefined ? a.maxDex : '—';
    return (
      <div className={`arpg-slot armor-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
        <button className="unequip-slot-btn" onClick={() => CombatState.togglePCArmorEquip(pc.armors.indexOf(a))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Ablegen">✕</button>
        <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", marginBottom: '1px', opacity: 0.8 }}>Rüstung</div>
        <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={a.name}>{a.name}</div>
        <div style={{ fontSize: '7.5px', color: 'var(--inkm)', marginTop: '2px', lineHeight: 1.2 }}>+{a.acBonus} RK</div>
        <div style={{ fontSize: '6.5px', color: 'var(--inkm)', lineHeight: 1 }}>Dex-Lim: {maxDexDisplay} | Malus: -{a.checkPenalty ?? 0}</div>
      </div>
    );
  };

  if (pc.activeShape !== 'none') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ background: 'rgba(200, 169, 110, 0.04)', border: '0.5px solid var(--pb)', borderRadius: '4px', padding: '8px 10px', textAlign: 'center', fontStyle: 'italic', color: 'var(--inkl)', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', marginBottom: '8px' }}>
          In wilder Gestalt (Wild Shape) ist deine normale Ausrüstung inaktiv. Verwende deine natürlichen Waffen.
        </div>
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--inkl)', paddingBottom: '2px', borderBottom: '0.5px solid var(--pb)', marginBottom: '4px', fontWeight: 'bold' }}>
          🐾 Natürliche Angriffe (Wild Shape)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {(SHAPE_ATTACKS[pc.activeShape] || []).map((atk: any, idx: number) => {
            const w = {
              name:        atk.name,
              damageDice:  atk.damageDice,
              damage:      atk.damageDice,
              enhancement: 0,
              attackBonus: 0,
              isNatural:   true,
              isSecondary: atk.isSecondary,
              grip:        'unarmed',
              crit:        '20 / x2',
              type:        'unarmed'
            };
            const seq = AttackEngine.calculateAttackSequence(pc, w, false, {
              smite: pc.isSmiteActive,
              favoredEnemy: pc.isFavoredEnemyActive,
              sneakAttack: pc.isSneakAttacking
            });
            const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0 };
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 6px', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', borderRadius: '2px', fontSize: '8.5px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--red)' }}>{w.name}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="xbtn xbtn-dmg" onClick={(e) => handleRollAttack(w, false, e)} style={{ fontSize: '7.5px', padding: '2px 4px' }}>ATK ({formatMod(stdAtkObj.atkTotal)}) 🎲</button>
                  <button className="xbtn xbtn-heal" onClick={(e) => handleRollDamage(w, false, e)} style={{ fontSize: '7.5px', padding: '2px 4px', borderColor: '#2a6a2a', color: '#1a4a1a' }}>DMG ({w.damage})</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '6px', background: 'rgba(200, 169, 110, 0.04)', border: '0.5px solid var(--pb)', borderRadius: '4px' }}>
      {renderActiveSlot('main')}
      {renderActiveSlot('armor')}
      {renderActiveSlot('off')}
    </div>
  );
};
