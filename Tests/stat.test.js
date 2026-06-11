// Tests/stat.test.js - Test suite for D&D 3.5e Stat modifier stacking rules

import { test } from 'node:test';
import assert from 'node:assert';
import { Stat } from '../js/models/Stat.js';

test('Stat - Basisfunktionen und Initialisierung', () => {
  // Initialisierung mit Nummer
  const s1 = new Stat(14);
  assert.strictEqual(s1.base, 14);
  assert.strictEqual(s1.getValue(), 14);

  // Initialisierung mit Objekt (Deserialisierung/Sync-Protokoll)
  const s2 = new Stat({ base: 16, modifiers: [{ value: 2, type: 'dodge', source: 'Aura' }] });
  assert.strictEqual(s2.base, 16);
  assert.strictEqual(s2.modifiers.length, 1);
  assert.strictEqual(s2.getValue(), 18);

  // Fallback auf Standardwert 10 bei ungültiger Eingabe
  const s3 = new Stat(undefined);
  assert.strictEqual(s3.base, 10);
});

test('Stat - Kumulierung von Dodge und Untyped Boni (additiv)', () => {
  const s = new Stat(10);
  
  // Dodge Boni müssen addiert werden
  s.addModifier(2, 'dodge', 'Spell A');
  s.addModifier(3, 'dodge', 'Spell B');
  
  // Untyped Boni müssen addiert werden
  s.addModifier(1, 'untyped', 'Feat A');
  s.addModifier(4, 'untyped', 'Feat B');
  
  // Base 10 + Dodge (2+3) + Untyped (1+4) = 20
  assert.strictEqual(s.getValue(), 20, 'Dodge und Untyped Boni müssen addiert werden');
});

test('Stat - Modifikatoren anderer Typen (nur der höchste zählt)', () => {
  const s = new Stat(10);
  
  // Enhancement Boni: Nur der höchste (+4) sollte zählen
  s.addModifier(2, 'enhancement', 'Item A');
  s.addModifier(4, 'enhancement', 'Item B');
  s.addModifier(1, 'enhancement', 'Item C');

  // Morale Boni: Nur der höchste (+3) sollte zählen
  s.addModifier(3, 'morale', 'Spell X');
  s.addModifier(2, 'morale', 'Spell Y');

  // Base 10 + Enhancement (max 4) + Morale (max 3) = 17
  assert.strictEqual(s.getValue(), 17, 'Bei typisierten Boni darf nur der höchste angewendet werden');
});

test('Stat - Gemischte Modifikatoren', () => {
  const s = new Stat(10);

  // Dodge: 2 + 1 = 3
  s.addModifier(2, 'dodge', 'D1');
  s.addModifier(1, 'dodge', 'D2');

  // Untyped: 3 + 2 = 5
  s.addModifier(3, 'untyped', 'U1');
  s.addModifier(2, 'untyped', 'U2');

  // Enhancement: max(3, 1) = 3
  s.addModifier(3, 'enhancement', 'E1');
  s.addModifier(1, 'enhancement', 'E2');

  // Morale: max(2, 4) = 4
  s.addModifier(2, 'morale', 'M1');
  s.addModifier(4, 'morale', 'M2');

  // Base 10 + Dodge (3) + Untyped (5) + Enhancement (3) + Morale (4) = 25
  assert.strictEqual(s.getValue(), 25);
  assert.strictEqual(s.getModifierSum(), 15);
});

test('Stat - Modifikator-Quellen-Verwaltung', () => {
  const s = new Stat(10);

  // Hinzufügen von derselben Quelle überschreibt alten Wert dieser Quelle
  s.addModifier(2, 'enhancement', 'Stärke-Gürtel');
  assert.strictEqual(s.getValue(), 12);

  s.addModifier(4, 'enhancement', 'Stärke-Gürtel');
  assert.strictEqual(s.getValue(), 14);
  assert.strictEqual(s.modifiers.length, 1, 'Die alte Modifikator-Instanz der gleichen Quelle muss ersetzt worden sein');

  // Entfernen von Quelle
  s.removeModifiersFromSource('Stärke-Gürtel');
  assert.strictEqual(s.getValue(), 10);
  assert.strictEqual(s.modifiers.length, 0);
});

test('Stat - Negativwerte und sonstige Ränder', () => {
  const s = new Stat(10);

  // Untyped Strafen (negative Werte) sollten subtrahiert werden
  s.addModifier(-2, 'untyped', 'Schwächung');
  assert.strictEqual(s.getValue(), 8);

  // Typisierte Strafen (negative Werte) verhalten sich laut D&D 3.5e-Regeln so,
  // dass sie ebenfalls subtrahiert werden (sie stapeln sich).
  s.addModifier(-2, 'morale', 'Furcht-Typisiert');
  assert.strictEqual(s.getValue(), 6, 'Typisierte negative Boni (Mali) müssen angewendet werden');
});
