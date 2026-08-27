/**
 * @module    ArmoryTab
 * @summary   Main container for the D&D 3.5e Magic Items Armory tab (Paperdoll, Backpack Stash, Compendium & Modals).
 * @exports   ArmoryTab, isConsumableItem, getItemTypeIcon
 */

import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { CONSOLIDATED_COMPENDIUM } from '@core/data/magicItems-data.js';
import { calculateItemSetBonuses, getItemStackingBreakdown } from '@core/rules.js';
import { getHealingFormulaDetails, getDamageFormulaDetails } from '@core/rules/RulesItems.js';
import { showHealingRollDialog, showItemDamageDialog } from '@core/ui/components/dialogs.js';
import { BaseCard } from '../../shared/BaseCard';
import { PaperdollPanel } from './PaperdollPanel';
import { BackpackPanel } from './BackpackPanel';
import { CompendiumPanel } from './CompendiumPanel';
import { SlotEquipModal } from './SlotEquipModal';
import { ItemEditorModal } from './ItemEditorModal';
import { isConsumableItem, getItemTypeIcon, FILTER_CHIPS } from './armoryHelpers';

// Re-export helpers for backward compatibility across the app
export { isConsumableItem, getItemTypeIcon };

interface ArmoryTabProps {
  pc: any;
}

