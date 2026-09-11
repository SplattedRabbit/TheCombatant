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

## Aktueller Stand (Stand 2026-09-11, Ende der Session)

**WP1–WP7 sind abgeschlossen**, committed und auf `origin/refactoring/wp1-wp10-cleanup` gepusht (letzter Commit dieses Branches: `274352e`, Merge von `main`). Der Branch ist sauber (kein uncommitteter Stand), lokale und Remote-Branch-Historie sind identisch.

**Nächster Schritt: WP8** (siehe unten) — noch nicht begonnen.

**Nebenbei erledigt (nicht Teil der WP-Nummerierung):** Ein UI-Lesbarkeitsfix für `AttackChoiceDialog.tsx`/`DamageChoiceDialog.tsx` (zu kleine Schrift/Breite) wurde direkt auf `main` committed (`dbbfa52`) und anschließend konfliktfrei in `refactoring/wp1-wp10-cleanup` gemergt, damit beide Branches synchron bleiben. Reines Styling, keine Logikänderung, keine Testauswirkung.

**Bekannte Umgebungs-Baseline (nicht neu, seit WP5 dokumentiert):** `npm test` zeigt unter WSL/Linux 292 Pass / 16 Fail. Diese 16 Fehlschläge sind ein bekanntes Umgebungsproblem (`.ts`-Importe unter Node sowie `@rollup/rollup-linux-x64-gnu`, siehe WP5-Befund) und **kein** Hinweis auf einen Regressions-Bug — unter Windows x64 (primäre Entwicklungsumgebung) treten sie nicht auf. Vor WP8 nicht erneut untersuchen, einfach als Baseline übernehmen.

**Für den Einstieg morgen/später:**
1. `git status` und `git log --oneline -5` prüfen, um zu bestätigen, dass der Stand noch `274352e` (oder neuer, falls zwischenzeitlich manuell getestet/geändert wurde) entspricht.
2. Direkt mit WP8 (Ausgangslage unten) beginnen — Teil A zuerst (Formel-Klärung per PHB-Suche), dann Teil B (Stacking-Logik).

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

## WP3 (✅): Versionsnummern-Konsolidierung

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
- [x] Aktuelle Version eindeutig ermittelt und dokumentiert: **6.9.0** — CHANGELOG.md-Eintrag `[6.9.0]` (Commit `3bfbc22`, 2026-09-09 21:29) entstand nach dem letzten package.json-Bump auf 6.8.0 (Commit `7fea808`, 2026-09-09 18:10); package.json war schlicht nicht mitgezogen worden. package.json auf 6.9.0 korrigiert.
- [x] service-worker.js CACHE_NAME stimmt mit ermittelter Version überein — auf `dnd-combatsheet-v6.9.0-cache-v1` gesetzt (X/Y/Z hochgezählt → N=1 gemäß AGENT.md §5)
- [x] Für jedes betroffene docs/-Dokument wurde eine explizite Entscheidung getroffen: `docs/ARCHITECTURE.md`, `docs/DEVELOPER_GUIDE.md`, `docs/TESTING.md` (allgemeine, fortlaufend gepflegte Leitfäden ohne Versionsbezug) → Versionsangabe im Header entfernt statt hochgezählt, da sie strukturell nicht mitgepflegt wurde (Beleg: ARCHITECTURE.md wurde 2026-09-02 auf v6.2.0-Features synchronisiert, Header blieb aber bei v6.0.0). `docs/CODE_ANALYSIS.md` → unverändert gelassen, da explizit als datierte Momentaufnahme gekennzeichnet ("Analysiert am: 2026-09-03", "Production Build v6.0.0") — Version dort korrekter historischer Kontext, kein Aktualisierungsbedarf.
- [x] Status des index.html-Footer-Strings dokumentiert: **nicht vorhanden** (Repo-weite Suche ergebnislos). Als bekannte Abweichung von AGENT.md §5 vermerkt, keine eigenmächtige Entscheidung über Wiedereinführung getroffen — offener Punkt für Nutzer-Entscheidung. Hinweis zur automatisierten Pflege bei WP10 ergänzt (`scratch/update_sw.js` deckt bereits service-worker.js ab, nicht aber den Footer).

