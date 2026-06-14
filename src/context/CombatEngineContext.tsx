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

// Typendefinitionen für das Engine-Modul
interface CombatEventBus {
  listeners: Record<string, Array<(...args: any[]) => void>>;
  on(event: string, cb: (...args: any[]) => void): void;
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
        // Dynamischer Import der Vanilla-Engine Module
        // @ts-ignore
        const coreModule = await import('@core/state/state-core.js') as {
          getState: () => any;
          getActivePC: () => any;
          StateEvents: CombatEventBus;
        };

        // @ts-ignore
        const { CombatSpells } = await import('@core/spells.js');
        // @ts-ignore
        const { CombatState } = await import('@core/state.js');

        // Lade Zauberdatenbank & LocalStorage
        await CombatSpells.loadSpells();
        CombatState.loadFromStorage();

        // Stelle aktive Online-Sitzung wieder her
        const storedState = CombatState.getState();
        if (storedState.session && storedState.session.active) {
          console.log("Restoring active network session:", storedState.session.role, "Room:", storedState.session.roomCode);
          CombatState.updateSession(true, storedState.session.role, storedState.session.roomCode);
        }

        if (!mounted) return;

        setGetStateRef(() => coreModule.getState);
        setGetActivePCRef(() => coreModule.getActivePC);
        setStateEventsRef(coreModule.StateEvents);
        setIsReady(true);
      } catch (err) {
        console.error('[CombatEngineContext] Fehler beim Engine-Bootstrap:', err);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
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
