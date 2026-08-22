import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';

interface BodySlotCardProps {
  slotKey: string;
  slotDef: { nameEn: string; nameDe: string; icon: string };
  item: any;
  itemIdx: number;
  onUnequip: () => void;
  onSwap: () => void;
  onEdit: () => void;
  onActivateBuff?: (buffKey: string) => void;
}

export const BodySlotCard: React.FC<BodySlotCardProps> = ({
  slotKey,
  slotDef,
  item,
  itemIdx,
  onUnequip,
  onSwap,
  onEdit,
  onActivateBuff
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const rawEffects = Array.isArray(item.effects) ? item.effects : [];
  const activeEffects = rawEffects.filter((e: any) => (parseInt(e.value) || 0) !== 0);

  const handleToggleFlip = (targetState: boolean) => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsFlipped(targetState);
    }, 130);
    setTimeout(() => {
      setIsAnimating(false);
    }, 270);
  };

  const handleChargeChange = (e: React.MouseEvent, amount: number) => {
    e.stopPropagation();
    CombatState.usePCItemCharge(itemIdx, amount);
  };

  const handleQuickActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.activation?.appliedBuffKey && onActivateBuff) {
      onActivateBuff(item.activation.appliedBuffKey);
    }
  };

  return (
    <div className={`item-slot-card-container ${isAnimating ? 'item-card-animating' : ''}`}>
      {!isFlipped ? (
        /* === FRONT FACE (CRYSTAL CLEAR VECTOR DOM) === */
        <div
          onClick={() => handleToggleFlip(true)}
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--pb)',
            borderLeft: '4px solid var(--red)',
            borderRadius: '4px',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            minHeight: '94px',
            boxSizing: 'border-box'
          }}
          title="Klicken zum Umdrehen / Ablegen"
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px' }}>{slotDef.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif" }}>
                {slotDef.nameEn}
              </span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif" }}>
              🔄 Flip
            </span>
          </div>

          {/* Item Name */}
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '13px', fontWeight: 'bold', color: 'var(--red)', lineHeight: 1.25 }}>
            {item.name || item.nameDe || 'Equipped Item'}
          </div>

          {/* Effects Summary */}
          {activeEffects.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {activeEffects.map((eff: any, eIdx: number) => {
                const val = eff.value >= 0 ? `+${eff.value}` : `${eff.value}`;
                const target = (eff.target || 'str').toUpperCase();
                return (
                  <span
                    key={eIdx}
                    style={{
                      fontSize: '10px',
                      background: 'rgba(200, 169, 110, 0.18)',
                      border: '0.5px solid var(--pb)',
                      borderRadius: '3px',
                      padding: '1px 6px',
                      color: 'var(--ink)',
                      fontWeight: 600,
                      fontFamily: "'Crimson Text', serif"
                    }}
                  >
                    {val} {target} {eff.bonusType ? `(${eff.bonusType})` : ''}
                  </span>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '9.5px', color: 'var(--inkm)', fontStyle: 'italic', fontFamily: "'Crimson Text', serif" }}>
              {item.description ? (item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description) : 'Keine passiven Boni'}
            </div>
          )}

          {/* Charges / Activation Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', fontSize: '10px' }}>
            {item.charges ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: 'var(--inkm)', fontWeight: 'bold' }}>Charges:</span>
                <span style={{ color: item.charges.current === 0 ? 'var(--red)' : '#2e7d32', fontWeight: 'bold' }}>
                  {item.charges.current} / {item.charges.max}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleChargeChange(e, 1)}
                  disabled={item.charges.current <= 0}
                  className="btn"
                  style={{ fontSize: '8.5px', padding: '1px 5px', height: '18px', lineHeight: '1' }}
                  title="1 Ladung verbrauchen"
                >
                  -1
                </button>
              </div>
            ) : item.dailyUses ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: 'var(--inkm)', fontWeight: 'bold' }}>Daily:</span>
                <span style={{ color: item.dailyUses.current === 0 ? 'var(--red)' : '#2e7d32', fontWeight: 'bold' }}>
                  {item.dailyUses.current} / {item.dailyUses.max}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleChargeChange(e, 1)}
                  disabled={item.dailyUses.current <= 0}
                  className="btn"
                  style={{ fontSize: '8.5px', padding: '1px 5px', height: '18px', lineHeight: '1' }}
                  title="1 Tagesnutzung verbrauchen"
                >
                  -1
                </button>
              </div>
            ) : <div />}

            {item.activation?.appliedBuffKey && (
              <button
                type="button"
                onClick={handleQuickActivate}
                className="btn btn-p"
                style={{
                  fontSize: '9.5px',
                  padding: '2px 8px',
                  height: '20px',
                  lineHeight: '1',
                  fontFamily: "'IM Fell English SC', serif"
                }}
                title={`Buff aktivieren: ${item.activation.appliedBuffKey}`}
              >
                ⚡ Buff
              </button>
            )}
          </div>
        </div>
      ) : (
        /* === BACK FACE (FLIPPED ACTIONS - CRYSTAL CLEAR VECTOR DOM) === */
        <div
          style={{
            background: '#fff9f0',
            border: '2px solid var(--red)',
            borderRadius: '4px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(139, 26, 26, 0.2)',
            minHeight: '94px',
            boxSizing: 'border-box'
          }}
        >
          {/* Question / Header */}
          <div style={{ textAlign: 'center', borderBottom: '1px solid var(--pb)', paddingBottom: '4px' }}>
            <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '12px', color: 'var(--red)', fontWeight: 'bold' }}>
              {slotDef.nameEn} ablegen?
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '4px 0' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFlip(false);
                onUnequip();
              }}
              className="btn btn-p"
              style={{
                fontSize: '11px',
                padding: '3px 12px',
                fontFamily: "'IM Fell English SC', serif",
                background: 'var(--red)',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              Yes, Unequip
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFlip(false);
              }}
              className="btn"
              style={{
                fontSize: '11px',
                padding: '3px 12px',
                fontFamily: "'IM Fell English SC', serif",
                fontWeight: 'bold'
              }}
            >
              No, Keep
            </button>
          </div>

          {/* Swap & Edit Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid var(--pb)', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFlip(false);
                onSwap();
              }}
              className="btn"
              style={{ fontSize: '9.5px', padding: '2px 6px', fontFamily: "'IM Fell English SC', serif" }}
            >
              🔁 Swap Item
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFlip(false);
                onEdit();
              }}
              className="btn"
              style={{ fontSize: '9.5px', padding: '2px 6px', fontFamily: "'IM Fell English SC', serif" }}
            >
              ✏️ Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
