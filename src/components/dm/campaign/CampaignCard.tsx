/**
 * @module    CampaignCard
 * @summary   Card item display for an individual DM campaign in CampaignManagerDialog.
 */

import React from 'react';
import type { CampaignSummary } from '../../../types/campaign.ts';

interface CampaignCardProps {
  camp: CampaignSummary;
  isActive: boolean;
  isCopied: boolean;
  isActionInProgress: boolean;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onCopyCode: (code: string, id: string) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  camp,
  isActive,
  isCopied,
  isActionInProgress,
  onSelect,
  onDuplicate,
  onDelete,
  onCopyCode,
}) => {
  return (
    <div
      style={{
        background: isActive ? 'linear-gradient(135deg, #fbf2db, #f7e8c3)' : '#ffffff',
        border: isActive ? '1.5px solid #065f46' : '1px solid var(--pb, #c8a96e)',
        borderRadius: '6px',
        padding: '12px',
        boxShadow: isActive ? '0 3px 10px rgba(6, 95, 70, 0.15)' : '0 2px 5px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '8px',
        position: 'relative',
      }}
    >
      {/* Active Badge */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            background: '#065f46',
            color: '#ffffff',
            fontSize: '8.5px',
            fontFamily: 'var(--font-title)',
            padding: '1px 6px',
            borderRadius: '10px',
            fontWeight: 'bold',
          }}
        >
          ⭐ Active Session
        </div>
      )}

      <div>
        {/* Campaign Name */}
        <div
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'var(--red, #8b1a1a)',
            paddingRight: isActive ? '75px' : '0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={camp.name}
        >
          {camp.name}
        </div>

        {/* Description */}
        {camp.description && (
          <div
            style={{
              fontSize: '10.5px',
              color: 'var(--inkm, #665c49)',
              fontStyle: 'italic',
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {camp.description}
          </div>
        )}

        {/* Invite Code Pill */}
        <div
          style={{
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '10px', color: 'var(--inkm)' }}>Code:</span>
          <button
            type="button"
            onClick={() => onCopyCode(camp.inviteCode, camp.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '1px 6px',
              fontSize: '10px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              background: isCopied ? '#065f46' : 'rgba(200, 169, 110, 0.15)',
              color: isCopied ? '#ffffff' : 'var(--red)',
              border: '1px solid var(--pb)',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
            title="Copy invite code to clipboard"
          >
            <span>{isCopied ? '✓' : '📋'}</span>
            <span>{camp.inviteCode}</span>
          </button>
        </div>

        {/* Encounter Stats */}
        <div
          style={{
            marginTop: '6px',
            fontSize: '10.5px',
            fontFamily: 'var(--font-body)',
            color: 'var(--ink, #2c2214)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span>⚔️ Round {camp.round}</span>
          <span>👾 {camp.combatantCount} Combatants</span>
          {camp.location && <span>📍 {camp.location}</span>}
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          borderTop: '0.5px solid rgba(200, 169, 110, 0.4)',
          paddingTop: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => onSelect(camp.id)}
          disabled={isActionInProgress || isActive}
          className="btn btn-p"
          style={{
            flex: 1,
            padding: '3px 6px',
            fontSize: '10.5px',
            fontFamily: 'var(--font-title)',
            background: isActive ? '#065f46' : 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
            border: '1px solid #8b6914',
            color: '#ffffff',
            borderRadius: '3px',
            cursor: isActive ? 'default' : 'pointer',
            opacity: isActive ? 0.9 : 1,
          }}
        >
          {isActive ? '✓ Loaded' : '⚡ Open'}
        </button>

        <button
          type="button"
          onClick={() => onDuplicate(camp.id)}
          disabled={isActionInProgress}
          className="btn"
          style={{
            padding: '3px 6px',
            fontSize: '10px',
            background: 'rgba(200, 169, 110, 0.2)',
            border: '1px solid var(--pb)',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
          title="Duplicate Campaign"
        >
          📑
        </button>

        <button
          type="button"
          onClick={() => onDelete(camp.id, camp.name)}
          disabled={isActionInProgress}
          className="btn"
          style={{
            padding: '3px 6px',
            fontSize: '10px',
            background: 'rgba(139, 26, 26, 0.1)',
            borderColor: 'rgba(139, 26, 26, 0.3)',
            color: 'var(--red)',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
          title="Delete Campaign"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
