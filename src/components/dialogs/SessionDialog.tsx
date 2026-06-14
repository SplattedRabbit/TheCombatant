import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { uiRegistry } from '@core/ui/ui-shared.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';

interface SessionDialogProps {
  onClose: () => void;
}

export const SessionDialog: React.FC<SessionDialogProps> = ({ onClose }) => {
  const [session, setSession] = useState(
    CombatState.getState().session || { active: false, role: 'choice', roomCode: '' }
  );
  const [codeVal, setCodeVal] = useState('');

  const handleStartHost = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    CombatState.updateSession(true, 'host', code);
    setSession(CombatState.getState().session);
    if (uiRegistry && typeof uiRegistry.renderAll === 'function') {
      uiRegistry.renderAll();
    }
  };

  const handleJoinClient = () => {
    const trimmedCode = codeVal.trim().toUpperCase();
    if (trimmedCode.length !== 4) {
      showCustomAlert("Error", "Please enter a valid 4-digit code.");
      return;
    }
    CombatState.updateSession(true, 'client', trimmedCode);
    setSession(CombatState.getState().session);
    if (uiRegistry && typeof uiRegistry.renderAll === 'function') {
      uiRegistry.renderAll();
    }
  };

  const handleStopSession = () => {
    CombatState.updateSession(false, 'choice', '');
    setSession(CombatState.getState().session);
    if (uiRegistry && typeof uiRegistry.renderAll === 'function') {
      uiRegistry.renderAll();
    }
  };

  return (
    <div
      id="sessionOverlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.55)',
        backdropFilter: 'blur(2px)',
        zIndex: 2400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '16px 24px',
          width: '290px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08)',
          fontFamily: "'IM Fell English SC', serif",
          textAlign: 'center',
          position: 'relative',
          transform: 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '2px' }}>
          🌐 Session Manager (P2P)
        </div>
        <div className="dialog-subtitle" style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', marginBottom: '6px' }}>
          Connect your character sheet to the session
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 10px' }} />

        <div className="session-content-area" style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '110px' }}>
          {!session.active ? (
            <>
              {/* Host Option */}
              <div style={{ background: 'rgba(200, 169, 110, 0.05)', border: '1px solid var(--pb)', borderRadius: '3px', padding: '8px 10px', textAlign: 'left' }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--red)' }}>🏰 Dungeon Master Mode (Host)</div>
                <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '8.5px', color: 'var(--inkm)', lineHeight: 1.2, marginTop: '2px', marginBottom: '6px' }}>
                  Host an online combat sheet. Players can join directly using your session code.
                </div>
                <button
                  onClick={handleStartHost}
                  className="btn btn-p btn-start-host"
                  style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', padding: '2px 8px', width: '100%', cursor: 'pointer' }}
                >
                  Host Session 🌐
                </button>
              </div>

              {/* Client Option */}
              <div style={{ background: 'rgba(200, 169, 110, 0.05)', border: '1px solid var(--pb)', borderRadius: '3px', padding: '8px 10px', textAlign: 'left' }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--ink)' }}>🛡️ Player Mode (Client)</div>
                <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '8.5px', color: 'var(--inkm)', lineHeight: 1.2, marginTop: '2px', marginBottom: '6px' }}>
                  Join the active session of your DM. Enter the 4-digit access code.
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    placeholder="CODE"
                    value={codeVal}
                    onChange={(e) => setCodeVal(e.target.value)}
                    className="cinput room-code-input"
                    style={{ width: '55px', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', height: '16px', padding: 0, textTransform: 'uppercase' }}
                  />
                  <button
                    onClick={handleJoinClient}
                    className="btn btn-join-client"
                    style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', padding: '2px 8px', flex: 1, cursor: 'pointer' }}
                  >
                    Join 🔌
                  </button>
                </div>
              </div>
            </>
          ) : session.role === 'host' ? (
            <div style={{ background: 'rgba(42, 106, 42, 0.05)', border: '1px solid #2a6a2a', borderRadius: '3px', padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1a4a1a' }}>🟢 Session Active (Dungeon Master)</div>
              <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '8.5px', color: 'var(--inkm)', lineHeight: 1.2, marginTop: '3px', marginBottom: '10px' }}>
                Your online combat sheet is live. Players can connect using this code:
              </div>

              <div style={{ fontSize: '26px', fontWeight: 'bold', color: 'var(--red)', letterSpacing: '2px', fontFamily: "'IM Fell English SC', serif", background: 'rgba(0,0,0,0.04)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px 0', marginBottom: '10px', boxShadow: 'inset 0 0 5px rgba(0,0,0,0.05)' }}>
                {session.roomCode}
              </div>

              <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic', marginBottom: '10px' }}>
                Waiting for incoming player connections...
              </div>

              <button
                onClick={handleStopSession}
                className="btn btn-stop-session"
                style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', padding: '2px 8px', width: '100%', borderColor: 'var(--red)', color: 'var(--red)', cursor: 'pointer' }}
              >
                End Session ✕
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(42, 106, 42, 0.05)', border: '1px solid #2a6a2a', borderRadius: '3px', padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1a4a1a' }}>🟢 Connected to Session</div>
              <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '8.5px', color: 'var(--inkm)', lineHeight: 1.2, marginTop: '3px', marginBottom: '10px' }}>
                Successfully logged into session code:
              </div>

              <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--red)', letterSpacing: '2px', fontFamily: "'IM Fell English SC', serif", background: 'rgba(0,0,0,0.04)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '3px 0', marginBottom: '10px' }}>
                {session.roomCode}
              </div>

              <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic', marginBottom: '10px' }}>
                Linked as player character. Sync ready.
              </div>

              <button
                onClick={handleStopSession}
                className="btn btn-stop-session"
                style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', padding: '2px 8px', width: '100%', borderColor: 'var(--red)', color: 'var(--red)', cursor: 'pointer' }}
              >
                Disconnect ✕
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="btn btn-close-session"
          style={{
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '8px',
            padding: '2px 10px',
            marginTop: '12px',
            cursor: 'pointer',
            background: 'transparent',
            border: '0.5px solid var(--pb)',
            borderRadius: '1px',
            color: 'var(--inkl)',
            outline: 'none'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};
