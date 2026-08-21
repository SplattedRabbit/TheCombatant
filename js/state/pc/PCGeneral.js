/**
 * @module    PCGeneral
 * @summary   Core stats calculations, batch mutations, synchronization, and general fields for Player Character.
 * @exports   recalculateDailyAbilities, recalculatePCStats, syncPCToHost, updatePCBatch, clearActivePC, updatePCField, updatePCNumber, togglePCDefensiveFighting, togglePCTotalDefense
 */

import { getState, getActivePC, StateEvents } from '../state-core.js';
import { saveToStorage } from '../StorageManager.js';
import { Stat, createCombatant } from '../../models/model-core.js';
import { BABCalculator } from '../../rules/BABCalculator.js';
import { SaveCalculator } from '../../rules/SaveCalculator.js';
import { SpellSlotCalculator } from '../../rules/SpellSlotCalculator.js';

// Import Class Rules
import { BarbarianRules } from '../../rules/classes/BarbarianRules.js';
import { PaladinRules } from '../../rules/classes/PaladinRules.js';
import { ClericRules } from '../../rules/classes/ClericRules.js';
import { BardRules } from '../../rules/classes/BardRules.js';
import { DruidRules } from '../../rules/classes/DruidRules.js';
import { MonkRules } from '../../rules/classes/MonkRules.js';
import { WizardRules } from '../../rules/classes/WizardRules.js';
import { SorcererRules } from '../../rules/classes/SorcererRules.js';
import { RangerRules } from '../../rules/classes/RangerRules.js';
import { RogueRules } from '../../rules/classes/RogueRules.js';

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

  if (hasClasses) {
    const sw = pc.classes.find(c => c.classType === 'spellwarp_sniper');
    if (sw && sw.level >= 5) {
      const hasEmpower = pc.dailyAbilities.some(a => a.name === "Ray Mastery: Empower");
      if (!hasEmpower) {
        pc.dailyAbilities.push({ name: "Ray Mastery: Empower", max: 1, used: 0 });
      }
    }
  }

  // Apply feats modifications on daily resources
  if (Array.isArray(pc.feats)) {
    const extraTurningCount = pc.feats.filter(f => f.id === 'extra_turning').length;
    if (extraTurningCount > 0) {
      let turnAbility = pc.dailyAbilities.find(a => a.name === "Untote vertreiben" || a.name === "Turn Undead");
      if (turnAbility) {
        turnAbility.max += extraTurningCount * 4;
      }
    }

    const extraMusicCount = pc.feats.filter(f => f.id === 'extra_music').length;
    if (extraMusicCount > 0) {
      let musicAbility = pc.dailyAbilities.find(a => a.name === "Bardisches Lied" || a.name === "Bardic Music");
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

  if (typeof pc.rebuildStatModifiers === 'function') {
    pc.rebuildStatModifiers();
  }

  recalculateDailyAbilities(pc);
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
