import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { CombatState } from '../../../state.js';

export class DruidFeatures extends ClassFeatureComponent {
  constructor() {
    super('druid', 'Druide', 'Druid');
  }

  render(pc, level) {
    let wildAbility = pc.dailyAbilities.find(a => a.name === "Tiergestalt" || a.name === "Wild Shape");
    const maxUses = wildAbility ? (parseInt(wildAbility.max) || 0) : 0;
    const usedUses = wildAbility ? (parseInt(wildAbility.used) || 0) : 0;
    const remaining = Math.max(0, maxUses - usedUses);

    let wildBubbles = '';
    if (maxUses > 0) {
      for (let i = 1; i <= maxUses; i++) {
        const spent = i <= usedUses;
        wildBubbles += `
          <span class="druid-wild-bubble use-icon use-icon-wild ${spent ? 'used' : ''}" data-idx="${i}" title="${spent ? 'Benutzt' : 'Verfügbar'}">🐾</span>
        `;
      }
    }

    let sizeText = 'Keine Tiergestalt (erst ab Stufe 5)';
    if (level >= 15) sizeText = 'Winzig, Klein, Mittel, Groß, Riesig';
    else if (level >= 11) sizeText = 'Winzig, Klein, Mittel, Groß';
    else if (level >= 8) sizeText = 'Klein, Mittel, Groß';
    else if (level >= 5) sizeText = 'Klein, Mittel';

    let actionSection = '';
    if (maxUses > 0) {
      if (pc.activeShape !== "none") {
        let shapeLabel = 'Unbekannt';
        if (pc.activeShape === 'wolf') shapeLabel = 'Wolf';
        if (pc.activeShape === 'leopard') shapeLabel = 'Leopard';
        if (pc.activeShape === 'bear') shapeLabel = 'Braunbär';

        actionSection = `
          <div style="background: rgba(139, 26, 26, 0.08); border: 0.5px solid var(--red); border-radius: 2px; padding: 4px 6px; font-size: 8px; color: var(--red); text-align: center; font-weight: bold; margin-bottom: 4px; display: flex; flex-direction: column; gap: 3px;">
            <span>🐾 Aktiv in Gestalt des ${shapeLabel}s!</span>
            <button class="btn revert-shape-btn" style="
              font-family: 'IM Fell English SC', serif;
              font-size: 9px;
              padding: 4px 10px;
              width: 100%;
              cursor: pointer;
              border-radius: 2px;
              background: rgba(139, 26, 26, 0.2);
              border: 1px solid var(--red);
              color: var(--red);
              font-weight: bold;
            ">🔴 Gestalt des ${shapeLabel}s beenden</button>
          </div>
        `;
      } else {
        actionSection = `
          <button class="btn show-transform-dialog-btn" style="
            font-family: 'IM Fell English SC', serif;
            font-size: 9px;
            padding: 4px 10px;
            width: 100%;
            cursor: pointer;
            border-radius: 2px;
            background: rgba(46, 125, 50, 0.1);
            border: 1px solid rgba(46, 125, 50, 0.4);
            color: #2e7d32;
            font-weight: bold;
            text-shadow: 0 0 4px rgba(46, 125, 50, 0.2);
            transition: background-color 0.15s;
          " ${remaining <= 0 ? 'disabled' : ''}>🐾 In Tiergestalt verwandeln</button>
        `;
      }
    }

    return `
      <div class="class-card expanded" style="border: 0.5px solid var(--pb); border-radius: 3px; margin-bottom: 5px; background: rgba(200, 169, 110, 0.03); width: 100%;">
        <div class="class-card-hdr" data-key="druid" style="background: rgba(200, 169, 110, 0.1); padding: 4px 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">
          <span>🎭 Druide (Stufe ${level})</span>
          <span>▼</span>
        </div>
        <div class="class-card-body" style="display: flex; padding: 6px; align-items: start; width: 100%;">
          <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
            <div style="font-family:'IM Fell English SC', serif; font-size:8px; color:var(--red); padding-bottom:2px; border-bottom:0.5px solid rgba(200,169,110,0.2);">
              Klassenfähigkeiten
            </div>
            ${maxUses > 0 ? `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px; padding-top: 1px; margin-bottom: 2px;">
                <span><strong>Tiergestalt:</strong></span>
                <div style="display: flex; align-items: center; gap: 2px;">
                  <div style="display: flex;">${wildBubbles}</div>
                  <span>(${remaining})</span>
                </div>
              </div>
              
              ${actionSection}

              <div style="background: rgba(200, 169, 110, 0.1); border: 0.5px solid var(--pb); border-radius: 2px; padding: 3px; font-size: 7.5px; color: var(--red); line-height: 1.3; margin-top: 3px; margin-bottom: 3px;">
                • <strong>Größen:</strong> ${sizeText}<br>
                ${level >= 12 ? '• <strong>Pflanzengestalt aktiv!</strong><br>' : ''}
                ${level >= 15 ? '• <strong>Elementargestalt (Riesig)!</strong>' : ''}
              </div>
              
              <div style="font-size: 6.8px; border: 0.5px solid rgba(200, 169, 110, 0.2); padding: 4px; border-radius: 2px; line-height: 1.3; background: rgba(255,255,255,0.3); display: flex; flex-direction: column; gap: 3px;">
                <strong style="color: var(--red); font-family: 'IM Fell English SC', serif;">Tier-Formen (Referenz):</strong>
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 0.5px dashed rgba(200, 169, 110, 0.15); padding-bottom: 2px;">
                  <span>🐾 <strong>Wolf:</strong> Stä 13, Ges 15, Kon 15 | Biss 1w6+1</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 0.5px dashed rgba(200, 169, 110, 0.15); padding-bottom: 2px;">
                  <span>🐾 <strong>Leopard:</strong> Stä 16, Ges 19, Kon 15 | Biss 1w6+3</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>🐾 <strong>Braunbär:</strong> Stä 27, Ges 13, Kon 19 | Klaue 1w8+8</span>
                </div>
              </div>
            ` : `
              <div style="font-size: 7.5px; color: var(--inkl); font-style: italic; text-align: center; padding-top: 4px;">
                Tiergestalt wird ab Stufe 5 freigeschaltet.
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(pc, level, container, triggerRender) {
    // 1. Paw/Bubble Click (for manual adjusting)
    container.querySelectorAll('.druid-wild-bubble').forEach(bubble => {
      bubble.onclick = (e) => {
        e.stopPropagation();
        try {
          const idx = parseInt(bubble.dataset.idx) || 1;
          CombatState.updatePCBatch(activePC => {
            const wildAbility = activePC.dailyAbilities.find(a => a.name === "Tiergestalt" || a.name === "Wild Shape");
            if (wildAbility) {
              const used = parseInt(wildAbility.used) || 0;
              if (idx <= used) {
                wildAbility.used = Math.max(0, idx - 1);
              } else {
                wildAbility.used = Math.min(wildAbility.max, idx);
              }
            }
          });
          triggerRender();
        } catch (err) {
          console.error("Error in wild shape bubble click:", err);
        }
      };
    });

    // 2. Revert Shape Click
    const revertBtn = container.querySelector('.revert-shape-btn');
    if (revertBtn) {
      revertBtn.onclick = (e) => {
        e.stopPropagation();
        try {
          CombatState.updatePCBatch(activePC => {
            activePC.exitShape();
          });
          triggerRender();
        } catch (err) {
          console.error("Error in exitShape click:", err);
          alert("Fehler beim Beenden der Tiergestalt: " + err.message);
        }
      };
    }

    // 3. Show Transform Dialog Click
    const showDlgBtn = container.querySelector('.show-transform-dialog-btn');
    if (showDlgBtn) {
      showDlgBtn.onclick = (e) => {
        e.stopPropagation();
        const activePC = CombatState.getActivePC();
        const wildAbility = activePC.dailyAbilities.find(a => a.name === "Tiergestalt" || a.name === "Wild Shape");
        const maxUses = wildAbility ? (parseInt(wildAbility.max) || 0) : 0;
        const usedUses = wildAbility ? (parseInt(wildAbility.used) || 0) : 0;
        const remaining = Math.max(0, maxUses - usedUses);

        this.showWildShapeSelectDialog(activePC, remaining, (shape) => {
          try {
            CombatState.updatePCBatch(pcToUpdate => {
              const innerWild = pcToUpdate.dailyAbilities.find(a => a.name === "Tiergestalt" || a.name === "Wild Shape");
              if (innerWild) {
                const used = parseInt(innerWild.used) || 0;
                const max = parseInt(innerWild.max) || 0;
                if (used < max) {
                  innerWild.used = used + 1;
                  pcToUpdate.enterShape(shape);
                } else {
                  throw new Error("Keine Tiergestalt-Nutzungen mehr übrig!");
                }
              } else {
                throw new Error("Tiergestalt-Ladungen wurden nicht gefunden!");
              }
            });
            triggerRender();
          } catch (err) {
            console.error("Error in shape selection transaction:", err);
            alert("Fehler beim Verwandeln: " + err.message);
          }
        });
      };
    }
  }

  showWildShapeSelectDialog(pc, remaining, onSelect) {
    const existing = document.getElementById('wildShapeDialogOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'wildShapeDialogOverlay';
    overlay.style = `
      position: fixed;
      inset: 0;
      background: rgba(18, 11, 5, 0.55);
      backdrop-filter: blur(2px);
      z-index: 2500;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.15s ease-out;
    `;

    overlay.innerHTML = `
      <div class="custom-alert-box" style="
        background: var(--p);
        border: 2px solid var(--pb);
        border-radius: 4px;
        padding: 14px 18px;
        width: 270px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 15px rgba(200,169,110,0.08);
        font-family: 'IM Fell English SC', serif;
        position: relative;
        transform: scale(0.92);
        transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.15);
      ">
        <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
        
        <div style="font-size: 13px; color: var(--red); font-weight: bold; text-align: center; margin-bottom: 2px; display: flex; align-items: center; justify-content: center; gap: 4px;">
          🐾 Tiergestalt wählen
        </div>
        <div style="font-family: 'Crimson Text', serif; font-size: 9px; color: var(--inkl); text-align: center; margin-bottom: 6px;">
          Kosten: 1 tägliche Anwendung (${remaining} verbleibend)
        </div>
        <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.3); margin: 3px 0 8px;">
        
        <div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px;">
          <!-- WOLF -->
          <div class="beast-card" data-shape="wolf" style="
            background: rgba(200, 169, 110, 0.05);
            border: 1px solid var(--pb);
            border-radius: 3px;
            padding: 5px 7px;
            cursor: pointer;
            transition: background-color 0.15s, border-color 0.15s;
          ">
            <div style="font-size: 9.5px; color: var(--red); font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
              <span>🐺 Wolf</span>
              <span style="font-size: 7.5px; background: rgba(46, 125, 50, 0.1); color: #2e7d32; border: 0.5px solid rgba(46, 125, 50, 0.3); border-radius: 2px; padding: 0 3px;">Stufe 5+</span>
            </div>
            <div style="font-family: 'Crimson Text', serif; font-size: 7.5px; color: var(--ink); line-height: 1.2; margin-top: 1px;">
              • Stä 13, Ges 15, Kon 15 | RK: 14<br>
              • Biss +3 (1w6+1 + Trip/Zu-Boden)
            </div>
          </div>

          <!-- LEOPARD -->
          <div class="beast-card" data-shape="leopard" style="
            background: rgba(200, 169, 110, 0.05);
            border: 1px solid var(--pb);
            border-radius: 3px;
            padding: 5px 7px;
            cursor: pointer;
            transition: background-color 0.15s, border-color 0.15s;
          ">
            <div style="font-size: 9.5px; color: var(--red); font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
              <span>🐆 Leopard</span>
              <span style="font-size: 7.5px; background: rgba(46, 125, 50, 0.1); color: #2e7d32; border: 0.5px solid rgba(46, 125, 50, 0.3); border-radius: 2px; padding: 0 3px;">Stufe 6+</span>
            </div>
            <div style="font-family: 'Crimson Text', serif; font-size: 7.5px; color: var(--ink); line-height: 1.2; margin-top: 1px;">
              • Stä 16, Ges 19, Kon 15 | RK: 15<br>
              • Biss +6 (1w6+3) & 2 Krallen +1 (1w3+1)
            </div>
          </div>

          <!-- BEAR -->
          <div class="beast-card" data-shape="bear" style="
            background: rgba(200, 169, 110, 0.05);
            border: 1px solid var(--pb);
            border-radius: 3px;
            padding: 5px 7px;
            cursor: pointer;
            transition: background-color 0.15s, border-color 0.15s;
          ">
            <div style="font-size: 9.5px; color: var(--red); font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
              <span>🐻 Braunbär</span>
              <span style="font-size: 7.5px; background: rgba(46, 125, 50, 0.1); color: #2e7d32; border: 0.5px solid rgba(46, 125, 50, 0.3); border-radius: 2px; padding: 0 3px;">Stufe 8+</span>
            </div>
            <div style="font-family: 'Crimson Text', serif; font-size: 7.5px; color: var(--ink); line-height: 1.2; margin-top: 1px;">
              • Stä 27, Ges 13, Kon 19 | RK: 15<br>
              • 2 Krallen +11 (1w8+8) & Biss +6 (2w6+4)
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: center;">
          <button class="btn pc-cancel-btn" style="
            font-family: 'IM Fell English SC', serif;
            font-size: 8px;
            padding: 3px 14px;
            cursor: pointer;
            background: transparent;
            border: 1px solid var(--pb);
            border-radius: 2px;
            color: var(--inkl);
            transition: background-color 0.15s;
            outline: none;
          ">Abbrechen</button>
        </div>
      </div>
    `;

    // hover style — guard against duplicate injection
    if (!document.getElementById('beastCardStyles')) {
      const style = document.createElement('style');
      style.id = 'beastCardStyles';
      style.innerHTML = `
        .beast-card:hover {
          background: rgba(46, 125, 50, 0.08) !important;
          border-color: #2e7d32 !important;
          box-shadow: 0 0 6px rgba(46, 125, 50, 0.15);
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(overlay);
    overlay.getBoundingClientRect();
    overlay.style.opacity = '1';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

    const dismiss = () => {
      overlay.style.opacity = '0';
      overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.92)';
      setTimeout(() => {
        overlay.remove();
        document.getElementById('beastCardStyles')?.remove();
      }, 150);
    };

    overlay.querySelector('.pc-cancel-btn').onclick = dismiss;

    overlay.querySelectorAll('.beast-card').forEach(card => {
      card.onclick = () => {
        const shape = card.dataset.shape;
        onSelect(shape);
        dismiss();
      };
    });
  }

  onNewDay(pc, level) {
    let wildAbility = pc.dailyAbilities.find(a => a.name === "Tiergestalt" || a.name === "Wild Shape");
    if (wildAbility) {
      wildAbility.used = 0;
    }
  }
}
