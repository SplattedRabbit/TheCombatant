/**
 * @module    RogueHelper
 * @summary   Verwaltet das Schurken-Klassenfeature Hinterhältiger Angriff (Sneak Attack Scaling).
 * @exports   getSneakAttackDiceCount(pc)
 * @reads     pc.classes
 * @stateOps  keine
 * @depends   RogueRules
 * @notHere   UI-Klassen-Features -> RogueFeatures.js | Schadensapplikation -> AttackEngine.js
 */

import { RogueRules } from '../../../rules/classes/RogueRules.js';

export function getSneakAttackDiceCount(pc) {
  const rogueClass = Array.isArray(pc.classes) && pc.classes.find(c => c.classType === 'rogue');
  if (!rogueClass) return 0;
  return RogueRules.getSneakAttackDiceCount(rogueClass.level);
}
