/**
 * @module    FighterFeatures
 * @summary   UI-Komponente für Kämpfer-Klassenfeatures: Bonus-Talente-Erläuterung.
 * @exports   FighterFeatures
 * @reads     pc.classes
 * @depends   ClassFeatureComponent
 */
import { ClassFeatureComponent } from './ClassFeatureComponent.js';

export class FighterFeatures extends ClassFeatureComponent {
  constructor() {
    super('fighter', 'Kämpfer', 'Fighter');
    this.fighterRulesOpen = false;
  }

  render(pc, level) {
    const bonusFeatsCount = 1 + Math.floor(level / 2);
    return `
      <div class="class-card expanded" style="border: 0.5px solid var(--pb); border-radius: 3px; margin-bottom: 5px; background: rgba(200, 169, 110, 0.03); width: 100%;">
        <div class="class-card-hdr" data-key="fighter" style="background: rgba(200, 169, 110, 0.1); padding: 4px 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">
          <span>🎭 Kämpfer (Stufe ${level})</span>
          <span>▼</span>
        </div>
        <div class="class-card-body" style="display: flex; padding: 6px; align-items: start; width: 100%;">
          <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
            <div style="display: flex; flex-direction: column; padding-bottom: 2px; width: 100%;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; background: rgba(200,169,110,0.1); border: 0.5px solid var(--pb); border-radius: 2px; padding: 4px 6px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="font-weight: bold;">Bonus-Talente:</span>
                  <button class="btn btn-toggle-rules-fighter" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
                </div>
                <span style="color: var(--red); font-weight: bold; font-family:'IM Fell English SC', serif;">${bonusFeatsCount} Talente</span>
              </div>
              <div class="fighter-rules-box" style="display: ${this.fighterRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
                <strong style="color: var(--red); font-family: 'IM Fell English SC', serif; font-size: 8px;">Kämpfer-Bonus-Talente (D&D 3.5 RAW):</strong><br>
                Ein Kämpfer erhält auf der 1. Stufe und auf jeder zweiten darauf folgenden Stufe (2, 4, 6, 8, 10, 12, 14, 16, 18 und 20) ein zusätzliches Bonus-Talent.<br>
                • <strong>Einschränkung:</strong> Diese Bonus-Talente müssen aus der Liste der Kampftalente (Kategorie "combat") gewählt werden.<br>
                • <strong>Voraussetzungen:</strong> Der Kämpfer muss alle Voraussetzungen für das gewählte Talent (z. B. Mindest-BAB oder Attributswerte) regulär erfüllen.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(pc, level, container, triggerRender) {
    const btnFighter = container.querySelector('.btn-toggle-rules-fighter');
    const boxFighter = container.querySelector('.fighter-rules-box');
    if (btnFighter && boxFighter) {
      btnFighter.onclick = (e) => {
        e.stopPropagation();
        this.fighterRulesOpen = !this.fighterRulesOpen;
        boxFighter.style.display = this.fighterRulesOpen ? 'block' : 'none';
      };
    }
  }
}
