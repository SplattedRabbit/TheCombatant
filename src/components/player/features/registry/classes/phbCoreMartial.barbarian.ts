/**
 * @module    phbCoreMartial.barbarian
 * @summary   Barbarian class feature definitions (Fast Movement, Rage / Berserker Strength, Uncanny Dodge, Trap Sense, DR, Indomitable Will).
 */

import type { UnifiedFeature } from '../types.ts';

export function getBarbarianFeatures(pc: any, bLvl: number): UnifiedFeature[] {
  const features: UnifiedFeature[] = [];
  const activeACFs: string[] = Array.isArray(pc?.acfs) ? pc.acfs : [];
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

  return features;
}
