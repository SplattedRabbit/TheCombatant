/**
 * @module    SpellInspectorPanel
 * @summary   Right-column spell detail inspector for the Level-Up Spell Selection step.
 *            Displays RAW rules (school, level, components, description) for the hovered/selected spell.
 */

import React from 'react';

interface SpellInspectorPanelProps {
  previewSpell: any | null;
  chosenSpellKeys: string[];
  alreadyLearnedKeys: Set<string>;
  onToggleSpell: (key: string, spell: any) => void;
}

export const SpellInspectorPanel: React.FC<SpellInspectorPanelProps> = ({
  previewSpell,
  chosenSpellKeys,
  alreadyLearnedKeys,
  onToggleSpell,
}) => {
  return (
    <div
      className="custom-scrollbar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        borderRadius: '5px',
        border: '1.5px solid var(--pb)',
        background: 'linear-gradient(180deg, rgba(200, 169, 110, 0.08), rgba(200, 169, 110, 0.16))',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        maxHeight: '430px',
        overflowY: 'auto',
        scrollbarGutter: 'stable',
      }}
    >
      {previewSpell ? (
        <>
          <div style={{ borderBottom: '1px solid var(--pb)', paddingBottom: '6px', marginBottom: '4px' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '14px', fontWeight: 'bold', color: 'var(--red)' }}>
              {previewSpell.nameDe || previewSpell.name || previewSpell.nameEn}
            </div>
            {previewSpell.nameEn && previewSpell.nameEn !== previewSpell.nameDe && (
              <div style={{ fontSize: '10.5px', color: 'var(--inkm)', fontStyle: 'italic' }}>
                {previewSpell.nameEn}
              </div>
            )}
            <div style={{ fontSize: '10px', color: 'var(--red)', marginTop: '2px', fontWeight: 'bold' }}>
              {previewSpell.school}
            </div>
          </div>

          {/* Fast Facts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10.5px', marginBottom: '6px' }}>
            <div><strong>Level:</strong> {previewSpell.level}</div>
            <div><strong>Components:</strong> {previewSpell.components || 'V, S'}</div>
            <div><strong>Casting Time:</strong> {previewSpell.castingTime || '1 standard action'}</div>
            <div><strong>Range:</strong> {previewSpell.range || 'Close (25 ft. + 5 ft./2 levels)'}</div>
            <div><strong>Duration:</strong> {previewSpell.duration || 'Instantaneous'}</div>
            <div><strong>Saving Throw:</strong> {previewSpell.savingThrow || previewSpell.save || 'None'}</div>
            <div><strong>Spell Resistance:</strong> {previewSpell.spellResistance || previewSpell.sr || 'No'}</div>
          </div>

          {/* RAW Description */}
          <div
            style={{
              fontSize: '11px',
              color: 'var(--ink)',
              lineHeight: '1.4',
              whiteSpace: 'pre-wrap',
              borderTop: '0.5px dashed var(--pb)',
              paddingTop: '8px',
            }}
          >
            {previewSpell.description || previewSpell.desc || 'No description available.'}
          </div>

          {/* Action Button inside Inspector */}
          <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
            {!alreadyLearnedKeys.has(previewSpell.id || previewSpell.key) && (
              <button
                type="button"
                onClick={() => onToggleSpell(previewSpell.id || previewSpell.key, previewSpell)}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: chosenSpellKeys.includes(previewSpell.id || previewSpell.key) ? '#2e7d32' : 'var(--red)',
                  color: '#fff',
                  fontFamily: 'var(--font-title)',
                  fontWeight: 'bold',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                {chosenSpellKeys.includes(previewSpell.id || previewSpell.key) ? '✓ Deselect Spell' : '+ Add Spell to Selection'}
              </button>
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '40px 10px', textAlign: 'center', color: 'var(--inkl)', fontStyle: 'italic', fontSize: '11.5px' }}>
          Select a spell on the left to inspect its RAW rules details.
        </div>
      )}
    </div>
  );
};
