/**
 * @module    RulesItems
 * @summary   Rules engine for D&D 3.5e magic items & equipment (Armory 2.0). Calculates stacking, active vs overridden bonuses, and equipment buffs.
 * @exports   calculateEquippedItemEffects, getItemStackingBreakdown, getAvailableEquipmentBuffs
 */

/**
 * Calculates aggregated stat modifiers from all equipped items on a character applying D&D 3.5e stacking rules.
 * @param {Object} pc 
 * @returns {Object} { attributes, saves, ac, skills, speed, initiative }
 */
export function calculateEquippedItemEffects(pc) {
  const result = {
    attributes: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    saves: { fort: 0, ref: 0, wil: 0, all: 0 },
    ac: { deflection: 0, natural: 0, armor: 0, shield: 0, dodge: 0 },
    skills: {},
    speed: 0,
    initiative: 0
  };

  if (!pc || !Array.isArray(pc.items)) return result;

  const equippedItems = pc.items.filter(item => item && item.isEquipped);

  // Group bonuses by target category and type
  // Map key: `${category}:${target}:${bonusType}` -> number[]
  const bonusGroups = {};

  const addBonus = (category, target, bonusType, value) => {
    const key = `${category}:${target}:${bonusType || 'untyped'}`;
    if (!bonusGroups[key]) bonusGroups[key] = [];
    bonusGroups[key].push(value);
  };

  equippedItems.forEach(item => {
    const effects = Array.isArray(item.effects) ? item.effects : [];
    effects.forEach(eff => {
      const type = eff.type || 'attribute';
      const target = eff.target || 'str';
      const val = parseInt(eff.value) || 0;
      const bType = eff.bonusType || 'untyped';

      if (val === 0) return;

      if (type === 'attribute') {
        if (result.attributes[target] !== undefined) {
          addBonus('attribute', target, bType, val);
        }
      } else if (type === 'save') {
        addBonus('save', target, bType, val);
      } else if (type === 'ac') {
        addBonus('ac', target, bType, val);
      } else if (type === 'skill') {
        if (target === 'ini' || target === 'initiative') {
          addBonus('initiative', 'ini', bType, val);
        } else {
          addBonus('skill', target, bType, val);
        }
      } else if (type === 'speed') {
        addBonus('speed', 'speed', bType, val);
      }
    });
  });

  // Resolve stacking for each group
  Object.entries(bonusGroups).forEach(([key, values]) => {
    const [category, target, bType] = key.split(':');

    let resolvedValue = 0;
    if (bType === 'dodge' || bType === 'untyped') {
      // Dodge and untyped bonuses stack additively
      resolvedValue = values.reduce((sum, v) => sum + v, 0);
    } else {
      // Typed bonuses (enhancement, resistance, deflection, etc.): highest bonus applies, penalties stack
      const positives = values.filter(v => v > 0);
      const negatives = values.filter(v => v < 0);
      const maxPos = positives.length > 0 ? Math.max(...positives) : 0;
      const sumNeg = negatives.reduce((sum, v) => sum + v, 0);
      resolvedValue = maxPos + sumNeg;
    }

    // Apply to target bucket
    if (category === 'attribute' && result.attributes[target] !== undefined) {
      result.attributes[target] += resolvedValue;
    } else if (category === 'save' && result.saves[target] !== undefined) {
      result.saves[target] += resolvedValue;
    } else if (category === 'ac' && result.ac[target] !== undefined) {
      result.ac[target] += resolvedValue;
    } else if (category === 'skill') {
      result.skills[target] = (result.skills[target] || 0) + resolvedValue;
    } else if (category === 'speed') {
      result.speed += resolvedValue;
    } else if (category === 'initiative') {
      result.initiative += resolvedValue;
    }
  });

  return result;
}

/**
 * Generates a detailed stacking breakdown for all equipped items to identify overridden / suppressed bonuses.
 * @param {Object} pc 
 * @returns {Array<Object>} List of effect status entries
 */
export function getItemStackingBreakdown(pc) {
  if (!pc || !Array.isArray(pc.items)) return [];

  const equippedItems = pc.items.filter(item => item && item.isEquipped);
  const allEffects = [];

  equippedItems.forEach((item, itemIdx) => {
    const effects = Array.isArray(item.effects) ? item.effects : [];
    effects.forEach((eff, effIdx) => {
      const type = eff.type || 'attribute';
      const target = eff.target || 'str';
      const val = parseInt(eff.value) || 0;
      const bType = eff.bonusType || 'untyped';

      allEffects.push({
        itemIdx,
        effIdx,
        itemName: item.name || 'Item',
        type,
        target,
        value: val,
        bonusType: bType,
        groupKey: `${type}:${target}:${bType}`
      });
    });
  });

  // Find winners for each groupKey
  const groupMaxMap = {};
  allEffects.forEach(entry => {
    if (entry.bonusType !== 'dodge' && entry.bonusType !== 'untyped') {
      const curMax = groupMaxMap[entry.groupKey]?.value ?? -Infinity;
      if (entry.value > curMax) {
        groupMaxMap[entry.groupKey] = { value: entry.value, itemName: entry.itemName };
      }
    }
  });

  return allEffects.map(entry => {
    if (entry.bonusType === 'dodge' || entry.bonusType === 'untyped') {
      return { ...entry, isActive: true, overriddenBy: null };
    }
    const winner = groupMaxMap[entry.groupKey];
    if (winner && entry.value < winner.value) {
      return { ...entry, isActive: false, overriddenBy: winner.itemName };
    }
    return { ...entry, isActive: true, overriddenBy: null };
  });
}

/**
 * Returns all usable / activatable buffs provided by equipped items.
 * @param {Object} pc 
 * @returns {Array<Object>}
 */
export function getAvailableEquipmentBuffs(pc) {
  if (!pc || !Array.isArray(pc.items)) return [];

  const buffs = [];
  pc.items.forEach((item, itemIdx) => {
    if (!item.isEquipped || !item.activation || !item.activation.appliedBuffKey) return;

    let availableUses = Infinity;
    if (item.activation.costType === 'charges' && item.charges) {
      availableUses = Math.floor(item.charges.current / Math.max(1, item.activation.cost));
    } else if (item.activation.costType === 'daily' && item.dailyUses) {
      availableUses = Math.floor(item.dailyUses.current / Math.max(1, item.activation.cost));
    }

    buffs.push({
      itemIdx,
      itemId: item.id,
      itemName: item.name,
      buffKey: item.activation.appliedBuffKey,
      actionType: item.activation.actionType,
      costType: item.activation.costType,
      cost: item.activation.cost,
      availableUses,
      description: item.activation.effectDescription
    });
  });

  return buffs;
}
