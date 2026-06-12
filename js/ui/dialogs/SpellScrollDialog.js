/**
 * Spawns a premium, enlarged ancient scroll parchment dialog.
 * Enables the player to read spells comfortably without scrolling and
 * interactively add/remove the spell to/from their spellbook.
 */
export function showSpellScrollDialog(spell, isLearned, onToggleLearn) {
  const existing = document.getElementById('spellScrollOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'spellScrollOverlay';
  overlay.style = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.65);
    backdrop-filter: blur(3px);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  const nameEn = spell.nameEn ? ` (${spell.nameEn})` : '';
  const range = spell.range || '—';
  const duration = spell.duration || '—';
  const savingThrow = spell.savingThrow || '—';
  const school = spell.school || '—';
  const level = spell.level !== undefined ? spell.level : '—';
  const sr = spell.spellResistance || '—';
  const components = spell.components || '—';
  const targetOrEffectOrArea = spell.targetOrEffectOrArea || '—';

  const actionText = isLearned 
    ? "Möchtest du diesen Zauber aus deinem Zauberbuch ENTFERNEN?" 
    : "Möchtest du diesen Zauber in dein Zauberbuch LEGEN?";

  overlay.innerHTML = `
    <div class="custom-scroll-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 20px;
      width: 580px;
      max-width: 92vw;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.1);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      flex-direction: column;
      gap: 10px;
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <!-- Spell Parchment Section -->
      <div class="ancient-parchment" style="
        background: #f4e8c1; 
        border: 2px solid #8b1a1a; 
        padding: 16px 20px; 
        border-radius: 4px; 
        box-shadow: inset 0 0 35px rgba(139, 26, 26, 0.15); 
        font-family: 'Crimson Text', serif; 
        color: #1a0f00; 
        line-height: 1.45; 
        text-align: left; 
        max-height: 52vh; 
        overflow-y: auto;
        box-sizing: border-box;
      ">
        <h3 style="font-family: 'IM Fell English SC', serif; font-size: 15px; color: #8b1a1a; text-align: center; border-bottom: 2px solid #8b1a1a; padding-bottom: 6px; margin: 0 0 10px 0; letter-spacing: 0.8px; font-weight: bold;">
          ${spell.nameDe}${nameEn}
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px 14px; font-size: 9.5px; border-bottom: 0.5px dashed rgba(139, 26, 26, 0.4); padding-bottom: 8px; margin-bottom: 10px; font-weight: 600;">
          <div><strong>Schule:</strong> ${school}</div>
          <div><strong>Grad:</strong> Grad ${level}</div>
          <div><strong>Zeitaufwand:</strong> ${spell.castingTime || '1 Standardaktion'}</div>
          <div><strong>Komponenten:</strong> ${components}</div>
          <div><strong>Reichweite:</strong> ${range}</div>
          <div><strong>Wirkungsdauer:</strong> ${duration}</div>
          <div><strong>Rettungswurf:</strong> ${savingThrow}</div>
          <div><strong>Zauberresistenz:</strong> ${sr}</div>
          <div style="grid-column: span 2;"><strong>Ziel/Effekt/Bereich:</strong> ${targetOrEffectOrArea}</div>
        </div>
        <div style="font-size: 10.5px; white-space: pre-wrap; font-style: italic; line-height: 1.5; color: #2a1b0a;">
          ${spell.description || 'Keine Beschreibung vorhanden.'}
        </div>
      </div>

      <!-- Action Section -->
      <div style="margin-top: 2px; display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <div style="font-size: 11px; color: var(--red); font-weight: bold; font-family: 'IM Fell English SC', serif; letter-spacing: 0.5px;">
          ${actionText}
        </div>
        <div style="display:flex; justify-content:center; gap:12px;">
          <button class="btn btn-p pc-confirm-yes-btn" style="
            font-family: 'IM Fell English SC', serif;
            font-size: 9px;
            padding: 4px 22px;
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
            padding: 4px 22px;
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
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect(); // trigger layout reflow
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-scroll-box').style.transform = 'scale(1)';

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-scroll-box').style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 200);
  };

  const yesBtn = overlay.querySelector('.pc-confirm-yes-btn');
  const noBtn = overlay.querySelector('.pc-confirm-no-btn');

  yesBtn.onclick = () => {
    dismiss();
    if (typeof onToggleLearn === 'function') onToggleLearn();
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
