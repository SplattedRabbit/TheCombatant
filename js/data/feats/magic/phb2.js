/**
 * @module    phb2
 * @summary   Standardized D&D 3.5e RAW English feats registry.
 * @exports   MAGIC_FEATS_REGISTRY_PHB2
 */

export const MAGIC_FEATS_REGISTRY_PHB2 = {
  "arcane_thesis": {
    "id": "arcane_thesis",
    "nameDe": "Arcane Thesis",
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
    "benefitDe": "Select one spell. You cast this spell at +2 caster level. Any metamagic feat applied to this spell has its spell slot adjustment reduced by 1 (minimum +0).",
    "benefitRaw": "Select one spell. You cast this spell at +2 caster level. Any metamagic feat applied to this spell has its spell slot adjustment reduced by 1 (minimum +0).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Select one spell",
    "name": "Arcane Thesis",
    "benefit": "Select one spell. You cast this spell at +2 caster level. Any metamagic feat applied to this spell has its spell slot adjustment reduced by 1 (minimum +0).",
    "benefitEn": "Select one spell. You cast this spell at +2 caster level. Any metamagic feat applied to this spell has its spell slot adjustment reduced by 1 (minimum +0)."
  },
  "arcane_consumption": {
    "id": "arcane_consumption",
    "nameDe": "Arcane Consumption",
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
    "benefitDe": "Once per day as a swift action, you can grant the next spell you cast a +4 bonus on its save DC. You must cast this spell before the end of your turn. You then become fatigued for 12 hours.",
    "benefitRaw": "Once per day as a swift action, you can grant the next spell you cast a +4 bonus on its save DC. You must cast this spell before the end of your turn. You then become fatigued for 12 hours.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Once per day as a swift action, you can grant the next spell you cast a +4 bonus on its save DC",
    "name": "Arcane Consumption",
    "benefit": "Once per day as a swift action, you can grant the next spell you cast a +4 bonus on its save DC. You must cast this spell before the end of your turn. You then become fatigued for 12 hours.",
    "benefitEn": "Once per day as a swift action, you can grant the next spell you cast a +4 bonus on its save DC. You must cast this spell before the end of your turn. You then become fatigued for 12 hours."
  },
  "fiery_fist": {
    "id": "fiery_fist",
    "nameDe": "Fiery Fist",
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
    "benefitDe": "As a swift action, you can expend one of your daily uses of Stunning Fist to cloak your hands in fire. Your unarmed strikes deal an extra 1d6 points of fire damage until the start of your next turn.",
    "benefitRaw": "As a swift action, you can expend one of your daily uses of Stunning Fist to cloak your hands in fire. Your unarmed strikes deal an extra 1d6 points of fire damage until the start of your next turn.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "As a swift action, you can expend one of your daily uses of Stunning Fist to cloak your hands in fire",
    "name": "Fiery Fist",
    "benefit": "As a swift action, you can expend one of your daily uses of Stunning Fist to cloak your hands in fire. Your unarmed strikes deal an extra 1d6 points of fire damage until the start of your next turn.",
    "benefitEn": "As a swift action, you can expend one of your daily uses of Stunning Fist to cloak your hands in fire. Your unarmed strikes deal an extra 1d6 points of fire damage until the start of your next turn."
  },
  "blistering_spell": {
    "id": "blistering_spell",
    "nameDe": "Blistering Spell",
    "nameEn": "Blistering Spell",
    "category": "metamagic",
    "source": "phb2",
    "prereqs": [],
    "benefitDe": "Metamagic (+1 slot level): A fire spell deals +2 fire damage per spell level and imposes a -2 penalty on attacks and saves.",
    "benefitRaw": "Metamagic (+1 slot level): A fire spell deals +2 fire damage per spell level and imposes a -2 penalty on attacks and saves.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Metamagic (+1 slot level): A fire spell deals +2 fire damage per spell level and imposes a -2 penalty on attacks and saves.",
    "name": "Blistering Spell",
    "benefit": "Metamagic (+1 slot level): A fire spell deals +2 fire damage per spell level and imposes a -2 penalty on attacks and saves.",
    "benefitEn": "Metamagic (+1 slot level): A fire spell deals +2 fire damage per spell level and imposes a -2 penalty on attacks and saves."
  },
  "flash_frost_spell": {
    "id": "flash_frost_spell",
    "nameDe": "Flash Frost Spell",
    "nameEn": "Flash Frost Spell",
    "category": "metamagic",
    "source": "phb2",
    "prereqs": [],
    "benefitDe": "Metamagic (+1 slot level): A cold spell deals +2 cold damage per spell level and coats the area in slippery ice.",
    "benefitRaw": "Metamagic (+1 slot level): A cold spell deals +2 cold damage per spell level and coats the area in slippery ice.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Metamagic (+1 slot level): A cold spell deals +2 cold damage per spell level and coats the area in slippery ice.",
    "name": "Flash Frost Spell",
    "benefit": "Metamagic (+1 slot level): A cold spell deals +2 cold damage per spell level and coats the area in slippery ice.",
    "benefitEn": "Metamagic (+1 slot level): A cold spell deals +2 cold damage per spell level and coats the area in slippery ice."
  },
  "earthbound_spell": {
    "id": "earthbound_spell",
    "nameDe": "Earthbound Spell",
    "nameEn": "Earthbound Spell",
    "category": "metamagic",
    "source": "phb2",
    "prereqs": [],
    "benefitDe": "Metamagic (+1 slot level): Place a spell on the ground that triggers when a creature enters its space.",
    "benefitRaw": "Metamagic (+1 slot level): Place a spell on the ground that triggers when a creature enters its space.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Metamagic (+1 slot level): Place a spell on the ground that triggers when a creature enters its space.",
    "name": "Earthbound Spell",
    "benefit": "Metamagic (+1 slot level): Place a spell on the ground that triggers when a creature enters its space.",
    "benefitEn": "Metamagic (+1 slot level): Place a spell on the ground that triggers when a creature enters its space."
  },
  "smiting_spell": {
    "id": "smiting_spell",
    "nameDe": "Smiting Spell",
    "nameEn": "Smiting Spell",
    "category": "metamagic",
    "source": "phb2",
    "prereqs": [],
    "benefitDe": "Metamagic (+1 slot level): Channel a touch spell into a melee weapon, discharging it on your next successful strike.",
    "benefitRaw": "Metamagic (+1 slot level): Channel a touch spell into a melee weapon, discharging it on your next successful strike.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Metamagic (+1 slot level): Channel a touch spell into a melee weapon, discharging it on your next successful strike.",
    "name": "Smiting Spell",
    "benefit": "Metamagic (+1 slot level): Channel a touch spell into a melee weapon, discharging it on your next successful strike.",
    "benefitEn": "Metamagic (+1 slot level): Channel a touch spell into a melee weapon, discharging it on your next successful strike."
  },
  "imbued_summoning": {
    "id": "imbued_summoning",
    "nameDe": "Imbued Summoning",
    "nameEn": "Imbued Summoning",
    "category": "metamagic",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "augment_summoning"
      }
    ],
    "parent": "augment_summoning",
    "benefitDe": "Metamagic (+1 slot level): Automatically cast a 3rd-level or lower buff spell on a creature as you summon it.",
    "benefitRaw": "Metamagic (+1 slot level): Automatically cast a 3rd-level or lower buff spell on a creature as you summon it.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Metamagic (+1 slot level): Automatically cast a 3rd-level or lower buff spell on a creature as you summon it.",
    "name": "Imbued Summoning",
    "benefit": "Metamagic (+1 slot level): Automatically cast a 3rd-level or lower buff spell on a creature as you summon it.",
    "benefitEn": "Metamagic (+1 slot level): Automatically cast a 3rd-level or lower buff spell on a creature as you summon it."
  },
  "elven_spell_lore": {
    "id": "elven_spell_lore",
    "nameDe": "Elven Spell Lore",
    "nameEn": "Elven Spell Lore",
    "category": "magic",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "knowledge_arcana",
        "ranks": 12
      }
    ],
    "benefitDe": "+2 bonus on caster level checks to dispel, and you can alter energy types of prepared spells.",
    "benefitRaw": "+2 bonus on caster level checks to dispel, and you can alter energy types of prepared spells.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 bonus on caster level checks to dispel, and you can alter energy types of prepared spells.",
    "name": "Elven Spell Lore",
    "benefit": "+2 bonus on caster level checks to dispel, and you can alter energy types of prepared spells.",
    "benefitEn": "+2 bonus on caster level checks to dispel, and you can alter energy types of prepared spells."
  },
  "dampen_spell": {
    "id": "dampen_spell",
    "nameDe": "Dampen Spell",
    "nameEn": "Dampen Spell",
    "category": "magic",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_counterspell"
      }
    ],
    "parent": "improved_counterspell",
    "benefitDe": "Immediate action: expend a spell slot to reduce a foe's spell DC by the level of the slot expended.",
    "benefitRaw": "Immediate action: expend a spell slot to reduce a foe's spell DC by the level of the slot expended.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Immediate action: expend a spell slot to reduce a foe's spell DC by the level of the slot expended.",
    "name": "Dampen Spell",
    "benefit": "Immediate action: expend a spell slot to reduce a foe's spell DC by the level of the slot expended.",
    "benefitEn": "Immediate action: expend a spell slot to reduce a foe's spell DC by the level of the slot expended."
  },
  "spell_linked_familiar": {
    "id": "spell_linked_familiar",
    "nameDe": "Spell-Linked Familiar",
    "nameEn": "Spell-Linked Familiar",
    "category": "magic",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Familiar, caster level 9th"
      }
    ],
    "benefitDe": "Cast spells of up to 2nd level through your familiar up to a range of 1 mile.",
    "benefitRaw": "Cast spells of up to 2nd level through your familiar up to a range of 1 mile.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Cast spells of up to 2nd level through your familiar up to a range of 1 mile.",
    "name": "Spell-Linked Familiar",
    "benefit": "Cast spells of up to 2nd level through your familiar up to a range of 1 mile.",
    "benefitEn": "Cast spells of up to 2nd level through your familiar up to a range of 1 mile."
  }
};
