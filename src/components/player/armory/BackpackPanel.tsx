/**
 * @module    BackpackPanel
 * @summary   Renders the draggable list of items in the character's backpack / stash.
 */

import React from 'react';
import { ITEM_SLOTS } from '@core/data/magicItems-data.js';
import { formatEffectDisplay } from './BodySlotCard';
import { isConsumableItem } from './armoryHelpers';

interface BackpackPanelProps {
  filteredBackpack: Array<{ item: any; idx: number }>;
  slotFilter: string;
  draggedBackpackIdx: number | null;
  dragOverBackpackIdx: number | null;
  setDraggedBackpackIdx: (idx: number | null) => void;
  setDragOverBackpackIdx: (idx: number | null) => void;
  onUseItem: (idx: number) => void;
  onEquipItem: (idx: number, slot: string) => void;
  onEditItem: (data: { item: any; itemIdx: number }) => void;
  onDeleteItem: (idx: number) => void;
  onReorderItems: (fromIdx: number, toIdx: number) => void;
  onOpenCompendium: () => void;
}

export const BackpackPanel: React.FC<BackpackPanelProps> = ({
  filteredBackpack,
  slotFilter,
  draggedBackpackIdx,
  dragOverBackpackIdx,
  setDraggedBackpackIdx,
  setDragOverBackpackIdx,
  onUseItem,
  onEquipItem,
  onEditItem,
  onDeleteItem,
  onReorderItems,
  onOpenCompendium,
}) => {
  if (filteredBackpack.length === 0) {
    return (
      <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--inkm)', fontSize: '10.5px', fontStyle: 'italic', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <span>
          {slotFilter !== 'all'
            ? `No ${slotFilter} items in your backpack.`
            : 'Your backpack is currently empty.'}
        </span>
        <button
          type="button"
          onClick={onOpenCompendium}
          className="btn btn-p"
          style={{
            fontSize: '9px',
            padding: '3px 10px',
            fontFamily: 'var(--font-title)',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
            border: '0.5px solid #8b6914',
            color: '#ffffff',
            borderRadius: '2px',
            cursor: 'pointer'
          }}
        >
          📖 Browse {slotFilter !== 'all' ? `${slotFilter} in ` : ''}Compendium
        </button>
      </div>
    );
  }

  return (
    <>
      {filteredBackpack.map(({ item, idx }: { item: any; idx: number }) => {
        const slotDef = (ITEM_SLOTS as any)[item.slot] || { icon: '🎒', nameEn: item.slot || 'Slotless' };
        const rawEffects = Array.isArray(item.effects) ? item.effects : [];
        const activeEffects = rawEffects.filter((e: any) => (parseInt(e.value) || 0) !== 0);

        const itemNameLower = (item.name || '').toLowerCase();
        const isPotion = itemNameLower.includes('potion') || itemNameLower.includes('trank') || (item.charges?.max === 1 && !itemNameLower.includes('wand') && !itemNameLower.includes('scroll'));
        const isWand = itemNameLower.includes('wand') || itemNameLower.includes('zauberstab');
        const isScroll = itemNameLower.includes('scroll') || itemNameLower.includes('schriftrolle');
        const hasActivation = !!item.activation?.effectDescription || !!item.activation?.appliedBuffKey || !!item.charges || !!item.dailyUses;
        const isUsable = isPotion || isWand || isScroll || hasActivation;
        const isOver = dragOverBackpackIdx === idx;
        const isDragging = draggedBackpackIdx === idx;

        return (
          <div
            key={item.id || idx}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(idx));
              e.dataTransfer.effectAllowed = 'move';
              if (e.currentTarget instanceof HTMLElement && e.dataTransfer.setDragImage) {
                const rect = e.currentTarget.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const offsetY = e.clientY - rect.top;
                e.dataTransfer.setDragImage(e.currentTarget, Math.max(0, Math.min(rect.width, offsetX)), Math.max(0, Math.min(rect.height, offsetY)));
              }
              setDraggedBackpackIdx(idx);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverBackpackIdx(idx);
            }}
            onDragLeave={() => setDragOverBackpackIdx(null)}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedBackpackIdx !== null && draggedBackpackIdx !== idx) {
                onReorderItems(draggedBackpackIdx, idx);
              }
              setDraggedBackpackIdx(null);
              setDragOverBackpackIdx(null);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              border: isOver ? '1.5px solid #8b6914' : '0.5px solid rgba(200, 169, 110, 0.4)',
              borderLeft: isOver ? '3px solid #8b6914' : '3px solid #c8a96e',
              borderRadius: '3px',
              padding: '5px 7px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              boxShadow: isOver ? '0 0 8px rgba(139, 105, 20, 0.4)' : '0 1px 2px rgba(0,0,0,0.03)',
              opacity: isDragging ? 0.4 : 1,
              cursor: 'grab',
              transition: 'border 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '10px', color: 'var(--inkm)', cursor: 'grab', userSelect: 'none' }} title="Drag to reorder">⋮⋮</span>
                <span style={{ fontSize: '12px' }}>{slotDef.icon}</span>
                <span style={{ fontFamily: 'var(--font-title)', fontSize: '11.5px', fontWeight: 'bold', color: 'var(--ink)' }}>
                  {item.name || 'Item'}
                </span>
                <span style={{ fontSize: '7.5px', color: 'var(--inkm)', background: 'rgba(0,0,0,0.04)', padding: '0 3px', borderRadius: '2px' }}>
                  {slotDef.nameEn}
                </span>
                {item.charges && (
                  <span style={{ fontSize: '7.5px', background: 'rgba(0,0,0,0.06)', padding: '0 3px', borderRadius: '2px' }}>
                    {item.charges.current}/{item.charges.max}
                  </span>
                )}
                {item.dailyUses && (
                  <span style={{ fontSize: '7.5px', background: 'rgba(0,0,0,0.06)', padding: '0 3px', borderRadius: '2px' }}>
                    {item.dailyUses.current}/{item.dailyUses.max}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '3px' }}>
                {isUsable && (
                  <button
                    type="button"
                    onClick={() => onUseItem(idx)}
                    className="btn"
                    style={{
                      fontSize: '8px',
                      padding: '1px 6px',
                      fontFamily: 'var(--font-title)',
                      background: isPotion ? 'rgba(16, 185, 129, 0.15)' : (isWand ? 'rgba(139, 92, 246, 0.15)' : 'rgba(217, 119, 6, 0.15)'),
                      borderColor: isPotion ? '#10b981' : (isWand ? '#8b5cf6' : '#d97706'),
                      color: isPotion ? '#065f46' : (isWand ? '#5b21b6' : '#92400e'),
                      fontWeight: 'bold'
                    }}
                    title={isPotion ? "Drink potion" : (isWand ? "Cast wand charge" : "Use item")}
                  >
                    {isPotion ? '🍷 Drink' : (isWand ? '🪄 Cast' : (isScroll ? '📜 Read' : '⚡ Use'))}
                  </button>
                )}
                {!isConsumableItem(item) && (
                  <button
                    type="button"
                    onClick={() => onEquipItem(idx, item.slot)}
                    className="btn btn-p"
                    style={{
                      fontSize: '8px',
                      padding: '1px 6px',
                      fontFamily: 'var(--font-title)',
                      background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                      border: '0.5px solid #8b6914',
                      color: '#ffffff'
                    }}
                  >
                    ⚡ Equip
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onEditItem({ item, itemIdx: idx })}
                  className="btn"
                  style={{ fontSize: '8px', padding: '1px 4px' }}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteItem(idx)}
                  className="xbtn"
                  style={{ fontSize: '8px', padding: '1px 4px' }}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>

            {activeEffects.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                {activeEffects.map((eff: any, eIdx: number) => (
                  <span
                    key={eIdx}
                    style={{
                      fontSize: '8.5px',
                      background: 'rgba(200, 169, 110, 0.18)',
                      border: '0.5px solid var(--pb)',
                      borderRadius: '2px',
                      padding: '0 4px',
                      color: 'var(--ink)',
                      fontWeight: 600,
                      fontFamily: 'var(--font-body)'
                    }}
                  >
                    {formatEffectDisplay(eff)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
