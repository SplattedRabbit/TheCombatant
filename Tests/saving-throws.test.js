/**
 * @module    saving-throws.test
 * @summary   Tests für SaveCalculator (Basis-Rettungswürfe) und ihre Anwendung in Combatant (Magic Items, Talente)
 * @exports   keine
 * @reads     pc.za, pc.ref, pc.wil, pc.feats, pc.items
 * @stateOps  keine
 * @depends   SaveCalculator, Combatant, Stat, Item
 * @notHere   Wild-Shape-Tests → wildshape.test.js | Waffen-Tests → weapons.test.js
 */
// Tests/saving-throws.test.js - Test suite for D&D 3.5e Saving Throw system

import { test } from 'node:test';
import assert from 'node:assert';
import { SaveCalculator } from '../js/rules/SaveCalculator.js';
import { Combatant } from '../js/models/Combatant.js';
import { Item } from '../js/models/Item.js';
import { Stat } from '../js/models/Stat.js';

// ---------------------------------------------------------------------------
// Hilfsfunktion: Erstellt einen einfachen PC ohne CON/DEX/WIS-Boni,
// damit die Rettungswurftests sauber auf Klassenwerte testen.
// ---------------------------------------------------------------------------
function makePlainPC(classes) {
  const saves = SaveCalculator.calculateSaves(classes);
  return new Combatant({
    type: 'p',
    con: new Stat(10), // CON mod = 0
    dex: new Stat(10), // DEX mod = 0
    wis: new Stat(10), // WIS mod = 0
    classes,
    baseZa: saves.fort,
    baseRef: saves.ref,
    baseWil: saves.wil
  });
}

// ---------------------------------------------------------------------------
// Gruppe: SaveCalculator - Rettungswurf-Grundwerte
// ---------------------------------------------------------------------------

test('SaveCalculator - Fighter Stufe 1: Fort=2, Ref=0, Wil=0', () => {
  const result = SaveCalculator.calculateSaves([{ classType: 'fighter', level: 1 }]);
  assert.strictEqual(result.fort, 2, 'Fighter Stufe 1: Fort sollte 2 sein (gut)');
  assert.strictEqual(result.ref, 0, 'Fighter Stufe 1: Ref sollte 0 sein (schlecht)');
  assert.strictEqual(result.wil, 0, 'Fighter Stufe 1: Wil sollte 0 sein (schlecht)');
});

test('SaveCalculator - Rogue Stufe 1: Fort=0, Ref=2, Wil=0', () => {
  const result = SaveCalculator.calculateSaves([{ classType: 'rogue', level: 1 }]);
  assert.strictEqual(result.fort, 0, 'Rogue Stufe 1: Fort sollte 0 sein');
  assert.strictEqual(result.ref, 2, 'Rogue Stufe 1: Ref sollte 2 sein (gut)');
  assert.strictEqual(result.wil, 0, 'Rogue Stufe 1: Wil sollte 0 sein');
});

test('SaveCalculator - Wizard Stufe 1: Fort=0, Ref=0, Wil=2', () => {
  const result = SaveCalculator.calculateSaves([{ classType: 'wizard', level: 1 }]);
  assert.strictEqual(result.fort, 0, 'Wizard Stufe 1: Fort sollte 0 sein');
  assert.strictEqual(result.ref, 0, 'Wizard Stufe 1: Ref sollte 0 sein');
  assert.strictEqual(result.wil, 2, 'Wizard Stufe 1: Wil sollte 2 sein (gut)');
});

test('SaveCalculator - Cleric Stufe 1: Fort=2, Ref=0, Wil=2', () => {
  const result = SaveCalculator.calculateSaves([{ classType: 'cleric', level: 1 }]);
  assert.strictEqual(result.fort, 2, 'Cleric Stufe 1: Fort sollte 2 sein');
  assert.strictEqual(result.ref, 0, 'Cleric Stufe 1: Ref sollte 0 sein');
  assert.strictEqual(result.wil, 2, 'Cleric Stufe 1: Wil sollte 2 sein');
});

test('SaveCalculator - Fighter Stufe 10: Fort=7, Ref=3, Wil=3', () => {
  // Gut: 2 + floor(0.5 * 10) = 2 + 5 = 7
  // Schlecht: floor(10/3) = 3
  const result = SaveCalculator.calculateSaves([{ classType: 'fighter', level: 10 }]);
  assert.strictEqual(result.fort, 7, 'Fighter Stufe 10: Fort sollte 7 sein');
  assert.strictEqual(result.ref, 3, 'Fighter Stufe 10: Ref sollte 3 sein');
  assert.strictEqual(result.wil, 3, 'Fighter Stufe 10: Wil sollte 3 sein');
});

test('SaveCalculator - Multiklasse Fighter 5 + Wizard 5: additive Progression', () => {
  // Fighter 5: Fort = 2+floor(0.5*5)=2+2=4, Ref = floor(5/3)=1, Wil = floor(5/3)=1
  // Wizard 5: Fort = floor(5/3)=1, Ref = floor(5/3)=1, Wil = 2+floor(0.5*5)=2+2=4
  // Gesamt: Fort=5, Ref=2, Wil=5
  const result = SaveCalculator.calculateSaves([
    { classType: 'fighter', level: 5 },
    { classType: 'wizard', level: 5 }
  ]);
  assert.strictEqual(result.fort, 5, 'Fighter5+Wizard5: Fort sollte 5 sein');
  assert.strictEqual(result.ref, 2, 'Fighter5+Wizard5: Ref sollte 2 sein');
  assert.strictEqual(result.wil, 5, 'Fighter5+Wizard5: Wil sollte 5 sein');
});

