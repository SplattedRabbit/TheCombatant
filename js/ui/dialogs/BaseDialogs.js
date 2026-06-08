/**
 * D&D 3.5e Base Dialog Components
 * Shared foundation for all centered overlay dialogs in the app.
 */

export function showInfoDialog({ id, title, bodyHtml, buttonText = 'Fertig', width = 260, onClose = null } = {}) {
  const existing = id ? document.getElementById(id) : null;
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  if (id) overlay.id = id;
  overlay.className = 'no-print';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.55);
    backdrop-filter: blur(2px);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 20px;
      width: ${width}px;
      max-width: 92vw;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>

      <div style="font-size: 12px; color: var(--red); font-weight: bold; margin-bottom: 4px; letter-spacing: 0.3px;">
        ${title}
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 5px 0 10px;">

      <div class="info-dialog-body" style="text-align: left; margin-bottom: 12px;">
        ${bodyHtml}
      </div>

      <button class="btn btn-p info-dialog-close" style="
        font-family: 'IM Fell English SC', serif;
        font-size: 9px;
        padding: 4px 22px;
        cursor: pointer;
        outline: none;
        touch-action: manipulation;
      ">${buttonText}</button>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect(); // force reflow
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => { overlay.remove(); if (onClose) onClose(); }, 200);
  };

  overlay.querySelector('.info-dialog-close').onclick = dismiss;
  overlay.onclick = (e) => { if (e.target === overlay) dismiss(); };

  const keyHandler = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      dismiss();
      document.removeEventListener('keydown', keyHandler);
    }
  };
  document.addEventListener('keydown', keyHandler);

  return { dismiss };
}

export function showCustomAlert(title, message, buttonText = "Verstanden", icon = "⚠️", onClose = null) {
  const existing = document.getElementById('customAlertOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'customAlertOverlay';
  overlay.style = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.55);
    backdrop-filter: blur(2px);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 24px;
      width: 250px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <div style="font-size: 15px; color: var(--red); font-weight: bold; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
        ${icon ? icon + ' ' : ''}${title}
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 6px 0 10px;">
      <div style="font-family: 'Crimson Text', serif; font-size: 12px; color: var(--ink); line-height: 1.4; margin-bottom: 12px; font-weight: 500;">
        ${message}
      </div>
      <button class="btn btn-p pc-alert-close-btn" style="
        font-family: 'IM Fell English SC', serif;
        font-size: 9px;
        padding: 3px 14px;
        cursor: pointer;
        background: rgba(244, 232, 193, 0.6);
        border: 1px solid var(--pb);
        border-radius: 2px;
        color: var(--ink);
        transition: background-color 0.15s, color 0.15s;
        outline: none;
      ">${buttonText}</button>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect(); // trigger layout reflow
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const closeBtn = overlay.querySelector('.pc-alert-close-btn');
  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => {
      overlay.remove();
      if (typeof onClose === 'function') onClose();
    }, 200);
  };

  closeBtn.onclick = dismiss;
  overlay.onclick = (e) => {
    if (e.target === overlay) dismiss();
  };

  const keyHandler = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      dismiss();
      document.removeEventListener('keydown', keyHandler);
    }
  };
  document.addEventListener('keydown', keyHandler);
}

export function showCustomConfirm(title, message, onConfirm) {
  const existing = document.getElementById('customConfirmOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'customConfirmOverlay';
  overlay.style = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.55);
    backdrop-filter: blur(2px);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 24px;
      width: 260px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <div style="font-size: 14px; color: var(--red); font-weight: bold; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
        💀 ${title}
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 6px 0 10px;">
      <div style="font-family: 'Crimson Text', serif; font-size: 11px; color: var(--ink); line-height: 1.4; margin-bottom: 14px; font-weight: 500;">
        ${message}
      </div>
      <div style="display:flex; justify-content:center; gap:10px;">
        <button class="btn btn-p pc-confirm-yes-btn" style="
          font-family: 'IM Fell English SC', serif;
          font-size: 9px;
          padding: 3px 16px;
          cursor: pointer;
          background: rgba(139, 26, 26, 0.1);
          border: 1px solid var(--pb);
          border-radius: 2px;
          color: var(--red);
          font-weight: bold;
          transition: background-color 0.15s, color 0.15s;
          outline: none;
        ">Ja</button>
        <button class="btn pc-confirm-no-btn" style="
          font-family: 'IM Fell English SC', serif;
          font-size: 9px;
          padding: 3px 16px;
          cursor: pointer;
          background: transparent;
          border: 1px solid var(--pb);
          border-radius: 2px;
          color: var(--inkl);
          transition: background-color 0.15s, color 0.15s;
          outline: none;
        ">Nein</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect(); // trigger layout reflow
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 200);
  };

  const yesBtn = overlay.querySelector('.pc-confirm-yes-btn');
  const noBtn = overlay.querySelector('.pc-confirm-no-btn');

  yesBtn.onclick = () => {
    dismiss();
    if (typeof onConfirm === 'function') onConfirm();
  };

  noBtn.onclick = dismiss;

  yesBtn.onmouseenter = () => {
    yesBtn.style.backgroundColor = 'rgba(139, 26, 26, 0.2)';
  };
  yesBtn.onmouseleave = () => {
    yesBtn.style.backgroundColor = 'rgba(139, 26, 26, 0.1)';
  };
  noBtn.onmouseenter = () => {
    noBtn.style.backgroundColor = 'rgba(200, 169, 110, 0.1)';
  };
  noBtn.onmouseleave = () => {
    noBtn.style.backgroundColor = 'transparent';
  };
}

