---
phase: 01-migrate-tsup-to-rolldown-to-build-the-library-required
verified: 2026-03-28T00:00:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
---

# Phase 01: Migrate tsup to rolldown Verification Report

**Phase Goal:** Replace tsup with rolldown as the build tool for the library, maintaining current output format and capabilities.
**Verified:** 2026-03-28
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth                                                                          | Status     | Evidence                                             |
|----|--------------------------------------------------------------------------------|------------|------------------------------------------------------|
| 1  | `rolldown.config.ts` exists with ESM+CJS dual output and `dts()` plugin        | VERIFIED   | File exists; array config with dts() on ESM entry    |
| 2  | `package.json` `scripts.build` invokes `rolldown -c`                           | VERIFIED   | `"build": "rolldown -c"` confirmed in package.json   |
| 3  | `package.json` `scripts.dev` invokes `rolldown -c --watch`                     | VERIFIED   | `"dev": "rolldown -c --watch && ..."` confirmed      |
| 4  | `tsup` removed from `devDependencies`                                          | VERIFIED   | No `tsup` string in package.json                     |
| 5  | `rolldown` and `rolldown-plugin-dts` in `devDependencies`                      | VERIFIED   | Both present at `1.0.0-rc.12` and `^0.23.1`         |
| 6  | `pnpm run build` exits 0 and produces all three dist files                     | VERIFIED   | Build exited 0 in 1.09s; all three files present     |
| 7  | `dist/index.js` contains ESM `export {` syntax                                 | VERIFIED   | File ends with `export { plugin as default, useCounterAnalytics };` |
| 8  | `dist/index.cjs` contains CJS syntax                                           | VERIFIED   | Uses `Object.defineProperties(exports, ...)` and `exports.useCounterAnalytics` |
| 9  | `dist/index.d.ts` contains `CounterAnalyticsPluginOptions` and `useCounterAnalytics` | VERIFIED | Both identifiers present in declarations file   |
| 10 | `package.json` exports/main/module/types fields unchanged                      | VERIFIED   | All four fields match expected values                |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact               | Expected                                  | Status     | Details                                                                 |
|------------------------|-------------------------------------------|------------|-------------------------------------------------------------------------|
| `rolldown.config.ts`   | Array config with ESM+dts and CJS entries | VERIFIED   | `defineConfig([...])` with two entries; `dts()` on ESM-only entry       |
| `package.json`         | Updated scripts, correct devDeps          | VERIFIED   | `rolldown -c` build/dev scripts; no tsup; rolldown + rolldown-plugin-dts |
| `dist/index.js`        | ESM bundle                                | VERIFIED   | 18 lines; `export { plugin as default, useCounterAnalytics };`           |
| `dist/index.cjs`       | CJS bundle                                | VERIFIED   | 23 lines; `exports.useCounterAnalytics = useCounterAnalytics;`           |
| `dist/index.d.ts`      | TypeScript declarations                   | VERIFIED   | Exports `CounterAnalyticsPluginOptions`, `useCounterAnalytics`, `plugin` |

### Key Link Verification

| From                 | To                          | Via                    | Status   | Details                                                              |
|----------------------|-----------------------------|------------------------|----------|----------------------------------------------------------------------|
| `rolldown.config.ts` | `dist/index.js`             | `format: 'es'` output  | WIRED    | Build produced dist/index.js; file contains ESM export syntax         |
| `rolldown.config.ts` | `dist/index.cjs`            | `format: 'cjs'` output | WIRED    | Build produced dist/index.cjs; file uses exports.* pattern            |
| `rolldown.config.ts` | `dist/index.d.ts`           | `dts()` plugin         | WIRED    | Plugin on ESM entry produced declarations file with all exports       |
| `package.json`       | `rolldown.config.ts`        | `rolldown -c` scripts  | WIRED    | `-c` flag causes rolldown to read rolldown.config.ts                  |
| `src/index.ts`       | `dist/*` (externalized vue) | `external: ['vue']`    | WIRED    | Neither dist/index.js nor dist/index.cjs import or require 'vue'      |

### Data-Flow Trace (Level 4)

Not applicable — this phase produces build tooling configuration and dist artifacts, not dynamic data-rendering components.

### Behavioral Spot-Checks

| Behavior                                | Command                                                                                      | Result        | Status |
|-----------------------------------------|----------------------------------------------------------------------------------------------|---------------|--------|
| Build exits 0                           | `pnpm run build`                                                                             | Exit 0        | PASS   |
| ESM module exports `useCounterAnalytics` as function | `node -e "import('./dist/index.js').then(m => console.log(typeof m.useCounterAnalytics))"` | `function`    | PASS   |
| CJS module exports `useCounterAnalytics` as function | `node -e "const m = require('./dist/index.cjs'); console.log(typeof m.useCounterAnalytics)"` | `function`  | PASS   |

### Requirements Coverage

No REQUIREMENTS.md exists for this project. Phase-level must-haves from `01-01-PLAN.md` served as the requirement contract. All 10 must-haves verified (see Observable Truths table above).

### Anti-Patterns Found

No blockers or anti-patterns detected in phase-modified files.

| File                | Line | Pattern   | Severity | Impact |
|---------------------|------|-----------|----------|--------|
| No issues found     | —    | —         | —        | —      |

Additional notes:

- Build emits a `[MIXED_EXPORTS]` warning: the entry module uses both named and default exports together. This is a pre-existing design of the library (it exports both the `plugin` default and the `useCounterAnalytics` named export) and does not affect consumers. Consumers using `require('./dist/index.cjs').useCounterAnalytics` get the function correctly.
- `dist/index.js` contains `document.createElement` — this is the plugin's own runtime logic (injecting the counter.dev script tag), not vue being accidentally bundled. Vue does not appear anywhere in either dist file, confirming correct externalization.

### Deviations from Plan (Documented, Non-Blocking)

The plan originally specified a single rolldown config object with both ESM and CJS outputs in an array and `plugins: [dts()]` at top level. Execution discovered that `rolldown-plugin-dts` throws when it encounters `format: 'cjs'`. The fix was:

1. **Array config pattern** — two separate config objects: one ESM+dts, one CJS-only.
2. **`entryFileNames: '[name].js'`** instead of hardcoded `'index.js'` on the ESM entry — required for `dts()` to name the declarations file `index.d.ts` (hardcoding caused `index2.d.ts`).

Both deviations are documented in `01-01-SUMMARY.md` and committed in `7ee4079`. The output is functionally identical to what the plan specified. All must-haves that describe observable outcomes (output file names, formats, content) are satisfied.

### Human Verification Required

None — all must-haves are verifiable programmatically and all passed.

### Gaps Summary

No gaps. All 10 must-haves are satisfied. The phase goal is fully achieved: tsup has been replaced by rolldown, the build produces identical output files (`dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`), the public API is unchanged, and both ESM and CJS modules load correctly in Node.js.

---

_Verified: 2026-03-28_
_Verifier: Claude (gsd-verifier)_
