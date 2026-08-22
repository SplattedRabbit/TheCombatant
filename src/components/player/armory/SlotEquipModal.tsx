import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { MAGIC_ITEMS_REGISTRY, ITEM_SLOTS } from '@core/data/magicItems-data.js';

interface SlotEquipModalProps {
  slotKey: string;
  pc: any;
  onClose: () => void;
  onOpenCompendium: (defaultSlot?: string) => void;
  onOpenCustomEditor: (defaultSlot?: string) => void;
}

export const SlotEquipModal: React.FC<SlotEquipModalProps> = ({
  slotKey,
  pc,
  onClose,
  onOpenCompendium,
  onOpenCustomEditor
}) => {
  const [search, setSearch] = useState('');

  const slotDef = (ITEM_SLOTS as any)[slotKey] || { nameEn: slotKey, icon: '🎒' };
  const items = Array.isArray(pc.items) ? pc.items : [];

  // 1. Matching backpack items
  const backpackCandidates: Array<{ item: any; idx: number }> = [];
  items.forEach((item: any, idx: number) => {
    if (!item.isEquipped) {
      const isDirectMatch = item.slot === slotKey;
      const isRingMatch = (slotKey === 'ring1' || slotKey === 'ring2') && (item.slot === 'ring' || item.slot === 'ring1' || item.slot === 'ring2');
      const isSlotlessMatch = item.slot === 'slotless' && slotKey === 'slotless';
      if (isDirectMatch || isRingMatch || isSlotlessMatch) {
        backpackCandidates.push({ item, idx });
      }
    }
  });

  // 2. Matching compendium presets for this slot
  const compendiumPresets = Object.values(MAGIC_ITEMS_REGISTRY).filter((preset: any) => {
    if (slotKey === 'ring1' || slotKey === 'ring2') {
      return preset.slot === 'ring1' || preset.slot === 'ring2' || preset.slot === 'ring';
    }
    return preset.slot === slotKey;
  });

  const handleEquipBackpackItem = (idx: number) => {
    CombatState.equipPCItem(idx, slotKey);
    onClose();
  };

  const handleAddAndEquipPreset = (presetKey: string) => {
    CombatState.addPCItemFromCompendium(presetKey, true);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '10px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--pd, #fdf6e2)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '4px',
          padding: '14px',
          width: '540px',
          maxWidth: '95vw',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--pb)', paddingBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>{slotDef.icon}</span>
            <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '14px', fontWeight: 'bold', color: 'var(--red)' }}>
              Equip Slot: {slotDef.nameEn}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="xbtn"
            style={{ fontSize: '12px', padding: '2px 6px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder={`Search ${slotDef.nameEn} items...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="cinput"
          style={{ width: '100%', padding: '4px 8px', fontSize: '11px', height: '26px', boxSizing: 'border-box' }}
        />

        {/* Scroll Content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '2px' }}>
          
          {/* Section 1: Backpack Items */}
          <div>
            <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11.5px', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '4px' }}>
              🎒 Available in Backpack ({backpackCandidates.length})
            </div>
            {backpackCandidates.length === 0 ? (
              <div style={{ fontSize: '10px', color: 'var(--inkl)', fontStyle: 'italic', padding: '6px' }}>
                No matching unequipped items in your backpack.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {backpackCandidates
                  .filter(({ item }) => !search.trim() || item.name.toLowerCase().includes(search.toLowerCase()))
                  .map(({ item, idx }) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'white',
                        border: '1px solid var(--pb)',
                        borderRadius: '3px',
                        padding: '6px 8px'
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif" }}>
                          {(item.effects || []).map((e: any) => `${e.value >= 0 ? '+' : ''}${e.value} ${e.target.toUpperCase()} (${e.bonusType || 'enhancement'})`).join(', ')}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEquipBackpackItem(idx)}
                        className="btn btn-p"
                        style={{ fontSize: '9px', padding: '3px 10px', fontFamily: "'IM Fell English SC', serif" }}
                      >
                        ⚡ Equip Now
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Section 2: Compendium Presets */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11.5px', fontWeight: 'bold', color: 'var(--ink)' }}>
                📖 Standard Magic Items ({compendiumPresets.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCompendium(slotKey);
                }}
                className="btn"
                style={{ fontSize: '8.5px', padding: '1px 6px' }}
              >
                Full Compendium ➔
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {compendiumPresets
                .filter((p: any) => !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()))
                .map((preset: any) => (
                  <div
                    key={preset.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(200, 169, 110, 0.06)',
                      border: '1px solid var(--pb)',
                      borderRadius: '3px',
                      padding: '6px 8px'
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--ink)' }}>
                          {preset.name}
                        </span>
                        {preset.priceGp && (
                          <span style={{ fontSize: '8px', color: '#b8860b', fontWeight: 'bold' }}>
                            {preset.priceGp.toLocaleString()} GP
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '8.5px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", lineHeight: 1.2 }}>
                        {preset.description}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddAndEquipPreset(preset.key)}
                      className="btn btn-p"
                      style={{ fontSize: '8.5px', padding: '3px 8px', fontFamily: "'IM Fell English SC', serif", whiteSpace: 'nowrap' }}
                    >
                      + Add & Equip
                    </button>
                  </div>
                ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid var(--pb)', paddingTop: '6px' }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCustomEditor(slotKey);
            }}
            className="btn"
            style={{ fontSize: '9.5px', padding: '3px 10px', fontFamily: "'IM Fell English SC', serif" }}
          >
            + Create Custom Item
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ fontSize: '9.5px', padding: '3px 14px', fontFamily: "'IM Fell English SC', serif" }}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
