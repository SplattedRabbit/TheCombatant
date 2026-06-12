/**
 * @module    WizardFeatures
 * @summary   UI-Komponente für Magier-Klassenfeatures: Schulspezialisierung, verbotene Schulen, Zauberbuch-Hinweis.
 * @exports   WizardFeatures
 * @reads     pc.wizardSpecialization, pc.learnedSpells, pc.classes
 * @stateOps  CombatState.updatePCBatch, CombatState.saveToStorage
 * @depends   ClassFeatureComponent, CombatState, spells.js, PCSpellDialogs
 * @notHere   Bonus-Zauberplätze → SpellSlotCalculator.js | Zauberbuch-UI → PCSpellbookTab.js
 */
import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { CombatState } from '../../../state.js';
import { getSchoolCodeFromInput } from '../../../spells.js';
import { cleanProhibitedSpells } from '../player/PCSpellDialogs.js';

const PROHIBITED_SCHOOLS = [
  { value: 'abj', label: 'Schutz' },
  { value: 'con', label: 'Beschwörung' },
  { value: 'enc', label: 'Verzauberung' },
  { value: 'evo', label: 'Hervorrufung' },
  { value: 'ill', label: 'Illusion' },
  { value: 'nec', label: 'Nekro' },
  { value: 'tra', label: 'Verwandlung' }
];

export class WizardFeatures extends ClassFeatureComponent {
  constructor() {
    super('wizard', 'Magier', 'Wizard');
    this.wizardRulesOpen = false;
  }

