/**
 * @module    prestigeClasses-dmg
 * @summary   Feature-/Stufentabellen-Registry der DMG-Kern-Prestige-Klassen (Mystischer Theurge, Arkaner Trickser,
 *            Drachen-Jünger, Assassine). Voraussetzungen/BAB/Saves bleiben bewusst in RulesData.js CLASSES,
 *            da dort bereits generisch von classValidation.js interpretiert (siehe docs/implementationplan.md, Abschnitt 1.1).
 *            Neben der stufenabhängigen Feature-Mechanik trägt jeder Eintrag zusätzlich ein `ui`-Metadatenblock
 *            (headline/rows/rawText), aus dem PrestigeClassFeaturesCard.tsx die Karte generisch rendert —
 *            eine neue Klasse braucht damit i.d.R. keine eigene *FeaturesCard.tsx mehr (siehe Phase 3).
 * @exports   DMG_PRESTIGE_CLASSES_REGISTRY
 * @reads     Keine
 * @stateOps  Keine
 * @depends   Keine
 * @notHere   Voraussetzungsprüfung -> classValidation.js | Zauberslot-Berechnung -> RulesSpells.js |
 *            generische Interpretation der Feature-Typen -> prestigeClassEngine.js
 */

export const DMG_PRESTIGE_CLASSES_REGISTRY = {
  assassin: {
    key: 'assassin',
    source: 'dmg',
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
    },
    ui: {
      headline: { featureKey: 'deathAttack', format: 'dc' },
      rows: [
        { featureKey: 'sneakAttackStack', label: 'Sneak Attack', format: 'plusd6', highlight: true },
        { featureKey: 'poisonSaveBonus', label: 'Poison Save Bonus', format: 'plus' },
        { featureKey: 'poisonUse', label: 'Poison Use', format: 'activeFlag', activeText: 'Active (No self-poison)' }
      ],
      headlineLabel: 'Death Attack DC',
      rawText: '<strong>Assassin Rules (D&D 3.5 RAW):</strong><br />' +
        '• <strong>Poison Use:</strong> Assassins are trained in the use of poison and never risk accidentally poisoning themselves when applying poison.<br />' +
        '• <strong>Death Attack:</strong> Study a victim for 3 rounds. If you make a sneak attack in the next round, the attack has the additional effect of either killing or paralyzing the victim (saving throw Fort DC 10 + Assassin Level + Int Mod).<br />' +
        '• <strong>Save Bonus against Poison:</strong> +1 at 2nd level, and increases by +1 every two levels thereafter (+2 at 4th, +3 at 6th, etc.).'
    }
  },

  mystic_theurge: {
    key: 'mystic_theurge',
    source: 'dmg',
    spellcasting: { pattern: 'linkedProgression', shape: 'dual' },
    features: {
      spellLinks: { type: 'spellSlotLink', shape: 'dual' }
    },
    ui: {
      headline: { featureKey: 'spellLinks', format: 'dualClassLink' },
      headlineLabel: 'Spell Links',
      rawText: '<strong>Mystic Theurge Rules (D&D 3.5 RAW):</strong><br />' +
        '• <strong>Spells per Day/Spells Known:</strong> At each level, you gain new spells per day (and spells known, if applicable) as if you had also gained a level in both an arcane spellcasting class and a divine spellcasting class you belonged to before adding this prestige class level.<br />' +
        '• You do not, however, gain any other benefit a character of that class would have gained (improved chance of turning undead, wild shape, etc.).'
    }
  },

  arcane_trickster: {
    key: 'arcane_trickster',
    source: 'dmg',
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
    },
    ui: {
      headline: { featureKey: 'spellLink', format: 'classLink' },
      headlineLabel: 'Arcane Link',
      rows: [
        { featureKey: 'sneakAttackStack', label: 'Sneak Attack', format: 'plusd6', highlight: true },
        { featureKey: 'rangedLegerdemain', label: 'Ranged Legerdemain', format: 'perDay' },
        { featureKey: 'impromptuSneakAttack', label: 'Impromptu Sneak Attack', format: 'perDay' }
      ],
      rawText: '<strong>Arcane Trickster Features (D&D 3.5 RAW):</strong><br />' +
        '• <strong>Spells per Day:</strong> At each level, you gain new spells per day as if you had also gained a level in an arcane spellcasting class you belonged to before.<br />' +
        '• <strong>Ranged Legerdemain:</strong> Using Sleight of Hand, Open Lock, or Disable Device at a range of 30 feet. Requires +10 to DC.<br />' +
        '• <strong>Impromptu Sneak Attack:</strong> Once (or twice) per day, declare a melee or ranged attack to be a sneak attack (target loses Dex bonus to AC).'
    }
  },

  dragon_disciple: {
    key: 'dragon_disciple',
    source: 'dmg',
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
    },
    ui: {
      headline: { featureKey: 'naturalArmor', format: 'plus' },
      headlineLabel: 'Natural AC',
      rows: [
        { featureKey: 'abilityBoosts', label: 'Ability Boosts', format: 'abilityBoosts' },
        {
          featureKey: 'breathWeapon',
          label: 'Breath Weapon (1/day)',
          format: 'plain',
          highlight: true,
          showIf: (f) => !!f.breathWeapon
        },
        { featureKey: 'wings', label: 'Flight / Wings', format: 'boolText', trueText: 'Yes (60 ft Fly)', falseText: 'No' },
        { featureKey: 'dragonApotheosis', label: 'Dragon Apotheosis', format: 'boolText', trueText: 'Active (Half-Dragon)', falseText: 'No' }
      ],
      rawText: '<strong>Dragon Disciple Rules (D&D 3.5 RAW):</strong><br />' +
        '• <strong>Natural Armor:</strong> Increases by +1 at 1st level, +2 at 4th, +3 at 7th, and +4 at 10th.<br />' +
        '• <strong>Ability Boosts:</strong> Gains permanent ability score increases as you level up.<br />' +
        '• <strong>Breath Weapon (1/day):</strong> Once per day, breathe a cone/line of energy (Reflex half DC 10 + class level + Con mod).<br />' +
        '• <strong>Wings (lvl 9):</strong> Fly speed 60 ft (average).<br />' +
        '• <strong>Dragon Apotheosis (lvl 10):</strong> Gain half-dragon template. Darkvision 60 ft, low-light vision, immunities.'
    }
  }
};
