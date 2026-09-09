import React, { useMemo } from 'react';
import { getSpellSelectionQuota } from './spellSelectionRules';
import { PCSpellCompendium } from '../../PCSpellCompendium';
import { findSpell } from '../../PCSpellbookTab';

export interface SpellSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: any;
  currentLevelIndex: number;
  currentDraft: any;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
  allLevelConfigs: any[];
  targetLevel?: number;
  onConfirmAndAdvance?: () => void;
}

export const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  currentLevelIndex,
  currentDraft,
  updateLevelConfig,
  allLevelConfigs,
  targetLevel = 1,
  onConfirmAndAdvance,
}) => {
  if (!isOpen) return null;

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
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.72)',
        backdropFilter: 'blur(3px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          width: '840px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 12px 35px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.12)',
          fontFamily: 'var(--font-title)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        {/* Modal Header */}
        <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid rgba(200,169,110,0.4)', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '15px', color: 'var(--red)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✨</span>
              <span>
                {classNameFormatted} Level {classCountAtThisLevel} Spell Selection (Character Lv. {currentLevelIndex + 1})
              </span>
            </div>
            <div
              style={{
                fontSize: '11px',
                padding: '3px 9px',
                borderRadius: '3px',
                background: isQuotaReached ? 'rgba(46, 125, 50, 0.15)' : 'rgba(184, 134, 11, 0.15)',
                color: isQuotaReached ? '#2e7d32' : '#b8860b',
                border: `1px solid ${isQuotaReached ? '#2e7d32' : '#b8860b'}`,
                fontWeight: 'bold',
              }}
            >
              Selected: {currentLevelSpells.length} / {quotaInfo.quota}
            </div>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', marginTop: '4px', fontStyle: 'italic' }}>
            {quotaInfo.label}
          </div>
        </div>

        {/* Auto Cantrips Banner for Wizard Lv 1 */}
        {quotaInfo.autoCantrips && (
          <div style={{ background: 'rgba(200, 169, 110, 0.12)', borderBottom: '1px solid rgba(200,169,110,0.3)', padding: '6px 20px', fontSize: '9.5px', color: 'var(--ink)', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
            ✦ <strong>RAW Rule:</strong> All 0-level Cantrips (except prohibited schools) are automatically added to your Spellbook upon creation.
          </div>
        )}

        {/* 2-Column Content: Left = Selected for Level, Right = Reused Compendium Component */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)', flex: 1, overflow: 'hidden' }}>
          {/* Left Column: Selected Spells for this Level */}
          <div style={{ padding: '12px 16px', overflowY: 'auto', background: 'rgba(200, 169, 110, 0.04)', borderRight: '1px solid rgba(200,169,110,0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 'bold', textAlign: 'left', borderBottom: '0.5px solid rgba(200,169,110,0.3)', paddingBottom: '3px' }}>
              Selected for Level {classCountAtThisLevel} ({currentLevelSpells.length} / {quotaInfo.quota})
            </div>

            {currentLevelSpells.length === 0 ? (
              <div style={{ color: 'var(--inkl)', fontStyle: 'italic', fontSize: '10px', textAlign: 'center', padding: '24px 10px' }}>
                No spells chosen yet for this level.<br/>Use the compendium on the right to add up to {quotaInfo.quota} spells.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {currentLevelSpells.map((spId: string) => {
                  const spObj = findSpell(currentDraft?.draftPC, spId);

                  return (
                    <div
                      key={spId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                        background: 'rgba(46, 125, 50, 0.1)',
                        border: '0.5px solid rgba(46, 125, 50, 0.4)',
                        borderRadius: '2px',
                        fontSize: '10px',
                      }}
                    >
                      <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✓</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>
                          {spObj ? spObj.nameEn || spObj.nameDe || spId : spId}
                        </span>
                        {spObj && (
                          <span style={{ fontSize: '8px', color: 'var(--inkm)' }}>
                            (Lv.{spObj.level})
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
                          fontSize: '11px',
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

          {/* Right Column: Reused Standard PCSpellCompendium Component */}
          <div style={{ padding: '12px 16px', overflowY: 'auto' }}>
            <PCSpellCompendium
              pc={currentDraft?.draftPC}
              customLearnedSpells={allSelectedSpells}
              onLearnSpell={handleLearnSpell}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(200,169,110,0.4)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '5px 14px',
              fontFamily: 'var(--font-title)',
              fontSize: '11px',
              background: 'rgba(0,0,0,0.06)',
              color: 'var(--inkm)',
              border: '1px solid var(--pb)',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            Close (Finish Later)
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onConfirmAndAdvance) {
                onConfirmAndAdvance();
              }
            }}
            style={{
              padding: '5px 18px',
              fontFamily: 'var(--font-title)',
              fontSize: '11px',
              fontWeight: 'bold',
              background: isQuotaReached ? 'var(--red)' : 'rgba(200, 169, 110, 0.3)',
              color: isQuotaReached ? '#fff' : 'var(--ink)',
              border: '1px solid var(--red)',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            {isQuotaReached
              ? currentLevelIndex < targetLevel - 1
                ? `✓ Confirm & Next Level (${currentLevelIndex + 2}) →`
                : '✓ Confirm & Review (Step 4) →'
              : 'Save Selection'}
          </button>
        </div>
      </div>
    </div>
  );
};

