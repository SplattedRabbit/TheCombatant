/**
 * @module    StrikeAbilitySlot
 * @summary   Renders the Right Tactical Slot: Dynamic Class Combat Ability / Strike Slot (Smite, Sneak, Duskblade, Scout, Ninja, Ranger).
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { AttackEngine } from '@core/rules/AttackEngine.js';
import { getAblMod } from '../../attributeHelper';
import {
  SmiteStrikeCard,
  SneakStrikeCard,
  DuskbladeStrikeCard,
  ScoutStrikeCard,
  NinjaStrikeCard,
  RangerStrikeCard,
} from './StrikeCardViews.tsx';

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

  const w = mainHandWeapon || { name: 'Unarmed Strike', damageDice: '1w3', damage: '1w3', crit: '20 / x2', grip: '1h', enhancement: 0 };
  const baseDmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : w.damage || '1w6';

  const strikes: Array<{
    id: string;
    name: string;
    render: (selectorDropdown?: React.ReactNode) => React.ReactNode;
  }> = [];

  // 1. Paladin / Shadowbane Inquisitor
  if (paladinLvl > 0 || shadowbaneLvl >= 2 || !!smiteAbility) {
    const smiteTitle = shadowbaneLvl >= 2 && paladinLvl === 0 ? 'Smite Corrupt' : (hasChargingSmite ? 'Charging Smite' : 'Smite Evil');
    const smiteSeq = AttackEngine.calculateAttackSequence(pc, w, false, { smite: true, noSneak: true });
    const stdSmite = smiteSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w8' };
    const smiteDmgText = shadowbaneLvl >= 2 && paladinLvl === 0 ? `+${shadowbaneLvl}` : (hasChargingSmite ? `+${paladinLvl * 2}` : `+${paladinLvl + shadowbaneLvl}`);

    strikes.push({
      id: 'smite',
      name: smiteTitle,
      render: (selectorDropdown) => (
        <SmiteStrikeCard
          pc={pc}
          w={w}
          formatMod={formatMod}
          selectorDropdown={selectorDropdown}
          handleRollAttack={handleRollAttack}
          handleRollDamage={handleRollDamage}
          smiteTitle={smiteTitle}
          hasChargingSmite={hasChargingSmite}
          stdSmite={stdSmite}
          chaMod={chaMod}
          smiteDmgText={smiteDmgText}
          smiteMax={smiteMax}
          smiteUsed={smiteUsed}
        />
      ),
    });
  }

  // 2. Sneak Attack
  if (sneakAttackDice > 0) {
    const sneakSeq = AttackEngine.calculateAttackSequence(pc, w, false, { sneakAttack: true, noSmite: true });
    const stdSneak = sneakSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w6' };

    strikes.push({
      id: 'sneak',
      name: 'Sneak Attack',
      render: (selectorDropdown) => (
        <SneakStrikeCard
          pc={pc}
          w={w}
          formatMod={formatMod}
          selectorDropdown={selectorDropdown}
          handleRollAttack={handleRollAttack}
          handleRollDamage={handleRollDamage}
          sneakAttackDice={sneakAttackDice}
          stdSneak={stdSneak}
          baseDmgDice={baseDmgDice}
        />
      ),
    });
  }

  // 3. Duskblade
  if (duskbladeClass) {
    const duskSeq = AttackEngine.calculateAttackSequence(pc, w, false, {});
    const stdDusk = duskSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w6' };

    strikes.push({
      id: 'duskblade',
      name: 'Arcane Channeling',
      render: (selectorDropdown) => (
        <DuskbladeStrikeCard
          pc={pc}
          w={w}
          formatMod={formatMod}
          selectorDropdown={selectorDropdown}
          handleRollAttack={handleRollAttack}
          handleRollDamage={handleRollDamage}
          stdDusk={stdDusk}
        />
      ),
    });
  }

  // 4. Scout
  if (scoutClass) {
    const skirmishLvl = scoutClass.level;
    const skirmishDice = 1 + Math.floor((skirmishLvl - 1) / 4);
    const skirmishAC = 1 + Math.floor((skirmishLvl - 1) / 4);
    const skirSeq = AttackEngine.calculateAttackSequence(pc, w, false, { sneakAttack: true, skirmish: true });
    const stdSkir = skirSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w6' };

    strikes.push({
      id: 'skirmish',
      name: 'Skirmish Attack',
      render: (selectorDropdown) => (
        <ScoutStrikeCard
          pc={pc}
          w={w}
          formatMod={formatMod}
          selectorDropdown={selectorDropdown}
          handleRollAttack={handleRollAttack}
          handleRollDamage={handleRollDamage}
          skirmishDice={skirmishDice}
          skirmishAC={skirmishAC}
          stdSkir={stdSkir}
          baseDmgDice={baseDmgDice}
        />
      ),
    });
  }

  // 5. Ninja
  if (ninjaClass) {
    const ninjaDice = 1 + Math.floor((ninjaClass.level - 1) / 2);
    const sudSeq = AttackEngine.calculateAttackSequence(pc, w, false, { sneakAttack: true, suddenStrike: true });
    const stdSud = sudSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w6' };

    strikes.push({
      id: 'sudden_strike',
      name: 'Sudden Strike',
      render: (selectorDropdown) => (
        <NinjaStrikeCard
          pc={pc}
          w={w}
          formatMod={formatMod}
          selectorDropdown={selectorDropdown}
          handleRollAttack={handleRollAttack}
          handleRollDamage={handleRollDamage}
          ninjaDice={ninjaDice}
          stdSud={stdSud}
          baseDmgDice={baseDmgDice}
        />
      ),
    });
  }

  // 6. Ranger
  if (rangerLvl > 0 || favoredEnemyBonus > 0) {
    const feSeq = AttackEngine.calculateAttackSequence(pc, w, false, { favoredEnemy: true });
    const stdFE = feSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w8' };

    strikes.push({
      id: 'favored_enemy',
      name: 'Favored Enemy',
      render: (selectorDropdown) => (
        <RangerStrikeCard
          pc={pc}
          w={w}
          formatMod={formatMod}
          selectorDropdown={selectorDropdown}
          handleRollAttack={handleRollAttack}
          handleRollDamage={handleRollDamage}
          hasDistractingAttack={hasDistractingAttack}
          favoredEnemyBonus={favoredEnemyBonus}
          stdFE={stdFE}
        />
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