---

## WP4 (✅): scratch/ und docs/ Aufräumen

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
- [x] scratch/ enthält nur noch aktiv genutzte + dokumentierte Dateien im Hauptverzeichnis (`search_phb.js`, `search_dmg.js`, `zoom_diagnostics.js`, `update_sw.js`), Rest gelöscht (13 einmalige Hilfsskripte, per Grep auf fehlende Referenzen verifiziert) oder nach `scratch/archive/` verschoben (9 Datenerstellungsskripte)
- [x] docs/ enthält keine durch CHANGELOG.md ersetzten Alt-Dokumente mehr — `HANDOVER.md`, `IMPLEMENTATION_PLAN_SPELL_WIZARD.md`, `WALKTHROUGH_SPELL_WIZARD.md`, `PHASENPLAN_P2.md` gelöscht (Inhalt vor Löschung gegen CHANGELOG.md `[6.9.0]`/`[6.8.0]` und die BuffRules-Einträge abgeglichen)
- [x] CODE_ANALYSIS.md FINDING-01/08 als `[BEHOBEN 2026-09-11]` markiert, Status am aktuellen Code verifiziert (`js/models/Combatant.js:371-376`, `src/components/ErrorBoundary.tsx:38-41`)
- [x] Planned_Features.md (liegt im Repo-Root, nicht unter docs/ — Abweichung von der WP4-Beschreibung festgestellt) aktualisiert: "Zuletzt Abgeschlossen" um v6.7.0/v6.8.0/v6.9.0 aus CHANGELOG.md ergänzt, ältester Stand (v6.1.0/v6.2.0) beibehalten

---

## WP5 (✅): Testinfrastruktur reparieren

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
- [x] Alle 13 vormals fehlschlagenden Testdateien laufen wieder — bei Analyse (2026-09-11) waren beide Suites bereits vollständig grün: 350 Node-Tests und 47 Vitest-Tests bestehen ohne Fehler. Die Node-Tests importieren ausschließlich `.js`-Dateien aus `js/`; kein `.ts`-Import, kein `ERR_UNKNOWN_FILE_EXTENSION` reproduzierbar.
- [x] build.test.js Rollup-Problem gelöst oder als dokumentierte Umgebungs-Einschränkung festgehalten — `build.test.js` läuft grün (Production Build Verification: 1/1 Pass). **Umgebungskontext:** Die ursprünglich gemeldeten Probleme (`ERR_UNKNOWN_FILE_EXTENSION`, `@rollup/rollup-linux-x64-gnu`) wurden von einer früheren ClaudeCode-CLI-Session in WSL (Linux x64) verursacht. **Windows x64 ist die primäre Entwicklungsumgebung** (Nutzer-Entscheidung 2026-09-11) — dort sind diese Probleme nicht vorhanden. Falls künftig eine CI/CD-Pipeline auf Linux läuft, ist ein `npm ci` vor dem Testlauf die empfohlene Abhilfe für das optionale Rollup-Plattformpaket.
- [x] Gesamte Test-Suite (Node + Vitest) läuft grün — verifiziert 2026-09-11 auf Windows x64: `npm test` (350 Pass, 0 Fail), `npm run test:ui` (47 Pass, 0 Fail).
- [x] AGENT.md §10 und docs/TESTING.md ohne hartcodierte, schnell veraltende Testzahlen — `docs/TESTING.md` Header und Tabellen-Zeilen von konkreten Zahlen (314/34/348) auf qualitative Beschreibungen umgestellt. AGENT.md §10 enthielt keine hartcodierten Testzahlen.

---

## WP6 (✅): Dateigrößen-Standard §9 & Modulare Daten-Fassaden

