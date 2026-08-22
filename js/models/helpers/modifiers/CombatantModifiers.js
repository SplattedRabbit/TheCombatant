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
  
  // Clear all previously active spell/buff, class, feat, item and race modifiers
  statsList.forEach(s => {
    s.modifiers = s.modifiers.filter(m => !m.isSpell && !m.isClass && !m.isFeat && !m.isItem && !m.isRace);
  });

  // Apply Race Modifiers first (so attributes are updated before items/feats/saves are recalculated)
  applyRaceModifiers(pc);

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

function addRaceModifier(stat, value, type, source) {
  stat.addModifier(value, type, source);
  if (stat.modifiers.length > 0) {
    stat.modifiers[stat.modifiers.length - 1].isRace = true;
  }
}

function applyRaceModifiers(pc) {
  const race = (pc.race || 'human').toLowerCase();
  const inWildShape = pc.activeShape !== 'none';

  // @feature:wildshape — Physische Rassenmodifikatoren in Tiergestalt ignorieren (RAW)
  // 1. Attribute Modifiers
  if (race === 'dwarf') {
    if (!inWildShape) addRaceModifier(pc.con, 2, 'racial', 'Volk (Zwerg)');
    addRaceModifier(pc.cha, -2, 'racial', 'Volk (Zwerg)');
  } else if (race === 'elf') {
    if (!inWildShape) {
      addRaceModifier(pc.dex, 2, 'racial', 'Volk (Elf)');
      addRaceModifier(pc.con, -2, 'racial', 'Volk (Elf)');
    }
  } else if (race === 'gnome') {
    if (!inWildShape) {
      addRaceModifier(pc.con, 2, 'racial', 'Volk (Gnom)');
      addRaceModifier(pc.str, -2, 'racial', 'Volk (Gnom)');
    }
  } else if (race === 'halfling' || race === 'deep_halfling') {
    if (!inWildShape) {
      addRaceModifier(pc.dex, 2, 'racial', 'Volk (Halbling)');
      addRaceModifier(pc.str, -2, 'racial', 'Volk (Halbling)');
    }
  } else if (race === 'half_orc') {
    if (!inWildShape) addRaceModifier(pc.str, 2, 'racial', 'Volk (Halbork)');
    addRaceModifier(pc.int, -2, 'racial', 'Volk (Halbork)');
    addRaceModifier(pc.cha, -2, 'racial', 'Volk (Halbork)');
  } else if (race === 'tiefling') {
    if (!inWildShape) {
      addRaceModifier(pc.dex, 2, 'racial', 'Volk (Tiefling)');
      addRaceModifier(pc.int, 2, 'racial', 'Volk (Tiefling)');
    }
    addRaceModifier(pc.cha, -2, 'racial', 'Volk (Tiefling)');
  } else if (race === 'anima_construct') {
    if (!inWildShape) {
      addRaceModifier(pc.con, 2, 'racial', 'Volk (Anima-Konstrukt)');
      addRaceModifier(pc.ac, 1, 'natural', 'Volk (Anima-Konstrukt)');
      addRaceModifier(pc.acFlat, 1, 'natural', 'Volk (Anima-Konstrukt)');
    }
    addRaceModifier(pc.cha, -2, 'racial', 'Volk (Anima-Konstrukt)');
  }

  // 3. Saving Throw Modifiers
  if (race === 'halfling' || race === 'deep_halfling') {
    addRaceModifier(pc.za, 1, 'racial', 'Volk (Halbling)');
    addRaceModifier(pc.ref, 1, 'racial', 'Volk (Halbling)');
    addRaceModifier(pc.wil, 1, 'racial', 'Volk (Halbling)');
  }
}
