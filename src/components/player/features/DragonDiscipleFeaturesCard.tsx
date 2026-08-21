import React, { useState } from 'react';
// @ts-ignore
import { getPrestigeClassFeatures } from '@core/rules/prestigeClassEngine.js';

interface DragonDiscipleFeaturesCardProps {
  pc: any;
  level: number;
}

export const DragonDiscipleFeaturesCard: React.FC<DragonDiscipleFeaturesCardProps> = ({ pc, level }) => {
  const [rulesOpen, setRulesOpen] = useState(false);
  const features = getPrestigeClassFeatures(pc, 'dragon_disciple');

  const natArmor = features.naturalArmor;

  const strengthBoost = features.strengthBoost;
  const conBoost = features.constitutionBoost;
  const intBoost = features.intelligenceBoost;
  const chaBoost = features.charismaBoost;

  const breathDmg = features.breathWeapon;

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Dragon Disciple (Level {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', background: 'rgba(200,169,110,0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>Draconic Power:</span>
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
              Natural AC: +{natArmor}
            </span>
          </div>

          {rulesOpen && (
            <div className="dragon-disciple-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '1px', fontFamily: "'Crimson Text', serif" }}>
              <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", fontSize: '8px' }}>Dragon Disciple Rules (D&D 3.5 RAW):</strong><br />
              • <strong>Natural Armor:</strong> Increases by +1 at 1st level, +2 at 4th, +3 at 7th, and +4 at 10th.<br />
              • <strong>Ability Boosts:</strong> Gains permanent ability score increases as you level up.<br />
              • <strong>Breath Weapon (1/day):</strong> Once per day, breathe a cone/line of energy (Reflex half DC 10 + class level + Con mod).<br />
              • <strong>Wings (lvl 9):</strong> Fly speed 60 ft (average).<br />
              • <strong>Dragon Apotheosis (lvl 10):</strong> Gain half-dragon template. Darkvision 60 ft, low-light vision, immunities.
            </div>
          )}

          {/* Stats & Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '8px', marginTop: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '2px' }}>
              <span>Ability Boosts:</span>
              <span style={{ fontWeight: 'bold' }}>
                {strengthBoost > 0 ? `+${strengthBoost} STR ` : ''}
                {conBoost > 0 ? `+${conBoost} CON ` : ''}
                {intBoost > 0 ? `+${intBoost} INT ` : ''}
                {chaBoost > 0 ? `+${chaBoost} CHA` : ''}
                {strengthBoost === 0 && 'None'}
              </span>
            </div>
            {breathDmg && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '2px' }}>
                <span>Breath Weapon (1/day):</span>
                <strong style={{ color: 'var(--red)' }}>{breathDmg}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '2px' }}>
              <span>Flight / Wings:</span>
              <strong>{features.wings ? 'Yes (60 ft Fly)' : 'No'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '2px' }}>
              <span>Dragon Apotheosis:</span>
              <strong>{features.dragonApotheosis ? 'Active (Half-Dragon)' : 'No'}</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
