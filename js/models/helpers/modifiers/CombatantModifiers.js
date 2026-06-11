/**
 * @module    CombatantModifiers
 * @summary   Orchestriert das Leeren und Neuberechnen aller temporären Modifikatoren auf den Stat-Instanzen des Charakters.
 * @exports   rebuildCombatantModifiers(pc)
 * @reads     pc.str, pc.dex, pc.con, pc.int, pc.wis, pc.cha, pc.baseZa, pc.baseRef, pc.baseWil, pc.bab, pc.ac, pc.acTouch, pc.acFlat, pc.za, pc.ref, pc.wil
 * @stateOps  keine
 * @depends   ItemModifierApplier, BaseSavingThrowModifierApplier, SpellModifierApplier, ClassModifierApplier, FeatModifierApplier, SpeedRecalculator
 * @notHere   Konkrete Boni-Berechnungen -> Sub-Helper Dateien (ItemModifierApplier etc.)
 */

import { applyItemModifiers } from './ItemModifierApplier.js';
import { applyBaseSavingThrowModifiers } from './BaseSavingThrowModifierApplier.js';
import { applySpellModifiers } from './SpellModifierApplier.js';
import { applyClassModifiers } from './ClassModifierApplier.js';
import { applyFeatModifiers } from './FeatModifierApplier.js';
import { recalculateSpeed } from './SpeedRecalculator.js';

export function rebuildCombatantModifiers(pc) {
  const statsList = [
    pc.str, pc.dex, pc.con, pc.int, pc.wis, pc.cha,
    pc.baseZa, pc.baseRef, pc.baseWil, pc.bab,
    pc.ac, pc.acTouch, pc.acFlat,
    pc.za, pc.ref, pc.wil
  ];
  
  // Clear all previously active spell/buff, class, feat and item modifiers
  statsList.forEach(s => {
    s.modifiers = s.modifiers.filter(m => !m.isSpell && !m.isClass && !m.isFeat && !m.isItem);
  });

  // Apply Magic Items Modifiers first (so attributes are updated for saves/AC calculations)
  applyItemModifiers(pc);

  // Sync current saves bases to class-level base saving throws
  pc.za.base = pc.baseZa.getValue();
  pc.ref.base = pc.baseRef.getValue();
  pc.wil.base = pc.baseWil.getValue();

  // Helper for attribute mod calculations
  const getMod = (score) => {
    const s = parseInt(score) || 10;
    return s >= 10 ? Math.floor((s - 10) / 2) : (s === 9 || s === 8 ? -1 : (s === 7 || s === 6 ? -2 : (s === 5 || s === 4 ? -4 : -5)));
  };

  applySpellModifiers(pc);
  applyClassModifiers(pc, getMod);
  applyFeatModifiers(pc, getMod);
  applyBaseSavingThrowModifiers(pc, getMod);
  recalculateSpeed(pc);
}
