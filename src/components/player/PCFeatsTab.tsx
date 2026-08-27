/**
 * @module    PCFeatsTab
 * @summary   Renders the Feats tab with learned feats (left) and interactive compendium (right). Checks prerequisites and shows class-specific bonus feats.
 * @exports   PCFeatsTab
 * @reads     pc.feats, pc.classes, pc.bab, pc.str, pc.dex, pc.con, pc.int, pc.wis, pc.cha, pc.skills, pc.level
 * @stateOps  addPCFeat, removePCFeat
 * @depends   React, @core/state.js, @core/data/feats-data.js, @core/ui/components/dialogs.js
 */

import React, { useState, useMemo } from 'react';
import { CombatFeats } from '@core/data/feats-data.js';
import { showFeatScrollDialog } from '@core/ui/components/dialogs.js';
import { checkPrerequisites } from '@core/rules/RulesFeats.js';

interface PCFeatsTabProps {
  pc: any;
}

// checkPrerequisites is now the canonical implementation in js/rules/RulesFeats.js
// Re-exported here for backwards compatibility with any direct imports from this module.
export { checkPrerequisites };

const getBonusFeatClass = (feat: any) => {
  if (feat.category === 'combat') return 'fighter';
  if (feat.category === 'metamagic' || feat.category === 'item_creation') return 'wizard';
  const monkBonusIds = ['improved_unarmed_strike', 'improved_grapple', 'deflect_arrows', 'snatch_arrows', 'stunning_fist', 'improved_trip', 'improved_overrun'];
  if (monkBonusIds.includes(feat.id)) return 'monk';
  return null;
};

