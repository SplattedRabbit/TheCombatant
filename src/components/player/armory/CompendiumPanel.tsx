/**
 * @module    CompendiumPanel
 * @summary   Renders the searchable and filterable Compendium item catalog in the Armory tab.
 */

import React from 'react';
import { ITEM_SLOTS, MAGIC_ITEMS_REGISTRY } from '@core/data/magicItems-data.js';
import { formatEffectDisplay } from './BodySlotCard';
import { isConsumableItem, getItemTypeIcon } from './armoryHelpers';

interface CompendiumPanelProps {
  filteredCompendium: Array<any>;
  selectedTiers: Record<string, string>;
  onSelectTier: (entryId: string, presetKey: string) => void;
  onAddBackpack: (presetKey: string) => void;
  onAddAndEquip: (presetKey: string) => void;
}

export const CompendiumPanel: React.FC<CompendiumPanelProps> = ({
  filteredCompendium,
  selectedTiers,
  onSelectTier,
  onAddBackpack,
  onAddAndEquip,
}) => {
  const getEffectivePresetKey = (entry: any) => {
    const selectedKey = selectedTiers[entry.id];
    if (selectedKey && entry.variants.some((v: any) => v.key === selectedKey)) {
      return selectedKey;
    }
    return entry.variants[0]?.key || entry.id;
  };

  if (filteredCompendium.length === 0) {
    return (
      <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--inkl)', fontSize: '10.5px', fontStyle: 'italic' }}>
        No items found matching criteria.
      </div>
    );
  }

  return (
    <>
      {filteredCompendium.map((entry: any) => {
        const activeKey = getEffectivePresetKey(entry);
        const activePreset = MAGIC_ITEMS_REGISTRY[activeKey] || {};
        const slotInfo = (ITEM_SLOTS as any)[entry.slot] || { icon: '🎒', nameEn: entry.slot };
        const rawEffects = Array.isArray(activePreset.effects) ? activePreset.effects : [];
        const activeEffects = rawEffects.filter((e: any) => (parseInt(e.value) || 0) !== 0);
        const itemIcon = getItemTypeIcon(activePreset, slotInfo.icon);

        return (
          <div
            key={entry.id}
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              border: '0.5px solid rgba(200, 169, 110, 0.4)',
              borderLeft: '3px solid #c8a96e',
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
                <span style={{ fontSize: '12px' }}>{itemIcon}</span>
                <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11.5px', fontWeight: 'bold', color: 'var(--red)' }}>
                  {activePreset.name || entry.baseName}
                </span>
                <span style={{ fontSize: '7.5px', color: 'var(--inkm)', background: 'rgba(200, 169, 110, 0.15)', padding: '0 3px', borderRadius: '2px', fontFamily: "'IM Fell English SC', serif" }}>
                  {isConsumableItem(activePreset) ? 'Consumable' : slotInfo.nameEn}
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
                        onClick={() => onSelectTier(entry.id, v.key)}
                        className="btn"
                        style={{
                          fontSize: '7.5px',
                          padding: '0 5px',
                          height: '17px',
                          lineHeight: '1',
                          fontFamily: "'IM Fell English SC', serif",
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
                  onClick={() => onAddBackpack(activeKey)}
                  className="btn"
                  style={{
                    fontSize: '8px',
                    padding: '1px 6px',
                    fontFamily: "'IM Fell English SC', serif",
                    fontWeight: 'bold',
                    background: isConsumableItem(activePreset) ? 'linear-gradient(135deg, #c8a96e, #9a7a2e)' : 'rgba(200, 169, 110, 0.12)',
                    border: isConsumableItem(activePreset) ? '0.5px solid #8b6914' : '0.5px solid var(--pb)',
                    color: isConsumableItem(activePreset) ? '#ffffff' : 'var(--ink)',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                  title={isConsumableItem(activePreset) ? "Add to Backpack / Belt" : "Add to Backpack"}
                >
                  {isConsumableItem(activePreset) ? '+ Belt / Stash' : '+ Stash'}
                </button>
                {!isConsumableItem(activePreset) && (
                  <button
                    type="button"
                    onClick={() => onAddAndEquip(activeKey)}
                    className="btn btn-p"
                    style={{
                      fontSize: '8px',
                      padding: '1px 6px',
                      fontFamily: "'IM Fell English SC', serif",
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                      border: '0.5px solid #8b6914',
                      color: '#ffffff',
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                    title="Add and immediately equip"
                  >
                    ⚡ Equip
                  </button>
                )}
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
      })}
    </>
  );
};
