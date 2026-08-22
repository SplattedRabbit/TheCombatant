/**
 * @module    TacticalBeltCard
 * @summary   Diablo 2 style tactical combat belt providing instant 1-tap drinking/use for potions, scrolls, wands, and alchemical items.
 * @exports   TacticalBeltCard
 * @reads     pc.items, pc.hp, pc.maxHp, pc.activeBuffs
 * @stateOps  CombatState.usePCItemCharge, CombatState.reorderPCItems
 * @depends   React, @core/state.js, src/components/shared/BaseCard
 */

import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import { BaseCard } from '../../shared/BaseCard';
// @ts-ignore
import { showCustomAlert, showCustomPrompt, showHealingRollDialog, showItemDamageDialog } from '@core/ui/components/dialogs.js';

interface TacticalBeltCardProps {
  pc: any;
}

export const TacticalBeltCard: React.FC<TacticalBeltCardProps> = ({ pc }) => {
  const [feedbackToast, setFeedbackToast] = useState<{ id: number; message: string; isHeal: boolean } | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  // Filter consumables / slotless items: Potions, Scrolls, Wands, Alchemical, Slotless or items with charges / healing
  const allItems = Array.isArray(pc.items) ? pc.items : [];
  const consumables = allItems
    .map((item: any, originalIdx: number) => ({ item, originalIdx }))
    .filter(({ item }: { item: any }) => {
      const isPotion = item.type === 'potion' || item.slot === 'potion' || item.name?.toLowerCase().includes('potion') || item.name?.toLowerCase().includes('trank');
      const isScroll = item.type === 'scroll' || item.slot === 'scroll' || item.name?.toLowerCase().includes('scroll') || item.name?.toLowerCase().includes('schriftrolle');
      const isWand = item.type === 'wand' || item.slot === 'wand' || item.name?.toLowerCase().includes('wand') || item.name?.toLowerCase().includes('stab');
      const isSlotless = item.slot === 'slotless' || !item.slot;
      const hasCharges = item.charges && item.charges.max > 0;
      const hasDaily = item.dailyUses && item.dailyUses.max > 0;
      const hasHealing = !!item.healingFormula;
      const isUsable = item.activation?.isUsable;
      return isPotion || isScroll || isWand || isSlotless || hasCharges || hasDaily || hasHealing || isUsable;
    });

  // Strict 6-slot limit for the combat belt
  const beltItems = consumables.slice(0, 6);
  const beltSlots = [0, 1, 2, 3, 4, 5].map(i => beltItems[i] || null);

  const getHealingFormulaDetails = (item: any) => {
    if (!item) return null;
    const name = (item.name || '').toLowerCase();
    const formula = item.healingFormula || ((name.includes('cure') || name.includes('heil') || item.type === 'potion' || item.slot === 'potion')
      ? (name.includes('moderate') ? '2d8+3' : (name.includes('serious') ? '3d8+5' : (name.includes('critical') ? '4d8+7' : '1d8+1')))
      : null);

    if (!formula) return null;
    const match = formula.match(/(\d+)[dw](\d+)(?:\+(\d+))?/i);
    if (match) {
      const dice = `${match[1]}d${match[2]}`;
      const bonus = match[3] ? parseInt(match[3]) : 0;
      return { formula, dice, bonus };
    }
    return { formula, dice: formula, bonus: 0 };
  };

  const getDamageFormulaDetails = (item: any) => {
    if (!item) return null;
    const name = (item.name || '').toLowerCase();
    if (item.healingFormula || name.includes('cure') || name.includes('heil')) return null;

    const effectDesc = item.activation?.effectDescription || item.description || '';
    const fullName = `${item.name || ''} ${effectDesc}`;

    const match = item.damageFormula 
      ? item.damageFormula.match(/(\d+)[dw](\d+)(?:\+(\d+))?/i)
      : (fullName.match(/(\d+)[dw](\d+)(?:\+(\d+))?\s*([a-zA-ZäöüÄÖÜß]+)?\s*(?:damage|schaden)?/i) || fullName.match(/(\d+)[dw](\d+)(?:\+(\d+))?/i));

    if (!match) return null;

    const dice = `${match[1]}d${match[2]}`;
    const bonus = match[3] ? parseInt(match[3]) : 0;
    const damageType = match[4] || '';
    const formula = bonus > 0 ? `${dice}+${bonus}` : dice;

    const dcMatch = effectDesc.match(/DC\s*(\d+)\s*([a-zA-ZäöüÄÖÜß]+)?(?:\s*(?:half|negates|halbiert))?/i);
    const saveText = dcMatch ? `DC ${dcMatch[1]} ${dcMatch[2] || 'Save'}` : null;

    return {
      formula,
      dice,
      bonus,
      damageType,
      effectDesc,
      saveText
    };
  };

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
              isHeal: true
            });
            setTimeout(() => setFeedbackToast(null), 3500);
          }
        }
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
              isHeal: false
            });
            setTimeout(() => setFeedbackToast(null), 3500);
          }
        }
      });
      return;
    }

    const result = CombatState.usePCItemCharge(originalIdx);
    if (result) {
      const isHeal = !!result.healAmount && result.healAmount > 0;
      setFeedbackToast({
        id: Date.now(),
        message: result.message || 'Item used!',
        isHeal
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

  const getPotionAesthetic = (item: any) => {
    const name = (item.name || '').toLowerCase();
    if (name.includes('cure') || name.includes('heil') || item.healingFormula) {
      return {
        icon: '🍷',
        liquidColor: 'linear-gradient(180deg, #ff4d4d 0%, #b30000 70%, #660000 100%)',
        glowColor: 'rgba(255, 50, 50, 0.4)',
        borderColor: '#e74c3c',
        badgeColor: '#c0392b',
        label: 'HEAL'
      };
    }
    if (name.includes('bull') || name.includes('bear') || name.includes('haste') || name.includes('heroism') || name.includes('bless') || name.includes('shield')) {
      return {
        icon: '🧪',
        liquidColor: 'linear-gradient(180deg, #ffd700 0%, #d4af37 70%, #8b6508 100%)',
        glowColor: 'rgba(212, 175, 55, 0.4)',
        borderColor: '#c8a96e',
        badgeColor: '#8a6d3b',
        label: 'BUFF'
      };
    }
    if (name.includes('cat') || name.includes('invis') || name.includes('mage armor') || name.includes('fly')) {
      return {
        icon: '🧪',
        liquidColor: 'linear-gradient(180deg, #00d2ff 0%, #0077be 70%, #003366 100%)',
        glowColor: 'rgba(0, 192, 255, 0.4)',
        borderColor: '#3498db',
        badgeColor: '#2980b9',
        label: 'UTIL'
      };
    }
    if (item.type === 'wand' || item.slot === 'wand' || name.includes('wand') || name.includes('stab')) {
      return {
        icon: '🪄',
        liquidColor: 'linear-gradient(180deg, #c39bd3 0%, #8e44ad 70%, #512e5f 100%)',
        glowColor: 'rgba(142, 68, 173, 0.4)',
        borderColor: '#9b59b6',
        badgeColor: '#8e44ad',
        label: 'WAND'
      };
    }
    if (item.type === 'scroll' || item.slot === 'scroll' || name.includes('scroll') || name.includes('schriftrolle')) {
      return {
        icon: '📜',
        liquidColor: 'linear-gradient(180deg, #f9e79f 0%, #d4ac0d 70%, #7d6608 100%)',
        glowColor: 'rgba(212, 172, 13, 0.35)',
        borderColor: '#f1c40f',
        badgeColor: '#b7950b',
        label: 'SCROLL'
      };
    }
    return {
      icon: '⚗️',
      liquidColor: 'linear-gradient(180deg, #58d68d 0%, #229954 70%, #145a32 100%)',
      glowColor: 'rgba(39, 174, 96, 0.4)',
      borderColor: '#2ecc71',
      badgeColor: '#27ae60',
      label: 'ITEM'
    };
  };

  const showItemInfo = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const aesthetic = getPotionAesthetic(item);
    showCustomAlert(
      item.name,
      `<div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11px;">
        <p><strong>Type:</strong> ${item.type || item.slot || 'Consumable'}</p>
        <p><strong>Effect:</strong> ${item.description || item.activation?.effectDescription || (item.healingFormula ? `Heals ${item.healingFormula} HP` : 'Usable combat item.')}</p>
        ${item.charges ? `<p><strong>Charges:</strong> ${item.charges.current} / ${item.charges.max}</p>` : ''}
        ${item.dailyUses ? `<p><strong>Daily Uses:</strong> ${item.dailyUses.current} / ${item.dailyUses.max}</p>` : ''}
      </div>`,
      "Close",
      aesthetic.icon
    );
  };

  return (
    <BaseCard title="🎒 Tactical Combat Belt (6 Quick Slots)">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        
        {/* Toast Feedback */}
        {feedbackToast && (
          <div
            style={{
              background: feedbackToast.isHeal ? 'rgba(39, 174, 96, 0.15)' : 'rgba(212, 175, 55, 0.15)',
              border: `1px solid ${feedbackToast.isHeal ? '#27ae60' : 'var(--pb)'}`,
              borderRadius: '3px',
              padding: '4px 8px',
              fontSize: '8px',
              fontFamily: "'Crimson Text', serif",
              fontWeight: 'bold',
              color: feedbackToast.isHeal ? '#1e824c' : 'var(--red)',
              textAlign: 'center',
              animation: 'fadeIn 0.2s ease-in'
            }}
          >
            ✨ {feedbackToast.message}
          </div>
        )}

        {/* Tactical Leather Belt Container */}
        <div
          style={{
            background: 'linear-gradient(180deg, #c49a6c 0%, #a87948 50%, #8c5f30 100%)',
            border: '1.5px solid #6e461f',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 3px rgba(0,0,0,0.25), 0 2px 5px rgba(110,70,31,0.2)',
            borderRadius: '4px',
            padding: '6px',
            position: 'relative'
          }}
        >
          {/* Leather Belt Stitching & Rivets Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: '2px',
              border: '1px dashed rgba(255, 240, 205, 0.7)',
              borderRadius: '2px',
              pointerEvents: 'none'
            }}
          />

          {/* 6 Fixed Belt Pouch Slots Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '5px',
              position: 'relative',
              zIndex: 1
            }}
          >
            {beltSlots.map((slotData, slotIdx) => {
              const isOver = dragOverSlot === slotIdx;

              if (!slotData) {
                // Empty Pouch Slot
                return (
                  <div
                    key={`empty-slot-${slotIdx}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverSlot(slotIdx);
                    }}
                    onDragLeave={() => setDragOverSlot(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropOnEmpty();
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
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '7px',
                        color: 'rgba(255, 240, 205, 0.8)',
                        fontFamily: "'IM Fell English SC', serif",
                        fontWeight: 'bold'
                      }}
                    >
                      [{slotIdx + 1}]
                    </span>
                    <span style={{ fontSize: '14px', opacity: 0.35 }}>🎒</span>
                    <span
                      style={{
                        fontSize: '6.5px',
                        color: 'rgba(255, 240, 205, 0.65)',
                        fontFamily: "'Crimson Text', serif",
                        fontStyle: 'italic'
                      }}
                    >
                      Empty
                    </span>
                  </div>
                );
              }

              const { item, originalIdx } = slotData;
              const aesthetic = getPotionAesthetic(item);
              const chargesLeft = item.charges ? item.charges.current : (item.dailyUses ? item.dailyUses.current : null);
              const maxCharges = item.charges ? item.charges.max : (item.dailyUses ? item.dailyUses.max : null);
              const isOutOfCharges = chargesLeft !== null && chargesLeft <= 0;
              const isDraggingThis = draggedIdx === originalIdx;

              return (
                <div
                  key={item.id || originalIdx}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, originalIdx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverSlot(slotIdx);
                  }}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDropOnSlot(originalIdx);
                  }}
                  style={{
                    background: isOutOfCharges ? 'rgba(230, 220, 205, 0.75)' : 'linear-gradient(180deg, rgba(255, 253, 248, 0.95) 0%, rgba(248, 238, 222, 0.9) 100%)',
                    border: isOver ? '1.5px solid #8b6914' : `1px solid ${isOutOfCharges ? 'rgba(150, 130, 110, 0.45)' : aesthetic.borderColor}`,
                    borderRadius: '3px',
                    padding: '4px 2px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '74px',
                    position: 'relative',
                    boxShadow: isOutOfCharges ? 'none' : (isOver ? '0 0 8px #8b6914' : `0 2px 5px rgba(0,0,0,0.12), 0 0 4px ${aesthetic.glowColor}`),
                    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                    cursor: isOutOfCharges ? 'default' : 'pointer',
                    opacity: isDraggingThis ? 0.4 : 1,
                    boxSizing: 'border-box'
                  }}
                  onClick={(e) => !isOutOfCharges && handleUseItem(originalIdx, e)}
                  title={`[${slotIdx + 1}] ${item.name} (Drag to reorder)`}
                >
                  {/* Top Belt Slot Hotkey Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', padding: '0 2px' }}>
                    <span
                      style={{
                        fontSize: '7px',
                        color: '#6e461f',
                        fontFamily: "'IM Fell English SC', serif",
                        fontWeight: 'bold'
                      }}
                    >
                      [{slotIdx + 1}]
                    </span>
                    <button
                      onClick={(e) => showItemInfo(item, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#8c5f30',
                        fontSize: '8px',
                        padding: 0,
                        cursor: 'pointer',
                        lineHeight: 1
                      }}
                      title="Info"
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
                      boxShadow: isOutOfCharges ? 'none' : `0 0 8px ${aesthetic.glowColor}`,
                      border: '1px solid rgba(255,255,255,0.4)',
                      margin: '1px 0'
                    }}
                  >
                    <span style={{ filter: isOutOfCharges ? 'grayscale(1)' : 'none' }}>{aesthetic.icon}</span>
                  </div>

                  {/* Item Name */}
                  <div
                    style={{
                      fontFamily: "'Crimson Text', serif",
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
                      width: '100%'
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
                          fontFamily: 'monospace'
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
                          letterSpacing: '0.5px'
                        }}
                      >
                        {aesthetic.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Belt Helper Info */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 2px' }}>
          <span style={{ fontSize: '7.5px', color: 'var(--inkm)', fontStyle: 'italic', fontFamily: "'Crimson Text', serif", textAlign: 'center' }}>
            💡 1-Tap on any flask to activate. Drag &amp; drop to reorder slots [1–6].
          </span>
        </div>

      </div>
    </BaseCard>
  );
};
