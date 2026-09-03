# Übergabe & Systemstatus (v6.3.1) — The Combatant

## 🚀 Copy-Paste Prompt für den neuen Rechner / neuen Chat

```markdown
Wir setzen die Entwicklung von The Combatant auf Basis von Branch `main` (Version v6.3.1 / aktueller Stand) fort. 
Zuletzt abgeschlossen:
1. Vollständige Zauberbücher für PHB (414 Spells), PHB II (27 Spells), Complete Adventurer (14 Spells) und Complete Scoundrel (6 Spells) mit normalisierten classLevels für alle 461 Zauber.
2. Gehärtete Zauber-Validierungs- und Prerequisite-Engine: Charaktere können nur Zauber ihrer eigenen Klasse und Zauberstufe lernen; Sperrung für Nicht-Zauberer und Bannschulen; verlässliche Filter-Checkbox.
3. Vollständige Feat-Integration aus PHB, PHB II und Complete Adventurer (~60 CA Feats).
4. Korrektur der Talent-Progression auf RAW D&D 3.5e (Level 1, 3, 6, 9, 12, 15, 18).
5. Optische & typografische Angleichung des Spell-Popups (SpellDetailsDialog.tsx) an das Ancient Parchment Feat-Popup mit Klassenberechtigungs-Feedback.
Alle 325 automatisierten Tests und TypeScript-Checks sind 100% grün.
```

---

## 📋 Systemstatus & Git-Metadaten

* **Repository:** `https://github.com/SplattedRabbit/TheCombatant.git`
* **Branch:** `main`
* **Release-Version:** `v6.3.1`
* **Test-Suite:** 325 Node-Tests (`npm test`) & Vitest UI-Tests (`npm run test:ui`) $\rightarrow$ **100% grün, 0 Fehler**.
* **TypeScript-Prüfung:** `npm run typecheck` $\rightarrow$ **0 Fehler**.
* **Produktions-Build:** `npm run build` $\rightarrow$ Service-Worker Precache `v198`.

---

## 🛠️ Detaillierte Übersicht der umgesetzten Änderungen

### 1. Zauber-System (Spells System)
- **PHB (`data/spells-phb.json` – 414 Zauber):**
  - Fehlende Basis-Zauber nachgetragen: `cure_minor_wounds` (Stufe 0 Kleriker/Druide), `inflict_minor_wounds` (Stufe 0 Kleriker), `read_magic` (Stufe 0 Kleriker/Druide/Barde/Magier/Hexenmeister, Stufe 1 Paladin/Waldläufer), `daze` (Stufe 0 Barde/Magier/Hexenmeister), `know_direction` (Stufe 0 Druide, Stufe 1 Barde), `comprehend_languages` (Stufe 1 Kleriker/Barde/Magier/Hexenmeister).
  - 6 fehlerhafte Keys repariert: `aid`, `animal_messenger`, `bane`, `command`, `nightmare`, `power_word_kill`.
  - Bei 300+ Zaubern die verschluckten Header am Textende aus dem Feld `description` entfernt.
  - 10 ehemals leere Beschreibungen mit offiziellem SRD-Text befüllt (`analyze_dweomer`, `animate_dead`, `antilife_shell`, `bless_weapon`, `disrupting_weapon`, `helping_hand`, `holy_smite`, `refuge`, `repulsion`, `wall_of_force`).
- **Player's Handbook II (`data/spells-phb2.json` – 27 Zauber):**
  - Vollständiger Katalog inkl. `alter_fortune`, `celerity` (Lesser, Standard, Greater), `deflect` (Lesser, Standard), `heart_of_air`, `heart_of_water`, `heart_of_earth`, `heart_of_fire`, `kelgores_fire_bolt`, `kelgores_grave_mist`, `chain_missile`, `energy_aegis`, `stay_the_hand`, `hesitate`, `chasing_perfection`, `vertigo_field`, `legion_of_sentinels`, `sure_strike`, `blade_brothers`.
- **Complete Adventurer (`data/spells-ca.json` – 14 Zauber):**
  - Vollständiger Katalog inkl. `iron_silence`, `wraithstrike`, `sniper_s_shot`, `guided_shot`, `critical_strike`, `bladeweave`, `sonic_weapon`, `arrow_mind`, `wild_instincts`, `tactical_teleportation`.
- **Automatisierte Validierung (`Tests/spellbooks_audit.test.js`):**
  - Prüft alle 461 Zauber auf vollständige Namen, Schulen, Grade und Beschreibungen.

### 2. Talent-System & Voraussetzungen (Feats & Prerequisite Engine)
- **Regelwerke:** PHB, PHB II und Complete Adventurer (~60 CA-Talente für Kampf, Magie und Allgemein) vollständig registriert.
- **Formel-Korrektur:** Allgemeine Talent-Slots auf RAW D&D 3.5e Formel korrigiert: `1 + Math.floor(Level / 3) + (isHuman ? 1 : 0)`.
- **Prerequisite-Engine:**
  - Ersetzung von Roh-IDs durch `SKILL_NAMES_MAP` und `CLASS_NAMES_MAP`.
  - Dynamische Erkennung von Klassenmerkmalen (*Trapfinding*, *Favored Enemy*, *Smite Evil*, *Evasion*, *Rage*, *Ki Strike*, *Turn Undead*, *Bardic Music*, *Wild Shape*, *Spontaneous Arcane Spells*, *Familiar*).
- **UI-Reaktivität:** Unlearn- und Learn-Zweige in `FeatScrollActions.tsx` entkoppelt; `pc.feats` wird immutable als neue Array-Referenz aktualisiert.

### 3. UI-Harmonisierung (Popups & Dialogs)
- **`SpellDetailsDialog.tsx` & `SpellScrollDialog.tsx`:**
  - 1:1 an das Ancient-Parchment-Design des Talent-Popups angepasst (`width: 540px`, `maxHeight: 54vh`, `#f4e8c1` Pergament, roter Rahmen `#8b1a1a`, sauberes Attribut-Grid, optimierte Typografie und Backdrop-Klick zum Schließen).

---

## 💻 Erste Schritte auf dem neuen Rechner

```bash
git pull origin main
npm install
npm run typecheck
npm test
npm run dev
```
