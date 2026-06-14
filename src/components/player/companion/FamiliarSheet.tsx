/**
 * @module    FamiliarSheet
 * @summary   Vertrauten-Sheet als React-Komponente. Zeigt Attribute, Trefferpunkte, Rüstungsklasse, Rettungswürfe und Angriffe des Vertrauten.
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
        "Vertrauten entlassen?",
        `Möchtest du deinen Vertrauten entlassen? Dies verlangt laut RAW einen Rettungswurf wegen Erfahrungspunktverlust!`,
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

  const handleAttackRoll = (e: React.MouseEvent<HTMLButtonElement>, attName: string, bonus: number, damage: string, note: string) => {
    e.stopPropagation();
    const activePC = CombatState.getActivePC();
    const famName = activePC.familiarName || 'Vertrauter';

    showRollBreakdown(`${famName} - ${attName}`, `1W20`, [
      { label: "Angriffsbonus", value: bonus }
    ], e.nativeEvent, (rollVal: number) => {
      showCustomConfirm("Angriff ausgeführt! ⚔️", `
        <div style="font-family:'Crimson Text', serif; font-size:10px; text-align:left; color:var(--ink); line-height:1.35;">
          <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:'IM Fell English SC', serif; color: var(--red); font-size: 11px;">
            ${famName} greift an!
          </div>
          • <strong>Angriffs-Typ:</strong> ${attName}<br>
          • <strong>Angriffswurf:</strong> <span style="color:var(--red); font-weight:bold; font-size:10.5px;">${rollVal + bonus}</span> <span style="font-size:7px; color:var(--inkl); font-style:italic;">(Gewürfelt: ${rollVal} + ${bonus})</span><br>
          • <strong>Waffenschaden:</strong> <span style="color:var(--red); font-weight:bold; font-size:10.5px;">${damage}</span><br>
          ${note ? `• <strong>Zusatz-Effekt:</strong> ${note}<br>` : ''}
          <br>
          <div style="font-size: 7.2px; font-style: italic; background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); padding: 4px; border-radius: 2px; line-height: 1.2;">
            Tabelle prüft: Trifft Angriffswurf <span style="color:var(--red);">${rollVal + bonus}</span> gegen Rüstungsklasse (AC) des Gegners? Falls ja, würfle physischen Schaden von <span style="color:var(--red);">${damage}</span> aus!
          </div>
        </div>
      `, () => {});
    });
  };

  if (type === 'none') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', borderBottom: '1px solid var(--pb)', paddingBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', letterSpacing: '0.5px' }}>
          <span>🦇 Vertrauten-Bogen (Effektive Magier/Hexenmeister-Stufe: {effectiveFamiliarLvl})</span>
          <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'normal', fontStyle: 'italic' }}>D&amp;D 3.5e Rules</span>
        </div>
        <div style={{ fontSize: '8.5px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '45px 15px', background: 'rgba(0,0,0,0.02)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
          🦇 Du hast aktuell keinen aktiven Vertrauten ausgewählt.<br />
          <span style={{ fontSize: '7.5px', marginTop: '3px', display: 'block' }}>Wähle unten eine Kreaturenart aus, um deinen Vertrauten zu rufen!</span>
          
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
            <select 
              value={type}
              onChange={(e) => handleSpeciesChange(e.target.value)}
              className="cinput familiar-species-select" 
              style={{ fontSize: '8px', height: '16px', padding: '0 4px', width: '120px' }}
            >
              <option value="none">-- Auswählen --</option>
              <option value="bat">🦇 Fledermaus (+3 Lauschen)</option>
              <option value="cat">🐈 Katze (+3 Leise bewegen)</option>
              <option value="hawk">🦅 Falke (+3 Entdecken in hellem Licht)</option>
              <option value="lizard">🦎 Eidechse (+3 Klettern)</option>
              <option value="owl">🦉 Eule (+3 Entdecken in Schatten)</option>
              <option value="rat">🐀 Ratte (+2 Zähigkeits-Rettungswurf)</option>
              <option value="raven">🐦 Rabe (+3 Schätzen / spricht Sprache)</option>
              <option value="snake">🐍 Schlange (+3 Bluffen)</option>
              <option value="toad">🐸 Kröte (+3 Trefferpunkte)</option>
              <option value="weasel">🦦 Wiesel (+2 Reflex-Rettungswurf)</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  const getAblMod = (score: any) => {
    const s = parseInt(score) || 10;
    return s >= 10 ? Math.floor((s - 10) / 2) : (s === 9 || s === 8 ? -1 : (s === 7 || s === 6 ? -2 : (s === 5 || s === 4 ? -4 : -5)));
  };

  const formatMod = (mod: number) => {
    return (mod >= 0 ? '+' : '') + mod;
  };

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

  let specialsList = ['Wachsamkeit (Alertness)', 'Verbessertes Entrinnen (Improved Evasion)', 'Zauber teilen (Share Spells)', 'Empathische Verbindung (Empathic Link)'];
  if (effectiveFamiliarLvl >= 3) specialsList.push('Kontaktzauber übertragen (Deliver touch spells)');
  if (effectiveFamiliarLvl >= 5) specialsList.push('Mit Meister sprechen (Speak with master)');
  if (effectiveFamiliarLvl >= 7) specialsList.push('Mit Tieren seiner Art sprechen (Speak with animals)');
  if (effectiveFamiliarLvl >= 11) specialsList.push(`Zauberresistenz (SR ${effectiveFamiliarLvl + 5})`);
  if (effectiveFamiliarLvl >= 13) specialsList.push('Hellsehen (Scry on familiar)');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', borderBottom: '1px solid var(--pb)', paddingBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', letterSpacing: '0.5px' }}>
        <span>🦇 Vertrauten-Bogen (Effektive Magier/Hexenmeister-Stufe: {effectiveFamiliarLvl})</span>
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
              placeholder="Name deines Vertrauten" 
              style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', background: 'transparent', border: 'none', borderBottom: '0.5px dashed var(--pb)', outline: 'none', width: '120px' }} 
              title="Vertrauens-Name" 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>Art:</span>
            <select 
              value={type}
              onChange={(e) => handleSpeciesChange(e.target.value)}
              className="cinput familiar-species-select" 
              style={{ fontSize: '7.5px', height: '14px', padding: '0', width: '75px', margin: '0' }}
            >
              <option value="bat">Fledermaus</option>
              <option value="cat">Katze</option>
              <option value="hawk">Falke</option>
              <option value="lizard">Eidechse</option>
              <option value="owl">Eule</option>
              <option value="rat">Ratte</option>
              <option value="raven">Rabe</option>
              <option value="snake">Schlange</option>
              <option value="toad">Kröte</option>
              <option value="weasel">Wiesel</option>
              <option value="none">-- Entlassen --</option>
            </select>
          </div>
        </div>

        {/* HP & AC Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center' }}>
          {/* Health Bar Widget */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.02)', border: '0.5px solid rgba(200,169,110,0.15)', padding: '4px', borderRadius: '2px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'radial-gradient(circle, #f4e8c1 0%, #c8a96e 70%, #9a7a2e 100%)', border: '1.2px solid var(--red)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", color: 'var(--red)', fontSize: '9px', fontWeight: 'bold' }}>
              <span style={{ fontSize: '5px', color: 'var(--inkl)', lineHeight: 1, marginTop: '1px' }}>TP</span>
              <span style={{ lineHeight: 1.1, fontSize: '10px' }}>{curHP}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px', fontWeight: 'bold', color: 'var(--inkm)' }}>
                <span>Vertrauten-TP</span>
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
                  title="Aktuelle TP direkt ändern" 
                />
                <span style={{ fontSize: '7.5px' }}>/ {maxHP}</span>
                <button onClick={() => handleHpAdjust(1)} className="btn familiar-hp-adjust-btn" style={{ fontSize: '7px', padding: '0 4px', lineHeight: 1, height: '12px', fontWeight: 'bold' }}>+</button>
              </div>
            </div>
          </div>

          {/* AC & Saving Throws */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(200, 169, 110, 0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '6.8px', fontWeight: 'bold', color: 'var(--inkl)' }}>🛡️ RÜSTUNGSKL.</span>
              <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '14px', fontWeight: 'bold', color: 'var(--red)', lineHeight: 1 }}>{displayAC}</span>
              <span style={{ fontSize: '5px', color: 'var(--inkl)', fontStyle: 'italic' }}>(+{natArmor} Nat.)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(200, 169, 110, 0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px', alignItems: 'center', justifyContent: 'center', gap: '1px' }}>
              <span style={{ fontSize: '5.5px', fontWeight: 'bold', color: 'var(--inkl)', lineHeight: 1 }}>RETTUNGSWÜRFE</span>
              <div style={{ fontSize: '7px', fontWeight: 'bold', color: 'var(--red)', lineHeight: 1 }}>
                ZÄ: {formatMod(famFort)}<br />
                RE: {formatMod(famRef)}<br />
                WI: {formatMod(famWil)}
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
              ⚔️ Angriffe des Vertrauten
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
                    Würfeln 🎲
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules Summary Footer */}
        {baseStats && (
          <div style={{ background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4.5px', fontSize: '6.8px', color: 'var(--ink)', lineHeight: 1.25 }}>
            🔮 <strong>Gewährter Meister-Bonus:</strong> <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>{baseStats.bonus}</span><br />
            🐾 <strong>Spezielle Eigenschaften:</strong> {specialsList.join(', ')}<br />
            <span style={{ fontSize: '6px', color: 'var(--inkl)', fontStyle: 'italic' }}>(Basiert auf den RAW-Regeln von D&amp;D 3.5e für Vertraute).</span>
          </div>
        )}
      </div>
    </div>
  );
};
