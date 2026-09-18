import { Stat } from './Stat.js';
import { Weapon } from './Weapon.js';
import { Armor, isShieldItem, matchesShieldFeatOption } from './Armor.js';
import { Item } from './Item.js';
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
    version: '2.0.0',
    round: 1,
    activeId: null,
    combatants: [],
    concentrations: [],
    history: [],
    meta: {
      round: 1,
      activeCombatantId: null,
      dmStash: {
        weapons: [],
        armors: [],
        items: []
      },
      partyRoster: [],
      session: {
        id: null,
        code: null,
        active: false,
        role: null,
        roomCode: null,
        get activeSession() {
          return {
            id: this.id,
            code: this.code,
            active: this.active,
            role: this.role,
            roomCode: this.roomCode
          };
        }
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
  Armor,
  isShieldItem,
  matchesShieldFeatOption,
  Item,
  Combatant
};
