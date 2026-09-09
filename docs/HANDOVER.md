# Übergabe & Systemstatus (`feature/spell_selection_wizard`) — The Combatant

## 🚀 Copy-Paste Prompt für den neuen Rechner / neuen Chat

```markdown
Wir setzen die Entwicklung von The Combatant auf Basis von Branch `feature/spell_selection_wizard` fort.

Zuletzt abgeschlossen:
1. Full-Page Inline Spell-Selection im Character Creation Wizard:
   - Kein Popup, kein Modal: Zauberauswahl für Zauberklassen (Wizard, Sorcerer, Bard, Duskblade) erfolgt als vollwertige Zwischenseite direkt im Wizard-Fenster (`Step3SpellSelectionView.tsx`).
   - Dynamischer Übergangs-Button: Statt "Level N+1" zeigt der Wizard-Footer bei Caster-Stufen "Select Spells for Level N →", öffnet die Zauberauswahl für diese Stufe und führt danach weiter zu Level N+1 (oder Review).
   - Wizard-Spezialisierung & Verbotene Schulen: Auf Stufe 1 wählt der Magier seine Schule (Universalist vs. Spezialist) und verbotene Schulen (1 für Erkenntniszauber/Divination, 2 für alle anderen Schulen). Verbotene Schulen werden live im Zauberkompendium gesperrt.
   - 100% Wiederverwendung von `PCSpellCompendium.tsx`: Volle Quellenfilter (PHB, PHB2, CA, CS), Suchfeld, Zauber-Detail-Dialoge und Quoten-Zähler.
   - D&D 3.5e RAW Quoten & Speicherung: Automatische Erfassung aller Grad-0-Cantrips für Magier 1, Quotenberechnung (z. B. Magier 1: 3 + INT-Modifikator Grad 1 Zauber), Speicherung in `freshPC.learnedSpells` und Übergabe an `freshPC.wizardSpecialization`, `wizardProhibited1`, `wizardProhibited2`.
2. Test- & Build-Status:
   - 350 Node-Tests (`npm test`) → 100% bestanden (0 Fehler).
   - 41 Vitest UI-Tests (`npm run test:ui`) → 100% bestanden (0 Fehler).
   - TypeScript (`tsc --noEmit`) → 0 Fehler.
   - Produktions-Build (`npm run build`) → erfolgreich generiert (Code 0).
   - Branch: `feature/spell_selection_wizard` ist sauber eingecheckt und synchron.
```

---

## 📋 Systemstatus & Git-Metadaten

* **Repository:** `https://github.com/SplattedRabbit/TheCombatant.git`
* **Aktueller Branch:** `feature/spell_selection_wizard`
* **Test-Suite:** 
  * 350 Node-Tests (`npm test`) $\rightarrow$ **350 / 350 bestanden (100% Pass)**
  * 41 Vitest UI-Tests (`npm run test:ui`) $\rightarrow$ **41 / 41 bestanden (100% Pass)**
* **TypeScript-Prüfung:** `tsc --noEmit` $\rightarrow$ **0 Fehler**
* **Produktions-Build:** `npm run build` $\rightarrow$ **Erfolgreich (Code 0)**

---

## 🛠️ Detaillierte Dokumentation aller Neuerungen & Architektur (`feature/spell_selection_wizard`)

### 1. Zero-Popup Inline View Architektur (`src/components/player/wizard/`)
* **`CharacterWizardDialog.tsx`:**
  - Interner Zustand `levelSubView: 'config' | 'spells'` steuert innerhalb von Schritt 3 nahtlos zwischen Stufenkonfiguration und Zauberauswahl.
  - Der Footer-Button wechselt dynamisch:
    - Normal / Nicht-Zauberer: `Level N+1 →`
    - Zauberer auf Stufe $N$ (`levelSubView = 'config'`): `Select Spells for Level N →`
    - Zauberer in Zauberansicht (`levelSubView = 'spells'`): `Level N+1 →` (oder `Review (Step 4) →` auf der Maximalstufe).
  - Volle Unterstützung für Vor- und Zurück-Navigation zwischen Stufen und Zauberseiten.

### 2. Zauberkompendium & Quoten-Engine (`src/components/player/wizard/spells/`)
* **`spellSelectionRules.ts`:**
  - Berechnet nach D&D 3.5e RAW die erlaubte Zauberanzahl für jede Stufe (z. B. Wizard 1: 3 + INT-Mod Grad-1 Zauber, Sorcerer/Bard Tabellen für Spells Known, Duskblade).
  - Definiert Klassen mit Zauberauswahl (`hasSpellSelection`) und automatischen Grad-0-Cantrip-Vergaben.
* **`Step3SpellSelectionView.tsx`:**
  - Linke Spalte: Ausgewählte Zauber für die aktuelle Stufe, Quoten-Balken, Schnell-Lösch-Buttons (`✕`), Cantrip-Hinweisbanner.
  - Rechte Spalte: Vollständig eingebundenes [`PCSpellCompendium.tsx`](file:///c:/Users/styles/PRIVATE/TheCombatant/TheCombatant/src/components/player/PCSpellCompendium.tsx) mit Suchfilter, Quellenfiltern (PHB, PHB2, CA, CS), Detail-Popups und Blockade verbotener Magieschulen.
* **`LevelHeaderAndStats.tsx`:**
  - Magier-Spezialisierungskarte auf Stufe 1 für Schule (Universalist oder Spezialschule) und verbotene Schulen (1 für Divination, 2 für andere Spezialisierungen).

### 3. Persistenz & Review (`wizardSaveHelper.ts`, `Step4Review.tsx`)
* **`wizardSaveHelper.ts`:**
  - Sammelt alle in Schritt 3 ausgewählten Zauber aus allen Stufen.
  - Fügt bei Magiern automatisch alle Grad-0-Cantrips (außer verbotenen Schulen) zu `freshPC.learnedSpells` hinzu.
  - Speichert `freshPC.wizardSpecialization`, `freshPC.wizardProhibited1` und `freshPC.wizardProhibited2`.
* **`Step4Review.tsx`:**
  - Zeigt im abschließenden Review-Schritt die gewählte Schule, die verbotenen Schulen und eine Übersicht aller ausgewählten Zauber.

---

## 🔒 Abwärtskompatibilitäts-Garantie (Backward Compatibility)

1. **Nicht-Zauberer-Klassen:**
   - Klassen ohne Zauberauswahl (Fighter, Rogue, Barbarian, etc.) behalten den gewohnten direkten Level-zu-Level-Flow ohne Zwischenschritt.
2. **Bestehende Charaktere & Speicherstände:**
   - Alle bestehenden Charaktere in `localStorage` und JSON-Dateien laden weiterhin 100% abwärtskompatibel.
