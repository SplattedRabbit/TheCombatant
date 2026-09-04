# Changelog

All notable changes to **The Combatant** are documented in this file.
The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [6.4.1] - 2026-09-05

### Added
- **Core, CAd, CS & PHB II Feats Catalog Expansion:**
  - Integrated over 100 missing feats across Combat, General, and Magic categories from Player's Handbook, Player's Handbook II, Complete Adventurer, and Complete Scoundrel (luck feats excluded).
- **Class Feature Feats & Slot Mechanics:**
  - Automated `(Fixed)` slots in Character Creation Wizard and Level-Up Assistant for mandatory class-granted feats (Shadowbane Inquisitor 3, Ranger 1/3, Monk 1, Wizard 1, Duskblade 2, Knight 2, Dragon Shaman 2).
  - Automated `(Class Choice)` slots for restricted selections (Ranger Combat Styles, Monk Bonus Feats).
  - Added visual `🛡️ Class Feature` badge in the feat selection compendium.
- **Skill Point Tracking & UI Guidance:**
  - Added amber/gold visual highlight (`borderLeft: 3.5px solid #b8860b`) for skills with ranks from previous levels in the creation wizard and level-up dialog.
  - Universal `spent` points tracking (`pc.skills[id].spent`) across character sheet, wizard, and level-up adapter, preserving cross-class cost investments (2 pts/rank).

### Fixed
- **Prestige Class Base Skill Lookup:** Added all prestige classes to `CLASS_BASE_SKILLS` in `RulesData.js` and added dynamic fallback to `CLASSES_LIST.find()?.skillBase`.
- **Prerequisite Validation Hardening (`feats-data.js`):** Support for both `name`/`value` and `skill`/`ranks` formats, preventing `undefined.split()` TypeError. Added dynamic parsing for `special` requirements (`sneak attack +Xd6`, `turn undead`, `bardic music`, `evasion`, etc.).

## [6.4.0] - 2026-09-03

### Added
- **D&D 3.5e Core Deities Registry (`js/data/deities-data.js`):**
  - Integrated all 19 Core Greyhawk deities (Pelor, Kord, Moradin, Heironeous, St. Cuthbert, Wee Jas, Boccob, Fharlanghn, Obad-Hai, Olidammara, Ehlonna, Hextor, Nerull, Vecna, Erythnul, Gruumsh, Corellon Larethian, Garl Glittergold, Yondalla) plus abstract philosophical worship (`"none"`).
  - Configured each deity with alignment, domain portfolios, favored weapons, titles, and descriptions.
  - Implemented `isAlignmentWithinOneStep` adhering strictly to D&D 3.5e RAW Manhattan distance on the 3x3 alignment grid.
- **D&D 3.5e Core Cleric Domains Engine (`js/data/domains-data.js`):**
  - Integrated all 22 Core PHB Domains: *Air, Animal, Chaos, Death, Destruction, Earth, Evil, Fire, Good, Healing, Knowledge, Law, Luck, Magic, Plant, Protection, Strength, Sun, Travel, Trickery, War, Water*.
  - Full domain definitions with granted powers descriptions and complete spell progressions (Levels 1–9).
  - 100% audit of all 198 domain spells: imported 44 missing Core spells into `spells-phb.json` with SRD metadata, casting profiles, and class spell lists.
- **Cleric Spell Preparation & Domain Slots Engine (`RulesSpells.js`, `SpellSlotCalculator.js`, `SpellPreparation.js`):**
  - Added `+1` Domain Slot per spell level (1st–9th) for Clerics when base slots > 0.
  - Domain spell eligibility: Clerics can learn and cast domain spells that originate from outside the Cleric spell list (e.g. *Fly* from Travel, *Barkskin* from Plant).
  - Non-cleric domain spells are strictly designated for domain slots.
  - Tracked `isDomain: boolean` on prepared spells and enforced 1-domain-spell-per-level cap.
