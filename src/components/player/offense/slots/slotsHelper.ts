/**
 * @module    slotsHelper
 * @summary   Helper functions for active equipment slot rendering and two-handed detection.
 */

// @ts-ignore
import { WeaponRegistry } from '@core/models/Weapon.js';

export function isWeaponTwoHanded(w: any): boolean {
  if (!w) return false;
  const def = WeaponRegistry[w.type] || {};
  const isTwoHandedRanged =
    w.grip === 'rng' &&
    (def.isBow || def.isComposite || w.type === 'light_crossbow' || w.type === 'heavy_crossbow' || w.type === 'other_ranged');
  return w.grip === '2h' || w.grip === '2H' || isTwoHandedRanged;
}
