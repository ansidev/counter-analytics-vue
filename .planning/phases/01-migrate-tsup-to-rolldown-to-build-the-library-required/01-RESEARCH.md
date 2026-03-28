# Phase 01: Migrate tsup to rolldown to build the library - Research

**Researched:** 2026-03-28
**Domain:** JavaScript/TypeScript build tooling — rolldown bundler migration
**Confidence:** HIGH

## Summary

This phase replaces tsup (an esbuild-based bundler wrapper) with rolldown (a Rust-based bundler) as the build tool for the `counter-analytics-vue` library. The migration is straightforward: the library has a single entry point (`src/index.ts`), one peerDependency to externalize (`vue`), and three required output files (`dist/index.js` ESM, `dist/index.cjs` CJS, `dist/index.d.ts` types). No public API changes are involved.

rolldown v1.0.0-rc.12 is the latest release (published 2026-03-25). It supports Rollup-compatible plugin APIs and can be driven by a TypeScript config file (`rolldown.config.ts`). The `rolldown-plugin-dts` v0.23.1 (published 2026-03-27) handles TypeScript declaration generation as part of the rolldown build — replacing the `--dts` flag that tsup provided. The DTS plugin generates `.d.ts` files in the same build pass as ESM output; for CJS it would require a separate build, but this project's exports map does not reference `.d.cts`, so a single ESM+CJS build with DTS applied only to the ESM output is sufficient.

**Primary recommendation:** Create a `rolldown.config.ts` that defines two outputs (ESM + CJS) with `external: ['vue']` and the `dts()` plugin attached to the ESM output. Replace the `build` and `dev` scripts in `package.json` to invoke `rolldown -c` and `rolldown -c --watch` respectively.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01 — DTS generation:** Use `rolldown-plugin-dts` to generate `.d.ts` type declarations as part of the rolldown build step. No separate `tsc --emitDeclarationOnly` invocation needed.

**D-02 — Config format:** Create a `rolldown.config.ts` configuration file. Move build configuration out of inline CLI flags in `package.json` scripts into the dedicated config file.

**D-03 — Output parity:** Output files must match current tsup output exactly:
- `dist/index.js` (ESM)
- `dist/index.cjs` (CJS)
- `dist/index.d.ts` (types)

**D-04 — No exports map changes:** No changes to `package.json` exports map — the existing `exports`, `main`, `module`, and `types` fields remain as-is.

### Claude's Discretion

