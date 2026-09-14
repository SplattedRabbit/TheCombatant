/**
 * @module    WeaponStashCard
 * @summary   Renders a single weapon in the inventory with clean text display and an Edit button opening WeaponEditorModal.
 * @exports   WeaponStashCard
 */

import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { WeaponRegistry } from '@core/models/Weapon.js';
import { WeaponEditorModal } from '../../dialogs/modals/WeaponEditorModal.tsx';

function isWeaponTwoHanded(w: any): boolean {
  if (!w) return false;
  const def = WeaponRegistry[w.type] || {};
  const isTwoHandedRanged = w.grip === 'rng' && (def.isBow || def.isComposite || w.type === 'light_crossbow' || w.type === 'heavy_crossbow' || w.type === 'other_ranged');
  return w.grip === '2h' || w.grip === '2H' || isTwoHandedRanged;
}

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
  getRarityStyle,
  handleHandSelectChange,
  handleWeaponEquipToggle
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const rStyle = getRarityStyle(w.enhancement);
  const typeDef = WeaponRegistry[w.type] || {};
  const typeName = typeDef.nameEn || typeDef.name || w.type || 'Weapon';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
      <div
        className={`stash-item-card ${rStyle.glowClass}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          border: rStyle.border,
          borderRadius: '4px',
          padding: '6px 8px',
          background: rStyle.background,
          boxShadow: rStyle.boxShadow,
          position: 'relative',
          marginTop: w.isEquipped ? '6px' : 0
        }}
      >
        {w.isEquipped && (
          <span style={{ position: 'absolute', top: '-6px', left: '8px', fontSize: '6px', color: '#ffffff', background: '#2a6a2a', borderRadius: '2px', padding: '1px 4px', fontFamily: 'var(--font-title)', fontWeight: 'bold', zIndex: 10 }}>Equipped</span>
        )}

        {/* Top row: Name, Type Tag, and Delete button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <span style={{ fontWeight: 'bold', fontSize: '11px', fontFamily: 'var(--font-title)', color: 'var(--ink)' }}>
              {w.name || typeName}
            </span>
            {w.enhancement > 0 && (
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', background: 'rgba(139, 26, 26, 0.08)', padding: '0 4px', borderRadius: '2px' }}>
                +{w.enhancement}
              </span>
            )}
            <span style={{ fontSize: '8px', color: 'var(--inkm)', background: 'rgba(200, 169, 110, 0.15)', padding: '1px 5px', borderRadius: '3px' }}>
              {typeName} ({w.damageDice || typeDef.damageDice || '1w8'}, {w.crit || typeDef.crit || '20/x2'})
            </span>
          </div>

          <button
            type="button"
            onClick={() => CombatState.deletePCWeapon(idx)}
            title="Delete weapon"
            style={{ border: 'none', background: 'transparent', fontSize: '11px', cursor: 'pointer', height: '18px', width: '18px', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Bottom row: Grip / Hand, Equip, and Edit button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isWeaponTwoHanded(w) ? (
              <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic' }}>
                {w.grip === 'rng' ? '🏹 Ranged (2H)' : '⚔️ Two-Handed'}
              </span>
            ) : (
              <select
                value={w.hand || 'main'}
                onChange={(e) => handleHandSelectChange(idx, e.target.value)}
                className="cinput"
                style={{ fontSize: '7.5px', padding: '0 2px', height: '18px', cursor: 'pointer' }}
              >
                <option value="main">Main Hand</option>
                <option value="off">Off-Hand</option>
              </select>
            )}

            {w.isKeen && (
              <span style={{ fontSize: '7px', color: '#8b6914', background: 'rgba(200, 169, 110, 0.2)', padding: '1px 4px', borderRadius: '2px', fontWeight: 'bold' }}>
                KEEN
              </span>
            )}

            {w.extraDamage && (
              <span style={{ fontSize: '7px', color: 'var(--red)', background: 'rgba(139, 26, 26, 0.08)', padding: '1px 4px', borderRadius: '2px' }}>
                +{w.extraDamage}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => handleWeaponEquipToggle(idx, w)}
              style={{
                padding: '0 8px',
                fontSize: '8px',
                fontWeight: 'bold',
                fontFamily: 'var(--font-title)',
                height: '20px',
                lineHeight: 1,
                borderRadius: '2px',
                background: w.isEquipped ? 'rgba(200, 169, 110, 0.15)' : 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                border: w.isEquipped ? '0.5px solid var(--pb)' : '0.5px solid #8b6914',
                color: w.isEquipped ? 'var(--ink)' : '#ffffff',
                cursor: 'pointer'
              }}
            >
              {w.isEquipped ? 'Unequip' : '⚡ Equip'}
            </button>

            <button
              type="button"
              className="xbtn"
              onClick={() => setIsEditorOpen(true)}
              style={{
                fontSize: '8px',
                padding: '2px 6px',
                height: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                cursor: 'pointer',
                fontFamily: 'var(--font-title)'
              }}
            >
              ⚙️ Edit
            </button>
          </div>
        </div>
      </div>

      {isEditorOpen && (
        <WeaponEditorModal
          weapon={w}
          onSave={(updatedWeapon) => CombatState.updatePCWeapon(idx, updatedWeapon)}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};
