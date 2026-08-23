/**
 * @module    JoinCampaignDialog
 * @summary   Modal dialog allowing players to enter an invite code and select
 *            one of their characters from the roster to join a DM's campaign.
 */

import React, { useState, useEffect } from 'react';
import type { CharacterSummary } from '../../types/character.ts';
import { characterService } from '../../services/character/CharacterService.ts';
import { campaignService } from '../../services/campaign/CampaignService.ts';

interface JoinCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined?: (campaignId: string) => void;
}

export const JoinCampaignDialog: React.FC<JoinCampaignDialogProps> = ({
  isOpen,
  onClose,
  onJoined,
}) => {
  const [inviteCode, setInviteCode] = useState<string>('');
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      characterService.listCharacters().then((list) => {
        setCharacters(list);
        if (list.length > 0) {
          const active = list.find((c) => c.isCurrentActive) || list[0];
          setSelectedCharId(active.id);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const member = await campaignService.joinCampaignByCode(inviteCode.trim(), selectedCharId || null);
      if (member) {
        alert(`Successfully joined campaign!`);
        if (onJoined) onJoined(member.campaignId);
        onClose();
      } else {
        setErrorMessage(`No active campaign found with invite code "${inviteCode.trim().toUpperCase()}".`);
      }
    } catch (err) {
      setErrorMessage('Error joining campaign: ' + String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 10, 5, 0.75)',
        backdropFilter: 'blur(3px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <form
        onSubmit={handleJoin}
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'var(--parchment, #fdf6e2)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '8px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>🎲</span>
            <h3
              style={{
                margin: 0,
                fontFamily: "'IM Fell English SC', serif",
                fontSize: '16px',
                color: 'var(--red, #8b1a1a)',
              }}
            >
              Join Campaign
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{
              padding: '2px 8px',
              fontSize: '12px',
              cursor: 'pointer',
              border: '1px solid var(--pb)',
              background: 'transparent',
              borderRadius: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '6px 10px',
              background: 'rgba(139, 26, 26, 0.1)',
              border: '1px solid rgba(139, 26, 26, 0.3)',
              borderRadius: '4px',
              color: 'var(--red)',
              fontSize: '11px',
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        <div>
          <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px' }}>
            DM Invite Code:
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="e.g. RAVEN-42"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: '13px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              border: '1px solid var(--pb)',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px' }}>
            Select Character:
          </label>
          {characters.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--inkm)', fontStyle: 'italic' }}>
              No characters found in your roster.
            </div>
          ) : (
            <select
              value={selectedCharId}
              onChange={(e) => setSelectedCharId(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '12px',
                border: '1px solid var(--pb)',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            >
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Level {c.level} {c.classSummary})
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ padding: '5px 12px', fontSize: '11px' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!inviteCode.trim() || isLoading}
            className="btn btn-p"
            style={{
              padding: '5px 14px',
              fontSize: '11px',
              fontFamily: "'IM Fell English SC', serif",
              background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
              border: '1px solid #8b6914',
              color: '#ffffff',
            }}
          >
            {isLoading ? 'Joining...' : '🎲 Join Table'}
          </button>
        </div>
      </form>
    </div>
  );
};
