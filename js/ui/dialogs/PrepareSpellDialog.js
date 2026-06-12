import { CombatState } from '../../state.js';
import { getSpellSchoolCode, getSchoolLabel, CombatSpells } from '../../spells.js';
import { showCustomAlert, showCustomConfirm } from './BaseDialogs.js';
import { SpellSlotCalculator } from '../../rules/SpellSlotCalculator.js';
import { showCastSuccessDialog } from '../components/player/PCBuffsDialog.js';

function findSpell(pc, key) {
  if (CombatSpells.REGISTRY[key]) {
    return CombatSpells.REGISTRY[key];
  }
  if (Array.isArray(pc.customSpells)) {
    const found = pc.customSpells.find(s => s.id === key || s.nameDe === key);
    if (found) return found;
  }
  return null;
}

export function showPrepareSpellDialog(pc, spellKey, onSaveCallback) {
  const spell = findSpell(pc, spellKey);
  if (!spell) return;

  const isWizard = pc.classes && pc.classes.some(c => c.classType === 'wizard');
  const wizardSpecialization = pc.wizardSpecialization || 'none';
  const hasSpecSlot = isWizard && wizardSpecialization !== 'none';
  const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);

  const metamagicFeats = [
    { id: 'extend_spell', label: 'Zauber verlängern (+1 Grad)', cost: 1, name: 'Verlängert' },
    { id: 'empower_spell', label: 'Zauber verstärken (+2 Grade)', cost: 2, name: 'Verstärkt' },
    { id: 'maximize_spell', label: 'Zauber maximieren (+3 Grade)', cost: 3, name: 'Maximiert' },
    { id: 'quicken_spell', label: 'Zauber beschleunigen (+4 Grade)', cost: 4, name: 'Beschleunigt' }
  ];

  const learnedFeats = metamagicFeats.filter(f => pc.feats && pc.feats.some(feat => feat.id === f.id));

  const overlay = document.createElement('div');
  overlay.id = 'prepareSpellOverlay';
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

  let metamagicHtml = '';
  if (learnedFeats.length === 0) {
    metamagicHtml = `
      <div style="font-size: 8px; color: var(--inkl); font-style: italic; margin-bottom: 8px;">
        Keine Metamagie-Talente erlernt.
      </div>
    `;
  } else {
    metamagicHtml = `
      <div style="text-align: left; margin-bottom: 8px;">
        <div style="font-family:'IM Fell English SC', serif; font-size: 8px; color: var(--red); font-weight: bold; margin-bottom: 3px;">Metamagie anwenden:</div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${learnedFeats.map(feat => `
            <label style="display: flex; align-items: center; gap: 4px; font-size: 8px; cursor: pointer; color: var(--ink);">
              <input type="checkbox" class="prep-meta-chk" data-id="${feat.id}" data-cost="${feat.cost}" style="cursor: pointer; margin: 0;">
              <span>${feat.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  let specialistHtml = '';
  if (hasSpecSlot) {
    const isMatchingSchool = schoolCode === wizardSpecialization;
    specialistHtml = `
      <div style="text-align: left; margin-bottom: 10px; border-top: 0.5px solid rgba(200, 169, 110, 0.2); padding-top: 6px;">
        <label style="display: flex; align-items: center; gap: 4px; font-size: 8px; cursor: ${isMatchingSchool ? 'pointer' : 'not-allowed'}; color: ${isMatchingSchool ? 'var(--ink)' : 'var(--inkl)'};">
          <input type="checkbox" id="prepSpecialistSlot" ${isMatchingSchool ? '' : 'disabled'} style="cursor: ${isMatchingSchool ? 'pointer' : 'not-allowed'}; margin: 0;">
          <span>In Spezialistenslot vorbereiten (${getSchoolLabel(wizardSpecialization)})</span>
        </label>
        ${!isMatchingSchool ? `<div style="font-size: 6.5px; color: var(--red); font-style: italic; margin-top: 2px;">Zauber gehört nicht zur Spezialisierungsschule.</div>` : ''}
      </div>
    `;
  }

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 20px;
      width: 520px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'Crimson Text', serif;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <div style="font-family:'IM Fell English SC', serif; font-size: 13px; color: var(--red); font-weight: bold; margin-bottom: 6px; text-align: center;">
        Zauber vorbereiten 📜
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 4px 0 8px;">
      
      <div style="font-size: 10px; font-weight: bold; color: var(--ink); margin-bottom: 2px; text-align: center;">
        ${spell.nameDe} <span style="font-size: 8px; font-weight: normal; color: var(--inkl); font-style: italic;">(${spell.school})</span>
      </div>
      <div style="font-size: 8px; color: var(--inkl); text-align: center; margin-bottom: 10px;">
        Basisgrad: Grad ${spell.level}
      </div>

      ${metamagicHtml}
      ${specialistHtml}

      <div style="background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); border-radius: 2px; padding: 4px; text-align: center; margin-bottom: 12px; font-family:'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">
        Finaler Grad: <span id="finalPrepLevelText">Grad ${spell.level}</span>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center;">
        <button class="btn btn-p prep-confirm-btn" style="font-family:'IM Fell English SC', serif; font-size: 9px; padding: 3px 14px; cursor: pointer;">Vorbereiten</button>
        <button class="btn prep-cancel-btn" style="font-family:'IM Fell English SC', serif; font-size: 9px; padding: 3px 14px; cursor: pointer; border-color: var(--pb); background: transparent; color: var(--ink);">Abbrechen</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect();
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const updateFinalLevel = () => {
    let cost = 0;
    overlay.querySelectorAll('.prep-meta-chk:checked').forEach(chk => {
      cost += parseInt(chk.dataset.cost);
    });
    const finalLevel = spell.level + cost;
    overlay.querySelector('#finalPrepLevelText').innerText = `Grad ${finalLevel}`;
    
    const confirmBtn = overlay.querySelector('.prep-confirm-btn');
    if (finalLevel > 9) {
      confirmBtn.disabled = true;
      confirmBtn.style.opacity = '0.5';
      confirmBtn.style.cursor = 'not-allowed';
    } else {
      confirmBtn.disabled = false;
      confirmBtn.style.opacity = '1';
      confirmBtn.style.cursor = 'pointer';
    }
  };

  overlay.querySelectorAll('.prep-meta-chk').forEach(chk => {
    chk.onchange = updateFinalLevel;
  });

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => { overlay.remove(); }, 200);
  };

  overlay.querySelector('.prep-cancel-btn').onclick = dismiss;
  
  overlay.querySelector('.prep-confirm-btn').onclick = () => {
    let cost = 0;
    const selectedMeta = [];
    overlay.querySelectorAll('.prep-meta-chk:checked').forEach(chk => {
      cost += parseInt(chk.dataset.cost);
      selectedMeta.push(chk.dataset.id);
    });
    const finalLevel = spell.level + cost;
    if (finalLevel > 9) return;

    const isSpec = hasSpecSlot && !!overlay.querySelector('#prepSpecialistSlot')?.checked;

    const performPrep = () => {
      pc.prepareSpell(spellKey, selectedMeta, isSpec);
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
      if (typeof onSaveCallback === 'function') onSaveCallback();
      dismiss();
    };

    // Warn if no free slots
    const maxSlots = pc.spellSlots[finalLevel]?.max || 0;
    const currentPrepsCount = SpellSlotCalculator.countPreparedSpellsAtLevel(pc, finalLevel);

    if (maxSlots === 0) {
      showCustomConfirm("Keine Slots!", `Du hast keine Zauberslots auf Grad ${finalLevel}. Möchtest du "${spell.nameDe}" trotzdem vorbereiten?`, () => {
        performPrep();
      });
    } else if (currentPrepsCount >= maxSlots) {
      showCustomConfirm("Alle Slots belegt!", `Du hast bereits ${currentPrepsCount} von ${maxSlots} Slots des Grades ${finalLevel} belegt. Möchtest du "${spell.nameDe}" trotzdem vorbereiten?`, () => {
        performPrep();
      });
    } else {
      performPrep();
    }
  };
}

