/**
 * @module    PlayerSheet
 * @summary   Player Character sheet component managing tab navigation, local states, and system options dropdown.
 * @exports   PlayerSheet
 * @reads     pc
 * @stateOps  CombatState.setRole, CombatState.clearActivePC, CombatState.loadSampleData
 * @depends   React, useCombatState, PCHeader, PCHealthGlobe, PCAttributes, PCOffenseTab, PCSkillsTab, PCDefenses, PCFeatsTab, PCMagicItemsTab, PCSpellsTab, PCFeaturesTab
 */

import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import type { Combatant } from '../../types/combat';
import { PCHeader } from './PCHeader';
import { PCHealthGlobe } from './PCHealthGlobe';
import { PCAttributes } from './PCAttributes';
import { PCOffenseTab } from './PCOffenseTab';
import { PCSkillsTab } from './PCSkillsTab';
import { PCDefenses } from './PCDefenses';
import { PCFeatsTab } from './PCFeatsTab';
import { PCMagicItemsTab } from './PCMagicItemsTab';
import { PCSpellsTab } from './PCSpellsTab';
import { PCFeaturesTab } from './PCFeaturesTab';
// @ts-ignore
import { showCustomConfirm, showSampleChoiceDialog, showSessionModal } from '@core/ui/components/dialogs.js';

interface PlayerSheetProps {
  pc: Combatant;
}

type TabType = 'overview' | 'skills' | 'feats' | 'offense' | 'magicitems' | 'spells' | 'features';

