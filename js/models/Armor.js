import { ARMOR_REGISTRY } from '../data/armor-data.js';

/**
 * Encapsulates an armor or shield configuration in the player's inventory.
 */
export class Armor {
  constructor(a = {}) {
    this.id = a.id || (Date.now() + '-' + Math.random().toString(36).slice(2, 7));
    this.name = a.name || '';
    this.type = a.type || 'padded';
    this.enhancement = a.enhancement !== undefined ? parseInt(a.enhancement) : 0;
    this.isEquipped = !!a.isEquipped;

    // Overrides
    this.armorBonusOverride = a.armorBonusOverride !== undefined ? a.armorBonusOverride : '';
    this.maxDexOverride = a.maxDexOverride !== undefined ? a.maxDexOverride : '';
    this.checkPenaltyOverride = a.checkPenaltyOverride !== undefined ? a.checkPenaltyOverride : '';
    this.spellFailureOverride = a.spellFailureOverride !== undefined ? a.spellFailureOverride : '';
  }

  get isShield() {
    const def = ARMOR_REGISTRY[this.type];
    return def ? !!def.isShield : false;
  }

  get armorBonus() {
    if (this.armorBonusOverride !== '' && this.armorBonusOverride !== undefined && this.armorBonusOverride !== null) {
      return parseInt(this.armorBonusOverride) || 0;
    }
    const def = ARMOR_REGISTRY[this.type];
    return def ? def.armorBonus : 0;
  }

  get maxDex() {
    if (this.maxDexOverride !== '' && this.maxDexOverride !== undefined && this.maxDexOverride !== null) {
      if (this.maxDexOverride === 'null' || this.maxDexOverride === '-') return null;
      return parseInt(this.maxDexOverride) === 0 ? 0 : (parseInt(this.maxDexOverride) || null);
    }
    const def = ARMOR_REGISTRY[this.type];
    return def && def.maxDex !== undefined ? def.maxDex : null;
  }

  get checkPenalty() {
    if (this.checkPenaltyOverride !== '' && this.checkPenaltyOverride !== undefined && this.checkPenaltyOverride !== null) {
      return parseInt(this.checkPenaltyOverride) || 0;
    }
    const def = ARMOR_REGISTRY[this.type];
    return def ? def.checkPenalty : 0;
  }

  get spellFailure() {
    if (this.spellFailureOverride !== '' && this.spellFailureOverride !== undefined && this.spellFailureOverride !== null) {
      return parseInt(this.spellFailureOverride) || 0;
    }
    const def = ARMOR_REGISTRY[this.type];
    return def ? def.spellFailure : 0;
  }

  get speedCategory() {
    const def = ARMOR_REGISTRY[this.type];
    return def ? def.speedCategory : 'light';
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      enhancement: this.enhancement,
      isEquipped: this.isEquipped,
      armorBonusOverride: this.armorBonusOverride,
      maxDexOverride: this.maxDexOverride,
      checkPenaltyOverride: this.checkPenaltyOverride,
      spellFailureOverride: this.spellFailureOverride
    };
  }
}
