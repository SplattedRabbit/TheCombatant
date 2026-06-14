/**
 * @module    wildshape.test
 * @summary   Tests für Wild Shape (enterShape/exitShape) und die SHAPE_ATTACKS-Datenstruktur in PCOffense.js
 * @exports   keine
 * @reads     Combatant.activeShape, Combatant.originalStats, str/dex/con/ac/acTouch/acFlat .base
 * @stateOps  keine
 * @depends   Combatant, renderPCOffense
 * @notHere   Save-Tests → saving-throws.test.js | Waffen-Tests → weapons.test.js
 */
// Tests/wildshape.test.js - Test suite for D&D 3.5e Wild Shape mechanics

import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { SHAPE_ATTACKS } from '../js/models/helpers/classes/DruidHelper.js';

// ---------------------------------------------------------------------------
// Gruppe: Combatant - Wild Shape enterShape/exitShape
// ---------------------------------------------------------------------------

test('Wild Shape - enterShape(wolf) setzt korrekte Basis-Attributwerte', () => {
  const pc = new Combatant({ type: 'p' });
  pc.enterShape('wolf');

  assert.strictEqual(pc.str.base, 13, 'STR base sollte 13 sein');
  assert.strictEqual(pc.dex.base, 15, 'DEX base sollte 15 sein');
  assert.strictEqual(pc.con.base, 15, 'CON base sollte 15 sein');
  assert.strictEqual(pc.ac.base, 14, 'AC base sollte 14 sein');
  assert.strictEqual(pc.acTouch.base, 12, 'Touch AC base sollte 12 sein');
  assert.strictEqual(pc.acFlat.base, 12, 'Flat-Footed AC base sollte 12 sein');
});

test('Wild Shape - enterShape(leopard) setzt korrekte Basis-Attributwerte', () => {
  const pc = new Combatant({ type: 'p' });
  pc.enterShape('leopard');

  assert.strictEqual(pc.str.base, 16, 'STR base sollte 16 sein');
  assert.strictEqual(pc.dex.base, 19, 'DEX base sollte 19 sein');
  assert.strictEqual(pc.con.base, 15, 'CON base sollte 15 sein');
  assert.strictEqual(pc.ac.base, 15, 'AC base sollte 15 sein');
  assert.strictEqual(pc.acTouch.base, 14, 'Touch AC base sollte 14 sein');
  assert.strictEqual(pc.acFlat.base, 11, 'Flat-Footed AC base sollte 11 sein');
});

test('Wild Shape - enterShape(bear) setzt korrekte Basis-Attributwerte', () => {
  const pc = new Combatant({ type: 'p' });
  pc.enterShape('bear');

  assert.strictEqual(pc.str.base, 27, 'STR base sollte 27 sein');
  assert.strictEqual(pc.dex.base, 13, 'DEX base sollte 13 sein');
  assert.strictEqual(pc.con.base, 19, 'CON base sollte 19 sein');
  assert.strictEqual(pc.ac.base, 16, 'AC base sollte 16 sein');
  assert.strictEqual(pc.acTouch.base, 11, 'Touch AC base sollte 11 sein');
  assert.strictEqual(pc.acFlat.base, 15, 'Flat-Footed AC base sollte 15 sein');
});

test('Wild Shape - exitShape() stellt originale Basis-Attributwerte vollständig wieder her', () => {
  const pc = new Combatant({ type: 'p' });

  // Originalwerte merken
  const origStr = pc.str.base;
  const origDex = pc.dex.base;
  const origCon = pc.con.base;
  const origAc = pc.ac.base;
  const origAcTouch = pc.acTouch.base;
  const origAcFlat = pc.acFlat.base;

  pc.enterShape('bear');
  pc.exitShape();

  assert.strictEqual(pc.str.base, origStr, 'STR base sollte wiederhergestellt sein');
  assert.strictEqual(pc.dex.base, origDex, 'DEX base sollte wiederhergestellt sein');
  assert.strictEqual(pc.con.base, origCon, 'CON base sollte wiederhergestellt sein');
  assert.strictEqual(pc.ac.base, origAc, 'AC base sollte wiederhergestellt sein');
  assert.strictEqual(pc.acTouch.base, origAcTouch, 'Touch AC base sollte wiederhergestellt sein');
  assert.strictEqual(pc.acFlat.base, origAcFlat, 'Flat-Footed AC base sollte wiederhergestellt sein');
});

