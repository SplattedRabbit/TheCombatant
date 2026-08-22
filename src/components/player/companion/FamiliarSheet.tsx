/**
 * @module    FamiliarSheet
 * @summary   Familiar sheet as a React component. Shows attributes, hit points, armor class, saving throws, and attacks of the familiar.
 * @exports   FamiliarSheet
 * @reads     pc.familiarType, pc.familiarName, pc.familiarHP, pc.maxHP, pc.baseZa, pc.baseRef, pc.baseWil, pc.bab
 * @stateOps  CombatState.updatePCBatch, CombatState.saveToStorage, CombatState.syncPCToHost
 * @depends   React, FamiliarRules, CombatState, dialogs
 */

import React from 'react';
// @ts-ignore
import { FamiliarRules } from '@core/rules/FamiliarRules.js';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { showRollBreakdown, showCustomConfirm } from '@core/ui/components/dialogs.js';
import { getAblMod, formatMod } from '../attributeHelper';

interface FamiliarSheetProps {
  pc: any;
  onUpdate: () => void;
}

export const FamiliarSheet: React.FC<FamiliarSheetProps> = ({ pc, onUpdate }) => {
  const type = pc.familiarType || 'none';
  const name = pc.familiarName || '';

  const effectiveFamiliarLvl = FamiliarRules.calculateEffectiveFamiliarLevel(pc);
  const maxHP = Math.floor(pc.maxHP / 2);
  const curHP = pc.familiarHP !== undefined ? Math.min(maxHP, pc.familiarHP) : maxHP;

  const baseStats = FamiliarRules.getFamiliarBaseStats(type);

  const handleSpeciesChange = (newType: string) => {
    const oldType = pc.familiarType || 'none';
    if (oldType === newType) return;

    const applySpeciesChange = () => {
      CombatState.updatePCBatch((freshPC: any) => {
        // Old Toad HP bonus removal
        if (oldType === 'toad') {
          freshPC.maxHP = Math.max(1, freshPC.maxHP - 3);
          freshPC.hp = Math.max(0, freshPC.hp - 3);
        }
        // New Toad HP bonus application
        if (newType === 'toad') {
          freshPC.maxHP += 3;
          freshPC.hp += 3;
        }

        freshPC.familiarType = newType;

        if (newType !== 'none') {
          const base = FamiliarRules.getFamiliarBaseStats(newType);
          if (base) {
            freshPC.familiarName = base.name;
            // Recalculate max HP based on updated/current max HP
            const calculatedMaxHP = Math.floor(freshPC.maxHP / 2);
            freshPC.familiarHP = calculatedMaxHP;
          }
        } else {
          freshPC.familiarName = '';
          freshPC.familiarHP = 0;
        }
      });
      onUpdate();
    };

    if (oldType !== 'none' && newType === 'none') {
      showCustomConfirm(
        "Dismiss Familiar?",
        `Do you want to dismiss your familiar? According to RAW, this requires a saving throw to avoid experience point loss!`,
        () => {
          applySpeciesChange();
        }
      );
    } else {
      applySpeciesChange();
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activePC = CombatState.getActivePC();
    activePC.familiarName = e.target.value;
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
    onUpdate();
  };

  const handleHpCurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activePC = CombatState.getActivePC();
    const val = parseInt(e.target.value) || 0;
    const computedMax = Math.floor(activePC.maxHP / 2);
    activePC.familiarHP = Math.max(0, Math.min(computedMax, val));
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
    onUpdate();
  };

  const handleHpAdjust = (dir: number) => {
    const activePC = CombatState.getActivePC();
    const computedMax = Math.floor(activePC.maxHP / 2);
    activePC.familiarHP = Math.max(0, Math.min(computedMax, (activePC.familiarHP || 0) + dir));
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
    onUpdate();
  };

  const handleAttackRoll = (e: React.MouseEvent<HTMLButtonElement>, attName: string, bonus: number, _damage: string, _note: string) => {
    e.stopPropagation();
    const activePC = CombatState.getActivePC();
    const famName = activePC.familiarName || 'Familiar';

    showRollBreakdown(`${famName} - ${attName}`, `1W20`, [
      { label: "Attack Bonus (Dexterity/Size)", value: bonus }
    ], e.nativeEvent);
  };


  if (type === 'none') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', borderBottom: '1px solid var(--pb)', paddingBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', letterSpacing: '0.5px' }}>
          <span>🦇 Familiar Sheet (Effective Wizard/Sorcerer Level: {effectiveFamiliarLvl})</span>
          <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'normal', fontStyle: 'italic' }}>D&amp;D 3.5e Rules</span>
        </div>
        <div style={{ fontSize: '8.5px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '45px 15px', background: 'rgba(0,0,0,0.02)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
          🦇 You currently have no active familiar selected.<br />
          <span style={{ fontSize: '7.5px', marginTop: '3px', display: 'block' }}>Select a creature type below to summon your familiar!</span>
          
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
            <select 
              value={type}
              onChange={(e) => handleSpeciesChange(e.target.value)}
              className="cinput familiar-species-select" 
              style={{ fontSize: '8px', height: '16px', padding: '0 4px', width: '120px' }}
            >
              <option value="none">-- Select --</option>
              <option value="bat">🦇 Bat (+3 Listen)</option>
              <option value="cat">🐈 Cat (+3 Move Silently)</option>
              <option value="hawk">🦅 Hawk (+3 Spot in bright light)</option>
              <option value="lizard">🦎 Lizard (+3 Climb)</option>
              <option value="owl">🦉 Owl (+3 Spot in shadows)</option>
              <option value="rat">🐀 Rat (+2 Fortitude Save)</option>
              <option value="raven">🐦 Raven (+3 Appraise / speaks language)</option>
              <option value="snake">🐍 Snake (+3 Bluff)</option>
              <option value="toad">🐸 Toad (+3 Hit Points)</option>
              <option value="weasel">🦦 Weasel (+2 Reflex Save)</option>
            </select>
          </div>
        </div>
      </div>
    );
  }



  const str = baseStats ? baseStats.str : 10;
  const dex = baseStats ? baseStats.dex : 10;
  const con = baseStats ? baseStats.con : 10;
  const wis = baseStats ? baseStats.wis : 10;
  const cha = baseStats ? baseStats.cha : 10;

  const natArmor = 1 + Math.floor((effectiveFamiliarLvl - 1) / 2);
  const displayAC = (baseStats ? baseStats.ac : 10) + natArmor;
  const displayInt = Math.min(15, 5 + Math.ceil(effectiveFamiliarLvl / 2));

  const pct = maxHP > 0 ? Math.max(0, Math.min(100, Math.floor((curHP / maxHP) * 100))) : 0;
  const fc = curHP <= 0 ? 'fill-dead' : (pct > 50 ? 'fill-ok' : (pct > 25 ? 'fill-warn' : 'fill-crit'));

  const masterFort = pc.baseZa ? pc.baseZa.base : 0;
  const masterRef = pc.baseRef ? pc.baseRef.base : 0;
  const masterWil = pc.baseWil ? pc.baseWil.base : 0;

  const famFort = Math.max(masterFort, 2) + getAblMod(con);
  const famRef = Math.max(masterRef, 2) + getAblMod(dex);
  const famWil = Math.max(masterWil, 0) + getAblMod(wis);

  const masterBab = pc.bab ? pc.bab.base : 0;
  const attacks = FamiliarRules.getFamiliarAttacks(type, masterBab, str, dex);

  let specialsList = ['Alertness', 'Improved Evasion', 'Share Spells', 'Empathic Link'];
  if (effectiveFamiliarLvl >= 3) specialsList.push('Deliver touch spells');
  if (effectiveFamiliarLvl >= 5) specialsList.push('Speak with master');
  if (effectiveFamiliarLvl >= 7) specialsList.push('Speak with animals of its kind');
  if (effectiveFamiliarLvl >= 11) specialsList.push(`Spell Resistance (SR ${effectiveFamiliarLvl + 5})`);
  if (effectiveFamiliarLvl >= 13) specialsList.push('Scry on familiar');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', borderBottom: '1px solid var(--pb)', paddingBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', letterSpacing: '0.5px' }}>
        <span>🦇 Familiar Sheet (Effective Wizard/Sorcerer Level: {effectiveFamiliarLvl})</span>
        <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'normal', fontStyle: 'italic' }}>D&amp;D 3.5e Rules</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(200, 169, 110, 0.04)', border: '0.5px solid var(--pb)', borderRadius: '3px', padding: '6px' }}>
        {/* Familiar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--pb)', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px' }}>🦇</span>
            <input 
              type="text" 
              className="familiar-name-field" 
              value={name} 
              onChange={handleNameChange}
              placeholder="Familiar Name" 
              style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', background: 'transparent', border: 'none', borderBottom: '0.5px dashed var(--pb)', outline: 'none', width: '120px' }} 
              title="Familiar Name" 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>Type:</span>
            <select 
              value={type}
              onChange={(e) => handleSpeciesChange(e.target.value)}
              className="cinput familiar-species-select" 
              style={{ fontSize: '7.5px', height: '14px', padding: '0', width: '75px', margin: '0' }}
            >
              <option value="bat">Bat</option>
              <option value="cat">Cat</option>
              <option value="hawk">Hawk</option>
              <option value="lizard">Lizard</option>
              <option value="owl">Owl</option>
              <option value="rat">Rat</option>
              <option value="raven">Raven</option>
              <option value="snake">Snake</option>
              <option value="toad">Toad</option>
              <option value="weasel">Weasel</option>
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
                <span>Familiar HP</span>
                <span>{pct}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(0,0,0,0.15)', borderRadius: '1.5px', overflow: 'hidden', border: '0.5px solid var(--pb)' }}>
                <div className={`hp-bar-fill ${fc}`} style={{ width: `${pct}%`, height: '100%', transition: 'width 0.2s' }}></div>
              </div>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center', marginTop: '1px' }}>
                <button onClick={() => handleHpAdjust(-1)} className="btn familiar-hp-adjust-btn" style={{ fontSize: '7px', padding: '0 4px', lineHeight: 1, height: '12px', fontWeight: 'bold' }}>-</button>
                <input 
                  type="number" 
                  className="familiar-hp-cur-field" 
                  value={curHP} 
                  onChange={handleHpCurChange}
                  style={{ width: '18px', fontSize: '7.5px', textAlign: 'center', height: '12px', padding: '0', borderRadius: '1px', border: '0.5px solid var(--pb)' }} 
                  title="Change current HP directly" 
                />
                <span style={{ fontSize: '7.5px' }}>/ {maxHP}</span>
                <button onClick={() => handleHpAdjust(1)} className="btn familiar-hp-adjust-btn" style={{ fontSize: '7px', padding: '0 4px', lineHeight: 1, height: '12px', fontWeight: 'bold' }}>+</button>
              </div>
            </div>
          </div>

          {/* AC & Saving Throws */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(200, 169, 110, 0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '6.8px', fontWeight: 'bold', color: 'var(--inkl)' }}>🛡️ ARMOR CLASS</span>
              <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '14px', fontWeight: 'bold', color: 'var(--red)', lineHeight: 1 }}>{displayAC}</span>
              <span style={{ fontSize: '5px', color: 'var(--inkl)', fontStyle: 'italic' }}>(+{natArmor} Nat.)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(200, 169, 110, 0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px', alignItems: 'center', justifyContent: 'center', gap: '1px' }}>
              <span style={{ fontSize: '5.5px', fontWeight: 'bold', color: 'var(--inkl)', lineHeight: 1 }}>SAVING THROWS</span>
              <div style={{ fontSize: '7px', fontWeight: 'bold', color: 'var(--red)', lineHeight: 1 }}>
                FORT: {formatMod(famFort)}<br />
                REF: {formatMod(famRef)}<br />
                WILL: {formatMod(famWil)}
              </div>
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
            <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--red)' }}>{displayInt}</span>
            <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>{formatMod(getAblMod(displayInt))}</span>
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
        {attacks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5px', marginTop: '2px' }}>
            <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '7.5px', color: 'var(--red)', borderBottom: '0.5px solid var(--pb)', paddingBottom: '1px', fontWeight: 'bold' }}>
              ⚔️ Familiar Attacks
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5px' }}>
              {attacks.map((att: any, idx: number) => (
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
                    className="btn roll-familiar-attack-btn" 
                    style={{ fontSize: '7.5px', padding: '2px 6px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '2px' }}
                  >
                    Roll 🎲
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules Summary Footer */}
        {baseStats && (
          <div style={{ background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4.5px', fontSize: '6.8px', color: 'var(--ink)', lineHeight: 1.25 }}>
            🔮 <strong>Granted Master Bonus:</strong> <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>{baseStats.bonus}</span><br />
            🐾 <strong>Special Qualities:</strong> {specialsList.join(', ')}<br />
            <span style={{ fontSize: '6px', color: 'var(--inkl)', fontStyle: 'italic' }}>(Based on D&amp;D 3.5e RAW rules for familiars).</span>
          </div>
        )}
      </div>
    </div>
  );
};
