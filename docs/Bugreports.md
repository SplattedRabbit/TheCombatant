# TheCombatant — Bugreports, System Audits & Klassifizierung

Dieses Dokument dient als zentrales Tracking für alle gemeldeten, behobenen (Bugs 1–9), im tiefgehenden System-Audit aufgedeckten (Bugs 10–17), im Rassen-/Klassen- und Player-DM-Sync-Audit identifizierten Bugs (Bugs 18–31) sowie im Core-Engine-Tiefenaudit aufgedeckten Probleme (Bugs 32–42).

### 🔍 Klassifizierungs-Kriterien: Bug vs. Fehlendes Feature

Zur präzisen Unterscheidung zwischen Implementierungsfehlern und Entwicklungslücken wird jeder Eintrag wie folgt klassifiziert:

1. **Bug (Codefehler):**
   - Ein Feature, Modul oder eine Formel ist im Code bereits implementiert, arbeitet jedoch fehlerhaft, verstößt gegen D&D 3.5e RAW, bricht Datenstrukturen/Prototypen, erzeugt falsche Würfelergebnisse, verhält sich instabil oder löscht Daten.
2. **Fehlendes Feature (Architektur- / Regel-Lücke):**
   - Eine mechanische Regel oder Systemfähigkeit ist im Code überhaupt noch nicht vorhanden oder nicht an die Pipeline angebunden (z. B. der Kampfrechner liest eine bestehende Tabelle gar nicht aus; eine Feat-Tabelle für eine Klasse im Stufenaufstieg existiert noch nicht).
3. **Kombination (Bug & Fehlendes Feature):**
   - Der Eintrag umfasst sowohl fehlerhaften existierenden Code (z. B. fehlerhafte String-Prüfungen, die ins Leere laufen) als auch noch gänzlich unvollständige mechanische Bausteine (z. B. eine fehlende Berechnungslogik).
4. **By Design / Tischanforderung:**
   - Bewusste Entscheidung gegen eine digitale Restriktion, weil der Ablauf physisch am Spieltisch entschieden wird.

---

### 📊 Bereinigte Management-Übersicht (Fokus ohne States & Reichweiten)

