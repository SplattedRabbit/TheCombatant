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
import { getStatMod, extractStatValue } from './attributeHelper';
import { ACBreakdownCard } from './defenses/ACBreakdownCard.tsx';
import { InitiativeWidget } from './defenses/InitiativeWidget.tsx';
import { SavingThrowsCard } from './defenses/SavingThrowsCard.tsx';
import { ResistancesCard } from './defenses/ResistancesCard.tsx';

interface PCDefensesTabProps {
  pc: any;
}

export const PCDefensesTab: React.FC<PCDefensesTabProps> = ({ pc }) => {
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const dexMod = getStatMod(pc.dex);
  const conMod = getStatMod(pc.con);
  const wisMod = getStatMod(pc.wis);

  const hasImprovedInit = Array.isArray(pc.feats) && pc.feats.some((f: any) => f.id === 'improved_initiative');
  const totIni = dexMod + (parseInt(pc.iniMisc) || 0) + (hasImprovedInit ? 4 : 0);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* 1. AC & Armor Breakdown */}
      <ACBreakdownCard
        pc={pc}
        localValues={localValues}
        onInputChange={handleInputChange}
        onCommitNumber={handleCommitNumber}
      />

      <hr style={{ border: 'none', borderTop: '.5px solid var(--pb)', margin: '4px 0' }} />

      {/* 2. Initiative Block */}
      <InitiativeWidget
        pc={pc}
        dexMod={dexMod}
        totIni={totIni}
        hasImprovedInit={hasImprovedInit}
        localValues={localValues}
        onInputChange={handleInputChange}
        onCommitNumber={handleCommitNumber}
        onCommitRawInit={handleCommitRawInit}
      />

      <hr style={{ border: 'none', borderTop: '.5px solid var(--pb)', margin: '4px 0' }} />

      {/* 3. Saving Throws Breakdown */}
      <SavingThrowsCard
        pc={pc}
        conMod={conMod}
        dexMod={dexMod}
        wisMod={wisMod}
        localValues={localValues}
        onInputChange={handleInputChange}
        onCommitNumber={handleCommitNumber}
        onCommitSaveMisc={handleCommitSaveMisc}
      />

      <hr style={{ border: 'none', borderTop: '.5px solid var(--pb)', margin: '4px 0' }} />

      {/* 4. Physical Resistances & Reach */}
      <ResistancesCard pc={pc} />
    </div>
  );
};
