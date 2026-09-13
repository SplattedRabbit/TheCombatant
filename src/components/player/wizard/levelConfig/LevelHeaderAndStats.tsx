/**
 * @module    LevelHeaderAndStats
 * @summary   Level Timeline Bar, Class Selector, HP input, Ability Increase, and Current Attributes preview card.
 */

import React from 'react';
import { PrestigeSpellLinkSection } from './PrestigeSpellLinkSection';
import { ClassSelector } from './ClassSelector';
import { CLASS_KEY_ATTRIBUTES } from '../constants';
import { getAblMod } from '../../attributeHelper';
import { DRAGON_TOTEMS, isTotemAllowedForAlignment } from '@core/rules/data/dragonTotems.js';

const PROHIBITED_SCHOOLS = [
  { value: 'abj', label: 'Abjuration' },
  { value: 'con', label: 'Conjuration' },
  { value: 'enc', label: 'Enchantment' },
  { value: 'evo', label: 'Evocation' },
  { value: 'ill', label: 'Illusion' },
  { value: 'nec', label: 'Necromancy' },
  { value: 'tra', label: 'Transmutation' },
];

export interface LevelHeaderAndStatsProps {
  currentLevelIndex: number;
  currentConfig: any;
  currentDraft: any;
  prevDraft: any;
  completedDraft: any;
  getClassHitDie: (cls: string) => number;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
  allLevelConfigs?: any[];
  alignmentEthical?: string;
  setAlignmentEthical?: (val: string) => void;
  alignmentMoral?: string;
  setAlignmentMoral?: (val: string) => void;
}

