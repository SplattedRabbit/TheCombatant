import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { showRollBreakdown } from '@core/ui/components/dialogs.js';

interface PaladinFeaturesCardProps {
  pc: any;
  level: number;
}

export const PaladinFeaturesCard: React.FC<PaladinFeaturesCardProps> = ({ pc, level }) => {
  const [smiteRulesOpen, setSmiteRulesOpen] = useState(false);
  const [lohRulesOpen, setLohRulesOpen] = useState(false);
  const [dgRulesOpen, setDgRulesOpen] = useState(false);
  const [turnRulesOpen, setTurnRulesOpen] = useState(false);

  const getAblMod = (score: number) => {
    return score >= 10 ? Math.floor((score - 10) / 2) : (score === 9 || score === 8 ? -1 : (score === 7 || score === 6 ? -2 : (score === 5 || score === 4 ? -4 : -5)));
  };

  const chaValue = pc.cha ? pc.cha.getValue() : 10;
  const chaMod = getAblMod(chaValue);
  
  const smiteAbility = pc.dailyAbilities?.find((a: any) => a.name === "Böses niederstrecken");
  const lohAbility = pc.dailyAbilities?.find((a: any) => a.name === "Hände auflegen");
  
  const smiteMax = smiteAbility ? smiteAbility.max : 0;
  const smiteUsed = smiteAbility ? smiteAbility.used : 0;
  const smiteRemaining = Math.max(0, smiteMax - smiteUsed);

  const lohMax = lohAbility ? lohAbility.max : 0;
  const lohUsed = lohAbility ? lohAbility.used : 0;
  const lohRemaining = lohMax - lohUsed;

  const turnAbility = pc.dailyAbilities?.find((a: any) => a.name === "Untote vertreiben");
  const turnMax = turnAbility ? turnAbility.max : 0;
  const turnUsed = turnAbility ? turnAbility.used : 0;
  const turnRemaining = Math.max(0, turnMax - turnUsed);

  const handleSmiteBubbleClick = (idx: number) => {
    const activePC = CombatState.getActivePC();
    const ability = activePC.dailyAbilities.find((a: any) => a.name === "Böses niederstrecken");
    if (ability) {
      if (idx <= ability.used) {
        ability.used = idx - 1;
      } else {
        ability.used = idx;
      }
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
    }
  };

  const handleTurnBubbleClick = (idx: number) => {
    const activePC = CombatState.getActivePC();
    const ability = activePC.dailyAbilities.find((a: any) => a.name === "Untote vertreiben");
    if (ability) {
      if (idx <= ability.used) {
        ability.used = idx - 1;
      } else {
        ability.used = idx;
      }
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
    }
  };

  const handleToggleDivineGrace = () => {
    const activePC = CombatState.getActivePC();
    activePC.divineGraceActive = !activePC.divineGraceActive;
    activePC.rebuildStatModifiers();
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
  };

  const handleLohChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    const activePC = CombatState.getActivePC();
    const ability = activePC.dailyAbilities.find((a: any) => a.name === "Hände auflegen");
    if (ability) {
      ability.used = Math.max(0, Math.min(ability.max, ability.max - val));
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
    }
  };

  const handleAdjustLoh = (dir: number) => {
    const activePC = CombatState.getActivePC();
    const ability = activePC.dailyAbilities.find((a: any) => a.name === "Hände auflegen");
    if (ability && ability.max > 0) {
      if (dir === -1) {
        ability.used = Math.min(ability.max, ability.used + 1);
      } else {
        ability.used = Math.max(0, ability.used - 1);
      }
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
    }
  };

  const handleRollTurn = (e: React.MouseEvent) => {
    showRollBreakdown("Turn Undead Check (Charisma Check)", "1d20", [
      { label: "Charisma Mod", value: chaMod }
    ], e.nativeEvent);
  };

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Paladin (Level {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
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
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
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
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Show rules"
                >
                  📖 {smiteRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
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
                      >
                        🌟
                      </span>
                    );
                  })}
                </div>
                <span>({smiteRemaining})</span>
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
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
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
                    style={{ width: '12px', height: '12px', fontSize: '8px', lineIndex: 1, display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: 0, cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--red)', fontWeight: 'bold', borderRadius: '1px' } as any} 
                    title="Subtract points"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={lohRemaining} 
                    onChange={handleLohChange}
                    className="cinput paladin-loh-val" 
                    style={{ width: '24px', fontSize: '8px', textAlign: 'center', height: '12px', fontWeight: 'bold', color: 'var(--red)', borderRadius: '1px', border: '0.5px solid var(--pb)', padding: 0 }} 
                    title="Remaining points"
                  />
                  <button 
                    onClick={() => handleAdjustLoh(1)}
                    className="btn loh-plus-btn" 
                    style={{ width: '12px', height: '12px', fontSize: '8px', lineIndex: 1, display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: 0, cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--red)', fontWeight: 'bold', borderRadius: '1px' } as any} 
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
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
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

        </div>
      </div>
    </div>
  );
};
