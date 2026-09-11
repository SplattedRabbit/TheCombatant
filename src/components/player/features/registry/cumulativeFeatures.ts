/**
 * @module    cumulativeFeatures
 * @summary   Resolves stacked and cumulative D&D 3.5e mechanics across multiple classes (Sneak Attack, Smite, Turn Undead, Lay on Hands).
 */

import { PRESTIGE_CLASSES_REGISTRY } from '../../../../../js/data/prestigeClasses-data.js';
import { getSneakAttackDiceFromPrestigeClasses } from '../../../../../js/rules/prestigeClassEngine.js';
import { RogueRules } from '../../../../../js/rules/classes/RogueRules.js';
import type { UnifiedFeature } from './types.ts';
import { formatClassName } from './formatters.ts';
import { getAblMod } from '../../attributeHelper.ts';

export function getCumulativeFeatures(pc: any, classMap: Map<string, number>): UnifiedFeature[] {
  const features: UnifiedFeature[] = [];
  const activeClasses = Array.isArray(pc?.classes) ? pc.classes : [];

  // ==========================================
  // 1. SNEAK ATTACK MERGING (Rogue + PrCs)
  // ==========================================
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
            const dice = typeof f.diceByLevel === 'function' ? f.diceByLevel(c.level) : 0;
            const displayName = pDef.name || formatClassName(c.classType);
            if (dice > 0) saSources.push(`${displayName} Lv.${c.level} (+${dice}d6)`);
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
      rawRules: `If a character can catch an opponent when he is unable to defend himself effectively from her attack, she can strike a vital spot for extra damage.

The character's attack deals extra precision damage any time her target would be denied a Dexterity bonus to AC (whether the target actually has a Dexterity bonus or not), or when the character flanks her target. This extra damage is ${totalSa}d6. Should the character score a critical hit with a sneak attack, this extra damage is not multiplied.

Ranged attacks can count as sneak attacks only if the target is within 30 feet. With a sap or an unarmed strike, a character can make a sneak attack that deals nonlethal damage instead of lethal damage.

A character can sneak attack only living creatures with discernible anatomies—undead, constructs, oozes, plants, and incorporeal creatures lack vital areas to attack. Any creature that is immune to critical hits is not vulnerable to sneak attacks.`,
      actionType: 'Passive',
      stackInfo: `Combined from: ${saSources.join(', ')}`,
      interactive: 'none',
    });
  }

  // ==========================================
  // 2. SMITE EVIL / SMITE CORRUPT MERGING
  // ==========================================
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
    if (paladinSmite > 0) smiteSources.push(`Paladin Lv.${classMap.get('paladin')} (${paladinSmite}/day)`);
    if (shadowbaneSmite > 0) smiteSources.push(`Shadowbane Inquisitor Lv.${classMap.get('shadowbane_inquisitor')} (${shadowbaneSmite}/day)`);

    const chaScore = typeof pc.cha?.getValue === 'function' ? pc.cha.getValue() : (pc.cha || 10);
    const chaMod = Math.max(0, getAblMod(chaScore));
    const palLvl = classMap.get('paladin') || 0;
    const totalSmite = paladinSmite + shadowbaneSmite;

    features.push({
      id: 'smite_evil_merged',
      name: `Smite Evil (${totalSmite}/day)`,
      source: smiteSources.join(' • '),
      sources: smiteSources,
      category: 'daily',
      typeLabel: 'Daily Attack',
      summary: `Adds +${chaMod} to melee attack roll and +${palLvl || classMap.get('shadowbane_inquisitor')} damage against evil/corrupt targets.`,
      rawRules: `Once per day (or more at higher levels), a character may attempt to smite with one normal melee attack. She adds her Charisma bonus (+${chaMod}) to her attack roll and deals 1 extra point of damage per class level.

If the character accidentally smites a creature that is not evil/corrupt, the smite has no effect, but the ability use is still spent for the day.

Shadowbane Inquisitors gain Smite Corrupt, which functions against evil creatures or any creature that has broken a solemn oath or law.`,
      actionType: 'Free Action',
      range: 'Melee',
      stackInfo: smiteSources.join(', '),
      interactive: 'counter',
      dailyAbilityKey: 'Smite Evil',
    });
  }

  // ==========================================
  // 3. LAY ON HANDS
  // ==========================================
  if (classMap.has('paladin') && classMap.get('paladin')! >= 2) {
    const pLvl = classMap.get('paladin')!;
    const chaScore = typeof pc.cha?.getValue === 'function' ? pc.cha.getValue() : (pc.cha || 10);
    const chaMod = getAblMod(chaScore);
    const lohMax = Math.max(0, pLvl * chaMod);

    features.push({
      id: 'lay_on_hands',
      name: `Lay on Hands (${lohMax} HP Pool)`,
      source: `Paladin Lv.${pLvl}`,
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

  // ==========================================
  // 4. TURN UNDEAD
  // ==========================================
  const hasCleric = classMap.has('cleric');
  const hasPaladinTurn = classMap.has('paladin') && classMap.get('paladin')! >= 4;
  if (hasCleric || hasPaladinTurn) {
    const sources: string[] = [];
    let effLvl = 0;
    if (hasCleric) {
      effLvl += classMap.get('cleric')!;
      sources.push(`Cleric Lv.${classMap.get('cleric')}`);
    }
    if (hasPaladinTurn) {
      const pTurnLvl = Math.max(1, classMap.get('paladin')! - 3);
      effLvl += pTurnLvl;
      sources.push(`Paladin Lv.${classMap.get('paladin')} (Eff. Lv.${pTurnLvl})`);
    }

    const chaScore = typeof pc.cha?.getValue === 'function' ? pc.cha.getValue() : (pc.cha || 10);
    const chaMod = getAblMod(chaScore);
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

  return features;
}
