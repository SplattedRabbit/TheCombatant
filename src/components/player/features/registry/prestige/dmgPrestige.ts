/**
 * @module    dmgPrestige
 * @summary   Unified feature definitions for Dungeon Master's Guide (DMG) Prestige Classes:
 *            Assassin, Arcane Trickster, Dragon Disciple, Mystic Theurge.
 */

import type { UnifiedFeature } from '../types.ts';
import { getAblMod } from '../../../attributeHelper.ts';

export function getDMGPrestigeFeatures(pc: any, classType: string, level: number, _computed: any): UnifiedFeature[] {
  const features: UnifiedFeature[] = [];

  // ==========================================
  // ASSASSIN
  // ==========================================
  if (classType === 'assassin') {
    const intScore = typeof pc.int?.getValue === 'function' ? pc.int.getValue() : (pc.int || 10);
    const intMod = getAblMod(intScore);
    const deathDc = 10 + level + intMod;

    // 1. Poison Use (Ex)
    features.push({
      id: 'assassin_poison_use',
      name: 'Poison Use',
      source: `Assassin Lv.${level}`,
      category: 'passive',
      typeLabel: 'Special Training',
      summary: 'Never risk accidentally poisoning yourself when applying poison to a blade or weapon.',
      rawRules: `Assassins are trained in the use of poison and never risk accidentally poisoning themselves when applying poison to a weapon. Applying poison to a weapon normally provokes an attack of opportunity, but with poison use, the character does not run the usual 5% risk of poisoning herself on a natural 1.`,
      actionType: 'Passive',
    });

    // 2. Death Attack (Ex)
    features.push({
      id: 'assassin_death_attack',
      name: `Death Attack (DC ${deathDc} Fortitude)`,
      source: `Assassin Lv.${level}`,
      category: 'combat',
      typeLabel: 'Lethal Strike',
      summary: `Study a victim for 3 rounds + melee sneak attack -> Fortitude save DC ${deathDc} or die / become paralyzed for 1d6+${level} rounds.`,
      rawRules: `If an assassin studies her victim for 3 rounds and then makes a sneak attack with a melee weapon that successfully deals damage, the sneak attack has the additional effect of possibly either paralyzing or killing the target (assassin's choice).

• Observation: While studying the victim, the assassin can undertake other actions so long as her attention stays focused on the target and the target does not detect the assassin or recognize the assassin as an enemy.
• Save: The victim must make a Fortitude saving throw against DC ${deathDc} (10 + Assassin Level + Int Modifier).
• Effect: If the saving throw fails, the victim dies or is paralyzed for 1d6+${level} rounds (assassin's choice). If the saving throw succeeds, the attack is just a normal sneak attack.`,
      actionType: 'Special',
      range: 'Melee',
    });

    // 3. Save Bonus against Poison (Ex) - Level 2+
    if (level >= 2) {
      const poisonBonus = Math.floor(level / 2);
      features.push({
        id: 'assassin_poison_save_bonus',
        name: `Poison Save Bonus (+${poisonBonus})`,
        source: `Assassin Lv.${level}`,
        category: 'passive',
        typeLabel: 'Resistance',
        summary: `+${poisonBonus} competence bonus on saving throws against all types of poisons.`,
        rawRules: `At 2nd level, an assassin gains a +1 competence bonus on Fortitude saves against all poisons. This bonus increases by +1 every two levels thereafter (+2 at 4th, +3 at 6th, +4 at 8th, and +5 at 10th level).`,
        actionType: 'Passive',
      });
    }

    // 4. Uncanny Dodge (Level 2+) & Improved Uncanny Dodge (Level 5+)
    if (level >= 2) {
      features.push({
        id: 'assassin_uncanny_dodge',
        name: level >= 5 ? 'Improved Uncanny Dodge' : 'Uncanny Dodge',
        source: `Assassin Lv.${level}`,
        category: 'passive',
        typeLabel: 'Defense',
        summary: level >= 5
          ? 'Cannot be flanked; only a rogue 4+ levels higher can sneak attack you.'
          : 'Retain Dexterity bonus to AC even if caught flat-footed or struck by an invisible attacker.',
        rawRules: `Starting at 2nd level, an assassin retains her Dexterity bonus to AC (if any) even if she is caught flat-footed or struck by an invisible attacker.

At 5th level, she can no longer be flanked; she can react to opponents on opposite sides of her as easily as she can react to a single attacker, denying rogues the ability to sneak attack her by flanking.`,
        actionType: 'Passive',
      });
    }

    // 5. Hide in Plain Sight (Su) - Level 8+
    if (level >= 8) {
      features.push({
        id: 'assassin_hide_in_plain_sight',
        name: 'Hide in Plain Sight (Shadows)',
        source: `Assassin Lv.${level}`,
        category: 'passive',
        typeLabel: 'Supernatural Stealth',
        summary: 'Can use the Hide skill even while being observed, as long as within 10 ft of a shadow.',
        rawRules: `At 8th level, an assassin can use the Hide skill even while being observed. As long as she is within 10 feet of some sort of shadow (other than her own shadow), an assassin can hide herself from view in the open without anything to actually hide behind. She cannot, however, hide in her own shadow.`,
        actionType: 'Passive',
        range: '10 ft from shadow',
      });
    }
  }

  // ==========================================
  // ARCANE TRICKSTER
  // ==========================================
  if (classType === 'arcane_trickster') {
    const rlUses = level >= 9 ? 3 : (level >= 5 ? 2 : 1);

    // 1. Ranged Legerdemain (Su)
    features.push({
      id: 'arcane_trickster_ranged_legerdemain',
      name: `Ranged Legerdemain (${rlUses}/day)`,
      source: `Arcane Trickster Lv.${level}`,
      category: 'daily',
      typeLabel: 'Telekinetic Manipulation',
      summary: `Use Disable Device, Open Lock, or Sleight of Hand at a range of 30 ft (${rlUses}× per day, DC +10).`,
      rawRules: `An arcane trickster can use Disable Device, Open Lock, or Sleight of Hand at a range of 30 feet. Working at a distance increases the normal skill check DC by 10, and she cannot take 10 on this check. Any object to be manipulated must weigh 5 pounds or less.

She can make only one ranged legerdemain check per day at 1st level, two per day at 5th level, and three per day at 9th level.`,
      actionType: 'Standard Action',
      range: '30 ft',
      interactive: 'counter',
      dailyAbilityKey: 'Ranged Legerdemain',
    });

    // 2. Impromptu Sneak Attack (Ex) - Level 3+
    if (level >= 3) {
      const impromptuUses = level >= 7 ? 2 : 1;
      features.push({
        id: 'arcane_trickster_impromptu_sneak_attack',
        name: `Impromptu Sneak Attack (${impromptuUses}/day)`,
        source: `Arcane Trickster Lv.${level}`,
        category: 'combat',
        typeLabel: 'Instant Precision Strike',
        summary: `Declare any melee or ranged attack to be a sneak attack (${impromptuUses}× per day, target denied Dex to AC).`,
        rawRules: `Once per day, starting at 3rd level, an arcane trickster can declare one melee or ranged attack to be a sneak attack (the target loses its Dexterity bonus to AC against the attack, regardless of its awareness of the trickster). This ability can be used twice per day at 7th level.

The attack must still meet all other conditions of a sneak attack (e.g., target within 30 feet for ranged attacks, target vulnerable to precision damage).`,
        actionType: 'Free Action',
        interactive: 'counter',
        dailyAbilityKey: 'Impromptu Sneak Attack',
      });
    }
  }

  // ==========================================
  // DRAGON DISCIPLE
  // ==========================================
  if (classType === 'dragon_disciple') {
    const natArmor = level >= 10 ? 4 : (level >= 7 ? 3 : (level >= 4 ? 2 : 1));
    const breathDice = level >= 10 ? '6d8' : (level >= 7 ? '4d8' : (level >= 3 ? '2d8' : ''));

    // 1. Natural Armor Increase (Ex)
    features.push({
      id: 'dragon_disciple_natural_armor',
      name: `Natural Armor (+${natArmor})`,
      source: `Dragon Disciple Lv.${level}`,
      category: 'passive',
      typeLabel: 'Draconic Scales',
      summary: `+${natArmor} Natural Armor bonus to AC from hardened draconic scales.`,
      rawRules: `At 1st level, a dragon disciple's skin develops tiny scales, providing a +1 natural armor bonus to AC. As she attains higher levels, her scales become thicker and harder: +2 at 4th level, +3 at 7th level, and +4 at 10th level.`,
      actionType: 'Passive',
    });

    // 2. Ability Score Boosts (Ex) - Level 2+
    if (level >= 2) {
      const strBonus = level >= 10 ? 8 : (level >= 4 ? 4 : 2);
      const conBonus = level >= 6 ? 2 : 0;
      const intBonus = level >= 8 ? 2 : 0;
      const chaBonus = level >= 10 ? 2 : 0;

      const boosts: string[] = [`+${strBonus} STR`];
      if (conBonus > 0) boosts.push(`+${conBonus} CON`);
      if (intBonus > 0) boosts.push(`+${intBonus} INT`);
      if (chaBonus > 0) boosts.push(`+${chaBonus} CHA`);

      features.push({
        id: 'dragon_disciple_ability_boosts',
        name: `Draconic Might (${boosts.join(', ')})`,
        source: `Dragon Disciple Lv.${level}`,
        category: 'passive',
        typeLabel: 'Permanent Attribute Enhancements',
        summary: `Permanent racial increases to ability scores: ${boosts.join(', ')}.`,
        rawRules: `As a dragon disciple gains levels, she gains permanent ability score increases representing her dragon heritage:
• 2nd Level: +2 Strength
• 4th Level: +2 Strength (+4 total)
• 6th Level: +2 Constitution
• 8th Level: +2 Intelligence
• 10th Level: +4 Strength (+8 total), +2 Charisma`,
        actionType: 'Passive',
      });
    }

    // 3. Breath Weapon (Su) - Level 3+
    if (level >= 3 && breathDice) {
      const conScore = typeof pc.con?.getValue === 'function' ? pc.con.getValue() : (pc.con || 10);
      const conMod = getAblMod(conScore);
      const breathDc = 10 + level + conMod;

      features.push({
        id: 'dragon_disciple_breath_weapon',
        name: `Breath Weapon (${breathDice} • DC ${breathDc} Reflex)`,
        source: `Dragon Disciple Lv.${level}`,
        category: 'daily',
        typeLabel: 'Elemental Breath (1/day)',
        summary: `Breathe a cone or line of elemental energy dealing ${breathDice} damage (Reflex half DC ${breathDc}).`,
        rawRules: `At 3rd level, a dragon disciple gains a breath weapon of the dragon variety chosen (cone of cold/fire/acid or line of acid/lightning/fire). Once per day, she can breathe energy dealing ${breathDice} damage.

• Reflex Save: DC ${breathDc} (10 + Dragon Disciple Level + Con Mod) for half damage.
• Progression: 2d8 at 3rd level, 4d8 at 7th level, 6d8 at 10th level.`,
        actionType: 'Standard Action',
        range: '30 ft cone or 60 ft line',
        interactive: 'counter',
        dailyAbilityKey: 'Breath Weapon',
      });
    }

    // 4. Blindsense (Ex) - Level 5+
    if (level >= 5) {
      const blindRange = level >= 10 ? '60 ft' : '30 ft';
      features.push({
        id: 'dragon_disciple_blindsense',
        name: `Blindsense (${blindRange})`,
        source: `Dragon Disciple Lv.${level}`,
        category: 'passive',
        typeLabel: 'Sensory Mastery',
        summary: `Pinpoint the location of creatures within ${blindRange} without needing visual line of sight.`,
        rawRules: `At 5th level, the dragon disciple gains blindsense with a range of 30 feet. Using nonvisual senses, the character notices things they cannot see and does not need to make Spot or Listen checks to pinpoint the location of creatures within range, provided there is line of effect. Range increases to 60 feet at 10th level.`,
        actionType: 'Passive',
        range: blindRange,
      });
    }

    // 5. Wings (Ex) - Level 9+
    if (level >= 9) {
      features.push({
        id: 'dragon_disciple_wings',
        name: 'Draconic Wings (Fly 60 ft)',
        source: `Dragon Disciple Lv.${level}`,
        category: 'passive',
        typeLabel: 'Flight',
        summary: 'Grows large dragon wings, granting a Fly speed of 60 ft (average maneuverability).',
        rawRules: `At 9th level, a dragon disciple grows a set of wings. She can fly at a speed of 60 feet with average maneuverability (assuming Medium size; 40 ft for Small). A character wearing heavy armor or carrying a heavy load cannot fly.`,
        actionType: 'Passive',
      });
    }

    // 6. Dragon Apotheosis - Level 10
    if (level >= 10) {
      features.push({
        id: 'dragon_disciple_apotheosis',
        name: 'Dragon Apotheosis (Half-Dragon)',
        source: `Dragon Disciple Lv.${level}`,
        category: 'passive',
        typeLabel: 'Type Change & Immunities',
        summary: 'Transforms into a Dragon (Half-Dragon): Low-Light Vision, Darkvision 60 ft, Immunity to Sleep, Paralysis, and Dragon Energy type.',
        rawRules: `At 10th level, a dragon disciple fully transitions into a dragon-kin, gaining the Half-Dragon template. Her creature type changes to Dragon. She gains low-light vision, 60-foot darkvision, immunity to sleep and paralysis effects, and complete immunity to the energy type of her dragon ancestor.`,
        actionType: 'Passive',
      });
    }
  }

  // ==========================================
  // MYSTIC THEURGE
  // ==========================================
  if (classType === 'mystic_theurge') {
    features.push({
      id: 'mystic_theurge_spellcasting',
      name: `Dual Spellcasting Progression (+${level} Arcane & +${level} Divine)`,
      source: `Mystic Theurge Lv.${level}`,
      category: 'passive',
      typeLabel: 'Spell Progression',
      summary: `Advances spells per day and spells known simultaneously in both chosen arcane and divine spellcasting classes at each level.`,
      rawRules: `At each level, a mystic theurge gains new spells per day (and spells known, if applicable) as if she had also gained a level in both an arcane spellcasting class and a divine spellcasting class to which she belonged before adding the prestige class level.

She does not, however, gain any other benefit a character of that class would have gained (such as improved familiar abilities, improved turn undead, wild shape, or bonus feats).`,
      actionType: 'Passive',
    });
  }

  return features;
}
