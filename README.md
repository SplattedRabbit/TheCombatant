### THE COMABTANT ###

The Combatant is a fully functional Combattool and digital Charactersheet for Dungeons and Dragons 3.5e Core.
This Project was used to learn and try out agent assisted development.
The App was designed as PWA so it could be delivered build-free to players for ease of use. 

It started as a single index.html for me as a DM, tracking my Players stats and combat turn-porder. After a bit of Input from my players wanting to have a quick way to track buffs and spells I decided to build a full, comprehensive App based on the D&D 3.5e Core-Ruleset.
There are still a lot of Ideas of what could be implemented.

Agents used: 
* Google Antigravity
* Google Gemini Flash for concepts, basic UI-Work, minor fixes and documentation
* Claude Sonnet 4.6 most of the easy implementations and first strikes with new features
* Claude Opus for the heavy lifting, big architecural refactorings

An in-depth documentation can be found in ./docs/DEVELOPER_TRANSITION.md

Full Featurelist:
# 🏰 The Combatant — Feature-Übersicht

**The Combatant** ist ein maßgeschneidertes, mobiles und offline-fähiges Begleit-Tool für **Dungeons & Dragons 3.5e**. Es kombiniert einen hochgradig automatisierten Charakterbogen mit einer Echtzeit-Kampf- und Spielleiter-Schnittstelle.

Hier ist die Übersicht, was Spieler und Spielleiter (DM) erwartet – auf hoher Flughöhe und ohne Detail-Ballast.

---

## 👤 1. Der digitale Charakterbogen (Player Sheet)
*Alles auf einen Blick – optimiert für die schnelle Nutzung am Spieltisch oder Tablet.*
* **Visueller HP-Fokus:** Eine auffällige, gotische Lebenspunkte-Kugel (Diablo-Style) für sofortige Statusübersicht.
* **Automatische Abwehrwerte:** Rüstungsklasse (AC) und Rettungswürfe (Zähigkeit, Reflex, Wille) berechnen sich vollautomatisch inklusive korrekter Stacking-Regeln (z. B. Ausweichboni addieren sich, gleiche Modifikatortypen nicht).
* **Automatisierter Fertigkeiten-Planer:** Talentierte Klassenfertigkeiten, Ränge und Attributsboni werden live berechnet. Inklusive automatischer Berücksichtigung von **Fertigkeitensynergien** (z. B. bringen 5 Ränge in *Akrobatik* automatisch +2 auf *Balance*).
* **Talent-Prüfung:** Integrierte Validierung für Talente (Feats) – die App prüft, ob die Voraussetzungen (wie Mindest-Attributswerte oder andere Talente) erfüllt sind.

---

## ⚔️ 2. Dynamisches Kampfsystem (Offense & Attacks)
*Schluss mit dem ständigen Nachrechnen bei komplexen Angriffsrunden.*
* **Angriffssequenz-Rechner:** Berechnet auf Knopfdruck vollständige Angriffsreihen (z. B. Haupt- und Zweithandangriffe, Angriffe mit hoher Effizienz) basierend auf dem Basis-Angriffsbonus (BAB), Stärke/Geschicklichkeit und Talenten.
* **Zweiwaffenkampf & Doppelwaffen:** Volle Unterstützung für Kampf mit zwei Waffen und Doppelwaffen (z. B. Kampfstab) mit dynamischen Abzügen und korrekter Schadensskalierung.
* **Power Attack Slider:** Ein interaktiver Schieberegler für *Machtvoller Angriff* zieht automatisch den gewünschten Wert vom Angriff ab und addiert ihn (je nach Waffenart ein- oder zweihändig) zum Schaden.
* **Natürliche Waffen:** Unterstützt Klauen, Bisse und andere natürliche Waffen mit korrekter Einteilung in Primär- und Sekundärangriffe.

---

