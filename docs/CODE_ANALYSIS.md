# TheCombatant — Code-Analyse & Findings

> **Analysiert am:** 2026-09-03 | **Branch:** `refactor/bilingual-cleanup` | **App-Version:** v6.0.0  
> **Analysiert:** Statische Codeanalyse · Clean Code · Architektur · Performance · Senior-Level Assessment

---

## Gesamtbewertung: `B+ / Senior-Adjacent`

Sehr gutes Fundament mit klarer Drei-Schichten-Architektur und hervorragender Testabdeckung.  
Gezielt nachschärfbare Pain Points in Type Safety, Domain-Layer-Qualität und Dialog-Architektur.

---

## Projektmetriken

| Metrik | Wert |
|--------|------|
| `src/` TS/TSX Dateien | 188 Dateien / 1.569 KB |
| `js/` Engine Dateien | 118 Dateien / 664 KB |
| Test-Dateien | 72 Dateien / 450 KB |
| Unit-Tests | 311 Tests (100% pass) |
| UI-Tests | 34 Tests (100% pass) |

---

## Senior-Patterns (Positiv) ✅

| Pattern | Fundort |
|---------|---------|
| `@module`/`@summary`/`@notHere` JSDoc-Header in jedem Engine-Modul | Alle `js/` Module |
| `Combatant.js` delegiert an Helper — keine Gottklasse | `js/models/Combatant.js` |
| Fehlertoleranz in Event-Bus-Iteration (`try/catch` per Listener) | `js/state/state-core.js` |
| `StorageService` sauber mit Interface + zwei Implementierungen | `src/services/storage/StorageService.ts` |
| Defensive `Array.isArray()`-Guards im Combatant-Constructor | `js/models/Combatant.js:110-154` |
| `logger.ts` mit Dev/Prod-Switch | `src/utils/logger.ts` |
| Zero TODOs/FIXMEs im gesamten Codebase | Gesamtes Repo |
| `IStorageAdapter`-Interface — austauschbare Storage-Backends | `src/services/storage/IStorageAdapter.ts` |
| `StateEvents`-Pub/Sub entkoppelt Mutations von Render-Zyklen | `js/state/state-core.js` |
| PWA + Cache-First SW mit `beforeunload`-Flush | `scratch/update_sw.js` |

---

## Findings

---

### FINDING-01 🔴 — `getAttributeMod()`: Falsche Ternary-Kaskade

**Schweregrad:** Bug — fachlich falsch  
**Priorität:** P1  
**Datei:** `js/models/Combatant.js:345-347`

```js
return score >= 10
  ? Math.floor((score - 10) / 2)
  : (score === 9 || score === 8 ? -1 : (score === 7 || score === 6 ? -2 : (score === 5 || score === 4 ? -4 : -5)));
```

**Problem:** Die D&D 3.5e Attributmodifikator-Formel lautet `Math.floor((score - 10) / 2)` für *alle* Werte, auch negative. Die Ternary-Fallback-Tabelle hat falsche Werte:

| Score | Ternary (Aktuell) | RAW D&D 3.5e (korrekt) |
|-------|-------------------|------------------------|
| 5     | -4 ❌              | -3 ✓                   |
| 4     | -4 ❌              | -3 ✓                   |
| 3     | -5 ❌              | -4 ✓                   |

**Lösung:** Die universelle Formel `Math.floor((score - 10) / 2)` funktioniert korrekt für alle Werte ≥ 1, ist kürzer und wartbar.

---

### FINDING-02 🟡 — `as any`: Type-Safety-Erosion

**Schweregrad:** Mittel  
**Priorität:** P2  
**Vorkommen:** 72+ Stellen in `src/`

```tsx
// App.tsx:12 — worst offender
const { state, activePC, isReady } = useCombatState() as any;
```

`useCombatState()` gibt bereits `UseCombatStateReturn` zurück — `as any` zerstört die Typsicherheit unnötig. Viele `(c as any).companionType`-Muster in Komponenten zeigen, dass das `Combatant`-Interface nicht mit dem JS-Modell synchron ist.

**Ursache:** Inherentes Bridge-Problem zwischen untyped JS-Domain-Layer und TypeScript-React-Layer.

---

