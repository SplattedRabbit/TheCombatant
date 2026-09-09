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
    name: 'Spellwarp Sniper',
    source: 'cs',
    // Links existing spellcasting progression (you pick which existing caster class to link)
    spellcasting: { pattern: 'linkedProgression', shape: 'single' },
    features: {
      // The class grants access to "spellwarp" ability (ex) — represented as a flag.
      spellwarp: { type: 'flag' },

      // Sudden Raystrike: at lvl 2 -> +1d6, lvl 4 -> +2d6, etc. Implemented as diceStack (counts of d6).
      suddenRaystrike: {
        type: 'diceStack',
        pool: 'sneakAttack',
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
      rawText: '<strong>Spellwarp Sniper (Complete Scoundrel):</strong><br />' +
        '• <strong>Spellwarp (Ex):</strong> As a free action, alter instantaneous area spells (range > touch, max spell level = class level) into pinpoint rays requiring a ranged touch attack. Targets receive NO Reflex save against the primary effect.<br />' +
        '• <strong>Sudden Raystrike (Ex):</strong> +1d6 (lvl 2) / +2d6 (lvl 4) extra precision damage with ray spells against targets denied Dex to AC within 30 ft. Stacks with Sneak Attack.<br />' +
        '• <strong>Precise Shot (Bonus Feat):</strong> At 3rd level, gain Precise Shot (shoot rays into melee without penalty).<br />' +
        '• <strong>Ray Mastery (Ex):</strong> At 5th level: Sudden Raystrike range extends to 60 ft; deliver coup de grace with damaging rays; 1/day empower a ray spell without level or casting time increase.'
    }
  },

  battle_trickster: {
    key: 'battle_trickster',
    name: 'Battle Trickster',
    source: 'cs',
    // No spellcasting progression for this PrC (martial-focused)
    spellcasting: { pattern: 'none' },
    features: {
      // Bonus Tricks: grants an increasing count of bonus "tricks" (abstracted as a numeric stepped bonus)
      bonusTricks: {
        type: 'steppedBonus',
        base: 0,
        steps: [[1, 1], [3, 2]]
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