export const PlayerSheet: React.FC<PlayerSheetProps> = ({ pc }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  const systemBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const casterClasses = ['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'bard'];
  const hasCasterClass = Array.isArray(pc.classes) && pc.classes.some((c: any) => casterClasses.includes(c.classType));

  const tabStyle = (tab: TabType): React.CSSProperties => ({
    fontFamily: "'IM Fell English SC', serif",
    fontSize: '9px',
    padding: '4px 10px',
    cursor: 'pointer',
    background: activeTab === tab ? 'rgba(200,169,110,0.1)' : 'transparent',
    border: '0.5px solid var(--pb)',
    borderBottom: activeTab === tab ? 'none' : '0.5px solid var(--pb)',
    borderRadius: '2px 2px 0 0',
    color: activeTab === tab ? 'var(--red)' : 'var(--inkl)',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    outline: 'none',
  });

  const systemTabStyle: React.CSSProperties = {
    fontFamily: "'IM Fell English SC', serif",
    fontSize: '9px',
    padding: '4px 10px',
    cursor: 'pointer',
    background: isSystemOpen ? 'rgba(200,169,110,0.1)' : 'transparent',
    border: '0.5px solid var(--pb)',
    borderBottom: isSystemOpen ? 'none' : '0.5px solid var(--pb)',
    borderRadius: '2px 2px 0 0',
    color: 'var(--inkl)',
    outline: 'none',
  };

  const handleOnlineSession = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsSystemOpen(false);
    showSessionModal(e.nativeEvent);
  };

  const handleSwapRole = () => {
    setIsSystemOpen(false);
    CombatState.setRole('choice');
  };

  const handlePrint = () => {
    setIsSystemOpen(false);
    window.print();
  };

  const handleExport = () => {
    setIsSystemOpen(false);
    const encounterName = pc.name.trim() || 'charakter';
    const safeName = encounterName.replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(CombatState.getState(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dnd_35e_${safeName || 'pc'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportClick = () => {
    setIsSystemOpen(false);
    const picker = document.getElementById('playerImportFile');
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
          "Charakter importieren",
          "Möchtest du diese Daten importieren? Aktuelle Daten werden überschrieben.",
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
    showSampleChoiceDialog(true, (choice: string) => {
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

  // Positioning the dropdown dynamically
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    position: 'absolute',
    display: 'none',
    zIndex: 2200,
  });

  useEffect(() => {
    if (isSystemOpen && systemBtnRef.current) {
      const rect = systemBtnRef.current.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      
      const menuWidth = 170;
      const scale = parseFloat(document.documentElement.style.getPropertyValue('--app-scale')) || 1.0;
      const scaledWidth = menuWidth * scale;

      const style: React.CSSProperties = {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 2200,
        top: `${rect.bottom + scrollY}px`,
        transformOrigin: 'top left',
      };

      if (rect.left + scaledWidth > window.innerWidth) {
        style.left = `${rect.right + scrollX - scaledWidth}px`;
        style.transformOrigin = 'top right';
      } else {
        style.left = `${rect.left + scrollX}px`;
        style.transformOrigin = 'top left';
      }

      setDropdownStyle(style);
    } else {
      setDropdownStyle({
        position: 'absolute',
        display: 'none',
        zIndex: 2200,
      });
    }
  }, [isSystemOpen]);

  return (
    <div>
      {/* PCHeader ganz oben */}
      <PCHeader pc={pc} activeTab={activeTab} />

      {/* Grid Layout für den Rest des Bogens */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '12px',
          width: '100%',
          marginTop: '4px',
          boxSizing: 'border-box'
        }}
      >
        {/* Linke Spalte: Vitalität & Attribute */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <PCHealthGlobe pc={pc} />
          <PCAttributes pc={pc} />
        </div>

        {/* Rechte Spalte: Navigations-Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Tab-Leiste */}
          <div
            className="playerTabBar"
            style={{
              display: 'flex',
              gap: '4px',
              borderBottom: '1px solid var(--pb)',
              paddingBottom: '4px',
              marginBottom: '6px',
            }}
          >
            <button onClick={() => setActiveTab('overview')} className={`player-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} style={tabStyle('overview')}>
              🛡️ Übersicht
            </button>
            <button onClick={() => setActiveTab('skills')} className={`player-tab-btn ${activeTab === 'skills' ? 'active' : ''}`} style={tabStyle('skills')}>
              📜 Fertigkeiten
            </button>
            <button onClick={() => setActiveTab('feats')} className={`player-tab-btn ${activeTab === 'feats' ? 'active' : ''}`} style={tabStyle('feats')}>
              🧬 Talente
            </button>
            <button onClick={() => setActiveTab('offense')} className={`player-tab-btn ${activeTab === 'offense' ? 'active' : ''}`} style={tabStyle('offense')}>
              ⚔️ Ausrüstung
            </button>
            <button onClick={() => setActiveTab('magicitems')} className={`player-tab-btn ${activeTab === 'magicitems' ? 'active' : ''}`} style={tabStyle('magicitems')}>
              ✨ Magische Items
            </button>
            {hasCasterClass && (
              <button onClick={() => setActiveTab('spells')} className={`player-tab-btn ${activeTab === 'spells' ? 'active' : ''}`} style={tabStyle('spells')}>
                🔮 Zauberbuch
              </button>
            )}
            <button onClick={() => setActiveTab('features')} className={`player-tab-btn ${activeTab === 'features' ? 'active' : ''}`} style={tabStyle('features')}>
              🐾 Klasse &amp; Begleiter
            </button>
            <button 
              ref={systemBtnRef}
              onClick={() => setIsSystemOpen(!isSystemOpen)}
              className="player-tab-btn" 
              style={systemTabStyle}
            >
              ⚙️ System
            </button>
          </div>

          {/* Tab-Panel */}
          <div style={{ flex: 1 }}>
            {activeTab === 'overview' && (
              <PCDefenses pc={pc} />
            )}

            {activeTab === 'skills' && (
              <PCSkillsTab pc={pc} />
            )}

            {activeTab === 'feats' && (
              <PCFeatsTab pc={pc} />
            )}

            {activeTab === 'offense' && (
              <PCOffenseTab pc={pc} />
            )}

            {activeTab === 'magicitems' && (
              <PCMagicItemsTab pc={pc} />
            )}

            {activeTab === 'spells' && hasCasterClass && (
              <PCSpellsTab pc={pc} />
            )}

            {activeTab === 'features' && (
              <PCFeaturesTab pc={pc} />
            )}
          </div>
        </div>
      </div>

      {/* React System Dropdown Portal */}
      {isSystemOpen && (
        <div 
          className="system-dropdown no-print open" 
          ref={dropdownRef}
          style={dropdownStyle}
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

      {/* Hidden file input for Import */}
      <input 
        type="file" 
        id="playerImportFile" 
        accept=".json" 
        onChange={handleImportFileChange} 
        style={{ display: 'none' }} 
      />
    </div>
  );
};
