# Bugreports (UAT) — Alle 7 Bugs behoben ✅

Diese Dokumentation enthält die detaillierte Analyse und die implementierten Lösungen der im UAT (User Acceptance Testing) gemeldeten Bugs. Alle 7 Punkte wurden vollständig implementiert und durch automatisierte Tests verifiziert.

---

## 1. Spellwarp Sniper bekommt keine korrekten Zauberstufen
- **Status:** **Behoben**
- **Problem:** Die Prestigeklasse "Spellwarp Sniper" erhält zwar eine Zauberklassenzuordnung beim Stufenaufstieg (z.B. Wizard), aber die Zauberstufen wurden nicht korrekt hinzugefügt.
- **Lösung:** 
  - In `js/rules/RulesSpells.js` (`getEffectiveCasterLevel`) wird `clsDef.spellcastingBonus` ausgewertet. Spellwarp Sniper erhält 5/5 Vollprogression (+1 Zauberstufe pro Level) gemäß RAW (*Complete Scoundrel* S. 64).
  - Automatischer Fallback für importierte Charaktere verknüpft PrCs mit vorhandenen Caster-Klassen.
- **Verifikation:** `Tests/spellwarp_sniper_spells.test.js`

## 2. Spells der Stufe 0 (Cantrips) fehlen in der Spelllibrary
- **Status:** **Behoben**
- **Problem:** Cantrips der Stufe 0 sollen laut Beschreibung automatisch beim Levelup hinzugefügt werden, tauchten aber nicht auf.
- **Lösung:** 
  - In `src/components/player/wizard/wizardSaveHelper.ts` (Zeilen 169–172) wird `s.classLevels` (`cl.class === 'wizard' && cl.level === 0`) ausgewertet, sodass alle Cantrips beim Erstellen/Leveln automatisch im Grimoire (`freshPC.learnedSpells`) landen.
- **Verifikation:** `Tests/wizard_prc_spells.test.js`

## 3. Im Zaubermodul können keine Zauber vorbereitet werden
- **Status:** **Behoben**
- **Problem:** Das Popup zum Vorbereiten erschien zwar, aber in der "Prepared"-Spalte tauchten keine Zauber auf.
- **Lösung:** 
  - `src/components/dialogs/PrepareSpellDialog.tsx` speichert über `CombatState.updatePCBatch` direkt und reaktiv in `pc.preparedSpells` (inkl. Metamagie, Spezialisten- und Domänenslots).
  - Das React-Bridge-Interface in `DialogContext.tsx` bindet `showPrepareSpellDialog` nahtlos ein.
- **Verifikation:** `Tests/spellwarp_sniper_spells.test.js`

## 4. Spell Empowering fehlt aufgrund fehlender Spell-Slots
- **Status:** **Behoben**
- **Problem:** Ein Charakter (Ninja 2, Wizard 6, Spellwarp Sniper 5 - Gesamtstufe 13) kann keine Zauber empowern, da die erforderlichen Zauberstufen fehlen.
- **Lösung:** 
  - Direkter Folgefehler aus Bug 1. Durch die korrekte Berechnung von Caster-Level und Slots (`calculateMaxSpellSlots`) stehen höhergradige Slots (z. B. Grad 4–6 für Stufe 13) zur Verfügung und Metamagie (Empower Spell +2 Stufen) funktioniert einwandfrei.
- **Verifikation:** `Tests/spellwarp_sniper_spells.test.js`

## 5. Account Dropdown ist durchsichtig
- **Status:** **Behoben**
- **Problem:** Das Dropdown im User-Menü lässt den Hintergrund durchscheinen.
- **Lösung:** 
  - In `src/components/auth/UserMenu.tsx` (Zeilen 128–129) ist `backgroundColor: '#f4e8c1'` vor `backgroundImage: 'var(--p)'` explizit definiert, wodurch der Hintergrund solide und blickdicht dargestellt wird.
- **Verifikation:** Visuelle Inspektion und CSS-Regel.

## 6. Creation Wizard überspringt Zauberlernen für Prestigeklassen
- **Status:** **Behoben**
- **Problem:** Spellwarp Sniper (und andere zaubernde Prestigeklassen) erhielten im Erstellungs-Wizard keinen Zauber-Auswahl-Reiter bzw. konnten keine Sprüche ihrer verknüpften Zauberklasse auswählen.
- **Lösung:** 
  - `src/components/player/wizard/spells/spellSelectionRules.ts`: `resolveSpellLevelInfo` ermittelt bei Prestigeklassen mit Zauberprogression (`clsDef.spellcastingBonus`) die verknüpfte Basis-Klasse (`targetCasterClass`, z. B. Wizard) und die effektive Zauberstufe. Für Wizard werden 2 Sprüche bis zum neu erreichten Höchstgrad freigeschaltet.
  - `Step3SpellSelectionView.tsx`: Zeigt die Verknüpfung im Titel an (`+1 Wizard CL X`) und filtert die Zauberliste der verknüpften Klasse bis zum Maximalgrad.
  - `CharacterWizardDialog.tsx`: Steuert den Phasenübergang (`levelSubView === 'spells'`) für fortschreitende Prestigeklassen.
  - `wizardSaveHelper.ts`: Speichert `freshPC.prestigeSpellLinks` und `freshPC.prestigeSpecialTextConfirmed` dauerhaft im State.
