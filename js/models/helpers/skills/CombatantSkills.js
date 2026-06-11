/**
 * @module    CombatantSkills
 * @summary   Orchestriert die Berechnung des finalen Fertigkeitsmodifikators.
 * @exports   calculateSkillModifier(pc, skillKey)
 * @reads     pc.conditions
 * @stateOps  keine
 * @depends   SKILLS_REGISTRY, SkillBaseCalculator, SkillSynergyResolver, SkillFeatApplier
 * @notHere   Einzelberechnungen -> Sub-Helper Dateien (SkillBaseCalculator etc.)
 */

import { SKILLS_REGISTRY } from '../../../data/skills-data.js';
import { calculateBaseSkillValue } from './SkillBaseCalculator.js';
import { resolveSynergyBonuses } from './SkillSynergyResolver.js';
import { applyFeatSkillBonuses } from './SkillFeatApplier.js';

export function calculateSkillModifier(pc, skillKey) {
  const skillDef = SKILLS_REGISTRY[skillKey];
  if (!skillDef) return 0;

  let total = 0;

  // 1. Base (Ranks + Attribut + ACP)
  total += calculateBaseSkillValue(pc, skillKey, skillDef);

  // 2. Synergy
  total += resolveSynergyBonuses(pc, skillKey);

  // 3. Feats
  total += applyFeatSkillBonuses(pc, skillKey, skillDef);

  // 3.5. Racial skill bonuses
  const race = (pc.race || 'human').toLowerCase();
  if (race === 'dwarf') {
    if (skillKey === 'craft') total += 2;
  } else if (race === 'elf') {
    if (['listen', 'search', 'spot'].includes(skillKey)) total += 2;
  } else if (race === 'gnome') {
    if (skillKey === 'listen' || skillKey === 'craft') total += 2;
  } else if (race === 'halfling') {
    if (['climb', 'jump', 'move_silently', 'listen'].includes(skillKey)) total += 2;
  } else if (race === 'half_elf') {
    if (['listen', 'search', 'spot'].includes(skillKey)) total += 1;
    if (['diplomacy', 'gather_information'].includes(skillKey)) total += 2;
  }

  // 4. Conditions penalties (Shaken / Sickened)
  const hasShaken = pc.conditions.some(c => c === 'Erschüttet' || (c && c.n === 'Erschüttet') || c === 'Schüttelnd' || (c && c.n === 'Schüttelnd'));
  if (hasShaken) {
    total -= 2;
  }

  return total;
}
