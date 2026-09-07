/**
 * @module    phb
 * @summary   Standardized D&D 3.5e RAW English feats registry.
 * @exports   COMBAT_FEATS_REGISTRY_PHB
 */

export const COMBAT_FEATS_REGISTRY_PHB = {
  "improved_initiative": {
    "id": "improved_initiative",
    "nameDe": "Improved Initiative",
    "nameEn": "Improved Initiative",
    "category": "combat",
    "prereqs": [],
    "benefitDe": "You get a +4 bonus on initiative checks.",
    "benefitRaw": "You get a +4 bonus on initiative checks.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Improved Initiative as one of his fighter bonus feats.",
    "appEffect": "+4 bonus on Initiative checks",
    "source": "phb",
    "name": "Improved Initiative",
    "benefit": "You get a +4 bonus on initiative checks.",
    "benefitEn": "You get a +4 bonus on initiative checks."
  },
  "weapon_focus": {
    "id": "weapon_focus",
    "nameDe": "Weapon Focus",
    "nameEn": "Weapon Focus",
    "category": "combat",
    "prereqs": [
      {
        "type": "bab",
        "value": 1
      }
    ],
    "hasOption": true,
    "optionType": "weapon",
    "benefitDe": "You gain a +1 bonus on all attack rolls you make using the selected weapon.",
    "benefitRaw": "You gain a +1 bonus on all attack rolls you make using the selected weapon.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Weapon Focus as one of his fighter bonus feats. You can gain this feat multiple times, choosing a different weapon each time.",
    "appEffect": "+1 bonus on attack rolls with selected weapon",
    "source": "phb",
    "name": "Weapon Focus",
    "benefit": "You gain a +1 bonus on all attack rolls you make using the selected weapon.",
    "benefitEn": "You gain a +1 bonus on all attack rolls you make using the selected weapon."
  },
  "weapon_specialization": {
    "id": "weapon_specialization",
    "nameDe": "Weapon Specialization",
    "nameEn": "Weapon Specialization",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "weapon_focus"
      },
      {
        "type": "classLevel",
        "class": "fighter",
        "value": 4
      }
    ],
    "parent": "weapon_focus",
    "hasOption": true,
    "optionType": "weapon",
    "benefitDe": "You gain a +2 bonus on all damage rolls you make using the selected weapon.",
    "benefitRaw": "You gain a +2 bonus on all damage rolls you make using the selected weapon.",
    "normalRaw": "",
    "specialRaw": "Only a fighter of 4th level or higher may select Weapon Specialization as a bonus feat.",
    "appEffect": "+2 bonus on damage rolls with selected weapon",
    "source": "phb",
    "name": "Weapon Specialization",
    "benefit": "You gain a +2 bonus on all damage rolls you make using the selected weapon.",
    "benefitEn": "You gain a +2 bonus on all damage rolls you make using the selected weapon."
  },
  "greater_weapon_focus": {
    "id": "greater_weapon_focus",
    "nameDe": "Greater Weapon Focus",
    "nameEn": "Greater Weapon Focus",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "weapon_focus"
      },
      {
        "type": "classLevel",
        "class": "fighter",
        "value": 8
      }
    ],
    "parent": "weapon_focus",
    "hasOption": true,
    "optionType": "weapon",
    "benefitDe": "You gain a +1 bonus on all attack rolls you make using the selected weapon.",
    "benefitRaw": "You gain a +1 bonus on all attack rolls you make using the selected weapon.",
    "normalRaw": "",
    "specialRaw": "Only an 8th-level fighter may select this feat.",
    "appEffect": "+1 bonus on attack rolls with selected weapon (stacks)",
    "source": "phb",
    "name": "Greater Weapon Focus",
    "benefit": "You gain a +1 bonus on all attack rolls you make using the selected weapon.",
    "benefitEn": "You gain a +1 bonus on all attack rolls you make using the selected weapon."
  },
  "greater_weapon_specialization": {
    "id": "greater_weapon_specialization",
    "nameDe": "Greater Weapon Specialization",
    "nameEn": "Greater Weapon Specialization",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "greater_weapon_focus"
      },
      {
        "type": "feat",
        "id": "weapon_specialization"
      },
      {
        "type": "classLevel",
        "class": "fighter",
        "value": 12
      }
    ],
    "parent": "weapon_specialization",
    "hasOption": true,
    "optionType": "weapon",
    "benefitDe": "You gain a +2 bonus on all damage rolls you make using the selected weapon.",
    "benefitRaw": "You gain a +2 bonus on all damage rolls you make using the selected weapon.",
    "normalRaw": "",
    "specialRaw": "Only a 12th-level fighter may select this feat.",
    "appEffect": "+2 bonus on damage rolls with selected weapon (stacks)",
    "source": "phb",
    "name": "Greater Weapon Specialization",
    "benefit": "You gain a +2 bonus on all damage rolls you make using the selected weapon.",
    "benefitEn": "You gain a +2 bonus on all damage rolls you make using the selected weapon."
  },
  "combat_expertise": {
    "id": "combat_expertise",
    "nameDe": "Combat Expertise",
    "nameEn": "Combat Expertise",
    "category": "combat",
    "prereqs": [
      {
        "type": "stat",
        "name": "int",
        "value": 13
      }
    ],
    "benefitDe": "You can subtract up to 5 from your attack roll and add the same number as a dodge bonus to your Armor Class.",
    "benefitRaw": "You can subtract up to 5 from your attack roll and add the same number as a dodge bonus to your Armor Class.",
    "normalRaw": "Defensive fighting options are limited to -4/+2.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Enables Combat Expertise attack-to-AC slider (up to -5 / +5)",
    "source": "phb",
    "name": "Combat Expertise",
    "benefit": "You can subtract up to 5 from your attack roll and add the same number as a dodge bonus to your Armor Class.",
    "benefitEn": "You can subtract up to 5 from your attack roll and add the same number as a dodge bonus to your Armor Class."
  },
  "improved_disarm": {
    "id": "improved_disarm",
    "nameDe": "Improved Disarm",
    "nameEn": "Improved Disarm",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_expertise"
      }
    ],
    "parent": "combat_expertise",
    "benefitDe": "You gain a +4 bonus on your attempt to disarm an opponent, and you do not provoke an attack of opportunity.",
    "benefitRaw": "You gain a +4 bonus on your attempt to disarm an opponent, and you do not provoke an attack of opportunity.",
    "normalRaw": "Disarming provokes an attack of opportunity.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+4 bonus on disarm attempts; does not provoke attack of opportunity",
    "source": "phb",
    "name": "Improved Disarm",
    "benefit": "You gain a +4 bonus on your attempt to disarm an opponent, and you do not provoke an attack of opportunity.",
    "benefitEn": "You gain a +4 bonus on your attempt to disarm an opponent, and you do not provoke an attack of opportunity."
  },
  "improved_feint": {
    "id": "improved_feint",
    "nameDe": "Improved Feint",
    "nameEn": "Improved Feint",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_expertise"
      }
    ],
    "parent": "combat_expertise",
    "benefitDe": "You can make a Bluff check to feint in combat as a move action.",
    "benefitRaw": "You can make a Bluff check to feint in combat as a move action.",
    "normalRaw": "Feinting in combat is a standard action.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Feint in combat as a move action",
    "source": "phb",
    "name": "Improved Feint",
    "benefit": "You can make a Bluff check to feint in combat as a move action.",
    "benefitEn": "You can make a Bluff check to feint in combat as a move action."
  },
  "improved_trip": {
    "id": "improved_trip",
    "nameDe": "Improved Trip",
    "nameEn": "Improved Trip",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_expertise"
      }
    ],
    "parent": "combat_expertise",
    "benefitDe": "You gain a +4 bonus on your ability checks to trip an opponent. If you trip an opponent, you immediately get a melee attack against that opponent.",
    "benefitRaw": "You gain a +4 bonus on your ability checks to trip an opponent. If you trip an opponent, you immediately get a melee attack against that opponent.",
    "normalRaw": "Tripping provokes an attack of opportunity.",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 6 without prerequisites.",
    "appEffect": "+4 bonus on trip checks; make immediate melee attack upon success",
    "source": "phb",
    "name": "Improved Trip",
    "benefit": "You gain a +4 bonus on your ability checks to trip an opponent. If you trip an opponent, you immediately get a melee attack against that opponent.",
    "benefitEn": "You gain a +4 bonus on your ability checks to trip an opponent. If you trip an opponent, you immediately get a melee attack against that opponent."
  },
  "whirlwind_attack": {
    "id": "whirlwind_attack",
    "nameDe": "Whirlwind Attack",
    "nameEn": "Whirlwind Attack",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_expertise"
      },
      {
        "type": "feat",
        "id": "dodge"
      },
      {
        "type": "feat",
        "id": "mobility"
      },
      {
        "type": "feat",
        "id": "spring_attack"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 13
      },
      {
        "type": "bab",
        "value": 4
      }
    ],
    "parent": "spring_attack",
    "benefitDe": "When you use the full attack action, you can give up your regular attacks and instead make one melee attack at your full base attack bonus against each opponent within reach.",
    "benefitRaw": "When you use the full attack action, you can give up your regular attacks and instead make one melee attack at your full base attack bonus against each opponent within reach.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Make one melee attack at full BAB against each adjacent opponent (full-round action)",
    "source": "phb",
    "name": "Whirlwind Attack",
    "benefit": "When you use the full attack action, you can give up your regular attacks and instead make one melee attack at your full base attack bonus against each opponent within reach.",
    "benefitEn": "When you use the full attack action, you can give up your regular attacks and instead make one melee attack at your full base attack bonus against each opponent within reach."
  },
  "dodge": {
    "id": "dodge",
    "nameDe": "Dodge",
    "nameEn": "Dodge",
    "category": "combat",
    "prereqs": [
      {
        "type": "stat",
        "name": "dex",
        "value": 13
      }
    ],
    "benefitDe": "During your action, you designate an opponent and receive a +1 dodge bonus to AC against attacks from that opponent.",
    "benefitRaw": "During your action, you designate an opponent and receive a +1 dodge bonus to AC against attacks from that opponent.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 1.",
    "appEffect": "+1 dodge bonus to AC against designated opponent",
    "source": "phb",
    "name": "Dodge",
    "benefit": "During your action, you designate an opponent and receive a +1 dodge bonus to AC against attacks from that opponent.",
    "benefitEn": "During your action, you designate an opponent and receive a +1 dodge bonus to AC against attacks from that opponent."
  },
  "mobility": {
    "id": "mobility",
    "nameDe": "Mobility",
    "nameEn": "Mobility",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "dodge"
      }
    ],
    "parent": "dodge",
    "benefitDe": "You get a +4 dodge bonus to Armor Class against attacks of opportunity caused by you moving out of or within a threatened area.",
    "benefitRaw": "You get a +4 dodge bonus to Armor Class against attacks of opportunity caused by you moving out of or within a threatened area.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 2.",
    "appEffect": "+4 dodge bonus to AC against attacks of opportunity caused by movement",
    "source": "phb",
    "name": "Mobility",
    "benefit": "You get a +4 dodge bonus to Armor Class against attacks of opportunity caused by you moving out of or within a threatened area.",
    "benefitEn": "You get a +4 dodge bonus to Armor Class against attacks of opportunity caused by you moving out of or within a threatened area."
  },
  "spring_attack": {
    "id": "spring_attack",
    "nameDe": "Spring Attack",
    "nameEn": "Spring Attack",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "mobility"
      },
      {
        "type": "bab",
        "value": 4
      }
    ],
    "parent": "mobility",
    "benefitDe": "You can move, make a single melee attack, and then move again, without provoking an attack of opportunity from the defender.",
    "benefitRaw": "You can move, make a single melee attack, and then move again, without provoking an attack of opportunity from the defender.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Move both before and after a melee attack without provoking attack of opportunity from target",
    "source": "phb",
    "name": "Spring Attack",
    "benefit": "You can move, make a single melee attack, and then move again, without provoking an attack of opportunity from the defender.",
    "benefitEn": "You can move, make a single melee attack, and then move again, without provoking an attack of opportunity from the defender."
  },
  "power_attack": {
    "id": "power_attack",
    "nameDe": "Power Attack",
    "nameEn": "Power Attack",
    "category": "combat",
    "prereqs": [
      {
        "type": "stat",
        "name": "str",
        "value": 13
      }
    ],
    "benefitDe": "On your action, before making attack rolls, you may choose to subtract a number from all melee attack rolls and add that same number to all melee damage rolls.",
    "benefitRaw": "On your action, before making attack rolls, you may choose to subtract a number from all melee attack rolls and add that same number to all melee damage rolls.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Enables Power Attack slider (trade attack bonus for melee damage)",
    "source": "phb",
    "name": "Power Attack",
    "benefit": "On your action, before making attack rolls, you may choose to subtract a number from all melee attack rolls and add that same number to all melee damage rolls.",
    "benefitEn": "On your action, before making attack rolls, you may choose to subtract a number from all melee attack rolls and add that same number to all melee damage rolls."
  },
  "cleave": {
    "id": "cleave",
    "nameDe": "Cleave",
    "nameEn": "Cleave",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "power_attack"
      }
    ],
    "parent": "power_attack",
    "benefitDe": "If you deal a creature enough damage to make it drop, you get an immediate extra melee attack against another creature within reach.",
    "benefitRaw": "If you deal a creature enough damage to make it drop, you get an immediate extra melee attack against another creature within reach.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Immediate extra melee attack when dropping a foe (1/round)",
    "source": "phb",
    "name": "Cleave",
    "benefit": "If you deal a creature enough damage to make it drop, you get an immediate extra melee attack against another creature within reach.",
    "benefitEn": "If you deal a creature enough damage to make it drop, you get an immediate extra melee attack against another creature within reach."
  },
  "great_cleave": {
    "id": "great_cleave",
    "nameDe": "Great Cleave",
    "nameEn": "Great Cleave",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "cleave"
      },
      {
        "type": "bab",
        "value": 4
      }
    ],
    "parent": "cleave",
    "benefitDe": "This feat works like Cleave, except that there is no limit to the number of times you can use it per round.",
    "benefitRaw": "This feat works like Cleave, except that there is no limit to the number of times you can use it per round.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "No limit to number of Cleave attacks per round",
    "source": "phb",
    "name": "Great Cleave",
    "benefit": "This feat works like Cleave, except that there is no limit to the number of times you can use it per round.",
    "benefitEn": "This feat works like Cleave, except that there is no limit to the number of times you can use it per round."
  },
  "improved_bull_rush": {
    "id": "improved_bull_rush",
    "nameDe": "Improved Bull Rush",
    "nameEn": "Improved Bull Rush",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "power_attack"
      }
    ],
    "parent": "power_attack",
    "benefitDe": "You gain a +4 bonus on your Strength checks to bull rush an opponent, and you do not provoke an attack of opportunity.",
    "benefitRaw": "You gain a +4 bonus on your Strength checks to bull rush an opponent, and you do not provoke an attack of opportunity.",
    "normalRaw": "Bull rushing provokes an AoO.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+4 bonus on bull rush checks; does not provoke attack of opportunity",
    "source": "phb",
    "name": "Improved Bull Rush",
    "benefit": "You gain a +4 bonus on your Strength checks to bull rush an opponent, and you do not provoke an attack of opportunity.",
    "benefitEn": "You gain a +4 bonus on your Strength checks to bull rush an opponent, and you do not provoke an attack of opportunity."
  },
  "improved_overrun": {
    "id": "improved_overrun",
    "nameDe": "Improved Overrun",
    "nameEn": "Improved Overrun",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "power_attack"
      }
    ],
    "parent": "power_attack",
    "benefitDe": "When you overrun, the target may not choose to avoid you. You also gain a +4 bonus on Strength checks to knock down the target.",
    "benefitRaw": "When you overrun, the target may not choose to avoid you. You also gain a +4 bonus on Strength checks to knock down the target.",
    "normalRaw": "Opponent can choose to avoid you.",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 1.",
    "appEffect": "+4 bonus on overrun checks; opponent cannot avoid",
    "source": "phb",
    "name": "Improved Overrun",
    "benefit": "When you overrun, the target may not choose to avoid you. You also gain a +4 bonus on Strength checks to knock down the target.",
    "benefitEn": "When you overrun, the target may not choose to avoid you. You also gain a +4 bonus on Strength checks to knock down the target."
  },
  "improved_sunder": {
    "id": "improved_sunder",
    "nameDe": "Improved Sunder",
    "nameEn": "Improved Sunder",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "power_attack"
      }
    ],
    "parent": "power_attack",
    "benefitDe": "You gain a +4 bonus on attack rolls to strike an opponent’s weapon or shield, and you do not provoke an attack of opportunity.",
    "benefitRaw": "You gain a +4 bonus on attack rolls to strike an opponent’s weapon or shield, and you do not provoke an attack of opportunity.",
    "normalRaw": "Sunder attempts provoke an AoO.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+4 bonus on sunder attempts; does not provoke attack of opportunity",
    "source": "phb",
    "name": "Improved Sunder",
    "benefit": "You gain a +4 bonus on attack rolls to strike an opponent’s weapon or shield, and you do not provoke an attack of opportunity.",
    "benefitEn": "You gain a +4 bonus on attack rolls to strike an opponent’s weapon or shield, and you do not provoke an attack of opportunity."
  },
  "point_blank_shot": {
    "id": "point_blank_shot",
    "nameDe": "Point-Blank Shot",
    "nameEn": "Point-Blank Shot",
    "category": "combat",
    "prereqs": [],
    "benefitDe": "You get a +1 bonus on attack and damage rolls with ranged weapons at ranges up to 30 feet.",
    "benefitRaw": "You get a +1 bonus on attack and damage rolls with ranged weapons at ranges up to 30 feet.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+1 bonus on attack and damage rolls with ranged weapons within 30 ft.",
    "source": "phb",
    "name": "Point-Blank Shot",
    "benefit": "You get a +1 bonus on attack and damage rolls with ranged weapons at ranges up to 30 feet.",
    "benefitEn": "You get a +1 bonus on attack and damage rolls with ranged weapons at ranges up to 30 feet."
  },
  "far_shot": {
    "id": "far_shot",
    "nameDe": "Far Shot",
    "nameEn": "Far Shot",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "point_blank_shot"
      }
    ],
    "parent": "point_blank_shot",
    "benefitDe": "When you use a ranged weapon, its range increment increases by 50% (or 100% for thrown weapons).",
    "benefitRaw": "When you use a ranged weapon, its range increment increases by 50% (or 100% for thrown weapons).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Increases range increments by 50% (bows/thrown) or 100% (crossbows)",
    "source": "phb",
    "name": "Far Shot",
    "benefit": "When you use a ranged weapon, its range increment increases by 50% (or 100% for thrown weapons).",
    "benefitEn": "When you use a ranged weapon, its range increment increases by 50% (or 100% for thrown weapons)."
  },
  "precise_shot": {
    "id": "precise_shot",
    "nameDe": "Precise Shot",
    "nameEn": "Precise Shot",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "point_blank_shot"
      }
    ],
    "parent": "point_blank_shot",
    "benefitDe": "You can shoot or throw ranged weapons at an opponent engaged in melee without taking the standard -4 penalty.",
    "benefitRaw": "You can shoot or throw ranged weapons at an opponent engaged in melee without taking the standard -4 penalty.",
    "normalRaw": "Shooting into melee incurs a -4 penalty.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "No -4 penalty for shooting or throwing into melee",
    "source": "phb",
    "name": "Precise Shot",
    "benefit": "You can shoot or throw ranged weapons at an opponent engaged in melee without taking the standard -4 penalty.",
    "benefitEn": "You can shoot or throw ranged weapons at an opponent engaged in melee without taking the standard -4 penalty."
  },
  "rapid_shot": {
    "id": "rapid_shot",
    "nameDe": "Rapid Shot",
    "nameEn": "Rapid Shot",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "point_blank_shot"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 13
      }
    ],
    "parent": "point_blank_shot",
    "benefitDe": "You can get one extra attack per round with a ranged weapon. All attacks take a -2 penalty.",
    "benefitRaw": "You can get one extra attack per round with a ranged weapon. All attacks take a -2 penalty.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A ranger can select this at level 2.",
    "appEffect": "One extra ranged attack on full attack; all attacks take -2 penalty",
    "source": "phb",
    "name": "Rapid Shot",
    "benefit": "You can get one extra attack per round with a ranged weapon. All attacks take a -2 penalty.",
    "benefitEn": "You can get one extra attack per round with a ranged weapon. All attacks take a -2 penalty."
  },
  "manyshot": {
    "id": "manyshot",
    "nameDe": "Manyshot",
    "nameEn": "Manyshot",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "point_blank_shot"
      },
      {
        "type": "feat",
        "id": "rapid_shot"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 17
      },
      {
        "type": "bab",
        "value": 6
      }
    ],
    "parent": "rapid_shot",
    "benefitDe": "As a standard action, you can fire two arrows at a single opponent within 30 feet. Both arrows use a single attack roll with a -4 penalty.",
    "benefitRaw": "As a standard action, you can fire two arrows at a single opponent within 30 feet. Both arrows use a single attack roll with a -4 penalty.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A ranger can select this at level 6.",
    "appEffect": "Fire multiple arrows simultaneously as a single standard action attack",
    "source": "phb",
    "name": "Manyshot",
    "benefit": "As a standard action, you can fire two arrows at a single opponent within 30 feet. Both arrows use a single attack roll with a -4 penalty.",
    "benefitEn": "As a standard action, you can fire two arrows at a single opponent within 30 feet. Both arrows use a single attack roll with a -4 penalty."
  },
  "shot_on_the_run": {
    "id": "shot_on_the_run",
    "nameDe": "Shot on the Run",
    "nameEn": "Shot on the Run",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "point_blank_shot"
      },
      {
        "type": "feat",
        "id": "dodge"
      },
      {
        "type": "feat",
        "id": "mobility"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 13
      },
      {
        "type": "bab",
        "value": 4
      }
    ],
    "parent": "precise_shot",
    "benefitDe": "You can move, make a single ranged attack, and then move again as a full-round action.",
    "benefitRaw": "You can move, make a single ranged attack, and then move again as a full-round action.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Move both before and after a ranged attack",
    "source": "phb",
    "name": "Shot on the Run",
    "benefit": "You can move, make a single ranged attack, and then move again as a full-round action.",
    "benefitEn": "You can move, make a single ranged attack, and then move again as a full-round action."
  },
  "improved_precise_shot": {
    "id": "improved_precise_shot",
    "nameDe": "Improved Precise Shot",
    "nameEn": "Improved Precise Shot",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "point_blank_shot"
      },
      {
        "type": "feat",
        "id": "precise_shot"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 19
      },
      {
        "type": "bab",
        "value": 11
      }
    ],
    "parent": "precise_shot",
    "benefitDe": "Your ranged attacks ignore anything less than total cover and total concealment.",
    "benefitRaw": "Your ranged attacks ignore anything less than total cover and total concealment.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A ranger can select this at level 11.",
    "appEffect": "Ignore less than total cover and concealment with ranged attacks",
    "source": "phb",
    "name": "Improved Precise Shot",
    "benefit": "Your ranged attacks ignore anything less than total cover and total concealment.",
    "benefitEn": "Your ranged attacks ignore anything less than total cover and total concealment."
  },
  "two_weapon_fighting": {
    "id": "two_weapon_fighting",
    "nameDe": "Two-Weapon Fighting",
    "nameEn": "Two-Weapon Fighting",
    "category": "combat",
    "prereqs": [
      {
        "type": "stat",
        "name": "dex",
        "value": 15
      }
    ],
    "benefitDe": "Your penalties for fighting with two weapons are reduced.",
    "benefitRaw": "Your penalties for fighting with two weapons are reduced.",
    "normalRaw": "Standard penalties are -6 primary / -10 off-hand.",
    "specialRaw": "Fighter bonus feat. A ranger can select this at level 2.",
    "appEffect": "Reduces Two-Weapon Fighting penalties to -2/-2 (light off-hand)",
    "source": "phb",
    "name": "Two-Weapon Fighting",
    "benefit": "Your penalties for fighting with two weapons are reduced.",
    "benefitEn": "Your penalties for fighting with two weapons are reduced."
  },
  "two_weapon_defense": {
    "id": "two_weapon_defense",
    "nameDe": "Two-Weapon Defense",
    "nameEn": "Two-Weapon Defense",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "two_weapon_fighting"
      }
    ],
    "parent": "two_weapon_fighting",
    "benefitDe": "When fighting with two weapons, you gain a +1 shield bonus to AC.",
    "benefitRaw": "When fighting with two weapons, you gain a +1 shield bonus to AC.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+1 shield bonus to AC (+2 on total defense) when fighting with two weapons",
    "source": "phb",
    "name": "Two-Weapon Defense",
    "benefit": "When fighting with two weapons, you gain a +1 shield bonus to AC.",
    "benefitEn": "When fighting with two weapons, you gain a +1 shield bonus to AC."
  },
  "improved_two_weapon_fighting": {
    "id": "improved_two_weapon_fighting",
    "nameDe": "Improved Two-Weapon Fighting",
    "nameEn": "Improved Two-Weapon Fighting",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "two_weapon_fighting"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 17
      },
      {
        "type": "bab",
        "value": 6
      }
    ],
    "parent": "two_weapon_fighting",
    "benefitDe": "You get a second off-hand attack with a -5 penalty.",
    "benefitRaw": "You get a second off-hand attack with a -5 penalty.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A ranger can select this at level 6.",
    "appEffect": "Second off-hand attack on full attack at -5 penalty",
    "source": "phb",
    "name": "Improved Two-Weapon Fighting",
    "benefit": "You get a second off-hand attack with a -5 penalty.",
    "benefitEn": "You get a second off-hand attack with a -5 penalty."
  },
  "greater_two_weapon_fighting": {
    "id": "greater_two_weapon_fighting",
    "nameDe": "Greater Two-Weapon Fighting",
    "nameEn": "Greater Two-Weapon Fighting",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_two_weapon_fighting"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 19
      },
      {
        "type": "bab",
        "value": 11
      }
    ],
    "parent": "improved_two_weapon_fighting",
    "benefitDe": "You get a third off-hand attack with a -10 penalty.",
    "benefitRaw": "You get a third off-hand attack with a -10 penalty.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A ranger can select this at level 11.",
    "appEffect": "Third off-hand attack on full attack at -10 penalty",
    "source": "phb",
    "name": "Greater Two-Weapon Fighting",
    "benefit": "You get a third off-hand attack with a -10 penalty.",
    "benefitEn": "You get a third off-hand attack with a -10 penalty."
  },
  "weapon_finesse": {
    "id": "weapon_finesse",
    "nameDe": "Weapon Finesse",
    "nameEn": "Weapon Finesse",
    "category": "combat",
    "prereqs": [
      {
        "type": "bab",
        "value": 1
      }
    ],
    "benefitDe": "With a light weapon, you may use your Dexterity modifier instead of your Strength modifier on attack rolls.",
    "benefitRaw": "With a light weapon, you may use your Dexterity modifier instead of your Strength modifier on attack rolls.",
    "normalRaw": "Strength modifier is used for melee attack rolls.",
    "specialRaw": "Fighter bonus feat. Natural weapons count as light weapons.",
    "appEffect": "Use DEX modifier instead of STR modifier on attack rolls with light weapons",
    "source": "phb",
    "name": "Weapon Finesse",
    "benefit": "With a light weapon, you may use your Dexterity modifier instead of your Strength modifier on attack rolls.",
    "benefitEn": "With a light weapon, you may use your Dexterity modifier instead of your Strength modifier on attack rolls."
  },
  "improved_unarmed_strike": {
    "id": "improved_unarmed_strike",
    "nameDe": "Improved Unarmed Strike",
    "nameEn": "Improved Unarmed Strike",
    "category": "combat",
    "prereqs": [],
    "benefitDe": "You are considered to be armed even when unarmed. Your unarmed strikes can deal lethal or nonlethal damage.",
    "benefitRaw": "You are considered to be armed even when unarmed. Your unarmed strikes can deal lethal or nonlethal damage.",
    "normalRaw": "Unarmed strikes provoke AoO and deal nonlethal damage.",
    "specialRaw": "Fighter bonus feat. Monks get this for free at level 1.",
    "appEffect": "Considered armed when making unarmed strikes; deal lethal or nonlethal damage",
    "source": "phb",
    "name": "Improved Unarmed Strike",
    "benefit": "You are considered to be armed even when unarmed. Your unarmed strikes can deal lethal or nonlethal damage.",
    "benefitEn": "You are considered to be armed even when unarmed. Your unarmed strikes can deal lethal or nonlethal damage."
  },
  "improved_grapple": {
    "id": "improved_grapple",
    "nameDe": "Improved Grapple",
    "nameEn": "Improved Grapple",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 13
      }
    ],
    "parent": "improved_unarmed_strike",
    "benefitDe": "You gain a +4 bonus on grapple checks, and you do not provoke an attack of opportunity.",
    "benefitRaw": "You gain a +4 bonus on grapple checks, and you do not provoke an attack of opportunity.",
    "normalRaw": "Grappling attempts provoke an AoO.",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 1.",
    "appEffect": "+4 bonus on grapple checks; no attack of opportunity when starting grapple",
    "source": "phb",
    "name": "Improved Grapple",
    "benefit": "You gain a +4 bonus on grapple checks, and you do not provoke an attack of opportunity.",
    "benefitEn": "You gain a +4 bonus on grapple checks, and you do not provoke an attack of opportunity."
  },
  "deflect_arrows": {
    "id": "deflect_arrows",
    "nameDe": "Deflect Arrows",
    "nameEn": "Deflect Arrows",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 13
      }
    ],
    "parent": "improved_unarmed_strike",
    "benefitDe": "You must have at least one hand free. Once per round when you would normally be hit by a ranged weapon, you may deflect it so that you take no damage.",
    "benefitRaw": "You must have at least one hand free. Once per round when you would normally be hit by a ranged weapon, you may deflect it so that you take no damage.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 1.",
    "appEffect": "Deflect one ranged attack per round when unarmed with a free hand",
    "source": "phb",
    "name": "Deflect Arrows",
    "benefit": "You must have at least one hand free. Once per round when you would normally be hit by a ranged weapon, you may deflect it so that you take no damage.",
    "benefitEn": "You must have at least one hand free. Once per round when you would normally be hit by a ranged weapon, you may deflect it so that you take no damage."
  },
  "snatch_arrows": {
    "id": "snatch_arrows",
    "nameDe": "Snatch Arrows",
    "nameEn": "Snatch Arrows",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "deflect_arrows"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 15
      }
    ],
    "parent": "deflect_arrows",
    "benefitDe": "You can catch a deflected ranged weapon and immediately throw it back as an immediate action.",
    "benefitRaw": "You can catch a deflected ranged weapon and immediately throw it back as an immediate action.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Catch ranged weapons deflected with Deflect Arrows",
    "source": "phb",
    "name": "Snatch Arrows",
    "benefit": "You can catch a deflected ranged weapon and immediately throw it back as an immediate action.",
    "benefitEn": "You can catch a deflected ranged weapon and immediately throw it back as an immediate action."
  },
  "stunning_fist": {
    "id": "stunning_fist",
    "nameDe": "Stunning Fist",
    "nameEn": "Stunning Fist",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 13
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
    "parent": "improved_unarmed_strike",
    "benefitDe": "Declare a stunning attack before rolling. If you hit, target must succeed on a Fortitude save (DC 10 + 1/2 character level + Wis mod) or be stunned for 1 round.",
    "benefitRaw": "Declare a stunning attack before rolling. If you hit, target must succeed on a Fortitude save (DC 10 + 1/2 character level + Wis mod) or be stunned for 1 round.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 1. Monks get 1 stun attempt per level per day.",
    "appEffect": "Stun an opponent with an unarmed strike (Fortitude negates, DC 10 + 1/2 level + WIS)",
    "source": "phb",
    "name": "Stunning Fist",
    "benefit": "Declare a stunning attack before rolling. If you hit, target must succeed on a Fortitude save (DC 10 + 1/2 character level + Wis mod) or be stunned for 1 round.",
    "benefitEn": "Declare a stunning attack before rolling. If you hit, target must succeed on a Fortitude save (DC 10 + 1/2 character level + Wis mod) or be stunned for 1 round."
  },
  "mounted_combat": {
    "id": "mounted_combat",
    "nameDe": "Mounted Combat",
    "nameEn": "Mounted Combat",
    "category": "combat",
    "prereqs": [
      {
        "type": "skill",
        "skill": "ride",
        "ranks": 1
      }
    ],
    "benefitDe": "Once per round when your mount is hit in combat, you may make a Ride check to negate the hit.",
    "benefitRaw": "Once per round when your mount is hit in combat, you may make a Ride check to negate the hit.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Negate hits on mount with Ride check (1/round)",
    "source": "phb",
    "name": "Mounted Combat",
    "benefit": "Once per round when your mount is hit in combat, you may make a Ride check to negate the hit.",
    "benefitEn": "Once per round when your mount is hit in combat, you may make a Ride check to negate the hit."
  },
  "mounted_archery": {
    "id": "mounted_archery",
    "nameDe": "Mounted Archery",
    "nameEn": "Mounted Archery",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "mounted_combat"
      }
    ],
    "parent": "mounted_combat",
    "benefitDe": "Penalties for ranged attacks while mounted are halved.",
    "benefitRaw": "Penalties for ranged attacks while mounted are halved.",
    "normalRaw": "Standard penalties are -4 (moving) / -8 (galloping).",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Halves penalties for ranged attacks while mounted",
    "source": "phb",
    "name": "Mounted Archery",
    "benefit": "Penalties for ranged attacks while mounted are halved.",
    "benefitEn": "Penalties for ranged attacks while mounted are halved."
  },
  "ride_by_attack": {
    "id": "ride_by_attack",
    "nameDe": "Ride-By Attack",
    "nameEn": "Ride-By Attack",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "mounted_combat"
      }
    ],
    "parent": "mounted_combat",
    "benefitDe": "When you charge on a mount, you may move and attack, and then move again in a straight line.",
    "benefitRaw": "When you charge on a mount, you may move and attack, and then move again in a straight line.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Charge on mount without provoking attack of opportunity from target",
    "source": "phb",
    "name": "Ride-By Attack",
    "benefit": "When you charge on a mount, you may move and attack, and then move again in a straight line.",
    "benefitEn": "When you charge on a mount, you may move and attack, and then move again in a straight line."
  },
  "spirited_charge": {
    "id": "spirited_charge",
    "nameDe": "Spirited Charge",
    "nameEn": "Spirited Charge",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "ride_by_attack"
      }
    ],
    "parent": "ride_by_attack",
    "benefitDe": "When mounted and making a charge, you deal double damage with a melee weapon (triple with a lance).",
    "benefitRaw": "When mounted and making a charge, you deal double damage with a melee weapon (triple with a lance).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Double damage on mounted charge (triple with lance)",
    "source": "phb",
    "name": "Spirited Charge",
    "benefit": "When mounted and making a charge, you deal double damage with a melee weapon (triple with a lance).",
    "benefitEn": "When mounted and making a charge, you deal double damage with a melee weapon (triple with a lance)."
  },
  "trample": {
    "id": "trample",
    "nameDe": "Trample",
    "nameEn": "Trample",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "mounted_combat"
      }
    ],
    "parent": "mounted_combat",
    "benefitDe": "When you overrun an opponent while mounted, the target cannot choose to avoid you.",
    "benefitRaw": "When you overrun an opponent while mounted, the target cannot choose to avoid you.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Mount tramples overrun targets (deals hoof damage)",
    "source": "phb",
    "name": "Trample",
    "benefit": "When you overrun an opponent while mounted, the target cannot choose to avoid you.",
    "benefitEn": "When you overrun an opponent while mounted, the target cannot choose to avoid you."
  },
  "improved_shield_bash": {
    "id": "improved_shield_bash",
    "nameDe": "Improved Shield Bash",
    "nameEn": "Improved Shield Bash",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "shield_prof"
      }
    ],
    "parent": "shield_prof",
    "benefitDe": "When you perform a shield bash, you may still apply the shield’s shield bonus to your AC.",
    "benefitRaw": "When you perform a shield bash, you may still apply the shield’s shield bonus to your AC.",
    "normalRaw": "You lose shield bonus to AC when bashing.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "When you perform a shield bash, you may still apply the shield’s shield bonus to your AC.",
    "source": "phb",
    "name": "Improved Shield Bash",
    "benefit": "When you perform a shield bash, you may still apply the shield’s shield bonus to your AC.",
    "benefitEn": "When you perform a shield bash, you may still apply the shield’s shield bonus to your AC."
  },
  "exotic_weapon_prof": {
    "id": "exotic_weapon_prof",
    "nameDe": "Exotic Weapon Proficiency",
    "nameEn": "Exotic Weapon Proficiency",
    "category": "combat",
    "prereqs": [
      {
        "type": "bab",
        "value": 1
      }
    ],
    "hasOption": true,
    "optionType": "weapon",
    "benefitDe": "You make attack rolls with the selected exotic weapon without penalty.",
    "benefitRaw": "You make attack rolls with the selected exotic weapon without penalty.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "You make attack rolls with the selected exotic weapon without penalty.",
    "source": "phb",
    "name": "Exotic Weapon Proficiency",
    "benefit": "You make attack rolls with the selected exotic weapon without penalty.",
    "benefitEn": "You make attack rolls with the selected exotic weapon without penalty."
  },
  "improved_critical": {
    "id": "improved_critical",
    "nameDe": "Improved Critical",
    "nameEn": "Improved Critical",
    "category": "combat",
    "prereqs": [
      {
        "type": "bab",
        "value": 8
      }
    ],
    "hasOption": true,
    "optionType": "weapon",
    "benefitDe": "Doubles the threat range of the chosen weapon. Multiple effects that increase threat range do not stack.",
    "benefitRaw": "Doubles the threat range of the chosen weapon. Multiple effects that increase threat range do not stack.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. You can gain this feat multiple times, each time for a different weapon.",
    "appEffect": "Doubles the threat range of the chosen weapon",
    "source": "phb",
    "name": "Improved Critical",
    "benefit": "Doubles the threat range of the chosen weapon. Multiple effects that increase threat range do not stack.",
    "benefitEn": "Doubles the threat range of the chosen weapon. Multiple effects that increase threat range do not stack."
  },
  "combat_reflexes": {
    "id": "combat_reflexes",
    "nameDe": "Combat Reflexes",
    "nameEn": "Combat Reflexes",
    "category": "combat",
    "prereqs": [],
    "benefitDe": "You may make a number of additional attacks of opportunity each round equal to your Dexterity bonus. You can also make attacks of opportunity while flat-footed.",
    "benefitRaw": "You may make a number of additional attacks of opportunity each round equal to your Dexterity bonus. You can also make attacks of opportunity while flat-footed.",
    "normalRaw": "You may only make one attack of opportunity per round, and cannot make attacks of opportunity while flat-footed.",
    "specialRaw": "Fighter bonus feat. A monk can select this at 2nd level.",
    "appEffect": "Additional attacks of opportunity equal to DEX modifier",
    "source": "phb",
    "name": "Combat Reflexes",
    "benefit": "You may make a number of additional attacks of opportunity each round equal to your Dexterity bonus. You can also make attacks of opportunity while flat-footed.",
    "benefitEn": "You may make a number of additional attacks of opportunity each round equal to your Dexterity bonus. You can also make attacks of opportunity while flat-footed."
  },
  "blind_fight": {
    "id": "blind_fight",
    "nameDe": "Blind-Fight",
    "nameEn": "Blind-Fight",
    "category": "combat",
    "prereqs": [],
    "benefitDe": "In melee, every time you miss because of concealment, you can reroll your miss chance once. An invisible attacker gets no bonus in melee against you.",
    "benefitRaw": "In melee, every time you miss because of concealment, you can reroll your miss chance once. An invisible attacker gets no bonus in melee against you.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Reroll miss chance for concealment; retain DEX bonus to AC against invisible foes",
    "source": "phb",
    "name": "Blind-Fight",
    "benefit": "In melee, every time you miss because of concealment, you can reroll your miss chance once. An invisible attacker gets no bonus in melee against you.",
    "benefitEn": "In melee, every time you miss because of concealment, you can reroll your miss chance once. An invisible attacker gets no bonus in melee against you."
  },
  "quick_draw": {
    "id": "quick_draw",
    "nameDe": "Quick Draw",
    "nameEn": "Quick Draw",
    "category": "combat",
    "prereqs": [
      {
        "type": "bab",
        "value": 1
      }
    ],
    "benefitDe": "You can draw a weapon as a free action instead of as a move action.",
    "benefitRaw": "You can draw a weapon as a free action instead of as a move action.",
    "normalRaw": "Without this feat, you can draw a weapon as a move action, or as a free action as part of movement with BAB +1.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Draw a weapon as a free action",
    "source": "phb",
    "name": "Quick Draw",
    "benefit": "You can draw a weapon as a free action instead of as a move action.",
    "benefitEn": "You can draw a weapon as a free action instead of as a move action."
  },
  "rapid_reload": {
    "id": "rapid_reload",
    "nameDe": "Rapid Reload",
    "nameEn": "Rapid Reload",
    "category": "combat",
    "prereqs": [],
    "hasOption": true,
    "optionType": "weapon",
    "benefitDe": "The time required for you to reload your chosen type of crossbow is reduced to a free action (for a hand or light crossbow) or a move action (for a heavy crossbow).",
    "benefitRaw": "The time required for you to reload your chosen type of crossbow is reduced to a free action (for a hand or light crossbow) or a move action (for a heavy crossbow).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "The time required for you to reload your chosen type of crossbow is reduced to a free action (for a hand or li...",
    "source": "phb",
    "name": "Rapid Reload",
    "benefit": "The time required for you to reload your chosen type of crossbow is reduced to a free action (for a hand or light crossbow) or a move action (for a heavy crossbow).",
    "benefitEn": "The time required for you to reload your chosen type of crossbow is reduced to a free action (for a hand or light crossbow) or a move action (for a heavy crossbow)."
  }
};
