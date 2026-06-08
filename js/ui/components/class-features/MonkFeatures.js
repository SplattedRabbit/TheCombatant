import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { CombatState } from '../../../state.js';
import { showCustomAlert } from '../dialogs.js';

export class MonkFeatures extends ClassFeatureComponent {
  constructor() {
    super('monk', 'Mönch', 'Monk');
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
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px; border-top: 0.5px solid rgba(200,169,110,0.2); padding-top: 3px; margin-top: 3px;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span><strong>Joch des Geistes:</strong></span>
            <button class="monk-rule-btn" data-rule="abundant" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--red); font-family: 'IM Fell English SC', serif; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;">📖 ↗</button>
          </div>
          <span class="ki-bubble" data-key="Joch des Geistes (Abundant Step)" style="width:7px; height:7px; border-radius:50%; border:.5px solid var(--red); background-color:${spent ? 'var(--red)' : 'transparent'}; display:inline-block; cursor:pointer;" title="${spent ? 'Benutzt' : 'Freigeben'}"></span>
        </div>
      `;
    }
    if (level >= 15) {
      let palm = pc.dailyAbilities.find(a => a.name === "Zitternde Hand (Quivering Palm)");
      const spent = palm ? (palm.used > 0) : false;
      kiHtml += `
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span><strong>Zitternde Hand:</strong></span>
            <button class="monk-rule-btn" data-rule="quivering" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--red); font-family: 'IM Fell English SC', serif; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;">📖 ↗</button>
          </div>
          <span class="ki-bubble" data-key="Zitternde Hand (Quivering Palm)" style="width:7px; height:7px; border-radius:50%; border:.5px solid var(--red); background-color:${spent ? 'var(--red)' : 'transparent'}; display:inline-block; cursor:pointer;"></span>
        </div>
      `;
    }
    if (level >= 19) {
      let body = pc.dailyAbilities.find(a => a.name === "Unbefleckter Körper (Empty Body)");
      const spent = body ? (body.used > 0) : false;
      kiHtml += `
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span><strong>Unbefleckter Körper:</strong></span>
            <button class="monk-rule-btn" data-rule="empty" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--red); font-family: 'IM Fell English SC', serif; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;">📖 ↗</button>
          </div>
          <span class="ki-bubble" data-key="Unbefleckter Körper (Empty Body)" style="width:7px; height:7px; border-radius:50%; border:.5px solid var(--red); background-color:${spent ? 'var(--red)' : 'transparent'}; display:inline-block; cursor:pointer;"></span>
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
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 0; border-bottom: 0.5px dashed rgba(200,169,110,0.2);">
              <label style="display: flex; align-items: center; gap: 6px; font-size: 8.5px; cursor: pointer; margin: 0;">
                <input type="checkbox" class="monk-flurry-toggle" ${pc.isFlurrying ? 'checked' : ''} style="cursor: pointer; width: 11px; height: 11px;">
                <span><strong>Sturmangriff (Flurry of Blows) aktiv</strong></span>
              </label>
              <button class="monk-rule-btn" data-rule="flurry" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--red); font-family: 'IM Fell English SC', serif; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;">📖 ↗</button>
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

    const getAblMod = (score) => {
      const s = parseInt(score) || 10;
      return s >= 10 ? Math.floor((s - 10) / 2) : (s === 9 || s === 8 ? -1 : (s === 7 || s === 6 ? -2 : (s === 5 || s === 4 ? -4 : -5)));
    };
    const wisScore = pc.wis ? pc.wis.getValue() : 10;
    const wisMod = getAblMod(wisScore);

    container.querySelectorAll('.monk-rule-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const rule = btn.dataset.rule;
        let title = '';
        let message = '';
        let icon = '📖';

        if (rule === 'flurry') {
          title = 'Schlaghagel (Flurry of Blows)';
          message = `
            <div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11.5px; line-height: 1.35;">
              <p>Wenn ungerüstet, kann der Mönch einen Schlaghagel auf Kosten der Genauigkeit ausführen. Dies erfordert eine <strong>volle Angriffsaktion</strong>.</p>
              <ul style="margin: 4px 0; padding-left: 14px;">
                <li><strong>Zusätzliche Angriffe (mit höchstem BAB):</strong>
                  <ul style="margin: 2px 0; padding-left: 12px; list-style-type: circle;">
                    <li>Stufe 1-10: <strong>+1 Angriff</strong></li>
                    <li>Stufe 11-20 (Verbesserter Schlaghagel): <strong>+2 Angriffe</strong></li>
                  </ul>
                </li>
                <li><strong>Abzüge auf alle Angriffe der Runde:</strong>
                  <ul style="margin: 2px 0; padding-left: 12px; list-style-type: circle;">
                    <li>Stufe 1-4: <strong>-2 Abzug</strong></li>
                    <li>Stufe 5-8: <strong>-1 Abzug</strong></li>
                    <li>Stufe 9-20: <strong>Kein Abzug (0)</strong></li>
                  </ul>
                </li>
                <li><strong>Waffenbeschränkung:</strong> Nur waffenlose Schläge oder spezielle Mönchswaffen (<em>Kama, Nunchaku, Kampfstab, Sai, Shuriken, Siangham</em>).</li>
                <li><strong>Schadensmodifikator:</strong> Bei allen erfolgreichen Treffern wird der <strong>einfache Stärkemodifikator (1.0x STR)</strong> addiert (unabhängig von ein- oder zweihändiger Führung).</li>
              </ul>
              <small style="color: var(--inkm);">*Der Abzug gilt für eine gesamte Runde und betrifft somit auch Gelegenheitsangriffe.</small>
            </div>
          `;
        } else if (rule === 'abundant') {
          title = 'Joch des Geistes (Abundant Step)';
          message = `
            <div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11.5px; line-height: 1.35;">
              <p>Ab Stufe 12 kann der Mönch einmal pro Tag magisch zwischen Orten gleiten.</p>
              <ul style="margin: 4px 0; padding-left: 14px;">
                <li><strong>Anwendung:</strong> 1x pro Tag.</li>
                <li><strong>Effekt:</strong> Funktioniert wie der Zauber <em>Dimensionstür (Dimension Door)</em>.</li>
                <li><strong>Zauberstufe (Caster Level):</strong> Entspricht der <strong>halben Mönchsstufe</strong> (abgerundet). Für Stufe ${level} beträgt sie Zauberstufe ${Math.floor(level / 2)}.</li>
              </ul>
            </div>
          `;
        } else if (rule === 'quivering') {
          const dc = 10 + Math.floor(level / 2) + wisMod;
          title = 'Zitternde Hand (Quivering Palm)';
          message = `
            <div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11.5px; line-height: 1.35;">
              <p>Ab Stufe 15 kann der Mönch Schwingungen im Körper eines Gegners erzeugen, die tödlich sein können.</p>
              <ul style="margin: 4px 0; padding-left: 14px;">
                <li><strong>Anwendung:</strong> 1x pro Woche. Muss vor dem Angriffswurf angesagt werden.</li>
                <li><strong>Ziele:</strong> Konstrukte, Schleime, Pflanzen, Untote, körperlose Kreaturen und Kreaturen immun gegen kritische Treffer sind immun.</li>
                <li><strong>Effekt:</strong> Bei Treffer mit Schaden kann der Mönch das Opfer innerhalb von <strong>${level} Tagen</strong> sterben lassen (freie Aktion).</li>
                <li><strong>Rettungswurf des Opfers:</strong> Zähigkeitsrettungswurf (Fortitude Save) gegen <strong>SG ${dc}</strong>.
                  <br><small style="color: var(--inkm);">(Formel: 10 + 1/2 Mönchsstufe [${Math.floor(level / 2)}] + WIS-Mod [${wisMod >= 0 ? '+' : ''}${wisMod}])</small>
                </li>
                <li>Bei Misslingen stirbt das Opfer sofort.</li>
              </ul>
            </div>
          `;
        } else if (rule === 'empty') {
          title = 'Unbefleckter Körper (Empty Body)';
          message = `
            <div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11.5px; line-height: 1.35;">
              <p>Ab Stufe 19 kann der Mönch einen ätherischen Zustand annehmen.</p>
              <ul style="margin: 4px 0; padding-left: 14px;">
                <li><strong>Dauer:</strong> Insgesamt <strong>${level} Runden pro Tag</strong>.</li>
                <li><strong>Effekt:</strong> Funktioniert wie der Zauber <em>Ätherische Gefilde (Etherealness)</em>.</li>
                <li><strong>Aufteilung:</strong> Die Runden können auf verschiedene Gelegenheiten am Tag aufgeteilt werden.</li>
              </ul>
            </div>
          `;
        }

        showCustomAlert(title, message, 'Schließen', icon);
      };
    });
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

