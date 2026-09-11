import { resolveModifierStacking } from './helpers/modifiers/ModifierStacking.js';

/**
 * Encapsulates a D&D 3.5e base score and active modifier stacking resolution rules.
 */
export class Stat {
  constructor(baseOrObj = 10, modifiers = []) {
    if (typeof baseOrObj === 'object' && baseOrObj !== null) {
      this.base = baseOrObj.base !== undefined ? parseInt(baseOrObj.base) : 10;
      this.modifiers = Array.isArray(baseOrObj.modifiers) ? [...baseOrObj.modifiers] : [];
    } else {
      this.base = parseInt(baseOrObj) !== undefined ? parseInt(baseOrObj) : 10;
      this.modifiers = Array.isArray(modifiers) ? [...modifiers] : [];
    }
  }

  getValue() {
    const { total } = resolveModifierStacking(this.modifiers);
    return this.base + total;
  }

  getModifierSum() {
    return this.getValue() - this.base;
  }

  get mod() {
    return Math.floor((this.getValue() - 10) / 2);
  }

  getMod() {
    return this.mod;
  }

  addModifier(value, type, source) {
    this.removeModifiersFromSource(source);
    this.modifiers.push({ value: parseInt(value) || 0, type, source });
  }

  removeModifiersFromSource(source) {
    this.modifiers = this.modifiers.filter(m => m.source !== source);
  }

  valueOf() {
    return this.getValue();
  }

  toString() {
    return String(this.getValue());
  }

  toJSON() {
    return {
      base: this.base,
      modifiers: this.modifiers
    };
  }
}
