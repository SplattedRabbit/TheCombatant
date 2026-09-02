/**
 * @module    CastSuccessDialog
 * @summary   Post-spellcasting party buff distributor modal with caster level adjustment and party targets selection.
 */

import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { uiRegistry } from '@core/ui/ui-shared.js';
import { CombatSpells } from '@core/spells.js';
import {
  checkBuffConflict,
  resolveSpellEffectValue,
  calculateDurationRounds
} from '@core/rules/BuffRules.js';
import { showCustomAlert, showCustomConfirm } from '@core/ui/components/dialogs.js';

function findSpell(pc: any, key: string) {
  if (CombatSpells.REGISTRY[key]) {
    return CombatSpells.REGISTRY[key];
  }
  if (pc && Array.isArray(pc.customSpells)) {
    const found = pc.customSpells.find((s: any) => s.id === key || s.nameDe === key);
    if (found) return found;
  }
  return null;
}

export interface CastSuccessDialogProps {
  pc: any;
  spellKey: string;
  metamagic?: string[];
  onClose: () => void;
}

export const CastSuccessDialog: React.FC<CastSuccessDialogProps> = ({
  pc,
  spellKey,
  metamagic = [],
  onClose
}) => {
  const spell = findSpell(pc, spellKey);
  if (!spell) return null;

  let defaultCL = 1;
  if (Array.isArray(pc.classes)) {
    pc.classes.forEach((c: any) => {
      if (['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'bard'].includes(c.classType)) {
        if (c.level > defaultCL) defaultCL = c.level;
      }
    });
  }

  const METAMAGIC_COSTS = { extend_spell: 1, empower_spell: 2, maximize_spell: 3, quicken_spell: 4 };
  const metamagicNames = { extend_spell: 'Extended', empower_spell: 'Empowered', maximize_spell: 'Maximized', quicken_spell: 'Quickened' };
  const appliedMeta = metamagic.map(mId => (metamagicNames as any)[mId] || mId);
  const metaSuffix = appliedMeta.length > 0 ? ` (${appliedMeta.join(', ')})` : '';
  const metamagicAdjustment = metamagic.reduce((sum, fId) => sum + ((METAMAGIC_COSTS as any)[fId] || 0), 0);
  const finalLevel = spell.level + metamagicAdjustment;
  const spellName = spell.nameDe || spell.nameEn || spellKey;

  const allPcs = CombatState.getState().combatants || [];
  const allies = allPcs.filter((c: any) => c.type === 'p' && c.id !== pc.id);

  const [casterLevel, setCasterLevel] = useState<number>(defaultCL);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([pc.id]);

  const handleTargetToggle = (tId: string) => {
    setSelectedTargets(prev =>
      prev.includes(tId) ? prev.filter(id => id !== tId) : [...prev, tId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTargets([pc.id, ...allies.map((a: any) => a.id)]);
  };

  const handleSelectNone = () => {
    setSelectedTargets([]);
  };

  const handleApplyBuff = () => {
    const cl = casterLevel;
    let rounds = calculateDurationRounds(spell.duration, cl);
    if (rounds !== null && metamagic.includes('extend_spell')) {
      rounds = rounds * 2;
    }

    const effects = spell.effects || [];
    const resolvedEffects = effects.map((eff: any) => {
      let val = parseInt(eff.value) || 0;
      if (eff.valueFormula) {
        val = resolveSpellEffectValue(eff.valueFormula, cl, val);
      }
      return {
        target: eff.target,
        value: val,
        type: eff.type,
        source: eff.source || spellName
      };
    });

    const activate = () => {
      CombatState.updatePCBatch((freshPc: any) => {
        if (!Array.isArray(freshPc.activeBuffs)) freshPc.activeBuffs = [];
        freshPc.activeBuffs = freshPc.activeBuffs.filter((b: any) => b.spellKey !== spellKey);

        freshPc.activeBuffs.push({
          id: 'spell_' + spellKey + '_' + Date.now(),
          spellKey: spellKey,
          name: spellName + metaSuffix,
          durationFormula: spell.duration,
          casterLevel: cl,
          durationMaxRounds: rounds,
          durationRemainingRounds: rounds,
          effects: resolvedEffects,
          sharedWith: selectedTargets
        });
      });

      if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
        uiRegistry.renderPlayerScreen();
      }
      onClose();
    };

    // Stacking conflict check on caster (if Self is selected)
    const isSelfTarget = selectedTargets.includes(pc.id);
    const conflict = isSelfTarget ? checkBuffConflict(pc, spellKey, resolvedEffects) : { status: 'ok' };

    if (conflict.status === 'suppressed') {
      showCustomConfirm(
        "Stacking Conflict",
        `A stronger or equivalent buff (<strong>${(conflict as any).conflictingBuffName}</strong>) is already active.<br><br>Your new buff <strong>${(conflict as any).buffName}</strong> (+${(conflict as any).newValue} on ${(conflict as any).targetLabel}) has the same bonus type and would therefore have <strong>no effect</strong>.<br><br>Do you want to activate the buff anyway?`,
        () => {
          activate();
        }
      );
    } else if (conflict.status === 'overrides') {
      activate();
      showCustomAlert(
        "Buff Overridden",
        `Activating <strong>${(conflict as any).buffName}</strong> (+${(conflict as any).newValue}) overrides the weaker active buff <strong>${(conflict as any).conflictingBuffName}</strong> (+${(conflict as any).activeValue}) on <strong>${(conflict as any).targetLabel}</strong>.`,
        "Understood",
        "✨"
      );
    } else {
      activate();
    }
  };

  return (
    <div
      id="castSuccessDialogOverlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '16px 20px',
          width: '520px',
          maxWidth: '95vw',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08)',
          fontFamily: 'var(--font-body)',
          position: 'relative',
          transform: 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          textAlign: 'left'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        <div style={{ fontFamily: 'var(--font-title)', fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '6px', textAlign: 'center' }}>
          Spell successfully cast! ✨
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 8px' }} />

        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', textAlign: 'center', fontFamily: 'var(--font-title)' }}>
          {spellName}{metaSuffix}
        </div>
        <div style={{ fontSize: '8.5px', color: 'var(--inkl)', textAlign: 'center', marginBottom: '8px', fontStyle: 'italic' }}>
          {spell.school} • Level {finalLevel}
        </div>
        <div style={{ fontSize: '8px', fontStyle: 'italic', background: 'rgba(0,0,0,0.02)', border: '0.5px solid rgba(200, 169, 110, 0.2)', padding: '4px', borderRadius: '2px', lineHeight: 1.25, marginBottom: '10px', maxHeight: '80px', overflowY: 'auto', color: 'var(--ink)' }}>
          {spell.description}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px', fontSize: '9px', color: 'var(--ink)' }}>
          <strong>Caster Level:</strong>
          <input
            type="number"
            className="cast-cl-input"
            value={casterLevel}
            onChange={(e) => setCasterLevel(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="40"
            style={{
              width: '40px',
              height: '16px',
              fontSize: '9px',
              textAlign: 'center',
              border: '0.5px solid var(--pb)',
              borderRadius: '2px',
              background: 'rgba(0,0,0,0.03)',
              color: 'var(--ink)',
              fontWeight: 'bold'
            }}
          />
        </div>

        <div style={{ marginBottom: '12px', color: 'var(--ink)' }}>
          <strong style={{ fontSize: '9px', color: 'var(--red)', fontFamily: 'var(--font-title)', display: 'block', marginBottom: '4px' }}>Targets for Buff / Aura:</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto', padding: '4px', border: '0.5px solid rgba(200, 169, 110, 0.2)', background: 'rgba(0,0,0,0.01)', borderRadius: '2px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', cursor: 'pointer', color: 'var(--ink)' }}>
              <input
                type="checkbox"
                checked={selectedTargets.includes(pc.id)}
                onChange={() => handleTargetToggle(pc.id)}
                style={{ margin: 0 }}
              />
              <span><strong>{pc.name}</strong> (Self)</span>
            </label>
            {allies.map((ally: any) => (
              <label key={ally.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', cursor: 'pointer', color: 'var(--ink)' }}>
                <input
                  type="checkbox"
                  checked={selectedTargets.includes(ally.id)}
                  onChange={() => handleTargetToggle(ally.id)}
                  style={{ margin: 0 }}
                />
                <span>{ally.name}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleSelectAll}
              className="btn btn-group-toggle"
              style={{ fontSize: '7.5px', padding: '2px 6px', border: '0.5px solid var(--pb)', background: 'transparent', color: 'var(--ink)', cursor: 'pointer' }}
            >
              Entire Party
            </button>
            <button
              type="button"
              onClick={handleSelectNone}
              className="btn btn-none-toggle"
              style={{ fontSize: '7.5px', padding: '2px 6px', border: '0.5px solid var(--pb)', background: 'transparent', color: 'var(--ink)', cursor: 'pointer' }}
            >
              Reset
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={handleApplyBuff}
            className="btn btn-p apply-buff-btn"
            style={{ fontFamily: 'var(--font-title)', fontSize: '9px', padding: '4px 14px', cursor: 'pointer' }}
          >
            Apply as Buff
          </button>
          <button
            onClick={onClose}
            className="btn close-dialog-btn"
            style={{ fontFamily: 'var(--font-title)', fontSize: '9px', padding: '4px 14px', cursor: 'pointer', borderColor: 'var(--pb)', background: 'transparent', color: 'var(--ink)' }}
          >
            Cast Only (No Buff)
          </button>
        </div>
      </div>
    </div>
  );
};
