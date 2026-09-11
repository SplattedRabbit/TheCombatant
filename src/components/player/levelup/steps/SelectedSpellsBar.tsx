/**
 * @module    SelectedSpellsBar
 * @summary   Persistent pill-bar showing already-chosen spells in the Level-Up Spell Selection step.
 *            Allows quick deselection and clicking a pill to inspect the spell in the inspector.
 */

import React from 'react';

interface SelectedSpellsBarProps {
  chosenSpells: any[];
  chosenSpellKeys: string[];
  quota: { totalSpellsToChoose: number; casterClass: string };
  previewSpell: any | null;
  onPreview: (spell: any) => void;
  onRemove: (key: string, spell: any) => void;
}

export const SelectedSpellsBar: React.FC<SelectedSpellsBarProps> = ({
  chosenSpells,
  chosenSpellKeys,
  quota,
  previewSpell,
  onPreview,
  onRemove,
}) => {
  if (chosenSpellKeys.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '8px 12px',
        background: 'rgba(200, 169, 110, 0.12)',
        border: '1px solid var(--pb)',
        borderRadius: '5px',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 'bold',
          color: 'var(--red)',
          fontFamily: 'var(--font-title)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span>✨</span> Selected Spells ({chosenSpellKeys.length}/{quota.totalSpellsToChoose}):
      </span>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        {chosenSpells.map(sp => {
          const clMatch = Array.isArray(sp.classLevels)
            ? sp.classLevels.find((cl: any) => cl.class === quota.casterClass)
            : null;
          const spLvl = clMatch ? clMatch.level : sp.level;
          const isInspected = previewSpell && (previewSpell.id === (sp.id || sp.key) || previewSpell.key === (sp.id || sp.key));

          return (
            <div
              key={sp.id || sp.key}
              onClick={() => onPreview(sp)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                borderRadius: '12px',
                background: isInspected ? 'rgba(139, 26, 26, 0.08)' : 'rgba(255, 255, 255, 0.85)',
                border: isInspected ? '1.5px solid var(--red)' : '1px solid var(--pb)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                fontSize: '11px',
                color: 'var(--ink)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Click to view RAW rules in inspector"
            >
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 'bold',
                  color: '#fff',
                  background: 'var(--red)',
                  borderRadius: '8px',
                  padding: '1px 5px',
                  lineHeight: 1.2,
                }}
              >
                Lvl {spLvl ?? '?'}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                {sp.nameDe || sp.name || sp.nameEn}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(sp.id || sp.key, sp);
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--inkm)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  lineHeight: 1,
                  padding: '0 2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--inkm)')}
                title="Remove spell"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
