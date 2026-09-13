/**
 * @module    wizardBudget
 * @summary   D&D 3.5e RAW wizard spellbook budget calculator.
 *
 * Rule (PHB p.52-57):
 *   Level 1: (3 + INT mod, min 1) non-cantrip spells + ALL cantrips
 *   Each subsequent level: +2 non-cantrip spells (free from research)
 *   App assumption: player only added spells during level-ups.
 *
 * Per-Spell-Level Cap (RAW Organic Leveling):
 *   A wizard unlocks spell level G at wizard caster level W_G = 2 * G - 1 (for G >= 1).
 *   At each wizard level up, a wizard can choose up to 2 spells of any level they can cast.
 *   Therefore, the maximum number of spells of level G (>1) they could have gained organically is:
 *     max_G = (wizCL - W_G + 1) * 2
 *   For G = 1, they could have placed all subsequent level-ups into 1st level spells:
 *     max_1 = startingSpells + 2 * (wizCL - 1) = maxFromLevelUps.
 *   Cantrips (G = 0) are not subject to the level-up budget (wizard gets all cantrips).
 */

import { getAblMod } from '../attributeHelper.ts';
import { getEffectiveCasterLevel } from '../../../../js/rules.js';

export interface WizardBudget {
  wizCL: number;
  maxFromLevelUps: number;
  currentNonCantrip: number;
  currentCantrips: number;
  totalLearned: number;
  atCap: boolean;
  overCap: boolean;
  perLevelCaps: Record<number, number>;
  perLevelUsed: Record<number, number>;
  anyLevelOverCap: boolean;
  isLevelOverCap: (level: number) => boolean;
  isLevelAtCap: (level: number) => boolean;
  canAddSpell: (level: number) => { allowed: boolean; reason?: string };
}

export function computeWizardBudget(
  pc: any,
  resolvedLearnedSpells: Array<{ level: number } | null | undefined>
): WizardBudget {
  const wizCL = getEffectiveCasterLevel(pc, 'wizard');
  const intScore =
    typeof pc.int?.getValue === 'function' ? pc.int.getValue() : (Number(pc.int) || 10);
  const intMod = getAblMod(intScore);

  const startingSpells = Math.max(1, 3 + intMod);
  const maxFromLevelUps = wizCL >= 1 ? startingSpells + 2 * (wizCL - 1) : 0;

  const perLevelUsed: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  let currentCantrips = 0;
  let currentNonCantrip = 0;
  let totalLearned = 0;

  for (const s of resolvedLearnedSpells) {
    if (!s) continue;
    totalLearned++;
    const lvl = typeof s.level === 'number' ? s.level : 0;
    perLevelUsed[lvl] = (perLevelUsed[lvl] || 0) + 1;
    if (lvl === 0) {
      currentCantrips++;
    } else {
      currentNonCantrip++;
    }
  }

  // Calculate per-level caps
  const perLevelCaps: Record<number, number> = {
    0: Infinity,
    1: maxFromLevelUps,
  };

  for (let g = 2; g <= 9; g++) {
    const unlockLevel = 2 * g - 1;
    if (wizCL < unlockLevel) {
      perLevelCaps[g] = 0;
    } else {
      perLevelCaps[g] = (wizCL - unlockLevel + 1) * 2;
    }
  }

  const isLevelOverCap = (level: number): boolean => {
    if (level === 0) return false;
    const cap = perLevelCaps[level] ?? 0;
    const used = perLevelUsed[level] ?? 0;
    return used > cap;
  };

  const isLevelAtCap = (level: number): boolean => {
    if (level === 0) return false;
    const cap = perLevelCaps[level] ?? 0;
    const used = perLevelUsed[level] ?? 0;
    return used >= cap;
  };

  let anyLevelOverCap = currentNonCantrip > maxFromLevelUps;
  if (!anyLevelOverCap) {
    for (let g = 1; g <= 9; g++) {
      if (isLevelOverCap(g)) {
        anyLevelOverCap = true;
        break;
      }
    }
  }

  const canAddSpell = (level: number): { allowed: boolean; reason?: string } => {
    if (level === 0) {
      return { allowed: true };
    }
    if (wizCL < 1) {
      return { allowed: false, reason: 'Keine Zaubererstufen vorhanden.' };
    }
    const unlockLevel = 2 * level - 1;
    if (wizCL < unlockLevel) {
      return {
        allowed: false,
        reason: `Zaubergrad ${level} wird erst ab Zaubererstufe ${unlockLevel} freigeschaltet (aktuell: ${wizCL}).`,
      };
    }
    const cap = perLevelCaps[level] ?? 0;
    const used = perLevelUsed[level] ?? 0;
    if (used >= cap) {
      return {
        allowed: false,
        reason: `Limit für Grad ${level} erreicht (${used}/${cap} Zauber aus Levelups erlaubt).`,
      };
    }
    if (currentNonCantrip >= maxFromLevelUps) {
      return {
        allowed: false,
        reason: `Gesamtbudget für Zauber erreicht (${currentNonCantrip}/${maxFromLevelUps} Zauber aus Levelups).`,
      };
    }
    return { allowed: true };
  };

  return {
    wizCL,
    maxFromLevelUps,
    currentNonCantrip,
    currentCantrips,
    totalLearned,
    atCap: currentNonCantrip >= maxFromLevelUps,
    overCap: currentNonCantrip > maxFromLevelUps,
    perLevelCaps,
    perLevelUsed,
    anyLevelOverCap,
    isLevelOverCap,
    isLevelAtCap,
    canAddSpell,
  };
}
