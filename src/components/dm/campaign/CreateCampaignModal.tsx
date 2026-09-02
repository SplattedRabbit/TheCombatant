/**
 * @module    CreateCampaignModal
 * @summary   Popup form for creating a new campaign with custom invite code in CampaignManagerDialog.
 */

import React, { useState } from 'react';

interface CreateCampaignModalProps {
  show: boolean;
  initialInviteCode: string;
  isActionInProgress: boolean;
  onClose: () => void;
  onSubmit: (name: string, desc: string, code: string) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  show,
  initialInviteCode,
  isActionInProgress,
  onClose,
  onSubmit,
}) => {
  const [newCampName, setNewCampName] = useState<string>('');
  const [newCampDesc, setNewCampDesc] = useState<string>('');
  const [newCampCode, setNewCampCode] = useState<string>(initialInviteCode);

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim()) return;
    onSubmit(newCampName.trim(), newCampDesc.trim(), newCampCode.trim());
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
          width: '340px',
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
          ➕ Create New Campaign
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
            Campaign Name:
          </label>
          <input
            type="text"
            required
            autoFocus
            className="modal-input"
            placeholder="e.g. Curse of Strahd"
            value={newCampName}
            onChange={(e) => setNewCampName(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
            Description / Notes:
          </label>
          <textarea
            rows={2}
            className="modal-textarea"
            placeholder="e.g. Wednesday group, Level 3-7..."
            value={newCampDesc}
            onChange={(e) => setNewCampDesc(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
            Invite Code:
          </label>
          <input
            type="text"
            className="modal-input"
            placeholder="e.g. STRAHD-42"
            value={newCampCode}
            onChange={(e) => setNewCampCode(e.target.value.toUpperCase())}
            style={{
              fontFamily: 'monospace',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          />
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
            disabled={!newCampName.trim() || isActionInProgress}
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
