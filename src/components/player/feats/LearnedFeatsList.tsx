/**
 * @module    LearnedFeatsList
 * @summary   Left column of PCFeatsTab: shows learned and automatic feats, slot capacity breakdown, and filter search.
 */

import React, { useState, useMemo } from 'react';
import { CombatFeats } from '@core/data/feats-data.js';
import { checkPrerequisites } from '@core/rules/RulesFeats.js';

interface LearnedFeatsListProps {
  pc: any;
  combinedFeats: any[];
  activeFeats: any[];
  totalMax: number;
  generalFilled: number;
  generalMax: number;
  fighterFilled: number;
  fighterMax: number;
  wizardFilled: number;
  wizardMax: number;
  monkFilled: number;
  monkMax: number;
  hasFighter: boolean;
  hasWizard: boolean;
  hasMonk: boolean;
  onFeatClick: (feat: any, isLearned: boolean, option?: string, e?: React.MouseEvent) => void;
}

export const LearnedFeatsList: React.FC<LearnedFeatsListProps> = ({
  pc,
  combinedFeats,
  activeFeats,
  totalMax,
  generalFilled,
  generalMax,
  fighterFilled,
  fighterMax,
  wizardFilled,
  wizardMax,
  monkFilled,
  monkMax,
  hasFighter,
  hasWizard,
  hasMonk,
  onFeatClick,
}) => {
  const [learnedSearch, setLearnedSearch] = useState('');

  const getBonusFeatClass = (feat: any) => {
    if (feat.category === 'combat') return 'fighter';
    if (feat.category === 'metamagic' || feat.category === 'item_creation') return 'wizard';
    const monkBonusIds = ['improved_unarmed_strike', 'improved_grapple', 'deflect_arrows', 'snatch_arrows', 'stunning_fist', 'improved_trip', 'improved_overrun'];
    if (monkBonusIds.includes(feat.id)) return 'monk';
    return null;
  };

  const learnedFeatsFiltered = useMemo(() => {
    return combinedFeats.filter((f: any) => {
      const reg = CombatFeats.REGISTRY[f.id];
      const name = (reg?.nameEn || reg?.nameDe) ?? f.id;
      return name.toLowerCase().includes(learnedSearch.toLowerCase().trim());
    });
  }, [combinedFeats, learnedSearch]);

  return (
    <div style={{ flex: '4 1 0%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', borderRight: '0.5px solid var(--pb)', paddingRight: '8px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '11px', color: 'var(--red)', borderBottom: '1px solid var(--pb)', paddingBottom: '2px', margin: '0 0 4px 0', fontWeight: 'bold', textAlign: 'center' }}>
        🧬 Feats ({activeFeats.length} / {totalMax})
      </h3>
      
      <div style={{ fontSize: '8px', fontWeight: 'normal', color: 'var(--inkm)', marginBottom: '6px', display: 'flex', flexDirection: 'column', gap: '2.5px', background: 'rgba(0,0,0,0.01)', border: '0.5px solid rgba(200, 169, 110, 0.2)', padding: '4px 6px', borderRadius: '2px', minWidth: 0, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>General Slots:</span> <strong style={{ color: 'var(--red)' }}>{generalFilled} / {generalMax}</strong></div>
        {fighterMax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Fighter Slots:</span> <strong style={{ color: 'var(--red)' }}>{fighterFilled} / {fighterMax}</strong></div>}
        {wizardMax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Wizard Slots:</span> <strong style={{ color: 'var(--red)' }}>{wizardFilled} / {wizardMax}</strong></div>}
        {monkMax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Monk Slots:</span> <strong style={{ color: 'var(--red)' }}>{monkFilled} / {monkMax}</strong></div>}
      </div>

      <input
        type="text"
        value={learnedSearch}
        onChange={(e) => setLearnedSearch(e.target.value)}
        placeholder="Filter learned feats..."
        className="cinput"
        style={{ height: '18px', fontSize: '9px', padding: '0 4px', marginBottom: '4px', minWidth: 0, width: '100%', boxSizing: 'border-box' }}
      />

      <div className="active-feats-list" style={{ flex: 1, minWidth: 0, width: '100%', overflowY: 'auto', overflowX: 'hidden', maxHeight: '360px', boxSizing: 'border-box' }}>
        {learnedFeatsFiltered.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '15px' }}>
            No feats found.
          </div>
        ) : (
          learnedFeatsFiltered.map((featInst: any, idx: number) => {
            const feat = CombatFeats.REGISTRY[featInst.id];
            if (!feat) return null;
            
            const optionLabel = featInst.option ? ` (${featInst.option})` : '';
            const categoryEn = (({ combat: 'Combat Feat', metamagic: 'Metamagic', item_creation: 'Item Creation', general: 'General' } as Record<string, string>)[feat.category]) || 'General';
            
            const isAutomatic = featInst.isAutomatic;
            const isClassBonus = !isAutomatic && ((getBonusFeatClass(feat) === 'fighter' && hasFighter) ||
                                 (getBonusFeatClass(feat) === 'wizard' && hasWizard) ||
                                 (getBonusFeatClass(feat) === 'monk' && hasMonk));

            const borderStyle = '0.5px solid rgba(50, 115, 55, 0.35)';
            const borderLeftStyle = isAutomatic ? '3.5px solid #4a6d44' : '3.5px solid #2e7d32';
            const backgroundVal = isAutomatic ? 'rgba(70, 105, 65, 0.05)' : 'rgba(50, 115, 55, 0.06)';
            const hoverBackgroundVal = isAutomatic ? 'rgba(70, 105, 65, 0.09)' : 'rgba(50, 115, 55, 0.11)';

            const prereqsResult = checkPrerequisites(feat, pc);

            return (
              <div
                key={featInst.id + '_' + idx}
                className="active-feat-card"
                onClick={(e) => onFeatClick(feat, true, featInst.option, e)}
                style={{
                  padding: '6px 8px',
                  marginBottom: '4px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  transition: 'transform 0.15s, background-color 0.15s',
                  border: borderStyle,
                  borderLeft: borderLeftStyle,
                  background: backgroundVal,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = hoverBackgroundVal;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = backgroundVal;
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0, gap: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-title)', fontSize: '9.5px', fontWeight: 'bold', color: '#245e28', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                    {feat.nameEn || feat.nameDe}{optionLabel}
                    {!prereqsResult.met && (
                      <span style={{ color: 'var(--red)', marginLeft: '3px', fontSize: '8px' }} title={`Prerequisites not met!\n` + prereqsResult.details.map((d: any) => `${d.met ? '✓' : '✗'} ${d.desc}`).join('\n')}>
                        ⚠️
                      </span>
                    )}
                  </span>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                    {isAutomatic && (
                      <span style={{ fontSize: '7px', color: '#4a6d44', background: 'rgba(70, 105, 65, 0.12)', border: '0.5px solid rgba(70, 105, 65, 0.3)', padding: '0 4px', borderRadius: '1px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {featInst.source || 'Class Feat'}
                      </span>
                    )}
                    {isClassBonus && (
                      <span style={{ fontSize: '7px', color: '#245e28', background: 'rgba(50, 115, 55, 0.12)', border: '0.5px solid rgba(50, 115, 55, 0.3)', padding: '0 4px', borderRadius: '1px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        Bonus Feat
                      </span>
                    )}
                    <span style={{ fontSize: '7px', color: 'var(--inkm)', background: 'rgba(0,0,0,0.05)', padding: '0 4px', borderRadius: '1px', whiteSpace: 'nowrap' }}>{categoryEn}</span>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '8.5px', color: 'var(--inkm)', lineHeight: 1.25, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0 }} title={feat.benefitRaw || feat.benefitEn || feat.benefitDe}>
                  {feat.benefitRaw || feat.benefitEn || feat.benefitDe}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
