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

const RAW_FEATS_REGISTRY = {
  ...COMBAT_FEATS_REGISTRY,
  ...MAGIC_FEATS_REGISTRY,
  ...GENERAL_FEATS_REGISTRY
};

// Normalize all feats to canonical English properties (RAW)
const NORMALIZED_FEATS_REGISTRY = {};
Object.entries(RAW_FEATS_REGISTRY).forEach(([id, f]) => {
  const name = f.nameEn || f.name || f.nameDe || id;
  const benefit = f.benefitRaw || f.benefit || f.benefitDe || '';
  const special = f.specialRaw || f.special || '';
  const normal = f.normalRaw || f.normal || '';

  NORMALIZED_FEATS_REGISTRY[id] = {
    ...f,
    id: f.id || id,
    name,
    nameEn: name,
    nameDe: f.nameDe || name,
    benefit,
    benefitRaw: f.benefitRaw || benefit,
    benefitDe: f.benefitDe || benefit,
    special,
    specialRaw: f.specialRaw || special,
    normal,
    normalRaw: f.normalRaw || normal,
    description: benefit,
    category: f.category || 'general',
    source: f.source || 'phb'
  };
});

export const CombatFeats = {
  REGISTRY: NORMALIZED_FEATS_REGISTRY
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
    } else if (pr.type === 'custom') {
      if (pr.desc === 'Fähigkeit, Untote zu vertreiben' || pr.desc === 'Ability to turn undead') {
        const clericClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'cleric') : null;
        const paladinClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'paladin') : null;
        const clericLvl = clericClass ? clericClass.level : 0;
        const paladinLvl = paladinClass ? paladinClass.level : 0;
        prMet = clericLvl >= 1 || paladinLvl >= 4;
        desc  = `Ability to turn undead (Cleric 1+ or Paladin 4+)`;
      } else if (pr.desc === 'Bardenmusik' || pr.desc === 'Bardic music') {
        const bardClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'bard') : null;
        const bardLvl = bardClass ? bardClass.level : 0;
        prMet = bardLvl >= 1;
        desc  = `Bardic music (Bard 1+)`;
      } else if (pr.desc === 'Tiergestalt (Wild Shape)' || pr.desc === 'Wild shape') {
        const druidClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'druid') : null;
        const druidLvl = druidClass ? druidClass.level : 0;
        prMet = druidLvl >= 5;
        desc  = `Wild shape (Druid 5+)`;
      } else if (pr.desc === 'Reiten 1 Rang' || pr.desc === 'Ride 1 rank') {
        let ranks = 0;
        if (typeof pc.getSkillRanks === 'function') {
          ranks = pc.getSkillRanks('ride');
        } else if (pc.skills && pc.skills['ride']) {
          ranks = parseFloat(pc.skills['ride'].ranks) || 0;
        }
        prMet = ranks >= 1;
        desc = `Ride 1 rank (current: ${ranks})`;
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
