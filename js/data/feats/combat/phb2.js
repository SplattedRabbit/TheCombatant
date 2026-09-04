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
  }
};
