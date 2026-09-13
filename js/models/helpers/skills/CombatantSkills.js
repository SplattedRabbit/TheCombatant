/**
 * @module    CombatantSkills
 * @summary   Orchestriert die Berechnung des finalen Fertigkeitsmodifikators und dessen detaillierter Aufschlüsselung.
 * @exports   calculateSkillModifier(pc, skillKey), getSkillModifierBreakdown(pc, skillKey)
 * @reads     pc.skills, pc.classes, pc.race, pc.feats, pc.conditions, pc.armors
 * @stateOps  keine
 * @depends   SKILLS_REGISTRY, SkillBaseCalculator, SkillSynergyResolver, SkillFeatApplier
 */

import { SKILLS_REGISTRY } from '../../../data/skills-data.js';
import { resolveSynergyBonuses } from './SkillSynergyResolver.js';
import { applyFeatSkillBonuses } from './SkillFeatApplier.js';
import { getItemModForSkill } from '../../../rules/RulesSkills.js';

export function getSkillModifierBreakdown(pc, skillKey) {
  const skillDef = SKILLS_REGISTRY[skillKey];
  if (!skillDef || !pc) return [];

  const breakdown = [];

  // 1. Ranks
  const ranks = typeof pc.getSkillRanks === 'function'
    ? pc.getSkillRanks(skillKey)
    : (pc.skills && pc.skills[skillKey] ? parseFloat(pc.skills[skillKey].ranks) || 0 : 0);
  breakdown.push({ label: 'Ranks', value: Math.floor(ranks) });

  // 2. Attribute Modifier
  const attrMod = typeof pc.getAttributeMod === 'function'
    ? pc.getAttributeMod(skillDef.abl)
    : (pc[skillDef.abl]
      ? Math.floor(((typeof pc[skillDef.abl].getValue === 'function' ? pc[skillDef.abl].getValue() : parseInt(pc[skillDef.abl]) || 10) - 10) / 2)
      : 0);
  breakdown.push({ label: `${skillDef.abl.toUpperCase()}-Mod`, value: attrMod });

  // 3. Misc Modifier
  const misc = typeof pc.getSkillMisc === 'function'
    ? pc.getSkillMisc(skillKey)
    : (pc.skills && pc.skills[skillKey] ? parseInt(pc.skills[skillKey].misc, 10) || 0 : 0);
  if (misc !== 0) {
    breakdown.push({ label: 'Misc', value: misc });
  }

  // 4. Armor Check Penalty (ACP)
  if (skillDef.hasACP) {
    let acp = 0;
    if (typeof pc.getArmorCheckPenalty === 'function') {
      acp = pc.getArmorCheckPenalty();
    } else if (Array.isArray(pc.armors)) {
      pc.armors.forEach(a => {
        if (a && a.isEquipped) {
          acp += parseInt(a.checkPenaltyOverride, 10) || parseInt(a.checkPenalty, 10) || 0;
        }
      });
    }
    if (acp !== 0) {
      const penaltyVal = skillKey === 'swim' ? -2 * acp : -acp;
      breakdown.push({ label: 'Armor Check Penalty (ACP)', value: penaltyVal });
    }
  }

  // 5. Synergy
  const synergy = resolveSynergyBonuses(pc, skillKey);
  if (synergy > 0) {
    let synLabel = 'Synergy';
    if (skillKey === 'balance' || skillKey === 'escape_artist') synLabel = 'Synergy (Tumble)';
    else if (['diplomacy', 'disguise', 'intimidate'].includes(skillKey)) synLabel = 'Synergy (Bluff)';
    else if (skillKey === 'use_magic_device') synLabel = 'Synergy (Spellcraft / Decipher Script)';
    breakdown.push({ label: synLabel, value: synergy });
  }

  // 6. Feats
  const featBonus = applyFeatSkillBonuses(pc, skillKey, skillDef);
  if (featBonus > 0) {
    breakdown.push({ label: 'Feat bonuses', value: featBonus });
  }

  // 7. Racial skill bonuses
  const race = (pc.race || 'human').toLowerCase();
  let racialBonus = 0;
  let racialLabel = 'Racial bonus';
  if (race === 'dwarf') {
    if (skillKey === 'craft') { racialBonus = 2; racialLabel = 'Racial bonus (Dwarf)'; }
  } else if (race === 'elf') {
    if (['listen', 'search', 'spot'].includes(skillKey)) { racialBonus = 2; racialLabel = 'Racial bonus (Elf)'; }
  } else if (race === 'gnome') {
    if (skillKey === 'listen' || skillKey === 'craft') { racialBonus = 2; racialLabel = 'Racial bonus (Gnome)'; }
  } else if (race === 'halfling') {
    if (['climb', 'jump', 'move_silently', 'listen'].includes(skillKey)) { racialBonus = 2; racialLabel = 'Racial bonus (Halfling)'; }
  } else if (race === 'deep_halfling') {
    if (['listen', 'appraise', 'craft', 'search'].includes(skillKey)) { racialBonus = 2; racialLabel = 'Racial bonus (Deep Halfling)'; }
  } else if (race === 'half_elf') {
    if (['listen', 'search', 'spot'].includes(skillKey)) { racialBonus = 1; racialLabel = 'Racial bonus (Half-Elf)'; }
    if (['diplomacy', 'gather_information'].includes(skillKey)) { racialBonus = 2; racialLabel = 'Racial bonus (Half-Elf)'; }
  } else if (race === 'tiefling') {
    if (['bluff', 'hide'].includes(skillKey)) { racialBonus = 2; racialLabel = 'Racial bonus (Tiefling)'; }
  } else if (race === 'lizardfolk') {
    if (['balance', 'jump', 'swim'].includes(skillKey)) { racialBonus = 4; racialLabel = 'Racial bonus (Lizardfolk)'; }
  }
  if (racialBonus > 0) {
    breakdown.push({ label: racialLabel, value: racialBonus });
  }

  // 8. Dragon Shaman: Draconic Adaptation
  const dsClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'dragon_shaman') : null;
  if (dsClass && (dsClass.level || 0) >= 3 && pc.dragonTotem === 'red') {
    if (skillKey === 'appraise' || skillKey === 'search') {
      breakdown.push({ label: 'Draconic Adaptation (Treasure Seeker)', value: 5 });
    }
  }

  // 9. Equipment
  const itemMod = getItemModForSkill(pc, skillKey);
  if (itemMod !== 0) {
    breakdown.push({ label: 'Equipment', value: itemMod });
  }

  // 10. Conditions penalties (Shaken / Sickened)
  const hasShaken = Array.isArray(pc.conditions) && pc.conditions.some(c =>
    c === 'Erschüttet' || (c && c.n === 'Erschüttet') || c === 'Schüttelnd' || (c && c.n === 'Schüttelnd')
  );
  if (hasShaken) {
    breakdown.push({ label: 'Condition (Shaken)', value: -2 });
  }

  return breakdown;
}

export function calculateSkillModifier(pc, skillKey) {
  const breakdown = getSkillModifierBreakdown(pc, skillKey);
  return breakdown.reduce((sum, item) => sum + item.value, 0);
}
