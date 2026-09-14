import React, { useState } from 'react';
import { DialogOverlay } from '../../dialogs/modals/DialogOverlay.tsx';
import { CombatState } from '@core/state.js';
import { ITEM_SLOTS, MAGIC_ITEMS_REGISTRY, CONSOLIDATED_COMPENDIUM } from '@core/data/magicItems-data.js';
import { formatEffectDisplay } from './BodySlotCard';
import { isConsumableItem, getItemTypeIcon } from './ArmoryTab';

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

  const filteredConsolidated = CONSOLIDATED_COMPENDIUM.filter((entry: any) => {
    if (selectedSlot !== 'all') {
      if (selectedSlot === 'rings') {
        if (entry.slot !== 'ring1' && entry.slot !== 'ring2' && entry.slot !== 'ring') return false;
      } else if (entry.slot !== selectedSlot) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (entry.baseName || entry.nameEn || '').toLowerCase().includes(q);
      const matchDesc = entry.description && entry.description.toLowerCase().includes(q);
      return matchName || matchDesc;
    }
    return true;
  });

  const getEffectivePresetKey = (entry: any) => {
    const selectedKey = selectedTiers[entry.id];
    if (selectedKey && entry.variants?.some((v: any) => v.key === selectedKey)) {
      return selectedKey;
    }
    return entry.variants?.[0]?.key || entry.id;
  };

  const handleSelectTier = (entryId: string, presetKey: string) => {
    setSelectedTiers(prev => ({ ...prev, [entryId]: presetKey }));
  };

  const handleAddBackpack = (presetKey: string) => {
    CombatState.addPCItemFromCompendium(presetKey, false);
    onClose();
  };

  const handleAddAndEquip = (presetKey: string) => {
    CombatState.addPCItemFromCompendium(presetKey, true);
    onClose();
  };

  const filterChips = [
    { key: 'all', label: 'All Items' },
    { key: 'head', label: 'Head' },
    { key: 'eyes', label: 'Eyes' },
    { key: 'neck', label: 'Neck' },
    { key: 'shoulders', label: 'Shoulders' },
    { key: 'torso', label: 'Torso' },
    { key: 'body', label: 'Body' },
    { key: 'wrists', label: 'Wrists' },
    { key: 'hands', label: 'Hands' },
    { key: 'waist', label: 'Waist' },
    { key: 'feet', label: 'Feet' },
    { key: 'rings', label: 'Rings' },
    { key: 'slotless', label: 'Slotless' }
  ];

  return (
    <DialogOverlay onClose={onClose} width={640} textAlign="left" padding="16px 20px">
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--pb)', paddingBottom: '7px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📖</span>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '15px', fontWeight: 'bold', color: 'var(--red)', letterSpacing: '0.02em' }}>
              Magic Items Compendium
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
                padding: '2px 6px',
                fontFamily: 'var(--font-title)',
                background: selectedSlot === chip.key ? 'linear-gradient(135deg, #c8a96e, #9a7a2e)' : 'rgba(200, 169, 110, 0.08)',
                borderColor: selectedSlot === chip.key ? '#8b6914' : 'var(--pb)',
                color: selectedSlot === chip.key ? '#ffffff' : 'var(--inkm)',
                fontWeight: selectedSlot === chip.key ? 'bold' : 'normal',
                borderRadius: '2px',
                cursor: 'pointer'
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
            filteredConsolidated.map((entry: any) => {
              const activeKey = getEffectivePresetKey(entry);
              const activePreset = MAGIC_ITEMS_REGISTRY[activeKey] || {};
              const slotInfo = (ITEM_SLOTS as any)[entry.slot] || { icon: '🎒', nameEn: entry.slot };
              const effects = Array.isArray(activePreset.effects) ? activePreset.effects : [];

              return (
                <div
                  key={entry.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.5)',
                    border: '0.5px solid rgba(200, 169, 110, 0.4)',
                    borderLeft: '3px solid #c8a96e',
                    borderRadius: '3px',
                    padding: '6px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px' }}>{getItemTypeIcon(activePreset, slotInfo.icon)}</span>
                      <span style={{ fontFamily: 'var(--font-title)', fontSize: '11.5px', fontWeight: 'bold', color: 'var(--red)' }}>
                        {activePreset.name || entry.baseName}
                      </span>
                      <span style={{ fontSize: '7.5px', background: 'rgba(200, 169, 110, 0.15)', color: 'var(--inkm)', padding: '0 4px', borderRadius: '2px', fontFamily: 'var(--font-title)' }}>
                        {isConsumableItem(activePreset) ? 'Consumable' : slotInfo.nameEn}
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
                                padding: '1px 5px',
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
                        onClick={() => handleAddBackpack(activeKey)}
                        className="btn"
                        style={{
                          fontSize: '8px',
                          padding: '2px 7px',
                          fontFamily: 'var(--font-title)',
                          fontWeight: 'bold',
                          background: isConsumableItem(activePreset) ? 'linear-gradient(135deg, #c8a96e, #9a7a2e)' : 'rgba(200, 169, 110, 0.12)',
                          border: isConsumableItem(activePreset) ? '0.5px solid #8b6914' : '0.5px solid var(--pb)',
                          color: isConsumableItem(activePreset) ? '#ffffff' : 'var(--ink)',
                          borderRadius: '2px',
                          cursor: 'pointer'
                        }}
                        title={isConsumableItem(activePreset) ? "Add to Backpack / Belt" : "Add to Backpack"}
                      >
                        {isConsumableItem(activePreset) ? '+ Belt / Stash' : '+ Backpack'}
                      </button>
                      {!isConsumableItem(activePreset) && (
                        <button
                          type="button"
                          onClick={() => handleAddAndEquip(activeKey)}
                          className="btn btn-p"
                          style={{
                            fontSize: '8px',
                            padding: '2px 7px',
                            fontFamily: 'var(--font-title)',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                            border: '0.5px solid #8b6914',
                            color: '#ffffff',
                            borderRadius: '2px',
                            cursor: 'pointer'
                          }}
                          title="Add & Equip directly"
                        >
                          ⚡ Equip
                        </button>
                      )}
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
                            fontFamily: 'var(--font-body)'
                          }}
                        >
                          {formatEffectDisplay(eff)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <div style={{ fontSize: '8.5px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', lineHeight: 1.25 }}>
                    {activePreset.description || entry.description}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--pb)', paddingTop: '10px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '11px',
              padding: '5px 24px',
              borderRadius: '3px',
              color: 'var(--inkm)',
              border: '1px solid var(--pb)',
              background: 'rgba(200, 169, 110, 0.15)',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

      </div>
    </DialogOverlay>
  );
};
