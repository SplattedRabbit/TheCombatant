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
              <span><strong>Schule:</strong></span>
              <select class="cinput wizard-spec" style="width: 60px; font-size: 7.5px; height: 14px; padding: 0 1px; border-radius: 1px; border: 0.5px solid var(--pb); outline: none;">
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
            ${pc.wizardSpecialization !== 'none' ? `
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 8px;">
                <span>Bann 1:</span>
                <select class="cinput wizard-prob1" style="width: 60px; font-size: 7.5px; height: 14px; padding: 0 1px; border-radius: 1px; border: 0.5px solid var(--pb); outline: none;">
                  <option value="" ${!prob1Code ? 'selected' : ''}>-- Wählen --</option>
                  ${prob1Options}
                </select>
              </div>
              ${pc.wizardSpecialization !== 'div' ? `
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 8px;">
                  <span>Bann 2:</span>
                  <select class="cinput wizard-prob2" style="width: 60px; font-size: 7.5px; height: 14px; padding: 0 1px; border-radius: 1px; border: 0.5px solid var(--pb); outline: none;">
                    <option value="" ${!prob2Code ? 'selected' : ''}>-- Wählen --</option>
                    ${prob2Options}
                  </select>
                </div>
              ` : ''}
              
              <div style="background: rgba(200, 169, 110, 0.05); border: 0.5px solid var(--pb); border-radius: 2px; padding: 5px; font-size: 7.5px; color: var(--ink); line-height: 1.3; margin-top: 4px; font-family: 'Crimson Text', serif;">
                <strong style="color: var(--red); font-family: 'IM Fell English SC', serif; font-size: 8px;">Schul-Spezialisierung (D&D 3.5 RAW):</strong><br>
                • <strong>Zusatz-Zauberslots:</strong> Du erhältst <strong>+1 Zauberslot pro Zaubergrad (Grad 1-9)</strong> am Tag. Dieser Slot darf <em>ausschließlich</em> für einen Zauber deiner Spezialschule verwendet werden.<br>
                • <strong>Zauberkunde-Bonus:</strong> Du erhältst einen Bonus von <strong>+2 auf Zauberkunde-Würfe</strong>, um neue Zauber deiner Spezialschule zu erlernen.<br>
                • <strong>Bannschulen:</strong> Zauber aus Bannschulen sind dir gänzlich unzugänglich. Du kannst sie weder lernen, vorbereiten, noch von Schriftrollen (Scrolls) oder Zauberstäben (Wands) wirken.<br>
                • <strong>Regel-Ausnahme:</strong> Ein Erkenntnis-Magier (Diviner) benötigt nur 1 Bannschule statt 2. Universal-Zauber können niemals gebannt werden.
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(pc, level, container, triggerRender) {
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
