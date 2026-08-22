import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { MAGIC_ITEMS_REGISTRY, ITEM_SLOTS } from '@core/data/magicItems-data.js';

interface ItemCompendiumModalProps {
  initialSlot?: string;
  onClose: () => void;
}

export const ItemCompendiumModal: React.FC<ItemCompendiumModalProps> = ({
  initialSlot = 'all',
  onClose
}) => {
  const [search, setSearch] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(initialSlot || 'all');

  const allItems = Object.values(MAGIC_ITEMS_REGISTRY) as any[];

  const filteredItems = allItems.filter(item => {
    if (selectedSlot !== 'all') {
      if (selectedSlot === 'rings') {
        if (item.slot !== 'ring1' && item.slot !== 'ring2' && item.slot !== 'ring') return false;
      } else if (item.slot !== selectedSlot) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (item.name && item.name.toLowerCase().includes(q)) ||
                        (item.nameDe && item.nameDe.toLowerCase().includes(q));
      const matchDesc = item.description && item.description.toLowerCase().includes(q);
      return matchName || matchDesc;
    }
    return true;
  });

  const handleAddBackpack = (presetKey: string) => {
    CombatState.addPCItemFromCompendium(presetKey, false);
  };

  const handleAddAndEquip = (presetKey: string) => {
    CombatState.addPCItemFromCompendium(presetKey, true);
    onClose();
  };

  const filterChips = [
    { key: 'all', label: 'All Slots' },
    { key: 'head', label: '👑 Head' },
    { key: 'face', label: '👓 Face' },
    { key: 'neck', label: '📿 Neck' },
    { key: 'shoulders', label: '🧥 Shoulders' },
    { key: 'torso', label: '🥋 Torso' },
    { key: 'body', label: '👘 Body' },
    { key: 'wrists', label: '🦾 Wrists' },
    { key: 'hands', label: '🧤 Hands' },
    { key: 'waist', label: '🎗️ Waist' },
    { key: 'feet', label: '🥾 Feet' },
    { key: 'rings', label: '💍 Rings' },
    { key: 'slotless', label: '🎒 Slotless' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '12px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--pd, #fdf6e2)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '4px',
          padding: '16px',
          width: '720px',
          maxWidth: '96vw',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--pb)', paddingBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📖</span>
            <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '16px', fontWeight: 'bold', color: 'var(--red)' }}>
              Magic Items Compendium (D&D 3.5e RAW)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="xbtn"
            style={{ fontSize: '13px', padding: '2px 8px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Search & Stats bar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search magic items (name, description, effects)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cinput"
            style={{ flex: 1, padding: '4px 8px', fontSize: '11px', height: '26px', boxSizing: 'border-box' }}
          />
          <span style={{ fontSize: '10px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", whiteSpace: 'nowrap' }}>
            Showing <strong>{filteredItems.length}</strong> items
          </span>
        </div>

        {/* Slot Category Filter Chips */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', borderBottom: '1px solid rgba(200, 169, 110, 0.4)', paddingBottom: '6px' }}>
          {filterChips.map(chip => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setSelectedSlot(chip.key)}
              className="btn"
              style={{
                fontSize: '8.5px',
                padding: '2px 6px',
                fontFamily: "'IM Fell English SC', serif",
                background: selectedSlot === chip.key ? 'rgba(139, 26, 26, 0.12)' : 'transparent',
                borderColor: selectedSlot === chip.key ? 'var(--red)' : 'var(--pb)',
                color: selectedSlot === chip.key ? 'var(--red)' : 'var(--inkm)',
                fontWeight: selectedSlot === chip.key ? 'bold' : 'normal'
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', fontSize: '12px', fontStyle: 'italic', color: 'var(--inkl)' }}>
              No magic items found matching your criteria.
            </div>
          ) : (
            filteredItems.map(item => {
              const slotInfo = (ITEM_SLOTS as any)[item.slot] || { icon: '🎒', nameEn: item.slot };

              return (
                <div
                  key={item.key}
                  style={{
                    background: 'white',
                    border: '1px solid var(--pb)',
                    borderLeft: '4px solid var(--pb)',
                    borderRadius: '3px',
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px' }}>{slotInfo.icon}</span>
                      <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '12px', fontWeight: 'bold', color: 'var(--red)' }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '8px', background: 'rgba(0,0,0,0.05)', color: 'var(--inkm)', padding: '0 4px', borderRadius: '2px' }}>
                        {slotInfo.nameEn}
                      </span>
                      {item.priceGp && (
                        <span style={{ fontSize: '8.5px', color: '#b8860b', fontWeight: 'bold' }}>
                          {item.priceGp.toLocaleString()} GP
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleAddBackpack(item.key)}
                        className="btn"
                        style={{ fontSize: '8px', padding: '2px 8px', fontFamily: "'IM Fell English SC', serif" }}
                        title="Add item to character backpack"
                      >
                        + To Backpack
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddAndEquip(item.key)}
                        className="btn btn-p"
                        style={{ fontSize: '8px', padding: '2px 8px', fontFamily: "'IM Fell English SC', serif" }}
                        title="Add and immediately equip"
                      >
                        ⚡ Add & Equip
                      </button>
                    </div>
                  </div>

                  {/* Effects Pills */}
                  {(item.effects || []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {item.effects.map((eff: any, eIdx: number) => (
                        <span
                          key={eIdx}
                          style={{
                            fontSize: '8px',
                            background: 'rgba(200, 169, 110, 0.15)',
                            border: '0.5px solid var(--pb)',
                            borderRadius: '2px',
                            padding: '1px 5px',
                            color: 'var(--ink)',
                            fontWeight: 'bold'
                          }}
                        >
                          {eff.value >= 0 ? '+' : ''}{eff.value} {eff.target.toUpperCase()} ({eff.bonusType || 'enhancement'})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description & Aura */}
                  <div style={{ fontSize: '9px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", lineHeight: 1.3 }}>
                    {item.description}
                  </div>
                  {item.aura && (
                    <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>
                      Aura: {item.aura}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', borderTop: '0.5px solid var(--pb)', paddingTop: '6px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ fontSize: '10px', padding: '4px 24px', fontFamily: "'IM Fell English SC', serif" }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
