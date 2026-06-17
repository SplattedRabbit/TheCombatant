/**
 * @module    RulesFeats
 * @summary   Feat slots, validation, and prerequisites checks
 * @exports   calculateMaxFeats, validateFeatsAssignment, checkPrerequisites
 */

import { CombatFeats } from '../data/feats-data.js';

export function calculateMaxFeats(pc) {
  if (!pc) return 0;
  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const totalLevel = activeClasses.reduce((sum, c) => sum + (c.level || 0), 0) || 1;

  // General feats: 1 at level 1, +1 every 3 levels thereafter (3, 6, 9, 12, 15, 18)
  let maxFeats = 1 + Math.floor((totalLevel - 1) / 3);

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

  return maxFeats;
}

export function validateFeatsAssignment(pc, featsList) {
  if (!pc) return { success: true };
  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const totalLevel = activeClasses.reduce((sum, c) => sum + (c.level || 0), 0) || 1;
  const raceStr = (pc.race || '').toLowerCase();
  const isHuman = pc.isHuman !== undefined ? !!pc.isHuman : (raceStr === 'human' || raceStr === 'mensch' || raceStr === '');

  let generalMax = 1 + Math.floor((totalLevel - 1) / 3) + (isHuman ? 1 : 0);

  const fighterClass = activeClasses.find(c => c.classType === 'fighter');
  let fighterMax = fighterClass ? 1 + Math.floor(fighterClass.level / 2) : 0;

  const wizardClass = activeClasses.find(c => c.classType === 'wizard');
  let wizardMax = wizardClass ? 1 + Math.floor(wizardClass.level / 5) : 0;

  const monkClass = activeClasses.find(c => c.classType === 'monk');
  let monkMax = monkClass ? (monkClass.level >= 6 ? 3 : (monkClass.level >= 2 ? 2 : (monkClass.level >= 1 ? 1 : 0))) : 0;

  const totalMax = generalMax + fighterMax + wizardMax + monkMax;
  if (featsList.length > totalMax) {
    return { success: false, error: `Talentlimit überschritten (Maximal ${totalMax} Talente erlaubt, du hast ${featsList.length} gewählt).` };
  }

  const monkBonusIds = ['improved_unarmed_strike', 'improved_grapple', 'deflect_arrows', 'snatch_arrows', 'stunning_fist', 'improved_trip', 'improved_overrun'];

  let monkFilled = 0;
  let wizardFilled = 0;
  let fighterFilled = 0;
  let unassigned = [];

  for (const f of featsList) {
    const featDef = CombatFeats.REGISTRY[f.id];
    if (!featDef) continue;

    let assigned = false;

    if (monkMax > 0 && monkFilled < monkMax && monkBonusIds.includes(f.id)) {
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

    if (!assigned) {
      unassigned.push(f);
    }
  }

  if (unassigned.length > generalMax) {
    if (featsList.length === totalMax) {
      return { success: false, error: `Talentwahl ungültig: Deine Talente können den Bonusslots nicht zugeordnet werden. Bitte überprüfe die Kategorien (Kämpfer benötigt Kampftalente, Magier benötigt Metamagie/Erschaffung, Mönch benötigt Mönchs-Bonustalente).` };
    } else {
      return { success: false, error: `Limit für allgemeine Talente überschritten (Maximal ${generalMax} allgemeine Talente erlaubt).` };
    }
  }

  return { success: true };
}

export function checkPrerequisites(feat, pc) {
  if (!feat.prereqs || feat.prereqs.length === 0) return { met: true, details: [] };
  
  let met = true;
  const details = [];
  const learnedIds = Array.isArray(pc.feats) ? pc.feats.map(f => f.id) : [];
  
  feat.prereqs.forEach(pr => {
    let prMet = false;
    let desc = '';
    
    if (pr.type === 'bab') {
      const pcBab = pc.bab ? pc.bab.getValue() : 0;
      prMet = pcBab >= pr.value;
      desc = `Grundangriffsbonus (BAB) +${pr.value} (Aktuell: +${pcBab})`;
    } else if (pr.type === 'feat') {
      prMet = learnedIds.includes(pr.id);
      const parentFeat = CombatFeats.REGISTRY[pr.id];
      const parentName = parentFeat ? parentFeat.nameDe : pr.id;
      desc = `Talent: ${parentName}`;
    } else if (pr.type === 'classLevel') {
      const cls = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === pr.class) : null;
      const lvl = cls ? cls.level : 0;
      prMet = lvl >= pr.value;
      const classNameDe = pr.class === 'fighter' ? 'Kämpfer' : pr.class === 'wizard' ? 'Magier' : pr.class;
      desc = `${classNameDe} Stufe ${pr.value} (Aktuell: Stufe ${lvl})`;
    } else if (pr.type === 'class') {
      const hasCls = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === pr.class);
      prMet = hasCls;
      const classNameDe = pr.class === 'wizard' ? 'Magier' : pr.class;
      desc = `Klasse: ${classNameDe}`;
    } else if (pr.type === 'stat') {
      const nameMap = { str: 'Stärke', dex: 'Geschicklichkeit', con: 'Konstitution', int: 'Intelligenz', wis: 'Weisheit', cha: 'Charisma' };
      const pcStat = pc[pr.name] ? pc[pr.name].getValue() : 10;
      prMet = pcStat >= pr.value;
      desc = `${nameMap[pr.name] || pr.name} ${pr.value}+ (Aktuell: ${pcStat})`;
    } else if (pr.type === 'level') {
      const pcLevel = pc.level || 1;
      prMet = pcLevel >= pr.value;
      desc = `Charakterstufe ${pr.value} (Aktuell: ${pcLevel})`;
    } else if (pr.type === 'casterLevel') {
      let maxCL = 0;
      if (Array.isArray(pc.classes)) {
        pc.classes.forEach(c => {
          if (['wizard', 'cleric', 'druid', 'sorcerer', 'bard'].includes(c.classType)) {
            maxCL = Math.max(maxCL, c.level);
          } else if (['paladin', 'ranger'].includes(c.classType) && c.level >= 4) {
            maxCL = Math.max(maxCL, Math.floor(c.level / 2));
          }
        });
      }
      prMet = maxCL >= pr.value;
      desc = `Zaubererstufe ${pr.value} (Aktuell: ${maxCL})`;
    } else if (pr.type === 'custom') {
      if (pr.desc === 'Fähigkeit, Untote zu vertreiben') {
        const clericClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'cleric') : null;
        const paladinClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'paladin') : null;
        const clericLvl = clericClass ? clericClass.level : 0;
        const paladinLvl = paladinClass ? paladinClass.level : 0;
        prMet = clericLvl >= 1 || paladinLvl >= 4;
        desc = `Spezial: ${pr.desc} (Kleriker 1+ oder Paladin 4+)`;
      } else if (pr.desc === 'Bardenmusik') {
        const bardClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'bard') : null;
        const bardLvl = bardClass ? bardClass.level : 0;
        prMet = bardLvl >= 1;
        desc = `Spezial: ${pr.desc} (Barde 1+)`;
      } else if (pr.desc === 'Tiergestalt (Wild Shape)') {
        const druidClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'druid') : null;
        const druidLvl = druidClass ? druidClass.level : 0;
        prMet = druidLvl >= 5;
        desc = `Spezial: ${pr.desc} (Druide 5+)`;
      } else if (pr.desc === 'Reiten 1 Rang') {
        let ranks = 0;
        if (typeof pc.getSkillRanks === 'function') {
          ranks = pc.getSkillRanks('ride');
        } else if (pc.skills && pc.skills['ride']) {
          ranks = parseFloat(pc.skills['ride'].ranks) || 0;
        }
        prMet = ranks >= 1;
        desc = `Spezial: ${pr.desc} (aktuell: ${ranks})`;
      } else {
        prMet = true;
        desc = `Spezial: ${pr.desc}`;
      }
    }
    
    if (!prMet) met = false;
    details.push({ met: prMet, desc });
  });
  
  return { met, details };
}
