import { Stat } from './Stat.js';
import { Weapon } from './Weapon.js';
import { Combatant } from './Combatant.js';

const uid = () => {
  return Date.now() + '-' + Math.random().toString(36).slice(2, 7);
};

const createCombatant = (p = {}) => {
  return new Combatant(p);
};

const createConcentration = (p = {}) => {
  return {
    id: p.id || uid(),
    who: p.who || '',
    spell: p.spell || '',
    dur: parseInt(p.dur) || 0
  };
};

const createInitialState = () => {
  return {
    mode: 'choice', // 'choice', 'dm', 'player'
    meta: {
      begegnung: '',
      ort: '',
      xpBudget: '',
      xpVerteilt: '',
      sitzung: ''
    },
    combatants: [],
    turn: 0,
    round: 1,
    concentrations: [],
    session: {
      active: false,
      role: 'choice', // 'host' (DM) or 'client' (Player)
      roomCode: '',
      connections: [],
      toJSON() {
        return {
          active: this.active,
          role: this.role,
          roomCode: this.roomCode
        };
      }
    }
  };
};

export {
  uid,
  createCombatant,
  createConcentration,
  createInitialState,
  Stat,
  Weapon,
  Combatant
};
