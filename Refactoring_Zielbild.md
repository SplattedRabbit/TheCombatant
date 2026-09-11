# Refactoring-Zielbild – TheCombatant

**Stand der zugrunde liegenden Analyse:** 2026-09-11
**Zweck dieses Dokuments:** Verbindliche Arbeitsgrundlage für den Cleanup- und Refactoring-Prozess von TheCombatant. Jeder Arbeitsblock (WP = Work Package) ist so geschrieben, dass ein Agent ihn **ohne Vorwissen aus früheren Konversationen** bearbeiten kann – nur mit Zugriff auf dieses Dokument und das Repository.

**Zielgruppe / Werkzeug-Unabhängigkeit:** Dieses Dokument ist bewusst tool- und modellagnostisch formuliert. Es wird sowohl mit Claude Code als auch mit Google Antigravity (verschiedene Modelle) verwendet. Agenten-Prompts vermeiden daher tool-spezifische Befehle (z. B. keine Annahme über bestimmte CLI-Flags) und beschreiben stattdessen **was** zu tun ist und **welches Ergebnis** erwartet wird.

**Grundregel für alle WPs:** Eine Codeänderung und die zugehörige Dokumentationspflege sind **eine Einheit**. Ein WP gilt nicht als abgeschlossen, wenn nur der Code geändert wurde, aber die in "Zu pflegende Dokumente" genannten Dateien nicht aktualisiert wurden – und umgekehrt.

**Status-Legende:**
- ⬜ Offen
- 🟨 In Arbeit
- ✅ Abgeschlossen
- ⏸️ Blockiert (wartet auf Nutzer-Entscheidung)

---

## Empfohlene Reihenfolge

1. **WP1–WP4 zuerst** – reine Dokumentations- und Aufräumarbeiten ohne Laufzeitrisiko. Können unabhängig voneinander und ggf. parallel bearbeitet werden (mit Ausnahme der Abhängigkeit WP1 → WP4, siehe dort).
2. **WP5** – Testinfrastruktur reparieren. Wird benötigt, um spätere Code-Refactorings (WP7–WP9) überhaupt verifizieren zu können. Sollte vor WP7–WP9 abgeschlossen sein.
3. **WP6** – Entscheidungspflichtig (Dateigrößen-Standard). Bewusst vor die großen Code-Refactorings gesetzt, da die Entscheidung beeinflusst, ob WP7–WP9 zusätzliche Datei-Splits enthalten müssen.
4. **WP7–WP9** – Eigentliche Architektur-Refactorings am Code. **Nicht parallelisieren** – diese WPs berühren teils überlappende Dateien (z. B. `js/rules/`) und paralleles Arbeiten mehrerer Agenten erzeugt ein hohes Merge-Konflikt-Risiko. Sequenziell abarbeiten, nach jedem WP Tests grün.
5. **WP10** – Dauerhafte Selbstwartungsregel, kein einmaliges WP. Gilt ab sofort für jede zukünftige Änderung am Repository, unabhängig vom Bearbeitungsstand der übrigen WPs.

---

## WP1 (✅): AGENT.md Sofort-Korrekturen (tote Referenzen)

### Ziel
Alle toten/falschen Referenzen in `AGENT.md` korrigieren, die auf nicht mehr existierende Dateien oder Tools verweisen.

### Ausgangslage
- `AGENT.md` §1 (Zeilen ~22–26) verweist auf Such-Tools `search_rules.js` und `search_spells.js` — diese Dateien existieren nicht mehr unter diesen Namen. Die tatsächlich vorhandenen Skripte heißen `scratch/search_phb.js` und `scratch/search_dmg.js`.
- `AGENT.md` §7 (Zeilen ~133–137) verweist auf drei Dokumente, die nicht mehr existieren: `docs/refactoring_masterplan_v6.md`, `docs/deep_code_audit_analysis.md`, `docs/PATCHNOTES.md`.
- `docs/DEVELOPER_GUIDE.md` enthält möglicherweise dieselben oder ähnliche veraltete Verweise — muss geprüft werden.

### Agenten-Prompt
```
Du arbeitest am Repository "TheCombatant" (D&D-3.5e-Charakterbogen/Kampf-PWA).

Aufgabe: Korrigiere tote Dokumentationsverweise in AGENT.md.

Schritte:
1. Öffne AGENT.md und finde den Abschnitt zu Such-Werkzeugen (nahe dem Anfang,
   Abschnitt "§1" bzw. dem ersten inhaltlichen Abschnitt). Prüfe, ob dort
   search_rules.js oder search_spells.js referenziert werden.
2. Prüfe per Dateisystem-Suche (z.B. Verzeichnisauflistung von scratch/),
   welche Suchskripte tatsächlich existieren. Erwartet: search_phb.js und
   search_dmg.js. Falls andere/zusätzliche Skripte existieren, dokumentiere
   die tatsächlich vorhandenen.
3. Ersetze die toten Referenzen durch die tatsächlichen Dateinamen und
   beschreibe kurz, wofür jedes Skript da ist (PHB = Player's Handbook,
   DMG = Dungeon Master's Guide, oder was auch immer die Skripte laut ihrem
   Inhalt tatsächlich durchsuchen – nicht raten, den Skriptinhalt kurz lesen).
4. Finde den Abschnitt "§7" bzw. den Abschnitt zu Roadmap/offenen Punkten in
   AGENT.md. Dort werden drei Dokumente referenziert:
   - docs/refactoring_masterplan_v6.md
   - docs/deep_code_audit_analysis.md
   - docs/PATCHNOTES.md
   Prüfe, ob diese Dateien im docs/-Verzeichnis existieren.
5. Für jede nicht existierende Datei: Entferne die Referenz vollständig ODER
   ersetze sie durch den korrekten Nachfolger, falls du per Git-Historie
   (git log --follow, git log --diff-filter=D) herausfinden kannst, wohin der
   Inhalt verschoben/umbenannt wurde. Wenn unklar, entferne die Referenz und
   vermerke stattdessen in einem kurzen Satz, dass ältere Analysen archiviert
   wurden.
6. Öffne docs/DEVELOPER_GUIDE.md und suche nach denselben oder ähnlichen
   toten Referenzen (gleiche Dateinamen wie oben). Korrigiere analog.
7. Committe NICHTS automatisch. Liste am Ende alle vorgenommenen Änderungen
   auf (Datei, Zeile, alt → neu).

Worauf achten:
- Verändere keine anderen Inhalte in AGENT.md außer den toten Referenzen.
- Erfinde keine Dateinamen oder Inhalte – wenn ein Nachfolgedokument nicht
  eindeutig identifizierbar ist, entferne die Referenz ersatzlos statt zu
  raten.
- AGENT.md ist ein zentrales Navigationsdokument für andere Agenten. Achte
  auf Konsistenz zum Rest des Dokuments (Tonfall, Format der Aufzählungen).
```

### Zu pflegende Dokumente
- `AGENT.md` (direkt betroffen)
- `docs/DEVELOPER_GUIDE.md` (falls dieselben toten Referenzen dort vorkommen)

### Definition of Done
- [x] Keine Referenz in AGENT.md verweist mehr auf `search_rules.js`/`search_spells.js` als eigenständige Dateien, sofern diese nicht existieren
- [x] `AGENT.md` §7 enthält keine Verweise mehr auf nicht existierende Dokumente
- [x] `docs/DEVELOPER_GUIDE.md` auf dieselben Probleme geprüft und ggf. korrigiert
- [x] Änderungsliste dokumentiert (welche Zeile, alt → neu) — siehe Commit `2c1da2f` auf Branch `refactoring/wp1-wp10-cleanup`

---

## WP2 (✅): AGENT.md §3 Feature-Index vollständig neu abgleichen

### Ziel
Die Feature→Datei-Tabelle in `AGENT.md` §3 (Zeilen ~46–70) zeilenweise gegen den tatsächlichen Dateibestand verifizieren und korrigieren.

