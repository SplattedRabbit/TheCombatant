/**
 * @module    PaperdollPanel
 * @summary   Renders the 12 body slots paperdoll grid, active set bonuses, and equipped slotless items.
 */

import React from 'react';
import { ITEM_SLOTS } from '@core/data/magicItems-data.js';
import { BaseCard } from '../../shared/BaseCard';
import { BodySlotCard } from './BodySlotCard';
import { EmptySlotCard } from './EmptySlotCard';
import { BODY_SLOTS_ORDER } from './armoryHelpers';

interface PaperdollPanelProps {
  equippedMap: Record<string, { item: any; idx: number }>;
  slotlessEquipped: Array<{ item: any; idx: number }>;
  setBonusData: { activeSets: Array<any>; setEffects: Array<any> };
  stackingBreakdown: any;
  onUnequipSlot: (idx: number) => void;
  onEditItem: (data: { item: any; itemIdx: number }) => void;
  onEmptySlotClick: (slotKey: string) => void;
  onUseItem: (idx: number) => void;
}

export const PaperdollPanel: React.FC<PaperdollPanelProps> = ({
  equippedMap,
  slotlessEquipped,
  setBonusData,
  stackingBreakdown,
  onUnequipSlot,
  onEditItem,
  onEmptySlotClick,
  onUseItem,
}) => {
  return (
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
                  onUnequip={() => onUnequipSlot(equippedEntry.idx)}
                  onEdit={() => onEditItem({ item: equippedEntry.item, itemIdx: equippedEntry.idx })}
                />
              );
            }

            return (
              <EmptySlotCard
                key={slotKey}
                slotKey={slotKey}
                slotDef={slotDef}
                onClick={() => onEmptySlotClick(slotKey)}
              />
            );
          })}
        </div>

        {/* Active Item Sets */}
        {setBonusData.activeSets.length > 0 && (
          <div style={{ marginTop: '4px', borderTop: '0.5px solid var(--pb)', paddingTop: '6px' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '10.5px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '4px' }}>
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
                    <span style={{ fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
                      {activeSet.set.name}
                    </span>
                    <span style={{ fontSize: '8px', background: 'rgba(139, 26, 26, 0.15)', color: 'var(--red)', padding: '0 4px', borderRadius: '2px', fontWeight: 'bold' }}>
                      {activeSet.equippedCount} / {activeSet.totalPieces} Pieces
                    </span>
                  </div>
                  {activeSet.activeBonuses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                      {activeSet.activeBonuses.map((b: any, bIdx: number) => (
                        <div key={bIdx} style={{ fontSize: '8.5px', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                          • {b.requiredPieces} Pieces: {b.description}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '8px', color: 'var(--inkm)', fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>
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
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '10.5px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '4px' }}>
              🎒 Slotless & Wondrous Items ({slotlessEquipped.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {slotlessEquipped.map(({ item, idx }) => {
                const itemNameLower = (item.name || '').toLowerCase();
                const isPotion = itemNameLower.includes('potion') || itemNameLower.includes('trank') || (item.charges?.max === 1 && !itemNameLower.includes('wand') && !itemNameLower.includes('scroll'));
                const isWand = itemNameLower.includes('wand') || itemNameLower.includes('zauberstab');
                const isScroll = itemNameLower.includes('scroll') || itemNameLower.includes('schriftrolle');
                const hasActivation = !!item.activation?.effectDescription || !!item.activation?.appliedBuffKey || !!item.charges || !!item.dailyUses;
                const isUsable = isPotion || isWand || isScroll || hasActivation;

                return (
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </span>
                        {item.charges && (
                          <span style={{ fontSize: '7.5px', background: 'rgba(0,0,0,0.06)', padding: '0 3px', borderRadius: '2px' }}>
                            {item.charges.current}/{item.charges.max}
                          </span>
                        )}
                        {item.dailyUses && (
                          <span style={{ fontSize: '7.5px', background: 'rgba(0,0,0,0.06)', padding: '0 3px', borderRadius: '2px' }}>
                            {item.dailyUses.current}/{item.dailyUses.max}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <span style={{ fontSize: '8.5px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.description}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginLeft: '6px' }}>
                      {isUsable && (
                        <button
                          type="button"
                          onClick={() => onUseItem(idx)}
                          className="btn"
                          style={{
                            fontSize: '8px',
                            padding: '1px 6px',
                            fontFamily: 'var(--font-title)',
                            background: isPotion ? 'rgba(16, 185, 129, 0.15)' : (isWand ? 'rgba(139, 92, 246, 0.15)' : 'rgba(217, 119, 6, 0.15)'),
                            borderColor: isPotion ? '#10b981' : (isWand ? '#8b5cf6' : '#d97706'),
                            color: isPotion ? '#065f46' : (isWand ? '#5b21b6' : '#92400e'),
                            fontWeight: 'bold'
                          }}
                          title={isPotion ? "Drink potion" : (isWand ? "Cast wand charge" : "Use item")}
                        >
                          {isPotion ? '🍷 Drink' : (isWand ? '🪄 Cast' : (isScroll ? '📜 Read' : '⚡ Use'))}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onUnequipSlot(idx)}
                        className="xbtn"
                        style={{ fontSize: '8px', padding: '1px 5px' }}
                        title="Unequip"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </BaseCard>
  );
};
