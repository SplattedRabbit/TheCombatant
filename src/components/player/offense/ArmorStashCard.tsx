/**
 * @module    ArmorStashCard
 * @summary   Renders a single armor or shield in the inventory with clean text display and an Edit button opening ArmorEditorModal.
 * @exports   ArmorStashCard
 */

import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { ARMOR_REGISTRY } from '@core/data/armor-data.js';
import { ArmorEditorModal } from '../../dialogs/modals/ArmorEditorModal.tsx';

interface ArmorStashCardProps {
  a: any;
  idx: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  getRarityStyle: (enhancement: number) => { border: string; background: string; boxShadow: string; glowClass: string };
  handleArmorEquipToggle: (idx: number, a: any) => void;
}

export const ArmorStashCard: React.FC<ArmorStashCardProps> = ({
  a,
  idx,
  getRarityStyle,
  handleArmorEquipToggle
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const rStyle = getRarityStyle(a.enhancement);
  const typeDef = ARMOR_REGISTRY[a.type] || {};
  const typeName = typeDef.nameEn || typeDef.name || a.type || 'Armor';
  const totalAC = (a.armorBonus !== undefined ? a.armorBonus : (typeDef.armorBonus || 0)) + (parseInt(a.enhancement) || 0);

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
          marginTop: a.isEquipped ? '6px' : 0
        }}
      >
        {a.isEquipped && (
          <span style={{ position: 'absolute', top: '-6px', left: '8px', fontSize: '6px', color: '#ffffff', background: '#2a6a2a', borderRadius: '2px', padding: '1px 4px', fontFamily: 'var(--font-title)', fontWeight: 'bold', zIndex: 10 }}>Equipped</span>
        )}

        {/* Top row: Name, Type Tag & Delete button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <span style={{ fontWeight: 'bold', fontSize: '11px', fontFamily: 'var(--font-title)', color: 'var(--ink)' }}>
              {a.name || typeName}
            </span>
            {a.enhancement > 0 && (
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', background: 'rgba(139, 26, 26, 0.08)', padding: '0 4px', borderRadius: '2px' }}>
                +{a.enhancement}
              </span>
            )}
            <span style={{ fontSize: '8px', color: 'var(--inkm)', background: 'rgba(200, 169, 110, 0.15)', padding: '1px 5px', borderRadius: '3px' }}>
              {typeName} (+{totalAC} AC)
            </span>
          </div>

          <button
            type="button"
            onClick={() => CombatState.removePCArmor(idx)}
            title="Delete armor"
            style={{ border: 'none', background: 'transparent', fontSize: '11px', cursor: 'pointer', height: '18px', width: '18px', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Bottom row: Stats summary, Equip & Edit button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8px', color: 'var(--inkl)' }}>
            <span>MaxDex: {typeDef.maxDex !== null && typeDef.maxDex !== undefined ? `+${typeDef.maxDex}` : '—'}</span>
            <span>ACP: {typeDef.checkPenalty || 0}</span>
            <span>Fail: {typeDef.spellFailure || 0}%</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => handleArmorEquipToggle(idx, a)}
              style={{
                padding: '0 8px',
                fontSize: '8px',
                fontWeight: 'bold',
                fontFamily: 'var(--font-title)',
                height: '20px',
                lineHeight: 1,
                borderRadius: '2px',
                background: a.isEquipped ? 'rgba(200, 169, 110, 0.15)' : 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                border: a.isEquipped ? '0.5px solid var(--pb)' : '0.5px solid #8b6914',
                color: a.isEquipped ? 'var(--ink)' : '#ffffff',
                cursor: 'pointer'
              }}
            >
              {a.isEquipped ? 'Unequip' : '⚡ Equip'}
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
        <ArmorEditorModal
          armor={a}
          onSave={(updatedArmor) => CombatState.updatePCArmorField(idx, updatedArmor)}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};
