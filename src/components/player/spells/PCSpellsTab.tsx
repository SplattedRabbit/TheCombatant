/**
 * @module    PCSpellsTab
 * @summary   The Arcane Hub: Compact, tablet-optimized all-in-one Grimoire view with on-demand Compendium drawer.
 */

import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { showCustomConfirm, showNewDayTemplateDialog } from '@core/ui/components/dialogs.js';
import { PCSpellsHeaderBar } from './PCSpellsHeaderBar';
import { PCCompactGrimoireView } from './PCCompactGrimoireView';
import { PCSpellLibraryPanel } from './PCSpellLibraryPanel';
import { usePC } from '../../../context/PCContext';
import { WizardSpecializationDialog } from '../../dialogs/BaseDialogs';

export const PCSpellsTab: React.FC = () => {
  const pc = usePC();
  const loosePc = pc as any;
  const [, setTick] = useState(0);
  const triggerRender = () => setTick((t) => t + 1);

  const casterClasses = [
    'wizard',
    'cleric',
    'druid',
    'paladin',
    'ranger',
    'sorcerer',
    'bard',
    'duskblade',
    'beguiler',
    'assassin',
  ];
  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const hasCasterClass =
    hasClasses && pc.classes.some((c: any) => casterClasses.includes(c.classType));

  const hasPrepared =
    hasClasses &&
    pc.classes.some((c: any) =>
      ['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'duskblade'].includes(c.classType)
    );

  const isWizard = hasClasses && pc.classes.some((c: any) => c.classType === 'wizard');

  // Library panel sub-tab (Learned Spells vs Compendium)
  const [libraryTab, setLibraryTab] = useState<'spellbook' | 'compendium'>('spellbook');
  const [isSpecDialogOpen, setIsSpecDialogOpen] = useState(false);

  if (!hasCasterClass) {
    return (
      <div
        style={{
          fontStyle: 'italic',
          color: 'var(--inkl)',
          fontSize: '11px',
          textAlign: 'center',
          padding: '40px 20px',
          background: 'rgba(0,0,0,0.02)',
          border: '0.5px dashed var(--pb)',
          borderRadius: '4px',
          fontFamily: 'var(--font-body)',
        }}
      >
        🔮 This character does not possess any spellcasting classes (e.g., Wizard, Cleric, Bard).
      </div>
    );
  }

  const handleNewDayReset = () => {
    const performNewDayReset = (templateChoice = 'keep') => {
      CombatState.updatePCBatch((freshPc: any) => {
        if (templateChoice === 'empty') {
          freshPc.preparedSpells = [];
        } else if (templateChoice !== 'keep') {
          for (let lvl = 0; lvl <= 9; lvl++) {
            if (freshPc.spellSlots?.[lvl]) {
              freshPc.spellSlots[lvl].used = 0;
            }
          }
          const template = loosePc.spellTemplates?.[templateChoice];
          if (template) {
            freshPc.preparedSpells = JSON.parse(JSON.stringify(template));
          }
        } else {
          // Keep spells, restore used state
          if (Array.isArray(freshPc.preparedSpells)) {
            freshPc.preparedSpells.forEach((p: any) => {
              p.isUsed = false;
            });
          }
        }

        // Reset all slot bubble usages
        for (let lvl = 0; lvl <= 9; lvl++) {
          if (freshPc.spellSlots?.[lvl]) {
            freshPc.spellSlots[lvl].used = 0;
          }
        }
      });

      CombatState.resetDailyResources();
      triggerRender();
    };

    if (hasPrepared) {
      showNewDayTemplateDialog(pc, loosePc.spellTemplates || {}, (choice: string) => {
        performNewDayReset(choice);
      });
    } else {
      showCustomConfirm(
        'A New Day! 🌅',
        'Would you like to restore all spent spell slots and daily class features and begin a new day?',
        () => {
          performNewDayReset('keep');
        }
      );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxSizing: 'border-box',
        minHeight: '520px',
        width: '100%',
      }}
    >
      {/* 1. Global Status Bar: Specialization, transparent ASF, and Daily Reset */}
      <PCSpellsHeaderBar
        pc={pc}
        onOpenSpecializationDialog={isWizard ? () => setIsSpecDialogOpen(true) : undefined}
        onNewDayReset={handleNewDayReset}
      />

      {/* 2. Main Body: 2-Column Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(330px, 1.15fr) minmax(300px, 1fr)',
          gap: '8px',
          alignItems: 'start',
          width: '100%',
        }}
      >
        {/* Left Column: Active Grimoire (Slots & Prepared Spells / Cast View) */}
        <PCCompactGrimoireView
          pc={pc}
          onOpenCompendium={() => setLibraryTab('compendium')}
        />

        {/* Right Column: Spell Library (Learned Spells) & Compendium */}
        <PCSpellLibraryPanel
          pc={pc}
          activeTab={libraryTab}
          onTabChange={setLibraryTab}
        />
      </div>

      {/* Wizard Specialization Modal */}
      {isWizard && (
        <WizardSpecializationDialog
          pc={pc}
          isOpen={isSpecDialogOpen}
          onClose={() => {
            setIsSpecDialogOpen(false);
            triggerRender();
          }}
        />
      )}
    </div>
  );
};
