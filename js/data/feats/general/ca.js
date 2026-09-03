export const GENERAL_FEATS_REGISTRY_CA = {
  "appraise_magic_value": {
    "id": "appraise_magic_value",
    "nameDe": "Magischen Wert schätzen",
    "nameEn": "Appraise Magic Value",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "skill", "name": "appraise", "value": 5 },
      { "type": "skill", "name": "knowledge_arcana", "value": 5 },
      { "type": "skill", "name": "spellcraft", "value": 5 }
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
      { "type": "feat", "id": "improved_unarmed_strike" },
      { "type": "custom", "desc": "Favored enemy" }
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
      { "type": "feat", "id": "improved_unarmed_strike" },
      { "type": "custom", "desc": "Smite evil" }
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
      { "type": "feat", "id": "improved_unarmed_strike" },
      { "type": "sneak_attack", "value": 1 }
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
      { "type": "skill", "name": "sense_motive", "value": 4 },
      { "type": "bab", "value": 5 }
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
      { "type": "feat", "id": "improved_initiative" }
    ],
    "benefitDe": "Einmal pro Tag kannst du deinen Initiativewurf wiederholen und das bessere Ergebnis verwenden.",
    "benefitRaw": "Once per day, you can reroll an initiative check and take the better of the two rolls.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "1x pro Tag Reroll für Initiativewurf (besseres Ergebnis zählt)"
  },
  "daring_outlaw": {
    "id": "daring_outlaw",
    "nameDe": "Waghalsiger Gesetzloser",
    "nameEn": "Daring Outlaw",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "custom", "desc": "Grace +1" },
      { "type": "sneak_attack", "value": 2 }
    ],
    "benefitDe": "Deine Stufen als Schurke (Rogue) und Haudegen (Swashbuckler) addieren sich zur Ermittlung deines Sneak Attack Schadens und deines Ausweichbonus (Grace).",
    "benefitRaw": "Your rogue and swashbuckler levels stack for the purpose of determining your sneak attack extra damage and your grace class feature.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Schurke und Haudegen stufenweises Stacking für Sneak Attack und Grace"
  },
  "daring_warrior": {
    "id": "daring_warrior",
    "nameDe": "Waghalsiger Krieger",
    "nameEn": "Daring Warrior",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "custom", "desc": "Grace +1" },
      { "type": "class", "class": "fighter" }
    ],
    "benefitDe": "Deine Stufen als Kämpfer und Haudegen addieren sich zur Bestimmung deines Kämpfer-Stufenlevels für Talent-Voraussetzungen und für den Grace-Bonus.",
    "benefitRaw": "Your fighter and swashbuckler levels stack for the purpose of qualifying for feats with a fighter level requirement, and for your grace class feature.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Kämpfer & Haudegen Stacking für Fighter-Talente und Grace"
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
      { "type": "custom", "desc": "Bardic music" },
      { "type": "custom", "desc": "Smite evil" }
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
      { "type": "feat", "id": "track" },
      { "type": "custom", "desc": "Smite evil" },
      { "type": "custom", "desc": "Wild empathy" }
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
      { "type": "custom", "desc": "Base Reflex save +2" }
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
      { "type": "custom", "desc": "Bardic music" }
    ],
    "benefitDe": "Gewährt täglich 4 zusätzliche Anwendungen deiner Bardenmusik.",
    "benefitRaw": "You can use your bardic music four extra times per day.",
    "normalRaw": "",
    "specialRaw": "You can take this feat multiple times. Each time gives +4 daily uses.",
    "appEffect": "+4 tägliche Anwendungen für Bardenmusik"
  },
  "extra_wild_shape": {
    "id": "extra_wild_shape",
    "nameDe": "Zusätzliche Tiergestalt",
    "nameEn": "Extra Wild Shape",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "custom", "desc": "Wild shape" }
    ],
    "benefitDe": "Gewährt täglich 2 zusätzliche Verwandlungen in Tiergestalt.",
    "benefitRaw": "You can use wild shape two extra times per day.",
    "normalRaw": "",
    "specialRaw": "You can take this feat multiple times. Each time gives +2 daily uses.",
    "appEffect": "+2 tägliche Anwendungen für Tiergestalt (Wild Shape)"
  },
  "fleet_of_foot": {
    "id": "fleet_of_foot",
    "nameDe": "Leichtfüßig",
    "nameEn": "Fleet of Foot",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "dex", "value": 15 },
      { "type": "feat", "id": "run" }
    ],
    "benefitDe": "Wenn du rennst oder einen Sturmangriff (Charge) ausführst, darfst du deine Bewegungsrichtung um bis zu 90 Grad ändern.",
    "benefitRaw": "When running or charging, you can make a single turn of up to 90 degrees during your movement.",
    "normalRaw": "Charging and running require moving in a straight line.",
    "specialRaw": "",
    "appEffect": "Bis zu 90-Grad-Richtungswechsel beim Rennen oder Sturmangriff"
  },
  "flyby_attack": {
    "id": "flyby_attack",
    "nameDe": "Überflugangriff",
    "nameEn": "Flyby Attack",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "custom", "desc": "Fly speed" }
    ],
    "benefitDe": "Wenn du fliegst, kannst du während deiner Flugbewegung eine Standard-Aktion ausführen (z. B. Angreifen oder Zaubern).",
    "benefitRaw": "When flying, the creature can take a standard action at any point during its move action.",
    "normalRaw": "Without this feat, the creature takes a standard action either before or after its move action.",
    "specialRaw": "",
    "appEffect": "Standard-Aktion an beliebigem Punkt während Flugbewegung"
  },
  "force_of_personality": {
    "id": "force_of_personality",
    "nameDe": "Persönlichkeitsstärke",
    "nameEn": "Force of Personality",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "cha", "value": 13 }
    ],
    "benefitDe": "Nutze deinen Charisma-Modifikator anstelle deines Weisheits-Modifikators für alle Willens-Rettungswürfe gegen geistesbeeinflussende Zauber und Effekte.",
    "benefitRaw": "You use your Charisma modifier instead of your Wisdom modifier on Will saves against mind-affecting spells and abilities.",
    "normalRaw": "Wisdom modifier is normally applied to Will saves.",
    "specialRaw": "",
    "appEffect": "Charisma-Mod für Willens-Rettungswürfe gegen Geistesbeeinflussung"
  },
  "go_for_the_throat": {
    "id": "go_for_the_throat",
    "nameDe": "Kehlenbiss",
    "nameEn": "Go for the Throat",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "custom", "desc": "Animal companion" },
      { "type": "bab", "value": 1 }
    ],
    "benefitDe": "Erziele du oder dein Tiergefährte einen kritischen Treffer gegen ein Ziel, erhält der jeweils andere sofort einen Gelegenheitsangriff gegen dasselbe Ziel.",
    "benefitRaw": "Whenever you or your animal companion score a critical hit against a foe, the other gains an immediate attack of opportunity against that foe.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Gelegenheitsangriff für Gefährte/Meister bei kritischem Treffer des Partners"
  },
  "improved_flight": {
    "id": "improved_flight",
    "nameDe": "Verbesserter Flug",
    "nameEn": "Improved Flight",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "custom", "desc": "Fly speed" }
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
      { "type": "skill", "name": "swim", "value": 4 }
    ],
    "benefitDe": "Du schwimmst mit deiner halben Grundbewegungsrate als Move-Action oder mit deiner vollen Bewegungsrate als Full-Round-Action.",
    "benefitRaw": "You can swim at your full base speed as a full-round action or at half speed as a move action.",
    "normalRaw": "Swimming normally allows one-quarter speed as a move action or half speed as a full-round action.",
    "specialRaw": "",
    "appEffect": "Schwimmgeschwindigkeit verdoppelt (1/2 Move, 1/1 Full-Round)"
  },
  "improved_toughness": {
    "id": "improved_toughness",
    "nameDe": "Verbesserte Zähigkeit",
    "nameEn": "Improved Toughness",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "custom", "desc": "Base Fortitude save +2" }
    ],
    "benefitDe": "Du erhältst +1 zusätzliche Trefferpunkte pro Trefferwürfel/Charakterstufe (wächst bei Stufenaufstiegen automatisch mit).",
    "benefitRaw": "You gain a number of hit points equal to your current Hit Dice. Each time you gain a Hit Die, you gain 1 additional hit point.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Improved Toughness as one of his fighter bonus feats.",
    "appEffect": "+1 HP pro Stufe / Hit Die"
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
  "insightful_strike": {
    "id": "insightful_strike",
    "nameDe": "Scharfsinniger Treffer",
    "nameEn": "Insightful Strike",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "feat", "id": "weapon_finesse" },
      { "type": "stat", "name": "int", "value": 13 }
    ],
    "benefitDe": "Addiere deinen Intelligenz-Modifikator anstelle deines Stärke-Modifikators zum Schadenswurf aller Waffen, auf die Waffenfeinheit (Weapon Finesse) anwendbar ist.",
    "benefitRaw": "You can add your Intelligence modifier to damage rolls with any weapon that can be used with Weapon Finesse.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Int-Mod auf Schadenswurf für Waffenfeinheits-Waffen"
  },
  "jack_of_all_trades": {
    "id": "jack_of_all_trades",
    "nameDe": "Tausendsassa",
    "nameEn": "Jack of All Trades",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "int", "value": 13 },
      { "type": "level", "value": 6 }
    ],
    "benefitDe": "Du darfst alle Fertigkeiten ungelernt (untrained) einsetzen, selbst Fertigkeiten, die normalerweise Ausbildung erfordern (Trained Only).",
    "benefitRaw": "You can use any skill untrained, even those that normally require training.",
    "normalRaw": "Trained-only skills cannot be attempted without at least 1/2 rank.",
    "specialRaw": "",
    "appEffect": "Alle Fertigkeiten können ungelernt (untrained) gewürfelt werden"
  },
  "leap_of_the_heavens": {
    "id": "leap_of_the_heavens",
    "nameDe": "Himmelssprung",
    "nameEn": "Leap of the Heavens",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "skill", "name": "jump", "value": 4 }
    ],
    "benefitDe": "Die DC für Sprungwürfe (Jump) verdoppelt sich nicht, wenn du ohne 20 Fuß Anlauf aus dem Stand springst. Mit Anlauf erhältst du einen Bonus von +5.",
    "benefitRaw": "When making a jump check without a 20-foot running start, the DC is not doubled. If you do have a running start, you gain a +5 competence bonus on the check.",
    "normalRaw": "Standing jumps double the DC.",
    "specialRaw": "",
    "appEffect": "Keine DC-Verdopplung bei Stand-Sprüngen; +5 mit Anlauf"
  },
  "natural_bond": {
    "id": "natural_bond",
    "nameDe": "Natürliche Bindung",
    "nameEn": "Natural Bond",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "custom", "desc": "Animal companion" }
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
      { "type": "custom", "desc": "Bardic music" },
      { "type": "skill", "name": "perform", "value": 10 }
    ],
    "benefitDe": "Du kannst deine Bardenmusik so leise und unauffällig abspielen, dass Außenstehende sie nicht wahrnehmen, deine Verbündeten aber dennoch die vollen Boni erhalten.",
    "benefitRaw": "You can produce bardic music effects so quietly that they are nearly imperceptible, allowing you to inspire allies without giving away your presence.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Bardenmusik geräuschlos/unbemerkt wirken"
  },
  "tactical_trapsmith": {
    "id": "tactical_trapsmith",
    "nameDe": "Taktischer Fallenbauer",
    "nameEn": "Tactical Trapsmith",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "custom", "desc": "Trapfinding" },
      { "type": "skill", "name": "disable_device", "value": 3 },
      { "type": "skill", "name": "search", "value": 3 }
    ],
    "benefitDe": "Du darfst deinen Geschicklichkeits-Modifikator anstelle deines Intelligenz-Modifikators für Fallenentschärfen (Disable Device) und Suchen (Search) verwenden.",
    "benefitRaw": "You can add your Dexterity modifier (instead of your Intelligence modifier) to Disable Device and Search checks.",
    "normalRaw": "Disable Device and Search use Intelligence.",
    "specialRaw": "",
    "appEffect": "Geschicklichkeits-Modifikator für Disable Device und Search"
  },
  "touch_of_golden_ice": {
    "id": "touch_of_golden_ice",
    "nameDe": "Berührung des Goldenen Eises",
    "nameEn": "Touch of Golden Ice",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "con", "value": 13 }
    ],
    "benefitDe": "Deine waffenlosen Angriffe und natürlichen Waffen übertragen das Gift des Goldenen Eises (Kontaktgift, Fortitude DC 14, 1d6 Dex / 2d6 Dex Schaden gegen böse Kreaturen).",
    "benefitRaw": "Your unarmed attacks and natural weapons deliver the ravage known as golden ice (Fort DC 14, 1d6 Dex / 2d6 Dex initial and secondary damage to evil creatures).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Waffenlose Angriffe übertragen Golden Ice Kontaktgift (DC 14, Dex-Schaden gegen böse Ziele)"
  },
  "versatile_performer": {
    "id": "versatile_performer",
    "nameDe": "Vielseitiger Darsteller",
    "nameEn": "Versatile Performer",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "skill", "name": "perform", "value": 5 }
    ],
    "benefitDe": "Du kannst deinen höchsten Darbieten-Fertigkeitswert (Perform) für eine Reihe anderer Darbieten-Kategorien verwenden und zwei Instrumente/Aufführungsarten gleichzeitig kombinieren (+2 Bonus).",
    "benefitRaw": "You can use your highest Perform skill modifier for a number of other Perform categories equal to your Intelligence bonus. You can also combine two types of performance at once for a +2 bonus.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Höchster Perform-Wert gilt für zusätzliche Perform-Kategorien; +2 bei Kombination"
  },
  "wild_cohort": {
    "id": "wild_cohort",
    "nameDe": "Wilder Gefährte",
    "nameEn": "Wild Cohort",
    "category": "general",
    "source": "ca",
    "prereqs": [
      { "type": "level", "value": 1 }
    ],
    "benefitDe": "Du erhältst ein loyales Tier als wilden Gefährten (funktioniert ähnlich wie der Tiergefährte eines Druiden auf Charakterstufe - 3).",
    "benefitRaw": "You gain an animal companion-like creature called a wild cohort that gains bonus HD, abilities, and tricks based on your character level.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Gewährt einen wilden Tiergefährten (Animal Cohort)"
  }
};
