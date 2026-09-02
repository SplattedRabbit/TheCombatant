/**
 * @module    PCHeader
 * @summary   Header component for the player character with name, race, class/level, alignment, initiative, HP display, and damage controller.
 * @exports   PCHeader
 * @reads     pc.name, pc.race, pc.classes, pc.size, pc.alignment, pc.hp, pc.maxHP, pc.conditions, pc.init, pc.iniMisc, pc.dex, pc.feats
 * @stateOps  updatePCField, updatePCNumber, applyDamage, applyTempHP
 * @depends   React, @core/state.js, src/hooks/useCombatState
 * @notHere   Attributes & Multiclass Manager -> PCAttributes.tsx | HP Globe -> PCHealthGlobe.tsx
 */

import React, { useState, useEffect } from 'react';
import type { Combatant } from '../../types/combat';
import { CombatState } from '@core/state.js';
import { getStatMod } from './attributeHelper';
import { PCHeaderInfo } from './header/PCHeaderInfo.tsx';
import { PCHeaderStatsWidget } from './header/PCHeaderStatsWidget.tsx';
import { YouDiedOverlay } from './header/YouDiedOverlay.tsx';

interface PCHeaderProps {
  pc: Combatant;
  activeTab: string;
  onOpenWizard?: () => void;
  onOpenLevelUp?: () => void;
  onOpenPrint?: () => void;
}

export const PCHeader: React.FC<PCHeaderProps> = ({ pc, activeTab, onOpenWizard, onOpenLevelUp, onOpenPrint }) => {
  const [showYouDied, setShowYouDied] = useState<boolean>(false);
  const [youDiedStep, setYouDiedStep] = useState<number>(0); // 0: hidden, 1: fade-in, 2: visible

  const dexMod = getStatMod(pc.dex);
  const hasImprovedInit = Array.isArray(pc.feats) && pc.feats.some(f => f.id === 'improved_initiative');
  const totIni = dexMod + (parseInt((pc as any).iniMisc) || 0) + (hasImprovedInit ? 4 : 0);
  const finalIni = (pc.init || 0) > 0 ? pc.init : ((pc.rawInit || 0) > 0 ? pc.rawInit + totIni : (pc.initiative ? pc.initiative + totIni : '--'));

  // You Died Overlay monitoring
  useEffect(() => {
    if (pc.hp <= -10 && !(pc as any).deathScreenShown) {
      CombatState.updatePCField('deathScreenShown', true);
      setShowYouDied(true);
      setYouDiedStep(1);
      setTimeout(() => setYouDiedStep(2), 50);
    } else if (pc.hp > -10 && (pc as any).deathScreenShown) {
      CombatState.updatePCField('deathScreenShown', false);
      setShowYouDied(false);
      setYouDiedStep(0);
    }
  }, [pc.hp, (pc as any).deathScreenShown]);

  const handleYouDiedDismiss = () => {
    setYouDiedStep(1);
    setTimeout(() => {
      setShowYouDied(false);
      setYouDiedStep(0);
    }, 800);
  };

  return (
    <div
      className="player-hdr-bar no-print"
      style={{
        padding: '8px 12px',
        background: 'linear-gradient(180deg, rgba(200, 169, 110, 0.22), rgba(200, 169, 110, 0.08))',
        borderBottom: '1px solid var(--pb)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        position: 'relative',
        zIndex: 50,
      }}
    >
      {/* Wizard banner for Level 0/New characters */}
      {(!Array.isArray(pc.classes) || pc.classes.length === 0) && (
        <div 
          style={{ 
            background: 'linear-gradient(90deg, rgba(139, 26, 26, 0.1), rgba(200, 169, 110, 0.2))', 
            border: '1px solid var(--pb)', 
            borderRadius: '4px', 
            padding: '8px 14px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            marginBottom: '4px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🧙‍♂️</span>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ color: 'var(--red)', fontFamily: 'var(--font-title)', fontSize: '13px', display: 'block' }}>
                Character Wizard
              </strong>
              <span style={{ fontSize: '11px', color: 'var(--inkm)', fontFamily: 'var(--font-body)' }}>
                Create your D&D 3.5e character step-by-step with the guided, rules-compliant assistant.
              </span>
            </div>
          </div>
          <button 
            className="btn btn-p" 
            onClick={() => CombatState.setRole('wizard')}
            style={{ fontSize: '11px', padding: '4px 12px', whiteSpace: 'nowrap' }}
          >
            Start Assistant
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
        {/* Left: Character Name, Details & Actions */}
        <PCHeaderInfo pc={pc} onOpenWizard={onOpenWizard} onOpenLevelUp={onOpenLevelUp} onOpenPrint={onOpenPrint} />

        {/* Right: Premium Status & Combat Widget */}
        {activeTab !== 'overview' && (
          <PCHeaderStatsWidget pc={pc} finalIni={finalIni} />
        )}
      </div>

      {/* You Died Overlay (Dark Souls Style Easter Egg) */}
      <YouDiedOverlay
        show={showYouDied}
        step={youDiedStep}
        onDismiss={handleYouDiedDismiss}
      />
    </div>
  );
};
