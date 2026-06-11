/**
 * @module    PCManager
 * @summary   Alle State-Mutationen für den Spielercharakter: Klassen, Talente, Waffen, Rüstungen, Zauber, Items, Tagesreset. Exportiert wird via js/state.js (Fassade).
 * @exports   updatePCField, updatePCBatch, addPCWeapon, updatePCWeapon, togglePCWeaponEquip, addPCArmor, togglePCArmorEquip, addPCItem, updatePCItem, togglePCItemEquip, addPCItemEffect, updatePCItemEffect, deletePCItemEffect, addPCFeat, updatePCClassType, resetDailyResources, ...
 * @reads     getActivePC(), getState()
 * @stateOps  Feuert StateEvents.emit('pc_changed') nach jeder Mutation
 * @depends   state-core, StorageManager, model-core, BABCalculator, SaveCalculator, SpellSlotCalculator, feats-data
 * @notHere   UI-Rendering → js/ui/ | D&D-Regelberechnungen → js/rules/ | Netzwerk-Sync → SyncProtocol.js
 */
import { getState, getActivePC, StateEvents } from './state-core.js';
import { saveToStorage } from './StorageManager.js';
import { Stat, createCombatant, Weapon, Armor, Item } from '../models/model-core.js';
import { BABCalculator } from '../rules/BABCalculator.js';
import { SaveCalculator } from '../rules/SaveCalculator.js';
import { SpellSlotCalculator } from '../rules/SpellSlotCalculator.js';
import { checkFeatPrerequisites, getFeatIdsByClassPrereq } from '../data/feats-data.js';

// Import Class Rules
import { BarbarianRules } from '../rules/classes/BarbarianRules.js';
import { PaladinRules } from '../rules/classes/PaladinRules.js';
import { ClericRules } from '../rules/classes/ClericRules.js';
import { BardRules } from '../rules/classes/BardRules.js';
import { DruidRules } from '../rules/classes/DruidRules.js';
import { MonkRules } from '../rules/classes/MonkRules.js';
import { WizardRules } from '../rules/classes/WizardRules.js';
import { SorcererRules } from '../rules/classes/SorcererRules.js';
import { RangerRules } from '../rules/classes/RangerRules.js';
import { RogueRules } from '../rules/classes/RogueRules.js';

function cleanupClassBleed(pc) {
  const activeClasses = Array.isArray(pc.classes) ? pc.classes.map(c => c.classType) : [];
  if (!activeClasses.includes('barbarian')) BarbarianRules.cleanup(pc);
  if (!activeClasses.includes('paladin')) PaladinRules.cleanup(pc);
  if (!activeClasses.includes('cleric')) ClericRules.cleanup(pc);
  if (!activeClasses.includes('bard')) BardRules.cleanup(pc);
  if (!activeClasses.includes('druid') && !activeClasses.includes('ranger')) DruidRules.cleanup(pc);
  if (!activeClasses.includes('wizard') && !activeClasses.includes('sorcerer')) WizardRules.cleanup(pc);
  if (!activeClasses.includes('monk')) MonkRules.cleanup(pc);
  if (!activeClasses.includes('rogue')) RogueRules.cleanup(pc);
}

/**
 * Bug 3 Fix: Removes any feats from the PC that require a specific class
 * (via a prereq of type 'class') which is no longer active after a class swap.
 * Called inside updatePCClassType before the old class is overwritten.
 */
function cleanupFeatsDependingOnClass(pc, removedClassType) {
  if (!Array.isArray(pc.feats) || !removedClassType) return;

  // Get all feat IDs that require the removed class as a prerequisite
  const affectedFeatIds = getFeatIdsByClassPrereq(removedClassType);
  if (affectedFeatIds.length === 0) return;

  // Check whether the same class is still present under another multiclass slot
  const activeClasses = Array.isArray(pc.classes) ? pc.classes.map(c => c.classType) : [];
  if (activeClasses.includes(removedClassType)) return; // still active — nothing to clean

  pc.feats = pc.feats.filter(featInst => !affectedFeatIds.includes(featInst.id));
}

