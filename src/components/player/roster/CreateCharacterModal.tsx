/**
 * @module    CreateCharacterModal
 * @summary   Modal form popup for quick creation of a new PC with name and starting class.
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface CreateCharacterModalProps {
  show: boolean;
  isActionInProgress: boolean;
  onClose: () => void;
  onSubmit: (name: string, startingClass: string, mode: 'wizard' | 'empty') => void;
}

export const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({
  show,
  isActionInProgress,
  onClose,
  onSubmit,
}) => {
  const [mode, setMode] = useState<'wizard' | 'empty'>('wizard');
  const [newCharName, setNewCharName] = useState<string>('');
  const [newCharClass, setNewCharClass] = useState<string>('Fighter');

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'empty' && !newCharName.trim()) return;
    onSubmit(newCharName.trim(), newCharClass, mode);
  };

  const content = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="custom-alert-box"
        style={{
          width: '360px',
          background: 'var(--parchment, #fdf6e2)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '6px',
          padding: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '15px', color: 'var(--red)', fontWeight: 'bold' }}>
          ➕ New Character
        </div>

        {/* Creation Mode Selection Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setMode('wizard')}
            style={{
              padding: '8px 10px',
              borderRadius: '4px',
              border: mode === 'wizard' ? '1.5px solid var(--red)' : '1px solid var(--pb)',
              background: mode === 'wizard' ? 'rgba(192, 57, 43, 0.1)' : 'rgba(200, 169, 110, 0.08)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '18px' }}>🧙‍♂️</span>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: mode === 'wizard' ? 'var(--red)' : 'var(--ink)' }}>
              Creation Wizard
            </span>
            <span style={{ fontSize: '8.5px', color: 'var(--inkm)', lineHeight: 1.2 }}>
              Guided step-by-step creation with Point-Buy &amp; Feats
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode('empty')}
            style={{
              padding: '8px 10px',
              borderRadius: '4px',
              border: mode === 'empty' ? '1.5px solid var(--red)' : '1px solid var(--pb)',
              background: mode === 'empty' ? 'rgba(192, 57, 43, 0.1)' : 'rgba(200, 169, 110, 0.08)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '18px' }}>📄</span>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: mode === 'empty' ? 'var(--red)' : 'var(--ink)' }}>
              Empty Character
            </span>
            <span style={{ fontSize: '8.5px', color: 'var(--inkm)', lineHeight: 1.2 }}>
              Blank level 1 template to fill in manually
            </span>
          </button>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
            Character Name {mode === 'wizard' ? '(Optional):' : ':'}
          </label>
          <input
            type="text"
            autoFocus
            className="modal-input"
            placeholder={mode === 'wizard' ? 'e.g. Valeros (or set in wizard)' : 'e.g. Valeros'}
            value={newCharName}
            onChange={(e) => setNewCharName(e.target.value)}
          />
        </div>

        {mode === 'empty' && (
          <div>
            <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
              Starting Class:
            </label>
            <select
              className="modal-select"
              value={newCharClass}
              onChange={(e) => setNewCharClass(e.target.value)}
            >
              <option value="Fighter">Fighter</option>
              <option value="Barbarian">Barbarian</option>
              <option value="Cleric">Cleric</option>
              <option value="Wizard">Wizard</option>
              <option value="Rogue">Rogue</option>
              <option value="Paladin">Paladin</option>
              <option value="Ranger">Ranger</option>
              <option value="Druid">Druid</option>
              <option value="Bard">Bard</option>
              <option value="Monk">Monk</option>
              <option value="Sorcerer">Sorcerer</option>
              <option value="Duskblade">Duskblade</option>
              <option value="Knight">Knight</option>
              <option value="Beguiler">Beguiler</option>
              <option value="Dragon Shaman">Dragon Shaman</option>
            </select>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-title)',
              background: 'rgba(200, 169, 110, 0.2)',
              border: '1px solid var(--pb)',
              borderRadius: '3px',
              cursor: 'pointer',
              color: 'var(--ink)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isActionInProgress || (mode === 'empty' && !newCharName.trim())}
            className="btn btn-p"
            style={{
              padding: '4px 14px',
              fontSize: '11px',
              fontFamily: 'var(--font-title)',
              background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
              border: '1px solid #8b6914',
              borderRadius: '3px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {mode === 'wizard' ? '🧙‍♂️ Launch Wizard' : 'Create Character'}
          </button>
        </div>
      </form>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
