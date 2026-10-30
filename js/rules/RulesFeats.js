/**
 * @module    RulesFeats
 * @summary   Feat slots, validation, and prerequisites checks
 * @exports   calculateMaxFeats, validateFeatsAssignment, checkPrerequisites
 */

import { CombatFeats } from '../data/feats-data.js';
import { DRAGON_TOTEMS } from './data/dragonTotems.js';

export function calculateMaxFeats(pc) {
  if (!pc) return 0;
  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const totalLevel = activeClasses.reduce((sum, c) => sum + (c.level || 0), 0) || 1;

  // General feats: 1 at level 1, +1 every 3 levels thereafter (3, 6, 9, 12, 15, 18)
  let maxFeats = 1 + Math.floor(totalLevel / 3);

  // Human bonus feat: assume true if undefined
  const raceStr = (pc.race || '').toLowerCase();
  const isHuman = pc.isHuman !== undefined ? !!pc.isHuman : (raceStr === 'human' || raceStr === 'mensch' || raceStr === '');
  if (isHuman) {
    maxFeats += 1;
  }

  // Fighter bonus feats
  const fighterClass = activeClasses.find(c => c.classType === 'fighter');
  if (fighterClass) {
    maxFeats += 1 + Math.floor(fighterClass.level / 2);
  }

  // Wizard bonus feats
  const wizardClass = activeClasses.find(c => c.classType === 'wizard');
  if (wizardClass) {
    maxFeats += 1 + Math.floor(wizardClass.level / 5);
  }

  // Monk bonus feats
  const monkClass = activeClasses.find(c => c.classType === 'monk');
  if (monkClass) {
    const ml = monkClass.level;
    maxFeats += ml >= 6 ? 3 : (ml >= 2 ? 2 : (ml >= 1 ? 1 : 0));
  }

  // Dragon Shaman bonus feats (Skill Focus at 2nd, 8th, 16th)
  const dsClass = activeClasses.find(c => c.classType === 'dragon_shaman');
  if (dsClass) {
    const dsl = dsClass.level || 0;
    maxFeats += dsl >= 16 ? 3 : (dsl >= 8 ? 2 : (dsl >= 2 ? 1 : 0));
  }

  // Ranger bonus feats (Track at 1, Combat Style at 2, Endurance at 3, Imp. Combat Style at 6, Mastery at 11)
  const rangerClass = activeClasses.find(c => c.classType === 'ranger');
  if (rangerClass) {
    const rl = rangerClass.level || 0;
    maxFeats += rl >= 11 ? 5 : (rl >= 6 ? 4 : (rl >= 3 ? 3 : (rl >= 2 ? 2 : (rl >= 1 ? 1 : 0))));
  }

  return maxFeats;
}

