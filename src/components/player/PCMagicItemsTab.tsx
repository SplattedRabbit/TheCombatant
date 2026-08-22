/**
 * @module    PCMagicItemsTab
 * @summary   Renders the Armory 2.0 tab: 3D-Flip Body Slot cards (Paperdoll) on the left and interactive Backpack 2.0 with Compendium on the right.
 * @exports   PCMagicItemsTab
 */

import React from 'react';
import { ArmoryTab } from './armory/ArmoryTab';

interface PCMagicItemsTabProps {
  pc: any;
}

export const PCMagicItemsTab: React.FC<PCMagicItemsTabProps> = ({ pc }) => {
  return <ArmoryTab pc={pc} />;
};
