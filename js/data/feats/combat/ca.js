export const COMBAT_FEATS_REGISTRY_CA = {
  "expert_tactician": {
    "id": "expert_tactician",
    "nameDe": "Erfahrener Taktiker",
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
    "benefitDe": "Triffst du einen Gegner im Nahkampf mit einem Gelegenheitsangriff, erhalten du und alle Verbündeten bis zum Beginn deines nächsten Zugs einen Situationsbonus von +2 auf Nahkampf-Angriffs- und Schadenswürfe gegen dieses Ziel.",
    "benefitRaw": "If you hit a creature with an attack of opportunity in melee, you and all allies gain a +2 circumstance bonus on melee attack rolls and damage rolls against that creature until the start of your next turn.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Expert Tactician as one of his fighter bonus feats.",
    "appEffect": "+2 Angriffs- und Schadensbonus für Gruppe nach erfolgreichem Gelegenheitsangriff"
  },
  "brutal_throw": {
    "id": "brutal_throw",
    "nameDe": "Brutaler Wurf",
    "nameEn": "Brutal Throw",
    "category": "combat",
    "source": "ca",
    "prereqs": [],
    "benefitDe": "Du darfst deinen Stärke-Modifikator anstelle deines Geschicklichkeits-Modifikators auf Angriffswürfe mit Wurfwaffen addieren.",
    "benefitRaw": "You can add your Strength modifier (instead of your Dexterity modifier) to attack rolls with thrown weapons.",
    "normalRaw": "A character adds his Dexterity modifier to ranged attack rolls.",
    "specialRaw": "A fighter may select Brutal Throw as one of his fighter bonus feats.",
    "appEffect": "Stärke-Modifikator für Wurfwaffen-Angriffe"
  },
  "power_throw": {
    "id": "power_throw",
    "nameDe": "Mächtiger Wurf",
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
    "benefitDe": "Ziehe vor dem Angriff mit einer Wurfwaffe eine Zahl von deinen Fernkampf-Angriffswürfen ab und addiere die gleiche Zahl zu deinen Schadenswürfen (wie Power Attack für Wurfwaffen).",
    "benefitRaw": "On your action, before making attack rolls for a round, you may choose to subtract a number from all thrown weapon attack rolls and add that number to all thrown weapon damage rolls.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Power Throw as one of his fighter bonus feats.",
    "appEffect": "Power Attack Mechanik für Wurfwaffen"
  },
  "dual_strike": {
    "id": "dual_strike",
    "nameDe": "Doppelschlag",
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
    "benefitDe": "Als Standard-Aktion kannst du einen Nahkampfangriff mit deiner Haupt- und deiner Nebenhandwaffe gleichzeitig gegen dasselbe Ziel durchführen.",
    "benefitRaw": "As a standard action, you can make a melee attack with your primary weapon and your off-hand weapon simultaneously against the same target.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Dual Strike as one of his fighter bonus feats.",
    "appEffect": "Gleichzeitiger Angriff mit beiden Waffen als Standard-Aktion"
  },
  "deft_opportunist": {
    "id": "deft_opportunist",
    "nameDe": "Gewandter Opportunist",
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
    "benefitDe": "Gewährt einen Situationsbonus von +4 auf alle Angriffswürfe bei Gelegenheitsangriffen.",
    "benefitRaw": "You gain a +4 circumstance bonus on attack rolls when making attacks of opportunity.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Deft Opportunist as one of his fighter bonus feats.",
    "appEffect": "+4 Bonus auf alle Gelegenheitsangriffe"
  },
  "hear_the_unseen": {
    "id": "hear_the_unseen",
    "nameDe": "Das Unsichtbare hören",
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
    "benefitDe": "Mit einem erfolgreichen Lauschen-Wurf (Move-Action) kannst du den genauen Standort unsichtbarer oder getarnter Kreaturen innerhalb von 30 Fuß lokalisieren.",
    "benefitRaw": "As a move action, by making a Listen check against DC 25, you pinpoint the location of any creature within 30 feet.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Hear the Unseen as one of his fighter bonus feats.",
    "appEffect": "Lauschen-Wurf lokalisiert unsichtbare Kreaturen innerhalb 30 ft"
  },
  "improved_diversion": {
    "id": "improved_diversion",
    "nameDe": "Verbessertes Ablenken",
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
    "benefitDe": "Du kannst einen Bluffen-Wurf zur Ablenkung für ein Verstecken-Manöver als Move-Action statt als Standard-Aktion ausführen.",
    "benefitRaw": "You can use Bluff to create a diversion to hide as a move action rather than as a standard action.",
    "normalRaw": "Creating a diversion to hide requires a standard action.",
    "specialRaw": "A fighter may select Improved Diversion as one of his fighter bonus feats.",
    "appEffect": "Ablenkung für Verstecken als Move-Action"
  },
  "oversized_two_weapon_fighting": {
    "id": "oversized_two_weapon_fighting",
    "nameDe": "Überdimensionierter Zwei-Waffen-Kampf",
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
    "benefitDe": "Wenn du eine einhändige Waffe (One-handed weapon) in deiner Nebenhand führst, wird sie hinsichtlich der Angriffsabzüge behandelt, als wäre sie eine leichte Waffe (Light weapon).",
    "benefitRaw": "When wielding a one-handed weapon in your off hand, you treat it for all purposes as a light weapon with respect to two-weapon fighting penalties.",
    "normalRaw": "Wielding a one-handed off-hand weapon imposes a -4/-4 penalty.",
    "specialRaw": "A fighter may select Oversized Two-Weapon Fighting as one of his fighter bonus feats.",
    "appEffect": "Einhändige Nebenhandwaffe verursacht nur leichte Abzüge (-2/-2)"
  },
  "staggering_strike": {
    "id": "staggering_strike",
    "nameDe": "Taumelnder Schlag",
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
    "benefitDe": "Bei einem erfolgreichen Nahkampf-Schadenswurf mit Sneak Attack muss der getroffene Gegner einen ZÄ-Rettungswurf (DC = erlittener Schaden) schaffen oder ist für 1 Runde kampfunfähig (staggered).",
    "benefitRaw": "If you deal damage with a melee sneak attack, the target must make a Fortitude save (DC = damage dealt) or be staggered for 1 round.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Staggering Strike as one of his fighter bonus feats.",
    "appEffect": "Sneak Attacks können Gegner taumelnd machen (Fort DC = Schaden)"
  }
};
