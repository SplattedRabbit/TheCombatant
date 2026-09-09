/**
 * @module    registry
 * @summary   Centralized, modular collector for all character features (Base Classes, Prestige Classes, Racial Heritage).
 */

import type { UnifiedFeature } from './types.ts';
import { formatClassName } from './formatters.ts';
import { getCumulativeFeatures } from './cumulativeFeatures.ts';
import { getPHBCoreMartialFeatures } from './classes/phbCoreMartial.ts';
import { getPHBCoreCasterFeatures } from './classes/phbCoreCaster.ts';
import { getPHB2ClassFeatures } from './classes/phb2Classes.ts';
import { getCAClassFeatures } from './classes/caClasses.ts';
import { getCSPrestigeFeatures } from './prestige/csPrestige.ts';
import { getDMGPrestigeFeatures } from './prestige/dmgPrestige.ts';
import { getCAPrestigeFeatures } from './prestige/caPrestige.ts';
import { getRacialTraits } from './races/racialTraits.ts';
import { PRESTIGE_CLASSES_REGISTRY } from '@core/data/prestigeClasses-data.js';
import { getPrestigeClassFeatures } from '@core/rules/prestigeClassEngine.js';

export * from './types.ts';
export * from './formatters.ts';

export function getAllUnifiedFeatures(pc: any): UnifiedFeature[] {
  if (!pc) return [];

  const features: UnifiedFeature[] = [];
  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const classMap = new Map<string, number>();
  activeClasses.forEach((c: any) => {
    if (c?.classType) classMap.set(c.classType, c.level || 1);
  });

  // 1. Cumulative Multi-Source Features (Sneak Attack, Smite, Turn Undead, Lay on Hands)
  features.push(...getCumulativeFeatures(pc, classMap));

  // 2. Base Classes (PHB Core Martial & Caster, PHB2, Complete Adventurer)
  features.push(...getPHBCoreMartialFeatures(pc, classMap));
  features.push(...getPHBCoreCasterFeatures(pc, classMap));
  features.push(...getPHB2ClassFeatures(pc, classMap));
  features.push(...getCAClassFeatures(pc, classMap));

  // 3. Prestige Classes
  activeClasses.forEach((cls: any) => {
    const prcType = cls.classType;
    const prcLevel = cls.level || 1;
    const prcDef = PRESTIGE_CLASSES_REGISTRY[prcType];
    if (!prcDef) return;

    const computed = getPrestigeClassFeatures(pc, prcType);

    // Complete Scoundrel PrCs (Spellwarp Sniper, Battle Trickster)
    if (prcType === 'spellwarp_sniper' || prcType === 'battle_trickster') {
      features.push(...getCSPrestigeFeatures(pc, prcType, prcLevel, computed));
    }
    // DMG PrCs (Assassin, Arcane Trickster, Dragon Disciple, Mystic Theurge)
    else if (prcType === 'assassin' || prcType === 'arcane_trickster' || prcType === 'dragon_disciple' || prcType === 'mystic_theurge') {
      features.push(...getDMGPrestigeFeatures(pc, prcType, prcLevel, computed));
    }
    // Complete Adventurer PrCs (Shadowbane Inquisitor)
    else if (prcType === 'shadowbane_inquisitor') {
      features.push(...getCAPrestigeFeatures(pc, prcType, prcLevel, computed));
    }
    // Fallback for custom or newly added PrCs
    else {
      (prcDef.ui?.rows || []).forEach((row: any) => {
        if (row.showIf && !row.showIf(computed)) return;
        const featKey = row.key || row.featureKey;
        const val = computed[featKey];
        if (val === undefined || val === null || val === false) return;

        const displayName = prcDef.name || formatClassName(prcType);
        features.push({
          id: `${prcType}_${featKey}`,
          name: row.label,
          source: `${displayName} Lv.${prcLevel}`,
          category: row.format === 'perDay' ? 'daily' : 'passive',
          typeLabel: row.format === 'perDay' ? 'Daily' : 'Passive',
          summary: `${row.label}: ${val}`,
          rawRules: `${row.label} is granted by ${displayName} at level ${prcLevel}.`,
          actionType: 'Passive',
        });
      });
    }
  });

  // 4. Racial Traits
  features.push(...getRacialTraits(pc));

  return features;
}
