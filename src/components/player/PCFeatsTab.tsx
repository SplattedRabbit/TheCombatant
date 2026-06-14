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

export const PCFeatsTab: React.FC<PCFeatsTabProps> = ({ pc }) => {
  const [learnedSearch, setLearnedSearch] = useState('');
  const [compendiumSearch, setCompendiumSearch] = useState('');
  const [compendiumFilter, setCompendiumFilter] = useState<string>('all');

  const learnedFeats = Array.isArray(pc.feats) ? pc.feats : [];

  const learnedFeatsFiltered = useMemo(() => {
    return learnedFeats.filter((f: any) => {
      const reg = CombatFeats.REGISTRY[f.id];
      const name = reg?.nameDe ?? f.id;
      return name.toLowerCase().includes(learnedSearch.toLowerCase().trim());
    });
  }, [learnedFeats, learnedSearch]);

  const compendiumList = useMemo(() => {
    const list: Array<{ feat: any; depth: number }> = [];
    const learnedIds = learnedFeats.map((f: any) => f.id);

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
  }, [learnedFeats]);

  const compendiumFiltered = useMemo(() => {
    return compendiumList.filter((item) => {
      const q = compendiumSearch.toLowerCase().trim();
      const feat = item.feat;
      const matchesSearch =
        (feat.nameDe || '').toLowerCase().includes(q) ||
        (feat.nameEn || '').toLowerCase().includes(q) ||
        feat.id.toLowerCase().includes(q);

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

  const getCategoryLabel = (cat: string) => {
    return {
      general: 'Allgemein',
      combat: 'Kampf',
      magic: 'Magie',
      metamagic: 'Metamagie',
      item_creation: 'Gegenstand'
    }[cat] || cat;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', height: '100%', boxSizing: 'border-box' }}>
      {/* Left Column: Learned Feats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '0.5px solid rgba(200, 169, 110, 0.2)', paddingRight: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '10px', color: 'var(--red)', fontWeight: 'bold' }}>
            🧬 Erlernte Talente ({learnedFeats.length})
          </div>
        </div>

        <input
          type="text"
          value={learnedSearch}
          onChange={(e) => setLearnedSearch(e.target.value)}
          placeholder="Erlernte Talente filtern..."
          className="cinput"
          style={{ height: '18px', fontSize: '9px', padding: '0 4px' }}
        />

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '250px' }}>
          {learnedFeatsFiltered.length === 0 ? (
            <div style={{ fontStyle: 'italic', fontSize: '9px', color: 'var(--inkl)', padding: '10px', textAlign: 'center' }}>
              Keine Talente gefunden.
            </div>
          ) : (
            learnedFeatsFiltered.map((f: any, idx: number) => {
              const feat = CombatFeats.REGISTRY[f.id];
              const name = feat?.nameDe ?? f.id;
              const prereqsResult = feat ? checkPrerequisites(feat, pc) : { met: true, details: [] };

              return (
                <div
                  key={f.id + '_' + idx}
                  onClick={(e) => handleFeatRowClick(feat || { id: f.id, nameDe: f.id }, true, f.option, e)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(200, 169, 110, 0.04)',
                    border: '0.5px solid var(--pb)',
                    borderRadius: '2px',
                    padding: '3px 6px',
                    cursor: 'pointer',
                    fontSize: '9px',
                    fontFamily: "'Crimson Text', serif",
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(200, 169, 110, 0.09)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(200, 169, 110, 0.04)')}
                >
                  <span style={{ fontWeight: 'bold', color: 'var(--red)' }}>
                    {name} {f.option ? `(${f.option})` : ''}
                    {!prereqsResult.met && (
                      <span style={{ color: 'var(--red)', marginLeft: '3px', fontSize: '8px' }} title={`Voraussetzungen nicht erfüllt!\n` + prereqsResult.details.map(d => `${d.met ? '✅' : '❌'} ${d.desc}`).join('\n')}>
                        ⚠️
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '8px', color: 'var(--inkl)', background: 'rgba(0,0,0,0.05)', padding: '1px 3px', borderRadius: '2px' }}>
                    {getCategoryLabel(feat?.category)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Compendium */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '10px', color: 'var(--red)', fontWeight: 'bold' }}>
          📖 Talente-Kompendium
        </div>

        <div style={{ display: 'flex', gap: '2px' }}>
          <input
            type="text"
            value={compendiumSearch}
            onChange={(e) => setCompendiumSearch(e.target.value)}
            placeholder="Kompendium durchsuchen..."
            className="cinput"
            style={{ height: '18px', fontSize: '9px', padding: '0 4px', flex: 1 }}
          />
          <select
            value={compendiumFilter}
            onChange={(e) => setCompendiumFilter(e.target.value)}
            className="cinput"
            style={{ height: '18px', fontSize: '9px', width: '75px', padding: 0 }}
          >
            <option value="all">Alle</option>
            <option value="general">Allgemein</option>
            <option value="combat">Kampf</option>
            <option value="magic">Magie</option>
            <option value="metamagic">Metamagie</option>
            <option value="item_creation">Gegenstände</option>
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '250px' }}>
          {compendiumFiltered.length === 0 ? (
            <div style={{ fontStyle: 'italic', fontSize: '9px', color: 'var(--inkl)', padding: '10px', textAlign: 'center' }}>
              Keine Treffer im Kompendium.
            </div>
          ) : (
            compendiumFiltered.map((item) => {
              const feat = item.feat;
              const isLearned = learnedFeats.some((f: any) => f.id === feat.id);
              const matchingFeat = learnedFeats.find((f: any) => f.id === feat.id);
              const prereqsResult = checkPrerequisites(feat, pc);

              const rowStyle: React.CSSProperties = {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                border: '0.5px solid rgba(200, 169, 110, 0.15)',
                borderRadius: '2px',
                padding: '3px 6px',
                cursor: 'pointer',
                fontSize: '9px',
                fontFamily: "'Crimson Text', serif",
                transition: 'background 0.15s',
                marginLeft: `${item.depth * 8}px`
              };

              return (
                <div
                  key={feat.id}
                  onClick={(e) => handleFeatRowClick(feat, isLearned, matchingFeat?.option, e)}
                  style={rowStyle}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(200, 169, 110, 0.05)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{
                    color: isLearned ? 'var(--red)' : 'var(--ink)',
                    fontWeight: isLearned ? 'bold' : 'normal',
                    opacity: !prereqsResult.met && !isLearned ? 0.6 : 1
                  }}>
                    {item.depth > 0 ? '↳ ' : ''}
                    {feat.nameDe}
                    {!prereqsResult.met && !isLearned && (
                      <span style={{ color: 'var(--red)', marginLeft: '3px', fontSize: '8px' }} title={`Voraussetzungen nicht erfüllt!\n` + prereqsResult.details.map(d => `${d.met ? '✅' : '❌'} ${d.desc}`).join('\n')}>
                        ⚠️
                      </span>
                    )}
                    {isLearned && <span style={{ color: 'green', marginLeft: '3px' }}>✓</span>}
                  </span>
                  <span style={{ fontSize: '8px', color: 'var(--inkl)' }}>
                    {getCategoryLabel(feat.category)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
