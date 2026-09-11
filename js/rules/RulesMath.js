/**
 * @module    RulesMath
 * @summary   Progression math calculators (calculateBab, calculateSave) and the canonical D&D 3.5e ability modifier formula.
 * @exports   calculateBab, calculateSave, getAblMod
 */

/**
 * RAW D&D 3.5e ability modifier formula: floor((score - 10) / 2), applies universally to all scores
 * including values below 10 (verified against PHB Chapter 1, "Average Ability Scores" tables).
 * Accepts either a raw numeric score or a Stat-like object exposing getValue().
 */
export function getAblMod(scoreOrStat) {
  const score = typeof scoreOrStat?.getValue === 'function' ? scoreOrStat.getValue() : (parseInt(scoreOrStat) || 10);
  return Math.floor((score - 10) / 2);
}

export function calculateBab(progression, level) {
  const lvl = parseInt(level) || 1;
  if (progression === 'good' || progression === 'full') return lvl;
  if (progression === 'avg') return Math.floor(0.75 * lvl);
  if (progression === 'poor') return Math.floor(0.5 * lvl);
  return 0; // custom/manual
}

export function calculateSave(progression, level) {
  const lvl = parseInt(level) || 1;
  if (progression === 'good') return 2 + Math.floor(0.5 * lvl);
  if (progression === 'poor') return Math.floor(lvl / 3);
  return 0; // custom/manual
}
