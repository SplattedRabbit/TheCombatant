/**
 * @module    PCSpellsTab
 * @summary   Wrapper component for the spellbook tab. Coordinates the left spellbook and the right dashboard (Preparation vs. Compendium).
 * @exports   PCSpellsTab
 * @reads     pc.classes
 * @depends   React, PCSpellbookTab, PCSpellPreparation, PCSpellCompendium
 */

import React, { useState, useEffect } from 'react';
import { PCSpellbookTab } from './PCSpellbookTab';
import { PCSpellPreparation } from './PCSpellPreparation';
import { PCSpellCompendium } from './PCSpellCompendium';

interface PCSpellsTabProps {
  pc: any;
}

export const PCSpellsTab: React.FC<PCSpellsTabProps> = ({ pc }) => {
  const casterClasses = ['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'bard'];
  const hasCasterClass = Array.isArray(pc.classes) && pc.classes.some((c: any) => casterClasses.includes(c.classType));

  const hasPrepared = Array.isArray(pc.classes) && pc.classes.some((c: any) => 
    ['wizard', 'cleric', 'druid', 'paladin', 'ranger'].includes(c.classType)
  );

  const [rightTab, setRightTab] = useState<'prepared' | 'compendium'>('prepared');

  // Adjust default tab if caster is spontaneous
  useEffect(() => {
    if (!hasPrepared) {
      setRightTab('compendium');
    } else {
      setRightTab('prepared');
    }
  }, [hasPrepared]);

  if (!hasCasterClass) {
    return (
      <div style={{
        fontStyle: 'italic',
        color: 'var(--inkl)',
        fontSize: '11px',
        textAlign: 'center',
        padding: '40px 20px',
        background: 'rgba(0,0,0,0.02)',
        border: '0.5px dashed var(--pb)',
        borderRadius: '4px',
        fontFamily: "'Crimson Text', serif"
      }}>
        🔮 This character does not have any spellcasting classes (e.g., Wizard, Cleric, Bard).
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', height: '100%', boxSizing: 'border-box' }}>
      {/* Left Column: Slots & Library */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '0.5px solid rgba(200, 169, 110, 0.2)', paddingRight: '8px' }}>
        <PCSpellbookTab pc={pc} />
      </div>

      {/* Right Column: Dashboards (Preparation or Compendium) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Right Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1.5px solid var(--pb)',
          marginBottom: '4px',
          fontFamily: "'IM Fell English SC', serif",
          fontSize: '11px',
          gap: '8px'
        }}>
          {hasPrepared && (
            <button
              onClick={() => setRightTab('prepared')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: rightTab === 'prepared' ? '2px solid var(--red)' : '2px solid transparent',
                color: rightTab === 'prepared' ? 'var(--red)' : 'var(--inkm)',
                padding: '4px 8px 2px 8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.15s ease',
                outline: 'none'
              }}
            >
              🌅 Preparation
            </button>
          )}
          <button
            onClick={() => setRightTab('compendium')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: rightTab === 'compendium' ? '2px solid var(--red)' : '2px solid transparent',
              color: rightTab === 'compendium' ? 'var(--red)' : 'var(--inkm)',
              padding: '4px 8px 2px 8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
          >
            📚 Compendium
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '2px 0' }}>
          {rightTab === 'prepared' && hasPrepared ? (
            <PCSpellPreparation pc={pc} />
          ) : (
            <PCSpellCompendium pc={pc} />
          )}
        </div>
      </div>
    </div>
  );
};
