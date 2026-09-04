/**
 * @module    feats-combat-phb2
 * @summary   Statische Datenbank für D&D 3.5e Kampftalente aus dem Player's Handbook II (PHB2).
 * @exports   COMBAT_FEATS_REGISTRY_PHB2
 */

export const COMBAT_FEATS_REGISTRY_PHB2 = {
  "acrobatic_strike": {
    "id": "acrobatic_strike",
    "nameDe": "Akrobatischer Schlag",
    "nameEn": "Acrobatic Strike",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Tumble 12 ranks"
      }
    ],
    "benefitDe": "Gewährt +6 Bonus auf den nächsten Angriffswurf nach einem erfolgreichen Akrobatik-Wurf (Tumble) durch das Feld des Gegners.",
    "benefitRaw": "If you succeed on a Tumble check to move through an enemy's threatened area or space, you gain a +6 bonus on your next single melee attack roll against that enemy.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Acrobatic Strike as one of his fighter bonus feats.",
    "appEffect": "+6 Angriffswurf nach erfolgreichem Tumble durch Gegnerfeld"
  },
  "bounding_assault": {
    "id": "bounding_assault",
    "nameDe": "Stürmischer Sturmangriff",
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
    "benefitDe": "Führe zwei Angriffe während eines Ausfallschritts (Spring Attack) durch, unter Aufteilung der Bewegung.",
    "benefitRaw": "When using the Spring Attack feat, you can designate two foes and make a single melee attack against each. Your movement resolves normally between or after the attacks.",
    "normalRaw": "Spring Attack allows only a single attack.",
    "specialRaw": "A fighter may select Bounding Assault as one of his fighter bonus feats.",
    "appEffect": "Zwei Angriffe während Ausfallschritt (Spring Attack)"
  },
  "brutal_strike": {
    "id": "brutal_strike",
    "nameDe": "Brutaler Schlag",
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
    "benefitDe": "Ziehe Angriffsbonus für Power Attack ab; bei Treffer mit einer Wuchtwaffe muss der Gegner einen ZÄ-Rettungswurf machen oder ist für 1 Runde benommen.",
    "benefitRaw": "When using Power Attack with a bludgeoning weapon, you can choose to make a brutal strike. If you hit, target must make a Fortitude save (DC 10 + Power Attack damage added) or be sickened for 1 round.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Schaltet Wuchtwaffen-Zähigkeitsprüfung auf Benommenheit/Sickness frei"
  },
  "rapid_blitz": {
    "id": "rapid_blitz",
    "nameDe": "Blitzangriff",
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
    "benefitDe": "Führe drei Angriffe während eines Ausfallschritts (Spring Attack) gegen drei verschiedene Gegner durch.",
    "benefitRaw": "When using the Spring Attack feat, you can designate three foes and make a single melee attack against each, moving normally between them.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Drei Angriffe während Ausfallschritt (Spring Attack)"
  },
  "crossbow_sniper": {
    "id": "crossbow_sniper",
    "nameDe": "Armbrust-Scharfschütze",
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
    "benefitDe": "Addiere die Hälfte deines Geschicklichkeitsbonus zum Schaden deiner Armbrust. Deine Reichweite für Sneak Attack / Skirmish mit Armbrüsten steigt auf 60 ft.",
    "benefitRaw": "Apply half your Dexterity bonus on damage rolls with selected crossbow. Ranged sneak attacks can be made out to 60 feet.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+1/2 Ges-Mod auf Armbrustschaden; Sneak Attack bis 60 Fuß"
  },
  "deadeye_shot": {
    "id": "deadeye_shot",
    "nameDe": "Präzisions-Fernschuss",
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
    "benefitDe": "Bereite eine Fernkampfaktion vor. Wenn dein Verbündeter denselben Gegner im Nahkampf trifft, verliert dieser seinen Geschicklichkeitsbonus auf RK gegen deinen Fernkampfangriff.",
    "benefitRaw": "By readying a ranged attack against a foe adjacent to an ally, you deny that foe their Dex bonus to AC against your attack if the ally hits them.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Bereiteter Schuss nimmt Geschicklichkeitsbonus auf RK bei Treffer von Verbündetem"
  },
  "defensive_sweep": {
    "id": "defensive_sweep",
    "nameDe": "Defensiver Rundumfeger",
    "nameEn": "Defensive Sweep",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "bab",
        "value": 15
      }
    ],
    "benefitDe": "Jeder Gegner, der seine Runde in einem von dir bedrohten Feld beginnt und sich in seinem Zug nicht wegbewegt, provoziert einen Gelegenheitsangriff von dir.",
    "benefitRaw": "Foes starting their turn adjacent to you provoke an attack of opportunity if they do not move during their turn.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Gegner provokieren AoO, falls sie im bedrohten Feld stehenbleiben"
  },
  "melee_weapon_mastery": {
    "id": "melee_weapon_mastery",
    "nameDe": "Nahkampfwaffen-Meisterschaft",
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
    "benefitDe": "Wähle eine Schadensart (Wucht, Stich, Hieb). Du erhältst +1 auf Angriffswürfe und +2 auf Schadenswürfe mit allen Nahkampfwaffen dieser Schadensart.",
    "benefitRaw": "Select bludgeoning, piercing, or slashing. You gain +1 on attacks and +2 on damage with all melee weapons of that type.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+1 Angriff / +2 Schaden mit gewählter Nahkampfwaffen-Schadensart"
  },
  "robilars_gambit": {
    "id": "robilars_gambit",
    "nameDe": "Robilars Gambit",
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
    "benefitDe": "Gegner erhalten +4 Bonus auf Angriffe und Schaden gegen dich, aber jeder ihrer Angriffe provoziert sofort einen Gelegenheitsangriff von dir (nachdem ihr Angriff abgehandelt wurde).",
    "benefitRaw": "Foes gain +4 bonus on attack and damage rolls against you, but each attack they resolve against you provokes an attack of opportunity from you.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Gegner erhalten +4 Ang/Schd; provozieren dafür AoO bei jedem Angriff"
  },
  "shield_specialization": {
    "id": "shield_specialization",
    "nameDe": "Schildspezialisierung",
    "nameEn": "Shield Specialization",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "shield_prof"
      }
    ],
    "benefitDe": "Erhöht den Rüstungsklassen-Schildbonus deines gewählten Schildes um +1.",
    "benefitRaw": "Increase the shield bonus to AC granted by your chosen type of shield by 1.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+1 Schildbonus auf RK"
  },
  "shield_ward": {
    "id": "shield_ward",
    "nameDe": "Schildwall-Schutz",
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
    "benefitDe": "Addiere deinen Schildbonus auf deine Touch AC und auf alle Würfe zur Abwehr von Anstürmen, Entwaffnen, Ringen, Überrennen und ZU-Boden-Werfen.",
    "benefitRaw": "Apply shield bonus to touch AC and to resist bull rush, disarm, grapple, overrun, and trip checks.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Schildbonus wirkt auf Touch AC und Spezial-Kampfmanöver-Abwehr"
  },
  "two_weapon_pounce": {
    "id": "two_weapon_pounce",
    "nameDe": "Zwei-Waffen-Sturzangriff",
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
    "benefitDe": "Führe beim Beenden eines Sturmangriffs (Charge) einen Angriff mit der Haupt- und Schildhand aus.",
    "benefitRaw": "When you make a charge, you can attack with both of your equipped weapons instead of just one.",
    "normalRaw": "Charging allows only a single attack.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Doppelangriff am Ende eines Sturmangriffs (TWF Charge)"
  },
  "two_weapon_rend": {
    "id": "two_weapon_rend",
    "nameDe": "Zwei-Waffen-Zerreißen",
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
    "benefitDe": "Triffst du einen Gegner in derselben Runde mit Haupt- und Schildhand, verursachst du zusätzlich +1w6 + 1.5x Stärke Bonus-Schaden (1-mal pro Runde).",
    "benefitRaw": "If you hit an opponent with both primary and off-hand weapons, you deal an extra 1d6 + 1.5x Str mod damage.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+1w6 + 1.5x Str Modifikator Bonus-Schaden bei Treffer mit beiden Waffen"
  },
  "vexing_flanker": {
    "id": "vexing_flanker",
    "nameDe": "Lästiger Flankierer",
    "nameEn": "Vexing Flanker",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_reflexes"
      }
    ],
    "benefitDe": "Du erhältst einen Angriffsbonus von +4 (statt +2) beim Flankieren eines Gegners.",
    "benefitRaw": "You gain a +4 bonus on attack rolls when flanking an opponent, rather than the standard +2.",
    "normalRaw": "Flanking bonus is +2.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+4 Angriffsbonus beim Flankieren (statt +2)"
  },
  "adaptable_flanker": {
    "id": "adaptable_flanker",
    "nameDe": "Anpassungsfähiger Flankierer",
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
    "benefitDe": "Erlaube dir selbst, einen Gegner aus jedem von dir bedrohten Feld zu flankieren.",
    "benefitRaw": "As a swift action, you can count as occupying any adjacent square you threaten for flanking purposes.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Bestimme beliebiges bedrohtes Nachbarfeld für Flankierungs-Berechnung"
  },
  "agile_shield_fighter": {
    "id": "agile_shield_fighter",
    "nameDe": "Agiler Schildkämpfer",
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
    "benefitDe": "Die Mali für das Kämpfen mit Waffe und Schildstoß reduzieren sich auf jeweils -2/-2 (ersetzt reguläre TWF-Mali).",
    "benefitRaw": "When making a shield bash and armed strike as part of a full attack, you take a -2 penalty on each attack.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Reduziert TWF-Schildstoß-Mali auf -2/-2"
  },
  "telling_blow": {
    "id": "telling_blow",
    "nameDe": "Verheerender Treffer",
    "nameEn": "Telling Blow",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Sneak attack or skirmish"
      }
    ],
    "benefitDe": "Immer wenn du einen kritischen Treffer erzielst, addierst du deinen Sneak Attack- oder Skirmish-Zusatzschaden zum Schadenswurf.",
    "benefitRaw": "Whenever you score a critical hit, you add your sneak attack or skirmish damage to the damage roll.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Telling Blow as one of his fighter bonus feats.",
    "appEffect": "Sneak Attack / Skirmish Schaden wird bei jedem kritischen Treffer ausgelöst"
  },
  "armor_specialization": {
    "id": "armor_specialization",
    "nameDe": "Rüstungsspezialisierung",
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
    "benefitDe": "Erhalte Schadensreduktion 2/— (DR 2/—), wenn du die gewählte Rüstungsart trägst.",
    "benefitRaw": "You gain damage reduction 2/— when wearing the chosen type of armor (medium or heavy).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "DR 2/— beim Tragen der gewählten Rüstung"
  },
  "weapon_supremacy": {
    "id": "weapon_supremacy",
    "nameDe": "Waffenvorherrschaft",
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
    "benefitDe": "Höchste Waffenmeisterschaft: +4 auf Entwaffnen-Gegenwürfe, nimm '10' bei einem Angriffswurf pro Runde, führe Angriffe im Ringen aus und erhalte +1 RK.",
    "benefitRaw": "With chosen weapon: +4 bonus on checks to resist disarm, can take 10 on one attack roll per round, +1 shield bonus to AC, and can wield weapon in grapple.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Take 10 auf 1 Angriff/Runde, +4 gegen Entwaffnen, +1 RK & Waffe im Ringen nutzbar"
  },
  "ranged_weapon_mastery": {
    "id": "ranged_weapon_mastery",
    "nameDe": "Fernkampfwaffen-Meisterschaft",
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
    "benefitDe": "+2 auf Angriffs- und Schadenswürfe mit Fernkampfwaffen des gewählten Schadentyps (Hieb/Stich/Wucht) und Reichweitenschritt um 20 Fuß erhöht.",
    "benefitRaw": "+2 bonus on attack and damage rolls with ranged weapons of the chosen damage type, and range increment increases by 20 feet.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+2 Angriff/Schaden und +20 ft. Reichweitenschritt für Fernkampfwaffen"
  },
  "crushing_strike": {
    "id": "crushing_strike",
    "nameDe": "Zermalmender Schlag",
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
    "benefitDe": "Bei jedem erfolgreichen Treffer mit einer Wuchtwaffe erhältst du für den Rest der Runde einen kumulativen Bonus von +1 auf alle folgenden Nahkampfangriffe gegen dasselbe Ziel.",
    "benefitRaw": "Each time you hit with a bludgeoning weapon, you gain a cumulative +1 bonus on attack rolls against that opponent for the rest of your turn.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Kumulativer +1 Angriffsbonus pro Treffer mit Wuchtwaffe gegen dasselbe Ziel"
  },
  "driving_attack": {
    "id": "driving_attack",
    "nameDe": "Vortreibender Angriff",
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
    "benefitDe": "Volle Aktion: Führe einen einzelnen Angriff mit einer Stichwaffe aus; triffst du, führst du einen kostenlosen Ansturm (Bull Rush) durch und wirfst das Ziel bei 10+ ft. zu Boden.",
    "benefitRaw": "Full-round action: make a single attack with a piercing weapon. If it hits, you also initiate a bull rush with a bonus, knocking the foe prone if driven back 10+ feet.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Stichwaffen-Angriff löst kostenlosen Ansturm mit Chance auf Prone aus"
  },
  "slashing_flurry": {
    "id": "slashing_flurry",
    "nameDe": "Wirbelnde Klingen",
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
    "benefitDe": "Voller Angriff: Erhalte 1 zusätzlichen Angriff mit deiner Hiebwaffe mit höchstem Angriffsbonus, nimm dafür -5 auf alle Angriffe der Runde.",
    "benefitRaw": "When making a full attack with a slashing weapon, you can make one additional attack with chosen weapon at your highest base attack bonus, taking a -5 penalty on all attacks that round.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Zusätzlicher Hiebwaffen-Angriff im vollen Angriff (alle Angriffe bei -5)"
  },
  "combat_focus": {
    "id": "combat_focus",
    "nameDe": "Kampffokus",
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
    "benefitDe": "Im Kampf erhältst du +2 Willensbonus auf Willensrettungswürfe. Bei deinem ersten erfolgreichen Treffer trittst du in den Kampffokus ein (hält 10 Runden plus 1 Runde pro weiterem Kampffokus-Talent).",
    "benefitRaw": "In combat, you gain a +2 bonus on Will saves. After your first successful attack, you gain combat focus for 10 rounds (longer with additional combat focus feats).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+2 Willensrettungswürfe; aktiviert Kampffokus nach erstem Treffer"
  },
  "combat_awareness": {
    "id": "combat_awareness",
    "nameDe": "Kampfbewusstsein",
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
    "benefitDe": "Solange dein Kampffokus aktiv ist, erfährst du die exakten aktuellen Trefferpunkte und eventuelle Verzauberungen aller benachbarten Verbündeten und Gegner.",
    "benefitRaw": "While your combat focus is active, you know the current hit point total and status of each adjacent ally and enemy.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Exakte TP aller benachbarten Kreaturen im Kampffokus sichtbar"
  },
  "combat_defense": {
    "id": "combat_defense",
    "nameDe": "Kampfverteidigung",
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
    "benefitDe": "Solange dein Kampffokus aktiv ist, kannst du das Ziel deines Ausweichen-Talents (Dodge) als sofortige Aktion im Zug eines Gegners wechseln.",
    "benefitRaw": "While your combat focus is active, you can change the target of your Dodge feat as an immediate action.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Dodge-Ziel als sofortige Aktion wechseln im Kampffokus"
  },
  "combat_stability": {
    "id": "combat_stability",
    "nameDe": "Kampfstabilität",
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
    "benefitDe": "Solange dein Kampffokus aktiv ist, erhältst du +4 Bonus auf alle Würfe zur Abwehr von Ansturm, Entwaffnen, Ringen, Überrennen und Zu-Boden-Werfen.",
    "benefitRaw": "While your combat focus is active, you gain a +4 bonus on checks to resist bull rush, disarm, grapple, overrun, and trip attempts.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+4 gegen Ansturm, Entwaffnen, Ringen, Überrennen, Trip im Kampffokus"
  },
  "combat_strike": {
    "id": "combat_strike",
    "nameDe": "Kampfschlag",
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
    "benefitDe": "Beende deinen Kampffokus als Schnelle Aktion: Erhalte für diesen Zug einen Bonus auf alle Angriffs- und Schadenswürfe in Höhe deines BAB; verliere danach RK-Bonus.",
    "benefitRaw": "As a swift action, end your combat focus to gain a bonus on all attack rolls and damage rolls equal to your base attack bonus for the rest of your turn.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Kampffokus beenden für +BAB auf alle Angriffe & Schaden dieser Runde"
  },
  "combat_vigor": {
    "id": "combat_vigor",
    "nameDe": "Kampflebenskraft",
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
    "benefitDe": "Solange dein Kampffokus aktiv ist, erhältst du Schnelle Heilung 2 (Fast Healing 2), bis zu maximal der Hälfte deiner maximalen Trefferpunkte.",
    "benefitRaw": "While your combat focus is active, you gain fast healing 2 (up to half your maximum hit points).",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Schnelle Heilung 2 im Kampffokus (bis 50% max TP)"
  },
  "combat_tactician": {
    "id": "combat_tactician",
    "nameDe": "Kampftaktiker",
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
    "benefitDe": "Wenn du dich auf einen Gegner zubewegst, der zu Beginn deines Zugs nicht benachbart war, erhältst du +2 auf den Nahkampf-Schaden gegen ihn.",
    "benefitRaw": "When you approach an enemy not adjacent at the start of your turn, you gain a +2 bonus on melee damage against that enemy this turn.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+2 Nahkampfschaden gegen herannahende Gegner"
  },
  "cometary_collision": {
    "id": "cometary_collision",
    "nameDe": "Kometenkollision",
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
    "benefitDe": "Bereite eine Aktion vor: Wenn ein Gegner anstürmt, stürmst du ihm entgegen! Du fängst seinen Sturmangriff ab, handelst zuerst und erhältst verdoppelte Sturmangriffs-Boni.",
    "benefitRaw": "Ready an action to counter-charge an incoming foe. Your charge interrupts theirs, and you deal extra damage.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Gegensturmangriff als vorbereitete Aktion fängt gegnerischen Sturmangriff ab"
  },
  "melee_evasion": {
    "id": "melee_evasion",
    "nameDe": "Nahkampf-Entrinnen",
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
    "benefitDe": "Wenn du defensiv kämpfst: Neutralisiere den ersten erfolgreichen Nahkampfangriff deines Ausweichen-Gegners, indem du mit einem eigenen Angriffswurf seinen Wurf übertriffst.",
    "benefitRaw": "While fighting defensively or using total defense, negate the first melee attack from your dodge target if your attack roll exceeds his.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Neutralisiere gegnerischen Nahkampftreffer bei defensiver Kampfführung"
  },
  "flay": {
    "id": "flay",
    "nameDe": "Schinden",
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
    "benefitDe": "Bei einem erfolgreichen Angriff gegen ein ungepanzertes Ziel (ohne Rüstungs- oder natürliche Rüstungsboni) erleidet das Ziel in der nächsten Runde 1d6 Blutungsschaden.",
    "benefitRaw": "When you hit an unarmored opponent (no armor or natural armor), you inflict 1d6 points of pain damage on your next turn.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+1d6 Blutungsschaden in Folgerunde gegen ungepanzerte Ziele"
  },
  "grenadier": {
    "id": "grenadier",
    "nameDe": "Grenadier",
    "nameEn": "Grenadier",
    "category": "combat",
    "source": "phb2",
    "prereqs": [],
    "benefitDe": "+1 auf Angriffs- und Schadenswürfe mit Wurfwaffen mit Flächenschaden (Alchemistenfeuer, Säure etc.); lenke Streuschaden gezielt von 1 Feld ab.",
    "benefitRaw": "+1 on attacks and damage with splash weapons, and you can exclude one square from splash damage.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+1 Angriff/Schaden mit Spritzwaffen & 1 Feld von Streuschaden ausschließen"
  },
  "hindering_opportunist": {
    "id": "hindering_opportunist",
    "nameDe": "Hinderlicher Opportunist",
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
    "benefitDe": "Du kannst einen Gelegenheitsangriff durch eine 'Jemandem helfen'-Aktion (Aid Another) ersetzen, um einem Verbündeten +2 RK gegen den Gegner zu gewähren.",
    "benefitRaw": "You can replace an attack of opportunity with an aid another action to grant an ally a bonus to AC.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Gelegenheitsangriff durch 'Jemandem helfen' (+2 RK für Verbündeten) ersetzen"
  },
  "stalwart_defense": {
    "id": "stalwart_defense",
    "nameDe": "Standhafte Verteidigung",
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
    "benefitDe": "Gegner provozieren bei dir eine 'Jemandem helfen'-Aktion, wann immer sie einen deiner Verbündeten angreifen.",
    "benefitRaw": "Foes provoke an aid another action from you when they attack adjacent allies.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Gegner provozieren 'Jemandem helfen' beim Angriff auf Verbündete"
  },
  "intimidating_strike": {
    "id": "intimidating_strike",
    "nameDe": "Einschüchternder Schlag",
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
    "benefitDe": "Standard-Aktion: Führe einen Nahkampfangriff aus und mache einen Einschüchtern-Wurf gegen das Ziel. Bei Erfolg ist das Ziel für die gesamte Begegnung erschüttert (shaken).",
    "benefitRaw": "Standard action: make a melee attack with a penalty and make a free Intimidate check to shake the opponent for the rest of the encounter.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Nahkampfangriff mit Einschüchtern kombiniert; Ziel wird shaken"
  },
  "lunging_strike": {
    "id": "lunging_strike",
    "nameDe": "Ausfallschlag",
    "nameEn": "Lunging Strike",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "bab",
        "value": 6
      }
    ],
    "benefitDe": "Volle Aktion: Führe einen einzelnen Nahkampfangriff aus, dessen Reichweite um zusätzliche 5 Fuß vergrößert ist.",
    "benefitRaw": "Full-round action: make a single melee attack with your reach extended by 5 feet.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Einzelner Nahkampfangriff mit +5 ft. Reichweite als volle Aktion"
  },
  "overwhelming_assault": {
    "id": "overwhelming_assault",
    "nameDe": "Überwältigender Ansturm",
    "nameEn": "Overwhelming Assault",
    "category": "combat",
    "source": "phb2",
    "prereqs": [
      {
        "type": "bab",
        "value": 15
      }
    ],
    "benefitDe": "Erhalte +4 Schadensbonus gegen einen benachbarten Gegner, wenn er in seiner vorherigen Runde keinen Angriff gegen dich gerichtet hat.",
    "benefitRaw": "Gain a +4 bonus on melee damage rolls against an adjacent opponent who did not attack you on his last turn.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+4 Nahkampfschaden gegen Gegner, die dich nicht angegriffen haben"
  },
  "penetrating_shot": {
    "id": "penetrating_shot",
    "nameDe": "Durchschlagender Schuss",
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
    "benefitDe": "Standard-Aktion: Dein Pfeil/Bolzen durchschlägt alle Ziele in einer 60-Fuß-Linie (separater Angriffswurf gegen jedes Ziel).",
    "benefitRaw": "Standard action: make a single ranged attack that targets all creatures in a 60-foot line.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Fernkampfangriff durchdringt alle Kreaturen in 60 ft. Linie"
  },
  "shield_sling": {
    "id": "shield_sling",
    "nameDe": "Schildwurf",
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
    "benefitDe": "Du kannst deinen Schild als Fernkampfwaffe werfen (Reichweite 20 Fuß, Schildstoß-Schaden) und bei einem Treffer einen Zu-Boden-Werfen-Versuch unternehmen.",
    "benefitRaw": "Throw your shield as a ranged attack (range increment 20 ft.), with a free trip attempt on a hit.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Schild werfen (20 ft.) mit kostenlosem Trip-Versuch"
  },
  "short_haft": {
    "id": "short_haft",
    "nameDe": "Kurzer Schaft",
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
    "benefitDe": "Schnelle Aktion: Ändere deinen Griff an einer Stangenwaffe (Reach Weapon), um benachbarte Felder statt entfernter Felder anzugreifen.",
    "benefitRaw": "As a swift action, adjust your grip on a reach weapon to strike adjacent foes instead of distant ones.",
    "normalRaw": "Reach weapons cannot attack adjacent creatures.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Stangenwaffe per schneller Aktion auf benachbarte Gegner umschalten"
  },
  "spectral_skirmisher": {
    "id": "spectral_skirmisher",
    "nameDe": "Spektraler Plänkler",
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
    "benefitDe": "Solange du unsichtbar bist oder vollständige Tarnung besitzt, provoziert jeder Gegner, der dich im Nahkampf angreift (ob Treffer oder Fehlschlag), einen Gelegenheitsangriff von dir.",
    "benefitRaw": "While invisible, all opponents who attack you in melee provoke an attack of opportunity from you.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Gegnerische Angriffe provozieren Gelegenheitsangriffe während Unsichtbarkeit"
  },
  "tumbling_feint": {
    "id": "tumbling_feint",
    "nameDe": "Akrobatische Finte",
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
    "benefitDe": "Wenn du dich per Akrobatik (Tumble) erfolgreich durch den Bedrohungsbereich eines Gegners bewegst, erhältst du +5 auf deinen nächsten Finte-Wurf gegen ihn.",
    "benefitRaw": "Tumbling through an opponent's threatened area grants you a +5 bonus on a Bluff check to feint him.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+5 auf Finte nach erfolgreicher Akrobatik durch Gegnerbereich"
  },
  "versatile_unarmed_strike": {
    "id": "versatile_unarmed_strike",
    "nameDe": "Vielseitiger Waffenloser Schlag",
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
    "benefitDe": "Schnelle Aktion: Wähle, ob deine waffenlosen Schläge Wucht-, Stich- oder Hiebschaden verursachen.",
    "benefitRaw": "As a swift action, choose whether your unarmed strikes deal bludgeoning, piercing, or slashing damage.",
    "normalRaw": "Unarmed strikes deal only bludgeoning damage.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Schadenstyp für waffenlose Schläge frei wählbar (Wucht/Stich/Hieb)"
  },
  "water_splitting_stone": {
    "id": "water_splitting_stone",
    "nameDe": "Wasser spaltet Stein",
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
    "benefitDe": "Deine waffenlosen Angriffe fügen Gegnern mit Schadensreduktion (DR) +4 zusätzlichen Schaden zu.",
    "benefitRaw": "Gain a +4 bonus on melee damage rolls with unarmed strikes against opponents with damage reduction.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+4 waffenloser Schaden gegen Kreaturen mit Schadensreduktion (DR)"
  },
  "blood_spiked_charger": {
    "id": "blood_spiked_charger",
    "nameDe": "Stachel-Stürmer",
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
    "benefitDe": "Taktisches Talent: Schaltet Spike Slam, Spiked Avalanche und Spiked Charge frei.",
    "benefitRaw": "Tactical feat: Spiked Avalanche, Spike Slam, and Spiked Charge options with spiked armor and shield.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Taktische Optionen mit Rüstungs- und Schildstacheln"
  },
  "combat_cloak_expert": {
    "id": "combat_cloak_expert",
    "nameDe": "Kampfumhang-Experte",
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
    "benefitDe": "Taktisches Talent: Nutze deinen Umhang für Cloaked Strike, Flick of the Cloak und Defense of the Cloak.",
    "benefitRaw": "Tactical feat: Cloaked Strike, Flick of the Cloak, and Defense of the Cloak options using a cloak in combat.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Taktische Optionen mit dem Umhang (Tarnung, Fehlschlag, Verwirrung)"
  },
  "combat_panache": {
    "id": "combat_panache",
    "nameDe": "Kampf-Grandezza",
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
    "benefitDe": "Taktisches Talent: Nutze Bluffen im Nahkampf für Sneak Attack Ablenkung, Play the Fool und Fortuitous Tumble.",
    "benefitRaw": "Tactical feat: Sneak Smash, Play the Fool, and Fortuitous Tumble tactical options in combat.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Taktische Optionen mit Bluffen im Nahkampf"
  },
  "einhander": {
    "id": "einhander",
    "nameDe": "Einhänder",
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
    "benefitDe": "Taktischer Kampfstil mit einer einzelnen Einhandwaffe und freier Zweithand: Schaltet Narrow Profile, Off-Hand Balance und Lunging Thrust frei.",
    "benefitRaw": "Tactical feat: Narrow Profile (+2 AC), Off-Hand Balance, and Lunging Thrust when fighting with a single one-handed weapon and empty off-hand.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Taktischer Fechtstil: +2 RK, Gleichgewicht und Stoßangriff"
  },
  "shadow_striker": {
    "id": "shadow_striker",
    "nameDe": "Schatten-Angreifer",
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
    "benefitDe": "Taktisches Talent: Schaltet Fade Away, Shadow Evade und Strikethrough im Schatten frei.",
    "benefitRaw": "Tactical feat: tactical options in dim light and shadowy areas.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Taktische Optionen in Schatten und Dämmerlicht"
  }
};
