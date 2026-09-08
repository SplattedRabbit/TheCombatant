# Übergabe & Systemstatus (v6.6.0 / Branch `main`) — The Combatant

## 🚀 Copy-Paste Prompt für den neuen Rechner / neuen Chat

```markdown
Wir setzen die Entwicklung von The Combatant auf Basis von Branch `main` (Version v6.6.0 / aktueller Stand) fort.

Zuletzt abgeschlossen:
1. Redesign des "Class & Companion Features" Tabs:
   - Daily Combat Resources Bar (`QuickCombatDashboard.tsx`): Interaktive Klick-Pips am oberen Rand für Smite Evil/Corrupt, Turn Undead, Barbarian Rage, Bardic Music und dynamischer HP-Zähler für Lay on Hands.
   - Live-Suche & Kategoriefilter (`FeaturesFilterBar.tsx`): Filter-Pills (All, Combat/Active, Daily Resources, Passives, Auras, Spell-like) mit Live-Zählern und Sofortsuche über Namen, Quellen, Zusammenfassungen und RAW-Regeln.
   - Unified Feature Cards mit Stacking & Merging (`UnifiedFeatureCard.tsx`, `featureRegistry.ts`): Kumulative Boni werden automatisch zusammengeführt (z. B. Sneak Attack +5d6 aus Rogue + Shadowbane Inquisitor, Turn Undead Stufen), inklusive Herkunfts- und Kategorie-Badges.
   - RAW Rules Inspector Drawer (`RulesInspectorDrawer.tsx`): Klick auf eine Fähigkeit öffnet rechts den vollständigen offiziellen D&D 3.5e RAW-Regeltext samt Aktionsökonomie, Dauer, Reichweite und Stacking-Quellen.
   - Begleiter-Hub & Mini-Widget (`CompanionMiniStatusWidget.tsx`): Rechts dauerhaft Begleiter-HP, RK und Schnellangriffe im Blick + Umschalter für das vollständige Begleiter-Sheet.
   - Design System: Alle weißen Hintergründe durch das warme D&D-Fantasy-Pergament-Theme (`var(--pb)`, Pergament-Gradients) ersetzt.
2. Neuer Democharakter ("Kaelen Swiftblade"):
   - Vollständig konfigurierter Level 13 Battle Trickster (Human Fighter 6 / Rogue 4 / Battle Trickster 3) in `encounter-samples.js` und im Sample-Auswahldialog hinterlegt (BAB +11/+6/+1, Keen Rapier 15–20/x2, Skill-Tricks, magische Ausrüstung, RK 24).
3. Character Wizard Audit:
   - Verifiziert, dass im Wizard (Schritt 3) bei Feats, ACFs und Skill-Tricks eine tiefe Stichwortsuche in den Regeln aktiv ist.
4. Test- & Build-Status:
   - 343 Node-Tests (`npm test`) in 24 Suites → 100% bestanden (0 Fehler).
   - 41 Vitest UI-Tests (`npm run test:ui`) in 7 Suites → 100% bestanden (0 Fehler).
   - TypeScript (`npm run typecheck`) → 0 Fehler.
   - Produktions-Build (`npm run build`) → erfolgreich generiert (Code 0).
   - Branch `class_feature_rebuild` vollständig nach `main` gemergt und auf GitHub synchronisiert.
```

---

## 📋 Systemstatus & Git-Metadaten

* **Repository:** `https://github.com/SplattedRabbit/TheCombatant.git`
* **Aktueller Branch:** `main` (Up-to-date mit Remote `origin/main`)
* **Letzter Commit:** `e0655cd` (*"build: update service worker cache version"*)
* **Test-Suite:** 
  * 343 Node-Tests (`npm test`) $\rightarrow$ **343 / 343 bestanden (100% Pass)**
  * 41 Vitest UI-Tests (`npm run test:ui`) $\rightarrow$ **41 / 41 bestanden (100% Pass)**
* **TypeScript-Prüfung:** `npm run typecheck` (`tsc --noEmit`) $\rightarrow$ **0 Fehler**
* **Produktions-Build:** `npm run build` $\rightarrow$ **Erfolgreich (Code 0)**

---

## 🛠️ Detaillierte Dokumentation aller Neuerungen & Architektur (v6.6.0)

