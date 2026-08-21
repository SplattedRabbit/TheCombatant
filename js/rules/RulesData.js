/**
 * @module    RulesData
 * @summary   Static D&D 3.5e rule registries: conditions, classes, skills, profiles, and spell progression tables.
 * @exports   CONDITIONS, CLASSES, CLASS_SKILLS, CLASS_PROFILES, CLASS_BASE_SKILLS, WIZ_CLER_DRU_TABLE, SORCERER_TABLE, BARD_TABLE, PALADIN_RANGER_TABLE, SORCERER_KNOWN_TABLE, BARD_KNOWN_TABLE, ASSASSIN_TABLE
 */


export const CONDITIONS = [
  {
    n: 'Temp HP',
    r: '<strong>Temporary Hit Points</strong> are added to maximum HP. Damage is subtracted from current HP as normal. Removing the condition subtracts the temporary hit points from maximum HP (current HP is capped accordingly).'
  },
  {
    n: 'Blinded',
    r: '<strong>−2 to attack rolls</strong> and Armor Class (AC). Enemies are treated as having total concealment (50% miss chance). Move at half speed. Immune to gaze attacks.'
  },
  {
    n: 'Stunned',
    r: 'Cannot <strong>take actions</strong>, drops held items. Loses Dex bonus to AC. Attackers gain a +2 bonus on attack rolls.'
  },
  {
    n: 'Exhausted',
    r: '<strong>−6 to Strength and Dexterity</strong>, movement speed halved. Cannot run or charge. Resting 1 hour cures to Shaken/Fatigued.'
  },
  {
    n: 'Shaken',
    r: '<strong>−2 to attack rolls, saving throws, ability checks</strong>, and spell attack rolls. Mild form of fear.'
  },
  {
    n: 'Pinned',
    r: '<strong>Speed 0</strong>, loses Dex bonus to AC. −4 to AC. Ranged attacks against them gain +4. Can take only limited actions.'
  },
  {
    n: 'Prone',
    r: '<strong>−4 to melee attack rolls</strong>. Melee attacks against them gain +4, ranged attacks suffer −4. Standing up costs a move action (can provoke attacks of opportunity).'
  },
  {
    n: 'Paralyzed',
    r: '<strong>Strength and Dexterity effectively 0</strong>. Cannot move or act. Falls down if standing. Target is helpless.'
  },
  {
    n: 'Helpless',
    r: 'AC is <strong>5 + size modifier</strong>. Attackers can perform a <strong>coup de grace</strong> (full-round action, Fortitude save DC 10 + damage dealt or instant death). Bound, unconscious, or sleeping targets are helpless.'
  },
  {
    n: 'Sickened',
    r: '<strong>−4 to Strength and Constitution</strong>. Reduced HP from Con loss takes effect immediately. Rest and healing spells can help.'
  },
  {
    n: 'Knocked Down',
    r: 'Must spend a <strong>move action to stand up</strong> (provokes attacks of opportunity). Can fight while prone (−4 to attacks). Can combine with Prone.'
  },
  {
    n: 'Panicked',
    r: '<strong>Must flee</strong> from danger if possible. −2 to attack rolls, saving throws, and ability checks. Can only run or fight if cornered. Stronger than Frightened.'
  },
  {
    n: 'Paralyzed (Magic/Poison)',
    r: '<strong>Strength and Dexterity effectively 0</strong>, cannot act. Similar to Paralyzed, but typical for spells or poisons. Target is helpless.'
  },
  {
    n: 'Sleeping',
    r: '<strong>Helpless</strong>. Normal noise or damage wakes them. Attackers automatically land critical hits (coup de grace). Loses Dex bonus to AC.'
  },
  {
    n: 'Shaking',
    r: '<strong>−2 to attack rolls, saving throws, and skill checks</strong>. Similar to Shaken, but triggered by fright or intimidation.'
  },
  {
    n: 'Dying',
    r: '<strong>Unconscious</strong>, automatically loses 1 hit point per round. D10 roll at the end of turn: 10 = stabilize. Stabilized = no further HP loss, but still unconscious.'
  },
  {
    n: 'Deafened',
    r: 'Cannot <strong>hear acoustic signals</strong>. <strong>20% spell failure chance</strong> for verbal components. Miscast check (Fortitude DC 20 + spell level).'
  },
  {
    n: 'Dead',
    r: 'At <strong>−10 HP or lower</strong>, or from death effects. Can only be brought back by <em>Raise Dead</em>, <em>Resurrection</em>, or <em>True Resurrection</em>.'
  },
  {
    n: 'Surprised',
    r: 'Loses the <strong>first round</strong> completely (no actions, no attacks of opportunity). Loses Dex bonus to AC in the surprise round.'
  },
  {
    n: 'Disabled',
    r: 'Similar to unconscious, but due to <strong>nonlethal damage</strong>. Recovers 1 HP/hour or through healing. Treated as helpless.'
  },
  {
    n: 'Frightened',
    r: '<strong>−2 to attack rolls and saving throws</strong>. Must avoid the source of fear, flees if possible. Can fight if unable to flee. Weaker than Panicked.'
  },
  {
    n: 'Confused',
    r: 'Roll <strong>d100</strong> at start of turn: 01–10 act normally, 11–20 do nothing, 21–50 helpless, 51–70 attack nearest creature, 71–100 attack self.'
  },
  {
    n: 'Charmed',
    r: 'Treats the <strong>caster as a friend</strong> and trusted ally. Will not attack them. Specific effects depend on the spell (e.g. <em>Charm Person</em>, <em>Dominate Person</em>).'
  }
];

