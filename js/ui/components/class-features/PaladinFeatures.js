import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { CombatState } from '../../../state.js';
import { showRollBreakdown } from '../dialogs.js';

export class PaladinFeatures extends ClassFeatureComponent {
  constructor() {
    super('paladin', 'Paladin', 'Paladin');
    this.smiteRulesOpen = false;
    this.lohRulesOpen = false;
    this.dgRulesOpen = false;
    this.turnRulesOpen = false;
  }

  render(pc, level) {
    const getAblMod = (score) => {
      const s = parseInt(score) || 10;
      return s >= 10 ? Math.floor((s - 10) / 2) : (s === 9 || s === 8 ? -1 : (s === 7 || s === 6 ? -2 : (s === 5 || s === 4 ? -4 : -5)));
    };

    const chaMod = getAblMod(pc.cha ? pc.cha.getValue() : 10);
    
    let smiteAbility = pc.dailyAbilities.find(a => a.name === "Böses niederstrecken");
    let lohAbility = pc.dailyAbilities.find(a => a.name === "Hände auflegen");
    
    const smiteMax = smiteAbility ? smiteAbility.max : 0;
    const smiteUsed = smiteAbility ? smiteAbility.used : 0;
    const smiteRemaining = Math.max(0, smiteMax - smiteUsed);

    const lohMax = lohAbility ? lohAbility.max : 0;
    const lohUsed = lohAbility ? lohAbility.used : 0;

    let turnAbility = pc.dailyAbilities.find(a => a.name === "Untote vertreiben");
    const turnMax = turnAbility ? turnAbility.max : 0;
    const turnUsed = turnAbility ? turnAbility.used : 0;
    const turnRemaining = Math.max(0, turnMax - turnUsed);

    let turnBubbles = '';
    if (turnMax > 0) {
      for (let i = 1; i <= turnMax; i++) {
        const spent = i <= turnUsed;
        turnBubbles += `
          <span class="paladin-turn-bubble use-icon use-icon-turn ${spent ? 'used' : ''}" data-idx="${i}" title="${spent ? 'Benutzt' : 'Verfügbar'}">☀️</span>
        `;
      }
    }

    let smiteBubbles = '';
    if (smiteMax > 0) {
      for (let i = 1; i <= smiteMax; i++) {
        const spent = i <= smiteUsed;
        smiteBubbles += `
          <span class="smite-bubble use-icon use-icon-smite ${spent ? 'used' : ''}" data-idx="${i}">🌟</span>
        `;
      }
    }

    return `
      <div class="class-card expanded" style="border: 0.5px solid var(--pb); border-radius: 3px; margin-bottom: 5px; background: rgba(200, 169, 110, 0.03); width: 100%;">
        <div class="class-card-hdr" data-key="paladin" style="background: rgba(200, 169, 110, 0.1); padding: 4px 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">
          <span>🎭 Paladin (Stufe ${level})</span>
          <span>▼</span>
        </div>
        <div class="class-card-body" style="display: flex; padding: 6px; align-items: start; width: 100%;">
          <div style="display: flex; flex-direction: column; gap: 5px; width: 100%;">
            <div style="font-family:'IM Fell English SC', serif; font-size:8px; color:var(--red); padding-bottom:2px; border-bottom:0.5px solid rgba(200,169,110,0.2); font-weight: bold;">
              Klassenfähigkeiten
            </div>
            
            <!-- Göttliche Gnade -->
            ${level >= 2 ? `
              <div style="display: flex; flex-direction: column; border-bottom: 0.5px dashed rgba(200,169,110,0.2); padding-bottom: 4px; margin-bottom: 2px;">
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 8px;">
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-weight: bold; color: var(--ink);"><strong>Göttliche Gnade:</strong></span>
                    <button class="btn btn-toggle-rules-dg" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="color: var(--red); font-weight: bold; font-size: 7.5px;">+${Math.max(0, chaMod)} Rettungswürfe</span>
                    <button class="btn paladin-dg-btn" style="font-size: 6px; padding: 1px 4px; height: 12px; line-height: 8px; cursor: pointer; background: ${pc.divineGraceActive ? 'rgba(42, 106, 42, 0.12)' : 'rgba(0,0,0,0.03)'}; border: 0.5px solid ${pc.divineGraceActive ? '#2a6a2a' : 'var(--pb)'}; color: ${pc.divineGraceActive ? '#1a4a1a' : 'var(--inkl)'}; font-weight: bold; border-radius: 1.5px;">
                      ${pc.divineGraceActive ? 'Aktiv' : 'Aus'}
                    </button>
                  </div>
                </div>
                
                <!-- Divine Grace Infobox -->
                <div class="dg-rules-box" style="display: ${this.dgRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
                  <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Göttliche Gnade (Divine Grace):</strong><br>
                  Ab der 2. Stufe erhält ein Paladin einen Bonus auf alle Rettungswürfe.<br>
                  • <strong>Effekt:</strong> Addiert seinen Charisma-Bonus (sofern positiv) auf alle Rettungswürfe (Zähigkeit, Reflex und Willenskraft).
                </div>
              </div>
            ` : ''}

            <!-- Böses niederstrecken -->
            <div style="display: flex; flex-direction: column; border-bottom: 0.5px dashed rgba(200,169,110,0.2); padding-bottom: 4px; margin-bottom: 2px;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span><strong>Niederstrecken:</strong></span>
                  <button class="btn btn-toggle-rules-smite" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
                </div>
                <div style="display: flex; align-items: center; gap: 2px;">
                  <div style="display: flex;">${smiteBubbles}</div>
                  <span>(${smiteRemaining})</span>
                </div>
              </div>
              
              <!-- Smite Evil Infobox -->
              <div class="smite-rules-box" style="display: ${this.smiteRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
                <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Böses niederstrecken (Smite Evil):</strong><br>
                Einmal pro Tag (ab Stufe 1, +1-mal alle 5 Stufen danach) kann ein Paladin versuchen, das Böse mit einem normalen Nahkampfangriff niederzustrecken.<br>
                • <strong>Effekt:</strong> Charisma-Bonus (sofern positiv) auf den Angriffswurf, +1 Schaden pro Paladin-Stufe.<br>
                • <strong>Fehlschlag:</strong> Richtet sich der Angriff gegen ein nicht-böses Ziel, verpufft der Effekt, die Anwendung ist dennoch verbraucht.
              </div>
            </div>

            <!-- Hände auflegen -->
            <div style="display: flex; flex-direction: column; padding-bottom: 2px;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span><strong>Hände auflegen:</strong></span>
                  <button class="btn btn-toggle-rules-loh" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
                </div>
                
                ${level >= 2 && lohMax > 0 ? `
                  <div style="display: flex; align-items: center; gap: 2px;">
                    <button class="btn loh-minus-btn" style="width: 12px; height: 12px; font-size: 8px; line-height: 8px; display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--red); font-weight: bold; border-radius: 1px;" title="Punkte abziehen">-</button>
                    <input type="number" value="${lohMax - lohUsed}" class="cinput paladin-loh-val" style="width: 24px; font-size: 8px; text-align: center; height: 12px; font-weight: bold; color: var(--red); border-radius: 1px; border: 0.5px solid var(--pb); padding: 0;" title="Verbleibende Punkte">
                    <button class="btn loh-plus-btn" style="width: 12px; height: 12px; font-size: 8px; line-height: 8px; display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--red); font-weight: bold; border-radius: 1px;" title="Punkte hinzufügen">+</button>
                    <span>/ ${lohMax}</span>
                  </div>
                ` : (level < 2 ? `
                  <span style="font-size: 7.5px; color: var(--inkl); font-style: italic;">Ab Stufe 2 freigeschaltet</span>
                ` : `
                  <span style="font-size: 7.5px; color: var(--inkl); font-style: italic;" title="Benötigt Charisma 12+">Inaktiv (CHA &lt; 12)</span>
                `)}
              </div>
              
              <!-- Lay on Hands Infobox -->
              <div class="loh-rules-box" style="display: ${this.lohRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
                <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Hände auflegen (Lay on Hands):</strong><br>
                Ab Stufe 2 kann ein Paladin mit Charisma 12+ Wunden durch Berührung heilen.<br>
                • <strong>Täglicher Pool:</strong> Paladin-Stufe × Charisma-Bonus.<br>
                • <strong>Aktion:</strong> Standardaktion. Kann frei aufgeteilt und auf sich selbst oder andere angewendet werden.<br>
                • <strong>Gegen Untote:</strong> Kann als Nahkampf-Berührungsangriff genutzt werden, um untoten Kreaturen Schaden zuzufügen (kein Gelegenheitsangriff).
              </div>
            </div>

            <!-- Untote vertreiben (ab Stufe 4) -->
            ${level >= 4 ? `
              <div style="display: flex; flex-direction: column; border-top: 0.5px dashed rgba(200,169,110,0.2); padding-top: 4px; margin-top: 2px;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px;">
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span><strong>Vertreiben:</strong></span>
                    <button class="btn btn-toggle-rules-turn" style="font-size: 8px; padding: 2px 5px; border-radius: 2px; cursor: pointer; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); color: var(--inkm); font-family: 'IM Fell English SC', serif; font-weight: bold; height: 15px; line-height: 11px; display: inline-flex; align-items: center; justify-content: center;" title="Regeln einblenden">📖 ▼</button>
                  </div>
                  <div style="display: flex; align-items: center; gap: 2px;">
                    <div style="display: flex;">${turnBubbles}</div>
                    <span>(${turnRemaining})</span>
                  </div>
                </div>
                
                <!-- Turn Undead Infobox -->
                <div class="turn-rules-box" style="display: ${this.turnRulesOpen ? 'block' : 'none'}; background: rgba(0, 0, 0, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px; font-size: 7.5px; color: var(--inkm); line-height: 1.25; margin-top: 3px; font-family: 'Crimson Text', serif;">
                  <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Untote vertreiben (Turn Undead):</strong><br>
                  Als Standardaktion kann ein Paladin versuchen, untote Kreaturen in einem Radius von 18m (60 ft) zu vertreiben.<br>
                  • <strong>Effektive Vertreiberstufe:</strong> Paladin-Stufe -3 (aktuell Stufe ${level - 3})<br>
                  • <strong>1. Vertreibungswurf (1W20 + CHA):</strong> Bestimmt die maximalen Trefferwürfel (HD) des stärksten betroffenen Untoten (Effektive Stufe -4 bis +4).<br>
                  • <strong>2. Vertreibungsschaden (2W6 + Effektive Stufe + CHA):</strong> Bestimmt die Gesamtzahl an Trefferwürfeln (HD) aller Untoten, die beeinflusst werden.<br>
                  • <strong>Effekt:</strong> Betroffene Untote fliehen 10 Runden (1 Minute) lang. Wenn deine effektive Vertreiberstufe mindestens doppelt so hoch ist wie die HD des Untoten, wird dieser stattdessen vernichtet.
                </div>
                <button class="btn roll-turn-btn" style="font-family: 'IM Fell English SC', serif; font-size: 8px; padding: 4px; width: 100%; cursor: pointer; margin-top: 4px;">Vertreiben würfeln 🎲</button>
              </div>
            ` : ''}

          </div>
        </div>
      </div>
    `;
  }

