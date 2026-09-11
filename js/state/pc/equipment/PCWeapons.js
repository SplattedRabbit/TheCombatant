/**
 * @module    PCWeapons
 * @summary   State mutations for Player Character weapon loadouts (equip, two-handed, double wield, grip).
 * @feature   state/pc
 * @exports   updatePCWeapon, addPCWeapon, deletePCWeapon, togglePCWeaponEquip
 */

import { getActivePC } from '../../state-core.js';
import { saveToStorage } from '../../StorageManager.js';
import { recalculatePCStats, syncPCToHost } from '../PCGeneral.js';
import { Weapon } from '../../../models/model-core.js';
import { WeaponRegistry } from '../../../models/Weapon.js';

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
      } else {
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
          // If this weapon is designated as off-hand, unequip any equipped shield
          if (target.hand === 'off') {
            if (Array.isArray(pc.armors)) {
              pc.armors.forEach(a => {
                if (a.isShield) a.isEquipped = false;
              });
            }
          }
          // Enforce max 1 main and max 1 off equipped at any time
          pc.weapons.forEach((w, wIdx) => {
            if (wIdx !== idx && w.isEquipped && w.hand === target.hand) {
              w.isEquipped = false;
            }
          });
        }
      }
    }

    target.isEquipped = newEquipped;

    // Consistency check: ensure no two weapons share hand if both equipped
    const equipped = pc.weapons.filter(w => w.isEquipped);
    const mainCount = equipped.filter(w => w.hand === 'main').length;
    const offCount = equipped.filter(w => w.hand === 'off').length;
    if (mainCount > 1 || offCount > 1) {
      // Fallback: only keep current weapon equipped
      pc.weapons.forEach((w, wIdx) => {
        if (wIdx !== idx) w.isEquipped = false;
      });
    }

    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}
