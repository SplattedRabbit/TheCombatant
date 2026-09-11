/**
 * @module    itemSlots
 * @summary   Definitions of standard D&D 3.5e body slots for magic items.
 * @exports   ITEM_SLOTS
 */

export const ITEM_SLOTS = {
  head: { key: 'head', nameEn: 'Head', nameDe: 'Head', icon: '👑', allowedTypes: ['headband', 'helmet', 'hat', 'circlet'] },
  face: { key: 'face', nameEn: 'Face', nameDe: 'Face', icon: '👓', allowedTypes: ['goggles', 'mask', 'lenses'] },
  neck: { key: 'neck', nameEn: 'Neck', nameDe: 'Neck', icon: '📿', allowedTypes: ['amulet', 'periapt', 'necklace', 'medallion', 'collar'] },
  shoulders: { key: 'shoulders', nameEn: 'Shoulders', nameDe: 'Shoulders', icon: '🧥', allowedTypes: ['cloak', 'cape', 'mantle'] },
  torso: { key: 'torso', nameEn: 'Torso', nameDe: 'Torso', icon: '🥋', allowedTypes: ['vest', 'shirt', 'vestment'] },
  body: { key: 'body', nameEn: 'Body', nameDe: 'Body', icon: '👘', allowedTypes: ['robe', 'suit', 'vestments'] },
  wrists: { key: 'wrists', nameEn: 'Wrists', nameDe: 'Wrists', icon: '🦾', allowedTypes: ['bracers', 'bracelets'] },
  hands: { key: 'hands', nameEn: 'Hands', nameDe: 'Hands', icon: '🧤', allowedTypes: ['gloves', 'gauntlets'] },
  waist: { key: 'waist', nameEn: 'Waist', nameDe: 'Waist', icon: '🎗️', allowedTypes: ['belt', 'girdle', 'sash'] },
  feet: { key: 'feet', nameEn: 'Feet', nameDe: 'Feet', icon: '🥾', allowedTypes: ['boots', 'shoes', 'slippers'] },
  ring1: { key: 'ring1', nameEn: 'Ring 1', nameDe: 'Ring 1', icon: '💍', allowedTypes: ['ring'] },
  ring2: { key: 'ring2', nameEn: 'Ring 2', nameDe: 'Ring 2', icon: '💍', allowedTypes: ['ring'] },
  slotless: { key: 'slotless', nameEn: 'Slotless / Wondrous', nameDe: 'Slotless / Wondrous', icon: '🎒', allowedTypes: ['wondrous', 'consumable', 'wand', 'scroll', 'potion'] }
};
