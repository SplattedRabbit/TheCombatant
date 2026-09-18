# Patchnotes — The Combatant v6.9.3
**Veröffentlichungsdatum:** 18. September 2026  
**Fokus:** Duale Rüstungs- & Schild-Ausrüstung, 4. ARPG-Tactical-Slot, Shield Bash, Toast-Feedback & UI-Symmetrie

---

## 🛡️ 1. Gleichzeitiges Tragen von Rüstung und Schild (D&D 3.5e RAW)

Bisher gab es im Kampftab eine Einschränkung: Wenn ein Charakter (z. B. ein Kleriker) sowohl eine Körperrüstung als auch einen Schild anlegen wollte, verdrängten sich beide gegenseitig. Dies wurde vollständig behoben:

* **Echte Kategorie-Trennung (`isShieldItem`):** Das Datenmodell unterscheidet Schilde und Körperrüstungen nun strikt voneinander – auch bei serialisierten Objekten oder Offline-Caches.
* **100% Regeltreue (PHB S. 134):**
  * Rüstungsbonus und Schildbonus stacken regulär zur Gesamtrüstungsklasse.
  * Der maximale Geschicklichkeitsmodifikator (**MaxDex**) richtet sich nach dem jeweils niedrigeren Wert beider Ausrüstungsgegenstände.
  * Der Rüstungsmalus (**Armor Check Penalty / ACP**) addiert sich kumulativ auf körperliche Fertigkeiten.
* **Zweihändige Waffen:** Das Ausrüsten einer Zweihandwaffe legt automatisch nur den Schild ab, während die Körperrüstung unberührt bleibt.

---

## ⚔️ 2. Vierter ARPG-Tactical-Slot im Kampftab (Body Armor)

Die taktische Angriffs- und Ausrüstungsleiste im Tab **Combat** wurde um einen vollwertigen 4. Slot für Körperrüstungen erweitert:

* **Live-Status:** Zeigt direkt die ausgerüstete Rüstung, den Seltenheits-Glow, den Rüstungsbonus zur RK, MaxDex, Rüstungsmalus, Zauberpatzerchance und die Auswirkung auf die Bewegungsrate (z. B. Reduktion bei mittelschwerer/schwerer Rüstung).
* **Schnell-Ablegen:** Mit dem roten `✕` im Kachelkopf kann die Rüstung mit einem Klick abgelegt werden.
* **Direkt-Navigation:** Klick auf den leeren Rüstungsslot öffnet sofort das Arsenal **Armor & Shields**.

---

## 🛡️ 3. Taktischer Schildstoß (Shield Bash)

Schilde sind nicht mehr nur passive Schutzgegenstände:

* Sobald ein Leichter oder Schwerer Schild im **Off-Hand**-Slot getragen wird, erscheinen automatisch zwei interaktive Angriffs-Buttons:
  * `[ BASH +X ]` — Berechnet den Angriffsmodifikator nach D&D 3.5e Regeln via `AttackEngine`.
  * `[ DMG +Y ]` — Würfelt den Shield-Bash-Schaden (z. B. `1d6` für schwere Schilde, `1d4` für leichte Schilde) mit korrektem Stärke- und Verzauberungsbonus.

---

## 🍞 4. Visuelles Feedback: Sticky Action Toasts im Compendium

Im Arsenal und Item-Compendium erhält der Spieler nun sofortiges, dezentes Feedback bei Interaktionen:

* Beim Hinzufügen, Ausrüsten oder Einlagern eines Gegenstands erscheint unten rechts ein schwebendes Pergament-Banner (z. B. *"Equipped Heavy Steel Shield to Off-Hand"* oder *"Added Longsword to Weapons Stash"*).
* Die Toasts blenden sich nach 2,2 Sekunden automatisch sanft aus und stören den Spielfluss nicht.

---

## 🎨 5. Symmetrisches 5-Zonen-Raster & Typografie

Alle 4 Slots der taktischen Kampf-Leiste wurden visuell und typografisch vereinheitlicht:

1. **Zone 1 (Header):** Einheitliche Slot-Kopfzeile in `var(--font-title)` (Cinzel) mit Schnell-Aktion.
2. **Zone 2 (Titel):** Durchgehend einheitliche Schriftart in edlem Dunkelrot (`9.5px`, fett).
3. **Zone 3 (Badges):** Kompakte Eigenschafts-Pills (Schaden/Crit, Schild-Typ, AC).
4. **Zone 4 (Mitte):** Einzeilige taktische Kurzübersicht (Iterativ-Angriffe, ACP/Fail, Speed/MaxDex) — kein unruhiger Deadspace mehr.
5. **Zone 5 (Aktionsleiste):** Alle Buttons und Statusanzeigen schließen auf einer exakt ausgerichteten **18px-Basislinie** ab.
6. **Ruhige Class-Ability-Leerkachel:** Besitzt der Charakter keine speziellen Strike-Klassenfeatures (z. B. Kleriker ohne Smite/Sneak), wird kein redundanter Standard-Angriffsbutton angezeigt, sondern ein dezenter Hinweis *(No class attacks available)*.

---

## 🧪 6. Test- & Systemstabilität

* **Neuer Regressionstest:** `Tests/armor_shield_dual_equip.test.js` verifiziert das parallele Ausrüsten, Stacking und 2H-Interaktionen.
* **Storage-Absicherung:** Defensive Absicherung der Session-Initialisierung in `StorageManager.js` gegen Null-Pointer bei isolierten Kampagnen-Snapshots.
* **Gesamtstatus:**
  * 416 von 416 Core-Tests erfolgreich.
  * 48 von 48 UI-Tests erfolgreich.
  * TypeScript Typecheck: 0 Fehler.
