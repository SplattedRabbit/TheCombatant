/**
 * @module    wizardValidation
 * @summary   Validation logic and hit die rules for CharacterWizardDialog.
 */

import { CombatRules } from '../../../../js/rules.js';
import { CLASSES_LIST } from './constants.ts';
import { DRAGON_TOTEMS, isTotemAllowedForAlignment } from '../../../../js/rules/data/dragonTotems.js';

export function getClassHitDie(clsKey: string): number {
  const listMatch = CLASSES_LIST.find((c: any) => c.key === clsKey);
  if (listMatch?.hd) return listMatch.hd;
  const rulesMatch = CombatRules.CLASSES.find((c: any) => c.key === clsKey);
  return rulesMatch?.hitDie || rulesMatch?.hd || 8;
}

export interface StepValidationResult {
  valid: boolean;
  alert?: {
    title: string;
    message: string;
    buttonText: string;
    icon: string;
  };
}

export function validateStep3Config({
  currentConfig,
  currentLevelIndex,
  currentLevelRemainingSkillPoints,
  currentFeatSlots,
  alignmentEthical,
  alignmentMoral,
}: {
  currentConfig: any;
  currentLevelIndex: number;
  currentLevelRemainingSkillPoints: number;
  currentFeatSlots: any[];
  alignmentEthical?: string;
  alignmentMoral?: string;
}): StepValidationResult {
  if (!currentConfig || !currentConfig.classType) {
    return {
      valid: false,
      alert: {
        title: "Class Missing",
        message: `Please select a class for Level ${currentLevelIndex + 1}.`,
        buttonText: "OK",
        icon: "🧙‍♂️"
      }
    };
  }
  const hp = parseInt(currentConfig.hpRoll) || 0;
  const hd = getClassHitDie(currentConfig.classType);
  if (hp < 1 || hp > hd) {
    return {
      valid: false,
      alert: {
        title: "Invalid Hit Points",
        message: `Please enter valid hit points between 1 and ${hd} for Level ${currentLevelIndex + 1}.`,
        buttonText: "OK",
        icon: "🎲"
      }
    };
  }
  const isAbilityIncreaseReq = (currentLevelIndex + 1) % 4 === 0;
  if (isAbilityIncreaseReq && !currentConfig.abilityIncrease) {
    return {
      valid: false,
      alert: {
        title: "Ability Increase",
        message: `Please select an ability score increase for Level ${currentLevelIndex + 1}.`,
        buttonText: "OK",
        icon: "✨"
      }
    };
  }
  if (currentLevelRemainingSkillPoints > 0) {
    return {
      valid: false,
      alert: {
        title: "Skill Points Remaining",
        message: `You still have ${currentLevelRemainingSkillPoints} skill points to distribute for Level ${currentLevelIndex + 1}.`,
        buttonText: "OK",
        icon: "📝"
      }
    };
  }
  if (currentLevelRemainingSkillPoints < 0) {
    return {
      valid: false,
      alert: {
        title: "Skill Points Overspent",
        message: `You have overspent skill points by ${Math.abs(currentLevelRemainingSkillPoints)} for Level ${currentLevelIndex + 1}.`,
        buttonText: "OK",
        icon: "⚠️"
      }
    };
  }

  const emptyFeats = currentFeatSlots.some((slot, idx) => {
    const f = currentConfig.feats?.[idx] || slot.defaultFeat;
    if (!f) return true;
    if (slot.hasOption) {
      const opt = typeof f === 'object' ? f.option : currentConfig.featOptions?.[idx];
      return !opt;
    }
    return false;
  });
  if (emptyFeats) {
    return {
      valid: false,
      alert: {
        title: "Feat Slots Open",
        message: `Please select all feats for Level ${currentLevelIndex + 1}.`,
        buttonText: "OK",
        icon: "🔒"
      }
    };
  }

  // Mandatory Wizard School Specialization & Prohibited schools check
  if (currentConfig.classType === 'wizard') {
    const spec = currentConfig.wizardSpecialization || 'none';
    if (spec !== 'none') {
      if (!currentConfig.wizardProhibited1) {
        return {
          valid: false,
          alert: {
            title: "Prohibited School Required",
            message: "Please select your first prohibited school for your Wizard specialization.",
            buttonText: "OK",
            icon: "⚠️"
          }
        };
      }
      if (spec !== 'div' && !currentConfig.wizardProhibited2) {
        return {
          valid: false,
          alert: {
            title: "Prohibited School Required",
            message: "Please select your second prohibited school for your Wizard specialization.",
            buttonText: "OK",
            icon: "⚠️"
          }
        };
      }
    }
  }

  // Mandatory Dragon Shaman Totem selection & Alignment Hardlock (PHB2 p. 11)
  if (currentConfig.classType === 'dragon_shaman') {
    if (!currentConfig.dragonTotem) {
      return {
        valid: false,
        alert: {
          title: "Totem Dragon Required",
          message: "Please select a Totem Dragon for your Dragon Shaman.",
          buttonText: "OK",
          icon: "⚠️"
        }
      };
    }

    const eth = (alignmentEthical || '').toLowerCase();
    const mor = (alignmentMoral || '').toLowerCase();
    const isTrueNeutral = eth === 'neutral' && mor === 'neutral';
    if (isTrueNeutral) {
      return {
        valid: false,
        alert: {
          title: "Alignment Incompatible",
          message: "True Neutral characters cannot become Dragon Shamans (PHB2 p. 11). Please choose a Good, Evil, Lawful, or Chaotic alignment.",
          buttonText: "OK",
          icon: "⚠️"
        }
      };
    }

    if (alignmentEthical || alignmentMoral) {
      const eLetter = eth === 'lawful' ? 'L' : (eth === 'chaotic' ? 'C' : 'N');
      const mLetter = mor === 'good' ? 'G' : (mor === 'evil' ? 'E' : 'N');
      const abbr = `${eLetter}${mLetter}`;
      const totem = DRAGON_TOTEMS[currentConfig.dragonTotem];
      if (totem && !isTotemAllowedForAlignment(currentConfig.dragonTotem, abbr)) {
        return {
          valid: false,
          alert: {
            title: "Alignment Incompatible with Totem",
            message: `The ${totem.name} requires an alignment of ${totem.alignments.join(', ')}. Your current alignment is ${alignmentEthical} ${alignmentMoral}. Please use the Quick-Sync buttons in Level Configuration to select a compatible alignment.`,
            buttonText: "OK",
            icon: "⚠️"
          }
        };
      }
    }
  }

  return { valid: true };
}