  render(pc, level) {
    const spec = pc.wizardSpecialization;
    const prob1Code = getSchoolCodeFromInput(pc.wizardProhibited1) || '';
    const prob2Code = getSchoolCodeFromInput(pc.wizardProhibited2) || '';
    const availableSchools = PROHIBITED_SCHOOLS.filter(s => s.value !== spec);

    const prob1Options = availableSchools.map(s => {
      const disabled = prob2Code && s.value === prob2Code ? 'disabled' : '';
      const selected = prob1Code === s.value ? 'selected' : '';
      return `<option value="${s.value}" ${selected} ${disabled}>${s.label}</option>`;
    }).join('');

    const prob2Options = availableSchools.map(s => {
      const disabled = prob1Code && s.value === prob1Code ? 'disabled' : '';
      const selected = prob2Code === s.value ? 'selected' : '';
      return `<option value="${s.value}" ${selected} ${disabled}>${s.label}</option>`;
    }).join('');

    return `
      <div class="class-card expanded" style="border: 0.5px solid var(--pb); border-radius: 3px; margin-bottom: 5px; background: rgba(200, 169, 110, 0.03); width: 100%;">
        <div class="class-card-hdr" data-key="wizard" style="background: rgba(200, 169, 110, 0.1); padding: 4px 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">
          <span>🎭 Magier (Stufe ${level})</span>
          <span>▼</span>
        </div>
        <div class="class-card-body" style="display: flex; padding: 6px; align-items: start; width: 100%;">
          <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
            <div style="font-family:'IM Fell English SC', serif; font-size:8px; color:var(--red); padding-bottom:2px; border-bottom:0.5px solid rgba(200,169,110,0.2); font-weight: bold;">
              Klassenfähigkeiten
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 8px; margin-top: 1px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span><strong>Schule:</strong></span>
                <button class="btn btn-toggle-rules-wizard" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
              </div>
              <select class="cinput wizard-spec" style="width: 95px; font-size: 7.5px; height: 14px; padding: 0 1px; border-radius: 1px; border: 0.5px solid var(--pb); outline: none;">
                <option value="none" ${pc.wizardSpecialization === 'none' ? 'selected' : ''}>Allgemein</option>
                <option value="abj" ${pc.wizardSpecialization === 'abj' ? 'selected' : ''}>Schutz</option>
                <option value="con" ${pc.wizardSpecialization === 'con' ? 'selected' : ''}>Beschwörung</option>
                <option value="div" ${pc.wizardSpecialization === 'div' ? 'selected' : ''}>Erkenntnis</option>
                <option value="enc" ${pc.wizardSpecialization === 'enc' ? 'selected' : ''}>Verzauberung</option>
                <option value="evo" ${pc.wizardSpecialization === 'evo' ? 'selected' : ''}>Hervorrufung</option>
                <option value="ill" ${pc.wizardSpecialization === 'ill' ? 'selected' : ''}>Illusion</option>
                <option value="nec" ${pc.wizardSpecialization === 'nec' ? 'selected' : ''}>Nekro</option>
                <option value="tra" ${pc.wizardSpecialization === 'tra' ? 'selected' : ''}>Verwandlung</option>
              </select>
            </div>
            <div class="wizard-rules-box" style="display: ${this.wizardRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif; margin-bottom: 2px;">
              <strong style="color: var(--red); font-family: 'IM Fell English SC', serif; font-size: 8px;">Magier-Schul-Spezialisierung (D&D 3.5 RAW):</strong><br>
              • <strong>Zusatz-Zauberslots:</strong> +1 Zauberslot pro Zaubergrad am Tag (nur Spezialschule).<br>
              • <strong>Zauberkunde:</strong> +2 Bonus auf Proben zum Erlernen von Zaubern der Spezialschule.<br>
              • <strong>Bannschulen:</strong> Spezialisten (außer Erkenntnis) müssen 2 Schulen bannen. Erkenntnismagier bannen 1 Schule. Gebannte Zauber sind gänzlich unbenutzbar.
            </div>
            ${pc.wizardSpecialization !== 'none' ? `
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 8px;">
                <span>Bann 1:</span>
                <select class="cinput wizard-prob1" style="width: 95px; font-size: 7.5px; height: 14px; padding: 0 1px; border-radius: 1px; border: 0.5px solid var(--pb); outline: none;">
                  <option value="" ${!prob1Code ? 'selected' : ''}>-- Wählen --</option>
                  ${prob1Options}
                </select>
              </div>
              ${pc.wizardSpecialization !== 'div' ? `
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 8px;">
                  <span>Bann 2:</span>
                  <select class="cinput wizard-prob2" style="width: 95px; font-size: 7.5px; height: 14px; padding: 0 1px; border-radius: 1px; border: 0.5px solid var(--pb); outline: none;">
                    <option value="" ${!prob2Code ? 'selected' : ''}>-- Wählen --</option>
                    ${prob2Options}
                  </select>
                </div>
              ` : ''}
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(pc, level, container, triggerRender) {
    const btnWizard = container.querySelector('.btn-toggle-rules-wizard');
    const boxWizard = container.querySelector('.wizard-rules-box');
    if (btnWizard && boxWizard) {
      btnWizard.onclick = (e) => {
        e.stopPropagation();
        this.wizardRulesOpen = !this.wizardRulesOpen;
        boxWizard.style.display = this.wizardRulesOpen ? 'block' : 'none';
      };
    }

    const spec = container.querySelector('.wizard-spec');
    if (spec) {
      spec.onchange = (e) => {
        const activePC = CombatState.getActivePC();
        activePC.wizardSpecialization = e.target.value;
        if (e.target.value === 'none') {
          activePC.wizardProhibited1 = '';
          activePC.wizardProhibited2 = '';
        } else if (e.target.value === 'div') {
          activePC.wizardProhibited2 = '';
        }
        cleanProhibitedSpells(activePC);
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    }

    const prob1 = container.querySelector('.wizard-prob1');
    if (prob1) {
      prob1.onchange = (e) => {
        const activePC = CombatState.getActivePC();
        activePC.wizardProhibited1 = e.target.value;
        cleanProhibitedSpells(activePC);
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    }

    const prob2 = container.querySelector('.wizard-prob2');
    if (prob2) {
      prob2.onchange = (e) => {
        const activePC = CombatState.getActivePC();
        activePC.wizardProhibited2 = e.target.value;
        cleanProhibitedSpells(activePC);
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    }
  }
}
