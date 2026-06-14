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
    bat: 'Bat',
    cat: 'Cat',
    hawk: 'Hawk',
    lizard: 'Lizard',
    owl: 'Owl',
    rat: 'Rat',
    raven: 'Raven',
    snake: 'Snake',
    toad: 'Toad',
    weasel: 'Weasel'
  };

  const familiarBonuses: Record<string, string> = {
    bat: '+3 bonus on Listen checks',
    cat: '+3 bonus on Move Silently checks',
    hawk: '+3 bonus on Spot checks in bright light',
    lizard: '+3 bonus on Climb checks',
    owl: '+3 bonus on Spot checks in shadows',
    rat: '+2 bonus on Fortitude saves',
    raven: '+3 bonus on Appraise checks (speaks a language)',
    snake: '+3 bonus on Bluff checks',
    toad: '+3 maximum hit points (HP)',
    weasel: '+2 bonus on Reflex saves'
  };

  const activeLabel = familiarType !== 'none' ? `${familiarName} (${familiarTypeLabels[familiarType] || familiarType})` : 'None';
  const activeBonus = familiarType !== 'none' ? familiarBonuses[familiarType] : 'No active bonus';

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Sorcerer (Level {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', fontWeight: 'bold' }}>
            Class Features
          </div>
          
          {/* Spontanes Zaubern */}
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '4px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', paddingBottom: '3.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🔮 <strong>Spontaneous Casting:</strong></span>
                <button 
                  onClick={() => setCastingRulesOpen(!castingRulesOpen)}
                  className="btn btn-toggle-rules-casting" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Show Rules"
                >
                  📖 {castingRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <span style={{ color: 'var(--inkm)', fontSize: '7.2px', fontStyle: 'italic' }}>Without preparation</span>
            </div>
            {castingRulesOpen && (
              <div className="casting-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Spontaneous Casting:</strong><br />
                Sorcerers do not prepare spells in advance.<br />
                • <strong>Ability (Charisma):</strong> Max spell level = 10 + spell level. DC = 10 + spell level + CHA mod.<br />
                • <strong>Metamagic (3.5e RAW):</strong> Casting time increases to a Full-Round Action for spells that normally take 1 Standard Action. <em>Quicken Spell</em> is not usable.
              </div>
            )}
          </div>

          {/* Materialien weglassen */}
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '4px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', padding: '2px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>📜 <strong>Eschew Materials:</strong></span>
                <button 
                  onClick={() => setEschewRulesOpen(!eschewRulesOpen)}
                  className="btn btn-toggle-rules-eschew" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Show Rules"
                >
                  📖 {eschewRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <span style={{ color: 'var(--inkm)', fontSize: '7.2px', fontStyle: 'italic' }}>Eschew Materials Feat</span>
            </div>
            {eschewRulesOpen && (
              <div className="eschew-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Eschew Materials:</strong><br />
                Bonus feat at level 1.<br />
                • <strong>Effect:</strong> Material components with a cost of 1 GP or less are ignored.<br />
                • <strong>Limitation:</strong> More expensive components or Magical Focuses (F) must still be provided.
              </div>
            )}
          </div>

          {/* Vertrauenspartner */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '8px', paddingTop: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🦇 <strong>Familiar:</strong></span>
                <button 
                  onClick={() => setFamiliarRulesOpen(!familiarRulesOpen)}
                  className="btn btn-toggle-rules-familiar" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Show Rules"
                >
                  📖 {familiarRulesOpen ? '▲' : '▼'}
                </button>
              </div>
            </div>
            
            {familiarRulesOpen && (
              <div className="familiar-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif", marginBottom: '3px' }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Familiar:</strong><br />
                • <strong>Death/Dismissal:</strong> A Fortitude save against DC 15 is required. On failure, you lose 200 XP per level; on success, you lose 100 XP per level.<br />
                • <strong>Bonus:</strong> Applies within a distance of up to 1 mile.
              </div>
            )}

            <div style={{ background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px', fontSize: '7.2px', lineHeight: 1.2, marginTop: '1px' }}>
              • <strong>Companion:</strong> <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>{activeLabel}</span><br />
              • <strong>Active Bonus:</strong> <span style={{ color: 'var(--ink)' }}>{activeBonus}</span><br />
              <span style={{ fontSize: '6.2px', color: 'var(--inkl)', fontStyle: 'italic', display: 'block', marginTop: '3px' }}>
                🐾 Select the <strong>"Familiar"</strong> tab at the top right to summon, name, or change your familiar.
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
