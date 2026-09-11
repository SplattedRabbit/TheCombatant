/**
 * @module    ClassSelector
 * @summary   Header chips, class dropdown (PHB/PHB2/CA/Prestige), and class summary card for LevelConfig.
 */

import React, { useState } from 'react';
import { CLASSES_LIST } from '../constants';
import { validatePrestigeClassPrereqs, isOnlySpecialTextUnmet } from '@core/rules.js';
import { showCustomAlert, showCustomConfirm } from '@core/ui/components/dialogs.js';

export interface ClassSelectorProps {
  currentLevelIndex: number;
  currentConfig: any;
  prevDraft: any;
  completedDraft: any;
  getClassHitDie: (cls: string) => number;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  currentLevelIndex,
  currentConfig,
  prevDraft,
  completedDraft,
  getClassHitDie,
  updateLevelConfig,
}) => {
  const [sourceTab, setSourceTab] = useState<'all' | 'phb' | 'phb2' | 'ca' | 'prestige'>('all');

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
    <>
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
    </>
  );
};
