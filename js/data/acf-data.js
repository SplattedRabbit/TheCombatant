/**
 * @module    acf-data
 * @summary   Registry of Alternative Class Features (ACFs) strictly from approved rulebooks in the data directory (PHB2, CA, CS, PHB, DMG).
 * @exports   ACF_REGISTRY, getACFsByClass, getACF
 */

export const ACF_REGISTRY = {
  // --- BARBARIAN ---
  barbarian_berserker_strength: {
    id: 'barbarian_berserker_strength',
    name: 'Berserker Strength',
    classKey: 'barbarian',
    minLevel: 1,
    source: 'PHB2 p.33',
    replaces: 'Rage',
    replacesKey: 'barbarian_rage',
    description: 'When HP falls below (5 × Barbarian level), automatically gain +4 STR (+6 at 11, +8 at 20), +2 bonus on all saves (+3 at 11, +4 at 20), DR 2/— (DR 3/— at 11, DR 4/— at 17, DR 5/— at 20), and -2 AC. Activates without daily use limit.'
  },

  // --- BARD ---
  bard_bardic_knack: {
    id: 'bard_bardic_knack',
    name: 'Bardic Knack',
    classKey: 'bard',
    minLevel: 1,
    source: 'PHB2 p.35',
    replaces: 'Bardic Knowledge',
    replacesKey: 'bard_bardic_knowledge',
    description: 'When making any skill check, you can use 1/2 your Bard level (rounded down) in place of your ranks in that skill (even for trained-only skills).'
  },
  bard_spellbreaker_song: {
    id: 'bard_spellbreaker_song',
    name: 'Spellbreaker Song',
    classKey: 'bard',
    minLevel: 1,
    source: 'PHB2 p.35',
    replaces: 'Countersong',
    replacesKey: 'bard_countersong',
    description: 'Spend 1 bardic music use to disrupt enemy spellcasting within 30 ft. Any enemy casting a spell with a verbal component suffers a 20% spell failure chance for 3 rounds.'
  },

  // --- CLERIC ---
  cleric_spontaneous_domain: {
    id: 'cleric_spontaneous_domain',
    name: 'Spontaneous Domain Casting',
    classKey: 'cleric',
    minLevel: 1,
    source: 'PHB2 p.37',
    replaces: 'Spontaneous Cure / Inflict Spells',
    replacesKey: 'cleric_spontaneous_spells',
    description: 'Choose one of your cleric domains. You can spontaneously convert prepared cleric spells into spells from that domain instead of cure/inflict spells.'
  },

  // --- DRUID ---
  druid_spontaneous_rejuvenation: {
    id: 'druid_spontaneous_rejuvenation',
    name: 'Spontaneous Rejuvenation',
    classKey: 'druid',
    minLevel: 1,
    source: 'PHB2 p.39',
    replaces: "Spontaneous Summon Nature's Ally",
    replacesKey: 'druid_spontaneous_sna',
    description: 'Sacrifice a prepared spell as a standard action to grant all allies within 30 ft (including yourself) Fast Healing equal to the spell level for 3 rounds.'
  },
  druid_shapeshift: {
    id: 'druid_shapeshift',
    name: 'Shapeshift',
    classKey: 'druid',
    minLevel: 1,
    source: 'PHB2 p.39',
    replaces: 'Wild Shape & Animal Companion',
    replacesKey: ['druid_wild_shape', 'druid_animal_companion'],
    description: 'Change form as a swift action at will into Predator Form (+4 STR, +4 Reflex, bite 1d6) and higher forms (Aerial Form at Lvl 7, Ferocious Form at Lvl 9, Forest Avenger at Lvl 12, Elemental Form at Lvl 16) with no daily use limit.'
  },

  // --- FIGHTER ---
  fighter_elusive_attack: {
    id: 'fighter_elusive_attack',
    name: 'Elusive Attack',
    classKey: 'fighter',
    minLevel: 6,
    source: 'PHB2 p.44',
    replaces: '6th-level Fighter Bonus Feat',
    replacesKey: 'fighter_bonus_feat_6',
    description: 'As a full-round action, make one attack at highest BAB to gain a +2 dodge bonus to AC until the start of your next turn (+4 at 11th level, +6 at 16th level).'
  },
  fighter_counterattack: {
    id: 'fighter_counterattack',
    name: 'Counterattack',
    classKey: 'fighter',
    minLevel: 12,
    source: 'PHB2 p.45',
    replaces: '12th-level Fighter Bonus Feat',
    replacesKey: 'fighter_bonus_feat_12',
    description: 'As a full-round action, make one melee attack at highest BAB. At any time before your next turn, make an immediate action melee retaliatory attack at highest BAB against an enemy who attacks you in melee.'
  },
  fighter_overpowering_attack: {
    id: 'fighter_overpowering_attack',
    name: 'Overpowering Attack',
    classKey: 'fighter',
    minLevel: 16,
    source: 'PHB2 p.45',
    replaces: '16th-level Fighter Bonus Feat',
    replacesKey: 'fighter_bonus_feat_16',
    description: 'As a full-round action, deliver a single focused strike at highest BAB. This attack deals double damage, as do any attacks of opportunity made before your next turn.'
  },

  // --- MONK ---
  monk_decisive_strike: {
    id: 'monk_decisive_strike',
    name: 'Decisive Strike',
    classKey: 'monk',
    minLevel: 1,
    source: 'PHB2 p.51',
    replaces: 'Flurry of Blows',
    replacesKey: 'monk_flurry_of_blows',
    description: 'As a full-round action, make one attack with unarmed strike or special monk weapon at highest BAB (-2 attack penalty, -1 at 5th, 0 at 9th). If it hits, it deals double damage (and stunning save DC increases by +2). At 11th level, make two attacks at highest BAB.'
  },
  monk_spell_reflection: {
    id: 'monk_spell_reflection',
    name: 'Spell Reflection',
    classKey: 'monk',
    minLevel: 2,
    source: 'CS p.35',
    replaces: 'Evasion',
    replacesKey: 'monk_evasion',
    description: 'When an enemy misses you with a ray or ranged touch attack, you can redirect the spell back at the caster as an immediate action with a successful Reflex save (DC 10 + spell level).'
  },
  monk_water_step: {
    id: 'monk_water_step',
    name: 'Water Step',
    classKey: 'monk',
    minLevel: 4,
    source: 'CS p.35',
    replaces: 'Slow Fall (20 ft)',
    replacesKey: 'monk_slow_fall',
    description: 'Spend 1 Ki use to walk, run, or charge across any liquid or water surface as if it were solid ground for 1 round.'
  },
  monk_standing_jump: {
    id: 'monk_standing_jump',
    name: 'Standing Jump',
    classKey: 'monk',
    minLevel: 5,
    source: 'CS p.34',
    replaces: 'High Jump',
    replacesKey: 'monk_high_jump',
    description: 'Jump without needing a 20-foot running start; vertical jump DCs are reduced and maximum height is doubled.'
  },

  // --- PALADIN ---
  paladin_charging_smite: {
    id: 'paladin_charging_smite',
    name: 'Charging Smite',
    classKey: 'paladin',
    minLevel: 5,
    source: 'PHB2 p.53',
    replaces: 'Special Mount',
    replacesKey: 'paladin_special_mount',
    description: 'When using Smite Evil on a charge attack, deal an additional +2 points of damage per paladin level (total +3 damage/level). If the charge attack misses, the smite use is not expended.'
  },
  paladin_divine_spirit: {
    id: 'paladin_divine_spirit',
    name: 'Divine Spirit',
    classKey: 'paladin',
    minLevel: 5,
    source: 'PHB2 p.54',
    replaces: 'Special Mount',
    replacesKey: 'paladin_special_mount',
    description: 'Summon an intangible celestial spirit (Spirit of Healing, Spirit of Combat, Spirit of Heroism, or Spirit of Fallen) for a number of rounds equal to your Paladin level.'
  },
  paladin_curse_breaker: {
    id: 'paladin_curse_breaker',
    name: 'Curse Breaker',
    classKey: 'paladin',
    minLevel: 6,
    source: 'CS p.34',
    replaces: 'Remove Disease',
    replacesKey: 'paladin_remove_disease',
    description: 'Cast Break Enchantment 1/week (+1/week per 3 levels above 6th) with caster level equal to your Paladin level.'
  },

  // --- RANGER ---
  ranger_spiritual_guide: {
    id: 'ranger_spiritual_guide',
    name: 'Spiritual Guide',
    classKey: 'ranger',
    minLevel: 4,
    source: 'CS p.35',
    replaces: 'Animal Companion',
    replacesKey: 'ranger_animal_companion',
    description: 'Gain a spiritual guide entity granting a +1/4 Ranger level divine bonus to Handle Animal, Ride, and Survival checks, and Commune with Nature 1/day.'
  },
  ranger_distracting_attack: {
    id: 'ranger_distracting_attack',
    name: 'Distracting Attack',
    classKey: 'ranger',
    minLevel: 4,
    source: 'PHB2 p.55',
    replaces: 'Animal Companion',
    replacesKey: 'ranger_animal_companion',
    description: 'Whenever you hit an enemy with a weapon attack (melee or ranged), that enemy is considered flanked by you for your allies until attacked by an ally or until your next turn.'
  },
  ranger_spell_reflection: {
    id: 'ranger_spell_reflection',
    name: 'Spell Reflection',
    classKey: 'ranger',
    minLevel: 9,
    source: 'CS p.35',
    replaces: 'Evasion',
    replacesKey: 'ranger_evasion',
    description: 'When an enemy misses you with a ray or ranged touch attack, you can redirect the spell back at the caster as an immediate action with a successful Reflex save (DC 10 + spell level).'
  },

  // --- ROGUE ---
  rogue_antiquarian: {
    id: 'rogue_antiquarian',
    name: 'Antiquarian',
    classKey: 'rogue',
    minLevel: 1,
    source: 'CS p.32',
    replaces: 'Trapfinding',
    replacesKey: 'rogue_trapfinding',
    description: 'Substitute Appraise for Knowledge checks regarding items, relics, or historical artifacts, and gain the ability to evaluate magical properties without identifying spells.'
  },
  rogue_spell_reflection: {
    id: 'rogue_spell_reflection',
    name: 'Spell Reflection',
    classKey: 'rogue',
    minLevel: 2,
    source: 'CS p.35',
    replaces: 'Evasion',
    replacesKey: 'rogue_evasion',
    description: 'When an enemy misses you with a ray or ranged touch attack, you can redirect the spell back at the caster as an immediate action with a successful Reflex save (DC 10 + spell level).'
  },
  rogue_deaths_ruin: {
    id: 'rogue_deaths_ruin',
    name: "Death's Ruin",
    classKey: 'rogue',
    minLevel: 3,
    source: 'CS p.33',
    replaces: 'Trap Sense',
    replacesKey: 'rogue_trap_sense',
    description: 'You can deal sneak attack damage to undead creatures, dealing 1/2 your normal sneak attack dice (rounded down, minimum 1d6).'
  },
  rogue_disruptive_attack: {
    id: 'rogue_disruptive_attack',
    name: 'Disruptive Attack',
    classKey: 'rogue',
    minLevel: 4,
    source: 'PHB2 p.57',
    replaces: 'Uncanny Dodge at 4th level (delayed to 8th level)',
    replacesKey: 'rogue_uncanny_dodge',
    description: 'Whenever you hit a flat-footed or flanked target, you can choose to sacrifice your sneak attack damage to inflict a -5 penalty to the target’s Armor Class for 1 round (works even on creatures normally immune to sneak attack).'
  },

  // --- SORCERER ---
  sorcerer_metamagic_specialist: {
    id: 'sorcerer_metamagic_specialist',
    name: 'Metamagic Specialist',
    classKey: 'sorcerer',
    minLevel: 1,
    source: 'PHB2 p.61',
    replaces: 'Familiar',
    replacesKey: 'sorcerer_familiar',
    description: 'Apply known metamagic feats to sorcerer spells without increasing casting time (allows Quicken Spell). Usable (3 + INT modifier, min 1) times per day.'
  },

  // --- WIZARD ---
  wizard_immediate_magic: {
    id: 'wizard_immediate_magic',
    name: 'Immediate Magic',
    classKey: 'wizard',
    minLevel: 1,
    source: 'PHB2 p.68',
    replaces: 'Familiar',
    replacesKey: 'wizard_familiar',
    description: 'Gain an immediate-action school-specific spell-like ability usable (INT modifier, min 1) times per day (Abjuration: Urgent Shield +2 AC; Conjuration: Abrupt Jaunt 10 ft teleport; Divination: Glimpse Peril +2 save; Enchantment: Instant Daze; Evocation: Counterfire 1d6/3 lvl; Illusion: Brief Figment double; Necromancy: Cursed Glance -2 atk/saves; Transmutation: Sudden Shift 5 ft step).'
  },

  // --- SWASHBUCKLER ---
  swashbuckler_arcane_stunt: {
    id: 'swashbuckler_arcane_stunt',
    name: 'Arcane Stunt',
    classKey: 'swashbuckler',
    minLevel: 1,
    source: 'CS p.32',
    replaces: 'Grace (+1 Reflex save bonus at 2nd level)',
    replacesKey: 'swashbuckler_grace',
    description: 'Spend a swift action (usable INT modifier, min 1, times per day) to gain Spider Climb, Expeditious Retreat, or Feather Fall for 1 round.'
  },
  swashbuckler_shield_of_blades: {
    id: 'swashbuckler_shield_of_blades',
    name: 'Shield of Blades',
    classKey: 'swashbuckler',
    minLevel: 5,
    source: 'PHB2 p.50',
    replaces: 'Dodge Bonus',
    replacesKey: 'swashbuckler_dodge_bonus',
    description: 'Gain a +2 shield bonus to AC (+1 per 5 levels above 5th) whenever you wield two weapons or a double weapon and attack with both in the same round.'
  },
  swashbuckler_spell_reflection: {
    id: 'swashbuckler_spell_reflection',
    name: 'Spell Reflection',
    classKey: 'swashbuckler',
    minLevel: 5,
    source: 'CS p.35',
    replaces: 'Dodge Bonus +1',
    replacesKey: 'swashbuckler_dodge_bonus',
    description: 'When an enemy misses you with a ray or ranged touch attack, you can redirect the spell back at the caster as an immediate action with a successful Reflex save (DC 10 + spell level).'
  },

  // --- SCOUT ---
  scout_dungeon_specialist: {
    id: 'scout_dungeon_specialist',
    name: 'Dungeon Specialist',
    classKey: 'scout',
    minLevel: 3,
    source: 'PHB2 p.59',
    replaces: 'Fast Movement (+10 ft)',
    replacesKey: 'scout_fast_movement',
    description: 'Gain a climb speed equal to 1/2 base speed, retain Dex bonus to AC while climbing, and attack with one-handed or light weapons while climbing.'
  },
  scout_spell_reflection: {
    id: 'scout_spell_reflection',
    name: 'Spell Reflection',
    classKey: 'scout',
    minLevel: 5,
    source: 'CS p.35',
    replaces: 'Evasion',
    replacesKey: 'scout_evasion',
    description: 'When an enemy misses you with a ray or ranged touch attack, you can redirect the spell back at the caster as an immediate action with a successful Reflex save (DC 10 + spell level).'
  },

  // --- HEXBLADE ---
  hexblade_dark_companion: {
    id: 'hexblade_dark_companion',
    name: 'Dark Companion',
    classKey: 'hexblade',
    minLevel: 4,
    source: 'PHB2 p.43',
    replaces: 'Familiar',
    replacesKey: 'hexblade_familiar',
    description: 'Create an illusory shadowy panther that moves up to 24 ft per round. Any enemy adjacent to the dark companion suffers a -2 penalty on AC and saving throws.'
  },

  // --- MARSHAL ---
  marshal_adrenaline_boost: {
    id: 'marshal_adrenaline_boost',
    name: 'Adrenaline Boost',
    classKey: 'marshal',
    minLevel: 1,
    source: 'PHB2 p.46',
    replaces: 'Skill Focus (Diplomacy)',
    replacesKey: 'marshal_skill_focus',
    description: 'Once per day per point of CHA bonus, grant temporary HP equal to (Marshal level + CHA bonus) to an ally who is dropped below 0 HP or suffering from fear/paralysis.'
  },

  // --- WARMAGE ---
  warmage_eclectic_learning: {
    id: 'warmage_eclectic_learning',
    name: 'Eclectic Learning',
    classKey: 'warmage',
    minLevel: 3,
    source: 'PHB2 p.51',
    replaces: 'Advanced Learning',
    replacesKey: 'warmage_advanced_learning',
    description: 'Add any wizard spell (not just evocation) to your list of spells known at a spell level 1 higher than its normal wizard spell level.'
  },

  // --- FAVORED SOUL ---
  favored_soul_deceptive_spell: {
    id: 'favored_soul_deceptive_spell',
    name: 'Deceptive Spell',
    classKey: 'favored_soul',
    minLevel: 1,
    source: 'PHB2 p.41',
    replaces: 'Deity Weapon Proficiency & Weapon Focus',
    replacesKey: 'favored_soul_deity_weapon',
    description: 'Cast divine spells without making obvious somatic or verbal gestures, requiring an enemy Spot or Listen check (DC 15 + spell level) to realize you are casting.'
  }
};