export const LevelHeaderAndStats: React.FC<LevelHeaderAndStatsProps> = ({
  currentLevelIndex,
  currentConfig,
  currentDraft,
  prevDraft,
  completedDraft,
  getClassHitDie,
  updateLevelConfig,
  allLevelConfigs = [],
  alignmentEthical,
  setAlignmentEthical,
  alignmentMoral,
  setAlignmentMoral,
}) => {
  // Auto-sync Wizard school specialization across Wizard levels
  React.useEffect(() => {
    if (currentConfig?.classType === 'wizard') {
      const firstWizardConfig = allLevelConfigs.find(
        (c) => c.classType === 'wizard' && c.wizardSpecialization !== undefined
      );
      if (firstWizardConfig && currentConfig.wizardSpecialization === undefined) {
        updateLevelConfig(currentLevelIndex, 'wizardSpecialization', firstWizardConfig.wizardSpecialization);
        updateLevelConfig(currentLevelIndex, 'wizardProhibited1', firstWizardConfig.wizardProhibited1 || '');
        updateLevelConfig(currentLevelIndex, 'wizardProhibited2', firstWizardConfig.wizardProhibited2 || '');
      }
    } else if (currentConfig?.classType === 'dragon_shaman') {
      const firstDSConfig = allLevelConfigs.find(
        (c) => c.classType === 'dragon_shaman' && c.dragonTotem !== undefined
      );
      if (firstDSConfig && currentConfig.dragonTotem === undefined) {
        updateLevelConfig(currentLevelIndex, 'dragonTotem', firstDSConfig.dragonTotem);
      }
    }
  }, [currentConfig?.classType, currentLevelIndex, allLevelConfigs]);

  const getAlignmentAbbr = (eth?: string, mor?: string) => {
    const e = (eth || 'Neutral').toLowerCase();
    const m = (mor || 'Neutral').toLowerCase();
    if (e === 'neutral' && m === 'neutral') return 'N';
    const eLetter = e === 'lawful' ? 'L' : (e === 'chaotic' ? 'C' : 'N');
    const mLetter = m === 'good' ? 'G' : (m === 'evil' ? 'E' : 'N');
    return `${eLetter}${mLetter}`;
  };

  const ALIGNMENT_MAP: Record<string, { ethical: string; moral: string; label: string }> = {
    LG: { ethical: 'Lawful', moral: 'Good', label: 'Lawful Good' },
    LN: { ethical: 'Lawful', moral: 'Neutral', label: 'Lawful Neutral' },
    LE: { ethical: 'Lawful', moral: 'Evil', label: 'Lawful Evil' },
    NG: { ethical: 'Neutral', moral: 'Good', label: 'Neutral Good' },
    N:  { ethical: 'Neutral', moral: 'Neutral', label: 'True Neutral' },
    NE: { ethical: 'Neutral', moral: 'Evil', label: 'Neutral Evil' },
    CG: { ethical: 'Chaotic', moral: 'Good', label: 'Chaotic Good' },
    CN: { ethical: 'Chaotic', moral: 'Neutral', label: 'Chaotic Neutral' },
    CE: { ethical: 'Chaotic', moral: 'Evil', label: 'Chaotic Evil' },
  };

  const currentAlignmentAbbr = getAlignmentAbbr(alignmentEthical, alignmentMoral);
  const isCurrentTrueNeutral = currentAlignmentAbbr === 'N';

  const selectedTotem = currentConfig.dragonTotem ? DRAGON_TOTEMS[currentConfig.dragonTotem] : null;
  const isSelectedTotemAllowed = selectedTotem
    ? (!isCurrentTrueNeutral && isTotemAllowedForAlignment(currentConfig.dragonTotem, currentAlignmentAbbr))
    : true;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0, width: '100%' }}>
      <ClassSelector
        currentLevelIndex={currentLevelIndex}
        currentConfig={currentConfig}
        prevDraft={prevDraft}
        completedDraft={completedDraft}
        getClassHitDie={getClassHitDie}
        updateLevelConfig={updateLevelConfig}
      />

      {/* Linked Spellcaster selection for Prestige Classes */}
      <PrestigeSpellLinkSection
        currentConfig={currentConfig}
        currentDraft={currentDraft}
        currentLevelIndex={currentLevelIndex}
        updateLevelConfig={updateLevelConfig}
      />

      {/* Wizard School Specialization (Mandatory on Level 1 / Wizard builds) */}
      {currentConfig.classType === 'wizard' && (
        <div
          style={{
            padding: '8px 10px',
            borderRadius: '3px',
            border: '1px solid var(--pb)',
            background: 'rgba(200, 169, 110, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginTop: '2px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>
              🎭 Wizard School Specialization
            </span>
            <span style={{ fontSize: '8.5px', color: 'var(--inkm)' }}>
              {currentConfig.wizardSpecialization && currentConfig.wizardSpecialization !== 'none'
                ? '+1 Slot/Lvl (Specialist)'
                : 'Universalist'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>School:</span>
            <select
              value={currentConfig.wizardSpecialization || 'none'}
              onChange={(e) => {
                const val = e.target.value;
                updateLevelConfig(currentLevelIndex, 'wizardSpecialization', val);
                allLevelConfigs.forEach((cfg, idx) => {
                  if (cfg.classType === 'wizard') {
                    updateLevelConfig(idx, 'wizardSpecialization', val);
                  }
                });
              }}
              className="cinput"
              style={{ width: '140px', fontSize: '10px', height: '22px', padding: '0 4px', boxSizing: 'border-box' }}
            >
              <option value="none">Universalist (No School)</option>
              <option value="abj">Abjuration</option>
              <option value="con">Conjuration</option>
              <option value="div">Divination</option>
              <option value="enc">Enchantment</option>
              <option value="evo">Evocation</option>
              <option value="ill">Illusion</option>
              <option value="nec">Necromancy</option>
              <option value="tra">Transmutation</option>
            </select>
          </div>

          {currentConfig.wizardSpecialization && currentConfig.wizardSpecialization !== 'none' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9.5px' }}>
                <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>Prohibited 1:</span>
                <select
                  value={currentConfig.wizardProhibited1 || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateLevelConfig(currentLevelIndex, 'wizardProhibited1', val);
                    allLevelConfigs.forEach((cfg, idx) => {
                      if (cfg.classType === 'wizard') {
                        updateLevelConfig(idx, 'wizardProhibited1', val);
                      }
                    });
                  }}
                  className="cinput"
                  style={{ width: '120px', fontSize: '9.5px', height: '20px', padding: '0 4px', boxSizing: 'border-box' }}
                >
                  <option value="" disabled>-- Select School --</option>
                  {PROHIBITED_SCHOOLS
                    .filter((s) => s.value !== currentConfig.wizardSpecialization && s.value !== currentConfig.wizardProhibited2)
                    .map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
              </div>

              {currentConfig.wizardSpecialization !== 'div' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9.5px' }}>
                  <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>Prohibited 2:</span>
                  <select
                    value={currentConfig.wizardProhibited2 || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateLevelConfig(currentLevelIndex, 'wizardProhibited2', val);
                      allLevelConfigs.forEach((cfg, idx) => {
                        if (cfg.classType === 'wizard') {
                          updateLevelConfig(idx, 'wizardProhibited2', val);
                        }
                      });
                    }}
                    className="cinput"
                    style={{ width: '120px', fontSize: '9.5px', height: '20px', padding: '0 4px', boxSizing: 'border-box' }}
                  >
                    <option value="" disabled>-- Select School --</option>
                    {PROHIBITED_SCHOOLS
                      .filter((s) => s.value !== currentConfig.wizardSpecialization && s.value !== currentConfig.wizardProhibited1)
                      .map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dragon Shaman Totem Dragon Selection */}
      {currentConfig.classType === 'dragon_shaman' && (
        <div
          style={{
            padding: '8px 10px',
            borderRadius: '3px',
            border: '1px solid var(--pb)',
            background: 'rgba(200, 169, 110, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginTop: '2px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>
              Totem Dragon Selection
            </span>
            <span style={{ fontSize: '8.5px', color: isCurrentTrueNeutral || !isSelectedTotemAllowed ? 'var(--red)' : 'var(--inkm)' }}>
              Alignment: <strong>{ALIGNMENT_MAP[currentAlignmentAbbr]?.label || currentAlignmentAbbr}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Totem:</span>
            <select
              value={currentConfig.dragonTotem || ''}
              onChange={(e) => {
                const newTotem = e.target.value;
                updateLevelConfig(currentLevelIndex, 'dragonTotem', newTotem);
                allLevelConfigs.forEach((cfg, idx) => {
                  if (cfg.classType === 'dragon_shaman') {
                    updateLevelConfig(idx, 'dragonTotem', newTotem);
                  }
                });
              }}
              className="cinput"
              style={{ width: '170px', fontSize: '10px', height: '22px', padding: '0 4px', boxSizing: 'border-box' }}
            >
              <option value="" disabled>-- Select Totem Dragon --</option>
              {Object.values(DRAGON_TOTEMS).map((totem: any) => {
                const isMatch = !isCurrentTrueNeutral && isTotemAllowedForAlignment(totem.id, currentAlignmentAbbr);
                return (
                  <option key={totem.id} value={totem.id}>
                    {totem.name} ({totem.energy.toUpperCase()}, {totem.alignments.join('/')}) {!isMatch ? '⚠️' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Inline Alignment Quick-Sync Box if incompatible or True Neutral */}
          {selectedTotem && !isSelectedTotemAllowed && (
            <div
              style={{
                padding: '6px 8px',
                background: 'rgba(211, 47, 47, 0.08)',
                border: '1px solid var(--red)',
                borderRadius: '3px',
                fontSize: '9.5px',
                lineHeight: 1.35,
              }}
            >
              <div style={{ color: 'var(--red)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>⚠️</span>
                <span>
                  {isCurrentTrueNeutral
                    ? 'True Neutral characters cannot be Dragon Shamans (PHB2 p. 11).'
                    : `Alignment Mismatch: ${selectedTotem.name} requires ${selectedTotem.alignments.join(' or ')} (Current: ${ALIGNMENT_MAP[currentAlignmentAbbr]?.label || currentAlignmentAbbr}).`}
                </span>
              </div>
              <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '9px', color: 'var(--inkm)', fontWeight: 'bold' }}>Quick-Sync Alignment:</span>
                {selectedTotem.alignments.map((code: string) => {
                  const def = ALIGNMENT_MAP[code];
                  if (!def) return null;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        if (setAlignmentEthical) setAlignmentEthical(def.ethical);
                        if (setAlignmentMoral) setAlignmentMoral(def.moral);
                      }}
                      className="btn"
                      style={{
                        fontSize: '8.5px',
                        padding: '2px 6px',
                        background: 'var(--card-bg)',
                        border: '0.5px solid var(--red)',
                        color: 'var(--red)',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                      title={`Change character alignment to ${def.label}`}
                    >
                      {def.label} ({code})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentConfig.dragonTotem && DRAGON_TOTEMS[currentConfig.dragonTotem] && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                padding: '6px 8px',
                background: 'rgba(0, 0, 0, 0.03)',
                borderRadius: '3px',
                border: '1px dashed var(--pb)',
                fontSize: '9.5px',
                marginTop: '2px',
              }}
            >
              <div>
                <strong>Breath:</strong> {DRAGON_TOTEMS[currentConfig.dragonTotem].breathName} ({DRAGON_TOTEMS[currentConfig.dragonTotem].energy})
              </div>
              <div>
                <strong>Bonus Class Skills:</strong>{' '}
                <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>
                  {DRAGON_TOTEMS[currentConfig.dragonTotem].skills.map((s: string) => s.replace(/_/g, ' ')).join(', ')}
                </span>
              </div>
              <div>
                <strong>Adaptation (Lv.3):</strong> <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>{DRAGON_TOTEMS[currentConfig.dragonTotem].adaptation}</span>
                <div style={{ fontSize: '8.5px', color: 'var(--inkm)', marginTop: '1px' }}>
                  {DRAGON_TOTEMS[currentConfig.dragonTotem].adaptationDesc}
                </div>
              </div>
              <div>
                <strong>Acceptable Alignments:</strong> {DRAGON_TOTEMS[currentConfig.dragonTotem].alignments.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* HP Config */}
      {currentConfig.classType && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--ink)' }}>
            Hit Points (Hit Die: d{getClassHitDie(currentConfig.classType)})
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="number"
              min="1"
              max={getClassHitDie(currentConfig.classType)}
              value={currentConfig.hpRoll || ''}
              onChange={(e) => {
                const maxHD = getClassHitDie(currentConfig.classType);
                const val = Math.max(1, Math.min(maxHD, parseInt(e.target.value, 10) || 1));
                updateLevelConfig(currentLevelIndex, 'hpRoll', val);
              }}
              className="cinput"
              style={{ width: '80px', padding: '5px', fontSize: '13px', textAlign: 'center' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--inkl)', fontStyle: 'italic' }}>
              {currentLevelIndex === 0 ? 'Maximum value pre-selected' : `Allowed: 1 to ${getClassHitDie(currentConfig.classType)}`}
            </span>
          </div>
        </div>
      )}

      {/* Ability Increase */}
      {(currentLevelIndex + 1) % 4 === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
            ✦ Ability Score Increase (+1)
          </label>
          <select
            value={currentConfig.abilityIncrease || ''}
            onChange={(e) => updateLevelConfig(currentLevelIndex, 'abilityIncrease', e.target.value)}
            className="cinput"
            style={{ width: '100%', padding: '0 8px', fontSize: '12px', height: '32px', boxSizing: 'border-box' }}
          >
            <option value="" disabled>
              -- Select Ability --
            </option>
            {([
              { key: 'str', label: 'Strength (STR)' },
              { key: 'dex', label: 'Dexterity (DEX)' },
              { key: 'con', label: 'Constitution (CON)' },
              { key: 'int', label: 'Intelligence (INT)' },
              { key: 'wis', label: 'Wisdom (WIS)' },
              { key: 'cha', label: 'Charisma (CHA)' },
            ] as const).map((opt) => {
              const currentClass = currentConfig.classType;
              const isKey = currentClass ? CLASS_KEY_ATTRIBUTES[currentClass]?.includes(opt.key) : false;
              return (
                <option
                  key={opt.key}
                  value={opt.key}
                  style={{
                    color: isKey ? 'green' : 'inherit',
                    fontWeight: isKey ? 'bold' : 'normal',
                  }}
                >
                  {opt.label} {isKey ? '★ (Key)' : ''}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Current Attributes Card */}
      {currentDraft && (
        <div
          style={{
            padding: '10px',
            border: '1px solid var(--pb)',
            background: 'rgba(244,232,193,0.3)',
            borderRadius: '4px',
            marginTop: '6px',
          }}
        >
          <strong
            style={{
              display: 'block',
              fontSize: '11px',
              color: 'var(--red)',
              marginBottom: '6px',
              borderBottom: '0.5px dashed rgba(200, 169, 110, 0.4)',
              paddingBottom: '2px',
            }}
          >
            Current Ability Scores (Lvl {currentLevelIndex + 1})
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((k) => {
              const rawStat = currentDraft.stats ? currentDraft.stats[k] : currentDraft.draftPC[k];
              const score = typeof rawStat === 'number'
                ? rawStat
                : (typeof rawStat?.getValue === 'function' ? rawStat.getValue() : (rawStat?.base ?? 10));
              const mod = getAblMod(score);
              const sign = mod >= 0 ? '+' : '';
              return (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 4px' }}>
                  <span style={{ textTransform: 'uppercase', color: 'var(--inkm)', fontWeight: 'bold' }}>{k}:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>
                    {score} ({sign}
                    {mod})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
