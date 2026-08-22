import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { ITEM_SLOTS, MAGIC_ITEMS_REGISTRY, CONSOLIDATED_COMPENDIUM } from '@core/data/magicItems-data.js';
// @ts-ignore
import { calculateItemSetBonuses, getItemStackingBreakdown } from '@core/rules.js';
// @ts-ignore
import { showCustomPrompt, showHealingRollDialog, showItemDamageDialog } from '@core/ui/components/dialogs.js';
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

export function isConsumableItem(item: any): boolean {
  if (!item) return false;
  const slot = item.slot;
  const type = item.type;
  const name = (item.name || '').toLowerCase();
  
  if (type === 'potion' || type === 'scroll' || type === 'wand' || type === 'consumable' || type === 'alchemical') return true;
  if (slot === 'potion' || slot === 'scroll' || slot === 'wand' || slot === 'consumable') return true;
  if (name.includes('potion') || name.includes('trank') || name.includes('scroll') || name.includes('schriftrolle') || name.includes('wand') || name.includes('zauberstab') || name.includes('alchemist') || name.includes('smokestick') || name.includes('tanglefoot') || name.includes('holy water')) return true;
  
  const hasPassiveEffects = Array.isArray(item.effects) && item.effects.some((e: any) => (parseInt(e.value) || 0) !== 0);
  if (!hasPassiveEffects && (item.healingFormula || item.damageFormula || item.activation?.appliedBuffKey || item.charges?.max === 1)) {
    return true;
  }
  return false;
}

export function getItemTypeIcon(itemOrPreset: any, defaultIcon: string = '🎒'): string {
  if (!itemOrPreset) return defaultIcon;
  const type = (itemOrPreset.type || '').toLowerCase();
  const name = (itemOrPreset.name || '').toLowerCase();
  const key = (itemOrPreset.key || itemOrPreset.id || '').toLowerCase();
  if (type === 'potion' || key.includes('potion') || name.includes('potion') || name.includes('trank')) return '🧪';
  if (type === 'scroll' || key.includes('scroll') || name.includes('scroll') || name.includes('schriftrolle')) return '📜';
  if (type === 'wand' || key.includes('wand') || name.includes('wand') || name.includes('stab')) return '🪄';
  if (key.includes('ioun') || name.includes('ioun')) return '💎';
  if (key.includes('bag') || name.includes('bag') || name.includes('haversack')) return '🎒';
  return defaultIcon;
}

