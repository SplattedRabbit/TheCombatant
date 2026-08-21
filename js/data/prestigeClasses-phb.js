/**
 * @module    prestigeClasses-phb
 * @summary   Feature-/Stufentabellen-Registry der PHB-Prestige-Klassen (Mystischer Theurge, Arkaner Trickser,
 *            Drachen-Jünger, Assassine). Voraussetzungen/BAB/Saves bleiben bewusst in RulesData.js CLASSES,
 *            da dort bereits generisch von classValidation.js interpretiert (siehe docs/implementationplan.md, Abschnitt 1.1).
 *            Diese Datei deckt ausschließlich den bisher NICHT generischen Teil ab: die stufenabhängige
 *            Feature-Mechanik, die zuvor inline in den *FeaturesCard.tsx-Komponenten hartkodiert war.
 * @exports   PHB_PRESTIGE_CLASSES_REGISTRY
 * @reads     Keine
 * @stateOps  Keine
 * @depends   Keine
 * @notHere   Voraussetzungsprüfung -> classValidation.js | Zauberslot-Berechnung -> RulesSpells.js |
 *            generische Interpretation der Feature-Typen -> prestigeClassEngine.js | UI -> features/*FeaturesCard.tsx
 */

export const PHB_PRESTIGE_CLASSES_REGISTRY = {
  assassin: {
    key: 'assassin',
    source: 'phb',
    spellcasting: { pattern: 'ownTable', tableRef: 'ASSASSIN_TABLE' },
    features: {
      deathAttack: {
        type: 'formula',
        compute: ({ level, pc, getAblMod }) => 10 + level + getAblMod(pc.int)
      },
      sneakAttackStack: {
        type: 'diceStack',
        pool: 'sneakAttack',
        diceByLevel: (level) => Math.floor((level + 1) / 2)
      },
      poisonSaveBonus: {
        type: 'steppedBonus',
        base: 0,
        steps: [[2, 1], [4, 2], [6, 3], [8, 4], [10, 5]]
      },
      poisonUse: { type: 'flag' }
    }
  },

  mystic_theurge: {
    key: 'mystic_theurge',
    source: 'phb',
    spellcasting: { pattern: 'linkedProgression', shape: 'dual' },
    features: {
      spellLinks: { type: 'spellSlotLink', shape: 'dual' }
    }
  },

  arcane_trickster: {
    key: 'arcane_trickster',
    source: 'phb',
    spellcasting: { pattern: 'linkedProgression', shape: 'single' },
    features: {
      spellLink: { type: 'spellSlotLink', shape: 'single' },
      sneakAttackStack: {
        type: 'diceStack',
        pool: 'sneakAttack',
        diceByLevel: (level) => Math.floor(level / 2)
      },
      rangedLegerdemain: {
        type: 'steppedBonus',
        base: 1,
        steps: [[5, 2], [9, 3]]
      },
      impromptuSneakAttack: {
        type: 'steppedBonus',
        base: 0,
        steps: [[3, 1], [7, 2]]
      }
    }
  },

  dragon_disciple: {
    key: 'dragon_disciple',
    source: 'phb',
    spellcasting: { pattern: 'none' },
    features: {
      naturalArmor: { type: 'steppedBonus', base: 1, steps: [[4, 2], [7, 3], [10, 4]] },
      strengthBoost: { type: 'steppedBonus', base: 0, steps: [[2, 2], [4, 4], [10, 8]] },
      constitutionBoost: { type: 'steppedBonus', base: 0, steps: [[6, 2]] },
      intelligenceBoost: { type: 'steppedBonus', base: 0, steps: [[8, 2]] },
      charismaBoost: { type: 'steppedBonus', base: 0, steps: [[10, 2]] },
      breathWeapon: {
        type: 'formula',
        compute: ({ level }) => level >= 10 ? '6d8' : (level >= 7 ? '4d8' : (level >= 3 ? '2d8' : ''))
      },
      wings: {
        type: 'formula',
        compute: ({ level }) => level >= 9
      },
      dragonApotheosis: {
        type: 'formula',
        compute: ({ level }) => level >= 10
      }
    }
  }
};