export function recalculateDailyAbilities(pc) {
  if (!pc) return;
  if (!Array.isArray(pc.dailyAbilities)) {
    pc.dailyAbilities = [];
  }
  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  if (hasClasses) {
    pc.classes.forEach(c => {
      if (c.classType === 'barbarian') BarbarianRules.recalculateDailyAbilities(pc, c.level);
      if (c.classType === 'paladin') PaladinRules.recalculateDailyAbilities(pc, c.level);
      if (c.classType === 'cleric') ClericRules.recalculateDailyAbilities(pc, c.level);
      if (c.classType === 'bard') BardRules.recalculateDailyAbilities(pc, c.level);
      if (c.classType === 'druid') DruidRules.recalculateDailyAbilities(pc, c.level);
      if (c.classType === 'monk') MonkRules.recalculateDailyAbilities(pc, c.level);
    });
  }

  // Apply feats modifications on daily resources
  if (Array.isArray(pc.feats)) {
    const extraTurningCount = pc.feats.filter(f => f.id === 'extra_turning').length;
    if (extraTurningCount > 0) {
      let turnAbility = pc.dailyAbilities.find(a => a.name === "Untote vertreiben");
      if (turnAbility) {
        turnAbility.max += extraTurningCount * 4;
      }
    }

    const extraMusicCount = pc.feats.filter(f => f.id === 'extra_music').length;
    if (extraMusicCount > 0) {
      let musicAbility = pc.dailyAbilities.find(a => a.name === "Bardisches Lied");
      if (musicAbility) {
        musicAbility.max += extraMusicCount * 4;
      }
    }
  }
}

export function recalculatePCStats(pc) {
  if (!pc) return;
  
  cleanupClassBleed(pc);

  if (Array.isArray(pc.classes) && pc.classes.length > 0) {
    const babVal = BABCalculator.calculateBab(pc.classes);
    const saves = SaveCalculator.calculateSaves(pc.classes);
    let totalLevel = 0;
    
    pc.classes.forEach(c => {
      totalLevel += c.level;
    });
    
    if (pc.classes.length === 1) {
      pc.classType = pc.classes[0].classType;
    } else {
      pc.classType = 'multiclass';
    }
    pc.level = totalLevel || 1;
    
    if (pc.bab instanceof Stat) pc.bab.base = babVal;
    else pc.bab = new Stat(babVal);

    if (pc.baseZa instanceof Stat) pc.baseZa.base = saves.fort;
    else pc.baseZa = new Stat(saves.fort);

    if (pc.baseRef instanceof Stat) pc.baseRef.base = saves.ref;
    else pc.baseRef = new Stat(saves.ref);

    if (pc.baseWil instanceof Stat) pc.baseWil.base = saves.wil;
    else pc.baseWil = new Stat(saves.wil);
    
    const calculatedSlots = SpellSlotCalculator.calculateSpellSlots(pc);
    if (calculatedSlots) {
      for (let lvl = 0; lvl <= 9; lvl++) {
        if (!pc.spellSlots[lvl]) {
          pc.spellSlots[lvl] = { max: 0, used: 0 };
        }
        pc.spellSlots[lvl].max = calculatedSlots[lvl] || 0;
        pc.spellSlots[lvl].used = Math.min(pc.spellSlots[lvl].max, pc.spellSlots[lvl].used);
      }
    } else {
      for (let lvl = 0; lvl <= 9; lvl++) {
        if (!pc.spellSlots[lvl]) {
          pc.spellSlots[lvl] = { max: 0, used: 0 };
        }
        pc.spellSlots[lvl].max = 0;
        pc.spellSlots[lvl].used = 0;
      }
    }
  } else {
    pc.classType = 'custom';
  }

  recalculateDailyAbilities(pc);

  if (typeof pc.rebuildStatModifiers === 'function') {
    pc.rebuildStatModifiers();
  }
}

