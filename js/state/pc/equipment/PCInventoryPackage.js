/**
 * @module    PCInventoryPackage
 * @summary   Import and export of D&D 3.5e Inventory & Loadout Packages (.json) for Player Characters.
 *            Supports presetKey hydration, merge/replace modes, D&D 3.5e RAW slot auto-equipping, and batch stat recalculation.
 * @exports   parseInventoryPackage, importPCInventoryPackage, exportPCInventoryPackage
 */

import { getActivePC, StateEvents } from '../../state-core.js';
import { saveToStorage } from '../../StorageManager.js';
import { recalculatePCStats, syncPCToHost } from '../PCGeneral.js';
import { Weapon, Armor, isShieldItem, isAnimatedShield, Item } from '../../../models/model-core.js';
import { WeaponRegistry } from '../../../models/Weapon.js';
import { ARMOR_REGISTRY } from '../../../data/armor-data.js';
import { MAGIC_ITEMS_REGISTRY } from '../../../data/magicItems-data.js';

const ARMOR_KEY_ALIASES = {
  heavy_steel_shield: 'shield_heavy_steel',
  light_steel_shield: 'shield_light_steel',
  heavy_wooden_shield: 'shield_heavy_wooden',
  light_wooden_shield: 'shield_light_wooden',
  tower_shield: 'shield_tower'
};

function genId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function isTwoHandedRangedWeapon(w) {
  const def = WeaponRegistry[w.type] || WeaponRegistry[w.presetKey] || {};
  return Boolean(
    w.grip === 'rng' && (
      def.isBow ||
      def.isComposite ||
      w.type === 'light_crossbow' ||
      w.type === 'heavy_crossbow' ||
      w.type === 'other_ranged'
    )
  );
}

function isConsumableItem(item) {
  if (!item) return false;
  const name = String(item.name || '').toLowerCase();
  const key = String(item.presetKey || item.key || '').toLowerCase();
  const cat = String(item.category || item.type || '').toLowerCase();

  if (cat === 'potion' || cat === 'scroll' || cat === 'wand' || cat === 'consumable' || cat === 'alchemical') return true;
  if (key.startsWith('potion_') || key.startsWith('scroll_') || key.startsWith('wand_')) return true;
  if (name.includes('potion') || name.includes('scroll') || name.includes('wand') || name.includes('trank') || name.includes('schriftrolle')) return true;

  const hasPassiveEffects = Array.isArray(item.effects) && item.effects.some(e => (parseInt(e.value) || 0) !== 0);
  if (!hasPassiveEffects && (item.slot === 'none' || item.slot === 'slotless' || !item.slot)) {
    if (item.healingFormula || item.damageFormula || item.activation?.appliedBuffKey || item.charges?.max === 1) {
      return true;
    }
  }
  return false;
}

export function resolveWeaponEntry(entry) {
  if (!entry) return null;
  const isString = typeof entry === 'string';
  const raw = isString ? { presetKey: entry, type: entry } : { ...entry };
  const key = raw.type || raw.presetKey;
  const preset = key && WeaponRegistry[key] ? WeaponRegistry[key] : null;
  const enhancement = raw.enhancement !== undefined ? raw.enhancement : (raw.magicBonus !== undefined ? raw.magicBonus : 0);

  const merged = preset
    ? {
        type: key,
        presetKey: key,
        name: preset.nameEn || preset.name,
        ...raw,
        enhancement
      }
    : { ...raw, enhancement };

  merged.id = genId('wpn');
  const wpn = new Weapon(merged);
  wpn.presetKey = key || raw.presetKey || '';
  wpn.magicBonus = wpn.enhancement;
  return wpn;
}

