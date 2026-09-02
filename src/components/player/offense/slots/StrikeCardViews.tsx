/**
 * @module    StrikeCardViews
 * @summary   Individual visual card renderers for tactical strikes (Smite, Sneak, Duskblade, Scout, Ninja, Ranger).
 */

import React from 'react';

interface StrikeCardBaseProps {
  pc: any;
  w: any;
  formatMod: (val: number) => string;
  selectorDropdown?: React.ReactNode;
  handleRollAttack: (w: any, isOffhand: boolean, e: React.MouseEvent, customOptions?: any) => void;
  handleRollDamage: (w: any, isOffhand: boolean, e: React.MouseEvent, customOptions?: any) => void;
}

export const SmiteStrikeCard: React.FC<StrikeCardBaseProps & {
  smiteTitle: string;
  hasChargingSmite: boolean;
  stdSmite: any;
  chaMod: number;
  smiteDmgText: string;
  smiteMax: number;
  smiteUsed: number;
}> = ({
  pc,
  w,
  formatMod,
  selectorDropdown,
  handleRollAttack,
  handleRollDamage,
  smiteTitle,
  hasChargingSmite,
  stdSmite,
  chaMod,
  smiteDmgText,
  smiteMax,
  smiteUsed,
}) => (
  <div
    className="arpg-slot class-ability-slot rarity-epic"
    style={{
      position: 'relative',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '88px',
      border: '1px solid var(--red)',
      borderRadius: '4px',
      padding: '5px 6px',
      textAlign: 'center',
      background: 'rgba(139, 26, 26, 0.08)',
      boxShadow: '0 0 8px rgba(139, 26, 26, 0.2)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div style={{ fontSize: '6.5px', color: 'var(--red)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-title)', opacity: 0.9 }}>
        {hasChargingSmite ? '⚡ ACF Strike' : '🌟 Class Strike'}
      </div>
      {selectorDropdown}
    </div>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={smiteTitle}>
      {smiteTitle}
    </div>
    <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
      +{Math.max(0, chaMod)} Atk / {smiteDmgText} Dmg
    </div>

    {/* Charge Bubbles */}
    <div style={{ display: 'flex', gap: '2px', margin: '1px 0' }}>
      {Array.from({ length: Math.min(6, smiteMax) }).map((_, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            border: '1px solid var(--red)',
            background: i < smiteUsed ? 'var(--red)' : 'transparent',
          }}
          title={i < smiteUsed ? 'Expended' : 'Ready'}
        />
      ))}
    </div>

    <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
      <button
        className="xbtn xbtn-atk"
        disabled={pc.isTotalDefense}
        onClick={(e) => handleRollAttack(w, false, e, { smite: true })}
        style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
        title={`Roll Smite Attack (${formatMod(stdSmite.atkTotal)})`}
      >
        ATK {formatMod(stdSmite.atkTotal)}
      </button>
      <button
        className="xbtn xbtn-dmg"
        disabled={pc.isTotalDefense}
        onClick={(e) => handleRollDamage(w, false, e, { smite: true })}
        style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
        title={`Roll Smite Damage (${stdSmite.damageDice} ${formatMod(stdSmite.dmgTotal)})`}
      >
        DMG {formatMod(stdSmite.dmgTotal)}
      </button>
    </div>
  </div>
);

