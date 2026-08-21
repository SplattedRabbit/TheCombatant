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
  }
};
