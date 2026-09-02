/**
 * @module    ItemEffectsEditor
 * @summary   Passive Modifiers & Effects editor (type, target, value, bonusType) for ItemEditorModal.
 */

import React from 'react';

interface ItemEffectsEditorProps {
  effects: any[];
  onAddEffect: () => void;
  onRemoveEffect: (idx: number) => void;
  onEffectChange: (idx: number, field: string, val: any) => void;
}

export const ItemEffectsEditor: React.FC<ItemEffectsEditorProps> = ({
  effects,
  onAddEffect,
  onRemoveEffect,
  onEffectChange,
}) => {
  return (
    <div style={{ background: 'rgba(200, 169, 110, 0.08)', border: '1px solid var(--pb)', borderRadius: '3px', padding: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
          Passive Modifiers & Effects ({effects.length})
        </span>
        <button
          type="button"
          onClick={onAddEffect}
          className="btn btn-p"
          style={{ fontSize: '8px', padding: '1px 5px' }}
        >
          + Add Effect
        </button>
      </div>

      {effects.map((eff, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '3px', alignItems: 'center', marginBottom: '3px' }}>
          <select
            value={eff.type}
            onChange={(e) => onEffectChange(idx, 'type', e.target.value)}
            className="cinput"
            style={{ width: '80px', fontSize: '9px', height: '22px' }}
          >
            <option value="attribute">Attribute</option>
            <option value="save">Save</option>
            <option value="ac">Armor Class</option>
            <option value="skill">Skill</option>
            <option value="speed">Speed</option>
          </select>

          <input
            type="text"
            value={eff.target}
            onChange={(e) => onEffectChange(idx, 'target', e.target.value)}
            placeholder="Target (str, fort...)"
            className="cinput"
            style={{ width: '70px', fontSize: '9px', height: '22px', padding: '1px 3px' }}
          />

          <input
            type="number"
            value={eff.value}
            onChange={(e) => onEffectChange(idx, 'value', parseInt(e.target.value) || 0)}
            className="cinput"
            style={{ width: '40px', fontSize: '9px', height: '22px', textAlign: 'center' }}
          />

          <select
            value={eff.bonusType}
            onChange={(e) => onEffectChange(idx, 'bonusType', e.target.value)}
            className="cinput"
            style={{ width: '90px', fontSize: '9px', height: '22px' }}
          >
            <option value="enhancement">Enhancement</option>
            <option value="deflection">Deflection</option>
            <option value="natural_enhancement">Natural Enh.</option>
            <option value="resistance">Resistance</option>
            <option value="competence">Competence</option>
            <option value="morale">Morale</option>
            <option value="luck">Luck</option>
            <option value="insight">Insight</option>
            <option value="dodge">Dodge</option>
            <option value="untyped">Untyped</option>
          </select>

          <button
            type="button"
            onClick={() => onRemoveEffect(idx)}
            className="xbtn"
            style={{ fontSize: '8.5px', padding: '1px 4px' }}
            title="Remove effect"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
