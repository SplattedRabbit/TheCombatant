/**
 * @module    PCFeaturesTab
 * @summary   Renders class features, racial traits, and companion/familiar sheets for the features tab.
 * @exports   PCFeaturesTab
 * @reads     pc.classes, pc.race, pc.companionType, pc.familiarType, pc.dailyAbilities
 * @stateOps  CombatState.resetDailyResources
 * @depends   React, @core/state.js, @core/ui/components/dialogs.js, @core/data/prestigeClasses-data.js, PCCompanionWrapper, features/*
 */

import React, { useState, useEffect } from 'react';
import { CombatState } from '@core/state.js';
import { showCustomConfirm } from '@core/ui/components/dialogs.js';
import { PCCompanionWrapper } from './PCCompanionWrapper';

import { RacialTraitsCard } from './features/RacialTraitsCard';
import { GeneralFeaturesCard } from './features/GeneralFeaturesCard';
import { FighterFeaturesCard } from './features/FighterFeaturesCard';
import { BarbarianFeaturesCard } from './features/BarbarianFeaturesCard';
import { BardFeaturesCard } from './features/BardFeaturesCard';
import { PaladinFeaturesCard } from './features/PaladinFeaturesCard';
import { ClericFeaturesCard } from './features/ClericFeaturesCard';
import { MonkFeaturesCard } from './features/MonkFeaturesCard';
import { RogueFeaturesCard } from './features/RogueFeaturesCard';
import { DruidFeaturesCard } from './features/DruidFeaturesCard';
import { RangerFeaturesCard } from './features/RangerFeaturesCard';
import { WizardFeaturesCard } from './features/WizardFeaturesCard';
import { SorcererFeaturesCard } from './features/SorcererFeaturesCard';
import { PrestigeClassFeaturesCard } from './features/PrestigeClassFeaturesCard';
import { PRESTIGE_CLASSES_REGISTRY } from '@core/data/prestigeClasses-data.js';

interface PCFeaturesTabProps {
  pc: any;
}

export const PCFeaturesTab: React.FC<PCFeaturesTabProps> = ({ pc }) => {
  const [, setTick] = useState(0);
  const triggerRender = () => setTick(t => t + 1);

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const hasCompanion = (hasClasses && pc.classes.some((c: any) => ['druid', 'ranger'].includes(c.classType))) || (pc.companionType && pc.companionType !== 'none');
  const hasFamiliar = (hasClasses && pc.classes.some((c: any) => ['wizard', 'sorcerer'].includes(c.classType))) || (pc.familiarType && pc.familiarType !== 'none');

  const [activeSubTab, setActiveSubTab] = useState<'companion' | 'familiar'>('companion');

  // Adjust active tab based on what is available
  useEffect(() => {
    if (hasCompanion && hasFamiliar) {
      // Keep activeSubTab as is
    } else if (hasCompanion) {
      setActiveSubTab('companion');
    } else if (hasFamiliar) {
      setActiveSubTab('familiar');
    }
  }, [hasCompanion, hasFamiliar]);

  const handleNewDayReset = () => {
    showCustomConfirm("A New Day! 🌅", "Would you like to restore all spent spell slots and daily class features and begin a new day?", () => {
      CombatState.resetDailyResources();
    });
  };

  const hasCompanionOrFamiliar = hasCompanion || hasFamiliar;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', boxSizing: 'border-box', alignItems: 'start', minHeight: '520px' }}>
      {/* Left Column: Class Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '0.5px solid rgba(200, 169, 110, 0.2)', paddingRight: '8px' }}>
        <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--pb)', paddingBottom: '2px', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '10px', fontWeight: 'bold', color: 'var(--red)' }}>
            ⚔️ Class Features
          </span>
          <button
            onClick={handleNewDayReset}
            className="btn btn-new-day"
            style={{ fontSize: '8px', padding: '2px 8px', fontFamily: 'var(--font-title)', fontWeight: 'bold', background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)', color: 'white', border: '0.5px solid var(--red)', borderRadius: '2px', cursor: 'pointer', lineHeight: 1 }}
            title="Restore daily abilities"
          >
            New Day Reset 🌅
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '2px' }}>
          {/* Racial traits */}
          <RacialTraitsCard pc={pc} />

          {/* General daily abilities */}
          <GeneralFeaturesCard pc={pc} />

          {/* Active classes features */}
          {Array.isArray(pc.classes) && pc.classes.map((cls: any) => {
            const level = cls.level || 1;
            switch (cls.classType) {
              case 'fighter':
                return <FighterFeaturesCard key="fighter" pc={pc} level={level} />;
              case 'barbarian':
                return <BarbarianFeaturesCard key="barbarian" pc={pc} level={level} />;
              case 'bard':
                return <BardFeaturesCard key="bard" pc={pc} level={level} />;
              case 'paladin':
                return <PaladinFeaturesCard key="paladin" pc={pc} level={level} />;
              case 'cleric':
                return <ClericFeaturesCard key="cleric" pc={pc} level={level} />;
              case 'monk':
                return <MonkFeaturesCard key="monk" pc={pc} level={level} />;
              case 'rogue':
                return <RogueFeaturesCard key="rogue" pc={pc} level={level} />;
              case 'druid':
                return <DruidFeaturesCard key="druid" pc={pc} level={level} />;
              case 'ranger':
                return <RangerFeaturesCard key="ranger" pc={pc} level={level} />;
              case 'wizard':
                return <WizardFeaturesCard key="wizard" pc={pc} level={level} />;
              case 'sorcerer':
                return <SorcererFeaturesCard key="sorcerer" pc={pc} level={level} />;
              default:
                if (PRESTIGE_CLASSES_REGISTRY[cls.classType]) {
                  return <PrestigeClassFeaturesCard key={cls.classType} pc={pc} level={level} classKey={cls.classType} />;
                }
                return null;
            }
          })}
        </div>
      </div>

      {/* Right Column: Companions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '10px', color: 'var(--red)', fontWeight: 'bold', borderBottom: '0.5px solid var(--pb)', paddingBottom: '2px', marginBottom: '4px' }}>
          🐾 Companions &amp; Familiars
        </div>

        {hasCompanionOrFamiliar ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {hasCompanion && hasFamiliar && (
              <div style={{ display: 'flex', gap: '3px', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3.5px', marginBottom: '6px' }}>
                <button
                  onClick={() => setActiveSubTab('companion')}
                  className={`btn ${activeSubTab === 'companion' ? 'btn-p' : ''}`}
                  style={{ fontSize: '8px', padding: '2px 6px' }}
                >
                  🐾 Animal Companion
                </button>
                <button
                  onClick={() => setActiveSubTab('familiar')}
                  className={`btn ${activeSubTab === 'familiar' ? 'btn-p' : ''}`}
                  style={{ fontSize: '8px', padding: '2px 6px' }}
                >
                  🦇 Familiar
                </button>
              </div>
            )}

            <PCCompanionWrapper
              pc={pc}
              type={activeSubTab}
              onUpdate={triggerRender}
            />
          </div>
        ) : (
          <div style={{ fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '35px 10px', background: 'rgba(0,0,0,0.02)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
            🐾 No active animal companion or familiar.
          </div>
        )}
      </div>
    </div>
  );
};
