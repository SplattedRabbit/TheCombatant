# Installations-Anleitung: D&D 3.5e Combat App

Diese App wurde als **Progressive Web App (PWA)** entwickelt. Das bedeutet, sie verhält sich auf deinem Samsung Galaxy S6 Lite (Android) und in Zukunft auf deinem iPad (iOS) wie eine **native, installierte App** – mit eigenem Icon, im Vollbildmodus (ohne Browser-Suchleiste) und mit vollständiger **Offline-Funktionalität**.

Da PWAs aus Sicherheitsgründen eine sichere Umgebung (`https://` oder `localhost`) benötigen, um das App-Icon auf dem Home-Bildschirm zu registrieren, hast du drei einfache Möglichkeiten, die App auf deinem Tablet zu nutzen:

---

## 🚀 Methode A: Kostenloses Hosting über GitHub Pages (Empfohlen!)

Diese Methode ist **völlig kostenlos, dauerhaft verfügbar** und ermöglicht die Installation mit einem einzigen Klick. Deine Daten werden dabei **trotzdem lokal auf deinem Tablet gespeichert** und nicht in einer Cloud.

1. **GitHub-Konto erstellen:** Erstelle ein kostenloses Konto auf [github.com](https://github.com/), falls du noch keines hast.
2. **Repository anlegen:** 
   * Klicke oben rechts auf das `+` und wähle **New repository**.
   * Nenne es z.B. `combat-app` und setze es auf **Public**.
   * Klicke auf **Create repository**.
3. **Dateien hochladen:**
   * Wähle auf der folgenden Seite **"uploading an existing file"**.
   * Ziehe den **gesamten Inhalt** deines Ordners `CombatApp` (die `index.html`, `manifest.json`, `service-worker.js`, die Ordner `css` und `js` sowie die Icons) per Drag-and-Drop in das Browserfenster.
   * Klicke unten auf **Commit changes** (dies dauert einen kurzen Moment).
4. **GitHub Pages aktivieren:**
   * Gehe in deinem Repository oben auf **Settings** (Einstellungen).
   * Klicke in der linken Menüleiste unter *Code and automation* auf **Pages**.
   * Wähle unter *Build and deployment* -> *Source* die Option **Deploy from a branch**.
   * Wähle unter *Branch* statt *None* einfach **main** (oder **root**) und klicke auf **Save**.
   * Nach ca. 1 Minute wird dir ganz oben ein HTTPS-Link angezeigt (z.B. `https://deinname.github.io/combat-app/`).
5. **Auf dem Tablet installieren:**
   * Öffne diesen Link auf deinem Samsung-Tablet in **Google Chrome** oder **Samsung Internet**.
   * Tippe oben rechts auf die drei Punkte (Menü) und wähle **"App installieren"** (oder **"Zum Startbildschirm hinzufügen"**).
   * **Fertig!** Die App hat nun ihr eigenes wunderschönes D&D-Schild-Icon auf deinem Startbildschirm und läuft im eleganten Vollbild-Offline-Modus.

---

## 🔒 Methode B: Lokaler Webserver auf Android (100% Offline & Lokal)

Wenn du die App niemals ins Internet hochladen möchtest, kannst du einen winzigen, kostenlosen Webserver direkt auf deinem Tablet installieren:

1. **Server-App installieren:** Öffne den Google Play Store auf deinem Samsung-Tablet und installiere eine kostenlose, werbefreie App wie **"Tiny Web Server"** oder **"KSweb"**.
2. **Ordner wählen:** Öffne die Server-App und wähle deinen Ordner `CombatApp` auf deinem Tablet-Speicher als Hauptverzeichnis (Root-Directory) aus.
3. **Server starten:** Drücke in der App auf **Start**. Dir wird eine Adresse wie `http://localhost:8080` oder `http://127.0.0.1:8080` angezeigt.
4. **In Chrome installieren:**
   * Öffne Google Chrome auf deinem Tablet und navigiere zu der angezeigten Adresse (z.B. `http://localhost:8080/index.html`).
   * Da Chrome `localhost` als vollkommen sichere Verbindung einstuft, kannst du auch hier einfach auf die drei Menüpunkte tippen und **"App installieren"** wählen.
   * Die App startet ab jetzt direkt von deinem lokalen Speicher!

---

## 📂 Methode C: Direkte lokale Nutzung (Ohne Installation)

Wenn du keine PWA-Installation auf dem Startbildschirm benötigst, sondern die Datei einfach nur als Lesezeichen öffnen möchtest:

1. **Datei auf das Tablet kopieren:** Kopiere den Ordner `CombatApp` auf dein Tablet.
2. **Im Browser öffnen:** Navigiere im Browser deiner Wahl zur Datei `index.html` (z.B. über einen Dateimanager -> Öffnen mit Browser).
3. **Lesezeichen setzen:** Setze ein Lesezeichen oder wähle "Zum Startbildschirm hinzufügen".
4. **Kein Datenverlust:** Auch wenn die App so in der normalen Browser-Umgebung läuft: **Deine Daten sind absolut sicher!** Dank des neuen Auto-Save-Engines wird jede Aktion sofort gespeichert. Selbst wenn du die Seite aktualisierst oder den Tab schließt, ist beim nächsten Öffnen alles wieder da.

---

## 🍏 Installation auf einem iPad (Zukunftssicher!)

Wenn du in Zukunft auf ein iPad umsteigst, ist die Installation dank PWA-Standard ein Kinderspiel:

1. Öffne deinen GitHub Pages Link (aus Methode A) im **Safari-Browser** auf dem iPad.
2. Tippe oben auf den **Teilen-Button** (das Quadrat mit dem Pfeil nach oben).
3. Scrolle ein wenig nach unten und wähle **"Zum Home-Bildschirm hinzufügen"**.
4. **Fertig!** iOS installiert die App mit D&D-Icon auf deinem Home-Bildschirm. Sie läuft völlig autark im Vollbildmodus und arbeitet komplett offline!