export const CLASSES = [
  { key: 'fighter', nameDe: 'Fighter', nameEn: 'Fighter', bab: 'good', saves: { fort: 'good', ref: 'poor', wil: 'poor' } },
  { key: 'cleric', nameDe: 'Cleric', nameEn: 'Cleric', bab: 'avg',  saves: { fort: 'good', ref: 'poor', wil: 'good' } },
  { key: 'rogue', nameDe: 'Rogue', nameEn: 'Rogue', bab: 'avg',  saves: { fort: 'poor', ref: 'good', wil: 'poor' } },
  { key: 'wizard', nameDe: 'Wizard', nameEn: 'Wizard', bab: 'poor',  saves: { fort: 'poor', ref: 'poor', wil: 'good' } },
  { key: 'barbarian', nameDe: 'Barbarian', nameEn: 'Barbarian', bab: 'good', saves: { fort: 'good', ref: 'poor', wil: 'poor' } },
  { key: 'bard', nameDe: 'Bard', nameEn: 'Bard', bab: 'avg',  saves: { fort: 'poor', ref: 'good', wil: 'good' } },
  { key: 'druid', nameDe: 'Druid', nameEn: 'Druid', bab: 'avg',  saves: { fort: 'good', ref: 'poor', wil: 'good' } },
  { key: 'monk', nameDe: 'Monk', nameEn: 'Monk', bab: 'avg',  saves: { fort: 'good', ref: 'good', wil: 'good' } },
  { key: 'paladin', nameDe: 'Paladin', nameEn: 'Paladin', bab: 'good', saves: { fort: 'good', ref: 'poor', wil: 'poor' } },
  { key: 'ranger', nameDe: 'Ranger', nameEn: 'Ranger', bab: 'good', saves: { fort: 'good', ref: 'good', wil: 'poor' } },
  { key: 'sorcerer', nameDe: 'Sorcerer', nameEn: 'Sorcerer', bab: 'poor', saves: { fort: 'poor', ref: 'poor', wil: 'good' } },
  {
    key: 'mystic_theurge',
    nameDe: 'Mystischer Theurge',
    nameEn: 'Mystic Theurge',
    isPrestige: true,
    bab: 'poor',
    saves: { fort: 'poor', ref: 'poor', wil: 'good' },
    spellcastingBonus: true,
    prerequisites: {
      skills: { knowledge_arcana: 6, knowledge_religion: 6 },
      spells: { arcane: 2, divine: 2 }
    }
  },
  {
    key: 'arcane_trickster',
    nameDe: 'Arkaner Trickser',
    nameEn: 'Arcane Trickster',
    isPrestige: true,
    bab: 'poor',
    saves: { fort: 'poor', ref: 'good', wil: 'good' },
    spellcastingBonus: true,
    prerequisites: {
      alignment: 'nonlawful',
      skills: { decipher_script: 7, disable_device: 7, escape_artist: 7, knowledge_arcana: 4 },
      spells: { arcane: 3, mage_hand: true },
      special: { sneak_attack: 2 }
    }
  },
  {
    key: 'dragon_disciple',
    nameDe: 'Drachen-Jünger',
    nameEn: 'Dragon Disciple',
    isPrestige: true,
    bab: 'avg',
    saves: { fort: 'good', ref: 'poor', wil: 'good' },
    spellcastingBonus: false,
    prerequisites: {
      race: 'nondragon',
      skills: { knowledge_arcana: 8 },
      languages: ['draconic'],
      spells: { spontaneousArcane: true }
    }
  },
  {
    key: 'assassin',
    nameDe: 'Assassine',
    nameEn: 'Assassin',
    isPrestige: true,
    bab: 'avg',
    saves: { fort: 'poor', ref: 'good', wil: 'poor' },
    spellcastingBonus: false,
    prerequisites: {
      alignment: 'evil',
      skills: { disguise: 4, hide: 8, move_silently: 8 },
      specialText: 'Must kill someone for no other reason than to join.'
    }
  },

  // Complete Scoundrel — small pilot of two PrCs requested by the user
  {
    key: 'spellwarp_sniper',
    nameDe: 'Spellwarp Sniper',
    nameEn: 'Spellwarp Sniper',
    isPrestige: true,
    bab: 'poor',
    saves: { fort: 'poor', ref: 'good', wil: 'good' },
    spellcastingBonus: true,
    prerequisites: {
      skills: { concentration: 8, spellcraft: 8 },
      feats: ['point_blank_shot'],
      spells: { arcane: 3 },
      // The book says "Sneak attack or sudden strike +1d6"; we represent the mechanical requirement as sneak attack +1d6.
      special: { sneak_attack: 1 }
    }
  },

  {
    key: 'battle_trickster',
    nameDe: 'Battle Trickster',
    nameEn: 'Battle Trickster',
    isPrestige: true,
    bab: 'avg',
    saves: { fort: 'good', ref: 'good', wil: 'poor' },
    spellcastingBonus: false,
    prerequisites: {
      bab: 5,
      // Requirements are not easily machine-checkable: "Any three skills 6 ranks each" and "Skill Tricks: Any two".
      // We surface these as a free-text specialText requirement so the UI can present a confirmation dialog.
      specialText: 'Skills: Any three skills with 6 ranks each. Skill Tricks: Any two.'
    }
  },

  { key: 'custom', nameDe: 'Custom', nameEn: 'Custom', bab: 'custom', saves: { fort: 'custom', ref: 'custom', wil: 'custom' } }
];