test('Wild Shape - enterShape() speichert originalStats korrekt vor der Transformation', () => {
  const pc = new Combatant({ type: 'p' });
  pc.str.base = 12;
  pc.dex.base = 14;
  pc.con.base = 16;
  pc.ac.base = 11;
  pc.acTouch.base = 11;
  pc.acFlat.base = 11;

  pc.enterShape('wolf');

  assert.ok(pc.originalStats !== null, 'originalStats sollte nicht null sein');
  assert.strictEqual(pc.originalStats.str, 12, 'originalStats.str sollte 12 sein');
  assert.strictEqual(pc.originalStats.dex, 14, 'originalStats.dex sollte 14 sein');
  assert.strictEqual(pc.originalStats.con, 16, 'originalStats.con sollte 16 sein');
  assert.strictEqual(pc.originalStats.ac, 11, 'originalStats.ac sollte 11 sein');
  assert.strictEqual(pc.originalStats.acTouch, 11, 'originalStats.acTouch sollte 11 sein');
  assert.strictEqual(pc.originalStats.acFlat, 11, 'originalStats.acFlat sollte 11 sein');
});

test('Wild Shape - Doppeltes enterShape() (wolf -> bear) ruft erst exitShape() auf (kein Stacking)', () => {
  const pc = new Combatant({ type: 'p' });
  const origStr = pc.str.base;

  // Erste Transformation
  pc.enterShape('wolf');
  const wolfStr = pc.str.base;
  assert.strictEqual(wolfStr, 13, 'Nach wolf: STR base = 13');

  // Zweite Transformation — soll wolf zuerst beenden und bear setzen
  pc.enterShape('bear');
  assert.strictEqual(pc.str.base, 27, 'Nach bear: STR base = 27 (kein Stacking mit wolf)');
  assert.strictEqual(pc.activeShape, 'bear', 'activeShape sollte bear sein');

  // exitShape gibt bear auf und stellt Originalwerte wieder her
  pc.exitShape();
  assert.strictEqual(pc.str.base, origStr, 'Nach exitShape(): Originalwert wiederhergestellt');
});

test('Wild Shape - exitShape() auf activeShape=none ist sicher (kein Crash)', () => {
  const pc = new Combatant({ type: 'p' });
  assert.strictEqual(pc.activeShape, 'none', 'Ausgangszustand sollte none sein');
  assert.doesNotThrow(() => {
    pc.exitShape();
  }, 'exitShape() auf none darf keinen Fehler werfen');
  assert.strictEqual(pc.activeShape, 'none', 'activeShape bleibt none');
});

test('Wild Shape - Ungültige Shape-Namen setzen activeShape nicht und löschen originalStats', () => {
  const pc = new Combatant({ type: 'p' });
  pc.enterShape('dragon'); // 'dragon' ist nicht definiert

  assert.strictEqual(pc.activeShape, 'none', 'activeShape sollte bei ungültigem Namen none bleiben');
  assert.strictEqual(pc.originalStats, null, 'originalStats sollte null sein nach ungültigem Shape');
});

test('Wild Shape - pc.activeShape wird nach enterShape korrekt gesetzt', () => {
  const pc = new Combatant({ type: 'p' });
  assert.strictEqual(pc.activeShape, 'none', 'Ausgangszustand sollte none sein');

  pc.enterShape('wolf');
  assert.strictEqual(pc.activeShape, 'wolf', 'activeShape sollte wolf sein');

  pc.exitShape();

  pc.enterShape('leopard');
  assert.strictEqual(pc.activeShape, 'leopard', 'activeShape sollte leopard sein');

  pc.exitShape();

  pc.enterShape('bear');
  assert.strictEqual(pc.activeShape, 'bear', 'activeShape sollte bear sein');
});

test('Wild Shape - pc.activeShape wird nach exitShape auf none zurückgesetzt', () => {
  const pc = new Combatant({ type: 'p' });
  pc.enterShape('wolf');
  assert.strictEqual(pc.activeShape, 'wolf', 'activeShape sollte wolf sein');

  pc.exitShape();
  assert.strictEqual(pc.activeShape, 'none', 'activeShape sollte nach exitShape none sein');
  assert.strictEqual(pc.originalStats, null, 'originalStats sollte nach exitShape null sein');
});