### 1. Class & Companion Features Tab (`src/components/player/features/`)
* **`QuickCombatDashboard.tsx`:**
  - Platziert am oberen Rand des Features-Tabs für schnelle Kampfaktionen ohne Scrollen.
  - Verwendet klickbare Pips für limitierte Tagesressourcen:
    - *Smite Evil / Smite Corrupt:* `⚡ 2/3 übrig` (Klick verbraucht/stellt wieder her).
    - *Lay on Hands:* Dynamischer HP-Pool mit `-` und `+` Buttons (`18 / 24 HP`).
    - *Turn Undead:* Heilige Sonnen-Pips (`☀️ 3/4 übrig`).
    - *Barbarian Rage & Bardic Music:* Tageszähler werden nur eingeblendet, wenn die Klasse aktiv ist.
* **`FeaturesFilterBar.tsx`:**
  - Echtzeit-Suchfeld filtert über Name, Herkunft, Zusammenfassung und RAW-Regeltext.
  - Filter-Pills mit dynamischen Zählern: `[📜 All]`, `[⚔️ Combat / Active]`, `[⏳ Daily Resources]`, `[🛡️ Passives]`, `[✨ Auras]`, `[🔮 Spell-like]`.
* **`featureRegistry.ts` & `UnifiedFeatureCard.tsx`:**
  - Vereinheitlichte Datenstruktur `UnifiedFeature` für alle Klassen- und Rassenfähigkeiten.
  - Automatisches Merging kumulativer Boni:
    - *Sneak Attack:* Fasst z. B. Rogue Lv.5 (+3d6) und Shadowbane Inquisitor Lv.4 (+2d6) zu einer gemeinsamen Karte `Sneak Attack +5d6` zusammen.
    - *Turn Undead:* Addiert effektive Kleriker- und Paladinstufen sowie Verwendungen.
  - Warme Pergament-Optik mit Herkunfts-Badge (`Rogue 5`, `Paladin 3`), Kategorie-Badge und kompakter Zusammenfassung.
* **`RulesInspectorDrawer.tsx`:**
  - Rechte Spalte fungiert als Detail-Inspektor für RAW-Regeln.
  - Zeigt Aktionsaufwand (*Swift Action*, *Standard Action*, *Passive*), Reichweite, Dauer, Stacking-Quellen und den vollständigen D&D 3.5e Regeltext.
* **`CompanionMiniStatusWidget.tsx` & `PCCompanionWrapper.tsx`:**
  - Bei Charakteren mit Begleiter (Animal Companion, Paladin Mount, Familiar) wird rechts dauerhaft ein Mini-Status-Widget angezeigt (HP-Balken, RK, Direktangriffe).
  - Ein Klick auf `[Full Sheet ↗]` oder die Kopf-Sub-Tabs wechselt nahtlos auf den vollwertigen Begleiterbogen.

### 2. Demo-Charakter: Battle Trickster Level 13 (`js/data/encounter-samples.js`)
* **Name:** *Kaelen Swiftblade* (Human, Chaotic Good).
* **Klassen:** Fighter 6 / Rogue 4 / Battle Trickster 3.
* **Kampfwerte:**
  - BAB: +11 / +6 / +1 (3 iterative Angriffe mit *+2 Keen Rapier* [15–20/x2] und *+1 Shortsword*).
  - RK: 24, Berührung 17, Auf falschem Fuß 19.
  - Prestigefeatures: *Tricky Fighting* (+1 Schaden bei Skill Tricks oder Flankieren/Flat-Footed), *Bonus Tricks*, *Bonus Feat*.
  - Skill Tricks ausgerüstet: *Acrobatic Backstab*, *Spot the Weak Point*, *Nimble Stand*, *Sudden Draw*.
  - Auswahldialog: Direkt im Menü unter **"📋 Sample Data"** wählbar.

### 3. Wizard Stichwortsuche-Audit (`src/components/player/wizard/`)
* **Feats-Tab:** Sucht in Namen (`nameDe`, `nameEn`) und Regeltext/Nutzen (`benefitDe`, `benefitRaw`).
* **ACFs-Tab:** Sucht in Namen, Regeltext (`description`) und ersetztem Feature (`replaces`).
* **Skill Tricks-Tab:** Sucht in Namen und Regelnutzen (`benefit`, `description`).
* **Skills-Tab:** Sucht in Skill-Namen.

---

## 🔒 Abwärtskompatibilitäts-Garantie (Backward Compatibility)

1. **Vorhandene Speicherstände (`localStorage` & `Supabase`):**
   - Bestehende Charaktere laden die neuen Feature-Karten und Dashboards automatisch ohne Konvertierung.
   - Fehlende Begleiterdaten oder neue Tracking-Flags werden durch sichere Defaults (`pc.companion || null`) abgefedert.
2. **Import & Export:**
   - JSON-Charaktere bleiben zu 100% kompatibel.
