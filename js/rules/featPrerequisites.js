/**
 * @module    featPrerequisites
 * @summary   Prerequisite verification engine for D&D 3.5e Feats.
 *            Uses Strategy & Registry pattern for clean, declarative prerequisite evaluations.
 */

export const SKILL_NAMES_MAP = {
  appraise: 'Appraise',
  balance: 'Balance',
  bluff: 'Bluff',
  climb: 'Climb',
  concentration: 'Concentration',
  craft: 'Craft',
  decipher_script: 'Decipher Script',
  diplomacy: 'Diplomacy',
  disable_device: 'Disable Device',
  disguise: 'Disguise',
  escape_artist: 'Escape Artist',
  forgery: 'Forgery',
  gather_information: 'Gather Information',
  handle_animal: 'Handle Animal',
  heal: 'Heal',
  hide: 'Hide',
  intimidate: 'Intimidate',
  jump: 'Jump',
  knowledge_arcana: 'Knowledge (Arcana)',
  knowledge_dungeoneering: 'Knowledge (Dungeoneering)',
  knowledge_engineering: 'Knowledge (Architecture & Eng.)',
  knowledge_geography: 'Knowledge (Geography)',
  knowledge_history: 'Knowledge (History)',
  knowledge_local: 'Knowledge (Local)',
  knowledge_nature: 'Knowledge (Nature)',
  knowledge_nobility: 'Knowledge (Nobility & Royalty)',
  knowledge_religion: 'Knowledge (Religion)',
  knowledge_the_planes: 'Knowledge (The Planes)',
  listen: 'Listen',
  move_silently: 'Move Silently',
  open_lock: 'Open Lock',
  perform: 'Perform',
  profession: 'Profession',
  ride: 'Ride',
  search: 'Search',
  sense_motive: 'Sense Motive',
  sleight_of_hand: 'Sleight of Hand',
  spellcraft: 'Spellcraft',
  spot: 'Spot',
  survival: 'Survival',
  swim: 'Swim',
  tumble: 'Tumble',
  use_magic_device: 'Use Magic Device',
  use_rope: 'Use Rope',
};

export const CLASS_NAMES_MAP = {
  barbarian: 'Barbarian',
  bard: 'Bard',
  cleric: 'Cleric',
  druid: 'Druid',
  fighter: 'Fighter',
  monk: 'Monk',
  paladin: 'Paladin',
  ranger: 'Ranger',
  rogue: 'Rogue',
  sorcerer: 'Sorcerer',
  wizard: 'Wizard',
  shadowbane_inquisitor: 'Shadowbane Inquisitor',
  dread_pirate: 'Dread Pirate',
  dervish: 'Dervish',
  tempest: 'Tempest',
  duelist: 'Duelist',
  assassin: 'Assassin',
  blackguard: 'Blackguard',
  dragon_disciple: 'Dragon Disciple',
  eldritch_knight: 'Eldritch Knight',
  horizon_walker: 'Horizon Walker',
  mystic_theurge: 'Mystic Theurge',
  shadowdancer: 'Shadowdancer',
  archmage: 'Archmage',
  hierophant: 'Hierophant',
};

/**
 * Resolves a Stat representation (primitive number, Stat instance, or snapshot object) to a numeric value.
 */
export function getAblVal(statObj) {
  if (typeof statObj === 'number') return statObj;
  if (!statObj) return 10;
  if (typeof statObj.getValue === 'function') return statObj.getValue();
  return statObj.base ?? statObj.value ?? 10;
}

/**
 * Declarative matcher registry for custom feat prerequisites.
 */
