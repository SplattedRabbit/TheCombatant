/**
 * @module    RulesMath
 * @summary   Progression math calculators (calculateBab, calculateSave)
 * @exports   calculateBab, calculateSave
 */

export function calculateBab(progression, level) {
  const lvl = parseInt(level) || 1;
  if (progression === 'good') return lvl;
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
