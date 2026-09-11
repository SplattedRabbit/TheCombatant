/**
 * @module    PCMagicItemsTab
 * @summary   Renders the Armory 2.0 tab: 3D-Flip Body Slot cards (Paperdoll) on the left and interactive Backpack 2.0 with Compendium on the right.
 * @exports   PCMagicItemsTab
 */

import { ArmoryTab } from './ArmoryTab';
import { usePC } from '../../../context/PCContext';

export const PCMagicItemsTab: React.FC = () => {
  const pc = usePC();
  return <ArmoryTab pc={pc} />;
};