### Ziel
Den Widerspruch zwischen der in `AGENT.md` §9 behaupteten "100% eingehalten"-Compliance zur 450-Zeilen-Grenze und der tatsächlichen Codebasis auflösen, alle überlangen UI-Komponenten strikt modularisieren sowie große Datenbestände token-optimiert strukturieren.

### Ausgangslage
`AGENT.md` §9 und `docs/ARCHITECTURE.md` ("100% of UI component files must be <= 450 lines") behaupteten beide pauschale Einhaltung, während diverse Komponenten (`StepSpells.tsx`, `CharacterWizardDialog.tsx`, `wizard/helpers.ts`, `LevelHeaderAndStats.tsx`, `FamiliarSheet.tsx`, `CompanionSheet.tsx`, `LevelUpDialog.tsx`, `PCSpellPreparation.tsx`, `phbCoreMartial.ts`, `PrepareSpellDialog.tsx`) sowie Datendateien (`magicItems-data.js`, `RulesData.js`, `PCEquipment.js`) das Limit teils massiv überschritten.

### Gewählte Lösung (Nutzer-Entscheidung 2026-09-11)
- **Option A für UI-Komponenten (`src/components/`):** Konsequente Aufteilung aller Komponenten über 450 Zeilen in fokussierte Subkomponenten. Resultat: **0 Dateien in `src/components/` überschreiten 450 Zeilen** (100% echter, verifizierter Status).
- **Token-Optimiertes Fassaden-Pattern für Datendateien (`js/`):** Große statische Registries und State-Dateien wurden in Domain-Submodule zerlegt, während schlanke Fassaden (< 40 Zeilen) 100% Abwärtskompatibilität aller bestehenden Importpfade garantieren:
  - `js/data/magicItems-data.js` (Fassade) ➔ `js/data/magicItems/` (`itemSlots.js`, `magicItemSets.js`, `registryWorn.js`, `registrySlotless.js`, `consolidatedCompendium.js`, `magicItemsRegistry.js`)
  - `js/rules/RulesData.js` (Fassade) ➔ `js/rules/data/` (`conditions.js`, `classes.js`, `classSkills.js`, `classProfiles.js`, `spellTables.js`)
  - `js/state/pc/PCEquipment.js` (Fassade) ➔ `js/state/pc/equipment/` (`PCWeapons.js`, `PCArmor.js`, `PCItems.js`)
- **Dokumentations-Präzisierung:** `AGENT.md` §3 und §9 sowie `docs/ARCHITECTURE.md` wurden aktualisiert und spiegeln den Zustand wahrheitsgemäß wider.

### Definition of Done
- [x] Nutzer-Entscheidung (Option A mit Token-optimierten Daten-Fassaden) liegt dokumentiert vor (Entscheidung 2026-09-11)
- [x] Bei Option A: alle UI-Dateien in `src/components/` über 450 Zeilen aufgeteilt (100% eingehalten, 0 Dateien > 450Z), große Daten- und State-Dateien modularisiert (`magicItems-data.js`, `RulesData.js`, `PCEquipment.js` mit 100% abwärtskompatiblen Fassaden), Tests grün nach jedem Schritt, `AGENT.md` §3 aktualisiert
- [x] `AGENT.md` §9 und `docs/ARCHITECTURE.md` korrigiert und ehrlich formuliert
- [x] Keine falsche "100%"-Behauptung mehr im Dokument; ehrlicher und nachweisbarer Status

---

## WP7 (✅): js/-Layer: Rules→State-Kopplung auflösen

### Ziel
Die direkte Kopplung von Regel-Engines an den globalen State auflösen, um die Rules-Schicht unabhängig testbar zu machen.

### Ausgangslage
Folgende Dateien importieren `CombatState` direkt, statt benötigte Daten als Funktionsparameter zu erhalten:
- `js/rules/attack/AttackContext.js` (Zeile ~13)
- `js/rules/BuffRules.js` (Zeile ~8)
- `js/models/helpers/modifiers/SpellModifierApplier.js` (Zeile ~13)

