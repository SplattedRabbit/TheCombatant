import React, { useState } from 'react';
import { ClassACFSelector } from './ClassACFSelector';

interface FighterFeaturesCardProps {
  pc: any;
  level: number;
}

export const FighterFeaturesCard: React.FC<FighterFeaturesCardProps> = ({ pc, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const bonusFeatsCount = 1 + Math.floor(level / 2);

  return (
    <div className={`class-card ${isExpanded ? 'expanded' : ''}`} style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div 
        className="class-card-hdr" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-title)', fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', cursor: 'pointer', userSelect: 'none' }}
      >
        <span>🎭 Fighter (Level {level})</span>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', transition: 'transform 0.2s ease' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '2px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', background: 'rgba(200,169,110,0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>Bonus Feats:</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setRulesOpen(!rulesOpen); }}
                    className="btn" 
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                    title="Show rules"
                  >
                    📖 {rulesOpen ? '▲' : '▼'}
                  </button>
                </div>
                <span style={{ color: 'var(--red)', fontWeight: 'bold', fontFamily: 'var(--font-title)' }}>{bonusFeatsCount} Feats</span>
              </div>
              {rulesOpen && (
                <div className="fighter-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: 'var(--font-body)' }}>
                  <strong style={{ color: 'var(--red)', fontFamily: 'var(--font-title)', fontSize: '8px' }}>Fighter Bonus Feats (D&D 3.5 RAW):</strong><br />
                  A fighter receives a bonus feat at 1st level and at every second level thereafter (2nd, 4th, 6th, 8th, 10th, 12th, 14th, 16th, 18th, and 20th).<br />
                  • <strong>Restriction:</strong> These bonus feats must be selected from the list of combat feats.<br />
                  • <strong>Prerequisites:</strong> The fighter must meet all prerequisites for the chosen feat (e.g. minimum BAB or attribute scores) normally.
                </div>
              )}
            </div>

            <ClassACFSelector pc={pc} classKey="fighter" level={level} />
          </div>
        </div>
      )}
    </div>
  );
};
