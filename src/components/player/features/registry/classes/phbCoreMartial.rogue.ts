/**
 * @module    phbCoreMartial.rogue
 * @summary   Rogue class feature definitions (Trapfinding, Evasion, Trap Sense, Uncanny Dodge).
 */

import type { UnifiedFeature } from '../types.ts';

export function getRogueFeatures(rLvl: number): UnifiedFeature[] {
  const features: UnifiedFeature[] = [];

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

  return features;
}
