/**
 * @module    TacticalBeltCard
 * @summary   Diablo 2 style tactical combat belt providing instant 1-tap drinking/use for potions, scrolls, wands, and alchemical items.
 * @exports   TacticalBeltCard
 * @reads     pc.items, pc.hp, pc.maxHp, pc.activeBuffs
 * @stateOps  CombatState.usePCItemCharge, CombatState.addPCItemFromCompendium
 * @depends   React, @core/state.js, src/components/shared/BaseCard
 */

import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import { BaseCard } from '../../shared/BaseCard';
// @ts-ignore
import { showCustomAlert } from '@core/ui/components/dialogs.js';

interface TacticalBeltCardProps {
  pc: any;
}

export const TacticalBeltCard: React.FC<TacticalBeltCardProps> = ({ pc }) => {
  const [feedbackToast, setFeedbackToast] = useState<{ id: number; message: string; isHeal: boolean } | null>(null);

  // Filter consumables: Potions, Scrolls, Wands, Alchemical or items with charges / healing
  const allItems = Array.isArray(pc.items) ? pc.items : [];
  const consumables = allItems
    .map((item: any, originalIdx: number) => ({ item, originalIdx }))
    .filter(({ item }: { item: any }) => {
      const isPotion = item.type === 'potion' || item.slot === 'potion' || item.name?.toLowerCase().includes('potion') || item.name?.toLowerCase().includes('trank');
      const isScroll = item.type === 'scroll' || item.slot === 'scroll' || item.name?.toLowerCase().includes('scroll') || item.name?.toLowerCase().includes('schriftrolle');
      const isWand = item.type === 'wand' || item.slot === 'wand' || item.name?.toLowerCase().includes('wand') || item.name?.toLowerCase().includes('stab');
      const hasCharges = item.charges && item.charges.max > 0;
      const hasDaily = item.dailyUses && item.dailyUses.max > 0;
      const hasHealing = !!item.healingFormula;
      const isUsable = item.activation?.isUsable;
      return isPotion || isScroll || isWand || hasCharges || hasDaily || hasHealing || isUsable;
    });

  const handleUseItem = (originalIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleAddDefaultPotion = () => {
    CombatState.addPCItemFromCompendium('potion_cure_light', false);
  };

  return (
    <BaseCard title="🎒 Tactical Combat Belt (Quick Pouch)">
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

        {/* Diablo 2 Belt Container */}
        <div
          style={{
            background: 'linear-gradient(180deg, #1c140e 0%, #2b1d14 50%, #150e09 100%)',
            border: '2px solid #5c3a21',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.4)',
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
              border: '1px dashed rgba(200, 169, 110, 0.3)',
              borderRadius: '2px',
              pointerEvents: 'none'
            }}
          />

          {consumables.length === 0 ? (
            <div style={{ padding: '14px 8px', textAlign: 'center', color: 'rgba(200, 169, 110, 0.7)', fontFamily: "'Crimson Text', serif", fontSize: '9px' }}>
              <div style={{ fontSize: '18px', marginBottom: '4px', opacity: 0.8 }}>🧪 🍷 📜</div>
              <div>Your tactical potion belt is empty.</div>
              <button
                className="btn btn-p"
                onClick={handleAddDefaultPotion}
                style={{
                  marginTop: '8px',
                  fontFamily: "'IM Fell English SC', serif",
                  fontSize: '8px',
                  padding: '2px 8px',
                  cursor: 'pointer'
                }}
              >
                ➕ Add Potion (Cure Light Wounds)
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
                gap: '6px',
                position: 'relative',
                zIndex: 1
              }}
            >
              {consumables.map(({ item, originalIdx }: { item: any; originalIdx: number }, slotIdx: number) => {
                const aesthetic = getPotionAesthetic(item);
                const chargesLeft = item.charges ? item.charges.current : (item.dailyUses ? item.dailyUses.current : null);
                const maxCharges = item.charges ? item.charges.max : (item.dailyUses ? item.dailyUses.max : null);
                const isOutOfCharges = chargesLeft !== null && chargesLeft <= 0;

                return (
                  <div
                    key={item.id || originalIdx}
                    style={{
                      background: 'radial-gradient(circle at center, #2e2017 0%, #150e09 100%)',
                      border: `1px solid ${isOutOfCharges ? '#555' : aesthetic.borderColor}`,
                      borderRadius: '3px',
                      padding: '4px 3px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minHeight: '74px',
                      position: 'relative',
                      boxShadow: isOutOfCharges ? 'none' : `0 0 6px ${aesthetic.glowColor}, inset 0 0 4px rgba(0,0,0,0.6)`,
                      transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => !isOutOfCharges && handleUseItem(originalIdx, e)}
                    title={`Click to drink / activate: ${item.name}`}
                  >
                    {/* Top Belt Slot Hotkey Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', padding: '0 2px' }}>
                      <span
                        style={{
                          fontSize: '6.5px',
                          color: 'rgba(200, 169, 110, 0.8)',
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
                          color: 'rgba(200, 169, 110, 0.6)',
                          fontSize: '7.5px',
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
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: isOutOfCharges ? '#333' : aesthetic.liquidColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        boxShadow: isOutOfCharges ? 'none' : `0 0 8px ${aesthetic.glowColor}`,
                        border: '1px solid rgba(255,255,255,0.2)',
                        margin: '2px 0'
                      }}
                    >
                      <span style={{ filter: isOutOfCharges ? 'grayscale(1)' : 'none' }}>{aesthetic.icon}</span>
                    </div>

                    {/* Item Name */}
                    <div
                      style={{
                        fontFamily: "'Crimson Text', serif",
                        fontSize: '7.5px',
                        fontWeight: 'bold',
                        color: isOutOfCharges ? '#777' : 'var(--p)',
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
                    <div style={{ marginTop: '2px', display: 'flex', gap: '2px', alignItems: 'center' }}>
                      {chargesLeft !== null ? (
                        <span
                          style={{
                            background: isOutOfCharges ? '#444' : aesthetic.badgeColor,
                            color: '#fff',
                            fontSize: '6.5px',
                            padding: '0 3px',
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
                            fontSize: '6px',
                            padding: '0 3px',
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
          )}
        </div>

        {/* Quick Belt Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
          <span style={{ fontSize: '7.5px', color: 'var(--inkm)', fontStyle: 'italic', fontFamily: "'Crimson Text', serif" }}>
            💡 1-Tap on any flask to instantly drink / activate.
          </span>
          <button
            className="btn"
            onClick={handleAddDefaultPotion}
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '7px',
              padding: '1px 5px',
              height: '14px',
              lineHeight: 1
            }}
          >
            ➕ Add Potion
          </button>
        </div>

      </div>
    </BaseCard>
  );
};
