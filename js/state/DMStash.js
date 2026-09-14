/**
 * @module    DMStash
 * @summary   State operations for the Dungeon Master Item Stash (weapons, armors, wondrous items) and distribution to PCs.
 * @exports   addStashItem, updateStashItem, deleteStashItem, giveStashItemToPC
 */

import { getState, StateEvents } from './state-core.js';
import { saveToStorage } from './StorageManager.js';
import { recalculatePCStats, syncPCToHost } from './pc/PCGeneral.js';
import { Weapon } from '../models/Weapon.js';
import { Armor } from '../models/Armor.js';
import { Item } from '../models/Item.js';

function ensureStash(state) {
  if (!state.meta) state.meta = {};
  if (!state.meta.dmStash) {
    state.meta.dmStash = { weapons: [], armors: [], items: [] };
  }
  if (!Array.isArray(state.meta.dmStash.weapons)) state.meta.dmStash.weapons = [];
  if (!Array.isArray(state.meta.dmStash.armors)) state.meta.dmStash.armors = [];
  if (!Array.isArray(state.meta.dmStash.items)) state.meta.dmStash.items = [];
}

export function addStashItem(category, item) {
  const state = getState();
  ensureStash(state);
  
  let formattedItem;
  if (category === 'weapons') {
    formattedItem = item instanceof Weapon ? item : new Weapon(item);
  } else if (category === 'armors') {
    formattedItem = item instanceof Armor ? item : new Armor(item);
  } else {
    formattedItem = item instanceof Item ? item : new Item(item);
  }

  state.meta.dmStash[category].push(formattedItem);
  saveToStorage();
  StateEvents.emit('state_changed', state);
}

export function updateStashItem(category, index, itemUpdates) {
  const state = getState();
  ensureStash(state);
  
  const current = state.meta.dmStash[category]?.[index];
  if (!current) return;

  const merged = { ...current, ...itemUpdates };
  let formattedItem;
  if (category === 'weapons') {
    formattedItem = new Weapon(merged);
  } else if (category === 'armors') {
    formattedItem = new Armor(merged);
  } else {
    formattedItem = new Item(merged);
  }

  state.meta.dmStash[category][index] = formattedItem;
  saveToStorage();
  StateEvents.emit('state_changed', state);
}

export function deleteStashItem(category, index) {
  const state = getState();
  ensureStash(state);

  if (state.meta.dmStash[category]) {
    state.meta.dmStash[category].splice(index, 1);
    saveToStorage();
    StateEvents.emit('state_changed', state);
  }
}

export function giveStashItemToPC(category, index, pcId) {
  const state = getState();
  ensureStash(state);

  const pc = state.combatants.find(c => c.id === pcId);
  if (!pc) return;

  const item = state.meta.dmStash[category]?.[index];
  if (!item) return;

  // Clone item to give to PC
  const itemData = JSON.parse(JSON.stringify(item));

  if (category === 'weapons') {
    if (!Array.isArray(pc.weapons)) pc.weapons = [];
    itemData.isEquipped = false;
    pc.weapons.push(new Weapon(itemData));
  } else if (category === 'armors') {
    if (!Array.isArray(pc.armors)) pc.armors = [];
    itemData.isEquipped = false;
    pc.armors.push(new Armor(itemData));
  } else {
    if (!Array.isArray(pc.items)) pc.items = [];
    itemData.isEquipped = false;
    pc.items.push(new Item(itemData));
  }

  // Remove from stash
  state.meta.dmStash[category].splice(index, 1);

  // Recalculate stats and notify listeners
  recalculatePCStats(pc);
  saveToStorage();
  syncPCToHost();
  StateEvents.emit('pc_changed', pc);
  StateEvents.emit('state_changed', state);
}
