/**
 * @module    MonkFeatures
 * @summary   UI-Komponente für Mönch-Klassenfeatures: Angriffs-Kaskade, Kampfstile, Chakra-Bubbles.
 * @exports   MonkFeatures
 * @reads     pc.dailyAbilities, pc.str, pc.dex, pc.level
 * @stateOps  CombatState.updatePCBatch, CombatState.saveToStorage
 * @depends   ClassFeatureComponent, CombatState
 * @notHere   Waffenloser Angriff Skalierung → AttackEngine.js | Geschwindigkeit → rules.js (Fast Movement)
 */
import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { CombatState } from '../../../state.js';

export class MonkFeatures extends ClassFeatureComponent {
  constructor() {
    super('monk', 'Mönch', 'Monk');
    this.flurryRulesOpen = false;
    this.abundantRulesOpen = false;
    this.quiveringRulesOpen = false;
    this.emptyRulesOpen = false;
  }

  render(pc, level) {
    const getAblMod = (score) => {
      const s = parseInt(score) || 10;
      return s >= 10 ? Math.floor((s - 10) / 2) : (s === 9 || s === 8 ? -1 : (s === 7 || s === 6 ? -2 : (s === 5 || s === 4 ? -4 : -5)));
    };

    const score = pc.wis ? pc.wis.getValue() : 10;
    const wisMod = getAblMod(score);
    const levelBonus = Math.floor(level / 5);
    const totalMonkAC = Math.max(0, wisMod) + levelBonus;

    let kiHtml = '';
    if (level >= 12) {
      let step = pc.dailyAbilities.find(a => a.name === "Joch des Geistes (Abundant Step)");
      const spent = step ? (step.used > 0) : false;
      kiHtml += `
        <div style="display: flex; flex-direction: column; border-top: 0.5px solid rgba(200,169,110,0.2); padding-top: 3px; margin-top: 3px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <span><strong>Joch des Geistes:</strong></span>
              <button class="btn btn-toggle-rules-abundant" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
            </div>
            <span class="ki-bubble" data-key="Joch des Geistes (Abundant Step)" style="width:7px; height:7px; border-radius:50%; border:.5px solid var(--red); background-color:${spent ? 'var(--red)' : 'transparent'}; display:inline-block; cursor:pointer;" title="${spent ? 'Benutzt (Freigeben)' : 'Verfügbar (Verbrauchen)'}"></span>
          </div>
          <!-- Abundant Step Infobox -->
          <div class="abundant-rules-box" style="display: ${this.abundantRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
            <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Joch des Geistes (Abundant Step):</strong><br>
            Ab Stufe 12 kann der Mönch einmal pro Tag magisch zwischen Orten gleiten.<br>
            • <strong>Effekt:</strong> Funktioniert wie der Zauber <em>Dimensionstür (Dimension Door)</em>.<br>
            • <strong>Zauberstufe (Caster Level):</strong> Halbe Mönchsstufe (abgerundet). Für Stufe ${level} beträgt sie Zauberstufe ${Math.floor(level / 2)}.
          </div>
        </div>
      `;
    }
    if (level >= 15) {
      let palm = pc.dailyAbilities.find(a => a.name === "Zitternde Hand (Quivering Palm)");
      const spent = palm ? (palm.used > 0) : false;
      const dc = 10 + Math.floor(level / 2) + wisMod;
      kiHtml += `
        <div style="display: flex; flex-direction: column; border-top: 0.5px solid rgba(200,169,110,0.1); padding-top: 3px; margin-top: 3px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <span><strong>Zitternde Hand:</strong></span>
              <button class="btn btn-toggle-rules-quivering" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
            </div>
            <span class="ki-bubble" data-key="Zitternde Hand (Quivering Palm)" style="width:7px; height:7px; border-radius:50%; border:.5px solid var(--red); background-color:${spent ? 'var(--red)' : 'transparent'}; display:inline-block; cursor:pointer;" title="${spent ? 'Benutzt (Freigeben)' : 'Verfügbar (Verbrauchen)'}"></span>
          </div>
          <!-- Quivering Palm Infobox -->
          <div class="quivering-rules-box" style="display: ${this.quiveringRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
            <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Zitternde Hand (Quivering Palm):</strong><br>
            Ab Stufe 15 kann der Mönch Schwingungen im Körper eines Gegners erzeugen.<br>
            • <strong>Anwendung:</strong> 1x pro Woche. Muss vor dem Angriff angesagt werden.<br>
            • <strong>SG:</strong> Zähigkeitswurf gegen <strong>SG ${dc}</strong> (10 + 1/2 Stufe [${Math.floor(level / 2)}] + WIS-Mod [${wisMod}]). Bei Fehlschlag stirbt das Opfer sofort.
          </div>
        </div>
      `;
    }
    if (level >= 19) {
      let body = pc.dailyAbilities.find(a => a.name === "Unbefleckter Körper (Empty Body)");
      const spent = body ? (body.used > 0) : false;
      kiHtml += `
        <div style="display: flex; flex-direction: column; border-top: 0.5px solid rgba(200,169,110,0.1); padding-top: 3px; margin-top: 3px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <span><strong>Unbefleckter Körper:</strong></span>
              <button class="btn btn-toggle-rules-empty" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
            </div>
            <span class="ki-bubble" data-key="Unbefleckter Körper (Empty Body)" style="width:7px; height:7px; border-radius:50%; border:.5px solid var(--red); background-color:${spent ? 'var(--red)' : 'transparent'}; display:inline-block; cursor:pointer;" title="${spent ? 'Benutzt (Freigeben)' : 'Verfügbar (Verbrauchen)'}"></span>
          </div>
          <!-- Empty Body Infobox -->
          <div class="empty-rules-box" style="display: ${this.emptyRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
            <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Unbefleckter Körper (Empty Body):</strong><br>
            Ab Stufe 19 kann der Mönch einen ätherischen Zustand annehmen.<br>
            • <strong>Dauer:</strong> Insgesamt <strong>${level} Runden pro Tag</strong> (funktioniert wie der Zauber <em>Ätherische Gefilde / Etherealness</em>).
          </div>
        </div>
      `;
    }

    return `
      <div class="class-card expanded" style="border: 0.5px solid var(--pb); border-radius: 3px; margin-bottom: 5px; background: rgba(200, 169, 110, 0.03); width: 100%;">
        <div class="class-card-hdr" data-key="monk" style="background: rgba(200, 169, 110, 0.1); padding: 4px 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">
          <span>🎭 Mönch (Stufe ${level})</span>
          <span>▼</span>
        </div>
        <div class="class-card-body" style="display: flex; padding: 6px; align-items: start; width: 100%;">
          <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
            <div style="background: rgba(200, 169, 110, 0.12); border: 0.5px solid var(--pb); border-radius: 2px; padding: 3px 6px; font-size: 8px; color: var(--red); text-align: center; font-weight: bold;">
              🥋 Unrüstungs-Bonus aktiv: +${totalMonkAC} auf Rüstungsklasse (AC)
            </div>
            
            <div style="display: flex; flex-direction: column; border-bottom: 0.5px dashed rgba(200,169,110,0.2); padding-bottom: 4px; margin-bottom: 2px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 0;">
                <label style="display: flex; align-items: center; gap: 6px; font-size: 8.5px; cursor: pointer; margin: 0;">
                  <input type="checkbox" class="monk-flurry-toggle" ${pc.isFlurrying ? 'checked' : ''} style="cursor: pointer; width: 11px; height: 11px;">
                  <span><strong>Sturmangriff (Flurry of Blows) aktiv</strong></span>
                </label>
                <button class="btn btn-toggle-rules-flurry" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
              </div>
              
              <!-- Flurry Infobox -->
              <div class="flurry-rules-box" style="display: ${this.flurryRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
                <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Schlaghagel (Flurry of Blows):</strong><br>
                Wenn ungerüstet, kann der Mönch einen Schlaghagel (volle Angriffsaktion) mit unbewaffneten Schlägen oder Mönchswaffen ausführen.<br>
                • <strong>Zusatzangriff:</strong> +1 Angriff (Stufe 1-10) bzw. +2 Angriffe (ab Stufe 11).<br>
                • <strong>Abzug:</strong> -2 (Stufe 1-4), -1 (Stufe 5-8), kein Abzug (ab Stufe 9) auf alle Angriffe der Runde.<br>
                • <strong>Schaden:</strong> 1.0x Stärke bei allen Treffern (auch Zweihand).
              </div>
            </div>
            
            ${kiHtml}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(pc, level, container, triggerRender) {
    const flurry = container.querySelector('.monk-flurry-toggle');
    if (flurry) {
      flurry.onchange = (e) => {
        const activePC = CombatState.getActivePC();
        activePC.isFlurrying = e.target.checked;
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    }

    container.querySelectorAll('.ki-bubble').forEach(bubble => {
      bubble.onclick = (e) => {
        e.stopPropagation();
        const key = bubble.dataset.key;
        const activePC = CombatState.getActivePC();
        const kiAbility = activePC.dailyAbilities.find(a => a.name === key);
        if (kiAbility) {
          kiAbility.used = kiAbility.used > 0 ? 0 : 1;
          CombatState.saveToStorage();
          CombatState.syncPCToHost();
          triggerRender();
        }
      };
    });

    // Rules Toggles
    const btnFlurry = container.querySelector('.btn-toggle-rules-flurry');
    const boxFlurry = container.querySelector('.flurry-rules-box');
    if (btnFlurry && boxFlurry) {
      btnFlurry.onclick = (e) => {
        e.stopPropagation();
        this.flurryRulesOpen = !this.flurryRulesOpen;
        boxFlurry.style.display = this.flurryRulesOpen ? 'block' : 'none';
      };
    }

    const btnAbundant = container.querySelector('.btn-toggle-rules-abundant');
    const boxAbundant = container.querySelector('.abundant-rules-box');
    if (btnAbundant && boxAbundant) {
      btnAbundant.onclick = (e) => {
        e.stopPropagation();
        this.abundantRulesOpen = !this.abundantRulesOpen;
        boxAbundant.style.display = this.abundantRulesOpen ? 'block' : 'none';
      };
    }

    const btnQuivering = container.querySelector('.btn-toggle-rules-quivering');
    const boxQuivering = container.querySelector('.quivering-rules-box');
    if (btnQuivering && boxQuivering) {
      btnQuivering.onclick = (e) => {
        e.stopPropagation();
        this.quiveringRulesOpen = !this.quiveringRulesOpen;
        boxQuivering.style.display = this.quiveringRulesOpen ? 'block' : 'none';
      };
    }

    const btnEmpty = container.querySelector('.btn-toggle-rules-empty');
    const boxEmpty = container.querySelector('.empty-rules-box');
    if (btnEmpty && boxEmpty) {
      btnEmpty.onclick = (e) => {
        e.stopPropagation();
        this.emptyRulesOpen = !this.emptyRulesOpen;
        boxEmpty.style.display = this.emptyRulesOpen ? 'block' : 'none';
      };
    }
  }

  onNewDay(pc, level) {
    const keys = ["Joch des Geistes (Abundant Step)", "Zitternde Hand (Quivering Palm)", "Unbefleckter Körper (Empty Body)"];
    keys.forEach(k => {
      let step = pc.dailyAbilities.find(a => a.name === k);
      if (step) {
        step.used = 0;
      }
    });
  }
}
