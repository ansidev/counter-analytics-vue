# PLAN-01: Replace tsup with rolldown build toolchain

## Frontmatter

```yaml
plan: 01
phase: 01-migrate-tsup-to-rolldown-to-build-the-library-required
title: Replace tsup with rolldown build toolchain
status: draft
waves: 3
depends_on: []
files_modified:
  - rolldown.config.ts (NEW)
  - package.json
  - pnpm-lock.yaml
autonomous: true
```

## Goal

Replace tsup with rolldown as the build tool for counter-analytics-vue, producing identical output files (`dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`) with no changes to the public API or package.json exports map.

## must_haves

- [ ] `rolldown.config.ts` exists at project root with ESM+CJS dual output and `dts()` plugin
- [ ] `package.json` `scripts.build` invokes `rolldown -c` (not tsup)
- [ ] `package.json` `scripts.dev` invokes `rolldown -c --watch` (not tsup)
- [ ] `tsup` is removed from `devDependencies`
- [ ] `rolldown` and `rolldown-plugin-dts` are in `devDependencies`
- [ ] `pnpm run build` exits 0 and produces `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`
- [ ] `dist/index.js` contains ESM `export {` syntax
- [ ] `dist/index.cjs` contains CJS `"use strict"` or `module.exports`/`exports.` syntax
- [ ] `dist/index.d.ts` contains `CounterAnalyticsPluginOptions` and `useCounterAnalytics` exports
- [ ] `package.json` exports/main/module/types fields are unchanged

---

## Wave 1 — Install dependencies and create rolldown config

> Wave 1 tasks have no inter-dependencies and can execute in parallel.

<task id="01-01-01">
<title>Install rolldown and rolldown-plugin-dts, remove tsup</title>
<wave>1</wave>
<depends_on></depends_on>
<files_modified>package.json, pnpm-lock.yaml</files_modified>
<read_first>
- package.json (current devDependencies: tsup ^8.3.5, typescript ^5.7.3)
</read_first>
<action>
Run the following commands in sequence:

1. `pnpm add -D rolldown rolldown-plugin-dts` — installs rolldown (^1.0.0-rc.12) and rolldown-plugin-dts (^0.23.1) as devDependencies
2. `pnpm remove tsup` — removes tsup from devDependencies

After both commands, `package.json` devDependencies should contain:
- `"rolldown": "^1.0.0-rc.12"` (or the version resolved by pnpm)
- `"rolldown-plugin-dts": "^0.23.1"` (or the version resolved by pnpm)
- NO `"tsup"` entry

Do NOT modify any other fields in package.json during this task (scripts, exports, etc. are handled in later tasks).
</action>
<acceptance_criteria>
- `package.json` contains `"rolldown"` in devDependencies
- `package.json` contains `"rolldown-plugin-dts"` in devDependencies
- `package.json` does NOT contain `"tsup"` in devDependencies
- `pnpm ls rolldown` exits 0 and shows rolldown version
- `pnpm ls rolldown-plugin-dts` exits 0 and shows rolldown-plugin-dts version
- `pnpm ls tsup` exits non-zero or shows empty (tsup is gone)
</acceptance_criteria>
<verification>
```bash
grep -q '"rolldown"' package.json && echo "PASS: rolldown in package.json" || echo "FAIL"
grep -q '"rolldown-plugin-dts"' package.json && echo "PASS: rolldown-plugin-dts in package.json" || echo "FAIL"
grep -q '"tsup"' package.json && echo "FAIL: tsup still in package.json" || echo "PASS: tsup removed"
```
</verification>
</task>

<task id="01-01-02">
<title>Create rolldown.config.ts with ESM+CJS dual output and dts plugin</title>
<wave>1</wave>
<depends_on></depends_on>
<files_modified>rolldown.config.ts (NEW)</files_modified>
<read_first>
- package.json (exports map: types=./dist/index.d.ts, require=./dist/index.cjs, import=./dist/index.js)
- src/index.ts (entry point, imports from 'vue')
- tsconfig.json (ESNext target, strict, DOM lib)
</read_first>
<action>
Create a new file `rolldown.config.ts` at project root with the following exact content:

```typescript
import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

export default defineConfig({
  input: 'src/index.ts',
  external: ['vue'],
  plugins: [dts()],
  output: [
    {
      dir: 'dist',
      format: 'es',
      entryFileNames: 'index.js',
      cleanDir: true,
    },
    {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: 'index.cjs',
    },
  ],
})
```

