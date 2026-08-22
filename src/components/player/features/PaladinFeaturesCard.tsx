import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { showRollBreakdown } from '@core/ui/components/dialogs.js';
import { ClassACFSelector } from './ClassACFSelector';
import { getAblMod } from '../attributeHelper';

interface PaladinFeaturesCardProps {
  pc: any;
  level: number;
}

export const PaladinFeaturesCard: React.FC<PaladinFeaturesCardProps> = ({ pc, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [smiteRulesOpen, setSmiteRulesOpen] = useState(false);
  const [lohRulesOpen, setLohRulesOpen] = useState(false);
  const [dgRulesOpen, setDgRulesOpen] = useState(false);
  const [turnRulesOpen, setTurnRulesOpen] = useState(false);


  const chaValue = pc.cha ? pc.cha.getValue() : 10;
  const chaMod = getAblMod(chaValue);
  
  const defaultSmiteMax = Math.max(1, 1 + Math.floor((level - 1) / 4));
  const defaultLohMax = Math.max(0, level * Math.max(0, chaMod));
  const defaultTurnMax = Math.max(1, 3 + chaMod);

  const smiteAbility = pc.dailyAbilities?.find((a: any) => a.name === "Böses niederstrecken" || a.name === "Smite Evil" || a.name?.includes("Smite Evil") || a.name?.includes("Böses niederstrecken"));
  const lohAbility = pc.dailyAbilities?.find((a: any) => a.name === "Hände auflegen" || a.name === "Lay on Hands" || a.name?.includes("Lay on Hands") || a.name?.includes("Hände auflegen"));
  
  const smiteMax = smiteAbility ? smiteAbility.max : defaultSmiteMax;
  const smiteUsed = smiteAbility ? smiteAbility.used : 0;
  const smiteRemaining = Math.max(0, smiteMax - smiteUsed);

  const lohMax = lohAbility ? lohAbility.max : defaultLohMax;
  const lohUsed = lohAbility ? lohAbility.used : 0;
  const lohRemaining = lohMax - lohUsed;

  const turnAbility = pc.dailyAbilities?.find((a: any) => a.name === "Untote vertreiben" || a.name === "Turn Undead" || a.name?.includes("Turn Undead") || a.name?.includes("Untote vertreiben"));
  const turnMax = turnAbility ? turnAbility.max : defaultTurnMax;
  const turnUsed = turnAbility ? turnAbility.used : 0;
  const turnRemaining = Math.max(0, turnMax - turnUsed);

  const handleSmiteBubbleClick = (idx: number) => {
    CombatState.updatePCBatch((activePC: any) => {
      if (!Array.isArray(activePC.dailyAbilities)) {
        activePC.dailyAbilities = [];
      }
      let ability = activePC.dailyAbilities.find((a: any) => a.name === "Böses niederstrecken" || a.name === "Smite Evil" || a.name?.includes("Smite Evil") || a.name?.includes("Böses niederstrecken"));
      if (!ability) {
        ability = { name: "Smite Evil", max: defaultSmiteMax, used: 0 };
        activePC.dailyAbilities.push(ability);
      }
      if (idx <= ability.used) {
        ability.used = idx - 1;
      } else {
        ability.used = idx;
      }
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

  const handleToggleDivineGrace = () => {
    CombatState.updatePCBatch((activePC: any) => {
      activePC.divineGraceActive = !activePC.divineGraceActive;
      activePC.rebuildStatModifiers();
    });
  };

  const handleLohChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    CombatState.updatePCBatch((activePC: any) => {
      if (!Array.isArray(activePC.dailyAbilities)) {
        activePC.dailyAbilities = [];
      }
      let ability = activePC.dailyAbilities.find((a: any) => a.name === "Hände auflegen" || a.name === "Lay on Hands" || a.name?.includes("Lay on Hands") || a.name?.includes("Hände auflegen"));
      if (!ability) {
        ability = { name: "Lay on Hands", max: defaultLohMax, used: 0 };
        activePC.dailyAbilities.push(ability);
      }
      ability.used = Math.max(0, Math.min(ability.max, ability.max - val));
    });
  };

  const handleAdjustLoh = (dir: number) => {
    CombatState.updatePCBatch((activePC: any) => {
      if (!Array.isArray(activePC.dailyAbilities)) {
        activePC.dailyAbilities = [];
      }
      let ability = activePC.dailyAbilities.find((a: any) => a.name === "Hände auflegen" || a.name === "Lay on Hands" || a.name?.includes("Lay on Hands") || a.name?.includes("Hände auflegen"));
      if (!ability) {
        ability = { name: "Lay on Hands", max: defaultLohMax, used: 0 };
        activePC.dailyAbilities.push(ability);
      }
      if (ability.max > 0) {
        if (dir === -1) {
          ability.used = Math.min(ability.max, ability.used + 1);
        } else {
          ability.used = Math.max(0, ability.used - 1);
        }
      }
    });
  };

  const handleRollTurn = (e: React.MouseEvent) => {
    showRollBreakdown("Turn Undead Check (Charisma Check)", "1d20", [
      { label: "Charisma Mod", value: chaMod }
    ], e.nativeEvent);
  };

  return (
    <div className={`class-card ${isExpanded ? 'expanded' : ''}`} style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div 
        className="class-card-hdr" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', cursor: 'pointer', userSelect: 'none' }}
      >
        <span>🎭 Paladin (Level {level})</span>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', transition: 'transform 0.2s ease' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', fontWeight: 'bold' }}>
            Class Features
          </div>
          
          {/* Göttliche Gnade */}
          {level >= 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}><strong>Divine Grace:</strong></span>
                  <button 
                    onClick={() => setDgRulesOpen(!dgRulesOpen)}
                    className="btn btn-toggle-rules-dg" 
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                    title="Show rules"
                  >
                    📖 {dgRulesOpen ? '▲' : '▼'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--red)', fontWeight: 'bold', fontSize: '7.5px' }}>+{Math.max(0, chaMod)} to Saving Throws</span>
                  <button 
                    onClick={handleToggleDivineGrace}
                    className="btn paladin-dg-btn" 
                    style={{ fontSize: '6px', padding: '1px 4px', height: '12px', lineHeight: '8px', cursor: 'pointer', background: pc.divineGraceActive ? 'rgba(42, 106, 42, 0.12)' : 'rgba(0,0,0,0.03)', border: `0.5px solid ${pc.divineGraceActive ? '#2a6a2a' : 'var(--pb)'}`, color: pc.divineGraceActive ? '#1a4a1a' : 'var(--inkl)', fontWeight: 'bold', borderRadius: '1.5px' }}
                  >
                    {pc.divineGraceActive ? 'Active' : 'Off'}
                  </button>
                </div>
              </div>
              
              {dgRulesOpen && (
                <div className="dg-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                  <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Divine Grace:</strong><br />
                  At 2nd level, a paladin gains a bonus on all saving throws.<br />
                  • <strong>Effect:</strong> Adds their Charisma bonus (if positive) to all saving throws (Fortitude, Reflex, and Will).
                </div>
              )}
            </div>
          )}

          {/* Böses niederstrecken */}
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span><strong>Smite Evil:</strong></span>
                <button 
                  onClick={() => setSmiteRulesOpen(!smiteRulesOpen)}
                  className="btn btn-toggle-rules-smite" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                  title="Show rules"
                >
                  📖 {smiteRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ display: 'flex' }}>
                  {smiteMax > 0 && Array.from({ length: smiteMax }).map((_, i) => {
                    const bubbleIdx = i + 1;
                    const spent = bubbleIdx <= smiteUsed;
                    return (
                      <span 
                        key={bubbleIdx}
                        onClick={() => handleSmiteBubbleClick(bubbleIdx)}
                        className={`smite-bubble use-icon use-icon-smite ${spent ? 'used' : ''}`}
                        style={{ cursor: 'pointer' }}
                        title={spent ? 'Used (Click to restore)' : 'Available (Click to use)'}
                      >
                        ⚡
                      </span>
                    );
                  })}
                </div>
                <span>({smiteRemaining} remaining)</span>
              </div>
            </div>
            
            {smiteRulesOpen && (
              <div className="smite-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Smite Evil:</strong><br />
                Once per day (starting at 1st level, +1 use every 5 levels thereafter), a paladin can attempt to smite evil with one normal melee attack.<br />
                • <strong>Effect:</strong> Charisma bonus (if positive) to the attack roll, +1 damage per paladin level.<br />
                • <strong>Failure:</strong> If the target is not evil, the smite fails, but the use is still spent.
              </div>
            )}
          </div>

          {/* Hände auflegen */}
          <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span><strong>Lay on Hands:</strong></span>
                <button 
                  onClick={() => setLohRulesOpen(!lohRulesOpen)}
                  className="btn btn-toggle-rules-loh" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                  title="Show rules"
                >
                  📖 {lohRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              
              {level >= 2 && lohMax > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <button 
                    onClick={() => handleAdjustLoh(-1)}
                    className="btn loh-minus-btn" 
                    style={{ width: '14px', height: '14px', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--red)', fontWeight: 'bold', borderRadius: '1px' }} 
                    title="Subtract points"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={lohRemaining} 
                    onChange={handleLohChange}
                    className="cinput paladin-loh-val" 
                    style={{ width: '26px', fontSize: '8px', textAlign: 'center', height: '14px', fontWeight: 'bold', color: 'var(--red)', borderRadius: '1px', border: '0.5px solid var(--pb)', padding: 0 }} 
                    title="Remaining points"
                  />
                  <button 
                    onClick={() => handleAdjustLoh(1)}
                    className="btn loh-plus-btn" 
                    style={{ width: '14px', height: '14px', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--red)', fontWeight: 'bold', borderRadius: '1px' }} 
                    title="Add points"
                  >
                    +
                  </button>
                  <span>/ {lohMax}</span>
                </div>
              ) : level < 2 ? (
                <span style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>Unlocked at level 2</span>
              ) : (
                <span style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic' }} title="Requires Charisma 12+">Inactive (CHA &lt; 12)</span>
              )}
            </div>
            
            {lohRulesOpen && (
              <div className="loh-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Lay on Hands:</strong><br />
                At 2nd level, a paladin with Charisma 12+ can heal wounds by touch.<br />
                • <strong>Daily Pool:</strong> Paladin level × Charisma bonus.<br />
                • <strong>Action:</strong> Standard action. Can be divided freely and applied to self or others.<br />
                • <strong>Against Undead:</strong> Can be used as a melee touch attack to damage undead creatures (does not provoke attacks of opportunity).
              </div>
            )}
          </div>

          {/* Untote vertreiben (ab Stufe 4) */}
          {level >= 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '0.5px dashed rgba(200,169,110,0.2)', paddingTop: '4px', marginTop: '2px' }}>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span><strong>Turn Undead:</strong></span>
                  <button 
                    onClick={() => setTurnRulesOpen(!turnRulesOpen)}
                    className="btn btn-toggle-rules-turn" 
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                    title="Show rules"
                  >
                    📖 {turnRulesOpen ? '▲' : '▼'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <div style={{ display: 'flex' }}>
                    {turnMax > 0 && Array.from({ length: turnMax }).map((_, i) => {
                      const bubbleIdx = i + 1;
                      const spent = bubbleIdx <= turnUsed;
                      return (
                        <span 
                          key={bubbleIdx}
                          onClick={() => handleTurnBubbleClick(bubbleIdx)}
                          className={`paladin-turn-bubble use-icon use-icon-turn ${spent ? 'used' : ''}`}
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
                <div className="turn-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                  <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Turn Undead:</strong><br />
                  As a standard action, a paladin can attempt to turn undead creatures within a 60 ft radius.<br />
                  • <strong>Effective Turning Level:</strong> Paladin level -3 (currently level {level - 3})<br />
                  • <strong>1. Turning Check (1d20 + CHA):</strong> Determines the maximum Hit Dice (HD) of the most powerful undead affected (Effective level -4 to +4).<br />
                  • <strong>2. Turning Damage (2d6 + Effective level + CHA):</strong> Determines the total Hit Dice (HD) of undead affected.<br />
                  • <strong>Effect:</strong> Affected undead flee for 10 rounds (1 minute). If your effective turning level is at least twice the HD of the undead, it is destroyed instead.
                </div>
              )}
              <button 
                onClick={handleRollTurn}
                className="btn roll-turn-btn" 
                style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', padding: '4px', width: '100%', cursor: 'pointer', marginTop: '4px' }}
              >
                Roll Turn Undead 🎲
              </button>
            </div>
          )}

          <ClassACFSelector pc={pc} classKey="paladin" level={level} />

        </div>
      </div>
      )}
    </div>
  );
};