- **Rich User Interface Enhancements:**
  - `ClericFeaturesCard.tsx`: Dedicated interactive deity selector with alignment compatibility advice, domain 1 & 2 selectors, granted powers, and 1-9 domain spell lists.
  - `PrepareSpellDialog.tsx`: Contextual domain slot detection with a dedicated "Prepare in Domain Slot ([Domain] [Lvl])" checkbox and real-time availability feedback.
  - `PCSpellPreparation.tsx`: Visual domain slot display (`☀️ [D]` badge, crimson parchment accents, cast/unprepare actions).
  - `PCSpellCompendium.tsx`: Domain badges on spells with green highlight if accessible through the character's chosen domains.
  - `SpellDetailsDialog.tsx`: Added `Domains:` row in metadata grid with direct indication of cleric domain availability.
  - `PCHeaderInfo.tsx` & Print Sheets (`PrintPage1CoreCombat.tsx`, `PrintPage4SpellsCompanion.tsx`): Displays deity and chosen domains in header and formats domain-prepared spells with `[D]` prefix on exported print sheets.
- **Automated Test Suite Expansion (`Tests/cleric_domains.test.js`):**
  - Added 5 comprehensive automated tests verifying the One-Step alignment rule, domain database integrity (all 198 spells exist), cleric slot calculations, Travel domain cross-class access, and domain preparation tracking. All 330 test suites are passing.

## [6.3.1] - 2026-09-03

### Fixed
- **Spell Eligibility & Learning Validation Engine (`RulesSpells.js`):**
  - Implemented `validateSpellLearnEligibility` to guard spell learning in all dialogs and compendiums against class mismatch, caster level caps, and prohibited schools.
  - Hardened `isSpellEligibleForPC`: removed permissive fallback for missing `classLevels` and enforced strict spellcasting class check (non-casters cannot learn spells; Paladin/Ranger unlocked at CL 4+).
  - Added `getSpellClassLevels` helper with seamless fallback to `classes` and `level`.
  - Refactored `checkSpellKnownLimit` with `countLearnedSpellsForClass` helper to eliminate duplication.
- **Spell Data Normalization Across All Books:**
  - Added missing `classLevels` arrays for all spells in `spells-phb2.json` (*Arcane Turmoil*, *Dimension Hop*, *Chimeric Curve*, *Evard's Menacing Tentacles*, *Ray of Deanimation*, *Seeking Ray*), `spells-ca.json` (*Baleful Transposition*, *Arrow Mind*, *Aura of Evasion*, *Blindsight*, *Sniper's Eye*), `spells-phb.json` (Alignment Domain spells), and `spells-cs.json`.
- **UI Guardrails & Reactive Guidance (`PCSpellCompendium.tsx` & `SpellDetailsDialog.tsx`):**
  - Fixed filter checkbox *"Only show spells matching my class & level"* to strictly exclude foreign class spells.
  - Visually dimmed ineligible spells in browsing mode and hooked `[+ Book]` to informative explanation dialogs.
  - Updated `SpellDetailsDialog` footer to render class-ineligibility reasons and prevent invalid additions.
- **Test Suite Expansion:**
  - Added `Tests/spell_eligibility_validation.test.js` (5 test suites verifying cross-class restrictions, non-caster blocking, and auditing all 461 spells for valid `classLevels`). Total test suite now stands at 325 passing tests.

## [6.3.0] - 2026-09-03

### Added
- **Complete Spellbook Overhaul (PHB, PHB II, Complete Adventurer):**
  - **461 Total Spells:** Fully cataloged, validated, and tested across all four spellbooks (`spells-phb.json`, `spells-phb2.json`, `spells-ca.json`, `spells-cs.json`).
  - **Missing PHB Spells Restored:** Added *Cure Minor Wounds*, *Inflict Minor Wounds*, *Read Magic*, *Daze*, *Know Direction*, and *Comprehend Languages* with full SRD rules text and casting profiles.
  - **Player's Handbook II Expansion:** Integrated complete catalog including *Alter Fortune*, *Celerity* series (*Lesser*, *Standard*, *Greater*), *Deflect* series, *Heart of X* series (*Air*, *Water*, *Earth*, *Fire*), *Kelgore's* series (*Fire Bolt*, *Grave Mist*), *Chain Missile*, *Energy Aegis*, *Stay the Hand*, *Hesitate*, *Chasing Perfection*, *Vertigo Field*, *Legion of Sentinels*, *Sure Strike*, *Blade Brothers*.
  - **Complete Adventurer Expansion:** Integrated complete catalog including *Iron Silence*, *Wraithstrike*, *Sniper's Shot*, *Guided Shot*, *Critical Strike*, *Bladeweave*, *Sonic Weapon*, *Arrow Mind*, *Wild Instincts*, *Tactical Teleportation*.
  - **Complete Descriptions:** Added missing SRD rules descriptions for 10 previously empty PHB spells (*Analyze Dweomer*, *Animate Dead*, *Antilife Shell*, *Bless Weapon*, *Disrupting Weapon*, *Helping Hand*, *Holy Smite*, *Refuge*, *Repulsion*, *Wall of Force*).
  - **Automated Spellbook Test Suite:** Added `Tests/spellbooks_audit.test.js` validating structural integrity, school metadata, level assignments, and description completeness.
