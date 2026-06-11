/**
 * @module    CombatantClassFeatures
 * @summary   Orchestriert alle klassenspezifischen Domänenoperationen des Charakters.
 * @exports   enterShape(pc, shapeName), exitShape(pc), enterRage(pc), exitRage(pc), getWeaponDamageDice(pc, w), getFavoredEnemyBonus(pc), getSneakAttackDiceCount(pc)
 * @reads     pc.classes, pc.activeShape, pc.isRaging, pc.originalStats
 * @stateOps  keine
 * @depends   DruidHelper, BarbarianHelper, MonkHelper, RangerHelper, RogueHelper
 * @notHere   Konkrete Berechnungen -> Sub-Helper (DruidHelper, BarbarianHelper etc.)
 */

import { enterShape, exitShape } from './DruidHelper.js';
import { enterRage, exitRage } from './BarbarianHelper.js';
import { getWeaponDamageDice } from './MonkHelper.js';
import { getFavoredEnemyBonus } from './RangerHelper.js';
import { getSneakAttackDiceCount } from './RogueHelper.js';

export {
  enterShape,
  exitShape,
  enterRage,
  exitRage,
  getWeaponDamageDice,
  getFavoredEnemyBonus,
  getSneakAttackDiceCount
};
