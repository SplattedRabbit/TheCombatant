/**
 * @module    Item
 * @summary   Model for magic items & equipment (Armory 2.0). Supports multi-effects, bonus types, charges, activation, and item sets.
 * @exports   Item (class), getDefaultBonusType (function)
 * @reads     item.slot, item.effects[], item.isEquipped, item.charges, item.activation, item.setId
 * @stateOps  None — Mutations via PCEquipment.js
 */

export function getDefaultBonusType(effectType, effectTarget) {
  if (effectType === 'attribute') return 'enhancement';
  if (effectType === 'save') return 'resistance';
  if (effectType === 'skill') return 'competence';
  if (effectType === 'speed') return 'enhancement';
  if (effectType === 'ac') {
    if (effectTarget === 'deflection') return 'deflection';
    if (effectTarget === 'natural') return 'natural_enhancement';
    if (effectTarget === 'armor') return 'armor';
    if (effectTarget === 'shield') return 'shield';
    if (effectTarget === 'dodge') return 'dodge';
    return 'enhancement';
  }
  return 'untyped';
}

export class Item {
  constructor(data = {}) {
    this.id = data.id || 'item_' + Math.random().toString(36).substr(2, 9);
    this.key = data.key || '';
    this.name = data.name || 'Neuer Gegenstand';
    this.nameDe = data.nameDe || '';
    this.slot = data.slot || 'slotless'; // 'head', 'face', 'neck', 'shoulders', 'torso', 'body', 'wrists', 'hands', 'waist', 'feet', 'ring1', 'ring2', 'slotless'
    this.isEquipped = data.isEquipped !== undefined ? !!data.isEquipped : false;

    // Multi-effects with D&D 3.5e RAW bonus types
    this.effects = Array.isArray(data.effects) ? data.effects.map(e => {
      const type = e.type || 'attribute';
      const target = e.target || 'str';
      return {
        type,
        target,
        value: e.value !== undefined ? parseInt(e.value) || 0 : 0,
        bonusType: e.bonusType || getDefaultBonusType(type, target),
        condition: e.condition || ''
      };
    }) : [];

    // Fallback for single effect (legacy backward compatibility)
    if (this.effects.length === 0) {
      const effectType = data.effectType || 'attribute';
      const effectTarget = data.effectTarget || 'str';
      const effectValue = data.effectValue !== undefined ? parseInt(data.effectValue) || 0 : 0;
      this.effects.push({
        type: effectType,
        target: effectTarget,
        value: effectValue,
        bonusType: data.bonusType || getDefaultBonusType(effectType, effectTarget),
        condition: data.condition || ''
      });
    }

    // Charges & Consumables (e.g. Wands with 50 charges)
    if (data.charges && typeof data.charges === 'object') {
      const max = Math.max(0, parseInt(data.charges.max) || 0);
      const current = Math.min(max, Math.max(0, parseInt(data.charges.current) ?? max));
      this.charges = { current, max };
    } else {
      this.charges = null;
    }

    // Daily Uses (e.g. 3/day)
    if (data.dailyUses && typeof data.dailyUses === 'object') {
      const max = Math.max(0, parseInt(data.dailyUses.max) || 0);
      const current = Math.min(max, Math.max(0, parseInt(data.dailyUses.current) ?? max));
      this.dailyUses = { current, max };
    } else {
      this.dailyUses = null;
    }

    // Usable / Activatable Item configuration
    if (data.activation && typeof data.activation === 'object') {
      this.activation = {
        actionType: data.activation.actionType || 'standard', // 'swift', 'immediate', 'standard', 'full_round', 'free'
        costType: data.activation.costType || 'charges',     // 'charges', 'daily', 'unlimited'
        cost: parseInt(data.activation.cost) || 1,
        effectDescription: data.activation.effectDescription || '',
        appliedBuffKey: data.activation.appliedBuffKey || '' // Key matching BuffRules / Spell catalogue (e.g. 'haste', 'invisibility')
      };
    } else {
      this.activation = null;
    }

    // Item Set membership (MIC Sets)
    this.setId = data.setId || '';

    // Metadata & Fluff
    this.priceGp = parseInt(data.priceGp) || 0;
    this.weightLbs = parseFloat(data.weightLbs) || 0;
    this.description = data.description || '';
    this.aura = data.aura || '';
  }

  // @feature:magicitem @legacy-compat — Getter/Setter für effectType/effectTarget/effectValue
  get effectType() {
    return this.effects[0] ? this.effects[0].type : undefined;
  }

  set effectType(val) {
    if (!this.effects[0]) {
      this.effects[0] = { type: 'attribute', target: 'str', value: 0, bonusType: 'enhancement', condition: '' };
    }
    this.effects[0].type = val;
    this.effects[0].bonusType = getDefaultBonusType(val, this.effects[0].target);
  }

  get effectTarget() {
    return this.effects[0] ? this.effects[0].target : undefined;
  }

  set effectTarget(val) {
    if (!this.effects[0]) {
      this.effects[0] = { type: 'attribute', target: 'str', value: 0, bonusType: 'enhancement', condition: '' };
    }
    this.effects[0].target = val;
    this.effects[0].bonusType = getDefaultBonusType(this.effects[0].type, val);
  }

  get effectValue() {
    return this.effects[0] ? this.effects[0].value : undefined;
  }

  set effectValue(val) {
    if (!this.effects[0]) {
      this.effects[0] = { type: 'attribute', target: 'str', value: 0, bonusType: 'enhancement', condition: '' };
    }
    this.effects[0].value = parseInt(val) || 0;
  }

  toJSON() {
    const json = {
      id: this.id,
      name: this.name,
      slot: this.slot,
      isEquipped: this.isEquipped,
      effects: this.effects
    };
    if (this.key) json.key = this.key;
    if (this.nameDe) json.nameDe = this.nameDe;
    if (this.charges) json.charges = this.charges;
    if (this.dailyUses) json.dailyUses = this.dailyUses;
    if (this.activation) json.activation = this.activation;
    if (this.setId) json.setId = this.setId;
    if (this.priceGp) json.priceGp = this.priceGp;
    if (this.weightLbs) json.weightLbs = this.weightLbs;
    if (this.description) json.description = this.description;
    if (this.aura) json.aura = this.aura;
    return json;
  }
}
