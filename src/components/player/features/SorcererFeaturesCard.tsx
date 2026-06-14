import React, { useState } from 'react';

interface SorcererFeaturesCardProps {
  pc: any;
  level: number;
}

export const SorcererFeaturesCard: React.FC<SorcererFeaturesCardProps> = ({ pc, level }) => {
  const [castingRulesOpen, setCastingRulesOpen] = useState(false);
  const [eschewRulesOpen, setEschewRulesOpen] = useState(false);
  const [familiarRulesOpen, setFamiliarRulesOpen] = useState(false);

  const familiarType = pc.familiarType || 'none';
  const familiarName = pc.familiarName || '';

  const familiarTypeLabels: Record<string, string> = {
    bat: 'Fledermaus',
    cat: 'Katze',
    hawk: 'Falke',
    lizard: 'Eidechse',
    owl: 'Eule',
    rat: 'Ratte',
    raven: 'Rabe',
    snake: 'Schlange',
    toad: 'Kröte',
    weasel: 'Wiesel'
  };

  const familiarBonuses: Record<string, string> = {
    bat: '+3 auf Lauschen (Listen) checks',
    cat: '+3 auf Leise bewegen (Move Silently) checks',
    hawk: '+3 auf Entdecken (Spot) in hellem Licht',
    lizard: '+3 auf Klettern (Climb) checks',
    owl: '+3 auf Entdecken (Spot) in Schatten',
    rat: '+2 auf Zähigkeitsrettungswürfe (Fortitude)',
    raven: '+3 auf Schätzen (Appraise) checks (spricht Sprache)',
    snake: '+3 auf Bluffen (Bluff) checks',
    toad: '+3 maximale Trefferpunkte (HP)',
    weasel: '+2 auf Reflexrettungswürfe (Reflex)'
  };

  const activeLabel = familiarType !== 'none' ? `${familiarName} (${familiarTypeLabels[familiarType] || familiarType})` : 'Keiner';
  const activeBonus = familiarType !== 'none' ? familiarBonuses[familiarType] : 'Kein Bonus aktiv';

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Hexenmeister (Stufe {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', fontWeight: 'bold' }}>
            Klassenfähigkeiten
          </div>
          
          {/* Spontanes Zaubern */}
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '4px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', paddingBottom: '3.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🔮 <strong>Spontanes Zaubern:</strong></span>
                <button 
                  onClick={() => setCastingRulesOpen(!castingRulesOpen)}
                  className="btn btn-toggle-rules-casting" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Regeln einblenden"
                >
                  📖 {castingRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <span style={{ color: 'var(--inkm)', fontSize: '7.2px', fontStyle: 'italic' }}>Ohne Vorbereitung</span>
            </div>
            {castingRulesOpen && (
              <div className="casting-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Spontanes Zaubern:</strong><br />
                Hexenmeister bereiten ihre Zauber nicht im Voraus vor.<br />
                • <strong>Attribut (Charisma):</strong> Max Zaubergrad = 10 + Zaubergrad. SG = 10 + Zaubergrad + CHA-Mod.<br />
                • <strong>Metamagie (3.5e RAW):</strong> Zauberzeit erhöht sich auf Volle Aktion (Full-Round Action) für Zauber, die sonst 1 Standardaktion dauern. <em>Schnelles Zaubern (Quicken Spell)</em> ist nicht nutzbar.
              </div>
            )}
          </div>

          {/* Materialien weglassen */}
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '4px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', padding: '2px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>📜 <strong>Materialien weglassen:</strong></span>
                <button 
                  onClick={() => setEschewRulesOpen(!eschewRulesOpen)}
                  className="btn btn-toggle-rules-eschew" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Regeln einblenden"
                >
                  📖 {eschewRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <span style={{ color: 'var(--inkm)', fontSize: '7.2px', fontStyle: 'italic' }}>Eschew Materials Feat</span>
            </div>
            {eschewRulesOpen && (
              <div className="eschew-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Materialien weglassen:</strong><br />
                Bonus-Talent auf Stufe 1.<br />
                • <strong>Effekt:</strong> Materialkomponenten im Wert von 1 GM oder weniger entfallen.<br />
                • <strong>Einschränkung:</strong> Teurere Komponenten oder Magische Fokusse (F) müssen weiterhin gestellt werden.
              </div>
            )}
          </div>

          {/* Vertrauenspartner */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '8px', paddingTop: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🦇 <strong>Vertrauenspartner (Familiar):</strong></span>
                <button 
                  onClick={() => setFamiliarRulesOpen(!familiarRulesOpen)}
                  className="btn btn-toggle-rules-familiar" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Regeln einblenden"
                >
                  📖 {familiarRulesOpen ? '▲' : '▼'}
                </button>
              </div>
            </div>
            
            {familiarRulesOpen && (
              <div className="familiar-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif", marginBottom: '3px' }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Vertrauenspartner (Familiar):</strong><br />
                • <strong>Tod/Entlassung:</strong> Zähigkeitswurf gegen SG 15 nötig. Bei Misslingen verliert man 200 EP pro Stufe, bei Erfolg 100 EP pro Stufe.<br />
                • <strong>Bonus:</strong> Gilt bei einer Entfernung bis zu 1 Meile.
              </div>
            )}

            <div style={{ background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px', fontSize: '7.2px', lineHeight: 1.2, marginTop: '1px' }}>
              • <strong>Partner:</strong> <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>{activeLabel}</span><br />
              • <strong>Aktivierter Bonus:</strong> <span style={{ color: 'var(--ink)' }}>{activeBonus}</span><br />
              <span style={{ fontSize: '6.2px', color: 'var(--inkl)', fontStyle: 'italic', display: 'block', marginTop: '3px' }}>
                🐾 Wähle den Reiter <strong>"Vertrauter"</strong> oben rechts, um deinen Vertrauten zu rufen, zu benennen oder zu wechseln.
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
