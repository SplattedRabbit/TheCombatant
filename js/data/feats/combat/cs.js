/**
 * @module    feats-combat-cs
 * @summary   Statische Datenbank für D&D 3.5e Kampftalente aus dem Complete Scoundrel (CS).
 * @exports   COMBAT_FEATS_REGISTRY_CS
 */

export const COMBAT_FEATS_REGISTRY_CS = {
  "deadly_defense": {
    "id": "deadly_defense",
    "nameDe": "Tödliche Verteidigung",
    "nameEn": "Deadly Defense",
    "category": "combat",
    "prereqs": [],
    "benefitDe": "Wenn du defensiv kämpfst (oder Combat Expertise für mind. -2 nutzt), fügst du mit leichten oder Finesse-Waffen +1d6 zusätzlichen Schaden zu.",
    "benefitRaw": "When fighting defensively or using Combat Expertise to take at least a -2 penalty on attack rolls, you deal an extra 1d6 points of damage with any light weapon or with any weapon to which Weapon Finesse applies.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "+1d6 Schaden bei defensiver Kampfführung mit leichten/Finesse-Waffen",
    "source": "cs"
  },
  "concussion_attack": {
    "id": "concussion_attack",
    "nameDe": "Erschütterungsangriff",
    "nameEn": "Concussion Attack",
    "category": "combat",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +3d6"
      }
    ],
    "benefitDe": "Hinterhalt: Opfere 2d6 Sneak-Schaden, um dem Ziel für 10 Runden einen Malus von -2 auf alle Intelligenz- und Weisheitswürfe aufzuerlegen.",
    "benefitRaw": "Ambush Feat: By sacrificing 2d6 points of sneak attack damage, your attack imposes a -2 penalty on target's Int and Wis checks (and related skill checks) for 10 rounds.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opfere 2d6 Sneak für -2 auf Int/Wis-Würfe des Ziels (10 Runden)",
    "source": "cs"
  },
  "deafening_strike": {
    "id": "deafening_strike",
    "nameDe": "Ohrenbetäubender Schlag",
    "nameEn": "Deafening Strike",
    "category": "combat",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +4d6"
      }
    ],
    "benefitDe": "Hinterhalt: Opfere 3d6 Sneak-Schaden, um das Ziel für 3 Runden taub zu schlagen.",
    "benefitRaw": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack deafens the target for 3 rounds.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opfere 3d6 Sneak für 3 Runden Taubheit beim Ziel",
    "source": "cs"
  },
  "disemboweling_strike": {
    "id": "disemboweling_strike",
    "nameDe": "Ausweidender Schlag",
    "nameEn": "Disemboweling Strike",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "weapon_focus"
      },
      {
        "type": "special",
        "desc": "Sneak attack +5d6"
      }
    ],
    "benefitDe": "Hinterhalt: Opfere 4d6 Sneak-Schaden mit einer Hiebwaffe, um dem Ziel 1d4 Konstitutionsschaden zuzufügen.",
    "benefitRaw": "Ambush Feat: By sacrificing 4d6 points of sneak attack damage with a slashing weapon, your attack deals 1d4 points of Constitution damage to the target.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opfere 4d6 Sneak mit Hiebwaffe für 1d4 CON-Schaden",
    "source": "cs"
  },
  "eldritch_erosion": {
    "id": "eldritch_erosion",
    "nameDe": "Unheimliche Erosion",
    "nameEn": "Eldritch Erosion",
    "category": "combat",
    "prereqs": [
      {
        "type": "skill",
        "skill": "knowledge_arcana",
        "ranks": 1
      },
      {
        "type": "special",
        "desc": "Sneak attack +4d6"
      }
    ],
    "benefitDe": "Hinterhalt: Opfere 3d6 Sneak-Schaden, um die Zauberresistenz (SR) und Kraftresistenz (PR) des Ziels für 10 Runden um 5 zu senken.",
    "benefitRaw": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack reduces the target's spell resistance and power resistance by 5 for 10 rounds.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opfere 3d6 Sneak für -5 Zauberresistenz (SR) des Ziels (10 Runden)",
    "source": "cs"
  },
  "head_shot": {
    "id": "head_shot",
    "nameDe": "Kopfschuss",
    "nameEn": "Head Shot",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "weapon_focus"
      },
      {
        "type": "special",
        "desc": "Sneak attack +6d6"
      }
    ],
    "benefitDe": "Hinterhalt: Opfere 5d6 Sneak-Schaden mit einer Wuchtwaffe, um das Ziel 1 Runde lang zu verwirren (confused).",
    "benefitRaw": "Ambush Feat: By sacrificing 5d6 points of sneak attack damage with a bludgeoning weapon, your attack confuses the target for 1 round.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opfere 5d6 Sneak mit Wuchtwaffe für 1 Runde Verwirrung (confused)",
    "source": "cs"
  },
  "impeding_attack": {
    "id": "impeding_attack",
    "nameDe": "Hemmender Angriff",
    "nameEn": "Impeding Attack",
    "category": "combat",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +4d6"
      }
    ],
    "benefitDe": "Hinterhalt: Opfere 3d6 Sneak-Schaden, um dem Ziel für 10 Runden einen Malus von -2 auf alle Stärke- und Geschicklichkeitswürfe aufzuerlegen.",
    "benefitRaw": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack imposes a -2 penalty on target's Str and Dex checks (and related skill checks) for 10 rounds.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opfere 3d6 Sneak für -2 auf Str/Dex-Würfe des Ziels (10 Runden)",
    "source": "cs"
  },
  "merciful_strike": {
    "id": "merciful_strike",
    "nameDe": "Barmherziger Schlag",
    "nameEn": "Merciful Strike",
    "category": "combat",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +2d6"
      }
    ],
    "benefitDe": "Hinterhalt: Opfere 1d6 Sneak-Schaden, um gesamten Angriffsschaden inklusive Sneak Attack als nicht-tödlichen Schaden zuzufügen.",
    "benefitRaw": "Ambush Feat: By sacrificing 1d6 points of sneak attack damage, you turn all damage dealt by the attack (including sneak attack) into nonlethal damage without taking standard penalty.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opfere 1d6 Sneak: gesamter Schaden wird nicht-tödlich",
    "source": "cs"
  },
  "mind_drain": {
    "id": "mind_drain",
    "nameDe": "Geist entziehen",
    "nameEn": "Mind Drain",
    "category": "combat",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +2d6, power point reserve"
      }
    ],
    "benefitDe": "Hinterhalt: Opfere 1d6 Sneak-Schaden, um einem psionischen Ziel Kraftpunkte in Höhe deiner Charakterstufe zu entziehen.",
    "benefitRaw": "Ambush Feat: By sacrificing 1d6 points of sneak attack damage, you reduce the target's power point reserve by an amount equal to your character level.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opfere 1d6 Sneak: entzieht Ziel Kraftpunkte = Stufe",
    "source": "cs"
  },
  "persistent_attacker": {
    "id": "persistent_attacker",
    "nameDe": "Beharrlicher Angreifer",
    "nameEn": "Persistent Attacker",
    "category": "combat",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +5d6"
      }
    ],
    "benefitDe": "Hinterhalt: Opfere 4d6 Sneak-Schaden: Wenn der Angriff trifft, gilt das Ziel in deinem nächsten Zug automatisch als anfällig für Hinterhältigen Schaden.",
    "benefitRaw": "Ambush Feat: By sacrificing 4d6 points of sneak attack damage, your successful attack allows you to make sneak attacks against that target in the following round, even without flanking/flat-footed.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opfere 4d6 Sneak: Folgeangriff in nächster Runde ist automatisch Sneak Attack",
    "source": "cs"
  },
  "throat_punch": {
    "id": "throat_punch",
    "nameDe": "Kehlkopfschlag",
    "nameEn": "Throat Punch",
    "category": "combat",
    "prereqs": [
      {
        "type": "feat",
        "id": "improved_unarmed_strike"
      },
      {
        "type": "special",
        "desc": "Sneak attack +3d6"
      }
    ],
    "parent": "improved_unarmed_strike",
    "benefitDe": "Hinterhalt: Opfere 2d6 Sneak-Schaden bei einem waffenlosen Schlag, um die Sprache des Ziels für 3 Runden zu behindern (50% Zauberpatzer bei verbalen Komponenten).",
    "benefitRaw": "Ambush Feat: By sacrificing 2d6 points of sneak attack damage with an unarmed strike, you hinder the target's speech for 3 rounds (50% spell failure for spells with verbal components).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Opfere 2d6 Sneak: Kehlkopfschlag bewirkt 50% Zauberpatzer bei Sprache (3 Runden)",
    "source": "cs"
  }
};
