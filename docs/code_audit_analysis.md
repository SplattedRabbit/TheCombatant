# Pre-Release Audit: Statische Codeanalyse & Optimierungsplan

> Ziel dieser Analyse war ein vollständiger, vorurteilsfreier Blick auf den Stand der Codebasis **kurz vor Release**.
> Die Befunde sind priorisiert: **P0** (Blocker), **P1** (Sollte vor Release), **P2** (Nice-to-have / Backlog).

---

## Ausgangslage & Testergebnis

- **Tests:** 249 / 249 ✅ (0 Fehler)
- **Build:** Kompiliert sauber (`npm run build` — `data-registry` Chunking aktiv)
- **Branch:** `feature/webapplication` — sauber, typgeprüft

---

## Befundübersicht

| # | Kategorie | Befund | Priorität | Status |
|---|-----------|--------|-----------|--------|
| 1 | Architektur | `checkPrerequisites` lebt in einer Presentation-Komponente | P1 | ✅ **Erledigt** (in `RulesFeats.js`) |
| 2 | DRY | `getAblMod` lokal in 10+ Komponenten dupliziert | P1 | ✅ **Erledigt** (in `attributeHelper.ts`) |
| 3 | DRY | `formatMod` lokal in 5+ Komponenten dupliziert | P1 | ✅ **Erledigt** (in `attributeHelper.ts`) |
| 4 | DRY | `getAblVal` (Stat-Objekt-Auflösung) 3× inline kopiert | P1 | ✅ **Erledigt** (`getStatMod` in `attributeHelper.ts`) |
| 5 | Architektur | `ArmoryTab.tsx` (933 Zeilen) überschreitet das 900-Zeilen-Limit | P1 | ✅ **Erledigt** (Split in 4 Module <360 Z.) |
| 6 | Architektur | Business-Logik (`getHealingFormulaDetails`, `getDamageFormulaDetails`) in UI | P1 | ✅ **Erledigt** (in `RulesItems.js`) |
| 7 | Architektur | `PCSkillsTab.tsx` (819 Zeilen) — Method-Patching im Render-Pfad | P2 | ⏳ Offen (Backlog) |
| 8 | Typsicherheit | 95+ `@ts-ignore`-Direktiven, `pc: any` in fast allen Komponenten-Props | P2 | ⏳ Offen (Backlog) |
| 9 | Typsicherheit | `combat.ts` enthält `any` für Stat-Felder (z.B. `za?: any`, `ref?: any`) | P2 | ⏳ Offen (Backlog) |
| 10 | Architektur | `__REACT_DIALOG_BRIDGE__` Window-Hack in 8 Komponenten | P2 | ⏳ Offen (Backlog) |
| 11 | State-Bridge | `onStateChanged` und `onPCChanged` tun identisches — ein Handler reicht | P2 | ✅ **Erledigt** (in `useCombatState.ts`) |
| 12 | Build | `vite.config.ts`: `manualChunks` enthält keine Data-Schicht | P2 | ✅ **Erledigt** (`data-registry`-Chunk) |
| 13 | Architektur | Doppelter JSDoc-Header in `PCHeader.tsx` (Zeilen 1–13) | P2 | ✅ **Erledigt** |
| 14 | Architektur | Prestige-Klassen haben keine `*Rules.js` — Formellogik liegt in FeaturesCard | P2 | ⏳ Offen (Backlog) |
| 15 | Tests | Keine Tests für React-Komponenten (nur `js/`-Schicht getestet) | P2 | ⏳ Offen (Backlog) |

---

## Detailanalyse

### 1 · `checkPrerequisites` in Presentation-Schicht (P1 · XS)

**Befund:**
Die Funktion `checkPrerequisites(feat, pc)` ist in `PCFeatsTab.tsx` definiert und wird von dort nach `FeatScrollDialog.tsx` importiert. Prerequsitenprüfung ist jedoch **Domain-Logik** (Rules-Schicht), nicht UI-Logik.

> [!IMPORTANT]
> Das verstößt direkt gegen das 4-Schichten-Modell aus `DEVELOPER_GUIDE.md` §1: *"Rules & Data (`js/rules/`) berechnet stufenbasierte Werte."*

**Analoge Funktion existiert bereits:** `classValidation.js` macht dasselbe für Prestige-Klassen — ein bewiesener Präzedenzfall.

**Lösung:** Die Funktion nach `js/rules/RulesFeats.js` extrahieren, exportieren, und in `PCFeatsTab.tsx` / `FeatScrollDialog.tsx` per `@core/rules/RulesFeats.js` importieren.

---

### 2 · `getAblMod` — 10-fache Duplizierung (P1 · S)

**Befund:** Die Funktion `Math.floor((score - 10) / 2)` ist lokal in **10+ Komponenten** als `getAblMod` definiert (teils mit unterschiedlichen Signaturen für Zahlen vs. `Stat`-Objekte):

