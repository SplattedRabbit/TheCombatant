/**
 * @module    PCSpellDialogs
 * @summary   Dialoge für Zauber-Details (Zauberbuch-Toggle), Zauber-Erstellungs-Wizard und Bannschulen-Bereinigung.
 * @exports   cleanProhibitedSpells, showSpellDetailsDialog, showSpellCreatorWizard
 * @reads     pc.learnedSpells, pc.classes, pc.wizardProhibited1/2, pc.customSpells
 * @stateOps  CombatState.saveToStorage, CombatState.syncPCToHost
 * @depends   CombatState, dialogs, spells.js, PCSpellbookTab, CombatRules
 * @notHere   Zauberbuch-UI → PCSpellbookTab.js | Kompendium → PCCompendiumTab.js | Slot-Limit → rules.js
 */
import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { showCustomAlert, showCustomConfirm, showSpellScrollDialog } from '../dialogs.js';
import { getSpellSchoolCode, getSchoolCodeFromInput, getSchoolLabel } from '../../../spells.js';
import { findSpell } from '../../../spells.js';
import { CombatRules } from '../../../rules.js';

export function cleanProhibitedSpells(pc) {
  if (!pc.classes || !pc.classes.some(c => c.classType === 'wizard')) return;
  if (!Array.isArray(pc.learnedSpells) || pc.learnedSpells.length === 0) return;

  const prob1 = getSchoolCodeFromInput(pc.wizardProhibited1);
  const prob2 = getSchoolCodeFromInput(pc.wizardProhibited2);

  if (!prob1 && !prob2) return;

  const spellsToKeep = [];
  const removedNames = [];

  pc.learnedSpells.forEach(key => {
    const spell = findSpell(pc, key);
    if (spell) {
      const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);
      if (schoolCode && schoolCode !== 'univ') {
        if (schoolCode === prob1 || schoolCode === prob2) {
          removedNames.push(spell.nameDe);
          return; // Skip/Remove this prohibited spell
        }
      }
    }
    spellsToKeep.push(key);
  });

  if (removedNames.length > 0) {
    pc.learnedSpells = spellsToKeep;
    setTimeout(() => {
      showCustomAlert(
        "Bannschulen-Bereinigung ⚠️",
        `Die folgenden Zauber wurden aus deinem Zauberbuch entfernt, da sie deiner gewählten Bannschule angehören:\n\n• ${removedNames.join('\n• ')}`
      );
    }, 100);
  }
}

export function showSpellDetailsDialog(spell, key, pc) {
  const isLearned = pc.learnedSpells && pc.learnedSpells.includes(key);
  
  const onToggleLearn = () => {
    const activePC = CombatState.getActivePC();
    if (!activePC) return;
    if (!Array.isArray(activePC.learnedSpells)) activePC.learnedSpells = [];
    const idx = activePC.learnedSpells.indexOf(key);
    if (idx > -1) {
      activePC.learnedSpells.splice(idx, 1);
    } else {
      // Check prohibited schools before learning
      if (spell) {
        const isWizard = activePC.classes && activePC.classes.some(c => c.classType === 'wizard');
        if (isWizard) {
          const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);
          if (schoolCode && schoolCode !== 'univ') {
            const prob1 = getSchoolCodeFromInput(activePC.wizardProhibited1);
            const prob2 = getSchoolCodeFromInput(activePC.wizardProhibited2);
            if (schoolCode === prob1 || schoolCode === prob2) {
              showCustomAlert(
                "Bannschule",
                `Du kannst den Zauber "${spell.nameDe}" nicht lernen, da er zur Bannschule "${getSchoolLabel(schoolCode)}" gehört!`
              );
              return;
            }
          }
        }

        // Check spells known limit (Bug #8)
        const check = CombatRules.checkSpellKnownLimit(activePC, spell, (k) => findSpell(activePC, k));
        if (!check.success) {
          showCustomAlert("Zauberlimit überschritten", check.error || "Du kannst keine weiteren bekannten Zauber dieses Grades lernen.");
          return;
        }
      }
      activePC.learnedSpells.push(key);
    }
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
    uiRegistry.renderPlayerScreen();
  };

  showSpellScrollDialog(spell, isLearned, onToggleLearn);
}