export const ArmoryTab: React.FC<ArmoryTabProps> = ({ pc }) => {
  const [rightPanelMode, setRightPanelMode] = useState<'backpack' | 'compendium'>('backpack');
  const [search, setSearch] = useState('');
  const [slotFilter, setSlotFilter] = useState('all');
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});
  const [activeEquipSlot, setActiveEquipSlot] = useState<string | null>(null);
  const [editingItemData, setEditingItemData] = useState<{ item?: any; itemIdx?: number; defaultSlot?: string } | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [draggedBackpackIdx, setDraggedBackpackIdx] = useState<number | null>(null);
  const [dragOverBackpackIdx, setDragOverBackpackIdx] = useState<number | null>(null);

  const getHealingFormulaDetails = (item: any) => {
    if (!item) return null;
    const name = (item.name || '').toLowerCase();
    const formula = item.healingFormula || ((name.includes('cure') || name.includes('heil') || item.type === 'potion' || item.slot === 'potion')
      ? (name.includes('moderate') ? '2d8+3' : (name.includes('serious') ? '3d8+5' : (name.includes('critical') ? '4d8+7' : '1d8+1')))
      : null);

    if (!formula) return null;
    const match = formula.match(/(\d+)[dw](\d+)(?:\+(\d+))?/i);
    if (match) {
      const dice = `${match[1]}d${match[2]}`;
      const bonus = match[3] ? parseInt(match[3]) : 0;
      return { formula, dice, bonus };
    }
    return { formula, dice: formula, bonus: 0 };
  };

  const getDamageFormulaDetails = (item: any) => {
    if (!item) return null;
    const name = (item.name || '').toLowerCase();
    if (item.healingFormula || name.includes('cure') || name.includes('heil')) return null;

    const effectDesc = item.activation?.effectDescription || item.description || '';
    const fullName = `${item.name || ''} ${effectDesc}`;

    const match = item.damageFormula 
      ? item.damageFormula.match(/(\d+)[dw](\d+)(?:\+(\d+))?/i)
      : (fullName.match(/(\d+)[dw](\d+)(?:\+(\d+))?\s*([a-zA-ZäöüÄÖÜß]+)?\s*(?:damage|schaden)?/i) || fullName.match(/(\d+)[dw](\d+)(?:\+(\d+))?/i));

    if (!match) return null;

    const dice = `${match[1]}d${match[2]}`;
    const bonus = match[3] ? parseInt(match[3]) : 0;
    const damageType = match[4] || '';
    const formula = bonus > 0 ? `${dice}+${bonus}` : dice;

    const dcMatch = effectDesc.match(/DC\s*(\d+)\s*([a-zA-ZäöüÄÖÜß]+)?(?:\s*(?:half|negates|halbiert))?/i);
    const saveText = dcMatch ? `DC ${dcMatch[1]} ${dcMatch[2] || 'Save'}` : null;

    return {
      formula,
      dice,
      bonus,
      damageType,
      effectDesc,
      saveText
    };
  };

  const handleUseItem = (idx: number) => {
    const item = pc.items && pc.items[idx];
    if (!item) return;

    const healDetails = getHealingFormulaDetails(item);
    if (healDetails) {
      showHealingRollDialog({
        itemName: item.name || 'Potion',
        dice: healDetails.dice,
        bonus: healDetails.bonus,
        formula: healDetails.formula,
        onConfirm: (val: string) => {
          const res = CombatState.usePCItemAction(idx, val);
          if (res && res.message) {
            setActionFeedback(res.message);
            setTimeout(() => {
              setActionFeedback(null);
            }, 4500);
          }
        }
      });
      return;
    }

    const dmgDetails = getDamageFormulaDetails(item);
    if (dmgDetails) {
      showItemDamageDialog({
        itemName: item.name || 'Offensive Item',
        dice: dmgDetails.dice,
        bonus: dmgDetails.bonus,
        formula: dmgDetails.formula,
        damageType: dmgDetails.damageType,
        effectDesc: dmgDetails.effectDesc,
        saveText: dmgDetails.saveText,
        onConfirm: () => {
          const res = CombatState.usePCItemAction(idx);
          if (res && res.message) {
            setActionFeedback(res.message);
            setTimeout(() => {
              setActionFeedback(null);
            }, 4500);
          }
        }
      });
      return;
    }

    const res = CombatState.usePCItemAction(idx);
    if (res && res.message) {
      setActionFeedback(res.message);
      setTimeout(() => {
        setActionFeedback(null);
      }, 4500);
    }
  };

  const items = Array.isArray(pc.items) ? pc.items : [];

  // Map equipped items to slot (excluding consumables)
  const equippedMap: Record<string, { item: any; idx: number }> = {};
  const slotlessEquipped: Array<{ item: any; idx: number }> = [];

  items.forEach((item: any, idx: number) => {
    if (item && item.isEquipped && !isConsumableItem(item)) {
      if (item.slot && item.slot !== 'slotless') {
        equippedMap[item.slot] = { item, idx };
      } else {
        slotlessEquipped.push({ item, idx });
      }
    }
  });

  // Backpack entries: unequipped items + all consumables
  const backpackEntries = items
    .map((item: any, idx: number) => ({ item, idx }))
    .filter(({ item }: { item: any }) => !item.isEquipped || isConsumableItem(item));

  const filteredBackpack = backpackEntries.filter(({ item }: { item: any }) => {
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
  const filteredCompendium = CONSOLIDATED_COMPENDIUM.filter((entry: any) => {
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
    <div style={{ marginBottom: '16px' }}>
      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '3px',
            padding: '6px 12px',
            marginBottom: '10px',
            color: '#065f46',
            fontSize: '11px',
            fontFamily: "'Crimson Text', serif",
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>✨ {actionFeedback}</span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 'bold', fontSize: '10px' }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="armory-layout-grid">
      
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
                          <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                          <span style={{ fontSize: '8.5px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.description}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginLeft: '6px' }}>
                        {isUsable && (
                          <button
                            type="button"
                            onClick={() => handleUseItem(idx)}
                            className="btn"
                            style={{
                              fontSize: '8px',
                              padding: '1px 6px',
                              fontFamily: "'IM Fell English SC', serif",
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
                          onClick={() => handleUnequipSlot(idx)}
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
              style={{
                fontSize: '8.5px',
                padding: '2px 8px',
                fontFamily: "'IM Fell English SC', serif",
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                border: '0.5px solid #8b6914',
                color: '#ffffff',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
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
                  padding: '1px 6px',
                  fontFamily: "'IM Fell English SC', serif",
                  background: slotFilter === chip.key ? 'linear-gradient(135deg, #c8a96e, #9a7a2e)' : 'rgba(200, 169, 110, 0.08)',
                  borderColor: slotFilter === chip.key ? '#8b6914' : 'var(--pb)',
                  color: slotFilter === chip.key ? '#ffffff' : 'var(--inkm)',
                  fontWeight: slotFilter === chip.key ? 'bold' : 'normal',
                  borderRadius: '2px',
                  cursor: 'pointer'
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
                    style={{
                      fontSize: '9px',
                      padding: '3px 10px',
                      fontFamily: "'IM Fell English SC', serif",
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                      border: '0.5px solid #8b6914',
                      color: '#ffffff',
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                  >
                    📖 Browse {slotFilter !== 'all' ? `${slotFilter} in ` : ''}Compendium
                  </button>
                </div>
              ) : (
                filteredBackpack.map(({ item, idx }: { item: any; idx: number }) => {
                  const slotDef = (ITEM_SLOTS as any)[item.slot] || { icon: '🎒', nameEn: item.slot || 'Slotless' };
                  const rawEffects = Array.isArray(item.effects) ? item.effects : [];
                  const activeEffects = rawEffects.filter((e: any) => (parseInt(e.value) || 0) !== 0);

                  const itemNameLower = (item.name || '').toLowerCase();
                  const isPotion = itemNameLower.includes('potion') || itemNameLower.includes('trank') || (item.charges?.max === 1 && !itemNameLower.includes('wand') && !itemNameLower.includes('scroll'));
                  const isWand = itemNameLower.includes('wand') || itemNameLower.includes('zauberstab');
                  const isScroll = itemNameLower.includes('scroll') || itemNameLower.includes('schriftrolle');
                  const hasActivation = !!item.activation?.effectDescription || !!item.activation?.appliedBuffKey || !!item.charges || !!item.dailyUses;
                  const isUsable = isPotion || isWand || isScroll || hasActivation;
                  const isOver = dragOverBackpackIdx === idx;
                  const isDragging = draggedBackpackIdx === idx;

                  return (
                    <div
                      key={item.id || idx}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', String(idx));
                        e.dataTransfer.effectAllowed = 'move';
                        if (e.currentTarget instanceof HTMLElement && e.dataTransfer.setDragImage) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const offsetX = e.clientX - rect.left;
                          const offsetY = e.clientY - rect.top;
                          e.dataTransfer.setDragImage(e.currentTarget, Math.max(0, Math.min(rect.width, offsetX)), Math.max(0, Math.min(rect.height, offsetY)));
                        }
                        setDraggedBackpackIdx(idx);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverBackpackIdx(idx);
                      }}
                      onDragLeave={() => setDragOverBackpackIdx(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedBackpackIdx !== null && draggedBackpackIdx !== idx) {
                          CombatState.reorderPCItems(draggedBackpackIdx, idx);
                        }
                        setDraggedBackpackIdx(null);
                        setDragOverBackpackIdx(null);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        border: isOver ? '1.5px solid #8b6914' : '0.5px solid rgba(200, 169, 110, 0.4)',
                        borderLeft: isOver ? '3px solid #8b6914' : '3px solid #c8a96e',
                        borderRadius: '3px',
                        padding: '5px 7px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        boxShadow: isOver ? '0 0 8px rgba(139, 105, 20, 0.4)' : '0 1px 2px rgba(0,0,0,0.03)',
                        opacity: isDragging ? 0.4 : 1,
                        cursor: 'grab',
                        transition: 'border 0.15s ease, box-shadow 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--inkm)', cursor: 'grab', userSelect: 'none' }} title="Drag to reorder">⋮⋮</span>
                          <span style={{ fontSize: '12px' }}>{slotDef.icon}</span>
                          <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11.5px', fontWeight: 'bold', color: 'var(--ink)' }}>
                            {item.name || 'Item'}
                          </span>
                          <span style={{ fontSize: '7.5px', color: 'var(--inkm)', background: 'rgba(0,0,0,0.04)', padding: '0 3px', borderRadius: '2px' }}>
                            {slotDef.nameEn}
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

                        <div style={{ display: 'flex', gap: '3px' }}>
                          {isUsable && (
                            <button
                              type="button"
                              onClick={() => handleUseItem(idx)}
                              className="btn"
                              style={{
                                fontSize: '8px',
                                padding: '1px 6px',
                                fontFamily: "'IM Fell English SC', serif",
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
                          {!isConsumableItem(item) && (
                            <button
                              type="button"
                              onClick={() => CombatState.equipPCItem(idx, item.slot)}
                              className="btn btn-p"
                              style={{
                                fontSize: '8px',
                                padding: '1px 6px',
                                fontFamily: "'IM Fell English SC', serif",
                                background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                                border: '0.5px solid #8b6914',
                                color: '#ffffff'
                              }}
                            >
                              ⚡ Equip
                            </button>
                          )}
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
                filteredCompendium.map((entry: any) => {
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
                                  onClick={() => handleSelectTier(entry.id, v.key)}
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
                            onClick={() => handleAddBackpack(activeKey)}
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
                              onClick={() => handleAddAndEquip(activeKey)}
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
    </div>
  );
};
