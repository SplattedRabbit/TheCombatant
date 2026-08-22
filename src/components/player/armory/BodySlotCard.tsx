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
    fort: 'Fort',
    ref: 'Ref',
    wil: 'Will',
    all: 'Saves',
    deflection: 'Defl AC',
    natural: 'Nat AC',
    armor: 'Armor AC',
    shield: 'Shield AC',
    dodge: 'Dodge AC',
    speed: 'Speed',
    ini: 'Init',
    spot: 'Spot',
    jump: 'Jump',
    move_silently: 'Stealth',
    ranged_atk: 'Ranged'
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
    }, 120);
    setTimeout(() => {
      setIsAnimating(false);
    }, 250);
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
    <div className={`item-slot-card-container ${isAnimating ? 'item-card-animating' : ''}`} style={{ minHeight: '52px' }}>
      {!isFlipped ? (
        /* === FRONT FACE (COMPACT TABLET-FIRST) === */
        <div
          onClick={() => handleToggleFlip(true)}
          style={{
            background: 'var(--pd, #fdf6e2)',
            border: '1.5px solid var(--pb, #c8a96e)',
            borderLeft: '3px solid var(--red, #8b1a1a)',
            borderRadius: '3px',
            padding: '4px 6px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '2px',
            minHeight: '52px',
            boxSizing: 'border-box'
          }}
          title="Click to flip / unequip"
        >
          {/* Header Row: Slot Icon + Name and clean Effect Pill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', lineHeight: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ fontSize: '11px' }}>{slotDef.icon}</span>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif" }}>
                {slotDef.nameEn}
              </span>
            </div>

            {activeEffects.length > 0 && (
              <span
                style={{
                  fontSize: '8.5px',
                  background: 'rgba(200, 169, 110, 0.25)',
                  border: '0.5px solid var(--pb)',
                  borderRadius: '2px',
                  padding: '0 3px',
                  color: 'var(--ink)',
                  fontWeight: 'bold',
                  fontFamily: "'Crimson Text', serif",
                  lineHeight: '13px'
                }}
              >
                {formatEffectDisplay(activeEffects[0])}
                {activeEffects.length > 1 ? ` +${activeEffects.length - 1}` : ''}
              </span>
            )}
          </div>

          {/* Item Name */}
          <div
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '11px',
              fontWeight: 'bold',
              color: 'var(--red)',
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={item.name}
          >
            {item.name || item.nameDe || 'Equipped'}
          </div>

          {/* Charges / Activation Mini-Bar */}
          {(item.charges || item.dailyUses || item.activation?.appliedBuffKey) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', lineHeight: 1 }}>
              {item.charges ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ color: 'var(--inkm)' }}>Chg:</span>
                  <span style={{ color: item.charges.current === 0 ? 'var(--red)' : '#2e7d32', fontWeight: 'bold' }}>
                    {item.charges.current}/{item.charges.max}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleChargeChange(e, 1)}
                    disabled={item.charges.current <= 0}
                    className="btn"
                    style={{ fontSize: '7px', padding: '0 2px', height: '12px', lineHeight: '1' }}
                  >
                    -1
                  </button>
                </div>
              ) : item.dailyUses ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ color: 'var(--inkm)' }}>Day:</span>
                  <span style={{ color: item.dailyUses.current === 0 ? 'var(--red)' : '#2e7d32', fontWeight: 'bold' }}>
                    {item.dailyUses.current}/{item.dailyUses.max}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleChargeChange(e, 1)}
                    disabled={item.dailyUses.current <= 0}
                    className="btn"
                    style={{ fontSize: '7px', padding: '0 2px', height: '12px', lineHeight: '1' }}
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
                  style={{ fontSize: '7.5px', padding: '0 4px', height: '13px', lineHeight: '1', fontFamily: "'IM Fell English SC', serif" }}
                >
                  ⚡ Buff
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* === BACK FACE (COMPACT ACTIONS) === */
        <div
          style={{
            background: 'var(--pd, #fdf6e2)',
            border: '1.5px solid var(--red)',
            borderRadius: '3px',
            padding: '3px 4px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '52px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ textAlign: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', lineHeight: 1 }}>
            Unequip {slotDef.nameEn}?
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '2px 0' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFlip(false);
                onUnequip();
              }}
              className="btn btn-p"
              style={{ fontSize: '8.5px', padding: '1px 6px', fontFamily: "'IM Fell English SC', serif", background: 'var(--red)', color: 'white' }}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFlip(false);
              }}
              className="btn"
              style={{ fontSize: '8.5px', padding: '1px 6px', fontFamily: "'IM Fell English SC', serif" }}
            >
              No
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFlip(false);
                onSwap();
              }}
              className="btn"
              style={{ fontSize: '7.5px', padding: '0 3px', fontFamily: "'IM Fell English SC', serif" }}
            >
              🔁 Swap
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFlip(false);
                onEdit();
              }}
              className="btn"
              style={{ fontSize: '7.5px', padding: '0 3px', fontFamily: "'IM Fell English SC', serif" }}
            >
              ✏️ Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
