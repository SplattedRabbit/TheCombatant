import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';

interface MonkFeaturesCardProps {
  pc: any;
  level: number;
}

export const MonkFeaturesCard: React.FC<MonkFeaturesCardProps> = ({ pc, level }) => {
  const [flurryRulesOpen, setFlurryRulesOpen] = useState(false);
  const [abundantRulesOpen, setAbundantRulesOpen] = useState(false);
  const [quiveringRulesOpen, setQuiveringRulesOpen] = useState(false);
  const [emptyRulesOpen, setEmptyRulesOpen] = useState(false);

  const getAblMod = (score: number) => {
    return score >= 10 ? Math.floor((score - 10) / 2) : (score === 9 || score === 8 ? -1 : (score === 7 || score === 6 ? -2 : (score === 5 || score === 4 ? -4 : -5)));
  };

  const wisValue = pc.wis ? pc.wis.getValue() : 10;
  const wisMod = getAblMod(wisValue);
  const levelBonus = Math.floor(level / 5);
  const totalMonkAC = Math.max(0, wisMod) + levelBonus;

  const stepAbility = pc.dailyAbilities?.find((a: any) => a.name === "Joch des Geistes (Abundant Step)");
  const stepSpent = stepAbility ? (stepAbility.used > 0) : false;

  const palmAbility = pc.dailyAbilities?.find((a: any) => a.name === "Zitternde Hand (Quivering Palm)");
  const palmSpent = palmAbility ? (palmAbility.used > 0) : false;
  const palmDC = 10 + Math.floor(level / 2) + wisMod;

  const bodyAbility = pc.dailyAbilities?.find((a: any) => a.name === "Unbefleckter Körper (Empty Body)");
  const bodySpent = bodyAbility ? (bodyAbility.used > 0) : false;

  const handleFlurryToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activePC = CombatState.getActivePC();
    activePC.isFlurrying = e.target.checked;
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
  };

  const handleKiBubbleClick = (key: string) => {
    const activePC = CombatState.getActivePC();
    const ability = activePC.dailyAbilities.find((a: any) => a.name === key);
    if (ability) {
      ability.used = ability.used > 0 ? 0 : 1;
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
    }
  };

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Mönch (Stufe {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ background: 'rgba(200, 169, 110, 0.12)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px 6px', fontSize: '8px', color: 'var(--red)', textAlign: 'center', fontWeight: 'bold' }}>
            🥋 Unrüstungs-Bonus aktiv: +{totalMonkAC} auf Rüstungsklasse (AC)
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8.5px', cursor: 'pointer', margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={pc.isFlurrying || false} 
                  onChange={handleFlurryToggle}
                  style={{ cursor: 'pointer', width: '11px', height: '11px' }}
                />
                <span><strong>Sturmangriff (Flurry of Blows) aktiv</strong></span>
              </label>
              <button 
                onClick={() => setFlurryRulesOpen(!flurryRulesOpen)}
                className="btn btn-toggle-rules-flurry" 
                style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                title="Regeln einblenden"
              >
                📖 {flurryRulesOpen ? '▲' : '▼'}
              </button>
            </div>
            
            {flurryRulesOpen && (
              <div className="flurry-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Schlaghagel (Flurry of Blows):</strong><br />
                Wenn ungerüstet, kann der Mönch einen Schlaghagel (volle Angriffsaktion) mit unbewaffneten Schlägen oder Mönchswaffen ausführen.<br />
                • <strong>Zusatzangriff:</strong> +1 Angriff (Stufe 1-10) bzw. +2 Angriffe (ab Stufe 11).<br />
                • <strong>Abzug:</strong> -2 (Stufe 1-4), -1 (Stufe 5-8), kein Abzug (ab Stufe 9) auf alle Angriffe der Runde.<br />
                • <strong>Schaden:</strong> 1.0x Stärke bei allen Treffern (auch Zweihand).
              </div>
            )}
          </div>
          
          {/* Abundant Step */}
          {level >= 12 && (
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '0.5px solid rgba(200,169,110,0.2)', paddingTop: '3px', marginTop: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span><strong>Joch des Geistes:</strong></span>
                  <button 
                    onClick={() => setAbundantRulesOpen(!abundantRulesOpen)}
                    className="btn btn-toggle-rules-abundant" 
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                    title="Regeln einblenden"
                  >
                    📖 {abundantRulesOpen ? '▲' : '▼'}
                  </button>
                </div>
                <span 
                  onClick={() => handleKiBubbleClick("Joch des Geistes (Abundant Step)")}
                  className="ki-bubble" 
                  style={{ width: '7px', height: '7px', borderRadius: '50%', border: '.5px solid var(--red)', backgroundColor: stepSpent ? 'var(--red)' : 'transparent', display: 'inline-block', cursor: 'pointer' }} 
                  title={stepSpent ? 'Benutzt (Freigeben)' : 'Verfügbar (Verbrauchen)'}
                />
              </div>
              {abundantRulesOpen && (
                <div className="abundant-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                  <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Joch des Geistes (Abundant Step):</strong><br />
                  Ab Stufe 12 kann der Mönch einmal pro Tag magisch zwischen Orten gleiten.<br />
                  • <strong>Effekt:</strong> Funktioniert wie der Zauber <em>Dimensionstür (Dimension Door)</em>.<br />
                  • <strong>Zauberstufe (Caster Level):</strong> Halbe Mönchsstufe (abgerundet). Für Stufe {level} beträgt sie Zauberstufe {Math.floor(level / 2)}.
                </div>
              )}
            </div>
          )}

          {/* Quivering Palm */}
          {level >= 15 && (
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '0.5px solid rgba(200,169,110,0.1)', paddingTop: '3px', marginTop: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span><strong>Zitternde Hand:</strong></span>
                  <button 
                    onClick={() => setQuiveringRulesOpen(!quiveringRulesOpen)}
                    className="btn btn-toggle-rules-quivering" 
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                    title="Regeln einblenden"
                  >
                    📖 {quiveringRulesOpen ? '▲' : '▼'}
                  </button>
                </div>
                <span 
                  onClick={() => handleKiBubbleClick("Zitternde Hand (Quivering Palm)")}
                  className="ki-bubble" 
                  style={{ width: '7px', height: '7px', borderRadius: '50%', border: '.5px solid var(--red)', backgroundColor: palmSpent ? 'var(--red)' : 'transparent', display: 'inline-block', cursor: 'pointer' }} 
                  title={palmSpent ? 'Benutzt (Freigeben)' : 'Verfügbar (Verbrauchen)'}
                />
              </div>
              {quiveringRulesOpen && (
                <div className="quivering-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                  <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Zitternde Hand (Quivering Palm):</strong><br />
                  Ab Stufe 15 kann der Mönch Schwingungen im Körper eines Gegners erzeugen.<br />
                  • <strong>Anwendung:</strong> 1x pro Woche. Muss vor dem Angriff angesagt werden.<br />
                  • <strong>SG:</strong> Zähigkeitswurf gegen <strong>SG {palmDC}</strong> (10 + 1/2 Stufe [{Math.floor(level / 2)}] + WIS-Mod [{wisMod}]). Bei Fehlschlag stirbt das Opfer sofort.
                </div>
              )}
            </div>
          )}

          {/* Empty Body */}
          {level >= 19 && (
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '0.5px solid rgba(200,169,110,0.1)', paddingTop: '3px', marginTop: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span><strong>Unbefleckter Körper:</strong></span>
                  <button 
                    onClick={() => setEmptyRulesOpen(!emptyRulesOpen)}
                    className="btn btn-toggle-rules-empty" 
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                    title="Regeln einblenden"
                  >
                    📖 {emptyRulesOpen ? '▲' : '▼'}
                  </button>
                </div>
                <span 
                  onClick={() => handleKiBubbleClick("Unbefleckter Körper (Empty Body)")}
                  className="ki-bubble" 
                  style={{ width: '7px', height: '7px', borderRadius: '50%', border: '.5px solid var(--red)', backgroundColor: bodySpent ? 'var(--red)' : 'transparent', display: 'inline-block', cursor: 'pointer' }} 
                  title={bodySpent ? 'Benutzt (Freigeben)' : 'Verfügbar (Verbrauchen)'}
                />
              </div>
              {emptyRulesOpen && (
                <div className="empty-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                  <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Unbefleckter Körper (Empty Body):</strong><br />
                  Ab Stufe 19 kann der Mönch einen ätherischen Zustand annehmen.<br />
                  • <strong>Dauer:</strong> Insgesamt <strong>{level} Runden pro Tag</strong> (funktioniert wie der Zauber <em>Ätherische Gefilde / Etherealness</em>).
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
