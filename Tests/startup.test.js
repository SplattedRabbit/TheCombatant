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

  it('PCSpellsTab.js und PCFeaturesTab.js lassen sich importieren und exportieren renderPCSpells/renderPCFeatures', async () => {
    const spellsMod = await import('../js/ui/components/player/PCSpellsTab.js');
    const featuresMod = await import('../js/ui/components/player/PCFeaturesTab.js');
    assert.equal(typeof spellsMod.renderPCSpells, 'function', 'renderPCSpells muss exportiert sein');
    assert.equal(typeof featuresMod.renderPCFeatures, 'function', 'renderPCFeatures muss exportiert sein');
  });

  it('PCSpellDialogs.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/player/PCSpellDialogs.js');
    assert.equal(typeof mod.cleanProhibitedSpells, 'function');
    assert.equal(typeof mod.showSpellDetailsDialog, 'function');
    assert.equal(typeof mod.showSpellCreatorWizard, 'function');
  });

  it('PCFeatsTab.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/player/PCFeatsTab.js');
    assert.equal(typeof mod.renderPCFeats, 'function', 'renderPCFeats muss exportiert sein');
    assert.equal(typeof mod.checkPrerequisites, 'function', 'checkPrerequisites muss exportiert sein');
  });

  it('PCAttributes.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/player/PCAttributes.js');
    assert.equal(typeof mod.renderPCAttributes, 'function');
  });

  it('PCSkillsTab.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/player/PCSkillsTab.js');
    assert.equal(typeof mod.renderPCSkills, 'function');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// TIER 5: UI-Schicht — Offense-Subkomponenten
// ─────────────────────────────────────────────────────────────────────────────
describe('Startup - UI-Schicht: Offense-Komponenten', () => {

  it('CombatSettingsRenderer.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/player/offense/CombatSettingsRenderer.js');
    assert.equal(typeof mod.renderCombatSettingsHtml, 'function', 'renderCombatSettingsHtml muss exportiert sein');
    assert.equal(typeof mod.bindCombatSettingsEvents, 'function', 'bindCombatSettingsEvents muss exportiert sein');
  });

  it('EquipmentSlotsRenderer.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/player/offense/EquipmentSlotsRenderer.js');
    // Modul muss ohne Fehler laden (Exports per default oder intern)
    assert.ok(mod !== null, 'Modul muss ladbar sein');
  });

  it('NaturalAttacksRenderer.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/player/offense/NaturalAttacksRenderer.js');
    assert.ok(mod !== null, 'Modul muss ladbar sein');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// TIER 6: UI-Schicht — Klassen-Feature-Komponenten
// ─────────────────────────────────────────────────────────────────────────────
describe('Startup - UI-Schicht: Klassen-Feature-Komponenten', () => {

  it('BarbarianFeatures.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/class-features/BarbarianFeatures.js');
    assert.ok(mod.BarbarianFeatures, 'BarbarianFeatures muss exportiert sein');
  });

  it('BardFeatures.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/class-features/BardFeatures.js');
    assert.ok(mod.BardFeatures);
  });

  it('MonkFeatures.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/class-features/MonkFeatures.js');
    assert.ok(mod.MonkFeatures);
  });

  it('RangerFeatures.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/class-features/RangerFeatures.js');
    assert.ok(mod.RangerFeatures);
  });

  it('RogueFeatures.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/class-features/RogueFeatures.js');
    assert.ok(mod.RogueFeatures);
  });

  it('SorcererFeatures.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/class-features/SorcererFeatures.js');
    assert.ok(mod.SorcererFeatures);
  });

  it('WizardFeatures.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/class-features/WizardFeatures.js');
    assert.ok(mod.WizardFeatures);
  });

  it('DruidFeatures.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/components/class-features/DruidFeatures.js');
    assert.ok(mod.DruidFeatures);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// TIER 7: UI-Schicht — Dialoge
// ─────────────────────────────────────────────────────────────────────────────
describe('Startup - UI-Schicht: Dialoge', () => {

  it('AttackChoiceDialog.js lässt sich importieren', async () => {
    const mod = await import('../js/ui/dialogs/AttackChoiceDialog.js');
    assert.equal(typeof mod.showAttackChoiceDialog, 'function');
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