export function showCustomPrompt(title, message, placeholder = "", onConfirm, defaultValue = "") {
  const existing = document.getElementById('customPromptOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'customPromptOverlay';
  overlay.style = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.55);
    backdrop-filter: blur(2px);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 24px;
      width: 260px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <div style="font-size: 14px; color: var(--red); font-weight: bold; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
        📝 ${title}
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 6px 0 10px;">
      <div style="font-family: 'Crimson Text', serif; font-size: 11px; color: var(--ink); line-height: 1.4; margin-bottom: 10px; font-weight: 500;">
        ${message}
      </div>
      <input type="text" class="cinput pc-prompt-input" value="${defaultValue}" placeholder="${placeholder}" style="
        width: 100%;
        box-sizing: border-box;
        font-size: 10px;
        padding: 4px 6px;
        margin-bottom: 12px;
        border: 1px solid var(--pb);
        border-radius: 2px;
        background: white;
        color: var(--ink);
        outline: none;
      ">
      <div style="display:flex; justify-content:center; gap:10px;">
        <button class="btn btn-p pc-prompt-ok-btn" style="
          font-family: 'IM Fell English SC', serif;
          font-size: 9px;
          padding: 3px 16px;
          cursor: pointer;
          background: rgba(200, 169, 110, 0.15);
          border: 1px solid var(--pb);
          border-radius: 2px;
          color: var(--red);
          font-weight: bold;
          transition: background-color 0.15s, color 0.15s;
          outline: none;
        ">Speichern</button>
        <button class="btn pc-prompt-cancel-btn" style="
          font-family: 'IM Fell English SC', serif;
          font-size: 9px;
          padding: 3px 16px;
          cursor: pointer;
          background: transparent;
          border: 1px solid var(--pb);
          border-radius: 2px;
          color: var(--inkl);
          transition: background-color 0.15s, color 0.15s;
          outline: none;
        ">Abbrechen</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect();
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const inputEl = overlay.querySelector('.pc-prompt-input');
  inputEl.focus();
  inputEl.select();

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 200);
  };

  const okBtn = overlay.querySelector('.pc-prompt-ok-btn');
  const cancelBtn = overlay.querySelector('.pc-prompt-cancel-btn');

  const handleConfirm = () => {
    const val = inputEl.value.trim();
    if (val) {
      dismiss();
      if (typeof onConfirm === 'function') onConfirm(val);
    }
  };

  okBtn.onclick = handleConfirm;
  cancelBtn.onclick = dismiss;

  inputEl.onkeydown = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      dismiss();
    }
  };
}

