/**
 * @module    BeltSlot
 * @summary   Renders an individual tactical belt pouch slot with quick 1-tap drinking, drag & drop, and info trigger.
 */

import React from 'react';

export interface BeltSlotProps {
  slotIdx: number;
  slotData: { item: any; originalIdx: number } | null;
  dragOverSlot: number | null;
  draggedIdx: number | null;
  onDragStart: (e: React.DragEvent, originalIdx: number) => void;
  onDragOver: (slotIdx: number) => void;
  onDragLeave: () => void;
  onDropOnSlot: (originalIdx: number) => void;
  onDropOnEmpty: () => void;
  onUseItem: (originalIdx: number, e: React.MouseEvent) => void;
  onShowItemInfo: (item: any, originalIdx: number, e: React.MouseEvent) => void;
}

export function getPotionAesthetic(item: any) {
  const name = (item.name || '').toLowerCase();
  if (name.includes('cure') || name.includes('heil') || item.healingFormula) {
    return {
      icon: '🍷',
      liquidColor: 'linear-gradient(180deg, #8b2c2c 0%, #6e2222 100%)',
      glowColor: 'none',
      borderColor: 'rgba(139, 44, 44, 0.45)',
      badgeColor: '#6e2222',
      label: 'HEAL',
    };
  }
  if (
    name.includes('bull') ||
    name.includes('bear') ||
    name.includes('haste') ||
    name.includes('heroism') ||
    name.includes('bless') ||
    name.includes('shield')
  ) {
    return {
      icon: '🧪',
      liquidColor: 'linear-gradient(180deg, #9c7a36 0%, #7d5f24 100%)',
      glowColor: 'none',
      borderColor: 'rgba(156, 122, 54, 0.45)',
      badgeColor: '#7d5f24',
      label: 'BUFF',
    };
  }
  if (name.includes('cat') || name.includes('invis') || name.includes('mage armor') || name.includes('fly')) {
    return {
      icon: '🧪',
      liquidColor: 'linear-gradient(180deg, #4a6274 0%, #364957 100%)',
      glowColor: 'none',
      borderColor: 'rgba(74, 98, 116, 0.45)',
      badgeColor: '#364957',
      label: 'UTIL',
    };
  }
  if (item.type === 'wand' || item.slot === 'wand' || name.includes('wand') || name.includes('stab')) {
    return {
      icon: '🪄',
      liquidColor: 'linear-gradient(180deg, #6b4f7a 0%, #523b5f 100%)',
      glowColor: 'none',
      borderColor: 'rgba(107, 79, 122, 0.45)',
      badgeColor: '#523b5f',
      label: 'WAND',
    };
  }
  if (item.type === 'scroll' || item.slot === 'scroll' || name.includes('scroll') || name.includes('schriftrolle')) {
    return {
      icon: '📜',
      liquidColor: 'linear-gradient(180deg, #8c734b 0%, #6d5734 100%)',
      glowColor: 'none',
      borderColor: 'rgba(140, 115, 75, 0.45)',
      badgeColor: '#6d5734',
      label: 'SCROLL',
    };
  }
  return {
    icon: '⚗️',
    liquidColor: 'linear-gradient(180deg, #4b6848 0%, #374e35 100%)',
    glowColor: 'none',
    borderColor: 'rgba(75, 104, 72, 0.45)',
    badgeColor: '#374e35',
    label: 'ITEM',
  };
}

