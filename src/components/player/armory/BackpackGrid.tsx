import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { ITEM_SLOTS } from '@core/data/magicItems-data.js';

interface BackpackGridProps {
  pc: any;
  onOpenCompendium: () => void;
  onOpenCustomEditor: (item?: any, itemIdx?: number) => void;
}

export const BackpackGrid: React.FC<BackpackGridProps> = ({
  pc,
  onOpenCompendium,
  onOpenCustomEditor
}) => {
  const [search, setSearch] = useState('');
  const [slotFilter, setSlotFilter] = useState('all');

  const items = Array.isArray(pc.items) ? pc.items : [];

  // Backpack items (unequipped items or slotless)
  const backpackEntries = items
    .map((item: any, idx: number) => ({ item, idx }))
    .filter(({ item }) => !item.isEquipped);

  const filteredEntries = backpackEntries.filter(({ item }) => {
    if (slotFilter !== 'all') {
      if (slotFilter === 'rings') {
        if (item.slot !== 'ring' && item.slot !== 'ring1' && item.slot !== 'ring2') return false;
      } else if (item.slot !== slotFilter) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name && item.name.toLowerCase().includes(q);
      const matchDesc = item.description && item.description.toLowerCase().includes(q);
      return matchName || matchDesc;
    }
    return true;
  });

  const handleEquip = (idx: number, slot: string) => {
    CombatState.equipPCItem(idx, slot);
  };

  const handleDelete = (idx: number) => {
    CombatState.deletePCItem(idx);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
        <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
          <input
            type="text"
            placeholder="Search backpack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cinput"
            style={{ flex: 1, padding: '3px 6px', fontSize: '10.5px', height: '24px', boxSizing: 'border-box' }}
          />
          <select
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
            className="cinput"
            style={{ width: '100px', fontSize: '10px', height: '24px', boxSizing: 'border-box' }}
          >
            <option value="all">All Slots</option>
            <option value="head">👑 Head</option>
            <option value="face">👓 Face</option>
            <option value="neck">📿 Neck</option>
            <option value="shoulders">🧥 Shoulders</option>
            <option value="torso">🥋 Torso</option>
            <option value="body">👘 Body</option>
            <option value="wrists">🦾 Wrists</option>
            <option value="hands">🧤 Hands</option>
            <option value="waist">🎗️ Waist</option>
            <option value="feet">🥾 Feet</option>
            <option value="rings">💍 Rings</option>
            <option value="slotless">🎒 Slotless</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => onOpenCustomEditor()}
            className="btn"
            style={{ fontSize: '9px', padding: '3px 6px', fontFamily: "'IM Fell English SC', serif" }}
            title="Create a new custom magic item"
          >
            ➕ New Item
          </button>
          <button
            type="button"
            onClick={onOpenCompendium}
            className="btn btn-p"
            style={{ fontSize: '9px', padding: '3px 8px', fontFamily: "'IM Fell English SC', serif" }}
            title="Open D&D 3.5e Magic Items Compendium"
          >
            📖 Compendium
          </button>
        </div>
      </div>

      {/* Backpack Item List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxHeight: '620px',
          overflowY: 'auto',
          paddingRight: '2px'
        }}
      >
        {filteredEntries.length === 0 ? (
          <div
            style={{
              padding: '30px 10px',
              textAlign: 'center',
              border: '1.5px dashed var(--pb)',
              borderRadius: '4px',
              background: 'rgba(0,0,0,0.01)',
              color: 'var(--inkl)',
              fontSize: '11px',
              fontStyle: 'italic'
            }}
          >
            Your backpack is empty. Click <strong>📖 Compendium</strong> or <strong>➕ New Item</strong> to add equipment!
          </div>
        ) : (
          filteredEntries.map(({ item, idx }) => {
            const slotDef = (ITEM_SLOTS as any)[item.slot] || { icon: '🎒', nameEn: item.slot || 'Slotless' };
            const effects = Array.isArray(item.effects) ? item.effects : [];

            return (
              <div
                key={item.id || idx}
                style={{
                  background: 'white',
                  border: '1px solid var(--pb)',
                  borderLeft: '3.5px solid var(--pb)',
                  borderRadius: '3px',
                  padding: '6px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px' }}>{slotDef.icon}</span>
                    <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11.5px', fontWeight: 'bold', color: 'var(--ink)' }}>
                      {item.name || 'Gegenstand'}
                    </span>
                    <span style={{ fontSize: '7.5px', background: 'rgba(0,0,0,0.05)', color: 'var(--inkm)', padding: '0 4px', borderRadius: '2px' }}>
                      {slotDef.nameEn}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <button
                      type="button"
                      onClick={() => handleEquip(idx, item.slot)}
                      className="btn btn-p"
                      style={{ fontSize: '8px', padding: '2px 6px', fontFamily: "'IM Fell English SC', serif" }}
                    >
                      ⚡ Equip
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenCustomEditor(item, idx)}
                      className="btn"
                      style={{ fontSize: '8px', padding: '2px 5px' }}
                      title="Edit Item"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="xbtn"
                      style={{ fontSize: '8px', padding: '2px 5px' }}
                      title="Delete Item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Effects Pills */}
                {effects.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {effects.map((eff: any, eIdx: number) => {
                      const val = eff.value >= 0 ? `+${eff.value}` : `${eff.value}`;
                      const target = (eff.target || 'str').toUpperCase();
                      return (
                        <span
                          key={eIdx}
                          style={{
                            fontSize: '8px',
                            background: 'rgba(200, 169, 110, 0.15)',
                            border: '0.5px solid var(--pb)',
                            borderRadius: '2px',
                            padding: '0 4px',
                            color: 'var(--ink)',
                            fontWeight: 600,
                            fontFamily: "'Crimson Text', serif"
                          }}
                        >
                          {val} {target} ({eff.bonusType || 'enhancement'})
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Description snippet */}
                {item.description && (
                  <div style={{ fontSize: '8.5px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", lineHeight: 1.25 }}>
                    {item.description}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
