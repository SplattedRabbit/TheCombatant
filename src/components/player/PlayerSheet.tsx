/**
 * @module    PlayerSheet
 * @summary   Player Character sheet component managing tab navigation, local states, and system options dropdown.
 * @exports   PlayerSheet
 * @reads     pc
 * @stateOps  CombatState.setRole, CombatState.clearActivePC, CombatState.loadSampleData
 * @depends   React, useCombatState, PCHeader, PCHealthGlobe, PCAttributes, PCOffenseTab, PCSkillsTab, PCDefenses, PCFeatsTab, PCMagicItemsTab, PCSpellsTab, PCFeaturesTab
 */

import React, { useState, useRef, useEffect } from 'react';
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
import { BaseCard } from '../shared/BaseCard';
import { PCSpellsTab } from './PCSpellsTab';
import { realtimeManager } from '../../services/network/RealtimeManager.ts';
import { PCFeaturesTab } from './PCFeaturesTab';
import { LevelUpDialog } from './levelup/LevelUpDialog';
import { showCustomConfirm, showCustomAlert, showSampleChoiceDialog } from '@core/ui/components/dialogs.js';
import { logger } from '../../utils/logger';

interface PlayerSheetProps {
  pc: Combatant;
}

type TabType = 'overview' | 'skills' | 'feats' | 'offense' | 'magicitems' | 'spells' | 'features';

export const PlayerSheet: React.FC<PlayerSheetProps> = ({ pc }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
  const systemBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const casterClasses = ['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'bard'];
  const hasCasterClass = Array.isArray(pc.classes) && pc.classes.some((c: any) => casterClasses.includes(c.classType));

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
    const encounterName = pc.name.trim() || 'character';
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
          showCustomAlert("Import Character", "Invalid file format. No combatants found.", "OK", "⚠️");
          return;
        }
        showCustomConfirm(
          "Import Character",
          "Do you want to import this data? Current character data will be overwritten.",
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
    showSampleChoiceDialog(true, (choice: string) => {
      CombatState.loadSampleData(choice);
    });
  };

  const handleClearStorage = () => {
    setIsSystemOpen(false);
    showCustomConfirm(
      "Clear App Data",
      "Do you really want to completely clear the entire app storage and cache? This will delete all saved characters, encounters, settings, and the service worker cache, and reload the app fresh.",
      async () => {
        localStorage.clear();
        if ('caches' in window) {
          try {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
            logger.log('Caches cleared.');
          } catch (err) {
            logger.error('Error clearing caches:', err);
          }
        }
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
            logger.log('Service Workers unregistered.');
          } catch (err) {
            logger.error('Error unregistering service workers:', err);
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

  // Force scale and height recalculation after tab changes
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
    return () => clearTimeout(timer);
  }, [activeTab]);



  return (
    <div id="playerScreen" className="sheet" style={{ display: 'block' }}>
      {/* PCHeader at the very top */}
      <PCHeader
        pc={pc}
        activeTab={activeTab}
        onOpenWizard={() => CombatState.setRole('wizard')}
        onOpenLevelUp={() => setIsLevelUpOpen(true)}
      />

      {/* Tab Bar */}
      <div className="player-tab-bar no-print" id="playerTabBar" style={{ position: 'relative', zIndex: 100 }}>
        <button onClick={() => setActiveTab('overview')} className={`player-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}>
          🛡️ Overview
        </button>
        <button onClick={() => setActiveTab('skills')} className={`player-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}>
          📜 Skills
        </button>
        <button onClick={() => setActiveTab('feats')} className={`player-tab-btn ${activeTab === 'feats' ? 'active' : ''}`}>
          🎓 Feats
        </button>
        <button onClick={() => setActiveTab('offense')} className={`player-tab-btn ${activeTab === 'offense' ? 'active' : ''}`}>
          ⚔️ Combat & Weapons
        </button>
        <button onClick={() => setActiveTab('magicitems')} className={`player-tab-btn ${activeTab === 'magicitems' ? 'active' : ''}`}>
          ✨ Armory (Magic Items)
        </button>
        {hasCasterClass && (
          <button onClick={() => setActiveTab('spells')} className={`player-tab-btn ${activeTab === 'spells' ? 'active' : ''}`}>
            🔮 Spellbook
          </button>
        )}
        <button onClick={() => setActiveTab('features')} className={`player-tab-btn ${activeTab === 'features' ? 'active' : ''}`}>
          🐾 Class &amp; Companion
        </button>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button 
            ref={systemBtnRef}
            onClick={() => setIsSystemOpen(!isSystemOpen)}
            className={`player-tab-btn ${isSystemOpen ? 'active' : ''}`}
            style={{ margin: 0 }}
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
                fontFamily: 'var(--font-title)',
                fontSize: '10px',
                color: 'var(--red)',
                fontWeight: 'bold',
                letterSpacing: '1px',
                marginBottom: '5px',
                borderBottom: '0.5px solid var(--pb)',
                paddingBottom: '3px',
                textAlign: 'center'
              }}>
                📜 System Options
              </div>
              <button className="fab-item" onClick={() => { setIsSystemOpen(false); CombatState.setRole('wizard'); }}>🧙‍♂️ Character Wizard</button>
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

      {/* Tab Panels */}
      <div className="player-tab-contents">
        {/* Tab 1: Overview */}
        <div className={`player-tab-panel ${activeTab === 'overview' ? 'active' : ''}`} id="tabPanelOverview">
          <div className="overview-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <PCAttributes pc={pc} onOpenLevelUp={() => setIsLevelUpOpen(true)} />
              <PCHealthGlobe pc={pc} />
            </div>
            <PCDefenses pc={pc} />
          </div>
        </div>

        {/* Tab 2: Skills */}
        <div className={`player-tab-panel ${activeTab === 'skills' ? 'active' : ''}`} id="tabPanelSkills">
          <PCSkillsTab pc={pc} />
        </div>

        {/* Tab 3: Feats */}
        <div className={`player-tab-panel ${activeTab === 'feats' ? 'active' : ''}`} id="tabPanelFeats">
          <BaseCard title="🎓 Feats">
            <PCFeatsTab pc={pc} />
          </BaseCard>
        </div>

        {/* Tab 3: Weapons / Offense */}
        <div className={`player-tab-panel ${activeTab === 'offense' ? 'active' : ''}`} id="tabPanelOffense">
          <PCOffenseTab pc={pc} />
        </div>

        {/* Tab: Magic Items */}
        <div className={`player-tab-panel ${activeTab === 'magicitems' ? 'active' : ''}`} id="tabPanelMagicItems">
          <PCMagicItemsTab pc={pc} />
        </div>

        {/* Tab 4: Spellbook & Compendium */}
        <div className={`player-tab-panel ${activeTab === 'spells' ? 'active' : ''}`} id="tabPanelSpells">
          {hasCasterClass && <PCSpellsTab pc={pc} />}
        </div>

        {/* Tab 5: Features & Companions */}
        <div className={`player-tab-panel ${activeTab === 'features' ? 'active' : ''}`} id="tabPanelFeatures">
          <PCFeaturesTab pc={pc} />
        </div>
      </div>

      {/* Guided Level-Up Dialog */}
      <LevelUpDialog 
        activePC={pc} 
        isOpen={isLevelUpOpen} 
        onClose={() => setIsLevelUpOpen(false)} 
      />

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
