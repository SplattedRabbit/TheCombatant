/**
 * @module    WeaponStashCard
 * @summary   Rendert eine einzelne Waffe im Rucksack/Inventar inklusive Detail-Drawer (Einstellungen für Keen, Zusatzschaden, etc.).
 * @exports   WeaponStashCard
 * @reads     none (all details read from props w and pc)
 * @stateOps  updatePCWeapon, deletePCWeapon
 * @depends   React, @core/state.js, @core/models/Weapon.js
 * @notHere   Ausrüstungsslots -> ActiveEquipmentSlots.tsx | Rüstungsliste -> ArmorStashCard.tsx
 */

import React from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { WeaponRegistry } from '@core/models/Weapon.js';

interface WeaponStashCardProps {
  w: any;
  idx: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  getRarityStyle: (enhancement: number) => { border: string; background: string; boxShadow: string; glowClass: string };
  handleHandSelectChange: (idx: number, val: string) => void;
  handleWeaponEquipToggle: (idx: number, w: any) => void;
}

export const WeaponStashCard: React.FC<WeaponStashCardProps> = ({
  w,
  idx,
  isExpanded,
  onToggleExpand,
  getRarityStyle,
  handleHandSelectChange,
  handleWeaponEquipToggle
}) => {
  const rStyle = getRarityStyle(w.enhancement);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
      <div
        className={`stash-item-card ${rStyle.glowClass}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          border: rStyle.border,
          borderRadius: '4px',
          padding: '5px 6px',
          background: rStyle.background,
          boxShadow: rStyle.boxShadow,
          position: 'relative',
          marginTop: w.isEquipped ? '6px' : 0
        }}
      >
        {w.isEquipped && (
          <span style={{ position: 'absolute', top: '-6px', left: '8px', fontSize: '6px', color: '#ffffff', background: '#2a6a2a', borderRadius: '2px', padding: '1px 4px', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', zIndex: 10 }}>Ausgerüstet</span>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <input
            type="text"
            value={w.name}
            onChange={(e) => CombatState.updatePCWeapon(idx, 'name', e.target.value)}
            className="cinput"
            placeholder="Name"
            style={{ fontSize: '9px', height: '18px', padding: '0 4px', flex: 1, fontWeight: 'bold', borderColor: 'rgba(200, 169, 110, 0.25)' }}
          />
          <button
            onClick={() => CombatState.deletePCWeapon(idx)}
            style={{ border: 'none', background: 'transparent', fontSize: '10px', cursor: 'pointer', height: '18px', width: '18px', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <select
            value={w.type}
            onChange={(e) => CombatState.updatePCWeapon(idx, 'type', e.target.value)}
            className="cinput"
            style={{ fontSize: '7.5px', padding: '0 2px', height: '16px', flex: 1.2, cursor: 'pointer' }}
          >
            {Object.values(WeaponRegistry).map((def: any) => (
              <option key={def.key} value={def.key}>{def.nameDe}</option>
            ))}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1px', flex: 0.6 }}>
            <span style={{ fontSize: '7.5px', color: 'var(--inkm)' }}>+</span>
            <input
              type="number"
              value={w.enhancement}
              onChange={(e) => CombatState.updatePCWeapon(idx, 'enhancement', parseInt(e.target.value) || 0)}
              className="cinput"
              style={{ fontSize: '8px', height: '16px', width: '20px', padding: 0, textAlign: 'center' }}
            />
          </div>
          {w.grip === '2h' || w.grip === '2H' ? (
            <select className="cinput" disabled style={{ fontSize: '7.5px', height: '16px', flex: 1.1, opacity: 0.65, background: 'rgba(200,169,110,0.05)', textAlign: 'center' }}>
              <option>Zweihändig</option>
            </select>
          ) : w.grip === 'rng' ? (
            <select className="cinput" disabled style={{ fontSize: '7.5px', height: '16px', flex: 1.1, opacity: 0.65, background: 'rgba(200,169,110,0.05)', textAlign: 'center' }}>
              <option>Fernkampf</option>
            </select>
          ) : (
            <select
              value={w.hand || 'main'}
              onChange={(e) => handleHandSelectChange(idx, e.target.value)}
              className="cinput"
              style={{ fontSize: '7.5px', padding: '0 1px', height: '16px', flex: 1.1, cursor: 'pointer' }}
            >
              <option value="main">Haupthand</option>
              <option value="off">Nebenhand</option>
            </select>
          )}
          <button
            className="xbtn equip-btn"
            onClick={() => handleWeaponEquipToggle(idx, w)}
            style={{ padding: '0 6px', fontSize: '7.5px', fontWeight: 'bold', height: '16px', borderRadius: '2px' }}
          >
            {w.isEquipped ? 'Ablegen' : 'Anlegen'}
          </button>
          <button
            className="xbtn"
            onClick={onToggleExpand}
            style={{ padding: 0, border: 'none', background: 'transparent', fontSize: '11px', cursor: 'pointer', height: '16px', width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--inkm)' }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Weapon Detail Drawer */}
      {isExpanded && (
        <div style={{ display: 'flex', background: 'rgba(200,169,110,0.02)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderTop: 'none', padding: '4px 6px', fontSize: '8px', marginTop: '-2px', marginBottom: '2px', borderRadius: '0 0 3px 3px', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ color: 'var(--inkl)' }}>Zusatz-Atk:</span>
              <input
                type="text"
                value={w.attackBonus || ''}
                onChange={(e) => CombatState.updatePCWeapon(idx, 'attackBonus', e.target.value)}
                className="cinput"
                placeholder="+0"
                style={{ width: '32px', fontSize: '8px', height: '14px', textAlign: 'center', padding: 0 }}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', color: 'var(--inkm)', margin: 0 }}>
              <input
                type="checkbox"
                checked={w.isKeen || false}
                onChange={(e) => CombatState.updatePCWeapon(idx, 'isKeen', e.target.checked)}
                style={{ margin: 0, width: '10px', height: '10px' }}
              />
              Scharf (Keen)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1, minWidth: '150px' }}>
              <span style={{ color: 'var(--inkl)', flexShrink: 0 }}>Zusatz-Schaden:</span>
              <select
                value={w.extraDamageDice || ''}
                onChange={(e) => CombatState.updatePCWeapon(idx, 'extraDamageDice', e.target.value)}
                className="cinput"
                style={{ fontSize: '7.5px', height: '14px', padding: '0 1px', width: '45px', flexShrink: 0, cursor: 'pointer' }}
              >
                <option value="">Kein</option>
                {['1w2', '1w3', '1w4', '1w6', '1w8', '1w10', '1w12', '2w4', '2w6', '2w8', '2w10', '3w6', '3w8', '4w6'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={w.extraDamageType || ''}
                onChange={(e) => CombatState.updatePCWeapon(idx, 'extraDamageType', e.target.value)}
                className="cinput"
                style={{ fontSize: '7.5px', height: '14px', padding: '0 1px', flex: 1, minWidth: 0, cursor: 'pointer' }}
              >
                <option value="">—</option>
                {['Feuer', 'Kälte', 'Elektrizität', 'Säure', 'Schall', 'Wucht', 'Stich', 'Schnitt', 'Kraft', 'Gottgeweiht'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ color: 'var(--inkl)' }}>Grip-Abw.:</span>
              <select
                value={w.gripOverride || ''}
                onChange={(e) => CombatState.updatePCWeapon(idx, 'gripOverride', e.target.value)}
                className="cinput"
                style={{ fontSize: '7.5px', height: '14px', padding: '0 1px', cursor: 'pointer' }}
              >
                <option value="">Standard</option>
                <option value="1h">1-Hand</option>
                <option value="2h">2-Hand</option>
                <option value="sec">Schildh</option>
                <option value="rng">Fernk</option>
                <option value="unarmed">Waffenlos</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ color: 'var(--inkl)' }}>Schadens-Abw.:</span>
              <select
                value={w.damageDiceOverride || ''}
                onChange={(e) => CombatState.updatePCWeapon(idx, 'damageDiceOverride', e.target.value)}
                className="cinput"
                style={{ fontSize: '7.5px', height: '14px', padding: '0 1px', cursor: 'pointer' }}
              >
                <option value="">Standard</option>
                {['1w2', '1w3', '1w4', '1w6', '1w8', '1w10', '1w12', '2w4', '2w6', '2w8', '2w10', '3w6', '3w8', '4w6'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ color: 'var(--inkl)' }}>Krit-Abw.:</span>
              <input
                type="text"
                value={w.critOverride || ''}
                onChange={(e) => CombatState.updatePCWeapon(idx, 'critOverride', e.target.value)}
                className="cinput"
                placeholder="Standard"
                style={{ width: '70px', fontSize: '8px', height: '14px', textAlign: 'center', padding: 0 }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