Wenn **Zustände/Conditions** (*feared, staggered, shaken, blinded, prone, sickened etc.*) – genau wie **Reichweiten & Sichtlinien** (*Bug #20*) – rein physisch direkt am Spieltisch gehandhabt werden, reduziert sich der Entwicklungs- und Wartungsaufwand drastisch.

#### 🚫 Tischanforderungen (Out of Scope für die App):
- **#20 (Sneak Attack / Raystrike 30/60 ft Reichweite):** Physische Verhandlung auf Battlemat.
- **#32 (Combat Engine entkoppelt von Conditions):** Abzüge werden am Tisch verrechnet.
- **#33 (Skills: Conditions `Shaken` & `Sickened`):** Fertigkeitsmali werden am Tisch geführt.
- *(Zustands-Verrechnungsketten wie in `ConditionApplier.js` entfallen analog).*

---

#### 🐛 Reine Bugs im bestehenden Code (10 offene Bugs):
Hier existiert der Code bereits, rechnet jedoch falsch, bricht Datenstrukturen oder desynchronisiert Clients:

1. **Waffen & Kampfmechanik:**
   - **#39 (WeaponRegistry `isLight`-Hack):** Dornenkette macht bei Power Attack 0 Bonusschaden; Rapier in der Schildhand erhält falsche Abzüge für leichte Waffen.
   - **#40 (Smite Doppel-Abzug & Blockade):** 1 Schlag zieht 2 Ladungen ab; Inquisitor-Smites blockiert, sobald Paladin-Smites leer sind; Smite addiert sich fälschlich auf alle Iterativangriffe.
   - **#12 (Umstandsboni-Stacking):** Stacking-Engine verwirft unterschiedliche Umstandsboni.

2. **Zauber- & Klassenlogik:**
   - **#34 (Multiclass Spell-DC Attribut-Hijack):** Grimoire zwingt Attribut der ersten Casterklasse auf alle Sprüche auf (Kleriker-DCs rechnen mit Int).
   - **#35 (Stat-Referenzkopplung `baseZa`/`baseFort`):** Hydrierung trennt die Alias-Verknüpfung der Rettungswürfe.
   - **#37 (Inquisitor Regelfälschungen & Smite-Cap):** Erfundene Kosten, falsche Wirkungsdauern und falscher Stufe-10-Cap in `caPrestige.ts` & `ShadowbaneInquisitorRules.js`.
   - **#16 (`NaN`-Vergiftung bei Spellslots):** Ungesetztes `used` erzeugt `NaN` im Slot-Objekt.
   - **#18 (Smite-Ressourcen-Kollision im Widget):** Widget zeigt nur Paladin-Smites, nicht Inquisitor-Smites.
   - **#42 (Stonecunning bei Zwerg):** Zwerg fehlen Boni auf Search/Appraise für Steinarbeiten in `CombatantSkills.js`.
   - **#41 (Initiative <= 0 verworfen):** UI blendet Werte <= 0 als `'--'` aus.

---

#### ✅ Bereits behoben (Branch `bugfixes` & Vorgänger-Releases):
- **Bugs 1–9:** Spellwarp CL, Cantrips im Grimoire, Vorbereitungsdialog, Empower-Slots, Account-Dropdown, Prestige-Zauberauswahl, Item-Fertigkeitsboni, iPad Pinch-Zoom & Modal-Overlays.
- **#10 (`Righteous Might`):** Typ auf `"natural_enhancement"` korrigiert, RAW CL-Formel mit Minimum +2 implementiert.
- **#11 (`magic_vestment` / `magic_weapon_greater`):** Untergrenze +1 via `Math.max(1, ...)` garantiert.
- **#13 (Feat-Polymorphismus):** String-Arrays und Objekt-Arrays in allen Talentprüfungen (`hasFeat`, Saves, AC, Skills) polymorph unterstützt.
- **#14 (Mönch-/Ninja-AC):** Weisheits- und Klassen-RK wird bei getragener Rüstung oder Schild gemäß RAW suspendiert.
- **#15 (Generalisten-Magier Spezialisten-Slot):** `Boolean(pc.wizardSpecialization && pc.wizardSpecialization !== 'none')` verhindert illegitime Extraslots für Generalisten.
- **#17 (Phantom-Charaktere nach Löschung):** `LocalStorageAdapter` säubert aktiven Key; `CharacterService` filtert gelöschte IDs aus und erzeugt bei Leerstand sauberen Standardhelden.
- **#19 (Smite-Schadensanzeige im Tooltip):** Summiert Paladin- und Inquisitor-Stufen mathematisch (`palLvl + shadowbaneLvl`).
- **#21 (Dragon Shaman Auren-Effekte):** Alle 6 Auren mit konkreten mechanischen Effekten und Formeln bestückt; Fertigkeiten- und Initiative-Bonus angebunden.
- **#22 (Lizardfolk 2. Klauenangriff):** Erzeugt 2 primäre Klauen und 1 sekundären Biss (RAW MM S. 169).
- **#23 (*Tricky Fighting* UI-Inversion):** Text und Label auf „+1 Attack“ korrigiert (RAW Complete Scoundrel S. 28).
- **#24 (Deep Halfling Rettungswürfe):** +1 Rassenbonus auf Zähigkeit, Reflex und Willen nach RAW (MM S. 150) wiederhergestellt.
- **#25 (HP-Sync Spieler <-> DM):** Re-Check bestätigt: Spieler -> DM sendet `diff.hp = pc.hp`; DM -> Spieler Pfad zusätzlich um explizites Kämpfer-HP-Diffing in `getEncounterStateDiff` ergänzt.
- **#26 (DM-Diff überschreibt Spielerbogen):** Lokaler PC wird vor dem Überschreiben reicher Datenstrukturen (Spells, Items, Slots) durch flache Host-Diffs geschützt.
- **#27 (Initiative-Re-Sortierung beim DM):** Eingang von `pc_diff` mit Initiative sortiert die Kämpferliste auf dem Host automatisch und aktualisiert die Leiste.
- **#28 (Stat-Hydrierung englischer Saves):** `statFields` und `STAT_FIELDS` um `'baseFort'`, `'baseWill'`, `'fort'`, `'will'` erweitert; Prototyp-Methoden bleiben intakt.
- **#29 (`switchActiveCharacter` sendet kein Sync):** `switchActiveCharacter` führt `broadcastActivePC()` aus und informiert den Host sofort über den aktiven Helden.
- **#30 (Presence Broadcast-Sturm):** `broadcastActivePC()` feuert nur noch bei neu hinzutretendem Host (`hasHost && !previousHostPresent`), nicht bei jedem Client-Presence-Tick.
- **#31 (Identitätsverlust bei Reload):** `localPCId` wird persistent in `localStorage` (`dd_local_pc_id`) gesichert und verhindert falschen Fallback nach F5.
- **Bereinigung aller digitalen Würfelbots:** Vollständige Entfernung von automatischen Zufallsgeneratoren (`Math.random()`) in Atemwaffe (Dragon Shaman), Wild Empathy (Ranger), Manuelle Reparatur (Living Construct) und Trank-Fallback; strikte Umstellung auf Tabletop-First-Formelanzeigen und physische Würfe am Tisch.

---

#### 💡 Fehlende Features (4 noch nicht gebaute Mechaniken):
Hier fehlt die tatsächliche Implementierung bzw. Integration in die Pipeline:

1. **#36 (Inquisitor Turn Undead Stacking):** In `cumulativeFeatures.ts` existiert noch kein Stufen-Stacking für den Inquisitor (flankiert von einem Bug in `PaladinRules.js`, der Vertreiben aktiv löscht).
2. **#38 (Battle Trickster Stufe 2 Bonus-Feat):** Feat-Slot für Stufe 2 existiert im Wizard noch nicht (`helpers.feats.ts`).
3. **#34 (Spell Focus Anbindung im Grimoire):** Talente *Spell Focus* / *Greater Spell Focus* sind noch nicht an die DC-Formel (`10 + lvl + mod`) im Grimoire angebunden.
4. **(Aus Bug #38 Teil 2):** Kostenlose Klassen-Skill-Tricks zählen noch gegen das Trick-Maximum, weil ein Flag `{ isBonus: true }` im Speicher-Helper fehlt.

---

## 1. Spellwarp Sniper bekommt keine korrekten Zauberstufen
- **Status:** **Behoben**
- **Klassifizierung:** **Bug** (Die CL-Berechnung in `RulesSpells.js` existierte bereits, wertete jedoch `clsDef.spellcastingBonus` nicht regelkonform aus).
- **Problem:** Die Prestigeklasse "Spellwarp Sniper" erhält zwar eine Zauberklassenzuordnung beim Stufenaufstieg (z.B. Wizard), aber die Zauberstufen wurden nicht korrekt hinzugefügt.
- **Auswirkungen für Spieler:** Konnte keine neuen Zaubergrade und Zauberstufen über die Prestigeklasse erhalten; Zauberprogression blieb auf dem Niveau der Basiklasse stecken und höhergradige Zauber wurden blockiert.
- **Auswirkungen für Spielleiter (DM):** Die Machtprogression des Spieler-Zauberers stagnierte im höheren Levelbereich; Encounter-Balancing geriet aus den Fugen, weil der Charakter mechanisch hinter seiner Stufe zurückblieb.
- **Lösung:** 
  - In `js/rules/RulesSpells.js` (`getEffectiveCasterLevel`) wird `clsDef.spellcastingBonus` ausgewertet. Spellwarp Sniper erhält 5/5 Vollprogression (+1 Zauberstufe pro Level) gemäß RAW (*Complete Scoundrel* S. 64).
  - Automatischer Fallback für importierte Charaktere verknüpft PrCs mit vorhandenen Caster-Klassen.
- **Verifikation:** `Tests/spellwarp_sniper_spells.test.js`

## 2. Spells der Stufe 0 (Cantrips) fehlen in der Spelllibrary
- **Status:** **Behoben**
- **Klassifizierung:** **Fehlendes Feature** (Die automatische Bestückung des Grimoires mit Cantrips beim Wizard-Levelup war im Code noch gar nicht vorgesehen).
- **Problem:** Cantrips der Stufe 0 sollen laut Beschreibung automatisch beim Levelup hinzugefügt werden, tauchten aber nicht auf.
- **Auswirkungen für Spieler:** Magier besaßen keine Cantrips/Kniffe im Grimoire und konnten grundlegende Alltagszauber (z. B. *Licht*, *Magie entdecken*) weder vorbereiten noch wirken.
- **Auswirkungen für Spielleiter (DM):** Spieler mussten Cantrips auf Papier mitschreiben oder fragten nach Utility-Zaubern, die im System nicht anwählbar waren.
- **Lösung:** 
  - In `src/components/player/wizard/wizardSaveHelper.ts` (Zeilen 169–172) wird `s.classLevels` (`cl.class === 'wizard' && cl.level === 0`) ausgewertet, sodass alle Cantrips beim Erstellen/Leveln automatisch im Grimoire (`freshPC.learnedSpells`) landen.
- **Verifikation:** `Tests/wizard_prc_spells.test.js`

## 3. Im Zaubermodul können keine Zauber vorbereitet werden
- **Status:** **Behoben**
- **Klassifizierung:** **Bug** (Das Vorbereitungs-Modal und die State-Properties existierten, aber die React-Bridge speicherte die Änderungen nicht in den zentralen State).
- **Problem:** Das Popup zum Vorbereiten erschien zwar, aber in der "Prepared"-Spalte tauchten keine Zauber auf.
- **Auswirkungen für Spieler:** Vorbereitende Zauberwirker (Wizard, Cleric, Druid) konnten ihre täglichen Zauberslots im UI nicht mit Zaubern belegen; das gesamte Zaubersystem im Kampf war lahmgelegt.
- **Auswirkungen für Spielleiter (DM):** Kampfrunden verzögerten sich massiv am Tisch, da vorbereitete Sprüche manuell außerhalb der App verwaltet werden mussten.
- **Lösung:** 
  - `src/components/dialogs/PrepareSpellDialog.tsx` speichert über `CombatState.updatePCBatch` direkt und reaktiv in `pc.preparedSpells` (inkl. Metamagie, Spezialisten- und Domänenslots).
  - Das React-Bridge-Interface in `DialogContext.tsx` bindet `showPrepareSpellDialog` nahtlos ein.
- **Verifikation:** `Tests/spellwarp_sniper_spells.test.js`

## 4. Spell Empowering fehlt aufgrund fehlender Spell-Slots
- **Status:** **Behoben**
- **Klassifizierung:** **Folge-Bug** (Metamagie war als Feature vorhanden, scheiterte aber direkt am Caster-Level-Bug #1).
- **Problem:** Ein Charakter (Ninja 2, Wizard 6, Spellwarp Sniper 5 - Gesamtstufe 13) kann keine Zauber empowern, da die erforderlichen Zauberstufen fehlen.
- **Auswirkungen für Spieler:** Metamagische Talente (wie *Empower Spell* / Zauber verstärken) waren unbenutzbar, da die berechneten Zauberslots für höhere Grade fehlten.
- **Auswirkungen für Spielleiter (DM):** Burst-Schadenspotenzial des Zauberers fiel drastisch ab; geplante Synergien gegen Bossgegner funktionierten am Tisch nicht.
- **Lösung:** 
  - Direkter Folgefehler aus Bug 1. Durch die korrekte Berechnung von Caster-Level und Slots (`calculateMaxSpellSlots`) stehen höhergradige Slots (z. B. Grad 4–6 für Stufe 13) zur Verfügung und Metamagie (Empower Spell +2 Stufen) funktioniert einwandfrei.
- **Verifikation:** `Tests/spellwarp_sniper_spells.test.js`

## 5. Account Dropdown ist durchsichtig
- **Status:** **Behoben**
- **Klassifizierung:** **Bug** (CSS-Rendering-Fehler durch fehlende Deckkraft-Definition).
- **Problem:** Das Dropdown im User-Menü lässt den Hintergrund durchscheinen.
- **Auswirkungen für Spieler:** Menüeinträge waren bei Überlagerung mit Bogeninhalten unlesbar; Navigation im Profil und den Einstellungen war stark erschwert.
- **Auswirkungen für Spielleiter (DM):** Dieselbe UI-Beeinträchtigung bei der Verwaltung von Kampagnen und Sessions auf dem DM-Screen.
- **Lösung:** 
  - In `src/components/auth/UserMenu.tsx` (Zeilen 128–129) ist `backgroundColor: '#f4e8c1'` vor `backgroundImage: 'var(--p)'` explizit definiert, wodurch der Hintergrund solide und blickdicht dargestellt wird.
- **Verifikation:** Visuelle Inspektion und CSS-Regel.

## 6. Creation Wizard überspringt Zauberlernen für Prestigeklassen
- **Status:** **Behoben**
- **Klassifizierung:** **Fehlendes Feature** (Der Stufenaufstiegs-Wizard besaß keinerlei Code-Pfade, um Zauberfortschritte von Prestigeklassen auf Basiklassen abzubilden).
- **Problem:** Spellwarp Sniper (und andere zaubernde Prestigeklassen) erhielten im Erstellungs-Wizard keinen Zauber-Auswahl-Reiter bzw. konnten keine Sprüche ihrer verknüpften Zauberklasse auswählen.
- **Auswirkungen für Spieler:** Beim Stufenaufstieg in eine zaubernde Prestigeklasse konnten keine 2 neuen Zauber pro Stufe gelernt werden; Spieler mussten Zauber mühsam manuell nachpflegen.
- **Auswirkungen für Spielleiter (DM):** Kontrollaufwand für den DM stieg, um zu prüfen, ob die manuell nachgetragenen Zauber den erlaubten Graden und Zauberschulen entsprachen.
- **Lösung:** 
  - `src/components/player/wizard/spells/spellSelectionRules.ts`: `resolveSpellLevelInfo` ermittelt bei Prestigeklassen mit Zauberprogression (`clsDef.spellcastingBonus`) die verknüpfte Basis-Klasse (`targetCasterClass`, z. B. Wizard) und die effektive Zauberstufe. Für Wizard werden 2 Sprüche bis zum neu erreichten Höchstgrad freigeschaltet.
  - `Step3SpellSelectionView.tsx`: Zeigt die Verknüpfung im Titel an (`+1 Wizard CL X`) und filtert die Zauberliste der verknüpften Klasse bis zum Maximalgrad.
  - `CharacterWizardDialog.tsx`: Steuert den Phasenübergang (`levelSubView === 'spells'`) für fortschreitende Prestigeklassen.
  - `wizardSaveHelper.ts`: Speichert `freshPC.prestigeSpellLinks` und `freshPC.prestigeSpecialTextConfirmed` dauerhaft im State.
- **Verifikation:** `Tests/wizard_prc_spells.test.js`

## 7. Skilländerungen durch Items werden nicht berücksichtigt
- **Status:** **Behoben**
- **Klassifizierung:** **Fehlendes Feature** (Die zentrale Ausrüstungs-Stacking-Engine war schlichtweg noch nicht an `RulesSkills.js` angebunden).
- **Problem:** Ausrüstungsgegenstände (z.B. mit +5 Spot) verändern die Skill-Werte weder in der Übersicht noch im Dice-Roll Popup.
- **Auswirkungen für Spieler:** Teuer erstandene magische Gegenstände (z. B. Ring mit +5 Spot / Lauschen) blieben ohne jede mechanische Auswirkung auf die Fertigkeitswerte und Würfe.
- **Auswirkungen für Spielleiter (DM):** Spieler bestanden Wahrnehmungs-, Heimlichkeits- oder Entdecken-Proben fälschlicherweise nicht, was zu unfairen Konsequenzen am Spieltisch führte.
- **Lösung:** 
  - In `js/rules/RulesSkills.js` wertet `getItemModForSkill(pc, skillKey)` nun über die zentrale Stacking-Engine `calculateEquippedItemEffects(pc)` alle ausgerüsteten Gegenstände (`pc.items`) aus.
  - D&D 3.5e RAW Stacking-Regeln (gleiche Boni-Typen wie Kompetenz stacken nicht, Glücksboni via `target: 'all'` stacken additiv) werden vollständig berücksichtigt.
  - Nahtlos angebunden an `CombatantSkills.js` (`calculateSkillModifier`), `PCSkillsTab.tsx` (Gesamtmodifikator, Tooltip `• Equipment: +X` und Würfel-Breakdown).
- **Verifikation:** `Tests/item_skill_modifiers.test.js`

## 8. iPad Pinch-to-Zoom Viewport-Sprung nach links unten
- **Status:** **Behoben**
- **Klassifizierung:** **Bug** (CSS `transform: scale` auf Root-Element brach die Koordinatenberechnung von Touch-Gesten in WebKit/Safari).
- **Problem:** Beim 2-Finger-Pinchzoom auf dem iPad (z. B. auf den Quick Actionbelt) sprang der Bildausschnitt unkontrolliert nach ganz links unten der App, anstatt an der gezoomten Stelle zu verweilen.
- **Auswirkungen für Spieler:** Frustrierende Bedienung auf Tablets; beim Heranzoomen an Aktionsleisten verlor man den Fokus und musste mühsam zurückscrollen.
- **Auswirkungen für Spielleiter (DM):** Schnelle Aktionen im Kampf wurden durch Desorientierung der Tablet-Nutzer ausgebremst.
- **Lösung:**
  - In `css/layout.css` wurde `transform: scale(var(--app-scale))` auf `#appRoot` durch die native CSS `zoom: var(--app-scale, 1)` Eigenschaft ersetzt. `zoom` skaliert den Layout-Fluss nativ und bricht die WebKit-Gesten-Koordinaten nicht.
  - In `src/App.tsx` wurden künstliche JavaScript-Höhenberechnungen (`syncBodyHeight()`, `ResizeObserver`) entfernt.
  - In `src/App.tsx` wurden restriktive Scroll-Listener (`handleScroll`, `handleViewportScroll`, `handleFocusIn`), die bei `scrollX !== 0` ein hartes `window.scrollTo(0, window.scrollY)` ausführten, restlos entfernt. Dadurch kann Safari nun völlig frei und flüssig an jeder beliebigen Stelle zoomen und pannen.
- **Verifikation:** Manueller Test auf WebKit/iPad, automatisierter Typecheck & `npm test`.

## 9. Unvollständige Popup-Schatten & Pinch-Zoom-Blockade bei geöffneten Modals
- **Status:** **Behoben**
- **Klassifizierung:** **Bug** (CSS-Transform-Vererbung auf Backdrop-Overlays und fehlende DOM-Isolation via React Portals).
- **Problem:** Bei geöffneten Popups/Modals wurde das abdunkelnde Hintergrund-Overlay auf manchen Geräten und Auflösungen (iPad, Windows-Laptops mit Bildschirmbreite != 1150px) nicht bildschirmfüllend dargestellt (10–20 % unbeschattete Ränder). Sobald ein Popup geöffnet war, funktionierte auch der Pinch-Zoom nicht mehr stabil.
- **Auswirkungen für Spieler:** Abgeschnittene Overlays und blockierte Zoom-Gesten machten Dialoge auf manchen Laptops und iPads unbenutzbar.
- **Auswirkungen für Spielleiter (DM):** DM-Dialoge (z. B. Kampagnen- oder Encounter-Management) litten unter denselben Darstellungs- und Skalierungsfehlern auf dem DM-Bildschirm.
- **Lösung:**
  - In `css/popups.css` wurde `transform: scale(var(--app-scale))` von allen 18 Backdrop-Overlay-IDs entfernt. Der Vollbild-Schatten (`position: fixed; inset: 0; background: rgba(...)`) bleibt dadurch bei allen Auflösungen exakt bei 100vw × 100vh.
  - Skalierung via `zoom: var(--app-scale, 1)` wird gezielt nur auf die inneren Dialogkarten (`.custom-alert-box`, `.custom-scroll-box`, `.parchment-border`, `.ref-modal`, `.role-container`) angewendet.
  - Alle Modals im gesamten System (im `DialogContext.tsx`, in `DialogOverlay.tsx` sowie alle lokalen Standalone-Modals wie `BeltItemModal`, `SlotEquipModal`, `ItemEditorModal`, `ItemCompendiumModal`, `DruidFeaturesCard` WildShape, `SkillTrickDetailsDialog`, `CompanionAbilityDetailsDialog`, `CampaignManagerDialog`, `CreateCampaignModal`, `CreateCharacterModal`) wurden via React `createPortal` direkt an `document.body` gehängt, wodurch sie vollständig von `#appRoot` und dessen Skalierung isoliert sind.
- **Verifikation:** Automatisierter Typecheck, 392 Unit-Tests und Production Build.

---

## Deep System Audit (Bugs 10–17) — Status: Teilweise behoben 🔍

Folgende 8 Regellogik-, Stacking- und Zustands-Bugs wurden im Rahmen der tiefgehenden Systemanalyse aufgedeckt und dokumentiert:

### 10. `righteous_might` – Falscher Bonus-Typ & fehlerhafte Stufen-Progression
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Spruch-Effekt in JSON und Berechnungsformel in `BuffRules.js` existierten, waren jedoch in Typ und Skalierung fehlerhaft).
- **Kategorie:** Zauberregeln & RAW-Stacking (D&D 3.5e)
- **Betroffene Dateien:** [`data/spells-phb.json`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/data/spells-phb.json), [`js/rules/BuffRules.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/BuffRules.js)
- **Problem:**
  1. In `spells-phb.json` ist der Typ des RK-Bonus als `"natural"` anstelle von `"natural_enhancement"` eingetragen. Laut D&D 3.5e RAW (PHB S. 273) und der Spruchbeschreibung gewährt der Zauber einen *Verbesserungsbonus auf die natürliche Rüstung*. Dadurch stackte er fälschlicherweise nicht mit angeborener natürlicher Rüstung (z. B. Tiergestalt, Drachenjünger), stackte aber inkorrekt mit *Rindenhaut* oder dem *Amulett der natürlichen Rüstung*.
  2. In `BuffRules.js` (`resolveSpellEffectValue`) wurde die Formel `righteous_might_na` mit `1 + Math.floor(cl / 3)` hinterlegt (Kopie von Rindenhaut). Bei Mindeststufe CL 9 für Kleriker ergab dies fälschlicherweise +4 statt +2.
- **Auswirkungen für Spieler:**
  - Ein Kleriker auf Stufe 9 erhält fälschlicherweise +4 statt +2 RK (zu stark) und wundert sich, warum der Zauber nicht mit seiner angeborenen natürlichen Rüstung (z. B. Drachenjünger oder Tiergestalt) stackt, aber illegal mit *Rindenhaut* kumuliert.
- **Auswirkungen für Spielleiter (DM):**
  - Verfälscht die RK-Balance im Kampf erheblich; gegnerische Angriffe treffen seltener als nach RAW vorgesehen. Nutzen gegnerische Kleriker den Zauber, müssen DMs manuell gegenrechnen.
- **Behebung:**
  - Typ in `spells-phb.json` auf `"natural_enhancement"` korrigiert.
  - Formel in `BuffRules.js` auf D&D 3.5e RAW angepasst: `Math.max(2, Math.min(5, 2 + Math.floor((cl - 9) / 3)))`.

### 11. `magic_vestment` & `magic_weapon_greater` – Null-Bonus bei niedrigen Caster-Levels
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Formel existiert in `BuffRules.js`, liefert aber mangels Mindestschranke `Math.max(1, ...)` für CL 1–3 den unzulässigen Wert +0).
- **Kategorie:** Zauberregeln & Buff-Formeln
- **Betroffene Dateien:** [`js/rules/BuffRules.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/BuffRules.js)
- **Problem:**
  - Formel `Math.min(5, Math.floor(cl / 4))` liefert bei CL 1–3 den Wert `0`. Ein Grad-3-Verstärkungszauber darf keinen Bonus von +0 gewähren.
- **Auswirkungen für Spieler:**
  - Nutzt ein Spieler eine gefundene Spruchrolle oder einen Trank mit CL 1–3, zeigt der Zauber im Sheet einen Bonus von +0 an – die investierte Aktion und Ressource verpuffen völlig wirkungslos.
- **Auswirkungen für Spielleiter (DM):**
  - Beute-Gegenstände (niedrigstufige Schriftrollen/Tränke) funktionieren für die Spieler nicht wie erwartet; führt zu Verwirrung und Unterbrechungen am Tisch.
- **Behebung:**
  - Untere Schranke auf mindestens +1 gesetzt: `Math.max(1, Math.min(5, Math.floor(cl / 4)))`.

### 12. `ModifierStacking.js` – Umstandsboni (Circumstance Bonuses) stacken nicht aus unterschiedlichen Quellen
- **Status:** **Offen (Identifiziert im Deep Audit)**
- **Klassifizierung:** **Bug** (Die Stacking-Engine existiert in `ModifierStacking.js`, behandelt `circumstance` jedoch fälschlich als exklusiv statt additiv nach Quellen).
- **Kategorie:** Zentrales Modifikatoren-Stacking (RAW)
- **Betroffene Dateien:** [`js/models/helpers/modifiers/ModifierStacking.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/models/helpers/modifiers/ModifierStacking.js)
- **Problem:**
  - In `resolveModifierStacking` wurden nur `dodge`, `untyped` und `natural_increase` separat pro Quelle addiert. Laut D&D 3.5e RAW (PHB S. 305) stacken Umstandsboni (*circumstance bonuses*) aus unterschiedlichen Quellen/Situationen additiv (nur Boni derselben Quelle werden nicht kumuliert). Aktuell wurde charakterweit nur der höchste Einzelwert beibehalten.
- **Auswirkungen für Spieler:**
  - Taktische Vorteile aus unterschiedlichen Quellen (z.B. höherer Grund + situativer Umstandsvorteil) werden nicht addiert; der Spieler verliert legale Angriffs- oder Fertigkeitsboni.
- **Auswirkungen für Spielleiter (DM):**
  - Belohnungen für kreatives und taktisches Spiel (z.B. Umstandsboni) werden vom System verschluckt, wenn bereits ein anderer Umstandsbonus aktiv ist.
- **Vorgeschlagene Lösung:**
  - `type === 'circumstance'` in die additive Gruppierung nach Schlüssel `${type}_${source}` aufnehmen.

### 13. Feat-Polymorphismus – Talentprüfung schlägt bei String-Arrays fehl
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Typen- und Datenmodell-Inkonsistenz in existierenden Abfrageroutinen wie `Combatant.hasFeat`).
- **Kategorie:** Stat-Modifikatoren, Rettungswürfe & Talente
- **Betroffene Dateien:** [`js/models/Combatant.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/models/Combatant.js), [`js/models/helpers/modifiers/FeatModifierApplier.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/models/helpers/modifiers/FeatModifierApplier.js), [`js/models/helpers/skills/SkillFeatApplier.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/models/helpers/skills/SkillFeatApplier.js), [`js/rules/attack/AttackContext.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/attack/AttackContext.js), [`js/rules/RulesSkills.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/RulesSkills.js), [`js/state/pc/PCGeneral.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/state/pc/PCGeneral.js)
- **Problem:**
  - Charaktere können Talente sowohl als Objekte `{ id: 'power_attack', option: '' }` als auch als String-Arrays `['power_attack', 'dodge']` halten.
  - In `Combatant.hasFeat`, `FeatModifierApplier.js` und `SkillFeatApplier.js` wurde strikt `f.id === featId` geprüft. Bei Strings (`'dodge'.id === undefined`) schlugen diese Prüfungen lautlos fehl.
  - Boni von *Große Zähigkeit* (+2 ZÄH), *Blitzschnelle Reflexe* (+2 REF), *Eiserner Wille* (+2 WIL), *Ausweichen* (+1 RK) und Fertigkeitstalenten wurden bei String-Arrays nicht appliziert.
- **Auswirkungen für Spieler:**
  - Nach Charakter-Importen oder Daten-Updates fehlen plötzlich +2 auf Rettungswürfe oder +1 RK auf dem Bogen.
- **Auswirkungen für Spielleiter (DM):**
  - Importierte SC- oder NSC-Bögen haben fehlerhafte Defensivwerte; Rettungswürfe gegen Zauber des DMs schlagen fälschlicherweise fehl.
- **Behebung:**
  - Talentprüfungen einheitlich auf `typeof f === 'string' ? f === featId : f?.id === featId` bzw. über das robuste `pc.hasFeat(featId)` vereinheitlicht.

### 14. Mönch- & Ninja-RK-Boni ignorieren Rüstung und Schilde
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Bestehende Vergabe-Logik in `ClassModifierApplier.js` versäumt die im Regelwerk vorgeschriebene Rüstungs- und Schild-Prüfung).
- **Kategorie:** Klassenregeln & Verteidigungswerte
- **Betroffene Dateien:** [`js/models/helpers/modifiers/ClassModifierApplier.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/models/helpers/modifiers/ClassModifierApplier.js)
- **Problem:**
  - Zeile 26 vermerkt: `(No armor/shield check)`. Mönch und Ninja erhielten ihren Weisheits- und Stufenbonus auf die RK selbst dann, wenn sie Plattenpanzer oder Schilde trugen.
  - Laut RAW (PHB S. 40, Complete Adventurer S. 6) erlöschen diese Boni vollständig bei getragener Rüstung oder getragenem Schild.
- **Auswirkungen für Spieler:**
  - Spieler können ihrem Mönch oder Ninja eine schwere Rüstung oder einen Turmschild anziehen und behalten illegal ihren vollen Weisheits- und Klassen-RK-Bonus (Regelverstoß / Exploit).
- **Auswirkungen für Spielleiter (DM):**
  - Charaktere erreichen illegitim hohe RK-Werte (z.B. Vollplatte + Schild + hoher Weisheitsbonus), wodurch Begegnungen trivialisiert werden.
- **Behebung:**
  - Vor Vergabe von Mönch-/Ninja-AC Rüstungs- und Schild-Status geprüft via `isUnarmoredAndUnshielded = !hasArmor && !hasShield` (unter Nutzung von `isShieldItem`). Ki Power Willen-Rettungswurf bleibt erhalten.

### 15. Generalisten-Magier erhalten unberechtigten Spezialisten-Slot
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Bedingungsfehler in `RulesSpells.js`: `undefined !== 'none'` evaluiert fälschlicherweise zu wahr).
- **Kategorie:** Zauberplätze & Magier-Spezialisierung
- **Betroffene Dateien:** [`js/rules/RulesSpells.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/RulesSpells.js)
- **Problem:**
  - In `calculateMaxSpellSlots` prüft Zeile 180: `pc.wizardSpecialization !== 'none'`.
  - Bei Charakteren ohne explizit gesetzte Spezialisierung (`undefined` oder `""`) ist `undefined !== 'none'` **wahr**. Standard-Magier erhielten dadurch fälschlicherweise auf jedem Grad einen zusätzlichen Spezialisten-Slot.
- **Auswirkungen für Spieler:**
  - Ein reiner Generalisten-Magier erhält auf jedem Spruchgrad einen kostenlosen Extra-Zauberslot, den er nach RAW (PHB S. 57) niemals besitzen dürfte.
- **Auswirkungen für Spielleiter (DM):**
  - Magier haben spürbar mehr Zauberkapazität als vorgesehen; spezialisierte Magier fühlen sich um ihren Klassenvorteil betrogen.
- **Behebung:**
  - Robuste Bedingung implementiert: `const isSpecialist = Boolean(pc.wizardSpecialization && pc.wizardSpecialization !== 'none');`.

### 16. `PCGeneral.js` – `NaN`-Vergiftung bei uninitialisierten `used`-Spellslots
- **Status:** **Offen (Identifiziert im Deep Audit)**
- **Klassifizierung:** **Bug** (Typen- und Fallback-Fehler in existierender State-Hydrierungsfunktion: `Math.min(max, undefined)` erzeugt `NaN`).
- **Kategorie:** State-Hydrierung & Zauberslot-Zustand
- **Betroffene Dateien:** [`js/state/pc/PCGeneral.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/state/pc/PCGeneral.js)
- **Problem:**
  - Zeile 165 setzt `pc.spellSlots[lvl].used = Math.min(pc.spellSlots[lvl].max, pc.spellSlots[lvl].used)`.
  - Wenn `used` bei Import oder Neuerstellung `undefined` ist, ergibt `Math.min(max, undefined)` in JavaScript `NaN`. Sobald `NaN` im Slot-Objekt steht, werden Slot-Anzeigen im UI und Tracker unbenutzbar.
- **Auswirkungen für Spieler:**
  - Die Zauberslot-Pips im Bogen zeigen `NaN` oder reagieren gar nicht mehr auf Klicks; Zauber können weder verbraucht noch regeneriert werden.
- **Auswirkungen für Spielleiter (DM):**
  - Im DM-Tracker werden die Ressourcen des betroffenen Spielers als defekt oder leer angezeigt.
- **Vorgeschlagene Lösung:**
  - Fallback ergänzen: `Math.min(pc.spellSlots[lvl].max, pc.spellSlots[lvl].used || 0)`.

### 17. Phantom-/Zombie-Charaktere nach Löschung im LocalStorage
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Unvollständige Löschlogik in `LocalStorageAdapter.deleteCharacter` hinterlässt verwaiste State-Keys).
- **Kategorie:** Roster-Persistenz & Lebenszyklus
- **Betroffene Dateien:** [`src/services/storage/LocalStorageAdapter.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/services/storage/LocalStorageAdapter.ts), [`src/services/character/CharacterService.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/services/character/CharacterService.ts)
- **Problem:**
  - Wird der einzige oder aktive Charakter gelöscht, entfernt `LocalStorageAdapter.deleteCharacter` zwar `dd_combatsheet_char_${id}`, belässt aber `dd_combatsheet_state` im Speicher.
  - `listCharacters()` fällt bei leerem Index auf `loadState()` zurück und gibt den gelöschten Helden erneut zurück.
  - `CharacterService.deleteCharacter` versucht auf diesen zurückzuschalten; `loadCharacter` liefert `null`, und die App bleibt mit einem Phantom-Zustand hängen, statt einen neuen `Hero` anzulegen.
