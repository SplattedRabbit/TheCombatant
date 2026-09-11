/**
 * @module    PCSpellsHeaderBar
 * @summary   Unified, compact status bar for the spells view: Arcane Specialization, transparent ASF breakdown, and Daily Reset.
 */

import React, { useMemo } from 'react';
import { getSchoolLabel } from '@core/spells.js';
import { getArcaneSpellFailureBreakdown } from './spellFailureHelper';
import {
  SORCERER_KNOWN_TABLE,
  BARD_KNOWN_TABLE,
  getEffectiveCasterLevel,
  getMaxSpellLevel,
} from '@core/rules.js';

interface PCSpellsHeaderBarProps {
  pc: any;
  onOpenSpecializationDialog?: () => void;
  onNewDayReset: () => void;
}

export const PCSpellsHeaderBar: React.FC<PCSpellsHeaderBarProps> = ({
  pc,
  onOpenSpecializationDialog,
  onNewDayReset,
}) => {
  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const isWizard = hasClasses && pc.classes.some((c: any) => c.classType === 'wizard');

  const asfBreakdown = useMemo(() => {
    return getArcaneSpellFailureBreakdown(pc);
  }, [pc]);

  // Quota and capacity calculations
  const quotaStats = useMemo(() => {
    const isSorc = hasClasses && pc.classes.some((c: any) => c.classType === 'sorcerer');
    const isBard = hasClasses && pc.classes.some((c: any) => c.classType === 'bard');
    const isWiz = hasClasses && pc.classes.some((c: any) => c.classType === 'wizard');

    const learnedKeys: string[] = Array.isArray(pc.learnedSpells) ? pc.learnedSpells : [];
    const totalLearned = learnedKeys.length;

    const sorcCL = isSorc ? getEffectiveCasterLevel(pc, 'sorcerer') : 0;
    const bardCL = isBard ? getEffectiveCasterLevel(pc, 'bard') : 0;
    const wizCL = isWiz ? getEffectiveCasterLevel(pc, 'wizard') : 0;

    const sorcRow = isSorc ? (SORCERER_KNOWN_TABLE[Math.max(1, Math.min(20, sorcCL))] || []) : [];
    const bardRow = isBard ? (BARD_KNOWN_TABLE[Math.max(1, Math.min(20, bardCL))] || []) : [];

    let totalMaxSpontaneous = 0;
    for (let lvl = 0; lvl <= 9; lvl++) {
      if (isSorc && sorcRow[lvl] !== undefined) totalMaxSpontaneous += sorcRow[lvl];
      if (isBard && bardRow[lvl] !== undefined) totalMaxSpontaneous += bardRow[lvl];
    }

    return {
      isWizard: isWiz,
      isSpontaneous: isSorc || isBard,
      wizCL,
      maxWizLvl: isWiz ? getMaxSpellLevel('wizard', wizCL) : -1,
      totalLearned,
      totalMaxSpontaneous,
    };
  }, [pc, hasClasses]);

  // Calculate total slot usage across all levels
  const slotStats = useMemo(() => {
    let maxTotal = 0;
    let usedTotal = 0;
    for (let lvl = 0; lvl <= 9; lvl++) {
      const slot = pc.spellSlots?.[lvl];
      if (slot) {
        maxTotal += slot.max || 0;
        usedTotal += slot.used || 0;
      }
    }
    const remaining = Math.max(0, maxTotal - usedTotal);
    return { maxTotal, usedTotal, remaining };
  }, [pc.spellSlots]);

  const prohibitedList = useMemo(() => {
    return [pc.wizardProhibited1, pc.wizardProhibited2]
      .filter(Boolean)
      .map(getSchoolLabel);
  }, [pc.wizardProhibited1, pc.wizardProhibited2]);

  const asfTooltip = useMemo(() => {
    if (asfBreakdown.items.length === 0) return 'No Arcane Spell Failure penalty.';
    const parts = asfBreakdown.items.map(
      (item) => `${item.name}: ${item.asf}%${item.note ? ` (${item.note})` : ''}`
    );
    return `Arcane Spell Failure Breakdown:\n${parts.join('\n')}\nTotal Penalty: ${asfBreakdown.totalASF}%`;
  }, [asfBreakdown]);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px',
        padding: '5px 8px',
        background: 'linear-gradient(90deg, rgba(200, 169, 110, 0.16) 0%, rgba(200, 169, 110, 0.06) 100%)',
        border: '0.5px solid var(--pb)',
        borderRadius: '4px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Left side: Wizard Specialization Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexWrap: 'wrap' }}>
        {isWizard && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '2px 6px',
              background: 'rgba(200, 169, 110, 0.12)',
              border: '0.5px solid rgba(139, 26, 26, 0.35)',
              borderLeft: '3px solid var(--red)',
              borderRadius: '3px',
              fontSize: '9.5px',
            }}
          >
            <span style={{ fontSize: '11px' }}>🏛️</span>
            <span style={{ fontFamily: 'var(--font-title)', fontWeight: 'bold', color: 'var(--red)' }}>
              {pc.wizardSpecialization && pc.wizardSpecialization !== 'none'
                ? `Specialist: ${getSchoolLabel(pc.wizardSpecialization)}`
                : 'Universalist'}
            </span>

            {pc.wizardSpecialization && pc.wizardSpecialization !== 'none' ? (
              <span style={{ fontSize: '8px', color: 'var(--inkm)' }}>
                (<span style={{ color: '#2e7d32', fontWeight: 600 }}>+1 Slot</span>
                {prohibitedList.length > 0 && (
                  <span style={{ color: 'var(--red)', marginLeft: '3px' }}>
                    • Banned: {prohibitedList.join(', ')}
                  </span>
                )}
                )
              </span>
            ) : (
              <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic' }}>
                (All Schools)
              </span>
            )}

            {onOpenSpecializationDialog && (
              <button
                type="button"
                onClick={onOpenSpecializationDialog}
                className="btn"
                style={{
                  fontSize: '7.5px',
                  padding: '1px 5px',
                  height: '16px',
                  lineHeight: 1,
                  fontFamily: 'var(--font-title)',
                  fontWeight: 'bold',
                  marginLeft: '2px',
                  cursor: 'pointer',
                  border: '0.5px solid var(--pb)',
                  background: 'rgba(200, 169, 110, 0.2)',
                  color: 'var(--ink)',
                }}
                title="Configure Wizard Specialization & Prohibited Schools"
              >
                ⚙️ {pc.wizardSpecialization && pc.wizardSpecialization !== 'none' ? 'Change' : 'Specialize'}
              </button>
            )}
          </div>
        )}

        {/* ASF Status Pill - only shown when there is an actual spell failure penalty */}
        {asfBreakdown.isArcaneCaster && asfBreakdown.totalASF > 0 && (
          <div
            title={asfTooltip}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              background:
                asfBreakdown.totalASF > 0 ? 'rgba(139, 26, 26, 0.08)' : 'rgba(46, 125, 50, 0.08)',
              border:
                asfBreakdown.totalASF > 0
                  ? '0.5px solid rgba(139, 26, 26, 0.4)'
                  : '0.5px solid rgba(46, 125, 50, 0.3)',
              borderRadius: '3px',
              fontSize: '8.5px',
              cursor: 'help',
              fontFamily: 'var(--font-title)',
              fontWeight: 600,
              color: asfBreakdown.totalASF > 0 ? 'var(--red)' : '#2e7d32',
            }}
          >
            <span>{asfBreakdown.totalASF > 0 ? '⚠️' : '🛡️'}</span>
            <span>
              ASF: <strong>{asfBreakdown.totalASF}%</strong>
            </span>
            {asfBreakdown.items.length > 0 && (
              <span
                style={{
                  fontSize: '7.5px',
                  color: 'var(--inkl)',
                  fontWeight: 'normal',
                  maxWidth: '180px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                ({asfBreakdown.items.map((it) => `${it.name} ${it.asf}%`).join(', ')})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Center: Learned / Known Spells Quota Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '2px 8px',
          background: 'rgba(200, 169, 110, 0.12)',
          border: '0.5px solid var(--pb)',
          borderRadius: '3px',
          fontSize: '9px',
          fontFamily: 'var(--font-title)',
          color: 'var(--ink)',
        }}
      >
        {quotaStats.isSpontaneous ? (
          <span>
            ✨ <strong>Known Spells:</strong>{' '}
            <strong style={{ color: 'var(--red)' }}>{quotaStats.totalLearned}</strong> / {quotaStats.totalMaxSpontaneous}
          </span>
        ) : quotaStats.isWizard ? (
          <span>
            📖 <strong>Spellbook:</strong>{' '}
            <strong style={{ color: 'var(--red)' }}>{quotaStats.totalLearned}</strong> Spells recorded{' '}
            <span style={{ fontSize: '7.5px', color: '#2e7d32', fontWeight: 'normal' }}>
              (Unlimited Scribing)
            </span>
            {quotaStats.maxWizLvl >= 0 && (
              <span style={{ marginLeft: '6px', color: 'var(--inkl)', fontSize: '7.5px' }}>
                • Max Castable: <strong>Lvl {quotaStats.maxWizLvl}</strong>
              </span>
            )}
          </span>
        ) : (
          <span>
            📜 <strong>Spellbook:</strong>{' '}
            <strong style={{ color: 'var(--red)' }}>{quotaStats.totalLearned}</strong> Spells
          </span>
        )}
      </div>

      {/* Right side: Slot counter + Daily Reset button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {slotStats.maxTotal > 0 && (
          <div
            style={{
              fontSize: '8.5px',
              color: 'var(--inkm)',
              fontFamily: 'var(--font-title)',
              background: 'rgba(200, 169, 110, 0.1)',
              border: '0.5px solid var(--pb)',
              padding: '2px 5px',
              borderRadius: '3px',
            }}
            title={`${slotStats.remaining} of ${slotStats.maxTotal} spell slots available`}
          >
            🔮 <strong>{slotStats.remaining}</strong>/{slotStats.maxTotal} Slots
          </div>
        )}

        <button
          type="button"
          onClick={onNewDayReset}
          className="btn btn-new-day"
          style={{
            fontSize: '8px',
            padding: '2px 6px',
            height: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontWeight: 'bold',
            fontFamily: 'var(--font-title)',
            cursor: 'pointer',
          }}
          title="Restore spent spell slots and daily abilities (Rest / New Day)"
        >
          <span>🌅</span> Daily Reset
        </button>
      </div>
    </div>
  );
};
