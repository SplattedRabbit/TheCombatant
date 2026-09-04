# Übergabe & Systemstatus (v6.4.1 / Branch `fix_feats`) — The Combatant

## 🚀 Copy-Paste Prompt für den neuen Rechner / neuen Chat / Morgen

```markdown
Wir setzen die Entwicklung von The Combatant auf Basis von Branch `fix_feats` (Version v6.4.1 / aktueller Stand) fort.

Zuletzt abgeschlossen:
1. Umfassende Talente-Erweiterung (PHB, PHB II, Complete Adventurer, Complete Scoundrel - ohne Glücks-Talente):
   - Über 100 fehlende Talente aus den Quellenbüchern in `js/data/feats/` integriert (Combat, General, Magic).
   - Prerequisite-Engine in `js/data/feats-data.js` gehärtet: Volle Unterstützung für `skill` (`skill` + `ranks` sowie `name` + `value`) und `special`/`custom` (Sneak Attack +Xd6, Turn Undead, Evasion, Bardic Music etc.).
2. Klassenfeature-Talente & Slot-Logik im Wizard & Level-Up-Assistant:
   - Automatische `(Fixed)` Slots für feste Klassentalente (z.B. Shadowbane Inquisitor 3: Improved Sunder, Ranger 1: Track, Ranger 3: Endurance, Monk 1: Imp. Unarmed Strike, Wizard 1: Scribe Scroll, Duskblade 2: Combat Casting, Knight 2: Mounted Combat, Dragon Shaman 2: Skill Focus).
   - Automatische `(Class Choice)` Slots für gefilterte Klassenauswahlen (z.B. Ranger Combat Styles, Monk Bonus Feats).
   - Neues visuelles Badge `🛡️ Class Feature` in der Talentliste zur Vermeidung doppelter/verschwendeter Talentwahlen.
3. Skill-Point-Engine & Multi-Classing-Fix:
   - Prestige-Klassen-Basisfertigkeiten in `CLASS_BASE_SKILLS` (`RulesData.js`) und generischer Fallback in `RulesSkills.js`.
   - Universelles `spent`-Tracking (`pc.skills[id].spent`) im Wizard, LevelUp-Assistant und Character Sheet, damit Cross-Class-Kosten (2 Punkte/Rang) beim Levelaufstieg nicht fälschlich verflacht werden.
   - Visuelle Hervorhebung: Fertigkeiten mit Rängen aus vorherigen Stufen werden nun in warmem Goldgelb hervorgehoben.
4. Test- & Build-Status:
   - 336 Node-Tests (`npm test`) & 41 Vitest UI-Tests (`npm run test:ui`) $\rightarrow$ 100% bestanden (0 Fehler).
   - TypeScript (`npm run typecheck`) $\rightarrow$ 0 Fehler.
   - Build (`npm run build`) $\rightarrow$ erfolgreich generiert.
```

---

## 📋 Systemstatus & Git-Metadaten

* **Repository:** `https://github.com/SplattedRabbit/TheCombatant.git`
* **Aktueller Branch:** `fix_feats` (Up-to-date mit Remote)
* **Letzter Commit:** `d499078` (*feat(feats): enhance class feature feats, mark with badge, lock fixed feats and validate prereqs*)
* **Test-Suite:** 336 Node-Tests (`npm test`) & 41 Vitest UI-Tests (`npm run test:ui`) $\rightarrow$ **100% grün, 0 Fehler**.
* **TypeScript-Prüfung:** `npm run typecheck` $\rightarrow$ **0 Fehler**.
* **Produktions-Build:** `npm run build` $\rightarrow$ **Erfolgreich**.

---

## 🛠️ Detaillierte Übersicht der heutigen Session

### 1. Talente-Erweiterung & Prerequisite-Engine
- **Quellenbücher:** PHB, PHB II, Complete Adventurer (CAd), Complete Scoundrel (CS) vollständig gesichtet und alle fehlenden Talente nachgetragen (Glücks-Talente bewusst ausgeklammert).
- **Hardening (`js/data/feats-data.js`):**
  - Behebung von `TypeError: Cannot read properties of undefined (reading 'split')`: Prerequisite-Parser liest nun sowohl `name`/`value` als auch `skill`/`ranks`.
  - Robuste Auswertung von `type: 'special'` (inkl. dynamischer Erkennung von `Sneak Attack +Xd6`, `Turn Undead`, `Evasion`, `Ki Strike`, `Wild Shape`).

### 2. Klassenfeature-Talente & UI-Führung
- **`src/components/player/wizard/helpers.ts` (`getFeatSlotsAtLevel`):**
  - Generiert dedizierte Slots für feste Klassentalente (`(Fixed)`), die gesperrt sind.
  - Generiert dedizierte Slots für Klassenauswahlen (`(Class Choice)` mit `allowedFeats`).
- **`src/components/player/wizard/FeatsTabContent.tsx` & `CharacterWizardDialog.tsx` & `LevelUpDialog.tsx`:**
  - `🛡️ Class Feature`-Badge bei allen Talenten, die über Klassenfeatures verliehen werden.
  - Automatische Slot-Filterung auf erlaubte Klassen-Optionen.

### 3. Skill-Punkte-Berechnung & Zwerg 5 Rogue / 4 Paladin / 4 Shadowbane Inquisitor
- **Problem:** Sheet zeigte 70/65 Skillpunkte, weil Prestige-Klassen nicht im Basisskill-Lookup waren und Cross-Class-Skillkosten beim Import/Speichern auf 1 Punkt/Rang verflacht wurden.
- **Lösung:**
  - `CLASS_BASE_SKILLS` in `RulesData.js` um alle Prestigeklassen erweitert + Fallback auf `CLASSES_LIST`.
  - Universelles `spent`-Tracking im Datenmodell (`pc.skills[k].spent` speichert tatsächlich investierte Punkte).
  - Stufe-1-Klasse (4-fache Punkte) folgt deterministisch `pc.classes[0]`.
  - Gelb-goldene Kennzeichnung für bereits vorher gesteigerte Skills im Wizard und Level-Up-Assistant.

---

## 💻 Erste Schritte beim Neustart / Morgen

```bash
# 1. Sicherstellen, dass auf fix_feats gearbeitet wird
git status
git pull origin fix_feats

# 2. Schnelltest ausführen
npm test
npm run test:ui
npm run typecheck

# 3. Dev-Server starten
npm run dev
```