- **Auswirkungen für Spieler:**
  - Nach dem Löschen eines toten oder veralteten Helden taucht dieser beim Neustart der App wieder auf; die App friert bei Auswahl ein.
- **Auswirkungen für Spielleiter (DM):**
  - In der Kampagnenübersicht tauchen gelöschte Alt-Charaktere wiederholt im Roster auf und blockieren die Tischansicht.
- **Behebung:**
  - In `LocalStorageAdapter.deleteCharacter` wird `this.storageKey` bei Übereinstimmung mit dem gelöschten Charakter oder bei Leerstand vollständig gelöscht bzw. mit dem verbleibenden Helden synchronisiert.
  - In `CharacterService.deleteCharacter` wird die gelöschte ID bei der Bestimmung verbleibender Helden strikt ausgefiltert und bei Leerstand sauber ein neuer `Hero` initialisiert.

---

## Spezifischer Rassen- & Klassen-Audit (Bugs 18–24) — Status: Offen 🔍

Folgende 7 Regellogik-, RAW- und Interaktions-Bugs wurden bei der tiefgehenden Überprüfung der angeforderten Kombinationen (*Dwarf: Rogue/Paladin/Shadowbane Inquisitor*, *Dwarf: Rogue/Wizard/Spellwarp Sniper*, *Lizardfolk: Dragon Shaman*, *Deep Halfling: Fighter/Battle Trickster*) identifiziert:

