/**
 * @module    acfFeatures
 * @summary   Generates UnifiedFeature definitions for any active ACFs in pc.acfs.
 */

import type { UnifiedFeature } from './types.ts';
import { getACF } from '../../../../../js/data/acf-data.js';
import { formatClassName } from './formatters.ts';

export function getGenericActiveACFFeatures(pc: any): UnifiedFeature[] {
  if (!pc || !Array.isArray(pc.acfs) || pc.acfs.length === 0) return [];

  const features: UnifiedFeature[] = [];

  pc.acfs.forEach((acfId: string) => {
    const acf = getACF(acfId);
    if (!acf) return;

    const descLower = (acf.description || '').toLowerCase();
    let actionType: UnifiedFeature['actionType'] = 'Passive';
    if (descLower.includes('immediate action')) actionType = 'Immediate Action';
    else if (descLower.includes('swift action')) actionType = 'Swift Action';
    else if (descLower.includes('standard action')) actionType = 'Standard Action';
    else if (descLower.includes('full-round action')) actionType = 'Full-Round Action';
    else if (descLower.includes('free action')) actionType = 'Free Action';

    let category: UnifiedFeature['category'] = 'passive';
    if (actionType !== 'Passive' || descLower.includes('attack') || descLower.includes('damage') || descLower.includes('rage')) {
      category = 'combat';
    } else if (descLower.includes('1/day') || descLower.includes('daily') || descLower.includes('per day')) {
      category = 'daily';
    }

    features.push({
      id: acf.id,
      name: `${acf.name} (ACF)`,
      source: `${formatClassName(acf.classKey)} Lv.${acf.minLevel}+ [${acf.source}]`,
      category,
      typeLabel: 'Alternative Class Feature',
      summary: `${acf.description} (Replaces: ${acf.replaces})`,
      rawRules: `**Alternative Class Feature: ${acf.name}**\n**Source:** ${acf.source}\n**Replaces:** ${acf.replaces}\n\n${acf.description}`,
      actionType,
      stackInfo: `Replaces: ${acf.replaces}`,
    });
  });

  return features;
}
