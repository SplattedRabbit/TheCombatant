/**
 * @module    phb2Classes
 * @summary   Unified feature definitions for Player's Handbook II (PHB2) Classes:
 *            Duskblade, Beguiler, Knight, Dragon Shaman.
 */

import type { UnifiedFeature } from '../types.ts';

export function getPHB2ClassFeatures(pc: any, classMap: Map<string, number>): UnifiedFeature[] {
  const features: UnifiedFeature[] = [];

  // ==========================================
  // DUSKBLADE
  // ==========================================
  if (classMap.has('duskblade')) {
    const dLvl = classMap.get('duskblade')!;

    // 1. Armored Mage & Arcane Attunement
    features.push({
      id: 'duskblade_armored_mage',
      name: 'Armored Mage & Arcane Attunement',
      source: `Duskblade Lv.${dLvl}`,
      category: 'passive',
      typeLabel: 'Combat Casting',
      summary: `Cast duskblade spells in light${dLvl >= 4 ? ' and medium' : ''} armor and with heavy shields without arcane spell failure. Cast 0-level cantrips (Dancing Lights, Detect Magic, Flare, Ghost Sound, Read Magic) at will/day.`,
      rawRules: `A duskblade can cast duskblade spells while wearing light armor and using a light shield without incurring the normal arcane spell failure chance. At 4th level, this extends to medium armor and heavy shields.

Arcane Attunement allows a duskblade to cast Dancing Lights, Detect Magic, Flare, Ghost Sound, and Read Magic as spell-like abilities (each usable 3 + Int mod times per day).`,
      actionType: 'Passive',
    });

    // 2. Arcane Channeling (3rd+)
    if (dLvl >= 3) {
      features.push({
        id: 'duskblade_arcane_channeling',
        name: dLvl >= 13 ? 'Arcane Channeling (Full Attack)' : 'Arcane Channeling (Standard Action)',
        source: `Duskblade Lv.${dLvl}`,
        category: 'combat',
        typeLabel: 'Spell Strike',
        summary: dLvl >= 13
          ? 'Channel touch spells through weapon melee attacks, discharging the spell against each target struck in a full attack action.'
          : 'Cast any touch spell and deliver it through a melee weapon strike as a standard action.',
        rawRules: `Beginning at 3rd level, a duskblade can use a standard action to cast any touch spell he knows and deliver the spell through his weapon with a melee attack. No attack roll for the spell is needed; if the melee attack hits, the weapon attack deals normal damage and the spell takes effect.

At 13th level, he can cast any touch spell as part of a full attack action, delivering the spell through every melee attack he makes in that round against multiple foes.`,
        actionType: dLvl >= 13 ? 'Full-Round Action' : 'Standard Action',
      });
    }

    // 3. Quick Cast (5th+)
    if (dLvl >= 5) {
      const qcCount = dLvl >= 20 ? 4 : (dLvl >= 15 ? 3 : (dLvl >= 10 ? 2 : 1));
      features.push({
        id: 'duskblade_quick_cast',
        name: `Quick Cast (${qcCount}/day)`,
        source: `Duskblade Lv.${dLvl}`,
        category: 'daily',
        typeLabel: 'Swift Metamagic',
        summary: `Cast one duskblade spell as a swift action ${qcCount}× per day.`,
        rawRules: `Beginning at 5th level, you can cast one duskblade spell per day as a swift action, so long as the spell's normal casting time is 1 standard action. You gain additional daily uses at 10th (2/day), 15th (3/day), and 20th level (4/day).`,
        actionType: 'Swift Action',
        interactive: 'counter',
        dailyAbilityKey: 'Quick Cast',
      });
    }

    // 4. Spell Power (6th+)
    if (dLvl >= 6) {
      const spBonus = dLvl >= 18 ? 5 : (dLvl >= 16 ? 4 : (dLvl >= 11 ? 3 : 2));
      features.push({
        id: 'duskblade_spell_power',
        name: `Spell Power (+${spBonus} to Overcome SR)`,
        source: `Duskblade Lv.${dLvl}`,
        category: 'combat',
        typeLabel: 'Spell Penetration',
        summary: `+${spBonus} bonus on caster level checks to overcome spell resistance when you hit a target with a melee attack in the same round.`,
        rawRules: `Starting at 6th level, if you successfully strike an opponent with a melee attack, you gain a +2 bonus on your caster level check to overcome that opponent's spell resistance for the rest of your turn. This bonus increases to +3 at 11th, +4 at 16th, and +5 at 18th level.`,
        actionType: 'Passive',
      });
    }
  }

  // ==========================================
  // BEGUILER
  // ==========================================
  if (classMap.has('beguiler')) {
    const bgLvl = classMap.get('beguiler')!;

    // 1. Armored Mage & Trapfinding
    features.push({
      id: 'beguiler_armored_trapfinding',
      name: 'Armored Mage & Trapfinding',
      source: `Beguiler Lv.${bgLvl}`,
      category: 'passive',
      typeLabel: 'Subterfuge & Magic',
      summary: 'Cast beguiler spells in light armor with no arcane spell failure. Locate and disarm magical traps using Search and Disable Device.',
      rawRules: `A beguiler can cast beguiler spells while wearing light armor without incurring the normal arcane spell failure chance.

Like a rogue, a beguiler can use the Search skill to locate traps when the task has a DC higher than 20, and the Disable Device skill to disarm magic traps.`,
      actionType: 'Passive',
    });

    // 2. Cloaked Casting (2nd+) & Surprise Casting (2nd+)
    if (bgLvl >= 2) {
      const dcBonus = bgLvl >= 14 ? '+2 DC & +4 SR' : (bgLvl >= 8 ? '+1 DC & +2 SR' : '+1 DC');
      features.push({
        id: 'beguiler_cloaked_casting',
        name: `Cloaked Casting (${dcBonus})`,
        source: `Beguiler Lv.${bgLvl}`,
        category: 'combat',
        typeLabel: 'Deceptive Spellcasting',
        summary: `+1 to +2 save DC and bonus to overcome SR when casting a spell at a target denied Dexterity bonus to AC.`,
        rawRules: `Starting at 2nd level, a beguiler's spells are particularly effective against flat-footed foes. When casting a spell against a target denied its Dexterity bonus to AC, the save DC increases by +1.

At 8th level, you also gain a +2 bonus on caster level checks to overcome the target's SR. At 14th level, the DC bonus rises to +2 and the SR check bonus to +4.`,
        actionType: 'Passive',
      });
    }

    // 3. Advanced Learning (3rd, 7th, 11th, 15th, 19th)
    if (bgLvl >= 3) {
      const alCount = 1 + Math.floor((bgLvl - 3) / 4);
      features.push({
        id: 'beguiler_advanced_learning',
        name: `Advanced Learning (${alCount} Spells Added)`,
        source: `Beguiler Lv.${bgLvl}`,
        category: 'passive',
        typeLabel: 'Expanded Spells Known',
        summary: `You have added ${alCount} advanced illusion or enchantment spell(s) from the sorcerer/wizard spell list to your spell list.`,
        rawRules: `At 3rd, 7th, 11th, 15th, and 19th level, a beguiler can add a new spell to her list, chosen from the sorcerer/wizard spell list of the illusion or enchantment schools.`,
        actionType: 'Passive',
      });
    }
  }

  // ==========================================
  // KNIGHT
  // ==========================================
  if (classMap.has('knight')) {
    const kLvl = classMap.get('knight')!;
    const chaScore = typeof pc.cha?.getValue === 'function' ? pc.cha.getValue() : (pc.cha || 10);
    const chaMod = Math.max(0, Math.floor((chaScore - 10) / 2));
    const challengeUses = Math.max(1, Math.floor(kLvl / 2) + chaMod);

    // 1. Knight's Challenge
    features.push({
      id: 'knight_challenge',
      name: `Knight's Challenge (${challengeUses}/day • Test of Mettle)`,
      source: `Knight Lv.${kLvl}`,
      category: 'daily',
      typeLabel: 'Martial Challenge',
      summary: `Issue combat challenges ${challengeUses}× per day: Fighting Challenge (+${1 + Math.floor((kLvl - 1) / 6)} morale attack/damage/saves)${kLvl >= 4 ? ', Test of Mettle (Will save forces foes to attack you)' : ''}${kLvl >= 8 ? ', Call to Battle' : ''}${kLvl >= 12 ? ', Daunting Challenge' : ''}.`,
      rawRules: `A knight can issue challenges to opponents on the battlefield ${challengeUses} times per day.

• Fighting Challenge: Gain a +${1 + Math.floor((kLvl - 1) / 6)} morale bonus on attack rolls, weapon damage rolls, and Will saves against a designated opponent for a number of rounds equal to 5 + Cha modifier.${kLvl >= 4 ? `\n• Test of Mettle (DC ${10 + Math.floor(kLvl / 2) + chaMod} Will): Compel all enemies within 100 ft (with Int 3+) to focus their attacks exclusively on you.` : ''}${kLvl >= 8 ? '\n• Call to Battle: Grant an ally a new saving throw against fear as a swift action.' : ''}${kLvl >= 12 ? '\n• Daunting Challenge: Shake all foes within 100 ft (Will DC 10 + 1/2 lvl + Cha).' : ''}`,
      actionType: 'Swift Action',
      interactive: 'counter',
      dailyAbilityKey: "Knight's Challenge",
    });

    // 2. Knight's Code & Shield Block
    const shieldBonus = 1 + Math.floor((kLvl - 2) / 9);
    features.push({
      id: 'knight_shield_block',
      name: `Shield Block (+${shieldBonus} AC) & Bulwark of Defense`,
      source: `Knight Lv.${kLvl}`,
      category: 'combat',
      typeLabel: 'Protective Stance',
      summary: `Designate one opponent to gain +${shieldBonus} bonus shield AC. Opponents treat threatened squares as difficult terrain (at 3rd level).`,
      rawRules: `At 2nd level, a knight can designate one opponent on his turn as a swift action to gain an additional +1 shield bonus to AC against that foe (+2 at 11th, +3 at 20th level).

At 3rd level (Bulwark of Defense), an opponent that begins its turn in your threatened area treats all squares you threaten as difficult terrain, preventing full charges and 5-foot steps.`,
      actionType: 'Swift Action',
    });
  }

  // ==========================================
  // DRAGON SHAMAN
  // ==========================================
  if (classMap.has('dragon_shaman')) {
    const dsLvl = classMap.get('dragon_shaman')!;
    const auraBonus = 1 + Math.floor((dsLvl - 1) / 5);

    // 1. Draconic Auras
    features.push({
      id: 'dragon_shaman_auras',
      name: `Draconic Auras (+${auraBonus} Aura Bonus)`,
      source: `Dragon Shaman Lv.${dsLvl}`,
      category: 'aura',
      typeLabel: 'Party Aura (30 ft)',
      summary: `Project a draconic aura granting +${auraBonus} to all allies within 30 ft (Vigor: Fast Healing up to 50% HP, Energy Shield, Power, Presence, Resistance, Senses, Toughness).`,
      rawRules: `A dragon shaman can project a draconic aura granting yourself and all allies within 30 feet a special benefit (+${auraBonus} bonus):
• Vigor: Fast Healing ${auraBonus} to allies below one-half maximum hit points.
• Energy Shield: Deal ${2 * auraBonus} elemental damage to attackers who strike with melee or natural weapons.
• Power: +${auraBonus} bonus on melee damage rolls.
• Presence: +${auraBonus} bonus on Bluff, Diplomacy, and Intimidate checks.
• Resistance: Energy resistance ${5 * auraBonus} against totem energy.
• Senses: +${auraBonus} bonus on Listen, Spot, and Initiative checks.
• Toughness: Damage Reduction ${auraBonus}/magic.`,
      actionType: 'Swift Action',
      range: '30 ft emanation',
    });

    // 2. Breath Weapon (4th+)
    if (dsLvl >= 4) {
      const breathDice = `${Math.floor(dsLvl / 2)}d6`;
      const conScore = typeof pc.con?.getValue === 'function' ? pc.con.getValue() : (pc.con || 10);
      const conMod = Math.floor((conScore - 10) / 2);
      const breathDc = 10 + Math.floor(dsLvl / 2) + conMod;

      features.push({
        id: 'dragon_shaman_breath_weapon',
        name: `Breath Weapon (${breathDice} • DC ${breathDc} Reflex)`,
        source: `Dragon Shaman Lv.${dsLvl}`,
        category: 'combat',
        typeLabel: 'Supernatural Breath',
        summary: `Breathe a cone or line of totem elemental energy dealing ${breathDice} damage (Reflex half DC ${breathDc}). Recharges in 1d4 rounds.`,
        rawRules: `At 4th level, you gain a breath weapon corresponding to your totem dragon dealing ${breathDice} points of energy damage in a cone (30 ft) or line (60 ft). A successful Reflex save (DC ${breathDc} = 10 + 1/2 Dragon Shaman level + Con modifier) halves the damage. Once used, you must wait 1d4 rounds before breathing again.`,
        actionType: 'Standard Action',
        range: '30 ft cone or 60 ft line',
      });
    }

    // 3. Touch of Vitality (5th+) & Draconic Resolve (4th+)
    if (dsLvl >= 5) {
      const healPool = 2 * dsLvl;
      features.push({
        id: 'dragon_shaman_touch_vitality',
        name: `Touch of Vitality (${healPool} HP Pool)`,
        source: `Dragon Shaman Lv.${dsLvl}`,
        category: 'daily',
        typeLabel: 'Healing Pool',
        summary: `Heal living creatures by touch up to ${healPool} HP per day, or spend healing points to cure conditions (paralysis, poison, disease, blind).`,
        rawRules: `At 5th level, you can heal the wounds of living creatures by touch. Each day you can heal a total number of hit points equal to twice your dragon shaman level (${healPool} HP). You can also spend pool points to cure conditions (e.g., 5 HP to remove fatigued/dazed/sickened; 10 HP to remove diseased/exhausted/poisoned/stunned).`,
        actionType: 'Standard Action',
        range: 'Touch',
        interactive: 'counter',
        dailyAbilityKey: 'Touch of Vitality',
      });
    }
  }

  return features;
}