### 18. `StrikeAbilitySlot.tsx` – Smite-Ressourcen-Kollision bei Paladin / Shadowbane Inquisitor
- **Status:** **Offen (Identifiziert im Deep Audit)**
- **Klassifizierung:** **Bug** (Bestehendes Tactical-Strike-Widget bricht mit `find()` beim ersten Treffer ab und sperrt Inquisitor-Smites aus).
- **Kategorie:** UI-Ressourcen-Slot & Multiclassing
- **Betroffene Dateien:** [`src/components/player/combat/StrikeAbilitySlot.tsx`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/combat/StrikeAbilitySlot.tsx)
- **Problem:**
  - Paladin vergibt `dailyAbilities["Smite Evil"]` (1–5/Tag). Der Shadowbane Inquisitor (Complete Adventurer S. 68) vergibt ab Stufe 2 eigene Ladungen `dailyAbilities["Smite (Inquisitor)"]` (1–3/Tag für *Smite Evil* / *Smite Corrupt*).
  - In `StrikeAbilitySlot.tsx` (Zeile 54) sucht das Tactical-Strike-Widget via:
    ```typescript
    pc.dailyAbilities.find(a => a.name === 'Smite Evil' || a.name === 'Smite (Inquisitor)')
    ```
  - `find()` stoppt beim ersten Treffer. Besitzt ein Charakter beide Klassen, werden ausschließlich die Paladin-Ladungen angezeigt und verbraucht. Die Shadowbane-Inquisitor-Smite-Ladungen sind im Strike-Widget unsichtbar und können im Kampf nicht ausgelöst werden.
- **Auswirkungen für Spieler:**
  - Ein Shadowbane Inquisitor kann im taktischen Strike-Widget auf dem Haupt-Combat-Screen nur seine Paladin-Smites sehen und auslösen. Seine mühsam erworbenen Inquisitor-Smites sind im Kampf-Interface unsichtbar und unzugänglich.
- **Auswirkungen für Spielleiter (DM):**
  - Der Spieler reklamiert mitten im Gefecht, dass er seine Klassenfähigkeiten nicht einsetzen kann, was den Spielfluss bremst und zu manuellen Notizen zwingt.
- **Vorgeschlagene Lösung:**
  - Beide Ressourcen-Pools im Tactical-Strike-Slot aggregieren (`max = sum(max)`, `used = sum(used)`) oder als zwei separate Buttons ("Smite Evil" / "Smite Corrupt") im Slot anbieten.

### 19. `cumulativeFeatures.ts` – Fehlerhafte Smite-Schadensanzeige im Tooltip
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Codefehler in Formatierungs-String: Logisches `||` statt mathematischer Addition `+` zweier Klassenstufen).
- **Kategorie:** UI-Feature-Karten & Beschreibungen
- **Betroffene Dateien:** [`src/components/player/features/registry/cumulativeFeatures.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/features/registry/cumulativeFeatures.ts)
- **Problem:**
  - In Zeile 94 wird der Smite-Schaden wie folgt formatiert:
    ```typescript
    summary: `... +${palLvl || classMap.get('shadowbane_inquisitor')} damage.`
    ```
  - Da `palLvl` truthy ist (z. B. 4), ignoriert der logische OR-Operator `||` die Stufen des Shadowbane Inquisitors vollständig. Ein Paladin 4 / Shadowbane Inquisitor 5 zeigt im Feature-Tooltip "+4 Schaden" an, obwohl `ModifierCalculator.js` den Schadensbonus richtigerweise auf +9 addiert.
- **Auswirkungen für Spieler:**
  - Im Feature-Reiter wird nur z.B. „+4 Schaden“ angezeigt, obwohl der Charakter effektiv +9 austeilen sollte. Der Spieler ist verunsichert, ob der Bogen korrekt rechnet.
- **Auswirkungen für Spielleiter (DM):**
  - DMs müssen bei Schadensansagen im Regelbuch nachschlagen, um zu verifizieren, welcher Wert stimmt, da die UI-Übersicht des Spielers dem tatsächlichen Würfelergebnis widerspricht.
- **Behebung:**
  - In `cumulativeFeatures.ts` wird nun mathematisch addiert: `+${(palLvl || 0) + (shadowbaneLvl || 0)} damage`, sodass Paladin- und Shadowbane-Stufen im Tooltip synchron zu `ModifierCalculator.js` summiert werden.

### 20. Sneak Attack / Sudden Raystrike – 30-ft- / 60-ft-Reichweiten-Validierung
- **Status:** **Geschlossen (By Design / Tischanforderung — Kein App-Fix erforderlich)**
- **Klassifizierung:** **By Design / Tischanforderung** (Bewusste Auslassung einer digitalen Restriktion, da Reichweiten und Sichtlinien physisch am Tisch verhandelt werden).
- **Kategorie:** Taktische Kampfengine & RAW-Regeln (Complete Scoundrel S. 64)
- **Betroffene Dateien:** [`src/components/player/features/registry/classes/csPrestige.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/features/registry/classes/csPrestige.ts), [`src/components/dialogs/AttackChoiceDialog.tsx`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/dialogs/AttackChoiceDialog.tsx)
- **Problem:**
  - Laut Complete Scoundrel S. 64 funktioniert *Sudden Raystrike* auf Ziele bis 30 ft (bzw. 60 ft mit *Ray Mastery* ab Stufe 5).
- **Entscheidung & Lösung:**
  - **Tischanforderung:** Entfernungen, Sichtlinien und Reichweiten (wie die 30-ft-/60-ft-Begrenzung für Sneak Attack oder Sudden Raystrike) werden direkt physisch am Spieltisch (Battlemat / Raster / Miniaturen) von Spielern und Spielleiter geprüft und verhandelt.
  - Eine rechnerische oder restriktive Reichweiten-Überprüfung in der Web-Applikation ist ausdrücklich **nicht erforderlich und nicht gewünscht**. Der Toggle bleibt spielergeführt.

### 21. 🚨 `class-buffs-data.js` – Leere Draconic Auras beim Dragon Shaman
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Fehlendes Feature & Bug (Daten-Lücke)** (Die Daten-Struktur existiert, aber 6 von 7 Auren wurden als Stubs mit `effects: []` hinterlegt; die eigentliche mechanische Auswirkung wurde nie ausprogrammiert).
- **Kategorie:** Klassenregeln, Auren & Buff-Data (Player's Handbook II S. 11)
- **Betroffene Dateien:** [`js/data/class-buffs-data.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/data/class-buffs-data.js), [`js/models/helpers/skills/CombatantSkills.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/models/helpers/skills/CombatantSkills.js), [`js/state/pc/PCGeneral.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/state/pc/PCGeneral.js)
- **Problem:**
  - 6 von 7 Drakonischen Auren des Dragon Shamans besitzen im Dictionary `CLASS_BUFFS_DATA` ein leeres Effekt-Array **`effects: []`**:
    - *Presence*: Verleiht +0 auf Bluff, Diplomacy, Intimidate (sollte +1 bis +4 Bonus sein).
    - *Resistance*: Verleiht **0** Energieresistenz (sollte 5/10/15 sein).
    - *Senses*: Verleiht **0** auf Initiative, Spot und Listen (sollte +1 bis +4 sein).
    - *Toughness*: Verleiht keine Schadensreduzierung (sollte DR 1/magic bis 3/magic sein).
    - *Vigor*: Verleiht keine Fast Healing (sollte Fast Healing 1 bis 2 bis halbe Max-HP gewähren).
    - *Energy Shield*: Verleiht keinen Rückstoßschaden.
  - Das Aktivieren der Auren erzeugte rein kosmetische Buff-Karten im Interface, hatte jedoch **keinerlei mechanische Auswirkung** auf Würfe, RK, Rettungswürfe oder Verteidigung.
- **Auswirkungen für Spieler:**
  - Das Aktivieren von 6 der 7 Auren bringt dem Dragon Shaman und seinen Verbündeten rein gar nichts – keine Fast Healing, keine DR, keine Energieresistenz, keine Fertigkeitsboni. Die absolute Kernmechanik der Klasse ist wirkungslos.
- **Auswirkungen für Spielleiter (DM):**
  - Die gesamte Gruppe verliert ihre erwartete Zähigkeit; Kämpfe, die für eine Gruppe mit Dragon Shaman gebalanced wurden, enden schnell ungewollt tödlich.
- **Behebung:**
  - In `class-buffs-data.js` wurden für alle 6 Auren vollständige RAW-Effektdefinitionen nach PHB II S. 11 hinterlegt:
    - *Presence*: `skill_bluff`, `skill_diplomacy`, `skill_intimidate` mit Typ `bonus` und Formel `draconic_aura`.
    - *Resistance*: `energy_resistance` mit Formel `draconic_aura_resist` (5/10/15/20).
    - *Senses*: `init` (Formel `draconic_aura`), `skill_listen` und `skill_spot`.
    - *Toughness*: `dr` (Formel `draconic_aura`, Typ `magic`).
    - *Vigor*: `fast_healing` (Formel `draconic_aura`, max 50% HP).
    - *Energy Shield*: `damage_shield` (Formel `draconic_aura_shield`).
  - In `CombatantSkills.js` und `PCGeneral.js` wurde die Auswertung aktiver Buffs für Fertigkeiten (`skill_<name>`) und Initiative (`init`) implementiert.

### 22. `wizardSaveHelper.ts` – Fehlender 2. Klauenangriff beim Lizardfolk
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Bestehende Rassen-Initialisierungsfunktion in `wizardSaveHelper.ts` erzeugt unvollständige Angriffs-Arrays).
- **Kategorie:** Rassenregeln & Natürliche Angriffe (Monster Manual S. 169 RAW)
- **Betroffene Dateien:** [`src/components/player/wizardSaveHelper.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/wizardSaveHelper.ts)
- **Problem:**
  - Laut D&D 3.5e Monster Manual S. 169 besitzen Echsenmenschen als natürliche Waffen **2 Klauen (1d4 primär)** und **1 Biss (1d4 sekundär)**.
  - In `wizardSaveHelper.ts` (Zeile 303) wurde beim Erstellen eines Lizardfolk-Charakters nur **1 Klaue** (`natural-claw`) und 1 Biss erzeugt.
  - Bei einem Vollen Angriff (*Full Attack*) fehlte dem Charakter ein kompletter primärer natürlicher Angriff mit vollem GAB.
- **Auswirkungen für Spieler:**
  - Ein Echsenmensch verliert beim vollen Angriff die Hälfte seiner Klauenangriffe (1 statt 2 Klauen), wodurch sein Schadensoutput drastisch hinter den RAW-Vorgaben zurückbleibt.
- **Auswirkungen für Spielleiter (DM):**
  - Wenn der DM Echsenmenschen als Gegner oder Verbündete spawnt, machen diese nur die Hälfte ihrer kanonischen Klauenangriffe (MM S. 169).
- **Behebung:**
  - In `wizardSaveHelper.ts` erzeugt die Initialisierung für Lizardfolk nun getreu MM S. 169 zwei primäre Klauen (`natural-claw-1`, `natural-claw-2` je 1d4, GAB voll) und einen sekundären Biss (`natural-bite`, 1d4, GAB -5).

### 23. `csPrestige.ts` vs. `ModifierCalculator.js` – RAW-Inversion bei *Tricky Fighting*
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Kategorie:** Prestigeklassen-Regeln & Talent-Beschreibungen (Complete Scoundrel S. 28)
- **Klassifizierung:** **Bug** (Deskriptiver Datenfehler im UI-Text, der im Widerspruch zum korrekten Rechenkern in `ModifierCalculator.js` steht).
- **Betroffene Dateien:** [`src/components/player/features/registry/classes/csPrestige.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/features/registry/classes/csPrestige.ts), [`src/components/player/offense/ClassCombatAbilitiesCard.tsx`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/offense/ClassCombatAbilitiesCard.tsx), [`js/rules/ModifierCalculator.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/ModifierCalculator.js)
- **Problem:**
  - In `csPrestige.ts` (Zeile 136) stand: *"+1 competence bonus on weapon DAMAGE rolls"*.
  - Laut Complete Scoundrel S. 28 RAW gewährt *Tricky Fighting* nach Einsatz eines Skill Tricks einen **+1 Competence Bonus auf den nächsten ANGRIFFSWURF** (Attack Roll).
  - In `ModifierCalculator.js` (Zeile 97) war der Bonus korrekt als Angriffsbonus implementiert (`generalAtkMod += 1`). Die UI-Feature-Karte und Fähigkeiten-Buttons zeigten jedoch das Gegenteil (Damage) an.
- **Auswirkungen für Spieler:**
  - Der Spieler liest „+1 Schaden“ auf seiner Karte, wundert sich aber, dass der Schadenswurf nicht ansteigt, während sein Angriffswurf höher ausfällt als erwartet.
- **Auswirkungen für Spielleiter (DM):**
  - Verwirrung und Regeldiskussionen bei der Überprüfung von Spielerangriffen.
- **Behebung:**
  - Beschreibung und Label in `csPrestige.ts` und `ClassCombatAbilitiesCard.tsx` auf RAW Complete Scoundrel S. 28 angepasst: "+1 Attack" bzw. "+1 competence bonus on the next weapon attack roll in round trick performed".

### 24. `wizardSaveHelper.ts` & `deep_halfling.test.js` – Deep Halfling Rettungswurf-Boni nach RAW fälschlich gestrichen
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Inkorrekte Regelauslegung im Generierungs-Code und in Tests, die eine bestehende Rassenfähigkeit fälschlich entfernte).
- **Kategorie:** Rassenregeln & Rettungswürfe (Monster Manual S. 150 RAW)
- **Betroffene Dateien:** [`js/models/helpers/modifiers/CombatantModifiers.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/models/helpers/modifiers/CombatantModifiers.js), [`Tests/deep_halfling.test.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/Tests/deep_halfling.test.js)
- **Problem:**
  - Monster Manual S. 150 RAW: *Deep Halflings have all the halfling racial traits except as follows: They do not have the halfling bonuses to Climb, Jump, and Move Silently checks.*
  - Der generelle Halbling-Vorteil von **+1 Rassenbonus auf alle Rettungswürfe** (und +2 gegen Furcht) bleibt den Tiefen-Halblingen nach RAW ausdrücklich erhalten.
  - Im Code und im Unit-Test wurden den Tiefen-Halblingen fälschlicherweise alle Rettungswurf-Boni aberkannt.
