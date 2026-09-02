/**
 * @module    Step1ClassAndStats
 * @summary   Step 1 of the Level-Up Wizard: Class selection, Ability Score Increase milestone, and Hit Die HP roll.
 */

import React, { useState } from 'react';
import { CLASSES_LIST } from '../../wizard/constants';
import { CombatRules, validatePrestigeClassPrereqs, isOnlySpecialTextUnmet } from '@core/rules.js';
import { showCustomAlert, showCustomConfirm } from '@core/ui/components/dialogs.js';
import { PrestigeSpellLinkSection } from '../../wizard/levelConfig/PrestigeSpellLinkSection';

export interface Step1ClassAndStatsProps {
  currentConfig: any;
  currentLevelIndex: number;
  targetLevel: number;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
  getClassHitDie: (cls: string) => number;
  currentDraft: any;
  prevDraft: any;
  completedDraft: any;
  levelConfigs: any[];
}

export const Step1ClassAndStats: React.FC<Step1ClassAndStatsProps> = ({
  currentConfig,
  currentLevelIndex,
  targetLevel,
  updateLevelConfig,
  getClassHitDie,
  currentDraft,
  prevDraft,
  completedDraft,
  levelConfigs,
}) => {
  const [sourceTab, setSourceTab] = useState<'all' | 'phb' | 'phb2' | 'ca' | 'prestige'>('all');

  const filteredClasses = CLASSES_LIST.filter((c) => {
    if (sourceTab === 'prestige' && !c.isPrestige) return false;
    if (sourceTab === 'phb' && (c.isPrestige || (c as any).source !== 'phb')) return false;
    if (sourceTab === 'phb2' && (c.isPrestige || (c as any).source !== 'phb2')) return false;
    if (sourceTab === 'ca' && (c.isPrestige || (c as any).source !== 'ca')) return false;
    return true;
  });

  const isAbilityMilestone = targetLevel % 4 === 0;
  const currentHitDie = getClassHitDie(currentConfig.classType);

  const conMod = completedDraft?.statMods?.con ?? currentDraft?.statMods?.con ?? 0;
  const currentRoll = parseInt(currentConfig.hpRoll) || 0;
  const gainedHp = Math.max(1, currentRoll + conMod);

  const handleClassChange = (newClsKey: string) => {
    const clsDef = CLASSES_LIST.find((c) => c.key === newClsKey);
    if (!clsDef) return;

    if (clsDef.isPrestige && currentDraft?.draftPC) {
      const validation = validatePrestigeClassPrereqs(currentDraft.draftPC, newClsKey);
      if (!validation.success) {
        const lines = (validation.metDetails || [])
          .map((req: any) => {
            const color = req.met ? '#2e7d32' : '#d32f2f';
            return `<div style="color: ${color}; margin-bottom: 8px;"><strong>${req.label}</strong><br/>[Current: ${req.current} / Required: ${req.required}]</div>`;
          })
          .join('');

        if (isOnlySpecialTextUnmet(validation)) {
          showCustomConfirm(
            `Prerequisites for ${clsDef.nameEn || clsDef.nameDe}`,
            `<div style="text-align: left; max-height: 250px; overflow-y: auto;"><p style="margin-bottom: 10px; color: var(--ink);">Prerequisites are met except for special condition:</p>${lines}<p style="margin-top: 10px; color: var(--ink);">Do you confirm this condition is met?</p></div>`,
            () => {
              updateLevelConfig(currentLevelIndex, 'classType', newClsKey);
            }
          );
        } else {
          showCustomAlert(
            `Prerequisites for ${clsDef.nameEn || clsDef.nameDe}`,
            `<div style="text-align: left; max-height: 250px; overflow-y: auto;"><p style="margin-bottom: 10px; color: var(--ink);">You do not yet meet the prerequisites for this prestige class:</p>${lines}</div>`,
            'OK',
            '🔒'
          );
        }
        return;
      }
    }

    updateLevelConfig(currentLevelIndex, 'classType', newClsKey);
    if (!currentConfig.hpRoll || currentConfig.hpRoll === 0) {
      updateLevelConfig(currentLevelIndex, 'hpRoll', Math.ceil(clsDef.hitDie / 2) + 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
      {/* 1. Class Selection Card */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.65)',
          border: '1px solid rgba(200, 169, 110, 0.5)',
          borderRadius: '6px',
          padding: '12px 14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(200,169,110,0.3)', paddingBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '13px', color: 'var(--red)', fontWeight: 'bold' }}>
            ⚔️ Step 1.1: Choose Class for Level {targetLevel}
          </span>
          <div style={{ display: 'flex', gap: '3px' }}>
            {(['all', 'phb', 'phb2', 'ca', 'prestige'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSourceTab(tab)}
                style={{
                  fontSize: '9.5px',
                  padding: '2px 7px',
                  borderRadius: '3px',
                  border: '1px solid var(--pb)',
                  fontFamily: 'var(--font-body)',
                  background: sourceTab === tab ? 'var(--red)' : 'rgba(200, 169, 110, 0.1)',
                  color: sourceTab === tab ? '#ffffff' : 'var(--inkm)',
                  fontWeight: sourceTab === tab ? 'bold' : 'normal',
                  cursor: 'pointer',
                }}
              >
                {tab === 'all' ? 'All' : tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <select
          value={currentConfig.classType || ''}
          onChange={(e) => handleClassChange(e.target.value)}
          className="cinput"
          style={{ width: '100%', height: '28px', fontSize: '12px', fontWeight: 600, padding: '2px 8px', cursor: 'pointer' }}
        >
          <option value="" disabled>-- Select a class --</option>
          {filteredClasses.map((cls) => {
            const isPrestige = cls.isPrestige;
            const badge = cls.source && cls.source !== 'phb' ? ` [${cls.source.toUpperCase()}]` : '';
            return (
              <option key={cls.key} value={cls.key}>
                {isPrestige ? '⭐ ' : ''}{cls.nameEn || cls.nameDe} (d{cls.hitDie}){badge}
              </option>
            );
          })}
        </select>

        {/* Prestige Spell Link */}
        <PrestigeSpellLinkSection
          currentConfig={currentConfig}
          currentDraft={currentDraft}
          currentLevelIndex={currentLevelIndex}
          updateLevelConfig={updateLevelConfig}
        />
      </div>

      {/* 2. Ability Score Increase Card (if Milestone) */}
      {isAbilityMilestone && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(139, 26, 26, 0.06), rgba(200, 169, 110, 0.12))',
            border: '1.5px solid var(--red)',
            borderRadius: '6px',
            padding: '12px 14px',
            boxShadow: '0 2px 6px rgba(139, 26, 26, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '13px', color: 'var(--red)', fontWeight: 'bold' }}>
              ✨ Step 1.2: Ability Score Increase (Level {targetLevel} Milestone)
            </span>
            <span style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 'bold' }}>
              +1 Point Available
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--inkm)', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>
            Choose one ability score to permanently increase by +1. This will immediately update your modifiers, HP and skill points.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((stat) => {
              const isSelected = currentConfig.abilityIncrease === stat;
              const baseVal = completedDraft?.stats?.[stat] ?? currentDraft?.stats?.[stat] ?? 10;
              const curMod = Math.floor((baseVal - 10) / 2);
              return (
                <button
                  key={stat}
                  type="button"
                  onClick={() => updateLevelConfig(currentLevelIndex, 'abilityIncrease', stat)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '4px',
                    border: isSelected ? '1.5px solid var(--red)' : '1px solid var(--pb)',
                    background: isSelected ? 'linear-gradient(135deg, #8b1a1a, #661010)' : 'rgba(255,255,255,0.85)',
                    color: isSelected ? '#ffffff' : 'var(--ink)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold' }}>
                    {stat.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                    {baseVal}
                  </span>
                  <span style={{ fontSize: '9.5px', opacity: 0.85 }}>
                    ({curMod >= 0 ? `+${curMod}` : curMod})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Hit Die HP Roll Card */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.65)',
          border: '1px solid rgba(200, 169, 110, 0.5)',
          borderRadius: '6px',
          padding: '12px 14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-title)', fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
          🎲 Step 1.3: Hit Die HP Roll (d{currentHitDie})
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--inkm)' }}>Roll (1..{currentHitDie}):</label>
            <input
              type="number"
              min={1}
              max={currentHitDie}
              value={currentConfig.hpRoll || ''}
              onChange={(e) => {
                const val = Math.max(1, Math.min(currentHitDie, parseInt(e.target.value) || 1));
                updateLevelConfig(currentLevelIndex, 'hpRoll', val);
              }}
              className="cinput"
              style={{ width: '56px', height: '26px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => updateLevelConfig(currentLevelIndex, 'hpRoll', currentHitDie)}
              className="btn"
              style={{ fontSize: '10px', padding: '3px 8px', fontFamily: 'var(--font-body)' }}
              title="Set to Maximum Die Roll"
            >
              Max ({currentHitDie})
            </button>
            <button
              type="button"
              onClick={() => updateLevelConfig(currentLevelIndex, 'hpRoll', Math.ceil(currentHitDie / 2) + 1)}
              className="btn"
              style={{ fontSize: '10px', padding: '3px 8px', fontFamily: 'var(--font-body)' }}
              title="Set to Average Die Roll"
            >
              Avg ({Math.ceil(currentHitDie / 2) + 1})
            </button>
          </div>

          <div style={{ marginLeft: 'auto', background: 'rgba(200, 169, 110, 0.15)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--pb)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Gain:</span>
            <strong style={{ color: 'var(--red)', fontSize: '13px' }}>+{gainedHp} HP</strong>
            <span style={{ fontSize: '9.5px', color: 'var(--inkl)' }}>
              ({currentRoll} roll + {conMod >= 0 ? `+${conMod}` : conMod} CON)
            </span>
          </div>
        </div>
      </div>

      {/* 4. Live Progression Summary Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          background: 'rgba(200, 169, 110, 0.12)',
          border: '1px solid var(--pb)',
          borderRadius: '6px',
          padding: '8px 12px',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '9.5px', color: 'var(--inkl)', textTransform: 'uppercase' }}>Target Level</div>
          <strong style={{ fontSize: '13px', color: 'var(--red)' }}>Level {targetLevel}</strong>
        </div>
        <div>
          <div style={{ fontSize: '9.5px', color: 'var(--inkl)', textTransform: 'uppercase' }}>Total HP</div>
          <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{completedDraft?.hp ?? (prevDraft?.hp ? prevDraft.hp + gainedHp : '--')}</strong>
        </div>
        <div>
          <div style={{ fontSize: '9.5px', color: 'var(--inkl)', textTransform: 'uppercase' }}>BAB</div>
          <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>+{completedDraft?.bab ?? currentDraft?.bab ?? 0}</strong>
        </div>
        <div>
          <div style={{ fontSize: '9.5px', color: 'var(--inkl)', textTransform: 'uppercase' }}>Saves (F/R/W)</div>
          <strong style={{ fontSize: '12px', color: 'var(--ink)' }}>
            +{completedDraft?.saves?.fort ?? currentDraft?.saves?.fort ?? 0} / +{completedDraft?.saves?.ref ?? currentDraft?.saves?.ref ?? 0} / +{completedDraft?.saves?.will ?? currentDraft?.saves?.will ?? 0}
          </strong>
        </div>
      </div>
    </div>
  );
};
