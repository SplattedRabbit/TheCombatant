import React, { useState, useEffect } from 'react';
import { CombatState } from '@core/state.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';
import { ClassACFSelector } from './ClassACFSelector';
import { getAblMod } from '../attributeHelper';

interface RangerFeaturesCardProps {
  pc: any;
  level: number;
}

export const RangerFeaturesCard: React.FC<RangerFeaturesCardProps> = ({ pc, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [generalRulesOpen, setGeneralRulesOpen] = useState(false);
  const [favoredRulesOpen, setFavoredRulesOpen] = useState(false);
  const [combatstyleRulesOpen, setCombatstyleRulesOpen] = useState(false);
  const [wildempathyRulesOpen, setWildempathyRulesOpen] = useState(false);
  const [favoredEnemyLocal, setFavoredEnemyLocal] = useState(pc.favoredEnemy || '');

  // Keep local input in sync when pc model updates from elsewhere
  useEffect(() => {
    setFavoredEnemyLocal(pc.favoredEnemy || '');
  }, [pc.favoredEnemy]);


  const enemyBonus = Math.floor(level / 5) * 2 + 2;
  const combatStyle = pc.rangerCombatStyle || 'none';
  const casterLvl = Math.floor(level / 2);
  const companionLvl = Math.floor(level / 2);

  const chaScore = pc.cha ? pc.cha.getValue() : 10;
  const chaMod = getAblMod(chaScore);
  const wildEmpathyTotal = level + chaMod;

  const handleFavoredEnemyCommit = (val: string) => {
    if (pc.favoredEnemy !== val) {
      CombatState.updatePCField('favoredEnemy', val);
    }
  };

  const handleCombatStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    CombatState.updatePCField('rangerCombatStyle', e.target.value);
  };

  const handleShowWildEmpathyFormula = () => {
    const title = 'Wild Empathy Check';
    const message = `
      <div style="text-align: left; font-family: var(--font-body); font-size: 11.5px; line-height: 1.35;">
        <p>Roll a physical d20 check and add your modifiers:</p>
        <div style="background: rgba(200, 169, 110, 0.1); border: 0.5px solid var(--pb); border-radius: 3px; padding: 6px; font-family: var(--font-title); text-align: center; margin: 6px 0; font-size: 11px; font-weight: bold; color: var(--red);">
          d20 + ${wildEmpathyTotal}
        </div>
        <div style="font-size: 8px; color: var(--inkm); line-height: 1.25; margin-bottom: 6px;">
          <strong>Formula breakdown:</strong><br>
          • d20 (Physical Roll)<br>
          • + ${level} (Ranger Level)<br>
          • + ${chaMod >= 0 ? '+' : ''}${chaMod} (Charisma Modifier [Value: ${chaScore}])
        </div>
        <div style="font-size: 8px; background: rgba(0,0,0,0.02); padding: 4px; border: 0.3px dashed var(--pb); border-radius: 2px; line-height: 1.2;">
          <strong>Difficulty Classes (DC):</strong><br>
          • Make Indifferent: DC 10 (if unfriendly) / DC 15 (if hostile)<br>
          • Make Friendly: DC 15 (from indifferent) / DC 25 (from hostile)<br>
          • Make Helpful: DC 20 (from friendly) / DC 30 (from indifferent)
        </div>
        <small style="color: var(--inkm); font-size: 7px; display: block; margin-top: 4px;">*Against magical beasts (Int 1-2), a -4 penalty applies.</small>
      </div>
    `;
    showCustomAlert(title, message, 'Close', '🎲');
  };

  const renderCombatStyleFeatsList = () => {
    if (combatStyle === 'none' || level < 2) return null;
    const feats = [];
    if (combatStyle === 'archery') {
      feats.push({ name: 'Rapid Shot', lvl: 2 });
      if (level >= 6) feats.push({ name: 'Manyshot', lvl: 6 });
      if (level >= 11) feats.push({ name: 'Improved Precise Shot', lvl: 11 });
    } else if (combatStyle === 'twoweapon') {
      feats.push({ name: 'Two-Weapon Fighting', lvl: 2 });
      if (level >= 6) feats.push({ name: 'Improved Two-Weapon Fighting', lvl: 6 });
      if (level >= 11) feats.push({ name: 'Greater Two-Weapon Fighting', lvl: 11 });
    }

    return (
      <div style={{ background: 'rgba(200, 169, 110, 0.06)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderRadius: '2px', padding: '4px', marginTop: '3px', fontSize: '7.5px' }}>
        <div style={{ fontWeight: 'bold', color: 'var(--red)', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Active Combat Style Feats:</span>
          <span style={{ color: 'var(--inkm)', fontWeight: 'normal', fontSize: '6.8px', fontStyle: 'italic' }}>(Light or no armor only)</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: '10px', listStyleType: 'square', lineHeight: 1.25 }}>
          {feats.map((f, idx) => <li key={idx}><strong>{f.name}</strong></li>)}
        </ul>
      </div>
    );
  };

  return (
    <div className={`class-card ${isExpanded ? 'expanded' : ''}`} style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div 
        className="class-card-hdr" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-title)', fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', cursor: 'pointer', userSelect: 'none' }}
      >
        <span>🎭 Ranger (Level {level})</span>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', transition: 'transform 0.2s ease' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
            <span>Class Features</span>
            <button 
              onClick={() => setGeneralRulesOpen(!generalRulesOpen)}
              className="btn btn-toggle-rules-general" 
              style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
              title="Show Rules"
            >
              📖 {generalRulesOpen ? '▲' : '▼'}
            </button>
          </div>
          
          {generalRulesOpen && (
            <div className="general-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: 'var(--font-body)' }}>
              <strong style={{ color: 'var(--red)', fontFamily: 'var(--font-title)' }}>Ranger Class Features:</strong><br />
              • <strong>Track (Level 1):</strong> Gains <em>Track</em> as a bonus feat.<br />
              • <strong>Endurance (Level 3):</strong> Gains <em>Endurance</em> as a bonus feat.<br />
              • <strong>Animal Companion (Level 4):</strong> Gains an animal companion (effective level = 1/2 Ranger level).<br />
              • <strong>Spells (Level 4):</strong> Divine spells based on Wisdom (caster level = 1/2 Ranger level).<br />
              • <strong>Woodland Stride (Level 7):</strong> Can move through natural undergrowth without taking damage or being slowed.<br />
              • <strong>Swift Tracker (Level 8):</strong> Can track at normal speed without the -5 penalty.<br />
              • <strong>Evasion (Level 9):</strong> Take no damage on a successful Reflex save (light or no armor only).<br />
              • <strong>Camouflage (Level 13):</strong> Can use the Hide skill in natural terrain even without cover or concealment.<br />
              • <strong>Hide in Plain Sight (Level 17):</strong> Can use the Hide skill in natural terrain even while being observed.
            </div>
          )}
          
          {/* Erzfeind Sektion */}
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px', marginTop: '1px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span><strong>Favored Enemy:</strong></span>
                <button 
                  onClick={() => setFavoredRulesOpen(!favoredRulesOpen)}
                  className="btn btn-toggle-rules-favored" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                  title="Show Rules"
                >
                  📖 {favoredRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <input 
                type="text" 
                value={favoredEnemyLocal}
                onChange={(e) => setFavoredEnemyLocal(e.target.value)}
                onBlur={() => handleFavoredEnemyCommit(favoredEnemyLocal)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleFavoredEnemyCommit(favoredEnemyLocal); }}
                placeholder="e.g. Undead" 
                style={{ width: '70px', fontSize: '8px', height: '13px', lineHeight: 1, borderRadius: '1px', border: '0.5px solid var(--pb)', padding: '0 2px' }}
              />
            </div>
            {favoredRulesOpen && (
              <div className="favored-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: 'var(--font-body)' }}>
                <strong style={{ color: 'var(--red)', fontFamily: 'var(--font-title)' }}>Favored Enemy:</strong><br />
                Ranger gains bonuses against specific creature types.<br />
                • <strong>Active Bonus: +{enemyBonus}</strong><br />
                • <strong>Application:</strong> Applies to all <strong>weapon damage rolls</strong> against the favored enemy. Applies to checks for Bluff, Spot, Listen, Sense Motive, and Survival against these creatures.<br />
                • <strong style={{ color: 'var(--red)' }}>Important (3.5e RAW):</strong> Does <strong>NOT grant an attack bonus</strong> on rolls to hit!
              </div>
            )}
          </div>
          <div style={{ background: 'rgba(200, 169, 110, 0.12)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--red)', textAlign: 'center', fontWeight: 'bold', lineHeight: 1.25 }}>
            ✦ Favored Enemy Bonus: +{enemyBonus} to Damage & Skills ✦
          </div>

          {/* Kampfstil Sektion */}
          {level >= 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px', paddingTop: '3px', marginTop: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span><strong>Combat Style:</strong></span>
                  <button 
                    onClick={() => setCombatstyleRulesOpen(!combatstyleRulesOpen)}
                    className="btn btn-toggle-rules-combatstyle" 
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                    title="Show Rules"
                  >
                    📖 {combatstyleRulesOpen ? '▲' : '▼'}
                  </button>
                </div>
                <select 
                  value={combatStyle}
                  onChange={handleCombatStyleChange}
                  className="cinput ranger-combat-style" 
                  style={{ width: '70px', fontSize: '7.5px', height: '14px', padding: '0 1px' }}
                >
                  <option value="none">-- Select --</option>
                  <option value="archery">Archery</option>
                  <option value="twoweapon">Two-Weapon</option>
                </select>
              </div>
              {combatstyleRulesOpen && (
                <div className="combatstyle-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: 'var(--font-body)' }}>
                  <strong style={{ color: 'var(--red)', fontFamily: 'var(--font-title)' }}>Combat Style:</strong><br />
                  At level 2, the ranger specializes in a combat style. The benefits apply <strong>only in light or no armor</strong>!<br />
                  • <strong>Archery:</strong> Level 2: <em>Rapid Shot</em>, Level 6: <em>Manyshot</em>, Level 11: <em>Improved Precise Shot</em>.<br />
                  • <strong>Two-Weapon Fighting:</strong> Level 2: <em>Two-Weapon Fighting</em>, Level 6: <em>Improved Two-Weapon Fighting</em>, Level 11: <em>Greater Two-Weapon Fighting</em>.
                </div>
              )}
              {renderCombatStyleFeatsList()}
            </div>
          )}

          {/* Wildes Mitgefühl Sektion */}
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px', paddingTop: '3px', marginTop: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span><strong>Wild Empathy:</strong></span>
                <button 
                  onClick={() => setWildempathyRulesOpen(!wildempathyRulesOpen)}
                  className="btn btn-toggle-rules-wildempathy" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                  title="Show Rules"
                >
                  📖 {wildempathyRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <button 
                onClick={handleShowWildEmpathyFormula}
                className="xbtn ranger-wild-empathy-btn" 
                style={{ fontSize: '7.5px', padding: '1px 4px', height: '14px', lineHeight: 1, fontFamily: 'var(--font-title)', cursor: 'pointer' }}
              >
                Show Formula 🎲
              </button>
            </div>
            {wildempathyRulesOpen && (
              <div className="wildempathy-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: 'var(--font-body)' }}>
                <strong style={{ color: 'var(--red)', fontFamily: 'var(--font-title)' }}>Wild Empathy:</strong><br />
                Improve the attitude of animals (similar to Diplomacy).<br />
                • <strong>Roll Formula:</strong> 1d20 + Ranger Level [{level}] + CHA Mod.<br />
                • <strong>Application:</strong> Line of sight and proximity (max. 30 ft), takes 1 minute.<br />
                • <strong>Magical Beasts:</strong> Can also be used against magical beasts (Int 1-2) with a -4 penalty.
              </div>
            )}
          </div>

          {/* Tierbegleiter & Zauberstufe Fußzeile */}
          {level >= 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '7.2px', borderTop: '0.5px solid rgba(200,169,110,0.2)', paddingTop: '3px', marginTop: '2px', color: 'var(--inkm)' }}>
              <div>🐾 Companion Level: <strong>{companionLvl}</strong></div>
              <div style={{ textAlign: 'right' }}>🔮 Ranger Caster Level: <strong>{casterLvl}</strong></div>
            </div>
          )}

          <ClassACFSelector pc={pc} classKey="ranger" level={level} />
        </div>
      </div>
      )}
    </div>
  );
};
