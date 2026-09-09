/**
 * @module    phbCoreCaster
 * @summary   Unified feature definitions for Player's Handbook (PHB) Core Spellcasting Classes:
 *            Bard, Cleric, Druid, Sorcerer, Wizard.
 */

import type { UnifiedFeature } from '../types.ts';
import { DOMAINS_REGISTRY } from '../../../../../../js/data/domains-data.js';

export function getPHBCoreCasterFeatures(pc: any, classMap: Map<string, number>): UnifiedFeature[] {
  const features: UnifiedFeature[] = [];
  const activeACFs: string[] = Array.isArray(pc?.acfs) ? pc.acfs : [];

  // ==========================================
  // BARD
  // ==========================================
  if (classMap.has('bard')) {
    const bLvl = classMap.get('bard')!;
    const musicUses = bLvl;
    const icBonus = 1 + Math.floor((bLvl - 1) / 6); // +1 at 1st, +2 at 8th, +3 at 14th, +4 at 20th

    // 1. Bardic Music
    features.push({
      id: 'bard_bardic_music',
      name: `Bardic Music (${musicUses}/day • Inspire Courage +${icBonus})`,
      source: `Bard Lv.${bLvl}`,
      category: 'daily',
      typeLabel: 'Supernatural Performance',
      summary: `Channel musical energy ${musicUses}× per day: Inspire Courage (+${icBonus} attack/damage/saves), Countersong, Fascinate${bLvl >= 3 ? ', Inspire Competence' : ''}${bLvl >= 6 ? ', Suggestion' : ''}${bLvl >= 9 ? ', Inspire Greatness' : ''}${bLvl >= 12 ? ', Song of Freedom' : ''}${bLvl >= 15 ? ', Inspire Heroics' : ''}.`,
      rawRules: `Once per day per bard level, a bard can use his song or poetics to produce magical effects on those around him (usually requiring a Perform skill check).

• Inspire Courage (+${icBonus}): An affected ally receives a +${icBonus} morale bonus on saving throws against charm and fear effects and a +${icBonus} morale bonus on attack and weapon damage rolls. Lasts for the duration of the performance + 5 rounds thereafter.
• Countersong: Use musical counters to disrupt magical sonic or language-dependent attacks.
• Fascinate: Cause up to ${Math.floor(bLvl / 3) || 1} creature(s) to become fascinated by your performance (Will save DC 10 + 1/2 Bard level + Cha mod).${bLvl >= 3 ? '\n• Inspire Competence: Grant +2 competence bonus on skill checks to an ally.' : ''}${bLvl >= 6 ? '\n• Suggestion: Make a suggestion (as the spell) to a fascinated creature.' : ''}${bLvl >= 9 ? '\n• Inspire Greatness: Grant +2 bonus Hit Dice, +2 attack bonus, and +1 Fort save to allies.' : ''}${bLvl >= 12 ? '\n• Song of Freedom: Break enchantments and curses as the break enchantment spell.' : ''}${bLvl >= 15 ? '\n• Inspire Heroics: Grant +4 morale bonus on AC and saving throws to an ally.' : ''}`,
      actionType: 'Standard Action',
      range: '30 ft radius',
      duration: 'Performance + 5 rounds',
      interactive: 'counter',
      dailyAbilityKey: 'Bardic Music',
    });

    // 2. Bardic Knowledge
    const intScore = typeof pc.int?.getValue === 'function' ? pc.int.getValue() : (pc.int || 10);
    const intMod = Math.floor((intScore - 10) / 2);
    features.push({
      id: 'bard_bardic_knowledge',
      name: `Bardic Knowledge (+${bLvl + intMod})`,
      source: `Bard Lv.${bLvl}`,
      category: 'passive',
      typeLabel: 'Lore Check',
      summary: `Roll 1d20 + ${bLvl + intMod} to recall legendary information regarding local history, notable people, or magic items.`,
      rawRules: `A bard may make a special bardic knowledge check with a bonus equal to his bard level + his Intelligence modifier (+${bLvl + intMod}) to see whether he knows some relevant information about local notable people, legendary items, or noteworthy places.`,
      actionType: 'Passive',
    });
  }

  // ==========================================
  // CLERIC (Domains & Spontaneous Casting)
  // ==========================================
  if (classMap.has('cleric')) {
    const cLvl = classMap.get('cleric')!;

    // 1. Spontaneous Casting
    features.push({
      id: 'cleric_spontaneous_casting',
      name: 'Spontaneous Casting (Cure / Inflict)',
      source: `Cleric Lv.${cLvl}`,
      category: 'passive',
      typeLabel: 'Divine Channeling',
      summary: 'Channel stored spell energy into healing (Cure spells for Good clerics) or harm (Inflict spells for Evil clerics).',
      rawRules: `A good cleric (or a neutral cleric of a good deity) can channel stored spell energy into healing spells that she did not prepare ahead of time. She can "lose" any prepared spell that is not a domain spell in order to cast any cure spell of the same spell level or lower.

An evil cleric (or a neutral cleric of an evil deity) can spontaneously convert prepared spells into inflict spells.`,
      actionType: 'Standard Action',
    });

    // 2. Cleric Domains & Granted Powers
    const clericDomains = Array.isArray(pc.clericDomains) ? pc.clericDomains : [];
    if (clericDomains.length > 0 && DOMAINS_REGISTRY) {
      clericDomains.forEach((dKey: string) => {
        const dDef = DOMAINS_REGISTRY[dKey];
        if (!dDef) return;

        features.push({
          id: `cleric_domain_${dKey}`,
          name: `Domain: ${dDef.name}`,
          source: `Cleric Lv.${cLvl}`,
          category: 'passive',
          typeLabel: 'Deity Domain',
          summary: dDef.desc || dDef.grantedPower?.desc || `Granted domain power for ${dDef.name}.`,
          rawRules: `**${dDef.name} Domain:**\n${dDef.desc || ''}\n\n**Granted Power:**\n${dDef.grantedPower?.desc || 'Granted domain power.'}\n\n**Domain Spells (1st–9th):**\n` +
            Object.entries(dDef.spells || {}).map(([lvl, sp]) => `• Level ${lvl}: ${String(sp).replace(/_/g, ' ')}`).join('\n'),
          actionType: 'Passive',
        });
      });
    }
  }

  // ==========================================
  // DRUID
  // ==========================================
  if (classMap.has('druid')) {
    const dLvl = classMap.get('druid')!;
    const isShapeshift = activeACFs.includes('druid_shapeshift');

    // 1. Nature Sense & Wild Empathy
    features.push({
      id: 'druid_nature_sense',
      name: 'Nature Sense & Wild Empathy',
      source: `Druid Lv.${dLvl}`,
      category: 'passive',
      typeLabel: 'Wilderness Expertise',
      summary: '+2 bonus on Knowledge (nature) and Survival checks. Wild Empathy check (1d20 + Druid Lvl + Cha mod) to improve animal attitudes.',
      rawRules: `A druid gains a +2 bonus on Knowledge (nature) and Survival checks.

A druid can improve the attitude of an animal with a Wild Empathy check (1d20 + druid level + Charisma modifier). This functions like a Diplomacy check for animals.`,
      actionType: 'Passive',
    });

    // 2. Woodland Stride (2nd) & Trackless Step (3rd) & Resist Nature's Lure (4th)
    if (dLvl >= 2) {
      features.push({
        id: 'druid_woodland_stride',
        name: 'Woodland Stride & Trackless Step',
        source: `Druid Lv.${dLvl}`,
        category: 'passive',
        typeLabel: 'Natural Movement',
        summary: 'Move through natural thorns/undergrowth without impairment or damage. Leave no tracks in natural surroundings (at 3rd level).',
        rawRules: `Starting at 2nd level, a druid may move through any sort of undergrowth at her normal speed and without taking damage or suffering impairment.

At 3rd level, a druid leaves no trail in natural surroundings and cannot be tracked.`,
        actionType: 'Passive',
      });
    }

    if (dLvl >= 4) {
      features.push({
        id: 'druid_resist_natures_lure',
        name: "Resist Nature's Lure (+4 Saves vs Fey)",
        source: `Druid Lv.${dLvl}`,
        category: 'passive',
        typeLabel: 'Fey Resistance',
        summary: '+4 bonus on saving throws against the spell-like abilities of fey creatures.',
        rawRules: `Starting at 4th level, a druid gains a +4 bonus on saving throws against the spell-like abilities of fey creatures.`,
        actionType: 'Passive',
      });
    }

    // 3. Wild Shape (5th+) or Shapeshift ACF
    if (isShapeshift) {
      features.push({
        id: 'druid_shapeshift_acf',
        name: 'Shapeshift (Predator / Aerial / Ferocious / Forest / Elemental)',
        source: `Druid Lv.${dLvl} (ACF)`,
        category: 'combat',
        typeLabel: 'Alternative Class Feature',
        summary: 'At-will swift action shapeshifting into Predator Form (+4 Str, bite 1d6, 50 ft speed), Aerial Form, Ferocious Slayer, Forest Avenger, or Elemental.',
        rawRules: `A druid with the Shapeshift alternative class feature can abandon her normal form at will as a swift action, transforming into a combat beast form.

• Predator Form (1st+): +4 enhancement bonus to Strength, bite attack (1d6 damage), base land speed 50 ft.
• Aerial Form (5th+): Fly 60 ft (good), +2 Str, +2 Reflex.
• Ferocious Slayer Form (8th+): +8 Str, +4 Fort, claws/bite.
• Forest Avenger Form (12th+): +12 Str, +4 Con, Huge plant form.
• Elemental Form (16th+): +16 Str, Huge elemental.`,
        actionType: 'Swift Action',
      });
    } else if (dLvl >= 5) {
      const wsCount = dLvl >= 18 ? 6 : (dLvl >= 14 ? 5 : (dLvl >= 10 ? 4 : (dLvl >= 7 ? 3 : (dLvl >= 6 ? 2 : 1))));
      const sizeList = ['Small', 'Medium'];
      if (dLvl >= 8) sizeList.push('Large');
      if (dLvl >= 11) sizeList.push('Tiny');
      if (dLvl >= 15) sizeList.push('Huge');
      const formTypes = ['Animal'];
      if (dLvl >= 12) formTypes.push('Plant');
      if (dLvl >= 16) formTypes.push('Elemental');

      features.push({
        id: 'druid_wild_shape',
        name: `Wild Shape (${wsCount}/day • ${formTypes.join(', ')} [${sizeList.join(', ')}])`,
        source: `Druid Lv.${dLvl}`,
        category: 'daily',
        typeLabel: 'Supernatural Transformation',
        summary: `Transform ${wsCount}× per day into ${formTypes.join('/')} forms (${sizeList.join(', ')}) for ${dLvl} hours per use.`,
        rawRules: `At 5th level, a druid gains the ability to turn herself into any Small or Medium animal and back again once per day. The effect lasts for 1 hour per druid level (${dLvl} hours).

• Level Progression: 6th (2/day), 7th (3/day), 8th (Large), 10th (4/day), 11th (Tiny), 12th (Plant forms), 14th (5/day), 15th (Huge), 16th (Elemental forms 1/day), 18th (6/day, Elemental 3/day).
• Stat Changes: You adopt the Strength, Dexterity, Constitution, natural armor, movement modes, and natural attacks of the form while retaining your own mental stats, HP total, and class features.`,
        actionType: 'Standard Action',
        duration: `${dLvl} hours`,
        interactive: 'counter',
        dailyAbilityKey: 'Wild Shape',
      });
    }

    // 4. Venom Immunity (9th), A Thousand Faces (13th), Timeless Body (15th)
    if (dLvl >= 9) {
      features.push({
        id: 'druid_venom_immunity',
        name: 'Venom Immunity',
        source: `Druid Lv.${dLvl}`,
        category: 'passive',
        typeLabel: 'Immunity',
        summary: 'Immunity to all organic, supernatural, and magical poisons.',
        rawRules: `At 9th level, a druid gains immunity to all poisons.`,
        actionType: 'Passive',
      });
    }

    if (dLvl >= 13) {
      features.push({
        id: 'druid_thousand_faces',
        name: 'A Thousand Faces (Disguise Self at Will)',
        source: `Druid Lv.${dLvl}`,
        category: 'spell-like',
        typeLabel: 'At Will SLA',
        summary: 'Change your physical appearance at will as the disguise self spell.',
        rawRules: `At 13th level, a druid gains the ability to change her appearance at will, as if using the disguise self spell, but only while in her normal form. This affects the druid\'s body but not her gear.`,
        actionType: 'Standard Action',
      });
    }
  }

  // ==========================================
  // SORCERER
  // ==========================================
  if (classMap.has('sorcerer')) {
    const sLvl = classMap.get('sorcerer')!;
    const isMetamagicSpecialist = activeACFs.includes('sorcerer_metamagic_specialist');

    if (isMetamagicSpecialist) {
      const intScore = typeof pc.int?.getValue === 'function' ? pc.int.getValue() : (pc.int || 10);
      const intMod = Math.max(1, 3 + Math.floor((intScore - 10) / 2));
      features.push({
        id: 'sorcerer_metamagic_specialist',
        name: `Metamagic Specialist (${intMod}/day • Replaces Familiar)`,
        source: `Sorcerer Lv.${sLvl} (ACF)`,
        category: 'daily',
        typeLabel: 'Alternative Class Feature',
        summary: `Apply metamagic feats to spells without increasing casting time ${intMod}× per day.`,
        rawRules: `You can apply the effects of metamagic feats that you know to your spells without increasing their casting time (${intMod} times per day = 3 + Int modifier). Casting a metamagic spell remains a standard action.`,
        actionType: 'Free Action',
        interactive: 'counter',
        dailyAbilityKey: 'Metamagic Specialist',
      });
    }

    features.push({
      id: 'sorcerer_spontaneous_magic',
      name: 'Spontaneous Arcane Spellcasting',
      source: `Sorcerer Lv.${sLvl}`,
      category: 'passive',
      typeLabel: 'Arcane Mastery',
      summary: 'Cast known arcane spells spontaneously using Charisma without preparing spells in advance.',
      rawRules: `A sorcerer casts arcane spells which are drawn primarily from the sorcerer/wizard spell list. She can cast any spell she knows without preparing it ahead of time, channeling raw magical essence through her Charisma.`,
      actionType: 'Passive',
    });
  }

  // ==========================================
  // WIZARD
  // ==========================================
  if (classMap.has('wizard')) {
    const wLvl = classMap.get('wizard')!;
    const isImmediateMagic = activeACFs.includes('wizard_immediate_magic');

    // 1. Scribe Scroll
    features.push({
      id: 'wizard_scribe_scroll',
      name: 'Scribe Scroll (Bonus Feat)',
      source: `Wizard Lv.${wLvl}`,
      category: 'passive',
      typeLabel: 'Item Creation Feat',
      summary: 'Create scrolls of any spells you know for later use.',
      rawRules: `At 1st level, a wizard gains Scribe Scroll as a bonus feat. You can create a scroll of any spell that you know and have prepared.`,
      actionType: 'Passive',
    });

    // 2. Immediate Magic ACF
    if (isImmediateMagic) {
      const intScore = typeof pc.int?.getValue === 'function' ? pc.int.getValue() : (pc.int || 10);
      const intMod = Math.max(1, Math.floor((intScore - 10) / 2));
      features.push({
        id: 'wizard_immediate_magic',
        name: `Immediate Magic (${intMod}/day • Replaces Familiar)`,
        source: `Wizard Lv.${wLvl} (ACF)`,
        category: 'daily',
        typeLabel: 'Alternative Class Feature',
        summary: `Cast your specialist school immediate ability ${intMod}× per day as an immediate or swift action (e.g., Abrupt Jaunt 10 ft teleport).`,
        rawRules: `You gain an immediate action spell-like ability tied to your specialist school usable ${intMod} times per day (equal to your Intelligence bonus, minimum 1). For example, Conjuration specialists gain Abrupt Jaunt (immediate 10 ft teleport to escape attacks).`,
        actionType: 'Immediate Action',
        interactive: 'counter',
        dailyAbilityKey: 'Immediate Magic',
      });
    }

    // 3. Wizard Bonus Feats (5th, 10th, 15th, 20th)
    if (wLvl >= 5) {
      const bonusFeats = Math.floor(wLvl / 5);
      features.push({
        id: 'wizard_bonus_feats',
        name: `Wizard Bonus Feats (${bonusFeats} Feats)`,
        source: `Wizard Lv.${wLvl}`,
        category: 'passive',
        typeLabel: 'Metamagic & Spell Mastery',
        summary: `You gain ${bonusFeats} bonus feat(s) selected from metamagic feats, item creation feats, or Spell Mastery.`,
        rawRules: `At 5th level, 10th, 15th, and 20th level, a wizard gains a bonus feat. At each such opportunity, she can choose a metamagic feat, an item creation feat, or Spell Mastery.`,
        actionType: 'Passive',
      });
    }
  }

  return features;
}
