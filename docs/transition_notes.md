# Übergangsprotokoll: React-Transition vollständig abgeschlossen (v4.0.0-Ready)

**Datum:** 2026-06-14  
**Status:** ✅ Alle 5 Migrations-Meilensteine vollständig abgeschlossen  
**Ziel:** Portierung der CombatApp von Vanilla JS zu React + Vite + TypeScript  

---

## 1. Übersicht der letzten Meilensteine

### Milestone 4 — Dungeon Master Screen & Initiative-Leiste (React)
- **Root-Routing & Mediator (`src/App.tsx`)**: Kapselt das rollenbasierte Routing (Auswahl -> Spielerbogen bzw. DM-Screen).
- **DM Screen Layout (`src/components/dm/DMScreen.tsx`)**: Koordiniert die zweispaltige Spielleiter-Ansicht, Rundensteuerungen und das System-Dropdown.
- **Drag-and-Drop Initiativeleiste (`src/components/dm/InitBar.tsx`)**: Native HTML5 Drag-and-Drop Sortierung zur dynamischen Initiative-Interpolierung und Event-Propagierung.
- **DM-Kämpfer-Tabelle (`src/components/dm/DMCombatantsTable.tsx`)**: Integriert separate Spieler- und Gegneransichten, Begleiter-Einrückung (`padding-left: 14px;`), HP-Bars, Save-Inputs und inline Schadensregler.
- **DM Toolbox & Schnellreferenz (`src/components/dm/DMToolbox.tsx` & `RefOverlay.tsx`)**: Countdown-Konzentrationszauber, WebRTC SL-Nachrichtensender und ein Modal für D&D-Bedingungen.
- **Automatische Hydrierung & Session-Wiederherstellung (`src/context/CombatEngineContext.tsx`)**: Lädt beim Bootstrap der React-App die Spells-JSON, hydrated den LocalStorage und stellt PeerJS-Multiplayer-Sitzungen reaktiv wieder her.

### Milestone 5 — WebRTC & Build-Optimierung
- **Rollup Chunk-Splitting (`vite.config.ts`)**: Konfiguration von `manualChunks` zur Aufteilung von externen Bibliotheken (`vendor`) und Kapselung der Core-Engine-Pfade in ein gemeinsames Chunk-Paket zur Beseitigung von Build-Warnungen.
- **Dynamischer Service Worker Sync (`scratch/update_sw.js`)**: Automatischer Postbuild-Script-Aufruf, der die gebauten Vite-Assets scannt, die `ASSETS`-Caching-Tabelle in `service-worker.js` aktualisiert und die Cache-Version hochzählt (aktuell: `v9`).
- **WebRTC Status-Anbindung**: Einbettung des `#connectionDot` Elements in die React-Dropdowns zur automatischen reaktiven Synchronisierung des PeerJS-Verbindungsstatus durch die Connection-Engine.

---

## 2. Aktueller Status

- **Unit-Tests:** 186/186 ✅  
  `node --import ./Tests/setup.js --test Tests/**/*.test.js`
- **TypeScript:** 0 Fehler ✅  
  `npm run typecheck` (ausgeführt via `tsc --noEmit`)
- **Vite Build:** Erfolgreich gebündelt & SW synchronisiert ✅  
  `npm run build`
- **Vite Dev-Server:** Startet sauber auf `http://localhost:5173/index-react.html` ✅  
  `npm run dev`

---

## 3. Deployment- & Verifikationsleitfaden

1. **Entwicklung**: Starte `npm run dev` zum lokalen Testen im Browser.
2. **Build & SW Sync**: Führe `npm run build` aus. Der Service Worker wird automatisch aktualisiert.
3. **Tests**: Verifiziere das Regelwerk mit `npm run test` vor jedem Release.
