# Übergabe & Systemstatus (Branch `feature/spell_selection_wizard`) — The Combatant

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
2. Spell Selection im Level-Up Wizard & D&D 3.5e RAW Quota Engine:
   - Dynamischer Schritt 4 (`🔮 Spells`) für Zauberwirker (`StepSpells.tsx`, `LevelUpDialog.tsx`). Nicht-Zauberwirker verbleiben schlank bei 4 Schritten.
   - RAW-Quota-Berechnung (`levelUpSpellRules.ts`):
     * Wizard / Spellbook: 2 freie Zauber bis maximal verfügbarer Zaubergrad.
     * Spontane Caster (Sorcerer, Bard): Exakter Abgleich neuer Spells Known laut Tabellen.
     * Divine / Full-List (Cleric, Druid, Paladin, Ranger): Infobanner über neu freigeschaltete Zaubergrade.
     * Prestige-Klassen-Verlinkung: Nahtlose Fortführung über `prestigeSpellLinks` (z. B. Spellwarp Sniper -> Wizard).
   - Spell-Picker mit persistentem Auswahl-Tray, Sofortsuche, Grad- & Schulenfiltern, Zähler-Badge und RAW Rules Inspector Drawer.
3. Spells Tab Redesign (High-Density 2-Spalten-Grimoire & Modularisierung):
   - `PCSpellsHeaderBar.tsx`: Schlanke ~26px Statuszeile mit Spezialisierungspille, transparenter ASF-Pill (nur sichtbar bei ASF > 0%) und Daily Reset.
   - Linke Spalte `⚔️ Active Grimoire` (`PCCompactGrimoireView.tsx` & `grimoire/`):
     * `GrimoireTemplateMenu.tsx`: Kompaktes Popover für Tages-Templates.
     * `GrimoireLevelGroup.tsx`: Grad-Subheader mit Save DC & Slotzähler.
     * `GrimoireSpellRow.tsx`: ~22px Zeilen mit Stufe, Name, Schule, Reichweite, DC, Spezialist (`⭐ Spec`) und `[⚡ Cast]` + `[✕]`.
     * `GrimoireEmptySlotRow.tsx`: Gestrichelte Inline-Zeile für freie Slots (`+ Prepare Spell`).
     * `GrimoireSpentSpells.tsx`: Durchgestrichene Badges verbrauchter Zauber mit `[↺]`.
     * `grimoireActions.ts`: Kapselung von Zauberwirken, Slot-Abzug, Metamagie und Vorbereitung.
   - Rechte Spalte `📖 Spell Library & Compendium` (`PCSpellLibraryPanel.tsx` & `SpellLibraryList.tsx`):
     * Tab-Umschaltung `[📖 Spell Library (X)]` und `[📚 Compendium]`.
     * Gelerntes Zauberbuch mit Echtzeitsuche, Grad-Filtern und 1-Klick `[+ Prepare]`-Zuweisung in freie Slots links.
4. Test- & Build-Status:
   - 350 Node-Tests (`npm test`) → 100% bestanden (0 Fehler).
   - 47 Vitest UI-Tests (`npm run test:ui`) → 100% bestanden (0 Fehler).
   - TypeScript (`npm run typecheck`) → 0 Fehler.
   - Produktions-Build (`npm run build`) → erfolgreich generiert (Code 0).
   - Branch: `feature/spell_selection_wizard` ist sauber eingecheckt und synchron.
```

---

## 📋 Systemstatus & Git-Metadaten

* **Repository:** `https://github.com/SplattedRabbit/TheCombatant.git`
* **Aktueller Branch:** `feature/spell_selection_wizard`
* **Test-Suite:** 
  * 350 Node-Tests (`npm test`) $\rightarrow$ **350 / 350 bestanden (100% Pass)**
  * 47 Vitest UI-Tests (`npm run test:ui`) $\rightarrow$ **47 / 47 bestanden (100% Pass)**
* **TypeScript-Prüfung:** `tsc --noEmit` $\rightarrow$ **0 Fehler**
* **Produktions-Build:** `npm run build` $\rightarrow$ **Erfolgreich (Code 0)**
