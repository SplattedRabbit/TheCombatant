/**
 * @module    phbCoreMartial
 * @summary   Unified feature definitions for Player's Handbook (PHB) Core Martial Classes:
 *            Barbarian, Fighter, Monk, Paladin, Ranger, Rogue.
 */

import type { UnifiedFeature } from '../types.ts';

export function getPHBCoreMartialFeatures(pc: any, classMap: Map<string, number>): UnifiedFeature[] {
  const features: UnifiedFeature[] = [];
  const activeACFs: string[] = Array.isArray(pc?.acfs) ? pc.acfs : [];

  // ==========================================
  // BARBARIAN
  // ==========================================
  if (classMap.has('barbarian')) {
    const bLvl = classMap.get('barbarian')!;
    const isBerserkerStrength = activeACFs.includes('barbarian_berserker_strength');

    // 1. Fast Movement
    features.push({
      id: 'barbarian_fast_movement',
      name: 'Fast Movement (+10 ft)',
      source: `Barbarian Lv.${bLvl}`,
      category: 'passive',
      typeLabel: 'Speed Enhancement',
      summary: '+10 ft bonus to base land speed when wearing no armor, light armor, or medium armor and not carrying a heavy load.',
      rawRules: `A barbarian's land speed is faster than the norm for his race by +10 feet. This benefit applies only when he is wearing no armor, light armor, or medium armor and not carrying a heavy load.`,
      actionType: 'Passive',
    });

    // 2. Rage / Berserker Strength
    if (isBerserkerStrength) {
      const threshold = 5 * bLvl;
      const strBonus = bLvl >= 20 ? 8 : (bLvl >= 11 ? 6 : 4);
      const saveBonus = bLvl >= 20 ? 4 : (bLvl >= 11 ? 3 : 2);
      const drValue = bLvl >= 20 ? '5/—' : (bLvl >= 17 ? '4/—' : (bLvl >= 11 ? '3/—' : (bLvl >= 7 ? '2/—' : '2/—')));

      features.push({
        id: 'barbarian_berserker_strength',
        name: `Berserker Strength (Trigger < ${threshold} HP)`,
        source: `Barbarian Lv.${bLvl} (ACF)`,
        category: 'combat',
        typeLabel: 'Alternative Class Feature',
        summary: `Triggers automatically when HP drops below ${threshold} HP: +${strBonus} STR, +${saveBonus} to all saves, DR ${drValue}, -2 AC. Unlimited uses.`,
        rawRules: `Whenever your current hit point total is below ${threshold} HP (5 × Barbarian Level), you automatically enter a state of berserker strength.

• Bonuses: You gain a +${strBonus} bonus to Strength, a +${saveBonus} bonus on all saving throws, and Damage Reduction ${drValue}.
• Penalties: You take a -2 penalty to Armor Class and cannot use any Charisma-, Dexterity-, or Intelligence-based skills (except Balance, Escape Artist, Intimidate, and Ride) or cast spells.
• Unlimited: This state lasts until your HP rises above the threshold or the combat ends. It triggers automatically whenever conditions are met without daily limits.`,
        actionType: 'Passive',
      });
    } else {
      const rageCount = 1 + Math.floor(bLvl / 4);
      const isMighty = bLvl >= 20;
      const isGreater = bLvl >= 11;
      const rageType = isMighty ? 'Mighty Rage' : (isGreater ? 'Greater Rage' : 'Rage');
      const strConBonus = isMighty ? 8 : (isGreater ? 6 : 4);
      const willBonus = isMighty ? 4 : (isGreater ? 3 : 2);

      features.push({
        id: 'barbarian_rage',
        name: `${rageType} (${rageCount}/day)`,
        source: `Barbarian Lv.${bLvl}`,
        category: 'daily',
        typeLabel: 'Combat Surge',
        summary: `+${strConBonus} STR & CON, +${willBonus} morale Will saves, -2 AC. Duration 3 + CON modifier rounds.`,
        rawRules: `A barbarian can fly into a rage a certain number of times per day (${rageCount}/day).

• Bonuses: +${strConBonus} bonus to Strength, +${strConBonus} bonus to Constitution, and a +${willBonus} morale bonus on Will saves.
• Penalties: -2 penalty to Armor Class.
• Duration: 3 rounds + the barbarian's (newly improved) Constitution modifier.
• Fatigued: At the end of the rage, the barbarian loses the rage modifiers and becomes fatigued (-2 Str, -2 Dex, cannot run/charge) for the remainder of the encounter${bLvl >= 17 ? ' (Immune to fatigue due to Tireless Rage)' : ''}.`,
        actionType: 'Free Action',
        interactive: 'toggle',
        dailyAbilityKey: 'Rage',
      });
    }

    // 3. Uncanny Dodge (2nd) & Improved Uncanny Dodge (5th)
    if (bLvl >= 2) {
      features.push({
        id: 'barbarian_uncanny_dodge',
        name: bLvl >= 5 ? 'Improved Uncanny Dodge' : 'Uncanny Dodge',
        source: `Barbarian Lv.${bLvl}`,
        category: 'passive',
        typeLabel: 'Defense',
        summary: bLvl >= 5
          ? 'Cannot be flanked; only a rogue 4+ levels higher can sneak attack you.'
          : 'Retain Dexterity bonus to AC even if caught flat-footed or struck by an invisible attacker.',
        rawRules: `At 2nd level, a barbarian retains his Dexterity bonus to AC even if flat-footed. At 5th level, he can no longer be flanked by opponents.`,
        actionType: 'Passive',
      });
    }

    // 4. Trap Sense (3rd)
    if (bLvl >= 3) {
      const trapBonus = Math.floor(bLvl / 3);
      features.push({
        id: 'barbarian_trap_sense',
        name: `Trap Sense (+${trapBonus})`,
        source: `Barbarian Lv.${bLvl}`,
        category: 'passive',
        typeLabel: 'Reflex & Dodge',
        summary: `+${trapBonus} bonus on Reflex saves vs. traps and +${trapBonus} dodge bonus to AC against trap attacks.`,
        rawRules: `Starting at 3rd level, a barbarian gains an intuitive sense that alerts him to danger from traps, giving him a +${trapBonus} bonus on Reflex saves made to avoid traps and a +${trapBonus} dodge bonus to AC against attacks made by traps.`,
        actionType: 'Passive',
      });
    }

    // 5. Damage Reduction (7th)
    if (bLvl >= 7 && !isBerserkerStrength) {
      const dr = 1 + Math.floor((bLvl - 7) / 3);
      features.push({
        id: 'barbarian_damage_reduction',
        name: `Damage Reduction (${dr}/—)`,
        source: `Barbarian Lv.${bLvl}`,
        category: 'passive',
        typeLabel: 'Damage Reduction',
        summary: `Subtract ${dr} points from any damage dealt by a weapon or natural attack.`,
        rawRules: `At 7th level, a barbarian gains Damage Reduction. Subtract 1 from the damage the barbarian takes each time he is dealt damage from a weapon or a natural attack. At 10th level, and every three barbarian levels thereafter, this damage reduction rises by 1 point (up to 5/— at 19th level).`,
        actionType: 'Passive',
      });
    }

    // 6. Indomitable Will (14th)
    if (bLvl >= 14) {
      features.push({
        id: 'barbarian_indomitable_will',
        name: 'Indomitable Will (+4 vs Mind-Affecting in Rage)',
        source: `Barbarian Lv.${bLvl}`,
        category: 'passive',
        typeLabel: 'Mental Resilience',
        summary: '+4 bonus on Will saves to resist enchantment spells and effects while in a rage.',
        rawRules: `While in a rage, a barbarian of 14th level or higher gains a +4 bonus on Will saves to resist enchantment spells and effects. This bonus stacks with all other modifiers, including the morale bonus on Will saves he receives from rage.`,
        actionType: 'Passive',
      });
    }
  }

  // ==========================================
  // FIGHTER
  // ==========================================
  if (classMap.has('fighter')) {
    const fLvl = classMap.get('fighter')!;
    const bonusFeatCount = 1 + Math.floor(fLvl / 2);

    features.push({
      id: 'fighter_bonus_feats',
      name: `Fighter Bonus Feats (${bonusFeatCount} Feats)`,
      source: `Fighter Lv.${fLvl}`,
      category: 'passive',
      typeLabel: 'Martial Mastery',
      summary: `You gain ${bonusFeatCount} bonus combat feats selected from the Fighter bonus feat list.`,
      rawRules: `At 1st level, a fighter gets a bonus combat-oriented feat in addition to the feat that any 1st-level character gets and the bonus feat granted to a human character. The fighter gains an additional bonus feat at 2nd level and every two fighter levels thereafter (4th, 6th, 8th, 10th, 12th, 14th, 16th, 18th, and 20th).

These feats must be drawn from the feats noted as fighter bonus feats. A fighter must still meet all prerequisites for a bonus feat.`,
      actionType: 'Passive',
    });
  }

  // ==========================================
  // MONK
  // ==========================================
  if (classMap.has('monk')) {
    const mLvl = classMap.get('monk')!;

    // 1. Unarmed Strike & Flurry of Blows
    features.push({
      id: 'monk_unarmed_flurry',
      name: 'Unarmed Strike & Flurry of Blows',
      source: `Monk Lv.${mLvl}`,
      category: 'combat',
      typeLabel: 'Martial Arts',
      summary: 'Improved Unarmed Strike dealing lethal or nonlethal damage. Make extra attacks per round when making a full attack.',
      rawRules: `At 1st level, a monk gains Improved Unarmed Strike as a bonus feat. A monk's attacks may be with either fist interchangeably or with elbows, knees, and feet. A monk's unarmed strike is treated both as a manufactured weapon and a natural weapon for the purpose of spells and effects.

• Flurry of Blows: When making a full attack action, a monk may make one extra attack in a round at her highest base attack bonus, but this attack takes a -2 penalty, as do each other attacks made that round (penalties reduce and extra attacks increase at higher monk levels).`,
      actionType: 'Full-Round Action',
    });

    // 2. Monk AC Bonus & Fast Movement
    const wisScore = typeof pc.wis?.getValue === 'function' ? pc.wis.getValue() : (pc.wis || 10);
    const wisMod = Math.max(0, Math.floor((wisScore - 10) / 2));
    const acBonus = Math.floor(mLvl / 5);
    const speedBonus = mLvl >= 18 ? 60 : (mLvl >= 15 ? 50 : (mLvl >= 12 ? 40 : (mLvl >= 9 ? 30 : (mLvl >= 6 ? 20 : (mLvl >= 3 ? 10 : 0)))));

    features.push({
      id: 'monk_ac_bonus',
      name: `Monk AC Bonus (+${wisMod + acBonus}) & Speed (+${speedBonus} ft)`,
      source: `Monk Lv.${mLvl}`,
      category: 'passive',
      typeLabel: 'Unarmored Defense & Agility',
      summary: `Adds Wisdom modifier (+${wisMod}) and +${acBonus} class bonus to AC when unarmored/unencumbered. Fast movement +${speedBonus} ft.`,
      rawRules: `When unarmored and unencumbered, the monk adds her Wisdom bonus (if any) to her AC. In addition, a monk gains a +1 bonus to AC at 5th level and every 5 monk levels thereafter (+2 at 10th, +3 at 15th, and +4 at 20th level). These bonuses apply even against touch attacks or when flat-footed.

At 3rd level, a monk gains an enhancement bonus to her land speed (+10 ft every 3 levels up to +60 ft at 18th level) when unarmored and not carrying a heavy load.`,
      actionType: 'Passive',
    });

    // 3. Evasion (2nd) & Still Mind (3rd)
    if (mLvl >= 2) {
      features.push({
        id: 'monk_evasion',
        name: mLvl >= 9 ? 'Improved Evasion' : 'Evasion',
        source: `Monk Lv.${mLvl}`,
        category: 'passive',
        typeLabel: 'Reflex Defense',
        summary: mLvl >= 9
          ? 'Take no damage on successful Reflex save, and only half damage on failed Reflex save.'
          : 'Take no damage on successful Reflex save against half-damage effects.',
        rawRules: `At 2nd level and higher, a monk takes no damage on a successful Reflex saving throw against an attack that normally deals half damage on a successful save. At 9th level, she gains Improved Evasion, taking only half damage on a failed save.`,
        actionType: 'Passive',
      });
    }

    // 4. Ki Strike (4th)
    if (mLvl >= 4) {
      const kiType = mLvl >= 16 ? 'Magic, Lawful & Adamantine' : (mLvl >= 10 ? 'Magic & Lawful' : 'Magic');
      features.push({
        id: 'monk_ki_strike',
        name: `Ki Strike (${kiType})`,
        source: `Monk Lv.${mLvl}`,
        category: 'passive',
        typeLabel: 'Supernatural Strike',
        summary: `Unarmed strikes bypass damage reduction as ${kiType} weapons.`,
        rawRules: `At 4th level, a monk's unarmed strikes are empowered with ki. Her unarmed strikes are treated as magic weapons for the purpose of overcoming damage reduction. Ki strike improves at 10th level to Lawful weapons, and at 16th level to Adamantine weapons.`,
        actionType: 'Passive',
      });
    }

    // 5. Purity of Body (5th) & Wholeness of Body (7th)
    if (mLvl >= 5) {
      features.push({
        id: 'monk_purity_body',
        name: 'Purity of Body',
        source: `Monk Lv.${mLvl}`,
        category: 'passive',
        typeLabel: 'Immunity',
        summary: 'Immunity to all diseases except for supernatural and magical diseases.',
        rawRules: `At 5th level, a monk gains immunity to all diseases except for supernatural and magical diseases (such as mummy rot and lycanthropy).`,
        actionType: 'Passive',
      });
    }

    if (mLvl >= 7) {
      const healPool = 2 * mLvl;
      features.push({
        id: 'monk_wholeness_body',
        name: `Wholeness of Body (${healPool} HP Pool)`,
        source: `Monk Lv.${mLvl}`,
        category: 'daily',
        typeLabel: 'Self-Healing',
        summary: `Heal your own wounds up to ${healPool} hit points per day.`,
        rawRules: `At 7th level or higher, a monk can heal her own wounds. She can heal a number of hit points of damage equal to twice her current monk level each day, and she can spread this healing out among several uses.`,
        actionType: 'Standard Action',
        interactive: 'counter',
        dailyAbilityKey: 'Wholeness of Body',
      });
    }

    // 6. Diamond Body (11th), Abundant Step (12th), Diamond Soul (13th)
    if (mLvl >= 11) {
      features.push({
        id: 'monk_diamond_body',
        name: 'Diamond Body',
        source: `Monk Lv.${mLvl}`,
        category: 'passive',
        typeLabel: 'Immunity',
        summary: 'Immunity to all poisons of any type.',
        rawRules: `At 11th level, a monk gains immunity to poisons of all kinds.`,
        actionType: 'Passive',
      });
    }

    if (mLvl >= 12) {
      features.push({
        id: 'monk_abundant_step',
        name: 'Abundant Step (Dimension Door 1/day)',
        source: `Monk Lv.${mLvl}`,
        category: 'daily',
        typeLabel: 'Supernatural Teleportation',
        summary: 'Magically slip between spaces as if using the dimension door spell once per day.',
        rawRules: `At 12th level or higher, a monk can magically slip between spaces as if using the spell dimension door once per day. Her caster level for this effect is one-half her monk level.`,
        actionType: 'Move Action',
        interactive: 'counter',
        dailyAbilityKey: 'Abundant Step',
      });
    }

    if (mLvl >= 13) {
      features.push({
        id: 'monk_diamond_soul',
        name: `Diamond Soul (SR ${10 + mLvl})`,
        source: `Monk Lv.${mLvl}`,
        category: 'passive',
        typeLabel: 'Spell Resistance',
        summary: `Gain Spell Resistance equal to 10 + your Monk level (${10 + mLvl}).`,
        rawRules: `At 13th level, a monk gains spell resistance equal to her current monk level + 10. In order to affect the monk with a spell, a spellcaster must get a result on a caster level check that equals or exceeds the monk's spell resistance.`,
        actionType: 'Passive',
      });
    }
  }

  // ==========================================
  // PALADIN (Passives & Auras)
  // ==========================================
  if (classMap.has('paladin')) {
    const pLvl = classMap.get('paladin')!;

    // Aura of Good
    features.push({
      id: 'paladin_aura_of_good',
      name: 'Aura of Good',
      source: `Paladin Lv.${pLvl}`,
      category: 'aura',
      typeLabel: 'Aura',
      summary: `Emits an aura of good equal to your paladin level for Detect Good spells.`,
      rawRules: `The power of a paladin's aura of good (see the detect good spell) is equal to her paladin level, just like the aura of a cleric of a good deity.`,
      actionType: 'Passive',
    });

    // Detect Evil
    features.push({
      id: 'paladin_detect_evil',
      name: 'Detect Evil',
      source: `Paladin Lv.${pLvl}`,
      category: 'spell-like',
      typeLabel: 'At Will',
      summary: 'Concentrate to sense the presence and strength of evil auras in a 60 ft cone.',
      rawRules: `At will, a paladin can use detect evil, as the spell. A paladin can concentrate on a single item or individual within 60 feet and determine if it is evil, learning the strength of its aura as if having studied it for 3 rounds. While focusing on one individual or object, the paladin does not detect evil in any other object or individual within range.`,
      actionType: 'Standard Action',
      range: '60 ft cone',
      duration: 'Concentration (up to 10 min/lvl)',
    });

    // Divine Grace (Lvl 2+)
    if (pLvl >= 2) {
      const chaScore = typeof pc.cha?.getValue === 'function' ? pc.cha.getValue() : (pc.cha || 10);
      const chaMod = Math.max(0, Math.floor((chaScore - 10) / 2));
      features.push({
        id: 'paladin_divine_grace',
        name: `Divine Grace (+${chaMod} to Saves)`,
        source: `Paladin Lv.${pLvl}`,
        category: 'passive',
        typeLabel: 'Passive Bonus',
        summary: `Adds your Charisma bonus (+${chaMod}) as a bonus on all saving throws (Fortitude, Reflex, Will).`,
        rawRules: `At 2nd level, a paladin gains a bonus equal to her Charisma bonus (if any) on all saving throws. This bonus applies to Fortitude, Reflex, and Will saves against all hazards, spells, and special abilities.`,
        actionType: 'Passive',
      });
    }

    // Aura of Courage (Lvl 3+)
    if (pLvl >= 3) {
      features.push({
        id: 'paladin_aura_of_courage',
        name: 'Aura of Courage',
        source: `Paladin Lv.${pLvl}`,
        category: 'aura',
        typeLabel: 'Aura (10 ft)',
        summary: 'Immune to fear. Each ally within 10 ft gains a +4 morale bonus on saving throws vs. fear.',
        rawRules: `Beginning at 3rd level, a paladin is immune to fear (magical or otherwise). Each ally within 10 feet of her gains a +4 morale bonus on saving throws against fear effects. This ability functions while the paladin is conscious, but not if she is unconscious or dead.`,
        actionType: 'Passive',
        range: '10 ft emanation',
      });
    }

    // Divine Health (Lvl 3+)
    if (pLvl >= 3) {
      features.push({
        id: 'paladin_divine_health',
        name: 'Divine Health',
        source: `Paladin Lv.${pLvl}`,
        category: 'passive',
        typeLabel: 'Immunity',
        summary: 'Immunity to all diseases, including supernatural and magical diseases such as mummy rot.',
        rawRules: `At 3rd level, a paladin gains immunity to all diseases, including supernatural and magical diseases (such as mummy rot and lycanthropy).`,
        actionType: 'Passive',
      });
    }

    // Special Mount (Lvl 5+)
    if (pLvl >= 5) {
      features.push({
        id: 'paladin_special_mount',
        name: 'Special Mount',
        source: `Paladin Lv.${pLvl}`,
        category: 'daily',
        typeLabel: 'Companion / Mount',
        summary: `Summon a loyal, intelligent Heavy Warhorse companion once per day for ${2 * pLvl} hours.`,
        rawRules: `Upon or after reaching 5th level, a paladin gains the service of an unusually intelligent, strong, and loyal steed to serve her in her crusade against evil (typically a heavy warhorse for a Medium paladin).

Once per day, as a full-round action, a paladin may magically call her mount from the celestial realms. This mount remains with the paladin for 2 hours per paladin level. The mount shares saving throws, gains empathic link, improved evasion, share spells, and spell resistance.`,
        actionType: 'Full-Round Action',
      });
    }
  }

  // ==========================================
  // RANGER
  // ==========================================
  if (classMap.has('ranger')) {
    const rLvl = classMap.get('ranger')!;

    // 1. Favored Enemy
    const feBonus = 2 + Math.floor(rLvl / 5) * 2;
    features.push({
      id: 'ranger_favored_enemy',
      name: `Favored Enemy (+${feBonus})`,
      source: `Ranger Lv.${rLvl}`,
      category: 'passive',
      typeLabel: 'Hunter Mastery',
      summary: `+${feBonus} bonus on Bluff, Listen, Sense Motive, Spot, and Survival checks and +${feBonus} on weapon damage rolls against favored enemies.`,
      rawRules: `At 1st level, a ranger selects a creature type from among the given table as a favored enemy. He gains a +2 bonus on Bluff, Listen, Sense Motive, Spot, and Survival checks when using these skills against creatures of this type. Likewise, he gets a +2 bonus on weapon damage rolls against such creatures.

At 5th level and every five levels thereafter (10th, 15th, and 20th level), the ranger may select an additional favored enemy and the bonus against any one favored enemy increases by 2.`,
      actionType: 'Passive',
    });

    // 2. Track & Wild Empathy
    features.push({
      id: 'ranger_track_empathy',
      name: 'Track & Wild Empathy',
      source: `Ranger Lv.${rLvl}`,
      category: 'passive',
      typeLabel: 'Wilderness Expertise',
      summary: 'Bonus Track feat to follow trails via Survival. Wild Empathy check (1d20 + Ranger Lvl + Cha mod) to influence animals.',
      rawRules: `A ranger gains Track as a bonus feat at 1st level.

A ranger can improve the attitude of an animal. This ability functions just like a Diplomacy check made to improve the attitude of a person. The ranger rolls 1d20 + ranger level + Charisma modifier. The typical domestic animal has a starting attitude of indifferent, while wild animals are usually unfriendly.`,
      actionType: 'Passive',
    });

    // 3. Combat Style (2nd), Improved (6th), Mastery (11th)
    if (rLvl >= 2) {
      const styleName = rLvl >= 11 ? 'Combat Style Mastery' : (rLvl >= 6 ? 'Improved Combat Style' : 'Combat Style');
      features.push({
        id: 'ranger_combat_style',
        name: styleName,
        source: `Ranger Lv.${rLvl}`,
        category: 'passive',
        typeLabel: 'Virtual Combat Feat',
        summary: 'Gain virtual combat feats (Rapid Shot/Manyshot or TWF/Improved TWF/Greater TWF) when in light or no armor.',
        rawRules: `At 2nd level, a ranger selects a combat style (Archery or Two-Weapon Combat). He gains the feats associated with that style (Rapid Shot or Two-Weapon Fighting) even if he does not meet the prerequisites.

At 6th level, he gains Improved Combat Style (Manyshot or Improved Two-Weapon Fighting), and at 11th level, he gains Combat Style Mastery (Improved Precise Shot or Greater Two-Weapon Fighting). These benefits apply only when wearing light armor or no armor.`,
        actionType: 'Passive',
      });
    }

    // 4. Endurance (3rd), Woodland Stride (7th), Swift Tracker (8th), Camouflage (13th), Hide in Plain Sight (17th)
    if (rLvl >= 7) {
      features.push({
        id: 'ranger_woodland_stride',
        name: 'Woodland Stride & Swift Tracker',
        source: `Ranger Lv.${rLvl}`,
        category: 'passive',
        typeLabel: 'Wilderness Mobility',
        summary: 'Move through natural thorns/undergrowth at normal speed. Track at normal speed without -5 penalty (at 8th level).',
        rawRules: `Starting at 7th level, a ranger may move through any sort of undergrowth (such as natural thorns, briars, overgrown areas, and similar terrain) at his normal speed and without taking damage or suffering any other impairment.

At 8th level, a ranger can move at his normal speed while following tracks without taking the normal -5 penalty.`,
        actionType: 'Passive',
      });
    }

    if (rLvl >= 13) {
      features.push({
        id: 'ranger_camouflage',
        name: rLvl >= 17 ? 'Camouflage & Hide in Plain Sight' : 'Camouflage',
        source: `Ranger Lv.${rLvl}`,
        category: 'passive',
        typeLabel: 'Master Stealth',
        summary: rLvl >= 17
          ? 'Use Hide in natural terrain even while being observed, with no cover needed.'
          : 'Use the Hide skill in any natural terrain, even if the terrain doesn\'t grant cover or concealment.',
        rawRules: `A ranger of 13th level or higher can use the Hide skill in any sort of natural terrain, even if the terrain doesn't grant cover or concealment.

At 17th level, a ranger can use the Hide skill in natural terrain even while being observed.`,
        actionType: 'Passive',
      });
    }
  }

  // ==========================================
  // ROGUE (Passives & Utilities)
  // ==========================================
  if (classMap.has('rogue')) {
    const rLvl = classMap.get('rogue')!;

    // 1. Trapfinding
    features.push({
      id: 'rogue_trapfinding',
      name: 'Trapfinding',
      source: `Rogue Lv.${rLvl}`,
      category: 'passive',
      typeLabel: 'Class Ability',
      summary: 'Can use the Search skill to locate traps with DC 20+ and Disable Device for magical traps.',
      rawRules: `Rogues (and only rogues) can use the Search skill to locate traps when the task has a Difficulty Class higher than 20. Finding a nonmagical trap has a DC of at least 20, or higher if it is well hidden. Finding a magic trap has a DC of 25 + the level of the spell used to create it.

Rogues can use the Disable Device skill to disarm magic traps. A magic trap generally has a DC of 25 + the level of the spell used to create it. A rogue who beats a trap's DC by 10 or more with a Disable Device check can study a trap, figure out how it works, and bypass it (with her party) without disarming it.`,
      actionType: 'Passive',
    });

    // 2. Evasion (2nd+)
    if (rLvl >= 2) {
      features.push({
        id: 'rogue_evasion',
        name: 'Evasion',
        source: `Rogue Lv.${rLvl}`,
        category: 'passive',
        typeLabel: 'Reflex Defense',
        summary: 'Take no damage on a successful Reflex save that normally deals half damage.',
        rawRules: `At 2nd level and higher, a rogue can avoid even magical and unusual attacks with great agility. If she makes a successful Reflex saving throw against an attack that normally deals half damage on a successful save (such as a red dragon's fiery breath or a fireball), she instead takes no damage.

Evasion can be used only if the rogue is wearing light armor or no armor. A helpless rogue (such as one who is unconscious or paralyzed) does not gain the benefit of evasion.`,
        actionType: 'Passive',
      });
    }

    // 3. Trap Sense (3rd+)
    if (rLvl >= 3) {
      const bonus = Math.floor(rLvl / 3);
      features.push({
        id: 'rogue_trap_sense',
        name: `Trap Sense (+${bonus})`,
        source: `Rogue Lv.${rLvl}`,
        category: 'passive',
        typeLabel: 'Dodge / Save',
        summary: `+${bonus} bonus on Reflex saves to avoid traps and a +${bonus} dodge bonus to AC against trap attacks.`,
        rawRules: `At 3rd level, a rogue gains an intuitive sense that alerts her to danger from traps, giving her a +1 bonus on Reflex saves made to avoid traps and a +1 dodge bonus to AC against attacks made by traps. These bonuses rise by +1 every three levels thereafter (6th, 9th, 12th, 15th, 18th).`,
        actionType: 'Passive',
      });
    }

    // 4. Uncanny Dodge (4th+) & Improved Uncanny Dodge (8th+)
    if (rLvl >= 4) {
      features.push({
        id: 'rogue_uncanny_dodge',
        name: rLvl >= 8 ? 'Improved Uncanny Dodge' : 'Uncanny Dodge',
        source: `Rogue Lv.${rLvl}`,
        category: 'passive',
        typeLabel: 'Defense',
        summary: rLvl >= 8
          ? 'Cannot be flanked; only a rogue of 4+ levels higher can sneak attack you.'
          : 'Retain Dexterity bonus to AC even if caught flat-footed or struck by an invisible attacker.',
        rawRules: `Starting at 4th level, a rogue can react to danger before her senses would normally allow her to do so. She retains her Dexterity bonus to AC (if any) even if she is caught flat-footed or struck by an invisible attacker. However, she still loses her Dexterity bonus to AC if immobilized.

At 8th level, a rogue can no longer be flanked; she can react to opponents on opposite sides of her as easily as she can react to a single attacker. This defense denies another rogue the ability to sneak attack the character by flanking her, unless the attacker has at least four more rogue levels than the target.`,
        actionType: 'Passive',
      });
    }
  }

  return features;
}
