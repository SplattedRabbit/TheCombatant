/**
 * @module    PCEquipment
 * @summary   State mutations for Player Character equipment (weapons, armor, items).
 * @exports   updatePCWeapon, addPCWeapon, deletePCWeapon, togglePCWeaponEquip, addPCArmor, removePCArmor, togglePCArmorEquip, updatePCArmorField, setPCAutoAC, addPCItem, deletePCItem, updatePCItem, togglePCItemEquip, addPCItemEffect, deletePCItemEffect, updatePCItemEffect, equipPCItem, unequipPCItem, swapPCItem, usePCItemCharge, addPCItemFromCompendium
 */

import { getActivePC } from '../state-core.js';
import { saveToStorage } from '../StorageManager.js';
import { recalculatePCStats, syncPCToHost } from './PCGeneral.js';
import { Weapon, Armor, Item } from '../../models/model-core.js';
import { WeaponRegistry } from '../../models/Weapon.js';
import { MAGIC_ITEMS_REGISTRY } from '../../data/magicItems-data.js';

export function updatePCWeapon(idx, key, val) {
  const pc = getActivePC();
  if (pc && pc.weapons && pc.weapons[idx]) {
    pc.weapons[idx][key] = val;
    if (key === 'hand' || key === 'isDoubleWielded') {
      recalculatePCStats(pc);
    }
    saveToStorage();
    syncPCToHost();
  }
}

export function addPCWeapon() {
  const pc = getActivePC();
  if (pc) {
    if (!Array.isArray(pc.weapons)) {
      pc.weapons = [];
    }
    pc.weapons.push(new Weapon({
      name: 'Neue Waffe',
      type: 'longsword',
      enhancement: 0,
      attackBonus: '',
      isKeen: false,
      extraDamage: '',
      strengthRating: 0
    }));
    saveToStorage();
    syncPCToHost();
  }
}

export function deletePCWeapon(idx) {
  const pc = getActivePC();
  if (pc && Array.isArray(pc.weapons) && pc.weapons[idx]) {
    pc.weapons.splice(idx, 1);
    saveToStorage();
    syncPCToHost();
  }
}

