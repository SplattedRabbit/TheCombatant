# System-Architektur & Kommunikationswege (CombatApp)

Dieses Diagramm visualisiert die verschiedenen Ebenen (Layer) der Anwendung, die Datenmodelle, die Regelberechnungs-Engines und den Synchronisations-Flow über WebRTC.

```mermaid
graph TD
    %% UI LAYER
    subgraph UI ["1. UI & Presentation Layer (React)"]
        App["App.tsx (Root Entry)"]
        Sheet["PlayerSheet.tsx (Charakterbogen)"]
        DM["DMScreen.tsx (DM Spielleiter-Ansicht)"]
        Wizard["CharacterWizardDialog.tsx (Wizard)"]
        Bridge["ReactDialogBridge.tsx (Dialog-Bridge)"]
        
        App --> Sheet
        App --> DM
        App --> Wizard
        Sheet --> Bridge
    end

    %% STATE LAYER
    subgraph STATE ["2. State Management & Facades (Vanilla JS)"]
        CS["CombatState (Zentraler State)"]
        PCM["PCManager.js (Mutations-Facade)"]
        CM["ConditionManager.js (Schaden, Heilung, HP)"]
        
        Bridge --> CS
        Wizard --> CS
        CS --> PCM
        CM --> CS
    end

    %% MODEL LAYER
    subgraph MODELS ["3. Data Models"]
        Cb["Combatant.js (Charakter-Instanz)"]
        St["Stat.js (Base + Modifiers Stacking)"]
        Wp["Weapon.js / Armor.js / Item.js"]
        
        PCM --> Cb
        Cb --> St
        Cb --> Wp
    end

    %% RULES & CALCULATIONS LAYER
    subgraph RULES ["4. Rules & Calculation Engine"]
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
    subgraph NET ["5. Sync & Network Layer (WebRTC P2P)"]
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
    style MODELS fill:#e6f4ea,stroke:#137333,stroke-width:1.5px
    style RULES fill:#fce8e6,stroke:#c5221f,stroke-width:1.5px
    style NET fill:#fef7e0,stroke:#b06000,stroke-width:1.5px
```

## Beschreibung der Kommunikationswege

1. **User Action & UI (React)**: 
   Änderungen an Werten (z. B. Schaden eintragen oder Talente lernen) werden von React-Komponenten über die `ReactDialogBridge` oder direkt an den `CombatState` (Zustandsschicht) weitergeleitet.
   
2. **State Mutation**:
   `CombatState` delegiert die physische Mutation an den `PCManager` (für Charakterdaten) oder den `ConditionManager` (für HP/Statusänderungen). 

3. **Reaktive Modifikatoren-Neuberechnung (Modelle & Regeln)**:
   Nach jeder Zustandsänderung ruft der `Combatant` intern `rebuildStatModifiers()` auf. Dieser Prozess:
   * Leert alle flüchtigen Modifikatoren in den `Stat`-Klassen.
   * Läuft durch `CombatantModifiers.js` und fragt Rasse, Ausrüstung und Klasseneffekte (über die jeweiligen Klassenregel-Dateien wie `RangerRules.js` oder `MonkRules.js`) ab.
   * Injiziert die Modifikatoren neu in die `Stat`-Objekte, welche über `getValue()` (in `Stat.js`) unter Berücksichtigung von Stacking-Regeln (Dodge/Untyped addieren, andere Typen nur das Maximum) den Endwert berechnen.

4. **Synchronisation (Netzwerk)**:
   Jede State-Änderung triggert das `SyncProtocol.js`. Dieses berechnet ein flaches JSON-Diff (`getObjectDiff`). Das Diff wird über die `MessageQueue.js` (die Verbindungsabbrüche abfedert) an den `NetworkManager.js` gereicht und per **WebRTC** an andere Teilnehmer (DM oder Spieler) gesendet, welche das Diff mittels `applyObjectDiff` lokal anwenden.
