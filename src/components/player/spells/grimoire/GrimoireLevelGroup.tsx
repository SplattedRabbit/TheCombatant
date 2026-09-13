/**
 * @module    GrimoireLevelGroup
 * @summary   Renders a single spell level: Sub-header with DC & slot count, active spell rows, empty slots, and spent spells.
 */

import React from 'react';
import { GrimoireSpellRow } from './GrimoireSpellRow';
import { GrimoireEmptySlotRow } from './GrimoireEmptySlotRow';
import { GrimoireSpentSpells } from './GrimoireSpentSpells';
import { openPrepareSlotDialog } from './grimoireActions';
import { findSpell } from '../PCSpellbookTab';
import { SpellSlotCalculator } from '@core/rules/SpellSlotCalculator.js';
import {
  SORCERER_KNOWN_TABLE,
  BARD_KNOWN_TABLE,
  getEffectiveCasterLevel,
  getMaxSpellLevel,
} from '@core/rules.js';


interface GrimoireLevelGroupProps {
  pc: any;
  lvl: number;
  casterMod: number;
  hasPrepared: boolean;
  hasSpontaneous: boolean;
  hasSpecSlot: boolean;
  wizardSpecialization: string;
  searchQuery: string;
  onOpenCompendium: () => void;
}

export const GrimoireLevelGroup: React.FC<GrimoireLevelGroupProps> = ({
  pc,
  lvl,
  casterMod,
  hasPrepared,
  hasSpontaneous,
  hasSpecSlot,
  wizardSpecialization,
  searchQuery,
  onOpenCompendium,
}) => {
  const max = pc.spellSlots?.[lvl]?.max || 0;
  const used = pc.spellSlots?.[lvl]?.used || 0;
  const remaining = Math.max(0, max - used);

  const preparedSpells: any[] = Array.isArray(pc.preparedSpells) ? pc.preparedSpells : [];
  const learnedSpells: any[] = Array.isArray(pc.learnedSpells) ? pc.learnedSpells : [];

  const learnedCountAtLvl = learnedSpells
    .map((k: any) => (typeof k === 'string' ? findSpell(pc, k) : k))
    .filter((s: any) => s && s.level === lvl).length;

  const isSorc = Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'sorcerer');
  const isBard = Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'bard');
  let maxKnown: number | undefined = undefined;
  if (isSorc) {
    const cl = getEffectiveCasterLevel(pc, 'sorcerer');
    const row = SORCERER_KNOWN_TABLE[Math.max(1, Math.min(20, cl))] || [];
    maxKnown = (maxKnown || 0) + (row[lvl] || 0);
  }
  if (isBard) {
    const cl = getEffectiveCasterLevel(pc, 'bard');
    const row = BARD_KNOWN_TABLE[Math.max(1, Math.min(20, cl))] || [];
    maxKnown = (maxKnown || 0) + (row[lvl] || 0);
  }

  // Wizard access calculation
  const isWiz = Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'wizard');
  let wizAccessible = false;
  let wizIntSufficient = false;
  let wizMaxLvl = -1;
  if (isWiz) {
    const wizCL = getEffectiveCasterLevel(pc, 'wizard');
    wizMaxLvl = getMaxSpellLevel('wizard', wizCL);
    wizAccessible = lvl === 0 || lvl <= wizMaxLvl; // cantrips always accessible
    const intScore = typeof pc.int?.getValue === 'function' ? pc.int.getValue() : (pc.int || 10);
    wizIntSufficient = lvl === 0 || intScore >= (10 + lvl); // RAW: INT score ≥ 10 + spell level
  }

  let activeLevelSpells: any[] = [];
  let spentLevelSpells: any[] = [];

  if (hasPrepared) {
    const levelPreps = preparedSpells.filter((p: any) => {
      if (p.preparedLevel !== undefined && p.preparedLevel === lvl) return true;
      const sp = findSpell(pc, p.spellKey || p.id);
      if (!sp) return false;
      const finalLvl = SpellSlotCalculator.getAdjustedSpellLevel(sp, p.metamagic, pc);
      return finalLvl === lvl;
    });
    activeLevelSpells = levelPreps.filter((p: any) => !p.isUsed);
    spentLevelSpells = levelPreps.filter((p: any) => p.isUsed);
  } else if (hasSpontaneous) {
    const knownAtLvl = learnedSpells
      .map((k: any) => (typeof k === 'string' ? findSpell(pc, k) : k))
      .filter((s: any) => s && s.level === lvl);
    activeLevelSpells = knownAtLvl;
  }

  // Filter by search query if present
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    activeLevelSpells = activeLevelSpells.filter((item: any) => {
      const name = (item.name || item.nameEn || item.spellKey || '').toLowerCase();
      const school = (item.school || '').toLowerCase();
      return name.includes(q) || school.includes(q);
    });
  }

  // If search query active and no results, hide level section
  if (searchQuery && activeLevelSpells.length === 0 && spentLevelSpells.length === 0) {
    return null;
  }

  // Calculate empty slots for prepared casters
  const totalPreparedCount = activeLevelSpells.length + spentLevelSpells.length;
  const emptySlotCount = hasPrepared && !searchQuery ? Math.max(0, max - totalPreparedCount) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '3px' }}>
      {/* Tight Level Sub-Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(200, 169, 110, 0.15)',
          border: '0.5px solid rgba(200, 169, 110, 0.3)',
          borderRadius: '2px',
          padding: '2px 5px',
          fontSize: '8px',
          fontWeight: 'bold',
          fontFamily: 'var(--font-title)',
          color: 'var(--red)',
        }}
      >
        <span>{lvl === 0 ? 'Cantrips (Level 0)' : `Spell Level ${lvl}`}</span>
        <div style={{ display: 'flex', gap: '5px', fontSize: '7px', color: 'var(--inkm)', fontWeight: 'normal' }}>
          <span>Save DC: <strong>{10 + lvl + casterMod}</strong></span>
          {hasSpontaneous && maxKnown !== undefined ? (
            <span>Known: <strong style={{ color: 'var(--red)' }}>{learnedCountAtLvl}/{maxKnown}</strong></span>
          ) : isWiz ? (
            // Wizard: show accessibility gate, not a count limit
            wizAccessible && wizIntSufficient ? (
              <span title={`In Book: ${learnedCountAtLvl} spells. No cap — scribing unlimited.`}>
                In Book: <strong style={{ color: '#1a6b1a' }}>{learnedCountAtLvl}</strong>{' '}
                <span style={{ color: '#1a6b1a' }}>✓</span>
              </span>
            ) : !wizAccessible ? (
              <span title={`Requires Wizard Level ${lvl * 2 - 1} to access Level ${lvl} spells. Current max: Level ${wizMaxLvl}.`}
                style={{ color: 'var(--inkm)', cursor: 'help' }}>
                🔒 Level {lvl <= wizMaxLvl + 1 ? `${lvl * 2 - 1} req.` : 'not yet'}
              </span>
            ) : (
              <span title={`INT too low: need ${10 + lvl}, have ${typeof pc.int?.getValue === 'function' ? pc.int.getValue() : (pc.int || 10)}`}
                style={{ color: '#c0392b', cursor: 'help' }}>
                ⚠️ INT zu niedrig
              </span>
            )
          ) : (
            <span>In Book: <strong style={{ color: 'var(--red)' }}>{learnedCountAtLvl}</strong></span>
          )}
          <span>Slots: <strong>{remaining}/{max}</strong></span>
        </div>
      </div>

      {/* Active Ready Spells */}
      {activeLevelSpells.map((item: any, idx: number) => (
        <GrimoireSpellRow
          key={item.id || `${item.spellKey}-${idx}`}
          pc={pc}
          item={item}
          idx={idx}
          lvl={lvl}
          casterMod={casterMod}
          remainingSlots={remaining}
          hasPrepared={hasPrepared}
          hasSpontaneous={hasSpontaneous}
        />
      ))}

      {/* Empty / Unfilled Slots */}
      {Array.from({ length: emptySlotCount }).map((_, emptyIdx) => {
        const isSpecEmpty = hasSpecSlot && lvl >= 1 && totalPreparedCount + emptyIdx === max - 1;
        return (
          <GrimoireEmptySlotRow
            key={`empty-${emptyIdx}`}
            lvl={lvl}
            isSpecialistSlot={isSpecEmpty}
            wizardSpecialization={wizardSpecialization}
            onClick={() => openPrepareSlotDialog(pc, lvl, onOpenCompendium)}
          />
        );
      })}

      {/* Expended Spells Summary */}
      <GrimoireSpentSpells pc={pc} spentSpells={spentLevelSpells} lvl={lvl} />
    </div>
  );
};
