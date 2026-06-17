/**
 * @module    PCFeatsSpells
 * @summary   State mutations for Player Character feats, spells, and templates.
 * @exports   updatePCSpellSlotsMax, updatePCSpellSlotsUsed, addPCDailyAbility, removePCDailyAbility, updatePCDailyAbilityUsed, resetDailyResources, addPCFeat, removePCFeat, savePCSpellTemplate, deletePCSpellTemplate, applyPCSpellTemplate, clearPreparedSpells
 */

import { getActivePC } from '../state-core.js';
import { saveToStorage } from '../StorageManager.js';
import { updatePCBatch, recalculatePCStats, syncPCToHost } from './PCGeneral.js';
import { CombatFeats, checkFeatPrerequisites } from '../../data/feats-data.js';
import { CombatRules } from '../../rules.js';

export function updatePCSpellSlotsMax(lvl, max) {
  const pc = getActivePC();
  if (pc && pc.spellSlots && pc.spellSlots[lvl]) {
    pc.spellSlots[lvl].max = Math.max(0, parseInt(max) || 0);
    saveToStorage();
    syncPCToHost();
  }
}

export function updatePCSpellSlotsUsed(lvl, used) {
  const pc = getActivePC();
  if (pc && pc.spellSlots && pc.spellSlots[lvl]) {
    const max = pc.spellSlots[lvl].max;
    pc.spellSlots[lvl].used = Math.max(0, Math.min(max, parseInt(used) || 0));
    saveToStorage();
    syncPCToHost();
  }
}

export function addPCDailyAbility(name, max) {
  const pc = getActivePC();
  if (pc && pc.dailyAbilities) {
    pc.dailyAbilities.push({
      name: name || 'Fähigkeit',
      max: Math.max(1, parseInt(max) || 1),
      used: 0
    });
    saveToStorage();
    syncPCToHost();
  }
}

export function removePCDailyAbility(idx) {
  const pc = getActivePC();
  if (pc && pc.dailyAbilities && pc.dailyAbilities[idx]) {
    pc.dailyAbilities.splice(idx, 1);
    saveToStorage();
    syncPCToHost();
  }
}

export function updatePCDailyAbilityUsed(idx, diff) {
  const pc = getActivePC();
  if (pc && pc.dailyAbilities && pc.dailyAbilities[idx]) {
    const ability = pc.dailyAbilities[idx];
    ability.used = Math.max(0, Math.min(ability.max, ability.used + diff));
    saveToStorage();
    syncPCToHost();
  }
}

export function resetDailyResources() {
  const pc = getActivePC();
  if (pc) {
    for (let lvl = 0; lvl <= 9; lvl++) {
      if (pc.spellSlots && pc.spellSlots[lvl]) {
        pc.spellSlots[lvl].used = 0;
      }
    }
    if (Array.isArray(pc.dailyAbilities)) {
      pc.dailyAbilities.forEach(ab => {
        ab.used = 0;
      });
    }
    if (pc.isRaging) {
      pc.exitRage();
    }
    if (Array.isArray(pc.preparedSpells)) {
      pc.preparedSpells.forEach(ps => {
        ps.isUsed = false;
      });
    }
    saveToStorage();
    syncPCToHost();
  }
}

export function addPCFeat(featId, option = '') {
  const pc = getActivePC();
  if (!pc) return { success: false, error: 'Kein aktiver Charakter.' };

  // 1. Check duplicate feat (Bug #18)
  const featDef = CombatFeats.REGISTRY[featId];
  if (featDef) {
    const hasFeat = Array.isArray(pc.feats) && pc.feats.some(f => f.id === featId);
    if (hasFeat) {
      const isStackable = featDef.hasOption || (featDef.specialRaw && featDef.specialRaw.toLowerCase().includes('multiple times'));
      if (!isStackable) {
        return { success: false, error: `Das Talent "${featDef.nameDe}" wurde bereits erlernt und kann nicht mehrfach gewählt werden.` };
      }
      
      const hasExactOption = pc.feats.some(f => f.id === featId && f.option === option);
      if (hasExactOption) {
        return { success: false, error: `Das Talent "${featDef.nameDe} (${option})" wurde bereits erlernt.` };
      }
    }
  }

  // 2. Check maximum feats limit with slot allocation validation
  const nextFeats = [...(pc.feats || []), { id: featId, option: option || '' }];
  const validation = CombatRules.validateFeatsAssignment(pc, nextFeats);
  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  // 3. Check prerequisites
  const { met, unmetDescs } = checkFeatPrerequisites(featId, pc);
  if (!met) {
    return { success: false, error: `Voraussetzungen nicht erfüllt:\n• ${unmetDescs.join('\n• ')}` };
  }

  updatePCBatch(pc => {
    if (!Array.isArray(pc.feats)) pc.feats = [];

    // Add the feat
    pc.feats.push({ id: featId, option: option || '' });

    // Special handling for Toughness: +3 MaxHP and current HP
    if (featId === 'toughness') {
      pc.maxHP = (pc.maxHP || 0) + 3;
      pc.hp = (pc.hp || 0) + 3;
    }
  });

  return { success: true };
}

export function removePCFeat(featId, option = '') {
  updatePCBatch(pc => {
    if (!Array.isArray(pc.feats)) return;
    
    // Find index of the feat to remove
    const idx = pc.feats.findIndex(f => f.id === featId && f.option === option);
    if (idx !== -1) {
      pc.feats.splice(idx, 1);
      
      // Special handling for Toughness
      if (featId === 'toughness') {
        pc.maxHP = Math.max(1, (pc.maxHP || 0) - 3);
        pc.hp = Math.max(-99, (pc.hp || 0) - 3);
      }
    }
  });
}

export function savePCSpellTemplate(name, templateSpells) {
  updatePCBatch(pc => {
    if (!pc.spellTemplates) pc.spellTemplates = {};
    pc.spellTemplates[name] = templateSpells.map(s => ({
      spellKey: s.spellKey,
      metamagic: [...(s.metamagic || [])],
      isSpecialist: !!s.isSpecialist
    }));
  });
}

export function deletePCSpellTemplate(name) {
  updatePCBatch(pc => {
    if (pc.spellTemplates && pc.spellTemplates[name]) {
      delete pc.spellTemplates[name];
    }
  });
}

export function applyPCSpellTemplate(name) {
  const pc = getActivePC();
  if (pc) {
    const result = pc.applySpellTemplate(name);
    if (result.success) {
      saveToStorage();
      syncPCToHost();
    }
    return result;
  }
  return { success: false, error: 'Kein aktiver Charakter.' };
}

export function clearPreparedSpells() {
  updatePCBatch(pc => {
    pc.preparedSpells = [];
  });
}