export const CLASS_SKILLS = {
  barbarian: ['climb', 'craft', 'handle_animal', 'intimidate', 'jump', 'listen', 'ride', 'survival', 'swim'],
  bard: [
    'appraise', 'balance', 'bluff', 'climb', 'concentration', 'craft', 'decipher_script', 'diplomacy',
    'disguise', 'escape_artist', 'gather_information', 'hide', 'jump', 'knowledge_arcana', 'knowledge_dungeons',
    'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_planes', 'knowledge_religion',
    'knowledge_other', 'listen', 'move_silently', 'perform', 'profession', 'sense_motive', 'sleight_of_hand',
    'spellcraft', 'tumble', 'use_magic_device', 'use_rope'
  ],
  cleric: ['concentration', 'craft', 'diplomacy', 'heal', 'knowledge_arcana', 'knowledge_history', 'knowledge_religion', 'knowledge_planes', 'profession', 'spellcraft'],
  druid: ['concentration', 'craft', 'diplomacy', 'handle_animal', 'heal', 'knowledge_nature', 'knowledge_other', 'listen', 'profession', 'ride', 'spellcraft', 'spot', 'survival', 'swim'],
  fighter: ['climb', 'craft', 'handle_animal', 'intimidate', 'jump', 'ride', 'swim'],
  monk: ['balance', 'climb', 'concentration', 'craft', 'diplomacy', 'escape_artist', 'hide', 'jump', 'knowledge_arcana', 'knowledge_religion', 'listen', 'move_silently', 'perform', 'profession', 'sense_motive', 'spot', 'tumble', 'swim'],
  paladin: ['concentration', 'craft', 'diplomacy', 'handle_animal', 'heal', 'knowledge_religion', 'knowledge_other', 'profession', 'ride'],
  ranger: ['climb', 'concentration', 'craft', 'handle_animal', 'heal', 'hide', 'jump', 'knowledge_dungeons', 'knowledge_nature', 'listen', 'move_silently', 'ride', 'search', 'spot', 'survival', 'swim', 'use_rope'],
  rogue: [
    'appraise', 'balance', 'bluff', 'climb', 'craft', 'decipher_script', 'diplomacy', 'disable_device',
    'disguise', 'escape_artist', 'forgery', 'gather_information', 'hide', 'intimidate', 'jump',
    'knowledge_local', 'listen', 'move_silently', 'open_lock', 'perform', 'profession', 'search',
    'sense_motive', 'sleight_of_hand', 'spot', 'tumble', 'use_magic_device', 'use_rope'
  ],
  sorcerer: ['concentration', 'craft', 'knowledge_arcana', 'profession', 'spellcraft'],
  wizard: [
    'concentration', 'craft', 'decipher_script', 'knowledge_arcana', 'knowledge_dungeons',
    'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_planes',
    'knowledge_religion', 'knowledge_other', 'profession', 'spellcraft'
  ],
  mystic_theurge: [
    'concentration', 'craft', 'decipher_script', 'knowledge_arcana', 'knowledge_religion', 'profession', 'sense_motive', 'spellcraft'
  ],
  arcane_trickster: [
    'appraise', 'balance', 'bluff', 'climb', 'concentration', 'craft', 'decipher_script', 'diplomacy', 'disable_device',
    'disguise', 'escape_artist', 'gather_information', 'hide', 'jump', 'knowledge_arcana', 'listen', 'move_silently',
    'open_lock', 'profession', 'sense_motive', 'search', 'sleight_of_hand', 'spellcraft', 'spot', 'swim', 'tumble', 'use_rope'
  ],
  dragon_disciple: [
    'concentration', 'craft', 'diplomacy', 'escape_artist', 'gather_information',
    'knowledge_arcana', 'knowledge_dungeons', 'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_planes', 'knowledge_religion', 'knowledge_other',
    'listen', 'profession', 'search', 'spellcraft', 'spot'
  ],
  assassin: [
    'balance', 'bluff', 'climb', 'craft', 'decipher_script', 'diplomacy', 'disable_device', 'disguise',
    'escape_artist', 'forgery', 'gather_information', 'hide', 'intimidate', 'jump', 'listen',
    'move_silently', 'open_lock', 'search', 'sense_motive', 'sleight_of_hand', 'spot', 'swim', 'tumble', 'use_magic_device', 'use_rope'
  ]
};



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
  }
};

