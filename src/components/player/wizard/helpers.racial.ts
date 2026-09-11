/**
 * @module    helpers.racial
 * @summary   Racial ability score modifier definitions and ability score modifier calculations for the wizard.
 * @feature   player/wizard
 * @exports   getRacialModifier, getMod, getRacialModifierString
 * @depends   attributeHelper.ts (kanonische getAblMod-Formel — getMod ist hier nur ein lokal etablierter Alias)
 */

import { getAblMod } from '../attributeHelper';

export const getRacialModifier = (race: string, stat: string): number => {
  if (race === 'elf') {
    if (stat === 'dex') return 2;
    if (stat === 'con') return -2;
  }
  if (race === 'dwarf') {
    if (stat === 'con') return 2;
    if (stat === 'cha') return -2;
  }
  if (race === 'gnome') {
    if (stat === 'con') return 2;
    if (stat === 'str') return -2;
  }
  if (race === 'halfling' || race === 'deep_halfling') {
    if (stat === 'dex') return 2;
    if (stat === 'str') return -2;
  }
  if (race === 'half_orc') {
    if (stat === 'str') return 2;
    if (stat === 'int') return -2;
    if (stat === 'cha') return -2;
  }
  if (race === 'tiefling') {
    if (stat === 'dex') return 2;
    if (stat === 'int') return 2;
    if (stat === 'cha') return -2;
  }
  if (race === 'anima_construct') {
    if (stat === 'con') return 2;
    if (stat === 'cha') return -2;
  }
  return 0;
};

export const getMod = getAblMod;

export const getRacialModifierString = (race: string, stat: string): string => {
  const mod = getRacialModifier(race, stat);
  if (mod > 0) return `+${mod}`;
  if (mod < 0) return `${mod}`;
  return '';
};
