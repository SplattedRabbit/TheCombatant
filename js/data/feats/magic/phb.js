/**
 * @module    feats-magic-phb
 * @summary   Statische Datenbank für D&D 3.5e Magietalente aus dem Player's Handbook (PHB).
 * @exports   MAGIC_FEATS_REGISTRY_PHB
 */

export const MAGIC_FEATS_REGISTRY_PHB = {
  "brew_potion": {
    "id": "brew_potion",
    "nameDe": "Tränke brauen",
    "nameEn": "Brew Potion",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 3
      }
    ],
    "benefitDe": "Erschaffe magische Tränke (Zaubergrad bis 3).",
    "benefitRaw": "Create magic potions of spells level 3 or lower.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Tränke brauen freigeschaltet (ab Caster-Lvl 3)",
    "source": "phb"
  },
  "scribe_scroll": {
    "id": "scribe_scroll",
    "nameDe": "Schriftrollen schreiben",
    "nameEn": "Scribe Scroll",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 1
      }
    ],
    "benefitDe": "Erschaffe magische Schriftrollen.",
    "benefitRaw": "Create magic scrolls.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Schriftrollen schreiben freigeschaltet",
    "source": "phb"
  },
  "craft_wand": {
    "id": "craft_wand",
    "nameDe": "Zauberstäbe herstellen",
    "nameEn": "Craft Wand",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 5
      }
    ],
    "benefitDe": "Erschaffe magische Zauberstäbe (Zaubergrad bis 4).",
    "benefitRaw": "Create magic wands of spells level 4 or lower.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Zauberstäbe herstellen freigeschaltet (ab Caster-Lvl 5)",
    "source": "phb"
  },
  "craft_arms_armor": {
    "id": "craft_arms_armor",
    "nameDe": "Magische Waffen & Rüstungen herstellen",
    "nameEn": "Craft Magic Arms and Armor",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 5
      }
    ],
    "benefitDe": "Erschaffe magische Waffen, Rüstungen und Schilde.",
    "benefitRaw": "Create magic weapons, armor, and shields.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Waffen/Rüstungen herstellen freigeschaltet (ab Caster-Lvl 5)",
    "source": "phb"
  },
  "craft_wondrous": {
    "id": "craft_wondrous",
    "nameDe": "Wundersame Gegenstände erschaffen",
    "nameEn": "Craft Wondrous Item",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 3
      }
    ],
    "benefitDe": "Erschaffe wundersame Gegenstände.",
    "benefitRaw": "Create magic wondrous items.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Wundersame Gegenstände herstellen freigeschaltet (ab Caster-Lvl 3)",
    "source": "phb"
  },
  "craft_rod": {
    "id": "craft_rod",
    "nameDe": "Zepter herstellen",
    "nameEn": "Craft Rod",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 9
      }
    ],
    "benefitDe": "Erschaffe magische Zepter.",
    "benefitRaw": "Create magic rods.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Zepter herstellen freigeschaltet (ab Caster-Lvl 9)",
    "source": "phb"
  },
  "craft_staff": {
    "id": "craft_staff",
    "nameDe": "Stecken herstellen",
    "nameEn": "Craft Staff",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 12
      }
    ],
    "benefitDe": "Erschaffe magische Stecken.",
    "benefitRaw": "Create magic staffs.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Stecken herstellen freigeschaltet (ab Caster-Lvl 12)",
    "source": "phb"
  },
  "forge_ring": {
    "id": "forge_ring",
    "nameDe": "Ringe schmieden",
    "nameEn": "Forge Ring",
    "category": "item_creation",
    "prereqs": [
      {
        "type": "casterLevel",
        "value": 12
      }
    ],
    "benefitDe": "Erschaffe magische Ringe.",
    "benefitRaw": "Create magic rings.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Ringe schmieden freigeschaltet (ab Caster-Lvl 12)",
    "source": "phb"
  },
  "empower_spell": {
    "id": "empower_spell",
    "nameDe": "Zauber verstärken",
    "nameEn": "Empower Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Erhöht variable Zaubereffekte um 50% (+2 Zaubergrade).",
    "benefitRaw": "Increase spell’s variable, numeric effects by 50% (+2 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 Zaubergrade Slot-Erhöhung",
    "source": "phb"
  },
  "enlarge_spell": {
    "id": "enlarge_spell",
    "nameDe": "Zauber ausdehnen",
    "nameEn": "Enlarge Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Verdoppelt die Zauberreichweite (+1 Zaubergrad).",
    "benefitRaw": "Double spell’s range (+1 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 Zaubergrad Slot-Erhöhung",
    "source": "phb"
  },
  "extend_spell": {
    "id": "extend_spell",
    "nameDe": "Zauber verlängern",
    "nameEn": "Extend Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Verdoppelt die Zauberdauer (+1 Zaubergrad).",
    "benefitRaw": "Double spell’s duration (+1 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 Zaubergrad Slot-Erhöhung",
    "source": "phb"
  },
  "heighten_spell": {
    "id": "heighten_spell",
    "nameDe": "Zauber erhöhen",
    "nameEn": "Heighten Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Bereitet Zauber in höherem Slot vor, erhöht Rettungswurf-SG.",
    "benefitRaw": "Cast spells as higher level (slot level used determines DC and target).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Freie Slot-Erhöhung für SG-Steigerung",
    "source": "phb"
  },
  "maximize_spell": {
    "id": "maximize_spell",
    "nameDe": "Zauber maximieren",
    "nameEn": "Maximize Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Maximiert alle variablen Zaubereffekte (+3 Zaubergrade).",
    "benefitRaw": "Maximize spell’s variable, numeric effects (+3 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+3 Zaubergrade Slot-Erhöhung",
    "source": "phb"
  },
  "quicken_spell": {
    "id": "quicken_spell",
    "nameDe": "Zauber beschleunigen",
    "nameEn": "Quicken Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Zaubere als freie Aktion (+4 Zaubergrade).",
    "benefitRaw": "Cast spells as a swift action (+4 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+4 Zaubergrade Slot-Erhöhung",
    "source": "phb"
  },
  "silent_spell": {
    "id": "silent_spell",
    "nameDe": "Stummes Zaubern",
    "nameEn": "Silent Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Zaubere ohne verbale Komponenten (+1 Zaubergrad).",
    "benefitRaw": "Cast spells without verbal components (+1 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 Zaubergrad Slot-Erhöhung",
    "source": "phb"
  },
  "still_spell": {
    "id": "still_spell",
    "nameDe": "Gestenloses Zaubern",
    "nameEn": "Still Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Zaubere ohne gestische Komponenten (+1 Zaubergrad).",
    "benefitRaw": "Cast spells without somatic components (+1 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 Zaubergrad Slot-Erhöhung",
    "source": "phb"
  },
  "widen_spell": {
    "id": "widen_spell",
    "nameDe": "Zauber erweitern",
    "nameEn": "Widen Spell",
    "category": "metamagic",
    "prereqs": [],
    "benefitDe": "Verdoppelt den Wirkungsbereich des Zaubers (+3 Zaubergrade).",
    "benefitRaw": "Double spell’s area (+3 spell slot level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+3 Zaubergrade Slot-Erhöhung",
    "source": "phb"
  },
  "augment_summoning": {
    "id": "augment_summoning",
    "nameDe": "Beschwörung verstärken",
    "nameEn": "Augment Summoning",
    "category": "magic",
    "prereqs": [
      {
        "type": "feat",
        "id": "spell_focus"
      }
    ],
    "parent": "spell_focus",
    "benefitDe": "Jede von dir mit einem Beschwörungszauber herbeigerufene Kreatur erhält +4 auf Stärke und Konstitution.",
    "benefitRaw": "Each creature you conjure with any summon spell gains a +4 enhancement bonus to Strength and Constitution for the duration of the spell that summoned it.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+4 Stärke & +4 Konstitution für beschworene Kreaturen",
    "source": "phb"
  },
  "improved_counterspell": {
    "id": "improved_counterspell",
    "nameDe": "Verbessertes Gegenzaubern",
    "nameEn": "Improved Counterspell",
    "category": "magic",
    "prereqs": [],
    "benefitDe": "Beim Gegenzaubern darfst du jeden Zauber derselben Schule verwenden, der mindestens denselben Zaubergrad besitzt.",
    "benefitRaw": "When counterspelling, you may use a spell of the same school that is one or more levels higher than the target spell.",
    "normalRaw": "Without this feat, you must use the exact same spell, or a specifically designed counter.",
    "specialRaw": "",
    "appEffect": "Gegenzaubern mit Zauber derselben Schule (gleicher oder höherer Grad)",
    "source": "phb"
  }
};
