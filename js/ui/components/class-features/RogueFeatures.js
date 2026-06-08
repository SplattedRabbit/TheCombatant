import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { CombatState } from '../../../state.js';

export class RogueFeatures extends ClassFeatureComponent {
  constructor() {
    super('rogue', 'Schurke', 'Rogue');
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
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; background: rgba(200,169,110,0.1); border: 0.5px solid var(--pb); border-radius: 2px; padding: 4px 6px;">
              <span style="font-weight: bold;">Hinterhältiger Angriff (Sneak Attack):</span>
              <span style="color: var(--red); font-weight: bold; font-family:'IM Fell English SC', serif;">+${saDiceCount}W6</span>
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
