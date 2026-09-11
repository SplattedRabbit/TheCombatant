/**
 * @module    helpers.feats
 * @summary   Feat-slot calculation utilities for the Character Creation Wizard.
 *            Determines which feat slots open at each character level based on
 *            class type, character level and race (RAW D&D 3.5e rules).
 */

// Helper to determine feat slots at a level
export const getFeatSlotsAtLevel = (lvlIdx: number, currentClassType: string, selectedRace: string, levelConfigs: any[]) => {
  const slots: { label: string; allowedCategories: string[]; defaultFeat?: string; allowedFeats?: string[] }[] = [];
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

  if (currentClassType === 'fighter') {
    if (classLevel === 1 || classLevel % 2 === 0) {
      slots.push({
        label: `Fighter Bonus Feat (Class Level ${classLevel})`,
        allowedCategories: ['combat']
      });
    }
  } else if (currentClassType === 'wizard') {
    if (classLevel === 1) {
      slots.push({
        label: `Wizard (Scribe Scroll)`,
        allowedCategories: ['item_creation'],
        defaultFeat: 'scribe_scroll'
      });
    } else if (classLevel % 5 === 0) {
      slots.push({
        label: `Wizard Bonus Feat (Class Level ${classLevel})`,
        allowedCategories: ['metamagic', 'item_creation']
      });
    }
  } else if (currentClassType === 'shadowbane_inquisitor') {
    if (classLevel === 3) {
      slots.push({
        label: 'Shadowbane Inquisitor (Improved Sunder)',
        allowedCategories: ['combat'],
        defaultFeat: 'improved_sunder'
      });
    }
  } else if (currentClassType === 'ranger') {
    if (classLevel === 1) {
      slots.push({
        label: 'Ranger (Track)',
        allowedCategories: ['general'],
        defaultFeat: 'track'
      });
    } else if (classLevel === 2) {
      slots.push({
        label: 'Ranger Combat Style',
        allowedCategories: ['combat'],
        defaultFeat: 'rapid_shot',
        allowedFeats: ['rapid_shot', 'two_weapon_fighting']
      });
    } else if (classLevel === 3) {
      slots.push({
        label: 'Ranger (Endurance)',
        allowedCategories: ['general'],
        defaultFeat: 'endurance'
      });
    } else if (classLevel === 6) {
      slots.push({
        label: 'Ranger Improved Combat Style',
        allowedCategories: ['combat'],
        defaultFeat: 'manyshot',
        allowedFeats: ['manyshot', 'improved_two_weapon_fighting']
      });
    } else if (classLevel === 11) {
      slots.push({
        label: 'Ranger Greater Combat Style',
        allowedCategories: ['combat'],
        defaultFeat: 'improved_precise_shot',
        allowedFeats: ['improved_precise_shot', 'greater_two_weapon_fighting']
      });
    }
  } else if (currentClassType === 'monk') {
    if (classLevel === 1) {
      slots.push({
        label: 'Monk (Improved Unarmed Strike)',
        allowedCategories: ['combat'],
        defaultFeat: 'improved_unarmed_strike'
      });
      slots.push({
        label: 'Monk Bonus Feat (Level 1)',
        allowedCategories: ['combat'],
        defaultFeat: 'stunning_fist',
        allowedFeats: ['stunning_fist', 'improved_grapple']
      });
    } else if (classLevel === 2) {
      slots.push({
        label: 'Monk Bonus Feat (Level 2)',
        allowedCategories: ['combat'],
        defaultFeat: 'combat_reflexes',
        allowedFeats: ['combat_reflexes', 'deflect_arrows']
      });
    } else if (classLevel === 6) {
      slots.push({
        label: 'Monk Bonus Feat (Level 6)',
        allowedCategories: ['combat'],
        defaultFeat: 'improved_trip',
        allowedFeats: ['improved_trip', 'improved_disarm']
      });
    }
  } else if (currentClassType === 'duskblade') {
    if (classLevel === 2) {
      slots.push({
        label: 'Duskblade (Combat Casting)',
        allowedCategories: ['general'],
        defaultFeat: 'combat_casting'
      });
    }
  } else if (currentClassType === 'knight') {
    if (classLevel === 2) {
      slots.push({
        label: 'Knight (Mounted Combat)',
        allowedCategories: ['combat'],
        defaultFeat: 'mounted_combat'
      });
    }
  } else if (currentClassType === 'dragon_shaman') {
    if (classLevel === 2) {
      slots.push({
        label: 'Dragon Shaman (Skill Focus)',
        allowedCategories: ['general'],
        defaultFeat: 'skill_focus'
      });
    }
  }

  return slots;
};
