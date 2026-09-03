/**
 * @module    PCSpellCompendium
 * @summary   Renders the spell compendium (right column): search function, level and class filtering, details display and "Learn" action for the spellbook.
 * @exports   PCSpellCompendium
 * @reads     pc.classes, pc.learnedSpells, pc.customSpells, pc.wizardProhibited1, pc.wizardProhibited2
 * @stateOps  updatePCBatch
 * @depends   React, @core/state.js, @core/spells.js, @core/rules.js, @core/ui/components/dialogs.js
 */

import React, { useState, useMemo } from 'react';
import { CombatState } from '@core/state.js';
import { getEligibleSpellLevelsForPC, isSpellEligibleForPC, getAllCompendiumSpells, validateSpellLearnEligibility } from '@core/rules.js';
import { showCustomConfirm, showCustomAlert, showSpellDetailsDialog, showSpellCreatorWizard } from '@core/ui/components/dialogs.js';
import { findSpell } from './PCSpellbookTab';

interface PCSpellCompendiumProps {
  pc: any;
}

export const PCSpellCompendium: React.FC<PCSpellCompendiumProps> = ({ pc }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [filterClassAndLevel, setFilterClassAndLevel] = useState(true);
  const [visibleLimit, setVisibleLimit] = useState(30);

  React.useEffect(() => {
    setVisibleLimit(30);
  }, [searchQuery, levelFilter, sourceFilter, filterClassAndLevel]);

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const isCaster = hasClasses && pc.classes.some((c: any) =>
    ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger', 'duskblade', 'beguiler', 'assassin'].includes(c.classType)
  );

  const eligibleLevels = useMemo<number[]>(() => {
    if (!filterClassAndLevel && isCaster) {
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    }
    return getEligibleSpellLevelsForPC(pc);
  }, [pc, filterClassAndLevel, isCaster]);

  const allSpells = useMemo(() => {
    return getAllCompendiumSpells(pc) as any[];
  }, [pc]);

  const filteredSpells = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const showAll = !filterClassAndLevel;

    const list = allSpells.filter(s => {
      const matchName = s.nameDe.toLowerCase().includes(q) || (s.nameEn && s.nameEn.toLowerCase().includes(q));
      const matchLevel = levelFilter === 'all' || String(s.level) === levelFilter;
      const matchClass = showAll || !isCaster || isSpellEligibleForPC(s, pc);
      const matchSource = sourceFilter === 'all' || s.source === sourceFilter;
      return matchName && matchLevel && matchClass && matchSource;
    });

    list.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      const nameA = a.nameEn || a.nameDe || '';
      const nameB = b.nameEn || b.nameDe || '';
      return nameA.localeCompare(nameB);
    });

    return list;
  }, [allSpells, searchQuery, levelFilter, sourceFilter, filterClassAndLevel, isCaster, pc]);

  const handleLearnSpell = (key: string) => {
    const spell = findSpell(pc, key);
    if (spell) {
      const validation = validateSpellLearnEligibility(pc, spell, (k: string) => findSpell(pc, k));
      if (!validation.allowed) {
        showCustomAlert(validation.title || "Spell Not Eligible", validation.reason || "You cannot learn this spell.");
        return;
      }
    }

    CombatState.updatePCBatch((freshPc: any) => {
      if (!Array.isArray(freshPc.learnedSpells)) freshPc.learnedSpells = [];
      if (!freshPc.learnedSpells.includes(key)) {
        freshPc.learnedSpells.push(key);
      }
    });
  };

  const handleDeleteCustomSpell = (key: string) => {
    const spell = findSpell(pc, key);
    if (!spell) return;

    showCustomConfirm("Delete Spell?", `Do you want to permanently delete your custom spell "${spell.nameEn || spell.nameDe}" from the database?`, () => {
      CombatState.updatePCBatch((freshPc: any) => {
        if (Array.isArray(freshPc.customSpells)) {
          freshPc.customSpells = freshPc.customSpells.filter((s: any) => s.id !== key);
        }
        if (Array.isArray(freshPc.learnedSpells)) {
          freshPc.learnedSpells = freshPc.learnedSpells.filter((k: string) => k !== key);
        }
      });
    });
  };

  const handleOpenCreatorWizard = () => {
    showSpellCreatorWizard(pc);
  };

  const handleShowDetails = (s: any) => {
    showSpellDetailsDialog(s, s.id, pc);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 40) {
      setVisibleLimit(prev => Math.min(prev + 30, filteredSpells.length));
    }
  };

  const learnedSpellsSet = new Set(Array.isArray(pc.learnedSpells) ? pc.learnedSpells : []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginBottom: '4px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search spell..."
          className="cinput comp-search-input"
          style={{ flex: 1, fontSize: '9px', height: '18px', padding: '0 4px' }}
        />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="cinput comp-level-select"
          style={{ width: '50px', fontSize: '9px', height: '18px', padding: 0, outline: 'none', cursor: 'pointer' }}
        >
          <option value="all">Levels</option>
          {eligibleLevels.map(i => (
            <option key={i} value={String(i)}>Lvl {i}</option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="cinput comp-source-select"
          style={{ width: '55px', fontSize: '9px', height: '18px', padding: 0, outline: 'none', cursor: 'pointer' }}
        >
          <option value="all">Books</option>
          <option value="phb">PHB</option>
          <option value="phb2">PHB2</option>
          <option value="ca">CA</option>
          <option value="cs">CS</option>
        </select>
        <button
          onClick={handleOpenCreatorWizard}
          className="btn btn-p wizard-open-btn"
          style={{ fontSize: '9px', padding: '2px 6px', height: '18px', lineHeight: '12px', fontFamily: 'var(--font-title)', cursor: 'pointer' }}
        >
          ✦ Create
        </button>
      </div>

      {isCaster && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', padding: '0 2px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: 'var(--inkl)', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              className="comp-filter-class-chk"
              checked={filterClassAndLevel}
              onChange={(e) => setFilterClassAndLevel(e.target.checked)}
              style={{ width: '10px', height: '10px', cursor: 'pointer', margin: 0 }}
            />
            <span>Only show spells matching my class &amp; level</span>
          </label>
        </div>
      )}

      {/* Spells List */}
      <div
        onScroll={handleScroll}
        style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px', overflowY: 'auto', paddingRight: '2px' }}
        className="pc-scroll-compendium"
      >
        {filteredSpells.length === 0 ? (
          <div style={{ fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '35px 0', background: 'rgba(0,0,0,0.01)', border: '0.5px dashed rgba(200, 169, 110, 0.2)', borderRadius: '2px' }}>
            No matching spells found in the compendium.
          </div>
        ) : (
          filteredSpells.slice(0, visibleLimit).map(s => {
            const isLearned = learnedSpellsSet.has(s.id);
            const isCustom = String(s.id).startsWith('custom_');
            const isEligible = isSpellEligibleForPC(s, pc);

            return (
              <div key={s.id} className="compendium-spell-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.25)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderRadius: '2px', padding: '3px 5px', fontSize: '9px' }}>
                <div onClick={() => handleShowDetails(s)} style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', flex: 1 }}>
                  <span style={{ fontWeight: 600, color: 'var(--red)', fontFamily: 'var(--font-body)', fontSize: '10px' }}>
                    📜 {s.nameEn || s.nameDe} <span style={{ fontSize: '8.5px', fontWeight: 'normal', color: 'var(--inkl)', fontStyle: 'italic' }}>Level {s.level} · {s.school}</span>
                  </span>
                  {s.nameEn && s.nameEn !== s.nameDe && (
                    <span style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic', paddingLeft: '12px', marginTop: '-1px' }}>
                      {s.nameDe}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '2.5px', alignItems: 'center' }}>
                  {isLearned ? (
                    <span style={{ fontSize: '8px', color: '#1a5c1a', fontWeight: 'bold', padding: '1px 4px' }}>In Book ✓</span>
                  ) : (
                    <button
                      onClick={() => handleLearnSpell(s.id)}
                      className="btn learn-spell-btn"
                      style={{
                        fontSize: '7.5px',
                        padding: '1px 4px',
                        borderColor: isEligible ? '#c8a96e' : 'rgba(160, 140, 110, 0.4)',
                        color: isEligible ? '#c8a96e' : 'var(--inkl)',
                        opacity: isEligible ? 1 : 0.65,
                        fontWeight: 'bold'
                      }}
                      title={isEligible ? "Add to spellbook" : "Not on your class spell list"}
                    >
                      + Book
                    </button>
                  )}
                  {isCustom && (
                    <button
                      onClick={() => handleDeleteCustomSpell(s.id)}
                      className="btn delete-custom-spell-btn"
                      style={{ fontSize: '8px', padding: '1px 3px', borderColor: 'transparent', color: 'var(--inkl)', cursor: 'pointer' }}
                      title="Permanently delete this custom spell"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
