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

# D&D-REGELWERK DURCHSUCHEN (NIE die TXT laden):
node scratch/search_rules.js "<Suchabfrage>"

# ZAUBER-DATENBANK DURCHSUCHEN (NIE spells_de.json direkt laden):
node scratch/search_spells.js "<Zaubername>"
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
| Wild Shape            | `js/models/helpers/classes/DruidHelper.js`                | `Combatant.js`, `PCOffense.js`, `DruidFeatures.js` |
| Natürliche Angriffe   | `js/ui/components/player/offense/NaturalAttacksRenderer.js` (`SHAPE_ATTACKS`) | `js/rules/AttackEngine.js` (`isNatural`), `PCOffense.js` |
| Magische Gegenstände  | `js/models/Item.js`, `PCMagicItemsTab.js`                | `js/state/PCManager.js` (`addPCItem*`)       |
| Waffen-UI             | `js/ui/components/player/offense/WeaponStashCard.js`, `src/components/player/offense/WeaponStashCard.tsx` | `AttackEngine.js`, `js/models/Weapon.js`, `InventoryStashRenderer.js` |
| Rüstung               | `js/models/Armor.js`, `js/data/armor-data.js`, `offense/ArmorStashCard.js`, `src/components/player/offense/ArmorStashCard.tsx` | `PCOffense.js`, `InventoryStashRenderer.js`  |
| Ausrüstung (React)    | `src/components/player/PCOffenseTab.tsx`, `ActiveEquipmentSlots.tsx` | `PlayerSheet.tsx` |
| Angriffs-Engine       | `js/rules/AttackEngine.js`, `js/rules/attack/`           | `PCOffense.js`, `dialogs/AttackChoiceDialog.js` |
| Rettungswürfe         | `js/rules/SaveCalculator.js`                             | `js/models/Combatant.js`, `helpers/modifiers/` |
| Zauber / Slots        | `PCSpellbookTab.js`, `PCCompendiumTab.js`, `helpers/spells/CombatantSpells.js` | `SpellSlotCalculator.js`, `Combatant.js` |
| Klassen-Features      | `js/models/helpers/classes/CombatantClassFeatures.js`    | `Combatant.js`, `js/ui/components/class-features/` |
| Talente               | `js/data/feats-data.js`, `js/data/feats-combat.js`, `js/data/feats-magic.js`, `js/data/feats-general.js` | `PCManager.js` (`addPCFeat`), `PCFeatsTab.js` |
| WebRTC-Auren & Buffs  | `js/models/helpers/modifiers/SpellModifierApplier.js`, `js/rules/attack/AttackContext.js` | `js/network/SyncProtocol.js` |
| Zwei-Waffen-Kampf     | `AttackEngine.js` (`buildContext`)                       | `offense/WeaponStashCard.js`, `PCOffenseTab.tsx` |
| Doppelwaffen          | `Weapon.js` (`isDoubleWielded`)                          | `offense/WeaponStashCard.js`, `AttackEngine.js`, `PCOffenseTab.tsx` |
| Initiative / RK       | `PCDefenses.js`                                          | `Combatant.js`, `helpers/modifiers/`         |
| HP & Globe            | `PCHealthGlobe.js`                                       | `PCManager.js` (`applyDamage`/`applyHeal`)  |
| Netzwerk-Sync         | `js/network/SyncProtocol.js`                             | `NetworkManager.js`, `MessageQueue.js`       |
| Service Worker / Cache| `service-worker.js`, `scratch/update_sw.js`              | `index.html`                                 |
| DM-Screen & Init-Bar  | `src/components/dm/DMScreen.tsx`, `DMCombatantsTable.tsx`, `InitBar.tsx` | `src/App.tsx`, `src/components/player/PlayerSheet.tsx` |
| Kampf-Verwaltung      | `js/state/EncounterManager.js`, `js/state/ConditionManager.js`, `js/state/ConcentrationManager.js`, `js/state/EncounterSamples.js` | `js/state.js`, `js/network/SyncProtocol.js`, `Tests/` |
| Prestige Classes      | `js/rules/classValidation.js` (Voraussetzungen), `js/rules/prestigeClassEngine.js` (Stufen-Features), `js/data/prestigeClasses-dmg.js` (Registry + UI-Metadaten) | `src/components/player/features/PrestigeClassFeaturesCard.tsx`, `PCAttributes.tsx`, `Step3LevelConfig.tsx`, `Tests/prestige.test.js`, `Tests/prestigeClassEngine.test.js` |

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

---

## 6. Anti-Patterns (nie tun)

- HTML-Strings in `js/models/` erzeugen
- D&D-Rechenlogik direkt in UI-Dateien — immer Rule-Engine verwenden
- `js/state/state-core.js` direkt importieren — immer `js/state.js`
- `playershandbook_35e.txt` in den Kontext laden — `search_rules.js` nutzen
- Zeilennummern in `AGENT.md` eintragen — veralten sofort, nur Funktionsnamen
- Halbe Ränge bei cross-class skills verbessern den Wurf nicht — beim Modifikator immer `Math.floor`

---

## 7. Offene Bugs & Roadmap

- **Refactoring Masterplan (100% Green Healthcheck):** `docs/refactoring_masterplan_v6.md`
- **Code-Audit & Tiefenanalyse:** `docs/deep_code_audit_analysis.md`
- Versionshistorie & Features: `docs/PATCHNOTES.md`
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

## 9. Dateigrößen-Richtwerte

| Größe    | Bedeutung                                                  |
|----------|------------------------------------------------------------|
| < 300Z   | Ideal — lesbar ohne Scroll, agent-freundlich               |
| 300–600Z | Akzeptabel — Header ist Pflicht                            |
| 600–900Z | Split prüfen beim nächsten größeren Feature                |
| > 900Z   | Split bei nächster Gelegenheit — Issue in Bugtracking.md   |

---

## 10. Tiered Testing Routine (Token-Drosselung)

Um den Kontextfenster- und Tokenverbrauch für den AI-Agenten minimal zu halten, gilt für alle Testläufe folgende dreistufige Hierarchie (Tiered Testing):

* **Tier 1 (Trivial):** Reine UI-CSS-Änderungen, Tippfehler-Fixes oder statische Datenpflege benötigen **keinen** Testlauf.
* **Tier 2 (Lokal):** Bei logischen Änderungen an einem spezifischen Modul darf **nur das passende Testfile** ausgeführt werden (z. B. `node scripts/run_agent_tests.js Tests/skills.test.js`).
* **Tier 3 (Global):** Die gesamte Testsuite (`node scripts/run_agent_tests.js`) wird **maximal einmal** direkt vor Turn-Ende bei tiefgreifenden architektonischen Umbauten oder Datei-Splits ausgeführt.
