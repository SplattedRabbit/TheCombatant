import { ARMOR_REGISTRY } from '../data/armor-data.js';

/**
 * @module    Armor
 * @summary   Rüstungs- und Schildmodell. Getter für armorBonus/maxDex/checkPenalty/spellFailure/speedCategory mit Override-Support.
 * @exports   Armor (class), isShieldItem (function)
 * @reads     armor.type, armor.isEquipped, armor.*Override-Felder
 * @stateOps  Keine — Mutation via PCManager (addPCArmor, togglePCArmorEquip)
 * @depends   ARMOR_REGISTRY (armor-data.js)
 * @notHere   Rüstungs-UI → PCOffense.js | Rüstungsdaten → js/data/armor-data.js
 */

export function isShieldItem(item) {
  if (!item) return false;
  if (typeof item.isShield === 'boolean') return item.isShield;
  const def = ARMOR_REGISTRY[item.type];
  return def ? Boolean(def.isShield) : false;
}

export function matchesShieldFeatOption(shield, option) {
  if (!shield) return false;
  if (!option || typeof option !== 'string' || !option.trim()) return true;

  const opt = option.toLowerCase().trim();
  const type = (shield.type || '').toLowerCase();
  const name = (shield.name || '').toLowerCase();
  const def = ARMOR_REGISTRY[shield.type];
  const defName = def ? (def.name || def.nameEn || def.nameDe || '').toLowerCase() : '';

  if (opt.includes('buckler')) {
    return type === 'buckler' || name.includes('buckler') || defName.includes('buckler');
  }
  if (opt.includes('light') || opt.includes('leicht')) {
    return type.includes('light') || name.includes('light') || name.includes('leicht') || defName.includes('light') || defName.includes('leicht');
  }
  if (opt.includes('heavy') || opt.includes('schwer')) {
    return type.includes('heavy') || name.includes('heavy') || name.includes('schwer') || defName.includes('heavy') || defName.includes('schwer');
  }
  if (opt.includes('tower') || opt.includes('turm')) {
    return type.includes('tower') || name.includes('tower') || name.includes('turm') || defName.includes('tower') || defName.includes('turm');
  }

  return name.includes(opt) || type.includes(opt) || defName.includes(opt) || opt === 'shield' || opt === 'schild';
}

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
