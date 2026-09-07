/**
 * @module    phb2
 * @summary   Standardized D&D 3.5e RAW English feats registry.
 * @exports   GENERAL_FEATS_REGISTRY_PHB2
 */

export const GENERAL_FEATS_REGISTRY_PHB2 = {
  "companion_spellbond": {
    "id": "companion_spellbond",
    "nameDe": "Companion Spellbond",
    "nameEn": "Companion Spellbond",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Animal companion class feature"
      }
    ],
    "benefitDe": "You can share spells with your animal companion out to a range of 30 feet, rather than the standard 5 feet.",
    "benefitRaw": "You can share spells with your animal companion out to a range of 30 feet, rather than the standard 5 feet.",
    "normalRaw": "Shared spells are lost if the companion is more than 5 feet away.",
    "specialRaw": "",
    "appEffect": "Share spells with your animal companion out to a range of 30 feet, rather than the standard 5 feet.",
    "name": "Companion Spellbond",
    "benefit": "You can share spells with your animal companion out to a range of 30 feet, rather than the standard 5 feet.",
    "benefitEn": "You can share spells with your animal companion out to a range of 30 feet, rather than the standard 5 feet."
  },
  "combat_acrobat": {
    "id": "combat_acrobat",
    "nameDe": "Combat Acrobat",
    "nameEn": "Combat Acrobat",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Balance 9 ranks"
      },
      {
        "type": "custom",
        "desc": "Tumble 9 ranks"
      }
    ],
    "benefitDe": "If you are tripped or knocked prone, you can make a DC 15 Balance check as an immediate action to remain standing. You can also tumble through difficult terrain without penalty.",
    "benefitRaw": "If you are tripped or knocked prone, you can make a DC 15 Balance check as an immediate action to remain standing. You can also tumble through difficult terrain without penalty.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "If you are tripped or knocked prone, you can make a DC 15 Balance check as an immediate action to remain standing",
    "name": "Combat Acrobat",
    "benefit": "If you are tripped or knocked prone, you can make a DC 15 Balance check as an immediate action to remain standing. You can also tumble through difficult terrain without penalty.",
    "benefitEn": "If you are tripped or knocked prone, you can make a DC 15 Balance check as an immediate action to remain standing. You can also tumble through difficult terrain without penalty."
  },
  "steadfast_determination": {
    "id": "steadfast_determination",
    "nameDe": "Steadfast Determination",
    "nameEn": "Steadfast Determination",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "endurance"
      }
    ],
    "benefitDe": "You use your Constitution modifier instead of your Wisdom modifier on Will saves. You do not automatically fail Fortitude saves on a roll of 1.",
    "benefitRaw": "You use your Constitution modifier instead of your Wisdom modifier on Will saves. You do not automatically fail Fortitude saves on a roll of 1.",
    "normalRaw": "Wisdom modifies Will saves. A roll of 1 on a Fortitude save is an automatic failure.",
    "specialRaw": "",
    "appEffect": "Your Constitution modifier instead of your Wisdom modifier on Will saves",
    "name": "Steadfast Determination",
    "benefit": "You use your Constitution modifier instead of your Wisdom modifier on Will saves. You do not automatically fail Fortitude saves on a roll of 1.",
    "benefitEn": "You use your Constitution modifier instead of your Wisdom modifier on Will saves. You do not automatically fail Fortitude saves on a roll of 1."
  },
  "telling_blow": {
    "id": "telling_blow",
    "nameDe": "Telling Blow",
    "nameEn": "Telling Blow",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Sneak attack or skirmish ability"
      }
    ],
    "benefitDe": "You add your sneak attack or skirmish extra damage to any critical hit you score in combat.",
    "benefitRaw": "You add your sneak attack or skirmish extra damage to any critical hit you score in combat.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "You add your sneak attack or skirmish extra damage to any critical hit you score in combat.",
    "name": "Telling Blow",
    "benefit": "You add your sneak attack or skirmish extra damage to any critical hit you score in combat.",
    "benefitEn": "You add your sneak attack or skirmish extra damage to any critical hit you score in combat."
  },
  "leap_of_the_heavens": {
    "id": "leap_of_the_heavens",
    "nameDe": "Leap of the Heavens",
    "nameEn": "Leap of the Heavens",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "name": "jump",
        "value": 4
      }
    ],
    "benefitDe": "When making a jump check without a 20-foot running start, the DC is not doubled. If you do have a running start, you gain a +5 competence bonus on the check.",
    "benefitRaw": "When making a jump check without a 20-foot running start, the DC is not doubled. If you do have a running start, you gain a +5 competence bonus on the check.",
    "normalRaw": "Standing jumps double the DC.",
    "specialRaw": "",
    "appEffect": "When making a jump check without a 20-foot running start, the DC is not doubled",
    "name": "Leap of the Heavens",
    "benefit": "When making a jump check without a 20-foot running start, the DC is not doubled. If you do have a running start, you gain a +5 competence bonus on the check.",
    "benefitEn": "When making a jump check without a 20-foot running start, the DC is not doubled. If you do have a running start, you gain a +5 competence bonus on the check."
  },
  "battle_dancer": {
    "id": "battle_dancer",
    "nameDe": "Battle Dancer",
    "nameEn": "Battle Dancer",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "bab",
        "value": 2
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "+2 morale bonus on melee attacks while moving and singing with bardic music.",
    "benefitRaw": "+2 morale bonus on melee attacks while moving and singing with bardic music.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 morale bonus on melee attacks while moving and singing with bardic music.",
    "name": "Battle Dancer",
    "benefit": "+2 morale bonus on melee attacks while moving and singing with bardic music.",
    "benefitEn": "+2 morale bonus on melee attacks while moving and singing with bardic music."
  },
  "cunning_evasion": {
    "id": "cunning_evasion",
    "nameDe": "Cunning Evasion",
    "nameEn": "Cunning Evasion",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "hide",
        "ranks": 9
      },
      {
        "type": "special",
        "desc": "Evasion"
      }
    ],
    "benefitDe": "Immediately hide and take a 5-ft. step when avoiding area attack via evasion.",
    "benefitRaw": "Immediately hide and take a 5-ft. step when avoiding area attack via evasion.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Immediately hide and take a 5-ft",
    "name": "Cunning Evasion",
    "benefit": "Immediately hide and take a 5-ft. step when avoiding area attack via evasion.",
    "benefitEn": "Immediately hide and take a 5-ft. step when avoiding area attack via evasion."
  },
  "fade_into_violence": {
    "id": "fade_into_violence",
    "nameDe": "Fade into Violence",
    "nameEn": "Fade into Violence",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "bluff",
        "ranks": 6
      },
      {
        "type": "skill",
        "skill": "hide",
        "ranks": 6
      }
    ],
    "benefitDe": "Opponent attacks adjacent ally instead of you if your Bluff check succeeds.",
    "benefitRaw": "Opponent attacks adjacent ally instead of you if your Bluff check succeeds.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opponent attacks adjacent ally instead of you if your Bluff check succeeds.",
    "name": "Fade into Violence",
    "benefit": "Opponent attacks adjacent ally instead of you if your Bluff check succeeds.",
    "benefitEn": "Opponent attacks adjacent ally instead of you if your Bluff check succeeds."
  },
  "fiery_ki_defense": {
    "id": "fiery_ki_defense",
    "nameDe": "Fiery Ki Defense",
    "nameEn": "Fiery Ki Defense",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "fiery_fist"
      },
      {
        "type": "feat",
        "id": "stunning_fist"
      },
      {
        "type": "stat",
        "name": "wis",
        "value": 13
      },
      {
        "type": "bab",
        "value": 8
      }
    ],
    "parent": "fiery_fist",
    "benefitDe": "Cloak yourself in flame, dealing 1d6 fire damage to melee attackers.",
    "benefitRaw": "Cloak yourself in flame, dealing 1d6 fire damage to melee attackers.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Cloak yourself in flame, dealing 1d6 fire damage to melee attackers.",
    "name": "Fiery Ki Defense",
    "benefit": "Cloak yourself in flame, dealing 1d6 fire damage to melee attackers.",
    "benefitEn": "Cloak yourself in flame, dealing 1d6 fire damage to melee attackers."
  },
  "ki_blast": {
    "id": "ki_blast",
    "nameDe": "Ki Blast",
    "nameEn": "Ki Blast",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "fiery_fist"
      },
      {
        "type": "feat",
        "id": "stunning_fist"
      },
      {
        "type": "stat",
        "name": "wis",
        "value": 13
      },
      {
        "type": "bab",
        "value": 8
      }
    ],
    "parent": "fiery_fist",
    "benefitDe": "Hurl a ball of ki energy (ranged touch attack up to 60 ft.) dealing unarmed damage + Wis mod.",
    "benefitRaw": "Hurl a ball of ki energy (ranged touch attack up to 60 ft.) dealing unarmed damage + Wis mod.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Hurl a ball of ki energy (ranged touch attack up to 60 ft.) dealing unarmed damage + Wis mod.",
    "name": "Ki Blast",
    "benefit": "Hurl a ball of ki energy (ranged touch attack up to 60 ft.) dealing unarmed damage + Wis mod.",
    "benefitEn": "Hurl a ball of ki energy (ranged touch attack up to 60 ft.) dealing unarmed damage + Wis mod."
  },
  "keen_eared_scout": {
    "id": "keen_eared_scout",
    "nameDe": "Keen-Eared Scout",
    "nameEn": "Keen-Eared Scout",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "listen",
        "ranks": 6
      }
    ],
    "benefitDe": "Listen checks reveal exact details about sounds, creature numbers and armor types.",
    "benefitRaw": "Listen checks reveal exact details about sounds, creature numbers and armor types.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Listen checks reveal exact details about sounds, creature numbers and armor types.",
    "name": "Keen-Eared Scout",
    "benefit": "Listen checks reveal exact details about sounds, creature numbers and armor types.",
    "benefitEn": "Listen checks reveal exact details about sounds, creature numbers and armor types."
  },
  "master_manipulator": {
    "id": "master_manipulator",
    "nameDe": "Master Manipulator",
    "nameEn": "Master Manipulator",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "stat",
        "name": "cha",
        "value": 13
      },
      {
        "type": "skill",
        "skill": "diplomacy",
        "ranks": 9
      }
    ],
    "benefitDe": "Use Diplomacy checks to trick foes in conversations into revealing secrets or turning against allies.",
    "benefitRaw": "Use Diplomacy checks to trick foes in conversations into revealing secrets or turning against allies.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Use Diplomacy checks to trick foes in conversations into revealing secrets or turning against allies.",
    "name": "Master Manipulator",
    "benefit": "Use Diplomacy checks to trick foes in conversations into revealing secrets or turning against allies.",
    "benefitEn": "Use Diplomacy checks to trick foes in conversations into revealing secrets or turning against allies."
  },
  "trophy_collector": {
    "id": "trophy_collector",
    "nameDe": "Trophy Collector",
    "nameEn": "Trophy Collector",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "bab",
        "value": 6
      }
    ],
    "benefitDe": "Harvest trophies from fallen foes for bonuses on saves and Intimidate checks.",
    "benefitRaw": "Harvest trophies from fallen foes for bonuses on saves and Intimidate checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Harvest trophies from fallen foes for bonuses on saves and Intimidate checks.",
    "name": "Trophy Collector",
    "benefit": "Harvest trophies from fallen foes for bonuses on saves and Intimidate checks.",
    "benefitEn": "Harvest trophies from fallen foes for bonuses on saves and Intimidate checks."
  },
  "wanderers_diplomacy": {
    "id": "wanderers_diplomacy",
    "nameDe": "Wanderer's Diplomacy",
    "nameEn": "Wanderer's Diplomacy",
    "category": "general",
    "source": "phb2",
    "prereqs": [],
    "benefitDe": "Use Diplomacy to haggle for lower prices and influence attitudes rapidly.",
    "benefitRaw": "Use Diplomacy to haggle for lower prices and influence attitudes rapidly.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Use Diplomacy to haggle for lower prices and influence attitudes rapidly.",
    "name": "Wanderer's Diplomacy",
    "benefit": "Use Diplomacy to haggle for lower prices and influence attitudes rapidly.",
    "benefitEn": "Use Diplomacy to haggle for lower prices and influence attitudes rapidly."
  },
  "mad_alchemist": {
    "id": "mad_alchemist",
    "nameDe": "Mad Alchemist",
    "nameEn": "Mad Alchemist",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "craft_alchemy",
        "ranks": 6
      }
    ],
    "benefitDe": "Tactical feat: fiery blaze, acid splash, and tanglefoot tactical benefits.",
    "benefitRaw": "Tactical feat: fiery blaze, acid splash, and tanglefoot tactical benefits.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Tactical feat: fiery blaze, acid splash, and tanglefoot tactical benefits.",
    "name": "Mad Alchemist",
    "benefit": "Tactical feat: fiery blaze, acid splash, and tanglefoot tactical benefits.",
    "benefitEn": "Tactical feat: fiery blaze, acid splash, and tanglefoot tactical benefits."
  },
  "mad_foam_rager": {
    "id": "mad_foam_rager",
    "nameDe": "Mad Foam Rager",
    "nameEn": "Mad Foam Rager",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Rage or frenzy ability"
      }
    ],
    "benefitDe": "Once per rage, delay the damage or effect of an attack or spell for 1 round.",
    "benefitRaw": "Once per rage, delay the damage or effect of an attack or spell for 1 round.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Once per rage, delay the damage or effect of an attack or spell for 1 round.",
    "name": "Mad Foam Rager",
    "benefit": "Once per rage, delay the damage or effect of an attack or spell for 1 round.",
    "benefitEn": "Once per rage, delay the damage or effect of an attack or spell for 1 round."
  },
  "vatic_gaze": {
    "id": "vatic_gaze",
    "nameDe": "Vatic Gaze",
    "nameEn": "Vatic Gaze",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Arcane caster level 9th"
      }
    ],
    "benefitDe": "Instantly detect magic and sense a target's caster level as a swift action.",
    "benefitRaw": "Instantly detect magic and sense a target's caster level as a swift action.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Instantly detect magic and sense a target's caster level as a swift action.",
    "name": "Vatic Gaze",
    "benefit": "Instantly detect magic and sense a target's caster level as a swift action.",
    "benefitEn": "Instantly detect magic and sense a target's caster level as a swift action."
  },
  "arcane_accompaniment": {
    "id": "arcane_accompaniment",
    "nameDe": "Arcane Accompaniment",
    "nameEn": "Arcane Accompaniment",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 4
      },
      {
        "type": "special",
        "desc": "Bardic music, arcane caster level 1st"
      }
    ],
    "benefitDe": "Expend a spell slot to extend the duration of your bardic music.",
    "benefitRaw": "Expend a spell slot to extend the duration of your bardic music.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend a spell slot to extend the duration of your bardic music.",
    "name": "Arcane Accompaniment",
    "benefit": "Expend a spell slot to extend the duration of your bardic music.",
    "benefitEn": "Expend a spell slot to extend the duration of your bardic music."
  },
  "arcane_flourish": {
    "id": "arcane_flourish",
    "nameDe": "Arcane Flourish",
    "nameEn": "Arcane Flourish",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 4
      },
      {
        "type": "special",
        "desc": "Arcane caster level 1st"
      }
    ],
    "benefitDe": "Expend a spell slot to gain a competence bonus on your next Perform check.",
    "benefitRaw": "Expend a spell slot to gain a competence bonus on your next Perform check.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend a spell slot to gain a competence bonus on your next Perform check.",
    "name": "Arcane Flourish",
    "benefit": "Expend a spell slot to gain a competence bonus on your next Perform check.",
    "benefitEn": "Expend a spell slot to gain a competence bonus on your next Perform check."
  },
  "arcane_toughness": {
    "id": "arcane_toughness",
    "nameDe": "Arcane Toughness",
    "nameEn": "Arcane Toughness",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "toughness"
      },
      {
        "type": "special",
        "desc": "Arcane caster level 3rd"
      }
    ],
    "parent": "toughness",
    "benefitDe": "Expend a spell slot as an immediate action when reduced to 0 or fewer HP to heal twice the slot's level.",
    "benefitRaw": "Expend a spell slot as an immediate action when reduced to 0 or fewer HP to heal twice the slot's level.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend a spell slot as an immediate action when reduced to 0 or fewer HP to heal twice the slot's level.",
    "name": "Arcane Toughness",
    "benefit": "Expend a spell slot as an immediate action when reduced to 0 or fewer HP to heal twice the slot's level.",
    "benefitEn": "Expend a spell slot as an immediate action when reduced to 0 or fewer HP to heal twice the slot's level."
  },
  "bonded_familiar": {
    "id": "bonded_familiar",
    "nameDe": "Bonded Familiar",
    "nameEn": "Bonded Familiar",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Familiar"
      }
    ],
    "benefitDe": "Shift deadly damage from yourself to your familiar as an immediate action.",
    "benefitRaw": "Shift deadly damage from yourself to your familiar as an immediate action.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Shift deadly damage from yourself to your familiar as an immediate action.",
    "name": "Bonded Familiar",
    "benefit": "Shift deadly damage from yourself to your familiar as an immediate action.",
    "benefitEn": "Shift deadly damage from yourself to your familiar as an immediate action."
  },
  "combat_familiar": {
    "id": "combat_familiar",
    "nameDe": "Combat Familiar",
    "nameEn": "Combat Familiar",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Familiar, arcane caster level 1st"
      }
    ],
    "benefitDe": "Your familiar enters a foe's square without provoking attacks of opportunity.",
    "benefitRaw": "Your familiar enters a foe's square without provoking attacks of opportunity.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Your familiar enters a foe's square without provoking attacks of opportunity.",
    "name": "Combat Familiar",
    "benefit": "Your familiar enters a foe's square without provoking attacks of opportunity.",
    "benefitEn": "Your familiar enters a foe's square without provoking attacks of opportunity."
  },
  "lurking_familiar": {
    "id": "lurking_familiar",
    "nameDe": "Lurking Familiar",
    "nameEn": "Lurking Familiar",
    "category": "general",
    "source": "phb2",
    "parent": "combat_familiar",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_familiar"
      },
      {
        "type": "special",
        "desc": "Arcane caster level 6th"
      }
    ],
    "benefitDe": "Your familiar can hide in your space and has total cover while there.",
    "benefitRaw": "Your familiar can hide in your space and has total cover while there.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Your familiar can hide in your space and has total cover while there.",
    "name": "Lurking Familiar",
    "benefit": "Your familiar can hide in your space and has total cover while there.",
    "benefitEn": "Your familiar can hide in your space and has total cover while there."
  },
  "divine_armor": {
    "id": "divine_armor",
    "nameDe": "Divine Armor",
    "nameEn": "Divine Armor",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn or rebuke undead"
      }
    ],
    "benefitDe": "Expend a turn/rebuke use as a swift action to gain DR 5/evil or DR 5/good for 1 round.",
    "benefitRaw": "Expend a turn/rebuke use as a swift action to gain DR 5/evil or DR 5/good for 1 round.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend a turn/rebuke use as a swift action to gain DR 5/evil or DR 5/good for 1 round.",
    "name": "Divine Armor",
    "benefit": "Expend a turn/rebuke use as a swift action to gain DR 5/evil or DR 5/good for 1 round.",
    "benefitEn": "Expend a turn/rebuke use as a swift action to gain DR 5/evil or DR 5/good for 1 round."
  },
  "divine_fortune": {
    "id": "divine_fortune",
    "nameDe": "Divine Fortune",
    "nameEn": "Divine Fortune",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn or rebuke undead"
      }
    ],
    "benefitDe": "Expend a turn/rebuke use as an immediate action for a +4 bonus on your next save.",
    "benefitRaw": "Expend a turn/rebuke use as an immediate action for a +4 bonus on your next save.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend a turn/rebuke use as an immediate action for a +4 bonus on your next save.",
    "name": "Divine Fortune",
    "benefit": "Expend a turn/rebuke use as an immediate action for a +4 bonus on your next save.",
    "benefitEn": "Expend a turn/rebuke use as an immediate action for a +4 bonus on your next save."
  },
  "divine_justice": {
    "id": "divine_justice",
    "nameDe": "Divine Justice",
    "nameEn": "Divine Justice",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn or rebuke undead"
      }
    ],
    "benefitDe": "Expend a turn/rebuke use to deal retribution damage to a foe who injured you.",
    "benefitRaw": "Expend a turn/rebuke use to deal retribution damage to a foe who injured you.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend a turn/rebuke use to deal retribution damage to a foe who injured you.",
    "name": "Divine Justice",
    "benefit": "Expend a turn/rebuke use to deal retribution damage to a foe who injured you.",
    "benefitEn": "Expend a turn/rebuke use to deal retribution damage to a foe who injured you."
  },
  "divine_ward": {
    "id": "divine_ward",
    "nameDe": "Divine Ward",
    "nameEn": "Divine Ward",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn or rebuke undead"
      }
    ],
    "benefitDe": "Cast touch spells on an attuned ally at range.",
    "benefitRaw": "Cast touch spells on an attuned ally at range.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Cast touch spells on an attuned ally at range.",
    "name": "Divine Ward",
    "benefit": "Cast touch spells on an attuned ally at range.",
    "benefitEn": "Cast touch spells on an attuned ally at range."
  },
  "profane_aura": {
    "id": "profane_aura",
    "nameDe": "Profane Aura",
    "nameEn": "Profane Aura",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to rebuke undead"
      }
    ],
    "benefitDe": "Expend a rebuke use to create a 60-ft. aura imposing penalties on foe saves against fear.",
    "benefitRaw": "Expend a rebuke use to create a 60-ft. aura imposing penalties on foe saves against fear.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend a rebuke use to create a 60-ft",
    "name": "Profane Aura",
    "benefit": "Expend a rebuke use to create a 60-ft. aura imposing penalties on foe saves against fear.",
    "benefitEn": "Expend a rebuke use to create a 60-ft. aura imposing penalties on foe saves against fear."
  },
  "sacred_healing": {
    "id": "sacred_healing",
    "nameDe": "Sacred Healing",
    "nameEn": "Sacred Healing",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn undead, Heal 8 ranks"
      }
    ],
    "benefitDe": "Expend a turn use to grant your healing spells +2 healed HP per spell level for 1 round.",
    "benefitRaw": "Expend a turn use to grant your healing spells +2 healed HP per spell level for 1 round.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend a turn use to grant your healing spells +2 healed HP per spell level for 1 round.",
    "name": "Sacred Healing",
    "benefit": "Expend a turn use to grant your healing spells +2 healed HP per spell level for 1 round.",
    "benefitEn": "Expend a turn use to grant your healing spells +2 healed HP per spell level for 1 round."
  },
  "sacred_purification": {
    "id": "sacred_purification",
    "nameDe": "Sacred Purification",
    "nameEn": "Sacred Purification",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn undead"
      }
    ],
    "benefitDe": "Expend a turn use to emit a burst healing living creatures 1d8+Cha and damaging undead.",
    "benefitRaw": "Expend a turn use to emit a burst healing living creatures 1d8+Cha and damaging undead.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend a turn use to emit a burst healing living creatures 1d8+Cha and damaging undead.",
    "name": "Sacred Purification",
    "benefit": "Expend a turn use to emit a burst healing living creatures 1d8+Cha and damaging undead.",
    "benefitEn": "Expend a turn use to emit a burst healing living creatures 1d8+Cha and damaging undead."
  },
  "sacred_radiance": {
    "id": "sacred_radiance",
    "nameDe": "Sacred Radiance",
    "nameEn": "Sacred Radiance",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn undead"
      }
    ],
    "benefitDe": "Expend a turn use to radiate bright light damaging undead for 2d6 per round.",
    "benefitRaw": "Expend a turn use to radiate bright light damaging undead for 2d6 per round.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend a turn use to radiate bright light damaging undead for 2d6 per round.",
    "name": "Sacred Radiance",
    "benefit": "Expend a turn use to radiate bright light damaging undead for 2d6 per round.",
    "benefitEn": "Expend a turn use to radiate bright light damaging undead for 2d6 per round."
  },
  "celestial_sorcerer_heritage": {
    "id": "celestial_sorcerer_heritage",
    "nameDe": "Celestial Sorcerer Heritage",
    "nameEn": "Celestial Sorcerer Heritage",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "class",
        "class": "sorcerer"
      }
    ],
    "benefitDe": "+2 bonus on saves against poison and electricity; gain Spellcraft as class skill.",
    "benefitRaw": "+2 bonus on saves against poison and electricity; gain Spellcraft as class skill.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 bonus on saves against poison and electricity; gain Spellcraft as class skill.",
    "name": "Celestial Sorcerer Heritage",
    "benefit": "+2 bonus on saves against poison and electricity; gain Spellcraft as class skill.",
    "benefitEn": "+2 bonus on saves against poison and electricity; gain Spellcraft as class skill."
  },
  "celestial_sorcerer_aura": {
    "id": "celestial_sorcerer_aura",
    "nameDe": "Celestial Sorcerer Aura",
    "nameEn": "Celestial Sorcerer Aura",
    "category": "general",
    "source": "phb2",
    "parent": "celestial_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "celestial_sorcerer_heritage"
      }
    ],
    "benefitDe": "Expend spell slot to cause evil foes to become shaken.",
    "benefitRaw": "Expend spell slot to cause evil foes to become shaken.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend spell slot to cause evil foes to become shaken.",
    "name": "Celestial Sorcerer Aura",
    "benefit": "Expend spell slot to cause evil foes to become shaken.",
    "benefitEn": "Expend spell slot to cause evil foes to become shaken."
  },
  "celestial_sorcerer_lance": {
    "id": "celestial_sorcerer_lance",
    "nameDe": "Celestial Sorcerer Lance",
    "nameEn": "Celestial Sorcerer Lance",
    "category": "general",
    "source": "phb2",
    "parent": "celestial_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "celestial_sorcerer_heritage"
      }
    ],
    "benefitDe": "Expend spell slot to create a 60-ft. line dealing 1d8 damage per slot level.",
    "benefitRaw": "Expend spell slot to create a 60-ft. line dealing 1d8 damage per slot level.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend spell slot to create a 60-ft",
    "name": "Celestial Sorcerer Lance",
    "benefit": "Expend spell slot to create a 60-ft. line dealing 1d8 damage per slot level.",
    "benefitEn": "Expend spell slot to create a 60-ft. line dealing 1d8 damage per slot level."
  },
  "celestial_sorcerer_lore": {
    "id": "celestial_sorcerer_lore",
    "nameDe": "Celestial Sorcerer Lore",
    "nameEn": "Celestial Sorcerer Lore",
    "category": "general",
    "source": "phb2",
    "parent": "celestial_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "celestial_sorcerer_heritage"
      }
    ],
    "benefitDe": "Add defensive and divination spells to your spells known list.",
    "benefitRaw": "Add defensive and divination spells to your spells known list.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Add defensive and divination spells to your spells known list.",
    "name": "Celestial Sorcerer Lore",
    "benefit": "Add defensive and divination spells to your spells known list.",
    "benefitEn": "Add defensive and divination spells to your spells known list."
  },
  "celestial_sorcerer_wings": {
    "id": "celestial_sorcerer_wings",
    "nameDe": "Celestial Sorcerer Wings",
    "nameEn": "Celestial Sorcerer Wings",
    "category": "general",
    "source": "phb2",
    "parent": "celestial_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "celestial_sorcerer_heritage"
      }
    ],
    "benefitDe": "Expend 3rd-level or higher slot to sprout wings and fly.",
    "benefitRaw": "Expend 3rd-level or higher slot to sprout wings and fly.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend 3rd-level or higher slot to sprout wings and fly.",
    "name": "Celestial Sorcerer Wings",
    "benefit": "Expend 3rd-level or higher slot to sprout wings and fly.",
    "benefitEn": "Expend 3rd-level or higher slot to sprout wings and fly."
  },
  "infernal_sorcerer_heritage": {
    "id": "infernal_sorcerer_heritage",
    "nameDe": "Infernal Sorcerer Heritage",
    "nameEn": "Infernal Sorcerer Heritage",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "class",
        "class": "sorcerer"
      }
    ],
    "benefitDe": "+2 on saves against poison and fire; Spellcraft as class skill.",
    "benefitRaw": "+2 on saves against poison and fire; Spellcraft as class skill.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 on saves against poison and fire; Spellcraft as class skill.",
    "name": "Infernal Sorcerer Heritage",
    "benefit": "+2 on saves against poison and fire; Spellcraft as class skill.",
    "benefitEn": "+2 on saves against poison and fire; Spellcraft as class skill."
  },
  "infernal_sorcerer_eyes": {
    "id": "infernal_sorcerer_eyes",
    "nameDe": "Infernal Sorcerer Eyes",
    "nameEn": "Infernal Sorcerer Eyes",
    "category": "general",
    "source": "phb2",
    "parent": "infernal_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "infernal_sorcerer_heritage"
      }
    ],
    "benefitDe": "Gain darkvision 60 ft., seeing through even magical darkness.",
    "benefitRaw": "Gain darkvision 60 ft., seeing through even magical darkness.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Gain darkvision 60 ft., seeing through even magical darkness.",
    "name": "Infernal Sorcerer Eyes",
    "benefit": "Gain darkvision 60 ft., seeing through even magical darkness.",
    "benefitEn": "Gain darkvision 60 ft., seeing through even magical darkness."
  },
  "infernal_sorcerer_howl": {
    "id": "infernal_sorcerer_howl",
    "nameDe": "Infernal Sorcerer Howl",
    "nameEn": "Infernal Sorcerer Howl",
    "category": "general",
    "source": "phb2",
    "parent": "infernal_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "infernal_sorcerer_heritage"
      }
    ],
    "benefitDe": "Expend a spell slot to deafen adjacent enemies with a terrifying howl.",
    "benefitRaw": "Expend a spell slot to deafen adjacent enemies with a terrifying howl.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend a spell slot to deafen adjacent enemies with a terrifying howl.",
    "name": "Infernal Sorcerer Howl",
    "benefit": "Expend a spell slot to deafen adjacent enemies with a terrifying howl.",
    "benefitEn": "Expend a spell slot to deafen adjacent enemies with a terrifying howl."
  },
  "infernal_sorcerer_resistance": {
    "id": "infernal_sorcerer_resistance",
    "nameDe": "Infernal Sorcerer Resistance",
    "nameEn": "Infernal Sorcerer Resistance",
    "category": "general",
    "source": "phb2",
    "parent": "infernal_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "infernal_sorcerer_heritage"
      }
    ],
    "benefitDe": "Gain resistance to acid and cold equal to twice your infernal feats.",
    "benefitRaw": "Gain resistance to acid and cold equal to twice your infernal feats.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Gain resistance to acid and cold equal to twice your infernal feats.",
    "name": "Infernal Sorcerer Resistance",
    "benefit": "Gain resistance to acid and cold equal to twice your infernal feats.",
    "benefitEn": "Gain resistance to acid and cold equal to twice your infernal feats."
  }
};
