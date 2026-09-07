# Übergabe & Systemstatus (v6.5.0 / Branch `refactor/bilingual-cleanup`) — The Combatant

## 🚀 Copy-Paste Prompt für den neuen Rechner / neuen Chat

```markdown
Wir setzen die Entwicklung von The Combatant auf Basis von Branch `refactor/bilingual-cleanup` (Version v6.5.0 / aktueller Stand) fort.

Zuletzt abgeschlossen:
1. Vollständige 100% RAW-Englisch-Bereinigung (Rules As Written) über die gesamte Applikation:
   - Alle 12 Feat-Dateien (`js/data/feats/**/*.js`) bereinigt: Sämtliche deutschen Texte (`benefitDe`, alte `appEffect`-Strings) durch kanonische englische RAW-Regeln und standardisierte englische Kurzeffekte ersetzt.
   - Alle 4 Zauberdatenbanken (`data/spells-*.json`) bereinigt: Zaubernamen vereinheitlicht (`name: nameEn`, `nameDe: nameEn`), 35 deutsche Zaubereffekt-Quellen (wie 'Stärke des Stiers' -> 'Bull\'s Strength', 'Hast' -> 'Haste') übersetzt für rein englische Würfel-Breakdowns.
   - Regel- & Validierungs-Engine (`RulesData.js`, `RulesSpells.js`, `PCFeatsSpells.js`): Prestigeklassen (Mystic Theurge, Arcane Trickster, etc.) und Fehlermeldungen (Not a Spellcaster, Cannot Learn Spell, Prohibited School) auf Englisch umgestellt.
   - UI & Wizard Dialoge: Deutsche Untertitel, Alt-Namen-Felder und Lokalisierungsreste in FeatScrollDialog, SpellCompendium, SpellDetailsDialog, SpellCreatorDialog, LevelUpDialog, Alignment-Auswahl (Lawful, Neutral, Chaotic, Good, Neutral, Evil) und LevelHeaderAndStats entfernt.
   - Print Pages 2, 3 und 4: Fertigkeiten, Talente, Ausrüstung und Zauber konsistent auf Englisch aufgelöst.
2. 100% Abwärtskompatibilität gewahrt:
   - Vorhandene Charaktere in localStorage, Supabase und JSON-Dateien bleiben vollständig intakt (kein Datenverlust, Aliasing über Combatant-Helfer und nameDe=nameEn Mapping).
3. Test- & Build-Status:
   - 343 Node-Tests (`npm test`) in 24 Suites $\rightarrow$ 100% bestanden (0 Fehler).
   - 41 Vitest UI-Tests (`npm run test:ui`) in 7 Suites $\rightarrow$ 100% bestanden (0 Fehler).
   - TypeScript (`npm run typecheck`) $\rightarrow$ 0 Fehler.
   - Produktions-Build (`npm run build`) $\rightarrow$ erfolgreich generiert (Code 0).
```

---

## 📋 Systemstatus & Git-Metadaten

* **Repository:** `https://github.com/SplattedRabbit/TheCombatant.git`
* **Aktueller Branch:** `refactor/bilingual-cleanup` (Up-to-date mit Remote `origin/refactor/bilingual-cleanup`)
* **Letzter Commit:** `51ef826` (*"refactor: complete 100% RAW English standardization across data, engine, and UI"*)
* **Test-Suite:** 
  * 343 Node-Tests (`npm test`) $\rightarrow$ **343 / 343 bestanden (100% Pass)**
  * 41 Vitest UI-Tests (`npm run test:ui`) $\rightarrow$ **41 / 41 bestanden (100% Pass)**
* **TypeScript-Prüfung:** `npm run typecheck` (`tsc --noEmit`) $\rightarrow$ **0 Fehler**
* **Produktions-Build:** `npm run build` $\rightarrow$ **Erfolgreich (Code 0)**

---

## 🛠️ Detaillierte Dokumentation aller Änderungen & Übergaben