export function resolveArmorEntry(entry) {
  if (!entry) return null;
  const isString = typeof entry === 'string';
  const raw = isString ? { presetKey: entry, type: entry } : { ...entry };
  const rawKey = raw.type || raw.presetKey || raw.key;
  const key = ARMOR_KEY_ALIASES[rawKey] || rawKey;
  const preset = key && ARMOR_REGISTRY[key] ? ARMOR_REGISTRY[key] : null;
  const enhancement = raw.enhancement !== undefined ? raw.enhancement : (raw.magicBonus !== undefined ? raw.magicBonus : 0);

  const merged = preset
    ? {
        type: preset.key || key,
        presetKey: preset.key || key,
        name: preset.nameEn || preset.name,
        isShield: Boolean(preset.isShield),
        ...raw,
        enhancement
      }
    : { ...raw, enhancement };

  merged.type = preset ? (preset.key || key) : (raw.type || key || 'padded');
  merged.id = genId('arm');
  const arm = new Armor(merged);
  arm.presetKey = merged.type;
  arm.magicBonus = arm.enhancement;
  return arm;
}

export function resolveItemEntry(entry) {
  if (!entry) return null;
  const isString = typeof entry === 'string';
  const raw = isString ? { presetKey: entry } : { ...entry };
  const key = raw.presetKey || raw.key;
  const preset = key && MAGIC_ITEMS_REGISTRY[key] ? MAGIC_ITEMS_REGISTRY[key] : null;

  const merged = preset
    ? {
        ...JSON.parse(JSON.stringify(preset)),
        presetKey: preset.key || key,
        name: preset.nameEn || preset.name,
        slot: preset.slot || 'slotless',
        ...raw
      }
    : raw;

  merged.id = genId('item');
  const item = new Item(merged);
  if (key) item.presetKey = key;
  if (merged.category) item.category = merged.category;
  return item;
}

/**
 * Parses and validates a raw JSON string or object into a structured D&D 3.5e Inventory Package.
 */
export function parseInventoryPackage(rawInput) {
  try {
    const data = typeof rawInput === 'string' ? JSON.parse(rawInput) : rawInput;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { isValid: false, error: 'Invalid package structure: root must be a JSON object.' };
    }

    const source = data.dmStash && typeof data.dmStash === 'object' ? data.dmStash : data;
    const rawWeapons = Array.isArray(source.weapons) ? source.weapons : null;
    const rawArmors = Array.isArray(source.armors) ? source.armors : null;
    const rawItems = Array.isArray(source.items) ? source.items : null;

    if (!rawWeapons && !rawArmors && !rawItems) {
      return {
        isValid: false,
        error: 'Package does not contain any valid equipment arrays (weapons, armors, or items).'
      };
    }

    const weapons = (rawWeapons || []).map(w => {
      const explicitEquip = typeof w === 'object' && w !== null && 'isEquipped' in w ? Boolean(w.isEquipped) : null;
      const model = resolveWeaponEntry(w);
      if (model) model._explicitEquip = explicitEquip;
      return model;
    }).filter(Boolean);

    const armors = (rawArmors || []).map(a => {
      const explicitEquip = typeof a === 'object' && a !== null && 'isEquipped' in a ? Boolean(a.isEquipped) : null;
      const model = resolveArmorEntry(a);
      if (model) model._explicitEquip = explicitEquip;
      return model;
    }).filter(Boolean);

    const items = (rawItems || []).map(i => {
      const explicitEquip = typeof i === 'object' && i !== null && 'isEquipped' in i ? Boolean(i.isEquipped) : null;
      const model = resolveItemEntry(i);
      if (model) model._explicitEquip = explicitEquip;
      return model;
    }).filter(Boolean);

    const totalCount = weapons.length + armors.length + items.length;
    const packageName = String(data.packageName || data.name || 'Equipment Package').trim();
    const description = String(data.description || '').trim();
    const autoEquip = data.autoEquip !== undefined ? Boolean(data.autoEquip) : true;

    return {
      isValid: true,
      format: 'dnd35e-inventory-package',
      version: data.version || 1,
      packageName,
      description,
      autoEquip,
      weapons,
      armors,
      items,
      totalCount,
      error: null
    };
  } catch (err) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : 'Failed to parse JSON package.'
    };
  }
}

