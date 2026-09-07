/**
 * @module    featureRegistry
 * @summary   Centralized collector and normalizer for D&D 3.5e character features.
 *            Merges cumulative features (Sneak Attack, Smite, Turn Undead),
 *            resolves base class, prestige class, and racial traits,
 *            and enriches them with official RAW rule texts and categories.
 */

import { PRESTIGE_CLASSES_REGISTRY } from '@core/data/prestigeClasses-data.js';
import { getPrestigeClassFeatures, getSneakAttackDiceFromPrestigeClasses } from '@core/rules/prestigeClassEngine.js';
import { RogueRules } from '@core/rules/classes/RogueRules.js';
import { RACES } from '../../wizard/constants';

export interface UnifiedFeature {
  id: string;
  name: string;
  source: string;
  sources?: string[];
  category: 'combat' | 'daily' | 'passive' | 'aura' | 'spell-like';
  typeLabel: string;
  summary: string;
  rawRules: string;
  actionType: 'Passive' | 'Free Action' | 'Swift Action' | 'Standard Action' | 'Full-Round Action' | 'Immediate Action' | 'Special';
  duration?: string;
  range?: string;
  stackInfo?: string;
  interactive?: 'toggle' | 'counter' | 'none';
  dailyAbilityKey?: string;
}

