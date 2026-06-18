/**
 * @module    RulesSpells
 * @summary   Spell slot lookups, eligibility checks, and known spell limits
 * @exports   getMaxSpellLevel, calculateMaxSpellSlots, checkSpellKnownLimit, getAllCompendiumSpells, isSpellEligibleForPC, getEligibleSpellLevelsForPC, getEffectiveCasterLevel
 */

import {
  WIZ_CLER_DRU_TABLE,
  SORCERER_TABLE,
  BARD_TABLE,
  PALADIN_RANGER_TABLE,
  SORCERER_KNOWN_TABLE,
  BARD_KNOWN_TABLE,
  ASSASSIN_TABLE
} from './RulesData.js';
import { CombatSpells, getSpellSchoolCode, getSchoolCodeFromInput } from '../spells.js';

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

        slots[lvl] += classSlots;
      }
    }
  });

  return hasCaster ? slots : { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
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

  if (!sorcClass && !bardClass) {
    return { success: true };
  }

  // Check if the spell is eligible via an unlimited caster class the PC has levels in
  const isUnlimitedEligible = activeClasses.some(c => {
    if (!['wizard', 'cleric', 'druid', 'paladin', 'ranger'].includes(c.classType)) return false;
    if (['paladin', 'ranger'].includes(c.classType) && getEffectiveCasterLevel(pc, c.classType) < 4) return false;
    if (!Array.isArray(spell.classLevels)) return false;
    const clMatch = spell.classLevels.find(cl => cl.class === c.classType);
    if (!clMatch) return false;
    const maxLvl = getMaxSpellLevel(c.classType, getEffectiveCasterLevel(pc, c.classType));
    return clMatch.level <= maxLvl;
  });

  if (isUnlimitedEligible) {
    return { success: true };
  }

  // Check Sorcerer limit
  let sorcAllowed = false;
  let sorcLvl = -1;
  let maxSorcSpells = 0;
  let currentSorcSpells = 0;

  if (sorcClass) {
    const sorcMatch = Array.isArray(spell.classLevels) && spell.classLevels.find(cl => cl.class === 'sorcerer');
    if (sorcMatch) {
      sorcLvl = sorcMatch.level;
      const maxCastLvl = getMaxSpellLevel('sorcerer', getEffectiveCasterLevel(pc, 'sorcerer'));
      if (sorcLvl <= maxCastLvl) {
        const row = SORCERER_KNOWN_TABLE[Math.max(1, Math.min(20, getEffectiveCasterLevel(pc, 'sorcerer')))];
        maxSorcSpells = row ? (row[sorcLvl] || 0) : 0;

        // Count currently learned Sorcerer spells at this level (excluding unlimited ones)
        const learnedKeys = Array.isArray(pc.learnedSpells) ? pc.learnedSpells : [];
        learnedKeys.forEach(key => {
          const s = findSpellFn(key);
          if (!s) return;

          // Check if unlimited
          const sUnlimited = activeClasses.some(c => {
            if (!['wizard', 'cleric', 'druid', 'paladin', 'ranger'].includes(c.classType)) return false;
            if (['paladin', 'ranger'].includes(c.classType) && getEffectiveCasterLevel(pc, c.classType) < 4) return false;
            if (!Array.isArray(s.classLevels)) return false;
            const clMatch = s.classLevels.find(cl => cl.class === c.classType);
            if (!clMatch) return false;
            const maxLvl = getMaxSpellLevel(c.classType, getEffectiveCasterLevel(pc, c.classType));
            return clMatch.level <= maxLvl;
          });
          if (sUnlimited) return;

          // Check if on sorcerer list at sorcLvl
          if (Array.isArray(s.classLevels)) {
            const match = s.classLevels.find(cl => cl.class === 'sorcerer' && cl.level === sorcLvl);
            if (match) currentSorcSpells++;
          }
        });

        if (currentSorcSpells < maxSorcSpells) {
          sorcAllowed = true;
        }
      }
    }
  }

  // Check Bard limit
  let bardAllowed = false;
  let bardLvl = -1;
  let maxBardSpells = 0;
  let currentBardSpells = 0;

  if (bardClass) {
    const bardMatch = Array.isArray(spell.classLevels) && spell.classLevels.find(cl => cl.class === 'bard');
    if (bardMatch) {
      bardLvl = bardMatch.level;
      const maxCastLvl = getMaxSpellLevel('bard', getEffectiveCasterLevel(pc, 'bard'));
      if (bardLvl <= maxCastLvl) {
        const row = BARD_KNOWN_TABLE[Math.max(1, Math.min(20, getEffectiveCasterLevel(pc, 'bard')))];
        maxBardSpells = row ? (row[bardLvl] || 0) : 0;

        // Count currently learned Bard spells at this level (excluding unlimited ones)
        const learnedKeys = Array.isArray(pc.learnedSpells) ? pc.learnedSpells : [];
        learnedKeys.forEach(key => {
          const s = findSpellFn(key);
          if (!s) return;

          // Check if unlimited
          const sUnlimited = activeClasses.some(c => {
            if (!['wizard', 'cleric', 'druid', 'paladin', 'ranger'].includes(c.classType)) return false;
            if (['paladin', 'ranger'].includes(c.classType) && getEffectiveCasterLevel(pc, c.classType) < 4) return false;
            if (!Array.isArray(s.classLevels)) return false;
            const clMatch = s.classLevels.find(cl => cl.class === c.classType);
            if (!clMatch) return false;
            const maxLvl = getMaxSpellLevel(c.classType, getEffectiveCasterLevel(pc, c.classType));
            return clMatch.level <= maxLvl;
          });
          if (sUnlimited) return;

          // Check if on bard list at bardLvl
          if (Array.isArray(s.classLevels)) {
            const match = s.classLevels.find(cl => cl.class === 'bard' && cl.level === bardLvl);
            if (match) currentBardSpells++;
          }
        });

        if (currentBardSpells < maxBardSpells) {
          bardAllowed = true;
        }
      }
    }
  }

  // If the spell can be learned via Sorcerer or Bard, we allow it.
  const hasSorcMatch = Array.isArray(spell.classLevels) && spell.classLevels.some(cl => cl.class === 'sorcerer');
  const hasBardMatch = Array.isArray(spell.classLevels) && spell.classLevels.some(cl => cl.class === 'bard');

  if ((sorcClass && hasSorcMatch) || (bardClass && hasBardMatch)) {
    if (sorcAllowed || bardAllowed) {
      return { success: true };
    }

    let errorMsg = "";
    if (sorcClass && hasSorcMatch && bardClass && hasBardMatch) {
      errorMsg = `Limit für bekannte Zauber des Grades ${sorcLvl} (Hexenmeister: ${currentSorcSpells}/${maxSorcSpells}) und des Grades ${bardLvl} (Barde: ${currentBardSpells}/${maxBardSpells}) überschritten!`;
    } else if (sorcClass && hasSorcMatch) {
      errorMsg = `Limit für bekannte Zauber des Grades ${sorcLvl} überschritten! (Hexenmeister: ${currentSorcSpells}/${maxSorcSpells})`;
    } else {
      errorMsg = `Limit für bekannte Zauber des Grades ${bardLvl} überschritten! (Barde: ${currentBardSpells}/${maxBardSpells})`;
    }
    return { success: false, error: errorMsg };
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
  if (!pc || !Array.isArray(pc.classes) || pc.classes.length === 0) {
    return true;
  }

  // Block spells belonging to wizard prohibited schools
  const isWizard = pc.classes.some(c => c.classType === 'wizard');
  if (isWizard) {
    const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);
    if (schoolCode && schoolCode !== 'univ') {
      const prob1 = getSchoolCodeFromInput(pc.wizardProhibited1);
      const prob2 = getSchoolCodeFromInput(pc.wizardProhibited2);
      if (schoolCode === prob1 || schoolCode === prob2) {
        return false;
      }
    }
  }

  if (!Array.isArray(spell.classLevels)) {
    return true;
  }
  return pc.classes.some(c => {
    const classMatch = spell.classLevels.find(cl => cl.class === c.classType);
    if (!classMatch) return false;
    const maxLvl = getMaxSpellLevel(c.classType, getEffectiveCasterLevel(pc, c.classType));
    return classMatch.level <= maxLvl;
  });
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
