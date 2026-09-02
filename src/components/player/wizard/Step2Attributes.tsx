import React from 'react';
import { CLASSES_LIST, CLASS_KEY_ATTRIBUTES } from './constants';
import { showAttributeExplanation } from '../attributeHelper';
import { getRacialModifier, getMod, getRacialModifierString } from './helpers';

interface Step2AttributesProps {
  baseStats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  setBaseStats: React.Dispatch<React.SetStateAction<{
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  }>>;
  selectedRace: string;
  highlightClass: string;
  setHighlightClass: (val: string) => void;
  totalStatsSpent: number;
}

export const Step2Attributes: React.FC<Step2AttributesProps> = ({
  baseStats,
  setBaseStats,
  selectedRace,
  highlightClass,
  setHighlightClass,
  totalStatsSpent
}) => {
  return (
    <div style={{ textAlign: 'left', marginTop: '10px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', margin: '0 0 20px 0', lineHeight: 1.5, color: 'var(--inkm)' }}>
        Distribute a total of **74 points** among your 6 ability scores. Racial bonuses are calculated separately and displayed live on the right as final values.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
        {/* Point buy selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(k => {
            const labelMap = { str: 'Strength (STR)', dex: 'Dexterity (DEX)', con: 'Constitution (CON)', int: 'Intelligence (INT)', wis: 'Wisdom (WIS)', cha: 'Charisma (CHA)' };
            const base = baseStats[k];
            const racMod = getRacialModifier(selectedRace, k);
            const finalVal = base + racMod;
            const finalMod = getMod(finalVal);
            const finalModStr = finalMod >= 0 ? `+${finalMod}` : `${finalMod}`;
            const isKeyAttr = highlightClass ? CLASS_KEY_ATTRIBUTES[highlightClass]?.includes(k) : false;
            
            return (
              <div 
                key={k} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: isKeyAttr ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 232, 193, 0.3)',
                  border: isKeyAttr ? '1.5px solid rgba(76, 175, 80, 0.5)' : '1px solid var(--pb)',
                  borderRadius: '4px'
                }}
              >
                <strong 
                  style={{ 
                    fontSize: '13px', 
                    width: '150px', 
                    cursor: 'pointer', 
                    borderBottom: '1px dashed var(--red)'
                  }}
                  onClick={() => showAttributeExplanation(k)}
                  title="Click for a brief explanation"
                >
                  {labelMap[k]}
                  {isKeyAttr && <span style={{ color: 'green', fontSize: '9px', marginLeft: '4px', display: 'inline-block' }}>★ Key</span>}
                </strong>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    className="btn" 
                    style={{ padding: '2px 8px', fontSize: '12px' }}
                    disabled={base <= 3}
                    onClick={() => setBaseStats({ ...baseStats, [k]: base - 1 })}
                  >
                    -
                  </button>
                  
                  <input
                    type="number"
                    value={base}
                    onChange={(e) => {
                      let val = parseInt(e.target.value);
                      if (isNaN(val)) {
                        setBaseStats({ ...baseStats, [k]: 0 });
                        return;
                      }
                      if (val > 18) val = 18;
                      const theoreticalSum = totalStatsSpent - base + val;
                      if (theoreticalSum <= 74) {
                        setBaseStats({ ...baseStats, [k]: val });
                      } else {
                        const remaining = 74 - (totalStatsSpent - base);
                        setBaseStats({ ...baseStats, [k]: Math.min(18, remaining) });
                      }
                    }}
                    onBlur={(e) => {
                      let val = parseInt(e.target.value);
                      if (isNaN(val) || val < 3) val = 3;
                      if (val > 18) val = 18;
                      const theoreticalSum = totalStatsSpent - base + val;
                      if (theoreticalSum <= 74) {
                        setBaseStats({ ...baseStats, [k]: val });
                      } else {
                        const remaining = 74 - (totalStatsSpent - base);
                        setBaseStats({ ...baseStats, [k]: Math.min(18, Math.max(3, remaining)) });
                      }
                    }}
                    min={3}
                    max={18}
                    style={{
                      width: '40px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      border: '1px solid var(--pb)',
                      background: 'white',
                      borderRadius: '3px',
                      padding: '3px 0'
                    }}
                  />

                  <button 
                    className="btn" 
                    style={{ padding: '2px 8px', fontSize: '12px' }}
                    disabled={base >= 18 || totalStatsSpent >= 74}
                    onClick={() => setBaseStats({ ...baseStats, [k]: base + 1 })}
                  >
                    +
                  </button>
                </div>
                
                <div style={{ fontSize: '11px', color: 'var(--inkl)', fontStyle: 'italic', width: '60px', textAlign: 'center' }}>
                  {getRacialModifierString(selectedRace, k) ? `${getRacialModifierString(selectedRace, k)} Race` : '—'}
                </div>

                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--red)', width: '90px', textAlign: 'right' }}>
                  = {finalVal} ({finalModStr})
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary box */}
        <div 
          style={{ 
            background: 'rgba(200, 169, 110, 0.08)', 
            border: '1px solid var(--pb)', 
            borderRadius: '4px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '260px'
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--inkl)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
            Point Distribution
          </div>
          
          <div style={{ fontSize: '64px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: totalStatsSpent === 74 ? 'green' : 'var(--red)' }}>
            {totalStatsSpent} <span style={{ fontSize: '20px', color: 'var(--ink)' }}>/ 74</span>
          </div>
          
          <div style={{ width: '100%', marginTop: '16px', borderTop: '0.5px dashed rgba(200, 169, 110, 0.4)', paddingTop: '12px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--inkm)', display: 'block', marginBottom: '4px', textAlign: 'center' }}>
              Highlight important attributes:
            </label>
            <select
              value={highlightClass}
              onChange={(e) => setHighlightClass(e.target.value)}
              className="cinput"
              style={{ width: '100%', padding: '0 6px', fontSize: '11px', height: '24px', cursor: 'pointer', fontFamily: 'var(--font-title)', boxSizing: 'border-box' }}
            >
              <option value="">-- None --</option>
              {CLASSES_LIST.filter(c => !c.isPrestige).map(c => (
                <option key={c.key} value={c.key}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
