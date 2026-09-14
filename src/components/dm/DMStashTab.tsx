/**
 * @module    DMStashTab
 * @summary   DM Stash Tab for creating, managing, and distributing weapons, armors, and magic items to player characters.
 * @exports   DMStashTab
 */

import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import type { CombatStateSnapshot } from '../../types/combat';
import { BaseCard } from '../shared/BaseCard';
import { WeaponEditorModal } from '../dialogs/modals/WeaponEditorModal';
import { ArmorEditorModal } from '../dialogs/modals/ArmorEditorModal';
import { ItemEditorModal } from '../dialogs/modals/ItemEditorModal';
import { DistributeItemModal } from '../dialogs/modals/DistributeItemModal';
import { WeaponRegistry } from '@core/models/Weapon.js';
import { ARMOR_REGISTRY } from '@core/data/armor-data.js';

interface DMStashTabProps {
  state: CombatStateSnapshot;
}

export const DMStashTab: React.FC<DMStashTabProps> = ({ state }) => {
  // Stash Data from meta
  const dmStash = (state.meta as any)?.dmStash || { weapons: [], armors: [], items: [] };
  const weapons: any[] = Array.isArray(dmStash.weapons) ? dmStash.weapons : [];
  const armors: any[] = Array.isArray(dmStash.armors) ? dmStash.armors : [];
  const items: any[] = Array.isArray(dmStash.items) ? dmStash.items : [];

  // Active PCs in Session
  const pcs = Array.isArray(state.combatants)
    ? state.combatants.filter((c: any) => c.type === 'p' || c.side === 'p')
    : [];

  // Local Modals State
  const [editingWeapon, setEditingWeapon] = useState<{ item?: any; index?: number } | null>(null);
  const [editingArmor, setEditingArmor] = useState<{ item?: any; index?: number } | null>(null);
  const [editingItem, setEditingItem] = useState<{ item?: any; index?: number } | null>(null);

  // Distribute Modal State
  const [distributeData, setDistributeData] = useState<{
    itemName: string;
    category: 'weapons' | 'armors' | 'items';
    index: number;
  } | null>(null);

  // Search Filters
  const [weaponSearch, setWeaponSearch] = useState('');
  const [armorSearch, setArmorSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');

  const filteredWeapons = weapons.filter(w => {
    if (!weaponSearch) return true;
    const term = weaponSearch.toLowerCase();
    return (w.name || '').toLowerCase().includes(term) || (w.type || '').toLowerCase().includes(term);
  });

  const filteredArmors = armors.filter(a => {
    if (!armorSearch) return true;
    const term = armorSearch.toLowerCase();
    return (a.name || '').toLowerCase().includes(term) || (a.type || '').toLowerCase().includes(term);
  });

  const filteredItems = items.filter(i => {
    if (!itemSearch) return true;
    const term = itemSearch.toLowerCase();
    return (i.name || '').toLowerCase().includes(term) || (i.slot || '').toLowerCase().includes(term);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Overview Banner */}
      <div
        style={{
          background: 'rgba(200, 169, 110, 0.08)',
          border: '1px solid var(--pb)',
          borderRadius: '4px',
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '13px', fontWeight: 'bold', color: 'var(--red)' }}>
            💰 Dungeon Master Stash &amp; Loot Vault
          </span>
          <p style={{ margin: '2px 0 0', fontSize: '9.5px', color: 'var(--inkm)' }}>
            Forge weapons, armor, and wondrous items here. Hand them out directly to party members in the encounter.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: 'var(--ink)' }}>
          <span>⚔️ Weapons: <strong>{weapons.length}</strong></span>
          <span>🛡️ Armors: <strong>{armors.length}</strong></span>
          <span>✨ Items: <strong>{items.length}</strong></span>
        </div>
      </div>

      {/* 3-Column Stash Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        
        {/* Column 1: Weapons */}
        <BaseCard title="⚔️ Weapons Arsenal">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                value={weaponSearch}
                onChange={(e) => setWeaponSearch(e.target.value)}
                placeholder="🔍 Search weapons..."
                className="cinput"
                style={{ flex: 1, height: '22px', fontSize: '9px', padding: '1px 6px' }}
              />
              <button
                type="button"
                className="btn btn-p"
                onClick={() => setEditingWeapon({})}
                style={{ height: '22px', fontSize: '8.5px', padding: '0 8px', whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'var(--font-title)' }}
              >
                ➕ Weapon
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '420px', overflowY: 'auto', paddingRight: '2px' }}>
              {filteredWeapons.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--inkl)', fontStyle: 'italic', fontSize: '9px' }}>
                  {weaponSearch ? 'No matching weapons in stash.' : 'No weapons in stash. Click "+ Weapon" to forge one.'}
                </div>
              ) : (
                filteredWeapons.map((w) => {
                  const originalIdx = weapons.indexOf(w);
                  const typeDef = WeaponRegistry[w.type] || {};
                  const typeName = typeDef.nameEn || typeDef.name || w.type || 'Weapon';

                  return (
                    <div
                      key={w.id || originalIdx}
                      style={{
                        background: 'rgba(200, 169, 110, 0.04)',
                        border: '1px solid rgba(200, 169, 110, 0.25)',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '11px', fontFamily: 'var(--font-title)', color: 'var(--ink)' }}>
                            {w.name || typeName}
                          </span>
                          {w.enhancement > 0 && (
                            <span style={{ fontSize: '8.5px', fontWeight: 'bold', color: 'var(--red)', background: 'rgba(139, 26, 26, 0.08)', padding: '0 4px', borderRadius: '2px' }}>
                              +{w.enhancement}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => CombatState.deleteStashItem('weapons', originalIdx)}
                          title="Delete weapon"
                          style={{ border: 'none', background: 'transparent', fontSize: '11px', color: 'var(--red)', cursor: 'pointer', padding: '0 2px' }}
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ fontSize: '8px', color: 'var(--inkm)' }}>
                        {typeName} ({w.damageDice || typeDef.damageDice || '1w8'}, {w.crit || typeDef.crit || '20/x2'})
                        {w.isKeen && ' • Keen'}
                        {w.extraDamage && ` • +${w.extraDamage}`}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => setEditingWeapon({ item: w, index: originalIdx })}
                          style={{ fontSize: '8px', height: '18px', padding: '0 6px', cursor: 'pointer' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-p"
                          onClick={() => setDistributeData({ itemName: w.name || typeName, category: 'weapons', index: originalIdx })}
                          style={{ fontSize: '8px', height: '18px', padding: '0 8px', cursor: 'pointer', fontFamily: 'var(--font-title)' }}
                        >
                          🎁 Give to PC
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </BaseCard>

        {/* Column 2: Armors & Shields */}
        <BaseCard title="🛡️ Armors &amp; Shields">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                value={armorSearch}
                onChange={(e) => setArmorSearch(e.target.value)}
                placeholder="🔍 Search armor..."
                className="cinput"
                style={{ flex: 1, height: '22px', fontSize: '9px', padding: '1px 6px' }}
              />
              <button
                type="button"
                className="btn btn-p"
                onClick={() => setEditingArmor({})}
                style={{ height: '22px', fontSize: '8.5px', padding: '0 8px', whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'var(--font-title)' }}
              >
                ➕ Armor
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '420px', overflowY: 'auto', paddingRight: '2px' }}>
              {filteredArmors.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--inkl)', fontStyle: 'italic', fontSize: '9px' }}>
                  {armorSearch ? 'No matching armors in stash.' : 'No armor in stash. Click "+ Armor" to create one.'}
                </div>
              ) : (
                filteredArmors.map((a) => {
                  const originalIdx = armors.indexOf(a);
                  const typeDef = ARMOR_REGISTRY[a.type] || {};
                  const typeName = typeDef.nameEn || typeDef.name || a.type || 'Armor';
                  const acBonus = (a.armorBonus !== undefined ? a.armorBonus : (typeDef.armorBonus || 0)) + (parseInt(a.enhancement) || 0);

                  return (
                    <div
                      key={a.id || originalIdx}
                      style={{
                        background: 'rgba(200, 169, 110, 0.04)',
                        border: '1px solid rgba(200, 169, 110, 0.25)',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '11px', fontFamily: 'var(--font-title)', color: 'var(--ink)' }}>
                            {a.name || typeName}
                          </span>
                          {a.enhancement > 0 && (
                            <span style={{ fontSize: '8.5px', fontWeight: 'bold', color: 'var(--red)', background: 'rgba(139, 26, 26, 0.08)', padding: '0 4px', borderRadius: '2px' }}>
                              +{a.enhancement}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => CombatState.deleteStashItem('armors', originalIdx)}
                          title="Delete armor"
                          style={{ border: 'none', background: 'transparent', fontSize: '11px', color: 'var(--red)', cursor: 'pointer', padding: '0 2px' }}
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ fontSize: '8px', color: 'var(--inkm)' }}>
                        {typeName} (+{acBonus} AC) • MaxDex: {typeDef.maxDex ?? '—'} • ACP: {typeDef.checkPenalty || 0}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => setEditingArmor({ item: a, index: originalIdx })}
                          style={{ fontSize: '8px', height: '18px', padding: '0 6px', cursor: 'pointer' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-p"
                          onClick={() => setDistributeData({ itemName: a.name || typeName, category: 'armors', index: originalIdx })}
                          style={{ fontSize: '8px', height: '18px', padding: '0 8px', cursor: 'pointer', fontFamily: 'var(--font-title)' }}
                        >
                          🎁 Give to PC
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </BaseCard>

        {/* Column 3: Wondrous & Magic Items */}
        <BaseCard title="✨ Wondrous &amp; Magic Items">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="🔍 Search items..."
                className="cinput"
                style={{ flex: 1, height: '22px', fontSize: '9px', padding: '1px 6px' }}
              />
              <button
                type="button"
                className="btn btn-p"
                onClick={() => setEditingItem({})}
                style={{ height: '22px', fontSize: '8.5px', padding: '0 8px', whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'var(--font-title)' }}
              >
                ➕ Item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '420px', overflowY: 'auto', paddingRight: '2px' }}>
              {filteredItems.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--inkl)', fontStyle: 'italic', fontSize: '9px' }}>
                  {itemSearch ? 'No matching items in stash.' : 'No wondrous items in stash. Click "+ Item" to create one.'}
                </div>
              ) : (
                filteredItems.map((item) => {
                  const originalIdx = items.indexOf(item);
                  const effectsSummary = Array.isArray(item.effects)
                    ? item.effects.map((e: any) => `${e.value >= 0 ? '+' : ''}${e.value} ${e.target} (${e.bonusType})`).join(', ')
                    : '';

                  return (
                    <div
                      key={item.id || originalIdx}
                      style={{
                        background: 'rgba(200, 169, 110, 0.04)',
                        border: '1px solid rgba(200, 169, 110, 0.25)',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '11px', fontFamily: 'var(--font-title)', color: 'var(--ink)' }}>
                            {item.name || 'Wondrous Item'}
                          </span>
                          <span style={{ fontSize: '7.5px', color: 'var(--inkm)', background: 'rgba(200, 169, 110, 0.15)', padding: '0 4px', borderRadius: '2px' }}>
                            {item.slot || 'slotless'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => CombatState.deleteStashItem('items', originalIdx)}
                          title="Delete item"
                          style={{ border: 'none', background: 'transparent', fontSize: '11px', color: 'var(--red)', cursor: 'pointer', padding: '0 2px' }}
                        >
                          ✕
                        </button>
                      </div>

                      {effectsSummary && (
                        <div style={{ fontSize: '8px', color: 'var(--inkm)', fontStyle: 'italic' }}>
                          {effectsSummary}
                        </div>
                      )}

                      {item.charges && (
                        <div style={{ fontSize: '7.5px', color: 'var(--inkl)' }}>
                          Charges: {item.charges.current} / {item.charges.max}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => setEditingItem({ item, index: originalIdx })}
                          style={{ fontSize: '8px', height: '18px', padding: '0 6px', cursor: 'pointer' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-p"
                          onClick={() => setDistributeData({ itemName: item.name || 'Item', category: 'items', index: originalIdx })}
                          style={{ fontSize: '8px', height: '18px', padding: '0 8px', cursor: 'pointer', fontFamily: 'var(--font-title)' }}
                        >
                          🎁 Give to PC
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </BaseCard>

      </div>

      {/* Weapon Modal */}
      {editingWeapon && (
        <WeaponEditorModal
          weapon={editingWeapon.item}
          onSave={(weaponData) => {
            if (editingWeapon.index !== undefined) {
              CombatState.updateStashItem('weapons', editingWeapon.index, weaponData);
            } else {
              CombatState.addStashItem('weapons', weaponData);
            }
          }}
          onClose={() => setEditingWeapon(null)}
        />
      )}

      {/* Armor Modal */}
      {editingArmor && (
        <ArmorEditorModal
          armor={editingArmor.item}
          onSave={(armorData) => {
            if (editingArmor.index !== undefined) {
              CombatState.updateStashItem('armors', editingArmor.index, armorData);
            } else {
              CombatState.addStashItem('armors', armorData);
            }
          }}
          onClose={() => setEditingArmor(null)}
        />
      )}

      {/* Item Modal */}
      {editingItem && (
        <ItemEditorModal
          item={editingItem.item}
          onSave={(itemData) => {
            if (editingItem.index !== undefined) {
              CombatState.updateStashItem('items', editingItem.index, itemData);
            } else {
              CombatState.addStashItem('items', itemData);
            }
          }}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Distribute to PC Modal */}
      {distributeData && (
        <DistributeItemModal
          itemName={distributeData.itemName}
          category={distributeData.category}
          index={distributeData.index}
          pcs={pcs}
          onClose={() => setDistributeData(null)}
        />
      )}
    </div>
  );
};