export const CLASS_BASE_SKILLS = {
  barbarian: 4,
  bard: 6,
  cleric: 2,
  druid: 4,
  fighter: 2,
  monk: 4,
  paladin: 2,
  ranger: 6,
  rogue: 8,
  sorcerer: 2,
  wizard: 2,
  custom: 2
};

export const WIZ_CLER_DRU_TABLE = {
  1:  [3, 1],
  2:  [4, 2],
  3:  [4, 2, 1],
  4:  [4, 3, 2],
  5:  [4, 3, 2, 1],
  6:  [4, 3, 3, 2],
  7:  [4, 4, 3, 2, 1],
  8:  [4, 4, 3, 3, 2],
  9:  [4, 4, 4, 3, 2, 1],
  10: [4, 4, 4, 3, 3, 2],
  11: [4, 4, 4, 4, 3, 2, 1],
  12: [4, 4, 4, 4, 3, 3, 2],
  13: [4, 4, 4, 4, 4, 3, 2, 1],
  14: [4, 4, 4, 4, 4, 3, 3, 2],
  15: [4, 4, 4, 4, 4, 4, 3, 2, 1],
  16: [4, 4, 4, 4, 4, 4, 3, 3, 2],
  17: [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],
  18: [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],
  19: [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],
  20: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
};

export const SORCERER_TABLE = {
  1:  [5, 3],
  2:  [6, 4],
  3:  [6, 5],
  4:  [6, 6, 3],
  5:  [6, 6, 4],
  6:  [6, 6, 5, 3],
  7:  [6, 6, 6, 4],
  8:  [6, 6, 6, 5, 3],
  9:  [6, 6, 6, 6, 4],
  10: [6, 6, 6, 6, 5, 3],
  11: [6, 6, 6, 6, 6, 4],
  12: [6, 6, 6, 6, 6, 5, 3],
  13: [6, 6, 6, 6, 6, 6, 4],
  14: [6, 6, 6, 6, 6, 6, 5, 3],
  15: [6, 6, 6, 6, 6, 6, 6, 4],
  16: [6, 6, 6, 6, 6, 6, 6, 5, 3],
  17: [6, 6, 6, 6, 6, 6, 6, 6, 4],
  18: [6, 6, 6, 6, 6, 6, 6, 6, 5, 3],
  19: [6, 6, 6, 6, 6, 6, 6, 6, 6, 4],
  20: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6]
};

export const BARD_TABLE = {
  1:  [2],
  2:  [3, 0],
  3:  [3, 1],
  4:  [3, 2, 0],
  5:  [3, 3, 1],
  6:  [3, 3, 2],
  7:  [3, 3, 2, 0],
  8:  [3, 3, 3, 1],
  9:  [3, 3, 3, 2],
  10: [3, 3, 3, 2, 0],
  11: [3, 3, 3, 3, 1],
  12: [3, 3, 3, 3, 2],
  13: [3, 3, 3, 3, 2, 0],
  14: [3, 3, 3, 3, 3, 1],
  15: [3, 3, 3, 3, 3, 2],
  16: [3, 3, 3, 3, 3, 2, 0],
  17: [3, 3, 3, 3, 3, 3, 1],
  18: [3, 3, 3, 3, 3, 3, 2],
  19: [3, 3, 3, 3, 3, 3, 3],
  20: [3, 3, 3, 3, 3, 3, 3]
};

