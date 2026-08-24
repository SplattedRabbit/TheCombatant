/**
 * @module    useCombatState
 * @summary   State-Bridge zwischen der bestehenden Vanilla-Engine (über CombatEngineContext) und React.
 *            Abonniert state_changed / pc_changed Events und spiegelt sie als unveränderliche
 *            Snapshots in React-State. Jedes Event triggert ein Re-Render.
 *            Nutzt schlanke DTO-Hydration ohne V8-Prototyp-Mutationen (Object.setPrototypeOf Deopt Fix).
 * @exports   useCombatState
 * @reads     CombatEngineContext, StateEvents (state_changed, pc_changed), getState(), getActivePC()
 * @stateOps  keine — dieser Hook ist read-only. Mutationen über js/state.js-Funktionen.
 * @depends   src/context/CombatEngineContext
 * @notHere   Mutations-Logik → js/state/ | Typen → src/types/combat.ts
 */

import { useState, useEffect, useContext } from 'react';
import { CombatEngineContext } from '../context/CombatEngineContext';
import type { CombatStateSnapshot, Combatant, UseCombatStateReturn } from '../types/combat';
// @ts-ignore
import { Stat, Weapon, Armor, Item, Combatant as CombatantClass } from '@core/models/model-core.js';

// ---------------------------------------------------------------------------
// Schlanke Snapshot-Factory ohne V8-Deoptimierungen
// Erstellt saubere DTO-Objekte mit Prototyp-Methoden zur Allokationszeit (Object.create)
// ---------------------------------------------------------------------------

const STAT_FIELDS = [
  'ac', 'acTouch', 'acFlat',
  'str', 'dex', 'con', 'int', 'wis', 'cha',
  'bab', 'za', 'ref', 'wil',
  'baseZa', 'baseRef', 'baseWil'
] as const;

function hydrateStat(rawStat: any): any {
  if (rawStat === null || rawStat === undefined) return rawStat;
  if (typeof rawStat === 'number') return rawStat;
  const s = Object.create(Stat.prototype);
  return Object.assign(s, rawStat);
}

function hydrateCombatant(raw: any): Combatant {
  if (!raw) return raw;

  const maxHpVal = raw.maxHP !== undefined ? raw.maxHP : raw.maxHp;
  const c: any = Object.create(CombatantClass.prototype);
  Object.assign(c, raw, {
    maxHp: maxHpVal,
    maxHP: maxHpVal,
  });

  // Hydrate Stat objects with prototype methods at allocation time
  for (const field of STAT_FIELDS) {
    if (c[field]) {
      c[field] = hydrateStat(c[field]);
    }
  }

  // Hydrate nested arrays
  if (Array.isArray(c.weapons)) {
    c.weapons = c.weapons.map((w: any) => Object.assign(Object.create(Weapon.prototype), w));
  }
  if (Array.isArray(c.armors)) {
    c.armors = c.armors.map((a: any) => Object.assign(Object.create(Armor.prototype), a));
  }
  if (Array.isArray(c.items)) {
    c.items = c.items.map((i: any) => Object.assign(Object.create(Item.prototype), i));
  }

  return c;
}

function normalizeRole(rawRole: string | undefined): 'host' | 'player' | 'choice' | 'wizard' {
  if (!rawRole || rawRole === 'choice') return 'choice';
  if (rawRole === 'host' || rawRole === 'dm') return 'host';
  if (rawRole === 'player' || rawRole === 'client') return 'player';
  if (rawRole === 'wizard') return 'wizard';
  return 'choice';
}

function createSnapshot(raw: unknown): CombatStateSnapshot {
  const r = (raw as any) ?? {};

  const rawRole = (r.session?.role && r.session.role !== 'choice')
    ? r.session.role
    : (r.mode ?? 'choice');
  const role = normalizeRole(rawRole);

  const combatants = Array.isArray(r.combatants)
    ? r.combatants.map((c: any) => hydrateCombatant(c))
    : [];

  return {
    combatants,
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
      role,
      roomCode: r.session?.roomCode ?? '',
    },
    mode: r.mode || (role === 'host' ? 'dm' : role),
    concentrations: Array.isArray(r.concentrations) ? [...r.concentrations] : [],
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

    const syncState = () => {
      const state = getState();
      const pc = getActivePC();
      setSnapshot(createSnapshot(state));
      setActivePC(pc ? hydrateCombatant(pc) : null);
    };

    // Initial sync
    syncState();

    // Single subscription for state & pc changes
    StateEvents.on('state_changed', syncState);
    StateEvents.on('pc_changed', syncState);

    return () => {
      StateEvents.off('state_changed', syncState);
      StateEvents.off('pc_changed', syncState);
    };
  }, [isReady, getState, getActivePC, StateEvents]);

  return {
    state: snapshot,
    activePC,
    isReady,
  };
}
