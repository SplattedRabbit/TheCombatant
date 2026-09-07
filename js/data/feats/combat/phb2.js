/**
 * @module    phb2
 * @summary   Standardized D&D 3.5e RAW English feats registry.
 * @exports   COMBAT_FEATS_REGISTRY_PHB2
 */

export const COMBAT_FEATS_REGISTRY_PHB2 = {
  "acrobatic_strike": {
    "id": "acrobatic_strike",
    "nameDe": "Acrobatic Strike",
    "nameEn": "Acrobatic Strike",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Tumble 12 ranks"
      }
    ],
    "benefitDe": "If you succeed on a Tumble check to move through an enemy's threatened area or space, you gain a +6 bonus on your next single melee attack roll against that enemy.",
    "benefitRaw": "If you succeed on a Tumble check to move through an enemy's threatened area or space, you gain a +6 bonus on your next single melee attack roll against that enemy.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Acrobatic Strike as one of his fighter bonus feats.",
    "appEffect": "If you succeed on a Tumble check to move through an enemy's threatened area or space, you gain a +6 bonus on y...",
    "name": "Acrobatic Strike",
    "benefit": "If you succeed on a Tumble check to move through an enemy's threatened area or space, you gain a +6 bonus on your next single melee attack roll against that enemy.",
    "benefitEn": "If you succeed on a Tumble check to move through an enemy's threatened area or space, you gain a +6 bonus on your next single melee attack roll against that enemy."
  },
  "bounding_assault": {
    "id": "bounding_assault",
    "nameDe": "Bounding Assault",
    "nameEn": "Bounding Assault",
    "category": "combat",
    "source": "phb2",
    "parent": "spring_attack",
    "prereqs": [
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
        "value": 12
      }
    ],
    "benefitDe": "When using the Spring Attack feat, you can designate two foes and make a single melee attack against each. Your movement resolves normally between or after the attacks.",
    "benefitRaw": "When using the Spring Attack feat, you can designate two foes and make a single melee attack against each. Your movement resolves normally between or after the attacks.",
    "normalRaw": "Spring Attack allows only a single attack.",
    "specialRaw": "A fighter may select Bounding Assault as one of his fighter bonus feats.",
    "appEffect": "When using the Spring Attack feat, you can designate two foes and make a single melee attack against each",
    "name": "Bounding Assault",
    "benefit": "When using the Spring Attack feat, you can designate two foes and make a single melee attack against each. Your movement resolves normally between or after the attacks.",
    "benefitEn": "When using the Spring Attack feat, you can designate two foes and make a single melee attack against each. Your movement resolves normally between or after the attacks."
  },
  "brutal_strike": {
    "id": "brutal_strike",
    "nameDe": "Brutal Strike",
    "nameEn": "Brutal Strike",
    "category": "combat",
    "source": "phb2",
    "parent": "power_attack",
    "prereqs": [
      {
        "type": "feat",
        "id": "power_attack"
      },
      {
        "type": "stat",
        "name": "str",
        "value": 13
      },
      {
        "type": "bab",
        "value": 6
      }
    ],
    "benefitDe": "When using Power Attack with a bludgeoning weapon, you can choose to make a brutal strike. If you hit, target must make a Fortitude save (DC 10 + Power Attack damage added) or be sickened for 1 round.",
    "benefitRaw": "When using Power Attack with a bludgeoning weapon, you can choose to make a brutal strike. If you hit, target must make a Fortitude save (DC 10 + Power Attack damage added) or be sickened for 1 round.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "When using Power Attack with a bludgeoning weapon, you can choose to make a brutal strike",
    "name": "Brutal Strike",
    "benefit": "When using Power Attack with a bludgeoning weapon, you can choose to make a brutal strike. If you hit, target must make a Fortitude save (DC 10 + Power Attack damage added) or be sickened for 1 round.",
    "benefitEn": "When using Power Attack with a bludgeoning weapon, you can choose to make a brutal strike. If you hit, target must make a Fortitude save (DC 10 + Power Attack damage added) or be sickened for 1 round."
  },
  "rapid_blitz": {
    "id": "rapid_blitz",
    "nameDe": "Rapid Blitz",
    "nameEn": "Rapid Blitz",
    "category": "combat",
    "source": "phb2",
    "parent": "bounding_assault",
    "prereqs": [
      {
        "type": "feat",
        "id": "bounding_assault"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 13
      },
      {
        "type": "bab",
        "value": 18
      }
    ],
    "benefitDe": "When using the Spring Attack feat, you can designate three foes and make a single melee attack against each, moving normally between them.",
    "benefitRaw": "When using the Spring Attack feat, you can designate three foes and make a single melee attack against each, moving normally between them.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "When using the Spring Attack feat, you can designate three foes and make a single melee attack against each, m...",
    "name": "Rapid Blitz",
    "benefit": "When using the Spring Attack feat, you can designate three foes and make a single melee attack against each, moving normally between them.",
    "benefitEn": "When using the Spring Attack feat, you can designate three foes and make a single melee attack against each, moving normally between them."
  },
  "crossbow_sniper": {
    "id": "crossbow_sniper",
    "nameDe": "Crossbow Sniper",
    "nameEn": "Crossbow Sniper",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "weapon_focus"
      },
      {
        "type": "bab",
        "value": 1
      }
    ],
    "benefitDe": "Apply half your Dexterity bonus on damage rolls with selected crossbow. Ranged sneak attacks can be made out to 60 feet.",
    "benefitRaw": "Apply half your Dexterity bonus on damage rolls with selected crossbow. Ranged sneak attacks can be made out to 60 feet.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Apply half your Dexterity bonus on damage rolls with selected crossbow",
    "name": "Crossbow Sniper",
    "benefit": "Apply half your Dexterity bonus on damage rolls with selected crossbow. Ranged sneak attacks can be made out to 60 feet.",
    "benefitEn": "Apply half your Dexterity bonus on damage rolls with selected crossbow. Ranged sneak attacks can be made out to 60 feet."
  },
  "deadeye_shot": {
    "id": "deadeye_shot",
    "nameDe": "Deadeye Shot",
    "nameEn": "Deadeye Shot",
    "category": "combat",
    "source": "phb2",
    "parent": "precise_shot",
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
        "type": "bab",
        "value": 4
      }
    ],
    "benefitDe": "By readying a ranged attack against a foe adjacent to an ally, you deny that foe their Dex bonus to AC against your attack if the ally hits them.",
    "benefitRaw": "By readying a ranged attack against a foe adjacent to an ally, you deny that foe their Dex bonus to AC against your attack if the ally hits them.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "By readying a ranged attack against a foe adjacent to an ally, you deny that foe their Dex bonus to AC against...",
    "name": "Deadeye Shot",
    "benefit": "By readying a ranged attack against a foe adjacent to an ally, you deny that foe their Dex bonus to AC against your attack if the ally hits them.",
    "benefitEn": "By readying a ranged attack against a foe adjacent to an ally, you deny that foe their Dex bonus to AC against your attack if the ally hits them."
  },
  "defensive_sweep": {
    "id": "defensive_sweep",
    "nameDe": "Defensive Sweep",
    "nameEn": "Defensive Sweep",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "bab",
        "value": 15
      }
    ],
    "benefitDe": "Foes starting their turn adjacent to you provoke an attack of opportunity if they do not move during their turn.",
    "benefitRaw": "Foes starting their turn adjacent to you provoke an attack of opportunity if they do not move during their turn.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Foes starting their turn adjacent to you provoke an attack of opportunity if they do not move during their turn.",
    "name": "Defensive Sweep",
    "benefit": "Foes starting their turn adjacent to you provoke an attack of opportunity if they do not move during their turn.",
    "benefitEn": "Foes starting their turn adjacent to you provoke an attack of opportunity if they do not move during their turn."
  },
  "melee_weapon_mastery": {
    "id": "melee_weapon_mastery",
    "nameDe": "Melee Weapon Mastery",
    "nameEn": "Melee Weapon Mastery",
    "category": "combat",
    "source": "phb2",
    "parent": "weapon_specialization",
    "prereqs": [
      {
        "type": "feat",
        "id": "weapon_focus"
      },
      {
        "type": "feat",
        "id": "weapon_specialization"
      },
      {
        "type": "bab",
        "value": 8
      }
    ],
    "benefitDe": "Select bludgeoning, piercing, or slashing. You gain +1 on attacks and +2 on damage with all melee weapons of that type.",
    "benefitRaw": "Select bludgeoning, piercing, or slashing. You gain +1 on attacks and +2 on damage with all melee weapons of that type.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Select bludgeoning, piercing, or slashing",
    "name": "Melee Weapon Mastery",
    "benefit": "Select bludgeoning, piercing, or slashing. You gain +1 on attacks and +2 on damage with all melee weapons of that type.",
    "benefitEn": "Select bludgeoning, piercing, or slashing. You gain +1 on attacks and +2 on damage with all melee weapons of that type."
  },
  "robilars_gambit": {
    "id": "robilars_gambit",
    "nameDe": "Robilar's Gambit",
    "nameEn": "Robilar's Gambit",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_reflexes"
      },
      {
        "type": "bab",
        "value": 12
      }
    ],
    "benefitDe": "Foes gain +4 bonus on attack and damage rolls against you, but each attack they resolve against you provokes an attack of opportunity from you.",
    "benefitRaw": "Foes gain +4 bonus on attack and damage rolls against you, but each attack they resolve against you provokes an attack of opportunity from you.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Foes gain +4 bonus on attack and damage rolls against you, but each attack they resolve against you provokes a...",
    "name": "Robilar's Gambit",
    "benefit": "Foes gain +4 bonus on attack and damage rolls against you, but each attack they resolve against you provokes an attack of opportunity from you.",
    "benefitEn": "Foes gain +4 bonus on attack and damage rolls against you, but each attack they resolve against you provokes an attack of opportunity from you."
  },
  "shield_specialization": {
    "id": "shield_specialization",
    "nameDe": "Shield Specialization",
    "nameEn": "Shield Specialization",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "shield_prof"
      }
    ],
    "benefitDe": "Increase the shield bonus to AC granted by your chosen type of shield by 1.",
    "benefitRaw": "Increase the shield bonus to AC granted by your chosen type of shield by 1.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Increase the shield bonus to AC granted by your chosen type of shield by 1.",
    "name": "Shield Specialization",
    "benefit": "Increase the shield bonus to AC granted by your chosen type of shield by 1.",
    "benefitEn": "Increase the shield bonus to AC granted by your chosen type of shield by 1."
  },
  "shield_ward": {
    "id": "shield_ward",
    "nameDe": "Shield Ward",
    "nameEn": "Shield Ward",
    "category": "combat",
    "source": "phb2",
    "parent": "shield_specialization",
    "prereqs": [
      {
        "type": "feat",
        "id": "shield_specialization"
      }
    ],
    "benefitDe": "Apply shield bonus to touch AC and to resist bull rush, disarm, grapple, overrun, and trip checks.",
    "benefitRaw": "Apply shield bonus to touch AC and to resist bull rush, disarm, grapple, overrun, and trip checks.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Apply shield bonus to touch AC and to resist bull rush, disarm, grapple, overrun, and trip checks.",
    "name": "Shield Ward",
    "benefit": "Apply shield bonus to touch AC and to resist bull rush, disarm, grapple, overrun, and trip checks.",
    "benefitEn": "Apply shield bonus to touch AC and to resist bull rush, disarm, grapple, overrun, and trip checks."
  },
  "two_weapon_pounce": {
    "id": "two_weapon_pounce",
    "nameDe": "Two-Weapon Pounce",
    "nameEn": "Two-Weapon Pounce",
    "category": "combat",
    "source": "phb2",
    "parent": "two_weapon_fighting",
    "prereqs": [
      {
        "type": "feat",
        "id": "two_weapon_fighting"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 15
      },
      {
        "type": "bab",
        "value": 6
      }
    ],
    "benefitDe": "When you make a charge, you can attack with both of your equipped weapons instead of just one.",
    "benefitRaw": "When you make a charge, you can attack with both of your equipped weapons instead of just one.",
    "normalRaw": "Charging allows only a single attack.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "When you make a charge, you can attack with both of your equipped weapons instead of just one.",
    "name": "Two-Weapon Pounce",
    "benefit": "When you make a charge, you can attack with both of your equipped weapons instead of just one.",
    "benefitEn": "When you make a charge, you can attack with both of your equipped weapons instead of just one."
  },
  "two_weapon_rend": {
    "id": "two_weapon_rend",
    "nameDe": "Two-Weapon Rend",
    "nameEn": "Two-Weapon Rend",
    "category": "combat",
    "source": "phb2",
    "parent": "improved_two_weapon_fighting",
    "prereqs": [
      {
        "type": "feat",
        "id": "two_weapon_fighting"
      },
      {
        "type": "feat",
        "id": "improved_two_weapon_fighting"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 15
      },
      {
        "type": "bab",
        "value": 11
      }
    ],
    "benefitDe": "If you hit an opponent with both primary and off-hand weapons, you deal an extra 1d6 + 1.5x Str mod damage.",
    "benefitRaw": "If you hit an opponent with both primary and off-hand weapons, you deal an extra 1d6 + 1.5x Str mod damage.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "If you hit an opponent with both primary and off-hand weapons, you deal an extra 1d6 + 1.5x Str mod damage.",
    "name": "Two-Weapon Rend",
    "benefit": "If you hit an opponent with both primary and off-hand weapons, you deal an extra 1d6 + 1.5x Str mod damage.",
    "benefitEn": "If you hit an opponent with both primary and off-hand weapons, you deal an extra 1d6 + 1.5x Str mod damage."
  },
  "vexing_flanker": {
    "id": "vexing_flanker",
    "nameDe": "Vexing Flanker",
    "nameEn": "Vexing Flanker",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_reflexes"
      }
    ],
    "benefitDe": "You gain a +4 bonus on attack rolls when flanking an opponent, rather than the standard +2.",
    "benefitRaw": "You gain a +4 bonus on attack rolls when flanking an opponent, rather than the standard +2.",
    "normalRaw": "Flanking bonus is +2.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "A +4 bonus on attack rolls when flanking an opponent, rather than the standard +2.",
    "name": "Vexing Flanker",
    "benefit": "You gain a +4 bonus on attack rolls when flanking an opponent, rather than the standard +2.",
    "benefitEn": "You gain a +4 bonus on attack rolls when flanking an opponent, rather than the standard +2."
  },
  "adaptable_flanker": {
    "id": "adaptable_flanker",
    "nameDe": "Adaptable Flanker",
    "nameEn": "Adaptable Flanker",
    "category": "combat",
    "source": "phb2",
    "parent": "vexing_flanker",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_reflexes"
      },
      {
        "type": "feat",
        "id": "vexing_flanker"
      },
      {
        "type": "bab",
        "value": 4
      }
    ],
    "benefitDe": "As a swift action, you can count as occupying any adjacent square you threaten for flanking purposes.",
    "benefitRaw": "As a swift action, you can count as occupying any adjacent square you threaten for flanking purposes.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "As a swift action, you can count as occupying any adjacent square you threaten for flanking purposes.",
    "name": "Adaptable Flanker",
    "benefit": "As a swift action, you can count as occupying any adjacent square you threaten for flanking purposes.",
    "benefitEn": "As a swift action, you can count as occupying any adjacent square you threaten for flanking purposes."
  },
  "agile_shield_fighter": {
    "id": "agile_shield_fighter",
    "nameDe": "Agile Shield Fighter",
    "nameEn": "Agile Shield Fighter",
    "category": "combat",
    "source": "phb2",
    "parent": "shield_specialization",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_shield_bash"
      },
      {
        "type": "feat",
        "id": "shield_specialization"
      }
    ],
    "benefitDe": "When making a shield bash and armed strike as part of a full attack, you take a -2 penalty on each attack.",
    "benefitRaw": "When making a shield bash and armed strike as part of a full attack, you take a -2 penalty on each attack.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "When making a shield bash and armed strike as part of a full attack, you take a -2 penalty on each attack.",
    "name": "Agile Shield Fighter",
    "benefit": "When making a shield bash and armed strike as part of a full attack, you take a -2 penalty on each attack.",
    "benefitEn": "When making a shield bash and armed strike as part of a full attack, you take a -2 penalty on each attack."
  },
  "telling_blow": {
    "id": "telling_blow",
    "nameDe": "Telling Blow",
    "nameEn": "Telling Blow",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Sneak attack or skirmish"
      }
    ],
    "benefitDe": "Whenever you score a critical hit, you add your sneak attack or skirmish damage to the damage roll.",
    "benefitRaw": "Whenever you score a critical hit, you add your sneak attack or skirmish damage to the damage roll.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Telling Blow as one of his fighter bonus feats.",
    "appEffect": "Whenever you score a critical hit, you add your sneak attack or skirmish damage to the damage roll.",
    "name": "Telling Blow",
    "benefit": "Whenever you score a critical hit, you add your sneak attack or skirmish damage to the damage roll.",
    "benefitEn": "Whenever you score a critical hit, you add your sneak attack or skirmish damage to the damage roll."
  },
  "armor_specialization": {
    "id": "armor_specialization",
    "nameDe": "Armor Specialization",
    "nameEn": "Armor Specialization",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "bab",
        "value": 12
      },
      {
        "type": "special",
        "desc": "Proficiency with selected armor type"
      }
    ],
    "hasOption": true,
    "optionType": "armor",
    "benefitDe": "You gain damage reduction 2/— when wearing the chosen type of armor (medium or heavy).",
    "benefitRaw": "You gain damage reduction 2/— when wearing the chosen type of armor (medium or heavy).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Damage reduction 2/— when wearing the chosen type of armor (medium or heavy).",
    "name": "Armor Specialization",
    "benefit": "You gain damage reduction 2/— when wearing the chosen type of armor (medium or heavy).",
    "benefitEn": "You gain damage reduction 2/— when wearing the chosen type of armor (medium or heavy)."
  },
  "weapon_supremacy": {
    "id": "weapon_supremacy",
    "nameDe": "Weapon Supremacy",
    "nameEn": "Weapon Supremacy",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "greater_weapon_focus"
      },
      {
        "type": "feat",
        "id": "greater_weapon_specialization"
      },
      {
        "type": "feat",
        "id": "melee_weapon_mastery"
      },
      {
        "type": "classLevel",
        "class": "fighter",
        "value": 18
      }
    ],
    "hasOption": true,
    "optionType": "weapon",
    "benefitDe": "With chosen weapon: +4 bonus on checks to resist disarm, can take 10 on one attack roll per round, +1 shield bonus to AC, and can wield weapon in grapple.",
    "benefitRaw": "With chosen weapon: +4 bonus on checks to resist disarm, can take 10 on one attack roll per round, +1 shield bonus to AC, and can wield weapon in grapple.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "With chosen weapon: +4 bonus on checks to resist disarm, can take 10 on one attack roll per round, +1 shield b...",
    "name": "Weapon Supremacy",
    "benefit": "With chosen weapon: +4 bonus on checks to resist disarm, can take 10 on one attack roll per round, +1 shield bonus to AC, and can wield weapon in grapple.",
    "benefitEn": "With chosen weapon: +4 bonus on checks to resist disarm, can take 10 on one attack roll per round, +1 shield bonus to AC, and can wield weapon in grapple."
  },
  "ranged_weapon_mastery": {
    "id": "ranged_weapon_mastery",
    "nameDe": "Ranged Weapon Mastery",
    "nameEn": "Ranged Weapon Mastery",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "weapon_focus"
      },
      {
        "type": "feat",
        "id": "weapon_specialization"
      },
      {
        "type": "feat",
        "id": "point_blank_shot"
      },
      {
        "type": "bab",
        "value": 8
      }
    ],
    "hasOption": true,
    "optionType": "weapon",
    "benefitDe": "+2 bonus on attack and damage rolls with ranged weapons of the chosen damage type, and range increment increases by 20 feet.",
    "benefitRaw": "+2 bonus on attack and damage rolls with ranged weapons of the chosen damage type, and range increment increases by 20 feet.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+2 bonus on attack and damage rolls with ranged weapons of the chosen damage type, and range increment increases by 20 feet.",
    "name": "Ranged Weapon Mastery",
    "benefit": "+2 bonus on attack and damage rolls with ranged weapons of the chosen damage type, and range increment increases by 20 feet.",
    "benefitEn": "+2 bonus on attack and damage rolls with ranged weapons of the chosen damage type, and range increment increases by 20 feet."
  },
  "crushing_strike": {
    "id": "crushing_strike",
    "nameDe": "Crushing Strike",
    "nameEn": "Crushing Strike",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "weapon_focus"
      },
      {
        "type": "feat",
        "id": "weapon_specialization"
      },
      {
        "type": "feat",
        "id": "melee_weapon_mastery"
      },
      {
        "type": "bab",
        "value": 14
      }
    ],
    "benefitDe": "Each time you hit with a bludgeoning weapon, you gain a cumulative +1 bonus on attack rolls against that opponent for the rest of your turn.",
    "benefitRaw": "Each time you hit with a bludgeoning weapon, you gain a cumulative +1 bonus on attack rolls against that opponent for the rest of your turn.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Each time you hit with a bludgeoning weapon, you gain a cumulative +1 bonus on attack rolls against that oppon...",
    "name": "Crushing Strike",
    "benefit": "Each time you hit with a bludgeoning weapon, you gain a cumulative +1 bonus on attack rolls against that opponent for the rest of your turn.",
    "benefitEn": "Each time you hit with a bludgeoning weapon, you gain a cumulative +1 bonus on attack rolls against that opponent for the rest of your turn."
  },
  "driving_attack": {
    "id": "driving_attack",
    "nameDe": "Driving Attack",
    "nameEn": "Driving Attack",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "weapon_focus"
      },
      {
        "type": "feat",
        "id": "weapon_specialization"
      },
      {
        "type": "feat",
        "id": "melee_weapon_mastery"
      },
      {
        "type": "bab",
        "value": 14
      }
    ],
    "benefitDe": "Full-round action: make a single attack with a piercing weapon. If it hits, you also initiate a bull rush with a bonus, knocking the foe prone if driven back 10+ feet.",
    "benefitRaw": "Full-round action: make a single attack with a piercing weapon. If it hits, you also initiate a bull rush with a bonus, knocking the foe prone if driven back 10+ feet.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Full-round action: make a single attack with a piercing weapon",
    "name": "Driving Attack",
    "benefit": "Full-round action: make a single attack with a piercing weapon. If it hits, you also initiate a bull rush with a bonus, knocking the foe prone if driven back 10+ feet.",
    "benefitEn": "Full-round action: make a single attack with a piercing weapon. If it hits, you also initiate a bull rush with a bonus, knocking the foe prone if driven back 10+ feet."
  },
  "slashing_flurry": {
    "id": "slashing_flurry",
    "nameDe": "Slashing Flurry",
    "nameEn": "Slashing Flurry",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "weapon_focus"
      },
      {
        "type": "feat",
        "id": "weapon_specialization"
      },
      {
        "type": "feat",
        "id": "melee_weapon_mastery"
      },
      {
        "type": "bab",
        "value": 14
      }
    ],
    "benefitDe": "When making a full attack with a slashing weapon, you can make one additional attack with chosen weapon at your highest base attack bonus, taking a -5 penalty on all attacks that round.",
    "benefitRaw": "When making a full attack with a slashing weapon, you can make one additional attack with chosen weapon at your highest base attack bonus, taking a -5 penalty on all attacks that round.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "When making a full attack with a slashing weapon, you can make one additional attack with chosen weapon at you...",
    "name": "Slashing Flurry",
    "benefit": "When making a full attack with a slashing weapon, you can make one additional attack with chosen weapon at your highest base attack bonus, taking a -5 penalty on all attacks that round.",
    "benefitEn": "When making a full attack with a slashing weapon, you can make one additional attack with chosen weapon at your highest base attack bonus, taking a -5 penalty on all attacks that round."
  },
  "combat_focus": {
    "id": "combat_focus",
    "nameDe": "Combat Focus",
    "nameEn": "Combat Focus",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "stat",
        "name": "wis",
        "value": 13
      }
    ],
    "benefitDe": "In combat, you gain a +2 bonus on Will saves. After your first successful attack, you gain combat focus for 10 rounds (longer with additional combat focus feats).",
    "benefitRaw": "In combat, you gain a +2 bonus on Will saves. After your first successful attack, you gain combat focus for 10 rounds (longer with additional combat focus feats).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "In combat, you gain a +2 bonus on Will saves",
    "name": "Combat Focus",
    "benefit": "In combat, you gain a +2 bonus on Will saves. After your first successful attack, you gain combat focus for 10 rounds (longer with additional combat focus feats).",
    "benefitEn": "In combat, you gain a +2 bonus on Will saves. After your first successful attack, you gain combat focus for 10 rounds (longer with additional combat focus feats)."
  },
  "combat_awareness": {
    "id": "combat_awareness",
    "nameDe": "Combat Awareness",
    "nameEn": "Combat Awareness",
    "category": "combat",
    "source": "phb2",
    "parent": "combat_focus",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_focus"
      },
      {
        "type": "stat",
        "name": "wis",
        "value": 13
      },
      {
        "type": "bab",
        "value": 12
      }
    ],
    "benefitDe": "While your combat focus is active, you know the current hit point total and status of each adjacent ally and enemy.",
    "benefitRaw": "While your combat focus is active, you know the current hit point total and status of each adjacent ally and enemy.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "While your combat focus is active, you know the current hit point total and status of each adjacent ally and enemy.",
    "name": "Combat Awareness",
    "benefit": "While your combat focus is active, you know the current hit point total and status of each adjacent ally and enemy.",
    "benefitEn": "While your combat focus is active, you know the current hit point total and status of each adjacent ally and enemy."
  },
  "combat_defense": {
    "id": "combat_defense",
    "nameDe": "Combat Defense",
    "nameEn": "Combat Defense",
    "category": "combat",
    "source": "phb2",
    "parent": "combat_focus",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_focus"
      },
      {
        "type": "feat",
        "id": "dodge"
      },
      {
        "type": "stat",
        "name": "wis",
        "value": 13
      },
      {
        "type": "bab",
        "value": 6
      }
    ],
    "benefitDe": "While your combat focus is active, you can change the target of your Dodge feat as an immediate action.",
    "benefitRaw": "While your combat focus is active, you can change the target of your Dodge feat as an immediate action.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "While your combat focus is active, you can change the target of your Dodge feat as an immediate action.",
    "name": "Combat Defense",
    "benefit": "While your combat focus is active, you can change the target of your Dodge feat as an immediate action.",
    "benefitEn": "While your combat focus is active, you can change the target of your Dodge feat as an immediate action."
  },
  "combat_stability": {
    "id": "combat_stability",
    "nameDe": "Combat Stability",
    "nameEn": "Combat Stability",
    "category": "combat",
    "source": "phb2",
    "parent": "combat_focus",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_focus"
      },
      {
        "type": "stat",
        "name": "wis",
        "value": 13
      },
      {
        "type": "bab",
        "value": 3
      }
    ],
    "benefitDe": "While your combat focus is active, you gain a +4 bonus on checks to resist bull rush, disarm, grapple, overrun, and trip attempts.",
    "benefitRaw": "While your combat focus is active, you gain a +4 bonus on checks to resist bull rush, disarm, grapple, overrun, and trip attempts.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "While your combat focus is active, you gain a +4 bonus on checks to resist bull rush, disarm, grapple, overrun, and trip attempts.",
    "name": "Combat Stability",
    "benefit": "While your combat focus is active, you gain a +4 bonus on checks to resist bull rush, disarm, grapple, overrun, and trip attempts.",
    "benefitEn": "While your combat focus is active, you gain a +4 bonus on checks to resist bull rush, disarm, grapple, overrun, and trip attempts."
  },
  "combat_strike": {
    "id": "combat_strike",
    "nameDe": "Combat Strike",
    "nameEn": "Combat Strike",
    "category": "combat",
    "source": "phb2",
    "parent": "combat_focus",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_focus"
      },
      {
        "type": "stat",
        "name": "wis",
        "value": 13
      },
      {
        "type": "bab",
        "value": 12
      }
    ],
    "benefitDe": "As a swift action, end your combat focus to gain a bonus on all attack rolls and damage rolls equal to your base attack bonus for the rest of your turn.",
    "benefitRaw": "As a swift action, end your combat focus to gain a bonus on all attack rolls and damage rolls equal to your base attack bonus for the rest of your turn.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "As a swift action, end your combat focus to gain a bonus on all attack rolls and damage rolls equal to your ba...",
    "name": "Combat Strike",
    "benefit": "As a swift action, end your combat focus to gain a bonus on all attack rolls and damage rolls equal to your base attack bonus for the rest of your turn.",
    "benefitEn": "As a swift action, end your combat focus to gain a bonus on all attack rolls and damage rolls equal to your base attack bonus for the rest of your turn."
  },
  "combat_vigor": {
    "id": "combat_vigor",
    "nameDe": "Combat Vigor",
    "nameEn": "Combat Vigor",
    "category": "combat",
    "source": "phb2",
    "parent": "combat_focus",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_focus"
      },
      {
        "type": "stat",
        "name": "wis",
        "value": 13
      },
      {
        "type": "bab",
        "value": 9
      }
    ],
    "benefitDe": "While your combat focus is active, you gain fast healing 2 (up to half your maximum hit points).",
    "benefitRaw": "While your combat focus is active, you gain fast healing 2 (up to half your maximum hit points).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "While your combat focus is active, you gain fast healing 2 (up to half your maximum hit points).",
    "name": "Combat Vigor",
    "benefit": "While your combat focus is active, you gain fast healing 2 (up to half your maximum hit points).",
    "benefitEn": "While your combat focus is active, you gain fast healing 2 (up to half your maximum hit points)."
  },
  "combat_tactician": {
    "id": "combat_tactician",
    "nameDe": "Combat Tactician",
    "nameEn": "Combat Tactician",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "dodge"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 13
      },
      {
        "type": "bab",
        "value": 12
      }
    ],
    "parent": "dodge",
    "benefitDe": "When you approach an enemy not adjacent at the start of your turn, you gain a +2 bonus on melee damage against that enemy this turn.",
    "benefitRaw": "When you approach an enemy not adjacent at the start of your turn, you gain a +2 bonus on melee damage against that enemy this turn.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "When you approach an enemy not adjacent at the start of your turn, you gain a +2 bonus on melee damage against...",
    "name": "Combat Tactician",
    "benefit": "When you approach an enemy not adjacent at the start of your turn, you gain a +2 bonus on melee damage against that enemy this turn.",
    "benefitEn": "When you approach an enemy not adjacent at the start of your turn, you gain a +2 bonus on melee damage against that enemy this turn."
  },
  "cometary_collision": {
    "id": "cometary_collision",
    "nameDe": "Cometary Collision",
    "nameEn": "Cometary Collision",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "power_attack"
      },
      {
        "type": "feat",
        "id": "improved_bull_rush"
      },
      {
        "type": "stat",
        "name": "str",
        "value": 13
      }
    ],
    "parent": "improved_bull_rush",
    "benefitDe": "Ready an action to counter-charge an incoming foe. Your charge interrupts theirs, and you deal extra damage.",
    "benefitRaw": "Ready an action to counter-charge an incoming foe. Your charge interrupts theirs, and you deal extra damage.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Ready an action to counter-charge an incoming foe",
    "name": "Cometary Collision",
    "benefit": "Ready an action to counter-charge an incoming foe. Your charge interrupts theirs, and you deal extra damage.",
    "benefitEn": "Ready an action to counter-charge an incoming foe. Your charge interrupts theirs, and you deal extra damage."
  },
  "melee_evasion": {
    "id": "melee_evasion",
    "nameDe": "Melee Evasion",
    "nameEn": "Melee Evasion",
    "category": "combat",
    "source": "phb2",
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
        "type": "stat",
        "name": "dex",
        "value": 13
      },
      {
        "type": "stat",
        "name": "int",
        "value": 13
      }
    ],
    "parent": "dodge",
    "benefitDe": "While fighting defensively or using total defense, negate the first melee attack from your dodge target if your attack roll exceeds his.",
    "benefitRaw": "While fighting defensively or using total defense, negate the first melee attack from your dodge target if your attack roll exceeds his.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "While fighting defensively or using total defense, negate the first melee attack from your dodge target if you...",
    "name": "Melee Evasion",
    "benefit": "While fighting defensively or using total defense, negate the first melee attack from your dodge target if your attack roll exceeds his.",
    "benefitEn": "While fighting defensively or using total defense, negate the first melee attack from your dodge target if your attack roll exceeds his."
  },
  "flay": {
    "id": "flay",
    "nameDe": "Flay",
    "nameEn": "Flay",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "power_attack"
      },
      {
        "type": "stat",
        "name": "str",
        "value": 13
      }
    ],
    "parent": "power_attack",
    "benefitDe": "When you hit an unarmored opponent (no armor or natural armor), you inflict 1d6 points of pain damage on your next turn.",
    "benefitRaw": "When you hit an unarmored opponent (no armor or natural armor), you inflict 1d6 points of pain damage on your next turn.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "When you hit an unarmored opponent (no armor or natural armor), you inflict 1d6 points of pain damage on your next turn.",
    "name": "Flay",
    "benefit": "When you hit an unarmored opponent (no armor or natural armor), you inflict 1d6 points of pain damage on your next turn.",
    "benefitEn": "When you hit an unarmored opponent (no armor or natural armor), you inflict 1d6 points of pain damage on your next turn."
  },
  "grenadier": {
    "id": "grenadier",
    "nameDe": "Grenadier",
    "nameEn": "Grenadier",
    "category": "combat",
    "source": "phb2",
    "prereqs": [],
    "benefitDe": "+1 on attacks and damage with splash weapons, and you can exclude one square from splash damage.",
    "benefitRaw": "+1 on attacks and damage with splash weapons, and you can exclude one square from splash damage.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+1 on attacks and damage with splash weapons, and you can exclude one square from splash damage.",
    "name": "Grenadier",
    "benefit": "+1 on attacks and damage with splash weapons, and you can exclude one square from splash damage.",
    "benefitEn": "+1 on attacks and damage with splash weapons, and you can exclude one square from splash damage."
  },
  "hindering_opportunist": {
    "id": "hindering_opportunist",
    "nameDe": "Hindering Opportunist",
    "nameEn": "Hindering Opportunist",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_reflexes"
      },
      {
        "type": "bab",
        "value": 3
      }
    ],
    "parent": "combat_reflexes",
    "benefitDe": "You can replace an attack of opportunity with an aid another action to grant an ally a bonus to AC.",
    "benefitRaw": "You can replace an attack of opportunity with an aid another action to grant an ally a bonus to AC.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Replace an attack of opportunity with an aid another action to grant an ally a bonus to AC.",
    "name": "Hindering Opportunist",
    "benefit": "You can replace an attack of opportunity with an aid another action to grant an ally a bonus to AC.",
    "benefitEn": "You can replace an attack of opportunity with an aid another action to grant an ally a bonus to AC."
  },
  "stalwart_defense": {
    "id": "stalwart_defense",
    "nameDe": "Stalwart Defense",
    "nameEn": "Stalwart Defense",
    "category": "combat",
    "source": "phb2",
    "parent": "hindering_opportunist",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_reflexes"
      },
      {
        "type": "feat",
        "id": "hindering_opportunist"
      },
      {
        "type": "bab",
        "value": 9
      }
    ],
    "benefitDe": "Foes provoke an aid another action from you when they attack adjacent allies.",
    "benefitRaw": "Foes provoke an aid another action from you when they attack adjacent allies.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Foes provoke an aid another action from you when they attack adjacent allies.",
    "name": "Stalwart Defense",
    "benefit": "Foes provoke an aid another action from you when they attack adjacent allies.",
    "benefitEn": "Foes provoke an aid another action from you when they attack adjacent allies."
  },
  "intimidating_strike": {
    "id": "intimidating_strike",
    "nameDe": "Intimidating Strike",
    "nameEn": "Intimidating Strike",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "intimidate",
        "ranks": 4
      }
    ],
    "benefitDe": "Standard action: make a melee attack with a penalty and make a free Intimidate check to shake the opponent for the rest of the encounter.",
    "benefitRaw": "Standard action: make a melee attack with a penalty and make a free Intimidate check to shake the opponent for the rest of the encounter.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Standard action: make a melee attack with a penalty and make a free Intimidate check to shake the opponent for...",
    "name": "Intimidating Strike",
    "benefit": "Standard action: make a melee attack with a penalty and make a free Intimidate check to shake the opponent for the rest of the encounter.",
    "benefitEn": "Standard action: make a melee attack with a penalty and make a free Intimidate check to shake the opponent for the rest of the encounter."
  },
  "lunging_strike": {
    "id": "lunging_strike",
    "nameDe": "Lunging Strike",
    "nameEn": "Lunging Strike",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "bab",
        "value": 6
      }
    ],
    "benefitDe": "Full-round action: make a single melee attack with your reach extended by 5 feet.",
    "benefitRaw": "Full-round action: make a single melee attack with your reach extended by 5 feet.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Full-round action: make a single melee attack with your reach extended by 5 feet.",
    "name": "Lunging Strike",
    "benefit": "Full-round action: make a single melee attack with your reach extended by 5 feet.",
    "benefitEn": "Full-round action: make a single melee attack with your reach extended by 5 feet."
  },
  "overwhelming_assault": {
    "id": "overwhelming_assault",
    "nameDe": "Overwhelming Assault",
    "nameEn": "Overwhelming Assault",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "bab",
        "value": 15
      }
    ],
    "benefitDe": "Gain a +4 bonus on melee damage rolls against an adjacent opponent who did not attack you on his last turn.",
    "benefitRaw": "Gain a +4 bonus on melee damage rolls against an adjacent opponent who did not attack you on his last turn.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Gain a +4 bonus on melee damage rolls against an adjacent opponent who did not attack you on his last turn.",
    "name": "Overwhelming Assault",
    "benefit": "Gain a +4 bonus on melee damage rolls against an adjacent opponent who did not attack you on his last turn.",
    "benefitEn": "Gain a +4 bonus on melee damage rolls against an adjacent opponent who did not attack you on his last turn."
  },
  "penetrating_shot": {
    "id": "penetrating_shot",
    "nameDe": "Penetrating Shot",
    "nameEn": "Penetrating Shot",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "point_blank_shot"
      },
      {
        "type": "stat",
        "name": "str",
        "value": 15
      },
      {
        "type": "bab",
        "value": 10
      }
    ],
    "parent": "point_blank_shot",
    "benefitDe": "Standard action: make a single ranged attack that targets all creatures in a 60-foot line.",
    "benefitRaw": "Standard action: make a single ranged attack that targets all creatures in a 60-foot line.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Standard action: make a single ranged attack that targets all creatures in a 60-foot line.",
    "name": "Penetrating Shot",
    "benefit": "Standard action: make a single ranged attack that targets all creatures in a 60-foot line.",
    "benefitEn": "Standard action: make a single ranged attack that targets all creatures in a 60-foot line."
  },
  "shield_sling": {
    "id": "shield_sling",
    "nameDe": "Shield Sling",
    "nameEn": "Shield Sling",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "shield_specialization"
      },
      {
        "type": "bab",
        "value": 9
      }
    ],
    "parent": "shield_specialization",
    "benefitDe": "Throw your shield as a ranged attack (range increment 20 ft.), with a free trip attempt on a hit.",
    "benefitRaw": "Throw your shield as a ranged attack (range increment 20 ft.), with a free trip attempt on a hit.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Throw your shield as a ranged attack (range increment 20 ft.), with a free trip attempt on a hit.",
    "name": "Shield Sling",
    "benefit": "Throw your shield as a ranged attack (range increment 20 ft.), with a free trip attempt on a hit.",
    "benefitEn": "Throw your shield as a ranged attack (range increment 20 ft.), with a free trip attempt on a hit."
  },
  "short_haft": {
    "id": "short_haft",
    "nameDe": "Short Haft",
    "nameEn": "Short Haft",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "weapon_focus"
      },
      {
        "type": "bab",
        "value": 3
      }
    ],
    "parent": "weapon_focus",
    "benefitDe": "As a swift action, adjust your grip on a reach weapon to strike adjacent foes instead of distant ones.",
    "benefitRaw": "As a swift action, adjust your grip on a reach weapon to strike adjacent foes instead of distant ones.",
    "normalRaw": "Reach weapons cannot attack adjacent creatures.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "As a swift action, adjust your grip on a reach weapon to strike adjacent foes instead of distant ones.",
    "name": "Short Haft",
    "benefit": "As a swift action, adjust your grip on a reach weapon to strike adjacent foes instead of distant ones.",
    "benefitEn": "As a swift action, adjust your grip on a reach weapon to strike adjacent foes instead of distant ones."
  },
  "spectral_skirmisher": {
    "id": "spectral_skirmisher",
    "nameDe": "Spectral Skirmisher",
    "nameEn": "Spectral Skirmisher",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_reflexes"
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 13
      },
      {
        "type": "bab",
        "value": 6
      }
    ],
    "parent": "combat_reflexes",
    "benefitDe": "While invisible, all opponents who attack you in melee provoke an attack of opportunity from you.",
    "benefitRaw": "While invisible, all opponents who attack you in melee provoke an attack of opportunity from you.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "While invisible, all opponents who attack you in melee provoke an attack of opportunity from you.",
    "name": "Spectral Skirmisher",
    "benefit": "While invisible, all opponents who attack you in melee provoke an attack of opportunity from you.",
    "benefitEn": "While invisible, all opponents who attack you in melee provoke an attack of opportunity from you."
  },
  "tumbling_feint": {
    "id": "tumbling_feint",
    "nameDe": "Tumbling Feint",
    "nameEn": "Tumbling Feint",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_expertise"
      },
      {
        "type": "skill",
        "skill": "tumble",
        "ranks": 9
      }
    ],
    "parent": "combat_expertise",
    "benefitDe": "Tumbling through an opponent's threatened area grants you a +5 bonus on a Bluff check to feint him.",
    "benefitRaw": "Tumbling through an opponent's threatened area grants you a +5 bonus on a Bluff check to feint him.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Tumbling through an opponent's threatened area grants you a +5 bonus on a Bluff check to feint him.",
    "name": "Tumbling Feint",
    "benefit": "Tumbling through an opponent's threatened area grants you a +5 bonus on a Bluff check to feint him.",
    "benefitEn": "Tumbling through an opponent's threatened area grants you a +5 bonus on a Bluff check to feint him."
  },
  "versatile_unarmed_strike": {
    "id": "versatile_unarmed_strike",
    "nameDe": "Versatile Unarmed Strike",
    "nameEn": "Versatile Unarmed Strike",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      }
    ],
    "parent": "improved_unarmed_strike",
    "benefitDe": "As a swift action, choose whether your unarmed strikes deal bludgeoning, piercing, or slashing damage.",
    "benefitRaw": "As a swift action, choose whether your unarmed strikes deal bludgeoning, piercing, or slashing damage.",
    "normalRaw": "Unarmed strikes deal only bludgeoning damage.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "As a swift action, choose whether your unarmed strikes deal bludgeoning, piercing, or slashing damage.",
    "name": "Versatile Unarmed Strike",
    "benefit": "As a swift action, choose whether your unarmed strikes deal bludgeoning, piercing, or slashing damage.",
    "benefitEn": "As a swift action, choose whether your unarmed strikes deal bludgeoning, piercing, or slashing damage."
  },
  "water_splitting_stone": {
    "id": "water_splitting_stone",
    "nameDe": "Water Splitting Stone",
    "nameEn": "Water Splitting Stone",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      },
      {
        "type": "stat",
        "name": "wis",
        "value": 13
      },
      {
        "type": "bab",
        "value": 9
      }
    ],
    "parent": "improved_unarmed_strike",
    "benefitDe": "Gain a +4 bonus on melee damage rolls with unarmed strikes against opponents with damage reduction.",
    "benefitRaw": "Gain a +4 bonus on melee damage rolls with unarmed strikes against opponents with damage reduction.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Gain a +4 bonus on melee damage rolls with unarmed strikes against opponents with damage reduction.",
    "name": "Water Splitting Stone",
    "benefit": "Gain a +4 bonus on melee damage rolls with unarmed strikes against opponents with damage reduction.",
    "benefitEn": "Gain a +4 bonus on melee damage rolls with unarmed strikes against opponents with damage reduction."
  },
  "blood_spiked_charger": {
    "id": "blood_spiked_charger",
    "nameDe": "Blood-Spiked Charger",
    "nameEn": "Blood-Spiked Charger",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "bashing_charge"
      },
      {
        "type": "bab",
        "value": 6
      },
      {
        "type": "special",
        "desc": "Proficiency with armor spikes and spiked shield"
      }
    ],
    "benefitDe": "Tactical feat: Spiked Avalanche, Spike Slam, and Spiked Charge options with spiked armor and shield.",
    "benefitRaw": "Tactical feat: Spiked Avalanche, Spike Slam, and Spiked Charge options with spiked armor and shield.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Tactical feat: Spiked Avalanche, Spike Slam, and Spiked Charge options with spiked armor and shield.",
    "name": "Blood-Spiked Charger",
    "benefit": "Tactical feat: Spiked Avalanche, Spike Slam, and Spiked Charge options with spiked armor and shield.",
    "benefitEn": "Tactical feat: Spiked Avalanche, Spike Slam, and Spiked Charge options with spiked armor and shield."
  },
  "combat_cloak_expert": {
    "id": "combat_cloak_expert",
    "nameDe": "Combat Cloak Expert",
    "nameEn": "Combat Cloak Expert",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_reflexes"
      },
      {
        "type": "bab",
        "value": 6
      }
    ],
    "parent": "combat_reflexes",
    "benefitDe": "Tactical feat: Cloaked Strike, Flick of the Cloak, and Defense of the Cloak options using a cloak in combat.",
    "benefitRaw": "Tactical feat: Cloaked Strike, Flick of the Cloak, and Defense of the Cloak options using a cloak in combat.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Tactical feat: Cloaked Strike, Flick of the Cloak, and Defense of the Cloak options using a cloak in combat.",
    "name": "Combat Cloak Expert",
    "benefit": "Tactical feat: Cloaked Strike, Flick of the Cloak, and Defense of the Cloak options using a cloak in combat.",
    "benefitEn": "Tactical feat: Cloaked Strike, Flick of the Cloak, and Defense of the Cloak options using a cloak in combat."
  },
  "combat_panache": {
    "id": "combat_panache",
    "nameDe": "Combat Panache",
    "nameEn": "Combat Panache",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "stat",
        "name": "cha",
        "value": 13
      },
      {
        "type": "skill",
        "skill": "bluff",
        "ranks": 8
      }
    ],
    "benefitDe": "Tactical feat: Sneak Smash, Play the Fool, and Fortuitous Tumble tactical options in combat.",
    "benefitRaw": "Tactical feat: Sneak Smash, Play the Fool, and Fortuitous Tumble tactical options in combat.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Tactical feat: Sneak Smash, Play the Fool, and Fortuitous Tumble tactical options in combat.",
    "name": "Combat Panache",
    "benefit": "Tactical feat: Sneak Smash, Play the Fool, and Fortuitous Tumble tactical options in combat.",
    "benefitEn": "Tactical feat: Sneak Smash, Play the Fool, and Fortuitous Tumble tactical options in combat."
  },
  "einhander": {
    "id": "einhander",
    "nameDe": "Einhander",
    "nameEn": "Einhander",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "dodge"
      },
      {
        "type": "skill",
        "skill": "tumble",
        "ranks": 6
      },
      {
        "type": "stat",
        "name": "dex",
        "value": 13
      },
      {
        "type": "bab",
        "value": 6
      }
    ],
    "parent": "dodge",
    "benefitDe": "Tactical feat: Narrow Profile (+2 AC), Off-Hand Balance, and Lunging Thrust when fighting with a single one-handed weapon and empty off-hand.",
    "benefitRaw": "Tactical feat: Narrow Profile (+2 AC), Off-Hand Balance, and Lunging Thrust when fighting with a single one-handed weapon and empty off-hand.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Tactical feat: Narrow Profile (+2 AC), Off-Hand Balance, and Lunging Thrust when fighting with a single one-ha...",
    "name": "Einhander",
    "benefit": "Tactical feat: Narrow Profile (+2 AC), Off-Hand Balance, and Lunging Thrust when fighting with a single one-handed weapon and empty off-hand.",
    "benefitEn": "Tactical feat: Narrow Profile (+2 AC), Off-Hand Balance, and Lunging Thrust when fighting with a single one-handed weapon and empty off-hand."
  },
  "shadow_striker": {
    "id": "shadow_striker",
    "nameDe": "Shadow Striker",
    "nameEn": "Shadow Striker",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "stat",
        "name": "wis",
        "value": 13
      },
      {
        "type": "special",
        "desc": "Sneak attack"
      }
    ],
    "benefitDe": "Tactical feat: tactical options in dim light and shadowy areas.",
    "benefitRaw": "Tactical feat: tactical options in dim light and shadowy areas.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Tactical feat: tactical options in dim light and shadowy areas.",
    "name": "Shadow Striker",
    "benefit": "Tactical feat: tactical options in dim light and shadowy areas.",
    "benefitEn": "Tactical feat: tactical options in dim light and shadowy areas."
  }
};