export function showCastSpontaneousSpellDialog(pc, spellKey, onSaveCallback) {
  const spell = findSpell(pc, spellKey);
  if (!spell) return;

  const metamagicFeats = [
    { id: 'extend_spell', label: 'Zauber verlängern (+1 Grad)', cost: 1, name: 'Verlängert' },
    { id: 'empower_spell', label: 'Zauber verstärken (+2 Grade)', cost: 2, name: 'Verstärkt' },
    { id: 'maximize_spell', label: 'Zauber maximieren (+3 Grade)', cost: 3, name: 'Maximiert' },
    { id: 'quicken_spell', label: 'Zauber beschleunigen (+4 Grade) [Nicht nutzbar]', cost: 4, name: 'Beschleunigt', disabled: true }
  ];

  const learnedFeats = metamagicFeats.filter(f => pc.feats && pc.feats.some(feat => feat.id === f.id));

  const overlay = document.createElement('div');
  overlay.id = 'castSpontaneousSpellOverlay';
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

  let metamagicHtml = '';
  if (learnedFeats.length === 0) {
    metamagicHtml = `
      <div style="font-size: 8px; color: var(--inkl); font-style: italic; margin-bottom: 8px;">
        Keine Metamagie-Talente erlernt.
      </div>
    `;
  } else {
    metamagicHtml = `
      <div style="text-align: left; margin-bottom: 8px;">
        <div style="font-family:'IM Fell English SC', serif; font-size: 8px; color: var(--red); font-weight: bold; margin-bottom: 3px;">Metamagie anwenden (erhöht Zauberzeit):</div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${learnedFeats.map(feat => {
            const isDisabled = feat.disabled;
            return `
              <label style="display: flex; align-items: center; gap: 4px; font-size: 8px; cursor: ${isDisabled ? 'not-allowed' : 'pointer'}; color: ${isDisabled ? 'var(--inkl)' : 'var(--ink)'};">
                <input type="checkbox" class="cast-meta-chk" data-id="${feat.id}" data-cost="${feat.cost}" ${isDisabled ? 'disabled' : ''} style="cursor: ${isDisabled ? 'not-allowed' : 'pointer'}; margin: 0;">
                <span>${feat.label}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 20px;
      width: 520px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'Crimson Text', serif;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <div style="font-family:'IM Fell English SC', serif; font-size: 13px; color: var(--red); font-weight: bold; margin-bottom: 6px; text-align: center;">
        Zauber wirken ✨
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 4px 0 8px;">
      
      <div style="font-size: 10px; font-weight: bold; color: var(--ink); margin-bottom: 2px; text-align: center;">
        ${spell.nameDe} <span style="font-size: 8px; font-weight: normal; color: var(--inkl); font-style: italic;">(${spell.school})</span>
      </div>
      <div style="font-size: 8px; color: var(--inkl); text-align: center; margin-bottom: 10px;">
        Basisgrad: Grad ${spell.level}
      </div>

      ${metamagicHtml}

      <div id="spontaneousTimeWarning" style="display: none; font-size: 7px; color: var(--red); font-style: italic; margin-bottom: 8px; text-align: center; line-height: 1.2;">
        ⚠️ Spontane Metamagie verlängert die Zauberzeit auf 1 volle Aktion (oder +1 Runde)!
      </div>

      <div style="background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); border-radius: 2px; padding: 4px; text-align: center; margin-bottom: 12px; font-family:'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">
        Benötigter Grad: <span id="finalCastLevelText">Grad ${spell.level}</span>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center;">
        <button class="btn btn-p cast-confirm-btn" style="font-family:'IM Fell English SC', serif; font-size: 9px; padding: 3px 14px; cursor: pointer;">Wirken</button>
        <button class="btn cast-cancel-btn" style="font-family:'IM Fell English SC', serif; font-size: 9px; padding: 3px 14px; cursor: pointer; border-color: var(--pb); background: transparent; color: var(--ink);">Abbrechen</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect();
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const updateFinalLevel = () => {
    let cost = 0;
    let anyChecked = false;
    overlay.querySelectorAll('.cast-meta-chk:checked').forEach(chk => {
      cost += parseInt(chk.dataset.cost);
      anyChecked = true;
    });
    const finalLevel = spell.level + cost;
    overlay.querySelector('#finalCastLevelText').innerText = `Grad ${finalLevel}`;
    overlay.querySelector('#spontaneousTimeWarning').style.display = anyChecked ? 'block' : 'none';
    
    const confirmBtn = overlay.querySelector('.cast-confirm-btn');
    if (finalLevel > 9) {
      confirmBtn.disabled = true;
      confirmBtn.style.opacity = '0.5';
      confirmBtn.style.cursor = 'not-allowed';
    } else {
      confirmBtn.disabled = false;
      confirmBtn.style.opacity = '1';
      confirmBtn.style.cursor = 'pointer';
    }
  };

  overlay.querySelectorAll('.cast-meta-chk').forEach(chk => {
    chk.onchange = updateFinalLevel;
  });

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => { overlay.remove(); }, 200);
  };

  overlay.querySelector('.cast-cancel-btn').onclick = dismiss;

  overlay.querySelector('.cast-confirm-btn').onclick = () => {
    let cost = 0;
    const selectedMetaNames = [];
    const selectedMetaIds = [];
    overlay.querySelectorAll('.cast-meta-chk:checked').forEach(chk => {
      cost += parseInt(chk.dataset.cost);
      const featInfo = metamagicFeats.find(f => f.id === chk.dataset.id);
      if (featInfo) selectedMetaNames.push(featInfo.name);
      selectedMetaIds.push(chk.dataset.id);
    });
    const finalLevel = spell.level + cost;
    if (finalLevel > 9) return;

    const performCast = () => {
      pc.castSpontaneousSpell(spellKey, finalLevel);
      CombatState.saveToStorage();
      CombatState.syncPCToHost();

      const timeText = selectedMetaNames.length > 0 ? "1 volle Aktion (Spontane Metamagie)" : (spell.castingTime || '1 Standardaktion');
      const metaSuffix = selectedMetaNames.length > 0 ? ` (${selectedMetaNames.join(', ')})` : '';

      if (spell.effects && spell.effects.length > 0) {
        showCastSuccessDialog(pc, spell, spellKey, selectedMetaIds, () => {
          if (typeof onSaveCallback === 'function') onSaveCallback();
          dismiss();
        });
      } else {
        showCustomAlert("Zauber gewirkt! ✨", `
          <div style="font-family:'Crimson Text', serif; font-size:10px; text-align:left; color:var(--ink); line-height:1.35;">
            <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:'IM Fell English SC', serif; color: var(--red); font-size: 11px;">
              ${pc.name} wirkt ${spell.nameDe}${metaSuffix}!
            </div>
            • <strong>Schule:</strong> ${spell.school}<br>
            • <strong>Grad:</strong> Grad ${finalLevel} (Basis ${spell.level})<br>
            • <strong>Zeitaufwand:</strong> ${timeText}<br>
            • <strong>Reichweite:</strong> ${spell.range || 'Berührung'}<br>
            • <strong>Rettungswurf:</strong> ${spell.savingThrow || 'Keiner'}<br><br>
            <div style="font-size: 8px; font-style: italic; background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); padding: 4px; border-radius: 2px; line-height: 1.25;">
              ${spell.description}
            </div>
          </div>
        `, "Fertig!", "");

        if (typeof onSaveCallback === 'function') onSaveCallback();
        dismiss();
      }
    };

    const maxSlots = pc.spellSlots[finalLevel]?.max || 0;
    const usedSlots = pc.spellSlots[finalLevel]?.used || 0;

    if (maxSlots === 0) {
      showCustomConfirm("Keine Slots!", `Du hast keine Zauberslots auf Grad ${finalLevel}. Möchtest du "${spell.nameDe}" trotzdem wirken?`, () => {
        performCast();
      });
    } else if (usedSlots >= maxSlots) {
      showCustomConfirm("Keine freien Slots!", `Du hast alle Slots des Grades ${finalLevel} verbraucht. Möchtest du "${spell.nameDe}" trotzdem wirken?`, () => {
        performCast();
      });
    } else {
      performCast();
    }
  };
}
