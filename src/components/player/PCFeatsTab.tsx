/**
 * @module    PCFeatsTab
 * @summary   Rendert den Talente-Tab mit erlernten Talenten (links) und interaktivem Kompendium (rechts). Prüft Voraussetzungen und zeigt Bonus-Talente nach Klasse.
 * @exports   PCFeatsTab
 * @reads     pc.feats, pc.classes, pc.bab, pc.str, pc.dex, pc.con, pc.int, pc.wis, pc.cha, pc.skills, pc.level
 * @stateOps  addPCFeat, removePCFeat
 * @depends   React, @core/state.js, @core/data/feats-data.js, @core/ui/components/dialogs.js
 */

import React, { useState, useMemo } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { CombatFeats } from '@core/data/feats-data.js';
// @ts-ignore
import { showFeatScrollDialog } from '@core/ui/components/dialogs.js';

interface PCFeatsTabProps {
  pc: any;
}

export const checkPrerequisites = (feat: any, pc: any): { met: boolean; details: Array<{ desc: string; met: boolean }> } => {
  if (!feat.prereqs || feat.prereqs.length === 0) return { met: true, details: [] };

  let met = true;
  const details: Array<{ desc: string; met: boolean }> = [];
  const learnedIds = Array.isArray(pc.feats) ? pc.feats.map((f: any) => f.id) : [];

  const getAblVal = (statObj: any) => {
    if (!statObj) return 10;
    if (typeof statObj.getValue === 'function') return statObj.getValue();
    return statObj.base ?? 10;
  };

  feat.prereqs.forEach((pr: any) => {
    let prMet = false;
    let desc = '';

    if (pr.type === 'bab') {
      const pcBab = pc.bab ? (typeof pc.bab.getValue === 'function' ? pc.bab.getValue() : pc.bab.base ?? pc.bab) : 0;
      prMet = pcBab >= pr.value;
      desc = `Grundangriffsbonus (BAB) +${pr.value} (Aktuell: +${pcBab})`;
    } else if (pr.type === 'feat') {
      prMet = learnedIds.includes(pr.id);
      const parentFeat = CombatFeats.REGISTRY[pr.id];
      const parentName = parentFeat ? parentFeat.nameDe : pr.id;
      desc = `Talent: ${parentName}`;
    } else if (pr.type === 'classLevel') {
      const cls = Array.isArray(pc.classes) ? pc.classes.find((c: any) => c.classType === pr.class) : null;
      const lvl = cls ? cls.level : 0;
      prMet = lvl >= pr.value;
      const classNameDe = pr.class === 'fighter' ? 'Kämpfer' : pr.class === 'wizard' ? 'Magier' : pr.class;
      desc = `${classNameDe} Stufe ${pr.value} (Aktuell: Stufe ${lvl})`;
    } else if (pr.type === 'class') {
      const hasCls = Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === pr.class);
      prMet = hasCls;
      const classNameDe = pr.class === 'wizard' ? 'Magier' : pr.class;
      desc = `Klasse: ${classNameDe}`;
    } else if (pr.type === 'stat') {
      const nameMap: Record<string, string> = { str: 'Stärke', dex: 'Geschicklichkeit', con: 'Konstitution', int: 'Intelligenz', wis: 'Weisheit', cha: 'Charisma' };
      const pcStat = pc[pr.name] ? getAblVal(pc[pr.name]) : 10;
      prMet = pcStat >= pr.value;
      desc = `${nameMap[pr.name] || pr.name} ${pr.value}+ (Aktuell: ${pcStat})`;
    } else if (pr.type === 'level') {
      const pcLevel = pc.level || pc.totalLevel || 1;
      prMet = pcLevel >= pr.value;
      desc = `Charakterstufe ${pr.value} (Aktuell: ${pcLevel})`;
    } else if (pr.type === 'casterLevel') {
      let maxCL = 0;
      if (Array.isArray(pc.classes)) {
        pc.classes.forEach((c: any) => {
          if (['wizard', 'cleric', 'druid', 'sorcerer', 'bard'].includes(c.classType)) {
            maxCL = Math.max(maxCL, c.level);
          } else if (['paladin', 'ranger'].includes(c.classType) && c.level >= 4) {
            maxCL = Math.max(maxCL, Math.floor(c.level / 2));
          }
        });
      }
      prMet = maxCL >= pr.value;
      desc = `Zaubererstufe ${pr.value} (Aktuell: ${maxCL})`;
    } else if (pr.type === 'custom') {
      if (pr.desc === 'Fähigkeit, Untote zu vertreiben') {
        const clericClass = Array.isArray(pc.classes) ? pc.classes.find((c: any) => c.classType === 'cleric') : null;
        const paladinClass = Array.isArray(pc.classes) ? pc.classes.find((c: any) => c.classType === 'paladin') : null;
        const clericLvl = clericClass ? clericClass.level : 0;
        const paladinLvl = paladinClass ? paladinClass.level : 0;
        prMet = clericLvl >= 1 || paladinLvl >= 4;
        desc = `Spezial: ${pr.desc} (Kleriker 1+ oder Paladin 4+)`;
      } else if (pr.desc === 'Bardenmusik') {
        const bardClass = Array.isArray(pc.classes) ? pc.classes.find((c: any) => c.classType === 'bard') : null;
        const bardLvl = bardClass ? bardClass.level : 0;
        prMet = bardLvl >= 1;
        desc = `Spezial: ${pr.desc} (Barde 1+)`;
      } else if (pr.desc === 'Tiergestalt (Wild Shape)') {
        const druidClass = Array.isArray(pc.classes) ? pc.classes.find((c: any) => c.classType === 'druid') : null;
        const druidLvl = druidClass ? druidClass.level : 0;
        prMet = druidLvl >= 5;
        desc = `Spezial: ${pr.desc} (Druide 5+)`;
      } else if (pr.desc === 'Reiten 1 Rang') {
        let ranks = 0;
        if (typeof pc.getSkillRanks === 'function') {
          ranks = pc.getSkillRanks('ride');
        } else if (pc.skills && pc.skills['ride']) {
          ranks = parseFloat(pc.skills['ride'].ranks) || 0;
        }
        prMet = ranks >= 1;
        desc = `Spezial: ${pr.desc} (aktuell: ${ranks})`;
      } else {
        prMet = true;
        desc = `Spezial: ${pr.desc}`;
      }
    }

    if (!prMet) met = false;
    details.push({ met: prMet, desc });
  });

  return { met, details };
};

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

  const hasFighter = useMemo(() => Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'fighter'), [pc.classes]);
  const hasWizard = useMemo(() => Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'wizard'), [pc.classes]);
  const hasMonk = useMemo(() => Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'monk'), [pc.classes]);

  const activeFeats = useMemo(() => Array.isArray(pc.feats) ? pc.feats : [], [pc.feats]);
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
    return activeFeats.filter((f: any) => {
      const reg = CombatFeats.REGISTRY[f.id];
      const name = reg?.nameDe ?? f.id;
      return name.toLowerCase().includes(learnedSearch.toLowerCase().trim());
    });
  }, [activeFeats, learnedSearch]);

  const compendiumList = useMemo(() => {
    const list: Array<{ feat: any; depth: number }> = [];
    const learnedIds = activeFeats.map((f: any) => f.id);

    const addFeatWithChildren = (featId: string, depth: number) => {
      const feat = CombatFeats.REGISTRY[featId];
      if (!feat) return;

      list.push({ feat, depth });

      if (learnedIds.includes(featId)) {
        Object.keys(CombatFeats.REGISTRY).forEach((childId) => {
          const child = CombatFeats.REGISTRY[childId];
          if (child.parent === featId) {
            addFeatWithChildren(childId, depth + 1);
          }
        });
      }
    };

    Object.keys(CombatFeats.REGISTRY).forEach((featId) => {
      const feat = CombatFeats.REGISTRY[featId];
      if (!feat.parent) {
        addFeatWithChildren(featId, 0);
      }
    });

    return list;
  }, [activeFeats]);

  const compendiumFiltered = useMemo(() => {
    return compendiumList.filter((item) => {
      const q = compendiumSearch.toLowerCase().trim();
      const feat = item.feat;
      const matchesSearch =
        (feat.nameDe || '').toLowerCase().includes(q) ||
        (feat.nameEn || '').toLowerCase().includes(q) ||
        feat.id.toLowerCase().includes(q) ||
        (feat.benefitDe || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (compendiumFilter !== 'all') {
        return feat.category === compendiumFilter;
      }

      return true;
    });
  }, [compendiumList, compendiumSearch, compendiumFilter]);

  const handleFeatRowClick = (feat: any, isLearned: boolean, option?: string, e?: React.MouseEvent) => {
    showFeatScrollDialog(feat, pc, isLearned, option || '', e?.nativeEvent);
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', width: '100%' }}>
      {/* Legend */}
      <div className="feats-legend" style={{ marginBottom: '8px', padding: '5px 8px', background: 'rgba(200, 169, 110, 0.05)', border: '0.5px solid var(--pb)', borderRadius: '2px', fontSize: '8.5px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 'bold', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", fontSize: '9px' }}>Legende:</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: hasFighter ? 1 : 0.5 }}>
          <span style={{ display: 'inline-block', width: '8px', height: '6px', border: '1.2px solid #2a6a2a', background: 'rgba(42, 106, 42, 0.1)', borderLeftWidth: '3px' }}></span>
          <span>Kämpfer-Bonus (Kategorie Kampf {hasFighter ? 'Aktiv' : 'Inaktiv'})</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: hasWizard ? 1 : 0.5 }}>
          <span style={{ display: 'inline-block', width: '8px', height: '6px', border: '1.2px solid #2a6a2a', background: 'rgba(42, 106, 42, 0.1)', borderLeftWidth: '3px' }}></span>
          <span>Magier-Bonus (Metamagie/Gegenstand {hasWizard ? 'Aktiv' : 'Inaktiv'})</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: hasMonk ? 1 : 0.5 }}>
          <span style={{ display: 'inline-block', width: '8px', height: '6px', border: '1.2px solid #2a6a2a', background: 'rgba(42, 106, 42, 0.1)', borderLeftWidth: '3px' }}></span>
          <span>Mönch-Bonus (Mönch-Talente {hasMonk ? 'Aktiv' : 'Inaktiv'})</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', height: '100%', minHeight: '380px' }}>
        {/* Left Column: Active Feats (40%) */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '4px', borderRight: '0.5px solid var(--pb)', paddingRight: '8px' }}>
          <h3 style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', color: 'var(--red)', borderBottom: '1px solid var(--pb)', paddingBottom: '2px', margin: '0 0 4px 0', fontWeight: 'bold', textAlign: 'center' }}>
            🧬 Talente ({activeFeats.length} / {totalMax})
          </h3>
          
          <div style={{ fontSize: '8px', fontWeight: 'normal', color: 'var(--inkm)', marginBottom: '6px', display: 'flex', flexDirection: 'column', gap: '2.5px', background: 'rgba(0,0,0,0.01)', border: '0.5px solid rgba(200, 169, 110, 0.2)', padding: '4px 6px', borderRadius: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Allgemeine Slots:</span> <strong style={{ color: 'var(--red)' }}>{generalFilled} / {generalMax}</strong></div>
            {fighterMax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Kämpfer-Slots:</span> <strong style={{ color: 'var(--red)' }}>{fighterFilled} / {fighterMax}</strong></div>}
            {wizardMax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Magier-Slots:</span> <strong style={{ color: 'var(--red)' }}>{wizardFilled} / {wizardMax}</strong></div>}
            {monkMax > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Mönch-Slots:</span> <strong style={{ color: 'var(--red)' }}>{monkFilled} / {monkMax}</strong></div>}
          </div>

          <input
            type="text"
            value={learnedSearch}
            onChange={(e) => setLearnedSearch(e.target.value)}
            placeholder="Erlernte Talente filtern..."
            className="cinput"
            style={{ height: '18px', fontSize: '9px', padding: '0 4px', marginBottom: '4px' }}
          />

          <div className="active-feats-list" style={{ flex: 1, overflowY: 'auto', maxHeight: '360px', boxSizing: 'border-box' }}>
            {learnedFeatsFiltered.length === 0 ? (
              <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '15px' }}>
                Keine Talente gefunden.
              </div>
            ) : (
              learnedFeatsFiltered.map((featInst: any, idx: number) => {
                const feat = CombatFeats.REGISTRY[featInst.id];
                if (!feat) return null;
                
                const optionLabel = featInst.option ? ` (${featInst.option})` : '';
                const categoryDe = (({ combat: 'Kampftalent', metamagic: 'Metamagie', item_creation: 'Gegenstandserschaffung', general: 'Allgemein' } as Record<string, string>)[feat.category]) || 'Allgemein';
                const isClassBonus = (getBonusFeatClass(feat) === 'fighter' && hasFighter) ||
                                     (getBonusFeatClass(feat) === 'wizard' && hasWizard) ||
                                     (getBonusFeatClass(feat) === 'monk' && hasMonk);

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
                      transition: 'transform 0.15s, background-color 0.15s',
                      border: isClassBonus ? '1.2px solid #2a6a2a' : '0.5px solid var(--pb)',
                      borderLeft: isClassBonus ? '3.5px solid #2a6a2a' : '0.5px solid var(--pb)',
                      background: isClassBonus ? 'rgba(42, 106, 42, 0.03)' : 'transparent',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = isClassBonus ? 'rgba(42, 106, 42, 0.07)' : 'rgba(200, 169, 110, 0.05)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = isClassBonus ? 'rgba(42, 106, 42, 0.03)' : 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)' }}>
                        {feat.nameDe}{optionLabel}
                        {!prereqsResult.met && (
                          <span style={{ color: 'var(--red)', marginLeft: '3px', fontSize: '8px' }} title={`Voraussetzungen nicht erfüllt!\n` + prereqsResult.details.map((d: any) => `${d.met ? '✓' : '✗'} ${d.desc}`).join('\n')}>
                            ⚠️
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: '7px', color: 'var(--inkm)', background: 'rgba(0,0,0,0.05)', padding: '0 4px', borderRadius: '1px' }}>{categoryDe}</span>
                    </div>
                    <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '8.5px', color: 'var(--inkm)', lineHeight: 1.25, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={feat.benefitDe}>
                      {feat.benefitDe}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Compendium (60%) */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Filters Header */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            <input
              type="text"
              value={compendiumSearch}
              onChange={(e) => setCompendiumSearch(e.target.value)}
              placeholder="Suchen..."
              className="cinput"
              style={{ flex: 1, fontSize: '11px', height: '18px', padding: '0 4px', fontFamily: "'Crimson Text', serif", boxSizing: 'border-box' }}
            />
            <select
              value={compendiumFilter}
              onChange={(e) => setCompendiumFilter(e.target.value)}
              className="cinput"
              style={{ flex: 1, fontSize: '11px', height: '18px', padding: '0 2px', fontFamily: "'Crimson Text', serif", boxSizing: 'border-box' }}
            >
              <option value="all">Alle Klassen</option>
              <option value="general">Allgemein</option>
              <option value="combat">Kampftalente</option>
              <option value="metamagic">Metamagie</option>
              <option value="item_creation">Erschaffung</option>
            </select>
          </div>

          <div className="compendium-feats-list" style={{ flex: 1, overflowY: 'auto', maxHeight: '340px', boxSizing: 'border-box', border: '0.5px dashed rgba(200, 169, 110, 0.2)', padding: '4px', borderRadius: '2px' }}>
            {isLimitReached && (
              <div style={{ background: 'rgba(139, 26, 26, 0.08)', border: '0.5px solid var(--red)', borderRadius: '2px', padding: '4px', marginBottom: '4px', fontFamily: "'Crimson Text', serif", fontSize: '8px', color: 'var(--red)', textAlign: 'center', fontWeight: 'bold' }}>
                ⚠️ Talentlimit erreicht ({activeFeats.length} / {totalMax}). Du musst erst ein Talent verlernen, um ein neues auszuwählen.
              </div>
            )}
            {compendiumFiltered.length === 0 ? (
              <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '15px' }}>
                Keine Talente gefunden (Filter aktiv).
              </div>
            ) : (
              compendiumFiltered.map((item) => {
                const feat = item.feat;
                const depth = item.depth;
                
                const prereqsResult = checkPrerequisites(feat, pc);
                const isAlreadyLearned = activeFeats.some((f: any) => f.id === feat.id);
                
                const bonusClass = getBonusFeatClass(feat);
                const isClassBonus = (bonusClass === 'fighter' && hasFighter) ||
                                     (bonusClass === 'wizard' && hasWizard) ||
                                     (bonusClass === 'monk' && hasMonk);

                const isBlocked = (!prereqsResult.met || isLimitReached) && !isAlreadyLearned;
                
                const borderStyle = isClassBonus ? { border: '1px solid #2a6a2a', borderLeft: '3.5px solid #2a6a2a' } : { border: '0.5px solid var(--pb)' };
                const backgroundStyle = isClassBonus ? 'rgba(42, 106, 42, 0.04)' : 'transparent';
                const opacityStyle = isBlocked ? { opacity: 0.5, cursor: 'not-allowed' } : { cursor: 'pointer' };
                
                let icon = '⚪';
                if (isAlreadyLearned) icon = '🟢';
                else if (isBlocked) icon = '🔒';
                
                const categoryDe = (({ combat: 'Kampf', metamagic: 'Metamagie', item_creation: 'Erschaffung', general: 'Allgemein' } as Record<string, string>)[feat.category]) || 'Allgemein';
                const depthPadding = depth * 14;

                const matchingInstance = activeFeats.find((f: any) => f.id === feat.id);
                const option = matchingInstance ? matchingInstance.option : '';

                return (
                  <div
                    key={feat.id}
                    className="comp-feat-row"
                    onClick={(e) => {
                      if (!isBlocked || isAlreadyLearned) {
                        handleFeatRowClick(feat, isAlreadyLearned, option, e);
                      }
                    }}
                    style={{
                      padding: '4px 6px',
                      marginBottom: '3px',
                      borderRadius: '2px',
                      marginLeft: `${depthPadding}px`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background-color 0.15s, opacity 0.15s',
                      background: backgroundStyle,
                      ...borderStyle,
                      ...opacityStyle
                    }}
                    onMouseOver={(e) => {
                      if (!isBlocked) {
                        e.currentTarget.style.background = isClassBonus ? 'rgba(42, 106, 42, 0.08)' : 'rgba(200, 169, 110, 0.05)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = backgroundStyle;
                    }}
                  >
                    <span style={{ fontSize: '8px', flexShrink: 0 }}>{icon}</span>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>{feat.nameDe}</span>
                        <span style={{ fontSize: '6.5px', color: 'var(--inkm)', background: 'rgba(0,0,0,0.05)', padding: '0 3px', borderRadius: '1px', marginLeft: 'auto' }}>{categoryDe}</span>
                      </div>
                      <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '8px', color: 'var(--inkm)', lineHeight: 1.25, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={feat.benefitDe}>
                        {feat.benefitDe}
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
  );
};