- **Auswirkungen für Spieler:**
  - Der Tiefen-Halbling verliert seinen angeborenen Rassenbonus von +1 auf alle Rettungswürfe (MM S. 150) und scheitert signifikant häufiger an feindlichen Zaubern, Odemwaffen und Giften.
- **Auswirkungen für Spielleiter (DM):**
  - Ungewollter Nerf eines Spielercharakters, der am Tisch zu Regeldiskussionen führt.
- **Behebung:**
  - In `CombatantModifiers.js` wurde die Prüfung auf Halbling-Rassenboni (`+1 racial bonus to all saving throws`) erweitert: `race === 'halfling' || race === 'deep_halfling'`.
  - Der Test `Tests/deep_halfling.test.js` wurde auf D&D 3.5e RAW aktualisiert (MM S. 150: Rettungswürfe bleiben erhalten, Fertigkeitsboni für Climb/Jump/Move Silently entfallen).

---

## Player <-> DM Synchronisations-Audit (Bugs 25–31) — Status: Behoben (Branch: `bugfixes`) ✅

Folgende 7 Netzwerk-, State- und Live-Synchronisations-Bugs wurden bei der Code-Analyse der WebRTC-/Supabase-Realtime-Schicht ([`SyncProtocol.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/network/SyncProtocol.js), [`RealtimeSyncBridge.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/services/network/RealtimeSyncBridge.ts), [`RealtimeManager.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/services/network/RealtimeManager.ts)) identifiziert und behoben:

### 25. 🚨 `SyncProtocol.js` – HP-Desynchronisation zwischen DM und Spielern
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Bestehendes Delta-Protokoll filtert HP-Änderungen in `getObjectDiff` heraus, während die geplante Ersatzfunktion `hp_change` im gesamten Code unvollständig/nicht aufgerufen ist).
- **Kategorie:** Netzwerk-Synchronisation & Trefferpunkte
- **Betroffene Dateien:** [`js/network/SyncProtocol.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/network/SyncProtocol.js)
- **Problem:**
  - In `getObjectDiff` (Zeilen 95–98) wurden HP-Felder herausgefiltert:
    ```javascript
    if (key === 'hp' || key === 'tempHP' || key === 'hp-relative') {
      continue;
    }
    ```
  - Die Architektur sah vor, dass relative HP-Änderungen über Pakete vom Typ `hp_change` übertragen werden.
  - In der gesamten Codebase existierte jedoch keine Funktion, die `hp_change`-Pakete erzeugte oder sendete.
  - Während `getPCStateDiff` (Spieler -> DM) HP manuell anhängte (`diff.hp = pc.hp`), fehlte dieser Fallback bei `getEncounterStateDiff` (DM -> Spieler) komplett!
  - Änderte der DM auf seinem Bildschirm die HP eines Monsters oder eines Spielers, wurde `hp` herausgefiltert. Die Clients erhielten keine HP-Updates, solange nicht das gesamte Combatant-Array ausgetauscht wurde.
- **Auswirkungen für Spieler:**
  - Schaden oder Heilung, die der Spielleiter einträgt (z.B. Umweltschaden, Fallen, Gruppenheilung), erscheint auf dem Spielerbogen überhaupt nicht.
- **Auswirkungen für Spielleiter (DM):**
  - Kritische Desynchronisation: Spieler und DM schauen auf zwei völlig unterschiedliche HP-Stände. Der DM glaubt z.B., ein SC habe noch 40 HP, während der Spieler längst bei 5 HP steht. Der DM trifft fehlerhafte Kampfentscheidungen und tötet Charaktere ungewollt.
- **Behebung:**
  - In `getEncounterStateDiff` in `SyncProtocol.js` wird für alle Combatants ein explizites HP-Diffing durchgeführt (`if (c.hp !== cachedC.hp) diff[`combatants.${idx}.hp`] = c.hp;`). Der Spieler -> DM Pfad via `getPCStateDiff` funktionierte bereits und bleibt unberührt.

### 26. 🚨 `SyncProtocol.js` – DM `state_diff` überschreibt und korrumpiert lokalen PC-State des Spielers
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Kritischer Architektur- und Logikfehler in `applyIncomingDelta`, der lokale Spieler-Bögen mit veralteten DM-Kopien überschreibt).
- **Kategorie:** Netzwerk-Synchronisation & Client-Zustandssicherung
- **Betroffene Dateien:** [`js/network/SyncProtocol.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/network/SyncProtocol.js)
- **Problem:**
  - Sendete der DM ein `state_diff` (z. B. bei Turn-Wechsel oder Monster-Editierung), wurde das `combatants`-Array des Clients via `applyObjectDiff` vollständig durch die Combatants-Liste des DMs ersetzt.
  - Da der DM in seiner Liste auch den Spieler-Charakter führt, wurde der **lokale, detaillierte Charakterbogen des Spielers durch die Kopie des DMs überschrieben**.
  - Die Schutzabfrage in Zeile 394 (`if (backupPC && !s.combatants.some(c => c.id === backupPC.id))`) griff nur, wenn der Charakter im DM-Array *fehlt*. Da die ID übereinstimmte, wurde das Backup nicht wiederhergestellt.
- **Auswirkungen für Spieler:**
  - Gravierender Datenverlust während des Spiels: Sobald der DM eine Runde weiterschaltete oder ein Monster bearbeitete, wurden lokale Eingaben des Spielers (z.B. abgehakte Zauberslots, verbrauchte Tränke, aktivierte Buffs oder gewechselte Waffen) überschrieben und zurückgesetzt.
- **Auswirkungen für Spielleiter (DM):**
  - Frustration und ständige Beschwerden der Spieler („Mein Bogen hat sich gerade wieder zurückgesetzt!“). Der DM verliert das Vertrauen der Gruppe in die digitale Applikation.
- **Behebung:**
  - In `applyIncomingDelta` auf dem Client: Wenn der Host das gesamte `combatants`-Array austauscht, wird der lokale PC mit `backupPC` gemergt, sodass lokale Felder (wie `preparedSpells`, `items`, `feats`, `spellSlots`) unangetastet bleiben, während DM-Zustände (`hp`, `conditions`, `activeBuffs`, `init`) übernommen werden.
  - Granulare Diffs (z.B. Rundenablauf von Buffs) greifen direkt und werden nicht fälschlich revertiert.
  - `cachedPCState` wird nach Anwendung des Diffs aktualisiert.

### 27. `SyncProtocol.js` – Fehlende Initiative-Re-Sortierung beim DM bei `pc_diff`
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Vergessener Aufruf der bestehenden Sortier-Routine `sortCombatants()` nach Eingang von Initiativ-Werten).
- **Kategorie:** Initiative-Tracker & DM-Screen
- **Betroffene Dateien:** [`js/network/SyncProtocol.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/network/SyncProtocol.js)
- **Problem:**
  - Wenn ein Spieler seine Initiative würfelte, sendete der Client ein `pc_diff` mit `{ init, rawInit }` an den Host.
  - In `applyIncomingDelta` (Zeile 321) wandte der Host die Werte an, **rief danach aber niemals `sortCombatants()` auf**.
  - Die Zahl der Initiative änderte sich zwar auf dem DM-Screen, die **Reihenfolge der Initiative-Leiste (Turn Order) blieb jedoch unverändert**, bis der DM manuell sortierte oder ein neuer Charakter jointe.
- **Auswirkungen für Spieler:**
  - Spieler sehen, dass ihr Wurf den Spielleiter erreicht hat, wundern sich aber, warum sie in der Reihenfolge an der falschen Position verharren.
- **Auswirkungen für Spielleiter (DM):**
  - Der DM muss nach jedem Spielerwurf die Initiative-Leiste manuell neu sortieren. Vergisst er das, ist die Zugreihenfolge des gesamten Encounters fehlerhaft und Runden werden in falscher Reihenfolge gespielt.
- **Behebung:**
  - In `SyncProtocol.js` bei `pc_diff`: Sobald `diff.init` oder `diff.rawInit` enthalten sind, ruft der Host automatisch `EncounterManager.sortCombatants()` auf, emittiert `combatants_changed` und re-rendert die Initiative-Leiste (`uiRegistry.renderInitBar()`).

### 28. `SyncProtocol.js` & `useCombatState.ts` – Fehlende Stat-Hydrierung für englische Rettungswürfe (`baseFort`, `baseWill`, `fort`, `will`)
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Unvollständige Eigenschaftsliste in `statFields`, wodurch re-hydrierte Objekte ihre Prototypen und Methoden verlieren).
- **Kategorie:** Stat-Prototypen & Typensicherheit
- **Betroffene Dateien:** [`js/network/SyncProtocol.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/network/SyncProtocol.js), [`src/hooks/useCombatState.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/hooks/useCombatState.ts)
- **Problem:**
  - In beiden Dateien listete das `statFields`-Array nur die deutschen Bezeichnungen:
    ```typescript
    const statFields = [
      'ac', 'acTouch', 'acFlat', 'str', 'dex', 'con', 'int', 'wis', 'cha',
      'baseZa', 'baseRef', 'baseWil', 'bab', 'za', 'ref', 'wil'
    ];
    ```
  - Die englischen Properties `baseFort`, `baseWill`, `fort`, `will` fehlten.
  - Wurden diese Rettungswürfe über ein Delta übertragen, verblieben sie als einfache Plain-Objects `{ base: X }` statt `Stat`-Instanzen. Methoden wie `.total`, `.addModifier()` oder `.rebuildStatModifiers()` warfen Fehler.