### FINDING-03 🟡 — Interface-Divergenz: `combat.ts` vs `Combatant.js`

**Schweregrad:** Mittel  
**Priorität:** P3  
**Datei:** `src/types/combat.ts:263-365`

Das TypeScript-Interface definiert Felder, die im JS-Modell nicht existieren oder anders heißen:

| TS-Interface | JS-Modell | Status |
|-------------|-----------|--------|
| `maxHp: number` | `maxHP: number` | ❌ Doppelt, inkonsistent |
| `tempHp: number` | — | ❌ Existiert nicht |
| `initiative: number` | `init: number` | ❌ Anderer Name |

Das führt dazu, dass `[key: string]: any` benötigt wird und der TypeScript-Compiler keine echte Sicherheit bietet.

---

### FINDING-04 🟢 — `console.log` im Domain-Layer ohne Logger

**Schweregrad:** Minor  
**Priorität:** P2  
**Datei:** `js/spells.js:57`

```js
console.log('Spell database loaded successfully:', Object.keys(CombatSpells.REGISTRY).length, 'spells.');
```

Der `logger.ts`-Wrapper existiert im `src/`-Layer, wird aber in **9 `js/`-Dateien** nicht verwendet. Diese `console.log`-Aufrufe erscheinen im Production-Build.

**Betroffene Dateien:** `js/spells.js`, `js/state/StorageManager.js`, `js/ui/dialogs/FeatScrollDialog.js`, `js/ui/dialogs/DamageChoiceDialog.js`, `js/ui/dialogs/AttackChoiceDialog.js`, `js/ui/dialogs/BaseDialogs.js`, `js/ui/components/player/PCSpellDialogs.js`, `js/ui/components/player/PCBuffsDialog.js`, `js/network/MessageQueue.js`

---

### FINDING-05 🟡 — CQS-Verletzung: `getActivePC()` mutiert State

**Schweregrad:** Mittel  
**Priorität:** P2  
**Datei:** `js/state/state-core.js:61-94`

```js
export function getActivePC() {
  if (!pc) {
    pc = createCombatant({ name: 'Held', type: 'p' }); // State-Mutation in einem Getter!
    s.combatants.push(pc);
    StateEvents.emit('state_changed', s);               // Event-Emission in einem Getter!
  }
  return pc;
}
```

Verletzt das **Command-Query Separation (CQS)-Prinzip** — ein Getter darf keine Seiteneffekte haben. In der Praxis funktioniert es (bewusste Bootstrap-Logik), aber es fehlt ein erklärender Kommentar und es ist schwer testbar.

---

### FINDING-06 🟢 — Verbleibende deutsche Strings in `BuffRules.js`

**Schweregrad:** Minor  
**Priorität:** P2  
**Datei:** `js/rules/BuffRules.js:340-365`, `js/rules/BuffRules.js:82-99`

```js
showCustomConfirm(
  "Stacking-Konflikt",             // ← Deutsch
  `Ein stärkerer oder gleichwertiger Buff...` // ← Deutsch
```

```js
if (s.includes('round/level') || s.includes('runde/stufe')) // ← Mix
if (s === '5 runden' || s === '5 rounds')                   // ← Mix
```

`BuffRules.js` wurde im `refactor/bilingual-cleanup`-Branch nicht vollständig bereinigt. Die deutschen UI-Strings in Business-Logic sind außerdem ein SoC-Problem.

---

### FINDING-07 🟡 — `DialogContext`: Einzel-Modal-Slot statt Stack

**Schweregrad:** Mittel — strukturelles Architekturlimit  
**Priorität:** P3  
**Datei:** `src/context/DialogContext.tsx:56`

```tsx
const [activeModal, setActiveModal] = useState<{ id: string; type: string; props: any } | null>(null);
```

Es gibt **nur einen aktiven Modal-Slot**. Wenn ein Dialog einen zweiten Dialog öffnet (z.B. Buff-Details → Bestätigungs-Dialog), wird der erste durch den zweiten ersetzt. Ein Modal-Stack (`Array<Dialog>`) würde verschachtelte Dialoge korrekt handhaben.

**Symptom:** Vergangene "Dialog verschwindet"-Bugs sind auf dieses Limit zurückzuführen.

---

### FINDING-08 🔴 — `localStorage.clear()` im ErrorBoundary

