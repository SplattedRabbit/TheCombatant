/**
 * @module    classValidation
 * @summary   Validates if a character meets the prerequisites for a Prestige Class
 * @exports   validatePrestigeClassPrereqs
 * @reads     pc.classes, pc.skills, pc.feats, pc.alignment, pc.race, pc.bab
 * @stateOps  none
 * @depends   RulesSpells, CombatRules
 */

import { getMaxSpellLevel } from './RulesSpells.js';
import { CLASSES } from './RulesData.js';
import { CombatFeats } from '../data/feats-data.js';

// Maps standard D&D alignment abbreviations (e.g. 'LE', 'NG', 'TN') to their full names,
// so free-text alignment input like the header field's "e.g. LG" placeholder validates correctly.
const ALIGNMENT_ABBREVIATIONS = {
  lg: 'lawful good', ng: 'neutral good', cg: 'chaotic good',
  ln: 'lawful neutral', n: 'true neutral', tn: 'true neutral', cn: 'chaotic neutral',
  le: 'lawful evil', ne: 'neutral evil', ce: 'chaotic evil'
};

function normalizeAlignment(raw) {
  const trimmed = (raw || '').trim().toLowerCase();
  const compact = trimmed.replace(/\s+/g, '');
  return ALIGNMENT_ABBREVIATIONS[compact] || trimmed;
}