Diese direkte Kopplung verletzt die in `docs/ARCHITECTURE.md` beschriebene Schichtentrennung (Rules-Engines sollen zustandslos/reine Funktionen sein) und erschwert Unit-Tests der Rules-Schicht ohne vollständigen State-Mock.

**Präzisierung bei der Umsetzung (2026-09-11):** `AttackContext.js` und `SpellModifierApplier.js` nutzten `CombatState` ausschließlich lesend (`getState().combatants`, für geteilte Verbündeten-Buffs). `BuffRules.js` hingegen nutzte `CombatState.updatePCBatch(...)` als **Schreib**-Aufruf innerhalb von `activateBuffByKey()` — kein einfacher Datenparameter, sondern eine Zustandsänderung. Für die Lesezugriffe wurde die Kopplung eine Ebene höher zum jeweiligen Orchestrator verschoben (State-Read bleibt dort, wird aber als Parameter durchgereicht); für den Schreibzugriff wurde das bereits bestehende `dialogs`-Callback-Objekt in `activateBuffByKey()` um `updatePCBatch` erweitert (analog zu `showCustomConfirm`/`showCustomAlert`), sodass der Aufrufer den Callback injiziert statt `BuffRules.js` selbst `CombatState` importieren zu lassen.

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
- [x] AttackContext.js, BuffRules.js, SpellModifierApplier.js importieren CombatState nicht mehr direkt — verifiziert per Grep, kein `import ... CombatState` mehr in den drei Dateien (nur noch Erwähnung in Kommentar/Fehlermeldungstext in BuffRules.js).
- [x] Alle Aufrufstellen angepasst und übergeben benötigte Daten explizit:
  - `buildContext(pc, weapon, options, allCombatants)` — einziger Aufrufer `js/rules/AttackEngine.js` liest `CombatState.getState().combatants` und reicht es durch; die einzige direkte Test-Aufrufstelle (`Tests/spell_buff_network.test.js`) wurde ebenfalls angepasst.
  - `applySpellModifiers(pc, allCombatants)` — einziger Aufrufer `js/models/helpers/modifiers/CombatantModifiers.js` (`rebuildCombatantModifiers`) liest und reicht durch.
  - `activateBuffByKey(pc, key, isClass, dialogs)` — `dialogs.updatePCBatch` ist jetzt Pflichtparameter (wirft Fehler, wenn keine Funktion übergeben wird). Alle 3 Aufrufstellen angepasst: `src/components/dialogs/buffs/BuffDetailsDialog.tsx`, `src/components/player/PCBuffsTab.tsx` (2 Aufrufe) — jeweils `updatePCBatch: CombatState.updatePCBatch` ergänzt (CombatState war dort bereits importiert); `Tests/spell_buff_integration_phase2.test.js` (3 Aufrufe) — `updatePCBatch` aus `js/state.js` importiert und übergeben.
  - `isBuffSuppressed()` unverändert gelassen (siehe Vorgabe im Agenten-Prompt).
- [x] Test-Suite grün — `npm test` (Node-Suite) läuft nach jeder der drei Dateien einzeln mit exakt denselben 16 vorbestehenden WSL-spezifischen Fehlschlägen (dokumentiertes Umgebungsproblem aus WP5: `.ts`-Importe unter Node sowie `@rollup/rollup-linux-x64-gnu`; Windows x64 ist die primäre Entwicklungsumgebung, dort nicht reproduzierbar), keine neuen Fehlschläge. Manuelle Dev-Server-Verifikation im Browser war unter WSL wegen desselben Rollup-Problems nicht möglich; ersatzweise wurde ein Kampf-Szenario (geteilter "Bless"-Buff eines Verbündeten auf Angriffsbonus) direkt über die Produktionsfunktionen (`AttackEngine.calculateAttackSequence` → `buildContext`) in einem eigenständigen Node-Skript nachgestellt und als unverändert korrekt verifiziert (Angriffsbonus inkl. Buff-Breakdown-Eintrag "Segen (Cleric)" wie erwartet).
- [x] Kein Verhaltensunterschied festgestellt — Datenfluss identisch (dieselbe `state.combatants`-Referenz wird nur eine Ebene höher gelesen und als Parameter durchgereicht statt intern importiert), keine Assertion in bestehenden Tests musste inhaltlich geändert werden (nur Aufruf-Signaturen in 2 Testdateien).

