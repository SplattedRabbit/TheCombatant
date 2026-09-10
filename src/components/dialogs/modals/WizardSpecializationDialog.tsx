/**
 * @module    WizardSpecializationDialog
 * @summary   Modal dialog for configuring Wizard Arcane School Specialization and Prohibited Schools (D&D 3.5e RAW).
 */

import React, { useState } from 'react';
import { DialogOverlay } from './DialogOverlay';
import { CombatState } from '@core/state.js';
import { getSchoolCodeFromInput } from '@core/spells.js';
import { cleanProhibitedSpells } from '@core/rules/SpellRules.js';
import { SpellSlotCalculator } from '@core/rules/SpellSlotCalculator.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';

export interface WizardSpecializationDialogProps {
  pc: any;
  isOpen: boolean;
  onClose: () => void;
}

export const SPECIALIST_SCHOOLS = [
  { value: 'none', label: 'Universalist / Generalist (No prohibited schools)' },
  { value: 'abj', label: 'Abjuration (Abwehrzauber)' },
  { value: 'con', label: 'Conjuration (Beschwörung)' },
  { value: 'div', label: 'Divination (Erkenntniszauber) [1 Prohibited School]' },
  { value: 'enc', label: 'Enchantment (Verzauberung)' },
  { value: 'evo', label: 'Evocation (Hervorrufung)' },
  { value: 'ill', label: 'Illusion (Täuschung)' },
  { value: 'nec', label: 'Necromancy (Nekromantie)' },
  { value: 'tra', label: 'Transmutation (Verwandlung)' },
];

export const PROHIBITABLE_SCHOOLS = [
  { value: 'abj', label: 'Abjuration' },
  { value: 'con', label: 'Conjuration' },
  { value: 'enc', label: 'Enchantment' },
  { value: 'evo', label: 'Evocation' },
  { value: 'ill', label: 'Illusion' },
  { value: 'nec', label: 'Necromancy' },
  { value: 'tra', label: 'Transmutation' },
];

