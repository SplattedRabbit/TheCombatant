/**
 * @module    LevelHeaderAndStats
 * @summary   Level Timeline Bar, Class Selector, HP input, Ability Increase, and Current Attributes preview card.
 */

import React, { useState, useMemo } from 'react';
import { CLASSES_LIST, CLASS_KEY_ATTRIBUTES } from '../constants';
import { validatePrestigeClassPrereqs, isOnlySpecialTextUnmet } from '@core/rules.js';
import { showCustomAlert, showCustomConfirm } from '@core/ui/components/dialogs.js';
import { PrestigeSpellLinkSection } from './PrestigeSpellLinkSection';
import { SpellSelectionModal } from '../spells/SpellSelectionModal';
import { isSpellSelectorClass, getSpellSelectionQuota } from '../spells/spellSelectionRules';

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
  isSpellModalOpen?: boolean;
  setIsSpellModalOpen?: (open: boolean) => void;
  targetLevel?: number;
  onConfirmAndAdvance?: () => void;
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
  isSpellModalOpen: externalIsSpellModalOpen,
  setIsSpellModalOpen: externalSetIsSpellModalOpen,
  targetLevel = 1,
  onConfirmAndAdvance,
}) => {
  const [sourceTab, setSourceTab] = React.useState<'all' | 'phb' | 'phb2' | 'ca' | 'prestige'>('all');
  const [localIsSpellModalOpen, setLocalIsSpellModalOpen] = useState(false);

  const isSpellModalOpen = externalIsSpellModalOpen !== undefined ? externalIsSpellModalOpen : localIsSpellModalOpen;
  const setIsSpellModalOpen = externalSetIsSpellModalOpen || setLocalIsSpellModalOpen;

  const classType = currentConfig.classType || '';
  const isSpellSelector = isSpellSelectorClass(classType);

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

  const classCountAtThisLevel = allLevelConfigs
    .slice(0, currentLevelIndex + 1)
    .filter((c) => c.classType === classType).length || 1;

  const intMod = currentDraft?.statMods?.int ?? 0;
  const quotaInfo = useMemo(
    () => (isSpellSelector ? getSpellSelectionQuota(classType, classCountAtThisLevel, intMod) : null),
    [isSpellSelector, classType, classCountAtThisLevel, intMod]
  );

  const selectedSpellsCount = Array.isArray(currentConfig.spells) ? currentConfig.spells.length : 0;
  const isQuotaFulfilled = quotaInfo ? selectedSpellsCount >= quotaInfo.quota : true;

  const filteredWizardClasses = CLASSES_LIST.filter((c) => {
    if (sourceTab === 'prestige' && !c.isPrestige) return false;
    if (sourceTab === 'phb' && (c.isPrestige || (c as any).source !== 'phb')) return false;
    if (sourceTab === 'phb2' && (c.isPrestige || (c as any).source !== 'phb2')) return false;
    if (sourceTab === 'ca' && (c.isPrestige || (c as any).source !== 'ca')) return false;
    return true;
  });

  const handleClassSelect = (classKey: string) => {
    updateLevelConfig(currentLevelIndex, 'classType', classKey);
    const hd = getClassHitDie(classKey);
    if (currentLevelIndex === 0) {
      updateLevelConfig(currentLevelIndex, 'hpRoll', hd);
    } else {
      const defaultRoll = Math.ceil(hd / 2) + 1;
      updateLevelConfig(currentLevelIndex, 'hpRoll', defaultRoll);
    }
  };

  const handleLockedClassClick = (c: any) => {
    const className = c.nameEn || c.name || c.key;
    const title = `Prerequisites for ${className}`;
    const activeDraft = completedDraft || prevDraft;
    const detailValidation = activeDraft
      ? validatePrestigeClassPrereqs(activeDraft.draftPC, c.key)
      : { success: false, metDetails: [] };

    const lines = detailValidation.metDetails.map((req: any) => {
      const color = req.met ? '#2e7d32' : '#d32f2f';
      return `<div style="color: ${color}; margin-bottom: 6px; font-size: 10px; line-height: 1.35;"><strong>${req.label}</strong><br/>[Current: ${req.current} / Required: ${req.required}]</div>`;
    });

    if (isOnlySpecialTextUnmet(detailValidation)) {
      showCustomConfirm(
        title,
        `<div style="text-align: left; padding: 2px;"><p style="margin-bottom: 8px; font-size: 11px; color: var(--ink);">All prerequisites are met except for a special requirement that must be manually confirmed:</p>${lines.join(
          '',
        )}<p style="margin-top: 8px; font-size: 11px; color: var(--ink);">Do you confirm that this requirement is met?</p></div>`,
        () => {
          updateLevelConfig(currentLevelIndex, 'prestigeSpecialTextConfirmed', {
            ...currentConfig.prestigeSpecialTextConfirmed,
            [c.key]: true,
          });
          handleClassSelect(c.key);
        },
      );
      return;
    }

    showCustomAlert(
      title,
      `<div style="text-align: left; padding: 2px;"><p style="margin-bottom: 8px; font-size: 11px; color: var(--ink);">You do not yet meet the prerequisites for this prestige class:</p>${lines.join(
        '',
      )}</div>`,
      'OK',
      '🔒',
    );
  };

  const selectedClass = CLASSES_LIST.find((c) => c.key === currentConfig.classType);
  const srcLabel = selectedClass && (selectedClass as any).source ? (selectedClass as any).source.toUpperCase() : 'PHB';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0, width: '100%' }}>

      {/* Header and Source Chips */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '30px',
          borderBottom: '1.5px solid var(--pb)',
          paddingBottom: '2px',
          marginBottom: '4px',
          boxSizing: 'border-box',
        }}
      >
        <h4
          style={{
            color: 'var(--red)',
            margin: 0,
            fontSize: '13.5px',
            fontFamily: 'var(--font-title)',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          Level {currentLevelIndex + 1}: Class &amp; HP
        </h4>

        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          {(['all', 'phb', 'phb2', 'ca', 'prestige'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSourceTab(tab)}
              style={{
                fontSize: '9.5px',
                padding: '1.5px 6px',
                borderRadius: '2px',
                cursor: 'pointer',
                border: '1px solid var(--pb)',
                fontFamily: 'var(--font-body)',
                background: sourceTab === tab ? 'var(--red)' : 'rgba(139,26,26,0.06)',
                color: sourceTab === tab ? '#fff' : 'var(--inkm)',
                fontWeight: sourceTab === tab ? 700 : 400,
                transition: 'all 0.15s',
                lineHeight: '13px',
              }}
            >
              {tab === 'all' ? 'All' : tab === 'phb' ? 'Core' : tab === 'phb2' ? 'PHB2' : tab === 'ca' ? 'C.Adv' : 'Prestige'}
            </button>
          ))}
        </div>
      </div>

      {/* Class Dropdown */}
      <select
        value={currentConfig.classType || ''}
        onChange={(e) => {
          const selectedKey = e.target.value;
          const classObj = CLASSES_LIST.find((c) => c.key === selectedKey);
          if (!classObj) return;

          if (classObj.isPrestige) {
            const validation = prevDraft
              ? validatePrestigeClassPrereqs(prevDraft.draftPC, classObj.key)
              : { success: false, metDetails: [] };
            if (!validation.success) {
              handleLockedClassClick(classObj);
              return;
            }
          }
          handleClassSelect(selectedKey);
        }}
        className="cinput"
        style={{ width: '100%', fontSize: '11px', height: '24px', padding: '0 6px', boxSizing: 'border-box', cursor: 'pointer' }}
      >
        <option value="" disabled>
          -- Select Class --
        </option>
        {sourceTab === 'all' ? (
          <>
            <optgroup label="Core Classes (PHB)">
              {CLASSES_LIST.filter((c) => !c.isPrestige && (c as any).source === 'phb').map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name} (d{c.hd}, {c.skillBase}+INT Skills)
                </option>
              ))}
            </optgroup>
            <optgroup label="Player's Handbook II (PHB2)">
              {CLASSES_LIST.filter((c) => !c.isPrestige && (c as any).source === 'phb2').map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name} (d{c.hd}, {c.skillBase}+INT Skills)
                </option>
              ))}
            </optgroup>
            <optgroup label="Complete Adventurer (CA)">
              {CLASSES_LIST.filter((c) => !c.isPrestige && (c as any).source === 'ca').map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name} (d{c.hd}, {c.skillBase}+INT Skills)
                </option>
              ))}
            </optgroup>
            <optgroup label="Prestige Classes (PHB / CS)">
              {CLASSES_LIST.filter((c) => c.isPrestige).map((c) => {
                const validation = prevDraft
                  ? validatePrestigeClassPrereqs(prevDraft.draftPC, c.key)
                  : { success: false, metDetails: [] };
                const isAvailable = validation.success;
                return (
                  <option key={c.key} value={c.key}>
                    {c.name} (d{c.hd}) {isAvailable ? '🔓' : '🔒 [Locked]'}
                  </option>
                );
              })}
            </optgroup>
          </>
        ) : (
          filteredWizardClasses.map((c) => {
            const isPrestige = c.isPrestige;
            const validation = prevDraft
              ? validatePrestigeClassPrereqs(prevDraft.draftPC, c.key)
              : { success: !isPrestige, metDetails: [] };
            const isAvailable = !isPrestige || validation.success;
            return (
              <option key={c.key} value={c.key}>
                {c.name} (d{c.hd}
                {c.skillBase ? `, ${c.skillBase}+INT Skills` : ''}) {isPrestige ? (isAvailable ? '🔓' : '🔒 [Locked]') : ''}
              </option>
            );
          })
        )}
      </select>

      {/* Class Summary Card */}
      {selectedClass && (
        <div
          style={{
            padding: '6px 8px',
            borderRadius: '3px',
            border: '1px solid var(--pb)',
            background: 'rgba(244, 232, 193, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '12px', fontWeight: 'bold', color: 'var(--red)' }}>
              {selectedClass.name}
            </span>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              <span style={{ fontSize: '8px', background: 'rgba(0,0,0,0.06)', color: 'var(--inkm)', padding: '0 4px', borderRadius: '1px', fontWeight: 'bold' }}>
                {srcLabel}
              </span>
              <span style={{ fontSize: '8px', background: 'rgba(139, 26, 26, 0.08)', color: 'var(--red)', padding: '0 4px', borderRadius: '1px', fontWeight: 'bold' }}>
                Hit Die: d{selectedClass.hd}
              </span>
              <span style={{ fontSize: '8px', background: 'rgba(0,0,0,0.04)', color: 'var(--inkm)', padding: '0 4px', borderRadius: '1px' }}>
                Skills: {selectedClass.skillBase}+INT
              </span>
            </div>
          </div>
          <div style={{ fontSize: '9.5px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', lineHeight: 1.25 }}>
            {selectedClass.desc}
          </div>
        </div>
      )}

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

      {/* Conditional Spell Selection Trigger for Spellcasting Classes */}
      {isSpellSelector && quotaInfo && (
        <div
          style={{
            padding: '8px 10px',
            borderRadius: '3px',
            border: isQuotaFulfilled ? '1px solid #2e7d32' : '1px solid #b8860b',
            background: isQuotaFulfilled ? 'rgba(46, 125, 50, 0.08)' : 'rgba(184, 134, 11, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginTop: '4px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 'bold', color: isQuotaFulfilled ? '#2e7d32' : '#b8860b', fontFamily: 'var(--font-title)' }}>
              <span>✨</span>
              <span>Spell Selection</span>
              <span style={{ fontSize: '9.5px', opacity: 0.9 }}>
                ({selectedSpellsCount} / {quotaInfo.quota} chosen)
              </span>
            </div>
            <div style={{ fontSize: '8.5px', color: 'var(--inkm)', fontFamily: 'var(--font-body)' }}>
              {isQuotaFulfilled ? '✓ Required spells selected for this level.' : quotaInfo.label}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSpellModalOpen(true)}
            style={{
              padding: '4px 10px',
              fontFamily: 'var(--font-title)',
              fontSize: '10px',
              fontWeight: 'bold',
              background: isQuotaFulfilled ? 'rgba(46, 125, 50, 0.15)' : 'var(--red)',
              color: isQuotaFulfilled ? '#2e7d32' : '#fff',
              border: isQuotaFulfilled ? '1px solid #2e7d32' : 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {isQuotaFulfilled ? '✎ Modify Spells' : '📖 Select Spells'}
          </button>
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
              const mod = Math.floor((score - 10) / 2);
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

      {isSpellModalOpen && (
        <SpellSelectionModal
          isOpen={isSpellModalOpen}
          onClose={() => setIsSpellModalOpen(false)}
          currentConfig={currentConfig}
          currentLevelIndex={currentLevelIndex}
          currentDraft={currentDraft}
          updateLevelConfig={updateLevelConfig}
          allLevelConfigs={allLevelConfigs}
          targetLevel={targetLevel}
          onConfirmAndAdvance={onConfirmAndAdvance}
        />
      )}
    </div>
  );
};