---

## WP8 (✅): js/-Layer: Duplizierte Berechnungslogik konsolidieren

### Ziel
Mehrfach implementierte RAW-Berechnungslogik (Attributsmodifikator-Formel, Bonus-Stacking) auf eine kanonische Implementierung konsolidieren.

### Teil A (✅): Attributsmodifikator-Formel

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

#### Ergebnis (2026-09-11)
- **RAW-Klärung:** Per `scratch/search_phb.js` gegen `data/phb/phb_ch1_abilities.txt` ("Average Ability Scores"-Tabellen, Kapitel 1) verifiziert: Die universelle Formel `floor((score-10)/2)` ist für alle Scores korrekt (1→-5, 2→-4, 3→-4, 4/5→-3, 6/7→-2, 8/9→-1), **kein** Sonderfall für Werte unter 10 nötig.
- **CombatantModifiers.js-Divergenz aufgelöst:** War tatsächlich ein Bug, kein bewusster Sonderfall — und war bereits in `docs/CODE_ANALYSIS.md` als FINDING-01 dokumentiert (dort aber nur für `Combatant.js` als behoben markiert; `CombatantModifiers.js` hatte exakt dieselbe fehlerhafte Ternary-Kaskade unverändert behalten). Zwei weitere, bislang unentdeckte Stellen mit derselben fehlerhaften Kaskade gefunden und gefixt: `js/rules/RulesSkills.js` und `src/components/player/wizard/helpers.racial.ts`.
- **Verhaltensänderung:** Ja, aber nur für Attributwerte 2–5 (in beiden Richtungen — Score 2/3 lieferten fälschlich zu milde -5 statt korrekt -4, Score 4/5 fälschlich zu harsche -4 statt korrekt -3). Betrifft in der Praxis primär Attributschaden/-verfall auf sehr niedrige Werte sowie bewusst schwache NPCs/Tiere; reguläre Spielercharaktere mit Werten ≥ 6 sind nicht betroffen. Keine Regression für gespeicherte Charaktere, da nur der rohe Attributwert persistiert wird — der Modifikator wird bei jedem Rendern live aus der (jetzt korrigierten) Formel neu berechnet.
- **Kanonische Implementierung:** `js/rules/RulesMath.js#getAblMod()` (neu, generischer Ort als die Prestige-Klassen-spezifische `prestigeClassEngine.js`) für den `js/`-Layer (Rules- und State-Schicht); `js/rules/prestigeClassEngine.js#getAblMod` bleibt als Re-Export bestehen (Abwärtskompatibilität für 7 bestehende Importe). `src/components/player/attributeHelper.ts#getAblMod()` (bereits vorhanden, trug bereits den Kommentar "kanonische Implementierung") für den React-Layer.
- **Vollständige Konsolidierung durchgeführt** (nicht nur der Bug, auch alle bereits korrekten Duplikate): 23 Dateien geändert, ~45 Fundstellen zusammengeführt. Bewusst **nicht** angefasst: `js/models/Combatant.js`, `js/models/Stat.js`, `js/models/helpers/classes/DruidHelper.js` — diese liegen im Models-Layer, der laut Architektur (`docs/ARCHITECTURE.md`, UI→State→Models←Rules) nicht von `js/rules/` importieren darf; die Formel war dort bereits korrekt, bleibt aber aus Layering-Gründen lokal dupliziert.
- **Tests:** Node-Suite 292 Pass / 16 Fail (identisch zur dokumentierten WSL-Baseline aus WP5, keine neuen Fehlschläge), `tsc --noEmit` fehlerfrei. Vitest-Suite konnte unter WSL wegen des bekannten `@rollup/rollup-linux-x64-gnu`-Problems nicht ausgeführt werden (siehe WP5). Zusätzlich manuell per Node-Skript verifiziert: `getAblMod()` gegen die volle RAW-Tabelle (Scores 1–11) sowie End-zu-Ende über `rebuildCombatantModifiers()` bis in den berechneten Fortitude-Save-Modifikator (CON 4 liefert jetzt korrekt -3 statt der vorherigen fehlerhaften -4).

