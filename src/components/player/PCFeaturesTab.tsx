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
  const activeACFs: string[] = Array.isArray(pc.acfs) ? pc.acfs : [];

  // Check if Animal Companion is available (not traded away by ACFs)
  const isCompanionReplaced = activeACFs.includes('ranger_distracting_attack') || 
                              activeACFs.includes('ranger_spiritual_guide') || 
                              activeACFs.includes('druid_shapeshift');
  
  const hasDruid = hasClasses && pc.classes.some((c: any) => c.classType === 'druid');
  const hasRanger = hasClasses && pc.classes.some((c: any) => c.classType === 'ranger' && (c.level || 0) >= 4);

  const hasCompanion = !isCompanionReplaced && ((hasDruid || hasRanger) || (pc.companionType && pc.companionType !== 'none'));

  // Check if Familiar is available (not traded away by ACFs)
  const isFamiliarReplaced = activeACFs.includes('wizard_immediate_magic') || 
                             activeACFs.includes('sorcerer_metamagic_specialist') || 
                             activeACFs.includes('hexblade_dark_companion');

  const hasWizard = hasClasses && pc.classes.some((c: any) => c.classType === 'wizard');
  const hasSorcerer = hasClasses && pc.classes.some((c: any) => c.classType === 'sorcerer');
  const hasHexblade = hasClasses && pc.classes.some((c: any) => c.classType === 'hexblade' && (c.level || 0) >= 4);

  const hasFamiliar = !isFamiliarReplaced && ((hasWizard || hasSorcerer || hasHexblade) || (pc.familiarType && pc.familiarType !== 'none'));

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

  const renderClassCards = () => {
    if (!Array.isArray(pc.classes)) return [];
    return pc.classes.map((cls: any) => {
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
    }).filter(Boolean);
  };

  const classCards = renderClassCards();
  const allCards = [
    <RacialTraitsCard key="racial-traits" pc={pc} />,
    <GeneralFeaturesCard key="general-features" pc={pc} />,
    ...classCards
  ];

  const hasCompanionOrFamiliar = hasCompanion || hasFamiliar;

  // Split cards evenly across both columns when no companion/familiar is active
  const midIndex = Math.ceil(allCards.length / 2);
  const leftCards = allCards.slice(0, midIndex);
  const rightCards = allCards.slice(midIndex);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box', minHeight: '520px', width: '100%' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3px', marginBottom: '2px' }}>
        <span style={{ fontFamily: 'var(--font-title)', fontSize: '10px', fontWeight: 'bold', color: 'var(--red)' }}>
          ⚔️ Class &amp; Special Features
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

      {hasCompanionOrFamiliar ? (
        /* 2-Column Mode: Left = All Features, Right = Companions & Familiars */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '0.5px solid rgba(200, 169, 110, 0.2)', paddingRight: '8px' }}>
            {allCards}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '10px', color: 'var(--red)', fontWeight: 'bold', borderBottom: '0.5px solid var(--pb)', paddingBottom: '2px', marginBottom: '4px' }}>
              🐾 Companions &amp; Familiars
            </div>

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
          </div>
        </div>
      ) : (
        /* Full-Width Balanced 2-Column Mode for Features */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {leftCards}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {rightCards}
          </div>
        </div>
      )}
    </div>
  );
};
