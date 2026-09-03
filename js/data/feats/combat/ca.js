export const COMBAT_FEATS_REGISTRY_CA = {
  "expert_tactician": {
    "id": "expert_tactician",
    "nameDe": "Erfahrener Taktiker",
    "nameEn": "Expert Tactician",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "dex", "value": 13 },
      { "type": "feat", "id": "combat_reflexes" },
      { "type": "bab", "value": 2 }
    ],
    "benefitDe": "Triffst du einen Gegner im Nahkampf mit einem Gelegenheitsangriff, erhalten du und alle Verbündeten bis zum Beginn deines nächsten Zugs einen Situationsbonus von +2 auf Nahkampf-Angriffs- und Schadenswürfe gegen dieses Ziel.",
    "benefitRaw": "If you hit a creature with an attack of opportunity in melee, you and all allies gain a +2 circumstance bonus on melee attack rolls and damage rolls against that creature until the start of your next turn.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Expert Tactician as one of his fighter bonus feats.",
    "appEffect": "+2 Angriffs- und Schadensbonus für Gruppe nach erfolgreichem Gelegenheitsangriff"
  },
  "brutal_throw": {
    "id": "brutal_throw",
    "nameDe": "Brutaler Wurf",
    "nameEn": "Brutal Throw",
    "category": "combat",
    "source": "ca",
    "prereqs": [],
    "benefitDe": "Du darfst deinen Stärke-Modifikator anstelle deines Geschicklichkeits-Modifikators auf Angriffswürfe mit Wurfwaffen addieren.",
    "benefitRaw": "You can add your Strength modifier (instead of your Dexterity modifier) to attack rolls with thrown weapons.",
    "normalRaw": "A character adds his Dexterity modifier to ranged attack rolls.",
    "specialRaw": "A fighter may select Brutal Throw as one of his fighter bonus feats.",
    "appEffect": "Stärke-Modifikator für Wurfwaffen-Angriffe"
  },
  "power_throw": {
    "id": "power_throw",
    "nameDe": "Mächtiger Wurf",
    "nameEn": "Power Throw",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "str", "value": 13 },
      { "type": "feat", "id": "power_attack" },
      { "type": "feat", "id": "brutal_throw" }
    ],
    "benefitDe": "Ziehe vor dem Angriff mit einer Wurfwaffe eine Zahl von deinen Fernkampf-Angriffswürfen ab und addiere die gleiche Zahl zu deinen Schadenswürfen (wie Power Attack für Wurfwaffen).",
    "benefitRaw": "On your action, before making attack rolls for a round, you may choose to subtract a number from all thrown weapon attack rolls and add that number to all thrown weapon damage rolls.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Power Throw as one of his fighter bonus feats.",
    "appEffect": "Power Attack Mechanik für Wurfwaffen"
  },
  "dual_strike": {
    "id": "dual_strike",
    "nameDe": "Doppelschlag",
    "nameEn": "Dual Strike",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "feat", "id": "two_weapon_fighting" },
      { "type": "feat", "id": "improved_two_weapon_fighting" }
    ],
    "benefitDe": "Als Standard-Aktion kannst du einen Nahkampfangriff mit deiner Haupt- und deiner Nebenhandwaffe gleichzeitig gegen dasselbe Ziel durchführen.",
    "benefitRaw": "As a standard action, you can make a melee attack with your primary weapon and your off-hand weapon simultaneously against the same target.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Dual Strike as one of his fighter bonus feats.",
    "appEffect": "Gleichzeitiger Angriff mit beiden Waffen als Standard-Aktion"
  },
  "deft_boxer": {
    "id": "deft_boxer",
    "nameDe": "Gewandter Faustkämpfer",
    "nameEn": "Deft Boxer",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "feat", "id": "dodge" },
      { "type": "skill", "name": "tumble", "value": 5 }
    ],
    "benefitDe": "Gewährt +4 Ausweichbonus auf die RK gegen Gelegenheitsangriffe größerer Kreaturen, wenn du dich in deren Bedrohungsbereich bewegst.",
    "benefitRaw": "You gain a +4 dodge bonus to your Armor Class against attacks of opportunity provoked by moving out of or within a larger creature's threatened space.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Deft Boxer as one of his fighter bonus feats.",
    "appEffect": "+4 Ausweichbonus gegen AoO von größeren Kreaturen"
  },
  "deft_opportunist": {
    "id": "deft_opportunist",
    "nameDe": "Gewandter Opportunist",
    "nameEn": "Deft Opportunist",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "dex", "value": 15 },
      { "type": "feat", "id": "combat_reflexes" }
    ],
    "benefitDe": "Gewährt einen Situationsbonus von +4 auf alle Angriffswürfe bei Gelegenheitsangriffen.",
    "benefitRaw": "You gain a +4 circumstance bonus on attack rolls when making attacks of opportunity.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Deft Opportunist as one of his fighter bonus feats.",
    "appEffect": "+4 Bonus auf alle Gelegenheitsangriffe"
  },
  "disemboweling_strike": {
    "id": "disemboweling_strike",
    "nameDe": "Ausweidender Stoß",
    "nameEn": "Disemboweling Strike",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "sneak_attack", "value": 5 },
      { "type": "feat", "id": "weapon_focus" }
    ],
    "benefitDe": "Verzichte bei einem erfolgreichen Sneak Attack mit einer Stichwaffe auf 4d6 Sneak-Schaden, um dem Ziel 1d4 Konstitutionsschaden zuzufügen (nur gegen lebende Wesen mit Organen).",
    "benefitRaw": "You can sacrifice 4d6 of sneak attack damage to deal 1d4 points of Constitution damage to a living target vulnerable to critical hits using a piercing weapon.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opfere 4d6 Sneak Attack für 1d4 Con-Schaden"
  },
  "eyes_in_the_back_of_your_head": {
    "id": "eyes_in_the_back_of_your_head",
    "nameDe": "Augen im Hinterkopf",
    "nameEn": "Eyes in the Back of Your Head",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "wis", "value": 13 },
      { "type": "bab", "value": 1 }
    ],
    "benefitDe": "Gegner, die dich flankieren, erhalten keinen Angriffsbonus von +2 gegen dich (du kannst dennoch von Sneak Attacks betroffen sein).",
    "benefitRaw": "Attackers do not gain the usual +2 bonus on attack rolls when flanking you. You can still be sneak attacked by flanking foes.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Eyes in the Back of Your Head as one of his fighter bonus feats.",
    "appEffect": "Gegner erhalten keinen Flanken-Bonus (+2) gegen dich"
  },
  "gloom_strike": {
    "id": "gloom_strike",
    "nameDe": "Dunkelschlag",
    "nameEn": "Gloom Strike",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "bab", "value": 1 },
      { "type": "custom", "desc": "Darkvision or low-light vision" }
    ],
    "benefitDe": "Gewährt einen Bonus von +2 auf Treffer- und Schadenswürfe gegen Gegner in schummrigem Licht oder Dunkelheit.",
    "benefitRaw": "You gain a +2 bonus on weapon damage rolls against enemies located in shadows, shadowy illumination, or darkness.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Gloom Strike as one of his fighter bonus feats.",
    "appEffect": "+2 Schaden in schummrigem Licht oder Dunkelheit"
  },
  "greater_heavy_armor_optimization": {
    "id": "greater_heavy_armor_optimization",
    "nameDe": "Mächtige Schwere-Rüstung-Optimierung",
    "nameEn": "Greater Heavy Armor Optimization",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "feat", "id": "heavy_armor_optimization" },
      { "type": "bab", "value": 5 }
    ],
    "benefitDe": "Erhöht den Rüstungsbonus jeder getragenen schweren Rüstung um insgesamt +2 und reduziert ihren Rüstungsmalus um insgesamt 2.",
    "benefitRaw": "When you are wearing heavy armor, the armor bonus increases by an additional +1 and the armor check penalty is reduced by an additional 1 (stacks with Heavy Armor Optimization).",
    "normalRaw": "",
    "specialRaw": "A fighter may select Greater Heavy Armor Optimization as one of his fighter bonus feats.",
    "appEffect": "Zusätzlich +1 Rüstungsbonus und -1 ACP bei schwerer Rüstung"
  },
  "greater_multishot": {
    "id": "greater_multishot",
    "nameDe": "Mächtiger Mehrfachschuss",
    "nameEn": "Greater Multishot",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "dex", "value": 17 },
      { "type": "feat", "id": "point_blank_shot" },
      { "type": "feat", "id": "rapid_shot" },
      { "type": "feat", "id": "manyshot" },
      { "type": "bab", "value": 6 }
    ],
    "benefitDe": "Wenn du Manyshot als Standard-Aktion einsetzt, kannst du deine Pfeile auf verschiedene Ziele innerhalb von 30 Fuß aufteilen und jeder Pfeil profitiert von Sneak Attack und Präzisionsschaden.",
    "benefitRaw": "When you use the Manyshot feat, you can fire each arrow at a different target. You make a separate attack roll for each arrow, regardless of whether you fire them at separate targets or the same target. Precision damage applies to each arrow.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Greater Multishot as one of his fighter bonus feats.",
    "appEffect": "Präzisionsschaden für jeden Pfeil bei Mehrfachschuss auf unterschiedliche Ziele"
  },
  "greater_two_weapon_defense": {
    "id": "greater_two_weapon_defense",
    "nameDe": "Mächtige Zwei-Waffen-Verteidigung",
    "nameEn": "Greater Two-Weapon Defense",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "dex", "value": 19 },
      { "type": "feat", "id": "two_weapon_fighting" },
      { "type": "feat", "id": "two_weapon_defense" },
      { "type": "feat", "id": "improved_two_weapon_defense" },
      { "type": "bab", "value": 11 }
    ],
    "benefitDe": "Erhöht den Schildbonus beim Führen von zwei Waffen auf +3 (+6 bei Defensiv-Kämpfen oder Total Defense).",
    "benefitRaw": "When wielding two weapons, you gain a +3 shield bonus to your Armor Class (+6 when fighting defensively or using total defense).",
    "normalRaw": "",
    "specialRaw": "A fighter may select Greater Two-Weapon Defense as one of his fighter bonus feats.",
    "appEffect": "+3 Schildbonus auf RK beim beidhändigen Kampf"
  },
  "hamstring": {
    "id": "hamstring",
    "nameDe": "Kniesehnenschnitt",
    "nameEn": "Hamstring",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "sneak_attack", "value": 2 },
      { "type": "bab", "value": 4 }
    ],
    "benefitDe": "Verzichte bei einem Sneak Attack auf 2d6 Schaden, um die Grundbewegungsrate des Gegners 24 Stunden lang (oder bis zur magischen Heilung) zu halbieren.",
    "benefitRaw": "You can sacrifice 2d6 points of sneak attack damage to reduce the target's base land speed by half for 24 hours or until healed.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opfere 2d6 Sneak Attack für Halbierung der Bewegungsrate des Ziels"
  },
  "hear_the_unseen": {
    "id": "hear_the_unseen",
    "nameDe": "Das Unsichtbare hören",
    "nameEn": "Hear the Unseen",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "feat", "id": "blind_fight" },
      { "type": "skill", "name": "listen", "value": 5 }
    ],
    "benefitDe": "Mit einem erfolgreichen Lauschen-Wurf (Move-Action) kannst du den genauen Standort unsichtbarer oder getarnter Kreaturen innerhalb von 30 Fuß lokalisieren.",
    "benefitRaw": "As a move action, by making a Listen check against DC 25, you pinpoint the location of any creature within 30 feet.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Hear the Unseen as one of his fighter bonus feats.",
    "appEffect": "Lauschen-Wurf lokalisiert unsichtbare Kreaturen innerhalb 30 ft"
  },
  "heavy_armor_optimization": {
    "id": "heavy_armor_optimization",
    "nameDe": "Schwere-Rüstung-Optimierung",
    "nameEn": "Heavy Armor Optimization",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "custom", "desc": "Armor Proficiency (heavy)" },
      { "type": "bab", "value": 1 }
    ],
    "benefitDe": "Erhöht den Rüstungsbonus jeder getragenen schweren Rüstung um +1 und reduziert ihren Rüstungsmalus um 1.",
    "benefitRaw": "When you are wearing heavy armor, the armor bonus increases by +1 and the armor check penalty is reduced by 1.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Heavy Armor Optimization as one of his fighter bonus feats.",
    "appEffect": "+1 Rüstungsbonus und -1 ACP bei schwerer Rüstung"
  },
  "improved_buckler_defense": {
    "id": "improved_buckler_defense",
    "nameDe": "Verbesserte Faustschild-Verteidigung",
    "nameEn": "Improved Buckler Defense",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "custom", "desc": "Shield Proficiency" }
    ],
    "benefitDe": "Du behältst den RK-Schildbonus deines Faustschilds (Buckler) auch dann, wenn du mit der entsprechenden Hand eine Waffe führst.",
    "benefitRaw": "When you attack with a weapon in your off hand, you do not lose the shield bonus to AC provided by your buckler.",
    "normalRaw": "Attacking with your off hand normally denies the buckler's shield bonus to AC until your next turn.",
    "specialRaw": "A fighter may select Improved Buckler Defense as one of his fighter bonus feats.",
    "appEffect": "Buckler-Schildbonus bleibt bei Nebenhand-Angriffen erhalten"
  },
  "improved_combat_expertise": {
    "id": "improved_combat_expertise",
    "nameDe": "Verbesserte Defensiver Kampfstil",
    "nameEn": "Improved Combat Expertise",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "int", "value": 13 },
      { "type": "feat", "id": "combat_expertise" },
      { "type": "bab", "value": 6 }
    ],
    "benefitDe": "Erlaubt es, bis zu deinem vollen Grundangriffsbonus (BAB) von deinen Angriffswürfen abzuziehen und als Ausweichbonus auf deine RK anzurechnen (hebt das Standardlimit von -5/+5 auf).",
    "benefitRaw": "When you use the Combat Expertise feat, you can subtract any number up to your base attack bonus from attack rolls and add the same number to your Armor Class.",
    "normalRaw": "Combat Expertise limits the penalty/bonus to 5.",
    "specialRaw": "A fighter may select Improved Combat Expertise as one of his fighter bonus feats.",
    "appEffect": "Defensiver Kampfstil bis zum vollen BAB ohne 5er-Deckelung"
  },
  "improved_diversion": {
    "id": "improved_diversion",
    "nameDe": "Verbessertes Ablenken",
    "nameEn": "Improved Diversion",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "skill", "name": "bluff", "value": 4 }
    ],
    "benefitDe": "Du kannst einen Bluffen-Wurf zur Ablenkung für ein Verstecken-Manöver als Move-Action statt als Standard-Aktion ausführen.",
    "benefitRaw": "You can use Bluff to create a diversion to hide as a move action rather than as a standard action.",
    "normalRaw": "Creating a diversion to hide requires a standard action.",
    "specialRaw": "A fighter may select Improved Diversion as one of his fighter bonus feats.",
    "appEffect": "Ablenkung für Verstecken als Move-Action"
  },
  "improved_multiweapon_fighting": {
    "id": "improved_multiweapon_fighting",
    "nameDe": "Verbesserter Mehrfachwaffenkampf",
    "nameEn": "Improved Multiweapon Fighting",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "dex", "value": 15 },
      { "type": "custom", "desc": "Multiweapon Fighting" },
      { "type": "custom", "desc": "Three or more hands" },
      { "type": "bab", "value": 6 }
    ],
    "benefitDe": "Gewährt einen zweiten Angriff für jede deiner zusätzlichen Hände mit einem Malus von -5 bei vollem Angriff.",
    "benefitRaw": "In addition to the single extra attack with each extra weapon from Multiweapon Fighting, you get a second attack with each extra weapon with a -5 penalty.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Improved Multiweapon Fighting as one of his fighter bonus feats.",
    "appEffect": "Zweiter Angriff für alle zusätzlichen Hände (-5 Malus)"
  },
  "improved_two_weapon_defense": {
    "id": "improved_two_weapon_defense",
    "nameDe": "Verbesserte Zwei-Waffen-Verteidigung",
    "nameEn": "Improved Two-Weapon Defense",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "dex", "value": 17 },
      { "type": "feat", "id": "two_weapon_fighting" },
      { "type": "feat", "id": "two_weapon_defense" },
      { "type": "bab", "value": 6 }
    ],
    "benefitDe": "Erhöht den Schildbonus beim Führen von zwei Waffen auf +2 (+4 bei Defensiv-Kämpfen oder Total Defense).",
    "benefitRaw": "When wielding two weapons, you gain a +2 shield bonus to your Armor Class (+4 when fighting defensively or using total defense).",
    "normalRaw": "",
    "specialRaw": "A fighter may select Improved Two-Weapon Defense as one of his fighter bonus feats.",
    "appEffect": "+2 Schildbonus auf RK beim Führen von zwei Waffen"
  },
  "oversized_two_weapon_fighting": {
    "id": "oversized_two_weapon_fighting",
    "nameDe": "Überdimensionierter Zwei-Waffen-Kampf",
    "nameEn": "Oversized Two-Weapon Fighting",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "str", "value": 13 },
      { "type": "feat", "id": "two_weapon_fighting" }
    ],
    "benefitDe": "Wenn du eine einhändige Waffe (One-handed weapon) in deiner Nebenhand führst, wird sie hinsichtlich der Angriffsabzüge behandelt, als wäre sie eine leichte Waffe (Light weapon).",
    "benefitRaw": "When wielding a one-handed weapon in your off hand, you treat it for all purposes as a light weapon with respect to two-weapon fighting penalties.",
    "normalRaw": "Wielding a one-handed off-hand weapon imposes a -4/-4 penalty.",
    "specialRaw": "A fighter may select Oversized Two-Weapon Fighting as one of his fighter bonus feats.",
    "appEffect": "Einhändige Nebenhandwaffe verursacht nur leichte Abzüge (-2/-2)"
  },
  "prone_attack": {
    "id": "prone_attack",
    "nameDe": "Angriff aus der Liegeposition",
    "nameEn": "Prone Attack",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "dex", "value": 15 },
      { "type": "feat", "id": "lightning_reflexes" },
      { "type": "bab", "value": 2 }
    ],
    "benefitDe": "Du kannst aus der Liegeposition ohne Angriffsabzüge angreifen. Triffst du das Ziel, darfst du sofort als freie Aktion aufstehen, ohne Gelegenheitsangriffe zu provozieren.",
    "benefitRaw": "You can make a melee attack from the prone position at no penalty. If your attack hits, you can stand up immediately as a free action without provoking attacks of opportunity.",
    "normalRaw": "Attacking while prone incurs a -4 penalty on attack rolls.",
    "specialRaw": "A fighter may select Prone Attack as one of his fighter bonus feats.",
    "appEffect": "Kein Malus beim Angriff im Liegen; Aufstehen als freie Aktion bei Treffer"
  },
  "ranged_disarm": {
    "id": "ranged_disarm",
    "nameDe": "Fernkampf-Entwaffnen",
    "nameEn": "Ranged Disarm",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "dex", "value": 15 },
      { "type": "feat", "id": "point_blank_shot" },
      { "type": "feat", "id": "precise_shot" },
      { "type": "bab", "value": 5 }
    ],
    "benefitDe": "Du kannst mit einer Fernkampfwaffe innerhalb von 30 Fuß einen Entwaffnungsversuch (Disarm) durchführen.",
    "benefitRaw": "You can make a disarm attempt with a ranged weapon against a target within 30 feet.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Ranged Disarm as one of his fighter bonus feats.",
    "appEffect": "Entwaffnen mit Fernkampfwaffe bis 30 ft"
  },
  "ranged_pin": {
    "id": "ranged_pin",
    "nameDe": "Fernkampf-Festnageln",
    "nameEn": "Ranged Pin",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "dex", "value": 15 },
      { "type": "feat", "id": "point_blank_shot" },
      { "type": "feat", "id": "precise_shot" },
      { "type": "bab", "value": 5 }
    ],
    "benefitDe": "Mit einer Fernkampfwaffe gegen ein Ziel innerhalb von 30 Fuß, das sich nahe einer Wand oder Oberfläche befindet, kannst du dessen Kleidung/Ausrüstung festnageln (Grapple-Check).",
    "benefitRaw": "You can use a ranged weapon to pin a foe's clothing or armor to an adjacent solid surface within 30 feet, immobilizing the target.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Ranged Pin as one of his fighter bonus feats.",
    "appEffect": "Festnageln von Zielen an Oberflächen mit Fernkampfwaffe bis 30 ft"
  },
  "ranged_sunder": {
    "id": "ranged_sunder",
    "nameDe": "Fernkampf-Waffenzerstören",
    "nameEn": "Ranged Sunder",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "stat", "name": "dex", "value": 15 },
      { "type": "feat", "id": "point_blank_shot" },
      { "type": "feat", "id": "precise_shot" },
      { "type": "bab", "value": 5 }
    ],
    "benefitDe": "Du kannst mit einer Fernkampfwaffe innerhalb von 30 Fuß Gegenstände oder Waffen eines Gegners zerschlagen (Sunder-Angriff mit vollem Schaden).",
    "benefitRaw": "You can attack an opponent's weapon, shield, or carried object with a ranged weapon within 30 feet (deals full damage against wooden or soft targets, half against others).",
    "normalRaw": "",
    "specialRaw": "A fighter may select Ranged Sunder as one of his fighter bonus feats.",
    "appEffect": "Gegenstände und Waffen mit Fernkampfwaffe zerschlagen (bis 30 ft)"
  },
  "staggering_strike": {
    "id": "staggering_strike",
    "nameDe": "Taumelnder Schlag",
    "nameEn": "Staggering Strike",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "bab", "value": 6 },
      { "type": "sneak_attack", "value": 1 }
    ],
    "benefitDe": "Bei einem erfolgreichen Nahkampf-Schadenswurf mit Sneak Attack muss der getroffene Gegner einen ZÄ-Rettungswurf (DC = erlittener Schaden) schaffen oder ist für 1 Runde kampfunfähig (staggered).",
    "benefitRaw": "If you deal damage with a melee sneak attack, the target must make a Fortitude save (DC = damage dealt) or be staggered for 1 round.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Staggering Strike as one of his fighter bonus feats.",
    "appEffect": "Sneak Attacks können Gegner taumelnd machen (Fort DC = Schaden)"
  },
  "telling_blow": {
    "id": "telling_blow",
    "nameDe": "Verheerender Treffer",
    "nameEn": "Telling Blow",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      { "type": "custom", "desc": "Sneak attack or skirmish" }
    ],
    "benefitDe": "Immer wenn du einen kritischen Treffer erzielst, addierst du deinen Sneak Attack- oder Skirmish-Zusatzschaden zum Schadenswurf.",
    "benefitRaw": "Whenever you score a critical hit, you add your sneak attack or skirmish damage to the damage roll.",
    "normalRaw": "",
    "specialRaw": "A fighter may select Telling Blow as one of his fighter bonus feats.",
    "appEffect": "Sneak Attack / Skirmish Schaden wird bei jedem kritischen Treffer ausgelöst"
  }
};
