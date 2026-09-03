# Changelog

All notable changes to **The Combatant** are documented in this file.
The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [6.2.2] - 2026-09-03

### Fixed
- **D&D 3.5e RAW Ability Modifier Calculation (`Combatant.getAttributeMod`):** Fixed attribute modifier calculation for scores 1–9 by replacing the flawed ternary lookup table with the universal mathematical rule `Math.floor((score - 10) / 2)` (RAW PHB p.8), correctly resolving scores 3–5 to `-4` and `-3` instead of off-by-one errors. Added full regression test suite in `Tests/attribute_modifiers_raw.test.js`.
- **Error Boundary Auth Persistence (`ErrorBoundary.tsx`):** Fixed crash recovery reset to selectively remove only application state keys (`dd_combatsheet_state`, `dd_active_character_id`, `dd_active_campaign_id`) instead of executing `localStorage.clear()`, preserving user authentication sessions in Supabase.
- **Resilient Spell Database Loading (`spells.js`):** Upgraded `loadSpells()` to use `Promise.allSettled()`, ensuring supplemental book network/CDN dropouts do not block core PHB/PHB2 spell databases from loading.
- **Printable Folio Spell Effect Summaries (`PrintPage4SpellsCompanion.tsx`):** Added `formatSpellSummary()` to parse long spell descriptions into concise, 1-line Effect Summaries (max ~85 characters with word-boundary ellipsis and tooltip), preventing table row bloat and preserving the strict 296mm A4 print layout.
- **Root Application Type Safety (`App.tsx` & `combat.ts`):** Removed `as any` cast on `useCombatState()`, strictly typed `SessionInfo.role` to encompass all valid role states (`host`, `dm`, `player`, `client`, `choice`, `wizard`), and typed root content as `React.ReactNode`.
- **Bilingual Stacking & Spell Slot Dialogs (`BuffRules.js`):** Standardized all remaining alert, confirm, and prompt dialogs in `activateBuffByKey()` to English D&D 3.5e RAW terms (`Spell Slot Expended`, `Stacking Conflict`, `Buff Overridden`, `Caster Level`, `No Available Spell Slots`, `Cast Spell?`).
- **Standardized Duration Parsing (`BuffRules.js`):** Enhanced `calculateDurationRounds()` with comprehensive regular expression recognition supporting all standard D&D 3.5e SRD duration increments (`round/level`, `10 min./level`, `min./level`, `rounds`, `minutes`).
- **CQS Clarification & Default Character Name (`state-core.js`):** Documented the bootstrap side-effect of `getActivePC()` via JSDoc `@sideEffects` and updated the default fallback character moniker to `'Adventurer'`.

---

## [6.2.1] - 2026-09-02

### Fixed
- **Typography & Accessibility (`Roboto`):** Preserved accessible sans-serif `Roboto` as the primary body font while eliminating rendering artifacts, blurry edges, and kerning jitter through `-webkit-font-smoothing: antialiased`, `-moz-osx-font-smoothing: grayscale`, and `text-rendering: optimizeLegibility`.
- **Overlay & Popup Scaling Architecture:** Restored unified overlay transform scaling rule in `css/popups.css` across all dialogs (`#featScrollOverlay`, `#spellScrollOverlay`, etc.) while removing duplicate inline scale in `DialogOverlay.tsx`, preventing both miniature unscaled popups and 2.56x double-scaled alerts.
- **Feats Typography & Accessibility:** Increased feat card titles and benefits from 8.5px/9px to 10.5px for comfortable readability and tablet-first touch inspection.
- **Creation Wizard Ergonomics:** Capped desktop creation wizard scale to 1.2 to preserve balanced proportions on high-resolution screens.

---

## [6.2.0] - 2026-09-02

### Added
- **Printable Character Sheet Folio (A4 / PDF Export):** Authentic D&D 3.5e 4-page character folio accessible via System Options (`PrintableCharacterSheetModal.tsx`).
  - **Page 1 (Core Combat & Defenses):** Character header, HP/Wounds, Base Stats & Modifiers, Armor Class breakdown, Saving Throws with conditional modifiers, Initiative, BAB, Weapons & Strike card attacks matrix.
  - **Page 2 (Skills & Class Features):** Full 45-skill matrix with cross-class markers and synergy notes, learned feats compendium, and special abilities/ACFs.
  - **Page 3 (Equipment & Armory):** Equipped armor/shields with ACP/check penalties, magic item & belt slots, ammunition, money purse, and carrying capacity/encumbrance tracking.
  - **Page 4 (Spells & Companion / Familiar):** Prepared/spontaneous spell slots per day with bonus slots & save DCs, active buff list, and dedicated companion sub-sheet.
  - **Print Layout Engine:** Pixel-perfect CSS page budget (`296mm` height, zero margin `@page`, `@media print` isolation) eliminating blank pages and browser header/footer clipping.
- **ACF Conflict Resolution & Swapping:** Enhanced ACF selection in Wizard and Level-Up with mutual exclusion detection and one-click swapping when replacing the same base class feature.
- **Automated Printable & ACF Tests:** Added Vitest integration tests in `src/__tests__/PrintableCharacterSheet.test.tsx` and `src/__tests__/ACFRestrictions.test.tsx`.

---

## [6.1.0] - 2026-09-02

### Added
- **Guided Level-Up Assistant (`LevelUpDialog`):** Interactive step-by-step advancement for existing characters directly on the Player Sheet.
  - Reuses existing Wizard sub-components for Skills (`SkillsTabContent`), Skill Tricks (`SkillTricksTabContent`), Feats (`FeatsTabContent`), and ACFs (`ACFsTabContent`).
  - Automatic milestone detection: +1 Ability score increase (levels 4, 8, 12, 16, 20), general feats (levels 3, 6, 9, 12, 15, 18), and class bonus feats.
  - HP gain calculator (+ CON modifier) and transactional state persistence via `CombatState.updatePCBatch()`.
  - Prominent `+ Level Up` triggers in [`PCHeaderInfo.tsx`](file:///c:/Users/styles/PRIVATE/TheCombatant/TheCombatant/src/components/player/header/PCHeaderInfo.tsx) and [`PCClassesManager.tsx`](file:///c:/Users/styles/PRIVATE/TheCombatant/TheCombatant/src/components/player/attributes/PCClassesManager.tsx).
- **Automated Level-Up Tests:** Added 4 Vitest unit and integration test cases in `src/__tests__/LevelUp.test.tsx`.

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
*Detailed commit-level history and legacy release tags for versions v1.0 through v3.0 are maintained in the Git repository history.*
