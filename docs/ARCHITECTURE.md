# System Architecture, Developer Guide & Testing Strategy

> **The Combatant** — D&D 3.5e Digital Combat Companion & Character Management System  
> Architecture Model: **Hybrid Vanilla-Core & Modular React 19 Presentation**

---

## 1. High-Level Architecture Overview

The Combatant is structured into a strict **6-tier architectural hierarchy** ensuring complete unidirectionality (`UI → State → Models ← Rules`), high performance during tabletop gameplay, and zero runtime latency.

```mermaid
graph TD
    %% UI LAYER
    subgraph UI ["1. UI & Presentation Layer (React 19 + TypeScript)"]
        App["App.tsx (Root Container)"]
        Sheet["PlayerSheet.tsx (Character Sheet)"]
        DM["DMScreen.tsx (DM Screen, Initiative & Stash)"]
        Wizard["CharacterWizardDialog.tsx (Creation Wizard)"]
        LevelUp["LevelUpDialog.tsx (Level-Up Assistant)"]
        PrintFolio["PrintableCharacterSheetModal.tsx (A4 Print Folio)"]
        Roster["CharacterRosterDialog.tsx (Character Library)"]
        CampDialog["CampaignManagerDialog.tsx (Campaign Manager)"]
        JoinDialog["JoinCampaignDialog.tsx (Table Join)"]
        PresenceUI["TablePresenceBar.tsx (Live Presence)"]
        SyncUI["SyncIndicator.tsx / UserMenu.tsx"]
        
        App --> Sheet
        App --> DM
        App --> Wizard
        App --> SyncUI
        Sheet --> LevelUp
        Sheet --> PrintFolio
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
        SupaChannel[("Supabase Channel: campaign:code")]
        
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
        EM["EncounterManager.js (Monsters, Initiative, Smart Merge)"]
        CM["ConditionManager.js (Damage, Healing, Buffs)"]
        DMS["DMStash.js (DM Vault & Item Distribution)"]
        SM["StorageManager.js (Persistence Facade)"]
        SP["SyncProtocol.js (Entity-ID Diffs & Patching)"]
        
        Wizard --> CS
        CS --> PCM
        CS --> EM
        CS --> DMS
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
        Wp["Weapon.js (Melee/Ranged/Double/Natural/Finessable)"]
        Arm["Armor.js (Shields, AC, ACP, isShieldItem)"]
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
        FeatRules["RulesFeats.js & featPrerequisites.js"]
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
- **Component Line-Count Budget (`<= 450 lines`):** 100% of UI component files in `src/components/` are `<= 450 lines`. Large views are split into domain subfolders (e.g., `src/components/player/offense/stances/`, `src/components/player/spells/grimoire/`).
- **Modal Portal Architecture:** All modals, dialogs, and alert sheets are managed via `src/context/DialogContext.tsx` (`useDialog()`) and mount directly into `document.body` via React `createPortal`. Full-screen backdrops (`position: fixed; inset: 0`) remain unscaled at 100vw × 100vh, while inner parchment cards scale via `zoom: var(--app-scale, 1)`.
- **Responsive Layout & Native Zoom Engine:** `#appRoot` scaling relies on native CSS `zoom: var(--app-scale, 1)` rather than `transform: scale()`, preserving native document flow and fluid 2-finger pinch-to-zoom on iPadOS and touch devices.
- **Legacy Dialog Bridge:** `window.__REACT_DIALOG_BRIDGE__` is maintained strictly for Vanilla JS backwards-compatibility (`js/ui/components/dialogs.js`). React components must always use `useDialog()`.
- **Zero Runtime Latency:** Static chunking in `vite.config.ts`; no `React.lazy()` spinners during tabletop gameplay.

### Tier 2: Storage & Service Layer (`src/services/storage/`, `src/services/character/`, `src/services/campaign/`)
- **Local-First Architecture:** State is saved synchronously to `LocalStorageAdapter`.
- **Supabase Cloud Sync:** `SupabaseStorageAdapter` buffers state locally and debounces cloud saves (800ms window) with automatic offline recovery.
- **Strict Identity & Roster Isolation:** Multiplayer client sessions lock onto `localPCId` (`dd_local_pc_id`) and `activeCharacterId` so foreign party members never overwrite the local player's roster entry.

