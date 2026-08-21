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
import { getSneakAttackDiceFromPrestigeClasses } from '../../../rules/prestigeClassEngine.js';

export function getSneakAttackDiceCount(pc) {
  let count = 0;
  const rogueClass = Array.isArray(pc.classes) && pc.classes.find(c => c.classType === 'rogue');
  if (rogueClass) {
    count += RogueRules.getSneakAttackDiceCount(rogueClass.level);
  }
  count += getSneakAttackDiceFromPrestigeClasses(pc);
  return count;
}


