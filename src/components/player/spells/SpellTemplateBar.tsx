/**
 * @module    SpellTemplateBar
 * @summary   Template management bar (Load, Save, Delete, Clear) for PCSpellPreparation.
 */

import React from 'react';

export interface SpellTemplateBarProps {
  templates: Record<string, any>;
  selectedTemplate: string;
  onLoadTemplate: (name: string) => void;
  onSaveTemplate: () => void;
  onDeleteTemplate: () => void;
  onClearPrepared: () => void;
}

export const SpellTemplateBar: React.FC<SpellTemplateBarProps> = ({
  templates,
  selectedTemplate,
  onLoadTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onClearPrepared,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(200, 169, 110, 0.06)',
        border: '0.5px solid rgba(200, 169, 110, 0.2)',
        borderRadius: '2px',
        padding: '3px 5px',
        marginBottom: '6px',
      }}
    >
      <span style={{ fontSize: '8.5px', color: 'var(--inkl)', fontWeight: 'bold' }}>Templates:</span>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
        <select
          value={selectedTemplate}
          onChange={(e) => onLoadTemplate(e.target.value)}
          className="cinput select-spell-template"
          style={{
            fontSize: '8px',
            padding: '1px 3px',
            height: '16px',
            maxWidth: '95px',
            borderRadius: '1px',
            border: '0.5px solid var(--pb)',
            outline: 'none',
            background: 'white',
            color: 'var(--ink)',
          }}
        >
          <option value="">-- Load --</option>
          {Object.keys(templates).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button
          onClick={onSaveTemplate}
          className="btn"
          style={{
            fontSize: '8px',
            padding: '1px 4px',
            height: '16px',
            lineHeight: 1,
            fontWeight: 'bold',
            borderColor: 'var(--pb)',
          }}
          title="Save current set as template"
        >
          💾 Save
        </button>
        <button
          onClick={onDeleteTemplate}
          className="btn"
          style={{
            fontSize: '8px',
            padding: '1px 3px',
            height: '16px',
            lineHeight: 1,
            borderColor: 'transparent',
            color: 'var(--inkl)',
          }}
          title="Delete selected template"
        >
          ✕
        </button>
        <button
          onClick={onClearPrepared}
          className="btn"
          style={{
            fontSize: '8px',
            padding: '1px 4px',
            height: '16px',
            lineHeight: 1,
            borderColor: 'var(--red)',
            background: 'rgba(139,26,26,0.05)',
            color: 'var(--red)',
            fontWeight: 'bold',
          }}
          title="Remove all prepared spells"
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
};
