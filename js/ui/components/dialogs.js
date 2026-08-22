/**
 * @module    dialogs
 * @summary   Facade for all dialog components. Delegates to modern React dialogs in the browser,
 *            and falls back to simple DOM-based overlays in JSDOM tests.
 */

const getBridge = () => {
  if (typeof window !== 'undefined' && window.__REACT_DIALOG_BRIDGE__) {
    return window.__REACT_DIALOG_BRIDGE__;
  }
  return null;
};

export function showCustomAlert(title, message, buttonText, icon, onClose) {
  const bridge = getBridge();
  if (bridge && bridge.showCustomAlert) {
    return bridge.showCustomAlert(title, message, buttonText, icon, onClose);
  }
  
  // Test/DOM Fallback
  if (typeof document !== 'undefined') {
    const overlay = document.createElement('div');
    overlay.id = 'customAlertOverlay';
    overlay.innerHTML = `<button class="pc-alert-ok-btn">OK</button>`;
    document.body.appendChild(overlay);
    const btn = overlay.querySelector('.pc-alert-ok-btn');
    if (btn) {
      btn.onclick = () => {
        overlay.remove();
        if (onClose) onClose();
      };
    }
  } else {
    if (onClose) onClose();
  }
}

export function showCustomConfirm(title, messageHtml, onConfirm, onCancel) {
  const bridge = getBridge();
  if (bridge && bridge.showCustomConfirm) {
    return bridge.showCustomConfirm(title, messageHtml, onConfirm, onCancel);
  }

  // Test/DOM Fallback
  if (typeof document !== 'undefined') {
    const overlay = document.createElement('div');
    overlay.id = 'customConfirmOverlay';
    overlay.innerHTML = `<button class="pc-confirm-yes-btn">Ja</button><button class="pc-confirm-no-btn">Nein</button>`;
    document.body.appendChild(overlay);
    const yesBtn = overlay.querySelector('.pc-confirm-yes-btn');
    const noBtn = overlay.querySelector('.pc-confirm-no-btn');
    if (yesBtn) {
      yesBtn.onclick = () => {
        overlay.remove();
        if (onConfirm) onConfirm();
      };
    }
    if (noBtn) {
      noBtn.onclick = () => {
        overlay.remove();
        if (onCancel) onCancel();
      };
    }
  } else {
    if (onConfirm) onConfirm();
  }
}

export function showCustomPrompt(title, message, value, buttonText, onConfirm) {
  const bridge = getBridge();
  let actualOnConfirm = onConfirm;
  let actualButtonText = buttonText || 'OK';
  if (typeof buttonText === 'function') {
    actualOnConfirm = buttonText;
    actualButtonText = 'OK';
  }

  if (bridge && bridge.showCustomPrompt) {
    return bridge.showCustomPrompt(title, message, value, actualButtonText, actualOnConfirm);
  }

  // Test/DOM Fallback
  if (typeof document !== 'undefined') {
    const overlay = document.createElement('div');
    overlay.id = 'customPromptOverlay';
    overlay.innerHTML = `<input class="pc-prompt-input" value="${value || ''}"/><button class="pc-prompt-ok-btn">Speichern</button>`;
    document.body.appendChild(overlay);
    const okBtn = overlay.querySelector('.pc-prompt-ok-btn');
    const input = overlay.querySelector('.pc-prompt-input');
    if (okBtn) {
      okBtn.onclick = () => {
        const val = input ? input.value : value;
        overlay.remove();
        if (actualOnConfirm) actualOnConfirm(val);
      };
    }
  } else {
    if (actualOnConfirm) actualOnConfirm(value);
  }
}

export function showHealingRollDialog(opts) {
  const bridge = getBridge();
  if (bridge && bridge.showHealingRollDialog) return bridge.showHealingRollDialog(opts);
  if (opts && opts.onConfirm) opts.onConfirm('');
}

export function showItemDamageDialog(opts) {
  const bridge = getBridge();
  if (bridge && bridge.showItemDamageDialog) return bridge.showItemDamageDialog(opts);
  if (opts && opts.onConfirm) opts.onConfirm();
}

export function showInfoDialog(opts) {
  const bridge = getBridge();
  if (bridge && bridge.showInfoDialog) return bridge.showInfoDialog(opts);
  console.log('info dialog stub called', opts);
}

export function showNewDayTemplateDialog(pc, templates, onConfirm) {
  const bridge = getBridge();
  if (bridge && bridge.showNewDayTemplateDialog) return bridge.showNewDayTemplateDialog(pc, templates, onConfirm);
  if (onConfirm) onConfirm('');
}

export function showRollBreakdown(title, diceFormula, breakdownItems, event, onRollClick) {
  const bridge = getBridge();
  if (bridge && bridge.showRollBreakdown) return bridge.showRollBreakdown(title, diceFormula, breakdownItems, event, onRollClick);
  if (onRollClick) onRollClick(0);
}

export function showSampleChoiceDialog(isPlayer, onConfirm) {
  const bridge = getBridge();
  if (bridge && bridge.showSampleChoiceDialog) return bridge.showSampleChoiceDialog(isPlayer, onConfirm);
  if (onConfirm) onConfirm('');
}

export function showAttackChoiceDialog(pc, weapon, event, options) {
  const bridge = getBridge();
  if (bridge && bridge.showAttackChoiceDialog) return bridge.showAttackChoiceDialog(pc, weapon, event, options);
  console.log('attack choice dialog stub called');
}

export function showDamageChoiceDialog(pc, weapon, event, options) {
  const bridge = getBridge();
  if (bridge && bridge.showDamageChoiceDialog) return bridge.showDamageChoiceDialog(pc, weapon, event, options);
  console.log('damage choice dialog stub called');
}

export function showPrepareSpellDialog(pc, classKey, onComplete) {
  const bridge = getBridge();
  if (bridge && bridge.showPrepareSpellDialog) return bridge.showPrepareSpellDialog(pc, classKey, onComplete);
  if (onComplete) onComplete();
}

export function showCastSpontaneousSpellDialog(pc, spellKey, onComplete) {
  const bridge = getBridge();
  if (bridge && bridge.showCastSpontaneousSpellDialog) return bridge.showCastSpontaneousSpellDialog(pc, spellKey, onComplete);
  if (onComplete) onComplete();
}

export function showSessionModal() {
  const bridge = getBridge();
  if (bridge && bridge.showSessionModal) return bridge.showSessionModal();
  console.log('session modal stub called');
}

export function showSpellScrollDialog(spell, isNew, onSave) {
  const bridge = getBridge();
  if (bridge && bridge.showSpellScrollDialog) return bridge.showSpellScrollDialog(spell, isNew, onSave);
  if (onSave) onSave();
}

export function showFeatScrollDialog(feat, pc, isLearned, option, event) {
  const bridge = getBridge();
  if (bridge && bridge.showFeatScrollDialog) return bridge.showFeatScrollDialog(feat, pc, isLearned, option, event);
  console.log('feat scroll dialog stub called');
}
