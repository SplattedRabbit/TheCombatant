/**
 * @module    SpellLibraryList
 * @summary   High-density tabular list of learned spells with level filters, search, and preparation actions.
 */

import React, { useState, useMemo } from 'react';
import { CombatState } from '@core/state.js';
import { findSpell } from '../PCSpellbookTab';
import { SpellLibraryItemRow } from './SpellLibraryItemRow';
import {
  showCustomConfirm,
  showPrepareSpellDialog,
  showCastSpontaneousSpellDialog,
} from '@core/ui/components/dialogs.js';
import { SORCERER_KNOWN_TABLE, BARD_KNOWN_TABLE, ASSASSIN_KNOWN_TABLE } from '@core/rules/RulesData.js';
import { getEffectiveCasterLevel, getMaxSpellLevel } from '@core/rules/RulesSpells.js';
import { computeWizardBudget } from '../wizardBudget';

interface SpellLibraryListProps {
  pc: any;
  onOpenCompendium: () => void;
}

export const SpellLibraryList: React.FC<SpellLibraryListProps> = ({ pc, onOpenCompendium }) => {
  const [activeLevelFilter, setActiveLevelFilter] = useState<'all' | number>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const activeCasters = hasClasses
    ? pc.classes.filter((c: any) =>
        [
          'cleric',
          'wizard',
          'sorcerer',
          'bard',
          'druid',
          'paladin',
          'ranger',
          'duskblade',
          'beguiler',
          'assassin',
        ].includes(c.classType)
      )
    : [];

  const hasPrepared = activeCasters.some((c: any) =>
    ['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'duskblade'].includes(c.classType)
  );
  const hasSpontaneous = activeCasters.some((c: any) =>
    ['sorcerer', 'bard', 'beguiler'].includes(c.classType)
  );

  const hasCantrips =
    !hasClasses ||
    pc.classes.some((c: any) =>
      ['cleric', 'wizard', 'sorcerer', 'bard', 'druid'].includes(c.classType)
    );

  const minLvl = hasCantrips ? 0 : 1;
  let maxLvl = 9;
  if (activeCasters.length === 1 && ['paladin', 'ranger', 'assassin'].includes(activeCasters[0].classType)) {
    maxLvl = 4;
  } else if (activeCasters.length === 1 && activeCasters[0].classType === 'bard') {
    maxLvl = 6;
  } else if (activeCasters.length === 1 && ['duskblade', 'beguiler'].includes(activeCasters[0].classType)) {
    maxLvl = 5;
  }

  const levelsToRender: number[] = [];
  for (let i = minLvl; i <= maxLvl; i++) {
    levelsToRender.push(i);
  }

  // Learned Spells
  const learnedKeys: string[] = Array.isArray(pc.learnedSpells) ? pc.learnedSpells : [];
  const learnedSpells = useMemo(() => {
    return learnedKeys
      .map((k) => findSpell(pc, k))
      .filter((s): s is NonNullable<typeof s> => s !== null && s !== undefined);
  }, [pc, learnedKeys]);

  // Quota and capacity calculations (D&D 3.5e RAW)
  const quotaStats = useMemo(() => {
    const isSorc = activeCasters.some((c: any) => c.classType === 'sorcerer');
    const isBard = activeCasters.some((c: any) => c.classType === 'bard');
    const isAssassin = activeCasters.some((c: any) => c.classType === 'assassin');
    const isWiz = activeCasters.some((c: any) => c.classType === 'wizard');

    const sorcCL = isSorc ? getEffectiveCasterLevel(pc, 'sorcerer') : 0;
    const bardCL = isBard ? getEffectiveCasterLevel(pc, 'bard') : 0;
    const assassinCL = isAssassin ? (getEffectiveCasterLevel(pc, 'assassin') || activeCasters.find((c: any) => c.classType === 'assassin')?.level || 0) : 0;
    const wizCL = isWiz ? getEffectiveCasterLevel(pc, 'wizard') : 0;

    const sorcRow = isSorc ? (SORCERER_KNOWN_TABLE[Math.max(1, Math.min(20, sorcCL))] || []) : [];
    const bardRow = isBard ? (BARD_KNOWN_TABLE[Math.max(1, Math.min(20, bardCL))] || []) : [];
    const assassinRow = isAssassin ? (ASSASSIN_KNOWN_TABLE[Math.max(1, Math.min(10, assassinCL))] || []) : [];

    // Wizard budget via shared helper
    const wizBudget = isWiz ? computeWizardBudget(pc, learnedSpells) : null;

    const perLevel: Record<number, {
      count: number;
      maxKnown?: number;
      isSpontaneous: boolean;
      wizardCap?: number;
      isWizardOverCap?: boolean;
    }> = {};
    let totalCurrent = 0;
    let totalMaxSpontaneous = 0;

    for (let lvl = minLvl; lvl <= maxLvl; lvl++) {
      const countAtLvl = learnedSpells.filter((s) => s.level === lvl).length;
      let maxKnown: number | undefined = undefined;
      let isSpontaneous = false;

      if (isSorc && sorcRow[lvl] !== undefined) {
        maxKnown = (maxKnown || 0) + sorcRow[lvl];
        isSpontaneous = true;
      }
      if (isBard && bardRow[lvl] !== undefined) {
        maxKnown = (maxKnown || 0) + bardRow[lvl];
        isSpontaneous = true;
      }
      if (isAssassin && assassinRow[lvl] !== undefined) {
        maxKnown = (maxKnown || 0) + assassinRow[lvl];
        isSpontaneous = true;
      }

      if (maxKnown !== undefined) {
        totalMaxSpontaneous += maxKnown;
      }
      totalCurrent += countAtLvl;

      const wizardCap = isWiz && lvl > 0 ? wizBudget?.perLevelCaps[lvl] : undefined;
      const isWizardOverCap = isWiz && lvl > 0 ? (wizBudget?.isLevelOverCap(lvl) ?? false) : false;

      perLevel[lvl] = { count: countAtLvl, maxKnown, isSpontaneous, wizardCap, isWizardOverCap };
    }

    return {
      isWizard: isWiz,
      isSpontaneous: isSorc || isBard || isAssassin,
      wizCL,
      maxWizLvl: isWiz ? getMaxSpellLevel('wizard', wizCL) : -1,
      totalCurrent,
      totalMaxSpontaneous,
      perLevel,
      wizBudget,
    };
  }, [pc, activeCasters, learnedSpells, minLvl, maxLvl]);

  const sortedSpells = useMemo(() => {
    return [...learnedSpells].sort((a, b) => {
      if ((a.level ?? 0) !== (b.level ?? 0)) {
        return (a.level ?? 0) - (b.level ?? 0);
      }
      const nameA = a.name || a.nameEn || '';
      const nameB = b.name || b.nameEn || '';
      return nameA.localeCompare(nameB);
    });
  }, [learnedSpells]);

  const filteredSpells = useMemo(() => {
    let list = sortedSpells;
    if (activeLevelFilter !== 'all') {
      list = list.filter((s) => s.level === activeLevelFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => {
        const name = (s.name || s.nameEn || '').toLowerCase();
        const school = (s.school || '').toLowerCase();
        return name.includes(q) || school.includes(q);
      });
    }
    return list;
  }, [sortedSpells, activeLevelFilter, searchQuery]);

  // Actions
  const handlePrepareSpell = (spellKey: string) => {
    showPrepareSpellDialog(pc, spellKey, () => {});
  };

  const handleCastSpontaneous = (spellKey: string) => {
    showCastSpontaneousSpellDialog(pc, spellKey, () => {});
  };

  const handleRemoveSpell = (key: string) => {
    showCustomConfirm(
      'Remove Spell?',
      'Do you really want to remove this spell from your spellbook / learned spells?',
      () => {
        CombatState.updatePCBatch((freshPc: any) => {
          if (Array.isArray(freshPc.learnedSpells)) {
            freshPc.learnedSpells = freshPc.learnedSpells.filter((k: string) => k !== key);
          }
        });
      }
    );
  };

  const wizTooltip = useMemo(() => {
    if (!quotaStats.wizBudget) return '';
    const wb = quotaStats.wizBudget;
    const lines = [
      `Zauberbuch (D&D 3.5e RAW):`,
      `• Gesamt: ${wb.currentNonCantrip} / ${wb.maxFromLevelUps} Zauber (Levelups: 3+INT bei Lvl 1, +2 pro Stufe)`,
      `• Cantrips: ${wb.currentCantrips} (zählen nicht zum Budget)`,
      `• Max. Zaubergrad: ${quotaStats.maxWizLvl >= 0 ? quotaStats.maxWizLvl : '-'}`,
      `--- Aufschlüsselung pro Grad ---`,
    ];
    for (let g = 1; g <= Math.max(1, quotaStats.maxWizLvl); g++) {
      const used = wb.perLevelUsed[g] || 0;
      const cap = wb.perLevelCaps[g];
      const isOver = wb.isLevelOverCap(g);
      const capStr = cap !== undefined && cap !== Infinity ? ` / ${cap}` : '';
      lines.push(`• Grad ${g}: ${used}${capStr} Zauber${isOver ? ' ⚠️ Limit überschritten!' : ''}`);
    }
    return lines.join('\n');
  }, [quotaStats.wizBudget, quotaStats.maxWizLvl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {/* Spell Capacity & Quota Info Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(200, 169, 110, 0.12)',
          border: '0.5px solid var(--pb)',
          borderRadius: '3px',
          padding: '3px 6px',
          fontSize: '8px',
          fontFamily: 'var(--font-title)',
          color: 'var(--ink)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {quotaStats.isSpontaneous ? (
            <span>
              ✨ <strong>Known Spells:</strong> {quotaStats.totalCurrent} / {quotaStats.totalMaxSpontaneous}
            </span>
          ) : quotaStats.isWizard && quotaStats.wizBudget ? (
            <span
              title={wizTooltip}
              style={{ cursor: 'help' }}
            >
              📖 <strong>Zauberbuch:</strong>{' '}
              <strong style={{
                color: (quotaStats.wizBudget.overCap || quotaStats.wizBudget.anyLevelOverCap) ? '#c0392b'
                  : quotaStats.wizBudget.atCap ? '#1a6b1a'
                  : 'var(--red)',
              }}>
                {quotaStats.wizBudget.currentNonCantrip}
              </strong>{' '}/ {quotaStats.wizBudget.maxFromLevelUps}{' '}
              <span style={{ fontWeight: 'normal', color: 'var(--inkm)', fontSize: '7px' }}>Zauber</span>
              {quotaStats.wizBudget.currentCantrips > 0 && (
                <span style={{ marginLeft: '5px', fontSize: '7px', color: 'var(--inkl)', fontWeight: 'normal' }}>
                  +{quotaStats.wizBudget.currentCantrips} Cantrips
                </span>
              )}
              {(quotaStats.wizBudget.overCap || quotaStats.wizBudget.anyLevelOverCap) && (
                <span style={{ marginLeft: '4px', color: '#c0392b', fontWeight: 'bold' }} title="Limit überschritten!">
                  ⚠️
                </span>
              )}
            </span>
          ) : (
            <span>
              📜 <strong>Spellbook:</strong> {quotaStats.totalCurrent} Spells
            </span>
          )}
        </div>

        {quotaStats.isWizard && quotaStats.maxWizLvl >= 0 && (
          <div style={{ fontSize: '7.5px', color: 'var(--inkm)' }}>
            Max Grad {quotaStats.maxWizLvl}
          </div>
        )}
      </div>

      {/* Controls: Filter Pills and Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setActiveLevelFilter('all')}
            style={{
              fontSize: '7.5px',
              padding: '1px 5px',
              height: '17px',
              borderRadius: '2px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              background: activeLevelFilter === 'all' ? 'var(--red)' : 'rgba(200, 169, 110, 0.1)',
              border: activeLevelFilter === 'all' ? '0.5px solid var(--red)' : '0.5px solid var(--pb)',
              color: activeLevelFilter === 'all' ? '#ffffff' : 'var(--inkm)',
              cursor: 'pointer',
            }}
          >
            All ({quotaStats.totalCurrent})
          </button>
          {levelsToRender.map((lvl) => {
            const stat = quotaStats.perLevel[lvl];
            const countAtLvl = stat?.count || 0;
            const isSpont = stat?.isSpontaneous && stat.maxKnown !== undefined;
            const isFull = isSpont && countAtLvl >= (stat.maxKnown || 0);
            const isWizCap = quotaStats.isWizard && lvl > 0 && stat?.wizardCap !== undefined;
            const isWizOver = stat?.isWizardOverCap || false;
            const isWizAt = isWizCap && countAtLvl >= (stat?.wizardCap || 0);

            let label = `${lvl === 0 ? '0' : lvl}`;
            if (isSpont) {
              label += ` (${countAtLvl}/${stat.maxKnown})`;
            } else if (isWizCap) {
              label += ` (${countAtLvl}/${stat.wizardCap})`;
            } else if (countAtLvl > 0) {
              label += ` (${countAtLvl})`;
            }

            const isWarning = isWizOver || (isSpont && countAtLvl > (stat.maxKnown || 0));

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setActiveLevelFilter(lvl)}
                style={{
                  fontSize: '7.5px',
                  padding: '1px 4px',
                  height: '17px',
                  borderRadius: '2px',
                  fontFamily: 'var(--font-title)',
                  fontWeight: 'bold',
                  background:
                    activeLevelFilter === lvl
                      ? 'var(--red)'
                      : isWarning
                      ? 'rgba(192, 57, 43, 0.15)'
                      : 'rgba(200, 169, 110, 0.1)',
                  border:
                    activeLevelFilter === lvl
                      ? '0.5px solid var(--red)'
                      : isWarning
                      ? '0.5px solid #c0392b'
                      : isFull || isWizAt
                      ? '0.5px solid rgba(139, 26, 26, 0.4)'
                      : '0.5px solid var(--pb)',
                  color:
                    activeLevelFilter === lvl
                      ? '#ffffff'
                      : isWarning
                      ? '#c0392b'
                      : 'var(--inkm)',
                  cursor: 'pointer',
                }}
                title={
                  isWarning
                    ? `Limit für Grad ${lvl} überschritten (${countAtLvl}/${isWizCap ? stat.wizardCap : stat?.maxKnown})!`
                    : isWizCap
                    ? `Grad ${lvl}: ${countAtLvl} / ${stat.wizardCap} Zauber im Buch`
                    : isSpont
                    ? `Grad ${lvl}: ${countAtLvl} / ${stat?.maxKnown} Zauber bekannt`
                    : `Level ${lvl}`
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            type="text"
            placeholder="🔍 Search spellbook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cinput"
            style={{
              fontSize: '8.5px',
              height: '19px',
              padding: '0 6px',
              borderRadius: '2px',
              borderColor: 'var(--pb)',
              flex: 1,
            }}
          />
          <button
            type="button"
            onClick={onOpenCompendium}
            className="btn"
            style={{
              fontSize: '7.5px',
              padding: '1px 6px',
              height: '19px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              color: 'var(--red)',
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
            title="Browse the complete D&D 3.5e spell compendium to learn new spells"
          >
            + Add Spells
          </button>
        </div>
      </div>

      {/* Spell List (Compact Rows ~22px) */}
      <div
        className="pc-library-scroll custom-scrollbar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflowY: 'auto',
          maxHeight: '460px',
          paddingRight: '4px',
          scrollbarGutter: 'stable',
        }}
      >
        {filteredSpells.length === 0 ? (
          <div
            style={{
              fontSize: '8.5px',
              color: 'var(--inkl)',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '30px 10px',
              background: 'rgba(0, 0, 0, 0.02)',
              border: '0.5px dashed var(--pb)',
              borderRadius: '2px',
            }}
          >
            {learnedSpells.length === 0 ? (
              <span>
                Your spellbook is empty.{' '}
                <span
                  onClick={onOpenCompendium}
                  style={{ color: 'var(--red)', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Click here to add spells from the Compendium!
                </span>
              </span>
            ) : (
              'No spells match the current filter.'
            )}
          </div>
        ) : (
          filteredSpells.map((s, idx) => {
            const isWizOver = quotaStats.isWizard && s.level > 0 && quotaStats.wizBudget ? (
              quotaStats.wizBudget.isLevelOverCap(s.level) || quotaStats.wizBudget.overCap
            ) : false;
            let overCapReason: string | undefined;
            if (isWizOver && quotaStats.wizBudget) {
              if (quotaStats.wizBudget.isLevelOverCap(s.level)) {
                overCapReason = `Limit für Grad ${s.level} überschritten (${quotaStats.wizBudget.perLevelUsed[s.level]}/${quotaStats.wizBudget.perLevelCaps[s.level]} Zauber aus Levelups)!`;
              } else {
                overCapReason = `Gesamtbudget überschritten (${quotaStats.wizBudget.currentNonCantrip}/${quotaStats.wizBudget.maxFromLevelUps} Zauber aus Levelups)!`;
              }
            }

            return (
              <SpellLibraryItemRow
                key={s.id}
                pc={pc}
                s={s}
                idx={idx}
                hasPrepared={hasPrepared}
                hasSpontaneous={hasSpontaneous}
                isOverCap={isWizOver}
                overCapReason={overCapReason}
                onPrepare={handlePrepareSpell}
                onCastSpontaneous={handleCastSpontaneous}
                onRemove={handleRemoveSpell}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
