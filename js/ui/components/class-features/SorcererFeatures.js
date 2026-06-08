import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { showCustomAlert } from '../dialogs.js';

export class SorcererFeatures extends ClassFeatureComponent {
  constructor() {
    super('sorcerer', 'Hexenmeister', 'Sorcerer');
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
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px; padding-bottom: 3.5px; border-bottom: 0.5px dashed rgba(200,169,110,0.15);">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span>🔮 <strong>Spontanes Zaubern:</strong></span>
                <button class="sorcerer-rule-btn" data-rule="casting" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--red); font-family: 'IM Fell English SC', serif; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;">📖 ↗</button>
              </div>
              <span style="color: var(--inkm); font-size: 7.2px; font-style: italic;">Ohne Vorbereitung</span>
            </div>

            <!-- Materialien weglassen -->
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px; padding: 2px 0; border-bottom: 0.5px dashed rgba(200,169,110,0.15);">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span>📜 <strong>Materialien weglassen:</strong></span>
                <button class="sorcerer-rule-btn" data-rule="eschew" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--red); font-family: 'IM Fell English SC', serif; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;">📖 ↗</button>
              </div>
              <span style="color: var(--inkm); font-size: 7.2px; font-style: italic;">Eschew Materials Feat</span>
            </div>

            <!-- Vertrauenspartner -->
            <div style="display: flex; flex-direction: column; gap: 2px; font-size: 8px; padding-top: 2px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span>🦇 <strong>Vertrauenspartner (Familiar):</strong></span>
                  <button class="sorcerer-rule-btn" data-rule="familiar" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--red); font-family: 'IM Fell English SC', serif; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;">📖 ↗</button>
                </div>
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
    container.querySelectorAll('.sorcerer-rule-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const rule = btn.dataset.rule;
        let title = '';
        let message = '';
        let icon = '📖';

        if (rule === 'casting') {
          title = 'Spontanes Zaubern (Spontaneous Casting)';
          message = `
            <div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11.5px; line-height: 1.35;">
              <p>Hexenmeister bereiten ihre Zauber nicht im Voraus vor. Sie wählen ihre Zauber im Moment des Wirkens aus und verwenden freie tägliche Slots.</p>
              <ul style="margin: 4px 0; padding-left: 14px;">
                <li><strong>Attribut-Skalierung (Charisma):</strong>
                  <ul style="margin: 2px 0; padding-left: 12px; list-style-type: circle;">
                    <li>Bestimmt den maximalen Zaubergrad: <code>10 + Zaubergrad</code>.</li>
                    <li>Verleiht zusätzliche Bonus-Zauberslots pro Tag.</li>
                    <li>Rettungswurf-Schwierigkeitsgrad (SG): <code>10 + Zaubergrad + CHA-Modifikator</code>.</li>
                  </ul>
                </li>
                <li><strong>Spontane Metamagie (D&D 3.5e RAW):</strong>
                  <ul style="margin: 2px 0; padding-left: 12px; list-style-type: circle;">
                    <li>Das spontane Einweben metamagischer Effekte benötigt zusätzliche Konzentration.</li>
                    <li>Die Zauberzeit erhöht sich auf eine <strong>Volle Aktion (Full-Round Action)</strong> für Zauber, die normalerweise 1 Standardaktion erfordern (Zauber mit längerer Zauberzeit erfordern 1 zusätzliche Runde).</li>
                    <li><em>Schnelles Zaubern (Quicken Spell)</em> kann von spontanen Zauberern nicht genutzt werden, um Zauber als freie Aktion zu wirken.</li>
                  </ul>
                </li>
              </ul>
            </div>
          `;
        } else if (rule === 'eschew') {
          title = 'Materialien weglassen (Eschew Materials)';
          message = `
            <div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11.5px; line-height: 1.35;">
              <p>Der Hexenmeister erhält dieses allgemeine Talent auf Stufe 1 als Bonus-Talent.</p>
              <ul style="margin: 4px 0; padding-left: 14px;">
                <li><strong>Effekt:</strong> Du kannst jeden Zauber, der eine Materialkomponente im Wert von <strong>1 GM oder weniger</strong> erfordert, ohne diese Komponente wirken.</li>
                <li><strong>Teure Komponenten:</strong> Kostet die Materialkomponente mehr als 1 GM, musst du sie wie gewohnt bereitstellen.</li>
                <li><strong>Fokus-Komponenten:</strong> Fokusse (F) sind von diesem Talent unbeeinflusst und müssen immer vorhanden sein.</li>
              </ul>
            </div>
          `;
        } else if (rule === 'familiar') {
          title = 'Vertrauten rufen (Summon Familiar)';
          message = `
            <div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11.5px; line-height: 1.35;">
              <p>Ein Hexenmeister kann einen kleinen tierischen Vertrauenspartner beschwören, der ihm als treuer Begleiter dient und magisch mit ihm verbunden ist.</p>
              <ul style="margin: 4px 0; padding-left: 14px;">
                <li><strong>Beschwörungsritual:</strong> Dauert 24 Stunden und erfordert magische Zutaten im Wert von <strong>100 GM</strong>.</li>
                <li><strong>Harte Strafen bei Tod des Vertrauten (RAW 3.5e):</strong>
                  <ul style="margin: 2px 0; padding-left: 12px; list-style-type: circle;">
                    <li>Stirbt der Vertraute (oder wird entlassen), muss der Meister einen <strong>Zähigkeitsrettungswurf gegen SG 15</strong> ablegen.</li>
                    <li>Bei **Misslingen** verliert der Hexenmeister sofort dauerhaft **200 Erfahrungspunkte (EP) pro Hexenmeisterstufe**.</li>
                    <li>Bei **Erfolg** wird der EP-Verlust auf **100 EP pro Stufe** halbiert.</li>
                    <li>Der EP-Stand kann durch diesen Verlust niemals unter 0 fallen.</li>
                    <li>Ein neuer Vertrauenspartner kann erst nach **1 Jahr und 1 Tag** gerufen werden.</li>
                  </ul>
                </li>
                <li><strong>Reichweite des Bonus:</strong> Die permanenten Fertigkeiten- und Attributsboni gelten, solange sich der Vertraute innerhalb von 1 Meile zum Meister aufhält.</li>
              </ul>
            </div>
          `;
        }

        showCustomAlert(title, message, 'Schließen', icon);
      };
    });
  }
}
