import React from 'react';
import { CombatFeats } from '@core/data/feats-data.js';
import { CLASSES_LIST, CLASS_KEY_ATTRIBUTES } from './constants';
import { SkillsTabContent } from './SkillsTabContent';
import { FeatsTabContent } from './FeatsTabContent';
import { validatePrestigeClassPrereqs, isOnlySpecialTextUnmet } from '@core/rules.js';
// @ts-ignore
import { showCustomAlert, showCustomConfirm } from '@core/ui/components/dialogs.js';

interface Step3LevelConfigProps {
  levelConfigs: any[];
  currentLevelIndex: number;
  setCurrentLevelIndex: (idx: number) => void;
  currentConfig: any;
  currentDraft: any;
  prevDraft: any;
  completedDraft: any;
  getClassHitDie: (cls: string) => number;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
  activeTab: 'skills' | 'feats';
  setActiveTab: (tab: 'skills' | 'feats') => void;
  currentLevelRemainingSkillPoints: number;
  currentLevelMaxSkillPoints: number;
  skillSearch: string;
  setSkillSearch: (val: string) => void;
  featSelectSlotIndex: number | null;
  setFeatSelectSlotIndex: (idx: number | null) => void;
  featSearch: string;
  setFeatSearch: (val: string) => void;
  featFilter: string;
  setFeatFilter: (val: string) => void;
  currentFeatSlots: any[];
  activeFeatSlot: any;
  filteredFeats: any[];
}

