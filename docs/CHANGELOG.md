# Changelog

All notable changes to **The Combatant** are documented in this file.
The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [6.0.0] - 2026-09-02

### Added
- **Full UI Modularization (Option A):** Refactored all 13 oversized UI components into focused, maintainable domain sub-components (`<= 450 lines` per file across all 144 UI component files).
- **Vitest & React Testing Library Integration:** Added automated UI testing suite (`npm run test:ui`) with 14 passing component tests for `PlayerSheet`, `CharacterWizard`, and `DialogContext`.
- **Prestige Classes Engine:** Dedicated D&D 3.5e RAW rules modules for 6 core prestige classes (Arcane Trickster, Assassin, Battle Trickster, Eldritch Knight, Shadowbane Inquisitor, Spellwarp Sniper).
- **Zero-Overhead Logger:** Introduced `src/utils/logger.ts` for clean environment-gated logging.
- **Service Worker Precache Enhancement:** Updated precache manifest ensuring 100% offline availability for 18 production assets.

### Changed
- **Vite Build Chunking:** Configured `manualChunks` in `vite.config.ts` separating vendor libraries, state core, and UI bundles for zero runtime latency.
- **Strict Typing:** Eliminated 100% of `@ts-ignore` directives across the codebase with full TypeScript definitions (`src/types/combat.ts` and `src/types/core-modules.d.ts`).
- **Declarative Dialogs:** Replaced imperative modal bridges with unified `DialogContext` and `useDialog()` hook.

### Security
- Enforced 100% DOMPurify HTML sanitization across all `dangerouslySetInnerHTML` occurrences.

---

## [5.1.0] - 2026-08-20

### Added
- **Multi-Character Library (Roster):** Create, duplicate, delete, and switch between multiple characters with instant zero-loss local/cloud hydration.
- **DM Multi-Campaign Dashboard:** Manage distinct campaign encounters, generate 8-character invite codes, and isolate active combatants per campaign.
- **Supabase Cloud Sync & Realtime:** Replaced legacy WebRTC with Supabase PostgreSQL JSONB storage and low-latency (<30ms) Realtime WebSocket channels.

---

## [4.0.0] - 2026-06-15

### Added
- **Digital Character Creation Wizard:** 4-step wizard with 74-point buy attribute distribution, level progression loop, and feat prerequisite validation.
- **Wild Shape System:** One-click animal transformations (Wolf, Leopard, Bear) with dynamic attribute overrides and natural attacks management.
- **Tactical Belt & Magic Item Slots:** Dedicated slots for quick-use potions, scrolls, wands, and magic items with daily charge tracking.

---

## [3.5.0] - 2026-04-10

### Added
- **D&D 3.5e RAW Rules Engines:** Complete integration of BAB sequences, Two-Weapon Fighting penalties, Power Attack slider, and modifier stacking.
- **Animal Companion & Familiar Sheets:** Embedded sub-sheets with stats linked directly to class levels.
- **Ancient Parchment UI Aesthetics:** Custom theme tokens, Diablo-style HP health globe, and responsive mobile/tablet layout.

---

## [1.0.0 - 3.0.0] - Legacy Milestones
*For detailed commit-level history of legacy versions v1.0 through v3.0, refer to [`docs/archive/legacy_patchnotes.md`](file:///c:/Users/styles/PRIVATE/TheCombatant/TheCombatant/docs/archive/legacy_patchnotes.md).*
