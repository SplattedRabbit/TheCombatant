/**
 * @module    classProfiles
 * @summary   Static D&D 3.5e class profiles detailing class-specific resource pools (rage, smite, turn undead, etc.).
 * @feature   rules
 * @exports   CLASS_PROFILES
 */

export const CLASS_PROFILES = {
  barbarian: {
    nameDe: "Barbarian",
    getResources(level, stats) {
      return [
        {
          key: "rage",
          name: "Rage",
          max: 1 + Math.floor(level / 4),
          type: "daily"
        }
      ];
    }
  },
  paladin: {
    nameDe: "Paladin",
    getResources(level, stats) {
      const score = stats.cha ? stats.cha.getValue() : 10;
      const chaMod = Math.floor((score - 10) / 2);
      return [
        {
          key: "smite_evil",
          name: "Smite Evil",
          max: 1 + Math.floor((level - 1) / 5),
          type: "daily"
        },
        {
          key: "lay_on_hands",
          name: "Lay on Hands (Pool)",
          max: Math.max(0, level * chaMod),
          type: "pool"
        }
      ];
    }
  },
  cleric: {
    nameDe: "Cleric",
    getResources(level, stats) {
      const score = stats.cha ? stats.cha.getValue() : 10;
      const chaMod = Math.floor((score - 10) / 2);
      return [
        {
          key: "turn_undead",
          name: "Turn Undead",
          max: Math.max(1, 3 + chaMod),
          type: "daily"
        }
      ];
    }
  },
  bard: {
    nameDe: "Bard",
    getResources(level, stats) {
      return [
        {
          key: "bardic_music",
          name: "Bardic Music",
          max: level,
          type: "daily"
        }
      ];
    }
  },
  druid: {
    nameDe: "Druid",
    getResources(level, stats) {
      let maxWildShape = 0;
      if (level >= 18) maxWildShape = 6;
      else if (level >= 14) maxWildShape = 5;
      else if (level >= 10) maxWildShape = 4;
      else if (level >= 7) maxWildShape = 3;
      else if (level >= 6) maxWildShape = 2;
      else if (level >= 5) maxWildShape = 1;

      const res = [];
      if (maxWildShape > 0) {
        res.push({
          key: "wild_shape",
          name: "Wild Shape",
          max: maxWildShape,
          type: "daily"
        });
      }
      return res;
    }
  },
  knight: {
    nameDe: 'Knight',
    getResources(level, stats) {
      const score = stats.cha ? stats.cha.getValue() : 10;
      const chaMod = Math.floor((score - 10) / 2);
      return [
        {
          key: 'knights_challenge',
          name: "Knight's Challenge",
          max: Math.max(1, 3 + chaMod),
          type: 'daily'
        }
      ];
    }
  },
  ninja: {
    nameDe: 'Ninja',
    getResources(level, stats) {
      const score = stats.wis ? stats.wis.getValue() : 10;
      const wisMod = Math.floor((score - 10) / 2);
      return [
        {
          key: 'ki_power',
          name: 'Ki Power',
          max: Math.max(1, Math.floor(level / 2)) + Math.max(0, wisMod),
          type: 'daily'
        }
      ];
    }
  },
  dragon_shaman: {
    nameDe: 'Dragon Shaman',
    getResources(level, stats) {
      // Dragon Shamans breathe weapon: 3+Con-Mod/day from level 4
      if (level < 4) return [];
      const score = stats.con ? stats.con.getValue() : 10;
      const conMod = Math.floor((score - 10) / 2);
      return [
        {
          key: 'breath_weapon',
          name: 'Breath Weapon',
          max: Math.max(1, 3 + conMod),
          type: 'daily'
        }
      ];
    }
  }
};
