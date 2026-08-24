/**
 * @module    PCBuffsTab
 * @summary   Renders the buff manager tab with the list of active buffs, quick select, rulebook search, and the custom buff builder.
 * @exports   PCBuffsTab
 * @reads     pc.activeBuffs, pc.quickBuffs, pc.classes, pc.learnedSpells, pc.spellSlots, pc.preparedSpells
 * @stateOps  updatePCBatch, activateBuffByKey, checkBuffConflict, showCustomConfirm, showCustomAlert
 * @depends   React, @core/state.js, @core/spells.js, @core/data/class-buffs-data.js, @core/rules/BuffRules.js, @core/ui/components/dialogs.js
 */

import React, { useState, useEffect, useRef } from 'react';
import { CombatState } from '@core/state.js';
import { CombatSpells } from '@core/spells.js';
import { CLASS_BUFFS } from '@core/data/class-buffs-data.js';
import { activateBuffByKey, isBuffEligible, isBuffSuppressed, checkBuffConflict } from '@core/rules/BuffRules.js';
import { getAvailableEquipmentBuffs } from '@core/rules.js';
import { showCustomConfirm, showCustomAlert, showCustomPrompt } from '@core/ui/components/dialogs.js';
import { uiRegistry } from '@core/ui/ui-shared.js';

const showBuffDetailsDialog = (...args: any[]) =>
  (window as any).__REACT_DIALOG_BRIDGE__?.showBuffDetailsDialog?.(...args);


interface PCBuffsTabProps {
  pc: any;
}

