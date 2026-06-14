/**
 * @module    PCSpellCompendium
 * @summary   Rendert das Zauberkompendium (rechte Spalte): Suchfunktion, Stufen- und Klassenfilterung, Details-Anzeige und "Lernen"-Aktion für das Zauberbuch.
 * @exports   PCSpellCompendium
 * @reads     pc.classes, pc.learnedSpells, pc.customSpells, pc.wizardProhibited1, pc.wizardProhibited2
 * @stateOps  updatePCBatch
 * @depends   React, @core/state.js, @core/spells.js, @core/rules.js, @core/ui/components/player/PCCompendiumTab.js, @core/ui/components/player/PCSpellDialogs.js, @core/ui/components/dialogs.js
 */

import React, { useState, useMemo } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { CombatSpells, getSpellSchoolCode, getSchoolCodeFromInput, getSchoolLabel } from '@core/spells.js';
// @ts-ignore
import { CombatRules, getEligibleSpellLevelsForPC, isSpellEligibleForPC, getAllCompendiumSpells } from '@core/rules.js';
// @ts-ignore
import { showCustomConfirm, showCustomAlert } from '@core/ui/components/dialogs.js';
// @ts-ignore
import { showSpellDetailsDialog, showSpellCreatorWizard } from '@core/ui/components/player/PCSpellDialogs.js';
import { findSpell } from './PCSpellbookTab';


interface PCSpellCompendiumProps {
  pc: any;
}

export const PCSpellCompendium: React.FC<PCSpellCompendiumProps> = ({ pc }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [filterClassAndLevel, setFilterClassAndLevel] = useState(true);

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const isCaster = hasClasses && pc.classes.some((c: any) => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger'].includes(c.classType));

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
      return matchName && matchLevel && matchClass;
    });

    list.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return (a.nameDe || '').localeCompare(b.nameDe || '');
    });

    return list;
  }, [allSpells, searchQuery, levelFilter, filterClassAndLevel, isCaster, pc]);

  const handleLearnSpell = (key: string) => {
    const spell = findSpell(pc, key);
    if (spell) {
      const isWizard = pc.classes && pc.classes.some((c: any) => c.classType === 'wizard');
      if (isWizard) {
        const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);
        if (schoolCode && schoolCode !== 'univ') {
          const prob1 = getSchoolCodeFromInput(pc.wizardProhibited1);
          const prob2 = getSchoolCodeFromInput(pc.wizardProhibited2);
          if (schoolCode === prob1 || schoolCode === prob2) {
            showCustomAlert(
              "Bannschule",
              `Du kannst den Zauber "${spell.nameDe}" nicht lernen, da er zur Bannschule "${getSchoolLabel(schoolCode)}" gehört!`
            );
            return;
          }
        }
      }
      // Check spells known limit (Bug #8)
      const check = CombatRules.checkSpellKnownLimit(pc, spell, (k: string) => findSpell(pc, k));
      if (!check.success) {
        showCustomAlert("Zauberlimit überschritten", check.error || "Du kannst keine weiteren bekannten Zauber dieses Grades lernen.");
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

    showCustomConfirm("Zauber löschen?", `Möchtest du deinen eigenen Zauber "${spell.nameDe}" unwiderruflich aus der Datenbank löschen?`, () => {
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

  const learnedSpellsSet = new Set(Array.isArray(pc.learnedSpells) ? pc.learnedSpells : []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginBottom: '4px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Zauber suchen..."
          className="cinput comp-search-input"
          style={{ flex: 1, fontSize: '9px', height: '18px', padding: '0 4px' }}
        />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="cinput comp-level-select"
          style={{ width: '60px', fontSize: '9px', height: '18px', padding: 0, outline: 'none', cursor: 'pointer' }}
        >
          <option value="all">Alle</option>
          {eligibleLevels.map(i => (
            <option key={i} value={String(i)}>Grad {i}</option>
          ))}
        </select>
        <button
          onClick={handleOpenCreatorWizard}
          className="btn btn-p wizard-open-btn"
          style={{ fontSize: '9px', padding: '2px 6px', height: '18px', lineHeight: '12px', fontFamily: "'IM Fell English SC', serif", cursor: 'pointer' }}
        >
          ✦ Erstellen
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
            <span>Nur passende Zauber für meine Klasse &amp; Stufe anzeigen</span>
          </label>
        </div>
      )}

      {/* Spells List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px', overflowY: 'auto', paddingRight: '2px' }} className="pc-scroll-compendium">
        {filteredSpells.length === 0 ? (
          <div style={{ fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '35px 0', background: 'rgba(0,0,0,0.01)', border: '0.5px dashed rgba(200, 169, 110, 0.2)', borderRadius: '2px' }}>
            Keine passenden Zauber im Kompendium gefunden.
          </div>
        ) : (
          filteredSpells.map(s => {
            const isLearned = learnedSpellsSet.has(s.id);
            const isCustom = String(s.id).startsWith('custom_');

            return (
              <div key={s.id} className="compendium-spell-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.25)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderRadius: '2px', padding: '3px 5px', fontSize: '9px' }}>
                <div onClick={() => handleShowDetails(s)} style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', flex: 1 }}>
                  <span style={{ fontWeight: 600, color: 'var(--red)', fontFamily: "'Crimson Text', serif", fontSize: '10px' }}>
                    📜 {s.nameDe} <span style={{ fontSize: '8.5px', fontWeight: 'normal', color: 'var(--inkl)', fontStyle: 'italic' }}>Grad {s.level} · {s.school}</span>
                  </span>
                  {s.nameEn && (
                    <span style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic', paddingLeft: '12px', marginTop: '-1px' }}>
                      {s.nameEn}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '2.5px', alignItems: 'center' }}>
                  {isLearned ? (
                    <span style={{ fontSize: '8px', color: '#1a5c1a', fontWeight: 'bold', padding: '1px 4px' }}>Im Buch ✓</span>
                  ) : (
                    <button
                      onClick={() => handleLearnSpell(s.id)}
                      className="btn learn-spell-btn"
                      style={{ fontSize: '7.5px', padding: '1px 4px', borderColor: '#c8a96e', color: '#c8a96e', fontWeight: 'bold' }}
                    >
                      + Buch
                    </button>
                  )}
                  {isCustom && (
                    <button
                      onClick={() => handleDeleteCustomSpell(s.id)}
                      className="btn delete-custom-spell-btn"
                      style={{ fontSize: '8px', padding: '1px 3px', borderColor: 'transparent', color: 'var(--inkl)', cursor: 'pointer' }}
                      title="Diesen eigenen Zauber unwiderruflich löschen"
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
