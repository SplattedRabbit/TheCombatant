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
    showRollBreakdown("Vertreibungswurf (Charisma-Wurf)", "1W20", [
      { label: "Charisma-Mod", value: chaMod }
    ], e.nativeEvent);
  };

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Paladin (Stufe {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', fontWeight: 'bold' }}>
            Klassenfähigkeiten
          </div>
          
          {/* Göttliche Gnade */}
          {level >= 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}><strong>Göttliche Gnade:</strong></span>
                  <button 
                    onClick={() => setDgRulesOpen(!dgRulesOpen)}
                    className="btn btn-toggle-rules-dg" 
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                    title="Regeln einblenden"
                  >
                    📖 {dgRulesOpen ? '▲' : '▼'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--red)', fontWeight: 'bold', fontSize: '7.5px' }}>+{Math.max(0, chaMod)} Rettungswürfe</span>
                  <button 
                    onClick={handleToggleDivineGrace}
                    className="btn paladin-dg-btn" 
                    style={{ fontSize: '6px', padding: '1px 4px', height: '12px', lineHeight: '8px', cursor: 'pointer', background: pc.divineGraceActive ? 'rgba(42, 106, 42, 0.12)' : 'rgba(0,0,0,0.03)', border: `0.5px solid ${pc.divineGraceActive ? '#2a6a2a' : 'var(--pb)'}`, color: pc.divineGraceActive ? '#1a4a1a' : 'var(--inkl)', fontWeight: 'bold', borderRadius: '1.5px' }}
                  >
                    {pc.divineGraceActive ? 'Aktiv' : 'Aus'}
                  </button>
                </div>
              </div>
              
              {dgRulesOpen && (
                <div className="dg-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                  <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Göttliche Gnade (Divine Grace):</strong><br />
                  Ab der 2. Stufe erhält ein Paladin einen Bonus auf alle Rettungswürfe.<br />
                  • <strong>Effekt:</strong> Addiert seinen Charisma-Bonus (sofern positiv) auf alle Rettungswürfe (Zähigkeit, Reflex und Willenskraft).
                </div>
              )}
            </div>
          )}

          {/* Böses niederstrecken */}
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span><strong>Niederstrecken:</strong></span>
                <button 
                  onClick={() => setSmiteRulesOpen(!smiteRulesOpen)}
                  className="btn btn-toggle-rules-smite" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Regeln einblenden"
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
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Böses niederstrecken (Smite Evil):</strong><br />
                Einmal pro Tag (ab Stufe 1, +1-mal alle 5 Stufen danach) kann ein Paladin versuchen, das Böse mit einem normalen Nahkampfangriff niederzustrecken.<br />
                • <strong>Effekt:</strong> Charisma-Bonus (sofern positiv) auf den Angriffswurf, +1 Schaden pro Paladin-Stufe.<br />
                • <strong>Fehlschlag:</strong> Richtet sich der Angriff gegen ein nicht-böses Ziel, verpufft der Effekt, die Anwendung ist dennoch verbraucht.
              </div>
            )}
          </div>

          {/* Hände auflegen */}
          <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span><strong>Hände auflegen:</strong></span>
                <button 
                  onClick={() => setLohRulesOpen(!lohRulesOpen)}
                  className="btn btn-toggle-rules-loh" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Regeln einblenden"
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
                    title="Punkte abziehen"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={lohRemaining} 
                    onChange={handleLohChange}
                    className="cinput paladin-loh-val" 
                    style={{ width: '24px', fontSize: '8px', textAlign: 'center', height: '12px', fontWeight: 'bold', color: 'var(--red)', borderRadius: '1px', border: '0.5px solid var(--pb)', padding: 0 }} 
                    title="Verbleibende Punkte"
                  />
                  <button 
                    onClick={() => handleAdjustLoh(1)}
                    className="btn loh-plus-btn" 
                    style={{ width: '12px', height: '12px', fontSize: '8px', lineIndex: 1, display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: 0, cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--red)', fontWeight: 'bold', borderRadius: '1px' } as any} 
                    title="Punkte hinzufügen"
                  >
                    +
                  </button>
                  <span>/ {lohMax}</span>
                </div>
              ) : level < 2 ? (
                <span style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>Ab Stufe 2 freigeschaltet</span>
              ) : (
                <span style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic' }} title="Benötigt Charisma 12+">Inaktiv (CHA &lt; 12)</span>
              )}
            </div>
            
            {lohRulesOpen && (
              <div className="loh-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Hände auflegen (Lay on Hands):</strong><br />
                Ab Stufe 2 kann ein Paladin mit Charisma 12+ Wunden durch Berührung heilen.<br />
                • <strong>Täglicher Pool:</strong> Paladin-Stufe × Charisma-Bonus.<br />
                • <strong>Aktion:</strong> Standardaktion. Kann frei aufgeteilt und auf sich selbst oder andere angewendet werden.<br />
                • <strong>Gegen Untote:</strong> Kann als Nahkampf-Berührungsangriff genutzt werden, um untoten Kreaturen Schaden zuzufügen (kein Gelegenheitsangriff).
              </div>
            )}
          </div>

          {/* Untote vertreiben (ab Stufe 4) */}
          {level >= 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '0.5px dashed rgba(200,169,110,0.2)', paddingTop: '4px', marginTop: '2px' }}>
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
                          className={`paladin-turn-bubble use-icon use-icon-turn ${spent ? 'used' : ''}`}
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
                  Als Standardaktion kann ein Paladin versuchen, untote Kreaturen in einem Radius von 18m (60 ft) zu vertreiben.<br />
                  • <strong>Effektive Vertreiberstufe:</strong> Paladin-Stufe -3 (aktuell Stufe {level - 3})<br />
                  • <strong>1. Vertreibungswurf (1W20 + CHA):</strong> Bestimmt die maximalen Trefferwürfel (HD) des stärksten betroffenen Untoten (Effektive Stufe -4 bis +4).<br />
                  • <strong>2. Vertreibungsschaden (2W6 + Effektive Stufe + CHA):</strong> Bestimmt die Gesamtzahl an Trefferwürfeln (HD) aller Untoten, die beeinflusst werden.<br />
                  • <strong>Effekt:</strong> Betroffene Untote fliehen 10 Runden (1 Minute) lang. Wenn deine effektive Vertreiberstufe mindestens doppelt so hoch ist wie die HD des Untoten, wird dieser stattdessen vernichtet.
                </div>
              )}
              <button 
                onClick={handleRollTurn}
                className="btn roll-turn-btn" 
                style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', padding: '4px', width: '100%', cursor: 'pointer', marginTop: '4px' }}
              >
                Vertreiben würfeln 🎲
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