// ---------------------------------------------------------------------------
// Gruppe: SHAPE_ATTACKS Datenstruktur
// Wir testen die fachliche SHAPE_ATTACKS-Datenstruktur direkt.
// ---------------------------------------------------------------------------

test('SHAPE_ATTACKS - wolf enthält genau 1 Angriff (Biss, isNatural, primär, strMult 1.0)', () => {
  const attacks = SHAPE_ATTACKS['wolf'];
  assert.strictEqual(attacks.length, 1, 'Wolf sollte genau 1 natürlichen Angriff haben');
  const atk = attacks[0];
  assert.strictEqual(atk.name, 'Biss (Wolf)');
  assert.strictEqual(atk.isNatural, true);
  assert.strictEqual(atk.isSecondary, false);
  assert.strictEqual(atk.strMult, 1.0);
});

test('SHAPE_ATTACKS - leopard enthält genau 3 Angriffe (1 primär, 2 sekundär)', () => {
  const attacks = SHAPE_ATTACKS['leopard'];
  assert.strictEqual(attacks.length, 3, 'Leopard sollte genau 3 natürliche Angriffe haben');
  
  const primary = attacks.filter(a => !a.isSecondary);
  const secondary = attacks.filter(a => a.isSecondary);
  
  assert.strictEqual(primary.length, 1, 'Leopard sollte genau 1 primären Angriff haben');
  assert.strictEqual(secondary.length, 2, 'Leopard sollte genau 2 sekundäre Angriffe haben');
});

test('SHAPE_ATTACKS - bear enthält genau 3 Angriffe (2 primär Krallen, 1 sekundär Biss)', () => {
  const attacks = SHAPE_ATTACKS['bear'];
  assert.strictEqual(attacks.length, 3, 'Bär sollte genau 3 natürliche Angriffe haben');
  
  const primary = attacks.filter(a => !a.isSecondary);
  const secondary = attacks.filter(a => a.isSecondary);
  
  assert.strictEqual(primary.length, 2, 'Bär sollte genau 2 primäre Angriffe haben');
  assert.strictEqual(secondary.length, 1, 'Bär sollte genau 1 sekundären Angriff haben');
});

test('SHAPE_ATTACKS - wolf/leopard/bear existieren in der Datenstruktur', () => {
  for (const shape of ['wolf', 'leopard', 'bear']) {
    const attacks = SHAPE_ATTACKS[shape];
    assert.ok(attacks && attacks.length > 0, `${shape} sollte definierte Angriffe haben`);
  }
  assert.strictEqual(SHAPE_ATTACKS['none'], undefined, 'none sollte keine natürlichen Angriffe definiert haben');
});

test('Wild Shape - enterShape(bear) und exitShape() verändern HP/MaxHP basierend auf Konstitutionsänderung', () => {
  const pc = new Combatant({ type: 'p' });
  pc.classes = [{ classType: 'druid', level: 6 }];
  pc.con.base = 12; // Modifikator +1
  pc.maxHP = 40;
  pc.hp = 35;
  pc.rebuildStatModifiers();
  
  // Transform to bear (bear con = 19, mod = +4). Difference is +3 mod.
  // With level 6, HP/MaxHP should change by +18.
  pc.enterShape('bear');
  assert.strictEqual(pc.maxHP, 58, 'MaxHP sollte um 18 gestiegen sein (40 + 18)');
  assert.strictEqual(pc.hp, 53, 'HP sollte um 18 gestiegen sein (35 + 18)');
  
  // Exit shape. Con goes back to 12. HP/MaxHP should drop by 18.
  pc.exitShape();
  assert.strictEqual(pc.maxHP, 40, 'MaxHP sollte wieder 40 sein');
  assert.strictEqual(pc.hp, 35, 'HP sollte wieder 35 sein');
});

test('Wild Shape - bear Form wendet Größenmodifikator -1 auf AC an', () => {
  const pc = new Combatant({ type: 'p' });
  pc.classes = [{ classType: 'druid', level: 6 }];
  pc.dex.base = 10;
  pc.con.base = 10;
  pc.autoAC = true;
  pc.enterShape('bear'); // bear has dex base 13 (mod +1), base ac 16, touch 11, flat 15, size -1.
  
  // Rebuild modifiers
  pc.rebuildStatModifiers();
  
  // Let's verify size modifier is -1
  assert.strictEqual(pc.getSizeModifier(), -1);
  
  // Final AC:
  // pc.ac = 16 (base) - 1 (size) = 15.
  // pc.acTouch = 11 (base) - 1 (size) = 10.
  // pc.acFlat = 15 (base) - 1 (size) = 14.
  assert.strictEqual(pc.ac.getValue(), 15);
  assert.strictEqual(pc.acTouch.getValue(), 10);
  assert.strictEqual(pc.acFlat.getValue(), 14);
});

