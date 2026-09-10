/**
 * @module    StepSpells
 * @summary   Step 4 of the Level-Up Wizard: RAW-compliant Spell Selection for Casters.
 */

import React, { useState, useMemo } from 'react';
import { getAllCompendiumSpells } from '@core/rules/RulesSpells.js';
import { LevelUpSpellQuota, getEligibleSpellsForLevelUp } from '../../../../services/levelup/levelUpSpellRules';
import { getSpellSchoolCode, getSchoolLabel } from '@core/spells.js';

export interface StepSpellsProps {
  activePC: any;
  currentConfig: any;
  currentLevelIndex: number;
  targetLevel: number;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
  quota: LevelUpSpellQuota;
}

export const StepSpells: React.FC<StepSpellsProps> = ({
  activePC,
  currentConfig,
  currentLevelIndex,
  targetLevel: _targetLevel,
  updateLevelConfig,
  quota,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [previewSpell, setPreviewSpell] = useState<any | null>(null);

  const chosenSpellKeys: string[] = useMemo(() => {
    return Array.isArray(currentConfig.spells) ? currentConfig.spells : [];
  }, [currentConfig.spells]);

  const allCompendiumSpells = useMemo(() => {
    return getAllCompendiumSpells(activePC) as any[];
  }, [activePC]);

  const spellsByIdOrKey = useMemo(() => {
    const map = new Map<string, any>();
    allCompendiumSpells.forEach(s => {
      if (s.id) map.set(s.id, s);
      if (s.key) map.set(s.key, s);
    });
    return map;
  }, [allCompendiumSpells]);

  const chosenSpells = useMemo(() => {
    return chosenSpellKeys.map(k => spellsByIdOrKey.get(k) || { id: k, key: k, name: k });
  }, [chosenSpellKeys, spellsByIdOrKey]);

  const eligibleSpells = useMemo(() => {
    return getEligibleSpellsForLevelUp(activePC, quota, allCompendiumSpells);
  }, [activePC, quota, allCompendiumSpells]);

  // Set initial preview spell to the first eligible spell
  React.useEffect(() => {
    if (!previewSpell && eligibleSpells.length > 0) {
      setPreviewSpell(eligibleSpells[0]);
    }
  }, [eligibleSpells, previewSpell]);

  // If user clears all spells while filtering by 'selected', fall back to 'all'
  React.useEffect(() => {
    if (chosenSpellKeys.length === 0 && levelFilter === 'selected') {
      setLevelFilter('all');
    }
  }, [chosenSpellKeys.length, levelFilter]);

  const filteredSpells = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return eligibleSpells.filter(spell => {
      if (levelFilter === 'selected') {
        const isChosen = chosenSpellKeys.includes(spell.id) || chosenSpellKeys.includes(spell.key);
        if (!isChosen) return false;
      } else if (levelFilter !== 'all') {
        const clMatch = Array.isArray(spell.classLevels)
          ? spell.classLevels.find((cl: any) => cl.class === quota.casterClass)
          : null;
        const spLvl = clMatch ? clMatch.level : spell.level;
        if (String(spLvl) !== levelFilter) return false;
      }

      if (schoolFilter !== 'all') {
        const scCode = getSpellSchoolCode(spell.school, spell.id, spell.name || spell.nameEn);
        if (scCode !== schoolFilter) return false;
      }

      if (q) {
        const nameDe = (spell.nameDe || spell.name || '').toLowerCase();
        const nameEn = (spell.nameEn || spell.name || '').toLowerCase();
        const desc = (spell.description || spell.desc || '').toLowerCase();
        if (!nameDe.includes(q) && !nameEn.includes(q) && !desc.includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const clA = (a.classLevels || []).find((c: any) => c.class === quota.casterClass)?.level ?? a.level;
      const clB = (b.classLevels || []).find((c: any) => c.class === quota.casterClass)?.level ?? b.level;
      if (clA !== clB) return clA - clB;
      const nameA = a.nameDe || a.name || a.nameEn || '';
      const nameB = b.nameDe || b.name || b.nameEn || '';
      return nameA.localeCompare(nameB);
    });
  }, [eligibleSpells, searchQuery, levelFilter, schoolFilter, quota.casterClass]);

  const alreadyLearnedKeys = useMemo(() => {
    return new Set<string>(Array.isArray(activePC.learnedSpells) ? activePC.learnedSpells : []);
  }, [activePC.learnedSpells]);

  const handleToggleSelectSpell = (spellKey: string, _spell?: any) => {
    const next = [...chosenSpellKeys];
    const idx = next.indexOf(spellKey);
    if (idx !== -1) {
      next.splice(idx, 1);
      updateLevelConfig(currentLevelIndex, 'spells', next);
    } else {
      // Wizard limit check
      if (quota.mode === 'wizard' && next.length >= quota.totalSpellsToChoose) {
        // Replace oldest or prevent
        next.push(spellKey);
        if (next.length > quota.totalSpellsToChoose) {
          next.shift();
        }
        updateLevelConfig(currentLevelIndex, 'spells', next);
        return;
      }

      next.push(spellKey);
      updateLevelConfig(currentLevelIndex, 'spells', next);
    }
  };

  // Unique accessible levels for filter pills
  const availableLevels = useMemo(() => {
    const s = new Set<number>();
    eligibleSpells.forEach(sp => {
      const match = (sp.classLevels || []).find((c: any) => c.class === quota.casterClass);
      const lvl = match ? match.level : sp.level;
      if (typeof lvl === 'number') s.add(lvl);
    });
    return Array.from(s).sort((a, b) => a - b);
  }, [eligibleSpells, quota.casterClass]);

  // Info-only mode for Clerics, Druids, etc.
  if (quota.mode === 'info_only') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', minHeight: '380px' }}>
        <div
          style={{
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid var(--pb)',
            background: 'linear-gradient(135deg, rgba(200, 169, 110, 0.15), rgba(200, 169, 110, 0.05))',
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-title)', color: 'var(--red)', fontSize: '15px' }}>
            ✨ Divine & Full-List Spellcasting: {quota.casterClass.toUpperCase()} (CL {quota.effectiveCasterLevel})
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--ink)' }}>
            As a <strong>{quota.casterClass}</strong>, you have access to the entire class spell list and do not need to choose individual spells known.
          </p>
          {quota.newlyUnlockedSpellLevel && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '4px',
                background: 'rgba(46, 125, 50, 0.12)',
                border: '1px solid #2e7d32',
                color: '#1b5e20',
                fontSize: '12.5px',
                fontWeight: 'bold',
              }}
            >
              🎉 Congratulations! You have unlocked Level {quota.newlyUnlockedSpellLevel} spells! They are immediately ready for preparation during your next rest.
            </div>
          )}
        </div>

        <div style={{ fontSize: '11px', color: 'var(--inkm)', fontStyle: 'italic' }}>
          You can proceed directly to the Review step.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', minHeight: '420px', width: '100%' }}>
      {/* Quota Tracker Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          border: '1.5px solid var(--pb)',
          borderRadius: '5px',
          background: 'linear-gradient(90deg, rgba(200, 169, 110, 0.18), rgba(200, 169, 110, 0.06))',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📜</span>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '13px', fontWeight: 'bold', color: 'var(--red)' }}>
              {quota.casterClass === 'wizard' ? 'Wizard Spellbook Advancement' : `${quota.casterClass.toUpperCase()} Spells Known`} (CL {quota.effectiveCasterLevel})
            </div>
            <div style={{ fontSize: '11px', color: 'var(--inkm)' }}>
              {quota.mode === 'wizard' ? (
                <div>
                  Choose 2 free spells of any level up to Level {quota.maxSpellLevel} for your Spellbook.
                  <span style={{ marginLeft: '6px', fontWeight: 'bold', color: 'var(--red)' }}>
                    {activePC.wizardSpecialization && activePC.wizardSpecialization !== 'none'
                      ? `• Specialist: ${getSchoolLabel(activePC.wizardSpecialization)}${[activePC.wizardProhibited1, activePC.wizardProhibited2].filter(Boolean).length > 0 ? ` (Banned: ${[activePC.wizardProhibited1, activePC.wizardProhibited2].filter(Boolean).map(getSchoolLabel).join(', ')})` : ''}`
                      : '• Universalist (All schools accessible)'}
                  </span>
                </div>
              ) : (
                'Select new spells known for your spellcaster progression.'
              )}
            </div>
          </div>
        </div>

        {/* Counter Badge */}
        <div
          style={{
            padding: '4px 12px',
            borderRadius: '14px',
            background: chosenSpellKeys.length === quota.totalSpellsToChoose ? 'rgba(46, 125, 50, 0.15)' : 'rgba(139, 26, 26, 0.12)',
            border: `1px solid ${chosenSpellKeys.length === quota.totalSpellsToChoose ? '#2e7d32' : 'var(--red)'}`,
            color: chosenSpellKeys.length === quota.totalSpellsToChoose ? '#1b5e20' : 'var(--red)',
            fontFamily: 'var(--font-title)',
            fontWeight: 'bold',
            fontSize: '12px',
          }}
        >
          {chosenSpellKeys.length} / {quota.totalSpellsToChoose} Spells Chosen
        </div>
      </div>

      {/* Persistent Selected Spells Bar (Always visible regardless of active level filter) */}
      {chosenSpellKeys.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(200, 169, 110, 0.12)',
            border: '1px solid var(--pb)',
            borderRadius: '5px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              color: 'var(--red)',
              fontFamily: 'var(--font-title)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>✨</span> Selected Spells ({chosenSpellKeys.length}/{quota.totalSpellsToChoose}):
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            {chosenSpells.map(sp => {
              const clMatch = Array.isArray(sp.classLevels)
                ? sp.classLevels.find((cl: any) => cl.class === quota.casterClass)
                : null;
              const spLvl = clMatch ? clMatch.level : sp.level;
              const isInspected = previewSpell && (previewSpell.id === (sp.id || sp.key) || previewSpell.key === (sp.id || sp.key));

              return (
                <div
                  key={sp.id || sp.key}
                  onClick={() => setPreviewSpell(sp)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    background: isInspected ? 'rgba(139, 26, 26, 0.08)' : 'rgba(255, 255, 255, 0.85)',
                    border: isInspected ? '1.5px solid var(--red)' : '1px solid var(--pb)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    fontSize: '11px',
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Click to view RAW rules in inspector"
                >
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 'bold',
                      color: '#fff',
                      background: 'var(--red)',
                      borderRadius: '8px',
                      padding: '1px 5px',
                      lineHeight: 1.2,
                    }}
                  >
                    Lvl {spLvl ?? '?'}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                    {sp.nameDe || sp.name || sp.nameEn}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSelectSpell(sp.id || sp.key, sp);
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--inkm)',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      lineHeight: 1,
                      padding: '0 2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--inkm)')}
                    title="Remove spell"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Dual-Column: Left (Spell Picker) / Right (RAW Rules Inspector) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '14px', minHeight: '380px' }}>
        {/* Left Column: Filter & List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Search and Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input
              type="text"
              placeholder="Search spells by name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cinput"
              style={{ width: '100%', height: '28px', padding: '0 8px', fontSize: '11.5px', boxSizing: 'border-box' }}
            />

            {/* Level Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--inkm)', fontWeight: 'bold' }}>Level:</span>
              <button
                type="button"
                onClick={() => setLevelFilter('all')}
                style={{
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontSize: '10.5px',
                  border: levelFilter === 'all' ? '1px solid var(--red)' : '1px solid var(--pb)',
                  background: levelFilter === 'all' ? 'var(--red)' : 'rgba(200, 169, 110, 0.1)',
                  color: levelFilter === 'all' ? '#fff' : 'var(--ink)',
                  cursor: 'pointer',
                  fontWeight: levelFilter === 'all' ? 'bold' : 'normal',
                }}
              >
                All
              </button>

              {chosenSpellKeys.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLevelFilter('selected')}
                  style={{
                    padding: '2px 7px',
                    borderRadius: '10px',
                    fontSize: '10.5px',
                    border: levelFilter === 'selected' ? '1.5px solid var(--red)' : '1px solid #2e7d32',
                    background: levelFilter === 'selected' ? 'var(--red)' : 'rgba(46, 125, 50, 0.12)',
                    color: levelFilter === 'selected' ? '#fff' : '#1b5e20',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                  title="Show only selected spells"
                >
                  ✓ Selected ({chosenSpellKeys.length})
                </button>
              )}
              {availableLevels.map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevelFilter(String(lvl))}
                  style={{
                    padding: '2px 7px',
                    borderRadius: '10px',
                    fontSize: '10.5px',
                    border: levelFilter === String(lvl) ? '1px solid var(--red)' : '1px solid var(--pb)',
                    background: levelFilter === String(lvl) ? 'var(--red)' : 'rgba(200, 169, 110, 0.1)',
                    color: levelFilter === String(lvl) ? '#fff' : 'var(--ink)',
                    cursor: 'pointer',
                    fontWeight: levelFilter === String(lvl) ? 'bold' : 'normal',
                  }}
                >
                  {lvl === 0 ? '0 (Cantrips)' : `Lvl ${lvl}`}
                </button>
              ))}

              <span style={{ fontSize: '10px', color: 'var(--inkm)', fontWeight: 'bold', marginLeft: '6px' }}>School:</span>
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="cinput"
                style={{ height: '22px', fontSize: '10px', padding: '0 4px', borderRadius: '4px', maxWidth: '110px' }}
              >
                <option value="all">All Schools</option>
                <option value="abj">Abjuration</option>
                <option value="con">Conjuration</option>
                <option value="div">Divination</option>
                <option value="enc">Enchantment</option>
                <option value="evo">Evocation</option>
                <option value="ill">Illusion</option>
                <option value="nec">Necromancy</option>
                <option value="tra">Transmutation</option>
                <option value="univ">Universal</option>
              </select>
            </div>
          </div>

          {/* Spell Cards List */}
          <div
            className="custom-scrollbar"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflowY: 'auto',
              maxHeight: '380px',
              paddingRight: '6px',
              scrollbarGutter: 'stable',
            }}
          >
            {filteredSpells.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--inkl)', fontStyle: 'italic', fontSize: '11.5px' }}>
                No spells match the current filter.
              </div>
            ) : (
              filteredSpells.map(spell => {
                const sKey = spell.id || spell.key;
                const isSelected = chosenSpellKeys.includes(sKey);
                const isAlreadyLearned = alreadyLearnedKeys.has(sKey);
                const isPreview = previewSpell && (previewSpell.id === sKey || previewSpell.key === sKey);
                const clMatch = (spell.classLevels || []).find((c: any) => c.class === quota.casterClass);
                const displayLevel = clMatch ? clMatch.level : spell.level;

                return (
                  <div
                    key={sKey}
                    onClick={() => setPreviewSpell(spell)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '4px',
                      border: isSelected
                        ? '1.5px solid #2e7d32'
                        : isPreview
                        ? '1.5px solid var(--red)'
                        : '1px solid var(--pb)',
                      background: isSelected
                        ? 'rgba(46, 125, 50, 0.1)'
                        : isPreview
                        ? 'rgba(139, 26, 26, 0.05)'
                        : 'rgba(200, 169, 110, 0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '22px',
                          height: '20px',
                          padding: '0 4px',
                          borderRadius: '3px',
                          background: 'rgba(139, 26, 26, 0.12)',
                          color: 'var(--red)',
                          fontFamily: 'var(--font-title)',
                          fontWeight: 'bold',
                          fontSize: '10.5px',
                        }}
                      >
                        {displayLevel}
                      </span>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: isSelected ? 'bold' : 'normal', fontSize: '12px', color: 'var(--ink)' }}>
                          {spell.nameDe || spell.name || spell.nameEn}
                        </div>
                        {spell.school && (
                          <div style={{ fontSize: '9.5px', color: 'var(--inkm)' }}>
                            {spell.school}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isAlreadyLearned ? (
                        <span
                          style={{
                            fontSize: '9.5px',
                            color: 'var(--inkm)',
                            background: 'rgba(0,0,0,0.05)',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            border: '0.5px solid rgba(0,0,0,0.1)',
                          }}
                        >
                          Known
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelectSpell(sKey, spell);
                          }}
                          style={{
                            padding: '3px 9px',
                            borderRadius: '3px',
                            border: isSelected ? '1px solid #2e7d32' : '1px solid var(--pb)',
                            background: isSelected ? '#2e7d32' : 'var(--pb)',
                            color: '#fff',
                            fontFamily: 'var(--font-title)',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                          }}
                        >
                          {isSelected ? '✓ Selected' : '+ Learn'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: RAW Rules Inspector */}
        <div
          className="custom-scrollbar"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '12px',
            borderRadius: '5px',
            border: '1.5px solid var(--pb)',
            background: 'linear-gradient(180deg, rgba(200, 169, 110, 0.08), rgba(200, 169, 110, 0.16))',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            maxHeight: '430px',
            overflowY: 'auto',
            scrollbarGutter: 'stable',
          }}
        >
          {previewSpell ? (
            <>
              <div style={{ borderBottom: '1px solid var(--pb)', paddingBottom: '6px', marginBottom: '4px' }}>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: '14px', fontWeight: 'bold', color: 'var(--red)' }}>
                  {previewSpell.nameDe || previewSpell.name || previewSpell.nameEn}
                </div>
                {previewSpell.nameEn && previewSpell.nameEn !== previewSpell.nameDe && (
                  <div style={{ fontSize: '10.5px', color: 'var(--inkm)', fontStyle: 'italic' }}>
                    {previewSpell.nameEn}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: 'var(--red)', marginTop: '2px', fontWeight: 'bold' }}>
                  {previewSpell.school}
                </div>
              </div>

              {/* Fast Facts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10.5px', marginBottom: '6px' }}>
                <div><strong>Level:</strong> {previewSpell.level}</div>
                <div><strong>Components:</strong> {previewSpell.components || 'V, S'}</div>
                <div><strong>Casting Time:</strong> {previewSpell.castingTime || '1 standard action'}</div>
                <div><strong>Range:</strong> {previewSpell.range || 'Close (25 ft. + 5 ft./2 levels)'}</div>
                <div><strong>Duration:</strong> {previewSpell.duration || 'Instantaneous'}</div>
                <div><strong>Saving Throw:</strong> {previewSpell.savingThrow || previewSpell.save || 'None'}</div>
                <div><strong>Spell Resistance:</strong> {previewSpell.spellResistance || previewSpell.sr || 'No'}</div>
              </div>

              {/* RAW Description */}
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--ink)',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                  borderTop: '0.5px dashed var(--pb)',
                  paddingTop: '8px',
                }}
              >
                {previewSpell.description || previewSpell.desc || 'No description available.'}
              </div>

              {/* Action Button inside Inspector */}
              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                {!alreadyLearnedKeys.has(previewSpell.id || previewSpell.key) && (
                  <button
                    type="button"
                    onClick={() => handleToggleSelectSpell(previewSpell.id || previewSpell.key, previewSpell)}
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      background: chosenSpellKeys.includes(previewSpell.id || previewSpell.key) ? '#2e7d32' : 'var(--red)',
                      color: '#fff',
                      fontFamily: 'var(--font-title)',
                      fontWeight: 'bold',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                    }}
                  >
                    {chosenSpellKeys.includes(previewSpell.id || previewSpell.key) ? '✓ Deselect Spell' : '+ Add Spell to Selection'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--inkl)', fontStyle: 'italic', fontSize: '11.5px' }}>
              Select a spell on the left to inspect its RAW rules details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
