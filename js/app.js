import { CombatState } from './state.js';
import { CombatUI } from './ui/ui-core.js';
import { CombatSpells } from './spells.js';
import './network/NetworkManager.js';


// Bind Modules to Window for easy console debugging or potential external hookups
window.CombatUI = CombatUI;
window.CombatState = CombatState;

window.toggleSystemDropdown = function(triggerBtn) {
  const menu = document.getElementById('systemDropdownMenu');
  if (!menu || !triggerBtn) return;
  
  const isOpen = menu.classList.contains('open');
  
  if (isOpen && menu.dataset.triggerId === triggerBtn.id) {
    menu.classList.remove('open');
    menu.style.display = 'none';
  } else {
    menu.style.display = 'flex';
    menu.classList.add('open');
    menu.dataset.triggerId = triggerBtn.id;
    
    const rect = triggerBtn.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    const menuWidth = 170; // Width in CSS
    const scale = parseFloat(document.documentElement.style.getPropertyValue('--app-scale')) || 1.0;
    const scaledWidth = menuWidth * scale;
    
    if (rect.left + scaledWidth > window.innerWidth) {
      menu.style.left = (rect.right + scrollX - scaledWidth) + 'px';
      menu.style.transformOrigin = 'top right';
    } else {
      menu.style.left = (rect.left + scrollX) + 'px';
      menu.style.transformOrigin = 'top left';
    }
    menu.style.top = (rect.bottom + scrollY) + 'px';
  }
};

// Wrap all CombatState methods to track last action for crash debugging
window.lastAction = null;
for (const key in CombatState) {
  if (typeof CombatState[key] === 'function') {
    const originalFn = CombatState[key];
    CombatState[key] = function(...args) {
      try {
        const serializedArgs = args.map(a => {
          if (a === null) return 'null';
          if (a === undefined) return 'undefined';
          if (typeof a === 'object') {
            if (a.id) return `{id: "${a.id}", name: "${a.name || ''}"}`;
            return '{...}';
          }
          return typeof a === 'string' ? `"${a}"` : String(a);
        }).join(', ');
        window.lastAction = `CombatState.${key}(${serializedArgs})`;
      } catch (e) {
        window.lastAction = `CombatState.${key}(...)`;
      }
      return originalFn.apply(this, args);
    };
  }
}

// Global error listener to log the last action that caused the error
window.addEventListener?.('error', (event) => {
  if (window.lastAction) {
    console.warn(`%c[Antigravity Action Tracker] Letzte Aktion vor dem Fehler: ${window.lastAction}`, 'color: #ff9900; font-weight: bold;');
  }
});

/**
 * Shows the add combatant inline form
 */
function showForm(side) {
  const form = document.getElementById(side === 'p' ? 'addPForm' : 'addEForm');
  if (form) form.style.display = 'flex';
}

/**
 * Hides the add combatant inline form
 */
function hideForm(side) {
  const form = document.getElementById(side === 'p' ? 'addPForm' : 'addEForm');
  if (form) form.style.display = 'none';
}

/**
 * Submits the add combatant inline form
 */
