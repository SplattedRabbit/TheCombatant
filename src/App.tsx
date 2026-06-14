/**
 * @module    App
 * @summary   Main router component for the D&D 3.5e Combat App.
 *            Routes to RoleSelection, DMScreen, or PlayerSheet based on selected role.
 * @exports   App
 * @reads     useCombatState
 * @stateOps  CombatState.setRole
 * @depends   React, useCombatState, RoleSelection, DMScreen, PlayerSheet
 */

import { useCombatState } from './hooks/useCombatState';
import { RoleSelection } from './components/RoleSelection';
import { DMScreen } from './components/dm/DMScreen';
import { PlayerSheet } from './components/player/PlayerSheet';
// @ts-ignore
import { CombatState } from '@core/state.js';
import styles from './App.module.css';

export default function App() {
  const { state, activePC, isReady } = useCombatState() as any;

  // 1. Loading Skeleton
  if (!isReady) {
    return (
      <div className={styles.app} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', fontFamily: "'IM Fell English SC', serif" }}>
          <div className="hp-emblem" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'radial-gradient(circle, #f4e8c1 0%, #c8a96e 70%, #9a7a2e 100%)', border: '2px double var(--red)', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', animation: 'spin 2s linear infinite', marginBottom: '15px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--red)' }}>D&D</span>
          </div>
          <h2 style={{ color: 'var(--red)', letterSpacing: '1px' }}>Lade D&D 3.5e Combat Engine...</h2>
          <p style={{ color: 'var(--inkl)', fontStyle: 'italic', fontSize: '11px' }}>Bitte warten, Abenteuer wird initialisiert.</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // 2. Role-based routing
  const role = state.session.role;

  if (role === 'choice') {
    return <RoleSelection />;
  }

  if (role === 'host' || role === 'dm') {
    return (
      <div className={styles.app}>
        <DMScreen state={state} />
      </div>
    );
  }

  // If role is 'player'
  if (!activePC) {
    return (
      <div className={styles.app}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🔮</span>
            <div className={styles.logoText}>
              <h1>D&amp;D 3.5e Combat App</h1>
              <span className={styles.badge}>React · Spieler-Modus</span>
            </div>
          </div>
        </header>
        <main className={styles.main} style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
          <div
            className="pnl"
            style={{
              maxWidth: '500px',
              border: '1px solid var(--pb)',
              borderRadius: '4px',
              padding: '24px',
              background: 'rgba(200, 169, 110, 0.03)',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            }}
          >
            <h2 style={{ fontFamily: "'IM Fell English SC', serif", color: 'var(--red)', fontSize: '20px', marginBottom: '10px' }}>
              Kein aktiver Charakter
            </h2>
            <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200,169,110,0.3)', margin: '10px 0 20px' }} />
            <p style={{ fontFamily: "'Crimson Text', serif", fontSize: '13px', color: 'var(--inkl)', lineHeight: 1.5, marginBottom: '20px' }}>
              Es ist aktuell kein aktiver Spieler-Charakter (PC) in dieser Sitzung geladen. 
              Dies kann daran liegen, dass du dich im Spielleiter-Modus (DM) befunden hast oder die Sitzung gerade erst erstellt hast.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                className="btn btn-p"
                onClick={() => {
                  window.location.reload();
                }}
                style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '10px', padding: '6px 16px' }}
              >
                🔄 Seite neu laden
              </button>
              <button
                className="btn"
                onClick={() => {
                  CombatState.setRole('choice');
                }}
                style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '10px', padding: '6px 16px' }}
              >
                🎭 Rolle wechseln
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <PlayerSheet pc={activePC} />
    </div>
  );
}
