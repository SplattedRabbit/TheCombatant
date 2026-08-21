export const GENERAL_FEATS_REGISTRY_CA = {
  "force_of_personality": {
    "id": "force_of_personality",
    "nameDe": "Persönlichkeitsstärke",
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
    "benefitDe": "Nutze deinen Charisma-Modifikator anstelle deines Weisheits-Modifikators für alle Willens-Rettungswürfe gegen geistesbeeinflussende Zauber und Effekte.",
    "benefitRaw": "You use your Charisma modifier instead of your Wisdom modifier on Will saves against mind-affecting spells and abilities.",
    "normalRaw": "Wisdom modifier is normally applied to Will saves.",
    "specialRaw": "",
    "appEffect": "Charisma-Mod für Willens-Rettungswürfe gegen Geistesbeeinflussung"
  },
  "extra_music": {
    "id": "extra_music",
    "nameDe": "Zusätzliche Bardenmusik",
    "nameEn": "Extra Music",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "Gewährt täglich 4 zusätzliche Anwendungen deiner Bardenmusik.",
    "benefitRaw": "You can use your bardic music four extra times per day.",
    "normalRaw": "",
    "specialRaw": "You can take this feat multiple times. Each time gives +4 daily uses.",
    "appEffect": "+4 tägliche Anwendungen für Bardenmusik"
  },
  "daring_outlaw": {
    "id": "daring_outlaw",
    "nameDe": "Waghalsiger Gesetzloser",
    "nameEn": "Daring Outlaw",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Grace +1"
      },
      {
        "type": "custom",
        "desc": "Sneak attack +2d6"
      }
    ],
    "benefitDe": "Deine Stufen als Schurke (Rogue) und Haudegen (Swashbuckler) addieren sich zur Ermittlung deines Sneak Attack Schadens und deines Ausweichbonus (Grace).",
    "benefitRaw": "Your rogue and swashbuckler levels stack for the purpose of determining your sneak attack extra damage and your grace class feature.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Schurke und Haudegen stufenweises Stacking für Sneak Attack und Grace"
  }
};
