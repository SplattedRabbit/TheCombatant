/**
 * @module    RulesSpells
 * @summary   Spell slot lookups, eligibility checks, and known spell limits
 * @exports   getMaxSpellLevel, calculateMaxSpellSlots, checkSpellKnownLimit, getAllCompendiumSpells, isSpellEligibleForPC, getEligibleSpellLevelsForPC, getEffectiveCasterLevel
 */

import {
  WIZ_CLER_DRU_TABLE, SORCERER_TABLE, BARD_TABLE, PALADIN_RANGER_TABLE,
  ASSASSIN_TABLE, SORCERER_KNOWN_TABLE, BARD_KNOWN_TABLE,
  DUSKBLADE_TABLE, BEGUILER_TABLE
} from './RulesData.js';
import { CombatSpells, getSpellSchoolCode, getSchoolCodeFromInput, getSchoolLabel } from '../spells.js';
import { getDomain, getSpellDomains, isDomainSpellForPC } from '../data/domains-data.js';

export function getSpellClassLevels(spell) {
  if (!spell) return [];
  if (Array.isArray(spell.classLevels) && spell.classLevels.length > 0) {
    return spell.classLevels;
  }
  if (Array.isArray(spell.classes) && spell.classes.length > 0) {
    const lvl = typeof spell.level === 'number' ? spell.level : 0;
    return spell.classes.map(cls => ({ class: cls, level: lvl }));
  }
  return [];
}

export function isWizardProhibitedSchool(spell, pc) {
  if (!pc?.classes?.some(c => c.classType === 'wizard') || !spell) return false;

  const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);
  if (!schoolCode || schoolCode === 'univ') return false;

  const prob1 = getSchoolCodeFromInput(pc.wizardProhibited1);
  const prob2 = getSchoolCodeFromInput(pc.wizardProhibited2);
  return schoolCode === prob1 || schoolCode === prob2;
}

export function getEffectiveCasterLevel(pc, classType) {
  if (!pc || !Array.isArray(pc.classes)) return 0;
  const baseClass = pc.classes.find(cls => cls.classType === classType);
  if (!baseClass) return 0;
  let effectiveLevel = baseClass.level;
  if (pc.prestigeSpellLinks) {
    Object.entries(pc.prestigeSpellLinks).forEach(([prcKey, links]) => {
      const prcClass = pc.classes.find(cls => cls.classType === prcKey);
      if (prcClass) {
        if (typeof links === 'string' && links === classType) {
          effectiveLevel += prcClass.level;
        } else if (typeof links === 'object' && links !== null && Object.values(links).includes(classType)) {
          effectiveLevel += prcClass.level;
        }
      }
    });
  }
  return effectiveLevel;
}

export function getMaxSpellLevel(classType, classLevel) {
  let table;
  if (['wizard', 'cleric', 'druid'].includes(classType)) {
    table = WIZ_CLER_DRU_TABLE;
  } else if (classType === 'sorcerer') {
    table = SORCERER_TABLE;
  } else if (classType === 'bard') {
    table = BARD_TABLE;
  } else if (['paladin', 'ranger'].includes(classType)) {
    table = PALADIN_RANGER_TABLE;
  } else if (classType === 'assassin') {
    table = ASSASSIN_TABLE;
  } else if (classType === 'duskblade') {
    table = DUSKBLADE_TABLE;
  } else if (classType === 'beguiler') {
    table = BEGUILER_TABLE;
  } else {
    return -1;
  }
  const slots = table[classLevel];
  return slots ? slots.length - 1 : -1;
}

