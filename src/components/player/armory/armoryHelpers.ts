/**
 * @module    armoryHelpers
 * @summary   Helper functions, slot definitions and icon resolvers for the Armory tab.
 */

// @ts-ignore
import { ITEM_SLOTS } from '@core/data/magicItems-data.js';

export const BODY_SLOTS_ORDER = [
  'head', 'face', 'neck',
  'shoulders', 'torso', 'body',
  'wrists', 'hands', 'waist',
  'feet', 'ring1', 'ring2'
];

export const FILTER_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'head', label: '👑 Head' },
  { key: 'face', label: '👓 Face' },
  { key: 'neck', label: '📿 Neck' },
  { key: 'shoulders', label: '🧥 Shld' },
  { key: 'torso', label: '🥋 Torso' },
  { key: 'body', label: '👘 Body' },
  { key: 'wrists', label: '🦾 Wrists' },
  { key: 'hands', label: '🧤 Hands' },
  { key: 'waist', label: '🎗️ Waist' },
  { key: 'feet', label: '🥾 Feet' },
  { key: 'rings', label: '💍 Rings' },
  { key: 'slotless', label: '🎒 Slotless' }
];

export function isConsumableItem(item: any): boolean {
  if (!item) return false;
  const slot = item.slot;
  const type = item.type;
  const name = (item.name || '').toLowerCase();
  
  if (type === 'potion' || type === 'scroll' || type === 'wand' || type === 'consumable' || type === 'alchemical') return true;
  if (slot === 'potion' || slot === 'scroll' || slot === 'wand' || slot === 'consumable') return true;
  if (name.includes('potion') || name.includes('trank') || name.includes('scroll') || name.includes('schriftrolle') || name.includes('wand') || name.includes('zauberstab') || name.includes('alchemist') || name.includes('smokestick') || name.includes('tanglefoot') || name.includes('holy water')) return true;
  
  const hasPassiveEffects = Array.isArray(item.effects) && item.effects.some((e: any) => (parseInt(e.value) || 0) !== 0);
  if (!hasPassiveEffects && (item.healingFormula || item.damageFormula || item.activation?.appliedBuffKey || item.charges?.max === 1)) {
    return true;
  }
  return false;
}

export function getItemTypeIcon(itemOrPreset: any, defaultIcon: string = '🎒'): string {
  if (!itemOrPreset) return defaultIcon;
  const type = (itemOrPreset.type || '').toLowerCase();
  const name = (itemOrPreset.name || '').toLowerCase();
  const key = (itemOrPreset.key || itemOrPreset.id || '').toLowerCase();
  if (type === 'potion' || key.includes('potion') || name.includes('potion') || name.includes('trank')) return '🧪';
  if (type === 'scroll' || key.includes('scroll') || name.includes('scroll') || name.includes('schriftrolle')) return '📜';
  if (type === 'wand' || key.includes('wand') || name.includes('wand') || name.includes('stab')) return '🪄';
  if (key.includes('ioun') || name.includes('ioun')) return '💎';
  if (key.includes('bag') || name.includes('bag') || name.includes('haversack')) return '🎒';
  return defaultIcon;
}
