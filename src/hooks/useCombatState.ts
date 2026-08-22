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
// @ts-ignore
import { Stat, Weapon, Armor, Item, Combatant as CombatantClass } from '@core/models/model-core.js';

// ---------------------------------------------------------------------------
// Typen für die Vanilla-Engine (minimale Beschreibung)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Snapshot-Factory — wandelt den mutablen Engine-State in eine tiefe Kopie um.
// Verhindert, dass React stale References cached.
// ---------------------------------------------------------------------------

function rehydrateCombatant(c: any): any {
  if (!c) return c;
  
  Object.setPrototypeOf(c, CombatantClass.prototype);
  
  const statFields = [
    'ac', 'acTouch', 'acFlat', 
    'str', 'dex', 'con', 'int', 'wis', 'cha', 
    'bab', 'za', 'ref', 'wil', 
    'baseZa', 'baseRef', 'baseWil'
  ];
  for (const field of statFields) {
    if (c[field]) {
      Object.setPrototypeOf(c[field], Stat.prototype);
    }
  }
  
  if (Array.isArray(c.weapons)) {
    c.weapons.forEach((w: any) => {
      Object.setPrototypeOf(w, Weapon.prototype);
    });
  }
  
  if (Array.isArray(c.armors)) {
    c.armors.forEach((a: any) => {
      Object.setPrototypeOf(a, Armor.prototype);
    });
  }
  
  if (Array.isArray(c.items)) {
    c.items.forEach((i: any) => {
      Object.setPrototypeOf(i, Item.prototype);
    });
  }
  
  return c;
}

function createSnapshot(raw: unknown): CombatStateSnapshot {
  const r = (raw as any) ?? {};

  return {
    combatants: Array.isArray(r.combatants)
      ? (JSON.parse(JSON.stringify(r.combatants)) as any[]).map((c: any) => {
          const maxHpVal = c.maxHP !== undefined ? c.maxHP : c.maxHp;
          const mapped = {
            ...c,
            maxHp: maxHpVal,
            maxHP: maxHpVal,
          };
          return rehydrateCombatant(mapped);
        }) as Combatant[]
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
      role: (r.session?.active && r.session?.role && r.session.role !== 'choice'
        ? r.session.role
        : (r.mode ?? 'choice')) as 'host' | 'player' | 'choice' | 'wizard',
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

    const mapPC = (rawPC: any) => {
      if (!rawPC) return null;
      const cloned = JSON.parse(JSON.stringify(rawPC));
      const maxHpVal = cloned.maxHP !== undefined ? cloned.maxHP : cloned.maxHp;
      const mapped = {
        ...cloned,
        maxHp: maxHpVal,
        maxHP: maxHpVal,
      };
      return rehydrateCombatant(mapped);
    };

    // Initialen Snapshot und PC setzen
    setSnapshot(createSnapshot(getState()));
    setActivePC(mapPC(getActivePC()) as Combatant | null);

    // Single handler: both state_changed and pc_changed trigger the same full re-sync.
    // Merging them avoids double-renders on events that fire together.
    const syncSnapshot = () => {
      setSnapshot(createSnapshot(getState()));
      setActivePC(mapPC(getActivePC()) as Combatant | null);
    };

    StateEvents.on('state_changed', syncSnapshot);
    StateEvents.on('pc_changed', syncSnapshot);

    // Cleanup: Listener aus dem Bus entfernen
    return () => {
      if (StateEvents.listeners['state_changed']) {
        StateEvents.listeners['state_changed'] =
          StateEvents.listeners['state_changed'].filter(cb => cb !== syncSnapshot);
      }
      if (StateEvents.listeners['pc_changed']) {
        StateEvents.listeners['pc_changed'] =
          StateEvents.listeners['pc_changed'].filter(cb => cb !== syncSnapshot);
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
