/**
 * @module    RangerHelper
 * @summary   Verwaltet das Waldläufer-Klassenfeature Erzfeind (Favored Enemy Bonus).
 * @exports   getFavoredEnemyBonus(pc)
 * @reads     pc.classes
 * @stateOps  keine
 * @depends   RangerRules
 * @notHere   UI-Klassen-Features -> RangerFeatures.js
 */

import { RangerRules } from '../../../rules/classes/RangerRules.js';

export function getFavoredEnemyBonus(pc) {
  const rangerClass = Array.isArray(pc.classes) && pc.classes.find(c => c.classType === 'ranger');
  if (!rangerClass) return 0;
  return RangerRules.getFavoredEnemyBonus(rangerClass.level);
}
