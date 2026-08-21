export const MAGIC_FEATS_REGISTRY_PHB2 = {
  "arcane_thesis": {
    "id": "arcane_thesis",
    "nameDe": "Arkanes Hauptwerk (Arcane Thesis)",
    "nameEn": "Arcane Thesis",
    "category": "metamagic",
    "source": "phb2",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Knowledge (arcana) 9 ranks"
      },
      {
        "type": "casterLevel",
        "value": 1
      }
    ],
    "hasOption": true,
    "optionType": "spell",
    "benefitDe": "Wähle einen Zauber. Du wirfst ihn mit +2 Caster Level. Jedes angewandte metamagische Talent kostet 1 Zaubergrad weniger (Minimum +0 adjustment).",
    "benefitRaw": "Select one spell. You cast this spell at +2 caster level. Any metamagic feat applied to this spell has its spell slot adjustment reduced by 1 (minimum +0).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 Caster Level für den gewählten Zauber; Metamagic-Kosten um 1 reduziert"
  },
  "arcane_consumption": {
    "id": "arcane_consumption",
    "nameDe": "Arkaner Verschleiß",
    "nameEn": "Arcane Consumption",
    "category": "metamagic",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "toughness"
      },
      {
        "type": "casterLevel",
        "value": 6
      }
    ],
    "benefitDe": "Einmal pro Tag als schnelle Aktion erhält dein nächster Zauber +4 auf den Rettungswurf-DC. Du wirst danach für 12 Stunden erschöpft (fatigued).",
    "benefitRaw": "Once per day as a swift action, you can grant the next spell you cast a +4 bonus on its save DC. You must cast this spell before the end of your turn. You then become fatigued for 12 hours.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+4 Zauber-Rettungswurf DC; danach fatigued für 12 Stunden"
  },
  "fiery_fist": {
    "id": "fiery_fist",
    "nameDe": "Feurige Faust",
    "nameEn": "Fiery Fist",
    "category": "metamagic",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      },
      {
        "type": "feat",
        "id": "stunning_fist"
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
    "benefitDe": "Gib eine Anwendung von Stunning Fist aus, um deinen unbewaffneten Schlägen für 1 Runde +1d6 Feuerschaden hinzuzufügen.",
    "benefitRaw": "As a swift action, you can expend one of your daily uses of Stunning Fist to cloak your hands in fire. Your unarmed strikes deal an extra 1d6 points of fire damage until the start of your next turn.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opfere Stunning Fist für +1d6 Feuerschaden auf unbewaffnete Schläge (1 Runde)"
  }
};