export const PALADIN_RANGER_TABLE = {
  1:  [],
  2:  [],
  3:  [],
  4:  [0, 0],
  5:  [0, 0],
  6:  [0, 1],
  7:  [0, 1],
  8:  [0, 1, 0],
  9:  [0, 1, 0],
  10: [0, 1, 1],
  11: [0, 1, 1, 0],
  12: [0, 1, 1, 1],
  13: [0, 1, 1, 1],
  14: [0, 2, 1, 1, 0],
  15: [0, 2, 1, 1, 1],
  16: [0, 2, 2, 1, 1],
  17: [0, 2, 2, 2, 1],
  18: [0, 3, 2, 2, 1],
  19: [0, 3, 3, 3, 2],
  20: [0, 3, 3, 3, 3]
};

export const SORCERER_KNOWN_TABLE = {
  1:  [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [5, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  4:  [6, 3, 1, 0, 0, 0, 0, 0, 0, 0],
  5:  [6, 4, 2, 0, 0, 0, 0, 0, 0, 0],
  6:  [7, 4, 2, 1, 0, 0, 0, 0, 0, 0],
  7:  [7, 5, 3, 2, 0, 0, 0, 0, 0, 0],
  8:  [8, 5, 3, 2, 1, 0, 0, 0, 0, 0],
  9:  [8, 5, 4, 3, 2, 0, 0, 0, 0, 0],
  10: [9, 5, 4, 3, 2, 1, 0, 0, 0, 0],
  11: [9, 5, 5, 4, 3, 2, 0, 0, 0, 0],
  12: [9, 5, 5, 4, 3, 2, 1, 0, 0, 0],
  13: [9, 5, 5, 4, 4, 3, 2, 0, 0, 0],
  14: [9, 5, 5, 4, 4, 3, 2, 1, 0, 0],
  15: [9, 5, 5, 4, 4, 4, 3, 2, 0, 0],
  16: [9, 5, 5, 4, 4, 4, 3, 2, 1, 0],
  17: [9, 5, 5, 4, 4, 4, 3, 3, 2, 0],
  18: [9, 5, 5, 4, 4, 4, 3, 3, 2, 1],
  19: [9, 5, 5, 4, 4, 4, 3, 3, 3, 2],
  20: [9, 5, 5, 4, 4, 4, 3, 3, 3, 3]
};

export const BARD_KNOWN_TABLE = {
  1:  [4, 0, 0, 0, 0, 0, 0],
  2:  [5, 2, 0, 0, 0, 0, 0],
  3:  [6, 3, 0, 0, 0, 0, 0],
  4:  [6, 3, 2, 0, 0, 0, 0],
  5:  [6, 4, 3, 0, 0, 0, 0],
  6:  [6, 4, 3, 0, 0, 0, 0],
  7:  [6, 4, 4, 2, 0, 0, 0],
  8:  [6, 4, 4, 3, 0, 0, 0],
  9:  [6, 4, 4, 3, 0, 0, 0],
  10: [6, 4, 4, 4, 2, 0, 0],
  11: [6, 5, 5, 4, 3, 0, 0],
  12: [6, 5, 5, 4, 4, 0, 0],
  13: [6, 5, 5, 5, 4, 3, 0],
  14: [6, 5, 5, 5, 4, 4, 0],
  15: [6, 5, 5, 5, 5, 4, 3],
  16: [6, 5, 5, 5, 5, 4, 4],
  17: [6, 5, 5, 5, 5, 5, 4],
  18: [6, 5, 5, 5, 5, 5, 4],
  19: [6, 5, 5, 5, 5, 5, 5],
  20: [6, 5, 5, 5, 5, 5, 5]
};

export const ASSASSIN_TABLE = {
  1:  [0, 0],
  2:  [0, 1],
  3:  [0, 2, 0],
  4:  [0, 3, 1],
  5:  [0, 3, 2, 0],
  6:  [0, 3, 3, 1],
  7:  [0, 3, 3, 2, 0],
  8:  [0, 3, 3, 3, 1],
  9:  [0, 3, 3, 3, 2],
  10: [0, 3, 3, 3, 3]
};


