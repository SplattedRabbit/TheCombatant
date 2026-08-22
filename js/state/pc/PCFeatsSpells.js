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
import { SKILL_TRICKS_REGISTRY } from '../../data/skillTricks-data.js';

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

export function consumeSmiteEvilCharge() {
  const pc = getActivePC();
  if (pc && Array.isArray(pc.dailyAbilities)) {
    const smiteAbility = pc.dailyAbilities.find(a => a.name === "Böses niederstrecken" || a.name === "Smite Evil");
    if (smiteAbility) {
      if (smiteAbility.used < smiteAbility.max) {
        smiteAbility.used += 1;
        saveToStorage();
        syncPCToHost();
        return { success: true, remaining: smiteAbility.max - smiteAbility.used };
      } else {
        return { success: false, remaining: 0 };
      }
    }
  }
  return { success: true, remaining: 99 };
}

export function togglePCRage(forceState) {
  const pc = getActivePC();
  if (!pc) return { success: false };
  const shouldRage = forceState !== undefined ? forceState : !pc.isRaging;
  if (shouldRage) {
    const ability = pc.dailyAbilities?.find(a => a.name === "Kampfrausch (Rage)");
    if (ability && ability.used >= ability.max) {
      return { success: false, message: 'No rage uses remaining today.' };
    }
    if (ability) {
      ability.used = Math.min(ability.max, ability.used + 1);
    }
    pc.enterRage();
  } else {
    pc.exitRage();
  }
  saveToStorage();
  syncPCToHost();
  return { success: true, isRaging: pc.isRaging };
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
    if (Array.isArray(pc.items)) {
      pc.items.forEach(item => {
        if (item && item.dailyUses && item.dailyUses.max) {
          item.dailyUses.current = item.dailyUses.max;
        }
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

    // Re-enable if it was disabled as an automatic feat
    if (Array.isArray(pc.disabledAutomaticFeats)) {
      const dIdx = pc.disabledAutomaticFeats.indexOf(featId);
      if (dIdx !== -1) {
        pc.disabledAutomaticFeats.splice(dIdx, 1);
      }
    }

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
    let removed = false;
    if (Array.isArray(pc.feats)) {
      // Find index of the feat to remove (match option if passed, or first match if option is empty)
      const idx = pc.feats.findIndex(f => f.id === featId && (!option || f.option === option));
      if (idx !== -1) {
        pc.feats.splice(idx, 1);
        removed = true;
        
        // Special handling for Toughness
        if (featId === 'toughness') {
          pc.maxHP = Math.max(1, (pc.maxHP || 0) - 3);
          pc.hp = Math.max(-99, (pc.hp || 0) - 3);
        }
      }
    }

    // If it was not in manual feats or is an automatic class feat, add to disabledAutomaticFeats
    if (!removed) {
      if (!Array.isArray(pc.disabledAutomaticFeats)) pc.disabledAutomaticFeats = [];
      if (!pc.disabledAutomaticFeats.includes(featId)) {
        pc.disabledAutomaticFeats.push(featId);
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

export function addPCSkillTrick(trickId, isBonus = false) {
  const pc = getActivePC();
  if (!pc) return { success: false, error: 'Kein aktiver Charakter.' };

  const trickDef = SKILL_TRICKS_REGISTRY[trickId];
  if (!trickDef) return { success: false, error: 'Ungültiger Skill Trick.' };

  const alreadyLearned = Array.isArray(pc.skillTricks) && pc.skillTricks.some(t => {
    if (typeof t === 'object') {
      return t.id === trickId;
    }
    return t === trickId;
  });

  if (alreadyLearned) {
    return { success: false, error: `Der Skill Trick "${trickDef.nameDe}" wurde bereits erlernt.` };
  }

  if (!isBonus) {
    const limit = CombatRules.getMaxSkillTricksLimit(pc);
    const nonBonusCount = pc.skillTricks.filter(t => typeof t === 'object' ? !t.isBonus : true).length;
    if (nonBonusCount >= limit) {
      return { success: false, error: `Maximale Anzahl an erlernbaren Skill Tricks (${limit}) erreicht.` };
    }

    const spent = CombatRules.calculateSpentSkillPoints(pc);
    const total = CombatRules.calculateTotalSkillPoints(pc);
    if (spent + 2 > total) {
      return { success: false, error: `Nicht genügend Fertigkeitspunkte. 2 SP benötigt.` };
    }
  }

  const { met, details } = CombatRules.checkSkillTrickPrerequisites(trickId, pc);
  if (!met) {
    const unmetList = details.filter(d => !d.met).map(d => d.desc).join('\n• ');
    return { success: false, error: `Voraussetzungen nicht erfüllt:\n• ${unmetList}` };
  }

  updatePCBatch(pc => {
    if (!Array.isArray(pc.skillTricks)) pc.skillTricks = [];
    pc.skillTricks.push({ id: trickId, isBonus: !!isBonus });
  });

  return { success: true };
}

export function removePCSkillTrick(trickId) {
  updatePCBatch(pc => {
    if (!Array.isArray(pc.skillTricks)) return;
    const idx = pc.skillTricks.findIndex(t => {
      if (typeof t === 'object') return t.id === trickId;
      return t === trickId;
    });
    if (idx !== -1) {
      pc.skillTricks.splice(idx, 1);
    }
  });
}
