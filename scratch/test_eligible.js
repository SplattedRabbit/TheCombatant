import { isBuffEligible } from '../js/rules/BuffRules.js';
import { CLASS_BUFFS } from '../js/data/class-buffs-data.js';

const pc = {};

console.log("Testing with empty classes:");
CLASS_BUFFS.forEach(b => {
  const eligible = isBuffEligible(pc, b.key, true);
  if (eligible) {
    console.log(`- Class Buff: ${b.name} (${b.key}) is ELIGIBLE!`);
  }
});
