# Bugtracking: Vorbereitung für Release v4.0.0

Dieses Dokument dient der Erfassung und Vorbereitung von Korrekturen für bekannte Fehler und UI/Regel-Inkonsistenzen. Diese Bugs werden gesammelt und vor dem nächsten großen Release (v4.0.0) behoben.

---

## 1. Fehlende Regelerklärung bei diversen Klassen
*   **Beschreibung:** Einige Klassenfähigkeiten besitzen keine aufklappbaren Erläuterungen (Akkordeon-Stil mit dem Symbol `📖 ▼`), die dem Spieler die D&D 3.5e RAW-Regel direkt im Interface erklären.
*   **Betroffene Dateien:**
    *   Klassen-Komponenten unter `js/ui/components/class-features/` (z. B. `FighterFeatures.js`, `RogueFeatures.js`, `SorcererFeatures.js` etc.)
*   **Lösungsansatz:**
    *   Ergänzen von `📖 ▼` Buttons und Regel-Infoboxen (analog zu *Göttliche Gnade* oder *Böses niederstrecken* in `PaladinFeatures.js`) für alle Haupt-Klassenfähigkeiten.

---

## 2. Handauflegen verwendet nicht den Charismamodifier beim Paladin
*   **Beschreibung:** Die maximale Kapazität des täglichen Pools von *Hände auflegen* (Lay on Hands) wird nicht korrekt mit dem aktuellen Charisma-Modifikator berechnet oder aktualisiert sich nicht reaktiv, wenn das Charisma des Paladins modifiziert wird (z. B. durch Magie).
*   **Betroffene Dateien:**
    *   [PaladinRules.js](file:///c:/Users/Juls/Desktop/CombatApp/js/rules/classes/PaladinRules.js) (insb. Zeile 29–37)
    *   [PCManager.js](file:///c:/Users/Juls/Desktop/CombatApp/js/state/PCManager.js) (Aufrufreihenfolge von `recalculateDailyAbilities` vor `rebuildStatModifiers` prüfen)
*   **Lösungsansatz:**
    *   Sicherstellen, dass `recalculateDailyAbilities` auf die voll berechneten Modifikatoren zugreifen kann oder nach dem Modifikator-Rebuild ausgeführt wird.
    *   Formel zur Poolgröße überprüfen: `Paladin-Stufe * Charisma-Modifikator` (mindestens Charisma 12 erforderlich).

---

## 3. Talente Dropdown ist größer als das Textsuchfeld
*   **Beschreibung:** Im Reiter "Skills & Talente" ist das Auswahldropdown für neue Talente optisch breiter als das Text-Suchfeld, was das Pergament-Layout asymmetrisch verzerrt.
*   **Betroffene Dateien:**
    *   [FeatScrollDialog.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/dialogs/FeatScrollDialog.js)
    *   [PCFeatsTab.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCFeatsTab.js)
*   **Lösungsansatz:**
    *   CSS-Breiten der Steuerelemente im Talente-Tab angleichen (z. B. `width: 100%` oder feste `max-width` vergeben, Flexbox-Ausrichtung prüfen).

---

## 4. Fertigkeiten/Skills nehmen keine "maximale Anzahl an verteilbaren Punkten" an
*   **Beschreibung:** Das Fertigkeitensystem prüft beim Verteilen von Rängen nicht die D&D 3.5e Obergrenze. Spieler können beliebig viele Ränge eintragen, anstatt auf das Maximum (`Charakterstufe + 3` für Klassenfertigkeiten bzw. `(Charakterstufe + 3) / 2` für klassenfremde Fertigkeiten) beschränkt zu werden.
*   **Betroffene Dateien:**
    *   [PCSkillsTab.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCSkillsTab.js)
    *   [Combatant.js](file:///c:/Users/Juls/Desktop/CombatApp/js/models/Combatant.js)
*   **Lösungsansatz:**
    *   Einführung einer Validierung im Ränge-Input.
    *   Verhinderung von Werten über dem Limit (basierend auf der totalen Charakterstufe und dem Klassenfertigkeits-Status).

---

## 5. Schurke: Hinterhältiger Angriff Checkbox verwenden wie beim Paladin "Böses niederstrecken"
*   **Beschreibung:** Für den *Hinterhältigen Angriff* (Sneak Attack) des Schurken fehlt ein direkt zugänglicher Toggle-Schalter im Waffen- und Angriffs-Panel (analog zu dem Smite/Erzfeind-Checkboxen), um den Zusatzschaden schnell für den nächsten Wurf zu aktivieren.
*   **Betroffene Dateien:**
    *   [PCOffense.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCOffense.js) (Rendern der Kampfeinstellungen im oberen Bereich)
*   **Lösungsansatz:**
    *   Eine Checkbox `"Hinterhältiger Angriff"` oben im Waffenkammer-Panel rendern, wenn der Charakter mindestens 1 Stufe als Schurke besitzt (analog zum Paladin-Smite).

---

## 6. Barbar: Kampfrausch-Werte werden nicht richtig berechnet und angewandt
*   **Beschreibung:** Die Werte und Modifikatoren des Kampfrauschs (Rage) des Barbaren werden in den Statistiken und Wurfberechnungen nicht korrekt berechnet oder angewandt.
*   **Betroffene Dateien:**
    *   [BarbarianRules.js](file:///c:/Users/Juls/Desktop/CombatApp/js/rules/classes/BarbarianRules.js)
    *   [Combatant.js](file:///c:/Users/Juls/Desktop/CombatApp/js/models/Combatant.js) (Bereich zur Aktivierung/Deaktivierung des Kampfrauschs in `enterRage()` / `exitRage()`)
*   **Lösungsansatz:**
    *   Überprüfung der Rage-Boni-Rückgabewerte (z. B. Stärke/Konstitution und Willensrettungswürfe) sowie des RK-Malus und Sicherstellung, dass diese Werte bei aktivem Kampfrausch korrekt auf die Attribute addiert werden.

## 7. Scrollverhalten wenn Entitäten hinzugefügt werden. Boxen sollen größer werden und nicht das Applayout selbst
*   **Beschreibung:** Ähnlich wie bei Skills, Feats/Talenten, Zauberkompendium und Zauberbuch soll sich auch die Tabelle gelernte Zauber, alle Waffen und Rüstungsitems im Rucksack verhalten, um das Strecken des App-Layouts zu verhindern.
*   **Betroffene Dateien:**
    *   [PCOffense.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCOffense.js) (Rucksack/Inventar: Waffenkammer & Rüstungskammer)
    *   [PCSpellbookTab.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCSpellbookTab.js) (Gelernte Zauber Bibliothek)
*   **Lösungsansatz:**
    *   Einführung von `max-height` (z.B. `250px` oder `300px`) und `overflow-y: auto` für die Container `#pcWeaponsList` und `#pcArmorList` in `PCOffense.js`.
    *   Sicherstellen, dass die Container für gelernte Zauber in `PCSpellbookTab.js` (Klasse `pc-scroll-spellbook`) sauberes internes Scrollen nutzen.

## 8. "Bekannte" Zauber werden nicht berücksichtigt beim übertragen der Zauber in das Zauberbuch
*   **Beschreibung:** Der Spieler kann mehr Zauber als eigentlich vorgesehen in der Zauberbibliothek ablegen (Spells Known Limit für Barden & Hexenmeister).
*   **Betroffene Dateien:**
    *   [rules.js](file:///c:/Users/Juls/Desktop/CombatApp/js/rules.js) (Definieren der PHB-Tabellen für bekannte Zauber pro Klasse/Stufe)
    *   [PCSpellDialogs.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCSpellDialogs.js) (Methode `onToggleLearn`)
*   **Lösungsansatz:**
    *   Hinzufügen von `SORCERER_KNOWN_TABLE` und `BARD_KNOWN_TABLE` in `CombatRules` (`rules.js`).
    *   Implementieren einer Validierungsmethode in `rules.js` oder `SpellSlotCalculator.js`.
    *   In `PCSpellDialogs.js` beim Hinzufügen eines Zaubers prüfen, ob das Limit für den jeweiligen Zaubergrad des Charakters erreicht ist. Falls ja, das Hinzufügen blockieren und ein Warn-Popup anzeigen.

## 9. An Waffenslots soll ausgewählt werden können ob sie Main- oder Offhand sind
*   **Beschreibung:** Spieler sollten die Handzuweisung (Haupthand / Nebenhand) direkt in den aktiven Ausrüstungsslots steuern können.
*   **Betroffene Dateien:**
    *   [PCOffense.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCOffense.js) (Rendern und Event-Handling der Haupthand- und Nebenhand-Ausrüstungsslots)
*   **Lösungsansatz:**
    *   Rendern eines kleinen Dropdowns direkt in den aktiven Waffen-Slots (`Haupthand` / `Nebenhand`) in der Übersicht, sofern es sich um eine einhändige Waffe handelt.
    *   Auswahl ändert direkt das Attribut `w.hand` in der Charakterdatei und triggert einen Re-Render, um die Waffe sauber in den anderen Slot zu verschieben.

## 10. Anzeige für Leveldropdown ist abgeschnitten und Level schlecht lesbar
*   **Beschreibung:** Das Dropdown zur Auswahl der Klassenstufe ist im Attributs-Panel visuell abgeschnitten, wodurch Zahlen teilweise unlesbar sind.
*   **Betroffene Dateien:**
    *   [PCAttributes.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCAttributes.js) (Dropdown `.pc-class-lvl-select` in `renderPCAttributes`)
*   **Lösungsansatz:**
    *   Styling des `.pc-class-lvl-select` anpassen: Die CSS-Breite von `30px` auf `36px` erhöhen, das Innenabstand (Padding) optimieren und ein sauberes Line-Height vergeben, damit die Zahl mittig platziert und vollständig lesbar ist.

## 11. Skills die ungeübt nicht benutzbar sind sollen ausgegraut werden sofern keine Ränge darauf vergeben sind
*   **Beschreibung:** Fertigkeiten mit der Eigenschaft "Trained Only" (ungeübt nicht nutzbar) wie z.B. *Zauberkunde* oder *Schlösser öffnen* müssen optisch deaktiviert werden, wenn der Spieler 0 Ränge besitzt.
*   **Betroffene Dateien:**
    *   [PCSkillsTab.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCSkillsTab.js) (Rendern der `skill-row` und Klick-Event-Handler für den Wurf-Button)
*   **Lösungsansatz:**
    *   Wenn `skill.trainedOnly && ranks === 0` zutrifft, den Roll-Button mit dem Attribut `disabled` versehen und der Zeile eine CSS-Klasse oder Inline-Styles zur Verringerung der Opazität (`opacity: 0.5; cursor: not-allowed;`) zuweisen.
    *   Im Klick-Event-Handler prüfen und das Ausführen des Wurfs verhindern.

## 12. Man kann im "Feats & Skills" Tab im Feld "Neue Ränge" keine 0 eintragen
*   **Beschreibung:** Das Zurücksetzen von Rängen auf 0 oder die Eingabe von 0 im Ränge-Feld wird blockiert oder nicht reaktiv übernommen.
*   **Betroffene Dateien:**
    *   [PCSkillsTab.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCSkillsTab.js) (Input-Feld `.pc-skill-ranks-inp` und dessen `change`/`input` Listener)
*   **Lösungsansatz:**
    *   Sicherstellen, dass leere Eingaben (`""`) oder das manuelle Eintragen von `0` im Change-Event sauber als `0` interpretiert und im State gespeichert werden.
    *   Den Re-Render-Workflow überprüfen: Falls die Eingabe gelöscht wird, darf die Reaktivität das Eingabefeld nicht sperren oder überschreiben, bevor die Eingabe abgeschlossen ist. Evtl. Optimierung der Wert-Zuweisung und Validierung.

## 13. Talent-Auswahl: Fehlende Obergrenze
*   **Beschreibung:** Es können beliebig viele Talente gelernt werden. Die Obergrenze nach PHB-Regeln (Level, Klassen-Stufen, ggf. Rasse) muss eingehalten werden.
*   **Betroffene Dateien:**
    *   [rules.js](file:///c:/Users/Juls/Desktop/CombatApp/js/rules.js) (Berechnung der Talent-Slots)
    *   [PCManager.js](file:///c:/Users/Juls/Desktop/CombatApp/js/state/PCManager.js) (Validierungsprüfung in `addPCFeat`)
    *   [PCFeatsTab.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCFeatsTab.js) (UI-Anzeige und Sperren von Zeilen)
*   **Lösungsansatz:**
    *   Einführung einer Berechnungsmethode `calculateMaxFeats(pc)` in `CombatRules` (General-Feats nach Level: 1 bei Stufe 1, +1 alle 3 Level; Kämpfer-Bonus-Talente; Mönch-Bonus-Talente; Magier-Bonus-Talente).
    *   In `addPCFeat` prüfen, ob das Talentlimit erreicht ist. Falls ja, das Erlernen verhindern und eine Meldung ausgeben.
    *   Im Feats-Tab die Anzahl freier Slots anzeigen (z. B. `🎓 Erlernte Talente (3 / 4)`) und bei erreichtem Limit weitere Talente im Kompendium sperren/ausgrauen.

## 14. UI-Workflow: Endlosschleife beim Verlernen von Talenten
*   **Beschreibung:** Nach dem Klick auf "Verlernen" im Talent-Detail-Dialog schließt sich das Popup nicht, sondern öffnet sich sofort wieder.
*   **Betroffene Dateien:**
    *   [FeatScrollDialog.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/dialogs/FeatScrollDialog.js) (Event-Handler für `.btn-unlearn-feat` und `.btn-remove-instance`)
*   **Lösungsansatz:**
    *   Im Klick-Handler des Verlernen-Buttons (`unlearnBtn.onclick`) explizit `e.stopPropagation()` and `e.preventDefault()` aufrufen. Dadurch wird verhindert, dass das Klick-Event im Event-Loop weitergeleitet wird und nach dem sofortigen Neuaufbau der Seite durch `renderPlayerScreen` direkt wieder die darunterliegende Zeile/Karte triggert.

## 15. Druiden-Tiergestalt: Fehlerhafte Wert- und RK-Berechnungen
*   **Beschreibung:** Die Verwandlung in eine Tiergestalt (Wild Shape) des Druiden verändert die Werte nicht korrekt. Die Attributswerte wirken willkürlich, die RK stimmt nicht mit den richtigen Werten des gewählten Tiers überein, und die Rettungswürfe wurden beim Wechsel nicht abgeglichen.
*   **Betroffene Dateien:**
    *   [Combatant.js](file:///c:/Users/Juls/Desktop/CombatApp/js/models/Combatant.js) (Klassenspezifische Methoden `enterShape()` und `exitShape()`)
*   **Lösungsansatz:**
    *   Tiefere Überprüfung der Wild-Shape-Regeln und der betroffenen Zuweisungen durchführen.
    *   Sicherstellen, dass die physischen Attribute (Stärke, Geschicklichkeit, Konstitution) durch die des gewählten Tieres ersetzt werden, während die geistigen Attribute (Intelligenz, Weisheit, Charisma) unverändert bleiben (D&D 3.5e RAW).
    *   Überprüfung der RK-Berechnung der Tiergestalt (natürliche Rüstung der neuen Form anrechnen).
    *   Rettungswürfe (Fort, Ref, Will) basierend auf den neuen Attributen (insb. Konstitution und Geschicklichkeit) neu berechnen und abgleichen.

---

## 16. ✅ BEHOBEN (v3.2.5-cache-v3): Crash beim Tab-Wechsel zu „Ausrüstung" in Wild Shape
*   **Beschreibung:** Wechselte ein Druide in Tiergestalt (`pc.activeShape !== "none"`) auf den Tab „Ausrüstung", crashte die Anwendung, weil `renderPCOffense` die Funktion `_renderNaturalAttacksList(natList, pc)` aufrief, die in `PCOffense.js` nicht definiert war.
*   **Fix (10.06.2026):**
    *   `_renderNaturalAttacksList(container, pc)` in [PCOffense.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCOffense.js) implementiert.
    *   Die Funktion nutzt eine lokale `SHAPE_ATTACKS`-Datentabelle mit den korrekten D&D 3.5e Natürlichen Angriffen je Form (Wolf: Biss, Leopard: Biss + 2x Kralle, Braunbär: 2x Kralle + Biss).
    *   Für jeden Angriff wird ein Pseudo-Weapon-Objekt gebaut, das von `showAttackChoiceDialog` und `showRollBreakdown` verarbeitet werden kann.
    *   ATK- und DMG-Buttons sind vollständig funktionsfähig.
