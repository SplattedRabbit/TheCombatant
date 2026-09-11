# AGENT.md — AI Agent Navigation & Selbstwartungsanleitung
# CombatApp (D&D 3.5e) | Lies diese Datei ZUERST, vor jeder anderen.
# WICHTIG: Kommuniziere mit dem Benutzer IMMER auf Deutsch.

---

## 1. Pflichtbefehle

> [!IMPORTANT]
> **Testumfang nach Änderungstyp** — `run_agent_tests.js` immer verwenden:
> - **UI-Fix / Datenpflege / Text:** Kein Testlauf erforderlich (Tier 1).
> - **Lokaler Bugfix / Modul-Änderung:** Gezielter Test des betroffenen Testfiles (Tier 2).
> - **Strukturelle Änderung / Rules / State:** Einmaliger globaler Testlauf vor Turn-Ende (Tier 3).

```powershell
# GEZIELTER TEST (Token-optimiert für Einzeldatei):
node scripts/run_agent_tests.js Tests/bugfixes_v350.test.js

# GLOBALER TESTLAUF (Token-optimiert, einmalig vor Turn-Ende):
node scripts/run_agent_tests.js

# PLAYER'S HANDBOOK DURCHSUCHEN (NIE die TXT-Kapitel einzeln laden):
node scratch/search_phb.js "<Suchabfrage>"

# DUNGEON MASTER'S GUIDE DURCHSUCHEN (NIE die Seiten-TXT einzeln laden):
node scratch/search_dmg.js "<Suchabfrage>"
```

---

## 2. Architektur in 5 Zeilen

```
Models  (js/models/)   → Daten & Domänenlogik, kein HTML, keine D&D-Regeln
Rules   (js/rules/)    → Pure D&D-3.5e-Funktionen, kein DOM, kein State
State   (js/state/)    → Mutiert Models, feuert Events — Zugang NUR via js/state.js
UI      (js/ui/)       → Rendert DOM, liest State, ruft Dialoge auf
Data    (js/data/)     → Statische Registries (Waffen, Rüstungen, Talente, Skills)

Richtung: UI → State → Models ← Rules
NIEMALS: Models → UI | Rules → State | HTML in Models
```

---

## 3. Feature → Datei-Index

