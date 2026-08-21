/**
 * @module    RulesSkills
 * @summary   Skill-related rule helpers (isClassSkill, getPCMaxRanks, calculateTotalSkillPoints, calculateSpentSkillPoints)
 * @exports   isClassSkill, getPCMaxRanks, calculateTotalSkillPoints, calculateSpentSkillPoints
 */

import { CLASS_SKILLS, CLASS_BASE_SKILLS } from './RulesData.js';
import { SKILL_TRICKS_REGISTRY } from '../data/skillTricks-data.js';

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
  if (!pc) return 0;
  let spent = 0;
  if (pc.skills) {
    for (const key of Object.keys(pc.skills)) {
      const ranks = parseFloat(pc.skills[key].ranks) || 0;
      if (ranks > 0) {
        const isClass = isClassSkill(key, pc);
        spent += ranks * (isClass ? 1 : 2);
      }
    }
  }
  if (Array.isArray(pc.skillTricks)) {
    pc.skillTricks.forEach(trick => {
      const isBonus = typeof trick === 'object' ? !!trick.isBonus : false;
      if (!isBonus) {
        spent += 2;
      }
    });
  }
  return spent;
}

export function getMaxSkillTricksLimit(pc) {
  if (!pc) return 0;
  const totalLevel = Array.isArray(pc.classes) ? pc.classes.reduce((sum, c) => sum + (c.level || 0), 0) : 1;
  let limit = Math.ceil(totalLevel / 2);
  
  if (Array.isArray(pc.classes)) {
    const bt = pc.classes.find(c => c.classType === 'battle_trickster');
    if (bt) {
      if (bt.level >= 1) limit += 1;
      if (bt.level >= 3) limit += 1;
    }
  }
  return limit;
}

export function checkSkillTrickPrerequisites(trickId, pc) {
  const details = [];
  let met = true;

  if (!pc) return { met: false, details };
  const trick = typeof trickId === 'string' ? SKILL_TRICKS_REGISTRY[trickId] : trickId;
  if (!trick) return { met: false, details };

  const getSkillRanks = (key) => {
    if (typeof pc.getSkillRanks === 'function') {
      return pc.getSkillRanks(key);
    }
    return (pc.skills && pc.skills[key]) ? parseFloat(pc.skills[key].ranks) || 0 : 0;
  };

  const hasFeat = (featId) => {
    if (typeof pc.hasFeat === 'function') {
      return pc.hasFeat(featId);
    }
    return pc.feats && pc.feats.some(f => f.id === featId);
  };

  const prereqs = trick.prerequisites || {};

  if (prereqs.skills) {
    Object.entries(prereqs.skills).forEach(([skillKey, requiredRanks]) => {
      const ranks = getSkillRanks(skillKey);
      const req = requiredRanks;
      const skillName = skillKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const isMet = ranks >= req;
      details.push({
        desc: `${skillName}: ${ranks} / ${req} ranks`,
        met: isMet
      });
      if (!isMet) met = false;
    });
  }

  if (prereqs.feats) {
    prereqs.feats.forEach(featId => {
      const isMet = hasFeat(featId);
      const featName = featId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      details.push({
        desc: `Feat: ${featName}`,
        met: isMet
      });
      if (!isMet) met = false;
    });
  }

  if (prereqs.special) {
    const spec = prereqs.special;
    if (spec.or_skills && spec.ranks) {
      const ranks1 = getSkillRanks(spec.or_skills[0]);
      const ranks2 = getSkillRanks(spec.or_skills[1]);
      const isMet = ranks1 >= spec.ranks || ranks2 >= spec.ranks;
      const name1 = spec.or_skills[0].split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const name2 = spec.or_skills[1].split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      details.push({
        desc: `${name1} or ${name2}: ${spec.ranks} ranks`,
        met: isMet
      });
      if (!isMet) met = false;
    }
    if (spec.any_knowledge) {
      const knowledgeKeys = ['knowledge_arcana', 'knowledge_dungeons', 'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_planes', 'knowledge_religion', 'knowledge_other'];
      const maxRanks = Math.max(...knowledgeKeys.map(k => getSkillRanks(k)));
      const isMet = maxRanks >= spec.any_knowledge;
      details.push({
        desc: `Knowledge (any): ${maxRanks} / ${spec.any_knowledge} ranks`,
        met: isMet
      });
      if (!isMet) met = false;
    }
  }

  return { met, details };
}

