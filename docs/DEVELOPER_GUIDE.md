# Developer Guide & Coding Standards

> **The Combatant (v6.0.0)** — D&D 3.5e Digital Combat Companion & Character Management System  
> Fast onboarding, development workflows, quality gates, and architectural constraints.

---

## 1. Quickstart & Setup

### Prerequisites
- **Node.js:** v20.x or v22.x+
- **Package Manager:** npm v10+

### Local Installation
```powershell
# 1. Clone repository
git clone https://github.com/SplattedRabbit/TheCombatant.git
cd TheCombatant

# 2. Install dependencies
npm ci

# 3. Start local development server
npm run dev
```

### Environment Variables
Copy `.env.example` to `.env` (optional for local guest mode):
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```
*Note: The app runs 100% offline in LocalStorage mode if no Supabase environment variables are provided.*

---

## 2. Essential Commands & Workflows

| Action | Command (PowerShell) | Description |
|---|---|---|
| **Dev Server** | `npm run dev` | Starts Vite dev server with hot module reloading (HMR) |
| **Typecheck** | `npm run typecheck` | Validates TypeScript types (`tsc --noEmit`) |
| **Core Tests** | `npm run test` | Executes all 314 core Node test runner suites |
| **Single Test** | `node --import ./Tests/setup.js --test Tests/<file>.test.js` | Fast execution for a single test file during feature work |
| **UI Tests** | `npm run test:ui` | Runs all 34 Vitest + React Testing Library component tests |
| **All Tests** | `npm run test:all` | Executes both Core Node tests and Vitest UI tests (348 total) |
| **Production Build** | `npm run build` | Compiles Vite production bundle and updates Service Worker cache |

> [!IMPORTANT]
> **PowerShell Syntax on Windows:** Always chain shell commands with `;` instead of `&&`.

---

## 3. Strict Architectural Constraints

All contributors and AI coding agents must adhere to these 6 core quality constraints:

1. **Component Line-Count Budget (`<= 450 lines`):**
   - No `.tsx` or `.ts` file in `src/components/` may exceed 450 lines of code.
   - If a component grows large, extract domain sub-components into dedicated subfolders (e.g. `src/components/player/attributes/`, `src/components/dm/table/`).

2. **Zero `@ts-ignore` Policy:**
   - 0 `@ts-ignore` or `@ts-nocheck` directives are permitted across `src/` and `js/`.
   - All state mutations, rules engines, and data registries must be typed via `src/types/combat.ts` or `src/types/core-modules.d.ts`.

3. **Zero Runtime Latency:**
   - No `React.lazy()` / `<Suspense>` spinners during tabletop usage.
   - All UI components are statically chunked via `manualChunks` in [`vite.config.ts`](file:///c:/Users/styles/PRIVATE/TheCombatant/TheCombatant/vite.config.ts).

4. **Production Gated Logging:**
   - Never use ungated `console.log()` in `src/`.
   - Use `logger.debug()` or `logger.info()` from [`src/utils/logger.ts`](file:///c:/Users/styles/PRIVATE/TheCombatant/TheCombatant/src/utils/logger.ts), which are automatically stripped in production builds.

5. **Strict XSS Protection:**
   - Any usage of `dangerouslySetInnerHTML` must be sanitized with DOMPurify via `sanitizeHtml()` from [`src/utils/sanitize.ts`](file:///c:/Users/styles/PRIVATE/TheCombatant/TheCombatant/src/utils/sanitize.ts).

6. **Unidirectional State Flow:**
   - `UI` → `State Facades` → `Models` ← `Rules Engines`
   - UI components never mutate models directly; all mutations go through `CombatState.*` methods or `useCombatState()` hooks.

---

## 4. Token-Optimized Agent Workflows

When working with AI coding assistants (Antigravity, Claude, Gemini), follow these practices to minimize context bloat:

- **Search Rules instead of loading full text files:**
  ```powershell
  # Search D&D rulebook without loading 2.2MB txt
  node scratch/search_rules.js "<query>"

  # Search spells without loading 600KB json
  node scratch/search_spells.js "<spell_name>"
  ```
- **Slice reading:** Always specify `StartLine` and `EndLine` when viewing files.
- **Run minimal reporter tests during development:**
  ```powershell
  node --import ./Tests/setup.js --test --test-reporter=dot Tests/<file>.test.js
  ```
