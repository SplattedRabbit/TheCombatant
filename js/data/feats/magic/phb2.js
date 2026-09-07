/**
 * @module    feats-magic-phb2
 * @summary   Statische Datenbank für D&D 3.5e Magietalente aus dem Player's Handbook II (PHB2).
 * @exports   MAGIC_FEATS_REGISTRY_PHB2
 */

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
  },
  "blistering_spell": {
    "id": "blistering_spell",
    "nameDe": "Blasenschlagender Zauber",
    "nameEn": "Blistering Spell",
    "category": "metamagic",
    "source": "phb2",
    "prereqs": [],
    "benefitDe": "Metamagie (+1 Zaubergrad): Ein Feuerzauber fügt Zielen zusätzlich +2 Feuerschaden pro Zaubergrad zu und belegt sie mit -2 auf Angriff und Rettungswürfe.",
    "benefitRaw": "Metamagic (+1 slot level): A fire spell deals +2 fire damage per spell level and imposes a -2 penalty on attacks and saves.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 Slot: +2 Feuerschaden/Grad und -2 Angriff/Saves für Ziel"
  },
  "flash_frost_spell": {
    "id": "flash_frost_spell",
    "nameDe": "Frostblitz-Zauber",
    "nameEn": "Flash Frost Spell",
    "category": "metamagic",
    "source": "phb2",
    "prereqs": [],
    "benefitDe": "Metamagie (+1 Zaubergrad): Ein Kältezauber fügt allen Kreaturen im Bereich zusätzlich +2 Kälteschaden pro Zaubergrad zu und überzieht den Boden mit rutschigem Glatteis.",
    "benefitRaw": "Metamagic (+1 slot level): A cold spell deals +2 cold damage per spell level and coats the area in slippery ice.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 Slot: +2 Kälteschaden/Grad und eisglatter Untergrund"
  },
  "earthbound_spell": {
    "id": "earthbound_spell",
    "nameDe": "Erdgebundener Zauber",
    "nameEn": "Earthbound Spell",
    "category": "metamagic",
    "source": "phb2",
    "prereqs": [],
    "benefitDe": "Metamagie (+1 Zaubergrad): Platziere einen Zauber auf dem Boden als unsichtbare magische Falle; löst aus, wenn eine Kreatur das Feld betritt.",
    "benefitRaw": "Metamagic (+1 slot level): Place a spell on the ground that triggers when a creature enters its space.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 Slot: Zauber als Bodenfalle platzieren"
  },
  "smiting_spell": {
    "id": "smiting_spell",
    "nameDe": "Strafender Zauber",
    "nameEn": "Smiting Spell",
    "category": "metamagic",
    "source": "phb2",
    "prereqs": [],
    "benefitDe": "Metamagie (+1 Zaubergrad): Wirke einen Berührungszauber in deine Nahkampfwaffe; der Zauber entlädt sich bei deinem nächsten erfolgreichen Waffentreffer.",
    "benefitRaw": "Metamagic (+1 slot level): Channel a touch spell into a melee weapon, discharging it on your next successful strike.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 Slot: Berührungszauber in Waffe leiten für nächsten Treffer"
  },
  "imbued_summoning": {
    "id": "imbued_summoning",
    "nameDe": "Beseelte Beschwörung",
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
    "benefitDe": "Metamagie (+1 Zaubergrad): Wirke gleichzeitig einen Verstärkungszauber (Grad 3 oder niedriger) auf eine Kreatur, die du gerade beschwörst.",
    "benefitRaw": "Metamagic (+1 slot level): Automatically cast a 3rd-level or lower buff spell on a creature as you summon it.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 Slot: Beschworene Kreatur erhält sofort Buff-Zauber"
  },
  "elven_spell_lore": {
    "id": "elven_spell_lore",
    "nameDe": "Elfische Zauberkunde",
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
    "benefitDe": "Erhalte +2 auf Zauberstufe beim Bannen (Dispel). Du kannst den Energietyp eines Zaubers bei Vorbereitung/Wahl ändern.",
    "benefitRaw": "+2 bonus on caster level checks to dispel, and you can alter energy types of prepared spells.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Bannwürfe & Energietyp von Zaubern anpassen"
  },
  "dampen_spell": {
    "id": "dampen_spell",
    "nameDe": "Zauber dämpfen",
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
    "benefitDe": "Sofortige Aktion: Opfere einen Zauberslot, um den Rettungswurf-SG eines gegnerischen Zaubers für alle Ziele um den Grad des geopferten Slots zu senken.",
    "benefitRaw": "Immediate action: expend a spell slot to reduce a foe's spell DC by the level of the slot expended.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Rettungswurf-SG von gegnerischem Zauber per Slot-Opferung senken"
  },
  "spell_linked_familiar": {
    "id": "spell_linked_familiar",
    "nameDe": "Zauberverbundener Vertrauter",
    "nameEn": "Spell-Linked Familiar",
    "category": "magic",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Familiar, caster level 9th"
      }
    ],
    "benefitDe": "Du kannst Zauber bis zu Grad 2 durch deinen Vertrauten bis zu einer Entfernung von 1 Meile wirken.",
    "benefitRaw": "Cast spells of up to 2nd level through your familiar up to a range of 1 mile.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Zauber bis Grad 2 über 1 Meile Distanz durch Vertrauten wirken"
  }
};