export const PCBuffsTab: React.FC<PCBuffsTabProps> = ({ pc }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Custom Buff state
  const [customName, setCustomName] = useState('');
  const [customTarget, setCustomTarget] = useState('atk');
  const [customType, setCustomType] = useState('untyped');
  const [customValue, setCustomValue] = useState(1);

  // Close search results when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(e.target as Node) && !(e.target as HTMLElement).closest('#buff-search-input')) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const activeBuffs = Array.isArray(pc.activeBuffs) ? pc.activeBuffs : [];
  const quickBuffs = Array.isArray(pc.quickBuffs) ? pc.quickBuffs : [];

  const handleRemoveActiveBuff = (idx: number) => {
    CombatState.updatePCBatch((freshPc: any) => {
      if (Array.isArray(freshPc.activeBuffs)) {
        freshPc.activeBuffs.splice(idx, 1);
      }
    });
  };

  const handleActiveBuffRoundsChange = (idx: number, rounds: number) => {
    CombatState.updatePCBatch((freshPc: any) => {
      if (Array.isArray(freshPc.activeBuffs) && freshPc.activeBuffs[idx]) {
        if (rounds <= 0) {
          freshPc.activeBuffs.splice(idx, 1);
        } else {
          freshPc.activeBuffs[idx].durationRemainingRounds = rounds;
        }
      }
    });
  };

  const handleBuffDetailClick = (idx: number) => {
    const buff = activeBuffs[idx];
    if (!buff) return;
    showBuffDetailsDialog(pc, buff.spellKey, false, idx);
  };

  const handleQuickBuffClick = (qb: any) => {
    const isCurrentlyActive = activeBuffs.some((b: any) => b.spellKey === qb.key);
    if (isCurrentlyActive) {
      CombatState.updatePCBatch((freshPc: any) => {
        if (Array.isArray(freshPc.activeBuffs)) {
          freshPc.activeBuffs = freshPc.activeBuffs.filter((b: any) => b.spellKey !== qb.key);
        }
      });
    } else {
      activateBuffByKey(pc, qb.key, qb.isClass, {
        showCustomConfirm,
        showCustomAlert,
        showCustomPrompt: (title: string, msg: string, defaultValue: string, onConfirm: (val: string) => void) => {
          showCustomPrompt(title, msg, defaultValue, "OK", onConfirm);
        },
        renderPlayerScreen: () => {
          if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
            uiRegistry.renderPlayerScreen();
          }
        }
      });
    }
  };

  const handleRemoveQuickBuff = (key: string) => {
    CombatState.updatePCBatch((freshPc: any) => {
      if (Array.isArray(freshPc.quickBuffs)) {
        freshPc.quickBuffs = freshPc.quickBuffs.filter((b: any) => b.key !== key);
      }
    });
  };

  const handleEquipmentBuffClick = (eb: any) => {
    const isCurrentlyActive = activeBuffs.some((b: any) => b.spellKey === eb.buffKey);
    if (isCurrentlyActive) {
      CombatState.updatePCBatch((freshPc: any) => {
        if (Array.isArray(freshPc.activeBuffs)) {
          freshPc.activeBuffs = freshPc.activeBuffs.filter((b: any) => b.spellKey !== eb.buffKey);
        }
      });
    } else {
      if (eb.availableUses <= 0) {
        showCustomAlert("No Uses Remaining", `You have no charges or daily uses remaining on ${eb.itemName}.`, "Got it", "⚠️");
        return;
      }
      activateBuffByKey(pc, eb.buffKey, false, {
        showCustomConfirm,
        showCustomAlert,
        showCustomPrompt: (title: string, msg: string, defaultValue: string, onConfirm: (val: string) => void) => {
          showCustomPrompt(title, msg, defaultValue, "OK", onConfirm);
        },
        renderPlayerScreen: () => {
          if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
            uiRegistry.renderPlayerScreen();
          }
        }
      });
      if (eb.costType === 'charges' || eb.costType === 'daily') {
        CombatState.usePCItemCharge(eb.itemIdx, eb.cost || 1);
      }
    }
  };

  // Search Results calculation
  const getSearchResults = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const matchedClassBuffs = CLASS_BUFFS.filter((b: any) =>
      (b.name.toLowerCase().includes(q) || b.key.toLowerCase().includes(q)) &&
      isBuffEligible(pc, b.key, true)
    ).map((b: any) => ({
      key: b.key,
      name: b.name,
      school: b.school || 'Class',
      duration: b.duration || '—',
      isClass: true
    }));

    const matchedSpellBuffs: any[] = [];
    if (CombatSpells.REGISTRY) {
      for (const key of Object.keys(CombatSpells.REGISTRY)) {
        const spell = CombatSpells.REGISTRY[key];
        if (spell && Array.isArray(spell.effects) && isBuffEligible(pc, key, false)) {
          const nameDe = (spell.nameDe || '').toLowerCase();
          const nameEn = (spell.nameEn || '').toLowerCase();
          if (nameDe.includes(q) || nameEn.includes(q) || key.toLowerCase().includes(q)) {
            matchedSpellBuffs.push({
              key: key,
              name: spell.nameEn || spell.nameDe || key,
              school: spell.school || 'Spell',
              duration: spell.duration || '—',
              isClass: false
            });
          }
        }
      }
    }

    return [...matchedClassBuffs, ...matchedSpellBuffs];
  };

  const handleSearchResultClick = (m: any) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    showBuffDetailsDialog(pc, m.key, m.isClass);
  };

  const handleAddCustomBuff = () => {
    const name = customName.trim();
    if (!name) {
      showCustomAlert("Invalid Input", "Please enter a name for the custom buff.", "Got it", "⚠️");
      return;
    }

    const performCustomAdd = () => {
      CombatState.updatePCBatch((freshPc: any) => {
        if (!Array.isArray(freshPc.activeBuffs)) freshPc.activeBuffs = [];
        freshPc.activeBuffs.push({
          id: 'custom_' + Date.now(),
          name: name,
          effects: [{ target: customTarget, value: customValue, type: customType, source: name }]
        });
      });
      setCustomName('');
    };

    const conflict = checkBuffConflict(pc, null, [{ target: customTarget, value: customValue, type: customType, source: name }]);
    if (conflict.status === 'suppressed') {
      showCustomConfirm(
        "Stacking Conflict",
        `A stronger or equivalent buff (<strong>${conflict.conflictingBuffName}</strong>) is already active.<br><br>Your new buff <strong>${name}</strong> (+${customValue} to ${conflict.targetLabel}) has the same bonus type and would therefore have <strong>no effect</strong>.<br><br>Do you still want to activate the buff?`,
        () => { performCustomAdd(); }
      );
    } else if (conflict.status === 'overrides') {
      performCustomAdd();
      showCustomAlert(
        "Buff Overridden",
        `Activating <strong>${name}</strong> (+${customValue}) will override the weaker active buff <strong>${conflict.conflictingBuffName}</strong> (+${conflict.activeValue}) on <strong>${conflict.targetLabel}</strong>.<br><br>Your net stats will increase by <strong>+${customValue - conflict.activeValue}</strong>.`,
        "Got it",
        "✨"
      );
    } else {
      performCustomAdd();
    }
  };

  const searchResults = getSearchResults();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* List of active buffs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', letterSpacing: '0.5px', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
          Active Buffs &amp; Auras
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '120px', overflowY: 'auto', paddingRight: '2px', boxSizing: 'border-box' }}>
          {activeBuffs.length === 0 ? (
            <div style={{ width: '100%', fontStyle: 'italic', color: 'var(--inkl)', fontSize: '9px', textAlign: 'center', padding: '10px 0', background: 'rgba(0,0,0,0.02)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
              No active buffs or auras.
            </div>
          ) : (
            activeBuffs.map((buff: any, idx: number) => {
              let displayName = buff.name;
              let effectsList: any[] = [];

              if (buff.spellKey) {
                const classBuff = CLASS_BUFFS.find((b: any) => b.key === buff.spellKey);
                if (classBuff) {
                  displayName = classBuff.name;
                  effectsList = classBuff.effects || [];
                } else {
                  const spell = CombatSpells.REGISTRY?.[buff.spellKey];
                  if (spell) {
                    displayName = spell.nameEn || spell.nameDe || displayName || buff.spellKey;
                    effectsList = buff.effects || spell.effects || [];
                  }
                }
              } else if (Array.isArray(buff.effects)) {
                effectsList = buff.effects;
              }

              const shortEffectsSummary = effectsList.map((eff: any) => {
                const sign = eff.value >= 0 ? '+' : '';
                const targetShort: Record<string, string> = {
                  atk: 'ATK',
                  dmg: 'DMG',
                  ac: 'AC',
                  acArmor: 'AC',
                  acShield: 'AC',
                  acNatural: 'AC',
                  acDeflection: 'AC',
                  acDodge: 'AC',
                  str: 'STR',
                  dex: 'DEX',
                  con: 'CON',
                  int: 'INT',
                  wis: 'WIS',
                  cha: 'CHA',
                  za: 'Fort',
                  ref: 'Ref',
                  wil: 'Will',
                  baseZa: 'Fort',
                  baseRef: 'Ref',
                  baseWil: 'Will'
                };
                const t = targetShort[eff.target] || eff.target;
                return `${sign}${eff.value} ${t}`;
              }).join(', ');

              const isSuppressed = isBuffSuppressed(pc, buff);
              const warningBadge = isSuppressed ? ' ⚠️' : '';

              return (
                <div
                  key={buff.id || idx}
                  className="active-buff-pill"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: '12px',
                    padding: '2px 6px',
                    gap: '4px',
                    boxSizing: 'border-box',
                    marginBottom: '2px',
                    background: isSuppressed ? 'rgba(200, 169, 110, 0.02)' : 'rgba(200, 169, 110, 0.05)',
                    border: isSuppressed ? '0.5px dashed rgba(139, 26, 26, 0.45)' : '0.5px solid var(--pb)',
                    opacity: isSuppressed ? 0.65 : 1,
                    filter: isSuppressed ? 'grayscale(30%)' : undefined
                  }}
                >
                  <span
                    onClick={() => handleBuffDetailClick(idx)}
                    className="info-buff-trigger"
                    style={{
                      fontSize: '9px',
                      fontFamily: "'Crimson Text', serif",
                      fontWeight: 'bold',
                      color: 'var(--red)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                    title="Show D&D 3.5e RAW rule explanation"
                  >
                    ✨ {displayName}{warningBadge}
                    {shortEffectsSummary ? (
                      <span style={{ fontSize: '8px', color: 'var(--inkl)', opacity: 0.85, fontWeight: 'normal' }}>
                        {' '}({shortEffectsSummary})
                      </span>
                    ) : null}
                    <span style={{ fontSize: '8px', opacity: 0.75, marginLeft: '1px', color: 'var(--red)' }}>📖</span>
                  </span>
                  {buff.durationRemainingRounds !== undefined && buff.durationRemainingRounds !== null && (
                    <>
                      <input
                        type="number"
                        className="buff-rounds-input"
                        value={buff.durationRemainingRounds}
                        onChange={(e) => handleActiveBuffRoundsChange(idx, parseInt(e.target.value) || 0)}
                        min="0"
                        style={{
                          width: '24px',
                          height: '13px',
                          fontSize: '8px',
                          textAlign: 'center',
                          border: '0.5px solid var(--pb)',
                          borderRadius: '2px',
                          background: 'rgba(0,0,0,0.03)',
                          color: 'var(--red)',
                          fontWeight: 'bold',
                          padding: 0,
                          margin: '0 2px 0 4px'
                        }}
                        title="Remaining rounds (0 to remove)"
                      />
                      <span style={{ fontSize: '8px', color: 'var(--inkl)', marginRight: '2px' }}>Rds</span>
                    </>
                  )}
                  <button
                    onClick={() => handleRemoveActiveBuff(idx)}
                    className="delete-buff-btn"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--inkl)',
                      fontSize: '9px',
                      cursor: 'pointer',
                      padding: '0 2px',
                      lineHeight: 1,
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                    title="Remove buff"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Equipped Magic Items Quick Buffs */}
      {(() => {
        const equipmentBuffs = getAvailableEquipmentBuffs(pc);
        if (!equipmentBuffs || equipmentBuffs.length === 0) return null;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', letterSpacing: '0.5px', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
              ⚡ Equipped Magic Items (Quick Buffs)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
              {equipmentBuffs.map((eb: any) => {
                const isActive = activeBuffs.some((b: any) => b.spellKey === eb.buffKey);
                const usesLabel = eb.charges ? `${eb.charges.current}/${eb.charges.max}` : (eb.dailyUses ? `${eb.dailyUses.current}/${eb.dailyUses.max}` : '∞');
                const isOutOfUses = eb.availableUses <= 0;

                return (
                  <button
                    key={`${eb.itemId || eb.itemIdx}_${eb.buffKey}`}
                    type="button"
                    onClick={() => handleEquipmentBuffClick(eb)}
                    disabled={!isActive && isOutOfUses}
                    className="quick-buff-btn"
                    style={{
                      width: '100%',
                      fontFamily: "'IM Fell English SC', serif",
                      fontSize: '9px',
                      padding: '3px 5px',
                      cursor: (!isActive && isOutOfUses) ? 'not-allowed' : 'pointer',
                      border: '1px solid',
                      borderRadius: '2px',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxSizing: 'border-box',
                      ...(isActive
                        ? { background: 'var(--red, #8b1a1a)', color: '#f4e8c1', borderColor: 'var(--red, #8b1a1a)', fontWeight: 'bold' }
                        : (isOutOfUses
                          ? { background: 'rgba(0,0,0,0.03)', color: 'var(--inkl)', borderColor: 'rgba(200,169,110,0.3)', opacity: 0.6 }
                          : { background: 'rgba(200, 169, 110, 0.12)', color: 'var(--ink)', borderColor: 'var(--pb)' }))
                    }}
                    title={`${eb.itemName}: ${eb.description || eb.buffKey}`}
                  >
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {isActive ? '✓ ' : '⚡ '}{eb.itemName}
                    </span>
                    <span style={{ fontSize: '7.5px', background: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.06)', padding: '0 3px', borderRadius: '2px', marginLeft: '4px' }}>
                      {usesLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Quick Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', letterSpacing: '0.5px', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
          Quick Select
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
          {quickBuffs.length === 0 ? (
            <div style={{ gridColumn: 'span 2', fontStyle: 'italic', color: 'var(--inkl)', fontSize: '9px', textAlign: 'center', padding: '12px 0', background: 'rgba(0,0,0,0.01)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
              No quick access slots defined. Use the search to add buffs.
            </div>
          ) : (
            quickBuffs.map((qb: any) => {
              const isActive = activeBuffs.some((b: any) => b.spellKey === qb.key);
              const activeInstance = isActive ? activeBuffs.find((b: any) => b.spellKey === qb.key) : null;
              const isSuppressed = isActive
                ? isBuffSuppressed(pc, activeInstance)
                : (checkBuffConflict(pc, qb.key).status === 'suppressed');

              const checkmark = isActive ? '✓ ' : '';
              const warningBadge = isSuppressed ? ' ⚠️' : '';

              return (
                <div key={qb.key} style={{ position: 'relative', display: 'block', width: '100%' }}>
                  <button
                    onClick={() => handleQuickBuffClick(qb)}
                    className="quick-buff-btn"
                    style={{
                      width: '100%',
                      fontFamily: "'IM Fell English SC', serif",
                      fontSize: '9px',
                      padding: '3px 14px 3px 3px',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderRadius: '2px',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      boxSizing: 'border-box',
                      ...(isActive
                        ? (isSuppressed
                          ? { background: 'rgba(139, 26, 26, 0.15)', color: 'rgba(139, 26, 26, 0.6)', borderColor: 'rgba(139, 26, 26, 0.45)', opacity: 0.7, filter: 'grayscale(40%)', fontWeight: 'bold' }
                          : { background: '#8b1a1a', color: '#f4e8c1', borderColor: '#8b1a1a', fontWeight: 'bold' })
                        : (isSuppressed
                          ? { background: 'rgba(200, 169, 110, 0.03)', color: 'rgba(20, 15, 5, 0.4)', borderColor: 'rgba(200, 169, 110, 0.3)', opacity: 0.5, filter: 'grayscale(60%)' }
                          : { background: 'rgba(200, 169, 110, 0.08)', color: 'var(--ink)', borderColor: 'var(--pb)' }))
                    }}
                    title={`${qb.name}${isSuppressed ? ' (Suppressed by a stronger active buff)' : ''}`}
                  >
                    {checkmark}{qb.name}{warningBadge}
                  </button>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveQuickBuff(qb.key);
                    }}
                    style={{
                      position: 'absolute',
                      right: '4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      color: 'inherit',
                      opacity: 0.55,
                      fontSize: '9px',
                      fontWeight: 'bold',
                      zIndex: 10,
                      padding: '2px',
                      lineHeight: 1,
                      transition: 'opacity 0.15s'
                    }}
                    title="Remove from quick select"
                  >
                    ✕
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Autocomplete Buff Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', letterSpacing: '0.5px', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
          🔍 Search Buff / Aura from Rulebook
        </div>
        <input
          type="text"
          id="buff-search-input"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          placeholder="Enter name (e.g. Heroism, Rage)..."
          className="cinput"
          style={{ height: '18px', fontSize: '9px', padding: '0 3px', boxSizing: 'border-box' }}
          autoComplete="off"
        />

        {isSearchOpen && searchQuery && (
          <div
            ref={searchResultsRef}
            style={{
              position: 'absolute',
              top: '32px',
              left: 0,
              right: 0,
              background: 'var(--p)',
              border: '1px solid var(--pb)',
              borderRadius: '2px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
              maxHeight: '150px',
              overflowY: 'auto',
              zIndex: 2000,
              padding: '2px'
            }}
          >
            {searchResults.length === 0 ? (
              <div style={{ fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic', padding: '4px', textAlign: 'center' }}>
                No matches found in the rulebook.
              </div>
            ) : (
              searchResults.map((m: any) => {
                const conflict = checkBuffConflict(pc, m.key);
                const isSuppressed = conflict.status === 'suppressed';
                const warningBadge = isSuppressed ? ' ⚠️' : '';

                return (
                  <div
                    key={m.key}
                    onClick={() => handleSearchResultClick(m)}
                    style={{
                      padding: '3px 6px',
                      cursor: 'pointer',
                      borderBottom: '0.5px solid rgba(200, 169, 110, 0.15)',
                      fontFamily: "'Crimson Text', serif",
                      fontSize: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: isSuppressed ? 'rgba(20, 15, 5, 0.45)' : 'var(--ink)',
                      opacity: isSuppressed ? 0.65 : 1,
                      filter: isSuppressed ? 'grayscale(50%)' : undefined
                    }}
                  >
                    <span>
                      ✨ <strong>{m.name}</strong>{warningBadge}
                      <div style={{ fontSize: '8px', color: 'var(--inkl)' }}>{m.school} • {m.duration}</div>
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>[Select]</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Custom Buff Builder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '0.5px dashed rgba(200,169,110,0.3)', paddingTop: '6px' }}>
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
          Create Custom Buff / Aura
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.6fr', gap: '3px', alignItems: 'end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
            <label style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: "'Crimson Text', serif", lineHeight: 1 }}>Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Song"
              className="cinput"
              style={{ height: '18px', fontSize: '9px', padding: '0 3px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
            <label style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: "'Crimson Text', serif", lineHeight: 1 }}>Target Stat</label>
            <select
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              className="cinput"
              style={{ height: '18px', fontSize: '9px', padding: 0, boxSizing: 'border-box' }}
            >
              <option value="atk">Attack Roll (ATK)</option>
              <option value="dmg">Damage Roll (DMG)</option>
              <option value="ac">Armor Class (AC)</option>
              <option value="acDodge">Dodge AC</option>
              <option value="acDeflection">Deflection AC</option>
              <option value="acShield">Shield AC</option>
              <option value="acArmor">Armor AC</option>
              <option value="acNatural">Natural Armor AC</option>
              <option value="str">Strength (STR)</option>
              <option value="dex">Dexterity (DEX)</option>
              <option value="con">Constitution (CON)</option>
              <option value="int">Intelligence (INT)</option>
              <option value="wis">Wisdom (WIS)</option>
              <option value="cha">Charisma (CHA)</option>
              <option value="za">Fortitude (Fort)</option>
              <option value="ref">Reflex (Ref)</option>
              <option value="wil">Will (Will)</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
            <label style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: "'Crimson Text', serif", lineHeight: 1 }}>Value</label>
            <input
              type="number"
              value={customValue}
              onChange={(e) => setCustomValue(parseInt(e.target.value) || 0)}
              className="cinput"
              style={{ height: '18px', fontSize: '9px', textAlign: 'center', padding: 0, boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3px', alignItems: 'end', marginTop: '2px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
            <label style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: "'Crimson Text', serif", lineHeight: 1 }}>Bonus Type</label>
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="cinput"
              style={{ height: '18px', fontSize: '9px', padding: 0, boxSizing: 'border-box' }}
            >
              <option value="untyped">Untyped</option>
              <option value="morale">Morale</option>
              <option value="luck">Luck</option>
              <option value="dodge">Dodge</option>
              <option value="enhancement">Enhancement</option>
              <option value="deflection">Deflection</option>
              <option value="armor">Armor</option>
              <option value="shield">Shield</option>
              <option value="natural">Natural</option>
              <option value="insight">Insight</option>
              <option value="sacred">Sacred</option>
              <option value="profane">Profane</option>
            </select>
          </div>
          <button
            onClick={handleAddCustomBuff}
            className="btn btn-p"
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '9px',
              padding: '2px 4px',
              height: '18px',
              cursor: 'pointer',
              boxSizing: 'border-box',
              borderRadius: '2px',
              fontWeight: 'bold',
              lineHeight: '13px'
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

