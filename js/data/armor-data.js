export const ARMOR_REGISTRY = {
  // Leichte Rüstung
  padded: {
    key: 'padded',
    nameDe: 'Gepolsterte Rüstung',
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
    nameDe: 'Lederrüstung',
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
    nameDe: 'Beschlagenes Leder',
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
    nameDe: 'Kettenhemd',
    nameEn: 'Chain shirt',
    armorBonus: 4,
    maxDex: 4,
    checkPenalty: 2,
    spellFailure: 20,
    speedCategory: 'light',
    isShield: false
  },

  // Mittelschwere Rüstung
  hide: {
    key: 'hide',
    nameDe: 'Fellrüstung',
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
    nameDe: 'Schuppenpanzer',
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
    nameDe: 'Kettenpanzer',
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
    nameDe: 'Brustplatte',
    nameEn: 'Breastplate',
    armorBonus: 5,
    maxDex: 3,
    checkPenalty: 4,
    spellFailure: 25,
    speedCategory: 'medium',
    isShield: false
  },

  // Schwere Rüstung
  splint_mail: {
    key: 'splint_mail',
    nameDe: 'Schienenpanzer',
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
    nameDe: 'Bänderpanzer',
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
    nameDe: 'Halbharnisch',
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
    nameDe: 'Ritterharnisch',
    nameEn: 'Full plate',
    armorBonus: 8,
    maxDex: 1,
    checkPenalty: 6,
    spellFailure: 35,
    speedCategory: 'heavy',
    isShield: false
  },

  // Schilde
  buckler: {
    key: 'buckler',
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
    nameDe: 'Leichter Holzschild',
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
    nameDe: 'Leichter Stahlschild',
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
    nameDe: 'Schwerer Holzschild',
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
    nameDe: 'Schwerer Stahlschild',
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
    nameDe: 'Turmschild',
    nameEn: 'Tower shield',
    armorBonus: 4,
    maxDex: 2,
    checkPenalty: 10,
    spellFailure: 50,
    speedCategory: 'shield',
    isShield: true
  },

  // Eigene / Benutzerdefinierte Typen
  custom_light_armor: {
    key: 'custom_light_armor',
    nameDe: 'Eigene leichte Rüstung',
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
    nameDe: 'Eigene mittelschwere Rüstung',
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
    nameDe: 'Eigene schwere Rüstung',
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
    nameDe: 'Eigener Schild',
    nameEn: 'Custom shield',
    armorBonus: 2,
    maxDex: null,
    checkPenalty: 2,
    spellFailure: 15,
    speedCategory: 'shield',
    isShield: true
  }
};
