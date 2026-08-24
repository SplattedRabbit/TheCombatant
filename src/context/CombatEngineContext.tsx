/**
 * @module    CombatEngineContext
 * @summary   Stellt den React-Context und Provider für die asynchron geladene Vanilla-Engine bereit.
 *            Initialisiert die Engine beim ersten App-Start und stellt Referenzen zur Verfügung.
 * @exports   CombatEngineContext, CombatEngineProvider, useCombatEngine
 * @reads     Dynamischer Import von @core/state/state-core.js
 * @stateOps  keine
 * @depends   React
 * @notHere   State-Snapshots spiegeln -> useCombatState.ts | Domain-Typen -> src/types/combat.ts
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageService } from '../services/storage/StorageService.ts';
import { getState, getActivePC, StateEvents } from '@core/state/state-core.js';
import { CombatSpells } from '@core/spells.js';
import { CombatState } from '@core/state.js';

// Typendefinitionen für das Engine-Modul
interface CombatEventBus {
  listeners?: Record<string, Array<(...args: any[]) => void>>;
  on(event: string, cb: (...args: any[]) => void): void;
  off(event: string, cb: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

interface CombatEngineContextType {
  isReady: boolean;
  getState: (() => any) | null;
  getActivePC: (() => any) | null;
  StateEvents: CombatEventBus | null;
}

export const CombatEngineContext = createContext<CombatEngineContextType>({
  isReady: false,
  getState: null,
  getActivePC: null,
  StateEvents: null,
});

export const useCombatEngine = () => useContext(CombatEngineContext);

interface ProviderProps {
  children: ReactNode;
}

export function CombatEngineProvider({ children }: ProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [getStateRef, setGetStateRef] = useState<(() => any) | null>(null);
  const [getActivePCRef, setGetActivePCRef] = useState<(() => any) | null>(null);
  const [stateEventsRef, setStateEventsRef] = useState<CombatEventBus | null>(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        // Registriere zentralen StorageService als aktiven Adapter
        CombatState.setStorageAdapter(storageService);

        // Lade Zauberdatenbank parallel im Hintergrund (Non-Blocking für sofortigen App-Start)
        CombatSpells.loadSpells().catch((err: any) => {
          console.warn('[CombatEngineContext] Background spell database load error:', err);
        });

        // Lade lokalen State aus dem Speicheradapter (sofort/synchron aus Cache)
        await CombatState.loadFromStorage();

        // Stelle aktive Online-Sitzung wieder her
        const storedState = CombatState.getState();
        if (storedState.session && storedState.session.active) {
          console.log("Restoring active network session:", storedState.session.role, "Room:", storedState.session.roomCode);
          CombatState.updateSession(true, storedState.session.role, storedState.session.roomCode);
        }

        if (!mounted) return;

        setGetStateRef(() => getState);
        setGetActivePCRef(() => getActivePC);
        setStateEventsRef(StateEvents);
        setIsReady(true);
      } catch (err) {
        console.error('[CombatEngineContext] Fehler beim Engine-Bootstrap:', err);
      }
    }

    bootstrap();

    // Flush any pending saves before browser window closes or reloads
    const handleBeforeUnload = () => {
      storageService.flushPendingSaves();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      mounted = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <CombatEngineContext.Provider
      value={{
        isReady,
        getState: getStateRef,
        getActivePC: getActivePCRef,
        StateEvents: stateEventsRef,
      }}
    >
      {children}
    </CombatEngineContext.Provider>
  );
}
