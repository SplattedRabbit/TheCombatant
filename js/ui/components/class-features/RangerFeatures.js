/**
 * @module    RangerFeatures
 * @summary   UI-Komponente für Waldläufer-Klassenfeatures: Erzfeind-Toggle, Begleiter-Verwaltung, TWF-Hinweise.
 * @exports   RangerFeatures
 * @reads     pc.dailyAbilities, pc.isFavoredEnemyActive, pc.classes
 * @stateOps  CombatState.updatePCBatch, CombatState.saveToStorage
 * @depends   ClassFeatureComponent, CombatState, dialogs
 * @notHere   Erzfeind-Schadensberechnung → AttackEngine.js | RangerRules.getFavoredEnemyBonus → RangerRules.js
 */
import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { CombatState } from '../../../state.js';
import { showCustomAlert } from '../dialogs.js';

export class RangerFeatures extends ClassFeatureComponent {
  constructor() {
    super('ranger', 'Waldläufer', 'Ranger');
    this.generalRulesOpen = false;
    this.favoredRulesOpen = false;
    this.combatstyleRulesOpen = false;
    this.wildempathyRulesOpen = false;
  }

  render(pc, level) {
    const getAblMod = (score) => {
      const s = parseInt(score) || 10;
      return s >= 10 ? Math.floor((s - 10) / 2) : (s === 9 || s === 8 ? -1 : (s === 7 || s === 6 ? -2 : (s === 5 || s === 4 ? -4 : -5)));
    };

    const enemyBonus = Math.floor(level / 5) * 2 + 2;
    const style = pc.rangerCombatStyle || 'none';
    const casterLvl = Math.floor(level / 2);
    const companionLvl = Math.floor(level / 2);

    let combatStyleHtml = '';
    if (style !== 'none' && level >= 2) {
      let feats = [];
      if (style === 'archery') {
        feats.push({ name: 'Schnelles Schießen (Rapid Shot)', lvl: 2 });
        if (level >= 6) feats.push({ name: 'Mehrfachschuss (Manyshot)', lvl: 6 });
        if (level >= 11) feats.push({ name: 'Verbesserter Präziser Schuss (Improved Precise Shot)', lvl: 11 });
      } else if (style === 'twoweapon') {
        feats.push({ name: 'Zwei-Waffen-Kampf (Two-Weapon Fighting)', lvl: 2 });
        if (level >= 6) feats.push({ name: 'Verbesserter Zwei-Waffen-Kampf (Improved Two-Weapon Fighting)', lvl: 6 });
        if (level >= 11) feats.push({ name: 'Überragender Zwei-Waffen-Kampf (Greater Two-Weapon Fighting)', lvl: 11 });
      }

      combatStyleHtml = `
        <div style="background: rgba(200, 169, 110, 0.06); border: 0.5px solid rgba(200, 169, 110, 0.2); border-radius: 2px; padding: 4px; margin-top: 3px; font-size: 7.5px;">
          <div style="font-weight: bold; color: var(--red); margin-bottom: 2px; display: flex; justify-content: space-between;">
            <span>Aktivierte Kampfstil-Talente:</span>
            <span style="color: var(--inkm); font-weight: normal; font-size: 6.8px; font-style: italic;">(Nur in leichter/keiner Rüstung)</span>
          </div>
          <ul style="margin: 0; padding-left: 10px; list-style-type: square; line-height: 1.25;">
            ${feats.map(f => `<li><strong>${f.name}</strong></li>`).join('')}
          </ul>
        </div>
      `;
    }

    return `
      <div class="class-card expanded" style="border: 0.5px solid var(--pb); border-radius: 3px; margin-bottom: 5px; background: rgba(200, 169, 110, 0.03); width: 100%;">
        <div class="class-card-hdr" data-key="ranger" style="background: rgba(200, 169, 110, 0.1); padding: 4px 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">
          <span>🎭 Waldläufer (Stufe ${level})</span>
          <span>▼</span>
        </div>
        <div class="class-card-body" style="display: flex; padding: 6px; align-items: start; width: 100%;">
          <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
            <div style="font-family:'IM Fell English SC', serif; font-size:8px; color:var(--red); padding-bottom:2px; border-bottom:0.5px solid rgba(200,169,110,0.2); display: flex; justify-content: space-between; align-items: center;">
              <span>Klassenfähigkeiten</span>
              <button class="btn btn-toggle-rules-general" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
            </div>
            
            <div class="general-rules-box" style="display: ${this.generalRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
              <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Waldläufer-Klassenfähigkeiten:</strong><br>
              • <strong>Track (Stufe 1):</strong> Erhält <em>Spurenlesen</em> als Bonus-Talent.<br>
              • <strong>Endurance (Stufe 3):</strong> Erhält <em>Ausdauer</em> als Bonus-Talent.<br>
              • <strong>Tierbegleiter (Stufe 4):</strong> Erhält einen Tierbegleiter (Stufe = 1/2 Waldläuferstufe).<br>
              • <strong>Zaubersprüche (Stufe 4):</strong> Divine Zauber basierend auf Weisheit (Zauberstufe = 1/2 Waldläuferstufe).<br>
              • <strong>Woodland Stride (Stufe 7):</strong> Kann sich ohne Schaden oder Verlangsamung durch natürliches Unterholz bewegen.<br>
              • <strong>Swift Tracker (Stufe 8):</strong> Kann Spuren ohne Abzug von -5 mit normaler Geschwindigkeit verfolgen.<br>
              • <strong>Evasion (Stufe 9):</strong> Erleidet bei erfolgreichem Reflexwurf keinen Schaden (nur in leichter oder keiner Rüstung).<br>
              • <strong>Camouflage (Stufe 13):</strong> Kann sich in natürlichem Gelände auch ohne Deckung verstecken.<br>
              • <strong>Hide in Plain Sight (Stufe 17):</strong> Kann sich in natürlichem Gelände auch unter Beobachtung verstecken.
            </div>
            
            <!-- Erzfeind Sektion -->
            <div style="display: flex; flex-direction: column; border-bottom: 0.5px dashed rgba(200,169,110,0.2); padding-bottom: 4px; margin-bottom: 2px;">
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 8px; margin-top: 1px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span><strong>Erzfeind:</strong></span>
                  <button class="btn btn-toggle-rules-favored" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
                </div>
                <input type="text" class="cinput ranger-favored-enemy" value="${pc.favoredEnemy || ''}" placeholder="z. B. Untote" style="width: 70px; font-size: 8px; height: 13px; line-height: 1; border-radius: 1px; border: 0.5px solid var(--pb); padding: 0 2px;">
              </div>
              <div class="favored-rules-box" style="display: ${this.favoredRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
                <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Erzfeind (Favored Enemy):</strong><br>
                Waldläufer erhält Boni gegen bestimmte Kreaturenarten.<br>
                • <strong>Aktiver Bonus: +${enemyBonus}</strong><br>
                • <strong>Anwendung:</strong> Gilt für alle <strong>Waffenschadenswürfe</strong> gegen den Erzfeind. Gilt für Proben auf Bluffen, Entdecken, Lauschen, Motiv erkennen und Überleben gegen diese Kreaturen.<br>
                • <strong style="color: var(--red);">Wichtig (3.5e RAW):</strong> Gewährt <strong>keinen Angriffsbonus</strong> auf Trefferwürfe!
              </div>
            </div>
            <div style="background: rgba(200, 169, 110, 0.12); border: 0.5px solid var(--pb); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--red); text-align: center; font-weight: bold; line-height: 1.25;">
              ✦ Erzfeind-Bonus: +${enemyBonus} auf Schaden & Fertigkeiten ✦
            </div>

            <!-- Kampfstil Sektion -->
            ${level >= 2 ? `
              <div style="display: flex; flex-direction: column; border-bottom: 0.5px dashed rgba(200,169,110,0.2); padding-bottom: 4px; margin-bottom: 2px;">
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 8px; padding-top: 3px; margin-top: 2px;">
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span><strong>Kampfstil:</strong></span>
                    <button class="btn btn-toggle-rules-combatstyle" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
                  </div>
                  <select class="cinput ranger-combat-style" style="width: 70px; font-size: 7.5px; height: 14px; padding: 0 1px;">
                    <option value="none" ${style === 'none' ? 'selected' : ''}>-- Wählen --</option>
                    <option value="archery" ${style === 'archery' ? 'selected' : ''}>Bogenschießen</option>
                    <option value="twoweapon" ${style === 'twoweapon' ? 'selected' : ''}>Zwei-Waffen</option>
                  </select>
                </div>
                <div class="combatstyle-rules-box" style="display: ${this.combatstyleRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
                  <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Kampfstil (Combat Style):</strong><br>
                  Ab Stufe 2 spezialisiert sich der Waldläufer auf einen Kampfstil. Die Vorteile gelten <strong>nur in leichter/keiner Rüstung</strong>!<br>
                  • <strong>Bogenschießen:</strong> Stufe 2: <em>Rapid Shot</em>, Stufe 6: <em>Manyshot</em>, Stufe 11: <em>Improved Precise Shot</em>.<br>
                  • <strong>Zwei-Waffen-Kampf:</strong> Stufe 2: <em>Two-Weapon Fighting</em>, Stufe 6: <em>Improved Two-Weapon Fighting</em>, Stufe 11: <em>Greater Two-Weapon Fighting</em>.
                </div>
                ${combatStyleHtml}
              </div>
            ` : ''}

            <!-- Wildes Mitgefühl Sektion -->
            <div style="display: flex; flex-direction: column; border-bottom: 0.5px dashed rgba(200,169,110,0.2); padding-bottom: 4px; margin-bottom: 2px;">
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 8px; padding-top: 3px; margin-top: 2px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span><strong>Wildes Mitgefühl:</strong></span>
                  <button class="btn btn-toggle-rules-wildempathy" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
                </div>
                <button class="xbtn ranger-wild-empathy-btn" style="font-size: 7.5px; padding: 1px 4px; height: 14px; line-height: 1; font-family: 'IM Fell English SC', serif; cursor: pointer;">
                  Formel anzeigen 🎲
                </button>
              </div>
              <div class="wildempathy-rules-box" style="display: ${this.wildempathyRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
                <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Wildes Mitgefühl (Wild Empathy):</strong><br>
                Verbesserung der Einstellung von Tieren (Diplomatie-Pendant).<br>
                • <strong>Wurfformel:</strong> 1d20 + Waldläufer-Stufe [${level}] + CHA-Mod.<br>
                • <strong>Anwendung:</strong> Sichtkontakt und Nähe (max. 9m), Dauer 1 min.<br>
                • <strong>Bestien:</strong> Mit -4 Abzug auch auf magische Bestien (Int 1-2) anwendbar.
              </div>
            </div>

            <!-- Tierbegleiter & Zauberstufe Fußzeile -->
            ${level >= 4 ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 7.2px; border-top: 0.5px solid rgba(200,169,110,0.2); padding-top: 3px; margin-top: 2px; color: var(--inkm);">
                <div>🐾 Begleiter-Stufe: <strong>${companionLvl}</strong></div>
                <div style="text-align: right;">🔮 Waldläufer-Zauberstufe: <strong>${casterLvl}</strong></div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(pc, level, container, triggerRender) {
    const enemyInp = container.querySelector('.ranger-favored-enemy');
    if (enemyInp) {
      enemyInp.onchange = (e) => {
        const activePC = CombatState.getActivePC();
        activePC.favoredEnemy = e.target.value;
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
      };
    }

    const styleSel = container.querySelector('.ranger-combat-style');
    if (styleSel) {
      styleSel.onchange = (e) => {
        const activePC = CombatState.getActivePC();
        activePC.rangerCombatStyle = e.target.value;
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    }

    const getAblMod = (score) => {
      const s = parseInt(score) || 10;
      return s >= 10 ? Math.floor((s - 10) / 2) : (s === 9 || s === 8 ? -1 : (s === 7 || s === 6 ? -2 : (s === 5 || s === 4 ? -4 : -5)));
    };
    const chaScore = pc.cha ? pc.cha.getValue() : 10;
    const chaMod = getAblMod(chaScore);
    const wildEmpathyTotal = level + chaMod;

    const empathyBtn = container.querySelector('.ranger-wild-empathy-btn');
    if (empathyBtn) {
      empathyBtn.onclick = (e) => {
        e.stopPropagation();
        const title = 'Wildes Mitgefühl (Wurf)';
        const message = `
          <div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11.5px; line-height: 1.35;">
            <p>Würfle einen physischen d20-Wurf und addiere deine Modifikatoren:</p>
            <div style="background: rgba(200, 169, 110, 0.1); border: 0.5px solid var(--pb); border-radius: 3px; padding: 6px; font-family: 'IM Fell English SC', serif; text-align: center; margin: 6px 0; font-size: 11px; font-weight: bold; color: var(--red);">
              d20 + ${wildEmpathyTotal}
            </div>
            <div style="font-size: 8px; color: var(--inkm); line-height: 1.25; margin-bottom: 6px;">
              <strong>Aufschlüsselung der Formel:</strong><br>
              • d20 (Physischer Wurf)<br>
              • + ${level} (Waldläuferstufe)<br>
              • + ${chaMod >= 0 ? '+' : ''}${chaMod} (Charisma-Modifikator [Wert: ${chaScore}])
            </div>
            <div style="font-size: 8px; background: rgba(0,0,0,0.02); padding: 4px; border: 0.3px dashed var(--pb); border-radius: 2px; line-height: 1.2;">
              <strong>Schwierigkeitsgrade (SG / DC):</strong><br>
              • Gleichgültig machen: SG 10 (wenn unfreundlich) / SG 15 (wenn feindselig)<br>
              • Freundlich machen: SG 15 (von gleichgültig) / SG 25 (von feindselig)<br>
              • Hilfsbereit machen: SG 20 (von freundlich) / SG 30 (von gleichgültig)
            </div>
            <small style="color: var(--inkm); font-size: 7px; display: block; margin-top: 4px;">*Gegen magische Bestien (Int 1-2) gilt ein zusätzlicher Abzug von -4.</small>
          </div>
        `;
        showCustomAlert(title, message, 'Schließen', '🎲');
      };
    }

    // Toggle Buttons for Rules
    const btnGeneral = container.querySelector('.btn-toggle-rules-general');
    const boxGeneral = container.querySelector('.general-rules-box');
    if (btnGeneral && boxGeneral) {
      btnGeneral.onclick = (e) => {
        e.stopPropagation();
        this.generalRulesOpen = !this.generalRulesOpen;
        boxGeneral.style.display = this.generalRulesOpen ? 'block' : 'none';
      };
    }

    const btnFavored = container.querySelector('.btn-toggle-rules-favored');
    const boxFavored = container.querySelector('.favored-rules-box');
    if (btnFavored && boxFavored) {
      btnFavored.onclick = (e) => {
        e.stopPropagation();
        this.favoredRulesOpen = !this.favoredRulesOpen;
        boxFavored.style.display = this.favoredRulesOpen ? 'block' : 'none';
      };
    }

    const btnCombatstyle = container.querySelector('.btn-toggle-rules-combatstyle');
    const boxCombatstyle = container.querySelector('.combatstyle-rules-box');
    if (btnCombatstyle && boxCombatstyle) {
      btnCombatstyle.onclick = (e) => {
        e.stopPropagation();
        this.combatstyleRulesOpen = !this.combatstyleRulesOpen;
        boxCombatstyle.style.display = this.combatstyleRulesOpen ? 'block' : 'none';
      };
    }

    const btnWildempathy = container.querySelector('.btn-toggle-rules-wildempathy');
    const boxWildempathy = container.querySelector('.wildempathy-rules-box');
    if (btnWildempathy && boxWildempathy) {
      btnWildempathy.onclick = (e) => {
        e.stopPropagation();
        this.wildempathyRulesOpen = !this.wildempathyRulesOpen;
        boxWildempathy.style.display = this.wildempathyRulesOpen ? 'block' : 'none';
      };
    }
  }
}