export const ArmoryTab: React.FC<ArmoryTabProps> = ({ pc }) => {
  const [rightPanelMode, setRightPanelMode] = useState<'backpack' | 'compendium'>('backpack');
  const [search, setSearch] = useState('');
  const [slotFilter, setSlotFilter] = useState('all');
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});
  const [activeEquipSlot, setActiveEquipSlot] = useState<string | null>(null);
  const [editingItemData, setEditingItemData] = useState<{ item?: any; itemIdx?: number; defaultSlot?: string } | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [draggedBackpackIdx, setDraggedBackpackIdx] = useState<number | null>(null);
  const [dragOverBackpackIdx, setDragOverBackpackIdx] = useState<number | null>(null);

  const handleUseItem = (idx: number) => {
    const item = pc.items && pc.items[idx];
    if (!item) return;

    const healDetails = getHealingFormulaDetails(item);
    if (healDetails) {
      showHealingRollDialog({
        itemName: item.name || 'Potion',
        dice: healDetails.dice,
        bonus: healDetails.bonus,
        formula: healDetails.formula,
        onConfirm: (val: string) => {
          const res = CombatState.usePCItemAction(idx, val);
          if (res && res.message) {
            setActionFeedback(res.message);
            setTimeout(() => setActionFeedback(null), 4500);
          }
        }
      });
      return;
    }

    const dmgDetails = getDamageFormulaDetails(item);
    if (dmgDetails) {
      showItemDamageDialog({
        itemName: item.name || 'Offensive Item',
        dice: dmgDetails.dice,
        bonus: dmgDetails.bonus,
        formula: dmgDetails.formula,
        damageType: dmgDetails.damageType,
        effectDesc: dmgDetails.effectDesc,
        saveText: dmgDetails.saveText,
        onConfirm: () => {
          const res = CombatState.usePCItemAction(idx);
          if (res && res.message) {
            setActionFeedback(res.message);
            setTimeout(() => setActionFeedback(null), 4500);
          }
        }
      });
      return;
    }

    const res = CombatState.usePCItemAction(idx);
    if (res && res.message) {
      setActionFeedback(res.message);
      setTimeout(() => setActionFeedback(null), 4500);
    }
  };

  const items = Array.isArray(pc.items) ? pc.items : [];

  // Map equipped items to slot (excluding consumables)
  const equippedMap: Record<string, { item: any; idx: number }> = {};
  const slotlessEquipped: Array<{ item: any; idx: number }> = [];

  items.forEach((item: any, idx: number) => {
    if (item && item.isEquipped && !isConsumableItem(item)) {
      if (item.slot && item.slot !== 'slotless') {
        equippedMap[item.slot] = { item, idx };
      } else {
        slotlessEquipped.push({ item, idx });
      }
    }
  });

  // Backpack entries: unequipped items + all consumables
  const backpackEntries = items
    .map((item: any, idx: number) => ({ item, idx }))
    .filter(({ item }: { item: any }) => !item.isEquipped || isConsumableItem(item));

  const filteredBackpack = backpackEntries.filter(({ item }: { item: any }) => {
    if (slotFilter !== 'all') {
      if (slotFilter === 'rings') {
        if (item.slot !== 'ring' && item.slot !== 'ring1' && item.slot !== 'ring2') return false;
      } else if (item.slot !== slotFilter) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name && item.name.toLowerCase().includes(q);
      const matchDesc = item.description && item.description.toLowerCase().includes(q);
      return matchName || matchDesc;
    }
    return true;
  });

  // Consolidated Compendium entries
  const filteredCompendium = CONSOLIDATED_COMPENDIUM.filter((entry: any) => {
    if (slotFilter !== 'all') {
      if (slotFilter === 'rings') {
        if (entry.slot !== 'ring1' && entry.slot !== 'ring2' && entry.slot !== 'ring') return false;
      } else if (entry.slot !== slotFilter) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = entry.baseName.toLowerCase().includes(q);
      const matchDesc = entry.description && entry.description.toLowerCase().includes(q);
      return matchName || matchDesc;
    }
    return true;
  });

  const handleSelectTier = (entryId: string, presetKey: string) => {
    setSelectedTiers(prev => ({ ...prev, [entryId]: presetKey }));
  };

  const handleAddBackpack = (presetKey: string) => {
    CombatState.addPCItemFromCompendium(presetKey, false);
  };

  const handleAddAndEquip = (presetKey: string) => {
    CombatState.addPCItemFromCompendium(presetKey, true);
  };

  const handleUnequipSlot = (idx: number) => {
    CombatState.unequipPCItem(idx);
  };

  const handleEmptySlotClick = (slotKey: string) => {
    setSlotFilter(slotKey === 'ring1' || slotKey === 'ring2' ? 'rings' : slotKey);
    setRightPanelMode('backpack');
  };

  const setBonusData = calculateItemSetBonuses(pc);
  const stackingBreakdown = getItemStackingBreakdown(pc);

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '3px',
            padding: '6px 12px',
            marginBottom: '10px',
            color: '#065f46',
            fontSize: '11px',
            fontFamily: 'var(--font-body)',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>✨ {actionFeedback}</span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 'bold', fontSize: '10px' }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="armory-layout-grid">
        {/* === LEFT COLUMN: Paperdoll / Equipped Slots === */}
        <PaperdollPanel
          equippedMap={equippedMap}
          slotlessEquipped={slotlessEquipped}
          setBonusData={setBonusData}
          stackingBreakdown={stackingBreakdown}
          onUnequipSlot={handleUnequipSlot}
          onEditItem={setEditingItemData}
          onEmptySlotClick={handleEmptySlotClick}
          onUseItem={handleUseItem}
        />

        {/* === RIGHT COLUMN: Armory Stash & Compendium === */}
        <BaseCard
          title="🎒 Armory Stash & Compendium"
          headerRight={
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setRightPanelMode('backpack')}
                className="btn"
                style={{
                  fontSize: '9px',
                  padding: '2px 8px',
                  fontFamily: 'var(--font-title)',
                  background: rightPanelMode === 'backpack' ? 'var(--pb, #c8a96e)' : 'rgba(253, 246, 226, 0.6)',
                  borderColor: rightPanelMode === 'backpack' ? 'var(--red, #8b1a1a)' : 'var(--pb, #c8a96e)',
                  color: rightPanelMode === 'backpack' ? 'var(--red, #8b1a1a)' : 'var(--ink, #1a0f00)',
                  fontWeight: rightPanelMode === 'backpack' ? 'bold' : 'normal',
                  boxShadow: rightPanelMode === 'backpack' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer'
                }}
              >
                🎒 Backpack ({backpackEntries.length})
              </button>
              <button
                type="button"
                onClick={() => setRightPanelMode('compendium')}
                className="btn"
                style={{
                  fontSize: '9px',
                  padding: '2px 8px',
                  fontFamily: 'var(--font-title)',
                  background: rightPanelMode === 'compendium' ? 'var(--pb, #c8a96e)' : 'rgba(253, 246, 226, 0.6)',
                  borderColor: rightPanelMode === 'compendium' ? 'var(--red, #8b1a1a)' : 'var(--pb, #c8a96e)',
                  color: rightPanelMode === 'compendium' ? 'var(--red, #8b1a1a)' : 'var(--ink, #1a0f00)',
                  fontWeight: rightPanelMode === 'compendium' ? 'bold' : 'normal',
                  boxShadow: rightPanelMode === 'compendium' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer'
                }}
              >
                📖 Compendium
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '4px' }}>
            {/* Controls Bar: Search & New Item Button */}
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={rightPanelMode === 'backpack' ? 'Search backpack items...' : 'Search compendium items...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="cinput"
                style={{ flex: 1, padding: '3px 7px', fontSize: '10.5px', height: '24px', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setEditingItemData({ defaultSlot: slotFilter !== 'all' && slotFilter !== 'rings' ? slotFilter : 'slotless' })}
                className="btn btn-p"
                style={{
                  fontSize: '8.5px',
                  padding: '2px 8px',
                  fontFamily: 'var(--font-title)',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                  border: '0.5px solid #8b6914',
                  color: '#ffffff',
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
              >
                ➕ Custom Item
              </button>
            </div>

            {/* Compact Slot Filter Chips */}
            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', borderBottom: '0.5px solid rgba(200, 169, 110, 0.4)', paddingBottom: '4px' }}>
              {FILTER_CHIPS.map(chip => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setSlotFilter(chip.key)}
                  className="btn"
                  style={{
                    fontSize: '8px',
                    padding: '1px 6px',
                    fontFamily: 'var(--font-title)',
                    background: slotFilter === chip.key ? 'linear-gradient(135deg, #c8a96e, #9a7a2e)' : 'rgba(200, 169, 110, 0.08)',
                    borderColor: slotFilter === chip.key ? '#8b6914' : 'var(--pb)',
                    color: slotFilter === chip.key ? '#ffffff' : 'var(--inkm)',
                    fontWeight: slotFilter === chip.key ? 'bold' : 'normal',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* List Content Area */}
            <div
              style={{
                maxHeight: '390px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                paddingRight: '3px',
                paddingBottom: '6px'
              }}
            >
              {rightPanelMode === 'backpack' ? (
                <BackpackPanel
                  filteredBackpack={filteredBackpack}
                  slotFilter={slotFilter}
                  draggedBackpackIdx={draggedBackpackIdx}
                  dragOverBackpackIdx={dragOverBackpackIdx}
                  setDraggedBackpackIdx={setDraggedBackpackIdx}
                  setDragOverBackpackIdx={setDragOverBackpackIdx}
                  onUseItem={handleUseItem}
                  onEquipItem={(idx, slot) => CombatState.equipPCItem(idx, slot)}
                  onEditItem={setEditingItemData}
                  onDeleteItem={(idx) => CombatState.deletePCItem(idx)}
                  onReorderItems={(from, to) => CombatState.reorderPCItems(from, to)}
                  onOpenCompendium={() => setRightPanelMode('compendium')}
                />
              ) : (
                <CompendiumPanel
                  filteredCompendium={filteredCompendium}
                  selectedTiers={selectedTiers}
                  onSelectTier={handleSelectTier}
                  onAddBackpack={handleAddBackpack}
                  onAddAndEquip={handleAddAndEquip}
                />
              )}
            </div>
          </div>
        </BaseCard>

        {/* === MODALS (IF OPENED) === */}
        {activeEquipSlot && (
          <SlotEquipModal
            slotKey={activeEquipSlot}
            pc={pc}
            onClose={() => setActiveEquipSlot(null)}
            onOpenCompendium={(slot) => {
              setSlotFilter(slot || 'all');
              setRightPanelMode('compendium');
            }}
            onOpenCustomEditor={(slot) => setEditingItemData({ defaultSlot: slot || 'slotless' })}
          />
        )}

        {editingItemData && (
          <ItemEditorModal
            item={editingItemData.item}
            itemIdx={editingItemData.itemIdx}
            defaultSlot={editingItemData.defaultSlot}
            onClose={() => setEditingItemData(null)}
          />
        )}
      </div>
    </div>
  );
};
