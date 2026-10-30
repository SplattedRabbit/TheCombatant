/**
 * @module    helpers.feats
 * @summary   Feat-slot calculation utilities for the Character Creation Wizard.
 *            Determines which feat slots open at each character level based on
 *            class type, character level and race (RAW D&D 3.5e rules).
 */

export interface FeatSlotDefinition {
  label: string;
  allowedCategories: string[];
  defaultFeat?: string;
  allowedFeats?: string[];
  hasOption?: boolean;
  optionType?: string;
  optionScope?: string;
  totemKey?: string;
}

type ClassFeatSlotGenerator = (classLevel: number, levelConfigs?: any[]) => FeatSlotDefinition[];

export const CLASS_FEAT_SLOT_REGISTRY: Record<string, ClassFeatSlotGenerator> = {
  fighter: (lvl) => {
    if (lvl === 1 || lvl % 2 === 0) {
      return [{
        label: `Fighter Bonus Feat (Class Level ${lvl})`,
        allowedCategories: ['combat']
      }];
    }
    return [];
  },

  wizard: (lvl) => {
    if (lvl === 1) {
      return [{
        label: 'Wizard (Scribe Scroll)',
        allowedCategories: ['item_creation'],
        defaultFeat: 'scribe_scroll'
      }];
    }
    if (lvl % 5 === 0) {
      return [{
        label: `Wizard Bonus Feat (Class Level ${lvl})`,
        allowedCategories: ['metamagic', 'item_creation']
      }];
    }
    return [];
  },

  shadowbane_inquisitor: (lvl) => {
    if (lvl === 3) {
      return [{
        label: 'Shadowbane Inquisitor (Improved Sunder)',
        allowedCategories: ['combat'],
        defaultFeat: 'improved_sunder'
      }];
    }
    return [];
  },

  ranger: (lvl) => {
    switch (lvl) {
      case 1:
        return [{
          label: 'Ranger (Track)',
          allowedCategories: ['general'],
          defaultFeat: 'track'
        }];
      case 2:
        return [{
          label: 'Ranger Combat Style',
          allowedCategories: ['combat'],
          defaultFeat: 'rapid_shot',
          allowedFeats: ['rapid_shot', 'two_weapon_fighting']
        }];
      case 3:
        return [{
          label: 'Ranger (Endurance)',
          allowedCategories: ['general'],
          defaultFeat: 'endurance'
        }];
      case 6:
        return [{
          label: 'Ranger Improved Combat Style',
          allowedCategories: ['combat'],
          defaultFeat: 'manyshot',
          allowedFeats: ['manyshot', 'improved_two_weapon_fighting']
        }];
      case 11:
        return [{
          label: 'Ranger Greater Combat Style',
          allowedCategories: ['combat'],
          defaultFeat: 'improved_precise_shot',
          allowedFeats: ['improved_precise_shot', 'greater_two_weapon_fighting']
        }];
      default:
        return [];
    }
  },

  monk: (lvl) => {
    if (lvl === 1) {
      return [
        {
          label: 'Monk (Improved Unarmed Strike)',
          allowedCategories: ['combat'],
          defaultFeat: 'improved_unarmed_strike'
        },
        {
          label: 'Monk Bonus Feat (Level 1)',
          allowedCategories: ['combat'],
          defaultFeat: 'stunning_fist',
          allowedFeats: ['stunning_fist', 'improved_grapple']
        }
      ];
    }
    if (lvl === 2) {
      return [{
        label: 'Monk Bonus Feat (Level 2)',
        allowedCategories: ['combat'],
        defaultFeat: 'combat_reflexes',
        allowedFeats: ['combat_reflexes', 'deflect_arrows']
      }];
    }
    if (lvl === 6) {
      return [{
        label: 'Monk Bonus Feat (Level 6)',
        allowedCategories: ['combat'],
        defaultFeat: 'improved_trip',
        allowedFeats: ['improved_trip', 'improved_disarm']
      }];
    }
    return [];
  },

  duskblade: (lvl) => {
    if (lvl === 2) {
      return [{
        label: 'Duskblade (Combat Casting)',
        allowedCategories: ['general'],
        defaultFeat: 'combat_casting'
      }];
    }
    return [];
  },

  knight: (lvl) => {
    if (lvl === 2) {
      return [{
        label: 'Knight (Mounted Combat)',
        allowedCategories: ['combat'],
        defaultFeat: 'mounted_combat'
      }];
    }
    return [];
  },

  dragon_shaman: (lvl, levelConfigs) => {
    const currentTotemKey = levelConfigs?.find(c => c.dragonTotem)?.dragonTotem || 'red';
    if (lvl === 2) {
      return [{
        label: 'Dragon Shaman (Skill Focus: Totem Skill)',
        allowedCategories: ['general'],
        defaultFeat: 'skill_focus',
        allowedFeats: ['skill_focus'],
        hasOption: true,
        optionType: 'skill',
        optionScope: 'totem',
        totemKey: currentTotemKey,
      }];
    }
    if (lvl === 8 || lvl === 16) {
      return [{
        label: 'Dragon Shaman (Skill Focus: Class Skill)',
        allowedCategories: ['general'],
        defaultFeat: 'skill_focus',
        allowedFeats: ['skill_focus'],
        hasOption: true,
        optionType: 'skill',
        optionScope: 'class',
        totemKey: currentTotemKey,
      }];
    }
    return [];
  }
};

// Helper to determine feat slots at a level
export const getFeatSlotsAtLevel = (lvlIdx: number, currentClassType: string, selectedRace: string, levelConfigs: any[]): FeatSlotDefinition[] => {
  const slots: FeatSlotDefinition[] = [];
  const totalLevel = lvlIdx + 1;
  const isHuman = selectedRace === 'human';

  // 1. General Character Feat
  if (totalLevel === 1 || totalLevel === 3 || totalLevel === 6 || totalLevel === 9 || totalLevel === 12 || totalLevel === 15 || totalLevel === 18) {
    slots.push({
      label: `Character Feat (Level ${totalLevel})`,
      allowedCategories: ['combat', 'general', 'metamagic', 'item_creation']
    });
  }

  // 2. Human Bonus Feat
  if (totalLevel === 1 && isHuman) {
    slots.push({
      label: 'Human Bonus Feat',
      allowedCategories: ['combat', 'general', 'metamagic', 'item_creation']
    });
  }

  // 3. Class level calculation
  let classLevel = 0;
  for (let i = 0; i < lvlIdx; i++) {
    if (levelConfigs[i]?.classType === currentClassType) {
      classLevel++;
    }
  }
  classLevel += 1; // including current level

  const generator = CLASS_FEAT_SLOT_REGISTRY[currentClassType];
  if (generator) {
    slots.push(...generator(classLevel, levelConfigs));
  }

  return slots;
};

