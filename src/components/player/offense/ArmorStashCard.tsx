/**
 * @module    ArmorStashCard
 * @summary   Renders a single armor/shield in the inventory including detail drawer (settings for AC override, MaxDex, checkPenalty etc.).
 * @exports   ArmorStashCard
 * @reads     none (all details read from props a)
 * @stateOps  updatePCArmorField, removePCArmor
 * @depends   React, @core/state.js, @core/data/armor-data.js
 * @notHere   Ausrüstungsslots -> ActiveEquipmentSlots.tsx | Waffenliste -> WeaponStashCard.tsx
 */

import React from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { ARMOR_REGISTRY } from '@core/data/armor-data.js';

interface ArmorStashCardProps {
  a: any;
  idx: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  getRarityStyle: (enhancement: number) => { border: string; background: string; boxShadow: string; glowClass: string };
  handleArmorEquipToggle: (idx: number, a: any) => void;
}

export const ArmorStashCard: React.FC<ArmorStashCardProps> = ({
  a,
  idx,
  isExpanded,
  onToggleExpand,
  getRarityStyle,
  handleArmorEquipToggle
}) => {
  const rStyle = getRarityStyle(a.enhancement);

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
          marginTop: a.isEquipped ? '6px' : 0
        }}
      >
        {a.isEquipped && (
          <span style={{ position: 'absolute', top: '-6px', left: '8px', fontSize: '6px', color: '#ffffff', background: '#2a6a2a', borderRadius: '2px', padding: '1px 4px', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', zIndex: 10 }}>Equipped</span>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <input
            type="text"
            value={a.name}
            onChange={(e) => CombatState.updatePCArmorField(idx, 'name', e.target.value)}
            className="cinput"
            placeholder="Name"
            style={{ fontSize: '9px', height: '18px', padding: '0 4px', flex: 1, fontWeight: 'bold', borderColor: 'rgba(200, 169, 110, 0.25)' }}
          />
          <button
            onClick={() => CombatState.removePCArmor(idx)}
            style={{ border: 'none', background: 'transparent', fontSize: '10px', cursor: 'pointer', height: '18px', width: '18px', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <select
            value={a.type}
            onChange={(e) => CombatState.updatePCArmorField(idx, 'type', e.target.value)}
            className="cinput"
            style={{ fontSize: '7.5px', padding: '0 2px', height: '16px', flex: 1.2, cursor: 'pointer' }}
          >
            {Object.values(ARMOR_REGISTRY).map((def: any) => (
              <option key={def.key} value={def.key}>{def.nameEn || def.nameDe}</option>
            ))}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 0.8 }}>
            <span style={{ fontSize: '7.5px', color: 'var(--inkm)' }}>+</span>
            <input
              type="number"
              value={a.enhancement}
              onChange={(e) => CombatState.updatePCArmorField(idx, 'enhancement', parseInt(e.target.value) || 0)}
              className="cinput"
              style={{ fontSize: '8px', height: '16px', width: '22px', padding: 0, textAlign: 'center' }}
            />
          </div>
          <button
            className="xbtn equip-btn"
            onClick={() => handleArmorEquipToggle(idx, a)}
            style={{ padding: '0 6px', fontSize: '7.5px', fontWeight: 'bold', height: '16px', borderRadius: '2px' }}
          >
            {a.isEquipped ? 'Unequip' : 'Equip'}
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

      {/* Armor Detail Drawer */}
      {isExpanded && (
        <div style={{ display: 'flex', background: 'rgba(200,169,110,0.02)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderTop: 'none', padding: '4px 6px', fontSize: '8px', marginTop: '-2px', marginBottom: '2px', borderRadius: '0 0 3px 3px', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ color: 'var(--inkl)' }}>AC Override:</span>
              <input
                type="text"
                value={a.armorBonusOverride || ''}
                onChange={(e) => CombatState.updatePCArmorField(idx, 'armorBonusOverride', e.target.value)}
                className="cinput"
                placeholder="Default"
                style={{ width: '45px', fontSize: '8px', height: '14px', textAlign: 'center', padding: 0 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ color: 'var(--inkl)' }}>MaxDex Override:</span>
              <input
                type="text"
                value={a.maxDexOverride || ''}
                onChange={(e) => CombatState.updatePCArmorField(idx, 'maxDexOverride', e.target.value)}
                className="cinput"
                placeholder="Default"
                style={{ width: '45px', fontSize: '8px', height: '14px', textAlign: 'center', padding: 0 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ color: 'var(--inkl)' }}>ACP Override:</span>
              <input
                type="text"
                value={a.checkPenaltyOverride || ''}
                onChange={(e) => CombatState.updatePCArmorField(idx, 'checkPenaltyOverride', e.target.value)}
                className="cinput"
                placeholder="Default"
                style={{ width: '45px', fontSize: '8px', height: '14px', textAlign: 'center', padding: 0 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ color: 'var(--inkl)' }}>Spell Failure Override:</span>
              <input
                type="text"
                value={a.spellFailureOverride || ''}
                onChange={(e) => CombatState.updatePCArmorField(idx, 'spellFailureOverride', e.target.value)}
                className="cinput"
                placeholder="Default"
                style={{ width: '45px', fontSize: '8px', height: '14px', textAlign: 'center', padding: 0 }}
              />
              <span style={{ color: 'var(--inkm)' }}>%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
