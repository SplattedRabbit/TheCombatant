/**
 * @module    MonkHelper
 * @summary   Verwaltet das Mönchs-Klassenfeature Waffenloser Schaden (Unarmed Strike Scaling).
 * @exports   getWeaponDamageDice(pc, w)
 * @reads     pc.classes
 * @stateOps  keine
 * @depends   MonkRules
 * @notHere   UI-Klassen-Features -> MonkFeatures.js
 */

import { MonkRules } from '../../../rules/classes/MonkRules.js';

export function getWeaponDamageDice(pc, w) {
  if (!w) return '1w6';
  if (w.damageDiceOverride) return w.damageDiceOverride;
  if (w.type === 'unarmed_strike') {
    const monkClass = Array.isArray(pc.classes) && pc.classes.find(c => c.classType === 'monk');
    if (monkClass) {
      return MonkRules.getUnarmedDamageDice(monkClass.level);
    }
  }
  return w.damageDice;
}
