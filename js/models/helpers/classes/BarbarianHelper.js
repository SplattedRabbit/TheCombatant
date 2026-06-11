/**
 * @module    BarbarianHelper
 * @summary   Verwaltet das Barbaren-Klassenfeature Kampfrausch (Rage).
 * @exports   enterRage(pc), exitRage(pc)
 * @reads     pc.isRaging, pc.classes, pc.level
 * @stateOps  keine (mutiert Combatant.js interne hp/maxHP)
 * @depends   BarbarianRules
 * @notHere   UI-Klassen-Features -> BarbarianFeatures.js
 */

import { BarbarianRules } from '../../../rules/classes/BarbarianRules.js';

export function enterRage(pc) {
  if (pc.isRaging) return;
  pc.isRaging = true;
  
  const barbClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'barbarian') : null;
  const lvl = barbClass ? barbClass.level : 1;
  const bonuses = BarbarianRules.getRageBonuses(lvl);
  
  const hpGain = bonuses.hpPerLevel * pc.level;
  pc.maxHP += hpGain;
  pc.hp += hpGain;
  
  pc.rebuildStatModifiers();
}

export function exitRage(pc) {
  if (!pc.isRaging) return;
  
  const barbClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'barbarian') : null;
  const lvl = barbClass ? barbClass.level : 1;
  const bonuses = BarbarianRules.getRageBonuses(lvl);
  
  pc.isRaging = false;
  
  const hpLoss = bonuses.hpPerLevel * pc.level;
  pc.maxHP = Math.max(1, pc.maxHP - hpLoss);
  pc.hp = Math.max(-99, pc.hp - hpLoss);
  
  pc.applyCondition("Erschöpft");
  pc.rebuildStatModifiers();
}