### 1. Feat-Datenbanken (`js/data/feats/**/*.js`)
* **Umfang:** Alle 12 Feat-Dateien über 3 Kategorien (*combat*, *general*, *magic*) und 4 Regelwerke (*phb*, *phb2*, *ca*, *cs*):
  - `combat/phb.js`, `combat/phb2.js`, `combat/ca.js`, `combat/cs.js`
  - `general/phb.js`, `general/phb2.js`, `general/ca.js`, `general/cs.js`
  - `magic/phb.js`, `magic/phb2.js`, `magic/ca.js`, `magic/cs.js`
* **Maßnahmen:**
  - `name`: Kanonischer englischer RAW-Name.
  - `nameEn`: Kanonischer englischer RAW-Name.
  - `nameDe`: Aus Kompatibilitätsgründen identisch auf den englischen RAW-Namen gesetzt (verhindert Brüche in älteren Abfragen und Unit-Tests).
  - `benefit` & `benefitRaw`: Kanonischer englischer RAW-Regeltext aus den offiziellen Büchern.
  - `benefitDe`: Identisch auf den englischen RAW-Text gesetzt.
  - `appEffect`: Präziser, standardisierter englischer Kurzeffekt für Tooltips und Schnellansichten.
  - **Umlaut-Scan:** 0 deutsche Umlaute im gesamten Feat-Verzeichnis.

### 2. Zauber-Kataloge (`data/spells-*.json`)
* **Umfang:** `spells-phb.json`, `spells-phb2.json`, `spells-ca.json`, `spells-cs.json`.
* **Maßnahmen:**
  - Alle Zaubereinträge besitzen `name: nameEn` und `nameDe: nameEn`.
  - Sämtliche 35 deutschen Buff-/Effekt-Quellen übersetzt:
    - `"Stärke des Stiers"` $\rightarrow$ `"Bull's Strength"`
    - `"Ausdauer des Bären"` $\rightarrow$ `"Bear's Endurance"`
    - `"Katzenhafte Anmut"` $\rightarrow$ `"Cat's Grace"`
    - `"Pracht des Adlers"` $\rightarrow$ `"Eagle's Splendor"`
    - `"Schläue des Fuchses"` $\rightarrow$ `"Fox's Cunning"`
    - `"Weisheit der Eule"` $\rightarrow$ `"Owl's Wisdom"`
    - `"Hast"` $\rightarrow$ `"Haste"`
    - `"Schild"` $\rightarrow$ `"Shield"`
    - `"Magische Rüstung"` $\rightarrow$ `"Mage Armor"`
    - etc.
  - **Effekt:** Sämtliche Angriffs- und Schadens-Breakdowns im Combatant-Sheet zeigen nun reine englische Bezeichnungen an.
  - **Umlaut-Scan:** 0 deutsche Umlaute im gesamten Zauberverzeichnis.

### 3. Engine & Daten-Definitionen (`js/rules/`, `js/state/`)
* **`js/rules/RulesData.js`:** Prestigeklassen auf kanonische englische Bezeichnungen standardisiert (*Mystic Theurge*, *Arcane Trickster*, *Dragon Disciple*, *Assassin*, *Shadowbane Inquisitor*).
* **`js/rules/RulesSpells.js`:** Zauber-Zulässigkeit, Fehlermeldungen und verbotene Schulen auf Englisch umgestellt (*"Not a Spellcaster"*, *"Cannot Learn Spell"*, *"Prohibited School"*).
* **`js/state/pc/PCFeatsSpells.js`:** Validierungsmeldungen beim Hinzufügen von Talenten und Skill-Tricks auf Englisch umgestellt.

