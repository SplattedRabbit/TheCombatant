/**
 * @module    wizardValidation
 * @summary   Validation logic and hit die rules for CharacterWizardDialog.
 */

import { CombatRules } from '@core/rules.js';
import { CLASSES_LIST } from './constants';

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
}: {
  currentConfig: any;
  currentLevelIndex: number;
  currentLevelRemainingSkillPoints: number;
  currentFeatSlots: any[];
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
  const emptyFeats = currentFeatSlots.some((slot, idx) => !(currentConfig.feats?.[idx] || slot.defaultFeat));
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

  return { valid: true };
}
