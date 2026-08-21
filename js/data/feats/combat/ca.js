export const COMBAT_FEATS_REGISTRY_CA = {
  "staggering_strike": {
    "id": "staggering_strike",
    "nameDe": "Taumelnder Schlag",
    "nameEn": "Staggering Strike",
    "category": "combat",
    "source": "ca",
    "prereqs": [
      {
        "type": "bab",
        "value": 6
      },
      {
        "type": "custom",
        "desc": "Sneak attack ability"
      }
    ],
    "benefitDe": "Bei einem erfolgreichen Nahkampf-Schadenswurf mit Sneak Attack muss der getroffene Gegner einen ZÄ-Rettungswurf (DC = erlittener Schaden) schaffen oder ist für 1 Runde kampfunfähig (staggered).",
    "benefitRaw": "If you deal damage with a melee sneak attack, the target must make a Fortitude save (DC = damage dealt) or be staggered for 1 round.",
    "normalRaw": "",
    "specialRaw": "Fighter bonus feat.",
    "appEffect": "Sneak Attacks können Gegner taumelnd machen (Fort DC = Schaden)"
  }
};