**Schweregrad:** Hoch — löscht fremde Daten  
**Priorität:** P1  
**Datei:** `src/components/ErrorBoundary.tsx:32-34`

```tsx
private handleReset = () => {
  localStorage.clear(); // Löscht ALLES — inkl. Supabase Auth-Token
  window.location.reload();
};
```

`localStorage.clear()` löscht auch Third-Party-Keys (Supabase Auth-Session, andere App-Daten). Nach einem Crash werden eingeloggte User ausgeloggt, was unerwartet und störend ist.

**Lösung:** Gezieltes Löschen nur des App-Keys: `localStorage.removeItem('dd_combatsheet_state')`

---

### FINDING-09 🟡 — `Promise.all` für Spell-Load ist fail-fast

**Schweregrad:** Mittel  
**Priorität:** P1  
**Datei:** `js/spells.js:22`

```js
const results = await Promise.all(promises); // Fail-fast: 1 Fehler → alle Spells verloren
```

`Promise.all` bricht ab, wenn *ein* JSON-File nicht geladen werden kann. Bei einem 404 auf `spells-cs.json` (Complete Scoundrel) sind *alle* Zauber nicht verfügbar.

**Lösung:** `Promise.allSettled` würde die anderen Bücher trotzdem laden und nur das fehlende Buch überspringen.

---

## Architekturelle Schulden

### `window.__REACT_DIALOG_BRIDGE__` — Global-Coupling

**Datei:** 8 Stellen in `js/ui/`  
(`BaseDialogs.js`, `FeatScrollDialog.js`, `DamageChoiceDialog.js`, `AttackChoiceDialog.js`, `PrepareSpellDialog.js`, `PCBuffsDialog.js`, `PCSpellDialogs.js`, `dialogs.js`)

```js
if (typeof window !== 'undefined' && window.__REACT_DIALOG_BRIDGE__) {
  return window.__REACT_DIALOG_BRIDGE__;
}
```

**Bewertung:** Funktional korrekte Übergangsarchitektur während der Migration von Vanilla JS zu React. Kein Compile-Time-Schutz, schwer testbar ohne echten DOM-Kontext. Das Pattern ist temporär bewusst gewählt — sollte langfristig aufgelöst werden wenn alle Dialog-Aufrufe aus der Domain-Engine entfernt werden.

---

## TypeScript-Qualität

| Problem | Schweregrad |
|---------|------------|
| `useCombatState() as any` in `App.tsx:12` | 🔴 Vermeidbar |
| `StatValue = any` in `combat.ts:29` | 🔴 Sollte `StatBlock \| number` sein |
| `Combatant`-Interface hat `[key: string]: any` als Escape-Hatch | 🟡 Zu breit |
| `core-modules.d.ts` — fast alles `any` | 🟡 Inherentes Bridge-Problem, schrittweise verbesserbar |

---

## Performance-Analyse

### Bundle-Struktur (Production Build v6.0.0)

| Chunk | Größe (gzip) | Bewertung |
|-------|-------------|-----------|
| `react-vendor` | 60.6 KB | ✅ Normal |
| `supabase-vendor` | 55.7 KB | ✅ Normal |
| `state-core` (Domain Engine) | 45.4 KB | ✅ Gut |
| `data-registry` (Feats, Items, Spells) | 41.7 KB | ✅ Gut |
| **`app-core` (alle React-Komponenten)** | **172.8 KB** | ⚠️ Groß |

### Weitere Performance-Risiken

**`Stat.getValue()` — O(n) ohne Caching:**  
`getValue()` wird bei jedem Render für AC, Saves und Attribute mehrfach aufgerufen. Keine Memoization vorhanden. Ein `isDirty`-Flag mit Caching wäre eleganter, aber aktuell kein kritisches Problem.

**`rebuildStatModifiers()` — Cascade-Rebuild:**  
Wird im Constructor und bei jedem State-Update aufgerufen. Iteriert alle Buffs über alle Stats. Bei vielen gleichzeitigen Combatants mit aktiven Buffs kumulierend.

---

## Testabdeckung

