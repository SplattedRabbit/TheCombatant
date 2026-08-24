# D&D 3.5e Combat App — Entwicklerhandbuch (Developer Guide)

## 🤖 Agent Handover & Quickstart Prompt (Copy & Paste for new Sessions)

> **Prompt für den nächsten Agenten:**
> ```text
> Hallo Antigravity! Bitte setze die Arbeit an der D&D 3.5e CombatApp nahtlos fort.
> 
> ### 📌 Projekt- & Architektur-Kontext:
> - **Branch:** `feature/webapplication` (Arbeitsbranch, niemals direkt auf `main` mergen).
> - **Technologie-Stack:** TypeScript, React 19, Vanilla CSS (Design-Tokens, Pergament-Ästhetik, HSL), Supabase (Auth, PostgreSQL mit JSONB-Storage, Realtime WebSockets), Native Node.js Test-Runner (`node:test`).
> - **Sprache:** Die gesamte Benutzeroberfläche (Buttons, Dialoge, Badges, Tabs, Tooltips) ist strikt auf Englisch (100% English UI).
> - **PowerShell-Syntax:** Bei verketteten Shell-Befehlen unter Windows immer `;` anstelle von `&&` verwenden.
> 
> ### 🌟 Zuletzt implementierter Stand (v6.0.2):
> 1. **Saves & Defenses Input Hardening (`PCDefensesTab.tsx`, `PCGeneral.js`, `Stat.js`):**
>    - Alle Zahlenfelder (AC, Saves, Initiative, Speed, SR, DR) nutzen lokale Eingabepufferung (`localValues`), wodurch flüssiges Tippen, Backspace und Editieren ohne Re-Render-Cursorlocks gewährleistet sind.
>    - Sichere numerische Extraktion aller `Stat`-Objektinstanzen (`.getValue?.() ?? .base ?? 10`), keine `[object Object]`-Locks im Browser.
> 2. **Initiative & Total-Sync (Table-First, kein Würfelbot):**
>    - Das Feld `Rolled` nimmt den am physischen Tisch gewürfelten d20-Wert entgegen.
>    - `Total` errechnet dynamisch `Rolled + Initiative Mod` (z. B. `14 + 13 = 27` bei Valerius) und synchronisiert den Gesamtwert an den DM-Screen. Vor dem Wurf zeigt `Total` sauber `--`.
>    - Der Würfelbot wurde vollständig entfernt; der 🎲-Button dient rein als statisches Modifikatoren-Aufschlüsselungsfenster.
> 3. **Stat-Klasse & Recalculate-Stabilität:**
>    - `Stat.js` besitzt nun `get mod()` und die Alias-Methode `getMod()`. `recalculatePCStats` läuft unterbrechungsfrei durch.
> 
> ### 🧪 Pflicht-Verifikation bei jedem Schritt:
> - Tests: `node --import ./Tests/setup.js --test --test-reporter=dot Tests/**/*.test.js`
> - Typecheck: `npm run typecheck`
> - Build: `npm run build`
> 
> Lies bei Bedarf die `docs/DEVELOPER_GUIDE.md` und `docs/PATCHNOTES.md` für weitere Details. Wie lautet die nächste Aufgabe?
> ```
> 
> Willkommen im Projekt! Dieses Handbuch dient als zentrale Referenz für neue AI-Agenten und Entwickler, um sich in Sekunden in der Codebasis zurechtzufinden und token-schonend zu arbeiten.

---

## 1. Architektur im Überblick (6-Schichten-Modell)

1. **Presentation Layer (`src/`)**: Komplett in React + Vite + TypeScript. Rendert die UI, Dialoge, Badges (`SyncIndicator.tsx`), Helden-Bibliothek (`CharacterRosterDialog.tsx`), DM-Dashboard (`CampaignManagerDialog.tsx`), Live-Tischleiste (`TablePresenceBar.tsx`) und leitet Inputs an die State-Bridge weiter.
2. **State-Bridge (`src/hooks/useCombatState.ts`)**: Abonniert den Vanilla-EventBus (`StateEvents`) und liefert immutable Snapshots mit Prototyp-Rehydrierung an die React-Komponenten.
3. **Character, Campaign & Storage Service Layer (`src/services/`)**: 
   - `CharacterService.ts`: Verwaltet Helden-Roster (Erstellen, Duplizieren, Löschen, Zero-Loss Switching, 1-Klick-Import).
   - `CampaignService.ts`: Verwaltet DM-Kampagnen (Erstellen mit automatischem Einladungscode, Duplizieren, Löschen, Zero-Loss Encounter-Isolation, Spieler-Beitritt).
   - Adapter-Pattern (`IStorageAdapter`): Schaltet zwischen `LocalStorageAdapter` (Gast/Offline) und `SupabaseStorageAdapter` (Cloud-Sync mit 800ms Debounce & Local-First Puffer) um.
