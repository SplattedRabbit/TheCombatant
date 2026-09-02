/**
 * @module    CompendiumFeatsList
 * @summary   Right column of PCFeatsTab: searchable, filtered hierarchical feat compendium tree with availability indicators.
 */

import React, { useState, useMemo } from 'react';
import { CombatFeats } from '@core/data/feats-data.js';
import { checkPrerequisites } from '@core/rules/RulesFeats.js';

interface CompendiumFeatsListProps {
  pc: any;
  activeFeats: any[];
  totalMax: number;
  isLimitReached: boolean;
  onFeatClick: (feat: any, isLearned: boolean, option?: string, e?: React.MouseEvent) => void;
}

export const CompendiumFeatsList: React.FC<CompendiumFeatsListProps> = ({
  pc,
  activeFeats,
  totalMax,
  isLimitReached,
  onFeatClick,
}) => {
  const [compendiumSearch, setCompendiumSearch] = useState('');
  const [compendiumFilter, setCompendiumFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showOnlyMet, setShowOnlyMet] = useState<boolean>(false);
  const [visibleLimit, setVisibleLimit] = useState<number>(30);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    setVisibleLimit(30);
  }, [compendiumSearch, compendiumFilter, sourceFilter, showOnlyMet]);

  const compendiumList = useMemo(() => {
    const list: Array<{ feat: any; depth: number }> = [];
    const visited = new Set<string>();

    const addFeatWithChildren = (featId: string, depth: number) => {
      if (visited.has(featId)) return;
      visited.add(featId);

      const feat = CombatFeats.REGISTRY[featId];
      if (!feat) return;

      list.push({ feat, depth });

      Object.keys(CombatFeats.REGISTRY).forEach((childId) => {
        const child = CombatFeats.REGISTRY[childId];
        if (child.parent === featId) {
          addFeatWithChildren(childId, depth + 1);
        }
      });
    };

    Object.keys(CombatFeats.REGISTRY).forEach((featId) => {
      const feat = CombatFeats.REGISTRY[featId];
      if (!feat.parent) {
        addFeatWithChildren(featId, 0);
      }
    });

    return list;
  }, []);

  const compendiumFiltered = useMemo(() => {
    const visibleList: Array<{ feat: any; depth: number }> = [];
    const isSearching = compendiumSearch.trim().length > 0;
    
    compendiumList.forEach(item => {
      const feat = item.feat;
      let showItem = true;
      if (!isSearching && item.depth > 0) {
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

    return visibleList.filter((item) => {
      const q = compendiumSearch.toLowerCase().trim();
      const feat = item.feat;
      
      const matchesSearch =
        (feat.nameDe || '').toLowerCase().includes(q) ||
        (feat.nameEn || '').toLowerCase().includes(q) ||
        feat.id.toLowerCase().includes(q) ||
        (feat.benefitDe || '').toLowerCase().includes(q) ||
        (feat.benefitEn || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (compendiumFilter !== 'all' && feat.category !== compendiumFilter) {
        return false;
      }

      if (sourceFilter !== 'all' && feat.source !== sourceFilter) {
        return false;
      }

      if (showOnlyMet) {
        const prereqsResult = checkPrerequisites(feat, pc);
        if (!prereqsResult.met) return false;
      }

      return true;
    });
  }, [compendiumList, compendiumSearch, compendiumFilter, sourceFilter, showOnlyMet, expandedParents, pc]);

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 40) {
      setVisibleLimit(prev => Math.min(prev + 30, compendiumFiltered.length));
    }
  };

  return (
    <div style={{ flex: '6 1 0%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* Filters Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '4px', minWidth: 0 }}>
        <div style={{ display: 'flex', gap: '3px', minWidth: 0 }}>
          <input
            type="text"
            value={compendiumSearch}
            onChange={(e) => setCompendiumSearch(e.target.value)}
            placeholder="Search..."
            className="cinput"
            style={{ flex: 1.5, minWidth: 0, fontSize: '10px', height: '18px', padding: '0 4px', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
          />
          <select
            value={compendiumFilter}
            onChange={(e) => setCompendiumFilter(e.target.value)}
            className="cinput"
            style={{ flex: 1, minWidth: 0, fontSize: '10px', height: '18px', padding: 0, fontFamily: 'var(--font-body)', boxSizing: 'border-box', cursor: 'pointer' }}
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="combat">Combat Feats</option>
            <option value="metamagic">Metamagic</option>
            <option value="item_creation">Item Creation</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="cinput"
            style={{ flex: 1, minWidth: 0, fontSize: '10px', height: '18px', padding: 0, fontFamily: 'var(--font-body)', boxSizing: 'border-box', cursor: 'pointer' }}
          >
            <option value="all">All Books</option>
            <option value="phb">PHB</option>
            <option value="phb2">PHB2</option>
            <option value="ca">CA</option>
            <option value="cs">CS</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 2px', minWidth: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', color: 'var(--inkl)', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={showOnlyMet}
              onChange={(e) => setShowOnlyMet(e.target.checked)}
              style={{ width: '10px', height: '10px', cursor: 'pointer', margin: 0, flexShrink: 0 }}
            />
            <span>Only show feats with met prerequisites</span>
          </label>
        </div>
      </div>

      <div
        onScroll={handleScroll}
        className="compendium-feats-scroll"
        style={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          maxHeight: '340px',
          boxSizing: 'border-box',
          paddingRight: '4px'
        }}
      >
        <div
          className="compendium-feats-list"
          style={{
            border: '0.5px dashed rgba(200, 169, 110, 0.25)',
            borderRadius: '2px',
            padding: '4px',
            boxSizing: 'border-box',
            minWidth: 0,
            overflowX: 'hidden'
          }}
        >
          {isLimitReached && (
            <div style={{ background: 'rgba(139, 26, 26, 0.08)', border: '0.5px solid var(--red)', borderRadius: '2px', padding: '4px', marginBottom: '4px', fontFamily: 'var(--font-body)', fontSize: '8px', color: 'var(--red)', textAlign: 'center', fontWeight: 'bold' }}>
              ⚠️ Feat limit reached ({activeFeats.length} / {totalMax}). You must first remove a feat to choose a new one.
            </div>
          )}
          {compendiumFiltered.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '15px' }}>
              No feats found (filter active).
            </div>
          ) : (
            compendiumFiltered.slice(0, visibleLimit).map((item) => {
              const feat = item.feat;
              const depth = item.depth;
              
              const prereqsResult = checkPrerequisites(feat, pc);
              const isAlreadyLearned = activeFeats.some((f: any) => f.id === feat.id);
              const isEligible = prereqsResult.met && !isAlreadyLearned && !isLimitReached;

              const matchingInstance = activeFeats.find((f: any) => f.id === feat.id);
              const option = matchingInstance ? matchingInstance.option : '';

              const childCount = Object.keys(CombatFeats.REGISTRY).filter(childId => CombatFeats.REGISTRY[childId].parent === feat.id).length;
              const hasChildren = childCount > 0;
              const isExpanded = expandedParents.has(feat.id);
              const parentFeatDef = feat.parent ? CombatFeats.REGISTRY[feat.parent] : null;
              const parentName = parentFeatDef ? (parentFeatDef.nameEn || parentFeatDef.nameDe) : feat.parent;

              let borderStyle = '0.5px dashed rgba(140, 130, 120, 0.35)';
              let borderLeftStyle = '2.5px solid rgba(140, 130, 120, 0.4)';
              let backgroundStyle = 'rgba(0, 0, 0, 0.015)';
              let titleColor = 'var(--inkl)';
              let rowOpacity = 0.48;
              
              if (isAlreadyLearned) {
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
                        top: '10px',
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
                    onClick={(e) => {
                      onFeatClick(feat, isAlreadyLearned, option, e);
                    }}
                    style={{
                      padding: '4px 6px',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      minWidth: 0,
                      boxSizing: 'border-box',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                      background: backgroundStyle,
                      border: borderStyle,
                      borderLeft: borderLeftStyle,
                      opacity: rowOpacity
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.filter = 'brightness(0.97)';
                    }}
                    onMouseOut={(e) => {
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
                        width: '12px',
                        height: '12px',
                        flexShrink: 0,
                        lineHeight: 1
                      }}
                      title={hasChildren ? (isExpanded ? "Collapse tree" : `Expand sub-feats`) : undefined}
                    >
                      {hasChildren ? (isExpanded ? '▾' : '▸') : (depth > 0 ? '•' : null)}
                    </span>

                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0, gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, overflow: 'hidden' }}>
                          <span style={{ fontFamily: 'var(--font-title)', fontSize: '9px', fontWeight: isEligible || isAlreadyLearned ? 'bold' : '600', color: titleColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {feat.nameEn || feat.nameDe}
                          </span>
                          {feat.parent && (
                            <span style={{ fontSize: '6.5px', color: '#8b6934', background: 'rgba(139, 105, 52, 0.08)', padding: '0 3px', borderRadius: '1px', border: '0.5px solid rgba(139, 105, 52, 0.2)', whiteSpace: 'nowrap', flexShrink: 0 }} title={`Prerequisite / Parent Feat: ${parentName}`}>
                              ↳ {parentName}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                          {isAlreadyLearned ? (
                            <span style={{ fontSize: '7px', color: '#245e28', fontWeight: 'bold', background: 'rgba(50, 115, 55, 0.12)', border: '0.5px solid rgba(50, 115, 55, 0.35)', padding: '1px 4px', borderRadius: '1.5px' }}>✓ Learned</span>
                          ) : isEligible ? (
                            <span style={{ fontSize: '7px', color: '#7d5f1a', fontWeight: 'bold', background: 'rgba(212, 175, 55, 0.15)', border: '0.5px solid rgba(184, 134, 11, 0.4)', padding: '1px 4px', borderRadius: '1.5px' }}>
                              Available
                            </span>
                          ) : (
                            <span style={{ fontSize: '7px', color: '#7a7065', fontWeight: 'bold', background: 'rgba(0, 0, 0, 0.04)', border: '0.5px solid rgba(0, 0, 0, 0.12)', padding: '1px 3px', borderRadius: '1.5px' }}>🔒 Locked</span>
                          )}
                          <span style={{ fontSize: '6.5px', color: 'var(--inkm)', background: 'rgba(0,0,0,0.05)', padding: '0 3px', borderRadius: '1px', whiteSpace: 'nowrap' }}>{categoryEn}</span>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '8.5px', color: isEligible || isAlreadyLearned ? 'var(--inkm)' : 'var(--inkl)', lineHeight: 1.25, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0 }} title={feat.benefitRaw || feat.benefitEn || feat.benefitDe}>
                        {feat.benefitRaw || feat.benefitEn || feat.benefitDe}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
