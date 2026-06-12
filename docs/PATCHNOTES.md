# D&D 3.5e Combat App: Versionshistorie & Patchnotes

Dieses Dokument enthält das chronologische Veröffentlichungsjournal und die Patchnotes der heute (31. Mai 2026) durchgeführten Erweiterungen, Refactorings und Feature-Updates.

---

| Version | Status | Datum | Hauptfokus |
| :--- | :---: | :---: | :--- |
| **v3.3.2** | Release | 12.06.2026 | D&D 3.5e RAW Buff- & Auren-Manager (Backend & UI) |
| **v3.3.1** | Release | 11.06.2026 | Behebung verbleibender Backlog-Bugs (Bugs #1 bis #18) & Bereinigung |
| **v3.3.0** | Release | 11.06.2026 | Druiden-Tiergestalt RAW Fixes, Modularisierung AttackEngine & Behebung Bug #17 |
| **v3.2.7** | Release | 11.06.2026 | D&D 3.5e Volks-Simulation, Stat-Mali Fix & PCResources.js Refactoring |
| **v3.2.6** | Release | 11.06.2026 | Monolith Refactoring: PCOffense.js Split in 7 UI-Subkomponenten |
| **v3.2.5** | Release | 10.06.2026 | Wild-Shape-Bugdokumentation, Cache-Bump, Serviceworker-Versionskonvention |
| **v3.2.4** | Release | 10.06.2026 | Waffen Zusatzschaden: Würfelanzahl + Schadensart via Dropdowns (extraDamageDice/extraDamageType), AttackEngine-Integration |
| **v3.2.3** | Release | 10.06.2026 | Magische Gegenstände: Multi-Effekte (effects[]-Array), Inline-„➕ Effekt"-Button, Legacy-Abwärtskompatibilität |
| **v3.2.2** | Release | 10.06.2026 | Neuer Tab „Magische Gegenstände" mit Slot-Boxen (11 Slots + Slotless) und synchronisiertem Rucksack |
| **v3.2.1** | Release | 10.06.2026 | Zwei-Waffen-Kampf & Doppelwaffen (D&D 3.5e RAW, Ranger-Armor Suspension, Kampfstab-Wahl, QoL) |

| **v3.1.5** | Release | 08.06.2026 | Systemmenü-Dropdown & Tablet-Optimierung (FAB-Entfernung, responsive Dropdowns) |
| **v3.1.0** | Release | 08.06.2026 | Clean Code Refactoring (Modularisierung, FE/BE-Trennung, app.js-Initialisierung) |
| **v3.0.0** | Release | 08.06.2026 | Auto-Scaling Stabilisierung, Härtung Talent-Voraussetzungen, Paladin "Untote vertreiben"-Support & Live-Initiative-Anzeige |
| **v2.9.1** | Release | 08.06.2026 | Zoom/Click-Area-Fix (150% DPI): `transform-origin: top center` + Width-Hack entfernt + ResizeObserver Scroll-Kompensation |
| **v2.9.0** | Release | 08.06.2026 | Bugtracking & QoL: Fokusverlust-Fix Talentsuche, Prerequisite-Validierung, Class-Bleed-Fix, Unified Roll-Breakdown Dialog, showInfoDialog-Basisfunktion |
| **v2.8.5** | Release | 08.06.2026, 11:00 | Zaubertemplates: Speichern, Löschen, Laden, Slot-Checks und erweiterter Tagesreset für vorbereitende Casters |
| **v2.8.0** | Release | 08.06.2026, 10:30 | Metamagie & Zaubervorbereitung: Vorbereitende vs. spontane Klassen, Metamagic-Checks & Slots-RAW |
| **v2.7.1** | Release | 08.06.2026, 10:15 | Tablet-First Refactoring: Touch-freundliche Regel-Buttons mit einheitlichen Pfeil- & Sprungsymbolen |
| **v2.7.0** | Release | 08.06.2026, 09:15 | Kampfmanöver & Schurken-Feinschliff: Defensive Fighting, Total Defense, Rogue Sneak Attack |
| **v2.6.1** | Release | 08.06.2026, 08:55 | Refactoring & Code-Modularisierung der AttackEngine (Clean Code, Single Responsibility) |
| **v2.6.0** | Release | 08.06.2026, 08:30 | Waffenkampf- & Angriffs-Update: Centralized Attack Sequencer, TWF, Kampfgetümmel (Combat Expertise), Smite/Erzfeind-Toggles & Passives |
| **v2.5.0** | Release | 07.06.2026, 16:25 | Waffensystem-Refactoring (Kategorie-Dropdowns, Autocomplete-Overrides via datalists, Improved Critical, RAW Bogen/Armbrust-Regeln) & Drawer-Persistenz-Bugfix |
| **v2.4.7** | Release | 04.06.2026, 15:30 | Bugfix: Spieler-Duplikate auf dem DM-Screen (In-place Beispieldaten, Full Sync bei Import, DM-Safeguards) |
| **v2.4.6** | Release | 04.06.2026, 12:45 | Zustände komplett entfernt & DM +Temp Support |
| **v2.4.5** | Release | 04.06.2026, 10:15 | Diablo-style HP Globe (Lebenspunkteblase, Fluid-Animationen, gothic Panel) |
| **v2.4.0** | Release | 03.06.2026, 16:30 | D&D 3.5e Fertigkeitensystem (Skills, Ränge-Limits, Synergien, Live-Suche & Würfel-Breakdowns) |
| **v2.3.0** | Release | 03.06.2026, 12:15 | Tabbed-Dashboard Layout (Overview-Grid, zweispaltige Gliederung, Slot-Kompaktierung) |
| **v2.2.0** | Release | 03.06.2026, 23:55 | Netzwerk-Sync v2.0 (Delta-Protokoll, relative HP-Events, MessageQueue, Focus-Schutz & Connection-Monitor) |
| **v2.1.2** | Release | 03.06.2026, 21:10 | Talente- & Feats-System (Talente-Registry, Voraussetzungen, Fighter-Highlighting, scrollable Parchments - Roadmap zu v3.0.0) |
| **v2.1.1** | Release | 03.06.2026, 20:10 | Bugfix-Release (Import-Kollision, AC/DEX Mod, TP/Init-Sync, Bardenmusik & Scrollbalken-Sprünge) |
| **v2.1.0** | Release | 03.06.2026, 19:30 | Release v2.1.0 "The Architect" (state.js Aufteilung, Event Bus Pub/Sub, Barbaren/Mönch Skalierungs-RAW, modularer Aufbau) |
| **v2.0.0** | Release | 03.06.2026, 16:10 | Major Release "The Combatant v2.0" (Hexenmeister-Vollendung, Vertrauenspartner-Bogen, Multiclass-Bleed-Schutz) |
| **v1.11.7** | Release | 03.06.2026, 14:40 | Waldläufer-Klassenfeatures Kampfstil-Auswahl, Wildes Mitgefühl & Tierbegleiter-Stufe (D&D 3.5 RAW) |
| **v1.11.6** | Release | 03.06.2026, 14:00 | Mönchs-Klassenfeatures & Schlaghagel-Berechnung (D&D 3.5 RAW) |
| **v1.11.5** | Release | 03.06.2026, 12:10 | Bardenmusik 2-Reihen Grid-Layout, Entfernung des Lieder-Scrollbalkens & Premium Bardenwissen Infobox |
| **v1.11.4** | Release | 03.06.2026, 11:55 | Custom Popups Zoom-Skalierung, "Fertig!" Bardenmusik & Bard UI Optimierungen |
| **v1.11.3** | Release | 03.06.2026, 11:40 | Barbar-Kampfrausch Aktivierungs-Sperre bei 0 Ladungen |
| **v1.11.2** | Release | 03.06.2026, 11:30 | Barbar-Kampfrausch Anzeige-Erweiterung (Immer sichtbare, übersichtliche Boni-Tabelle) |
| **v1.11.1** | Release | 03.06.2026, 11:15 | Magier-Bannschulen Automatisierung (Spezialisierungs-Dropdowns, Lern-Blockade & Auto-Bereinigung) |
| **v1.11.0** | Release | 03.06.2026, 10:15 | Paladin, Kleriker & Magier Classfeature-Refactoring (Göttliche Gnade, Hände auflegen, Untote vertreiben, Magierspezialisierung) |
| **v1.10.3** | Release | 02.06.2026, 18:20 | Clean-Architecture der täglichen Fähigkeiten, Premium-Wild-Shape-Popup & Zauber-Click-Fix |
| **v1.10.2** | Release | 02.06.2026, 16:05 | Event Delegation & Lokalisierungsresilienz für Druiden-Wild-Shape |
| **v1.10.1** | Release | 02.06.2026, 15:50 | "Local Storage bereinigen" Hard-Reset Button im Systemmenü |
| **v1.10.0** | Release | 02.06.2026, 15:45 | Robustere Thematische Emblems & Druiden-Polymorph-Engine (Wild Shape) |
| **v1.9.0** | Release | 02.06.2026, 15:25 | Clean-Architecture Refactoring, Tab-Dashboard & Tierbegleiter |
| **v1.8.0** | Release | 02.06.2026, 15:10 | RAW Bardenmusik-Kompendium & Interaktives Klassenpanel |
| **v1.7.4** | Release | 31.05.2026, 22:05 | Fehlerfreie, hochperformante Intro-Animation (HTML/SVG Hybrid) |
| **v1.7.3** | Release | 31.05.2026, 19:05 | Startseiten-Auswahl-Default auf Seiten-Reload |
| **v1.7.2** | Release | 31.05.2026, 19:02 | Entfernung der Inline-Zauberknöpfe für maximale Robustheit |
| **v1.7.1** | Release | 31.05.2026, 18:59 | Fehlerfreie PC-Referenzen & Redraw-Sicherheit |
| **v1.7.0** | Release | 31.05.2026, 18:50 | Robuster Spell-Search & Event-Propagation Fix (Sofortige Klicks) |
| **v1.6.0** | Release | 31.05.2026, 18:40 | RAW Stufe 0-9 Slots-Automatisierung & "Ein neuer Tag!" Reset |
| **v1.5.0** | Release | 31.05.2026, 17:30 | PDF-Zauberextraktion (404 Spells) & Scroll-Details Dialog |
| **v1.4.0** | Release | 31.05.2026, 16:15 | You-Died Persistenz, WebRTC Reconnect-Loop & Lazy-Loading |
| **v1.3.0** | Release | 31.05.2026, 14:45 | Geteiltes Ressourcen-Dashboard, Zauberbuch & Custom-Creator |
| **v1.2.0** | Release | 31.05.2026, 13:00 | 2-Spalten-Seitenlayout & Verteidigungs-Zusammenlegung |
| **v1.1.0** | Release | 31.05.2026, 11:30 | HP-Tracker Redesign & Kampf-Controller-Widget |
| **v1.0.0** | Release | Vorhistorisch | Ur-Version (DM-Screen, Initiative-Leiste, simple HP-Felder) |

### v3.3.2 — D&D 3.5e RAW Buff- & Auren-Manager (Release v3.3.2)

* **✨ Buff- & Auren-Manager (D&D 3.5e RAW):**
  - **Architektur & Berechnungs-Fundament:** Regelkonforme Stacking-Prüfung nach D&D 3.5e RAW (Boni desselben Typs stacken nicht, `dodge` und `untyped` stacken additiv).
  - **SpellModifierApplier:** Unterstützung für direkt definierte Custom-Buffs/Auren sowie automatische AC-Target-Auflösung (`acShield`, `acDodge`, etc.).
  - **AttackEngine-Integration:** Dynamische Auswertung aller Buff-Effekte für Angriffs- (`atk`) und Schadenswürfe (`dmg`) inklusive RAW-Stacking-Auflösung in `buildContext` und `ModifierCalculator`.
  - **Integriertes Dashboard-Subtab:** Das Buff-Management wurde als voll-integrierter Sub-Tab direkt im Panel "Verteidigung & Rettung" (`PCDefenses.js`) eingebaut, gestaltet im einheitlichen, edlen Design der Haupt-Tabs. Spieler können per Klick nahtlos zwischen ihren Rettungswürfen/RK und ihrer Buff-Verwaltung (inklusive der 10 Kern-Zauber-Schnellwahl und dem Custom-Buff-Ersteller) hin- und herwechseln.
* **🌐 Offline-Fähigkeit & Service-Worker:**
  - Cache-Erneuerung auf `v3.3.2-cache-v1`.

### v3.3.1 — Bugbacklog-Bereinigung & QoL (Release v3.3.1)

* **🐞 Bug-Backlog-Bereinigung (Bugs #1 bis #18):**
  - **Bug #1 (Regelerklärungen):** Neues UI-Feature-Modul `FighterFeatures` zur Erläuterung der Kämpfer-Bonus-Talente implementiert und registriert.
  - **Bug #3 (Talente-Tab):** Optische Höhenangleichung und Symmetrie-Fix für Suchfeld und Kategorien-Dropdown.
  - **Bug #5 (Schurke):** Globaler Sneak-Attack-Schalter im oberen Bereich der Kampfeinstellungen im Offense-Tab integriert.
  - **Bug #7 (Layout-Scrollen):** Begrenzende Höhen und Scrollbalken für Waffen-, Rüstungs- und Zauberbuchlisten eingeführt.
  - **Bug #9 (Main-/Offhand):** Einhändige Waffen können nun direkt an den Waffenslots zwischen Haupt- und Nebenhand gewechselt werden.
  - **Bug #10 (Klassenstufe):** Breite des Stufenauswahl-Dropdowns auf 44px vergrößert, um Abschneiden durch Popups-Styles zu verhindern.
  - **Bug #12 (Fertigkeits-Ränge):** Sicheres Speichern und Validierung von Rängen (inkl. Wert 0) im Ränge-Input.
  - **Bug #14 (Talente verlernen):** Propagation des Klicks gestoppt, um Endlosschleife im Dialog zu verhindern.

### v3.3.0 — Druiden-Tiergestalt RAW-Fixes, Modularisierung AttackEngine & Behebung Bug #17 (Release v3.3.0)

* **🐾 Druiden-Tiergestalt (Wild Shape RAW-Fixes):**
  - Physische Rassenmodifikatoren der Grundform werden in Tiergestalt nun regelkonform ignoriert.
  - Die angeborene natürliche Rüstung der Grundform wird in Tiergestalt nicht mehr addiert.
  - Der Größenmodifikator auf RK wurde zentralisiert, um doppelte Größen-AC-Boni (z. B. beim Gnom) zu verhindern.
* **⚔️ Modularisierung & Refactoring der `AttackEngine.js`:**
  - Aufteilung der ehemals ~799 Zeilen großen monolithischen Angriffs-Engine in 5 sauber entkoppelte Module unter `js/rules/attack/` (Context, Base Attacks, Modifiers, Damage Formulas, Sequence Builder).
  - Die Datei `AttackEngine.js` dient als leichtgewichtige Fassade (~80 Zeilen); die API-Kompatibilität bleibt zu 100 % erhalten.
* **🏹 Behebung von Bug #17 (Option-Fallbacks für Smite / Erzfeind / Sneak Attack):**
  - Implementierung sicherer Fallbacks in `buildContext`: Werden keine expliziten `options` mitgegeben (z. B. bei direkten Schadenswürfen via Klick auf den DMG-Button), greift die Engine vollautomatisch auf die persistenten Charakter-Einstellungen zurück.
* **🌐 Offline-Fähigkeit & Service-Worker:**
  - Registrierung aller neuen Dateien im Service Worker und Cache-Erneuerung auf `v3.3.0-cache-v1`.

### v3.2.7 — Volks-Simulation & PCResources-Refactoring (Release v3.2.7)

* **🧬 D&D 3.5e Volks-Simulation (Races):**
  - Vollwertige Simulation der Rassen/Völker (Zwerg, Elf, Gnom, Halbling, Halbork, Halbelf).
  - Rassenbedingte Attribute werden als `racial` Modifikatoren an den Stat-Instanzen verwaltet, wodurch alle abgeleiteten Werte (HP, Initiative, RK, Rettungswürfe, Skills) sich dynamisch und sofort im UI anpassen.
  - Größenmodifikatoren für kleine Völker (Gnome/Halblinge) gewähren automatisch +1 Größen-RK (Normal, Berührung, Flach) und +1 auf Angriffe.
  - Rettungswurf-Modifikatoren für Halblinge (+1 Volksbonus auf alle Rettungswürfe) integriert.
  - Zwergische Immunität gegen Bewegungsverlangsamung durch mittelschwere und schwere Rüstung implementiert.
  - Spezifische Volksboni für Fertigkeiten automatisch appliziert (z. B. Elf +2 Lauschen/Suchen/Entdecken).
  - Neues "Volksmerkmale"-Feature-Kärtchen im Klassenmerkmale-Tab zeigt alle aktiven Rassen-Sonderregeln.
* **🔧 Behebung der Stat-Mali-Berechnung (Stat.js):**
  - Korrektur eines kritischen Fehlers in `Stat.getValue()`, bei dem typisierte negative Modifikatoren (Mali) fälschlicherweise auf 0 geklammert wurden. Diese werden nun in `penaltiesSum` gesammelt und korrekt abgezogen (wichtig für die Rassen-Mali der Attribute).
  - Die Testsuite in `stat.test.js` wurde angepasst, um dieses regelkonforme Verhalten zu prüfen.
* **🎲 Abrundung bei klassenübergreifenden halben Rängen:**
  - In `SkillBaseCalculator.js` werden Ränge bei Modifikator-Berechnungen nun mit `Math.floor` abgerundet. Halbe Ränge (0,5) bei klassenübergreifenden Fertigkeiten (cross-class skills) verbessern den Fertigkeitswurf laut D&D 3.5e RAW erst dann, wenn sie zu einem vollen Rang aufgerundet wurden.
* **📦 Refactoring & Aufteilung von PCResources.js:**
  - Die 808 Zeilen große Monolith-Datei `PCResources.js` wurde gelöscht und modularisiert in:
    - `ClassFeaturesRegistry.js` (Gemeinsame Registry für Features)
    - `PCSpellsTab.js` (Einstiegspunkt & Zauberbuch-Struktur)
    - `PCSpellsTabHandlers.js` (Alle Interaktions- & Zauber-Event-Handler)
    - `PCFeaturesTab.js` (Feature-Karten & Volksmerkmale)
* **🗣️ AGENT.md Pflege:**
  - Festlegung der zwingenden Pflicht auf Deutsch mit dem Benutzer zu kommunizieren direkt als Header-Regel in `AGENT.md`.

### v3.2.6 — Monolith-Refactoring: PCOffense.js Split (Release v3.2.6)

* **⚔️ Modularisierung des Ausrüstungs-Tabs (PCOffense.js):**
  - Der UI-Monolith `PCOffense.js` wurde von über 1.250 Zeilen auf ca. 50 Zeilen geschrumpft.
  - Die gesamte Funktionalität wurde in 7 granular strukturierte JS-Komponenten unter `js/ui/components/player/offense/` aufgeteilt:
    - **`PCOffenseHelper.js`:** ID-Vergaberoutine, Seltenheits-Styling und Waffentalent-Boni.
    - **`NaturalAttacksRenderer.js`:** Hält `SHAPE_ATTACKS` und rendert Tiergestalt-Waffen.
    - **`CombatSettingsRenderer.js`:** Steuert die Inputs/Toggles für Heftigen Angriff, Kampfgetümmel, Verteidigendes Kämpfen und Volle Abwehr.
    - **`EquipmentSlotsRenderer.js`:** Rendert die drei Slots (Haupthand, Nebenhand, Rüstung) und bindet Wurf- und Unequip-Aktionen.
    - **`WeaponStashCard.js`:** Verwaltet Waffen-Backpack-Karten, Zusatzschadens-Drawer und Doppelwaffen-Dialog.
    - **`ArmorStashCard.js`:** Rüstungs-Rucksack-Karten und Auto-RK-Abfrage.
    - **`InventoryStashRenderer.js`:** Rucksack-Grundlayout, Listen-Befüllung und Add-Buttons.
  - `PCOffense.js` fungiert als reiner Fassaden-Einstiegspunkt. Alle unit-relevanten Hilfsfunktionen (`isLightWeapon`, `getCritThreatDisplay`) werden transparent weiterreexportiert.
* **🌐 Offline-Fähigkeit & Service-Worker:**
  - Alle 7 neuen Dateien wurden im Service Worker registriert.
  - Die Cache-Version wurde auf `dnd-combatsheet-v3.2.6-cache-v1` hochgestuft.
* **📝 AGENT.md Pflege:**
  - Alle neuen Komponenten haben den standardkonformen `@module`-Header erhalten.
  - Der Feature-to-File-Index wurde angepasst, `PCOffense.js` wurde aus dem Größen-Backlog gelöscht.

---

### v3.2.5 — Bugdokumentation & Cache-Pflege (Release v3.2.5)

* **📝 Bug-Tracking aktualisiert:**
  - Bug #15 dokumentiert: Druiden-Tiergestalt — Attributswerte, RK und Rettungswürfe werden nicht korrekt berechnet (`Combatant.enterShape()`).
  - Bug #16 dokumentiert (KRITISCH): Crash beim Tab-Wechsel zu „Ausrüstung" wenn Druide in Tiergestalt ist. `_renderNaturalAttacksList` fehlt in `PCOffense.js` — wurde bei der Magic-Items-Implementierung nicht berücksichtigt.
* **🔧 Serviceworker Cache-Konvention festgelegt:**
  - Versionsformat: `vX.Y.Z-cache-vN`. Beim Erhöhen der Versionsnummer (X, Y oder Z) beginnt der Cache-Zähler `N` wieder bei 1. Aktuell: `dnd-combatsheet-v3.2.5-cache-v2`.

---

### v3.2.4 — Waffen Zusatzschaden via Dropdowns (Release v3.2.4)

* **⚔️ Strukturierter Zusatzschaden für Waffen:**
  - Das alte Freitextfeld „Zusatzschaden" wurde durch zwei verkoppelte Dropdowns ersetzt:
    - **Würfelanzahl:** Gleiche Auswahl wie bei Schadens-Abw. (`—`, `1w4`, `1w6`, `1w8`, `1w10`, `2w6`, etc.)
    - **Schadensart:** Feuer, Kälte, Elektrizität, Säure, Schall, etc.
  - Die Felder speichern `extraDamageDice` und `extraDamageType` in `Weapon.js`.
  - Der Legacy-Getter `extraDamage` baut den String (`1w6 Feuer`) dynamisch aus beiden Feldern zusammen; alte Freitext-Strings werden beim Laden automatisch geparst.
  - `AttackEngine.js` liest `weapon.extraDamage` und nimmt die ausgewählten Würfel mit in die Schadensformel auf, wenn die Waffe ausgerüstet ist.
* **🧪 Tests:** Neue Tests in `Tests/weapons.test.js` für Getter, Parsing und `AttackEngine`-Integration.

---

### v3.2.3 — Magische Gegenstände: Multi-Effekte (Release v3.2.3)

* **✨ Mehrfach-Effekte pro magischem Gegenstand:**
  - `Item.js`: Alle Effekte werden im `effects[]`-Array gespeichert. Legacy-Felder `effectType`/`effectTarget`/`effectValue` werden via Getter/Setter auf `effects[0]` gespiegelt (Abwärtskompatibilität automatisch gewährleistet).
  - `PCMagicItemsTab.js`: Im Konfigurationsbereich (Rucksack) erscheint ein Inline-Button **„➕ Effekt"**, mit dem beliebig viele Effektzeilen hinzugefügt werden können. Jede Zeile hat Typ-, Ziel- und Wert-Dropdown sowie einen Löschen-Button.
  - `Combatant.js`: Iteriert beim Anwenden von Item-Effekten über das gesamte `effects[]`-Array.
  - `PCManager.js`: Neue State-Aktionen `addPCItemEffect`, `deletePCItemEffect`, `updatePCItemEffect`.
* **🧪 Tests:** Neue Tests in `Tests/MagicItems.test.js` für Multi-Effekte, Legacy-Kompatibilität und `Combatant`-Anwendung.

---

### v3.2.2 — Neuer Tab „Magische Gegenstände" (Release v3.2.2)

* **🔮 Dedizierter Tab „Magische Gegenstände" in der Player-Sheet-Navigation:**
  - Beim Wechsel auf den Tab schalten sowohl die linke als auch die rechte Spalte synchron in den Magic-Items-Modus.
  - **Linke Spalte — Ausgerüstete Slots:** Slot-Boxen für alle 11 D&D 3.5e magischen Ausrüstungsslots (Kopf, Augen, Hals, Schultern, Körper, Torso, Handgelenke, Hände, Taille, Füße, Ring 1, Ring 2) plus Slotless-Bereich.
  - **Rechte Spalte — Rucksack:** Inventar-Bereich für magische Gegenstände, analog zu den Waffenkarten. Ausrüsten/Ablegen-Buttons und Konfigurationsformular direkt in der Karte.
  - **Neue Komponente:** `PCMagicItemsTab.js` als dediziertes UI-Modul unter `js/ui/components/player/`.
* **🧪 Tests:** Grundlegende Tests für Item-Erstellung, Ausrüsten und Effektanwendung in `Tests/MagicItems.test.js`.

---

### v3.2.1 — Zwei-Waffen-Kampf & Doppelwaffen (Release v3.2.1)


* **⚔️ Zwei-Waffen-Kampf (TWF) nach D&D 3.5e RAW:**
  - **Talent-Warnung:** Versucht ein Charakter ohne das Talent *Zwei-Waffen-Kampf* (real oder virtuell) eine Waffe in der Nebenhand auszurüsten, wird er per Warnungs-Dialog vor den schweren Abzügen (`-4/-8` bei leichter bzw. `-6/-10` bei normaler Nebenhand) gewarnt. Das Ausrüsten erfolgt erst nach Bestätigung.
  - **Dynamische Abzugs-Berechnung:** Im Vollangriff (Full Attack) werden die korrekten Mali auf Angriffe automatisch berechnet und in den Breakdowns gelistet. Bei Standardangriffen (Einzelangriffen) entfallen die TWF-Mali regelkonform.
  - **Stärkebonus-Skalierung:** Angriffe mit der Nebenhand erhalten automatisch nur 0,5x Stärkemodifikator auf den Schadenswurf.
  - **Ranger Rüstungs-Einschränkung:** Virtuelle TWF-Talente von Waldläufern (ab Stufe 2) werden dynamisch ausgesetzt, sobald der Charakter eine mittelschwere oder schwere Rüstung trägt. In leichter oder ohne Rüstung sind sie aktiv.

* **🪵 Doppelwaffen-Funktionalität (z. B. Kampfstab):**
  - **Ausrüst-Wahl-Dialog:** Beim Anlegen eines Kampfstabs (Quarterstaff) öffnet sich ein Pergament-Modal, in dem der Spieler wählt, ob er die Waffe *Zweihändig* (1,5x Stärkeschaden, 2x Power Attack) oder als *Doppelwaffe* (Hauptseite 1,0x Stärke, Nebenseite 0.5x Stärke als leichte Waffe, aktiviert Zwei-Waffen-Kampf) führen möchte.

* **⚙️ UI/QoL Verbesserungen:**
  - **Explizite Hand-Dropdowns:** Waffen-Karten im Inventar bieten ein Dropdown zur Wahl der Tragehand (Haupthand/Nebenhand).
  - **Unequip bei Handwechsel:** Ändert man die Hand einer bereits ausgerüsteten Waffe, wird sie automatisch abgelegt, damit sie nur über einen Klick auf „Anlegen“ (unter Einhaltung der Warnungen) neu ausgerüstet werden kann.
  - **Klarheit bei leerer Haupthand:** Rüstet man eine Waffe in der Nebenhand aus, während die Haupthand leer ist, wird diese nicht mehr fälschlicherweise in beide Slots gespiegelt. Die Haupthand bleibt sauber auf `(Unbewaffnet)`.
  - **Dynamische Dropdown-Labels:** Bei zweihändig geführten Waffen oder Fernkampfwaffen wird das Hand-Dropdown deaktiviert und zeigt unmissverständlich **„Zweihändig“** bzw. **„Fernkampf“** an (mit angepasster Deckkraft und Mauszeiger).

---

### v3.1.5 — Systemmenü-Dropdown & Tablet-Optimierung (Release v3.1.5)

* **⚙️ Nativ integrierte System-Optionen statt Floating Action Button (FAB):**
  - **Entfernung des FAB:** Der schwebende Action-Button unten rechts wurde vollständig entfernt. Dies behebt Darstellungs- und Klick-Probleme auf Tablets und schont die Bedienfläche.
  - **Spielerseite:** Ein neuer Tab `⚙️ System` wurde am Ende der Tab-Leiste in den Spielerbogen integriert.
  - **Spielleiterseite (DM):** Ein neuer Button `⚙️ System` wurde in die Aktionsleiste neben den `Reset`-Button eingefügt.
  - **Absolut positioniertes Dropdown-Menü:** Beim Klick auf den Button öffnet sich das Menü `#systemDropdownMenu` reaktiv und direkt unter dem Trigger-Button, skaliert sauber mit `--app-scale` und richtet sich bei Platzmangel rechtsbündig aus.
  - **Automatisches Schließen:** Das Menü schließt sich selbstständig bei Klick auf eine Aktion oder außerhalb des Dropdowns.

---

### v3.1.0 — Clean Code Refactoring (Review, Refine, Refactor - Release v3.1.0)

* **📦 Modularisierung von `dialogs.js` (UI-Schicht):**
  - Die 1577 Zeilen lange Datei `dialogs.js` wurde vollständig in das neue Verzeichnis `/js/ui/dialogs/` aufgeteilt:
    - `BaseDialogs.js` (Systemdialoge wie Alerts, Confirms, Prompts)
    - `AttackChoiceDialog.js` (`showAttackChoiceDialog`)
    - `PrepareSpellDialog.js` (`showPrepareSpellDialog` & `showCastSpontaneousSpellDialog`)
    - `SessionDialog.js` (`showSessionModal` für WebRTC)
    - `SpellScrollDialog.js` (`showSpellScrollDialog`)
    - `FeatScrollDialog.js` (`showFeatScrollDialog`)
  - Das ursprüngliche `dialogs.js` dient nun als schlanke Fassade (Facade), die alle exportierten Dialoge re-exportiert.

* **🗂️ Physische Daten-Abspaltung (Logical Layer):**
  - Statische Definitionstabellen wurden aus `/js/rules/` in den neuen Ordner `/js/data/` ausgelagert (`feats-data.js` und `skills-data.js`).

* **🛡️ FE/BE-Trennung in Domänen-Modellen:**
  - **Monolith-Zerlegung:** `rebuildStatModifiers()` in `Combatant.js` wurde in private Hilfsmethoden aufgeteilt.
  - **Entfernung von HTML:** Jegliche HTML-String-Generierung wurde aus den Modellen (`Combatant.js`, `Weapon.js`) entfernt. Die Formatierung findet nun ausschließlich in der UI-Schicht (`PCOffense.js`) statt.

* **⚙️ Initialisierungs-Splitting in `app.js`:**
  - Die monolithische `initApp()`-Methode wurde in eine Serie von modularen, privaten Hilfsmethoden zerlegt (z. B. `_initIntroSequence()`, `_initStateAndSync()`, `_registerServiceWorker()`).

* **📐 Entkopplung von UI & Regel-Engines:**
  - D&D 3.5-spezifische Arithmetik wurde komplett aus den UI-Dateien entfernt und an dedicated Rule-Engines (z. B. `SpellSlotCalculator.js` für Metamagie-Slots, `RangerRules.js` für Erzfeind-Boni, `RogueRules.js` für Sneak-Attack-Schadenswürfel) delegiert.

---

### v3.0.0 — Auto-Scaling System-Stabilisierung (Release v3.0.0)

* **🚀 Vollautomatisches Auto-Scaling (Auto-Fit) ohne Klickverluste:**
  - **Dynamischer Auto-Fit:** Die App berechnet den Skalierungsfaktor nun rein anhand der Fensterbreite (Zielbreite 1150px) und klammert den Wert sicher zwischen `1.0` und `1.6`. Keine manuellen Zoom-Buttons oder Label-Flackern mehr.
  - **Entkopplung der Layout-Logik:** Die Breitenberechnung wurde komplett von der Höhen-Synchronisation getrennt. Der `ResizeObserver` steuert ausschließlich die Anpassung von `body.style.minHeight`. Das behebt unendliche Feedbackschleifen (Scrollbar-Flimmern) vollständig.
  - **Behebung des Flexbox-Kollapses (`layout.css`):** `#appRoot` wurde auf `width: 100%` fixiert und zentriert seine Kindelemente nun per Flex-Column. Dadurch kollabiert der Layout-Rahmen nicht mehr auf `0px` und der Skalierungs-Mittelpunkt (`transform-origin: top center`) liegt exakt auf der optischen Bildschirmmitte.
  - **Struktur-Fix Spielerbogen (`index.html`):** Ein fehlerhaftes, vorzeitiges `</div>` schloss `#appRoot` vorzeitig, wodurch der Spielerbogen (`#playerScreen`) außerhalb im DOM lag und die Skalierung nicht erbte. Dieser wurde wieder korrekt in `#appRoot` verschachtelt.

* **🎯 Einheitliche Skalierung von Popups & Overlays:**
  - **Modal- und Menü-Skalierung:** Alle modalen Overlays (Sitzungs-Manager, Metamagic, Zauber-Schriftrollen, Tierbegleiter) sowie das Systemmenü (`#fabContainer`) wurden im CSS an `--app-scale` gekoppelt. Das Menü skaliert an der unteren rechten Ecke verankert perfekt mit.
  - **Würfel- & Rettungswurf-Breakdowns:** Die ID `#rollBreakdown` wurde in die Skalierungsliste aufgenommen, womit nun alle Dialoge einheitlich groß und auf hochauflösenden Displays lesbar sind.

* **♿ Dropdown-Barrierefreiheit & Cache-Bypass:**
  - **Lesbare Dropdown-Auswahl:** Die winzigen inline-Schriftgrößen (7.5px - 9px) an `<select>`-Elementen wurden global per CSS überschrieben (`11px !important`). Dadurch ist auch die vom Browser generierte native Optionsliste auf allen Geräten angenehm lesbar.
  - **Service Worker Hard-Reload:** Die "App-Daten bereinigen"-Funktion unregistriert nun alle Worker, löscht sämtliche Caches und führt einen sauberen Hard-Reload durch. Ein Auto-Reload triggert bei neuen Versionen im Hintergrund.

* **🛡️ Härtung der Talent-Voraussetzungen:**
  - **Spezial-Voraussetzungen:** Prüfung von Talentvoraussetzungen des Typs `custom` automatisiert. *Zusätzliches Vertreiben* (erfordert Kleriker 1+ / Paladin 4+), *Zusätzliche Bardenmusik* (Barde 1+), *Natürliches Zaubern* (Druide 5+) und *Kampf zu Pferd* (Reiten 1) werden nun im Regel- und UI-Layer streng validiert. Nicht erfüllte Voraussetzungen sperren den "Lernen"-Knopf und zeigen detaillierte Feedback-Meldungen.

* **⛪ Paladin "Untote vertreiben" Integration (ab Stufe 4):**
  - **Ressourcen & UI:** Paladine ab Stufe 4 erhalten regelkonform die Tagesfähigkeit *Untote vertreiben* (Uses: `3 + CHA-Modifikator`). Das Interface (Sonnen-Symbole, Regeln, Wurf-Knopf) wird direkt auf der Paladin-Feature-Karte eingeblendet.
  - **Multiklassen-Schutz:** Der Ressourcenpool wird bei Kleriker/Paladin-Multiklassen geteilt und zusammengeführt, ohne die Ressource zu duplizieren. Beim Entfernen einer Klasse schützt die verbleibende Klasse die Ressource vor dem Löschen.

* **⚔️ Live-Initiative-Anzeige im Spieler-Header:**
  - **Echtzeit-Widget:** Unter der HP-Leiste im oberen Ressourcenmonitor (Header) wird nun live die berechnete finale Initiative (Wurf + DEX + Modifikatoren) angezeigt.

---

### v2.9.1 — Zoom/Click-Area-Fix (Release v2.9.1)

* **⚠️ Kritischer Bug gelöst — Zoom/Click-Area-Misalignment (150% DPI):**
  - **Root Cause:** `#appRoot { width: calc(100% / var(--app-scale)) }` war die direkte Ursache. Der Width-Hack schrumpfte das Layout-Rechteck auf 83.33% (bei scale=1.2). Bei `devicePixelRatio != 1` (Windows 150% DPI) akkumulierte die Browser-interne Hit-Test-Matrix-Inversion Rundungsfehler auf dem verkleinerten Rechteck → Click-Area driftete nach links. Symptom: nur die linke Hälfte von Buttons klickbar.
  - **Fix A — `layout.css`:** `transform-origin: top left` → `top center`. Mit `top center` skaliert `#appRoot` symmetrisch um die horizontale Mitte. Das Layout-Rechteck bleibt `100vw` (full-width, unmanipuliert). Die Matrix-Inversion für Hit-Testing arbeitet auf einem unverzerrten 100vw-Rechteck → keine Click-Drift bei beliebigem `devicePixelRatio` oder Browser-Zoom.
  - **Fix B — `layout.css`:** `width: calc(100% / var(--app-scale))` komplett entfernt. Kein Width-Hack mehr nötig, da `top center` den Overflow symmetrisch verteilt. `overflow-x: hidden` auf `body` unterdrückt ihn sauber.
  - **Fix C — `app.js`:** Neue Funktion `_syncScrollHeight()`. Da `transform:scale()` den Layout-Flow nicht beeinflusst (das Element nimmt seine pre-scale Höhe ein), würde der Browser die skalierte untere Hälfte nicht scrollen. `_syncScrollHeight()` liest `appRoot.getBoundingClientRect().height` (= visuelle skalierte Höhe in Viewport-Pixeln) und setzt `body.style.minHeight` entsprechend.
  - **Fix D — `app.js`:** `ResizeObserver` auf `#appRoot` in `initZoom()` registriert. Ruft `_syncScrollHeight()` via `requestAnimationFrame` auf, sobald sich die appRoot-Größe ändert (Tab-Wechsel, Content-Load). Dadurch bleibt die Scroll-Höhe immer korrekt, auch wenn der Spieler zwischen DM- und Player-Screen wechselt.
  - **Betrifft:** 1920×1080 + Windows 150% DPI + Browser 90% + App-Zoom beliebig, Tablet Pinch-Zoom (via Browser), alle `devicePixelRatio != 1`-Setups.
  - **Verifiziert:** Alle 67 Unit-Tests grün. Kein Regressionsrisiko (reine CSS/Transform-Änderung, keine Logik-Änderungen an Regel-Engine oder State).

### v2.9.0 — Bugtracking & Quality-of-Life (Release v2.9.0)

* **Bug 1 – Fokusverlust Talentsuche (PCFeatsTab.js):**
  - Das Suchfeld im Talente-Tab verlor nach jedem Tastendruck den Fokus, weil `renderPCFeats()` das gesamte `innerHTML` des Containers ersetzte.
  - **Fix:** Neue Funktion `renderCompendiumOnly(pc, container)` extrahiert, die nur den Compendium-Listen-Container (`compendium-feats-list`) aktualisiert, ohne das Suchfeld-Element zu zerstören. `oninput`- und `onchange`-Handler rufen nur noch diese Partial-Render-Funktion auf.

* **Bug 2 – Voraussetzungs-Validierung bei Talenten (PCManager.js + feats-data.js):**
  - Talente konnten ohne Erfüllung ihrer Voraussetzungen hinzugefügt werden, da `addPCFeat()` keine Validierung durchführte.
  - **Fix:** Neue pure Utility-Funktion `checkFeatPrerequisites(featId, pc)` in `feats-data.js` exportiert, die alle Voraussetzungstypen (`bab`, `feat`, `classLevel`, `class`, `stat`, `level`, `casterLevel`, `custom`) prüft und `{ met, unmetDescs[] }` zurückgibt.
  - `addPCFeat()` in `PCManager.js` importiert diese Funktion und blockiert das Hinzufügen bei nicht-erfüllten Voraussetzungen mit einem `{ success: false, error }` Rückgabewert.
  - Der `showFeatScrollDialog()` zeigt im Fehlerfall ein formatiertes `showCustomAlert()`-Popup an, ohne den Dialog zu schließen.

* **Bug 3 – Klassenmerkmal-Leak bei Klassenwechsel (PCManager.js + feats-data.js):**
  - Beim Umschalten einer Klasse via Dropdown blieben Talente bestehen, deren Klassenvoraussetzung nicht mehr erfüllt war (z. B. "Zusätzliches Vertreiben" nach Paladin → Magier).
  - **Fix:** Neue pure Utility-Funktion `getFeatIdsByClassPrereq(classType)` in `feats-data.js` exportiert, die alle Talent-IDs zurückgibt, die eine bestimmte Klasse voraussetzen.
  - Neue Funktion `cleanupFeatsDependingOnClass(pc, removedClassType)` in `PCManager.js` filtert betroffene Talente aus `pc.feats` heraus.
  - `updatePCClassType()` ruft diese Cleanup-Funktion auf, bevor die Klasse im Array ersetzt wird.

* **Bug 4 – Touch-Button-Klickflächen (combatants.css):**
  - Buttons waren auf Touch-Geräten (Tablets, Rechner) teilweise nicht zuverlässig klickbar.
  - **Fix:** `.xbtn`-Klasse erhält `min-height: 24px; touch-action: manipulation; user-select: none; -webkit-tap-highlight-color: transparent`.
  - Neue CSS-Regel `pointer-events: none` auf `span` und `svg` innerhalb von `.xbtn`, damit Touch-Events nicht am Icon-Element hängen bleiben.

* **Bug 5 – Instabile Würfelergebnis-Popups (dialogs.js):**
  - `showRollBreakdown()` erzeugte ein absolut positioniertes Floating-Div an `event.pageX/Y`, das beim Scrollen offscreen wandern konnte.
  - **Fix:** Vollständiger Umbau auf das bewährte zentrierte Overlay-Modal-System (`position:fixed; inset:0`). Das alte Floating-Tooltip-Design wurde durch ein volles Pergament-Dialog ersetzt.
  - Neuer touch-freundlicher **✔ Fertig**-Button (`min-height: 38px`, volle Breite) ersetzt den alten "Klicke zum Schließen"-Hinweis.
  - Auto-Close-Timeout von 10 auf 30 Sekunden erhöht (kein Stress beim Lesen der Formel).
  - `event`-Parameter bleibt für API-Kompatibilität in der Signatur, wird aber nicht mehr zur Positionierung verwendet.
  - Betrifft alle 9 Aufruforte: Attributwürfe, Rettungswürfe, Initiative, Fertigkeitswürfe, Angriffe, Schaden, Bardisches Lied, Vertreibung, Tierbegleiter/Vertrauter.

* **Bug 6 – Fehlende Initiative-Summe (PCDefenses.js):**
  - Es wurde nur der Initiative-Modifikator angezeigt, nicht die Summe aus Würfelwurf + Modifikator.
  - **Fix:** Initiative-Grid um eine "Summe"-Spalte erweitert. Ein `<span class="pc-init-total">` wird live über einen `oninput`-Handler aktualisiert, sobald der Spieler einen Würfelwurf einträgt. Zeigt `--` wenn kein Wert eingetragen ist.
* **Bug 7 – Vereinheitlichte Dialog-Architektur (dialogs.js):**
  - Verschiedene Popup-Typen (Roll-Breakdown, Angriffswahl, Talente etc.) verwendeten inkonsistenten, duplizierten Aufbaucode.
  - **Fix:** Neue `showInfoDialog({ id, title, bodyHtml, buttonText, width, onClose })` Basisfunktion eingeführt, die die identische visuelle Sprache wie `showAttackChoiceDialog` verwendet (zentriertes Overlay, `custom-alert-box`, Pergament-Hintergrund, Escape/Enter-Dismiss).
  - `showRollBreakdown()` wurde auf einen schlanken ~20-Zeilen-Wrapper über `showInfoDialog()` reduziert.
  - Die veraltete absolute Positionierung (`.roll-breakdown { position: absolute }`) und der globale Click-Handler in `app.js` wurden entfernt.

* **⚠️ Bekanntes offenes Problem – Zoom/Click-Area-Misalignment (HIGH PRIORITY):**
  - **Status:** Nicht gelöst. Geht in v2.9.x über.
  - **Symptom:** Auf 1920×1080 + Windows 150% DPI + Browser 90% + App 120%: Nur die linke Hälfte von Buttons ist klickbar, Initiative-Button komplett nicht klickbar, Talente nur linksseitig auswählbar. Auf 2560×1440 + 100% DPI: Alles funktioniert.
  - **Analyse:** Das alte Zoom-System (`html { zoom: var(--app-zoom) }` → Media-Query-Feedback-Loop) ist strukturell fehlerhaft bei `devicePixelRatio != 1`.
  - **Letzter Stand:** `#appRoot { transform: scale(var(--app-scale)) }` Ansatz implementiert, aber der App-Zoom via Systemmenü wurde dadurch broken. Nächster Agent muss von vorne analysieren.
  - **Betroffene Dateien:** `index.html` (appRoot-Wrapper), `css/layout.css` (--app-scale), `js/app.js` (applyZoom), `service-worker.js` (cache v2.9.0-cache-v2).

* **Zaubertemplates (Spell Templates):**
  - Ermöglicht vorbereitenden Klassen das Speichern ihrer aktuellen Slotbelegung als benannte Vorlage.
  - Ermöglicht das Laden gespeicherter Vorlagen über ein Dropdown-Menü in der Belegungsliste.
  - Automatischer Slot-Überprüfungsalgorithmus: Verteilt Zauber des Templates auf reguläre Slots und priorisiert Spezialisten-Slots für spezialisierte Magier. Meldet nicht-platzierbare Zauber bei unzureichenden Slots.
* **Erweiterter Tagesreset (Tagesreset 🌅):**
  - Integriert eine Vorlagenauswahlabfrage in den Tagesreset-Ablauf von vorbereitenden Castern.
  - Bietet die Auswahl, die aktuelle Auswahl zu behalten, eine gespeicherte Vorlage anzuwenden oder mit einer komplett leeren Liste (`[Leere Zauber]`) neu zu beginnen.
  - Setzt automatisch alle verbrauchten Slots auf `0` und re-initialisiert alle Tagesressourcen.
* **Quality of Life Features:**
  - Schnelllösch-Button (`Leeren` bzw. `Alle leeren`) zum schnellen Leeren aller vorbereiteten Zauber.
  - Modaler parchment-style Prompt-Dialog (`showCustomPrompt`) zur sicheren Eingabe von Vorlagennamen.

### v2.8.0 — Metamagie & Zaubervorbereitung (Release v2.8.0)
* **Zaubervorbereitung & UI-Tabs Dashboard:**
  - Umstrukturierung der UI zur Optimierung täglicher Spielabläufe: Das selten genutzte Zauberkompendium und die vorbereiteten Slots teilen sich nun als Tabs ("🌅 Vorbereitung" und "📖 Kompendium") die rechte Spalte (Dashboard).
  - Das linke Zauberbuch beherbergt die täglichen Kontingente (Slots-Bubbles) und die gesamte Bibliothek gelernter Zauber.
  - **Bereich A (Vorbereitung - rechts):** Zeigt alle Slots sortiert nach Zaubergrad an, inklusive belegter Slots (mit "Wirken"- und "Leeren"-Buttons) und freier Slots mit "➕ Vorbereiten"-Buttons.
  - **Bereich B (Bibliothek - links):** Listet gelernte Zauber. Klick auf "[Vorbereiten]" öffnet den Metamagie-Dialog.
* **Metamagische Talente (Metamagic Feats):**
  - Vollwertige Integration der metamagischen Talente (*Zauber verlängern* (+1), *Zauber verstärken* (+2), *Zauber maximieren* (+3), *Zauber beschleunigen* (+4)).
  - Dynamischer Vorbereitungs-Dialog für vorbereitende Casters zur Berechnung des finalen Zaubergrads und Belegung der Slots.
* **Spezialistenmagier-Support:**
  - Erkennung und separate Visualisierung des Spezialistenslots für spezialisierte Magier (z. B. *"⭐ Spezial-Slot: Hervorrufung"*).
  - Validierung der Spezialisierungsschule beim Vorbereiten eines Zaubers in einem Spezialistenslot.
* **Spontane Zauberer & Metamagie:**
  - Spontane Zauberwirker (Hexenmeister, Barden) wirken Zauber direkt aus der Bibliothek.
  - Klick auf "Wirken" öffnet ein Metamagic-Wahl-Popup.
  - Erhöht die Zauberzeit regelkonform auf eine volle Aktion (oder +1 Runde), wenn Metamagie angewendet wird (inkl. Deaktivierung von *Schnellzauber*).
* **Netzwerk-Sync & Datensicherheit:**
  - Volle Synchronisierung von `preparedSpells` über das Delta-Protokoll an den DM-Screen.
  - Integration von vorbereiteten Zaubern in das `resetDailyResources` (Tagesreset setzt die Benutzung zurück).

### v2.7.1 — Tablet-First Regel-Buttons
* **Tablet-First UI Refactoring:**
  - Anpassung aller Regel-Hilfe-Schaltflächen in der gesamten Anwendung für eine optimale Bedienung auf Tablets/Touchscreens.
  - Vergrößerung der Touch-Ziele (größere Paddings und einheitliche Mindesthöhe von 15px), um Fehlklicks mit den Fingern zu verhindern.
  - Hinzufügen eines klaren Rahmens und Hintergrunds zu allen Hilfe-Buttons, damit sie sich visuell deutlich als interaktive Schaltflächen von statischem Text abheben.
  - Entfernung von Tooltip-Abhängigkeiten (`title`), da diese auf Tablets nicht zuverlässig nutzbar sind.
* **Einheitliche Symbole & Verhalten:**
  - **Inline-Erweiterungen (Akkordeon-Stil):** Gekennzeichnet mit dem Symbol **`📖 ▼`** (z. B. bei *Göttliche Gnade*, *Untote vertreiben*, *Böses niederstrecken*, *Hände auflegen*). Zeigt an, dass der Text direkt darunter aufklappt.
  - **Popup-Modale (Pergament-Fenster):** Gekennzeichnet mit dem Symbol **`📖 ↗`** (z. B. bei *Schlaghagel*, *Kampfgetümmel*, *Verteidigend kämpfen*, sowie allen Features für Mönch, Waldläufer und Hexenmeister). Zeigt an, dass sich ein modales Fenster über die App legt.

### v2.7.0 — Kampfmanöver & Schurken-Feinschliff
* **Schurken-Unterstützung: Hinterhältiger Angriff (Sneak Attack):**
  - Vollständige Integration des Schurken-Zusatzschadens im Rechenkern.
  - Dynamischer Sneak-Attack-Checkbox-Toggle direkt im Angriffs-Wahl-Dialog (nur sichtbar für PCs mit Schurkenstufen).
  - Berechnet und addiert automatisch die korrekte Anzahl an W6 Schadenswürfeln (`+1W6` auf Stufe 1, `+2W6` auf Stufe 3, `+3W6` auf Stufe 5 etc.) basierend auf der Rogue-Klassenstufe.
  - Ergänzt den Schadens-Audit-Log im parchment Breakdown um den entsprechenden Eintrag.
* **Manöver: Verteidigend kämpfen (Defensive Fighting):**
  - Hinzufügen einer globalen Checkbox im Waffen-Panel zur Aktivierung des defensiven Kampfstils.
  - Automatischer Malus von `-4` auf alle Angriffswürfe der Runde.
  - Reaktiv wirkender Dodge-Bonus von `+2` auf RK und Berührungs-RK. Das System prüft automatisch die Akrobatik-Ränge (Tumble Ranks) und erhöht den Bonus RAW-konform auf `+3` bei 5 oder mehr gelernten Rängen.
* **Manöver: Volle Abwehr (Total Defense):**
  - Hinzufügen einer globalen Checkbox zur Aktivierung der vollen Abwehr (Standardaktion).
  - Sperrt/deaktiviert automatisch alle Angriffs- und Schadenswürfelknöpfe im UI und blendet ein Warnbadge ein.
  - Gewährt einen massiven Ausweichbonus von `+4` auf RK und Berührungs-RK, welcher sich bei 5 oder mehr Rängen in Akrobatik (Tumble) automatisch auf `+6` erhöht.
* **Mönch-Schadensskalierung & Alphabetische Waffenliste:**
  - Behebung des Fehlers, bei dem der waffenlose Schlag (Unarmed Strike) eines Mönchs fälschlicherweise immer nur 1w3 Schaden (Standardwert für Nicht-Mönche) statt des stufenbasierten Schadens (z. B. 1w8 auf Stufe 5) verursachte.
  - Dynamische Skalierung des waffenlosen Schadens für Mönche im Rechenkern (`AttackEngine.js`) und in der UI-Anzeige (`PCOffense.js`) über die Methode `getWeaponDamageDice`.
  - Alphabetische Sortierung der Waffenauswahlliste nach deutschen Namen zur Vermeidung einer unsortierten Reihenfolge.
* **Regel-Hilfe-Buttons (📖):**
  - Hinzufügen von kleinen Info-Buttons (Buch-Symbol) neben den Labels für „Kampfgetümmel“ und „Verteidigend kämpfen“.
  - Klicks auf diese Buttons öffnen ein thematisches, modales Popup-Fenster mit der genauen D&D 3.5e RAW Regelerklärung für das jeweilige Manöver.

### v2.6.1 — Code-Modularisierung & Refactoring (AttackEngine.js)
* **Wartbarkeit & Clean Code:**
  - Aufteilung der ehemals 600+ Zeilen langen `calculateAttackSequence`-Funktion in kleinere Hilfsfunktionen mit klarer, einzelner Verantwortung (Single Responsibility Principle).
  - Einführung modularer Resolver für Kontextbildung (`buildContext`), Basis-Angriffszahlen (`calculateBaseAttacks`), allgemeine Angriffs-/Schadensmodifikatoren und spezifische Kampfmanöver (Zwei-Waffen-Kampf, Mönch-Schlaghagel, Schnelles Schießen).
  - Gewährleistung von 100%iger Schnittstellenkompatibilität ohne funktionale Änderungen.

### v2.6.0 — Waffenkampf- & Angriffs-Update (Phase 1 & Phase 2)
* **Zentralisierte Berechnungs-Engine (AttackEngine.js):**
  - Komplette Automatisierung des D&D 3.5e Kampfsystems für Standard- und Volle Angriffe (Iterative Angriffe bei hohem GAB: +11/+6/+1).
  - Integration von Klassenboni, Feats und Zaubereffekten wie *Hast* (Zusatzangriff mit höchstem GAB, +1 auf alle Angriffe) und *Schnelles Schießen* (Rapid Shot: +1 Fernkampf-Angriff bei höchstem GAB, -2 Malus auf alle Angriffe).
  - Volle Unterstützung für natürliche Waffen (Polymorph / Wild Shape) unter Umgehung von iterativen/TWF-Regeln (z.B. Wolf, Leopard, Braunbär).
* **Zwei-Waffen-Kampf (Two-Weapon Fighting) & Verteidigung:**
  - Automatische Erkennung und Berechnung der korrekten Abzüge für Haupthand und Nebenhand (z. B. -2/-2, -4/-4, -4/-8, -6/-10) basierend auf der Waffenkategorie (leichte Nebenhand) und dem Vorhandensein des Talents *Zwei-Waffen-Kampf*.
  - **Zwei-Waffen-Verteidigung (Two-Weapon Defense):** Gewährt automatisch +1 Schildbonus auf AC und Flat-footed AC bei aktiver Nebenhand-Waffe.
* **Kampfmanöver: Kampfgetümmel (Combat Expertise):**
  - Dynamischer Schieberegler im Charakterbogen (nur sichtbar bei erlerntem Talent), der einen Malus von 0 bis min(5, GAB) erlaubt.
  - Der gewählte Wert wird automatisch als Dodge-Bonus auf AC und Touch-AC (nicht Flat-footed) addiert und von allen Nahkampfangriffen abgezogen.
* **Interaktiver Angriffs-Auswahldialog:**
  - Beim Klick auf den Angriffs-Button öffnet sich ein neues D&D-Themen-Popup zur Wahl zwischen Standard- und Vollem Angriff.
  - Dynamische Checkboxen für *Böses niederstrecken* (Smite Evil) für Paladine (+Cha-Mod auf Angriff, +Stufe auf Schaden) und *Gegen Erzfeind* (Favored Enemy) für Waldläufer. Klicks darauf berechnen die Angriffs- und Schadensmodifikatoren in Echtzeit neu.
  - Vollständiger mathematischer Breakdown aller Angriffs- und Schadensboni zur Nachvollziehbarkeit am Spieltisch.
* **Automatisierte Talent-Skill-Boni & Klassen-Bewegungsraten:**
  - **Skill Feats:** Automatische Zuweisung von +2 auf entsprechende Fertigkeiten für alle 15 PHB-Fertigkeitstalente (z. B. *Stealthy*).
  - **Fertigkeitsfokus (Skill Focus):** Automatischer +3 Bonus auf die ausgewählte Fertigkeit (Deutsch/Englisch).
  - **Bewegungsrate (Fast Movement):** Automatisches Hinzufügen von +10 ft für Barbaren und stufenbasiert +10 bis +60 ft für Mönche (stapelbar bei Multiklassen).

### v2.5.0 — Waffensystem-Refactoring & RAW-Regelwerke
* **Waffengattungen-Dropdown (Weapon Categories Registry):**
  - Implementierung einer `WeaponRegistry` mit allen standardmäßigen D&D 3.5e-Waffen (Dolch, Langschwert, Rapier, Langbogen, Komposit-Langbogen, Leichte Armbrust, etc.) und deren Standardwerten.
  - Legacy-Waffen werden beim Laden vollautomatisch zugeordnet. Grip, Schadenswürfel und Krit-Bereich werden dynamisch über Getter aufgelöst.
* **Kompaktes UI-Layout:**
  - Die Dropdowns für Grip, Würfel und Krit-Bereich wurden aus der Hauptzeile entfernt.
  - Die Eigenschaften werden nun als statischer Text (z. B. `1H • 1w8 • 19-20/x2`) mit verbesserter, vergrößerter Schriftgröße (`8.5px` statt `7px`) dargestellt, um die Lesbarkeit am Spieltisch deutlich zu erhöhen. Bei aktivem *Verbesserter Kritischer Treffer* oder *Scharf* wird der verdoppelte Krit-Wert sofort visualisiert.
* **Autocomplete-Overrides via `<datalist>`:**
  - Im Detail-Drawer (Zahnrad-Icon) stehen nun Eingabefelder mit Standard-Vorschlägen für Schadenswürfel und Krit-Werte zur Verfügung. Sie bieten Autocomplete-Komfort, erlauben aber auch die Eingabe völlig freier Werte (wie z. B. `13-20 / x2`).
* **Vollautomatische Talent-Verzahnungen (Feats):**
  - **Verbesserter Kritischer Treffer**: Verdoppelt automatisch den Bedrohungsbereich (z. B. `19-20` zu `17-20`), stapelt sich nicht mit *Scharf (Keen)*.
  - **Bögen & Kompositbögen**: Für Talente wie *Waffenfokus* werden normale Bögen und Komposit-Bögen automatisch gleichgesetzt.
* **Automatisierte Fernkampf-Stärkeregeln:**
  - **Armbrüste**: +0 Stärkeschaden (isoliert).
  - **Bögen**: Nur negative Stärke wird übertragen (Strafen).
  - **Kompositbögen**: Stärkeschaden bis zur Stärkebewertung (Rating). Bei unzureichender Stärke wird ein -2 Angriffs-Malus berechnet und die tatsächliche Stärke auf den Schaden angewendet.
* **Drawer-Persistenz-Bugfix (Zahnrad-Klicks & Stabile IDs):**
  - Behebung des Fehlers, bei dem sich der Einstellungs-Reiter (Drawer) einer Waffe beim Verlassen eines bearbeiteten Feldes (Blur/Change) schloss.
  - Einführung persistenter, eindeutiger IDs (`Weapon.id`) und Serialisierung derselben zur dauerhaften Identifikation von Waffeneinträgen auch nach Klonen, Re-Renderings und Netzwerksynchronisation.
  - Abwärtskompatibilität durch dynamischen WeakMap-Fallback in der UI (`w.id || getWeaponRuntimeId(w)`).

### v2.4.7 — Bugfix: Spieler-Duplikate auf dem DM-Screen
* **In-Place Update für Beispieldaten:**
  - Klicks auf „Beispieldaten“ überschreiben den aktiven PC nun in-place unter Beibehaltung seiner originalen ID.
* **Vollständige Zustands-Synchronisation bei Import:**
  - Beim Importieren und Laden von Beispieldaten wird nun `pc_changed` mit der Option `{ forceFullSync: true }` gefeuert, um den Host-Diff-Cache zu leenern und ein vollwertiges Update zu senden.
* **DM-Safeguards:**
  - `getActivePC()` liefert auf Host-Seite nun `null` zurück, um das Entstehen von Phantom-„Held"-Charakteren zu verhindern. Beim Starten einer DM-Session wird ein eventueller lokaler PC rückstandslos bereinigt.

### v2.4.6 — Zustände komplett entfernt & DM +Temp Support
* **Bereinigung der Zustände-UI (Conditions):**
  - Der `🎭 Zustände`-Trigger-Button, das Conditions-Drawer-Markup und die Zustands-Spalte auf dem DM-Bildschirm wurden vollständig entfernt.
* **Direkter DM +Temp Support & Visualisierung:**
  - Ein direkter `+Temp`-Button wurde neben den Schaden-/Heilen-Steuerungen des DMs hinzugefügt. Aktive temporäre Trefferpunkte werden blau als `(+X)` (z.B. `12 / 12 (+5)`) angezeigt.

### v2.4.5 — Diablo-artige Lebenspunkteblase (HP Globe)
* **Fluid-Animationen & 3D-Glasglanz:**
  - Skalierung auf kompakte 110px Durchmesser mit metallischem Rahmen.
  - Horizontal rotierende, entgegengesetzt fließende SVG-Wellenpfade (Parallax-Effekt).
  - Cyanfarbener/blauer Wellen-Layer für Temp HP direkt über dem roten Level.
* **Interaktives Kontrolldeck (Pedestal):**
  - Direkte HP-Bearbeitung per Tastatureingabe.
  - Buttons für `- Schad.`, `+ Heil.`, `+ Temp` sowie Checkboxen für `Halbiert` und `Doppelt`.
* **Intelligentes Toggling:**
  - Automatisches Ausblenden des kleinen Widgets oben rechts, wenn sich der Spieler auf dem Reiter "Übersicht" befindet.

### v2.4.0 — D&D 3.5e Fertigkeitensystem (Skills)
* **Klassenfertigkeiten & Ränge-Limits:**
  - Integration von 41 Standard-Fertigkeiten aus dem PHB in `skills-data.js`.
  - Stufenbasierte Grenzwertprüfung der Ränge: `Stufe + 3` für Klassenfertigkeiten, `(Stufe + 3) / 2` für klassenübergreifende Fertigkeiten.
* **Modifikator- & Synergie-Kalkulation:**
  - Berechnung der Summe aus Rängen, Attributsmodifikator, sonstigen Boni und Synergieboni ab 5 Rängen.
* **PCSkillsTab-Komponente:**
  - Live-Suche und Schnellfilter.
  - Scrollbereich (`max-height: 420px`).
  - Würfel-Button (🎲) zur direkten Ausführung eines Skill-Checks mit detailliertem Breakdown.

### v2.3.0 — Tabbed-Dashboard Layout & Refactoring
* **Tabbed Interface:**
  - Restrukturierung der rechten Spalte in Pergament-Tabs (Übersicht, Skills & Talente, Waffen, Zauberbuch, Klasse & Begleiter).
* **Zweispaltiges Grid-Layout:**
  - Übersicht: Attribute (links) und Defenses (rechts).
  - Skills & Talente: Skills (links) und Talente (rechts).
  - Waffen: Waffenkammer (links) und Ausrüstung (rechts).
  - Zauberbuch: Zauberslots (links) und Kompendium (rechts).
* **Zauberslots-Kompaktierung:**
  - Darstellung der Zauberkugeln (🔮) in einer einzigen, sauberen horizontalen Reihe ohne Zeilenumbruch.

---

### v2.2.0 — Netzwerk-Sync v2.0
* **Delta-Protokoll statt Full-Object-Floods:**
  - Anstelle des kompletten 100KB großen State-Objekts werden bei Änderungen nun minimale Pfad-basierte Diffs (`pc_diff` und `state_diff`) von ca. 50-100 Byte übermittelt.
  - Das spart massiven Netzwerk-Traffic und schont mobile Akkus.
* **Relative HP-Events (Race-Condition-Schutz):**
  - HP-Änderungen werden als relative Events (`hp_change`) übertragen und angewendet, anstatt absolute HP-Werte hart zu überschreiben. Dadurch gehören überschriebene Heilungen/Schadenspunkte der Vergangenheit an.
* **Focus-Preservation Engine (Fokus-Schutz):**
  - Beim Aktualisieren des DOMs durch eintreffende Netzwerkpakete wird das aktive Formularfeld samt Cursor-Position gesichert und direkt wiederhergestellt. Spieler können ungestört tippen.
* **MessageQueue (Offline-Puffer & Debouncing):**
  - Schnelle Änderungen (z.B. Eingaben im Namenfeld) werden um 250ms verzögert (debounced), um unnötige Paket-Fluten zu drosseln.
  - Bei kurzen Verbindungsunterbrechungen werden Pakete lokal zwischengespeichert und beim Reconnect automatisch gesendet.
* **ConnectionMonitor (Latenz-Anzeige):**
  - Ein 5-sekündiger Heartbeat-Ping misst die Verbindungsqualität.
  - Ein pulsierender Indikatorpunkt im Multiplayer-Button (🟢 grün, 🟡 gelb, 🔴 rot) signalisiert in Echtzeit den Verbindungsstatus.
* **Version Handshake (Kompatibilität):**
  - Verhindert Fehlverhalten durch inkompatible Versionen. Falls abweichende App-Versionen joinen, fordert die App den Client per Popup-Hinweis zum Neuladen (F5) auf.
* **Beseitigung von blockierenden Browser-Alerts:**
  - Alle blockierenden `alert()`-Aufrufe wurden durch das hauseigene, edle `showCustomAlert()` System ersetzt.

### v2.1.2 — Talente- & Feats-System (Roadmap zu v3.0.0)
* **Komplettes D&D 3.5e Talente-System (Feats):**
  - **Neuer Reiter "Talente"** im Dashboard: Zeigt eine linke Spalte mit den erlernten Talenten und eine rechte Spalte mit dem durchsuchbaren und filterbaren Kompendium aller ca. 80 RAW PHB-Talente.
  - **Prüfung und Blockieren von Voraussetzungen:** Berechnet im Hintergrund für jedes Talent die D&D 3.5e Voraussetzungen (Grundangriffsbonus (BAB), Attribute, Charakterstufe, Zaubererstufe oder andere benötigte Talente). Ist eine Voraussetzung nicht erfüllt, wird das Talent im Kompendium ausgegraut, mit einem Schloss-Icon blockiert und kann nicht erlernt werden.
  - **Hierarchische Einrückung für Talent-Bäume:** Um absolute Übersicht zu bewahren, werden Kind-Talente (z. B. *Rundumschlag (Cleave)* unter *Heftiger Angriff (Power Attack)*) erst dann im Kompendium eingeblendet und eingerückt dargestellt, wenn der Spieler das jeweilige Eltern-Talent tatsächlich erlernt hat.
  - **Klassen-Bonustalente-Highlight (Grüner Rahmen):** Wenn der Charakter mindestens 1 Stufe in einer Klasse besitzt, für die bestimmte Talente als Bonus wählbar sind (z. B. Kampftalente für Kämpfer/Mönche, Metamagic/Item Creation für Magier), werden diese im Kompendium mit einem auffälligen, edlen grünen Rahmen hervorgehoben. Eine detaillierte Legende am Kopf der Tabelle erklärt die Rahmenbedingungen.
  - **Optionen-Auswahl bei Erwerb:** Talente wie *Waffenfokus*, *Zauberfokus* oder *Fertigkeitsfokus* blenden im Erwerbs-Dialog automatisch ein passendes Dropdown-Menü (z. B. Waffenliste, Magieschulen, Fertigkeiten) ein, sodass der Spieler die genaue Spezialisierung angeben kann. Diese Spezialisierung wird mitspeichert und im Bogen angezeigt.
  - **Parchment Scroll Details Dialog:** Klickt man auf ein Talent (egal ob erlernt oder gesperrt), öffnet sich ein edles, scrollbares Pergament-Scroll-Popup, das die RAW-Beschreibungen (Vorteil, Normal, Spezial), die erfüllten/nicht-erfüllten Voraussetzungen in farblicher Kennzeichnung und die genauen App-Effekte auflistet.
  - **Automatische Werte-Modifikatoren:**
    - Rettungswurf-Boni (*Große Zähigkeit*, *Blitzschnelle Reflexe*, *Eiserner Wille*) werden automatisch auf Zähigkeit, Reflex und Willenskraft aufgerechnet und in der Roll-Aufschlüsselung detailliert angezeigt.
    - HP-Boni (*Zähigkeit (Toughness)*, stapelbar) erhöhen automatisch die maximalen und aktuellen Trefferpunkte um 3.
    - Waffen-Talente (*Waffenfokus*, *Waffenspezialisierung*, *Mächtiger Waffenfokus*, *Große Waffenspezialisierung*) berechnen auf Basis der gewählten Waffe und des Talentnamens automatisch den Angriffs- (+1/+2) und Schadensbonus (+2/+4) und binden ihn direkt in die Waffenschaltflächen sowie Roll-Breakdown-Dialoge ein.
    - Fernkampftalente (*Nahschuss (Point-Blank Shot)*) schlagen für Fernkampfwaffen vollautomatisch +1 Angriff/Schaden auf.
    - Tägliche Bonus-Fähigkeiten (*Zusätzliches Vertreiben (Extra Turning)*, *Zusätzliche Bardenmusik (Extra Music)*, stapelbar) addieren automatisch +4 Slots auf die jeweiligen täglichen Ladungen.
* **Offline-Service-Worker Cache-Bump:** Inkrementierung auf `dnd-combatsheet-v2.1.1-cache-v33` zur sofortigen Offline-Verteilung aller Regel- und UI-Feats-Ressourcen.

### v2.1.1 — Bugfix-Release "The Polish v2.1.1"
* **Behebung von PC-Duplikaten beim Bogen-Import (Bug 1):**
  - Wenn ein Spieler manuell ein Charakter- oder Begegnungsblatt hochlädt, während er mit einer Online-Sitzung verbunden ist (als Client), wird der geladene PC unter Beibehaltung seiner bestehenden WebRTC-ID in den aktiven Charakterbogen kopiert. Dadurch wird verhindert, dass auf dem DM-Bildschirm zwei Kopien desselben Spielers entstehen.
  - Der Import überschreibt in einer aktiven Client-Sitzung nicht mehr die Encounter-Daten des Spielleiters.
* **Dynamische DEX-Modifikator AC-Skalierung & Initiative Sortier-Sync (Bug 2):**
  - Der Geschicklichkeitsmodifikator (DEX-Mod) wird nun in `rebuildStatModifiers()` automatisch auf `ac` (AC), `acTouch` (Touch AC) und falls negativ auf `acFlat` (Flat-footed AC) angewendet.
  - Wenn ein Spieler seine Geschicklichkeit ändert, skaliert seine Rüstungsklasse sofort mit.
  - Behebung von Rückkopplungsschleifen beim manuellen Editieren von Werten im UI durch automatischen Abzug bestehender Modifikatoren von der eingegebenen Basis.
  - Hinzufügen eines gewürfelten Initiative-Eingabefelds (`Gewürfelt` / `pc.init`) im Spieler-Initiative-Block. Jede manuelle Änderung oder Modifikatoränderung stößt auf dem DM-Screen sofort eine automatische Neu-Sortierung der Initiativleiste an.
* **Echtzeit-Synchronisation von TP-Änderungen (Bug 3):**
  - Modifikationen an aktuellen TP, maximalen TP, temporären TP und Zuständen über die Buttons des Spieler-Bogens feuern nun sofort das `'pc_changed'`-Event, wodurch die Änderungen verzögerungsfrei an den Spielleiter gesendet und auf dem DM-Bildschirm geupdated werden.
* **Formatierungs-Korrektur der Bardenmusik (Bug 4):**
  - Die Lieder-Beschreibungen im Bardenmusik-Kompendium wurden mit Zeilenumbrüchen (`<br>`) und Fettungen (`<strong>`) formatiert, um aneinandergereihte Fließtexte aufzulösen.
  - Markdown-Sterne (`**` und `*`) in den Alert-Popups beim Singen wurden durch native HTML-Tags ersetzt, um eine korrekte Inline-Formatierung zu garantieren.
* **Scroll-Erhaltung im Ressourcen-Tab (Bug 5):**
  - Beim Hinzufügen oder Lernen von Zaubern aus dem Kompendium wird die vertikale Scroll-Position der Zauberlisten vor dem Redraw zwischengespeichert und danach wiederhergestellt, was störende Sprünge an den Seitenanfang verhindert.
* **Fix Verbindungsaufbau-Crash (NetworkManager):**
  - Behebung eines JavaScript-Laufzeitfehlers beim Verbindungsaufbau auf Spielerseite. Der Client sendet nun beim Herstellen der WebRTC-Verbindung sein Charakterblatt direkt via `sendToHost` an den Spielleiter (statt des Aufrufs einer veralteten Methode `CombatState.syncPCToHost()`).
* **Fix "You Died"-Overlay Crash (Bug 6):**
  - Behebung eines `TypeError`-Absturzes, wenn die TP eines Charakters unter -10 fielen. Die Methode `syncPCToHost` wurde in `PCManager.js` exportiert und im zentralen Fassadenmodul `state.js` ordnungsgemäß zu `CombatState` hinzugefügt, sodass das "You Died"-Overlay die Synchronisation fehlerfrei triggern kann.
* **Neuer Antigravity Action Tracker (Fehler-Diagnose):**
  - Implementierung eines ressourcenschonenden Aktionstrackers in `js/app.js`. Dieser loggt nur im tatsächlichen Fehlerfall die exakte letzte ausgeführte Methode (z. B. `CombatState.applyDamage(...)` mit allen übergebenen Parametern) in der Browser-Konsole. Dies ermöglicht das präzise Debuggen ohne aufgeblasene Logdateien im Normalbetrieb.
* **Klassen- & Stufenbasierter Zaubergrad-Filter im Kompendium (Bug 8):**
  - Wenn die Option "Nur passende Zauber für meine Klasse & Stufe anzeigen" aktiviert ist, filtert das Dropdown-Menü der Zaubergrade nun dynamisch alle Grade heraus, die der Charakter laut D&D 3.5e RAW (basierend auf seinen Klassenstufen) noch gar nicht oder prinzipiell gar nicht wirken kann (z. B. Paladin/Ranger max. Grad 4 auf Stufe 20; Kleriker Stufe 1 max. Grad 1).
  - Falls der aktuell ausgewählte Filtergrad durch einen Klassenwechsel oder das Aktivieren des Filters ungültig wird, setzt das System den Filter automatisch sauber auf "Alle" zurück.
* **Automatische Session-Wiederherstellung bei Seiten-Reload (Bug 9):**
  - Behebung des Problems, dass nach einem harten Seiten-Reload (z. B. via Strg+F5) die WebRTC-Synchronisation stumm abbrach, obwohl das UI fälschlicherweise "Verbunden" signalisierte.
  - Das System überprüft nun beim App-Start in `js/app.js` den geladenen LocalStorage-Zustand und baut eine zuvor aktive Netzwerkverbindung (Host oder Client) automatisch im Hintergrund wieder auf.
* **Offline-Service-Worker Cache-Bump:** Inkrementierung auf `dnd-combatsheet-v2.1.1-cache-v32` zur sofortigen Verteilung aller Korrekturen.




### v2.1.0 — Release "The Architect v2.1.0"
* **System-Refactoring & Modularisierung (God-File `state.js` dekomponiert):**
  - **4-Schichten-Architektur:** Aufteilung der über 1.150 Zeilen großen `state.js` in eigenständige Module unter `js/state/` und `js/rules/`.
  - **State-Kern (`js/state/state-core.js`):** Enthält die Single Source of Truth für den In-Memory-Zustand sowie Kern-Getters/Setters.
  - **Storage-Manager (`js/state/StorageManager.js`):** Kapselt die `localStorage`-Hydrierung und Persistenz.
  - **PC-Manager (`js/state/PCManager.js`):** Übernimmt alle spielerbezogenen Aktionen, Mutationen und Berechnungs-Trigger.
  - **Encounter-Manager (`js/state/EncounterManager.js`):** Steuert die DM-Initiativeleiste, Kampfrunden, TP-Abzüge und Zustände.
  - **Fassaden-Kompatibilität (`js/state.js`):** Die ursprüngliche Datei dient als Facade-Schnittstelle, die alle Module importiert und re-exportiert. 100 % abwärtskompatibel für alle bestehenden 25 Dateien, ohne dass Import-Pfade angepasst werden müssen.
* **Pub/Sub Event Bus (`StateEvents`):**
  - Einführung eines echten, entkoppelten Ereignissystems (`StateEvents`) in `state-core.js`.
  - UI-Komponenten und der `NetworkManager` können reaktiv auf spezifische Zustandsänderungen hören, was den Weg ebnet, Fokus-Verlust bei Echtzeit-Rendering zu verhindern.
* **D&D 3.5e Rechner & Klassenspezifische Regeln (`js/rules/`):**
  - **Regel-Klassenkapselung (`js/rules/classes/`):** Jede der Klassen besitzt nun ein eigenes Regelmodul (z. B. `BarbarianRules.js`, `MonkRules.js` etc.), das die `cleanup`-Logik und stufenbasierte tägliche Ressourcenberechnung vollständig übernimmt.
  - **Zentrale Rechner (`js/rules/`):** Die Berechnungen für BAB (`BABCalculator.js`), Rettungswürfe (`SaveCalculator.js`) und Zauberslots (`SpellSlotCalculator.js`) wurden in dedizierte, reine Regel-Rechner ausgelagert.
* **Skalierungs-Verbesserungen (RAW-Regelkonformität):**
  - **Barbaren-Wut (Rage):** Skaliert nun dynamisch auf Basis der Barbarenstufe (Standard-Wut bei Level 1, Mächtige Wut / Greater Rage mit +6 Str/Con/Will und +3 HP/Stufe ab Level 11, Gewaltige Wut / Mighty Rage mit +8 Str/Con/Will und +4 HP/Stufe ab Level 20).
  - **Mönchs-Schadenswürfel:** Der waffenlose Mönchsschaden wird automatisch und dynamisch anhand der Mönchsklasse berechnet (1w6 bis 2w10) und in der Waffenkammer reaktiv angezeigt.
* **PWA Offline-Bereitschaft:**
  - Der Service-Worker (`service-worker.js`) wurde auf die Version `dnd-combatsheet-v2.1.0-cache-v27` inkrementiert und um alle 18 neuen Regel-, Rechner- und Zustandsklassendateien ergänzt, um vollständigen Offline-Support auf Tablets zu gewährleisten.

### v2.0.0 — Major Release "The Combatant v2.0"
* **Hexenmeister-Klassenfeatures & Vertrauenspartner-Bogen:**
  - **Neuer Vertrauten-Reiter (`Vertrauter 🦇`):** Im PC-Ressourcen-Dashboard wird dynamisch ein neuer Reiter eingeblendet, sobald der Charakter Hexenmeister/Magier ist oder einen Vertrauten aktiv hat. Hierüber können Begleiter gerufen, benannt und verwaltet werden.
  - **Werte-Autopopulation (D&D 3.5 RAW):** Berechnet automatisch die Vertrauten-TP (exakt die Hälfte der Meister-TP), RK (inkl. stufenbasiertem natürlichen Rüstungsbonus), Intelligenz, Angriffe (basierend auf Meister-BAB und Dex/Str des Tiers) und Rettungswürfe (Meister-Basis vs. Tier-Minima).
  - **Meister-Attribut-Boni:** Appliziert automatisch passive Modifikatoren auf den Meister (Kröte: +3 max TP, Ratte: +2 Zähigkeit, Wiesel: +2 Reflex) direkt in `rebuildStatModifiers()`.
  - **Klassendetails-Erweiterung:** Hexenmeister-Klassenkarte mit `[Regeln 📖]` buttons für spontanes Zaubern, Eschew Materials feat und Vertrautenregeln (inkl. EP-Verlustwarnungen).
* **Klassen-Dekompositions-Sicherheit (Class Bleed Cleanup & Warnung):**
  - **Bestätigungs-Dialog:** Beim Klick auf das `✕` zum Entfernen einer Klasse im Multiclass-Manager wird ein Warnungs-Popup eingeblendet.
  - **Bleed Cleanup Engine:** Löscht beim Entfernen einer Klasse sofort alle zugehörigen temporären/aktiven Daten (z. B. Entlassen von Vertrauten/Tierbegleitern, Beenden von Kampfrausch, Löschen von Monk-Ki-Fähigkeiten, Deaktivieren von Göttlicher Gnade), um mathematische Lecks und Anzeigefehler zu verhindern.
* **Waldläufer-UI-Textbereinigung:**
  - Die Bezeichnung "Effektive Druidenstufe" wurde im Tierbegleiter-Header und in den Waldläufer-Klassendetails durch "Begleiter-Stufe" ersetzt, um Verwirrung bei reinen Waldläufern zu vermeiden.
* **PDF-Regel-Extraktion & Text-Datenbank:**
  - Der gesamte Text der 21 MB großen `playershandbook_35e.pdf` wurde in eine schlanke, performante Textdatei extrahiert (`playershandbook_35e.txt` mit 49.953 Zeilen).
  - Erstellung eines lokalen Suchskripts `search_rules.js` zur sekundenschnellen Abfrage von Regeln im Terminal. Die schwere PDF-Datei wurde aus dem Projekt entfernt, um Kontext-Verlangsamungen komplett zu unterbinden.

### v1.11.7 — Waldläufer-Klassenfeatures & Tierbegleiter-Stufenkorrektur (D&D 3.5 RAW)
* **Regel-Erklärungsknöpfe (`[Regeln 📖]`):**
  - Hinzufügen von Regelknöpfen direkt neben dem Erzfeind-Bereich, der Kampfstil-Auswahl, dem Wilden Mitgefühl sowie den passiven Klassenfähigkeiten des Waldläufers.
  - Ein Klick auf die Knöpfe öffnet informative deutsche D&D 3.5e RAW Erklärungen.
* **Erzfeind-Korrektur (Favored Enemy):**
  - Der Erzfeind-Bonus wurde regelkonform (D&D 3.5 RAW) korrigiert: Er gilt **nicht** mehr für Angriffswürfe (Trefferwürfe), sondern ausschließlich für **Waffenschadenswürfe** und spezifische Fertigkeiten (Bluffen, Entdecken, Lauschen, Motiv erkennen und Überleben). Die UI-Beschriftung wurde entsprechend korrigiert.
* **Interaktive Kampfstil-Auswahl (Combat Style):**
  - Waldläufer ab Stufe 2 können ihren Kampfstil (Bogenschießen / Archery oder Zwei-Waffen-Kampf / Two-Weapon Combat) über ein Dropdown einstellen.
  - Das System listet je nach Stufe (2, 6, 11) dynamisch die erworbenen Bonus-Talente auf (z. B. *Rapid Shot* / *Two-Weapon Fighting* auf Stufe 2, *Manyshot* / *Improved Two-Weapon Fighting* auf Stufe 6 etc.).
  - Die UI warnt vor der Rüstungsbeschränkung (Talente sind nur in leichter/keiner Rüstung aktiv).
* **Wildes Mitgefühl (Wild Empathy):**
  - Einbindung einer physischen Wurf-Anleitung (`d20 + Waldläuferstufe + CHA-Mod`) zur Interaktion mit Tieren, inklusive Bestien-Regel (-4 Abzug für magische Bestien) und SG-Referenztabelle im Alert.
* **Tierbegleiter-Stufe & Waldläufer-Zauberstufe:**
  - Die effektive Druidenstufe für Waldläufer-Tierbegleiter wird im Begleiter-Bogen nun regelkonform als **Hälfte der Waldläuferstufe** (`Waldläufer-Stufe / 2`, abgerundet, ab Stufe 4) berechnet und im Header angezeigt (z. B. `🐾 Gefährten- & Tierbegleiter-Bogen (Effektive Druidenstufe: 4)`).
  - Ebenso wird die Waldläufer-Zauberstufe (Caster Level) im Features-Tab als `Waldläufer-Stufe / 2` angezeigt.

### v1.11.6 — Mönchs-Klassenfeatures & Schlaghagel-Berechnung (D&D 3.5 RAW)
* **Regel-Erklärungsknöpfe (`[Regeln 📖]`):**
  - Es wurden Regelknöpfe direkt neben dem Sturmangriff-Toggle (Flurry of Blows) und den täglichen Ki-Fähigkeiten (*Joch des Geistes (Abundant Step)* ab Stufe 12, *Zitternde Hand (Quivering Palm)* ab Stufe 15, *Unbefleckter Körper (Empty Body)* ab Stufe 19) integriert.
  - Ein Klick auf diese Knöpfe öffnet eine formschöne, einklappbare Custom-Alertbox mit der deutschen Übersetzung der D&D 3.5e RAW Regeln für die jeweilige Fähigkeit.
  - Der Zähigkeitsrettungswurf-SG (DC) für die *Zitternde Hand* wird dynamisch berechnet (`10 + 1/2 Mönchsstufe + Weisheits-Modifikator`) und formatiert angezeigt (z. B. `SG 20` basierend auf der aktuellen Stufe und dem Weisheitsmodifikator des Charakters).
* **Flurry of Blows Angriffs- & Schadensberechnung (RAW 3.5e):**
  - **Mönchswaffen-Filter:** Die Angriffsmodifikatoren und Zusatzangriffe bei aktivem Sturmangriff werden nur auf waffenlose Schläge oder spezielle Mönchswaffen (*Kama, Nunchaku, Kampfstab, Sai, Shuriken, Siangham*) angewendet. Standard-Waffen wie Langschwerter bleiben unbeeinflusst.
  - **Waffenlos (unarmed) Grip-Typ:** In das Grip-Typ Dropdown wurde die Option `"Waffenlos"` (unarmed) integriert. Dies erlaubt es Spielern, Waffen bzw. Angriffe explizit als waffenlose Schläge zu deklarieren.
  - **Automatisierte Schadenswürfel für waffenlose Mönchsschläge:** Bei Auswahl des Grip-Typs "Waffenlos" berechnet das System bei Charakteren mit Mönchsstufen den Schadenswürfel automatisch gemäß der D&D 3.5 RAW Tabelle (Stufe 1-3: `1W6`, 4-7: `1W8`, 8-11: `1W10`, 12-15: `2W6`, 16-19: `2W8`, 20+: `2W10`). Die neuen Würfelkombinationen (`2W8` und `2W10`) wurden ebenfalls im Würfel-Dropdown freigeschaltet.
  - **Angriffs-Abzüge:** Bei aktivem Sturmangriff wird der Abzug je nach Mönchsstufe auf alle Angriffe berechnet: Stufe 1-4: `-2`, Stufe 5-8: `-1`, Stufe 9+: `0`.
  - **Extra-Angriffe (Verbesserter Schlaghagel / Greater Flurry):** Fügt automatisch den bzw. die Extra-Angriffe mit dem höchsten BAB hinzu: **1 Extra-Angriff** für Stufen 1-10; **2 Extra-Angriffe** für *Verbesserten Schlaghagel* ab Stufe 11.
  - **Stärke-Schadensmodifikator:** Bei aktiviertem Sturmangriff wird der Stärkemodifikator für den Schaden auf exakt `1.0x STR` festgesetzt (sowohl für einhändige, zweihändige als auch Schildhand-Mönchswaffen sowie Wurfwaffen wie Shuriken). Der Schadensmodifikator wird mit `STR (Flurry 1.0x)` beschriftet.

### v1.11.5 — Barden-UI Finalisierung & Bardenwissen Veredelung
* **Garantierte 2 Reihen Bardenmusik:**
  * Das Notensymbol-Layout für die Bardenmusik-Ladungen wurde von Flexbox auf ein mathematisch gesteuertes CSS Grid umgestellt. Es berechnet dynamisch die Spaltenanzahl als die Hälfte des Maximums (`Math.ceil(musicMax / 2)`) und schaltet jegliche Ränder aus. Dadurch werden die Notenblasen nun bei jedem Level (auch bei Stufe 20 mit 20+ Ladungen) garantiert auf exakt zwei Reihen aufgeteilt.
* **Beseitigung des inneren Scrollbalkens der Musikliste:**
  * Der innere Scrollbalken des Bardenlieder-Kompendiums (`.bard-songs-list`) wurde vollständig entfernt, indem die feste Höhenbegrenzung gelöscht wurde. Die Lieder fließen nun natürlich in voller Länge auf der Klassen-Features-Seite, was doppelte, verschachtelte Scrollbalken komplett eliminiert.
* **Premium Bardenwissen Infobox mit physischer Wurf-Anleitung:**
  * Das Bardenwissen-Popup wurde visuell grundlegend überarbeitet, um dem Magier-Zauber-Look zu entsprechen. Es listet nun die Kernattribute (Klasse, Fähigkeit, Modifikator, Wurf-Art, SG-Bereich) übersichtlich auf, bietet eine stilvolle schattierte Kurzbeschreibung und eine strukturierte DC-Referenztabelle.
  * **Direkte Wurf-Formel:** Die physische Würfelformel (`d20 + Gesamtbonus`) inklusive der exakten Modifikator-Aufschlüsselung (`d20 + Bardenstufe (Bardenstufe) + [Wert] (Intelligenz-Modifikator)`) wird direkt und prominent in einer thematischen Box innerhalb des Alerts eingeblendet. Spieler würfeln weiterhin physisch am Tisch und vergleichen das Ergebnis direkt mit den in der Box aufgeführten Schwierigkeitsgraden (SG 10 bis SG 30). Eine automatische d20-Generierung wurde bewusst ausgelassen, um die physische Haptik des Spiels beizubehalten.

### v1.11.4 — Custom Popups Skalierung & Bard-UI Veredelungen
* **Skalierung der Custom-Overlays:**
  * Custom Alertboxen, Bestätigungs-Dialoge und Schriftrollen-Overlays (`.custom-alert-box`, `.custom-scroll-box`) wurden an das globale Zoom-System angebunden (`zoom: var(--app-zoom)`). Sie passen sich nun nahtlos der gewählten Zoom-Stufe an, um auf hochauflösenden PC-Monitoren perfekt lesbar zu bleiben.
* **"Fertig!" Schalter für Bardenlieder:**
  * Die Detailbeschreibungen beim Anstimmen von Bardenliedern wurden von `showCustomConfirm` (Ja/Nein Auswahl) auf ein modifiziertes `showCustomAlert` mit einem einzelnen, klaren `"Fertig!"`-Button umgestellt.
* **Beseitigung verschachtelter Scrollbalken & UI-Facelift im Barden-UI:**
  * Das Ladungs-Raster für Bardenmusik-Noten wurde verbreitert (`max-width: 170px`), sodass sich die Ladungen nun kompakt in **2 statt bisher 5 Reihen** anordnen und die vertikale Höhe drastisch reduzieren.
  * Die maximale Höhe des Lieder-Kompendiums (`.bard-songs-list`) wurde verdoppelt (auf `260px`).
  * Die maximale Höhe des allgemeinen Sektions-Reiters in `PCResources.js` wurde auf `520px` angehoben. Dadurch verschwinden störende doppelte Scrollbalken, und fast alle Lieder sind ohne Scrollen direkt sichtbar.

### v1.11.3 — Barbar-Kampfrausch Aktivierungs-Sperre
* **Sperrung bei 0 Ladungen:**
  * Der Button `🔥 Kampfrausch aktivieren!` wird nun automatisch deaktiviert (`disabled`) und ausgegraut, wenn der Barbar keine verbleibenden Kampfrausch-Ladungen für den Tag mehr besitzt (`remaining === 0`).
  * Der Mauszeiger ändert sich beim Überfahren des gesperrten Buttons regelkonform zu `not-allowed`.
  * Das Beenden des aktiven Kampfrauschs (`🔴 Kampfrausch beenden`) bleibt jederzeit möglich, auch wenn keine Ladungen mehr vorhanden sind.
  * Eine zusätzliche serverseitige Sicherheitsprüfung im Klick-Handler blockiert die Aktivierung auch auf Code-Ebene, falls die UI-Sperre umgangen wird.

### v1.11.2 — Barbar-Kampfrausch Anzeige-Erweiterung
* **Immer sichtbare Boni-Tabelle:**
  * Die Boni und Effekte des Barbaren-Kampfrauschs werden nun dauerhaft in einer formschönen, leicht lesbaren Tabelle unter dem Aktivierungs-Button auf der Barbaren-Klassenkarte angezeigt.
  * Ein farbiger Status-Indikator signalisiert auf einen Blick, ob der Kampfrausch aktiv (`Aktiv 🟢`) oder inaktiv (`Inaktiv ⚪`) ist.
  * Die Werte der Tabelle (Stärke, Konstitution, Willens-Rettungswurf, Rüstungsklasse und temporäre Trefferpunkte) werden bei aktivem Kampfrausch rot hervorgehoben.
  * Die Berechnung der temporären Trefferpunkte skaliert regelkonform dynamisch mit der Stufe des Charakters (`+2 TP pro Stufe`).

### v1.11.1 — Magier-Bannschulen Automatisierung
* **Interaktive Bannschulen-Dropdowns:**
  * Ersetzung der fehleranfälligen Textfelder durch intelligente `<select>`-Dropdowns.
  * Erkenntnismagie (Divination) und die eigene Spezialisierungsschule des Magiers werden regelkonform (D&D 3.5 RAW) von der Auswahl ausgeschlossen.
  * Das Auswählen einer Schule in einem Dropdown deaktiviert diese Option im anderen Dropdown, um fehlerhafte Doppel-Auswahlen zu verhindern.
* **Filterung im Kompendium:**
  * Wenn der Klassenfilter aktiv ist, werden Zauber aus Bannschulen automatisch aus der Kompendiums-Liste ausgeblendet.
* **Lern-Sperre & Dialog-Validierung:**
  * Das Hinzufügen von Zaubern der gewählten Bannschulen ins Zauberbuch ist nun gesperrt. Sowohl über den Schnell-Button `+ Buch` als auch im Schriftrollen-Detail-Dialog wird ein informatives Fehler-Popup angezeigt.
* **Automatische Zauberbuch-Bereinigung:**
  * Wenn die Spezialisierung oder eine Bannschule geändert wird, wird das Zauberbuch automatisch bereinigt. Bereits gelernte Zauber, die zu den neuen Bannschulen gehören, werden entfernt, und der Spieler erhält ein übersichtliches Bestätigungs-Popup mit der Liste der entfernten Zauber.

### v1.11.0 — Paladin, Kleriker & Magier Classfeature-Refactoring & Rettungswurf-Wachstums-Bugfix
* **Göttliche Gnade (Divine Grace) Interaktivität, Toggles & Infobox:**
  * Hinzufügen eines eleganten mittelalterlichen Aktivierungs-Buttons anstelle einer unästhetischen Standard-Checkbox.
  * Hinzufügen einer einklappbaren Regel-Infobox für Göttliche Gnade, die deren Effekte genau beschreibt.
  * Regelkonforme Begrenzung des Charisma-Bonus auf positive Werte (`Math.max(0, chaMod)`) gemäß D&D 3.5e ("Charisma bonus (if any)").
* **Rettungswurf-Wachstums-Bug behoben:**
  * Entfernen fehlerhafter Setter-Zuweisungen in `recalculatePCStats(pc)`, die bei jedem Durchlauf den Rettungswurf-Basiswert mit dem Gesamtwert überschrieben haben. Rettungswürfe werden nun vollkommen stabil und dynamisch durch ihre Klassen-Getter berechnet.
* **Detailliertes Rettungswurf-Breakdown & Basiswert-Korrektur:**
  * Das Eingabefeld "Basis" zeigt nun korrekt nur die reine, unmodifizierte Klassen-Basis (`baseZa.base` etc.) an.
  * Das Würfel-Breakdown (`showRollBreakdown`) listet jetzt alle aktiven Modifikatoren (z. B. "Göttliche Gnade" oder "Kampfrausch" auf Willenskraft) separat und sauber aufgeschlüsselt auf.
* **Hände auflegen (Lay on Hands) Regelkonformität:**
  * Lay on Hands wird erst ab Paladin-Stufe 2 freigeschaltet und erfordert einen Charismawert von mindestens 12.
  * Der maximale tägliche Heilungspool berechnet sich nun korrekt als `Paladin-Stufe * Charisma-Modifikator`.
* **Kleriker — Untote vertreiben (Turn Undead) Infobox:**
  * Hinzufügen einer eleganten, einklappbaren `[Regeln 📖]`-Infobox zur detailgetreuen Beschreibung der beiden Vertreibungs-Phasen (1. Vertreibungswurf (1W20 + Charisma-Mod) zur HD-Ermittlung und 2. Vertreibungsschaden (2W6 + Stufe + Charisma-Mod)).
* **Magier — Schul-Spezialisierung & Bannschulen (D&D 3.5 RAW):**
  * Umfassende Erweiterung der Spezialisierungsbox um direkt sichtbare, detaillierte Regeltexte zum Bonus-Zauberslot (Grad 1-9), zum Spellcraft-Lernbonus (+2) und den Restriktionen für Bannschulen.
  * Intelligente Formular-Kopplung: Die zweite Bannschule ("Bann 2") wird nun automatisch ausgeblendet, falls "Erkenntnis" (Divination) als Spezialisierung gewählt ist, da Erkenntnis-Magier laut Regelwerk nur 1 Bannschule aufgeben müssen.
* **Regel-Infoboxen & Optische Veredelung der Steuerelemente:**
  * Einbau von `[Regeln 📖]`-Buttons, die detaillierte, einklappbare Regelbeschreibungen (basierend auf den PDF-Regeltexten) für die Paladin- und Klerikerfähigkeiten anzeigen.
  * Vollständige optische Integration aller Regel-Schalter und der Plus-/Minus-Tasten für *Hände auflegen* in das Premium-Bronze-Design der Anwendung.
* **PWA Cache Bump auf v21-scaling-v9:** Aktualisierung des Offline-Caches im Service-Worker, damit alle Geräte die Anpassungen sofort laden.

### v1.10.3 — Clean-Architecture der täglichen Ressourcen, Premium-Auswahlpopup & Zauber-Click-Fix
* **Zentralisierte Ressourcen-Berechnung in `state.js`:**
  * Komplette Trennung von UI-Renderings und Zustandsänderungen. Alle täglichen Ressourcen und deren stufenabhängigen Maxima (z. B. Kampfrausch für Barbaren, Böses niederstrecken für Paladine, Tiergestalten für Druiden, Untote vertreiben für Kleriker, Bardisches Lied für Barden und Ki-Fähigkeiten für Mönche) werden nun vollautomatisch und transaktionssicher direkt in `recalculatePCStats()` berechnet.
  * Dies behebt den Fehler, bei dem nach Stufenänderungen alte Maxima im `localStorage` gespeichert blieben (wie z. B. die Limitierung auf 3 Tatzen auf Stufe 20).
* **Behebung von Render- & Event-Fehlern (Barde):**
  * Behebung eines kritischen JavaScript-Fehlers (`undefined reference`) in `BardFeatures.js` beim Hinzufügen der Bardenklasse durch Deklaration der fehlenden Variablen `extraMusic` und Absicherung des Zugriffs auf `musicAbility.max` durch die reaktiv berechnete Variable `musicMax`.
  * **Event Delegation & Transaktionssicherheit:** Umstellung der Bardenmusik-Klicks (Noten-Blasen, Singen-Buttons, Boni) auf das extrem robuste **Event Delegation-Verfahren** auf dem Karten-Container. Zudem Kapselung aller Zähler-Änderungen in atomare `updatePCBatch`-Transaktionen zur verlässlichen PeerJS-Synchronisation und Redraw-Resistenz.
* **Globales Zauberbuch- & Kompendium-Event-Delegation (Caster-Lösung):**
  * Da Zauber für Kleriker, Magier und Hexenmeister nicht sinnvoll in ein einzelnes Auswahlmenü gepackt werden können, haben wir eine **hochperformante globale Event-Delegation-Engine** direkt auf dem persistenten Container `#pcResources` in `player-sheet.js` implementiert.
  * Alle Interaktionen des Zauberbuchs (Slots einstellen, Blasen-Klicks, Zauber wirken, Zauber lernen, entfernen und löschen) werden nun über hocheffiziente Delegations-Schalter (`onclick`, `onchange`, `oninput` auf dem Eltern-Element) gesteuert.
  * Dies verhindert Speicherlecks, redundante Listener-Schleifen oder lost event handler beim Tab-Wechsel oder Neuzeichnen vollständig.
* **Behebung der nicht-klickbaren Zauberschaltflächen (Overlay- & Z-Index-Kollision):**
  * **Fehleranalyse:** Klicks auf die Schaltflächen „wirken“ oder „✕“ im Zauberbuch führten stattdessen zum Öffnen des Pergament-Detail-Overlays des entsprechenden Zaubers. Die Buttons wurden optisch nicht als interaktiv erkannt (kein Zeiger-Cursor) und reagierten nicht. Ursache waren ungeeignete Event-Reihenfolgen in der Delegation und eine visuelle Überlappung der Textfelder.
  * **Fehlerbehebung:**
    1. Die Event-Checks in der Delegation wurden umsortiert, sodass `.cast-spell-btn` und `.remove-spell-btn` vor der Prüfung auf `.view-spell-details-btn` abgefangen werden.
    2. Der Detail-Klick wurde mit einer Schutzbedingung versehen (`viewSpellBtn && !e.target.closest('button')`), damit Knopfelemente niemals das Detail-Overlay auslösen.
    3. CSS-Verbesserungen im Klassenblatt-Spaltensystem: Das Textfeld für den Zaubernamen wurde mit `flex: 1; overflow: hidden;` versehen, während der Button-Container mit `z-index: 1; position: relative;` in den Vordergrund gerückt wurde. Dies stellt den Hover-Effekt (pointer-cursor) wieder her und ermöglicht die ungestörte Klick-Erfassung.
* **Premium-Auswahl-Popup & Vereinfachtes Wild-Shape-UI:**
  * Beseitigung aller fehleranfälligen Knöpfe aus der Tier-Referenzliste unten.
  * Ein einziger waldgrün glühender Hauptknopf `🐾 In Tiergestalt verwandeln` öffnet bei Betätigung ein absolut hochwertiges mittelalterliches Auswahl-Popup mit wunderschön formatierten, interaktiven Tier-Karten (Wolf, Leopard, Braunbär).
  * Ein Klick auf die gewünschte Tierkarte führt eine atomare Transaktion durch: Zieht exakt 1 Ladung ab, führt den regelkonformen Stat-Override aus und aktualisiert die Ansicht fehlerfrei.
  * Ein roter Hauptknopf `🔴 Gestalt des [Tiers] beenden` stellt die humanen Werte mit 100%iger Sicherheit wieder her.
* **PWA Cache Bump auf v19:** Sukzessive Anhebung der Offline-Version in `service-worker.js` (über v17 und v18 bis v19), um sicherzustellen, dass alle Clients die neuen Klick-Event-Listener und CSS-Anpassungen sofort cache-frei und fehlerfrei laden.

### v1.10.2 — Druiden-Wild-Shape Event-Rebinding & Transaktionssicherheit
* **Unerreichbar robustes Event-Delegation-Verfahren:**
  * **Event Delegation:** Anstelle einzelner fragiler querySelector-Klicks wurde die gesamte Ereignissteuerung der Druidengestalt (Tatzen, Rückverwandlung, Verwandlung) auf ein einziges, performantes **Event Delegation-Verfahren** auf dem übergeordneten Karten-Container (`container`) umgestellt. Das macht die Buttons und Symbole 100% resistent gegen jegliche reaktive Neuzeichnung (Redraw) und Asynchronität.
  * **Datenschutz & Lokalisierungsresilienz:** Defensive Unterstützung sowohl für den deutschen Namen `"Tiergestalt"` als auch den englischen Namen `"Wild Shape"` bei importierten Charakterbögen inklusive automatischer Normalisierung.
  * **Zustandssicherheit:** Absicherung aller numerischen Datentypen und Klick-Ziele durch `Math.max`/`Math.min` und standardisierte Fallback-Werte bei leeren Speicherzuständen.
* **Transaktionssichere Zustandsänderung (updatePCBatch):** Alle Status- und Ressourcenänderungen (wie das Verbrauchen von Tiergestalt-Ladungen, das Hineingehen und das Verlassen der Gestalt) wurden vollständig in atomare `CombatState.updatePCBatch()`-Transaktionen gekapselt.
  * **Automatisierte Stat-Recalculations:** Jede Zustandsänderung triggert nun vollautomatisch `recalculatePCStats()`. Dies stellt sicher, dass alle physikalischen Attributänderungen sofort und fehlerfrei auf die Rettungswürfe (Zähigkeit, Reflex), Rüstungsklassen (Standard, Touch, Flat-Footed) und Modifikatoren im Speicher angewendet und live synchronisiert werden.
* **PWA Cache Bump auf v15:** Aktualisierung des Service-Workers zur Erzwingung eines sofortigen Client-seitigen Cache-Refreshes.

### v1.10.1 — "Local Storage bereinigen" Hard-Reset
* **Vollständiger Speicher-Reset (Hard-Reset):** Der inaktive Button `"Local Storage bereinigen"` im System-Optionen-Menü (FAB-Menü unten rechts) wurde voll funktionsfähig implementiert.
  * **Interaktiver Bestätigungs-Dialog:** Klicks auf den Button öffnen ein elegantes mittelalterliches Custom-Confirm-Fenster, das vor dem Löschen warnt, um versehentliches Datenverlust zu vermeiden.
  * **100% Bereinigung:** Bei Bestätigung wird der gesamte `localStorage` komplett geleert (`localStorage.clear()`) und die Seite sofort neu geladen (`window.location.reload()`). Dadurch wird ein absolut frischer Test-Zustand erzeugt.
* **PWA Cache Bump auf v13:** Aktualisierung des PWA-Service-Workers zur sofortigen Übernahme des aktualisierten Klick-Event-Handlers.

### v1.10.0 — Thematische Active-Emblems & Druiden-Polymorph-Engine (Wild Shape)
* **Visual Facelift (Thematische Klassen-Emblems):** Die veralteten, starren grauen Kreise für tägliche Fähigkeiten und Zauber wurden durch hochgradig interaktive, themenspezifische Unicode-Glow-Emoticons ersetzt (🔥 für Barbarenwut, 🎵 für Bardenlieder, 🌟 für Paladin-Smite, ☀️ für Kleriker-Vertreiben, 🐾 für Druidengestalt und 🔮 für Zauberslots). Freie Ladungen glühen in wunderschön abgestimmten HSL-Farben (z. B. leuchtendes Smaragdgrün für Druiden, tiefes Violett/Cyan für Magier), während verbrauchte Ladungen fließend in einen verblichenen, aschegrauen Stein-Look (`opacity: 0.25`) übergehen und ihre Größe reduzieren.
* **Aktive Druiden Wild-Shape Transformations-Engine (RAW-polymorph):** Ein voll funktionsfähiges, interaktives Verwandlungs-System für Druiden ab Stufe 5:
  * **Echtzeit-Stat-Overrides:** Beim Verwandeln in Wolf, Leopard oder Braunbär werden die physikalischen Attribute (Stärke, Geschicklichkeit, Konstitution) sowie die Rüstungsklasse (AC, Touch AC, Flat-Footed AC) sofort und regelkonform durch die Basiswerte der Tiergestalt überschrieben. Geistige Attribute (Int, Wis, Cha), Rettungswurf-Basiswerte und der Basisangriffsbonus (BAB) bleiben erhalten, während sich Zähigkeit, Reflex und Initiative vollautomatisch anhand der neuen Modifikatoren aktualisieren.
  * **Waffenkammer-Bypass & Natürliche Angriffe:** Normale Waffen werden bei aktiver Transformation ausgeblendet und durch formbezogene, schreibgeschützte natürliche Waffen (Bite, Claw, Rake) ersetzt (z. B. *Kralle (Braunbär) +11 (1w8+8)* und *Biss (Braunbär) +6 (2w6+4)*). Diese verfügen über direkt klickbare Wurf-Buttons, welche die D&D 3.5e RAW Berechnungen instantan als Pergament-Kampfbanner ausgeben.
  * **Fehlerfreie Reversion & Transaktions-Sicherheit:** Ein prominentes rotes Banner `"🔴 Gestalt beenden"` erlaubt es, die Transformation jederzeit zu beenden. Die ursprünglichen humanen Attribute werden absolut verlustfrei aus dem Transient-Modell (`originalStats`) wiederhergestellt.
  * **WebRTC DM-Screen Live-Sync:** Jede Stat-Änderung schreibt sich instantan in den LocalStorage und synchronisiert sich per PeerJS-P2P live zum Spielleiter-Bildschirm!
  * **Transaktions-Absicherung:** Hinzufügen robuster try-catch Blöcke und expliziter `parseInt` Typisierungen für alle Klick-Aktionen im Klassenmodul, um jeglichen Focus-Verlust oder mathematische Berechnungs-Inkonsistenzen auszuschließen.
* **PWA Cache Bump auf v12:** Erhöhung des CACHE_NAME auf `dnd-combatsheet-v12` zur fehlerfreien Offline-Nutzung aller neuen Transformationen.

### v1.9.0 — Clean-Architecture Refactoring, Tab-Dashboard & Tierbegleiter
* **Großflächiges Clean-Architecture-Refactoring (SOLID/OCP):** Umgestaltung der ehemals 146 KB großen God-Klasse `player-sheet.js` durch Einführung des **Strategy-Patterns** (Entwurfs-Muster für Klassen-Features). Die Datei schrumpft um über 1300 Zeilen und ist nun hochgradig modular, wartbar und resistent gegen Codebreaks.
* **Polymorphe Klassenkomponenten:** Jedes D&D 3.5e Klassenfeature wurde vollständig gekapselt und in eine eigenständige Moduldatei unter `js/ui/components/class-features/` ausgelagert (z. B. `GeneralFeatures`, `BarbarianFeatures`, `BardFeatures`, `PaladinFeatures`, `ClericFeatures`, `MonkFeatures`, `RogueFeatures`, `DruidFeatures`, `RangerFeatures`, `WizardFeatures`, `SorcererFeatures`). Jede Klasse regelt ihr Rendering, Event-Binding und New-Day-Aktionen komplett autark.
* **Unified Desktop & Tablet Tabbed Dashboard:** Restrukturierung des rechten Spaltenpanels (`#pcResources`) in ein elegantes, pergamentfarbenes Tabbed Interface (`⚔️ Klassen-Features`, `🔮 Zauberbuch`, `📖 Kompendium`, `🐾 Tierbegleiter`). Beseitigt jegliche verschachtelten Scrollbalken (Scroll-in-Scroll) und doppeltes Scrollen. Perfekt optimiert für Notebooks sowie Touch- und S-Pen-Ziele auf dem Galaxy Tab S6 Lite (Hoch- und Querformat).
* **Interaktiver Tierbegleiter-Bogen (`CompanionSheet.js`):** Ein vollwertiger Mini-Charakterbogen speziell für Gefährten (Wolf, Leopard, Braunbär, Custom) mit:
  * **Echtzeit-TP-Tracker & S-Pen-Taps:** Eigener TP-Schild mit Plus/Minus-Knöpfen zur instantanen Heilung/Schadensapplikation. Schreibt direkt ins Modell und synchronisiert in Echtzeit per WebRTC zum DM-Bildschirm.
  * **Physikalische Angriffs-Banners:** Direkt auslösbare Biss- und Klauen-Rollbuttons, welche die D&D 3.5e RAW Formeln als Pergament-Angriffstext posten.
* **PWA Cache Bump auf v10:** Registrierung aller neuen modularen Dateien im Service Worker (`service-worker.js`) für uneingeschränkte, fehlerfreie Offline-Nutzung am Spieltisch.

### v1.8.0 — RAW Bardenmusik-Kompendium & Interaktives Klassenpanel
* **Echtes interaktives Bardenmusik-Kompendium:** Vollständige Integration aller 9 offiziellen Bardenmusik-Fähigkeiten (Gegengesang, Faszinieren, Mut einflößen, Kompetenz einflößen, Einflüsterung, Größe einflößen, Lied der Freiheit, Heldenmut einflößen, Massen-Einflüsterung) direkt auf dem Barden-Klassenblatt.
* **Dynamische Stufen-Sperren (Level Gates):** Lieder werden vollautomatisch anhand der Bardenstufe und der Auftreten-Ränge freigeschaltet. Lieder für höhere Stufen werden stilvoll mit einem Schloss-Symbol gesperrt (`🔒 Erfordert Stufe X`), während spielbare Lieder einen grünen Aktivierungsbutton erhalten.
* **Premium Musik-Nutzungen Override:** Behebung des Fehlers, bei dem die maximale Anzahl an Liedern bei jedem Rendern starr wieder auf `Bardenstufe` zurückgesetzt wurde. Ein neuer `bardicMusicExtra`-Zustand im Charaktermodell ermöglicht es, zusätzliche Musikladungen (z. B. durch das Talent *Extra Musik* (+4) oder ein *Liedschwert* (+1)) dauerhaft per `+` / `-` Buttons im Panel zu sichern, ohne dass sie überschrieben werden.
* **RAW-Präzisions-Trigger (0-Kosten für Einflüsterung):** Basierend auf der präzisen Text-Extraktion aus dem D&D 3.5e *Player's Handbook* (S. 30) kostet das Aktivieren von *Einflüsterung* und *Massen-Einflüsterung* nun **0 zusätzliche Bardenmusik-Nutzungen**, da diese auf einem bereits aktiven *Faszinieren*-Effekt aufbauen (ein wichtiges RAW-Detail, das in der App vollautomatisch abgebildet wird!).
* **Auftreten-Wurf (Perform) & Barden-Boni:**
  * Ein neuer Button **„Auftreten 🎲“** erlaubt es, einen d20-Wurf mit dem Auftreten-Modifikator durchzuführen (Modifikator schlägt standardmäßig die maximierten Ränge `Stufe + 3 + Cha-Mod` vor).
  * Berechnet automatisch den Willensrettungs-SG (für Faszinieren/Einflüsterung) sowie den ansteigenden Moralbonus für *Mut einflößen* (+1 bis +4) und gibt die Ergebnisse in einem edlen Pergament-Kombat-Banner aus.

### v1.7.4 — Fehlerfreie, hochperformante Intro-Animation (HTML/SVG Hybrid)
* **HTML/SVG Hybrid-Layer-Architektur:** Behebung des Fehlers, bei dem die Schwerter in der linken oberen Ecke feststeckten ("gelber Kratzer") und die Explosion als starre weiße Scheibe verharrte ("heller Kreis"). Die Swords und der Drachenkopf wurden aus einer einzigen überladenen SVG-Datei herausgelöst und in absolut-positionierte HTML-Wrapper-Elemente (`.sword-wrapper.left`, `.sword-wrapper.right`, `.dragon-wrapper`) aufgeteilt. Dies löst das browserübergreifende Problem von kaskadierenden SVG-Gruppentransformationen und fixiert den `transform-origin` absolut fehlerfrei auf den Hilt-/Pivot-Mittelpunkt (`50% 78.72%`).
* **Flash-Artefakt Beseitigung:** Die Clash-Explosion wurde als leichtgewichtiger CSS-Radialgradient optimiert, der am Ende des Keyframes garantiert auf `opacity: 0` ausblendet und keine visuellen Rückstände hinterlässt.
* **PWA Cache Bump (v9):** Der PWA-Cache wurde auf `dnd-combatsheet-v9` angehoben. Dies zwingt den Browser bei der nächsten Sitzung dazu, den alten Speicher restlos zu verwerfen und die neue, fehlerfreie Animation sofort zu laden, ohne dass ein manuelles Löschen des Caches oder der Inkognitomodus nötig sind.

### v1.7.3 — Startseiten-Auswahl-Default auf Seiten-Reload
* **Rollen-Auswahl Default auf Neustart:** Beim Laden oder Aktualisieren der Anwendung (`loadFromStorage`) startet die App nun **grundsätzlich auf dem Auswahlscreen (`'choice'`)**. Dadurch kannst du dich bei jedem Seitenbesuch frei entscheiden, ob du der Sitzung als Spielleiter (DM) oder als Spieler (PC) beitreten möchtest, anstatt unkontrolliert in die letzte Rolle geworfen zu werden. Deine restlichen Charakterdaten, Begegnungen und Zauber werden im Hintergrund vollkommen sicher geladen und bleiben erhalten.
* **Service-Worker Kompatibilität:** Verhindert das "Einfrieren" oder fehlerhafte Verhalten veralteter Service-Worker-Caches auf dem DM-Screen bei Server-Neustarts, da die App immer in einer sicheren, benutzergesteuerten Auswahl-Umgebung startet.

### v1.7.2 — Entfernung der Inline-Zauberknöpfe für maximale Robustheit
* **Clean-purged inline `+ Buch` Buttons:** Der listenseitige `+ Buch` / `✓ Buch` Button (`.learn-spell-btn`) wurde vollständig aus der Zauberliste des Kompendiums in `player-sheet.js` entfernt. Das Hinzufügen und Entfernen von Zaubern wird nun ausschließlich und 100% zuverlässig über das edle Pergament-Detail-Overlay (Klick auf den Zaubernamen) per "Ja" / "Nein" Schaltflächen vorgenommen.
* **Code-Entschlackung:** Alle zugehörigen Event-Listener für `.learn-spell-btn` wurden rückstandslos gelöscht, um eine schlanke und wartbare Codebasis zu garantieren.
* **Erhaltene Custom-Zauber-Löschung:** Das Klick-Verhalten und der `✕`-Button zum Löschen selbstkreierter Zauber bleibt für eigene Zauber auf der rechten Seite der Liste sauber erhalten.

### v1.7.1 — Fehlerfreie PC-Referenzen & Redraw-Sicherheit
* **Sichere PC-Zuweisung:** Alle Klick-Handler für Zauberaktionen (`.learn-spell-btn`, `.remove-spell-btn`, `.delete-custom-spell-btn`) beziehen die Charakterdaten nun **immer frisch** über `CombatState.getActivePC()` direkt aus dem zentralen State-Controller. Dies verhindert jegliche Timing- und Speicherungs-Fehler, falls der UI-Scope veraltete Kopien/Referenzen (Closures) des PC-Objekts hielt.
* **Ganzheitlicher UI-Neuaufbau:** Nach dem Lernen oder Entfernen von Zaubern wird anstelle eines partiellen Element-Updates nun direkt `renderPlayerScreen()` aufgerufen. Dies garantiert, dass alle Registerkarten ("Mein Zauberbuch", "Zauberkompendium"), das Zauberslots-Raster und die Detail-Overlays absolut zeitgleich und fehlerfrei mit dem Master-State synchronisiert werden.
* **Behebung des Export-Fehlers:** Die Funktion `resetDailyResources` (Ein neuer Tag!) wurde in das exportierte `CombatState`-Objekt in `state.js` integriert, was einen potenziellen Absturz bei Klick auf den Reset-Button zuverlässig behebt.

### v1.7.0 — Robuster Spell-Search & Event-Propagation Fix (Sofortige Klicks)
* **DOM-basiertes Echtzeit-Filtering:** Der destruktive `onchange`-Listener auf dem Suchfeld des Zauberkompendiums wurde restlos entfernt. Die Filterung erfolgt nun instantan `oninput` durch direkte Manipulation der CSS-Eigenschaft `display` auf `.compendium-spell-item`-Elementen im DOM. Dies verhindert jeglichen Fokusverlust und eliminiert die Race Condition, die zuvor Klicks bei fokussiertem Suchfeld verschluckt hat.
* **Klick-Verbindlichkeit (100% Zuverlässigkeit):** Hinzufügen von `e.stopPropagation()` und `e.preventDefault()` auf allen Klick-Aktionen in den Zauberlisten (`.learn-spell-btn`, `.remove-spell-btn`, `.delete-custom-spell-btn`, `.cast-spell-btn`, `.view-spell-details-btn`). Dies garantiert eine saubere, ungestörte Event-Erfassung ohne unerwünschtes Aufsteigen (Bubbling) von Events.
* **Instantane Synchronisation:** Hinzufügen und Entfernen von Zaubern reagiert jetzt absolut verzögerungsfrei, schreibt direkt in den LocalStorage und synchronisiert die Daten ohne Umschweife per WebRTC.

### v1.6.0 — RAW Stufe 0-9 Slots-Automatisierung & "Ein neuer Tag!" Reset
* **RAW Zauberslots (Grad 0-9):** Vollautomatische Berechnung der täglichen Zauberslots auf Basis der aktiven Klassen, Stufen und Attributsmodifikatoren (Int/Wis/Cha).
  * Berechnet Modifikator-Bonus-Slots regelkonform für Grad 1–9.
  * Vollwertige Einbindung von Grad 0 (Zaubertricks/Orisons): Slots werden beim Wirken verbraucht, erhalten aber keine Attributsboni.
  * Unterstützt Spezialisierungs-Boni für Magier (+1 Slot pro Zaubergrad).
  * Kumuliert Zauberslots bei Multiclassing-Charakteren automatisch.
  * "Custom-Sheet"-Kompatibilität: Slots bleiben manuell editierbar, wenn keine Klassen eingetragen sind.
* **"Ein neuer Tag! 🌅" Reset-Button:** Ein neuer goldfarbener Aktionsbutton neben den Zauber-Reitern setzt alle verbrauchten Slots (Grad 0–9), Klassen-Fähigkeiten (Kampfrausch, Niederstrecken, Hände auflegen, Vertreiben, Bardenlied, Tiergestalt) sowie benutzerdefinierte Tracker zurück. Kampfrausch wird automatisch beendet.
* **Dynamische Klassen- & Stufen-Filterung:** Das Zauberkompendium zeigt standardmäßig nur Zauber an, die für die aktiven Klassen und die aktuelle Zauberstufe des Charakters zulässig sind. Ein Kontrollkästchen erlaubt es, das gesamte Kompendium einzublenden.
* **Datenbank-Patch:** Korrektur von 7 premium-deutschen Zaubern (*Spiegelbilder*, *Gebet*, *Schlaf*, *Schild*, *Segen*, *Schwere Wunden heilen*, *Zeitstopp*), indem die fehlenden RAW `classLevels` präzise nachgetragen wurden, um Fehlfilterungen auszuschließen.