export function syncPCToHost() {
  StateEvents.emit('pc_changed', getActivePC());
}

export function updatePCBatch(updaterFn) {
  const pc = getActivePC();
  if (pc) {
    updaterFn(pc);
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}

export function addPCClass(classType, level) {
  updatePCBatch(pc => {
    if (!Array.isArray(pc.classes)) pc.classes = [];
    if (pc.classes.length >= 4) return;
    
    const existing = pc.classes.find(c => c.classType === classType);
    if (existing) {
      existing.level = Math.min(20, existing.level + (parseInt(level) || 1));
    } else {
      pc.classes.push({ classType, level: parseInt(level) || 1 });
    }
  });
}

export function removePCClass(idx) {
  updatePCBatch(pc => {
    if (Array.isArray(pc.classes) && pc.classes[idx]) {
      pc.classes.splice(idx, 1);
    }
  });
}

export function updatePCClassLevel(idx, level) {
  updatePCBatch(pc => {
    if (Array.isArray(pc.classes) && pc.classes[idx]) {
      pc.classes[idx].level = Math.max(1, Math.min(20, parseInt(level) || 1));
    }
  });
}

export function updatePCClassType(idx, classType) {
  updatePCBatch(pc => {
    if (Array.isArray(pc.classes) && pc.classes[idx]) {
      const oldClassType = pc.classes[idx].classType;
      pc.classes[idx].classType = classType;

      // Bug 3 Fix: remove feats that depended on the old class before recalculating
      if (oldClassType && oldClassType !== classType) {
        cleanupFeatsDependingOnClass(pc, oldClassType);
      }
    }
  });
}

export function clearPCClasses() {
  updatePCBatch(pc => {
    pc.classes = [];
    pc.classType = 'custom';
  });
}

export function clearActivePC() {
  const pc = getActivePC();
  if (!pc) return;
  
  const blankPC = createCombatant({ id: pc.id, name: 'Held', type: 'p' });
  
  Object.keys(blankPC).forEach(key => {
    pc[key] = blankPC[key];
  });
  
  recalculatePCStats(pc);
  saveToStorage();
  syncPCToHost();
}

export function updatePCField(field, val) {
  const pc = getActivePC();
  if (pc && pc[field] !== undefined) {
    pc[field] = val;
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}

export function updatePCNumber(field, val) {
  const pc = getActivePC();
  if (pc && pc[field] !== undefined) {
    const num = parseInt(val) || 0;
    if (pc[field] instanceof Stat) {
      const modifiers = pc[field].getValue() - pc[field].base;
      pc[field].base = num - modifiers;
    } else if (field === 'bw') {
      pc.baseBw = num - ((pc.bw || 30) - (pc.baseBw || 30));
      pc.bw = num;
    } else {
      pc[field] = num;
    }
    recalculatePCStats(pc);
    saveToStorage();
    syncPCToHost();
  }
}

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
        if (grip === '2h' || grip === 'rng') {
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
          // 1-handed or light weapon
          // Unequip any equipped two-handed weapons or double wielded weapons
          pc.weapons.forEach(w => {
            if (w.grip === '2h' || w.grip === 'rng' || w.isDoubleWielded) {
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
  // Bug 2 Fix: validate prerequisites via the rules layer before adding
  const pc = getActivePC();
  if (!pc) return { success: false, error: 'Kein aktiver Charakter.' };

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

export function togglePCDefensiveFighting(active) {
  updatePCBatch(pc => {
    pc.isDefensiveFighting = !!active;
    if (pc.isDefensiveFighting) {
      pc.isTotalDefense = false;
    }
  });
}

export function togglePCTotalDefense(active) {
  updatePCBatch(pc => {
    pc.isTotalDefense = !!active;
    if (pc.isTotalDefense) {
      pc.isDefensiveFighting = false;
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

