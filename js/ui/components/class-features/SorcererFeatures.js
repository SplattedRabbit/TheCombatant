/**
 * @module    SorcererFeatures
 * @summary   UI-Komponente für Hexenmeister-Klassenfeatures: Spontanzauber-Übersicht, Schule-Hinweise.
 * @exports   SorcererFeatures
 * @reads     pc.learnedSpells, pc.classes
 * @stateOps  Keine direkt — Zauber werden via PCSpellDialogs verwaltet
 * @depends   ClassFeatureComponent, dialogs
 * @notHere   Spells-Known-Limit → rules.js (checkSpellKnownLimit) | Spontanzauber-Slots → SpellSlotCalculator.js
 */
import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { showCustomAlert } from '../dialogs.js';

export class SorcererFeatures extends ClassFeatureComponent {
  constructor() {
    super('sorcerer', 'Hexenmeister', 'Sorcerer');
    this.castingRulesOpen = false;
    this.eschewRulesOpen = false;
    this.familiarRulesOpen = false;
  }

  render(pc, level) {
    const familiarType = pc.familiarType || 'none';
    const familiarName = pc.familiarName || '';

    const familiarTypeLabels = {
      bat: 'Fledermaus',
      cat: 'Katze',
      hawk: 'Falke',
      lizard: 'Eidechse',
      owl: 'Eule',
      rat: 'Ratte',
      raven: 'Rabe',
      snake: 'Schlange',
      toad: 'Kröte',
      weasel: 'Wiesel'
    };

    const familiarBonuses = {
      bat: '+3 auf Lauschen (Listen) checks',
      cat: '+3 auf Leise bewegen (Move Silently) checks',
      hawk: '+3 auf Entdecken (Spot) in hellem Licht',
      lizard: '+3 auf Klettern (Climb) checks',
      owl: '+3 auf Entdecken (Spot) in Schatten',
      rat: '+2 auf Zähigkeitsrettungswürfe (Fortitude)',
      raven: '+3 auf Schätzen (Appraise) checks (spricht Sprache)',
      snake: '+3 auf Bluffen (Bluff) checks',
      toad: '+3 maximale Trefferpunkte (HP)',
      weasel: '+2 auf Reflexrettungswürfe (Reflex)'
    };

    const activeLabel = familiarType !== 'none' ? `${familiarName} (${familiarTypeLabels[familiarType] || familiarType})` : 'Keiner';
    const activeBonus = familiarType !== 'none' ? familiarBonuses[familiarType] : 'Kein Bonus aktiv';

    return `
      <div class="class-card expanded" style="border: 0.5px solid var(--pb); border-radius: 3px; margin-bottom: 5px; background: rgba(200, 169, 110, 0.03); width: 100%;">
        <div class="class-card-hdr" data-key="sorcerer" style="background: rgba(200, 169, 110, 0.1); padding: 4px 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">
          <span>🎭 Hexenmeister (Stufe ${level})</span>
          <span>▼</span>
        </div>
        <div class="class-card-body" style="display: flex; padding: 6px; align-items: start; width: 100%;">
          <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
            <div style="font-family:'IM Fell English SC', serif; font-size:8px; color:var(--red); padding-bottom:2px; border-bottom:0.5px solid rgba(200,169,110,0.2); font-weight: bold;">
              Klassenfähigkeiten
            </div>
            
            <!-- Spontanes Zaubern -->
            <div style="display: flex; flex-direction: column; border-bottom: 0.5px dashed rgba(200,169,110,0.15); padding-bottom: 4px; margin-bottom: 2px;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px; padding-bottom: 3.5px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span>🔮 <strong>Spontanes Zaubern:</strong></span>
                  <button class="btn btn-toggle-rules-casting" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
                </div>
                <span style="color: var(--inkm); font-size: 7.2px; font-style: italic;">Ohne Vorbereitung</span>
              </div>
              <div class="casting-rules-box" style="display: ${this.castingRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
                <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Spontanes Zaubern:</strong><br>
                Hexenmeister bereiten ihre Zauber nicht im Voraus vor.<br>
                • <strong>Attribut (Charisma):</strong> Max Zaubergrad = 10 + Zaubergrad. SG = 10 + Zaubergrad + CHA-Mod.<br>
                • <strong>Metamagie (3.5e RAW):</strong> Zauberzeit erhöht sich auf Volle Aktion (Full-Round Action) für Zauber, die sonst 1 Standardaktion dauern. <em>Schnelles Zaubern (Quicken Spell)</em> ist nicht nutzbar.
              </div>
            </div>

            <!-- Materialien weglassen -->
            <div style="display: flex; flex-direction: column; border-bottom: 0.5px dashed rgba(200,169,110,0.15); padding-bottom: 4px; margin-bottom: 2px;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px; padding: 2px 0;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span>📜 <strong>Materialien weglassen:</strong></span>
                  <button class="btn btn-toggle-rules-eschew" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
                </div>
                <span style="color: var(--inkm); font-size: 7.2px; font-style: italic;">Eschew Materials Feat</span>
              </div>
              <div class="eschew-rules-box" style="display: ${this.eschewRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
                <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Materialien weglassen:</strong><br>
                Bonus-Talent auf Stufe 1.<br>
                • <strong>Effekt:</strong> Materialkomponenten im Wert von 1 GM oder weniger entfallen.<br>
                • <strong>Einschränkung:</strong> Teurere Komponenten oder Magische Fokusse (F) müssen weiterhin gestellt werden.
              </div>
            </div>

            <!-- Vertrauenspartner -->
            <div style="display: flex; flex-direction: column; gap: 2px; font-size: 8px; padding-top: 2px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span>🦇 <strong>Vertrauenspartner (Familiar):</strong></span>
                  <button class="btn btn-toggle-rules-familiar" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
                </div>
              </div>
              
              <div class="familiar-rules-box" style="display: ${this.familiarRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif; margin-bottom: 3px;">
                <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Vertrauenspartner (Familiar):</strong><br>
                • <strong>Tod/Entlassung:</strong> Zähigkeitswurf gegen SG 15 nötig. Bei Misslingen verliert man 200 EP pro Stufe, bei Erfolg 100 EP pro Stufe.<br>
                • <strong>Bonus:</strong> Gilt bei einer Entfernung bis zu 1 Meile.
              </div>

              <div style="background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); border-radius: 2px; padding: 4px; font-size: 7.2px; line-height: 1.2; margin-top: 1px;">
                • <strong>Partner:</strong> <span style="color: var(--red); font-weight: bold;">${activeLabel}</span><br>
                • <strong>Aktivierter Bonus:</strong> <span style="color: var(--ink);">${activeBonus}</span><br>
                <span style="font-size: 6.2px; color: var(--inkl); font-style: italic; display: block; margin-top: 3px;">
                  🐾 Wähle den Reiter <strong>"Vertrauter"</strong> oben rechts, um deinen Vertrauten zu rufen, zu benennen oder zu wechseln.
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  bindEvents(pc, level, container, triggerRender) {
    const btnCasting = container.querySelector('.btn-toggle-rules-casting');
    const boxCasting = container.querySelector('.casting-rules-box');
    if (btnCasting && boxCasting) {
      btnCasting.onclick = (e) => {
        e.stopPropagation();
        this.castingRulesOpen = !this.castingRulesOpen;
        boxCasting.style.display = this.castingRulesOpen ? 'block' : 'none';
      };
    }

    const btnEschew = container.querySelector('.btn-toggle-rules-eschew');
    const boxEschew = container.querySelector('.eschew-rules-box');
    if (btnEschew && boxEschew) {
      btnEschew.onclick = (e) => {
        e.stopPropagation();
        this.eschewRulesOpen = !this.eschewRulesOpen;
        boxEschew.style.display = this.eschewRulesOpen ? 'block' : 'none';
      };
    }

    const btnFamiliar = container.querySelector('.btn-toggle-rules-familiar');
    const boxFamiliar = container.querySelector('.familiar-rules-box');
    if (btnFamiliar && boxFamiliar) {
      btnFamiliar.onclick = (e) => {
        e.stopPropagation();
        this.familiarRulesOpen = !this.familiarRulesOpen;
        boxFamiliar.style.display = this.familiarRulesOpen ? 'block' : 'none';
      };
    }
  }
}