export function validateFeatsAssignment(pc, featsList) {
  if (!pc) return { success: true };
  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const totalLevel = activeClasses.reduce((sum, c) => sum + (c.level || 0), 0) || 1;
  const raceStr = (pc.race || '').toLowerCase();
  const isHuman = pc.isHuman !== undefined ? !!pc.isHuman : (raceStr === 'human' || raceStr === 'mensch' || raceStr === '');

  let generalMax = 1 + Math.floor(totalLevel / 3) + (isHuman ? 1 : 0);

  const fighterClass = activeClasses.find(c => c.classType === 'fighter');
  let fighterMax = fighterClass ? 1 + Math.floor(fighterClass.level / 2) : 0;

  const wizardClass = activeClasses.find(c => c.classType === 'wizard');
  let wizardMax = wizardClass ? 1 + Math.floor(wizardClass.level / 5) : 0;

  const monkClass = activeClasses.find(c => c.classType === 'monk');
  let monkMax = monkClass ? (monkClass.level >= 6 ? 3 : (monkClass.level >= 2 ? 2 : (monkClass.level >= 1 ? 1 : 0))) : 0;

  const dsClass = activeClasses.find(c => c.classType === 'dragon_shaman');
  let dsMax = dsClass ? ((dsClass.level || 0) >= 16 ? 3 : ((dsClass.level || 0) >= 8 ? 2 : ((dsClass.level || 0) >= 2 ? 1 : 0))) : 0;

  const rangerClass = activeClasses.find(c => c.classType === 'ranger');
  let rangerMax = 0;
  if (rangerClass) {
    const rl = rangerClass.level || 0;
    rangerMax = rl >= 11 ? 5 : (rl >= 6 ? 4 : (rl >= 3 ? 3 : (rl >= 2 ? 2 : (rl >= 1 ? 1 : 0))));
  }

  const totalMax = generalMax + fighterMax + wizardMax + monkMax + dsMax + rangerMax;
  if (featsList.length > totalMax) {
    return { success: false, error: `Feat limit exceeded (Maximum ${totalMax} feats allowed, you have selected ${featsList.length}).` };
  }

  const monkBonusIds = ['improved_unarmed_strike', 'improved_grapple', 'deflect_arrows', 'snatch_arrows', 'stunning_fist', 'improved_trip', 'improved_overrun'];
  const rangerBonusIds = ['track', 'endurance', 'rapid_shot', 'two_weapon_fighting', 'manyshot', 'improved_two_weapon_fighting', 'improved_precise_shot', 'greater_two_weapon_fighting'];

  const dsTotemKey = pc.dragonTotem || (dsClass ? 'red' : null);
  const dsTotemDef = dsTotemKey && DRAGON_TOTEMS ? DRAGON_TOTEMS[dsTotemKey] : null;
  const dsTotemSkills = dsTotemDef?.skills || [];
  const dsBaseSkills = ['climb', 'craft', 'handle_animal', 'intimidate', 'knowledge_arcana', 'knowledge_nature', 'search', 'survival'];
  const dsAllClassSkills = Array.from(new Set([...dsBaseSkills, ...dsTotemSkills]));

  function matchesSkillList(opt, list) {
    if (!opt) return true; // allow unspecified option in mocks/tests
    const clean = String(opt).toLowerCase().trim().replace(/\s+/g, '_');
    const match = String(opt).toLowerCase().match(/\(([^)]+)\)/);
    const alt = match ? match[1].trim().replace(/\s+/g, '_') : '';
    return list.some(s => s === clean || s === alt || clean.includes(s) || (alt && alt.includes(s)));
  }

  let monkFilled = 0;
  let wizardFilled = 0;
  let fighterFilled = 0;
  let dsFilled = 0;
  let rangerFilled = 0;
  let unassigned = [];

  for (const f of featsList) {
    const featDef = CombatFeats.REGISTRY[f.id];
    if (!featDef) continue;

    let assigned = false;

    if (dsMax > 0 && dsFilled < dsMax && f.id === 'skill_focus') {
      const isTotem = matchesSkillList(f.option, dsTotemSkills);
      const isClass = matchesSkillList(f.option, dsAllClassSkills);
      if (dsFilled === 0) {
        if (isTotem || isClass) {
          dsFilled++;
          assigned = true;
        }
      } else {
        if (isTotem || isClass) {
          dsFilled++;
          assigned = true;
        }
      }
    }
    else if (monkMax > 0 && monkFilled < monkMax && monkBonusIds.includes(f.id)) {
      monkFilled++;
      assigned = true;
    }
    else if (wizardMax > 0 && wizardFilled < wizardMax && (featDef.category === 'metamagic' || featDef.category === 'item_creation')) {
      wizardFilled++;
      assigned = true;
    }
    else if (fighterMax > 0 && fighterFilled < fighterMax && featDef.category === 'combat') {
      fighterFilled++;
      assigned = true;
    }
    else if (rangerMax > 0 && rangerFilled < rangerMax && rangerBonusIds.includes(f.id)) {
      rangerFilled++;
      assigned = true;
    }

    if (!assigned) {
      unassigned.push(f);
    }
  }

  if (unassigned.length > generalMax) {
    if (dsMax > dsFilled && dsTotemSkills.length > 0) {
      const totemNames = dsTotemSkills.map(s => s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ');
      return { success: false, error: `Dragon Shaman bonus feat requires Skill Focus in one of your Totem skills (${totemNames}) or class skills.` };
    }
    if (featsList.length === totalMax) {
      return { success: false, error: `Invalid feat selection: Your feats cannot be assigned to your bonus slots. Please verify the categories (Fighter requires combat feats, Wizard requires metamagic/creation, Monk requires monk bonus feats, Dragon Shaman requires Skill Focus).` };
    } else {
      return { success: false, error: `General feat limit exceeded (Maximum ${generalMax} general feats allowed).` };
    }
  }

  return { success: true };
}

import { evaluateFeatPrerequisites } from './featPrerequisites.js';

/**
 * Checks whether a character (pc) meets all prerequisites of a given feat.
 *
 * This is the canonical implementation of feat prerequisite checking.
 * It is Snapshot-compatible: Stat objects may be plain objects (no .getValue())
 * when called from the React snapshot, or full Stat instances from the engine.
 *
 * @param {object} feat - Feat definition (with prereqs array)
 * @param {object} pc   - Character (live engine object or React snapshot)
 * @returns {{ met: boolean, details: Array<{desc: string, met: boolean}> }}
 */
export function checkPrerequisites(feat, pc) {
  return evaluateFeatPrerequisites(feat, pc, CombatFeats?.REGISTRY);
}


