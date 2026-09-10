/**
 * @module    Step3SpellSelectionView
 * @summary   Full-page inline view for spell selection in Character Wizard (replaces popup modal).
 */

import React, { useMemo } from 'react';
import { getSpellSelectionQuota } from './spellSelectionRules';
import { PCSpellCompendium } from '../../PCSpellCompendium';
import { findSpell } from '../../PCSpellbookTab';

export interface Step3SpellSelectionViewProps {
  currentConfig: any;
  currentLevelIndex: number;
  currentDraft: any;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
  allLevelConfigs: any[];
}

export const Step3SpellSelectionView: React.FC<Step3SpellSelectionViewProps> = ({
  currentConfig,
  currentLevelIndex,
  currentDraft,
  updateLevelConfig,
  allLevelConfigs,
}) => {
  const classType = currentConfig.classType || '';
  const classCountAtThisLevel = allLevelConfigs
    .slice(0, currentLevelIndex + 1)
    .filter((c) => c.classType === classType).length || 1;

  const intMod = currentDraft?.statMods?.int ?? 0;
  const quotaInfo = useMemo(
    () => getSpellSelectionQuota(classType, classCountAtThisLevel, intMod),
    [classType, classCountAtThisLevel, intMod]
  );

  // Selected spells for this specific level
  const currentLevelSpells: string[] = Array.isArray(currentConfig.spells)
    ? currentConfig.spells
    : [];

  // Spells selected on all levels combined
  const allSelectedSpells = useMemo(() => {
    const combined: string[] = [];
    allLevelConfigs.forEach((cfg) => {
      if (Array.isArray(cfg.spells)) {
        cfg.spells.forEach((spId: string) => {
          if (!combined.includes(spId)) combined.push(spId);
        });
      }
    });
    return combined;
  }, [allLevelConfigs]);

  const handleLearnSpell = (spellId: string) => {
    if (currentLevelSpells.includes(spellId)) return;

    if (currentLevelSpells.length >= quotaInfo.quota) {
      return;
    }
    const next = [...currentLevelSpells, spellId];
    updateLevelConfig(currentLevelIndex, 'spells', next);
  };

  const handleRemoveSpell = (spellId: string) => {
    const next = currentLevelSpells.filter((id) => id !== spellId);
    updateLevelConfig(currentLevelIndex, 'spells', next);
  };

  const classNameFormatted = classType.charAt(0).toUpperCase() + classType.slice(1);
  const isQuotaReached = currentLevelSpells.length >= quotaInfo.quota;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'left',
        marginTop: '6px',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '6px',
          borderBottom: '1.5px solid var(--pb)',
        }}
      >
        <div>
          <h4
            style={{
              color: 'var(--red)',
              margin: 0,
              fontSize: '15px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>✨</span>
            <span>
              {classNameFormatted} Level {classCountAtThisLevel} Spell Selection (Character Lv. {currentLevelIndex + 1})
            </span>
          </h4>
          <div
            style={{
              fontSize: '10.5px',
              color: 'var(--inkm)',
              fontFamily: 'var(--font-body)',
              marginTop: '3px',
              fontStyle: 'italic',
            }}
          >
            {quotaInfo.label}
          </div>
        </div>

        <div
          style={{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '3px',
            background: isQuotaReached ? 'rgba(46, 125, 50, 0.15)' : 'rgba(184, 134, 11, 0.15)',
            color: isQuotaReached ? '#2e7d32' : '#b8860b',
            border: `1px solid ${isQuotaReached ? '#2e7d32' : '#b8860b'}`,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          Selected: {currentLevelSpells.length} / {quotaInfo.quota}
        </div>
      </div>

      {/* Auto Cantrips Banner for Wizard Lv 1 */}
      {quotaInfo.autoCantrips && (
        <div
          style={{
            background: 'rgba(200, 169, 110, 0.12)',
            border: '1px solid rgba(200, 169, 110, 0.35)',
            borderRadius: '3px',
            padding: '6px 12px',
            fontSize: '10px',
            color: 'var(--ink)',
            fontFamily: 'var(--font-body)',
          }}
        >
          ✦ <strong>RAW Rule:</strong> All 0-level Cantrips (except prohibited schools) are automatically added to your Spellbook upon creation.
        </div>
      )}

      {/* 2-Column Inline Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.45fr)',
          gap: '20px',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Left Column: Chosen Spells for this Level */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '4px',
            background: 'rgba(244, 232, 193, 0.25)',
            border: '1px solid var(--pb)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minHeight: '320px',
          }}
        >
          <div
            style={{
              fontSize: '11.5px',
              color: 'var(--red)',
              fontWeight: 'bold',
              borderBottom: '0.5px solid var(--pb)',
              paddingBottom: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Chosen for Level {classCountAtThisLevel}</span>
            <span style={{ fontSize: '10px', color: 'var(--inkm)' }}>
              ({currentLevelSpells.length} / {quotaInfo.quota})
            </span>
          </div>

          {currentLevelSpells.length === 0 ? (
            <div
              style={{
                color: 'var(--inkl)',
                fontStyle: 'italic',
                fontSize: '11px',
                textAlign: 'center',
                padding: '40px 10px',
              }}
            >
              No spells chosen yet for Level {classCountAtThisLevel}.<br />
              Use the compendium on the right to select your {quotaInfo.quota} spells.
            </div>
          ) : (
            <div
              className="custom-scrollbar"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                overflowY: 'auto',
                maxHeight: '380px',
                paddingRight: '4px',
                scrollbarGutter: 'stable',
              }}
            >
              {currentLevelSpells.map((spId: string) => {
                const spObj = findSpell(currentDraft?.draftPC, spId);

                return (
                  <div
                    key={spId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 8px',
                      background: 'rgba(46, 125, 50, 0.1)',
                      border: '0.5px solid rgba(46, 125, 50, 0.4)',
                      borderRadius: '3px',
                      fontSize: '11px',
                    }}
                  >
                    <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✓</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>
                        {spObj ? spObj.nameEn || spObj.nameDe || spId : spId}
                      </span>
                      {spObj && (
                        <span style={{ fontSize: '9px', color: 'var(--inkm)' }}>
                          (Lv. {spObj.level})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpell(spId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#d32f2f',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        padding: '0 4px',
                      }}
                      title="Remove spell"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Standard PCSpellCompendium */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '4px',
            background: 'rgba(244, 232, 193, 0.18)',
            border: '1px solid var(--pb)',
          }}
        >
          <PCSpellCompendium
            pc={currentDraft?.draftPC}
            customLearnedSpells={allSelectedSpells}
            onLearnSpell={handleLearnSpell}
          />
        </div>
      </div>
    </div>
  );
};
