/**
 * @module    PCAttributeBox
 * @summary   Individual attribute input box with modifier display, roll trigger, and bonus tooltip.
 */

import React from 'react';
import { showAttributeExplanation, getAblMod } from '../attributeHelper';
import { showRollBreakdown } from '@core/ui/components/dialogs.js';

interface PCAttributeBoxProps {
  attrKey: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  label: string;
  icon: string;
  pc: any;
  localValue: string | undefined;
  onLocalChange: (val: string) => void;
  onCommit: (val: string) => void;
}

export const PCAttributeBox: React.FC<PCAttributeBoxProps> = ({
  attrKey,
  label,
  icon,
  pc,
  localValue,
  onLocalChange,
  onCommit,
}) => {
  const stat = pc[attrKey];
  const score = stat?.getValue?.() ?? stat?.total ?? 0;
  const mod = getAblMod(score);
  const hasModifiers = Array.isArray(stat?.modifiers) && stat.modifiers.some((m: any) => m.value !== 0);

  const formatMod = (val: number) => (val >= 0 ? `+${val}` : `${val}`);

  let tooltip = `${label} Score`;
  if (hasModifiers && stat.modifiers) {
    const activeMods = stat.modifiers.filter((m: any) => m.value !== 0);
    tooltip += `\nBase Value: ${stat.base}\nActive Value: ${score}\nActive Bonuses:\n` + 
      activeMods.map((m: any) => `• ${m.source}: ${formatMod(m.value)}`).join('\n');
  }

  const handleRoll = (e: React.MouseEvent) => {
    const baseVal = stat?.base ?? 0;
    let detailParts: string[] = [];
    if (baseVal > 0) {
      detailParts.push(`${baseVal} Base`);
    }
    if (Array.isArray(stat?.modifiers)) {
      stat.modifiers.forEach((m: any) => {
        if (m.value !== 0) {
          const sign = m.value > 0 ? '+' : '';
          detailParts.push(`${sign}${m.value} ${m.source || 'Mod'}`);
        }
      });
    }
    const detailStr = detailParts.length > 1 ? ` (Value: ${score} = ${detailParts.join(' ')})` : ` (Value: ${score})`;

    showRollBreakdown(`${label} Roll${detailStr}`, '1d20', [
      { label: `${label} Modifier`, value: mod }
    ], e.nativeEvent);
  };

  return (
    <div
      className="attr-box"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(200, 169, 110, 0.1)',
        border: '0.5px solid var(--pb)',
        borderRadius: '2px',
        padding: '3px',
        position: 'relative'
      }}
      title={tooltip}
    >
      <label 
        style={{ 
          fontSize: '8px', 
          fontWeight: 600, 
          color: 'var(--inkl)',
          cursor: 'pointer'
        }}
        onClick={() => showAttributeExplanation(attrKey)}
        title="Click for a brief explanation"
      >
        {icon} {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px', justifyContent: 'space-between' }}>
        <input
          type="number"
          value={localValue !== undefined ? localValue : (score ?? 10)}
          onChange={(e) => onLocalChange(e.target.value)}
          onBlur={(e) => onCommit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              (e.target as HTMLInputElement).blur();
            }
          }}
          className={`cinput pc-${attrKey}-inp`}
          style={{
            width: '24px',
            fontSize: '9px',
            height: '14px',
            textAlign: 'center',
            padding: 0,
            color: 'var(--ink)',
            fontWeight: 'normal',
            borderColor: 'var(--pb)'
          }}
          title={tooltip}
        />
        <input
          type="text"
          value={formatMod(mod)}
          readOnly
          className="cinput"
          style={{
            width: '20px',
            fontSize: '8.5px',
            height: '14px',
            textAlign: 'center',
            padding: 0,
            fontWeight: 'bold',
            borderColor: 'var(--pb)',
            background: 'rgba(0,0,0,0.05)',
            color: 'var(--inkl)'
          }}
          title="Modifier"
        />
        <button
          className="xbtn roll-attr-btn"
          onClick={handleRoll}
          style={{ padding: 0, width: '16px', height: '14px', fontSize: '8px', lineHeight: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={`${label} Roll (Formula)`}
        >
          🎲
        </button>
      </div>
    </div>
  );
};