export function calculateMaxSpellSlots(pc) {
  if (!Array.isArray(pc.classes) || pc.classes.length === 0) {
    return null;
  }

  const slots = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  let hasCaster = false;

  pc.classes.forEach(c => {
    let table;
    let keyAbility;
    if (['wizard', 'cleric', 'druid'].includes(c.classType)) {
      table = WIZ_CLER_DRU_TABLE;
      keyAbility = c.classType === 'wizard' ? 'int' : 'wis';
    } else if (c.classType === 'sorcerer') {
      table = SORCERER_TABLE;
      keyAbility = 'cha';
    } else if (c.classType === 'bard') {
      table = BARD_TABLE;
      keyAbility = 'cha';
    } else if (['paladin', 'ranger'].includes(c.classType)) {
      table = PALADIN_RANGER_TABLE;
      keyAbility = 'wis';
    } else if (c.classType === 'assassin') {
      table = ASSASSIN_TABLE;
      keyAbility = 'int';
    } else if (c.classType === 'duskblade') {
      table = DUSKBLADE_TABLE;
      keyAbility = 'int';
    } else if (c.classType === 'beguiler') {
      table = BEGUILER_TABLE;
      keyAbility = 'int';
    } else {
      return; // Non-caster
    }

    hasCaster = true;
    const level = getEffectiveCasterLevel(pc, c.classType);

    for (let lvl = 0; lvl <= 9; lvl++) {
      const base = table[level]?.[lvl];
      if (base !== undefined) {
        let classSlots = base;

        // D&D 3.5e RAW: Bonus spell slots ONLY apply to spell levels 1-9 (not level 0 spells!)
        if (lvl > 0) {
          const scoreStat = pc[keyAbility];
          const score = scoreStat instanceof Object && typeof scoreStat.getValue === 'function' ? scoreStat.getValue() : (parseInt(scoreStat) || 10);
          if (score >= 10 + lvl) {
            const modifier = Math.floor((score - 10) / 2);
            const bonus = (modifier - lvl >= 0) ? Math.ceil((modifier - lvl + 1) / 4) : 0;
            classSlots += bonus;
          }
        }

        // Specialist Wizard bonus (+1 slot per level) - also ONLY applies to spell levels 1-9
        if (c.classType === 'wizard' && pc.wizardSpecialization !== 'none' && lvl > 0 && base > 0) {
          classSlots += 1;
        }

        // Cleric Domain bonus (+1 domain slot per level) - also ONLY applies to spell levels 1-9
        if (c.classType === 'cleric' && lvl > 0 && base > 0) {
          classSlots += 1;
        }

        slots[lvl] += classSlots;
      }
    }
  });

  return hasCaster ? slots : { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
}

function isSpellAllowedByUnlimitedClass(pc, spell) {
  const activeClasses = Array.isArray(pc?.classes) ? pc.classes : [];
  const classLevels = getSpellClassLevels(spell);

  const isClassMatch = activeClasses.some(c => {
    if (!['wizard', 'cleric', 'druid', 'paladin', 'ranger'].includes(c.classType)) return false;
    if (['paladin', 'ranger'].includes(c.classType) && getEffectiveCasterLevel(pc, c.classType) < 4) return false;
    const clMatch = classLevels.find(cl => cl.class === c.classType);
    if (!clMatch) return false;
    const maxLvl = getMaxSpellLevel(c.classType, getEffectiveCasterLevel(pc, c.classType));
    return clMatch.level <= maxLvl;
  });

  if (isClassMatch) return true;

  // D&D 3.5e RAW: Cleric Domain spells from chosen domains are also granted without counting toward spontaneous known limits
  const clericClass = activeClasses.find(c => c.classType === 'cleric');
  if (clericClass && Array.isArray(pc.clericDomains) && pc.clericDomains.length > 0) {
    const clericMaxLvl = getMaxSpellLevel('cleric', getEffectiveCasterLevel(pc, 'cleric'));
    const spellId = spell.id || spell.spellKey;
    return pc.clericDomains.some(domId => {
      const dom = getDomain(domId);
      if (!dom) return false;
      for (const [lvlStr, sid] of Object.entries(dom.spells)) {
        if (sid === spellId && Number(lvlStr) <= clericMaxLvl) return true;
      }
      return false;
    });
  }

  return false;
}

function countLearnedSpellsForClass(pc, classType, targetLevel, findSpellFn) {
  const learnedKeys = Array.isArray(pc?.learnedSpells) ? pc.learnedSpells : [];
  let count = 0;

  for (const key of learnedKeys) {
    const s = findSpellFn(key);
    if (!s) continue;
    if (isSpellAllowedByUnlimitedClass(pc, s)) continue;

    const match = getSpellClassLevels(s).find(cl => cl.class === classType && cl.level === targetLevel);
    if (match) count++;
  }

  return count;
}

export function checkSpellKnownLimit(pc, spell, findSpellFn) {
  if (!pc || !spell) return { success: true };

  // If spell is already learned, unlearning it is always allowed
  if (Array.isArray(pc.learnedSpells) && pc.learnedSpells.includes(spell.id)) {
    return { success: true };
  }

  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const sorcClass = activeClasses.find(c => c.classType === 'sorcerer');
  const bardClass = activeClasses.find(c => c.classType === 'bard');
  const beguilerClass = activeClasses.find(c => c.classType === 'beguiler');

  if (!sorcClass && !bardClass && !beguilerClass) {
    return { success: true };
  }

  if (isSpellAllowedByUnlimitedClass(pc, spell)) {
    return { success: true };
  }

  const classLevels = getSpellClassLevels(spell);
  const sorcMatch = classLevels.find(cl => cl.class === 'sorcerer');
  const bardMatch = classLevels.find(cl => cl.class === 'bard');

  let sorcAllowed = false;
  let bardAllowed = false;
  let sorcLvl = -1, maxSorc = 0, currentSorc = 0;
  let bardLvl = -1, maxBard = 0, currentBard = 0;

  if (sorcClass && sorcMatch) {
    sorcLvl = sorcMatch.level;
    const maxCastLvl = getMaxSpellLevel('sorcerer', getEffectiveCasterLevel(pc, 'sorcerer'));
    if (sorcLvl <= maxCastLvl) {
      const row = SORCERER_KNOWN_TABLE[Math.max(1, Math.min(20, getEffectiveCasterLevel(pc, 'sorcerer')))];
      maxSorc = row ? (row[sorcLvl] || 0) : 0;
      currentSorc = countLearnedSpellsForClass(pc, 'sorcerer', sorcLvl, findSpellFn);
      if (currentSorc < maxSorc) sorcAllowed = true;
    }
  }

  if (bardClass && bardMatch) {
    bardLvl = bardMatch.level;
    const maxCastLvl = getMaxSpellLevel('bard', getEffectiveCasterLevel(pc, 'bard'));
    if (bardLvl <= maxCastLvl) {
      const row = BARD_KNOWN_TABLE[Math.max(1, Math.min(20, getEffectiveCasterLevel(pc, 'bard')))];
      maxBard = row ? (row[bardLvl] || 0) : 0;
      currentBard = countLearnedSpellsForClass(pc, 'bard', bardLvl, findSpellFn);
      if (currentBard < maxBard) bardAllowed = true;
    }
  }

  if ((sorcClass && sorcMatch) || (bardClass && bardMatch)) {
    if (sorcAllowed || bardAllowed) return { success: true };

    if (sorcClass && sorcMatch && bardClass && bardMatch) {
      return {
        success: false,
        error: `Limit für bekannte Zauber des Grades ${sorcLvl} (Hexenmeister: ${currentSorc}/${maxSorc}) und des Grades ${bardLvl} (Barde: ${currentBard}/${maxBard}) überschritten!`
      };
    }
    if (sorcClass && sorcMatch) {
      return {
        success: false,
        error: `Limit für bekannte Zauber des Grades ${sorcLvl} überschritten! (Hexenmeister: ${currentSorc}/${maxSorc})`
      };
    }
    return {
      success: false,
      error: `Limit für bekannte Zauber des Grades ${bardLvl} überschritten! (Barde: ${currentBard}/${maxBard})`
    };
  }

  return { success: false, error: "Dieser Zauber befindet sich nicht auf deiner Klassenliste." };
}

export function getAllCompendiumSpells(pc) {
  const list = [];
  for (const [key, value] of Object.entries(CombatSpells.REGISTRY)) {
    list.push({ ...value, id: key });
  }
  if (pc && Array.isArray(pc.customSpells)) {
    pc.customSpells.forEach(s => {
      list.push(s);
    });
  }
  return list;
}

export function isSpellEligibleForPC(spell, pc) {
  if (!spell || !pc || !Array.isArray(pc.classes) || pc.classes.length === 0) {
    return false;
  }

  if (isWizardProhibitedSchool(spell, pc)) {
    return false;
  }

  const classLevels = getSpellClassLevels(spell);
  if (classLevels.length === 0) {
    return false;
  }

  // 1. Check standard class lists
  const isClassMatch = classLevels.some(cl => {
    const pcClass = pc.classes.find(c => c.classType === cl.class);
    if (!pcClass) return false;

    if (['paladin', 'ranger'].includes(cl.class) && getEffectiveCasterLevel(pc, cl.class) < 4) {
      return false;
    }

    const maxLvl = getMaxSpellLevel(cl.class, getEffectiveCasterLevel(pc, cl.class));
    return cl.level <= maxLvl;
  });

  if (isClassMatch) return true;

  // 2. D&D 3.5e RAW: Clerics gain access to domain spells from their chosen domains
  const clericClass = pc.classes.find(c => c.classType === 'cleric');
  if (clericClass && Array.isArray(pc.clericDomains) && pc.clericDomains.length > 0) {
    const clericMaxLvl = getMaxSpellLevel('cleric', getEffectiveCasterLevel(pc, 'cleric'));
    const spellId = spell.id || spell.spellKey;
    return pc.clericDomains.some(domId => {
      const dom = getDomain(domId);
      if (!dom) return false;
      for (const [lvlStr, sid] of Object.entries(dom.spells)) {
        if (sid === spellId && Number(lvlStr) <= clericMaxLvl) return true;
      }
      return false;
    });
  }

  return false;
}

export function validateSpellLearnEligibility(pc, spell, findSpellFn) {
  if (!pc || !spell) {
    return { allowed: false, title: 'Ungültige Anfrage', reason: 'Zauber- oder Charakterdaten fehlen.' };
  }

  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  if (activeClasses.length === 0) {
    return { allowed: false, title: 'Keine Klasse', reason: 'Dein Charakter besitzt noch keine Klassenstufe.' };
  }

  const CASTER_CLASSES = ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger', 'duskblade', 'beguiler', 'assassin'];
  const hasCasterClass = activeClasses.some(c => CASTER_CLASSES.includes(c.classType));
  if (!hasCasterClass) {
    return {
      allowed: false,
      title: 'Kein Zauberwirker',
      reason: 'Deine Klasse besitzt kein Zauberbuch und kann keine Zauber erlernen.'
    };
  }

  if (isWizardProhibitedSchool(spell, pc)) {
    const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);
    const label = getSchoolLabel ? getSchoolLabel(schoolCode) : schoolCode;
    return {
      allowed: false,
      title: 'Verbotene Schule',
      reason: `Du kannst "${spell.nameEn || spell.nameDe}" nicht lernen, da er deiner Bannschule "${label}" angehört!`
    };
  }

  if (!isSpellEligibleForPC(spell, pc)) {
    return {
      allowed: false,
      title: 'Nicht erlernbar',
      reason: `"${spell.nameEn || spell.nameDe}" steht nicht auf der Zauberliste deiner Klasse(n) bzw. übersteigt deinen maximal verfügbaren Zaubergrad!`
    };
  }

  const knownCheck = checkSpellKnownLimit(pc, spell, findSpellFn);
  if (!knownCheck.success) {
    return {
      allowed: false,
      title: 'Zauberlimit erreicht',
      reason: knownCheck.error || 'Du kannst keine weiteren bekannten Zauber dieses Grades erlernen.'
    };
  }

  return { allowed: true };
}

