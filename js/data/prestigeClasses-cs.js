/**
 * @module    prestigeClasses-cs
 * @summary   Feature-/Stufentabellen-Registry der Complete Scoundrel (CS) Prestige-Klassen
 * @exports   CS_PRESTIGE_CLASSES_REGISTRY
 * @reads     Keine
 * @stateOps  Keine
 * @depends   Keine
 * @notHere   Voraussetzungsprüfung -> classValidation.js | Zauberslot-Berechnung -> RulesSpells.js |
 *            generische Interpretation der Feature-Typen -> prestigeClassEngine.js
 */

export const CS_PRESTIGE_CLASSES_REGISTRY = {
  spellwarp_sniper: {
    key: 'spellwarp_sniper',
    source: 'cs',
    // Links existing spellcasting progression (you pick which existing caster class to link)
    spellcasting: { pattern: 'linkedProgression', shape: 'single' },
    features: {
      // The class grants access to "spellwarp" ability (ex) — represented as a flag.
      spellwarp: { type: 'flag' },

      // Sudden Raystrike: at lvl 2 -> +1d6, lvl 4 -> +2d6, etc. Implemented as diceStack (counts of d6).
      suddenRaystrike: {
        type: 'diceStack',
        diceByLevel: (level) => Math.floor(level / 2)
      },

      // Precise Shot (lvl 3) — boolean available when level >= 3
      preciseShot: {
        type: 'formula',
        compute: ({ level }) => level >= 3
      },

      // Ray Mastery (lvl 5) — boolean
      rayMastery: {
        type: 'formula',
        compute: ({ level }) => level >= 5
      },

      // slot link (single) — which base spellcasting class this PrC augments
      spellLink: { type: 'spellSlotLink', shape: 'single' }
    },
    ui: {
      headline: { featureKey: 'spellLink', format: 'classLink' },
      headlineLabel: 'Spell Link',
      rows: [
        { featureKey: 'suddenRaystrike', label: 'Sudden Raystrike', format: 'plusd6', highlight: true },
        { featureKey: 'preciseShot', label: 'Precise Shot', format: 'boolText', trueText: 'Yes', falseText: 'No' },
        { featureKey: 'rayMastery', label: 'Ray Mastery', format: 'plain' }
      ],
      rawText: '<strong>Spellwarp Sniper (Complete Scoundrel):</strong><br />Spellwarp allows the sniper to contort area spells into pinpoint rays. At certain levels the class grants sudden raystrike (extra d6) and other ray-focused features. This entry is a compact, UI-friendly summary.'
    }
  },

  battle_trickster: {
    key: 'battle_trickster',
    source: 'cs',
    // No spellcasting progression for this PrC (martial-focused)
    spellcasting: { pattern: 'none' },
    features: {
      // Bonus Tricks: grants an increasing count of bonus "tricks" (abstracted as a numeric stepped bonus)
      bonusTricks: {
        type: 'steppedBonus',
        base: 0,
        steps: [[1, 1], [3, 2], [5, 3]]
      },

      // Bonus Feat: granted at 2nd level (represented as steppedBonus)
      bonusFeat: {
        type: 'steppedBonus',
        base: 0,
        steps: [[2, 1]]
      },

      // Tricky Fighting: feature active at level >= 3
      trickyFighting: {
        type: 'formula',
        compute: ({ level }) => level >= 3
      }
    },
    ui: {
      headline: { featureKey: 'bonusTricks', format: 'plain' },
      headlineLabel: 'Bonus Tricks',
      rows: [
        { featureKey: 'bonusTricks', label: 'Bonus Tricks', format: 'plain', highlight: true },
        { featureKey: 'bonusFeat', label: 'Bonus Feat', format: 'plain' },
        { featureKey: 'trickyFighting', label: 'Tricky Fighting', format: 'boolText', trueText: 'Active', falseText: 'No' }
      ],
      rawText: '<strong>Battle Trickster (Complete Scoundrel):</strong><br />A martial prestige class that grants bonus skill-tricks and at 2nd level a bonus feat; at 3rd level you gain the Tricky Fighting quality. Class is front-line oriented (d10 HD, solid hit points).'
    }
  }
};