export function showSpellCreatorWizard(pc) {
  const html = `
    <div style="font-family: 'Crimson Text', serif; text-align: left; display: flex; flex-direction: column; gap: 6px; color: var(--ink);">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        <div>
          <label style="font-size: 8.5px; font-weight: bold; color: var(--inkl);">Deutscher Name *</label>
          <input type="text" id="wizNameDe" class="cinput" placeholder="z. B. Feuerball" style="height: 18px; font-size: 9px;">
        </div>
        <div>
          <label style="font-size: 8.5px; font-weight: bold; color: var(--inkl);">Englischer Name</label>
          <input type="text" id="wizNameEn" class="cinput" placeholder="z. B. Fireball" style="height: 18px; font-size: 9px;">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        <div>
          <label style="font-size: 8.5px; font-weight: bold; color: var(--inkl);">Zaubergrad (0-9) *</label>
          <input type="number" id="wizLevel" class="cinput" min="0" max="9" value="1" style="height: 18px; font-size: 9px; text-align: center;">
        </div>
        <div>
          <label style="font-size: 8.5px; font-weight: bold; color: var(--inkl);">Schule *</label>
          <input type="text" id="wizSchool" class="cinput" placeholder="z. B. Hervorrufung" style="height: 18px; font-size: 9px;">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        <div>
          <label style="font-size: 8.5px; font-weight: bold; color: var(--inkl);">Zeitaufwand</label>
          <input type="text" id="wizCastingTime" class="cinput" placeholder="z. B. 1 Standardaktion" style="height: 18px; font-size: 9px;">
        </div>
        <div>
          <label style="font-size: 8.5px; font-weight: bold; color: var(--inkl);">Reichweite</label>
          <input type="text" id="wizRange" class="cinput" placeholder="z. B. Nah" style="height: 18px; font-size: 9px;">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        <div>
          <label style="font-size: 8.5px; font-weight: bold; color: var(--inkl);">Wirkungsdauer</label>
          <input type="text" id="wizDuration" class="cinput" placeholder="z. B. Sofort" style="height: 18px; font-size: 9px;">
        </div>
        <div>
          <label style="font-size: 8.5px; font-weight: bold; color: var(--inkl);">Rettungswurf</label>
          <input type="text" id="wizSave" class="cinput" placeholder="z. B. Reflex, halbiert" style="height: 18px; font-size: 9px;">
        </div>
      </div>
      <div>
        <label style="font-size: 8.5px; font-weight: bold; color: var(--inkl);">Zauberresistenz</label>
        <input type="text" id="wizSr" class="cinput" placeholder="z. B. Ja" style="height: 18px; font-size: 9px;">
      </div>
      <div>
        <label style="font-size: 8.5px; font-weight: bold; color: var(--inkl);">Regeltext / Beschreibung (Volltext) *</label>
        <textarea id="wizDesc" class="cinput" rows="5" placeholder="Füge hier Wort für Wort die offiziellen Regeln ein..." style="font-size: 9px; line-height: 1.3; resize: vertical;"></textarea>
      </div>
      <div style="font-size: 7px; color: var(--inkl); font-style: italic; margin-top: 2px;">
        * Pflichtfelder. Nach dem Speichern wird dieser Zauber sofort in deinem Zauberkompendium registriert.
      </div>
    </div>
  `;

  showCustomConfirm("✦ Eigener Zauber-Ersteller ✦", html, () => {
    const nameDe = document.getElementById('wizNameDe').value.trim();
    const nameEn = document.getElementById('wizNameEn').value.trim();
    const level = parseInt(document.getElementById('wizLevel').value);
    const school = document.getElementById('wizSchool').value.trim();
    const castingTime = document.getElementById('wizCastingTime').value.trim() || '1 Standardaktion';
    const range = document.getElementById('wizRange').value.trim() || 'Berührung';
    const duration = document.getElementById('wizDuration').value.trim() || 'Sofort';
    const savingThrow = document.getElementById('wizSave').value.trim() || 'Keiner';
    const spellResistance = document.getElementById('wizSr').value.trim() || 'Nein';
    const description = document.getElementById('wizDesc').value.trim();

    if (!nameDe || isNaN(level) || !school || !description) {
      showCustomAlert("Fehler", "Bitte fülle alle Pflichtfelder (*) aus!");
      return;
    }

    const classLevels = [];
    if (Array.isArray(pc.classes)) {
      pc.classes.forEach(c => {
        if (['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger'].includes(c.classType)) {
          classLevels.push({ class: c.classType, level });
        }
      });
    }

    const newSpell = {
      id: 'custom_' + Date.now(),
      nameDe,
      nameEn: nameEn || undefined,
      level,
      school,
      castingTime,
      range,
      duration,
      savingThrow,
      spellResistance,
      description,
      classLevels
    };

    // Check spells known limit (Bug #8)
    const check = CombatRules.checkSpellKnownLimit(pc, newSpell, (k) => findSpell(pc, k));
    if (!check.success) {
      showCustomAlert("Zauberlimit überschritten", check.error || "Du kannst keine weiteren bekannten Zauber dieses Grades lernen.");
      return;
    }

    if (!Array.isArray(pc.customSpells)) {
      pc.customSpells = [];
    }
    pc.customSpells.push(newSpell);
    
    // Auto-learn newly created spells
    if (!Array.isArray(pc.learnedSpells)) {
      pc.learnedSpells = [];
    }
    if (!pc.learnedSpells.includes(newSpell.id)) {
      pc.learnedSpells.push(newSpell.id);
    }

    CombatState.saveToStorage();
    CombatState.syncPCToHost();
    
    showCustomAlert("Erfolg!", `"${nameDe}" wurde erfolgreich erschaffen und deinem Zauberbuch hinzugefügt!`);
    uiRegistry.renderPlayerScreen();
  });
}
