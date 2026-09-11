/**
 * @module ModifierStacking
 * @summary Canonical D&D 3.5e modifier stacking logic.
 * @exports resolveModifierStacking
 */

export const DEFAULT_TYPE_LABELS = {
  morale: 'Morale',
  luck: 'Luck',
  dodge: 'Dodge',
  enhancement: 'Enhancement',
  insight: 'Insight',
  sacred: 'Sacred',
  profane: 'Profane',
  untyped: 'Untyped',
  resistance: 'Resistance',
  deflection: 'Deflection',
  natural: 'Natural Armor',
  armor: 'Armor',
  shield: 'Shield',
  size: 'Size',
  competence: 'Competence',
  alchemical: 'Alchemical',
  circumstance: 'Circumstance'
};

function defaultFormatType(type) {
  if (!type) return 'Untyped';
  return DEFAULT_TYPE_LABELS[type.toLowerCase()] || (type.charAt(0).toUpperCase() + type.slice(1));
}

/**
 * Resolves D&D 3.5e modifier stacking according to RAW:
 * - Negative values (penalties) always stack additively.
 * - Dodge and untyped bonuses stack additively.
 * - For all other bonus types, only the highest bonus of each type applies.
 *
 * @param {Array<Object>} modifiers - Array of { value, type, source }
 * @param {Object} [options]
 * @param {Function} [options.getTypeLabel] - Optional custom formatter for type labels in breakdown
 * @returns {{ total: number, bonusSum: number, penaltiesSum: number, breakdown: Array<{ label: string, value: number, type?: string, source?: string }> }}
 */
export function resolveModifierStacking(modifiers, options = {}) {
  if (!Array.isArray(modifiers) || modifiers.length === 0) {
    return { total: 0, bonusSum: 0, penaltiesSum: 0, breakdown: [] };
  }

  const getTypeLabel = typeof options.getTypeLabel === 'function' ? options.getTypeLabel : defaultFormatType;

  const groupedBoni = {};
  let penaltiesSum = 0;
  const penalties = [];

  modifiers.forEach(m => {
    if (!m) return;
    const val = parseInt(m.value) || 0;
    const rawType = m.type || 'untyped';
    const type = rawType.toLowerCase();
    const source = m.source || 'Bonus';
    
    if (val < 0) {
      penaltiesSum += val;
      penalties.push({
        label: `${source} (${getTypeLabel(rawType)})`,
        value: val,
        type: rawType,
        source
      });
    } else if (type === 'dodge' || type === 'untyped') {
      const key = `${type}_${source}`;
      groupedBoni[key] = {
        value: (groupedBoni[key]?.value || 0) + val,
        type: rawType,
        source,
        label: `${source} (${getTypeLabel(rawType)})`
      };
    } else {
      const existing = groupedBoni[type];
      if (!existing || val > existing.value) {
        groupedBoni[type] = {
          value: val,
          type: rawType,
          source,
          label: `${source} (${getTypeLabel(rawType)})`
        };
      }
    }
  });

  let bonusSum = 0;
  const breakdown = [];

  Object.values(groupedBoni).forEach(b => {
    bonusSum += b.value;
    breakdown.push({
      label: b.label,
      value: b.value,
      type: b.type,
      source: b.source
    });
  });

  penalties.forEach(p => {
    breakdown.push(p);
  });

  return {
    total: bonusSum + penaltiesSum,
    bonusSum,
    penaltiesSum,
    breakdown
  };
}
