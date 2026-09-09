/**
 * @module    formatters
 * @summary   Formatting helpers for class names, modifiers, and features in the UI.
 */

import { CLASSES } from '../../../../../js/rules/RulesData.js';
import { PRESTIGE_CLASSES_REGISTRY } from '../../../../../js/data/prestigeClasses-data.js';

/**
 * Converts a raw class key (e.g. 'spellwarp_sniper', 'dragon_disciple') into its official display name.
 */
export function formatClassName(key: string): string {
  if (!key) return '';
  const cls = CLASSES.find((c: any) => c.key === key);
  if (cls) return cls.nameEn || cls.name || cls.nameDe || key;
  const prc = PRESTIGE_CLASSES_REGISTRY[key];
  if (prc?.name) return prc.name;
  return key
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
