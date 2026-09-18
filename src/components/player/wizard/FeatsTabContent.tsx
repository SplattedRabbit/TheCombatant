import React, { useState, useMemo } from 'react';
import { checkFeatPrerequisites, CombatFeats } from '@core/data/feats-data.js';
import { translatePrereq, PRESTIGE_PREREQS, CLASSES_LIST } from './constants';
import { getFeatSlotsAtLevel } from './helpers';
import { DRAGON_TOTEMS } from '@core/rules/data/dragonTotems.js';
import type { DragonTotemDef } from '@core/rules/data/dragonTotems.js';
import { SKILLS_REGISTRY } from '@core/data/skills-data.js';
import { WeaponRegistry } from '@core/models/Weapon.js';
import { isSkillFeat, isTotemFeat, getTotemSkills, getDragonShamanClassSkills, formatSkillName } from '../feats/skillFeatsHelper';

interface FeatsTabContentProps {
  currentConfig: any;
  currentDraft: any;
  featSelectSlotIndex: number | null;
  featSearch: string;
  setFeatSearch: (val: string) => void;
  featFilter: string;
  setFeatFilter: (val: string) => void;
  activeFeatSlot: any;
  filteredFeats: any[];
  updateLevelConfig: (idx: number, key: string, val: any) => void;
  currentLevelIndex: number;
  targetPrestigeClass?: string;
  levelConfigs?: any[];
  currentFeatSlots?: any[];
}

