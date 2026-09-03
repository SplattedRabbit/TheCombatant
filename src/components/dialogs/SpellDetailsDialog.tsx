import React from 'react';
import { CombatState } from '@core/state.js';
import { CombatSpells } from '@core/spells.js';
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
  const learnEligibility = React.useMemo(() => {
    if (isLearned || !spell) return { allowed: true };
    return CombatRules.validateSpellLearnEligibility(pc, spell, (k: string) => findSpell(pc, k));
  }, [isLearned, spell, pc]);

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
        const validation = CombatRules.validateSpellLearnEligibility(activePC, spell, (k: string) => findSpell(activePC, k));
        if (!validation.allowed) {
          showCustomAlert(validation.title || 'Spell Not Eligible', validation.reason || 'You cannot learn this spell.');
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
        id="spellScrollOverlay"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(18, 11, 5, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="custom-scroll-box"
          style={{
            background: 'var(--p)',
            border: '2px solid var(--pb)',
            borderRadius: '4px',
            padding: '14px 18px',
            width: '400px',
            maxWidth: '92vw',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.1)',
            fontFamily: 'var(--font-title)',
            textAlign: 'center',
            position: 'relative'
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
              padding: '4px 18px',
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
    : Array.isArray(spell.classes)
    ? spell.classes.join(', ')
    : '';

  return (
    <div
      id="spellScrollOverlay"
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="custom-scroll-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '14px 18px',
          width: '540px',
          maxWidth: '92vw',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.1)',
          fontFamily: 'var(--font-title)',
          textAlign: 'center',
          position: 'relative',
          transform: 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        {/* Parchment Section */}
        <div
          className="ancient-parchment"
          style={{
            background: '#f4e8c1',
            border: '2px solid #8b1a1a',
            padding: '12px 16px',
            borderRadius: '4px',
            boxShadow: 'inset 0 0 35px rgba(139, 26, 26, 0.15)',
            fontFamily: 'var(--font-body)',
            color: '#1a0f00',
            lineHeight: 1.4,
            textAlign: 'left',
            maxHeight: '54vh',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '13.5px',
              color: '#8b1a1a',
              textAlign: 'center',
              borderBottom: '2px solid #8b1a1a',
              paddingBottom: '4px',
              margin: '0 0 6px 0',
              letterSpacing: '0.8px',
              fontWeight: 'bold'
            }}
          >
            {spell.nameEn || spell.nameDe}
          </h3>

          {spell.nameEn && spell.nameDe && spell.nameEn !== spell.nameDe && (
            <div
              style={{
                fontSize: '9.5px',
                color: '#6a4a2a',
                fontStyle: 'italic',
                textAlign: 'center',
                marginTop: '-4px',
                marginBottom: '6px'
              }}
            >
              {spell.nameDe}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px 10px',
              fontSize: '9px',
              borderBottom: '0.5px dashed rgba(139, 26, 26, 0.3)',
              paddingBottom: '6px',
              marginBottom: '8px',
              fontWeight: 'bold'
            }}
          >
            <div><strong>School:</strong> {spell.school || '—'}</div>
            <div><strong>Level:</strong> {spell.level !== undefined ? `Level ${spell.level}` : '—'}</div>
            <div><strong>Casting Time:</strong> {spell.castingTime || '1 standard action'}</div>
            <div><strong>Components:</strong> {spell.components || 'V, S'}</div>
            <div><strong>Range:</strong> {spell.range || 'Touch'}</div>
            <div><strong>Duration:</strong> {spell.duration || 'Instantaneous'}</div>
            <div><strong>Saving Throw:</strong> {spell.savingThrow || 'None'}</div>
            <div><strong>Spell Resistance:</strong> {spell.spellResistance || 'No'}</div>
            {spell.targetOrEffectOrArea && (
              <div style={{ gridColumn: 'span 2' }}>
                <strong>Target/Area/Effect:</strong> {spell.targetOrEffectOrArea}
              </div>
            )}
            {classLevelsText && (
              <div style={{ gridColumn: 'span 2' }}>
                <strong>Classes:</strong> {classLevelsText}
              </div>
            )}
          </div>

          <div style={{ fontSize: '9.5px', marginBottom: '4px', lineHeight: 1.35 }}>
            <strong style={{ color: '#8b1a1a', fontFamily: 'var(--font-title)' }}>Description:</strong>
            <div style={{ fontStyle: 'normal', color: '#2a1b0a', paddingLeft: '2px', marginTop: '2px', whiteSpace: 'pre-wrap' }}>
              {spell.description || 'No description available.'}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div style={{ marginTop: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
            <div style={{ fontSize: '10px', color: isLearned ? '#8b1a1a' : (learnEligibility.allowed ? 'var(--red)' : '#8b1a1a'), fontWeight: 'bold', fontFamily: 'var(--font-title)', letterSpacing: '0.3px', textAlign: 'center', padding: '0 8px' }}>
              {isLearned
                ? 'This spell is currently in your spellbook.'
                : learnEligibility.allowed
                ? 'Do you want to learn this spell?'
                : (learnEligibility.reason || 'This spell cannot be learned by your class.')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', width: '100%' }}>
              <button
                onClick={handleToggleLearn}
                className={`btn ${isLearned ? 'btn-unlearn-feat' : 'btn-p btn-learn-feat'}`}
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '9px',
                  padding: '4px 22px',
                  cursor: 'pointer',
                  background: isLearned ? 'rgba(139, 26, 26, 0.1)' : (learnEligibility.allowed ? 'rgba(42, 106, 42, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
                  border: `1px solid ${isLearned ? '#8b1a1a' : (learnEligibility.allowed ? '#2a6a2a' : 'rgba(139, 26, 26, 0.4)')}`,
                  borderRadius: '2px',
                  color: isLearned ? '#8b1a1a' : (learnEligibility.allowed ? '#2a6a2a' : 'var(--inkl)'),
                  opacity: (!isLearned && !learnEligibility.allowed) ? 0.65 : 1,
                  fontWeight: 'bold',
                  transition: 'background-color 0.15s, color 0.15s',
                  outline: 'none'
                }}
                title={!isLearned && !learnEligibility.allowed ? learnEligibility.reason : undefined}
              >
                {isLearned ? 'Unlearn' : 'Learn'}
              </button>
              <button
                onClick={onClose}
                className="btn btn-close-feat"
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '9px',
                  padding: '4px 22px',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: '1px solid var(--pb)',
                  borderRadius: '2px',
                  color: 'var(--inkl)',
                  transition: 'all 0.15s ease',
                  outline: 'none'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