export const SneakStrikeCard: React.FC<StrikeCardBaseProps & {
  sneakAttackDice: number;
  stdSneak: any;
  baseDmgDice: string;
}> = ({
  pc,
  w,
  formatMod,
  selectorDropdown,
  handleRollAttack,
  handleRollDamage,
  sneakAttackDice,
  stdSneak,
  baseDmgDice,
}) => (
  <div
    className="arpg-slot class-ability-slot"
    style={{
      position: 'relative',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '88px',
      border: '1px solid rgba(70, 105, 65, 0.5)',
      borderRadius: '4px',
      padding: '5px 6px',
      textAlign: 'center',
      background: 'rgba(70, 105, 65, 0.04)',
      boxShadow: '0 0 6px rgba(70, 105, 65, 0.15)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div style={{ fontSize: '6.5px', color: '#3b5e38', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-title)', opacity: 0.9 }}>
        🗡️ Class Strike
      </div>
      {selectorDropdown}
    </div>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
      Sneak Attack
    </div>
    <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
      +{sneakAttackDice}d6 (Flank / Denied Dex)
    </div>
    <div style={{ fontSize: '6.5px', color: '#3b5e38', fontStyle: 'italic' }}>
      Precision Strike
    </div>
    <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
      <button
        className="xbtn xbtn-atk"
        disabled={pc.isTotalDefense}
        onClick={(e) => handleRollAttack(w, false, e, { sneakAttack: true })}
        style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
        title={`Roll Sneak Attack (${formatMod(stdSneak.atkTotal)})`}
      >
        ATK {formatMod(stdSneak.atkTotal)}
      </button>
      <button
        className="xbtn xbtn-dmg"
        disabled={pc.isTotalDefense}
        onClick={(e) => handleRollDamage(w, false, e, { sneakAttack: true })}
        style={{ flex: 1.2, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
        title={`Roll Sneak Damage (${baseDmgDice}+${sneakAttackDice}d6 ${formatMod(stdSneak.dmgTotal)})`}
      >
        DMG +{sneakAttackDice}d6
      </button>
    </div>
  </div>
);

export const DuskbladeStrikeCard: React.FC<StrikeCardBaseProps & { stdDusk: any }> = ({
  pc,
  w,
  formatMod,
  selectorDropdown,
  handleRollAttack,
  handleRollDamage,
  stdDusk,
}) => (
  <div
    className="arpg-slot class-ability-slot"
    style={{
      position: 'relative',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '88px',
      border: '0.5px solid #8e44ad',
      borderRadius: '4px',
      padding: '5px 6px',
      textAlign: 'center',
      background: 'rgba(142, 68, 173, 0.05)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div style={{ fontSize: '6.5px', color: '#8e44ad', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-title)', opacity: 0.9 }}>
        ⚡ Duskblade Strike
      </div>
      {selectorDropdown}
    </div>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 'bold', color: '#8e44ad', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
      Arcane Channeling
    </div>
    <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
      Channel spell through strike
    </div>
    <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
      <button
        className="xbtn xbtn-atk"
        disabled={pc.isTotalDefense}
        onClick={(e) => handleRollAttack(w, false, e, { arcaneChanneling: true })}
        style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
      >
        ATK {formatMod(stdDusk.atkTotal)}
      </button>
      <button
        className="xbtn xbtn-dmg"
        disabled={pc.isTotalDefense}
        onClick={(e) => handleRollDamage(w, false, e, { arcaneChanneling: true })}
        style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
      >
        DMG+Spell
      </button>
    </div>
  </div>
);

export const ScoutStrikeCard: React.FC<StrikeCardBaseProps & {
  skirmishDice: number;
  skirmishAC: number;
  stdSkir: any;
  baseDmgDice: string;
}> = ({
  pc,
  w,
  formatMod,
  selectorDropdown,
  handleRollAttack,
  handleRollDamage,
  skirmishDice,
  skirmishAC,
  stdSkir,
  baseDmgDice,
}) => (
  <div
    className="arpg-slot class-ability-slot"
    style={{
      position: 'relative',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '88px',
      border: '0.5px solid #8c734b',
      borderRadius: '4px',
      padding: '5px 6px',
      textAlign: 'center',
      background: 'rgba(140, 115, 75, 0.05)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div style={{ fontSize: '6.5px', color: '#6d5734', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-title)', opacity: 0.9 }}>
        🏃 Scout Strike
      </div>
      {selectorDropdown}
    </div>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 'bold', color: '#6d5734', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
      Skirmish Attack
    </div>
    <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
      +{skirmishDice}d6 Dmg / +{skirmishAC} AC (10ft+)
    </div>
    <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
      <button
        className="xbtn xbtn-atk"
        disabled={pc.isTotalDefense}
        onClick={(e) => handleRollAttack(w, false, e, { sneakAttack: true, skirmish: true })}
        style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
      >
        ATK {formatMod(stdSkir.atkTotal)}
      </button>
      <button
        className="xbtn xbtn-dmg"
        disabled={pc.isTotalDefense}
        onClick={(e) => handleRollDamage(w, false, e, { sneakAttack: true, skirmish: true })}
        style={{ flex: 1.2, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
        title={`Roll Skirmish Damage (${baseDmgDice}+${skirmishDice}d6 ${formatMod(stdSkir.dmgTotal)})`}
      >
        DMG +{skirmishDice}d6
      </button>
    </div>
  </div>
);

export const NinjaStrikeCard: React.FC<StrikeCardBaseProps & {
  ninjaDice: number;
  stdSud: any;
  baseDmgDice: string;
}> = ({
  pc,
  w,
  formatMod,
  selectorDropdown,
  handleRollAttack,
  handleRollDamage,
  ninjaDice,
  stdSud,
  baseDmgDice,
}) => (
  <div
    className="arpg-slot class-ability-slot"
    style={{
      position: 'relative',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '88px',
      border: '0.5px solid #5a6b7c',
      borderRadius: '4px',
      padding: '5px 6px',
      textAlign: 'center',
      background: 'rgba(90, 107, 124, 0.05)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div style={{ fontSize: '6.5px', color: '#4a5b6c', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-title)', opacity: 0.9 }}>
        🥷 Ninja Strike
      </div>
      {selectorDropdown}
    </div>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 'bold', color: '#4a5b6c', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
      Sudden Strike
    </div>
    <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
      +{ninjaDice}d6 (Denied Dex)
    </div>
    <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
      <button
        className="xbtn xbtn-atk"
        disabled={pc.isTotalDefense}
        onClick={(e) => handleRollAttack(w, false, e, { sneakAttack: true, suddenStrike: true })}
        style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
      >
        ATK {formatMod(stdSud.atkTotal)}
      </button>
      <button
        className="xbtn xbtn-dmg"
        disabled={pc.isTotalDefense}
        onClick={(e) => handleRollDamage(w, false, e, { sneakAttack: true, suddenStrike: true })}
        style={{ flex: 1.2, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
        title={`Roll Sudden Strike (${baseDmgDice}+${ninjaDice}d6 ${formatMod(stdSud.dmgTotal)})`}
      >
        DMG +{ninjaDice}d6
      </button>
    </div>
  </div>
);

export const RangerStrikeCard: React.FC<StrikeCardBaseProps & {
  hasDistractingAttack: boolean;
  favoredEnemyBonus: number;
  stdFE: any;
}> = ({
  pc,
  w,
  formatMod,
  selectorDropdown,
  handleRollAttack,
  handleRollDamage,
  hasDistractingAttack,
  favoredEnemyBonus,
  stdFE,
}) => (
  <div
    className="arpg-slot class-ability-slot"
    style={{
      position: 'relative',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '88px',
      border: '1px solid #4a6274',
      borderRadius: '4px',
      padding: '5px 6px',
      textAlign: 'center',
      background: 'rgba(74, 98, 116, 0.08)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div style={{ fontSize: '6.5px', color: '#4a6274', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-title)', opacity: 0.9 }}>
        {hasDistractingAttack ? '⚡ ACF Ranger' : '🏹 Ranger'}
      </div>
      {selectorDropdown}
    </div>
    <div style={{ fontFamily: 'var(--font-body)', fontSize: '9.5px', fontWeight: 'bold', color: '#4a6274', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
      Favored Enemy
    </div>
    <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
      +{favoredEnemyBonus} Damage {hasDistractingAttack ? '(Flanks)' : `vs ${pc.favoredEnemy || 'Enemy'}`}
    </div>
    <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
      <button
        className="xbtn xbtn-atk"
        disabled={pc.isTotalDefense}
        onClick={(e) => handleRollAttack(w, false, e, { favoredEnemy: true })}
        style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
      >
        ATK {formatMod(stdFE.atkTotal)}
      </button>
      <button
        className="xbtn xbtn-dmg"
        disabled={pc.isTotalDefense}
        onClick={(e) => handleRollDamage(w, false, e, { favoredEnemy: true })}
        style={{ flex: 1.2, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
      >
        DMG +{favoredEnemyBonus}
      </button>
    </div>
  </div>
);
