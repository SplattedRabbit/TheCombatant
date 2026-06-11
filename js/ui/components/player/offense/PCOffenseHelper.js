/**
 * @module    PCOffenseHelper
 * @summary   Stellt ID-Verwaltung, Seltenheits-Styling und Waffentalent-Modifikatoren für PCOffense bereit.
 * @exports   getWeaponRuntimeId, _getRarityStyle, getWeaponFeatModifiers
 * @reads     pc.feats
 * @stateOps  keine
 * @depends   Weapon.js (matchesFeatOption)
 * @notHere   UI-Rendering -> EquipmentSlotsRenderer.js, WeaponStashCard.js | Kampfbalken -> CombatSettingsRenderer.js
 */

import { matchesFeatOption } from '../../../../models/Weapon.js';

export const openDrawerIds = new Set();
const weaponRuntimeIds = new WeakMap();
let weaponIdCounter = 0;

export function getWeaponRuntimeId(w) {
  if (!weaponRuntimeIds.has(w)) {
    weaponRuntimeIds.set(w, ++weaponIdCounter);
  }
  return weaponRuntimeIds.get(w);
}

export function _getRarityStyle(enhancement) {
  return {
    border: '1.5px solid var(--pb)',
    background: 'rgba(200, 169, 110, 0.04)',
    boxShadow: 'inset 0 0 8px rgba(200, 169, 110, 0.05)',
    glowClass: ''
  };
}

export function getWeaponFeatModifiers(w, pc) {
  let atkBonus = 0;
  let dmgBonus = 0;
  
  if (!pc || !pc.feats || !w) return { atkBonus, dmgBonus, details: [] };
  
  const details = [];
  
  pc.feats.forEach(feat => {
    if (feat.id === 'weapon_focus' && feat.option) {
      if (matchesFeatOption(w, feat.option)) {
        atkBonus += 1;
        details.push({ label: `Talent: Waffenfokus (${feat.option})`, type: 'atk', value: 1 });
      }
    }
    if (feat.id === 'greater_weapon_focus' && feat.option) {
      if (matchesFeatOption(w, feat.option)) {
        atkBonus += 1;
        details.push({ label: `Talent: Mächtiger Waffenfokus (${feat.option})`, type: 'atk', value: 1 });
      }
    }
    if (feat.id === 'weapon_specialization' && feat.option) {
      if (matchesFeatOption(w, feat.option)) {
        dmgBonus += 2;
        details.push({ label: `Talent: Waffenspezialisierung (${feat.option})`, type: 'dmg', value: 2 });
      }
    }
    if (feat.id === 'greater_weapon_specialization' && feat.option) {
      if (matchesFeatOption(w, feat.option)) {
        dmgBonus += 2;
        details.push({ label: `Talent: Mächtige Waffenspezialisierung (${feat.option})`, type: 'dmg', value: 2 });
      }
    }
    if (feat.id === 'point_blank_shot' && w.grip === 'rng') {
      atkBonus += 1;
      dmgBonus += 1;
      details.push({ label: 'Talent: Nahschuss', type: 'atk', value: 1 });
      details.push({ label: 'Talent: Nahschuss', type: 'dmg', value: 1 });
    }
  });
  
  return { atkBonus, dmgBonus, details };
}
