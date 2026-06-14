import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { showRollBreakdown } from '@core/ui/components/dialogs.js';

interface ClericFeaturesCardProps {
  pc: any;
  level: number;
}

export const ClericFeaturesCard: React.FC<ClericFeaturesCardProps> = ({ pc, level }) => {
  const [turnRulesOpen, setTurnRulesOpen] = useState(false);

  const getAblMod = (score: number) => {
    return score >= 10 ? Math.floor((score - 10) / 2) : (score === 9 || score === 8 ? -1 : (score === 7 || score === 6 ? -2 : (score === 5 || score === 4 ? -4 : -5)));
  };

  const chaValue = pc.cha ? pc.cha.getValue() : 10;
  const chaMod = getAblMod(chaValue);
  
  const turnAbility = pc.dailyAbilities?.find((a: any) => a.name === "Untote vertreiben");
  const turnMax = turnAbility ? turnAbility.max : 0;
  const turnUsed = turnAbility ? turnAbility.used : 0;
  const turnRemaining = Math.max(0, turnMax - turnUsed);

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

  const handleRollTurn = (e: React.MouseEvent) => {
    showRollBreakdown("Vertreibungswurf (Charisma-Wurf)", "1W20", [
      { label: "Charisma-Mod", value: chaMod }
    ], e.nativeEvent);
  };

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Kleriker (Stufe {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', fontWeight: 'bold' }}>
            Klassenfähigkeiten
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span><strong>Vertreiben:</strong></span>
                <button 
                  onClick={() => setTurnRulesOpen(!turnRulesOpen)}
                  className="btn btn-toggle-rules-turn" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Regeln einblenden"
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
                        className={`cleric-turn-bubble use-icon use-icon-turn ${spent ? 'used' : ''}`}
                        style={{ cursor: 'pointer' }}
                        title={spent ? 'Benutzt' : 'Verfügbar'}
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
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Untote vertreiben (Turn Undead):</strong><br />
                Als Standardaktion kann ein Kleriker versuchen, untote Kreaturen in einem Radius von 18m (60 ft) zu vertreiben.<br />
                • <strong>1. Vertreibungswurf (1W20 + CHA):</strong> Bestimmt die maximalen Trefferwürfel (HD) des stärksten betroffenen Untoten (Kleriker-Stufe -4 bis +4).<br />
                • <strong>2. Vertreibungsschaden (2W6 + Stufe + CHA):</strong> Bestimmt die Gesamtzahl an Trefferwürfeln (HD) aller Untoten, die beeinflusst werden.<br />
                • <strong>Effekt:</strong> Betroffene Untote fliehen 10 Runden (1 Minute) lang. Wenn deine Klerikerstufe mindestens doppelt so hoch ist wie die HD des Untoten, wird dieser stattdessen vernichtet.
              </div>
            )}
          </div>
          <button 
            onClick={handleRollTurn}
            className="btn roll-turn-btn" 
            style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', padding: '4px', width: '100%', cursor: 'pointer', marginTop: '4px' }}
          >
            Vertreiben würfeln 🎲
          </button>
        </div>
      </div>
    </div>
  );
};
