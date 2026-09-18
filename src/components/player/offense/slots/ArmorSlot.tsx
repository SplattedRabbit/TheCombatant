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

      {/* Top section: Icon, Name & Enhancement */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '1px' }}>
          <span style={{ fontSize: '11px' }}>🥋</span>
          <span
            style={{
              fontSize: '8px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              color: 'var(--red)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '95px',
            }}
            title={baseName}
          >
            {baseName}
          </span>
          {arm.enhancement > 0 && (
            <span style={{ fontSize: '7px', fontWeight: 'bold', color: 'var(--red)', background: 'rgba(139, 26, 26, 0.08)', padding: '0 3px', borderRadius: '2px' }}>
              +{arm.enhancement}
            </span>
          )}
        </div>

        {/* AC Bonus Badge */}
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
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
      </div>

      {/* Bottom section: Tactical parameters (MaxDex, ACP, Spell Failure) */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2px',
          fontSize: '6.5px',
          fontFamily: 'var(--font-body)',
          color: 'var(--inkm)',
          borderTop: '0.5px dashed rgba(200, 169, 110, 0.35)',
          paddingTop: '3px',
          marginTop: '3px',
        }}
      >
        <div title="Max Dexterity Bonus">
          <span style={{ display: 'block', fontSize: '5.5px', color: 'var(--inkl)', textTransform: 'uppercase' }}>MaxDex</span>
          <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>{maxDex !== null && maxDex !== undefined ? `+${maxDex}` : '—'}</span>
        </div>
        <div title="Armor Check Penalty">
          <span style={{ display: 'block', fontSize: '5.5px', color: 'var(--inkl)', textTransform: 'uppercase' }}>ACP</span>
          <span style={{ fontWeight: 'bold', color: checkPenalty < 0 ? 'var(--red)' : 'var(--ink)' }}>{checkPenalty}</span>
        </div>
        <div title="Arcane Spell Failure">
          <span style={{ display: 'block', fontSize: '5.5px', color: 'var(--inkl)', textTransform: 'uppercase' }}>Fail</span>
          <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>{spellFailure}%</span>
        </div>
      </div>
    </div>
  );
};
