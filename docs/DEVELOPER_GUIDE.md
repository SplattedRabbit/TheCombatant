# D&D 3.5e Combat App — Entwicklerhandbuch (Developer Guide)

Willkommen im Projekt! Dieses Handbuch dient als zentrale Referenz für neue AI-Agenten und Entwickler, um sich in Sekunden in der Codebasis zurechtzufinden und token-schonend zu arbeiten.

---

## 1. Architektur in 5 Sätzen (4-Schichten-Modell)

1. **Presentation Layer (`src/`)**: Komplett in React + Vite + TypeScript. Rendert die UI und leitet Inputs an die State-Bridge weiter.
2. **State-Bridge (`src/hooks/useCombatState.ts`)**: Abonniert den Vanilla-EventBus (`StateEvents`) und liefert immutable Snapshots an die React-Komponenten.
3. **State & Sync Layer (`js/state/`, `js/network/`)**: Verwaltet den In-Memory-Zustand (`PCManager.js`, `EncounterManager.js`) und synchronisiert Delta-Diffs via WebRTC.
4. **Rules & Data (`js/rules/`, `js/data/`)**: Reine D&D 3.5e Regeln. Berechnet stufenbasierte Werte und enthält Registries (Waffen, Skills, Talente).
5. **Domain Models (`js/models/`)**: Reines, HTML-freies OOD. Stat-Kapselung mit Modifikatoren-Stacking (`Stat.js`), `Weapon.js`, `Armor.js`, `Item.js` und `Combatant.js`.

---

## 2. Pflichtbefehle & Token-Optimierung (CRITICAL)

Da große Dateien den AI-Kontext blockieren, müssen folgende Befehle und Verhaltensweisen zwingend eingehalten werden:

### 2.1 Testen mit minimalem Output:
Ausführliche Test-Protokolle verbrauchen Tausende Token. Verwende **immer** den `--test-reporter=dot` Parameter.
```powershell
# 1. GEZIELTES TESTEN (während der Entwicklung nur die betroffene Datei testen):
node --import ./Tests/setup.js --test --test-reporter=dot Tests/bugfixes_v350.test.js

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

## 3. Dateigrößen & Modularisierung

* **Richtwerte für Dateilängen (AGENT.md):**
  * `< 300 Zeilen`: Ideal.
  * `300–600 Zeilen`: Akzeptabel (Header ist Pflicht).
  * `600–900 Zeilen`: Split-Prüfung bei der nächsten Erweiterung.
  * `> 900 Zeilen`: Zwingend splitten.
* **Beispiel:** `PCOffenseTab.tsx` (ehemals 862 Zeilen) wurde erfolgreich in `ActiveEquipmentSlots.tsx`, `WeaponStashCard.tsx` und `ArmorStashCard.tsx` untergliedert.

---

## 4. Kern-Systeme & wichtige APIs

* **Stat-System (`Stat.js`):** Berechnet stapelbare Boni. Dodge- und untypisierte Boni kumulieren (additiv). Boni anderer Typen (z. B. Enhancement, Deflection) stacken nicht — es zählt nur der höchste Wert.
* **Waffeneigenschaften (`Weapon.js`):** Unterstützt `extraDamageDice` (z. B. `1w6`) und `extraDamageType` (z. B. `Feuer`). Legacy-Strings werden beim Laden geparst.
* **Magische Gegenstände (`Item.js`):** Unterstützen ein `effects[]`-Array für mehrere Effekte pro Item.
* **React State-Bridge & Prototyp-Rehydrierung (`useCombatState.ts`):**
  - Der Hook klont den mutable Engine-State tief (`JSON.parse(JSON.stringify(raw))`), damit React bei Änderungen frische Objekt- und Array-Referenzen (z.B. für `pc.feats`, `pc.weapons` etc.) erhält und `useMemo`-Zustände zuverlässig aktualisiert.
  - Um den Verlust von Instanzmethoden zu beheben, rehydriert die Hilfsfunktion `rehydrateCombatant` nach dem Klonen mittels `Object.setPrototypeOf` die Prototypen für `Combatant`, `Stat`, `Weapon`, `Armor` und `Item`.
  - Jede neue Datenstruktur oder Klasse, die im Frontend Methodenaufrufe erfordert, muss in dieser Rehydrierungskette registriert werden.
* **Cache-Versionierung:** Das Muster ist `dnd-combatsheet-vX.Y.Z-cache-vN`. Bei Bugfixes innerhalb einer Version wird nur `N` inkrementiert.
  - **Wichtig:** Passe bei einem Inkrement immer gleichzeitig `service-worker.js` (Zeile 1, `CACHE_NAME`) und `index.html` (Footer-Version) an!

---

## 5. UI-Spezifika & Fallstricke

* **Dialog-Mindestbreite:** Dialogfenster für Zauberauswahl, Buffauswahl oder Vorbereitung müssen mindestens `480px` bis `520px` breit sein — geringere Breiten schneiden Inhalte und Metamagic-Optionen ab.
* **Popup-Skalierung:** Neue Dialoge/Overlays müssen in die Skalierungsliste (`#roleOverlay ...`) in `css/popups.css` eingetragen werden — sonst werden sie auf Tablets und bei hoher DPI-Skalierung viel zu klein gerendert.

