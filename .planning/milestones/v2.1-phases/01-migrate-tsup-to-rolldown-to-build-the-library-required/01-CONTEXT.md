# Phase 1: Migrate tsup to rolldown to build the library - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace tsup with rolldown as the build tool for the counter-analytics-vue library. The library must continue to produce the same output formats (CJS, ESM, DTS) with identical file names and paths. No changes to the public API or package.json exports map.

</domain>

<decisions>
## Implementation Decisions

### DTS generation
- **D-01:** Use `rolldown-plugin-dts` to generate `.d.ts` type declarations as part of the rolldown build step. No separate `tsc --emitDeclarationOnly` invocation needed.

### Config format
- **D-02:** Create a `rolldown.config.ts` configuration file. Move build configuration out of inline CLI flags in package.json scripts into the dedicated config file.

### Output parity
- **D-03:** Output files must match current tsup output exactly:
  - `dist/index.js` (ESM)
  - `dist/index.cjs` (CJS)
  - `dist/index.d.ts` (types)
- **D-04:** No changes to `package.json` exports map — the existing `exports`, `main`, `module`, and `types` fields remain as-is.

### Claude's Discretion
- Vue externalization strategy (how to mark `vue` as external in rolldown config)
- Clean output directory handling (equivalent to tsup's `--clean`)
- Any additional rolldown plugins needed for the build

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Current build setup
- `package.json` — Current tsup build script (`"build": "tsup src/index.ts --dts --format cjs,esm --clean"`), output paths in exports/main/module/types fields
- `tsconfig.json` — TypeScript compiler options (ESNext target, strict, DOM lib)

### Source files
- `src/index.ts` — Library entry point (Vue plugin + useCounterAnalytics composable)
- `src/types.ts` — CounterAnalyticsPluginOptions interface

### External documentation
- [Rolldown documentation](https://rolldown.rs/) — Rolldown config API, plugin system, output format options

No project-internal specs or ADRs exist — requirements are fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No build-related utilities to reuse — tsup was used via CLI flags only with no config file

### Established Patterns
- ESM-first with CJS compatibility (`"type": "module"` in package.json)
- Single entry point (`src/index.ts`) — simple build graph
- `vue` as peerDependency — must be externalized in rolldown config

### Integration Points
- `package.json` `scripts.build` — must be updated to invoke rolldown instead of tsup
- `package.json` `scripts.dev` — uses `--watch` flag, needs rolldown equivalent
- `package.json` `scripts.build:example` — chains the build, will work if `pnpm run build` still succeeds
- `devDependencies` — remove `tsup`, add `rolldown` and `rolldown-plugin-dts`

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The migration is straightforward: replace the build tool while keeping output identical.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-migrate-tsup-to-rolldown-to-build-the-library-required*
*Context gathered: 2026-03-28*
