# Übergabe & Systemstatus (v6.4.0) — The Combatant

## 🚀 Copy-Paste Prompt für den neuen Rechner / neuen Chat

```markdown
Wir setzen die Entwicklung von The Combatant auf Basis von Branch `main` (Version v6.4.0 / aktueller Stand) fort. 
Zuletzt abgeschlossen:
1. Vollständiges D&D 3.5e Gottheiten- und Kleriker-Domänensystem nach RAW:
   - Alle 19 Greyhawk-Kerngottheiten + philosophische Ideale in `js/data/deities-data.js` inkl. One-Step-Gesinnungsregel.
   - Alle 22 PHB-Domänen (Air, Animal, Chaos, Death, Destruction, Earth, Evil, Fire, Good, Healing, Knowledge, Law, Luck, Magic, Plant, Protection, Strength, Sun, Travel, Trickery, War, Water) in `js/data/domains-data.js` mit verliehenen Kräften und Stufen 1–9 Domänenzaubern.
   - 100% Abdeckung aller 198 Domänenzauberslots (44 ehemals fehlende Core-Spells in `spells-phb.json` integriert).
2. Kleriker-Zauberplatz-Engine & Vorbereitung:
   - +1 Domänenslot pro Zauberstufe (1–9) nach RAW.
   - Domänenzauber-Zugriff für Kleriker auch außerhalb der Klerikerliste (z.B. Fly über Travel, Barkskin über Plant).
   - Saubere Trennung und Verfolgung von Domänenslots bei der Zaubervorbereitung (`isDomain: boolean`, `[D]`-Tag, max 1 pro Stufe).
3. Benutzeroberfläche & Anzeige:
   - `ClericFeaturesCard.tsx`: Gottheitsauswahl mit Gesinnungs-Kompatibilitätsprüfung, Domänenauswahl, verliehene Mächte und Zauberlisten.
   - `PrepareSpellDialog.tsx`: Domänenslot-Erkennung mit Checkbox und Verfügbarkeits-Feedback.
   - `PCSpellPreparation.tsx` & `PCSpellbookTab.tsx`: Dedizierte Domänen-Slots mit Pergament-Styling und `[D]`-Badge.
   - `PCSpellCompendium.tsx` & `SpellDetailsDialog.tsx`: Domänen-Badges und Markierung freigeschalteter Domänenzauber.
   - `PCHeaderInfo.tsx` & Druckbögen: Gottheits- und Domänenanzeige im Header und auf den Druckseiten.
Alle 330 automatisierten Tests, 37 Vitest UI-Tests und TypeScript-Checks sind 100% grün.
```

---

## 📋 Systemstatus & Git-Metadaten

* **Repository:** `https://github.com/SplattedRabbit/TheCombatant.git`
* **Branch:** `main`
* **Release-Version:** `v6.4.0`
* **Test-Suite:** 330 Node-Tests (`npm test`) & 37 Vitest UI-Tests (`npm run test:ui`) $\rightarrow$ **100% grün, 0 Fehler**.
* **TypeScript-Prüfung:** `npm run typecheck` $\rightarrow$ **0 Fehler**.
* **Produktions-Build:** `npm run build` $\rightarrow$ Service-Worker Precache `v202`.

---

## 🛠️ Detaillierte Übersicht der umgesetzten Änderungen

### 1. Gottheiten- & Domänen-System (Deities & Domains Engine)
- **Gottheiten-Register (`js/data/deities-data.js`):**
  - Alle 19 Core-Gottheiten (Pelor, Kord, Moradin, Heironeous, St. Cuthbert, Wee Jas, Boccob, Fharlanghn, Obad-Hai, Olidammara, Ehlonna, Hextor, Nerull, Vecna, Erythnul, Gruumsh, Corellon Larethian, Garl Glittergold, Yondalla) + `"none"` (Ideale/Philosophie).
  - Jede Gottheit besitzt: ID, Name, Titel, Gesinnung, Domänenportfolio, bevorzugte Waffe und Beschreibung.
  - Mathematische Manhattan-Distanzfunktion `isAlignmentWithinOneStep` auf dem 3×3 Gesinnungsgitter nach D&D 3.5e RAW.
- **Domänen-Register (`js/data/domains-data.js`):**
  - Alle 22 Core-PHB-Domänen vollständig erfasst mit verliehenen Kräften (*Granted Powers*) und Zaubern Stufe 1 bis 9.
  - Hilfsfunktionen `getDomain`, `getSpellDomains`, `isSpellInDomain`, `isDomainSpellForPC`.
- **Datenbank-Bereinigung (`data/spells-phb.json`):**
  - 44 fehlende Kernzauber mit vollständigen SRD-Werten, Schulen, Komponenten und Klassenstufen nachgetragen.
  - Alle 198 Domänenslots aller 22 Domänen mappen 1:1 auf existierende Zauber in der Datenbank.

### 2. Zauberregeln & Vorbereitungsmechanik
- **Zauberslots:**
  - Kleriker erhalten automatisch `+1` Domänenslot pro Zauberstufe (Stufen 1–9) auf Basis von `RulesSpells.calculateMaxSpellSlots`.
- **Zauberzugriff:**
  - Kleriker können Domänenzauber, die regulär nicht auf der Klerikerliste stehen (z.B. *Fliegen* bei Reisestatut), erlernen und vorbereiten.
  - Nicht-Klerikerzauber aus Domänen können ausschließlich in Domänenslots vorbereitet werden.
- **Vorbereitungstracking:**
  - `prepareSpell(pc, key, metamagic, isSpecialist, isDomain)` erfasst `isDomain: true`.
  - `SpellSlotCalculator.countPreparedDomainSpellsAtLevel` limitiert Vorbereitung auf maximal 1 Domänenzauber pro Stufe.

### 3. UI- & Druck-Integration
- **`ClericFeaturesCard.tsx`:** Gottheits-Auswahl mit Gesinnungs-Feedback, 2 Domänen-Auswahlen mit Granted-Powers-Karten und Zauberlisten.
- **`PrepareSpellDialog.tsx`:** Intelligente Domänenslot-Erkennung mit Checkbox und Slot-Verfügbarkeits-Validierung.
- **`PCSpellPreparation.tsx`:** Eigene Domänenslot-Zeile mit Sonnen-Symbol, rotem Rahmen und `[D]`-Kennzeichnung.
- **`PCSpellCompendium.tsx` & `SpellDetailsDialog.tsx`:** Anzeige der zugehörigen Domänen und optische Hervorhebung von Zaubern der eigenen Domänen.
- **Header & Druckseiten (`PCHeaderInfo.tsx`, `PrintPage1CoreCombat.tsx`, `PrintPage4SpellsCompanion.tsx`):** Anzeige von Gottheit und Domänen im Kopfbereich sowie Kennzeichnung vorbereiteter Domänenzauber mit `[D]`.

---

## 💻 Erste Schritte auf dem neuen Rechner

```bash
# 1. Neueste Version von GitHub abrufen
git pull origin main

# 2. Dependencies sicherstellen
npm install

# 3. Alle Tests ausführen
npm test
npm run test:ui
npm run typecheck

# 4. Entwicklungs-Server starten
npm run dev
```
