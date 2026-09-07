# Phasenplan: Priorität 2 — Technical Debt & Code Cleanliness (Status: ✅ Abgeschlossen)

> **Erstellung:** 2026-09-03 | Basis: `docs/CODE_ANALYSIS.md`  
> **Status:** ✅ Alle 5 Phasen erfolgreich umgesetzt, typgeprüft und getestet  
> **Testsuite:** 314 Core Tests + 34 Vitest UI Tests (100% grün)

---

## Übersicht der P2-Maßnahmen

| # | Bereich | Datei(en) | Beschreibung | Status |
|---|---------|-----------|--------------|--------|
| **P2.1** | **Type Safety an der App-Root** | `src/App.tsx`, `src/types/combat.ts` | Entfernen von `as any` auf `useCombatState()`, Typisierung von `SessionInfo.role` und `content` | ✅ Behoben |
| **P2.2** | **Bilingual Cleanup in BuffRules** | `js/rules/BuffRules.js` | Umstellung der verbliebenen deutschen Prompt-/Alert-/Confirm-Dialogtexte in `activateBuffByKey()` auf standardisiertes D&D 3.5e RAW Englisch | ✅ Behoben |
| **P2.3** | **Dauer-Parsing Standardisierung** | `js/rules/BuffRules.js` | Bereinigung und Robustheitserweiterung von Regex-Mustern in `calculateDurationRounds()` | ✅ Behoben |
| **P2.4** | **Production Logger im Domain-Layer** | `js/spells.js` | Ungeschützte `console.log`-Meldungen mit Entwicklungsmodus-Weiche abgesichert | ✅ Behoben |
| **P2.5** | **CQS-Absicherung in state-core** | `js/state/state-core.js` | Dokumentation des Bootstrap-Seiteneffekts in `getActivePC()` (@sideEffects) & Modernisierung des Default-Namens zu 'Adventurer' | ✅ Behoben |

---

## Phase 2.1 — Type Safety an der App-Root (`useCombatState` & `App.tsx`)

### Problem
In `src/App.tsx:12` wird der Root-Hook mit `as any` gecastet:
```tsx
const { state, activePC, isReady } = useCombatState() as any;
```
Dadurch verliert die gesamte Hauptkomponente die TypeScript-Compilerprüfung für State- und Session-Zugriffe (`state?.session?.role`, `state?.mode`).

### Lösung
1. Die Rückgabetypen von `useCombatState()` sind über `UseCombatStateReturn` in `src/types/combat.ts` bereits vollständig deklariert.
2. `App.tsx` nutzt direkt die typisierten Felder:
```tsx
const { state, activePC, isReady } = useCombatState();
const rawRole = state?.session?.role || state?.mode;
```
3. Verifikation aller Komponenten im Root-Tree auf saubere TypeScript-Typisierung ohne implizite Any-Casts.

### Verifizierung
- `npm run typecheck` muss fehlerfrei durchlaufen (`0 errors`).
- `npm run test:ui` stellt sicher, dass alle UI-Tests (z. B. `PlayerSheet.test.tsx`) weiterhin unverändert grün sind.

---

## Phase 2.2 — Bilingual Cleanup & RAW-Strings in `BuffRules.js`

### Problem
In `js/rules/BuffRules.js` (Funktion `activateBuffByKey`) sind Dialogtexte noch hartkodiert auf Deutsch hinterlegt, während der Rest der Anwendung auf D&D 3.5e RAW Englisch standardisiert wurde:
- `"Zauberplatz verbraucht ✨"` → `"Spell Slot Expended ✨"`
- `"Stacking-Konflikt"` → `"Stacking Conflict"`
- `"Buff überlagert"` → `"Buff Overridden"`
- `"Zauberstufe"` → `"Caster Level"`
- `"Keine freien Zauberplätze"` → `"No Available Spell Slots"`
- `"Zauber wirken?"` → `"Cast Spell?"`