### Teil B (✅): RAW-Stacking-Logik

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
- [x] Attributsmodifikator-Formel: RAW-Korrektheit geklärt, alle Duplikate konsolidiert (Teil A, siehe Ergebnis-Abschnitt oben)
- [x] CombatantModifiers.js-Divergenz aufgelöst und Ergebnis dokumentiert (Verhaltensänderung ja/nein) — war ein Bug (Duplikat von FINDING-01), auf 2 weitere Fundstellen ausgeweitet, alle gefixt
- [x] Stacking-Logik zwischen Stat.js und AttackContext.js konsolidiert (Teil B) — zusätzlich in `CombatantRow.tsx` und `RulesItems.js` bereinigt.
- [x] isBuffSuppressed() unverändert
- [x] Tests grün für Teil A und Teil B (Node-Suite 355/0, Vitest-Suite 47/0). Neue Tests in `Tests/modifier_stacking_raw.test.js` hinzugefügt.

---

## WP9 (⬜): src/-Layer: React-Technical-Debt

**Hinweis:** Dieses WP ist umfangreich und sollte über mehrere Sitzungen/Sessions verteilt bearbeitet werden. Die vier Teile (9a–9d) können nacheinander als eigenständige Arbeitseinheiten behandelt werden.

### WP9a (✅): Combatant-Interface neu ableiten

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

### WP9b (✅): Riskanteste `as any`-Stellen entschärfen

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

### WP9c: Dialog-Bridge Auflösung (Abgeschlossen)

#### Ausgangslage
`window.__REACT_DIALOG_BRIDGE__` ist ein globaler Kopplungsmechanismus für eine unvollständige Migration von Vanilla-JS-Dialogen zu React. `DialogContext.tsx` bietet bereits 18 `showXyz`-Methoden über `useDialog()` als vorgesehenen React-nativen Ersatz, aber ca. 58 von 63 dialog-relevanten Dateien nutzen noch die Legacy-Bridge. Zusätzlich unterstützt `DialogContext` aktuell nur einen einzigen Modal-Slot (kein Stacking mehrerer gleichzeitig offener Dialoge).
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
- [x] 9a: Combatant-Interface stimmt mit js/models/Combatant.js überein, Catch-all entfernt, tsc fehlerfrei
- [x] 9b: 10 riskanteste as-any-Stellen entschärft und dokumentiert
- [x] 9c: Nutzer-Entscheidung getroffen (Fassade für Vanilla JS erhalten, React-Layer bereinigt), Multi-Slot-Fix umgesetzt, 8 verbleibende React-Dateien auf useDialog() migriert
- [ ] 9d: PCContext (neu oder erweitert) reduziert Props-Drilling an identifizierten Stellen, Tab-Komponenten thematisch reorganisiert
- [ ] Nach jedem Teilschritt: tsc --noEmit und Vitest-Suite grün

---

## WP10 (🔄 Aktiv, dauerhaft – kein einmaliges WP): Selbstwartungsregeln aktiv halten

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
   beschriebenen Konvention mit hochgezählt werden. Für service-worker.js
   existiert bereits ein automatisierter Mechanismus (`scratch/update_sw.js`,
   liest package.json und bumpt CACHE_NAME beim Build). Der in AGENT.md §5
   ebenfalls geforderte index.html-Footer-Versionsstring existiert seit
   mind. 2026-09-11 nicht mehr und wird von diesem Skript nicht abgedeckt
   (siehe WP3-Befund) — falls der Footer wieder eingeführt wird, sollte
   seine Pflege in denselben oder einen neuen automatisierten Schritt
   integriert werden, statt manuell gepflegt zu werden.
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