```
PCHeader.tsx:34          | PCDefensesTab.tsx:27
features/ClericFeaturesCard.tsx:17     | features/PaladinFeaturesCard.tsx:20
features/RangerFeaturesCard.tsx:26     | features/MonkFeaturesCard.tsx:18
features/BardFeaturesCard.tsx:161,239  | offense/ClassCombatAbilitiesCard.tsx:35
offense/ActiveEquipmentSlots.tsx:82    | companion/FamiliarSheet.tsx:155
companion/CompanionSheet.tsx:130
```

**Lösung:** In `src/components/player/attributeHelper.ts` (existiert bereits für `showAttributeExplanation`) zwei kanonische Hilfsfunktionen hinzufügen:
- `getAblMod(score: number): number` — für rohe Zahlenwerte
- `getStatMod(stat: any): number` — für `Stat`-Objekte (inkl. `getValue()`-Prüfung)
- `formatMod(val: number): string` — für `+n`/`-n`-Formatierung

---

### 3 · `ArmoryTab.tsx` überschreitet 900-Zeilen-Limit (P1 · M)

**Befund:** `ArmoryTab.tsx` hat **933 Zeilen** und verletzt damit die AGENT.md-Richtlinie (> 900 Zeilen → zwingend splitten).

Die Datei enthält drei klar abgrenzbare Verantwortlichkeiten:
- **Linke Spalte:** Paperdoll-Grid (Body Slots + Slotless-Items)
- **Rechte Spalte:** Backpack-Browser + Compendium-Browser
- **Formeln:** `getHealingFormulaDetails`, `getDamageFormulaDetails` — gehören **nicht** in eine Render-Komponente (s. Befund 6)

**Lösung:** Split in:
- `ArmoryTab.tsx` (~250 Z.) — orchestriert State und Callbacks
- `ArmoryPaperdollPanel.tsx` (~300 Z.) — linke Spalte mit Slots + Slotless
- `ArmoryInventoryPanel.tsx` (~300 Z.) — rechte Spalte Backpack/Compendium

---

### 4 · Business-Logik in UI: `getHealingFormulaDetails` / `getDamageFormulaDetails` (P1 · S)

**Befund:** Die beiden Funktionen in `ArmoryTab.tsx` (Zeilen 38–85) parsen Item-Eigenschaften (inkl. Regex-Matching auf `damageFormula`, `activation.effectDescription`, Potion-Typ-Erkennung). Das ist Regellogik, keine Darstellungslogik.

> [!IMPORTANT]
> Regellogik in `src/` verletzt §1 des Architekturmodells.

**Lösung:** Diese Funktionen nach `js/rules/RulesItems.js` extrahieren, testen und von `ArmoryTab.tsx` importieren.

---

### 5 · State-Bridge: Doppelter Event-Handler (P2 · XS)

**Befund:** In `useCombatState.ts` sind `onStateChanged` und `onPCChanged` **identisch** — beide rufen `setSnapshot` und `setActivePC` auf.

```typescript
// identischer Body
const onStateChanged = () => { setSnapshot(...); setActivePC(...); };
const onPCChanged = () => { setSnapshot(...); setActivePC(...); };
```

**Lösung:** Einen gemeinsamen Handler extrahieren und für beide Events registrieren.

---

### 6 · `combat.ts`: Stat-Felder mit `any`-Typ (P2 · S)

**Befund:** In `src/types/combat.ts` sind Stat-Felder wie `za`, `ref`, `wil`, `bw`, `iniMisc` mit `?: any` typisiert. Da `Stat`-Objekte in der Engine eigene Methoden haben, könnte hier ein `StatBlock | number`-Union-Typ präziser sein.

---

### 7 · `PCSkillsTab.tsx`: Method-Patching im Render-Pfad (P2 · M)

**Befund:** Die Komponente definiert `patchedPC` via `useMemo` und fügt Methoden wie `getSkillRanks`, `getSkillMisc`, `getArmorCheckPenalty` inline hinzu. Das ist ein Workaround für die Snapshot-Rehydrierung und erzeugt Coupling zwischen UI und Domain-Methoden.

**Lösung (mittel-/langfristig):** Diese Methoden direkt in der `rehydrateCombatant`-Funktion von `useCombatState.ts` hinzufügen, sodass der `pc`-Snapshot diese Methoden bereits besitzt.

---

### 8 · Doppelter JSDoc-Header in `PCHeader.tsx` (P2 · XS)

**Befund:** `PCHeader.tsx` enthält den `@module`-Block zweimal.

---

### 9 · `vite.config.ts`: `manualChunks` ohne Data-Schicht (P2 · XS)

**Befund:** Der Chunk `state-core` deckt `js/state/`, `js/models/`, `js/rules/` ab — nicht aber `js/data/`. Datendateien wie `magicItems-data.js` (1.205 Zeilen!) und `encounter-samples.js` (1.243 Zeilen) landen damit im Haupt-Bundle.

**Lösung:** `js/data/` ebenfalls in `manualChunks` als eigenen `data-registry`-Chunk extrahieren. Das reduziert die initiale JS-Last.

---

### 10 · `__REACT_DIALOG_BRIDGE__` Window-Hack (P2 · M)

