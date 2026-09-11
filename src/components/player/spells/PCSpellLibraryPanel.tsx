/**
 * @module    PCSpellLibraryPanel
 * @summary   Right-column panel for the Spells Tab:
 *            - Sub-tab switch between "My Spellbook (Learned Spells)" and "Spell Compendium"
 *            - Embeds SpellLibraryList and PCSpellCompendium
 *            - Warm parchment aesthetic
 */

import React, { useState } from 'react';
import { PCSpellCompendium } from './PCSpellCompendium';
import { SpellLibraryList } from './grimoire/SpellLibraryList';

interface PCSpellLibraryPanelProps {
  pc: any;
  activeTab?: 'spellbook' | 'compendium';
  onTabChange?: (tab: 'spellbook' | 'compendium') => void;
}

export const PCSpellLibraryPanel: React.FC<PCSpellLibraryPanelProps> = ({
  pc,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<'spellbook' | 'compendium'>('spellbook');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: 'spellbook' | 'compendium') => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };

  const learnedCount = Array.isArray(pc.learnedSpells) ? pc.learnedSpells.length : 0;

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const isSpontaneousOnly =
    hasClasses &&
    pc.classes.some((c: any) => ['sorcerer', 'bard', 'beguiler'].includes(c.classType)) &&
    !pc.classes.some((c: any) => ['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'duskblade'].includes(c.classType));

  const tabTitle = isSpontaneousOnly ? '✨ Known Spells' : '📖 Spell Library';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        background: 'rgba(200, 169, 110, 0.08)',
        border: '0.5px solid var(--pb)',
        borderRadius: '3px',
        padding: '6px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        boxSizing: 'border-box',
        minWidth: 0,
      }}
    >
      {/* Tab Switcher Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1.5px solid var(--pb)',
          paddingBottom: '3px',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('spellbook')}
            style={{
              background: activeTab === 'spellbook' ? 'rgba(139, 26, 26, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'spellbook' ? '2px solid var(--red)' : '2px solid transparent',
              color: activeTab === 'spellbook' ? 'var(--red)' : 'var(--inkm)',
              fontFamily: 'var(--font-title)',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '2px 8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            {tabTitle} ({learnedCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compendium')}
            style={{
              background: activeTab === 'compendium' ? 'rgba(139, 26, 26, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'compendium' ? '2px solid var(--red)' : '2px solid transparent',
              color: activeTab === 'compendium' ? 'var(--red)' : 'var(--inkm)',
              fontFamily: 'var(--font-title)',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '2px 8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>📚</span> Compendium
          </button>
        </div>
      </div>

      {/* Tab 1: My Spellbook (Learned Spells Library) */}
      {activeTab === 'spellbook' && (
        <SpellLibraryList pc={pc} onOpenCompendium={() => setActiveTab('compendium')} />
      )}

      {/* Tab 2: Compendium (Search all D&D 3.5e Spells) */}
      {activeTab === 'compendium' && (
        <div style={{ minHeight: '380px' }}>
          <PCSpellCompendium pc={pc} />
        </div>
      )}
    </div>
  );
};