Key design decisions in this config:
- `input: 'src/index.ts'` — single entry point matching current tsup invocation
- `external: ['vue']` — vue is a peerDependency, must not be bundled
- `plugins: [dts()]` — generates dist/index.d.ts alongside ESM output (decision D-01)
- `format: 'es'` — NOT 'esm'; rolldown uses 'es' like Rollup
- `format: 'cjs'` — CommonJS output for require() consumers
- `entryFileNames` — exact filenames to match current output paths (decision D-03)
- `cleanDir: true` — ONLY on first output to avoid second output deleting first output's files
- No `cleanDir` on CJS output — prevents deletion of index.js and index.d.ts written by ESM output
</action>
<acceptance_criteria>
- File `rolldown.config.ts` exists at project root
- File contains `import { defineConfig } from 'rolldown'`
- File contains `import { dts } from 'rolldown-plugin-dts'`
- File contains `input: 'src/index.ts'`
- File contains `external: ['vue']`
- File contains `plugins: [dts()]`
- File contains `format: 'es'` (NOT 'esm')
- File contains `format: 'cjs'`
- File contains `entryFileNames: 'index.js'`
- File contains `entryFileNames: 'index.cjs'`
- File contains `cleanDir: true` exactly once
- File contains `dir: 'dist'`
</acceptance_criteria>
<verification>
```bash
test -f rolldown.config.ts && echo "PASS: file exists" || echo "FAIL"
grep -q "import { defineConfig } from 'rolldown'" rolldown.config.ts && echo "PASS" || echo "FAIL"
grep -q "import { dts } from 'rolldown-plugin-dts'" rolldown.config.ts && echo "PASS" || echo "FAIL"
grep -q "external: \['vue'\]" rolldown.config.ts && echo "PASS" || echo "FAIL"
grep -c "cleanDir: true" rolldown.config.ts | grep -q "^1$" && echo "PASS: cleanDir once" || echo "FAIL"
grep -q "format: 'es'" rolldown.config.ts && echo "PASS" || echo "FAIL"
grep -q "format: 'cjs'" rolldown.config.ts && echo "PASS" || echo "FAIL"
```
</verification>
</task>

---

## Wave 2 — Update package.json scripts

> Wave 2 depends on Wave 1 (rolldown must be installed and config must exist).

<task id="01-02-01">
<title>Update build and dev scripts in package.json to use rolldown</title>
<wave>2</wave>
<depends_on>01-01-01, 01-01-02</depends_on>
<files_modified>package.json</files_modified>
<read_first>
- package.json (current scripts: "build": "tsup src/index.ts --dts --format cjs,esm --clean", "dev": "pnpm run build -- --watch && pnpm --filter example-counter-analytics-vue-vite run dev")
- rolldown.config.ts (the config file created in 01-01-02)
</read_first>
<action>
Update TWO script entries in `package.json`:

1. Change `"build"` from:
   ```
   "build": "tsup src/index.ts --dts --format cjs,esm --clean"
   ```
   to:
   ```
   "build": "rolldown -c"
   ```

2. Change `"dev"` from:
   ```
   "dev": "pnpm run build -- --watch && pnpm --filter example-counter-analytics-vue-vite run dev"
   ```
   to:
   ```
   "dev": "rolldown -c --watch && pnpm --filter example-counter-analytics-vue-vite run dev"
   ```

Do NOT change any other scripts or any other fields in package.json. Specifically:
- `"build:example"` stays as `"pnpm run build && pnpm --filter example-counter-analytics-vue-vite run build"` (unchanged — it chains `pnpm run build` which will now invoke rolldown)
- `"preview"` stays unchanged
- `"prepare"`, `"lint"`, `"lint:fix"` stay unchanged
- `exports`, `main`, `module`, `types` fields all stay unchanged (decision D-04)
</action>
<acceptance_criteria>
- `package.json` contains `"build": "rolldown -c"`
- `package.json` contains `"dev": "rolldown -c --watch && pnpm --filter example-counter-analytics-vue-vite run dev"`
- `package.json` does NOT contain the string `tsup` anywhere (not in scripts, not in devDependencies)
- `package.json` contains `"build:example": "pnpm run build && pnpm --filter example-counter-analytics-vue-vite run build"` (unchanged)
- `package.json` `exports` field still contains `"types": "./dist/index.d.ts"`, `"require": "./dist/index.cjs"`, `"import": "./dist/index.js"`
- `package.json` `main` is still `"./dist/index.cjs"`
- `package.json` `module` is still `"./dist/index.js"`
- `package.json` `types` is still `"./dist/index.d.ts"`
</acceptance_criteria>
<verification>
```bash
grep -q '"build": "rolldown -c"' package.json && echo "PASS: build script" || echo "FAIL"
grep -q '"dev": "rolldown -c --watch' package.json && echo "PASS: dev script" || echo "FAIL"
grep -q 'tsup' package.json && echo "FAIL: tsup still referenced" || echo "PASS: no tsup references"
grep -q '"main": "./dist/index.cjs"' package.json && echo "PASS: main unchanged" || echo "FAIL"
grep -q '"module": "./dist/index.js"' package.json && echo "PASS: module unchanged" || echo "FAIL"
grep -q '"types": "./dist/index.d.ts"' package.json && echo "PASS: types unchanged" || echo "FAIL"
```
</verification>
</task>

