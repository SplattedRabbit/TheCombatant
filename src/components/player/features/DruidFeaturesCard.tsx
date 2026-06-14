import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';

interface DruidFeaturesCardProps {
  pc: any;
  level: number;
}

export const DruidFeaturesCard: React.FC<DruidFeaturesCardProps> = ({ pc, level }) => {
  const [wildshapeRulesOpen, setWildshapeRulesOpen] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);

  const wildAbility = pc.dailyAbilities?.find((a: any) => a.name === "Tiergestalt" || a.name === "Wild Shape");
  const maxUses = wildAbility ? (parseInt(wildAbility.max) || 0) : 0;
  const usedUses = wildAbility ? (parseInt(wildAbility.used) || 0) : 0;
  const remaining = Math.max(0, maxUses - usedUses);

  let sizeText = 'Keine Tiergestalt (erst ab Stufe 5)';
  if (level >= 15) sizeText = 'Winzig, Klein, Mittel, Groß, Riesig';
  else if (level >= 11) sizeText = 'Winzig, Klein, Mittel, Groß';
  else if (level >= 8) sizeText = 'Klein, Mittel, Groß';
  else if (level >= 5) sizeText = 'Klein, Mittel';

  const handleBubbleClick = (idx: number) => {
    CombatState.updatePCBatch((activePC: any) => {
      const ability = activePC.dailyAbilities.find((a: any) => a.name === "Tiergestalt" || a.name === "Wild Shape");
      if (ability) {
        const used = parseInt(ability.used) || 0;
        if (idx <= used) {
          ability.used = Math.max(0, idx - 1);
        } else {
          ability.used = Math.min(ability.max, idx);
        }
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
      alert("Fehler beim Beenden der Tiergestalt: " + err.message);
    }
  };

  const handleSelectShape = (shape: string) => {
    try {
      CombatState.updatePCBatch((pcToUpdate: any) => {
        const innerWild = pcToUpdate.dailyAbilities.find((a: any) => a.name === "Tiergestalt" || a.name === "Wild Shape");
        if (innerWild) {
          const used = parseInt(innerWild.used) || 0;
          const max = parseInt(innerWild.max) || 0;
          if (used < max) {
            innerWild.used = used + 1;
            pcToUpdate.enterShape(shape);
          } else {
            throw new Error("Keine Tiergestalt-Nutzungen mehr übrig!");
          }
        } else {
          throw new Error("Tiergestalt-Ladungen wurden nicht gefunden!");
        }
      });
      setShowSelectModal(false);
    } catch (err: any) {
      console.error("Error in shape selection:", err);
      alert("Fehler beim Verwandeln: " + err.message);
    }
  };

  const renderActiveShapeSection = () => {
    if (pc.activeShape !== "none") {
      let shapeLabel = 'Unbekannt';
      if (pc.activeShape === 'wolf') shapeLabel = 'Wolf';
      if (pc.activeShape === 'leopard') shapeLabel = 'Leopard';
      if (pc.activeShape === 'bear') shapeLabel = 'Braunbär';

      return (
        <div style={{ background: 'rgba(139, 26, 26, 0.08)', border: '0.5px solid var(--red)', borderRadius: '2px', padding: '4px 6px', fontSize: '8px', color: 'var(--red)', textAlign: 'center', fontWeight: 'bold', marginBottom: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span>🐾 Aktiv in Gestalt des {shapeLabel}s!</span>
          <button 
            onClick={handleRevertShape}
            className="btn revert-shape-btn" 
            style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '4px 10px', width: '100%', cursor: 'pointer', borderRadius: '2px', background: 'rgba(139, 26, 26, 0.2)', border: '1px solid var(--red)', color: 'var(--red)', fontWeight: 'bold' }}
          >
            🔴 Gestalt des {shapeLabel}s beenden
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
        🐾 In Tiergestalt verwandeln
      </button>
    );
  };

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Druide (Stufe {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', fontWeight: 'bold' }}>
            Klassenfähigkeiten
          </div>
          {maxUses > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '4px', marginBottom: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', paddingTop: '1px', marginBottom: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span><strong>Tiergestalt:</strong></span>
                    <button 
                      onClick={() => setWildshapeRulesOpen(!wildshapeRulesOpen)}
                      className="btn btn-toggle-rules-wildshape" 
                      style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                      title="Regeln einblenden"
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
                            title={spent ? 'Benutzt' : 'Verfügbar'}
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
                    <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Tiergestalt (Wild Shape):</strong><br />
                    Ab Stufe 5 kann der Druide Tiergestalt annehmen.<br />
                    • <strong>Effekt (3.5e RAW):</strong> Physische Attribute (STR, DEX, CON) werden durch die der Form ersetzt. Geistige Attribute (INT, WIS, CHA) bleiben gleich. Natürliche Rüstung der Form wird angerechnet.<br />
                    • <strong>Ausrüstung:</strong> Rüstung und Schilde verschmelzen mit dem Körper und verlieren ihre Funktion.
                  </div>
                )}
              </div>
              
              {renderActiveShapeSection()}

              <div style={{ background: 'rgba(200, 169, 110, 0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px', fontSize: '7.5px', color: 'var(--red)', lineHeight: 1.3, marginTop: '3px', marginBottom: '3px' }}>
                • <strong>Größen:</strong> {sizeText}<br />
                {level >= 12 && <>• <strong>Pflanzengestalt aktiv!</strong><br /></>}
                {level >= 15 && <>• <strong>Elementargestalt (Riesig)!</strong></>}
              </div>
              
              <div style={{ fontSize: '6.8px', border: '0.5px solid rgba(200, 169, 110, 0.2)', padding: '4px', borderRadius: '2px', lineHeight: 1.3, background: 'rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Tier-Formen (Referenz):</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px dashed rgba(200, 169, 110, 0.15)', paddingBottom: '2px' }}>
                  <span>🐾 <strong>Wolf:</strong> Stä 13, Ges 15, Kon 15 | Biss 1w6+1</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px dashed rgba(200, 169, 110, 0.15)', paddingBottom: '2px' }}>
                  <span>🐾 <strong>Leopard:</strong> Stä 16, Ges 19, Kon 15 | Biss 1w6+3</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🐾 <strong>Braunbär:</strong> Stä 27, Ges 13, Kon 19 | Klaue 1w8+8</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
              Tiergestalt wird ab Stufe 5 freigeschaltet.
            </div>
          )}
        </div>
      </div>

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
              🐾 Tiergestalt wählen
            </div>
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9px', color: 'var(--inkl)', textAlign: 'center', margin: '0 auto 6px', display: 'block' }}>
              Kosten: 1 tägliche Anwendung ({remaining} verbleibend)
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
                  <span style={{ fontSize: '7.5px', background: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', border: '0.5px solid rgba(46, 125, 50, 0.3)', borderRadius: '2px', padding: '0 3px' }}>Stufe 5+</span>
                </div>
                <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '7.5px', color: 'var(--ink)', lineIndex: 1.2, marginTop: '1px' } as any}>
                  • Stä 13, Ges 15, Kon 15 | RK: 14<br />
                  • Biss +3 (1w6+1 + Trip/Zu-Boden)
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
                  <span style={{ fontSize: '7.5px', background: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', border: '0.5px solid rgba(46, 125, 50, 0.3)', borderRadius: '2px', padding: '0 3px' }}>Stufe 6+</span>
                </div>
                <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '7.5px', color: 'var(--ink)', lineIndex: 1.2, marginTop: '1px' } as any}>
                  • Stä 16, Ges 19, Kon 15 | RK: 15<br />
                  • Biss +6 (1w6+3) & 2 Krallen +1 (1w3+1)
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
                    <span>🐻 Braunbär</span>
                    <span style={{ fontSize: '7.5px', background: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', border: '0.5px solid rgba(46, 125, 50, 0.3)', borderRadius: '2px', padding: '0 3px' }}>Stufe 8+</span>
                  </div>
                  <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '7.5px', color: 'var(--ink)', lineIndex: 1.2, marginTop: '1px' } as any}>
                    • Stä 27, Ges 13, Kon 19 | RK: 15<br />
                    • 2 Krallen +11 (1w8+8) & Biss +6 (2w6+4)
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
                    <span>🐻 Braunbär</span>
                    <span style={{ fontSize: '7.5px', background: 'rgba(0,0,0,0.05)', color: 'var(--inkl)', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '2px', padding: '0 3px' }}>Stufe 8+</span>
                  </div>
                  <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '7.5px', color: 'var(--inkl)', lineIndex: 1.2, marginTop: '1px' } as any}>
                    • Benötigt Druidenstufe 8.
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
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
