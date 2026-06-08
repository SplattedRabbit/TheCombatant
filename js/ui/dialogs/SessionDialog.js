import { CombatState } from '../../state.js';
import { uiRegistry } from '../ui-shared.js';
import { showCustomAlert } from './BaseDialogs.js';

/**
 * Spawns a gorgeous, premium D&D-themed dialog for P2P multiplayer session management.
 */
export function showSessionModal(event) {
  const existing = document.getElementById('sessionOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'sessionOverlay';
  overlay.style = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.55);
    backdrop-filter: blur(2px);
    z-index: 2400;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 24px;
      width: 290px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <div style="font-size: 13px; color: var(--red); font-weight: bold; margin-bottom: 2px;">
        🌐 Sitzungs-Manager (P2P)
      </div>
      <div class="dialog-subtitle" style="font-size: 8px; color: var(--inkl); font-style: italic; margin-bottom: 6px;">
        Verbinde dein Spielblatt mit der Spielrunde
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 4px 0 10px;">
      
      <div class="session-content-area" style="display:flex; flex-direction:column; gap:10px; min-height: 110px; transition: opacity 0.15s ease-out;">
        <!-- Filled dynamically -->
      </div>
      
      <button class="btn btn-close-session" style="
        font-family: 'IM Fell English SC', serif;
        font-size: 8px;
        padding: 2px 10px;
        margin-top: 12px;
        cursor: pointer;
        background: transparent;
        border: 0.5px solid var(--pb);
        border-radius: 1px;
        color: var(--inkl);
        outline: none;
      ">Schließen</button>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect();
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.querySelector('.btn-close-session').onclick = dismiss;

  function renderSessionView() {
    const area = overlay.querySelector('.session-content-area');
    const sess = CombatState.getState().session || { active: false, role: 'choice', roomCode: '' };
    
    area.style.opacity = '0';
    setTimeout(() => {
      if (!sess.active) {
        area.innerHTML = `
          <!-- Option A: Host (DM) -->
          <div style="background: rgba(200, 169, 110, 0.05); border: 1px solid var(--pb); border-radius: 3px; padding: 8px 10px; text-align: left;">
            <div style="font-size: 10px; font-weight: bold; color: var(--red);">🏰 Spielleiter-Modus (Host)</div>
            <div style="font-family:'Crimson Text', serif; font-size: 8.5px; color: var(--inkm); line-height: 1.2; margin-top: 2px; margin-bottom: 6px;">
              Eröffne ein online Kampfblatt. Spieler können direkt über deinen Sitzungscode beitreten.
            </div>
            <button class="btn btn-p btn-start-host" style="font-family:'IM Fell English SC', serif; font-size:8px; padding:2px 8px; width:100%;">Sitzung hosten 🌐</button>
          </div>

          <!-- Option B: Client (Player) -->
          <div style="background: rgba(200, 169, 110, 0.05); border: 1px solid var(--pb); border-radius: 3px; padding: 8px 10px; text-align: left;">
            <div style="font-size: 10px; font-weight: bold; color: var(--ink);">🛡️ Spieler-Modus (Client)</div>
            <div style="font-family:'Crimson Text', serif; font-size: 8.5px; color: var(--inkm); line-height: 1.2; margin-top: 2px; margin-bottom: 6px;">
              Tritt der aktiven Sitzung deines DMs bei. Gib den 4-stelligen Zugangscode ein.
            </div>
            <div style="display:flex; gap:4px;">
              <input type="text" placeholder="CODE" class="cinput room-code-input" style="width: 55px; font-size: 9px; font-weight: bold; text-align: center; height: 16px; padding:0; text-transform: uppercase;">
              <button class="btn btn-join-client" style="font-family:'IM Fell English SC', serif; font-size:8px; padding:2px 8px; flex:1;">Beitreten 🔌</button>
            </div>
          </div>
        `;

        area.querySelector('.btn-start-host').onclick = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          let code = '';
          for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          CombatState.updateSession(true, 'host', code);
          renderSessionView();
          uiRegistry.renderAll();
        };

        area.querySelector('.btn-join-client').onclick = () => {
          const input = area.querySelector('.room-code-input');
          const codeVal = (input.value || '').trim().toUpperCase();
          if (codeVal.length !== 4) {
            showCustomAlert("Fehler", "Bitte gib einen gültigen 4-stelligen Code ein.");
            return;
          }
          CombatState.updateSession(true, 'client', codeVal);
          renderSessionView();
          uiRegistry.renderAll();
        };

      } else if (sess.role === 'host') {
        area.innerHTML = `
          <div style="background: rgba(42, 106, 42, 0.05); border: 1px solid #2a6a2a; border-radius: 3px; padding: 12px 10px; text-align: center;">
            <div style="font-size: 11px; font-weight: bold; color: #1a4a1a;">🟢 Sitzung aktiv (Spielleiter)</div>
            <div style="font-family:'Crimson Text', serif; font-size: 8.5px; color: var(--inkm); line-height: 1.2; margin-top: 3px; margin-bottom: 10px;">
              Dein online Kampfblatt ist live. Spieler können sich mit diesem Code verbinden:
            </div>
            
            <div style="font-size: 26px; font-weight: bold; color: var(--red); letter-spacing: 2px; font-family:'IM Fell English SC', serif; background: rgba(0,0,0,0.04); border: 0.5px solid var(--pb); border-radius: 2px; padding: 4px 0; margin-bottom: 10px; box-shadow: inset 0 0 5px rgba(0,0,0,0.05);">
              ${sess.roomCode}
            </div>

            <div style="font-size: 7.5px; color: var(--inkl); font-style: italic; margin-bottom: 10px;">
              Warte auf einlaufende Spieler-Verbindungen...
            </div>
            
            <button class="btn btn-stop-session" style="font-family:'IM Fell English SC', serif; font-size:8px; padding:2px 8px; width:100%; border-color:var(--red); color:var(--red);">Sitzung beenden ✕</button>
          </div>
        `;

        area.querySelector('.btn-stop-session').onclick = () => {
          CombatState.updateSession(false, 'choice', '');
          renderSessionView();
          uiRegistry.renderAll();
        };

      } else {
        area.innerHTML = `
          <div style="background: rgba(42, 106, 42, 0.05); border: 1px solid #2a6a2a; border-radius: 3px; padding: 12px 10px; text-align: center;">
            <div style="font-size: 11px; font-weight: bold; color: #1a4a1a;">🟢 Verbunden mit Spielrunde</div>
            <div style="font-family:'Crimson Text', serif; font-size: 8.5px; color: var(--inkm); line-height: 1.2; margin-top: 3px; margin-bottom: 10px;">
              Erfolgreich eingeloggt in Sitzungs-Code:
            </div>
            
            <div style="font-size: 22px; font-weight: bold; color: var(--red); letter-spacing: 2px; font-family:'IM Fell English SC', serif; background: rgba(0,0,0,0.04); border: 0.5px solid var(--pb); border-radius: 2px; padding: 3px 0; margin-bottom: 10px;">
              ${sess.roomCode}
            </div>

            <div style="font-size: 7.5px; color: var(--inkl); font-style: italic; margin-bottom: 10px;">
              Gekoppelt als Spieler-Charakter. Synchronisation bereit.
            </div>
            
            <button class="btn btn-stop-session" style="font-family:'IM Fell English SC', serif; font-size:8px; padding:2px 8px; width:100%; border-color:var(--red); color:var(--red);">Verbindung trennen ✕</button>
          </div>
        `;

        area.querySelector('.btn-stop-session').onclick = () => {
          CombatState.updateSession(false, 'choice', '');
          renderSessionView();
          uiRegistry.renderAll();
        };
      }
      area.style.opacity = '1';
    }, 150);
  }

  renderSessionView();
}
