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
  const nameEn = spell.nameEn ? ` (${spell.nameEn})` : '';
  const range = spell.range || '—';
  const duration = spell.duration || '—';
  const savingThrow = spell.savingThrow || '—';
  const school = spell.school || '—';
  const level = spell.level !== undefined ? spell.level : '—';
  const sr = spell.spellResistance || '—';
  const components = spell.components || '—';
  const targetOrEffectOrArea = spell.targetOrEffectOrArea || '—';

  const actionText = isLearned
    ? "Möchtest du diesen Zauber aus deinem Zauberbuch ENTFERNEN?"
    : "Möchtest du diesen Zauber in dein Zauberbuch LEGEN?";

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
    >
      <div
        className="custom-scroll-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '16px 20px',
          width: '580px',
          maxWidth: '92vw',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.1)',
          fontFamily: "'IM Fell English SC', serif",
          textAlign: 'center',
          position: 'relative',
          transform: 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        {/* Spell Parchment Section */}
        <div
          className="ancient-parchment"
          style={{
            background: '#f4e8c1',
            border: '2px solid #8b1a1a',
            padding: '16px 20px',
            borderRadius: '4px',
            boxShadow: 'inset 0 0 35px rgba(139, 26, 26, 0.15)',
            fontFamily: "'Crimson Text', serif",
            color: '#1a0f00',
            lineHeight: 1.45,
            textAlign: 'left',
            maxHeight: '52vh',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}
        >
          <h3
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '15px',
              color: '#8b1a1a',
              textAlign: 'center',
              borderBottom: '2px solid #8b1a1a',
              paddingBottom: '6px',
              margin: '0 0 10px 0',
              letterSpacing: '0.8px',
              fontWeight: 'bold'
            }}
          >
            {spell.nameDe}{nameEn}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px 14px',
              fontSize: '9.5px',
              borderBottom: '0.5px dashed rgba(139, 26, 26, 0.4)',
              paddingBottom: '8px',
              marginBottom: '10px',
              fontWeight: 600
            }}
          >
            <div><strong>Schule:</strong> {school}</div>
            <div><strong>Grad:</strong> Grad {level}</div>
            <div><strong>Zeitaufwand:</strong> {spell.castingTime || '1 Standardaktion'}</div>
            <div><strong>Komponenten:</strong> {components}</div>
            <div><strong>Reichweite:</strong> {range}</div>
            <div><strong>Wirkungsdauer:</strong> {duration}</div>
            <div><strong>Rettungswurf:</strong> {savingThrow}</div>
            <div><strong>Zauberresistenz:</strong> {sr}</div>
            <div style={{ gridColumn: 'span 2' }}><strong>Ziel/Effekt/Bereich:</strong> {targetOrEffectOrArea}</div>
          </div>
          <div
            style={{
              fontSize: '10.5px',
              whiteSpace: 'pre-wrap',
              fontStyle: 'italic',
              lineHeight: 1.5,
              color: '#2a1b0a'
            }}
          >
            {spell.description || 'Keine Beschreibung vorhanden.'}
          </div>
        </div>

        {/* Action Section */}
        <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif", letterSpacing: '0.5px' }}>
            {actionText}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={handleConfirm}
              className="btn btn-p pc-confirm-yes-btn"
              style={{
                fontFamily: "'IM Fell English SC', serif",
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
              Ja
            </button>
            <button
              onClick={onClose}
              className="btn pc-confirm-no-btn"
              style={{
                fontFamily: "'IM Fell English SC', serif",
                fontSize: '9px',
                padding: '4px 22px',
                cursor: 'pointer',
                background: 'transparent',
                border: '1px solid var(--pb)',
                borderRadius: '2px',
                color: 'var(--inkl)',
                transition: 'background-color 0.15s, color 0.15s',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(200, 169, 110, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Nein
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
