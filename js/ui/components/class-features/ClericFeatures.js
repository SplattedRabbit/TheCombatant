import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { CombatState } from '../../../state.js';
import { showRollBreakdown } from '../dialogs.js';

export class ClericFeatures extends ClassFeatureComponent {
  constructor() {
    super('cleric', 'Kleriker', 'Cleric');
    this.turnRulesOpen = false;
  }

  render(pc, level) {
    let turnAbility = pc.dailyAbilities.find(a => a.name === "Untote vertreiben");
    const turnMax = turnAbility ? turnAbility.max : 0;
    const turnUsed = turnAbility ? turnAbility.used : 0;
    const remaining = Math.max(0, turnMax - turnUsed);
    
    let turnBubbles = '';
    if (turnMax > 0) {
      for (let i = 1; i <= turnMax; i++) {
        const spent = i <= turnUsed;
        turnBubbles += `
          <span class="cleric-turn-bubble use-icon use-icon-turn ${spent ? 'used' : ''}" data-idx="${i}" title="${spent ? 'Benutzt' : 'Verfügbar'}">☀️</span>
        `;
      }
    }

    return `
      <div class="class-card expanded" style="border: 0.5px solid var(--pb); border-radius: 3px; margin-bottom: 5px; background: rgba(200, 169, 110, 0.03); width: 100%;">
        <div class="class-card-hdr" data-key="cleric" style="background: rgba(200, 169, 110, 0.1); padding: 4px 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">
          <span>🎭 Kleriker (Stufe ${level})</span>
          <span>▼</span>
        </div>
        <div class="class-card-body" style="display: flex; padding: 6px; align-items: start; width: 100%;">
          <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
            <div style="font-family:'IM Fell English SC', serif; font-size:8px; color:var(--red); padding-bottom:2px; border-bottom:0.5px solid rgba(200,169,110,0.2); font-weight: bold;">
              Klassenfähigkeiten
            </div>
            <div style="display: flex; flex-direction: column; border-bottom: 0.5px dashed rgba(200,169,110,0.2); padding-bottom: 4px; margin-bottom: 2px;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span><strong>Vertreiben:</strong></span>
                  <button class="btn btn-toggle-rules-turn" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
                </div>
                <div style="display: flex; align-items: center; gap: 2px;">
                  <div style="display: flex;">${turnBubbles}</div>
                  <span>(${remaining})</span>
                </div>
              </div>
              
              <!-- Turn Undead Infobox -->
              <div class="turn-rules-box" style="display: ${this.turnRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
                <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Untote vertreiben (Turn Undead):</strong><br>
                Als Standardaktion kann ein Kleriker versuchen, untote Kreaturen in einem Radius von 18m (60 ft) zu vertreiben.<br>
                • <strong>1. Vertreibungswurf (1W20 + CHA):</strong> Bestimmt die maximalen Trefferwürfel (HD) des stärksten betroffenen Untoten (Kleriker-Stufe -4 bis +4).<br>
                • <strong>2. Vertreibungsschaden (2W6 + Stufe + CHA):</strong> Bestimmt die Gesamtzahl an Trefferwürfeln (HD) aller Untoten, die beeinflusst werden.<br>
                • <strong>Effekt:</strong> Betroffene Untote fliehen 10 Runden (1 Minute) lang. Wenn deine Klerikerstufe mindestens doppelt so hoch ist wie die HD des Untoten, wird dieser stattdessen vernichtet.
              </div>
            </div>
            <button class="btn roll-turn-btn" style="font-family: 'IM Fell English SC', serif; font-size: 8px; padding: 4px; width: 100%; cursor: pointer; margin-top: 4px;">Vertreiben würfeln 🎲</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(pc, level, container, triggerRender) {
    container.querySelectorAll('.cleric-turn-bubble').forEach(bubble => {
      bubble.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(bubble.dataset.idx);
        const activePC = CombatState.getActivePC();
        const turnAbility = activePC.dailyAbilities.find(a => a.name === "Untote vertreiben");
        if (turnAbility) {
          if (idx <= turnAbility.used) {
            turnAbility.used = idx - 1;
          } else {
            turnAbility.used = idx;
          }
          CombatState.saveToStorage();
          CombatState.syncPCToHost();
          triggerRender();
        }
      };
    });

    // Rules Toggle
    const btnTurn = container.querySelector('.btn-toggle-rules-turn');
    const boxTurn = container.querySelector('.turn-rules-box');
    if (btnTurn && boxTurn) {
      btnTurn.onclick = (e) => {
        e.stopPropagation();
        this.turnRulesOpen = !this.turnRulesOpen;
        boxTurn.style.display = this.turnRulesOpen ? 'block' : 'none';
      };
    }

    const turnBtn = container.querySelector('.roll-turn-btn');
    if (turnBtn) {
      turnBtn.onclick = (e) => {
        e.stopPropagation();
        const getAblMod = (score) => {
          const s = parseInt(score) || 10;
          return s >= 10 ? Math.floor((s - 10) / 2) : (s === 9 || s === 8 ? -1 : (s === 7 || s === 6 ? -2 : (s === 5 || s === 4 ? -4 : -5)));
        };
        const chaMod = getAblMod(pc.cha ? pc.cha.getValue() : 10);
        showRollBreakdown("Vertreibungswurf (Charisma-Wurf)", "1W20", [
          { label: "Charisma-Mod", value: chaMod }
        ], e);
      };
    }
  }

  onNewDay(pc, level) {
    let turnAbility = pc.dailyAbilities.find(a => a.name === "Untote vertreiben");
    if (turnAbility) {
      turnAbility.used = 0;
    }
  }
}