| Bereich | Status |
|---------|--------|
| Domain Engine (Rules, Models, State) | ✅ Sehr gut — 311 Tests |
| Storage (Local + Supabase + Resilience) | ✅ Gut |
| Realtime / Network / Sync | ✅ Gut |
| **UI-Tests (React Testing Library)** | ⚠️ **34 Tests für 188 TSX-Dateien — niedrig** |
| E2E-Tests | ❌ Nicht vorhanden |
| ErrorBoundary-Tests | ❌ Nicht vorhanden |
| Performance-Benchmarks | ❌ Nicht vorhanden |

> **Risiko:** Der UI-Test-Ratio (34/188 ≈ 18%) ist das größte Risiko für Refactorings. Änderungen an `PlayerSheet`, `DMScreen` oder `DialogContext` können unbemerkt Regressionen einführen.

---

## Priorisierte Maßnahmenliste

### Priorität 1 — Bugfixes (fachlich falsch / sicherheitskritisch)

| # | Problem | Datei | Impact |
|---|---------|-------|--------|
| P1.1 | `getAttributeMod()`: Score 4→-4 (falsch, RAW: -3) | `Combatant.js:347` | 🔴 Hoch |
| P1.2 | `localStorage.clear()` löscht Supabase Auth-Token | `ErrorBoundary.tsx:32` | 🔴 Mittel |
| P1.3 | `Promise.all` in `spells.loadSpells()` — fail-fast | `spells.js:22` | 🟡 Mittel |

### Priorität 2 — Technical Debt

| # | Problem | Datei | Impact |
|---|---------|-------|--------|
| P2.1 | `as any` auf `useCombatState()` entfernen | `App.tsx:12` | 🟡 Mittel |
| P2.2 | Restliche deutsche UI-Strings in `activateBuffByKey()` | `BuffRules.js:340-365` | 🟢 Low |
| P2.3 | `calculateDurationRounds()` deutsche String-Matches bereinigen | `BuffRules.js:82-99` | 🟢 Low |
| P2.4 | `console.log` in `spells.js` und 8 weiteren `js/`-Dateien | `spells.js:57` | 🟢 Low |
| P2.5 | `getActivePC()` CQS-Verletzung dokumentieren | `state-core.js:61` | 🟢 Low |

### Priorität 3 — Architektur

| # | Problem | Lösung | Impact |
|---|---------|--------|--------|
| P3.1 | Einzel-Modal-Slot → Modal-Stack | `DialogContext.tsx`: `useState` → `useState<Dialog[]>` | 🟡 Mittel |
| P3.2 | `Combatant`-TS-Interface mit JS-Modell synchronisieren | `combat.ts`: `maxHp`/`init`/`tempHp` angleichen | 🟡 Mittel |
| P3.3 | `StatValue = any` konkretisieren | `combat.ts:29` → `StatBlock \| number` | 🟢 Low |

### Priorität 4 — Tests

| # | Problem | Impact |
|---|---------|--------|
| P4.1 | UI-Tests für `PlayerSheet`, `DMScreen`, `DialogContext` hinzufügen | 🟡 Mittel |
| P4.2 | `ErrorBoundary`-Tests hinzufügen | 🟢 Low |
| P4.3 | E2E-Tests (Playwright) — optional, aber empfohlen | 🟢 Low |

---

## Langfristige Architektur-Roadmap

```
v6.0.0 (Jetzt)
    ↓
P1: Bugfixes (getAttributeMod, ErrorBoundary, Promise.allSettled)
    ↓
P2: Technical Debt (as any, Strings, console.log)
    ↓
P3: Architektur (Modal-Stack, Interface-Sync)
    ↓
P4: Tests (UI-Tests ausbauen)
    ↓
Langfristig: js/ui/ vollständig auflösen → Bridge obsolet
```

**Langfristiges Ziel:** Die `js/ui/`-Schicht und das `window.__REACT_DIALOG_BRIDGE__`-Pattern vollständig auflösen. Wenn alle Dialog-Aufrufe aus der Domain-Engine entfernt werden, ist die Architektur vollständig clean — Domain-Layer ruft keine UI auf, Bridge wird obsolet.

---

*Analyse-Grundlage: Statische Inspektion von 30+ Quelldateien, Grep-Analyse über gesamtes Repository, Build-Output-Analyse (Production Build v6.0.0), Test-Ergebnisse (311 Unit + 34 UI Tests).*
