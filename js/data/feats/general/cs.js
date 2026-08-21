export const GENERAL_FEATS_REGISTRY_CS = {
  "lucky_start": {
    "id": "lucky_start",
    "nameDe": "Glücksstart",
    "nameEn": "Lucky Start",
    "category": "general",
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Character level 1st only"
      }
    ],
    "benefitDe": "Gib 1 Glückspunkt aus, um einen Initiativewurf zu wiederholen.",
    "benefitRaw": "You can expend one luck reroll as an immediate action to reroll your initiative check.",
    "normalRaw": "",
    "specialRaw": "You gain 1 luck reroll per day for taking this feat.",
    "appEffect": "Ermöglicht Initiative-Reroll für 1 Glückspunkt"
  },
  "survivors_luck": {
    "id": "survivors_luck",
    "nameDe": "Überlebensglück",
    "nameEn": "Survivor's Luck",
    "category": "general",
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Any luck feat"
      }
    ],
    "benefitDe": "Gib 1 Glückspunkt aus, um einen soeben misslungenen Rettungswurf zu wiederholen.",
    "benefitRaw": "You can expend one luck reroll as an immediate action to reroll a saving throw you have just failed.",
    "normalRaw": "",
    "specialRaw": "You gain 1 luck reroll per day for taking this feat.",
    "appEffect": "Ermöglicht Rettungswurf-Reroll für 1 Glückspunkt"
  }
};
