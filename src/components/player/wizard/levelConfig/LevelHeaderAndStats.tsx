/**
 * @module    LevelHeaderAndStats
 * @summary   Level Timeline Bar, Class Selector, HP input, Ability Increase, and Current Attributes preview card.
 */

import React from 'react';
import { PrestigeSpellLinkSection } from './PrestigeSpellLinkSection';
import { ClassSelector } from './ClassSelector';
import { CLASS_KEY_ATTRIBUTES } from '../constants';
import { getAblMod } from '../../attributeHelper';

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
    }
  }, [currentConfig?.classType, currentLevelIndex, allLevelConfigs]);

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
                const newSpec = e.target.value;
                updateLevelConfig(currentLevelIndex, 'wizardSpecialization', newSpec);
                if (newSpec === 'none') {
                  updateLevelConfig(currentLevelIndex, 'wizardProhibited1', '');
                  updateLevelConfig(currentLevelIndex, 'wizardProhibited2', '');
                } else if (newSpec === 'div') {
                  updateLevelConfig(currentLevelIndex, 'wizardProhibited2', '');
                }
              }}
              className="cinput"
              style={{ width: '170px', fontSize: '10px', height: '22px', padding: '0 4px', boxSizing: 'border-box' }}
            >
              <option value="none">Universal (No School)</option>
              <option value="abj">Abjuration</option>
              <option value="con">Conjuration</option>
              <option value="div">Divination (1 Prohibited School)</option>
              <option value="enc">Enchantment</option>
              <option value="evo">Evocation</option>
              <option value="ill">Illusion</option>
              <option value="nec">Necromancy</option>
              <option value="tra">Transmutation</option>
            </select>
          </div>

          {currentConfig.wizardSpecialization && currentConfig.wizardSpecialization !== 'none' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                background: 'rgba(139, 26, 26, 0.05)',
                border: '0.5px solid rgba(139, 26, 26, 0.25)',
                borderRadius: '2px',
                padding: '6px 8px',
                marginTop: '2px',
              }}
            >
              <div style={{ fontSize: '9px', color: 'var(--red)', fontWeight: 'bold' }}>
                ⚠️ Prohibited Schools (Cannot cast or learn spells from these schools):
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9.5px' }}>
                <span>Prohibited School 1:</span>
                <select
                  value={currentConfig.wizardProhibited1 || ''}
                  onChange={(e) => updateLevelConfig(currentLevelIndex, 'wizardProhibited1', e.target.value)}
                  className="cinput"
                  style={{ width: '150px', fontSize: '9.5px', height: '20px', padding: '0 4px', boxSizing: 'border-box' }}
                >
                  <option value="">-- Select Required --</option>
                  {PROHIBITED_SCHOOLS
                    .filter((s) => s.value !== currentConfig.wizardSpecialization)
                    .map((s) => (
                      <option key={s.value} value={s.value} disabled={s.value === currentConfig.wizardProhibited2}>
                        {s.label}
                      </option>
                    ))}
                </select>
              </div>

              {currentConfig.wizardSpecialization !== 'div' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9.5px' }}>
                  <span>Prohibited School 2:</span>
                  <select
                    value={currentConfig.wizardProhibited2 || ''}
                    onChange={(e) => updateLevelConfig(currentLevelIndex, 'wizardProhibited2', e.target.value)}
                    className="cinput"
                    style={{ width: '150px', fontSize: '9.5px', height: '20px', padding: '0 4px', boxSizing: 'border-box' }}
                  >
                    <option value="">-- Select Required --</option>
                    {PROHIBITED_SCHOOLS
                      .filter((s) => s.value !== currentConfig.wizardSpecialization)
                      .map((s) => (
                        <option key={s.value} value={s.value} disabled={s.value === currentConfig.wizardProhibited1}>
                          {s.label}
                        </option>
                      ))}
                  </select>
                </div>
              )}
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
