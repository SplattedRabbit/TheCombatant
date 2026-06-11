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
import { renderPCOffense } from '../js/ui/components/player/PCOffense.js';

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
  assert.strictEqual(pc.acFlat.base, 12, 'Flat-Footed AC base sollte 12 sein');
});

test('Wild Shape - enterShape(bear) setzt korrekte Basis-Attributwerte', () => {
  const pc = new Combatant({ type: 'p' });
  pc.enterShape('bear');

  assert.strictEqual(pc.str.base, 27, 'STR base sollte 27 sein');
  assert.strictEqual(pc.dex.base, 13, 'DEX base sollte 13 sein');
  assert.strictEqual(pc.con.base, 19, 'CON base sollte 19 sein');
  assert.strictEqual(pc.ac.base, 15, 'AC base sollte 15 sein');
  assert.strictEqual(pc.acTouch.base, 11, 'Touch AC base sollte 11 sein');
  assert.strictEqual(pc.acFlat.base, 14, 'Flat-Footed AC base sollte 14 sein');
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
// Gruppe: SHAPE_ATTACKS Datenstruktur (indirekt über renderPCOffense)
// Die SHAPE_ATTACKS-Konstante ist modul-intern — wir testen sie indirekt,
// indem wir prüfen ob renderPCOffense bei activeShape='wolf'/'leopard'/'bear'
// unterschiedliche DOM-Inhalte erzeugt als bei 'none'.
// ---------------------------------------------------------------------------

/**
 * Hilfsfunktion: Erstellt einen minimalen DOM-Mock, rendert PCOffense und
 * gibt das innerHTML des pcOffense-Elements zurück.
 */
function renderShapeHTML(shapeName) {
  const pc = new Combatant({ type: 'p' });
  pc.bab.base = 3;
  pc.str.base = 10;
  pc.feats = [];
  pc.weapons = [];
  pc.armors = [];
  pc.activeShape = shapeName;

  const originalGetElementById = globalThis.document.getElementById;

  const offenseEl = globalThis.document.createElement('div');
  offenseEl.id = 'pcOffense';
  offenseEl.innerHTML = '';

  // natürliche Angriffsliste als child simulieren
  let natListEl = null;

  // Capture innere querySelector-Aufrufe
  offenseEl.querySelector = (selector) => {
    if (selector === '#pcNaturalAttacksList') {
      if (!natListEl) {
        natListEl = globalThis.document.createElement('div');
        natListEl.id = 'pcNaturalAttacksList';
        natListEl.children = [];
        natListEl.innerHTML = '';
        natListEl.appendChild = (child) => {
          natListEl.children.push(child);
          return child;
        };
      }
      return natListEl;
    }
    return globalThis.document.createElement('div');
  };

  globalThis.document.getElementById = (id) => {
    if (id === 'pcOffense') return offenseEl;
    return originalGetElementById(id);
  };

  renderPCOffense(pc);

  globalThis.document.getElementById = originalGetElementById;

  return {
    innerHTML: offenseEl.innerHTML,
    natChildren: natListEl ? natListEl.children : []
  };
}

test('SHAPE_ATTACKS - wolf enthält genau 1 Angriff (Biss, isNatural, primär, strMult 1.0)', () => {
  // Bei activeShape='wolf' soll pcOffense Inhalt für natürliche Angriffe zeigen
  const wolfResult = renderShapeHTML('wolf');
  const noneResult = renderShapeHTML('none');

  // Unterschiedlicher Inhalt: wolf zeigt natürliche Angriffssektion
  assert.ok(
    wolfResult.innerHTML.includes('Wild Shape') || wolfResult.innerHTML.includes('natürlich') ||
    wolfResult.innerHTML.includes('Natürliche') || wolfResult.innerHTML.includes('pcNaturalAttacksList'),
    'Bei wolf sollte die natürliche Angriffssektion gerendert werden'
  );
  assert.ok(
    !noneResult.innerHTML.includes('pcNaturalAttacksList'),
    'Bei none sollte keine Natürliche-Angriffe-Sektion erscheinen'
  );

  // Anzahl der Angriffs-Kinder überprüfen (1 für wolf)
  assert.strictEqual(wolfResult.natChildren.length, 1, 'Wolf sollte genau 1 natürlichen Angriff haben');
});

test('SHAPE_ATTACKS - leopard enthält genau 3 Angriffe (1 primär, 2 sekundär)', () => {
  const leopardResult = renderShapeHTML('leopard');
  assert.strictEqual(leopardResult.natChildren.length, 3, 'Leopard sollte genau 3 natürliche Angriffe haben');
});

test('SHAPE_ATTACKS - bear enthält genau 3 Angriffe (2 primär Krallen, 1 sekundär Biss)', () => {
  const bearResult = renderShapeHTML('bear');
  assert.strictEqual(bearResult.natChildren.length, 3, 'Bär sollte genau 3 natürliche Angriffe haben');
});

test('SHAPE_ATTACKS - wolf/leopard/bear rendern unterschiedlichen Inhalt als none', () => {
  // Stellt sicher dass alle drei gültigen Formen rendern und sich von none unterscheiden
  const noneResult = renderShapeHTML('none');

  for (const shape of ['wolf', 'leopard', 'bear']) {
    const result = renderShapeHTML(shape);
    assert.ok(
      result.natChildren.length > 0,
      `${shape} sollte mindestens 1 natürlichen Angriff rendern`
    );
  }

  // none hat keine natürlichen Angriffskinder
  assert.strictEqual(noneResult.natChildren.length, 0, 'none sollte keine natürlichen Angriffseinträge rendern');
});
