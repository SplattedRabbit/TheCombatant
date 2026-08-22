import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import { ClassACFSelector } from './ClassACFSelector';
import { getAblMod } from '../attributeHelper';

interface MonkFeaturesCardProps {
  pc: any;
  level: number;
}

export const MonkFeaturesCard: React.FC<MonkFeaturesCardProps> = ({ pc, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [flurryRulesOpen, setFlurryRulesOpen] = useState(false);
  const [abundantRulesOpen, setAbundantRulesOpen] = useState(false);
  const [quiveringRulesOpen, setQuiveringRulesOpen] = useState(false);
  const [emptyRulesOpen, setEmptyRulesOpen] = useState(false);

  const wisValue = pc.wis ? pc.wis.getValue() : 10;
  const wisMod = getAblMod(wisValue);
  const levelBonus = Math.floor(level / 5);
  const totalMonkAC = Math.max(0, wisMod) + levelBonus;

  const stepAbility = pc.dailyAbilities?.find((a: any) => a.name === "Abundant Step" || a.name === "Joch des Geistes (Abundant Step)" || a.name === "Joch des Geistes");
  const stepSpent = stepAbility ? (stepAbility.used > 0) : false;

  const palmAbility = pc.dailyAbilities?.find((a: any) => a.name === "Quivering Palm" || a.name === "Zitternde Hand (Quivering Palm)" || a.name === "Zitternde Hand");
  const palmSpent = palmAbility ? (palmAbility.used > 0) : false;
  const palmDC = 10 + Math.floor(level / 2) + wisMod;

  const bodyAbility = pc.dailyAbilities?.find((a: any) => a.name === "Empty Body" || a.name === "Unbefleckter Körper (Empty Body)" || a.name === "Unbefleckter Körper");
  const bodySpent = bodyAbility ? (bodyAbility.used > 0) : false;

  const handleFlurryToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    CombatState.updatePCBatch((activePC: any) => {
      activePC.isFlurrying = e.target.checked;
    });
  };

  const handleKiBubbleClick = (name: string, fallbackMax = 1) => {
    CombatState.updatePCBatch((activePC: any) => {
      if (!Array.isArray(activePC.dailyAbilities)) {
        activePC.dailyAbilities = [];
      }
      let ability = activePC.dailyAbilities.find((a: any) => 
        a.name === name || 
        (name === "Abundant Step" && (a.name === "Joch des Geistes (Abundant Step)" || a.name === "Joch des Geistes")) ||
        (name === "Quivering Palm" && (a.name === "Zitternde Hand (Quivering Palm)" || a.name === "Zitternde Hand")) ||
        (name === "Empty Body" && (a.name === "Unbefleckter Körper (Empty Body)" || a.name === "Unbefleckter Körper"))
      );
      if (!ability) {
        ability = { name: name, max: fallbackMax, used: 1 };
        activePC.dailyAbilities.push(ability);
      } else {
        ability.used = (ability.used > 0) ? 0 : 1;
      }
    });
  };

  return (
    <div className={`class-card ${isExpanded ? 'expanded' : ''}`} style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div 
        className="class-card-hdr" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', cursor: 'pointer', userSelect: 'none' }}
      >
        <span>🎭 Monk (Level {level})</span>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', transition: 'transform 0.2s ease' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ background: 'rgba(200, 169, 110, 0.12)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px 6px', fontSize: '8px', color: 'var(--red)', textAlign: 'center', fontWeight: 'bold' }}>
            🥋 Unarmored AC Bonus: +{totalMonkAC} to Armor Class (AC)
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
                <span><strong>Flurry of Blows active</strong></span>
              </label>
              <button 
                onClick={() => setFlurryRulesOpen(!flurryRulesOpen)}
                className="btn btn-toggle-rules-flurry" 
                style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                title="Show rules"
              >
                📖 {flurryRulesOpen ? '▲' : '▼'}
              </button>
            </div>
            
            {flurryRulesOpen && (
              <div className="flurry-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Flurry of Blows:</strong><br />
                When unarmored, a monk may strike with a Flurry of Blows (full attack action) using unarmed strikes or special monk weapons.<br />
                • <strong>Extra Attack:</strong> +1 attack (levels 1-10) or +2 attacks (level 11+).<br />
                • <strong>Penalty:</strong> -2 (levels 1-4), -1 (levels 5-8), no penalty (level 9+) on all attacks in the round.<br />
                • <strong>Damage:</strong> 1.0x Strength bonus on all hits (including two-handed).
              </div>
            )}
          </div>
          
          {/* Abundant Step */}
          {level >= 12 && (
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '0.5px solid rgba(200,169,110,0.2)', paddingTop: '3px', marginTop: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span><strong>Abundant Step:</strong></span>
                  <button 
                    onClick={() => setAbundantRulesOpen(!abundantRulesOpen)}
                    className="btn btn-toggle-rules-abundant" 
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                    title="Show rules"
                  >
                    📖 {abundantRulesOpen ? '▲' : '▼'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span 
                    onClick={() => handleKiBubbleClick("Abundant Step", 1)}
                    className={`ki-bubble use-icon ${stepSpent ? 'used' : ''}`}
                    style={{ 
                      width: '14px', 
                      height: '14px', 
                      minWidth: 'unset',
                      borderRadius: '50%', 
                      border: '1.5px solid var(--red)', 
                      backgroundColor: stepSpent ? 'var(--red)' : 'transparent', 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: stepSpent ? 'inset 0 0 4px rgba(0,0,0,0.4)' : '0 0 3px rgba(139,26,26,0.2)',
                      transition: 'all 0.15s ease'
                    }} 
                    title={stepSpent ? 'Used (Click to restore)' : 'Available (Click to use)'}
                  >
                    {stepSpent ? '✕' : '🌀'}
                  </span>
                  <span style={{ fontSize: '7.5px', color: 'var(--inkm)' }}>({stepSpent ? '0/1' : '1/1'})</span>
                </div>
              </div>
              {abundantRulesOpen && (
                <div className="abundant-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                  <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Abundant Step:</strong><br />
                  Starting at 12th level, a monk can slip magically between spaces once per day.<br />
                  • <strong>Effect:</strong> Works like the spell <em>Dimension Door</em>.<br />
                  • <strong>Caster Level:</strong> Half the monk's level (rounded down). For level {level}, caster level is {Math.floor(level / 2)}.
                </div>
              )}
            </div>
          )}

          {/* Quivering Palm */}
          {level >= 15 && (
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '0.5px solid rgba(200,169,110,0.1)', paddingTop: '3px', marginTop: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span><strong>Quivering Palm:</strong></span>
                  <button 
                    onClick={() => setQuiveringRulesOpen(!quiveringRulesOpen)}
                    className="btn btn-toggle-rules-quivering" 
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                    title="Show rules"
                  >
                    📖 {quiveringRulesOpen ? '▲' : '▼'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span 
                    onClick={() => handleKiBubbleClick("Quivering Palm", 1)}
                    className={`ki-bubble use-icon ${palmSpent ? 'used' : ''}`}
                    style={{ 
                      width: '14px', 
                      height: '14px', 
                      minWidth: 'unset',
                      borderRadius: '50%', 
                      border: '1.5px solid var(--red)', 
                      backgroundColor: palmSpent ? 'var(--red)' : 'transparent', 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: palmSpent ? 'inset 0 0 4px rgba(0,0,0,0.4)' : '0 0 3px rgba(139,26,26,0.2)',
                      transition: 'all 0.15s ease'
                    }} 
                    title={palmSpent ? 'Used (Click to restore)' : 'Available (Click to use)'}
                  >
                    {palmSpent ? '✕' : '🖐️'}
                  </span>
                  <span style={{ fontSize: '7.5px', color: 'var(--inkm)' }}>({palmSpent ? '0/1' : '1/1'})</span>
                </div>
              </div>
              {quiveringRulesOpen && (
                <div className="quivering-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                  <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Quivering Palm:</strong><br />
                  Starting at 15th level, a monk can set up vibrations within the body of another creature.<br />
                  • <strong>Use:</strong> Once per week. Must be announced before the attack.<br />
                  • <strong>Saving Throw:</strong> Fortitude save against <strong>DC {palmDC}</strong> (10 + 1/2 level [{Math.floor(level / 2)}] + WIS mod [{wisMod}]). On failure, the target dies immediately.
                </div>
              )}
            </div>
          )}

          {/* Empty Body */}
          {level >= 19 && (
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '0.5px solid rgba(200,169,110,0.1)', paddingTop: '3px', marginTop: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span><strong>Empty Body:</strong></span>
                  <button 
                    onClick={() => setEmptyRulesOpen(!emptyRulesOpen)}
                    className="btn btn-toggle-rules-empty" 
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                    title="Show rules"
                  >
                    📖 {emptyRulesOpen ? '▲' : '▼'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span 
                    onClick={() => handleKiBubbleClick("Empty Body", 1)}
                    className={`ki-bubble use-icon ${bodySpent ? 'used' : ''}`}
                    style={{ 
                      width: '14px', 
                      height: '14px', 
                      minWidth: 'unset',
                      borderRadius: '50%', 
                      border: '1.5px solid var(--red)', 
                      backgroundColor: bodySpent ? 'var(--red)' : 'transparent', 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: bodySpent ? 'inset 0 0 4px rgba(0,0,0,0.4)' : '0 0 3px rgba(139,26,26,0.2)',
                      transition: 'all 0.15s ease'
                    }} 
                    title={bodySpent ? 'Used (Click to restore)' : 'Available (Click to use)'}
                  >
                    {bodySpent ? '✕' : '👻'}
                  </span>
                  <span style={{ fontSize: '7.5px', color: 'var(--inkm)' }}>({bodySpent ? '0/1' : '1/1'})</span>
                </div>
              </div>
              {emptyRulesOpen && (
                <div className="empty-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                  <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Empty Body:</strong><br />
                  Starting at 19th level, a monk can assume an ethereal state.<br />
                  • <strong>Duration:</strong> A total of <strong>{level} rounds per day</strong> (works like the spell <em>Etherealness</em>).
                </div>
              )}
            </div>
          )}

          <ClassACFSelector pc={pc} classKey="monk" level={level} />

        </div>
      </div>
      )}
    </div>
  );
};
