/**
 * @module    magicItemsRegistry
 * @summary   Combined registry of worn and slotless magic items.
 * @exports   MAGIC_ITEMS_REGISTRY
 */

import { REGISTRY_WORN } from './registryWorn.js';
import { REGISTRY_SLOTLESS } from './registrySlotless.js';

export const MAGIC_ITEMS_REGISTRY = {
  ...REGISTRY_WORN,
  ...REGISTRY_SLOTLESS,
};
