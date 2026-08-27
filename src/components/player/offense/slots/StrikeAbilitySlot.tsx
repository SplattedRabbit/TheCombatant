/**
 * @module    StrikeAbilitySlot
 * @summary   Renders the Right Tactical Slot: Dynamic Class Combat Ability / Strike Slot (Smite, Sneak, Duskblade, Scout, Ninja, Ranger).
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { AttackEngine } from '@core/rules/AttackEngine.js';
import { getAblMod } from '../../attributeHelper';

export interface StrikeAbilitySlotProps {
  pc: any;
  mainHandWeapon: any;
  formatMod: (val: number) => string;
  handleRollAttack: (w: any, isOffhand: boolean, e: React.MouseEvent, customOptions?: any) => void;
  handleRollDamage: (w: any, isOffhand: boolean, e: React.MouseEvent, customOptions?: any) => void;
}

export const StrikeAbilitySlot: React.FC<StrikeAbilitySlotProps> = ({
  pc,
  mainHandWeapon,
  formatMod,
  handleRollAttack,
  handleRollDamage,
}) => {
  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const paladinClass = activeClasses.find((c: any) => c.classType === 'paladin');
  const paladinLvl = paladinClass ? paladinClass.level : 0;

  const rangerClass = activeClasses.find((c: any) => c.classType === 'ranger');
  const rangerLvl = rangerClass ? rangerClass.level : 0;

  const duskbladeClass = activeClasses.find((c: any) => c.classType === 'duskblade');
  const scoutClass = activeClasses.find((c: any) => c.classType === 'scout');
  const ninjaClass = activeClasses.find((c: any) => c.classType === 'ninja');
  const shadowbaneClass = activeClasses.find((c: any) => c.classType === 'shadowbane_inquisitor');
  const shadowbaneLvl = shadowbaneClass ? shadowbaneClass.level : 0;

  const sneakAttackDice = typeof pc.getSneakAttackDiceCount === 'function' ? pc.getSneakAttackDiceCount() : 0;
  const favoredEnemyBonus = typeof pc.getFavoredEnemyBonus === 'function' ? pc.getFavoredEnemyBonus() : 0;

  const smiteAbility = Array.isArray(pc.dailyAbilities)
    ? pc.dailyAbilities.find(
        (a: any) =>
          a.name === 'Böses niederstrecken' ||
          a.name === 'Smite Evil' ||
          a.name === 'Smite (Inquisitor)' ||
          a.name === 'Smite Corrupt',
      )
    : null;
  const smiteMax = smiteAbility ? smiteAbility.max : 0;
  const smiteUsed = smiteAbility ? smiteAbility.used : 0;

  const chaValue = pc.cha ? (typeof pc.cha.getValue === 'function' ? pc.cha.getValue() : pc.cha) : 10;
  const chaMod = getAblMod(chaValue);

  const activeACFs: string[] = Array.isArray(pc.acfs) ? pc.acfs : [];
  const hasChargingSmite = activeACFs.includes('paladin_charging_smite');
  const hasDistractingAttack = activeACFs.includes('ranger_distracting_attack');

  const strikes: Array<{
    id: string;
    name: string;
    render: (selectorDropdown?: React.ReactNode) => React.ReactNode;
  }> = [];

  // 1. Paladin / Shadowbane Inquisitor (Smite Evil / Smite Corrupt / Charging Smite)
  if (paladinLvl > 0 || shadowbaneLvl >= 2 || !!smiteAbility) {
    const w = mainHandWeapon || { name: 'Unarmed Strike', damageDice: '1w3', damage: '1w3', crit: '20 / x2', grip: '1h', enhancement: 0 };
    const smiteTitle = shadowbaneLvl >= 2 && paladinLvl === 0 ? 'Smite Corrupt' : (hasChargingSmite ? 'Charging Smite' : 'Smite Evil');
    const smiteSeq = AttackEngine.calculateAttackSequence(pc, w, false, { smite: true, noSneak: true });
    const stdSmite = smiteSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w8' };
    const smiteDmgText = shadowbaneLvl >= 2 && paladinLvl === 0 ? `+${shadowbaneLvl}` : (hasChargingSmite ? `+${paladinLvl * 2}` : `+${paladinLvl + shadowbaneLvl}`);

    strikes.push({
      id: 'smite',
      name: smiteTitle,
      render: (selectorDropdown) => (
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
      ),
    });
  }

  // 2. Sneak Attack
  if (sneakAttackDice > 0) {
    const w = mainHandWeapon || { name: 'Unarmed Strike', damageDice: '1w3', damage: '1w3', crit: '20 / x2', grip: '1h', enhancement: 0 };
    const sneakSeq = AttackEngine.calculateAttackSequence(pc, w, false, { sneakAttack: true, noSmite: true });
    const stdSneak = sneakSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w6' };
    const baseDmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : w.damage || '1w6';

    strikes.push({
      id: 'sneak',
      name: 'Sneak Attack',
      render: (selectorDropdown) => (
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
      ),
    });
  }

  // 3. Duskblade (Arcane Channeling)
  if (duskbladeClass) {
    const w = mainHandWeapon || { name: 'Unarmed Strike', damageDice: '1w3', damage: '1w3', crit: '20 / x2', grip: '1h', enhancement: 0 };
    const duskSeq = AttackEngine.calculateAttackSequence(pc, w, false, {});
    const stdDusk = duskSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w6' };

    strikes.push({
      id: 'duskblade',
      name: 'Arcane Channeling',
      render: (selectorDropdown) => (
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
      ),
    });
  }

  // 4. Scout (Skirmish Attack)
  if (scoutClass) {
    const skirmishLvl = scoutClass.level;
    const skirmishDice = 1 + Math.floor((skirmishLvl - 1) / 4);
    const skirmishAC = 1 + Math.floor((skirmishLvl - 1) / 4);
    const w = mainHandWeapon || { name: 'Unarmed Strike', damageDice: '1w3', damage: '1w3', crit: '20 / x2', grip: '1h', enhancement: 0 };
    const skirSeq = AttackEngine.calculateAttackSequence(pc, w, false, { sneakAttack: true, skirmish: true });
    const stdSkir = skirSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w6' };
    const baseDmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : w.damage || '1w6';

    strikes.push({
      id: 'skirmish',
      name: 'Skirmish Attack',
      render: (selectorDropdown) => (
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
      ),
    });
  }

  // 5. Ninja (Sudden Strike)
  if (ninjaClass) {
    const ninjaDice = 1 + Math.floor((ninjaClass.level - 1) / 2);
    const w = mainHandWeapon || { name: 'Unarmed Strike', damageDice: '1w3', damage: '1w3', crit: '20 / x2', grip: '1h', enhancement: 0 };
    const sudSeq = AttackEngine.calculateAttackSequence(pc, w, false, { sneakAttack: true, suddenStrike: true });
    const stdSud = sudSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w6' };
    const baseDmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : w.damage || '1w6';

    strikes.push({
      id: 'sudden_strike',
      name: 'Sudden Strike',
      render: (selectorDropdown) => (
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
      ),
    });
  }

  // 6. Ranger (Favored Enemy Strike)
  if (rangerLvl > 0 || favoredEnemyBonus > 0) {
    const w = mainHandWeapon || { name: 'Unarmed Strike', damageDice: '1w3', damage: '1w3', crit: '20 / x2', grip: '1h', enhancement: 0 };
    const feSeq = AttackEngine.calculateAttackSequence(pc, w, false, { favoredEnemy: true });
    const stdFE = feSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w8' };

    strikes.push({
      id: 'favored_enemy',
      name: 'Favored Enemy',
      render: (selectorDropdown) => (
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
      ),
    });
  }

  if (strikes.length === 0) {
    return (
      <div
        className="arpg-slot class-ability-slot"
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '88px',
          border: '0.5px dashed var(--pb)',
          borderRadius: '4px',
          padding: '5px 6px',
          textAlign: 'center',
          background: 'rgba(200, 169, 110, 0.02)',
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--inkl)', marginBottom: '1px', opacity: 0.6 }}>🎯</div>
        <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-title)' }}>
          Combat Stance
        </div>
        <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic' }}>Standard Strike</div>
      </div>
    );
  }

  const selectedStrikeId =
    pc.selectedClassStrike && strikes.some((s) => s.id === pc.selectedClassStrike)
      ? pc.selectedClassStrike
      : strikes[0].id;
  const currentStrike = strikes.find((s) => s.id === selectedStrikeId) || strikes[0];

  const selectorDropdown =
    strikes.length > 1 ? (
      <select
        value={selectedStrikeId}
        onChange={(e) => CombatState.updatePCField('selectedClassStrike', e.target.value)}
        style={{
          fontSize: '6.5px',
          padding: '0 1px',
          height: '12px',
          lineHeight: 1,
          borderRadius: '1px',
          border: '0.5px solid var(--pb)',
          background: 'white',
          color: 'var(--ink)',
          cursor: 'pointer',
          maxWidth: '55px',
        }}
      >
        {strikes.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    ) : undefined;

  return <>{currentStrike.render(selectorDropdown)}</>;
};