- **Complete Adventurer Feats Catalog:**
  - Added ~60 Complete Adventurer feats across Combat, General, and Magic domains.

### Fixed
- **Spell & Feat Parchment Popups Visual Harmonization (`SpellDetailsDialog.tsx` & `SpellScrollDialog.tsx`):**
  - Redesigned the spell details dialog to match the Ancient Parchment design of `FeatScrollDialog.tsx` (`#f4e8c1` parchment background, `#8b1a1a` red borders, gold dashed inner frame, 540px width, 54vh scrollable height).
  - Enhanced metadata grid (School, Level, Casting Time, Components, Range, Duration, Saving Throw, Spell Resistance, Target/Area/Effect, Classes).
  - Unified action buttons (`[Learn]`, `[Unlearn]`, `[Close]`) with backdrop click-to-close behavior.
- **D&D 3.5e RAW General Feat Slot Progression Formula (`RulesFeats.js` & `PCFeatsTab.tsx`):**
  - Fixed mathematical progression formula from `1 + Math.floor((level - 1) / 3)` to RAW `1 + Math.floor(level / 3) + (isHuman ? 1 : 0)`.
  - Characters at level 6 now correctly receive 3 general feat slots (levels 1, 3, 6).
- **Prerequisite Evaluation Engine & Human-Readable Labels (`RulesFeats.js` & `feats-data.js`):**
  - Replaced technical selector IDs with clean human-readable dictionaries (`SKILL_NAMES_MAP`, `CLASS_NAMES_MAP`).
  - Added full evaluation for custom class features: *Trapfinding*, *Favored Enemy*, *Smite Evil*, *Evasion*, *Rage*, *Ki Strike*, *Turn Undead*, *Bardic Music*, *Wild Shape*, *Spontaneous Arcane Spells*, *Familiar*.
- **Feat Management & Reactivity (`FeatScrollActions.tsx`, `useCombatState.ts`, `PCFeatsSpells.js`):**
  - Decoupled Learn/Unlearn action branches so learned feats always provide `[Unlearn Feat]` and stackable feats offer both `[Unlearn]` and `[Learn Another]`.
  - Fixed in-place array mutation in `addPCFeat`/`removePCFeat` to trigger immediate React re-renders in `PCFeatsTab`.
- **Malformed PHB Spell Keys:**
  - Renamed 6 OCR/parser-corrupted keys: `enchantment_compulsion_` $\rightarrow$ `aid`, `enchantment_compulsion_mind_` $\rightarrow$ `animal_messenger`, `enchantment_compulsion_fear_mind_` $\rightarrow$ `bane`, `enchantment_compulsion_language_` $\rightarrow$ `command`, `illusion_phantasm_mind_affecting_` $\rightarrow$ `nightmare`, `enchantment_compulsion_death_` $\rightarrow$ `power_word_kill`.
  - Cleaned swallowed tail header text from 300+ spell descriptions.

### Fixed
- **Character Creation Wizard Multiclass Feat Resolution (`FeatSlotsSidebar.tsx` & `Step3LevelConfig.tsx`):** Fixed multiclass character creation soft-lock where class-granted bonus feats (such as *Scribe Scroll* for Wizard 1) were unpopulated in draft state, rendered as unclickable `— Select —`, and blocked level progression. Added automatic `defaultFeat` population, visual `✓ Fixed` indicators, and step validation bypass.
- **Anima-Construct Race Selection (`PCClassesManager.tsx` & `PCHeaderInfo.tsx`):** Restored the *Anima-Construct* (Living Construct) race option in the Player Sheet race dropdown selector and character header display.
- **Character Creation Wizard Save Finalization (`wizardSaveHelper.ts` & `helpers.ts`):** Fixed runtime `TypeError` on clicking `✦ Create & Save` by harmonizing `allSkills` and `allSkillTricks` return signatures in `getCompletedDraftPCState` and adding defensive iterable fallbacks.

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
