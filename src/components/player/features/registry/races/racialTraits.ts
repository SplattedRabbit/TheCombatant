/**
 * @module    racialTraits
 * @summary   Unified feature definitions for character racial traits and innate heritage abilities.
 */

import type { UnifiedFeature } from '../types.ts';
import { RACES } from '../../../wizard/constants.ts';

export function getRacialTraits(pc: any): UnifiedFeature[] {
  const features: UnifiedFeature[] = [];
  const rKey = pc?.race || 'human';
  const raceDef = RACES.find((r: any) => r.key === rKey);

  if (raceDef) {
    const traitsList: string[] = raceDef.traits || [];
    features.push({
      id: `racial_traits_${rKey}`,
      name: `${raceDef.name || rKey} Racial Traits`,
      source: `Racial (${raceDef.name || rKey})`,
      category: 'passive',
      typeLabel: 'Racial Heritage',
      summary: traitsList.join(' • '),
      rawRules: `Racial traits and innate abilities granted by your heritage (${raceDef.name}):\n\n` +
        traitsList.map((t: string) => `• ${t}`).join('\n'),
      actionType: 'Passive',
    });
  }

  return features;
}
