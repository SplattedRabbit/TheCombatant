/**
 * @module    PCMagicItemsTab
 * @summary   Rendert den Tab »Magische Gegenstände«: Slot-Boxen (links, 11 Slots + Slotless) und Rucksack-Inventar mit Multi-Effekt-Editor (rechts).
 * @exports   PCMagicItemsTab
 * @reads     pc.items[], item.slot, item.effects[], item.isEquipped
 * @stateOps  addPCItem, updatePCItem, deletePCItem, togglePCItemEquip, addPCItemEffect, updatePCItemEffect, deletePCItemEffect
 * @depends   React, @core/state.js
 */

import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import { BaseCard } from '../shared/BaseCard';

interface PCMagicItemsTabProps {
  pc: any;
}

const SLOTS: Record<string, { name: string; icon: string }> = {
  head: { name: 'Kopf', icon: '👑' },
  face: { name: 'Gesicht', icon: '👓' },
  neck: { name: 'Hals', icon: '📿' },
  shoulders: { name: 'Schultern', icon: '🧥' },
  torso: { name: 'Rumpf', icon: '🥋' },
  wrists: { name: 'Handgelenke', icon: '🦾' },
  hands: { name: 'Hände', icon: '🧤' },
  waist: { name: 'Taille', icon: '🎗️' },
  feet: { name: 'Füße', icon: '🥾' },
  ring1: { name: 'Ring 1', icon: '💍' },
  ring2: { name: 'Ring 2', icon: '💍' }
};

const getEffectTargetDesc = (eff: any) => {
  const target = eff.target || eff.effectTarget || 'str';
  const targets: Record<string, string> = {
    str: 'Stärke (STR)',
    dex: 'Geschick (DEX)',
    con: 'Konst (CON)',
    int: 'Intelligenz (INT)',
    wis: 'Weisheit (WIS)',
    cha: 'Charisma (CHA)',
    fort: 'Zähigkeit',
    ref: 'Reflex',
    wil: 'Wille',
    all: 'Rettungswürfe',
    deflection: 'Ablenkung (RK)',
    natural: 'Natürliche Rüstung',
    armor: 'Rüstungsbonus',
    speed: 'Bewegung'
  };
  return targets[target] || target;
};

