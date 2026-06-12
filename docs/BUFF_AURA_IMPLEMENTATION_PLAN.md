# Implementierungsplan: Buff- & Aurenmanager (D&D 3.5e RAW)

Dieser Plan beschreibt die schrittweise Einführung eines Buff- und Aurenmanagers für die Combat-App. Um Qualitätskonzepte und Code-Integrität zu wahren, ist der Plan in granulare, logische Stufen unterteilt, wobei jede Stufe erst durch Tests abgesichert wird, bevor die nächste Phase beginnt.

---

## User Review Required

> [!IMPORTANT]
> **Architektonischer Ansatz (Modell & State):**
> *   Wir speichern aktive Buffs im bestehenden Array `pc.activeBuffs` auf dem `pc`-Modell.
> *   Ein Buff wird als `{ id, spellKey, name, effects: [{ target, value, type, source }] }` strukturiert.
> *   Über `CombatState.updatePCBatch` fügen wir Buffs hinzu oder entfernen sie. Anschließend triggert `pc.rebuildStatModifiers()` die reaktive Neuberechnung aller Statistiken.
> 
> **Integration in die AttackEngine:**
> *   In [AttackContext.js](file:///c:/Users/Juls/Desktop/CombatApp/js/rules/attack/AttackContext.js) werten wir in `buildContext` alle aktiven Buffs aus, die auf Angriffe (`atk`) und Schaden (`dmg`) wirken.
> *   Wir implementieren eine D&D 3.5e RAW Stacking-Logik für Angriffs- und Schadensboni: Boni desselben Typs (z. B. Moral, Glück, Verbesserung) stacken **nicht** (nur der höchste gilt), während Ausweich- (`dodge`) und untypisierte Boni (`untyped`) **additiv stacken**.
> *   Diese Boni werden als `ctx.buffAtkBonus` and `ctx.buffDmgBonus` an die Modifier-Rechner weitergegeben.
> 
> **UI-Integration (Kein Tab-Bloat):**
> *   Um das Tab-System schlank zu halten, platzieren wir in [PCDefenses.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCDefenses.js) einen edlen Button `✨ Buffs (N)` (N = Anzahl aktiver Buffs) direkt neben dem Header "Verteidigung & Rettung".
> *   Der Klick öffnet ein schickes, touch-freundliches Overlay-Popup (Buff-Manager-Dialog), in dem man aktive Buffs löschen, Standard-Voreinstellungen per Schnellklick aktivieren oder Custom-Buffs hinzufügen kann.

---

## D&D 3.5e RAW Stacking-Regeln & Typen

Folgende Bonustypen werden im System registriert und nach 3.5e RAW verarbeitet:

| Bonus-Typ | Stacking-Regel | Typische Quellen / Beispiele |
| :--- | :--- | :--- |
| **Verbesserung (Enhancement)** | Stackt nicht (höchster gilt) | *Stärke des Stiers* (+4 STR), Magische Waffen/Rüstung |
| **Ablenkung (Deflection)** | Stackt nicht (höchster gilt) | *Schild des Glaubens* (+2 RK), Schutzring |
| **Moral (Morale)** | Stackt nicht (höchster gilt) | *Segen* (+1 ATK), *Heldenmut* (+2 ATK/Saves) |
| **Glück (Luck)** | Stackt nicht (höchster gilt) | *Gebet* (+1 ATK/DMG/Saves), *Göttliche Gunst* |
| **Einsicht (Insight)** | Stackt nicht (höchster gilt) | *Wahrer Schlag* (+20 ATK) |
| **Heilig / Unheilig (Sacred / Profane)** | Stackt nicht (höchster gilt) | Weihe-Effekte, religiöse Boni |
| **Rüstung (Armor)** | Stackt nicht (höchster gilt) | *Magierrüstung* (+4 RK), Normale Rüstung |
| **Schild (Shield)** | Stackt nicht (höchster gilt) | *Schild* (+4 RK), Getragener Schild |
| **Natürliche Rüstung (Natural Armor)** | Stackt nicht (höchster gilt) | *Rindenhaut* (+2 bis +5 RK), Monsterrassen |
| **Größe (Size)** | Stackt nicht (höchster gilt) | *Person vergrößern* |
| **Ausweichen (Dodge)** | **Stackt immer additiv** | *Hast* (+1 RK), Talent Ausweichen |
| **Ohne Typ (Untyped)** | **Stackt immer additiv** (sofern unterschiedliche Quelle) | Verschiedene Zauber/Effekte |

---

## Implementierungsstufen & Einzelschritte

### Stufe 1: Datenmodell & Berechnungs-Fundament (Backend)
Ziel dieser Stufe ist die vollständige Implementierung der Berechnungslogik im Hintergrund, ohne UI-Elemente zu berühren.

*   **Schritt 1.1: Erweiterung des SpellModifierAppliers**
    *   *Datei:* [SpellModifierApplier.js](file:///c:/Users/Juls/Desktop/CombatApp/js/models/helpers/modifiers/SpellModifierApplier.js)
    *   *Aktion:* Anpassung von `applySpellModifiers(pc)`. Wenn ein aktiver Buff im Array `pc.activeBuffs` direkt ein `effects`-Array definiert (Custom-Buffs/Auren), wird dieses analog zu den Standard-Zaubern aus der Registry geladen und über eine neue Hilfsfunktion `applyEffect(pc, eff, source)` auf die Stat-Instanzen angewendet.
*   **Schritt 1.2: Stacking-Auflösung in buildContext**
    *   *Datei:* [AttackContext.js](file:///c:/Users/Juls/Desktop/CombatApp/js/rules/attack/AttackContext.js)
    *   *Aktion:* Erweiterung der Methode `buildContext(pc, weapon, options)`. Wir loopen durch `pc.activeBuffs` und sammeln Boni/Mali, die auf `atk` (Angriff) und `dmg` (Schaden) wirken. Die typisierten Boni werden nach den D&D 3.5e RAW Regeln gefiltert (höchster typisierter Bonus zählt; Dodge- und Untyped-Boni werden addiert). Die Boni werden als `buffAtkBonus`, `buffAtkBreakdown`, `buffDmgBonus` und `buffDmgBreakdown` im Kontext-Objekt bereitgestellt.
*   **Schritt 1.3: Integration in die Modifikator-Rechner der AttackEngine**
    *   *Datei:* [ModifierCalculator.js](file:///c:/Users/Juls/Desktop/CombatApp/js/rules/attack/ModifierCalculator.js)
    *   *Aktion:* In `calculateGeneralAtkModifiers` wird `ctx.buffAtkBonus` auf `generalAtkMod` aufaddiert und dessen Breakdown-Einträge an `generalAtkBreakdown` angehängt. In `calculateGeneralDmgModifiers` geschieht dasselbe analog mit `ctx.buffDmgBonus` and `generalDmgBreakdown`.
*   **Schritt 1.4: Absicherung durch automatisierte Tests (TDD)**
    *   *Datei:* [NEW] `Tests/buff_stacking.test.js`
    *   *Aktion:* Erstellung einer Testsuite. Getestet wird:
        1. Dass zwei Stärkeboni (Enhancement) nicht stacken (nur der höchste zählt).
        2. Dass Dodge-Boni (z.B. Hast) und Untyped-Boni additiv stacken.
        3. Dass Angriffsboni von *Segen* (morale) und *Hast* (dodge) korrekt zu +2 addiert werden.
        4. Dass *Gebet* (luck) und *Segen* (morale) auf Angriffe stacken.
    *   *Validierung:* Ausführen mit `node --import ./Tests/setup.js --test Tests/**/*.test.js`. Alle Tests müssen grün sein.

### Stufe 2: UI-Komponenten & Event-Binding (Frontend)
Ziel dieser Stufe ist die Bereitstellung des intuitiven, touch-freundlichen Interfaces.

*   **Schritt 2.1: Platzierung des Buff-Buttons im PC-Sheet**
    *   *Datei:* [PCDefenses.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCDefenses.js)
    *   *Aktion:* Integration eines Buttons `✨ Buffs (N)` in den Header von `defenses.innerHTML` neben der Überschrift "Verteidigung & Rettung".
    *   *Event-Binding:* Zuweisen eines Klick-Event-Handlers in `bindEvents()`, der den `showBuffManagerDialog(pc)` aufruft.
*   **Schritt 2.2: Erstellung des Buff-Manager-Dialogs**
    *   *Datei:* [NEW] [BuffManagerDialog.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/dialogs/BuffManagerDialog.js)
    *   *Aktion:* Definition der Dialog-Schnittstelle. Der Dialog zeigt drei Bereiche:
        1. **Aktive Buffs:** Liste aller Objekte in `pc.activeBuffs` mit Details (Werte, Typen, Quellen) und Löschen-Button (`✕`).
        2. **Schnellauswahl:** Vordefinierte Buttons für 10 populäre Buffs (Bless, Haste, Mage Armor, Shield, Bull's Strength, Cat's Grace, Bear's Endurance, Owl's Wisdom, Shield of Faith, Heroism, Prayer) für sofortige Aktivierung.
        3. **Custom-Buff-Formular:** Einfaches Formular mit Eingabefeldern für Name, Ziel-Statistik (Dropdown), Bonus-Typ (Dropdown) und Wert (Zahleneingabe).
*   **Schritt 2.3: Reaktiver Sync & State-Update**
    *   *Datei:* [BuffManagerDialog.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/dialogs/BuffManagerDialog.js)
    *   *Aktion:* Implementierung der Aktivierungs- und Deaktivierungs-Handler. Jede Änderung modifiziert `pc.activeBuffs` über `CombatState.updatePCBatch()`, ruft `pc.rebuildStatModifiers()` zur Neuberechnung auf, speichert im Storage, synct zum Host und triggert `uiRegistry.renderPlayerScreen()`.

### Stufe 3: Integration, Service-Worker & Release-Vorbereitung
Ziel dieser Stufe ist die Integration in den Build, die Offline-Bereitstellung und die Dokumentation.

*   **Schritt 3.1: Offline-Caching & Cache-Bump**
    *   *Datei:* [service-worker.js](file:///c:/Users/Juls/Desktop/CombatApp/service-worker.js) & [index.html](file:///c:/Users/Juls/Desktop/CombatApp/index.html)
    *   *Aktion:* Registrierung der neuen Datei `./js/ui/dialogs/BuffManagerDialog.js` in der `ASSETS`-Liste des Service Workers. Erhöhung der Cache-Version von `v3.3.1-cache-v1` auf `v3.3.2-cache-v1` (bzw. `v3.3.2` im HTML-Footer).
*   **Schritt 3.2: Detaillierte Patchnotes & Dokumenten-Bereinigung**
    *   *Datei:* [PATCHNOTES.md](file:///c:/Users/Juls/Desktop/CombatApp/docs/PATCHNOTES.md)
    *   *Aktion:* Eintrag der Version `v3.3.2` in der Versions-Tabelle und Beschreibung der neuen Features (Buff- & Aurenmanager) im Changelog.
*   **Schritt 3.3: Abschluss-Regressionstest**
    *   *Aktion:* Manuelle Überprüfung aller Features im Browser (Reaktivität von RK, Attributen und Waffenschaden bei Buff-Änderungen) und anschließender Durchlauf der gesamten Testsuite.

---

## Proposed File Changes Summary

### [NEW] [BuffManagerDialog.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/dialogs/BuffManagerDialog.js)
* Touch-optimierter Dialog zur Anzeige, Auswahl und Erstellung von Buffs.

### [NEW] [buff_stacking.test.js](file:///c:/Users/Juls/Desktop/CombatApp/Tests/buff_stacking.test.js)
* Testet die regelkonforme Berechnung und das Stacking von Attributs- und Angriffsmodifikatoren.

### [MODIFY] [SpellModifierApplier.js](file:///c:/Users/Juls/Desktop/CombatApp/js/models/helpers/modifiers/SpellModifierApplier.js)
* Unterstützung für direkt definierte Buff-Effekte.

### [MODIFY] [AttackContext.js](file:///c:/Users/Juls/Desktop/CombatApp/js/rules/attack/AttackContext.js)
* Auswertung und Stacking-Auflösung von Angriffs- und Schadensbuffs.

### [MODIFY] [ModifierCalculator.js](file:///c:/Users/Juls/Desktop/CombatApp/js/rules/attack/ModifierCalculator.js)
* Einbindung der Buff-Modifikatoren in die Angriffsmodifikatoren.

### [MODIFY] [PCDefenses.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCDefenses.js)
* Hinzufügen des Trigger-Buttons `✨ Buffs (N)`.

### [MODIFY] [service-worker.js](file:///c:/Users/Juls/Desktop/CombatApp/service-worker.js) & [index.html](file:///c:/Users/Juls/Desktop/CombatApp/index.html)
* Cache-Bump auf `v3.3.2-cache-v1` und Asset-Registrierung.

---

## Verification Plan

### Automated Tests
`node --import ./Tests/setup.js --test Tests/**/*.test.js`

### Manual Verification
1.  **Attributs-Buff:** Aktivieren von *Katzenhafte Anmut* -> DEX steigt um +4, Initiative und Reflex-Rettungswurf steigen reaktiv.
2.  **RK-Buff-Stacking:** Aktivieren von *Magierrüstung* (+4 RK) -> Rüstungsklasse steigt. Anlegen einer normalen Rüstung (z.B. Kettenhemd +5) -> Rüstungsklasse erhöht sich um +5 (da Rüstungsboni nicht stacken und Kettenhemd höher ist).
3.  **ATK-Buff-Stacking:** Aktivieren von *Segen* (+1 Moral auf ATK) und *Hast* (+1 Ausweichen auf ATK) -> Waffen-ATK-Buttons zeigen reaktiv +2 Angriffsbonus. Klick auf ATK -> Roll-Breakdown zeigt beide Quellen getrennt an.
