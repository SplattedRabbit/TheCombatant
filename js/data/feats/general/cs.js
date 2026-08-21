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
  },
  "advantageous_avoidance": {
    "id": "advantageous_avoidance",
    "nameDe": "Vorteilhafte Vermeidung",
    "nameEn": "Advantageous Avoidance",
    "category": "general",
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Any luck feat"
      }
    ],
    "benefitDe": "Gib 1 Glückspunkt aus, um einen gegnerischen Bestätigungswurf für einen kritischen Treffer gegen dich zu erzwingen, neu gewürfelt zu werden.",
    "benefitRaw": "You can expend one luck reroll as an immediate action to force an opponent to reroll a critical confirmation check against you.",
    "normalRaw": "",
    "specialRaw": "You gain 1 luck reroll per day for taking this feat.",
    "appEffect": "Erzwinge kritischen Treffer Reroll vom Gegner für 1 Glückspunkt"
  },
  "dumb_luck": {
    "id": "dumb_luck",
    "nameDe": "Unverschämtes Glück (Dumb Luck)",
    "nameEn": "Dumb Luck",
    "category": "general",
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Any luck feat"
      }
    ],
    "benefitDe": "Gib 1 Glückspunkt aus, um eine gewürfelte 1 bei einem Rettungswurf zu wiederholen und stattdessen als regulären Reroll zu werten.",
    "benefitRaw": "You can expend one luck reroll to reroll a natural 1 on a saving throw, turning a automatic failure into a successful save check.",
    "normalRaw": "",
    "specialRaw": "You gain 1 luck reroll per day for taking this feat.",
    "appEffect": "Wiederhole natürliche 1 bei Rettungswürfen für 1 Glückspunkt"
  },
  "victors_luck": {
    "id": "victors_luck",
    "nameDe": "Siegerglück",
    "nameEn": "Victor's Luck",
    "category": "general",
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Any luck feat"
      }
    ],
    "benefitDe": "Gib 1 Glückspunkt aus, um einen Bestätigungswurf für einen kritischen Treffer von dir zu wiederholen.",
    "benefitRaw": "You can expend one luck reroll as a free action to reroll a critical confirmation roll you just made.",
    "normalRaw": "",
    "specialRaw": "You gain 1 luck reroll per day for taking this feat.",
    "appEffect": "Wiederhole eigenen kritischen Bestätigungswurf für 1 Glückspunkt"
  }
};