  bindEvents(pc, level, container, triggerRender) {
    container.querySelectorAll('.smite-bubble').forEach(bubble => {
      bubble.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(bubble.dataset.idx);
        const activePC = CombatState.getActivePC();
        const smiteAbility = activePC.dailyAbilities.find(a => a.name === "Böses niederstrecken");
        if (smiteAbility) {
          if (idx <= smiteAbility.used) {
            smiteAbility.used = idx - 1;
          } else {
            smiteAbility.used = idx;
          }
          CombatState.saveToStorage();
          CombatState.syncPCToHost();
          triggerRender();
        }
      };
    });

    // Divine Grace Active Toggle Button
    const dgBtn = container.querySelector('.paladin-dg-btn');
    if (dgBtn) {
      dgBtn.onclick = (e) => {
        e.stopPropagation();
        const activePC = CombatState.getActivePC();
        activePC.divineGraceActive = !activePC.divineGraceActive;
        activePC.rebuildStatModifiers();
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    }

    // Rules Toggles
    const btnDg = container.querySelector('.btn-toggle-rules-dg');
    const boxDg = container.querySelector('.dg-rules-box');
    if (btnDg && boxDg) {
      btnDg.onclick = (e) => {
        e.stopPropagation();
        this.dgRulesOpen = !this.dgRulesOpen;
        boxDg.style.display = this.dgRulesOpen ? 'block' : 'none';
      };
    }

    const btnSmite = container.querySelector('.btn-toggle-rules-smite');
    const boxSmite = container.querySelector('.smite-rules-box');
    if (btnSmite && boxSmite) {
      btnSmite.onclick = (e) => {
        e.stopPropagation();
        this.smiteRulesOpen = !this.smiteRulesOpen;
        boxSmite.style.display = this.smiteRulesOpen ? 'block' : 'none';
      };
    }

    const btnLoh = container.querySelector('.btn-toggle-rules-loh');
    const boxLoh = container.querySelector('.loh-rules-box');
    if (btnLoh && boxLoh) {
      btnLoh.onclick = (e) => {
        e.stopPropagation();
        this.lohRulesOpen = !this.lohRulesOpen;
        boxLoh.style.display = this.lohRulesOpen ? 'block' : 'none';
      };
    }

    const lohInp = container.querySelector('.paladin-loh-val');
    if (lohInp) {
      lohInp.onchange = (e) => {
        const activePC = CombatState.getActivePC();
        const lohAbility = activePC.dailyAbilities.find(a => a.name === "Hände auflegen");
        if (lohAbility) {
          const val = parseInt(e.target.value) || 0;
          lohAbility.used = Math.max(0, Math.min(lohAbility.max, lohAbility.max - val));
          CombatState.saveToStorage();
          CombatState.syncPCToHost();
          triggerRender();
        }
      };
    }

    const minusBtn = container.querySelector('.loh-minus-btn');
    if (minusBtn) {
      minusBtn.onclick = (e) => {
        e.stopPropagation();
        const activePC = CombatState.getActivePC();
        const lohAbility = activePC.dailyAbilities.find(a => a.name === "Hände auflegen");
        if (lohAbility && lohAbility.max > 0) {
          lohAbility.used = Math.min(lohAbility.max, lohAbility.used + 1);
          CombatState.saveToStorage();
          CombatState.syncPCToHost();
          triggerRender();
        }
      };
    }

    const plusBtn = container.querySelector('.loh-plus-btn');
    if (plusBtn) {
      plusBtn.onclick = (e) => {
        e.stopPropagation();
        const activePC = CombatState.getActivePC();
        const lohAbility = activePC.dailyAbilities.find(a => a.name === "Hände auflegen");
        if (lohAbility && lohAbility.max > 0) {
          lohAbility.used = Math.max(0, lohAbility.used - 1);
          CombatState.saveToStorage();
          CombatState.syncPCToHost();
          triggerRender();
        }
      };
    }

    // Turn Undead (Stufe >= 4)
    container.querySelectorAll('.paladin-turn-bubble').forEach(bubble => {
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
    let smiteAbility = pc.dailyAbilities.find(a => a.name === "Böses niederstrecken");
    if (smiteAbility) {
      smiteAbility.used = 0;
    }
    let lohAbility = pc.dailyAbilities.find(a => a.name === "Hände auflegen");
    if (lohAbility) {
      lohAbility.used = 0;
    }
    let turnAbility = pc.dailyAbilities.find(a => a.name === "Untote vertreiben");
    if (turnAbility) {
      turnAbility.used = 0;
    }
  }
}
