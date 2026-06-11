/**
 * @module    feats-data
 * @summary   Statische Registry aller D&D-3.5e-Talente (PHB): Definitionen, Voraussetzungen (BAB, Stat, Feat, Klasse), Kategorien und appEffect-Strings.
 * @exports   CombatFeats (Objekt mit REGISTRY — alle Talentdefinitionen als Record<id, FeatDef>)
 * @reads     Keine State-Lesezugriffe — reine Datendatei
 * @stateOps  Keine
 * @depends   Keine externen Imports
 * @notHere   Voraussetzungs-Prüflogik gegen PC → PCFeatsTab.js (checkPrerequisites) | Angriffs-Effekte → AttackEngine.js | Feat-Mutation → PCManager.js (addPCFeat)
 */
export const CombatFeats = {
  REGISTRY: {
    // === Allgemeine Attributs- & Kampfwerte-Talente ===
    improved_initiative: {
      id: 'improved_initiative',
      nameDe: 'Verbesserte Initiative',
      nameEn: 'Improved Initiative',
      category: 'combat',
      prereqs: [],
      benefitDe: '+4 Bonus auf Initiative-Würfe.',
      benefitRaw: 'You get a +4 bonus on initiative checks.',
      normalRaw: '',
      specialRaw: 'A fighter may select Improved Initiative as one of his fighter bonus feats.',
      appEffect: '+4 Bonus auf Initiative'
    },
    toughness: {
      id: 'toughness',
      nameDe: 'Zähigkeit (Toughness)',
      nameEn: 'Toughness',
      category: 'general',
      prereqs: [],
      benefitDe: '+3 Trefferpunkte. (Mehrfach wählbar, stapelbar)',
      benefitRaw: 'You gain +3 hit points.',
      normalRaw: '',
      specialRaw: 'You can gain this feat multiple times. Its effects stack.',
      appEffect: '+3 maximale Trefferpunkte (stapelbar)'
    },
    great_fortitude: {
      id: 'great_fortitude',
      nameDe: 'Große Zähigkeit',
      nameEn: 'Great Fortitude',
      category: 'general',
      prereqs: [],
      benefitDe: '+2 Bonus auf alle Zähigkeits-Rettungswürfe.',
      benefitRaw: 'You get a +2 bonus on all Fortitude saving throws.',
      normalRaw: '',
      specialRaw: '',
      appEffect: '+2 auf Zähigkeits-Rettungswurf'
    },
    lightning_reflexes: {
      id: 'lightning_reflexes',
      nameDe: 'Blitzschnelle Reflexe',
      nameEn: 'Lightning Reflexes',
      category: 'general',
      prereqs: [],
      benefitDe: '+2 Bonus auf alle Reflex-Rettungswürfe.',
      benefitRaw: 'You get a +2 bonus on all Reflex saving throws.',
      normalRaw: '',
      specialRaw: '',
      appEffect: '+2 auf Reflex-Rettungswurf'
    },
    iron_will: {
      id: 'iron_will',
      nameDe: 'Eiserner Wille',
      nameEn: 'Iron Will',
      category: 'general',
      prereqs: [],
      benefitDe: '+2 Bonus auf alle Willens-Rettungswürfe.',
      benefitRaw: 'You get a +2 bonus on all Will saving throws.',
      normalRaw: '',
      specialRaw: '',
      appEffect: '+2 auf Willens-Rettungswurf'
    },

    // === Tägliche Ressourcen ===
    extra_turning: {
      id: 'extra_turning',
      nameDe: 'Zusätzliches Vertreiben',
      nameEn: 'Extra Turning',
      category: 'general',
      prereqs: [{ type: 'custom', desc: 'Fähigkeit, Untote zu vertreiben' }],
      benefitDe: 'Erlaubt das Vertreiben von Untoten 4-mal häufiger pro Tag.',
      benefitRaw: 'Each time you take this feat, you can use your ability to turn or rebuke undead four more times per day than normal.',
      normalRaw: '',
      specialRaw: 'You can gain this feat multiple times. Its effects stack.',
      appEffect: '+4 Ladungen pro Tag für "Untote vertreiben"'
    },
    extra_music: {
      id: 'extra_music',
      nameDe: 'Zusätzliche Bardenmusik',
      nameEn: 'Extra Music',
      category: 'general',
      prereqs: [{ type: 'custom', desc: 'Bardenmusik' }],
      benefitDe: 'Erlaubt die Nutzung von Bardenmusik 4-mal häufiger pro Tag.',
      benefitRaw: 'You can use your bardic music four more times per day than normal.',
      normalRaw: '',
      specialRaw: 'You can gain this feat multiple times. Its effects stack.',
      appEffect: '+4 Ladungen pro Tag für "Bardisches Lied"'
    },

    // === Waffen- & Angriffs-Talente ===
    weapon_focus: {
      id: 'weapon_focus',
      nameDe: 'Waffenfokus',
      nameEn: 'Weapon Focus',
      category: 'combat',
      prereqs: [{ type: 'bab', value: 1 }],
      hasOption: true,
      optionType: 'weapon',
      benefitDe: '+1 Bonus auf Angriffswürfe mit der gewählten Waffenart.',
      benefitRaw: 'You gain a +1 bonus on all attack rolls you make using the selected weapon.',
      normalRaw: '',
      specialRaw: 'A fighter may select Weapon Focus as one of his fighter bonus feats. You can gain this feat multiple times, choosing a different weapon each time.',
      appEffect: '+1 Angriffswurf mit der gewählten Waffe'
    },
    weapon_specialization: {
      id: 'weapon_specialization',
      nameDe: 'Waffenspezialisierung',
      nameEn: 'Weapon Specialization',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'weapon_focus' },
        { type: 'classLevel', class: 'fighter', value: 4 }
      ],
      parent: 'weapon_focus',
      hasOption: true,
      optionType: 'weapon',
      benefitDe: '+2 Bonus auf Schadenswürfe mit der gewählten Waffenart.',
      benefitRaw: 'You gain a +2 bonus on all damage rolls you make using the selected weapon.',
      normalRaw: '',
      specialRaw: 'Only a fighter of 4th level or higher may select Weapon Specialization as a bonus feat.',
      appEffect: '+2 Schadenswurf mit der gewählten Waffe'
    },
    greater_weapon_focus: {
      id: 'greater_weapon_focus',
      nameDe: 'Großer Waffenfokus',
      nameEn: 'Greater Weapon Focus',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'weapon_focus' },
        { type: 'classLevel', class: 'fighter', value: 8 }
      ],
      parent: 'weapon_focus',
      hasOption: true,
      optionType: 'weapon',
      benefitDe: 'Zusätzlicher +1 Bonus auf Angriffswürfe (+2 Gesamt) mit der gewählten Waffe.',
      benefitRaw: 'You gain a +1 bonus on all attack rolls you make using the selected weapon.',
      normalRaw: '',
      specialRaw: 'Only an 8th-level fighter may select this feat.',
      appEffect: 'Zusätzlich +1 Angriffswurf mit der gewählten Waffe'
    },
    greater_weapon_specialization: {
      id: 'greater_weapon_specialization',
      nameDe: 'Große Waffenspezialisierung',
      nameEn: 'Greater Weapon Specialization',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'greater_weapon_focus' },
        { type: 'feat', id: 'weapon_specialization' },
        { type: 'classLevel', class: 'fighter', value: 12 }
      ],
      parent: 'weapon_specialization',
      hasOption: true,
      optionType: 'weapon',
      benefitDe: 'Zusätzlicher +2 Bonus auf Schadenswürfe (+4 Gesamt) mit der gewählten Waffe.',
      benefitRaw: 'You gain a +2 bonus on all damage rolls you make using the selected weapon.',
      normalRaw: '',
      specialRaw: 'Only a 12th-level fighter may select this feat.',
      appEffect: 'Zusätzlich +2 Schadenswurf mit der gewählten Waffe'
    },

    // === Kampfexpertise-Baum ===
    combat_expertise: {
      id: 'combat_expertise',
      nameDe: 'Kampfexpertise',
      nameEn: 'Combat Expertise',
      category: 'combat',
      prereqs: [{ type: 'stat', name: 'int', value: 13 }],
      benefitDe: 'Tausche bis zu -5 Angriffsbonus gegen +5 Ausweich-RK.',
      benefitRaw: 'You can subtract up to 5 from your attack roll and add the same number as a dodge bonus to your Armor Class.',
      normalRaw: 'Defensive fighting options are limited to -4/+2.',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Schaltet Kampfgetümmel-Optionen frei'
    },
    improved_disarm: {
      id: 'improved_disarm',
      nameDe: 'Verbessertes Entwaffnen',
      nameEn: 'Improved Disarm',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'combat_expertise' }],
      parent: 'combat_expertise',
      benefitDe: '+4 auf Entwaffnungsversuche; provoziert keinen Gelegenheitsangriff.',
      benefitRaw: 'You gain a +4 bonus on your attempt to disarm an opponent, and you do not provoke an attack of opportunity.',
      normalRaw: 'Disarming provokes an attack of opportunity.',
      specialRaw: 'Fighter bonus feat.',
      appEffect: '+4 auf Entwaffnungswürfe; kein AoO'
    },
    improved_feint: {
      id: 'improved_feint',
      nameDe: 'Verbessertes Fintieren',
      nameEn: 'Improved Feint',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'combat_expertise' }],
      parent: 'combat_expertise',
      benefitDe: 'Fintieren als Bewegungsaktion statt Standardaktion.',
      benefitRaw: 'You can make a Bluff check to feint in combat as a move action.',
      normalRaw: 'Feinting in combat is a standard action.',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Fintieren im Kampf als Bewegungsaktion'
    },
    improved_trip: {
      id: 'improved_trip',
      nameDe: 'Verbessertes ZU-Boden-Werfen',
      nameEn: 'Improved Trip',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'combat_expertise' }],
      parent: 'combat_expertise',
      benefitDe: '+4 auf Trip-Versuche; gewährt sofortigen Folgeangriff bei Erfolg.',
      benefitRaw: 'You gain a +4 bonus on your ability checks to trip an opponent. If you trip an opponent, you immediately get a melee attack against that opponent.',
      normalRaw: 'Tripping provokes an attack of opportunity.',
      specialRaw: 'Fighter bonus feat. A monk can select this at level 6 without prerequisites.',
      appEffect: '+4 auf Trip-Prüfung; freier Folgeangriff bei Erfolg'
    },
    whirlwind_attack: {
      id: 'whirlwind_attack',
      nameDe: 'Wirbelwindangriff',
      nameEn: 'Whirlwind Attack',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'combat_expertise' },
        { type: 'feat', id: 'dodge' },
        { type: 'feat', id: 'mobility' },
        { type: 'feat', id: 'spring_attack' },
        { type: 'stat', name: 'dex', value: 13 },
        { type: 'bab', value: 4 }
      ],
      parent: 'spring_attack',
      benefitDe: 'Ein Nahkampfangriff gegen jeden Gegner in Reichweite als volle Aktion.',
      benefitRaw: 'When you use the full attack action, you can give up your regular attacks and instead make one melee attack at your full base attack bonus against each opponent within reach.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Wirbelwind-Rundumschlag (Volle Aktion)'
    },

    // === Ausweichen-Baum ===
    dodge: {
      id: 'dodge',
      nameDe: 'Ausweichen',
      nameEn: 'Dodge',
      category: 'combat',
      prereqs: [{ type: 'stat', name: 'dex', value: 13 }],
      benefitDe: '+1 Ausweich-RK gegen einen ausgewählten Gegner.',
      benefitRaw: 'During your action, you designate an opponent and receive a +1 dodge bonus to AC against attacks from that opponent.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat. A monk can select this at level 1.',
      appEffect: '+1 Ausweich-RK gegen benannten Gegner'
    },
    mobility: {
      id: 'mobility',
      nameDe: 'Mobilität',
      nameEn: 'Mobility',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'dodge' }],
      parent: 'dodge',
      benefitDe: '+4 Ausweich-RK gegen Gelegenheitsangriffe durch Bewegung.',
      benefitRaw: 'You get a +4 dodge bonus to Armor Class against attacks of opportunity caused by you moving out of or within a threatened area.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat. A monk can select this at level 2.',
      appEffect: '+4 RK gegen AoO durch Bewegung'
    },
    spring_attack: {
      id: 'spring_attack',
      nameDe: 'Ausfallschritt (Spring Attack)',
      nameEn: 'Spring Attack',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'mobility' },
        { type: 'bab', value: 4 }
      ],
      parent: 'mobility',
      benefitDe: 'Bewegen vor und nach dem Nahkampfangriff ohne AoO durch das Ziel.',
      benefitRaw: 'You can move, make a single melee attack, and then move again, without provoking an attack of opportunity from the defender.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Angriff in der Bewegung ohne AoO vom Ziel'
    },

    // === Heftiger Angriff-Baum ===
    power_attack: {
      id: 'power_attack',
      nameDe: 'Heftiger Angriff',
      nameEn: 'Power Attack',
      category: 'combat',
      prereqs: [{ type: 'stat', name: 'str', value: 13 }],
      benefitDe: 'Ziehe bis zu BAB vom Angriff ab für +Schadensbonus (1:1 einhändig, 1:2 zweihändig).',
      benefitRaw: 'On your action, before making attack rolls, you may choose to subtract a number from all melee attack rolls and add that same number to all melee damage rolls.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Schaltet Power-Attack-Regler frei'
    },
    cleave: {
      id: 'cleave',
      nameDe: 'Rundumschlag (Cleave)',
      nameEn: 'Cleave',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'power_attack' }],
      parent: 'power_attack',
      benefitDe: 'Sofortiger Zusatzangriff bei Ausschalten eines Gegners (1-mal pro Runde).',
      benefitRaw: 'If you deal a creature enough damage to make it drop, you get an immediate extra melee attack against another creature within reach.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Zusatzangriff bei besiegtem Gegner (1/Runde)'
    },
    great_cleave: {
      id: 'great_cleave',
      nameDe: 'Großer Rundumschlag',
      nameEn: 'Great Cleave',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'cleave' },
        { type: 'bab', value: 4 }
      ],
      parent: 'cleave',
      benefitDe: 'Keine Rundenbeschränkung für Rundumschläge.',
      benefitRaw: 'This feat works like Cleave, except that there is no limit to the number of times you can use it per round.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Beliebig viele Rundumschläge pro Runde'
    },
    improved_bull_rush: {
      id: 'improved_bull_rush',
      nameDe: 'Verbessertes Anstürmen',
      nameEn: 'Improved Bull Rush',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'power_attack' }],
      parent: 'power_attack',
      benefitDe: '+4 auf Ansturmwürfe; provoziert keinen Gelegenheitsangriff.',
      benefitRaw: 'You gain a +4 bonus on your Strength checks to bull rush an opponent, and you do not provoke an attack of opportunity.',
      normalRaw: 'Bull rushing provokes an AoO.',
      specialRaw: 'Fighter bonus feat.',
      appEffect: '+4 auf Ansturmwürfe; kein AoO'
    },
    improved_overrun: {
      id: 'improved_overrun',
      nameDe: 'Verbessertes Überrennen',
      nameEn: 'Improved Overrun',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'power_attack' }],
      parent: 'power_attack',
      benefitDe: '+4 auf Überrennprüfungen; Gegner kann nicht ausweichen.',
      benefitRaw: 'When you overrun, the target may not choose to avoid you. You also gain a +4 bonus on Strength checks to knock down the target.',
      normalRaw: 'Opponent can choose to avoid you.',
      specialRaw: 'Fighter bonus feat. A monk can select this at level 1.',
      appEffect: '+4 auf Überrennprüfungen; kein Ausweichen'
    },
    improved_sunder: {
      id: 'improved_sunder',
      nameDe: 'Verbessertes Waffenschlagen',
      nameEn: 'Improved Sunder',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'power_attack' }],
      parent: 'power_attack',
      benefitDe: '+4 auf Gegenstände-Zerschlagen-Würfe; kein Gelegenheitsangriff.',
      benefitRaw: 'You gain a +4 bonus on attack rolls to strike an opponent’s weapon or shield, and you do not provoke an attack of opportunity.',
      normalRaw: 'Sunder attempts provoke an AoO.',
      specialRaw: 'Fighter bonus feat.',
      appEffect: '+4 auf Zerschlagen-Angriffe; kein AoO'
    },

    // === Fernkampf-Baum ===
    point_blank_shot: {
      id: 'point_blank_shot',
      nameDe: 'Nahkampf (Point-Blank Shot)',
      nameEn: 'Point-Blank Shot',
      category: 'combat',
      prereqs: [],
      benefitDe: '+1 Angriff und Schaden auf Fernkampfangriffe innerhalb von 30 Fuß (9m).',
      benefitRaw: 'You get a +1 bonus on attack and damage rolls with ranged weapons at ranges up to 30 feet.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: '+1 Fernkampf-Angriff/Schaden bis 30 Fuß'
    },
    far_shot: {
      id: 'far_shot',
      nameDe: 'Weitschuss',
      nameEn: 'Far Shot',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'point_blank_shot' }],
      parent: 'point_blank_shot',
      benefitDe: 'Erhöht die Grundreichweite um 50% (Fernkampf) oder 100% (Wurfwaffen).',
      benefitRaw: 'When you use a ranged weapon, its range increment increases by 50% (or 100% for thrown weapons).',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: '+50% / +100% Reichweitensteigerung'
    },
    precise_shot: {
      id: 'precise_shot',
      nameDe: 'Präzisionsschuss',
      nameEn: 'Precise Shot',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'point_blank_shot' }],
      parent: 'point_blank_shot',
      benefitDe: 'Kein Malus von -4 für Schüsse in den Nahkampf.',
      benefitRaw: 'You can shoot or throw ranged weapons at an opponent engaged in melee without taking the standard -4 penalty.',
      normalRaw: 'Shooting into melee incurs a -4 penalty.',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Kein -4 Malus bei Schuss in den Nahkampf'
    },
    rapid_shot: {
      id: 'rapid_shot',
      nameDe: 'Schnelles Schießen',
      nameEn: 'Rapid Shot',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'point_blank_shot' },
        { type: 'stat', name: 'dex', value: 13 }
      ],
      parent: 'point_blank_shot',
      benefitDe: 'Zusätzlicher Fernkampfangriff pro Runde, alle Angriffe erleiden -2 Malus.',
      benefitRaw: 'You can get one extra attack per round with a ranged weapon. All attacks take a -2 penalty.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat. A ranger can select this at level 2.',
      appEffect: 'Zusätzlicher Angriff im Fernkampf; alle Angriffe -2'
    },
    manyshot: {
      id: 'manyshot',
      nameDe: 'Mehrfachschuss',
      nameEn: 'Manyshot',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'point_blank_shot' },
        { type: 'feat', id: 'rapid_shot' },
        { type: 'stat', name: 'dex', value: 17 },
        { type: 'bab', value: 6 }
      ],
      parent: 'rapid_shot',
      benefitDe: 'Schieße zwei Pfeile gleichzeitig als Standardaktion (kombinierter Angriffswurf).',
      benefitRaw: 'As a standard action, you can fire two arrows at a single opponent within 30 feet. Both arrows use a single attack roll with a -4 penalty.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat. A ranger can select this at level 6.',
      appEffect: 'Zwei Pfeile gleichzeitig abfeuern (Standardaktion, -4)'
    },
    shot_on_the_run: {
      id: 'shot_on_the_run',
      nameDe: 'Schuss aus der Bewegung',
      nameEn: 'Shot on the Run',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'point_blank_shot' },
        { type: 'feat', id: 'dodge' },
        { type: 'feat', id: 'mobility' },
        { type: 'stat', name: 'dex', value: 13 },
        { type: 'bab', value: 4 }
      ],
      parent: 'precise_shot',
      benefitDe: 'Bewegung vor und nach dem Fernkampfangriff als volle Aktion.',
      benefitRaw: 'You can move, make a single ranged attack, and then move again as a full-round action.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Fernkampfangriff während der Bewegung'
    },
    improved_precise_shot: {
      id: 'improved_precise_shot',
      nameDe: 'Verbesserter Präzisionsschuss',
      nameEn: 'Improved Precise Shot',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'point_blank_shot' },
        { type: 'feat', id: 'precise_shot' },
        { type: 'stat', name: 'dex', value: 19 },
        { type: 'bab', value: 11 }
      ],
      parent: 'precise_shot',
      benefitDe: 'Ignoriere teilweise Deckung und Tarnung bei Fernkampfangriffen.',
      benefitRaw: 'Your ranged attacks ignore anything less than total cover and total concealment.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat. A ranger can select this at level 11.',
      appEffect: 'Ignoriere Teil-Deckung / Teil-Tarnung im Fernkampf'
    },

    // === Zwei-Waffen-Baum ===
    two_weapon_fighting: {
      id: 'two_weapon_fighting',
      nameDe: 'Zwei-Waffen-Kampf',
      nameEn: 'Two-Weapon Fighting',
      category: 'combat',
      prereqs: [{ type: 'stat', name: 'dex', value: 15 }],
      benefitDe: 'Verringert Angriffs-Mali für das Kämpfen mit zwei Waffen deutlich.',
      benefitRaw: 'Your penalties for fighting with two weapons are reduced.',
      normalRaw: 'Standard penalties are -6 primary / -10 off-hand.',
      specialRaw: 'Fighter bonus feat. A ranger can select this at level 2.',
      appEffect: 'Reduziert Angriffs-Mali für zwei Waffen auf -2/-2'
    },
    two_weapon_defense: {
      id: 'two_weapon_defense',
      nameDe: 'Zwei-Waffen-Verteidigung',
      nameEn: 'Two-Weapon Defense',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'two_weapon_fighting' }],
      parent: 'two_weapon_fighting',
      benefitDe: '+1 Schild-RK im Kampf mit zwei Waffen (+2 defensiv).',
      benefitRaw: 'When fighting with two weapons, you gain a +1 shield bonus to AC.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: '+1 Schild-RK beim Kampf mit 2 Waffen'
    },
    improved_two_weapon_fighting: {
      id: 'improved_two_weapon_fighting',
      nameDe: 'Verbesserter Zwei-Waffen-Kampf',
      nameEn: 'Improved Two-Weapon Fighting',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'two_weapon_fighting' },
        { type: 'stat', name: 'dex', value: 17 },
        { type: 'bab', value: 6 }
      ],
      parent: 'two_weapon_fighting',
      benefitDe: 'Gewährt einen zweiten Angriff mit der Schildhand (Malus -5).',
      benefitRaw: 'You get a second off-hand attack with a -5 penalty.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat. A ranger can select this at level 6.',
      appEffect: 'Zweiter Angriff mit der Schildhand (-5)'
    },
    greater_two_weapon_fighting: {
      id: 'greater_two_weapon_fighting',
      nameDe: 'Großer Zwei-Waffen-Kampf',
      nameEn: 'Greater Two-Weapon Fighting',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'improved_two_weapon_fighting' },
        { type: 'stat', name: 'dex', value: 19 },
        { type: 'bab', value: 11 }
      ],
      parent: 'improved_two_weapon_fighting',
      benefitDe: 'Gewährt einen dritten Angriff mit der Schildhand (Malus -10).',
      benefitRaw: 'You get a third off-hand attack with a -10 penalty.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat. A ranger can select this at level 11.',
      appEffect: 'Dritter Angriff mit der Schildhand (-10)'
    },

    // === Waffen-Finesse ===
    weapon_finesse: {
      id: 'weapon_finesse',
      nameDe: 'Waffenfeinheit (Weapon Finesse)',
      nameEn: 'Weapon Finesse',
      category: 'combat',
      prereqs: [{ type: 'bab', value: 1 }],
      benefitDe: 'Nutze Ges-Modifikator statt Stä-Modifikator für Nahkampfangriffe mit leichten Waffen.',
      benefitRaw: 'With a light weapon, you may use your Dexterity modifier instead of your Strength modifier on attack rolls.',
      normalRaw: 'Strength modifier is used for melee attack rolls.',
      specialRaw: 'Fighter bonus feat. Natural weapons count as light weapons.',
      appEffect: 'Ges-Mod für Angriffswürfe mit leichten Waffen'
    },

    // === Mönchs- & Unbewaffnet-Baum ===
    improved_unarmed_strike: {
      id: 'improved_unarmed_strike',
      nameDe: 'Verbesserter unbewaffneter Schlag',
      nameEn: 'Improved Unarmed Strike',
      category: 'combat',
      prereqs: [],
      benefitDe: 'Gilt im unbewaffneten Kampf als bewaffnet; provoziert keine AoO.',
      benefitRaw: 'You are considered to be armed even when unarmed. Your unarmed strikes can deal lethal or nonlethal damage.',
      normalRaw: 'Unarmed strikes provoke AoO and deal nonlethal damage.',
      specialRaw: 'Fighter bonus feat. Monks get this for free at level 1.',
      appEffect: 'Kein AoO bei waffenlosem Schlag; freie Wahl lethal/nonlethal'
    },
    improved_grapple: {
      id: 'improved_grapple',
      nameDe: 'Verbessertes Ringen',
      nameEn: 'Improved Grapple',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'improved_unarmed_strike' },
        { type: 'stat', name: 'dex', value: 13 }
      ],
      parent: 'improved_unarmed_strike',
      benefitDe: '+4 auf Ringprüfungen; provoziert keinen Gelegenheitsangriff.',
      benefitRaw: 'You gain a +4 bonus on grapple checks, and you do not provoke an attack of opportunity.',
      normalRaw: 'Grappling attempts provoke an AoO.',
      specialRaw: 'Fighter bonus feat. A monk can select this at level 1.',
      appEffect: '+4 auf Ringerprüfungen; kein AoO'
    },
    deflect_arrows: {
      id: 'deflect_arrows',
      nameDe: 'Pfeile abwehren',
      nameEn: 'Deflect Arrows',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'improved_unarmed_strike' },
        { type: 'stat', name: 'dex', value: 13 }
      ],
      parent: 'improved_unarmed_strike',
      benefitDe: 'Wehre einmal pro Runde einen gegnerischen Fernkampfangriff ab.',
      benefitRaw: 'You must have at least one hand free. Once per round when you would normally be hit by a ranged weapon, you may deflect it so that you take no damage.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat. A monk can select this at level 1.',
      appEffect: 'Wehre 1 Fernkampfangriff pro Runde ab'
    },
    snatch_arrows: {
      id: 'snatch_arrows',
      nameDe: 'Pfeile fangen',
      nameEn: 'Snatch Arrows',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'deflect_arrows' },
        { type: 'stat', name: 'dex', value: 15 }
      ],
      parent: 'deflect_arrows',
      benefitDe: 'Gefangene Fernkampfwaffen können sofort zurückgeworfen werden.',
      benefitRaw: 'You can catch a deflected ranged weapon and immediately throw it back as an immediate action.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Fange Geschosse und wirf sie zurück'
    },
    stunning_fist: {
      id: 'stunning_fist',
      nameDe: 'Betäubender Schlag',
      nameEn: 'Stunning Fist',
      category: 'combat',
      prereqs: [
        { type: 'feat', id: 'improved_unarmed_strike' },
        { type: 'stat', name: 'dex', value: 13 },
        { type: 'stat', name: 'wis', value: 13 },
        { type: 'bab', value: 8 }
      ],
      parent: 'improved_unarmed_strike',
      benefitDe: 'Betäube einen Gegner bei einem erfolgreichen unbewaffneten Angriff (ZÄ-Rettungswurf).',
      benefitRaw: 'Declare a stunning attack before rolling. If you hit, target must succeed on a Fortitude save (DC 10 + 1/2 character level + Wis mod) or be stunned for 1 round.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat. A monk can select this at level 1. Monks get 1 stun attempt per level per day.',
      appEffect: 'Schaltet Betäubenden Schlag frei'
    },

    // === Mounted Combat-Baum ===
    mounted_combat: {
      id: 'mounted_combat',
      nameDe: 'Kampf zu Pferd',
      nameEn: 'Mounted Combat',
      category: 'combat',
      prereqs: [{ type: 'custom', desc: 'Reiten 1 Rang' }],
      benefitDe: 'Negiere Treffer gegen dein Reittier durch eine erfolgreiche Reiten-Prüfung (1/Runde).',
      benefitRaw: 'Once per round when your mount is hit in combat, you may make a Ride check to negate the hit.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Negiere Treffer auf Reittier via Reiten-Wurf (1/Runde)'
    },
    mounted_archery: {
      id: 'mounted_archery',
      nameDe: 'Berittener Bogenschütze',
      nameEn: 'Mounted Archery',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'mounted_combat' }],
      parent: 'mounted_combat',
      benefitDe: 'Halbiert die Mali für Fernkampfangriffe im Sattel (-2 bei Bewegung, -4 beim Galopp).',
      benefitRaw: 'Penalties for ranged attacks while mounted are halved.',
      normalRaw: 'Standard penalties are -4 (moving) / -8 (galloping).',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Halbiert Fernkampf-Mali auf Reittier (-2/-4)'
    },
    ride_by_attack: {
      id: 'ride_by_attack',
      nameDe: 'Vorbeireiten',
      nameEn: 'Ride-By Attack',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'mounted_combat' }],
      parent: 'mounted_combat',
      benefitDe: 'Bewege dich vor und nach einem berittenen Sturmangriff (Charge) in gerader Linie.',
      benefitRaw: 'When you charge on a mount, you may move and attack, and then move again in a straight line.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Bewegung nach berittenem Sturmangriff in gerader Linie'
    },
    spirited_charge: {
      id: 'spirited_charge',
      nameDe: 'Mächtiger berittener Sturmangriff',
      nameEn: 'Spirited Charge',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'ride_by_attack' }],
      parent: 'ride_by_attack',
      benefitDe: 'Verdopple Nahkampfschaden bei berittenem Sturmangriff (verdreifache mit Lanze).',
      benefitRaw: 'When mounted and making a charge, you deal double damage with a melee weapon (triple with a lance).',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'x2 Schaden / x3 Lanzen-Schaden bei berittenem Charge'
    },
    trample: {
      id: 'trample',
      nameDe: 'Niedertrampeln',
      nameEn: 'Trample',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'mounted_combat' }],
      parent: 'mounted_combat',
      benefitDe: 'Gegner kann Overrun-Versuch mit Reittier nicht ausweichen (Zusatzangriff bei Erfolg).',
      benefitRaw: 'When you overrun an opponent while mounted, the target cannot choose to avoid you.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Reittier-Trampelangriff; kein Ausweichen möglich'
    },

    // === Zauberfokus & Magie-Talente ===
    spell_focus: {
      id: 'spell_focus',
      nameDe: 'Zauberfokus',
      nameEn: 'Spell Focus',
      category: 'general',
      prereqs: [],
      hasOption: true,
      optionType: 'school',
      benefitDe: '+1 Bonus auf den Rettungswurf-SG für Zauber der gewählten Magieschule.',
      benefitRaw: 'Add +1 to the Difficulty Class for all saving throws against spells from the school of magic you select.',
      normalRaw: '',
      specialRaw: 'You can gain this feat multiple times, choosing a different school each time.',
      appEffect: '+1 auf Rettungswurf-SG der gewählten Magieschule'
    },
    greater_spell_focus: {
      id: 'greater_spell_focus',
      nameDe: 'Mächtiger Zauberfokus',
      nameEn: 'Greater Spell Focus',
      category: 'general',
      prereqs: [{ type: 'feat', id: 'spell_focus' }],
      parent: 'spell_focus',
      hasOption: true,
      optionType: 'school',
      benefitDe: 'Zusätzlicher +1 Bonus (+2 Gesamt) auf Rettungswurf-SGs der gewählten Magieschule.',
      benefitRaw: 'Add +1 to the Difficulty Class for all saving throws against spells from the school of magic you select.',
      normalRaw: '',
      specialRaw: 'You can gain this feat multiple times, choosing a different school each time.',
      appEffect: 'Zusätzlich +1 auf Rettungswurf-SG der gewählten Schule'
    },
    spell_penetration: {
      id: 'spell_penetration',
      nameDe: 'Zauberüberwindung',
      nameEn: 'Spell Penetration',
      category: 'general',
      prereqs: [],
      benefitDe: '+2 Bonus auf Caster-Level-Würfe zur Überwindung von Zauberresistenz.',
      benefitRaw: 'You get a +2 bonus on caster level checks to defeat a creature’s spell resistance.',
      normalRaw: '',
      specialRaw: '',
      appEffect: '+2 auf Zauberresistenz-Überwindungswürfe'
    },
    greater_spell_penetration: {
      id: 'greater_spell_penetration',
      nameDe: 'Mächtige Zauberüberwindung',
      nameEn: 'Greater Spell Penetration',
      category: 'general',
      prereqs: [{ type: 'feat', id: 'spell_penetration' }],
      parent: 'spell_penetration',
      benefitDe: 'Zusätzlicher +2 Bonus (+4 Gesamt) zur Überwindung von Zauberresistenz.',
      benefitRaw: 'You get a +2 bonus on caster level checks to defeat spell resistance. This stacks with Spell Penetration.',
      normalRaw: '',
      specialRaw: '',
      appEffect: 'Zusätzlich +2 auf Zauberresistenz-Überwindungswürfe'
    },
    combat_casting: {
      id: 'combat_casting',
      nameDe: 'Kampfzauberei',
      nameEn: 'Combat Casting',
      category: 'general',
      prereqs: [],
      benefitDe: '+4 Bonus auf Konzentrationswürfe bei defensiver Zauberei oder im Nahkampf.',
      benefitRaw: 'You get a +4 bonus on Concentration checks made to cast a spell or use a spell-like ability while on the defensive or while grappling.',
      normalRaw: '',
      specialRaw: '',
      appEffect: '+4 Konzentration beim defensiven Zaubern'
    },
    natural_spell: {
      id: 'natural_spell',
      nameDe: 'Natürliches Zaubern',
      nameEn: 'Natural Spell',
      category: 'general',
      prereqs: [
        { type: 'stat', name: 'wis', value: 13 },
        { type: 'custom', desc: 'Tiergestalt (Wild Shape)' }
      ],
      benefitDe: 'Erlaubt das Zaubern während der Tiergestalt (Wild Shape).',
      benefitRaw: 'You can complete the somatic and verbal components of a spell while in wild shape.',
      normalRaw: '',
      specialRaw: '',
      appEffect: 'Erlaubt Zaubern in Tiergestalt'
    },
    eschew_materials: {
      id: 'eschew_materials',
      nameDe: 'Materialkomponenten weglassen',
      nameEn: 'Eschew Materials',
      category: 'general',
      prereqs: [],
      benefitDe: 'Zaubere ohne Materialkomponenten, die weniger als 1 Goldmünze kosten.',
      benefitRaw: 'You can cast any spell that has a material component costing 1 gp or less without needing that component.',
      normalRaw: '',
      specialRaw: '',
      appEffect: 'Keine Standard-Materialkomponenten nötig (<1 GM)'
    },
    spell_mastery: {
      id: 'spell_mastery',
      nameDe: 'Zaubermeisterschaft',
      nameEn: 'Spell Mastery',
      category: 'general',
      prereqs: [{ type: 'class', class: 'wizard' }],
      benefitDe: 'Bereite bestimmte Zauber ohne Magier-Zauberbuch vor.',
      benefitRaw: 'Each time you take this feat, choose a number of spells equal to your Intelligence modifier. You can prepare these spells without a spellbook.',
      normalRaw: '',
      specialRaw: 'Wizard only.',
      appEffect: 'Einige Zauber ohne Zauberbuch vorbereiten'
    },

    // === Sonstige PHB-Talente ===
    run: {
      id: 'run',
      nameDe: 'Rennen',
      nameEn: 'Run',
      category: 'general',
      prereqs: [],
      benefitDe: 'Renne mit 5-facher Geschwindigkeit; erhalte +4 auf Weitsprung-Würfe.',
      benefitRaw: 'You run at 5 times your normal speed (if wearing light or no armor) or 4 times speed (in medium/heavy armor). You keep Dex bonus to AC while running.',
      normalRaw: 'Run at 4 times normal speed and lose Dex bonus to AC.',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'x5 Renn-Geschwindigkeit; +4 Weitsprung'
    },
    track: {
      id: 'track',
      nameDe: 'Fährtensuchen',
      nameEn: 'Track',
      category: 'general',
      prereqs: [],
      benefitDe: 'Erlaubt das Nutzen von Überleben, um Fährten zu suchen.',
      benefitRaw: 'To find tracks or to follow them, make a Survival check (DC depends on terrain/conditions).',
      normalRaw: 'Cannot follow tracks without this feat.',
      specialRaw: 'Rangers get this for free at level 1.',
      appEffect: 'Erlaubt Fährtensuche via Überleben'
    },
    endurance: {
      id: 'endurance',
      nameDe: 'Ausdauer',
      nameEn: 'Endurance',
      category: 'general',
      prereqs: [],
      benefitDe: '+4 Bonus auf Zähigkeitsproben gegen Erschöpfung, Durst, Hunger und Kälte.',
      benefitRaw: 'You gain a +4 bonus on checks/saves made to resist nonlethal damage, swim/run exhaustion, hot/cold environments, or sleep deprivation.',
      normalRaw: '',
      specialRaw: 'Rangers get this for free at level 3.',
      appEffect: '+4 auf Zähigkeitsprüfungen gegen Erschöpfung/Umwelt'
    },
    diehard: {
      id: 'diehard',
      nameDe: 'Stehaufmännchen (Diehard)',
      nameEn: 'Diehard',
      category: 'general',
      prereqs: [{ type: 'feat', id: 'endurance' }],
      parent: 'endurance',
      benefitDe: 'Bleibe bei -1 bis -9 TP handlungsfähig (Gilt als Kampfunfähig, verliert nicht automatisch TP).',
      benefitRaw: 'If reduced to -1 to -9 hp, you automatically stabilize. You can choose to act as disabled rather than dying.',
      normalRaw: 'At -1 to -9 hp, you are unconscious and losing 1 hp per round.',
      specialRaw: '',
      appEffect: 'Handlungsfähig bei -1 bis -9 TP'
    },
    leadership: {
      id: 'leadership',
      nameDe: 'Anführerschaft',
      nameEn: 'Leadership',
      category: 'general',
      prereqs: [{ type: 'level', value: 6 }],
      benefitDe: 'Gewährt einen loyalen Gefährten (Cohort) und eine Schar Gefolgsleute.',
      benefitRaw: 'You attract a loyal cohort and followers who assist you in your adventures.',
      normalRaw: '',
      specialRaw: '',
      appEffect: 'Schaltet Gefährten/Gefolgsleute frei'
    },

    // === Rüstungs- & Waffen-Kompetenzen ===
    armor_light: {
      id: 'armor_light',
      nameDe: 'Umgang mit leichter Rüstung',
      nameEn: 'Armor Proficiency (light)',
      category: 'general',
      prereqs: [],
      benefitDe: 'Kein Malus auf Angriffswürfe beim Tragen leichter Rüstung.',
      benefitRaw: 'When you wear light armor, the armor check penalty applies only to skill checks, not attack rolls.',
      normalRaw: 'Wearing non-proficient armor applies penalty to attack rolls.',
      specialRaw: 'Most martial classes get this for free.',
      appEffect: 'Kein Angriffs-Malus durch leichte Rüstung'
    },
    armor_medium: {
      id: 'armor_medium',
      nameDe: 'Umgang mit mittelschwerer Rüstung',
      nameEn: 'Armor Proficiency (medium)',
      category: 'general',
      prereqs: [{ type: 'feat', id: 'armor_light' }],
      parent: 'armor_light',
      benefitDe: 'Kein Malus auf Angriffswürfe beim Tragen mittelschwerer Rüstung.',
      benefitRaw: 'When you wear medium armor, the armor check penalty does not apply to attack rolls.',
      normalRaw: '',
      specialRaw: '',
      appEffect: 'Kein Angriffs-Malus durch mittelschwere Rüstung'
    },
    armor_heavy: {
      id: 'armor_heavy',
      nameDe: 'Umgang mit schwerer Rüstung',
      nameEn: 'Armor Proficiency (heavy)',
      category: 'general',
      prereqs: [{ type: 'feat', id: 'armor_medium' }],
      parent: 'armor_medium',
      benefitDe: 'Kein Malus auf Angriffswürfe beim Tragen schwerer Rüstung.',
      benefitRaw: 'When you wear heavy armor, the armor check penalty does not apply to attack rolls.',
      normalRaw: '',
      specialRaw: '',
      appEffect: 'Kein Angriffs-Malus durch schwere Rüstung'
    },
    shield_prof: {
      id: 'shield_prof',
      nameDe: 'Umgang mit Schilden',
      nameEn: 'Shield Proficiency',
      category: 'general',
      prereqs: [],
      benefitDe: 'Kein Malus auf Angriffswürfe bei Nutzung eines Schildes.',
      benefitRaw: 'When you use a shield, the shield check penalty applies only to skill checks, not attack rolls.',
      normalRaw: '',
      specialRaw: '',
      appEffect: 'Kein Angriffs-Malus durch Schilde'
    },
    improved_shield_bash: {
      id: 'improved_shield_bash',
      nameDe: 'Verbesserter Schildstoß',
      nameEn: 'Improved Shield Bash',
      category: 'combat',
      prereqs: [{ type: 'feat', id: 'shield_prof' }],
      parent: 'shield_prof',
      benefitDe: 'Behalte den Schild-Bonus auf RK bei einem Schildstoß-Angriff.',
      benefitRaw: 'When you perform a shield bash, you may still apply the shield’s shield bonus to your AC.',
      normalRaw: 'You lose shield bonus to AC when bashing.',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Behalte RK-Schildbonus bei Schildstoß'
    },
    tower_shield_prof: {
      id: 'tower_shield_prof',
      nameDe: 'Umgang mit Turmschilden',
      nameEn: 'Tower Shield Proficiency',
      category: 'general',
      prereqs: [{ type: 'feat', id: 'shield_prof' }],
      parent: 'shield_prof',
      benefitDe: 'Kein Malus auf Angriffswürfe bei Nutzung eines Turmschildes.',
      benefitRaw: 'When you use a tower shield, its penalty applies only to skill checks, not attack rolls.',
      normalRaw: '',
      specialRaw: 'Fighters get this for free.',
      appEffect: 'Kein Angriffs-Malus durch Turmschilde'
    },
    simple_weapon_prof: {
      id: 'simple_weapon_prof',
      nameDe: 'Umgang mit einfachen Waffen',
      nameEn: 'Simple Weapon Proficiency',
      category: 'general',
      prereqs: [],
      benefitDe: 'Kein Malus von -4 auf Angriffe mit einfachen Waffen.',
      benefitRaw: 'You make attack rolls with simple weapons without penalty.',
      normalRaw: 'Non-proficient attacks suffer a -4 penalty.',
      specialRaw: '',
      appEffect: 'Kein Malus bei einfachen Waffen'
    },
    martial_weapon_prof: {
      id: 'martial_weapon_prof',
      nameDe: 'Umgang mit Kriegswaffen',
      nameEn: 'Martial Weapon Proficiency',
      category: 'general',
      prereqs: [],
      hasOption: true,
      optionType: 'weapon',
      benefitDe: 'Kein Malus von -4 auf Angriffe mit der gewählten Kriegswaffe.',
      benefitRaw: 'You make attack rolls with the selected martial weapon without penalty.',
      normalRaw: '',
      specialRaw: 'Fighters, Paladins, Rangers get all martial proficiencies.',
      appEffect: 'Kein Malus bei der gewählten Kriegswaffe'
    },
    exotic_weapon_prof: {
      id: 'exotic_weapon_prof',
      nameDe: 'Umgang mit exotischen Waffen',
      nameEn: 'Exotic Weapon Proficiency',
      category: 'combat',
      prereqs: [{ type: 'bab', value: 1 }],
      hasOption: true,
      optionType: 'weapon',
      benefitDe: 'Kein Malus von -4 auf Angriffe mit der gewählten exotischen Waffe.',
      benefitRaw: 'You make attack rolls with the selected exotic weapon without penalty.',
      normalRaw: '',
      specialRaw: 'Fighter bonus feat.',
      appEffect: 'Kein Malus bei der gewählten exotischen Waffe'
    },

    // === Fertigkeits-Talente ===
    acrobatic: { id: 'acrobatic', nameDe: 'Akrobatisch', nameEn: 'Acrobatic', category: 'general', prereqs: [], benefitDe: '+2 auf Springen und Akrobatik.', benefitRaw: '+2 bonus on Jump and Tumble checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Springen und Akrobatik' },
    agile: { id: 'agile', nameDe: 'Flink', nameEn: 'Agile', category: 'general', prereqs: [], benefitDe: '+2 auf Balance und Entfesselungskunst.', benefitRaw: '+2 bonus on Balance and Escape Artist checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Balance und Entfesselungskunst' },
    alertness: { id: 'alertness', nameDe: 'Aufmerksamkeit', nameEn: 'Alertness', category: 'general', prereqs: [], benefitDe: '+2 auf Lauschen und Entdecken.', benefitRaw: '+2 bonus on Listen and Spot checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Lauschen und Entdecken' },
    animal_affinity: { id: 'animal_affinity', nameDe: 'Tierfreund', nameEn: 'Animal Affinity', category: 'general', prereqs: [], benefitDe: '+2 auf Mit Tieren umgehen und Reiten.', benefitRaw: '+2 bonus on Handle Animal and Ride checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Mit Tieren umgehen und Reiten' },
    athletic: { id: 'athletic', nameDe: 'Athletisch', nameEn: 'Athletic', category: 'general', prereqs: [], benefitDe: '+2 auf Klettern und Schwimmen.', benefitRaw: '+2 bonus on Climb and Swim checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Klettern und Schwimmen' },
    deceitful: { id: 'deceitful', nameDe: 'Verlogen', nameEn: 'Deceitful', category: 'general', prereqs: [], benefitDe: '+2 auf Verkleiden und Fälschen.', benefitRaw: '+2 bonus on Disguise and Forgery checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Verkleiden und Fälschen' },
    deft_hands: { id: 'deft_hands', nameDe: 'Geschickte Hände', nameEn: 'Deft Hands', category: 'general', prereqs: [], benefitDe: '+2 auf Taschendiebstahl und Seilbenutzung.', benefitRaw: '+2 bonus on Sleight of Hand and Use Rope checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Taschendiebstahl und Seilbenutzung' },
    diligent: { id: 'diligent', nameDe: 'Sorgfältig', nameEn: 'Diligent', category: 'general', prereqs: [], benefitDe: '+2 auf Schätzen und Zauberkunde entziffern.', benefitRaw: '+2 bonus on Appraise and Decipher Script checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Schätzen und Entziffern' },
    investigator: { id: 'investigator', nameDe: 'Ermittler', nameEn: 'Investigator', category: 'general', prereqs: [], benefitDe: '+2 auf Informationen sammeln und Suchen.', benefitRaw: '+2 bonus on Gather Information and Search checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Infos sammeln und Suchen' },
    negotiator: { id: 'negotiator', nameDe: 'Unterhändler', nameEn: 'Negotiator', category: 'general', prereqs: [], benefitDe: '+2 auf Diplomatie und Motiv erkennen.', benefitRaw: '+2 bonus on Diplomacy and Sense Motive checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Diplomatie und Motiv erkennen' },
    nimble_fingers: { id: 'nimble_fingers', nameDe: 'Feingefühl', nameEn: 'Nimble Fingers', category: 'general', prereqs: [], benefitDe: '+2 auf Schloss öffnen und Fallen entschärfen.', benefitRaw: '+2 bonus on Open Lock and Disable Device checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Schloss öffnen und Fallen entschärfen' },
    persuasive: { id: 'persuasive', nameDe: 'Überzeugend', nameEn: 'Persuasive', category: 'general', prereqs: [], benefitDe: '+2 auf Bluffen und Einschüchtern.', benefitRaw: '+2 bonus on Bluff and Intimidate checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Bluffen und Einschüchtern' },
    self_sufficient: { id: 'self_sufficient', nameDe: 'Selbstversorger', nameEn: 'Self-Sufficient', category: 'general', prereqs: [], benefitDe: '+2 auf Heilkunde und Überlebenskunst.', benefitRaw: '+2 bonus on Heal and Survival checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Heilkunde und Überleben' },
    stealthy: { id: 'stealthy', nameDe: 'Heimlich', nameEn: 'Stealthy', category: 'general', prereqs: [], benefitDe: '+2 auf Verstecken und Leise bewegen.', benefitRaw: '+2 bonus on Hide and Move Silently checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Verstecken und Leise bewegen' },
    magical_aptitude: { id: 'magical_aptitude', nameDe: 'Magisches Gespür', nameEn: 'Magical Aptitude', category: 'general', prereqs: [], benefitDe: '+2 auf Zauberkunde und Magischen Gegenstand benutzen.', benefitRaw: '+2 bonus on Spellcraft and Use Magic Device checks.', normalRaw: '', specialRaw: '', appEffect: '+2 auf Zauberkunde und Magischen Gegenstand benutzen' },
    skill_focus: {
      id: 'skill_focus',
      nameDe: 'Fertigkeitsfokus',
      nameEn: 'Skill Focus',
      category: 'general',
      prereqs: [],
      hasOption: true,
      optionType: 'skill',
      benefitDe: '+3 Bonus auf Würfe mit der gewählten Fertigkeit.',
      benefitRaw: 'You get a +3 bonus on all checks involving the chosen skill.',
      normalRaw: '',
      specialRaw: 'You can gain this feat multiple times, choosing a different skill each time.',
      appEffect: '+3 Bonus auf gewählte Fertigkeit'
    },

    // === Gegenstandserschaffung (Item Creation) ===
    brew_potion: { id: 'brew_potion', nameDe: 'Tränke brauen', nameEn: 'Brew Potion', category: 'item_creation', prereqs: [{ type: 'casterLevel', value: 3 }], benefitDe: 'Erschaffe magische Tränke (Zaubergrad bis 3).', benefitRaw: 'Create magic potions of spells level 3 or lower.', normalRaw: '', specialRaw: '', appEffect: 'Tränke brauen freigeschaltet (ab Caster-Lvl 3)' },
    scribe_scroll: { id: 'scribe_scroll', nameDe: 'Schriftrollen schreiben', nameEn: 'Scribe Scroll', category: 'item_creation', prereqs: [{ type: 'casterLevel', value: 1 }], benefitDe: 'Erschaffe magische Schriftrollen.', benefitRaw: 'Create magic scrolls.', normalRaw: '', specialRaw: '', appEffect: 'Schriftrollen schreiben freigeschaltet' },
    craft_wand: { id: 'craft_wand', nameDe: 'Zauberstäbe herstellen', nameEn: 'Craft Wand', category: 'item_creation', prereqs: [{ type: 'casterLevel', value: 5 }], benefitDe: 'Erschaffe magische Zauberstäbe (Zaubergrad bis 4).', benefitRaw: 'Create magic wands of spells level 4 or lower.', normalRaw: '', specialRaw: '', appEffect: 'Zauberstäbe herstellen freigeschaltet (ab Caster-Lvl 5)' },
    craft_arms_armor: { id: 'craft_arms_armor', nameDe: 'Magische Waffen & Rüstungen herstellen', nameEn: 'Craft Magic Arms and Armor', category: 'item_creation', prereqs: [{ type: 'casterLevel', value: 5 }], benefitDe: 'Erschaffe magische Waffen, Rüstungen und Schilde.', benefitRaw: 'Create magic weapons, armor, and shields.', normalRaw: '', specialRaw: '', appEffect: 'Waffen/Rüstungen herstellen freigeschaltet (ab Caster-Lvl 5)' },
    craft_wondrous: { id: 'craft_wondrous', nameDe: 'Wundersame Gegenstände erschaffen', nameEn: 'Craft Wondrous Item', category: 'item_creation', prereqs: [{ type: 'casterLevel', value: 3 }], benefitDe: 'Erschaffe wundersame Gegenstände.', benefitRaw: 'Create magic wondrous items.', normalRaw: '', specialRaw: '', appEffect: 'Wundersame Gegenstände herstellen freigeschaltet (ab Caster-Lvl 3)' },
    craft_rod: { id: 'craft_rod', nameDe: 'Zepter herstellen', nameEn: 'Craft Rod', category: 'item_creation', prereqs: [{ type: 'casterLevel', value: 9 }], benefitDe: 'Erschaffe magische Zepter.', benefitRaw: 'Create magic rods.', normalRaw: '', specialRaw: '', appEffect: 'Zepter herstellen freigeschaltet (ab Caster-Lvl 9)' },
    craft_staff: { id: 'craft_staff', nameDe: 'Stecken herstellen', nameEn: 'Craft Staff', category: 'item_creation', prereqs: [{ type: 'casterLevel', value: 12 }], benefitDe: 'Erschaffe magische Stecken.', benefitRaw: 'Create magic staffs.', normalRaw: '', specialRaw: '', appEffect: 'Stecken herstellen freigeschaltet (ab Caster-Lvl 12)' },
    forge_ring: { id: 'forge_ring', nameDe: 'Ringe schmieden', nameEn: 'Forge Ring', category: 'item_creation', prereqs: [{ type: 'casterLevel', value: 12 }], benefitDe: 'Erschaffe magische Ringe.', benefitRaw: 'Create magic rings.', normalRaw: '', specialRaw: '', appEffect: 'Ringe schmieden freigeschaltet (ab Caster-Lvl 12)' },

    // === Metamagische Talente (Metamagic) ===
    empower_spell: { id: 'empower_spell', nameDe: 'Zauber verstärken', nameEn: 'Empower Spell', category: 'metamagic', prereqs: [], benefitDe: 'Erhöht variable Zaubereffekte um 50% (+2 Zaubergrade).', benefitRaw: 'Increase spell’s variable, numeric effects by 50% (+2 spell slot level).', normalRaw: '', specialRaw: '', appEffect: '+2 Zaubergrade Slot-Erhöhung' },
    enlarge_spell: { id: 'enlarge_spell', nameDe: 'Zauber ausdehnen', nameEn: 'Enlarge Spell', category: 'metamagic', prereqs: [], benefitDe: 'Verdoppelt die Zauberreichweite (+1 Zaubergrad).', benefitRaw: 'Double spell’s range (+1 spell slot level).', normalRaw: '', specialRaw: '', appEffect: '+1 Zaubergrad Slot-Erhöhung' },
    extend_spell: { id: 'extend_spell', nameDe: 'Zauber verlängern', nameEn: 'Extend Spell', category: 'metamagic', prereqs: [], benefitDe: 'Verdoppelt die Zauberdauer (+1 Zaubergrad).', benefitRaw: 'Double spell’s duration (+1 spell slot level).', normalRaw: '', specialRaw: '', appEffect: '+1 Zaubergrad Slot-Erhöhung' },
    heighten_spell: { id: 'heighten_spell', nameDe: 'Zauber erhöhen', nameEn: 'Heighten Spell', category: 'metamagic', prereqs: [], benefitDe: 'Bereitet Zauber in höherem Slot vor, erhöht Rettungswurf-SG.', benefitRaw: 'Cast spells as higher level (slot level used determines DC and target).', normalRaw: '', specialRaw: '', appEffect: 'Freie Slot-Erhöhung für SG-Steigerung' },
    maximize_spell: { id: 'maximize_spell', nameDe: 'Zauber maximieren', nameEn: 'Maximize Spell', category: 'metamagic', prereqs: [], benefitDe: 'Maximiert alle variablen Zaubereffekte (+3 Zaubergrade).', benefitRaw: 'Maximize spell’s variable, numeric effects (+3 spell slot level).', normalRaw: '', specialRaw: '', appEffect: '+3 Zaubergrade Slot-Erhöhung' },
    quicken_spell: { id: 'quicken_spell', nameDe: 'Zauber beschleunigen', nameEn: 'Quicken Spell', category: 'metamagic', prereqs: [], benefitDe: 'Zaubere als freie Aktion (+4 Zaubergrade).', benefitRaw: 'Cast spells as a swift action (+4 spell slot level).', normalRaw: '', specialRaw: '', appEffect: '+4 Zaubergrade Slot-Erhöhung' },
    silent_spell: { id: 'silent_spell', nameDe: 'Stummes Zaubern', nameEn: 'Silent Spell', category: 'metamagic', prereqs: [], benefitDe: 'Zaubere ohne verbale Komponenten (+1 Zaubergrad).', benefitRaw: 'Cast spells without verbal components (+1 spell slot level).', normalRaw: '', specialRaw: '', appEffect: '+1 Zaubergrad Slot-Erhöhung' },
    still_spell: { id: 'still_spell', nameDe: 'Gestenloses Zaubern', nameEn: 'Still Spell', category: 'metamagic', prereqs: [], benefitDe: 'Zaubere ohne gestische Komponenten (+1 Zaubergrad).', benefitRaw: 'Cast spells without somatic components (+1 spell slot level).', normalRaw: '', specialRaw: '', appEffect: '+1 Zaubergrad Slot-Erhöhung' },
    widen_spell: { id: 'widen_spell', nameDe: 'Zauber erweitern', nameEn: 'Widen Spell', category: 'metamagic', prereqs: [], benefitDe: 'Verdoppelt den Wirkungsbereich des Zaubers (+3 Zaubergrade).', benefitRaw: 'Double spell’s area (+3 spell slot level).', normalRaw: '', specialRaw: '', appEffect: '+3 Zaubergrade Slot-Erhöhung' }
  }
};