export const PCMagicItemsTab: React.FC<PCMagicItemsTabProps> = ({ pc }) => {
  const [openDrawerIds, setOpenDrawerIds] = useState<Set<string>>(new Set());

  const items = Array.isArray(pc.items) ? pc.items : [];

  // Find equipped items per slot
  const equipped: Record<string, { item: any; idx: number }> = {};
  items.forEach((item: any, idx: number) => {
    if (item.isEquipped && item.slot && SLOTS[item.slot]) {
      equipped[item.slot] = { item, idx };
    }
  });

  const slotless = items.filter((item: any) => item.isEquipped && (!item.slot || item.slot === 'slotless'));

  const handleUnequipIdx = (idx: number) => {
    CombatState.togglePCItemEquip(idx);
  };

  const handleAddPCItem = () => {
    CombatState.addPCItem();
  };

  const toggleDrawer = (id: string) => {
    const next = new Set(openDrawerIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenDrawerIds(next);
  };

  const handleItemNameChange = (idx: number, name: string) => {
    CombatState.updatePCItem(idx, 'name', name);
  };

  const handleItemSlotChange = (idx: number, slot: string, item: any) => {
    if (item.isEquipped) {
      CombatState.togglePCItemEquip(idx);
      CombatState.updatePCItem(idx, 'slot', slot);
      CombatState.togglePCItemEquip(idx);
    } else {
      CombatState.updatePCItem(idx, 'slot', slot);
    }
  };

  const handleItemEffectTypeChange = (idx: number, effIdx: number, type: string) => {
    let defTarget = 'str';
    if (type === 'save') defTarget = 'fort';
    else if (type === 'ac') defTarget = 'deflection';
    else if (type === 'speed') defTarget = 'speed';

    CombatState.updatePCItemEffect(idx, effIdx, 'type', type);
    CombatState.updatePCItemEffect(idx, effIdx, 'target', defTarget);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', height: '100%' }}>
      <BaseCard title="✨ Ausgerüstete magische Gegenstände">
        {/* Grid for 11 slots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {Object.keys(SLOTS).map(slotKey => {
            const slotInfo = SLOTS[slotKey];
            const data = equipped[slotKey];

            return (
              <div
                key={slotKey}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '68px',
                  borderRadius: '4px',
                  padding: '6px',
                  textAlign: 'center',
                  transition: 'all 0.15s ease-out',
                  border: data ? '1px solid #b38600' : '1.5px solid var(--pb)',
                  background: data ? 'rgba(200, 169, 110, 0.08)' : 'rgba(200, 169, 110, 0.04)',
                  boxShadow: data ? 'inset 0 0 10px rgba(179, 134, 0, 0.1)' : 'inset 0 0 8px rgba(200, 169, 110, 0.05)'
                }}
              >
                {data ? (
                  <>
                    <button
                      onClick={() => handleUnequipIdx(data.idx)}
                      style={{ position: 'absolute', top: '3px', right: '5px', border: 'none', background: 'transparent', fontSize: '9px', cursor: 'pointer', color: 'var(--red)', padding: 0 }}
                      title="Ablegen"
                    >
                      ✕
                    </button>
                    <div style={{ fontSize: '7px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", marginBottom: '2px', opacity: 0.8 }}>
                      {slotInfo.name}
                    </div>
                    <div
                      style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', fontWeight: 'bold', color: 'var(--red)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}
                      title={data.item.name}
                    >
                      {data.item.name}
                    </div>
                    {Array.isArray(data.item.effects) && data.item.effects.map((eff: any, effIdx: number) => (
                      <div key={effIdx} style={{ fontSize: '8px', color: 'var(--inkm)', marginTop: '2px' }}>
                        +{eff.value} {getEffectTargetDesc(eff)}
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '14px', color: 'var(--inkl)', marginBottom: '2px', opacity: 0.5 }}>{slotInfo.icon}</div>
                    <div style={{ fontSize: '8px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif" }}>
                      {slotInfo.name}
                    </div>
                    <div style={{ fontSize: '7.5px', color: 'var(--inkm)', fontStyle: 'italic' }}>(Leer)</div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Slotless items section */}
        <div style={{ marginTop: '8px', borderTop: '1px solid var(--pb)', paddingTop: '8px' }}>
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '4px', letterSpacing: '0.5px' }}>
            🎒 Aktiv &amp; Slotfrei (Slotless)
          </div>
          <div style={{ background: 'rgba(200, 169, 110, 0.03)', border: '0.5px solid var(--pb)', borderRadius: '3px', padding: '4px 6px' }}>
            {slotless.length === 0 ? (
              <div style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--inkm)', fontSize: '8px', padding: '6px 0' }}>
                (Keine slotfreien Gegenstände aktiv)
              </div>
            ) : (
              slotless.map((item: any) => {
                const idx = items.indexOf(item);
                return (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', padding: '3px 2px' }}>
                    <span style={{ fontFamily: "'Crimson Text', serif", fontWeight: 'bold', color: 'var(--red)', fontSize: '10px' }}>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {Array.isArray(item.effects) && item.effects.map((eff: any, effIdx: number) => (
                          <span key={effIdx} style={{ fontSize: '8px', color: 'var(--inkm)' }}>
                            +{eff.value} {getEffectTargetDesc(eff)}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleUnequipIdx(idx)}
                        style={{ border: 'none', background: 'transparent', fontSize: '10px', cursor: 'pointer', color: 'var(--red)', padding: '0 2px' }}
                        title="Ablegen"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </BaseCard>

      <BaseCard
        title="🎒 Rucksack &amp; Inventar"
        headerRight={
          <button
            onClick={handleAddPCItem}
            className="btn"
            style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', padding: '1px 5px', height: '15px', lineHeight: 1 }}
          >
            ➕ Gegenstand
          </button>
        }
      >
        {/* Scrollable list of inventory items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '380px', overflowY: 'auto' }}>
          {items.length === 0 ? (
            <div style={{ fontStyle: 'italic', fontSize: '9px', color: 'var(--inkl)', padding: '15px', textAlign: 'center' }}>
              Keine Gegenstände im Rucksack.
            </div>
          ) : (
            items.map((item: any, idx: number) => {
              const isEquipped = !!item.isEquipped;
              const isDrawerOpen = openDrawerIds.has(item.id);

              return (
                <div key={item.id || idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      border: isEquipped ? '1px solid #b38600' : '0.5px solid var(--pb)',
                      borderRadius: '4px',
                      padding: '5px 6px',
                      background: isEquipped ? 'rgba(200, 169, 110, 0.05)' : 'rgba(200, 169, 110, 0.02)',
                      transition: 'all 0.15s ease-out',
                      position: 'relative',
                      marginTop: isEquipped ? '6px' : '0'
                    }}
                  >
                    {isEquipped && (
                      <span style={{ position: 'absolute', top: '-6px', left: '8px', fontSize: '7px', color: '#ffffff', background: '#2a6a2a', borderRadius: '2px', padding: '1px 4px', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', letterSpacing: '0.3px', pointerEvents: 'none', zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
                        Ausgerüstet
                      </span>
                    )}

                    {/* Row 1: Name and Delete */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => handleItemNameChange(idx, e.target.value)}
                        placeholder="z.B. Schutzring"
                        className="cinput"
                        style={{ fontSize: '10px', height: '18px', padding: '0 4px', flex: 1, fontWeight: 'bold', borderColor: 'rgba(200, 169, 110, 0.25)' }}
                      />
                      <button
                        onClick={() => CombatState.deletePCItem(idx)}
                        className="xbtn"
                        style={{ padding: 0, border: 'none', background: 'transparent', fontSize: '11px', cursor: 'pointer', height: '18px', width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}
                        title="Löschen"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Row 2: Slot Selector and Equip Action */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <select
                        value={item.slot || 'slotless'}
                        onChange={(e) => handleItemSlotChange(idx, e.target.value, item)}
                        className="cinput"
                        style={{ fontSize: '8px', padding: '0 2px', height: '18px', flex: 1.5, minWidth: 0 }}
                      >
                        <option value="head">Kopf</option>
                        <option value="face">Gesicht</option>
                        <option value="neck">Hals</option>
                        <option value="shoulders">Schultern</option>
                        <option value="torso">Rumpf</option>
                        <option value="wrists">Handgelenke</option>
                        <option value="hands">Hände</option>
                        <option value="waist">Taille</option>
                        <option value="feet">Füße</option>
                        <option value="ring1">Ring 1</option>
                        <option value="ring2">Ring 2</option>
                        <option value="slotless">Slotfrei</option>
                      </select>
                      <button
                        onClick={() => CombatState.togglePCItemEquip(idx)}
                        className="xbtn"
                        style={{
                          padding: '0 6px',
                          fontSize: '8px',
                          fontWeight: 'bold',
                          height: '18px',
                          lineHeight: '16px',
                          borderRadius: '2px',
                          borderColor: isEquipped ? '#b38600' : 'var(--pb)',
                          color: isEquipped ? '#b38600' : 'var(--ink)',
                          background: isEquipped ? 'rgba(200, 169, 110, 0.08)' : 'transparent'
                        }}
                        title={isEquipped ? 'Gegenstand ablegen' : 'Gegenstand anlegen'}
                      >
                        {isEquipped ? 'Ablegen' : 'Anlegen'}
                      </button>
                      <button
                        onClick={() => toggleDrawer(item.id)}
                        className="xbtn"
                        style={{ padding: 0, border: 'none', background: 'transparent', fontSize: '11px', cursor: 'pointer', height: '18px', width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--inkm)' }}
                        title="Optionen"
                      >
                        ⚙️
                      </button>
                    </div>
                  </div>

                  {/* Drawer for details */}
                  {isDrawerOpen && (
                    <div
                      style={{
                        display: 'flex',
                        background: 'rgba(200,169,110,0.02)',
                        border: '0.5px solid rgba(200, 169, 110, 0.2)',
                        borderTop: 'none',
                        padding: '4px 6px',
                        fontSize: '9px',
                        marginTop: '-2px',
                        marginBottom: '2px',
                        borderRadius: '0 0 3px 3px',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                        {Array.isArray(item.effects) && item.effects.map((eff: any, effIdx: number) => {
                          return (
                            <div key={effIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                              <select
                                value={eff.type || 'attribute'}
                                onChange={(e) => handleItemEffectTypeChange(idx, effIdx, e.target.value)}
                                className="cinput"
                                style={{ fontSize: '8px', height: '18px', flex: 1.2 }}
                              >
                                <option value="attribute">Attribut</option>
                                <option value="save">Rettungswurf</option>
                                <option value="ac">AC/RK-Bonus</option>
                                <option value="speed">Geschwindigkeit</option>
                              </select>

                              <select
                                value={eff.target || 'str'}
                                onChange={(e) => CombatState.updatePCItemEffect(idx, effIdx, 'target', e.target.value)}
                                disabled={eff.type === 'speed'}
                                className="cinput"
                                style={{ fontSize: '8px', height: '18px', flex: 1.5 }}
                              >
                                {eff.type === 'attribute' && (
                                  <>
                                    <option value="str">Stärke (STR)</option>
                                    <option value="dex">Geschick (DEX)</option>
                                    <option value="con">Konstitution (CON)</option>
                                    <option value="int">Intelligenz (INT)</option>
                                    <option value="wis">Weisheit (WIS)</option>
                                    <option value="cha">Charisma (CHA)</option>
                                  </>
                                )}
                                {eff.type === 'save' && (
                                  <>
                                    <option value="fort">Zähigkeit</option>
                                    <option value="ref">Reflex</option>
                                    <option value="wil">Wille</option>
                                    <option value="all">Alle Rettungswürfe</option>
                                  </>
                                )}
                                {eff.type === 'ac' && (
                                  <>
                                    <option value="deflection">Ablenkung (Deflection)</option>
                                    <option value="natural">Natürliche Rüstung</option>
                                    <option value="armor">Rüstung</option>
                                  </>
                                )}
                                {eff.type === 'speed' && (
                                  <option value="speed">Bewegung</option>
                                )}
                              </select>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '1px', flexShrink: 0 }}>
                                <span style={{ fontSize: '8px', color: 'var(--inkm)' }}>+</span>
                                <input
                                  type="number"
                                  value={eff.value}
                                  onChange={(e) => CombatState.updatePCItemEffect(idx, effIdx, 'value', parseInt(e.target.value) || 0)}
                                  className="cinput"
                                  style={{ fontSize: '8px', height: '18px', width: '24px', padding: 0, textAlign: 'center' }}
                                />
                              </div>

                              <button
                                onClick={() => CombatState.deletePCItemEffect(idx, effIdx)}
                                className="xbtn"
                                style={{ padding: 0, border: 'none', background: 'transparent', fontSize: '10px', cursor: 'pointer', height: '16px', width: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}
                                title="Effekt löschen"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}

                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '2px' }}>
                          <button
                            onClick={() => CombatState.addPCItemEffect(idx)}
                            className="btn"
                            style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '7.5px', padding: '1px 5px', height: '14px', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '2px' }}
                          >
                            ➕ Effekt
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </BaseCard>
    </div>
  );
};
