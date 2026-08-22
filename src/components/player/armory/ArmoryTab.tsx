import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { ITEM_SLOTS, MAGIC_ITEMS_REGISTRY, CONSOLIDATED_COMPENDIUM } from '@core/data/magicItems-data.js';
// @ts-ignore
import { calculateItemSetBonuses, getItemStackingBreakdown } from '@core/rules.js';
import { BaseCard } from '../../shared/BaseCard';
import { BodySlotCard, formatEffectDisplay } from './BodySlotCard';
import { EmptySlotCard } from './EmptySlotCard';
import { SlotEquipModal } from './SlotEquipModal';
import { ItemEditorModal } from './ItemEditorModal';

interface ArmoryTabProps {
  pc: any;
}

const BODY_SLOTS_ORDER = [
  'head', 'face', 'neck',
  'shoulders', 'torso', 'body',
  'wrists', 'hands', 'waist',
  'feet', 'ring1', 'ring2'
];

export const ArmoryTab: React.FC<ArmoryTabProps> = ({ pc }) => {
  const [rightPanelMode, setRightPanelMode] = useState<'backpack' | 'compendium'>('backpack');
  const [search, setSearch] = useState('');
  const [slotFilter, setSlotFilter] = useState('all');
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});
  const [activeEquipSlot, setActiveEquipSlot] = useState<string | null>(null);
  const [editingItemData, setEditingItemData] = useState<{ item?: any; itemIdx?: number; defaultSlot?: string } | null>(null);

  const items = Array.isArray(pc.items) ? pc.items : [];

  // Map equipped items to slot
  const equippedMap: Record<string, { item: any; idx: number }> = {};
  const slotlessEquipped: Array<{ item: any; idx: number }> = [];

  items.forEach((item: any, idx: number) => {
    if (item && item.isEquipped) {
      if (item.slot && item.slot !== 'slotless') {
        equippedMap[item.slot] = { item, idx };
      } else {
        slotlessEquipped.push({ item, idx });
      }
    }
  });

  // Backpack entries
  const backpackEntries = items
    .map((item: any, idx: number) => ({ item, idx }))
    .filter(({ item }) => !item.isEquipped);

  const filteredBackpack = backpackEntries.filter(({ item }) => {
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

  // Consolidated Compendium entries
  const filteredCompendium = CONSOLIDATED_COMPENDIUM.filter(entry => {
    if (slotFilter !== 'all') {
      if (slotFilter === 'rings') {
        if (entry.slot !== 'ring1' && entry.slot !== 'ring2' && entry.slot !== 'ring') return false;
      } else if (entry.slot !== slotFilter) {
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
  };

  const handleUnequipSlot = (idx: number) => {
    CombatState.unequipPCItem(idx);
  };

  const handleEmptySlotClick = (slotKey: string) => {
    setSlotFilter(slotKey === 'ring1' || slotKey === 'ring2' ? 'rings' : slotKey);
    setRightPanelMode('backpack');
  };

  const filterChips = [
    { key: 'all', label: 'All' },
    { key: 'head', label: '👑 Head' },
    { key: 'face', label: '👓 Face' },
    { key: 'neck', label: '📿 Neck' },
    { key: 'shoulders', label: '🧥 Shld' },
    { key: 'torso', label: '🥋 Torso' },
    { key: 'body', label: '👘 Body' },
    { key: 'wrists', label: '🦾 Wrists' },
    { key: 'hands', label: '🧤 Hands' },
    { key: 'waist', label: '🎗️ Waist' },
    { key: 'feet', label: '🥾 Feet' },
    { key: 'rings', label: '💍 Rings' },
    { key: 'slotless', label: '🎒 Slotless' }
  ];

  const setBonusData = calculateItemSetBonuses(pc);
  const stackingBreakdown = getItemStackingBreakdown(pc);

  return (
    <div className="armory-layout-grid" style={{ marginBottom: '16px' }}>
      
      {/* === LEFT COLUMN: Paperdoll / Equipped Slots === */}
      <BaseCard
        title={`🧍 Equipped Magic Items (${Object.keys(equippedMap).length} / 12)`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '4px' }}>
          
          {/* 3-Column Compact Grid */}
          <div className="paperdoll-grid">
            {BODY_SLOTS_ORDER.map(slotKey => {
              const slotDef = (ITEM_SLOTS as any)[slotKey] || { nameEn: slotKey, icon: '🎒' };
              const equippedEntry = equippedMap[slotKey];

              if (equippedEntry) {
                return (
                  <BodySlotCard
                    key={slotKey}
                    slotKey={slotKey}
                    slotDef={slotDef}
                    item={equippedEntry.item}
                    itemIdx={equippedEntry.idx}
                    stackingBreakdown={stackingBreakdown}
                    onUnequip={() => handleUnequipSlot(equippedEntry.idx)}
                    onEdit={() => setEditingItemData({ item: equippedEntry.item, itemIdx: equippedEntry.idx })}
                  />
                );
              }

              return (
                <EmptySlotCard
                  key={slotKey}
                  slotKey={slotKey}
                  slotDef={slotDef}
                  onClick={() => handleEmptySlotClick(slotKey)}
                />
              );
            })}
          </div>

          {/* Active Item Sets */}
          {setBonusData.activeSets.length > 0 && (
            <div style={{ marginTop: '4px', borderTop: '0.5px solid var(--pb)', paddingTop: '6px' }}>
              <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '10.5px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '4px' }}>
                ✨ Active Item Sets ({setBonusData.activeSets.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {setBonusData.activeSets.map((activeSet: any) => (
                  <div
                    key={activeSet.set.id}
                    style={{
                      background: 'rgba(200, 169, 110, 0.12)',
                      border: '1px solid var(--pb)',
                      borderLeft: '3px solid var(--red)',
                      borderRadius: '3px',
                      padding: '4px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
                        {activeSet.set.name}
                      </span>
                      <span style={{ fontSize: '8px', background: 'rgba(139, 26, 26, 0.15)', color: 'var(--red)', padding: '0 4px', borderRadius: '2px', fontWeight: 'bold' }}>
                        {activeSet.equippedCount} / {activeSet.totalPieces} Pieces
                      </span>
                    </div>
                    {activeSet.activeBonuses.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        {activeSet.activeBonuses.map((b: any, bIdx: number) => (
                          <div key={bIdx} style={{ fontSize: '8.5px', color: 'var(--ink)', fontFamily: "'Crimson Text', serif", fontWeight: 600 }}>
                            • {b.requiredPieces} Pieces: {b.description}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '8px', color: 'var(--inkm)', fontStyle: 'italic', fontFamily: "'Crimson Text', serif" }}>
                        Equip 1 more piece to unlock the 2-piece set bonus.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slotless & Wondrous Equipped Items */}
          {slotlessEquipped.length > 0 && (
            <div style={{ marginTop: '4px', borderTop: '0.5px solid var(--pb)', paddingTop: '6px' }}>
              <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '10.5px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '4px' }}>
                🎒 Slotless & Wondrous Items ({slotlessEquipped.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {slotlessEquipped.map(({ item, idx }) => (
                  <div
                    key={item.id || idx}
                    style={{
                      background: 'rgba(253, 246, 226, 0.65)',
                      border: '1px solid var(--pb)',
                      borderLeft: '3px solid var(--red)',
                      borderRadius: '3px',
                      padding: '4px 8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
                        {item.name}
                      </span>
                      {item.description && (
                        <span style={{ fontSize: '8.5px', color: 'var(--inkm)', marginLeft: '6px', fontFamily: "'Crimson Text', serif" }}>
                          {item.description.length > 45 ? item.description.substring(0, 45) + '...' : item.description}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnequipSlot(idx)}
                      className="xbtn"
                      style={{ fontSize: '8px', padding: '1px 5px' }}
                      title="Unequip"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </BaseCard>

      {/* === RIGHT COLUMN: Armory Stash & Compendium === */}
      <BaseCard
        title="🎒 Armory Stash & Compendium"
        headerRight={
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setRightPanelMode('backpack')}
              className="btn"
              style={{
                fontSize: '9px',
                padding: '2px 8px',
                fontFamily: "'IM Fell English SC', serif",
                background: rightPanelMode === 'backpack' ? 'var(--pb, #c8a96e)' : 'rgba(253, 246, 226, 0.6)',
                borderColor: rightPanelMode === 'backpack' ? 'var(--red, #8b1a1a)' : 'var(--pb, #c8a96e)',
                color: rightPanelMode === 'backpack' ? 'var(--red, #8b1a1a)' : 'var(--ink, #1a0f00)',
                fontWeight: rightPanelMode === 'backpack' ? 'bold' : 'normal',
                boxShadow: rightPanelMode === 'backpack' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              🎒 Backpack ({backpackEntries.length})
            </button>
            <button
              type="button"
              onClick={() => setRightPanelMode('compendium')}
              className="btn"
              style={{
                fontSize: '9px',
                padding: '2px 8px',
                fontFamily: "'IM Fell English SC', serif",
                background: rightPanelMode === 'compendium' ? 'var(--pb, #c8a96e)' : 'rgba(253, 246, 226, 0.6)',
                borderColor: rightPanelMode === 'compendium' ? 'var(--red, #8b1a1a)' : 'var(--pb, #c8a96e)',
                color: rightPanelMode === 'compendium' ? 'var(--red, #8b1a1a)' : 'var(--ink, #1a0f00)',
                fontWeight: rightPanelMode === 'compendium' ? 'bold' : 'normal',
                boxShadow: rightPanelMode === 'compendium' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              📖 Compendium
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '4px' }}>
          
          {/* Controls Bar: Search & New Item Button */}
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={rightPanelMode === 'backpack' ? 'Search backpack items...' : 'Search compendium items...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="cinput"
              style={{ flex: 1, padding: '3px 7px', fontSize: '10.5px', height: '24px', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setEditingItemData({ defaultSlot: slotFilter !== 'all' && slotFilter !== 'rings' ? slotFilter : 'slotless' })}
              className="btn btn-p"
              style={{ fontSize: '8.5px', padding: '2px 7px', fontFamily: "'IM Fell English SC', serif", whiteSpace: 'nowrap' }}
            >
              ➕ Custom Item
            </button>
          </div>

          {/* Compact Slot Filter Chips */}
          <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', borderBottom: '0.5px solid rgba(200, 169, 110, 0.4)', paddingBottom: '4px' }}>
            {filterChips.map(chip => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setSlotFilter(chip.key)}
                className="btn"
                style={{
                  fontSize: '8px',
                  padding: '1px 5px',
                  fontFamily: "'IM Fell English SC', serif",
                  background: slotFilter === chip.key ? 'rgba(139, 26, 26, 0.12)' : 'transparent',
                  borderColor: slotFilter === chip.key ? 'var(--red)' : 'var(--pb)',
                  color: slotFilter === chip.key ? 'var(--red)' : 'var(--inkm)',
                  fontWeight: slotFilter === chip.key ? 'bold' : 'normal'
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* List Content Area */}
          <div
            style={{
              maxHeight: '390px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              paddingRight: '3px',
              paddingBottom: '6px'
            }}
          >
            {rightPanelMode === 'backpack' ? (
              /* === BACKPACK VIEW === */
              filteredBackpack.length === 0 ? (
                <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--inkm)', fontSize: '10.5px', fontStyle: 'italic', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span>
                    {slotFilter !== 'all'
                      ? `No ${slotFilter} items in your backpack.`
                      : 'Your backpack is currently empty.'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRightPanelMode('compendium')}
                    className="btn btn-p"
                    style={{ fontSize: '9px', padding: '3px 10px', fontFamily: "'IM Fell English SC', serif" }}
                  >
                    📖 Browse {slotFilter !== 'all' ? `${slotFilter} in ` : ''}Compendium
                  </button>
                </div>
              ) : (
                filteredBackpack.map(({ item, idx }) => {
                  const slotDef = (ITEM_SLOTS as any)[item.slot] || { icon: '🎒', nameEn: item.slot || 'Slotless' };
                  const rawEffects = Array.isArray(item.effects) ? item.effects : [];
                  const activeEffects = rawEffects.filter((e: any) => (parseInt(e.value) || 0) !== 0);

                  return (
                    <div
                      key={item.id || idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--pb)',
                        borderLeft: '3px solid var(--pb)',
                        borderRadius: '3px',
                        padding: '5px 7px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontSize: '12px' }}>{slotDef.icon}</span>
                          <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11.5px', fontWeight: 'bold', color: 'var(--ink)' }}>
                            {item.name || 'Item'}
                          </span>
                          <span style={{ fontSize: '7.5px', color: 'var(--inkm)', background: 'rgba(0,0,0,0.04)', padding: '0 3px', borderRadius: '2px' }}>
                            {slotDef.nameEn}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={() => CombatState.equipPCItem(idx, item.slot)}
                            className="btn btn-p"
                            style={{ fontSize: '8px', padding: '1px 6px', fontFamily: "'IM Fell English SC', serif" }}
                          >
                            ⚡ Equip
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingItemData({ item, itemIdx: idx })}
                            className="btn"
                            style={{ fontSize: '8px', padding: '1px 4px' }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => CombatState.deletePCItem(idx)}
                            className="xbtn"
                            style={{ fontSize: '8px', padding: '1px 4px' }}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {activeEffects.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                          {activeEffects.map((eff: any, eIdx: number) => (
                            <span
                              key={eIdx}
                              style={{
                                fontSize: '8.5px',
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
                    </div>
                  );
                })
              )
            ) : (
              /* === COMPENDIUM VIEW === */
              filteredCompendium.length === 0 ? (
                <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--inkl)', fontSize: '10.5px', fontStyle: 'italic' }}>
                  No items found matching criteria.
                </div>
              ) : (
                filteredCompendium.map(entry => {
                  const activeKey = getEffectivePresetKey(entry);
                  const activePreset = MAGIC_ITEMS_REGISTRY[activeKey] || {};
                  const slotInfo = (ITEM_SLOTS as any)[entry.slot] || { icon: '🎒', nameEn: entry.slot };
                  const rawEffects = Array.isArray(activePreset.effects) ? activePreset.effects : [];
                  const activeEffects = rawEffects.filter((e: any) => (parseInt(e.value) || 0) !== 0);

                  return (
                    <div
                      key={entry.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--pb)',
                        borderLeft: '3px solid var(--pb)',
                        borderRadius: '3px',
                        padding: '5px 7px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px' }}>{slotInfo.icon}</span>
                          <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11.5px', fontWeight: 'bold', color: 'var(--red)' }}>
                            {activePreset.name || entry.baseName}
                          </span>
                          <span style={{ fontSize: '7.5px', color: 'var(--inkm)', background: 'rgba(0,0,0,0.04)', padding: '0 3px', borderRadius: '2px' }}>
                            {slotInfo.nameEn}
                          </span>
                        </div>

                        {/* Tier selection & Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          {entry.variants.length > 1 && (
                            <div style={{ display: 'flex', gap: '2px', marginRight: '3px' }}>
                              {entry.variants.map((v: any) => (
                                <button
                                  key={v.key}
                                  type="button"
                                  onClick={() => handleSelectTier(entry.id, v.key)}
                                  className="btn"
                                  style={{
                                    fontSize: '7.5px',
                                    padding: '0 4px',
                                    height: '17px',
                                    lineHeight: '1',
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
                            style={{ fontSize: '8px', padding: '1px 5px', fontFamily: "'IM Fell English SC', serif" }}
                            title="Add to Backpack"
                          >
                            + Stash
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddAndEquip(activeKey)}
                            className="btn btn-p"
                            style={{ fontSize: '8px', padding: '1px 5px', fontFamily: "'IM Fell English SC', serif" }}
                            title="Add and immediately equip"
                          >
                            ⚡ Equip
                          </button>
                        </div>
                      </div>

                      {activeEffects.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                          {activeEffects.map((eff: any, eIdx: number) => (
                            <span
                              key={eIdx}
                              style={{
                                fontSize: '8.5px',
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

                      <div style={{ fontSize: '8.5px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", lineHeight: 1.25 }}>
                        {activePreset.description || entry.description}
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>

        </div>
      </BaseCard>

      {/* === MODALS (IF OPENED) === */}
      {activeEquipSlot && (
        <SlotEquipModal
          slotKey={activeEquipSlot}
          pc={pc}
          onClose={() => setActiveEquipSlot(null)}
          onOpenCompendium={(slot) => {
            setSlotFilter(slot || 'all');
            setRightPanelMode('compendium');
          }}
          onOpenCustomEditor={(slot) => setEditingItemData({ defaultSlot: slot || 'slotless' })}
        />
      )}

      {editingItemData && (
        <ItemEditorModal
          item={editingItemData.item}
          itemIdx={editingItemData.itemIdx}
          defaultSlot={editingItemData.defaultSlot}
          onClose={() => setEditingItemData(null)}
        />
      )}

    </div>
  );
};
