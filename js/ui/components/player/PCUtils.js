/**
 * Common D&D 3.5e UI Utility and helper functions
 */

export function fillCls(pct, hp) {
  if (hp <= 0) return 'fill-dead';
  if (pct > 50) return 'fill-ok';
  if (pct > 25) return 'fill-warn';
  return 'fill-crit';
}

export function hpPct(c) {
  return c.maxHP > 0 ? Math.max(0, Math.min(100, c.hp / c.maxHP * 100)) : 0;
}

export function formatMod(mod) {
  return (mod >= 0 ? '+' : '') + mod;
}

export function getAblMod(score) {
  const s = parseInt(score) || 10;
  if (s >= 10) {
    return Math.floor((s - 10) / 2);
  }
  if (s === 9 || s === 8) return -1;
  if (s === 7 || s === 6) return -2;
  if (s === 5 || s === 4) return -4;
  if (s === 3) return -5;
  return -5;
}