### 4. UI-Komponenten & Dialoge (`src/components/`)
* **`src/components/dialogs/FeatScrollDialog.tsx` & `feats/FeatScrollParchment.tsx`:** Regex-Wörterbuch entfernt; Darstellung greift direkt auf englischen `appEffect` und `benefitRaw` zu.
* **`src/components/player/PCSpellCompendium.tsx`:** Deutsche Untertitel-Anzeige entfernt; saubere englische Suche und Domänen-Tag-Darstellung.
* **`src/components/player/PCSpellbookTab.tsx` & `PCSpellPreparation.tsx`:** Deutsche Untertitel entfernt; Zaubernamen, Slot-Header und Vorbereitungs-Logs auf Englisch.
* **`src/components/dialogs/SpellCreatorDialog.tsx`:** Eingabefeld für alternativen deutschen Namen entfernt; reines "Spell Name"-Feld.
* **`src/components/dialogs/SpellDetailsDialog.tsx` & `SpellScrollDialog.tsx`:** Deutsche Untertitel und Fallbacks entfernt.
* **`src/components/dialogs/SkillTrickDetailsDialog.tsx`:** Deutsche Titel- und Warnmeldungs-Fallbacks bereinigt.
* **`src/components/player/wizard/Step1RaceName.tsx`:** Gesinnungsauswahl auf reines kanonisches Englisch umgestellt (*Lawful*, *Neutral*, *Chaotic*, *Good*, *Neutral*, *Evil*).
* **`src/components/player/wizard/levelConfig/LevelHeaderAndStats.tsx`:** Dialoge für Prestigeklassen-Voraussetzungen und manuelle Bestätigungen auf Englisch übersetzt.
* **`src/components/player/wizard/SkillsTabContent.tsx`, `SkillTricksTabContent.tsx`, `levelConfig/FeatSlotsSidebar.tsx`, `Step4Review.tsx`:** Alle Filter- und Rendering-Fallbacks auf kanonische englische Felder ausgerichtet.
* **`src/components/player/print/pages/`:**
  - `PrintPage2SkillsFeatures.tsx`: Fertigkeiten, Talente, Skill Tricks und ACFs auf Englisch.
  - `PrintPage3EquipmentArmory.tsx`: Rüstungs- und Schildnamen auf Englisch.
  - `PrintPage4SpellsCompanion.tsx`: Vorbereitete, Zauberbuch- und gelernte Zauber auf Englisch.

### 5. Test-Suiten
* **`Tests/spell_eligibility_validation.test.js`:** Erwartungswerte von deutschen Strings auf englische Fehlermeldungen aktualisiert (*"Not a Spellcaster"*, *"Cannot Learn Spell"*, *"Prohibited School"*).
* **`Tests/build.test.js`:** Erfolgreich ausgeführt im Rahmen von `npm test`.

---

## 🔒 Abwärtskompatibilitäts-Garantie (Backward Compatibility)

1. **Vorhandene Speicherstände (`localStorage` & `Supabase`):**
   - Charaktere, die unter früheren Versionen mit `nameDe` oder alten Klassen-/Talent-IDs abgespeichert wurden, bleiben voll funktionsfähig.
   - Dual-Resolution im Sheet (`c.name || c.nameEn || c.nameDe`) fängt jede bestehende Datenstruktur ab.
   - Es wurden keine Primärschlüssel (`id`, `key`) gelöscht oder umbenannt.
2. **Import & Export:**
   - JSON-Charaktere können uneingeschränkt geladen werden. Neue Exporte erfolgen vollständig in standardisiertem RAW-Englisch.

---

## 💻 Nächste Schritte / Merge nach Main

Sobald gewünscht, kann dieser Branch direkt in `main` gemergt werden:

```bash
# 1. Sicherstellen, dass alles aktuell ist
git checkout refactor/bilingual-cleanup
git pull origin refactor/bilingual-cleanup

# 2. Main aktualisieren und zusammenführen
git checkout main
git pull origin main
git merge refactor/bilingual-cleanup --no-ff -m "merge: 100% RAW English standardization from refactor/bilingual-cleanup"

# 3. Tests auf Main verifizieren
npm test
npm run test:ui
npm run typecheck
npm run build

# 4. Nach Remote pushen
git push origin main
```
