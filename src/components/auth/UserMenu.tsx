/**
 * @module    UserMenu
 * @summary   Header auth button and user profile dropdown for Google Social Login.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SyncIndicator } from '../shared/SyncIndicator.tsx';
import { CharacterRosterDialog } from '../player/CharacterRosterDialog.tsx';
import { CampaignManagerDialog } from '../dm/CampaignManagerDialog.tsx';
import { JoinCampaignDialog } from '../dialogs/JoinCampaignDialog.tsx';

export const UserMenu: React.FC = () => {
  const { user, profile, isAuthenticated, isLoading, isConfigured, signInWithGoogle, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('[UserMenu] Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const displayName = profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Adventurer';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  // If Supabase is not configured (e.g. offline dev mode without env), show offline badge
  if (!isConfigured) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <SyncIndicator />
        <span
          style={{
            fontSize: '9.5px',
            fontFamily: "'Crimson Text', serif",
            color: 'var(--inkm)',
            border: '1px dashed var(--pb)',
            padding: '2px 6px',
            borderRadius: '10px',
            background: 'rgba(200, 169, 110, 0.1)',
          }}
          title="Local Mode: No Supabase configured"
        >
          💾 Offline
        </span>
      </div>
    );
  }

  // Not logged in: Show Login Button
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <SyncIndicator />
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isLoading || isLoggingIn}
          className="btn btn-p"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 9px',
            fontSize: '10.5px',
            fontFamily: "'IM Fell English SC', serif",
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
            border: '1px solid #8b6914',
            color: '#ffffff',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}
          title="Sign in with Google to save characters to the cloud"
        >
          <span>🔑</span>
          <span>{isLoggingIn ? 'Signing In...' : 'Sign In'}</span>
        </button>
      </div>
    );
  }

  // Logged in: Show Avatar / User Menu Dropdown
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <SyncIndicator />

      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 8px',
            fontSize: '11px',
            fontFamily: "'IM Fell English SC', serif",
            fontWeight: 'bold',
            background: isOpen ? 'var(--parchment, #fdf6e2)' : 'rgba(253, 246, 226, 0.9)',
            border: '1px solid var(--pb, #c8a96e)',
            borderRadius: '12px',
            cursor: 'pointer',
            color: 'var(--ink, #2c2214)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
          title="Open User Menu"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '0.5px solid var(--pb)',
              }}
            />
          ) : (
            <span>👤</span>
          )}
          <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayName}
          </span>
          <span style={{ fontSize: '8px', opacity: 0.7 }}>▼</span>
        </button>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 5px)',
              right: 0,
              width: '210px',
              background: 'var(--parchment, #fdf6e2)',
              border: '1px solid var(--pb, #c8a96e)',
              borderRadius: '4px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              padding: '8px 10px',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {/* User Info Header */}
            <div style={{ borderBottom: '0.5px solid var(--pb)', paddingBottom: '6px' }}>
              <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '12px', fontWeight: 'bold', color: 'var(--red)' }}>
                {displayName}
              </div>
              {user?.email && (
                <div style={{ fontSize: '9.5px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", wordBreak: 'break-all' }}>
                  {user.email}
                </div>
              )}
              <div style={{ fontSize: '8.5px', color: '#065f46', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span>🟢</span>
                <span>Cloud Connected (Frankfurt)</span>
              </div>
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsRosterOpen(true);
              }}
              className="btn btn-p"
              style={{
                width: '100%',
                fontSize: '10.5px',
                padding: '4px 8px',
                fontFamily: "'IM Fell English SC', serif",
                background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                border: '1px solid #8b6914',
                color: '#ffffff',
                fontWeight: 'bold',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <span>📜</span>
              <span>Character Roster</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsCampaignOpen(true);
              }}
              className="btn"
              style={{
                width: '100%',
                fontSize: '10.5px',
                padding: '4px 8px',
                fontFamily: "'IM Fell English SC', serif",
                background: 'rgba(200, 169, 110, 0.15)',
                border: '1px solid var(--pb)',
                color: 'var(--ink)',
                fontWeight: 'bold',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <span>🎲</span>
              <span>Campaigns (DM)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsJoinOpen(true);
              }}
              className="btn"
              style={{
                width: '100%',
                fontSize: '10.5px',
                padding: '4px 8px',
                fontFamily: "'IM Fell English SC', serif",
                background: 'rgba(200, 169, 110, 0.1)',
                border: '1px solid var(--pb)',
                color: 'var(--ink)',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <span>🔗</span>
              <span>Join Campaign</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="btn"
              style={{
                width: '100%',
                fontSize: '10px',
                padding: '4px 8px',
                fontFamily: "'IM Fell English SC', serif",
                background: 'rgba(139, 26, 26, 0.08)',
                borderColor: 'rgba(139, 26, 26, 0.4)',
                color: 'var(--red)',
                fontWeight: 'bold',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        )}
      </div>
      <CharacterRosterDialog isOpen={isRosterOpen} onClose={() => setIsRosterOpen(false)} />
      <CampaignManagerDialog isOpen={isCampaignOpen} onClose={() => setIsCampaignOpen(false)} />
      <JoinCampaignDialog isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
};
