# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v2.1 — Library Modernization

**Shipped:** 2026-03-28
**Phases:** 1 | **Plans:** 1 | **Sessions:** ~3

### What Was Built
- Replaced tsup with rolldown 1.0.0-rc.12 as the library build tool
- Dual ESM + CJS output with TypeScript declarations via rolldown-plugin-dts
- Array config pattern in rolldown.config.ts for multi-format builds

### What Worked
- Single-phase focused migration kept scope tight and execution fast (~5 min for core tasks)
- Array config pattern cleanly solved the dts plugin CJS incompatibility
- Atomic task commits made the work traceable and reversible

### What Was Inefficient
- The `rolldown-plugin-dts` CJS incompatibility wasn't known upfront — caused a deviation fix during execution
- Mixed exports warning only caught during UAT, not during initial build verification

### Patterns Established
- `defineConfig([...])` array export: one config per format, dts() on ESM-only entry
- `[name].js` entryFileNames template for correct dts naming
- `exports: 'named'` on CJS output to suppress mixed exports warning

### Key Lessons
1. rolldown-plugin-dts does not support CJS format — always separate ESM and CJS into distinct config objects
2. Hardcoded entryFileNames cause naming conflicts with dts plugin — use template patterns instead
3. UAT catches warnings that automated verification misses — run the actual build command, not just check outputs

### Cost Observations
- Model mix: research via opus, execution via sonnet
- Sessions: ~3 (discuss → plan/execute → verify/complete)
- Notable: Small single-phase migration completed efficiently in one day

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v2.1 | ~3 | 1 | Initial GSD workflow adoption for build tool migration |

### Cumulative Quality

| Milestone | UAT Tests | Passed | Issues |
|-----------|-----------|--------|--------|
| v2.1 | 5 | 5 | 0 |

### Top Lessons (Verified Across Milestones)

1. Build tool plugin compatibility should be researched before planning — assumptions about plugin support cause deviations
