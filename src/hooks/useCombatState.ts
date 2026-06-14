/**
 * @module    useCombatState
 * @summary   State-Bridge zwischen der bestehenden Vanilla-Engine (über CombatEngineContext) und React.
 *            Abonniert state_changed / pc_changed Events und spiegelt sie als unveränderliche
 *            Snapshots in React-State. Jedes Event triggert ein Re-Render.
 * @exports   useCombatState
 * @reads     CombatEngineContext, StateEvents (state_changed, pc_changed), getState(), getActivePC()
 * @stateOps  keine — dieser Hook ist read-only. Mutationen über js/state.js-Funktionen.
 * @depends   src/context/CombatEngineContext
 * @notHere   Mutations-Logik → js/state/ | Typen → src/types/combat.ts
 */

import { useState, useEffect, useMemo, useContext } from 'react';
import { CombatEngineContext } from '../context/CombatEngineContext';
import type { CombatStateSnapshot, Combatant, UseCombatStateReturn } from '../types/combat';

// ---------------------------------------------------------------------------
// Typen für die Vanilla-Engine (minimale Beschreibung)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Snapshot-Factory — wandelt den mutablen Engine-State in eine tiefe Kopie um.
// Verhindert, dass React stale References cached.
// ---------------------------------------------------------------------------

function createSnapshot(raw: unknown): CombatStateSnapshot {
  const r = (raw as any) ?? {};

  return {
    combatants: Array.isArray(r.combatants)
      ? (JSON.parse(JSON.stringify(r.combatants)) as Combatant[])
      : [],
    meta: {
      round: typeof r.round === 'number' ? r.round : 1,
      currentTurn: typeof r.turn === 'number' ? r.turn : 0,
      begegnung: r.meta?.begegnung ?? '',
      ort: r.meta?.ort ?? '',
      xpBudget: r.meta?.xpBudget ?? '',
      xpVerteilt: r.meta?.xpVerteilt ?? '',
      sitzung: r.meta?.sitzung ?? '',
    },
    session: {
      active: r.session?.active ?? false,
      role: (r.session?.role ?? r.mode ?? 'choice') as 'host' | 'player' | 'choice',
      roomCode: r.session?.roomCode ?? '',
    },
    concentrations: Array.isArray(r.concentrations)
      ? (JSON.parse(JSON.stringify(r.concentrations)))
      : [],
  };
}

// ---------------------------------------------------------------------------
// useCombatState — Der State-Bridge Hook
// ---------------------------------------------------------------------------

export function useCombatState(): UseCombatStateReturn {
  const { isReady, getState, getActivePC, StateEvents } = useContext(CombatEngineContext);

  // Initialzustand: leerer Snapshot bis die Engine geladen ist
  const [snapshot, setSnapshot] = useState<CombatStateSnapshot>(() => ({
    combatants: [],
    meta: {
      round: 1,
      currentTurn: 0,
      begegnung: '',
      ort: '',
      xpBudget: '',
      xpVerteilt: '',
      sitzung: '',
    },
    session: { active: false, role: 'choice', roomCode: '' },
    concentrations: [],
  }));

  const [activePC, setActivePC] = useState<Combatant | null>(null);

  useEffect(() => {
    if (!isReady || !getState || !getActivePC || !StateEvents) return;

    // Initialen Snapshot und PC setzen
    setSnapshot(createSnapshot(getState()));
    setActivePC((getActivePC() as Combatant | null));

    // Event-Handler
    const onStateChanged = (rawState: unknown) => {
      setSnapshot(createSnapshot(rawState));
      setActivePC((getActivePC() as Combatant | null));
    };

    const onPCChanged = (rawState: unknown) => {
      setSnapshot(createSnapshot(rawState));
      setActivePC((getActivePC() as Combatant | null));
    };

    StateEvents.on('state_changed', onStateChanged);
    StateEvents.on('pc_changed', onPCChanged);

    // Cleanup: Listener aus dem Bus entfernen
    return () => {
      if (StateEvents.listeners['state_changed']) {
        StateEvents.listeners['state_changed'] =
          StateEvents.listeners['state_changed'].filter(cb => cb !== onStateChanged);
      }
      if (StateEvents.listeners['pc_changed']) {
        StateEvents.listeners['pc_changed'] =
          StateEvents.listeners['pc_changed'].filter(cb => cb !== onPCChanged);
      }
    };
  }, [isReady, getState, getActivePC, StateEvents]);

  const result = useMemo<UseCombatStateReturn>(() => ({
    state: snapshot,
    activePC,
    isReady,
  }), [snapshot, activePC, isReady]);

  return result;
}
