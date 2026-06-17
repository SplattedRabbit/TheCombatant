/**
 * @module    PCEquipment
 * @summary   State mutations for Player Character equipment (weapons, armor, items).
 * @exports   updatePCWeapon, addPCWeapon, deletePCWeapon, togglePCWeaponEquip, addPCArmor, removePCArmor, togglePCArmorEquip, updatePCArmorField, setPCAutoAC, addPCItem, deletePCItem, updatePCItem, togglePCItemEquip, addPCItemEffect, deletePCItemEffect, updatePCItemEffect
 */

import { getActivePC } from '../state-core.js';
import { saveToStorage } from '../StorageManager.js';
import { recalculatePCStats, syncPCToHost } from './PCGeneral.js';
import { Weapon, Armor, Item } from '../../models/model-core.js';
import { WeaponRegistry } from '../../models/Weapon.js';

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