export const Step3LevelConfig: React.FC<Step3LevelConfigProps> = ({
  levelConfigs,
  currentLevelIndex,
  setCurrentLevelIndex,
  currentConfig,
  currentDraft,
  prevDraft,
  completedDraft,
  getClassHitDie,
  updateLevelConfig,
  activeTab,
  setActiveTab,
  currentLevelRemainingSkillPoints,
  currentLevelMaxSkillPoints,
  skillSearch,
  setSkillSearch,
  featSelectSlotIndex,
  setFeatSelectSlotIndex,
  featSearch,
  setFeatSearch,
  featFilter,
  setFeatFilter,
  currentFeatSlots,
  activeFeatSlot,
  filteredFeats
}) => {
  const [sourceTab, setSourceTab] = React.useState<'all' | 'phb' | 'phb2' | 'ca' | 'prestige'>('all');
  const [classSearch, setClassSearch] = React.useState('');

  React.useEffect(() => {
    if (!currentConfig || !currentDraft) return;

    if (currentConfig.classType === 'mystic_theurge') {
      const arcaneOptions = currentDraft.classes.filter((cl: any) => ['wizard', 'sorcerer', 'bard'].includes(cl.classType));
      const divineOptions = currentDraft.classes.filter((cl: any) => ['cleric', 'druid', 'paladin', 'ranger'].includes(cl.classType));

      const links = { ...currentConfig.prestigeSpellLinks?.mystic_theurge };
      let changed = false;

      if (arcaneOptions.length === 1 && links.arcane !== arcaneOptions[0].classType) {
        links.arcane = arcaneOptions[0].classType;
        changed = true;
      }
      if (divineOptions.length === 1 && links.divine !== divineOptions[0].classType) {
        links.divine = divineOptions[0].classType;
        changed = true;
      }

      if (changed) {
        updateLevelConfig(currentLevelIndex, 'prestigeSpellLinks', {
          ...currentConfig.prestigeSpellLinks,
          mystic_theurge: links
        });
      }
    } else if (currentConfig.classType === 'arcane_trickster') {
      const arcaneOptions = currentDraft.classes.filter((cl: any) => ['wizard', 'sorcerer', 'bard'].includes(cl.classType));

      let currentLink = currentConfig.prestigeSpellLinks?.arcane_trickster;
      if (arcaneOptions.length === 1 && currentLink !== arcaneOptions[0].classType) {
        updateLevelConfig(currentLevelIndex, 'prestigeSpellLinks', {
          ...currentConfig.prestigeSpellLinks,
          arcane_trickster: arcaneOptions[0].classType
        });
      }
    }
  }, [currentConfig.classType, currentDraft, currentLevelIndex]);

  const baseClasses = CLASSES_LIST.filter(c => !c.isPrestige);
  const prestigeClasses = CLASSES_LIST.filter(c => c.isPrestige);

  // Unified filtered class list for wizard class picker
  const filteredWizardClasses = CLASSES_LIST.filter(c => {
    if (sourceTab === 'prestige' && !c.isPrestige) return false;
    if (sourceTab === 'phb' && (c.isPrestige || (c as any).source !== 'phb')) return false;
    if (sourceTab === 'phb2' && (c.isPrestige || (c as any).source !== 'phb2')) return false;
    if (sourceTab === 'ca' && (c.isPrestige || (c as any).source !== 'ca')) return false;
    if (classSearch.trim()) {
      const q = classSearch.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
    }
    return true;
  });

  const handleClassSelect = (classKey: string) => {
    updateLevelConfig(currentLevelIndex, 'classType', classKey);
    if (currentLevelIndex > 0) {
      updateLevelConfig(currentLevelIndex, 'hpRoll', 1);
    }
  };

  const handleLockedClassClick = (c: any) => {
    const title = `Voraussetzungen für ${c.name}`;
    const activeDraft = completedDraft || prevDraft;
    const detailValidation = activeDraft ? validatePrestigeClassPrereqs(activeDraft.draftPC, c.key) : { success: false, metDetails: [] };

    const lines = detailValidation.metDetails.map((req: any) => {
      const color = req.met ? '#2e7d32' : '#d32f2f';
      return `<div style="color: ${color}; margin-bottom: 10px;"><strong>${req.label}</strong><br/>[Vorhanden: ${req.current} / Benötigt: ${req.required}]</div>`;
    });

    if (isOnlySpecialTextUnmet(detailValidation)) {
      showCustomConfirm(
        title,
        `<div style="text-align: left; max-height: 300px; overflow-y: auto; padding: 4px;"><p style="margin-bottom: 12px; color: var(--ink);">Alle Voraussetzungen sind erfüllt bis auf eine besondere Bedingung, die manuell bestätigt werden muss:</p>${lines.join('')}<p style="margin-top: 12px; color: var(--ink);">Bestätigst du, dass diese Bedingung erfüllt ist?</p></div>`,
        () => {
          updateLevelConfig(currentLevelIndex, 'prestigeSpecialTextConfirmed', {
            ...currentConfig.prestigeSpecialTextConfirmed,
            [c.key]: true
          });
          handleClassSelect(c.key);
        }
      );
      return;
    }

    showCustomAlert(
      title,
      `<div style="text-align: left; max-height: 300px; overflow-y: auto; padding: 4px;"><p style="margin-bottom: 12px; color: var(--ink);">Du erfüllst die Voraussetzungen für diese Prestigeklasse noch nicht:</p>${lines.join('')}</div>`,
      "OK",
      "🔒"
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', marginTop: '10px' }}>
      {/* Level Timeline Bar */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          paddingBottom: '8px',
          borderBottom: '0.5px solid rgba(200,169,110,0.3)',
          marginBottom: '10px'
        }}
      >
        {levelConfigs.map((cfg, idx) => {
          const isCurrent = idx === currentLevelIndex;
          const isPast = idx < currentLevelIndex;
          const matched = CLASSES_LIST.find(c => c.key === cfg.classType);
          const clsName = matched ? matched.name : (cfg.classType ? cfg.classType
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') : '?');

          return (
            <div
              key={idx}
              onClick={() => {
                if (idx < currentLevelIndex) {
                  setCurrentLevelIndex(idx);
                }
              }}
              style={{
                padding: '4px 10px',
                background: isCurrent ? 'rgba(139, 26, 26, 0.08)' : (isPast ? 'rgba(200, 169, 110, 0.15)' : 'transparent'),
                border: isCurrent ? '1.5px solid var(--red)' : '1px solid transparent',
                borderRadius: '3px',
                fontSize: '11px',
                cursor: isPast ? 'pointer' : 'default',
                opacity: isCurrent || isPast ? 1 : 0.5,
                whiteSpace: 'nowrap'
              }}
            >
              Level {cfg.level} ({cfg.classType ? clsName : 'No Class'})
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ color: 'var(--red)', margin: '0 0 4px 0', fontSize: '14px', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3px' }}>
            Level {currentLevelIndex + 1}: Class & HP
          </h4>

          {/* Source-Tabs + Suchfeld */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {(['all', 'phb', 'phb2', 'ca', 'prestige'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSourceTab(tab)}
                  style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '3px', cursor: 'pointer',
                    border: '1px solid var(--pb)',
                    fontFamily: "'Crimson Text', serif",
                    background: sourceTab === tab ? 'var(--red)' : 'rgba(139,26,26,0.06)',
                    color: sourceTab === tab ? '#fff' : 'var(--inkm)',
                    fontWeight: sourceTab === tab ? 700 : 400,
                    transition: 'all 0.15s'
                  }}
                >
                  {tab === 'all' ? 'Alle' : tab === 'phb' ? 'Core' : tab === 'phb2' ? 'PHB2' : tab === 'ca' ? 'C.Adv' : 'Prestige'}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Klasse suchen..."
              value={classSearch}
              onChange={e => setClassSearch(e.target.value)}
              className="cinput"
              style={{ width: '100%', fontSize: '11px', height: '26px', padding: '0 8px' }}
            />
          </div>

          {/* Klassen-Liste */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '280px', overflowY: 'auto' }}>
            {filteredWizardClasses.map(c => {
              const isSelected = currentConfig.classType === c.key;
              const isPrestige = c.isPrestige;
              const validation = prevDraft ? validatePrestigeClassPrereqs(prevDraft.draftPC, c.key) : { success: !isPrestige, metDetails: [] };
              const isAvailable = !isPrestige || validation.success;
              const srcBadge = (c as any).source && (c as any).source !== 'phb' ? ` [${(c as any).source.toUpperCase()}]` : '';

              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => {
                    if (isPrestige && !isAvailable) {
                      handleLockedClassClick(c);
                    } else {
                      handleClassSelect(c.key);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '4px',
                    fontFamily: "'Crimson Text', serif",
                    border: isSelected
                      ? '1.5px solid var(--red)'
                      : (isPrestige && !isAvailable ? '1px dashed rgba(0,0,0,0.2)' : '1px solid var(--pb)'),
                    background: isSelected
                      ? 'rgba(139, 26, 26, 0.08)'
                      : (isPrestige && !isAvailable ? 'rgba(240,240,240,0.4)' : 'rgba(244, 232, 193, 0.15)'),
                    color: isSelected ? 'var(--red)' : (isPrestige && !isAvailable ? 'rgba(0,0,0,0.4)' : 'var(--ink)'),
                    fontWeight: isSelected ? 'bold' : 'normal',
                    fontSize: '11px',
                    cursor: (isPrestige && !isAvailable) ? 'help' : 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontFamily: "'IM Fell English SC', serif" }}>{c.name}{srcBadge}</span>
                  <span style={{ fontSize: '9.5px', opacity: 0.8, fontFamily: "'Crimson Text', serif" }}>
                    {isSelected ? '🎯 Selected' : (isPrestige ? (isAvailable ? '🔓 Available' : '🔒 Locked') : `d${c.hd}`)}
                  </span>
                </button>
              );
            })}
            {filteredWizardClasses.length === 0 && (
              <div style={{ fontSize: '11px', color: 'var(--inkl)', fontFamily: "'Crimson Text', serif", fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
                Keine Klassen gefunden.
              </div>
            )}
          </div>

          {/* Linked Spellcaster selection */}
          {currentConfig.classType === 'mystic_theurge' && currentDraft && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', padding: '10px', border: '1px solid var(--pb)', borderRadius: '4px', background: 'rgba(200, 169, 110, 0.05)' }}>
              <strong style={{ fontSize: '11px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>✦ Mystic Theurge Spell Linking</strong>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold' }}>Arcane Class (+1 Caster Level)</label>
                <select
                  value={currentConfig.prestigeSpellLinks?.mystic_theurge?.arcane || ''}
                  onChange={(e) => {
                    const links = { ...currentConfig.prestigeSpellLinks?.mystic_theurge, arcane: e.target.value };
                    updateLevelConfig(currentLevelIndex, 'prestigeSpellLinks', {
                      ...currentConfig.prestigeSpellLinks,
                      mystic_theurge: links
                    });
                  }}
                  className="cinput"
                  style={{ width: '100%', fontSize: '11.5px', height: '28px', padding: '0 4px' }}
                >
                  <option value="" disabled>-- Select Arcane Class --</option>
                  {currentDraft.classes.filter((cl: any) => ['wizard', 'sorcerer', 'bard'].includes(cl.classType)).map((cl: any) => (
                    <option key={cl.classType} value={cl.classType}>
                      {CLASSES_LIST.find(x => x.key === cl.classType)?.name || cl.classType} (Lvl {cl.level})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold' }}>Divine Class (+1 Caster Level)</label>
                <select
                  value={currentConfig.prestigeSpellLinks?.mystic_theurge?.divine || ''}
                  onChange={(e) => {
                    const links = { ...currentConfig.prestigeSpellLinks?.mystic_theurge, divine: e.target.value };
                    updateLevelConfig(currentLevelIndex, 'prestigeSpellLinks', {
                      ...currentConfig.prestigeSpellLinks,
                      mystic_theurge: links
                    });
                  }}
                  className="cinput"
                  style={{ width: '100%', fontSize: '11.5px', height: '28px', padding: '0 4px' }}
                >
                  <option value="" disabled>-- Select Divine Class --</option>
                  {currentDraft.classes.filter((cl: any) => ['cleric', 'druid', 'paladin', 'ranger'].includes(cl.classType)).map((cl: any) => (
                    <option key={cl.classType} value={cl.classType}>
                      {CLASSES_LIST.find(x => x.key === cl.classType)?.name || cl.classType} (Lvl {cl.level})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {currentConfig.classType === 'arcane_trickster' && currentDraft && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', padding: '10px', border: '1px solid var(--pb)', borderRadius: '4px', background: 'rgba(200, 169, 110, 0.05)' }}>
              <strong style={{ fontSize: '11px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>✦ Arcane Trickster Spell Linking</strong>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold' }}>Arcane Class (+1 Caster Level)</label>
                <select
                  value={currentConfig.prestigeSpellLinks?.arcane_trickster || ''}
                  onChange={(e) => {
                    updateLevelConfig(currentLevelIndex, 'prestigeSpellLinks', {
                      ...currentConfig.prestigeSpellLinks,
                      arcane_trickster: e.target.value
                    });
                  }}
                  className="cinput"
                  style={{ width: '100%', fontSize: '11.5px', height: '28px', padding: '0 4px' }}
                >
                  <option value="" disabled>-- Select Arcane Class --</option>
                  {currentDraft.classes.filter((cl: any) => ['wizard', 'sorcerer', 'bard'].includes(cl.classType)).map((cl: any) => (
                    <option key={cl.classType} value={cl.classType}>
                      {CLASSES_LIST.find(x => x.key === cl.classType)?.name || cl.classType} (Lvl {cl.level})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {currentConfig.classType && (

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--ink)' }}>
                Hit Points (Hit Die: d{getClassHitDie(currentConfig.classType)})
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  min="1"
                  max={getClassHitDie(currentConfig.classType)}
                  value={currentConfig.hpRoll || ''}
                  onChange={(e) => {
                    const maxHD = getClassHitDie(currentConfig.classType);
                    const val = Math.max(1, Math.min(maxHD, parseInt(e.target.value) || 1));
                    updateLevelConfig(currentLevelIndex, 'hpRoll', val);
                  }}
                  className="cinput"
                  style={{ width: '80px', padding: '5px', fontSize: '13px', textAlign: 'center' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--inkl)', fontStyle: 'italic' }}>
                  {currentLevelIndex === 0
                    ? 'Maximum value pre-selected'
                    : `Allowed: 1 to ${getClassHitDie(currentConfig.classType)}`}
                </span>
              </div>
            </div>
          )}

          {(currentLevelIndex + 1) % 4 === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
                ✦ Ability Score Increase (+1)
              </label>
              <select
                value={currentConfig.abilityIncrease || ''}
                onChange={(e) => updateLevelConfig(currentLevelIndex, 'abilityIncrease', e.target.value)}
                className="cinput"
                style={{ width: '100%', padding: '0 8px', fontSize: '12px', height: '32px', boxSizing: 'border-box' }}
              >
                <option value="" disabled>-- Select Ability --</option>
                {([
                  { key: 'str', label: 'Strength (STR)' },
                  { key: 'dex', label: 'Dexterity (DEX)' },
                  { key: 'con', label: 'Constitution (CON)' },
                  { key: 'int', label: 'Intelligence (INT)' },
                  { key: 'wis', label: 'Wisdom (WIS)' },
                  { key: 'cha', label: 'Charisma (CHA)' }
                ] as const).map(opt => {
                  const currentClass = currentConfig.classType;
                  const isKey = currentClass ? CLASS_KEY_ATTRIBUTES[currentClass]?.includes(opt.key) : false;
                  return (
                    <option
                      key={opt.key}
                      value={opt.key}
                      style={{
                        color: isKey ? 'green' : 'inherit',
                        fontWeight: isKey ? 'bold' : 'normal'
                      }}
                    >
                      {opt.label} {isKey ? '★ (Key)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Current Attributes Card */}
          {currentDraft && (
            <div style={{ padding: '10px', border: '1px solid var(--pb)', background: 'rgba(244,232,193,0.3)', borderRadius: '4px', marginTop: '6px' }}>
              <strong style={{ display: 'block', fontSize: '11px', color: 'var(--red)', marginBottom: '6px', borderBottom: '0.5px dashed rgba(200, 169, 110, 0.4)', paddingBottom: '2px' }}>
                Current Ability Scores (Lvl {currentLevelIndex + 1})
              </strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
                {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(k => {
                  const labelMap = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
                  const val = currentDraft.stats[k];
                  const mod = currentDraft.statMods[k];
                  const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                  return (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '1px' }}>
                      <span>{labelMap[k]}:</span>
                      <strong style={{ color: 'var(--red)' }}>{val} ({modStr})</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feat Slots (rendered here if activeTab === 'feats') */}
          {activeTab === 'feats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>
                Talentslots:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {currentFeatSlots.map((slot, slotIdx) => {
                  const selectedFeatId = currentConfig.feats?.[slotIdx];
                  const selectedFeat = CombatFeats.REGISTRY[selectedFeatId];
                  const isPreFilled = !!slot.defaultFeat;
                  const isActive = featSelectSlotIndex === slotIdx;

                  return (
                    <div
                      key={slotIdx}
                      onClick={() => {
                        if (!isPreFilled) {
                          setFeatSelectSlotIndex(slotIdx);
                        }
                      }}
                      style={{
                        padding: '6px 8px',
                        background: isActive ? 'rgba(139, 26, 26, 0.05)' : 'rgba(244, 232, 193, 0.25)',
                        border: isActive
                          ? '1.5px solid var(--red)'
                          : selectedFeat
                            ? '1.5px solid #2e7d32'
                            : '1.5px solid var(--pb)',
                        borderRadius: '3px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: isPreFilled ? 'default' : 'pointer',
                        transition: 'background 0.2s, border-color 0.2s'
                      }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '8.5px', textTransform: 'uppercase', color: 'var(--inkl)', display: 'block' }}>
                          {slot.label} {isPreFilled && '(Fixed)'}
                        </span>
                        <strong style={{ fontSize: '11.5px', color: selectedFeat ? 'var(--ink)' : 'var(--red)' }}>
                          {selectedFeat ? (selectedFeat.nameEn || selectedFeat.nameDe) : '— Select —'}
                        </strong>
                      </div>
                      {!isPreFilled && (
                        <span style={{ fontSize: '9.5px', color: 'var(--red)', fontWeight: isActive ? 'bold' : 'normal' }}>
                          {isActive ? '👉 Active' : 'Select'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Tabs Header */}
          <div style={{ display: 'flex', gap: '5px', borderBottom: '1.5px solid var(--pb)', paddingBottom: '2px', marginBottom: '4px' }}>
            <button
              onClick={() => setActiveTab('skills')}
              style={{
                flex: 1,
                padding: '6px 12px',
                background: activeTab === 'skills' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'skills' ? '2px solid var(--red)' : '2px solid transparent',
                color: activeTab === 'skills' ? 'var(--red)' : 'var(--inkm)',
                fontWeight: activeTab === 'skills' ? 'bold' : 'normal',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: "'IM Fell English SC', serif"
              }}
            >
              📝 Skills ({currentLevelRemainingSkillPoints} / {currentLevelMaxSkillPoints})
            </button>
            <button
              onClick={() => {
                if (currentFeatSlots.length > 0) {
                  setActiveTab('feats');
                }
              }}
              disabled={currentFeatSlots.length === 0}
              style={{
                flex: 1,
                padding: '6px 12px',
                background: activeTab === 'feats' ? 'rgba(139, 26, 26, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'feats' ? '2px solid var(--red)' : '2px solid transparent',
                color: currentFeatSlots.length === 0 ? 'var(--inkl)' : (activeTab === 'feats' ? 'var(--red)' : 'var(--inkm)'),
                fontWeight: activeTab === 'feats' ? 'bold' : 'normal',
                fontSize: '12px',
                cursor: currentFeatSlots.length === 0 ? 'not-allowed' : 'pointer',
                fontFamily: "'IM Fell English SC', serif",
                opacity: currentFeatSlots.length === 0 ? 0.5 : 1
              }}
              title={currentFeatSlots.length === 0 ? "No feat slots available at this level" : ""}
            >
              🛡️ Feats ({currentFeatSlots.filter((_, idx) => !currentConfig.feats?.[idx]).length} open)
            </button>
          </div>

          {activeTab === 'skills' && (
            <SkillsTabContent
              levelConfigs={levelConfigs}
              currentLevelIndex={currentLevelIndex}
              currentConfig={currentConfig}
              currentDraft={currentDraft}
              skillSearch={skillSearch}
              setSkillSearch={setSkillSearch}
              currentLevelRemainingSkillPoints={currentLevelRemainingSkillPoints}
              currentLevelMaxSkillPoints={currentLevelMaxSkillPoints}
              updateLevelConfig={updateLevelConfig}
            />
          )}

          {activeTab === 'feats' && (
            <FeatsTabContent
              currentConfig={currentConfig}
              currentDraft={currentDraft}
              featSelectSlotIndex={featSelectSlotIndex}
              featSearch={featSearch}
              setFeatSearch={setFeatSearch}
              featFilter={featFilter}
              setFeatFilter={setFeatFilter}
              activeFeatSlot={activeFeatSlot}
              filteredFeats={filteredFeats}
              updateLevelConfig={updateLevelConfig}
              currentLevelIndex={currentLevelIndex}
            />
          )}
        </div>
      </div>
    </div>
  );
};
