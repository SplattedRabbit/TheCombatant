/**
 * @module    BeltItemModal
 * @summary   Parchment styled detailed item information and activation modal for belt items.
 */

import React from 'react';
import { getPotionAesthetic } from './BeltSlot';

export interface BeltItemModalProps {
  selectedItem: { item: any; originalIdx: number };
  onClose: () => void;
  onUseItem: (originalIdx: number, e: React.MouseEvent) => void;
}

export const BeltItemModal: React.FC<BeltItemModalProps> = ({
  selectedItem,
  onClose,
  onUseItem,
}) => {
  const { item, originalIdx } = selectedItem;
  const aesthetic = getPotionAesthetic(item);
  const name = (item.name || 'Item').trim();
  const chargesLeft = item.charges ? item.charges.current : item.dailyUses ? item.dailyUses.current : null;
  const maxCharges = item.charges ? item.charges.max : item.dailyUses ? item.dailyUses.max : null;
  const isOutOfCharges = chargesLeft !== null && chargesLeft <= 0;

  const isPotion =
    item.type === 'potion' ||
    item.slot === 'potion' ||
    name.toLowerCase().includes('potion') ||
    name.toLowerCase().includes('trank');
  const isScroll =
    item.type === 'scroll' ||
    item.slot === 'scroll' ||
    name.toLowerCase().includes('scroll') ||
    name.toLowerCase().includes('schriftrolle');
  const isWand =
    item.type === 'wand' ||
    item.slot === 'wand' ||
    name.toLowerCase().includes('wand') ||
    name.toLowerCase().includes('stab');

  const actionTypeName = item.activation?.actionType
    ? `${item.activation.actionType.charAt(0).toUpperCase() + item.activation.actionType.slice(1)} Action`
    : 'Standard Action';
  const itemCategory = isPotion
    ? 'Potion (Consumable)'
    : isScroll
    ? 'Magic Scroll'
    : isWand
    ? 'Magic Wand'
    : item.type || 'Consumable / Wondrous';
  const itemAura = item.aura || (isPotion || isScroll || isWand ? 'Magic Item' : 'Adventuring Gear');

  const effectSummary = item.healingFormula
    ? `Restores ${item.healingFormula} Hit Points.`
    : item.damageFormula
    ? `Deals ${item.damageFormula} damage.`
    : item.activation?.effectDescription || item.description || 'Usable combat item.';

  const rawEffects = Array.isArray(item.effects) ? item.effects : [];
  const activeEffects = rawEffects.filter((e: any) => (parseInt(e.value, 10) || 0) !== 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p, #fcf6e8)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '4px',
          padding: '16px 20px',
          width: '460px',
          maxWidth: '92vw',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.1)',
          fontFamily: "'IM Fell English SC', serif",
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '3px',
            border: '0.5px dashed rgba(200, 169, 110, 0.35)',
            pointerEvents: 'none',
            borderRadius: '2px',
          }}
        />

        {/* Close X */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '8px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '14px',
            color: 'var(--inkm, #8c7b6c)',
            cursor: 'pointer',
            fontWeight: 'bold',
            zIndex: 2,
          }}
        >
          ✕
        </button>

        {/* Modal Title */}
        <div
          style={{
            fontSize: '15px',
            color: 'var(--red, #8b1a1a)',
            fontWeight: 'bold',
            marginBottom: '2px',
            letterSpacing: '0.6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <span>{aesthetic.icon}</span>
          <span>{name}</span>
        </div>
        <div style={{ fontSize: '8.5px', color: 'var(--inkm, #8c7b6c)', fontStyle: 'italic', marginBottom: '6px' }}>
          {itemAura}
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.45)', margin: '4px 0 10px' }} />

        {/* Ancient Parchment Content */}
        <div
          className="ancient-parchment"
          style={{
            background: '#f4e8c1',
            border: '2px solid #8b1a1a',
            padding: '12px 16px',
            borderRadius: '4px',
            boxShadow: 'inset 0 0 25px rgba(139, 26, 26, 0.12)',
            fontFamily: "'Crimson Text', serif",
            color: '#1a0f00',
            lineHeight: 1.45,
            textAlign: 'left',
            boxSizing: 'border-box',
          }}
        >
          {/* Meta Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              fontSize: '10.5px',
              borderBottom: '1px solid rgba(139,26,26,0.25)',
              paddingBottom: '8px',
              marginBottom: '8px',
            }}
          >
            <div>
              <span style={{ color: '#8b1a1a', fontWeight: 'bold' }}>Type: </span>
              <span>{itemCategory}</span>
            </div>
            <div>
              <span style={{ color: '#8b1a1a', fontWeight: 'bold' }}>Action: </span>
              <span>{actionTypeName}</span>
            </div>
            <div>
              <span style={{ color: '#8b1a1a', fontWeight: 'bold' }}>Charges: </span>
              <span>
                {chargesLeft !== null
                  ? `${chargesLeft} / ${maxCharges}`
                  : item.dailyUses
                  ? `${item.dailyUses.current}/${item.dailyUses.max} Daily`
                  : 'Single-Use'}
              </span>
            </div>
            <div>
              <span style={{ color: '#8b1a1a', fontWeight: 'bold' }}>Belt Slot: </span>
              <span>Ready [Quick-Slot]</span>
            </div>
          </div>

          {/* Effect / Description */}
          <div style={{ fontSize: '11px', lineHeight: 1.5, color: '#2a1b0a', marginBottom: '6px' }}>
            <div
              style={{
                fontWeight: 'bold',
                color: '#8b1a1a',
                marginBottom: '2px',
                fontFamily: "'IM Fell English SC', serif",
                fontSize: '11.5px',
              }}
            >
              Effect &amp; Rules:
            </div>
            <div style={{ fontStyle: 'italic', marginBottom: '6px' }}>
              {item.description || item.activation?.effectDescription || effectSummary}
            </div>
          </div>

          {/* Stat Modifiers pills */}
          {activeEffects.length > 0 && (
            <div style={{ marginTop: '6px', borderTop: '0.5px dashed rgba(139, 26, 26, 0.3)', paddingTop: '6px' }}>
              <div
                style={{
                  fontWeight: 'bold',
                  color: '#8b1a1a',
                  fontSize: '10.5px',
                  fontFamily: "'IM Fell English SC', serif",
                  marginBottom: '3px',
                }}
              >
                Passive / Applied Modifiers:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                {activeEffects.map((eff: any, eIdx: number) => {
                  const sign = (parseInt(eff.value, 10) || 0) >= 0 ? '+' : '';
                  return (
                    <span
                      key={eIdx}
                      style={{
                        fontSize: '9px',
                        background: 'rgba(139, 26, 26, 0.08)',
                        border: '0.5px solid rgba(139, 26, 26, 0.3)',
                        borderRadius: '2px',
                        padding: '1px 5px',
                        color: '#601212',
                        fontWeight: 600,
                      }}
                    >
                      {sign}
                      {eff.value} {eff.type || ''} ({eff.target || ''})
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{
              fontSize: '9.5px',
              padding: '3px 12px',
              fontFamily: "'IM Fell English SC', serif",
              fontWeight: 'bold',
              background: 'rgba(200, 169, 110, 0.12)',
              border: '0.5px solid var(--pb, #c8a96e)',
              color: 'var(--ink, #1a0f00)',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          {!isOutOfCharges && (
            <button
              type="button"
              onClick={(e) => {
                onClose();
                onUseItem(originalIdx, e);
              }}
              className="btn btn-p"
              style={{
                fontSize: '9.5px',
                padding: '3px 14px',
                fontFamily: "'IM Fell English SC', serif",
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                border: '0.5px solid #8b6914',
                color: '#ffffff',
                borderRadius: '2px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            >
              {isPotion ? '🍷 Drink Potion' : isWand ? '🪄 Cast Wand' : isScroll ? '📜 Read Scroll' : '⚡ Use Item'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
