/**
 * @module    phb
 * @summary   Standardized D&D 3.5e RAW English feats registry.
 * @exports   MAGIC_FEATS_REGISTRY_PHB
 */

export const MAGIC_FEATS_REGISTRY_PHB = {
  "brew_potion": {
    "id": "brew_potion",
    "nameDe": "Brew Potion",
    "nameEn": "Brew Potion",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 3
      }
    ],
    "benefitDe": "Create magic potions of spells level 3 or lower.",
    "benefitRaw": "Create magic potions of spells level 3 or lower.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Brew potions of spells up to 3rd level (Caster level 3rd)",
    "source": "phb",
    "name": "Brew Potion",
    "benefit": "Create magic potions of spells level 3 or lower.",
    "benefitEn": "Create magic potions of spells level 3 or lower."
  },
  "scribe_scroll": {
    "id": "scribe_scroll",
    "nameDe": "Scribe Scroll",
    "nameEn": "Scribe Scroll",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 1
      }
    ],
    "benefitDe": "Create magic scrolls.",
    "benefitRaw": "Create magic scrolls.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Scribe scrolls of any known/prepared spells",
    "source": "phb",
    "name": "Scribe Scroll",
    "benefit": "Create magic scrolls.",
    "benefitEn": "Create magic scrolls."
  },
  "craft_wand": {
    "id": "craft_wand",
    "nameDe": "Craft Wand",
    "nameEn": "Craft Wand",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 5
      }
    ],
    "benefitDe": "Create magic wands of spells level 4 or lower.",
    "benefitRaw": "Create magic wands of spells level 4 or lower.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Craft wands of spells up to 4th level (Caster level 5th)",
    "source": "phb",
    "name": "Craft Wand",
    "benefit": "Create magic wands of spells level 4 or lower.",
    "benefitEn": "Create magic wands of spells level 4 or lower."
  },
  "craft_arms_armor": {
    "id": "craft_arms_armor",
    "nameDe": "Craft Magic Arms and Armor",
    "nameEn": "Craft Magic Arms and Armor",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 5
      }
    ],
    "benefitDe": "Create magic weapons, armor, and shields.",
    "benefitRaw": "Create magic weapons, armor, and shields.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Create magic weapons, armor, and shields.",
    "source": "phb",
    "name": "Craft Magic Arms and Armor",
    "benefit": "Create magic weapons, armor, and shields.",
    "benefitEn": "Create magic weapons, armor, and shields."
  },
  "craft_wondrous": {
    "id": "craft_wondrous",
    "nameDe": "Craft Wondrous Item",
    "nameEn": "Craft Wondrous Item",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 3
      }
    ],
    "benefitDe": "Create magic wondrous items.",
    "benefitRaw": "Create magic wondrous items.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Create magic wondrous items.",
    "source": "phb",
    "name": "Craft Wondrous Item",
    "benefit": "Create magic wondrous items.",
    "benefitEn": "Create magic wondrous items."
  },
  "craft_rod": {
    "id": "craft_rod",
    "nameDe": "Craft Rod",
    "nameEn": "Craft Rod",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 9
      }
    ],
    "benefitDe": "Create magic rods.",
    "benefitRaw": "Create magic rods.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Craft magic rods (Caster level 9th)",
    "source": "phb",
    "name": "Craft Rod",
    "benefit": "Create magic rods.",
    "benefitEn": "Create magic rods."
  },
  "craft_staff": {
    "id": "craft_staff",
    "nameDe": "Craft Staff",
    "nameEn": "Craft Staff",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 12
      }
    ],
    "benefitDe": "Create magic staffs.",
    "benefitRaw": "Create magic staffs.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Craft magic staffs (Caster level 12th)",
    "source": "phb",
    "name": "Craft Staff",
    "benefit": "Create magic staffs.",
    "benefitEn": "Create magic staffs."
  },
  "forge_ring": {
    "id": "forge_ring",
    "nameDe": "Forge Ring",
    "nameEn": "Forge Ring",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 12
      }
    ],
    "benefitDe": "Create magic rings.",
    "benefitRaw": "Create magic rings.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Forge magic rings (Caster level 12th)",
    "source": "phb",
    "name": "Forge Ring",
    "benefit": "Create magic rings.",
    "benefitEn": "Create magic rings."
  },
  "empower_spell": {
    "id": "empower_spell",
    "nameDe": "Empower Spell",
    "nameEn": "Empower Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Increase spell’s variable, numeric effects by 50% (+2 spell slot level).",
    "benefitRaw": "Increase spell’s variable, numeric effects by 50% (+2 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Increase variable numeric spell effects by 50% (+2 spell slot level)",
    "source": "phb",
    "name": "Empower Spell",
    "benefit": "Increase spell’s variable, numeric effects by 50% (+2 spell slot level).",
    "benefitEn": "Increase spell’s variable, numeric effects by 50% (+2 spell slot level)."
  },
  "enlarge_spell": {
    "id": "enlarge_spell",
    "nameDe": "Enlarge Spell",
    "nameEn": "Enlarge Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Double spell’s range (+1 spell slot level).",
    "benefitRaw": "Double spell’s range (+1 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Double spell range (+1 spell slot level)",
    "source": "phb",
    "name": "Enlarge Spell",
    "benefit": "Double spell’s range (+1 spell slot level).",
    "benefitEn": "Double spell’s range (+1 spell slot level)."
  },
  "extend_spell": {
    "id": "extend_spell",
    "nameDe": "Extend Spell",
    "nameEn": "Extend Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Double spell’s duration (+1 spell slot level).",
    "benefitRaw": "Double spell’s duration (+1 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Double spell duration (+1 spell slot level)",
    "source": "phb",
    "name": "Extend Spell",
    "benefit": "Double spell’s duration (+1 spell slot level).",
    "benefitEn": "Double spell’s duration (+1 spell slot level)."
  },
  "heighten_spell": {
    "id": "heighten_spell",
    "nameDe": "Heighten Spell",
    "nameEn": "Heighten Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Cast spells as higher level (slot level used determines DC and target).",
    "benefitRaw": "Cast spells as higher level (slot level used determines DC and target).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Cast spell as higher level for DC and countering (variable slot level)",
    "source": "phb",
    "name": "Heighten Spell",
    "benefit": "Cast spells as higher level (slot level used determines DC and target).",
    "benefitEn": "Cast spells as higher level (slot level used determines DC and target)."
  },
  "maximize_spell": {
    "id": "maximize_spell",
    "nameDe": "Maximize Spell",
    "nameEn": "Maximize Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Maximize spell’s variable, numeric effects (+3 spell slot level).",
    "benefitRaw": "Maximize spell’s variable, numeric effects (+3 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Maximize variable numeric spell effects (+3 spell slot level)",
    "source": "phb",
    "name": "Maximize Spell",
    "benefit": "Maximize spell’s variable, numeric effects (+3 spell slot level).",
    "benefitEn": "Maximize spell’s variable, numeric effects (+3 spell slot level)."
  },
  "quicken_spell": {
    "id": "quicken_spell",
    "nameDe": "Quicken Spell",
    "nameEn": "Quicken Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Cast spells as a swift action (+4 spell slot level).",
    "benefitRaw": "Cast spells as a swift action (+4 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Cast spell as a swift action (+4 spell slot level)",
    "source": "phb",
    "name": "Quicken Spell",
    "benefit": "Cast spells as a swift action (+4 spell slot level).",
    "benefitEn": "Cast spells as a swift action (+4 spell slot level)."
  },
  "silent_spell": {
    "id": "silent_spell",
    "nameDe": "Silent Spell",
    "nameEn": "Silent Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Cast spells without verbal components (+1 spell slot level).",
    "benefitRaw": "Cast spells without verbal components (+1 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Cast spell without verbal component (+1 spell slot level)",
    "source": "phb",
    "name": "Silent Spell",
    "benefit": "Cast spells without verbal components (+1 spell slot level).",
    "benefitEn": "Cast spells without verbal components (+1 spell slot level)."
  },
  "still_spell": {
    "id": "still_spell",
    "nameDe": "Still Spell",
    "nameEn": "Still Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Cast spells without somatic components (+1 spell slot level).",
    "benefitRaw": "Cast spells without somatic components (+1 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Cast spell without somatic component (+1 spell slot level)",
    "source": "phb",
    "name": "Still Spell",
    "benefit": "Cast spells without somatic components (+1 spell slot level).",
    "benefitEn": "Cast spells without somatic components (+1 spell slot level)."
  },
  "widen_spell": {
    "id": "widen_spell",
    "nameDe": "Widen Spell",
    "nameEn": "Widen Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Double spell’s area (+3 spell slot level).",
    "benefitRaw": "Double spell’s area (+3 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Increase area of spell by 100% (+3 spell slot level)",
    "source": "phb",
    "name": "Widen Spell",
    "benefit": "Double spell’s area (+3 spell slot level).",
    "benefitEn": "Double spell’s area (+3 spell slot level)."
  },
  "augment_summoning": {
    "id": "augment_summoning",
    "nameDe": "Augment Summoning",
    "nameEn": "Augment Summoning",
    "category": "magic",
    "prereqs": [
      {
        "type": "feat",
        "id": "spell_focus"
      }
    ],
    "parent": "spell_focus",
    "benefitDe": "Each creature you conjure with any summon spell gains a +4 enhancement bonus to Strength and Constitution for the duration of the spell that summoned it.",
    "benefitRaw": "Each creature you conjure with any summon spell gains a +4 enhancement bonus to Strength and Constitution for the duration of the spell that summoned it.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+4 Strength and +4 Constitution to summoned creatures",
    "source": "phb",
    "name": "Augment Summoning",
    "benefit": "Each creature you conjure with any summon spell gains a +4 enhancement bonus to Strength and Constitution for the duration of the spell that summoned it.",
    "benefitEn": "Each creature you conjure with any summon spell gains a +4 enhancement bonus to Strength and Constitution for the duration of the spell that summoned it."
  },
  "improved_counterspell": {
    "id": "improved_counterspell",
    "nameDe": "Improved Counterspell",
    "nameEn": "Improved Counterspell",
    "category": "magic",
    "prereqs": [],
    "benefitDe": "When counterspelling, you may use a spell of the same school that is one or more levels higher than the target spell.",
    "benefitRaw": "When counterspelling, you may use a spell of the same school that is one or more levels higher than the target spell.",
    "normalRaw": "Without this feat, you must use the exact same spell, or a specifically designed counter.",
    "specialRaw": "",
    "appEffect": "Counterspell using any spell of same school of higher or equal level",
    "source": "phb",
    "name": "Improved Counterspell",
    "benefit": "When counterspelling, you may use a spell of the same school that is one or more levels higher than the target spell.",
    "benefitEn": "When counterspelling, you may use a spell of the same school that is one or more levels higher than the target spell."
  }
};
