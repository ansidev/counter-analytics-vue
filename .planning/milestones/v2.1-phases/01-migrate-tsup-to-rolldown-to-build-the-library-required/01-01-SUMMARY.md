---
phase: 01-migrate-tsup-to-rolldown-to-build-the-library-required
plan: "01"
subsystem: infra
tags: [rolldown, tsup, typescript, dts, esm, cjs, build-tool]

# Dependency graph
requires: []
provides:
  - rolldown build toolchain replacing tsup
  - dual ESM+CJS output (dist/index.js, dist/index.cjs)
  - TypeScript declarations (dist/index.d.ts)
  - rolldown.config.ts with array config pattern for multi-format builds
affects: [future build changes, CI/CD, library consumers]

# Tech tracking
tech-stack:
  added: [rolldown@1.0.0-rc.12, rolldown-plugin-dts@0.23.1]
  patterns:
    - Array config export in rolldown.config.ts to separate build passes by format
    - dts() plugin on ESM-only config pass (plugin does not support CJS format)
    - [name].js template entryFileNames to allow dts() to produce index.d.ts

key-files:
  created: [rolldown.config.ts]
  modified: [package.json, pnpm-lock.yaml]

key-decisions:
  - "Used array config export ([esm+dts, cjs]) because rolldown-plugin-dts throws when format is CJS"
  - "Used [name].js entryFileNames template (not hardcoded index.js) to allow dts() plugin to produce index.d.ts"
  - "ESM and CJS are separate rolldown config objects sharing the same input and external settings"
  - "cleanDir: true on ESM output only to clean dist before first build pass"

patterns-established:
  - "rolldown array config: one entry per format, dts() plugin on ESM-only entry"

requirements-completed: []

# Metrics
duration: 5min
completed: 2026-03-28
---

# Phase 01 Plan 01: Replace tsup with rolldown build toolchain Summary

**tsup replaced by rolldown 1.0.0-rc.12 with array config pattern producing dist/index.js (ESM), dist/index.cjs (CJS), dist/index.d.ts via rolldown-plugin-dts**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-28T04:39:23Z
- **Completed:** 2026-03-28T04:44:11Z
- **Tasks:** 4 (3 planned + 1 deviation fix)
- **Files modified:** 3 (rolldown.config.ts, package.json, pnpm-lock.yaml)

## Accomplishments
- Installed rolldown 1.0.0-rc.12 and rolldown-plugin-dts 0.23.1, removed tsup
- Created rolldown.config.ts with working dual ESM+CJS+DTS output
- Updated package.json build and dev scripts to invoke rolldown
- Build verified: all three output files produced with correct formats and content

## Task Commits

Each task was committed atomically:

1. **Task 01-01-01: Install rolldown and rolldown-plugin-dts, remove tsup** - `8dfeb2a` (chore)
2. **Task 01-01-02: Create rolldown.config.ts with ESM+CJS dual output and dts plugin** - `a157abe` (feat)
3. **Task 01-02-01: Update build and dev scripts in package.json** - `e25f39d` (feat)
4. **Task 01-03-01 deviation fix: Fix rolldown.config.ts for correct DTS output** - `7ee4079` (fix)

## Files Created/Modified
- `rolldown.config.ts` - Rolldown build configuration with array of configs for ESM+DTS and CJS
- `package.json` - Updated build/dev scripts from tsup to rolldown, updated devDependencies
- `pnpm-lock.yaml` - Updated lockfile after dependency changes

## Decisions Made
- **Array config pattern:** Used `defineConfig([...])` array export because `rolldown-plugin-dts` throws an error when `format: 'cjs'` is detected. Separating ESM and CJS into distinct config objects solves this cleanly.
- **`[name].js` template:** The `entryFileNames: '[name].js'` template (not hardcoded `'index.js'`) is required for `dts()` plugin to rename the output to `index.d.ts`. When using a hardcoded filename, the plugin produces `index2.d.ts` (naming conflict with the virtual DTS bundle).
- **`cleanDir: true` on ESM only:** Prevents the CJS pass from deleting ESM and DTS outputs already written to `dist/`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] rolldown-plugin-dts throws on CJS format when placed in top-level plugins**
- **Found during:** Task 01-03-01 (Run build and verify output)
- **Issue:** The plan specified `plugins: [dts()]` at the top level of a single config with both ESM and CJS outputs. `rolldown-plugin-dts` explicitly throws: "Cannot bundle dts files with `cjs` format." when it processes the CJS output.
- **Fix:** Refactored `rolldown.config.ts` to use an array of three configs: (1) ESM-only with `dts()` plugin, (2) CJS-only without `dts()`. Also discovered `entryFileNames: '[name].js'` template is required for correct `.d.ts` naming.
- **Files modified:** `rolldown.config.ts`
- **Verification:** `pnpm run build` exits 0; all three output files present with correct content.
- **Committed in:** `7ee4079` (separate fix commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Fix was necessary for build to succeed at all. The array config pattern is consistent with rolldown-plugin-dts documentation's recommended approach for multi-format builds.

## Issues Encountered
- `rolldown-plugin-dts` cannot process CJS format — required array config pattern instead of single unified config
- `entryFileNames: 'index.js'` (hardcoded) produced `index2.d.ts` naming conflict — required `'[name].js'` template

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- rolldown build toolchain is fully operational
- All three distribution files produced correctly with expected content and formats
- `pnpm run build` exits 0 and CJS/ESM modules are loadable by Node.js
- No blockers for future phases

---
*Phase: 01-migrate-tsup-to-rolldown-to-build-the-library-required*
*Completed: 2026-03-28*

## Self-Check: PASSED

All files verified to exist:
- FOUND: rolldown.config.ts
- FOUND: dist/index.js
- FOUND: dist/index.cjs
- FOUND: dist/index.d.ts
- FOUND: 01-01-SUMMARY.md

All commits verified to exist:
- FOUND: 8dfeb2a (chore: install rolldown, remove tsup)
- FOUND: a157abe (feat: create rolldown.config.ts)
- FOUND: e25f39d (feat: update build/dev scripts)
- FOUND: 7ee4079 (fix: fix rolldown.config.ts for correct DTS output)