- **Auswirkungen für Spieler:**
  - Nach Netzwerk-Synchronisationen konnten Rettungswurf-Komponenten abstürzen oder JavaScript-Fehler werfen (`.total is not a function`), wodurch die Defensiv-Ansicht einfror.
- **Auswirkungen für Spielleiter (DM):**
  - Rettungswürfe von Spielern wurden im DM-Sheet nicht mehr dynamisch aktualisiert, wenn Buffs aktiv wurden.
- **Behebung:**
  - `'baseFort'`, `'baseWill'`, `'fort'`, `'will'` wurden sowohl in `statFields` in `SyncProtocol.js` als auch in `STAT_FIELDS` in `useCombatState.ts` aufgenommen.

### 29. `CharacterRosterDialog.tsx` – `switchActiveCharacter` sendet kein Sync-Event an den DM
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Vergessener Aufruf von `broadcastActivePC()` nach erfolgreicher Ausführung von `switchActiveCharacter`).
- **Kategorie:** Roster & Kampagnen-Synchronisation
- **Betroffene Dateien:** [`src/services/character/CharacterService.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/services/character/CharacterService.ts), [`src/components/player/CharacterRosterDialog.tsx`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/CharacterRosterDialog.tsx)
- **Problem:**
  - Wenn ein Spieler während einer laufenden Live-Kampagne im Charakter-Roster zu einem anderen Charakter wechselte, rief `handleSelectCharacter` nur `characterService.switchActiveCharacter(charId)` auf.
  - Es wurde kein `broadcastActivePC()` ausgeführt. Der Spielleiter sah auf seinem Tisch weiterhin den alten Charakter. Beim nächsten Rundenschalten schickte der DM den alten Charakter als Teil des Encounter-Diffs zurück.
- **Auswirkungen für Spieler:**
  - Der Spieler wechselt zu seinem Zweit-Charakter oder Begleiter, aber die Aktionen kommen beim Spielleiter für den falschen Charakter an.
- **Auswirkungen für Spielleiter (DM):**
  - Der DM sieht den alten Charakter auf der Battlemat und leitet den Kampf gegen eine veraltete Spielfigur.
- **Behebung:**
  - In `CharacterService.ts` aktualisiert `switchActiveCharacter(id)` nun sofort `setLocalPCId(id)` und ruft `broadcastActivePC()` auf, sodass der DM und verbundene Clients synchron ohne Verzögerung informiert werden.

### 30. `RealtimeSyncBridge.ts` – O(N^2) Presence Broadcast-Sturm bei Join/Leave
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Mangelhafte Zustandsprüfung im Presence-Listener, die zu unkontrollierten Broadcast-Kaskaden führt).
- **Kategorie:** Netzwerk-Performance & WebSocket-Traffic
- **Betroffene Dateien:** [`src/services/network/RealtimeSyncBridge.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/services/network/RealtimeSyncBridge.ts)
- **Problem:**
  - Zeilen 112–116 lauten:
    ```typescript
    } else {
      const hasHost = users.some((u) => u.role === 'host');
      if (hasHost) {
        broadcastActivePC();
      }
    }
    ```
  - Jedes Mal, wenn ein beliebiger Spieler beitrat, den Tab schloss oder die Verbindung neu aushandelte, feuerte `onPresenceChange` auf allen verbundenen Clients.
  - Da der Host anwesend war (`hasHost === true`), sendete **jeder einzelne Spieler** seinen kompletten Bogen dreifach gestaffelt. Bei 4 Spielern erzeugte ein einziger Presence-Wechsel 12 vollständige PC-Transfers und unzählige DM-Speicherungen/Diff-Kaskaden.
- **Auswirkungen für Spieler:**
  - Spürbare Lags, UI-Stottern und Verbindungsabbrüche, sobald Mitspieler den Browser minimierten oder Tabs wechselten.
- **Auswirkungen für Spielleiter (DM):**
  - Der Host-Browser wurde mit Dutzenden gleichzeitigen `pc_sync`-Paketen bombardiert. Die wiederholten `saveToStorage()`- und Diff-Berechnungen führten zu hoher CPU-Last und konnten den DM-Screen einfrieren lassen.
- **Behebung:**
  - In `RealtimeSyncBridge.ts` wird nun über `previousHostPresent` getrackt, ob der Host bereits online war. `broadcastActivePC()` wird nur noch bei einer echten Zustandsänderung von Offline zu Online (`!previousHostPresent && hasHost`) ausgeführt.

### 31. `state-core.js` – Identitätsverlust bei Browser-Reload (`localPCId` nicht persistent)
- **Status:** **Behoben (Branch: `bugfixes`)**
- **Klassifizierung:** **Bug** (Fehlende Persistierung einer flüchtigen Session-Variable führt zu falschem Fallback auf den ersten Charakter der Liste).
- **Kategorie:** Session-Persistenz & Multi-PC-Handling
- **Betroffene Dateien:** [`js/state/state-core.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/state/state-core.js), [`src/services/character/CharacterService.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/services/character/CharacterService.ts)
- **Problem:**
  - `localPCId` war eine flüchtige Modul-Variable (`let localPCId = null;`).
  - Beim Neuladen der Seite (F5) war `localPCId` zunächst `null`.
  - In `getActivePC()` (Zeilen 73 & 85) griff der Fallback:
    ```javascript
    const pc = s.combatants.find(c => c.type === 'p');
    ```
  - Wenn `s.combatants` durch vorherige Kampagnen-Synchronisation mehrere Spieler-Charaktere der Party enthielt, wurde dem Nutzer stets der **erste** Spieler-Charakter der Liste zugewiesen. Ein Spieler von Charakter 3 wurde nach F5 plötzlich zu Charakter 1.
- **Auswirkungen für Spieler:**
  - Katastrophale Benutzererfahrung: Nach einem versehentlichen F5 oder Page-Reload steuert der Spieler plötzlich den Charakter eines Mitspielers. Ändert er HP oder Ressourcen, verändert er den falschen Helden.
- **Auswirkungen für Spielleiter (DM):**
  - Vollständiges Durcheinander am Spieltisch, weil mehrere Spieler denselben Charakter bedienen und Daten überschreiben.
- **Behebung:**
  - `localPCId` wird nun dauerhaft im `localStorage` unter dem Schlüssel `'dd_local_pc_id'` gesichert.
  - `getActivePC()` prüft vor dem allgemeinen Fallback auf `find(c => c.type === 'p')` den gespeicherten Wert aus dem `localStorage`.
  - Bei Charakter-Wechseln und -Aktivierungen synchronisiert `CharacterService.ts` diesen Schlüssel konsistent mit.

---

## Neuer Tiefenaudit: Übergreifende Core-Engines & Spezifische Klassen-Schichten (Bugs 32–42)

### 32. Core Combat Engine ist vollständig entkoppelt von Zuständen (Conditions)
- **Status:** **Geschlossen (By Design / Tischanforderung — States werden am Spieltisch gehandhabt)**
- **Klassifizierung:** **By Design / Tischanforderung** (Zustände wie Blinded, Prone, Shaken, Sickened etc. werden nicht digital in der Engine berechnet, sondern wie Reichweiten direkt am Spieltisch gehandhabt; kein App-Fix erforderlich).
- **Kategorie:** Combat Math & Conditions Engine
- **Betroffene Dateien:** [`js/rules/attack/ModifierCalculator.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/attack/ModifierCalculator.js), [`js/models/helpers/modifiers/BaseSavingThrowModifierApplier.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/models/helpers/modifiers/BaseSavingThrowModifierApplier.js), [`js/rules/data/conditions.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/data/conditions.js)
- **Beweisführung / Code-Fundstelle:**
  - In `conditions.js` sind mechanische Bedingungen wie `Blinded`, `Prone`, `Shaken`, `Sickened`, `Stunned`, `Paralyzed`, `Helpless` definiert.
  - Ein Volltext-Audit von `ModifierCalculator.js` (Angriffs- und Schadensberechnung) sowie `BaseSavingThrowModifierApplier.js` (Rüstungsklassen- und Rettungswurf-Modifikatoren) belegt: `pc.conditions` wird an **keiner einzigen Stelle** im gesamten Kampfrechner abgefragt.
  - **Empirische Konsequenz:**
    - Ein Charakter mit Zustand `Blinded` (D&D 3.5e RAW: -2 Angriffe, -2 AC, verliert Dex auf AC) erleidet **0 Abzüge**.
    - Ein Charakter mit Zustand `Prone` (D&D 3.5e RAW: -4 Nahkampfangriffe) behält seinen vollen Angriffsbonus.
    - Ein Charakter mit Zustand `Shaken` (D&D 3.5e RAW: -2 auf alle Angriffe und Rettungswürfe) erleidet weder Angriffs- noch Rettungswurfabzüge.
    - Ein Charakter mit Zustand `Sickened` (D&D 3.5e RAW: -2 auf Angriffe, Schaden und Rettungswürfe) bleibt völlig unbeeinträchtigt.
- **Entscheidung & Lösung:**
  - **Tischanforderung:** Zustandsabzüge werden am Spieltisch manuell mitgeführt. Eine rechnerische Kopplung an die Kernkampf-Engine ist nicht gewünscht.

### 33. `CombatantSkills.js` prüft deutsche Strings und vergisst `Sickened`
- **Status:** **Geschlossen (By Design / Tischanforderung — States werden am Spieltisch gehandhabt)**
- **Klassifizierung:** **By Design / Tischanforderung** (Fertigkeitsabzüge aus Furcht und Übelkeit werden am Tisch berücksichtigt; kein Eingriff in die Skill-Engine erforderlich).
- **Kategorie:** Skills Engine & Lokalisierungs-Inkonsistenz
- **Betroffene Dateien:** [`js/models/helpers/skills/CombatantSkills.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/models/helpers/skills/CombatantSkills.js), [`js/rules/data/conditions.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/data/conditions.js)
- **Beweisführung / Code-Fundstelle:**
  - In `CombatantSkills.js` Zeilen 117–123 steht:
    ```javascript
    // 10. Conditions penalties (Shaken / Sickened)
    const hasShaken = Array.isArray(pc.conditions) && pc.conditions.some(c =>
      c === 'Erschüttet' || (c && c.n === 'Erschüttet') || c === 'Schüttelnd' || (c && c.n === 'Schüttelnd')
    );
    if (hasShaken) {
      breakdown.push({ label: 'Condition (Shaken)', value: -2 });
    }
    ```
  - In `conditions.js` Zeile 26 heißt der Zustand jedoch kanonisch `'Shaken'`. Ein Charakter mit dem Standardzustand `'Shaken'` triggert die Abfrage nicht.
  - Obwohl der Codekommentar explizit `(Shaken / Sickened)` nennt, fehlt der Abzug für `Sickened` (RAW: -2 auf alle Skill Checks) komplett.
- **Entscheidung & Lösung:**
  - **Tischanforderung:** Fertigkeitsabzüge durch Zustände werden am Spieltisch nachgehalten. Die unvollständige Code-Abfrage wird nicht weiter ausgebaut.

### 34. Multiclass Spell-DC Attribut-Hijack & Fehlende Spell Focus Anbindung
- **Status:** **Offen (Empirisch belegt)**
- **Klassifizierung:** **Kombination (Bug & Fehlendes Feature)** (Bug: `casterMod` in `PCCompactGrimoireView.tsx` zwingt das Attribut der ersten Casterklasse global auf alle Zauber aller Klassen auf; Fehlendes Feature: Die Talente `spell_focus` und `greater_spell_focus` sind im DC-Rechner des Grimoires überhaupt nicht angebunden).
- **Kategorie:** Spells Engine & Multiclassing
- **Betroffene Dateien:** [`src/components/player/spells/PCCompactGrimoireView.tsx`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/spells/PCCompactGrimoireView.tsx), [`src/components/player/spells/grimoire/GrimoireLevelGroup.tsx`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/spells/grimoire/GrimoireLevelGroup.tsx), [`js/data/feats/general/phb.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/data/feats/general/phb.js)
- **Beweisführung / Code-Fundstelle:**
  - In `PCCompactGrimoireView.tsx` Zeilen 98–117 wird `casterMod` global ermittelt:
    ```typescript
    if (activeCasters.some((c: any) => ['wizard', 'duskblade', 'beguiler', 'assassin'].includes(c.classType))) {
      return intMod;
    }
    if (activeCasters.some((c: any) => ['cleric', 'druid', 'paladin', 'ranger'].includes(c.classType))) {
      return wisMod;
    }
    if (activeCasters.some((c: any) => ['sorcerer', 'bard'].includes(c.classType))) {
      return chaMod;
    }
    ```
  - **Empirischer Fehler 1:** Bei einem Wizard/Cleric (z.B. Mystic Theurge) matcht Wizard zuerst und gibt `intMod` zurück. Dadurch werden alle Klerikerzauber im Grimoire mit Intelligenz statt Weisheit berechnet. Bei Paladin/Sorcerer matcht Paladin zuerst und Kleriker-/Paladin-Weisheit überschreibt Charisma für Hexenmeisterzauber.
  - **Empirischer Fehler 2:** Die Talente `spell_focus` und `greater_spell_focus` sind in `phb.js` mit `optionType: "school"` sauber angelegt, werden jedoch bei der DC-Berechnung (`10 + lvl + casterMod` in `GrimoireLevelGroup.tsx` Zeile 142) überhaupt nicht ausgewertet.
