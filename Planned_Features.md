# 🗺️ TheCombatant - Planned Features & Roadmap

Dieses Dokument dient als zentrales Backlog und Tracking-Dokument für geplante Features, Architektur-Refactorings und Verbesserungen.

---

## 🚀 Aktuell in Arbeit (In Progress)

### 🧙‍♂️ 1. Geführter Level-Up-Assistent (In-Game Level Advancement)
- **Status:** `In Progress` (Branch: `feat/levelup-refinements`)
- **Ziel:** Ermöglicht den Stufenaufstieg bestehender Charaktere ($n \rightarrow n+1$) direkt aus dem Character Sheet in einem fokussierten 4-Schritte-Assistenten:
  - **Schritt 1:** Klasse, Attributssteigerung (+1 auf Stufe 4, 8, 12, 16, 20) und Trefferwürfel-Wurf (mit dynamischem CON-Bonus).
  - **Schritt 2:** Vollflächige Fertigkeiten-Verteilung & Skill-Tricks.
  - **Schritt 3:** Talente & Alternative Klassenfeatures (ACFs) mit RAW-Voraussetzungsprüfung.
  - **Schritt 4:** Pergament-Zusammenfassung und transaktionales Speichern.

---

## 🧹 Geplante Refactorings & Technische Schulden

### 🔤 2. Vereinheitlichung auf rein englische Entity-Modelle (Legacy Cleanup)
- **Priorität:** `Hoch` (nach Abschluss des Level-Up-Features)
- **Aufwand:** 🟢 Gering bis 🟡 Mittel (~1–2 Tage)
- **Beschreibung:**
  - Historisch bedingt enthalten viele Datenstrukturen (`data/spells-*.json`, `js/data/feats/*.js`, `skills-data.js`) noch zweisprachige Felder (`nameDe`, `nameEn`, `benefitDe`).
  - **Maßnahmen:**
    - Bereinigung der JSON- und Registry-Dateien auf eindeutige Felder (`id`, `name`, `benefit`, `description`).
    - Bereinigung von über 30 React-Komponenten von Fallbacks wie `item.nameEn || item.nameDe || item.name`.
    - Vereinheitlichung der TypeScript-Typen in `src/types/combat.ts`.
    - Integration eines automatischen Migrationslayers in `CombatState.importPC()`, damit alte exportierte JSON-Dateien mit deutschen Bezeichnungen weiterhin nahtlos importiert werden können.
  - **Vorteile:** Keine Verwechslungen bei Eigenschaftsnamen mehr, sauberere Types, kleinere Bundle-Größen.

---

## 📋 Feature-Backlog (Geplante Erweiterungen)

### ⚔️ 3. Encounter Builder & Herausforderungsgrad (CR)-Rechner
- **Zielgruppe:** DM
- **Beschreibung:**
  - Werkzeug zur schnellen Erstellung von Begegnungen basierend auf Spieleranzahl und Gruppenstufe.
  - Automatische Berechnung des effektiven Encounter-Levels (EL) und XP-Vergabe nach D&D 3.5e DMG-Tabellen.

### 📜 4. Homebrew & Custom Content Creator
- **Zielgruppe:** Spieler & DM
- **Beschreibung:**
  - In-App-Dialoge zur Erstellung eigener Talente, Zauber, Klassen und magischer Gegenstände mit lokaler Speicherung und Exportfunktion.

### 🎲 5. Globaler Würfelverlauf & Realtime Action Log
- **Zielgruppe:** Spieler & DM
- **Beschreibung:**
  - Einblendbare Seitenleiste/Ticker, die alle Angriffe, Rettungswürfe, Zauber und Statuseffekte der aktuellen Spielrunde chronologisch auflistet.

### 🎒 6. Gruppen-Loot & Inventar-Verteilung
- **Zielgruppe:** DM & Spieler
- **Beschreibung:**
  - Eine gemeinsame Beutetruhe für die Kampagne, aus der Gegenstände und Münzen per Klick einzelnen Spielern zugewiesen werden können.

### 🐾 7. Erweiterter Begleiter- & Vertrauten-Assistent
- **Zielgruppe:** Spieler (Druiden, Waldläufer, Magier, Hexenmeister)
- **Beschreibung:**
  - Eigener Sub-Assistent zur Verwaltung, Aufrüstung und zum Stufenaufstieg von Tiergefährten, Vertrauten und Paladin-Reittieren.

### 📚 8. Dynamische Regelwerk-Auswahl pro Charakter / Kampagne
- **Zielgruppe:** Spieler & DM
- **Priorität:** `Mittel`
- **Aufwand:** 🔴 Hoch (~3–5 Tage, großer Umbau)
- **Beschreibung:**
  - Spieler sollen selbst konfigurieren können, welche Regelwerke für ihren Charakter (oder die gesamte Kampagne) aktiv sind.
  - Regelwerke die gesteuert werden sollen: `PHB`, `PHB II`, `Complete Adventurer (CA)`, `Complete Arcane`, `Complete Divine`, `Complete Warrior`, `Prestige-Klassen` etc.
  - Per Toggle/Checkbox aktivierte Bücher steuern, welche Klassen, Feats, Zauber und Skills im Level-Up, Charakter-Wizard und allen Auswahldialogen angezeigt werden.
- **Technische Implikationen:**
  - Aktuell wird die Regelwerks-Filterung lokal in einzelnen Komponenten über Source-Tabs (`phb`, `phb2`, `ca`, ...) gelöst — kein zentraler State.
  - Benötigt einen globalen **Rulebook-Context** (z.B. `RulebookContext`) der die aktivierten Bücher als Set/Array hält.
  - Alle Datenregister (`CLASSES_LIST`, `FEATS_LIST`, Zauber-JSON, `SKILLS_DATA`) müssen einheitliche `source`-Felder besitzen und konsequent danach gefiltert werden.
  - Sinnvoll kombinierbar mit Feature **#2** (Vereinheitlichung auf rein englische Modelle), da dort ohnehin alle `source`-Felder bereinigt werden.
  - Konfiguration sollte per Charakter (in `pc.settings.allowedSources`) und optional pro Kampagne speicherbar sein.
- **UX-Vorschlag:**
  - Ein kleines Settings-Panel im Charakter-Sheet und/oder im Level-Up-Dialog mit Checkboxen pro Regelwerk.
  - Alternativ: Kampagnen-weite Konfiguration durch den DM, die für alle Spieler gilt.

---

## 📌 Bearbeitungs-Richtlinien
- Neue Feature-Vorschläge werden hier mit Priorität, Zielgruppe und grober Aufwandsschätzung eingetragen.
- Vor der Umsetzung wird für das jeweilige Feature ein detaillierter Phasenplan erstellt und auf einem dedizierten Branch (`feat/...` oder `refactor/...`) gearbeitet.
