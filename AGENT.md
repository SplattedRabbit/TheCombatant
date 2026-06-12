# AGENT.md — AI Agent Navigation & Selbstwartungsanleitung
# CombatApp (D&D 3.5e) | Lies diese Datei ZUERST, vor jeder anderen.
# WICHTIG: Kommuniziere mit dem Benutzer IMMER auf Deutsch.

---

## 1. Pflichtbefehle

> [!IMPORTANT]
> **Token-Schonung bei Unittests:** Das Ausführen aller 170+ Tests erzeugt enormen Output und verbraucht wertvolle Context-Token. Führe im Alltag immer nur den spezifischen Test aus, der zu deiner Änderung passt. Den globalen Testlauf machst du ausschließlich **einmalig direkt vor dem Turn-Ende**.

```powershell
# 1. GEZIELTES TESTEN (Standard-Workflow während der Entwicklung):
# Finde den spezifischen Test in /Tests/ und führe nur diesen aus (Beispiel):
node --import ./Tests/setup.js --test Tests/bugfixes_v350.test.js

# 2. GLOBALER TESTLAUF (NUR einmalig direkt vor dem Turn-Ende erlaubt):
node --import ./Tests/setup.js --test Tests/**/*.test.js

# 3. D&D-REGELWERK DURCHSUCHEN (NIE die PDF laden):
node scratch/search_rules.js "<Suchabfrage>"
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
| Waffen-UI             | `js/ui/components/player/offense/WeaponStashCard.js` (`createStashWeaponCard`) | `AttackEngine.js`, `js/models/Weapon.js`, `InventoryStashRenderer.js` |
| Rüstung               | `js/models/Armor.js`, `js/data/armor-data.js`, `offense/ArmorStashCard.js` | `PCOffense.js`, `InventoryStashRenderer.js`  |
| Angriffs-Engine       | `js/rules/AttackEngine.js`, `js/rules/attack/`           | `PCOffense.js`, `dialogs/AttackChoiceDialog.js` |
| Rettungswürfe         | `js/rules/SaveCalculator.js`                             | `js/models/Combatant.js`, `helpers/modifiers/` |
| Zauber / Slots        | `PCSpellbookTab.js`, `PCCompendiumTab.js`, `helpers/spells/CombatantSpells.js` | `SpellSlotCalculator.js`, `Combatant.js` |
| Klassen-Features      | `js/models/helpers/classes/CombatantClassFeatures.js`    | `Combatant.js`, `js/ui/components/class-features/` |
| Talente               | `js/data/feats-data.js`, `js/data/feats-combat.js`, `js/data/feats-magic.js`, `js/data/feats-general.js` | `PCManager.js` (`addPCFeat`), `PCFeatsTab.js` |
| WebRTC-Auren & Buffs  | `js/models/helpers/modifiers/SpellModifierApplier.js`, `js/rules/attack/AttackContext.js` | `js/network/SyncProtocol.js` |
| Zwei-Waffen-Kampf     | `AttackEngine.js` (`buildContext`)                       | `offense/WeaponStashCard.js`                 |
| Doppelwaffen          | `Weapon.js` (`isDoubleWielded`)                          | `offense/WeaponStashCard.js`, `AttackEngine.js` |
| Initiative / RK       | `PCDefenses.js`                                          | `Combatant.js`, `helpers/modifiers/`         |
| HP & Globe            | `PCHealthGlobe.js`                                       | `PCManager.js` (`applyDamage`/`applyHeal`)  |
| Netzwerk-Sync         | `js/network/SyncProtocol.js`                             | `NetworkManager.js`, `MessageQueue.js`       |
| Service Worker / Cache| `service-worker.js` Zeile 1                              | `index.html` Fußzeile (Version-String)       |

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

- **N++** bei jedem Bugfix / kleinerer Änderung innerhalb einer Version
- **N=1** wenn X, Y oder Z hochgehen
- Immer **beide** Stellen gleichzeitig bumpen:
  - `service-worker.js` Zeile 1: `const CACHE_NAME = '...'`
  - `index.html` Fußzeile: Versionsstring im letzten `<div>`

---

## 6. Anti-Patterns (nie tun)

- HTML-Strings in `js/models/` erzeugen
- D&D-Rechenlogik direkt in UI-Dateien — immer Rule-Engine verwenden
- `js/state/state-core.js` direkt importieren — immer `js/state.js`
- `playershandbook_35e.pdf` in den Kontext laden — `search_rules.js` nutzen
- Zeilennummern in `AGENT.md` eintragen — veralten sofort, nur Funktionsnamen
- Halbe Ränge bei klassenübergreifenden Fertigkeiten (cross-class skills) verbessern den Wurf nicht — Ränge bei Modifikator-Berechnungen immer mit `Math.floor` abrunden.
- Dialogfenster für Zauberauswahl, Buffauswahl oder Vorbereitung mit weniger als `480px` bis `520px` Breite dimensionieren — dies führt zu abgeschnittenen Inhalten und Metamagic-Optionen.

---

## 7. Offene Bugs & Roadmap

- Aktuelle Bug-Liste: `docs/Bugtracking.md`
- Versionshistorie & Features: `docs/PATCHNOTES.md`
- Vollständige Architektur-Doku: `docs/DEVELOPER_TRANSITION.md`

---

## 8. SELBSTWARTUNGSREGELN — Pflicht für jeden Agenten

> Diese Sektion ist der Kern der Datei. Halte sie aktuell — sie hält dich effizient.

### 8.1 Nach jeder neuen Datei → Datei-Header einfügen

Jede neue `.js`-Datei bekommt als erste 8 Zeilen:

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

**Regressives Nachpflegen:** Wenn du eine bestehende Datei öffnest und sie hat noch keinen Header — füge ihn hinzu, bevor du die Datei wieder verlässt. Kein eigener Commit nötig, einfach mit den anderen Änderungen committen.

### 8.2 Nach jeder neuen Feature-Implementierung → Feature-Tag setzen

An **jeder nicht-offensichtlichen Stelle** im Code die zu diesem Feature gehört:

```js
// @feature:<feature-name>
```

Wann ist eine Stelle "nicht offensichtlich"?
- Feature-Logik versteckt in einer generischen Datei (z.B. Wild-Shape-Daten in `PCOffense.js`)
- Cross-File-Abhängigkeit (A ruft B auf, B kennt das Feature nicht aus dem Namen)
- Spezialfall-Handling das nicht aus dem Kontext hervorgeht

Verwende immer **denselben** `<feature-name>` für alle Tags eines Features (z.B. `wildshape`, `twf`, `magicitem`).

### 8.3 Nach jedem neuen Feature → Tabelle in §3 aktualisieren

Wenn ein neues Feature hinzukommt, ergänze eine Zeile in der Tabelle unter §3.  
Format: `| Feature | Primärdatei(en) | Sekundär |`  
Keine Zeilennummern — nur Dateiname und Funktionsname.

### 8.4 Nach jeder neuen State-Aktion → §4 aktualisieren

Wenn eine neue Funktion in `js/state.js` oder `js/state/PCManager.js` exportiert wird, trage sie in §4 ein — mit einem Einzeiler-Kommentar.

### 8.5 Nach jedem Datei-Split → Header in allen neuen Dateien, §3 aktualisieren

Wenn eine Datei aufgeteilt wird:
1. Jede neue Datei bekommt sofort einen `@module`-Header
2. Die Fassaden-Datei bekommt `@summary Fassade — re-exportiert <X>, <Y>, <Z>`
3. §3 dieser Datei aktualisieren (alte Zeile ersetzen oder aufteilen)

### 8.6 Konsistenz-Check vor jedem Commit

Beantworte kurz diese 4 Fragen — wenn eine "Nein" ist, nachbessern:

```
[ ] Haben alle neuen/geänderten Dateien einen @module-Header?
[ ] Sind neue @feature:-Tags gesetzt wo nötig?
[ ] Ist §3 (Feature-Tabelle) noch korrekt?
[ ] Ist §4 (State-API) noch vollständig?
```

---

## 9. Dateigrößen-Richtwerte

| Größe     | Bedeutung                                                  |
|-----------|------------------------------------------------------------|
| < 300Z    | Ideal — lesbar ohne Scroll, agent-freundlich               |
| 300–600Z  | Akzeptabel — Header ist Pflicht                            |
| 600–900Z  | Split prüfen beim nächsten größeren Feature in dieser Datei|
| > 900Z    | Split bei nächster Gelegenheit — Issue in Bugtracking.md   |

Aktuell zu groß (Backlog):
- Keine (feats-data.js wurde in feats-combat.js, feats-magic.js und feats-general.js aufgeteilt)
