/**
 * @module    ArmorSlot
 * @summary   Renders the Body Armor ARPG tactical slot with armor details, AC contribution, MaxDex/ACP/Spell Failure badges, and quick unequip.
 * @exports   ArmorSlot
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { ARMOR_REGISTRY } from '@core/data/armor-data.js';

export interface ArmorSlotProps {
  pc: any;
  equippedArmor: any;
  getRarityStyle: (enhancement: number) => { border: string; background: string; boxShadow: string; glowClass: string };
  onOpenArmorStash?: () => void;
}

export const ArmorSlot: React.FC<ArmorSlotProps> = ({
  pc,
  equippedArmor,
  getRarityStyle,
  onOpenArmorStash,
}) => {
  const arm = equippedArmor;
  const rStyle = getRarityStyle(arm ? arm.enhancement : 0);

  if (!arm) {
    return (
      <div
        className="arpg-slot armor-slot"
        onClick={onOpenArmorStash}
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
          cursor: onOpenArmorStash ? 'pointer' : 'default',
        }}
        title={onOpenArmorStash ? 'Click to open Armor & Shield Stash' : undefined}
      >
        <div style={{ fontSize: '14px', color: 'var(--inkl)', marginBottom: '1px', opacity: 0.6 }}>🥋</div>
        <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-title)' }}>
          Body Armor
        </div>
        <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic' }}>(Unarmored)</div>
      </div>
    );
  }

  const typeDef = ARMOR_REGISTRY[arm.type] || {};
  const baseName = arm.name || typeDef.nameEn || typeDef.name || arm.type || 'Armor';
  const totalAC = (arm.armorBonus !== undefined ? arm.armorBonus : (typeDef.armorBonus || 0)) + (parseInt(arm.enhancement) || 0);
  const maxDex = arm.maxDex !== undefined ? arm.maxDex : typeDef.maxDex;
  const checkPenalty = arm.checkPenalty !== undefined ? arm.checkPenalty : (typeDef.checkPenalty || 0);
  const spellFailure = arm.spellFailure !== undefined ? arm.spellFailure : (typeDef.spellFailure || 0);
  const speedCategory = arm.speedCategory || typeDef.speedCategory || 'light';

  const armorsList = Array.isArray(pc.armors) ? pc.armors : [];
  const armorIdx = armorsList.indexOf(arm);

  return (
    <div
      className={`arpg-slot armor-slot ${rStyle.glowClass}`}
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
      {/* Unequip button */}
      <button
        type="button"
        className="unequip-slot-btn"
        onClick={() => {
          if (armorIdx >= 0) {
            CombatState.togglePCArmorEquip(armorIdx);
          }
        }}
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
        title="Unequip body armor"
      >
        ✕
      </button>

      {/* Zone 1: Slot Label */}
      <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-title)', opacity: 0.9 }}>
        🥋 Body Armor
      </div>

      {/* Zone 2: Title */}
      <div
        style={{
          fontFamily: 'var(--font-title)',
          fontSize: '9.5px',
          fontWeight: 'bold',
          color: 'var(--red)',
          textShadow: '0 0 1px rgba(139,26,26,0.1)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          width: '100%',
        }}
        title={baseName}
      >
        {baseName}
        {arm.enhancement > 0 && (
          <span style={{ fontSize: '7px', fontWeight: 'bold', marginLeft: '3px', color: 'var(--red)' }}>
            +{arm.enhancement}
          </span>
        )}
      </div>

      {/* Zone 3: Badges */}
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center', justifyContent: 'center', margin: '1px 0' }}>
        <span
          style={{
            fontSize: '7.5px',
            fontFamily: 'var(--font-title)',
            fontWeight: 'bold',
            color: 'var(--ink)',
            background: 'rgba(200, 169, 110, 0.2)',
            border: '0.5px solid var(--pb)',
            borderRadius: '2px',
            padding: '0 4px',
          }}
        >
          +{totalAC} AC
        </span>
        <span
          style={{
            fontSize: '6.5px',
            fontFamily: 'var(--font-title)',
            textTransform: 'uppercase',
            color: 'var(--inkm)',
            background: 'rgba(0,0,0,0.04)',
            borderRadius: '2px',
            padding: '0 3px',
          }}
        >
          {speedCategory}
        </span>
      </div>

      {/* Zone 4: Middle Tactical Details */}
      <div style={{ fontSize: '6px', color: 'var(--inkm)', padding: '1px 0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        <span>MaxDex: {maxDex !== null && maxDex !== undefined ? `+${maxDex}` : '—'} • ACP {checkPenalty > 0 ? `-${checkPenalty}` : '0'}{spellFailure > 0 ? ` • Fail ${spellFailure}%` : ''}</span>
      </div>

      {/* Zone 5: Bottom Action Row (18px aligned) */}
      <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
        <div
          style={{
            flex: 1,
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '7.5px',
            fontWeight: 'bold',
            color: 'var(--ink)',
            background: 'rgba(200, 169, 110, 0.15)',
            border: '0.5px solid var(--pb)',
            borderRadius: '2px',
            lineHeight: 1,
          }}
          title="Armor Contribution to Armor Class"
        >
          🛡️ +{totalAC} AC
        </div>
        <div
          style={{
            flex: 1,
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '7.5px',
            fontWeight: 'bold',
            color: 'var(--ink)',
            background: 'rgba(0,0,0,0.03)',
            border: '0.5px solid var(--pb)',
            borderRadius: '2px',
            lineHeight: 1,
          }}
          title={speedCategory === 'heavy' ? 'Heavy armor: Speed reduced, Run restricted to ×3' : speedCategory === 'medium' ? 'Medium armor: Speed reduced' : 'Light armor: Full movement speed'}
        >
          🏃 {pc.speed ?? 30} ft
        </div>
      </div>
    </div>
  );
};
