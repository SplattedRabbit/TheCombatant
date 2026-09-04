/**
 * @module    feats-general-phb2
 * @summary   Statische Datenbank für D&D 3.5e allgemeine Talente aus dem Player's Handbook II (PHB2).
 * @exports   GENERAL_FEATS_REGISTRY_PHB2
 */

export const GENERAL_FEATS_REGISTRY_PHB2 = {
  "companion_spellbond": {
    "id": "companion_spellbond",
    "nameDe": "Tierbegleiter-Zauberband",
    "nameEn": "Companion Spellbond",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Animal companion class feature"
      }
    ],
    "benefitDe": "Teile deine Zauber mit deinem Tierbegleiter auf bis zu 30 Fuß Entfernung (statt standardmäßig 5 Fuß).",
    "benefitRaw": "You can share spells with your animal companion out to a range of 30 feet, rather than the standard 5 feet.",
    "normalRaw": "Shared spells are lost if the companion is more than 5 feet away.",
    "specialRaw": "",
    "appEffect": "Teile Tierbegleiter-Zauber bis zu 30 Fuß Distanz"
  },
  "combat_acrobat": {
    "id": "combat_acrobat",
    "nameDe": "Kampfakrobat",
    "nameEn": "Combat Acrobat",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Balance 9 ranks"
      },
      {
        "type": "custom",
        "desc": "Tumble 9 ranks"
      }
    ],
    "benefitDe": "Vermeide es, zu Boden zu stürzen (Prone) durch eine erfolgreiche Balance-Prüfung (DC 15); Tumble durch schwieriges Gelände.",
    "benefitRaw": "If you are tripped or knocked prone, you can make a DC 15 Balance check as an immediate action to remain standing. You can also tumble through difficult terrain without penalty.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Sofortige Balance-Rettung (DC 15) gegen Prone-Status; Tumble im schwierigen Gelände"
  },
  "steadfast_determination": {
    "id": "steadfast_determination",
    "nameDe": "Eiserne Entschlossenheit (Steadfast Determination)",
    "nameEn": "Steadfast Determination",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "endurance"
      }
    ],
    "benefitDe": "Nutze deinen Konstitutions-Modifikator anstelle deines Weisheits-Modifikators für Willens-Rettungswürfe. Du scheiterst bei Zähigkeitswürfen nicht automatisch bei einer gewürfelten 1.",
    "benefitRaw": "You use your Constitution modifier instead of your Wisdom modifier on Will saves. You do not automatically fail Fortitude saves on a roll of 1.",
    "normalRaw": "Wisdom modifies Will saves. A roll of 1 on a Fortitude save is an automatic failure.",
    "specialRaw": "",
    "appEffect": "Konstitutions-Mod für Willens-Rettungswürfe; kein Auto-Fail auf Fortitude 1"
  },
  "telling_blow": {
    "id": "telling_blow",
    "nameDe": "Enthüllender Schlag (Telling Blow)",
    "nameEn": "Telling Blow",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "custom",
        "desc": "Sneak attack or skirmish ability"
      }
    ],
    "benefitDe": "Jedes Mal, wenn du einen kritischen Treffer erzielst, fügst du deinen Bonus-Schaden durch Sneak Attack oder Skirmish hinzu.",
    "benefitRaw": "You add your sneak attack or skirmish extra damage to any critical hit you score in combat.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Füge Sneak Attack/Skirmish-Schaden bei kritischen Treffern hinzu"
  },
  "leap_of_the_heavens": {
    "id": "leap_of_the_heavens",
    "nameDe": "Himmelssprung",
    "nameEn": "Leap of the Heavens",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "name": "jump",
        "value": 4
      }
    ],
    "benefitDe": "Die DC für Sprungwürfe (Jump) verdoppelt sich nicht, wenn du ohne 20 Fuß Anlauf aus dem Stand springst. Mit Anlauf erhältst du einen Bonus von +5.",
    "benefitRaw": "When making a jump check without a 20-foot running start, the DC is not doubled. If you do have a running start, you gain a +5 competence bonus on the check.",
    "normalRaw": "Standing jumps double the DC.",
    "specialRaw": "",
    "appEffect": "Keine DC-Verdopplung bei Stand-Sprüngen; +5 mit Anlauf"
  },
  "battle_dancer": {
    "id": "battle_dancer",
    "nameDe": "Kampftänzer",
    "nameEn": "Battle Dancer",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "bab",
        "value": 2
      },
      {
        "type": "special",
        "desc": "Bardic music"
      }
    ],
    "benefitDe": "+2 Moralbonus auf Angriffswürfe, solange du dich bewegst und gleichzeitig Bardenmusik nutzt.",
    "benefitRaw": "+2 morale bonus on melee attacks while moving and singing with bardic music.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 Angriff bei Bewegung während Bardenmusik"
  },
  "cunning_evasion": {
    "id": "cunning_evasion",
    "nameDe": "Listiges Entrinnen",
    "nameEn": "Cunning Evasion",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "hide",
        "ranks": 9
      },
      {
        "type": "special",
        "desc": "Evasion"
      }
    ],
    "benefitDe": "Sofortige Aktion: Wenn du einen Flächenzauber per Entrinnen (Evasion) vermeidest, kannst du dich sofort 5 Fuß bewegen und einen Verstecken-Wurf machen.",
    "benefitRaw": "Immediately hide and take a 5-ft. step when avoiding area attack via evasion.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Sofortiges Verstecken und 5 ft. Schritt nach erfolgreichem Entrinnen"
  },
  "fade_into_violence": {
    "id": "fade_into_violence",
    "nameDe": "Im Kampf untertauchen",
    "nameEn": "Fade into Violence",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "bluff",
        "ranks": 6
      },
      {
        "type": "skill",
        "skill": "hide",
        "ranks": 6
      }
    ],
    "benefitDe": "Schnelle Aktion: Wenn du neben einem Verbündeten stehst, mache einen Bluffen-Wurf, damit ein Gegner statt dir deinen Verbündeten angreift.",
    "benefitRaw": "Opponent attacks adjacent ally instead of you if your Bluff check succeeds.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Gegnerische Angriffe per Bluffen auf Verbündeten umlenken"
  },
  "fiery_ki_defense": {
    "id": "fiery_ki_defense",
    "nameDe": "Feurige Ki-Verteidigung",
    "nameEn": "Fiery Ki Defense",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "fiery_fist"
      },
      {
        "type": "feat",
        "id": "stunning_fist"
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
    "parent": "fiery_fist",
    "benefitDe": "Schnelle Aktion: Verbrauche 1 Betäubungsschlag, um dich in Flammen zu hüllen; jeder Nahkampfangreifer erleidet 1d6 Feuerschaden.",
    "benefitRaw": "Cloak yourself in flame, dealing 1d6 fire damage to melee attackers.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "1d6 Feuerschaden für jeden Nahkampfangreifer"
  },
  "ki_blast": {
    "id": "ki_blast",
    "nameDe": "Ki-Explosion",
    "nameEn": "Ki Blast",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "fiery_fist"
      },
      {
        "type": "feat",
        "id": "stunning_fist"
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
    "parent": "fiery_fist",
    "benefitDe": "Standard-Aktion: Verbrauche 2 Betäubungsschläge für ein Geschoss aus Ki-Energie (Fernkampf-Berührungsangriff, 60 ft., waffenloser Schaden + Weisheitsmodifikator).",
    "benefitRaw": "Hurl a ball of ki energy (ranged touch attack up to 60 ft.) dealing unarmed damage + Wis mod.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Ki-Fernkampfangriff (60 ft., Berührung, Schaden = Faust + WIS)"
  },
  "keen_eared_scout": {
    "id": "keen_eared_scout",
    "nameDe": "Scharfhöriger Kundschafter",
    "nameEn": "Keen-Eared Scout",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "listen",
        "ranks": 6
      }
    ],
    "benefitDe": "Lauschen-Würfe enthüllen genaue Anzahl, Bewegungsrichtung und Rüstungsart von Kreaturen hinter Türen und Wänden.",
    "benefitRaw": "Listen checks reveal exact details about sounds, creature numbers and armor types.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Exakte Details über Kreaturen und Bewegung durch Lauschen"
  },
  "master_manipulator": {
    "id": "master_manipulator",
    "nameDe": "Meister-Manipulator",
    "nameEn": "Master Manipulator",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "stat",
        "name": "cha",
        "value": 13
      },
      {
        "type": "skill",
        "skill": "diplomacy",
        "ranks": 9
      }
    ],
    "benefitDe": "Schaltet 'Trap the Words' und 'Outrage' mit Diplomatie frei, um Gegner in Gesprächen auszutricksen.",
    "benefitRaw": "Use Diplomacy checks to trick foes in conversations into revealing secrets or turning against allies.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Neue Gesprächs-Taktiken mit Diplomatie"
  },
  "trophy_collector": {
    "id": "trophy_collector",
    "nameDe": "Trophäen-Sammler",
    "nameEn": "Trophy Collector",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "bab",
        "value": 6
      }
    ],
    "benefitDe": "Sammle Trophäen von besiegten Gegnern; gewährt +2 Moralbonus auf Rettungswürfe und Einschüchtern gegen diese Kreaturenart.",
    "benefitRaw": "Harvest trophies from fallen foes for bonuses on saves and Intimidate checks.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 Rettungswürfe & Einschüchtern durch Trophäen"
  },
  "wanderers_diplomacy": {
    "id": "wanderers_diplomacy",
    "nameDe": "Wanderer-Diplomatie",
    "nameEn": "Wanderer's Diplomacy",
    "category": "general",
    "source": "phb2",
    "prereqs": [],
    "benefitDe": "Schaltet feilschende Diplomatie frei: Günstigere Preise und Bestechung von Wachen.",
    "benefitRaw": "Use Diplomacy to haggle for lower prices and influence attitudes rapidly.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Feilschen für günstigere Preise mit Diplomatie"
  },
  "mad_alchemist": {
    "id": "mad_alchemist",
    "nameDe": "Verrückter Alchemist",
    "nameEn": "Mad Alchemist",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "craft_alchemy",
        "ranks": 6
      }
    ],
    "benefitDe": "Taktisches Talent: Schaltet Feuerbrand, Säurespritzer und Klebekraft bei alchemistischen Waffen frei.",
    "benefitRaw": "Tactical feat: fiery blaze, acid splash, and tanglefoot tactical benefits.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Taktische Optionen mit Alchemie-Artikeln"
  },
  "mad_foam_rager": {
    "id": "mad_foam_rager",
    "nameDe": "Schäumender Berserker",
    "nameEn": "Mad Foam Rager",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Rage or frenzy ability"
      }
    ],
    "benefitDe": "1-mal pro Kampfrausch (Rage): Verzögere den erlittenen Schaden eines Angriffs oder Zaubereffekts um 1 volle Runde.",
    "benefitRaw": "Once per rage, delay the damage or effect of an attack or spell for 1 round.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Schaden/Zaubereffekt im Kampfrausch um 1 Runde verzögern"
  },
  "vatic_gaze": {
    "id": "vatic_gaze",
    "nameDe": "Vatikanischer Blick",
    "nameEn": "Vatic Gaze",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Arcane caster level 9th"
      }
    ],
    "benefitDe": "Schnelle Aktion: Erkenne magische Auren und schätze die Zauberstufe eines Ziels per Blick ab.",
    "benefitRaw": "Instantly detect magic and sense a target's caster level as a swift action.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Magie und Zauberstufe als schnelle Aktion analysieren"
  },
  "arcane_accompaniment": {
    "id": "arcane_accompaniment",
    "nameDe": "Arkane Begleitung",
    "nameEn": "Arcane Accompaniment",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 4
      },
      {
        "type": "special",
        "desc": "Bardic music, arcane caster level 1st"
      }
    ],
    "benefitDe": "Opfere einen Zauberplatz als schnelle Aktion, um die Wirkungsdauer deiner Bardenmusik um Runden in Höhe des Zaubergrads zu verlängern.",
    "benefitRaw": "Expend a spell slot to extend the duration of your bardic music.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Bardenmusik per Zauberslot-Opferung verlängern"
  },
  "arcane_flourish": {
    "id": "arcane_flourish",
    "nameDe": "Arkane Verzierung",
    "nameEn": "Arcane Flourish",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "skill",
        "skill": "perform",
        "ranks": 4
      },
      {
        "type": "special",
        "desc": "Arcane caster level 1st"
      }
    ],
    "benefitDe": "Opfere einen Zauberslot als schnelle Aktion für einen Kompetenzbonus auf deinen nächsten Auftreten-Wurf = 1 + Zaubergrad.",
    "benefitRaw": "Expend a spell slot to gain a competence bonus on your next Perform check.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+1 + Grad auf Auftreten-Wurf durch Zauberslot-Opferung"
  },
  "arcane_toughness": {
    "id": "arcane_toughness",
    "nameDe": "Arkane Zähigkeit",
    "nameEn": "Arcane Toughness",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "feat",
        "id": "toughness"
      },
      {
        "type": "special",
        "desc": "Arcane caster level 3rd"
      }
    ],
    "parent": "toughness",
    "benefitDe": "Sofortige Aktion: Wenn du auf 0 oder weniger Trefferpunkte fällst, opfere einen Zauberplatz, um sofort TP in Höhe des doppelten Zaubergrads zu heilen.",
    "benefitRaw": "Expend a spell slot as an immediate action when reduced to 0 or fewer HP to heal twice the slot's level.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Zauberslot bei 0 TP opfern, um 2x Grad TP sofort zu heilen"
  },
  "bonded_familiar": {
    "id": "bonded_familiar",
    "nameDe": "Verbündeter Vertrauter",
    "nameEn": "Bonded Familiar",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Familiar"
      }
    ],
    "benefitDe": "Wenn du tödlichen Schaden erleidest, kannst du den Schaden sofort auf deinen Vertrauten übertragen.",
    "benefitRaw": "Shift deadly damage from yourself to your familiar as an immediate action.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Tödlichen Schaden auf Vertrauten übertragen"
  },
  "combat_familiar": {
    "id": "combat_familiar",
    "nameDe": "Kampfvertrauter",
    "nameEn": "Combat Familiar",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Familiar, arcane caster level 1st"
      }
    ],
    "benefitDe": "Dein Vertrauter kann das Feld von Gegnern betreten, ohne Gelegenheitsangriffe zu provozieren.",
    "benefitRaw": "Your familiar enters a foe's square without provoking attacks of opportunity.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Vertrauter provoziert keine AoO beim Betreten gegnerischer Felder"
  },
  "lurking_familiar": {
    "id": "lurking_familiar",
    "nameDe": "Lauernder Vertrauter",
    "nameEn": "Lurking Familiar",
    "category": "general",
    "source": "phb2",
    "parent": "combat_familiar",
    "prereqs": [
      {
        "type": "feat",
        "id": "combat_familiar"
      },
      {
        "type": "special",
        "desc": "Arcane caster level 6th"
      }
    ],
    "benefitDe": "Dein Vertrauter kann sich in deinem eigenen Feld verstecken und erhält dort vollständige Deckung.",
    "benefitRaw": "Your familiar can hide in your space and has total cover while there.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Vertrauter kann sich im Feld des Meisters verstecken mit totaler Deckung"
  },
  "divine_armor": {
    "id": "divine_armor",
    "nameDe": "Göttliche Rüstung",
    "nameEn": "Divine Armor",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn or rebuke undead"
      }
    ],
    "benefitDe": "Schnelle Aktion: Verbrauche 1 Vertreiben-Einsatz für Schadensreduktion 5/Böse (bzw. 5/Gut) für 1 Runde.",
    "benefitRaw": "Expend a turn/rebuke use as a swift action to gain DR 5/evil or DR 5/good for 1 round.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "DR 5/Böse oder Gut für 1 Runde per Vertreiben"
  },
  "divine_fortune": {
    "id": "divine_fortune",
    "nameDe": "Göttliches Glück",
    "nameEn": "Divine Fortune",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn or rebuke undead"
      }
    ],
    "benefitDe": "Sofortige Aktion: Verbrauche 1 Vertreiben-Einsatz für +4 Bonus auf deinen nächsten Rettungswurf.",
    "benefitRaw": "Expend a turn/rebuke use as an immediate action for a +4 bonus on your next save.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+4 auf nächsten Rettungswurf per Vertreiben"
  },
  "divine_justice": {
    "id": "divine_justice",
    "nameDe": "Göttliche Gerechtigkeit",
    "nameEn": "Divine Justice",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn or rebuke undead"
      }
    ],
    "benefitDe": "Sofortige Aktion: Wenn ein Gegner dir Schaden zufügt, verbrauche 1 Vertreiben-Einsatz; dein nächster Treffer fügt zusätzlichen Schaden = gegnerischer Schaden zu.",
    "benefitRaw": "Expend a turn/rebuke use to deal retribution damage to a foe who injured you.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Vergeltungsschaden per Vertreiben"
  },
  "divine_ward": {
    "id": "divine_ward",
    "nameDe": "Göttlicher Schutz",
    "nameEn": "Divine Ward",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn or rebuke undead"
      }
    ],
    "benefitDe": "Schnelle Aktion: Stimme dich auf einen Verbündeten ein; du kannst Berührungszauber auf ihn auf Distanz wirken.",
    "benefitRaw": "Cast touch spells on an attuned ally at range.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Berührungszauber auf Distanz auf eingestimmten Verbündeten wirken"
  },
  "profane_aura": {
    "id": "profane_aura",
    "nameDe": "Entheiligte Aura",
    "nameEn": "Profane Aura",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to rebuke undead"
      }
    ],
    "benefitDe": "Schnelle Aktion: Verbrauche 1 Untote-Unterwerfen-Einsatz; alle Gegner in 60 ft. erleiden -2 auf Rettungswürfe gegen Furcht.",
    "benefitRaw": "Expend a rebuke use to create a 60-ft. aura imposing penalties on foe saves against fear.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "60 ft. Aura: -2 auf Rettungswürfe gegen Furcht für Gegner"
  },
  "sacred_healing": {
    "id": "sacred_healing",
    "nameDe": "Geweihte Heilung",
    "nameEn": "Sacred Healing",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn undead, Heal 8 ranks"
      }
    ],
    "benefitDe": "Schnelle Aktion: Verbrauche 1 Vertreiben-Einsatz; deine nächsten Heilzauber heilen +2 TP pro Zaubergrad.",
    "benefitRaw": "Expend a turn use to grant your healing spells +2 healed HP per spell level for 1 round.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 TP Heilung pro Zaubergrad per Vertreiben"
  },
  "sacred_purification": {
    "id": "sacred_purification",
    "nameDe": "Geweihte Reinigung",
    "nameEn": "Sacred Purification",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn undead"
      }
    ],
    "benefitDe": "Schnelle Aktion: Verbrauche 1 Vertreiben-Einsatz für eine 60 ft. Welle: heilt alle lebenden Wesen um 1d8+CHA TP und fügt Untoten 1d8+CHA Schaden zu.",
    "benefitRaw": "Expend a turn use to emit a burst healing living creatures 1d8+Cha and damaging undead.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "60 ft. Welle heilt Lebende (1d8+CHA) und schädigt Untote"
  },
  "sacred_radiance": {
    "id": "sacred_radiance",
    "nameDe": "Geweihtes Strahlen",
    "nameEn": "Sacred Radiance",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "special",
        "desc": "Ability to turn undead"
      }
    ],
    "benefitDe": "Schnelle Aktion: Verbrauche 1 Vertreiben-Einsatz; erzeuge gleißendes Licht, das Untoten im Nahkampf jede Runde 2d6 Schaden zufügt.",
    "benefitRaw": "Expend a turn use to radiate bright light damaging undead for 2d6 per round.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Strahlen fügt Untoten 2d6 Schaden/Runde zu"
  },
  "celestial_sorcerer_heritage": {
    "id": "celestial_sorcerer_heritage",
    "nameDe": "Himmlisches Hexenmeister-Erbe",
    "nameEn": "Celestial Sorcerer Heritage",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "class",
        "class": "sorcerer"
      }
    ],
    "benefitDe": "+2 auf Rettungswürfe gegen Gift und Elektrizität; Zauberkunde als Klassenfertigkeit.",
    "benefitRaw": "+2 bonus on saves against poison and electricity; gain Spellcraft as class skill.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Rettungswürfe gegen Gift & Elektrizität"
  },
  "celestial_sorcerer_aura": {
    "id": "celestial_sorcerer_aura",
    "nameDe": "Himmlische Aura",
    "nameEn": "Celestial Sorcerer Aura",
    "category": "general",
    "source": "phb2",
    "parent": "celestial_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "celestial_sorcerer_heritage"
      }
    ],
    "benefitDe": "Schnelle Aktion: Opfere einen Zauberslot; böse Gegner in 20 ft. müssen Willenswurf bestehen oder werden erschüttert.",
    "benefitRaw": "Expend spell slot to cause evil foes to become shaken.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Böse Gegner in 20 ft. werden shaken"
  },
  "celestial_sorcerer_lance": {
    "id": "celestial_sorcerer_lance",
    "nameDe": "Himmlische Lanze",
    "nameEn": "Celestial Sorcerer Lance",
    "category": "general",
    "source": "phb2",
    "parent": "celestial_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "celestial_sorcerer_heritage"
      }
    ],
    "benefitDe": "Standard-Aktion: Opfere einen Zauberslot für eine 60-ft.-Linie aus Licht, die 1d8 Schaden pro Zaubergrad zufügt.",
    "benefitRaw": "Expend spell slot to create a 60-ft. line dealing 1d8 damage per slot level.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "60 ft. Lichtlinie: 1d8 Schaden pro Slot-Grad"
  },
  "celestial_sorcerer_lore": {
    "id": "celestial_sorcerer_lore",
    "nameDe": "Himmlisches Wissen",
    "nameEn": "Celestial Sorcerer Lore",
    "category": "general",
    "source": "phb2",
    "parent": "celestial_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "celestial_sorcerer_heritage"
      }
    ],
    "benefitDe": "Erweitere deine bekannten Zauber um Schutzzauber und göttliche Erkenntniszauber.",
    "benefitRaw": "Add defensive and divination spells to your spells known list.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Zusätzliche Schutzzauber als bekannt"
  },
  "celestial_sorcerer_wings": {
    "id": "celestial_sorcerer_wings",
    "nameDe": "Himmlische Flügel",
    "nameEn": "Celestial Sorcerer Wings",
    "category": "general",
    "source": "phb2",
    "parent": "celestial_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "celestial_sorcerer_heritage"
      }
    ],
    "benefitDe": "Schnelle Aktion: Opfere einen Zauberslot ab Grad 3; erhalte Flügel mit Flugbewegungsrate für Runden = Zaubergrad.",
    "benefitRaw": "Expend 3rd-level or higher slot to sprout wings and fly.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Flügel wachsen lassen mit Fluggeschwindigkeit"
  },
  "infernal_sorcerer_heritage": {
    "id": "infernal_sorcerer_heritage",
    "nameDe": "Infernales Hexenmeister-Erbe",
    "nameEn": "Infernal Sorcerer Heritage",
    "category": "general",
    "source": "phb2",
    "prereqs": [
      {
        "type": "class",
        "class": "sorcerer"
      }
    ],
    "benefitDe": "+2 auf Rettungswürfe gegen Gift und Feuer; Zauberkunde als Klassenfertigkeit.",
    "benefitRaw": "+2 on saves against poison and fire; Spellcraft as class skill.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "+2 auf Rettungswürfe gegen Gift & Feuer"
  },
  "infernal_sorcerer_eyes": {
    "id": "infernal_sorcerer_eyes",
    "nameDe": "Infernale Augen",
    "nameEn": "Infernal Sorcerer Eyes",
    "category": "general",
    "source": "phb2",
    "parent": "infernal_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "infernal_sorcerer_heritage"
      }
    ],
    "benefitDe": "Erhalte Dunkelsicht 60 ft., die sogar magische Dunkelheit durchdringt.",
    "benefitRaw": "Gain darkvision 60 ft., seeing through even magical darkness.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Dunkelsicht 60 ft. durchdringt magische Dunkelheit"
  },
  "infernal_sorcerer_howl": {
    "id": "infernal_sorcerer_howl",
    "nameDe": "Infernales Heulen",
    "nameEn": "Infernal Sorcerer Howl",
    "category": "general",
    "source": "phb2",
    "parent": "infernal_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "infernal_sorcerer_heritage"
      }
    ],
    "benefitDe": "Schnelle Aktion: Opfere einen Zauberslot für ein Heulen; alle Gegner in 20 ft. werden für 1 Runde taub geschlagen.",
    "benefitRaw": "Expend a spell slot to deafen adjacent enemies with a terrifying howl.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Heulen taubt Gegner in 20 ft."
  },
  "infernal_sorcerer_resistance": {
    "id": "infernal_sorcerer_resistance",
    "nameDe": "Infernale Resistenz",
    "nameEn": "Infernal Sorcerer Resistance",
    "category": "general",
    "source": "phb2",
    "parent": "infernal_sorcerer_heritage",
    "prereqs": [
      {
        "type": "feat",
        "id": "infernal_sorcerer_heritage"
      }
    ],
    "benefitDe": "Erhalte Feuer- und Kälteresistenz in Höhe deiner bekannten Hexenmeister-Erbe-Talente.",
    "benefitRaw": "Gain resistance to acid and cold equal to twice your infernal feats.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Säure- und Kälteresistenz durch Erbe-Talente"
  }
};
