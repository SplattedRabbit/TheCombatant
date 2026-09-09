# Übergabe & Systemstatus (v6.8.0 / Branch `feature/spell_selection_wizard`) — The Combatant

## 🚀 Copy-Paste Prompt für den neuen Rechner / neuen Chat

```markdown
Wir setzen die Entwicklung von The Combatant auf Basis von Branch `feature/spell_selection_wizard` (Version v6.8.0 / aktueller Stand) fort.

Zuletzt abgeschlossen:
1. Spell Selection im Level-Up Wizard & D&D 3.5e RAW Quota Engine:
   - Dynamischer Schritt 4 (`🔮 Spells`) für Zauberwirker (`StepSpells.tsx`, `LevelUpDialog.tsx`). Nicht-Zauberwirker verbleiben schlank bei 4 Schritten.
   - RAW-Quota-Berechnung (`levelUpSpellRules.ts`):
     * Wizard / Spellbook: 2 freie Zauber bis maximal verfügbarer Zaubergrad.
     * Spontane Caster (Sorcerer, Bard): Exakter Abgleich neuer Spells Known laut Tabellen.
     * Divine / Full-List (Cleric, Druid, Paladin, Ranger): Infobanner über neu freigeschaltete Zaubergrade.
     * Prestige-Klassen-Verlinkung: Nahtlose Fortführung über `prestigeSpellLinks` (z. B. Spellwarp Sniper -> Wizard).
   - Spell-Picker mit persistentem Auswahl-Tray, Sofortsuche, Grad- & Schulenfiltern, Zähler-Badge und RAW Rules Inspector Drawer.
   - Validation-Guard vor dem Review-Schritt und automatische Speicherung in `pc.learnedSpells` + `pc.spellSlots`.
2. Wizard Arcane School Specialization & Prohibited Schools:
   - `WizardSpecializationDialog.tsx` für die RAW 3.5e Schulwahl (Universalist, Diviner mit 1 Bannschule, alle anderen Spezialisten mit 2 Bannschulen).
   - Class & Companion Features Tab (`PCFeaturesTab.tsx`): Spezialschule steht IMMER an oberster Stelle und hebt sich dezent ab (Akademie-Badge, Pergament-Gradient, feine rote Akzentlinie). Klick öffnet RAW Inspector mit Konfigurations-Button.
3. Spells Tab Redesign (High-Density 2-Spalten-Grimoire & Modularisierung):
   - `PCSpellsHeaderBar.tsx`: Schlanke ~26px Statuszeile mit Spezialisierungspille, transparenter ASF-Pill (nur sichtbar bei ASF > 0%) und Daily Reset.
   - Linke Spalte `⚔️ Active Grimoire` (`PCCompactGrimoireView.tsx` & `grimoire/`):
     * `GrimoireTemplateMenu.tsx`: Kompaktes Popover für Tages-Templates (blickdicht auf `var(--p)` mit hohem Z-Index).
     * `GrimoireLevelGroup.tsx`: Grad-Subheader mit Save DC & Slotzähler.
     * `GrimoireSpellRow.tsx`: ~22px Zeilen mit Stufe, Name, Schule, Reichweite, DC, Spezialist (`⭐ Spec`) und `[⚡ Cast]` + `[✕]`.
     * `GrimoireEmptySlotRow.tsx`: Gestrichelte Inline-Zeile für freie Slots (`+ Prepare Spell`).
     * `GrimoireSpentSpells.tsx`: Durchgestrichene Badges verbrauchter Zauber mit `[↺]`.
     * `grimoireActions.ts`: Kapselung von Zauberwirken, Slot-Abzug, Metamagie und Vorbereitung.
   - Rechte Spalte `📖 Spell Library & Compendium` (`PCSpellLibraryPanel.tsx` & `SpellLibraryList.tsx`):
     * Tab-Umschaltung `[📖 Spell Library (X)]` und `[📚 Compendium]`.
     * Gelerntes Zauberbuch mit Echtzeitsuche, Grad-Filtern und 1-Klick `[+ Prepare]`-Zuweisung in freie Slots links.
     * Vollbild-Button entfernt; konsistente 2-Spalten-Struktur beibehalten.
     * Alle weißen Hintergründe durch authentische Pergament-Farben (`rgba(200, 169, 110, ...)`) ersetzt.
   - Strikte Modularisierung: Alle Grimoire-Dateien unter 300 Zeilen (Clean Code & Single Responsibility).
   - Bugfix Spell Failure: `spellFailureHelper.ts` für itemisierte Berechnung; `spellFailureOverride: 0` für Mithral Twilight Chain Shirt +1 in Demodaten.
4. Bugfix: Blickdichte Dropdown-Hintergründe & CSS-Aliasse:
   - `--parchment` und `--pf` in `css/main.css` global auf `--p: #f4e8c1` registriert.
   - Dropdowns in `UserMenu.tsx`, `GrimoireTemplateMenu.tsx` und `TablePresenceBar.tsx` auf solide Hintergründe und `box-shadow` umgestellt (kein Durchscheinen mehr).
5. Bugfix: Historical Skill Ranks Halving im Level-Up Assistant:
   - Behoben, dass historische Skill-Ränge in Level 1 durch Cross-Class-Regeln halbiert wurden (`helpers.ts`, `levelUpAdapter.ts`), wodurch z. B. der Spellwarp Sniper fälschlicherweise blockiert wurde.
6. Test- & Build-Status:
   - 350 Node-Tests (`npm test`) in 24 Suites → 100% bestanden (0 Fehler).
   - 47 Vitest UI-Tests (`npm run test:ui`) in 7 Suites → 100% bestanden (0 Fehler).
   - TypeScript (`npm run typecheck`) → 0 Fehler.
