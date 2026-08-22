import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { ITEM_SLOTS } from '@core/data/magicItems-data.js';
import { BodySlotCard } from './BodySlotCard';
import { EmptySlotCard } from './EmptySlotCard';
import { SlotEquipModal } from './SlotEquipModal';
import { ItemCompendiumModal } from './ItemCompendiumModal';
import { ItemEditorModal } from './ItemEditorModal';
import { BackpackGrid } from './BackpackGrid';

interface ArmoryTabProps {
  pc: any;
}

const BODY_SLOTS_ORDER = [
  'head', 'face',
  'neck', 'shoulders',
  'torso', 'body',
  'waist', 'wrists',
  'hands', 'feet',
  'ring1', 'ring2'
];

export const ArmoryTab: React.FC<ArmoryTabProps> = ({ pc }) => {
  const [activeEquipSlot, setActiveEquipSlot] = useState<string | null>(null);
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false);
  const [compendiumDefaultSlot, setCompendiumDefaultSlot] = useState('all');
  const [editingItemData, setEditingItemData] = useState<{ item?: any; itemIdx?: number; defaultSlot?: string } | null>(null);

  const items = Array.isArray(pc.items) ? pc.items : [];

  // Map equipped items to slot
  const equippedMap: Record<string, { item: any; idx: number }> = {};
  const slotlessEquipped: Array<{ item: any; idx: number }> = [];

  items.forEach((item: any, idx: number) => {
    if (item && item.isEquipped) {
      if (item.slot && item.slot !== 'slotless') {
        equippedMap[item.slot] = { item, idx };
      } else {
        slotlessEquipped.push({ item, idx });
      }
    }
  });

  const handleUnequipSlot = (idx: number) => {
    CombatState.unequipPCItem(idx);
  };

  const handleSwapSlot = (slotKey: string) => {
    setActiveEquipSlot(slotKey);
  };

  const handleEditItem = (item: any, idx: number) => {
    setEditingItemData({ item, itemIdx: idx });
  };

  const handleOpenCompendium = (defaultSlot?: string) => {
    setCompendiumDefaultSlot(defaultSlot || 'all');
    setIsCompendiumOpen(true);
  };

  const handleOpenCustomEditor = (item?: any, itemIdx?: number, defaultSlot?: string) => {
    setEditingItemData({ item, itemIdx, defaultSlot });
  };

  return (
    <div className="armory-layout-grid" style={{ minHeight: '480px' }}>
      
      {/* === LEFT COLUMN: Paperdoll / Equipped Slots === */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--pd, #fdf6e2)',
            border: '1.5px solid var(--pb, #c8a96e)',
            borderRadius: '4px',
            padding: '5px 10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>🧍</span>
            <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '12px', fontWeight: 'bold', color: 'var(--red)' }}>
              Equipped Magic Items ({Object.keys(equippedMap).length} / 12 Slots)
            </span>
          </div>
        </div>

        {/* 2-Column Body Slots Grid */}
        <div className="paperdoll-grid">
          {BODY_SLOTS_ORDER.map(slotKey => {
            const slotDef = (ITEM_SLOTS as any)[slotKey] || { nameEn: slotKey, icon: '🎒' };
            const equippedEntry = equippedMap[slotKey];

            if (equippedEntry) {
              return (
                <BodySlotCard
                  key={slotKey}
                  slotKey={slotKey}
                  slotDef={slotDef}
                  item={equippedEntry.item}
                  itemIdx={equippedEntry.idx}
                  onUnequip={() => handleUnequipSlot(equippedEntry.idx)}
                  onSwap={() => handleSwapSlot(slotKey)}
                  onEdit={() => handleEditItem(equippedEntry.item, equippedEntry.idx)}
                />
              );
            }

            return (
              <EmptySlotCard
                key={slotKey}
                slotKey={slotKey}
                slotDef={slotDef}
                onClick={() => setActiveEquipSlot(slotKey)}
              />
            );
          })}
        </div>

        {/* Slotless & Wondrous Equipped Items */}
        {slotlessEquipped.length > 0 && (
          <div style={{ marginTop: '2px' }}>
            <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '10.5px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '3px' }}>
              🎒 Slotless & Wondrous Items ({slotlessEquipped.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {slotlessEquipped.map(({ item, idx }) => (
                <div
                  key={item.id || idx}
                  style={{
                    background: 'var(--pd, #fdf6e2)',
                    border: '1px solid var(--pb)',
                    borderLeft: '3px solid var(--red)',
                    borderRadius: '3px',
                    padding: '4px 8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
                      {item.name}
                    </span>
                    {item.description && (
                      <span style={{ fontSize: '8.5px', color: 'var(--inkm)', marginLeft: '6px', fontFamily: "'Crimson Text', serif" }}>
                        {item.description}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnequipSlot(idx)}
                    className="xbtn"
                    style={{ fontSize: '8px', padding: '1px 5px' }}
                    title="Unequip"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* === RIGHT COLUMN: Backpack Inventory === */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            background: 'var(--pd, #fdf6e2)',
            border: '1.5px solid var(--pb, #c8a96e)',
            borderRadius: '4px',
            padding: '5px 10px',
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'var(--red)'
          }}
        >
          🎒 Backpack & Inventory
        </div>

        <BackpackGrid
          pc={pc}
          onOpenCompendium={() => handleOpenCompendium()}
          onOpenCustomEditor={(it, idx) => handleOpenCustomEditor(it, idx)}
        />
      </div>

      {/* === MODALS === */}
      {activeEquipSlot && (
        <SlotEquipModal
          slotKey={activeEquipSlot}
          pc={pc}
          onClose={() => setActiveEquipSlot(null)}
          onOpenCompendium={(slot) => handleOpenCompendium(slot)}
          onOpenCustomEditor={(slot) => handleOpenCustomEditor(undefined, undefined, slot)}
        />
      )}

      {isCompendiumOpen && (
        <ItemCompendiumModal
          initialSlot={compendiumDefaultSlot}
          onClose={() => setIsCompendiumOpen(false)}
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
  );
};
