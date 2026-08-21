import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { getPrestigeClassFeatures } from '@core/rules/prestigeClassEngine.js';

interface AssassinFeaturesCardProps {
  pc: any;
  level: number;
}

export const AssassinFeaturesCard: React.FC<AssassinFeaturesCardProps> = ({ pc, level }) => {
  const [rulesOpen, setRulesOpen] = useState(false);
  const features = getPrestigeClassFeatures(pc, 'assassin');
  const saDiceCount = features.sneakAttackStack;
  const deathAttackDC = features.deathAttack;
  const poisonSaveBonus = features.poisonSaveBonus;

  const handleToggleSneakAttack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activePC = CombatState.getActivePC();
    activePC.isSneakAttacking = e.target.checked;
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
  };

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Assassin (Level {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', background: 'rgba(200,169,110,0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>Death Attack DC:</span>
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
              DC {deathAttackDC}
            </span>
          </div>

          {rulesOpen && (
            <div className="assassin-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '1px', fontFamily: "'Crimson Text', serif" }}>
              <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", fontSize: '8px' }}>Assassin Rules (D&D 3.5 RAW):</strong><br />
              • <strong>Poison Use:</strong> Assassins are trained in the use of poison and never risk accidentally poisoning themselves when applying poison.<br />
              • <strong>Death Attack:</strong> Study a victim for 3 rounds. If you make a sneak attack in the next round, the attack has the additional effect of either killing or paralyzing the victim (saving throw Fort DC 10 + Assassin Level + Int Mod).<br />
              • <strong>Save Bonus against Poison:</strong> +1 at 2nd level, and increases by +1 every two levels thereafter (+2 at 4th, +3 at 6th, etc.).
            </div>
          )}

          {/* Stats & Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '8px', marginTop: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '2px' }}>
              <span>Sneak Attack:</span>
              <strong style={{ color: 'var(--red)' }}>+{saDiceCount}d6</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '2px' }}>
              <span>Poison Save Bonus:</span>
              <strong>+{poisonSaveBonus}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '2px' }}>
              <span>Poison Use:</span>
              <strong>Active (No self-poison)</strong>
            </div>
          </div>

          {saDiceCount > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8px', cursor: 'pointer', padding: '2px 0' }}>
              <input 
                type="checkbox" 
                checked={pc.isSneakAttacking || false}
                onChange={handleToggleSneakAttack}
                style={{ cursor: 'pointer', width: '10px', height: '10px' }}
              />
              <span><strong>Apply Sneak Attack to damage</strong></span>
            </label>
          )}

        </div>
      </div>
    </div>
  );
};