### Ausgangslage
Folgende Einträge wurden bei einer Analyse (2026-09-11) als potenziell veraltet identifiziert (Datei nicht gefunden oder Pfad falsch):
- `NaturalAttacksRenderer.js` — nicht gefunden
- `PCMagicItemsTab.js` — nicht gefunden
- `PCSpellbookTab.js` — nicht gefunden
- `PCCompendiumTab.js` — nicht gefunden
- `PCFeatsTab.js` — nicht gefunden
- `NetworkManager.js` — nicht gefunden (wurde laut Git-Historie entfernt, WebRTC/PeerJS wurde durch Supabase Realtime ersetzt)
- Weitere mutmaßlich betroffene Einträge, die geprüft werden müssen: `WeaponStashCard.js`, `ActiveEquipmentSlots.tsx` (Pfadangabe), `PCOffense.js`, `InventoryStashRenderer.js`, `PCDefenses.js`, `PCHealthGlobe.js`
- Die Prestige-Class-Engine-Registrierung wird nur unvollständig dokumentiert: Es existieren mehrere Registry-Dateien (`js/rules/prestigeClasses-dmg.js`, `-ca.js`, `-cs.js`), AGENT.md §3 nennt aber nur die `-dmg.js`-Datei.

### Agenten-Prompt
```
Du arbeitest am Repository "TheCombatant". Aufgabe: Vollständiger Abgleich der
Feature→Datei-Tabelle in AGENT.md (Abschnitt "§3" bzw. der Abschnitt mit dem
Titel zu Feature-Index/Datei-Zuordnung).

Schritte:
1. Lies die komplette Tabelle in AGENT.md §3. Für JEDE Zeile:
   a. Prüfe per Dateisystemsuche, ob die genannte Datei unter dem
      angegebenen Pfad existiert.
   b. Falls nicht: Suche im gesamten Repository (js/ und src/) nach einer
      Datei mit ähnlichem Namen oder ähnlicher Funktion (z.B. per Grep nach
      dem Feature-Namen oder Klassennamen aus der Tabellenzeile).
   c. Wenn ein Nachfolger gefunden wird: Aktualisiere den Pfad in der
      Tabelle.
   d. Wenn kein Nachfolger gefunden wird und das Feature laut Code nicht
      mehr existiert: Entferne die Zeile.
   e. Wenn unklar, ob das Feature noch existiert oder wohin es migriert
      wurde: Liste diese Zeile separat als "unklar - manuelle Prüfung nötig"
      statt sie zu raten.
2. Prüfe gezielt folgende bekannte Problemfälle (siehe Ausgangslage im
   verlinkten WP-Dokument): NaturalAttacksRenderer.js, PCMagicItemsTab.js,
   PCSpellbookTab.js, PCCompendiumTab.js, PCFeatsTab.js, NetworkManager.js,
   WeaponStashCard.js, ActiveEquipmentSlots.tsx, PCOffense.js,
   InventoryStashRenderer.js, PCDefenses.js, PCHealthGlobe.js.
3. Prüfe die Prestige-Class-Engine-Dokumentation: Liste alle vorhandenen
   Registry-Dateien nach dem Muster js/rules/prestigeClasses-*.js auf und
   stelle sicher, dass ALLE in AGENT.md erwähnt werden, nicht nur eine.
4. Prüfe umgekehrt: Gibt es wichtige, häufig genutzte Dateien/Features im
   Code, die in der Tabelle komplett fehlen? (Stichprobenartig prüfen,
   keine erschöpfende Suche nötig – Fokus liegt auf Korrektheit bestehender
   Einträge, nicht auf Vollständigkeit um jeden Preis.)

Worauf achten:
- Rate keine Pfade. Jede Änderung muss durch tatsächliches Auffinden der
  Datei im Repository belegt sein.
- Behalte das bestehende Tabellenformat (Spalten, Formatierung) bei.
- Wenn eine Datei umbenannt/verschoben wurde, prüfe kurz per Git-Historie
  (git log --follow <alter_pfad>), ob die Umbenennung plausibel ist, bevor
  du sie in der Tabelle festhältst.
```

### Zu pflegende Dokumente
- `AGENT.md` §3 (Haupttabelle)

### Definition of Done
- [x] Jede Zeile der §3-Tabelle wurde gegen den Dateibestand verifiziert
- [x] Alle bekannten Problemfälle (siehe Ausgangslage) sind aufgelöst (korrigiert oder entfernt)
- [x] Alle drei Prestige-Class-Registry-Dateien sind dokumentiert (über Fassade `prestigeClasses-data.js`, die dmg/cs/ca mergt)
- [x] Keine "unklar"-Fälle verblieben — siehe Commit `4a6ba40` auf Branch `refactoring/wp1-wp10-cleanup`

---

## WP3 (⬜): Versionsnummern-Konsolidierung

### Ziel
Einheitlichen und korrekten Umgang mit Versionsnummern über alle relevanten Dateien herstellen.

### Ausgangslage
- `package.json` = Version 6.8.0
- `docs/ARCHITECTURE.md` und `docs/CODE_ANALYSIS.md` = Version 6.0.0 (im Text erwähnt)
- `CHANGELOG.md` enthält vermutlich die aktuellste tatsächliche Version (zum Zeitpunkt der Analyse wurde 6.9.0 als neueste vermutet, aber NICHT verifiziert — muss vom Agenten geprüft werden)
- `AGENT.md` §5 beschreibt eine Cache-Versionierungs-Konvention: `service-worker.js` CACHE_NAME im Format `dnd-combatsheet-vX.Y.Z-cache-vN`, die mit einer Versionsangabe im Footer von `index.html` synchron gehalten werden soll. Unklar, ob dieser Footer-String aktuell noch existiert.

### Agenten-Prompt
```
Du arbeitest am Repository "TheCombatant". Aufgabe: Versionsnummern über das
Repository hinweg konsolidieren.

Schritte:
1. Ermittle die tatsächlich aktuellste Version:
   - Lies package.json (Feld "version").
   - Lies CHANGELOG.md und ermittle die neueste dort dokumentierte Version.
   - Falls package.json und CHANGELOG.md divergieren, ist CHANGELOG.md die
     Quelle der Wahrheit für "was wurde zuletzt fertiggestellt" – aber
     package.json könnte bereits für eine kommende Version hochgezählt sein.
     Kläre per Git-Historie (git log auf package.json und CHANGELOG.md),
     welche Datei zuletzt aktualisiert wurde, um die tatsächliche Reihenfolge
     zu verstehen. Wenn unklar, dokumentiere den Widerspruch statt ihn
     eigenmächtig aufzulösen.
2. Prüfe service-worker.js: Enthält der CACHE_NAME das Format
   "dnd-combatsheet-vX.Y.Z-cache-vN"? Stimmt die Versionsnummer darin mit
   package.json überein?
3. Prüfe, ob index.html noch einen Versions-String im Footer enthält (wie
   von AGENT.md §5 gefordert). Falls nicht mehr vorhanden: Dokumentiere dies
   als Abweichung von der in AGENT.md beschriebenen Konvention – entscheide
   NICHT eigenmächtig, ob der Footer wieder eingeführt werden soll, sondern
   vermerke es als offenen Punkt.
4. Für docs/ARCHITECTURE.md, docs/CODE_ANALYSIS.md, docs/DEVELOPER_GUIDE.md,
   docs/TESTING.md: Prüfe jedes Vorkommen einer Versionsnummer im Text.
   Für jedes Dokument einzeln entscheiden und vermerken:
   a) Versionsnummer aktualisieren auf die unter Schritt 1 ermittelte
      aktuelle Version, ODER
   b) Versionsnummer ganz entfernen, wenn das Dokument nicht versions-
      spezifisch sein soll (z.B. wenn es allgemeine Architektur ohne
      Versionsbezug beschreibt).
   Triff diese Entscheidung pro Dokument nachvollziehbar und begründe sie
   kurz im Ergebnisbericht.
5. Stelle sicher, dass service-worker.js CACHE_NAME bei jeder künftigen
   Versionsänderung mit hochgezählt wird – falls dafür kein Mechanismus
   existiert (z.B. Build-Skript), vermerke dies als Vorschlag für WP10
   (Selbstwartung), aber implementiere in diesem WP keinen neuen Mechanismus.

Worauf achten:
- Ändere package.json-Version nur, wenn eindeutig belegt ist, welche Version
  korrekt ist. Im Zweifel: Diskrepanz dokumentieren statt raten.
- CHANGELOG.md selbst nicht rückwirkend umschreiben.
```

