# Full-Page Inline Spell-Selection im Character Wizard

## Übersicht der finalen Umsetzung
Die Zauberauswahl im Charakter-Assistenten ist nun **vollständig inline** integriert – ganz **ohne Popups oder Modal-Dialoge**:

### Flow & Seitenübergänge:
1. **Stufe $N$ Klassen- & Fertigkeiten-Konfiguration** (`levelSubView = 'config'`):
   - Der Spieler wählt Klasse, ggf. Wizard-Schul-Spezialisierung + verbotene Schulen, HP, Attribute, Skills und Talente.
   - Wenn auf dieser Stufe eine Zauberklasse vorliegt (z. B. *Wizard*, *Sorcerer*, *Bard*, *Duskblade*), lautet der Weiter-Button unten rechts:
     `Select Spells for Level N →`
2. **Stufe $N$ Zauberauswahl (Vollbild Inline-Ansicht im Wizard)** (`levelSubView = 'spells'`):
   - Klick auf `Select Spells for Level N →` validiert die Stufe und wechselt direkt im Wizard-Hauptfenster auf die Komponente [`Step3SpellSelectionView.tsx`](../src/components/player/wizard/spells/Step3SpellSelectionView.tsx).
   - **Linke Spalte**: Ausgewählte Zauber für Stufe $N$ mit Zähler (`x / y gewählt`), Lösch-Buttons (`✕`), Quoten-Details und Hinweisen zu automatischen Grad-0-Cantrips bei Magier 1.
   - **Rechte Spalte**: Vollwertiges [`PCSpellCompendium.tsx`](../src/components/player/PCSpellCompendium.tsx) mit Suchfeld, Quellenfilter (*PHB*, *PHB2*, *CA*, *CS*), Verbotene-Schulen-Sperre und Zauberdetails beim Klick auf den Namen.
   - **Zurück-Button**: Wechselt zurück zu `← Level N Config`.
   - **Weiter-Button**: Schaltet weiter zu `Level N+1 →` bzw. auf der Zielstufe zu `Review (Step 4) →`.
3. **Stufe $N+1$ Konfiguration**:
   - Der Wizard wechselt sauber zur nächsten Stufe.
   - Klickt man auf Stufe $N+1$ auf `Back`, gelangt man direkt wieder zur Zauberansicht von Stufe $N$.

---

## Verifikationsergebnisse
- **TypeScript**: `tsc --noEmit` mit 0 Fehlern.
- **Unit Tests**: 350 / 350 Tests bestanden (`npm test`).
- **UI Tests**: 41 / 41 Vitest Tests bestanden (`npm run test:ui`).
- **Production Build**: Erfolgreich gebaut (`npm run build`).
- **Branch**: `feature/spell_selection_wizard`.
