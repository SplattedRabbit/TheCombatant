# Token-Optimierungsstrategie für CombatApp (D&D 3.5e)

Da AI-Agenten mit einem begrenzten Kontextfenster arbeiten und die Verarbeitungsgeschwindigkeit direkt von der Token-Menge abhängt, ist eine effiziente Token-Strategie für dieses Projekt essenziell. Dieses Dokument beschreibt die Best Practices zur Vermeidung von Token-Verschwendung.

---

## 1. Testläufe & Terminal-Output (99% Ersparnis)

Das standardmäßige Ausführen von Tests im ausführlichen Modus erzeugt Hunderte Zeilen an Ausgaben. Bei 186 Tests führt dies zu enormem Token-Verbrauch.

### Optimierung:
* **Gezielte Tests:** Während der Entwicklung niemals alle Tests ausführen, sondern nur die Testdatei, die vom geänderten Code betroffen ist (z. B. `Tests/stat.test.js`).
* **Dot-Reporter nutzen:** Für alle Testläufe immer den `--test-reporter=dot` Parameter anhängen. Dies reduziert die gesamte Ausgabe auf eine Liste von Punkten (z. B. `....................`).
  ```powershell
  # Standard-Test während der Entwicklung:
  node --import ./Tests/setup.js --test --test-reporter=dot Tests/deine_datei.test.js
  
  # Globaler Test (NUR einmalig vor Turn-Ende):
  node --import ./Tests/setup.js --test --test-reporter=dot Tests/**/*.test.js
  ```
* **Debug-Ausgaben minimieren:** Vermeide permanente `console.log`-Statements in Modulen und Tests, die bei jedem Testlauf ausgegeben werden.

---

## 2. Umgang mit großen Datenbanken & Textdateien

Einige Dateien im Projekt sind zu groß, um sie in den Kontext eines LLM zu laden.

* **D&D 3.5e Regelwerk (`playershandbook_35e.txt` - 2.2 MB):**
  * **Verbot:** Niemals direkt lesen oder im Ganzen in den Kontext laden.
  * **Lösung:** Nutze das Suchskript:
    ```powershell
    node scratch/search_rules.js "<Suchbegriff>"
    ```
* **Zauber-Datenbank (`data/spells_de.json` - 610 KB):**
  * **Verbot:** Niemals direkt laden oder via `view_file` komplett einlesen.
  * **Lösung:** Nutze das neue Zauber-Suchskript:
    ```powershell
    node scratch/search_spells.js "<Zaubername>"
    ```

---

## 3. Datei-Lesen & Code-Navigation (Targeted Reading)

Das ungezielte Lesen kompletter Quellcodedateien füllt das Kontextfenster extrem schnell auf.

### Best Practices:
* **StartLine & EndLine verwenden:** Verwende beim Tool `view_file` immer gezielt Zeilenbereiche, anstatt die gesamte Datei (bis zu 800 Zeilen) zu lesen.
* **Symbol-Suche mit `grep_search`:** Nutze `grep_search`, um den genauen Ort einer Funktion oder Klasse zu finden, bevor du die Datei öffnest.
* **TypeScript-Typen als Referenz:** Nutze die Typ-Deklarationen in `src/types/combat.ts`, um die Datenstruktur zu verstehen, anstatt die Models in `js/models/` im Detail zu lesen.

---

## 4. Modularisierung & Dateigrößen-Richtwerte

Große React-Komponenten (>600 Zeilen) zwingen den Agenten dazu, viele Zeilen zu lesen, um Zusammenhänge zu verstehen.

* **Richtwerte nach AGENT.md:**
  * **Ideal:** `< 300 Zeilen` (schnell zu lesen, präziser Kontext).
  * **Split-Prüfung:** `600–900 Zeilen`.
  * **Zwingender Split:** `> 900 Zeilen` (muss aufgeteilt werden).
* **Aktuelle Refactoring-Kandidaten (React):**
  * [PCOffenseTab.tsx](file:///c:/Users/Juls/Desktop/CombatApp/src/components/player/PCOffenseTab.tsx) (830 Zeilen): Sollte bei der nächsten Feature-Erweiterung in kleinere Subkomponenten unterteilt werden (z. B. `WeaponSlotCard`, `ArmorSlotCard`).

---

## 5. Build- und Hilfsdateien in Git ausschließen

Dateien im `dist/`-Ordner oder `.vite/`-Cache können beim Auflisten von Verzeichnissen den Output aufblähen.
* Stelle sicher, dass `dist/` und temporäre Logs in `.gitignore` stehen.
* Vermeide es, `npm run build` öfter als nötig auszuführen, da der Build-Prozess Output erzeugt, der Token verbraucht.