| Feature               | Primärdatei(en)                                          | Sekundär / Aufrufer                          |
|-----------------------|----------------------------------------------------------|----------------------------------------------|
| Wild Shape            | `js/models/helpers/classes/DruidHelper.js`                | `Combatant.js`, `src/components/player/features/DruidFeaturesCard.tsx` |
| Natürliche Angriffe   | `src/components/player/offense/slots/NaturalAttacksSection.tsx` | `js/rules/attack/AttackContext.js`, `js/rules/attack/BaseAttackCalculator.js` |
| Magische Gegenstände  | `js/models/Item.js`, `src/components/player/PCMagicItemsTab.tsx` | `js/state/PCManager.js` (`addPCItem*`)       |
| Waffen-UI             | `src/components/player/offense/WeaponStashCard.tsx`      | `AttackEngine.js`, `js/models/Weapon.js`     |
| Rüstung               | `js/models/Armor.js`, `js/data/armor-data.js`, `src/components/player/offense/ArmorStashCard.tsx` | `PCOffenseTab.tsx`                           |
| Ausrüstung (React)    | `src/components/player/PCOffenseTab.tsx`, `src/components/player/offense/ActiveEquipmentSlots.tsx` | `PlayerSheet.tsx` |
| Angriffs-Engine       | `js/rules/AttackEngine.js`, `js/rules/attack/`           | `PCOffenseTab.tsx`, `js/ui/dialogs/AttackChoiceDialog.js` |
| Rettungswürfe         | `js/rules/SaveCalculator.js`                             | `js/models/Combatant.js`, `helpers/modifiers/` |
| Zauber / Slots        | `src/components/player/PCSpellbookTab.tsx`, `src/components/player/PCSpellsTab.tsx`, `helpers/spells/CombatantSpells.js` | `js/rules/SpellSlotCalculator.js`, `Combatant.js` |
| Klassen-Features      | `js/models/helpers/classes/CombatantClassFeatures.js`    | `Combatant.js`, `src/components/player/features/` (z.B. `UnifiedFeatureCard.tsx`) |
| Talente               | `js/data/feats-data.js` (Fassade), `js/data/feats/combat/`, `js/data/feats/general/`, `js/data/feats/magic/` (je nach Quellbuch `phb`/`phb2`/`ca`/`cs`) | `PCManager.js` (`addPCFeat`), `src/components/player/PCFeatsTab.tsx` |
| Auren & Buffs         | `js/models/helpers/modifiers/SpellModifierApplier.js`, `js/rules/attack/AttackContext.js`, `js/rules/BuffRules.js` | `js/network/SyncProtocol.js` (Sync über Supabase Realtime, kein WebRTC) |
| Zwei-Waffen-Kampf     | `AttackEngine.js` (`buildContext`)                       | `offense/WeaponStashCard.tsx`, `PCOffenseTab.tsx` |
| Doppelwaffen          | `Weapon.js` (`isDoubleWielded`)                          | `offense/WeaponStashCard.tsx`, `AttackEngine.js`, `PCOffenseTab.tsx` |
| Initiative / RK       | `src/components/player/PCDefenses.tsx`, `src/components/player/PCDefensesTab.tsx` | `Combatant.js`, `helpers/modifiers/` |
| HP & Globe            | `src/components/player/PCHealthGlobe.tsx`                | `PCManager.js` (`applyDamage`/`applyHeal`)  |
| Netzwerk-Sync         | `js/network/SyncProtocol.js`                             | `js/network/MessageQueue.js`, `js/network/DeltaRenderer.js` (Supabase Realtime; PeerJS/WebRTC-`NetworkManager.js` entfernt) |
| Service Worker / Cache| `service-worker.js`, `scratch/update_sw.js`              | `index.html`                                 |
| DM-Screen & Init-Bar  | `src/components/dm/DMScreen.tsx`, `DMCombatantsTable.tsx`, `InitBar.tsx` | `src/App.tsx`, `src/components/player/PlayerSheet.tsx` |
| Kampf-Verwaltung      | `js/state/EncounterManager.js`, `js/state/ConditionManager.js`, `js/state/ConcentrationManager.js`, `js/state/EncounterSamples.js` | `js/state.js`, `js/network/SyncProtocol.js`, `Tests/` |
| Prestige Classes      | `js/rules/classValidation.js` (Voraussetzungen), `js/rules/prestigeClassEngine.js` (Stufen-Features), `js/data/prestigeClasses-data.js` (Fassade, mergt `-dmg.js`/`-cs.js`/`-ca.js`) | `src/components/player/features/PrestigeClassFeaturesCard.tsx`, `PCAttributes.tsx`, `Step3LevelConfig.tsx`, `Tests/prestige.test.js`, `Tests/prestigeClassEngine.test.js`, `Tests/prestige_guidance.test.js` |

---


## 4. State-API — häufige Aktionen

```js
// Felder & Batch
updatePCField(key, val)             // einzelnes Feld setzen
updatePCBatch(fn)                   // transaktionale Mutation (fn erhält activePC)

// Waffen
addPCWeapon()                       // neue leere Waffe
updatePCWeapon(idx, field, val)     // Feld einer Waffe setzen (inkl. extraDamageDice, extraDamageType)
togglePCWeaponEquip(idx)            // an/ablegen

// Rüstung
addPCArmor(typeKey)                 // neue Rüstung (typeKey aus ARMOR_REGISTRY)
togglePCArmorEquip(idx)             // an/ablegen

// Magische Gegenstände
addPCItem()                         // neues leeres Item
updatePCItem(idx, field, val)
togglePCItemEquip(idx, slotKey)
addPCItemEffect(itemIdx)
updatePCItemEffect(itemIdx, effectIdx, key, val)
deletePCItemEffect(itemIdx, effectIdx)

// Talente & Klasse
addPCFeat(featId, option?)
updatePCClassType(classIdx, classType)

// Kampf-Toggles
togglePCDefensiveFighting(bool)
togglePCTotalDefense(bool)
```

---

## 5. Cache-Versionskonvention

Format: `dnd-combatsheet-vX.Y.Z-cache-vN`

- **N++** bei Bugfix / kleinerer Änderung innerhalb einer Version
- **N=1** wenn X, Y oder Z hochgehen
- Immer **beide** Stellen gleichzeitig bumpen:
  - `service-worker.js` Zeile 1: `const CACHE_NAME = '...'`
  - `index.html` Footer-Versionsstring
