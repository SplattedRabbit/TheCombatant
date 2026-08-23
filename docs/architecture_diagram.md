# System-Architektur & Kommunikationswege (CombatApp)

Dieses Diagramm visualisiert die verschiedenen Ebenen (Layer) der Anwendung, die Datenmodelle, die Regelberechnungs-Engines, den Multi-Character Roster, das DM Multi-Campaign Dashboard und den Supabase Realtime WebSocket Sync-Flow.

```mermaid
graph TD
    %% UI LAYER
    subgraph UI ["1. UI & Presentation Layer (React)"]
        App["App.tsx (Root Entry)"]
        Sheet["PlayerSheet.tsx (Charakterbogen)"]
        DM["DMScreen.tsx (DM Spielleiter-Ansicht)"]
        Wizard["CharacterWizardDialog.tsx (Wizard)"]
        Roster["CharacterRosterDialog.tsx (Helden-Bibliothek)"]
        CampDialog["CampaignManagerDialog.tsx (DM Dashboard)"]
        JoinDialog["JoinCampaignDialog.tsx (Spieler-Beitritt)"]
        PresenceUI["TablePresenceBar.tsx (Tisch-Präsenz)"]
        SyncUI["SyncIndicator.tsx / UserMenu.tsx"]
        
        App --> Sheet
        App --> DM
        App --> Wizard
        App --> SyncUI
        Sheet --> Roster
        Sheet --> JoinDialog
        Sheet --> PresenceUI
        DM --> CampDialog
        DM --> PresenceUI
        UserMenu --> Roster
        UserMenu --> CampDialog
        UserMenu --> JoinDialog
    end

    %% CHARACTER, CAMPAIGN & STORAGE LAYER
    subgraph STORAGE ["2. Character, Campaign & Storage Layer (Phase 3, 4 & 5)"]
        CharService["CharacterService.ts (Roster CRUD & Switch)"]
        CampService["CampaignService.ts (Campaign CRUD, Isolation & Invite)"]
        SS["StorageService.ts (Zentraler Dispatcher)"]
        AdapterIF["<< Interface >> IStorageAdapter.ts"]
        LSA["LocalStorageAdapter.ts (Offline/Gast)"]
        SSA["SupabaseStorageAdapter.ts (Local-First + 800ms Debounce)"]
        
        Roster --> CharService
        CampDialog --> CampService
        JoinDialog --> CampService
        CharService --> SS
        CampService --> SS
        SS -->|steuert aktiven| AdapterIF
        AdapterIF -.->|implementiert durch| LSA
        AdapterIF -.->|implementiert durch| SSA
        SSA -->|SyncStatus Events| SyncUI
        
        LS[("LocalStorage: dd_combatsheet_state, dd_character_*, dd_campaign_*")]
        SupaDB[("Supabase PostgreSQL: characters / campaigns / campaign_members")]
        
        LSA --> LS
        SSA -->|1. Sofort-Cache| LS
        SSA -->|2. Debounced Sync| SupaDB
    end

    %% REALTIME WEBSOCKET LAYER
    subgraph REALTIME ["3. Realtime WebSocket & Sync Layer (Phase 6)"]
        RM["RealtimeManager.ts (Phoenix Channels)"]
        RSB["RealtimeSyncBridge.ts (Diff Dispatcher)"]
        SupaChannel[("Supabase Realtime Channel: campaign:id")]
        
        JoinDialog -->|joinCampaign| RM
        CampDialog -->|switchActiveCampaign| RM
        RM <-->|WebSockets <30ms| SupaChannel
        RM -->|Presence Events| PresenceUI
        RSB -->|broadcastDiff| RM
        RM -->|Incoming Diffs| RSB
    end

    %% STATE LAYER
    subgraph STATE ["4. State Management & Facades (Vanilla JS)"]
        CS["CombatState (Zentraler State)"]
        PCM["PCManager.js (Mutations-Facade)"]
        EM["EncounterManager.js (Monster, Turns, Initiative)"]
        CM["ConditionManager.js (Schaden, Heilung, HP)"]
        SM["StorageManager.js (Persistenz-Fassade)"]
        SP["SyncProtocol.js (Object Diffs & Patching)"]
        
        Wizard --> CS
        CS --> PCM
        CS --> EM
        CM --> CS
        PCM --> SM
        EM --> SM
        CS --> SM
        SM --> SS
        SM -->|onStateSave| RSB
        RSB -->|applyIncomingDelta| SP
        SP --> CS
        CharService -->|switchActiveCharacter| SM
        CampService -->|switchActiveCampaign| SM
    end

    %% MODEL LAYER
    subgraph MODELS ["5. Data Models"]
        Cb["Combatant.js (Charakter- & Monster-Instanz)"]
        St["Stat.js (Base + Modifiers Stacking)"]
        Wp["Weapon.js / Armor.js / Item.js"]
        
        PCM --> Cb
        EM --> Cb
        Cb --> St
        Cb --> Wp
    end

    %% RULES & CALCULATIONS LAYER
    subgraph RULES ["6. Rules & Calculation Engine"]
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

    %% Styling
    style UI fill:#f5f5f7,stroke:#666,stroke-width:1px
    style STORAGE fill:#f3e8fd,stroke:#7b1fa2,stroke-width:1.5px
    style REALTIME fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style STATE fill:#e8f0fe,stroke:#1976d2,stroke-width:1.5px
    style MODELS fill:#e6f4ea,stroke:#137333,stroke-width:1.5px
    style RULES fill:#fce8e6,stroke:#c5221f,stroke-width:1.5px
```

## Beschreibung der Kommunikationswege

1. **User Action & UI (React)**: 
   Änderungen an Werten (z. B. Schaden eintragen oder Talente lernen) werden von React-Komponenten über den `CombatState` (Zustandsschicht) verarbeitet.

2. **Realtime WebSocket Synchronisation (Phase 6)**:
   DM und Spieler treten beim Öffnen einer Kampagne automatisch dem Supabase WebSocket-Kanal `campaign:<campaignId>` bei.
   * Jede Mutation an HP, Status oder Rundenstand erzeugt ein flaches Diff über `SyncProtocol.getObjectDiff()`.
   * Das Diff wird über `RealtimeManager.broadcastDiff()` in <30ms an alle verbundenen Spieler gestreamt.
   * Die `TablePresenceBar.tsx` zeigt live alle am Tisch anwesenden Spieler mit Avatar und Verbindungsstatus an.
   * **PeerJS/WebRTC wurde vollständig aus dem Projekt entfernt.**

3. **Multi-Character Management (Phase 4)**:
   Über den `CharacterRosterDialog.tsx` können Spieler ihre Helden-Bibliothek verwalten. `CharacterService.ts` ermöglicht das Erstellen, Duplizieren, Löschen und unterbrechungsfreie **Zero-Loss Switching** von Charakteren.

4. **DM Multi-Campaign Dashboard (Phase 5)**:
   Spielleiter können über `CampaignManagerDialog.tsx` beliebig viele D&D-Kampagnen anlegen und verwalten mit individuellem Einladungscode (`RAVEN-42`) und vollständig isoliertem Encounter-Zustand.

5. **Storage & Cloud-Sync (Phase 3 Adapter-Pattern)**:
   Jede State-Mutation ruft `saveToStorage()` auf. `StorageManager.js` delegiert an den `StorageService.ts`:
   * **Gast:** `LocalStorageAdapter.ts` speichert direkt synchron im `localStorage`.
   * **Supabase:** `SupabaseStorageAdapter.ts` puffert synchron im lokalen Cache und sendet nach 800ms Debounce einen Cloud-Upsert.
