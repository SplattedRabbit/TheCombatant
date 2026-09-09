# Implementierungsplan: Inline Zauberauswahl-Ansicht im Wizard (Kein Modal / Kein Popup)

## Ziel
Der Charakter-Wizard soll für Stufen mit Zauberauswahl (Wizard, Sorcerer, Bard, Duskblade etc.) **kein Modal / Popup** öffnen, sondern einen vollwertigen **Zwischenschritt / View direkt im Wizard-Fenster** anzeigen:
`Stufe N Konfiguration` ➔ `Stufe N Zauberauswahl (Inline-View)` ➔ `Stufe N+1 Konfiguration` (bzw. `Review / Schritt 4`).

---

## Vorgeschlagene Änderungen

### 1. [NEW] Inline-Komponente für Zauberauswahl
- [`src/components/player/wizard/spells/Step3SpellSelectionView.tsx`](../src/components/player/wizard/spells/Step3SpellSelectionView.tsx)
  - Vollwertige Seitenansicht (kein Overlay, kein Modal-Hintergrund, fügt sich 100% in das Wizard-Design ein).
  - **Linke Spalte**: Ausgewählte Zauber für die aktuelle Stufe mit Zähler (`x / y gewählt`), Lösch-Funktion (`✕`), RAW-Hinweis (z. B. automatische Grad-0-Cantrips bei Magier 1) und Quoten-Erklärung.
  - **Rechte Spalte**: Wiederverwendung von [`PCSpellCompendium.tsx`](../src/components/player/PCSpellCompendium.tsx) mit Suchfeld, Quellenfilter (*PHB*, *PHB2*, *CA*, *CS*), Verbotene-Schulen-Sperre und Zauberdetails.

---

### 2. [MODIFY] [`CharacterWizardDialog.tsx`](../src/components/player/CharacterWizardDialog.tsx)
- Steuerung des View-Status für Stufe $N$: `levelSubView: 'config' | 'spells'`.
- **Navigation & Flow**:
  1. Wenn auf Stufe $N$ (`levelSubView === 'config'`) eine Zauberklasse vorliegt:
     - Der Weiter-Button unten rechts heißt: `Select Spells for Level N →`.
     - Klick darauf validiert HP, Skills, Feats, Wizard-Schulen und schaltet innerhalb des Wizards auf `levelSubView = 'spells'`.
  2. In der Zauberansicht (`levelSubView === 'spells'`):
     - Zurück-Button: `← Level N Config`.
     - Weiter-Button:
       - Wenn Quote erfüllt: `Level N+1 →` (oder auf letzter Stufe: `Review (Step 4) →`).
       - Klick darauf schaltet auf die nächste Stufe mit `levelSubView = 'config'`.
  3. Beim Zurückgehen (`handleBack`):
     - Wenn auf Stufe $N+1$ (`config`), geht `Back` zur Zauberauswahl von Stufe $N$ (falls Caster), ansonsten direkt zu Stufe $N$ (`config`).

---

### 3. [DELETE / CLEANUP] `SpellSelectionModal.tsx`
- Das alte Modal wird gelöscht bzw. durch die saubere Inline-View-Komponente ersetzt.
- In `Step3LevelConfig.tsx` und `LevelHeaderAndStats.tsx` werden jegliche modalen Aufrufe entfernt.

---

## Verifikationsplan
1. **Automatisierte Tests**:
   - `npm test` (350 Unit-Tests)
   - `npm run test:ui` (41 Vitest Tests)
   - `npm run typecheck`
   - `npm run build`
2. **Manueller Walkthrough**:
   - Magier Stufe 1 erstellen: Name ➔ Attribute ➔ Stufe 1 (Klasse Magier, Schule wählen z. B. Evokation + 2 verbotene Schulen, HP, Skills, Talente) ➔ Klick auf `Select Spells for Level 1 →` ➔ Inline-Zauberauswahl-Ansicht öffnet sich im Wizard ➔ Zauber auswählen ➔ Klick auf `Review (Step 4) →` oder `Level 2 →`.
