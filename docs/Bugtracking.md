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
* Ähnliche wie bei Skills, Feates/Talenten, Zauberkompendium und Zauberbuch soll sich auch die Tabelle gelernte Zauber, alle Waffen und Rüstungsitems im Rucksack verhalten

## 8. "Bekannte" Zauber werden nicht berücksitigt beim übertragen der Zauber ins das Zauberbuch. Der Spieler kann mehr Zauber als eigentlich vorgesehen in der Zauberbiblithotek ablegen.

## 9. An Waffenslots soll ausgewählt werden können ob sie Main- oder Offhand sind

## 10. Anzeige für Leveldropdown ist abgeschnitten und Level schlecht lesbar

## 11. Skills die ungeübt nicht benutzbar ist sollen ausgegraut werden sofern keine Ränge darauf vergeben sind

## 12. Man kann im "Feats & Skills" Tab im Feld "Neue Ränge" keine 0 eintragen

