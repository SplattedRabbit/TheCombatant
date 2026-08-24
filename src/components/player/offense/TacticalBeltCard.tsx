/**
 * @module    TacticalBeltCard
 * @summary   Diablo 2 style tactical combat belt providing instant 1-tap drinking/use for potions, scrolls, wands, and alchemical items.
 *            Modularized with dedicated sub-components: BeltSlot, BeltItemModal, and beltHelpers.
 * @exports   TacticalBeltCard
 * @reads     pc.items, pc.hp, pc.maxHp, pc.activeBuffs
 * @stateOps  CombatState.usePCItemCharge, CombatState.reorderPCItems
 */

import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import { BaseCard } from '../../shared/BaseCard';
// @ts-ignore
import { showHealingRollDialog, showItemDamageDialog } from '@core/ui/components/dialogs.js';
import { isConsumableItem } from '../armory/ArmoryTab';
import { getHealingFormulaDetails, getDamageFormulaDetails } from './belt/beltHelpers';
import { BeltSlot } from './belt/BeltSlot';
import { BeltItemModal } from './belt/BeltItemModal';

export interface TacticalBeltCardProps {
  pc: any;
}

export const TacticalBeltCard: React.FC<TacticalBeltCardProps> = ({ pc }) => {
  const [feedbackToast, setFeedbackToast] = useState<{ id: number; message: string; isHeal: boolean } | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [selectedItemForInfo, setSelectedItemForInfo] = useState<{ item: any; originalIdx: number } | null>(null);

  // Filter consumables / usable items: Potions, Scrolls, Wands, Alchemical, or items with charges / healing / activation
  const allItems = Array.isArray(pc.items) ? pc.items : [];
  const consumables = allItems
    .map((item: any, originalIdx: number) => ({ item, originalIdx }))
    .filter(({ item }: { item: any }) => {
      const isPotion =
        item.type === 'potion' ||
        item.slot === 'potion' ||
        item.name?.toLowerCase().includes('potion') ||
        item.name?.toLowerCase().includes('trank');
      const isScroll =
        item.type === 'scroll' ||
        item.slot === 'scroll' ||
        item.name?.toLowerCase().includes('scroll') ||
        item.name?.toLowerCase().includes('schriftrolle');
      const isWand =
        item.type === 'wand' ||
        item.slot === 'wand' ||
        item.name?.toLowerCase().includes('wand') ||
        item.name?.toLowerCase().includes('stab');
      const hasCharges = item.charges && item.charges.max > 0;
      const hasDaily = item.dailyUses && item.dailyUses.max > 0;
      const hasHealing = !!item.healingFormula;
      const hasDamage = !!item.damageFormula;
      const hasBuff = !!item.activation?.appliedBuffKey;
      const isUsable = item.activation?.isUsable || isConsumableItem(item);
      return isPotion || isScroll || isWand || hasCharges || hasDaily || hasHealing || hasDamage || hasBuff || isUsable;
    });

  // Strict 6-slot limit for the combat belt
  const beltItems = consumables.slice(0, 6);
  const beltSlots = [0, 1, 2, 3, 4, 5].map((i) => beltItems[i] || null);

  const handleUseItem = (originalIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = pc.items && pc.items[originalIdx];
    if (!item) return;

    const healDetails = getHealingFormulaDetails(item);
    if (healDetails) {
      showHealingRollDialog({
        itemName: item.name,
        dice: healDetails.dice,
        bonus: healDetails.bonus,
        formula: healDetails.formula,
        onConfirm: (val: string) => {
          const result = CombatState.usePCItemAction(originalIdx, val);
          if (result) {
            setFeedbackToast({
              id: Date.now(),
              message: result.message || 'Healed!',
              isHeal: true,
            });
            setTimeout(() => setFeedbackToast(null), 3500);
          }
        },
      });
      return;
    }

    const dmgDetails = getDamageFormulaDetails(item);
    if (dmgDetails) {
      showItemDamageDialog({
        itemName: item.name,
        dice: dmgDetails.dice,
        bonus: dmgDetails.bonus,
        formula: dmgDetails.formula,
        damageType: dmgDetails.damageType,
        effectDesc: dmgDetails.effectDesc,
        saveText: dmgDetails.saveText,
        onConfirm: () => {
          const result = CombatState.usePCItemCharge(originalIdx);
          if (result) {
            setFeedbackToast({
              id: Date.now(),
              message: result.message || `Used ${item.name}!`,
              isHeal: false,
            });
            setTimeout(() => setFeedbackToast(null), 3500);
          }
        },
      });
      return;
    }

    const result = CombatState.usePCItemCharge(originalIdx);
    if (result) {
      const isHeal = !!result.healAmount && result.healAmount > 0;
      setFeedbackToast({
        id: Date.now(),
        message: result.message || 'Item used!',
        isHeal,
      });
      setTimeout(() => {
        setFeedbackToast(null);
      }, 3500);
    }
  };

  const handleDragStart = (e: React.DragEvent, originalIdx: number) => {
    e.dataTransfer.setData('text/plain', String(originalIdx));
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement && e.dataTransfer.setDragImage) {
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      e.dataTransfer.setDragImage(e.currentTarget, Math.max(0, Math.min(rect.width, offsetX)), Math.max(0, Math.min(rect.height, offsetY)));
    }
    setDraggedIdx(originalIdx);
  };

  const handleDropOnSlot = (targetOriginalIdx: number) => {
    if (draggedIdx !== null && draggedIdx !== targetOriginalIdx) {
      CombatState.reorderPCItems(draggedIdx, targetOriginalIdx);
    }
    setDraggedIdx(null);
    setDragOverSlot(null);
  };

  const handleDropOnEmpty = () => {
    if (draggedIdx !== null && beltItems.length > 0) {
      const lastBeltItem = beltItems[beltItems.length - 1];
      if (lastBeltItem && lastBeltItem.originalIdx !== draggedIdx) {
        CombatState.reorderPCItems(draggedIdx, lastBeltItem.originalIdx);
      }
    }
    setDraggedIdx(null);
    setDragOverSlot(null);
  };

  return (
    <BaseCard
      title="🎒 Tactical Combat Belt"
      headerRight={
        consumables.length > 0 ? (
          <span style={{ fontSize: '8px', color: 'var(--inkm)', fontStyle: 'italic', fontFamily: "'Crimson Text', serif" }}>
            {Math.min(6, consumables.length)} of {consumables.length} ready
          </span>
        ) : undefined
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Toast Feedback */}
        {feedbackToast && (
          <div
            style={{
              background: feedbackToast.isHeal ? 'rgba(75, 104, 72, 0.12)' : 'rgba(200, 169, 110, 0.15)',
              border: `1px solid ${feedbackToast.isHeal ? 'rgba(75, 104, 72, 0.4)' : 'var(--pb)'}`,
              borderRadius: '3px',
              padding: '4px 8px',
              fontSize: '8px',
              fontFamily: "'Crimson Text', serif",
              fontWeight: 'bold',
              color: feedbackToast.isHeal ? '#374e35' : 'var(--red)',
              textAlign: 'center',
              animation: 'fadeIn 0.2s ease-in',
            }}
          >
            ✨ {feedbackToast.message}
          </div>
        )}

        {/* Tactical Leather Belt Container */}
        <div
          style={{
            background: 'linear-gradient(180deg, #b8956e 0%, #9e7a52 50%, #825f38 100%)',
            border: '1px solid #634320',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 3px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15)',
            borderRadius: '4px',
            padding: '6px',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '2px',
              border: '1px dashed rgba(255, 240, 205, 0.45)',
              borderRadius: '2px',
              pointerEvents: 'none',
            }}
          />

          {/* 6 Fixed Belt Pouch Slots Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '5px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {beltSlots.map((slotData, slotIdx) => (
              <BeltSlot
                key={slotData ? slotData.item.id || slotData.originalIdx : `empty-slot-${slotIdx}`}
                slotIdx={slotIdx}
                slotData={slotData}
                dragOverSlot={dragOverSlot}
                draggedIdx={draggedIdx}
                onDragStart={handleDragStart}
                onDragOver={setDragOverSlot}
                onDragLeave={() => setDragOverSlot(null)}
                onDropOnSlot={handleDropOnSlot}
                onDropOnEmpty={handleDropOnEmpty}
                onUseItem={handleUseItem}
                onShowItemInfo={(item, originalIdx) => setSelectedItemForInfo({ item, originalIdx })}
              />
            ))}
          </div>
        </div>

        {/* Belt Helper Info */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 2px' }}>
          <span style={{ fontSize: '7.5px', color: 'var(--inkm)', fontStyle: 'italic', fontFamily: "'Crimson Text', serif", textAlign: 'center' }}>
            💡 1-Tap on any flask to activate. Drag &amp; drop to reorder slots [1–6].
          </span>
        </div>
      </div>

      {/* Details Modal */}
      {selectedItemForInfo && (
        <BeltItemModal
          selectedItem={selectedItemForInfo}
          onClose={() => setSelectedItemForInfo(null)}
          onUseItem={handleUseItem}
        />
      )}
    </BaseCard>
  );
};
