/**
 * @module    feats-magic-ca
 * @summary   Statische Datenbank für D&D 3.5e Magietalente aus dem Complete Adventurer (CA).
 * @exports   MAGIC_FEATS_REGISTRY_CA
 */

export const MAGIC_FEATS_REGISTRY_CA = {
  "ascetic_mage": {
    "id": "ascetic_mage",
    "nameDe": "Asketischer Magier",
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
    "benefitDe": "Du darfst als Mönch deinen Charisma-Modifikator anstelle deines Weisheits-Modifikators als Bonus auf die Rüstungsklasse (AC) verwenden. Zudem kannst du spontane Zauberplätze opfern, um für 1 Runde einen Angriffs- und Schadensbonus in Höhe des Zaubergrads zu erhalten. Freies Multiclassing zwischen Mönch und Hexenmeister (Sorcerer).",
    "benefitRaw": "You can use your Charisma modifier instead of your Wisdom modifier to determine your monk AC bonus. As a swift action, you can sacrifice a spell slot to gain a bonus on attack and damage rolls equal to the spell level for 1 round. You can freely multiclass between Monk and Sorcerer.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Charisma-Mod für Mönchs-RK und Zauber-Opferung für Angriffs-/Schadensboni"
  },
  "razing_strike": {
    "id": "razing_strike",
    "nameDe": "Schleifender Schlag",
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
    "benefitDe": "Du kannst einen arkanen Zauberplatz opfern, um Sneak Attacks gegen Konstrukte und Untote auszuführen. Du erhältst einen Angriffsbonus gleich dem Zaubergrad und +1d6 Zusatzschaden pro Zaubergrad.",
    "benefitRaw": "You can sacrifice a spell slot to deliver sneak attacks against undead or constructs. You gain an attack bonus equal to the spell level and deal +1d6 extra damage per spell level.",
    "normalRaw": "Constructs and undead are immune to sneak attacks.",
    "specialRaw": "",
    "appEffect": "Opfere Zauberplatz für Sneak Attack gegen Untote & Konstrukte"
  },
  "extraordinary_concentration": {
    "id": "extraordinary_concentration",
    "nameDe": "Außergewöhnliche Konzentration",
    "nameEn": "Extraordinary Concentration",
    "category": "magic",
    "prereqs": [
      {
        "type": "skill",
        "skill": "concentration",
        "ranks": 15
      }
    ],
    "benefitDe": "Halte die Konzentration auf einen Zauber per Konzentrationswurf als Bewegungsaktion (SG 15 + Grad) oder schnelle Aktion (SG 25 + Grad) aufrecht.",
    "benefitRaw": "Make a Concentration check to maintain concentration on a spell as a move action (DC 15 + spell level) or swift action (DC 25 + spell level).",
    "normalRaw": "Maintaining concentration is a standard action.",
    "specialRaw": "",
    "appEffect": "Zauberkonzentration als Bewegungs- oder Schnelle Aktion (SG-Wurf)",
    "source": "ca"
  },
  "extraordinary_spell_aim": {
    "id": "extraordinary_spell_aim",
    "nameDe": "Außergewöhnliches Zauberzielen",
    "nameEn": "Extraordinary Spell Aim",
    "category": "magic",
    "prereqs": [
      {
        "type": "skill",
        "skill": "spellcraft",
        "ranks": 15
      }
    ],
    "benefitDe": "Schließe mit einem erfolgreichen Zauberkunde-Wurf (SG 25 + Zaubergrad) eine Kreatur im Wirkungsbereich eines Flächenzaubers vom Zaubereffekt aus.",
    "benefitRaw": "You can shape a spell’s area to exclude one creature inside the area (Spellcraft DC 25 + spell level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "1 Kreatur im Wirkungsbereich von Flächenzauber verschonen (SG-Wurf)",
    "source": "ca"
  },
  "mobile_spellcasting": {
    "id": "mobile_spellcasting",
    "nameDe": "Mobiles Zaubern",
    "nameEn": "Mobile Spellcasting",
    "category": "magic",
    "prereqs": [
      {
        "type": "skill",
        "skill": "concentration",
        "ranks": 8
      }
    ],
    "benefitDe": "Zaubere und bewege dich in derselben Standard-Aktion durch einen Konzentrationswurf (SG 20 + Zaubergrad).",
    "benefitRaw": "Make a special Concentration check (DC 20 + spell level) to move up to your speed and cast a spell as a standard action.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Gleichzeitig Zaubern und Bewegen als Standard-Aktion (SG-Wurf)",
    "source": "ca"
  }
};
