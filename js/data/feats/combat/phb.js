/**
 * @module    feats-combat-phb
 * @summary   Statische Datenbank für D&D 3.5e Kampftalente aus dem Player's Handbook (PHB).
 * @exports   COMBAT_FEATS_REGISTRY_PHB
 */

export const COMBAT_FEATS_REGISTRY_PHB = {
  "improved_initiative": {
    "id": "improved_initiative",
    "nameDe": "Verbesserte Initiative",
    "nameEn": "Improved Initiative",
    "category": "combat",
    "prereqs": [],
    "benefitDe": "+4 Bonus auf Initiative-Würfe.",
    "benefitRaw": "You get a +4 bonus on initiative checks.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Improved Initiative as one of his fighter bonus feats.",
    "appEffect": "+4 Bonus auf Initiative",
    "source": "phb"
  },
  "weapon_focus": {
    "id": "weapon_focus",
    "nameDe": "Waffenfokus",
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
    "benefitDe": "+1 Bonus auf Angriffswürfe mit der gewählten Waffenart.",
    "benefitRaw": "You gain a +1 bonus on all attack rolls you make using the selected weapon.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Weapon Focus as one of his fighter bonus feats. You can gain this feat multiple times, choosing a different weapon each time.",
    "appEffect": "+1 Angriffswurf mit der gewählten Waffe",
    "source": "phb"
  },
  "weapon_specialization": {
    "id": "weapon_specialization",
    "nameDe": "Waffenspezialisierung",
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
    "benefitDe": "+2 Bonus auf Schadenswürfe mit der gewählten Waffenart.",
    "benefitRaw": "You gain a +2 bonus on all damage rolls you make using the selected weapon.",
    "normalRaw": "",
    "specialRaw": "Only a fighter of 4th level or higher may select Weapon Specialization as a bonus feat.",
    "appEffect": "+2 Schadenswurf mit der gewählten Waffe",
    "source": "phb"
  },
  "greater_weapon_focus": {
    "id": "greater_weapon_focus",
    "nameDe": "Großer Waffenfokus",
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
    "benefitDe": "Zusätzlicher +1 Bonus auf Angriffswürfe (+2 Gesamt) mit der gewählten Waffe.",
    "benefitRaw": "You gain a +1 bonus on all attack rolls you make using the selected weapon.",
    "normalRaw": "",
    "specialRaw": "Only an 8th-level fighter may select this feat.",
    "appEffect": "Zusätzlich +1 Angriffswurf mit der gewählten Waffe",
    "source": "phb"
  },
  "greater_weapon_specialization": {
    "id": "greater_weapon_specialization",
    "nameDe": "Große Waffenspezialisierung",
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
    "benefitDe": "Zusätzlicher +2 Bonus auf Schadenswürfe (+4 Gesamt) mit der gewählten Waffe.",
    "benefitRaw": "You gain a +2 bonus on all damage rolls you make using the selected weapon.",
    "normalRaw": "",
    "specialRaw": "Only a 12th-level fighter may select this feat.",
    "appEffect": "Zusätzlich +2 Schadenswurf mit der gewählten Waffe",
    "source": "phb"
  },
  "combat_expertise": {
    "id": "combat_expertise",
    "nameDe": "Kampfexpertise",
    "nameEn": "Combat Expertise",
    "category": "combat",
    "prereqs": [
      {
        "type": "stat",
        "name": "int",
        "value": 13
      }
    ],
    "benefitDe": "Tausche bis zu -5 Angriffsbonus gegen +5 Ausweich-RK.",
    "benefitRaw": "You can subtract up to 5 from your attack roll and add the same number as a dodge bonus to your Armor Class.",
    "normalRaw": "Defensive fighting options are limited to -4/+2.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Schaltet Kampfgetümmel-Optionen frei",
    "source": "phb"
  },
  "improved_disarm": {
    "id": "improved_disarm",
    "nameDe": "Verbessertes Entwaffnen",
    "nameEn": "Improved Disarm",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_expertise"
      }
    ],
    "parent": "combat_expertise",
    "benefitDe": "+4 auf Entwaffnungsversuche; provoziert keinen Gelegenheitsangriff.",
    "benefitRaw": "You gain a +4 bonus on your attempt to disarm an opponent, and you do not provoke an attack of opportunity.",
    "normalRaw": "Disarming provokes an attack of opportunity.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+4 auf Entwaffnungswürfe; kein AoO",
    "source": "phb"
  },
  "improved_feint": {
    "id": "improved_feint",
    "nameDe": "Verbessertes Fintieren",
    "nameEn": "Improved Feint",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_expertise"
      }
    ],
    "parent": "combat_expertise",
    "benefitDe": "Fintieren als Bewegungsaktion statt Standardaktion.",
    "benefitRaw": "You can make a Bluff check to feint in combat as a move action.",
    "normalRaw": "Feinting in combat is a standard action.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Fintieren im Kampf als Bewegungsaktion",
    "source": "phb"
  },
  "improved_trip": {
    "id": "improved_trip",
    "nameDe": "Verbessertes ZU-Boden-Werfen",
    "nameEn": "Improved Trip",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_expertise"
      }
    ],
    "parent": "combat_expertise",
    "benefitDe": "+4 auf Trip-Versuche; gewährt sofortigen Folgeangriff bei Erfolg.",
    "benefitRaw": "You gain a +4 bonus on your ability checks to trip an opponent. If you trip an opponent, you immediately get a melee attack against that opponent.",
    "normalRaw": "Tripping provokes an attack of opportunity.",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 6 without prerequisites.",
    "appEffect": "+4 auf Trip-Prüfung; freier Folgeangriff bei Erfolg",
    "source": "phb"
  },
  "whirlwind_attack": {
    "id": "whirlwind_attack",
    "nameDe": "Wirbelwindangriff",
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
    "benefitDe": "Ein Nahkampfangriff gegen jeden Gegner in Reichweite als volle Aktion.",
    "benefitRaw": "When you use the full attack action, you can give up your regular attacks and instead make one melee attack at your full base attack bonus against each opponent within reach.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Wirbelwind-Rundumschlag (Volle Aktion)",
    "source": "phb"
  },
  "dodge": {
    "id": "dodge",
    "nameDe": "Ausweichen",
    "nameEn": "Dodge",
    "category": "combat",
    "prereqs": [
      {
        "type": "stat",
        "name": "dex",
        "value": 13
      }
    ],
    "benefitDe": "+1 Ausweich-RK gegen einen ausgewählten Gegner.",
    "benefitRaw": "During your action, you designate an opponent and receive a +1 dodge bonus to AC against attacks from that opponent.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 1.",
    "appEffect": "+1 Ausweich-RK gegen benannten Gegner",
    "source": "phb"
  },
  "mobility": {
    "id": "mobility",
    "nameDe": "Mobilität",
    "nameEn": "Mobility",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "dodge"
      }
    ],
    "parent": "dodge",
    "benefitDe": "+4 Ausweich-RK gegen Gelegenheitsangriffe durch Bewegung.",
    "benefitRaw": "You get a +4 dodge bonus to Armor Class against attacks of opportunity caused by you moving out of or within a threatened area.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 2.",
    "appEffect": "+4 RK gegen AoO durch Bewegung",
    "source": "phb"
  },
  "spring_attack": {
    "id": "spring_attack",
    "nameDe": "Ausfallschritt (Spring Attack)",
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
    "benefitDe": "Bewegen vor und nach dem Nahkampfangriff ohne AoO durch das Ziel.",
    "benefitRaw": "You can move, make a single melee attack, and then move again, without provoking an attack of opportunity from the defender.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Angriff in der Bewegung ohne AoO vom Ziel",
    "source": "phb"
  },
  "power_attack": {
    "id": "power_attack",
    "nameDe": "Heftiger Angriff",
    "nameEn": "Power Attack",
    "category": "combat",
    "prereqs": [
      {
        "type": "stat",
        "name": "str",
        "value": 13
      }
    ],
    "benefitDe": "Ziehe bis zu BAB vom Angriff ab für +Schadensbonus (1:1 einhändig, 1:2 zweihändig).",
    "benefitRaw": "On your action, before making attack rolls, you may choose to subtract a number from all melee attack rolls and add that same number to all melee damage rolls.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Schaltet Power-Attack-Regler frei",
    "source": "phb"
  },
  "cleave": {
    "id": "cleave",
    "nameDe": "Rundumschlag (Cleave)",
    "nameEn": "Cleave",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "power_attack"
      }
    ],
    "parent": "power_attack",
    "benefitDe": "Sofortiger Zusatzangriff bei Ausschalten eines Gegners (1-mal pro Runde).",
    "benefitRaw": "If you deal a creature enough damage to make it drop, you get an immediate extra melee attack against another creature within reach.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Zusatzangriff bei besiegtem Gegner (1/Runde)",
    "source": "phb"
  },
  "great_cleave": {
    "id": "great_cleave",
    "nameDe": "Großer Rundumschlag",
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
    "benefitDe": "Keine Rundenbeschränkung für Rundumschläge.",
    "benefitRaw": "This feat works like Cleave, except that there is no limit to the number of times you can use it per round.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Beliebig viele Rundumschläge pro Runde",
    "source": "phb"
  },
  "improved_bull_rush": {
    "id": "improved_bull_rush",
    "nameDe": "Verbessertes Anstürmen",
    "nameEn": "Improved Bull Rush",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "power_attack"
      }
    ],
    "parent": "power_attack",
    "benefitDe": "+4 auf Ansturmwürfe; provoziert keinen Gelegenheitsangriff.",
    "benefitRaw": "You gain a +4 bonus on your Strength checks to bull rush an opponent, and you do not provoke an attack of opportunity.",
    "normalRaw": "Bull rushing provokes an AoO.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+4 auf Ansturmwürfe; kein AoO",
    "source": "phb"
  },
  "improved_overrun": {
    "id": "improved_overrun",
    "nameDe": "Verbessertes Überrennen",
    "nameEn": "Improved Overrun",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "power_attack"
      }
    ],
    "parent": "power_attack",
    "benefitDe": "+4 auf Überrennprüfungen; Gegner kann nicht ausweichen.",
    "benefitRaw": "When you overrun, the target may not choose to avoid you. You also gain a +4 bonus on Strength checks to knock down the target.",
    "normalRaw": "Opponent can choose to avoid you.",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 1.",
    "appEffect": "+4 auf Überrennprüfungen; kein Ausweichen",
    "source": "phb"
  },
  "improved_sunder": {
    "id": "improved_sunder",
    "nameDe": "Verbessertes Waffenschlagen",
    "nameEn": "Improved Sunder",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "power_attack"
      }
    ],
    "parent": "power_attack",
    "benefitDe": "+4 auf Gegenstände-Zerschlagen-Würfe; kein Gelegenheitsangriff.",
    "benefitRaw": "You gain a +4 bonus on attack rolls to strike an opponent’s weapon or shield, and you do not provoke an attack of opportunity.",
    "normalRaw": "Sunder attempts provoke an AoO.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+4 auf Zerschlagen-Angriffe; kein AoO",
    "source": "phb"
  },
  "point_blank_shot": {
    "id": "point_blank_shot",
    "nameDe": "Nahkampf (Point-Blank Shot)",
    "nameEn": "Point-Blank Shot",
    "category": "combat",
    "prereqs": [],
    "benefitDe": "+1 Angriff und Schaden auf Fernkampfangriffe innerhalb von 30 Fuß (9m).",
    "benefitRaw": "You get a +1 bonus on attack and damage rolls with ranged weapons at ranges up to 30 feet.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+1 Fernkampf-Angriff/Schaden bis 30 Fuß",
    "source": "phb"
  },
  "far_shot": {
    "id": "far_shot",
    "nameDe": "Weitschuss",
    "nameEn": "Far Shot",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "point_blank_shot"
      }
    ],
    "parent": "point_blank_shot",
    "benefitDe": "Erhöht die Grundreichweite um 50% (Fernkampf) oder 100% (Wurfwaffen).",
    "benefitRaw": "When you use a ranged weapon, its range increment increases by 50% (or 100% for thrown weapons).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+50% / +100% Reichweitensteigerung",
    "source": "phb"
  },
  "precise_shot": {
    "id": "precise_shot",
    "nameDe": "Präzisionsschuss",
    "nameEn": "Precise Shot",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "point_blank_shot"
      }
    ],
    "parent": "point_blank_shot",
    "benefitDe": "Kein Malus von -4 für Schüsse in den Nahkampf.",
    "benefitRaw": "You can shoot or throw ranged weapons at an opponent engaged in melee without taking the standard -4 penalty.",
    "normalRaw": "Shooting into melee incurs a -4 penalty.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Kein -4 Malus bei Schuss in den Nahkampf",
    "source": "phb"
  },
  "rapid_shot": {
    "id": "rapid_shot",
    "nameDe": "Schnelles Schießen",
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
    "benefitDe": "Zusätzlicher Fernkampfangriff pro Runde, alle Angriffe erleiden -2 Malus.",
    "benefitRaw": "You can get one extra attack per round with a ranged weapon. All attacks take a -2 penalty.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A ranger can select this at level 2.",
    "appEffect": "Zusätzlicher Angriff im Fernkampf; alle Angriffe -2",
    "source": "phb"
  },
  "manyshot": {
    "id": "manyshot",
    "nameDe": "Mehrfachschuss",
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
    "benefitDe": "Schieße zwei Pfeile gleichzeitig als Standardaktion (kombinierter Angriffswurf).",
    "benefitRaw": "As a standard action, you can fire two arrows at a single opponent within 30 feet. Both arrows use a single attack roll with a -4 penalty.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A ranger can select this at level 6.",
    "appEffect": "Zwei Pfeile gleichzeitig abfeuern (Standardaktion, -4)",
    "source": "phb"
  },
  "shot_on_the_run": {
    "id": "shot_on_the_run",
    "nameDe": "Schuss aus der Bewegung",
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
    "benefitDe": "Bewegung vor und nach dem Fernkampfangriff als volle Aktion.",
    "benefitRaw": "You can move, make a single ranged attack, and then move again as a full-round action.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Fernkampfangriff während der Bewegung",
    "source": "phb"
  },
  "improved_precise_shot": {
    "id": "improved_precise_shot",
    "nameDe": "Verbesserter Präzisionsschuss",
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
    "benefitDe": "Ignoriere teilweise Deckung und Tarnung bei Fernkampfangriffen.",
    "benefitRaw": "Your ranged attacks ignore anything less than total cover and total concealment.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A ranger can select this at level 11.",
    "appEffect": "Ignoriere Teil-Deckung / Teil-Tarnung im Fernkampf",
    "source": "phb"
  },
  "two_weapon_fighting": {
    "id": "two_weapon_fighting",
    "nameDe": "Zwei-Waffen-Kampf",
    "nameEn": "Two-Weapon Fighting",
    "category": "combat",
    "prereqs": [
      {
        "type": "stat",
        "name": "dex",
        "value": 15
      }
    ],
    "benefitDe": "Verringert Angriffs-Mali für das Kämpfen mit zwei Waffen deutlich.",
    "benefitRaw": "Your penalties for fighting with two weapons are reduced.",
    "normalRaw": "Standard penalties are -6 primary / -10 off-hand.",
    "specialRaw": "Fighter bonus feat. A ranger can select this at level 2.",
    "appEffect": "Reduziert Angriffs-Mali für zwei Waffen auf -2/-2",
    "source": "phb"
  },
  "two_weapon_defense": {
    "id": "two_weapon_defense",
    "nameDe": "Zwei-Waffen-Verteidigung",
    "nameEn": "Two-Weapon Defense",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "two_weapon_fighting"
      }
    ],
    "parent": "two_weapon_fighting",
    "benefitDe": "+1 Schild-RK im Kampf mit zwei Waffen (+2 defensiv).",
    "benefitRaw": "When fighting with two weapons, you gain a +1 shield bonus to AC.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+1 Schild-RK beim Kampf mit 2 Waffen",
    "source": "phb"
  },
  "improved_two_weapon_fighting": {
    "id": "improved_two_weapon_fighting",
    "nameDe": "Verbesserter Zwei-Waffen-Kampf",
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
    "benefitDe": "Gewährt einen zweiten Angriff mit der Schildhand (Malus -5).",
    "benefitRaw": "You get a second off-hand attack with a -5 penalty.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A ranger can select this at level 6.",
    "appEffect": "Zweiter Angriff mit der Schildhand (-5)",
    "source": "phb"
  },
  "greater_two_weapon_fighting": {
    "id": "greater_two_weapon_fighting",
    "nameDe": "Großer Zwei-Waffen-Kampf",
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
    "benefitDe": "Gewährt einen dritten Angriff mit der Schildhand (Malus -10).",
    "benefitRaw": "You get a third off-hand attack with a -10 penalty.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A ranger can select this at level 11.",
    "appEffect": "Dritter Angriff mit der Schildhand (-10)",
    "source": "phb"
  },
  "weapon_finesse": {
    "id": "weapon_finesse",
    "nameDe": "Waffenfeinheit (Weapon Finesse)",
    "nameEn": "Weapon Finesse",
    "category": "combat",
    "prereqs": [
      {
        "type": "bab",
        "value": 1
      }
    ],
    "benefitDe": "Nutze Ges-Modifikator statt Stä-Modifikator für Nahkampfangriffe mit leichten Waffen.",
    "benefitRaw": "With a light weapon, you may use your Dexterity modifier instead of your Strength modifier on attack rolls.",
    "normalRaw": "Strength modifier is used for melee attack rolls.",
    "specialRaw": "Fighter bonus feat. Natural weapons count as light weapons.",
    "appEffect": "Ges-Mod für Angriffswürfe mit leichten Waffen",
    "source": "phb"
  },
  "improved_unarmed_strike": {
    "id": "improved_unarmed_strike",
    "nameDe": "Verbesserter unbewaffneter Schlag",
    "nameEn": "Improved Unarmed Strike",
    "category": "combat",
    "prereqs": [],
    "benefitDe": "Gilt im unbewaffneten Kampf als bewaffnet; provoziert keine AoO.",
    "benefitRaw": "You are considered to be armed even when unarmed. Your unarmed strikes can deal lethal or nonlethal damage.",
    "normalRaw": "Unarmed strikes provoke AoO and deal nonlethal damage.",
    "specialRaw": "Fighter bonus feat. Monks get this for free at level 1.",
    "appEffect": "Kein AoO bei waffenlosem Schlag; freie Wahl lethal/nonlethal",
    "source": "phb"
  },
  "improved_grapple": {
    "id": "improved_grapple",
    "nameDe": "Verbessertes Ringen",
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
    "benefitDe": "+4 auf Ringprüfungen; provoziert keinen Gelegenheitsangriff.",
    "benefitRaw": "You gain a +4 bonus on grapple checks, and you do not provoke an attack of opportunity.",
    "normalRaw": "Grappling attempts provoke an AoO.",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 1.",
    "appEffect": "+4 auf Ringerprüfungen; kein AoO",
    "source": "phb"
  },
  "deflect_arrows": {
    "id": "deflect_arrows",
    "nameDe": "Pfeile abwehren",
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
    "benefitDe": "Wehre einmal pro Runde einen gegnerischen Fernkampfangriff ab.",
    "benefitRaw": "You must have at least one hand free. Once per round when you would normally be hit by a ranged weapon, you may deflect it so that you take no damage.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 1.",
    "appEffect": "Wehre 1 Fernkampfangriff pro Runde ab",
    "source": "phb"
  },
  "snatch_arrows": {
    "id": "snatch_arrows",
    "nameDe": "Pfeile fangen",
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
    "benefitDe": "Gefangene Fernkampfwaffen können sofort zurückgeworfen werden.",
    "benefitRaw": "You can catch a deflected ranged weapon and immediately throw it back as an immediate action.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Fange Geschosse und wirf sie zurück",
    "source": "phb"
  },
  "stunning_fist": {
    "id": "stunning_fist",
    "nameDe": "Betäubender Schlag",
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
    "benefitDe": "Betäube einen Gegner bei einem erfolgreichen unbewaffneten Angriff (ZÄ-Rettungswurf).",
    "benefitRaw": "Declare a stunning attack before rolling. If you hit, target must succeed on a Fortitude save (DC 10 + 1/2 character level + Wis mod) or be stunned for 1 round.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. A monk can select this at level 1. Monks get 1 stun attempt per level per day.",
    "appEffect": "Schaltet Betäubenden Schlag frei",
    "source": "phb"
  },
  "mounted_combat": {
    "id": "mounted_combat",
    "nameDe": "Kampf zu Pferd",
    "nameEn": "Mounted Combat",
    "category": "combat",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Reiten 1 Rang"
      }
    ],
    "benefitDe": "Negiere Treffer gegen dein Reittier durch eine erfolgreiche Reiten-Prüfung (1/Runde).",
    "benefitRaw": "Once per round when your mount is hit in combat, you may make a Ride check to negate the hit.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Negiere Treffer auf Reittier via Reiten-Wurf (1/Runde)",
    "source": "phb"
  },
  "mounted_archery": {
    "id": "mounted_archery",
    "nameDe": "Berittener Bogenschütze",
    "nameEn": "Mounted Archery",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "mounted_combat"
      }
    ],
    "parent": "mounted_combat",
    "benefitDe": "Halbiert die Mali für Fernkampfangriffe im Sattel (-2 bei Bewegung, -4 beim Galopp).",
    "benefitRaw": "Penalties for ranged attacks while mounted are halved.",
    "normalRaw": "Standard penalties are -4 (moving) / -8 (galloping).",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Halbiert Fernkampf-Mali auf Reittier (-2/-4)",
    "source": "phb"
  },
  "ride_by_attack": {
    "id": "ride_by_attack",
    "nameDe": "Vorbeireiten",
    "nameEn": "Ride-By Attack",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "mounted_combat"
      }
    ],
    "parent": "mounted_combat",
    "benefitDe": "Bewege dich vor und nach einem berittenen Sturmangriff (Charge) in gerader Linie.",
    "benefitRaw": "When you charge on a mount, you may move and attack, and then move again in a straight line.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Bewegung nach berittenem Sturmangriff in gerader Linie",
    "source": "phb"
  },
  "spirited_charge": {
    "id": "spirited_charge",
    "nameDe": "Mächtiger berittener Sturmangriff",
    "nameEn": "Spirited Charge",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "ride_by_attack"
      }
    ],
    "parent": "ride_by_attack",
    "benefitDe": "Verdopple Nahkampfschaden bei berittenem Sturmangriff (verdreifache mit Lanze).",
    "benefitRaw": "When mounted and making a charge, you deal double damage with a melee weapon (triple with a lance).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "x2 Schaden / x3 Lanzen-Schaden bei berittenem Charge",
    "source": "phb"
  },
  "trample": {
    "id": "trample",
    "nameDe": "Niedertrampeln",
    "nameEn": "Trample",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "mounted_combat"
      }
    ],
    "parent": "mounted_combat",
    "benefitDe": "Gegner kann Overrun-Versuch mit Reittier nicht ausweichen (Zusatzangriff bei Erfolg).",
    "benefitRaw": "When you overrun an opponent while mounted, the target cannot choose to avoid you.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Reittier-Trampelangriff; kein Ausweichen möglich",
    "source": "phb"
  },
  "improved_shield_bash": {
    "id": "improved_shield_bash",
    "nameDe": "Verbesserter Schildstoß",
    "nameEn": "Improved Shield Bash",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "shield_prof"
      }
    ],
    "parent": "shield_prof",
    "benefitDe": "Behalte den Schild-Bonus auf RK bei einem Schildstoß-Angriff.",
    "benefitRaw": "When you perform a shield bash, you may still apply the shield’s shield bonus to your AC.",
    "normalRaw": "You lose shield bonus to AC when bashing.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Behalte RK-Schildbonus bei Schildstoß",
    "source": "phb"
  },
  "exotic_weapon_prof": {
    "id": "exotic_weapon_prof",
    "nameDe": "Umgang mit exotischen Waffen",
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
    "benefitDe": "Kein Malus von -4 auf Angriffe mit der gewählten exotischen Waffe.",
    "benefitRaw": "You make attack rolls with the selected exotic weapon without penalty.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Kein Malus bei der gewählten exotischen Waffe",
    "source": "phb"
  },
  "improved_critical": {
    "id": "improved_critical",
    "nameDe": "Verbesserter Kritischer Treffer",
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
    "benefitDe": "Verdoppelt den Bedrohungsbereich (Threat Range) für kritische Treffer der gewählten Waffe.",
    "benefitRaw": "Doubles the threat range of the chosen weapon. Multiple effects that increase threat range do not stack.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat. You can gain this feat multiple times, each time for a different weapon.",
    "appEffect": "Verdoppelt Bedrohungsbereich für kritische Treffer",
    "source": "phb"
  },
  "combat_reflexes": {
    "id": "combat_reflexes",
    "nameDe": "Kampfreflexe",
    "nameEn": "Combat Reflexes",
    "category": "combat",
    "prereqs": [],
    "benefitDe": "Erlaube zusätzliche Gelegenheitsangriffe pro Runde in Höhe deines GE-Modifikators und Angriffe auf dem falschen Fuß.",
    "benefitRaw": "You may make a number of additional attacks of opportunity each round equal to your Dexterity bonus. You can also make attacks of opportunity while flat-footed.",
    "normalRaw": "You may only make one attack of opportunity per round, and cannot make attacks of opportunity while flat-footed.",
    "specialRaw": "Fighter bonus feat. A monk can select this at 2nd level.",
    "appEffect": "Zusätzliche Gelegenheitsangriffe (DEX-Mod) & AoO auf falschem Fuß",
    "source": "phb"
  },
  "blind_fight": {
    "id": "blind_fight",
    "nameDe": "Blind kämpfen",
    "nameEn": "Blind-Fight",
    "category": "combat",
    "prereqs": [],
    "benefitDe": "Darf Fehlschlag-Chance wegen Tarnung im Nahkampf einmal wiederholen; kein Vorteil für unsichtbare Angreifer.",
    "benefitRaw": "In melee, every time you miss because of concealment, you can reroll your miss chance once. An invisible attacker gets no bonus in melee against you.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Verdeckungs-Fehlschlag im Nahkampf wiederholen & unsichtbare Angreifer ohne Bonus",
    "source": "phb"
  },
  "quick_draw": {
    "id": "quick_draw",
    "nameDe": "Schnelles Ziehen",
    "nameEn": "Quick Draw",
    "category": "combat",
    "prereqs": [
      {
        "type": "bab",
        "value": 1
      }
    ],
    "benefitDe": "Ziehe eine Waffe als freie Aktion statt als Bewegungsaktion.",
    "benefitRaw": "You can draw a weapon as a free action instead of as a move action.",
    "normalRaw": "Without this feat, you can draw a weapon as a move action, or as a free action as part of movement with BAB +1.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Waffe als freie Aktion ziehen",
    "source": "phb"
  },
  "rapid_reload": {
    "id": "rapid_reload",
    "nameDe": "Schnelles Nachladen",
    "nameEn": "Rapid Reload",
    "category": "combat",
    "prereqs": [],
    "hasOption": true,
    "optionType": "weapon",
    "benefitDe": "Verringert die Nachladezeit der gewählten Armbrust (leichte Armbrust: freie Aktion; schwere Armbrust: Bewegungsaktion).",
    "benefitRaw": "The time required for you to reload your chosen type of crossbow is reduced to a free action (for a hand or light crossbow) or a move action (for a heavy crossbow).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Nachladen: Leichte Armbrust als freie Aktion, schwere als Bewegungsaktion",
    "source": "phb"
  }
};
