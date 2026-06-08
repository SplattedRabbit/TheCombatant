/**
 * Base class for polymorphic class-specific feature UI components in the PC sheet.
 */
export class ClassFeatureComponent {
  constructor(classKey, nameDe, nameEn) {
    this.classKey = classKey;
    this.nameDe = nameDe;
    this.nameEn = nameEn;
  }

  /**
   * Checks if this class feature component is active on the PC.
   * @param {Object} pc - The player character
   * @returns {boolean}
   */
  isEligible(pc) {
    if (this.classKey === 'general') return true;
    if (!Array.isArray(pc.classes)) return false;
    return pc.classes.some(c => c.classType === this.classKey);
  }

  /**
   * Renders the class feature panel content as HTML.
   * @param {Object} pc - The player character
   * @param {number} level - The level in this class
   * @returns {string} HTML string
   */
  render(pc, level) {
    throw new Error(`render() must be implemented for ${this.classKey}`);
  }

  /**
   * Binds UI events to the rendered container.
   * @param {Object} pc - The player character
   * @param {number} level - The level in this class
   * @param {HTMLElement} container - The DOM element containing this feature's rendered UI
   * @param {Function} triggerRender - Function to trigger a complete sheet re-render
   */
  bindEvents(pc, level, container, triggerRender) {
    // Optional override
  }

  /**
   * Hook called when a "New Day" is triggered to reset class-specific uses.
   * @param {Object} pc - The player character
   * @param {number} level - The level in this class
   */
  onNewDay(pc, level) {
    // Optional override
  }
}
