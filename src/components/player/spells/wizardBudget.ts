/**
 * @module    wizardBudget
 * @summary   D&D 3.5e RAW wizard spellbook budget calculator.
 *
 * Rule (PHB p.52-57):
 *   Level 1: (3 + INT mod, min 1) non-cantrip spells + ALL cantrips
 *   Each subsequent level: +2 non-cantrip spells (free from research)
 *   App assumption: player only added spells during level-ups.
 *
 * Cantrips excluded: wizards get all cantrips at level 1.
 */

import { getAblMod } from '../attributeHelper';
import { getEffectiveCasterLevel } from '@core/rules.js';

export interface WizardBudget {
  wizCL: number;
  maxFromLevelUps: number;
  currentNonCantrip: number;
  currentCantrips: number;
  totalLearned: number;
  atCap: boolean;
  overCap: boolean;
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

  const currentCantrips = resolvedLearnedSpells.filter(s => s != null && s.level === 0).length;
  const currentNonCantrip = resolvedLearnedSpells.filter(s => s != null && (s.level ?? 0) > 0).length;
  const totalLearned = resolvedLearnedSpells.filter(s => s != null).length;

  return {
    wizCL,
    maxFromLevelUps,
    currentNonCantrip,
    currentCantrips,
    totalLearned,
    atCap: currentNonCantrip >= maxFromLevelUps,
    overCap: currentNonCantrip > maxFromLevelUps,
  };
}
