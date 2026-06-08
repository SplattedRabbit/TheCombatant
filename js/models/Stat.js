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
    const grouped = {};
    this.modifiers.forEach(m => {
      const val = parseInt(m.value) || 0;
      if (m.type === 'dodge' || m.type === 'untyped') {
        grouped[m.type] = (grouped[m.type] || 0) + val;
      } else {
        grouped[m.type] = Math.max(grouped[m.type] || 0, val);
      }
    });
    const totalMod = Object.values(grouped).reduce((sum, val) => sum + val, 0);
    return this.base + totalMod;
  }

  getModifierSum() {
    return this.getValue() - this.base;
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