```

---

## 📋 Systemstatus & Git-Metadaten

* **Repository:** `https://github.com/SplattedRabbit/TheCombatant.git`
* **Aktueller Branch:** `feature/spell_selection_wizard`
* **Test-Suite:** 
  * 350 Node-Tests (`npm test`) $\rightarrow$ **350 / 350 bestanden (100% Pass)**
  * 47 Vitest UI-Tests (`npm run test:ui`) $\rightarrow$ **47 / 47 bestanden (100% Pass)**
* **TypeScript-Prüfung:** `npm run typecheck` (`tsc --noEmit`) $\rightarrow$ **0 Fehler**

---

## 🛠️ Detaillierte Dokumentation aller Neuerungen & Architektur (v6.6.0)

### 1. Class & Companion Features Tab (`src/components/player/features/`)
* **`QuickCombatDashboard.tsx`:**
  - Platziert am oberen Rand des Features-Tabs für schnelle Kampfaktionen ohne Scrollen.
  - Verwendet klickbare Pips für limitierte Tagesressourcen:
    - *Smite Evil / Smite Corrupt:* `⚡ 2/3 übrig` (Klick verbraucht/stellt wieder her).
    - *Lay on Hands:* Dynamischer HP-Pool mit `-` und `+` Buttons (`18 / 24 HP`).
    - *Turn Undead:* Heilige Sonnen-Pips (`☀️ 3/4 übrig`).
    - *Barbarian Rage & Bardic Music:* Tageszähler werden nur eingeblendet, wenn die Klasse aktiv ist.
* **`FeaturesFilterBar.tsx`:**
  - Echtzeit-Suchfeld filtert über Name, Herkunft, Zusammenfassung und RAW-Regeltext.
  - Filter-Pills mit dynamischen Zählern: `[📜 All]`, `[⚔️ Combat / Active]`, `[⏳ Daily Resources]`, `[🛡️ Passives]`, `[✨ Auras]`, `[🔮 Spell-like]`.
* **`featureRegistry.ts` & `UnifiedFeatureCard.tsx`:**
  - Vereinheitlichte Datenstruktur `UnifiedFeature` für alle Klassen- und Rassenfähigkeiten.
  - Automatisches Merging kumulativer Boni:
    - *Sneak Attack:* Fasst z. B. Rogue Lv.5 (+3d6) und Shadowbane Inquisitor Lv.4 (+2d6) zu einer gemeinsamen Karte `Sneak Attack +5d6` zusammen.
    - *Turn Undead:* Addiert effektive Kleriker- und Paladinstufen sowie Verwendungen.
  - Warme Pergament-Optik mit Herkunfts-Badge (`Rogue 5`, `Paladin 3`), Kategorie-Badge und kompakter Zusammenfassung.
* **`RulesInspectorDrawer.tsx`:**
  - Rechte Spalte fungiert als Detail-Inspektor für RAW-Regeln.
  - Zeigt Aktionsaufwand (*Swift Action*, *Standard Action*, *Passive*), Reichweite, Dauer, Stacking-Quellen und den vollständigen D&D 3.5e Regeltext.
* **`CompanionMiniStatusWidget.tsx` & `PCCompanionWrapper.tsx`:**
  - Bei Charakteren mit Begleiter (Animal Companion, Paladin Mount, Familiar) wird rechts dauerhaft ein Mini-Status-Widget angezeigt (HP-Balken, RK, Direktangriffe).
  - Ein Klick auf `[Full Sheet ↗]` oder die Kopf-Sub-Tabs wechselt nahtlos auf den vollwertigen Begleiterbogen.

### 2. Demo-Charakter: Battle Trickster Level 13 (`js/data/encounter-samples.js`)
* **Name:** *Kaelen Swiftblade* (Human, Chaotic Good).
* **Klassen:** Fighter 6 / Rogue 4 / Battle Trickster 3.
* **Kampfwerte:**
  - BAB: +11 / +6 / +1 (3 iterative Angriffe mit *+2 Keen Rapier* [15–20/x2] und *+1 Shortsword*).
  - RK: 24, Berührung 17, Auf falschem Fuß 19.
  - Prestigefeatures: *Tricky Fighting* (+1 Schaden bei Skill Tricks oder Flankieren/Flat-Footed), *Bonus Tricks*, *Bonus Feat*.
  - Skill Tricks ausgerüstet: *Acrobatic Backstab*, *Spot the Weak Point*, *Nimble Stand*, *Sudden Draw*.
  - Auswahldialog: Direkt im Menü unter **"📋 Sample Data"** wählbar.

### 3. Wizard Stichwortsuche-Audit (`src/components/player/wizard/`)
* **Feats-Tab:** Sucht in Namen (`nameDe`, `nameEn`) und Regeltext/Nutzen (`benefitDe`, `benefitRaw`).
* **ACFs-Tab:** Sucht in Namen, Regeltext (`description`) und ersetztem Feature (`replaces`).
* **Skill Tricks-Tab:** Sucht in Namen und Regelnutzen (`benefit`, `description`).
* **Skills-Tab:** Sucht in Skill-Namen.

---

## 🔒 Abwärtskompatibilitäts-Garantie (Backward Compatibility)

1. **Vorhandene Speicherstände (`localStorage` & `Supabase`):**
   - Bestehende Charaktere laden die neuen Feature-Karten und Dashboards automatisch ohne Konvertierung.
   - Fehlende Begleiterdaten oder neue Tracking-Flags werden durch sichere Defaults (`pc.companion || null`) abgefedert.
2. **Import & Export:**
   - JSON-Charaktere bleiben zu 100% kompatibel.
