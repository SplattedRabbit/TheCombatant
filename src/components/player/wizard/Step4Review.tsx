/**
 * @module    Step4Review
 * @summary   Final review screen of the Character Wizard before saving and applying character data.
 */

import React from 'react';
import { CombatFeats } from '@core/data/feats-data.js';
import { showAttributeExplanation } from '../attributeHelper';
import { RACES, CLASSES_LIST } from './constants';

interface Step4ReviewProps {
  name: string;
  selectedRace: string;
  alignmentEthical: string;
  alignmentMoral: string;
  targetLevel: number;
  isTargetLevelSet: boolean;
  currentDraft: any;
  levelConfigs: any[];
}

export const Step4Review: React.FC<Step4ReviewProps> = ({
  name,
  selectedRace,
  alignmentEthical,
  alignmentMoral,
  targetLevel,
  isTargetLevelSet,
  currentDraft,
  levelConfigs,
}) => {
  const conMod = currentDraft ? currentDraft.statMods.con : 0;
  const totalHPRolls = levelConfigs.reduce((sum, cfg) => sum + (parseInt(cfg.hpRoll) || 0), 0);
  const finalMaxHP = levelConfigs.reduce((sum, cfg) => sum + Math.max(1, (parseInt(cfg.hpRoll) || 0) + conMod), 0);

  return (
    <div style={{ textAlign: 'left', marginTop: '10px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', marginBottom: '20px', color: 'var(--inkm)' }}>
        Review the details of your new character here. Clicking **Create &amp; Save** will transfer the data to your active sheet.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Core Information Card */}
        <div style={{ padding: '16px', border: '1px solid var(--pb)', background: 'rgba(244,232,193,0.3)', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--red)', fontSize: '14px', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3px' }}>
            Identity &amp; Health
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            <div><strong>Name:</strong> {name}</div>
            <div><strong>Race:</strong> {RACES.find(r => r.key === selectedRace)?.name}</div>
            <div>
              <strong>Alignment:</strong>{' '}
              {alignmentEthical === 'Neutral' && alignmentMoral === 'Neutral'
                ? 'Neutral'
                : `${alignmentEthical} ${alignmentMoral}`}
            </div>
            <div>
              <strong>Class Combination:</strong>{' '}
              {isTargetLevelSet && currentDraft && currentDraft.classesList
                .map((c: any) => {
                  const matched = CLASSES_LIST.find(x => x.key === c.classType);
                  const cleanName = matched ? matched.name : c.classType
                    .split('_')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  return `${cleanName} ${c.level}`;
                })
                .join(' / ')}
            </div>
            <div><strong>Target Level:</strong> {targetLevel}</div>
            <div>
              <strong>Hit Points (HP):</strong> {finalMaxHP} (Base {totalHPRolls} + {conMod * targetLevel} Con modifier)
            </div>
            <div>
              <strong>Base Attack Bonus (BAB):</strong> +{isTargetLevelSet && currentDraft && currentDraft.babVal}
            </div>
          </div>
        </div>

        {/* Attributes Card */}
        <div style={{ padding: '16px', border: '1px solid var(--pb)', background: 'rgba(244,232,193,0.3)', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--red)', fontSize: '14px', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3px' }}>
            Final Ability Scores
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(k => {
              const labelMap = { str: 'Strength (STR)', dex: 'Dexterity (DEX)', con: 'Constitution (CON)', int: 'Intelligence (INT)', wis: 'Wisdom (WIS)', cha: 'Charisma (CHA)' };
              const finalVal = isTargetLevelSet && currentDraft ? currentDraft.stats[k] : 10;
              const finalM = isTargetLevelSet && currentDraft ? currentDraft.statMods[k] : 0;
              
              return (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.4)', paddingBottom: '3px' }}>
                  <span 
                    style={{ 
                      cursor: 'pointer', 
                      borderBottom: '1px dashed var(--red)'
                    }}
                    onClick={() => showAttributeExplanation(k)}
                    title="Click for a brief explanation"
                  >
                    {labelMap[k].split(' ')[0]}:
                  </span>
                  <strong style={{ color: 'var(--red)' }}>
                    {finalVal} ({finalM >= 0 ? `+${finalM}` : finalM})
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feats summary */}
      <div style={{ padding: '16px', border: '1px solid var(--pb)', background: 'rgba(244,232,193,0.3)', borderRadius: '4px', marginTop: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: 'var(--red)', fontSize: '14px', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3px' }}>
          Selected Feats
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {levelConfigs.flatMap((cfg, idx) => 
            Array.isArray(cfg.feats) ? cfg.feats.map((fid: any, fIdx: number) => {
              const feat = CombatFeats.REGISTRY[fid];
              if (!feat) return null;
              return (
                <div 
                  key={`${idx}-${fIdx}`} 
                  style={{ padding: '3px 8px', background: 'rgba(139,26,26,0.06)', border: '1px solid var(--pb)', borderRadius: '3px', fontSize: '11px' }}
                  title={feat.benefitRaw || feat.benefitDe}
                >
                  {feat.nameEn || feat.nameDe}
                </div>
              );
            }) : []
          ).filter(Boolean)}
        </div>
      </div>
    </div>
  );
};