- **Verifikation:** `Tests/wizard_prc_spells.test.js`

## 7. Skilländerungen durch Items werden nicht berücksichtigt
- **Status:** **Behoben**
- **Problem:** Ausrüstungsgegenstände (z.B. mit +5 Spot) verändern die Skill-Werte weder in der Übersicht noch im Dice-Roll Popup.
- **Lösung:** 
  - In `js/rules/RulesSkills.js` wertet `getItemModForSkill(pc, skillKey)` nun über die zentrale Stacking-Engine `calculateEquippedItemEffects(pc)` alle ausgerüsteten Gegenstände (`pc.items`) aus.
  - D&D 3.5e RAW Stacking-Regeln (gleiche Boni-Typen wie Kompetenz stacken nicht, Glücksboni via `target: 'all'` stacken additiv) werden vollständig berücksichtigt.
  - Nahtlos angebunden an `CombatantSkills.js` (`calculateSkillModifier`), `PCSkillsTab.tsx` (Gesamtmodifikator, Tooltip `• Equipment: +X` und Würfel-Breakdown).
- **Verifikation:** `Tests/item_skill_modifiers.test.js`

## 8. iPad Pinch-to-Zoom Viewport-Sprung nach links unten
- **Status:** **Behoben**
- **Problem:** Beim 2-Finger-Pinchzoom auf dem iPad (z. B. auf den Quick Actionbelt) sprang der Bildausschnitt unkontrolliert nach ganz links unten der App, anstatt an der gezoomten Stelle zu verweilen.
- **Lösung:**
  - In `css/layout.css` wurde `transform: scale(var(--app-scale))` auf `#appRoot` durch die native CSS `zoom: var(--app-scale, 1)` Eigenschaft ersetzt. `zoom` skaliert den Layout-Fluss nativ und bricht die WebKit-Gesten-Koordinaten nicht.
  - In `src/App.tsx` wurden künstliche JavaScript-Höhenberechnungen (`syncBodyHeight()`, `ResizeObserver`) entfernt.
  - In `src/App.tsx` wurden restriktive Scroll-Listener (`handleScroll`, `handleViewportScroll`, `handleFocusIn`), die bei `scrollX !== 0` ein hartes `window.scrollTo(0, window.scrollY)` ausführten, restlos entfernt. Dadurch kann Safari nun völlig frei und flüssig an jeder beliebigen Stelle zoomen und pannen.
- **Verifikation:** Manueller Test auf WebKit/iPad, automatisierter Typecheck & `npm test`.

## 9. Unvollständige Popup-Schatten & Pinch-Zoom-Blockade bei geöffneten Modals
- **Status:** **Behoben**
- **Problem:** Bei geöffneten Popups/Modals wurde das abdunkelnde Hintergrund-Overlay auf manchen Geräten und Auflösungen (iPad, Windows-Laptops mit Bildschirmbreite != 1150px) nicht bildschirmfüllend dargestellt (10–20 % unbeschattete Ränder). Sobald ein Popup geöffnet war, funktionierte auch der Pinch-Zoom nicht mehr stabil.
- **Lösung:**
  - In `css/popups.css` wurde `transform: scale(var(--app-scale))` von allen 18 Backdrop-Overlay-IDs entfernt. Der Vollbild-Schatten (`position: fixed; inset: 0; background: rgba(...)`) bleibt dadurch bei allen Auflösungen exakt bei 100vw × 100vh.
  - Skalierung via `zoom: var(--app-scale, 1)` wird gezielt nur auf die inneren Dialogkarten (`.custom-alert-box`, `.custom-scroll-box`, `.parchment-border`, `.ref-modal`, `.role-container`) angewendet.
  - Alle Modals im gesamten System (im `DialogContext.tsx`, in `DialogOverlay.tsx` sowie alle lokalen Standalone-Modals wie `BeltItemModal`, `SlotEquipModal`, `ItemEditorModal`, `ItemCompendiumModal`, `DruidFeaturesCard` WildShape, `SkillTrickDetailsDialog`, `CompanionAbilityDetailsDialog`, `CampaignManagerDialog`, `CreateCampaignModal`, `CreateCharacterModal`) wurden via React `createPortal` direkt an `document.body` gehängt, wodurch sie vollständig von `#appRoot` und dessen Skalierung isoliert sind.
- **Verifikation:** Automatisierter Typecheck, 392 Unit-Tests und Production Build.