export const FeatsTabContent: React.FC<FeatsTabContentProps> = ({
  currentConfig,
  currentDraft,
  featSelectSlotIndex,
  featSearch,
  setFeatSearch,
  featFilter,
  setFeatFilter,
  activeFeatSlot,
  filteredFeats,
  updateLevelConfig,
  currentLevelIndex,
  targetPrestigeClass,
  levelConfigs,
  currentFeatSlots
}) => {
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  const classGrantedFeatIds = useMemo(() => {
    const ids = new Set<string>();
    if (Array.isArray(levelConfigs)) {
      levelConfigs.forEach((cfg, lvl) => {
        if (cfg?.classType) {
          const slots = getFeatSlotsAtLevel(lvl, cfg.classType, '', levelConfigs);
          slots.forEach(s => {
            if (s.defaultFeat) ids.add(s.defaultFeat);
          });
        }
      });
    }
    if (Array.isArray(currentFeatSlots)) {
      currentFeatSlots.forEach(s => {
        if (s.defaultFeat) ids.add(s.defaultFeat);
      });
    }
    return ids;
  }, [levelConfigs, currentFeatSlots]);

  const reqFeats = targetPrestigeClass ? (PRESTIGE_PREREQS[targetPrestigeClass]?.feats || []) : [];
  const targetClassDef = targetPrestigeClass ? CLASSES_LIST.find(c => c.key === targetPrestigeClass) : null;

  const toggleParent = (featId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(featId)) {
        next.delete(featId);
      } else {
        next.add(featId);
      }
      return next;
    });
  };

  // Build hierarchical tree identical to Playerscreen's CompendiumFeatsList
  const treeList = useMemo(() => {
    const list: Array<{ feat: any; depth: number }> = [];
    const visited = new Set<string>();

    const featsMap = new Map<string, any>();
    filteredFeats.forEach((item: any) => {
      const f = item?.feat || item;
      if (f?.id) featsMap.set(f.id, f);
    });

    const addFeatWithChildren = (featId: string, depth: number) => {
      if (visited.has(featId)) return;
      visited.add(featId);

      const feat = featsMap.get(featId) || CombatFeats.REGISTRY[featId];
      if (!feat) return;

      list.push({ feat, depth });

      Object.keys(CombatFeats.REGISTRY).forEach((childId) => {
        const child = CombatFeats.REGISTRY[childId];
        if (child.parent === featId && featsMap.has(childId)) {
          addFeatWithChildren(childId, depth + 1);
        }
      });
    };

    featsMap.forEach((feat, featId) => {
      if (!feat.parent || !featsMap.has(feat.parent)) {
        addFeatWithChildren(featId, 0);
      }
    });

    featsMap.forEach((_feat, featId) => {
      if (!visited.has(featId)) {
        addFeatWithChildren(featId, 0);
      }
    });

    return list;
  }, [filteredFeats]);

  const totemKey: string | undefined = activeFeatSlot?.totemKey || currentConfig?.dragonTotem || (levelConfigs?.find((c: { dragonTotem?: string }) => c.dragonTotem)?.dragonTotem) || undefined;
  const totemDef: DragonTotemDef | undefined = totemKey ? DRAGON_TOTEMS[totemKey] : undefined;
  const totemName = totemDef ? (totemDef.name || totemDef.nameDe) : 'Totem';

  const displayFeats = useMemo(() => {
    const isSearching = featSearch.trim().length > 0;
    const isTargetPrCFilter = featFilter === 'prc_target';

    const visibleList: Array<{ feat: any; depth: number }> = [];

    treeList.forEach(item => {
      const feat = item.feat;
      let showItem = true;

      if (!isSearching && !isTargetPrCFilter && item.depth > 0) {
        let currentParentId = feat.parent;
        while (currentParentId) {
          if (!expandedParents.has(currentParentId)) {
            showItem = false;
            break;
          }
          const parentFeat = CombatFeats.REGISTRY[currentParentId];
          currentParentId = parentFeat ? parentFeat.parent : null;
        }
      }

      if (showItem) {
        visibleList.push(item);
      }
    });

    if (isTargetPrCFilter) {
      return visibleList.filter(item => reqFeats.includes(item.feat.id));
    }

    if (activeFeatSlot?.allowedFeats && activeFeatSlot.allowedFeats.length > 0) {
      return visibleList.filter(item => activeFeatSlot.allowedFeats.includes(item.feat.id));
    }

    if (featFilter === 'skill') {
      return visibleList.filter(item => isSkillFeat(item.feat));
    }

    if (featFilter === 'totem') {
      return visibleList.filter(item => isTotemFeat(item.feat, totemKey));
    }

    if (featFilter !== 'all' && ['combat', 'metamagic', 'item_creation', 'general'].includes(featFilter)) {
      return visibleList.filter(item => item.feat.category === featFilter);
    }

    return visibleList;
  }, [treeList, featSearch, featFilter, expandedParents, reqFeats, activeFeatSlot, totemKey]);

  const rawSlotVal = featSelectSlotIndex !== null ? (currentConfig?.feats?.[featSelectSlotIndex] || activeFeatSlot?.defaultFeat) : null;
  const currentSlotFeatId = typeof rawSlotVal === 'object' ? rawSlotVal?.id : rawSlotVal;
  const currentSlotOption = typeof rawSlotVal === 'object' ? rawSlotVal?.option : (featSelectSlotIndex !== null ? currentConfig?.featOptions?.[featSelectSlotIndex] : '');
  const currentSlotFeatDef = currentSlotFeatId ? CombatFeats.REGISTRY[currentSlotFeatId] : null;
  const needsOption = Boolean(activeFeatSlot?.hasOption || currentSlotFeatDef?.hasOption);

  const effectiveOptionType = currentSlotFeatDef?.optionType || activeFeatSlot?.optionType || (activeFeatSlot?.optionScope ? 'skill' : (activeFeatSlot?.defaultFeat === 'skill_focus' ? 'skill' : undefined));

  const getOptionsForFeat = (featDef: any, slotDef?: any): string[] => {
    const optType = featDef?.optionType || slotDef?.optionType || (slotDef?.optionScope ? 'skill' : (slotDef?.defaultFeat === 'skill_focus' ? 'skill' : undefined));
    if (optType === 'weapon') {
      const weaponNames = Object.values(WeaponRegistry)
        .filter((w: any) => !w.key?.startsWith('other_'))
        .map((w: any) => w.nameEn || w.name);
      return Array.from(new Set(weaponNames)).sort((a: string, b: string) => a.localeCompare(b));
    }
    if (optType === 'school') {
      return [
        'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
        'Evocation', 'Illusion', 'Necromancy', 'Transmutation'
      ];
    }
    if (optType === 'armor') {
      return ['Light Armor', 'Medium Armor', 'Heavy Armor', 'Shield', 'Tower Shield'];
    }
    if (optType === 'shield') {
      return ['Buckler', 'Heavy shield', 'Light shield', 'Tower shield'];
    }
    const tKey = totemKey || 'red';
    if (slotDef?.optionScope === 'totem') {
      return getTotemSkills(tKey).map(formatSkillName);
    }
    if (slotDef?.optionScope === 'class') {
      return getDragonShamanClassSkills(tKey).map(formatSkillName).sort((a: string, b: string) => a.localeCompare(b));
    }
    return Object.keys(SKILLS_REGISTRY).map(formatSkillName).sort((a, b) => a.localeCompare(b));
  };

  const availableOptionsForSlot = useMemo(() => {
    if (!needsOption) return [];
    return getOptionsForFeat(currentSlotFeatDef, activeFeatSlot);
  }, [needsOption, currentSlotFeatDef, activeFeatSlot, totemKey]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '420px' }}>
      {featSelectSlotIndex !== null && activeFeatSlot ? (
        <>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={`Search feat (${activeFeatSlot.label})...`}
              value={featSearch}
              onChange={(e) => setFeatSearch(e.target.value)}
              className="cinput"
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: '11px',
                height: '24px',
                boxSizing: 'border-box'
              }}
            />
            
            <select
              value={featFilter}
              onChange={(e) => setFeatFilter(e.target.value)}
              className="cinput"
              style={{
                width: '130px',
                padding: '0 4px',
                fontSize: '11px',
                height: '24px',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">All</option>
              {targetPrestigeClass && reqFeats.length > 0 && (
                <option value="prc_target">★ {targetClassDef?.name || 'Target Class'}</option>
              )}
              <option value="skill">Skill Feats</option>
              {totemKey && (
                <option value="totem">Totem Skills & Feats</option>
              )}
              {activeFeatSlot && activeFeatSlot.allowedCategories?.includes('combat') && (
                <option value="combat">Combat</option>
              )}
              {activeFeatSlot && activeFeatSlot.allowedCategories?.includes('metamagic') && (
                <option value="metamagic">Metamagic</option>
              )}
              {activeFeatSlot && activeFeatSlot.allowedCategories?.includes('item_creation') && (
                <option value="item_creation">Item Creation</option>
              )}
              {activeFeatSlot && activeFeatSlot.allowedCategories?.includes('general') && (
                <option value="general">General</option>
              )}
            </select>
          </div>

          {/* Dedicated Feat Option Selection Banner (e.g. Skill Focus, Weapon Focus) */}
          {needsOption && currentSlotFeatId && (
            <div
              style={{
                padding: '7px 10px',
                background: 'rgba(200, 169, 110, 0.16)',
                border: '1px solid var(--red)',
                borderRadius: '3px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '11px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--red)', fontFamily: 'var(--font-title)', fontSize: '11.5px' }}>
                  🎯 Select {effectiveOptionType === 'weapon' ? 'Weapon' : effectiveOptionType === 'school' ? 'Magic School' : effectiveOptionType === 'armor' ? 'Armor Type' : effectiveOptionType === 'shield' ? 'Shield Type' : 'Option'} for {currentSlotFeatDef?.nameEn || currentSlotFeatDef?.name || currentSlotFeatId}:
                </strong>
                {effectiveOptionType === 'skill' && activeFeatSlot?.optionScope === 'totem' && (
                  <span style={{ fontSize: '9px', color: 'var(--red)', fontWeight: 'bold' }}>Totem Class Skills</span>
                )}
                {effectiveOptionType === 'skill' && activeFeatSlot?.optionScope === 'class' && (
                  <span style={{ fontSize: '9px', color: 'var(--inkm)' }}>Dragon Shaman Class Skills</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  value={currentSlotOption || ''}
                  onChange={(e) => {
                    const opt = e.target.value;
                    const nextFeats = [...(currentConfig.feats || [])];
                    nextFeats[featSelectSlotIndex] = { id: currentSlotFeatId, option: opt };
                    updateLevelConfig(currentLevelIndex, 'feats', nextFeats);
                    const nextOptions = { ...(currentConfig.featOptions || {}) };
                    nextOptions[featSelectSlotIndex] = opt;
                    updateLevelConfig(currentLevelIndex, 'featOptions', nextOptions);
                  }}
                  className="cinput"
                  style={{ flex: 1, height: '24px', fontSize: '11px', padding: '0 6px', boxSizing: 'border-box' }}
                >
                  <option value="" disabled>-- Select a {effectiveOptionType === 'weapon' ? 'Weapon' : effectiveOptionType === 'school' ? 'Magic School' : effectiveOptionType === 'armor' ? 'Armor Type' : effectiveOptionType === 'shield' ? 'Shield Type' : 'Skill / Option'} --</option>
                  {effectiveOptionType === 'skill' && totemKey && activeFeatSlot?.optionScope === 'class' ? (
                    <>
                      <optgroup label={`Totem Skills (${totemName})`}>
                        {getTotemSkills(totemKey).map(formatSkillName).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Dragon Shaman Class Skills">
                        {availableOptionsForSlot
                          .filter(opt => !getTotemSkills(totemKey).map(formatSkillName).includes(opt))
                          .map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                      </optgroup>
                    </>
                  ) : (
                    availableOptionsForSlot.map((opt: string) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))
                  )}
                </select>
                {currentSlotOption && (
                  <span style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '12px' }} title="Option selected">
                    ✓ Saved
                  </span>
                )}
              </div>
            </div>
          )}

          <div
            style={{
              flex: 1,
              maxHeight: '420px',
              overflowY: 'auto',
              border: '1px solid var(--pb)',
              borderRadius: '3px',
              background: 'white',
              padding: '4px'
            }}
          >
            {displayFeats.length === 0 ? (
              <div style={{ padding: '20px', fontSize: '11px', fontStyle: 'italic', color: 'var(--inkl)', textAlign: 'center' }}>
                No matching feats found.
              </div>
            ) : (
              displayFeats.map((item: any) => {
                const feat = item?.feat || item;
                if (!feat || !feat.id) return null;
                const depth = item?.depth || 0;
                const prereqsResult = currentDraft?.draftPC ? checkFeatPrerequisites(feat.id, currentDraft.draftPC) : { met: true, unmetDescs: [] };
                const isAlreadySelected = Array.isArray(currentConfig?.feats)
                  ? currentConfig.feats.some((f: any, i: number) => {
                      if (i === featSelectSlotIndex) return false;
                      const fid = typeof f === 'object' ? f?.id : f;
                      const fOpt = typeof f === 'object' ? f?.option : currentConfig?.featOptions?.[i];
                      if (fid === 'skill_focus' && feat.id === 'skill_focus') {
                        return fOpt && fOpt === currentSlotOption;
                      }
                      return fid === feat.id;
                    })
                  : false;
                const isAlreadyLearned = Array.isArray(currentDraft?.featsList)
                  ? currentDraft.featsList.some((f: any) => {
                      const fid = typeof f === 'object' ? f?.id : f;
                      if (fid === 'skill_focus' && feat.id === 'skill_focus') {
                        return false;
                      }
                      return fid === feat.id;
                    })
                  : false;
                const isSelectedInThisSlot = featSelectSlotIndex !== null && currentSlotFeatId === feat.id;
                const isSlotCompatible = (!activeFeatSlot?.allowedCategories || activeFeatSlot.allowedCategories.includes(feat.category)) &&
                  (!activeFeatSlot?.allowedFeats || activeFeatSlot.allowedFeats.includes(feat.id));
                const isEligible = prereqsResult.met && !isAlreadyLearned && !isAlreadySelected && isSlotCompatible;
                const isTargetFeat = reqFeats.includes(feat.id);

                const childCount = Object.keys(CombatFeats.REGISTRY).filter(childId => CombatFeats.REGISTRY[childId].parent === feat.id).length;
                const hasChildren = childCount > 0;
                const isExpanded = expandedParents.has(feat.id);
                const parentFeatDef = feat.parent ? CombatFeats.REGISTRY[feat.parent] : null;
                const parentName = parentFeatDef ? (parentFeatDef.nameEn || parentFeatDef.nameDe || parentFeatDef.name) : feat.parent;

                // Color system aligned with Playerscreen:
                // Green for learned / selected, Yellow for eligible, Bleached/Locked for unmet prereqs
                let borderStyle = '0.5px dashed rgba(140, 130, 120, 0.35)';
                let borderLeftStyle = '2.5px solid rgba(140, 130, 120, 0.4)';
                let backgroundStyle = 'rgba(0, 0, 0, 0.015)';
                let titleColor = 'var(--inkl)';
                let rowOpacity = 0.48;

                if (isAlreadyLearned || isAlreadySelected || isSelectedInThisSlot) {
                  borderStyle = '0.5px solid rgba(50, 115, 55, 0.35)';
                  borderLeftStyle = '3.5px solid #2e7d32';
                  backgroundStyle = 'rgba(50, 115, 55, 0.06)';
                  titleColor = '#245e28';
                  rowOpacity = 1;
                } else if (isEligible) {
                  borderStyle = '0.5px solid rgba(184, 134, 11, 0.4)';
                  borderLeftStyle = '3px solid #b8860b';
                  backgroundStyle = 'rgba(212, 175, 55, 0.07)';
                  titleColor = '#7d5f1a';
                  rowOpacity = 1;
                }

                const categoryEn = (({ combat: 'Combat', metamagic: 'Metamagic', item_creation: 'Creation', general: 'General' } as Record<string, string>)[feat.category]) || 'General';

                return (
                  <div
                    key={feat.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      marginBottom: '3px',
                      marginLeft: depth > 0 ? `${depth * 14}px` : '0px',
                      position: 'relative'
                    }}
                  >
                    {depth > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '-10px',
                          top: '11px',
                          width: '8px',
                          height: '8px',
                          borderLeft: '1.5px solid rgba(124, 90, 43, 0.45)',
                          borderBottom: '1.5px solid rgba(124, 90, 43, 0.45)',
                          borderBottomLeftRadius: '2px',
                          pointerEvents: 'none'
                        }}
                      />
                    )}

                    <div
                      className="comp-feat-row"
                      onClick={() => {
                        if (isEligible) {
                          const nextFeats = [...(currentConfig.feats || [])];
                          const featDef = CombatFeats.REGISTRY[feat.id];
                          if (featDef?.hasOption || activeFeatSlot?.hasOption) {
                            const options = getOptionsForFeat(featDef, activeFeatSlot);
                            const defaultOpt = (currentSlotOption && options.includes(currentSlotOption)) ? currentSlotOption : (options[0] || '');
                            nextFeats[featSelectSlotIndex] = { id: feat.id, option: defaultOpt };
                            const nextOptions = { ...(currentConfig.featOptions || {}) };
                            nextOptions[featSelectSlotIndex] = defaultOpt;
                            updateLevelConfig(currentLevelIndex, 'featOptions', nextOptions);
                          } else {
                            nextFeats[featSelectSlotIndex] = feat.id;
                          }
                          updateLevelConfig(currentLevelIndex, 'feats', nextFeats);
                          setFeatSearch('');
                        } else if (isSelectedInThisSlot) {
                          const nextFeats = [...(currentConfig.feats || [])];
                          nextFeats[featSelectSlotIndex] = '';
                          updateLevelConfig(currentLevelIndex, 'feats', nextFeats);
                        }
                      }}
                      style={{
                        padding: '5px 7px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        transition: 'all 0.15s ease',
                        cursor: isEligible || isSelectedInThisSlot ? 'pointer' : 'not-allowed',
                        background: backgroundStyle,
                        border: borderStyle,
                        borderLeft: borderLeftStyle,
                        opacity: rowOpacity
                      }}
                      onMouseEnter={(e) => {
                        if (isEligible || isSelectedInThisSlot) {
                          e.currentTarget.style.filter = 'brightness(0.97)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'none';
                      }}
                    >
                      <span
                        onClick={hasChildren ? (e) => toggleParent(feat.id, e) : undefined}
                        style={{
                          fontSize: '9.5px',
                          color: 'var(--inkm)',
                          cursor: hasChildren ? 'pointer' : 'default',
                          userSelect: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '14px',
                          height: '14px',
                          flexShrink: 0,
                          lineHeight: 1,
                          marginTop: '1px'
                        }}
                        title={hasChildren ? (isExpanded ? "Collapse sub-feats" : "Expand sub-feats") : undefined}
                      >
                        {hasChildren ? (isExpanded ? '▾' : '▸') : (depth > 0 ? '•' : null)}
                      </span>

                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0, gap: '4px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                            <strong style={{ fontFamily: 'var(--font-title)', fontSize: '11px', color: titleColor, whiteSpace: 'nowrap' }}>
                              {feat.name || feat.nameEn || feat.nameDe || feat.id}
                            </strong>
                            {totemKey && isTotemFeat(feat, totemKey) && (
                              <span
                                style={{
                                  fontSize: '7.5px',
                                  padding: '1px 4px',
                                  borderRadius: '2px',
                                  background: 'rgba(139, 26, 26, 0.08)',
                                  border: '0.5px solid rgba(139, 26, 26, 0.3)',
                                  color: '#8b1a1a',
                                  fontWeight: 'bold',
                                  whiteSpace: 'nowrap'
                                }}
                                title={`Totem Skill Feat (${totemName})`}
                              >
                                Totem Skill
                              </span>
                            )}
                            {isTargetFeat && (
                              <span 
                                data-testid={`feat-target-badge-${feat.id}`}
                                style={{
                                  fontSize: '8px',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  background: isAlreadyLearned || isAlreadySelected ? 'rgba(76, 175, 80, 0.2)' : '#ffe082',
                                  color: isAlreadyLearned || isAlreadySelected ? '#2e7d32' : '#795548',
                                  fontWeight: 'bold',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                ★ Target Class
                              </span>
                            )}
                            {feat.parent && (
                              <span style={{ fontSize: '7.5px', color: '#8b6934', background: 'rgba(139, 105, 52, 0.08)', padding: '0 3px', borderRadius: '1px', border: '0.5px solid rgba(139, 105, 52, 0.2)', whiteSpace: 'nowrap', flexShrink: 0 }} title={`Prerequisite / Parent Feat: ${parentName}`}>
                                ↳ {parentName}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                            {classGrantedFeatIds.has(feat.id) ? (
                              <span style={{ fontSize: '7.5px', color: '#1b5e20', fontWeight: 'bold', background: 'rgba(76, 175, 80, 0.22)', border: '0.5px solid #2e7d32', padding: '1px 4px', borderRadius: '1.5px' }}>🛡️ Class Feature</span>
                            ) : isAlreadyLearned ? (
                              <span style={{ fontSize: '7.5px', color: '#245e28', fontWeight: 'bold', background: 'rgba(50, 115, 55, 0.12)', border: '0.5px solid rgba(50, 115, 55, 0.35)', padding: '1px 4px', borderRadius: '1.5px' }}>✓ Learned</span>
                            ) : isAlreadySelected ? (
                              <span style={{ fontSize: '7.5px', color: '#245e28', fontWeight: 'bold', background: 'rgba(50, 115, 55, 0.2)', border: '0.5px solid rgba(50, 115, 55, 0.5)', padding: '1px 4px', borderRadius: '1.5px' }}>✓ Selected</span>
                            ) : isEligible ? (
                              <span style={{ fontSize: '7.5px', color: '#7d5f1a', fontWeight: 'bold', background: 'rgba(212, 175, 55, 0.15)', border: '0.5px solid rgba(184, 134, 11, 0.4)', padding: '1px 4px', borderRadius: '1.5px' }}>Available</span>
                            ) : (
                              <span style={{ fontSize: '7.5px', color: '#7a7065', fontWeight: 'bold', background: 'rgba(0, 0, 0, 0.04)', border: '0.5px solid rgba(0, 0, 0, 0.12)', padding: '1px 3px', borderRadius: '1.5px' }}>🔒 Locked</span>
                            )}
                            <span style={{ fontSize: '7px', color: 'var(--inkm)', background: 'rgba(0,0,0,0.05)', padding: '0 3px', borderRadius: '1px', whiteSpace: 'nowrap' }}>{categoryEn}</span>
                          </div>
                        </div>

                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: isEligible || isAlreadyLearned || isAlreadySelected ? 'var(--inkm)' : 'var(--inkl)', lineHeight: 1.3, marginTop: '2px' }}>
                          {feat.benefit || feat.benefitRaw || feat.benefitEn || feat.benefitDe || feat.description}
                        </div>

                        {feat.prereqs && feat.prereqs.length > 0 && (
                          <div style={{ fontSize: '8.5px', marginTop: '2px', borderTop: '0.5px dashed rgba(200, 169, 110, 0.25)', paddingTop: '2px' }}>
                            <span style={{ color: prereqsResult.met ? '#2e7d32' : 'var(--red)', fontWeight: 'bold' }}>Prerequisites:</span>{' '}
                            {prereqsResult.unmetDescs.length > 0 ? (
                              <span style={{ color: 'var(--red)', fontStyle: 'italic' }}>
                                Not met: {prereqsResult.unmetDescs.map(translatePrereq).join(', ')}
                              </span>
                            ) : (
                              <span style={{ color: '#2e7d32', fontStyle: 'italic' }}>Met</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '40px', fontSize: '12px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center' }}>
          Select a talentslot on the left to see available feats.
        </div>
      )}
    </div>
  );
};
