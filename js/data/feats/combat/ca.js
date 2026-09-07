/**
 * @module    ca
 * @summary   Standardized D&D 3.5e RAW English feats registry.
 * @exports   COMBAT_FEATS_REGISTRY_CA
 */

export const COMBAT_FEATS_REGISTRY_CA = {
  "expert_tactician": {
    "id": "expert_tactician",
    "nameDe": "Expert Tactician",
    "nameEn": "Expert Tactician",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      {
        "type": "stat",
        "name": "dex",
        "value": 13
      },
      {
        "type": "feat",
        "id": "combat_reflexes"
      },
      {
        "type": "bab",
        "value": 2
      }
    ],
    "benefitDe": "If you hit a creature with an attack of opportunity in melee, you and all allies gain a +2 circumstance bonus on melee attack rolls and damage rolls against that creature until the start of your next turn.",
    "benefitRaw": "If you hit a creature with an attack of opportunity in melee, you and all allies gain a +2 circumstance bonus on melee attack rolls and damage rolls against that creature until the start of your next turn.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Expert Tactician as one of his fighter bonus feats.",
    "appEffect": "If you hit a creature with an attack of opportunity in melee, you and all allies gain a +2 circumstance bonus...",
    "name": "Expert Tactician",
    "benefit": "If you hit a creature with an attack of opportunity in melee, you and all allies gain a +2 circumstance bonus on melee attack rolls and damage rolls against that creature until the start of your next turn.",
    "benefitEn": "If you hit a creature with an attack of opportunity in melee, you and all allies gain a +2 circumstance bonus on melee attack rolls and damage rolls against that creature until the start of your next turn."
  },
  "brutal_throw": {
    "id": "brutal_throw",
    "nameDe": "Brutal Throw",
    "nameEn": "Brutal Throw",
    "category": "combat",
    "source": "ca",
    "prereqs": [],
    "benefitDe": "You can add your Strength modifier (instead of your Dexterity modifier) to attack rolls with thrown weapons.",
    "benefitRaw": "You can add your Strength modifier (instead of your Dexterity modifier) to attack rolls with thrown weapons.",
    "normalRaw": "A character adds his Dexterity modifier to ranged attack rolls.",
    "specialRaw": "A fighter may select Brutal Throw as one of his fighter bonus feats.",
    "appEffect": "Add your Strength modifier (instead of your Dexterity modifier) to attack rolls with thrown weapons.",
    "name": "Brutal Throw",
    "benefit": "You can add your Strength modifier (instead of your Dexterity modifier) to attack rolls with thrown weapons.",
    "benefitEn": "You can add your Strength modifier (instead of your Dexterity modifier) to attack rolls with thrown weapons."
  },
  "power_throw": {
    "id": "power_throw",
    "nameDe": "Power Throw",
    "nameEn": "Power Throw",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      {
        "type": "stat",
        "name": "str",
        "value": 13
      },
      {
        "type": "feat",
        "id": "power_attack"
      },
      {
        "type": "feat",
        "id": "brutal_throw"
      }
    ],
    "benefitDe": "On your action, before making attack rolls for a round, you may choose to subtract a number from all thrown weapon attack rolls and add that number to all thrown weapon damage rolls.",
    "benefitRaw": "On your action, before making attack rolls for a round, you may choose to subtract a number from all thrown weapon attack rolls and add that number to all thrown weapon damage rolls.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Power Throw as one of his fighter bonus feats.",
    "appEffect": "On your action, before making attack rolls for a round, you may choose to subtract a number from all thrown we...",
    "name": "Power Throw",
    "benefit": "On your action, before making attack rolls for a round, you may choose to subtract a number from all thrown weapon attack rolls and add that number to all thrown weapon damage rolls.",
    "benefitEn": "On your action, before making attack rolls for a round, you may choose to subtract a number from all thrown weapon attack rolls and add that number to all thrown weapon damage rolls."
  },
  "dual_strike": {
    "id": "dual_strike",
    "nameDe": "Dual Strike",
    "nameEn": "Dual Strike",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      {
        "type": "feat",
        "id": "two_weapon_fighting"
      },
      {
        "type": "feat",
        "id": "improved_two_weapon_fighting"
      }
    ],
    "benefitDe": "As a standard action, you can make a melee attack with your primary weapon and your off-hand weapon simultaneously against the same target.",
    "benefitRaw": "As a standard action, you can make a melee attack with your primary weapon and your off-hand weapon simultaneously against the same target.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Dual Strike as one of his fighter bonus feats.",
    "appEffect": "As a standard action, you can make a melee attack with your primary weapon and your off-hand weapon simultaneo...",
    "name": "Dual Strike",
    "benefit": "As a standard action, you can make a melee attack with your primary weapon and your off-hand weapon simultaneously against the same target.",
    "benefitEn": "As a standard action, you can make a melee attack with your primary weapon and your off-hand weapon simultaneously against the same target."
  },
  "deft_opportunist": {
    "id": "deft_opportunist",
    "nameDe": "Deft Opportunist",
    "nameEn": "Deft Opportunist",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      {
        "type": "stat",
        "name": "dex",
        "value": 15
      },
      {
        "type": "feat",
        "id": "combat_reflexes"
      }
    ],
    "benefitDe": "You gain a +4 circumstance bonus on attack rolls when making attacks of opportunity.",
    "benefitRaw": "You gain a +4 circumstance bonus on attack rolls when making attacks of opportunity.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Deft Opportunist as one of his fighter bonus feats.",
    "appEffect": "A +4 circumstance bonus on attack rolls when making attacks of opportunity.",
    "name": "Deft Opportunist",
    "benefit": "You gain a +4 circumstance bonus on attack rolls when making attacks of opportunity.",
    "benefitEn": "You gain a +4 circumstance bonus on attack rolls when making attacks of opportunity."
  },
  "hear_the_unseen": {
    "id": "hear_the_unseen",
    "nameDe": "Hear the Unseen",
    "nameEn": "Hear the Unseen",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      {
        "type": "feat",
        "id": "blind_fight"
      },
      {
        "type": "skill",
        "name": "listen",
        "value": 5
      }
    ],
    "benefitDe": "As a move action, by making a Listen check against DC 25, you pinpoint the location of any creature within 30 feet.",
    "benefitRaw": "As a move action, by making a Listen check against DC 25, you pinpoint the location of any creature within 30 feet.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Hear the Unseen as one of his fighter bonus feats.",
    "appEffect": "As a move action, by making a Listen check against DC 25, you pinpoint the location of any creature within 30 feet.",
    "name": "Hear the Unseen",
    "benefit": "As a move action, by making a Listen check against DC 25, you pinpoint the location of any creature within 30 feet.",
    "benefitEn": "As a move action, by making a Listen check against DC 25, you pinpoint the location of any creature within 30 feet."
  },
  "improved_diversion": {
    "id": "improved_diversion",
    "nameDe": "Improved Diversion",
    "nameEn": "Improved Diversion",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      {
        "type": "skill",
        "name": "bluff",
        "value": 4
      }
    ],
    "benefitDe": "You can use Bluff to create a diversion to hide as a move action rather than as a standard action.",
    "benefitRaw": "You can use Bluff to create a diversion to hide as a move action rather than as a standard action.",
    "normalRaw": "Creating a diversion to hide requires a standard action.",
    "specialRaw": "A fighter may select Improved Diversion as one of his fighter bonus feats.",
    "appEffect": "Use Bluff to create a diversion to hide as a move action rather than as a standard action.",
    "name": "Improved Diversion",
    "benefit": "You can use Bluff to create a diversion to hide as a move action rather than as a standard action.",
    "benefitEn": "You can use Bluff to create a diversion to hide as a move action rather than as a standard action."
  },
  "oversized_two_weapon_fighting": {
    "id": "oversized_two_weapon_fighting",
    "nameDe": "Oversized Two-Weapon Fighting",
    "nameEn": "Oversized Two-Weapon Fighting",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      {
        "type": "stat",
        "name": "str",
        "value": 13
      },
      {
        "type": "feat",
        "id": "two_weapon_fighting"
      }
    ],
    "benefitDe": "When wielding a one-handed weapon in your off hand, you treat it for all purposes as a light weapon with respect to two-weapon fighting penalties.",
    "benefitRaw": "When wielding a one-handed weapon in your off hand, you treat it for all purposes as a light weapon with respect to two-weapon fighting penalties.",
    "normalRaw": "Wielding a one-handed off-hand weapon imposes a -4/-4 penalty.",
    "specialRaw": "A fighter may select Oversized Two-Weapon Fighting as one of his fighter bonus feats.",
    "appEffect": "When wielding a one-handed weapon in your off hand, you treat it for all purposes as a light weapon with respe...",
    "name": "Oversized Two-Weapon Fighting",
    "benefit": "When wielding a one-handed weapon in your off hand, you treat it for all purposes as a light weapon with respect to two-weapon fighting penalties.",
    "benefitEn": "When wielding a one-handed weapon in your off hand, you treat it for all purposes as a light weapon with respect to two-weapon fighting penalties."
  },
  "staggering_strike": {
    "id": "staggering_strike",
    "nameDe": "Staggering Strike",
    "nameEn": "Staggering Strike",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      {
        "type": "bab",
        "value": 6
      },
      {
        "type": "sneak_attack",
        "value": 1
      }
    ],
    "benefitDe": "If you deal damage with a melee sneak attack, the target must make a Fortitude save (DC = damage dealt) or be staggered for 1 round.",
    "benefitRaw": "If you deal damage with a melee sneak attack, the target must make a Fortitude save (DC = damage dealt) or be staggered for 1 round.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Staggering Strike as one of his fighter bonus feats.",
    "appEffect": "If you deal damage with a melee sneak attack, the target must make a Fortitude save (DC = damage dealt) or be...",
    "name": "Staggering Strike",
    "benefit": "If you deal damage with a melee sneak attack, the target must make a Fortitude save (DC = damage dealt) or be staggered for 1 round.",
    "benefitEn": "If you deal damage with a melee sneak attack, the target must make a Fortitude save (DC = damage dealt) or be staggered for 1 round."
  },
  "death_blow": {
    "id": "death_blow",
    "nameDe": "Death Blow",
    "nameEn": "Death Blow",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_initiative"
      },
      {
        "type": "bab",
        "value": 2
      }
    ],
    "parent": "improved_initiative",
    "benefitDe": "You can perform a coup de grace attack against a helpless defender as a standard action.",
    "benefitRaw": "You can perform a coup de grace attack against a helpless defender as a standard action.",
    "normalRaw": "Performing a coup de grace is a full-round action.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Perform a coup de grace attack against a helpless defender as a standard action.",
    "source": "ca",
    "name": "Death Blow",
    "benefit": "You can perform a coup de grace attack against a helpless defender as a standard action.",
    "benefitEn": "You can perform a coup de grace attack against a helpless defender as a standard action."
  },
  "deft_strike": {
    "id": "deft_strike",
    "nameDe": "Deft Strike",
    "nameEn": "Deft Strike",
    "category": "combat",
    "prereqs": [
      {
        "type": "stat",
        "name": "int",
        "value": 13
      },
      {
        "type": "feat",
        "id": "combat_expertise"
      },
      {
        "type": "skill",
        "skill": "spot",
        "ranks": 10
      },
      {
        "type": "special",
        "desc": "Sneak attack"
      }
    ],
    "parent": "combat_expertise",
    "benefitDe": "As a standard action, make a Spot check against target's AC. If successful, your next melee attack ignores target's armor and natural armor bonus to AC.",
    "benefitRaw": "As a standard action, make a Spot check against target's AC. If successful, your next melee attack ignores target's armor and natural armor bonus to AC.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "As a standard action, make a Spot check against target's AC",
    "source": "ca",
    "name": "Deft Strike",
    "benefit": "As a standard action, make a Spot check against target's AC. If successful, your next melee attack ignores target's armor and natural armor bonus to AC.",
    "benefitEn": "As a standard action, make a Spot check against target's AC. If successful, your next melee attack ignores target's armor and natural armor bonus to AC."
  },
  "goad": {
    "id": "goad",
    "nameDe": "Goad",
    "nameEn": "Goad",
    "category": "combat",
    "prereqs": [
      {
        "type": "stat",
        "name": "cha",
        "value": 13
      },
      {
        "type": "bab",
        "value": 1
      }
    ],
    "benefitDe": "As a move action, you can goad an opponent within 30 ft. into attacking you (Will save DC 10 + 1/2 level + Cha mod).",
    "benefitRaw": "As a move action, you can goad an opponent within 30 ft. into attacking you (Will save DC 10 + 1/2 level + Cha mod).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "As a move action, you can goad an opponent within 30 ft",
    "source": "ca",
    "name": "Goad",
    "benefit": "As a move action, you can goad an opponent within 30 ft. into attacking you (Will save DC 10 + 1/2 level + Cha mod).",
    "benefitEn": "As a move action, you can goad an opponent within 30 ft. into attacking you (Will save DC 10 + 1/2 level + Cha mod)."
  },
  "leap_attack": {
    "id": "leap_attack",
    "nameDe": "Leap Attack",
    "nameEn": "Leap Attack",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "power_attack"
      },
      {
        "type": "skill",
        "skill": "jump",
        "ranks": 8
      }
    ],
    "parent": "power_attack",
    "benefitDe": "You can combine a jump with a charge against an opponent. If you jump at least 10 feet horizontally, your bonus damage from Power Attack is doubled (tripled with a two-handed weapon).",
    "benefitRaw": "You can combine a jump with a charge against an opponent. If you jump at least 10 feet horizontally, your bonus damage from Power Attack is doubled (tripled with a two-handed weapon).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Combine a jump with a charge against an opponent",
    "source": "ca",
    "name": "Leap Attack",
    "benefit": "You can combine a jump with a charge against an opponent. If you jump at least 10 feet horizontally, your bonus damage from Power Attack is doubled (tripled with a two-handed weapon).",
    "benefitEn": "You can combine a jump with a charge against an opponent. If you jump at least 10 feet horizontally, your bonus damage from Power Attack is doubled (tripled with a two-handed weapon)."
  }
};
