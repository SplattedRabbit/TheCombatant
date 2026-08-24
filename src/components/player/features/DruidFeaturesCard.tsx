import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';
import { ClassACFSelector } from './ClassACFSelector';

interface DruidFeaturesCardProps {
  pc: any;
  level: number;
}

export const DruidFeaturesCard: React.FC<DruidFeaturesCardProps> = ({ pc, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [wildshapeRulesOpen, setWildshapeRulesOpen] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);

  const defaultWildMax = level >= 5 ? (level >= 18 ? 6 : (level >= 14 ? 5 : (level >= 10 ? 4 : (level >= 7 ? 3 : (level >= 6 ? 2 : 1))))) : 0;
  const wildAbility = pc.dailyAbilities?.find((a: any) => a.name === "Tiergestalt" || a.name === "Wild Shape" || a.name?.includes("Wild Shape") || a.name?.includes("Tiergestalt"));
  const maxUses = wildAbility ? (parseInt(wildAbility.max) || 0) : defaultWildMax;
  const usedUses = wildAbility ? (parseInt(wildAbility.used) || 0) : 0;
  const remaining = Math.max(0, maxUses - usedUses);

  let sizeText = 'No Wild Shape (starts at level 5)';
  if (level >= 15) sizeText = 'Tiny, Small, Medium, Large, Huge';
  else if (level >= 11) sizeText = 'Tiny, Small, Medium, Large';
  else if (level >= 8) sizeText = 'Small, Medium, Large';
  else if (level >= 5) sizeText = 'Small, Medium';

  const handleBubbleClick = (idx: number) => {
    CombatState.updatePCBatch((activePC: any) => {
      if (!Array.isArray(activePC.dailyAbilities)) {
        activePC.dailyAbilities = [];
      }
      let ability = activePC.dailyAbilities.find((a: any) => a.name === "Tiergestalt" || a.name === "Wild Shape" || a.name?.includes("Wild Shape") || a.name?.includes("Tiergestalt"));
      if (!ability) {
        ability = { name: "Wild Shape", max: defaultWildMax, used: 0 };
        activePC.dailyAbilities.push(ability);
      }
      const used = parseInt(ability.used) || 0;
      if (idx <= used) {
        ability.used = Math.max(0, idx - 1);
      } else {
        ability.used = Math.min(ability.max, idx);
      }
    });
  };

  const handleRevertShape = () => {
    try {
      CombatState.updatePCBatch((activePC: any) => {
        activePC.exitShape();
      });
    } catch (err: any) {
      console.error("Error in exitShape:", err);
      showCustomAlert("Wild Shape", "Error exiting Wild Shape: " + err.message, "OK", "⚠️");
    }
  };

  const handleSelectShape = (shape: string) => {
    try {
      CombatState.updatePCBatch((pcToUpdate: any) => {
        if (!Array.isArray(pcToUpdate.dailyAbilities)) {
          pcToUpdate.dailyAbilities = [];
        }
        let innerWild = pcToUpdate.dailyAbilities.find((a: any) => a.name === "Tiergestalt" || a.name === "Wild Shape" || a.name?.includes("Wild Shape") || a.name?.includes("Tiergestalt"));
        if (!innerWild) {
          innerWild = { name: "Wild Shape", max: defaultWildMax, used: 0 };
          pcToUpdate.dailyAbilities.push(innerWild);
        }
        const used = parseInt(innerWild.used) || 0;
        const max = parseInt(innerWild.max) || 0;
        if (used < max) {
          innerWild.used = used + 1;
          pcToUpdate.enterShape(shape);
        } else {
          throw new Error("No Wild Shape uses remaining!");
        }
      });
      setShowSelectModal(false);
    } catch (err: any) {
      console.error("Error in shape selection:", err);
      showCustomAlert("Wild Shape", "Error transforming: " + err.message, "OK", "⚠️");
    }
  };

  const renderActiveShapeSection = () => {
    if (pc.activeShape !== "none") {
      let shapeLabel = 'Unknown';
      if (pc.activeShape === 'wolf') shapeLabel = 'Wolf';
      if (pc.activeShape === 'leopard') shapeLabel = 'Leopard';
      if (pc.activeShape === 'bear') shapeLabel = 'Brown Bear';

      return (
        <div style={{ background: 'rgba(139, 26, 26, 0.08)', border: '0.5px solid var(--red)', borderRadius: '2px', padding: '4px 6px', fontSize: '8px', color: 'var(--red)', textAlign: 'center', fontWeight: 'bold', marginBottom: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span>🐾 Active in {shapeLabel} form!</span>
          <button 
            onClick={handleRevertShape}
            className="btn revert-shape-btn" 
            style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '4px 10px', width: '100%', cursor: 'pointer', borderRadius: '2px', background: 'rgba(139, 26, 26, 0.2)', border: '1px solid var(--red)', color: 'var(--red)', fontWeight: 'bold' }}
          >
            🔴 Exit {shapeLabel} form
          </button>
        </div>
      );
    }

    return (
      <button 
        onClick={() => setShowSelectModal(true)}
        disabled={remaining <= 0}
        className="btn show-transform-dialog-btn" 
        style={{
          fontFamily: "'IM Fell English SC', serif",
          fontSize: '9px',
          padding: '4px 10px',
          width: '100%',
          cursor: remaining <= 0 ? 'not-allowed' : 'pointer',
          borderRadius: '2px',
          background: remaining <= 0 ? 'rgba(0,0,0,0.05)' : 'rgba(46, 125, 50, 0.1)',
          border: `1px solid ${remaining <= 0 ? 'rgba(200, 169, 110, 0.15)' : 'rgba(46, 125, 50, 0.4)'}`,
          color: remaining <= 0 ? 'var(--inkl)' : '#2e7d32',
          fontWeight: 'bold',
          textShadow: remaining <= 0 ? 'none' : '0 0 4px rgba(46, 125, 50, 0.2)',
          transition: 'background-color 0.15s'
        }}
      >
        🐾 Wild Shape
      </button>
    );
  };

  return (
    <div className={`class-card ${isExpanded ? 'expanded' : ''}`} style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div 
        className="class-card-hdr" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', cursor: 'pointer', userSelect: 'none' }}
      >
        <span>🎭 Druid (Level {level})</span>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', transition: 'transform 0.2s ease' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', fontWeight: 'bold' }}>
            Class Features
          </div>
          {maxUses > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '4px', marginBottom: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', paddingTop: '1px', marginBottom: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span><strong>Wild Shape:</strong></span>
                    <button 
                      onClick={() => setWildshapeRulesOpen(!wildshapeRulesOpen)}
                      className="btn btn-toggle-rules-wildshape" 
                      style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                      title="Show rules"
                    >
                      📖 {wildshapeRulesOpen ? '▲' : '▼'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <div style={{ display: 'flex' }}>
                      {Array.from({ length: maxUses }).map((_, i) => {
                        const bubbleIdx = i + 1;
                        const spent = bubbleIdx <= usedUses;
                        return (
                          <span 
                            key={bubbleIdx}
                            onClick={() => handleBubbleClick(bubbleIdx)}
                            className={`druid-wild-bubble use-icon use-icon-wild ${spent ? 'used' : ''}`} 
                            style={{ cursor: 'pointer' }}
                            title={spent ? 'Used' : 'Available'}
                          >
                            🐾
                          </span>
                        );
                      })}
                    </div>
                    <span>({remaining})</span>
                  </div>
                </div>
                {wildshapeRulesOpen && (
                  <div className="wildshape-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif", marginBottom: '3px' }}>
                    <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Wild Shape:</strong><br />
                    Starting at level 5, the druid can take the form of an animal.<br />
                    • <strong>Effect (3.5e RAW):</strong> Physical attributes (STR, DEX, CON) are replaced by those of the form. Mental attributes (INT, WIS, CHA) remain unchanged. Caster receives the natural armor of the form.<br />
                    • <strong>Equipment:</strong> Armor and shields merge with the body and lose their function.
                  </div>
                )}
              </div>
              
              {renderActiveShapeSection()}

              <div style={{ background: 'rgba(200, 169, 110, 0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px', fontSize: '7.5px', color: 'var(--red)', lineHeight: 1.3, marginTop: '3px', marginBottom: '3px' }}>
                • <strong>Sizes:</strong> {sizeText}<br />
                {level >= 12 && <>• <strong>Plant Shape active!</strong><br /></>}
                {level >= 15 && <>• <strong>Elemental Shape (Huge)!</strong></>}
              </div>
              
              <div style={{ fontSize: '6.8px', border: '0.5px solid rgba(200, 169, 110, 0.2)', padding: '4px', borderRadius: '2px', lineHeight: 1.3, background: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Beast Forms (Reference):</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px dashed rgba(200, 169, 110, 0.15)', paddingBottom: '2px' }}>
                  <span>🐾 <strong>Wolf:</strong> STR 13, DEX 15, CON 15 | Bite 1d6+1</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px dashed rgba(200, 169, 110, 0.15)', paddingBottom: '2px' }}>
                  <span>🐾 <strong>Leopard:</strong> STR 16, DEX 19, CON 15 | Bite 1d6+3</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🐾 <strong>Brown Bear:</strong> STR 27, DEX 13, CON 19 | Claw 1d8+8</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
              Wild Shape is unlocked at level 5.
            </div>
          )}

          <ClassACFSelector pc={pc} classKey="druid" level={level} />
        </div>
      </div>
      )}

      {/* Wild Shape Select Modal */}
      {showSelectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(18, 11, 5, 0.55)', backdropFilter: 'blur(2px)', zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="custom-alert-box" style={{
            background: 'var(--p)',
            border: '2px solid var(--pb)',
            borderRadius: '4px',
            padding: '14px 18px',
            width: '270px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 15px rgba(200,169,110,0.08)',
            fontFamily: "'IM Fell English SC', serif",
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }}></div>
            
            <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', textAlign: 'center', marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              🐾 Select Wild Shape Form
            </div>
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9px', color: 'var(--inkl)', textAlign: 'center', margin: '0 auto 6px', display: 'block' }}>
              Cost: 1 daily use ({remaining} remaining)
            </div>
            <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.3)', margin: '3px 0 8px;' } as any} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
              {/* WOLF */}
              <div 
                onClick={() => handleSelectShape('wolf')}
                className="beast-card" 
                style={{
                  background: 'rgba(200, 169, 110, 0.05)',
                  border: '1px solid var(--pb)',
                  borderRadius: '3px',
                  padding: '5px 7px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '9.5px', color: 'var(--red)', fontWeight: 'bold', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🐺 Wolf</span>
                  <span style={{ fontSize: '7.5px', background: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', border: '0.5px solid rgba(46, 125, 50, 0.3)', borderRadius: '2px', padding: '0 3px' }}>Level 5+</span>
                </div>
                <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '7.5px', color: 'var(--ink)', lineHeight: 1.2, marginTop: '1px' } as any}>
                  • STR 13, DEX 15, CON 15 | AC: 14<br />
                  • Bite +3 (1d6+1 + Trip)
                </div>
              </div>

              {/* LEOPARD */}
              <div 
                onClick={() => handleSelectShape('leopard')}
                className="beast-card" 
                style={{
                  background: 'rgba(200, 169, 110, 0.05)',
                  border: '1px solid var(--pb)',
                  borderRadius: '3px',
                  padding: '5px 7px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '9.5px', color: 'var(--red)', fontWeight: 'bold', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🐆 Leopard</span>
                  <span style={{ fontSize: '7.5px', background: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', border: '0.5px solid rgba(46, 125, 50, 0.3)', borderRadius: '2px', padding: '0 3px' }}>Level 6+</span>
                </div>
                <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '7.5px', color: 'var(--ink)', lineHeight: 1.2, marginTop: '1px' } as any}>
                  • STR 16, DEX 19, CON 15 | AC: 15<br />
                  • Bite +6 (1d6+3) & 2 Claws +1 (1d3+1)
                </div>
              </div>

              {/* BEAR */}
              {level >= 8 ? (
                <div 
                  onClick={() => handleSelectShape('bear')}
                  className="beast-card" 
                  style={{
                    background: 'rgba(200, 169, 110, 0.05)',
                    border: '1px solid var(--pb)',
                    borderRadius: '3px',
                    padding: '5px 7px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '9.5px', color: 'var(--red)', fontWeight: 'bold', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🐻 Brown Bear</span>
                    <span style={{ fontSize: '7.5px', background: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', border: '0.5px solid rgba(46, 125, 50, 0.3)', borderRadius: '2px', padding: '0 3px' }}>Level 8+</span>
                  </div>
                  <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '7.5px', color: 'var(--ink)', lineHeight: 1.2, marginTop: '1px' } as any}>
                    • STR 27, DEX 13, CON 19 | AC: 15<br />
                    • 2 Claws +11 (1d8+8) & Bite +6 (2d6+4)
                  </div>
                </div>
              ) : (
                <div 
                  className="beast-card locked" 
                  style={{
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '3px',
                    padding: '5px 7px',
                    cursor: 'not-allowed',
                    opacity: 0.6
                  }}
                >
                  <div style={{ fontSize: '9.5px', color: 'var(--inkl)', fontWeight: 'bold', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🐻 Brown Bear</span>
                    <span style={{ fontSize: '7.5px', background: 'rgba(0,0,0,0.05)', color: 'var(--inkl)', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '2px', padding: '0 3px' }}>Level 8+</span>
                  </div>
                  <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '7.5px', color: 'var(--inkl)', lineHeight: 1.2, marginTop: '1px' } as any}>
                    • Requires Druid level 8.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowSelectModal(false)}
                className="btn pc-cancel-btn" 
                style={{
                  fontFamily: "'IM Fell English SC', serif",
                  fontSize: '8px',
                  padding: '3px 14px',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: '1px solid var(--pb)',
                  borderRadius: '2px',
                  color: 'var(--inkl)',
                  transition: 'background-color 0.15s',
                  outline: 'none',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
