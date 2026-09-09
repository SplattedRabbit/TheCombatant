/**
 * @module    csPrestige
 * @summary   Unified feature definitions for Complete Scoundrel (CS) Prestige Classes:
 *            Spellwarp Sniper & Battle Trickster.
 */

import type { UnifiedFeature } from '../types.ts';

export function getCSPrestigeFeatures(_pc: any, classType: string, level: number, computed: any): UnifiedFeature[] {
  const features: UnifiedFeature[] = [];

  // ==========================================
  // SPELLWARP SNIPER
  // ==========================================
  if (classType === 'spellwarp_sniper') {
    const maxSpellwarpLvl = Math.min(5, level);

    // 1. Spellwarp (Su)
    features.push({
      id: 'spellwarp_sniper_spellwarp',
      name: `Spellwarp (Max Level ${maxSpellwarpLvl} Spells)`,
      source: `Spellwarp Sniper Lv.${level}`,
      category: 'combat',
      typeLabel: 'Supernatural Ray Conversion',
      summary: `Contort instantaneous area spells of up to level ${maxSpellwarpLvl} into pinpoint rays. Target receives NO Reflex save.`,
      rawRules: `A spellwarp sniper can contort instantaneous area spells into pinpoint rays. She can alter spells up to 1st level at 1st level, up to 2nd level at 2nd level, up to 3rd level at 3rd level, up to 4th level at 4th level, and up to 5th level at 5th level.

• Conversion: You can change the shape of an instantaneous area spell into a ray. The spell requires a ranged touch attack to hit a single target.
• Range: Close range (25 ft + 5 ft/2 caster levels) or the spell's normal range, whichever is greater.
• Saves: A creature struck by a spellwarped spell receives NO Reflex save against the spell's primary effect/damage. If the spell allows another saving throw (such as Fortitude or Will), that saving throw still applies normally.
• Action: Shaping a spell as a ray takes no extra time beyond casting the spell normally.`,
      actionType: 'Free Action',
      range: 'Close (25 ft + 5 ft/2 lvls) or Normal',
      duration: 'Instantaneous',
    });

    // 2. Sudden Raystrike (Ex) - Level 2 & 4
    if (level >= 2) {
      const raystrikeDice = Math.floor(level / 2);
      features.push({
        id: 'spellwarp_sniper_sudden_raystrike',
        name: `Sudden Raystrike +${raystrikeDice}d6`,
        source: `Spellwarp Sniper Lv.${level}`,
        category: 'combat',
        typeLabel: 'Precision Ray Damage',
        summary: `Deals +${raystrikeDice}d6 extra precision damage with rays against flanked foes or those denied Dex to AC within 30 ft.`,
        rawRules: `Beginning at 2nd level, a spellwarp sniper deals +1d6 extra precision damage when striking a target with a ray spell (including any spellwarped spell) under conditions that would allow a sneak attack. This extra damage increases to +2d6 at 4th level.

• Conditions: The target must be denied its Dexterity bonus to AC (whether it actually has a Dex bonus or not) or flanked by the sniper within 30 feet.
• Ray Restriction: This extra damage applies only to ray spells or spellwarped spells, not to weapon attacks.
• Immunity: Creatures immune to sneak attacks or critical hits (undead, constructs, oozes, plants) are immune to sudden raystrike precision damage.
• Stacking: Sudden raystrike stacks with sneak attack and sudden strike precision damage from other classes.`,
        actionType: 'Passive',
        range: '30 ft',
      });
    }

    // 3. Precise Shot (Ex) - Level 3
    if (level >= 3) {
      features.push({
        id: 'spellwarp_sniper_precise_shot',
        name: 'Precise Shot (Bonus Feat)',
        source: `Spellwarp Sniper Lv.${level}`,
        category: 'passive',
        typeLabel: 'Combat Feat',
        summary: `Shoot rays and ranged attacks into melee without taking the standard -4 penalty on attack rolls.`,
        rawRules: `At 3rd level, a spellwarp sniper gains Precise Shot as a bonus feat.

You can shoot or throw ranged weapons and cast ray spells at an opponent engaged in melee without taking the standard -4 penalty on your attack roll.`,
        actionType: 'Passive',
      });
    }

    // 4. Ray Mastery (Ex) - Level 5
    if (level >= 5) {
      features.push({
        id: 'spellwarp_sniper_ray_mastery',
        name: 'Ray Mastery (60 ft Precision, Ray Coup de Grace & Empower 1/day)',
        source: `Spellwarp Sniper Lv.${level}`,
        category: 'combat',
        typeLabel: 'Class Mastery',
        summary: `Apply Sudden Raystrike/Sneak Attack on rays up to 60 ft, deliver adjacent Coup de Grace with rays, and 1/day Empower Ray for free.`,
        rawRules: `At 5th level, you attain unequaled control over your ray spells. This control manifests in three ways:

• 60-Foot Precision Range: You can apply the extra damage from the sudden raystrike ability (as well as any additional sneak attack or sudden strike damage from other sources) to ray attacks against a target within 60 feet, instead of 30 feet.
• Ray Coup de Grace: You can deliver a coup de grace with a ray spell that deals hit point damage. You must be adjacent to your target to deliver the coup de grace.
• 1/Day Empower Ray: Once per day, you can empower a single ray spell, as though with the Empower Spell feat, without any adjustment to the spell's level or casting time. This effect applies equally to spells that are already rays and those you warp into rays.`,
        actionType: 'Swift Action',
        range: '60 ft precision / Adjacent Coup de Grace',
        interactive: 'counter',
        dailyAbilityKey: 'Ray Mastery: Empower',
      });
    }
  }

  // ==========================================
  // BATTLE TRICKSTER
  // ==========================================
  if (classType === 'battle_trickster') {
    const bonusTricks = computed?.bonusTricks || (level >= 3 ? 2 : 1);

    // 1. Bonus Tricks
    features.push({
      id: 'battle_trickster_bonus_tricks',
      name: `Bonus Tricks (${bonusTricks} Extra Tricks)`,
      source: `Battle Trickster Lv.${level}`,
      category: 'passive',
      typeLabel: 'Skill Tricks',
      summary: `You gain ${bonusTricks} bonus skill trick(s) that do not count against your maximum limit.`,
      rawRules: `At 1st level and again at 3rd level, a battle trickster gains a bonus skill trick for which she meets the prerequisite. These bonus tricks do not count against her maximum number of skill tricks (which is normally equal to one-half character level).`,
      actionType: 'Passive',
    });

    // 2. Bonus Feat (Level 2)
    if (level >= 2) {
      features.push({
        id: 'battle_trickster_bonus_feat',
        name: 'Bonus Combat Feat',
        source: `Battle Trickster Lv.${level}`,
        category: 'passive',
        typeLabel: 'Fighter Feat',
        summary: `Gain a bonus combat feat selected from the fighter bonus feat list.`,
        rawRules: `At 2nd level, a battle trickster gains a bonus feat. This feat must be selected from the list of fighter bonus feats. You must meet all prerequisites for the chosen feat.`,
        actionType: 'Passive',
      });
    }

    // 3. Tricky Fighting (Level 3)
    if (level >= 3) {
      features.push({
        id: 'battle_trickster_tricky_fighting',
        name: 'Tricky Fighting (+1 Damage)',
        source: `Battle Trickster Lv.${level}`,
        category: 'combat',
        typeLabel: 'Combat Precision',
        summary: `+1 competence bonus on weapon damage rolls whenever you use a skill trick or strike a flat-footed/flanked foe.`,
        rawRules: `At 3rd level, a battle trickster has mastered combining combat prowess with deception.

Whenever she successfully uses a skill trick in combat, or strikes an opponent that is flat-footed or flanked, she gains a +1 competence bonus on all weapon damage rolls made in that round.`,
        actionType: 'Free Action',
      });
    }
  }

  return features;
}
