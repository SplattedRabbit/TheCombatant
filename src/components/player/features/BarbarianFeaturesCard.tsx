import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';

interface BarbarianFeaturesCardProps {
  pc: any;
  level: number;
}

export const BarbarianFeaturesCard: React.FC<BarbarianFeaturesCardProps> = ({ pc, level }) => {
  const [rageRulesOpen, setRageRulesOpen] = useState(false);

  const rageAbility = pc.dailyAbilities?.find((a: any) => a.name === "Kampfrausch (Rage)");
  const maxUses = rageAbility ? rageAbility.max : 0;
  const usedUses = rageAbility ? rageAbility.used : 0;
  const remaining = Math.max(0, maxUses - usedUses);

  const canRage = remaining > 0 || pc.isRaging;
  const rageBtnText = pc.isRaging ? '🔴 End Rage' : '🔥 Activate Rage!';
  
  const getRageBtnStyle = () => {
    if (pc.isRaging) {
      return { background: 'rgba(139, 26, 26, 0.2)', borderColor: 'var(--red)', color: 'var(--red)', fontWeight: 'bold', cursor: 'pointer' };
    }
    if (remaining > 0) {
      return { background: 'rgba(200, 169, 110, 0.1)', borderColor: 'var(--pb)', color: 'var(--ink)', cursor: 'pointer' };
    }
    return { background: 'rgba(0, 0, 0, 0.05)', borderColor: 'rgba(200, 169, 110, 0.15)', color: 'var(--inkl)', cursor: 'not-allowed' };
  };

  const handleToggleRage = () => {
    const activePC = CombatState.getActivePC();
    if (activePC.isRaging) {
      const ability = activePC.dailyAbilities.find((a: any) => a.name === "Kampfrausch (Rage)");
      if (ability) {
        ability.used = Math.min(ability.max, ability.used + 1);
      }
      activePC.exitRage();
    } else {
      const ability = activePC.dailyAbilities.find((a: any) => a.name === "Kampfrausch (Rage)");
      if (ability && ability.used >= ability.max) {
        return;
      }
      activePC.enterRage();
    }
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
  };

  const handleBubbleClick = (idx: number) => {
    const activePC = CombatState.getActivePC();
    const ability = activePC.dailyAbilities.find((a: any) => a.name === "Kampfrausch (Rage)");
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

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Barbarian (Level {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span><strong>Rage:</strong></span>
              <button 
                onClick={() => setRageRulesOpen(!rageRulesOpen)}
                className="btn btn-toggle-rules-rage" 
                style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                title="Show rules"
              >
                📖 {rageRulesOpen ? '▲' : '▼'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ display: 'flex' }}>
                {maxUses > 0 && Array.from({ length: maxUses }).map((_, i) => {
                  const bubbleIdx = i + 1;
                  const spent = bubbleIdx <= usedUses;
                  return (
                    <span 
                      key={bubbleIdx}
                      onClick={() => handleBubbleClick(bubbleIdx)}
                      className={`rage-bubble use-icon use-icon-rage ${spent ? 'used' : ''}`} 
                      style={{ cursor: 'pointer' }}
                      title={spent ? 'Used (Click to restore)' : 'Available (Click to use)'}
                    >
                      🔥
                    </span>
                  );
                })}
              </div>
              <span>({remaining} remaining)</span>
            </div>
          </div>
          {rageRulesOpen && (
            <div className="rage-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3.5px', fontFamily: "'Crimson Text', serif", marginBottom: '2px' }}>
              <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Rage:</strong><br />
              A barbarian can fly into a rage to temporarily increase physical power drastically.<br />
              • <strong>Bonuses:</strong> +4 Strength (STR), +4 Constitution (CON), +2 morale bonus on Will saves. Hit points increase temporarily by +2 per character level.<br />
              • <strong>Penalties:</strong> –2 Armor Class (AC) due to reckless defense.<br />
              • <strong>Duration:</strong> 3 + modified Constitution modifier rounds.<br />
              • <strong>Fatigue:</strong> A barbarian is fatigued after a rage for the duration of the current encounter (–2 STR, –2 DEX, cannot charge or run).
            </div>
          )}
          <button 
            onClick={handleToggleRage}
            disabled={!canRage}
            className="btn toggle-rage-btn" 
            style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '4px 10px', width: '100%', borderRadius: '2px', ...getRageBtnStyle() } as any}
          >
            {rageBtnText}
          </button>
          <div style={{ marginTop: '4px', padding: '5px', background: 'rgba(200, 169, 110, 0.05)', border: '0.5px solid var(--pb)', borderRadius: '2px' }}>
            <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', fontWeight: 'bold', color: 'var(--red)', borderBottom: '0.5px solid rgba(200, 169, 110, 0.2)', paddingBottom: '2px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Rage Effects:</span>
              {pc.isRaging ? (
                <span style={{ background: 'var(--red)', color: '#fff', fontSize: '6px', padding: '1px 3px', borderRadius: '1px', fontFamily: 'sans-serif', fontWeight: 'bold', textTransform: 'uppercase' }}>Active 🟢</span>
              ) : (
                <span style={{ background: 'var(--pb)', color: '#fff', fontSize: '6px', padding: '1px 3px', borderRadius: '1px', fontFamily: 'sans-serif', fontWeight: 'bold', textTransform: 'uppercase' }}>Inactive ⚪</span>
              )}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5px', lineHeight: 1.3 }}>
              <tbody>
                <tr style={{ borderBottom: '0.25px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '2px 0', color: 'var(--ink)' }}><strong>Strength (STR):</strong></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: pc.isRaging ? 'var(--red)' : 'var(--ink)' }}>+4 (Rage Bonus)</td>
                </tr>
                <tr style={{ borderBottom: '0.25px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '2px 0', color: 'var(--ink)' }}><strong>Constitution (CON):</strong></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: pc.isRaging ? 'var(--red)' : 'var(--ink)' }}>+4 (Rage Bonus)</td>
                </tr>
                <tr style={{ borderBottom: '0.25px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '2px 0', color: 'var(--ink)' }}><strong>Will Save (Will):</strong></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: pc.isRaging ? 'var(--red)' : 'var(--ink)' }}>+2 (Willpower)</td>
                </tr>
                <tr style={{ borderBottom: '0.25px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '2px 0', color: 'var(--ink)' }}><strong>Armor Class (AC):</strong></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: pc.isRaging ? 'var(--red)' : 'var(--ink)' }}>-2 (Reckless Defense)</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0', color: 'var(--ink)' }}><strong>Hit Points (HP):</strong></td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: pc.isRaging ? 'var(--red)' : 'var(--ink)' }}>+{2 * pc.level} (+2 per level)</td>
                </tr>
              </tbody>
            </table>
            <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontStyle: 'italic', marginTop: '4px', borderTop: '0.5px solid rgba(200, 169, 110, 0.1)', paddingTop: '2px' }}>
              Note: After rage ends, you will be <strong>fatigued</strong> for the duration of the encounter (–2 Strength, –2 Dexterity, cannot charge or run).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