test('Wild Shape - Rassenmodifikator (Zwergen-CON) wird in Tiergestalt ignoriert', () => {
  const pc = new Combatant({ type: 'p', race: 'dwarf' });
  pc.classes = [{ classType: 'druid', level: 6 }];
  pc.con.base = 12; // Zwerg erhält normalerweise +2 = 14 Con
  pc.rebuildStatModifiers();

  // In Zwergen-Grundform: Con sollte 14 sein
  assert.strictEqual(pc.con.getValue(), 14, 'Zwerg Con in Grundform sollte 14 sein');

  // In Bärengestalt wechseln: Bär hat Con 19 (ohne Rassenmodifikator!)
  pc.enterShape('bear');
  assert.strictEqual(pc.con.getValue(), 19, 'In Bärengestalt sollte Con exakt 19 sein (Zwergen-Rassenbonus ignoriert)');

  // Wieder zurückverwandeln: Con sollte wieder 14 sein
  pc.exitShape();
  assert.strictEqual(pc.con.getValue(), 14, 'Nach exitShape() sollte Con wieder 14 sein');
});

test('Wild Shape - Rassen-Größen-RK-Bonus (Gnom) wird in Tiergestalt ignoriert', () => {
  const pc = new Combatant({ type: 'p', race: 'gnome', autoAC: true });
  pc.classes = [{ classType: 'druid', level: 6 }];
  pc.dex.base = 10;
  pc.rebuildStatModifiers();

  // Gnom hat in Grundform Größe Small (+1 auf RK)
  assert.strictEqual(pc.getSizeModifier(), 1, 'Gnom hat in Grundform Größe Small');
  // RK: 10 (base) + 0 (dex) + 1 (size) = 11
  assert.strictEqual(pc.ac.getValue(), 11, 'Gnom RK in Grundform sollte 11 sein');

  // In Bärengestalt wechseln: Bär ist Large (-1 auf RK). Gnom-Größenbonus darf nicht stacken!
  pc.enterShape('bear'); // bear has dex base 13 (mod +1), base ac 16, size -1
  pc.rebuildStatModifiers();
  
  // Bär RK: 16 (base) + 0 (dex-diff: 13-13=0) + -1 (bear size) = 15
  assert.strictEqual(pc.ac.getValue(), 15, 'Bär RK sollte 15 sein (kein Gnom-Größenbonus)');
  assert.strictEqual(pc.getSizeModifier(), -1, 'In Bärengestalt gilt Größenmodifikator -1');

  pc.exitShape();
  assert.strictEqual(pc.ac.getValue(), 11, 'Zurück in Grundform: RK wieder 11');
});

test('Wild Shape - angeborene natürliche Rüstung der Grundform wird in Tiergestalt ignoriert', () => {
  const pc = new Combatant({ type: 'p', autoAC: true });
  pc.classes = [{ classType: 'druid', level: 6 }];
  pc.acNatural = 2; // Grundform hat +2 natural armor
  pc.dex.base = 10;
  pc.rebuildStatModifiers();

  // In Grundform: RK = 10 (base) + 2 (acNatural) = 12
  assert.strictEqual(pc.ac.getValue(), 12, 'RK in Grundform sollte 12 sein');

  // In Bärengestalt wechseln: Bär hat base ac 16 (schließt +5 natural armor ein), size -1
  pc.enterShape('bear');
  pc.rebuildStatModifiers();
  
  // Bär RK: 16 (base) + 0 (dex) + -1 (size) = 15 (pc.acNatural der Grundform wird ignoriert!)
  assert.strictEqual(pc.ac.getValue(), 15, 'Bär RK sollte 15 sein (angeborene acNatural ignoriert)');

  pc.exitShape();
  assert.strictEqual(pc.ac.getValue(), 12, 'Zurück in Grundform: RK wieder 12');
});
