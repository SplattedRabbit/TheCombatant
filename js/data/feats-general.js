/**
 * @module    feats-general
 * @summary   Statische Datenbank für D&D 3.5e allgemeine Talente (category: general).
 * @exports   GENERAL_FEATS_REGISTRY
 * @reads     Keine
 * @stateOps  Keine
 * @depends   Keine
 * @notHere   Regelprüfung -> rules.js | UI -> PCFeatsTab.js | Facade -> feats-data.js
 */

export const GENERAL_FEATS_REGISTRY = {
  "toughness": {
    "id": "toughness",
    "nameDe": "Zähigkeit (Toughness)",
    "nameEn": "Toughness",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+3 Trefferpunkte. (Mehrfach wählbar, stapelbar)",
    "benefitRaw": "You gain +3 hit points.",
    "normalRaw": "",
    "specialRaw": "You can gain this feat multiple times. Its effects stack.",
    "appEffect": "+3 maximale Trefferpunkte (stapelbar)"
  },
  "great_fortitude": {
    "id": "great_fortitude",
    "nameDe": "Große Zähigkeit",
    "nameEn": "Great Fortitude",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 Bonus auf alle Zähigkeits-Rettungswürfe.",
    "benefitRaw": "You get a +2 bonus on all Fortitude saving throws.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Zähigkeits-Rettungswurf"
  },
  "lightning_reflexes": {
    "id": "lightning_reflexes",
    "nameDe": "Blitzschnelle Reflexe",
    "nameEn": "Lightning Reflexes",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 Bonus auf alle Reflex-Rettungswürfe.",
    "benefitRaw": "You get a +2 bonus on all Reflex saving throws.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Reflex-Rettungswurf"
  },
  "iron_will": {
    "id": "iron_will",
    "nameDe": "Eiserner Wille",
    "nameEn": "Iron Will",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 Bonus auf alle Willens-Rettungswürfe.",
    "benefitRaw": "You get a +2 bonus on all Will saving throws.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Willens-Rettungswurf"
  },
  "extra_turning": {
    "id": "extra_turning",
    "nameDe": "Zusätzliches Vertreiben",
    "nameEn": "Extra Turning",
    "category": "general",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Fähigkeit, Untote zu vertreiben"
      }
    ],
    "benefitDe": "Erlaubt das Vertreiben von Untoten 4-mal häufiger pro Tag.",
    "benefitRaw": "Each time you take this feat, you can use your ability to turn or rebuke undead four more times per day than normal.",
    "normalRaw": "",
    "specialRaw": "You can gain this feat multiple times. Its effects stack.",
    "appEffect": "+4 Ladungen pro Tag für \"Untote vertreiben\""
  },
  "extra_music": {
    "id": "extra_music",
    "nameDe": "Zusätzliche Bardenmusik",
    "nameEn": "Extra Music",
    "category": "general",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Bardenmusik"
      }
    ],
    "benefitDe": "Erlaubt die Nutzung von Bardenmusik 4-mal häufiger pro Tag.",
    "benefitRaw": "You can use your bardic music four more times per day than normal.",
    "normalRaw": "",
    "specialRaw": "You can gain this feat multiple times. Its effects stack.",
    "appEffect": "+4 Ladungen pro Tag für \"Bardisches Lied\""
  },
  "spell_focus": {
    "id": "spell_focus",
    "nameDe": "Zauberfokus",
    "nameEn": "Spell Focus",
    "category": "general",
    "prereqs": [],
    "hasOption": true,
    "optionType": "school",
    "benefitDe": "+1 Bonus auf den Rettungswurf-SG für Zauber der gewählten Magieschule.",
    "benefitRaw": "Add +1 to the Difficulty Class for all saving throws against spells from the school of magic you select.",
    "normalRaw": "",
    "specialRaw": "You can gain this feat multiple times, choosing a different school each time.",
    "appEffect": "+1 auf Rettungswurf-SG der gewählten Magieschule"
  },
  "greater_spell_focus": {
    "id": "greater_spell_focus",
    "nameDe": "Mächtiger Zauberfokus",
    "nameEn": "Greater Spell Focus",
    "category": "general",
    "prereqs": [
      {
        "type": "feat",
        "id": "spell_focus"
      }
    ],
    "parent": "spell_focus",
    "hasOption": true,
    "optionType": "school",
    "benefitDe": "Zusätzlicher +1 Bonus (+2 Gesamt) auf Rettungswurf-SGs der gewählten Magieschule.",
    "benefitRaw": "Add +1 to the Difficulty Class for all saving throws against spells from the school of magic you select.",
    "normalRaw": "",
    "specialRaw": "You can gain this feat multiple times, choosing a different school each time.",
    "appEffect": "Zusätzlich +1 auf Rettungswurf-SG der gewählten Schule"
  },
  "spell_penetration": {
    "id": "spell_penetration",
    "nameDe": "Zauberüberwindung",
    "nameEn": "Spell Penetration",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 Bonus auf Caster-Level-Würfe zur Überwindung von Zauberresistenz.",
    "benefitRaw": "You get a +2 bonus on caster level checks to defeat a creature’s spell resistance.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Zauberresistenz-Überwindungswürfe"
  },
  "greater_spell_penetration": {
    "id": "greater_spell_penetration",
    "nameDe": "Mächtige Zauberüberwindung",
    "nameEn": "Greater Spell Penetration",
    "category": "general",
    "prereqs": [
      {
        "type": "feat",
        "id": "spell_penetration"
      }
    ],
    "parent": "spell_penetration",
    "benefitDe": "Zusätzlicher +2 Bonus (+4 Gesamt) zur Überwindung von Zauberresistenz.",
    "benefitRaw": "You get a +2 bonus on caster level checks to defeat spell resistance. This stacks with Spell Penetration.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Zusätzlich +2 auf Zauberresistenz-Überwindungswürfe"
  },
  "combat_casting": {
    "id": "combat_casting",
    "nameDe": "Kampfzauberei",
    "nameEn": "Combat Casting",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+4 Bonus auf Konzentrationswürfe bei defensiver Zauberei oder im Nahkampf.",
    "benefitRaw": "You get a +4 bonus on Concentration checks made to cast a spell or use a spell-like ability while on the defensive or while grappling.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+4 Konzentration beim defensiven Zaubern"
  },
  "natural_spell": {
    "id": "natural_spell",
    "nameDe": "Natürliches Zaubern",
    "nameEn": "Natural Spell",
    "category": "general",
    "prereqs": [
      {
        "type": "stat",
        "name": "wis",
        "value": 13
      },
      {
        "type": "custom",
        "desc": "Tiergestalt (Wild Shape)"
      }
    ],
    "benefitDe": "Erlaubt das Zaubern während der Tiergestalt (Wild Shape).",
    "benefitRaw": "You can complete the somatic and verbal components of a spell while in wild shape.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Erlaubt Zaubern in Tiergestalt"
  },
  "eschew_materials": {
    "id": "eschew_materials",
    "nameDe": "Materialkomponenten weglassen",
    "nameEn": "Eschew Materials",
    "category": "general",
    "prereqs": [],
    "benefitDe": "Zaubere ohne Materialkomponenten, die weniger als 1 Goldmünze kosten.",
    "benefitRaw": "You can cast any spell that has a material component costing 1 gp or less without needing that component.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Keine Standard-Materialkomponenten nötig (<1 GM)"
  },
  "spell_mastery": {
    "id": "spell_mastery",
    "nameDe": "Zaubermeisterschaft",
    "nameEn": "Spell Mastery",
    "category": "general",
    "prereqs": [
      {
        "type": "class",
        "class": "wizard"
      }
    ],
    "benefitDe": "Bereite bestimmte Zauber ohne Magier-Zauberbuch vor.",
    "benefitRaw": "Each time you take this feat, choose a number of spells equal to your Intelligence modifier. You can prepare these spells without a spellbook.",
    "normalRaw": "",
    "specialRaw": "Wizard only.",
    "appEffect": "Einige Zauber ohne Zauberbuch vorbereiten"
  },
  "run": {
    "id": "run",
    "nameDe": "Rennen",
    "nameEn": "Run",
    "category": "general",
    "prereqs": [],
    "benefitDe": "Renne mit 5-facher Geschwindigkeit; erhalte +4 auf Weitsprung-Würfe.",
    "benefitRaw": "You run at 5 times your normal speed (if wearing light or no armor) or 4 times speed (in medium/heavy armor). You keep Dex bonus to AC while running.",
    "normalRaw": "Run at 4 times normal speed and lose Dex bonus to AC.",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "x5 Renn-Geschwindigkeit; +4 Weitsprung"
  },
  "track": {
    "id": "track",
    "nameDe": "Fährtensuchen",
    "nameEn": "Track",
    "category": "general",
    "prereqs": [],
    "benefitDe": "Erlaubt das Nutzen von Überleben, um Fährten zu suchen.",
    "benefitRaw": "To find tracks or to follow them, make a Survival check (DC depends on terrain/conditions).",
    "normalRaw": "Cannot follow tracks without this feat.",
    "specialRaw": "Rangers get this for free at level 1.",
    "appEffect": "Erlaubt Fährtensuche via Überleben"
  },
  "endurance": {
    "id": "endurance",
    "nameDe": "Ausdauer",
    "nameEn": "Endurance",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+4 Bonus auf Zähigkeitsproben gegen Erschöpfung, Durst, Hunger und Kälte.",
    "benefitRaw": "You gain a +4 bonus on checks/saves made to resist nonlethal damage, swim/run exhaustion, hot/cold environments, or sleep deprivation.",
    "normalRaw": "",
    "specialRaw": "Rangers get this for free at level 3.",
    "appEffect": "+4 auf Zähigkeitsprüfungen gegen Erschöpfung/Umwelt"
  },
  "diehard": {
    "id": "diehard",
    "nameDe": "Stehaufmännchen (Diehard)",
    "nameEn": "Diehard",
    "category": "general",
    "prereqs": [
      {
        "type": "feat",
        "id": "endurance"
      }
    ],
    "parent": "endurance",
    "benefitDe": "Bleibe bei -1 bis -9 TP handlungsfähig (Gilt als Kampfunfähig, verliert nicht automatisch TP).",
    "benefitRaw": "If reduced to -1 to -9 hp, you automatically stabilize. You can choose to act as disabled rather than dying.",
    "normalRaw": "At -1 to -9 hp, you are unconscious and losing 1 hp per round.",
    "specialRaw": "",
    "appEffect": "Handlungsfähig bei -1 bis -9 TP"
  },
  "leadership": {
    "id": "leadership",
    "nameDe": "Anführerschaft",
    "nameEn": "Leadership",
    "category": "general",
    "prereqs": [
      {
        "type": "level",
        "value": 6
      }
    ],
    "benefitDe": "Gewährt einen loyalen Gefährten (Cohort) und eine Schar Gefolgsleute.",
    "benefitRaw": "You attract a loyal cohort and followers who assist you in your adventures.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Schaltet Gefährten/Gefolgsleute frei"
  },
  "armor_light": {
    "id": "armor_light",
    "nameDe": "Umgang mit leichter Rüstung",
    "nameEn": "Armor Proficiency (light)",
    "category": "general",
    "prereqs": [],
    "benefitDe": "Kein Malus auf Angriffswürfe beim Tragen leichter Rüstung.",
    "benefitRaw": "When you wear light armor, the armor check penalty applies only to skill checks, not attack rolls.",
    "normalRaw": "Wearing non-proficient armor applies penalty to attack rolls.",
    "specialRaw": "Most martial classes get this for free.",
    "appEffect": "Kein Angriffs-Malus durch leichte Rüstung"
  },
  "armor_medium": {
    "id": "armor_medium",
    "nameDe": "Umgang mit mittelschwerer Rüstung",
    "nameEn": "Armor Proficiency (medium)",
    "category": "general",
    "prereqs": [
      {
        "type": "feat",
        "id": "armor_light"
      }
    ],
    "parent": "armor_light",
    "benefitDe": "Kein Malus auf Angriffswürfe beim Tragen mittelschwerer Rüstung.",
    "benefitRaw": "When you wear medium armor, the armor check penalty does not apply to attack rolls.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Kein Angriffs-Malus durch mittelschwere Rüstung"
  },
  "armor_heavy": {
    "id": "armor_heavy",
    "nameDe": "Umgang mit schwerer Rüstung",
    "nameEn": "Armor Proficiency (heavy)",
    "category": "general",
    "prereqs": [
      {
        "type": "feat",
        "id": "armor_medium"
      }
    ],
    "parent": "armor_medium",
    "benefitDe": "Kein Malus auf Angriffswürfe beim Tragen schwerer Rüstung.",
    "benefitRaw": "When you wear heavy armor, the armor check penalty does not apply to attack rolls.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Kein Angriffs-Malus durch schwere Rüstung"
  },
  "shield_prof": {
    "id": "shield_prof",
    "nameDe": "Umgang mit Schilden",
    "nameEn": "Shield Proficiency",
    "category": "general",
    "prereqs": [],
    "benefitDe": "Kein Malus auf Angriffswürfe bei Nutzung eines Schildes.",
    "benefitRaw": "When you use a shield, the shield check penalty applies only to skill checks, not attack rolls.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Kein Angriffs-Malus durch Schilde"
  },
  "tower_shield_prof": {
    "id": "tower_shield_prof",
    "nameDe": "Umgang mit Turmschilden",
    "nameEn": "Tower Shield Proficiency",
    "category": "general",
    "prereqs": [
      {
        "type": "feat",
        "id": "shield_prof"
      }
    ],
    "parent": "shield_prof",
    "benefitDe": "Kein Malus auf Angriffswürfe bei Nutzung eines Turmschildes.",
    "benefitRaw": "When you use a tower shield, its penalty applies only to skill checks, not attack rolls.",
    "normalRaw": "",
    "specialRaw": "Fighters get this for free.",
    "appEffect": "Kein Angriffs-Malus durch Turmschilde"
  },
  "simple_weapon_prof": {
    "id": "simple_weapon_prof",
    "nameDe": "Umgang mit einfachen Waffen",
    "nameEn": "Simple Weapon Proficiency",
    "category": "general",
    "prereqs": [],
    "benefitDe": "Kein Malus von -4 auf Angriffe mit einfachen Waffen.",
    "benefitRaw": "You make attack rolls with simple weapons without penalty.",
    "normalRaw": "Non-proficient attacks suffer a -4 penalty.",
    "specialRaw": "",
    "appEffect": "Kein Malus bei einfachen Waffen"
  },
  "martial_weapon_prof": {
    "id": "martial_weapon_prof",
    "nameDe": "Umgang mit Kriegswaffen",
    "nameEn": "Martial Weapon Proficiency",
    "category": "general",
    "prereqs": [],
    "hasOption": true,
    "optionType": "weapon",
    "benefitDe": "Kein Malus von -4 auf Angriffe mit der gewählten Kriegswaffe.",
    "benefitRaw": "You make attack rolls with the selected martial weapon without penalty.",
    "normalRaw": "",
    "specialRaw": "Fighters, Paladins, Rangers get all martial proficiencies.",
    "appEffect": "Kein Malus bei der gewählten Kriegswaffe"
  },
  "acrobatic": {
    "id": "acrobatic",
    "nameDe": "Akrobatisch",
    "nameEn": "Acrobatic",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Springen und Akrobatik.",
    "benefitRaw": "+2 bonus on Jump and Tumble checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Springen und Akrobatik"
  },
  "agile": {
    "id": "agile",
    "nameDe": "Flink",
    "nameEn": "Agile",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Balance und Entfesselungskunst.",
    "benefitRaw": "+2 bonus on Balance and Escape Artist checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Balance und Entfesselungskunst"
  },
  "alertness": {
    "id": "alertness",
    "nameDe": "Aufmerksamkeit",
    "nameEn": "Alertness",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Lauschen und Entdecken.",
    "benefitRaw": "+2 bonus on Listen and Spot checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Lauschen und Entdecken"
  },
  "animal_affinity": {
    "id": "animal_affinity",
    "nameDe": "Tierfreund",
    "nameEn": "Animal Affinity",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Mit Tieren umgehen und Reiten.",
    "benefitRaw": "+2 bonus on Handle Animal and Ride checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Mit Tieren umgehen und Reiten"
  },
  "athletic": {
    "id": "athletic",
    "nameDe": "Athletisch",
    "nameEn": "Athletic",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Klettern und Schwimmen.",
    "benefitRaw": "+2 bonus on Climb and Swim checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Klettern und Schwimmen"
  },
  "deceitful": {
    "id": "deceitful",
    "nameDe": "Verlogen",
    "nameEn": "Deceitful",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Verkleiden und Fälschen.",
    "benefitRaw": "+2 bonus on Disguise and Forgery checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Verkleiden und Fälschen"
  },
  "deft_hands": {
    "id": "deft_hands",
    "nameDe": "Geschickte Hände",
    "nameEn": "Deft Hands",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Taschendiebstahl und Seilbenutzung.",
    "benefitRaw": "+2 bonus on Sleight of Hand and Use Rope checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Taschendiebstahl und Seilbenutzung"
  },
  "diligent": {
    "id": "diligent",
    "nameDe": "Sorgfältig",
    "nameEn": "Diligent",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Schätzen und Zauberkunde entziffern.",
    "benefitRaw": "+2 bonus on Appraise and Decipher Script checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Schätzen und Entziffern"
  },
  "investigator": {
    "id": "investigator",
    "nameDe": "Ermittler",
    "nameEn": "Investigator",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Informationen sammeln und Suchen.",
    "benefitRaw": "+2 bonus on Gather Information and Search checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Infos sammeln und Suchen"
  },
  "negotiator": {
    "id": "negotiator",
    "nameDe": "Unterhändler",
    "nameEn": "Negotiator",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Diplomatie und Motiv erkennen.",
    "benefitRaw": "+2 bonus on Diplomacy and Sense Motive checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Diplomatie und Motiv erkennen"
  },
  "nimble_fingers": {
    "id": "nimble_fingers",
    "nameDe": "Feingefühl",
    "nameEn": "Nimble Fingers",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Schloss öffnen und Fallen entschärfen.",
    "benefitRaw": "+2 bonus on Open Lock and Disable Device checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Schloss öffnen und Fallen entschärfen"
  },
  "persuasive": {
    "id": "persuasive",
    "nameDe": "Überzeugend",
    "nameEn": "Persuasive",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Bluffen und Einschüchtern.",
    "benefitRaw": "+2 bonus on Bluff and Intimidate checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Bluffen und Einschüchtern"
  },
  "self_sufficient": {
    "id": "self_sufficient",
    "nameDe": "Selbstversorger",
    "nameEn": "Self-Sufficient",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Heilkunde und Überlebenskunst.",
    "benefitRaw": "+2 bonus on Heal and Survival checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Heilkunde und Überleben"
  },
  "stealthy": {
    "id": "stealthy",
    "nameDe": "Heimlich",
    "nameEn": "Stealthy",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Verstecken und Leise bewegen.",
    "benefitRaw": "+2 bonus on Hide and Move Silently checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Verstecken und Leise bewegen"
  },
  "magical_aptitude": {
    "id": "magical_aptitude",
    "nameDe": "Magisches Gespür",
    "nameEn": "Magical Aptitude",
    "category": "general",
    "prereqs": [],
    "benefitDe": "+2 auf Zauberkunde und Magischen Gegenstand benutzen.",
    "benefitRaw": "+2 bonus on Spellcraft and Use Magic Device checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Zauberkunde und Magischen Gegenstand benutzen"
  },
  "skill_focus": {
    "id": "skill_focus",
    "nameDe": "Fertigkeitsfokus",
    "nameEn": "Skill Focus",
    "category": "general",
    "prereqs": [],
    "hasOption": true,
    "optionType": "skill",
    "benefitDe": "+3 Bonus auf Würfe mit der gewählten Fertigkeit.",
    "benefitRaw": "You get a +3 bonus on all checks involving the chosen skill.",
    "normalRaw": "",
    "specialRaw": "You can gain this feat multiple times, choosing a different skill each time.",
    "appEffect": "+3 Bonus auf gewählte Fertigkeit"
  }
};