/**
 * Applies D&D 3.5e RAW slot equip rules for an armor/shield on a PC object without intermediate I/O.
 */
function equipArmorRAW(pc, targetArmor) {
  const isTargetShield = isShieldItem(targetArmor);
  pc.armors.forEach(a => {
    if (a.id === targetArmor.id) {
      a.isEquipped = true;
    } else if (isShieldItem(a) === isTargetShield) {
      a.isEquipped = false;
    }
  });

  if (isTargetShield && !isAnimatedShield(targetArmor) && Array.isArray(pc.weapons)) {
    pc.weapons.forEach(w => {
      if (!w.isEquipped) return;
      if (w.grip === '2h' || w.isDoubleWielded || w.hand === 'off' || isTwoHandedRangedWeapon(w)) {
        w.isEquipped = false;
      }
    });
  }
}

/**
 * Applies D&D 3.5e RAW slot equip rules for a weapon on a PC object without intermediate I/O.
 */
function equipWeaponRAW(pc, targetWeapon) {
  const isTwoHanded =
    targetWeapon.grip === '2h' ||
    Boolean(targetWeapon.isDoubleWielded) ||
    isTwoHandedRangedWeapon(targetWeapon);

  if (isTwoHanded) {
    targetWeapon.hand = 'main';
    pc.weapons.forEach(w => {
      w.isEquipped = w.id === targetWeapon.id;
    });
    if (Array.isArray(pc.armors)) {
      pc.armors.forEach(a => {
        if (isShieldItem(a) && !isAnimatedShield(a)) a.isEquipped = false;
      });
    }
  } else {
    const desiredHand = targetWeapon.hand === 'off' ? 'off' : 'main';
    targetWeapon.hand = desiredHand;
    pc.weapons.forEach(w => {
      if (w.id === targetWeapon.id) {
        w.isEquipped = true;
      } else if (w.isEquipped) {
        const otherTwoHanded = w.grip === '2h' || Boolean(w.isDoubleWielded) || isTwoHandedRangedWeapon(w);
        const otherHand = w.hand || 'main';
        if (otherTwoHanded || otherHand === desiredHand) {
          w.isEquipped = false;
        }
      }
    });
    if (desiredHand === 'off' && Array.isArray(pc.armors)) {
      pc.armors.forEach(a => {
        if (isShieldItem(a) && !isAnimatedShield(a)) a.isEquipped = false;
      });
    }
  }
}

/**
 * Applies D&D 3.5e RAW slot equip rules for a magic/wondrous item on a PC object without intermediate I/O.
 */
function equipItemRAW(pc, targetItem) {
  if (isConsumableItem(targetItem)) {
    targetItem.isEquipped = false;
    return false;
  }

  const slot = targetItem.slot || 'slotless';
  if (slot === 'none' || slot === 'slotless') {
    targetItem.isEquipped = true;
    return true;
  }

  if (slot === 'ring' || slot === 'ring1' || slot === 'ring2') {
    const ring1Taken = pc.items.some(i => i.id !== targetItem.id && i.isEquipped && i.slot === 'ring1');
    const ring2Taken = pc.items.some(i => i.id !== targetItem.id && i.isEquipped && i.slot === 'ring2');

    if (slot === 'ring2' && !ring2Taken) {
      targetItem.slot = 'ring2';
    } else if (!ring1Taken) {
      targetItem.slot = 'ring1';
    } else if (!ring2Taken) {
      targetItem.slot = 'ring2';
    } else {
      pc.items.forEach(i => {
        if (i.id !== targetItem.id && i.isEquipped && i.slot === 'ring1') {
          i.isEquipped = false;
        }
      });
      targetItem.slot = 'ring1';
    }
    targetItem.isEquipped = true;
    return true;
  }

  pc.items.forEach(i => {
    if (i.id !== targetItem.id && i.isEquipped && i.slot === slot) {
      i.isEquipped = false;
    }
  });
  targetItem.isEquipped = true;
  return true;
}