- **Auswirkungen für Spieler:**
  - Multiclass-Zauberer (z. B. Wizard/Cleric oder Paladin/Sorcerer) haben falsche Schwierigkeitsgrade (DCs) für ihre Zauber im Grimoire, weil das System das Attribut der ersten Casterklasse global für alle Sprüche erzwingt. Magier mit dem Talent *Spell Focus* oder *Greater Spell Focus* erhalten das hart erarbeitete +1/+2 auf ihre Rettungswurf-DCs gar nicht angerechnet.
- **Auswirkungen für Spielleiter (DM):**
  - Rettungswürfe von Monstern gegen Spielerzauber werden gegen falsche SG-Werte gewürfelt. Der DM kann sich nicht auf die im Grimoire angezeigten DCs verlassen und muss bei jedem Zauber die Talente und Klassenattribute des Spielers manuell gegenprüfen.
- **Vorgeschlagene Lösung:**
  - Caster-Modifikator klassenspezifisch bzw. zauberspezifisch auflösen (z.B. über die Spell-Definition oder Klassen-Zuordnung des Spells).
  - Vorhandene Talente `spell_focus` / `greater_spell_focus` für die entsprechende Schule des Spells auf die DC addieren (+1 bzw. +2).

### 35. Stat-Referenzkopplung zwischen `baseZa`/`baseFort` bricht bei Deserialisierung ab
- **Status:** **Offen (Empirisch belegt)**
- **Klassifizierung:** **Bug** (Architektur- und Hydrierungsfehler in `PCGeneral.js`, der den im Konstruktor etablierten Objekt-Alias `this.baseZa = this.baseFort` zerstört).
- **Kategorie:** State Management & Prototypen-Hydration
- **Betroffene Dateien:** [`js/state/pc/PCGeneral.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/state/pc/PCGeneral.js), [`js/models/Combatant.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/models/Combatant.js)
- **Beweisführung / Code-Fundstelle:**
  - Im Konstruktor von `Combatant.js` (Zeilen 101–109) wird ein Alias etabliert:
    `this.baseZa = this.baseFort;` und `this.baseWil = this.baseWill;`
  - In `PCGeneral.js` Zeilen 149–156 steht:
    ```javascript
    if (pc.baseZa instanceof Stat) pc.baseZa.base = saves.fort;
    else pc.baseZa = new Stat(saves.fort);

    if (pc.baseWil instanceof Stat) pc.baseWil.base = saves.wil;
    else pc.baseWil = new Stat(saves.wil);
    ```
  - Wenn `pc.baseZa` nach einem JSON-Transfer keine `Stat`-Instanz ist, weist Zeile 150 eine neue Instanz `new Stat(saves.fort)` an `pc.baseZa` zu. `pc.baseFort` behält die alte Referenz.
  - Damit ist der Alias dauerhaft zerstört: Änderungen an `baseZa` erreichen `baseFort` nicht mehr.
- **Auswirkungen für Spieler:**
  - Temporäre Boni oder Buffs auf Zähigkeit (`baseZa`) oder Willen (`baseWil`) werden in englischsprachigen Modulen, Tooltips oder Berechnungen nicht übernommen, wenn der Bogen einmal aus dem Speicher oder Netzwerk geladen wurde. Der Charakter wirkt geschwächt.
- **Auswirkungen für Spielleiter (DM):**
  - Desynchronisation zwischen Spielerbogen und DM-Combat-Tracker: Der DM sieht veraltete oder abweichende Rettungswürfe für den Spielercharakter.
- **Vorgeschlagene Lösung:**
  - Bei Neu-Instanziierung die Kopplung erneuern: `pc.baseFort = pc.baseZa = new Stat(...)` und `pc.baseWill = pc.baseWil = new Stat(...)`.

### 36. Shadowbane Inquisitor: `Turn Undead` fehlt in Feature-Registry und wird aktiv gelöscht
- **Status:** **Offen (Empirisch belegt)**
- **Klassifizierung:** **Kombination (Fehlendes Feature & Zerstörerischer Bug)** (Fehlendes Feature: Stufen-Stacking für Inquisitor in `cumulativeFeatures.ts` fehlt; Zerstörerischer Bug: `PaladinRules.js` Zeile 64 filtert und löscht `Turn Undead` bei Paladinstufe < 4 aktiv aus `dailyAbilities`).
- **Kategorie:** D&D 3.5e RAW & Feature Stacking
- **Betroffene Dateien:** [`src/components/player/features/registry/cumulativeFeatures.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/features/registry/cumulativeFeatures.ts), [`js/rules/classes/PaladinRules.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/classes/PaladinRules.js), [`js/state/pc/PCGeneral.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/state/pc/PCGeneral.js)
- **Beweisführung / Code-Fundstelle:**
  - Complete Adventurer S. 69 RAW:
    *"Turn Undead (Su): A shadowbane inquisitor can turn undead as a paladin of her shadowbane inquisitor level. If she has paladin levels, her inquisitor levels and paladin levels stack for the purpose of turning undead."*
  - In `cumulativeFeatures.ts` Zeilen 139–153 wird `Turn Undead` ausschließlich registriert, wenn `hasCleric || hasPaladinTurn` (wobei `palLvl >= 4` vorausgesetzt wird). Shadowbane Inquisitor wird ignoriert.
  - In `PaladinRules.js` Zeile 64: Hat ein Charakter z.B. Paladin 3 / Shadowbane Inquisitor 5 (effektive Paladinstufe 8 für Turn Undead), prüft `PaladinRules`: `level >= 4` -> `false`. Da kein Kleriker vorhanden ist, löscht Zeile 64 `Turn Undead` aktiv aus `pc.dailyAbilities` (`pc.dailyAbilities = pc.dailyAbilities.filter(a => a.name !== "Untote vertreiben" && a.name !== "Turn Undead");`).
- **Auswirkungen für Spieler:**
  - Ein Shadowbane Inquisitor mit Paladinstufen kann Untote im Kampfsystem nicht vertreiben (Turn Undead fehlt in den Aktionen). Schlimmer: Beim Laden der Charakterdaten werden vorhandene Vertreiben-Ladungen aktiv aus den Tagesfähigkeiten gelöscht.
- **Auswirkungen für Spielleiter (DM):**
  - Begegnungen mit Untoten werden verzerrt, weil ein Kernfeature der Prestigeklasse nicht nutzbar ist. Der DM muss Vertreiben-Proben manuell auswürfeln und Buch über die verbrauchten Einsätze führen.
- **Vorgeschlagene Lösung:**
  - In `cumulativeFeatures.ts`, `PaladinRules.js` und `PCGeneral.js` die effektive Paladin-Stufe für Turn Undead aus `paladinLevel + shadowbaneInquisitorLevel` berechnen und ab Stufe 4 freischalten.

### 37. Shadowbane Inquisitor: Regelfälschungen bei Sacred Stealth, Burning Light & Smite
- **Status:** **Offen (Empirisch belegt)**
- **Klassifizierung:** **Bug** (Regel- und Datenfehler in `caPrestige.ts` und `ShadowbaneInquisitorRules.js`: Erfundene Ressourcenkosten, falsche Wirkungsdauern, falsche Verdopplungsregeln und zu niedriges Stufe-10-Cap).
- **Kategorie:** D&D 3.5e RAW & Daten-Integrität
- **Betroffene Dateien:** [`src/components/player/features/registry/prestige/caPrestige.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/features/registry/prestige/caPrestige.ts), [`js/rules/classes/ShadowbaneInquisitorRules.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/classes/ShadowbaneInquisitorRules.js)
- **Beweisführung / Code-Fundstelle:**
  - **Sacred Stealth Fälschung:** In `caPrestige.ts` Zeilen 55–56 steht:
    `"Spend 1 Turn Undead attempt to gain a +${stealthBonus} sacred bonus on Hide and Move Silently for ${level} rounds."`
    RAW Complete Adventurer S. 69:
    *"To do this, he must lose a prepared divine spell from memory (or give up a potential spell slot for the day... He gains a +4 sacred bonus on Hide and Move Silently checks for a number of minutes equal to his Charisma bonus (if any) plus the level of spell given up in this manner."*
    -> Die App erfand fälschlich Kosten von Turn Undead und eine Rundendauer statt Zauberslot-Opferung und Minutendauer.
  - **Burning Light Fälschung:** In `caPrestige.ts` Zeile 115 steht:
    `"Evil undead and evil outsiders take double damage (8d6)."`
    RAW Complete Adventurer S. 69:
    *"All creatures within the illuminated area (except for the inquisitor) take 4d6 points of damage. This damage results directly from divine power and is not subject to being reduced by energy resistance."*
    -> Es gibt im Regelwerk keinen doppelten Schaden gegen böse Untote/Outsider.
  - **Smite Cap auf Stufe 10:** In `ShadowbaneInquisitorRules.js` Zeilen 21–25:
    ```javascript
    getSmiteCorruptUses(level) {
      if (level >= 6) return 2;
      if (level >= 2) return 1;
      return 0;
    }
    ```
    Complete Adventurer Tabelle 2-18 RAW: Auf Stufe 10 erhält der Inquisitor 3 Anwendungen pro Tag. Zeile 21 gibt für Stufe 10 nur 2 zurück.
- **Auswirkungen für Spieler:**
  - *Sacred Stealth* verlangt fälschlicherweise Turn-Undead-Versuche statt Zauberslots und hält nur Runden statt Minuten; *Burning Light* hat falsche Schadensregeln. Auf Stufe 10 fehlt dem Inquisitor dauerhaft die 3. tägliche Smite-Anwendung.
- **Auswirkungen für Spielleiter (DM):**
  - Führt zu massiven Regeldiskussionen am Spieltisch, wenn Spieler ihre Fähigkeiten laut offiziellem Buch (*Complete Adventurer*) spielen wollen, die App aber falsche Ressourcen abbucht und Buff-Dauern nach wenigen Runden ablaufen lässt.
- **Vorgeschlagene Lösung:**
  - Beschreibungen und Kosten in `caPrestige.ts` an RAW anpassen.
  - In `ShadowbaneInquisitorRules.js` `if (level >= 10) return 3;` ergänzen.

### 38. Battle Trickster: Stufe 2 Bonus-Talent fehlt & Bonus Skill Tricks berechnen Skill-Punkte
- **Status:** **Offen (Empirisch belegt)**
- **Klassifizierung:** **Kombination (Fehlendes Feature & Bug)** (Fehlendes Feature: Bonus-Feat-Slot für `battle_trickster` Stufe 2 fehlt in `helpers.feats.ts`; Bug: `CharacterWizardDialog.tsx` zieht blind 2 Skillpunkte pro Trick ab, ohne Bonus-Tricks zu prüfen; `BattleTricksterRules.js` schaltet Tricky Fighting auf Stufe 2 statt 3 frei).
- **Kategorie:** D&D 3.5e RAW & Level-Up Wizard
- **Betroffene Dateien:** [`src/components/player/wizard/helpers.feats.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/wizard/helpers.feats.ts), [`src/components/player/CharacterWizardDialog.tsx`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/CharacterWizardDialog.tsx), [`src/components/player/levelup/levelUpSaveHelper.ts`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/levelup/levelUpSaveHelper.ts), [`js/rules/classes/BattleTricksterRules.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/classes/BattleTricksterRules.js)
- **Beweisführung / Code-Fundstelle:**
  - Complete Scoundrel S. 28 RAW:
    - Stufe 1: Bonus Trick (kostenlos, zählt nicht gegen das Maximum).
    - Stufe 2: Bonus Feat (Fighter Bonus Feat oder Skill Trick Feat).
    - Stufe 3: Bonus Trick, Tricky Fighting (+1 Schaden).
  - In `helpers.feats.ts` existiert kein Eintrag für `battle_trickster`. Beim Aufstieg auf Stufe 2 erhält der Spieler **keinen Bonus-Talentslot**.
  - In `CharacterWizardDialog.tsx` Zeile 143:
    `const spentOnTricks = (currentConfig.skillTricks || []).length * 2;`
    Hier werden pauschal 2 Fertigkeitspunkte pro Trick abgezogen, selbst wenn der Trick aus dem kostenlosen Klassenfeature von Stufe 1 oder 3 stammt.
  - In `levelUpSaveHelper.ts` Zeile 92 werden Tricks ohne `{ isBonus: true }` gespeichert, wodurch sie fälschlich gegen das Charakter-Maximum zählen.
  - In `BattleTricksterRules.js` Zeile 18 prüft `getTrickyFightingBonus(level)` `level >= 2 ? 1 : 0`, während Complete Scoundrel Tabelle 2-3 Tricky Fighting erst ab **Stufe 3** gewährt.
- **Auswirkungen für Spieler:**
  - Beim Stufenaufstieg auf Stufe 2 verliert der Spieler ein wichtiges Bonus-Talent (Fighter Feat oder Skill Trick Feat). Zudem werden ihm auf Stufe 1 und 3 jeweils 2 wertvolle Fertigkeitspunkte abgezogen, die ihm laut Klasse kostenlos zustehen, und die Tricks blockieren sein Maximum.
- **Auswirkungen für Spielleiter (DM):**
  - Der Spielercharakter hinkt in seiner Macht und Vielseitigkeit hinter der Klassenbalance hinterher. Der DM muss manuell Talente nachpflegen oder Fertigkeitspunkte korrigieren.
- **Vorgeschlagene Lösung:**
  - Bonus-Feat-Slot für `battle_trickster` Stufe 2 in `helpers.feats.ts` registrieren.
  - Bei Battle Trickster Stufe 1 und 3 den Skill-Point-Abzug erlassen und `{ isBonus: true }` setzen.
  - `BattleTricksterRules.js` Schwelle auf Stufe 3 korrigieren.

### 39. WeaponRegistry `isLight`-Hack verfälscht Power Attack und Beidhändigkeit bei Rapier & Spiked Chain
- **Status:** **Offen (Empirisch belegt)**
- **Klassifizierung:** **Bug** (Architektur- und Modellierungsfehler: Das Setzen von `isLight: true` als Abkürzung für Weapon Finesse bricht nachgelagerte Power-Attack- und TWF-Regeln).
- **Kategorie:** Combat Math & Waffen-Definitionen
- **Betroffene Dateien:** [`js/models/Weapon.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/models/Weapon.js), [`js/rules/attack/ModifierCalculator.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/attack/ModifierCalculator.js), [`js/rules/attack/BaseAttackCalculator.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/attack/BaseAttackCalculator.js)
- **Beweisführung / Code-Fundstelle:**
  - In `Weapon.js` wurden `rapier` (Zeile 21), `whip` (Zeile 28) und `spiked_chain` (Zeile 37) mit `isLight: true` versehen, damit `Weapon Finesse` greift (`ctx.isLight`).
  - **Empirischer Fehler 1 (Power Attack blockiert):**
    In `ModifierCalculator.js` Zeile 142 steht:
    ```javascript
    if (ctx.isOffhand || (ctx.isLight && !ctx.isUnarmed && !ctx.isNatural)) {
      paDmgBonus = 0;
    }
    ```
    Da `spiked_chain` als `isLight: true` markiert ist, erhält eine zweihändige Dornenkette mit Power Attack **0 Schadensbonus**. D&D 3.5e RAW (PHB S. 98, Power Attack) nennt explizit die Spiked Chain als Gegenbeispiel: *"If you have a two-handed weapon, such as a spiked chain, that is treated as a light weapon for the purposes of the Weapon Finesse feat, you may still add the bonus for Power Attack to damage dealt with it (two-handed x2)."*
    Auch ein einhändiger Rapier wird blockiert (`paDmgBonus = 0`), obwohl RAW einhändige Waffen Power Attack nutzen dürfen.
  - **Empirischer Fehler 2 (Falscher TWF-Abzug bei Rapier in Schildhand):**
    In `BaseAttackCalculator.js` Zeile 44: Waffengriff in der Nebenhand prüft `isLightWeapon(weapon)`. Da Rapier `isLight: true` hat, vergibt die App die leichten TWF-Abzüge (-2 / -2), statt der korrekten RAW-Abzüge für einhändige Waffen (-4 / -4 mit Talent, -6 / -10 ohne Talent; PHB S. 160).
