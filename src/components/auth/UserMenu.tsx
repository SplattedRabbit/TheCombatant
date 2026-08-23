/**
 * @module    UserMenu
 * @summary   Header auth button and user profile dropdown for Google Social Login.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const UserMenu: React.FC = () => {
  const { user, profile, isAuthenticated, isLoading, isConfigured, signInWithGoogle, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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

  if (!isConfigured) {
    return null;
  }

  if (isLoading) {
    return (
      <div style={{ fontSize: '11px', color: 'var(--inkm)', fontStyle: 'italic', fontFamily: "'Crimson Text', serif" }}>
        ⌛ Laden...
      </div>
    );
  }

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const { error } = await signInWithGoogle();
      if (error) {
        alert('Login-Fehler: ' + (error.message || 'Konnte Google Login nicht starten.'));
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const displayName = profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Held';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={handleLogin}
        disabled={isLoggingIn}
        className="btn btn-p"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          fontSize: '11px',
          fontFamily: "'IM Fell English SC', serif",
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
          border: '1px solid #8b6914',
          color: '#ffffff',
          borderRadius: '3px',
          cursor: isLoggingIn ? 'wait' : 'pointer',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}
        title="Mit Google-Konto anmelden, um Charaktere in der Cloud zu sichern"
      >
        <span>🎲</span>
        <span>{isLoggingIn ? 'Anmeldung...' : 'Mit Google anmelden'}</span>
      </button>
    );
  }

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 8px',
          background: 'rgba(253, 246, 226, 0.9)',
          border: '1px solid var(--pb)',
          borderRadius: '20px',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            referrerPolicy="no-referrer"
            style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'var(--red)',
              color: '#ffffff',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span
          style={{
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '11.5px',
            fontWeight: 'bold',
            color: 'var(--ink)',
            maxWidth: '120px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {displayName}
        </span>
        <span style={{ fontSize: '9px', color: 'var(--inkm)' }}>▾</span>
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
              <span>Cloud verbunden (Frankfurt)</span>
            </div>
          </div>

          {/* Actions */}
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
            🚪 Abmelden
          </button>
        </div>
      )}
    </div>
  );
};
