# System Architecture & Technical Specifications

> **The Combatant (v6.0.0)** — D&D 3.5e Digital Combat Companion & Character Management System  
> Architecture Model: **Hybrid Vanilla-Core & Modular React 19 Presentation**

---

## 1. High-Level Architecture Overview

The Combatant is structured into a strict **6-tier architectural hierarchy** ensuring complete unidirectionality, high performance during tabletop gameplay, and zero runtime latency.

```mermaid
graph TD
    %% UI LAYER
    subgraph UI ["1. UI & Presentation Layer (React 19 + TypeScript)"]
        App["App.tsx (Root Container)"]
        Sheet["PlayerSheet.tsx (Character Sheet)"]
        DM["DMScreen.tsx (DM Screen & Initiative)"]
        Wizard["CharacterWizardDialog.tsx (Creation Wizard)"]
        Roster["CharacterRosterDialog.tsx (Character Library)"]
        CampDialog["CampaignManagerDialog.tsx (Campaign Manager)"]
        JoinDialog["JoinCampaignDialog.tsx (Table Join)"]
        PresenceUI["TablePresenceBar.tsx (Live Presence)"]
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
    subgraph STORAGE ["2. Character, Campaign & Storage Layer"]
        CharService["CharacterService.ts (Roster CRUD & Switch)"]
        CampService["CampaignService.ts (Campaign CRUD & Invites)"]
        SS["StorageService.ts (Dispatcher Singleton)"]
        AdapterIF["<< Interface >> IStorageAdapter.ts"]
        LSA["LocalStorageAdapter.ts (Offline/Guest)"]
        SSA["SupabaseStorageAdapter.ts (Local-First + 800ms Debounce)"]
        
        Roster --> CharService
        CampDialog --> CampService
        JoinDialog --> CampService
        CharService --> SS
        CampService --> SS
        SS -->|controls| AdapterIF
        AdapterIF -.->|implements| LSA
        AdapterIF -.->|implements| SSA
        SSA -->|SyncStatus Events| SyncUI
        
        LS[("LocalStorage Cache")]
        SupaDB[("Supabase PostgreSQL")]
        
        LSA --> LS
        SSA -->|1. Immediate Cache| LS
        SSA -->|2. Debounced Sync| SupaDB
    end

    %% REALTIME WEBSOCKET LAYER
    subgraph REALTIME ["3. Realtime WebSocket & Sync Layer"]
        RM["RealtimeManager.ts (Phoenix Channels)"]
        RSB["RealtimeSyncBridge.ts (Diff Dispatcher)"]
        SupaChannel[("Supabase Channel: campaign:id")]
        
        JoinDialog -->|joinCampaign| RM
        CampDialog -->|switchActiveCampaign| RM
        RM <-->|WebSockets <30ms| SupaChannel
        RM -->|Presence Events| PresenceUI
        RSB -->|broadcastDiff| RM
        RM -->|Incoming Diffs| RSB
    end

    %% STATE LAYER
    subgraph STATE ["4. State Management & Facades (Vanilla JS)"]
        CS["CombatState (Central State)"]
        PCM["PCManager.js (Mutation Facade)"]
        EM["EncounterManager.js (Monsters, Initiative)"]
        CM["ConditionManager.js (Damage, Healing, Buffs)"]
        SM["StorageManager.js (Persistence Facade)"]
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
    subgraph MODELS ["5. Domain Models"]
        Cb["Combatant.js (PC & Monster instances)"]
        Stat["Stat.js (Modifier Stacking Engine)"]
        Wp["Weapon.js (Melee/Ranged/Double/Natural)"]
        Arm["Armor.js (Shields, AC, ACP)"]
        Itm["Item.js (Magic Items, Activation)"]
        
        Cb --> Stat
        Cb --> Wp
        Cb --> Arm
        Cb --> Itm
    end

    %% RULES ENGINES
    subgraph RULES ["6. D&D 3.5e RAW Rules Engines"]
        AtkEng["AttackEngine.js (BAB, TWF, Power Attack)"]
        DndRules["CombatRules.js (Classes, Saves, XP)"]
        FeatRules["RulesFeats.js (Prereqs & Benefits)"]
        PrcEng["prestigeClassEngine.js (6 Prestige Classes)"]
        WildRules["DruidHelper.js (Wild Shape RAW)"]
        CompRules["CompanionRules.js / FamiliarRules.js"]
        
        CS --> RULES
        Cb --> RULES
        Wizard --> RULES
    end
```

---

## 2. Layer Definitions & Responsibilities

### Tier 1: Presentation Layer (`src/components/`, `src/context/`)
- Built with **React 19** and strictly typed with **TypeScript**.
- Follows the **Option A Component Sizing Standard**: 100% of UI component files must be `<= 450 lines`.
- All modals and alerts are declaratively managed through [`src/context/DialogContext.tsx`](file:///c:/Users/styles/PRIVATE/TheCombatant/TheCombatant/src/context/DialogContext.tsx) via `useDialog()`.
- Uses Vanilla CSS and parchment design tokens (`var(--p)`, `var(--pb)`, `var(--red)`, `var(--ink)`).
- **Zero Runtime Latency:** Static chunking with Vite; no dynamic `React.lazy()` spinners during live tabletop gameplay.

### Tier 2: Storage & Service Layer (`src/services/storage/`, `src/services/character/`, `src/services/campaign/`)
- **Local-First Architecture:** State is saved immediately and synchronously to `LocalStorageAdapter`.
- **Supabase Cloud Sync:** In cloud mode, `SupabaseStorageAdapter` buffers state locally and debounces cloud saves with an 800ms window, handling network drops gracefully with auto-recovery.
- **Roster & Campaign Isolation:** `CharacterService` and `CampaignService` provide instant zero-loss switching between multiple characters and DM encounters.

### Tier 3: Realtime Communication Layer (`src/services/network/`)
- Replaces legacy WebRTC/PeerJS with low-latency (<30ms) **Supabase Realtime Channels** (`campaign:<id>`).
- `RealtimeSyncBridge.ts` transmits shallow object diffs created by `SyncProtocol.js`.
- Tracks table presence and online status via `TablePresenceBar.tsx`.

### Tier 4: State Management (`js/state/`)
- In-memory single source of truth managed through `CombatState` singleton.
- Mutations are routed through domain facades: `PCManager.js`, `EncounterManager.js`, `ConditionManager.js`, and `StorageManager.js`.
- React consumption uses `useCombatState()` hook, providing rehydrated immutable state snapshots.

### Tier 5 & 6: Domain Models & D&D 3.5e RAW Rules (`js/models/`, `js/rules/`)
- **Strict Separation of Concerns:**
  - `js/models/` contains data structures without HTML or rule logic.
  - `js/rules/` contains pure, stateless D&D 3.5e rule functions.
  - `Stat.js` encapsulates modifier stacking rules: identical bonus types (e.g. enhancement) do not stack; dodge and untyped bonuses stack.
  - `prestigeClassEngine.js` drives progression for 6 core Prestige Classes (Arcane Trickster, Assassin, Battle Trickster, Eldritch Knight, Shadowbane Inquisitor, Spellwarp Sniper).
