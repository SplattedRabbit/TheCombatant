/**
 * @module    prestigeClasses-ca
 * @summary   Feature-/Stufentabellen-Registry der Complete Adventurer (CA) Prestige-Klassen.
 * @exports   CA_PRESTIGE_CLASSES_REGISTRY
 * @reads     Keine
 * @stateOps  Keine
 * @depends   Keine
 * @notHere   Voraussetzungsprüfung -> classValidation.js | Zauberslot-Berechnung -> RulesSpells.js |
 *            generische Interpretation der Feature-Typen -> prestigeClassEngine.js
 */

export const CA_PRESTIGE_CLASSES_REGISTRY = {
  shadowbane_inquisitor: {
    key: 'shadowbane_inquisitor',
    source: 'ca',
    spellcasting: { pattern: 'none' },
    features: {
      // Absolute Conviction (Ex): Flag
      absoluteConviction: { type: 'flag' },

      // Pierce Shadows (Su): radius = 20 + level * 5 (ft), duration = level * 10 (min)
      pierceShadowsRadius: {
        type: 'formula',
        compute: ({ level }) => (level >= 1 ? 20 + level * 5 : 0)
      },
      pierceShadowsDuration: {
        type: 'formula',
        compute: ({ level }) => (level >= 1 ? level * 10 : 0)
      },

      // Sacred Stealth (Su): +4 at lv2, +8 at lv7 on Hide and Move Silently
      sacredStealthBonus: {
        type: 'steppedBonus',
        base: 0,
        steps: [[2, 4], [7, 8]]
      },

      // Smite (Su): 1/day at lv2, 2/day at lv6, 3/day at lv10
      smiteUses: {
        type: 'steppedBonus',
        base: 0,
        steps: [[2, 1], [6, 2], [10, 3]]
      },
      smiteDamage: {
        type: 'formula',
        compute: ({ level }) => level
      },

      // Improved Sunder (Bonus Feat at lvl 3)
      improvedSunder: {
        type: 'formula',
        compute: ({ level }) => level >= 3
      },

      // Sneak Attack (Ex): 1d6 at lv4, 2d6 at lv7, 3d6 at lv10 (stacks with other sneak attack sources)
      sneakAttackStack: {
        type: 'diceStack',
        pool: 'sneakAttack',
        diceByLevel: (level) => (level >= 10 ? 3 : (level >= 7 ? 2 : (level >= 4 ? 1 : 0)))
      },

      // Merciless Purity (Su): at lvl 5 -> +1 sacred bonus on Fort/Ref for 24h when smited enemy dies
      mercilessPurity: {
        type: 'formula',
        compute: ({ level }) => level >= 5
      },

      // Righteous Fervor (Su): at lvl 8 -> +1 sacred bonus on atk/dmg against designated corrupt target
      righteousFervor: {
        type: 'formula',
        compute: ({ level }) => level >= 8
      },

      // Burning Light (Su): at lvl 9 -> 4d6 divine damage within pierce shadows radius (costs 1 turn use)
      burningLight: {
        type: 'formula',
        compute: ({ level }) => level >= 9
      }
    },
    ui: {
      headline: { featureKey: 'smiteUses', format: 'perDay' },
      headlineLabel: 'Smite Corrupt',
      rows: [
        { featureKey: 'sneakAttackStack', label: 'Sneak Attack', format: 'plusd6', highlight: true },
        { featureKey: 'sacredStealthBonus', label: 'Sacred Stealth (Hide / Move Silently)', format: 'plus' },
        { featureKey: 'pierceShadowsRadius', label: 'Pierce Shadows Radius', format: 'plain' },
        { featureKey: 'mercilessPurity', label: 'Merciless Purity (+1 Fort/Ref)', format: 'boolText', trueText: 'Active on Kill (24h)', falseText: 'Locked' },
        { featureKey: 'righteousFervor', label: 'Righteous Fervor (+1 Atk/Dmg)', format: 'boolText', trueText: 'Active vs. Corrupt', falseText: 'Locked' },
        { featureKey: 'burningLight', label: 'Burning Light (4d6 Holy Burst)', format: 'boolText', trueText: '4d6 (1 Turn Use)', falseText: 'Locked' }
      ],
      rawText: '<strong>Shadowbane Inquisitor (Complete Adventurer):</strong><br />' +
        '• <strong>Absolute Conviction (Ex):</strong> Should alignment change from Lawful Good, retain class abilities but cannot advance further.<br />' +
        '• <strong>Pierce Shadows (Su):</strong> Spend 1 turn undead use to shed holy light (radius 20 ft + 5 ft/level) for 10 min/level.<br />' +
        '• <strong>Sacred Stealth (Su):</strong> Swift action, sacrifice a divine spell to gain +4 sacred bonus on Hide and Move Silently (+8 at 7th level) for (CHA mod + spell level) minutes.<br />' +
        '• <strong>Smite (Su):</strong> 1/day at 2nd level, 2/day at 6th, 3/day at 10th. Add CHA modifier to attack roll and +1 damage per inquisitor level against corrupt creatures.<br />' +
        '• <strong>Improved Sunder:</strong> Gains the Improved Sunder feat as a bonus feat at 3rd level.<br />' +
        '• <strong>Sneak Attack (Ex):</strong> Deals +1d6 extra damage at 4th level, +2d6 at 7th level, +3d6 at 10th level. Stacks with other sneak attack sources.<br />' +
        '• <strong>Merciless Purity (Su):</strong> At 5th level, gain +1 sacred bonus on Fortitude and Reflex saves for 24 hours upon the death of a creature you smited.<br />' +
        '• <strong>Righteous Fervor (Su):</strong> At 8th level, gain +1 sacred bonus on attack and damage rolls against a smited corrupt creature for the rest of the encounter.<br />' +
        '• <strong>Burning Light (Su):</strong> At 9th level, spend 1 turn undead use while Pierce Shadows is active to deal 4d6 divine damage to all creatures in the illuminated radius.'
    }
  }
};
