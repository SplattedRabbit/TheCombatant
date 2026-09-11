/**
 * @module    helpers.skills
 * @summary   Skill-point calculation utilities for the Character Creation Wizard.
 *            Computes skill points per level based on class, race and INT modifier (RAW D&D 3.5e).
 */

import { getMod, getRacialModifier } from './helpers';
import { CLASSES_LIST } from './constants';

// Calculate skill points available at the current level
export const getSkillPointsForLevel = (
  lvlIdx: number,
  clsKey: string,
  selectedRace: string,
  baseStats: { str: number; dex: number; con: number; int: number; wis: number; cha: number },
  currentDraft: any
) => {
  if (!clsKey) return 0;
  const clsDef = CLASSES_LIST.find(c => c.key === clsKey);
  const basePoints = clsDef ? clsDef.skillBase : 2;
  const intMod = currentDraft ? currentDraft.statMods.int : getMod(baseStats.int + getRacialModifier(selectedRace, 'int'));
  const isHuman = selectedRace === 'human';

  if (lvlIdx === 0) {
    // Level 1: (Base + IntMod) * 4 + Human bonus (+4)
    return Math.max(1, basePoints + intMod) * 4 + (isHuman ? 4 : 0);
  } else {
    // Level 2+: (Base + IntMod) + Human bonus (+1)
    return Math.max(1, basePoints + intMod) + (isHuman ? 1 : 0);
  }
};
