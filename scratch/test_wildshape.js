import { Combatant } from '../js/models/Combatant.js';

console.log("Running transaction test...");

const pc = new Combatant({
  name: "Druid Test",
  level: 17,
  str: 10,
  dex: 10,
  con: 10,
  ac: 10,
  acTouch: 10,
  acFlat: 10,
  classes: [{ classType: "druid", level: 17 }]
});

console.log("Initial Stats:");
console.log("Str:", pc.str.base, "Dex:", pc.dex.base, "Con:", pc.con.base);
console.log("AC:", pc.ac.base, "Touch:", pc.acTouch.base, "Flat:", pc.acFlat.base);
console.log("Active Shape:", pc.activeShape);

console.log("\nTransforming into Wolf...");
pc.enterShape("wolf");
console.log("Str:", pc.str.base, "Dex:", pc.dex.base, "Con:", pc.con.base);
console.log("AC:", pc.ac.base, "Touch:", pc.acTouch.base, "Flat:", pc.acFlat.base);
console.log("Active Shape:", pc.activeShape);
console.log("Original Stats captured:", pc.originalStats);

console.log("\nReverting to human...");
pc.exitShape();
console.log("Str:", pc.str.base, "Dex:", pc.dex.base, "Con:", pc.con.base);
console.log("AC:", pc.ac.base, "Touch:", pc.acTouch.base, "Flat:", pc.acFlat.base);
console.log("Active Shape:", pc.activeShape);
console.log("Original Stats:", pc.originalStats);

console.log("\nTransforming into Bear...");
pc.enterShape("bear");
console.log("Str:", pc.str.base, "Dex:", pc.dex.base, "Con:", pc.con.base);
console.log("AC:", pc.ac.base, "Touch:", pc.acTouch.base, "Flat:", pc.acFlat.base);
console.log("Active Shape:", pc.activeShape);
console.log("Original Stats captured:", pc.originalStats);