export const CUSTOM_PREREQ_MATCHERS = [
  {
    matches: (desc) => desc.includes('trapfinding'),
    check: (pc) => Array.isArray(pc.classes) && pc.classes.some(c => ['rogue', 'scout', 'spellthief', 'beguiler'].includes(c.classType)),
    desc: () => 'Special: Trapfinding class feature (Rogue 1+)'
  },
  {
    matches: (desc) => desc.includes('favored enemy'),
    check: (pc) => {
      const cls = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'ranger') : null;
      return !!(cls && cls.level >= 1);
    },
    desc: () => 'Special: Favored Enemy class feature (Ranger 1+)'
  },
  {
    matches: (desc) => desc.includes('smite evil'),
    check: (pc) => {
      const pal = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'paladin') : null;
      const sbi = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'shadowbane_inquisitor') : null;
      return !!((pal && pal.level >= 1) || (sbi && sbi.level >= 2));
    },
    desc: () => 'Special: Smite Evil class feature (Paladin 1+)'
  },
  {
    matches: (desc) => desc.includes('evasion'),
    check: (pc) => {
      const rog = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'rogue') : null;
      const mnk = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'monk') : null;
      return !!((rog && rog.level >= 2) || (mnk && mnk.level >= 2));
    },
    desc: () => 'Special: Evasion class feature (Rogue 2+ or Monk 2+)'
  },
  {
    matches: (desc) => desc.includes('rage'),
    check: (pc) => {
      const bar = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'barbarian') : null;
      return !!(bar && bar.level >= 1);
    },
    desc: () => 'Special: Rage class feature (Barbarian 1+)'
  },
  {
    matches: (desc) => desc.includes('ki strike'),
    check: (pc) => {
      const mnk = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'monk') : null;
      return !!(mnk && mnk.level >= 4);
    },
    desc: () => 'Special: Ki Strike class feature (Monk 4+)'
  },
  {
    matches: (desc) => desc.includes('turn undead') || desc.includes('untote zu vertreiben'),
    check: (pc) => {
      const cle = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'cleric') : null;
      const pal = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'paladin') : null;
      const cLvl = cle ? cle.level : 0;
      const pLvl = pal ? pal.level : 0;
      return cLvl >= 1 || pLvl >= 4;
    },
    desc: () => 'Special: Turn Undead ability (Cleric 1+ or Paladin 4+)'
  },
  {
    matches: (desc) => desc.includes('bardic music') || desc.includes('bardenmusik'),
    check: (pc) => {
      const brd = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'bard') : null;
      return !!(brd && brd.level >= 1);
    },
    desc: () => 'Special: Bardic Music (Bard 1+)'
  },
  {
    matches: (desc) => desc.includes('wild shape') || desc.includes('tiergestalt'),
    check: (pc) => {
      const dru = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'druid') : null;
      return !!(dru && dru.level >= 5);
    },
    desc: () => 'Special: Wild Shape (Druid 5+)'
  },
  {
    matches: (desc) => desc.includes('ride 1 rank') || desc.includes('reiten 1 rang'),
    check: (pc) => {
      let ranks = 0;
      if (typeof pc.getSkillRanks === 'function') {
        ranks = pc.getSkillRanks('ride');
      } else if (pc.skills && pc.skills['ride']) {
        ranks = parseFloat(pc.skills['ride'].ranks) || 0;
      }
      return ranks >= 1;
    },
    desc: (pc) => {
      let ranks = 0;
      if (typeof pc.getSkillRanks === 'function') {
        ranks = pc.getSkillRanks('ride');
      } else if (pc.skills && pc.skills['ride']) {
        ranks = parseFloat(pc.skills['ride'].ranks) || 0;
      }
      return `Special: Ride 1 rank (Current: ${ranks})`;
    }
  },
  {
    matches: (desc) => desc.includes('spontaneous 2nd level arcane spells'),
    check: (pc) => {
      const sor = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'sorcerer') : null;
      const brd = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'bard') : null;
      return !!((sor && sor.level >= 4) || (brd && brd.level >= 4));
    },
    desc: () => 'Special: Spontaneous 2nd-level arcane spells (Sorcerer 4+ or Bard 4+)'
  },
  {
    matches: (desc) => desc.includes('ability to cast 3rd-level arcane spells'),
    check: (pc) => {
      const wiz = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'wizard') : null;
      const sor = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'sorcerer') : null;
      return !!((wiz && wiz.level >= 5) || (sor && sor.level >= 6));
    },
    desc: () => 'Special: Cast 3rd-level arcane spells (Wizard 5+ or Sorcerer 6+)'
  },
  {
    matches: (desc) => desc.includes('ability to acquire a familiar'),
    check: (pc) => {
      const wiz = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'wizard') : null;
      const sor = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'sorcerer') : null;
      return !!((wiz && wiz.level >= 1) || (sor && sor.level >= 1));
    },
    desc: () => 'Special: Familiar class feature (Wizard 1+ or Sorcerer 1+)'
  }
];

/**
 * Strategy handlers for prerequisite evaluation by type.
 */
