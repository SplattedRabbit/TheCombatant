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

export function getFavoredEnemyBonus(pc, creatureType) {
  const rangerClass = Array.isArray(pc.classes) && pc.classes.find(c => c.classType === 'ranger');
  if (!rangerClass) return 0;

  const target = creatureType || pc.activeFavoredEnemyTarget;

  if (Array.isArray(pc.favoredEnemies) && pc.favoredEnemies.length > 0) {
    if (target) {
      const q = target.toLowerCase().trim();
      const match = pc.favoredEnemies.find(e => {
        if (!e.type) return false;
        const et = e.type.toLowerCase().trim();
        return et === q || q.includes(et) || et.includes(q);
      });
      if (match) return match.bonus || 2;
    }
    const bonuses = pc.favoredEnemies.map(e => e.bonus || 2);
    if (bonuses.length > 0) {
      return Math.max(...bonuses);
    }
  }

  if (target && pc.favoredEnemy) {
    const q = target.toLowerCase().trim();
    const fe = pc.favoredEnemy.toLowerCase().trim();
    if (fe === q || q.includes(fe) || fe.includes(q)) {
      return RangerRules.getFavoredEnemyBonus(rangerClass.level);
    }
  }

  return RangerRules.getFavoredEnemyBonus(rangerClass.level);
}