/**
 * Returns all ACFs available for a given class that meet the minimum level.
 * @param {string} classKey - Lowercase class name (e.g. 'paladin', 'barbarian', 'fighter')
 * @param {number} [level=99] - Current class level
 * @returns {Array<Object>}
 */
export function getACFsByClass(classKey, level = 99) {
  if (!classKey) return [];
  const normalized = String(classKey).trim().toLowerCase();
  return Object.values(ACF_REGISTRY).filter(
    acf => acf.classKey === normalized && acf.minLevel <= level
  );
}

/**
 * Get ACF definition by ID.
 * @param {string} acfId
 * @returns {Object|null}
 */
export function getACF(acfId) {
  return ACF_REGISTRY[acfId] || null;
}

/**
 * Returns any already active ACFs that replace the same feature as targetAcfId (mutually exclusive).
 * @param {string} targetAcfId
 * @param {string[]} [activeAcfIds=[]]
 * @returns {string[]} List of conflicting ACF IDs
 */
export function getConflictingACFs(targetAcfId, activeAcfIds = []) {
  if (!targetAcfId || !Array.isArray(activeAcfIds) || activeAcfIds.length === 0) return [];
  const target = ACF_REGISTRY[targetAcfId];
  if (!target || !target.replacesKey) return [];
  const targetKeys = Array.isArray(target.replacesKey) ? target.replacesKey : [target.replacesKey];

  return activeAcfIds.filter(id => {
    if (id === targetAcfId) return false;
    const other = ACF_REGISTRY[id];
    if (!other || !other.replacesKey || other.classKey !== target.classKey) return false;
    const otherKeys = Array.isArray(other.replacesKey) ? other.replacesKey : [other.replacesKey];
    return targetKeys.some(k => otherKeys.includes(k));
  });
}