### Lösung
1. Systematische Übersetzung aller Dialogstrings in `activateBuffByKey()` auf standardisiertes D&D 3.5e Regel-Englisch:
   - Klare, präzise RAW-Begriffe (z. B. *Caster Level*, *Prepared Spell Slot*, *Spontaneous Spell Slot*, *Bonus Stacking*).
   - Beibehaltung der HTML-Formatierungen (`<strong>`, Netto-Bonus-Berechnung).
2. Erhaltung der Rückwärtskompatibilität zu den bestehenden `DialogContext`-Bridges.

### Verifizierung
- Unit-Tests in `Tests/buff_rules_phase1.test.js`, `Tests/spell_buff_integration_phase2.test.js` und `Tests/spell_buff_integration_phase3.test.js` ausführen.

---

## Phase 2.3 — Standardisierung von `calculateDurationRounds()`

### Problem
In `js/rules/BuffRules.js:82-99` sucht die Dauererkennung nach einer Mischung aus deutschen und englischen Token:
```js
if (s.includes('round/level') || s.includes('runde/stufe'))
if (s.includes('10 min./level') || s.includes('10 min./stufe'))
if (s === '5 runden' || s === '5 rounds')
```

### Lösung
1. Primäre Ausrichtung auf standardisierte D&D 3.5e SRD-Dauerangaben (`round/level`, `10 min./level`, `min./level`, `hour/level`, `1 round`, `5 rounds`).
2. Robuste Regex-Erkennung für beliebige Runden- und Minutenangaben (`/(\d+)\s+rounds?/i`, `/(\d+)\s+min/i`).
3. Abwärtskompatible Fallback-Regel für historische deutsche Demodaten ohne Code-Duplizierung.

### Verifizierung
- Tests in `Tests/buff_durations.test.js` ausführen und neue Edge-Cases für Spell-Dauern abdecken.

---

## Phase 2.4 — Saubere Logging-Strategie im Domain-Layer

### Problem
In mehreren Dateien des `js/`-Layers (`js/spells.js`, `js/state/StorageManager.js` etc.) werden unkonditionierte `console.log`-Aufrufe getätigt, die in Production-Builds in der Browserkonsole landen.

### Lösung
1. In `js/spells.js` und `StorageManager.js` `console.log` auf `console.warn` / `console.error` für echte Problemfälle beschränken oder nur bei Dev-Flag ausgeben.
2. Production-Builds bleiben frei von informationalem Konsolenmüll.

### Verifizierung
- `npm run build` ausführen und Browserkonsole beim Laden überprüfen.

---

## Phase 2.5 — CQS-Dokumentation & Absicherung in `state-core.js`

### Problem
`getActivePC()` in `js/state/state-core.js` erzeugt bei Abwesenheit eines Spieler-Combatants einen neuen Default-PC und emittiert `state_changed`. Dies ist eine bewusste Bootstrap-Logik, verletzt aber formal das *Command-Query Separation (CQS)* Prinzip.

### Lösung
1. Explizite JSDoc-Dokumentation dieses Bootstrap-Verhaltens hinzufügen (`@sideEffects`).
2. Absicherung gegen unabsichtliche Mehrfachtrigger während Server-/Sync-Initialisierungen.

---

## Ausführungsreihenfolge & Quality Gate

```
1. Phase 2.1: App.tsx / useCombatState Type Safety → npm run typecheck
2. Phase 2.2: BuffRules.js UI-Strings Übersetzung → npm test
3. Phase 2.3: calculateDurationRounds Regex-Standardisierung → npm test
4. Phase 2.4: Domain Logger Bereinigung → npm run build
5. Phase 2.5: state-core.js Dokumentation & Absicherung
6. Gesamtvalidierung:
   - npm run typecheck (0 Errors)
   - npm test (314 Core Tests 100% grün)
   - npm run test:ui (34 UI Tests 100% grün)
   - npm run build (Erfolgreicher Production Build)
```
