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
  }
};
