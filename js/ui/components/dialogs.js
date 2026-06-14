// Facade for all dialog components to preserve backward compatibility.
// Delegates to modern React dialogs in the browser, and falls back to legacy DOM-based dialogs in JSDOM tests.

import * as legacyBase from '../dialogs/BaseDialogs.js';
import * as legacyAttack from '../dialogs/AttackChoiceDialog.js';
import * as legacyDamage from '../dialogs/DamageChoiceDialog.js';
import * as legacyPrepare from '../dialogs/PrepareSpellDialog.js';
import * as legacySession from '../dialogs/SessionDialog.js';
import * as legacySpellScroll from '../dialogs/SpellScrollDialog.js';
import * as legacyFeatScroll from '../dialogs/FeatScrollDialog.js';

const getBridge = () => {
  if (typeof window !== 'undefined' && window.__REACT_DIALOG_BRIDGE__) {
    return window.__REACT_DIALOG_BRIDGE__;
  }
  return null;
};

export function showInfoDialog(opts) {
  const bridge = getBridge();
  if (bridge && bridge.showInfoDialog) return bridge.showInfoDialog(opts);
  return legacyBase.showInfoDialog(opts);
}

export function showCustomAlert(title, message, buttonText, icon, onClose) {
  const bridge = getBridge();
  if (bridge && bridge.showCustomAlert) return bridge.showCustomAlert(title, message, buttonText, icon, onClose);
  return legacyBase.showCustomAlert(title, message, buttonText, icon, onClose);
}

export function showCustomConfirm(title, messageHtml, onConfirm, onCancel) {
  const bridge = getBridge();
  if (bridge && bridge.showCustomConfirm) return bridge.showCustomConfirm(title, messageHtml, onConfirm, onCancel);
  return legacyBase.showCustomConfirm(title, messageHtml, onConfirm, onCancel);
}

export function showCustomPrompt(title, message, value, buttonText, onConfirm) {
  const bridge = getBridge();
  if (bridge && bridge.showCustomPrompt) return bridge.showCustomPrompt(title, message, value, buttonText, onConfirm);
  return legacyBase.showCustomPrompt(title, message, value, buttonText, onConfirm);
}

export function showNewDayTemplateDialog(pc, templates, onConfirm) {
  const bridge = getBridge();
  if (bridge && bridge.showNewDayTemplateDialog) return bridge.showNewDayTemplateDialog(pc, templates, onConfirm);
  return legacyBase.showNewDayTemplateDialog(pc, templates, onConfirm);
}

export function showRollBreakdown(title, diceFormula, breakdownItems, event, onRollClick) {
  const bridge = getBridge();
  if (bridge && bridge.showRollBreakdown) return bridge.showRollBreakdown(title, diceFormula, breakdownItems, event, onRollClick);
  return legacyBase.showRollBreakdown(title, diceFormula, breakdownItems, event, onRollClick);
}

export function showSampleChoiceDialog(isPlayer, onConfirm) {
  const bridge = getBridge();
  if (bridge && bridge.showSampleChoiceDialog) return bridge.showSampleChoiceDialog(isPlayer, onConfirm);
  return legacyBase.showSampleChoiceDialog(isPlayer, onConfirm);
}

export function showAttackChoiceDialog(pc, weapon, event, options) {
  const bridge = getBridge();
  if (bridge && bridge.showAttackChoiceDialog) return bridge.showAttackChoiceDialog(pc, weapon, event, options);
  return legacyAttack.showAttackChoiceDialog(pc, weapon, event, options);
}

export function showDamageChoiceDialog(pc, weapon, event, options) {
  const bridge = getBridge();
  if (bridge && bridge.showDamageChoiceDialog) return bridge.showDamageChoiceDialog(pc, weapon, event, options);
  return legacyDamage.showDamageChoiceDialog(pc, weapon, event, options);
}

export function showPrepareSpellDialog(pc, classKey, onComplete) {
  const bridge = getBridge();
  if (bridge && bridge.showPrepareSpellDialog) return bridge.showPrepareSpellDialog(pc, classKey, onComplete);
  return legacyPrepare.showPrepareSpellDialog(pc, classKey, onComplete);
}

export function showCastSpontaneousSpellDialog(pc, spellKey, onComplete) {
  const bridge = getBridge();
  if (bridge && bridge.showCastSpontaneousSpellDialog) return bridge.showCastSpontaneousSpellDialog(pc, spellKey, onComplete);
  return legacyPrepare.showCastSpontaneousSpellDialog(pc, spellKey, onComplete);
}

export function showSessionModal() {
  const bridge = getBridge();
  if (bridge && bridge.showSessionModal) return bridge.showSessionModal();
  return legacySession.showSessionModal();
}

export function showSpellScrollDialog(spell, isNew, onSave) {
  const bridge = getBridge();
  if (bridge && bridge.showSpellScrollDialog) return bridge.showSpellScrollDialog(spell, isNew, onSave);
  return legacySpellScroll.showSpellScrollDialog(spell, isNew, onSave);
}

export function showFeatScrollDialog(feat, pc, isLearned, option, event) {
  const bridge = getBridge();
  if (bridge && bridge.showFeatScrollDialog) return bridge.showFeatScrollDialog(feat, pc, isLearned, option, event);
  return legacyFeatScroll.showFeatScrollDialog(feat, pc, isLearned, option, event);
}
