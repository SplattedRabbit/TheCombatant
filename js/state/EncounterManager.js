import { getState, getActivePC, StateEvents } from './state-core.js';
import { saveToStorage } from './StorageManager.js';
import { createCombatant, createConcentration, Stat } from '../models/model-core.js';

function triggerSync(mutatedCombatant) {
  saveToStorage();
  StateEvents.emit('state_changed', getState());
  if (mutatedCombatant && mutatedCombatant.type === 'p') {
    StateEvents.emit('pc_changed', mutatedCombatant);
  }
}

export function updateMeta(key, val) {
  const s = getState();
  if (s.meta[key] !== undefined) {
    s.meta[key] = val;
    triggerSync();
  }
}

export function addCombatant(params) {
  const c = createCombatant(params);
  const s = getState();
  s.combatants.push(c);
  sortCombatants();
  triggerSync(c);
  return c;
}

export function removeCombatant(id) {
  const s = getState();
  s.combatants = s.combatants.filter(c => c.id !== id);
  if (s.turn >= s.combatants.length) {
    s.turn = 0;
  }
  triggerSync();
}

export function sortCombatants() {
  const s = getState();
  const activeId = s.combatants[s.turn] ? s.combatants[s.turn].id : null;
  s.combatants.sort((a, b) => b.init - a.init);
  if (activeId) {
    const newTurn = s.combatants.findIndex(x => x.id === activeId);
    if (newTurn !== -1) {
      s.turn = newTurn;
    }
  }
}

export function updateCombatantField(id, field, val) {
  const s = getState();
  const c = s.combatants.find(x => x.id === id);
  if (c && c[field] !== undefined) {
    c[field] = val;
    triggerSync(c);
  }
}

export function updateCombatantNumber(id, field, val) {
  const s = getState();
  const c = s.combatants.find(x => x.id === id);
  if (!c || c[field] === undefined) return;
  
  const num = parseInt(val) || 0;
  if (c[field] instanceof Stat) {
    const modifiers = c[field].getValue() - c[field].base;
    c[field].base = num - modifiers;
  } else {
    const oldVal = c[field];
    if (field === 'bw') {
      c.baseBw = num - ((c.bw || 30) - (c.baseBw || 30));
      c.bw = num;
      if (typeof c.rebuildStatModifiers === 'function') {
        c.rebuildStatModifiers();
      }
    } else {
      c[field] = num;
    }
    if (field === 'hp') {
      c[field] = Math.max(-99, Math.min(c.maxHP, c[field]));
      const delta = c.hp - oldVal;
      if (delta !== 0) {
        StateEvents.emit('hp_changed', { id, delta, isHeal: delta > 0 });
      }
    }
  }
  if (field === 'maxHP') {
    c.hp = Math.min(c.hp, c.maxHP);
  }
  triggerSync(c);
}