- **Auswirkungen für Spieler:**
  - Kämpfer mit Dornenkette (Spiked Chain) erhalten bei *Power Attack* 0 Bonusschaden (statt des zweihändigen x2-Faktors), was den gesamten Build ruiniert. Wer einen Rapier in der Schildhand führt, profitiert unrechtmäßig von zu geringen Abzügen für leichte Waffen (-2/-2 statt -4/-4).
- **Auswirkungen für Spielleiter (DM):**
  - Dornenketten-Builds machen drastisch zu wenig Schaden; Nebenhand-Rapier-Builds treffen unberechtigt häufig. Die Waffen- und Kampfbalance wird verfälscht.
- **Vorgeschlagene Lösung:**
  - In `Weapon.js` die Eigenschaft `isFinessable: true` einführen und `isLight: true` bei Rapier und Spiked Chain entfernen.
  - `SequenceBuilder.js` und `Weapon Finesse` auf `(ctx.isLight || ctx.weapon.isFinessable)` umstellen.

### 40. Smite Evil / Smite Corrupt: Doppel-Abzug und Verbrauchsblockade
- **Status:** **Offen (Empirisch belegt)**
- **Klassifizierung:** **Bug** (Ablauf- und Logikfehler in bestehendem Code: Doppelter Aufruf in `PCOffenseTab.tsx`, Deadlock bei `find()` in `PCFeatsSpells.js` und fälschliche Multiplikation auf alle Iterativangriffe).
- **Kategorie:** Combat Actions & Ressourcen-Tracking
- **Betroffene Dateien:** [`js/state/pc/PCFeatsSpells.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/state/pc/PCFeatsSpells.js), [`src/components/player/offense/PCOffenseTab.tsx`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/offense/PCOffenseTab.tsx), [`js/rules/attack/ModifierCalculator.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/rules/attack/ModifierCalculator.js)
- **Beweisführung / Code-Fundstelle:**
  - **Verbrauchsblockade für Inquisitor:**
    In `PCFeatsSpells.js` Zeile 68:
    ```javascript
    const smiteAbility = pc.dailyAbilities.find(a => a.name === "Böses niederstrecken" || a.name === "Smite Evil" || a.name === "Smite (Inquisitor)" || a.name === "Smite Corrupt");
    ```
    `find` liefert immer die erste Ressource (`Smite Evil`). Sind alle Paladin-Smites aufgebraucht (`smiteAbility.used >= smiteAbility.max`), springt Zeile 76 sofort in `return { success: false, remaining: 0 };`. Die Inquisitor-Smites werden niemals erreicht.
  - **Doppelter Verbrauch pro Angriff:**
    In `PCOffenseTab.tsx` wird `CombatState.consumeSmiteEvilCharge()` sowohl in `handleRollAttack` (Zeile 147) als auch in `handleRollDamage` (Zeile 164) aufgerufen. Führt der Spieler den Angriffswurf aus und rollt danach den Schaden, werden zwei Tagesverbräuche abgezogen.
  - **Fälschliche Multi-Klassen-Addition:**
    In `ModifierCalculator.js` Zeilen 153–164 werden bei aktiviertem Smite die Paladin-Stufe UND die Inquisitor-Stufe additiv auf den Schaden geschlagen (+9 bei Paladin 4 / Inquisitor 5) und auf jeden einzelnen Iterativangriff des Angriffsablaufs angewendet.
- **Auswirkungen für Spieler:**
  - Ein einziger Smite-Angriff zieht 2 Ladungen ab (eine beim Angriff, eine beim Schaden). Sobald Paladin-Smites verbraucht sind, sind auch alle Inquisitor-Smites gesperrt. Zudem wird der Smite-Schaden fälschlich auf alle Mehrfachangriffe einer Runde aufgeschlagen.
- **Auswirkungen für Spielleiter (DM):**
  - Spieler beschweren sich über rasant leere Smite-Ressourcen und blockierte Klassenfeatures. Gleichzeitig verursachen Vollangriffe mit Smite unzulässig hohen Schaden auf allen Iterativangriffen.
- **Vorgeschlagene Lösung:**
  - `consumeSmiteEvilCharge` so anpassen, dass es die erste Ressource mit `used < max` wählt.
  - Den Abzug nur beim Bestätigen des Angriffs (oder Schadens) einmalig ausführen.
  - Im Schadensrechner gezielt die gewählte Smite-Quelle anwenden.

### 41. Initiative 0 oder negativ wird im Header verworfen
- **Status:** **Offen (Empirisch belegt)**
- **Klassifizierung:** **Bug** (Fehlerhafte Wahrheitsprüfung `(pc.init || 0) > 0` in `PCHeader.tsx`, die gültige Werte <= 0 als ungültig verwirft).
- **Kategorie:** UI Rendering & Initiative-Handling
- **Betroffene Dateien:** [`src/components/player/header/PCHeader.tsx`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/header/PCHeader.tsx), [`src/components/player/header/PCHeaderStatsWidget.tsx`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/src/components/player/header/PCHeaderStatsWidget.tsx)
- **Beweisführung / Code-Fundstelle:**
  - In `PCHeader.tsx` Zeile 34:
    ```typescript
    const finalIni = (pc.init || 0) > 0 ? pc.init : ((pc.rawInit || 0) > 0 ? pc.rawInit + totIni : (pc.initiative ? pc.initiative + totIni : '--'));
    ```
  - Würfelt ein Charakter mit niedrigem Dex-Wert eine Initiative von 0 oder kleiner (z.B. d20-Wurf 1 bei Dex 8 = 0), evaluiert `(pc.init || 0) > 0` zu `false`.
  - Die App verwirft den gültigen Würfelwert und zeigt `'--'` an.
- **Auswirkungen für Spieler:**
  - Spieler mit niedrigem Geschicklichkeitswert oder unglücklichem Wurf sehen im Header nur `'--'` statt ihres realen Initiativwerts (z. B. 0 oder -1). Sie wissen nicht verlässlich, wann sie an der Reihe sind.
- **Auswirkungen für Spielleiter (DM):**
  - Der DM sieht den Spieler in der Initiativ-Reihenfolge nicht korrekt eingereiht oder muss am Tisch nachfragen, was der Spieler tatsächlich gewürfelt hat.
- **Vorgeschlagene Lösung:**
  - Auf Existenz prüfen: `pc.init !== undefined && pc.init !== null && pc.init !== ''`.

### 42. Rassenboni-Inkonsistenzen bei Zwerg & Tiefen-Halbling
- **Status:** **Offen (Empirisch belegt)**
- **Klassifizierung:** **Bug** (Unvollständige Datenabfragen: Stonecunning-Skills fehlen bei Zwergen in `CombatantSkills.js` und `deep_halfling` fehlt im Rettungswurf-Check von `CombatantModifiers.js`).
- **Kategorie:** D&D 3.5e RAW & Rassen-Traits
- **Betroffene Dateien:** [`js/models/helpers/skills/CombatantSkills.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/models/helpers/skills/CombatantSkills.js), [`js/models/helpers/modifiers/CombatantModifiers.js`](file:///c:/Users/Juls/Desktop/Session%20Prep%20Pfingsten/2027/CombatApp/js/models/helpers/modifiers/CombatantModifiers.js)
- **Beweisführung / Code-Fundstelle:**
  - In `CombatantSkills.js` Zeilen 81–90 erhält `deep_halfling` Boni auf `listen`, `appraise`, `craft` und `search`.
  - Bei `dwarf` (Zeile 81) ist jedoch ausschließlich `craft` hinterlegt. Obwohl Stonecunning für beide Völker identisch ist (PHB S. 15 / MM S. 150), fehlen bei Zwergen `search` und `appraise`.
  - In `CombatantModifiers.js` Zeilen 125–129 erhält nur `race === 'halfling'` den Rassenbonus von +1 auf alle Rettungswürfe. `deep_halfling` wurde in der Abfrage vergessen, obwohl Tiefen-Halblinge laut Monster Manual S. 150 alle Standard-Halblings-Traits außer Sinnes- und Kletterskills behalten.
- **Auswirkungen für Spieler:**
  - Zwerge verpassen ihren volksspezifischen *Stonecunning*-Bonus (+2 auf Search/Appraise bezüglich Steinarbeiten). Tiefen-Halblinge verlieren ihren generellen Halblings-Rassenbonus von +1 auf alle Rettungswürfe.
- **Auswirkungen für Spielleiter (DM):**
  - In Dungeons scheitern Zwerge an geheimen Steintüren oder Fallen, die sie hätten bemerken müssen; Tiefen-Halblinge fallen Rettungswürfen zum Opfer, die sie mit dem regulären +1 bestanden hätten.
- **Vorgeschlagene Lösung:**
  - `CombatantSkills.js` und `CombatantModifiers.js` für Zwerg und Tiefen-Halbling synchronisieren.
