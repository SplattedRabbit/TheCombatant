export const GENERAL_FEATS_REGISTRY_PHB2 = {
  "companion_spellbond": {
    "id": "companion_spellbond",
    "nameDe": "Tierbegleiter-Zauberband",
    "nameEn": "Companion Spellbond",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Animal companion class feature"
      }
    ],
    "benefitDe": "Teile deine Zauber mit deinem Tierbegleiter auf bis zu 30 Fuß Entfernung (statt standardmäßig 5 Fuß).",
    "benefitRaw": "You can share spells with your animal companion out to a range of 30 feet, rather than the standard 5 feet.",
    "normalRaw": "Shared spells are lost if the companion is more than 5 feet away.",
    "specialRaw": "",
    "appEffect": "Teile Tierbegleiter-Zauber bis zu 30 Fuß Distanz"
  },
  "combat_acrobat": {
    "id": "combat_acrobat",
    "nameDe": "Kampfakrobat",
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
    "benefitDe": "Vermeide es, zu Boden zu stürzen (Prone) durch eine erfolgreiche Balance-Prüfung (DC 15); Tumble durch schwieriges Gelände.",
    "benefitRaw": "If you are tripped or knocked prone, you can make a DC 15 Balance check as an immediate action to remain standing. You can also tumble through difficult terrain without penalty.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Sofortige Balance-Rettung (DC 15) gegen Prone-Status; Tumble im schwierigen Gelände"
  },
  "steadfast_determination": {
    "id": "steadfast_determination",
    "nameDe": "Eiserne Entschlossenheit (Steadfast Determination)",
    "nameEn": "Steadfast Determination",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "endurance"
      }
    ],
    "benefitDe": "Nutze deinen Konstitutions-Modifikator anstelle deines Weisheits-Modifikators für Willens-Rettungswürfe. Du scheiterst bei Zähigkeitswürfen nicht automatisch bei einer gewürfelten 1.",
    "benefitRaw": "You use your Constitution modifier instead of your Wisdom modifier on Will saves. You do not automatically fail Fortitude saves on a roll of 1.",
    "normalRaw": "Wisdom modifies Will saves. A roll of 1 on a Fortitude save is an automatic failure.",
    "specialRaw": "",
    "appEffect": "Konstitutions-Mod für Willens-Rettungswürfe; kein Auto-Fail auf Fortitude 1"
  },
  "telling_blow": {
    "id": "telling_blow",
    "nameDe": "Enthüllender Schlag (Telling Blow)",
    "nameEn": "Telling Blow",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Sneak attack or skirmish ability"
      }
    ],
    "benefitDe": "Jedes Mal, wenn du einen kritischen Treffer erzielst, fügst du deinen Bonus-Schaden durch Sneak Attack oder Skirmish hinzu.",
    "benefitRaw": "You add your sneak attack or skirmish extra damage to any critical hit you score in combat.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Füge Sneak Attack/Skirmish-Schaden bei kritischen Treffern hinzu"
  },
  "leap_of_the_heavens": {
    "id": "leap_of_the_heavens",
    "nameDe": "Himmelssprung",
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
    "benefitDe": "Die DC für Sprungwürfe (Jump) verdoppelt sich nicht, wenn du ohne 20 Fuß Anlauf aus dem Stand springst. Mit Anlauf erhältst du einen Bonus von +5.",
    "benefitRaw": "When making a jump check without a 20-foot running start, the DC is not doubled. If you do have a running start, you gain a +5 competence bonus on the check.",
    "normalRaw": "Standing jumps double the DC.",
    "specialRaw": "",
    "appEffect": "Keine DC-Verdopplung bei Stand-Sprüngen; +5 mit Anlauf"
  }
};
