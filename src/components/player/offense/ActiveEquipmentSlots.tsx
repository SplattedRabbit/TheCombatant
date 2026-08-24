/**
 * @module    ActiveEquipmentSlots
 * @summary   Renders the 3 active tactical combat slots: Main Hand, Off-Hand/Shield, and Class Combat Strike / ACF Slot.
 *            Modularized with dedicated sub-components: MainHandSlot, OffHandSlot, StrikeAbilitySlot, and NaturalAttacksSection.
 * @exports   ActiveEquipmentSlots
 * @reads     pc.activeShape, pc.weapons, pc.armor, pc.isTotalDefense, pc.isSmiteActive, pc.isFavoredEnemyActive, pc.isSneakAttacking, pc.classes, pc.dailyAbilities
 * @stateOps  CombatState.togglePCWeaponEquip, CombatState.togglePCArmorEquip, CombatState.updatePCField, CombatState.togglePCRage
 */

import React from 'react';
import { MainHandSlot } from './slots/MainHandSlot';
import { OffHandSlot } from './slots/OffHandSlot';
import { StrikeAbilitySlot } from './slots/StrikeAbilitySlot';
import { NaturalAttacksSection } from './slots/NaturalAttacksSection';

export interface ActiveEquipmentSlotsProps {
  pc: any;
  mainHandWeapon: any;
  offHandWeapon: any;
  equippedShield: any;
  equippedArmor: any;
  isDoubleWielded: boolean;
  getRarityStyle: (enhancement: number) => { border: string; background: string; boxShadow: string; glowClass: string };
  formatMod: (val: number) => string;
  handleHandSelectChange: (idx: number, val: string) => void;
  handleRollAttack: (w: any, isOffhand: boolean, e: React.MouseEvent, customOptions?: any) => void;
  handleRollDamage: (w: any, isOffhand: boolean, e: React.MouseEvent, customOptions?: any) => void;
}

export const ActiveEquipmentSlots: React.FC<ActiveEquipmentSlotsProps> = ({
  pc,
  mainHandWeapon,
  offHandWeapon,
  equippedShield,
  isDoubleWielded,
  getRarityStyle,
  formatMod,
  handleHandSelectChange,
  handleRollAttack,
  handleRollDamage,
}) => {
  if (pc.activeShape !== 'none') {
    return (
      <NaturalAttacksSection
        pc={pc}
        formatMod={formatMod}
        handleRollAttack={handleRollAttack}
        handleRollDamage={handleRollDamage}
      />
    );
  }

  return (
    <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
      <MainHandSlot
        pc={pc}
        mainHandWeapon={mainHandWeapon}
        getRarityStyle={getRarityStyle}
        formatMod={formatMod}
        handleHandSelectChange={handleHandSelectChange}
        handleRollAttack={handleRollAttack}
        handleRollDamage={handleRollDamage}
      />
      <OffHandSlot
        pc={pc}
        offHandWeapon={offHandWeapon}
        equippedShield={equippedShield}
        isDoubleWielded={isDoubleWielded}
        getRarityStyle={getRarityStyle}
        formatMod={formatMod}
        handleHandSelectChange={handleHandSelectChange}
        handleRollAttack={handleRollAttack}
        handleRollDamage={handleRollDamage}
      />
      <StrikeAbilitySlot
        pc={pc}
        mainHandWeapon={mainHandWeapon}
        formatMod={formatMod}
        handleRollAttack={handleRollAttack}
        handleRollDamage={handleRollDamage}
      />
    </div>
  );
};
