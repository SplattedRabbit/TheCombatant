/**
 * @module    BuffSearchSection
 * @summary   Rulebook buff autocomplete search & custom buff builder for PCBuffsTab.
 */

import React, { useState, useRef, useEffect } from 'react';
import { CombatSpells } from '@core/spells.js';
import { CLASS_BUFFS } from '@core/data/class-buffs-data.js';
import { isBuffEligible, checkBuffConflict } from '@core/rules/BuffRules.js';
import { showCustomAlert, showCustomConfirm } from '@core/ui/components/dialogs.js';
import { CombatState } from '@core/state.js';

interface BuffSearchSectionProps {
  pc: any;
  onSelectSearchResult: (m: any) => void;
}

export const BuffSearchSection: React.FC<BuffSearchSectionProps> = ({
  pc,
  onSelectSearchResult,
}) => {
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
    onSelectSearchResult(m);
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
    <>
      {/* Autocomplete Buff Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', letterSpacing: '0.5px', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
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
                      fontFamily: 'var(--font-body)',
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
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
          Create Custom Buff / Aura
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.6fr', gap: '3px', alignItems: 'end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', textAlign: 'left' }}>
            <label style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: 'var(--font-body)', lineHeight: 1 }}>Name</label>
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
            <label style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: 'var(--font-body)', lineHeight: 1 }}>Target Stat</label>
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
            <label style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: 'var(--font-body)', lineHeight: 1 }}>Value</label>
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
            <label style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: 'var(--font-body)', lineHeight: 1 }}>Bonus Type</label>
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
              fontFamily: 'var(--font-title)',
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
    </>
  );
};
