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
  const classes = Array.isArray(pc?.classes) ? pc.classes : [];

  // Rogue Sneak Attack (+1d6 at 1st, +2d6 at 3rd, etc.)
  const rogueClass = classes.find(c => c.classType === 'rogue');
  if (rogueClass) {
    count += RogueRules.getSneakAttackDiceCount(rogueClass.level);
  }

  // Spellthief Sneak Attack (+1d6 at 1st, +2d6 at 5th, +3d6 at 9th, etc.)
  const spellthiefClass = classes.find(c => c.classType === 'spellthief');
  if (spellthiefClass && spellthiefClass.level >= 1) {
    count += Math.floor((spellthiefClass.level + 3) / 4);
  }

  // Ninja Sudden Strike (+1d6 at 1st, +2d6 at 3rd, +3d6 at 5th, etc.)
  const ninjaClass = classes.find(c => c.classType === 'ninja');
  if (ninjaClass && ninjaClass.level >= 1) {
    count += Math.floor((ninjaClass.level + 1) / 2);
  }

  // Prestige Classes (Assassin, Arcane Trickster, Shadowbane Inquisitor, Spellwarp Sniper)
  count += getSneakAttackDiceFromPrestigeClasses(pc);
  return count;
}


