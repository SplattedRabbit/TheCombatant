/**
 * @module    BaseDialogs
 * @summary   Facade/test fallback for BaseDialogs. Delegates to React bridge.
 */

const getBridge = () => {
  if (typeof window !== 'undefined' && window.__REACT_DIALOG_BRIDGE__) {
    return window.__REACT_DIALOG_BRIDGE__;
  }
  if (typeof globalThis !== 'undefined' && globalThis.__REACT_DIALOG_BRIDGE__) {
    return globalThis.__REACT_DIALOG_BRIDGE__;
  }
  return null;
};

export function showParchmentMessage(text, sender = 'Spielleiter') {
  const bridge = getBridge();
  if (bridge && bridge.showParchmentMessage) {
    return bridge.showParchmentMessage(text, sender);
  }

  // JSDOM Test Fallback / DOM fallback
  if (typeof document !== 'undefined') {
    const existing = document.getElementById('parchmentMessageOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'parchmentMessageOverlay';
    overlay.innerHTML = `
      <div class="parchment-box">
        <span class="message-text">${text}</span>
        <button class="parchment-close-btn">Schließen</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const btn = overlay.querySelector('.parchment-close-btn');
    if (btn) {
      btn.onclick = () => {
        overlay.remove();
      };
    }
    return {
      dismiss: () => overlay.remove()
    };
  }
  
  console.log('showParchmentMessage stub called:', text, sender);
  return {
    dismiss: () => {}
  };
}

export function showLootRevealDialog(item, category = 'items', onAcknowledge) {
  const bridge = getBridge();
  if (bridge && bridge.showLootRevealDialog) {
    return bridge.showLootRevealDialog(item, category, onAcknowledge);
  }

  // JSDOM Test Fallback / DOM fallback
  if (typeof document !== 'undefined') {
    const existing = document.getElementById('lootRevealOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'lootRevealOverlay';
    overlay.innerHTML = `
      <div class="loot-reveal-box">
        <span class="item-name">${item?.name || 'Gegenstand'}</span>
        <button class="loot-claim-btn">In Empfang nehmen</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const btn = overlay.querySelector('.loot-claim-btn');
    if (btn) {
      btn.onclick = () => {
        overlay.remove();
        if (onAcknowledge) onAcknowledge();
      };
    }
    return {
      dismiss: () => {
        overlay.remove();
        if (onAcknowledge) onAcknowledge();
      }
    };
  }

  console.log('showLootRevealDialog stub called:', item, category);
  if (onAcknowledge) onAcknowledge();
  return { dismiss: () => {} };
}
