import React from 'react';

interface SpellScrollDialogProps {
  spell: any;
  isLearned: boolean;
  onToggleLearn: () => void;
  onClose: () => void;
}

export const SpellScrollDialog: React.FC<SpellScrollDialogProps> = ({
  spell,
  isLearned,
  onToggleLearn,
  onClose
}) => {
  const range = spell.range || '—';
  const duration = spell.duration || '—';
  const savingThrow = spell.savingThrow || '—';
  const school = spell.school || '—';
  const level = spell.level !== undefined ? spell.level : '—';
  const sr = spell.spellResistance || '—';
  const components = spell.components || '—';
  const targetOrEffectOrArea = spell.targetOrEffectOrArea || '—';

  const actionText = isLearned
    ? "Do you want to REMOVE this spell from your spellbook?"
    : "Do you want to ADD this spell to your spellbook?";

  const handleConfirm = () => {
    onToggleLearn();
    onClose();
  };

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

        {/* Spell Parchment Section */}
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
            <div><strong>School:</strong> {school}</div>
            <div><strong>Level:</strong> Level {level}</div>
            <div><strong>Casting Time:</strong> {spell.castingTime || '1 standard action'}</div>
            <div><strong>Components:</strong> {components}</div>
            <div><strong>Range:</strong> {range}</div>
            <div><strong>Duration:</strong> {duration}</div>
            <div><strong>Saving Throw:</strong> {savingThrow}</div>
            <div><strong>Spell Resistance:</strong> {sr}</div>
            {targetOrEffectOrArea && targetOrEffectOrArea !== '—' && (
              <div style={{ gridColumn: 'span 2' }}>
                <strong>Target/Area/Effect:</strong> {targetOrEffectOrArea}
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

        {/* Action Section */}
        <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 'bold', fontFamily: 'var(--font-title)', letterSpacing: '0.3px' }}>
            {actionText}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={handleConfirm}
              className="btn btn-p pc-confirm-yes-btn"
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '9px',
                padding: '4px 22px',
                cursor: 'pointer',
                background: 'rgba(139, 26, 26, 0.1)',
                border: '1px solid var(--pb)',
                borderRadius: '2px',
                color: 'var(--red)',
                fontWeight: 'bold',
                transition: 'background-color 0.15s, color 0.15s',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(139, 26, 26, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(139, 26, 26, 0.1)';
              }}
            >
              Yes
            </button>
            <button
              onClick={onClose}
              className="btn pc-confirm-no-btn"
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
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
