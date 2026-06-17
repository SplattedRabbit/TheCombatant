/**
 * @module    RulesSkills
 * @summary   Skill-related rule helpers (isClassSkill, getPCMaxRanks, calculateTotalSkillPoints, calculateSpentSkillPoints)
 * @exports   isClassSkill, getPCMaxRanks, calculateTotalSkillPoints, calculateSpentSkillPoints
 */

import { CLASS_SKILLS, CLASS_BASE_SKILLS } from './RulesData.js';

export function isClassSkill(skillKey, pc) {
  if (!pc || !Array.isArray(pc.classes) || pc.classes.length === 0) {
    return false;
  }
  return pc.classes.some(c => {
    const skills = CLASS_SKILLS[c.classType];
    if (Array.isArray(skills)) {
      if (skillKey.startsWith('knowledge_') && (c.classType === 'wizard' || c.classType === 'bard')) {
        return true;
      }
      return skills.includes(skillKey);
    }
    return false;
  });
}

export function getPCMaxRanks(skillKey, pc) {
  if (!pc) return 0;
  const totalLevel = Array.isArray(pc.classes) ? pc.classes.reduce((sum, c) => sum + (c.level || 0), 0) : 1;
  const isClass = isClassSkill(skillKey, pc);
  return isClass ? (totalLevel + 3) : (totalLevel + 3) / 2;
}

export function calculateTotalSkillPoints(pc) {
  if (!pc || !Array.isArray(pc.classes) || pc.classes.length === 0) {
    return 0;
  }
  
  let intMod = 0;
  if (typeof pc.getAttributeMod === 'function') {
    intMod = pc.getAttributeMod('int');
  } else {
    const attr = pc.int;
    const score = attr ? (typeof attr.getValue === 'function' ? attr.getValue() : parseInt(attr) || 10) : 10;
    intMod = score >= 10
      ? Math.floor((score - 10) / 2)
      : (score === 9 || score === 8 ? -1 : (score === 7 || score === 6 ? -2 : (score === 5 || score === 4 ? -4 : -5)));
  }

  const raceStr = (pc.race || '').toLowerCase();
  const isHuman = pc.isHuman !== undefined ? !!pc.isHuman : (raceStr === 'human' || raceStr === 'mensch' || raceStr === '');

  let total = 0;
  pc.classes.forEach((c, idx) => {
    const base = CLASS_BASE_SKILLS[c.classType] || 2;
    const level = c.level || 0;
    if (level <= 0) return;

    if (idx === 0) {
      // Level 1: (Base + IntMod) * 4 + Human bonus (+4)
      const firstLevelPoints = Math.max(1, base + intMod) * 4 + (isHuman ? 4 : 0);
      // Subsequent levels: (Base + IntMod) + Human bonus (+1) per level
      const restLevelPoints = (Math.max(1, base + intMod) + (isHuman ? 1 : 0)) * (level - 1);
      total += firstLevelPoints + restLevelPoints;
    } else {
      // Multiclass level: (Base + IntMod) + Human bonus (+1) per level
      total += (Math.max(1, base + intMod) + (isHuman ? 1 : 0)) * level;
    }
  });
  return total;
}

export function calculateSpentSkillPoints(pc) {
  if (!pc || !pc.skills) return 0;
  let spent = 0;
  for (const key of Object.keys(pc.skills)) {
    const ranks = parseFloat(pc.skills[key].ranks) || 0;
    if (ranks > 0) {
      const isClass = isClassSkill(key, pc);
      spent += ranks * (isClass ? 1 : 2);
    }
  }
  return spent;
}