/**
 * Pure prerequisite checker for the rules layer.
 * Returns { met: boolean, unmetDescs: string[] }.
 * Can be imported by PCManager.js without creating a circular dependency.
 */
export function checkFeatPrerequisites(featId, pc) {
  const feat = CombatFeats.REGISTRY[featId];
  if (!feat || !Array.isArray(feat.prereqs) || feat.prereqs.length === 0) {
    return { met: true, unmetDescs: [] };
  }

  const learnedIds  = Array.isArray(pc.feats) ? pc.feats.map(f => f.id) : [];
  let met           = true;
  const unmetDescs  = [];

  feat.prereqs.forEach(pr => {
    let prMet = false;
    let desc  = '';

    if (pr.type === 'bab') {
      const pcBab = pc.bab ? pc.bab.getValue() : 0;
      prMet = pcBab >= pr.value;
      desc  = `Grundangriffsbonus +${pr.value} (aktuell: +${pcBab})`;
    } else if (pr.type === 'feat') {
      prMet = learnedIds.includes(pr.id);
      const pf = CombatFeats.REGISTRY[pr.id];
      desc  = `Talent: ${pf ? pf.nameDe : pr.id}`;
    } else if (pr.type === 'classLevel') {
      const cls = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === pr.class) : null;
      const lvl = cls ? cls.level : 0;
      prMet = lvl >= pr.value;
      desc  = `${pr.class} Stufe ${pr.value} (aktuell: ${lvl})`;
    } else if (pr.type === 'class') {
      prMet = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === pr.class);
      desc  = `Klasse: ${pr.class}`;
    } else if (pr.type === 'stat') {
      const nameMap = { str: 'Stärke', dex: 'Geschicklichkeit', con: 'Konstitution', int: 'Intelligenz', wis: 'Weisheit', cha: 'Charisma' };
      const val = pc[pr.name] ? pc[pr.name].getValue() : 10;
      prMet = val >= pr.value;
      desc  = `${nameMap[pr.name] || pr.name} ${pr.value}+ (aktuell: ${val})`;
    } else if (pr.type === 'level') {
      prMet = (pc.level || 1) >= pr.value;
      desc  = `Charakterstufe ${pr.value} (aktuell: ${pc.level || 1})`;
    } else if (pr.type === 'casterLevel') {
      let maxCL = 0;
      if (Array.isArray(pc.classes)) {
        pc.classes.forEach(c => {
          if (['wizard','cleric','druid','sorcerer','bard'].includes(c.classType)) {
            maxCL = Math.max(maxCL, c.level);
          } else if (['paladin','ranger'].includes(c.classType) && c.level >= 4) {
            maxCL = Math.max(maxCL, Math.floor(c.level / 2));
          }
        });
      }
      prMet = maxCL >= pr.value;
      desc  = `Zaubererstufe ${pr.value} (aktuell: ${maxCL})`;
    } else if (pr.type === 'custom') {
      if (pr.desc === 'Fähigkeit, Untote zu vertreiben') {
        const clericClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'cleric') : null;
        const paladinClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'paladin') : null;
        const clericLvl = clericClass ? clericClass.level : 0;
        const paladinLvl = paladinClass ? paladinClass.level : 0;
        prMet = clericLvl >= 1 || paladinLvl >= 4;
        desc = `Fähigkeit, Untote zu vertreiben (Kleriker 1+ oder Paladin 4+)`;
      } else if (pr.desc === 'Bardenmusik') {
        const bardClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'bard') : null;
        const bardLvl = bardClass ? bardClass.level : 0;
        prMet = bardLvl >= 1;
        desc = `Bardenmusik (Barde 1+)`;
      } else if (pr.desc === 'Tiergestalt (Wild Shape)') {
        const druidClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'druid') : null;
        const druidLvl = druidClass ? druidClass.level : 0;
        prMet = druidLvl >= 5;
        desc = `Tiergestalt (Druide 5+)`;
      } else if (pr.desc === 'Reiten 1 Rang') {
        let ranks = 0;
        if (typeof pc.getSkillRanks === 'function') {
          ranks = pc.getSkillRanks('ride');
        } else if (pc.skills && pc.skills['ride']) {
          ranks = parseFloat(pc.skills['ride'].ranks) || 0;
        }
        prMet = ranks >= 1;
        desc = `Reiten 1 Rang (aktuell: ${ranks})`;
      } else {
        prMet = true;
        desc = `Spezial: ${pr.desc}`;
      }
    }

    if (!prMet) {
      met = false;
      unmetDescs.push(desc);
    }
  });

  return { met, unmetDescs };
}

/**
 * Returns the IDs of all feats that have a prerequisite of type 'class'
 * matching the given classType. Used by PCManager to clean up orphaned feats
 * after a class swap.
 */
export function getFeatIdsByClassPrereq(classType) {
  return Object.keys(CombatFeats.REGISTRY).filter(id => {
    const feat = CombatFeats.REGISTRY[id];
    return Array.isArray(feat.prereqs) && feat.prereqs.some(
      pr => pr.type === 'class' && pr.class === classType
    );
  });
}