- Vue externalization strategy (how to mark `vue` as external in rolldown config)
- Clean output directory handling (equivalent to tsup's `--clean`)
- Any additional rolldown plugins needed for the build

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| rolldown | 1.0.0-rc.12 | Rust-based bundler producing ESM and CJS output | The migration target; Rollup-compatible plugin API |
| rolldown-plugin-dts | 0.23.1 | Generates `.d.ts` declaration files in the rolldown build | Official plugin replacing tsup's `--dts` flag; same-build DTS for ESM |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| typescript | ^5.7.3 (already installed) | Required by rolldown-plugin-dts for tsc-based declaration emit | Always needed; already a devDependency |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| rolldown-plugin-dts | separate `tsc --emitDeclarationOnly` step | Locked out by D-01 |
| rolldown-plugin-dts | vite-plugin-dts | vite-plugin-dts targets Vite builds, not standalone rolldown |

**Installation:**
```bash
pnpm add -D rolldown rolldown-plugin-dts
pnpm remove tsup
```

**Version verification (confirmed 2026-03-28):**
- `rolldown`: 1.0.0-rc.12 (published 2026-03-25)
- `rolldown-plugin-dts`: 0.23.1 (published 2026-03-27)
- `rolldown-plugin-dts` requires `rolldown >= 1.0.0-rc.12`

## Architecture Patterns

### Recommended Project Structure

```
counter-analytics-vue/
├── rolldown.config.ts   # NEW — replaces inline CLI flags in package.json
├── src/
│   ├── index.ts         # Entry point (unchanged)
│   └── types.ts         # Types (unchanged)
└── dist/                # Build output (unchanged paths)
    ├── index.js         # ESM bundle
    ├── index.cjs        # CJS bundle
    └── index.d.ts       # TypeScript declarations
```

### Pattern 1: Two-output rolldown config with DTS on ESM only

**What:** Define a single `rolldown.config.ts` exporting an array of two output configs. The DTS plugin runs once at the input level generating `index.d.ts` alongside the ESM output. The CJS output shares the same build but emits only the `.cjs` bundle.

**When to use:** When the exports map uses a single `"types"` condition (not separate `types` per `require`/`import`), meaning `.d.cts` is not needed.

**Example:**
```typescript
// Source: https://rolldown.rs/guide/getting-started
// Source: https://github.com/sxzz/rolldown-plugin-dts README
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

**Key notes:**
- `format: 'es'` is the correct value for ESM (not `'esm'`) — confirmed from `BindingOutputOptions` type: `'es' | 'cjs' | 'iife' | 'umd'`
- `cleanDir: true` belongs only on the **first output** in the array. If placed on both, the second output cleans the directory after the first output has written files.
- The `dts()` plugin is added at the **input level** (plugins array on the config object, not inside an output), which generates `.d.ts` alongside the ESM output.
- `external: ['vue']` prevents vue from being bundled (equivalent to tsup's implicit peer dependency externalization).

### Pattern 2: package.json script update

**What:** Replace the tsup CLI invocations with rolldown CLI calls.

```json
{
  "scripts": {
    "build": "rolldown -c",
    "dev": "rolldown -c --watch",
    "build:example": "pnpm run build && pnpm --filter example-counter-analytics-vue-vite run build"
  }
}
```

**Note:** The current `dev` script is `pnpm run build -- --watch`. With tsup, `--watch` was passed through. With rolldown, `--watch` (or `-w`) is a first-class CLI flag: `rolldown -c --watch`.

**Note:** `build:example` chains `pnpm run build` first, so it requires no changes as long as `pnpm run build` succeeds.

### Pattern 3: cleanDir behavior with multiple outputs

**What:** `cleanDir` is an `OutputOptions` property (per-output), not a top-level input option. When multiple outputs share the same `dir`, only set `cleanDir: true` on the first output in the array.

**Why:** If `cleanDir: true` is on both outputs targeting `dist/`, the second output will delete `dist/index.js` and `dist/index.d.ts` written by the first output before writing `dist/index.cjs`.

**Safe approach:**
```typescript
output: [
  { dir: 'dist', format: 'es', entryFileNames: 'index.js', cleanDir: true },  // cleans dist/ first
  { dir: 'dist', format: 'cjs', entryFileNames: 'index.cjs' },                // no cleanDir
]
```

### Anti-Patterns to Avoid

- **Using `format: 'esm'`:** rolldown's type is `'es' | 'cjs' | 'iife' | 'umd'`. The value `'esm'` is NOT valid for the config (though the CLI docs show `-f esm` — the CLI may normalize it, but in config use `'es'`).
- **Placing `dts()` plugin inside output config:** The `dts()` plugin belongs in the top-level `plugins` array, not inside an `output` entry. rolldown plugins are input-level by design.
- **Using `cleanDir: true` on all outputs:** Causes the second output to wipe files written by the first.
- **Keeping tsup in devDependencies:** Remove it once rolldown is confirmed working. Having both installed wastes space.
- **Generating `.d.cts` unnecessarily:** The current `package.json` exports map has a single `"types"` condition pointing to `index.d.ts`. There is no `"types"` field inside the `"require"` condition, so `.d.cts` is not referenced and does not need to be generated. (tsup generates it anyway; rolldown with dts plugin does not generate it for CJS by default — this is the correct behavior for this project.)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TypeScript declaration emit | Custom `tsc --emitDeclarationOnly` script | `rolldown-plugin-dts` | Handles declaration bundling, re-exports, and path resolution automatically |
| Vue externalization | Manual regex/transform to strip `vue` imports | `external: ['vue']` in config | One config line handles all import/require forms |
| Output directory cleaning | Custom `rm -rf dist` pre-build script | `cleanDir: true` on first output | Built into rolldown output options |

**Key insight:** tsup handled all these concerns via CLI flags; rolldown exposes the same capabilities through config options. The migration is mostly mechanical flag-to-config translation.

## Common Pitfalls

### Pitfall 1: Wrong ESM format string

**What goes wrong:** Setting `format: 'esm'` in rolldown config causes a runtime error or silent fallback because the valid value is `'es'`.

**Why it happens:** tsup and many bundlers use `'esm'` as the string. rolldown (like Rollup) uses `'es'`.

**How to avoid:** Always use `format: 'es'` in `rolldown.config.ts`. The CLI `-f esm` flag may normalize it, but programmatic config must use `'es'`.

**Warning signs:** Build runs but output file is in wrong format, or rolldown throws a validation error.

### Pitfall 2: cleanDir deletes first output's files

**What goes wrong:** Both ESM and CJS outputs have `cleanDir: true`. The CJS output cleans `dist/` before writing, deleting `dist/index.js` and `dist/index.d.ts` from the ESM output.

**Why it happens:** `cleanDir` is per-output. When two outputs share a directory and both have `cleanDir: true`, the second cleans what the first wrote.

**How to avoid:** Only set `cleanDir: true` on the first output in the array.

**Warning signs:** `dist/` only contains `index.cjs` after build; `index.js` and `index.d.ts` are missing.

### Pitfall 3: dts plugin generates output for CJS format

**What goes wrong:** If the config has both ESM and CJS in the output array and the dts plugin runs for both, it may attempt to generate `.d.cts` for the CJS output, which is not referenced by the exports map.

**Why it happens:** The dts plugin runs at input level and knows about all outputs.

**How to avoid:** Per rolldown-plugin-dts README, `.d.ts` generation from a single build pass is limited to ESM format. For CJS declarations, a separate build with `emitDtsOnly: true` would be needed. Since this project does not need `.d.cts`, no second build is required. The plugin will correctly generate only `index.d.ts` alongside the ESM output.

**Warning signs:** Unexpected `.d.cts` files appearing in dist (benign but unnecessary).

### Pitfall 4: dev script passthrough syntax

**What goes wrong:** Keeping `pnpm run build -- --watch` thinking it passes `--watch` to rolldown. This syntax is pnpm argument passthrough but requires the underlying command to accept `--watch`. tsup accepted it; rolldown's watch flag may behave differently when passed this way.

**Why it happens:** Copy-paste from tsup script pattern.

**How to avoid:** Use `rolldown -c --watch` directly in the `dev` script. This is explicit and unambiguous.

### Pitfall 5: tsup not removed from devDependencies

**What goes wrong:** tsup remains in `devDependencies` after rolldown is added, wasting install time and potentially causing confusion.

**Why it happens:** Forgetting to clean up.

**How to avoid:** Include `pnpm remove tsup` as an explicit task step.

## Code Examples

Verified patterns from official sources:

### Complete rolldown.config.ts for this project

```typescript
// Source: https://rolldown.rs/guide/getting-started (config format, defineConfig, external)
// Source: https://github.com/sxzz/rolldown-plugin-dts README (dts plugin usage)
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

### Updated package.json scripts (diff)

```diff
-"build": "tsup src/index.ts --dts --format cjs,esm --clean",
-"dev": "pnpm run build -- --watch && pnpm --filter example-counter-analytics-vue-vite run dev",
+"build": "rolldown -c",
+"dev": "rolldown -c --watch && pnpm --filter example-counter-analytics-vue-vite run dev",
```

### Updated package.json devDependencies (diff)

```diff
-"tsup": "^8.3.5",
+"rolldown": "^1.0.0-rc.12",
+"rolldown-plugin-dts": "^0.23.1",
```

### rolldown-plugin-dts basic usage (from README)

```javascript
// Source: https://github.com/sxzz/rolldown-plugin-dts README
import { dts } from 'rolldown-plugin-dts'

export default {
  input: './src/index.ts',
  plugins: [dts()],
  output: [{ dir: 'dist', format: 'es' }],
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tsup CLI flags in package.json | rolldown.config.ts dedicated config file | This migration | Config is version-controlled, easier to extend |
| tsup (esbuild under the hood) | rolldown (Rust/oxc) | 2026 | Faster builds, Vite-aligned toolchain |
| `--dts` tsup flag | `rolldown-plugin-dts` | This migration | Same capability, Rollup plugin API |
| `--clean` tsup flag | `cleanDir: true` output option | This migration | Per-output granularity |
| `--format cjs,esm` tsup flag | array of output objects | This migration | Explicit per-format configuration |

**Deprecated/outdated:**
- `tsup`: Being replaced; not deprecated but no longer needed for this project
- `tsup --dts` flag: Replaced by `rolldown-plugin-dts`

## Open Questions

1. **Will rolldown-plugin-dts produce identical `.d.ts` content to tsup?**
   - What we know: tsup used `tsc` for declaration emit; rolldown-plugin-dts also uses tsc by default (unless `isolatedDeclarations` is enabled). Both read `tsconfig.json`.
   - What's unclear: Minor differences in module resolution or re-export handling are possible.
   - Recommendation: Compare `dist/index.d.ts` before and after migration as a verification step. The content should be functionally identical.

2. **Does rolldown normalize `format: 'esm'` to `'es'` silently?**
   - What we know: The binding type definition shows `'es' | 'cjs' | 'iife' | 'umd'`. The CLI docs mention `-f esm`.
   - What's unclear: Whether the config parser aliases `'esm'` to `'es'`.
   - Recommendation: Use `'es'` in config to be safe. If rolldown does normalize, it's harmless; if it doesn't, `'esm'` would error.

3. **Does `index.d.cts` need to be preserved?**
   - What we know: The current tsup build outputs `dist/index.d.cts` but the `package.json` exports map does not reference it (no `"types"` condition inside `"require"`).
   - What's unclear: Whether any downstream tooling relies on the auto-discovery of `.d.cts` adjacent to `.cjs`.
   - Recommendation: Do not generate `.d.cts`. The exports map is authoritative. TypeScript resolves types via the `"types"` condition in exports which points to `index.d.ts`. If this causes issues post-migration, add a second build pass with `emitDtsOnly: true`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | rolldown (build runtime) | ✓ | (system) | — |
| pnpm | package management | ✓ | 10.32.1 | — |
| rolldown | build | ✗ (not yet installed) | — | install via `pnpm add -D rolldown` |
| rolldown-plugin-dts | DTS generation | ✗ (not yet installed) | — | install via `pnpm add -D rolldown-plugin-dts` |
| tsup | current build | ✓ | 8.4.0 | removed after rolldown confirmed working |
| typescript | declaration emit | ✓ | 5.7.x (devDep) | — |

**Missing dependencies with no fallback:**
- rolldown and rolldown-plugin-dts must be installed as part of this migration.

**Missing dependencies with fallback:**
- None.

## Validation Architecture

No test framework is configured in this project (no `vitest.config.*`, `jest.config.*`, test directories, or test scripts in `package.json`). The build migration has no unit-testable logic — it is entirely a configuration change. Validation is functional: run the build, verify output files exist and match expected paths and formats.

### Phase Validation Approach (manual/smoke)

| Check | Command | Expected Result |
|-------|---------|----------------|
| Build succeeds | `pnpm run build` | Exit 0, no errors |
| ESM output exists | `ls dist/index.js` | File present |
| CJS output exists | `ls dist/index.cjs` | File present |
| DTS output exists | `ls dist/index.d.ts` | File present |
| ESM format check | `head -5 dist/index.js` | Contains `export {` |
| CJS format check | `head -5 dist/index.cjs` | Contains `"use strict"` |
| DTS content check | `diff <(old index.d.ts) dist/index.d.ts` | No functional differences |
| Example builds | `pnpm run build:example` | Exit 0 |

> Nyquist validation is not applicable: no automated test framework exists in this project.

## Sources

### Primary (HIGH confidence)
- https://rolldown.rs/guide/getting-started — Config format, defineConfig, multiple outputs, external, watch CLI flag
- https://rolldown.rs/apis/cli — CLI flags: -c, -w/--watch, --clean-dir, -f/--format
- `raw.githubusercontent.com/rolldown/rolldown/.../binding.d.cts` — `BindingOutputOptions` type: `format: 'es' | 'cjs' | 'iife' | 'umd'`, `cleanDir?: boolean`, `entryFileNames?: string`
- https://github.com/sxzz/rolldown-plugin-dts README — Installation, basic usage, ESM vs CJS limitation, emitDtsOnly
- `npm view rolldown version` — confirmed 1.0.0-rc.12, published 2026-03-25
- `npm view rolldown-plugin-dts version` — confirmed 0.23.1, published 2026-03-27

### Secondary (MEDIUM confidence)
- rolldown-plugin-dts own `rolldown.config.ts` — Shows 3-config pattern (ESM+dts, CJS, emitDtsOnly for CJS types); confirms plugin placement at input level

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm registry version confirmed, rolldown-plugin-dts requires rolldown >=1.0.0-rc.12 (both current versions satisfy)
- Architecture: HIGH — config format confirmed from official docs, format values confirmed from TypeScript bindings
- Pitfalls: HIGH — format value pitfall confirmed from type definitions, cleanDir behavior confirmed from BindingOutputOptions (per-output, not global), dts CJS limitation confirmed from README

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (rolldown is RC stage — check for rc.13+ before implementing)