**Befund:** 8 Komponenten nutzen `(window as any).__REACT_DIALOG_BRIDGE__?.methodName?.()` um React-Dialoge aus nicht-React-Kontexten aufzurufen. Das Pattern ist technisch notwendig (Legacy-JS ruft React-Dialoge auf), aber fehleranfällig (kein Typsystem, optionale Chaining versteckt `undefined`).

**Lösung (langfristig):** Die Bridge über `CombatEngineContext` verfügbar machen, statt über `window`. Der Context wird sowieso schon von jedem Komponenten genutzt.

---

### 11 · Keine Prestige-Klassen-Rules-Dateien (P2 · L)

**Befund:** Aus dem `implementationplan.md` bekannt — Formellogik für Assassin, Arcane Trickster, etc. liegt in `PrestigeClassFeaturesCard.tsx` (Presentation), nicht in `js/rules/classes/*.js`. Das ist ein bereits bekannter technischer Schulden-Eintrag.

---

## Priorisierter Umsetzungsplan

### Phase 1 — Architektur-Compliance (✅ Vollständig abgeschlossen)

| Task | Datei(en) | Status |
|------|-----------|--------|
| **1.1** `checkPrerequisites` → `RulesFeats.js` extrahieren | `PCFeatsTab.tsx`, `FeatScrollDialog.tsx`, `RulesFeats.js` | ✅ **Erledigt** |
| **1.2** `getAblMod`, `formatMod`, `getStatMod` → `attributeHelper.ts` | 10+ Komponenten | ✅ **Erledigt** |
| **1.3** Doppelten Event-Handler in `useCombatState.ts` vereinfachen | `useCombatState.ts` | ✅ **Erledigt** |
| **1.4** Doppelten JSDoc in `PCHeader.tsx` entfernen | `PCHeader.tsx` | ✅ **Erledigt** |
| **1.5** `vite.config.ts`: `js/data/` in eigenen Chunk (`data-registry`) | `vite.config.ts` | ✅ **Erledigt** |
| **1.6** `getHealingFormulaDetails` / `getDamageFormulaDetails` → `RulesItems.js` | `ArmoryTab.tsx`, `RulesItems.js` | ✅ **Erledigt** |
| **1.7** `ArmoryTab.tsx` modularisieren (<360 Zeilen) | `PaperdollPanel.tsx`, `BackpackPanel.tsx`, `CompendiumPanel.tsx`, `armoryHelpers.ts` | ✅ **Erledigt** |

### Phase 2 — Modularisierung & Typsicherheit (Backlog, nächste Iteration)

| Task | Datei(en) | Status |
|------|-----------|--------|
| **2.1** `PCSkillsTab.tsx`-Method-Patching nach `rehydrateCombatant` verlagern | `useCombatState.ts`, `PCSkillsTab.tsx` | ⏳ Offen |
| **2.2** `combat.ts` Stat-Typen präzisieren (`StatBlock \| number`) | `combat.ts` | ⏳ Offen |
| **2.3** `@ts-ignore`-Direktiven schrittweise reduzieren | `src/components/` | ⏳ Offen |

### Phase 3 — Langfristig (> Release)

| Task | Aufwand | Status |
|------|---------|--------|
| Prestige-Klassen-Rules-Dateien erstellen (`AssassinRules.js`, etc.) | L | ⏳ Offen |
| React-Komponenten-Tests (Vitest / Testing Library) | L | ⏳ Offen |
| `__REACT_DIALOG_BRIDGE__`-Pattern durch Context-API ersetzen | M | ⏳ Offen |

---

## Nicht gefundene Probleme (explizit dokumentiert)

- ✅ Keine `console.log`/`console.warn` im `src/`-Code (sauberer Production-Code)
- ✅ Keine `console.log`/`console.warn` im `js/`-Code
- ✅ Sauberes Cleanup in `useCombatState.ts` (Event-Listener werden im Return korrekt entfernt)
- ✅ `useMemo` wird in `PCFeatsTab.tsx` und `PCSkillsTab.tsx` korrekt und ausgiebig eingesetzt
- ✅ `tsconfig.json` korrekt mit `strict: true`, `noUnusedLocals`, `noUnusedParameters`
- ✅ Die 5-Schichten-Architektur ist in der `js/`-Schicht vollständig korrekt eingehalten
- ✅ Alle Modelle haben korrekte `@module`-JSDoc-Header
- ✅ State-Facade (`state.js`) re-exportiert vollständig und korrekt
- ✅ Rehydrierung von Prototypen (`useCombatState.ts`) ist vollständig und korrekt
- ✅ `PCEquipment.js` — Waffenslot-Logik (Zwei-Hand, Double-Wielded, Shields) ist korrekt implementiert

---

## Empfehlung

> [!IMPORTANT]
> **Phase 1** sollte vor dem Release umgesetzt werden. Die Tasks sind allesamt klein (XS/S), verursachen kein Regressionsrisiko, und beheben direkte Verletzungen des 4-Schichten-Modells. Gesamtaufwand Phase 1: ~2–3 Stunden.

> [!NOTE]
> **Phase 2 und 3** sind Backlog-Kandidaten für nach dem Release. Die App ist in diesem Zustand release-fähig — die offenen Punkte sind technische Schulden, keine Bugs oder Sicherheitsprobleme.