- ⚠️ **Bekannte Abweichung (Stand 2026-09-11):** `index.html` enthält aktuell keinen Footer-Versionsstring mehr. Ob dieser wieder eingeführt werden soll, ist offen (Nutzer-Entscheidung ausstehend) — bis dahin ist `service-worker.js` die einzige verlässliche Versionsquelle.

---

## 6. Anti-Patterns (nie tun)

- HTML-Strings in `js/models/` erzeugen
- D&D-Rechenlogik direkt in UI-Dateien — immer Rule-Engine verwenden
- `js/state/state-core.js` direkt importieren — immer `js/state.js`
- PHB/DMG-Rohtexte in den Kontext laden — `scratch/search_phb.js` / `scratch/search_dmg.js` nutzen
- Zeilennummern in `AGENT.md` eintragen — veralten sofort, nur Funktionsnamen
- Halbe Ränge bei cross-class skills verbessern den Wurf nicht — beim Modifikator immer `Math.floor`

---

## 7. Offene Bugs & Roadmap

- Ältere Refactoring-Masterpläne und Code-Audits wurden am 2026-09-02 bewusst archiviert und entfernt (Single Source of Truth statt Kontext-Altlasten).
- Versionshistorie & Features: `docs/CHANGELOG.md`
- Entwicklerhandbuch (UI-Details, Skalierung, Dialog-Maße): `docs/DEVELOPER_GUIDE.md`

---

## 8. SELBSTWARTUNGSREGELN

### 8.1 Datei-Header

Neue **oder inhaltlich geänderte** `.js`-Dateien bekommen einen `@module`-Header.  
**Beim reinen Lesen ohne eigene Änderungen: kein Header erforderlich.**

```js
/**
 * @module    <DateiName ohne .js>
 * @summary   <Ein Satz: Was tut diese Datei?>
 * @exports   <Exportierte Funktionen/Klassen, kommasepariert>
 * @reads     <pc-Felder oder State die gelesen werden>
 * @stateOps  <State-Aktionen die aufgerufen werden, oder "keine">
 * @depends   <Importierte Module, nur die wichtigsten>
 * @notHere   <Was gehört NICHT in diese Datei? Wo ist es stattdessen?>
 */
```

### 8.2 Feature-Tags

An **nicht-offensichtlichen Stellen** (Feature-Logik in generischer Datei, Cross-File-Abhängigkeit):

```js
// @feature:<feature-name>  (z.B. wildshape, twf, magicitem)
```

### 8.3 Konsistenz-Check nach Änderungstyp

| Änderungstyp | Erforderliche Schritte |
|---|---|
| Trivial (Text, Style, Datenpflege) | Nichts — direkt committen |
| Bugfix in Logik / Regeln | `@module`-Header prüfen, gezielter Test (Tier 2) |
| Neues Feature / neue Datei | Header + `@feature`-Tags + §3 aktualisieren + globaler Test (Tier 3) |
| Datei-Split | Header aller neuen Dateien, Fassade mit `@summary Fassade — re-exportiert X, Y, Z`, §3 aktualisieren |
| Neue State-Aktion | §4 (State-API) ergänzen |

---

## 9. Dateigrößen-Richtwerte & UI-Modularisierungs-Standard

| Größe | Bedeutung |
|---|---|
| **<= 450Z** | **Harter Standard für alle UI-Komponenten in `src/components/`** (100% eingehalten). |
| < 300Z | Ideal — modular, lesbar ohne Scroll, agent-freundlich. |
| > 450Z | **Unzulässig:** Sofort in Domain-Subkomponenten im passenden Subfolder aufteilen. |

---

## 10. Tiered Testing Routine (Token-Drosselung)

Um den Kontextfenster- und Tokenverbrauch für den AI-Agenten minimal zu halten, gilt für alle Testläufe folgende dreistufige Hierarchie (Tiered Testing):

* **Tier 1 (Trivial):** Reine UI-CSS-Änderungen, Tippfehler-Fixes oder statische Datenpflege benötigen **keinen** Testlauf.
* **Tier 2 (Lokal):** Bei logischen Änderungen an einem spezifischen Modul darf **nur das passende Testfile** ausgeführt werden (z. B. `node scripts/run_agent_tests.js Tests/skills.test.js`).
* **Tier 3 (Global):** Die gesamte Testsuite (`node scripts/run_agent_tests.js`) wird **maximal einmal** direkt vor Turn-Ende bei tiefgreifenden architektonischen Umbauten oder Datei-Splits ausgeführt.
