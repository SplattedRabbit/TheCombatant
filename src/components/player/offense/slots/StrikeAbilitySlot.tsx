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

  // =========================================================================
  // EXPLICIT HOMEBREW DESIGN DECISION (DO NOT REVERT TO SEPARATE STRIKE SLOTS)
  // Per user specification, Sneak Attack and Sudden Strike are merged into a
  // single unified precision strike slot. The player never has to choose between
  // them in the dropdown; all dice are summed and assumed applicable in combat.
  // See AGENT.md section 6.1 and docs/CHANGELOG.md for details.
  // =========================================================================
  const hasNinja = !!ninjaClass;
  const hasRogue = activeClasses.some((c: any) => c.classType === 'rogue');
  const hasSpellthief = activeClasses.some((c: any) => c.classType === 'spellthief');
  const hasPrestigeSA = activeClasses.some((c: any) =>
    ['assassin', 'arcane_trickster', 'shadowbane_inquisitor', 'spellwarp_sniper'].includes(c.classType)
  );
  const hasOtherSA = hasRogue || hasSpellthief || hasPrestigeSA;

  let precisionStrikeName = 'Sneak Attack';
  let precisionCardTitle = 'Sneak Attack';
  let precisionCategoryLabel = '🗡️ Class Strike';
  let precisionBadgeLabel = 'Precision Strike';
  let precisionStrikeId = 'sneak';

  if (hasNinja && hasOtherSA) {
    precisionStrikeName = 'Sneak & Sudden Strike';
    precisionCardTitle = 'Sneak & Sudden Strike';
    precisionCategoryLabel = '🗡️ Precision Strike';
    precisionBadgeLabel = 'Combined Precision';
    precisionStrikeId = 'sneak_sudden';
  } else if (hasNinja && !hasOtherSA) {
    precisionStrikeName = 'Sudden Strike';
    precisionCardTitle = 'Sudden Strike';
    precisionCategoryLabel = '🥷 Ninja Strike';
    precisionBadgeLabel = 'Sudden Strike';
    precisionStrikeId = 'sudden_strike';
  }

  // 2. Precision Strike (Sneak Attack / Sudden Strike Unified Homebrew)
  if (sneakAttackDice > 0) {
    const sneakSeq = AttackEngine.calculateAttackSequence(pc, w, false, { sneakAttack: true, suddenStrike: true, noSmite: true });
    const stdSneak = sneakSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w6' };

    strikes.push({
      id: precisionStrikeId,
      name: precisionStrikeName,
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
          cardTitle={precisionCardTitle}
          categoryLabel={precisionCategoryLabel}
          badgeLabel={precisionBadgeLabel}
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

  // 5. Ranger
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
          justifyContent: 'space-between',
          minHeight: '88px',
          border: '0.5px solid var(--pb)',
          borderRadius: '4px',
          padding: '5px 6px',
          textAlign: 'center',
          background: 'rgba(200, 169, 110, 0.02)',
        }}
      >
        {/* Zone 1: Slot Label */}
        <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-title)', opacity: 0.9 }}>
          🎯 Combat Stance
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
          title="Standard Strike"
        >
          Standard Strike
        </div>

        {/* Zone 3: Badges */}
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center', justifyContent: 'center', margin: '1px 0' }}>
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
            Standard Action
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
            Full BAB
          </span>
        </div>

        {/* Zone 4: Middle Tactical Details */}
        <div style={{ fontSize: '6px', color: 'var(--inkm)', padding: '1px 0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          <span>Main Hand • Normal Melee/Ranged</span>
        </div>

        {/* Zone 5: Bottom Action Row (18px aligned) */}
        <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
          <button
            type="button"
            className="xbtn xbtn-atk"
            disabled={!mainHandWeapon || pc.isTotalDefense}
            onClick={(e) => mainHandWeapon && handleRollAttack(mainHandWeapon, false, e)}
            style={{
              flex: 1,
              padding: '2px 0',
              fontSize: '7.5px',
              fontWeight: 'bold',
              height: '18px',
              lineHeight: 1,
              opacity: (!mainHandWeapon || pc.isTotalDefense) ? 0.4 : 1,
              cursor: (!mainHandWeapon || pc.isTotalDefense) ? 'not-allowed' : 'pointer',
            }}
            title="Roll Standard Strike using Main Hand weapon"
          >
            🎯 STRIKE
          </button>
        </div>
      </div>
    );
  }

  const isSelectedValid = pc.selectedClassStrike && (
    strikes.some((s) => s.id === pc.selectedClassStrike) ||
    (pc.selectedClassStrike === 'sudden_strike' && strikes.some((s) => s.id === 'sneak_sudden' || s.id === 'sneak')) ||
    (pc.selectedClassStrike === 'sneak' && strikes.some((s) => s.id === 'sneak_sudden' || s.id === 'sudden_strike'))
  );
  const selectedStrikeId = isSelectedValid
    ? (strikes.find((s) => s.id === pc.selectedClassStrike)?.id || strikes.find((s) => ['sneak_sudden', 'sneak', 'sudden_strike'].includes(s.id))?.id || strikes[0].id)
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
