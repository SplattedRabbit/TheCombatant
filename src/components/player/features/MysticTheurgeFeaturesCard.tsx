import React, { useState } from 'react';
// @ts-ignore
import { getPrestigeClassFeatures } from '@core/rules/prestigeClassEngine.js';

interface MysticTheurgeFeaturesCardProps {
  pc: any;
  level: number;
}

export const MysticTheurgeFeaturesCard: React.FC<MysticTheurgeFeaturesCardProps> = ({ pc, level }) => {
  const [rulesOpen, setRulesOpen] = useState(false);
  const features = getPrestigeClassFeatures(pc, 'mystic_theurge');
  const links = features.spellLinks || {};

  const formatClassName = (key: string) => {
    if (!key) return 'Not selected';
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Mystic Theurge (Level {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '2px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', background: 'rgba(200,169,110,0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Spell Links:</span>
                <button 
                  onClick={() => setRulesOpen(!rulesOpen)}
                  className="btn" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } as any} 
                  title="Show rules"
                >
                  📖 {rulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <span style={{ color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif" }}>
                Arcane: {formatClassName(links.arcane)} / Divine: {formatClassName(links.divine)}
              </span>
            </div>
            {rulesOpen && (
              <div className="mystic-theurge-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", fontSize: '8px' }}>Mystic Theurge Rules (D&D 3.5 RAW):</strong><br />
                • <strong>Spells per Day/Spells Known:</strong> At each level, you gain new spells per day (and spells known, if applicable) as if you had also gained a level in both an arcane spellcasting class and a divine spellcasting class you belonged to before adding this prestige class level.<br />
                • You do not, however, gain any other benefit a character of that class would have gained (improved chance of turning undead, wild shape, etc.).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
