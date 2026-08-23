# System-Architektur & Kommunikationswege (CombatApp)

Dieses Diagramm visualisiert die verschiedenen Ebenen (Layer) der Anwendung, die Datenmodelle, die Regelberechnungs-Engines, den Storage- & Cloud-Sync-Layer (Supabase / LocalStorage) sowie den Peer-Sync-Flow.

```mermaid
graph TD
    %% UI LAYER
    subgraph UI ["1. UI & Presentation Layer (React)"]
        App["App.tsx (Root Entry)"]
        Sheet["PlayerSheet.tsx (Charakterbogen)"]
        DM["DMScreen.tsx (DM Spielleiter-Ansicht)"]
        Wizard["CharacterWizardDialog.tsx (Wizard)"]
        Bridge["ReactDialogBridge.tsx (Dialog-Bridge)"]
        SyncUI["SyncIndicator.tsx / UserMenu.tsx"]
        
        App --> Sheet
        App --> DM
        App --> Wizard
        App --> SyncUI
        Sheet --> Bridge
    end

    %% STATE LAYER
    subgraph STATE ["2. State Management & Facades (Vanilla JS)"]
        CS["CombatState (Zentraler State)"]
        PCM["PCManager.js (Mutations-Facade)"]
        CM["ConditionManager.js (Schaden, Heilung, HP)"]
        SM["StorageManager.js (Persistenz-Fassade)"]
        
        Bridge --> CS
        Wizard --> CS
        CS --> PCM
        CM --> CS
        PCM --> SM
        CS --> SM
    end

    %% STORAGE & CLOUD LAYER
    subgraph STORAGE ["3. Storage & Cloud-Sync Layer (Adapter-Pattern)"]
        SS["StorageService.ts (Zentraler Dispatcher)"]
        AdapterIF["<< Interface >> IStorageAdapter.ts"]
        LSA["LocalStorageAdapter.ts (Offline/Gast)"]
        SSA["SupabaseStorageAdapter.ts (Local-First + 800ms Debounce)"]
        
        SM -->|delegiert an| SS
        SS -->|steuert aktiven| AdapterIF
        AdapterIF -.->|implementiert durch| LSA
        AdapterIF -.->|implementiert durch| SSA
        SSA -->|SyncStatus Events| SyncUI
        
        LS[("LocalStorage: dd_combatsheet_state")]
        SupaDB[("Supabase PostgreSQL: characters / campaigns")]
        
        LSA --> LS
        SSA -->|1. Sofort-Cache| LS
        SSA -->|2. Debounced Sync| SupaDB
    end

    %% MODEL LAYER
    subgraph MODELS ["4. Data Models"]
        Cb["Combatant.js (Charakter-Instanz)"]
        St["Stat.js (Base + Modifiers Stacking)"]
        Wp["Weapon.js / Armor.js / Item.js"]
        
        PCM --> Cb
        Cb --> St
        Cb --> Wp
    end

    %% RULES & CALCULATIONS LAYER
    subgraph RULES ["5. Rules & Calculation Engine"]
        Mod["CombatantModifiers.js (Modifier Rebuild)"]
        AE["AttackEngine.js (Angriffe & Würfel)"]
        Val["classValidation.js (Prestige-Prüfung)"]
        
        subgraph ClassRules ["Klassen-Spezifische Regeln"]
            Ranger["RangerRules.js"]
            Monk["MonkRules.js"]
            WizardRules["WizardRules.js"]
            Others["Barbarian/Paladin/Cleric/..."]
        end
        
        Cb -->|rebuildStatModifiers| Mod
        Mod --> ClassRules
        AE --> Cb
        Val --> Cb
    end

    %% NETWORK & SYNC LAYER
    subgraph NET ["6. Realtime / Network Layer"]
        SP["SyncProtocol.js (Diff & Apply)"]
        NM["NetworkManager.js (PeerJS / Connections)"]
        MQ["MessageQueue.js (Outgoing Retry Queue)"]
        
        CS -->|State Changes| SP
        SP -->|getObjectDiff| MQ
        MQ -->|Packets| NM
        NM -->|WebRTC Link| RemotePeer["Spielleiter (DM) oder Spieler (Peer)"]
    end

    %% Styling
    style UI fill:#f5f5f7,stroke:#666,stroke-width:1px
    style STATE fill:#e8f0fe,stroke:#1976d2,stroke-width:1.5px
    style STORAGE fill:#f3e8fd,stroke:#7b1fa2,stroke-width:1.5px
    style MODELS fill:#e6f4ea,stroke:#137333,stroke-width:1.5px
    style RULES fill:#fce8e6,stroke:#c5221f,stroke-width:1.5px
    style NET fill:#fef7e0,stroke:#b06000,stroke-width:1.5px
```

## Beschreibung der Kommunikationswege

1. **User Action & UI (React)**: 
   Änderungen an Werten (z. B. Schaden eintragen oder Talente lernen) werden von React-Komponenten über die `ReactDialogBridge` oder direkt an den `CombatState` (Zustandsschicht) weitergeleitet.
   
2. **State Mutation**:
   `CombatState` delegiert die physische Mutation an den `PCManager` (für Charakterdaten) oder den `ConditionManager` (für HP/Statusänderungen). 

3. **Storage & Cloud-Sync (Phase 3 Adapter-Pattern)**:
   Jede State-Mutation ruft `saveToStorage()` auf. `StorageManager.js` delegiert an den `StorageService.ts`:
   * **Gast / Nicht eingeloggt:** `LocalStorageAdapter.ts` speichert direkt synchron im `localStorage`.
   * **Eingeloggt mit Supabase:** `SupabaseStorageAdapter.ts` speichert den State synchron im lokalen Backup-Cache und sendet nach 800ms Debounce-Inaktivität einen kombinierten Cloud-Upsert (`characters`- bzw. `campaigns`-Tabelle).
   * **Visuelles Feedback:** Statusübergänge (`idle` $\rightarrow$ `saving` $\rightarrow$ `saved` $\rightarrow$ `idle` / `error`) werden über `useSyncStatus()` an den `SyncIndicator.tsx` im Header gestreamt.
   * **Flush-Garantie:** Bei Browser-Schließen oder Reload triggert ein `beforeunload`-Listener `flushPendingSaves()`.

4. **Reaktive Modifikatoren-Neuberechnung (Modelle & Regeln)**:
   Nach jeder Zustandsänderung ruft der `Combatant` intern `rebuildStatModifiers()` auf. Dieser Prozess:
   * Leert alle flüchtigen Modifikatoren in den `Stat`-Klassen.
   * Läuft durch `CombatantModifiers.js` und fragt Rasse, Ausrüstung und Klasseneffekte (über die jeweiligen Klassenregel-Dateien wie `RangerRules.js` oder `MonkRules.js`) ab.
   * Injiziert die Modifikatoren neu in die `Stat`-Objekte, welche über `getValue()` (in `Stat.js`) unter Berücksichtigung von Stacking-Regeln (Dodge/Untyped addieren, andere Typen nur das Maximum) den Endwert berechnen.

5. **Synchronisation (Netzwerk & Session)**:
   Jede State-Änderung triggert das `SyncProtocol.js`. Dieses berechnet ein flaches JSON-Diff (`getObjectDiff`). Das Diff wird über die `MessageQueue.js` (die Verbindungsabbrüche abfedert) an den `NetworkManager.js` gereicht und per **WebRTC** an andere Teilnehmer (DM oder Spieler) gesendet, welche das Diff mittels `applyObjectDiff` lokal anwenden.
