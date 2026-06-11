/**
 * @module    DruidHelper
 * @summary   Verwaltet das Druiden-Klassenfeature Wild Shape (Tiergestalt-Verwandlungen).
 * @exports   enterShape(pc, shapeName), exitShape(pc)
 * @reads     pc.activeShape, pc.originalStats
 * @stateOps  keine (mutiert Combatant.js interne base attributes)
 * @depends   keine
 * @notHere   UI-Druiden-Komponente -> DruidFeatures.js
 */

// @feature:wildshape — Druiden-Tiergestalt-Verwandlung
export function enterShape(pc, shapeName) {
  if (pc.activeShape !== "none") {
    exitShape(pc);
  }

  // Backup original base stats
  pc.originalStats = {
    str: pc.str.base,
    dex: pc.dex.base,
    con: pc.con.base,
    ac: pc.ac.base,
    acTouch: pc.acTouch.base,
    acFlat: pc.acFlat.base
  };

  if (shapeName === "wolf") {
    pc.str.base = 13;
    pc.dex.base = 15;
    pc.con.base = 15;
    pc.ac.base = 14;
    pc.acTouch.base = 12;
    pc.acFlat.base = 12;
  } else if (shapeName === "leopard") {
    pc.str.base = 16;
    pc.dex.base = 19;
    pc.con.base = 15;
    pc.ac.base = 15;
    pc.acTouch.base = 14;
    pc.acFlat.base = 12;
  } else if (shapeName === "bear") {
    pc.str.base = 27;
    pc.dex.base = 13;
    pc.con.base = 19;
    pc.ac.base = 15;
    pc.acTouch.base = 11;
    pc.acFlat.base = 14;
  } else {
    pc.originalStats = null;
    return;
  }

  pc.activeShape = shapeName;
  pc.rebuildStatModifiers();
}

export function exitShape(pc) {
  if (pc.activeShape === "none" || !pc.originalStats) {
    pc.activeShape = "none";
    pc.originalStats = null;
    return;
  }

  pc.str.base = pc.originalStats.str;
  pc.dex.base = pc.originalStats.dex;
  pc.con.base = pc.originalStats.con;
  pc.ac.base = pc.originalStats.ac;
  pc.acTouch.base = pc.originalStats.acTouch;
  pc.acFlat.base = pc.originalStats.acFlat;

  pc.activeShape = "none";
  pc.originalStats = null;
  pc.rebuildStatModifiers();
}
