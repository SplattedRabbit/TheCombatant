/**
 * @module    cs
 * @summary   Standardized D&D 3.5e RAW English feats registry.
 * @exports   GENERAL_FEATS_REGISTRY_CS
 */

export const GENERAL_FEATS_REGISTRY_CS = {
  "lucky_start": {
    "id": "lucky_start",
    "nameDe": "Lucky Start",
    "nameEn": "Lucky Start",
    "category": "general",
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Character level 1st only"
      }
    ],
    "benefitDe": "You can expend one luck reroll as an immediate action to reroll your initiative check.",
    "benefitRaw": "You can expend one luck reroll as an immediate action to reroll your initiative check.",
    "normalRaw": "",
    "specialRaw": "You gain 1 luck reroll per day for taking this feat.",
    "appEffect": "Expend one luck reroll as an immediate action to reroll your initiative check.",
    "name": "Lucky Start",
    "benefit": "You can expend one luck reroll as an immediate action to reroll your initiative check.",
    "benefitEn": "You can expend one luck reroll as an immediate action to reroll your initiative check."
  },
  "survivors_luck": {
    "id": "survivors_luck",
    "nameDe": "Survivor's Luck",
    "nameEn": "Survivor's Luck",
    "category": "general",
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Any luck feat"
      }
    ],
    "benefitDe": "You can expend one luck reroll as an immediate action to reroll a saving throw you have just failed.",
    "benefitRaw": "You can expend one luck reroll as an immediate action to reroll a saving throw you have just failed.",
    "normalRaw": "",
    "specialRaw": "You gain 1 luck reroll per day for taking this feat.",
    "appEffect": "Expend one luck reroll as an immediate action to reroll a saving throw you have just failed.",
    "name": "Survivor's Luck",
    "benefit": "You can expend one luck reroll as an immediate action to reroll a saving throw you have just failed.",
    "benefitEn": "You can expend one luck reroll as an immediate action to reroll a saving throw you have just failed."
  },
  "advantageous_avoidance": {
    "id": "advantageous_avoidance",
    "nameDe": "Advantageous Avoidance",
    "nameEn": "Advantageous Avoidance",
    "category": "general",
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Any luck feat"
      }
    ],
    "benefitDe": "You can expend one luck reroll as an immediate action to force an opponent to reroll a critical confirmation check against you.",
    "benefitRaw": "You can expend one luck reroll as an immediate action to force an opponent to reroll a critical confirmation check against you.",
    "normalRaw": "",
    "specialRaw": "You gain 1 luck reroll per day for taking this feat.",
    "appEffect": "Expend one luck reroll as an immediate action to force an opponent to reroll a critical confirmation check against you.",
    "name": "Advantageous Avoidance",
    "benefit": "You can expend one luck reroll as an immediate action to force an opponent to reroll a critical confirmation check against you.",
    "benefitEn": "You can expend one luck reroll as an immediate action to force an opponent to reroll a critical confirmation check against you."
  },
  "dumb_luck": {
    "id": "dumb_luck",
    "nameDe": "Dumb Luck",
    "nameEn": "Dumb Luck",
    "category": "general",
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Any luck feat"
      }
    ],
    "benefitDe": "You can expend one luck reroll to reroll a natural 1 on a saving throw, turning a automatic failure into a successful save check.",
    "benefitRaw": "You can expend one luck reroll to reroll a natural 1 on a saving throw, turning a automatic failure into a successful save check.",
    "normalRaw": "",
    "specialRaw": "You gain 1 luck reroll per day for taking this feat.",
    "appEffect": "Expend one luck reroll to reroll a natural 1 on a saving throw, turning a automatic failure into a successful save check.",
    "name": "Dumb Luck",
    "benefit": "You can expend one luck reroll to reroll a natural 1 on a saving throw, turning a automatic failure into a successful save check.",
    "benefitEn": "You can expend one luck reroll to reroll a natural 1 on a saving throw, turning a automatic failure into a successful save check."
  },
  "victors_luck": {
    "id": "victors_luck",
    "nameDe": "Victor's Luck",
    "nameEn": "Victor's Luck",
    "category": "general",
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Any luck feat"
      }
    ],
    "benefitDe": "You can expend one luck reroll as a free action to reroll a critical confirmation roll you just made.",
    "benefitRaw": "You can expend one luck reroll as a free action to reroll a critical confirmation roll you just made.",
    "normalRaw": "",
    "specialRaw": "You gain 1 luck reroll per day for taking this feat.",
    "appEffect": "Expend one luck reroll as a free action to reroll a critical confirmation roll you just made.",
    "name": "Victor's Luck",
    "benefit": "You can expend one luck reroll as a free action to reroll a critical confirmation roll you just made.",
    "benefitEn": "You can expend one luck reroll as a free action to reroll a critical confirmation roll you just made."
  },
  "daring_outlaw": {
    "id": "daring_outlaw",
    "nameDe": "Daring Outlaw",
    "nameEn": "Daring Outlaw",
    "category": "general",
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Grace +1"
      },
      {
        "type": "sneak_attack",
        "value": 2
      }
    ],
    "benefitDe": "Your rogue and swashbuckler levels stack for the purpose of determining your sneak attack extra damage and your grace class feature.",
    "benefitRaw": "Your rogue and swashbuckler levels stack for the purpose of determining your sneak attack extra damage and your grace class feature.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Your rogue and swashbuckler levels stack for the purpose of determining your sneak attack extra damage and you...",
    "name": "Daring Outlaw",
    "benefit": "Your rogue and swashbuckler levels stack for the purpose of determining your sneak attack extra damage and your grace class feature.",
    "benefitEn": "Your rogue and swashbuckler levels stack for the purpose of determining your sneak attack extra damage and your grace class feature."
  },
  "daring_warrior": {
    "id": "daring_warrior",
    "nameDe": "Daring Warrior",
    "nameEn": "Daring Warrior",
    "category": "general",
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Grace +1"
      },
      {
        "type": "class",
        "class": "fighter"
      }
    ],
    "benefitDe": "Your fighter and swashbuckler levels stack for the purpose of qualifying for feats with a fighter level requirement, and for your grace class feature.",
    "benefitRaw": "Your fighter and swashbuckler levels stack for the purpose of qualifying for feats with a fighter level requirement, and for your grace class feature.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Your fighter and swashbuckler levels stack for the purpose of qualifying for feats with a fighter level requir...",
    "name": "Daring Warrior",
    "benefit": "Your fighter and swashbuckler levels stack for the purpose of qualifying for feats with a fighter level requirement, and for your grace class feature.",
    "benefitEn": "Your fighter and swashbuckler levels stack for the purpose of qualifying for feats with a fighter level requirement, and for your grace class feature."
  },
  "swift_hunter": {
    "id": "swift_hunter",
    "nameDe": "Swift Hunter",
    "nameEn": "Swift Hunter",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Favored enemy, skirmish +1d6/+1 AC"
      }
    ],
    "benefitDe": "Your ranger and scout levels stack for the purpose of determining your skirmish attack bonus damage and AC bonus, and your favored enemies. You can apply skirmish damage to favored enemies even if they are immune to extra damage from critical hits.",
    "benefitRaw": "Your ranger and scout levels stack for the purpose of determining your skirmish attack bonus damage and AC bonus, and your favored enemies. You can apply skirmish damage to favored enemies even if they are immune to extra damage from critical hits.",
    "normalRaw": "",
    "specialRaw": "A scout can select Swift Hunter as one of her scout bonus feats.",
    "appEffect": "Your ranger and scout levels stack for the purpose of determining your skirmish attack bonus damage and AC bon...",
    "source": "cs",
    "name": "Swift Hunter",
    "benefit": "Your ranger and scout levels stack for the purpose of determining your skirmish attack bonus damage and AC bonus, and your favored enemies. You can apply skirmish damage to favored enemies even if they are immune to extra damage from critical hits.",
    "benefitEn": "Your ranger and scout levels stack for the purpose of determining your skirmish attack bonus damage and AC bonus, and your favored enemies. You can apply skirmish damage to favored enemies even if they are immune to extra damage from critical hits."
  },
  "swift_ambusher": {
    "id": "swift_ambusher",
    "nameDe": "Swift Ambusher",
    "nameEn": "Swift Ambusher",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +1d6, skirmish +1d6/+1 AC"
      }
    ],
    "benefitDe": "Your rogue and scout levels stack for the purpose of determining your skirmish attack bonus damage and AC bonus. You can count skirmish extra damage alongside sneak attack to qualify for ambush feats.",
    "benefitRaw": "Your rogue and scout levels stack for the purpose of determining your skirmish attack bonus damage and AC bonus. You can count skirmish extra damage alongside sneak attack to qualify for ambush feats.",
    "normalRaw": "",
    "specialRaw": "A scout can select Swift Ambusher as one of her scout bonus feats.",
    "appEffect": "Your rogue and scout levels stack for the purpose of determining your skirmish attack bonus damage and AC bonus",
    "source": "cs",
    "name": "Swift Ambusher",
    "benefit": "Your rogue and scout levels stack for the purpose of determining your skirmish attack bonus damage and AC bonus. You can count skirmish extra damage alongside sneak attack to qualify for ambush feats.",
    "benefitEn": "Your rogue and scout levels stack for the purpose of determining your skirmish attack bonus damage and AC bonus. You can count skirmish extra damage alongside sneak attack to qualify for ambush feats."
  },
  "master_spellthief": {
    "id": "master_spellthief",
    "nameDe": "Master Spellthief",
    "nameEn": "Master Spellthief",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to cast 2nd-level arcane spells, steal spell"
      }
    ],
    "benefitDe": "Your spellthief levels stack with other arcane spellcaster levels for determining caster level and maximum level of spell you can steal. You incur no arcane spell failure chance in light armor for any arcane class.",
    "benefitRaw": "Your spellthief levels stack with other arcane spellcaster levels for determining caster level and maximum level of spell you can steal. You incur no arcane spell failure chance in light armor for any arcane class.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Your spellthief levels stack with other arcane spellcaster levels for determining caster level and maximum lev...",
    "source": "cs",
    "name": "Master Spellthief",
    "benefit": "Your spellthief levels stack with other arcane spellcaster levels for determining caster level and maximum level of spell you can steal. You incur no arcane spell failure chance in light armor for any arcane class.",
    "benefitEn": "Your spellthief levels stack with other arcane spellcaster levels for determining caster level and maximum level of spell you can steal. You incur no arcane spell failure chance in light armor for any arcane class."
  },
  "ascetic_stalker": {
    "id": "ascetic_stalker",
    "nameDe": "Ascetic Stalker",
    "nameEn": "Ascetic Stalker",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ki power, ki strike (magic)"
      }
    ],
    "benefitDe": "Your monk and ninja levels stack for the purpose of determining your ki pool size and unarmed strike damage. You can multiclass freely between monk and ninja.",
    "benefitRaw": "Your monk and ninja levels stack for the purpose of determining your ki pool size and unarmed strike damage. You can multiclass freely between monk and ninja.",
    "normalRaw": "",
    "specialRaw": "A monk can select Ascetic Stalker as a bonus feat at 1st, 2nd, or 6th level.",
    "appEffect": "Your monk and ninja levels stack for the purpose of determining your ki pool size and unarmed strike damage",
    "source": "cs",
    "name": "Ascetic Stalker",
    "benefit": "Your monk and ninja levels stack for the purpose of determining your ki pool size and unarmed strike damage. You can multiclass freely between monk and ninja.",
    "benefitEn": "Your monk and ninja levels stack for the purpose of determining your ki pool size and unarmed strike damage. You can multiclass freely between monk and ninja."
  },
  "martial_stalker": {
    "id": "martial_stalker",
    "nameDe": "Martial Stalker",
    "nameEn": "Martial Stalker",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Proficiency with all martial weapons, ki power"
      }
    ],
    "benefitDe": "Your fighter and ninja levels stack for the purpose of determining your ki pool size and AC bonus. Fighter levels count toward meeting ki power level requirements.",
    "benefitRaw": "Your fighter and ninja levels stack for the purpose of determining your ki pool size and AC bonus. Fighter levels count toward meeting ki power level requirements.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Your fighter and ninja levels stack for the purpose of determining your ki pool size and AC bonus",
    "source": "cs",
    "name": "Martial Stalker",
    "benefit": "Your fighter and ninja levels stack for the purpose of determining your ki pool size and AC bonus. Fighter levels count toward meeting ki power level requirements.",
    "benefitEn": "Your fighter and ninja levels stack for the purpose of determining your ki pool size and AC bonus. Fighter levels count toward meeting ki power level requirements."
  },
  "psithief": {
    "id": "psithief",
    "nameDe": "Psithief",
    "nameEn": "Psithief",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Manifester level 1st, steal spell"
      }
    ],
    "benefitDe": "When you use steal spell, you can choose to steal power points or a psionic power from an opponent instead of a spell.",
    "benefitRaw": "When you use steal spell, you can choose to steal power points or a psionic power from an opponent instead of a spell.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "When you use steal spell, you can choose to steal power points or a psionic power from an opponent instead of a spell.",
    "source": "cs",
    "name": "Psithief",
    "benefit": "When you use steal spell, you can choose to steal power points or a psionic power from an opponent instead of a spell.",
    "benefitEn": "When you use steal spell, you can choose to steal power points or a psionic power from an opponent instead of a spell."
  },
  "improved_skirmish": {
    "id": "improved_skirmish",
    "nameDe": "Improved Skirmish",
    "nameEn": "Improved Skirmish",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Skirmish +2d6/+1 AC"
      }
    ],
    "benefitDe": "If you move at least 20 feet in a round, your skirmish damage increases by an extra 2d6 and your competency bonus to AC increases by an extra +2.",
    "benefitRaw": "If you move at least 20 feet in a round, your skirmish damage increases by an extra 2d6 and your competency bonus to AC increases by an extra +2.",
    "normalRaw": "",
    "specialRaw": "A scout can select Improved Skirmish as one of her scout bonus feats.",
    "appEffect": "If you move at least 20 feet in a round, your skirmish damage increases by an extra 2d6 and your competency bo...",
    "source": "cs",
    "name": "Improved Skirmish",
    "benefit": "If you move at least 20 feet in a round, your skirmish damage increases by an extra 2d6 and your competency bonus to AC increases by an extra +2.",
    "benefitEn": "If you move at least 20 feet in a round, your skirmish damage increases by an extra 2d6 and your competency bonus to AC increases by an extra +2."
  },
  "savvy_rogue": {
    "id": "savvy_rogue",
    "nameDe": "Savvy Rogue",
    "nameEn": "Savvy Rogue",
    "category": "general",
    "prereqs": [
      {
        "type": "classLevel",
        "class": "rogue",
        "value": 10
      }
    ],
    "benefitDe": "Enhances your high-level rogue special abilities (Defensive Roll, Opportunist, Skill Mastery, Slippery Mind, etc.).",
    "benefitRaw": "Enhances your high-level rogue special abilities (Defensive Roll, Opportunist, Skill Mastery, Slippery Mind, etc.).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Enhances your high-level rogue special abilities (Defensive Roll, Opportunist, Skill Mastery, Slippery Mind, etc.).",
    "source": "cs",
    "name": "Savvy Rogue",
    "benefit": "Enhances your high-level rogue special abilities (Defensive Roll, Opportunist, Skill Mastery, Slippery Mind, etc.).",
    "benefitEn": "Enhances your high-level rogue special abilities (Defensive Roll, Opportunist, Skill Mastery, Slippery Mind, etc.)."
  },
  "daredevil_athlete": {
    "id": "daredevil_athlete",
    "nameDe": "Daredevil Athlete",
    "nameEn": "Daredevil Athlete",
    "category": "general",
    "prereqs": [],
    "benefitDe": "Three times per day, as an immediate action, you can gain a +5 competence bonus on a single Climb, Jump, Ride, or Swim check.",
    "benefitRaw": "Three times per day, as an immediate action, you can gain a +5 competence bonus on a single Climb, Jump, Ride, or Swim check.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Three times per day, as an immediate action, you can gain a +5 competence bonus on a single Climb, Jump, Ride, or Swim check.",
    "source": "cs",
    "name": "Daredevil Athlete",
    "benefit": "Three times per day, as an immediate action, you can gain a +5 competence bonus on a single Climb, Jump, Ride, or Swim check.",
    "benefitEn": "Three times per day, as an immediate action, you can gain a +5 competence bonus on a single Climb, Jump, Ride, or Swim check."
  },
  "enduring_ki": {
    "id": "enduring_ki",
    "nameDe": "Enduring Ki",
    "nameEn": "Enduring Ki",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ki power"
      }
    ],
    "benefitDe": "You can spend an extra use of your ki power to extend the duration of a ki power by 1 round.",
    "benefitRaw": "You can spend an extra use of your ki power to extend the duration of a ki power by 1 round.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Spend an extra use of your ki power to extend the duration of a ki power by 1 round.",
    "source": "cs",
    "name": "Enduring Ki",
    "benefit": "You can spend an extra use of your ki power to extend the duration of a ki power by 1 round.",
    "benefitEn": "You can spend an extra use of your ki power to extend the duration of a ki power by 1 round."
  },
  "expanded_ki_pool": {
    "id": "expanded_ki_pool",
    "nameDe": "Expanded Ki Pool",
    "nameEn": "Expanded Ki Pool",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ki power"
      }
    ],
    "benefitDe": "You gain three extra uses of your ki power per day.",
    "benefitRaw": "You gain three extra uses of your ki power per day.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Three extra uses of your ki power per day.",
    "source": "cs",
    "name": "Expanded Ki Pool",
    "benefit": "You gain three extra uses of your ki power per day.",
    "benefitEn": "You gain three extra uses of your ki power per day."
  },
  "poison_expert": {
    "id": "poison_expert",
    "nameDe": "Poison Expert",
    "nameEn": "Poison Expert",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "craft_poisonmaking",
        "ranks": 8
      },
      {
        "type": "special",
        "desc": "Poison use"
      }
    ],
    "benefitDe": "Choose one type of poison (contact, ingested, inhaled, or injury). The save DC for that type of poison you use increases by 1.",
    "benefitRaw": "Choose one type of poison (contact, ingested, inhaled, or injury). The save DC for that type of poison you use increases by 1.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Choose one type of poison (contact, ingested, inhaled, or injury)",
    "source": "cs",
    "name": "Poison Expert",
    "benefit": "Choose one type of poison (contact, ingested, inhaled, or injury). The save DC for that type of poison you use increases by 1.",
    "benefitEn": "Choose one type of poison (contact, ingested, inhaled, or injury). The save DC for that type of poison you use increases by 1."
  },
  "poison_master": {
    "id": "poison_master",
    "nameDe": "Poison Master",
    "nameEn": "Poison Master",
    "category": "general",
    "prereqs": [
      {
        "type": "feat",
        "id": "poison_expert"
      },
      {
        "type": "skill",
        "skill": "craft_poisonmaking",
        "ranks": 8
      },
      {
        "type": "special",
        "desc": "Poison use"
      }
    ],
    "parent": "poison_expert",
    "benefitDe": "Poison of the selected type deals 1 extra point of ability damage per die of damage.",
    "benefitRaw": "Poison of the selected type deals 1 extra point of ability damage per die of damage.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Poison of the selected type deals 1 extra point of ability damage per die of damage.",
    "source": "cs",
    "name": "Poison Master",
    "benefit": "Poison of the selected type deals 1 extra point of ability damage per die of damage.",
    "benefitEn": "Poison of the selected type deals 1 extra point of ability damage per die of damage."
  },
  "improved_familiar": {
    "id": "improved_familiar",
    "nameDe": "Improved Familiar",
    "nameEn": "Improved Familiar",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to acquire a new familiar, compatible alignment, sufficiently high arcane spellcaster level"
      }
    ],
    "benefitDe": "Allows you to choose from an expanded list of powerful and unusual familiars.",
    "benefitRaw": "Allows you to choose from an expanded list of powerful and unusual familiars.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Allows you to choose from an expanded list of powerful and unusual familiars.",
    "source": "cs",
    "name": "Improved Familiar",
    "benefit": "Allows you to choose from an expanded list of powerful and unusual familiars.",
    "benefitEn": "Allows you to choose from an expanded list of powerful and unusual familiars."
  },
  "cool_head": {
    "id": "cool_head",
    "nameDe": "Cool Head",
    "nameEn": "Cool Head",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Any two mental skill tricks"
      }
    ],
    "benefitDe": "You immediately learn two mental skill tricks for free, and your maximum skill trick limit increases by one.",
    "benefitRaw": "You immediately learn two mental skill tricks for free, and your maximum skill trick limit increases by one.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "You immediately learn two mental skill tricks for free, and your maximum skill trick limit increases by one.",
    "source": "cs",
    "name": "Cool Head",
    "benefit": "You immediately learn two mental skill tricks for free, and your maximum skill trick limit increases by one.",
    "benefitEn": "You immediately learn two mental skill tricks for free, and your maximum skill trick limit increases by one."
  },
  "freerunner": {
    "id": "freerunner",
    "nameDe": "Freerunner",
    "nameEn": "Freerunner",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Any two movement skill tricks"
      }
    ],
    "benefitDe": "You immediately learn two movement skill tricks for free, and your maximum skill trick limit increases by one.",
    "benefitRaw": "You immediately learn two movement skill tricks for free, and your maximum skill trick limit increases by one.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "You immediately learn two movement skill tricks for free, and your maximum skill trick limit increases by one.",
    "source": "cs",
    "name": "Freerunner",
    "benefit": "You immediately learn two movement skill tricks for free, and your maximum skill trick limit increases by one.",
    "benefitEn": "You immediately learn two movement skill tricks for free, and your maximum skill trick limit increases by one."
  },
  "sure_hand": {
    "id": "sure_hand",
    "nameDe": "Sure Hand",
    "nameEn": "Sure Hand",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Any two manipulation skill tricks"
      }
    ],
    "benefitDe": "You immediately learn two manipulation skill tricks for free, and your maximum skill trick limit increases by one.",
    "benefitRaw": "You immediately learn two manipulation skill tricks for free, and your maximum skill trick limit increases by one.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "You immediately learn two manipulation skill tricks for free, and your maximum skill trick limit increases by one.",
    "source": "cs",
    "name": "Sure Hand",
    "benefit": "You immediately learn two manipulation skill tricks for free, and your maximum skill trick limit increases by one.",
    "benefitEn": "You immediately learn two manipulation skill tricks for free, and your maximum skill trick limit increases by one."
  },
  "sweet_talker": {
    "id": "sweet_talker",
    "nameDe": "Sweet Talker",
    "nameEn": "Sweet Talker",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Any two interaction skill tricks"
      }
    ],
    "benefitDe": "You immediately learn two interaction skill tricks for free, and your maximum skill trick limit increases by one.",
    "benefitRaw": "You immediately learn two interaction skill tricks for free, and your maximum skill trick limit increases by one.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "You immediately learn two interaction skill tricks for free, and your maximum skill trick limit increases by one.",
    "source": "cs",
    "name": "Sweet Talker",
    "benefit": "You immediately learn two interaction skill tricks for free, and your maximum skill trick limit increases by one.",
    "benefitEn": "You immediately learn two interaction skill tricks for free, and your maximum skill trick limit increases by one."
  },
  "chant_of_the_long_road": {
    "id": "chant_of_the_long_road",
    "nameDe": "Chant of the Long Road",
    "nameEn": "Chant of the Long Road",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 6
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "Expend one daily use of bardic music to allow yourself and allies within 60 ft. to hustle for 1 hour without taking nonlethal damage.",
    "benefitRaw": "Expend one daily use of bardic music to allow yourself and allies within 60 ft. to hustle for 1 hour without taking nonlethal damage.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend one daily use of bardic music to allow yourself and allies within 60 ft",
    "source": "cs",
    "name": "Chant of the Long Road",
    "benefit": "Expend one daily use of bardic music to allow yourself and allies within 60 ft. to hustle for 1 hour without taking nonlethal damage.",
    "benefitEn": "Expend one daily use of bardic music to allow yourself and allies within 60 ft. to hustle for 1 hour without taking nonlethal damage."
  },
  "chord_of_distraction": {
    "id": "chord_of_distraction",
    "nameDe": "Chord of Distraction",
    "nameEn": "Chord of Distraction",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 9
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "As an immediate action, expend three daily uses of bardic music and succeed on an opposed Perform check to make a target flat-footed against one chosen ally.",
    "benefitRaw": "As an immediate action, expend three daily uses of bardic music and succeed on an opposed Perform check to make a target flat-footed against one chosen ally.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "As an immediate action, expend three daily uses of bardic music and succeed on an opposed Perform check to mak...",
    "source": "cs",
    "name": "Chord of Distraction",
    "benefit": "As an immediate action, expend three daily uses of bardic music and succeed on an opposed Perform check to make a target flat-footed against one chosen ally.",
    "benefitEn": "As an immediate action, expend three daily uses of bardic music and succeed on an opposed Perform check to make a target flat-footed against one chosen ally."
  },
  "epic_of_the_lost_king": {
    "id": "epic_of_the_lost_king",
    "nameDe": "Epic of the Lost King",
    "nameEn": "Epic of the Lost King",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 6
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "Expend one daily use of bardic music to remove fatigue from allies within 30 ft. (or reduce exhaustion to fatigue).",
    "benefitRaw": "Expend one daily use of bardic music to remove fatigue from allies within 30 ft. (or reduce exhaustion to fatigue).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend one daily use of bardic music to remove fatigue from allies within 30 ft",
    "source": "cs",
    "name": "Epic of the Lost King",
    "benefit": "Expend one daily use of bardic music to remove fatigue from allies within 30 ft. (or reduce exhaustion to fatigue).",
    "benefitEn": "Expend one daily use of bardic music to remove fatigue from allies within 30 ft. (or reduce exhaustion to fatigue)."
  },
  "sound_of_silence": {
    "id": "sound_of_silence",
    "nameDe": "Sound of Silence",
    "nameEn": "Sound of Silence",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 9
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "Expend two daily uses of bardic music to deafen a target within 30 ft. for rounds equal to your character level (Fortitude negates).",
    "benefitRaw": "Expend two daily uses of bardic music to deafen a target within 30 ft. for rounds equal to your character level (Fortitude negates).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend two daily uses of bardic music to deafen a target within 30 ft",
    "source": "cs",
    "name": "Sound of Silence",
    "benefit": "Expend two daily uses of bardic music to deafen a target within 30 ft. for rounds equal to your character level (Fortitude negates).",
    "benefitEn": "Expend two daily uses of bardic music to deafen a target within 30 ft. for rounds equal to your character level (Fortitude negates)."
  },
  "warning_shout": {
    "id": "warning_shout",
    "nameDe": "Warning Shout",
    "nameEn": "Warning Shout",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 9
      },
      {
        "type": "special",
        "desc": "Bardic music, evasion"
      }
    ],
    "benefitDe": "As an immediate action, expend two daily uses of bardic music to grant one ally within 30 ft. evasion and a +5 morale bonus on their next Reflex save.",
    "benefitRaw": "As an immediate action, expend two daily uses of bardic music to grant one ally within 30 ft. evasion and a +5 morale bonus on their next Reflex save.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "As an immediate action, expend two daily uses of bardic music to grant one ally within 30 ft",
    "source": "cs",
    "name": "Warning Shout",
    "benefit": "As an immediate action, expend two daily uses of bardic music to grant one ally within 30 ft. evasion and a +5 morale bonus on their next Reflex save.",
    "benefitEn": "As an immediate action, expend two daily uses of bardic music to grant one ally within 30 ft. evasion and a +5 morale bonus on their next Reflex save."
  }
};