4. **Realtime WebSocket & Sync Layer (`src/services/network/`, `js/network/`)**:
   - `RealtimeManager.ts`: Verwaltet Supabase Realtime Channels (`campaign:<id>`), Broadcast-Events (`diff`, `dice_roll`, `turn_change`) und die Presence-API für Online-Teilnehmer.
   - `RealtimeSyncBridge.ts`: Verbindet den In-Memory-State (`StorageManager.js` / `SyncProtocol.js`) mit dem Realtime-Kanal (<30ms Diff-Sync).
   - *PeerJS/WebRTC wurde vollständig durch Supabase Realtime Channels ersetzt.*
5. **State Management & Facades (`js/state/`)**: Verwaltet den In-Memory-Zustand (`PCManager.js`, `EncounterManager.js`, `StorageManager.js`).
6. **Domain Models & Rules (`js/models/`, `js/rules/`, `js/data/`)**: Reines, HTML-freies OOD. Stat-Kapselung mit Modifikatoren-Stacking (`Stat.js`), `Weapon.js`, `Armor.js`, `Item.js` und `Combatant.js`.

---

## 2. Pflichtbefehle & Token-Optimierung (CRITICAL)

Da große Dateien den AI-Kontext blockieren, müssen folgende Befehle und Verhaltensweisen zwingend eingehalten werden:

### 2.1 Testen mit minimalem Output:
Ausführliche Test-Protokolle verbrauchen Tausende Token. Verwende **immer** den `--test-reporter=dot` Parameter.
```powershell
# 1. GEZIELTES TESTEN (während der Entwicklung nur die betroffene Datei testen):
node --import ./Tests/setup.js --test --test-reporter=dot Tests/realtime_service.test.js

# 2. GLOBALER TESTLAUF (NUR einmalig direkt vor dem Turn-Ende erlaubt):
node --import ./Tests/setup.js --test --test-reporter=dot Tests/**/*.test.js
```

### 2.2 Suchen statt Laden:
* **D&D 3.5e Regelwerk (2.2 MB):** Niemals `playershandbook_35e.txt` laden. Nutze:
  ```powershell
  node scratch/search_rules.js "<Suchbegriff>"
  ```
* **Zauber-Datenbank (610 KB):** Niemals `data/spells_de.json` laden. Nutze:
  ```powershell
  node scratch/search_spells.js "<Zaubername>"
  ```
* **Gezieltes Datei-Lesen:** Bei der Untersuchung von Quellcodedateien immer einen Zeilenbereich angeben (`StartLine` & `EndLine`), anstatt die ganze Datei einzulesen.

---

## 3. Storage- & Cloud-Sync-System (Phase 3)

* **Adapter-Pattern (`src/services/storage/`):**
  - `IStorageAdapter.ts`: Definiert den Vertrag für alle Speicheradapter samt Entity-Hooks (`saveCharacter`, `saveCampaign`) und Lifecycle-Events.
  - `LocalStorageAdapter.ts`: Synchroner Fallback für Gäste, Offline-Nutzung und Node-Testläufe mit lokaler Index-Verwaltung (`dd_character_index`, `dd_campaign_index`).
  - `SupabaseStorageAdapter.ts`: Local-First Puffer + 800ms Debounce Batching + Dual-Routing (`characters` vs. `campaigns`).
  - `StorageService.ts`: Zentraler Singleton-Dispatcher. Schaltet bei Login (`AuthContext`) auf Supabase und bei Logout auf LocalStorage.
* **UI-Sync-Hook (`useSyncStatus.ts`):**
  - Liefert `{ status, adapterName, lastSyncedAt, error, flushPendingSaves }` reaktiv an Komponenten.
  - Ermöglicht dem `SyncIndicator.tsx` im Header Live-Statusfeedback (Synchronisiert, Speichert, Offline, Gast).

---

## 4. Multi-Character-System & Helden-Bibliothek (Phase 4)

* **CharacterService (`src/services/character/CharacterService.ts`):**
  - `listCharacters(filter?)`: Liefert alle aktiven Charaktere des Benutzers sortiert nach `updated_at`.
  - `createCharacter(input)`: Erzeugt neuen Charakter mit Standard- oder Wizard-State.
  - `duplicateCharacter(id)`: Klont Charakter, vergibt neue UUIDs und hängt `(Kopie)` an.
  - `deleteCharacter(id)`: Soft-Delete mit automatischem Umschalten auf den nächsten verfügbaren Helden.
  - `switchActiveCharacter(id)`: **Zero-Loss Switching**:
    1. Flusht anstehende Saves des alten Helden (`flushPendingSaves()`).
    2. Lädt neuen Helden aus Supabase (oder lokalem Cache).
    3. Setzt Zeiger `activeCharacterId` im aktiven Storage-Adapter.
    4. Hydriert den State via `applyLoadedState()`.
    5. Triggert Re-Rendering der UI.
  - `importFromLocalStorage()`: 1-Klick-Übernahme ungespeicherter lokaler Gast-Daten in die Cloud.
* **Helden-Bibliothek UI (`CharacterRosterDialog.tsx`):**
  - Modal erreichbar über `📜 Helden` im Header oder im Profil-Dropdown `UserMenu.tsx`.