export function getEligibleSpellLevelsForPC(pc) {
  if (!pc || !Array.isArray(pc.classes) || pc.classes.length === 0) {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  }
  
  const levels = new Set();
  pc.classes.forEach(c => {
    let table;
    if (['wizard', 'cleric', 'druid'].includes(c.classType)) {
      table = WIZ_CLER_DRU_TABLE;
    } else if (c.classType === 'sorcerer') {
      table = SORCERER_TABLE;
    } else if (c.classType === 'bard') {
      table = BARD_TABLE;
    } else if (['paladin', 'ranger'].includes(c.classType)) {
      table = PALADIN_RANGER_TABLE;
    } else if (c.classType === 'assassin') {
      table = ASSASSIN_TABLE;
    } else if (c.classType === 'duskblade') {
      table = DUSKBLADE_TABLE;
    } else if (c.classType === 'beguiler') {
      table = BEGUILER_TABLE;
    } else {
      return;
    }
    
    const row = table[getEffectiveCasterLevel(pc, c.classType)];
    if (Array.isArray(row)) {
      row.forEach((val, lvl) => {
        if (['paladin', 'ranger', 'assassin'].includes(c.classType) && lvl === 0) {
          return;
        }
        levels.add(lvl);
      });
    }
  });
  
  return Array.from(levels).sort((a, b) => a - b);
}

export { getDomain, getSpellDomains, isDomainSpellForPC };
