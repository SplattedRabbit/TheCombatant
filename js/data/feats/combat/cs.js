/**
 * @module    cs
 * @summary   Standardized D&D 3.5e RAW English feats registry.
 * @exports   COMBAT_FEATS_REGISTRY_CS
 */

export const COMBAT_FEATS_REGISTRY_CS = {
  "deadly_defense": {
    "id": "deadly_defense",
    "nameDe": "Deadly Defense",
    "nameEn": "Deadly Defense",
    "category": "combat",
    "prereqs": [],
    "benefitDe": "When fighting defensively or using Combat Expertise to take at least a -2 penalty on attack rolls, you deal an extra 1d6 points of damage with any light weapon or with any weapon to which Weapon Finesse applies.",
    "benefitRaw": "When fighting defensively or using Combat Expertise to take at least a -2 penalty on attack rolls, you deal an extra 1d6 points of damage with any light weapon or with any weapon to which Weapon Finesse applies.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "When fighting defensively or using Combat Expertise to take at least a -2 penalty on attack rolls, you deal an...",
    "source": "cs",
    "name": "Deadly Defense",
    "benefit": "When fighting defensively or using Combat Expertise to take at least a -2 penalty on attack rolls, you deal an extra 1d6 points of damage with any light weapon or with any weapon to which Weapon Finesse applies.",
    "benefitEn": "When fighting defensively or using Combat Expertise to take at least a -2 penalty on attack rolls, you deal an extra 1d6 points of damage with any light weapon or with any weapon to which Weapon Finesse applies."
  },
  "concussion_attack": {
    "id": "concussion_attack",
    "nameDe": "Concussion Attack",
    "nameEn": "Concussion Attack",
    "category": "combat",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +3d6"
      }
    ],
    "benefitDe": "Ambush Feat: By sacrificing 2d6 points of sneak attack damage, your attack imposes a -2 penalty on target's Int and Wis checks (and related skill checks) for 10 rounds.",
    "benefitRaw": "Ambush Feat: By sacrificing 2d6 points of sneak attack damage, your attack imposes a -2 penalty on target's Int and Wis checks (and related skill checks) for 10 rounds.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Ambush Feat: By sacrificing 2d6 points of sneak attack damage, your attack imposes a -2 penalty on target's In...",
    "source": "cs",
    "name": "Concussion Attack",
    "benefit": "Ambush Feat: By sacrificing 2d6 points of sneak attack damage, your attack imposes a -2 penalty on target's Int and Wis checks (and related skill checks) for 10 rounds.",
    "benefitEn": "Ambush Feat: By sacrificing 2d6 points of sneak attack damage, your attack imposes a -2 penalty on target's Int and Wis checks (and related skill checks) for 10 rounds."
  },
  "deafening_strike": {
    "id": "deafening_strike",
    "nameDe": "Deafening Strike",
    "nameEn": "Deafening Strike",
    "category": "combat",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +4d6"
      }
    ],
    "benefitDe": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack deafens the target for 3 rounds.",
    "benefitRaw": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack deafens the target for 3 rounds.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack deafens the target for 3 rounds.",
    "source": "cs",
    "name": "Deafening Strike",
    "benefit": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack deafens the target for 3 rounds.",
    "benefitEn": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack deafens the target for 3 rounds."
  },
  "disemboweling_strike": {
    "id": "disemboweling_strike",
    "nameDe": "Disemboweling Strike",
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
    "benefitDe": "Ambush Feat: By sacrificing 4d6 points of sneak attack damage with a slashing weapon, your attack deals 1d4 points of Constitution damage to the target.",
    "benefitRaw": "Ambush Feat: By sacrificing 4d6 points of sneak attack damage with a slashing weapon, your attack deals 1d4 points of Constitution damage to the target.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Ambush Feat: By sacrificing 4d6 points of sneak attack damage with a slashing weapon, your attack deals 1d4 po...",
    "source": "cs",
    "name": "Disemboweling Strike",
    "benefit": "Ambush Feat: By sacrificing 4d6 points of sneak attack damage with a slashing weapon, your attack deals 1d4 points of Constitution damage to the target.",
    "benefitEn": "Ambush Feat: By sacrificing 4d6 points of sneak attack damage with a slashing weapon, your attack deals 1d4 points of Constitution damage to the target."
  },
  "eldritch_erosion": {
    "id": "eldritch_erosion",
    "nameDe": "Eldritch Erosion",
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
    "benefitDe": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack reduces the target's spell resistance and power resistance by 5 for 10 rounds.",
    "benefitRaw": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack reduces the target's spell resistance and power resistance by 5 for 10 rounds.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack reduces the target's spell resistan...",
    "source": "cs",
    "name": "Eldritch Erosion",
    "benefit": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack reduces the target's spell resistance and power resistance by 5 for 10 rounds.",
    "benefitEn": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack reduces the target's spell resistance and power resistance by 5 for 10 rounds."
  },
  "head_shot": {
    "id": "head_shot",
    "nameDe": "Head Shot",
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
    "benefitDe": "Ambush Feat: By sacrificing 5d6 points of sneak attack damage with a bludgeoning weapon, your attack confuses the target for 1 round.",
    "benefitRaw": "Ambush Feat: By sacrificing 5d6 points of sneak attack damage with a bludgeoning weapon, your attack confuses the target for 1 round.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Ambush Feat: By sacrificing 5d6 points of sneak attack damage with a bludgeoning weapon, your attack confuses...",
    "source": "cs",
    "name": "Head Shot",
    "benefit": "Ambush Feat: By sacrificing 5d6 points of sneak attack damage with a bludgeoning weapon, your attack confuses the target for 1 round.",
    "benefitEn": "Ambush Feat: By sacrificing 5d6 points of sneak attack damage with a bludgeoning weapon, your attack confuses the target for 1 round."
  },
  "impeding_attack": {
    "id": "impeding_attack",
    "nameDe": "Impeding Attack",
    "nameEn": "Impeding Attack",
    "category": "combat",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +4d6"
      }
    ],
    "benefitDe": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack imposes a -2 penalty on target's Str and Dex checks (and related skill checks) for 10 rounds.",
    "benefitRaw": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack imposes a -2 penalty on target's Str and Dex checks (and related skill checks) for 10 rounds.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack imposes a -2 penalty on target's St...",
    "source": "cs",
    "name": "Impeding Attack",
    "benefit": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack imposes a -2 penalty on target's Str and Dex checks (and related skill checks) for 10 rounds.",
    "benefitEn": "Ambush Feat: By sacrificing 3d6 points of sneak attack damage, your attack imposes a -2 penalty on target's Str and Dex checks (and related skill checks) for 10 rounds."
  },
  "merciful_strike": {
    "id": "merciful_strike",
    "nameDe": "Merciful Strike",
    "nameEn": "Merciful Strike",
    "category": "combat",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +2d6"
      }
    ],
    "benefitDe": "Ambush Feat: By sacrificing 1d6 points of sneak attack damage, you turn all damage dealt by the attack (including sneak attack) into nonlethal damage without taking standard penalty.",
    "benefitRaw": "Ambush Feat: By sacrificing 1d6 points of sneak attack damage, you turn all damage dealt by the attack (including sneak attack) into nonlethal damage without taking standard penalty.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Ambush Feat: By sacrificing 1d6 points of sneak attack damage, you turn all damage dealt by the attack (includ...",
    "source": "cs",
    "name": "Merciful Strike",
    "benefit": "Ambush Feat: By sacrificing 1d6 points of sneak attack damage, you turn all damage dealt by the attack (including sneak attack) into nonlethal damage without taking standard penalty.",
    "benefitEn": "Ambush Feat: By sacrificing 1d6 points of sneak attack damage, you turn all damage dealt by the attack (including sneak attack) into nonlethal damage without taking standard penalty."
  },
  "mind_drain": {
    "id": "mind_drain",
    "nameDe": "Mind Drain",
    "nameEn": "Mind Drain",
    "category": "combat",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +2d6, power point reserve"
      }
    ],
    "benefitDe": "Ambush Feat: By sacrificing 1d6 points of sneak attack damage, you reduce the target's power point reserve by an amount equal to your character level.",
    "benefitRaw": "Ambush Feat: By sacrificing 1d6 points of sneak attack damage, you reduce the target's power point reserve by an amount equal to your character level.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Ambush Feat: By sacrificing 1d6 points of sneak attack damage, you reduce the target's power point reserve by...",
    "source": "cs",
    "name": "Mind Drain",
    "benefit": "Ambush Feat: By sacrificing 1d6 points of sneak attack damage, you reduce the target's power point reserve by an amount equal to your character level.",
    "benefitEn": "Ambush Feat: By sacrificing 1d6 points of sneak attack damage, you reduce the target's power point reserve by an amount equal to your character level."
  },
  "persistent_attacker": {
    "id": "persistent_attacker",
    "nameDe": "Persistent Attacker",
    "nameEn": "Persistent Attacker",
    "category": "combat",
    "prereqs": [
      {
        "type": "special",
        "desc": "Sneak attack +5d6"
      }
    ],
    "benefitDe": "Ambush Feat: By sacrificing 4d6 points of sneak attack damage, your successful attack allows you to make sneak attacks against that target in the following round, even without flanking/flat-footed.",
    "benefitRaw": "Ambush Feat: By sacrificing 4d6 points of sneak attack damage, your successful attack allows you to make sneak attacks against that target in the following round, even without flanking/flat-footed.",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Ambush Feat: By sacrificing 4d6 points of sneak attack damage, your successful attack allows you to make sneak...",
    "source": "cs",
    "name": "Persistent Attacker",
    "benefit": "Ambush Feat: By sacrificing 4d6 points of sneak attack damage, your successful attack allows you to make sneak attacks against that target in the following round, even without flanking/flat-footed.",
    "benefitEn": "Ambush Feat: By sacrificing 4d6 points of sneak attack damage, your successful attack allows you to make sneak attacks against that target in the following round, even without flanking/flat-footed."
  },
  "throat_punch": {
    "id": "throat_punch",
    "nameDe": "Throat Punch",
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
    "benefitDe": "Ambush Feat: By sacrificing 2d6 points of sneak attack damage with an unarmed strike, you hinder the target's speech for 3 rounds (50% spell failure for spells with verbal components).",
    "benefitRaw": "Ambush Feat: By sacrificing 2d6 points of sneak attack damage with an unarmed strike, you hinder the target's speech for 3 rounds (50% spell failure for spells with verbal components).",
    "normalRaw": "",
    "specialRaw": "",
    "appEffect": "Ambush Feat: By sacrificing 2d6 points of sneak attack damage with an unarmed strike, you hinder the target's...",
    "source": "cs",
    "name": "Throat Punch",
    "benefit": "Ambush Feat: By sacrificing 2d6 points of sneak attack damage with an unarmed strike, you hinder the target's speech for 3 rounds (50% spell failure for spells with verbal components).",
    "benefitEn": "Ambush Feat: By sacrificing 2d6 points of sneak attack damage with an unarmed strike, you hinder the target's speech for 3 rounds (50% spell failure for spells with verbal components)."
  }
};
