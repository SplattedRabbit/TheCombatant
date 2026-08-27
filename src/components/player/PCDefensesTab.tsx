/**
 * @module    PCDefensesTab
 * @summary   Renders saving throws, AC, initiative, and physical resistances UI elements and manages their event bindings.
 * @exports   PCDefensesTab
 * @reads     pc.ac, pc.acTouch, pc.acFlat, pc.acNatural, pc.acDeflection, pc.acMisc, pc.sr, pc.bw, pc.feats, pc.iniMisc, pc.init, pc.con, pc.dex, pc.wis, pc.baseZa, pc.baseRef, pc.baseWil, pc.za, pc.ref, pc.wil, pc.zaMisc, pc.refMisc, pc.wilMisc
 * @stateOps  setPCAutoAC, updatePCNumber, updatePCField, showRollBreakdown
 * @depends   React, @core/state.js, @core/ui/components/dialogs.js
 */

import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { showRollBreakdown } from '@core/ui/components/dialogs.js';
import { getStatMod, formatMod, extractStatValue, calculateInitiativeTotal } from './attributeHelper';


interface PCDefensesTabProps {
  pc: any;
}

export const PCDefensesTab: React.FC<PCDefensesTabProps> = ({ pc }) => {
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const dexMod = getStatMod(pc.dex);
  const conMod = getStatMod(pc.con);
  const wisMod = getStatMod(pc.wis);

  const hasImprovedInit = Array.isArray(pc.feats) && pc.feats.some((f: any) => f.id === 'improved_initiative');
  const totFort = extractStatValue(pc.za, 0);
  const totRef = extractStatValue(pc.ref, 0);
  const totWil = extractStatValue(pc.wil, 0);
  const totIni = dexMod + (parseInt(pc.iniMisc) || 0) + (hasImprovedInit ? 4 : 0);

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;

  // Numeric primitive extractions from Stat objects
  const acVal = extractStatValue(pc.ac, 10);
  const acTouchVal = extractStatValue(pc.acTouch, 10);
  const acFlatVal = extractStatValue(pc.acFlat, 10);
  const baseZaVal = extractStatValue(pc.baseZa, 0);
  const baseRefVal = extractStatValue(pc.baseRef, 0);
  const baseWilVal = extractStatValue(pc.baseWil, 0);

  const handleInputChange = (key: string, val: string) => {
    setLocalValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleCommitNumber = (key: string, val: string, fallback: number = 0) => {
    setLocalValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    const trimmed = (val ?? '').trim();
    if (trimmed === '') {
      CombatState.updatePCNumber(key, fallback);
      return;
    }

    const num = parseInt(trimmed, 10);
    CombatState.updatePCNumber(key, isNaN(num) ? fallback : num);
  };

  const handleCommitRawInit = (val: string) => {
    setLocalValues((prev) => {
      const next = { ...prev };
      delete next['rawInit'];
      return next;
    });

    const trimmed = (val ?? '').trim();
    if (trimmed === '') {
      CombatState.updatePCNumber('rawInit', 0);
      return;
    }

    const num = parseInt(trimmed, 10);
    CombatState.updatePCNumber('rawInit', isNaN(num) ? 0 : num);
  };

  const getSaveMiscBreakdown = (type: 'za' | 'ref' | 'wil', attrMod: number) => {
    const baseVal = type === 'za' ? baseZaVal : type === 'ref' ? baseRefVal : baseWilVal;
    const saveStat = type === 'za' ? pc.za : type === 'ref' ? pc.ref : pc.wil;
    const miscVal = type === 'za' ? (pc.zaMisc ?? 0) : type === 'ref' ? (pc.refMisc ?? 0) : (pc.wilMisc ?? 0);

    const total = saveStat?.getValue?.() ?? saveStat?.total ?? 0;
    const otherMods = total - baseVal - attrMod;

    const attrName = type === 'za' ? 'Constitution Modifier' : type === 'ref' ? 'Dexterity Modifier' : 'Wisdom Modifier';
    const miscName = 'Other (Equipment/Special)';

    const modifiers = Array.isArray(saveStat?.modifiers) ? saveStat.modifiers : [];
    const extras = modifiers.filter((m: any) => m.source !== attrName && m.source !== miscName && m.value !== 0);

    let tooltip = `Other modifier (Value: ${miscVal})`;
    if (extras.length > 0) {
      tooltip += `\nActive Effects:\n` + extras.map((m: any) => `• ${m.source}: ${formatMod(m.value)}`).join('\n');
    }

    return {
      displayValue: otherMods,
      tooltip,
      hasExtras: extras.some((m: any) => !m.isRace)
    };
  };

  const getAcTooltip = (stat: any, name: string) => {
    const items = ['Base value: 10'];
    const modifiers = Array.isArray(stat?.modifiers) ? stat.modifiers : [];
    modifiers.forEach((m: any) => {
      if (m.value !== 0) items.push(`• ${m.source || 'Modifier'}: ${formatMod(m.value)}`);
    });
    return `${name} Breakdown:\n` + items.join('\n');
  };

  const zaMiscData = getSaveMiscBreakdown('za', conMod);
  const refMiscData = getSaveMiscBreakdown('ref', dexMod);
  const wisMiscData = getSaveMiscBreakdown('wil', wisMod);

  const acTooltip = getAcTooltip(pc.ac, 'Armor Class (AC)');
  const acTouchTooltip = getAcTooltip(pc.acTouch, 'Touch AC');
  const acFlatTooltip = getAcTooltip(pc.acFlat, 'Flat-Footed AC');

  const handleAutoACChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    CombatState.setPCAutoAC(e.target.checked);
  };

  const handleAcClick = (type: 'ac' | 'acTouch' | 'acFlat', name: string, e: React.MouseEvent) => {
    if (!pc.autoAC) return;
    const stat = pc[type];
    const items = [{ label: 'Base value', value: 10 }];
    const modifiers = Array.isArray(stat?.modifiers) ? stat.modifiers : [];
    modifiers.forEach((m: any) => {
      if (m.value !== 0) items.push({ label: m.source || 'Modifier', value: m.value });
    });
    showRollBreakdown(`${name} - Breakdown`, 'Base 10', items, e.nativeEvent);
  };

  const handleSaveRoll = (type: 'za' | 'ref' | 'wil', label: string, e: React.MouseEvent) => {
    const baseStat = type === 'za' ? pc.baseZa : type === 'ref' ? pc.baseRef : pc.baseWil;
    const saveStat = type === 'za' ? pc.za : type === 'ref' ? pc.ref : pc.wil;

    const baseVal = baseStat?.getValue?.() ?? baseStat?.base ?? 0;
    const items = [{ label: 'Class Base', value: baseVal }];

    const modifiers = Array.isArray(saveStat?.modifiers) ? saveStat.modifiers : [];
    modifiers.forEach((m: any) => {
      items.push({ label: m.source || 'Modifier', value: m.value });
    });

    showRollBreakdown(`Saving Throw: ${label}`, '1d20', items, e.nativeEvent);
  };

  const handleIniRoll = (e: React.MouseEvent) => {
    const items = [
      { label: 'DEX Mod', value: dexMod },
      { label: 'Misc Mod', value: parseInt(pc.iniMisc) || 0 }
    ];
    if (hasImprovedInit) {
      items.push({ label: 'Feat: Improved Initiative', value: 4 });
    }
    showRollBreakdown('Initiative Breakdown', '1d20', items, e.nativeEvent);
  };

  const calculateNewMisc = (type: 'za' | 'ref' | 'wil', attrMod: number, typedVal: number) => {
    const baseVal = type === 'za' ? baseZaVal : type === 'ref' ? baseRefVal : baseWilVal;
    const saveStat = type === 'za' ? pc.za : type === 'ref' ? pc.ref : pc.wil;
    const miscVal = type === 'za' ? (pc.zaMisc ?? 0) : type === 'ref' ? (pc.refMisc ?? 0) : (pc.wilMisc ?? 0);

    const total = saveStat?.getValue?.() ?? saveStat?.total ?? 0;
    const otherMods = total - baseVal - attrMod;
    const extraMods = otherMods - miscVal;

    return typedVal - extraMods;
  };

  const handleCommitSaveMisc = (type: 'za' | 'ref' | 'wil', attrMod: number, val: string) => {
    setLocalValues((prev) => {
      const next = { ...prev };
      delete next[`${type}Misc`];
      return next;
    });

    const trimmed = (val ?? '').trim();
    const typed = trimmed === '' ? 0 : (parseInt(trimmed, 10) || 0);
    const newMisc = calculateNewMisc(type, attrMod, typed);
    CombatState.updatePCNumber(`${type}Misc`, newMisc);
  };

  const getEquippedArmor = () => {
    if (Array.isArray(pc.armors)) {
      return pc.armors.find((a: any) => a.isEquipped);
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(200, 169, 110, 0.05)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px 6px', marginBottom: '2px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--inkm)', margin: 0, fontWeight: 'bold', fontSize: '11px', fontFamily: 'var(--font-title)' }}>
          <input
            type="checkbox"
            className="pc-autoac-checkbox"
            checked={!!pc.autoAC}
            onChange={handleAutoACChange}
            style={{ margin: 0, width: '13px', height: '13px' }}
          />
          🛡️ Calculate Armor Class automatically (Auto AC)
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
        <div>
          <label style={{ fontSize: '9px', fontWeight: 600, color: 'var(--inkl)' }}>AC</label>
          <input
            type="number"
            value={localValues['ac'] !== undefined ? localValues['ac'] : acVal}
            className="cinput pc-ac-input"
            readOnly={!!pc.autoAC}
            onClick={(e) => handleAcClick('ac', 'Armor Class (AC)', e)}
            onChange={(e) => !pc.autoAC && handleInputChange('ac', e.target.value)}
            onBlur={(e) => !pc.autoAC && handleCommitNumber('ac', e.target.value, 10)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            style={pc.autoAC ? { background: 'rgba(0,0,0,0.05)', color: 'var(--ink)', fontWeight: 'bold', cursor: 'pointer' } : undefined}
            title={pc.autoAC ? acTooltip : undefined}
          />
        </div>
        <div>
          <label style={{ fontSize: '9px', fontWeight: 600, color: 'var(--inkl)' }}>Touch</label>
          <input
            type="number"
            value={localValues['acTouch'] !== undefined ? localValues['acTouch'] : acTouchVal}
            className="cinput pc-acTouch-input"
            readOnly={!!pc.autoAC}
            onClick={(e) => handleAcClick('acTouch', 'Touch AC', e)}
            onChange={(e) => !pc.autoAC && handleInputChange('acTouch', e.target.value)}
            onBlur={(e) => !pc.autoAC && handleCommitNumber('acTouch', e.target.value, 10)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            style={pc.autoAC ? { background: 'rgba(0,0,0,0.05)', color: 'var(--ink)', fontWeight: 'bold', cursor: 'pointer' } : undefined}
            title={pc.autoAC ? acTouchTooltip : undefined}
          />
        </div>
        <div>
          <label style={{ fontSize: '9px', fontWeight: 600, color: 'var(--inkl)' }}>Flat-Footed</label>
          <input
            type="number"
            value={localValues['acFlat'] !== undefined ? localValues['acFlat'] : acFlatVal}
            className="cinput pc-acFlat-input"
            readOnly={!!pc.autoAC}
            onClick={(e) => handleAcClick('acFlat', 'Flat-Footed AC', e)}
            onChange={(e) => !pc.autoAC && handleInputChange('acFlat', e.target.value)}
            onBlur={(e) => !pc.autoAC && handleCommitNumber('acFlat', e.target.value, 10)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            style={pc.autoAC ? { background: 'rgba(0,0,0,0.05)', color: 'var(--ink)', fontWeight: 'bold', cursor: 'pointer' } : undefined}
            title={pc.autoAC ? acFlatTooltip : undefined}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', marginTop: '-2px', marginBottom: '2px' }}>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }} title="Natural armor bonus (e.g. Amulet)">Natural Armor</label>
          <input
            type="number"
            value={localValues['acNatural'] !== undefined ? localValues['acNatural'] : (pc.acNatural ?? 0)}
            onChange={(e) => handleInputChange('acNatural', e.target.value)}
            onBlur={(e) => handleCommitNumber('acNatural', e.target.value, 0)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-acNatural-input"
            style={{ height: '18px', fontSize: '9px', textAlign: 'center' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }} title="Deflection bonus to AC (e.g. Ring of Protection)">Deflection</label>
          <input
            type="number"
            value={localValues['acDeflection'] !== undefined ? localValues['acDeflection'] : (pc.acDeflection ?? 0)}
            onChange={(e) => handleInputChange('acDeflection', e.target.value)}
            onBlur={(e) => handleCommitNumber('acDeflection', e.target.value, 0)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-acDeflection-input"
            style={{ height: '18px', fontSize: '9px', textAlign: 'center' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }} title="Other modifiers to AC">Other (AC)</label>
          <input
            type="number"
            value={localValues['acMisc'] !== undefined ? localValues['acMisc'] : (pc.acMisc ?? 0)}
            onChange={(e) => handleInputChange('acMisc', e.target.value)}
            onBlur={(e) => handleCommitNumber('acMisc', e.target.value, 0)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-acMisc-input"
            style={{ height: '18px', fontSize: '9px', textAlign: 'center' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        <div>
          <label style={{ fontSize: '9px', fontWeight: 600, color: 'var(--inkl)' }}>Spell Resistance (SR)</label>
          <input
            type="number"
            value={localValues['sr'] !== undefined ? localValues['sr'] : (pc.sr ?? 0)}
            onChange={(e) => handleInputChange('sr', e.target.value)}
            onBlur={(e) => handleCommitNumber('sr', e.target.value, 0)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-sr-input"
          />
        </div>
        <div>
          <label style={{ fontSize: '9px', fontWeight: 600, color: 'var(--inkl)' }}>Speed</label>
          <input
            type="number"
            value={localValues['bw'] !== undefined ? localValues['bw'] : (pc.bw ?? 30)}
            onChange={(e) => !getEquippedArmor() && handleInputChange('bw', e.target.value)}
            onBlur={(e) => !getEquippedArmor() && handleCommitNumber('bw', e.target.value, 30)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-bw-input"
            title="Movement speed (ft)"
            readOnly={!!getEquippedArmor()}
            style={getEquippedArmor() ? { background: 'rgba(0,0,0,0.05)', color: 'var(--red)', fontWeight: 'bold' } : undefined}
          />
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '.5px solid var(--pb)', margin: '4px 0' }} />

      {/* Initiative Block */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr 0.7fr', gap: '3px', alignItems: 'center', background: 'rgba(200, 169, 110, 0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px 4px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', lineHeight: 1 }}>Initiative Mod</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--red)', textAlign: 'center', paddingTop: '1px' }}>{formatMod(totIni)}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>DEX Mod</label>
          <input
            type="text"
            value={formatMod(dexMod)}
            readOnly
            tabIndex={-1}
            className="cinput"
            style={{ width: '28px', fontSize: '9px', height: '15px', textAlign: 'center', padding: 0, background: 'rgba(0,0,0,0.05)', fontWeight: 'bold' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>Misc Mod</label>
          <input
            type="number"
            value={localValues['iniMisc'] !== undefined ? localValues['iniMisc'] : (pc.iniMisc ?? 0)}
            onChange={(e) => handleInputChange('iniMisc', e.target.value)}
            onBlur={(e) => handleCommitNumber('iniMisc', e.target.value, 0)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-iniMisc-input"
            style={{ width: '28px', fontSize: '9px', height: '15px', textAlign: 'center', padding: 0 }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>Rolled</label>
          <input
            type="number"
            value={localValues['rawInit'] !== undefined ? localValues['rawInit'] : (pc.rawInit ? pc.rawInit : '')}
            onChange={(e) => handleInputChange('rawInit', e.target.value)}
            onBlur={(e) => handleCommitRawInit(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-init-input"
            style={{ width: '28px', fontSize: '9px', height: '15px', textAlign: 'center', padding: 0, fontWeight: 'bold', color: 'var(--red)' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>Total</label>
          <span className="pc-init-total" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', lineHeight: '15px', minWidth: '28px', textAlign: 'center', background: 'rgba(139,26,26,0.08)', border: '0.5px solid rgba(139,26,26,0.3)', borderRadius: '2px', padding: '0 2px' }}>
            {calculateInitiativeTotal(localValues['rawInit'] !== undefined ? localValues['rawInit'] : pc.rawInit, totIni).display}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>Formula</label>
          <button
            onClick={handleIniRoll}
            className="xbtn roll-ini-btn"
            style={{ padding: 0, width: '18px', height: '15px', fontSize: '9px', lineHeight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="View initiative modifier breakdown"
          >
            🎲
          </button>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '.5px solid var(--pb)', margin: '4px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '80px 30px 8px 30px 8px 30px 8px 1fr', gap: '2px', fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--inkl)', textAlign: 'center', paddingBottom: '2px' }}>
        <span style={{ textAlign: 'left' }}>Saving Throw</span>
        <span>Base</span>
        <span></span>
        <span>Ability</span>
        <span></span>
        <span>Misc</span>
        <span></span>
        <span>Total</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '2px' }}>
        {/* Zähigkeit (Fort) Equation Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 30px 8px 30px 8px 30px 8px 1fr', gap: '2px', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, textAlign: 'left' }} title="Fortitude">⚔️ Fortitude</span>
          <input
            type="number"
            value={localValues['baseZa'] !== undefined ? localValues['baseZa'] : baseZaVal}
            readOnly={!!hasClasses}
            tabIndex={hasClasses ? -1 : undefined}
            onChange={(e) => !hasClasses && handleInputChange('baseZa', e.target.value)}
            onBlur={(e) => !hasClasses && handleCommitNumber('baseZa', e.target.value, 0)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-baseZa-inp cinput-c"
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', ...(hasClasses ? { background: 'rgba(0,0,0,0.05)', color: 'var(--inkl)', borderColor: 'var(--pb)', cursor: 'not-allowed' } : {}) }}
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>+</span>
          <input
            type="text"
            value={formatMod(conMod)}
            readOnly
            tabIndex={-1}
            className="cinput cinput-c"
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', fontWeight: 'bold', background: 'rgba(0,0,0,0.05)', color: 'var(--inkl)', borderColor: 'var(--pb)' }}
            title="CON Modifier"
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>+</span>
          <input
            type="number"
            value={localValues['zaMisc'] !== undefined ? localValues['zaMisc'] : zaMiscData.displayValue}
            onChange={(e) => handleInputChange('zaMisc', e.target.value)}
            onBlur={(e) => handleCommitSaveMisc('za', conMod, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-zaMisc-inp cinput-c"
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', borderColor: 'var(--pb)' }}
            title={zaMiscData.tooltip}
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>=</span>
          <button
            onClick={(e) => handleSaveRoll('za', 'Fortitude', e)}
            className="btn roll-save-btn"
            style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2px', fontWeight: 'bold', height: '18px', padding: '0 3px', fontSize: '9px', borderRadius: '2px', lineHeight: 1 }}
          >
            <strong>{formatMod(totFort)} 🎲</strong>
          </button>
        </div>

        {/* Reflex (Ref) Equation Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 30px 8px 30px 8px 30px 8px 1fr', gap: '2px', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, textAlign: 'left' }} title="Reflex">🎯 Reflex</span>
          <input
            type="number"
            value={localValues['baseRef'] !== undefined ? localValues['baseRef'] : baseRefVal}
            readOnly={!!hasClasses}
            tabIndex={hasClasses ? -1 : undefined}
            onChange={(e) => !hasClasses && handleInputChange('baseRef', e.target.value)}
            onBlur={(e) => !hasClasses && handleCommitNumber('baseRef', e.target.value, 0)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-baseRef-inp cinput-c"
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', ...(hasClasses ? { background: 'rgba(0,0,0,0.05)', color: 'var(--inkl)', borderColor: 'var(--pb)', cursor: 'not-allowed' } : {}) }}
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>+</span>
          <input
            type="text"
            value={formatMod(dexMod)}
            readOnly
            tabIndex={-1}
            className="cinput cinput-c"
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', fontWeight: 'bold', background: 'rgba(0,0,0,0.05)', color: 'var(--inkl)', borderColor: 'var(--pb)' }}
            title="DEX Modifier"
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>+</span>
          <input
            type="number"
            value={localValues['refMisc'] !== undefined ? localValues['refMisc'] : refMiscData.displayValue}
            onChange={(e) => handleInputChange('refMisc', e.target.value)}
            onBlur={(e) => handleCommitSaveMisc('ref', dexMod, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-refMisc-inp cinput-c"
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', borderColor: 'var(--pb)' }}
            title={refMiscData.tooltip}
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>=</span>
          <button
            onClick={(e) => handleSaveRoll('ref', 'Reflex', e)}
            className="btn roll-save-btn"
            style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2px', fontWeight: 'bold', height: '18px', padding: '0 3px', fontSize: '9px', borderRadius: '2px', lineHeight: 1 }}
          >
            <strong>{formatMod(totRef)} 🎲</strong>
          </button>
        </div>

        {/* Willen (Will) Equation Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 30px 8px 30px 8px 30px 8px 1fr', gap: '2px', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, textAlign: 'left' }} title="Will">🔮 Will</span>
          <input
            type="number"
            value={localValues['baseWil'] !== undefined ? localValues['baseWil'] : baseWilVal}
            readOnly={!!hasClasses}
            tabIndex={hasClasses ? -1 : undefined}
            onChange={(e) => !hasClasses && handleInputChange('baseWil', e.target.value)}
            onBlur={(e) => !hasClasses && handleCommitNumber('baseWil', e.target.value, 0)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-baseWil-inp cinput-c"
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', ...(hasClasses ? { background: 'rgba(0,0,0,0.05)', color: 'var(--inkl)', borderColor: 'var(--pb)', cursor: 'not-allowed' } : {}) }}
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>+</span>
          <input
            type="text"
            value={formatMod(wisMod)}
            readOnly
            tabIndex={-1}
            className="cinput cinput-c"
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', fontWeight: 'bold', background: 'rgba(0,0,0,0.05)', color: 'var(--inkl)', borderColor: 'var(--pb)' }}
            title="WIS Modifier"
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>+</span>
          <input
            type="number"
            value={localValues['wilMisc'] !== undefined ? localValues['wilMisc'] : wisMiscData.displayValue}
            onChange={(e) => handleInputChange('wilMisc', e.target.value)}
            onBlur={(e) => handleCommitSaveMisc('wil', wisMod, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-wilMisc-inp cinput-c"
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', borderColor: 'var(--pb)' }}
            title={wisMiscData.tooltip}
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>=</span>
          <button
            onClick={(e) => handleSaveRoll('wil', 'Will', e)}
            className="btn roll-save-btn"
            style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2px', fontWeight: 'bold', height: '18px', padding: '0 3px', fontSize: '9px', borderRadius: '2px', lineHeight: 1 }}
          >
            <strong>{formatMod(totWil)} 🎲</strong>
          </button>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '.5px solid var(--pb)', margin: '4px 0' }} />

      {/* Integrated Physical Resistances & Reach */}
      <div style={{ fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--red)', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', letterSpacing: '0.5px', fontWeight: 'bold' }}>
        🛡️ Physical Resistances &amp; Reach
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '1px' }}>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }}>Damage Reduction (DR)</label>
          <input
            type="text"
            value={pc.dr || ''}
            onChange={(e) => CombatState.updatePCField('dr', e.target.value)}
            className="cinput pc-dr-input"
            placeholder="e.g. 5/silver"
            style={{ height: '16px', fontSize: '9px' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }}>Reach</label>
          <input
            type="text"
            value={pc.reach || ''}
            onChange={(e) => CombatState.updatePCField('reach', e.target.value)}
            className="cinput pc-reach-input"
            placeholder="e.g. 5 ft"
            style={{ height: '16px', fontSize: '9px' }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '2px' }}>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }}>Immunities</label>
          <input
            type="text"
            value={pc.immunities || ''}
            onChange={(e) => CombatState.updatePCField('immunities', e.target.value)}
            className="cinput pc-immunities-input"
            placeholder="poison, sleep..."
            style={{ height: '16px', fontSize: '9px' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }}>Energy Resistances</label>
          <input
            type="text"
            value={pc.resistances || ''}
            onChange={(e) => CombatState.updatePCField('resistances', e.target.value)}
            className="cinput pc-resistances-input"
            placeholder="fire 5..."
            style={{ height: '16px', fontSize: '9px' }}
          />
        </div>
      </div>
    </div>
  );
};
