/**
 * @module    DMScreen
 * @summary   Main Dungeon Master Screen layout grid. coordinates sub-panels and active turn/round updates.
 * @exports   DMScreen
 * @reads     state
 * @stateOps  CombatState.prevTurn, CombatState.nextTurn, CombatState.nextRound, CombatState.clearState, CombatState.setRole, CombatState.importEncounterState, CombatState.loadSampleData
 * @depends   React, @core/state.js, DMHeader, InitBar, DMCombatantsTable, DMToolbox, RefOverlay, @core/ui/components/dialogs.js
 */

import React, { useState, useRef, useEffect } from 'react';
import { CombatState } from '@core/state.js';
import type { CombatStateSnapshot } from '../../types/combat';
import { DMHeader } from './DMHeader';
import { InitBar } from './InitBar';
import { DMCombatantsTable } from './DMCombatantsTable';
import { realtimeManager } from '../../services/network/RealtimeManager.ts';
import { DMToolbox } from './DMToolbox';
import { campaignService } from '../../services/campaign/CampaignService.ts';
import { storageService } from '../../services/storage/StorageService.ts';
import { showCustomConfirm, showCustomAlert, showSampleChoiceDialog } from '@core/ui/components/dialogs.js';

interface DMScreenProps {
  state: CombatStateSnapshot;
}

export const DMScreen: React.FC<DMScreenProps> = ({ state }) => {
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  const systemBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-connect DM to active campaign Realtime room and ensure encounter is hydrated
  useEffect(() => {
    const ensureDMConnection = async () => {
      let activeCampId = campaignService.getActiveCampaignId();
      if (!activeCampId) {
        const campaigns = await campaignService.listCampaigns();
        if (campaigns.length > 0) {
          activeCampId = campaigns[0].id;
          await campaignService.switchActiveCampaign(activeCampId);
        } else {
          const fresh = await campaignService.createCampaign({ name: 'Default Encounter' });
          activeCampId = fresh.id;
          await campaignService.switchActiveCampaign(activeCampId);
        }
      } else {
        await campaignService.switchActiveCampaign(activeCampId);
      }

      if (activeCampId) {
        const userId = storageService.getCurrentUserId() || 'dm-host';
        await realtimeManager.joinCampaign(activeCampId, 'host', {
          userId,
          userName: 'Dungeon Master',
        });
      }
    };

    ensureDMConnection();
  }, []);

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
      "Reset Combat Sheet",
      "Are you sure you want to reset the entire combat sheet? All combatants, spells, and encounter data will be deleted.",
      () => {
        CombatState.clearState();
      }
    );
  };

  const handleSwapRole = () => {
    setIsSystemOpen(false);
    realtimeManager.leaveCampaign();
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
          showCustomAlert("Import Encounter", "Invalid file format. No combatants found.", "OK", "⚠️");
          return;
        }
        showCustomConfirm(
          "Import Encounter",
          "Do you want to import this encounter? Current data will be overwritten.",
          () => {
            CombatState.importEncounterState(loadedState);
          }
        );
      } catch (err: any) {
        showCustomAlert("Import Error", "Error reading file: " + err.message, "OK", "⚠️");
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
      "Clear App Data",
      "Are you sure you want to completely clear the entire app storage and cache? This will delete all saved characters, encounters, settings, and the service worker cache, and reload the app fresh.",
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
            Player
          </div>
          <div className="leg-item">
            <div className="leg-dot dot-e"></div>
            Enemy
          </div>
          <div className="leg-item">
            <div className="leg-dot dot-n"></div>
            NPC
          </div>
          <span>· ▼ active turn</span>
        </div>

        <div className="btns">
          <button className="btn" onClick={handlePrev}>◀ Back</button>
          <button className="btn btn-p" onClick={handleNext}>Next Turn ▶</button>
          <button className="btn" onClick={handleNewRound}>New Round +</button>
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
                  fontSize: '10px', 
                  color: 'var(--red)', 
                  fontWeight: 'bold', 
                  marginBottom: '5px', 
                  borderBottom: '0.5px solid var(--pb)', 
                  paddingBottom: '3px', 
                  textAlign: 'center' 
                }}>
                  📜 System Options
                </div>
                <button className="fab-item" onClick={handleSwapRole}>🎭 Change Role</button>
                <button className="fab-item" onClick={handlePrint}>🖨 Print (A4)</button>
                <button className="fab-item" onClick={handleExport}>💾 Export</button>
                <button className="fab-item" onClick={handleImportClick}>📂 Import</button>
                <button className="fab-item" onClick={handleLoadSample}>📋 Sample Data</button>
                <button 
                  className="fab-item" 
                  onClick={handleClearStorage} 
                  style={{ background: 'rgba(139, 26, 26, 0.12)', color: 'var(--red)', fontWeight: 'bold', borderColor: 'var(--red)' }}
                >
                  🗑️ Clear App Data
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
