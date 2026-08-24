/**
 * @module    TablePresenceBar
 * @summary   Header presence dropdown showing live connected players and DM at the virtual table.
 */

import React, { useState, useEffect, useRef } from 'react';
import type { TablePresenceUser, RealtimeConnectionStatus } from '../../types/realtime.ts';
import { realtimeManager } from '../../services/network/RealtimeManager.ts';

export const TablePresenceBar: React.FC = () => {
  const [users, setUsers] = useState<TablePresenceUser[]>([]);
  const [status, setStatus] = useState<RealtimeConnectionStatus>(realtimeManager.getStatus());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (status === 'disconnected' || users.length === 0) {
    return null;
  }

  const isConnected = status === 'connected';

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hdr-action-btn"
        style={isOpen ? { background: 'linear-gradient(180deg, #fdf6e2 0%, #d8be7e 100%)', borderColor: 'var(--gold)' } : undefined}
        title={`Live Table: ${users.length} participant(s) online. Click to view.`}
      >
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#f59e0b',
            boxShadow: isConnected ? '0 0 4px #10b981' : 'none',
          }}
        />
        <span>Live Table ({users.length})</span>
        <span style={{ fontSize: '8px', opacity: 0.7 }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            width: '240px',
            background: 'var(--parchment, #fdf6e2)',
            border: '1.5px solid var(--pb, #c8a96e)',
            borderRadius: '3px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            padding: '6px 8px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            textAlign: 'left',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--pb, #c8a96e)',
              paddingBottom: '4px',
              marginBottom: '2px',
            }}
          >
            <span
              style={{
                fontFamily: "'IM Fell English SC', serif",
                fontSize: '11.5px',
                fontWeight: 'bold',
                color: 'var(--red)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>⚔️</span>
              <span>Connected Table ({users.length})</span>
            </span>
            <span
              style={{
                fontSize: '8.5px',
                color: isConnected ? '#065f46' : '#d97706',
                fontFamily: "'Crimson Text', serif",
              }}
            >
              {isConnected ? '● Connected' : '○ Connecting'}
            </span>
          </div>

          {/* User List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '180px', overflowY: 'auto' }}>
            {users.map((u) => {
              const isDM = u.role === 'host';
              const name = u.characterName ? u.characterName : u.userName;
              const sub = u.characterName ? `${u.userName}` : isDM ? 'Dungeon Master' : 'Player';

              return (
                <div
                  key={u.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '3px 6px',
                    background: isDM ? 'rgba(139, 26, 26, 0.07)' : 'rgba(200, 169, 110, 0.12)',
                    border: `0.5px solid ${isDM ? 'rgba(139, 26, 26, 0.3)' : 'rgba(200, 169, 110, 0.4)'}`,
                    borderRadius: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden' }}>
                    {u.userAvatarUrl ? (
                      <img
                        src={u.userAvatarUrl}
                        alt={u.userName}
                        style={{ width: '15px', height: '15px', borderRadius: '50%', objectFit: 'cover', border: '0.5px solid var(--pb)' }}
                      />
                    ) : (
                      <span style={{ fontSize: '11px' }}>{isDM ? '👑' : '🛡️'}</span>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                      <span
                        style={{
                          fontFamily: "'Crimson Text', serif",
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: isDM ? 'var(--red)' : 'var(--ink)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '120px',
                        }}
                      >
                        {name}
                      </span>
                      <span style={{ fontSize: '8.5px', color: 'var(--inkm)', opacity: 0.8 }}>
                        {sub}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic' }}>
                    {u.joinedAt ? new Date(u.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: '0.5px solid rgba(200, 169, 110, 0.3)',
              paddingTop: '3px',
              marginTop: '2px',
              fontSize: '8.5px',
              color: 'var(--inkl)',
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            Supabase Realtime Channel active
          </div>
        </div>
      )}
    </div>
  );
};