export const PREREQ_HANDLERS = {
  bab: (pr, pc) => {
    const pcBab = pc.bab ? (typeof pc.bab.getValue === 'function' ? pc.bab.getValue() : pc.bab.base ?? pc.bab) : 0;
    return {
      met: pcBab >= pr.value,
      desc: `Base Attack Bonus (BAB) +${pr.value} (Current: +${pcBab})`
    };
  },

  feat: (pr, pc, context) => {
    const prMet = context.learnedIds.includes(pr.id);
    const parentFeat = context.registry?.[pr.id];
    const parentName = parentFeat ? (parentFeat.nameEn || parentFeat.nameDe) : pr.id;
    return {
      met: prMet,
      desc: `Feat: ${parentName}`
    };
  },

  classLevel: (pr, pc) => {
    const cls = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === pr.class) : null;
    const lvl = cls ? cls.level : 0;
    const classNameEn = CLASS_NAMES_MAP[pr.class] || (pr.class ? pr.class.charAt(0).toUpperCase() + pr.class.slice(1) : 'Class');
    return {
      met: lvl >= pr.value,
      desc: `${classNameEn} Level ${pr.value} (Current: Level ${lvl})`
    };
  },

  class: (pr, pc) => {
    const hasCls = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === pr.class);
    const classNameEn = CLASS_NAMES_MAP[pr.class] || (pr.class ? pr.class.charAt(0).toUpperCase() + pr.class.slice(1) : 'Class');
    return {
      met: hasCls,
      desc: `Class: ${classNameEn}`
    };
  },

  stat: (pr, pc) => {
    const nameMap = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
    const pcStat = pc[pr.name] !== undefined ? getAblVal(pc[pr.name]) : 10;
    return {
      met: pcStat >= pr.value,
      desc: `${nameMap[pr.name] || pr.name} ${pr.value}+ (Current: ${pcStat})`
    };
  },

  level: (pr, pc) => {
    const pcLevel = pc.level || pc.totalLevel || 1;
    return {
      met: pcLevel >= pr.value,
      desc: `Character Level ${pr.value} (Current: ${pcLevel})`
    };
  },

  casterLevel: (pr, pc) => {
    let maxCL = 0;
    if (Array.isArray(pc.classes)) {
      pc.classes.forEach(c => {
        if (['wizard', 'cleric', 'druid', 'sorcerer', 'bard'].includes(c.classType)) {
          maxCL = Math.max(maxCL, c.level);
        } else if (['paladin', 'ranger'].includes(c.classType) && c.level >= 4) {
          maxCL = Math.max(maxCL, Math.floor(c.level / 2));
        }
      });
    }
    return {
      met: maxCL >= pr.value,
      desc: `Caster Level ${pr.value} (Current: ${maxCL})`
    };
  },

  skill: (pr, pc) => {
    const skillKey = pr.name || pr.skill;
    const reqRanks = pr.value !== undefined ? pr.value : (pr.ranks || 0);
    let ranks = 0;
    if (typeof pc.getSkillRanks === 'function') {
      ranks = pc.getSkillRanks(skillKey);
    } else if (pc.skills && pc.skills[skillKey]) {
      ranks = typeof pc.skills[skillKey] === 'object' ? (parseFloat(pc.skills[skillKey].ranks) || 0) : (parseFloat(pc.skills[skillKey]) || 0);
    }
    const cleanSkill = (skillKey && SKILL_NAMES_MAP[skillKey]) || (skillKey ? skillKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Skill');
    return {
      met: ranks >= reqRanks,
      desc: `${cleanSkill} ${reqRanks} ranks (Current: ${ranks})`
    };
  },

  sneak_attack: (pr, pc) => {
    let saDice = 0;
    if (typeof pc.getSneakAttackDiceCount === 'function') {
      saDice = pc.getSneakAttackDiceCount();
    } else {
      const rogueClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'rogue') : null;
      saDice = rogueClass ? Math.floor((rogueClass.level + 1) / 2) : 0;
    }
    return {
      met: saDice >= pr.value,
      desc: `Sneak Attack +${pr.value}d6 (Current: +${saDice}d6)`
    };
  },

  custom: (pr, pc) => {
    const descLower = (pr.desc || '').toLowerCase();
    const matcher = CUSTOM_PREREQ_MATCHERS.find(m => m.matches(descLower));
    if (matcher) {
      return {
        met: matcher.check(pc),
        desc: typeof matcher.desc === 'function' ? matcher.desc(pc) : matcher.desc()
      };
    }
    return {
      met: true,
      desc: `Special: ${pr.desc}`
    };
  }
};

/**
 * Evaluates all prerequisites for a feat against a character.
 *
 * @param {object} feat - Feat definition with prereqs array
 * @param {object} pc   - Character object (engine model or plain snapshot)
 * @param {object} [registry] - Feat registry for parent name lookups
 * @returns {{ met: boolean, details: Array<{ met: boolean, desc: string }> }}
 */
export function evaluateFeatPrerequisites(feat, pc, registry = {}) {
  if (!feat.prereqs || feat.prereqs.length === 0) {
    return { met: true, details: [] };
  }

  const autoFeatIds = typeof pc.getAutomaticFeats === 'function'
    ? pc.getAutomaticFeats().map(f => f.id)
    : [];

  const learnedIds = [
    ...(Array.isArray(pc.feats) ? pc.feats.map(f => (typeof f === 'string' ? f : f.id)) : []),
    ...autoFeatIds
  ];

  const context = { learnedIds, registry };
  let met = true;
  const details = [];

  for (const pr of feat.prereqs) {
    const handler = PREREQ_HANDLERS[pr.type];
    const result = handler ? handler(pr, pc, context) : { met: true, desc: pr.desc || pr.type };

    if (!result.met) {
      met = false;
    }
    details.push(result);
  }

  return { met, details };
}
