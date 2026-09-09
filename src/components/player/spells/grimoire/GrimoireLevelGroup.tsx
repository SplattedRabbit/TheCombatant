/**
 * @module    GrimoireLevelGroup
 * @summary   Renders a single spell level: Sub-header with DC & slot count, active spell rows, empty slots, and spent spells.
 */

import React from 'react';
import { GrimoireSpellRow } from './GrimoireSpellRow';
import { GrimoireEmptySlotRow } from './GrimoireEmptySlotRow';
import { GrimoireSpentSpells } from './GrimoireSpentSpells';
import { openPrepareSlotDialog } from './grimoireActions';

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

  let activeLevelSpells: any[] = [];
  let spentLevelSpells: any[] = [];

  if (hasPrepared) {
    const levelPreps = preparedSpells.filter((p: any) => {
      const sp = p.spellKey ? pc.learnedSpells?.find?.((k: string) => k === p.spellKey) : null;
      return p.preparedLevel === lvl || (!p.preparedLevel && sp?.level === lvl);
    });
    activeLevelSpells = levelPreps.filter((p: any) => !p.isUsed);
    spentLevelSpells = levelPreps.filter((p: any) => p.isUsed);
  } else if (hasSpontaneous) {
    const knownAtLvl = learnedSpells
      .map((k: string) => (typeof k === 'object' ? k : { id: k, spellKey: k }))
      .filter((s: any) => {
        const fullSp = s.level !== undefined ? s : pc.learnedSpells?.find?.((item: any) => item.id === s.spellKey);
        return fullSp?.level === lvl;
      });
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
