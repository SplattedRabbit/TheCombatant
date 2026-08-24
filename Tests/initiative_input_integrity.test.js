// Tests/initiative_input_integrity.test.js - BDD Verification for Initiative & Defenses Input Buffering
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Stat } from '../js/models/Stat.js';
import { recalculatePCStats, updatePCNumber } from '../js/state/pc/PCGeneral.js';
import { getState, getActivePC } from '../js/state/state-core.js';
import {
  getStatMod,
  formatMod,
  extractStatValue,
  calculateInitiativeTotal
} from '../src/components/player/attributeHelper.ts';

describe('BDD Suite 1: Initiative Workflow & Input Integrity', () => {
  let mockPC;

  beforeEach(() => {
    mockPC = {
      id: 'valerius-test-1',
      name: 'Valerius',
      dex: new Stat(18), // DEX 18 -> Mod +4
      con: new Stat(14), // CON 14 -> Mod +2
      wis: new Stat(12), // WIS 12 -> Mod +1
      ac: new Stat(18),
      acTouch: new Stat(14),
      acFlat: new Stat(14),
      acNatural: 2,
      acDeflection: 1,
      acMisc: 0,
      autoAC: false,
      sr: 15,
      bw: 30,
      dr: '5/magic',
      reach: '5 ft',
      immunities: 'sleep',
      resistances: 'fire 5',
      baseZa: new Stat(4),
      baseRef: new Stat(2),
      baseWil: new Stat(1),
      za: new Stat(6),
      ref: new Stat(6),
      wil: new Stat(2),
      iniMisc: 0,
      feats: [],
      classes: [{ classType: 'paladin', level: 5 }],
      spellSlots: {},
      dailyAbilities: [],
      rawInit: null,
      init: 0
    };
  });

  test('Szenario 1.1: Initialer Zustand vor dem Kampf (Noch nicht gewürfelt -> Total zeigt --)', () => {
    // Given: Ein Charakter mit Initiative-Modifikator +4, aber noch ohne Wurf (rawInit = null)
    const dexMod = getStatMod(mockPC.dex);
    assert.equal(dexMod, 4, 'DEX-Modifikator muss +4 sein');

    recalculatePCStats(mockPC);
    assert.equal(mockPC.init, 0, 'Interner init-Wert vor dem Wurf ist 0 (uninitialisiert)');

    // When: Initiative Total berechnet wird
    const initResult = calculateInitiativeTotal(mockPC.rawInit, dexMod);

    // Then: Total zeigt sauber '--' und total ist null
    assert.equal(initResult.display, '--', 'Anzeige vor dem Wurf muss -- sein');
    assert.equal(initResult.total, null, 'Total-Wert vor dem Wurf muss null sein');
  });

  test('Szenario 1.2: Physischer d20-Wurf am Spieltisch (14 gewürfelt + 4 Mod = 18 Total)', () => {
    // Given: Charakter hat DEX Mod +4 und Spieler würfelt am Tisch eine 14
    const dexMod = getStatMod(mockPC.dex);
    const totIni = dexMod + (parseInt(mockPC.iniMisc) || 0);
    assert.equal(totIni, 4);

    // When: Spieler trägt gewürfelte 14 ein
    mockPC.rawInit = 14;
    recalculatePCStats(mockPC);
    const initResult = calculateInitiativeTotal(mockPC.rawInit, totIni);

    // Then: Total berechnet exakt 18 (14 + 4)
    assert.equal(initResult.display, '18', 'Display muss 18 sein');
    assert.equal(initResult.total, 18, 'Total muss 18 sein');
    assert.equal(mockPC.init, 18, 'pc.init muss auf 18 synchronisiert sein');
  });

  test('Szenario 1.3: Lokale Eingabepufferung (Backspace/Leeres Feld erzeugt keinen Absturz und schaltet Total auf -- um)', () => {
    // Given: Spieler hat 14 eingetragen (Total = 18)
    const totIni = 4;
    mockPC.rawInit = 14;
    recalculatePCStats(mockPC);
    assert.equal(mockPC.init, 18);

    // When: Spieler drückt Backspace und leert das Feld im lokalen Eingabepuffer (Wert = "")
    const localBufferedValue = '';
    const intermediateResult = calculateInitiativeTotal(localBufferedValue, totIni);

    // Then: Anzeige schaltet sicher auf '--' zurück ohne Absturz und ohne 'NaN'
    assert.equal(intermediateResult.display, '--');
    assert.equal(intermediateResult.total, null);
    assert.notEqual(intermediateResult.display, 'NaN');

    // When: Spieler tippt '18' und committet
    const committedValue = '18';
    mockPC.rawInit = parseInt(committedValue, 10);
    recalculatePCStats(mockPC);
    const finalResult = calculateInitiativeTotal(mockPC.rawInit, totIni);

    // Then: Total aktualisiert sich flüssig auf 22 (18 + 4)
    assert.equal(finalResult.display, '22');
    assert.equal(finalResult.total, 22);
    assert.equal(mockPC.init, 22);
  });

  test('Szenario 1.4: Typen-Sicherheit bei Stat-Objekten vs. Primitiven (Kein [object Object] und kein NaN)', () => {
    // Given: Verschiedene Datentypen (Stat-Instanzen, Zahlen, Strings, null, undefined)
    const complexStat = new Stat(16);
    complexStat.addModifier(2, 'armor', 'Chainmail'); // 16 + 2 = 18

    // When: extractStatValue aufgerufen wird
    const extractedFromStat = extractStatValue(complexStat, 10);
    const extractedFromNumber = extractStatValue(15, 10);
    const extractedFromString = extractStatValue('20', 10);
    const extractedFromNull = extractStatValue(null, 10);
    const extractedFromUndefined = extractStatValue(undefined, 10);
    const extractedFromNaN = extractStatValue(NaN, 10);

    // Then: Alle Werte sind sichere Zahlen, niemals NaN oder [object Object]
    assert.equal(extractedFromStat, 18, 'Stat mit Modifikatoren muss 18 liefern');
    assert.equal(extractedFromNumber, 15, 'Zahl 15 muss 15 liefern');
    assert.equal(extractedFromString, 20, 'String "20" muss als Zahl 20 geparst werden');
    assert.equal(extractedFromNull, 10, 'null muss auf Fallback 10 zurückfallen');
    assert.equal(extractedFromUndefined, 10, 'undefined muss auf Fallback 10 zurückfallen');
    assert.equal(extractedFromNaN, 10, 'NaN muss auf Fallback 10 zurückfallen');
  });
});
