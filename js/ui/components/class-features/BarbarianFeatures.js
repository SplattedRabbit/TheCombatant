/**
 * @module    BarbarianFeatures
 * @summary   UI-Komponente für Barbar-Klassenfeatures: Kampfrausch-Toggle, Bursts-Bubbles, Regeln-Akkordeon.
 * @exports   BarbarianFeatures
 * @reads     pc.dailyAbilities, pc.isRaging, pc.level
 * @stateOps  CombatState.saveToStorage, CombatState.syncPCToHost
 * @depends   ClassFeatureComponent, CombatState
 * @notHere   Kampfrausch-Modifikatoren → Combatant.js (enterRage/exitRage) | Klassenregeln → rules.js CLASS_PROFILES
 */
import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { CombatState } from '../../../state.js';

export class BarbarianFeatures extends ClassFeatureComponent {
  constructor() {
    super('barbarian', 'Barbar', 'Barbarian');
    this.rageRulesOpen = false;
  }

  render(pc, level) {
    let rageAbility = pc.dailyAbilities.find(a => a.name === "Kampfrausch (Rage)");
    const maxUses = rageAbility ? rageAbility.max : 0;
    const usedUses = rageAbility ? rageAbility.used : 0;
    const remaining = Math.max(0, maxUses - usedUses);
    
    let rageBubbles = '';
    if (maxUses > 0) {
      for (let i = 1; i <= maxUses; i++) {
        const spent = i <= usedUses;
        rageBubbles += `
          <span class="rage-bubble use-icon use-icon-rage ${spent ? 'used' : ''}" data-idx="${i}" title="${spent ? 'Benutzt (Freigeben)' : 'Verfügbar (Verbrauchen)'}">🔥</span>
        `;
      }
    }

    const canRage = remaining > 0 || pc.isRaging;
    const rageBtnText = pc.isRaging ? '🔴 Kampfrausch beenden' : '🔥 Kampfrausch aktivieren!';
    const rageBtnStyle = pc.isRaging 
      ? 'background: rgba(139, 26, 26, 0.2); border-color: var(--red); color: var(--red); font-weight: bold; cursor: pointer;' 
      : (remaining > 0 
          ? 'background: rgba(200, 169, 110, 0.1); border-color: var(--pb); color: var(--ink); cursor: pointer;' 
          : 'background: rgba(0, 0, 0, 0.05); border-color: rgba(200, 169, 110, 0.15); color: var(--inkl); cursor: not-allowed;');

    return `
      <div class="class-card expanded" style="border: 0.5px solid var(--pb); border-radius: 3px; margin-bottom: 5px; background: rgba(200, 169, 110, 0.03); width: 100%;">
        <div class="class-card-hdr" data-key="barbarian" style="background: rgba(200, 169, 110, 0.1); padding: 4px 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">
          <span>🎭 Barbar (Stufe ${level})</span>
          <span>▼</span>
        </div>
        <div class="class-card-body" style="display: flex; padding: 6px; align-items: start; width: 100%;">
          <div style="display: flex; flex-direction: column; gap: 5px; width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8.5px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span><strong>Kampfrausch:</strong></span>
                <button class="btn btn-toggle-rules-rage" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <div style="display: flex;">${rageBubbles}</div>
                <span>(${remaining} übrig)</span>
              </div>
            </div>
            <div class="rage-rules-box" style="display: ${this.rageRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3.5px; font-family: 'Crimson Text', serif; margin-bottom: 2px;">
              <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Kampfrausch (Rage):</strong><br>
              Ein Barbar kann in einen Kampfrausch verfallen, um kurzzeitig seine Kampfkraft drastisch zu steigern.<br>
              • <strong>Boni:</strong> +4 Stärke (STR), +4 Konstitution (CON), +2 Moralbonus auf Willensrettungswürfe (Will). Die Trefferpunkte erhöhen sich temporär um +2 pro Charakterstufe.<br>
              • <strong>Mali:</strong> –2 Rüstungsklasse (RK) durch mangelnde Verteidigung.<br>
              • <strong>Dauer:</strong> 3 + veränderter Konstitutionsmodifikator Runden.<br>
              • <strong>Erschöpfung:</strong> Nach dem Kampfrausch ist der Barbar für die Dauer der aktuellen Begegnung erschöpft (–2 STR, –2 DEX, kein Laufen).
            </div>
            <button class="btn toggle-rage-btn" style="font-family: 'IM Fell English SC', serif; font-size: 9px; padding: 4px 10px; width: 100%; border-radius: 2px; ${rageBtnStyle}" ${!canRage ? 'disabled' : ''}>${rageBtnText}</button>
            <div style="margin-top: 4px; padding: 5px; background: rgba(200, 169, 110, 0.05); border: 0.5px solid var(--pb); border-radius: 2px;">
              <div style="font-family: 'IM Fell English SC', serif; font-size: 8px; font-weight: bold; color: var(--red); border-bottom: 0.5px solid rgba(200, 169, 110, 0.2); padding-bottom: 2px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span>Kampfrausch-Effekte:</span>
                ${pc.isRaging 
                  ? `<span style="background: var(--red); color: #fff; font-size: 6px; padding: 1px 3px; border-radius: 1px; font-family: sans-serif; font-weight: bold; text-transform: uppercase;">Aktiv 🟢</span>` 
                  : `<span style="background: var(--pb); color: #fff; font-size: 6px; padding: 1px 3px; border-radius: 1px; font-family: sans-serif; font-weight: bold; text-transform: uppercase;">Inaktiv ⚪</span>`}
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 7.5px; line-height: 1.3;">
                <tr style="border-bottom: 0.25px solid rgba(0,0,0,0.05);">
                  <td style="padding: 2px 0; color: var(--ink);"><strong>Stärke (STR):</strong></td>
                  <td style="text-align: right; font-family: monospace; font-weight: bold; color: ${pc.isRaging ? 'var(--red)' : 'var(--ink)'};">+4 (Kampfrausch-Bonus)</td>
                </tr>
                <tr style="border-bottom: 0.25px solid rgba(0,0,0,0.05);">
                  <td style="padding: 2px 0; color: var(--ink);"><strong>Konstitution (CON):</strong></td>
                  <td style="text-align: right; font-family: monospace; font-weight: bold; color: ${pc.isRaging ? 'var(--red)' : 'var(--ink)'};">+4 (Kampfrausch-Bonus)</td>
                </tr>
                <tr style="border-bottom: 0.25px solid rgba(0,0,0,0.05);">
                  <td style="padding: 2px 0; color: var(--ink);"><strong>Willens-Rettungswurf (Will):</strong></td>
                  <td style="text-align: right; font-family: monospace; font-weight: bold; color: ${pc.isRaging ? 'var(--red)' : 'var(--ink)'};">+2 (Willenskraft)</td>
                </tr>
                <tr style="border-bottom: 0.25px solid rgba(0,0,0,0.05);">
                  <td style="padding: 2px 0; color: var(--ink);"><strong>Rüstungsklasse (RK):</strong></td>
                  <td style="text-align: right; font-family: monospace; font-weight: bold; color: ${pc.isRaging ? 'var(--red)' : 'var(--ink)'};">-2 (Mangelnde Defensive)</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0; color: var(--ink);"><strong>Trefferpunkte (HP):</strong></td>
                  <td style="text-align: right; font-family: monospace; font-weight: bold; color: ${pc.isRaging ? 'var(--red)' : 'var(--ink)'};">+${2 * pc.level} (+2 pro Stufe)</td>
                </tr>
              </table>
              <div style="font-size: 6.5px; color: var(--inkl); font-style: italic; margin-top: 4px; border-top: 0.5px solid rgba(200, 169, 110, 0.1); padding-top: 2px;">
                Hinweis: Nach Beendigung des Kampfrauschs wirst du für die Dauer des Kampfes <strong>erschöpft</strong> (–2 Stärke, –2 Geschicklichkeit, kein Laufen).
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(pc, level, container, triggerRender) {
    const btnRage = container.querySelector('.btn-toggle-rules-rage');
    const boxRage = container.querySelector('.rage-rules-box');
    if (btnRage && boxRage) {
      btnRage.onclick = (e) => {
        e.stopPropagation();
        this.rageRulesOpen = !this.rageRulesOpen;
        boxRage.style.display = this.rageRulesOpen ? 'block' : 'none';
      };
    }

    const rageBtn = container.querySelector('.toggle-rage-btn');
    if (rageBtn) {
      rageBtn.onclick = (e) => {
        e.stopPropagation();
        const activePC = CombatState.getActivePC();
        if (activePC.isRaging) {
          const rageAbility = activePC.dailyAbilities.find(a => a.name === "Kampfrausch (Rage)");
          if (rageAbility) {
            rageAbility.used = Math.min(rageAbility.max, rageAbility.used + 1);
          }
          activePC.exitRage();
        } else {
          const rageAbility = activePC.dailyAbilities.find(a => a.name === "Kampfrausch (Rage)");
          if (rageAbility && rageAbility.used >= rageAbility.max) {
            return;
          }
          activePC.enterRage();
        }
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    }

    container.querySelectorAll('.rage-bubble').forEach(bubble => {
      bubble.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(bubble.dataset.idx);
        const activePC = CombatState.getActivePC();
        const rageAbility = activePC.dailyAbilities.find(a => a.name === "Kampfrausch (Rage)");
        if (rageAbility) {
          if (idx <= rageAbility.used) {
            rageAbility.used = idx - 1;
          } else {
            rageAbility.used = idx;
          }
          CombatState.saveToStorage();
          CombatState.syncPCToHost();
          triggerRender();
        }
      };
    });
  }

  onNewDay(pc, level) {
    let rageAbility = pc.dailyAbilities.find(a => a.name === "Kampfrausch (Rage)");
    if (rageAbility) {
      rageAbility.used = 0;
    }
  }
}
