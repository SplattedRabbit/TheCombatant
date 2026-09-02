import React from 'react';
import { CombatState } from '@core/state.js';
import { getSpellSchoolCode, getSchoolCodeFromInput, getSchoolLabel, CombatSpells } from '@core/spells.js';
import { CombatRules } from '@core/rules.js';

function findSpell(pc: any, key: string) {
  if (CombatSpells.REGISTRY?.[key]) {
    return CombatSpells.REGISTRY[key];
  }
  if (Array.isArray(pc.customSpells)) {
    const found = pc.customSpells.find((s: any) => s.id === key || s.nameDe === key || s.nameEn === key);
    if (found) return found;
  }
  return null;
}

const showCustomAlert = (...args: any[]) =>
  (window as any).__REACT_DIALOG_BRIDGE__?.showCustomAlert?.(...args);

interface SpellDetailsDialogProps {
  spell: any;
  spellKey: string;
  pc: any;
  onClose: () => void;
}

export const SpellDetailsDialog: React.FC<SpellDetailsDialogProps> = ({ spell, spellKey, pc, onClose }) => {
  const isLearned = Array.isArray(pc.learnedSpells) && pc.learnedSpells.includes(spellKey);

  const handleToggleLearn = () => {
    const activePC = CombatState.getActivePC();
    if (!activePC) return;

    let shouldLearn = false;
    let idx = -1;
    if (Array.isArray(activePC.learnedSpells)) {
      idx = activePC.learnedSpells.indexOf(spellKey);
    }

    if (idx > -1) {
      // Unlearn
    } else {
      if (spell) {
        const isWizard = activePC.classes?.some((c: any) => c.classType === 'wizard');
        if (isWizard) {
          const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);
          if (schoolCode && schoolCode !== 'univ') {
            const prob1 = getSchoolCodeFromInput(activePC.wizardProhibited1);
            const prob2 = getSchoolCodeFromInput(activePC.wizardProhibited2);
            if (schoolCode === prob1 || schoolCode === prob2) {
              showCustomAlert(
                'Prohibited School',
                `You cannot learn the spell "${spell.nameEn || spell.nameDe}" because it belongs to the prohibited school "${getSchoolLabel(schoolCode)}"!`
              );
              return;
            }
          }
        }
        const check = CombatRules.checkSpellKnownLimit(activePC, spell, (k: string) => findSpell(activePC, k));
        if (!check.success) {
          showCustomAlert('Spell Limit Exceeded', check.error || 'You cannot learn any more known spells of this level.');
          return;
        }
      }
      shouldLearn = true;
    }

    CombatState.updatePCBatch((freshPc: any) => {
      if (!Array.isArray(freshPc.learnedSpells)) freshPc.learnedSpells = [];
      const freshIdx = freshPc.learnedSpells.indexOf(spellKey);
      if (shouldLearn) {
        if (freshIdx === -1) {
          freshPc.learnedSpells.push(spellKey);
        }
      } else {
        if (freshIdx > -1) {
          freshPc.learnedSpells.splice(freshIdx, 1);
        }
      }
    });

    onClose();
  };

  if (!spell) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(18, 11, 5, 0.55)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <div
          className="custom-alert-box"
          style={{
            background: 'var(--p)',
            border: '2px solid var(--pb)',
            borderRadius: '4px',
            padding: '16px 24px',
            minWidth: '300px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08)',
            fontFamily: 'var(--font-body)',
            position: 'relative',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />
          <p style={{ color: 'var(--ink)', fontSize: '11px', marginBottom: '12px' }}>Spell not found.</p>
          <button
            className="btn"
            onClick={onClose}
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '9px',
              padding: '3px 14px',
              cursor: 'pointer',
              borderColor: 'var(--pb)',
              background: 'transparent',
              color: 'var(--ink)'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const classLevelsText = Array.isArray(spell.classLevels)
    ? spell.classLevels.map((cl: any) => `${cl.class} ${cl.level}`).join(', ')
    : '';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.55)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '18px 20px',
          maxWidth: '520px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08)',
          fontFamily: 'var(--font-body)',
          position: 'relative',
          boxSizing: 'border-box'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        <div style={{ fontFamily: 'var(--font-title)', fontSize: '14px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px' }}>
          {spell.nameEn || spell.nameDe}
        </div>
        {spell.nameEn && spell.nameDe && spell.nameEn !== spell.nameDe && (
          <p style={{ margin: '0 0 8px', fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic' }}>{spell.nameDe}</p>
        )}
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 8px' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: '9px', marginBottom: '10px', color: 'var(--ink)' }}>
          {spell.school && <span><strong>School:</strong> {spell.school}</span>}
          {classLevelsText && <span><strong>Level:</strong> {classLevelsText}</span>}
          {spell.castingTime && <span><strong>Casting Time:</strong> {spell.castingTime}</span>}
          {spell.range && <span><strong>Range:</strong> {spell.range}</span>}
          {spell.duration && <span><strong>Duration:</strong> {spell.duration}</span>}
          {spell.savingThrow && <span><strong>Saving Throw:</strong> {spell.savingThrow}</span>}
          {spell.spellResistance && <span><strong>Spell Resistance:</strong> {spell.spellResistance}</span>}
        </div>

        {spell.description && (
          <p style={{ fontSize: '9px', lineHeight: 1.5, color: 'var(--ink)', margin: '0 0 14px' }}>
            {spell.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', position: 'relative', zIndex: 10 }}>
          <button
            className="btn btn-p"
            onClick={handleToggleLearn}
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '9px',
              padding: '3px 14px',
              cursor: 'pointer',
              minWidth: '90px'
            }}
          >
            {isLearned ? '✗ Unlearn' : '✓ Learn'}
          </button>
          <button
            className="btn"
            onClick={onClose}
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '9px',
              padding: '3px 14px',
              cursor: 'pointer',
              borderColor: 'var(--pb)',
              background: 'transparent',
              color: 'var(--ink)'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