### Zu pflegende Dokumente
- `package.json`
- `service-worker.js`
- `index.html` (Footer-Version, falls vorhanden/wiedereingeführt)
- `docs/ARCHITECTURE.md`, `docs/CODE_ANALYSIS.md`, `docs/DEVELOPER_GUIDE.md`, `docs/TESTING.md`

### Definition of Done
- [ ] Aktuelle Version eindeutig ermittelt und dokumentiert
- [ ] service-worker.js CACHE_NAME stimmt mit ermittelter Version überein
- [ ] Für jedes betroffene docs/-Dokument wurde eine explizite Entscheidung (aktualisieren vs. entfernen) getroffen und umgesetzt
- [ ] Status des index.html-Footer-Strings dokumentiert (vorhanden/nicht vorhanden)

---

## WP4 (⬜): scratch/ und docs/ Aufräumen

### Ziel
Das `scratch/`-Verzeichnis (26 Dateien, ~148K) und veraltete `docs/`-Dateien nach klarer Kategorisierung bereinigen.

### Abhängigkeit
**WP1 muss vor diesem WP abgeschlossen sein**, da WP1 die AGENT.md-Referenzen auf `search_phb.js`/`search_dmg.js` korrigiert – diese Dateien dürfen in WP4 nicht versehentlich gelöscht werden, bevor die Referenzkorrektur steht.

### Ausgangslage — Kategorisierung scratch/

**Löschen** (einmalige Hilfsskripte, deren Zweck erfüllt ist, kein laufender Nutzen):
`find_chapters.js`, `find_first_chapters.js`, `parse_pdf.js`, `search_rules.js`, `search_spells.js`, `split_feats.js`, `audit_cantrips.js`, `audit_phb_spells_full.js`, `audit_spells.js`, `fill_missing_descs.js`, `fix_phb_spells.js`, `inspect_malformed.js`, `test_eligible.js`

**Archivieren** (Datenerstellungs-/Extraktionsskripte mit potenziellem Wiederverwendungswert, aber kein aktiver Bedarf):
`audit_spell_details.js`, `build_all_spells.js`, `check_assets.js`, `check_headers.js`, `check_lines.js`, `extract_pdf_text.js`, `slice_dmg.js`, `split_book.js`, `split_phb.js`

**Behalten + dokumentieren** (aktiv nutzbare Werkzeuge, die in AGENT.md referenziert werden sollen):
`search_phb.js`, `search_dmg.js`, `zoom_diagnostics.js`

**Aktiv behalten** (Build-relevant):
`update_sw.js`

### Ausgangslage — docs/
**Löschen** (durch CHANGELOG.md abgelöst):
`docs/HANDOVER.md`, `docs/IMPLEMENTATION_PLAN_SPELL_WIZARD.md`, `docs/WALKTHROUGH_SPELL_WIZARD.md`, `docs/PHASENPLAN_P2.md`

**Nicht löschen, sondern als erledigt markieren:**
`docs/CODE_ANALYSIS.md` — FINDING-01 und FINDING-08 wurden bereits im Code behoben (verifiziert 2026-09-11), sollten im Dokument als "Behoben" markiert werden statt das Dokument zu löschen (historischer Wert).

**Aktualisieren:**
`docs/Planned_Features.md` — Abschnitt "Zuletzt Abgeschlossen" auf aktuellen Stand bringen.

### Agenten-Prompt
```
Du arbeitest am Repository "TheCombatant". Aufgabe: scratch/ und docs/
gemäß der folgenden Kategorisierung bereinigen.

WICHTIG: Prüfe vor Beginn, ob WP1 (Korrektur der AGENT.md-Verweise auf
Such-Tools) bereits abgeschlossen ist. Falls nicht, führe zuerst die
Referenzkorrektur durch oder brich ab und weise darauf hin.

Schritte:
1. Lege ein Unterverzeichnis scratch/archive/ an (falls nicht vorhanden).
2. LÖSCHEN (nach kurzer Sichtprüfung, dass die Datei tatsächlich nur ein
   einmaliges Hilfsskript ohne laufende Referenzen im Code ist – prüfe per
   Grep, ob eine der folgenden Dateien noch von anderem Code importiert
   oder in einem package.json-Skript referenziert wird; wenn ja, NICHT
   löschen, sondern melden):
   find_chapters.js, find_first_chapters.js, parse_pdf.js, search_rules.js,
   search_spells.js, split_feats.js, audit_cantrips.js,
   audit_phb_spells_full.js, audit_spells.js, fill_missing_descs.js,
   fix_phb_spells.js, inspect_malformed.js, test_eligible.js
3. VERSCHIEBEN nach scratch/archive/ (gleiche Vorprüfung wie oben):
   audit_spell_details.js, build_all_spells.js, check_assets.js,
   check_headers.js, check_lines.js, extract_pdf_text.js, slice_dmg.js,
   split_book.js, split_phb.js
4. BEHALTEN, aber in AGENT.md (oder einer README innerhalb von scratch/,
   falls das für andere Agenten klarer ist) kurz dokumentieren, wofür sie
   da sind: search_phb.js, search_dmg.js, zoom_diagnostics.js
5. update_sw.js unverändert lassen (aktiv im Build-Prozess genutzt) –
   verifiziere kurz per Grep in package.json/CI-Konfiguration, dass es
   tatsächlich noch referenziert wird.
6. In docs/: Lösche HANDOVER.md, IMPLEMENTATION_PLAN_SPELL_WIZARD.md,
   WALKTHROUGH_SPELL_WIZARD.md, PHASENPLAN_P2.md — aber nur, nachdem du
   kurz geprüft hast, dass ihr Inhalt tatsächlich im CHANGELOG.md oder
   in anderen aktuellen Dokumenten abgedeckt ist. Wenn ein Dokument
   Information enthält, die NIRGENDS sonst steht, lösche es nicht,
   sondern melde das.
7. In docs/CODE_ANALYSIS.md: Finde FINDING-01 und FINDING-08 und markiere
   sie explizit als behoben (z.B. mit einem Status-Präfix "[BEHOBEN]" oder
   Streichung plus Datum), ohne den Rest des Dokuments zu verändern.
   Verifiziere den Behoben-Status selbst nochmal am aktuellen Code, bevor
   du sie als behoben markierst.
8. Aktualisiere docs/Planned_Features.md Abschnitt "Zuletzt Abgeschlossen"
   anhand der letzten Einträge in CHANGELOG.md.

Worauf achten:
- Lösche nichts, ohne vorher per Grep zu prüfen, ob es noch referenziert
  wird.
- Bei Unsicherheit, ob eine Datei/ein Dokument noch gebraucht wird: nicht
  löschen, sondern als offenen Punkt melden.
- Diese Aufgabe ist rein organisatorisch – ändere keine Logik in
  behaltenen Skripten.
```

### Zu pflegende Dokumente
- `AGENT.md` (Dokumentation der behaltenen scratch/-Tools)
- `docs/CODE_ANALYSIS.md` (Status-Markierungen)
- `docs/Planned_Features.md`

### Definition of Done
- [ ] scratch/ enthält nur noch aktiv genutzte + dokumentierte Dateien im Hauptverzeichnis, Rest gelöscht oder in scratch/archive/
- [ ] docs/ enthält keine durch CHANGELOG.md ersetzten Alt-Dokumente mehr
- [ ] CODE_ANALYSIS.md FINDING-01/08 als behoben markiert
- [ ] Planned_Features.md aktuell