/**
 * Imports a parsed or raw inventory package into the active Player Character in a single atomic batch.
 * @param {string|object} rawPackage - Raw JSON string or object
 * @param {object} [options] - { mode: 'merge' | 'replace', autoEquip?: boolean }
 */
export function importPCInventoryPackage(rawPackage, options = {}) {
  const pc = getActivePC();
  if (!pc) {
    return { success: false, error: 'No active player character selected.' };
  }

  const parsed = parseInventoryPackage(rawPackage);
  if (!parsed.isValid) {
    return { success: false, error: parsed.error };
  }

  const mode = options.mode === 'replace' ? 'replace' : 'merge';
  const shouldAutoEquip = options.autoEquip !== undefined ? Boolean(options.autoEquip) : parsed.autoEquip;

  if (mode === 'replace') {
    pc.weapons = [];
    pc.armors = [];
    pc.items = [];
  } else {
    if (!Array.isArray(pc.weapons)) pc.weapons = [];
    if (!Array.isArray(pc.armors)) pc.armors = [];
    if (!Array.isArray(pc.items)) pc.items = [];
  }

  let equippedCount = 0;

  // 1. Add and optionally equip Armors & Shields first
  parsed.armors.forEach(armor => {
    const wantEquip = shouldAutoEquip && armor._explicitEquip !== false;
    delete armor._explicitEquip;
    armor.isEquipped = false;
    pc.armors.push(armor);
    if (wantEquip) {
      pc.autoAC = true;
      equipArmorRAW(pc, armor);
    }
  });

  // 2. Add and optionally equip Weapons (2H weapons may unequip shields per D&D 3.5e RAW)
  parsed.weapons.forEach(weapon => {
    const wantEquip = shouldAutoEquip && weapon._explicitEquip !== false;
    delete weapon._explicitEquip;
    weapon.isEquipped = false;
    pc.weapons.push(weapon);
    if (wantEquip) {
      equipWeaponRAW(pc, weapon);
    }
  });

  // 3. Add and optionally equip Wondrous Items & Consumables
  parsed.items.forEach(item => {
    const wantEquip = shouldAutoEquip && item._explicitEquip !== false;
    delete item._explicitEquip;
    item.isEquipped = false;
    pc.items.push(item);
    if (wantEquip) {
      equipItemRAW(pc, item);
    }
  });

  equippedCount =
    pc.weapons.filter(w => w.isEquipped).length +
    pc.armors.filter(a => a.isEquipped).length +
    pc.items.filter(i => i.isEquipped).length;

  recalculatePCStats(pc);
  saveToStorage();
  syncPCToHost();
  StateEvents.emit('pc_changed', pc);

  return {
    success: true,
    packageName: parsed.packageName,
    addedWeapons: parsed.weapons.length,
    addedArmors: parsed.armors.length,
    addedItems: parsed.items.length,
    totalAdded: parsed.totalCount,
    equippedCount
  };
}

/**
 * Exports the active Player Character's inventory as a serializable dnd35e-inventory-package object.
 */
export function exportPCInventoryPackage(meta = {}) {
  const pc = getActivePC();
  if (!pc) return null;

  const cleanClone = obj => {
    const copy = JSON.parse(JSON.stringify(obj));
    delete copy._explicitEquip;
    return copy;
  };

  return {
    format: 'dnd35e-inventory-package',
    version: 1,
    packageName: meta.packageName || `${pc.name || 'Character'} Gear Loadout`,
    description: meta.description || `Exported equipment from ${pc.name || 'Player Character'}`,
    autoEquip: meta.autoEquip !== undefined ? Boolean(meta.autoEquip) : true,
    weapons: (pc.weapons || []).map(cleanClone),
    armors: (pc.armors || []).map(cleanClone),
    items: (pc.items || []).map(cleanClone)
  };
}
