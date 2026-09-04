/**
 * @module    feats-data
 * @summary   Fassade für die Talentdatenbank. Importiert und mergt Kampftalente, magische und allgemeine Talente.
 * @exports   CombatFeats, checkFeatPrerequisites, getFeatIdsByClassPrereq
 * @reads     Keine State-Lesezugriffe
 * @stateOps  Keine
 * @depends   feats-combat.js, feats-magic.js, feats-general.js
 * @notHere   Einzelne Talent-Definitionen -> feats-combat.js, feats-magic.js, feats-general.js
 */

import { COMBAT_FEATS_REGISTRY } from './feats/combat/index.js';
import { MAGIC_FEATS_REGISTRY } from './feats/magic/index.js';
import { GENERAL_FEATS_REGISTRY } from './feats/general/index.js';

export const CombatFeats = {
  REGISTRY: {
    ...COMBAT_FEATS_REGISTRY,
    ...MAGIC_FEATS_REGISTRY,
    ...GENERAL_FEATS_REGISTRY
  }
};

/**
 * Pure prerequisite checker for the rules layer.
 * Returns { met: boolean, unmetDescs: string[] }.
 */
export function checkFeatPrerequisites(featId, pc) {
  const feat = CombatFeats.REGISTRY[featId];
  if (!feat || !Array.isArray(feat.prereqs) || feat.prereqs.length === 0) {
    return { met: true, unmetDescs: [] };
  }

  const learnedIds  = Array.isArray(pc.feats) ? pc.feats.map(f => f.id) : [];
  let met           = true;
  const unmetDescs  = [];

  feat.prereqs.forEach(pr => {
    let prMet = false;
    let desc  = '';

    if (pr.type === 'bab') {
      const pcBab = pc.bab ? (typeof pc.bab.getValue === 'function' ? pc.bab.getValue() : (typeof pc.bab === 'number' ? pc.bab : (pc.bab.value ?? pc.bab.base ?? 0))) : 0;
      prMet = pcBab >= pr.value;
      desc  = `Grundangriffsbonus +${pr.value} (aktuell: +${pcBab})`;
    } else if (pr.type === 'feat') {
      prMet = learnedIds.includes(pr.id);
      const pf = CombatFeats.REGISTRY[pr.id];
      desc  = `Talent: ${pf ? pf.nameDe : pr.id}`;
    } else if (pr.type === 'classLevel') {
      const cls = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === pr.class) : null;
      const lvl = cls ? cls.level : 0;
      prMet = lvl >= pr.value;
      desc  = `${pr.class} Stufe ${pr.value} (aktuell: ${lvl})`;
    } else if (pr.type === 'class') {
      prMet = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === pr.class);
      desc  = `Klasse: ${pr.class}`;
    } else if (pr.type === 'stat') {
      const nameMap = { str: 'Stärke', dex: 'Geschicklichkeit', con: 'Konstitution', int: 'Intelligenz', wis: 'Weisheit', cha: 'Charisma' };
      const statObj = pc[pr.name];
      const val = statObj ? (typeof statObj.getValue === 'function' ? statObj.getValue() : (typeof statObj === 'number' ? statObj : (statObj.base ?? statObj.value ?? 10))) : 10;
      prMet = val >= pr.value;
      desc  = `${nameMap[pr.name] || pr.name} ${pr.value}+ (aktuell: ${val})`;
    } else if (pr.type === 'level') {
      prMet = (pc.level || 1) >= pr.value;
      desc  = `Charakterstufe ${pr.value} (aktuell: ${pc.level || 1})`;
    } else if (pr.type === 'casterLevel') {
      let maxCL = 0;
      if (Array.isArray(pc.classes)) {
        pc.classes.forEach(c => {
          if (['wizard','cleric','druid','sorcerer','bard'].includes(c.classType)) {
            maxCL = Math.max(maxCL, c.level);
          } else if (['paladin','ranger'].includes(c.classType) && c.level >= 4) {
            maxCL = Math.max(maxCL, Math.floor(c.level / 2));
          }
        });
      }
      prMet = maxCL >= pr.value;
      desc  = `Caster level ${pr.value} (current: ${maxCL})`;
    } else if (pr.type === 'skill') {
      const skillName = pr.name || pr.skill || '';
      const reqRanks = pr.value !== undefined ? pr.value : (pr.ranks !== undefined ? pr.ranks : 0);
      let ranks = 0;
      if (typeof pc.getSkillRanks === 'function') {
        ranks = pc.getSkillRanks(skillName);
      } else if (pc.skills && pc.skills[skillName]) {
        ranks = typeof pc.skills[skillName] === 'object' ? (parseFloat(pc.skills[skillName].ranks) || 0) : (parseFloat(pc.skills[skillName]) || 0);
      }
      prMet = ranks >= reqRanks;
      const skillCleanName = skillName ? skillName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Skill';
      desc = `${skillCleanName} ${reqRanks} ranks (current: ${ranks})`;
    } else if (pr.type === 'sneak_attack') {
      let saDice = 0;
      if (typeof pc.getSneakAttackDiceCount === 'function') {
        saDice = pc.getSneakAttackDiceCount();
      } else {
        const rogueClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'rogue') : null;
        saDice = rogueClass ? Math.floor((rogueClass.level + 1) / 2) : 0;
      }
      prMet = saDice >= pr.value;
      desc = `Sneak attack +${pr.value}d6 (current: +${saDice}d6)`;
    } else if (pr.type === 'custom' || pr.type === 'special') {
      const descLower = (pr.desc || '').toLowerCase();
      if (descLower.includes('trapfinding')) {
        const hasTrapfinding = Array.isArray(pc.classes) && pc.classes.some(c => ['rogue', 'scout', 'spellthief', 'beguiler'].includes(c.classType));
        prMet = hasTrapfinding;
        desc = `Special: Trapfinding class feature (Rogue 1+)`;
      } else if (descLower.includes('favored enemy')) {
        const rangerClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'ranger') : null;
        prMet = rangerClass && rangerClass.level >= 1;
        desc = `Special: Favored Enemy class feature (Ranger 1+)`;
      } else if (descLower.includes('smite evil')) {
        const paladinClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'paladin') : null;
        const sbiClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'shadowbane_inquisitor') : null;
        prMet = (paladinClass && paladinClass.level >= 1) || (sbiClass && sbiClass.level >= 2);
        desc = `Special: Smite Evil class feature (Paladin 1+)`;
      } else if (descLower.includes('evasion')) {
        const rogueClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'rogue') : null;
        const monkClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'monk') : null;
        prMet = (rogueClass && rogueClass.level >= 2) || (monkClass && monkClass.level >= 2);
        desc = `Special: Evasion class feature (Rogue 2+ or Monk 2+)`;
      } else if (descLower.includes('rage')) {
        const barbarianClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'barbarian') : null;
        prMet = barbarianClass && barbarianClass.level >= 1;
        desc = `Special: Rage class feature (Barbarian 1+)`;
      } else if (descLower.includes('ki strike')) {
        const monkClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'monk') : null;
        prMet = monkClass && monkClass.level >= 4;
        desc = `Special: Ki Strike class feature (Monk 4+)`;
      } else if (descLower.includes('sneak attack')) {
        let saDice = 0;
        if (typeof pc.getSneakAttackDiceCount === 'function') {
          saDice = pc.getSneakAttackDiceCount();
        } else {
          const rogueClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'rogue') : null;
          saDice = rogueClass ? Math.floor((rogueClass.level + 1) / 2) : 0;
        }
        const match = descLower.match(/\+(\d+)d6/);
        const reqDice = match ? parseInt(match[1]) : 1;
        prMet = saDice >= reqDice;
        desc = `Special: Sneak attack +${reqDice}d6 (current: +${saDice}d6)`;
      } else if (descLower.includes('turn undead') || descLower.includes('untote zu vertreiben')) {
        const clericClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'cleric') : null;
        const paladinClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'paladin') : null;
        const clericLvl = clericClass ? clericClass.level : 0;
        const paladinLvl = paladinClass ? paladinClass.level : 0;
        prMet = clericLvl >= 1 || paladinLvl >= 4;
        desc  = `Ability to turn undead (Cleric 1+ or Paladin 4+)`;
      } else if (descLower.includes('bardic music') || descLower.includes('bardenmusik')) {
        const bardClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'bard') : null;
        const bardLvl = bardClass ? bardClass.level : 0;
        prMet = bardLvl >= 1;
        desc  = `Bardic music (Bard 1+)`;
      } else if (descLower.includes('wild shape') || descLower.includes('tiergestalt')) {
        const druidClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'druid') : null;
        const druidLvl = druidClass ? druidClass.level : 0;
        prMet = druidLvl >= 5;
        desc  = `Wild shape (Druid 5+)`;
      } else if (descLower.includes('ride 1 rank') || descLower.includes('reiten 1 rang')) {
        let ranks = 0;
        if (typeof pc.getSkillRanks === 'function') {
          ranks = pc.getSkillRanks('ride');
        } else if (pc.skills && pc.skills['ride']) {
          ranks = parseFloat(pc.skills['ride'].ranks) || 0;
        }
        prMet = ranks >= 1;
        desc = `Ride 1 rank (current: ${ranks})`;
      } else if (descLower.includes('spontaneous 2nd level arcane spells')) {
        const sorcererClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'sorcerer') : null;
        const bardClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'bard') : null;
        prMet = (sorcererClass && sorcererClass.level >= 4) || (bardClass && bardClass.level >= 4);
        desc = `Special: Spontaneous 2nd-level arcane spells (Sorcerer 4+ or Bard 4+)`;
      } else if (descLower.includes('ability to cast 3rd-level arcane spells')) {
        const wizClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'wizard') : null;
        const sorcClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'sorcerer') : null;
        prMet = (wizClass && wizClass.level >= 5) || (sorcClass && sorcClass.level >= 6);
        desc = `Special: Cast 3rd-level arcane spells (Wizard 5+ or Sorcerer 6+)`;
      } else if (descLower.includes('ability to acquire a familiar')) {
        const wizClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'wizard') : null;
        const sorcClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'sorcerer') : null;
        prMet = (wizClass && wizClass.level >= 1) || (sorcClass && sorcClass.level >= 1);
        desc = `Special: Familiar class feature (Wizard 1+ or Sorcerer 1+)`;
      } else {
        prMet = true;
        desc = `Special: ${pr.desc}`;
      }
    }

    if (!prMet) {
      met = false;
      unmetDescs.push(desc);
    }
  });

  return { met, unmetDescs };
}

/**
 * Returns the IDs of all feats that have a prerequisite of type 'class'
 * matching the given classType.
 */
export function getFeatIdsByClassPrereq(classType) {
  return Object.keys(CombatFeats.REGISTRY).filter(id => {
    const feat = CombatFeats.REGISTRY[id];
    return Array.isArray(feat.prereqs) && feat.prereqs.some(
      pr => pr.type === 'class' && pr.class === classType
    );
  });
}