---

## 5. DM Multi-Campaign & Session Dashboard (Phase 5)

* **CampaignService (`src/services/campaign/CampaignService.ts`):**
  - `listCampaigns(filter?)`: Liefert alle aktiven Kampagnen des Spielleiters mit Encounter-Metadaten (`round`, `combatantCount`, `location`).
  - `createCampaign(input)`: Erzeugt eine neue Kampagne mit automatischem Einladungscode (`generateInviteCode()`, z. B. `RAVEN-42`).
  - `duplicateCampaign(id)`: Klont die gesamte Begegnung (Monster, Initiative-Reihenfolge, Rundenstand) mit neuem Code.
  - `deleteCampaign(id)`: Soft-Delete mit automatischem Umschalten auf die nächste Runde.
  - `switchActiveCampaign(id)`: **Zero-Loss Encounter Isolation**:
    1. Flusht anstehende Saves des alten Encounters (`flushPendingSaves()`).
    2. Lädt neuen Encounter-State aus Supabase (oder lokalem Cache).
    3. Setzt Zeiger `activeCampaignId` im aktiven Storage-Adapter.
    4. Hydriert den State via `applyLoadedState()`.
    5. Triggert Event-Bus (`state_changed`, `encounter_changed`).
  - `joinCampaignByCode(code, characterId?)`: Spieler treten über den 6-stelligen Code bei und verknüpfen ihren Helden.

---

## 6. Realtime WebSocket-Sync & Presence (Phase 6)

* **RealtimeManager (`src/services/network/RealtimeManager.ts`):**
  - `joinCampaign(campaignId, role, userInfo)`: Tretet dem WebSocket-Channel `campaign:<id>` bei und meldet sich via `channel.track()` bei der Presence-API an.
  - `leaveCampaign()`: Verlässt den Kanal sauber bei Raum- oder Kampagnenwechsel.
  - `broadcastDiff(diff)`: Sendet schlanke Delta-Objekte mit Sequence-Number und Echo-Prävention.
  - `broadcastDiceRoll(rollData)` & `broadcastTurnChange(turnData)`: Streamt Würfe und Rundenwechsel in Echtzeit (<30ms).
* **TablePresenceBar UI (`src/components/shared/TablePresenceBar.tsx`):**
  - Zeigt im Header aller Teilnehmer live an, wer aktuell am Tisch sitzt (`🟢 DM (Julian)`, `🟢 Valeros (Alex)`).

---

## 7. Dateigrößen & Modularisierung

* **Richtwerte für Dateilängen (AGENT.md):**
  * `< 300 Zeilen`: Ideal.
  * `300–600 Zeilen`: Akzeptabel (Header ist Pflicht).
  * `600–900 Zeilen`: Split-Prüfung bei der nächsten Erweiterung.
  * `> 900 Zeilen`: Zwingend splitten.

---

## 8. Kern-Systeme & wichtige APIs

* **Stat-System (`Stat.js`):** Berechnet stapelbare Boni. Dodge- und untypisierte Boni kumulieren (additiv). Boni anderer Typen (z. B. Enhancement, Deflection) stacken nicht — es zählt nur der höchste Wert.
* **React State-Bridge & Prototyp-Rehydrierung (`useCombatState.ts`):**
  - Der Hook klont den mutable Engine-State tief, damit React bei Änderungen frische Objekt- und Array-Referenzen erhält.
  - `rehydrateCombatant` stellt nach dem Klonen mittels `Object.setPrototypeOf` die Prototypen für `Combatant`, `Stat`, `Weapon`, `Armor` und `Item` wieder her.
* **Cache-Versionierung:** Das Muster ist `dnd-combatsheet-vX.Y.Z-cache-vN`. Bei Bugfixes innerhalb einer Version wird nur `N` inkrementiert.

---

## 9. QA-Automation & CI/CD-Pipeline (Phase 7)

* **Native Multi-Client Simulation (`Tests/realtime_multiclient_simulation.test.js`):**
  - Simuliert einen vollen 4er-Tisch (1 DM + 3 Spieler) rein im schnellen Node.js In-Memory Runner (`node:test`) ohne schwere Browser-Binaries wie Playwright oder Cypress.
  - Prüft Presence-Tracking, Initiative-Broadcasts, HP-Schadens-Diffs, Rundenwechsel und Echo-Prävention in <1s.
* **Offline-Resilienz (`Tests/storage_resilience_offline.test.js`):**
  - Simuliert Netzwerkabbrüche, synchronen LocalStorage-Puffer und Auto-Recovery/Flush nach Reconnect.
* **GitHub Actions CI/CD (`.github/workflows/ci.yml` & `deploy.yml`):**
  - Jeder Push und Pull Request führt automatisch:
    1. `npm ci`
    2. `npm run typecheck` (0 Fehler)
    3. `npm test` mit Dot-Reporter (100% grün)
    4. `npm run build` (0 Warnungen) aus.
