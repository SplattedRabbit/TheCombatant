/**
 * @module    RosterToolbar
 * @summary   Header and action bar toolbar for CharacterRosterDialog.
 */

import React from 'react';

interface RosterToolbarProps {
  characterCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  onOpenCreateModal: () => void;
  onOpenWizard?: () => void;
  onSaveActiveToRoster: () => void;
  onImportJsonClick: () => void;
  onImportFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportLocal: () => void;
  isActionInProgress: boolean;
}

export const RosterToolbar: React.FC<RosterToolbarProps> = ({
  characterCount,
  searchQuery,
  onSearchChange,
  onClose,
  onOpenCreateModal,
  onOpenWizard,
  onSaveActiveToRoster,
  onImportJsonClick,
  onImportFileChange,
  onImportLocal,
  isActionInProgress,
}) => {
  return (
    <>
      {/* Header */}
      <div
        style={{
          padding: '12px 18px',
          borderBottom: '1.5px solid var(--pb, #c8a96e)',
          background: 'linear-gradient(180deg, rgba(200, 169, 110, 0.25), rgba(200, 169, 110, 0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>📜</span>
          <div>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-title)',
                fontSize: '18px',
                color: 'var(--red, #8b1a1a)',
                lineHeight: 1.1,
              }}
            >
              Character Roster
            </h2>
            <div style={{ fontSize: '10.5px', color: 'var(--inkm, #665c49)', fontFamily: 'var(--font-body)' }}>
              {characterCount} {characterCount === 1 ? 'Character' : 'Characters'} available
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            className="modal-input"
            placeholder="🔍 Search characters..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '160px',
              minHeight: '26px',
              height: '26px',
              padding: '2px 8px',
              fontSize: '11.5px',
              background: 'rgba(255, 255, 255, 0.85)',
            }}
          />
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{
              padding: '3px 9px',
              fontSize: '14px',
              cursor: 'pointer',
              color: 'var(--ink, #2c2214)',
              border: '1px solid var(--pb)',
              background: 'transparent',
              borderRadius: '4px',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div
        style={{
          padding: '8px 18px',
          borderBottom: '1px solid rgba(200, 169, 110, 0.4)',
          background: 'rgba(253, 246, 226, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="btn btn-p"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            fontSize: '11px',
            fontFamily: 'var(--font-title)',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
            border: '1px solid #8b6914',
            color: '#ffffff',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
        >
          <span>➕</span>
          <span>New Character</span>
        </button>

        {onOpenWizard && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenWizard();
            }}
            className="btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-title)',
              background: 'rgba(200, 169, 110, 0.2)',
              border: '1px solid var(--pb)',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            <span>🧙</span>
            <span>Create via Wizard</span>
          </button>
        )}

        <button
          type="button"
          onClick={onSaveActiveToRoster}
          disabled={isActionInProgress}
          className="btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            fontSize: '11px',
            fontFamily: 'var(--font-title)',
            background: 'rgba(5, 150, 105, 0.15)',
            border: '1px solid #059669',
            color: '#065f46',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
          title="Saves currently loaded character directly into your roster library"
        >
          <span>💾</span>
          <span>Save Active to Roster</span>
        </button>

        <button
          type="button"
          onClick={onImportJsonClick}
          disabled={isActionInProgress}
          className="btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            fontSize: '11px',
            fontFamily: 'var(--font-title)',
            background: 'rgba(200, 169, 110, 0.2)',
            border: '1px solid var(--pb)',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
          title="Import character from a JSON file directly into your roster"
        >
          <span>📁</span>
          <span>Import JSON</span>
        </button>

        <input
          type="file"
          id="rosterImportFileInput"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={onImportFileChange}
        />

        <button
          type="button"
          onClick={onImportLocal}
          disabled={isActionInProgress}
          className="btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            fontSize: '11px',
            fontFamily: 'var(--font-title)',
            background: 'rgba(200, 169, 110, 0.1)',
            border: '1px solid var(--pb)',
            borderRadius: '3px',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
          title="Imports current local character into your cloud library"
        >
          <span>📥</span>
          <span>Import from LocalStorage</span>
        </button>
      </div>
    </>
  );
};
