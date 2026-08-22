import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { ITEM_SLOTS, MAGIC_ITEMS_REGISTRY, CONSOLIDATED_COMPENDIUM } from '@core/data/magicItems-data.js';
import { formatEffectDisplay } from './BodySlotCard';

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
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});

  const filteredConsolidated = CONSOLIDATED_COMPENDIUM.filter(entry => {
    if (selectedSlot !== 'all') {
      if (selectedSlot === 'rings') {
        if (entry.slot !== 'ring1' && entry.slot !== 'ring2' && entry.slot !== 'ring') return false;
      } else if (entry.slot !== selectedSlot) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = entry.baseName.toLowerCase().includes(q);
      const matchDesc = entry.description && entry.description.toLowerCase().includes(q);
      return matchName || matchDesc;
    }
    return true;
  });

  const getEffectivePresetKey = (entry: any) => {
    const selectedKey = selectedTiers[entry.id];
    if (selectedKey && entry.variants.some((v: any) => v.key === selectedKey)) {
      return selectedKey;
    }
    return entry.variants[0]?.key || entry.id;
  };

  const handleSelectTier = (entryId: string, presetKey: string) => {
    setSelectedTiers(prev => ({ ...prev, [entryId]: presetKey }));
  };

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
        padding: '10px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--pd, #fdf6e2)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '4px',
          padding: '12px 14px',
          width: '640px',
          maxWidth: '94vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 10px 32px rgba(0,0,0,0.4)',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--pb)', paddingBottom: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>📖</span>
            <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '15px', fontWeight: 'bold', color: 'var(--red)' }}>
              Magic Items Compendium
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
          placeholder="Search items by name or effects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="cinput"
          style={{ width: '100%', padding: '3px 8px', fontSize: '11px', height: '24px', boxSizing: 'border-box' }}
        />

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', borderBottom: '1px solid rgba(200, 169, 110, 0.4)', paddingBottom: '5px' }}>
          {filterChips.map(chip => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setSelectedSlot(chip.key)}
              className="btn"
              style={{
                fontSize: '8.5px',
                padding: '2px 5px',
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

        {/* Consolidated Items List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px', paddingRight: '2px' }}>
          {filteredConsolidated.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', fontSize: '11px', fontStyle: 'italic', color: 'var(--inkl)' }}>
              No magic items found.
            </div>
          ) : (
            filteredConsolidated.map(entry => {
              const activeKey = getEffectivePresetKey(entry);
              const activePreset = MAGIC_ITEMS_REGISTRY[activeKey] || {};
              const slotInfo = (ITEM_SLOTS as any)[entry.slot] || { icon: '🎒', nameEn: entry.slot };
              const effects = Array.isArray(activePreset.effects) ? activePreset.effects : [];

              return (
                <div
                  key={entry.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--pb)',
                    borderLeft: '3px solid var(--pb)',
                    borderRadius: '3px',
                    padding: '6px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px' }}>{slotInfo.icon}</span>
                      <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11.5px', fontWeight: 'bold', color: 'var(--red)' }}>
                        {activePreset.name || entry.baseName}
                      </span>
                      <span style={{ fontSize: '7.5px', background: 'rgba(0,0,0,0.05)', color: 'var(--inkm)', padding: '0 3px', borderRadius: '2px' }}>
                        {slotInfo.nameEn}
                      </span>
                    </div>

                    {/* Tier selector & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {entry.variants.length > 1 && (
                        <div style={{ display: 'flex', gap: '2px', marginRight: '4px' }}>
                          {entry.variants.map((v: any) => (
                            <button
                              key={v.key}
                              type="button"
                              onClick={() => handleSelectTier(entry.id, v.key)}
                              className="btn"
                              style={{
                                fontSize: '7.5px',
                                padding: '1px 4px',
                                background: activeKey === v.key ? 'var(--red)' : 'white',
                                color: activeKey === v.key ? 'white' : 'var(--ink)',
                                borderColor: activeKey === v.key ? 'var(--red)' : 'var(--pb)',
                                fontWeight: activeKey === v.key ? 'bold' : 'normal'
                              }}
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleAddBackpack(activeKey)}
                        className="btn"
                        style={{ fontSize: '8px', padding: '2px 6px', fontFamily: "'IM Fell English SC', serif" }}
                        title="Add to Backpack"
                      >
                        + Backpack
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddAndEquip(activeKey)}
                        className="btn btn-p"
                        style={{ fontSize: '8px', padding: '2px 6px', fontFamily: "'IM Fell English SC', serif" }}
                        title="Add & Equip"
                      >
                        ⚡ Equip
                      </button>
                    </div>
                  </div>

                  {/* Clean Effect Pills */}
                  {effects.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {effects.map((eff: any, eIdx: number) => (
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

                  {/* Description */}
                  <div style={{ fontSize: '8.5px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", lineHeight: 1.25 }}>
                    {activePreset.description || entry.description}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', borderTop: '0.5px solid var(--pb)', paddingTop: '4px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ fontSize: '9.5px', padding: '3px 18px', fontFamily: "'IM Fell English SC', serif" }}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