export const PCFeatsTab: React.FC<PCFeatsTabProps> = ({ pc }) => {
  const [learnedSearch, setLearnedSearch] = useState('');
  const [compendiumSearch, setCompendiumSearch] = useState('');
  const [compendiumFilter, setCompendiumFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showOnlyMet, setShowOnlyMet] = useState<boolean>(false);
  const [visibleLimit, setVisibleLimit] = useState<number>(30);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    setVisibleLimit(30);
  }, [compendiumSearch, compendiumFilter, sourceFilter, showOnlyMet]);

  const hasFighter = useMemo(() => Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'fighter'), [pc.classes]);
  const hasWizard = useMemo(() => Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'wizard'), [pc.classes]);
  const hasMonk = useMemo(() => Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'monk'), [pc.classes]);

  const autoFeats = useMemo(() => typeof pc.getAutomaticFeats === 'function' ? pc.getAutomaticFeats() : [], [pc.classes, pc.rangerCombatStyle]);
  const activeFeats = useMemo(() => Array.isArray(pc.feats) ? pc.feats : [], [pc.feats]);
  
  const combinedFeats = useMemo(() => {
    const list = [...activeFeats.map((f: any) => ({ ...f, isAutomatic: false }))];
    autoFeats.forEach((af: any) => {
      if (!list.some((lf: any) => lf.id === af.id)) {
        list.push({ id: af.id, isAutomatic: true, source: af.source });
      }
    });
    return list;
  }, [activeFeats, autoFeats]);

  const activeClasses = useMemo(() => Array.isArray(pc.classes) ? pc.classes : [], [pc.classes]);

  const totalLevel = useMemo(() => activeClasses.reduce((sum: number, c: any) => sum + (c.level || 0), 0) || 1, [activeClasses]);
  const raceStr = useMemo(() => (pc.race || '').toLowerCase(), [pc.race]);
  const isHuman = useMemo(() => pc.isHuman !== undefined ? !!pc.isHuman : (raceStr === 'human' || raceStr === 'mensch' || raceStr === ''), [pc.isHuman, raceStr]);

  const generalMax = useMemo(() => 1 + Math.floor((totalLevel - 1) / 3) + (isHuman ? 1 : 0), [totalLevel, isHuman]);
  
  const fighterMax = useMemo(() => {
    const fighterClass = activeClasses.find((c: any) => c.classType === 'fighter');
    return fighterClass ? 1 + Math.floor(fighterClass.level / 2) : 0;
  }, [activeClasses]);

  const wizardMax = useMemo(() => {
    const wizardClass = activeClasses.find((c: any) => c.classType === 'wizard');
    return wizardClass ? 1 + Math.floor(wizardClass.level / 5) : 0;
  }, [activeClasses]);

  const monkMax = useMemo(() => {
    const monkClass = activeClasses.find((c: any) => c.classType === 'monk');
    return monkClass ? (monkClass.level >= 6 ? 3 : (monkClass.level >= 2 ? 2 : (monkClass.level >= 1 ? 1 : 0))) : 0;
  }, [activeClasses]);

  const totalMax = useMemo(() => generalMax + fighterMax + wizardMax + monkMax, [generalMax, fighterMax, wizardMax, monkMax]);

  const { generalFilled, fighterFilled, wizardFilled, monkFilled } = useMemo(() => {
    const monkBonusIds = ['improved_unarmed_strike', 'improved_grapple', 'deflect_arrows', 'snatch_arrows', 'stunning_fist', 'improved_trip', 'improved_overrun'];
    let monkFilled = 0;
    let wizardFilled = 0;
    let fighterFilled = 0;
    let generalFilled = 0;

    for (const f of activeFeats) {
      const featDef = CombatFeats.REGISTRY[f.id];
      if (!featDef) continue;
      if (monkMax > 0 && monkFilled < monkMax && monkBonusIds.includes(f.id)) {
        monkFilled++;
      } else if (wizardMax > 0 && wizardFilled < wizardMax && (featDef.category === 'metamagic' || featDef.category === 'item_creation')) {
        wizardFilled++;
      } else if (fighterMax > 0 && fighterFilled < fighterMax && featDef.category === 'combat') {
        fighterFilled++;
      } else {
        generalFilled++;
      }
    }

    return { generalFilled, fighterFilled, wizardFilled, monkFilled };
  }, [activeFeats, monkMax, wizardMax, fighterMax]);

  const isLimitReached = useMemo(() => activeFeats.length >= totalMax, [activeFeats.length, totalMax]);

  const learnedFeatsFiltered = useMemo(() => {
    return combinedFeats.filter((f: any) => {
      const reg = CombatFeats.REGISTRY[f.id];
      const name = (reg?.nameEn || reg?.nameDe) ?? f.id;
      return name.toLowerCase().includes(learnedSearch.toLowerCase().trim());
    });
  }, [combinedFeats, learnedSearch]);

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

  const handleFeatRowClick = (feat: any, isLearned: boolean, option?: string, e?: React.MouseEvent) => {
    showFeatScrollDialog(feat, pc, isLearned, option || '', e?.nativeEvent);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', width: '100%', minWidth: 0, overflowX: 'hidden' }}>
      {/* Legend */}
      <div className="feats-legend" style={{ marginBottom: '8px', padding: '5px 8px', background: 'rgba(200, 169, 110, 0.05)', border: '0.5px solid var(--pb)', borderRadius: '2px', fontSize: '8.5px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
        <span style={{ fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)', fontSize: '9px' }}>Legend:</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: hasFighter ? 1 : 0.5 }}>
          <span style={{ display: 'inline-block', width: '8px', height: '6px', border: '1.2px solid #2a6a2a', background: 'rgba(42, 106, 42, 0.1)', borderLeftWidth: '3px' }}></span>
          <span>Fighter Bonus (Combat Category {hasFighter ? 'Active' : 'Inactive'})</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: hasWizard ? 1 : 0.5 }}>
          <span style={{ display: 'inline-block', width: '8px', height: '6px', border: '1.2px solid #2a6a2a', background: 'rgba(42, 106, 42, 0.1)', borderLeftWidth: '3px' }}></span>
          <span>Wizard Bonus (Metamagic/Item Creation {hasWizard ? 'Active' : 'Inactive'})</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: hasMonk ? 1 : 0.5 }}>
          <span style={{ display: 'inline-block', width: '8px', height: '6px', border: '1.2px solid #2a6a2a', background: 'rgba(42, 106, 42, 0.1)', borderLeftWidth: '3px' }}></span>
          <span>Monk Bonus (Monk Feats {hasMonk ? 'Active' : 'Inactive'})</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', height: '100%', minHeight: '380px', width: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
        {/* Left Column: Active Feats (40%) */}
        <div style={{ flex: '4 1 0%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', borderRight: '0.5px solid var(--pb)', paddingRight: '8px', boxSizing: 'border-box', overflowX: 'hidden' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '11px', color: 'var(--red)', borderBottom: '1px solid var(--pb)', paddingBottom: '2px', margin: '0 0 4px 0', fontWeight: 'bold', textAlign: 'center' }}>
            🧬 Feats ({activeFeats.length} / {totalMax})
          </h3>
          
          <div style={{ fontSize: '8px', fontWeight: 'normal', color: 'var(--inkm)', marginBottom: '6px', display: 'flex', flexDirection: 'column', gap: '2.5px', background: 'rgba(0,0,0,0.01)', border: '0.5px solid rgba(200, 169, 110, 0.2)', padding: '4px 6px', borderRadius: '2px', minWidth: 0, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>General Slots:</span> <strong style={{ color: 'var(--red)' }}>{generalFilled} / {generalMax}</strong></div>
            {fighterMax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Fighter Slots:</span> <strong style={{ color: 'var(--red)' }}>{fighterFilled} / {fighterMax}</strong></div>}
            {wizardMax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Wizard Slots:</span> <strong style={{ color: 'var(--red)' }}>{wizardFilled} / {wizardMax}</strong></div>}
            {monkMax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Monk Slots:</span> <strong style={{ color: 'var(--red)' }}>{monkFilled} / {monkMax}</strong></div>}
          </div>

          <input
            type="text"
            value={learnedSearch}
            onChange={(e) => setLearnedSearch(e.target.value)}
            placeholder="Filter learned feats..."
            className="cinput"
            style={{ height: '18px', fontSize: '9px', padding: '0 4px', marginBottom: '4px', minWidth: 0, width: '100%', boxSizing: 'border-box' }}
          />

          <div className="active-feats-list" style={{ flex: 1, minWidth: 0, width: '100%', overflowY: 'auto', overflowX: 'hidden', maxHeight: '360px', boxSizing: 'border-box' }}>
            {learnedFeatsFiltered.length === 0 ? (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '15px' }}>
                No feats found.
              </div>
            ) : (
              learnedFeatsFiltered.map((featInst: any, idx: number) => {
                const feat = CombatFeats.REGISTRY[featInst.id];
                if (!feat) return null;
                
                const optionLabel = featInst.option ? ` (${featInst.option})` : '';
                const categoryEn = (({ combat: 'Combat Feat', metamagic: 'Metamagic', item_creation: 'Item Creation', general: 'General' } as Record<string, string>)[feat.category]) || 'General';
                
                const isAutomatic = featInst.isAutomatic;
                const isClassBonus = !isAutomatic && ((getBonusFeatClass(feat) === 'fighter' && hasFighter) ||
                                     (getBonusFeatClass(feat) === 'wizard' && hasWizard) ||
                                     (getBonusFeatClass(feat) === 'monk' && hasMonk));

                const borderStyle = '0.5px solid rgba(50, 115, 55, 0.35)';
                const borderLeftStyle = isAutomatic ? '3.5px solid #4a6d44' : '3.5px solid #2e7d32';
                const backgroundVal = isAutomatic ? 'rgba(70, 105, 65, 0.05)' : 'rgba(50, 115, 55, 0.06)';
                const hoverBackgroundVal = isAutomatic ? 'rgba(70, 105, 65, 0.09)' : 'rgba(50, 115, 55, 0.11)';

                const prereqsResult = checkPrerequisites(feat, pc);

                return (
                  <div
                    key={featInst.id + '_' + idx}
                    className="active-feat-card"
                    onClick={(e) => handleFeatRowClick(feat, true, featInst.option, e)}
                    style={{
                      padding: '6px 8px',
                      marginBottom: '4px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      minWidth: 0,
                      boxSizing: 'border-box',
                      transition: 'transform 0.15s, background-color 0.15s',
                      border: borderStyle,
                      borderLeft: borderLeftStyle,
                      background: backgroundVal,
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = hoverBackgroundVal;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = backgroundVal;
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0, gap: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-title)', fontSize: '9.5px', fontWeight: 'bold', color: '#245e28', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        {feat.nameEn || feat.nameDe}{optionLabel}
                        {!prereqsResult.met && (
                          <span style={{ color: 'var(--red)', marginLeft: '3px', fontSize: '8px' }} title={`Prerequisites not met!\n` + prereqsResult.details.map((d: any) => `${d.met ? '✓' : '✗'} ${d.desc}`).join('\n')}>
                            ⚠️
                          </span>
                        )}
                      </span>
                      <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                        {isAutomatic && (
                          <span style={{ fontSize: '7px', color: '#4a6d44', background: 'rgba(70, 105, 65, 0.12)', border: '0.5px solid rgba(70, 105, 65, 0.3)', padding: '0 4px', borderRadius: '1px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {featInst.source || 'Class Feat'}
                          </span>
                        )}
                        {isClassBonus && (
                          <span style={{ fontSize: '7px', color: '#245e28', background: 'rgba(50, 115, 55, 0.12)', border: '0.5px solid rgba(50, 115, 55, 0.3)', padding: '0 4px', borderRadius: '1px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            Bonus Feat
                          </span>
                        )}
                        <span style={{ fontSize: '7px', color: 'var(--inkm)', background: 'rgba(0,0,0,0.05)', padding: '0 4px', borderRadius: '1px', whiteSpace: 'nowrap' }}>{categoryEn}</span>
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '8.5px', color: 'var(--inkm)', lineHeight: 1.25, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', minWidth: 0 }} title={feat.benefitRaw || feat.benefitEn || feat.benefitDe}>
                      {feat.benefitRaw || feat.benefitEn || feat.benefitDe}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Compendium (60%) */}
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

                  // Collapsible parent check
                  const childCount = Object.keys(CombatFeats.REGISTRY).filter(childId => CombatFeats.REGISTRY[childId].parent === feat.id).length;
                  const hasChildren = childCount > 0;
                  const isExpanded = expandedParents.has(feat.id);
                  const parentFeatDef = feat.parent ? CombatFeats.REGISTRY[feat.parent] : null;
                  const parentName = parentFeatDef ? (parentFeatDef.nameEn || parentFeatDef.nameDe) : feat.parent;

                  // Border & background styling based on 3 user statuses:
                  // 1. Grün: Wurde gelernt (isAlreadyLearned)
                  // 2. Gelb: Kann gelernt werden (isEligible)
                  // 3. Ausgebleicht: Nicht verfügbar (isLocked / !prereqsResult.met)
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
                      {/* Tree Branch Connector Line */}
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
                          handleFeatRowClick(feat, isAlreadyLearned, option, e);
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
                        {/* Dedicated fixed-width expand arrow or alignment placeholder */}
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
      </div>
    </div>
  );
};