export function getAllUnifiedFeatures(pc: any): UnifiedFeature[] {
  if (!pc) return [];

  const features: UnifiedFeature[] = [];
  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const classMap = new Map<string, number>();
  activeClasses.forEach((c: any) => {
    if (c?.classType) classMap.set(c.classType, c.level || 1);
  });

  // ==========================================
  // 1. CUMULATIVE & MERGED COMBAT FEATURES
  // ==========================================

  // --- SNEAK ATTACK MERGING ---
  let rogueSa = 0;
  if (classMap.has('rogue')) {
    rogueSa = RogueRules.getSneakAttackDiceCount(classMap.get('rogue')!);
  }
  const prcSa = getSneakAttackDiceFromPrestigeClasses(pc);
  const totalSa = rogueSa + prcSa;

  if (totalSa > 0) {
    const saSources: string[] = [];
    if (rogueSa > 0) saSources.push(`Rogue Lv.${classMap.get('rogue')} (+${rogueSa}d6)`);
    activeClasses.forEach((c: any) => {
      const pDef = PRESTIGE_CLASSES_REGISTRY[c.classType];
      if (pDef?.features) {
        Object.values(pDef.features).forEach((f: any) => {
          if (f.type === 'diceStack' && f.pool === 'sneakAttack') {
            const dice = f.diceByLevel(c.level);
            if (dice > 0) saSources.push(`${pDef.name || c.classType} Lv.${c.level} (+${dice}d6)`);
          }
        });
      }
    });

    features.push({
      id: 'sneak_attack_merged',
      name: `Sneak Attack +${totalSa}d6`,
      source: saSources.join(' • '),
      sources: saSources,
      category: 'combat',
      typeLabel: 'Attack Mod',
      summary: `Deals +${totalSa}d6 extra precision damage against flanked targets or those denied Dex to AC.`,
      rawRules: `If a rogue or qualifying prestige class can catch an opponent when he is unable to defend himself effectively from her attack, she can strike a vital spot for extra damage.

The character's attack deals extra damage any time her target would be denied a Dexterity bonus to AC (whether the target actually has a Dexterity bonus or not), or when the character flanks her target. This extra damage is ${totalSa}d6. Should the character score a critical hit with a sneak attack, this extra damage is not multiplied.

Ranged attacks can count as sneak attacks only if the target is within 30 feet. With a sap or an unarmed strike, a character can make a sneak attack that deals nonlethal damage instead of lethal damage.

A character can sneak attack only living creatures with discernible anatomies—undead, constructs, oozes, plants, and incorporeal creatures lack vital areas to attack. Any creature that is immune to critical hits is not vulnerable to sneak attacks.`,
      actionType: 'Passive',
      stackInfo: `Combined from: ${saSources.join(', ')}`,
      interactive: 'toggle',
    });
  }

  // --- SMITE EVIL / SMITE CORRUPT MERGING ---
  let paladinSmite = 0;
  if (classMap.has('paladin')) {
    paladinSmite = 1 + Math.floor((classMap.get('paladin')! - 1) / 5);
  }
  let shadowbaneSmite = 0;
  if (classMap.has('shadowbane_inquisitor') && classMap.get('shadowbane_inquisitor')! >= 2) {
    const sLvl = classMap.get('shadowbane_inquisitor')!;
    shadowbaneSmite = 1 + Math.floor((sLvl - 2) / 4); // 2nd, 6th, 10th
  }

  if (paladinSmite > 0 || shadowbaneSmite > 0) {
    const smiteSources: string[] = [];
    if (paladinSmite > 0) smiteSources.push(`Paladin (Lvl ${classMap.get('paladin')}) (${paladinSmite}/day)`);
    if (shadowbaneSmite > 0) smiteSources.push(`Shadowbane Inquisitor (Lvl ${classMap.get('shadowbane_inquisitor')}) (${shadowbaneSmite}/day)`);

    const chaScore = typeof pc.cha?.getValue === 'function' ? pc.cha.getValue() : (pc.cha || 10);
    const chaMod = Math.max(0, Math.floor((chaScore - 10) / 2));
    const palLvl = classMap.get('paladin') || 0;

    features.push({
      id: 'smite_evil_merged',
      name: `Smite Evil (${paladinSmite + shadowbaneSmite}/day)`,
      source: smiteSources.join(' • '),
      sources: smiteSources,
      category: 'daily',
      typeLabel: 'Daily Attack',
      summary: `Adds +${chaMod} to melee attack roll and +${palLvl} damage against evil targets.`,
      rawRules: `Once per day, a paladin may attempt to smite evil with one normal melee attack. She adds her Charisma bonus (if any) to her attack roll and deals 1 extra point of damage per paladin level.

If the paladin accidentally smites a creature that is not evil, the smite has no effect, but the ability is still used up for that day.

At 5th level, and at every five levels thereafter, the paladin may smite evil one additional time per day.
Shadowbane Inquisitors gain Smite Corrupt, which functions against evil creatures or any creature that has broken a solemn oath or law.`,
      actionType: 'Free Action',
      range: 'Melee',
      stackInfo: smiteSources.join(', '),
      interactive: 'counter',
      dailyAbilityKey: 'Smite Evil',
    });
  }

  // --- LAY ON HANDS ---
  if (classMap.has('paladin') && classMap.get('paladin')! >= 2) {
    const pLvl = classMap.get('paladin')!;
    const chaScore = typeof pc.cha?.getValue === 'function' ? pc.cha.getValue() : (pc.cha || 10);
    const chaMod = Math.floor((chaScore - 10) / 2);
    const lohMax = Math.max(0, pLvl * chaMod);

    features.push({
      id: 'lay_on_hands',
      name: `Lay on Hands (${lohMax} HP Pool)`,
      source: `Paladin (Lvl ${pLvl})`,
      category: 'daily',
      typeLabel: 'Healing Pool',
      summary: `Heal wounds or damage undead by touch up to a total of ${lohMax} HP per day.`,
      rawRules: `Beginning at 2nd level, a paladin with a Charisma score of 12 or higher can heal wounds (her own or those of others) by touch. Each day she can heal a total number of hit points of damage equal to her paladin level × her Charisma bonus.

A paladin may choose to divide her healing among multiple recipients, and she doesn't have to use it all at once. Using lay on hands is a standard action.

Alternatively, a paladin can use any or all of this healing power to deal damage to undead creatures. Using lay on hands in this way requires a successful melee touch attack and doesn't provoke an attack of opportunity. The paladin decides how many points of healing power to use for damage after successfully touching the undead creature.`,
      actionType: 'Standard Action',
      range: 'Touch',
      interactive: 'counter',
      dailyAbilityKey: 'Lay on Hands',
    });
  }

  // --- TURN UNDEAD ---
  const hasCleric = classMap.has('cleric');
  const hasPaladinTurn = classMap.has('paladin') && classMap.get('paladin')! >= 4;
  if (hasCleric || hasPaladinTurn) {
    const sources: string[] = [];
    let effLvl = 0;
    if (hasCleric) {
      effLvl += classMap.get('cleric')!;
      sources.push(`Cleric (Lvl ${classMap.get('cleric')})`);
    }
    if (hasPaladinTurn) {
      const pTurnLvl = Math.max(1, classMap.get('paladin')! - 3);
      effLvl += pTurnLvl;
      sources.push(`Paladin (Lvl ${classMap.get('paladin')}) (effective lvl ${pTurnLvl})`);
    }

    const chaScore = typeof pc.cha?.getValue === 'function' ? pc.cha.getValue() : (pc.cha || 10);
    const chaMod = Math.floor((chaScore - 10) / 2);
    const turnMax = Math.max(1, 3 + chaMod);

    features.push({
      id: 'turn_undead_merged',
      name: `Turn Undead (${turnMax}/day • Eff. Level ${effLvl})`,
      source: sources.join(' • '),
      sources,
      category: 'daily',
      typeLabel: 'Supernatural',
      summary: `Channel divine power to turn or destroy undead within 60 ft. Turning check 1d20+CHA.`,
      rawRules: `Good clerics and paladins channel positive energy to turn (rebuke or destroy) undead. Turning undead is a supernatural ability that a character can perform as a standard action. It does not provoke attacks of opportunity.

• Range: You must present your holy symbol toward the undead. You turn the closest undead within 60 feet.
• Turning Check: Roll 1d20 + Charisma modifier to determine the most powerful undead you can affect.
• Turning Damage: Roll 2d6 + Effective Level + Charisma modifier to determine the total Hit Dice of undead turned.
• Destroyed: Undead with Hit Dice equal to or less than half your effective turning level are destroyed instead of turned.`,
      actionType: 'Standard Action',
      range: '60 ft burst',
      stackInfo: `Effective Turning Level: ${effLvl} (${sources.join(', ')})`,
      interactive: 'counter',
      dailyAbilityKey: 'Turn Undead',
    });
  }

  // ==========================================
  // 2. PALADIN SPECIFIC PASSIVES & AURAS
  // ==========================================
  if (classMap.has('paladin')) {
    const pLvl = classMap.get('paladin')!;

    // Aura of Good
    features.push({
      id: 'paladin_aura_of_good',
      name: 'Aura of Good',
      source: `Paladin (Lvl ${pLvl})`,
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
      source: `Paladin (Lvl ${pLvl})`,
      category: 'spell-like',
      typeLabel: 'At Will',
      summary: `Concentrate to sense the presence and strength of evil auras in a 60 ft cone.`,
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
        source: `Paladin (Lvl ${pLvl})`,
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
        source: `Paladin (Lvl ${pLvl})`,
        category: 'aura',
        typeLabel: 'Aura (10 ft)',
        summary: `Immune to fear. Each ally within 10 ft gains a +4 morale bonus on saving throws vs. fear.`,
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
        source: `Paladin (Lvl ${pLvl})`,
        category: 'passive',
        typeLabel: 'Immunity',
        summary: `Immunity to all diseases, including supernatural and magical diseases such as mummy rot.`,
        rawRules: `At 3rd level, a paladin gains immunity to all diseases, including supernatural and magical diseases (such as mummy rot and lycanthropy).`,
        actionType: 'Passive',
      });
    }

    // Special Mount (Lvl 5+)
    if (pLvl >= 5) {
      features.push({
        id: 'paladin_special_mount',
        name: 'Special Mount',
        source: `Paladin (Lvl ${pLvl})`,
        category: 'daily',
        typeLabel: 'Companion / Mount',
        summary: `Summon a loyal, intelligent Heavy Warhorse companion once per day for 2 hours per level.`,
        rawRules: `Upon or after reaching 5th level, a paladin gains the service of an unusually intelligent, strong, and loyal steed to serve her in her crusade against evil (typically a heavy warhorse for a Medium paladin).

Once per day, as a full-round action, a paladin may magically call her mount from the celestial realms. This mount remains with the paladin for 2 hours per paladin level. The mount shares saving throws, gains empathic link, improved evasion, share spells, and spell resistance.`,
        actionType: 'Full-Round Action',
      });
    }
  }

  // ==========================================
  // 3. ROGUE SPECIFIC PASSIVES & UTILITIES
  // ==========================================
  if (classMap.has('rogue')) {
    const rLvl = classMap.get('rogue')!;

    // Trapfinding
    features.push({
      id: 'rogue_trapfinding',
      name: 'Trapfinding',
      source: `Rogue ${rLvl}`,
      category: 'passive',
      typeLabel: 'Class Ability',
      summary: `Can use the Search skill to locate traps with DC 20+ and Disable Device for magical traps.`,
      rawRules: `Rogues (and only rogues) can use the Search skill to locate traps when the task has a Difficulty Class higher than 20. Finding a nonmagical trap has a DC of at least 20, or higher if it is well hidden. Finding a magic trap has a DC of 25 + the level of the spell used to create it.

Rogues can use the Disable Device skill to disarm magic traps. A magic trap generally has a DC of 25 + the level of the spell used to create it. A rogue who beats a trap's DC by 10 or more with a Disable Device check can study a trap, figure out how it works, and bypass it (with her party) without disarming it.`,
      actionType: 'Passive',
    });

    // Evasion (Lvl 2+)
    if (rLvl >= 2) {
      features.push({
        id: 'rogue_evasion',
        name: 'Evasion',
        source: `Rogue ${rLvl}`,
        category: 'passive',
        typeLabel: 'Reflex Defense',
        summary: `Take no damage on a successful Reflex save that normally deals half damage.`,
        rawRules: `At 2nd level and higher, a rogue can avoid even magical and unusual attacks with great agility. If she makes a successful Reflex saving throw against an attack that normally deals half damage on a successful save (such as a red dragon's fiery breath or a fireball), she instead takes no damage.

Evasion can be used only if the rogue is wearing light armor or no armor. A helpless rogue (such as one who is unconscious or paralyzed) does not gain the benefit of evasion.`,
        actionType: 'Passive',
      });
    }

    // Trap Sense (Lvl 3+)
    if (rLvl >= 3) {
      const bonus = Math.floor(rLvl / 3);
      features.push({
        id: 'rogue_trap_sense',
        name: `Trap Sense (+${bonus})`,
        source: `Rogue ${rLvl}`,
        category: 'passive',
        typeLabel: 'Dodge / Save',
        summary: `+${bonus} bonus on Reflex saves to avoid traps and a +${bonus} dodge bonus to AC against trap attacks.`,
        rawRules: `At 3rd level, a rogue gains an intuitive sense that alerts her to danger from traps, giving her a +1 bonus on Reflex saves made to avoid traps and a +1 dodge bonus to AC against attacks made by traps. These bonuses rise by +1 every three levels thereafter (6th, 9th, 12th, 15th, 18th).`,
        actionType: 'Passive',
      });
    }

    // Uncanny Dodge (Lvl 4+)
    if (rLvl >= 4) {
      features.push({
        id: 'rogue_uncanny_dodge',
        name: rLvl >= 8 ? 'Improved Uncanny Dodge' : 'Uncanny Dodge',
        source: `Rogue ${rLvl}`,
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

  // ==========================================
  // 4. PRESTIGE CLASS FEATURES
  // ==========================================
  activeClasses.forEach((cls: any) => {
    const prcDef = PRESTIGE_CLASSES_REGISTRY[cls.classType];
    if (!prcDef) return;

    const prcLevel = cls.level || 1;
    const computed = getPrestigeClassFeatures(pc, cls.classType);

    // Shadowbane Inquisitor specific
    if (cls.classType === 'shadowbane_inquisitor') {
      features.push({
        id: 'shadowbane_absolute_conviction',
        name: 'Absolute Conviction',
        source: `Shadowbane Inquisitor ${prcLevel}`,
        category: 'passive',
        typeLabel: 'Code of Conduct',
        summary: `Maintain your paladin abilities even when multiclassing freely or using rogue skills in the service of justice.`,
        rawRules: `A Shadowbane Inquisitor's dedication to hunting corruption shields her moral conviction. She can freely multiclass between Paladin and Rogue without penalty or losing paladin class features.`,
        actionType: 'Passive',
      });

      features.push({
        id: 'shadowbane_pierce_shadows',
        name: 'Pierce Shadows',
        source: `Shadowbane Inquisitor ${prcLevel}`,
        category: 'passive',
        typeLabel: 'Sensory Skill Bonus',
        summary: `+5 competence bonus on Search and Spot checks to penetrate disguises, shadows, and concealment.`,
        rawRules: `An inquisitor is trained to see past falsehoods and mundane gloom. She gains a +5 competence bonus on Search and Spot checks made to pierce disguises or spot concealed creatures.`,
        actionType: 'Passive',
      });

      if (prcLevel >= 2) {
        const stealthBonus = computed.sacredStealth || 4;
        features.push({
          id: 'shadowbane_sacred_stealth',
          name: `Sacred Stealth (+${stealthBonus})`,
          source: `Shadowbane Inquisitor ${prcLevel}`,
          category: 'combat',
          typeLabel: 'Divine Buff',
          summary: `Spend 1 Turn Undead attempt to gain a +${stealthBonus} sacred bonus on Hide and Move Silently for 1 round/lvl.`,
          rawRules: `Starting at 2nd level, a Shadowbane Inquisitor can channel positive energy to mask her presence. By expending one daily use of her turn undead ability, she gains a +${stealthBonus} sacred bonus on Hide and Move Silently checks for a number of rounds equal to her Shadowbane Inquisitor level.`,
          actionType: 'Swift Action',
          duration: `${prcLevel} rounds`,
        });
      }
    } else {
      // Generic prestige class feature mapping from UI rows
      (prcDef.ui?.rows || []).forEach((row: any) => {
        if (row.showIf && !row.showIf(computed)) return;
        const val = computed[row.key];
        if (val === undefined || val === null || val === false) return;

        features.push({
          id: `${cls.classType}_${row.key}`,
          name: row.label,
          source: `${prcDef.name || cls.classType} ${prcLevel}`,
          category: row.format === 'perDay' ? 'daily' : 'passive',
          typeLabel: row.format === 'perDay' ? 'Daily' : 'Passive',
          summary: `${row.label}: ${val}`,
          rawRules: `${row.label} is granted by ${prcDef.name || cls.classType} at level ${prcLevel}. Current value: ${val}`,
          actionType: 'Passive',
        });
      });
    }
  });

  // ==========================================
  // 5. RACIAL TRAITS
  // ==========================================
  const rKey = pc.race || 'human';
  const raceDef = RACES.find((r: any) => r.key === rKey);
  if (raceDef) {
    const traitsList = raceDef.traits || [];
    features.push({
      id: `racial_traits_${rKey}`,
      name: `${raceDef.name || rKey} Racial Traits`,
      source: `Racial (${raceDef.name || rKey})`,
      category: 'passive',
      typeLabel: 'Racial Heritage',
      summary: traitsList.join(' • '),
      rawRules: `Racial traits and abilities granted by your heritage (${raceDef.name}):\n\n` + traitsList.map((t: string) => `• ${t}`).join('\n'),
      actionType: 'Passive',
    });
  }

  return features;
}
