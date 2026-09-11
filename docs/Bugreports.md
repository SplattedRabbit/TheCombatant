# Bugreports (UAT)

Diese Dokumentation enthält die detaillierte Analyse der im UAT (User Acceptance Testing) gemeldeten Bugs. Es wurden bisher **keine Implementierungen** vorgenommen, lediglich die Ursachenforschung und Dokumentation.

---

## 1. Spellwarp Sniper bekommt keine korrekten Zauberstufen
**Problem:** Die Prestigeklasse "Spellwarp Sniper" erhält zwar eine Zauberklassenzuordnung beim Stufenaufstieg (z.B. Wizard), aber die Zauberstufen werden nicht korrekt hinzugefügt, wodurch keine neuen Zauber/Zauberstufen gewählt werden können.
**Ursache:** 
- In `js/rules/RulesSpells.js` (`getEffectiveCasterLevel`) wird bei Prestigeklassen (`pc.prestigeSpellLinks`) einfach stumpf die Stufe der Prestigeklasse (`prcClass.level`) zur Caster-Stufe addiert (`effectiveLevel += prcClass.level;`). 
- Das System prüft aktuell nicht die tatsächliche `spellcastingBonus` (Zauberstufen-Progression) der Klasse (z.B. bekommt Spellwarp Sniper auf Stufe 1 *keinen* Zuwachs der Zauberstufe, sondern erst auf 2, 3, 4, 5).
- *Folgefehler (siehe Bug 6):* Weil das Leveling-System hartkodiert auf Basis-Klassen prüft, ob der Spells-Reiter (Schritt 4) im Wizard angezeigt wird, bekommt der Spieler die Auswahl gar nicht erst zu sehen.

## 2. Spells der Stufe 0 (Cantrips) fehlen in der Spelllibrary
**Problem:** Cantrips der Stufe 0 sollen laut Beschreibung automatisch beim Levelup hinzugefügt werden, tauchen aber nicht auf.
**Ursache:** 
- In `src/components/player/wizard/wizardSaveHelper.ts` (Zeile 146) wird geprüft: `if (s.level === 0 && Array.isArray(s.classes) && s.classes.includes('wizard'))`.
- In unserer Zauber-Datenbank (`spells-phb.json` etc.) gibt es jedoch keine Eigenschaft `s.classes` (diese ist veraltet), stattdessen wird `s.classLevels` (Array mit `{ class: 'wizard', level: 0 }`) genutzt. Da `s.classes` `undefined` ist, schlägt die Bedingung fehl und die Cantrips werden beim Level-Up übersprungen.

## 3. Im Zaubermodul können keine Zauber vorbereitet werden
**Problem:** Das Popup zum Vorbereiten erscheint zwar, aber in der "Prepared"-Spalte tauchen keine Zauber auf.
**Ursache:** 
- Die Funktion `showPrepareSpellDialog` wurde (vermutlich beim letzten Refactoring) aus dem `DialogContext.tsx` entfernt oder ist dort nicht mehr korrekt gekapselt angebunden, bzw. schlägt der Callback zum Speichern im State (`pc.preparedSpells.push(...)`) fehl, da der Payload nicht korrekt verarbeitet wird. Die "Prepared Spells"-Liste im UI lauscht zwar auf das PC-Objekt, erhält aber nach dem Popup keine aktualisierten Daten.

## 4. Spell Empowering fehlt aufgrund fehlender Spell-Slots
**Problem:** Ein Charakter (Ninja 2, Wizard 6, Spellwarp Sniper 5 - Gesamtstufe 13) kann keine Zauber empowern, da die erforderlichen Zauberstufen fehlen.
**Ursache:** 
- Dies ist ein direkter Folgefehler aus Bug 1. Da `getEffectiveCasterLevel` und die `calculateMaxSpellSlots` die Prestigeklassenstufen fehlerhaft verrechnen, bleibt der Wizard effektiv auf Caster-Level 6 stehen (höchster Zaubergrad = 3).
- Um z.B. einen Grad 2 Zauber zu empoweren (Grad + 2), benötigt man einen Slot vom Grad 4. Da das System denkt, der Charakter habe nur Grad 3, fehlen die Slots und die Metamagie-Kosten-Berechnung (`METAMAGIC_COSTS`) verhindert die Aktion.

## 5. Account Dropdown ist durchsichtig
**Problem:** Das Dropdown im User-Menü lässt den Hintergrund durchscheinen.
**Ursache:** 
- In `src/components/auth/UserMenu.tsx` (Zeile 129) wird für das Dropdown-Menü der CSS-Stil `background: 'var(--p, #f4e8c1)'` verwendet. 
- In den neuen Stylesheets referenziert `--p` (Parchment) ein Hintergrundbild `url('/assets/parchment.jpg')` (oder einen leeren Wert). Da dort keine solide Hintergrundfarbe (`background-color`) als direkter Fallback definiert ist und das Bild ggf. Lücken hat / fehlt, wird der Container transparent. Die Eigenschaft `backgroundColor` davor wird durch das fehlerhafte `background` überschrieben.

## 6. Creation Wizard überspringt Zauberlernen für Prestigeklassen
**Problem:** Spellwarp Sniper (und andere zaubernde Prestigeklassen) erhalten beim Level-Up keinen Zauber-Auswahl-Reiter, sondern gehen direkt ins nächste Level über.
**Ursache:** 
- In `CharacterWizardDialog.tsx` wird für die Anzeige des Spell-Reiters eine hartkodierte Liste von Basis-Klassen geprüft: `['cleric', 'wizard', 'sorcerer', 'bard', ...].includes(cfg.classType)`. 
- Prestigeklassen wie `spellwarp_sniper` tauchen in dieser Liste nicht auf. Das UI prüft nicht, ob für die aktuelle Stufe eine gültige `prestigeSpellLinks`-Verknüpfung existiert, die das Zauberlernen triggern müsste. Daher wird Step 4 (Spells) schlichtweg ausgeblendet.

## 7. Skilländerungen durch Items werden nicht berücksichtigt
**Problem:** Ausrüstungsgegenstände (z.B. mit +5 Spot) verändern die Skill-Werte weder in der Übersicht noch im Dice-Roll Popup.
**Ursache:** 
- In `src/components/player/skills/PCSkillsTab.tsx` (sowie in `RulesSkills.js`) wird bei der Berechnung der `skillBonus` und im `getSkillTooltip` lediglich nach Ranks (`getSkillRanks`), Attributs-Modifikatoren, Size, Rasse, Feats und Rüstungsmalus (ACP) gesucht.
- Es gibt im Code keine Logik (z.B. `getItemModForSkill(pc, key)`), die über die angelegten Items (`pc.equipment.worn` etc.) iteriert und deren `modifiers` ausliest. Item-Boni auf Skills sind im Stack-System schlichtweg noch nicht an die Skill-Komponente angebunden.
