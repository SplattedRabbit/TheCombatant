### THE COMBATANT ###

The Combatant is a fully functional Combat Tool and digital Character Sheet for Dungeons & Dragons 3.5e.
This project was built to explore and refine agent-assisted development, designed as an offline-capable PWA for seamless tabletop use.

It started as a single `index.html` for me as a DM to track player stats and combat turn-order. After feedback from my players wanting a quick way to track buffs, spells, and equipment, it evolved into a comprehensive D&D 3.5e companion app.

Agents used:
* Google Antigravity
* Google Gemini Flash for concepts, UI work, minor fixes, and documentation
* Claude Sonnet 4.6 for feature implementations

## 📚 Documentation (Single Source of Truth)
- [AI Agent Guide (`AGENT.md`)](AGENT.md) — Core rules, feature-to-file index, state API, and architectural invariants
- [Roadmap & Open Issues (`Planned_Features.md`)](Planned_Features.md) — Open bugs/mechanics, planned refactorings, and feature backlog
- [System Architecture & Developer Guide (`docs/ARCHITECTURE.md`)](docs/ARCHITECTURE.md) — 6-tier architecture, setup/commands, quality gates, and testing strategy
- [Changelog (`docs/CHANGELOG.md`)](docs/CHANGELOG.md) — Complete release notes and milestone history

---

## 🏰 Feature-Übersicht

**The Combatant** ist ein maßgeschneidertes, mobiles und offline-fähiges Begleit-Tool für **Dungeons & Dragons 3.5e**. Es kombiniert einen hochgradig automatisierten Charakterbogen mit einer Echtzeit-Kampf- und Spielleiter-Schnittstelle nach dem **Tabletop-First-Prinzip** (automatische Formel-, Modifikator- und DC-Berechnung für echtes physisches Würfeln am Spieltisch).

---

## 👤 1. Der digitale Charakterbogen (Player Sheet)
*Alles auf einen Blick – optimiert für die schnelle Nutzung am Spieltisch oder Tablet.*
* **Visueller HP-Fokus:** Eine auffällige, gotische Lebenspunkte-Kugel (Diablo-Style) für sofortige Statusübersicht.
* **Automatische Abwehrwerte:** Rüstungsklasse (AC) und Rettungswürfe (Fortitude, Reflex, Will) berechnen sich vollautomatisch inklusive korrekter Stacking-Regeln (z. B. Dodge- und Circumstance-Boni verschiedener Quellen addieren sich, gleiche Modifikatortypen nicht).
* **Automatisierter Fertigkeiten-Planer:** Klassenfertigkeiten, Ränge, Rassenboni und Attributsboni werden live berechnet – inklusive automatischer Berücksichtigung von **Fertigkeitensynergien** und **Skill Tricks**.
* **Tabellengetriebene Talent-Prüfung:** Integrierte Voraussetzungs-Validierung für Talente (Feats) über PHB, PHB II, Complete Adventurer und Complete Scoundrel hinweg.

---

## ⚔️ 2. Dynamisches Kampfsystem (Offense & Loadout)
*Schluss mit dem ständigen Nachrechnen bei komplexen Angriffsrunden.*
* **4-Slot ARPG Tactical Loadout:** Symmetrische Slots für Main Hand, Off-Hand (Waffe oder Schild inkl. Shield Bash), Body Armor und Class Ability Strikes (*Sneak & Sudden Strike*, *Smite Evil*, *Smite Corrupt*, *Breath Weapon*).
* **Angriffssequenz-Rechner:** Berechnet auf Knopfdruck vollständige Angriffsreihen (inkl. Iterativangriffen, Haste, Rapid Shot, Flurry of Blows) basierend auf BAB, Attributen und Talenten.
* **Zweiwaffenkampf, Doppelwaffen & Finesse:** Volle Unterstützung für Two-Weapon Fighting, Doppelwaffen und finessierbare Waffen (*Rapier*, *Whip*, *Spiked Chain*) mit exakter Power-Attack-Skalierung.
* **Natürliche Waffen:** Unterstützt Klauen, Bisse und andere natürliche Waffen mit korrekter Einteilung in Primär- und Sekundärangriffe.

---

## 🔮 3. Magie- & Zaubersystem (Spells & Slots)
*Volle Kontrolle über vorbereitete und spontane Zauber.*
* **Zauberbibliothek:** Integriertes D&D 3.5e Zauber-Kompendium (PHB, PHB II, Complete Arcane, Complete Scoundrel) mit Volltextsuche und Schul-Spezialisierung.
* **Vorbereitung & Spontanes Wirken:** Unterstützung für vorbereitende Zauberer (Wizard, Cleric, Druid, Paladin, Ranger) und spontane Zauberer (Sorcerer, Bard, Duskblade, Assassin) inkl. RAW Zauberbuch-Caps.
* **Metamagie-Assistent & Vorlagen:** Wende metamagische Talente direkt auf Zauberslots an und speichere tägliche Vorbereitungs-Templates.

---

## 🐾 4. Klassenfeatures, Begleiter & Level-Up
*Maßgeschneiderte Mechaniken für jede Klasse und kontinuierliche Charakter-Entwicklung.*
* **Geführter Charakter- & Level-Up-Assistent:** Mehrstufiger Wizard für Charaktererstellung und Stufenaufstieg inkl. Attributssteigerungen, Fertigkeiten, Talenten, ACFs, Prestigeklassen und Zauberauswahl.
* **Spezial-Ressourcen & Stances:** Tracking von täglichen Ladungen und aktiven Stances (*Barbarian Rage*, *Bardic Music*, *Dragon Shaman Auras*, *Favored Enemy*, *Turn Undead*, *Smite*).
* **Tierbegleiter, Vertraute & Wild Shape:** Eigene 2-Spalten-Dashboards für Animal Companions und Familiars sowie 1-Klick Wild-Shape-Transformation für Druiden nach D&D 3.5e RAW.

---

## 📄 5. Druckbarer D&D 3.5e Charakterbogen (A4 / PDF Export)
*Klassisches Pen & Paper Feeling für den Spieltisch.*
* **Authentisches 4-Seiten A4 Folio:** Auf Knopfdruck aus dem System-Menü druckfertig aufbereitet (Kampf/Verteidigung, 45-Fertigkeiten-Matrix & Features, Ausrüstung/Rüstkammer, Zauberbuch & Begleiter-Bogen).

---

## 🔗 6. Live-Spielrunde, DM-Screen & Loot Vault
*Nahtloses Zusammenspiel am Tisch.*
* **Echtzeit-Synchronisation (Supabase Realtime):** Beitritt per Invite-Code mit <30ms Latenz, automatischem Reconnect, strikter Charakter-Isolation und Local-First Fallback.
* **DM-Screen & DM Stash:** Initiative-Tracker, Live-Übersicht aller Kämpfer, Konzentrations-Tracker sowie ein **DM Stash & Loot Vault** mit 1-Klick-Item-Vergabe und animierter Schatztruhen-Enthüllung (`LootRevealModal`) auf dem Spielerbildschirm.
