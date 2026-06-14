/**
 * @module    DMScreen
 * @summary   Main Dungeon Master Screen layout grid. coordinates sub-panels and active turn/round updates.
 * @exports   DMScreen
 * @reads     state
 * @stateOps  CombatState.prevTurn, CombatState.nextTurn, CombatState.nextRound, CombatState.clearState, CombatState.setRole, CombatState.importEncounterState, CombatState.loadSampleData
 * @depends   React, @core/state.js, DMHeader, InitBar, DMCombatantsTable, DMToolbox, RefOverlay, @core/ui/components/dialogs.js
 */

import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import type { CombatStateSnapshot } from '../../types/combat';
import { DMHeader } from './DMHeader';
import { InitBar } from './InitBar';
import { DMCombatantsTable } from './DMCombatantsTable';
import { DMToolbox } from './DMToolbox';
// @ts-ignore
import { showCustomConfirm, showSampleChoiceDialog, showSessionModal } from '@core/ui/components/dialogs.js';

interface DMScreenProps {
  state: CombatStateSnapshot;
}

export const DMScreen: React.FC<DMScreenProps> = ({ state }) => {
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  const systemBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    CombatState.prevTurn();
  };

  const handleNext = () => {
    CombatState.nextTurn();
  };

  const handleNewRound = () => {
    CombatState.nextRound();
  };

  const handleReset = () => {
    showCustomConfirm(
      "Kampfblatt zurücksetzen",
      "Möchtest du das gesamte Kampfblatt wirklich zurücksetzen? Alle Kämpfer, Zauber und Begegnungsdaten werden gelöscht.",
      () => {
        CombatState.clearState();
      }
    );
  };

  const handleOnlineSession = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsSystemOpen(false);
    showSessionModal(e.nativeEvent);
  };

  const handleSwapRole = () => {
    setIsSystemOpen(false);
    import('@core/network/NetworkManager.js').then(({ cleanupPeer }) => {
      cleanupPeer();
    });
    CombatState.updateSession(false, 'choice', '');
    CombatState.setRole('choice');
  };

  const handlePrint = () => {
    setIsSystemOpen(false);
    window.print();
  };

  const handleExport = () => {
    setIsSystemOpen(false);
    const encounterName = state.meta.begegnung.trim() || 'begegnung';
    const safeName = encounterName.replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(CombatState.getState(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dnd_35e_${safeName || 'encounter'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportClick = () => {
    setIsSystemOpen(false);
    const picker = document.getElementById('dmImportFile');
    if (picker) picker.click();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const loadedState = JSON.parse(evt.target?.result as string);
        if (!loadedState.combatants) {
          alert("Ungültiges Dateiformat. Keine Kämpfer gefunden.");
          return;
        }
        showCustomConfirm(
          "Begegnung importieren",
          "Möchtest du diese Begegnung importieren? Aktuelle Daten werden überschrieben.",
          () => {
            CombatState.importEncounterState(loadedState);
          }
        );
      } catch (err: any) {
        alert("Fehler beim Lesen der Datei: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Clear picker
  };

  const handleLoadSample = () => {
    setIsSystemOpen(false);
    const isPlayer = state.session.role === 'player';
    showSampleChoiceDialog(isPlayer, (choice: string) => {
      CombatState.loadSampleData(choice);
    });
  };

  const handleClearStorage = () => {
    setIsSystemOpen(false);
    showCustomConfirm(
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

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isSystemOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        systemBtnRef.current &&
        !systemBtnRef.current.contains(e.target as Node)
      ) {
        setIsSystemOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isSystemOpen]);


  return (
    <div className="sheet" style={{ padding: '8px 12px 24px', boxSizing: 'border-box' }}>
      {/* DMHeader */}
      <DMHeader meta={state.meta} />

      {/* Timeline Bar */}
      <InitBar 
        combatants={state.combatants} 
        turn={state.meta.currentTurn} 
        round={state.meta.round} 
      />

      {/* Control row */}
      <div className="ctrl-row no-print" style={{ position: 'relative', zIndex: 100 }}>
        <div className="legend">
          <div className="leg-item">
            <div className="leg-dot dot-p"></div>
            Spieler
          </div>
          <div className="leg-item">
            <div className="leg-dot dot-e"></div>
            Gegner
          </div>
          <div className="leg-item">
            <div className="leg-dot dot-n"></div>
            NSC
          </div>
          <span>· ▼ aktiver Zug</span>
        </div>

        <div className="btns">
          <button className="btn" onClick={handlePrev}>◀ Zurück</button>
          <button className="btn btn-p" onClick={handleNext}>Nächster Zug ▶</button>
          <button className="btn" onClick={handleNewRound}>Neue Runde +</button>
          <button className="btn" onClick={handleReset}>⟳ Reset</button>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button 
              className={`btn ${isSystemOpen ? 'active' : ''}`}
              ref={systemBtnRef} 
              onClick={() => setIsSystemOpen(!isSystemOpen)}
            >
              ⚙️ System
            </button>
            {isSystemOpen && (
              <div 
                className="system-dropdown no-print open" 
                ref={dropdownRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  display: 'flex',
                  zIndex: 2200,
                  transform: 'translateY(4px)',
                  transformOrigin: 'top right',
                  opacity: 1,
                  pointerEvents: 'auto',
                }}
              >
                <div style={{
                  fontFamily: "'IM Fell English SC', serif",
                  fontSize: '10px',
                  color: 'var(--red)',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  marginBottom: '5px',
                  borderBottom: '0.5px solid var(--pb)',
                  paddingBottom: '3px',
                  textAlign: 'center'
                }}>
                  📜 System-Optionen
                </div>
                <button className="fab-item" onClick={handleOnlineSession} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  🌐 <span id="connectionDot" className="conn-dot conn-disconnected" title="Nicht verbunden"></span>Online-Sitzung
                </button>
                <button className="fab-item" onClick={handleSwapRole}>🎭 Rolle wechseln</button>
                <button className="fab-item" onClick={handlePrint}>🖨 Drucken (A4)</button>
                <button className="fab-item" onClick={handleExport}>💾 Exportieren</button>
                <button className="fab-item" onClick={handleImportClick}>📂 Importieren</button>
                <button className="fab-item" onClick={handleLoadSample}>📋 Beispieldaten</button>
                <button 
                  className="fab-item" 
                  onClick={handleClearStorage} 
                  style={{ background: 'rgba(139, 26, 26, 0.12)', color: 'var(--red)', fontWeight: 'bold', borderColor: 'var(--red)' }}
                >
                  🗑️ App-Daten bereinigen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fancy">— ✦ —</div>

      {/* DM Layout Grid */}
      <div className="dm-layout-grid">
        {/* Main Column: Player and NPC Tables */}
        <div className="dm-main-col" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <DMCombatantsTable side="p" combatants={state.combatants} />
          <DMCombatantsTable side="e" combatants={state.combatants} />
        </div>

        {/* Sidebar Toolbox */}
        <div className="dm-side-col">
          <DMToolbox 
            concentrations={state.concentrations || []} 
            combatants={state.combatants}
          />
        </div>
      </div>

      {/* Hidden file input for Import */}
      <input 
        type="file" 
        id="dmImportFile" 
        accept=".json" 
        onChange={handleImportFileChange} 
        style={{ display: 'none' }} 
      />
    </div>
  );
};
