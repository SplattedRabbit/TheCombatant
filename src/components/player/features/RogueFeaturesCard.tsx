import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';

interface RogueFeaturesCardProps {
  pc: any;
  level: number;
}

export const RogueFeaturesCard: React.FC<RogueFeaturesCardProps> = ({ pc, level }) => {
  const [saRulesOpen, setSaRulesOpen] = useState(false);
  const saDiceCount = Math.floor((level + 1) / 2);

  const handleToggleSneakAttack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activePC = CombatState.getActivePC();
    activePC.isSneakAttacking = e.target.checked;
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
  };

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Schurke (Stufe {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '4px', marginBottom: '2px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', background: 'rgba(200,169,110,0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Hinterhältiger Angriff:</span>
                <button 
                  onClick={() => setSaRulesOpen(!saRulesOpen)}
                  className="btn btn-toggle-rules-sa" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Regeln einblenden"
                >
                  📖 {saRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <span style={{ color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif" }}>+{saDiceCount}W6</span>
            </div>
            {saRulesOpen && (
              <div className="sa-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Hinterhältiger Angriff (Sneak Attack):</strong><br />
                Zusatzschaden gegen Gegner, die ihren Geschicklichkeitsmodifikator auf die RK verlieren oder flankiert werden.<br />
                • <strong>Immunität:</strong> Kreaturen ohne erkennbare Anatomie (z.B. Konstrukte, Untote, Schleime) oder solche, die immun gegen kritische Treffer sind, erleiden keinen Sneak-Attack-Schaden.
              </div>
            )}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8.5px', cursor: 'pointer', padding: '3px 0' }}>
            <input 
              type="checkbox" 
              checked={pc.isSneakAttacking || false}
              onChange={handleToggleSneakAttack}
              style={{ cursor: 'pointer', width: '11px', height: '11px' }}
            />
            <span><strong>Sneak Attack auf Schaden anwenden</strong></span>
          </label>
        </div>
      </div>
    </div>
  );
};