---

## Wave 3 — Build verification

> Wave 3 depends on Wave 2. This wave verifies the entire migration by running the build and checking all outputs.

<task id="01-03-01">
<title>Run build and verify output file existence, formats, and type declarations</title>
<wave>3</wave>
<depends_on>01-02-01</depends_on>
<files_modified></files_modified>
<read_first>
- rolldown.config.ts (verify config is correct before running)
- package.json (verify build script is "rolldown -c")
</read_first>
<action>
Run the build and perform all verification checks:

1. Run `pnpm run build` — must exit 0 with no errors

2. Verify output files exist:
   - `dist/index.js` must exist (ESM bundle)
   - `dist/index.cjs` must exist (CJS bundle)
   - `dist/index.d.ts` must exist (TypeScript declarations)

3. Verify ESM format — `dist/index.js` must contain `export` keyword (ESM export syntax like `export {` or `export default`)

4. Verify CJS format — `dist/index.cjs` must contain CommonJS markers (one or more of: `"use strict"`, `module.exports`, `exports.`, `require(`)

5. Verify DTS content — `dist/index.d.ts` must contain:
   - `CounterAnalyticsPluginOptions` (the options interface)
   - `useCounterAnalytics` (the composable function)

6. Verify vue is externalized — `dist/index.js` must NOT contain the string `document.createElement` from vue's source code bundled in. It should reference `vue` as an external import (e.g., `from 'vue'` or `require('vue')`), OR since this library only uses vue types (Plugin, App), the runtime output may not reference vue at all — both are acceptable.

7. If any check fails, diagnose and fix. Common issues:
   - If `dist/index.d.ts` is missing: check that `dts()` plugin is in the top-level `plugins` array (not inside an output)
   - If `dist/index.js` is missing but `dist/index.cjs` exists: check that `cleanDir: true` is only on the first output
   - If format is wrong: verify `format: 'es'` (not 'esm') and `format: 'cjs'`
</action>
<acceptance_criteria>
- `pnpm run build` exits with code 0
- `dist/index.js` exists and contains the string `export`
- `dist/index.cjs` exists and contains the string `useCounterAnalytics`
- `dist/index.d.ts` exists and contains the string `CounterAnalyticsPluginOptions`
- `dist/index.d.ts` contains the string `useCounterAnalytics`
- `node -e "require('./dist/index.cjs')"` exits 0 (CJS is loadable — note: will fail in JSDOM-less env due to document.createElement, so use `node -e "const m = require('./dist/index.cjs'); console.log(typeof m.useCounterAnalytics)"` which should print `function`)
- `node -e "import('./dist/index.js').then(m => console.log(typeof m.useCounterAnalytics))"` prints `function` (ESM is loadable)
</acceptance_criteria>
<verification>
```bash
pnpm run build && echo "PASS: build succeeded" || echo "FAIL: build failed"
test -f dist/index.js && echo "PASS: ESM exists" || echo "FAIL"
test -f dist/index.cjs && echo "PASS: CJS exists" || echo "FAIL"
test -f dist/index.d.ts && echo "PASS: DTS exists" || echo "FAIL"
grep -q "export" dist/index.js && echo "PASS: ESM format" || echo "FAIL"
grep -q "useCounterAnalytics" dist/index.cjs && echo "PASS: CJS content" || echo "FAIL"
grep -q "CounterAnalyticsPluginOptions" dist/index.d.ts && echo "PASS: DTS has options type" || echo "FAIL"
grep -q "useCounterAnalytics" dist/index.d.ts && echo "PASS: DTS has composable" || echo "FAIL"
```
</verification>
</task>

---

## Verification Summary

| Check | Command | Expected |
|-------|---------|----------|
| Build exits 0 | `pnpm run build` | Exit 0 |
| ESM output exists | `test -f dist/index.js` | File present |
| CJS output exists | `test -f dist/index.cjs` | File present |
| DTS output exists | `test -f dist/index.d.ts` | File present |
| ESM has export syntax | `grep "export" dist/index.js` | Match found |
| CJS has content | `grep "useCounterAnalytics" dist/index.cjs` | Match found |
| DTS has types | `grep "CounterAnalyticsPluginOptions" dist/index.d.ts` | Match found |
| No tsup references | `grep "tsup" package.json` | No match |
| Exports map unchanged | `grep '"./dist/index.d.ts"' package.json` | Match found |

## Risk Assessment

**Low risk migration.** The library has:
- Single entry point (`src/index.ts`)
- 2 source files, ~25 lines of code
- 1 external dependency (`vue`) to externalize
- No complex build transforms, plugins, or custom loaders
- No test suite that could break (validation is functional only)

The only real risk is rolldown-plugin-dts producing slightly different `.d.ts` content than tsup's built-in DTS generation. Both use `tsc` under the hood with the same `tsconfig.json`, so output should be functionally identical even if formatting differs slightly.
