/**
 * @module    CreateCharacterModal
 * @summary   Modal form popup for quick creation of a new PC with name and starting class.
 */

import React, { useState } from 'react';

interface CreateCharacterModalProps {
  show: boolean;
  isActionInProgress: boolean;
  onClose: () => void;
  onSubmit: (name: string, startingClass: string) => void;
}

export const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({
  show,
  isActionInProgress,
  onClose,
  onSubmit,
}) => {
  const [newCharName, setNewCharName] = useState<string>('');
  const [newCharClass, setNewCharClass] = useState<string>('Fighter');

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim()) return;
    onSubmit(newCharName.trim(), newCharClass);
  };

  return (
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
        style={{
          width: '320px',
          background: 'var(--parchment, #fdf6e2)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '6px',
          padding: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '15px', color: 'var(--red)', fontWeight: 'bold' }}>
          ➕ New Character
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
            Character Name:
          </label>
          <input
            type="text"
            required
            autoFocus
            className="modal-input"
            placeholder="e.g. Valeros"
            value={newCharName}
            onChange={(e) => setNewCharName(e.target.value)}
          />
        </div>

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
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
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
            disabled={!newCharName.trim() || isActionInProgress}
            className="btn btn-p"
            style={{
              padding: '4px 12px',
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
            Create
          </button>
        </div>
      </form>
    </div>
  );
};