export function applyDamage(id, val, isHeal) {
  const s = getState();
  const c = s.combatants.find(x => x.id === id);
  if (!c || val <= 0) return;

  const oldHP = c.hp;

  if (isHeal) {
    c.hp = Math.min(c.maxHP, c.hp + val);
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

export function addConcentration(who, spell, dur) {
  if (!who || !spell) return;
  const conc = createConcentration({ who, spell, dur });
  const s = getState();
  s.concentrations.push(conc);
  triggerSync();
  return conc;
}

export function removeConcentration(id) {
  const s = getState();
  s.concentrations = s.concentrations.filter(c => c.id !== id);
  triggerSync();
}

export function updateConcentrationField(id, field, val) {
  const s = getState();
  const c = s.concentrations.find(x => x.id === id);
  if (c) {
    c[field] = field === 'dur' ? (parseInt(val) || 0) : val;
    triggerSync();
  }
}

export function nextTurn() {
  const s = getState();
  if (!s.combatants.length) return;
  s.turn = (s.turn + 1) % s.combatants.length;
  
  if (s.turn === 0) {
    s.round++;
    tickConditionTimers();
    s.concentrations.forEach(c => {
      if (c.dur > 0) c.dur--;
    });
  }
  triggerSync();
}

export function prevTurn() {
  const s = getState();
  if (!s.combatants.length) return;
  s.turn = (s.turn - 1 + s.combatants.length) % s.combatants.length;
  triggerSync();
}

export function nextRound() {
  const s = getState();
  s.round++;
  s.turn = 0;
  tickConditionTimers();
  s.concentrations.forEach(c => {
    if (c.dur > 0) c.dur--;
  });
  triggerSync();
}

export function resetCombat() {
  const s = getState();
  s.turn = 0;
  s.round = 1;
  triggerSync();
}

export function importEncounterState(loadedState, isNetworkSync = false) {
  const s = getState();
  
  if (s.session && s.session.role === 'client') {
    if (isNetworkSync) {
      let localPC = s.combatants.find(c => c.type === 'p');
      
      s.meta = { ...s.meta, ...(loadedState.meta || {}) };
      s.combatants = (loadedState.combatants || []).map(c => createCombatant(c));
      s.turn = typeof loadedState.turn === 'number' ? loadedState.turn : 0;
      s.round = typeof loadedState.round === 'number' ? loadedState.round : 1;
      s.concentrations = (loadedState.concentrations || []).map(c => createConcentration(c));
      
      if (localPC && !s.combatants.some(c => c.id === localPC.id)) {
        s.combatants.push(localPC);
        StateEvents.emit('pc_changed', localPC);
      }
      triggerSync();
    } else {
      const importedPC = (loadedState.combatants || []).find(c => c.type === 'p');
      if (importedPC) {
        const currentPC = getActivePC();
        if (currentPC) {
          const currentId = currentPC.id;
          
          Object.keys(currentPC).forEach(key => {
            if (key !== 'id') {
              delete currentPC[key];
            }
          });
          
          const newPC = createCombatant(importedPC);
          Object.assign(currentPC, newPC);
          currentPC.id = currentId;
          
          if (typeof currentPC.rebuildStatModifiers === 'function') {
            currentPC.rebuildStatModifiers();
          }
          saveToStorage();
          StateEvents.emit('pc_changed', currentPC, { forceFullSync: true });
          StateEvents.emit('state_changed', s);
        }
      }
    }
  } else {
    s.meta = { ...s.meta, ...(loadedState.meta || {}) };
    s.combatants = (loadedState.combatants || []).map(c => createCombatant(c));
    s.turn = typeof loadedState.turn === 'number' ? loadedState.turn : 0;
    s.round = typeof loadedState.round === 'number' ? loadedState.round : 1;
    s.concentrations = (loadedState.concentrations || []).map(c => createConcentration(c));
    triggerSync();
  }
}

export function mergeIncomingPC(pcData) {
  const s = getState();
  const idx = s.combatants.findIndex(x => x.id === pcData.id);
  if (idx !== -1) {
    s.combatants[idx] = createCombatant(pcData);
    sortCombatants();
    saveToStorage();
    return true;
  } else {
    s.combatants.push(createCombatant(pcData));
    sortCombatants();
    saveToStorage();
    return true;
  }
}

export function loadSampleData() {
  const s = getState();
  
  if (s.session && s.session.role === 'client') {
    const currentPC = getActivePC();
    if (currentPC) {
      const currentId = currentPC.id;
      
      Object.keys(currentPC).forEach(key => {
        if (key !== 'id') {
          delete currentPC[key];
        }
      });
      
      const aranisSample = {
        name: 'Aranis Silberklinge',
        init: 6,
        hp: 34,
        maxHP: 34,
        ac: 18,
        acTouch: 12,
        acFlat: 16,
        bw: 30,
        za: 4,
        ref: 3,
        wil: 2,
        type: 'p',
        str: 16,
        dex: 14,
        con: 12,
        int: 10,
        wis: 12,
        cha: 14,
        baseZa: 3,
        baseRef: 1,
        baseWil: 1,
        iniMisc: 4,
        bab: 3,
        classType: 'paladin',
        level: 3,
        classes: [{ classType: 'paladin', level: 3 }],
        weapons: [
          { name: 'Meisterwerk-Langschwert +1', attackBonus: '', damageDice: '1w8', crit: '19-20 / x2', grip: '1h', enhancement: 1 },
          { name: 'Langbogen', attackBonus: '', damageDice: '1w8', crit: 'x3', grip: 'rng', enhancement: 0 }
        ],
        spellSlots: {
          1: { max: 1, used: 0 }
        },
        dailyAbilities: [
          { name: 'Hände auflegen', max: 10, used: 2 },
          { name: 'Böses niederstrecken', max: 2, used: 0 }
        ]
      };
      
      const newPC = createCombatant(aranisSample);
      Object.assign(currentPC, newPC);
      currentPC.id = currentId;
      
      if (typeof currentPC.rebuildStatModifiers === 'function') {
        currentPC.rebuildStatModifiers();
      }
      
      saveToStorage();
      StateEvents.emit('pc_changed', currentPC, { forceFullSync: true });
      StateEvents.emit('state_changed', s);
    }
    return;
  }

  s.combatants = [];
  s.turn = 0;
  s.round = 1;
  s.concentrations = [
    createConcentration({ who: 'Lysara', spell: 'Magiepfeil (Fokus)', dur: 0 }),
    createConcentration({ who: 'Goblin-Schamane', spell: 'Dornenwuchs', dur: 3 })
  ];

  const samples = [
    {
      name: 'Aranis Silberklinge',
      init: 6,
      hp: 34,
      maxHP: 34,
      ac: 18,
      acTouch: 12,
      acFlat: 16,
      bw: 30,
      za: 4,
      ref: 3,
      wil: 2,
      type: 'p',
      str: 16,
      dex: 14,
      con: 12,
      int: 10,
      wis: 12,
      cha: 14,
      baseZa: 3,
      baseRef: 1,
      baseWil: 1,
      iniMisc: 4,
      bab: 3,
      classType: 'paladin',
      level: 3,
      classes: [{ classType: 'paladin', level: 3 }],
      weapons: [
        { name: 'Meisterwerk-Langschwert +1', attackBonus: '', damageDice: '1w8', crit: '19-20 / x2', grip: '1h', enhancement: 1 },
        { name: 'Langbogen', attackBonus: '', damageDice: '1w8', crit: 'x3', grip: 'rng', enhancement: 0 }
      ],
      spellSlots: {
        1: { max: 1, used: 0 }
      },
      dailyAbilities: [
        { name: 'Hände auflegen', max: 10, used: 2 },
        { name: 'Böses niederstrecken', max: 2, used: 0 }
      ]
    },
    {
      name: 'Morgwen Hüterin',
      init: 0,
      hp: 22,
      maxHP: 28,
      ac: 15,
      acTouch: 10,
      acFlat: 15,
      bw: 30,
      za: 5,
      ref: 0,
      wil: 6,
      type: 'p',
      str: 12,
      dex: 10,
      con: 14,
      int: 12,
      wis: 16,
      cha: 14,
      baseZa: 3,
      baseRef: 0,
      baseWil: 3,
      iniMisc: 0,
      bab: 2,
      classType: 'cleric',
      level: 3,
      classes: [{ classType: 'cleric', level: 3 }],
      weapons: [
        { name: 'Streitkolben', attackBonus: '', damageDice: '1w8', crit: 'x2', grip: '1h', enhancement: 0 }
      ],
      spellSlots: {
        1: { max: 3, used: 1 },
        2: { max: 2, used: 0 }
      },
      dailyAbilities: [
        { name: 'Untote vertreiben', max: 5, used: 1 }
      ],
      conditions: [{ n: 'Erschüttert', dur: 2 }]
    },
    {
      name: 'Thordak Eisenfaust',
      init: 1,
      hp: 52,
      maxHP: 52,
      ac: 20,
      acTouch: 11,
      acFlat: 19,
      bw: 20,
      za: 8,
      ref: 2,
      wil: 2,
      type: 'p',
      str: 18,
      dex: 12,
      con: 16,
      int: 10,
      wis: 12,
      cha: 8,
      baseZa: 5,
      baseRef: 1,
      baseWil: 1,
      iniMisc: 0,
      bab: 4,
      classType: 'multiclass',
      level: 4,
      classes: [
        { classType: 'fighter', level: 3 },
        { classType: 'barbarian', level: 1 }
      ],
      weapons: [
        { name: 'Zweihändige Streitaxt +1', attackBonus: '', damageDice: '1w12', crit: 'x3', grip: '2h', enhancement: 1 }
      ],
      dailyAbilities: [
        { name: 'Kampfrausch (Rage)', max: 2, used: 1 }
      ]
    },
    {
      name: 'Lysara d. Mystikerin',
      init: 6,
      hp: 18,
      maxHP: 18,
      ac: 13,
      acTouch: 12,
      acFlat: 11,
      bw: 30,
      za: 2,
      ref: 3,
      wil: 5,
      type: 'p',
      str: 8,
      dex: 14,
      con: 12,
      int: 18,
      wis: 12,
      cha: 10,
      baseZa: 1,
      baseRef: 1,
      baseWil: 4,
      iniMisc: 4,
      bab: 1,
      classType: 'wizard',
      level: 3,
      classes: [{ classType: 'wizard', level: 3 }],
      weapons: [
        { name: 'Dolch', attackBonus: '', damageDice: '1w4', crit: '19-20 / x2', grip: '1h', enhancement: 0 },
        { name: 'Leichte Armbrust', attackBonus: '', damageDice: '1w8', crit: '19-20 / x2', grip: 'rng', enhancement: 0 }
      ],
      spellSlots: {
        1: { max: 4, used: 2 },
        2: { max: 3, used: 1 },
        3: { max: 2, used: 0 }
      }
    },
    { name: 'Goblin-Hauptmann', init: 14, hp: 16, ac: 15, bw: 30, za: 1, ref: 2, wil: 1, type: 'e' },
    { name: 'Goblin Bogenschütz.1', init: 10, hp: 8, ac: 13, bw: 30, za: 0, ref: 2, wil: 0, type: 'e', conditions: [{ n: 'Blind', dur: 0 }] },
    { name: 'Goblin Bogenschütz.2', init: 10, hp: 3, maxHP: 8, ac: 13, bw: 30, za: 0, ref: 2, wil: 0, type: 'e' },
    { name: 'Warg', init: 6, hp: 20, ac: 14, bw: 50, za: 3, ref: 2, wil: 1, type: 'e' },
    { name: 'Goblin-Schamane', init: 9, hp: 12, ac: 12, bw: 30, za: 2, ref: 1, wil: 4, type: 'n', conditions: [{ n: 'Erschöpft', dur: 0 }] }
  ];

  samples.forEach(samp => {
    s.combatants.push(createCombatant(samp));
  });

  sortCombatants();
  triggerSync();

  const activePC = s.combatants.find(c => c.type === 'p');
  if (activePC) {
    StateEvents.emit('pc_changed', activePC);
  }
}
