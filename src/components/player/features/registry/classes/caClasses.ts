/**
 * @module    caClasses
 * @summary   Unified feature definitions for Complete Adventurer (CA) Base Classes:
 *            Ninja, Scout, Spellthief.
 */

import type { UnifiedFeature } from '../types.ts';
import { getAblMod } from '../../../attributeHelper';

export function getCAClassFeatures(pc: any, classMap: Map<string, number>): UnifiedFeature[] {
  const features: UnifiedFeature[] = [];

  // ==========================================
  // NINJA
  // ==========================================
  if (classMap.has('ninja')) {
    const nLvl = classMap.get('ninja')!;
    const wisScore = typeof pc.wis?.getValue === 'function' ? pc.wis.getValue() : (pc.wis || 10);
    const wisMod = Math.max(0, getAblMod(wisScore));
    const kiUses = Math.max(1, Math.floor(nLvl / 2) + wisMod);
    const ssDice = Math.floor((nLvl + 1) / 2);

    // 1. Sudden Strike (+Xd6)
    features.push({
      id: 'ninja_sudden_strike',
      name: `Sudden Strike +${ssDice}d6`,
      source: `Ninja Lv.${nLvl}`,
      category: 'combat',
      typeLabel: 'Precision Damage',
      summary: `Deals +${ssDice}d6 extra precision damage whenever the target is denied its Dexterity bonus to AC.`,
      rawRules: `If a ninja can catch an opponent when he is unable to defend himself effectively from her attack, she can strike a vital spot for extra damage. Whenever the target is denied a Dexterity bonus to AC (whether the target actually has a Dex bonus or not), the ninja's attack deals an extra +${ssDice}d6 points of damage.

Unlike sneak attack, sudden strike damage cannot be delivered simply by flanking an opponent. Ranged attacks must be within 30 feet. Constructs, undead, plants, oozes, and creatures immune to critical hits are immune to sudden strike damage.`,
      actionType: 'Passive',
      range: 'Melee or 30 ft ranged',
    });

    // 2. Ki Power (Ghost Step, Ki Dodge, Ghost Strike, Greater Ghost Step, Greater Ki Dodge, Blindsight)
    features.push({
      id: 'ninja_ki_power',
      name: `Ki Power (${kiUses}/day • Ghost Step / Invisibility)`,
      source: `Ninja Lv.${nLvl}`,
      category: 'daily',
      typeLabel: 'Supernatural Ki Pool',
      summary: `Spend 1 ki use as a swift action: Ghost Step (become invisible for 1 round)${nLvl >= 6 ? ', Ki Dodge (20% concealment miss chance)' : ''}${nLvl >= 8 ? ', Ghost Strike (strike ethereal creatures)' : ''}${nLvl >= 10 ? ', Greater Ghost Step (become ethereal)' : ''}${nLvl >= 14 ? ', Greater Ki Dodge (50% total concealment)' : ''}${nLvl >= 16 ? ', Blindsight 30 ft' : ''}. +2 on Will saves when pool is not empty.`,
      rawRules: `A ninja can channel her ki to manifest supernatural stealth and evasion abilities ${kiUses} times per day (equal to 1/2 ninja level + Wisdom modifier). As long as the ninja's ki pool is not empty (at least 1 daily use remains), she gains a +2 bonus on Will saves.

• Ghost Step (2nd+): Become invisible for 1 round as a swift action.
• Ki Dodge (6th+): Gain concealment (20% miss chance) for 1 round as a swift action.
• Ghost Strike (8th+): Attacks pass into the Ethereal Plane, striking incorporeal or ethereal foes with full normal damage.
• Greater Ghost Step (10th+): Turn ethereal instead of invisible for 1 round as a swift action.
• Greater Ki Dodge (14th+): Gain total concealment (50% miss chance) for 1 round as a swift action.
• Blindsight (16th+): Gain blindsight out to 30 feet for 1 round as a swift action.`,
      actionType: 'Swift Action',
      duration: '1 round per use',
      interactive: 'counter',
      dailyAbilityKey: 'Ki Power',
    });

    // 3. AC Bonus & Trapfinding
    const classAcBonus = Math.floor(nLvl / 5);
    features.push({
      id: 'ninja_ac_trapfinding',
      name: `Ninja AC Bonus (+${wisMod + classAcBonus}) & Trapfinding`,
      source: `Ninja Lv.${nLvl}`,
      category: 'passive',
      typeLabel: 'Unarmored Defense',
      summary: `Adds Wisdom modifier (+${wisMod}) and +${classAcBonus} class bonus to AC when unarmored and unencumbered. Can find and disarm magical traps.`,
      rawRules: `When unarmored and unencumbered, a ninja adds her Wisdom bonus (if any) to her AC. In addition, she gains a +1 bonus to AC at 5th level and every 5 levels thereafter (+2 at 10th, +3 at 15th, +4 at 20th level). This bonus applies even against touch attacks or when flat-footed.

A ninja can use Search to locate traps with DC > 20 and Disable Device to disarm magical traps, just like a rogue.`,
      actionType: 'Passive',
    });

    // 4. Poison Use (3rd) & Improved Poison Use (9th)
    if (nLvl >= 3) {
      features.push({
        id: 'ninja_poison_use',
        name: nLvl >= 9 ? 'Improved Poison Use (Move Action)' : 'Poison Use',
        source: `Ninja Lv.${nLvl}`,
        category: 'passive',
        typeLabel: 'Special Quality',
        summary: nLvl >= 9 ? 'Never accidentally poison self; apply poison to a weapon as a move action.' : 'Never accidentally poison self when applying poison to a weapon.',
        rawRules: nLvl >= 9
          ? `At 3rd level, a ninja never risks accidentally poisoning herself when applying poison to a weapon. At 9th level, she can apply poison to a weapon as a move action rather than a standard action.`
          : `At 3rd level, a ninja never risks accidentally poisoning herself when applying poison to a weapon.`,
        actionType: 'Passive',
      });
    }

    // 5. Great Leap (4th)
    if (nLvl >= 4) {
      features.push({
        id: 'ninja_great_leap',
        name: 'Great Leap (+4 Jump & Running Start)',
        source: `Ninja Lv.${nLvl}`,
        category: 'passive',
        typeLabel: 'Mobility (Su)',
        summary: 'Always make Jump checks as if running with the Run feat (+4 bonus, no running start required) when unarmored/light load.',
        rawRules: `At 4th level and higher, a ninja always makes Jump checks as if she were running and had the Run feat, enabling her to make long jumps without a running start and granting a +4 bonus on the jump check. Usable only when wearing no armor and carrying no more than a light load.`,
        actionType: 'Passive',
      });
    }

    // 6. Acrobatics (6th: +2, 12th: +4, 18th: +6)
    if (nLvl >= 6) {
      const acroBonus = nLvl >= 18 ? 6 : (nLvl >= 12 ? 4 : 2);
      features.push({
        id: 'ninja_acrobatics',
        name: `Acrobatics (+${acroBonus} Climb, Jump, Tumble)`,
        source: `Ninja Lv.${nLvl}`,
        category: 'passive',
        typeLabel: 'Skill Bonus (Ex)',
        summary: `+${acroBonus} competence bonus on Climb, Jump, and Tumble checks.`,
        rawRules: `Starting at 6th level, a ninja gains a +2 bonus on Climb, Jump, and Tumble checks. This bonus increases to +4 at 12th level and +6 at 18th level.`,
        actionType: 'Passive',
      });
    }

    // 7. Speed Climb (7th)
    if (nLvl >= 7) {
      features.push({
        id: 'ninja_speed_climb',
        name: 'Speed Climb (Full Land Speed)',
        source: `Ninja Lv.${nLvl}`,
        category: 'passive',
        typeLabel: 'Mobility (Ex)',
        summary: 'Scramble up or down walls at full land speed with two free hands (unarmored/light load).',
        rawRules: `A ninja of 7th level or higher can scramble up or down walls and slopes with great speed. She can climb at her normal speed as a standard move action without taking the standard -5 penalty. She needs both hands free, must be unarmored, and cannot carry more than a light load.`,
        actionType: 'Passive',
      });
    }

    // 8. Evasion (12th)
    if (nLvl >= 12) {
      features.push({
        id: 'ninja_evasion',
        name: 'Evasion',
        source: `Ninja Lv.${nLvl}`,
        category: 'passive',
        typeLabel: 'Defensive Agility (Ex)',
        summary: 'Take no damage on successful Reflex saving throws against area attacks.',
        rawRules: `At 12th level, a ninja gains evasion. If she makes a successful Reflex saving throw against an attack that normally inflicts half damage on a successful save, she instead takes no damage. Usable only when wearing no armor and carrying no more than a light load.`,
        actionType: 'Passive',
      });
    }

    // 9. Ghost Mind (17th)
    if (nLvl >= 17) {
      features.push({
        id: 'ninja_ghost_mind',
        name: 'Ghost Mind (+2 vs Divinations & Reroll)',
        source: `Ninja Lv.${nLvl}`,
        category: 'passive',
        typeLabel: 'Mental Shield (Ex)',
        summary: '+2 bonus on saves against Divination spells; if failed, immediately attempt a second saving throw.',
        rawRules: `At 17th level, a ninja gains a +2 bonus on saving throws against divination spells and effects. Furthermore, if she fails a saving throw against a divination spell or effect, she immediately gets a second saving throw at the same DC to resist it.`,
        actionType: 'Passive',
      });
    }

    // 10. Ghost Sight (20th)
    if (nLvl >= 20) {
      features.push({
        id: 'ninja_ghost_sight',
        name: 'Ghost Sight (See Invisible & Ethereal)',
        source: `Ninja Lv.${nLvl}`,
        category: 'passive',
        typeLabel: 'Sensory Mastery (Su)',
        summary: 'Permanently see invisible and ethereal creatures as easily as normal creatures.',
        rawRules: `At 20th level, a ninja can see invisible and ethereal creatures and objects as easily as she sees material creatures and objects.`,
        actionType: 'Passive',
      });
    }
  }

  // ==========================================
  // SCOUT
  // ==========================================
  if (classMap.has('scout')) {
    const scLvl = classMap.get('scout')!;
    const skirmishDice = 1 + Math.floor((scLvl - 1) / 4);
    const skirmishAc = Math.floor((scLvl + 1) / 4);

    // 1. Skirmish
    features.push({
      id: 'scout_skirmish',
      name: `Skirmish (+${skirmishDice}d6 Dmg / +${skirmishAc} AC)`,
      source: `Scout Lv.${scLvl}`,
      category: 'combat',
      typeLabel: 'Mobile Precision Strike',
      summary: `Deal +${skirmishDice}d6 extra damage and gain a +${skirmishAc} competence bonus to AC during any round in which you move at least 10 feet.`,
      rawRules: `A scout relies on mobility to deal extra damage and improve her defense. She deals +1d6 extra damage on all attacks made during any round in which she moves at least 10 feet from the space where she began the round. This extra damage increases by +1d6 every four levels (+${skirmishDice}d6 at level ${scLvl}).

At 3rd level, she also gains a +1 competence bonus to AC during any round in which she moves at least 10 feet (increasing to +${skirmishAc} at level ${scLvl}).

This extra damage applies only to attacks made within 30 feet and only against living creatures with discernible anatomies. The scout must be wearing light armor or no armor.`,
      actionType: 'Passive',
      range: '30 ft for ranged attacks',
    });

    // 2. Battle Fortitude (2nd+) & Fast Movement (3rd+)
    if (scLvl >= 2) {
      const bfBonus = 1 + Math.floor((scLvl - 2) / 9);
      const speedBonus = 10 * Math.floor(scLvl / 3);
      features.push({
        id: 'scout_battle_fortitude_speed',
        name: `Battle Fortitude (+${bfBonus} Fort & Init) & Fast Movement (+${speedBonus} ft)`,
        source: `Scout Lv.${scLvl}`,
        category: 'passive',
        typeLabel: 'Resilience & Speed',
        summary: `+${bfBonus} competence bonus on Fortitude saves and Initiative checks. +${speedBonus} ft enhancement to land speed in light armor.`,
        rawRules: `At 2nd level, a scout gains a +1 competence bonus on Fortitude saves and Initiative checks (+2 at 11th, +3 at 20th level).

Starting at 3rd level, a scout gains a +10 ft enhancement bonus to her base land speed when wearing light or no armor and carrying a light load (+20 ft at 11th level).`,
        actionType: 'Passive',
      });
    }

    // 3. Flawless Stride (6th+) & Camouflage (8th+) & Blindsight (10th+) & Hide in Plain Sight (14th+)
    if (scLvl >= 6) {
      features.push({
        id: 'scout_flawless_stride',
        name: 'Flawless Stride & Wilderness Stealth',
        source: `Scout Lv.${scLvl}`,
        category: 'passive',
        typeLabel: 'Master Mobility',
        summary: `Move through difficult terrain (scree, thorns, rubble) at full normal speed.${scLvl >= 8 ? ' Hide in any natural terrain without cover.' : ''}${scLvl >= 10 ? ' Blindsight 30 ft.' : ''}${scLvl >= 14 ? ' Hide in Plain Sight.' : ''}`,
        rawRules: `At 6th level, a scout can move through difficult terrain of any sort at normal speed and without taking damage or suffering impairment.

At 8th level, she can use the Hide skill in any natural terrain without cover. At 10th level, she gains Blindsight out to 30 feet. At 14th level, she gains Hide in Plain Sight.`,
        actionType: 'Passive',
      });
    }
  }

  // ==========================================
  // SPELLTHIEF
  // ==========================================
  if (classMap.has('spellthief')) {
    const stLvl = classMap.get('spellthief')!;
    const maxStealLvl = Math.min(9, Math.floor((stLvl + 1) / 2));

    // 1. Steal Spell (Su)
    features.push({
      id: 'spellthief_steal_spell',
      name: `Steal Spell (Up to Level ${maxStealLvl} Spells)`,
      source: `Spellthief Lv.${stLvl}`,
      category: 'combat',
      typeLabel: 'Spell Siphoning',
      summary: `Forgo 1d6 of sneak attack damage on a successful strike to siphon a spell of up to ${maxStealLvl}. level from a touched or sneak attacked foe.`,
      rawRules: `A spellthief can siphon spell energy from a target and use it himself. A spellthief who hits an opponent with a successful sneak attack can choose to forgo 1d6 points of sneak attack damage to steal a prepared spell or spell slot of up to ${maxStealLvl} level from the target.

• Target Loss: The target loses one prepared spell or spell slot of the chosen level (or highest level available).
• Casting Stolen Spells: The spellthief can cast the stolen spell himself within 1 hour, using his own stats or the victim's caster level.
• Storage Pool: A spellthief can hold a total number of stolen spell levels equal to his class level (${stLvl} spell levels).`,
      actionType: 'Free Action',
      duration: '1 hour to cast stolen spell',
    });

    // 2. Steal Spell Effect (2nd+) & Steal Energy Resistance (3rd+)
    if (stLvl >= 2) {
      features.push({
        id: 'spellthief_steal_effects',
        name: 'Steal Spell Effect & Energy Resistance',
        source: `Spellthief Lv.${stLvl}`,
        category: 'combat',
        typeLabel: 'Buff Siphoning',
        summary: `Forgo 1d6 sneak attack damage to strip an active ongoing spell buff from a target for ${stLvl} minute(s), or steal 10 points of energy resistance.`,
        rawRules: `At 2nd level, a spellthief who hits an opponent with a sneak attack can forgo 1d6 damage to steal an active, ongoing spell effect (such as bull's strength or invisibility) from the target, suppressing it on the victim and granting its benefit to the spellthief for ${stLvl} minute(s).

At 3rd level, he can forgo 1d6 sneak attack damage to steal 10 points of an energy resistance from a foe for 1 minute.`,
        actionType: 'Free Action',
        duration: `${stLvl} minutes`,
      });
    }

    // 3. Absorb Spell (4th+) & Arcane Sight (5th+)
    if (stLvl >= 4) {
      features.push({
        id: 'spellthief_absorb_spell',
        name: 'Absorb Spell & Arcane Sight',
        source: `Spellthief Lv.${stLvl}`,
        category: 'passive',
        typeLabel: 'Spell Counter / Absorption',
        summary: 'If you succeed on a saving throw against a targeted spell, you can absorb the spell energy into your pool instead of being affected.',
        rawRules: `Beginning at 4th level, if a spellthief succeeds on a saving throw against a targeted spell directed at him, he can attempt a level check (1d20 + class level vs. DC 10 + spell level) to absorb the spell entirely into his stolen spell pool.

At 5th level, he can use Arcane Sight at will to see magical auras on creatures and objects within 120 feet.`,
        actionType: 'Immediate Action',
      });
    }
  }

  return features;
}
