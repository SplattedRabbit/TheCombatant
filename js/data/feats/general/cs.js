/**
 * @module    feats-general-cs
 * @summary   Statische Datenbank für D&D 3.5e allgemeine Talente aus dem Complete Scoundrel (CS).
 * @exports   GENERAL_FEATS_REGISTRY_CS
 */

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
  },
  "daring_outlaw": {
    "id": "daring_outlaw",
    "nameDe": "Waghalsiger Gesetzloser",
    "nameEn": "Daring Outlaw",
    "category": "general",
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Grace +1"
      },
      {
        "type": "sneak_attack",
        "value": 2
      }
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
    "source": "cs",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Grace +1"
      },
      {
        "type": "class",
        "class": "fighter"
      }
    ],
    "benefitDe": "Deine Stufen als Kämpfer und Haudegen addieren sich zur Bestimmung deines Kämpfer-Stufenlevels für Talent-Voraussetzungen und für den Grace-Bonus.",
    "benefitRaw": "Your fighter and swashbuckler levels stack for the purpose of qualifying for feats with a fighter level requirement, and for your grace class feature.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Kämpfer & Haudegen Stacking für Fighter-Talente und Grace"
  },
  "swift_hunter": {
    "id": "swift_hunter",
    "nameDe": "Schneller Jäger",
    "nameEn": "Swift Hunter",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Favored enemy, skirmish +1d6/+1 AC"
      }
    ],
    "benefitDe": "Waldläufer- und Späher-Stufen (Scout) addieren sich für Skirmish-Schaden/RK und Erzfeind-Boni. Du kannst deinen Skirmish-Schaden sogar gegen Erzfeinde anwenden, die normalerweise immun gegen Sneak/Präzisionsschaden sind (z. B. Untote, Konstrukte).",
    "benefitRaw": "Your ranger and scout levels stack for the purpose of determining your skirmish attack bonus damage and AC bonus, and your favored enemies. You can apply skirmish damage to favored enemies even if they are immune to extra damage from critical hits.",
    "normalRaw": "",
    "specialRaw": "A scout can select Swift Hunter as one of her scout bonus feats.",
    "appEffect": "Ranger + Scout stufenübergreifend für Skirmish & Erzfeinde; Skirmish wirkt auf immune Erzfeinde",
    "source": "cs"
  },
  "swift_ambusher": {
    "id": "swift_ambusher",
    "nameDe": "Schneller Hinterhalt-Kämpfer",
    "nameEn": "Swift Ambusher",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +1d6, skirmish +1d6/+1 AC"
      }
    ],
    "benefitDe": "Schurken- und Späher-Stufen addieren sich zur Bestimmung des Skirmish-Bonus (Schaden und RK). Sneak-Attack-Würfel qualifizieren dich für Hinterhalt-Talente (Ambush Feats).",
    "benefitRaw": "Your rogue and scout levels stack for the purpose of determining your skirmish attack bonus damage and AC bonus. You can count skirmish extra damage alongside sneak attack to qualify for ambush feats.",
    "normalRaw": "",
    "specialRaw": "A scout can select Swift Ambusher as one of her scout bonus feats.",
    "appEffect": "Schurke + Späher stufenübergreifend für Skirmish-Bonus",
    "source": "cs"
  },
  "master_spellthief": {
    "id": "master_spellthief",
    "nameDe": "Meister-Zauberdieb",
    "nameEn": "Master Spellthief",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to cast 2nd-level arcane spells, steal spell"
      }
    ],
    "benefitDe": "Stufen als Zauberdieb und aller arkanen Zauberwirkerklassen addieren sich zur Bestimmung deiner Zauberstufe (Caster Level) und des maximalen Grads von Zaubern, die du stehlen kannst. Zaubere in leichter Rüstung ohne arkanes Zauberpatzerrisiko.",
    "benefitRaw": "Your spellthief levels stack with other arcane spellcaster levels for determining caster level and maximum level of spell you can steal. You incur no arcane spell failure chance in light armor for any arcane class.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Zauberdieb + Arkaner Caster stacken Caster Level & Zauber-Stehlen; Zaubern in leichter Rüstung",
    "source": "cs"
  },
  "ascetic_stalker": {
    "id": "ascetic_stalker",
    "nameDe": "Asketischer Pirscher",
    "nameEn": "Ascetic Stalker",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ki power, ki strike (magic)"
      }
    ],
    "benefitDe": "Mönchs- und Ninja-Stufen addieren sich zur Bestimmung deiner Ki-Pool-Größe und deines waffenlosen Schlagschadens. Du darfst frei zwischen Mönch und Ninja mehrklassig aufsteigen.",
    "benefitRaw": "Your monk and ninja levels stack for the purpose of determining your ki pool size and unarmed strike damage. You can multiclass freely between monk and ninja.",
    "normalRaw": "",
    "specialRaw": "A monk can select Ascetic Stalker as a bonus feat at 1st, 2nd, or 6th level.",
    "appEffect": "Mönch + Ninja stacken für Ki-Pool und waffenlosen Schaden",
    "source": "cs"
  },
  "martial_stalker": {
    "id": "martial_stalker",
    "nameDe": "Kriegerischer Pirscher",
    "nameEn": "Martial Stalker",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Proficiency with all martial weapons, ki power"
      }
    ],
    "benefitDe": "Kämpfer- und Ninja-Stufen addieren sich zur Bestimmung deiner Ki-Pool-Größe und deines RK-Bonus (AC bonus). Kämpferstufen qualifizieren für Ki-Kräfte.",
    "benefitRaw": "Your fighter and ninja levels stack for the purpose of determining your ki pool size and AC bonus. Fighter levels count toward meeting ki power level requirements.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Kämpfer + Ninja stacken für Ki-Pool und RK-Bonus",
    "source": "cs"
  },
  "psithief": {
    "id": "psithief",
    "nameDe": "Psidieb",
    "nameEn": "Psithief",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Manifester level 1st, steal spell"
      }
    ],
    "benefitDe": "Als Zauberdieb kannst du Kraftpunkte und psionische Kräfte von Gegnern stehlen statt Zauber.",
    "benefitRaw": "When you use steal spell, you can choose to steal power points or a psionic power from an opponent instead of a spell.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Zauberdieb stiehlt Kraftpunkte/psionische Kräfte statt Zauber",
    "source": "cs"
  },
  "improved_skirmish": {
    "id": "improved_skirmish",
    "nameDe": "Verbessertes Plänkeln",
    "nameEn": "Improved Skirmish",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Skirmish +2d6/+1 AC"
      }
    ],
    "benefitDe": "Wenn du dich in deinem Zug mindestens 20 Fuß (statt 10 Fuß) weit bewegst, erhöht sich dein Plänkler-Bonus um zusätzliche +2d6 Schaden und +2 RK.",
    "benefitRaw": "If you move at least 20 feet in a round, your skirmish damage increases by an extra 2d6 and your competency bonus to AC increases by an extra +2.",
    "normalRaw": "",
    "specialRaw": "A scout can select Improved Skirmish as one of her scout bonus feats.",
    "appEffect": "Ab 20 ft. Bewegung: zusätzliche +2d6 Schaden und +2 RK beim Plänkeln",
    "source": "cs"
  },
  "savvy_rogue": {
    "id": "savvy_rogue",
    "nameDe": "Gewiefter Schurke",
    "nameEn": "Savvy Rogue",
    "category": "general",
    "prereqs": [
      {
        "type": "classLevel",
        "class": "rogue",
        "value": 10
      }
    ],
    "benefitDe": "Verbessert deine hochstufigen Schurken-Spezialfähigkeiten (u. a. Erhöhter Verteidigungs-Roll, Opportunist mehrfach nutzbar, Fertigkeitsmeisterschaft unter extremem Druck).",
    "benefitRaw": "Enhances your high-level rogue special abilities (Defensive Roll, Opportunist, Skill Mastery, Slippery Mind, etc.).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Verbessert alle Schurken-Spezialfähigkeiten (ab Stufe 10)",
    "source": "cs"
  },
  "daredevil_athlete": {
    "id": "daredevil_athlete",
    "nameDe": "Draufgänger-Athlet",
    "nameEn": "Daredevil Athlete",
    "category": "general",
    "prereqs": [],
    "benefitDe": "3-mal täglich kannst du als sofortige Aktion einen Kompetenzbonus von +5 auf einen Klettern-, Springen-, Reiten- oder Schwimmen-Wurf erhalten.",
    "benefitRaw": "Three times per day, as an immediate action, you can gain a +5 competence bonus on a single Climb, Jump, Ride, or Swim check.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "3x/Tag +5 auf körperliche Fertigkeitswürfe",
    "source": "cs"
  },
  "enduring_ki": {
    "id": "enduring_ki",
    "nameDe": "Ausdauerndes Ki",
    "nameEn": "Enduring Ki",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ki power"
      }
    ],
    "benefitDe": "Verwende einen zusätzlichen täglichen Ki-Einsatz, um die Wirkungsdauer einer Ki-Kraft um 1 Runde zu verlängern.",
    "benefitRaw": "You can spend an extra use of your ki power to extend the duration of a ki power by 1 round.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 Runde Dauer für Ki-Kräfte durch extra Ki-Einsatz",
    "source": "cs"
  },
  "expanded_ki_pool": {
    "id": "expanded_ki_pool",
    "nameDe": "Erweiterter Ki-Pool",
    "nameEn": "Expanded Ki Pool",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ki power"
      }
    ],
    "benefitDe": "Du erhältst 3 zusätzliche tägliche Einsätze für deine Ki-Kräfte.",
    "benefitRaw": "You gain three extra uses of your ki power per day.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+3 tägliche Ki-Punkte",
    "source": "cs"
  },
  "poison_expert": {
    "id": "poison_expert",
    "nameDe": "Gift-Experte",
    "nameEn": "Poison Expert",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "craft_poisonmaking",
        "ranks": 8
      },
      {
        "type": "special",
        "desc": "Poison use"
      }
    ],
    "benefitDe": "Wähle einen Gifttyp (Kontakt, Einnahme, Einatmen oder Verletzung): Der Rettungswurf-SG für alle Gifte dieses Typs steigt bei dir um +1.",
    "benefitRaw": "Choose one type of poison (contact, ingested, inhaled, or injury). The save DC for that type of poison you use increases by 1.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 Rettungswurf-SG für gewählten Gifttyp",
    "source": "cs"
  },
  "poison_master": {
    "id": "poison_master",
    "nameDe": "Gift-Meister",
    "nameEn": "Poison Master",
    "category": "general",
    "prereqs": [
      {
        "type": "feat",
        "id": "poison_expert"
      },
      {
        "type": "skill",
        "skill": "craft_poisonmaking",
        "ranks": 8
      },
      {
        "type": "special",
        "desc": "Poison use"
      }
    ],
    "parent": "poison_expert",
    "benefitDe": "Wähle einen Gifttyp, für den du Poison Expert besitzt: Gifte dieses Typs verursachen bei dir +1 Punkt Attributsschaden pro Schadenswürfel.",
    "benefitRaw": "Poison of the selected type deals 1 extra point of ability damage per die of damage.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 Attributsschaden pro Würfel für gewählten Gifttyp",
    "source": "cs"
  },
  "improved_familiar": {
    "id": "improved_familiar",
    "nameDe": "Verbesserter Vertrauter",
    "nameEn": "Improved Familiar",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to acquire a new familiar, compatible alignment, sufficiently high arcane spellcaster level"
      }
    ],
    "benefitDe": "Ermöglicht die Wahl stärkerer und exotischer Vertrauter aus der erweiterten Vertrautenliste.",
    "benefitRaw": "Allows you to choose from an expanded list of powerful and unusual familiars.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Zugang zu exotischen und mächtigen Vertrauten",
    "source": "cs"
  },
  "cool_head": {
    "id": "cool_head",
    "nameDe": "Kühler Kopf",
    "nameEn": "Cool Head",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Any two mental skill tricks"
      }
    ],
    "benefitDe": "Erlerne sofort 2 mentale Kunstgriffe (Mental Skill Tricks) kostenlos; dein Limit an bekannten Kunstgriffen steigt um 1.",
    "benefitRaw": "You immediately learn two mental skill tricks for free, and your maximum skill trick limit increases by one.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 mentale Kunstgriffe kostenlos & Trick-Limit +1",
    "source": "cs"
  },
  "freerunner": {
    "id": "freerunner",
    "nameDe": "Freiläufer",
    "nameEn": "Freerunner",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Any two movement skill tricks"
      }
    ],
    "benefitDe": "Erlerne sofort 2 Bewegungs-Kunstgriffe (Movement Skill Tricks) kostenlos; dein Limit an bekannten Kunstgriffen steigt um 1.",
    "benefitRaw": "You immediately learn two movement skill tricks for free, and your maximum skill trick limit increases by one.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 Bewegungs-Kunstgriffe kostenlos & Trick-Limit +1",
    "source": "cs"
  },
  "sure_hand": {
    "id": "sure_hand",
    "nameDe": "Sichere Hand",
    "nameEn": "Sure Hand",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Any two manipulation skill tricks"
      }
    ],
    "benefitDe": "Erlerne sofort 2 Manipulations-Kunstgriffe kostenlos; dein Limit an bekannten Kunstgriffen steigt um 1.",
    "benefitRaw": "You immediately learn two manipulation skill tricks for free, and your maximum skill trick limit increases by one.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 Manipulations-Kunstgriffe kostenlos & Trick-Limit +1",
    "source": "cs"
  },
  "sweet_talker": {
    "id": "sweet_talker",
    "nameDe": "Süßholzraspler",
    "nameEn": "Sweet Talker",
    "category": "general",
    "prereqs": [
      {
        "type": "special",
        "desc": "Any two interaction skill tricks"
      }
    ],
    "benefitDe": "Erlerne sofort 2 Interaktions-Kunstgriffe kostenlos; dein Limit an bekannten Kunstgriffen steigt um 1.",
    "benefitRaw": "You immediately learn two interaction skill tricks for free, and your maximum skill trick limit increases by one.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 Interaktions-Kunstgriffe kostenlos & Trick-Limit +1",
    "source": "cs"
  },
  "chant_of_the_long_road": {
    "id": "chant_of_the_long_road",
    "nameDe": "Gesang des langen Weges",
    "nameEn": "Chant of the Long Road",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 6
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "Verbrauche 1 Bardenmusik-Einsatz: Du und Verbündete in 60 Fuß Reichweite erleiden für 1 Stunde keinen nicht-tödlichen Schaden durch Eilmärsche.",
    "benefitRaw": "Expend one daily use of bardic music to allow yourself and allies within 60 ft. to hustle for 1 hour without taking nonlethal damage.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Bardenmusik schützt 1 Stunde vor Schaden durch Eilmärsche",
    "source": "cs"
  },
  "chord_of_distraction": {
    "id": "chord_of_distraction",
    "nameDe": "Akkord der Ablenkung",
    "nameEn": "Chord of Distraction",
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
    "benefitDe": "Sofortige Aktion: Verbrauche 3 Bardenmusik-Einsätze und bestehe Auftreten-Gegenwurf, um einen Gegner für 1 Verbündeten auf dem falschen Fuß zu erwischen.",
    "benefitRaw": "As an immediate action, expend three daily uses of bardic music and succeed on an opposed Perform check to make a target flat-footed against one chosen ally.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Gegner per sofortiger Bardenmusik für 1 Verbündeten auf falschem Fuß erwischen",
    "source": "cs"
  },
  "epic_of_the_lost_king": {
    "id": "epic_of_the_lost_king",
    "nameDe": "Epos des verlorenen Königs",
    "nameEn": "Epic of the Lost King",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 6
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "Verbrauche 1 Bardenmusik-Einsatz: Entfernt sofort den Zustand Erschöpft (fatigued) bei allen Verbündeten (oder reduziert Erschöpft von 'exhausted' auf 'fatigued').",
    "benefitRaw": "Expend one daily use of bardic music to remove fatigue from allies within 30 ft. (or reduce exhaustion to fatigue).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Bardenmusik entfernt Erschöpfung (fatigue) bei Verbündeten",
    "source": "cs"
  },
  "sound_of_silence": {
    "id": "sound_of_silence",
    "nameDe": "Klang der Stille",
    "nameEn": "Sound of Silence",
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
    "benefitDe": "Verbrauche 2 Bardenmusik-Einsätze: Ziel muss Zähigkeitswurf (SG 10 + 1/2 Stufe + CHA-Mod) bestehen oder wird für Runden = Caster Level taub geschlagen.",
    "benefitRaw": "Expend two daily uses of bardic music to deafen a target within 30 ft. for rounds equal to your character level (Fortitude negates).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Bardenmusik taubt Ziel (Fortitude-Rettungswurf)",
    "source": "cs"
  },
  "warning_shout": {
    "id": "warning_shout",
    "nameDe": "Warnruf",
    "nameEn": "Warning Shout",
    "category": "general",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 9
      },
      {
        "type": "special",
        "desc": "Bardic music, evasion"
      }
    ],
    "benefitDe": "Sofortige Aktion: Verbrauche 2 Bardenmusik-Einsätze: Gewähre 1 Verbündeten in 30 Fuß Entfernung die Fähigkeit 'Entrinnen' (Evasion) und +5 auf den nächsten Reflexwurf.",
    "benefitRaw": "As an immediate action, expend two daily uses of bardic music to grant one ally within 30 ft. evasion and a +5 morale bonus on their next Reflex save.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Gewährt Verbündetem Entrinnen (Evasion) und +5 auf Reflexwurf per Bardenmusik",
    "source": "cs"
  }
};
