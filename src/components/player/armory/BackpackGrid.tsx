import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { ITEM_SLOTS } from '@core/data/magicItems-data.js';
import { formatEffectDisplay } from './BodySlotCard';

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

  // Backpack items (unequipped items)
  const backpackEntries = items
    .map((item: any, idx: number) => ({ item, idx }))
    .filter(({ item }: { item: any }) => !item.isEquipped);

  const filteredEntries = backpackEntries.filter(({ item }: { item: any }) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '5px' }}>
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
            style={{ width: '95px', fontSize: '9.5px', height: '24px', boxSizing: 'border-box' }}
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
        <div style={{ display: 'flex', gap: '3px' }}>
          <button
            type="button"
            onClick={() => onOpenCustomEditor()}
            className="btn"
            style={{ fontSize: '8.5px', padding: '2px 5px', fontFamily: "'IM Fell English SC', serif" }}
            title="Create a new custom magic item"
          >
            ➕ New Item
          </button>
          <button
            type="button"
            onClick={onOpenCompendium}
            className="btn btn-p"
            style={{ fontSize: '8.5px', padding: '2px 7px', fontFamily: "'IM Fell English SC', serif" }}
            title="Open Magic Items Compendium"
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
          gap: '4px',
          maxHeight: '520px',
          overflowY: 'auto',
          paddingRight: '2px'
        }}
      >
        {filteredEntries.length === 0 ? (
          <div
            style={{
              padding: '24px 10px',
              textAlign: 'center',
              border: '1px dashed var(--pb)',
              borderRadius: '4px',
              background: 'rgba(253, 246, 226, 0.4)',
              color: 'var(--inkl)',
              fontSize: '10.5px',
              fontStyle: 'italic'
            }}
          >
            Backpack is empty. Click <strong>📖 Compendium</strong> or <strong>➕ New Item</strong> to add equipment!
          </div>
        ) : (
          filteredEntries.map(({ item, idx }: { item: any; idx: number }) => {
            const slotDef = (ITEM_SLOTS as any)[item.slot] || { icon: '🎒', nameEn: item.slot || 'Slotless' };
            const rawEffects = Array.isArray(item.effects) ? item.effects : [];
            const activeEffects = rawEffects.filter((e: any) => (parseInt(e.value) || 0) !== 0);

            return (
              <div
                key={item.id || idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--pb)',
                  borderLeft: '3.5px solid var(--pb)',
                  borderRadius: '3px',
                  padding: '5px 7px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '12px' }}>{slotDef.icon}</span>
                    <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11.5px', fontWeight: 'bold', color: 'var(--ink)' }}>
                      {item.name || 'Item'}
                    </span>
                    <span style={{ fontSize: '7.5px', background: 'rgba(0,0,0,0.05)', color: 'var(--inkm)', padding: '0 3px', borderRadius: '2px' }}>
                      {slotDef.nameEn}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <button
                      type="button"
                      onClick={() => handleEquip(idx, item.slot)}
                      className="btn btn-p"
                      style={{ fontSize: '8px', padding: '2px 5px', fontFamily: "'IM Fell English SC', serif" }}
                    >
                      ⚡ Equip
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenCustomEditor(item, idx)}
                      className="btn"
                      style={{ fontSize: '8px', padding: '2px 4px' }}
                      title="Edit Item"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="xbtn"
                      style={{ fontSize: '8px', padding: '2px 4px' }}
                      title="Delete Item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Clean Effect Pills */}
                {activeEffects.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {activeEffects.map((eff: any, eIdx: number) => (
                      <span
                        key={eIdx}
                        style={{
                          fontSize: '8px',
                          background: 'rgba(200, 169, 110, 0.18)',
                          border: '0.5px solid var(--pb)',
                          borderRadius: '2px',
                          padding: '0 4px',
                          color: 'var(--ink)',
                          fontWeight: 600,
                          fontFamily: "'Crimson Text', serif"
                        }}
                      >
                        {formatEffectDisplay(eff)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description snippet */}
                {item.description && (
                  <div style={{ fontSize: '8.5px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", lineHeight: 1.2 }}>
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
