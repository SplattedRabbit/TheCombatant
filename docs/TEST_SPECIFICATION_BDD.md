# 📜 D&D 3.5e CombatApp — Testspezifikation (BDD / Given-When-Then)

> **Dokument-Status:** Entwurf zur Freigabe (Review Draft)  
> **Ziel:** Qualitäts- und Verifikationsabsicherung für Kernabläufe am Spieltisch ohne schwere Browser-Frameworks (pure `node:test`).

---

## 1. Motivation & Philosophie (Table-First Specification)

Um **Bestätigungsfehler (Confirmation Bias)** zu vermeiden, spiegeln diese Tests nicht blind bestehende Implementierungsdetails wider, sondern definieren das **Soll-Verhalten aus Sicht realer Spieltisch-Abläufe (Table Journeys)**.

---

## 2. Testsuite 1: Initiative-Workflow & Eingabe-Integrität

### **Szenario 1.1: Initialer Zustand vor dem Kampf (Noch nicht gewürfelt)**
* **Given (Gegeben sei):**
  * Ein Charakter (z. B. Valerius) ist geladen mit einem Initiative-Modifikator von `+4` (DEX 18).
  * Es wurde noch keine Initiative für die aktuelle Begegnung gewürfelt (`rolled = null` oder `""`).
* **When (Wenn):**
  * Der Charakterbogen bzw. der Defenses-Tab geladen oder abgefragt wird.
* **Then (Dann):**
  * Das Eingabefeld `Rolled` ist leer (`""`).
  * Das Anzeigefeld `Total` zeigt sauber `--` (keine `0`, kein `NaN`, kein Dummy-Wert).
  * An den DM-Screen wird kein voreiliger Initiative-Wert für diesen Kampf übermittelt.

---

### **Szenario 1.2: Physischer d20-Wurf am Spieltisch (Table-First)**
* **Given (Gegeben sei):**
  * Der Charakter hat einen Initiative-Modifikator von `+3`.
* **When (Wenn):**
  * Der Spieler am Tisch physisch eine `14` auf dem d20 würfelt und `14` in das Feld `Rolled` eintippt.
* **Then (Dann):**
  * Das Feld `Total` errechnet synchron und exakt `17` (`14 + 3`).
  * Ein Synchronisations-Event wird erzeugt, das den Gesamtwert `17` (nicht nur die rohe `14`) an den DM-Screen übermittelt.

---

### **Szenario 1.3: Lokale Eingabepufferung (Kein Cursor-Lock oder 0-Reset beim Tippen)**
* **Given (Gegeben sei):**
  * Im Feld `Rolled` (oder `AC`, `Speed`, `SR`) steht ein bestehender Wert (z. B. `14`).
* **When (Wenn):**
  * Der Spieler eine Taste drückt, um den Wert zu ändern (z. B. Backspace, sodass das Feld kurz `""` ist, oder er tippt schnell `"2"` gefolgt von `"0"`).
* **Then (Dann):**
  * Das Feld wird im lokalen Puffer (`localValues`) gehalten und darf **nicht** mitten im Tippen durch ein sofortiges globales Re-Render auf `0` zurückgesetzt werden.
  * Der Fokus und der Cursor bleiben exakt an der Position des Spielers erhalten.
* **When (Wenn):**
  * Der Spieler die Eingabe beendet (Fokusverlust / `onBlur` oder `Enter`).
* **Then (Dann):**
  * Erst jetzt wird der endgültige Wert in den globalen Zustand committet (`CombatState.updatePCNumber`).
  * Falls das Feld absichtlich leer gelassen wurde (`""`), greift der definierte Fallback (z. B. `10` bei AC, `--` bei Initiative).

---

### **Szenario 1.4: Typen-Sicherheit bei Stat-Objekten vs. Primitiven**
* **Given (Gegeben sei):**
  * Die Charakter-Datenstruktur enthält gemischte Typen (primitive Zahlen wie `iniMisc: 2` sowie komplexe `Stat`-Instanzen mit Modifikatoren-Arrays wie `pc.ac = new Stat(10)` oder `pc.za = new Stat(4)`).
* **When (Wenn):**
  * Die Extraktions- und Render-Funktionen die Werte für die UI vorbereiten.
* **Then (Dann):**
  * Aus jeder `Stat`-Instanz wird immer der berechnete numerische Endwert (`.getValue()`) bzw. der Basiswert extrahiert.
  * Numerische Eingabefelder (`<input type="number">`) erhalten ausschließlich gültige Zahlen (`number`) oder leere Puffer-Strings (`string`), sodass der Browser das Feld niemals sperrt oder mit `NaN` überschreibt.

---

## 3. Testsuite 2: Realtime WebSocket Synchronisation (`RealtimeSyncBridge`)

### **Szenario 2.1: Spieler-Initiative-Broadcast an den DM**
* **Given (Gegeben sei):**
  * Spieler A ist mit der Kampagne `camp-alpha` über die `RealtimeSyncBridge` verbunden.
* **When (Wenn):**
  * Spieler A seine gewürfelte Initiative einträgt (berechnetes Total: `22`).
* **Then (Dann):**
  * Die Bridge fängt das `UPDATE_PC`-Event ab.
  * Ein Broadcast-Payload an den Supabase-Kanal `campaign:camp-alpha` wird erzeugt mit `combatant.init = 22`.

---

### **Szenario 2.2: DM ändert Spieler-Zustand (Damage / Condition Sync)**
* **Given (Gegeben sei):**
  * DM und Spieler befinden sich in derselben aktiven Kampagne.
* **When (Wenn):**
  * Der DM dem Charakter 12 Schaden zufügt oder den Zustand *Blinded* vergibt.
* **Then (Dann):**
  * Die Bridge auf Spielerseite empfängt das Diff-Event.
  * Die HP sinken lokal um 12 bzw. der Zustand *Blinded* wird im lokalen State aktiviert, ohne dass ein Page-Reload nötig ist.

---

### **Szenario 2.3: Offline-Resilienz bei Verbindungsabbruch**
* **Given (Gegeben sei):**
  * Die WebSocket-Verbindung bricht kurzzeitig ab (`DISCONNECTED`).
* **When (Wenn):**
  * Der Spieler Werte auf dem Bogen anpasst (z. B. HP oder verbrauchte Zauberslots).
* **Then (Dann):**
  * Die Änderungen werden lokal im Cache gepuffert (Local-First).
  * Sobald die Verbindung wiederhergestellt ist (`CONNECTED`), wird der aktuelle Stand ohne Datenverlust synchronisiert.
