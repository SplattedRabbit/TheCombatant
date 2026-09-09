/**
 * @module    caPrestige
 * @summary   Unified feature definitions for Complete Adventurer (CA) Prestige Classes:
 *            Shadowbane Inquisitor.
 */

import type { UnifiedFeature } from '../types.ts';

export function getCAPrestigeFeatures(pc: any, classType: string, level: number, computed: any): UnifiedFeature[] {
  const features: UnifiedFeature[] = [];

  // ==========================================
  // SHADOWBANE INQUISITOR
  // ==========================================
  if (classType === 'shadowbane_inquisitor') {
    // 1. Absolute Conviction (Ex)
    features.push({
      id: 'shadowbane_absolute_conviction',
      name: 'Absolute Conviction',
      source: `Shadowbane Inquisitor Lv.${level}`,
      category: 'passive',
      typeLabel: 'Code of Conduct',
      summary: 'Maintain paladin abilities and multiclass freely between Paladin and Rogue without losing class features.',
      rawRules: `A Shadowbane Inquisitor's dedication to hunting corruption shields her moral conviction. She can freely multiclass between Paladin and Rogue without penalty or losing paladin class features. Should her alignment ever change from Lawful Good, she retains inquisitor abilities but can advance no further in the class.`,
      actionType: 'Passive',
    });

    // 2. Pierce Shadows (Su)
    const pRadius = 20 + level * 5;
    const pDur = level * 10;
    features.push({
      id: 'shadowbane_pierce_shadows',
      name: `Pierce Shadows (${pRadius} ft Radius • ${pDur} min)`,
      source: `Shadowbane Inquisitor Lv.${level}`,
      category: 'spell-like',
      typeLabel: 'Holy Illumination',
      summary: `Spend 1 Turn Undead attempt to shed bright holy light in a ${pRadius} ft radius for ${pDur} minutes. +5 Search/Spot to pierce disguises/shadows.`,
      rawRules: `A Shadowbane Inquisitor can channel positive energy to illuminate dark corners. By expending one turn undead attempt, she sheds bright light in a ${pRadius}-foot radius (and shadowy illumination for another ${pRadius} feet) for ${pDur} minutes.

Within this illuminated area, she gains a +5 competence bonus on Search and Spot checks to penetrate disguises, concealments, and shadows.`,
      actionType: 'Standard Action',
      range: `${pRadius} ft emanation`,
      duration: `${pDur} minutes`,
    });

    // 3. Sacred Stealth (Su) - Level 2+
    if (level >= 2) {
      const stealthBonus = level >= 7 ? 8 : 4;
      features.push({
        id: 'shadowbane_sacred_stealth',
        name: `Sacred Stealth (+${stealthBonus} Hide / Move Silently)`,
        source: `Shadowbane Inquisitor Lv.${level}`,
        category: 'combat',
        typeLabel: 'Divine Buff',
        summary: `Spend 1 Turn Undead attempt to gain a +${stealthBonus} sacred bonus on Hide and Move Silently for ${level} rounds.`,
        rawRules: `Starting at 2nd level, a Shadowbane Inquisitor can cloak herself in divine favor. By expending one daily use of her turn undead ability, she gains a +${stealthBonus} sacred bonus on Hide and Move Silently checks for a number of rounds equal to her Shadowbane Inquisitor level (${level} rounds).`,
        actionType: 'Swift Action',
        duration: `${level} rounds`,
      });
    }

    // 4. Improved Sunder - Level 3+
    if (level >= 3) {
      features.push({
        id: 'shadowbane_improved_sunder',
        name: 'Improved Sunder (Bonus Feat)',
        source: `Shadowbane Inquisitor Lv.${level}`,
        category: 'passive',
        typeLabel: 'Combat Feat',
        summary: 'Strike an opponent\'s weapon or shield without provoking an attack of opportunity, and gain +4 on the opposed attack roll.',
        rawRules: `At 3rd level, a Shadowbane Inquisitor gains Improved Sunder as a bonus feat. When striking at an opponent\'s weapon or shield, you do not provoke an attack of opportunity and gain a +4 bonus on the opposed attack roll.`,
        actionType: 'Passive',
      });
    }

    // 5. Merciless Purity (Su) - Level 5+
    if (level >= 5) {
      features.push({
        id: 'shadowbane_merciless_purity',
        name: 'Merciless Purity (+1 Fort/Ref for 24h on Smite Kill)',
        source: `Shadowbane Inquisitor Lv.${level}`,
        category: 'combat',
        typeLabel: 'Divine Retribution',
        summary: 'Gain a +1 sacred bonus on Fortitude and Reflex saves for 24 hours whenever you kill a smited enemy.',
        rawRules: `Starting at 5th level, whenever a Shadowbane Inquisitor kills a creature that she has designated with her Smite ability, she receives a +1 sacred bonus on all Fortitude and Reflex saving throws for the next 24 hours.`,
        actionType: 'Passive',
        duration: '24 hours upon trigger',
      });
    }

    // 6. Righteous Fervor (Su) - Level 8+
    if (level >= 8) {
      features.push({
        id: 'shadowbane_righteous_fervor',
        name: 'Righteous Fervor (+1 Atk & Dmg vs Smited Target)',
        source: `Shadowbane Inquisitor Lv.${level}`,
        category: 'combat',
        typeLabel: 'Relentless Pursuit',
        summary: 'Gain a +1 sacred bonus on all attack and damage rolls against a designated smited target for the remainder of the encounter.',
        rawRules: `At 8th level, when a Shadowbane Inquisitor smites a creature, she gains a +1 sacred bonus on all subsequent attack and damage rolls made against that creature for the remainder of the encounter.`,
        actionType: 'Passive',
        duration: 'Encounter duration',
      });
    }

    // 7. Burning Light (Su) - Level 9+
    if (level >= 9) {
      features.push({
        id: 'shadowbane_burning_light',
        name: 'Burning Light (4d6 Holy Burst)',
        source: `Shadowbane Inquisitor Lv.${level}`,
        category: 'combat',
        typeLabel: 'Supernatural Burst',
        summary: 'Spend 1 Turn Undead attempt while Pierce Shadows is active to deal 4d6 divine damage to all creatures in the light radius.',
        rawRules: `At 9th level, while her Pierce Shadows ability is active, a Shadowbane Inquisitor can spend an additional turn undead attempt to make the light flash with searing divine intensity. All creatures within the Pierce Shadows radius take 4d6 points of divine damage (no save). Evil undead and evil outsiders take double damage (8d6).`,
        actionType: 'Standard Action',
        range: `${pRadius} ft radius`,
      });
    }
  }

  return features;
}
