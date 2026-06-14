/**
 * @module    PCDefensesTab
 * @summary   Rendert Rettungswürfe, AC, Initiative und physische Resistenzen UI-Elemente und verwaltet deren Event-Bindings.
 * @exports   PCDefensesTab
 * @reads     pc.ac, pc.acTouch, pc.acFlat, pc.acNatural, pc.acDeflection, pc.acMisc, pc.sr, pc.bw, pc.feats, pc.iniMisc, pc.init, pc.con, pc.dex, pc.wis, pc.baseZa, pc.baseRef, pc.baseWil, pc.za, pc.ref, pc.wil, pc.zaMisc, pc.refMisc, pc.wilMisc
 * @stateOps  setPCAutoAC, updatePCNumber, updatePCField, showRollBreakdown
 * @depends   React, @core/state.js, @core/ui/components/dialogs.js
 */

import React from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { showRollBreakdown } from '@core/ui/components/dialogs.js';

interface PCDefensesTabProps {
  pc: any;
}

export const PCDefensesTab: React.FC<PCDefensesTabProps> = ({ pc }) => {
  const getAblVal = (statObj: any) => {
    if (!statObj) return 10;
    if (typeof statObj.getValue === 'function') return statObj.getValue();
    return statObj.base ?? 10;
  };

  const getAblMod = (statObj: any) => {
    return Math.floor((getAblVal(statObj) - 10) / 2);
  };

  const formatMod = (val: number) => {
    return val >= 0 ? `+${val}` : `${val}`;
  };

  const dexMod = getAblMod(pc.dex);
  const conMod = getAblMod(pc.con);
  const wisMod = getAblMod(pc.wis);

  const hasImprovedInit = Array.isArray(pc.feats) && pc.feats.some((f: any) => f.id === 'improved_initiative');
  const totFort = pc.za?.getValue?.() ?? pc.za?.total ?? 0;
  const totRef = pc.ref?.getValue?.() ?? pc.ref?.total ?? 0;
  const totWil = pc.wil?.getValue?.() ?? pc.wil?.total ?? 0;
  const totIni = dexMod + (parseInt(pc.iniMisc) || 0) + (hasImprovedInit ? 4 : 0);

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;

  const getSaveMiscBreakdown = (type: 'za' | 'ref' | 'wil', attrMod: number) => {
    const baseVal = type === 'za' ? (pc.baseZa?.base ?? 0) : type === 'ref' ? (pc.baseRef?.base ?? 0) : (pc.baseWil?.base ?? 0);
    const saveStat = type === 'za' ? pc.za : type === 'ref' ? pc.ref : pc.wil;
    const miscVal = type === 'za' ? (pc.zaMisc ?? 0) : type === 'ref' ? (pc.refMisc ?? 0) : (pc.wilMisc ?? 0);

    const total = saveStat?.getValue?.() ?? saveStat?.total ?? 0;
    const otherMods = total - baseVal - attrMod;

    const attrName = type === 'za' ? 'Konstitutions-Modifikator' : type === 'ref' ? 'Geschicklichkeits-Modifikator' : 'Weisheits-Modifikator';
    const miscName = 'Sonstiges (Ausrüstung/Spezial)';

    const modifiers = Array.isArray(saveStat?.modifiers) ? saveStat.modifiers : [];
    const extras = modifiers.filter((m: any) => m.source !== attrName && m.source !== miscName && m.value !== 0);

    let tooltip = `Sonstiger Modifikator (Eigenwert: ${miscVal})`;
    if (extras.length > 0) {
      tooltip += `\nAktive Effekte:\n` + extras.map((m: any) => `• ${m.source}: ${formatMod(m.value)}`).join('\n');
    }

    return {
      displayValue: otherMods,
      tooltip,
      hasExtras: extras.some((m: any) => !m.isRace)
    };
  };

  const getAcTooltip = (stat: any, name: string) => {
    const items = ['Basiswert: 10'];
    const modifiers = Array.isArray(stat?.modifiers) ? stat.modifiers : [];
    modifiers.forEach((m: any) => {
      if (m.value !== 0) items.push(`• ${m.source || 'Modifikator'}: ${formatMod(m.value)}`);
    });
    return `${name} Aufschlüsselung:\n` + items.join('\n');
  };

  const zaMiscData = getSaveMiscBreakdown('za', conMod);
  const refMiscData = getSaveMiscBreakdown('ref', dexMod);
  const wisMiscData = getSaveMiscBreakdown('wil', wisMod);

  const acTooltip = getAcTooltip(pc.ac, 'Rüstungsklasse (AC)');
  const acTouchTooltip = getAcTooltip(pc.acTouch, 'Touch AC');
  const acFlatTooltip = getAcTooltip(pc.acFlat, 'Flat-Footed AC');

  const handleAutoACChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    CombatState.setPCAutoAC(e.target.checked);
  };

  const handleAcClick = (type: 'ac' | 'acTouch' | 'acFlat', name: string, e: React.MouseEvent) => {
    if (!pc.autoAC) return;
    const stat = pc[type];
    const items = [{ label: 'Basiswert', value: 10 }];
    const modifiers = Array.isArray(stat?.modifiers) ? stat.modifiers : [];
    modifiers.forEach((m: any) => {
      if (m.value !== 0) items.push({ label: m.source || 'Modifikator', value: m.value });
    });
    showRollBreakdown(`${name} - Aufschlüsselung`, 'Basis 10', items, e.nativeEvent);
  };

  const handleSaveRoll = (type: 'za' | 'ref' | 'wil', label: string, e: React.MouseEvent) => {
    const baseStat = type === 'za' ? pc.baseZa : type === 'ref' ? pc.baseRef : pc.baseWil;
    const saveStat = type === 'za' ? pc.za : type === 'ref' ? pc.ref : pc.wil;

    const baseVal = baseStat?.getValue?.() ?? baseStat?.base ?? 0;
    const items = [{ label: 'Klassen-Basis', value: baseVal }];

    const modifiers = Array.isArray(saveStat?.modifiers) ? saveStat.modifiers : [];
    modifiers.forEach((m: any) => {
      items.push({ label: m.source || 'Modifikator', value: m.value });
    });

    showRollBreakdown(`Rettungswurf: ${label}`, '1W20', items, e.nativeEvent);
  };

  const handleIniRoll = (e: React.MouseEvent) => {
    const items = [
      { label: 'GES-Mod (DEX)', value: dexMod },
      { label: 'Misc-Mod (Sonst)', value: parseInt(pc.iniMisc) || 0 }
    ];
    if (hasImprovedInit) {
      items.push({ label: 'Talent: Verbesserte Initiative', value: 4 });
    }
    showRollBreakdown('Initiative-Wurf', '1W20', items, e.nativeEvent);
  };

  const calculateNewMisc = (type: 'za' | 'ref' | 'wil', attrMod: number, typedVal: number) => {
    const baseVal = type === 'za' ? (pc.baseZa?.base ?? 0) : type === 'ref' ? (pc.baseRef?.base ?? 0) : (pc.baseWil?.base ?? 0);
    const saveStat = type === 'za' ? pc.za : type === 'ref' ? pc.ref : pc.wil;
    const miscVal = type === 'za' ? (pc.zaMisc ?? 0) : type === 'ref' ? (pc.refMisc ?? 0) : (pc.wilMisc ?? 0);

    const total = saveStat?.getValue?.() ?? saveStat?.total ?? 0;
    const otherMods = total - baseVal - attrMod;
    const extraMods = otherMods - miscVal;

    return typedVal - extraMods;
  };

  const getEquippedArmor = () => {
    if (Array.isArray(pc.armor)) {
      return pc.armor.find((a: any) => a.equipped);
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(200, 169, 110, 0.05)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px 6px', marginBottom: '2px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--inkm)', margin: 0, fontWeight: 'bold', fontSize: '11px', fontFamily: "'IM Fell English SC', serif" }}>
          <input
            type="checkbox"
            className="pc-autoac-checkbox"
            checked={!!pc.autoAC}
            onChange={handleAutoACChange}
            style={{ margin: 0, width: '13px', height: '13px' }}
          />
          🛡️ Rüstungsklasse automatisch berechnen (Auto-RK)
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
        <div>
          <label style={{ fontSize: '9px', fontWeight: 600, color: 'var(--inkl)' }}>AC (RK)</label>
          <input
            type="number"
            value={pc.ac ?? 10}
            className="cinput pc-ac-input"
            readOnly={!!pc.autoAC}
            onClick={(e) => handleAcClick('ac', 'Rüstungsklasse (AC)', e)}
            onChange={(e) => !pc.autoAC && CombatState.updatePCNumber('ac', e.target.value)}
            style={pc.autoAC ? { background: 'rgba(0,0,0,0.05)', color: 'var(--red)', fontWeight: 'bold', cursor: 'pointer' } : undefined}
            title={pc.autoAC ? acTooltip : undefined}
          />
        </div>
        <div>
          <label style={{ fontSize: '9px', fontWeight: 600, color: 'var(--inkl)' }}>Touch</label>
          <input
            type="number"
            value={pc.acTouch ?? 10}
            className="cinput pc-acTouch-input"
            readOnly={!!pc.autoAC}
            onClick={(e) => handleAcClick('acTouch', 'Touch AC', e)}
            onChange={(e) => !pc.autoAC && CombatState.updatePCNumber('acTouch', e.target.value)}
            style={pc.autoAC ? { background: 'rgba(0,0,0,0.05)', color: 'var(--red)', fontWeight: 'bold', cursor: 'pointer' } : undefined}
            title={pc.autoAC ? acTouchTooltip : undefined}
          />
        </div>
        <div>
          <label style={{ fontSize: '9px', fontWeight: 600, color: 'var(--inkl)' }}>Flat-Footed</label>
          <input
            type="number"
            value={pc.acFlat ?? 10}
            className="cinput pc-acFlat-input"
            readOnly={!!pc.autoAC}
            onClick={(e) => handleAcClick('acFlat', 'Flat-Footed AC', e)}
            onChange={(e) => !pc.autoAC && CombatState.updatePCNumber('acFlat', e.target.value)}
            style={pc.autoAC ? { background: 'rgba(0,0,0,0.05)', color: 'var(--red)', fontWeight: 'bold', cursor: 'pointer' } : undefined}
            title={pc.autoAC ? acFlatTooltip : undefined}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', marginTop: '-2px', marginBottom: '2px' }}>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }} title="Natürlicher Rüstungsbonus (z.B. Amulett)">Natürliche Rüst.</label>
          <input
            type="number"
            value={pc.acNatural || 0}
            onChange={(e) => CombatState.updatePCNumber('acNatural', e.target.value)}
            className="cinput pc-acNatural-input"
            style={{ height: '18px', fontSize: '9px', textAlign: 'center' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }} title="Ablenkungsbonus auf RK (z.B. Schutzring)">Ablenkung</label>
          <input
            type="number"
            value={pc.acDeflection || 0}
            onChange={(e) => CombatState.updatePCNumber('acDeflection', e.target.value)}
            className="cinput pc-acDeflection-input"
            style={{ height: '18px', fontSize: '9px', textAlign: 'center' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }} title="Sonstige Modifikatoren auf RK">Sonstiges (RK)</label>
          <input
            type="number"
            value={pc.acMisc || 0}
            onChange={(e) => CombatState.updatePCNumber('acMisc', e.target.value)}
            className="cinput pc-acMisc-input"
            style={{ height: '18px', fontSize: '9px', textAlign: 'center' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        <div>
          <label style={{ fontSize: '9px', fontWeight: 600, color: 'var(--inkl)' }}>Zauberresistenz (SR)</label>
          <input
            type="number"
            value={pc.sr ?? 0}
            onChange={(e) => CombatState.updatePCNumber('sr', e.target.value)}
            className="cinput pc-sr-input"
          />
        </div>
        <div>
          <label style={{ fontSize: '9px', fontWeight: 600, color: 'var(--inkl)' }}>Geschwindigkeit (Speed)</label>
          <input
            type="number"
            value={pc.bw ?? 30}
            onChange={(e) => !getEquippedArmor() && CombatState.updatePCNumber('bw', e.target.value)}
            className="cinput pc-bw-input"
            title="Bewegungsrate (ft)"
            readOnly={!!getEquippedArmor()}
            style={getEquippedArmor() ? { background: 'rgba(0,0,0,0.05)', color: 'var(--red)', fontWeight: 'bold' } : undefined}
          />
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '.5px solid var(--pb)', margin: '4px 0' }} />

      {/* Initiative Block */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr 0.7fr', gap: '3px', alignItems: 'center', background: 'rgba(200, 169, 110, 0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px 4px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', lineHeight: 1 }}>Initiative-Mod</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--red)', textAlign: 'center', paddingTop: '1px' }}>{formatMod(totIni)}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>DEX-Mod</label>
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
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>Misc-Mod</label>
          <input
            type="number"
            value={pc.iniMisc || 0}
            onChange={(e) => CombatState.updatePCNumber('iniMisc', e.target.value)}
            className="cinput pc-iniMisc-input"
            style={{ width: '28px', fontSize: '9px', height: '15px', textAlign: 'center', padding: 0 }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>Gewürfelt</label>
          <input
            type="number"
            value={pc.init || 0}
            onChange={(e) => CombatState.updatePCNumber('init', e.target.value)}
            className="cinput pc-init-input"
            style={{ width: '28px', fontSize: '9px', height: '15px', textAlign: 'center', padding: 0, fontWeight: 'bold', color: 'var(--red)' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>Summe</label>
          <span className="pc-init-total" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', lineHeight: '15px', minWidth: '28px', textAlign: 'center', background: 'rgba(139,26,26,0.08)', border: '0.5px solid rgba(139,26,26,0.3)', borderRadius: '2px', padding: '0 2px' }}>
            {(pc.init || 0) > 0 ? (pc.init || 0) + totIni : '--'}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)', marginBottom: '1px', lineHeight: 1 }}>Formel</label>
          <button
            onClick={handleIniRoll}
            className="xbtn roll-ini-btn"
            style={{ padding: 0, width: '18px', height: '15px', fontSize: '9px', lineHeight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Initiativewurf (Formel)"
          >
            🎲
          </button>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '.5px solid var(--pb)', margin: '4px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '80px 30px 8px 30px 8px 30px 8px 1fr', gap: '2px', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--inkl)', textAlign: 'center', paddingBottom: '2px' }}>
        <span style={{ textAlign: 'left' }}>Rettungswurf</span>
        <span>Basis</span>
        <span></span>
        <span>Attribut</span>
        <span></span>
        <span>Sonst.</span>
        <span></span>
        <span>Gesamt</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '2px' }}>
        {/* Zähigkeit (Fort) Equation Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 30px 8px 30px 8px 30px 8px 1fr', gap: '2px', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, textAlign: 'left' }} title="Zähigkeit (Fortitude)">⚔️ Zäh (Fort)</span>
          <input
            type="number"
            value={pc.baseZa?.base ?? 0}
            readOnly={!!hasClasses}
            tabIndex={hasClasses ? -1 : undefined}
            onChange={(e) => !hasClasses && CombatState.updatePCNumber('baseZa', e.target.value)}
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
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', fontWeight: 'bold', background: 'rgba(0,0,0,0.05)', color: 'var(--red)', borderColor: 'var(--pb)' }}
            title="KON-Modifikator"
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>+</span>
          <input
            type="number"
            value={zaMiscData.displayValue}
            onChange={(e) => {
              const typed = parseInt(e.target.value) || 0;
              const newMisc = calculateNewMisc('za', conMod, typed);
              CombatState.updatePCNumber('zaMisc', newMisc);
            }}
            className="cinput pc-zaMisc-inp cinput-c"
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', ...(zaMiscData.hasExtras ? { borderColor: 'var(--red) !important', background: 'rgba(139, 26, 26, 0.05) !important', color: 'var(--red)', fontWeight: 'bold' } : {}) }}
            title={zaMiscData.tooltip}
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>=</span>
          <button
            onClick={(e) => handleSaveRoll('za', 'Zähigkeit', e)}
            className="btn roll-save-btn"
            style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2px', fontWeight: 'bold', height: '18px', padding: '0 3px', fontSize: '9px', borderRadius: '2px', lineHeight: 1 }}
          >
            <strong>{formatMod(totFort)} 🎲</strong>
          </button>
        </div>

        {/* Reflex (Ref) Equation Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 30px 8px 30px 8px 30px 8px 1fr', gap: '2px', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, textAlign: 'left' }} title="Reflex (Reflex)">🎯 Ref (Ges)</span>
          <input
            type="number"
            value={pc.baseRef?.base ?? 0}
            readOnly={!!hasClasses}
            tabIndex={hasClasses ? -1 : undefined}
            onChange={(e) => !hasClasses && CombatState.updatePCNumber('baseRef', e.target.value)}
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
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', fontWeight: 'bold', background: 'rgba(0,0,0,0.05)', color: 'var(--red)', borderColor: 'var(--pb)' }}
            title="GES-Modifikator"
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>+</span>
          <input
            type="number"
            value={refMiscData.displayValue}
            onChange={(e) => {
              const typed = parseInt(e.target.value) || 0;
              const newMisc = calculateNewMisc('ref', dexMod, typed);
              CombatState.updatePCNumber('refMisc', newMisc);
            }}
            className="cinput pc-refMisc-inp cinput-c"
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', ...(refMiscData.hasExtras ? { borderColor: 'var(--red) !important', background: 'rgba(139, 26, 26, 0.05) !important', color: 'var(--red)', fontWeight: 'bold' } : {}) }}
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
          <span style={{ fontSize: '9px', fontWeight: 600, textAlign: 'left' }} title="Willenskraft (Will)">🔮 Will (Wei)</span>
          <input
            type="number"
            value={pc.baseWil?.base ?? 0}
            readOnly={!!hasClasses}
            tabIndex={hasClasses ? -1 : undefined}
            onChange={(e) => !hasClasses && CombatState.updatePCNumber('baseWil', e.target.value)}
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
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', fontWeight: 'bold', background: 'rgba(0,0,0,0.05)', color: 'var(--red)', borderColor: 'var(--pb)' }}
            title="WEI-Modifikator"
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>+</span>
          <input
            type="number"
            value={wisMiscData.displayValue}
            onChange={(e) => {
              const typed = parseInt(e.target.value) || 0;
              const newMisc = calculateNewMisc('wil', wisMod, typed);
              CombatState.updatePCNumber('wilMisc', newMisc);
            }}
            className="cinput pc-wilMisc-inp cinput-c"
            style={{ fontSize: '9px', width: '30px', textAlign: 'center', padding: 0, height: '16px', ...(wisMiscData.hasExtras ? { borderColor: 'var(--red) !important', background: 'rgba(139, 26, 26, 0.05) !important', color: 'var(--red)', fontWeight: 'bold' } : {}) }}
            title={wisMiscData.tooltip}
          />
          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--pb)', textAlign: 'center' }}>=</span>
          <button
            onClick={(e) => handleSaveRoll('wil', 'Willen', e)}
            className="btn roll-save-btn"
            style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2px', fontWeight: 'bold', height: '18px', padding: '0 3px', fontSize: '9px', borderRadius: '2px', lineHeight: 1 }}
          >
            <strong>{formatMod(totWil)} 🎲</strong>
          </button>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '.5px solid var(--pb)', margin: '4px 0' }} />

      {/* Integrated Physical Resistances & Reach */}
      <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', letterSpacing: '0.5px', fontWeight: 'bold' }}>
        🛡️ Physische Resistenzen &amp; Reichweite
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '1px' }}>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }}>Schadensreduktion (DR)</label>
          <input
            type="text"
            value={pc.dr || ''}
            onChange={(e) => CombatState.updatePCField('dr', e.target.value)}
            className="cinput pc-dr-input"
            placeholder="z. B. 5/Silber"
            style={{ height: '16px', fontSize: '9px' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }}>Reichweite (Reach)</label>
          <input
            type="text"
            value={pc.reach || ''}
            onChange={(e) => CombatState.updatePCField('reach', e.target.value)}
            className="cinput pc-reach-input"
            placeholder="z. B. 5 ft"
            style={{ height: '16px', fontSize: '9px' }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '2px' }}>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }}>Immunitäten</label>
          <input
            type="text"
            value={pc.immunities || ''}
            onChange={(e) => CombatState.updatePCField('immunities', e.target.value)}
            className="cinput pc-immunities-input"
            placeholder="Gift, Schlaf..."
            style={{ height: '16px', fontSize: '9px' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '8px', fontWeight: 600, color: 'var(--inkl)' }}>Energie-Resistenzen</label>
          <input
            type="text"
            value={pc.resistances || ''}
            onChange={(e) => CombatState.updatePCField('resistances', e.target.value)}
            className="cinput pc-resistances-input"
            placeholder="Feuer 5..."
            style={{ height: '16px', fontSize: '9px' }}
          />
        </div>
      </div>
    </div>
  );
};
