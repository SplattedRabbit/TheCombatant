/**
 * D&D 3.5e Magic Item Model
 */
export class Item {
  constructor(data = {}) {
    this.id = data.id || 'item_' + Math.random().toString(36).substr(2, 9);
    this.name = data.name || 'Neuer Gegenstand';
    this.slot = data.slot || 'slotless'; // 'head', 'face', 'neck', 'shoulders', 'torso', 'wrists', 'hands', 'waist', 'feet', 'ring1', 'ring2', 'slotless'
    this.isEquipped = data.isEquipped !== undefined ? !!data.isEquipped : false;
    this.effectType = data.effectType || 'attribute'; // 'attribute', 'save', 'ac', 'speed'
    this.effectTarget = data.effectTarget || 'str'; // str/dex/con/int/wis/cha, fort/ref/wil/all, deflection/natural/armor
    this.effectValue = data.effectValue !== undefined ? parseInt(data.effectValue) || 0 : 0;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slot: this.slot,
      isEquipped: this.isEquipped,
      effectType: this.effectType,
      effectTarget: this.effectTarget,
      effectValue: this.effectValue
    };
  }
}