---

## WP5 (⬜): Testinfrastruktur reparieren

### Ziel
Die strukturelle Inkompatibilität zwischen Node's nativem Test-Runner und der TypeScript/React-Codebasis beheben.

### Ausgangslage
- 13 Node-Test-Dateien (ausgeführt über `scripts/run_agent_tests.js`, Node's `--test`) importieren direkt `.ts`-Dateien, was zu `ERR_UNKNOWN_FILE_EXTENSION` führt.
- Parallel existiert eine separate Vitest/React-Testing-Library-Suite für die React-Schicht.
- `build.test.js` hat ein Umgebungsproblem mit `@rollup/rollup-linux-x64-gnu` (plattformspezifisches optionales Package).
- `AGENT.md` §10 beschreibt ein "Tiered Testing"-Konzept (Tier1/2/3) inkl. hartcodierter Testanzahlen.
- `docs/TESTING.md` enthält vermutlich ebenfalls hartcodierte Testzahlen.

### Agenten-Prompt
```
Du arbeitest am Repository "TheCombatant". Aufgabe: Testinfrastruktur
reparieren, insbesondere die 13 fehlschlagenden Node-Test-Dateien.

Schritte:
1. Führe die bestehende Test-Suite aus (siehe package.json "scripts" für
   die genauen Befehle, vermutlich etwas wie "npm test" oder
   "node scripts/run_agent_tests.js") und sammle die genaue Fehlerliste.
   Bestätige, dass der Fehler ERR_UNKNOWN_FILE_EXTENSION bei .ts-Importen
   auftritt, und liste alle betroffenen Testdateien einzeln auf.
2. Bewerte zwei Optionen:
   a) MIGRATION (bevorzugt): Die betroffenen 13 Testdateien in die
      bestehende Vitest-Suite überführen, da diese bereits TypeScript
      unterstützt. Prüfe dafür, wie die bestehenden Vitest-Tests
      strukturiert sind (Verzeichnis, Namenskonvention, Setup-Datei) und
      übertrage die Testfälle 1:1 in diese Struktur, ohne die
      Testlogik/Assertions inhaltlich zu verändern.
   b) COMPILE-SCHRITT: Einen Vorkompilierungsschritt (z.B. via tsc oder
      esbuild) einführen, der die .ts-Dateien vor dem Node-Testlauf nach
      .js transpiliert. Nur wählen, falls Option (a) aus einem konkreten,
      im Code sichtbaren Grund nicht praktikabel ist (z.B. weil die
      Node-Tests bewusst außerhalb des Browser/Vite-Kontexts laufen
      müssen).
   Dokumentiere, welche Option gewählt wurde und warum.
3. Setze die gewählte Option für alle 13 betroffenen Dateien um. Verifiziere
   nach jeder migrierten/reparierten Datei einzeln, dass ihre Tests wieder
   laufen UND weiterhin denselben inhaltlichen Sachverhalt prüfen wie vorher
   (keine Tests stillschweigend verwässern oder weglassen).
4. Untersuche das build.test.js-Problem mit @rollup/rollup-linux-x64-gnu:
   - Prüfe, ob ein sauberer "npm ci" (Neuinstallation der Dependencies) das
     Problem behebt (bekanntes npm-Optional-Dependency-Bug-Muster).
   - Falls das Problem dadurch nicht behoben wird, dokumentiere es explizit
     als bekannte Umgebungs-Einschränkung (z.B. abhängig von OS/Architektur
     der Ausführungsumgebung) in docs/TESTING.md, anstatt es künstlich zu
     umgehen (kein Skip/Mock, der die Testaussage verfälscht).
5. Aktualisiere AGENT.md §10 (Tiered Testing) und docs/TESTING.md:
   - Entferne hartcodierte Testanzahlen (diese veralten schnell und werden
     zur zusätzlichen Wartungslast).
   - Beschreibe stattdessen qualitativ, welche Tier welche Art von Tests
     abdeckt und wie sie jeweils ausgeführt werden.

Worauf achten:
- Beim Migrieren von Tests: Assertions und Testfallabdeckung müssen
  inhaltlich identisch bleiben, nur das Ausführungs-Framework ändert sich.
- Nach Abschluss MÜSSEN alle Tests (Node-Suite und Vitest-Suite) grün
  laufen, bevor dieses WP als abgeschlossen gilt.
- Committe/verändere keine Produktionslogik in diesem WP – nur
  Testinfrastruktur und zugehörige Doku.
```

### Zu pflegende Dokumente
- `AGENT.md` §1 (Testbefehle) und §10 (Tiered Testing)
- `docs/TESTING.md`

### Definition of Done
- [ ] Alle 13 vormals fehlschlagenden Testdateien laufen wieder (migriert oder repariert)
- [ ] build.test.js Rollup-Problem gelöst oder als dokumentierte Umgebungs-Einschränkung festgehalten
- [ ] Gesamte Test-Suite (Node + Vitest) läuft grün
- [ ] AGENT.md §10 und docs/TESTING.md ohne hartcodierte, schnell veraltende Testzahlen

---

## WP6 (⏸️ Blockiert – Nutzer-Entscheidung erforderlich): Dateigrößen-Standard §9

### Ziel
Den Widerspruch zwischen der in `AGENT.md` §9 (Zeile ~185) behaupteten "100% eingehalten"-Compliance zur 450-Zeilen-Grenze und der tatsächlichen Codebasis (10 Dateien überschreiten das Limit) auflösen.

### Ausgangslage
`AGENT.md` §9 und `docs/ARCHITECTURE.md` (Zeile ~144, "100% of UI component files must be <= 450 lines") behaupten beide fälschlich vollständige Einhaltung. Tatsächlich existieren mindestens 10 Dateien über 450 Zeilen (genaue Liste muss vom Agenten neu ermittelt werden, da sich der Codestand seit der letzten Analyse geändert haben kann).

### ⚠️ Dies ist eine Entscheidung, keine Aufgabe
**Ein Agent darf diesen Punkt NICHT eigenmächtig lösen.** Es gibt zwei grundsätzlich unterschiedliche, gültige Lösungswege mit unterschiedlichem Aufwand und Risiko:

- **Option A — Durchsetzen:** Die betroffenen Dateien tatsächlich aufteilen, bis die 450-Zeilen-Grenze eingehalten wird. Hoher Aufwand, Risiko von Regressionen, aber stellt die dokumentierte Regel tatsächlich her.
- **Option B — Dokumentation korrigieren:** Die falsche "100% eingehalten"-Behauptung durch eine ehrliche Beschreibung des tatsächlichen Zustands ersetzen (z. B. "X von Y Dateien eingehalten, Ausnahmen: ..."), ohne den Code zu verändern. Geringer Aufwand, aber die Datei-Größen-Regel bleibt de facto unvollständig durchgesetzt.

### Agenten-Prompt
```
Du arbeitest am Repository "TheCombatant". Dieser Punkt betrifft AGENT.md §9
(Dateigrößen-Standard) und die dort behauptete 100%-Compliance zur
450-Zeilen-Grenze.

WICHTIG - STOPP-BEDINGUNG: Bevor du irgendeine Änderung vornimmst, prüfe,
ob dir vom Nutzer bereits explizit mitgeteilt wurde, welche Option gewählt
werden soll:
- Option A: Betroffene Dateien tatsächlich aufteilen/refactoren, bis die
  450-Zeilen-Grenze eingehalten wird.
- Option B: Die Dokumentation korrigieren, sodass sie den tatsächlichen
  Ist-Zustand ehrlich beschreibt, ohne den Code zu verändern.

Wenn dir diese Entscheidung NICHT explizit mitgeteilt wurde, STOPPE and
frage den Nutzer aktiv, welche Option gewählt werden soll. Wähle NICHT
eigenmächtig Option A (Code-Refactoring), da dies das risikoreichere und
aufwendigere Vorgehen ist und tief in die Codebasis eingreift.

Falls die Entscheidung bereits vorliegt, gehe wie folgt vor:

Schritte (unabhängig von der Entscheidung):
1. Ermittle per Zeilenzählung (z.B. wc -l über alle relevanten Quelldateien
   in js/ und src/) die AKTUELLE Liste aller Dateien über 450 Zeilen. Die
   Liste kann sich seit der letzten Analyse verändert haben – nicht auf
   eine alte Liste verlassen.

Falls Option A gewählt wurde:
2a. Bearbeite die Dateien EINZELN, nicht alle auf einmal. Für jede Datei:
    - Identifiziere sinnvolle Trennlinien (z.B. nach Verantwortlichkeit,
      nicht nach willkürlicher Zeilenzahl).
    - Stelle sicher, dass vor der Aufteilung eine grüne Test-Baseline
      existiert (siehe WP5 – sollte vorher abgeschlossen sein).
    - Teile die Datei auf, aktualisiere alle Imports/Referenzen im gesamten
      Repository.
    - Führe die Test-Suite aus und verifiziere manuell im Dev-Server
      (falls UI-relevant), dass sich das Verhalten nicht geändert hat.
    - Aktualisiere AGENT.md §3 (Feature-Index), falls sich Dateipfade durch
      die Aufteilung ändern.
    - Committe/melde diese eine Datei als abgeschlossen, bevor du zur
      nächsten übergehst.

Falls Option B gewählt wurde:
2b. Ersetze die Behauptung "100% eingehalten" in AGENT.md §9 und in
    docs/ARCHITECTURE.md durch eine ehrliche, konkrete Aussage über den
    tatsächlichen Zustand (z.B. "X von Y Dateien halten die Grenze ein,
    Ausnahmen sind: [Liste mit Zeilenzahlen]"). Verändere keinen
    Produktionscode.

Worauf achten:
- Bei Option A: Nach JEDER einzelnen Datei-Aufteilung müssen Tests grün
  sein, bevor die nächste Datei angefasst wird. Kein Big-Bang-Refactoring
  aller 10 Dateien in einem Schritt.
- Bei Option B: Sei ehrlich und konkret – keine vage Umformulierung, die
  das Problem nur verschleiert.
```

### Zu pflegende Dokumente
- `AGENT.md` §9
- `docs/ARCHITECTURE.md` (Tier-1-Aussage zu Dateigrößen)
- `AGENT.md` §3 (falls Option A zu Pfadänderungen führt)

### Definition of Done
- [ ] Nutzer-Entscheidung (Option A oder B) liegt dokumentiert vor
- [ ] Bei Option A: alle Dateien über 450 Zeilen aufgeteilt, Tests grün nach jedem Schritt, §3 aktualisiert
- [ ] Bei Option B: AGENT.md §9 und ARCHITECTURE.md korrigiert, kein Code verändert
- [ ] Keine falsche "100%"-Behauptung mehr im Dokument, unabhängig von der gewählten Option

---

## WP7 (⬜): js/-Layer: Rules→State-Kopplung auflösen

### Ziel
Die direkte Kopplung von Regel-Engines an den globalen State auflösen, um die Rules-Schicht unabhängig testbar zu machen.

### Ausgangslage
Folgende Dateien importieren `CombatState` direkt, statt benötigte Daten als Funktionsparameter zu erhalten:
- `js/rules/attack/AttackContext.js` (Zeile ~13)
- `js/rules/BuffRules.js` (Zeile ~8)
- `js/models/helpers/modifiers/SpellModifierApplier.js` (Zeile ~13)

Diese direkte Kopplung verletzt die in `docs/ARCHITECTURE.md` beschriebene Schichtentrennung (Rules-Engines sollen zustandslos/reine Funktionen sein) und erschwert Unit-Tests der Rules-Schicht ohne vollständigen State-Mock.

### Agenten-Prompt
```
Du arbeitest am Repository "TheCombatant". Aufgabe: Direkte Kopplung
zwischen Rules-Engines und CombatState auflösen.

Schritte:
1. Arbeite in einem isolierten Branch für diese Änderung.
2. Stelle vor Beginn sicher, dass die Test-Suite grün läuft (Baseline).
   Falls WP5 noch nicht abgeschlossen ist, prüfe zumindest, dass die
   aktuell lauffähigen Tests grün sind, und notiere den Ausgangszustand.
3. Für jede der drei Dateien (AttackContext.js, BuffRules.js,
   SpellModifierApplier.js):
   a. Finde per Grep alle Stellen, an denen die Datei direkt auf
      CombatState (oder importierte State-Funktionen/Objekte) zugreift.
   b. Identifiziere genau, WELCHE Daten aus dem State benötigt werden
      (z.B. "Liste aktiver Remote-Buffs").
   c. Ändere die Funktionssignatur so, dass diese Daten als expliziter
      Parameter übergeben werden, statt sie intern aus dem State zu lesen.
   d. Finde per Grep ALLE Aufrufstellen dieser Funktionen im gesamten
      Repository (js/ und src/) und passe sie an, sodass sie die
      benötigten Daten jetzt aus dem State lesen und als Parameter
      übergeben – die State-Kopplung wandert damit zum Aufrufer, nicht
      in die Rules-Engine selbst.
4. Nach jeder einzelnen Datei: Führe die Test-Suite aus. Falls UI-relevant,
   starte den Dev-Server und verifiziere manuell an einem konkreten
   Kampf-Szenario (z.B. Angriff mit aktivem Buff), dass sich das
   Kampfverhalten nicht geändert hat.
5. Bearbeite die drei Dateien nacheinander, nicht gleichzeitig, um
   Fehlerquellen eingrenzen zu können.

Worauf achten:
- Das Verhalten darf sich NICHT ändern – dies ist ein reines strukturelles
  Refactoring (Dependency Injection statt globalem Zugriff), keine
  funktionale Änderung.
- Achte besonders auf BuffRules.js: Dort existiert eine Funktion
  isBuffSuppressed() – diese NICHT anfassen oder umbauen, das ist Aufgabe
  eines separaten WP (WP8). Nur die direkte State-Kopplung entfernen.
- Wenn eine Aufrufstelle in src/ (React-Layer) liegt und dort kein
  einfacher Zugriff auf den benötigten State-Ausschnitt besteht, kläre
  zuerst, wie der React-Layer aktuell an CombatState-Daten kommt (z.B.
  über einen Context oder Hook), bevor du dort Änderungen vornimmst.
```

### Zu pflegende Dokumente
- `docs/ARCHITECTURE.md` (falls die Beschreibung der Rules-Schicht präzisiert werden muss)
- `AGENT.md` §6 (Anti-Patterns) — ggf. ergänzen, dass diese Kopplung ein behobenes Anti-Pattern war

### Definition of Done
- [ ] AttackContext.js, BuffRules.js, SpellModifierApplier.js importieren CombatState nicht mehr direkt
- [ ] Alle Aufrufstellen angepasst und übergeben benötigte Daten explizit
- [ ] Test-Suite grün, manuelle Verifikation im Dev-Server für mind. ein Kampf-Szenario durchgeführt
- [ ] Kein Verhaltensunterschied festgestellt

---

## WP8 (⬜): js/-Layer: Duplizierte Berechnungslogik konsolidieren

### Ziel
Mehrfach implementierte RAW-Berechnungslogik (Attributsmodifikator-Formel, Bonus-Stacking) auf eine kanonische Implementierung konsolidieren.

### Teil A: Attributsmodifikator-Formel

#### Ausgangslage
Die Standardformel `floor((score-10)/2)` ist mindestens 19-fach im Code dupliziert. Eine kanonische Implementierung `getAblMod()` existiert in `js/rules/prestigeClassEngine.js` (Zeilen ~17–19). **Wichtige Abweichung:** `js/models/CombatantModifiers.js` (Zeile ~45) enthält eine DIVERGENTE Formel mit Sonderbehandlung für Werte unter 10. Es ist bei der Analyse ungeklärt geblieben, welche Formel RAW-korrekt (D&D 3.5e Regelwerk-konform) ist.

#### Agenten-Prompt (Teil A)
```
Du arbeitest am Repository "TheCombatant". Aufgabe: Duplizierte
Attributsmodifikator-Berechnung auf eine kanonische Implementierung
konsolidieren.

Schritte:
1. Finde per Grep alle Stellen im Code, die die Formel floor((score-10)/2)
   oder eine erkennbare Variante davon implementieren (Suche nach Mustern
   wie "- 10) / 2", "-10)/2", oder Funktionsnamen wie getModifier,
   abilityModifier, getAblMod etc.). Erwartet: ca. 19 Fundstellen, kann
   abweichen, da sich der Code seit der letzten Analyse geändert haben kann.
2. Prüfe die kanonische Implementierung getAblMod() in
   js/rules/prestigeClassEngine.js (nahe Zeile 17-19).
3. WICHTIG - Prüfe explizit js/models/CombatantModifiers.js (nahe Zeile 45):
   Diese Datei enthält eine abweichende Formel mit Sonderfall für Werte
   unter 10. Bevor du irgendeine Konsolidierung vornimmst, musst du klären,
   welche Formel tatsächlich RAW-korrekt ist (D&D 3.5e Regelwerk).
   Nutze dafür scratch/search_phb.js (durchsucht das Player's Handbook),
   um die offizielle Regel zur Bestimmung von Attributsmodifikatoren
   nachzuschlagen – verlasse dich NICHT auf Trainingswissen, sondern auf
   den tatsächlichen Regelwerkstext.
4. Falls nach dieser Prüfung immer noch unklar ist, welche der beiden
   Formeln korrekt ist (z.B. weil der Anwendungskontext in
   CombatantModifiers.js einen Sonderfall behandelt, der nicht einfach
   eine falsche Implementierung ist, sondern eine bewusste Ausnahme sein
   könnte): STOPPE und frage den Nutzer, bevor du konsolidierst. Rate nicht.
5. Sobald die korrekte Formel feststeht: Ersetze alle 19+ Duplikate durch
   Aufrufe von getAblMod() (oder verschiebe die Funktion an eine
   geeignetere zentrale Stelle, falls prestigeClassEngine.js kein
   sinnvoller Ort für eine so grundlegende Utility-Funktion ist – in dem
   Fall dokumentiere den neuen Ort klar).
6. Falls CombatantModifiers.js's Formel sich als fehlerhaft herausstellt,
   korrigiere sie auf die RAW-korrekte Version UND weise in deinem
   Ergebnisbericht explizit darauf hin, dass dies eine
   Verhaltensänderung sein könnte (nicht nur ein Refactoring) – dies
   könnte bestehende Charakterwerte in gespeicherten Daten beeinflussen.
7. Führe die Test-Suite nach der Konsolidierung aus.

Worauf achten:
- Dies ist potenziell KEINE reine Struktur-Änderung, falls sich
  herausstellt, dass eine der beiden Formeln tatsächlich falsch war –
  in dem Fall klar kommunizieren, dass sich ein Berechnungsergebnis
  ändern könnte.
- Verwende ausschließlich scratch/search_phb.js zur Regelklärung, nicht
  Vermutungen.
```

### Teil B: RAW-Stacking-Logik

#### Ausgangslage
Duplizierte Logik zur Anwendung der D&D-3.5e-Bonustyp-Stacking-Regeln (dodge/untyped-Boni addieren sich, andere Bonustypen: nur der höchste zählt, Abzüge/Penalties summieren sich immer separat) existiert sowohl in `js/models/Stat.js` (Zeilen ~15–30) als auch in `js/rules/attack/AttackContext.js` (Zeilen ~115–156).

#### Agenten-Prompt (Teil B)
```
Aufgabe: Duplizierte RAW-Stacking-Logik zwischen js/models/Stat.js
(nahe Zeile 15-30) und js/rules/attack/AttackContext.js (nahe Zeile 115-156)
in eine gemeinsame, wiederverwendbare Funktion konsolidieren.

Schritte:
1. Lies beide Implementierungen vollständig und vergleiche sie im Detail –
   prüfe, ob sie tatsächlich identische Regeln umsetzen oder ob es feine
   Unterschiede gibt (z.B. unterschiedliche Behandlung von Edge-Cases wie
   "kein Bonus vorhanden" oder "negativer Bonus desselben Typs").
2. Falls Unterschiede bestehen: Kläre, welches Verhalten RAW-korrekt ist
   (ggf. wieder via scratch/search_phb.js), bevor du konsolidierst.
3. Extrahiere die Logik in eine gemeinsam genutzte Funktion an einem
   sinnvollen zentralen Ort (z.B. js/rules/ oder js/models/helpers/,
   je nachdem wo ähnliche Utility-Funktionen bereits liegen).
4. Ersetze beide ursprünglichen Implementierungen durch Aufrufe dieser
   gemeinsamen Funktion.
5. Führe die Test-Suite aus und verifiziere manuell im Dev-Server ein
   Szenario mit mehreren stapelbaren und nicht-stapelbaren Boni.

Worauf achten:
- NICHT anfassen: BuffRules.js's isBuffSuppressed()-Logik – das ist
  verwandt, aber eine eigenständige Funktionalität (Unterdrückung von
  Buffs, nicht Stacking von Bonustypen) und gehört nicht in dieses WP.
```

### Zu pflegende Dokumente
- `AGENT.md` (falls die Utility-Funktionen an neuer Stelle liegen und in §3 oder anderswo referenziert werden)
- `docs/CODE_ANALYSIS.md` (zugehörige Findings als behoben markieren, falls dort erwähnt)

### Definition of Done
- [ ] Attributsmodifikator-Formel: RAW-Korrektheit geklärt, alle Duplikate konsolidiert
- [ ] CombatantModifiers.js-Divergenz aufgelöst und Ergebnis dokumentiert (Verhaltensänderung ja/nein)
- [ ] Stacking-Logik zwischen Stat.js und AttackContext.js konsolidiert
- [ ] isBuffSuppressed() unverändert
- [ ] Tests grün, manuelle Verifikation durchgeführt

---

## WP9 (⬜): src/-Layer: React-Technical-Debt

**Hinweis:** Dieses WP ist umfangreich und sollte über mehrere Sitzungen/Sessions verteilt bearbeitet werden. Die vier Teile (9a–9d) können nacheinander als eigenständige Arbeitseinheiten behandelt werden.

### WP9a (⬜): Combatant-Interface neu ableiten

#### Ausgangslage
`src/types/combat.ts` definiert ein `Combatant`-Interface, das gegen `js/models/Combatant.js` (die tatsächliche Datenquelle) abgeglichen werden muss. Bekannte Phantom-Felder (im Interface vorhanden, aber im echten Modell nicht existent oder anders benannt): `cmb`, `cmd`, `companionOf`, `size`, `tempHp`. Zusätzlich existiert ein Catch-all `[key: string]: any`, der Typsicherheit faktisch aushebelt.

#### Agenten-Prompt
```
Aufgabe: src/types/combat.ts Combatant-Interface gegen die tatsächliche
Datenstruktur in js/models/Combatant.js neu ableiten.

Schritte:
1. Lies js/models/Combatant.js vollständig und liste alle tatsächlich
   existierenden Felder/Properties auf, inkl. ihres tatsächlichen Typs
   (so weit aus dem JS-Code ersichtlich).
2. Vergleiche mit dem aktuellen Interface in src/types/combat.ts. Liste
   Diskrepanzen:
   - Felder im Interface, die im echten Modell nicht existieren (bekannt:
     cmb, cmd, companionOf, size, tempHp – aber prüfe auf weitere).
   - Felder im echten Modell, die im Interface fehlen.
   - Felder mit abweichendem Typ (z.B. Interface sagt string, Code nutzt
     number).
3. Für jede Diskrepanz: Finde per Grep alle Verwendungsstellen im
   src/-Verzeichnis, die auf das betroffene Feld zugreifen. Prüfe, ob dort
   tatsächlich mit den Phantom-Feldern gearbeitet wird (dann ist das ein
   Bug oder totes Feature) oder ob sie ungenutzt sind (dann einfach aus
   dem Interface entfernen).
4. Korrigiere das Interface Feld für Feld. Committe/prüfe nach jeder
   größeren Korrektur mit tsc (TypeScript-Compiler-Check ohne Emit), damit
   Fehler früh sichtbar werden statt sich anzuhäufen.
5. ERST NACHDEM alle bekannten Divergenzen aufgelöst sind: Entferne den
   Catch-all [key: string]: any aus dem Interface.
6. Nach Entfernen des Catch-alls werden vermutlich neue TypeScript-Fehler
   im gesamten src/-Verzeichnis sichtbar (Stellen, die sich bisher auf den
   Catch-all verlassen haben). Behebe diese, indem du für jede Fehlerstelle
   das Interface um das tatsächlich fehlende, echte Feld ergänzt (nicht
   indem du den Catch-all wieder einführst oder pauschal "as any" ergänzt).

Worauf achten:
- tsc --noEmit muss nach Abschluss fehlerfrei durchlaufen.
- Der Catch-all darf erst entfernt werden, nachdem die bekannten
  Divergenzen bereits aufgelöst sind – sonst entstehen unnötig viele
  Fehler auf einmal, die schwer zuzuordnen sind.
```

### WP9b (⬜): Riskanteste `as any`-Stellen entschärfen

#### Ausgangslage
Insgesamt 133 `as any`-Type-Assertions im src/-Verzeichnis. Nicht alle müssen behoben werden – der Fokus liegt auf den am Analyse-Datum als am riskantesten identifizierten 10 Stellen (konkrete Liste war in der ursprünglichen Analyse vorhanden, muss aber neu erhoben werden, da sich der Code inzwischen geändert haben könnte).

#### Agenten-Prompt
```
Aufgabe: Die riskantesten `as any`-Type-Assertions im src/-Verzeichnis
entschärfen – NICHT alle 133 Vorkommen, sondern eine priorisierte Auswahl.

Schritte:
1. Finde per Grep alle Vorkommen von "as any" in src/*.ts und src/*.tsx.
2. Bewerte jedes Vorkommen nach Risiko:
   - Hoch: Assertion auf Daten, die aus externen Quellen kommen (Supabase-
     Antworten, JSON.parse-Ergebnisse, Cross-Boundary-Daten aus js/-Layer)
     UND direkt in kritischen Berechnungen oder beim Speichern verwendet
     werden.
   - Mittel: Assertion innerhalb rein interner React-State-Logik.
   - Niedrig: Assertion in Test-Dateien oder unkritischen UI-Hilfsfunktionen.
3. Wähle die 10 Stellen mit dem höchsten Risiko aus (nicht mehr, nicht
   pauschal alle) und liste sie mit Datei:Zeile im Ergebnisbericht auf.
4. Für jede der 10 Stellen: Ersetze "as any" durch eine korrekte Typisierung
   (konkretes Interface, Union-Type, oder – falls die Datenform zur
   Laufzeit tatsächlich unsicher ist – eine echte Typprüfung/Type-Guard
   statt einer bloßen Behauptung).
5. Führe tsc --noEmit und die Test-Suite nach jeder Änderung aus.

Worauf achten:
- Ziel ist NICHT Vollständigkeit (alle 133 zu beheben), sondern gezielte
  Risikominimierung an den kritischsten Stellen.
- Wenn eine der 10 Stellen sich beim genaueren Hinsehen als unkritisch
  herausstellt, tausche sie gegen die nächstriskantere aus und dokumentiere
  das.
```

### WP9c (⏸️ Blockiert – Nutzer-Entscheidung erforderlich): Dialog-Bridge-Migration

#### Ausgangslage
`window.__REACT_DIALOG_BRIDGE__` ist ein globaler Kopplungsmechanismus für eine unvollständige Migration von Vanilla-JS-Dialogen zu React. `DialogContext.tsx` bietet bereits 18 `showXyz`-Methoden über `useDialog()` als vorgesehenen React-nativen Ersatz, aber ca. 58 von 63 dialog-relevanten Dateien nutzen noch die Legacy-Bridge. Zusätzlich unterstützt `DialogContext` aktuell nur einen einzigen Modal-Slot (kein Stacking mehrerer gleichzeitig offener Dialoge).

#### ⚠️ Dies ist eine Entscheidung, keine Aufgabe
- **Option a — Vollmigration:** Alle ~58 verbleibenden Dateien auf `useDialog()` umstellen, `window.__REACT_DIALOG_BRIDGE__` vollständig entfernen. Hoher Aufwand, aber löst die Inkonsistenz vollständig auf.
- **Option b — Bridge offiziell dokumentieren:** Die Bridge als dauerhaften, bewusst gewählten parallelen Pfad dokumentieren (z. B. für Fälle, in denen Vanilla-JS-Code aus strukturellen Gründen nicht sinnvoll migriert werden kann), statt sie als technische Schuld zu behandeln.

#### Agenten-Prompt
```
Aufgabe: window.__REACT_DIALOG_BRIDGE__-Migration.

STOPP-BEDINGUNG: Bevor du beginnst, prüfe, ob dir bereits mitgeteilt wurde,
ob Option a (Vollmigration auf useDialog()) oder Option b (Bridge offiziell
als dauerhafter Pfad dokumentieren) gewählt werden soll. Falls nicht,
STOPPE und frage den Nutzer aktiv nach dieser Entscheidung, bevor du
fortfährst. Beginne unter keinen Umständen eigenmächtig mit einer
Vollmigration (Option a), da dies ca. 58 Dateien betrifft und ein hohes
Regressionsrisiko birgt.

Unabhängig von der Entscheidung, zuerst:
1. Behebe das Single-Modal-Slot-Problem in DialogContext.tsx: Es muss
   möglich sein, mehrere Dialoge gestapelt zu verwalten (z.B. ein
   Bestätigungsdialog über einem bereits offenen Inventar-Dialog). Prüfe
   den aktuellen Implementierungsstand und erweitere die interne
   Zustandsverwaltung von einem einzelnen Modal-Objekt zu einem Stack
   (Array), ohne die bestehende showXyz()-API für aufrufenden Code zu
   verändern (Abwärtskompatibilität für bereits migrierten Code).
2. Führe Tests nach dieser Änderung aus, bevor du zu Schritt 3 (abhängig
   von der Nutzer-Entscheidung) übergehst.

Falls Option a (Vollmigration) gewählt wurde:
3a. Erstelle zunächst eine vollständige Liste aller ~58 betroffenen Dateien
    (Grep nach __REACT_DIALOG_BRIDGE__). Migriere sie in überschaubaren
    Gruppen (z.B. 5-10 Dateien pro Arbeitsschritt), nicht alle auf einmal.
    Nach jeder Gruppe: tsc --noEmit und Test-Suite ausführen, UI im
    Dev-Server für die migrierten Dialoge manuell prüfen.
    Entferne window.__REACT_DIALOG_BRIDGE__ erst, wenn WIRKLICH alle
    Verwendungsstellen migriert sind (nochmal per Grep verifizieren).

Falls Option b (offiziell dokumentieren) gewählt wurde:
3b. Dokumentiere in AGENT.md (Anti-Patterns-Abschnitt oder einem neuen
    Abschnitt) explizit, dass __REACT_DIALOG_BRIDGE__ ein bewusst gewählter,
    dauerhafter paralleler Pfad ist, und beschreibe klar, WANN neuer Code
    die Bridge nutzen darf und wann useDialog() zu verwenden ist (z.B.
    "Bridge nur für Aufrufe aus Vanilla-JS-Code ohne React-Kontext, sonst
    immer useDialog()"). Verändere in diesem Fall keinen der 58
    Verwendungsstellen.

Worauf achten:
- Der Multi-Slot-Fix (Schritt 1) ist in JEDEM Fall zu machen, unabhängig
  von der a/b-Entscheidung.
- Bei Option a: kleine, verifizierbare Schritte statt Big-Bang-Migration.
```

### WP9d (⬜): Props-Drilling / PCContext, Reorganisation der Tab-Komponenten

#### Ausgangslage
Ausgeprägtes Props-Drilling in der React-Schicht; Einführung von `React.memo` an geeigneten Stellen fehlt größtenteils. Ca. 20 lose player/-Tab-Komponenten liegen unstrukturiert im Wurzelverzeichnis statt in thematischen Unterordnern.

#### Agenten-Prompt
```
Aufgabe: Props-Drilling reduzieren und player/-Tab-Komponenten
reorganisieren.

Schritte:
1. Identifiziere per Code-Lektüre die Stellen mit dem stärksten
   Props-Drilling (Props, die durch 3+ Komponentenebenen durchgereicht
   werden, ohne auf den Zwischenebenen selbst genutzt zu werden).
2. Prüfe, ob bereits ein PCContext (Player-Character-Context) oder
   ähnlicher React-Context existiert. Falls ja, erweitere ihn um die
   betroffenen Werte. Falls nein, lege einen neuen, klar benannten Context
   für die betroffenen Daten an.
3. Ersetze das Props-Drilling schrittweise durch Context-Konsum an den
   Stellen, die die Daten tatsächlich brauchen (nicht in jeder
   Zwischenkomponente).
4. Identifiziere Komponenten, die von häufigen Re-Renders betroffen sind,
   obwohl sich ihre tatsächlich relevanten Props nicht geändert haben, und
   ergänze React.memo mit einer sinnvollen Vergleichsfunktion, falls nötig.
5. Liste alle ca. 20 losen Tab-Komponenten im player/-Wurzelverzeichnis
   auf und gruppiere sie thematisch (z.B. Combat, Inventory, Spells,
   Character-Sheet) in entsprechende Unterordner. Aktualisiere alle
   Imports im Repository entsprechend.
6. Nach jeder größeren strukturellen Änderung: tsc --noEmit und Test-Suite
   ausführen; UI im Dev-Server stichprobenartig prüfen.

Worauf achten:
- Reorganisation der Ordnerstruktur (Schritt 5) ist rein strukturell –
  keine Logikänderung an den Komponenten selbst dabei vornehmen.
- Context-Einführung schrittweise, nicht alle Props auf einmal umbauen.
```

### Zu pflegende Dokumente (WP9 gesamt)
- `AGENT.md` §3 (Pfadänderungen durch Reorganisation in 9d)
- `AGENT.md` (Anti-Patterns-Abschnitt, falls 9c Option b gewählt wird)
- `docs/ARCHITECTURE.md` (falls sich die Beschreibung der React-Schicht durch PCContext ändert)

### Definition of Done (WP9 gesamt)
- [ ] 9a: Combatant-Interface stimmt mit js/models/Combatant.js überein, Catch-all entfernt, tsc fehlerfrei
- [ ] 9b: 10 riskanteste as-any-Stellen entschärft und dokumentiert
- [ ] 9c: Nutzer-Entscheidung getroffen, Multi-Slot-Fix umgesetzt, gewählte Option umgesetzt
- [ ] 9d: PCContext (neu oder erweitert) reduziert Props-Drilling an identifizierten Stellen, Tab-Komponenten thematisch reorganisiert
- [ ] Nach jedem Teilschritt: tsc --noEmit und Vitest-Suite grün

---

## WP10 (⬜, dauerhaft – kein einmaliges WP): Selbstwartungsregeln aktiv halten

### Ziel
Sicherstellen, dass AGENT.md und die übrige Dokumentation NICHT erneut in den Zustand veralten, der die vorliegende Analyse überhaupt nötig gemacht hat.

### Geltungsbereich
Dies ist eine **stehende Regel für jede zukünftige Änderung** am Repository, unabhängig davon, welches der WP1–WP9 gerade bearbeitet wird oder ob alle bereits abgeschlossen sind.

### Agenten-Prompt (bei JEDER künftigen Code-Änderung anzuwenden)
```
Bei jeder Änderung an diesem Repository (TheCombatant), unabhängig vom
konkreten Auftrag, gilt zusätzlich:

1. Vollständige @module-Header: Jede neu erstellte oder wesentlich
   veränderte Datei in js/ und src/ muss einen @module-Header-Kommentar
   mit kurzer Beschreibung des Dateizwecks besitzen (siehe AGENT.md §8.1
   für das erwartete Format).
2. @feature-Tags: Neue Features müssen mit einem @feature-Tag markiert
   werden (siehe AGENT.md §8.2), nicht nur vereinzelte Features wie
   bisher (z.B. "wildshape") – dies soll konsequent für ALLE neuen
   Features gelten, nicht nur für einzelne.
3. AGENT.md §3 sofort aktualisieren: Wird eine Datei verschoben, umbenannt
   oder aufgeteilt, muss die Feature→Datei-Tabelle in AGENT.md §3 im
   SELBEN Arbeitsschritt aktualisiert werden – nicht als nachgelagerte
   Aufgabe.
4. Cache-Version synchron halten: Wird package.json-Version geändert, muss
   im selben Schritt service-worker.js CACHE_NAME nach der in AGENT.md §5
   beschriebenen Konvention mit hochgezählt werden.
5. AGENT.md §4 (State-API-Referenz) aktualisieren, sobald neue State-
   Actions hinzugefügt werden.
6. Proaktives Aufteilen: Nähert sich eine Datei der 450-Zeilen-Grenze
   (siehe Ergebnis von WP6), sollte sie VOR Überschreiten der Grenze
   aufgeteilt werden, statt die Grenze zu überschreiten und dies später
   nachzuholen.
7. Tier-3-Testlauf: Nach jeder strukturellen Änderung (nicht nach jeder
   kleinen Änderung) mindestens einmal die vollständige/globale Test-Suite
   ausführen, nicht nur die unmittelbar betroffenen Einzeltests.

Periodischer Erosions-Check:
Unabhängig von einzelnen Änderungen sollte etwa alle 4-6 Wochen oder nach
jedem größeren Feature-Merge ein erneuter Kurz-Audit durchgeführt werden,
der prüft, ob die in WP1-WP5 hergestellten Zustände (korrekte Referenzen,
korrekte Feature-Tabelle, funktionierende Tests) noch gelten. Dieser
Erosions-Check muss kein vollständiger Agenten-Auftrag sein – eine
stichprobenartige Prüfung der in WP1-WP5 behandelten Punkte reicht.
```

### Zu pflegende Dokumente
- `AGENT.md` (laufend, bei jeder relevanten Änderung)
- `docs/ARCHITECTURE.md` (bei architektonischen Änderungen)
- `CHANGELOG.md` (bei jedem Feature-Abschluss)

### Definition of Done
Dieses WP hat keinen Abschlusszustand – es ist erfüllt, solange die Regeln bei jeder künftigen Änderung tatsächlich befolgt werden. Der einzige Prüfpunkt ist der periodische Erosions-Check.

---

## Anhang

Die zugrunde liegende Vollanalyse (Stand 2026-09-11) wurde nicht als eigenständiges Dokument gespeichert, sondern in dieses Zielbild-Dokument direkt eingearbeitet. Sollte sich der Code seit diesem Datum wesentlich verändert haben, kann es sinnvoll sein, den betroffenen Teilbereich vor Bearbeitung eines WP erneut zu verifizieren (viele Prompts oben enthalten dafür bereits explizite Verifikationsschritte, z. B. "prüfe per Dateisystemsuche", "prüfe per Grep").