function confirmAdd(side) {
  if (side === 'p') {
    const name = document.getElementById('pN').value || 'Charakter';
    const init = parseInt(document.getElementById('pI').value) || 0;
    const hp = parseInt(document.getElementById('pH').value) || 10;
    const ac = parseInt(document.getElementById('pA').value) || 10;
    const classType = document.getElementById('pClass').value || 'custom';
    const level = parseInt(document.getElementById('pLevel').value) || 1;

    const classes = classType !== 'custom' ? [{ classType, level }] : [];

    CombatState.addCombatant({
      name,
      init,
      hp,
      maxHP: hp,
      ac,
      classType,
      level,
      classes,
      type: 'p'
    });

    ['pN', 'pI', 'pH', 'pA'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    
    const pClassEl = document.getElementById('pClass');
    if (pClassEl) pClassEl.value = 'custom';
    const pLevelEl = document.getElementById('pLevel');
    if (pLevelEl) pLevelEl.value = '1';

    hideForm('p');
  } else {
    const name = document.getElementById('eN').value || 'Gegner';
    const init = parseInt(document.getElementById('eI').value) || 0;
    const hp = parseInt(document.getElementById('eH').value) || 8;
    const ac = parseInt(document.getElementById('eA').value) || 10;
    const type = document.getElementById('eT').value || 'e';

    CombatState.addCombatant({
      name,
      init,
      hp,
      maxHP: hp,
      ac,
      type
    });

    ['eN', 'eI', 'eH', 'eA'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    hideForm('e');
  }
  
  CombatUI.renderAll();
}

/**
 * Submits the Concentration Spell addition form
 */
function addConc() {
  const whoInp = document.getElementById('cWho');
  const spellInp = document.getElementById('cSpell');
  const durInp = document.getElementById('cDur');

  if (!whoInp || !spellInp || !durInp) return;

  const who = whoInp.value;
  const spell = spellInp.value;
  const dur = parseInt(durInp.value) || 0;

  if (!who || !spell) return;

  CombatState.addConcentration(who, spell, dur);
  
  whoInp.value = '';
  spellInp.value = '';
  durInp.value = '';
  
  CombatUI.renderConc();
}

/**
 * Triggers JSON Export download
 */
function exportEncounter() {
  const state = CombatState.getState();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  
  const encounterName = state.meta.begegnung.trim() || 'begegnung';
  const safeName = encounterName.replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase();
  
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `dnd_35e_${safeName || 'encounter'}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Triggers the file chooser for JSON Import
 */
function triggerImport() {
  const picker = document.getElementById('importFile');
  if (picker) picker.click();
}

/**
 * Handles JSON file loading and updates states
 */
function importEncounter(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const loadedState = JSON.parse(e.target.result);
      if (!loadedState.combatants) {
        alert("Ungültiges Dateiformat. Keine Kämpfer gefunden.");
        return;
      }
      if (confirm("Möchtest du diese Begegnung importieren? Aktuelle Daten werden überschrieben.")) {
        CombatState.importEncounterState(loadedState);
        CombatUI.renderAll();
        CombatUI.renderConc();
      }
    } catch (err) {
      alert("Fehler beim Lesen der Datei: " + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // Clear picker
}

// Initialize everything and wire up DOM event listeners
async function initApp() {
  _initIntroSequence();
  await _initStateAndSync();
  _initUIControls();
  _initRoleSelectionEvents();
  _initMaintenanceEvents();
  _initEncounterControls();
  _initMetaInputsSync();
  _initSystemActions();
  _registerServiceWorker();
  _initGlobalClickDismissals();
  _initZoomAndResize();
}

function _initIntroSequence() {
  const intro = document.getElementById('introOverlay');
  if (intro) {
    let introDismissed = false;

    const dismissIntro = () => {
      if (introDismissed) return;
      introDismissed = true;
      
      // Apply CSS smooth fade class
      intro.classList.add('dismissed');
      
      // Permanently remove from DOM after fade-out transition completes to release memory
      setTimeout(() => {
        intro.remove();
      }, 800);
    };

    // Auto-dismiss after 3.8 seconds
    const autoDismissTimer = setTimeout(dismissIntro, 3800);

    // Instant Skip: clicking/tapping anywhere on the overlay triggers instant fade out
    intro.onclick = (e) => {
      e.stopPropagation();
      clearTimeout(autoDismissTimer);
      dismissIntro();
    };
  }
}

async function _initStateAndSync() {
  // Load spells database asynchronously
  await CombatSpells.loadSpells();

  // Try loading saved data from localStorage
  CombatState.loadFromStorage();

  // Restore active network session after refresh/load if it was active
  const storedState = CombatState.getState();
  if (storedState.session && storedState.session.active) {
    console.log("Restoring active network session:", storedState.session.role, "Room:", storedState.session.roomCode);
    CombatState.updateSession(true, storedState.session.role, storedState.session.roomCode);
  }
}

function _initUIControls() {
  CombatUI.initUI();
  CombatUI.buildCondRefGrid();
  CombatUI.renderAll();
  CombatUI.renderConc();
}

function _initRoleSelectionEvents() {
  const btnChooseDM = document.getElementById('btnChooseDM');
  if (btnChooseDM) {
    btnChooseDM.onclick = () => {
      CombatState.setRole('dm');
      CombatUI.renderAll();
    };
  }

  const btnChoosePlayer = document.getElementById('btnChoosePlayer');
  if (btnChoosePlayer) {
    btnChoosePlayer.onclick = () => {
      CombatState.setRole('player');
      CombatUI.renderAll();
    };
  }

  const btnSwapRole = document.getElementById('btnSwapRole');
  if (btnSwapRole) {
    btnSwapRole.onclick = () => {
      CombatState.setRole('choice');
      CombatUI.renderAll();
    };
  }

  const btnMultiplayer = document.getElementById('btnMultiplayer');
  if (btnMultiplayer) {
    btnMultiplayer.onclick = (e) => {
      CombatUI.showSessionModal(e);
    };
  }
}

function _initMaintenanceEvents() {
  const btnClearAll = document.getElementById('btnClearAll');
  if (btnClearAll) {
    btnClearAll.onclick = () => {
      CombatUI.showCustomConfirm(
        "Charakter zurücksetzen",
        "Möchtest du wirklich alle Werte des Charakters auf die Standardwerte zurücksetzen? Dies kann nicht rückgängig gemacht werden.",
        () => {
          CombatState.clearActivePC();
          CombatUI.renderPlayerScreen();
        }
      );
    };
  }

  const btnClearStorage = document.getElementById('btnClearStorage');
  if (btnClearStorage) {
    btnClearStorage.onclick = () => {
      CombatUI.showCustomConfirm(
        "App-Daten bereinigen",
        "Möchtest du den gesamten App-Speicher und Cache wirklich vollständig bereinigen? Dadurch werden alle gespeicherten Charaktere, Begegnungen, Einstellungen sowie der Service-Worker-Cache gelöscht und die App frisch geladen.",
        async () => {
          localStorage.clear();
          if ('caches' in window) {
            try {
              const keys = await caches.keys();
              await Promise.all(keys.map(key => caches.delete(key)));
              console.log('Caches cleared.');
            } catch (err) {
              console.error('Error clearing caches:', err);
            }
          }
          if ('serviceWorker' in navigator) {
            try {
              const registrations = await navigator.serviceWorker.getRegistrations();
              await Promise.all(registrations.map(reg => reg.unregister()));
              console.log('Service Workers unregistered.');
            } catch (err) {
              console.error('Error unregistering service workers:', err);
            }
          }
          window.location.reload();
        }
      );
    };
  }
}

function _initEncounterControls() {
  const btnPrev = document.getElementById('btnPrev');
  if (btnPrev) {
    btnPrev.onclick = () => {
      CombatState.prevTurn();
      CombatUI.updateActiveTurnUI();
    };
  }

  const btnNext = document.getElementById('btnNext');
  if (btnNext) {
    btnNext.onclick = () => {
      CombatState.nextTurn();
      CombatUI.renderAll();
      CombatUI.renderConc();
    };
  }

  const btnNewRound = document.getElementById('btnNewRound');
  if (btnNewRound) {
    btnNewRound.onclick = () => {
      CombatState.nextRound();
      CombatUI.renderAll();
      CombatUI.renderConc();
    };
  }

  const btnReset = document.getElementById('btnReset');
  if (btnReset) {
    btnReset.onclick = () => {
      if (confirm("Möchtest du das gesamte Kampfblatt wirklich zurücksetzen? Alle Kämpfer, Zauber und Begegnungsdaten werden gelöscht.")) {
        CombatState.clearState();
        
        // Clear meta inputs in DOM
        ['metaBegegnung', 'metaOrt', 'metaXpBudget', 'metaXpVerteilt', 'metaSitzung'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
        
        CombatUI.renderAll();
        CombatUI.renderConc();
      }
    };
  }

  const btnShowAddP = document.getElementById('btnShowAddP');
  if (btnShowAddP) {
    btnShowAddP.onclick = () => showForm('p');
  }

  const btnShowAddE = document.getElementById('btnShowAddE');
  if (btnShowAddE) {
    btnShowAddE.onclick = () => showForm('e');
  }

  const btnConfirmAddP = document.getElementById('btnConfirmAddP');
  if (btnConfirmAddP) {
    btnConfirmAddP.onclick = () => confirmAdd('p');
  }

  const btnConfirmAddE = document.getElementById('btnConfirmAddE');
  if (btnConfirmAddE) {
    btnConfirmAddE.onclick = () => confirmAdd('e');
  }

  const btnHideAddP = document.getElementById('btnHideAddP');
  if (btnHideAddP) {
    btnHideAddP.onclick = () => hideForm('p');
  }

  const btnHideAddE = document.getElementById('btnHideAddE');
  if (btnHideAddE) {
    btnHideAddE.onclick = () => hideForm('e');
  }

  const btnAddConc = document.getElementById('btnAddConc');
  if (btnAddConc) {
    btnAddConc.onclick = () => addConc();
  }
}

function _initMetaInputsSync() {
  const metaInputs = {
    metaBegegnung: 'begegnung',
    metaOrt: 'ort',
    metaXpBudget: 'xpBudget',
    metaXpVerteilt: 'xpVerteilt',
    metaSitzung: 'sitzung'
  };

  Object.entries(metaInputs).forEach(([id, key]) => {
    const input = document.getElementById(id);
    if (input) {
      input.oninput = (e) => {
        CombatState.updateMeta(key, e.target.value);
      };
    }
  });
}

function _initSystemActions() {
  const btnCloseRef = document.getElementById('btnCloseRef');
  if (btnCloseRef) {
    btnCloseRef.onclick = () => CombatUI.closeRefDirect();
  }

  const btnPrint = document.getElementById('btnPrint');
  if (btnPrint) {
    btnPrint.onclick = () => window.print();
  }

  const btnSample = document.getElementById('btnLoadSample');
  if (btnSample) {
    btnSample.onclick = () => {
      CombatState.loadSampleData();
      CombatUI.renderAll();
      CombatUI.renderConc();
    };
  }

  const btnExport = document.getElementById('btnExport');
  if (btnExport) {
    btnExport.onclick = () => exportEncounter();
  }

  const btnImport = document.getElementById('btnImport');
  if (btnImport) {
    btnImport.onclick = () => triggerImport();
  }

  const picker = document.getElementById('importFile');
  if (picker) {
    picker.onchange = (e) => importEncounter(e);
  }

  const btnSystemMenuDM = document.getElementById('btnSystemMenuDM');
  if (btnSystemMenuDM) {
    btnSystemMenuDM.onclick = (e) => {
      e.stopPropagation();
      window.toggleSystemDropdown(btnSystemMenuDM);
    };
  }

  const systemDropdown = document.getElementById('systemDropdownMenu');
  if (systemDropdown) {
    systemDropdown.onclick = (e) => {
      if (e.target.closest('.fab-item')) {
        systemDropdown.classList.remove('open');
        systemDropdown.style.display = 'none';
      }
    };
  }
}

function _registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => {
          console.log('Service Worker registered. Scope:', reg.scope);
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('New service worker installed, reloading page...');
                    window.location.reload();
                  }
                }
              };
            }
          };
        })
        .catch(err => console.error('Service Worker registration failed:', err));
    });
  }
}

function _initGlobalClickDismissals() {
  document.addEventListener('click', (e) => {
    // A. Close condition popups (.cond-popup) if click is outside the popup and any trigger button
    const insidePopup = e.target.closest('.cond-popup');
    const isTrigger = e.target.closest('.popup-trigger-btn') || e.target.closest('.pc-cond-popup-trigger') || e.target.closest('.cond-trigger-btn');
    if (!insidePopup && !isTrigger) {
      document.querySelectorAll('.cond-popup.open').forEach(p => p.classList.remove('open'));
      const pcPopup = document.getElementById('pcPopup');
      if (pcPopup) pcPopup.classList.remove('open');
    }
    
    // B. Close rules reference overlay (#refOverlay) if click is outside the ref modal
    const refOverlay = document.getElementById('refOverlay');
    const insideModal = e.target.closest('.ref-modal');
    const isRefChip = e.target.closest('.cond-ref-chip') || e.target.closest('.init-cond-dot') || e.target.closest('.cond-ref-chip-link');
    if (refOverlay && refOverlay.classList.contains('open') && !insideModal && !isRefChip) {
      refOverlay.classList.remove('open');
    }

    // D. Close System Dropdown if click is outside the menu and any system trigger button
    const systemDropdown = document.getElementById('systemDropdownMenu');
    const isSystemTrigger = e.target.closest('#btnSystemMenuDM') || e.target.closest('#btnSystemMenuPlayer');
    if (systemDropdown && systemDropdown.classList.contains('open') && !e.target.closest('#systemDropdownMenu') && !isSystemTrigger) {
      systemDropdown.classList.remove('open');
      systemDropdown.style.display = 'none';
    }
  });
}

function _initZoomAndResize() {
  window.addEventListener('resize', applyScaleFactor);

  const appRoot = document.getElementById('appRoot');
  if (appRoot && typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(_syncBodyHeight);
    });
    resizeObserver.observe(appRoot);
  }

  // Verhindert das horizontale Verrutschen der App auf Tablets (z. B. wenn der Fokus auf ein rechtes Suchfeld springt)
  window.addEventListener('scroll', () => {
    if (window.scrollX !== 0 || window.pageXOffset !== 0) {
      window.scrollTo(0, window.scrollY || window.pageYOffset);
    }
  });

  // Schutz für den Visual Viewport (mobiler Browser-Zoom/Pan-Schutz bei Tastatur-Einblendung)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('scroll', () => {
      if (window.visualViewport.offsetLeft !== 0) {
        window.scrollTo(window.scrollX, window.scrollY);
      }
    });
  }

  document.addEventListener('focusin', () => {
    setTimeout(() => {
      if (window.scrollX !== 0 || window.pageXOffset !== 0) {
        window.scrollTo(0, window.scrollY || window.pageYOffset);
      }
      if (window.visualViewport && window.visualViewport.offsetLeft !== 0) {
        window.scrollTo(window.scrollX, window.scrollY);
      }
    }, 80);
  });

  applyScaleFactor();
}

let currentScale = 1.0;

function _syncBodyHeight() {
  const appRoot = document.getElementById('appRoot');
  if (appRoot) {
    const unscaledHeight = appRoot.offsetHeight || appRoot.scrollHeight;
    const scaledHeight = unscaledHeight * currentScale;
    document.body.style.minHeight = scaledHeight + 'px';
  }
}

function applyScaleFactor() {
  const appRoot = document.getElementById('appRoot');
  if (!appRoot) return;

  const targetWidth = 1150;
  let scale = window.innerWidth / targetWidth;
  scale = Math.max(1.0, Math.min(1.6, scale));

  currentScale = scale;
  document.documentElement.style.setProperty('--app-scale', scale);

  _syncBodyHeight();
}

// Robust bootstrapper checking document readyState (extremely important for native ES modules & PWA caches)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