export const BeltSlot: React.FC<BeltSlotProps> = ({
  slotIdx,
  slotData,
  dragOverSlot,
  draggedIdx,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDropOnSlot,
  onDropOnEmpty,
  onUseItem,
  onShowItemInfo,
}) => {
  const isOver = dragOverSlot === slotIdx;

  if (!slotData) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(slotIdx);
        }}
        onDragLeave={onDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          onDropOnEmpty();
        }}
        style={{
          background: isOver ? 'rgba(255, 240, 205, 0.5)' : 'rgba(110, 70, 31, 0.15)',
          border: isOver ? '1.5px dashed #6e461f' : '1px dashed rgba(255, 240, 205, 0.45)',
          borderRadius: '3px',
          padding: '4px 2px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '74px',
          boxSizing: 'border-box',
          transition: 'all 0.15s ease',
        }}
      >
        <span
          style={{
            fontSize: '7px',
            color: 'rgba(255, 240, 205, 0.8)',
            fontFamily: 'var(--font-title)',
            fontWeight: 'bold',
          }}
        >
          [{slotIdx + 1}]
        </span>
        <span style={{ fontSize: '14px', opacity: 0.35 }}>🎒</span>
        <span
          style={{
            fontSize: '6.5px',
            color: 'rgba(255, 240, 205, 0.65)',
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
          }}
        >
          Empty
        </span>
      </div>
    );
  }

  const { item, originalIdx } = slotData;
  const aesthetic = getPotionAesthetic(item);
  const chargesLeft = item.charges ? item.charges.current : item.dailyUses ? item.dailyUses.current : null;
  const maxCharges = item.charges ? item.charges.max : item.dailyUses ? item.dailyUses.max : null;
  const isOutOfCharges = chargesLeft !== null && chargesLeft <= 0;
  const isDraggingThis = draggedIdx === originalIdx;

  return (
    <div
      draggable={true}
      onDragStart={(e) => onDragStart(e, originalIdx)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(slotIdx);
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDropOnSlot(originalIdx);
      }}
      style={{
        background: isOutOfCharges
          ? 'rgba(230, 220, 205, 0.75)'
          : 'linear-gradient(180deg, rgba(255, 253, 248, 0.95) 0%, rgba(248, 238, 222, 0.9) 100%)',
        border: isOver
          ? '1.5px solid #634320'
          : `1px solid ${isOutOfCharges ? 'rgba(150, 130, 110, 0.45)' : aesthetic.borderColor}`,
        borderRadius: '3px',
        padding: '4px 2px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '74px',
        position: 'relative',
        boxShadow: isOutOfCharges
          ? 'none'
          : isOver
          ? '0 0 6px rgba(99, 67, 32, 0.4)'
          : '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        cursor: isOutOfCharges ? 'default' : 'pointer',
        opacity: isDraggingThis ? 0.4 : 1,
        boxSizing: 'border-box',
      }}
      onClick={(e) => !isOutOfCharges && onUseItem(originalIdx, e)}
      title={`[${slotIdx + 1}] ${item.name} (Drag to reorder)`}
    >
      {/* Top Belt Slot Hotkey Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', padding: '0 2px' }}>
        <span
          style={{
            fontSize: '7px',
            color: '#6e461f',
            fontFamily: 'var(--font-title)',
            fontWeight: 'bold',
          }}
        >
          [{slotIdx + 1}]
        </span>
        <button
          type="button"
          onClick={(e) => onShowItemInfo(item, originalIdx, e)}
          style={{
            background: 'rgba(110, 70, 31, 0.12)',
            border: '0.5px solid rgba(110, 70, 31, 0.35)',
            borderRadius: '50%',
            color: '#6e461f',
            fontSize: '9px',
            width: '14px',
            height: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          }}
          title="Item info"
        >
          ℹ
        </button>
      </div>

      {/* Flask Icon with liquid effect */}
      <div
        style={{
          position: 'relative',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: isOutOfCharges ? '#aaa' : aesthetic.liquidColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          margin: '1px 0',
        }}
      >
        <span style={{ filter: isOutOfCharges ? 'grayscale(1)' : 'none' }}>{aesthetic.icon}</span>
      </div>

      {/* Item Name */}
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '7px',
          fontWeight: 'bold',
          color: isOutOfCharges ? '#8c7b6c' : 'var(--ink, #1a0f00)',
          textAlign: 'center',
          lineHeight: 1.1,
          maxHeight: '18px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          width: '100%',
        }}
      >
        {item.name}
      </div>

      {/* Bottom Status / Charges Badge */}
      <div style={{ marginTop: '1px', display: 'flex', gap: '2px', alignItems: 'center' }}>
        {chargesLeft !== null ? (
          <span
            style={{
              background: isOutOfCharges ? '#888' : aesthetic.badgeColor,
              color: '#fff',
              fontSize: '6px',
              padding: '0 2px',
              borderRadius: '2px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
            }}
          >
            {chargesLeft}/{maxCharges}
          </span>
        ) : (
          <span
            style={{
              background: aesthetic.badgeColor,
              color: '#fff',
              fontSize: '5.5px',
              padding: '0 2px',
              borderRadius: '2px',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
            }}
          >
            {aesthetic.label}
          </span>
        )}
      </div>
    </div>
  );
};
