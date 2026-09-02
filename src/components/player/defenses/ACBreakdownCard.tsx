/**
 * @module    ACBreakdownCard
 * @summary   Armor class breakdown (Total, Touch, Flat-Footed, Natural Armor, Deflection, Misc, SR, Speed).
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { showRollBreakdown } from '@core/ui/components/dialogs.js';
import { formatMod, extractStatValue } from '../attributeHelper';

interface ACBreakdownCardProps {
  pc: any;
  localValues: Record<string, string>;
  onInputChange: (key: string, val: string) => void;
  onCommitNumber: (key: string, val: string, fallback?: number) => void;
}

export const ACBreakdownCard: React.FC<ACBreakdownCardProps> = ({
  pc,
  localValues,
  onInputChange,
  onCommitNumber,
}) => {
  const acVal = extractStatValue(pc.ac, 10);
  const acTouchVal = extractStatValue(pc.acTouch, 10);
  const acFlatVal = extractStatValue(pc.acFlat, 10);

  const getAcTooltip = (stat: any, name: string) => {
    const items = ['Base value: 10'];
    const modifiers = Array.isArray(stat?.modifiers) ? stat.modifiers : [];
    modifiers.forEach((m: any) => {
      if (m.value !== 0) items.push(`• ${m.source || 'Modifier'}: ${formatMod(m.value)}`);
    });
    return `${name} Breakdown:\n` + items.join('\n');
  };

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

  const getEquippedArmor = () => {
    if (Array.isArray(pc.armors)) {
      return pc.armors.find((a: any) => a.isEquipped);
    }
    return null;
  };

  return (
    <>
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
            onChange={(e) => !pc.autoAC && onInputChange('ac', e.target.value)}
            onBlur={(e) => !pc.autoAC && onCommitNumber('ac', e.target.value, 10)}
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
            onChange={(e) => !pc.autoAC && onInputChange('acTouch', e.target.value)}
            onBlur={(e) => !pc.autoAC && onCommitNumber('acTouch', e.target.value, 10)}
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
            onChange={(e) => !pc.autoAC && onInputChange('acFlat', e.target.value)}
            onBlur={(e) => !pc.autoAC && onCommitNumber('acFlat', e.target.value, 10)}
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
            onChange={(e) => onInputChange('acNatural', e.target.value)}
            onBlur={(e) => onCommitNumber('acNatural', e.target.value, 0)}
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
            onChange={(e) => onInputChange('acDeflection', e.target.value)}
            onBlur={(e) => onCommitNumber('acDeflection', e.target.value, 0)}
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
            onChange={(e) => onInputChange('acMisc', e.target.value)}
            onBlur={(e) => onCommitNumber('acMisc', e.target.value, 0)}
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
            onChange={(e) => onInputChange('sr', e.target.value)}
            onBlur={(e) => onCommitNumber('sr', e.target.value, 0)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-sr-input"
          />
        </div>
        <div>
          <label style={{ fontSize: '9px', fontWeight: 600, color: 'var(--inkl)' }}>Speed</label>
          <input
            type="number"
            value={localValues['bw'] !== undefined ? localValues['bw'] : (pc.bw ?? 30)}
            onChange={(e) => !getEquippedArmor() && onInputChange('bw', e.target.value)}
            onBlur={(e) => !getEquippedArmor() && onCommitNumber('bw', e.target.value, 30)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="cinput pc-bw-input"
            title="Movement speed (ft)"
            readOnly={!!getEquippedArmor()}
            style={getEquippedArmor() ? { background: 'rgba(0,0,0,0.05)', color: 'var(--red)', fontWeight: 'bold' } : undefined}
          />
        </div>
      </div>
    </>
  );
};
