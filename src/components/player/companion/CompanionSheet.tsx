/**
 * @module    CompanionSheet
 * @summary   Animal Companion sheet as a React component. Shows attributes, hit points, armor class, and attacks of the companion.
 * @exports   CompanionSheet
 * @reads     pc.companionType, pc.companionName, pc.companionHP, pc.companionMaxHP
 * @stateOps  CombatState.saveToStorage, CombatState.syncPCToHost
 * @depends   React, CompanionRules, CombatState, dialogs
 */

import React from 'react';
import { CompanionRules } from '@core/rules/CompanionRules.js';
import { CombatState } from '@core/state.js';
import { showRollBreakdown } from '@core/ui/components/dialogs.js';
import { getAblMod, formatMod } from '../attributeHelper';

interface CompanionSheetProps {
  pc: any;
  onUpdate: () => void;
}

export const CompanionSheet: React.FC<CompanionSheetProps> = ({ pc, onUpdate }) => {
  const type = pc.companionType || 'none';
  const name = pc.companionName || '';
  const curHP = pc.companionHP || 0;
  const maxHP = pc.companionMaxHP || 0;

  const effectiveDruidLvl = CompanionRules.calculateEffectiveDruidLevel(pc);
  const baseStats = CompanionRules.getCompanionBaseStats(type, effectiveDruidLvl);

  const handleSpeciesChange = (newType: string) => {
    CombatState.updatePCBatch((activePC: any) => {
      activePC.companionType = newType;

      if (newType !== 'none') {
        const base = CompanionRules.getCompanionBaseStats(newType, activePC.level);
        if (base) {
          activePC.companionName = base.name;
          activePC.companionMaxHP = base.maxHP;
          activePC.companionHP = base.maxHP;
        }
      } else {
        activePC.companionName = '';
        activePC.companionMaxHP = 0;
        activePC.companionHP = 0;
      }
    });
    onUpdate();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    CombatState.updatePCBatch((activePC: any) => {
      activePC.companionName = val;
    });
    onUpdate();
  };

  const handleHpCurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10) || 0;
    CombatState.updatePCBatch((activePC: any) => {
      activePC.companionHP = Math.max(0, Math.min(activePC.companionMaxHP || 0, val));
    });
    onUpdate();
  };

  const handleHpMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10) || 1;
    CombatState.updatePCBatch((activePC: any) => {
      activePC.companionMaxHP = val;
      activePC.companionHP = Math.min(activePC.companionHP || 0, val);
    });
    onUpdate();
  };

  const handleHpAdjust = (dir: number) => {
    CombatState.updatePCBatch((activePC: any) => {
      activePC.companionHP = Math.max(0, Math.min(activePC.companionMaxHP || 0, (activePC.companionHP || 0) + dir));
    });
    onUpdate();
  };

  const handleAttackRoll = (e: React.MouseEvent<HTMLButtonElement>, attName: string, bonus: number, _damage: string, _note: string) => {
    e.stopPropagation();
    const compName = pc.companionName || 'Animal Companion';

    showRollBreakdown(`${compName} - ${attName}`, `1W20`, [
      { label: "Attack Bonus (Strength/Size)", value: bonus }
    ], e.nativeEvent);
  };


  if (type === 'none') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', borderBottom: '1px solid var(--pb)', paddingBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', letterSpacing: '0.5px' }}>
          <span>🐾 Companion &amp; Animal Companion Sheet (Companion Level: {effectiveDruidLvl})</span>
          <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'normal', fontStyle: 'italic' }}>D&amp;D 3.5e Rules</span>
        </div>
        <div style={{ fontSize: '8.5px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '45px 15px', background: 'rgba(0,0,0,0.02)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
          🐾 You currently have no active animal companion selected.<br />
          <span style={{ fontSize: '7.5px', marginTop: '3px', display: 'block' }}>Select a creature type below to summon your companion!</span>
          
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
            <select 
              value={type}
              onChange={(e) => handleSpeciesChange(e.target.value)}
              className="cinput companion-species-select" 
              style={{ fontSize: '8px', height: '16px', padding: '0 4px', width: '120px' }}
            >
              <option value="none">-- Select --</option>
              <option value="wolf">🐺 Wolf (D&D 3.5e RAW)</option>
              <option value="leopard">🐆 Leopard (D&D 3.5e RAW)</option>
              <option value="bear">🐻 Brown Bear (D&D 3.5e RAW)</option>
              <option value="custom">🛡️ Custom</option>
            </select>
          </div>
        </div>
      </div>
    );
  }



  const displayAC = type === 'custom' ? maxHP : (baseStats ? baseStats.ac : 10);
  const str = baseStats ? baseStats.str : 10;
  const dex = baseStats ? baseStats.dex : 10;
  const con = baseStats ? baseStats.con : 10;
  const wis = baseStats ? baseStats.wis : 10;
  const cha = baseStats ? baseStats.cha : 10;

  const pct = maxHP > 0 ? Math.max(0, Math.min(100, Math.floor((curHP / maxHP) * 100))) : 0;
  const fc = curHP <= 0 ? 'fill-dead' : (pct > 50 ? 'fill-ok' : (pct > 25 ? 'fill-warn' : 'fill-crit'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', borderBottom: '1px solid var(--pb)', paddingBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', letterSpacing: '0.5px' }}>
        <span>🐾 Companion &amp; Animal Companion Sheet (Companion Level: {effectiveDruidLvl})</span>
        <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'normal', fontStyle: 'italic' }}>D&amp;D 3.5e Rules</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(200, 169, 110, 0.04)', border: '0.5px solid var(--pb)', borderRadius: '3px', padding: '6px' }}>
        {/* Companion Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--pb)', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px' }}>🐾</span>
            <input 
              type="text" 
              className="companion-name-field" 
              value={name} 
              onChange={handleNameChange}
              placeholder="Companion Name" 
              style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', background: 'transparent', border: 'none', borderBottom: '0.5px dashed var(--pb)', outline: 'none', width: '120px' }} 
              title="Companion Name" 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>Type:</span>
            <select 
              value={type}
              onChange={(e) => handleSpeciesChange(e.target.value)}
              className="cinput companion-species-select" 
              style={{ fontSize: '7.5px', height: '14px', padding: '0', width: '75px', margin: '0' }}
            >
              <option value="wolf">Wolf</option>
              <option value="leopard">Leopard</option>
              <option value="bear">Brown Bear</option>
              <option value="custom">Custom</option>
              <option value="none">-- Dismiss --</option>
            </select>
          </div>
        </div>

        {/* HP & AC Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center' }}>
          {/* Health Bar Widget */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.02)', border: '0.5px solid rgba(200,169,110,0.15)', padding: '4px', borderRadius: '2px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'radial-gradient(circle, #f4e8c1 0%, #c8a96e 70%, #9a7a2e 100%)', border: '1.2px solid var(--red)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", color: 'var(--red)', fontSize: '9px', fontWeight: 'bold' }}>
              <span style={{ fontSize: '5px', color: 'var(--inkl)', lineHeight: 1, marginTop: '1px' }}>HP</span>
              <span style={{ lineHeight: 1.1, fontSize: '10px' }}>{curHP}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', fontWeight: 'bold', color: 'var(--inkm)' }}>
                <span>Companion HP</span>
                <span>{pct}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(0,0,0,0.15)', borderRadius: '1.5px', overflow: 'hidden', border: '0.5px solid var(--pb)' }}>
                <div className={`hp-bar-fill ${fc}`} style={{ width: `${pct}%`, height: '100%', transition: 'width 0.2s' }}></div>
              </div>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center', marginTop: '1px' }}>
                <button onClick={() => handleHpAdjust(-1)} className="btn companion-hp-adjust-btn" style={{ fontSize: '7px', padding: '0 4px', lineHeight: 1, height: '12px', fontWeight: 'bold' }}>-</button>
                <input 
                  type="number" 
                  className="companion-hp-cur-field" 
                  value={curHP} 
                  onChange={handleHpCurChange}
                  style={{ width: '18px', fontSize: '7.5px', textAlign: 'center', height: '12px', padding: '0', borderRadius: '1px', border: '0.5px solid var(--pb)' }} 
                  title="Change current HP directly" 
                />
                <span style={{ fontSize: '7.5px' }}>/</span>
                <input 
                  type="number" 
                  className="companion-hp-max-field" 
                  value={maxHP} 
                  onChange={handleHpMaxChange}
                  style={{ width: '18px', fontSize: '7.5px', textAlign: 'center', height: '12px', padding: '0', borderRadius: '1px', border: '0.5px solid var(--pb)' }} 
                  title="Change max HP directly" 
                />
                <button onClick={() => handleHpAdjust(1)} className="btn companion-hp-adjust-btn" style={{ fontSize: '7px', padding: '0 4px', lineHeight: 1, height: '12px', fontWeight: 'bold' }}>+</button>
              </div>
            </div>
          </div>

          {/* AC & Stat Blocks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(200, 169, 110, 0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '6.8px', fontWeight: 'bold', color: 'var(--inkl)' }}>🛡️ ARMOR CLASS</span>
              <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '14px', fontWeight: 'bold', color: 'var(--red)', lineHeight: 1 }}>{displayAC}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(200, 169, 110, 0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '6.8px', fontWeight: 'bold', color: 'var(--inkl)' }}>🏃 SPEED</span>
              <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '13px', fontWeight: 'bold', color: 'var(--red)', lineHeight: 1 }}>30 ft.</span>
            </div>
          </div>
        </div>

        {/* Attributes Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2.5px', background: 'rgba(0,0,0,0.02)', padding: '4px 3px', borderRadius: '2px', border: '0.5px dashed rgba(200, 169, 110, 0.25)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '6px', fontWeight: 'bold', color: 'var(--inkl)' }}>STR</span>
            <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--red)' }}>{str}</span>
            <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>{formatMod(getAblMod(str))}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '6px', fontWeight: 'bold', color: 'var(--inkl)' }}>DEX</span>
            <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--red)' }}>{dex}</span>
            <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>{formatMod(getAblMod(dex))}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '6px', fontWeight: 'bold', color: 'var(--inkl)' }}>CON</span>
            <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--red)' }}>{con}</span>
            <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>{formatMod(getAblMod(con))}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '6px', fontWeight: 'bold', color: 'var(--inkl)' }}>INT</span>
            <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--red)' }}>2</span>
            <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>-4</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '6px', fontWeight: 'bold', color: 'var(--inkl)' }}>WIS</span>
            <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--red)' }}>{wis}</span>
            <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>{formatMod(getAblMod(wis))}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '6px', fontWeight: 'bold', color: 'var(--inkl)' }}>CHA</span>
            <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--red)' }}>{cha}</span>
            <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>{formatMod(getAblMod(cha))}</span>
          </div>
        </div>

        {/* Attacks & Actions Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5px', marginTop: '2px' }}>
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '7.5px', color: 'var(--red)', borderBottom: '0.5px solid var(--pb)', paddingBottom: '1px', fontWeight: 'bold' }}>
            ⚔️ Companion Attacks
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5px' }}>
            {baseStats && Array.isArray(baseStats.attacks) && baseStats.attacks.length > 0 ? (
              baseStats.attacks.map((att: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.3)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px 6px', fontSize: '8px' }}>
                  <div>
                    <strong>{att.name}:</strong>{' '}
                    <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>{formatMod(att.bonus)}</span> ({att.damage})
                    {att.note && (
                      <>
                        <br />
                        <span style={{ fontSize: '6.8px', color: 'var(--inkl)', fontStyle: 'italic' }}>• {att.note}</span>
                      </>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleAttackRoll(e, att.name, att.bonus, att.damage, att.note || '')} 
                    className="btn roll-companion-attack-btn" 
                    style={{ fontSize: '7.5px', padding: '2px 6px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '2px' }}
                  >
                    Roll 🎲
                  </button>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '7px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center' }}>
                No attacks available
              </div>
            )}
          </div>
        </div>

        {/* Rules Summary Footer */}
        {baseStats && baseStats.specials && (
          <div style={{ background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4.5px', fontSize: '6.8px', color: 'var(--ink)', lineHeight: 1.25 }}>
            🐾 <strong>Special Qualities:</strong> {baseStats.specials}<br />
            <span style={{ fontSize: '6px', color: 'var(--inkl)', fontStyle: 'italic' }}>(Based on D&amp;D 3.5e RAW rules for animal companions).</span>
          </div>
        )}
      </div>
    </div>
  );
};
