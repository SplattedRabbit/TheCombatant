import React, { useState } from 'react';

interface FighterFeaturesCardProps {
  pc: any;
  level: number;
}

export const FighterFeaturesCard: React.FC<FighterFeaturesCardProps> = ({ level }) => {
  const [rulesOpen, setRulesOpen] = useState(false);
  const bonusFeatsCount = 1 + Math.floor(level / 2);

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Kämpfer (Stufe {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '2px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', background: 'rgba(200,169,110,0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Bonus-Talente:</span>
                <button 
                  onClick={() => setRulesOpen(!rulesOpen)}
                  className="btn" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Regeln einblenden"
                >
                  📖 {rulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <span style={{ color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif" }}>{bonusFeatsCount} Talente</span>
            </div>
            {rulesOpen && (
              <div className="fighter-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif', serif", fontSize: '8px' }}>Kämpfer-Bonus-Talente (D&D 3.5 RAW):</strong><br />
                Ein Kämpfer erhält auf der 1. Stufe und auf jeder zweiten darauf folgenden Stufe (2, 4, 6, 8, 10, 12, 14, 16, 18 und 20) ein zusätzliches Bonus-Talent.<br />
                • <strong>Einschränkung:</strong> Diese Bonus-Talente müssen aus der Liste der Kampftalente (Kategorie "combat") gewählt werden.<br />
                • <strong>Voraussetzungen:</strong> Der Kämpfer muss alle Voraussetzungen für das gewählte Talent (z. B. Mindest-BAB oder Attributswerte) regulär erfüllen.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
