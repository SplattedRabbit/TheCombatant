/**
 * @module    ConditionManager
 * @summary   Condition tracking, duration ticking, and damage/healing state modifiers.
 * @exports   toggleCondition, setConditionDuration, tickConditionTimers, applyDamage, applyTempHP
 * @reads     s.combatants
 * @stateOps  Mutates combatant hp, maxHP, conditions, activeBuffs, and fires hp_changed
 * @depends   state-core, StorageManager, EncounterManager
 */

import { getState, StateEvents } from './state-core.js';
import { saveToStorage } from './StorageManager.js';
import { triggerSync } from './EncounterManager.js';

export function toggleCondition(id, condName) {
  const s = getState();
  const c = s.combatants.find(x => x.id === id);
  if (!c) return;

  const idx = c.conditions.findIndex(x => x.n === condName);
  
  if (condName === 'Temp-HP') {
    if (idx >= 0) {
      const tmpVal = c.conditions[idx].tmpVal || 0;
      c.conditions.splice(idx, 1);
      c.maxHP = Math.max(1, c.maxHP - tmpVal);
      c.hp = Math.min(Math.max(-99, c.hp - tmpVal), c.maxHP);
      saveToStorage();
    }
    return;
  }

  if (idx >= 0) {
    c.conditions.splice(idx, 1);
  } else {
    c.conditions.push({ n: condName, dur: '' });
  }
  triggerSync(c);
}

export function setConditionDuration(id, condName, val) {
  const s = getState();
  const c = s.combatants.find(x => x.id === id);
  if (!c) return;

  const cond = c.conditions.find(x => x.n === condName);
  if (cond) {
    cond.dur = val !== '' ? parseInt(val) || 0 : '';
    triggerSync(c);
  }
}

export function tickConditionTimers() {
  const s = getState();
  s.combatants.forEach(c => {
    // 1. Tick conditions
    c.conditions.forEach(cd => {
      const d = parseInt(cd.dur);
      if (!isNaN(d) && d > 0) {
        cd.dur = d - 1;
      } else if (d === 0) {
        cd.dur = 0;
      }
    });

    // 2. Tick active buffs
    if (Array.isArray(c.activeBuffs)) {
      c.activeBuffs.forEach(buff => {
        if (typeof buff.durationRemainingRounds === 'number' && buff.durationRemainingRounds > 0) {
          buff.durationRemainingRounds--;
        }
      });

      const beforeLen = c.activeBuffs.length;
      c.activeBuffs = c.activeBuffs.filter(buff => {
        return buff.durationRemainingRounds === undefined || 
               buff.durationRemainingRounds === null || 
               buff.durationRemainingRounds > 0;
      });

      if (c.activeBuffs.length !== beforeLen) {
        if (typeof c.rebuildStatModifiers === 'function') {
          c.rebuildStatModifiers();
        }
      }
    }
  });
}

export function applyDamage(id, val, isHeal, isMagical = true) {
  const s = getState();
  const c = s.combatants.find(x => x.id === id);
  if (!c || val <= 0) return;

  const oldHP = c.hp;

  if (isHeal) {
    let finalHeal = val;
    if (isMagical && (c.race || '').toLowerCase() === 'anima_construct') {
      finalHeal = Math.floor(val / 2);
    }
    c.hp = Math.min(c.maxHP, c.hp + finalHeal);
  } else {
    const tmpCond = c.conditions.find(x => x.n === 'Temp-HP');
    if (tmpCond) {
      const shield = tmpCond.tmpVal || 0;
      if (val <= shield) {
        tmpCond.tmpVal -= val;
        c.hp -= val;
        if (tmpCond.tmpVal <= 0) {
          c.conditions = c.conditions.filter(x => x.n !== 'Temp-HP');
          c.maxHP = Math.max(1, c.maxHP - shield);
          c.hp = Math.min(c.hp, c.maxHP);
        }
      } else {
        const remaining = val - shield;
        c.conditions = c.conditions.filter(x => x.n !== 'Temp-HP');
        c.maxHP = Math.max(1, c.maxHP - shield);
        c.hp = Math.max(-99, c.hp - shield - remaining);
        c.hp = Math.min(c.hp, c.maxHP);
      }
    } else {
      c.hp = Math.max(-99, c.hp - val);
    }
  }

  const delta = c.hp - oldHP;
  if (delta !== 0) {
    StateEvents.emit('hp_changed', { id, delta, isHeal: delta > 0 });
  }

  triggerSync(c);
}

export function applyTempHP(id, val) {
  const s = getState();
  const c = s.combatants.find(x => x.id === id);
  if (!c || val <= 0) return;

  const existingIndex = c.conditions.findIndex(x => x.n === 'Temp-HP');
  if (existingIndex >= 0) {
    const oldVal = c.conditions[existingIndex].tmpVal || 0;
    c.conditions.splice(existingIndex, 1);
    c.maxHP = Math.max(1, c.maxHP - oldVal);
    c.hp = Math.min(c.hp, c.maxHP);
  }

  c.conditions.push({ n: 'Temp-HP', dur: '', tmpVal: val });
  c.maxHP += val;
  c.hp += val;
  triggerSync(c);
}
