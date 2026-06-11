/**
 * @module    BaseAttackCalculator
 * @summary   Berechnet die iterativen Basisangriffe, natürliche Angriffe sowie die Abzüge für Zwei-Waffen-Kampf und Schlaghagel.
 * @exports   calculateBaseAttacks(ctx, isFullAttack), calculateTWFPenalties(ctx, isFullAttack), calculateManeuverPenalties(ctx, isFullAttack)
 * @reads     ctx.babVal, ctx.weapon, ctx.isNatural, ctx.isSecondary, ctx.isMelee, ctx.isRanged, ctx.hasFeat, ctx.pc
 * @stateOps  keine
 * @depends   isLightWeapon, isMonkWeapon (../../models/Weapon.js)
 * @notHere   Angriffs-Modifikatoren -> ModifierCalculator.js
 */

import { isLightWeapon, isMonkWeapon } from '../../models/Weapon.js';

export function calculateBaseAttacks(ctx, isFullAttack) {
  const attacks = [];
  if (ctx.isNatural) {
    const baseAtkVal = ctx.isSecondary ? (ctx.babVal - 5) : ctx.babVal;
    attacks.push(baseAtkVal);
    if (isFullAttack && (ctx.weapon.numAttacksFull === 2 || ctx.weapon.name.toLowerCase().includes('kralle') || ctx.weapon.name.toLowerCase().includes('claw'))) {
      attacks.push(baseAtkVal);
    }
  } else {
    attacks.push(ctx.babVal);
    if (isFullAttack) {
      if (ctx.babVal >= 6) attacks.push(ctx.babVal - 5);
      if (ctx.babVal >= 11) attacks.push(ctx.babVal - 10);
      if (ctx.babVal >= 16) attacks.push(ctx.babVal - 15);
    }
  }
  return attacks;
}

export function calculateTWFPenalties(ctx, isFullAttack) {
  const offhandWeapon = ctx.pc.weapons ? ctx.pc.weapons.find(w => w.id !== ctx.weapon.id && (w.grip === 'sec' || (w.isEquipped && w.hand === 'off'))) : null;
  const hasSecWeapon = !!offhandWeapon || !!ctx.weapon.isDoubleWielded;
  const isTWFActive = isFullAttack && ctx.isMelee && hasSecWeapon && !ctx.isNatural;

  let twfPenalties = { primary: 0, offhand: 0 };
  if (isTWFActive) {
    const hasTWFeat = ctx.hasFeat('two_weapon_fighting');
    const actualOffhandWeapon = ctx.weapon.isDoubleWielded ? ctx.weapon : offhandWeapon;
    const isOffhandLight = isLightWeapon(actualOffhandWeapon) || (actualOffhandWeapon && actualOffhandWeapon.isDoubleWielded);
    
    if (hasTWFeat) {
      twfPenalties = isOffhandLight ? { primary: -2, offhand: -2 } : { primary: -4, offhand: -4 };
    } else {
      twfPenalties = isOffhandLight ? { primary: -4, offhand: -8 } : { primary: -6, offhand: -10 };
    }
  }

  return { isTWFActive, twfPenalties };
}

export function calculateManeuverPenalties(ctx, isFullAttack) {
  const monkClass = Array.isArray(ctx.pc.classes) && ctx.pc.classes.find(c => c.classType === 'monk');
  const isFlurryingThis = isFullAttack && ctx.pc.isFlurrying && isMonkWeapon(ctx.weapon, ctx.weapon.grip) && !ctx.isNatural;
  let flurryPenalty = 0;
  if (isFlurryingThis && monkClass) {
    const mLvl = monkClass.level;
    flurryPenalty = mLvl >= 9 ? 0 : (mLvl >= 5 ? -1 : -2);
  }

  const isRapidShotThis = isFullAttack && ctx.isRanged && ctx.hasFeat('rapid_shot') && !ctx.isNatural;

  return { isFlurryingThis, flurryPenalty, isRapidShotThis };
}
