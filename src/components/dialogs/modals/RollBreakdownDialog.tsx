/**
 * @module    RollBreakdownDialog
 * @summary   Parchment styled breakdown popup for d20 / check modifiers.
 */

import React from 'react';
import { DialogOverlay } from './DialogOverlay';

export interface RollBreakdownDialogProps {
  title: string;
  diceFormula: string;
  breakdownItems: Array<{ label: string; value: number }>;
  onClose: () => void;
}

export const RollBreakdownDialog: React.FC<RollBreakdownDialogProps> = ({
  title,
  diceFormula,
  breakdownItems,
  onClose,
}) => {
  let modsSum = 0;
  const listItems = (breakdownItems || []).map((item, idx) => {
    const val = parseInt(item.value as any, 10) || 0;
    modsSum += val;
    const sign = val >= 0 ? '+' : '';
    return (
      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--inkm)' }}>{item.label}:</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 'bold', color: 'var(--ink)' }}>{sign}{val}</span>
      </div>
    );
  });

  const modsFormatted = modsSum >= 0 ? `+${modsSum}` : `${modsSum}`;
  const formulaFormatted = modsSum === 0 ? diceFormula : `${diceFormula} ${modsFormatted}`;

  return (
    <DialogOverlay onClose={onClose} width={255} id="rollBreakdown">
      <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '0.3px' }}>
        {title.startsWith('🎲') ? title : `🎲 ${title}`}
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {listItems}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px dashed rgba(200,169,110,0.4)', marginTop: '4px', paddingTop: '4px' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--inkm)' }}>Total Modifier:</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 'bold', color: 'var(--red)' }}>{modsFormatted}</span>
        </div>
      </div>
      
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '8px 0' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>ROLL FORMULA:</span>
        <span style={{ fontSize: '13px' }}>{formulaFormatted}</span>
      </div>
    </DialogOverlay>
  );
};
