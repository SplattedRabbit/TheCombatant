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

export const formatEffectDisplay = (eff: any) => {
  const val = parseInt(eff.value) || 0;
  const sign = val >= 0 ? `+${val}` : `${val}`;
  const target = (eff.target || 'str').toLowerCase();
  
  const targetNames: Record<string, string> = {
    str: 'STR',
    dex: 'DEX',
    con: 'CON',
    int: 'INT',
    wis: 'WIS',
    cha: 'CHA',
    fort: 'Fortitude',
    ref: 'Reflex',
    wil: 'Will',
    all: 'All Saves',
    deflection: 'Deflection AC',
    natural: 'Natural Armor',
    armor: 'Armor AC',
    shield: 'Shield AC',
    dodge: 'Dodge AC',
    speed: 'Speed',
    ini: 'Initiative',
    spot: 'Spot',
    jump: 'Jump',
    move_silently: 'Move Silently',
    ranged_atk: 'Ranged ATK'
  };

  const cleanTarget = targetNames[target] || target.toUpperCase();
  return `${sign} ${cleanTarget}`;
};

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
    <div className={`item-slot-card-container ${isAnimating ? 'item-card-animating' : ''}`} style={{ minHeight: '76px' }}>
      {!isFlipped ? (
        /* === FRONT FACE (PARCHMENT AESTHETIC) === */
        <div
          onClick={() => handleToggleFlip(true)}
          style={{
            background: 'var(--pd, #fdf6e2)',
            border: '1.5px solid var(--pb, #c8a96e)',
            borderLeft: '3.5px solid var(--red, #8b1a1a)',
            borderRadius: '4px',
            padding: '6px 8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            minHeight: '76px',
            boxSizing: 'border-box'
          }}
          title="Click to flip and inspect or unequip"
        >
          {/* Header with Icon directly in front of Slot Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '13px' }}>{slotDef.icon}</span>
            <span style={{ fontSize: '10.5px', fontWeight: 'bold', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", letterSpacing: '0.4px' }}>
              {slotDef.nameEn}
            </span>
          </div>

          {/* Item Name */}
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '12px', fontWeight: 'bold', color: 'var(--red)', lineHeight: 1.2 }}>
            {item.name || item.nameDe || 'Equipped Item'}
          </div>

          {/* Clean Effect Pills */}
          {activeEffects.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
              {activeEffects.map((eff: any, eIdx: number) => (
                <span
                  key={eIdx}
                  style={{
                    fontSize: '9.5px',
                    background: 'rgba(200, 169, 110, 0.22)',
                    border: '0.5px solid var(--pb)',
                    borderRadius: '2px',
                    padding: '0 5px',
                    color: 'var(--ink)',
                    fontWeight: 600,
                    fontFamily: "'Crimson Text', serif"
                  }}
                >
                  {formatEffectDisplay(eff)}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '9px', color: 'var(--inkm)', fontStyle: 'italic', fontFamily: "'Crimson Text', serif" }}>
              {item.description ? (item.description.length > 45 ? item.description.substring(0, 45) + '...' : item.description) : 'No passive bonuses'}
            </div>
          )}

          {/* Charges / Activation Footer */}
          {(item.charges || item.dailyUses || item.activation?.appliedBuffKey) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1px', fontSize: '9.5px' }}>
              {item.charges ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ color: 'var(--inkm)', fontWeight: 'bold' }}>Charges:</span>
                  <span style={{ color: item.charges.current === 0 ? 'var(--red)' : '#2e7d32', fontWeight: 'bold' }}>
                    {item.charges.current} / {item.charges.max}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleChargeChange(e, 1)}
                    disabled={item.charges.current <= 0}
                    className="btn"
                    style={{ fontSize: '8px', padding: '0 4px', height: '16px', lineHeight: '1' }}
                    title="Use 1 charge"
                  >
                    -1
                  </button>
                </div>
              ) : item.dailyUses ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ color: 'var(--inkm)', fontWeight: 'bold' }}>Daily:</span>
                  <span style={{ color: item.dailyUses.current === 0 ? 'var(--red)' : '#2e7d32', fontWeight: 'bold' }}>
                    {item.dailyUses.current} / {item.dailyUses.max}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleChargeChange(e, 1)}
                    disabled={item.dailyUses.current <= 0}
                    className="btn"
                    style={{ fontSize: '8px', padding: '0 4px', height: '16px', lineHeight: '1' }}
                    title="Use 1 daily use"
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
                    fontSize: '9px',
                    padding: '1px 6px',
                    height: '18px',
                    lineHeight: '1',
                    fontFamily: "'IM Fell English SC', serif"
                  }}
                  title={`Activate Buff: ${item.activation.appliedBuffKey}`}
                >
                  ⚡ Buff
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* === BACK FACE (FLIPPED ACTIONS) === */
        <div
          style={{
            background: 'var(--pd, #fdf6e2)',
            border: '1.5px solid var(--red)',
            borderRadius: '4px',
            padding: '6px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 3px 10px rgba(139, 26, 26, 0.15)',
            minHeight: '76px',
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3px' }}>
            <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', color: 'var(--red)', fontWeight: 'bold' }}>
              Unequip {slotDef.nameEn}?
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '3px 0' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFlip(false);
                onUnequip();
              }}
              className="btn btn-p"
              style={{
                fontSize: '10px',
                padding: '2px 10px',
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
                fontSize: '10px',
                padding: '2px 10px',
                fontFamily: "'IM Fell English SC', serif",
                fontWeight: 'bold'
              }}
            >
              No, Keep
            </button>
          </div>

          {/* Swap & Edit Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid var(--pb)', paddingTop: '3px' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFlip(false);
                onSwap();
              }}
              className="btn"
              style={{ fontSize: '8.5px', padding: '1px 5px', fontFamily: "'IM Fell English SC', serif" }}
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
              style={{ fontSize: '8.5px', padding: '1px 5px', fontFamily: "'IM Fell English SC', serif" }}
            >
              ✏️ Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
