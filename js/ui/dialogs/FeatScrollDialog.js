/**
 * @module    FeatScrollDialog
 * @summary   Pergament-Dialog für Talent-Details: Voraussetzungsprüfung, Optionsauswahl, Erlernen/Verlernen mit Endlosschleifen-Schutz.
 * @exports   showFeatScrollDialog
 * @reads     pc.feats, pc.classes, pc.str, pc.dex etc. (via checkPrerequisites)
 * @stateOps  CombatState.addPCFeat, CombatState.removePCFeat
 * @depends   CombatState, ui-shared, feats-data, BaseDialogs, PCFeatsTab
 * @notHere   Talent-Limit-Prüfung → PCManager.js (addPCFeat) | Kompendium-Rendering → PCFeatsTab.js
 */
import { CombatState } from '../../state.js';
import { uiRegistry } from '../ui-shared.js';
import { CombatFeats } from '../../data/feats-data.js';
import { showCustomAlert } from './BaseDialogs.js';
import { checkPrerequisites } from '../components/player/PCFeatsTab.js';

/**
 * Spawns a gorgeous, premium D&D-themed scroll parchment dialog for feat details.
 * Lists RAW details (Benefit, Normal, Special), prerequisites status, and app mechanics.
 */
export function showFeatScrollDialog(feat, pc, isLearned, option = '') {
  const existing = document.getElementById('featScrollOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'featScrollOverlay';
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

  const nameEn = feat.nameEn ? ` (${feat.nameEn})` : '';
  const categoryDe = { combat: 'Kampftalent', metamagic: 'Metamagie', item_creation: 'Gegenstandserschaffung', general: 'Allgemein' }[feat.category] || 'Allgemein';

  // Evaluate prerequisites
  const { met, details: prereqsDetails } = checkPrerequisites(feat, pc);
  
  // Format prerequisites HTML
  let prereqsHtml = '<span style="color:#2a6a2a; font-weight:bold;">Keine</span>';
  if (prereqsDetails.length > 0) {
    prereqsHtml = prereqsDetails.map(pr => {
      const color = pr.met ? '#2a6a2a' : '#8b1a1a';
      const mark = pr.met ? '🟢' : '❌';
      return `<div style="color:${color}; font-weight: 500; font-size: 9px; display:flex; align-items:center; gap:4px;">
        <span>${mark}</span> <span>${pr.desc}</span>
      </div>`;
    }).join('');
  }

  // Stackability & Options information
  const isStackable = feat.specialRaw && feat.specialRaw.toLowerCase().includes('multiple times');
  const learnedInstances = (pc.feats || []).filter(f => f.id === feat.id);

  // Option dropdown rendering if not learned or if stackable
  let optionSelectionHtml = '';
  if (feat.hasOption && (!isLearned || isStackable)) {
    let optionsList = [];
    if (feat.optionType === 'weapon') {
      optionsList = ['Langschwert', 'Kurzschwert', 'Dolch', 'Zweihänder', 'Kompositbogen', 'Langbogen', 'Waffenlos', 'Kampfstab', 'Kama', 'Nunchaku', 'Sai', 'Shuriken', 'Siangham', 'Armbrust', 'Hellebarde', 'Morgenstern', 'Streitaxt'];
    } else if (feat.optionType === 'school') {
      optionsList = ['Abschwörung (Abjuration)', 'Beschwörung (Conjuration)', 'Erkenntnis (Divination)', 'Hervorrufung (Evocation)', 'Illusion (Illusion)', 'Nekromantie (Necromancy)', 'Transmutation (Transmutation)', 'Verzauberung (Enchantment)'];
    } else if (feat.optionType === 'skill') {
      optionsList = ['Klettern (Climb)', 'Springen (Jump)', 'Schwimmen (Swim)', 'Akrobatik (Tumble)', 'Reiten (Ride)', 'Verstecken (Hide)', 'Leise bewegen (Move Silently)', 'Lauschen (Listen)', 'Entdecken (Spot)', 'Suchen (Search)', 'Diplomatie (Diplomacy)', 'Bluffen (Bluff)', 'Konzentration (Concentration)', 'Zauberkunde (Spellcraft)'];
    }

    // Filter out options already learned by the player for this feat ID (Bug #18)
    const learnedOptions = learnedInstances.map(inst => inst.option).filter(Boolean);
    const filteredOptions = optionsList.filter(o => !learnedOptions.includes(o));
    const selectOptions = filteredOptions.length > 0 
      ? filteredOptions.map(o => `<option value="${o}">${o}</option>`).join('')
      : '<option value="" disabled>-- Alle Optionen bereits erlernt --</option>';
    
    optionSelectionHtml = `
      <div style="margin-top: 6px; display:flex; flex-direction:column; gap:2px; font-family:'Crimson Text', serif; font-size:9.5px; font-weight:bold;">
        <label for="featOptionSelect" style="color:#5a3a1a;">Spezifische Auswahl für dieses Talent:</label>
        <select id="featOptionSelect" class="cinput" style="width: 100%; font-size:9px; height:18px; padding: 0 2px; box-sizing: border-box;">
          ${selectOptions}
        </select>
      </div>
    `;
  }

  // Already learned list (with option tags and delete buttons)
  let learnedListHtml = '';
  if (learnedInstances.length > 0) {
    learnedListHtml = `
      <div style="margin-top: 6px; font-family:'Crimson Text', serif; font-size:9.5px; border-top: 0.5px dashed rgba(139,26,26,0.3); padding-top: 6px;">
        <div style="font-weight:bold; color:#5a3a1a; margin-bottom: 2px;">Bereits erlernte Instanzen:</div>
        <div style="display:flex; flex-direction:column; gap:3px;">
          ${learnedInstances.map(inst => {
            const optText = inst.option ? `(${inst.option})` : '';
            return `
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.03); border:0.5px solid rgba(0,0,0,0.1); border-radius:2px; padding:2px 4px; font-size:8.5px;">
                <span style="font-weight:bold; color:var(--red);">${feat.nameDe} ${optText}</span>
                <button class="xbtn btn-remove-instance" data-id="${feat.id}" data-option="${inst.option || ''}" style="color:var(--red); border-color:var(--red); padding:0 3px; font-size:7px; height:13px; line-height:13px;">✕ Entfernen</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Determine action buttons at the bottom
  let bottomActionHtml = '';
  if (!isLearned || isStackable) {
    const isLearnBlocked = !met;
    bottomActionHtml = `
      <div style="display:flex; flex-direction:column; align-items:center; gap:4px; width: 100%;">
        <div style="font-size: 10px; color: var(--red); font-weight: bold; font-family: 'IM Fell English SC', serif; letter-spacing: 0.3px;">
          ${isLearnBlocked ? '🔒 Voraussetzungen nicht erfüllt!' : 'Möchtest du dieses Talent erlernen?'}
        </div>
        <div style="display:flex; justify-content:center; gap:12px; width: 100%;">
          <button class="btn btn-p btn-learn-feat" style="
            font-family: 'IM Fell English SC', serif;
            font-size: 9px;
            padding: 4px 22px;
            cursor: ${isLearnBlocked ? 'not-allowed' : 'pointer'};
            background: ${isLearnBlocked ? 'rgba(0,0,0,0.05)' : 'rgba(42, 106, 42, 0.1)'};
            border: 1px solid ${isLearnBlocked ? 'rgba(0,0,0,0.2)' : '#2a6a2a'};
            border-radius: 2px;
            color: ${isLearnBlocked ? '#888' : '#2a6a2a'};
            font-weight: bold;
            transition: background-color 0.15s, color 0.15s;
            outline: none;
          " ${isLearnBlocked ? 'disabled' : ''}>Lernen</button>
          <button class="btn btn-close-feat" style="
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
          ">Schließen</button>
        </div>
      </div>
    `;
  } else {
    bottomActionHtml = `
      <div style="display:flex; flex-direction:column; align-items:center; gap:4px; width: 100%;">
        <div style="font-size: 10px; color: var(--red); font-weight: bold; font-family: 'IM Fell English SC', serif; letter-spacing: 0.3px;">
          Möchtest du dieses Talent wieder VERNICHTEN/VERLERNEN?
        </div>
        <div style="display:flex; justify-content:center; gap:12px; width: 100%;">
          <button class="btn btn-p btn-unlearn-feat" style="
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
          ">Verlernen</button>
          <button class="btn btn-close-feat" style="
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
          ">Schließen</button>
        </div>
      </div>
    `;
  }

  overlay.innerHTML = `
    <div class="custom-scroll-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 14px 18px;
      width: 540px;
      max-width: 92vw;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.1);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      flex-direction: column;
      gap: 8px;
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <!-- Scroll parchment content -->
      <div class="ancient-parchment" style="
        background: #f4e8c1; 
        border: 2px solid #8b1a1a; 
        padding: 12px 16px; 
        border-radius: 4px; 
        box-shadow: inset 0 0 35px rgba(139, 26, 26, 0.15); 
        font-family: 'Crimson Text', serif; 
        color: #1a0f00; 
        line-height: 1.4; 
        text-align: left; 
        max-height: 54vh; 
        overflow-y: auto;
        box-sizing: border-box;
      ">
        <h3 style="font-family: 'IM Fell English SC', serif; font-size: 13.5px; color: #8b1a1a; text-align: center; border-bottom: 2px solid #8b1a1a; padding-bottom: 4px; margin: 0 0 8px 0; letter-spacing: 0.8px; font-weight: bold;">
          ${feat.nameDe}${nameEn}
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; font-size: 9px; border-bottom: 0.5px dashed rgba(139, 26, 26, 0.3); padding-bottom: 6px; margin-bottom: 8px; font-weight: bold;">
          <div><strong>Kategorie:</strong> ${categoryDe}</div>
          <div><strong>Erfüllt:</strong> ${met ? '🟢 Ja' : '❌ Nein'}</div>
          <div style="grid-column: span 2;">
            <strong>App-Mechanik:</strong> <span style="color:#8b1a1a; font-weight:bold;">${feat.appEffect || 'Keine automatische Werteänderung'}</span>
          </div>
        </div>

        <div style="font-size: 9.5px; margin-bottom: 8px;">
          <div style="font-weight:bold; color:#8b1a1a; font-family:'IM Fell English SC', serif; font-size:10px;">Voraussetzungen:</div>
          <div style="display:flex; flex-direction:column; gap:2px; margin-top:2px;">
            ${prereqsHtml}
          </div>
        </div>

        <div style="font-size: 9.5px; margin-bottom: 6px; line-height: 1.35;">
          <strong style="color:#8b1a1a; font-family:'IM Fell English SC', serif;">Vorteil (RAW):</strong> 
          <div style="font-style: italic; color: #2a1b0a; padding-left: 4px;">${feat.benefitDe}</div>
        </div>
        
        ${feat.normalRaw ? `
        <div style="font-size: 9px; margin-bottom: 6px; line-height: 1.35; border-top: 0.5px dotted rgba(139,26,26,0.2); padding-top:4px;">
          <strong style="color:#8b1a1a; font-family:'IM Fell English SC', serif;">Normal:</strong> 
          <div style="color: #4a3b2a; padding-left: 4px;">${feat.normalRaw}</div>
        </div>
        ` : ''}

        ${feat.specialRaw ? `
        <div style="font-size: 9px; margin-bottom: 4px; line-height: 1.35; border-top: 0.5px dotted rgba(139,26,26,0.2); padding-top:4px;">
          <strong style="color:#8b1a1a; font-family:'IM Fell English SC', serif;">Spezial:</strong> 
          <div style="color: #4a3b2a; padding-left: 4px;">${feat.specialRaw}</div>
        </div>
        ` : ''}

        ${optionSelectionHtml}
        ${learnedListHtml}
      </div>

      <!-- Action Footer -->
      <div style="margin-top: 2px;">
        ${bottomActionHtml}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect();
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-scroll-box').style.transform = 'scale(1)';

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-scroll-box').style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) dismiss();
  };

  const closeBtn = overlay.querySelector('.btn-close-feat');
  if (closeBtn) closeBtn.onclick = dismiss;

  const learnBtn = overlay.querySelector('.btn-learn-feat');
  if (learnBtn) {
    learnBtn.onclick = () => {
      let selectedOption = '';
      if (feat.hasOption) {
        const select = overlay.querySelector('#featOptionSelect');
        selectedOption = select ? select.value : '';
      }
      const result = CombatState.addPCFeat(feat.id, selectedOption);
      if (result && !result.success) {
        // Show the unmet prerequisites as a themed alert — do NOT close the dialog
        showCustomAlert('Voraussetzungen fehlen', result.error.replace(/\n/g, '<br>'), 'Verstanden', '🔒');
        return;
      }
      dismiss();
      uiRegistry.renderPlayerScreen();
    };
  }

  const unlearnBtn = overlay.querySelector('.btn-unlearn-feat');
  if (unlearnBtn) {
    unlearnBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      CombatState.removePCFeat(feat.id, option);
      dismiss();
      uiRegistry.renderPlayerScreen();
    };
  }

  overlay.querySelectorAll('.btn-remove-instance').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const fId = btn.dataset.id;
      const opt = btn.dataset.option || '';
      CombatState.removePCFeat(fId, opt);
      showFeatScrollDialog(feat, pc, (pc.feats || []).some(f => f.id === feat.id), option);
      uiRegistry.renderPlayerScreen();
    };
  });
}