### Tier 3: Realtime Communication Layer (`src/services/network/`)
- Uses low-latency (<30ms) **Supabase Realtime Channels** (`campaign:<inviteCode>`).
- `RealtimeSyncBridge.ts` transmits shallow object and entity-ID diffs generated by `SyncProtocol.js`.
- Instance-specific `tabId` filtering prevents self-echoes while allowing multi-tab testing on the same device.

### Tier 4: State Management (`js/state/`)
- In-memory single source of truth managed through the `CombatState` singleton (`js/state.js`).
- Mutations are routed through domain facades: `PCManager.js`, `EncounterManager.js`, `ConditionManager.js`, `DMStash.js`, and `StorageManager.js`.
- React components consume immutable rehydrated snapshots via `useCombatState()`.

### Tier 5 & 6: Domain Models, Rules & Modular Data Facades (`js/models/`, `js/rules/`, `js/data/`)
- **Strict Separation of Concerns:**
  - `js/models/` contains data structures without HTML or rule logic.
  - `js/rules/` contains pure, stateless D&D 3.5e rule functions (receiving state slices like `allCombatants` as explicit parameters rather than importing `CombatState`).
  - `Stat.js` & `ModifierStacking.js` encapsulate RAW bonus stacking (Dodge, Circumstance from distinct sources, and Untyped stack; named bonuses take the maximum).
- **Token-Optimized Data Facades:**
  - `js/data/magicItems-data.js` → `js/data/magicItems/`
  - `js/rules/RulesData.js` → `js/rules/data/`
  - `js/state/pc/PCEquipment.js` → `js/state/pc/equipment/`

---

## 3. Developer Quickstart & Workflows

### Local Setup
```powershell
npm ci
npm run dev
```
*(Optional: Copy `.env.example` to `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for cloud sync; runs 100% offline in LocalStorage mode without env variables).*

### Essential Commands (PowerShell)

| Action | Command | When to Use |
|---|---|---|
| **Dev Server** | `npm run dev` | Local development with Vite HMR |
| **Single Core Test (Tier 2)** | `node scripts/run_agent_tests.js Tests/<file>.test.js` | Fast, token-optimized check for a modified module |
| **Full Core Suite (Tier 3)** | `node scripts/run_agent_tests.js` | Global Node test runner suite before finishing structural work |
| **UI Component Tests** | `npm run test:ui` | Vitest + React Testing Library component suite |
| **All Tests** | `npm run test:all` | Runs both Core Node tests and Vitest UI tests |
| **Typecheck** | `npm run typecheck` | Validates TypeScript types (`tsc --noEmit`, 0 `@ts-ignore` policy) |
| **Production Build** | `npm run build` | Compiles Vite bundle and bumps `service-worker.js` via `scratch/update_sw.js` |
| **Search PHB / DMG** | `node scratch/search_phb.js "<query>"` / `node scratch/search_dmg.js "<query>"` | Targeted D&D 3.5e RAW rule lookup without loading raw book files |

---

## 4. Testing Strategy & Quality Gates

The test suite is built on a **dual-runner architecture**:
1. **Tier 1 — Deterministic Domain & Rules Tests (`Tests/*.test.js` via Node.js Test Runner):**
   - Verifies D&D 3.5e RAW math (`attribute_modifiers_raw.test.js`, `modifier_stacking_raw.test.js`, `weapons.test.js`, `armor_shield_dual_equip.test.js`, `saving-throws.test.js`, `skills.test.js`, `feat_prerequisites.test.js`, `wizard.test.js`, `spell_slots.test.js`, `prestigeClassEngine.test.js`, `wildshape.test.js`).
   - Verifies storage adapters, offline resilience, and multiplayer sync isolation (`multiplayer_roster_isolation.test.js`, `sync_protocol_entity_and_merge.test.js`, `storage_*.test.js`).
2. **Tier 2 — Component & Interaction Invariants (`src/__tests__/*.test.tsx` via Vitest + RTL):**
   - Verifies real user workflows across `PlayerSheet`, `CharacterWizard`, `LevelUp`, `PrintableCharacterSheet`, `CharacterRosterDialog`, `ACFRestrictions`, `PrestigeGuidance`, and `Modals` (including DOMPurify XSS sanitization via `sanitizeHtml()`).