export const WizardSpecializationDialog: React.FC<WizardSpecializationDialogProps> = ({
  pc,
  isOpen,
  onClose,
}) => {
  const currentSpec = getSchoolCodeFromInput(pc?.wizardSpecialization) || 'none';
  const currentProb1 = getSchoolCodeFromInput(pc?.wizardProhibited1) || '';
  const currentProb2 = getSchoolCodeFromInput(pc?.wizardProhibited2) || '';

  const [spec, setSpec] = useState<string>(currentSpec);
  const [prob1, setProb1] = useState<string>(currentProb1);
  const [prob2, setProb2] = useState<string>(currentProb2);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSpecChange = (newSpec: string) => {
    setSpec(newSpec);
    setError(null);
    if (newSpec === 'none') {
      setProb1('');
      setProb2('');
    } else if (newSpec === 'div') {
      // Divination only needs 1 school
      if (prob1 === 'div') setProb1('');
      setProb2('');
    } else {
      if (prob1 === newSpec) setProb1('');
      if (prob2 === newSpec) setProb2('');
    }
  };

  const handleSave = () => {
    setError(null);

    if (spec === 'div') {
      if (!prob1) {
        setError('Please select 1 prohibited school for your Divination specialty.');
        return;
      }
    } else if (spec !== 'none') {
      if (!prob1 || !prob2) {
        setError('Please select 2 prohibited schools for your specialization.');
        return;
      }
      if (prob1 === prob2) {
        setError('Prohibited schools must be two different schools.');
        return;
      }
      if (prob1 === spec || prob2 === spec) {
        setError('You cannot choose your specialty school as a prohibited school.');
        return;
      }
    }

    // Apply to PC
    CombatState.updatePCBatch((freshPc: any) => {
      freshPc.wizardSpecialization = spec;
      freshPc.wizardProhibited1 = spec === 'none' ? '' : prob1;
      freshPc.wizardProhibited2 = (spec === 'none' || spec === 'div') ? '' : prob2;

      // Clean prohibited spells
      const removed = cleanProhibitedSpells(freshPc);

      // Recalculate spell slots
      const calculatedSlots = SpellSlotCalculator.calculateSpellSlots(freshPc);
      if (calculatedSlots) {
        if (!freshPc.spellSlots) freshPc.spellSlots = {};
        for (let lvl = 0; lvl <= 9; lvl++) {
          if (!freshPc.spellSlots[lvl]) {
            freshPc.spellSlots[lvl] = { max: 0, used: 0 };
          }
          freshPc.spellSlots[lvl].max = calculatedSlots[lvl] || 0;
          freshPc.spellSlots[lvl].used = Math.min(freshPc.spellSlots[lvl].max, freshPc.spellSlots[lvl].used || 0);
        }
      }

      if (removed.length > 0) {
        setTimeout(() => {
          showCustomAlert(
            'Prohibited School Spells Removed ⚠️',
            `The following spells from your newly prohibited school(s) were removed from your spellbook:\n\n• ${removed.join('\n• ')}`
          );
        }, 100);
      }
    });

    onClose();
  };

  // Filter available prohibited schools: cannot prohibit own specialty school
  const availableProhibitions = PROHIBITABLE_SCHOOLS.filter(s => s.value !== spec);

  return (
    <DialogOverlay onClose={onClose} width={480} id="wizardSpecializationDialogOverlay">
      <div style={{ textAlign: 'left', fontFamily: 'var(--font-body)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--pb)', paddingBottom: '6px', marginBottom: '10px' }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '14px', fontWeight: 'bold', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎭</span> Wizard Arcane Specialization
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', color: 'var(--inkm)', fontSize: '16px', cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* RAW Explanation */}
        <div
          style={{
            fontSize: '11px',
            color: 'var(--ink)',
            lineHeight: 1.35,
            padding: '8px 10px',
            background: 'rgba(200, 169, 110, 0.1)',
            border: '1px solid var(--pb)',
            borderRadius: '4px',
            marginBottom: '12px',
          }}
        >
          <strong>D&D 3.5e RAW Rules:</strong>
          <br />
          • <strong>Specialist:</strong> Gains <strong>+1 bonus spell slot</strong> per spell level (1st–9th) to prepare a spell of your chosen school.
          <br />
          • <strong>Prohibited Schools:</strong> You can never learn, prepare, cast, or activate scrolls/wands of spells from your prohibited schools.
          <br />
          • <strong>Universalist:</strong> No prohibited schools, full access to all spells, but no bonus specialty slots.
        </div>

        {/* School Select */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '4px', fontFamily: 'var(--font-title)' }}>
            Chosen Arcane School:
          </label>
          <select
            value={spec}
            onChange={(e) => handleSpecChange(e.target.value)}
            className="cinput"
            style={{ width: '100%', height: '28px', fontSize: '11.5px', padding: '2px 6px', borderRadius: '4px' }}
          >
            {SPECIALIST_SCHOOLS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Prohibited Schools Configuration */}
        {spec === 'none' ? (
          <div
            style={{
              fontSize: '11px',
              fontStyle: 'italic',
              color: 'var(--inkm)',
              padding: '8px',
              background: 'rgba(0,0,0,0.02)',
              borderRadius: '4px',
              border: '1px dashed var(--pb)',
              marginBottom: '12px',
            }}
          >
            Universalist wizards have no prohibited schools. You study all spells universally without restrictions.
          </div>
        ) : (
          <div
            style={{
              padding: '10px',
              background: 'rgba(139, 26, 26, 0.04)',
              border: '1px solid rgba(139, 26, 26, 0.25)',
              borderRadius: '4px',
              marginBottom: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '8px', fontFamily: 'var(--font-title)' }}>
              Prohibited Schools ({spec === 'div' ? '1 Required' : '2 Required'}):
            </div>

            {/* School 1 */}
            <div style={{ marginBottom: spec === 'div' ? '0' : '8px' }}>
              <label style={{ display: 'block', fontSize: '10.5px', color: 'var(--ink)', marginBottom: '2px' }}>
                Prohibited School 1:
              </label>
              <select
                value={prob1}
                onChange={(e) => setProb1(e.target.value)}
                className="cinput"
                style={{ width: '100%', height: '26px', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}
              >
                <option value="">-- Choose Prohibited School --</option>
                {availableProhibitions
                  .filter(s => s.value !== prob2)
                  .map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
              </select>
            </div>

            {/* School 2 (only for non-diviners) */}
            {spec !== 'div' && (
              <div>
                <label style={{ display: 'block', fontSize: '10.5px', color: 'var(--ink)', marginBottom: '2px' }}>
                  Prohibited School 2:
                </label>
                <select
                  value={prob2}
                  onChange={(e) => setProb2(e.target.value)}
                  className="cinput"
                  style={{ width: '100%', height: '26px', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}
                >
                  <option value="">-- Choose Prohibited School --</option>
                  {availableProhibitions
                    .filter(s => s.value !== prob1)
                    .map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ padding: '6px 10px', background: 'rgba(139, 26, 26, 0.15)', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginBottom: '10px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--pb)', paddingTop: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ fontSize: '11px', padding: '4px 14px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-p"
            style={{ fontSize: '11px', padding: '4px 16px', fontWeight: 'bold', fontFamily: 'var(--font-title)' }}
          >
            Save Specialization ✦
          </button>
        </div>
      </div>
    </DialogOverlay>
  );
};
