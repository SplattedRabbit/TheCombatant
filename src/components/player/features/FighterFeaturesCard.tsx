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
        <span>🎭 Fighter (Level {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '2px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', background: 'rgba(200,169,110,0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Bonus Feats:</span>
                <button 
                  onClick={() => setRulesOpen(!rulesOpen)}
                  className="btn" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Show rules"
                >
                  📖 {rulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <span style={{ color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif" }}>{bonusFeatsCount} Feats</span>
            </div>
            {rulesOpen && (
              <div className="fighter-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif', serif", fontSize: '8px' }}>Fighter Bonus Feats (D&D 3.5 RAW):</strong><br />
                A fighter receives a bonus feat at 1st level and at every second level thereafter (2nd, 4th, 6th, 8th, 10th, 12th, 14th, 16th, 18th, and 20th).<br />
                • <strong>Restriction:</strong> These bonus feats must be selected from the list of combat feats.<br />
                • <strong>Prerequisites:</strong> The fighter must meet all prerequisites for the chosen feat (e.g. minimum BAB or attribute scores) normally.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
