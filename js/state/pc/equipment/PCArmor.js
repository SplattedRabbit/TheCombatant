/**
 * @module    PCArmor
 * @summary   State mutations for Player Character armor and shields (equip, toggle, auto-AC).
 * @feature   state/pc
 * @exports   addPCArmor, removePCArmor, togglePCArmorEquip, updatePCArmorField, setPCAutoAC
 */

import { getActivePC } from '../../state-core.js';
import { saveToStorage } from '../../StorageManager.js';
import { recalculatePCStats, syncPCToHost } from '../PCGeneral.js';
import { Armor } from '../../../models/model-core.js';

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