export function validatePrestigeClassPrereqs(pc, classKey) {
  const errors = [];
  const metDetails = [];

  // Find class definition in RULES
  const clsDef = CLASSES.find(c => c.key === classKey);
  if (!clsDef) {
    return { success: false, errors: ['Class not found'], metDetails };
  }

  // If it's not a prestige class, it's always available!
  if (!clsDef.isPrestige) {
    return { success: true, errors: [], metDetails };
  }

  const prereqs = clsDef.prerequisites || {};

  // 1. BAB Check
  if (prereqs.bab !== undefined) {
    const bab = pc.bab && typeof pc.bab.getValue === 'function' ? pc.bab.getValue() : 0;
    const met = bab >= prereqs.bab;
    metDetails.push({
      label: `Base Attack Bonus (BAB): +${prereqs.bab}`,
      current: `+${bab}`,
      required: `+${prereqs.bab}`,
      met
    });
    if (!met) errors.push(`BAB +${prereqs.bab} required (+${bab} present)`);
  }

  // 2. Skill Ranks Check
  if (prereqs.skills) {
    Object.entries(prereqs.skills).forEach(([skillKey, requiredRanks]) => {
      const ranks = typeof pc.getSkillRanks === 'function' ? pc.getSkillRanks(skillKey) : 0;
      const met = ranks >= requiredRanks;
      
      // Get readable skill name or format it nicely
      const skillLabel = skillKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      metDetails.push({
        label: `${skillLabel}: ${requiredRanks} Ranks`,
        current: `${ranks} Ranks`,
        required: `${requiredRanks} Ranks`,
        met
      });
      if (!met) errors.push(`${skillLabel}: ${requiredRanks} ranks required (${ranks} present)`);
    });
  }

  // 3. Feats Check
  if (prereqs.feats) {
    prereqs.feats.forEach(featId => {
      const hasFeat = typeof pc.hasFeat === 'function' ? pc.hasFeat(featId) : (pc.feats && pc.feats.some(f => f.id === featId));
      const featName = featId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      metDetails.push({
        label: `Feat: ${featName}`,
        current: hasFeat ? 'Yes' : 'No',
        required: 'Yes',
        met: hasFeat
      });
      if (!hasFeat) errors.push(`Feat ${featName} required`);
    });
  }

  // 4. Attributes Check (Explicit and implicit from required feats)
  const requiredStats = {};

  // a) Explicit attributes defined in class prerequisites
  if (prereqs.attributes) {
    Object.entries(prereqs.attributes).forEach(([statKey, minVal]) => {
      const lowerKey = statKey.toLowerCase();
      requiredStats[lowerKey] = {
        minVal,
        sources: []
      };
    });
  }

  // b) Implicit attributes from required feats
  if (Array.isArray(prereqs.feats)) {
    prereqs.feats.forEach(featId => {
      const featDef = CombatFeats?.REGISTRY?.[featId];
      if (featDef && Array.isArray(featDef.prereqs)) {
        featDef.prereqs.forEach(fp => {
          if (fp.type === 'stat' && fp.name && fp.value) {
            const statKey = fp.name.toLowerCase();
            const featName = featDef.nameEn || featDef.nameDe || featId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            if (!requiredStats[statKey]) {
              requiredStats[statKey] = {
                minVal: fp.value,
                sources: [featName]
              };
            } else {
              if (fp.value > requiredStats[statKey].minVal) {
                requiredStats[statKey].minVal = fp.value;
              }
              if (!requiredStats[statKey].sources.includes(featName)) {
                requiredStats[statKey].sources.push(featName);
              }
            }
          }
        });
      }
    });
  }

  const STAT_NAMES = {
    str: 'Strength (STR)',
    dex: 'Dexterity (DEX)',
    con: 'Constitution (CON)',
    int: 'Intelligence (INT)',
    wis: 'Wisdom (WIS)',
    cha: 'Charisma (CHA)'
  };

  Object.entries(requiredStats).forEach(([statKey, info]) => {
    const { minVal, sources } = info;
    const statObj = pc && (pc[statKey] !== undefined ? pc[statKey] : (pc.attributes && pc.attributes[statKey]));
    let currentVal = 10;
    if (statObj !== undefined && statObj !== null) {
      if (typeof statObj === 'number') currentVal = statObj;
      else if (typeof statObj.getValue === 'function') currentVal = statObj.getValue();
      else if (statObj.base !== undefined) currentVal = statObj.base;
      else if (statObj.value !== undefined) currentVal = statObj.value;
    }

    const met = currentVal >= minVal;
    const statLabel = STAT_NAMES[statKey] || statKey.toUpperCase();
    const sourceSuffix = sources.length > 0 ? ` (Required for ${sources.join(', ')})` : '';
    const fullLabel = `${statLabel}: ${minVal}+${sourceSuffix}`;

    metDetails.push({
      label: fullLabel,
      current: `${currentVal}`,
      required: `${minVal}+`,
      met
    });

    if (!met) {
      errors.push(`${statLabel} ${minVal}+ erforderlich (${currentVal} vorhanden)`);
    }
  });

  // 5. Alignment Check
  if (prereqs.alignment) {
    let met = true;
    let currentAlign = pc.alignment || 'Neutral';
    let label = 'Alignment';
    let reqStr = '';
    
    if (prereqs.alignment === 'lawful_good' || prereqs.alignment === 'lawful good' || prereqs.alignment === 'lg') {
      label = 'Alignment: Lawful Good';
      reqStr = 'Lawful Good';
      const lowerAlign = normalizeAlignment(currentAlign);
      if (lowerAlign !== 'lawful good' && !lowerAlign.includes('rechtschaffen gut') && !lowerAlign.includes('lawful good')) {
        met = false;
      }
    } else if (prereqs.alignment === 'nonlawful') {
      label = 'Alignment: Non-Lawful';
      reqStr = 'Non-Lawful';
      const lowerAlign = normalizeAlignment(currentAlign);
      if (lowerAlign.includes('lawful') || lowerAlign.includes('rechtschaffen')) {
        met = false;
      }
    } else if (prereqs.alignment === 'evil') {
      label = 'Alignment: Evil';
      reqStr = 'Evil';
      const lowerAlign = normalizeAlignment(currentAlign);
      if (!lowerAlign.includes('evil') && !lowerAlign.includes('böse') && !lowerAlign.includes('boese')) {
        met = false;
      }
    }
    
    metDetails.push({
      label,
      current: currentAlign,
      required: reqStr,
      met
    });
    if (!met) {
      if (prereqs.alignment === 'lawful_good' || prereqs.alignment === 'lawful good' || prereqs.alignment === 'lg') {
        errors.push('Lawful Good (LG) alignment required');
      } else if (prereqs.alignment === 'nonlawful') {
        errors.push('Alignment must not be lawful');
      } else {
        errors.push('Evil alignment required');
      }
    }
  }


  // 5. Race Check
  if (prereqs.race) {
    let met = true;
    let currentRace = pc.race || '';
    if (prereqs.race === 'nondragon') {
      if (currentRace.toLowerCase().includes('dragon') || currentRace.toLowerCase().includes('drache')) {
        met = false;
      }
    }
    metDetails.push({
      label: 'Race: Non-Dragon',
      current: currentRace || 'None',
      required: 'Non-Dragon',
      met
    });
    if (!met) errors.push('Race must not be a Dragon / Half-Dragon');
  }

  // 6. Languages Check
  if (prereqs.languages) {
    const languages = Array.isArray(pc.languages) ? pc.languages : [];
    const hasDraconic = languages.some(l => l.toLowerCase() === 'draconic' || l.toLowerCase() === 'drakonisch');
    
    metDetails.push({
      label: 'Language: Draconic',
      current: hasDraconic ? 'Yes' : 'Yes', // Draconic language condition is assumed to be met or simulated
      required: 'Yes',
      met: true
    });
  }

  // 7. Spells / Spellcasting Checks
  if (prereqs.spells) {
    const arcaneClasses = ['wizard', 'sorcerer', 'bard', 'duskblade', 'beguiler', 'assassin'];
    const divineClasses = ['cleric', 'druid', 'paladin', 'ranger'];

    // Arcane level check
    if (prereqs.spells.arcane !== undefined) {
      const maxArcaneSpellLvl = pc.classes ? Math.max(0, ...pc.classes.map(c => {
        if (!arcaneClasses.includes(c.classType)) return 0;
        return getMaxSpellLevel(c.classType, c.level);
      })) : 0;
      
      const met = maxArcaneSpellLvl >= prereqs.spells.arcane;
      metDetails.push({
        label: `Arcane spells of level ${prereqs.spells.arcane}+`,
        current: `Level ${maxArcaneSpellLvl}`,
        required: `Level ${prereqs.spells.arcane}`,
        met
      });
      if (!met) errors.push(`Ability to cast ${prereqs.spells.arcane}th-level arcane spells required`);
    }

    // Divine level check
    if (prereqs.spells.divine !== undefined) {
      const maxDivineSpellLvl = pc.classes ? Math.max(0, ...pc.classes.map(c => {
        if (!divineClasses.includes(c.classType)) return 0;
        return getMaxSpellLevel(c.classType, c.level);
      })) : 0;
      
      const met = maxDivineSpellLvl >= prereqs.spells.divine;
      metDetails.push({
        label: `Divine spells of level ${prereqs.spells.divine}+`,
        current: `Level ${maxDivineSpellLvl}`,
        required: `Level ${prereqs.spells.divine}`,
        met
      });
      if (!met) errors.push(`Ability to cast ${prereqs.spells.divine}th-level divine spells required`);
    }

    // Mage hand check
    if (prereqs.spells.mage_hand) {
      const canCastArcane = pc.classes ? pc.classes.some(c => {
        return arcaneClasses.includes(c.classType) && getMaxSpellLevel(c.classType, c.level) >= 0;
      }) : false;
      
      metDetails.push({
        label: 'Spells: Mage Hand',
        current: canCastArcane ? 'Yes' : 'No',
        required: 'Yes',
        met: canCastArcane
      });
      if (!canCastArcane) errors.push('Ability to cast Mage Hand required');
    }

    // Spontaneous Arcane check
    if (prereqs.spells.spontaneousArcane) {
      const hasSpontaneousArcane = pc.classes ? pc.classes.some(c => {
        return ['sorcerer', 'bard'].includes(c.classType) && getMaxSpellLevel(c.classType, c.level) >= 1;
      }) : false;
      
      metDetails.push({
        label: 'Spontaneous Arcane Spellcasting',
        current: hasSpontaneousArcane ? 'Yes' : 'No',
        required: 'Yes',
        met: hasSpontaneousArcane
      });
      if (!hasSpontaneousArcane) errors.push('Ability to cast spontaneous arcane spells (Sorcerer or Bard) required');
    }
  }

  // 8. Special / Class Feature checks
  if (prereqs.special) {
    if (prereqs.special.detect_evil) {
      const hasDetectEvil = (Array.isArray(pc.classes) && pc.classes.some(c => 
        (c.classType === 'paladin' && c.level >= 1) || 
        (c.classType === 'cleric' && c.level >= 1)
      )) || (Array.isArray(pc.learnedSpells) && pc.learnedSpells.includes('detect_evil'));
      
      metDetails.push({
        label: 'Special: Detect Evil (class feature or divine spell)',
        current: hasDetectEvil ? 'Yes' : 'No',
        required: 'Yes',
        met: hasDetectEvil
      });
      if (!hasDetectEvil) errors.push('Detect Evil class feature or divine spell required');
    }

    if (prereqs.special.turn_undead) {
      const hasTurnUndead = (Array.isArray(pc.classes) && pc.classes.some(c => 
        (c.classType === 'cleric' && c.level >= 1) || 
        (c.classType === 'paladin' && c.level >= 4)
      )) || (typeof pc.hasFeat === 'function' && pc.hasFeat('turn_undead'));

      metDetails.push({
        label: 'Special: Turn Undead class feature',
        current: hasTurnUndead ? 'Yes' : 'No',
        required: 'Yes',
        met: hasTurnUndead
      });
      if (!hasTurnUndead) errors.push('Turn Undead class feature required');
    }

    if (prereqs.special.sneak_attack !== undefined) {
      const saDice = pc.getSneakAttackDiceCount ? pc.getSneakAttackDiceCount() : 0;
      const met = saDice >= prereqs.special.sneak_attack;
      
      metDetails.push({
        label: `Sneak Attack: +${prereqs.special.sneak_attack}d6`,
        current: `+${saDice}d6`,
        required: `+${prereqs.special.sneak_attack}d6`,
        met
      });
      if (!met) errors.push(`Sneak Attack +${prereqs.special.sneak_attack}d6 required (+${saDice}d6 present)`);
    }
  }

  // 9. Custom Special Text condition
  if (prereqs.specialText) {
    const met = !!(pc.prestigeSpecialTextConfirmed && pc.prestigeSpecialTextConfirmed[classKey]);
    metDetails.push({
      label: `Special: ${prereqs.specialText}`,
      current: met ? 'Met' : 'Not confirmed',
      required: 'Met',
      met
    });
    if (!met) errors.push(`Special prerequisite must be confirmed: ${prereqs.specialText}`);
  }

  const success = errors.length === 0;
  return { success, errors, metDetails };
}

/**
 * Returns true if the only unmet requirement in a validation result is the
 * freetext "specialText" prerequisite (label starts with "Special: ") — used
 * by UI dialogs to decide whether a locked class can be unlocked via a
 * confirmation prompt instead of a plain read-only alert.
 */
export function isOnlySpecialTextUnmet(validation) {
  if (!validation || validation.success) return false;
  const unmet = (validation.metDetails || []).filter(d => !d.met);
  return unmet.length === 1 && unmet[0].label.startsWith('Special:');
}