// ---------------------------------------------------------------------------
// Gruppe: Combatant - Magic Items beeinflussen Saves
// ---------------------------------------------------------------------------

test('Saves - Magic Item mit type=save, target=all, value=2 erhöht alle Saves um 2 (ausgerüstet)', () => {
  // Basis-PC mit Klasse fighter Stufe 1: za.base=2, ref.base=0, wil.base=0
  // CON/DEX/WIS=10 → Mods=0
  const pc = makePlainPC([{ classType: 'fighter', level: 1 }]);

  // Ohne Ausrüstung: Fort=2, Ref=0, Wil=0
  const baseFort = pc.za.getValue();
  const baseRef = pc.ref.getValue();
  const baseWil = pc.wil.getValue();

  // Füge equipped Resistenz-Item hinzu
  pc.items = [
    new Item({
      name: 'Schutzmantel +2',
      slot: 'shoulders',
      isEquipped: true,
      effects: [{ type: 'save', target: 'all', value: 2 }]
    })
  ];
  pc.rebuildStatModifiers();

  assert.strictEqual(pc.za.getValue(), baseFort + 2, 'Fort sollte um 2 erhöht sein');
  assert.strictEqual(pc.ref.getValue(), baseRef + 2, 'Ref sollte um 2 erhöht sein');
  assert.strictEqual(pc.wil.getValue(), baseWil + 2, 'Wil sollte um 2 erhöht sein');
});

test('Saves - Magic Item nicht ausgerüstet: kein Bonus auf Saves', () => {
  const pc = makePlainPC([{ classType: 'fighter', level: 1 }]);
  const baseFort = pc.za.getValue();
  const baseRef = pc.ref.getValue();
  const baseWil = pc.wil.getValue();

  // Item ist NICHT ausgerüstet
  pc.items = [
    new Item({
      name: 'Schutzmantel +2',
      slot: 'shoulders',
      isEquipped: false,
      effects: [{ type: 'save', target: 'all', value: 2 }]
    })
  ];
  pc.rebuildStatModifiers();

  assert.strictEqual(pc.za.getValue(), baseFort, 'Fort sollte unverändert sein');
  assert.strictEqual(pc.ref.getValue(), baseRef, 'Ref sollte unverändert sein');
  assert.strictEqual(pc.wil.getValue(), baseWil, 'Wil sollte unverändert sein');
});

test('Saves - Zwei Resistance-Save-Items: nur der höchste Bonus gilt (kein Stacking)', () => {
  // Resistance-Boni stacken nach D&D 3.5e RAW nicht.
  // Stat.getValue() verwendet Math.max() für typed bonuses (nicht dodge/untyped).
  const pc = makePlainPC([{ classType: 'fighter', level: 1 }]);
  pc.items = [
    new Item({
      name: 'Schutzmantel +2',
      slot: 'shoulders',
      isEquipped: true,
      effects: [{ type: 'save', target: 'all', value: 2 }]
    }),
    new Item({
      name: 'Schutzring +1',
      slot: 'slotless',
      isEquipped: true,
      effects: [{ type: 'save', target: 'all', value: 1 }]
    })
  ];

  pc.rebuildStatModifiers();

  // Fort base = 2 (fighter 1), CON mod = 0, Resistance: max(2,1) = 2
  // Gesamtwert: 2 + 2 = 4 (nicht 2+2+1=5)
  const expectedFort = 4;
  assert.strictEqual(
    pc.za.getValue(),
    expectedFort,
    `Fort sollte ${expectedFort} sein (Resistance stackt nicht: max(2,1)=2 + Basis=2)`
  );
});

// ---------------------------------------------------------------------------
// Gruppe: Combatant - Talente beeinflussen Saves
// ---------------------------------------------------------------------------

test('Saves - Talent great_fortitude (+2 Fort): Combatant wendet +2 auf za an', () => {
  const pc = makePlainPC([{ classType: 'fighter', level: 1 }]);
  const baseFort = pc.za.getValue();

  // Talent hinzufügen und neu berechnen
  pc.feats = [{ id: 'great_fortitude' }];
  pc.rebuildStatModifiers();

  assert.strictEqual(pc.za.getValue(), baseFort + 2, 'Fort sollte durch great_fortitude um 2 höher sein');
  assert.strictEqual(pc.ref.getValue(), pc.ref.base + 0, 'Ref sollte durch great_fortitude unverändert sein');
  assert.strictEqual(pc.wil.getValue(), pc.wil.base + 0, 'Wil sollte durch great_fortitude unverändert sein');
});

test('Saves - Talent iron_will (+2 Wil): Combatant wendet +2 auf wil an', () => {
  const pc = makePlainPC([{ classType: 'wizard', level: 1 }]);
  const baseWil = pc.wil.getValue();

  pc.feats = [{ id: 'iron_will' }];
  pc.rebuildStatModifiers();

  assert.strictEqual(pc.wil.getValue(), baseWil + 2, 'Wil sollte durch iron_will um 2 höher sein');
  assert.strictEqual(pc.za.getValue(), pc.za.base + 0, 'Fort sollte durch iron_will unverändert sein');
});

test('Saves - Talent lightning_reflexes (+2 Ref): Combatant wendet +2 auf ref an', () => {
  const pc = makePlainPC([{ classType: 'rogue', level: 1 }]);
  const baseRef = pc.ref.getValue();

  pc.feats = [{ id: 'lightning_reflexes' }];
  pc.rebuildStatModifiers();

  assert.strictEqual(pc.ref.getValue(), baseRef + 2, 'Ref sollte durch lightning_reflexes um 2 höher sein');
  assert.strictEqual(pc.wil.getValue(), pc.wil.base + 0, 'Wil sollte durch lightning_reflexes unverändert sein');
});
