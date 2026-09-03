export const MAGIC_FEATS_REGISTRY_CA = {
  "ascetic_mage": {
    "id": "ascetic_mage",
    "nameDe": "Asketischer Magier",
    "nameEn": "Ascetic Mage",
    "category": "magic",
    "source": "ca",
    "prereqs": [
      { "type": "feat", "id": "improved_unarmed_strike" },
      { "type": "custom", "desc": "Spontaneous 2nd level arcane spells" }
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
      { "type": "sneak_attack", "value": 1 },
      { "type": "skill", "name": "knowledge_religion", "value": 8 },
      { "type": "custom", "desc": "Ability to cast 3rd-level arcane spells" }
    ],
    "benefitDe": "Du kannst einen arkanen Zauberplatz opfern, um Sneak Attacks gegen Konstrukte und Untote auszuführen. Du erhältst einen Angriffsbonus gleich dem Zaubergrad und +1d6 Zusatzschaden pro Zaubergrad.",
    "benefitRaw": "You can sacrifice a spell slot to deliver sneak attacks against undead or constructs. You gain an attack bonus equal to the spell level and deal +1d6 extra damage per spell level.",
    "normalRaw": "Constructs and undead are immune to sneak attacks.",
    "specialRaw": "",
    "appEffect": "Opfere Zauberplatz für Sneak Attack gegen Untote & Konstrukte"
  },
  "improved_familiar": {
    "id": "improved_familiar",
    "nameDe": "Verbesserter Vertrauter",
    "nameEn": "Improved Familiar",
    "category": "magic",
    "source": "ca",
    "prereqs": [
      { "type": "casterLevel", "value": 3 },
      { "type": "custom", "desc": "Ability to acquire a familiar" }
    ],
    "benefitDe": "Ermöglicht die Wahl mächtigerer und exotischerer Vertrauter (z. B. Pseudodrache, Quasit, Imp, Schock-Eidechse etc.) entsprechend deiner Stufe und Gesinnung.",
    "benefitRaw": "Allows you to choose a more powerful, exotic familiar from an expanded list based on your caster level and alignment.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Zugriff auf verbesserte, mächtige Vertraute"
  }
};
