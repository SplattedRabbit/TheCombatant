/**
 * @module    feats-general-ca
 * @summary   Statische Datenbank für D&D 3.5e allgemeine Talente aus dem Complete Adventurer (CA).
 * @exports   GENERAL_FEATS_REGISTRY_CA
 */

export const GENERAL_FEATS_REGISTRY_CA = {
  "appraise_magic_value": {
    "id": "appraise_magic_value",
    "nameDe": "Magischen Wert schätzen",
    "nameEn": "Appraise Magic Value",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "skill",
        "name": "appraise",
        "value": 5
      },
      {
        "type": "skill",
        "name": "knowledge_arcana",
        "value": 5
      },
      {
        "type": "skill",
        "name": "spellcraft",
        "value": 5
      }
    ],
    "benefitDe": "Du kannst mit einem erfolgreichen Schätzen-Wurf (DC = 10 + Caster Level des Gegenstands) nach 8 Stunden Untersuchung die magischen Eigenschaften eines Gegenstands ermitteln (ohne Identifizieren-Zauber).",
    "benefitRaw": "You can determine the magical properties of a magic item by spending 8 hours examining it and making a successful Appraise check (DC 10 + item caster level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Magische Gegenstände durch 8-Stunden-Untersuchung ohne Zauber identifizieren"
  },
  "ascetic_hunter": {
    "id": "ascetic_hunter",
    "nameDe": "Asketischer Jäger",
    "nameEn": "Ascetic Hunter",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      },
      {
        "type": "custom",
        "desc": "Favored enemy"
      }
    ],
    "benefitDe": "Deine Stufen als Mönch und Waldläufer stacken zur Ermittlung deines waffenlosen Schadens. Wenn du deinen Favored Enemy waffenlos triffst, erhöht sich die Betäubungsschlag-DC (Stunning Fist) um deinen Favored-Enemy-Bonus. Du darfst frei zwischen Mönch und Waldläufer aufsteigen.",
    "benefitRaw": "Your monk and ranger levels stack for the purpose of determining your unarmed strike damage. If you hit your favored enemy with an unarmed strike, you add your favored enemy bonus to the DC of your Stunning Fist. You can freely multiclass between Monk and Ranger.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Mönch & Waldläufer Stacking für waffenlosen Schaden & Stunning Fist DC"
  },
  "ascetic_knight": {
    "id": "ascetic_knight",
    "nameDe": "Asketischer Ritter",
    "nameEn": "Ascetic Knight",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      },
      {
        "type": "custom",
        "desc": "Smite evil"
      }
    ],
    "benefitDe": "Deine Stufen als Mönch und Paladin stacken zur Ermittlung deines waffenlosen Schadens und deines Schadensbonus bei Böses niederstrecken (Smite Evil). Du darfst frei zwischen Mönch und Paladin aufsteigen.",
    "benefitRaw": "Your paladin and monk levels stack for the purpose of determining your unarmed strike damage and your smite evil bonus damage. You can freely multiclass between Paladin and Monk.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Mönch & Paladin Stacking für waffenlosen Schaden & Smite Evil Schaden"
  },
  "ascetic_rogue": {
    "id": "ascetic_rogue",
    "nameDe": "Asketischer Schurke",
    "nameEn": "Ascetic Rogue",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      },
      {
        "type": "sneak_attack",
        "value": 1
      }
    ],
    "benefitDe": "Deine Stufen als Mönch und Schurke stacken zur Ermittlung deines waffenlosen Schadens. Triffst du mit einem Sneak Attack waffenlos und setzt Stunning Fist ein, erhöht sich die Rettungswurf-DC um +2. Du darfst frei zwischen Mönch und Schurke aufsteigen.",
    "benefitRaw": "Your monk and rogue levels stack for the purpose of determining your unarmed strike damage. Delivering a sneak attack with an unarmed strike and Stunning Fist adds +2 to the DC. You can freely multiclass between Monk and Rogue.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Mönch & Schurke Stacking für waffenlosen Schaden & +2 Stunning Fist DC bei Sneak Attack"
  },
  "combat_intuition": {
    "id": "combat_intuition",
    "nameDe": "Kampf-Intuition",
    "nameEn": "Combat Intuition",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "skill",
        "name": "sense_motive",
        "value": 4
      },
      {
        "type": "bab",
        "value": 5
      }
    ],
    "benefitDe": "Du kannst Motiv erkennen (Sense Motive) als freie Aktion im Kampf einsetzen, um den relativen Gefährlichkeitsgrad eines Gegners einzuschätzen. Zudem erhältst du einen Bonus von +1 auf Initiativewürfe.",
    "benefitRaw": "You can assess an opponent's combat capability using Sense Motive as a free action. You also gain a +1 bonus on initiative checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 Initiative und freie Aktion für Sense Motive Kampfeinschätzung"
  },
  "danger_sense": {
    "id": "danger_sense",
    "nameDe": "Gefahrensinn",
    "nameEn": "Danger Sense",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_initiative"
      }
    ],
    "benefitDe": "Einmal pro Tag kannst du deinen Initiativewurf wiederholen und das bessere Ergebnis verwenden.",
    "benefitRaw": "Once per day, you can reroll an initiative check and take the better of the two rolls.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "1x pro Tag Reroll für Initiativewurf (besseres Ergebnis zählt)"
  },
  "dash": {
    "id": "dash",
    "nameDe": "Spurt",
    "nameEn": "Dash",
    "category": "general",
    "source": "ca",
    "prereqs": [],
    "benefitDe": "Erhöht deine Grundbewegungsrate um +5 Fuß (funktioniert nur, wenn du leichte oder keine Rüstung trägst und höchstens leichte Last hast).",
    "benefitRaw": "If you are wearing light armor or no armor and carrying a light load, your speed increases by 5 feet.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+5 ft Grundbewegungsrate (leichte/keine Rüstung)"
  },
  "devoted_performer": {
    "id": "devoted_performer",
    "nameDe": "Hingebungsvoller Musiker",
    "nameEn": "Devoted Performer",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Bardic music"
      },
      {
        "type": "custom",
        "desc": "Smite evil"
      }
    ],
    "benefitDe": "Deine Stufen als Paladin und Barde addieren sich zur Bestimmung deiner täglichen Anwendungen von Böses niederstrecken (Smite Evil) und Bardenmusik. Du darfst weiterhin als Barde aufsteigen, ohne deine Paladin-Klasse zu verlieren.",
    "benefitRaw": "Your paladin and bard levels stack for the purpose of determining your daily uses of smite evil and bardic music. You can freely multiclass between Paladin and Bard.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Klassen-Stacking für Smite Evil und Bardic Music; freies Multiclassing"
  },
  "devoted_tracker": {
    "id": "devoted_tracker",
    "nameDe": "Hingebungsvoller Fährtenleser",
    "nameEn": "Devoted Tracker",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "feat",
        "id": "track"
      },
      {
        "type": "custom",
        "desc": "Smite evil"
      },
      {
        "type": "custom",
        "desc": "Wild empathy"
      }
    ],
    "benefitDe": "Wenn du sowohl ein Paladin-Reittier als auch einen Waldläufer-Tiergefährten besitzt, kannst du ein einziges Tier als beides bestimmen (erhält die Boni beider Klassen). Stufen als Paladin und Waldläufer stacken für Smite Evil. Freies Multiclassing zwischen beiden Klassen.",
    "benefitRaw": "If you have both a special mount and an animal companion, you can designate a single animal to serve as both. Your paladin and ranger levels stack for determining smite evil extra damage. You can freely multiclass between Paladin and Ranger.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Kombiniertes Reittier/Tiergefährte & Paladin/Waldläufer Smite Evil Stacking"
  },
  "dive_for_cover": {
    "id": "dive_for_cover",
    "nameDe": "In Deckung hechten",
    "nameEn": "Dive for Cover",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Base Reflex save +2"
      }
    ],
    "benefitDe": "Du kannst jeden misslungenen Reflex-Rettungswurf sofort einmal wiederholen, fällst danach jedoch auf den Boden (prone).",
    "benefitRaw": "If you fail a Reflex save, you can immediately attempt the save again. You fall prone as part of this effort.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Sofortiger Reroll für misslungene Reflex-Saves (fällst danach prone)"
  },
  "extra_music": {
    "id": "extra_music",
    "nameDe": "Zusätzliche Bardenmusik",
    "nameEn": "Extra Music",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "Gewährt täglich 4 zusätzliche Anwendungen deiner Bardenmusik.",
    "benefitRaw": "You can use your bardic music four extra times per day.",
    "normalRaw": "",
    "specialRaw": "You can take this feat multiple times. Each time gives +4 daily uses.",
    "appEffect": "+4 tägliche Anwendungen für Bardenmusik"
  },
  "force_of_personality": {
    "id": "force_of_personality",
    "nameDe": "Persönlichkeitsstärke",
    "nameEn": "Force of Personality",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "stat",
        "name": "cha",
        "value": 13
      }
    ],
    "benefitDe": "Nutze deinen Charisma-Modifikator anstelle deines Weisheits-Modifikators für alle Willens-Rettungswürfe gegen geistesbeeinflussende Zauber und Effekte.",
    "benefitRaw": "You use your Charisma modifier instead of your Wisdom modifier on Will saves against mind-affecting spells and abilities.",
    "normalRaw": "Wisdom modifier is normally applied to Will saves.",
    "specialRaw": "",
    "appEffect": "Charisma-Mod für Willens-Rettungswürfe gegen Geistesbeeinflussung"
  },
  "improved_flight": {
    "id": "improved_flight",
    "nameDe": "Verbesserter Flug",
    "nameEn": "Improved Flight",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Fly speed"
      }
    ],
    "benefitDe": "Verbessert deine Manövrierfähigkeit im Flug um eine Stufe (z. B. von Average auf Good).",
    "benefitRaw": "Your maneuverability while flying improves by one grade (from clumsy to poor, poor to average, average to good, or good to perfect).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Flug-Manövrierfähigkeit um eine Stufe verbessert"
  },
  "improved_swimming": {
    "id": "improved_swimming",
    "nameDe": "Verbessertes Schwimmen",
    "nameEn": "Improved Swimming",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "skill",
        "name": "swim",
        "value": 4
      }
    ],
    "benefitDe": "Du schwimmst mit deiner halben Grundbewegungsrate als Move-Action oder mit deiner vollen Bewegungsrate als Full-Round-Action.",
    "benefitRaw": "You can swim at your full base speed as a full-round action or at half speed as a move action.",
    "normalRaw": "Swimming normally allows one-quarter speed as a move action or half speed as a full-round action.",
    "specialRaw": "",
    "appEffect": "Schwimmgeschwindigkeit verdoppelt (1/2 Move, 1/1 Full-Round)"
  },
  "insightful_reflexes": {
    "id": "insightful_reflexes",
    "nameDe": "Scharfsinnige Reflexe",
    "nameEn": "Insightful Reflexes",
    "category": "general",
    "source": "ca",
    "prereqs": [],
    "benefitDe": "Du addierst deinen Intelligenz-Modifikator anstelle deines Geschicklichkeits-Modifikators auf deine Reflex-Rettungswürfe.",
    "benefitRaw": "You add your Intelligence modifier (instead of your Dexterity modifier) to all Reflex saves.",
    "normalRaw": "Dexterity is normally added to Reflex saves.",
    "specialRaw": "",
    "appEffect": "Intelligenz-Modifikator für Reflex-Rettungswürfe"
  },
  "jack_of_all_trades": {
    "id": "jack_of_all_trades",
    "nameDe": "Tausendsassa",
    "nameEn": "Jack of All Trades",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "stat",
        "name": "int",
        "value": 13
      },
      {
        "type": "level",
        "value": 6
      }
    ],
    "benefitDe": "Du darfst alle Fertigkeiten ungelernt (untrained) einsetzen, selbst Fertigkeiten, die normalerweise Ausbildung erfordern (Trained Only).",
    "benefitRaw": "You can use any skill untrained, even those that normally require training.",
    "normalRaw": "Trained-only skills cannot be attempted without at least 1/2 rank.",
    "specialRaw": "",
    "appEffect": "Alle Fertigkeiten können ungelernt (untrained) gewürfelt werden"
  },
  "natural_bond": {
    "id": "natural_bond",
    "nameDe": "Natürliche Bindung",
    "nameEn": "Natural Bond",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Animal companion"
      }
    ],
    "benefitDe": "Erhöht deine effektive Druidenstufe für deinen Tiergefährten um +3 (bis maximal zu deiner gesamten Charakterstufe).",
    "benefitRaw": "Add +3 to your effective druid level for the purpose of determining the bonus Hit Dice, extra abilities, and other benefits of your animal companion (capped at character level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+3 effektive Druidenstufe für Tiergefährten"
  },
  "open_minded": {
    "id": "open_minded",
    "nameDe": "Aufgeschlossen",
    "nameEn": "Open Minded",
    "category": "general",
    "source": "ca",
    "prereqs": [],
    "benefitDe": "Du erhältst sofort 5 zusätzliche Fertigkeitspunkte, die du sofort frei verteilen kannst.",
    "benefitRaw": "You immediately gain 5 extra skill points.",
    "normalRaw": "",
    "specialRaw": "You can take Open Minded multiple times. Each time it grants 5 additional skill points.",
    "appEffect": "+5 zusätzliche Fertigkeitspunkte"
  },
  "subsonics": {
    "id": "subsonics",
    "nameDe": "Subsonik",
    "nameEn": "Subsonics",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Bardic music"
      },
      {
        "type": "skill",
        "name": "perform",
        "value": 10
      }
    ],
    "benefitDe": "Du kannst deine Bardenmusik so leise und unauffällig abspielen, dass Außenstehende sie nicht wahrnehmen, deine Verbündeten aber dennoch die vollen Boni erhalten.",
    "benefitRaw": "You can produce bardic music effects so quietly that they are nearly imperceptible, allowing you to inspire allies without giving away your presence.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Bardenmusik geräuschlos/unbemerkt wirken"
  },
  "versatile_performer": {
    "id": "versatile_performer",
    "nameDe": "Vielseitiger Darsteller",
    "nameEn": "Versatile Performer",
    "category": "general",
    "source": "ca",
    "prereqs": [
      {
        "type": "skill",
        "name": "perform",
        "value": 5
      }
    ],
    "benefitDe": "Du kannst deinen höchsten Darbieten-Fertigkeitswert (Perform) für eine Reihe anderer Darbieten-Kategorien verwenden und zwei Instrumente/Aufführungsarten gleichzeitig kombinieren (+2 Bonus).",
    "benefitRaw": "You can use your highest Perform skill modifier for a number of other Perform categories equal to your Intelligence bonus. You can also combine two types of performance at once for a +2 bonus.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Höchster Perform-Wert gilt für zusätzliche Perform-Kategorien; +2 bei Kombination"
  },
  "tactile_trapsmith": {
    "id": "tactile_trapsmith",
    "nameDe": "Taktiler Fallenbauer",
    "nameEn": "Tactile Trapsmith",
    "category": "general",
    "source": "ca",
    "prereqs": [],
    "benefitDe": "Du darfst deinen Geschicklichkeits-Modifikator anstelle deines Intelligenz-Modifikators für Suchen (Search) und Fallen entschärfen (Disable Device) verwenden. Zudem erhältst du keine Abzüge für Dunkelheit oder Blindheit auf diese Fertigkeiten.",
    "benefitRaw": "You add your Dexterity bonus (rather than your Intelligence bonus) on all Search and Disable Device checks. In addition, you receive no penalty on these checks for darkness or blindness.",
    "normalRaw": "Search and Disable Device checks rely on Intelligence.",
    "specialRaw": "",
    "appEffect": "Geschicklichkeits-Modifikator für Search und Disable Device; keine Abzüge für Dunkelheit/Blindheit"
  },
  "brachiation": {
    "id": "brachiation",
    "nameDe": "Hangeln",
    "nameEn": "Brachiation",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "climb",
        "ranks": 4
      },
      {
        "type": "skill",
        "skill": "jump",
        "ranks": 4
      }
    ],
    "benefitDe": "Du kannst dich in bewaldeten Gebieten mit voller Grundbewegungsrate durch die Baumkronen fortbewegen.",
    "benefitRaw": "You can move through wooded areas at your base land speed, ignoring terrain penalties while at least 20 feet above ground.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Volle Bewegungsrate durch Baumkronen (ab 20 Fuß Höhe)",
    "source": "ca"
  },
  "devoted_inquisitor": {
    "id": "devoted_inquisitor",
    "nameDe": "Hingebungsvoller Inquisitor",
    "nameEn": "Devoted Inquisitor",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Smite evil"
      },
      {
        "type": "special",
        "desc": "Sneak attack"
      }
    ],
    "benefitDe": "Kombiniere 'Böses niederstrecken' und 'Hinterhältiger Angriff' in einem Schlag: Das Ziel muss einen Zähigkeitswurf bestehen oder ist 1 Runde lang benommen (dazed).",
    "benefitRaw": "When you use smite evil and sneak attack together in one strike, the target must make a Fortitude save (DC 10 + 1/2 character level + Cha mod) or be dazed for 1 round.",
    "normalRaw": "",
    "specialRaw": "Paladin and rogue levels stack for determining smite evil damage and multiclassing freely.",
    "appEffect": "Böses niederstrecken + Sneak Attack macht Ziel benommen (Fort-Save)",
    "source": "ca"
  },
  "quick_reconnoiter": {
    "id": "quick_reconnoiter",
    "nameDe": "Schnelles Erkunden",
    "nameEn": "Quick Reconnoiter",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "listen",
        "ranks": 5
      },
      {
        "type": "skill",
        "skill": "spot",
        "ranks": 5
      }
    ],
    "benefitDe": "Führe Lauschen- und Entdecken-Würfe als freie Aktion aus; erhalte +2 Bonus auf Initiative-Würfe.",
    "benefitRaw": "You can make one Spot check and one Listen check each round as a free action. You also gain a +2 bonus on initiative checks.",
    "normalRaw": "Spot and Listen checks are move actions or reactions.",
    "specialRaw": "",
    "appEffect": "Lauschen & Entdecken als freie Aktion + 2 auf Initiative",
    "source": "ca"
  },
  "obscure_lore": {
    "id": "obscure_lore",
    "nameDe": "Obskures Wissen",
    "nameEn": "Obscure Lore",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Bardic music or lore class feature"
      }
    ],
    "benefitDe": "+4 Bonus auf alle Würfe für Bardenwissen oder Legendenkunde.",
    "benefitRaw": "You gain a +4 insight bonus on bardic knowledge or lore checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+4 auf Bardenwissen / Legendenkunde",
    "source": "ca"
  },
  "disguise_spell": {
    "id": "disguise_spell",
    "nameDe": "Zauber tarnen",
    "nameEn": "Disguise Spell",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 9
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "Tarne verbale und gestische Komponenten eines Zaubers nahtlos als Teil deiner Darbietung (Auftreten-Wurf gegen Zauberkunde/Entdecken).",
    "benefitRaw": "You can cast spells unobtrusively as part of your performance, requiring observers to beat your Perform check with Spot or Spellcraft.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Zaubern unauffällig in Darbietung integrieren (Auftreten-Gegenwurf)",
    "source": "ca"
  },
  "green_ear": {
    "id": "green_ear",
    "nameDe": "Grünes Ohr",
    "nameEn": "Green Ear",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 10
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "Deine geistesbeeinflussenden Bardenmusik-Effekte können auch Kreaturen des Typs Pflanze beeinflussen.",
    "benefitRaw": "You can alter any of your mind-affecting bardic music abilities so that they influence plant creatures.",
    "normalRaw": "Plant creatures are immune to mind-affecting effects.",
    "specialRaw": "",
    "appEffect": "Bardenmusik wirkt auch auf Pflanzen",
    "source": "ca"
  },
  "lingering_song": {
    "id": "lingering_song",
    "nameDe": "Nachhallendes Lied",
    "nameEn": "Lingering Song",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "Die Effekte deiner Bardenmusik halten nach dem Ende der Darbietung 1 Minute (10 Runden) statt 5 Runden lang an.",
    "benefitRaw": "Your bardic music abilities that last after your performance stops now last for 1 minute (10 rounds) instead of 5 rounds.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Bardenmusik hält nach Ende 1 Minute (10 Runden) an",
    "source": "ca"
  },
  "chant_of_fortitude": {
    "id": "chant_of_fortitude",
    "nameDe": "Gesang der Standhaftigkeit",
    "nameEn": "Chant of Fortitude",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "concentration",
        "ranks": 8
      },
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 8
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "Verbrauche Bardenmusik: Verbündete bleiben auch bei negativen Trefferpunkten (bis -9) bei Bewusstsein und handlungsfähig.",
    "benefitRaw": "You can expend one daily use of bardic music to keep your allies conscious and able to act when reduced to between -1 and -9 hit points.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Verbündete bleiben bei -1 bis -9 TP bei Bewusstsein",
    "source": "ca"
  },
  "ironskin_chant": {
    "id": "ironskin_chant",
    "nameDe": "Gesang der Eisenhaut",
    "nameEn": "Ironskin Chant",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "concentration",
        "ranks": 12
      },
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 12
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "Verbrauche Bardenmusik als Schnelle Aktion: Erhalte Schadensreduktion 5/— bis zum Beginn deines nächsten Zugs.",
    "benefitRaw": "As a swift action, expend one daily use of bardic music to gain damage reduction 5/— until the start of your next turn.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Schadensreduktion 5/— für 1 Runde per Bardenmusik",
    "source": "ca"
  },
  "lyric_spell": {
    "id": "lyric_spell",
    "nameDe": "Lyrischer Zauber",
    "nameEn": "Lyric Spell",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 9
      },
      {
        "type": "special",
        "desc": "Bardic music"
      },
      {
        "type": "special",
        "desc": "Arcane spellcaster level 6th"
      }
    ],
    "benefitDe": "Verbrauche Bardenmusik, um arkane Zauber zu wirken (1 täglicher Einsatz + Zaubergrad an Musik-Einsätzen statt Zauberplatz).",
    "benefitRaw": "You can expend daily uses of bardic music to cast any prepared or known spell without expending a spell slot (1 use + spell level).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Bardenmusik-Einsätze zum Wirken von Zaubern nutzen",
    "source": "ca"
  },
  "blindsense_feat": {
    "id": "blindsense",
    "nameDe": "Blindsicht",
    "nameEn": "Blindsense",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "listen",
        "ranks": 4
      },
      {
        "type": "special",
        "desc": "Wild shape"
      }
    ],
    "benefitDe": "Verbrauche 1 Gestaltwandel-Einsatz als Schnelle Aktion: Erhalte Blindsicht mit 30 Fuß Reichweite für 1 Minute.",
    "benefitRaw": "Expend one use of wild shape as a swift action to gain blindsense with a range of 30 feet for 1 minute.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Blindsicht 30 ft. für 1 Minute per Gestaltwandel",
    "source": "ca"
  },
  "climb_like_an_ape": {
    "id": "climb_like_an_ape",
    "nameDe": "Klettern wie ein Affe",
    "nameEn": "Climb Like an Ape",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Wild shape"
      }
    ],
    "benefitDe": "Verbrauche 1 Gestaltwandel-Einsatz als Schnelle Aktion: Erhalte Kletter-Bewegungsrate entsprechend deiner halben Landgeschwindigkeit für 1 Minute.",
    "benefitRaw": "Expend one use of wild shape as a swift action to gain a climb speed equal to one-half your base land speed for 1 minute.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Kletter-Bewegungsrate für 1 Minute per Gestaltwandel",
    "source": "ca"
  },
  "cougars_vision": {
    "id": "cougars_vision",
    "nameDe": "Puma-Sicht",
    "nameEn": "Cougar's Vision",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "spot",
        "ranks": 2
      },
      {
        "type": "special",
        "desc": "Wild shape"
      }
    ],
    "benefitDe": "Verbrauche 1 Gestaltwandel-Einsatz als Schnelle Aktion: Erhalte Dämmersicht (Low-Light Vision) für 1 Stunde.",
    "benefitRaw": "Expend one use of wild shape as a swift action to gain low-light vision for 1 hour.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Dämmersicht für 1 Stunde per Gestaltwandel",
    "source": "ca"
  },
  "hawks_vision": {
    "id": "hawks_vision",
    "nameDe": "Falken-Sicht",
    "nameEn": "Hawk's Vision",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "spot",
        "ranks": 4
      },
      {
        "type": "special",
        "desc": "Wild shape"
      }
    ],
    "benefitDe": "Verbrauche 1 Gestaltwandel-Einsatz als Schnelle Aktion: Erhalte +8 auf Entdecken-Würfe und halbiere Entfernungs-Mali für 1 Stunde.",
    "benefitRaw": "Expend one use of wild shape as a swift action to gain a +8 bonus on Spot checks and halve range increment penalties for 1 hour.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+8 auf Entdecken & halbe Entfernungs-Mali per Gestaltwandel",
    "source": "ca"
  },
  "savage_grapple": {
    "id": "savage_grapple",
    "nameDe": "Wildes Ringen",
    "nameEn": "Savage Grapple",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Wild shape"
      },
      {
        "type": "special",
        "desc": "Sneak attack"
      }
    ],
    "benefitDe": "Füge deinen Hinterhältigen Schaden (Sneak Attack) jedem erfolgreichen Ringen-Schaden in Tiergestalt hinzu.",
    "benefitRaw": "While in wild shape, you deal sneak attack damage whenever you deal damage with a successful grapple check.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Sneak Attack bei jedem Ringen-Schaden in Tiergestalt",
    "source": "ca"
  },
  "scent_feat": {
    "id": "scent",
    "nameDe": "Geruchssinn",
    "nameEn": "Scent",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Wild shape"
      }
    ],
    "benefitDe": "Verbrauche 1 Gestaltwandel-Einsatz als Schnelle Aktion: Erhalte Geruchssinn (Scent) für 1 Stunde.",
    "benefitRaw": "Expend one use of wild shape as a swift action to gain the scent extraordinary ability for 1 hour.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Geruchssinn (Scent) für 1 Stunde per Gestaltwandel",
    "source": "ca"
  }
};
