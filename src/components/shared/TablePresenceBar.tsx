/**
 * @module    TablePresenceBar
 * @summary   Header presence bar showing live connected players and DM at the virtual table.
 */

import React, { useState, useEffect } from 'react';
import type { TablePresenceUser, RealtimeConnectionStatus } from '../../types/realtime.ts';
import { realtimeManager } from '../../services/network/RealtimeManager.ts';

export const TablePresenceBar: React.FC = () => {
  const [users, setUsers] = useState<TablePresenceUser[]>([]);
  const [status, setStatus] = useState<RealtimeConnectionStatus>(realtimeManager.getStatus());

  useEffect(() => {
    const unsubPresence = realtimeManager.onPresenceChange((presenceUsers) => {
      setUsers(presenceUsers);
    });

    const unsubStatus = realtimeManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubPresence();
      unsubStatus();
    };
  }, []);

  if (status === 'disconnected' || users.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(253, 246, 226, 0.85)',
        border: '1px solid var(--pb, #c8a96e)',
        borderRadius: '12px',
        padding: '2px 8px',
        fontSize: '10px',
        fontFamily: "'Crimson Text', serif",
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <span style={{ fontSize: '8px', color: status === 'connected' ? '#065f46' : '#d97706' }}>
        {status === 'connected' ? '🟢' : '🟡'}
      </span>
      <span style={{ fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', color: 'var(--ink)' }}>
        Live Table ({users.length}):
      </span>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {users.map((u) => {
          const isDM = u.role === 'host';
          const label = u.characterName ? `${u.characterName} (${u.userName})` : `${u.userName}${isDM ? ' (DM)' : ''}`;

          return (
            <div
              key={u.userId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                background: isDM ? 'rgba(139, 26, 26, 0.1)' : 'rgba(200, 169, 110, 0.2)',
                border: isDM ? '0.5px solid var(--red)' : '0.5px solid var(--pb)',
                borderRadius: '8px',
                padding: '1px 5px',
                fontSize: '9.5px',
                color: isDM ? 'var(--red)' : 'var(--ink)',
                fontWeight: isDM ? 'bold' : 'normal',
              }}
              title={`Connected since ${new Date(u.joinedAt).toLocaleTimeString()}`}
            >
              {u.userAvatarUrl ? (
                <img
                  src={u.userAvatarUrl}
                  alt={u.userName}
                  style={{ width: '12px', height: '12px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <span>{isDM ? '🏰' : '🛡️'}</span>
              )}
              <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
