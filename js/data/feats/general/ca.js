/**
 * @module    ca
 * @summary   Standardized D&D 3.5e RAW English feats registry.
 * @exports   GENERAL_FEATS_REGISTRY_CA
 */

export const GENERAL_FEATS_REGISTRY_CA = {
  "appraise_magic_value": {
    "id": "appraise_magic_value",
    "nameDe": "Appraise Magic Value",
    "nameEn": "Appraise Magic Value",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "skill",
        "name": "appraise",
        "value": 5
      },
      {
        "type": "skill",
        "name": "knowledge_arcana",
        "value": 5
      },
      {
        "type": "skill",
        "name": "spellcraft",
        "value": 5
      }
    ],
    "benefitDe": "You can determine the magical properties of a magic item by spending 8 hours examining it and making a successful Appraise check (DC 10 + item caster level).",
    "benefitRaw": "You can determine the magical properties of a magic item by spending 8 hours examining it and making a successful Appraise check (DC 10 + item caster level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "You can determine the magical properties of a magic item by spending 8 hours examining it and making a success...",
    "name": "Appraise Magic Value",
    "benefit": "You can determine the magical properties of a magic item by spending 8 hours examining it and making a successful Appraise check (DC 10 + item caster level).",
    "benefitEn": "You can determine the magical properties of a magic item by spending 8 hours examining it and making a successful Appraise check (DC 10 + item caster level)."
  },
  "ascetic_hunter": {
    "id": "ascetic_hunter",
    "nameDe": "Ascetic Hunter",
    "nameEn": "Ascetic Hunter",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      },
      {
        "type": "custom",
        "desc": "Favored enemy"
      }
    ],
    "benefitDe": "Your monk and ranger levels stack for the purpose of determining your unarmed strike damage. If you hit your favored enemy with an unarmed strike, you add your favored enemy bonus to the DC of your Stunning Fist. You can freely multiclass between Monk and Ranger.",
    "benefitRaw": "Your monk and ranger levels stack for the purpose of determining your unarmed strike damage. If you hit your favored enemy with an unarmed strike, you add your favored enemy bonus to the DC of your Stunning Fist. You can freely multiclass between Monk and Ranger.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Your monk and ranger levels stack for the purpose of determining your unarmed strike damage",
    "name": "Ascetic Hunter",
    "benefit": "Your monk and ranger levels stack for the purpose of determining your unarmed strike damage. If you hit your favored enemy with an unarmed strike, you add your favored enemy bonus to the DC of your Stunning Fist. You can freely multiclass between Monk and Ranger.",
    "benefitEn": "Your monk and ranger levels stack for the purpose of determining your unarmed strike damage. If you hit your favored enemy with an unarmed strike, you add your favored enemy bonus to the DC of your Stunning Fist. You can freely multiclass between Monk and Ranger."
  },
  "ascetic_knight": {
    "id": "ascetic_knight",
    "nameDe": "Ascetic Knight",
    "nameEn": "Ascetic Knight",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      },
      {
        "type": "custom",
        "desc": "Smite evil"
      }
    ],
    "benefitDe": "Your paladin and monk levels stack for the purpose of determining your unarmed strike damage and your smite evil bonus damage. You can freely multiclass between Paladin and Monk.",
    "benefitRaw": "Your paladin and monk levels stack for the purpose of determining your unarmed strike damage and your smite evil bonus damage. You can freely multiclass between Paladin and Monk.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Your paladin and monk levels stack for the purpose of determining your unarmed strike damage and your smite evil bonus damage",
    "name": "Ascetic Knight",
    "benefit": "Your paladin and monk levels stack for the purpose of determining your unarmed strike damage and your smite evil bonus damage. You can freely multiclass between Paladin and Monk.",
    "benefitEn": "Your paladin and monk levels stack for the purpose of determining your unarmed strike damage and your smite evil bonus damage. You can freely multiclass between Paladin and Monk."
  },
  "ascetic_rogue": {
    "id": "ascetic_rogue",
    "nameDe": "Ascetic Rogue",
    "nameEn": "Ascetic Rogue",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      },
      {
        "type": "sneak_attack",
        "value": 1
      }
    ],
    "benefitDe": "Your monk and rogue levels stack for the purpose of determining your unarmed strike damage. Delivering a sneak attack with an unarmed strike and Stunning Fist adds +2 to the DC. You can freely multiclass between Monk and Rogue.",
    "benefitRaw": "Your monk and rogue levels stack for the purpose of determining your unarmed strike damage. Delivering a sneak attack with an unarmed strike and Stunning Fist adds +2 to the DC. You can freely multiclass between Monk and Rogue.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Your monk and rogue levels stack for the purpose of determining your unarmed strike damage",
    "name": "Ascetic Rogue",
    "benefit": "Your monk and rogue levels stack for the purpose of determining your unarmed strike damage. Delivering a sneak attack with an unarmed strike and Stunning Fist adds +2 to the DC. You can freely multiclass between Monk and Rogue.",
    "benefitEn": "Your monk and rogue levels stack for the purpose of determining your unarmed strike damage. Delivering a sneak attack with an unarmed strike and Stunning Fist adds +2 to the DC. You can freely multiclass between Monk and Rogue."
  },
  "combat_intuition": {
    "id": "combat_intuition",
    "nameDe": "Combat Intuition",
    "nameEn": "Combat Intuition",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "skill",
        "name": "sense_motive",
        "value": 4
      },
      {
        "type": "bab",
        "value": 5
      }
    ],
    "benefitDe": "You can assess an opponent's combat capability using Sense Motive as a free action. You also gain a +1 bonus on initiative checks.",
    "benefitRaw": "You can assess an opponent's combat capability using Sense Motive as a free action. You also gain a +1 bonus on initiative checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Assess an opponent's combat capability using Sense Motive as a free action",
    "name": "Combat Intuition",
    "benefit": "You can assess an opponent's combat capability using Sense Motive as a free action. You also gain a +1 bonus on initiative checks.",
    "benefitEn": "You can assess an opponent's combat capability using Sense Motive as a free action. You also gain a +1 bonus on initiative checks."
  },
  "danger_sense": {
    "id": "danger_sense",
    "nameDe": "Danger Sense",
    "nameEn": "Danger Sense",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_initiative"
      }
    ],
    "benefitDe": "Once per day, you can reroll an initiative check and take the better of the two rolls.",
    "benefitRaw": "Once per day, you can reroll an initiative check and take the better of the two rolls.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Once per day, you can reroll an initiative check and take the better of the two rolls.",
    "name": "Danger Sense",
    "benefit": "Once per day, you can reroll an initiative check and take the better of the two rolls.",
    "benefitEn": "Once per day, you can reroll an initiative check and take the better of the two rolls."
  },
  "dash": {
    "id": "dash",
    "nameDe": "Dash",
    "nameEn": "Dash",
    "category": "general",
    "source": "ca",
    "prereqs": [],
    "benefitDe": "If you are wearing light armor or no armor and carrying a light load, your speed increases by 5 feet.",
    "benefitRaw": "If you are wearing light armor or no armor and carrying a light load, your speed increases by 5 feet.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "If you are wearing light armor or no armor and carrying a light load, your speed increases by 5 feet.",
    "name": "Dash",
    "benefit": "If you are wearing light armor or no armor and carrying a light load, your speed increases by 5 feet.",
    "benefitEn": "If you are wearing light armor or no armor and carrying a light load, your speed increases by 5 feet."
  },
  "devoted_performer": {
    "id": "devoted_performer",
    "nameDe": "Devoted Performer",
    "nameEn": "Devoted Performer",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Bardic music"
      },
      {
        "type": "custom",
        "desc": "Smite evil"
      }
    ],
    "benefitDe": "Your paladin and bard levels stack for the purpose of determining your daily uses of smite evil and bardic music. You can freely multiclass between Paladin and Bard.",
    "benefitRaw": "Your paladin and bard levels stack for the purpose of determining your daily uses of smite evil and bardic music. You can freely multiclass between Paladin and Bard.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Your paladin and bard levels stack for the purpose of determining your daily uses of smite evil and bardic music",
    "name": "Devoted Performer",
    "benefit": "Your paladin and bard levels stack for the purpose of determining your daily uses of smite evil and bardic music. You can freely multiclass between Paladin and Bard.",
    "benefitEn": "Your paladin and bard levels stack for the purpose of determining your daily uses of smite evil and bardic music. You can freely multiclass between Paladin and Bard."
  },
  "devoted_tracker": {
    "id": "devoted_tracker",
    "nameDe": "Devoted Tracker",
    "nameEn": "Devoted Tracker",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "feat",
        "id": "track"
      },
      {
        "type": "custom",
        "desc": "Smite evil"
      },
      {
        "type": "custom",
        "desc": "Wild empathy"
      }
    ],
    "benefitDe": "If you have both a special mount and an animal companion, you can designate a single animal to serve as both. Your paladin and ranger levels stack for determining smite evil extra damage. You can freely multiclass between Paladin and Ranger.",
    "benefitRaw": "If you have both a special mount and an animal companion, you can designate a single animal to serve as both. Your paladin and ranger levels stack for determining smite evil extra damage. You can freely multiclass between Paladin and Ranger.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "If you have both a special mount and an animal companion, you can designate a single animal to serve as both",
    "name": "Devoted Tracker",
    "benefit": "If you have both a special mount and an animal companion, you can designate a single animal to serve as both. Your paladin and ranger levels stack for determining smite evil extra damage. You can freely multiclass between Paladin and Ranger.",
    "benefitEn": "If you have both a special mount and an animal companion, you can designate a single animal to serve as both. Your paladin and ranger levels stack for determining smite evil extra damage. You can freely multiclass between Paladin and Ranger."
  },
  "dive_for_cover": {
    "id": "dive_for_cover",
    "nameDe": "Dive for Cover",
    "nameEn": "Dive for Cover",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Base Reflex save +2"
      }
    ],
    "benefitDe": "If you fail a Reflex save, you can immediately attempt the save again. You fall prone as part of this effort.",
    "benefitRaw": "If you fail a Reflex save, you can immediately attempt the save again. You fall prone as part of this effort.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "If you fail a Reflex save, you can immediately attempt the save again",
    "name": "Dive for Cover",
    "benefit": "If you fail a Reflex save, you can immediately attempt the save again. You fall prone as part of this effort.",
    "benefitEn": "If you fail a Reflex save, you can immediately attempt the save again. You fall prone as part of this effort."
  },
  "extra_music": {
    "id": "extra_music",
    "nameDe": "Extra Music",
    "nameEn": "Extra Music",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "You can use your bardic music four extra times per day.",
    "benefitRaw": "You can use your bardic music four extra times per day.",
    "normalRaw": "",
    "specialRaw": "You can take this feat multiple times. Each time gives +4 daily uses.",
    "appEffect": "+4 bardic music uses per day",
    "name": "Extra Music",
    "benefit": "You can use your bardic music four extra times per day.",
    "benefitEn": "You can use your bardic music four extra times per day."
  },
  "force_of_personality": {
    "id": "force_of_personality",
    "nameDe": "Force of Personality",
    "nameEn": "Force of Personality",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "stat",
        "name": "cha",
        "value": 13
      }
    ],
    "benefitDe": "You use your Charisma modifier instead of your Wisdom modifier on Will saves against mind-affecting spells and abilities.",
    "benefitRaw": "You use your Charisma modifier instead of your Wisdom modifier on Will saves against mind-affecting spells and abilities.",
    "normalRaw": "Wisdom modifier is normally applied to Will saves.",
    "specialRaw": "",
    "appEffect": "Your Charisma modifier instead of your Wisdom modifier on Will saves against mind-affecting spells and abilities.",
    "name": "Force of Personality",
    "benefit": "You use your Charisma modifier instead of your Wisdom modifier on Will saves against mind-affecting spells and abilities.",
    "benefitEn": "You use your Charisma modifier instead of your Wisdom modifier on Will saves against mind-affecting spells and abilities."
  },
  "improved_flight": {
    "id": "improved_flight",
    "nameDe": "Improved Flight",
    "nameEn": "Improved Flight",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Fly speed"
      }
    ],
    "benefitDe": "Your maneuverability while flying improves by one grade (from clumsy to poor, poor to average, average to good, or good to perfect).",
    "benefitRaw": "Your maneuverability while flying improves by one grade (from clumsy to poor, poor to average, average to good, or good to perfect).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Your maneuverability while flying improves by one grade (from clumsy to poor, poor to average, average to good...",
    "name": "Improved Flight",
    "benefit": "Your maneuverability while flying improves by one grade (from clumsy to poor, poor to average, average to good, or good to perfect).",
    "benefitEn": "Your maneuverability while flying improves by one grade (from clumsy to poor, poor to average, average to good, or good to perfect)."
  },
  "improved_swimming": {
    "id": "improved_swimming",
    "nameDe": "Improved Swimming",
    "nameEn": "Improved Swimming",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "skill",
        "name": "swim",
        "value": 4
      }
    ],
    "benefitDe": "You can swim at your full base speed as a full-round action or at half speed as a move action.",
    "benefitRaw": "You can swim at your full base speed as a full-round action or at half speed as a move action.",
    "normalRaw": "Swimming normally allows one-quarter speed as a move action or half speed as a full-round action.",
    "specialRaw": "",
    "appEffect": "Swim at your full base speed as a full-round action or at half speed as a move action.",
    "name": "Improved Swimming",
    "benefit": "You can swim at your full base speed as a full-round action or at half speed as a move action.",
    "benefitEn": "You can swim at your full base speed as a full-round action or at half speed as a move action."
  },
  "insightful_reflexes": {
    "id": "insightful_reflexes",
    "nameDe": "Insightful Reflexes",
    "nameEn": "Insightful Reflexes",
    "category": "general",
    "source": "ca",
    "prereqs": [],
    "benefitDe": "You add your Intelligence modifier (instead of your Dexterity modifier) to all Reflex saves.",
    "benefitRaw": "You add your Intelligence modifier (instead of your Dexterity modifier) to all Reflex saves.",
    "normalRaw": "Dexterity is normally added to Reflex saves.",
    "specialRaw": "",
    "appEffect": "You add your Intelligence modifier (instead of your Dexterity modifier) to all Reflex saves.",
    "name": "Insightful Reflexes",
    "benefit": "You add your Intelligence modifier (instead of your Dexterity modifier) to all Reflex saves.",
    "benefitEn": "You add your Intelligence modifier (instead of your Dexterity modifier) to all Reflex saves."
  },
  "jack_of_all_trades": {
    "id": "jack_of_all_trades",
    "nameDe": "Jack of All Trades",
    "nameEn": "Jack of All Trades",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "stat",
        "name": "int",
        "value": 13
      },
      {
        "type": "level",
        "value": 6
      }
    ],
    "benefitDe": "You can use any skill untrained, even those that normally require training.",
    "benefitRaw": "You can use any skill untrained, even those that normally require training.",
    "normalRaw": "Trained-only skills cannot be attempted without at least 1/2 rank.",
    "specialRaw": "",
    "appEffect": "Use any skill untrained, even those that normally require training.",
    "name": "Jack of All Trades",
    "benefit": "You can use any skill untrained, even those that normally require training.",
    "benefitEn": "You can use any skill untrained, even those that normally require training."
  },
  "natural_bond": {
    "id": "natural_bond",
    "nameDe": "Natural Bond",
    "nameEn": "Natural Bond",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Animal companion"
      }
    ],
    "benefitDe": "Add +3 to your effective druid level for the purpose of determining the bonus Hit Dice, extra abilities, and other benefits of your animal companion (capped at character level).",
    "benefitRaw": "Add +3 to your effective druid level for the purpose of determining the bonus Hit Dice, extra abilities, and other benefits of your animal companion (capped at character level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Add +3 to your effective druid level for the purpose of determining the bonus Hit Dice, extra abilities, and o...",
    "name": "Natural Bond",
    "benefit": "Add +3 to your effective druid level for the purpose of determining the bonus Hit Dice, extra abilities, and other benefits of your animal companion (capped at character level).",
    "benefitEn": "Add +3 to your effective druid level for the purpose of determining the bonus Hit Dice, extra abilities, and other benefits of your animal companion (capped at character level)."
  },
  "open_minded": {
    "id": "open_minded",
    "nameDe": "Open Minded",
    "nameEn": "Open Minded",
    "category": "general",
    "source": "ca",
    "prereqs": [],
    "benefitDe": "You immediately gain 5 extra skill points.",
    "benefitRaw": "You immediately gain 5 extra skill points.",
    "normalRaw": "",
    "specialRaw": "You can take Open Minded multiple times. Each time it grants 5 additional skill points.",
    "appEffect": "You immediately gain 5 extra skill points.",
    "name": "Open Minded",
    "benefit": "You immediately gain 5 extra skill points.",
    "benefitEn": "You immediately gain 5 extra skill points."
  },
  "subsonics": {
    "id": "subsonics",
    "nameDe": "Subsonics",
    "nameEn": "Subsonics",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Bardic music"
      },
      {
        "type": "skill",
        "name": "perform",
        "value": 10
      }
    ],
    "benefitDe": "You can produce bardic music effects so quietly that they are nearly imperceptible, allowing you to inspire allies without giving away your presence.",
    "benefitRaw": "You can produce bardic music effects so quietly that they are nearly imperceptible, allowing you to inspire allies without giving away your presence.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "You can produce bardic music effects so quietly that they are nearly imperceptible, allowing you to inspire al...",
    "name": "Subsonics",
    "benefit": "You can produce bardic music effects so quietly that they are nearly imperceptible, allowing you to inspire allies without giving away your presence.",
    "benefitEn": "You can produce bardic music effects so quietly that they are nearly imperceptible, allowing you to inspire allies without giving away your presence."
  },
  "versatile_performer": {
    "id": "versatile_performer",
    "nameDe": "Versatile Performer",
    "nameEn": "Versatile Performer",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "skill",
        "name": "perform",
        "value": 5
      }
    ],
    "benefitDe": "You can use your highest Perform skill modifier for a number of other Perform categories equal to your Intelligence bonus. You can also combine two types of performance at once for a +2 bonus.",
    "benefitRaw": "You can use your highest Perform skill modifier for a number of other Perform categories equal to your Intelligence bonus. You can also combine two types of performance at once for a +2 bonus.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Use your highest Perform skill modifier for a number of other Perform categories equal to your Intelligence bonus",
    "name": "Versatile Performer",
    "benefit": "You can use your highest Perform skill modifier for a number of other Perform categories equal to your Intelligence bonus. You can also combine two types of performance at once for a +2 bonus.",
    "benefitEn": "You can use your highest Perform skill modifier for a number of other Perform categories equal to your Intelligence bonus. You can also combine two types of performance at once for a +2 bonus."
  },
  "tactile_trapsmith": {
    "id": "tactile_trapsmith",
    "nameDe": "Tactile Trapsmith",
    "nameEn": "Tactile Trapsmith",
    "category": "general",
    "source": "ca",
    "prereqs": [],
    "benefitDe": "You add your Dexterity bonus (rather than your Intelligence bonus) on all Search and Disable Device checks. In addition, you receive no penalty on these checks for darkness or blindness.",
    "benefitRaw": "You add your Dexterity bonus (rather than your Intelligence bonus) on all Search and Disable Device checks. In addition, you receive no penalty on these checks for darkness or blindness.",
    "normalRaw": "Search and Disable Device checks rely on Intelligence.",
    "specialRaw": "",
    "appEffect": "You add your Dexterity bonus (rather than your Intelligence bonus) on all Search and Disable Device checks",
    "name": "Tactile Trapsmith",
    "benefit": "You add your Dexterity bonus (rather than your Intelligence bonus) on all Search and Disable Device checks. In addition, you receive no penalty on these checks for darkness or blindness.",
    "benefitEn": "You add your Dexterity bonus (rather than your Intelligence bonus) on all Search and Disable Device checks. In addition, you receive no penalty on these checks for darkness or blindness."
  },
  "brachiation": {
    "id": "brachiation",
    "nameDe": "Brachiation",
    "nameEn": "Brachiation",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "climb",
        "ranks": 4
      },
      {
        "type": "skill",
        "skill": "jump",
        "ranks": 4
      }
    ],
    "benefitDe": "You can move through wooded areas at your base land speed, ignoring terrain penalties while at least 20 feet above ground.",
    "benefitRaw": "You can move through wooded areas at your base land speed, ignoring terrain penalties while at least 20 feet above ground.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Move through wooded areas at your base land speed, ignoring terrain penalties while at least 20 feet above ground.",
    "source": "ca",
    "name": "Brachiation",
    "benefit": "You can move through wooded areas at your base land speed, ignoring terrain penalties while at least 20 feet above ground.",
    "benefitEn": "You can move through wooded areas at your base land speed, ignoring terrain penalties while at least 20 feet above ground."
  },
  "devoted_inquisitor": {
    "id": "devoted_inquisitor",
    "nameDe": "Devoted Inquisitor",
    "nameEn": "Devoted Inquisitor",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Smite evil"
      },
      {
        "type": "special",
        "desc": "Sneak attack"
      }
    ],
    "benefitDe": "When you use smite evil and sneak attack together in one strike, the target must make a Fortitude save (DC 10 + 1/2 character level + Cha mod) or be dazed for 1 round.",
    "benefitRaw": "When you use smite evil and sneak attack together in one strike, the target must make a Fortitude save (DC 10 + 1/2 character level + Cha mod) or be dazed for 1 round.",
    "normalRaw": "",
    "specialRaw": "Paladin and rogue levels stack for determining smite evil damage and multiclassing freely.",
    "appEffect": "When you use smite evil and sneak attack together in one strike, the target must make a Fortitude save (DC 10...",
    "source": "ca",
    "name": "Devoted Inquisitor",
    "benefit": "When you use smite evil and sneak attack together in one strike, the target must make a Fortitude save (DC 10 + 1/2 character level + Cha mod) or be dazed for 1 round.",
    "benefitEn": "When you use smite evil and sneak attack together in one strike, the target must make a Fortitude save (DC 10 + 1/2 character level + Cha mod) or be dazed for 1 round."
  },
  "quick_reconnoiter": {
    "id": "quick_reconnoiter",
    "nameDe": "Quick Reconnoiter",
    "nameEn": "Quick Reconnoiter",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "listen",
        "ranks": 5
      },
      {
        "type": "skill",
        "skill": "spot",
        "ranks": 5
      }
    ],
    "benefitDe": "You can make one Spot check and one Listen check each round as a free action. You also gain a +2 bonus on initiative checks.",
    "benefitRaw": "You can make one Spot check and one Listen check each round as a free action. You also gain a +2 bonus on initiative checks.",
    "normalRaw": "Spot and Listen checks are move actions or reactions.",
    "specialRaw": "",
    "appEffect": "Make one Spot check and one Listen check each round as a free action",
    "source": "ca",
    "name": "Quick Reconnoiter",
    "benefit": "You can make one Spot check and one Listen check each round as a free action. You also gain a +2 bonus on initiative checks.",
    "benefitEn": "You can make one Spot check and one Listen check each round as a free action. You also gain a +2 bonus on initiative checks."
  },
  "obscure_lore": {
    "id": "obscure_lore",
    "nameDe": "Obscure Lore",
    "nameEn": "Obscure Lore",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Bardic music or lore class feature"
      }
    ],
    "benefitDe": "You gain a +4 insight bonus on bardic knowledge or lore checks.",
    "benefitRaw": "You gain a +4 insight bonus on bardic knowledge or lore checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "A +4 insight bonus on bardic knowledge or lore checks.",
    "source": "ca",
    "name": "Obscure Lore",
    "benefit": "You gain a +4 insight bonus on bardic knowledge or lore checks.",
    "benefitEn": "You gain a +4 insight bonus on bardic knowledge or lore checks."
  },
  "disguise_spell": {
    "id": "disguise_spell",
    "nameDe": "Disguise Spell",
    "nameEn": "Disguise Spell",
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
    "benefitDe": "You can cast spells unobtrusively as part of your performance, requiring observers to beat your Perform check with Spot or Spellcraft.",
    "benefitRaw": "You can cast spells unobtrusively as part of your performance, requiring observers to beat your Perform check with Spot or Spellcraft.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Cast spells unobtrusively as part of your performance, requiring observers to beat your Perform check with Spot or Spellcraft.",
    "source": "ca",
    "name": "Disguise Spell",
    "benefit": "You can cast spells unobtrusively as part of your performance, requiring observers to beat your Perform check with Spot or Spellcraft.",
    "benefitEn": "You can cast spells unobtrusively as part of your performance, requiring observers to beat your Perform check with Spot or Spellcraft."
  },
  "green_ear": {
    "id": "green_ear",
    "nameDe": "Green Ear",
    "nameEn": "Green Ear",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 10
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "You can alter any of your mind-affecting bardic music abilities so that they influence plant creatures.",
    "benefitRaw": "You can alter any of your mind-affecting bardic music abilities so that they influence plant creatures.",
    "normalRaw": "Plant creatures are immune to mind-affecting effects.",
    "specialRaw": "",
    "appEffect": "Alter any of your mind-affecting bardic music abilities so that they influence plant creatures.",
    "source": "ca",
    "name": "Green Ear",
    "benefit": "You can alter any of your mind-affecting bardic music abilities so that they influence plant creatures.",
    "benefitEn": "You can alter any of your mind-affecting bardic music abilities so that they influence plant creatures."
  },
  "lingering_song": {
    "id": "lingering_song",
    "nameDe": "Lingering Song",
    "nameEn": "Lingering Song",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "Your bardic music abilities that last after your performance stops now last for 1 minute (10 rounds) instead of 5 rounds.",
    "benefitRaw": "Your bardic music abilities that last after your performance stops now last for 1 minute (10 rounds) instead of 5 rounds.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Your bardic music abilities that last after your performance stops now last for 1 minute (10 rounds) instead of 5 rounds.",
    "source": "ca",
    "name": "Lingering Song",
    "benefit": "Your bardic music abilities that last after your performance stops now last for 1 minute (10 rounds) instead of 5 rounds.",
    "benefitEn": "Your bardic music abilities that last after your performance stops now last for 1 minute (10 rounds) instead of 5 rounds."
  },
  "chant_of_fortitude": {
    "id": "chant_of_fortitude",
    "nameDe": "Chant of Fortitude",
    "nameEn": "Chant of Fortitude",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "concentration",
        "ranks": 8
      },
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 8
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "You can expend one daily use of bardic music to keep your allies conscious and able to act when reduced to between -1 and -9 hit points.",
    "benefitRaw": "You can expend one daily use of bardic music to keep your allies conscious and able to act when reduced to between -1 and -9 hit points.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend one daily use of bardic music to keep your allies conscious and able to act when reduced to between -1 and -9 hit points.",
    "source": "ca",
    "name": "Chant of Fortitude",
    "benefit": "You can expend one daily use of bardic music to keep your allies conscious and able to act when reduced to between -1 and -9 hit points.",
    "benefitEn": "You can expend one daily use of bardic music to keep your allies conscious and able to act when reduced to between -1 and -9 hit points."
  },
  "ironskin_chant": {
    "id": "ironskin_chant",
    "nameDe": "Ironskin Chant",
    "nameEn": "Ironskin Chant",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "concentration",
        "ranks": 12
      },
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 12
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "As a swift action, expend one daily use of bardic music to gain damage reduction 5/— until the start of your next turn.",
    "benefitRaw": "As a swift action, expend one daily use of bardic music to gain damage reduction 5/— until the start of your next turn.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "As a swift action, expend one daily use of bardic music to gain damage reduction 5/— until the start of your next turn.",
    "source": "ca",
    "name": "Ironskin Chant",
    "benefit": "As a swift action, expend one daily use of bardic music to gain damage reduction 5/— until the start of your next turn.",
    "benefitEn": "As a swift action, expend one daily use of bardic music to gain damage reduction 5/— until the start of your next turn."
  },
  "lyric_spell": {
    "id": "lyric_spell",
    "nameDe": "Lyric Spell",
    "nameEn": "Lyric Spell",
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
      },
      {
        "type": "special",
        "desc": "Arcane spellcaster level 6th"
      }
    ],
    "benefitDe": "You can expend daily uses of bardic music to cast any prepared or known spell without expending a spell slot (1 use + spell level).",
    "benefitRaw": "You can expend daily uses of bardic music to cast any prepared or known spell without expending a spell slot (1 use + spell level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend daily uses of bardic music to cast any prepared or known spell without expending a spell slot (1 use + spell level).",
    "source": "ca",
    "name": "Lyric Spell",
    "benefit": "You can expend daily uses of bardic music to cast any prepared or known spell without expending a spell slot (1 use + spell level).",
    "benefitEn": "You can expend daily uses of bardic music to cast any prepared or known spell without expending a spell slot (1 use + spell level)."
  },
  "blindsense_feat": {
    "id": "blindsense",
    "nameDe": "Blindsense",
    "nameEn": "Blindsense",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "listen",
        "ranks": 4
      },
      {
        "type": "special",
        "desc": "Wild shape"
      }
    ],
    "benefitDe": "Expend one use of wild shape as a swift action to gain blindsense with a range of 30 feet for 1 minute.",
    "benefitRaw": "Expend one use of wild shape as a swift action to gain blindsense with a range of 30 feet for 1 minute.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend one use of wild shape as a swift action to gain blindsense with a range of 30 feet for 1 minute.",
    "source": "ca",
    "name": "Blindsense",
    "benefit": "Expend one use of wild shape as a swift action to gain blindsense with a range of 30 feet for 1 minute.",
    "benefitEn": "Expend one use of wild shape as a swift action to gain blindsense with a range of 30 feet for 1 minute."
  },
  "climb_like_an_ape": {
    "id": "climb_like_an_ape",
    "nameDe": "Climb Like an Ape",
    "nameEn": "Climb Like an Ape",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Wild shape"
      }
    ],
    "benefitDe": "Expend one use of wild shape as a swift action to gain a climb speed equal to one-half your base land speed for 1 minute.",
    "benefitRaw": "Expend one use of wild shape as a swift action to gain a climb speed equal to one-half your base land speed for 1 minute.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend one use of wild shape as a swift action to gain a climb speed equal to one-half your base land speed for 1 minute.",
    "source": "ca",
    "name": "Climb Like an Ape",
    "benefit": "Expend one use of wild shape as a swift action to gain a climb speed equal to one-half your base land speed for 1 minute.",
    "benefitEn": "Expend one use of wild shape as a swift action to gain a climb speed equal to one-half your base land speed for 1 minute."
  },
  "cougars_vision": {
    "id": "cougars_vision",
    "nameDe": "Cougar's Vision",
    "nameEn": "Cougar's Vision",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "spot",
        "ranks": 2
      },
      {
        "type": "special",
        "desc": "Wild shape"
      }
    ],
    "benefitDe": "Expend one use of wild shape as a swift action to gain low-light vision for 1 hour.",
    "benefitRaw": "Expend one use of wild shape as a swift action to gain low-light vision for 1 hour.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend one use of wild shape as a swift action to gain low-light vision for 1 hour.",
    "source": "ca",
    "name": "Cougar's Vision",
    "benefit": "Expend one use of wild shape as a swift action to gain low-light vision for 1 hour.",
    "benefitEn": "Expend one use of wild shape as a swift action to gain low-light vision for 1 hour."
  },
  "hawks_vision": {
    "id": "hawks_vision",
    "nameDe": "Hawk's Vision",
    "nameEn": "Hawk's Vision",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "spot",
        "ranks": 4
      },
      {
        "type": "special",
        "desc": "Wild shape"
      }
    ],
    "benefitDe": "Expend one use of wild shape as a swift action to gain a +8 bonus on Spot checks and halve range increment penalties for 1 hour.",
    "benefitRaw": "Expend one use of wild shape as a swift action to gain a +8 bonus on Spot checks and halve range increment penalties for 1 hour.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend one use of wild shape as a swift action to gain a +8 bonus on Spot checks and halve range increment penalties for 1 hour.",
    "source": "ca",
    "name": "Hawk's Vision",
    "benefit": "Expend one use of wild shape as a swift action to gain a +8 bonus on Spot checks and halve range increment penalties for 1 hour.",
    "benefitEn": "Expend one use of wild shape as a swift action to gain a +8 bonus on Spot checks and halve range increment penalties for 1 hour."
  },
  "savage_grapple": {
    "id": "savage_grapple",
    "nameDe": "Savage Grapple",
    "nameEn": "Savage Grapple",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Wild shape"
      },
      {
        "type": "special",
        "desc": "Sneak attack"
      }
    ],
    "benefitDe": "While in wild shape, you deal sneak attack damage whenever you deal damage with a successful grapple check.",
    "benefitRaw": "While in wild shape, you deal sneak attack damage whenever you deal damage with a successful grapple check.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "While in wild shape, you deal sneak attack damage whenever you deal damage with a successful grapple check.",
    "source": "ca",
    "name": "Savage Grapple",
    "benefit": "While in wild shape, you deal sneak attack damage whenever you deal damage with a successful grapple check.",
    "benefitEn": "While in wild shape, you deal sneak attack damage whenever you deal damage with a successful grapple check."
  },
  "scent_feat": {
    "id": "scent",
    "nameDe": "Scent",
    "nameEn": "Scent",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Wild shape"
      }
    ],
    "benefitDe": "Expend one use of wild shape as a swift action to gain the scent extraordinary ability for 1 hour.",
    "benefitRaw": "Expend one use of wild shape as a swift action to gain the scent extraordinary ability for 1 hour.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Expend one use of wild shape as a swift action to gain the scent extraordinary ability for 1 hour.",
    "source": "ca",
    "name": "Scent",
    "benefit": "Expend one use of wild shape as a swift action to gain the scent extraordinary ability for 1 hour.",
    "benefitEn": "Expend one use of wild shape as a swift action to gain the scent extraordinary ability for 1 hour."
  }
};
