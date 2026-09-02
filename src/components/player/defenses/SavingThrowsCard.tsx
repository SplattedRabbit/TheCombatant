/**
 * @module    SavingThrowsCard
 * @summary   Saving throws calculation rows (Fortitude, Reflex, Will), misc modifier inputs, and roll triggers.
 */

import React from 'react';
import { showRollBreakdown } from '@core/ui/components/dialogs.js';
import { formatMod, extractStatValue } from '../attributeHelper';

interface SavingThrowsCardProps {
  pc: any;
  conMod: number;
  dexMod: number;
  wisMod: number;
  localValues: Record<string, string>;
  onInputChange: (key: string, val: string) => void;
  onCommitNumber: (key: string, val: string, fallback?: number) => void;
  onCommitSaveMisc: (type: 'za' | 'ref' | 'wil', attrMod: number, val: string) => void;
}

export const SavingThrowsCard: React.FC<SavingThrowsCardProps> = ({
  pc,
  conMod,
  dexMod,
  wisMod,
  localValues,
  onInputChange,
  onCommitNumber,
  onCommitSaveMisc,
}) => {
  const totFort = extractStatValue(pc.za, 0);
  const totRef = extractStatValue(pc.ref, 0);
  const totWil = extractStatValue(pc.wil, 0);

  const baseZaVal = extractStatValue(pc.baseZa, 0);
  const baseRefVal = extractStatValue(pc.baseRef, 0);
  const baseWilVal = extractStatValue(pc.baseWil, 0);
  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;

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
    };
  };

  const zaMiscData = getSaveMiscBreakdown('za', conMod);
  const refMiscData = getSaveMiscBreakdown('ref', dexMod);
  const wisMiscData = getSaveMiscBreakdown('wil', wisMod);

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

  return (
    <div>
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
        {/* Fortitude Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 30px 8px 30px 8px 30px 8px 1fr', gap: '2px', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, textAlign: 'left' }} title="Fortitude">⚔️ Fortitude</span>
          <input
            type="number"
            value={localValues['baseZa'] !== undefined ? localValues['baseZa'] : baseZaVal}
            readOnly={!!hasClasses}
            tabIndex={hasClasses ? -1 : undefined}
            onChange={(e) => !hasClasses && onInputChange('baseZa', e.target.value)}
            onBlur={(e) => !hasClasses && onCommitNumber('baseZa', e.target.value, 0)}
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
            onChange={(e) => onInputChange('zaMisc', e.target.value)}
            onBlur={(e) => onCommitSaveMisc('za', conMod, e.target.value)}
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

        {/* Reflex Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 30px 8px 30px 8px 30px 8px 1fr', gap: '2px', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, textAlign: 'left' }} title="Reflex">🎯 Reflex</span>
          <input
            type="number"
            value={localValues['baseRef'] !== undefined ? localValues['baseRef'] : baseRefVal}
            readOnly={!!hasClasses}
            tabIndex={hasClasses ? -1 : undefined}
            onChange={(e) => !hasClasses && onInputChange('baseRef', e.target.value)}
            onBlur={(e) => !hasClasses && onCommitNumber('baseRef', e.target.value, 0)}
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
            onChange={(e) => onInputChange('refMisc', e.target.value)}
            onBlur={(e) => onCommitSaveMisc('ref', dexMod, e.target.value)}
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

        {/* Will Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 30px 8px 30px 8px 30px 8px 1fr', gap: '2px', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, textAlign: 'left' }} title="Will">🔮 Will</span>
          <input
            type="number"
            value={localValues['baseWil'] !== undefined ? localValues['baseWil'] : baseWilVal}
            readOnly={!!hasClasses}
            tabIndex={hasClasses ? -1 : undefined}
            onChange={(e) => !hasClasses && onInputChange('baseWil', e.target.value)}
            onBlur={(e) => !hasClasses && onCommitNumber('baseWil', e.target.value, 0)}
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
            onChange={(e) => onInputChange('wilMisc', e.target.value)}
            onBlur={(e) => onCommitSaveMisc('wil', wisMod, e.target.value)}
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
    </div>
  );
};
