import React, { useState } from 'react';
import { CombatState } from '@core/state.js';

interface BodySlotCardProps {
  slotKey: string;
  slotDef: { nameEn: string; nameDe: string; icon: string };
  item: any;
  itemIdx: number;
  stackingBreakdown?: any[];
  onUnequip: () => void;
  onSwap?: () => void;
  onEdit: () => void;
  onActivateBuff?: (buffKey: string) => void;
}

export const formatEffectDisplay = (eff: any) => {
  const val = parseInt(eff.value) || 0;
  const sign = val >= 0 ? `+${val}` : `${val}`;
  const rawTarget = (eff.target || '').toLowerCase().trim();
  
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
    all: 'All Saves',
    deflection: 'Defl AC',
    natural: 'Nat AC',
    armor: 'Armor AC',
    shield: 'Shield AC',
    dodge: 'Dodge AC',
    speed: 'Speed',
    ini: 'Init',
    spot: 'Spot',
    listen: 'Listen',
    search: 'Search',
    jump: 'Jump',
    move_silently: 'Move Silently',
    hide: 'Hide',
    concentration: 'Concentration',
    spellcraft: 'Spellcraft',
    ranged_atk: 'Ranged ATK',
    melee_atk: 'Melee ATK',
    attack: 'Attack',
    damage: 'Damage',
    spell_resistance: 'SR',
    spell_penetration: 'Spell Pen',
    darkvision: 'Darkvision',
    concealment: 'Concealment',
    miss_chance: 'Miss Chance',
    dr: 'DR',
    fast_healing: 'Fast Healing',
    fire_res: 'Fire Res',
    cold_res: 'Cold Res',
    elec_res: 'Elec Res',
    acid_res: 'Acid Res',
    sonic_res: 'Sonic Res'
  };

  if (rawTarget === 'spell_resistance') {
    return `SR ${val}`;
  }
  if (rawTarget === 'darkvision') {
    return `Darkvision ${val} ft.`;
  }
  if (rawTarget === 'concealment' || rawTarget === 'miss_chance') {
    return `${val}% Miss Chance`;
  }

  const cleanTarget = targetNames[rawTarget] || 
    rawTarget.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return `${sign} ${cleanTarget}`;
};