export function showNewDayTemplateDialog(pc, templates, onConfirm) {
  const existing = document.getElementById('newDayTemplateOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'newDayTemplateOverlay';
  overlay.style = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.55);
    backdrop-filter: blur(2px);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 24px;
      width: 270px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <div style="font-size: 14px; color: var(--red); font-weight: bold; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
        🌅 Ein neuer Tag!
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 6px 0 10px;">
      <div style="font-family: 'Crimson Text', serif; font-size: 11.5px; color: var(--ink); line-height: 1.4; margin-bottom: 12px; font-weight: 500;">
        Möchtest du ein Zaubertemplate für <strong>${pc.name}</strong> laden?
      </div>
      
      <select class="cinput pc-newday-template-select" style="
        width: 100%;
        box-sizing: border-box;
        font-size: 10px;
        padding: 4px 6px;
        margin-bottom: 16px;
        border: 1px solid var(--pb);
        border-radius: 2px;
        background: white;
        color: var(--ink);
        outline: none;
        height: 24px;
      ">
        <option value="keep">-- Aktuelle Auswahl behalten --</option>
        <option value="empty">[Leere Zauber] (Alles leeren)</option>
        ${Object.keys(templates || {}).map(name => `<option value="${name}">${name}</option>`).join('')}
      </select>
      
      <div style="display:flex; justify-content:center; gap:10px;">
        <button class="btn btn-p pc-newday-confirm-btn" style="
          font-family: 'IM Fell English SC', serif;
          font-size: 9px;
          padding: 3px 18px;
          cursor: pointer;
          background: rgba(200, 169, 110, 0.15);
          border: 1px solid var(--pb);
          border-radius: 2px;
          color: var(--red);
          font-weight: bold;
          transition: background-color 0.15s, color 0.15s;
          outline: none;
        ">Bestätigen</button>
        <button class="btn pc-newday-cancel-btn" style="
          font-family: 'IM Fell English SC', serif;
          font-size: 9px;
          padding: 3px 18px;
          cursor: pointer;
          background: transparent;
          border: 1px solid var(--pb);
          border-radius: 2px;
          color: var(--inkl);
          transition: background-color 0.15s, color 0.15s;
          outline: none;
        ">Abbrechen</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect();
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 200);
  };

  const confirmBtn = overlay.querySelector('.pc-newday-confirm-btn');
  const cancelBtn = overlay.querySelector('.pc-newday-cancel-btn');
  const selectEl = overlay.querySelector('.pc-newday-template-select');

  confirmBtn.onclick = () => {
    const val = selectEl.value;
    dismiss();
    if (typeof onConfirm === 'function') onConfirm(val);
  };

  cancelBtn.onclick = dismiss;
}

let breakdownTimeout = null;

/**
 * Breakdown dialog for dice rolls.
 * Thin wrapper over showInfoDialog() — the shared base for all info overlays.
 * The 'event' parameter is kept for API compatibility but is no longer used for positioning.
 */
export function showRollBreakdown(title, diceFormula, breakdownItems, event) {
  if (breakdownTimeout) clearTimeout(breakdownTimeout);

  // Build modifier list
  let modsSum = 0;
  const rowsHtml = (breakdownItems || []).map(item => {
    const val = parseInt(item.value) || 0;
    modsSum += val;
    const sign = val >= 0 ? '+' : '';
    return `<div style="display:flex; justify-content:space-between; padding:1px 0;">
      <span style="font-family:'Crimson Text',serif; font-size:10px; color:var(--inkm);">${item.label}:</span>
      <span style="font-family:'Crimson Text',serif; font-size:10px; font-weight:bold; color:var(--ink);">${sign}${val}</span>
    </div>`;
  }).join('');

  const modsFormatted    = modsSum >= 0 ? `+${modsSum}` : `${modsSum}`;
  const formulaFormatted = modsSum === 0 ? diceFormula : `${diceFormula} ${modsFormatted}`;

  const bodyHtml = `
    <div style="display:flex; flex-direction:column; gap:2px;">
      ${rowsHtml}
      <div style="display:flex; justify-content:space-between; border-top:0.5px dashed rgba(200,169,110,0.4); margin-top:4px; padding-top:4px;">
        <span style="font-family:'Crimson Text',serif; font-size:10px; color:var(--inkm);">Gesamt-Modifikator:</span>
        <span style="font-family:'Crimson Text',serif; font-size:10px; font-weight:bold; color:var(--red);">${modsFormatted}</span>
      </div>
    </div>
    <hr style="border:none; border-top:0.5px solid rgba(200,169,110,0.4); margin:8px 0;">
    <div style="display:flex; justify-content:space-between; font-family:'IM Fell English SC',serif; font-size:11px; font-weight:bold; color:var(--red);">
      <span>WURF-FORMEL:</span>
      <span style="font-size:13px;">${formulaFormatted}</span>
    </div>
  `;

  const { dismiss } = showInfoDialog({
    id: 'rollBreakdown',
    title: `🎲 ${title}`,
    bodyHtml,
    width: 255,
  });

  // Safety auto-close after 30 s
  breakdownTimeout = setTimeout(() => {
    if (document.getElementById('rollBreakdown')) dismiss();
  }, 30000);
}
