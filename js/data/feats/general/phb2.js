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
  }
};