export const BodySlotCard: React.FC<BodySlotCardProps> = ({
  slotDef,
  item,
  itemIdx,
  stackingBreakdown = [],
  onUnequip,
  onEdit,
  onActivateBuff
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const rawEffects = Array.isArray(item.effects) ? item.effects : [];
  const activeEffects = rawEffects.filter((e: any) => (parseInt(e.value) || 0) !== 0);

  const suppressedEntry = stackingBreakdown.find((s: any) => s.itemIdx === itemIdx && !s.isActive);

  const handleToggleFlip = (targetState: boolean) => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsFlipped(targetState);
    }, 210);
    setTimeout(() => {
      setIsAnimating(false);
    }, 430);
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
    <div className={`item-slot-card-container ${isAnimating ? 'item-card-animating' : ''}`} style={{ minHeight: '60px' }}>
      {!isFlipped ? (
        /* === FRONT FACE (COMPACT & PARCHMENT) === */
        <div
          onClick={() => handleToggleFlip(true)}
          style={{
            background: 'var(--pd, #fdf6e2)',
            border: '1.5px solid var(--pb, #c8a96e)',
            borderLeft: suppressedEntry ? '3.5px solid #d97706' : '3.5px solid var(--red, #8b1a1a)',
            borderRadius: '3px',
            padding: '5px 7px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '3px',
            minHeight: '60px',
            boxSizing: 'border-box',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
          title={suppressedEntry ? `Bonus suppressed by ${suppressedEntry.overriddenBy || 'another item'}` : "Click to flip / unequip"}
        >
          {/* Header Row: Slot Icon + Name and clean Effect Pill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', lineHeight: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px' }}>{slotDef.icon}</span>
              <span style={{ fontSize: '9.5px', fontWeight: 'bold', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif" }}>
                {slotDef.nameEn}
              </span>
            </div>

            {activeEffects.length > 0 && (
              <span
                style={{
                  fontSize: '8.5px',
                  background: suppressedEntry ? 'rgba(217, 119, 6, 0.15)' : 'rgba(200, 169, 110, 0.25)',
                  border: suppressedEntry ? '0.5px solid #d97706' : '0.5px solid var(--pb)',
                  textDecoration: suppressedEntry ? 'line-through' : 'none',
                  opacity: suppressedEntry ? 0.75 : 1,
                  borderRadius: '2px',
                  padding: '0 4px',
                  color: suppressedEntry ? '#b45309' : 'var(--ink)',
                  fontWeight: 'bold',
                  fontFamily: "'Crimson Text', serif",
                  lineHeight: '14px'
                }}
                title={suppressedEntry ? `Suppressed by ${suppressedEntry.overriddenBy || 'another item'}` : ''}
              >
                {formatEffectDisplay(activeEffects[0])}
                {activeEffects.length > 1 ? ` +${activeEffects.length - 1}` : ''}
                {suppressedEntry ? ' ⚠️' : ''}
              </span>
            )}
          </div>

          {/* Item Name */}
          <div
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '11.5px',
              fontWeight: 'bold',
              color: 'var(--red)',
              lineHeight: 1.2,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', lineHeight: 1 }}>
              {item.charges ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ color: 'var(--inkm)' }}>Chg:</span>
                  <span style={{ color: item.charges.current === 0 ? 'var(--red)' : '#2e7d32', fontWeight: 'bold' }}>
                    {item.charges.current}/{item.charges.max}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleChargeChange(e, 1)}
                    disabled={item.charges.current <= 0}
                    className="btn"
                    style={{ fontSize: '7.5px', padding: '0 3px', height: '13px', lineHeight: '1' }}
                  >
                    -1
                  </button>
                </div>
              ) : item.dailyUses ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ color: 'var(--inkm)' }}>Day:</span>
                  <span style={{ color: item.dailyUses.current === 0 ? 'var(--red)' : '#2e7d32', fontWeight: 'bold' }}>
                    {item.dailyUses.current}/{item.dailyUses.max}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleChargeChange(e, 1)}
                    disabled={item.dailyUses.current <= 0}
                    className="btn"
                    style={{ fontSize: '7.5px', padding: '0 3px', height: '13px', lineHeight: '1' }}
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
                  style={{ fontSize: '8px', padding: '0 5px', height: '14px', lineHeight: '1', fontFamily: "'IM Fell English SC', serif" }}
                >
                  ⚡ Buff
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* === BACK FACE (FLIPPED ACTIONS - NO SWAP BUTTON) === */
        <div
          style={{
            background: 'var(--pd, #fdf6e2)',
            border: '1.5px solid var(--red)',
            borderRadius: '3px',
            padding: '4px 6px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '60px',
            boxSizing: 'border-box',
            boxShadow: '0 2px 8px rgba(139, 26, 26, 0.12)'
          }}
        >
          <div style={{ textAlign: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9.5px', color: 'var(--red)', fontWeight: 'bold', lineHeight: 1.1 }}>
            Unequip {slotDef.nameEn}?
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '3px 0' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFlip(false);
                onUnequip();
              }}
              className="btn btn-p"
              style={{ fontSize: '9px', padding: '2px 8px', fontFamily: "'IM Fell English SC', serif", background: 'var(--red)', color: 'white', fontWeight: 'bold' }}
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
              style={{ fontSize: '9px', padding: '2px 8px', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold' }}
            >
              No
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFlip(false);
                onEdit();
              }}
              className="btn"
              style={{ fontSize: '8px', padding: '0 6px', fontFamily: "'IM Fell English SC', serif" }}
            >
              ✏️ Item Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
