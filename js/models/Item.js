/**
 * @module    Item
 * @summary   Modell für magische Gegenstände. Speichert mehrere Effekte im effects[]-Array.
 * @exports   Item (class)
 * @reads     item.slot, item.effects[], item.isEquipped
 * @stateOps  Keine — Mutation via PCManager (addPCItem, togglePCItemEquip, addPCItemEffect, ...)
 * @depends   Keine externen Imports
 * @notHere   UI → PCMagicItemsTab.js | Slot-Kollisionsprüfung → PCManager.js
 */
export class Item {
  constructor(data = {}) {
    this.id = data.id || 'item_' + Math.random().toString(36).substr(2, 9);
    this.name = data.name || 'Neuer Gegenstand';
    this.slot = data.slot || 'slotless'; // 'head', 'face', 'neck', 'shoulders', 'torso', 'wrists', 'hands', 'waist', 'feet', 'ring1', 'ring2', 'slotless'
    this.isEquipped = data.isEquipped !== undefined ? !!data.isEquipped : false;

    // Support multiple effects
    this.effects = Array.isArray(data.effects) ? data.effects.map(e => ({
      type: e.type || 'attribute',
      target: e.target || 'str',
      value: e.value !== undefined ? parseInt(e.value) || 0 : 0
    })) : [];

    // Fallback for single effect (backward compatibility)
    if (this.effects.length === 0) {
      const effectType = data.effectType || 'attribute';
      const effectTarget = data.effectTarget || 'str';
      const effectValue = data.effectValue !== undefined ? parseInt(data.effectValue) || 0 : 0;
      this.effects.push({
        type: effectType,
        target: effectTarget,
        value: effectValue
      });
    }
  }

  get effectType() {
    return this.effects[0] ? this.effects[0].type : undefined;
  }

  set effectType(val) {
    if (!this.effects[0]) {
      this.effects[0] = { type: 'attribute', target: 'str', value: 0 };
    }
    this.effects[0].type = val;
  }

  get effectTarget() {
    return this.effects[0] ? this.effects[0].target : undefined;
  }

  set effectTarget(val) {
    if (!this.effects[0]) {
      this.effects[0] = { type: 'attribute', target: 'str', value: 0 };
    }
    this.effects[0].target = val;
  }

  get effectValue() {
    return this.effects[0] ? this.effects[0].value : undefined;
  }

  set effectValue(val) {
    if (!this.effects[0]) {
      this.effects[0] = { type: 'attribute', target: 'str', value: 0 };
    }
    this.effects[0].value = parseInt(val) || 0;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slot: this.slot,
      isEquipped: this.isEquipped,
      effects: this.effects
    };
  }
}
