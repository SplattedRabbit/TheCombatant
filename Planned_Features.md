# 🗺️ TheCombatant — Planned Features, Open Issues & Roadmap

Dieses Dokument ist die **zentrale Single Source of Truth** für alle offenen Bugs/Regellücken, geplanten Refactorings und zukünftigen Feature-Erweiterungen.  
*(Die vollständige Historie aller bereits abgeschlossenen Releases und behobenen Bugs 1–45 befindet sich in [docs/CHANGELOG.md](docs/CHANGELOG.md)).*

---

## 🐛 1. Offene Bugs & Mechanische Regellücken (D&D 3.5e RAW)

Alle früheren System-, Sync- und Klassen-Audits (Bugs #1–#33, #35, #37, #39–#45) sind behoben. Aktuell verbleiben nur noch **3 spezifische Punkte**:

### 🔮 1.1 Multiclass Spell-DC Attribut-Hijack & Spell Focus Anbindung (ehem. Bug #34)
- **Status:** ⬜ `Offen` | **Priorität:** `Hoch`
- **Betroffene Dateien:** `src/components/player/spells/PCCompactGrimoireView.tsx`, `src/components/player/spells/grimoire/GrimoireLevelGroup.tsx`
- **Problem:**
  1. **Multiclass Caster-Mod:** `PCCompactGrimoireView.tsx` ermittelt `casterMod` global anhand der ersten gefundenen Zauberklasse (`wizard` → INT, `cleric` → WIS, `sorcerer` → CHA). Bei Multiclass-Zauberern (z. B. Wizard/Cleric oder Paladin/Sorcerer) wird dadurch das Attribut der ersten Klasse auf alle Zauber im Grimoire erzwungen.
  2. **Fehlende Talent-Anbindung:** Die Talente `spell_focus` (+1 DC) und `greater_spell_focus` (+2 DC für die gewählte Zauberschule) sind in `js/data/feats/general/phb.js` angelegt, werden aber bei der DC-Berechnung (`10 + lvl + casterMod`) im Grimoire noch nicht addiert.
- **Geplante Lösung:** Caster-Attribut pro Zauber/Klasse auflösen und `spell_focus` / `greater_spell_focus` anhand der Zauberschule (`spell.school`) in die DC-Formel einrechnen.

### ⚔️ 1.2 Shadowbane Inquisitor: `Turn Undead` Level-Stacking (ehem. Bug #36)
- **Status:** ⬜ `Offen` | **Priorität:** `Mittel`
- **Betroffene Dateien:** `src/components/player/features/registry/cumulativeFeatures.ts`, `js/rules/classes/PaladinRules.js`, `js/state/pc/PCGeneral.js`
- **Problem:**
  - Gemäß *Complete Adventurer* S. 69 stacken Shadowbane-Inquisitor-Stufen mit Paladin-Stufen für *Turn Undead*.
  - Aktuell prüft `PaladinRules.js` nur `paladinLevel >= 4` und entfernt andernfalls `Turn Undead` aktiv aus `pc.dailyAbilities` (z. B. bei Paladin 3 / Inquisitor 5). Zudem fehlt das Stacking in `cumulativeFeatures.ts`.
- **Geplante Lösung:** Effektive Paladinstufe für *Turn Undead* als `paladinLevel + shadowbaneInquisitorLevel` berechnen und ab effektiver Stufe 4 freischalten.

### 🎭 1.3 Battle Trickster: Stufe-2 Bonus-Feat & kostenlose Bonus Skill Tricks (ehem. Bug #38)
- **Status:** ⬜ `Offen` | **Priorität:** `Mittel`
- **Betroffene Dateien:** `src/components/player/wizard/helpers.feats.ts`, `src/components/player/CharacterWizardDialog.tsx`, `src/components/player/levelup/levelUpSaveHelper.ts`, `js/rules/classes/BattleTricksterRules.js`
- **Problem:**
  1. **Stufe 2 Bonus Feat:** In `helpers.feats.ts` fehlt der Bonus-Talentslot für `battle_trickster` auf Klassenstufe 2 (*Fighter Bonus Feat* oder *Skill Trick Feat*, *Complete Scoundrel* S. 28).
  2. **Kostenlose Bonus Tricks (Stufe 1 & 3):** Im Wizard werden für jeden gewählten Skill Trick pauschal 2 Fertigkeitspunkte abgezogen und kein `{ isBonus: true }` Flag gesetzt, sodass die kostenlosen Klassen-Tricks Punkte kosten und gegen das Trick-Limit zählen.
  3. **Tricky Fighting Schwelle:** `BattleTricksterRules.js` gewährt *Tricky Fighting* (+1 Attack) bereits ab Stufe 2 statt RAW ab Stufe 3.

---

## 🧹 2. Geplante Refactorings & Technische Schulden

### 🔤 2.1 Vereinheitlichung auf rein englische Entity-Modelle (Legacy Cleanup)
- **Status:** 🟨 `Teilweise umgesetzt (~20 % erledigt)` | **Priorität:** `Hoch` | **Aufwand:** 🟡 Mittel (~1–2 Tage)
- **Bereits umgesetzt:**
  - Alle Angriffs- und Schadens-Breakdowns (`AttackEngine.js`, `SequenceBuilder.js`, `ModifierCalculator.js`, `AttackContext.js`) sind komplett auf Englisch umgestellt.
  - Englische Save-Felder (`fort`, `will`, `baseFort`, `baseWill`) werden bei der Hydrierung unterstützt.
- **Noch offen:**
  - Bereinigung der verbleibenden zweisprachigen Felder (`nameDe`, `nameEn`, `benefitDe`) in `data/spells-*.json`, `js/data/feats/**/*.js`, `js/data/skillTricks-data.js`, `js/data/armor-data.js`, `js/data/skills-data.js`, `js/models/Weapon.js` und `js/rules/data/classes.js` auf kanonische englische Felder (`id`, `name`, `benefit`, `description`).
  - Entfernung von Fallback-Ketten (`item.nameEn || item.nameDe || item.name`) in den React-Komponenten und `src/types/combat.ts` sowie restlicher deutscher UI-Strings (z. B. in `DMToolbox.tsx`, `AddCombatantForm.tsx`, `BuffRules.js`).
  - Migrationslayer in `CombatState.importPC()` für Abwärtskompatibilität alter Charakter-JSON-Exporte.

### ⚛️ 2.2 Reduzierung von Props-Drilling über `PCContext` (ehem. WP9d Teil 2)
- **Status:** 🟨 `Teilweise umgesetzt (Tab-Reorganisation zu 100 % erledigt)` | **Priorität:** `Niedrig` | **Aufwand:** 🟢 Gering
- **Bereits umgesetzt:**
  - Alle ~20 Spieler-Tab-Komponenten in `src/components/player/` wurden vollständig in thematische Domain-Unterordner (`armory/`, `attributes/`, `buffs/`, `companion/`, `defenses/`, `feats/`, `features/`, `levelup/`, `offense/`, `print/`, `roster/`, `skills/`, `spells/`, `wizard/`) strukturiert.
  - `src/context/PCContext.tsx` ist angelegt.
- **Noch offen:**
  - Schrittweiser Ersatz von tiefem Props-Drilling (`pc`, `onUpdate`) durch direkten `usePC()`-Konsum in tief verschachtelten Subkomponenten sowie gezieltes `React.memo` bei teuren Listen-Komponenten.

---

## 📋 3. Feature-Backlog (Geplante Erweiterungen)

### 🎒 3.1 Gruppen-Loot & Münz-Verteilung (Erweiterung des DM Stash)
- **Status:** 🟩 `Großteils umgesetzt (~90 %)` | **Zielgruppe:** DM & Spieler
- **Bereits umgesetzt:**
  - **DM Stash & Loot Vault:** Vollständige Verwaltung von Waffen, Rüstungen und Wondrous Items im DM-Screen (`DMStashTab.tsx`, `js/state/DMStash.js`).
  - **1-Klick-Zuweisung & Loot Reveal:** Direkte Vergabe an Spieler (`DistributeItemModal.tsx` via `item_gift` Realtime-Broadcast) inklusive animierter Schatztruhen-Enthüllung (`LootRevealModal.tsx`).
  - **Inventar- & Loadout-Pakete (`dnd35e-inventory-package`):** Export und Import von Ausrüstungspaketen (.json) für DM-Stash und Spielercharaktere mit atomarer Transaktion, D&D 3.5e RAW Slot-Auto-Equip und automatischer Neuberechnung aller Werte (`PCInventoryPackage.js`, `ImportInventoryPackageModal.tsx`, `ArmoryTab.tsx`, `DMStashTab.tsx`).
- **Noch offen:**
  - **Münz-Verteilung:** Übergabe von Platin-, Gold-, Silber- und Kupfermünzen (`pp`, `gp`, `sp`, `cp`) aus dem DM Stash direkt an einzelne Spieler oder gleichmäßig aufgeteilt an die Gruppe.
  - **Geteilte Gruppen-Beutetruhe:** Sichtbarkeit nicht zugewiesener Gruppen-Beute für Spieler zum eigenständigen Beanspruchen („Claim").

### 🐾 3.2 Erweiterter Begleiter-, Vertrauten- & Reittier-Assistent
- **Status:** 🟨 `Teilweise umgesetzt (~65 %)` | **Zielgruppe:** Druiden, Waldläufer, Magier, Hexenmeister, Paladine
- **Bereits umgesetzt:**
  - **2-Spalten-Dashboards & Print-Bogen:** `CompanionSheet.tsx` und `FamiliarSheet.tsx` sowie Seite 4 des A4-Print-Folios.
  - **RAW-Skalierungs-Engine & Regel-Popups:** Automatische Berechnung von Bonus-HD, Natural Armor, STR/DEX, Master-Saves und Spezialfähigkeiten (`CompanionRules.js`, `FamiliarRules.js`, `CompanionAbilityDetailsDialog.tsx`).
- **Noch offen:**
  - **Paladin Special Mount:** Unterstützung für das besondere Reittier des Paladins ab Stufe 5 (PHB S. 44).
  - **Erweiterte Tierauswahl & individuelle Progression:** Zusätzliche Tierarten über Wolf/Leopard/Braunbär hinaus sowie manuelle Auswahl von Begleiter-Talenten, Fertigkeiten und Bonus-Tricks bei Bonus-HD-Anstiegen.

### 📜 3.3 Homebrew & Custom Content Creator (Talente & Klassen)
- **Status:** 🟨 `Teilweise umgesetzt (~50 %)` | **Zielgruppe:** Spieler & DM
- **Bereits umgesetzt:**
  - **Eigene Zauber:** `SpellCreatorDialog.tsx` (`pc.customSpells`).
  - **Eigene Waffen, Rüstungen & Magische Gegenstände:** `WeaponEditorModal.tsx`, `ArmorEditorModal.tsx`, `ItemEditorModal.tsx` (mit freien Effekt-Modifikatoren).
- **Noch offen:**
  - In-App-Editoren für **eigene Talente (Custom Feats)** und **eigene Klassen (Custom Classes)** sowie ein dedizierter Export/Import für Homebrew-Pakete.

### 📚 3.4 Dynamische Regelwerk-Auswahl pro Charakter / Kampagne
- **Status:** ⬜ `Offen (aktuell nur lokale Source-Filter-Pills)` | **Priorität:** `Mittel` | **Aufwand:** 🔴 Hoch (~3–5 Tage)
- **Bereits vorhanden:** Lokale `sourceFilter`-Pills (`phb`, `phb2`, `ca`, `cs`, `dmg`) in `CompendiumFeatsList.tsx`, `PCSpellCompendium.tsx`, `ClassSelector.tsx` und `Step1ClassAndStats.tsx`.
- **Geplanter Ausbau:**
  - Globaler `RulebookContext` bzw. Speicherung erlaubter Quellen in `pc.settings.allowedSources` (oder kampagnenweit durch den DM).
  - Konsequente Filterung aller Registries (`CLASSES_LIST`, `FEATS_LIST`, Zauber-JSONs, `SKILLS_DATA`, `ACFS`) anhand der freigeschalteten Regelwerke im Charakter-Wizard, Level-Up und Sheet.

### ⚔️ 3.5 Encounter Builder & Herausforderungsgrad (CR)-Rechner
- **Status:** ⬜ `Offen` | **Zielgruppe:** DM
- **Beschreibung:**
  - Werkzeug zur schnellen Zusammenstellung von Begegnungen basierend auf Gruppengröße und durchschnittlicher Gruppenstufe (APL).
  - Automatische Berechnung des effektiven Encounter-Levels (EL) und der XP-Vergabe nach D&D 3.5e DMG-Tabellen.

### 📜 3.6 Realtime Combat Event Log (Tabletop-First)
- **Status:** ⬜ `Offen` | **Zielgruppe:** Spieler & DM
- **Beschreibung:**
  - *Hinweis zum Tabletop-First-Prinzip:* Da in der App bewusst **keine digitalen Zufallswürfelbots** verwendet werden (physisches Würfeln am Tisch), wird kein digitaler Würfel-Log benötigt.
  - Optionaler, schlanker **Kampf-Ereignis-Ticker**: Chronologische Anzeige von Runden-/Zugwechseln, gewirkten Zaubern/Buffs, aktivierten Klassenfähigkeiten (z. B. *Smite*, *Rage*) und HP-Änderungen.

---

## ✅ 4. Zuletzt Abgeschlossene Meilensteine (Kurzübersicht)

*(Details siehe [docs/CHANGELOG.md](docs/CHANGELOG.md))*
- **Post-v6.9.3 Stabilisierung & Modularisierung:** Behebung der Audit-Bugs #10–#31, #35, #37, #39–#45 (`isFinessable`-Trennung, separate Smite-Slots, Multiplayer-Sync-Härtung mit Entity-ID-Diffs & Smart-Merge, Entfernung aller digitalen Würfelbots zugunsten reiner Formelanzeigen, Modularisierung von `ClassCombatAbilitiesCard.tsx` und `featPrerequisites.js`).
- **v6.9.3:** Gleichzeitiges Tragen von Rüstung & Schild (`isShieldItem`), 4. ARPG Tactical Slot (Body Armor), Shield Bash, symmetrisches 5-Zonen-Grid, Sticky Action Toasts.
- **v6.9.2:** Theatrical Loot Reveal Animation (`LootRevealModal.tsx`), Safe Character Import, Session Join Sync per Invite-Code.
- **v6.9.1:** Wizard RAW Per-Level Zauberbuch-Caps (`wizardBudget.ts`) & Assassin Spells Known Tabelle.
- **v6.9.0:** Inline Zauberauswahl im Charakter-Wizard (`Step3SpellSelectionView.tsx`) & Wizard-Schul-Spezialisierung.
- **v6.8.0:** Vollständige RAW-Klassenimplementierungen für Spellwarp Sniper, Ninja, Dragon Shaman und Battle Trickster + Level-Up Spell Wizard.
- **v6.7.0:** Modulare Unified-Class-Features-Registry & klickbare Begleiter-Regel-Popups.
- **v6.2.0:** Druckbarer 4-Seiten A4 Charakterbogen (`PrintableCharacterSheetModal.tsx`).
- **v6.1.0:** Geführter 4-Schritte In-Game Level-Up-Assistent (`LevelUpDialog.tsx`).
