/**
 * @module    PCAttributes
 * @summary   Renders the attribute section (STR/DEX/CON/INT/WIS/CHA, BAB), race selection, and multiclass manager of the player character.
 * @exports   PCAttributes
 * @reads     pc.str, pc.dex, pc.con, pc.int, pc.wis, pc.cha, pc.bab, pc.classes, pc.race
 * @stateOps  updatePCNumber, addPCClass, removePCClass, updatePCClassLevel, updatePCClassType, clearPCClasses, updatePCBatch
 * @depends   React, @core/state.js, @core/rules.js, @core/ui/components/dialogs.js, src/components/shared/BaseCard
 * @notHere   Offense -> PCOffenseTab.tsx | Skills -> PCSkillsTab.tsx
 */

import React, { useState, useRef } from 'react';
import { CombatState } from '@core/state.js';
import { BaseCard } from '../shared/BaseCard';
import { showCustomAlert } from '@core/ui/components/dialogs.js';
import { PCAttributeBox } from './attributes/PCAttributeBox.tsx';
import { PCClassesManager } from './attributes/PCClassesManager.tsx';

interface PCAttributesProps {
  pc: any;
  onOpenLevelUp?: () => void;
}

export const PCAttributes: React.FC<PCAttributesProps> = ({ pc, onOpenLevelUp }) => {
  const [localScores, setLocalScores] = useState<Record<string, string>>({});
  const classesCount = Array.isArray(pc.classes) ? pc.classes.length : 0;
  const isAlertActiveRef = useRef(false);

  const formatMod = (val: number) => (val >= 0 ? `+${val}` : `${val}`);

  const getBabSequence = (bab: number) => {
    const seq = [formatMod(bab)];
    if (bab >= 6) seq.push(formatMod(bab - 5));
    if (bab >= 11) seq.push(formatMod(bab - 10));
    if (bab >= 16) seq.push(formatMod(bab - 15));
    return seq.join(' / ');
  };

  const handleCommitAbility = (key: string, label: string, val: string) => {
    if (isAlertActiveRef.current) return;

    setLocalScores((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    const trimmed = (val ?? '').trim();
    if (trimmed === '') return;

    let num = parseInt(trimmed, 10);
    if (isNaN(num)) {
      num = 10;
    }

    const currentScore = pc[key]?.getValue?.() ?? pc[key]?.base ?? pc[key] ?? 10;

    if (num < 3) {
      isAlertActiveRef.current = true;
      showCustomAlert(
        `Attribute Rule: ${label}`,
        `<p style="margin: 0 0 8px 0;"><strong>${label}</strong> was entered as <strong>${num}</strong>.</p>` +
        `<p style="margin: 0 0 8px 0;">In D&amp;D 3.5e, the minimum ability score for an active character is <strong>3</strong> (a score below 3 causes unconsciousness or helplessness).</p>` +
        `<p style="margin: 0; color: var(--red); font-weight: bold;">The value has been adjusted to 3.</p>`,
        "Understood",
        "⚠️",
        () => {
          setTimeout(() => {
            isAlertActiveRef.current = false;
          }, 150);
        }
      );
      num = 3;
    }

    if (num !== currentScore) {
      CombatState.updatePCNumber(key, num);
    }
  };

  return (
    <BaseCard title="✨ Attributes & BAB">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {/* Race & Multiclassing Manager */}
        <PCClassesManager pc={pc} onOpenLevelUp={onOpenLevelUp} />

        {/* Attribute Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          <PCAttributeBox
            attrKey="str"
            label="Strength"
            icon="⚔️"
            pc={pc}
            localValue={localScores.str}
            onLocalChange={(v) => setLocalScores((prev) => ({ ...prev, str: v }))}
            onCommit={(v) => handleCommitAbility('str', 'Strength', v)}
          />
          <PCAttributeBox
            attrKey="dex"
            label="Dexterity"
            icon="🎯"
            pc={pc}
            localValue={localScores.dex}
            onLocalChange={(v) => setLocalScores((prev) => ({ ...prev, dex: v }))}
            onCommit={(v) => handleCommitAbility('dex', 'Dexterity', v)}
          />
          <PCAttributeBox
            attrKey="con"
            label="Constitution"
            icon="🛡️"
            pc={pc}
            localValue={localScores.con}
            onLocalChange={(v) => setLocalScores((prev) => ({ ...prev, con: v }))}
            onCommit={(v) => handleCommitAbility('con', 'Constitution', v)}
          />
          <PCAttributeBox
            attrKey="int"
            label="Intelligence"
            icon="🧠"
            pc={pc}
            localValue={localScores.int}
            onLocalChange={(v) => setLocalScores((prev) => ({ ...prev, int: v }))}
            onCommit={(v) => handleCommitAbility('int', 'Intelligence', v)}
          />
          <PCAttributeBox
            attrKey="wis"
            label="Wisdom"
            icon="🔮"
            pc={pc}
            localValue={localScores.wis}
            onLocalChange={(v) => setLocalScores((prev) => ({ ...prev, wis: v }))}
            onCommit={(v) => handleCommitAbility('wis', 'Wisdom', v)}
          />
          <PCAttributeBox
            attrKey="cha"
            label="Charisma"
            icon="✨"
            pc={pc}
            localValue={localScores.cha}
            onLocalChange={(v) => setLocalScores((prev) => ({ ...prev, cha: v }))}
            onCommit={(v) => handleCommitAbility('cha', 'Charisma', v)}
          />
        </div>

        {/* BAB */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px', background: 'rgba(139,26,26,0.05)', border: '0.5px solid rgba(139,26,26,0.2)', borderRadius: '2px', padding: '4px' }}>
          <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>⚔️ Base Attack Bonus (BAB):</label>
          <input
            type="text"
            value={getBabSequence(typeof pc.bab === 'number' ? pc.bab : (typeof pc.bab?.getValue === 'function' ? pc.bab.getValue() : 0))}
            onChange={(e) => {
              CombatState.clearPCClasses();
              CombatState.updatePCNumber('bab', e.target.value);
            }}
            className="cinput pc-bab-inp"
            disabled={classesCount > 0}
            style={{
              width: '100px',
              fontSize: '9px',
              fontWeight: 'bold',
              textAlign: 'center',
              height: '14px',
              padding: 0,
              background: classesCount > 0 ? 'rgba(0,0,0,0.05)' : 'white',
              color: 'var(--red)',
              borderColor: 'var(--pb)',
              cursor: classesCount > 0 ? 'not-allowed' : 'text'
            }}
          />
        </div>
      </div>
    </BaseCard>
  );
};