export function togglePCWeaponEquip(idx) {
  const pc = getActivePC();
  if (pc && Array.isArray(pc.weapons) && pc.weapons[idx]) {
    const target = pc.weapons[idx];
    const newEquipped = !target.isEquipped;

    if (newEquipped) {
      if (target.isDoubleWielded) {
        // Enforce hand = 'main'
        target.hand = 'main';
        // Unequip all other weapons
        pc.weapons.forEach((w, wIdx) => {
          if (wIdx !== idx) w.isEquipped = false;
        });
        // Unequip shields
        if (Array.isArray(pc.armors)) {
          pc.armors.forEach(a => {
            if (a.isShield) a.isEquipped = false;
          });
        }
        const grip = target.grip;
        const def = WeaponRegistry[target.type] || {};
        const isTwoHandedRanged = grip === 'rng' && (def.isBow || def.isComposite || target.type === 'light_crossbow' || target.type === 'heavy_crossbow' || target.type === 'other_ranged');
        if (grip === '2h' || isTwoHandedRanged) {
          // Enforce hand = 'main' and isDoubleWielded = false
          target.hand = 'main';
          target.isDoubleWielded = false;
          // Unequip all other weapons
          pc.weapons.forEach((w, wIdx) => {
            if (wIdx !== idx) w.isEquipped = false;
          });
          // Unequip shields
          if (Array.isArray(pc.armors)) {
            pc.armors.forEach(a => {
              if (a.isShield) a.isEquipped = false;
            });
          }
        } else {
          // 1-handed or light weapon, or 1-handed ranged/thrown weapon
          // Unequip any equipped two-handed weapons, two-handed ranged weapons, or double wielded weapons
          pc.weapons.forEach(w => {
            const wDef = WeaponRegistry[w.type] || {};
            const wIsTwoHandedRanged = w.grip === 'rng' && (wDef.isBow || wDef.isComposite || w.type === 'light_crossbow' || w.type === 'heavy_crossbow' || w.type === 'other_ranged');
            if (w.grip === '2h' || wIsTwoHandedRanged || w.isDoubleWielded) {
              w.isEquipped = false;
            }
          });
          
          if (target.hand === 'main') {
            // Unequip other main-hand weapons
            pc.weapons.forEach((w, wIdx) => {
              if (wIdx !== idx && w.hand === 'main') {
                w.isEquipped = false;
              }
            });
          } else if (target.hand === 'off') {
            // Unequip other off-hand weapons
            pc.weapons.forEach((w, wIdx) => {
              if (wIdx !== idx && w.hand === 'off') {
                w.isEquipped = false;
              }
            });
            // Unequip shields
            if (Array.isArray(pc.armors)) {
              pc.armors.forEach(a => {
                if (a.isShield) a.isEquipped = false;
              });
            }
          }
        }
      }
      target.isEquipped = true;
    } else {
      target.isEquipped = false;
    }

    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}

export function addPCArmor(type = 'padded') {
  const pc = getActivePC();
  if (pc) {
    if (!Array.isArray(pc.armors)) {
      pc.armors = [];
    }
    pc.armors.push(new Armor({
      name: '',
      type: type,
      enhancement: 0,
      isEquipped: false
    }));
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}

export function removePCArmor(idx) {
  const pc = getActivePC();
  if (pc && Array.isArray(pc.armors) && pc.armors[idx]) {
    pc.armors.splice(idx, 1);
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}

export function togglePCArmorEquip(idx) {
  const pc = getActivePC();
  if (pc && Array.isArray(pc.armors) && pc.armors[idx]) {
    const target = pc.armors[idx];
    const newEquippedState = !target.isEquipped;
    
    if (newEquippedState) {
      pc.armors.forEach(a => {
        if (a.isShield === target.isShield) {
          a.isEquipped = false;
        }
      });
      // If equipping a shield, unequip two-handed, double wielded, or off-hand weapons
      if (target.isShield) {
        pc.weapons.forEach(w => {
          if (w.grip === '2h' || w.grip === 'rng' || w.isDoubleWielded || w.hand === 'off') {
            w.isEquipped = false;
          }
        });
      }
    }
    
    target.isEquipped = newEquippedState;
    
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}

export function updatePCArmorField(idx, field, val) {
  const pc = getActivePC();
  if (pc && pc.armors && pc.armors[idx]) {
    pc.armors[idx][field] = val;
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}

export function setPCAutoAC(val) {
  const pc = getActivePC();
  if (pc) {
    pc.autoAC = !!val;
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}

export function addPCItem() {
  const pc = getActivePC();
  if (pc) {
    if (!Array.isArray(pc.items)) {
      pc.items = [];
    }
    pc.items.push(new Item({
      name: 'Neuer Gegenstand',
      slot: 'slotless',
      isEquipped: false,
      effects: [{
        type: 'attribute',
        target: 'str',
        value: 0
      }]
    }));
    saveToStorage();
    syncPCToHost();
  }
}

export function deletePCItem(idx) {
  const pc = getActivePC();
  if (pc && Array.isArray(pc.items) && pc.items[idx]) {
    pc.items.splice(idx, 1);
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}

export function updatePCItem(idx, key, val) {
  const pc = getActivePC();
  if (pc && pc.items && pc.items[idx]) {
    pc.items[idx][key] = val;
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}

export function togglePCItemEquip(idx) {
  const pc = getActivePC();
  if (pc && Array.isArray(pc.items) && pc.items[idx]) {
    const target = pc.items[idx];
    const newEquipped = !target.isEquipped;

    if (newEquipped) {
      if (target.slot !== 'slotless') {
        pc.items.forEach((item, itemIdx) => {
          if (itemIdx !== idx && item.slot === target.slot) {
            item.isEquipped = false;
          }
        });
      }
    }

    target.isEquipped = newEquipped;
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}

export function addPCItemEffect(itemIdx) {
  const pc = getActivePC();
  if (pc && pc.items && pc.items[itemIdx]) {
    const item = pc.items[itemIdx];
    if (!Array.isArray(item.effects)) {
      item.effects = [];
    }
    item.effects.push({
      type: 'attribute',
      target: 'str',
      value: 0
    });
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}

export function deletePCItemEffect(itemIdx, effectIdx) {
  const pc = getActivePC();
  if (pc && pc.items && pc.items[itemIdx]) {
    const item = pc.items[itemIdx];
    if (Array.isArray(item.effects) && item.effects[effectIdx]) {
      item.effects.splice(effectIdx, 1);
      recalculatePCStats(pc);
      saveToStorage();
      syncPCToHost();
    }
  }
}

export function updatePCItemEffect(itemIdx, effectIdx, key, val) {
  const pc = getActivePC();
  if (pc && pc.items && pc.items[itemIdx]) {
    const item = pc.items[itemIdx];
    if (Array.isArray(item.effects) && item.effects[effectIdx]) {
      item.effects[effectIdx][key] = val;
      recalculatePCStats(pc);
      saveToStorage();
      syncPCToHost();
    }
  }
}

/**
 * Equips an item into a specified slot or its default slot with smart ring distribution.
 * @param {number} itemIdx
 * @param {string} [targetSlot]
 */
export function equipPCItem(itemIdx, targetSlot) {
  const pc = getActivePC();
  if (!pc || !Array.isArray(pc.items) || !pc.items[itemIdx]) return;

  const target = pc.items[itemIdx];
  let slot = targetSlot || target.slot || 'slotless';

  // Smart Ring distribution: if 'ring' or unspecified, check ring1 / ring2
  if (slot === 'ring' || slot === 'ring1' || slot === 'ring2') {
    if (targetSlot) {
      slot = targetSlot;
    } else {
      const ring1Occupied = pc.items.some((it, idx) => idx !== itemIdx && it.isEquipped && it.slot === 'ring1');
      const ring2Occupied = pc.items.some((it, idx) => idx !== itemIdx && it.isEquipped && it.slot === 'ring2');
      if (!ring1Occupied) {
        slot = 'ring1';
      } else if (!ring2Occupied) {
        slot = 'ring2';
      } else {
        slot = 'ring1';
      }
    }
  }

  target.slot = slot;

  // Unequip existing occupant in the same slot (unless slotless)
  if (slot !== 'slotless') {
    pc.items.forEach((item, idx) => {
      if (idx !== itemIdx && item.slot === slot) {
        item.isEquipped = false;
      }
    });
  }

  target.isEquipped = true;
  recalculatePCStats(pc);
  saveToStorage();
  syncPCToHost();
}

/**
 * Unequips an item.
 * @param {number} itemIdx
 */
export function unequipPCItem(itemIdx) {
  const pc = getActivePC();
  if (!pc || !Array.isArray(pc.items) || !pc.items[itemIdx]) return;

  pc.items[itemIdx].isEquipped = false;
  recalculatePCStats(pc);
  saveToStorage();
  syncPCToHost();
}

/**
 * Swaps currently equipped item in slot with a new item from inventory.
 * @param {string} slot
 * @param {number} newItemIdx
 */
export function swapPCItem(slot, newItemIdx) {
  const pc = getActivePC();
  if (!pc || !Array.isArray(pc.items) || !pc.items[newItemIdx]) return;

  // Unequip currently equipped item in slot
  pc.items.forEach((it, idx) => {
    if (idx !== newItemIdx && it.isEquipped && it.slot === slot) {
      it.isEquipped = false;
    }
  });

  const newItem = pc.items[newItemIdx];
  newItem.slot = slot;
  newItem.isEquipped = true;

  recalculatePCStats(pc);
  saveToStorage();
  syncPCToHost();
}

/**
 * Deducts charges or daily uses from an item.
 * @param {number} itemIdx
 * @param {number} [amount=1]
 */
export function usePCItemCharge(itemIdx, amount = 1) {
  const pc = getActivePC();
  if (!pc || !Array.isArray(pc.items) || !pc.items[itemIdx]) return;

  const item = pc.items[itemIdx];
  if (item.charges && item.charges.current > 0) {
    item.charges.current = Math.max(0, item.charges.current - amount);
  } else if (item.dailyUses && item.dailyUses.current > 0) {
    item.dailyUses.current = Math.max(0, item.dailyUses.current - amount);
  }

  saveToStorage();
  syncPCToHost();
}

/**
 * Activates or consumes a usable magic item (potion, wand, scroll, wondrous item).
 * @param {number} itemIdx
 * @returns {{ success: boolean, message: string, healAmount?: number }}
 */
export function usePCItemAction(itemIdx) {
  const pc = getActivePC();
  if (!pc || !Array.isArray(pc.items) || !pc.items[itemIdx]) {
    return { success: false, message: 'Item not found.' };
  }

  const item = pc.items[itemIdx];
  const itemName = (item.name || '').toLowerCase();
  const isPotion = itemName.includes('potion') || itemName.includes('trank') || (item.slot === 'slotless' && item.charges?.max === 1 && !itemName.includes('wand') && !itemName.includes('scroll'));
  const isScroll = itemName.includes('scroll') || itemName.includes('schriftrolle');
  const isWand = itemName.includes('wand') || itemName.includes('zauberstab');

  // Check available charges/daily uses
  if (item.charges && item.charges.current <= 0) {
    return { success: false, message: `No charges remaining on ${item.name}.` };
  }
  if (item.dailyUses && item.dailyUses.current <= 0) {
    return { success: false, message: `No daily uses remaining today on ${item.name}.` };
  }

  let resultMessage = '';
  let healAmount = 0;

  // 1. Healing Resolution
  const healingFormula = item.healingFormula || (isPotion && (itemName.includes('cure') || itemName.includes('heil')) ? '1d8+1' : null);
  
  if (healingFormula) {
    const match = healingFormula.match(/(\d+)d(\d+)(?:\+(\d+))?/i);
    if (match) {
      const numDice = parseInt(match[1]) || 1;
      const dieSize = parseInt(match[2]) || 8;
      const bonus = parseInt(match[3]) || 0;
      let rolledSum = 0;
      for (let i = 0; i < numDice; i++) {
        rolledSum += Math.floor(Math.random() * dieSize) + 1;
      }
      healAmount = rolledSum + bonus;
    } else {
      healAmount = 5;
    }

    const currentHp = typeof pc.hp === 'number' ? pc.hp : (typeof pc.hp?.getValue === 'function' ? pc.hp.getValue() : 20);
    const maxHp = typeof pc.maxHp === 'number' ? pc.maxHp : 20;
    const newHp = Math.min(maxHp, currentHp + healAmount);
    
    if (typeof pc.hp === 'object' && typeof pc.hp.setValue === 'function') {
      pc.hp.setValue(newHp);
    } else {
      pc.hp = newHp;
    }

    resultMessage = `Drank ${item.name}: Restored +${healAmount} HP! (${currentHp} ➔ ${newHp}/${maxHp} HP)`;
  }

  // 2. Buff Resolution
  if (item.activation?.appliedBuffKey) {
    const buffKey = item.activation.appliedBuffKey;
    if (!Array.isArray(pc.activeBuffs)) pc.activeBuffs = [];
    const isAlreadyActive = pc.activeBuffs.some(b => b.spellKey === buffKey);
    if (!isAlreadyActive) {
      pc.activeBuffs.push({
        id: 'item_buff_' + Date.now(),
        spellKey: buffKey,
        name: item.name,
        source: item.name,
        durationRemainingRounds: 10
      });
      resultMessage += (resultMessage ? ' | ' : '') + `Activated ${buffKey.toUpperCase()} from ${item.name}!`;
    }
  }

  if (!healingFormula && !item.activation?.appliedBuffKey) {
    resultMessage = `Used ${item.name}: ${item.activation?.effectDescription || item.description || 'Action performed.'}`;
  }

  // 3. Deduct charges / consume single-use items
  if (item.charges) {
    item.charges.current = Math.max(0, item.charges.current - 1);
    if ((isPotion || isScroll || item.charges.max === 1) && item.charges.current === 0) {
      pc.items.splice(itemIdx, 1);
    }
  } else if (item.dailyUses) {
    item.dailyUses.current = Math.max(0, item.dailyUses.current - 1);
  } else if (isPotion || isScroll) {
    pc.items.splice(itemIdx, 1);
  }

  recalculatePCStats(pc);
  saveToStorage();
  syncPCToHost();

  return {
    success: true,
    message: resultMessage,
    healAmount
  };
}

/**
 * Adds an item from the MAGIC_ITEMS_REGISTRY preset compendium to the PC inventory.
 * @param {string} presetKey
 * @param {boolean} [shouldEquip=false]
 */
export function addPCItemFromCompendium(presetKey, shouldEquip = false) {
  const pc = getActivePC();
  if (!pc) return;

  const preset = MAGIC_ITEMS_REGISTRY[presetKey];
  if (!preset) return;

  if (!Array.isArray(pc.items)) {
    pc.items = [];
  }

  const newItem = new Item(preset);
  const newIdx = pc.items.length;
  pc.items.push(newItem);

  if (shouldEquip) {
    equipPCItem(newIdx, preset.slot);
  } else {
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}


