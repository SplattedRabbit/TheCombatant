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

    let source = data.dmStash && typeof data.dmStash === 'object' ? data.dmStash : data;
    let packageName = String(data.packageName || data.name || '').trim();

    // Auto-adapt package if provided in character format: { characters: [ { character, items: [...] } ] }
    if ((!source.weapons && !source.armors && !source.items) && Array.isArray(data.characters) && data.characters.length > 0) {
      const activePc = getActivePC();
      const pcName = activePc?.name?.toLowerCase().trim() || '';
      let charObj = data.characters.find(c => {
        const cName = (c.character || c.name || '').toLowerCase().trim();
        return pcName && (cName.includes(pcName) || pcName.includes(cName));
      });
      if (!charObj) charObj = data.characters[0];
      packageName = charObj.character || charObj.name || packageName || 'Character Loadout';

      const convertedWeapons = [];
      const convertedArmors = [];
      const convertedItems = [];

      (charObj.items || []).forEach(it => {
        const cat = (it.category || '').toLowerCase();
        const slot = (it.slot || '').toLowerCase();
        const enhMatch = String(it.enhancement || '').match(/\+?(\d+)/);
        const enhVal = enhMatch ? parseInt(enhMatch[1], 10) : 0;

        if (cat.includes('waffe') || cat.includes('weapon') || slot.includes('haupthand') || slot.includes('nebenhand')) {
          let wType = (it.type || it.name || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
          if (wType.includes('warhammer')) wType = 'warhammer';
          else if (wType.includes('rapier')) wType = 'rapier';
          else if (wType.includes('sickle') || wType.includes('sichel')) wType = 'sickle';
          else if (wType.includes('crossbow') || wType.includes('armbrust')) wType = 'light_crossbow';
          else if (wType.includes('longsword')) wType = 'longsword';
          else if (wType.includes('shortsword')) wType = 'shortsword';
          else if (wType.includes('greatsword')) wType = 'greatsword';
          else if (wType.includes('dagger') || wType.includes('dolch')) wType = 'dagger';

          convertedWeapons.push({
            name: it.name,
            type: wType,
            enhancement: enhVal,
            grip: (slot.includes('beidhändig') || slot.includes('2h')) ? '2h' : '1h',
            hand: slot.includes('nebenhand') ? 'off' : 'main',
            isEquipped: true,
            description: it.effect || ''
          });
        } else if (cat.includes('rüstung') || cat.includes('armor') || cat.includes('schild') || cat.includes('shield') || slot.includes('schild')) {
          let aType = (it.type || it.name || '').toLowerCase();
          let matchedType = 'chain_shirt';
          if (aType.includes('full plate') || aType.includes('vollplatte')) matchedType = 'full_plate';
          else if (aType.includes('breastplate') || aType.includes('brustpanzer')) matchedType = 'breastplate';
          else if (aType.includes('mithral shirt') || aType.includes('chain shirt') || aType.includes('kettenhemd')) matchedType = 'chain_shirt';
          else if (aType.includes('leather') || aType.includes('leder')) matchedType = 'leather';
          else if (aType.includes('heavy steel shield') || aType.includes('stahlschild')) matchedType = 'shield_heavy_steel';
          else if (aType.includes('light steel shield')) matchedType = 'shield_light_steel';
          else if (aType.includes('buckler')) matchedType = 'shield_buckler';
          else if (aType.includes('tower shield')) matchedType = 'shield_tower';

          const isShield = cat.includes('schild') || cat.includes('shield') || slot.includes('schild') || aType.includes('shield') || aType.includes('schild');
          const isAnim = String(it.enhancement || it.name || it.effect || '').toLowerCase().includes('animated') || String(it.enhancement || it.name || it.effect || '').toLowerCase().includes('schwebend');

          convertedArmors.push({
            name: it.name,
            type: matchedType,
            enhancement: enhVal,
            isShield,
            isAnimated: isAnim,
            isEquipped: true
          });
        } else {
          // Wondrous / Consumable Item
          let mappedSlot = 'slotless';
          if (slot.includes('körper') || slot.includes('body')) mappedSlot = 'body';
          else if (slot.includes('torso')) mappedSlot = 'torso';
          else if (slot.includes('gürtel') || slot.includes('waist') || slot.includes('taille')) mappedSlot = 'waist';
          else if (slot.includes('schulter') || slot.includes('umhang') || slot.includes('shoulders')) mappedSlot = 'shoulders';
          else if (slot.includes('finger') || slot.includes('ring')) mappedSlot = 'ring';
          else if (slot.includes('fuß') || slot.includes('füße') || slot.includes('feet')) mappedSlot = 'feet';
          else if (slot.includes('kopf') || slot.includes('stirn') || slot.includes('head')) mappedSlot = 'head';
          else if (slot.includes('auge') || slot.includes('brille') || slot.includes('face') || slot.includes('eyes')) mappedSlot = 'face';
          else if (slot.includes('hals') || slot.includes('throat') || slot.includes('neck')) mappedSlot = 'throat';
          else if (slot.includes('arm') || slot.includes('handgelenk') || slot.includes('arms')) mappedSlot = 'arms';
          else if (slot.includes('hand') || slot.includes('hände') || slot.includes('hands')) mappedSlot = 'hands';

          const isConsumable = cat.includes('trank') || cat.includes('potion') || cat.includes('scroll') || cat.includes('wand') || slot.includes('gürteltasche');
          const chargeMatch = String(it.enhancement || '').match(/(\d+)\s*Ladung/i);
          const maxCharges = chargeMatch ? parseInt(chargeMatch[1], 10) : undefined;

          // Parse potential stat effects from effect description
          const effects = [];
          const strMatch = String(it.effect || '').match(/\+(\d+)\s*(?:Verbesserungsbonus auf\s*)?Stärke/i);
          if (strMatch) effects.push({ target: 'str', value: parseInt(strMatch[1], 10), type: 'enhancement' });
          const dexMatch = String(it.effect || '').match(/\+(\d+)\s*(?:Verbesserungsbonus auf\s*)?Geschicklichkeit/i);
          if (dexMatch) effects.push({ target: 'dex', value: parseInt(dexMatch[1], 10), type: 'enhancement' });
          const conMatch = String(it.effect || '').match(/\+(\d+)\s*(?:Verbesserungsbonus auf\s*)?Konstitution/i);
          if (conMatch) effects.push({ target: 'con', value: parseInt(conMatch[1], 10), type: 'enhancement' });
          const intMatch = String(it.effect || '').match(/\+(\d+)\s*(?:Verbesserungsbonus auf\s*)?Intelligenz/i);
          if (intMatch) effects.push({ target: 'int', value: parseInt(intMatch[1], 10), type: 'enhancement' });
          const wisMatch = String(it.effect || '').match(/\+(\d+)\s*(?:Verbesserungsbonus auf\s*)?Weisheit/i);
          if (wisMatch) effects.push({ target: 'wis', value: parseInt(wisMatch[1], 10), type: 'enhancement' });
          const chaMatch = String(it.effect || '').match(/\+(\d+)\s*(?:Verbesserungsbonus auf\s*)?Charisma/i);
          if (chaMatch) effects.push({ target: 'cha', value: parseInt(chaMatch[1], 10), type: 'enhancement' });
          const saveMatch = String(it.effect || '').match(/\+(\d+)\s*Widerstandsbonus auf alle Rettungswürfe/i);
          if (saveMatch) effects.push({ target: 'all', value: parseInt(saveMatch[1], 10), type: 'resistance' });
          const deflMatch = String(it.effect || '').match(/\+(\d+)\s*Ablenkungsbonus auf (?:die )?Rüstungsklasse/i);
          if (deflMatch) effects.push({ target: 'deflection', value: parseInt(deflMatch[1], 10), type: 'deflection' });
          const natMatch = String(it.effect || '').match(/\+(\d+)\s*Verbesserungsbonus auf bestehende natürliche Rüstung/i);
          if (natMatch) effects.push({ target: 'natural', value: parseInt(natMatch[1], 10), type: 'natural' });

          const quantity = it.quantity || 1;
          for (let q = 0; q < quantity; q++) {
            convertedItems.push({
              name: it.name,
              slot: isConsumable ? 'slotless' : mappedSlot,
              category: isConsumable ? 'potion' : (it.category || 'Wondrous'),
              isEquipped: !isConsumable && mappedSlot !== 'slotless',
              effects,
              charges: maxCharges ? { current: maxCharges, max: maxCharges } : undefined,
              description: it.effect || ''
            });
          }
        }
      });

      source = {
        weapons: convertedWeapons,
        armors: convertedArmors,
        items: convertedItems
      };
    }

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
    packageName = packageName || String(data.packageName || data.name || 'Equipment Package').trim();
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
