import React, { useState } from 'react';
import { DialogOverlay } from '../../dialogs/modals/DialogOverlay.tsx';
import { CombatState } from '@core/state.js';
import { MAGIC_ITEMS_REGISTRY, ITEM_SLOTS, CONSOLIDATED_COMPENDIUM } from '@core/data/magicItems-data.js';
import { formatEffectDisplay } from './BodySlotCard';
import { isConsumableItem } from './ArmoryTab';

interface SlotEquipModalProps {
  slotKey: string;
  pc: any;
  onClose: () => void;
  onOpenCompendium: (defaultSlot?: string) => void;
  onOpenCustomEditor: (defaultSlot?: string) => void;
  onFeedback?: (msg: string) => void;
}

export const SlotEquipModal: React.FC<SlotEquipModalProps> = ({
  slotKey,
  pc,
  onClose,
  onOpenCompendium,
  onOpenCustomEditor,
  onFeedback
}) => {
  const [search, setSearch] = useState('');
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});

  const slotDef = (ITEM_SLOTS as any)[slotKey] || { nameEn: slotKey, icon: '🎒' };
  const items = Array.isArray(pc.items) ? pc.items : [];

  // 1. Matching backpack items
  const backpackCandidates: Array<{ item: any; idx: number }> = [];
  items.forEach((item: any, idx: number) => {
    if (!item.isEquipped) {
      const isDirectMatch = item.slot === slotKey && !isConsumableItem(item);
      const isRingMatch = (slotKey === 'ring1' || slotKey === 'ring2') && (item.slot === 'ring' || item.slot === 'ring1' || item.slot === 'ring2');
      const isSlotlessMatch = item.slot === 'slotless' && slotKey === 'slotless' && !isConsumableItem(item);
      if (isDirectMatch || isRingMatch || isSlotlessMatch) {
        backpackCandidates.push({ item, idx });
      }
    }
  });

  // 2. Matching consolidated compendium entries for this slot
  const slotConsolidated = CONSOLIDATED_COMPENDIUM.filter((entry: any) => {
    if (slotKey === 'ring1' || slotKey === 'ring2') {
      return entry.slot === 'ring1' || entry.slot === 'ring2' || entry.slot === 'ring';
    }
    return entry.slot === slotKey;
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

  const handleEquipBackpackItem = (idx: number) => {
    const item = pc.items && pc.items[idx];
    CombatState.equipPCItem(idx, slotKey);
    onClose();
    if (onFeedback && item) {
      onFeedback(`⚡ ${item.name} equipped to ${slotDef.nameEn}.`);
    }
  };

  const handleAddAndEquipPreset = (presetKey: string) => {
    CombatState.addPCItemFromCompendium(presetKey, true);
    onClose();
    if (onFeedback) {
      const preset = (MAGIC_ITEMS_REGISTRY as any)[presetKey];
      const name = preset?.nameEn || preset?.name || 'Item';
      onFeedback(`⚡ ${name} equipped to ${slotDef.nameEn}.`);
    }
  };

  return (
    <DialogOverlay onClose={onClose} width={540} textAlign="left" padding="16px 20px">
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--pb)', paddingBottom: '7px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{slotDef.icon}</span>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '15px', fontWeight: 'bold', color: 'var(--red)', letterSpacing: '0.02em' }}>
              Equip Slot: {slotDef.nameEn}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="xbtn"
            style={{
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '3px',
              border: '1px solid var(--pb)',
              background: 'rgba(200, 169, 110, 0.15)',
              color: 'var(--inkm)',
              cursor: 'pointer'
            }}
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
          style={{ width: '100%', padding: '3px 8px', fontSize: '11px', height: '24px', boxSizing: 'border-box' }}
        />

        {/* Scroll Content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '2px' }}>
          
          {/* Section 1: Backpack Items */}
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '3px' }}>
              🎒 Available in Backpack ({backpackCandidates.length})
            </div>
            {backpackCandidates.length === 0 ? (
              <div style={{ fontSize: '9.5px', color: 'var(--inkl)', fontStyle: 'italic', padding: '4px' }}>
                No matching unequipped items in your backpack.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {backpackCandidates
                  .filter(({ item }) => !search.trim() || item.name.toLowerCase().includes(search.toLowerCase()))
                  .map(({ item, idx }) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.5)',
                        border: '0.5px solid rgba(200, 169, 110, 0.4)',
                        borderLeft: '3px solid #c8a96e',
                        borderRadius: '3px',
                        padding: '5px 7px'
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: 'var(--font-title)', fontSize: '11.5px', fontWeight: 'bold', color: 'var(--red)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--inkm)', fontFamily: 'var(--font-body)' }}>
                          {(item.effects || []).map((e: any) => formatEffectDisplay(e)).join(', ')}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEquipBackpackItem(idx)}
                        className="btn btn-p"
                        style={{
                          fontSize: '8px',
                          padding: '2px 8px',
                          fontFamily: 'var(--font-title)',
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                          border: '0.5px solid #8b6914',
                          color: '#ffffff',
                          borderRadius: '2px',
                          cursor: 'pointer'
                        }}
                      >
                        ⚡ Equip Now
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Section 2: Consolidated Compendium Presets */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <span style={{ fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: 'var(--ink)' }}>
                📖 Standard Magic Items ({slotConsolidated.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCompendium(slotKey);
                }}
                className="btn"
                style={{
                  fontSize: '8px',
                  padding: '1px 6px',
                  fontFamily: 'var(--font-title)',
                  background: 'rgba(200, 169, 110, 0.1)',
                  border: '0.5px solid var(--pb)',
                  color: 'var(--inkm)'
                }}
              >
                Full Compendium ➔
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {slotConsolidated
                .filter((entry: any) => !search.trim() || entry.baseName.toLowerCase().includes(search.toLowerCase()))
                .map((entry: any) => {
                  const activeKey = getEffectivePresetKey(entry);
                  const activePreset = MAGIC_ITEMS_REGISTRY[activeKey] || {};

                  return (
                    <div
                      key={entry.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.5)',
                        border: '0.5px solid rgba(200, 169, 110, 0.4)',
                        borderLeft: '3px solid #c8a96e',
                        borderRadius: '3px',
                        padding: '5px 7px'
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontFamily: 'var(--font-title)', fontSize: '11.5px', fontWeight: 'bold', color: 'var(--ink)' }}>
                            {activePreset.name || entry.baseName}
                          </span>
                        </div>
                        <div style={{ fontSize: '8.5px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', lineHeight: 1.2 }}>
                          {activePreset.description || entry.description}
                        </div>
                      </div>

                      {/* Tier selector & Equip action */}
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
                                  padding: '1px 4px',
                                  fontFamily: 'var(--font-title)',
                                  fontWeight: 'bold',
                                  background: activeKey === v.key ? 'linear-gradient(135deg, #c8a96e, #9a7a2e)' : 'rgba(200, 169, 110, 0.1)',
                                  color: activeKey === v.key ? '#ffffff' : 'var(--inkm)',
                                  borderColor: activeKey === v.key ? '#8b6914' : 'var(--pb)',
                                  borderRadius: '2px',
                                  cursor: 'pointer'
                                }}
                              >
                                {v.label}
                              </button>
                            ))}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleAddAndEquipPreset(activeKey)}
                          className="btn btn-p"
                          style={{
                            fontSize: '8px',
                            padding: '2px 7px',
                            fontFamily: 'var(--font-title)',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                            border: '0.5px solid #8b6914',
                            color: '#ffffff',
                            borderRadius: '2px',
                            cursor: 'pointer'
                          }}
                        >
                          ⚡ Equip
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--pb)', paddingTop: '10px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCustomEditor(slotKey);
            }}
            className="btn btn-p"
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '4px 14px',
              color: 'var(--red)',
              border: '1.5px solid var(--pb)',
              background: 'linear-gradient(180deg, #fefdf8 0%, #edd9b4 100%)',
              borderRadius: '3px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>➕</span>
            <span>Create Custom Item</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '11px',
              padding: '5px 16px',
              borderRadius: '3px',
              color: 'var(--inkm)',
              border: '1px solid var(--pb)',
              background: 'rgba(200, 169, 110, 0.15)',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>

      </div>
    </DialogOverlay>
  );
};
