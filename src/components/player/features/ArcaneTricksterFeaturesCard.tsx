import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { getPrestigeClassFeatures } from '@core/rules/prestigeClassEngine.js';

interface ArcaneTricksterFeaturesCardProps {
  pc: any;
  level: number;
}

export const ArcaneTricksterFeaturesCard: React.FC<ArcaneTricksterFeaturesCardProps> = ({ pc, level }) => {
  const [rulesOpen, setRulesOpen] = useState(false);
  const features = getPrestigeClassFeatures(pc, 'arcane_trickster');
  const arcaneLink = features.spellLink || '';
  const saDiceCount = features.sneakAttackStack;

  const formatClassName = (key: string) => {
    if (!key) return 'Not selected';
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  const handleToggleSneakAttack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activePC = CombatState.getActivePC();
    activePC.isSneakAttacking = e.target.checked;
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
  };

  const rangedLegerdemainCount = features.rangedLegerdemain;
  const impromptuSneakCount = features.impromptuSneakAttack;

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Arcane Trickster (Level {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
          
          {/* Header & Rules Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', background: 'rgba(200,169,110,0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>Arcane Link:</span>
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
              {formatClassName(arcaneLink)}
            </span>
          </div>

          {rulesOpen && (
            <div className="arcane-trickster-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '1px', fontFamily: "'Crimson Text', serif" }}>
              <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", fontSize: '8px' }}>Arcane Trickster Features (D&D 3.5 RAW):</strong><br />
              • <strong>Spells per Day:</strong> At each level, you gain new spells per day as if you had also gained a level in an arcane spellcasting class you belonged to before.<br />
              • <strong>Ranged Legerdemain:</strong> Using Sleight of Hand, Open Lock, or Disable Device at a range of 30 feet. Requires +10 to DC.<br />
              • <strong>Impromptu Sneak Attack:</strong> Once (or twice) per day, declare a melee or ranged attack to be a sneak attack (target loses Dex bonus to AC).
            </div>
          )}

          {/* Feature List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '8px', marginTop: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '2px' }}>
              <span>Sneak Attack:</span>
              <strong style={{ color: 'var(--red)' }}>+{saDiceCount}d6</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '2px' }}>
              <span>Ranged Legerdemain:</span>
              <strong>{rangedLegerdemainCount}/day</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '2px' }}>
              <span>Impromptu Sneak Attack:</span>
              <strong>{impromptuSneakCount}/day</strong>
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
