/**
 * @module    startup.test.js
 * @summary   Smoke-Test: Überprüft, ob alle kritischen Module fehlerfrei importierbar sind
 *            und ihre öffentlichen Exports korrekt bereitstellen.
 *            Dieser Test hätte den App-Crash in PCResources.js (fehlende }) sofort aufgedeckt.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ─────────────────────────────────────────────────────────────────────────────
// TIER 1: Kernmodule — werden direkt bei App-Start importiert (app.js Zeile 1-4)
// ─────────────────────────────────────────────────────────────────────────────
describe('Startup - Kernmodule (app.js direkte Imports)', () => {

  it('state.js lässt sich importieren und CombatState ist ein Objekt', async () => {
    const mod = await import('../js/state.js');
    assert.ok(mod.CombatState, 'CombatState muss exportiert sein');
    assert.equal(typeof mod.CombatState, 'object');
    assert.equal(typeof mod.CombatState.loadFromStorage, 'function', 'loadFromStorage muss vorhanden sein');
    assert.equal(typeof mod.CombatState.getState, 'function', 'getState muss vorhanden sein');
    assert.equal(typeof mod.CombatState.addCombatant, 'function', 'addCombatant muss vorhanden sein');
  });

  it('rules.js lässt sich importieren und CombatRules ist ein Objekt', async () => {
    const mod = await import('../js/rules.js');
    assert.ok(mod.CombatRules, 'CombatRules muss exportiert sein');
    assert.equal(typeof mod.CombatRules.calculateMaxFeats, 'function', 'calculateMaxFeats muss vorhanden sein');
    assert.equal(typeof mod.CombatRules.checkSpellKnownLimit, 'function', 'checkSpellKnownLimit muss vorhanden sein');
    assert.equal(typeof mod.CombatRules.calculateBab, 'function', 'calculateBab muss vorhanden sein');
  });

  it('spells.js lässt sich importieren und CombatSpells ist ein Objekt', async () => {
    const mod = await import('../js/spells.js');
    assert.ok(mod.CombatSpells, 'CombatSpells muss exportiert sein');
    assert.equal(typeof mod.CombatSpells.loadSpells, 'function', 'loadSpells muss vorhanden sein');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// TIER 2: State-Schicht
// ─────────────────────────────────────────────────────────────────────────────
describe('Startup - State-Schicht', () => {

  it('state/PCManager.js lässt sich importieren und Kernfunktionen sind vorhanden', async () => {
    const mod = await import('../js/state/PCManager.js');
    // PCManager exportiert einzelne Funktionen (kein Namespace-Objekt)
    assert.equal(typeof mod.addPCFeat, 'function', 'addPCFeat muss exportiert sein');
    assert.equal(typeof mod.removePCFeat, 'function', 'removePCFeat muss exportiert sein');
    assert.equal(typeof mod.recalculatePCStats, 'function', 'recalculatePCStats muss exportiert sein');
    assert.equal(typeof mod.updatePCBatch, 'function', 'updatePCBatch muss exportiert sein');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// TIER 3: Regelschicht
// ─────────────────────────────────────────────────────────────────────────────
describe('Startup - Regelschicht (rules/)', () => {

  it('rules/AttackEngine.js lässt sich importieren', async () => {
    const mod = await import('../js/rules/AttackEngine.js');
    assert.ok(mod.AttackEngine, 'AttackEngine muss exportiert sein');
    assert.equal(typeof mod.AttackEngine.calculateAttackSequence, 'function');
  });

  it('rules/classes/PaladinRules.js lässt sich importieren', async () => {
    const mod = await import('../js/rules/classes/PaladinRules.js');
    assert.ok(mod.PaladinRules, 'PaladinRules muss exportiert sein');
    assert.equal(typeof mod.PaladinRules.recalculateDailyAbilities, 'function');
  });

  it('rules/classes/RangerRules.js lässt sich importieren', async () => {
    const mod = await import('../js/rules/classes/RangerRules.js');
    assert.ok(mod.RangerRules, 'RangerRules muss exportiert sein');
    assert.equal(typeof mod.RangerRules.getFavoredEnemyBonus, 'function');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// TIER 4: UI-Schicht (die kritischste — hier treten Parse-Fehler am häufigsten auf)
// ─────────────────────────────────────────────────────────────────────────────
describe('Startup - UI-Schicht: Player-Komponenten', () => {

  it('PCSpellDialogs.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/player/PCSpellDialogs.js');
    assert.equal(typeof mod.cleanProhibitedSpells, 'function');
    assert.equal(typeof mod.showSpellDetailsDialog, 'function');
    assert.equal(typeof mod.showSpellCreatorWizard, 'function');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// TIER 6: UI-Schicht — Klassen-Feature-Komponenten (Aufgelöst durch React-Migration)
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// TIER 7: UI-Schicht — Dialoge
// ─────────────────────────────────────────────────────────────────────────────
describe('Startup - UI-Schicht: Dialoge', () => {

  it('AttackChoiceDialog.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/dialogs/AttackChoiceDialog.js');
    assert.equal(typeof mod.showAttackChoiceDialog, 'function');
  });

  it('DamageChoiceDialog.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/dialogs/DamageChoiceDialog.js');
    assert.equal(typeof mod.showDamageChoiceDialog, 'function');
  });

  it('FeatScrollDialog.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/dialogs/FeatScrollDialog.js');
    assert.equal(typeof mod.showFeatScrollDialog, 'function');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// TIER 8: Modellschicht
// ─────────────────────────────────────────────────────────────────────────────
describe('Startup - Modellschicht', () => {

  it('models/Combatant.js lässt sich importieren und Combatant ist konstruierbar', async () => {
    const mod = await import('../js/models/Combatant.js');
    assert.ok(mod.Combatant, 'Combatant muss exportiert sein');
    const c = new mod.Combatant({ name: 'Test', type: 'p', hp: 10, maxHP: 10, ac: 10, init: 5 });
    assert.equal(c.name, 'Test');
  });

  it('models/helpers/classes/DruidHelper.js lässt sich importieren', async () => {
    const mod = await import('../js/models/helpers/classes/DruidHelper.js');
    // DruidHelper exportiert Funktionen direkt, kein Namespace-Objekt
    assert.equal(typeof mod.enterShape, 'function', 'enterShape muss exportiert sein');
    assert.equal(typeof mod.exitShape, 'function', 'exitShape muss exportiert sein');
  });

  it('models/helpers/modifiers/BaseSavingThrowModifierApplier.js lässt sich importieren', async () => {
    const mod = await import('../js/models/helpers/modifiers/BaseSavingThrowModifierApplier.js');
    assert.equal(typeof mod.applyBaseSavingThrowModifiers, 'function', 'applyBaseSavingThrowModifiers muss exportiert sein');
  });

});
