import { useEffect } from 'react';
import { useCombatState } from './hooks/useCombatState';
import { RoleSelection } from './components/RoleSelection';
import { DMScreen } from './components/dm/DMScreen';
import { PlayerSheet } from './components/player/PlayerSheet';
import { CharacterWizardDialog } from './components/player/CharacterWizardDialog';
import { initRealtimeSyncBridge } from './services/network/RealtimeSyncBridge.ts';
import { realtimeManager } from './services/network/RealtimeManager.ts';
import { CombatState } from '@core/state.js';

export default function App() {
  const { state, activePC, isReady } = useCombatState();
  const rawRole = state?.session?.role || state?.mode;
  const role = (rawRole === 'host' || rawRole === 'dm')
    ? 'host'
    : (rawRole === 'player' || rawRole === 'client'
      ? 'player'
      : (rawRole === 'wizard' ? 'wizard' : 'choice'));

  // Initialize Realtime Sync Bridge
  useEffect(() => {
    initRealtimeSyncBridge();
  }, []);

  // Sync Skalierungs-Logik (Zoom)
  useEffect(() => {
    if (!isReady) return;

    if (role === 'choice') {
      document.documentElement.style.setProperty('--app-scale', '1.0');
      document.body.style.minHeight = '100vh';
      const appWrapper = document.getElementById('appWrapper');
      if (appWrapper) appWrapper.style.height = '100vh';
      return;
    }

    let currentScale = 1.0;

    const syncBodyHeight = () => {
      const appRoot = document.getElementById('appRoot');
      const appWrapper = document.getElementById('appWrapper');
      if (appRoot && appWrapper) {
        const unscaledHeight = Math.max(appRoot.offsetHeight, appRoot.scrollHeight);
        const scaledHeight = (unscaledHeight + 20) * currentScale;
        appWrapper.style.height = scaledHeight + 'px';
        document.body.style.minHeight = scaledHeight + 'px';
      }
    };

    const applyScaleFactor = () => {
      const appRoot = document.getElementById('appRoot');
      if (!appRoot) return;

      const targetWidth = 1150;
      let scale = window.innerWidth / targetWidth;
      
      // Fix: Festgelegte Breite auf targetWidth (1150px) belassen, damit die Skalierung
      // exakt der Bildschirmbreite entspricht und kein horizontaler Überlauf entsteht.
      appRoot.style.width = targetWidth + 'px';

      const maxScale = role === 'wizard' ? 1.2 : 1.6;
      scale = Math.max(0.6, Math.min(maxScale, scale));
      currentScale = scale;
      document.documentElement.style.setProperty('--app-scale', scale.toString());
      syncBodyHeight();
    };

    window.addEventListener('resize', applyScaleFactor);

    const appRoot = document.getElementById('appRoot');
    let resizeObserver: ResizeObserver | null = null;
    if (appRoot && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(syncBodyHeight);
      });
      resizeObserver.observe(appRoot);
    }

    // Scroll-Schutz
    const handleScroll = () => {
      if (window.scrollX !== 0 || window.pageXOffset !== 0) {
        window.scrollTo(0, window.scrollY || window.pageYOffset);
      }
    };
    window.addEventListener('scroll', handleScroll);

    if (window.visualViewport) {
      const handleViewportScroll = () => {
        if (window.visualViewport && window.visualViewport.offsetLeft !== 0) {
          window.scrollTo(window.scrollX, window.scrollY);
        }
      };
      window.visualViewport.addEventListener('scroll', handleViewportScroll);
    }

    const handleFocusIn = () => {
      setTimeout(() => {
        if (window.scrollX !== 0 || window.pageXOffset !== 0) {
          window.scrollTo(0, window.scrollY || window.pageYOffset);
        }
        if (window.visualViewport && window.visualViewport.offsetLeft !== 0) {
          window.scrollTo(window.visualViewport.offsetLeft, window.scrollY);
        }
      }, 80);
    };
    document.addEventListener('focusin', handleFocusIn);

    // Initialer Aufruf
    applyScaleFactor();

    // Staggered updates to handle layout/rendering latency
    const t1 = setTimeout(applyScaleFactor, 50);
    const t2 = setTimeout(applyScaleFactor, 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', applyScaleFactor);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [isReady, role]);

  if (!isReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#2a1a0a' }}>
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-title)' }}>
          <div className="hp-emblem" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'radial-gradient(circle, #f4e8c1 0%, #c8a96e 70%, #9a7a2e 100%)', border: '2px double var(--red)', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', animation: 'spin 2s linear infinite', marginBottom: '15px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--red)' }}>D&D</span>
          </div>
          <h2 style={{ color: 'var(--red)', letterSpacing: '1px' }}>Loading D&D 3.5e Combat Engine...</h2>
          <p style={{ color: 'var(--inkl)', fontStyle: 'italic', fontSize: '11px' }}>Please wait, adventure is initializing.</p>
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

  if (role === 'choice') {
    return <RoleSelection />;
  }

  let content: React.ReactNode;
  if (role === 'host') {
    content = <DMScreen state={state} />;
  } else if (role === 'wizard') {
    content = <CharacterWizardDialog onClose={() => CombatState.setRole('choice')} />;
  } else {
    // Player
    if (!activePC) {
      content = (
        <div className="sheet" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center', padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--red)', fontSize: '20px', marginBottom: '10px' }}>
            No Active Character
          </h2>
          <hr style={{ border: 'none', borderTop: '0.5px solid var(--pb)', margin: '10px 0 20px' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--inkm)', lineHeight: 1.5, marginBottom: '20px' }}>
            There is currently no active player character (PC) loaded in this session.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button className="btn btn-p" onClick={() => window.location.reload()}>🔄 Reload Page</button>
            <button 
              className="btn" 
              onClick={() => {
                realtimeManager.leaveCampaign();
                CombatState.updateSession(false, 'choice', '');
                CombatState.setRole('choice');
              }}
            >
              🎭 Change Role
            </button>
          </div>
        </div>
      );
    } else {
      content = <PlayerSheet pc={activePC} />;
    }
  }

  return (
    <div id="appWrapper">
      <div id="appRoot">
        {content}
      </div>
    </div>
  );
}