## 🔮 3. Magie- & Zaubersystem (Spells & Slots)
*Volle Kontrolle über vorbereitete und spontane Zauber.*
* **Zauberbibliothek:** Ein integriertes D&D 3.5e SRD Zauber-Kompendium zum schnellen Nachschlagen und Lernen von Zaubern.
* **Vorbereitung & Spontanes Wirken:** Unterstützung für vorbereitende Zauberer (Kleriker, Magier, Druiden) und spontane Zauberer (Hexenmeister, Barden) mit übersichtlichem Slot-Verbrauch.
* **Metamagie-Assistent:** Wende metamagische Talente (z. B. *Zauber ausdehnen*, *Zauber maximieren*) an – die App berechnet den angepassten Zaubergrad und prüft freie Slots.
* **Vorbereitungs-Templates:** Speichere dein Standard-Zaubersetup für den Tag als Vorlage ab. Mit nur einem Klick ist das Zauberbuch nach einer langen Rast wieder bereit.

---

## 🐾 4. Klassenfeatures & Begleiter
*Maßgeschneiderte Mechaniken für jede Klasse.*
* **Spezial-Ressourcen:** Tracking von täglichen Ladungen für Klassenmerkmale (z. B. *Zorn* des Barbaren, *Handauflegen* des Paladins, *Lieder* des Barden).
* **Tierbegleiter & Vertraute:** Eigene, interaktive Begleiter-Bögen direkt im Hauptbogen integriert (für Druiden, Waldläufer, Magier und Hexenmeister).
* **Wild Shape (Tiergestalt):** Ein-Klick-Transformation für Druiden (z. B. Wolf, Leopard, Bär). Die App überschreibt temporär deine physischen Attribute, deine Rüstungsklasse und passt deine Angriffsoptionen nach den offiziellen D&D-Regeln (RAW) an.

---

## 🔗 5. Live-Spielrunde & DM-Synchronisation
*Nahtloses Zusammenspiel am Tisch.*
* **Echtzeit-Synchronisation (WebRTC):** Der Spielleiter startet eine Sitzung direkt im Browser. Spieler verbinden sich per Code über ihr Tablet oder Handy – komplett ohne Cloud-Zwang oder Accounts.
* **Zentraler DM-Screen:** Der Spielleiter sieht live die HP, Rüstungsklassen und Rettungswürfe aller Charaktere und behält die volle Kontrolle.
* **Initiative-Tracker:** Der DM startet den Kampf, die Initiative wird automatisch berechnet und die aktive Zugreihenfolge für alle Teilnehmer live synchronisiert.

---

## 🧙‍♂️ 7. Charakter-Erschaffung & "Level-Up"-Assistent (Geplant)
*Geführte Workflows für Neu-Erstellung und komfortablen Stufenaufstieg.*
* **Schritt-für-Schritt Level-Up:** Führt den Spieler strukturiert durch den Stufenaufstieg (Basisklasse, Multiclassing oder Prestige-Klasse) basierend auf der bestehenden Wizard-Engine.
* **Automatischer HP-Zuwachs:** Trefferwürfel (Hit Die) der gewählten Klasse würfeln oder festen Durchschnittswert eintragen (+ Konstitutions-Modifikator).
* **Fertigkeitspunkte-Verteilung (Skill Points):** Exakte Berechnung der verfügbaren Punkte für die neue Stufe (inkl. INT-Modifikator und Rassenbonus) mit automatischer Max-Rang-Prüfung (`Level + 3` für Klassenfertigkeiten).
* **Attributs- & Talent-Meilensteine:** Automatische Erkennung von Stufen-Meilensteinen (Attributssteigerung alle 4 Stufen, allgemeine Talente alle 3 Stufen, Klassen-Bonustalente für z. B. Kämpfer/Magier).
* **Zauber- & Slot-Progression:** Automatische Anpassung von Zauberslots und Freischaltung neuer Zaubergrade (inkl. Prestige-Klassen-Zauberverlinkung).
* **Klassenfeatures & ACF-Aktivierung:** Sofortige Freischaltung und Eintragung neuer Klassenmerkmale, Tiergestalt-Optionen und alternativer Klassenfeatures (ACFs).

---

## ⚙️ 8. Technologische Highlights
*Unkompliziert, schnell und zuverlässig.*
* **Zero-Install (PWA):** Kann direkt als Web-App auf dem Startbildschirm von Handy oder Tablet installiert werden und funktioniert dank Offline-Caching auch im tiefsten Keller ohne Internet.
* **Lokaler Server für den DM:** Ein kleines, mitgeliefertes PowerShell-Script startet den Server auf dem DM-Laptop mit einem Klick – keine Installation von Node.js oder externen Datenbanken nötig.
