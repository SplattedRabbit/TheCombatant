/**
 * @module    JoinCampaignDialog
 * @summary   Modal dialog allowing players to enter an invite code and select
 *            one of their characters from the roster to join a DM's campaign.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { CharacterSummary } from '../../types/character.ts';
import { CombatState } from '@core/state.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';
import { characterService } from '../../services/character/CharacterService.ts';
import { campaignService } from '../../services/campaign/CampaignService.ts';
import { realtimeManager } from '../../services/network/RealtimeManager.ts';
import { broadcastActivePC } from '../../services/network/RealtimeSyncBridge.ts';

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

  // Load user's characters on mount / open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      characterService
        .listCharacters()
        .then((chars) => {
          setCharacters(chars);
          if (chars.length > 0 && !selectedCharId) {
            const active = chars.find((c) => c.isCurrentActive) || chars[0];
            setSelectedCharId(active.id);
          }
        })
        .catch((err) => {
          console.warn('[JoinCampaignDialog] Could not load characters:', err);
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

      // 1. Activate selected character on client screen
      if (selectedCharId) {
        await characterService.switchActiveCharacter(selectedCharId);
      }

      // Ensure player role is active
      CombatState.setRole('player');

      // 2. Join campaign table
      const member = await campaignService.joinCampaignByCode(inviteCode.trim(), selectedCharId || null);
      if (member) {
        const activePC = CombatState.getActivePC();
        const selectedChar = characters.find((c) => c.id === selectedCharId);
        const charName = activePC?.name || selectedChar?.name || 'Player';

        // 3. Connect live WebSocket to DM's table
        await realtimeManager.joinCampaign(member.campaignId, 'player', {
          userId: member.userId,
          userName: charName,
          characterId: member.characterId || undefined,
          characterName: charName,
        });

        // 4. Broadcast active PC to DM in real time
        broadcastActivePC();

        showCustomAlert("Join Campaign", `Successfully joined campaign as <strong>${charName}</strong>!`, "Let's Play", "🎲");
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

  return createPortal(
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
                fontFamily: 'var(--font-title)',
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
          <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
            DM Invite Code:
          </label>
          <input
            type="text"
            required
            autoFocus
            className="modal-input"
            placeholder="e.g. RAVEN-42"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            style={{
              fontFamily: 'monospace',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px', fontWeight: 'bold' }}>
            Select Character:
          </label>
          {characters.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--inkm)', fontStyle: 'italic', padding: '6px 0' }}>
              No characters found in your roster.
            </div>
          ) : (
            <select
              className="modal-select"
              value={selectedCharId}
              onChange={(e) => setSelectedCharId(e.target.value)}
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
            style={{
              padding: '4px 12px',
              fontSize: '11px',
              fontFamily: 'var(--font-title)',
              background: 'rgba(200, 169, 110, 0.2)',
              border: '1px solid var(--pb, #c8a96e)',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'var(--ink, #2c2214)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!inviteCode.trim() || isLoading}
            className="btn btn-p"
            style={{
              padding: '4px 14px',
              fontSize: '11px',
              fontFamily: 'var(--font-title)',
              background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
              border: '1px solid #8b6914',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {isLoading ? 'Joining...' : '🎲 Join Table'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};
