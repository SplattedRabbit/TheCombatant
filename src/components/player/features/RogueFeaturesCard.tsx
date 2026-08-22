import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import { ClassACFSelector } from './ClassACFSelector';

interface RogueFeaturesCardProps {
  pc: any;
  level: number;
}

export const RogueFeaturesCard: React.FC<RogueFeaturesCardProps> = ({ pc, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saRulesOpen, setSaRulesOpen] = useState(false);
  const saDiceCount = Math.floor((level + 1) / 2);

  const handleToggleSneakAttack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activePC = CombatState.getActivePC();
    activePC.isSneakAttacking = e.target.checked;
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
  };

  return (
    <div className={`class-card ${isExpanded ? 'expanded' : ''}`} style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div 
        className="class-card-hdr" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', cursor: 'pointer', userSelect: 'none' }}
      >
        <span>🎭 Rogue (Level {level})</span>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', transition: 'transform 0.2s ease' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '4px', marginBottom: '2px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', background: 'rgba(200,169,110,0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>Sneak Attack:</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSaRulesOpen(!saRulesOpen); }}
                    className="btn btn-toggle-rules-sa" 
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                    title="Show Rules"
                  >
                    📖 {saRulesOpen ? '▲' : '▼'}
                  </button>
                </div>
                <span style={{ color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif" }}>+{saDiceCount}d6</span>
              </div>
              {saRulesOpen && (
                <div className="sa-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                  <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Sneak Attack:</strong><br />
                  Extra damage against opponents denied their Dex modifier to AC, or flanked.<br />
                  • <strong>Immunity:</strong> Creatures without discernible anatomy (e.g., constructs, undead, oozes) or those immune to critical hits are immune to sneak attack damage.
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
              <span><strong>Apply Sneak Attack to damage</strong></span>
            </label>

            <ClassACFSelector pc={pc} classKey="rogue" level={level} />
          </div>
        </div>
      )}
    </div>
  );
};
