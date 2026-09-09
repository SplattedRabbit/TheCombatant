/**
 * @module    GrimoireTemplateMenu
 * @summary   Dropdown menu for spell preparation templates (Save, Load, Clear).
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { showCustomConfirm } from '@core/ui/components/dialogs.js';
import { saveCurrentTemplate, loadTemplate, deleteTemplate } from './grimoireActions';

interface GrimoireTemplateMenuProps {
  pc: any;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const GrimoireTemplateMenu: React.FC<GrimoireTemplateMenuProps> = ({
  pc,
  isOpen,
  onToggle,
  onClose,
}) => {
  const templates = pc.spellTemplates || {};
  const templateNames = Object.keys(templates);

  const handleClearSlots = () => {
    showCustomConfirm('Clear Slots?', 'Remove all prepared spells from your slots?', () => {
      CombatState.clearPreparedSpells();
      onClose();
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={onToggle}
        className="btn"
        style={{
          fontSize: '7.5px',
          padding: '1px 5px',
          height: '18px',
          fontFamily: 'var(--font-title)',
          cursor: 'pointer',
          border: '0.5px solid var(--pb)',
          background: isOpen ? 'rgba(200, 169, 110, 0.3)' : 'transparent',
        }}
        title="Manage spell preparation templates"
      >
        💾 Templates ▾
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '22px',
            zIndex: 1000,
            backgroundColor: '#f4e8c1',
            background: 'var(--p, #f4e8c1)',
            border: '1.5px solid var(--pb)',
            borderRadius: '4px',
            padding: '6px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
            minWidth: '170px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '8.5px',
              fontWeight: 'bold',
              color: 'var(--red)',
              borderBottom: '0.5px solid var(--pb)',
              paddingBottom: '2px',
            }}
          >
            Spell Templates
          </div>

          <button
            type="button"
            onClick={() => {
              saveCurrentTemplate(pc);
              onClose();
            }}
            className="btn"
            style={{
              fontSize: '8px',
              textAlign: 'left',
              padding: '2px 5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>💾</span> Save Current as Template...
          </button>

          {templateNames.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
              <span style={{ fontSize: '7px', color: 'var(--inkl)', fontStyle: 'italic' }}>
                Load Template:
              </span>
              {templateNames.map((name) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0, 0, 0, 0.02)',
                    border: '0.5px solid rgba(200, 169, 110, 0.2)',
                    borderRadius: '2px',
                    padding: '2px 4px',
                  }}
                >
                  <span
                    onClick={() => {
                      loadTemplate(name);
                      onClose();
                    }}
                    style={{
                      fontSize: '8px',
                      fontFamily: 'var(--font-title)',
                      color: 'var(--red)',
                      cursor: 'pointer',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={`Load "${name}"`}
                  >
                    📄 {name}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteTemplate(name)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--inkl)',
                      fontSize: '7.5px',
                      cursor: 'pointer',
                      padding: '0 2px',
                    }}
                    title="Delete template"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleClearSlots}
            className="btn"
            style={{
              fontSize: '8px',
              color: 'var(--inkl)',
              textAlign: 'left',
              padding: '2px 5px',
              borderTop: '0.5px dashed rgba(0, 0, 0, 0.1)',
              marginTop: '3px',
              cursor: 'pointer',
            }}
          >
            <span>🗑️</span> Clear All Slots
          </button>
        </div>
      )}
    </div>
  );
};
