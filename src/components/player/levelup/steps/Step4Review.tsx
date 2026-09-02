/**
 * @module    Step4Review
 * @summary   Step 4 of the Level-Up Wizard: Review summary of all chosen level advancement upgrades.
 */

import React from 'react';
import { CombatFeats } from '@core/data/feats-data.js';
import { SKILLS_REGISTRY } from '@core/data/skills-data.js';
import { SKILL_TRICKS_REGISTRY } from '@core/data/skillTricks-data.js';
import { getACF } from '@core/data/acf-data.js';
import { CLASSES_LIST } from '../../wizard/constants';

export interface Step4ReviewProps {
  currentConfig: any;
  targetLevel: number;
  prevDraft?: any;
  currentDraft: any;
  completedDraft: any;
  currentLevelRemainingSkillPoints: number;
}

export const Step4Review: React.FC<Step4ReviewProps> = ({
  currentConfig,
  targetLevel,
  currentDraft,
  completedDraft,
  currentLevelRemainingSkillPoints,
}) => {
  const conMod = completedDraft?.statMods?.con ?? currentDraft?.statMods?.con ?? 0;
  const gainedHp = Math.max(1, (parseInt(currentConfig.hpRoll) || 1) + conMod);

  const clsDef = CLASSES_LIST.find((c: any) => c.key === currentConfig.classType);
  const className = clsDef ? (clsDef.name || clsDef.key) : (currentConfig.classType ? currentConfig.classType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'No class selected');
  const classLvlEntry = (completedDraft?.classes || completedDraft?.classesList || []).find((c: any) => c.classType === currentConfig.classType);
  const classDisplay = classLvlEntry ? `${className} (Level ${classLvlEntry.level})` : className;

  const allocatedSkills = Object.entries(currentConfig.skills || {})
    .filter(([_, pts]) => (parseInt(pts as any) || 0) > 0)
    .map(([key, pts]) => {
      const def = (SKILLS_REGISTRY as any)[key];
      return {
        key,
        name: def?.nameEn || def?.nameDe || key,
        points: String(pts),
      };
    });

  const chosenFeats = (currentConfig.feats || []).map((fid: string) => {
    const feat = (CombatFeats.REGISTRY as any)[fid];
    return feat ? (feat.nameEn || feat.nameDe || fid) : fid;
  });

  const chosenSkillTricks = (currentConfig.skillTricks || []).map((tKey: string) => {
    const trick = (SKILL_TRICKS_REGISTRY as any)[tKey];
    return trick ? (trick.nameEn || trick.nameDe || trick.name || tKey) : tKey;
  });

  const chosenACFs = (currentConfig.acfs || []).map((aId: string) => {
    const acf = getACF(aId);
    return acf ? (acf.name || acf.nameEn || acf.nameDe || aId) : aId;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'rgba(200, 169, 110, 0.12)',
        border: '1px solid rgba(200, 169, 110, 0.5)',
        borderRadius: '6px',
        padding: '16px 20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        textAlign: 'left',
      }}
    >
      <div style={{ borderBottom: '1.5px solid var(--pb)', paddingBottom: '6px' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '15px', color: 'var(--red)' }}>
          📜 Review Level {targetLevel} Advancement
        </h3>
        <div style={{ fontSize: '11px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>
          Please verify your chosen options before applying them to your character sheet.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Left Column: Core Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ background: 'rgba(200, 169, 110, 0.12)', padding: '8px 10px', borderRadius: '4px', border: '0.5px solid var(--pb)' }}>
            <span style={{ fontSize: '10px', color: 'var(--inkl)', textTransform: 'uppercase', display: 'block' }}>Class Advancement</span>
            <strong style={{ fontSize: '13px', color: 'var(--red)' }}>
              {classDisplay}
            </strong>
          </div>

          <div style={{ background: 'rgba(200, 169, 110, 0.12)', padding: '8px 10px', borderRadius: '4px', border: '0.5px solid var(--pb)' }}>
            <span style={{ fontSize: '10px', color: 'var(--inkl)', textTransform: 'uppercase', display: 'block' }}>Hit Points (HP)</span>
            <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
              +{gainedHp} HP <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--inkl)' }}>(Roll {currentConfig.hpRoll} + {conMod} CON)</span>
            </strong>
          </div>

          {currentConfig.abilityIncrease && (
            <div style={{ background: 'rgba(139, 26, 26, 0.08)', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(139, 26, 26, 0.25)' }}>
              <span style={{ fontSize: '10px', color: 'var(--red)', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>Ability Milestone (+1)</span>
              <strong style={{ fontSize: '13px', color: 'var(--red)' }}>
                +{currentConfig.abilityIncrease.toUpperCase()}
              </strong>
            </div>
          )}

          <div style={{ background: 'rgba(200, 169, 110, 0.12)', padding: '8px 10px', borderRadius: '4px', border: '0.5px solid var(--pb)' }}>
            <span style={{ fontSize: '10px', color: 'var(--inkl)', textTransform: 'uppercase', display: 'block' }}>Combat Stats Preview</span>
            <div style={{ fontSize: '12px', marginTop: '2px' }}>
              BAB: <strong>+{completedDraft?.bab ?? currentDraft?.bab ?? 0}</strong> • Fort: <strong>+{completedDraft?.saves?.fort ?? 0}</strong> • Ref: <strong>+{completedDraft?.saves?.ref ?? 0}</strong> • Will: <strong>+{completedDraft?.saves?.will ?? 0}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Skills & Feats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Allocated Skills */}
          <div style={{ background: 'rgba(200, 169, 110, 0.12)', padding: '8px 10px', borderRadius: '4px', border: '0.5px solid var(--pb)', flex: 1 }}>
            <span style={{ fontSize: '10px', color: 'var(--inkl)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Allocated Skills ({allocatedSkills.length})
            </span>
            {allocatedSkills.length === 0 ? (
              <span style={{ fontSize: '11px', color: 'var(--inkl)', fontStyle: 'italic' }}>No skill points allocated on this level.</span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {allocatedSkills.map((sk) => (
                  <span
                    key={sk.key}
                    style={{
                      fontSize: '11px',
                      background: 'rgba(200, 169, 110, 0.22)',
                      border: '0.5px solid var(--pb)',
                      padding: '1px 6px',
                      borderRadius: '3px',
                    }}
                  >
                    {sk.name}: <strong>+{sk.points}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Skill Tricks */}
          {chosenSkillTricks.length > 0 && (
            <div style={{ background: 'rgba(200, 169, 110, 0.12)', padding: '8px 10px', borderRadius: '4px', border: '0.5px solid var(--pb)' }}>
              <span style={{ fontSize: '10px', color: 'var(--inkl)', textTransform: 'uppercase', display: 'block' }}>Skill Tricks</span>
              <strong style={{ fontSize: '12px', color: 'var(--ink)' }}>
                {chosenSkillTricks.join(', ')}
              </strong>
            </div>
          )}

          {/* Feats */}
          {chosenFeats.length > 0 && (
            <div style={{ background: 'rgba(200, 169, 110, 0.12)', padding: '8px 10px', borderRadius: '4px', border: '0.5px solid var(--pb)' }}>
              <span style={{ fontSize: '10px', color: 'var(--inkl)', textTransform: 'uppercase', display: 'block' }}>New Feats</span>
              <strong style={{ fontSize: '12px', color: 'var(--red)' }}>
                {chosenFeats.join(', ')}
              </strong>
            </div>
          )}

          {/* ACFs */}
          {chosenACFs.length > 0 && (
            <div style={{ background: 'rgba(200, 169, 110, 0.12)', padding: '8px 10px', borderRadius: '4px', border: '0.5px solid var(--pb)' }}>
              <span style={{ fontSize: '10px', color: 'var(--inkl)', textTransform: 'uppercase', display: 'block' }}>Alternative Class Features (ACFs)</span>
              <strong style={{ fontSize: '12px', color: 'var(--ink)' }}>
                {chosenACFs.join(', ')}
              </strong>
            </div>
          )}

          {/* Unspent SP Warning */}
          {currentLevelRemainingSkillPoints > 0 && (
            <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid #f59e0b', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', color: '#b45309' }}>
              ⚠️ You have <strong>{currentLevelRemainingSkillPoints}</strong> unspent skill point{currentLevelRemainingSkillPoints > 1 ? 's' : ''}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
