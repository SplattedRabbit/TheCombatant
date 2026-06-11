/**
 * @module    RogueFeatures
 * @summary   UI-Komponente für Schurken-Klassenfeatures: Hinterhältiger-Angriff-Toggle, Sneak-Attack-Info.
 * @exports   RogueFeatures
 * @reads     pc.isSneakAttackActive, pc.classes
 * @stateOps  CombatState.updatePCBatch, CombatState.saveToStorage
 * @depends   ClassFeatureComponent, CombatState
 * @notHere   Sneak-Attack-Schaden → AttackEngine.js | Schaden-Würfelformel → rules.js
 */
import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { CombatState } from '../../../state.js';

export class RogueFeatures extends ClassFeatureComponent {
  constructor() {
    super('rogue', 'Schurke', 'Rogue');
    this.saRulesOpen = false;
  }

  render(pc, level) {
    const saDiceCount = Math.floor((level + 1) / 2);
    return `
      <div class="class-card expanded" style="border: 0.5px solid var(--pb); border-radius: 3px; margin-bottom: 5px; background: rgba(200, 169, 110, 0.03); width: 100%;">
        <div class="class-card-hdr" data-key="rogue" style="background: rgba(200, 169, 110, 0.1); padding: 4px 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">
          <span>🎭 Schurke (Stufe ${level})</span>
          <span>▼</span>
        </div>
        <div class="class-card-body" style="display: flex; padding: 6px; align-items: start; width: 100%;">
          <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
            <div style="display: flex; flex-direction: column; border-bottom: 0.5px dashed rgba(200,169,110,0.15); padding-bottom: 4px; margin-bottom: 2px; width: 100%;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; background: rgba(200,169,110,0.1); border: 0.5px solid var(--pb); border-radius: 2px; padding: 4px 6px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="font-weight: bold;">Hinterhältiger Angriff:</span>
                  <button class="btn btn-toggle-rules-sa" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
                </div>
                <span style="color: var(--red); font-weight: bold; font-family:'IM Fell English SC', serif;">+${saDiceCount}W6</span>
              </div>
              <div class="sa-rules-box" style="display: ${this.saRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
                <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Hinterhältiger Angriff (Sneak Attack):</strong><br>
                Zusatzschaden gegen Gegner, die ihren Geschicklichkeitsmodifikator auf die RK verlieren oder flankiert werden.<br>
                • <strong>Immunität:</strong> Kreaturen ohne erkennbare Anatomie (z.B. Konstrukte, Untote, Schleime) oder solche, die immun gegen kritische Treffer sind, erleiden keinen Sneak-Attack-Schaden.
              </div>
            </div>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 8.5px; cursor: pointer; padding: 3px 0;">
              <input type="checkbox" class="rogue-sa-toggle" ${pc.isSneakAttacking ? 'checked' : ''} style="cursor: pointer; width: 11px; height: 11px;">
              <span><strong>Sneak Attack auf Schaden anwenden</strong></span>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(pc, level, container, triggerRender) {
    const btnSa = container.querySelector('.btn-toggle-rules-sa');
    const boxSa = container.querySelector('.sa-rules-box');
    if (btnSa && boxSa) {
      btnSa.onclick = (e) => {
        e.stopPropagation();
        this.saRulesOpen = !this.saRulesOpen;
        boxSa.style.display = this.saRulesOpen ? 'block' : 'none';
      };
    }

    const saToggle = container.querySelector('.rogue-sa-toggle');
    if (saToggle) {
      saToggle.onchange = (e) => {
        const activePC = CombatState.getActivePC();
        activePC.isSneakAttacking = e.target.checked;
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    }
  }
}
