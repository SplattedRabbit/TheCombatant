/**
 * @module    PCItems
 * @summary   State mutations for Player Character inventory items, wondrous items, consumables and charges.
 * @feature   state/pc
 * @exports   addPCItem, deletePCItem, reorderPCItems, updatePCItem, togglePCItemEquip, addPCItemEffect, deletePCItemEffect, updatePCItemEffect, equipPCItem, unequipPCItem, swapPCItem, usePCItemCharge, usePCItemAction, addPCItemFromCompendium
 */

import { getActivePC, StateEvents } from '../../state-core.js';
import { saveToStorage } from '../../StorageManager.js';
import { recalculatePCStats, syncPCToHost } from '../PCGeneral.js';
import { Item } from '../../../models/model-core.js';
import { MAGIC_ITEMS_REGISTRY } from '../../../data/magicItems-data.js';
import { CombatSpells } from '../../../spells.js';
import { CLASS_BUFFS } from '../../../data/class-buffs-data.js';

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

export function reorderPCItems(fromIdx, toIdx) {
  const pc = getActivePC();
  if (pc && Array.isArray(pc.items) && fromIdx >= 0 && fromIdx < pc.items.length && toIdx >= 0 && toIdx < pc.items.length && fromIdx !== toIdx) {
    const [movedItem] = pc.items.splice(fromIdx, 1);
    pc.items.splice(toIdx, 0, movedItem);
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
export function usePCItemCharge(itemIdx, amount) {
  if (amount === undefined) {
    return usePCItemAction(itemIdx);
  }
  const pc = getActivePC();
  if (!pc || !Array.isArray(pc.items) || !pc.items[itemIdx]) return { success: false };

  const item = pc.items[itemIdx];
  if (item.charges && item.charges.current > 0) {
    item.charges.current = Math.max(0, item.charges.current - amount);
  } else if (item.dailyUses && item.dailyUses.current > 0) {
    item.dailyUses.current = Math.max(0, item.dailyUses.current - amount);
  }

  saveToStorage();
  syncPCToHost();
  return { success: true };
}

/**
 * Activates or consumes a usable magic item (potion, wand, scroll, wondrous item).
 * @param {number} itemIdx
 * @param {number|string} [customHealAmount]
 * @returns {{ success: boolean, message: string, healAmount?: number }}
 */
export function usePCItemAction(itemIdx, customHealAmount) {
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
  const healingFormula = item.healingFormula || (isPotion && (itemName.includes('cure') || itemName.includes('heil')) ? (itemName.includes('moderate') ? '2d8+3' : (itemName.includes('serious') ? '3d8+5' : (itemName.includes('critical') ? '4d8+7' : '1d8+1'))) : null);
  
  if (healingFormula) {
    if (customHealAmount !== undefined && customHealAmount !== null && String(customHealAmount).trim() !== '') {
      const strVal = String(customHealAmount).trim();
      try {
        const cleanExpr = strVal.replace(/[^0-9+\-*/().]/g, '');
        const parsed = Function('"use strict";return (' + cleanExpr + ')')();
        healAmount = Math.max(0, Math.floor(Number(parsed) || 0));
      } catch (e) {
        healAmount = Math.max(0, parseInt(strVal) || 0);
      }
    } else {
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
    }

    const currentHp = typeof pc.hp === 'number' ? pc.hp : (typeof pc.hp?.getValue === 'function' ? pc.hp.getValue() : (parseInt(pc.hp) || 0));
    const maxHp = typeof pc.maxHP === 'number' ? pc.maxHP : (typeof pc.maxHp === 'number' ? pc.maxHp : (parseInt(pc.maxHP) || parseInt(pc.maxHp) || 20));
    
    // Anima Construct racial rule: half healing from magical sources
    let effectiveHeal = healAmount;
    if ((pc.race || '').toLowerCase() === 'anima_construct') {
      effectiveHeal = Math.floor(healAmount / 2);
    }

    const newHp = Math.min(maxHp, currentHp + effectiveHeal);
    
    if (typeof pc.hp === 'object' && typeof pc.hp.setValue === 'function') {
      pc.hp.setValue(newHp);
    } else {
      pc.hp = newHp;
    }

    const delta = newHp - currentHp;
    if (delta !== 0) {
      StateEvents.emit('hp_changed', { id: pc.id, delta, isHeal: delta > 0 });
    }

    resultMessage = `Drank ${item.name}: Restored +${effectiveHeal} HP! (${currentHp} ➔ ${newHp}/${maxHp} HP)`;
  }

  // 2. Buff Resolution
  if (item.activation?.appliedBuffKey) {
    const buffKey = item.activation.appliedBuffKey;
    if (!Array.isArray(pc.activeBuffs)) pc.activeBuffs = [];
    const isAlreadyActive = pc.activeBuffs.some(b => b.spellKey === buffKey);
    if (!isAlreadyActive) {
      const classBuff = CLASS_BUFFS.find(b => b.key === buffKey);
      const spell = CombatSpells.REGISTRY?.[buffKey];
      const buffDisplayName = classBuff?.name || spell?.nameEn || spell?.nameDe || buffKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      pc.activeBuffs.push({
        id: 'item_buff_' + Date.now(),
        spellKey: buffKey,
        name: buffDisplayName,
        source: item.name,
        durationRemainingRounds: 10
      });
      resultMessage += (resultMessage ? ' | ' : '') + `Activated ${buffDisplayName} from ${item.name}!`;
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

function isConsumablePreset(preset) {
  if (!preset) return false;
  const name = (preset.name || '').toLowerCase();
  const key = (preset.key || '').toLowerCase();
  const type = (preset.type || '').toLowerCase();

  if (type === 'potion' || type === 'scroll' || type === 'wand' || type === 'consumable' || type === 'alchemical') return true;
  if (key.startsWith('potion_') || key.startsWith('scroll_') || key.startsWith('wand_')) return true;
  if (name.includes('potion') || name.includes('scroll') || name.includes('wand') || name.includes('trank') || name.includes('schriftrolle')) return true;

  const hasPassiveEffects = Array.isArray(preset.effects) && preset.effects.some(e => (parseInt(e.value) || 0) !== 0);
  if (!hasPassiveEffects && (preset.healingFormula || preset.damageFormula || preset.activation?.appliedBuffKey || preset.charges?.max === 1)) {
    return true;
  }
  return false;
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

  const isConsumable = isConsumablePreset(preset);

  if (shouldEquip && !isConsumable) {
    equipPCItem(newIdx, preset.slot);
  } else {
    newItem.isEquipped = false;
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}
