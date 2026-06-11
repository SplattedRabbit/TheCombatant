/**
 * @module    SkillFeatApplier
 * @summary   Wendet passive D&D 3.5e Talentboni und Skill Focus auf Fertigkeiten an.
 * @exports   applyFeatSkillBonuses(pc, skillKey, skillDef)
 * @reads     pc.feats
 * @stateOps  keine
 * @depends   keine
 * @notHere   Basis-Boni -> SkillBaseCalculator.js | Synergie-Boni -> SkillSynergyResolver.js
 */

export function applyFeatSkillBonuses(pc, skillKey, skillDef) {
  let bonus = 0;

  if (Array.isArray(pc.feats)) {
    const hasFeat = (featId) => pc.feats.some(f => f.id === featId);

    if (hasFeat('acrobatic') && (skillKey === 'jump' || skillKey === 'tumble')) {
      bonus += 2;
    }
    if (hasFeat('agile') && (skillKey === 'balance' || skillKey === 'escape_artist')) {
      bonus += 2;
    }
    if (hasFeat('alertness') && (skillKey === 'listen' || skillKey === 'spot')) {
      bonus += 2;
    }
    if (hasFeat('animal_affinity') && (skillKey === 'handle_animal' || skillKey === 'ride')) {
      bonus += 2;
    }
    if (hasFeat('athletic') && (skillKey === 'climb' || skillKey === 'swim')) {
      bonus += 2;
    }
    if (hasFeat('deceitful') && (skillKey === 'disguise' || skillKey === 'forgery')) {
      bonus += 2;
    }
    if (hasFeat('deft_hands') && (skillKey === 'sleight_of_hand' || skillKey === 'use_rope')) {
      bonus += 2;
    }
    if (hasFeat('diligent') && (skillKey === 'appraise' || skillKey === 'decipher_script')) {
      bonus += 2;
    }
    if (hasFeat('investigator') && (skillKey === 'gather_information' || skillKey === 'search')) {
      bonus += 2;
    }
    if (hasFeat('negotiator') && (skillKey === 'diplomacy' || skillKey === 'sense_motive')) {
      bonus += 2;
    }
    if (hasFeat('nimble_fingers') && (skillKey === 'open_lock' || skillKey === 'disable_device')) {
      bonus += 2;
    }
    if (hasFeat('persuasive') && (skillKey === 'bluff' || skillKey === 'intimidate')) {
      bonus += 2;
    }
    if (hasFeat('self_sufficient') && (skillKey === 'heal' || skillKey === 'survival')) {
      bonus += 2;
    }
    if (hasFeat('stealthy') && (skillKey === 'hide' || skillKey === 'move_silently')) {
      bonus += 2;
    }
    if (hasFeat('magical_aptitude') && (skillKey === 'spellcraft' || skillKey === 'use_magic_device')) {
      bonus += 2;
    }

    pc.feats.forEach(feat => {
      if (feat.id === 'skill_focus' && feat.option) {
        const opt = feat.option.toLowerCase().trim();
        const nameDe = skillDef.nameDe.toLowerCase();
        if (opt === skillKey || opt.includes(skillKey) || opt.includes(nameDe) || nameDe.includes(opt)) {
          bonus += 3;
        }
      }
    });
  }

  return bonus;
}
