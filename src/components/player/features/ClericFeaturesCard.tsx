import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { showRollBreakdown } from '@core/ui/components/dialogs.js';
import { DEITIES_REGISTRY, DOMAINS_REGISTRY, getDeity, getDomain, isAlignmentWithinOneStep } from '@core/rules.js';
import { ClassACFSelector } from './ClassACFSelector';
import { getAblMod } from '../attributeHelper';

interface ClericFeaturesCardProps {
  pc: any;
  level: number;
}

export const ClericFeaturesCard: React.FC<ClericFeaturesCardProps> = ({ pc, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [turnRulesOpen, setTurnRulesOpen] = useState(false);
  const [activeDomainTab, setActiveDomainTab] = useState<number>(0);

  const chaValue = pc.cha ? pc.cha.getValue() : 10;
  const chaMod = getAblMod(chaValue);
  
  const defaultTurnMax = Math.max(1, 3 + chaMod);
  const turnAbility = pc.dailyAbilities?.find((a: any) => a.name === "Untote vertreiben" || a.name === "Turn Undead" || a.name?.includes("Turn Undead") || a.name?.includes("Untote vertreiben"));
  const turnMax = turnAbility ? turnAbility.max : defaultTurnMax;
  const turnUsed = turnAbility ? turnAbility.used : 0;
  const turnRemaining = Math.max(0, turnMax - turnUsed);

  // Deity & Domains State
  const currentDeityKey = (pc.deity || 'none').toLowerCase();
  const currentDeity = getDeity(currentDeityKey) || DEITIES_REGISTRY.none;
  const clericDomains = Array.isArray(pc.clericDomains) ? pc.clericDomains : [];
  const domain1Key = clericDomains[0] || (currentDeity.domains[0] || 'good');
  const domain2Key = clericDomains[1] || (currentDeity.domains[1] || 'healing');

  const domain1 = getDomain(domain1Key);
  const domain2 = getDomain(domain2Key);

  // Alignment check
  const isAlignmentCompliant = !pc.alignment || currentDeity.alignment === 'ANY' || isAlignmentWithinOneStep(pc.alignment, currentDeity.alignment);

  const handleDeityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDeityId = e.target.value;
    const newDeity = getDeity(newDeityId) || DEITIES_REGISTRY.none;
    const validDomains = newDeity.domains;

    let newD1 = domain1Key;
    let newD2 = domain2Key;

    if (!validDomains.includes(newD1)) {
      newD1 = validDomains[0] || 'good';
    }
    if (!validDomains.includes(newD2) || newD2 === newD1) {
      newD2 = validDomains.find((d: string) => d !== newD1) || validDomains[0] || 'healing';
    }

    CombatState.updatePCBatch((activePC: any) => {
      activePC.deity = newDeityId;
      activePC.clericDomains = [newD1, newD2];
    });
  };

  const handleDomain1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newD1 = e.target.value;
    let newD2 = domain2Key;
    if (newD2 === newD1) {
      const alt = currentDeity.domains.find((d: string) => d !== newD1);
      if (alt) newD2 = alt;
    }
    CombatState.updatePCBatch((activePC: any) => {
      activePC.clericDomains = [newD1, newD2];
    });
  };

  const handleDomain2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newD2 = e.target.value;
    let newD1 = domain1Key;
    if (newD1 === newD2) {
      const alt = currentDeity.domains.find((d: string) => d !== newD2);
      if (alt) newD1 = alt;
    }
    CombatState.updatePCBatch((activePC: any) => {
      activePC.clericDomains = [newD1, newD2];
    });
  };

  const handleTurnBubbleClick = (idx: number) => {
    CombatState.updatePCBatch((activePC: any) => {
      if (!Array.isArray(activePC.dailyAbilities)) {
        activePC.dailyAbilities = [];
      }
      let ability = activePC.dailyAbilities.find((a: any) => a.name === "Untote vertreiben" || a.name === "Turn Undead" || a.name?.includes("Turn Undead") || a.name?.includes("Untote vertreiben"));
      if (!ability) {
        ability = { name: "Turn Undead", max: defaultTurnMax, used: 0 };
        activePC.dailyAbilities.push(ability);
      }
      if (idx <= ability.used) {
        ability.used = idx - 1;
      } else {
        ability.used = idx;
      }
    });
  };

  const handleRollTurn = (e: React.MouseEvent) => {
    showRollBreakdown("Turn Undead Check (Charisma Check)", "1d20", [
      { label: "Charisma Mod", value: chaMod }
    ], e.nativeEvent);
  };

  const availableDomainOptions = currentDeity.domains || Object.keys(DOMAINS_REGISTRY);

  return (
    <div className={`class-card ${isExpanded ? 'expanded' : ''}`} style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div 
        className="class-card-hdr" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-title)', fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🎭 Cleric (Level {level})</span>
          {currentDeity.id !== 'none' && (
            <span style={{ fontSize: '7.5px', color: 'var(--inkm)', fontWeight: 'normal', background: 'rgba(200,169,110,0.15)', padding: '1px 4px', borderRadius: '2px' }}>
              ⛪ {currentDeity.name}
            </span>
          )}
          {domain1 && domain2 && (
            <span style={{ fontSize: '7.5px', color: '#8b1a1a', fontWeight: 'bold' }}>
              [{domain1.name} / {domain2.name}]
            </span>
          )}
        </div>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', transition: 'transform 0.2s ease' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>

      {isExpanded && (
        <div className="class-card-body" style={{ display: 'flex', flexDirection: 'column', padding: '6px', width: '100%', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)', boxSizing: 'border-box' }}>
          
          {/* 1. DEITY & DOMAIN SECTION */}
          <div style={{ background: 'rgba(255, 255, 255, 0.3)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '3px', padding: '6px', marginBottom: '6px' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '8.5px', color: 'var(--red)', fontWeight: 'bold', borderBottom: '0.5px solid rgba(200,169,110,0.2)', paddingBottom: '2px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⛪ Deity &amp; Divine Domains</span>
              {!isAlignmentCompliant && (
                <span style={{ color: '#b71c1c', fontSize: '7px', fontWeight: 'bold' }} title="D&D 3.5e RAW: Cleric alignment must be within 1 step of deity alignment">
                  ⚠️ Alignment Mismatch
                </span>
              )}
            </div>

            {/* Deity Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>Deity:</span>
                <select
                  value={currentDeity.id}
                  onChange={handleDeityChange}
                  style={{ fontSize: '8px', padding: '1px 3px', border: '0.5px solid var(--pb)', borderRadius: '2px', background: 'var(--p, #fdfbf7)', color: 'var(--ink)', fontFamily: 'var(--font-body)', maxWidth: '170px' }}
                >
                  {Object.values(DEITIES_REGISTRY).map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.alignment})
                    </option>
                  ))}
                </select>
              </div>
              {currentDeity.id !== 'none' && (
                <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic', paddingLeft: '2px' }}>
                  {currentDeity.title} · Favored Weapon: {currentDeity.favoredWeapon.replace('_', ' ')}
                </div>
              )}
            </div>

            {/* Domains Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px', paddingTop: '4px', borderTop: '0.5px dashed rgba(200,169,110,0.2)' }}>
              <div>
                <div style={{ fontSize: '7.5px', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '1px' }}>Domain 1:</div>
                <select
                  value={domain1Key}
                  onChange={handleDomain1Change}
                  style={{ width: '100%', fontSize: '8px', padding: '1px 2px', border: '0.5px solid var(--pb)', borderRadius: '2px', background: 'var(--p, #fdfbf7)', color: 'var(--ink)' }}
                >
                  {availableDomainOptions.map((dKey: string) => {
                    const dom = getDomain(dKey);
                    return dom ? <option key={dKey} value={dKey}>{dom.name}</option> : null;
                  })}
                </select>
              </div>
              <div>
                <div style={{ fontSize: '7.5px', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '1px' }}>Domain 2:</div>
                <select
                  value={domain2Key}
                  onChange={handleDomain2Change}
                  style={{ width: '100%', fontSize: '8px', padding: '1px 2px', border: '0.5px solid var(--pb)', borderRadius: '2px', background: 'var(--p, #fdfbf7)', color: 'var(--ink)' }}
                >
                  {availableDomainOptions.map((dKey: string) => {
                    const dom = getDomain(dKey);
                    return dom ? <option key={dKey} value={dKey}>{dom.name}</option> : null;
                  })}
                </select>
              </div>
            </div>

            {/* Domain Tabs & Details Card */}
            <div style={{ marginTop: '6px', borderTop: '0.5px solid rgba(200, 169, 110, 0.25)', paddingTop: '4px' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                <button
                  type="button"
                  onClick={() => setActiveDomainTab(0)}
                  style={{
                    fontSize: '7.5px',
                    padding: '2px 6px',
                    borderRadius: '2px',
                    border: '0.5px solid var(--pb)',
                    background: activeDomainTab === 0 ? 'rgba(139, 26, 26, 0.12)' : 'transparent',
                    color: activeDomainTab === 0 ? '#8b1a1a' : 'var(--inkm)',
                    fontWeight: activeDomainTab === 0 ? 'bold' : 'normal',
                    cursor: 'pointer'
                  }}
                >
                  ☀️ {domain1?.name || 'Domain 1'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDomainTab(1)}
                  style={{
                    fontSize: '7.5px',
                    padding: '2px 6px',
                    borderRadius: '2px',
                    border: '0.5px solid var(--pb)',
                    background: activeDomainTab === 1 ? 'rgba(139, 26, 26, 0.12)' : 'transparent',
                    color: activeDomainTab === 1 ? '#8b1a1a' : 'var(--inkm)',
                    fontWeight: activeDomainTab === 1 ? 'bold' : 'normal',
                    cursor: 'pointer'
                  }}
                >
                  ☀️ {domain2?.name || 'Domain 2'}
                </button>
              </div>

              {(() => {
                const currentDom = activeDomainTab === 0 ? domain1 : domain2;
                if (!currentDom) return null;
                return (
                  <div style={{ background: '#f4e8c1', border: '1px solid #8b1a1a', borderRadius: '3px', padding: '5px 7px', color: '#1a0f00', fontSize: '7.5px', lineHeight: 1.3 }}>
                    <div style={{ fontWeight: 'bold', color: '#8b1a1a', fontFamily: 'var(--font-title)', fontSize: '8.5px', marginBottom: '2px' }}>
                      {currentDom.name} Domain
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Granted Power:</strong> {currentDom.grantedPower?.desc}
                    </div>
                    <div style={{ borderTop: '0.5px dashed rgba(139,26,26,0.3)', paddingTop: '3px', fontSize: '7px' }}>
                      <strong style={{ color: '#8b1a1a' }}>Domain Spells (1–9):</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px 4px', marginTop: '2px' }}>
                        {Object.entries(currentDom.spells).map(([sLvl, sKey]) => (
                          <div key={sLvl} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: 'bold', color: '#8b1a1a' }}>{sLvl}:</span> {String(sKey).replace(/_/g, ' ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 2. TURN UNDEAD SECTION */}
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', fontWeight: 'bold' }}>
            Class Features
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span><strong>Turn Undead:</strong></span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setTurnRulesOpen(!turnRulesOpen); }}
                  className="btn btn-toggle-rules-turn" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                  title="Show rules"
                >
                  📖 {turnRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ display: 'flex' }}>
                  {turnMax > 0 && Array.from({ length: turnMax }).map((_, i) => {
                    const bubbleIdx = i + 1;
                    const spent = bubbleIdx <= turnUsed;
                    return (
                      <span 
                        key={bubbleIdx}
                        onClick={(e) => { e.stopPropagation(); handleTurnBubbleClick(bubbleIdx); }}
                        className={`cleric-turn-bubble use-icon use-icon-turn ${spent ? 'used' : ''}`}
                        style={{ cursor: 'pointer' }}
                        title={spent ? 'Used' : 'Available'}
                      >
                        ☀️
                      </span>
                    );
                  })}
                </div>
                <span>({turnRemaining})</span>
              </div>
            </div>
            
            {turnRulesOpen && (
              <div className="turn-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: 'var(--font-body)' }}>
                <strong style={{ color: 'var(--red)', fontFamily: 'var(--font-title)' }}>Turn Undead:</strong><br />
                As a standard action, a cleric can attempt to turn undead creatures within a 60 ft radius.<br />
                • <strong>1. Turning Check (1d20 + CHA):</strong> Determines the maximum Hit Dice (HD) of the most powerful undead affected (Cleric level -4 to +4).<br />
                • <strong>2. Turning Damage (2d6 + Cleric level + CHA):</strong> Determines the total Hit Dice (HD) of undead affected.<br />
                • <strong>Effect:</strong> Affected undead flee for 10 rounds (1 minute). If your cleric level is at least twice the HD of the undead, it is destroyed instead.
              </div>
            )}
          </div>
          <button 
            onClick={handleRollTurn}
            className="btn roll-turn-btn" 
            style={{ fontFamily: 'var(--font-title)', fontSize: '8px', padding: '4px', width: '100%', cursor: 'pointer', marginTop: '4px' }}
          >
            Roll Turn Undead 🎲
          </button>

          {/* 3. CLASS ALTERNATIVE FEATURES */}
          <ClassACFSelector pc={pc} classKey="cleric" level={level} />
        </div>
      )}
    </div>
  );
};
