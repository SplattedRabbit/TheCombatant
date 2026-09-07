/**
 * @module    ca
 * @summary   Standardized D&D 3.5e RAW English feats registry.
 * @exports   MAGIC_FEATS_REGISTRY_CA
 */

export const MAGIC_FEATS_REGISTRY_CA = {
  "ascetic_mage": {
    "id": "ascetic_mage",
    "nameDe": "Ascetic Mage",
    "nameEn": "Ascetic Mage",
    "category": "magic",
    "source": "ca",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      },
      {
        "type": "custom",
        "desc": "Spontaneous 2nd level arcane spells"
      }
    ],
    "benefitDe": "You can use your Charisma modifier instead of your Wisdom modifier to determine your monk AC bonus. As a swift action, you can sacrifice a spell slot to gain a bonus on attack and damage rolls equal to the spell level for 1 round. You can freely multiclass between Monk and Sorcerer.",
    "benefitRaw": "You can use your Charisma modifier instead of your Wisdom modifier to determine your monk AC bonus. As a swift action, you can sacrifice a spell slot to gain a bonus on attack and damage rolls equal to the spell level for 1 round. You can freely multiclass between Monk and Sorcerer.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Use your Charisma modifier instead of your Wisdom modifier to determine your monk AC bonus",
    "name": "Ascetic Mage",
    "benefit": "You can use your Charisma modifier instead of your Wisdom modifier to determine your monk AC bonus. As a swift action, you can sacrifice a spell slot to gain a bonus on attack and damage rolls equal to the spell level for 1 round. You can freely multiclass between Monk and Sorcerer.",
    "benefitEn": "You can use your Charisma modifier instead of your Wisdom modifier to determine your monk AC bonus. As a swift action, you can sacrifice a spell slot to gain a bonus on attack and damage rolls equal to the spell level for 1 round. You can freely multiclass between Monk and Sorcerer."
  },
  "razing_strike": {
    "id": "razing_strike",
    "nameDe": "Razing Strike",
    "nameEn": "Razing Strike",
    "category": "magic",
    "source": "ca",
    "prereqs": [
      {
        "type": "sneak_attack",
        "value": 1
      },
      {
        "type": "skill",
        "name": "knowledge_religion",
        "value": 8
      },
      {
        "type": "custom",
        "desc": "Ability to cast 3rd-level arcane spells"
      }
    ],
    "benefitDe": "You can sacrifice a spell slot to deliver sneak attacks against undead or constructs. You gain an attack bonus equal to the spell level and deal +1d6 extra damage per spell level.",
    "benefitRaw": "You can sacrifice a spell slot to deliver sneak attacks against undead or constructs. You gain an attack bonus equal to the spell level and deal +1d6 extra damage per spell level.",
    "normalRaw": "Constructs and undead are immune to sneak attacks.",
    "specialRaw": "",
    "appEffect": "Sacrifice a spell slot to deliver sneak attacks against undead or constructs",
    "name": "Razing Strike",
    "benefit": "You can sacrifice a spell slot to deliver sneak attacks against undead or constructs. You gain an attack bonus equal to the spell level and deal +1d6 extra damage per spell level.",
    "benefitEn": "You can sacrifice a spell slot to deliver sneak attacks against undead or constructs. You gain an attack bonus equal to the spell level and deal +1d6 extra damage per spell level."
  },
  "extraordinary_concentration": {
    "id": "extraordinary_concentration",
    "nameDe": "Extraordinary Concentration",
    "nameEn": "Extraordinary Concentration",
    "category": "magic",
    "prereqs": [
      {
        "type": "skill",
        "skill": "concentration",
        "ranks": 15
      }
    ],
    "benefitDe": "Make a Concentration check to maintain concentration on a spell as a move action (DC 15 + spell level) or swift action (DC 25 + spell level).",
    "benefitRaw": "Make a Concentration check to maintain concentration on a spell as a move action (DC 15 + spell level) or swift action (DC 25 + spell level).",
    "normalRaw": "Maintaining concentration is a standard action.",
    "specialRaw": "",
    "appEffect": "Make a Concentration check to maintain concentration on a spell as a move action (DC 15 + spell level) or swif...",
    "source": "ca",
    "name": "Extraordinary Concentration",
    "benefit": "Make a Concentration check to maintain concentration on a spell as a move action (DC 15 + spell level) or swift action (DC 25 + spell level).",
    "benefitEn": "Make a Concentration check to maintain concentration on a spell as a move action (DC 15 + spell level) or swift action (DC 25 + spell level)."
  },
  "extraordinary_spell_aim": {
    "id": "extraordinary_spell_aim",
    "nameDe": "Extraordinary Spell Aim",
    "nameEn": "Extraordinary Spell Aim",
    "category": "magic",
    "prereqs": [
      {
        "type": "skill",
        "skill": "spellcraft",
        "ranks": 15
      }
    ],
    "benefitDe": "You can shape a spell’s area to exclude one creature inside the area (Spellcraft DC 25 + spell level).",
    "benefitRaw": "You can shape a spell’s area to exclude one creature inside the area (Spellcraft DC 25 + spell level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Shape a spell’s area to exclude one creature inside the area (Spellcraft DC 25 + spell level).",
    "source": "ca",
    "name": "Extraordinary Spell Aim",
    "benefit": "You can shape a spell’s area to exclude one creature inside the area (Spellcraft DC 25 + spell level).",
    "benefitEn": "You can shape a spell’s area to exclude one creature inside the area (Spellcraft DC 25 + spell level)."
  },
  "mobile_spellcasting": {
    "id": "mobile_spellcasting",
    "nameDe": "Mobile Spellcasting",
    "nameEn": "Mobile Spellcasting",
    "category": "magic",
    "prereqs": [
      {
        "type": "skill",
        "skill": "concentration",
        "ranks": 8
      }
    ],
    "benefitDe": "Make a special Concentration check (DC 20 + spell level) to move up to your speed and cast a spell as a standard action.",
    "benefitRaw": "Make a special Concentration check (DC 20 + spell level) to move up to your speed and cast a spell as a standard action.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Make a special Concentration check (DC 20 + spell level) to move up to your speed and cast a spell as a standard action.",
    "source": "ca",
    "name": "Mobile Spellcasting",
    "benefit": "Make a special Concentration check (DC 20 + spell level) to move up to your speed and cast a spell as a standard action.",
    "benefitEn": "Make a special Concentration check (DC 20 + spell level) to move up to your speed and cast a spell as a standard action."
  }
};
