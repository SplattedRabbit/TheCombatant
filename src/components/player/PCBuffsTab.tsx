/**
 * @module    PCBuffsTab
 * @summary   Rendert den Buff-Manager Tab mit der Liste der aktiven Buffs, der Schnellauswahl, der Suche im Regelwerk und dem Custom Buff Builder.
 * @exports   PCBuffsTab
 * @reads     pc.activeBuffs, pc.quickBuffs, pc.classes, pc.learnedSpells, pc.spellSlots, pc.preparedSpells
 * @stateOps  updatePCBatch, activateBuffByKey, checkBuffConflict, showCustomConfirm, showCustomAlert
 * @depends   React, @core/state.js, @core/spells.js, @core/data/class-buffs-data.js, @core/rules/BuffRules.js, @core/ui/components/dialogs.js
 */

import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { CombatSpells } from '@core/spells.js';
// @ts-ignore
import { CLASS_BUFFS } from '@core/data/class-buffs-data.js';
// @ts-ignore
import { activateBuffByKey, isBuffEligible, isBuffSuppressed, checkBuffConflict } from '@core/rules/BuffRules.js';
// @ts-ignore
import { showCustomConfirm, showCustomAlert, showCustomPrompt } from '@core/ui/components/dialogs.js';
// @ts-ignore
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
      school: b.school || 'Klasse',
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
              name: spell.nameDe || spell.nameEn || key,
              school: spell.school || 'Zauber',
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
      showCustomAlert("Eingabe ungültig", "Bitte gib einen Namen für den eigenen Buff ein.", "Verstanden", "⚠️");
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
        "Stacking-Konflikt",
        `Ein stärkerer oder gleichwertiger Buff (<strong>${conflict.conflictingBuffName}</strong>) ist bereits aktiv.<br><br>Dein neuer Buff <strong>${name}</strong> (+${customValue} auf ${conflict.targetLabel}) hat denselben Bonus-Typ und würde daher <strong>keine Wirkung</strong> zeigen.<br><br>Möchtest du den Buff dennoch aktivieren?`,
        () => { performCustomAdd(); }
      );
    } else if (conflict.status === 'overrides') {
      performCustomAdd();
      showCustomAlert(
        "Buff überlagert",
        `Durch das Aktivieren von <strong>${name}</strong> (+${customValue}) wird der schwächere aktive Buff <strong>${conflict.conflictingBuffName}</strong> (+${conflict.activeValue}) auf <strong>${conflict.targetLabel}</strong> überlagert.<br><br>Deine Werte erhöhen sich netto um <strong>+${customValue - conflict.activeValue}</strong>.`,
        "Verstanden",
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
          Aktive Buffs &amp; Auren
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '120px', overflowY: 'auto', paddingRight: '2px', boxSizing: 'border-box' }}>
          {activeBuffs.length === 0 ? (
            <div style={{ width: '100%', fontStyle: 'italic', color: 'var(--inkl)', fontSize: '9px', textAlign: 'center', padding: '10px 0', background: 'rgba(0,0,0,0.02)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
              Keine aktiven Buffs oder Auren.
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
                    displayName = spell.nameDe || spell.nameEn || displayName || buff.spellKey;
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
                  ac: 'RK',
                  acArmor: 'RK',
                  acShield: 'RK',
                  acNatural: 'RK',
                  acDeflection: 'RK',
                  acDodge: 'RK',
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
                    title="D&D 3.5e RAW Regelerklärung anzeigen"
                  >
                    ✨ {displayName}{warningBadge}
                    <span style={{ fontSize: '8px', color: 'var(--inkl)', opacity: 0.85, fontWeight: 'normal' }}>({shortEffectsSummary})</span>
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
                        title="Verbleibende Runden (0 zum Entfernen)"
                      />
                      <span style={{ fontSize: '8px', color: 'var(--inkl)', marginRight: '2px' }}>Rd.</span>
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
                    title="Buff entfernen"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', letterSpacing: '0.5px', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
          Schnellauswahl
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
          {quickBuffs.length === 0 ? (
            <div style={{ gridColumn: 'span 2', fontStyle: 'italic', color: 'var(--inkl)', fontSize: '9px', textAlign: 'center', padding: '12px 0', background: 'rgba(0,0,0,0.01)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
              Keine Schnellzugriffe definiert. Nutze die Suche, um Buffs hinzuzufügen.
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
                    title={`${qb.name}${isSuppressed ? ' (Unterdrückt durch einen stärkeren aktiven Buff)' : ''}`}
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
                    title="Aus Schnellauswahl entfernen"
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
          🔍 Buff / Aura aus Regelwerk suchen
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
          placeholder="Name eingeben (z. B. Heldenmut, Kampfrausch)..."
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
                Keine Treffer im Regelwerk.
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
                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>[Auswählen]</span>
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
          Eigenen Buff / Aura erstellen
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.6fr', gap: '3px', alignItems: 'end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
            <label style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: "'Crimson Text', serif", lineHeight: 1 }}>Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="z. B. Lied"
              className="cinput"
              style={{ height: '18px', fontSize: '9px', padding: '0 3px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
            <label style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: "'Crimson Text', serif", lineHeight: 1 }}>Zielwert</label>
            <select
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              className="cinput"
              style={{ height: '18px', fontSize: '9px', padding: 0, boxSizing: 'border-box' }}
            >
              <option value="atk">Angriffswurf (ATK)</option>
              <option value="dmg">Schadenswurf (DMG)</option>
              <option value="ac">Rüstungsklasse (AC)</option>
              <option value="acDodge">Ausweich-RK (Dodge)</option>
              <option value="acDeflection">Ablenkung (Deflection)</option>
              <option value="acShield">Schild-RK (Shield)</option>
              <option value="acArmor">Rüstungs-RK (Armor)</option>
              <option value="acNatural">Natürliche Rüstung</option>
              <option value="str">Stärke (STR)</option>
              <option value="dex">Geschick (DEX)</option>
              <option value="con">Konstitution (CON)</option>
              <option value="int">Intelligenz (INT)</option>
              <option value="wis">Weisheit (WIS)</option>
              <option value="cha">Charisma (CHA)</option>
              <option value="za">Zähigkeit (Fort)</option>
              <option value="ref">Reflex (Ref)</option>
              <option value="wil">Willen (Will)</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
            <label style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: "'Crimson Text', serif", lineHeight: 1 }}>Wert</label>
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
            <label style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: "'Crimson Text', serif", lineHeight: 1 }}>Bonustyp</label>
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="cinput"
              style={{ height: '18px', fontSize: '9px', padding: 0, boxSizing: 'border-box' }}
            >
              <option value="untyped">Ohne Typ (Untyped)</option>
              <option value="morale">Moral (Morale)</option>
              <option value="luck">Glück (Luck)</option>
              <option value="dodge">Ausweichen (Dodge)</option>
              <option value="enhancement">Verbesserung (Enhancement)</option>
              <option value="deflection">Ablenkung (Deflection)</option>
              <option value="armor">Rüstung (Armor)</option>
              <option value="shield">Schild (Shield)</option>
              <option value="natural">Natürlich (Natural)</option>
              <option value="insight">Einsicht (Insight)</option>
              <option value="sacred">Heilig (Sacred)</option>
              <option value="profane">Unheilig (Profane)</option>
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
            Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
};
