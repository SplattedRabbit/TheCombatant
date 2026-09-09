export const ARMOR_REGISTRY = {
  // Light Armor
  padded: {
    key: 'padded',
    name: 'Padded armor',
    nameDe: 'Padded armor',
    nameEn: 'Padded armor',
    armorBonus: 1,
    maxDex: 8,
    checkPenalty: 0,
    spellFailure: 5,
    speedCategory: 'light',
    isShield: false
  },
  leather: {
    key: 'leather',
    name: 'Leather armor',
    nameDe: 'Leather armor',
    nameEn: 'Leather armor',
    armorBonus: 2,
    maxDex: 6,
    checkPenalty: 0,
    spellFailure: 10,
    speedCategory: 'light',
    isShield: false
  },
  studded_leather: {
    key: 'studded_leather',
    name: 'Studded leather',
    nameDe: 'Studded leather',
    nameEn: 'Studded leather',
    armorBonus: 3,
    maxDex: 5,
    checkPenalty: 1,
    spellFailure: 15,
    speedCategory: 'light',
    isShield: false
  },
  chain_shirt: {
    key: 'chain_shirt',
    name: 'Chain shirt',
    nameDe: 'Chain shirt',
    nameEn: 'Chain shirt',
    armorBonus: 4,
    maxDex: 4,
    checkPenalty: 2,
    spellFailure: 20,
    speedCategory: 'light',
    isShield: false
  },

  // Medium Armor
  hide: {
    key: 'hide',
    name: 'Hide armor',
    nameDe: 'Hide armor',
    nameEn: 'Hide armor',
    armorBonus: 3,
    maxDex: 4,
    checkPenalty: 3,
    spellFailure: 20,
    speedCategory: 'medium',
    isShield: false
  },
  scale_mail: {
    key: 'scale_mail',
    name: 'Scale mail',
    nameDe: 'Scale mail',
    nameEn: 'Scale mail',
    armorBonus: 4,
    maxDex: 3,
    checkPenalty: 4,
    spellFailure: 25,
    speedCategory: 'medium',
    isShield: false
  },
  chainmail: {
    key: 'chainmail',
    name: 'Chainmail',
    nameDe: 'Chainmail',
    nameEn: 'Chainmail',
    armorBonus: 5,
    maxDex: 2,
    checkPenalty: 5,
    spellFailure: 30,
    speedCategory: 'medium',
    isShield: false
  },
  breastplate: {
    key: 'breastplate',
    name: 'Breastplate',
    nameDe: 'Breastplate',
    nameEn: 'Breastplate',
    armorBonus: 5,
    maxDex: 3,
    checkPenalty: 4,
    spellFailure: 25,
    speedCategory: 'medium',
    isShield: false
  },

  // Heavy Armor
  splint_mail: {
    key: 'splint_mail',
    name: 'Splint mail',
    nameDe: 'Splint mail',
    nameEn: 'Splint mail',
    armorBonus: 6,
    maxDex: 0,
    checkPenalty: 7,
    spellFailure: 40,
    speedCategory: 'heavy',
    isShield: false
  },
  banded_mail: {
    key: 'banded_mail',
    name: 'Banded mail',
    nameDe: 'Banded mail',
    nameEn: 'Banded mail',
    armorBonus: 6,
    maxDex: 1,
    checkPenalty: 6,
    spellFailure: 35,
    speedCategory: 'heavy',
    isShield: false
  },
  half_plate: {
    key: 'half_plate',
    name: 'Half-plate',
    nameDe: 'Half-plate',
    nameEn: 'Half-plate',
    armorBonus: 7,
    maxDex: 0,
    checkPenalty: 7,
    spellFailure: 40,
    speedCategory: 'heavy',
    isShield: false
  },
  full_plate: {
    key: 'full_plate',
    name: 'Full plate',
    nameDe: 'Full plate',
    nameEn: 'Full plate',
    armorBonus: 8,
    maxDex: 1,
    checkPenalty: 6,
    spellFailure: 35,
    speedCategory: 'heavy',
    isShield: false
  },

  // Shields
  buckler: {
    key: 'buckler',
    name: 'Buckler',
    nameDe: 'Buckler',
    nameEn: 'Buckler',
    armorBonus: 1,
    maxDex: null,
    checkPenalty: 1,
    spellFailure: 5,
    speedCategory: 'shield',
    isShield: true
  },
  shield_light_wooden: {
    key: 'shield_light_wooden',
    name: 'Shield, light wooden',
    nameDe: 'Shield, light wooden',
    nameEn: 'Shield, light wooden',
    armorBonus: 1,
    maxDex: null,
    checkPenalty: 1,
    spellFailure: 5,
    speedCategory: 'shield',
    isShield: true
  },
  shield_light_steel: {
    key: 'shield_light_steel',
    name: 'Shield, light steel',
    nameDe: 'Shield, light steel',
    nameEn: 'Shield, light steel',
    armorBonus: 1,
    maxDex: null,
    checkPenalty: 1,
    spellFailure: 5,
    speedCategory: 'shield',
    isShield: true
  },
  shield_heavy_wooden: {
    key: 'shield_heavy_wooden',
    name: 'Shield, heavy wooden',
    nameDe: 'Shield, heavy wooden',
    nameEn: 'Shield, heavy wooden',
    armorBonus: 2,
    maxDex: null,
    checkPenalty: 2,
    spellFailure: 15,
    speedCategory: 'shield',
    isShield: true
  },
  shield_heavy_steel: {
    key: 'shield_heavy_steel',
    name: 'Shield, heavy steel',
    nameDe: 'Shield, heavy steel',
    nameEn: 'Shield, heavy steel',
    armorBonus: 2,
    maxDex: null,
    checkPenalty: 2,
    spellFailure: 15,
    speedCategory: 'shield',
    isShield: true
  },
  shield_tower: {
    key: 'shield_tower',
    name: 'Tower shield',
    nameDe: 'Tower shield',
    nameEn: 'Tower shield',
    armorBonus: 4,
    maxDex: 2,
    checkPenalty: 10,
    spellFailure: 50,
    speedCategory: 'shield',
    isShield: true
  },

  // Custom Armor Types
  custom_light_armor: {
    key: 'custom_light_armor',
    name: 'Custom light armor',
    nameDe: 'Custom light armor',
    nameEn: 'Custom light armor',
    armorBonus: 2,
    maxDex: 6,
    checkPenalty: 0,
    spellFailure: 10,
    speedCategory: 'light',
    isShield: false
  },
  custom_medium_armor: {
    key: 'custom_medium_armor',
    name: 'Custom medium armor',
    nameDe: 'Custom medium armor',
    nameEn: 'Custom medium armor',
    armorBonus: 5,
    maxDex: 3,
    checkPenalty: 4,
    spellFailure: 25,
    speedCategory: 'medium',
    isShield: false
  },
  custom_heavy_armor: {
    key: 'custom_heavy_armor',
    name: 'Custom heavy armor',
    nameDe: 'Custom heavy armor',
    nameEn: 'Custom heavy armor',
    armorBonus: 8,
    maxDex: 1,
    checkPenalty: 6,
    spellFailure: 35,
    speedCategory: 'heavy',
    isShield: false
  },
  custom_shield: {
    key: 'custom_shield',
    name: 'Custom shield',
    nameDe: 'Custom shield',
    nameEn: 'Custom shield',
    armorBonus: 2,
    maxDex: null,
    checkPenalty: 2,
    spellFailure: 15,
    speedCategory: 'shield',
    isShield: true
  }
};
